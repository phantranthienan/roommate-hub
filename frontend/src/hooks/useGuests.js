import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { guestsApi } from '@/api/guests.api';
import { useRoomStore } from '@/stores/room.store';

export function useGuestInvitations() {
  const room = useRoomStore((s) => s.selectedRoom);
  return useQuery({
    queryKey: ['guests', room?.id],
    queryFn: () => guestsApi.listInvitations(room?.id),
    enabled: !!room,
  });
}

export function useCreateGuestInvitation() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => guestsApi.createInvitation(room?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', room?.id] });
    },
  });
}

export function useRevokeGuestInvitation() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId) => guestsApi.revokeInvitation(room?.id, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', room?.id] });
    },
  });
}

/** Used in the join dialog — no room context needed. */
export function useAcceptGuestInvitation() {
  return useMutation({
    mutationFn: (code) => guestsApi.acceptInvitation(code),
  });
}
