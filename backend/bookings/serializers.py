from rest_framework import serializers
from .models import Booking
from products.serializers import ProductSerializer
from users.serializers import UserSerializer

class BookingSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'product', 'product_detail', 'user_detail', 'booking_date', 'status', 'booking_name', 'booking_email', 'booking_phone_number']
        read_only_fields = ['user', 'booking_date', 'status']
