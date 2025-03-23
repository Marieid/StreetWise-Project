from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from unittest.mock import patch, MagicMock
import firebase_admin

# Bypass the FirebaseAuthMiddleware for public view tests.


@patch('main.middleware.FirebaseAuthMiddleware.__call__', lambda self, request: self.get_response(request))
class TemplateViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='testpassword'
        )

    def test_index_view(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(
            response, 'community-driven pedestrian safety platform')

    def test_info_view(self):
        response = self.client.get(reverse('info'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Our Mission')

    def test_data_analysis_view(self):
        response = self.client.get(reverse('data_analysis'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Data Analysis')

    def test_download_app_view(self):
        response = self.client.get(reverse('download_app'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Download the Mobile App')

    def test_logout_view(self):
        self.client.login(username='testuser@example.com',
                          password='testpassword')
        response = self.client.get(reverse('logout'))
        self.assertEqual(response.status_code, 302)


@patch('main.middleware.FirebaseAuthMiddleware.__call__', lambda self, request: self.get_response(request))
class LoginViewTests(TestCase):
    def setUp(self):
        self.client = Client()

    @patch('main.views.firebase_auth.get_user_by_email')
    @patch('main.views.db.collection')
    def test_login_post_success(self, mock_db_collection, mock_get_user_by_email):
        mock_user_record = MagicMock()
        mock_user_record.uid = 'dummyuid'
        mock_user_record.email = 'testuser@example.com'
        mock_user_record.display_name = 'Test User'
        mock_get_user_by_email.return_value = mock_user_record

        post_data = {
            'username': 'testuser@example.com',
            'password': 'any_password'
        }
        response = self.client.post(reverse('login'), post_data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse('index'))

    @patch('main.views.firebase_auth.get_user_by_email')
    def test_login_post_invalid(self, mock_get_user_by_email):
        mock_get_user_by_email.side_effect = firebase_admin.auth.UserNotFoundError(
            'User not found')
        post_data = {
            'username': 'nonexistent@example.com',
            'password': 'any_password'
        }
        response = self.client.post(reverse('login'), post_data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Invalid credentials')
