from rest_framework import serializers

from .models import Concours


class ConcoursSerializer(serializers.ModelSerializer):
    conditions = serializers.CharField(allow_blank=True, required=False, allow_null=False, default='')

    class Meta:
        model = Concours
        fields = [
            "id",
            "title",
            "category",
            "date",
            "description",
            "registration_url",
            "location",
            "deadline",
            "status",
            "image",
            "rating",
            "reviews",
            "is_featured",
            "conditions",
        ]
