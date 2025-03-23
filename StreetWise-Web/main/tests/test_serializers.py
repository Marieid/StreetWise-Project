from django.test import TestCase
from main.serializers import IncidentSerializer
from datetime import datetime


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
        self.assertEqual(serializer.validated_data['type'], 'Accident')

    def test_missing_field(self):
        data = {
            'type': 'Accident',
            'location': {'latitude': 10.0, 'longitude': 20.0},
            # Missing timestamp.
            'userId': 'dummyuid'
        }
        serializer = IncidentSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('timestamp', serializer.errors)
