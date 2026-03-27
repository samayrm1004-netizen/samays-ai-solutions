'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, getBookings, getProducts, getProfile, updateProfile, getWishlist, getAdminStats } from '@/lib/api';
import { clearAuth, getStoredTokens } from '@/lib/auth';
import type { Booking, Product, User } from '@/lib/types';

type SessionForm = {
  name: string;
  description: string;
  price: string;
  image_url: string;
};

const emptyForm: SessionForm = {
  name: '',
  description: '',
  price: '',
  image_url: '',
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [creatorSessions, setCreatorSessions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [sessionForm, setSessionForm] = useState<SessionForm>(emptyForm);

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    avatar: '',
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'wishlist' | 'creator' | 'admin'>('profile');
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    const tokens = getStoredTokens();
    if (!tokens?.access) {
      router.push('/login');
      return;
    }

    const loadDashboard = async () => {
      try {
        const [profile, bookingItems, wItems] = await Promise.all([
          getProfile(),
          getBookings(),
          getWishlist().catch(() => []),
        ]);

        setUser(profile);
        setBookings(bookingItems);
        setWishlist(wItems);
        setProfileForm({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          avatar: profile.avatar || '',
        });

        if (profile.is_creator && !profile.is_staff) {
          const products = await getProducts();
          const ownSessions = products.filter((product) => product.creator.id === profile.id);
          setCreatorSessions(ownSessions);
        }

        if (profile.is_staff) {
          const stats = await getAdminStats();
          setAdminData(stats);
          setActiveTab('admin'); // defaulting Admins directly to their hub
        }

      } catch {
        setError('Failed to load dashboard data. Please sign in again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const activeBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'confirmed'),
    [bookings],
  );

  const pastBookings = useMemo(
    () => bookings.filter((booking) => booking.status !== 'confirmed'),
    [bookings],
  );

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setError('');
    setFeedback('');
    try {
      const updated = await updateProfile(profileForm);
      setUser(updated);
      setFeedback('Profile updated successfully.');
    } catch {
      setError('Unable to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = Number(sessionForm.price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Price must be a valid non-negative number.');
      return;
    }

    setCreatingSession(true);
    setError('');
    setFeedback('');

    try {
      const created = await createProduct({
        name: sessionForm.name,
        description: sessionForm.description,
        price: parsedPrice,
        image_url: sessionForm.image_url || undefined,
      });
      setCreatorSessions((prev) => [created, ...prev]);
      setSessionForm(emptyForm);
      setFeedback('Session created successfully.');
    } catch {
      setError('Could not create session. Ensure you are logged in as creator.');
    } finally {
      setCreatingSession(false);
    }
  };

  if (loading) return <main className="center-page">Loading dashboard...</main>;
  if (!user) return <main className="center-page">Unable to load user profile.</main>;

  return (
    <main className="container" style={{ display: 'flex', gap: '3rem', marginTop: '4rem', alignItems: 'flex-start' }}>

      {/* Sidebar */}
      <aside className="glass-card" style={{ width: '280px', flexShrink: 0, padding: '2rem' }}>
        <p className="eyebrow" style={{ marginBottom: '2rem' }}>Dashboard Menu</p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {user.is_staff && (
            <button
              onClick={() => setActiveTab('admin')}
              style={{ textAlign: 'left', padding: '1rem', background: activeTab === 'admin' ? 'var(--accent)' : 'transparent', color: activeTab === 'admin' ? '#fff' : 'var(--text-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500 }}
            >
              Global Admin Hub
            </button>
          )}
          <button
            onClick={() => setActiveTab('profile')}
            style={{ textAlign: 'left', padding: '1rem', background: activeTab === 'profile' ? 'var(--accent)' : 'transparent', color: activeTab === 'profile' ? '#fff' : 'var(--text-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500 }}
          >
            Profile Settings
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            style={{ textAlign: 'left', padding: '1rem', background: activeTab === 'bookings' ? 'var(--accent)' : 'transparent', color: activeTab === 'bookings' ? '#fff' : 'var(--text-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500 }}
          >
            Booked Products
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            style={{ textAlign: 'left', padding: '1rem', background: activeTab === 'wishlist' ? 'var(--accent)' : 'transparent', color: activeTab === 'wishlist' ? '#fff' : 'var(--text-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500 }}
          >
            Wishlist
          </button>
          {user.is_creator && !user.is_staff && (
            <button
              onClick={() => setActiveTab('creator')}
              style={{ textAlign: 'left', padding: '1rem', background: activeTab === 'creator' ? 'var(--accent)' : 'transparent', color: activeTab === 'creator' ? '#fff' : 'var(--text-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500 }}
            >
              Creator Studio
            </button>
          )}
          <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />
          <button
            onClick={handleLogout}
            style={{ textAlign: 'left', padding: '1rem', background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500 }}
          >
            Log Out
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <section style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2>Welcome back, {user.first_name || user.username}</h2>
          {error && <p className="notice error">{error}</p>}
          {feedback && <p className="notice success">{feedback}</p>}
        </div>

        {activeTab === 'admin' && adminData && (
          <div className="glass-card">
            <h3>Global Administrator Metrics</h3>
            <p className="muted" style={{ marginBottom: '2rem' }}>Total Users Registered in PostgreSQL: <strong style={{ color: '#fff', fontSize: '1.2rem' }}>{adminData.total_users}</strong></p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {adminData.users.map((u: any) => (
                <div key={u.id} style={{ padding: '1.5rem', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{u.name || u.username} {u.is_creator && <span style={{ fontSize: '0.8rem', background: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', marginLeft: '0.5rem' }}>CREATOR</span>}</h4>
                      <div className="muted" style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>{u.email} | Phone: {u.phone || 'N/A'}</div>
                    </div>
                  </div>

                  {u.bookings.length > 0 ? (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>BOOKED PRODUCTS:</strong>
                      <ul style={{ margin: '0.5rem 0 0 1.5rem', color: '#fff' }}>
                        {u.bookings.map((b: any, idx: number) => (
                          <li key={idx} style={{ marginBottom: '0.5rem' }}>
                            {b.product_name} <br />
                            <span className="muted" style={{ fontSize: '0.85rem' }}>Contact: {b.booking_name} ({b.booking_email} / {b.booking_phone})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="muted" style={{ fontSize: '0.9rem', margin: 0 }}>No bookings recorded for this user.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="glass-card">
            <h3>Profile Settings</h3>
            <p className="muted" style={{ marginBottom: '2rem' }}>Update your personal details. Only you can view these.</p>
            <div className="form-grid">
              <input value={profileForm.first_name} onChange={(e) => setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))} placeholder="First name" />
              <input value={profileForm.last_name} onChange={(e) => setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))} placeholder="Last name" />
              <input value={user.email} disabled />
              <input value={profileForm.avatar} onChange={(e) => setProfileForm((prev) => ({ ...prev, avatar: e.target.value }))} placeholder="Avatar URL" />
              <button className="btn-primary" onClick={handleProfileSave} disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="glass-card">
            <h3>Bookings Overview</h3>
            <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
              <article>
                <h4 style={{ marginBottom: '1rem' }}>Active Bookings</h4>
                {activeBookings.length === 0 && <p className="muted">No active bookings yet.</p>}
                {activeBookings.map((booking) => (
                  <div key={booking.id} className="list-item" style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '8px', marginBottom: '1rem' }}>
                    <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 600 }}>{booking.product_detail?.name || 'Session'}</span>
                    <span className="muted">Booked for: {booking.booking_name || 'Self'}</span><br />
                    <strong style={{ color: 'var(--success)' }}>{new Date(booking.booking_date).toLocaleDateString()}</strong>
                  </div>
                ))}
              </article>
              <article>
                <h4 style={{ marginBottom: '1rem' }}>Past/Other Bookings</h4>
                {pastBookings.length === 0 && <p className="muted">No past bookings found.</p>}
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="list-item" style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '8px', marginBottom: '1rem' }}>
                    <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 600 }}>{booking.product_detail?.name || 'Session'}</span>
                    <strong style={{ color: 'var(--accent)' }}>{booking.status.toUpperCase()}</strong>
                  </div>
                ))}
              </article>
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="glass-card">
            <h3>Your Saved Wishlist</h3>
            <div className="catalog-grid" style={{ marginTop: '2rem' }}>
              {wishlist.length === 0 && <p className="muted">Your wishlist is empty.</p>}
              {wishlist.map((item) => (
                <article key={item.id} className="product-card" style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.product_detail?.name}</h4>
                  <p className="muted" style={{ marginBottom: '1.5rem' }}>Saved on {new Date(item.added_at).toLocaleDateString()}</p>
                  <a href={`/product/${item.product_detail?.id}`} className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>View Item</a>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'creator' && user.is_creator && (
          <div className="glass-card">
            <h3>Manage Creator Products</h3>
            <form className="form-grid" onSubmit={handleCreateSession} style={{ marginBottom: '3rem' }}>
              <input value={sessionForm.name} onChange={(e) => setSessionForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Product title" required />
              <input value={sessionForm.price} onChange={(e) => setSessionForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="Price" required />
              <textarea value={sessionForm.description} onChange={(e) => setSessionForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Product description" rows={4} required />
              <button className="btn-primary" type="submit" disabled={creatingSession}>
                {creatingSession ? 'Creating...' : 'Create Product'}
              </button>
            </form>

            <h4>Your Published Products</h4>
            <div className="catalog-grid" style={{ marginTop: '1rem' }}>
              {creatorSessions.map((session) => (
                <article key={session.id} className="product-card" style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{session.name}</h4>
                  <p className="muted" style={{ marginBottom: '1rem' }}>{session.description}</p>
                  <strong>${session.price}</strong>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
