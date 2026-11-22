"""Compose one-shot migration. The serving container only receives the runtime DSN."""
import os
import psycopg
from psycopg import sql
from .db import initialize


def migrate():
    initialize()
    with psycopg.connect(os.environ["DATABASE_URL"]) as conn:
        exists = conn.execute("SELECT 1 FROM pg_roles WHERE rolname='okhovat_web'").fetchone()
        verb = sql.SQL("ALTER") if exists else sql.SQL("CREATE")
        conn.execute(sql.SQL("{} ROLE okhovat_web LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD {}").format(
            verb, sql.Literal(os.environ["APP_DB_PASSWORD"])))
        conn.execute("GRANT USAGE ON SCHEMA public TO okhovat_web")
        tables=conn.execute("SELECT tablename FROM pg_tables WHERE schemaname='public' AND left(tablename,3)='ok_'").fetchall()
        for name, in tables:
            conn.execute(sql.SQL("GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.{} TO okhovat_web").format(sql.Identifier(name)))

if __name__ == "__main__":
    migrate()
