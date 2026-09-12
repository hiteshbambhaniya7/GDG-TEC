import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Sparkles, RefreshCw, UserCheck, Shield } from 'lucide-react';

export const DemoBanner = () => {
  const { user, switchPersona, personas } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    setResetting(true);
    setMessage('');
    try {
      await api.seedDemo();
      setMessage('Demo data refreshed!');
      setTimeout(() => {
        setMessage('');
        window.location.reload();
      }, 900);
    } catch (err) {
      setMessage('Reset failed: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
      padding: '0.45rem 1rem',
      fontSize: '0.82rem',
      color: '#cbd5e1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.5rem',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'rgba(139, 92, 246, 0.25)',
          color: '#c4b5fd',
          padding: '0.15rem 0.5rem',
          borderRadius: '4px',
          fontWeight: 700,
          letterSpacing: '0.04em'
        }}>
          <Sparkles size={13} /> HACKATHON LIVE DEMO
        </span>
        <span style={{ color: '#94a3b8' }}>Switch Persona:</span>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {personas.map((p) => {
            const isActive = user?.phone === p.phone;
            return (
              <button
                key={p.key}
                onClick={() => switchPersona(p.key)}
                style={{
                  background: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: '1px solid',
                  borderColor: isActive ? '#60a5fa' : 'rgba(255, 255, 255, 0.1)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label.split(' ')[0]} ({p.role})
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {message && (
          <span style={{ color: '#34d399', fontWeight: 600 }}>{message}</span>
        )}
        <button
          onClick={handleReset}
          disabled={resetting}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
          title="Reset database to clean Bhavnagar demo issues"
        >
          <RefreshCw size={12} className={resetting ? 'animate-spin' : ''} />
          {resetting ? 'Resetting...' : 'Reset Demo Data'}
        </button>
      </div>
    </div>
  );
};
