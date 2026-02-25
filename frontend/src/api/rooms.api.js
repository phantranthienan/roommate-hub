import { apiClient } from './client';

export const roomsApi = {
  getUserRooms: () =>
    apiClient.get('/rooms').then((res) => res.data),

  createRoom: (payload) =>
    apiClient.post('/rooms', payload).then((res) => res.data),

  joinRoom: (inviteCode) =>
    apiClient.post('/rooms/join', { inviteCode }).then((res) => res.data),

  updateRoom: (roomId, payload) =>
    apiClient.patch(`/rooms/${roomId}`, payload).then((res) => res.data),

  deleteRoom: (roomId) =>
    apiClient.delete(`/rooms/${roomId}`).then((res) => res.data),

  leaveRoom: (roomId) =>
    apiClient.post(`/rooms/${roomId}/leave`).then((res) => res.data),
};
