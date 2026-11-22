"""Grant moderation to an existing account from the server command line."""
import argparse
from .db import database

def grant(code):
    with database() as q:
        if not q("SELECT 1 FROM ok_accounts WHERE code=?",(code,)).fetchone():
            raise ValueError("Account not found")
        q("INSERT INTO ok_admins VALUES(?) ON CONFLICT DO NOTHING",(code,))

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("code")
    args=parser.parse_args()
    try:grant(args.code)
    except ValueError as exc:parser.error(str(exc))
    print("Administrator access granted.")
