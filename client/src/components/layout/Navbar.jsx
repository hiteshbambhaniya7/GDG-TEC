import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  MapPin, 
  CheckCircle2, 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  User 
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #ffffff 0%, #a5f3fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Smart Bhavnagar
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              BMC AI Civic Management Portal
            </div>
          </div>
        </Link>

        {/* Main Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/') ? '#38bdf8' : 'var(--text-secondary)',
              background: isActive('/') ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              transition: 'all 0.15s ease'
            }}
          >
            Home
          </Link>

          <Link
            to="/report"
            className="btn btn-primary btn-sm"
            style={{
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
              margin: '0 0.25rem'
            }}
          >
            <PlusCircle size={15} /> Report Issue
          </Link>

          <Link
            to="/track"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/track') ? '#38bdf8' : 'var(--text-secondary)',
              background: isActive('/track') ? 'rgba(56, 189, 248, 0.1)' : 'transparent'
            }}
          >
            <Search size={15} /> Track
          </Link>

          <Link
            to="/map"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/map') ? '#38bdf8' : 'var(--text-secondary)',
              background: isActive('/map') ? 'rgba(56, 189, 248, 0.1)' : 'transparent'
            }}
          >
            <MapPin size={15} /> Civic Map
          </Link>

          <Link
            to="/feed"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/feed') ? '#38bdf8' : 'var(--text-secondary)',
              background: isActive('/feed') ? 'rgba(56, 189, 248, 0.1)' : 'transparent'
            }}
          >
            <CheckCircle2 size={15} /> Resolutions
          </Link>

          <Link
            to="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/admin') ? '#c084fc' : '#a855f7',
              background: isActive('/admin') ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.25)'
            }}
          >
            <LayoutDashboard size={15} /> BMC Command
          </Link>
        </nav>

        {/* Auth / Profile Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                <User size={14} color="#38bdf8" />
                <span style={{ fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
                <span style={{
                  fontSize: '0.7rem',
                  color: user?.role === 'citizen' ? '#34d399' : '#c084fc',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px'
                }}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                title="Sign Out"
                style={{ padding: '0.4rem' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-secondary btn-sm">
              <LogIn size={15} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
