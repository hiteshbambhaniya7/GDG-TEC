import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Star, 
  ArrowRight, 
  MessageSquare, 
  ShieldCheck, 
  Share2 
} from 'lucide-react';

export const PublicFeedPage = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const res = await api.getPublicFeed();
        setFeed(res.data || []);
      } catch (err) {
        console.error('Error fetching public feed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, []);

  const filteredFeed = filterCategory === 'all' 
    ? feed 
    : feed.filter(f => f.category === filterCategory);

  return (
    <div className="page-wrapper" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#34d399',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '0.5rem'
        }}>
          <ShieldCheck size={14} /> PUBLIC MUNICIPAL TRANSPARENCY FEED
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Bhavnagar Civic Resolutions</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Real-time stream of citizen grievances addressed and verified by Bhavnagar Municipal Corporation.
        </p>

        {/* Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          {[
            { id: 'all', label: 'All Issues' },
            { id: 'roads_potholes', label: 'Roads & Potholes' },
            { id: 'garbage_waste', label: 'Solid Waste' },
            { id: 'water_drainage', label: 'Water & Drainage' },
            { id: 'street_light', label: 'Streetlights' },
            { id: 'stray_animals', label: 'Stray Cattle' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              style={{
                background: filterCategory === c.id ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                color: filterCategory === c.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: filterCategory === c.id ? '#38bdf8' : 'var(--border-subtle)',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: filterCategory === c.id ? 700 : 500
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading civic stream...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredFeed.map(item => (
            <div key={item._id} className="glass-card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Image Section */}
              <div style={{ position: 'relative', height: '220px', borderRadius: '10px', overflow: 'hidden', background: '#0f172a' }}>
                <img
                  src={item.resolution?.proofImage || item.images?.[0] || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: item.status === 'resolved' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(139, 92, 246, 0.95)',
                  color: '#fff',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em'
                }}>
                  {item.status === 'resolved' ? 'RESOLVED WITH PROOF' : item.status.toUpperCase()}
                </div>
              </div>

              {/* Text / Details Section */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>
                      {item.trackingId}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                    {item.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                    <MapPin size={13} color="#06b6d4" /> {item.location?.ward}
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {item.resolution?.notes || item.description}
                  </p>
                </div>

                {/* Citizen Rating & Action */}
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  {item.citizenFeedback?.rating ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600 }}>
                      <Star size={14} fill="#fbbf24" /> {item.citizenFeedback.rating}.0 Citizen Rating
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Dept: <strong>{item.assignedDepartment}</strong>
                    </div>
                  )}

                  <Link to={`/track/${item.trackingId}`} className="btn btn-secondary btn-sm">
                    View Verification Audit <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
