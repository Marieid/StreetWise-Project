from django.urls import reverse, resolve
from main import views, api_views
import unittest


class URLTests(unittest.TestCase):
    def test_index_url(self):
        url = reverse('index')
        self.assertEqual(resolve(url).func, views.index)

    def test_info_url(self):
        url = reverse('info')
        self.assertEqual(resolve(url).func, views.info)

    def test_data_analysis_url(self):
        url = reverse('data_analysis')
        self.assertEqual(resolve(url).func, views.data_analysis)

    def test_get_incidents_url(self):
        url = reverse('get_incidents')
        self.assertEqual(resolve(url).func, api_views.get_incidents)

    def test_get_incident_counts_by_type_url(self):
        url = reverse('get_incident_counts_by_type')
        self.assertEqual(resolve(url).func,
                         api_views.get_incident_counts_by_type)

    def test_get_incident_counts_by_day_url(self):
        url = reverse('get_incident_counts_by_day')
        self.assertEqual(resolve(url).func,
                         api_views.get_incident_counts_by_day)

    def test_profile_url(self):
        url = reverse('profile')
        self.assertEqual(resolve(url).func, views.profile)

    def test_logout_url(self):
        url = reverse('logout')
        self.assertEqual(resolve(url).func, views.logout_view)

    def test_download_app_url(self):
        url = reverse('download_app')
        self.assertEqual(resolve(url).func, views.download_app)
