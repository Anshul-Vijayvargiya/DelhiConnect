import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dc_token');
      localStorage.removeItem('dc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Complaints
export const complaintsAPI = {
  create: (data) => api.post('/complaints', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: (params) => api.get('/complaints', { params }),
  get: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),
  assign: (id, data) => api.patch(`/complaints/${id}/assign`, data),
  resolve: (id, data) => api.post(`/complaints/${id}/resolve`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  feedback: (id, data) => api.post(`/complaints/${id}/feedback`, data),
  vote: (id) => api.post(`/complaints/${id}/vote`),
  comment: (id, commentText) => api.post(`/complaints/${id}/comment`, { commentText }),
};

// Analytics
export const analyticsAPI = {
  overview: (params) => api.get('/analytics/overview', { params }),
  heatmap: () => api.get('/analytics/heatmap'),
  departments: () => api.get('/analytics/department'),
  trends: (params) => api.get('/analytics/trends', { params }),
  categories: () => api.get('/analytics/categories'),
  districts: () => api.get('/analytics/districts'),
};

// Reports
export const reportsAPI = {
  generate: (params) => api.get('/reports/generate', { params, responseType: 'blob' }),
};

// AI
export const aiAPI = {
  categorize: (text) => api.post('/ai/categorize', { text }),
};

export default api;
