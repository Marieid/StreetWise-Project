from datetime import datetime
from unittest.mock import MagicMock, patch
from django.urls import reverse
from rest_framework.test import APITestCase
from main import api_views

# Dummy class to mimic Firestore timestamp


class DummyTimestamp:
    def __init__(self, dt):
        self.dt = dt

    def to_pydatetime(self):
        return self.dt

    def isoformat(self):
        return self.dt.isoformat()

    def replace(self, **kwargs):
        return self.dt.replace(**kwargs)


class IncidentsAPITests(APITestCase):
    @patch.object(api_views.auth, "verify_id_token", return_value={"uid": "dummyuid"})
    @patch.object(api_views.db, "collection")
    def test_get_incident_counts_by_day(self, mock_collection, mock_verify):
        dummy_doc = MagicMock()
        dummy_datetime = datetime(2025, 3, 20, 10, 0, 0)
        dummy_incident = {
            'type': 'Accident',
            'location': {'latitude': 10.0, 'longitude': 20.0},
            'comment': 'Test incident',
            'timestamp': DummyTimestamp(dummy_datetime),
            'userId': 'dummyuid'
        }
        dummy_doc.to_dict.return_value = dummy_incident
        mock_collection.return_value.stream.return_value = [dummy_doc]

        url = reverse('get_incident_counts_by_day')
        response = self.client.get(
            url, HTTP_AUTHORIZATION="Bearer valid_token")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(response.data[0]['date'], '2025-03-20')
        self.assertEqual(response.data[0]['count'], 1)

    @patch.object(api_views.auth, "verify_id_token", return_value={"uid": "dummyuid"})
    @patch.object(api_views.db, "collection")
    def test_get_incidents_no_filters(self, mock_collection, mock_verify):
        dummy_doc = MagicMock()
        dummy_datetime = datetime.utcnow()
        dummy_incident = {
            'type': 'Accident',
            'location': {'latitude': 10.0, 'longitude': 20.0},
            'comment': 'Test incident',
            'timestamp': DummyTimestamp(dummy_datetime),
            'userId': 'dummyuid'
        }
        dummy_doc.to_dict.return_value = dummy_incident
        mock_collection.return_value.where.return_value = mock_collection.return_value
        mock_collection.return_value.stream.return_value = [dummy_doc]

        url = reverse('get_incidents')
        response = self.client.get(
            url, HTTP_AUTHORIZATION="Bearer valid_token")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['type'], 'Accident')
        self.assertEqual(
            response.data[0]['timestamp'], dummy_datetime.isoformat())
