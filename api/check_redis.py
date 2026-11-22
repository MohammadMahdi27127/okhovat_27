"""Read-only deployment smoke check plus a short-lived random Redis probe."""
import os
import secrets
from .cache import client, TTL
from .db import database

if __name__=="__main__":
    if not os.getenv("DATABASE_URL") or not os.getenv("REDIS_URL"):
        raise SystemExit("Use docker compose exec web python -m api.check_redis")
    with database() as q:
        role=q("SELECT current_user AS role").fetchone()["role"]
        rev=q("SELECT rev FROM ok_revision WHERE id=1").fetchone()["rev"]
    if role!="okhovat_web" or not rev:
        raise SystemExit("Unexpected database role or missing migration")
    conn=client()
    key="ok:smoke:"+secrets.token_hex(16)
    conn.set(key,b"ok",ex=TTL)
    try:
        if conn.get(key)!=b"ok" or not 0 < conn.ttl(key) <= TTL:
            raise SystemExit("Redis TTL check failed")
    finally:
        conn.delete(key)
    print("PostgreSQL runtime role, revision table and Redis TTL verified.")
