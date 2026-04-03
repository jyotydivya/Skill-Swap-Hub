import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI, reviewsAPI, skillsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = [
  { bg: '#d1fae5', color: '#065f46' },
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#fef3c7', color: '#b45309' },
];

function getAv(name = '') {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me, updateUser } = useAuth();
  const isOwn = !id || (me && id === me._id);

  const [profile, setProfile]   = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState('');
  const [mySkills, setMySkills] = useState([]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const targetId = id || me?._id;
    if (!targetId) return;
    Promise.all([
      usersAPI.getById(targetId),
      reviewsAPI.getForUser(targetId),
    ])
      .then(([pRes, rRes]) => {
        setProfile(pRes.data.user);
        setReviews(rRes.data.reviews);
        setForm({
          firstName: pRes.data.user.firstName,
          lastName:  pRes.data.user.lastName,
          bio:       pRes.data.user.bio || '',
          location:  pRes.data.user.location || '',
          skillsWanted: (pRes.data.user.skillsWanted || []).join(', '),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (isOwn && me?._id) {
      skillsAPI.getAll({ limit: 20 }).then(res => {
        setMySkills(res.data.skills.filter(s => s.owner?._id === me._id));
      }).catch(() => {});
    }
  }, [id, me]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        ...form,
        skillsWanted: form.skillsWanted.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await usersAPI.updateProfile(updates);
      setProfile(res.data.user);
      updateUser(res.data.user);
      setEditing(false);
      showToast('Profile updated!');
    } catch {
      showToast('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await skillsAPI.delete(skillId);
      setMySkills(s => s.filter(sk => sk._id !== skillId));
      showToast('Skill removed.');
    } catch {
      showToast('Could not remove skill.');
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading profile...</div>
  );
  if (!profile) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>User not found.</div>
  );

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const av = getAv(fullName);

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1px solid #d1d5db', borderRadius: 8,
    fontSize: 14, outline: 'none',
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          background: '#1a7a5e', color: '#fff',
          padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
        }}>{toast}</div>
      )}

      {/* ── Profile Header ──────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 16, padding: 28, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: av.bg, color: av.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, flexShrink: 0,
          }}>
            {initials}
          </div>

          <div style={{ flex: 1 }}>
            {editing ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <input style={inputStyle} value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="First name" />
                  <input style={inputStyle} value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="Last name" />
                </div>
                <input style={{ ...inputStyle, marginBottom: 10 }} value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Location (e.g. Hyderabad, India)" />
                <textarea style={{ ...inputStyle, height: 80, resize: 'vertical', marginBottom: 10 }}
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell others about yourself..." />
                <input style={{ ...inputStyle, marginBottom: 10 }} value={form.skillsWanted}
                  onChange={e => setForm(f => ({ ...f, skillsWanted: e.target.value }))}
                  placeholder="Skills you want to learn (comma-separated)" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSave} disabled={saving} style={{
                    background: '#1a7a5e', color: '#fff', padding: '8px 20px',
                    borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditing(false)} style={{
                    background: 'transparent', color: '#6b7280', padding: '8px 20px',
                    borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, cursor: 'pointer',
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>{fullName}</h1>
                  {profile.isPremium && (
                    <span style={{
                      background: '#fef3c7', color: '#b45309',
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                    }}>
                      ⭐ {profile.premiumPlan?.toUpperCase()}
                    </span>
                  )}
                  {profile.isVerified && (
                    <span style={{
                      background: '#dcfce7', color: '#15803d',
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                    }}>
                      ✓ Verified
                    </span>
                  )}
                </div>
                {profile.location && (
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                    📍 {profile.location}
                  </div>
                )}
                {profile.bio && (
                  <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 12 }}>
                    {profile.bio}
                  </p>
                )}

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { val: profile.rating > 0 ? profile.rating.toFixed(1) : '—', label: 'Rating', icon: '★' },
                    { val: profile.totalSessions, label: 'Sessions', icon: '🤝' },
                    { val: profile.totalReviews, label: 'Reviews', icon: '💬' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#1a7a5e' }}>
                        {s.icon} {s.val}
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {isOwn && (
                  <button onClick={() => setEditing(true)} style={{
                    marginTop: 14, background: 'transparent', color: '#1a7a5e',
                    border: '1px solid #1a7a5e', padding: '7px 16px',
                    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Edit Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ── Skills Wanted ───────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Wants to Learn</h2>
          {profile.skillsWanted?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.skillsWanted.map(s => (
                <span key={s} style={{
                  background: '#fff8ee', color: '#92400e',
                  border: '1px solid #f4a340', padding: '5px 12px',
                  borderRadius: 20, fontSize: 13, fontWeight: 500,
                }}>
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#9ca3af' }}>No skills listed yet.</p>
          )}
        </div>

        {/* ── My Listed Skills ────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Skills Offered</h2>
          {mySkills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mySkills.map(sk => (
                <div key={sk._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', background: '#f9fafb',
                  borderRadius: 8, fontSize: 13,
                }}>
                  <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{sk.title}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#6b7280', padding: '2px 8px', background: '#e5e7eb', borderRadius: 10 }}>
                      {sk.category}
                    </span>
                    {isOwn && (
                      <button onClick={() => handleDeleteSkill(sk._id)} style={{
                        background: '#fef2f2', color: '#dc2626', border: 'none',
                        padding: '2px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                      }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#9ca3af' }}>No skills listed yet.</p>
          )}
        </div>
      </div>

      {/* ── Reviews ─────────────────────────────────── */}
      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <div style={{
            background: '#f9fafb', border: '1px dashed #d1d5db',
            borderRadius: 12, padding: 32, textAlign: 'center',
            fontSize: 14, color: '#9ca3af',
          }}>
            No reviews yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map(r => {
              const rName = `${r.reviewer?.firstName} ${r.reviewer?.lastName}`;
              const rAv = getAv(rName);
              return (
                <div key={r._id} style={{
                  background: '#fff', border: '1px solid #e5e7eb',
                  borderRadius: 12, padding: 18,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: rAv.bg, color: rAv.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {r.reviewer ? `${r.reviewer.firstName[0]}${r.reviewer.lastName[0]}` : '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{rName}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: 14 }}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>{r.comment}</p>
                  )}
                  {r.skillSwapped && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#1a7a5e', fontWeight: 500 }}>
                      Skill swapped: {r.skillSwapped}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
