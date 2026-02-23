import { apiClient } from './client';

export const itemsApi = {
  getItems: (roomId) =>
    apiClient.get(`/rooms/${roomId}/items`).then((res) => res.data),

  createItem: (roomId, payload) =>
    apiClient.post(`/rooms/${roomId}/items`, payload).then((res) => res.data),

  updateItem: (roomId, itemId, payload) =>
    apiClient.patch(`/rooms/${roomId}/items/${itemId}`, payload).then((res) => res.data),

  updateItemStatus: (roomId, itemId, status) =>
    apiClient.patch(`/rooms/${roomId}/items/${itemId}/status`, { status }).then((res) => res.data),

  deleteItem: (roomId, itemId) =>
    apiClient.delete(`/rooms/${roomId}/items/${itemId}`).then((res) => res.data),
};
