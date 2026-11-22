"""Admission control before request parsing. Limits are per application process."""
import asyncio
import hashlib
import logging
import os
import threading
import time
import uuid
from collections import OrderedDict
from contextlib import contextmanager

from fastapi import HTTPException
from starlette.datastructures import Headers, MutableHeaders
from starlette.responses import JSONResponse

log = logging.getLogger("okhovat.security")
LOGIN_SLOTS = threading.BoundedSemaphore(3)
STATE_SLOTS = threading.BoundedSemaphore(3)
CHAT_SLOTS = threading.BoundedSemaphore(3)


@contextmanager
def admitted(slots):
    if not slots.acquire(blocking=False):
        raise HTTPException(503, "سرور مشغول است.", headers={"Retry-After":"2"})
    try:
        yield
    finally:
        slots.release()


class WindowLimits:
    def __init__(self):
        self.buckets = OrderedDict()
        self.lock = threading.Lock()

    def hit(self, key, maximum, seconds):
        now = time.monotonic()
        with self.lock:
            count, end = self.buckets.get(key, (0, 0))
            if now >= end:
                count, end = 0, now + seconds
            self.buckets[key] = (min(count + 1, maximum + 1), end)
            self.buckets.move_to_end(key)
            if len(self.buckets) > 8192:
                self.buckets.popitem(last=False)
            return max(1, int(end-now)+1) if count >= maximum else 0


limits = WindowLimits()


def account_login_limit(code):
    key = hashlib.sha256(code.encode()).digest()
    wait = limits.hit(("account", key), 12, 60)
    if wait:
        raise HTTPException(429, "کمی بعد دوباره تلاش کن.", headers={"Retry-After":str(wait)})


class RequestGuard:
    def __init__(self, app):
        self.app = app
        self.slots = threading.BoundedSemaphore(32)
        self.uploads = threading.BoundedSemaphore(3)

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        path, method = scope["path"], scope["method"]
        api = path.startswith("/api/")
        rid = uuid.uuid4().hex
        headers = Headers(scope=scope)

        async def send_headers(message):
            if message["type"] == "http.response.start":
                h = MutableHeaders(scope=message)
                h["X-Request-ID"] = rid
                h["X-Content-Type-Options"] = "nosniff"
                h["Referrer-Policy"] = "same-origin"
                h["X-Frame-Options"] = "DENY"
                h["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
                if api:
                    h["Cache-Control"] = "no-store"
                elif method in ("GET","HEAD") and message["status"]==200 and path.endswith((".js",".css",".png",".webp",".svg",".woff2")):
                    h["Cache-Control"]="public, max-age=900"
                if path not in ("/docs","/redoc","/docs/oauth2-redirect"):
                    h.setdefault("Content-Security-Policy", "script-src-elem 'self' https://esm.sh https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js; script-src-attr 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'")
                if os.getenv("COOKIE_SECURE") == "1":
                    h["Strict-Transport-Security"] = "max-age=31536000"
                if message["status"] in (401,403,413,429,503):
                    log.warning("request_rejected status=%d request_id=%s", message["status"], rid)
            await send(message)

        async def reject(code, wait=0):
            return await JSONResponse({"detail":"درخواست پذیرفته نشد؛ اندازه، مجوز یا زمان تلاش را بررسی کن.","request_id":rid},
                code,headers={"Retry-After":str(wait)} if wait else {})(scope,receive,send_headers)

        if not api:
            return await self.app(scope,receive,send_headers)
        ip = (scope.get("client") or ("local",))[0]
        upload = method=="POST" and path.startswith("/api/files/")
        for bucket,maximum,period in [("api",240,60)]+([("login",25,60)] if path=="/api/login" else [])+([("files",12,60)] if upload else []):
            wait=limits.hit((bucket,ip),maximum,period)
            if wait:return await reject(429,wait)
        write = method not in ("GET","HEAD","OPTIONS")
        if write and (headers.get("X-Okhovat")!="1" or headers.get("Sec-Fetch-Site")=="cross-site"):
            return await reject(403)
        limit = 11*1024*1024 if upload else 96*1024
        try:
            size=int(headers.get("content-length","0"))
        except ValueError:
            return await reject(400)
        if size<0 or size>limit:return await reject(413)
        if not self.slots.acquire(False):return await reject(503,2)
        upload_acquired=False
        try:
            if upload:
                upload_acquired=self.uploads.acquire(False)
                if not upload_acquired:return await reject(503,2)
            if write:
                body=bytearray()
                async def read_body():
                    while True:
                        msg=await receive()
                        if msg["type"]=="http.disconnect":return False
                        data=msg.get("body",b"")
                        if len(body)+len(data)>limit:raise OverflowError
                        body.extend(data)
                        if not msg.get("more_body"):return True
                try:
                    if not await asyncio.wait_for(read_body(),30 if upload else 8):return
                except OverflowError:return await reject(413)
                except asyncio.TimeoutError:return await reject(408)
                consumed=False
                async def replay():
                    nonlocal consumed
                    if consumed:return await receive()
                    consumed=True
                    return {"type":"http.request","body":bytes(body),"more_body":False}
                return await self.app(scope,replay,send_headers)
            return await self.app(scope,receive,send_headers)
        finally:
            if upload_acquired:self.uploads.release()
            self.slots.release()
