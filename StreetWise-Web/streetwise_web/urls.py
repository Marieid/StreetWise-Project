from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from main import views as main_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main.urls')),
    path('login/', main_views.login, name='login'),
    path('logout/', auth_views.LogoutView.as_view(template_name='main/logout.html'), name='logout'),
]
