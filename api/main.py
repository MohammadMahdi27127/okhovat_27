from contextlib import asynccontextmanager
from datetime import date, datetime, timezone, timedelta
from hashlib import sha256
from pathlib import Path
from typing import Literal
from uuid import uuid4
from zoneinfo import ZoneInfo
import os
import logging
import sqlite3
import shutil
import secrets
import time

from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, ConfigDict

from .accounts import create, verify, password_hash
from . import attendance, cache
from .guard import RequestGuard, admitted, LOGIN_SLOTS, STATE_SLOTS, CHAT_SLOTS, account_login_limit
from .db import database, initialize, pack, unpack, snapshot, SnapshotTooLarge

DIST=Path(__file__).resolve().parents[1]/"dist"
WEEK=7*86400
COOKIE="okhovat_session"
DUMMY_PASSWORD=password_hash(secrets.token_hex(32))

@asynccontextmanager
async def lifespan(app):
    if os.getenv("SCHEMA_READY")!="1":
        initialize()
    # حساب‌های اولیه دیگر از متغیر محیطی ساخته نمی‌شوند.
    # برای ساخت حساب از دستور زیر استفاده کنید:
    #   python -m api.accounts --code 27127 --name "عضو اخوت" --role member --ring "سلمان" --team "آموزش"
    # یا بعد از دادن نقش ادمین، از پنل «ثبت عضو جدید» استفاده کنید.
    yield

app=FastAPI(title="Okhovat API",lifespan=lifespan)

app.add_middleware(RequestGuard)

@app.exception_handler(RequestValidationError)
async def invalid_input(request,exc):
    return JSONResponse({"detail":"مقدار واردشده معتبر نیست."},422)

async def db_busy(request, exc):
    logging.getLogger("okhovat.db").warning("database_unavailable")
    return JSONResponse({"detail":"دیتابیس فعلاً در دسترس نیست."},503,headers={"Retry-After":"3","Cache-Control":"no-store"})

app.add_exception_handler(sqlite3.OperationalError,db_busy)
app.add_exception_handler(SnapshotTooLarge,db_busy)
try:
    import psycopg
except ImportError:
    pass
else:
    app.add_exception_handler(psycopg.OperationalError,db_busy)
    app.add_exception_handler(psycopg.errors.QueryCanceled,db_busy)

def now(): return datetime.now(timezone.utc).isoformat()
def uid(): return uuid4().hex
def token_hash(token): return sha256(token.encode()).hexdigest()
def user(request:Request):
    with database() as q:
        row=q("SELECT a.code,a.name,a.role,a.ring,a.team,s.expires,EXISTS(SELECT 1 FROM ok_admins ad WHERE ad.actor=a.code) AS is_admin FROM ok_sessions s JOIN ok_accounts a ON a.code=s.actor WHERE s.token=? AND s.expires>?",(token_hash(request.cookies.get(COOKIE,"")),int(time.time()))).fetchone()
    if not row: raise HTTPException(401,"وارد حساب شو.")
    if expected:=request.headers.get("X-Okhovat-Account"):
        if expected!=row["code"]:raise HTTPException(409,"حساب فعال تغییر کرده است.")
    return dict(row)

def coach(u=Depends(user)):
    if u["role"]!="coach": raise HTTPException(403,"دسترسی مخصوص مربی است.")
    return u

class Input(BaseModel):
    model_config=ConfigDict(extra="forbid",str_strip_whitespace=True,allow_inf_nan=False)

class Login(Input):
    model_config=ConfigDict(extra="forbid",str_strip_whitespace=False)
    code:str=Field(max_length=40)
    password:str=Field(min_length=1,max_length=256)

@app.post("/api/login")
def login(body:Login,request:Request,response:Response):
    account_login_limit(body.code)
    with admitted(LOGIN_SLOTS):
        token,role=authenticate(body,request,response)
    if role=="member":
        result=attendance.lookup(body.code)
        with database() as q:
            q("""INSERT INTO ok_session_attendance(token,payload)
                 SELECT token,? FROM ok_sessions WHERE token=?""",(pack(result),token_hash(token)))
    return {"ok":True}

