import { create } from 'zustand';
import { toast } from 'sonner';

type SessionState = {
  guestName: string;
  hasValidName: boolean;
  currentScore: number;
  setGuestName: (name: string) => void;
  validateName: () => boolean;
  setCurrentScore: (score: number) => void;
};

export const useSessionStore = create<SessionState>((set, get) => ({
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
}));