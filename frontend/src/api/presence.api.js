import { apiClient } from './client';

export const presenceApi = {
  getPresence: (roomId) =>
    apiClient.get(`/rooms/${roomId}/presence`).then((res) => res.data),

  updatePresence: (roomId, isPresent) =>
    apiClient.patch(`/rooms/${roomId}/presence`, { isPresent }).then((res) => res.data),
};