def authenticate(body,request,response):
    with database() as q:
        row=q("SELECT * FROM ok_accounts WHERE code=?",(body.code,)).fetchone()
        if not verify(body.password,row["password"] if row else DUMMY_PASSWORD) or not row: raise HTTPException(401,"کد گروهی یا رمز عبور درست نیست.")
        token=secrets.token_urlsafe(32)
        expires=int(time.time())+WEEK
        q("DELETE FROM ok_sessions WHERE expires<=? OR token=?",(int(time.time()),token_hash(request.cookies.get(COOKIE,""))))
        q("INSERT INTO ok_sessions VALUES(?,?,?)",(token_hash(token),row["code"],expires))
    response.set_cookie(COOKIE,token,max_age=WEEK,httponly=True,samesite="lax",secure=request.url.scheme=="https" or os.getenv("COOKIE_SECURE","0")=="1",path="/")
    return token,row["role"]

@app.post("/api/logout")
def logout(request:Request,response:Response):
    with database() as q:q("DELETE FROM ok_sessions WHERE token=?",(token_hash(request.cookies.get(COOKIE,"")),))
    response.delete_cookie(COOKIE,path="/")
    return {"ok":True}

class Growth(Input):
    publish:bool=False
    day:date
    dateJalali:str=Field(max_length=32)
    sport:float=Field(ge=0,le=24)
    reading:int=Field(ge=0,le=10000)
    skillTitle:str=Field(default="",max_length=250)
    learned:str=Field(default="",max_length=10000)
    practice:str=Field(default="",max_length=10000)
    leisure:str=Field(default="",max_length=120)
    responsibility:str=Field(default="",max_length=2000)
    proof:str=Field(default="",max_length=100)
    proofName:str=Field(default="",max_length=255)

def admin(u=Depends(user)):
    if not u["is_admin"]:raise HTTPException(403,"دسترسی مخصوص ادمین است.")
    return u

class MemberRegistration(Input):
    code:str=Field(pattern=r"^[0-9]{1,40}$")
    name:str=Field(min_length=1,max_length=120)
    ring:str=Field(default="",max_length=120)
    team:str=Field(default="",max_length=120)
    password:str=Field(min_length=8,max_length=128)
    model_config=ConfigDict(extra="forbid",str_strip_whitespace=False)

@app.post("/api/admin/members",status_code=201)
def register_member(body:MemberRegistration,u=Depends(admin)):
    if not body.name.strip():raise HTTPException(422,"نام را وارد کن.")
    with admitted(LOGIN_SLOTS):
        added=create(body.code,body.name.strip(),"member",body.password,body.ring.strip(),body.team.strip())
    if not added:raise HTTPException(409,"این کد گروهی قبلاً ثبت شده است.")
    return {"code":body.code}

@app.delete("/api/admin/posts/{pid}")
def remove_post(pid:str,u=Depends(admin)):
    with database() as q:
        row=q("SELECT payload FROM ok_posts WHERE id=?",(pid,)).fetchone()
        if not row:raise HTTPException(404)
        item=unpack(row["payload"])
        media=next((item[k] for k in ("file","image","video") if item.get(k)),"")
        q("INSERT INTO ok_removed_posts(post,moderator,removed_at,media) VALUES(?,?,?,?) ON CONFLICT(post) DO NOTHING",
          (pid,u["code"],now(),media))
    return {"ok":True}

def file_check(path,u,purpose):
    if not path:return
    import re
    if not re.fullmatch(r"/api/files/[a-f0-9]{32}",path):raise HTTPException(422,"نشانی فایل معتبر نیست")
    with database() as q:
        if purpose=="post" and q("SELECT 1 FROM ok_removed_posts WHERE media=?",(path,)).fetchone():raise HTTPException(404)
        if not q("SELECT 1 FROM ok_files WHERE id=? AND owner=? AND purpose=?",(path.split("/")[-1],u["code"],purpose)).fetchone():
            raise HTTPException(403,"فایل متعلق به این حساب نیست")

def announce_post(q, author):
    q("""INSERT INTO ok_notices(id,recipient,kind,created,seen)
         SELECT ? || code,code,'post',?,0 FROM ok_accounts WHERE code<>?""",(uid(),now(),author))

