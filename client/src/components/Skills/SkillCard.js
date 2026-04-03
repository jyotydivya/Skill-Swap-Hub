import React from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
  Tech:     { bg: '#dbeafe', color: '#1d4ed8' },
  Design:   { bg: '#ede9fe', color: '#6d28d9' },
  Business: { bg: '#dcfce7', color: '#15803d' },
  Media:    { bg: '#fdf4ff', color: '#7e22ce' },
  Music:    { bg: '#fff1f2', color: '#be123c' },
  Language: { bg: '#fef9ee', color: '#b45309' },
  Fitness:  { bg: '#f0fdf4', color: '#15803d' },
  Cooking:  { bg: '#fff7ed', color: '#c2410c' },
  Other:    { bg: '#f3f4f6', color: '#6b7280' },
};

const AVATAR_COLORS = [
  { bg: '#d1fae5', color: '#065f46' },
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#fef3c7', color: '#b45309' },
  { bg: '#fdf4ff', color: '#7e22ce' },
];

function getAvatarColor(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function SkillCard({ skill, onRequest }) {
  const navigate = useNavigate();
  const cat = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.Other;
  const ownerName = skill.owner
    ? `${skill.owner.firstName} ${skill.owner.lastName}`
    : 'Unknown';
  const av = getAvatarColor(ownerName);
  const initials = skill.owner
    ? `${skill.owner.firstName[0]}${skill.owner.lastName[0]}`
    : '?';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      padding: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'box-shadow 0.15s, transform 0.15s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 9px',
          borderRadius: 20, background: cat.bg, color: cat.color,
        }}>
          {skill.category}
        </span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>
          {skill.mode}
        </span>
      </div>

      {/* Title */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
          {skill.title}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {skill.description}
        </div>
      </div>

      {/* Owner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${skill.owner?._id}`); }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: av.bg, color: av.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{ownerName}</div>
          {skill.owner?.location && (
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{skill.owner.location}</div>
          )}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#f59e0b' }}>
          {'★'.repeat(Math.round(skill.owner?.rating || 0))}
          <span style={{ color: '#6b7280', marginLeft: 3 }}>
            {skill.owner?.rating > 0 ? skill.owner.rating.toFixed(1) : 'New'}
          </span>
        </div>
      </div>

      {/* Wants in return */}
      {skill.wantsInReturn?.length > 0 && (
        <div style={{ fontSize: 11, color: '#6b7280' }}>
          Wants: {' '}
          <span style={{ color: '#1a7a5e', fontWeight: 600 }}>
            {skill.wantsInReturn.join(', ')}
          </span>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10, marginTop: 2 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onRequest && onRequest(skill); }}
          style={{
            width: '100%', padding: '8px', borderRadius: 7,
            background: '#1a7a5e', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.target.style.background = '#145f49'}
          onMouseLeave={e => e.target.style.background = '#1a7a5e'}
        >
          Request Swap
        </button>
      </div>
    </div>
  );
}
