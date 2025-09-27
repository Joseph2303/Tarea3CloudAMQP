import axios from "axios";

// Si publicas el front fuera de Netlify, define VITE_API_BASE con el dominio del backend Netlify.
const API_BASE = import.meta.env.VITE_API_BASE || "/.netlify/functions";

export const api = {
  // Autores
  listAuthors: () => axios.get(`${API_BASE}/authors`).then(r => r.data),
  createAuthor: (data) => axios.post(`${API_BASE}/authors`, data).then(r => r.data),
  deleteAuthor: (_id) => axios.delete(`${API_BASE}/authors`, { data: { _id } }).then(r => r.data),

  // Editoriales
  listPublishers: () => axios.get(`${API_BASE}/publishers`).then(r => r.data),
  createPublisher: (data) => axios.post(`${API_BASE}/publishers`, data).then(r => r.data),
  deletePublisher: (_id) => axios.delete(`${API_BASE}/publishers`, { data: { _id } }).then(r => r.data),

  // Procesar cola
  processQueue: (max = 50) => axios.post(`${API_BASE}/process-queue?max=${max}`).then(r => r.data),
};
