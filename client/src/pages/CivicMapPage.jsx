import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Filter, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Compass,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const BHAVNAGAR_CENTER = [21.7645, 72.1519];

export const CivicMapPage = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [issues, setIssues] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const [selectedIssue, setSelectedIssue] = useState(null);

  // Fetch geo data
  const loadMapData = async () => {
    try {
      const [geoRes, hotspotsRes] = await Promise.all([
        api.getGeoJSON({
          department: selectedDept,
          status: selectedStatus,
          priority: selectedPriority
        }),
        api.getWardHotspots()
      ]);

      if (geoRes.data?.features) {
        let feats = geoRes.data.features;
        if (selectedWard !== 'all') {
          feats = feats.filter(f => f.properties?.ward === selectedWard);
        }
        setIssues(feats);
      }
      if (hotspotsRes.data) {
        setHotspots(hotspotsRes.data);
      }
    } catch (err) {
      console.error('Error fetching map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, [selectedWard, selectedDept, selectedStatus, selectedPriority]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: BHAVNAGAR_CENTER,
        zoom: 13,
        zoomControl: true
      });

      // Dark CartoDB tile layer for modern aesthetics
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep instance intact across renders
    };
  }, []);

  // Update Markers when issues change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const getPinColor = (category, priority) => {
      if (priority === 'urgent') return '#ef4444';
      switch (category) {
        case 'roads_potholes': return '#f97316';
        case 'garbage_waste': return '#10b981';
        case 'water_drainage': return '#3b82f6';
        case 'street_light': return '#eab308';
        case 'stray_animals': return '#8b5cf6';
        default: return '#06b6d4';
      }
    };

    issues.forEach(feat => {
      const [lng, lat] = feat.geometry.coordinates;
      const p = feat.properties;
      const color = getPinColor(p.category, p.priority);

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 0 12px ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
          ">
            ${p.priority === 'urgent' ? '!' : '●'}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedIssue(p);
      });

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 180px; color: #0f172a;">
          <div style="font-size: 11px; font-weight: 700; color: #0284c7; margin-bottom: 2px;">
            ${p.trackingId} • ${p.ward}
          </div>
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 4px; line-height: 1.3;">
            ${p.title}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            Dept: <strong>${p.department}</strong>
          </div>
          <a href="/track/${p.trackingId}" style="
            display: inline-block;
            background: #0284c7;
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 4px;
            text-decoration: none;
          ">
            Inspect Case Details →
          </a>
        </div>
      `);

      markersLayerRef.current.addLayer(marker);
    });
  }, [issues]);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(6, 182, 212, 0.12)',
            color: '#38bdf8',
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '0.35rem'
          }}>
            <MapPin size={13} /> GEOSPATIAL CIVIC INTELLIGENCE
          </div>
          <h1 style={{ fontSize: '2rem' }}>Bhavnagar Civic Issues Live Heatmap</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time geospatial mapping across Bhavnagar Municipal Corporation wards.
          </p>
        </div>

        <Link to="/report" className="btn btn-primary btn-sm">
          + Pin New Issue on Map
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>
          <Filter size={15} /> Filters:
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          value={selectedWard}
          onChange={e => setSelectedWard(e.target.value)}
        >
          <option value="all">All Bhavnagar Wards</option>
          <option value="Ward 1 - Kaliyabid & Hill Drive">Ward 1 - Kaliyabid</option>
          <option value="Ward 2 - Waghawadi Road & Takhteshwar">Ward 2 - Waghawadi</option>
          <option value="Ward 3 - Nilambag & Ghogha Circle">Ward 3 - Nilambag / Ghogha</option>
          <option value="Ward 4 - Chitra GIDC & Subhashnagar">Ward 4 - Chitra GIDC</option>
          <option value="Ward 7 - Kalanala & Crescent Circle">Ward 7 - Kalanala / Crescent</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
        >
          <option value="all">All Departments</option>
          <option value="Roads & Buildings (PWD)">Roads (PWD)</option>
          <option value="Solid Waste Management">Solid Waste (SWM)</option>
          <option value="Water Works & Drainage">Water Works & Drainage</option>
          <option value="Electrical & Street Lighting">Electrical</option>
          <option value="Encroachment & Animal Control">Animal Control</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          value={selectedPriority}
          onChange={e => setSelectedPriority(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent Only</option>
          <option value="high">High & Urgent</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing <strong>{issues.length}</strong> active pins
        </div>
      </div>

      {/* Main Map & Hotspots Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Map View */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
            <div ref={mapContainerRef} style={{ height: '560px', width: '100%', borderRadius: '10px' }} />
          </div>

          {/* Map Legend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            fontSize: '0.78rem'
          }}>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Map Legend:</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} /> Urgent / Critical Hazard
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f97316' }} /> Roads & Potholes
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} /> Solid Waste
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} /> Water & Drainage
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }} /> Street Lighting
            </span>
          </div>
        </div>

        {/* Hotspots & Details Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Selected Pin Details Card */}
          {selectedIssue ? (
            <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.3rem' }}>
                SELECTED PIN
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{selectedIssue.title}</h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {selectedIssue.ward} • {selectedIssue.landmark || selectedIssue.address}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className={`badge badge-${selectedIssue.priority}`}>
                  {selectedIssue.priority}
                </span>
                <span className={`badge badge-${selectedIssue.status}`}>
                  {selectedIssue.status}
                </span>
              </div>

              <Link
                to={`/track/${selectedIssue.trackingId}`}
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
              >
                Inspect Full Audit Trail <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Compass size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Click any pin on the map</div>
              <div style={{ fontSize: '0.78rem' }}>Inspect localized municipal details and photos</div>
            </div>
          )}

          {/* Ward Density Hotspots List */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Flame size={18} color="#f97316" /> Ward Density Hotspots
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {hotspots.map((h, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {h._id || 'Central Bhavnagar'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {h.resolvedCount || 0} resolved • {h.urgentCount || 0} urgent
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.1)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px'
                  }}>
                    {h.count} issues
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
