import os
from concurrent.futures import ThreadPoolExecutor
from tempfile import TemporaryDirectory
from threading import Event
from unittest import TestCase
from unittest.mock import patch
from fastapi.testclient import TestClient
from . import cache, guard, main


class MemoryRedis:
    def __init__(self):
        self.contents={}
        self.expiries=[]
    def get(self,key):return self.contents.get(key)
    def set(self,key,value,ex):
        self.expiries.append(ex)
        self.contents[key]=value


class Hardening(TestCase):
    def setUp(self):
        sheet=patch("api.attendance.lookup",return_value={"status":"unavailable"});sheet.start();self.addCleanup(sheet.stop)
        tmp=TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        env=patch.dict(os.environ,{"OK_SQLITE":tmp.name+"/test.db","DATABASE_URL":"","MEMBER_PASSWORD":"member-check","COACH_PASSWORD":"coach-check","REDIS_URL":"redis://test","SCHEMA_READY":"0","COOKIE_SECURE":"0"})
        env.start();self.addCleanup(env.stop)
        self.redis=MemoryRedis()
        backend=patch.object(cache,"_client",self.redis)
        backend.start();self.addCleanup(backend.stop)
        breaker=patch.object(cache,"_retry_at",0.0)
        breaker.start();self.addCleanup(breaker.stop)
        limiter=patch.object(guard,"limits",guard.WindowLimits())
        limiter.start();self.addCleanup(limiter.stop)
        self.c=TestClient(main.app,headers={"X-Okhovat":"1"})
        self.c.__enter__();self.addCleanup(self.c.__exit__,None,None,None)
        response=self.c.post("/api/login",json={"code":"27127","password":"member-check"})
        self.assertEqual(response.status_code,200)
        self.assertIn("Max-Age=604800",response.headers["set-cookie"])

    def test_cache_isolation_expiry_and_invalidation(self):
        first=self.c.get("/api/state")
        self.assertEqual(first.headers["cache-control"],"no-store")
        with patch.object(main,"build_state",side_effect=AssertionError("miss")):
            self.assertEqual(self.c.get("/api/state").json(),first.json())
        self.assertEqual(self.redis.expiries,[900])
        self.c.put("/api/profile/status",json={"sportPlan":"ویژه عضو","currentBook":"الف"})
        self.assertEqual(self.c.get("/api/state").json()["personalStatus"]["currentBook"],"الف")
        self.c.post("/api/login",json={"code":"90001","password":"coach-check"})
        self.assertNotIn("personalStatus",self.c.get("/api/state").json())
        keys=list(self.redis.contents)
        self.redis.contents[keys[-1]]=self.redis.contents[keys[-2]]
        self.assertNotIn("personalStatus",self.c.get("/api/state").json())
        self.c.post("/api/logout")
        self.assertEqual(self.c.get("/api/state").status_code,401)

    def test_cache_failure(self):
        with patch.object(self.redis,"get",side_effect=ConnectionError):
            self.assertEqual(self.c.get("/api/state").status_code,200)
            self.assertEqual(self.c.get("/api/session").json()["user"]["code"],"27127")
            self.assertGreater(cache._retry_at,0)

    def test_database_outage_and_recovery(self):
        import sqlite3
        with patch.object(main,"database",side_effect=sqlite3.OperationalError("test")):
            result=self.c.get("/api/state")
            self.assertEqual(result.status_code,503)
            self.assertIn("retry-after",result.headers)
        self.assertEqual(self.c.get("/api/state").status_code,200)

    def test_bounded_work(self):
        body={"skillTitle":"a"*100000}
        self.assertEqual(self.c.put("/api/growth",json=body).status_code,413)
        self.assertEqual(self.c.put("/api/growth",content=iter([b"x"*50000]*2)).status_code,413)
        self.assertEqual(self.c.post("/api/logout",headers={"Sec-Fetch-Site":"cross-site"}).status_code,403)
        for _ in range(12):
            response=self.c.post("/api/login",json={"code":"27127","password":"wrong"})
        self.assertEqual(response.status_code,429)
        self.assertIn("retry-after",response.headers)
        self.assertEqual(self.c.get("/api/health").status_code,200)

    def test_overlap_and_recovery(self):
        entered,release=Event(),Event()
        def work(u):
            entered.set()
            release.wait(3)
            return {"posts":[]}
        import threading
        with patch.object(main,"STATE_SLOTS",threading.BoundedSemaphore(1)),patch.object(main,"build_state",work):
            with ThreadPoolExecutor(1) as pool:
                job=pool.submit(self.c.get,"/api/state")
                self.assertTrue(entered.wait(2))
                try:
                    response=self.c.get("/api/state")
                    self.assertEqual(response.status_code,503)
                finally:
                    release.set()
                self.assertEqual(job.result().status_code,200)
        self.assertEqual(self.c.get("/api/health").status_code,200)
