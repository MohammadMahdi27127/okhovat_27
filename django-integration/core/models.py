"""طرح مرجع برای Django 5.2؛ پیش از ادغام، مدل‌های موجود را با سورس اصلی مقایسه کنید."""
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone

USER = settings.AUTH_USER_MODEL


def validate_upload_size(file):
    if file.size > 10 * 1024 * 1024:
        raise ValidationError("حداکثر اندازهٔ فایل ۱۰ مگابایت است.")


def resolution_deadline():
    return timezone.now() + timedelta(days=7)


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, group_code, password=None, **extra_fields):
        if not group_code or not str(group_code).strip():
            raise ValueError("کد گروهی الزامی است.")
        user = self.model(group_code=str(group_code).strip(), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, group_code, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if not (extra_fields["is_staff"] is True and extra_fields["is_superuser"] is True):
            raise ValueError("مدیر کل باید مجوز مدیریت و ابرکاربری داشته باشد.")
        return self.create_user(group_code, password, **extra_fields)


class Ring(models.Model):
    name = models.CharField("نام حلقه", max_length=120, unique=True)
    coach_score = models.PositiveIntegerField("امتیاز خام مربی", default=0)

    class Meta:
        verbose_name = "حلقه"
        verbose_name_plural = "حلقه‌ها"
        ordering = ("name",)

    def __str__(self):
        return self.name


class Workgroup(models.Model):
    name = models.CharField("نام کارگروه", max_length=120, unique=True)
    manager = models.ForeignKey(USER, verbose_name="مسئول", null=True, blank=True,
                                on_delete=models.SET_NULL, related_name="managed_workgroups")
    coach_score = models.PositiveIntegerField("امتیاز خام مربی", default=0)

    class Meta:
        verbose_name = "کارگروه"
        verbose_name_plural = "کارگروه‌ها"
        ordering = ("name",)

    def __str__(self):
        return self.name


class User(AbstractUser):
    username = None
    group_code = models.CharField("کد گروهی", max_length=32, unique=True)
    ring = models.ForeignKey(Ring, verbose_name="حلقه", null=True, blank=True,
                             on_delete=models.SET_NULL, related_name="members")
    workgroups = models.ManyToManyField(Workgroup, verbose_name="کارگروه‌ها", blank=True, related_name="members")
    is_coach = models.BooleanField("مربی است", default=False)
    is_ring_leader = models.BooleanField("سرحلقه است", default=False)
    is_concerned_member = models.BooleanField("عضو جلسهٔ دغدغه‌مندان است", default=False)
    bale_id = models.BigIntegerField("شناسهٔ گفت‌وگوی خصوصی بله", null=True, blank=True, unique=True)
    suspended_until = models.DateTimeField("پایان تعلیق", null=True, blank=True)
    activity_level = models.PositiveIntegerField("سطح فعالیت", default=0)
    attendance_percentage = models.DecimalField(
        "درصد حضور", max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    USERNAME_FIELD = "group_code"
    REQUIRED_FIELDS = []
    objects = UserManager()

    class Meta:
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران"
        ordering = ("group_code",)
        constraints = [
            models.CheckConstraint(condition=Q(attendance_percentage__range=(0, 100)), name="core_attendance_range"),
            models.CheckConstraint(condition=Q(is_ring_leader=False) | Q(ring__isnull=False), name="core_leader_has_ring"),
        ]

    @property
    def is_suspended(self):
        return self.suspended_until is not None and self.suspended_until > timezone.now()

    def __str__(self):
        return self.get_full_name() or self.group_code


class Created(models.Model):
    created_at = models.DateTimeField("زمان ثبت", auto_now_add=True)

    class Meta:
        abstract = True
        ordering = ("-created_at", "-pk")


class WorkgroupMeeting(Created):
    workgroup = models.ForeignKey(Workgroup, verbose_name="کارگروه", related_name="meetings", on_delete=models.PROTECT)
    recorded_by = models.ForeignKey(USER, verbose_name="ثبت‌کننده", on_delete=models.PROTECT)
    title = models.CharField("عنوان جلسه", max_length=200)
    held_at = models.DateTimeField("زمان برگزاری")
    location = models.CharField("محل برگزاری", max_length=200, blank=True)
    attendees = models.ManyToManyField(USER, verbose_name="حاضران", related_name="meetings_attended", blank=True)
    summary = models.TextField("خلاصهٔ جلسه", blank=True)

    class Meta(Created.Meta):
        verbose_name = "جلسهٔ کارگروه"
        verbose_name_plural = "جلسات کارگروه"
        ordering = ("-held_at", "-pk")
        indexes = [models.Index(fields=("workgroup", "-held_at"))]


class Resolution(Created):
    title = models.CharField("عنوان مصوبه", max_length=240)
    created_by = models.ForeignKey(USER, verbose_name="ثبت‌کننده", related_name="issued_resolutions", on_delete=models.PROTECT)
    meeting = models.ForeignKey(WorkgroupMeeting, verbose_name="جلسهٔ مبدأ", on_delete=models.SET_NULL, null=True, blank=True)
    ring = models.ForeignKey(Ring, verbose_name="حلقهٔ مسئول", on_delete=models.PROTECT, null=True, blank=True)
    workgroup = models.ForeignKey(Workgroup, verbose_name="کارگروه مسئول", on_delete=models.PROTECT, null=True, blank=True)
    due_at = models.DateTimeField("مهلت انجام", default=resolution_deadline, db_index=True)
    completed_at = models.DateTimeField("زمان انجام", null=True, blank=True)
    completed_by = models.ForeignKey(USER, verbose_name="تأییدکننده", related_name="completed_resolutions",
                                     on_delete=models.PROTECT, null=True, blank=True)

    class Meta(Created.Meta):
        verbose_name = "مصوبه"
        verbose_name_plural = "مصوبات"
        constraints = [
            models.CheckConstraint(condition=Q(ring__isnull=True, workgroup__isnull=False) |
                                   Q(ring__isnull=False, workgroup__isnull=True), name="core_resolution_one_target"),
            models.CheckConstraint(condition=Q(completed_at__isnull=True, completed_by__isnull=True) |
                                   Q(completed_at__isnull=False, completed_by__isnull=False), name="core_resolution_done"),
        ]

    @property
    def is_overdue(self):
        return self.completed_at is None and self.due_at <= timezone.now()


class AnnouncementAndNotification(Created):
    sender = models.ForeignKey(USER, verbose_name="فرستنده", related_name="announcements_sent", on_delete=models.PROTECT)
    recipients = models.ManyToManyField(USER, verbose_name="گیرندگان", related_name="announcements_received")
    title = models.CharField("عنوان", max_length=200)
    body = models.TextField("متن پیام")

    class Meta(Created.Meta):
        verbose_name = "اعلان و پیام"
        verbose_name_plural = "اعلان‌ها و پیام‌ها"


class WorkgroupFeedback(Created):
    author = models.ForeignKey(USER, verbose_name="نویسنده", on_delete=models.PROTECT)
    workgroup = models.ForeignKey(Workgroup, verbose_name="کارگروه", on_delete=models.CASCADE)
    body = models.TextField("متن بازخورد")

    class Meta(Created.Meta):
        verbose_name = "بازخورد کارگروه"
        verbose_name_plural = "بازخوردهای کارگروه"


class PersonalGrowthRecord(Created):
    user = models.ForeignKey(USER, verbose_name="عضو", related_name="growth_records", on_delete=models.CASCADE)
    day = models.DateField("روز گزارش", default=timezone.localdate)
    sport_hours = models.DecimalField("ساعت ورزش", max_digits=4, decimal_places=2, default=0,
                                     validators=[MinValueValidator(0), MaxValueValidator(24)])
    reading_pages = models.PositiveIntegerField("صفحه‌های مطالعه", default=0)
    skill_title = models.CharField("عنوان مبحث مهارت", max_length=200, blank=True)
    learned = models.TextField("آموخته‌ها", blank=True)
    practice = models.TextField("تمرین عملی", blank=True)
    proof = models.FileField("مستند فعالیت", upload_to="growth/%Y/%m/", blank=True, validators=[validate_upload_size])
    responsibility = models.TextField("مسئولیت گروهی", blank=True)
    leisure = models.CharField("اوقات فراغت", max_length=100, blank=True)

    class Meta(Created.Meta):
        verbose_name = "گزارش رشد"
        verbose_name_plural = "گزارش‌های رشد"
        ordering = ("-day", "-pk")
        constraints = [
            models.UniqueConstraint(fields=("user", "day"), name="core_one_growth_per_day"),
            models.CheckConstraint(condition=Q(sport_hours__range=(0, 24)), name="core_sport_hours_range"),
        ]


class GrowthCustomItem(Created):
    record = models.ForeignKey(PersonalGrowthRecord, verbose_name="گزارش", related_name="custom_items", on_delete=models.CASCADE)
    label = models.CharField("عنوان", max_length=160)
    value = models.JSONField("مقدار")

    class Meta(Created.Meta):
        verbose_name = "آیتم رشد"
        verbose_name_plural = "آیتم‌های رشد"


class PublicArchive(Created):
    title = models.CharField("عنوان", max_length=200)
    body = models.TextField("شرح", blank=True)
    attachment = models.FileField("پیوست", upload_to="archive/%Y/%m/", blank=True, validators=[validate_upload_size])

    class Meta(Created.Meta):
        verbose_name = "سند بایگانی"
        verbose_name_plural = "بایگانی عمومی"


class CustomForm(Created):
    owner = models.ForeignKey(USER, verbose_name="سازنده", on_delete=models.PROTECT)
    workgroup = models.ForeignKey(Workgroup, verbose_name="کارگروه", on_delete=models.PROTECT)
    title = models.CharField("عنوان", max_length=200)
    questions = models.JSONField("تعریف پرسش‌ها", default=list)
    is_open = models.BooleanField("پذیرش پاسخ", default=True)

    class Meta(Created.Meta):
        verbose_name = "فرم سفارشی"
        verbose_name_plural = "فرم‌های سفارشی"


class CustomFormResponse(Created):
    form = models.ForeignKey(CustomForm, verbose_name="فرم", related_name="responses", on_delete=models.CASCADE)
    respondent = models.ForeignKey(USER, verbose_name="پاسخ‌دهنده", on_delete=models.CASCADE)
    answers = models.JSONField("پاسخ‌ها", default=dict)

    class Meta(Created.Meta):
        verbose_name = "پاسخ فرم"
        verbose_name_plural = "پاسخ‌های فرم"


class Post(Created):
    class Kind(models.TextChoices):
        NORMAL = "normal", "عادی"
        RING = "ring", "برنامهٔ حلقه"
        MEETING = "meeting", "جلسهٔ کارگروه"
        COACH = "coach", "پست مربی"
        GROWTH = "growth", "رشد فردی"

    author = models.ForeignKey(USER, verbose_name="نویسنده", related_name="posts", on_delete=models.PROTECT)
    kind = models.CharField("نوع پست", max_length=12, choices=Kind, default=Kind.NORMAL)
    body = models.TextField("متن", blank=True)
    attachment = models.FileField("رسانه یا فایل", upload_to="posts/%Y/%m/", blank=True, validators=[validate_upload_size])
    hashtags = models.JSONField("هشتگ‌ها", default=list, blank=True)
    ring = models.ForeignKey(Ring, verbose_name="حلقهٔ برگزارکننده", on_delete=models.PROTECT, null=True, blank=True)
    meeting = models.OneToOneField(WorkgroupMeeting, verbose_name="جلسه", on_delete=models.CASCADE, null=True, blank=True)
    growth_record = models.OneToOneField(PersonalGrowthRecord, verbose_name="گزارش رشد", on_delete=models.CASCADE, null=True, blank=True)
    location = models.CharField("محل برنامهٔ حلقه", max_length=200, blank=True)
    attendees = models.ManyToManyField(USER, verbose_name="حاضران برنامهٔ حلقه", related_name="ring_programs_attended", blank=True)
    deleted_at = models.DateTimeField("زمان حذف", null=True, blank=True)

    class Meta(Created.Meta):
        verbose_name = "پست"
        verbose_name_plural = "پست‌ها"
        indexes = [models.Index(fields=("-created_at", "-id"), condition=Q(deleted_at__isnull=True), name="core_live_feed")]
        constraints = [
            models.CheckConstraint(
                condition=Q(kind="ring", ring__isnull=False, meeting__isnull=True, growth_record__isnull=True)
                | Q(kind="meeting", ring__isnull=True, meeting__isnull=False, growth_record__isnull=True)
                | Q(kind="growth", ring__isnull=True, meeting__isnull=True, growth_record__isnull=False)
                | Q(kind__in=("normal", "coach"), ring__isnull=True, meeting__isnull=True, growth_record__isnull=True),
                name="core_post_source",
            )
        ]


class Reel(Created):
    author = models.ForeignKey(USER, verbose_name="سازنده", related_name="reels", on_delete=models.PROTECT)
    video = models.FileField("ویدئو", upload_to="reels/%Y/%m/", validators=[validate_upload_size])
    caption = models.TextField("توضیح", blank=True)
    published_at = models.DateTimeField("زمان انتشار", null=True, blank=True)

    class Meta(Created.Meta):
        verbose_name = "ریلز"
        verbose_name_plural = "ریلزها"
        indexes = [models.Index(fields=("-published_at",))]


class ReelView(Created):
    reel = models.ForeignKey(Reel, verbose_name="ریلز", related_name="views", on_delete=models.CASCADE)
    user = models.ForeignKey(USER, verbose_name="بیننده", on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.UUIDField("شناسهٔ آماری نشست")

    class Meta(Created.Meta):
        verbose_name = "بازدید ریلز"
        verbose_name_plural = "بازدیدهای ریلز"
        indexes = [models.Index(fields=("reel", "-created_at"))]


class UserInteraction(Created):
    user = models.ForeignKey(USER, verbose_name="کاربر", on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.UUIDField("شناسهٔ آماری نشست", db_index=True)
    page = models.CharField("مسیر صفحه", max_length=200)
    section = models.CharField("بخش", max_length=120, blank=True)
    element_type = models.CharField("نوع المان", max_length=64, blank=True)
    element_id = models.CharField("شناسهٔ المان", max_length=120, blank=True)
    action = models.CharField("عمل", max_length=64)
    metadata = models.JSONField("اطلاعات تکمیلی", default=dict, blank=True)

    class Meta(Created.Meta):
        verbose_name = "تعامل کاربر"
        verbose_name_plural = "تعامل‌های کاربران"
        indexes = [models.Index(fields=("user", "-created_at")), models.Index(fields=("page", "action", "-created_at"))]


class LandingContent(Created):
    workgroup = models.ForeignKey(Workgroup, verbose_name="کارگروه", related_name="landing_cards", on_delete=models.PROTECT)
    author = models.ForeignKey(USER, verbose_name="مسئول ثبت", on_delete=models.PROTECT)
    title = models.CharField("عنوان کارت", max_length=200)
    body = models.TextField("متن کارت", blank=True)
    content = models.JSONField("دادهٔ ساختاریافتهٔ کارت", default=dict, blank=True)
    attachment = models.FileField("پیوست", upload_to="landing/%Y/%m/", blank=True, validators=[validate_upload_size])
    published_at = models.DateTimeField("زمان انتشار", null=True, blank=True)

    class Meta(Created.Meta):
        verbose_name = "کارت داشبورد"
        verbose_name_plural = "کارت‌های داشبورد"
        ordering = ("-published_at", "-pk")


class AIUsageLog(Created):
    user = models.ForeignKey(USER, verbose_name="کاربر", null=True, on_delete=models.SET_NULL)
    model_name = models.CharField("نام مدل", max_length=100)
    input_tokens = models.PositiveIntegerField("توکن ورودی", default=0)
    output_tokens = models.PositiveIntegerField("توکن خروجی", default=0)
    duration_ms = models.PositiveIntegerField("زمان پاسخ به میلی‌ثانیه", null=True, blank=True)
    succeeded = models.BooleanField("موفق", default=True)

    class Meta(Created.Meta):
        verbose_name = "گزارش مصرف هوش مصنوعی"
        verbose_name_plural = "گزارش‌های مصرف هوش مصنوعی"


class PostLike(Created):
    post = models.ForeignKey(Post, verbose_name="پست", related_name="likes", on_delete=models.CASCADE)
    user = models.ForeignKey(USER, verbose_name="کاربر", on_delete=models.CASCADE)
    counts_for_ring = models.BooleanField("پسند عضو بیرون از حلقه در زمان ثبت", default=False, editable=False)

    class Meta(Created.Meta):
        verbose_name = "پسند پست"
        verbose_name_plural = "پسندهای پست"
        constraints = [models.UniqueConstraint(fields=("post", "user"), name="core_unique_postlike")]


class PostRecommendation(Created):
    post = models.ForeignKey(Post, verbose_name="پست", related_name="recommendations", on_delete=models.CASCADE)
    user = models.ForeignKey(USER, verbose_name="کاربر", on_delete=models.CASCADE)

    class Meta(Created.Meta):
        verbose_name = "پیشنهاد به مربی"
        verbose_name_plural = "پیشنهادهای پست به مربی"
        constraints = [models.UniqueConstraint(fields=("post", "user"), name="core_unique_postrecommendation")]


class ReelLike(Created):
    reel = models.ForeignKey(Reel, verbose_name="ریلز", related_name="likes", on_delete=models.CASCADE)
    user = models.ForeignKey(USER, verbose_name="کاربر", on_delete=models.CASCADE)

    class Meta(Created.Meta):
        verbose_name = "پسند ریلز"
        verbose_name_plural = "پسندهای ریلز"
        constraints = [models.UniqueConstraint(fields=("reel", "user"), name="core_unique_reellike")]


class PostComment(Created):
    post = models.ForeignKey(Post, verbose_name="پست", related_name="comments", on_delete=models.CASCADE)
    user = models.ForeignKey(USER, verbose_name="کاربر", on_delete=models.CASCADE)
    body = models.TextField("متن دیدگاه")
    parent = models.ForeignKey("self", verbose_name="پاسخ به", related_name="replies",
                               on_delete=models.CASCADE, null=True, blank=True)

    class Meta(Created.Meta):
        verbose_name = "دیدگاه پست"
        verbose_name_plural = "دیدگاه‌های پست"
        ordering = ("created_at", "pk")

    def clean(self):
        super().clean()
        if self.parent_id and (self.parent_id == self.pk or self.parent.post_id != self.post_id or self.parent.parent_id):
            raise ValidationError({"parent": "پاسخ باید به یک دیدگاه اصلی همین پست تعلق داشته باشد."})


class ReelComment(Created):
    reel = models.ForeignKey(Reel, verbose_name="ریلز", related_name="comments", on_delete=models.CASCADE)
    user = models.ForeignKey(USER, verbose_name="کاربر", on_delete=models.CASCADE)
    body = models.TextField("متن دیدگاه")
    parent = models.ForeignKey("self", verbose_name="پاسخ به", related_name="replies",
                               on_delete=models.CASCADE, null=True, blank=True)

    class Meta(Created.Meta):
        verbose_name = "دیدگاه ریلز"
        verbose_name_plural = "دیدگاه‌های ریلز"
        ordering = ("created_at", "pk")

    def clean(self):
        super().clean()
        if self.parent_id and (self.parent_id == self.pk or self.parent.reel_id != self.reel_id or self.parent.parent_id):
            raise ValidationError({"parent": "پاسخ باید به یک دیدگاه اصلی همین ریلز تعلق داشته باشد."})
