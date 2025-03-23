from django.test import TestCase, RequestFactory
from django.http import HttpResponseForbidden
from django.contrib.auth.models import AnonymousUser
from unittest.mock import patch
from main.middleware import FirebaseAuthMiddleware


class FirebaseAuthMiddlewareTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.get_response = lambda request: request  # Dummy view

    @patch('main.middleware.auth.verify_id_token', return_value={"uid": "dummyuid"})
    def test_valid_token(self, mock_verify):
        request = self.factory.get('/private/')
        request.META['HTTP_AUTHORIZATION'] = 'Bearer valid_token'
        request.user = AnonymousUser()
        middleware = FirebaseAuthMiddleware(self.get_response)
        response = middleware(request)
        self.assertEqual(response, request)
        self.assertEqual(
            getattr(request, 'firebase_user_id', None), "dummyuid")

    def test_missing_token(self):
        request = self.factory.get('/private/')
        request.user = AnonymousUser()
        middleware = FirebaseAuthMiddleware(self.get_response)
        response = middleware(request)
        self.assertTrue(isinstance(response, HttpResponseForbidden))
        self.assertEqual(response.content.decode(),
                         "Invalid or missing authorization token")
