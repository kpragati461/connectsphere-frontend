import api from './axiosConfig';

export const getNotifications = () => api.get('/api/notifications');
export const getUnreadCount = () => api.get('/api/notifications/unread-count');
export const markAllAsRead = () => api.put('/api/notifications/mark-all-read');