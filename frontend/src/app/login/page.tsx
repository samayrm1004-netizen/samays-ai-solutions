'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { demoLogin, googleLogin } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('Demo User');
    const [email, setEmail] = useState('demo.user@samays.ai');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [googleToken, setGoogleToken] = useState('');
    const [error, setError] = useState('');

    const handleDemoLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = await demoLogin({
                name,
                email,
                role
            });
            saveAuth(payload.tokens, payload.user);
            router.push('/dashboard');
        } catch {
            setError('Login failed. Please verify backend is running and retry.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!googleToken.trim()) {
            setError('Please provide a Google ID token.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const payload = await googleLogin(googleToken.trim());
            saveAuth(payload.tokens, payload.user);
            router.push('/dashboard');
        } catch {
            setError('Google token login failed. Check token validity and backend OAuth config.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-wrap">
            <div className="auth-grid">
                <section className="glass-card">
                    <h3>Quick Demo Login</h3>
                    <p className="muted">Use this for assignment evaluation without external OAuth setup.</p>
                    <form onSubmit={handleDemoLogin} className="form-grid">
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required />
                        <select value={role} onChange={(e) => setRole(e.target.value as 'user' | 'admin')}>
                            <option value="user">User role</option>
                            <option value="admin">Admin role</option>
                        </select>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Signing in...' : 'Continue'}
                        </button>
                    </form>
                </section>

                <section className="glass-card">
                    <h3>Sign In with Google</h3>
                    <p className="muted">Use your real Google account for secure 1-click authentication.</p>
                    <GoogleOAuthProvider clientId="1035318557884-e3csjpakfo5erb153u11klvleepl4a9l.apps.googleusercontent.com">
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    if (!credentialResponse.credential) return;
                                    setLoading(true);
                                    setError('');
                                    try {
                                        const payload = await googleLogin(credentialResponse.credential);
                                        saveAuth(payload.tokens, payload.user);
                                        router.push('/dashboard');
                                    } catch {
                                        setError('Google token login failed. Check backend OAuth config.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                onError={() => setError('Google Login Failed')}
                            />
                        </div>
                    </GoogleOAuthProvider>
                </section>
            </div>
            {error && <p className="notice error">{error}</p>}
            <p className="muted center">
                After sign-in, dashboard data is loaded from protected API endpoints with JWT auth.
            </p>
        </main>
    );
}
