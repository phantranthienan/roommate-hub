import { apiClient } from './client';

export const guestsApi = {
  listInvitations: (roomId) =>
    apiClient.get(`/rooms/${roomId}/guests`).then((res) => res.data),

  createInvitation: (roomId, payload) =>
    apiClient.post(`/rooms/${roomId}/guests`, payload).then((res) => res.data),

  revokeInvitation: (roomId, invitationId) =>
    apiClient.delete(`/rooms/${roomId}/guests/${invitationId}`).then((res) => res.data),

  acceptInvitation: (invitationCode) =>
    apiClient.post('/guests/accept', { invitationCode }).then((res) => res.data),
};
