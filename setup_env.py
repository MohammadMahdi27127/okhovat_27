"""Create initial local deployment secrets without overwriting existing credentials."""
import os
import secrets
from pathlib import Path

if __name__=="__main__":
    path=Path(__file__).resolve().with_name(".env")
    try:
        fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    except FileExistsError:
        keys={line.partition("=")[0].strip() for line in path.read_text().splitlines()}
        with path.open("a") as f:
            for key in ("REDIS_PASSWORD","APP_DB_PASSWORD"):
                if key not in keys:f.write("\n"+key+"="+secrets.token_hex(24)+"\n")
        print("Existing credentials kept; Redis password configured.")
    else:
        with os.fdopen(fd,"w") as f:
            for key in ("DB_PASSWORD","REDIS_PASSWORD","APP_DB_PASSWORD"):
                f.write(f"{key}={secrets.token_hex(16)}\n")
        print("Created .env (without MEMBER/COACH passwords).")
        print("Create accounts with: python -m api.accounts --code ... --name ... --role ...")
