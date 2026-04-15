from rest_framework import serializers

from .models import Concours


class ConcoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concours
        fields = [
            "id",
            "title",
            "category",
            "date",
            "description",
            "location",
            "deadline",
            "status",
            "image",
            "rating",
            "reviews",
            "is_featured",
        ]
