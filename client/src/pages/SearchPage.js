import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { skillsAPI, requestsAPI } from '../utils/api';
import SkillCard from '../components/Skills/SkillCard';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Tech', 'Design', 'Business', 'Media', 'Music', 'Language', 'Fitness', 'Cooking', 'Other'];

export default function SearchPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [skills, setSkills]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage]         = useState(1);
  const [toast, setToast]       = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newSkill, setNewSkill] = useState({
    title: '', description: '', category: 'Tech',
    level: 'Intermediate', mode: 'Online', wantsInReturn: '',
  });

  const fetchSkills = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    skillsAPI.getAll(params)
      .then(res => { setSkills(res.data.skills); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, page]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleRequest = async (skill) => {
    if (!user) { navigate('/login'); return; }
    try {
      await requestsAPI.send({
        to: skill.owner._id,
        skillOffered: 'My skill',
        skillWanted: skill.title,
        message: `Hi! I'd love to swap skills with you.`,
      });
      showToast(`Request sent to ${skill.owner.firstName}!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send request.');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      const data = {
        ...newSkill,
        wantsInReturn: newSkill.wantsInReturn.split(',').map(s => s.trim()).filter(Boolean),
      };
      await skillsAPI.create(data);
      showToast('Skill listed successfully!');
      setShowForm(false);
      setNewSkill({ title: '', description: '', category: 'Tech', level: 'Intermediate', mode: 'Online', wantsInReturn: '' });
      fetchSkills();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add skill.');
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 13px',
    border: '1px solid #d1d5db', borderRadius: 8,
    fontSize: 14, outline: 'none', background: '#fff',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: '#1a7a5e', color: '#fff',
          padding: '12px 20px', borderRadius: 10,
          fontSize: 14, fontWeight: 500, zIndex: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>Browse Skills</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
            {total} skill{total !== 1 ? 's' : ''} available
          </p>
        </div>
        {user && (
          <button
            onClick={() => setShowForm(f => !f)}
            style={{
              background: '#1a7a5e', color: '#fff',
              padding: '10px 20px', borderRadius: 8,
              border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            + List Your Skill
          </button>
        )}
      </div>

      {/* Add Skill Form */}
      {showForm && (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 14, padding: 24, marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add a New Skill</h2>
          <form onSubmit={handleAddSkill}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Title *</label>
                <input style={inputStyle} required
                  value={newSkill.title} placeholder="e.g. React.js Tutoring"
                  onChange={e => setNewSkill(s => ({ ...s, title: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Category *</label>
                <select style={inputStyle} value={newSkill.category}
                  onChange={e => setNewSkill(s => ({ ...s, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Description *</label>
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} required
                value={newSkill.description} placeholder="Describe what you'll teach..."
                onChange={e => setNewSkill(s => ({ ...s, description: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Level</label>
                <select style={inputStyle} value={newSkill.level}
                  onChange={e => setNewSkill(s => ({ ...s, level: e.target.value }))}>
                  {['Beginner','Intermediate','Advanced'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Mode</label>
                <select style={inputStyle} value={newSkill.mode}
                  onChange={e => setNewSkill(s => ({ ...s, mode: e.target.value }))}>
                  {['Online','In-person','Both'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Wants in return</label>
                <input style={inputStyle} value={newSkill.wantsInReturn}
                  placeholder="Design, Python, Music"
                  onChange={e => setNewSkill(s => ({ ...s, wantsInReturn: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{
                background: '#1a7a5e', color: '#fff', padding: '9px 22px',
                borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Publish Skill
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background: 'transparent', color: '#6b7280', padding: '9px 22px',
                borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search bar */}
      <input
        style={{
          width: '100%', padding: '12px 16px',
          border: '1px solid #d1d5db', borderRadius: 10,
          fontSize: 15, outline: 'none', marginBottom: 14, background: '#fff',
        }}
        placeholder="Search by skill name or keyword..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
      />

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              border: '1px solid',
              borderColor: category === cat ? '#1a7a5e' : '#e5e7eb',
              background: category === cat ? '#1a7a5e' : '#fff',
              color: category === cat ? '#fff' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Loading skills...</div>
      ) : skills.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 48, background: '#f9fafb',
          borderRadius: 14, border: '1px dashed #d1d5db',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, color: '#6b7280' }}>No skills found. Try a different search or category.</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {skills.map(skill => (
            <SkillCard key={skill._id} skill={skill} onRequest={handleRequest} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff' }}>
            ← Prev
          </button>
          <span style={{ padding: '8px 16px', fontSize: 14, color: '#6b7280' }}>
            Page {page} of {Math.ceil(total / 12)}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 12)}
            style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
