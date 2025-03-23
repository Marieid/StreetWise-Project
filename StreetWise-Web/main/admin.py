# admin.py

from django.contrib import admin
from .models import Feedback, Organization, AccessRequest, Incident, Archived, UserFeedback

admin.site.register(Feedback)
admin.site.register(Organization)
admin.site.register(AccessRequest)
admin.site.register(Incident)
admin.site.register(Archived)
admin.site.register(UserFeedback)
