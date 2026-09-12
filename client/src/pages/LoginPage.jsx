import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Building2, LogIn, UserPlus, AlertCircle, Shield, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login, switchPersona, personas } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ward, setWard] = useState('Ward 1 - Kaliyabid & Hill Drive');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          name,
          phone,
          password,
          ward,
          role: 'citizen'
        });
        localStorage.setItem('smart_bhavnagar_token', res.data.token);
        window.location.href = '/';
      } else {
        await login(phone, password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersona = async (personaKey) => {
    setError('');
    setLoading(true);
    try {
      await switchPersona(personaKey);
      navigate('/admin');
    } catch (err) {
      setError('Persona login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '540px', marginTop: '2rem' }}>
      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            margin: '0 auto 1rem auto',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <Building2 size={26} />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>
            {isRegister ? 'Citizen Registration' : 'Sign in to Smart Bhavnagar'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {isRegister ? 'Create an account to track all your civic reports' : 'Access citizen tracking and municipal department controls'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Ramesh Patel"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Mobile Phone Number</label>
            <input
              type="tel"
              required
              className="form-input"
              placeholder="e.g. 9898000001"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Bhavnagar Ward</label>
              <select
                className="form-select"
                value={ward}
                onChange={e => setWard(e.target.value)}
              >
                <option value="Ward 1 - Kaliyabid & Hill Drive">Ward 1 - Kaliyabid & Hill Drive</option>
                <option value="Ward 2 - Waghawadi Road & Takhteshwar">Ward 2 - Waghawadi Road & Takhteshwar</option>
                <option value="Ward 3 - Nilambag & Ghogha Circle">Ward 3 - Nilambag & Ghogha Circle</option>
                <option value="Ward 4 - Chitra GIDC & Subhashnagar">Ward 4 - Chitra GIDC & Subhashnagar</option>
                <option value="Ward 7 - Kalanala & Crescent Circle">Ward 7 - Kalanala & Crescent Circle</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Complete Registration' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register as Citizen"}
          </button>
        </div>

        {/* 1-Click Demo Login Box */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#c4b5fd',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Sparkles size={13} /> 1-CLICK DEMO LOGIN (JUDGES & EVALUATORS)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {personas.map(p => (
              <button
                key={p.key}
                type="button"
                onClick={() => handleQuickPersona(p.key)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.6rem 0.5rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                  {p.label.split(' (')[0]}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {p.role.toUpperCase()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
