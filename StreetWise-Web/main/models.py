from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User


class Feedback(models.Model):
    user_id = models.CharField(max_length=100, blank=True, null=True)
    safety_perception = models.IntegerField(default=0)
    app_usage_frequency = models.CharField(max_length=100, default='Unknown')
    route_changed = models.BooleanField(default=False)
    most_useful_features = models.TextField(blank=True, null=True, default='')
    improvements_suggested = models.TextField(default='No suggestions')
    other_comments = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Feedback from {self.user_id or 'Anonymous'}"


class Organization(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    email = models.EmailField()
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    approved = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class AccessRequest(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    request_date = models.DateTimeField(default=timezone.now)
    purpose = models.TextField()  # Why they need access to the data
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("approved", "Approved"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )

    def __str__(self):
        return f"{self.organization.name} - {self.status}"


class Incident(models.Model):
    firestore_id = models.CharField(
        max_length=255, blank=True, null=True, unique=True)

    type = models.CharField(max_length=255)
    # { "latitude": <float>, "longitude": <float> }
    location = models.JSONField()
    comment = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True
    )

    def __str__(self):
        return f"{self.type} at {self.timestamp}"


class Archived(models.Model):
    firestore_id = models.CharField(
        max_length=255, blank=True, null=True, unique=True)

    type = models.CharField(max_length=255)
    # { "latitude": <float>, "longitude": <float> }
    location = models.JSONField()
    comment = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True
    )

    def __str__(self):
        return f"{self.type} at {self.timestamp}"


class UserFeedback(models.Model):
    # Add a Firestore doc reference for uniqueness
    firestore_id = models.CharField(
        max_length=255, blank=True, null=True, unique=True
    )

    # If you want a real Django user link, you must figure out how to match them
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Feedback {self.pk} from user {self.user.username if self.user else 'unknown'}"


class UserProfile(models.Model):
    user_id = models.CharField(max_length=255, unique=True)
    display_name = models.CharField(max_length=100, blank=True)
    photo_url = models.CharField(max_length=255, blank=True)
    credibility_score = models.IntegerField(default=100)
    preferred_data_visualization = models.CharField(
        max_length=20,
        choices=[("bar", "Bar Chart"), ("line", "Line Chart"),
                 ("heatmap", "Heatmap")],
        default="bar",
    )
    receive_notifications = models.BooleanField(default=True)

    def __str__(self):
        return self.display_name or self.user_id
