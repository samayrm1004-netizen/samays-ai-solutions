from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ("id", "username", "email", "first_name", "last_name", "is_creator", "is_staff")
    list_filter = ("is_creator", "is_staff", "is_active", "date_joined")
    search_fields = ("username", "email", "first_name", "last_name")
    fieldsets = UserAdmin.fieldsets + (("Marketplace Settings", {"fields": ("is_creator", "avatar")}),)
    list_editable = ("is_creator",)
    list_per_page = 20
