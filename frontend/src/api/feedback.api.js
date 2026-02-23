import { apiClient } from './client';

export const feedbackApi = {
  getFeedback: (roomId) =>
    apiClient.get(`/rooms/${roomId}/feedback`).then((res) => res.data),

  createFeedback: (roomId, payload) =>
    apiClient.post(`/rooms/${roomId}/feedback`, payload).then((res) => res.data),

  // Backend vote API is binary (voted / not voted).
  voteFeedback: (roomId, feedbackId) =>
    apiClient.post(`/rooms/${roomId}/feedback/${feedbackId}/vote`).then((res) => res.data),

  updateFeedbackStatus: (roomId, feedbackId, status) =>
    apiClient.patch(`/rooms/${roomId}/feedback/${feedbackId}/close`, { status }).then((res) => res.data),
};
