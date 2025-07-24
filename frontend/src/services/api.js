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

export const getVideoById = (id) => api.get(`/videos/${id}`);

export const toggleVideoLike = (id) => api.post(`/likes/toggle/v/${id}`);

export const getVideoComments = (videoId, params = {}) => api.get(`/comments/${videoId}`, { params });

export const addVideoComment = (videoId, content) => api.post(`/comments/${videoId}`, { content });

export const toggleCommentLike = (commentId) => api.post(`/likes/toggle/c/${commentId}`);

// Update a comment
export const updateComment = (commentId, content) => api.patch(`/comments/c/${commentId}`, { content });

// Delete a comment
export const deleteComment = (commentId) => api.delete(`/comments/c/${commentId}`);

// Count a view for the given videoId
export const addVideoView = (id) => api.post(`/videos/${id}/view`);

export const getChannelSubscribers = (channelId) => api.get(`/subscriptions/c/${channelId}`);

export const toggleChannelSubscription = (channelId) => api.post(`/subscriptions/c/${channelId}`);
