"""Mount these URL patterns under /api/assistant/ in safa27."""
import json
from datetime import datetime, timedelta
from urllib import error, request as http
from zoneinfo import ZoneInfo

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_GET, require_POST

from core.models import PersonalGrowthRecord

CHOICES = {"kind": ["stats", "guide", "greeting", "unsupported"],
           "scope": ["self", "ring", "peers"],
           "period": ["week", "previous", "today", "yesterday", "compare"]}


def allowed(user):
    return user.is_authenticated and user.is_active and not user.is_suspended


@never_cache
@require_GET
def session(request):
    active = allowed(request.user)
    return JsonResponse({"authenticated": active, "csrf": get_token(request) if active else None})


def valid(plan):
    return isinstance(plan, dict) and all(plan.get(k) in choices for k, choices in CHOICES.items())


def interpret(message, fallback):
    model = getattr(settings, "ASSISTANT_OLLAMA_MODEL", "")
    if not model or fallback["kind"] == "unsupported":
        return fallback
    schema = {"type": "object", "required": list(CHOICES), "properties": {
        key: {"type": "string", "enum": values} for key, values in CHOICES.items()}}
    instruction = ("Classify this Persian Okhovat question, including colloquial wording. "
                   "stats means growth reports, exercise, reading or participation. "
                   "Use peers for other members excluding the speaker, ring for the whole own ring. "
                   "Default to self and current week. compare means equivalent week-to-date periods. "
                   "Use guide for site directions, greeting for small talk and unsupported for "
                   "other time ranges, other rings, named individuals or unrelated tasks.")
    payload = {"model": model, "stream": False, "format": schema, "options": {"temperature": 0},
               "messages": [{"role": "system", "content": instruction}, {"role": "user", "content": message}]}
    url = getattr(settings, "ASSISTANT_OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/") + "/api/chat"
    try:
        req = http.Request(url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
        with http.urlopen(req, timeout=5) as response:
            result = json.loads(json.load(response)["message"]["content"])
        return result if valid(result) else fallback
    except (error.URLError, TimeoutError, OSError, ValueError, TypeError, KeyError):
        return fallback


def periods(period, today):
    one = timedelta(days=1)
    saturday = today - (today.weekday() + 2) % 7 * one
    week = 7 * one
    if period == "previous":
        return [(saturday-week, saturday-one)]
    if period in ("today", "yesterday"):
        day = today if period == "today" else today-one
        return [(day, day)]
    result = [(saturday, today)]
    if period == "compare":
        result.append((saturday-week, today-week))
    return result


@never_cache
@require_POST
@csrf_protect
def chat(request):
    if not allowed(request.user):
        return JsonResponse({"error": "login"}, status=403)
    try:
        body = json.loads(request.body)
        message, hint = body["message"], body["plan"]
        if not isinstance(message, str) or not 0 < len(message.strip()) <= 2000 or not valid(hint):
            raise ValueError()
    except (ValueError, TypeError, KeyError):
        return JsonResponse({"error": "invalid"}, status=400)
    plan = interpret(message, {k: hint[k] for k in CHOICES})
    result = {"plan": plan}
    if plan["kind"] == "stats":
        users = get_user_model().objects.filter(pk=request.user.pk)
        if plan["scope"] != "self":
            if request.user.ring_id is None:
                return JsonResponse({**result, "no_ring": True})
            users = get_user_model().objects.filter(ring_id=request.user.ring_id, is_active=True)
            if plan["scope"] == "peers":
                users = users.exclude(pk=request.user.pk)
        rows = PersonalGrowthRecord.objects.filter(user__in=users)
        result.update(members=users.count(), results=[])
        today = datetime.now(ZoneInfo("Asia/Tehran")).date()
        for start, end in periods(plan["period"], today):
            result["results"].append(rows.filter(day__range=(start, end)).aggregate(
                reports=Count("pk"), participants=Count("user_id", distinct=True),
                sport=Sum("sport_hours", default=0), reading=Sum("reading_pages", default=0)))
    return JsonResponse(result)
