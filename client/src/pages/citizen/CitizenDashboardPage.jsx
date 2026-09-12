import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Search, 
  PhoneCall, 
  TrendingUp,
  FileText,
  Activity,
  Calendar
} from 'lucide-react';

export const CitizenDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch issues to calculate counts and show recent reports
      const res = await api.getIssues({ limit: 50 });
      if (res.data) {
        const all = res.data;
        const pending = all.filter(i => (i.status || '').toLowerCase() === 'pending').length;
        const inProgress = all.filter(i => (i.status || '').toLowerCase().includes('progress')).length;
        const resolved = all.filter(i => (i.status || '').toLowerCase() === 'resolved').length;

        setStats({
          total: res.total || all.length,
          pending,
          inProgress,
          resolved
        });

        // Top 6 recent reports
        setRecentReports(all.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to load citizen dashboard data:', err);
      setError('Unable to load latest municipal updates. Showing offline cached data.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') {
      return (
        <span className="badge badge-resolved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    }
    if (s.includes('progress')) {
      return (
        <span className="badge badge-in_progress" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <Activity size={12} /> In Progress
        </span>
      );
    }
    if (s === 'reopened') {
      return (
        <span className="badge badge-urgent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <AlertTriangle size={12} /> Reopened
        </span>
      );
    }
    return (
      <span className="badge badge-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        <Clock size={12} /> Pending
      </span>
    );
  };

  const getSeverityPill = (severity) => {
    const sev = (severity || 'Medium').toLowerCase();
    if (sev === 'critical') return <span className="badge badge-urgent">Critical</span>;
    if (sev === 'high') return <span className="badge badge-high">High</span>;
    if (sev === 'low') return <span className="badge badge-low">Low</span>;
    return <span className="badge badge-medium">Medium</span>;
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Citizen Welcome Banner */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '2rem', 
          marginBottom: '2rem',
          background: 'radial-gradient(ellipse at top right, rgba(6, 182, 212, 0.15), transparent 70%), var(--bg-card)',
          border: '1px solid rgba(6, 182, 212, 0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6, 182, 212, 0.12)', padding: '0.35rem 0.75rem', borderRadius: '20px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} /> Bhavnagar Municipal Corporation • Citizen Portal
            </div>
            <h1 style={{ fontSize: '2.1rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Welcome{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', fontSize: '0.98rem' }}>
              Report civic problems directly to Bhavnagar Municipal Corporation departments, track resolution in real time, and audit ground-truth repair photos.
            </p>
          </div>

          {/* Primary CTA */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/citizen/report"
              className="btn btn-primary btn-lg"
              style={{
                boxShadow: '0 0 24px rgba(6, 182, 212, 0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '1.05rem',
                padding: '0.85rem 1.6rem'
              }}
            >
              <PlusCircle size={20} /> Report a Problem
            </Link>
            <Link
              to="/citizen/reports"
              className="btn btn-secondary btn-lg"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.05rem',
                padding: '0.85rem 1.4rem'
              }}
            >
              <FileText size={18} /> My Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        {/* Total Reports */}
        <div className="glass-card glass-card-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Total Reports</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff' }}>
              {loading ? '...' : stats.total}
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="glass-card glass-card-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Pending</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f59e0b' }}>
              {loading ? '...' : stats.pending}
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-card glass-card-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>In Progress</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#06b6d4' }}>
              {loading ? '...' : stats.inProgress}
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="glass-card glass-card-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Resolved</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#10b981' }}>
              {loading ? '...' : stats.resolved}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Reports & City Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Recent Reports List */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Recent Civic Reports</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latest reports submitted across Bhavnagar wards</div>
            </div>
            <Link 
              to="/citizen/reports" 
              style={{ fontSize: '0.9rem', color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
            >
              View All Reports <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading recent reports...
            </div>
          ) : recentReports.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No civic reports found yet.</p>
              <Link to="/citizen/report" className="btn btn-primary btn-sm">
                Report the first issue
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {recentReports.map((item) => (
                <div 
                  key={item._id || item.issueNumber}
                  className="glass-card glass-card-hover"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/citizen/reports/${item.issueNumber || item._id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontWeight: 700, 
                        color: '#38bdf8',
                        background: 'rgba(56, 189, 248, 0.1)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}>
                        {item.issueNumber || item.trackingId}
                      </span>
                      {getSeverityPill(item.severity)}
                    </div>
                    <div>{getStatusBadge(item.status)}</div>
                  </div>

                  <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#ffffff' }}>
                    {item.title || item.description?.slice(0, 70)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#06b6d4" />
                      <span>{item.area || 'Bhavnagar'} • {item.department}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} />
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Civic Actions & Helpline */}
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>Civic Services</h2>

          {/* Action Cards */}
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
            <Link to="/map" className="glass-card glass-card-hover" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.98rem' }}>Live City Civic Map</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View geo-tagged reports and ward density</div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </Link>

            <Link to="/feed" className="glass-card glass-card-hover" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.98rem' }}>Public Audit Feed</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inspect verified before/after repairs</div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </Link>

            <Link to="/track" className="glass-card glass-card-hover" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.98rem' }}>Track by ID</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lookup BH-2026-XXXXX status instantly</div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </Link>
          </div>

          {/* Municipal Emergency Contacts */}
          <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.75)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
              <PhoneCall size={16} /> Bhavnagar Municipal Helplines
            </div>
            <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>24/7 Citizen Toll-Free:</span>
                <strong style={{ color: '#fff' }}>1916</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Water Works Emergency:</span>
                <strong style={{ color: '#fff' }}>0278-2424801</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Drainage Control Room:</span>
                <strong style={{ color: '#fff' }}>0278-2424802</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Disaster Management:</span>
                <strong style={{ color: '#fff' }}>1077</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
