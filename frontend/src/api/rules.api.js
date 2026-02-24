import { apiClient } from './client';

export const rulesApi = {
  getRules: (roomId) =>
    apiClient.get(`/rooms/${roomId}/rules`).then((res) => res.data),

  createRule: (roomId, payload) =>
    apiClient.post(`/rooms/${roomId}/rules`, payload).then((res) => res.data),

  voteRule: (roomId, ruleId) =>
    apiClient.post(`/rooms/${roomId}/rules/${ruleId}/vote`).then((res) => res.data),

  unvoteRule: (roomId, ruleId) =>
    apiClient.delete(`/rooms/${roomId}/rules/${ruleId}/vote`).then((res) => res.data),

  approveRule: (roomId, ruleId) =>
    apiClient.patch(`/rooms/${roomId}/rules/${ruleId}/approve`).then((res) => res.data),

  rejectRule: (roomId, ruleId) =>
    apiClient.patch(`/rooms/${roomId}/rules/${ruleId}/reject`).then((res) => res.data),
};
