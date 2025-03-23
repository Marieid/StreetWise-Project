import os
from django.shortcuts import render
from django.conf import settings
from django.shortcuts import render, redirect
from django.http import HttpResponseForbidden, JsonResponse
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import IncidentSerializer
from datetime import datetime, timedelta
import math
from django.db.models import Count
from .models import Incident
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

db = firestore.client()


@api_view(["GET"])
def get_incidents(request):
    """
    API endpoint to retrieve incidents from Firestore.
    Supports filtering by type, date range, and location.
    Requires Firebase Authentication.
    """
    try:
        incidents_ref = db.collection("incidents")
        query = incidents_ref

        # Filter by type
        incident_type = request.query_params.get("type")
        if incident_type:
            query = query.where("type", "==", incident_type)

        # Filter by date range
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")
        if start_date_str:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
            query = query.where("timestamp", ">=", start_date)
        if end_date_str:
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
            end_date = end_date + timedelta(days=1)  # Include the end date
            query = query.where("timestamp", "<", end_date)

        # Filter by location (within a radius)
        latitude = request.query_params.get("latitude")
        longitude = request.query_params.get("longitude")
        radius = request.query_params.get("radius")  # in kilometers
        if latitude and longitude and radius:
            latitude = float(latitude)
            longitude = float(longitude)
            radius = float(radius)

            # Simple approximate filtering
            lat_diff = radius / 111  # 1 degree of latitude is approx. 111 km
            lon_diff = radius / (111 * math.cos(math.radians(latitude)))
            query = query.where("location.latitude", ">=", latitude - lat_diff)
            query = query.where("location.latitude", "<=", latitude + lat_diff)
            query = query.where("location.longitude",
                                ">=", longitude - lon_diff)
            query = query.where("location.longitude",
                                "<=", longitude + lon_diff)

        docs = query.stream()
        incidents = []
        for doc in docs:
            incident = doc.to_dict()
            # Convert timestamp to ISO format string
            incident["timestamp"] = incident["timestamp"].isoformat()
            incidents.append(incident)

        serializer = IncidentSerializer(incidents, many=True)
        return Response(serializer.data)

    except Exception as e:
        return Response(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def get_incident_counts_by_type(request):
    """
    API endpoint to retrieve incident counts grouped by type.
    """
    try:
        # Get incidents from Firestore (you might want to add date filtering here)
        incidents_ref = db.collection("incidents")
        docs = incidents_ref.stream()

        # Aggregate incident counts by type
        counts_by_type = {}
        for doc in docs:
            incident = doc.to_dict()
            incident_type = incident.get("type")
            if incident_type:
                counts_by_type[incident_type] = (
                    counts_by_type.get(incident_type, 0) + 1
                )

        # Format data for response
        data = [
            {"type": incident_type, "count": count}
            for incident_type, count in counts_by_type.items()
        ]

        return Response(data)

    except Exception as e:
        return Response(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def get_incident_counts_by_day(request):
    """
    API endpoint to retrieve incident counts grouped by day.
    """
    try:
        # Get incidents from Firestore (you might want to add date filtering here)
        incidents_ref = db.collection("incidents")
        docs = incidents_ref.stream()

        # Aggregate incident counts by day
        counts_by_day = {}
        for doc in docs:
            incident = doc.to_dict()
            timestamp = incident.get("timestamp")
            if timestamp:
                # Convert Firestore Timestamp to Python datetime
                # Use .replace(tzinfo=None) to remove timezone info if needed
                python_datetime = timestamp.replace(tzinfo=None)

                # Format date as 'YYYY-MM-DD'
                date_str = python_datetime.strftime("%Y-%m-%d")
                counts_by_day[date_str] = counts_by_day.get(date_str, 0) + 1

        # Format data for response
        data = [
            {"date": date_str, "count": count}
            for date_str, count in counts_by_day.items()
        ]

        return Response(data)

    except Exception as e:
        return Response(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def get_incident_trends(request):
    """
    Hybrid approach: Query Firestore for incidents from both the 'incidents'
    and 'archived' collections (i.e. those that are still relevant in the past 30 days),
    then perform aggregation in Python to return trends over time.
    """
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        logger.info(f"Fetching incidents from {start_date} to {end_date}")

        # Query the "incidents" collection within the date range using positional arguments.
        incidents_query = db.collection("incidents") \
            .where("timestamp", ">=", start_date) \
            .where("timestamp", "<", end_date)
        incidents_docs = list(incidents_query.stream())

        # Query the "archived" collection within the same date range.
        archived_query = db.collection("archived") \
            .where("timestamp", ">=", start_date) \
            .where("timestamp", "<", end_date)
        archived_docs = list(archived_query.stream())

        # Combine both sets of documents.
        all_docs = incidents_docs + archived_docs

        # Aggregate incident counts by day.
        counts_by_day = {}
        for doc in all_docs:
            incident = doc.to_dict()
            ts = incident.get("timestamp")
            if ts:
                # Convert Firestore timestamp to Python datetime.
                if hasattr(ts, "to_pydatetime"):
                    dt = ts.to_pydatetime()
                elif hasattr(ts, "to_datetime"):
                    dt = ts.to_datetime()
                else:
                    dt = ts
                date_str = dt.strftime("%Y-%m-%d")
                counts_by_day[date_str] = counts_by_day.get(date_str, 0) + 1

        # Convert the dictionary to a sorted list of dicts.
        data = [{"date": date, "count": count}
                for date, count in sorted(counts_by_day.items())]
        logger.info(f"Trends data: {data}")
        return Response(data)
    except Exception as e:
        logger.error(f"Error fetching incident trends: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def index(request):
    return render(request, "main/index.html")


def info(request):
    return render(request, "main/info.html")


def login(request):
    # Get Firebase config from environment variables
    firebase_config = {
        "apiKey": os.environ.get("FIREBASE_API_KEY"),
        "authDomain": os.environ.get("FIREBASE_AUTH_DOMAIN"),
        "projectId": os.environ.get("FIREBASE_PROJECT_ID"),
        "storageBucket": os.environ.get("FIREBASE_STORAGE_BUCKET"),
        "messagingSenderId": os.environ.get("FIREBASE_MESSAGING_SENDER_ID"),
        "appId": os.environ.get("FIREBASE_APP_ID"),
    }

    context = {
        "firebase_config": json.dumps(firebase_config),
    }

    return render(request, "main/login.html", context)


def data_analysis(request):
    # Check if the user has a session cookie
    if request.session.test_cookie_worked():
        request.session.delete_test_cookie()
        # User is authenticated, proceed with rendering the page
        return render(request, 'main/data_analysis.html')
    else:
        # No session cookie, redirect to login
        response = redirect('/login/')
        # Set a cookie to redirect after login
        response.set_cookie('redirect_after_login', '/data-analysis/')
        return response
