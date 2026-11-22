import argparse
import getpass
import hashlib
import hmac
import os
import secrets
from .db import database, initialize

def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    return salt + ":" + hashlib.scrypt(password.encode(),salt=salt.encode(),n=16384,r=8,p=1).hex()

def verify(password, encoded):
    return hmac.compare_digest(password_hash(password,encoded.split(":")[0]),encoded)

def create(code, name, role, password, ring="", team=""):
    with database() as q:
        return q("INSERT INTO ok_accounts VALUES(?,?,?,?,?,?) ON CONFLICT(code) DO NOTHING",
          (code,name,role,ring,team,password_hash(password))).rowcount == 1

if __name__ == "__main__":
    p=argparse.ArgumentParser()
    for key in ("code","name"): p.add_argument("--"+key,required=True)
    p.add_argument("--role",choices=["coach","member"],default="member")
    p.add_argument("--ring",default="")
    p.add_argument("--team",default="")
    a=p.parse_args()
    password=getpass.getpass("Password: ")
    if len(password)<8: p.error("Use at least 8 characters")
    if os.getenv("SCHEMA_READY")!="1":initialize()
    create(a.code,a.name,a.role,password,a.ring,a.team)
