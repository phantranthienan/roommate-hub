import { apiClient } from './client';

export const tasksApi = {
  getTasks: (roomId, params) =>
    apiClient.get(`/rooms/${roomId}/tasks`, { params }).then((res) => res.data),

  createTask: (roomId, payload) =>
    apiClient.post(`/rooms/${roomId}/tasks`, payload).then((res) => res.data),

  updateTask: (roomId, taskId, payload) =>
    apiClient.patch(`/rooms/${roomId}/tasks/${taskId}`, payload).then((res) => res.data),

  markDone: (roomId, taskId) =>
    apiClient.patch(`/rooms/${roomId}/tasks/${taskId}/done`).then((res) => res.data),

  renewTask: (roomId, taskId, payload) =>
    apiClient.patch(`/rooms/${roomId}/tasks/${taskId}/renew`, payload).then((res) => res.data),

  deleteTask: (roomId, taskId) =>
    apiClient.delete(`/rooms/${roomId}/tasks/${taskId}`).then((res) => res.data),
};
