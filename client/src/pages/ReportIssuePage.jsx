import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  MapPin, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Loader2, 
  Phone, 
  User, 
  Compass, 
  ArrowRight 
} from 'lucide-react';

const BHAVNAGAR_PRESETS = [
  { name: 'Takhteshwar Temple (Ward 2)', lat: 21.7580, lng: 72.1465, ward: 'Ward 2 - Waghawadi Road & Takhteshwar' },
  { name: 'Ghogha Circle (Ward 3)', lat: 21.7680, lng: 72.1620, ward: 'Ward 3 - Nilambag & Ghogha Circle' },
  { name: 'Kaliyabid Hill Drive (Ward 1)', lat: 21.7520, lng: 72.1380, ward: 'Ward 1 - Kaliyabid & Hill Drive' },
  { name: 'Chitra GIDC Industrial Gate (Ward 4)', lat: 21.7850, lng: 72.1280, ward: 'Ward 4 - Chitra GIDC & Subhashnagar' },
  { name: 'Crescent Fountain Market (Ward 7)', lat: 21.7725, lng: 72.1480, ward: 'Ward 7 - Kalanala & Crescent Circle' }
];

const SAMPLE_PHOTOS = [
  { label: 'Pothole on Main Road', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600' },
  { label: 'Overflowing Waste Dump', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600' },
  { label: 'Burst Water Pipeline', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600' },
  { label: 'Stray Cattle Hazard', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600' }
];

export const ReportIssuePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: searchParams.get('category') || 'roads_potholes',
    ward: 'Ward 1 - Kaliyabid & Hill Drive',
    address: 'Bhavnagar, Gujarat',
    landmark: '',
    latitude: 21.7645,
    longitude: 72.1519,
    citizenName: user?.name || 'Concerned Citizen',
    citizenPhone: user?.phone || '9898000001'
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdIssue, setCreatedIssue] = useState(null);
  const [error, setError] = useState('');

  // Live AI Assist Preview
  const [aiPreview, setAiPreview] = useState(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        citizenName: user.name,
        citizenPhone: user.phone
      }));
    }
  }, [user]);

  // Trigger live AI estimation when title/description/category changes
  useEffect(() => {
    if (formData.title.length > 5 && formData.description.length > 8) {
      const timer = setTimeout(async () => {
        setAnalyzingAi(true);
        try {
          const res = await api.testAiAnalyze({
            title: formData.title,
            description: formData.description,
            categoryHint: formData.category
          });
          if (res.data) {
            setAiPreview(res.data);
          }
        } catch {
          // Heuristic fallback
        } finally {
          setAnalyzingAi(false);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [formData.title, formData.description, formData.category]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePresetLocation = (preset) => {
    setFormData(prev => ({
      ...prev,
      latitude: preset.lat,
      longitude: preset.lng,
      ward: preset.ward,
      landmark: preset.name
    }));
  };

  const handleUseSamplePhoto = async (sample) => {
    setImagePreview(sample.url);
    // Fetch image as blob for FormData submission
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const file = new File([blob], 'sample_civic_issue.jpg', { type: 'image/jpeg' });
      setImageFile(file);
    } catch {
      // Fallback
    }
  };

  const handleGetBrowserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(pos.coords.latitude.toFixed(6)),
            longitude: parseFloat(pos.coords.longitude.toFixed(6))
          }));
        },
        (err) => {
          setError('Location access was denied. You can choose a Bhavnagar location preset below.');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('ward', formData.ward);
      data.append('address', formData.address);
      data.append('landmark', formData.landmark);
      data.append('latitude', formData.latitude.toString());
      data.append('longitude', formData.longitude.toString());
      data.append('citizenName', formData.citizenName);
      data.append('citizenPhone', formData.citizenPhone);

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await api.createIssue(data);
      setCreatedIssue(res.data);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please check the fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(6, 182, 212, 0.1)',
          color: '#38bdf8',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '0.5rem'
        }}>
          <Camera size={14} /> CITIZEN REPORTING PORTAL
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Report a Civic Problem</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Help Bhavnagar Municipal Corporation (BMC) resolve infrastructure issues in your neighborhood.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Success Modal / Card */}
      {createdIssue ? (
        <div className="glass-card" style={{
          padding: '2.5rem',
          textAlign: 'center',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <CheckCircle size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#34d399' }}>
            Report Successfully Logged!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your issue has been analyzed by the AI engine and queued for municipal dispatch.
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px dashed var(--border-active)',
            borderRadius: '12px',
            padding: '1.25rem',
            maxWidth: '450px',
            margin: '0 auto 2rem auto'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>YOUR CITIZEN TRACKING ID</div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#38bdf8',
              letterSpacing: '0.05em',
              margin: '0.25rem 0'
            }}>
              {createdIssue.trackingId}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Routed to: <strong>{createdIssue.assignedDepartment}</strong> • Priority: <strong style={{ color: '#fb7185' }}>{createdIssue.priority?.toUpperCase()}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/track/${createdIssue.trackingId}`)}
              className="btn btn-primary btn-lg"
            >
              Track Live Status Now <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                setCreatedIssue(null);
                setImagePreview(null);
                setImageFile(null);
                setFormData(prev => ({ ...prev, title: '', description: '', landmark: '' }));
              }}
              className="btn btn-secondary btn-lg"
            >
              Report Another Problem
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Left Column: Form details */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>1. Issue Details</h3>

            <div className="form-group">
              <label className="form-label">Issue Headline / Title *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Deep pothole on Takhteshwar Temple approach road"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="roads_potholes">Roads & Potholes (PWD)</option>
                <option value="garbage_waste">Solid Waste & Garbage (SWM)</option>
                <option value="water_drainage">Water Leakage & Drainage</option>
                <option value="street_light">Streetlights & Electrical</option>
                <option value="stray_animals">Stray Cattle / Animals</option>
                <option value="health_vector">Health, Stench & Mosquitoes</option>
                <option value="encroachment">Footpath Encroachment</option>
                <option value="other">Other Civic Issue</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Problem Description & Visual Clues *</label>
              <textarea
                required
                className="form-textarea"
                placeholder="Describe the severity, how long it has existed, and any accident hazard..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Live AI Triage Assistant Card */}
            {(aiPreview || analyzingAi) && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#38bdf8',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    <Sparkles size={14} /> LIVE AI PRE-ASSESSMENT
                  </span>
                  {analyzingAi && <Loader2 size={14} className="animate-spin" color="#38bdf8" />}
                </div>

                {aiPreview && (
                  <div style={{ fontSize: '0.83rem', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ color: '#94a3b8' }}>Target Dept:</span>
                      <strong style={{ color: '#38bdf8' }}>{aiPreview.suggestedDepartment}</strong>
                      <span style={{ color: '#94a3b8' }}>• Est. Severity:</span>
                      <strong style={{ color: aiPreview.severityScore >= 8 ? '#f87171' : '#fbbf24' }}>
                        {aiPreview.severityScore}/10 ({aiPreview.priority?.toUpperCase()})
                      </strong>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      {aiPreview.urgencyReason}
                    </div>
                  </div>
                )}
              </div>
            )}

            <h3 style={{ fontSize: '1.2rem', margin: '1.5rem 0 1rem 0' }}>2. Contact Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.citizenName}
                  onChange={e => setFormData({ ...formData, citizenName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  value={formData.citizenPhone}
                  onChange={e => setFormData({ ...formData, citizenPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Photo & Location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Photo Upload Section */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>3. Photographic Evidence</h3>

              <div style={{
                border: '2px dashed var(--border-active)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.5)',
                marginBottom: '1rem',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />

                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxHeight: '180px',
                        maxWidth: '100%',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Click or drop to replace image</div>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} color="#38bdf8" style={{ margin: '0 auto 0.5rem auto' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Drop issue photo here</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>JPG, PNG or WEBP (Max 10MB)</div>
                  </div>
                )}
              </div>

              {/* Quick sample photo selector for hackathon demo speed */}
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Quick Demo Photo Presets:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {SAMPLE_PHOTOS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleUseSamplePhoto(s)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem' }}>4. Bhavnagar Location</h3>
                <button
                  type="button"
                  onClick={handleGetBrowserLocation}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  <Compass size={13} /> Detect GPS
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Municipal Ward</label>
                <select
                  className="form-select"
                  value={formData.ward}
                  onChange={e => setFormData({ ...formData, ward: e.target.value })}
                >
                  <option value="Ward 1 - Kaliyabid & Hill Drive">Ward 1 - Kaliyabid & Hill Drive</option>
                  <option value="Ward 2 - Waghawadi Road & Takhteshwar">Ward 2 - Waghawadi Road & Takhteshwar</option>
                  <option value="Ward 3 - Nilambag & Ghogha Circle">Ward 3 - Nilambag & Ghogha Circle</option>
                  <option value="Ward 4 - Chitra GIDC & Subhashnagar">Ward 4 - Chitra GIDC & Subhashnagar</option>
                  <option value="Ward 5 - Sardarnagar & Bharatnagar">Ward 5 - Sardarnagar & Bharatnagar</option>
                  <option value="Ward 6 - Rupani & Vidhyanagar">Ward 6 - Rupani & Vidhyanagar</option>
                  <option value="Ward 7 - Kalanala & Crescent Circle">Ward 7 - Kalanala & Crescent Circle</option>
                  <option value="Ward 8 - Anandnagar & Kumbharwada">Ward 8 - Anandnagar & Kumbharwada</option>
                  <option value="Ward 9 - Sidsar & Akwada Lake Area">Ward 9 - Sidsar & Akwada Lake Area</option>
                  <option value="Ward 10 - Ruva & Nari Road">Ward 10 - Ruva & Nari Road</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nearby Landmark / Street Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Near Jewels Circle, Opp. Victoria Park Gate"
                  value={formData.landmark}
                  onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                />
              </div>

              {/* Coordinates Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="#38bdf8" /> GPS Pin:
                </span>
                <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>
                  {formData.latitude}, {formData.longitude}
                </span>
              </div>

              {/* Presets */}
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Bhavnagar Landmark Hotspots:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {BHAVNAGAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetLocation(p)}
                      style={{
                        background: formData.landmark === p.name ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid',
                        borderColor: formData.landmark === p.name ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)',
                        color: formData.landmark === p.name ? '#38bdf8' : 'var(--text-secondary)',
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {p.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', padding: '1.1rem' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Analyzing with AI & Submitting...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Submit Issue to BMC
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
