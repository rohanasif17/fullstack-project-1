import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', 
  withCredentials: true,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log('API Error:', error.response?.status, error.config?.url);
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh the token
    // Only attempt refresh for non-refresh-token requests to avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/refresh-token')) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.post(
          'http://localhost:8000/api/v1/users/refresh-token',
          {},
          { withCredentials: true }
        );

        // If refresh was successful, retry the original request
        if (response.status === 200) {
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh failed, don't redirect automatically
        // Let the calling component handle the error
        console.log('Token refresh failed:', refreshError.response?.status);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export const logout = () => api.post('/users/logout');

export const refreshToken = () => api.post('/users/refresh-token');

export const getVideos = (params = {}) => api.get('/videos', { params });

export const getCategories = () => api.get('/videos/categories');

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

export const publishVideo = (formData) =>
  api.post('/videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Tweet APIs
export const getAllTweets = () => api.get('/tweets');
export const getUserHistory = () => api.get('/users/history');
export const toggleTweetLike = (tweetId) => api.post(`/likes/toggle/t/${tweetId}`);
export const createTweet = (content) => api.post('/tweets/createTweet', { content });
export const updateTweet = (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content });
export const deleteTweet = (tweetId) => api.delete(`/tweets/${tweetId}`);

export const getLikedVideos = () => api.get('/likes/videos');

export const getDashboardStats = () => api.get('/dashboard/stats');

export const getUserSubscriptions = (subscriberId) => api.get(`/subscriptions/u/${subscriberId}`);

// Fetch videos for a specific user
export const getUserVideos = (userId, params = {}) => api.get(`/videos`, { params: { ...params, userId } });

// Fetch tweets for a specific user
export const getUserTweets = (userId) => api.get(`/tweets/user/${userId}`);

// Fetch current user's videos for dashboard
export const getDashboardVideos = () => api.get('/dashboard/videos');

// Get user channel profile by username
export const getUserByUsername = (username) => api.get(`/users/c/${username}`);

// Playlist APIs
export const getCurrentUserPlaylists = () => api.get('/playlist/user');
export const getUserPlaylists = (userId) => api.get(`/playlist/user/${userId}`);
export const createPlaylist = (name, description) => api.post('/playlist', { name, description });
export const getPlaylistById = (playlistId) => api.get(`/playlist/${playlistId}`);
export const updatePlaylist = (playlistId, name, description) => api.patch(`/playlist/${playlistId}`, { name, description });
export const deletePlaylist = (playlistId) => api.delete(`/playlist/${playlistId}`);
export const addVideoToPlaylist = (videoId, playlistId) => api.patch(`/playlist/add/${videoId}/${playlistId}`);
export const removeVideoFromPlaylist = (videoId, playlistId) => api.patch(`/playlist/remove/${videoId}/${playlistId}`);
