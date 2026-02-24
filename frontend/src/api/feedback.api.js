import { apiClient } from './client';

export const feedbackApi = {
  getFeedback: (roomId) =>
    apiClient.get(`/rooms/${roomId}/feedback`).then((res) => res.data),

  createFeedback: (roomId, payload) =>
    apiClient.post(`/rooms/${roomId}/feedback`, payload).then((res) => res.data),

  voteFeedback: (roomId, feedbackId) =>
    apiClient.post(`/rooms/${roomId}/feedback/${feedbackId}/vote`).then((res) => res.data),

  unvoteFeedback: (roomId, feedbackId) =>
    apiClient.delete(`/rooms/${roomId}/feedback/${feedbackId}/vote`).then((res) => res.data),

  updateFeedbackStatus: (roomId, feedbackId, status) =>
    apiClient.patch(`/rooms/${roomId}/feedback/${feedbackId}/close`, { status }).then((res) => res.data),
};