def announce_reaction(q, pid, author, kind):
    recipient=q("SELECT actor FROM ok_posts WHERE id=?",(pid,)).fetchone()["actor"]
    if recipient!=author:
        q("INSERT INTO ok_notices VALUES(?,?,?,?,0)",(uid(),recipient,kind,now()))

@app.put("/api/growth")
def growth(b:Growth,u=Depends(user)):
    day=b.day.isoformat()
    file_check(b.proof,u,"proof")
    payload=b.model_dump(mode="json")
    title="گزارش رشد · "+b.dateJalali
    text=f"{b.sport:g} ساعت ورزش و {b.reading} صفحه مطالعه"+(" · "+b.skillTitle if b.skillTitle else "")
    with database() as q:
        q("INSERT INTO ok_growth VALUES(?,?,?,?,?) ON CONFLICT(actor,day) DO UPDATE SET sport=excluded.sport,reading=excluded.reading,payload=excluded.payload",(u["code"],day,b.sport,b.reading,pack(payload)))
        post_id="g"+sha256((u["code"]+":"+day).encode()).hexdigest()
        if b.publish:
            public=pack(dict(type="رشد فردی",title=title,text=text,growthDay=day))
            created=q("INSERT INTO ok_posts VALUES(?,?,?,?) ON CONFLICT(id) DO NOTHING",(post_id,u["code"],now(),public))
            if created.rowcount:
                announce_post(q,u["code"])
            else:
                q("UPDATE ok_posts SET payload=? WHERE id=?",(public,post_id))
        elif not q("SELECT 1 FROM ok_removed_posts WHERE post=?",(post_id,)).fetchone():
            # Withdrawing a summary also removes its public interactions.
            q("DELETE FROM ok_comment_likes WHERE id IN (SELECT id FROM ok_comments WHERE post=?)",(post_id,))
            q("DELETE FROM ok_comments WHERE post=? AND parent IS NOT NULL",(post_id,))
            q("DELETE FROM ok_comments WHERE post=?",(post_id,))
            q("DELETE FROM ok_votes WHERE post=?",(post_id,))
            q("DELETE FROM ok_posts WHERE id=?",(post_id,))
    return {"id":post_id if b.publish else None}


class Post(Input):
    title:str=Field(min_length=1,max_length=300)
    text:str=Field(max_length=20000)
    attachment:str=Field(default="",max_length=100)
    fileName:str=Field(default="",max_length=255)
    medium:Literal["image","video","file"]="file"

@app.post("/api/posts")
def post(b:Post,u=Depends(user)):
    file_check(b.attachment,u,"post")
    data=dict(title=b.title,text=b.text,type="شخصی")
    if b.attachment:data.update({b.medium:b.attachment,"fileName":b.fileName})
    pid=uid()
    with database() as q:
        q("INSERT INTO ok_posts VALUES(?,?,?,?)",(pid,u["code"],now(),pack(data)))
        announce_post(q,u["code"])
    return {"id":pid}

class Vote(Input):
    active:bool

@app.put("/api/posts/{pid}/votes/{kind}")
def vote(pid:str,kind:Literal["like","recommend","bookmark"],b:Vote,u=Depends(user)):
    with database() as q:
        if not q("SELECT 1 FROM ok_posts WHERE id=? AND id NOT IN (SELECT post FROM ok_removed_posts)",(pid,)).fetchone():raise HTTPException(404)
        args=(pid,u["code"],kind)
        if b.active:
            inserted=q("INSERT INTO ok_votes VALUES(?,?,?) ON CONFLICT DO NOTHING",args)
            if inserted.rowcount and kind=="like":announce_reaction(q,pid,u["code"],"like")
        else:q("DELETE FROM ok_votes WHERE post=? AND actor=? AND kind=?",args)
    return {"ok":True}

class Comment(Input):
    text:str=Field(min_length=1,max_length=2000)
    parent:str|None=None

@app.post("/api/posts/{pid}/comments")
def comment(pid:str,b:Comment,u=Depends(user)):
    with database() as q:
        if not q("SELECT 1 FROM ok_posts WHERE id=? AND id NOT IN (SELECT post FROM ok_removed_posts)",(pid,)).fetchone():raise HTTPException(404)
        if b.parent and not q("SELECT 1 FROM ok_comments WHERE post NOT IN (SELECT post FROM ok_removed_posts) AND id=? AND post=? AND parent IS NULL",(b.parent,pid)).fetchone():raise HTTPException(422)
        q("INSERT INTO ok_comments VALUES(?,?,?,?,?,?)",(uid(),pid,u["code"],b.parent,b.text,now()))
        announce_reaction(q,pid,u["code"],"comment")
    return {"ok":True}

