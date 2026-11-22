"""Merge these settings into the Django server that handles uploads."""
import os
from pathlib import Path

MEDIA_ROOT = Path(os.environ.get("OKHOVAT_MEDIA_ROOT", "/var/lib/okhovat/media"))
MEDIA_URL = "/media/"
