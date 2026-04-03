import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8f9fa', padding: 20,
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 16, padding: 36, width: '100%', maxWidth: 420,
      }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            Login to your SkillSwap Hub account
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#dc2626',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Email
            </label>
            <input
              name="email" type="email" value={form.email}
              onChange={handleChange} required
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '10px 14px',
                border: '1px solid #d1d5db', borderRadius: 8,
                fontSize: 14, outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Password
            </label>
            <input
              name="password" type="password" value={form.password}
              onChange={handleChange} required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px',
                border: '1px solid #d1d5db', borderRadius: 8,
                fontSize: 14, outline: 'none',
              }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '11px',
              background: loading ? '#9ca3af' : '#1a7a5e',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 20 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1a7a5e', fontWeight: 600 }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
