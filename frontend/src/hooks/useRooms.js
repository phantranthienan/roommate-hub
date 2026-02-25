import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '@/api/rooms.api';
import { useRoomStore } from '@/stores/room.store';

export function useGetUserRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getUserRooms,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => roomsApi.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useJoinRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode) => roomsApi.joinRoom(inviteCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateRoom() {
  const room = useRoomStore((s) => s.selectedRoom);
  const setSelectedRoom = useRoomStore((s) => s.setSelectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => roomsApi.updateRoom(room?.id, data),
    onSuccess: (updatedRoom) => {
      setSelectedRoom(updatedRoom);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useDeleteRoom() {
  const room = useRoomStore((s) => s.selectedRoom);
  const clearRoom = useRoomStore((s) => s.clearRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => roomsApi.deleteRoom(room?.id),
    onSuccess: () => {
      clearRoom();
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useRotateInviteCode() {
  const room = useRoomStore((s) => s.selectedRoom);
  const setSelectedRoom = useRoomStore((s) => s.setSelectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => roomsApi.rotateInviteCode(room?.id),
    onSuccess: (updatedRoom) => {
      setSelectedRoom({ ...room, inviteCode: updatedRoom.inviteCode });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useLeaveRoom() {
  const room = useRoomStore((s) => s.selectedRoom);
  const clearRoom = useRoomStore((s) => s.clearRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => roomsApi.leaveRoom(room?.id),
    onSuccess: () => {
      clearRoom();
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
