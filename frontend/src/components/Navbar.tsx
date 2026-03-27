'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const router = useRouter();

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    useEffect(() => {
        const checkUser = () => {
            setUser(getStoredUser());
        };

        checkUser();
        window.addEventListener('storage', checkUser);
        window.addEventListener('auth-change', checkUser);

        return () => {
            window.removeEventListener('storage', checkUser);
            window.removeEventListener('auth-change', checkUser);
        };
    }, []);

    useEffect(() => {
        if (!user) {
            setTimeLeft(null);
            return;
        }

        const INACTIVITY_LIMIT = 60;

        const resetTimer = () => setTimeLeft(INACTIVITY_LIMIT);
        resetTimer();

        const intervalId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null) return null;
                if (prev <= 1) {
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];
        const handleActivity = () => resetTimer();

        activityEvents.forEach(event => document.addEventListener(event, handleActivity));

        return () => {
            clearInterval(intervalId);
            activityEvents.forEach(event => document.removeEventListener(event, handleActivity));
        };
    }, [user]);

    return (
        <nav className="navbar">
            <Link className="logo" href="/">Samays AI</Link>
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link href="/">Catalog</Link>
                {user ? (
                    <>
                        <Link href="/dashboard">Dashboard</Link>
                        {timeLeft !== null && (
                            <span style={{ color: timeLeft < 15 ? 'var(--danger)' : 'var(--accent)', fontWeight: 600, letterSpacing: '0.02em', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                Session expires in: <span style={{ fontFamily: 'monospace', fontSize: '1.1em' }}>{timeLeft}s</span>
                            </span>
                        )}
                        <span style={{ color: 'var(--text-secondary)' }}>Hello, {user.first_name || user.username}</span>
                        <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.6rem 1.4rem' }}>Log out</button>
                    </>
                ) : (
                    <Link href="/login" className="btn-secondary">Sign In</Link>
                )}
            </div>
        </nav>
    );
}
