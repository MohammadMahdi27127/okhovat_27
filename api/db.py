"""Portable SQL for PostgreSQL deployments and explicitly selected SQLite development."""
import json
import os
import sqlite3
from uuid import uuid4
from contextlib import contextmanager
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS ok_accounts(code TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, ring TEXT NOT NULL, team TEXT NOT NULL, password TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ok_sessions(token TEXT PRIMARY KEY, actor TEXT NOT NULL REFERENCES ok_accounts(code), expires BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS ok_growth(actor TEXT NOT NULL REFERENCES ok_accounts(code), day TEXT NOT NULL, sport REAL NOT NULL, reading INTEGER NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(actor,day));
CREATE TABLE IF NOT EXISTS ok_posts(id TEXT PRIMARY KEY, actor TEXT NOT NULL REFERENCES ok_accounts(code), created TEXT NOT NULL, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ok_votes(post TEXT NOT NULL REFERENCES ok_posts(id), actor TEXT NOT NULL REFERENCES ok_accounts(code), kind TEXT NOT NULL, PRIMARY KEY(post,actor,kind));
CREATE TABLE IF NOT EXISTS ok_comments(id TEXT PRIMARY KEY, post TEXT NOT NULL REFERENCES ok_posts(id), actor TEXT NOT NULL REFERENCES ok_accounts(code), parent TEXT REFERENCES ok_comments(id), body TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ok_messages(id TEXT PRIMARY KEY, sender TEXT NOT NULL REFERENCES ok_accounts(code), label TEXT NOT NULL, body TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ok_inbox(message TEXT NOT NULL REFERENCES ok_messages(id), actor TEXT NOT NULL REFERENCES ok_accounts(code), seen INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(message,actor));
CREATE TABLE IF NOT EXISTS ok_grades(kind TEXT NOT NULL, target TEXT NOT NULL, score REAL NOT NULL, coach TEXT NOT NULL REFERENCES ok_accounts(code), PRIMARY KEY(kind,target));
CREATE TABLE IF NOT EXISTS ok_preferences(actor TEXT NOT NULL REFERENCES ok_accounts(code), name TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY(actor,name));
"""

@contextmanager
def database():
    url = os.environ.get("DATABASE_URL", "")
    if url.startswith(("postgresql://","postgres://")):
        import psycopg
        from psycopg.rows import dict_row
        conn = psycopg.connect(url, row_factory=dict_row, connect_timeout=3, options="-c statement_timeout=5000 -c lock_timeout=200")
        def execute(sql, params=()):
            return conn.execute(sql.replace("?", "%s"), params)
    else:
        if url or not os.environ.get("OK_SQLITE"):
            raise RuntimeError("Configure DATABASE_URL or OK_SQLITE")
        path = Path(os.environ["OK_SQLITE"])
        path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(path, timeout=2)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys=ON")
        execute = conn.execute
    dirty=False
    def query(sql,params=()):
        nonlocal dirty
        cur=execute(sql,params)
        if sql.split(None,1)[0].upper() in {"INSERT","UPDATE","DELETE"} and cur.rowcount and "ok_sessions" not in sql and "ok_revision" not in sql:
            dirty=True
        return cur
    try:
        yield query
        if dirty:
            execute("UPDATE ok_revision SET rev=? WHERE id=1",(uuid4().hex,))
        conn.commit()
    except BaseException:
        conn.rollback()
        raise
    finally:
        conn.close()

SCHEMA += "CREATE TABLE IF NOT EXISTS ok_revision(id INTEGER PRIMARY KEY, rev TEXT NOT NULL);"

def initialize():
    with database() as q:
        schema=SCHEMA
        if os.environ.get("DATABASE_URL"):
            schema=schema.replace("payload TEXT","payload JSONB").replace("value TEXT","value JSONB")
        for statement in schema.split(";"):
            if statement.strip():
                q(statement)
        q("INSERT INTO ok_revision VALUES(1,?) ON CONFLICT DO NOTHING",(uuid4().hex,))

SCHEMA += """
CREATE TABLE IF NOT EXISTS ok_files(id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES ok_accounts(code), purpose TEXT NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ok_comment_likes(id TEXT NOT NULL REFERENCES ok_comments(id), actor TEXT NOT NULL REFERENCES ok_accounts(code), PRIMARY KEY(id,actor));
"""

def pack(value):
    if os.environ.get("DATABASE_URL"):
        from psycopg.types.json import Jsonb
        return Jsonb(value)
    return json.dumps(value)

def unpack(value):
    return value if os.environ.get("DATABASE_URL") else json.loads(value)

SCHEMA += """
CREATE TABLE IF NOT EXISTS ok_notices(id TEXT PRIMARY KEY, recipient TEXT NOT NULL REFERENCES ok_accounts(code), kind TEXT NOT NULL, created TEXT NOT NULL, seen INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS ok_notices_recipient ON ok_notices(recipient,seen);
CREATE TABLE IF NOT EXISTS ok_follows(actor TEXT NOT NULL REFERENCES ok_accounts(code), target TEXT NOT NULL REFERENCES ok_accounts(code), PRIMARY KEY(actor,target));
"""

SCHEMA += """
CREATE TABLE IF NOT EXISTS ok_upload_usage(actor TEXT PRIMARY KEY REFERENCES ok_accounts(code), used BIGINT NOT NULL);
CREATE INDEX IF NOT EXISTS ok_growth_day_actor ON ok_growth(day,actor);
CREATE INDEX IF NOT EXISTS ok_inbox_actor ON ok_inbox(actor);
CREATE INDEX IF NOT EXISTS ok_sessions_expiry ON ok_sessions(expires);
"""

class SnapshotTooLarge(Exception):
    pass

@contextmanager
def snapshot():
    """Iterate large result sets in batches under a single consistent read snapshot."""
    limits = {"rows": 30000, "bytes": 8 * 1024 * 1024}
    with database() as q:
        pg=bool(os.environ.get("DATABASE_URL"))
        if pg:
            q("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY")
        else:
            q("BEGIN")
        def scan(sql, params=()):
            if pg:
                connection=q("SELECT 1").connection
                cur=connection.cursor(name="ok_"+uuid4().hex)
                cur.execute(sql.replace("?", "%s"),params)
            else:
                cur=q(sql,params)
            try:
                while rows:=cur.fetchmany(32):
                    for row in rows:
                        limits["rows"]-=1
                        limits["bytes"]-=sum(len(str(row[k]).encode())+24 for k in row.keys())
                        if min(limits.values())<0:raise SnapshotTooLarge
                        yield row
            finally:
                cur.close()
        yield scan

SCHEMA += """
CREATE TABLE IF NOT EXISTS ok_session_attendance(
    token TEXT PRIMARY KEY REFERENCES ok_sessions(token) ON DELETE CASCADE,
    payload TEXT NOT NULL
);
"""

SCHEMA += """
CREATE TABLE IF NOT EXISTS ok_admins(actor TEXT PRIMARY KEY REFERENCES ok_accounts(code));
CREATE TABLE IF NOT EXISTS ok_removed_posts(
 post TEXT PRIMARY KEY REFERENCES ok_posts(id), moderator TEXT NOT NULL REFERENCES ok_accounts(code),
 removed_at TEXT NOT NULL, media TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS ok_removed_media ON ok_removed_posts(media);
"""
