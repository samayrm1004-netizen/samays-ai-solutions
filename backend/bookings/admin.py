from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "product", "booking_date", "status")
    list_filter = ("status", "booking_date")
    search_fields = ("user__username", "product__name", "status")
    list_editable = ("status",)
    list_per_page = 20
