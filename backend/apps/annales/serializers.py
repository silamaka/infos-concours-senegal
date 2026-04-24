from rest_framework import serializers

from .models import Annale, Review
from .models_pack import Pack


class AnnaleSerializer(serializers.ModelSerializer):
    oldPrice = serializers.IntegerField(source="old_price", allow_null=True)
    isPopular = serializers.BooleanField(source="is_popular")
    isNew = serializers.BooleanField(source="is_new")

    average_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    # Optionnel: reviews = ReviewSerializer(many=True, read_only=True)

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
            "average_rating",
            "reviews_count",
            "downloads",
            "image",
            "preview_url",
        ]


class ReviewSerializer(serializers.ModelSerializer):
    user_display = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "annale",
            "user",
            "user_display",
            "rating",
            "comment",
            "created_at",
        ]


class PackSerializer(serializers.ModelSerializer):
    annales = AnnaleSerializer(many=True, read_only=True)
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = Pack
        fields = [
            "id",
            "title",
            "description",
            "price",
            "discount_percent",
            "discounted_price",
            "annales",
            "image",
            "created_at",
        ]

    def get_discounted_price(self, obj):
        return obj.discounted_price()
