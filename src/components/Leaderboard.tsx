import { useEffect, useState } from 'react';
import { LeaderboardService } from '@/services/leaderboard';
import { LeaderboardEntry } from '@/services/leaderboard';

export const Leaderboard = () => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const loadScores = async () => {
      const topScores = await LeaderboardService.getTopScores(10);
      setScores(topScores);
    };
    loadScores();
  }, []);

  return (
    <div className="leaderboard">
      <h3>Top Scores</h3>
      <div className="scores-list">
        {scores.map((entry, index) => (
          <div key={entry.id} className="score-entry">
            <span className="rank">#{index + 1}</span>
            <span className="name">{entry.username}</span>
            <span className="score">{entry.score.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 