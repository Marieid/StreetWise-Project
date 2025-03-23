# main/tasks.py
from celery import shared_task
from django.core.management import call_command


@shared_task
def sync_firestore_task():
    # This will run the 'sync_firestore' management command.
    call_command('sync_firestore')
