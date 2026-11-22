from datetime import datetime
from zoneinfo import ZoneInfo

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from core.models import PersonalGrowthRecord, Ring


@override_settings(ROOT_URLCONF="django_assistant.urls", ASSISTANT_OLLAMA_MODEL="")
class GrowthChatTests(TestCase):
    def setUp(self):
        ring = Ring.objects.create(name="الف")
        self.member = get_user_model().objects.create_user("100", ring=ring)
        self.peer = get_user_model().objects.create_user("101", ring=ring)
        outsider = get_user_model().objects.create_user("102")
        today = datetime.now(ZoneInfo("Asia/Tehran")).date()
        for member, pages in [(self.member, 0), (self.peer, 5), (outsider, 100)]:
            PersonalGrowthRecord.objects.create(user=member, day=today, reading_pages=pages)

    def query(self, scope):
        return self.client.post("/chat/", {"message": "آمار امروز", "user_id": self.peer.pk,
            "plan": {"kind": "stats", "period": "today", "scope": scope}}, content_type="application/json")

    def test_scope_comes_from_session(self):
        self.assertEqual(self.query("ring").status_code, 403)
        self.client.force_login(self.member)
        for scope, expected in [("self", (1, 0)), ("peers", (1, 5)), ("ring", (2, 5))]:
            with self.subTest(scope=scope):
                row = self.query(scope).json()["results"][0]
                self.assertEqual((row["reports"], row["reading"]), expected)
        self.member.ring = None
        self.member.save()
        self.assertTrue(self.query("peers").json()["no_ring"])
