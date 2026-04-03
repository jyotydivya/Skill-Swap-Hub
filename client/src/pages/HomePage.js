import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { skillsAPI } from '../utils/api';
import SkillCard from '../components/Skills/SkillCard';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    skillsAPI.getAll({ limit: 6 })
      .then(res => setFeatured(res.data.skills))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf9 0%, #e6f5f0 50%, #fff8ee 100%)',
        padding: '72px 20px 60px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#d1fae5', color: '#065f46',
            padding: '5px 14px', borderRadius: 20,
            fontSize: 13, fontWeight: 600, marginBottom: 20,
          }}>
            ✦ Peer-to-peer skill exchange platform
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 52px)',
            fontWeight: 900, lineHeight: 1.12,
            color: '#1a1a1a', marginBottom: 18,
          }}>
            Teach what you know.<br />
            <span style={{ color: '#1a7a5e' }}>Learn what you love.</span>
          </h1>

          <p style={{
            fontSize: 17, color: '#4b5563',
            maxWidth: 480, margin: '0 auto 32px',
            lineHeight: 1.7,
          }}>
            Trade skills directly with real people — no money needed.
            Just knowledge, time, and collaboration.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/search" style={{
              background: '#1a7a5e', color: '#fff',
              padding: '13px 28px', borderRadius: 9,
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
            }}>
              Browse Skills
            </Link>
            {!user && (
              <Link to="/register" style={{
                background: '#fff', color: '#1a7a5e',
                padding: '13px 28px', borderRadius: 9,
                fontSize: 15, fontWeight: 700, textDecoration: 'none',
                border: '2px solid #1a7a5e',
              }}>
                Join Free
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
        {/* ── Stats ──────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16, margin: '40px 0',
        }}>
          {[
            { num: '2,840+', label: 'Active Users' },
            { num: '5,120+', label: 'Skills Listed' },
            { num: '1,390+', label: 'Sessions Completed' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 12, padding: '22px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1a7a5e', marginBottom: 4 }}>
                {s.num}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── How It Works ───────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 24, textAlign: 'center' }}>
            How SkillSwap works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { icon: '📝', step: '1', title: 'List Your Skill', desc: 'Add what you can teach and what you want to learn in return.' },
              { icon: '🔍', step: '2', title: 'Find a Match', desc: 'Search, filter by category or location, and connect with the right person.' },
              { icon: '🤝', step: '3', title: 'Send a Request', desc: 'Propose a swap — offer your skill in exchange for theirs.' },
              { icon: '⭐', step: '4', title: 'Learn & Rate', desc: 'Complete your session, then leave a review to build your reputation.' },
            ].map(step => (
              <div key={step.step} style={{
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 14, padding: '24px 20px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{step.icon}</div>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: '#1a7a5e', color: '#fff',
                  fontSize: 12, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px',
                }}>
                  {step.step}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Featured Skills ─────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>
              Recently Listed Skills
            </h2>
            <Link to="/search" style={{ fontSize: 14, color: '#1a7a5e', fontWeight: 600 }}>
              View all →
            </Link>
          </div>

          {featured.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {featured.map(skill => (
                <SkillCard
                  key={skill._id}
                  skill={skill}
                  onRequest={() => user ? navigate('/search') : navigate('/login')}
                />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '48px 20px',
              background: '#f9fafb', borderRadius: 14,
              border: '1px dashed #d1d5db',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🌱</div>
              <div style={{ fontSize: 15, color: '#6b7280', marginBottom: 16 }}>
                No skills listed yet — be the first!
              </div>
              <Link to="/register" style={{
                background: '#1a7a5e', color: '#fff',
                padding: '10px 22px', borderRadius: 8,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                Add Your Skill
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
