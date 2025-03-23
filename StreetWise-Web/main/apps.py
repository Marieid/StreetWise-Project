from django.apps import AppConfig
import firebase_admin
from firebase_admin import credentials
import json
import os
import logging

logger = logging.getLogger(__name__)


class MainConfig(AppConfig):
    name = 'main'

    def ready(self):
        try:
            firebase_service_account_key = os.environ.get(
                "FIREBASE_SERVICE_ACCOUNT_KEY")
            if firebase_service_account_key:
                firebase_service_account_key = json.loads(
                    firebase_service_account_key)
                cred = credentials.Certificate(firebase_service_account_key)
                if not firebase_admin._apps:
                    firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin SDK initialized successfully.")
            else:
                logger.error("Firebase service account key not found.")
        except Exception as e:
            logger.error("Error initializing Firebase Admin SDK: %s", e)