class Message(Input):
    scope:Literal["all","group","ring","person"]
    target:str=Field(default="",max_length=120)
    text:str=Field(min_length=1,max_length=4000)

@app.post("/api/messages")
def message(b:Message,u=Depends(coach)):
    with database() as q:
        col={"person":"code","ring":"ring","group":"team"}.get(b.scope)
        mid=uid()
        q("INSERT INTO ok_messages VALUES(?,?,?,?,?)",(mid,u["code"],b.target or "همه اعضا",b.text,now()))
        recipients="SELECT ?,code FROM ok_accounts WHERE role='member'"
        params=[mid]
        if col:
            recipients+=" AND "+col+"=?"
            params.append(b.target)
        inserted=q("INSERT INTO ok_inbox(message,actor) "+recipients,params)
        if not inserted.rowcount:raise HTTPException(422,"گیرنده‌ای پیدا نشد.")
    return {"id":mid}

@app.post("/api/messages/read")
def read_messages(u=Depends(user)):
    with database() as q:q("UPDATE ok_inbox SET seen=1 WHERE actor=?",(u["code"],))
    return {"ok":True}

class Grade(Input):
    target:str=Field(min_length=1,max_length=120)
    score:float=Field(ge=0,le=100000)

@app.put("/api/grades/{kind}")
def grade(kind:Literal["group","ring"],b:Grade,u=Depends(coach)):
    col="team" if kind=="group" else "ring"
    with database() as q:
        if not q("SELECT 1 FROM ok_accounts WHERE "+col+"=?",(b.target,)).fetchone():raise HTTPException(422,"گروه پیدا نشد.")
        q("INSERT INTO ok_grades VALUES(?,?,?,?) ON CONFLICT(kind,target) DO UPDATE SET score=excluded.score,coach=excluded.coach",(kind,b.target,b.score,u["code"]))
    return {"ok":True}

from fastapi import UploadFile

@app.post("/api/files/{purpose}")
def upload(purpose:Literal["proof","post","avatar"],file:UploadFile,u=Depends(user)):
    data=file.file.read(10*1024*1024+1)
    if len(data)>10*1024*1024:raise HTTPException(413,"حداکثر حجم فایل ۱۰ مگابایت است.")
    mime="application/octet-stream"
    for prefix,kind in [(b"\xff\xd8\xff","image/jpeg"),(b"\x89PNG\r\n\x1a\n","image/png"),(b"GIF89a","image/gif")]:
        if data.startswith(prefix):mime=kind
    if data[:4]==b"RIFF" and data[8:12]==b"WEBP":mime="image/webp"
    if data[4:8]==b"ftyp":mime="video/mp4"
    if purpose=="avatar" and not mime.startswith("image/"):raise HTTPException(422,"تصویر معتبر انتخاب کن.")
    folder=Path(os.getenv("UPLOADS_DIR","var/uploads"));folder.mkdir(parents=True,exist_ok=True)
    if shutil.disk_usage(folder).free < len(data)+32*1024*1024:
        raise HTTPException(507,"فضای ذخیره‌سازی کافی نیست.")
    fid=uid()
    try:
        (folder/fid).write_bytes(data)
    except OSError:
        (folder/fid).unlink(missing_ok=True)
        raise HTTPException(503,"ذخیرهٔ فایل موقتاً در دسترس نیست.")
    try:
        with database() as q:
            quota=int(os.getenv("UPLOAD_QUOTA_MB","256"))*1024*1024
            charge=max(len(data),4096)
            if charge>quota:raise HTTPException(413,"سهمیهٔ فایل کافی نیست.")
            reserved=q("""INSERT INTO ok_upload_usage VALUES(?,?) ON CONFLICT(actor) DO UPDATE
                         SET used=ok_upload_usage.used+excluded.used WHERE ok_upload_usage.used+excluded.used<=?""",
                       (u["code"],charge,quota))
            if not reserved.rowcount:raise HTTPException(413,"سهمیهٔ فایل این حساب تکمیل شده است.")
            q("INSERT INTO ok_files VALUES(?,?,?,?,?)",(fid,u["code"],purpose,(file.filename or "file")[:250],mime))
    except BaseException:
        (folder/fid).unlink(missing_ok=True)
        raise
    return {"url":"/api/files/"+fid,"medium":mime.split("/")[0] if mime!="application/octet-stream" else "file"}

