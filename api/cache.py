"""Per-principal response cache. The revision is updated by the data transaction."""
import hashlib
import hmac
import secrets
import json
import logging
import os
import threading
import time

log = logging.getLogger("okhovat.cache")
TTL = 900
MAX_ENTRY = 2 * 1024 * 1024
_signing_key = os.environ.get("CACHE_SIGNING_KEY", "").encode() or secrets.token_bytes(32)
_client = None
_retry_at = 0.0
_lock = threading.Lock()


def client():
    global _client
    url = os.getenv("REDIS_URL")
    if not url or time.monotonic() < _retry_at:
        return None
    with _lock:
        if _client is None:
            import redis
            from redis.retry import Retry
            from redis.backoff import NoBackoff
            _client = redis.Redis.from_url(url, socket_connect_timeout=0.2, socket_timeout=0.25,
                                           max_connections=24, retry=Retry(NoBackoff(), 0))
    return _client


def run(operation):
    global _retry_at
    try:
        conn = client()
        if conn is not None:
            return operation(conn)
    except Exception:
        # Redis is optional. Never return a different user's data as a fallback.
        with _lock:
            if time.monotonic() >= _retry_at:
                log.warning("redis_unavailable")
            _retry_at = time.monotonic() + 5
    return None


def state_key(user, revision):
    identity = json.dumps([user[k] for k in ("code", "role", "ring", "team")], ensure_ascii=False)
    return "ok:v1:state:" + revision + ":" + hashlib.sha256(identity.encode()).hexdigest()


def get(key):
    raw = run(lambda c: c.get(key))
    if isinstance(raw,bytes) and 32 < len(raw) <= MAX_ENTRY+32:
        tag,raw=raw[:32],raw[32:]
        if not hmac.compare_digest(tag,signature(key,raw)):
            log.warning("cache_signature_invalid")
            return None
        try:
            result = json.loads(raw)
            if isinstance(result, dict) and isinstance(result.get("posts"), list):
                return result
        except (ValueError, TypeError, RecursionError):
            pass
    return None


def signature(key, raw):
    return hmac.digest(_signing_key,key.encode()+b"\x00"+raw,"sha256")


def put(key, result):
    if not os.getenv("REDIS_URL"):
        return
    raw = json.dumps(result, separators=(",", ":"), ensure_ascii=False).encode()
    if len(raw) <= MAX_ENTRY:
        run(lambda c: c.set(key, signature(key,raw)+raw, ex=TTL))
