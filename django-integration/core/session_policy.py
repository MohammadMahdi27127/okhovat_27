"""Import finish_login in the login view after authenticate() succeeds."""
from datetime import timedelta

from django.contrib.auth import login
from django.core.exceptions import PermissionDenied
from django.utils import timezone


def finish_login(request, user):
    if not user.is_active or user.is_suspended:
        raise PermissionDenied("این حساب اجازهٔ ورود ندارد.")
    login(request, user)
    # A datetime fixes the deadline even when other views modify the session.
    request.session.set_expiry(timezone.now() + timedelta(days=7))
