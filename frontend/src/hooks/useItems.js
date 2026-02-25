import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@/api/items.api';
import { useRoomStore } from '@/stores/room.store';

export function useItems() {
  const room = useRoomStore((s) => s.selectedRoom);

  return useQuery({
    queryKey: ['items', room?.id],
    queryFn: () => itemsApi.getItems(room?.id),
    enabled: !!room,
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

export function useUpdateItem() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }) => itemsApi.updateItem(room?.id, itemId, data),
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
