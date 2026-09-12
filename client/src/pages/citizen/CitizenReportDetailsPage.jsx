import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import L from 'leaflet';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Copy, 
  Check, 
  Share2, 
  Star, 
  ShieldCheck, 
  User, 
  FileText, 
  ExternalLink,
  Sparkles,
  Loader2
} from 'lucide-react';

export const CitizenReportDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Citizen Rating Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState('');

  // Mini Map references
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (id) {
      loadIssueDetails(id);
    }
  }, [id]);

  const loadIssueDetails = async (targetId) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getIssueById(targetId);
      if (res.data) {
        setIssue(res.data);
        if (res.data.citizenFeedback) {
          setRating(res.data.citizenFeedback.rating || 5);
          setComment(res.data.citizenFeedback.comment || '');
        }
      } else {
        throw new Error('No issue data returned.');
      }
    } catch (err) {
      console.error('Error fetching issue:', err);
      setError(`Civic grievance ticket "${targetId}" could not be found.`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize mini map
  useEffect(() => {
    if (!issue || !mapContainerRef.current) return;

    const lat = issue.latitude || issue.location?.coordinates?.[1] || 21.7645;
    const lng = issue.longitude || issue.location?.coordinates?.[0] || 72.1519;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background:#06b6d4; width:22px; height:22px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 12px rgba(6,182,212,0.8);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }, [issue]);

  const handleCopyIssueNumber = () => {
    const num = issue?.issueNumber || issue?.trackingId;
    if (num) {
      navigator.clipboard.writeText(num);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!issue) return;
    setSubmittingRating(true);
    try {
      const res = await api.submitFeedback(issue._id, { rating, comment });
      setIssue(res.data);
      setRatingSuccess('Thank you! Your verified citizen audit has been recorded in the BMC Municipal record.');
    } catch (err) {
      alert('Failed to submit rating: ' + err.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') {
      return (
        <span className="badge badge-resolved" style={{ fontSize: '0.9rem', padding: '0.35rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <CheckCircle2 size={15} /> Resolved
        </span>
      );
    }
    if (s.includes('progress')) {
      return (
        <span className="badge badge-in_progress" style={{ fontSize: '0.9rem', padding: '0.35rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Activity size={15} /> In Progress
        </span>
      );
    }
    if (s === 'reopened') {
      return (
        <span className="badge badge-urgent" style={{ fontSize: '0.9rem', padding: '0.35rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <AlertTriangle size={15} /> Reopened
        </span>
      );
    }
    return (
      <span className="badge badge-medium" style={{ fontSize: '0.9rem', padding: '0.35rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <Clock size={15} /> Pending
      </span>
    );
  };

  const getSeverityPill = (severity) => {
    const sev = (severity || 'Medium').toLowerCase();
    if (sev === 'critical') return <span className="badge badge-urgent">Critical Severity</span>;
    if (sev === 'high') return <span className="badge badge-high">High Severity</span>;
    if (sev === 'low') return <span className="badge badge-low">Low Severity</span>;
    return <span className="badge badge-medium">Medium Severity</span>;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#06b6d4' }} />
        <div>Loading report details for #{id}...</div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <AlertTriangle size={48} color="#f87171" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Report Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error || 'The requested civic issue could not be found.'}
          </p>
          <Link to="/citizen/reports" className="btn btn-primary btn-sm">
            Back to My Reports
          </Link>
        </div>
      </div>
    );
  }

  // Determine milestone progress step (0 = Reported, 1 = Assigned, 2 = Work Started, 3 = Resolved)
  const isResolved = (issue.status || '').toLowerCase() === 'resolved';
  const isInProgress = (issue.status || '').toLowerCase().includes('progress');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/citizen/reports')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Back to My Reports
        </button>

        <button
          onClick={handleCopyIssueNumber}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          {copied ? 'Copied ID' : 'Share / Copy ID'}
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.12)',
                padding: '0.25rem 0.65rem',
                borderRadius: '8px'
              }}>
                {issue.issueNumber || issue.trackingId}
              </span>
              {getSeverityPill(issue.severity)}
            </div>
            <h1 style={{ fontSize: '1.75rem', lineHeight: 1.3, marginBottom: '0.5rem' }}>
              {issue.title || issue.description}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={15} color="#06b6d4" />
                <strong style={{ color: '#fff' }}>{issue.department || issue.assignedDepartment}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} color="#06b6d4" />
                <span>{issue.area || 'Bhavnagar'} • {issue.ward}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} />
                <span>{issue.createdAt ? new Date(issue.createdAt).toLocaleString() : 'Recent'}</span>
              </span>
            </div>
          </div>

          <div>
            {getStatusBadge(issue.status)}
          </div>
        </div>

        {/* Visual Progress Milestones */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
            Resolution Progress Milestone
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {[
              { label: 'Reported', done: true },
              { label: 'Assigned', done: isInProgress || isResolved },
              { label: 'Work Started', done: isInProgress || isResolved },
              { label: 'Resolved', done: isResolved }
            ].map((st, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: st.done ? '#10b981' : 'rgba(255,255,255,0.1)',
                  color: st.done ? '#fff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  boxShadow: st.done ? '0 0 14px rgba(16, 185, 129, 0.5)' : 'none',
                  marginBottom: '0.4rem'
                }}>
                  {st.done ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: st.done ? 600 : 400, color: st.done ? '#fff' : 'var(--text-muted)' }}>
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Details & Visuals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Left Column: Photos & Resolution Evidence */}
        <div>
          {/* Issue Photo */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Report Photographic Evidence</h2>
            {issue.imageUrl || issue.images?.[0] ? (
              <img
                src={issue.imageUrl || issue.images?.[0]}
                alt="Civic Issue"
                style={{
                  width: '100%',
                  maxHeight: '340px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}
              />
            ) : (
              <div style={{
                height: '180px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
              }}>
                No original photograph uploaded
              </div>
            )}
          </div>

          {/* Resolution Evidence (if resolved) */}
          {isResolved && (
            <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#10b981', fontWeight: 700 }}>
                <CheckCircle2 size={20} /> Verified Ground-Truth Resolution
              </div>

              {issue.resolutionImageUrl || issue.resolution?.proofImage ? (
                <div style={{ marginBottom: '1rem' }}>
                  <img
                    src={issue.resolutionImageUrl || issue.resolution?.proofImage}
                    alt="Resolution Proof"
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: '0.35rem', textAlign: 'center' }}>
                    Photo taken on-site by BMC Engineering Inspection Unit
                  </div>
                </div>
              ) : null}

              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {issue.resolutionNote || issue.resolution?.notes || 'Repairs completed by municipal field unit.'}
              </div>

              {issue.resolvedAt && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Resolved on: {new Date(issue.resolvedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Citizen Feedback & Rating (if resolved) */}
          {isResolved && (
            <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Citizen Audit Rating</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Inspect the resolution work above and rate your satisfaction with BMC's repair quality.
              </p>

              {ratingSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: '8px', color: '#6ee7b7', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {ratingSuccess}
                </div>
              )}

              <form onSubmit={handleRatingSubmit}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: star <= rating ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                        transition: 'transform 0.1s'
                      }}
                    >
                      <Star size={28} fill={star <= rating ? '#fbbf24' : 'transparent'} />
                    </button>
                  ))}
                  <span style={{ alignSelf: 'center', marginLeft: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#fbbf24' }}>
                    {rating} / 5 Stars
                  </span>
                </div>

                <div className="form-group">
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Provide comments on the quality of repair..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRating}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {submittingRating ? <Loader2 size={14} className="animate-spin" /> : null}
                  Submit Audit Review
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Location Map & Detailed Timeline History */}
        <div>
          {/* Location Details & Mini Map */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} color="#06b6d4" /> Geo-Location
            </h2>
            <div style={{ fontSize: '0.88rem', marginBottom: '0.35rem' }}>
              <strong style={{ color: '#fff' }}>{issue.address}</strong>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {issue.area} • {issue.ward} • ({issue.latitude}, {issue.longitude})
            </div>

            <div 
              ref={mapContainerRef}
              style={{
                height: '180px',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)'
              }}
            />
          </div>

          {/* Audit History Timeline */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} color="#06b6d4" /> Official Activity Timeline
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.25rem' }}>
              {/* Vertical guideline */}
              <div style={{ position: 'absolute', left: '4px', top: '8px', bottom: '8px', width: '2px', background: 'rgba(255,255,255,0.1)' }} />

              {(issue.history || issue.timeline || []).map((entry, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-1.45rem',
                    top: '3px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: idx === (issue.history || issue.timeline).length - 1 ? '#06b6d4' : '#10b981',
                    border: '2px solid #0a0e17'
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#fff' }}>
                      {entry.action || entry.status}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {entry.createdAt || entry.timestamp ? new Date(entry.createdAt || entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.25rem' }}>
                    {entry.description || entry.notes}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    By: {entry.performedBy || entry.updatedBy || 'Municipal System'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
