"""Merge into the project's settings. Redis URLs come from server environment."""
import os

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": os.environ["REDIS_DATA_URL"],
        "TIMEOUT": 15 * 60,
        "KEY_PREFIX": "safa27:data",
    },
    "sessions": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": os.environ["REDIS_SESSION_URL"],
        "TIMEOUT": 7 * 24 * 60 * 60,
        "KEY_PREFIX": "safa27:sessions",
    },
}
SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"
SESSION_CACHE_ALIAS = "sessions"
SESSION_COOKIE_AGE = 7 * 24 * 60 * 60
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_SAVE_EVERY_REQUEST = False
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CACHE_MIDDLEWARE_SECONDS = 15 * 60
