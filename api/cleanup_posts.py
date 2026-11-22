"""Weekly cleanup of post attachments.

Usage (inside the container or with correct env):
  python -m api.cleanup_posts --days 7

Only deletes files under the posts/ directory that are older than the given days
and are no longer referenced by active posts (or already marked as removed).
"""
import argparse
import time
from pathlib import Path

from .db import database, unpack
from .main import purpose_dir


def main():
    parser = argparse.ArgumentParser(description="Cleanup old post files")
    parser.add_argument("--days", type=int, default=7, help="Delete files older than N days (default: 7)")
    parser.add_argument("--dry-run", action="store_true", help="Only print what would be deleted")
    args = parser.parse_args()

    cutoff = time.time() - args.days * 86400
    posts_dir = purpose_dir("post")
    if not posts_dir.exists():
        print("No posts directory found.")
        return

    # Collect file ids that are still referenced by non-removed posts
    active = set()
    with database() as q:
        rows = q("SELECT payload FROM ok_posts WHERE id NOT IN (SELECT post FROM ok_removed_posts)").fetchall()
        for row in rows:
            item = unpack(row["payload"])
            for key in ("file", "image", "video"):
                url = item.get(key) or ""
                if url.startswith("/api/files/"):
                    active.add(url.split("/")[-1])

    deleted = 0
    freed = 0
    for path in posts_dir.iterdir():
        if not path.is_file():
            continue
        fid = path.name
        mtime = path.stat().st_mtime
        size = path.stat().st_size
        if mtime > cutoff:
            continue
        if fid in active:
            continue
        if args.dry_run:
            print(f"[dry-run] would delete {path} ({size} bytes)")
        else:
            path.unlink(missing_ok=True)
            print(f"deleted {path} ({size} bytes)")
        deleted += 1
        freed += size

    print(f"Done. {'Would delete' if args.dry_run else 'Deleted'} {deleted} files, {freed / 1024 / 1024:.1f} MiB")


if __name__ == "__main__":
    main()
