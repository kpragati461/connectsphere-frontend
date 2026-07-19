import api from './axiosConfig';

export const getMyProfile = () => api.get('/api/users/me');
export const updateMyProfile = (data) => api.put('/api/users/me', data);
export const getUserProfile = (username) => api.get(`/api/users/${username}`);
export const toggleFollow = (username) => api.post(`/api/users/${username}/follow`);
export const searchUsers = (query) => api.get(`/api/users/search?query=${query}`);