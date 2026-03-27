'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import type { Product } from '@/lib/types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const items = await getProducts();
        setProducts(items);
      } catch {
        setError('Unable to load sessions right now. Please try again shortly.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Samays AI Marketplace</p>
        <h1>Book AI Products That Scale Real Work</h1>
        <p>
          Sign in, explore creator-led products, and reserve your product in a few clicks.
          Built for fast demo flow and production-ready integration.
        </p>
        <div className="hero-buttons">
          <a href="#catalog" className="btn-primary">Browse Products</a>
          <Link href="/login" className="btn-secondary">Sign In</Link>
        </div>
      </section>

      <section id="catalog" className="container catalog">
        <div className="section-head" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem' }}>Available Products</h2>
          <p>Public catalog backed by real Django ORM Models.</p>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {[1, 2].map((i) => (
              <article key={i} className="glass-card skeleton-pulse" style={{ display: 'flex', gap: '4rem', padding: '0', minHeight: '500px', flexDirection: i % 2 === 0 ? 'row-reverse' : 'row' }}>
                <div style={{ flex: 1, padding: '4rem' }}>
                  <div className="skeleton-bar" style={{ width: '30%', height: '1rem', marginBottom: '2rem' }}></div>
                  <div className="skeleton-bar" style={{ width: '80%', height: '3rem', marginBottom: '1.5rem' }}></div>
                  <div className="skeleton-bar" style={{ width: '90%', height: '1.2rem', marginBottom: '0.8rem' }}></div>
                  <div className="skeleton-bar" style={{ width: '60%', height: '1.2rem', marginBottom: '2rem' }}></div>
                  <div className="skeleton-bar" style={{ width: '20%', height: '2rem', marginBottom: '2rem' }}></div>
                  <div className="skeleton-bar" style={{ width: '150px', height: '3rem', borderRadius: '980px' }}></div>
                </div>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)' }}></div>
              </article>
            ))}
          </div>
        )}
        {error && <div className="notice error">{error}</div>}

        {!loading && !error && products.length === 0 && (
          <div className="notice" style={{ textAlign: 'center' }}>No products are published yet. Sign in as creator to add one.</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {products.map((product, index) => {
            const isAgentix = product.name.toLowerCase().includes('agentix');
            const isXCalw = product.name.toLowerCase().includes('x-calw') || product.name.toLowerCase().includes('x-claw');
            const imgSrc = isAgentix ? '/Product Agentic Voice.png' : (isXCalw ? '/Product X-claw.png' : '/Logo.png');
            const reverse = index % 2 !== 0;

            return (
              <article key={product.id} className="glass-card" style={{ display: 'flex', flexDirection: reverse ? 'row-reverse' : 'row', alignItems: 'center', gap: '4rem', padding: '0', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: '4rem' }}>
                  <p className="eyebrow">Creator: {product.creator.username}</p>
                  <h3 style={{ fontSize: '3rem', letterSpacing: '-0.03em', marginBottom: '1rem' }}>{product.name}</h3>
                  <p className="muted" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{product.description || 'No description provided.'}</p>
                  <div className="product-meta" style={{ display: 'inline-block', fontSize: '1.2rem', fontWeight: 600, marginBottom: '2rem' }}>
                    ${product.price} / mo
                  </div>
                  <div>
                    <Link href={`/product/${product.id}`} className="btn-primary" style={{ padding: '1rem 2rem' }}>
                      View Deep Details
                    </Link>
                  </div>
                </div>
                <div style={{ flex: 1, background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', padding: '2rem' }}>
                  <img src={imgSrc} alt={product.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="footer container">
        <p>© 2026 Samays AI Solutions. All rights reserved.</p>
      </footer>
    </main>
  );
}
