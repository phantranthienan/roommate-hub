import { useRoomStore } from '@/stores/room.store';

export function useRoom() {
  const selectedRoom = useRoomStore((state) => state.selectedRoom);
  return selectedRoom;
}
