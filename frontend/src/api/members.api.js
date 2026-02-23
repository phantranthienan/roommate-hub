import { apiClient } from './client';

export const membersApi = {
  getMembers: (roomId) =>
    apiClient.get(`/rooms/${roomId}/members`).then((res) => res.data),

  changeMemberRole: (roomId, memberId, roleId) =>
    apiClient.patch(`/rooms/${roomId}/members/${memberId}/role`, { roleId }).then((res) => res.data),

  removeMember: (roomId, memberId) =>
    apiClient.delete(`/rooms/${roomId}/members/${memberId}`).then((res) => res.data),
};
