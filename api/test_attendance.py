import os
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch
from fastapi.testclient import TestClient
from . import attendance
from .main import app

ROWS=[["شیت پذیرش"],["کد گروهی","نام","نام خانوادگی","نام حلقه","درصد حضور"],
      ["۲۷۱۲۷","علی","محمدی","سلمان","۰٪"],["009","حسن","کریمی","سلمان","۸۷٫۵٪"],
      ["10","رضا","","سلمان",""],["11","دیگر","","بدر","۹۰٪"]]


class AttendanceTest(TestCase):
    def test_matching(self):
        row=attendance.extract(ROWS,"27127")
        self.assertEqual(row["percent"],0)
        self.assertEqual(row["peers"],[{"name":"حسن کریمی","percent":87.5},{"name":"رضا","percent":None}])
        self.assertEqual(attendance.extract(ROWS,"9")["status"],"unknown_code")
        self.assertEqual(attendance.extract(ROWS+[ROWS[2]],"27127")["status"],"unknown_code")
        self.assertEqual(attendance.extract([["نام"]],"1")["status"],"missing_column")

    def test_each_login_refreshes_only_own_session(self):
        with TemporaryDirectory() as folder,patch.dict(os.environ,{"DATABASE_URL":"","SCHEMA_READY":"0","OK_SQLITE":folder+"/test.db","MEMBER_PASSWORD":"test-member","COOKIE_SECURE":"0"}),TestClient(app,headers={"X-Okhovat":"1"}) as c,patch.object(attendance,"read_rows",side_effect=[ROWS,OSError()]) as fetch:
            def login(password):
                return c.post("/api/login",json={"code":"27127","password":password}).status_code
            self.assertEqual(login("wrong"),401)
            fetch.assert_not_called()
            self.assertEqual(login("test-member"),200)
            self.assertEqual(c.get("/api/session").json()["attendance"]["percent"],0)
            self.assertNotIn("بدر",c.get("/api/session").text)
            self.assertEqual(login("test-member"),200)
            self.assertEqual(c.get("/api/session").json()["attendance"],{"status":"unavailable"})
            self.assertEqual(fetch.call_count,2)
            c.post("/api/logout")
            self.assertEqual(c.get("/api/session").json(),{"user":None})
