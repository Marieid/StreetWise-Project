from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from unittest.mock import patch, MagicMock
import firebase_admin
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth.models import User
from unittest.mock import patch, MagicMock
from firebase_admin import auth as firebase_auth
from .models import UserProfile


class TemplateViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser', email='testuser@example.com', password='testpassword')

    def test_index_view(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Welcome to StreetWise')

    def test_login_view(self):
        response = self.client.get(reverse('login'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Login')

    def test_logout_view(self):
        self.client.login(username='testuser', password='testpassword')
        response = self.client.get(reverse('logout'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'You have been logged out.')

    def test_profile_view(self):
        self.client.login(username='testuser', password='testpassword')
        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'User Profile')

    def test_download_app_view(self):
        response = self.client.get(reverse('download_app'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Download the Mobile App')

    def test_data_analysis_view(self):
        response = self.client.get(reverse('data_analysis'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'StreetWise Data Analysis')

    def test_info_view(self):
        response = self.client.get(reverse('info'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'About StreetWise')


class ProfileViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser', email='testuser@example.com', password='testpassword')
        self.client.login(username='testuser', password='testpassword')

    @patch('main.views.db.collection')
    @patch('main.views.firebase_auth.get_user_by_email')
    def test_profile_view(self, mock_get_user_by_email, mock_db_collection):
        # Mock Firestore user document
        mock_user_record = MagicMock()
        mock_user_record.uid = 'testuid'
        mock_user_record.email = 'testuser@example.com'
        mock_get_user_by_email.return_value = mock_user_record

        # Mock Firestore user data
        mock_user_doc = {
            'displayName': 'Test User',
            'credibilityScore': 100,
            'photoURL': 'http://example.com/photo.jpg',
            'createdAt': '2025-03-20T10:04:00Z'
        }
        mock_db_collection.return_value.document.return_value.get.return_value.to_dict.return_value = mock_user_doc

        response = self.client.get(reverse('profile'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test User')
        self.assertContains(response, 'testuser@example.com')
        self.assertContains(response, '100')
        self.assertContains(response, 'http://example.com/photo.jpg')
        self.assertContains(response, '2025-03-20T10:04:00Z')

    def test_profile_view_redirect_if_not_logged_in(self):
        self.client.logout()
        response = self.client.get(reverse('profile'))
        self.assertRedirects(response, '/login/?next=/profile/')

    @patch('main.views.db.collection')
    @patch('main.views.firebase_auth.get_user_by_email')
    def test_profile_view_no_firestore_user(self, mock_get_user_by_email, mock_db_collection):
        # Mock Firestore user document not found
        mock_get_user_by_email.side_effect = firebase_admin.auth.UserNotFoundError(
            'User not found')

        response = self.client.get(reverse('profile'))

        self.assertEqual(response.status_code, 403)
        self.assertContains(response, 'Firebase user not found.')

    @patch('main.views.db.collection')
    @patch('main.views.firebase_auth.get_user_by_email')
    def test_profile_view_no_user_data(self, mock_get_user_by_email, mock_db_collection):
        # Mock Firestore user document
        mock_user_record = MagicMock()
        mock_user_record.uid = 'testuid'
        mock_user_record.email = 'testuser@example.com'
        mock_get_user_by_email.return_value = mock_user_record

        # Mock Firestore user data not found
        mock_db_collection.return_value.document.return_value.get.return_value.exists.return_value = False

        response = self.client.get(reverse('profile'))

        self.assertRedirects(response, reverse('download_app'))


class IncidentsAPITests(APITestCase):
    def test_get_incidents_no_filters(self):
        url = reverse('get_incidents')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)

    def test_get_incidents_with_type_filter(self):
        url = reverse('get_incidents')
        response = self.client.get(url, {'type': 'Accident'})
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        # Check if all incidents in response have type 'Poor ligting'
        self.assertTrue(all(incident['type'] == 'Poor lighting' for incident in response.data))