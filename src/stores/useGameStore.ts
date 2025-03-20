import { create } from 'zustand';
import { MAX_STOMACH_CAPACITY } from '@/components/game/utils/gameLogic';

interface GameState {
  coins: number;
  capacity: number;
  upgradeCapacity: () => void;
  addCoins: (amount: number) => void;
  setCapacity: (capacity: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  coins: 0,
  capacity: 15,
  upgradeCapacity: () => set((state) => ({
    capacity: state.capacity + 10,
    coins: state.coins - 10
  })),
  addCoins: (amount) => set((state) => ({
    coins: state.coins + amount
  })),
  setCapacity: (capacity) => set({ capacity }),
  reset: () => set({ coins: 0, capacity: MAX_STOMACH_CAPACITY })
})); 