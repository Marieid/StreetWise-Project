import json
from datetime import timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from main.models import Incident
from unittest.mock import patch

# Bypass FirebaseAuthMiddleware for these API trend tests.


@patch('main.middleware.FirebaseAuthMiddleware.__call__', lambda self, request: self.get_response(request))
class IncidentTrendsAPITests(TestCase):
    def setUp(self):
        now = timezone.now()
        # Create several Incident objects within the past 30 days.
        for i in range(5):
            Incident.objects.create(
                type="Accident",
                location={'latitude': 10 + i, 'longitude': 20 + i},
                comment=f"Incident {i}",
                timestamp=now - timedelta(days=i)
            )

    def test_get_incident_trends(self):
        url = reverse('get_incident_trends')
        response = self.client.get(url)
        # Expect a 200 now since we've bypassed the middleware.
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIsInstance(data, list)
        # Check that each element has 'date' and 'count' keys.
        if data:
            self.assertIn('date', data[0])
            self.assertIn('count', data[0])
