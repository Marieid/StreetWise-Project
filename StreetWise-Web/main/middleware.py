import firebase_admin
from firebase_admin import auth
from django.http import HttpResponseForbidden
from django.urls import resolve


class FirebaseAuthMiddleware:
    # Public web pages that should be accessible without a token.
    PUBLIC_PATHS = ["/", "/info", "/data_analysis",
                    "/login", "/download_app", "/static/"]
    # Public API endpoints for GET requests (read-only).
    PUBLIC_API_PATHS = ["/api/incidents", "/api/incidents/count-by-type",
                        "/api/incidents/count-by-day", "/api/incidents/trends"]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        current_path = request.path

        # If current path is explicitly public, allow.
        if current_path in self.PUBLIC_PATHS:
            return self.get_response(request)

        # If current path starts with one of the public paths, allow.
        if any(current_path.startswith(path) for path in self.PUBLIC_PATHS):
            return self.get_response(request)

        # For API endpoints that are GET-only and public, allow without a token.
        if request.method == "GET" and any(current_path.startswith(path) for path in self.PUBLIC_API_PATHS):
            return self.get_response(request)

        # Allow Django session-authenticated users.
        if request.user.is_authenticated:
            return self.get_response(request)

        # Otherwise, enforce Firebase token authentication.
        authorization_header = request.META.get("HTTP_AUTHORIZATION")
        if not authorization_header or "Bearer " not in authorization_header:
            return HttpResponseForbidden("Invalid or missing authorization token")

        try:
            token = authorization_header.split("Bearer ")[-1]
            decoded_token = auth.verify_id_token(token)
            request.firebase_user_id = decoded_token.get("uid")
        except Exception:
            return HttpResponseForbidden("Invalid authorization token")

        return self.get_response(request)
