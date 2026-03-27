from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price", "creator_link", "created_at")
    list_filter = ("creator", "created_at")
    search_fields = ("name", "description", "creator__username", "creator__email")
    readonly_fields = ("created_at",)
    list_per_page = 20

    def creator_link(self, obj):
        return f"{obj.creator.username} ({obj.creator.email})"
    creator_link.short_description = 'Creator'
