import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@/api/items.api';
import { useRoomStore } from '@/stores/room.store';
import { useMembers } from './useMembers';

export function useItems() {
  const room = useRoomStore((s) => s.selectedRoom);
  const { data: members = [] } = useMembers();

  return useQuery({
    queryKey: ['items', room?.id],
    queryFn: () => itemsApi.getItems(room?.id),
    enabled: !!room,
    select: (raw) => {
      const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));
      return raw.map((item) => {
        const purchaser = item.lastPurchasedBy ? memberMap[item.lastPurchasedBy] : null;
        return {
          ...item,
          lastPurchaser: purchaser
            ? { id: purchaser.userId, username: purchaser.username, firstName: purchaser.firstName, lastName: purchaser.lastName, avatarUrl: purchaser.avatarUrl }
            : null,
        };
      });
    },
  });
}

export function useCreateItem() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => itemsApi.createItem(room?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', room?.id] });
    },
  });
}

export function useUpdateItemStatus() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, status }) => itemsApi.updateItemStatus(room?.id, itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', room?.id] });
    },
  });
}

export function useDeleteItem() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => itemsApi.deleteItem(room?.id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', room?.id] });
    },
  });
}
