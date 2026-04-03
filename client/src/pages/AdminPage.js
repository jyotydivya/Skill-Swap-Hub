import React, { useEffect, useState } from 'react';
import { adminAPI } from '../utils/api';

export default function AdminPage() {
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('overview');
  const [toast, setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, uRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers(),
      ]);
      setStats(sRes.data);
      setUsers(uRes.data.users);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id);
      setUsers(prev => prev.map(u =>
        u._id === id ? { ...u, isActive: res.data.isActive } : u
      ));
      showToast(res.data.message);
    } catch {
      showToast('Action failed.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading...</div>;

  const statCards = stats ? [
    { label: 'Total Users',       value: stats.totalUsers,      icon: '👥', color: '#1d4ed8', bg: '#eff6ff' },
    { label: 'Active Skills',     value: stats.totalSkills,     icon: '🎯', color: '#1a7a5e', bg: '#f0fdf9' },
    { label: 'Pending Requests',  value: stats.pendingRequests, icon: '⏳', color: '#b45309', bg: '#fef9ee' },
    { label: 'Sessions Done',     value: stats.completedSessions, icon: '✅', color: '#15803d', bg: '#dcfce7' },
    {
      label: 'Revenue (Test)',
      value: `₹${Math.round((stats.totalRevenue || 0) / 100).toLocaleString('en-IN')}`,
      icon: '💰', color: '#7c3aed', bg: '#faf5ff',
    },
  ] : [];

  const tabStyle = (t) => ({
    padding: '8px 18px', borderRadius: 8,
    border: 'none', fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
    background: tab === t ? '#1a7a5e' : '#f3f4f6',
    color: tab === t ? '#fff' : '#6b7280',
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          background: '#1a7a5e', color: '#fff',
          padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
        }}>{toast}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a' }}>Admin Dashboard</h1>
        <span style={{
          background: '#fef3c7', color: '#b45309',
          fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
        }}>
          Admin Access Only
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <button style={tabStyle('overview')} onClick={() => setTab('overview')}>Overview</button>
        <button style={tabStyle('users')}    onClick={() => setTab('users')}>Users ({users.length})</button>
      </div>

      {/* ── Overview Tab ────────────────────────────── */}
      {tab === 'overview' && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14, marginBottom: 36,
          }}>
            {statCards.map(s => (
              <div key={s.label} style={{
                background: s.bg, border: `1px solid ${s.color}22`,
                borderRadius: 14, padding: '20px 18px',
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Recent users preview */}
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Recent Registrations</h2>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['User', 'Email', 'Plan', 'Status', 'Joined'].map(h => (
                    <th key={h} style={{
                      padding: '11px 16px', textAlign: 'left',
                      fontSize: 12, color: '#6b7280', fontWeight: 600,
                      borderBottom: '1px solid #e5e7eb',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600 }}>
                      {u.firstName} {u.lastName}
                    </td>
                    <td style={{ padding: '11px 16px', color: '#6b7280' }}>{u.email}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        background: u.isPremium ? '#fef3c7' : '#f3f4f6',
                        color: u.isPremium ? '#b45309' : '#6b7280',
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                      }}>
                        {u.premiumPlan?.toUpperCase() || 'FREE'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        background: u.isActive ? '#dcfce7' : '#fee2e2',
                        color: u.isActive ? '#15803d' : '#dc2626',
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                      }}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', color: '#6b7280', fontSize: 12 }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Users Tab ───────────────────────────────── */}
      {tab === 'users' && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>All Users</h2>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Name', 'Email', 'Role', 'Plan', 'Sessions', 'Rating', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '11px 14px', textAlign: 'left',
                      fontSize: 12, color: '#6b7280', fontWeight: 600,
                      borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>
                      {u.firstName} {u.lastName}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#6b7280', fontSize: 13 }}>{u.email}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: u.role === 'admin' ? '#faf5ff' : '#f3f4f6',
                        color: u.role === 'admin' ? '#7c3aed' : '#6b7280',
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: u.isPremium ? '#fef3c7' : '#f3f4f6',
                        color: u.isPremium ? '#b45309' : '#6b7280',
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                      }}>
                        {u.premiumPlan?.toUpperCase() || 'FREE'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center', color: '#374151' }}>
                      {u.totalSessions || 0}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#f59e0b', fontWeight: 700 }}>
                      {u.rating > 0 ? `★ ${u.rating}` : '—'}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: u.isActive ? '#dcfce7' : '#fee2e2',
                        color: u.isActive ? '#15803d' : '#dc2626',
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                      }}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggle(u._id)}
                          style={{
                            padding: '5px 12px', borderRadius: 6, border: 'none',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            background: u.isActive ? '#fee2e2' : '#dcfce7',
                            color: u.isActive ? '#dc2626' : '#15803d',
                          }}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
