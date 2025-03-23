from django.test import TestCase
from main.forms import LoginForm, UserProfileForm


class LoginFormTests(TestCase):
    def test_valid_login_form(self):
        form_data = {
            'username': 'testuser@example.com',
            'password': 'secret'
        }
        form = LoginForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_invalid_login_form(self):
        # Test with missing data
        form = LoginForm(data={'username': '', 'password': ''})
        self.assertFalse(form.is_valid())
        self.assertIn('username', form.errors)
        self.assertIn('password', form.errors)


class UserProfileFormTests(TestCase):
    def test_bound_empty_user_profile_form(self):
        # Passing empty data yields a bound form that is valid if the field is optional.
        form = UserProfileForm(data={})
        self.assertTrue(form.is_valid())
        self.assertTrue(form.is_bound)

    def test_unbound_user_profile_form(self):
        # A form created without data is unbound.
        form = UserProfileForm()
        self.assertFalse(form.is_bound)
