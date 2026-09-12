import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  PlusCircle, 
  Search, 
  Clock, 
  CheckCircle2, 
  Activity, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Layers, 
  Loader2 
} from 'lucide-react';

export const CitizenReportsListPage = () => {
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getIssues({ limit: 100 });
      if (res.data) {
        setIssues(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Unable to fetch civic reports. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredIssues = issues.filter((issue) => {
    // Status Filter
    const status = (issue.status || '').toLowerCase();
    if (activeFilter === 'Pending' && status !== 'pending') return false;
    if (activeFilter === 'In Progress' && !status.includes('progress')) return false;
    if (activeFilter === 'Resolved' && status !== 'resolved') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const numMatch = (issue.issueNumber || issue.trackingId || '').toLowerCase().includes(query);
      const titleMatch = (issue.title || '').toLowerCase().includes(query);
      const descMatch = (issue.description || '').toLowerCase().includes(query);
      const areaMatch = (issue.area || '').toLowerCase().includes(query);
      const catMatch = (issue.category || '').toLowerCase().includes(query);

      return numMatch || titleMatch || descMatch || areaMatch || catMatch;
    }

    return true;
  });

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

  const countForFilter = (filter) => {
    if (filter === 'All') return issues.length;
    if (filter === 'Pending') return issues.filter(i => (i.status || '').toLowerCase() === 'pending').length;
    if (filter === 'In Progress') return issues.filter(i => (i.status || '').toLowerCase().includes('progress')).length;
    if (filter === 'Resolved') return issues.filter(i => (i.status || '').toLowerCase() === 'resolved').length;
    return 0;
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Page Title & Action */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>My Civic Reports</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Browse and monitor municipal tickets reported across Bhavnagar.
          </p>
        </div>

        <Link to="/citizen/report" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={18} /> Report a Problem
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'In Progress', 'Resolved'].map((tab) => {
            const isActive = activeFilter === tab;
            const count = countForFilter(tab);
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                style={{
                  background: isActive ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-card)',
                  border: isActive ? '1px solid #06b6d4' : '1px solid var(--border-subtle)',
                  color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab}
                <span style={{
                  background: isActive ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '1', maxWidth: '380px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by issue #, area, keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.15)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          padding: '0.85rem 1rem', 
          borderRadius: '10px', 
          color: '#f87171', 
          marginBottom: '1.5rem' 
        }}>
          {error}
        </div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#06b6d4' }} />
          <div>Loading civic reports...</div>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'var(--text-muted)' }}>
            <Layers size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Reports Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            {searchQuery 
              ? `No civic issues match your search "${searchQuery}".` 
              : `No ${activeFilter.toLowerCase()} reports in this category.`}
          </p>
          <Link to="/citizen/report" className="btn btn-primary btn-sm">
            Report a Problem Now
          </Link>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', 
          gap: '1.25rem' 
        }}>
          {filteredIssues.map((item) => (
            <div
              key={item._id || item.issueNumber}
              className="glass-card glass-card-hover"
              style={{
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderRadius: '14px'
              }}
              onClick={() => navigate(`/citizen/reports/${item.issueNumber || item._id}`)}
            >
              <div>
                {/* Header: Issue Number, Severity & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

                {/* Title / Description */}
                <h3 style={{ 
                  fontSize: '1.05rem', 
                  fontWeight: 600, 
                  color: '#ffffff', 
                  marginBottom: '0.5rem',
                  lineHeight: 1.4
                }}>
                  {item.title || item.description?.slice(0, 65)}
                </h3>

                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.85rem', 
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.description}
                </p>
              </div>

              {/* Footer: Category, Area, Date & Link */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#06b6d4', fontWeight: 600 }}>
                    <MapPin size={13} />
                    <span>{item.area || 'Bhavnagar'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} />
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.category}</span>
                  <span style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    View Details <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
