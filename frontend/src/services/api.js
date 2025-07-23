import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', 
  withCredentials: true,
});

export default api;

export const logout = () => api.post('/users/logout');

export const getVideos = (params = {}) => api.get('/videos', { params });

// Verify JWT and fetch current user details
export const getCurrentUser = () => api.get('/users/current-user');
