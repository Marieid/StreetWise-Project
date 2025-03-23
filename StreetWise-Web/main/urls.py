from django.urls import path
from . import api_views
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('info/', views.info, name='info'),
    path('data-analysis/', views.data_analysis, name='data_analysis'),
    path('api/incidents/count-by-type/', api_views.get_incident_counts_by_type,
         name='get_incident_counts_by_type'),
    path('api/incidents/count-by-day/', api_views.get_incident_counts_by_day,
         name='get_incident_counts_by_day'),
    path('api/incidents/', api_views.get_incidents, name='get_incidents'),
    path('api/incidents/trends/', api_views.get_incident_trends,
         name='get_incident_trends'),
    path('profile/', views.profile, name='profile'),
    path('logout/', views.logout_view, name='logout'),
    path('download_app/', views.download_app,
         name='download_app'),  # Add this line
    path('feedback/', views.feedback, name='feedback'),
    path('feedback/thanks/', views.feedback_thanks, name='feedback_thanks'),
]
