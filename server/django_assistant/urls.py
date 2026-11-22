from django.conf import settings
from django.contrib.auth.views import redirect_to_login
from django.urls import path

from . import views


def login(request):
    return redirect_to_login("/chat/", settings.LOGIN_URL)


urlpatterns = [
    path("session/", views.session),
    path("chat/", views.chat),
    path("login/", login),
]