@app.get("/api/files/{fid}")
def download(fid:str,u=Depends(user)):
    with database() as q:
        r=q("SELECT * FROM ok_files WHERE id=?",(fid,)).fetchone()
        if r and r["purpose"]=="post" and q("SELECT 1 FROM ok_removed_posts WHERE media=?",("/api/files/"+fid,)).fetchone():raise HTTPException(404)
    if not r or (r["purpose"]=="proof" and r["owner"]!=u["code"] and u["role"]!="coach"):raise HTTPException(404)
    kwargs={"filename":r["name"]} if r["mime"]=="application/octet-stream" else {}
    return FileResponse(Path(os.getenv("UPLOADS_DIR","var/uploads"))/r["id"],media_type=r["mime"],headers={"Content-Security-Policy":"sandbox"},**kwargs)

@app.put("/api/comments/{cid}/like")
def like_comment(cid:str,b:Vote,u=Depends(user)):
    with database() as q:
        if not q("SELECT 1 FROM ok_comments WHERE post NOT IN (SELECT post FROM ok_removed_posts) AND id=?",(cid,)).fetchone():raise HTTPException(404)
        if b.active:q("INSERT INTO ok_comment_likes VALUES(?,?) ON CONFLICT DO NOTHING",(cid,u["code"]))
        else:q("DELETE FROM ok_comment_likes WHERE id=? AND actor=?",(cid,u["code"]))
    return {"ok":True}

class Status(Input):
    sportPlan:str=Field(max_length=2000)
    currentBook:str=Field(max_length=300)

def preference(actor,name,value):
    with database() as q:q("INSERT INTO ok_preferences VALUES(?,?,?) ON CONFLICT(actor,name) DO UPDATE SET value=excluded.value",(actor,name,pack(value)))

@app.put("/api/profile/status")
def status(b:Status,u=Depends(user)):
    preference(u["code"],"personalStatus",b.model_dump())
    return {"ok":True}

class Avatar(Input):
    url:str=Field(max_length=100)

@app.put("/api/profile/avatar")
def avatar(b:Avatar,u=Depends(user)):
    file_check(b.url,u,"avatar")
    preference(u["code"],"avatar",b.url)
    return {"ok":True}

@app.get("/api/session")
def session(request:Request):
    try:
        member=user(request)
        with database() as q:
            row=q("SELECT payload FROM ok_session_attendance WHERE token=?",
                  (token_hash(request.cookies.get(COOKIE,"")),)).fetchone()
        return {"user":member,"attendance":unpack(row["payload"]) if row else None}
    except HTTPException as exc:
        if exc.status_code != 401:raise
        return {"user":None}

@app.get("/api/assistant/session/")
def assistant_session(request:Request):
    return {"authenticated":bool(session(request)["user"]),"csrf":"ok"}

@app.get("/api/assistant/login/")
def assistant_login():return RedirectResponse("/login/?next=/chat/")

class Plan(Input):
    kind:Literal["stats","guide","greeting","unsupported"]
    period:Literal["today","yesterday","week","previous","compare"]
    scope:Literal["ring","peers","self"]

class Question(Input):
    message:str=Field(min_length=1,max_length=2000)
    plan:Plan

@app.post("/api/assistant/chat/")
def assistant_chat(b:Question,u=Depends(user)):
    from .assistant import answer
    return answer(b, u)

# Static files
app.mount("/assets", StaticFiles(directory=str(DIST / "assets")), name="assets")

@app.get("/{full_path:path}")
def spa(full_path: str):
    if full_path.startswith("api/") or full_path.startswith("docs"):
        raise HTTPException(404)
    target = DIST / full_path
    if target.is_file():
        return FileResponse(target)
    return FileResponse(DIST / "index.html")
