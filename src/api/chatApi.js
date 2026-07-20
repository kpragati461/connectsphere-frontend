import api from './axiosConfig';

export const getConversations = () => api.get('/api/conversations');
export const startConversation = (username) => api.post(`/api/conversations/${username}`);
export const getMessages = (conversationId) => api.get(`/api/conversations/${conversationId}/messages`);
export const sendMessage = (conversationId, data) => 
    api.post(`/api/conversations/${conversationId}/messages`, data);