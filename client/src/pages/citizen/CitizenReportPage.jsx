import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import L from 'leaflet';
import { 
  Camera, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  RotateCw, 
  Navigation, 
  ShieldAlert,
  Building2,
  FileCheck
} from 'lucide-react';

const BHAVNAGAR_PRESETS = [
  { name: 'Takhteshwar Temple (Ward 2)', lat: 21.7580, lng: 72.1465, area: 'Takhteshwar', ward: 'Ward 2 - Waghawadi Road & Takhteshwar' },
  { name: 'Waghawadi Road / Victoria Park (Ward 2)', lat: 21.7565, lng: 72.1450, area: 'Victoria Park', ward: 'Ward 2 - Waghawadi Road & Takhteshwar' },
  { name: 'Kaliyabid Hill Drive (Ward 1)', lat: 21.7485, lng: 72.1380, area: 'Kaliyabid', ward: 'Ward 1 - Kaliyabid' },
  { name: 'Ghogha Circle (Ward 3)', lat: 21.7640, lng: 72.1610, area: 'Ghogha Circle', ward: 'Ward 3 - Nilambag & Ghogha Circle' },
  { name: 'Nilambag Palace Area (Ward 3)', lat: 21.7615, lng: 72.1440, area: 'Nilambag', ward: 'Ward 3 - Nilambag & Ghogha Circle' },
  { name: 'Chitra GIDC Industrial Phase (Ward 4)', lat: 21.7850, lng: 72.1280, area: 'Chitra GIDC', ward: 'Ward 4 - Chitra GIDC & Subhashnagar' },
  { name: 'Kalanala / BMC Head Office (Ward 7)', lat: 21.7710, lng: 72.1480, area: 'Kalanala', ward: 'Ward 7 - Kalanala & Crescent Circle' },
  { name: 'Akwada Lake / Sidsar (Ward 9)', lat: 21.7320, lng: 72.1750, area: 'Akwada Lake', ward: 'Ward 9 - Sidsar & Akwada Lake Area' }
];

