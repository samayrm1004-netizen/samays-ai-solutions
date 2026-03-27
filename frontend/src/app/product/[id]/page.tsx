'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking, getProduct, addToWishlist } from '@/lib/api';
import { getStoredTokens } from '@/lib/auth';
import type { Product } from '@/lib/types';

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userForm, setUserForm] = useState({ booking_name: '', booking_email: '', booking_phone: '' });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const item = await getProduct(params.id);
        setProduct(item);
      } catch {
        setError('Unable to load this product.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokens = getStoredTokens();
    if (!tokens?.access) {
      router.push('/login');
      return;
    }

    if (!product) return;

    setBooking(true);
    setError('');
    setSuccess('');
    try {
      await createBooking({
        product: product.id,
        booking_name: userForm.booking_name,
        booking_email: userForm.booking_email,
        booking_phone_number: userForm.booking_phone,
      });
      setSuccess('Product booked successfully. View details in your dashboard.');
      setShowModal(false);
    } catch {
      setError('Booking failed. Please retry.');
    } finally {
      setBooking(false);
    }
  };

  const handleWishlist = async () => {
    const tokens = getStoredTokens();
    if (!tokens?.access) {
      router.push('/login');
      return;
    }
    if (!product) return;

    try {
      await addToWishlist(product.id);
      setSuccess('Added to your Wishlist!');
    } catch {
      setError('Failed to add to Wishlist or already exists.');
    }
  };

  if (loading) {
    return <main className="center-page">Loading product...</main>;
  }

  if (!product) {
    return <main className="center-page">Product not found.</main>;
  }

  return (
    <main className="product-detail">
      <section className="glass-card" style={{ position: 'relative' }}>
        <p className="eyebrow">Product Detail</p>
        <h1>{product.name}</h1>
        <p className="muted">{product.description || 'No detailed description provided.'}</p>
        <div className="product-meta split">
          <span>Creator: {product.creator.username}</span>
          <strong>${product.price}</strong>
        </div>

        {error && <p className="notice error">{error}</p>}
        {success && <p className="notice success">{success}</p>}

        <div className="action-row" style={{ marginTop: '2rem' }}>
          <button className="btn-primary" onClick={() => setShowModal(true)} disabled={booking}>
            {booking ? 'Booking...' : 'Book Now'}
          </button>
          <button className="btn-secondary" onClick={handleWishlist}>
            Save to Wishlist
          </button>
          <Link className="btn-secondary" href="/dashboard" style={{ marginLeft: 'auto' }}>
            Go to Dashboard
          </Link>
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'var(--surface-color)', backdropFilter: 'blur(30px)' }}>
            <h3>Complete Your Booking</h3>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>We need a few details to finalize the session reservation.</p>
            <form onSubmit={handleBookSubmit} className="form-grid">
              <input
                placeholder="Full Name"
                required
                value={userForm.booking_name}
                onChange={e => setUserForm({ ...userForm, booking_name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={userForm.booking_email}
                onChange={e => setUserForm({ ...userForm, booking_email: e.target.value })}
              />
              <input
                placeholder="Phone Number"
                required
                value={userForm.booking_phone}
                onChange={e => setUserForm({ ...userForm, booking_phone: e.target.value })}
              />
              <div className="action-row" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={booking}>
                  {booking ? 'Confirming...' : 'Confirm Booking'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
