import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard', roles: ['user', 'agent', 'admin'] },
  { to: '/tickets', icon: '🎫', label: 'Tickets', roles: ['user', 'agent', 'admin'] },
  { to: '/tickets/new', icon: '➕', label: 'New Ticket', roles: ['user', 'admin'] },
  { to: '/knowledge-base', icon: '📚', label: 'Knowledge Base', roles: ['user', 'agent', 'admin'] },
];

const adminItems = [
  { to: '/reports', icon: '📈', label: 'Reports', roles: ['admin', 'agent'] },
  { to: '/admin', icon: '⚙️', label: 'Admin Panel', roles: ['admin'] },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const visible = (roles) => roles.includes(user?.role);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <nav className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`} id="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎯</div>
          <span className="sidebar-logo-text">TicketFlow</span>
          {/* Mobile close button */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          {navItems.filter(i => visible(i.roles)).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {(user?.role === 'admin' || user?.role === 'agent') && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: 8 }}>Management</div>
              {adminItems.filter(i => visible(i.roles)).map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}

          <div className="sidebar-section-label" style={{ marginTop: 8 }}>Account</div>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="icon">👤</span> Profile
          </NavLink>

          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', color: 'var(--danger)', marginTop: 4 }}
          >
            <span className="icon">🚪</span> Logout
          </button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.avatar ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
      </nav>
    </>
  );
}
