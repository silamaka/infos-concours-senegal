from rest_framework import serializers

from .models import Annale


class AnnaleSerializer(serializers.ModelSerializer):
    oldPrice = serializers.IntegerField(source="old_price", allow_null=True)
    isPopular = serializers.BooleanField(source="is_popular")
    isNew = serializers.BooleanField(source="is_new")

    class Meta:
        model = Annale
        fields = [
            "id",
            "title",
            "category",
            "price",
            "oldPrice",
            "isPopular",
            "isNew",
            "description",
            "pages",
            "year",
            "rating",
            "reviews",
            "downloads",
            "image",
            "preview_url",
        ]
