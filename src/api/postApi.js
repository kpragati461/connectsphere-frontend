import api from './axiosConfig';

export const createPost = (data) => api.post('/api/posts', data);
export const getFeed = () => api.get('/api/posts/feed');
export const deletePost = (postId) => api.delete(`/api/posts/${postId}`);
export const getUserPosts = (username) => api.get(`/api/posts/user/${username}`);