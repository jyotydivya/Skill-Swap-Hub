import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const styles = {
  nav: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: 64,
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 20px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontFamily: 'system-ui',
    fontSize: 20,
    fontWeight: 800,
    color: '#1a7a5e',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    background: '#f4a340',
    display: 'inline-block',
  },
  links: { display: 'flex', alignItems: 'center', gap: 4 },
  link: {
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    color: '#6b7280',
    textDecoration: 'none',
    transition: 'all 0.15s',
  },
  activeLink: {
    color: '#1a7a5e',
    background: '#e6f5f0',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: '#d1fae5',
    color: '#1a7a5e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
    marginLeft: 8,
    border: 'none',
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '6px 0',
    minWidth: 160,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 200,
  },
  dropItem: {
    display: 'block',
    padding: '9px 16px',
    fontSize: 14,
    color: '#374151',
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
};

const getLinkStyle = ({ isActive }) => ({
  ...styles.link,
  ...(isActive ? styles.activeLink : {}),
});

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '';

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.dot} />
          SkillSwap Hub
        </Link>

        {/* Nav Links */}
        <div style={styles.links}>
          <NavLink to="/"       style={getLinkStyle} end>Home</NavLink>
          <NavLink to="/search" style={getLinkStyle}>Browse</NavLink>
          {user && <NavLink to="/bookings" style={getLinkStyle}>Bookings</NavLink>}
          {user && <NavLink to="/chat"     style={getLinkStyle}>Chat</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" style={getLinkStyle}>Admin</NavLink>}

          {!user ? (
            <>
              <Link to="/login"    style={{ ...styles.link }}>Login</Link>
              <Link to="/register" style={{
                ...styles.link,
                background: '#1a7a5e', color: '#fff',
                borderRadius: 6, padding: '7px 14px',
              }}>
                Join Free
              </Link>
            </>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                style={styles.avatar}
                onClick={() => setOpen(o => !o)}
                title={`${user.firstName} ${user.lastName}`}
              >
                {initials}
              </button>

              {open && (
                <div style={styles.dropdown}>
                  <Link
                    to="/profile"
                    style={styles.dropItem}
                    onClick={() => setOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/payment"
                    style={styles.dropItem}
                    onClick={() => setOpen(false)}
                  >
                    {user.isPremium ? '⭐ Premium Active' : 'Upgrade to Pro'}
                  </Link>
                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />
                  <button style={{ ...styles.dropItem, color: '#dc2626' }} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
