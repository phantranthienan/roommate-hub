import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '@/api/members.api';
import { useRoomStore } from '@/stores/room.store';
import { useAuthStore } from '@/stores/auth.store';

export function useMembers() {
  const room = useRoomStore((s) => s.selectedRoom);
  return useQuery({
    queryKey: ['members', room?.id],
    queryFn: () => membersApi.getMembers(room?.id),
    enabled: !!room,
  });
}

export function useMyRole() {
  const currentUser = useAuthStore((s) => s.user);
  const { data: members = [] } = useMembers();
  const myMember = members.find((m) => m.userId === currentUser?.id);
  const myRole = myMember?.roleName ?? 'member';
  return {
    myRole,
    isOwner: myRole === 'owner',
    isOwnerOrAdmin: myRole === 'owner' || myRole === 'admin',
  };
}

export function useChangeMemberRole() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, roleId }) => membersApi.changeMemberRole(room?.id, memberId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', room?.id] });
    },
  });
}

export function useRemoveMember() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId) => membersApi.removeMember(room?.id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', room?.id] });
    },
  });
}

export function useTransferOwnership() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOwnerId) => membersApi.transferOwnership(room?.id, newOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', room?.id] });
    },
  });
}
