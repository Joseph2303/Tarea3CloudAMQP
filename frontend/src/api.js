import axios from "axios";

// Si publicas el front fuera de Netlify, define VITE_API_BASE con el dominio del backend Netlify.
const API_BASE = import.meta.env.VITE_API_BASE || "/.netlify/functions";

function authHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  register: (data) => axios.post(`${API_BASE}/register`, data).then(r => r.data),
  login: (data) => axios.post(`${API_BASE}/login`, data).then(r => r.data),

  // Autores
  listAuthors: () => axios.get(`${API_BASE}/authors`, { headers: authHeaders() }).then(r => r.data),
  createAuthor: (data) => axios.post(`${API_BASE}/authors`, data, { headers: authHeaders() }).then(r => r.data),
  deleteAuthor: (_id) => axios.delete(`${API_BASE}/authors`, { data: { _id }, headers: authHeaders() }).then(r => r.data),

  // Editoriales
  listPublishers: () => axios.get(`${API_BASE}/publishers`, { headers: authHeaders() }).then(r => r.data),
  createPublisher: (data) => axios.post(`${API_BASE}/publishers`, data, { headers: authHeaders() }).then(r => r.data),
  deletePublisher: (_id) => axios.delete(`${API_BASE}/publishers`, { data: { _id }, headers: authHeaders() }).then(r => r.data),

  // Procesar cola
  processQueue: (max = 50) => axios.post(`${API_BASE}/process-queue?max=${max}`, null, { headers: authHeaders() }).then(r => r.data),
};
