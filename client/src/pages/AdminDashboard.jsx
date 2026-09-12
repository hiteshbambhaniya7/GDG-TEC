import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AiBadge } from '../components/common/AiBadge';
import { 
  LayoutDashboard, 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Upload, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  Check, 
  X,
  Building2,
  Phone,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  // Filters
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Modals
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalType, setModalType] = useState(null); // 'status' | 'assign' | 'resolve'
  const [actionNotes, setActionNotes] = useState('');
  const [actionStatus, setActionStatus] = useState('in_progress');
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [proofImageFile, setProofImageFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [issuesRes, officersRes, analyticsRes] = await Promise.all([
        api.getIssues({
          department: deptFilter,
          status: statusFilter,
          priority: priorityFilter,
          ward: wardFilter,
          search: searchQuery
        }),
        api.getOfficers().catch(() => ({ data: [] })),
        api.getAnalytics().catch(() => ({ data: null }))
      ]);

      setIssues(issuesRes.data || []);
      setOfficers(officersRes.data || []);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [deptFilter, statusFilter, priorityFilter, wardFilter, searchQuery]);

  // Re-run AI analysis on issue
  const handleReanalyze = async (issueId) => {
    try {
      setProcessing(true);
      await api.reanalyzeIssue(issueId);
      setFeedbackMsg('AI Re-evaluation complete!');
      setTimeout(() => setFeedbackMsg(''), 2500);
      loadDashboardData();
    } catch (err) {
      alert('AI analysis failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Status update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setProcessing(true);
    try {
      await api.updateStatus(selectedIssue._id, actionStatus, actionNotes);
      setModalType(null);
      setSelectedIssue(null);
      setActionNotes('');
      loadDashboardData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Assignment update
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setProcessing(true);
    try {
      await api.assignIssue(selectedIssue._id, {
        officerId: assigneeId || null,
        officerName: assigneeName || 'Duty Field Crew',
        notes: actionNotes
      });
      setModalType(null);
      setSelectedIssue(null);
      setActionNotes('');
      loadDashboardData();
    } catch (err) {
      alert('Failed to assign issue: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Resolution with proof
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setProcessing(true);
    try {
      const data = new FormData();
      data.append('notes', actionNotes || 'Civic issue successfully resolved on ground with inspection proof.');
      if (proofImageFile) {
        data.append('proofImage', proofImageFile);
      }

      await api.resolveIssue(selectedIssue._id, data);
      setModalType(null);
      setSelectedIssue(null);
      setActionNotes('');
      setProofImageFile(null);
      setProofPreview('');
      loadDashboardData();
    } catch (err) {
      alert('Failed to resolve issue: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#c084fc',
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '0.4rem'
          }}>
            <Building2 size={13} /> BHAVNAGAR MUNICIPAL CORPORATION (BMC) COMMAND DESK
          </div>
          <h1 style={{ fontSize: '2.2rem' }}>Civic Triage & Dispatch Operations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Logged in as: <strong style={{ color: '#fff' }}>{user?.name || 'Municipal Officer'}</strong> • {user?.department || 'General Administration'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {feedbackMsg && (
            <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>{feedbackMsg}</span>
          )}
          <button
            onClick={loadDashboardData}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      {analytics?.summary && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>QUEUE SIZE</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
              {analytics.summary.totalIssues}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {analytics.summary.pendingIssues} awaiting initial action
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>URGENT SAFETY HAZARDS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>
              {analytics.summary.urgentIssues}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#fb7185' }}>
              SLA target: &lt; 12 hours
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>IN PROGRESS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc' }}>
              {analytics.summary.inProgressIssues}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Crews currently deployed
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RESOLVED & VERIFIED</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
              {analytics.summary.resolvedIssues} ({analytics.summary.resolutionRate}%)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Avg satisfaction: {analytics.summary.averageRating} ★
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by ID, keyword, ward, or street..."
            style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', fontSize: '0.85rem' }}
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option value="all">All BMC Departments</option>
          <option value="Roads & Buildings (PWD)">Roads & Buildings (PWD)</option>
          <option value="Solid Waste Management">Solid Waste Management</option>
          <option value="Water Works & Drainage">Water Works & Drainage</option>
          <option value="Electrical & Street Lighting">Electrical & Lighting</option>
          <option value="Encroachment & Animal Control">Animal Control & Encroachment</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', fontSize: '0.85rem' }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="ai_analyzed">AI Analyzed</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', fontSize: '0.85rem' }}
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Issues Queue Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <th style={{ padding: '1rem' }}>TICKET & CREATED</th>
                <th style={{ padding: '1rem' }}>CIVIC ISSUE DETAILS</th>
                <th style={{ padding: '1rem' }}>AI TRIAGE & DEPT</th>
                <th style={{ padding: '1rem' }}>PRIORITY</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <tr key={issue._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', verticalAlign: 'middle' }}>
                  {/* Tracking ID & Date */}
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8' }}>{issue.trackingId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Details & Photo thumbnail */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {issue.images?.[0] && (
                        <img
                          src={issue.images[0].startsWith('http') ? issue.images[0] : `http://localhost:5000${issue.images[0]}`}
                          alt=""
                          style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                          {issue.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {issue.location?.ward} • {issue.location?.landmark || issue.location?.address}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* AI Triage & Department */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                      {issue.assignedDepartment}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                        AI Score: {issue.aiAnalysis?.severityScore || 5}/10
                      </span>
                      {issue.aiAnalysis?.safetyHazard && (
                        <span style={{ fontSize: '0.68rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.2)', padding: '0.1rem 0.3rem', borderRadius: '3px', fontWeight: 700 }}>
                          HAZARD
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${issue.priority}`}>
                      {issue.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${issue.status}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                    {issue.assignedOfficer?.officerName && (
                      <div style={{ fontSize: '0.72rem', color: '#c084fc', marginTop: '0.25rem' }}>
                        → {issue.assignedOfficer.officerName}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setModalType('assign');
                          setAssigneeName(issue.assignedOfficer?.officerName || '');
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Dispatch / Assign Officer"
                        style={{ padding: '0.35rem 0.65rem' }}
                      >
                        <UserCheck size={14} /> Assign
                      </button>

                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setActionStatus(issue.status);
                          setModalType('status');
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Transition Status"
                        style={{ padding: '0.35rem 0.65rem' }}
                      >
                        <Clock size={14} /> Status
                      </button>

                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setModalType('resolve');
                        }}
                        className="btn btn-success btn-sm"
                        title="Upload Resolution Proof"
                        style={{ padding: '0.35rem 0.65rem' }}
                      >
                        <CheckCircle2 size={14} /> Resolve
                      </button>

                      <button
                        onClick={() => handleReanalyze(issue._id)}
                        disabled={processing}
                        className="btn btn-secondary btn-sm"
                        title="Re-run AI Triage"
                        style={{ padding: '0.35rem 0.5rem', color: '#38bdf8' }}
                      >
                        <Sparkles size={13} />
                      </button>

                      <Link
                        to={`/track/${issue.trackingId}`}
                        className="btn btn-secondary btn-sm"
                        title="View Public Tracking Page"
                        style={{ padding: '0.35rem 0.5rem' }}
                      >
                        <Eye size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Update Status */}
      {modalType === 'status' && selectedIssue && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Update Status: {selectedIssue.trackingId}</h3>
              <button onClick={() => setModalType(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select
                  className="form-select"
                  value={actionStatus}
                  onChange={e => setActionStatus(e.target.value)}
                >
                  <option value="assigned">Assigned to Crew</option>
                  <option value="in_progress">In Progress / Field Work Underway</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected / Duplicate</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Official Progress Note</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. BMC repair truck arrived on site with asphalt leveling equipment..."
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModalType(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="btn btn-primary">
                  {processing ? 'Updating...' : 'Confirm Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Officer */}
      {modalType === 'assign' && selectedIssue && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Dispatch Ticket: {selectedIssue.trackingId}</h3>
              <button onClick={() => setModalType(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">Select Municipal Duty Officer</label>
                <select
                  className="form-select"
                  value={assigneeName}
                  onChange={e => setAssigneeName(e.target.value)}
                >
                  <option value="Rajesh Vaghela (PWD Quick Response)">Rajesh Vaghela (PWD Quick Response)</option>
                  <option value="Meena Trivedi (SWM Sanitation Lead)">Meena Trivedi (SWM Sanitation Lead)</option>
                  <option value="Anil Makwana (Hydraulic Water Works)">Anil Makwana (Hydraulic Water Works)</option>
                  <option value="K. L. Parmar (Electrical Maintenance)">K. L. Parmar (Electrical Maintenance)</option>
                  <option value="BMC Cattle Control Flying Squad">BMC Cattle Control Flying Squad</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dispatch Instructions / Remarks</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Deploy asphalt patching unit immediately; SLA target is 8 hours..."
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModalType(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="btn btn-primary">
                  {processing ? 'Dispatching...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Issue with Proof Photo Upload */}
      {modalType === 'resolve' && selectedIssue && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399' }}>
                <CheckCircle2 size={20} /> Mark Resolved: {selectedIssue.trackingId}
              </h3>
              <button onClick={() => setModalType(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit}>
              <div className="form-group">
                <label className="form-label">Upload Verification Proof Image *</label>
                <div style={{
                  border: '2px dashed var(--border-active)',
                  padding: '1.25rem',
                  textAlign: 'center',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setProofImageFile(file);
                        setProofPreview(URL.createObjectURL(file));
                      }
                    }}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />

                  {proofPreview ? (
                    <img src={proofPreview} alt="Proof preview" style={{ maxHeight: '140px', borderRadius: '6px' }} />
                  ) : (
                    <div>
                      <Upload size={24} color="#34d399" style={{ margin: '0 auto 0.25rem auto' }} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Attach ground-truth photo proof</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required for citizen audit transparency</div>
                    </div>
                  )}
                </div>

                {/* Quick Sample Resolved Photo */}
                <button
                  type="button"
                  onClick={async () => {
                    const sampleUrl = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800';
                    setProofPreview(sampleUrl);
                    try {
                      const res = await fetch(sampleUrl);
                      const blob = await res.blob();
                      const file = new File([blob], 'resolved_proof.jpg', { type: 'image/jpeg' });
                      setProofImageFile(file);
                    } catch {}
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    marginTop: '0.35rem',
                    textAlign: 'left'
                  }}
                >
                  ⚡ Use sample repaired road / clean sidewalk proof photo
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Resolution Work Notes *</label>
                <textarea
                  required
                  className="form-textarea"
                  placeholder="Describe the completed physical intervention (e.g. 2 tons of asphalt laid, pipeline joint clamped, etc.)..."
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModalType(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="btn btn-success">
                  {processing ? 'Saving Resolution...' : 'Confirm Resolution with Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
