import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — log in dev
api.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`➡️  ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
  }
  return config;
});

// Response interceptor — normalise errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || err.message || 'Network error';
    return Promise.reject(new Error(msg));
  }
);

// ─── Task endpoints ───────────────────────────────────────────────────────────
export const taskAPI = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  patchStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  delete: (id) => api.delete(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats/summary'),
};

export default api;
