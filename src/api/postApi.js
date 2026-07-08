import api from './axiosConfig';

export const createPost = (data) => api.post('/api/posts', data);
export const getFeed = () => api.get('/api/posts/feed');
export const deletePost = (postId) => api.delete(`/api/posts/${postId}`);
export const getUserPosts = (username) => api.get(`/api/posts/user/${username}`);
export const toggleLike = (postId) => api.post(`/api/posts/${postId}/like`);
export const getComments = (postId) => api.get(`/api/posts/${postId}/comments`);
export const addComment = (postId, data) => api.post(`/api/posts/${postId}/comments`, data);
export const deleteComment = (commentId) => api.delete(`/api/posts/comments/${commentId}`);