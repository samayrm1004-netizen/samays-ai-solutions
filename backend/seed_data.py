import os
import django
import random
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Product, Wishlist
from bookings.models import Booking

User = get_user_model()

def run():
    print("Clearing database...")
    Wishlist.objects.all().delete()
    Booking.objects.all().delete()
    Product.objects.all().delete()
    User.objects.all().delete()

    print("Creating users...")
    admin = User.objects.create_superuser('admin', 'admin@example.com', 'adminpass')
    admin.first_name = "Samay Admin"
    admin.is_creator = True
    admin.save()
    
    demo_user = User.objects.create_user(
        username='demo.user', 
        email='demo.user@samays.ai', 
        first_name='Samay Buyer',
        is_creator=False,
        phone_number="+1 555-0100"
    )
    demo_user.set_password('demo123')
    demo_user.save()

    creators = []
    names = ["Samay Primary", "Samay Specialist", "Samay Creative", "Samay Enterprise"]
    for i, name in enumerate(names):
        u = User.objects.create_user(
            username=f'samay_creator_{i}', 
            email=f'creator{i}@samays.ai', 
            first_name=name, 
            is_creator=True
        )
        u.set_password('password123')
        u.save()
        creators.append(u)
    
    print("Creating Products...")
    p1 = Product.objects.create(
        name="Agentix",
        description="Your ultimate AI voice agent handling complex voice workflows with human-like precision.",
        price=299.00,
        creator=creators[0]
    )
    p2 = Product.objects.create(
        name="X-calw",
        description="Your customized virtual employee. Handles data entry, scheduling, and repetitive operational tasks.",
        price=499.00,
        creator=creators[1]
    )

    print("Creating Bookings that will show up on Dashboards...")
    Booking.objects.create(user=demo_user, product=p1, status='confirmed', booking_name='Samay Buyer', booking_email='buyer@samays.ai', booking_phone_number='+1 555-0100')
    Booking.objects.create(user=admin, product=p2, status='pending', booking_name='Samay Admin', booking_email='admin@example.com', booking_phone_number='+1 555-0200')
    
    Wishlist.objects.create(user=demo_user, product=p2)

    print("Seed complete! 6 Samay users, 2 Products, 2 Bookings, 1 Wishlist item.")

if __name__ == '__main__':
    run()
