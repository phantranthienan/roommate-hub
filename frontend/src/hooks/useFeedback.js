import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedbackApi } from '@/api/feedback.api';
import { useRoomStore } from '@/stores/room.store';
import { useMembers } from './useMembers';

export function useFeedback() {
  const room = useRoomStore((s) => s.selectedRoom);
  const { data: members = [] } = useMembers();

  return useQuery({
    queryKey: ['feedback', room?.id],
    queryFn: () => feedbackApi.getFeedback(room?.id),
    enabled: !!room,
    select: (raw) => {
      const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));
      return raw.map((item) => {
        const creator = item.createdBy ? memberMap[item.createdBy] : null;
        return {
          ...item,
          author: creator
            ? { id: creator.userId, username: creator.username, firstName: creator.firstName, lastName: creator.lastName, avatarUrl: creator.avatarUrl }
            : null,
        };
      });
    },
  });
}

export function useCreateFeedback() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => feedbackApi.createFeedback(room?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', room?.id] });
    },
  });
}

export function useVoteFeedback() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feedbackId) => feedbackApi.voteFeedback(room?.id, feedbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', room?.id] });
    },
  });
}

export function useUnvoteFeedback() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feedbackId) => feedbackApi.unvoteFeedback(room?.id, feedbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', room?.id] });
    },
  });
}

export function useUpdateFeedbackStatus() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ feedbackId, status }) => feedbackApi.updateFeedbackStatus(room?.id, feedbackId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', room?.id] });
    },
  });
}
