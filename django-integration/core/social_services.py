"""Use for authenticated like and unlike endpoints (explicit desired state)."""
from django.core.exceptions import PermissionDenied
from django.db import transaction

from .models import Post, PostLike


@transaction.atomic
def set_post_like(*, post_id, user, liked: bool):
    if not user.is_authenticated or not user.is_active or user.is_suspended:
        raise PermissionDenied
    post = Post.objects.select_for_update().get(pk=post_id, deleted_at__isnull=True)
    if not liked:
        PostLike.objects.filter(post=post, user=user).delete()
        return
    outside = (
        post.kind == Post.Kind.RING
        and user.ring_id is not None
        and user.ring_id != post.ring_id
        and user.pk != post.author_id
    )
    PostLike.objects.get_or_create(post=post, user=user, defaults={"counts_for_ring": outside})
