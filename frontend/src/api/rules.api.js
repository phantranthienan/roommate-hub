import { apiClient } from './client';

export const rulesApi = {
  getRules: (roomId) =>
    apiClient.get(`/rooms/${roomId}/rules`).then((res) => res.data),

  createRule: (roomId, payload) =>
    apiClient.post(`/rooms/${roomId}/rules`, payload).then((res) => res.data),

  // Backend vote API is binary (voted / not voted).
  voteRule: (roomId, ruleId) =>
    apiClient.post(`/rooms/${roomId}/rules/${ruleId}/vote`).then((res) => res.data),

  acceptRule: (roomId, ruleId) =>
    apiClient.post(`/rooms/${roomId}/rules/${ruleId}/accept`).then((res) => res.data),
};
