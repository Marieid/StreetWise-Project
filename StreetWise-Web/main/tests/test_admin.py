from django.test import TestCase
from django.contrib import admin
from main.models import Feedback, Organization, AccessRequest


class AdminSiteTests(TestCase):
    def test_feedback_admin_registered(self):
        self.assertIn(Feedback, admin.site._registry)

    def test_organization_admin_registered(self):
        self.assertIn(Organization, admin.site._registry)

    def test_access_request_admin_registered(self):
        self.assertIn(AccessRequest, admin.site._registry)
