// Base URL of our Flask backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Helper: get token from localStorage ──
const getToken = () => localStorage.getItem('crisiswatch_token');

// ── Helper: build headers ──
const headers = (auth = false) => ({
  'Content-Type': 'application/json',
  ...(auth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ── Helper: handle response ──
const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
};

/* ════════════════════════════
   AUTH
════════════════════════════ */
export const authAPI = {

  register: (form) =>
    fetch(`${BASE_URL}/auth/register`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(form),
    }).then(handle),

  login: (form) =>
    fetch(`${BASE_URL}/auth/login`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(form),
    }).then(handle),

  me: () =>
    fetch(`${BASE_URL}/auth/me`, {
      headers: headers(true),
    }).then(handle),

  logout: () =>
    fetch(`${BASE_URL}/auth/logout`, {
      method:  'POST',
      headers: headers(true),
    }).then(handle),
};

/* ════════════════════════════
   INCIDENTS
════════════════════════════ */
export const incidentsAPI = {

  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/incidents/${query ? '?' + query : ''}`, {
      headers: headers(),
    }).then(handle);
  },

  getOne: (id) =>
    fetch(`${BASE_URL}/incidents/${id}`, {
      headers: headers(),
    }).then(handle),

  create: (form) =>
    fetch(`${BASE_URL}/incidents/`, {
      method:  'POST',
      headers: headers(true),
      body:    JSON.stringify(form),
    }).then(handle),

  update: (id, data) =>
    fetch(`${BASE_URL}/incidents/${id}`, {
      method:  'PUT',
      headers: headers(true),
      body:    JSON.stringify(data),
    }).then(handle),

  delete: (id) =>
    fetch(`${BASE_URL}/incidents/${id}`, {
      method:  'DELETE',
      headers: headers(true),
    }).then(handle),
};

/* ════════════════════════════
   ALERTS
════════════════════════════ */
export const alertsAPI = {

  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/alerts/${query ? '?' + query : ''}`, {
      headers: headers(true),
    }).then(handle);
  },

  markRead: (id) =>
    fetch(`${BASE_URL}/alerts/${id}/read`, {
      method:  'PUT',
      headers: headers(true),
    }).then(handle),

  markAllRead: () =>
    fetch(`${BASE_URL}/alerts/read-all`, {
      method:  'PUT',
      headers: headers(true),
    }).then(handle),

  delete: (id) =>
    fetch(`${BASE_URL}/alerts/${id}`, {
      method:  'DELETE',
      headers: headers(true),
    }).then(handle),

  clearAll: () =>
    fetch(`${BASE_URL}/alerts/clear-all`, {
      method:  'DELETE',
      headers: headers(true),
    }).then(handle),
};

/* ════════════════════════════
   DASHBOARD
════════════════════════════ */
export const dashboardAPI = {
  getStats: () =>
    fetch(`${BASE_URL}/dashboard/stats`, {
      headers: headers(true),
    }).then(handle),
};

/* ════════════════════════════
   PROFILE
════════════════════════════ */
export const profileAPI = {

  get: () =>
    fetch(`${BASE_URL}/profile/`, {
      headers: headers(true),
    }).then(handle),

  update: (data) =>
    fetch(`${BASE_URL}/profile/`, {
      method:  'PUT',
      headers: headers(true),
      body:    JSON.stringify(data),
    }).then(handle),

  changePassword: (data) =>
    fetch(`${BASE_URL}/profile/change-password`, {
      method:  'PUT',
      headers: headers(true),
      body:    JSON.stringify(data),
    }).then(handle),
};

/* ════════════════════════════
   TOKEN HELPERS
════════════════════════════ */
export const saveToken  = (token) => localStorage.setItem('crisiswatch_token', token);
export const clearToken = ()      => localStorage.removeItem('crisiswatch_token');
export const isLoggedIn = ()      => !!getToken();