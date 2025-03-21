import { create } from 'zustand';
import { BASE_WEIGHT_THRESHOLD } from '@/components/game/utils/gameLogic';
import { Collectible } from '@/components/game/utils/types';

interface GameState {
  coins: number;
  capacity: number;
  upgradeCapacity: () => void;
  addCoins: (amount: number) => void;
  setCapacity: (capacity: number) => void;
  reset: () => void;
  collectibles: Collectible[];
  upgradeInventoryCapacity: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  coins: 0,
  capacity: BASE_WEIGHT_THRESHOLD,
  upgradeCapacity: () => set((state) => ({
    capacity: state.capacity + 10,
    coins: state.coins - 10
  })),
  addCoins: (amount) => set((state) => ({
    coins: state.coins + amount
  })),
  setCapacity: (capacity) => set({ capacity }),
  reset: () => set({ 
    coins: 0, 
    capacity: BASE_WEIGHT_THRESHOLD
  }),
  collectibles: [],
  upgradeInventoryCapacity: () => set((state) => ({ 
    capacity: state.capacity + 10 
  })),
})); 