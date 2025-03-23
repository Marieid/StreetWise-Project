from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from unittest.mock import patch, MagicMock
import firebase_admin

# For tests where we want the view logic to run normally, bypass the middleware.


@patch('main.middleware.FirebaseAuthMiddleware.__call__', lambda self, request: self.get_response(request))
class ProfileViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='testpassword'
        )
        self.client.login(username='testuser@example.com',
                          password='testpassword')

    @patch('main.views.db.collection')
    @patch('main.views.firebase_auth.get_user_by_email')
    def test_profile_view_success(self, mock_get_user_by_email, mock_db_collection):
        mock_user_record = MagicMock()
        mock_user_record.uid = 'testuid'
        mock_user_record.email = 'testuser@example.com'
        mock_get_user_by_email.return_value = mock_user_record

        mock_user_doc = {
            'displayName': 'Test User',
            'credibilityScore': 100,
            'photoURL': 'http://example.com/photo.jpg',
            'createdAt': '2025-03-20T10:04:00Z'
        }
        doc_instance = MagicMock()
        doc_instance.exists = True
        doc_instance.to_dict.return_value = mock_user_doc
        mock_db_collection.return_value.document.return_value.get.return_value = doc_instance

        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test User')
        self.assertContains(response, 'testuser@example.com')
        self.assertContains(response, '100')
        self.assertContains(response, 'http://example.com/photo.jpg')
        self.assertContains(response, '2025-03-20T10:04:00Z')

    # For redirect behavior, do not bypass middleware.
    def test_profile_view_redirect_if_not_logged_in(self):
        self.client.logout()
        response = self.client.get(reverse('profile'))
        self.assertRedirects(response, '/login/?next=/profile/')

    @patch('main.views.firebase_auth.get_user_by_email')
    def test_profile_view_no_firebase_user(self, mock_get_user_by_email):
        mock_get_user_by_email.side_effect = firebase_admin.auth.UserNotFoundError(
            'User not found')
        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, 403)

    @patch('main.views.db.collection')
    @patch('main.views.firebase_auth.get_user_by_email')
    def test_profile_view_no_firestore_data(self, mock_get_user_by_email, mock_db_collection):
        mock_user_record = MagicMock()
        mock_user_record.uid = 'dummyuid'
        mock_user_record.email = 'testuser@example.com'
        mock_get_user_by_email.return_value = mock_user_record

        doc_instance = MagicMock()
        doc_instance.exists = False
        mock_db_collection.return_value.document.return_value.get.return_value = doc_instance

        response = self.client.get(reverse('profile'))
        self.assertRedirects(response, reverse('download_app'))
