from django.test import TestCase
from main.models import Feedback, Organization, AccessRequest, Incident, UserProfile
from main.serializers import IncidentSerializer
from datetime import datetime
from django.utils import timezone


class IncidentSerializerTests(TestCase):
    def test_valid_data(self):
        data = {
            'type': 'Accident',
            'location': {'latitude': 10.0, 'longitude': 20.0},
            'comment': 'Test incident',
            'timestamp': datetime.utcnow().isoformat(),
            'userId': 'dummyuid'
        }
        serializer = IncidentSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        # Check that validated data contains expected keys.
        self.assertEqual(serializer.validated_data['type'], 'Accident')

    def test_missing_field(self):
        data = {
            'type': 'Accident',
            'location': {'latitude': 10.0, 'longitude': 20.0},
            # 'timestamp' is missing.
            'userId': 'dummyuid'
        }
        serializer = IncidentSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('timestamp', serializer.errors)


class FeedbackModelTests(TestCase):
    def test_str_representation(self):
        feedback = Feedback(user_id="dummyuid", created_at=timezone.now())
        self.assertIn("dummyuid", str(feedback))


class OrganizationModelTests(TestCase):
    def test_str_representation(self):
        org = Organization(
            name="Test Org", contact_person="John Doe", email="john@example.com")
        self.assertEqual(str(org), "Test Org")


class AccessRequestModelTests(TestCase):
    def test_str_representation(self):
        org = Organization(
            name="Test Org", contact_person="John Doe", email="john@example.com")
        access_req = AccessRequest(organization=org, purpose="Testing")
        self.assertIn("Test Org", str(access_req))


class IncidentModelTests(TestCase):
    def test_str_representation(self):
        incident = Incident(type="Accident", location={
                            'latitude': 10, 'longitude': 20})
        self.assertIn("Accident", str(incident))


class UserProfileModelTests(TestCase):
    def test_str_representation(self):
        profile = UserProfile(user_id="dummyuid", display_name="Test User")
        self.assertEqual(str(profile), "Test User")
