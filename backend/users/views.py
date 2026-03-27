import os
from django.contrib.auth import get_user_model
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from google.oauth2 import id_token
from google.auth.transport import requests

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_OAUTH2_CLIENT_ID", "1035318557884-e3csjpakfo5erb153u11klvleepl4a9l.apps.googleusercontent.com")
User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not GOOGLE_CLIENT_ID:
            return Response(
                {"error": "Google OAuth client id is not configured on the backend."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Specify the CLIENT_ID of the app that accesses the backend
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
            email = idinfo.get('email')
            name = idinfo.get('name', '')
            avatar = idinfo.get('picture', '')

            # Find or create user
            username = email.split('@')[0]
            if User.objects.filter(username=username).exclude(email=email).exists():
                username = f"{username}_{User.objects.count() + 1}"

            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'first_name': name,
                    'avatar': avatar,
                },
            )

            tokens = get_tokens_for_user(user)
            return Response({
                'tokens': tokens,
                'user': UserSerializer(user).data
            })
        except ValueError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class DemoLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email") or "demo.user@samays.ai"
        name = request.data.get("name") or "Demo User"
        role = request.data.get("role", "user")
        
        is_creator = role in ["creator", "admin"]
        is_staff = role == "admin"
        
        username = email.split("@")[0]

        if User.objects.filter(username=username).exclude(email=email).exists():
            username = f"{username}_{User.objects.count() + 1}"

        user, _ = User.objects.get_or_create(
            email=email,
            defaults={
                "username": username,
                "first_name": name,
                "is_creator": is_creator,
                "is_staff": is_staff,
            },
        )

        user.first_name = name
        user.is_creator = is_creator
        user.is_staff = is_staff
        user.save(update_fields=["first_name", "is_creator", "is_staff"])

        tokens = get_tokens_for_user(user)
        return Response({"tokens": tokens, "user": UserSerializer(user).data})

class ProfileView(RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from bookings.models import Booking

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    users = User.objects.all().order_by('-date_joined')
    user_data = []
    for u in users:
        u_bookings = Booking.objects.filter(user=u).select_related('product')
        booking_info = []
        for b in u_bookings:
            booking_info.append({
                'product_name': b.product.name,
                'booking_name': b.booking_name,
                'booking_phone': b.booking_phone_number,
                'booking_email': b.booking_email,
                'status': b.status
            })
        
        user_data.append({
            'id': u.id,
            'username': u.username,
            'name': u.first_name,
            'email': u.email,
            'phone': u.phone_number,
            'is_creator': u.is_creator,
            'bookings': booking_info
        })
    return Response({
        'total_users': users.count(),
        'users': user_data
    })

from django.http import JsonResponse
from django.contrib.admin.views.decorators import staff_member_required

@staff_member_required
def admin_chart_data(request):
    users_count = User.objects.count()
    bookings_count = Booking.objects.count()
    recent = list(Booking.objects.select_related('product', 'user').order_by('-booking_date')[:5].values(
        'booking_name', 'booking_email', 'product__name', 'status'
    ))
    return JsonResponse({
        'total_users': users_count,
        'active_bookings': bookings_count,
        'recent_bookings': recent,
        'chart_labels': ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        'chart_data': [1, 2, 4, users_count]
    })
