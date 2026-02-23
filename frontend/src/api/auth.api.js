import { apiClient } from './client';

export const authApi = {
  login: (data) =>
    apiClient.post('/auth/login', data).then((res) => res.data),

  register: (data) =>
    apiClient.post('/auth/register', data).then((res) => res.data),

  getProfile: () =>
    apiClient.get('/auth/me').then((res) => res.data),

  updateProfile: (payload) =>
    apiClient.patch('/auth/me', payload).then((res) => res.data),
};
