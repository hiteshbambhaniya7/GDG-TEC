import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AiBadge = ({ confidence, department, severityScore, safetyHazard, priority }) => {
  const getPriorityColor = (p) => {
    switch (p?.toLowerCase()) {
      case 'urgent': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
      case 'high': return { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
      case 'medium': return { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)' };
      default: return { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
    }
  };

  const priorityStyle = getPriorityColor(priority);

  return (
    <div style={{
      display: 'inline-flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.25))',
        color: '#a5f3fc',
        border: '1px solid rgba(6, 182, 212, 0.4)',
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.03em'
      }}>
        <Sparkles size={12} /> AI TRIAGED ({Math.round((confidence || 0.85) * 100)}%)
      </span>

      {priority && (
        <span style={{
          background: priorityStyle.bg,
          color: priorityStyle.text,
          border: `1px solid ${priorityStyle.border}`,
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          {priority}
        </span>
      )}

      {safetyHazard && (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'rgba(239, 68, 68, 0.2)',
          color: '#fca5a5',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700
        }}>
          <AlertTriangle size={12} /> HAZARD
        </span>
      )}

      {severityScore && (
        <span style={{
          background: 'rgba(255, 255, 255, 0.07)',
          color: '#e2e8f0',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '0.2rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600
        }}>
          Severity: {severityScore}/10
        </span>
      )}
    </div>
  );
};
