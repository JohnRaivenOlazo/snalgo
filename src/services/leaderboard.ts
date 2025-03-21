import { supabase } from '@/lib/supabase/client';
import { useSessionStore } from '@/stores/session';

export type LeaderboardEntry = {
  id: string;
  score: number;
  level: number;
  username: string;
  created_at: string;
};

export const LeaderboardService = {
  getTopScores: async (limit = 10): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('scores')
      .select('id, score, level, username, created_at')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching leaderboard:", JSON.stringify(error, null, 2));
      return [];
    }
    return data as LeaderboardEntry[];
  },

  submitScore: async (score: number, level: number): Promise<boolean> => {
    const { guestName, hasValidName } = useSessionStore.getState();
    
    if (!hasValidName) {
      console.error("Cannot submit score without valid name");
      return false;
    }

    const { error } = await supabase
      .from('scores')
      .insert([{ 
        score,
        level,
        username: guestName,
        user_id: (await supabase.auth.getUser()).data.user?.id || 'guest'
      }]);

    if (error) {
      console.error("Score submission failed:", error);
      return false;
    }
    return true;
  },

  getUserBest: async (): Promise<number> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return 0;

    const { data, error } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(1);

    if (error || !data?.length) return 0;
    return data[0].score;
  }
}; 