import React from 'react';
import { Building2, PhoneCall, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(8, 12, 20, 0.95)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '2.5rem 1.5rem 1.5rem 1.5rem',
      fontSize: '0.88rem',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Col 1 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginBottom: '0.75rem' }}>
            <Building2 size={20} color="#06b6d4" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem' }}>
              Smart Bhavnagar
            </span>
          </div>
          <p style={{ lineHeight: 1.6, marginBottom: '0.75rem', fontSize: '0.84rem' }}>
            An AI-orchestrated civic reporting, municipal triage, and ground-truth resolution platform for Bhavnagar Municipal Corporation (BMC).
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.8rem' }}>
            <ShieldCheck size={14} /> Open Public Governance & Transparency
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 style={{ fontSize: '0.92rem', color: '#fff', marginBottom: '0.75rem' }}>Emergency Municipal Contacts</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>
              <span style={{ color: 'var(--text-secondary)' }}>BMC Civic Call Center:</span>{' '}
              <strong style={{ color: '#38bdf8' }}>1916 / 0278-2424888</strong>
            </li>
            <li>
              <span style={{ color: 'var(--text-secondary)' }}>Fire & Disaster Response:</span>{' '}
              <strong style={{ color: '#f87171' }}>101 / 0278-2424101</strong>
            </li>
            <li>
              <span style={{ color: 'var(--text-secondary)' }}>Water Works Emergency:</span>{' '}
              <strong style={{ color: '#60a5fa' }}>0278-2423123</strong>
            </li>
            <li>
              <span style={{ color: 'var(--text-secondary)' }}>Solid Waste Quick Dispatch:</span>{' '}
              <strong style={{ color: '#34d399' }}>0278-2425555</strong>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 style={{ fontSize: '0.92rem', color: '#fff', marginBottom: '0.75rem' }}>Bhavnagar City Wards</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', fontSize: '0.75rem' }}>
            {['Kaliyabid', 'Waghawadi', 'Nilambag', 'Ghogha Circle', 'Chitra GIDC', 'Sardarnagar', 'Kalanala', 'Crescent', 'Sidsar', 'Akwada Lake'].map((w) => (
              <span key={w} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.07)'
              }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '1.25rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.8rem'
      }}>
        <div>
          © 2026 Smart Bhavnagar. Built for GDG Hackathon.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          Empowering citizens of Bhavnagar with AI
        </div>
      </div>
    </footer>
  );
};
