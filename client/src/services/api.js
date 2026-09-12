const BASE_URL = 'http://localhost:5000/api/v1';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('smart_bhavnagar_token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const api = {
  // Issues
  getIssues: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/issues?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getIssueByTrackingId: async (trackingId) => {
    const res = await fetch(`${BASE_URL}/issues/track/${trackingId}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getIssueById: async (id) => {
    const res = await fetch(`${BASE_URL}/issues/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createIssue: async (formData) => {
    const res = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  updateStatus: async (id, status, notes) => {
    const res = await fetch(`${BASE_URL}/issues/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, notes })
    });
    return handleResponse(res);
  },

  assignIssue: async (id, data) => {
    const res = await fetch(`${BASE_URL}/issues/${id}/assign`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  resolveIssue: async (id, formData) => {
    const res = await fetch(`${BASE_URL}/issues/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  submitFeedback: async (id, { rating, comment }) => {
    const res = await fetch(`${BASE_URL}/issues/${id}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, comment })
    });
    return handleResponse(res);
  },

  getPublicFeed: async () => {
    const res = await fetch(`${BASE_URL}/issues/public/feed`);
    return handleResponse(res);
  },

  // AI
  testAiAnalyze: async (formData) => {
    const res = await fetch(`${BASE_URL}/ai/analyze`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  reanalyzeIssue: async (id) => {
    const res = await fetch(`${BASE_URL}/ai/reanalyze/${id}`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Geo & Map
  getGeoJSON: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/geo/geojson?${query}`);
    return handleResponse(res);
  },

  getWardHotspots: async () => {
    const res = await fetch(`${BASE_URL}/geo/hotspots`);
    return handleResponse(res);
  },

  // Admin Analytics
  getAnalytics: async () => {
    const res = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Auth
  login: async (phone, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getOfficers: async () => {
    const res = await fetch(`${BASE_URL}/auth/officers`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Demo
  seedDemo: async () => {
    const res = await fetch(`${BASE_URL}/demo/seed`, {
      method: 'POST'
    });
    return handleResponse(res);
  }
};
