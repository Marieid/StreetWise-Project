from rest_framework import serializers

class IncidentSerializer(serializers.Serializer):
    type = serializers.CharField()
    location = serializers.DictField()  # For latitude and longitude
    comment = serializers.CharField(allow_blank=True, required=False)
    timestamp = serializers.DateTimeField()
    userId = serializers.CharField()