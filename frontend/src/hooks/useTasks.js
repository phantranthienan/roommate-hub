import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/api/tasks.api';
import { useRoomStore } from '@/stores/room.store';
import { useMembers } from './useMembers';

export function useTasks(filters) {
  const room = useRoomStore((s) => s.selectedRoom);
  const { data: members = [] } = useMembers();

  return useQuery({
    queryKey: ['tasks', room?.id, filters],
    queryFn: () => tasksApi.getTasks(room?.id, filters),
    enabled: !!room,
    select: (raw) => {
      const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));
      return raw.map((task) => {
        const assignee = task.assignedTo ? memberMap[task.assignedTo] : null;
        return {
          ...task,
          assignedUser: assignee
            ? { id: assignee.userId, username: assignee.username, firstName: assignee.firstName, lastName: assignee.lastName, avatarUrl: assignee.avatarUrl }
            : null,
        };
      });
    },
  });
}

export function useCreateTask() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => tasksApi.createTask(room?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', room?.id] });
    },
  });
}

export function useUpdateTask() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }) => tasksApi.updateTask(room?.id, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', room?.id] });
    },
  });
}

export function useDeleteTask() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => tasksApi.deleteTask(room?.id, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', room?.id] });
    },
  });
}

export function useToggleComplete() {
  const room = useRoomStore((s) => s.selectedRoom);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => tasksApi.toggleComplete(room?.id, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', room?.id] });
    },
  });
}
