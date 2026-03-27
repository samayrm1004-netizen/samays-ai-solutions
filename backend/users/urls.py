from django.urls import path
from .views import GoogleLoginView, DemoLoginView, ProfileView, admin_dashboard_stats, admin_chart_data
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('auth/demo/', DemoLoginView.as_view(), name='demo_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('admin-stats/', admin_dashboard_stats, name='admin_stats'),
    path('chart-data/', admin_chart_data, name='chart_data'),
]
