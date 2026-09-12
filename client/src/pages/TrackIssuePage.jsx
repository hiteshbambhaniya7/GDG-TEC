import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AiBadge } from '../components/common/AiBadge';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Star, 
  Calendar, 
  User, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Share2
} from 'lucide-react';

export const TrackIssuePage = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(trackingId || '');
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Citizen Feedback Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const sampleTickets = ['SB-2026-101', 'SB-2026-102', 'SB-2026-103', 'SB-2026-105', 'SB-2026-106'];

  useEffect(() => {
    if (trackingId) {
      fetchIssue(trackingId);
    }
  }, [trackingId]);

  const fetchIssue = async (id) => {
    setLoading(true);
    setError('');
    setFeedbackSuccess('');
    try {
      const res = await api.getIssueByTrackingId(id.trim());
      setIssue(res.data);
      if (res.data.citizenFeedback) {
        setRating(res.data.citizenFeedback.rating || 5);
        setComment(res.data.citizenFeedback.comment || '');
      }
    } catch (err) {
      setError(`No issue found matching tracking code "${id}". Check the ID or select one from the quick list.`);
      setIssue(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track/${searchId.trim()}`);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!issue) return;
    setSubmittingFeedback(true);
    try {
      const res = await api.submitFeedback(issue._id, { rating, comment });
      setIssue(res.data);
      setFeedbackSuccess('Thank you! Your feedback has been recorded and factored into BMC service quality metrics.');
    } catch (err) {
      setError('Failed to submit feedback: ' + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="badge badge-resolved"><CheckCircle2 size={13} /> RESOLVED</span>;
      case 'in_progress':
        return <span className="badge badge-in_progress"><Clock size={13} /> IN PROGRESS</span>;
      case 'assigned':
        return <span className="badge badge-medium"><Building2 size={13} /> DISPATCHED</span>;
      case 'ai_analyzed':
        return <span className="badge badge-ai"><Sparkles size={13} /> AI TRIAGED</span>;
      default:
        return <span className="badge badge-medium"><Clock size={13} /> SUBMITTED</span>;
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '1000px' }}>
      {/* Search Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Live Civic Issue Tracking</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Inspect ground-level resolution audit trails and Before/After photographic evidence.
        </p>

        <form onSubmit={handleSearch} style={{
          maxWidth: '560px',
          margin: '0 auto 1rem auto',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Enter Tracking ID (e.g. SB-2026-102)"
              className="form-input"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              style={{ paddingLeft: '2.8rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Track Ticket'}
          </button>
        </form>

        {/* Quick Sample Tickets */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Quick Demo Cases:</span>
          {sampleTickets.map(ticket => (
            <button
              key={ticket}
              type="button"
              onClick={() => {
                setSearchId(ticket);
                navigate(`/track/${ticket}`);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#38bdf8',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              {ticket}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          {error}
        </div>
      )}

      {issue && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Main Case Header Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#38bdf8',
                    letterSpacing: '0.04em'
                  }}>
                    {issue.trackingId}
                  </span>
                  {getStatusBadge(issue.status)}
                  <AiBadge
                    confidence={issue.aiAnalysis?.confidence}
                    department={issue.assignedDepartment}
                    severityScore={issue.aiAnalysis?.severityScore}
                    safetyHazard={issue.aiAnalysis?.safetyHazard}
                    priority={issue.priority}
                  />
                </div>
                <h2 style={{ fontSize: '1.6rem', lineHeight: 1.3 }}>{issue.title}</h2>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {issue.description}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                <div style={{ fontWeight: 600, color: '#38bdf8', marginTop: '0.15rem' }}>
                  {issue.assignedDepartment}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Location / Ward:</span>
                <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>
                  {issue.location?.ward}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Reported On:</span>
                <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>
                  {new Date(issue.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Dispatched Officer:</span>
                <div style={{ fontWeight: 600, color: '#c084fc', marginTop: '0.15rem' }}>
                  {issue.assignedOfficer?.officerName || 'Queueing for Field Dispatch'}
                </div>
              </div>
            </div>
          </div>

          {/* Photographic Evidence: Before vs After Side-by-Side */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="#10b981" /> Ground-Truth Photographic Verification
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Before Photo */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.4rem 0.8rem',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#f87171'
                }}>
                  <span>BEFORE: CITIZEN REPORT</span>
                  <span>ORIGINAL</span>
                </div>
                <div style={{ height: '260px', background: '#0f172a', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', overflow: 'hidden' }}>
                  {issue.images?.[0] ? (
                    <img
                      src={issue.images[0].startsWith('http') ? issue.images[0] : `http://localhost:5000${issue.images[0]}`}
                      alt="Before"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                      No photographic proof attached
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Reported at {issue.location?.landmark || issue.location?.address}
                </div>
              </div>

              {/* After Photo */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: issue.resolution?.proofImage ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid',
                  borderColor: issue.resolution?.proofImage ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)',
                  padding: '0.4rem 0.8rem',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: issue.resolution?.proofImage ? '#34d399' : 'var(--text-muted)'
                }}>
                  <span>AFTER: BMC RESOLUTION PROOF</span>
                  <span>{issue.resolution?.proofImage ? 'VERIFIED' : 'PENDING'}</span>
                </div>
                <div style={{
                  height: '260px',
                  background: '#0f172a',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {issue.resolution?.proofImage ? (
                    <img
                      src={issue.resolution.proofImage.startsWith('http') ? issue.resolution.proofImage : `http://localhost:5000${issue.resolution.proofImage}`}
                      alt="After"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                      <Clock size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                      <div style={{ fontWeight: 600 }}>Work In Progress</div>
                      <div style={{ fontSize: '0.78rem' }}>Proof photo will be uploaded once field repairs conclude.</div>
                    </div>
                  )}
                </div>
                {issue.resolution?.notes && (
                  <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '0.4rem', fontWeight: 500 }}>
                    Official Note: {issue.resolution.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step-by-Step Municipal Timeline */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="#38bdf8" /> Official BMC Municipal Audit Timeline
            </h3>

            <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(56, 189, 248, 0.3)' }}>
              {issue.timeline?.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '1.75rem', position: 'relative' }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-1.95rem',
                    top: '0.15rem',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: item.status === 'resolved' ? '#10b981' : '#38bdf8',
                    border: '3px solid #0f172a'
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: item.status === 'resolved' ? '#34d399' : '#f8fafc',
                      textTransform: 'uppercase'
                    }}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      • {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      color: '#94a3b8'
                    }}>
                      by {item.updatedBy}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Feedback & Star Rating */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} color="#fbbf24" fill="#fbbf24" /> Citizen Satisfaction Sign-Off
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Rate the speed and quality of this municipal resolution. Your score directly influences Bhavnagar ward performance metrics.
            </p>

            {feedbackSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.88rem'
              }}>
                {feedbackSuccess}
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Your Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      color: star <= rating ? '#fbbf24' : '#475569'
                    }}
                  >
                    <Star size={26} fill={star <= rating ? '#fbbf24' : 'none'} />
                  </button>
                ))}
                <span style={{ marginLeft: '0.5rem', fontWeight: 700, color: '#fbbf24' }}>
                  {rating} / 5 Stars
                </span>
              </div>

              <div className="form-group">
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                  placeholder="Share details on whether the repair was properly completed on ground..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submittingFeedback}
                className="btn btn-primary"
              >
                {submittingFeedback ? 'Recording Rating...' : 'Submit Citizen Rating'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
