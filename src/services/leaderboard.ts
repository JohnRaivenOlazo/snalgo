import { supabase } from '@/lib/supabase/client';
import { useSessionStore } from '@/stores/session';

export type LeaderboardEntry = {
  id: string;
  score: number;
  level: number;
  username: string;
  user_id: string;
  created_at: string;
  rank?: number;
};

export const LeaderboardService = {
  getTopScores: async (limit = 10): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('scores')
      .select('id, score, level, username, user_id, created_at')
      .order('score', { ascending: false });

    if (error) return [];

    // Add ranking and ensure unique users
    const rankedEntries = Array.from(
      data.reduce((map, entry) => {
        if (!map.has(entry.user_id) || entry.score > map.get(entry.user_id)!.score) {
          map.set(entry.user_id, entry);
        }
        return map;
      }, new Map<string, LeaderboardEntry>()).values()
    )
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return rankedEntries.slice(0, limit);
  },

  submitScore: async (score: number, level: number): Promise<'new_high' | 'submitted' | 'not_submitted'> => {
    const { guestName, hasValidName } = useSessionStore.getState();
    
    if (!hasValidName) {
      return 'not_submitted';
    }

    const userId = (await supabase.auth.getUser()).data.user?.id || 'guest';
    const currentBest = await LeaderboardService.getUserBest();

    if (score <= currentBest) {
      return 'not_submitted';
    }

    const { error } = await supabase
      .from('scores')
      .insert([{ 
        score,
        level,
        username: guestName,
        user_id: userId
      }]);

    if (error) {
      return 'not_submitted';
    }
    
    return userId === 'guest' ? 'submitted' : 'new_high';
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