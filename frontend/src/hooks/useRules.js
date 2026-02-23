import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rulesApi } from '@/api/rules.api';
import { useRoomStore } from '@/stores/room.store';
import { useMembers } from './useMembers';

export function useRules() {
  const room = useRoomStore((s) => s.selectedRoom);
  const { data: members = [] } = useMembers();

  return useQuery({
    queryKey: ['rules', room?.id],
    queryFn: () => rulesApi.getRules(room?.id),
    enabled: !!room,
    select: (raw) => {
      const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));
      return raw.map((rule) => {
        const proposer = rule.proposedBy ? memberMap[rule.proposedBy] : null;
        return {
          ...rule,
          author: proposer
            ? { id: proposer.userId, username: proposer.username, firstName: proposer.firstName, lastName: proposer.lastName, avatarUrl: proposer.avatarUrl }
            : null,
        };
      });
    },
  });
}

export function useCreateRule() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => rulesApi.createRule(room?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', room?.id] });
    },
  });
}

export function useVoteRule() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId) => rulesApi.voteRule(room?.id, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', room?.id] });
    },
  });
}

export function useAcceptRule() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId) => rulesApi.acceptRule(room?.id, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', room?.id] });
    },
  });
}
