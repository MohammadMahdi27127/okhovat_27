"""Run python -m unittest api.test_integration with httpx installed."""
import os
from datetime import datetime
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch
from zoneinfo import ZoneInfo

from fastapi.testclient import TestClient
from .accounts import create
from .main import app

class ConnectedFlows(TestCase):
    def test_distinct_sessions_and_storage(self):
        with patch("api.attendance.lookup",return_value={"status":"unavailable"}), TemporaryDirectory() as tmp, patch.dict(os.environ, {"DATABASE_URL":"","OK_SQLITE":tmp+"/test.db","UPLOADS_DIR":tmp+"/media","MEMBER_PASSWORD":"member-test","COACH_PASSWORD":"coach-test","COOKIE_SECURE":"0"}):
            with TestClient(app) as lifecycle:
                member,coach,peer=[TestClient(app,headers={"X-Okhovat":"1"}) for _ in range(3)]
                create("27128","هم‌حلقه","member","peer-test","سلمان","آموزش")
                self.assertEqual(member.get("/api/state").status_code,401)
                self.assertEqual(member.post("/api/login",json={"code":"27127","password":"wrong"}).status_code,401)
                for client,code,password in [(member,"27127","member-test"),(coach,"90001","coach-test"),(peer,"27128","peer-test")]:
                    self.assertEqual(client.post("/api/login",json={"code":code,"password":password}).status_code,200)
                def state(c):return c.get("/api/state").json()
                day=datetime.now(ZoneInfo("Asia/Tehran")).date().isoformat()
                growth={"publish":True,"day":day,"dateJalali":"1405-08-26","sport":1,"reading":23,"learned":"private"}
                f=member.post("/api/files/proof",files={"file":("proof.txt",b"proof")}).json()
                growth["proof"]=f["url"]
                # Saving without explicit consent keeps the report private.
                private_growth={k:v for k,v in growth.items() if k!="publish"}
                self.assertEqual(member.put("/api/growth",json=private_growth).status_code,200)
                self.assertEqual(state(peer)["posts"],[])
                self.assertFalse(state(member)["growth"][0]["publish"])
                self.assertEqual(member.put("/api/growth",json=growth).status_code,200)
                self.assertEqual(member.put("/api/growth",json={**growth,"reading":25}).status_code,200)
                self.assertEqual(len(state(member)["posts"]),1)
                self.assertEqual(state(coach)["growth"][0]["reading"],25)
                self.assertEqual(state(peer)["growth"],[])
                self.assertNotIn("private",str(state(peer)["posts"]))
                growth_post=state(peer)["posts"][0]["id"]
                peer.put(f"/api/posts/{growth_post}/votes/like",json={"active":True}).raise_for_status()
                peer.post(f"/api/posts/{growth_post}/comments",json={"text":"آفرین"}).raise_for_status()
                self.assertEqual(member.put("/api/growth",json={**growth,"reading":25,"publish":False}).status_code,200)
                self.assertEqual(state(peer)["posts"],[])
                self.assertEqual(state(peer)["comments"],{})
                self.assertEqual(len(state(member)["growth"]),1)
                self.assertEqual(peer.post(f"/api/posts/{growth_post}/comments",json={"text":"دوباره"}).status_code,404)
                self.assertEqual(member.put("/api/growth",json={**growth,"reading":25}).status_code,200)
                self.assertEqual(member.put("/api/growth",json={**growth,"reading":25}).status_code,200)
                self.assertEqual(len(state(peer)["posts"]),1)
                self.assertEqual(coach.get(f["url"]).content,b"proof")
                self.assertEqual(peer.get(f["url"]).status_code,404)
                q={"message":"امروز چقدر مطالعه داشتیم؟","plan":{"kind":"stats","period":"today","scope":"peers"}}
                self.assertEqual(peer.post("/api/assistant/chat/",json=q).json()["results"][0]["reading"],25)
                post=coach.post("/api/posts",json={"title":"سلام","text":"خبر"}).json()["id"]
                self.assertTrue(state(member)["posts"][0]["coachPost"])
                self.assertEqual(member.put(f"/api/posts/{post}/votes/like",json={"active":True}).status_code,200)
                self.assertEqual(member.post(f"/api/posts/{post}/comments",json={"text":"دیدم"}).status_code,200)
                self.assertEqual(state(coach)["comments"][post][0]["text"],"دیدم")
                target={"scope":"person","target":"27127","text":"پیام خصوصی"}
                self.assertEqual(member.post("/api/messages",json=target).status_code,403)
                self.assertEqual(coach.post("/api/messages",json=target).status_code,200)
                self.assertEqual(len(state(member)["growthMessages"]),1)
                self.assertEqual(state(peer)["growthMessages"],[])
                self.assertEqual(member.post("/api/messages/read").status_code,200)
                self.assertEqual(len(state(member)["coachReadIds"]),1)
                grade={"target":"آموزش","score":8}
                self.assertEqual(member.put("/api/grades/group",json=grade).status_code,403)
                self.assertEqual(coach.put("/api/grades/group",json=grade).status_code,200)
                self.assertEqual(state(coach)["groupGrades"],{"آموزش":8})
                self.assertEqual(member.post("/api/logout").status_code,200)
                self.assertEqual(member.get("/api/state").status_code,401)
                for path in ("/","/growth/","/coach/","/chat/","/connected.js"):
                    self.assertEqual(lifecycle.get(path).status_code,200,path)
