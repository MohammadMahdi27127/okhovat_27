from datetime import date
from fastapi.testclient import TestClient
from . import test_hardening
from unittest import TestCase
from unittest.mock import patch
from . import main
from .accounts import create
from .grant_admin import grant

class Moderation(TestCase):
    setUp = test_hardening.Hardening.setUp

    def test_member_publication_and_admin_removal(self):
        create("80001","مدیر","member","admin-check")
        grant("80001")
        admin=TestClient(main.app,headers={"X-Okhovat":"1"})
        peer=TestClient(main.app,headers={"X-Okhovat":"1"})
        with patch.object(main.attendance,"lookup",return_value={"status":"unknown_code"}):
            admin.post("/api/login",json={"code":"80001","password":"admin-check"}).raise_for_status()
            registration={"code":"80002","name":"عضو دوم","password":"peer-check","ring":"سلمان"}
            self.assertEqual(self.c.post("/api/admin/members",json=registration).status_code,403)
            self.assertEqual(admin.post("/api/admin/members",json=registration).status_code,201)
            self.assertEqual(admin.post("/api/admin/members",json=registration).status_code,409)
            peer.post("/api/login",json={"code":"80002","password":"peer-check"}).raise_for_status()
        attachment=peer.post("/api/files/post",files={"file":("note.txt",b"hello")}).json()["url"]
        pid=peer.post("/api/posts",json={"title":"پست جدید","text":"متن عمومی","attachment":attachment}).json()["id"]
        def state(client):return client.get("/api/state").json()
        self.assertEqual(state(self.c)["posts"][0]["id"],pid)
        self.c.post(f"/api/posts/{pid}/comments",json={"text":"نظر"}).raise_for_status()
        self.c.put(f"/api/posts/{pid}/votes/recommend",json={"active":True}).raise_for_status()
        self.assertEqual(self.c.delete("/api/admin/posts/"+pid).status_code,403)
        for _ in range(2):admin.delete("/api/admin/posts/"+pid).raise_for_status()
        for c in (admin,self.c,peer):
            result=state(c)
            self.assertNotIn(pid,str(result["posts"])+str(result["comments"])+str(result["recommended"]))
            self.assertEqual(c.get(attachment).status_code,404)
        self.assertEqual(peer.post(f"/api/posts/{pid}/comments",json={"text":"نظر"}).status_code,404)
        growth={"publish":True,"day":date.today().isoformat(),"dateJalali":"1405-08-26","sport":2,"reading":32,"learned":"یادداشت خصوصی"}
        gid=peer.put("/api/growth",json=growth).json()["id"]
        self.assertEqual(state(self.c)["posts"][0]["id"],gid)
        self.assertNotIn("یادداشت خصوصی",str(state(self.c)))
        admin.delete("/api/admin/posts/"+gid).raise_for_status()
        peer.put("/api/growth",json={**growth,"reading":35}).raise_for_status()
        self.assertEqual(state(peer)["growth"][0]["reading"],35)
        self.assertEqual(state(self.c)["posts"],[])
