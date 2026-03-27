from rest_framework import viewsets, permissions
from .models import Booking
from .serializers import BookingSerializer

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_creator:
            return Booking.objects.filter(product__creator=user).order_by('-booking_date')
        return Booking.objects.filter(user=user).order_by('-booking_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
