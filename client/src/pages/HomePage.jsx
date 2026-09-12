import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Camera, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  ShieldAlert, 
  Clock, 
  ThumbsUp, 
  MapPin, 
  Search,
  Truck,
  Flame,
  Droplets,
  Zap,
  Trash2,
  GitBranch
} from 'lucide-react';

export const HomePage = () => {
  const [stats, setStats] = useState({
    totalIssues: 6,
    resolvedIssues: 2,
    resolutionRate: 33,
    averageRating: 5.0,
    urgentIssues: 2
  });
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [analyticsRes, feedRes] = await Promise.all([
          api.getAnalytics().catch(() => ({ data: { summary: {} } })),
          api.getPublicFeed().catch(() => ({ data: [] }))
        ]);

        if (analyticsRes.data?.summary) {
          setStats(analyticsRes.data.summary);
        }
        if (feedRes.data) {
          setFeed(feedRes.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const categories = [
    { id: 'roads_potholes', title: 'Roads & Potholes', dept: 'PWD Department', icon: <Flame size={24} color="#f87171" />, count: '2 Active' },
    { id: 'garbage_waste', title: 'Solid Waste & Trash', dept: 'SWM Department', icon: <Trash2 size={24} color="#34d399" />, count: '1 Cleared' },
    { id: 'water_drainage', title: 'Water & Drainage', dept: 'Hydraulic Works', icon: <Droplets size={24} color="#60a5fa" />, count: '2 Urgent' },
    { id: 'street_light', title: 'Streetlights & Poles', dept: 'Electrical Dept', icon: <Zap size={24} color="#fbbf24" />, count: '1 Pending' },
    { id: 'stray_animals', title: 'Stray Cattle & Safety', dept: 'Encroachment / CNB', icon: <ShieldAlert size={24} color="#f43f5e" />, count: '1 Relocated' },
    { id: 'health_vector', title: 'Health & Vector Control', dept: 'Sanitation Dept', icon: <CheckCircle size={24} color="#a78bfa" />, count: 'SLA Protected' }
  ];

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 1rem 3.5rem 1rem',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: '#38bdf8',
          padding: '0.35rem 1rem',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          letterSpacing: '0.04em'
        }}>
          <Sparkles size={15} /> NEXT-GEN CIVIC INTELLIGENCE FOR BHAVNAGAR
        </div>

        <h1 style={{
          fontSize: 'clamp(2.3rem, 5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '1.25rem'
        }}>
          Transforming Bhavnagar’s Streets with{' '}
          <span style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Autonomous AI Triage
          </span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '2.25rem',
          maxWidth: '750px',
          margin: '0 auto 2.25rem auto'
        }}>
          Snap a photo of any civic grievance in Bhavnagar. Our multimodal AI instantly categorizes the severity, dispatches the responsible BMC department, and tracks ground-level resolution with photo proof.
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <Link to="/report" className="btn btn-primary btn-lg pulse-glow">
            <Camera size={18} /> Report a Problem Now
          </Link>
          <Link to="/track" className="btn btn-secondary btn-lg">
            <Search size={18} /> Track Existing Ticket
          </Link>
          <Link to="/map" className="btn btn-secondary btn-lg">
            <MapPin size={18} /> Explore Ward Heatmap
          </Link>
        </div>
      </section>

      {/* Live Civic Metric Counters */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="grid-4">
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#38bdf8' }}>
              {stats.totalIssues || 6}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total Civic Grievances
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#34d399' }}>
              {stats.resolutionRate || 33}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Verified Resolution Rate
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#c084fc' }}>
              {stats.urgentIssues || 2}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Urgent Public Safety Hazards
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fbbf24' }}>
              {stats.averageRating || 4.9} ★
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Citizen Satisfaction Score
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>The Closed-Loop Civic Intelligence Flow</h2>
          <p style={{ color: 'var(--text-secondary)' }}>From citizen reporting to BMC field execution and verified citizen sign-off</p>
        </div>

        <div className="grid-4">
          <div className="glass-card" style={{ padding: '1.75rem 1.25rem', position: 'relative' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              marginBottom: '1rem'
            }}>
              1
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Citizen Reports</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Citizen uploads photo and GPS location of broken roads, overflowing waste, or water leaks in Bhavnagar.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem 1.25rem', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.25)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              marginBottom: '1rem'
            }}>
              2
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#38bdf8' }}>AI Triage & Route</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Multimodal AI scores severity (1-10), flags safety hazards, and routes directly to the right BMC department.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem 1.25rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(192, 132, 252, 0.15)',
              color: '#c084fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              marginBottom: '1rem'
            }}>
              3
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Authority Action</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              BMC ward officers dispatch repair teams, update real-time progress, and upload "After" proof photos.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem 1.25rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(52, 211, 153, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              marginBottom: '1rem'
            }}>
              4
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Citizen Verification</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Citizen inspects the resolution side-by-side and gives a transparent star rating to ensure SLA accountability.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Categories Grid */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Bhavnagar Municipal Coverage</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Automated routing across all primary BMC civic operations</p>
          </div>
          <Link to="/report" className="btn btn-secondary btn-sm">
            File Report in Any Category <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/report?category=${cat.id}`}
              className="glass-card glass-card-hover"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.6rem',
                  borderRadius: '10px'
                }}>
                  {cat.icon}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {cat.count}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{cat.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Routed to: {cat.dept}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Proof of Resolution Showcase */}
      {feed.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem' }}>Recently Resolved in Bhavnagar</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Verified Before & After visual audits completed by municipal crews</p>
            </div>
            <Link to="/feed" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid-3">
            {feed.map((item) => (
              <div key={item._id} className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '180px', background: '#1e293b' }}>
                  <img
                    src={item.resolution?.proofImage || item.images?.[0] || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(16, 185, 129, 0.9)',
                    color: '#ffffff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    RESOLVED
                  </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginBottom: '0.35rem' }}>
                    {item.trackingId} • {item.location?.ward}
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineClamp: 2 }}>
                    {item.resolution?.notes || item.description}
                  </p>
                  <Link to={`/track/${item.trackingId}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    View Full Audit Trail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
