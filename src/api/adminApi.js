import api from './axiosConfig';

export const getStats = () => api.get('/api/admin/stats');
export const getAllUsers = () => api.get('/api/admin/users');
export const banUser = (userId) => api.put(`/api/admin/users/${userId}/ban`);
export const unbanUser = (userId) => api.put(`/api/admin/users/${userId}/unban`);
export const adminDeletePost = (postId) => api.delete(`/api/admin/posts/${postId}`);
export const adminDeleteComment = (commentId) => api.delete(`/api/admin/comments/${commentId}`);