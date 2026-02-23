import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useRoomStore = create()(
  persist(
    (set) => ({
      selectedRoom: null,
      setSelectedRoom: (room) => set({ selectedRoom: room }),
      clearRoom: () => set({ selectedRoom: null }),
    }),
    {
      name: 'room-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
