// LocalStorage 기반 랭킹/하이스코어 관리
export interface GameStats {
  score: number;
  level: number;
  lines: number;
  combo: number;
  playTime: number;
  difficulty: string;
}

export interface RankingEntry {
  name: string;
  score: number;
  date: string;
}

export type Rankings = Record<string, RankingEntry[]>;

const HIGHSCORE_KEY = 'tetris_highscores';
const RANKING_KEY = 'tetris_rankings';

export function loadHighscores(): Record<string, number> {
  try {
    const data = localStorage.getItem(HIGHSCORE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveHighscore(score: number, difficulty: string): void {
  const data = loadHighscores();
  if (!data[difficulty] || score > data[difficulty]) {
    data[difficulty] = score;
    localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(data));
  }
}

export function loadRankings(): Rankings {
  try {
    const data = localStorage.getItem(RANKING_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveRanking(name: string, score: number, difficulty: string): void {
  const rankings = loadRankings();
  if (!rankings[difficulty]) {
    rankings[difficulty] = [];
  }
  
  rankings[difficulty].push({
    name,
    score,
    date: new Date().toISOString().split('T')[0]
  });
  
  // 점수 내림차순 정렬 후 상위 10명만 유지
  rankings[difficulty].sort((a, b) => b.score - a.score);
  rankings[difficulty] = rankings[difficulty].slice(0, 10);
  
  localStorage.setItem(RANKING_KEY, JSON.stringify(rankings));
}

export function getTopRankers(count: number = 3): Array<RankingEntry & { difficulty: string }> {
  const rankings = loadRankings();
  const allEntries: Array<RankingEntry & { difficulty: string }> = [];
  
  for (const [difficulty, entries] of Object.entries(rankings)) {
    for (const entry of entries) {
      allEntries.push({ ...entry, difficulty });
    }
  }
  
  return allEntries.sort((a, b) => b.score - a.score).slice(0, count);
}
