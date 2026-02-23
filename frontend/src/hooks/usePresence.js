import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presenceApi } from '@/api/presence.api';
import { useRoomStore } from '@/stores/room.store';

export function usePresence() {
  const room = useRoomStore((s) => s.selectedRoom);
  return useQuery({
    queryKey: ['presence', room?.id],
    queryFn: () => presenceApi.getPresence(room?.id),
    refetchInterval: 30000,
    enabled: !!room,
  });
}

export function useUpdatePresence() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isPresent) => presenceApi.updatePresence(room?.id, isPresent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence', room?.id] });
      queryClient.invalidateQueries({ queryKey: ['members', room?.id] });
    },
  });
}
