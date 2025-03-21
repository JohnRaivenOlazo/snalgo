import { create } from 'zustand';
import { persist, PersistStorage } from 'zustand/middleware';
import { toast } from 'sonner';

type SessionState = {
  guestName: string;
  hasValidName: boolean;
  currentScore: number;
  setGuestName: (name: string) => void;
  validateName: () => boolean;
  setCurrentScore: (score: number) => void;
};

const storageAdapter: PersistStorage<SessionState> = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    const parsed = JSON.parse(str);
    return parsed.state;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify({ 
      state: value,
      version: 1
    }));
  },
  removeItem: (name) => localStorage.removeItem(name)
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      guestName: '',
      hasValidName: false,
      currentScore: 0,
      setGuestName: (name) => {
        const trimmedName = name.trim().slice(0, 20);
        set({ 
          guestName: trimmedName,
          hasValidName: trimmedName.length > 0
        });
      },
      validateName: () => {
        const isValid = get().guestName.trim().length > 0;
        if (!isValid) {
          toast.error("Please enter a valid name");
        }
        set({ hasValidName: isValid });
        return isValid;
      },
      setCurrentScore: (score) => set({ currentScore: score })
    }),
    {
      name: 'game-session-storage',
      storage: storageAdapter,
    }
  )
); 