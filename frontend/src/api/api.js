import axios from 'axios';

const BASE_URL = `${(process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api`;

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Auto-attach JWT token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 - redirect to login
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const isDoctor = window.location.pathname.startsWith('/doctor');
      if (!isDoctor) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default API;

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register:      data => API.post('/auth/register', data),
  verifyOtp:     data => API.post('/auth/verify-otp', data),
  resendOtp:     data => API.post('/auth/resend-otp', data),
  login:         data => API.post('/auth/login', data),
  profile:       ()   => API.get('/auth/profile'),
  updateProfile: data => API.put('/auth/profile/update', data),
  debugOtp:      data => API.post('/auth/debug-otp', data),
};

// ── Symptoms ──────────────────────────────────────────────────
export const symptomAPI = {
  analyze:       data => API.post('/symptoms/analyze', data),
  analyzePublic: data => API.post('/symptoms/analyze-public', data),
  history:       ()   => API.get('/symptoms/history'),
  suggest:       q    => API.get('/symptoms/suggest', { params: { q } }),
  feedback:      data => API.post('/symptoms/feedback', data),
};

// ── Appointments ──────────────────────────────────────────────
export const appointmentAPI = {
  getDoctors:     spec       => API.get('/appointments/doctors', { params: { specialization: spec } }),
  getDoctor:      id         => API.get(`/appointments/doctors/${id}`),
  getSlots:       (id, date) => API.get(`/appointments/slots/${id}`, { params: { date } }),
  book:           data       => API.post('/appointments/book', data),
  myAppointments: ()         => API.get('/appointments/my'),
  cancel:         id         => API.put(`/appointments/cancel/${id}`),
};

// ── Doctor Portal ─────────────────────────────────────────────
const DOCTOR_BASE = `${BASE_URL}/doctor`;

export const doctorAPI = {
  login: async (email, password) => {
    const r = await fetch(`${DOCTOR_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return r.json();
  },
  call: async (url, opts = {}) => {
    const token = localStorage.getItem('doctorToken');
    const r = await fetch(`${DOCTOR_BASE}${url}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...opts,
    });
    if (r.status === 401) {
      localStorage.removeItem('doctorToken');
      window.location.href = '/doctor/login';
      return {};
    }
    return r.json();
  },
};