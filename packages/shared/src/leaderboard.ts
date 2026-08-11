export type LeaderboardCategory = 'wealth' | 'reputation' | 'days' | 'collections' | 'season';

export const LEADERBOARD_CATEGORIES: LeaderboardCategory[] = [
  'wealth',
  'reputation',
  'days',
  'collections',
  'season'
];

export const LEADERBOARD_LABELS: Record<LeaderboardCategory, string> = {
  wealth: 'Богатство',
  reputation: 'Репутация',
  days: 'Дни',
  collections: 'Коллекции',
  season: 'Сезон'
};

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  value: number;
  updatedAt: number;
  /** Помечен античитом: показывается, но с флагом. */
  suspicious?: boolean;
}

export interface LeaderboardResponse {
  category: LeaderboardCategory;
  season: number;
  top: LeaderboardEntry[];
  self?: LeaderboardEntry;
  /** Сколько не хватает до следующего места. */
  distanceToNext?: number;
  total: number;
}
