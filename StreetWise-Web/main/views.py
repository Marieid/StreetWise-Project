import os
from django.shortcuts import render, redirect
from django.conf import settings
from django.contrib.auth import login as django_login, authenticate, logout
from django.http import HttpResponseForbidden
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import IncidentSerializer
from datetime import datetime, timedelta
import math
from django.contrib.auth.decorators import login_required
from .forms import UserProfileForm, LoginForm, FeedbackForm
from .models import UserProfile
from firebase_admin import firestore
import logging
import firebase_admin
from firebase_admin import auth as firebase_auth
from django.contrib.auth.models import User
from django.templatetags.static import static

logger = logging.getLogger(__name__)
db = firestore.client()


def login(request):
    error = None
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            try:
                user_record = firebase_auth.get_user_by_email(username)
                if not user_record:
                    error = "User not found"
                else:
                    user, created = User.objects.get_or_create(
                        username=username)
                    if created:
                        user.set_unusable_password()
                        user.save()
                    django_login(request, user)
                    firebase_uid = user_record.uid
                    user_ref = db.collection("users").document(firebase_uid)
                    user_doc = user_ref.get()
                    if not user_doc.exists:
                        user_ref.set({
                            "email": user_record.email,
                            "displayName": user_record.display_name or "",
                            "createdAt": datetime.utcnow(),
                            "credibilityScore": 100
                        })
                    return redirect('index')
            except firebase_admin.auth.UserNotFoundError:
                error = "Invalid credentials"
            except Exception as e:
                logger.error("Firebase authentication error: %s", e)
                error = "Authentication error"
    else:
        form = LoginForm()
    return render(request, 'main/login.html', {'form': form, 'error': error})


@api_view(["GET"])
def get_incidents(request):
    try:
        incidents_ref = db.collection("incidents")
        query = incidents_ref
        incident_type = request.query_params.get("type")
        if incident_type:
            query = query.where("type", "==", incident_type)
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")
        if start_date_str:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
            query = query.where("timestamp", ">=", start_date)
        if end_date_str:
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
            end_date = end_date + timedelta(days=1)
            query = query.where("timestamp", "<", end_date)
        latitude = request.query_params.get("latitude")
        longitude = request.query_params.get("longitude")
        radius = request.query_params.get("radius")
        if latitude and longitude and radius:
            latitude = float(latitude)
            longitude = float(longitude)
            radius = float(radius)
            lat_diff = radius / 111
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
            incident["timestamp"] = incident["timestamp"].isoformat()
            incidents.append(incident)
        serializer = IncidentSerializer(incidents, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_incident_counts_by_type(request):
    try:
        incidents_ref = db.collection("incidents")
        docs = incidents_ref.stream()
        counts_by_type = {}
        for doc in docs:
            incident = doc.to_dict()
            incident_type = incident.get("type")
            if incident_type:
                counts_by_type[incident_type] = counts_by_type.get(
                    incident_type, 0) + 1
        data = [{"type": t, "count": c} for t, c in counts_by_type.items()]
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_incident_counts_by_day(request):
    try:
        incidents_ref = db.collection("incidents")
        docs = incidents_ref.stream()
        counts_by_day = {}
        for doc in docs:
            incident = doc.to_dict()
            timestamp = incident.get("timestamp")
            if timestamp:
                if hasattr(timestamp, "to_pydatetime"):
                    dt = timestamp.to_pydatetime()
                elif hasattr(timestamp, "to_datetime"):
                    dt = timestamp.to_datetime()
                else:
                    dt = timestamp
                date_str = dt.strftime("%Y-%m-%d")
                counts_by_day[date_str] = counts_by_day.get(date_str, 0) + 1
        data = [{"date": d, "count": c} for d, c in counts_by_day.items()]
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def index(request):
    return render(request, "main/index.html")


def info(request):
    return render(request, "main/info.html")


def data_analysis(request):
    return render(request, 'main/data_analysis.html')


@login_required
def profile(request):
    user = request.user
    user_email = user.username
    try:
        user_record = firebase_auth.get_user_by_email(user_email)
        firebase_uid = user_record.uid
    except firebase_admin.auth.UserNotFoundError:
        return HttpResponseForbidden("Firebase user not found.")
    user_doc = db.collection("users").document(firebase_uid).get()
    if not user_doc.exists:
        return redirect("download_app")
    user_data = user_doc.to_dict()
    display_name = user_data.get("displayName", "")
    credibility_score = user_data.get("credibilityScore", 0)
    photo_url = user_data.get("photoURL", "")
    created_at = user_data.get("createdAt", "")

    # Function to format timestamps
    def format_timestamp(ts):
        if ts:
            if hasattr(ts, "to_pydatetime"):
                dt = ts.to_pydatetime()
            elif hasattr(ts, "to_datetime"):
                dt = ts.to_datetime()
            else:
                dt = ts
            return dt.strftime("%B %d, %Y, %I:%M %p")
        return "N/A"

    # Format the created_at field
    created_at_formatted = format_timestamp(created_at)

    # Determine profile picture:
    if isinstance(photo_url, str) and photo_url.startswith("http"):
        profile_picture_url = photo_url
    else:
        try:
            idx = int(photo_url)
        except (ValueError, TypeError):
            idx = 0
        if idx < 1 or idx > 7:
            profile_picture_url = static(
                "main/profile-pictures/placeholder.png")
        else:
            profile_picture_url = static(
                f"main/profile-pictures/profile{idx}.png")

    user_profile, created = UserProfile.objects.get_or_create(
        user_id=firebase_uid)
    user_profile.display_name = display_name
    user_profile.credibility_score = credibility_score
    user_profile.photo_url = photo_url  # stored as provided from Firestore
    user_profile.save()

    # Query active incidents
    incidents_query = db.collection("incidents").where(
        "userId", "==", firebase_uid)
    incidents_docs = incidents_query.stream()
    incidents = []
    for doc in incidents_docs:
        incident = doc.to_dict()
        # Add formatted timestamp to each incident
        incident["formatted_timestamp"] = format_timestamp(
            incident.get("timestamp"))
        incidents.append(incident)

    # Query archived reports
    archived_query = db.collection("archived").where(
        "userId", "==", firebase_uid)
    archived_docs = archived_query.stream()
    archived = []
    for doc in archived_docs:
        archive = doc.to_dict()
        # Add formatted timestamp to each archived report
        archive["formatted_timestamp"] = format_timestamp(
            archive.get("timestamp"))
        archived.append(archive)

    user_reports = {
        "incidents": incidents,
        "archived": archived,
    }

    return render(request, "main/profile.html", {
        "user_profile": user_profile,
        "user_email": user_email,
        "display_name": display_name,
        "credibility_score": credibility_score,
        "photo_url": profile_picture_url,
        "created_at": created_at_formatted,  # Pass the formatted created_at
        "user_reports": user_reports,  # Pass the incidents and archived reports
    })


def download_app(request):
    return render(request, 'main/download_app.html')


def logout_view(request):
    request.session.flush()
    logout(request)
    return redirect('login')


def feedback(request):
    if request.method == 'POST':
        form = FeedbackForm(request.POST)
        if form.is_valid():
            feedback = form.save(commit=False)
            if request.user.is_authenticated:
                feedback.user_id = request.user.username
            feedback.save()
            return redirect('feedback_thanks')
    else:
        form = FeedbackForm()
    return render(request, 'main/feedback.html', {'form': form})


def feedback_thanks(request):
    return render(request, 'main/feedback_thanks.html')
