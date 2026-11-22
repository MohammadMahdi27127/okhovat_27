"""Run on the shared server at 22:00 Asia/Tehran (retry during the same evening).

Required database adapter views: reminder_members(user_id, chat_id, needs_growth,
is_coach), reminder_growth(user_id, local_day), reminder_visits(user_id, local_day).
local_day is Gregorian YYYY-MM-DD in the configured time zone. The visits view
must include authenticated activity in restored sessions as well as fresh logins.
"""
import json
import os
import sqlite3
import sys
from datetime import datetime
from urllib import request
from zoneinfo import ZoneInfo

CHECKS = {
    "growth": ("needs_growth", "reminder_growth", "سلام! فرم رشد فردی امروزت هنوز ثبت نشده. لطفاً امشب آن را تکمیل کن."),
    "coach": ("is_coach", "reminder_visits", "سلام مربی عزیز، امروز هنوز سامانهٔ اخوت را بررسی نکرده‌ای. لطفاً به پنل نظارتی سر بزن."),
}


def deliver(db, token, day):
    db.execute("""CREATE TABLE IF NOT EXISTS reminder_delivery(
        user_id TEXT NOT NULL, day TEXT NOT NULL, kind TEXT NOT NULL,
        PRIMARY KEY(user_id,day,kind))""")
    failed = 0
    for kind, (flag, activity, message) in CHECKS.items():
        query = f"""SELECT m.user_id,m.chat_id FROM reminder_members m
            WHERE m.{flag}=1 AND m.chat_id IS NOT NULL AND m.chat_id!=''
            AND NOT EXISTS (SELECT 1 FROM {activity} a
              WHERE a.user_id=m.user_id AND a.local_day=?)"""
        for user, chat in db.execute(query, (day,)).fetchall():
            try:
                with db:
                    db.execute("BEGIN IMMEDIATE")
                    cursor = db.execute("INSERT OR IGNORE INTO reminder_delivery VALUES (?,?,?)", (user, day, kind))
                    if not cursor.rowcount:
                        continue
                    if not db.execute(f"SELECT 1 FROM ({query}) WHERE user_id=?", (day,user)).fetchone():
                        db.rollback()
                        continue
                    payload = json.dumps({"chat_id":chat, "text":message}).encode()
                    post = request.Request(f"https://tapi.bale.ai/bot{token}/sendMessage",data=payload,
                                           headers={"Content-Type":"application/json"})
                    with request.urlopen(post, timeout=12) as response:
                        if not json.load(response).get("ok"):
                            raise ValueError("delivery rejected")
            except (OSError, ValueError):
                failed += 1
    return failed


if __name__ == "__main__":
    now = datetime.now(ZoneInfo(os.environ.get("REMINDER_TIME_ZONE","Asia/Tehran")))
    if now.hour >= 22:
        with sqlite3.connect(os.environ["REMINDER_DB"], timeout=30) as db:
            sys.exit(bool(deliver(db, os.environ["BALE_BOT_TOKEN"], now.date().isoformat())))
