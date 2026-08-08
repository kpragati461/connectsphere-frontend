import api from './axiosConfig';

export const uploadPostMedia = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/media/upload-post', formData, {
    headers: { 'Content-Type': undefined },
  });
};

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/media/upload-avatar', formData, {
    headers: { 'Content-Type': undefined },
  });
};