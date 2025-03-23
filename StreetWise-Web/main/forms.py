from django import forms
from .models import UserProfile
from .models import Feedback


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['display_name']


class LoginForm(forms.Form):
    username = forms.CharField(
        max_length=150, widget=forms.TextInput(attrs={'class': 'form-control'}))
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'}))


class FeedbackForm(forms.ModelForm):
    class Meta:
        model = Feedback
        fields = [
            'safety_perception',
            'app_usage_frequency',
            'route_changed',
            'most_useful_features',
            'improvements_suggested',
            'other_comments',
        ]
        widgets = {
            'safety_perception': forms.NumberInput(attrs={'min': 1, 'max': 5}),
            'app_usage_frequency': forms.TextInput(attrs={'placeholder': 'e.g., Daily, Weekly'}),
            'route_changed': forms.CheckboxInput(),
            'most_useful_features': forms.Textarea(attrs={'rows': 3}),
            'improvements_suggested': forms.Textarea(attrs={'rows': 3}),
            'other_comments': forms.Textarea(attrs={'rows': 3}),
        }
        help_texts = {
            'safety_perception': 'Rate your perception of safety while using the app on a scale of 1 to 5, with 1 being very unsafe and 5 being very safe.',
            'app_usage_frequency': 'How often do you use the StreetWise app? (e.g., Daily, Weekly)',
            'route_changed': 'Have you changed your walking route based on the information provided by the app?',
            'most_useful_features': 'What features of the app do you find most useful?',
            'improvements_suggested': 'What improvements would you suggest for the app?',
            'other_comments': 'Any other comments or feedback you would like to share?',
        }