const QUICK_PHOTOS = [
  { label: 'Pothole on Main Road', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60' },
  { label: 'Overflowing Waste Dump', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=60' },
  { label: 'Broken Streetlight Pole', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=60' },
  { label: 'Drinking Water Pipeline Burst', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60' }
];

const STANDARD_CATEGORIES = [
  { name: 'Road & Pothole', department: 'Roads & Infrastructure', icon: '🛣️' },
  { name: 'Garbage & Sanitation', department: 'Sanitation', icon: '🗑️' },
  { name: 'Streetlight', department: 'Electrical', icon: '💡' },
  { name: 'Water Leakage', department: 'Water Supply', icon: '🚰' },
  { name: 'Drainage', department: 'Drainage', icon: '🌊' },
  { name: 'Traffic Signal', department: 'Traffic', icon: '🚦' },
  { name: 'Public Property', department: 'Public Property', icon: '🏛️' },
  { name: 'Tree & Environment', department: 'Garden & Environment', icon: '🌳' },
  { name: 'Other', department: 'Sanitation', icon: '📋' }
];

export const CitizenReportPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Current Step: 1 = Image, 2 = Location, 3 = Description, 4 = Category, 5 = Severity, 6 = Success
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [latitude, setLatitude] = useState(21.7580);
  const [longitude, setLongitude] = useState(72.1465);
  const [address, setAddress] = useState('Takhteshwar Temple Approach Road');
  const [area, setArea] = useState('Takhteshwar');
  const [ward, setWard] = useState('Ward 2 - Waghawadi Road & Takhteshwar');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Road & Pothole');
  const [severity, setSeverity] = useState('High');

  // UI States
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdIssue, setCreatedIssue] = useState(null);

  // Map references
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize or update map on Step 2
  useEffect(() => {
    if (currentStep !== 2 || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      // Custom marker icon
      const pinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background:#ef4444; width:22px; height:22px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 12px rgba(239,68,68,0.8);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([latitude, longitude], { icon: pinIcon, draggable: true }).addTo(map);

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setLatitude(Number(pos.lat.toFixed(5)));
        setLongitude(Number(pos.lng.toFixed(5)));
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setLatitude(Number(lat.toFixed(5)));
        setLongitude(Number(lng.toFixed(5)));
        marker.setLatLng([lat, lng]);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.invalidateSize();
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      }
    }
  }, [currentStep, latitude, longitude]);

  // Handle image upload
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const selectSamplePhoto = (photoUrl) => {
    setImageFile(null);
    setImagePreview(photoUrl);
    setError('');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Geolocation
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setLatitude(lat);
        setLongitude(lng);
        setAddress('Detected GPS Location, Bhavnagar');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setError('Location access denied or unavailable. Please select your location on the map.');
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handlePresetSelect = (preset) => {
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setArea(preset.area);
    setWard(preset.ward);
    setAddress(preset.name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([preset.lat, preset.lng], 15);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([preset.lat, preset.lng]);
    }
  };

  // Submission handler
  const handleSubmitReport = async () => {
    setSubmitting(true);
    setError('');

    try {
      let payload;

      if (imageFile) {
        payload = new FormData();
        payload.append('image', imageFile);
        payload.append('title', description ? description.slice(0, 60) : `${category} Issue`);
        payload.append('description', description || `Reported ${category} grievance at ${area}, Bhavnagar.`);
        payload.append('category', category);
        payload.append('severity', severity);
        payload.append('latitude', latitude);
        payload.append('longitude', longitude);
        payload.append('address', address);
        payload.append('area', area);
        payload.append('ward', ward);
        payload.append('citizenName', user?.name || 'Concerned Citizen');
        payload.append('citizenPhone', user?.phone || '9876543210');
      } else {
        payload = {
          title: description ? description.slice(0, 60) : `${category} Issue`,
          description: description || `Reported ${category} grievance at ${area}, Bhavnagar.`,
          category,
          severity,
          latitude,
          longitude,
          address,
          area,
          ward,
          imageUrl: imagePreview || '',
          citizenName: user?.name || 'Concerned Citizen',
          citizenPhone: user?.phone || '9876543210'
        };
      }

      const res = await api.createIssue(payload);

      if (res.success && res.data) {
        setCreatedIssue(res.data);
        setCurrentStep(6); // Step 6 = Success Screen
      } else {
        throw new Error(res.message || 'Failed to submit report.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Error communicating with municipal server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 6: Success Screen
  if (currentStep === 6 && createdIssue) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.35)'
          }}>
            <CheckCircle2 size={44} />
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Report Submitted</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Your civic grievance has been logged and assigned to the municipal dispatch queue.
          </p>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Issue Number</span>
              <strong style={{ fontFamily: 'monospace', fontSize: '1.25rem', color: '#38bdf8' }}>
                {createdIssue.issueNumber || createdIssue.trackingId}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Status</span>
              <span className="badge badge-medium" style={{ fontSize: '0.85rem' }}>
                Pending
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Category</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{createdIssue.category}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Department</span>
              <span style={{ color: '#06b6d4', fontWeight: 600 }}>{createdIssue.department || createdIssue.assignedDepartment}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => navigate(`/citizen/reports/${createdIssue.issueNumber || createdIssue._id}`)}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '1.05rem'
              }}
            >
              View Report <ArrowRight size={18} />
            </button>

            <button
              onClick={() => {
                setCreatedIssue(null);
                removeImage();
                setDescription('');
                setCurrentStep(1);
              }}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Report Another Problem
            </button>

            <button
              onClick={() => navigate('/citizen')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Return to Citizen Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>Report a Civic Problem</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Help Bhavnagar Municipal Corporation resolve road hazards, waste dumps, and civic issues.
        </p>
      </div>

      {/* Progress Steps Indicator */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '2rem',
        padding: '0.75rem 1rem',
        background: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        {[
          { step: 1, label: 'Photo' },
          { step: 2, label: 'Location' },
          { step: 3, label: 'Details' },
          { step: 4, label: 'Category' },
          { step: 5, label: 'Severity' }
        ].map((s, idx) => (
          <React.Fragment key={s.step}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: currentStep === s.step ? 'var(--accent-cyan)' : currentStep > s.step ? '#10b981' : 'rgba(255,255,255,0.08)',
                color: currentStep === s.step ? '#0a0e17' : '#fff'
              }}>
                {currentStep > s.step ? <CheckCircle2 size={16} /> : s.step}
              </div>
              <span style={{ 
                fontSize: '0.82rem', 
                fontWeight: currentStep === s.step ? 700 : 500,
                color: currentStep === s.step ? '#fff' : 'var(--text-muted)',
                display: 'none'
              }} className="step-label">
                {s.label}
              </span>
            </div>
            {idx < 4 && (
              <div style={{ 
                flex: 1, 
                height: '2px', 
                background: currentStep > idx + 1 ? '#10b981' : 'rgba(255,255,255,0.1)', 
                margin: '0 0.4rem' 
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.15)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          padding: '0.85rem 1rem', 
          borderRadius: '10px', 
          color: '#f87171', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* STEP 1: IMAGE */}
      {currentStep === 1 && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={20} color="#06b6d4" /> Step 1 — Upload Issue Photo
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            A clear photo provides ground-truth evidence for BMC engineering teams.
          </p>

          {imagePreview ? (
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-active)', marginBottom: '1.5rem', maxHeight: '380px' }}>
              <img 
                src={imagePreview} 
                alt="Issue Preview" 
                style={{ width: '100%', height: '340px', objectFit: 'cover' }} 
              />
              <div style={{ 
                position: 'absolute', 
                bottom: '1rem', 
                right: '1rem', 
                display: 'flex', 
                gap: '0.5rem',
                background: 'rgba(0,0,0,0.7)',
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)'
              }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                  <RotateCw size={14} /> Replace
                  <input type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} />
                </label>
                <button type="button" onClick={removeImage} className="btn btn-sm" style={{ background: '#ef4444', color: '#fff' }}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Dropzone */}
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 1.5rem',
                border: '2px dashed rgba(6, 182, 212, 0.4)',
                borderRadius: '14px',
                background: 'rgba(6, 182, 212, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '1.5rem'
              }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Upload size={28} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', marginBottom: '0.25rem' }}>
                  Click to choose a photo or drag & drop
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Supports JPG, PNG, WEBP (Max 10MB)
                </div>
                <input type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} />
              </label>

              {/* Sample Photos for Demo Testing */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Or select sample Bhavnagar demo photo:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem' }}>
                  {QUICK_PHOTOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectSamplePhoto(p.url)}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <img src={p.url} alt={p.label} style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span style={{ lineHeight: 1.2 }}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              Continue to Location <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION */}
      {currentStep === 2 && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="#06b6d4" /> Step 2 — Specify Location
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Pin the exact location on the Bhavnagar map or use your device GPS.
          </p>

          {/* GPS Quick Button & Coordinates info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={locating}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {locating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} color="#06b6d4" />}
              {locating ? 'Detecting GPS...' : 'Use Current Location'}
            </button>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Lat: {latitude} • Lng: {longitude}
            </div>
          </div>

          {/* Interactive Leaflet Map */}
          <div 
            ref={mapContainerRef} 
            style={{ 
              height: '320px', 
              borderRadius: '12px', 
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem',
              overflow: 'hidden',
              zIndex: 10
            }} 
          />

          {/* Preset Buttons */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
              Quick Presets (Bhavnagar Hubs):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {BHAVNAGAR_PRESETS.map((pr, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePresetSelect(pr)}
                  style={{
                    background: area === pr.area ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)',
                    border: area === pr.area ? '1px solid #06b6d4' : '1px solid var(--border-subtle)',
                    color: area === pr.area ? '#38bdf8' : 'var(--text-secondary)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  {pr.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Address & Area Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Area / Landmark</label>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. Takhteshwar Temple"
                value={area}
                onChange={e => setArea(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Street Address</label>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. Takhteshwar Approach Road, Ward 2"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              Continue to Details <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DESCRIPTION */}
      {currentStep === 3 && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={20} color="#06b6d4" /> Step 3 — Problem Description
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Describe the civic hazard so the field crew brings the right machinery and supplies.
          </p>

          <div className="form-group">
            <label className="form-label">
              Detailed Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional if photo provided)</span>
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="e.g. There is a large pothole near the road and motorcycles are having difficulty passing. Rebar is exposed."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ fontSize: '0.95rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            💡 <strong>Helpful tip:</strong> Mentioning landmarks (e.g. near school, hospital, water tank) helps field teams locate the issue quickly.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              Continue to Category <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CATEGORY */}
      {currentStep === 4 && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={20} color="#06b6d4" /> Step 4 — Civic Issue Category
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Select the category that best matches your report. In Phase 3, multimodal AI will automatically recommend this.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {STANDARD_CATEGORIES.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <div
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  style={{
                    background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid #06b6d4' : '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: isSelected ? '#38bdf8' : '#fff', fontSize: '0.92rem' }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {cat.department}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              Continue to Severity <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SEVERITY & SUBMISSION */}
      {currentStep === 5 && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="#06b6d4" /> Step 5 — Urgency & Severity
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Specify the perceived risk level. AI triage will verify and recommend official severity upon dispatch.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { level: 'Critical', color: '#ef4444', desc: 'Direct life hazard / deep road sinkhole / open live cables' },
              { level: 'High', color: '#f97316', desc: 'Active pipeline burst / large pothole / sewer overflow' },
              { level: 'Medium', color: '#eab308', desc: 'Broken streetlights / asphalt raveling / garbage dump' },
              { level: 'Low', color: '#10b981', desc: 'Minor cosmetic defect / faded lane marker / litter' }
            ].map((s) => {
              const isSelected = severity === s.level;
              return (
                <div
                  key={s.level}
                  onClick={() => setSeverity(s.level)}
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? `2px solid ${s.color}` : '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color }} />
                    <strong style={{ color: s.color, fontSize: '0.95rem' }}>{s.level}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {s.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Notice Banner */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Sparkles size={20} color="#a78bfa" />
            <div style={{ fontSize: '0.85rem', color: '#ddd6fe' }}>
              <strong>AI Triage System:</strong> Severity score will be mathematically calculated by Google Gemini multimodal vision analysis to prioritize emergency field dispatches.
            </div>
          </div>

          {/* Summary Review */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.75rem',
            fontSize: '0.85rem',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Location:</span>
              <span style={{ color: '#fff' }}>{area} ({ward})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Category:</span>
              <span style={{ color: '#fff' }}>{category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Photo:</span>
              <span style={{ color: imagePreview ? '#10b981' : 'var(--text-muted)' }}>
                {imagePreview ? '✓ Attached' : 'None'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="btn btn-secondary"
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={handleSubmitReport}
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting Report...
                </>
              ) : (
                <>
                  Submit Civic Grievance <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
