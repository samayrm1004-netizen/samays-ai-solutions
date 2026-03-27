from rest_framework import serializers
from .models import Product
from users.serializers import UserSerializer

class ProductSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'creator', 'image_url', 'created_at']
        read_only_fields = ['creator', 'created_at']

from .models import Wishlist

class WishlistSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'product', 'product_detail', 'added_at']
        read_only_fields = ['user', 'added_at']
