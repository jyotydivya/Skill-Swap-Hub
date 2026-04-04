import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data)     => api.post('/auth/register', data),
  login:    (data)     => api.post('/auth/login', data),
  getMe:    ()         => api.get('/auth/me'),
};

export const skillsAPI = {
  getAll:   (params)   => api.get('/skills', { params }),
  getById:  (id)       => api.get(`/skills/${id}`),
  create:   (data)     => api.post('/skills', data),
  update:   (id, data) => api.put(`/skills/${id}`, data),
  delete:   (id)       => api.delete(`/skills/${id}`),
};

export const usersAPI = {
  getById:        (id)   => api.get(`/users/${id}`),
  updateProfile:  (data) => api.put('/users/profile', data),
};

export const requestsAPI = {
  send:         (data)         => api.post('/requests', data),
  getMy:        ()             => api.get('/requests/my'),
  updateStatus: (id, status)   => api.patch(`/requests/${id}/status`, { status }),
};

export const sessionsAPI = {
  getMy:     ()   => api.get('/sessions/my'),
  complete:  (id) => api.patch(`/sessions/${id}/complete`),
};

export const reviewsAPI = {
  create:     (data)     => api.post('/reviews', data),
  getForUser: (userId)   => api.get(`/reviews/user/${userId}`),
};

export const paymentAPI = {
  createOrder: (plan) => api.post('/payments/order', { plan }),
  verify:      (data) => api.post('/payments/verify', data),
};

export const chatAPI = {
  getMessages: (roomId) => api.get(`/chat/${roomId}`),
  sendMessage: (data)   => api.post('/chat', data),
};

export const adminAPI = {
  getDashboard: ()   => api.get('/admin/dashboard'),
  getUsers:     ()   => api.get('/admin/users'),
  toggleUser:   (id) => api.patch(`/admin/users/${id}/toggle`),
  getPayments:  ()   => api.get('/admin/payments'),
};

export default api;
