from django.core.management.base import BaseCommand
from django.utils import timezone
from firebase_admin import firestore
from main.models import Incident, Archived, UserFeedback
import pytz

db = firestore.client()


class Command(BaseCommand):
    help = "Sync Firestore data into Django's local database."

    def handle(self, *args, **options):
        self.stdout.write("Starting Firestore → Django sync...")

        self.sync_incidents()
        self.sync_archived()
        self.sync_userfeedback()
        # Optionally, sync users if needed:
        # self.sync_users()

        self.stdout.write("Sync complete.")

    def sync_incidents(self):
        incidents_ref = db.collection("incidents")
        docs = incidents_ref.stream()

        count_created = 0
        count_updated = 0

        for doc in docs:
            data = doc.to_dict()
            ts = data.get("timestamp")
            if hasattr(ts, "to_datetime"):
                ts = ts.to_datetime()
            elif hasattr(ts, "to_pydatetime"):
                ts = ts.to_pydatetime()

            if ts and ts.tzinfo is None:
                ts = pytz.UTC.localize(ts)

            incident_defaults = {
                "type": data.get("type", "Unknown"),
                "location": data.get("location", {}),
                "comment": data.get("comment", ""),
                "timestamp": ts if ts else timezone.now(),
            }

            obj, created = Incident.objects.update_or_create(
                firestore_id=doc.id,
                defaults=incident_defaults
            )
            if created:
                count_created += 1
            else:
                count_updated += 1

        self.stdout.write(
            f"Incidents synced. Created={count_created}, Updated={count_updated}"
        )

    def sync_archived(self):
        archived_ref = db.collection("archived")
        docs = archived_ref.stream()

        count_created = 0
        count_updated = 0

        for doc in docs:
            data = doc.to_dict()
            ts = data.get("timestamp")
            if hasattr(ts, "to_datetime"):
                ts = ts.to_datetime()
            elif hasattr(ts, "to_pydatetime"):
                ts = ts.to_pydatetime()

            if ts and ts.tzinfo is None:
                ts = pytz.UTC.localize(ts)

            archived_defaults = {
                "type": data.get("type", "Unknown"),
                "location": data.get("location", {}),
                "comment": data.get("comment", ""),
                "timestamp": ts if ts else timezone.now(),
            }

            obj, created = Archived.objects.update_or_create(
                firestore_id=doc.id,
                defaults=archived_defaults
            )
            if created:
                count_created += 1
            else:
                count_updated += 1

        self.stdout.write(
            f"Archived synced. Created={count_created}, Updated={count_updated}"
        )

    def sync_userfeedback(self):
        userfeedback_ref = db.collection("userfeedback")
        docs = userfeedback_ref.stream()

        count_created = 0
        count_updated = 0

        for doc in docs:
            data = doc.to_dict()

            ts = data.get("timestamp")
            if hasattr(ts, "to_datetime"):
                ts = ts.to_datetime()
            elif hasattr(ts, "to_pydatetime"):
                ts = ts.to_pydatetime()
            if ts and ts.tzinfo is None:
                ts = pytz.UTC.localize(ts)

            # We leave user as None since we're not syncing Django users
            userfeedback_defaults = {
                "user": None,
                "comment": data.get("comment", ""),
                "timestamp": ts if ts else timezone.now(),
            }

            obj, created = UserFeedback.objects.update_or_create(
                firestore_id=doc.id,
                defaults=userfeedback_defaults
            )
            if created:
                count_created += 1
            else:
                count_updated += 1

        self.stdout.write(
            f"UserFeedback synced. Created={count_created}, Updated={count_updated}"
        )
