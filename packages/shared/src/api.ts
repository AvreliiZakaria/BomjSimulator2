/** Контракты HTTP API между клиентом и сервером рейтингов. */

export const API_VERSION = 1;
export const DEFAULT_SERVER_URL = 'http://localhost:8787';

export const ApiRoutes = {
  health: '/api/health',
  session: '/api/session',
  profile: '/api/profile',
  score: '/api/score',
  leaderboard: '/api/leaderboard'
} as const;

export interface SessionRequest {
  /** Локально сгенерированный id. Сервер принимает его или выдаёт новый. */
  playerId?: string;
  nickname: string;
}

export interface SessionResponse {
  playerId: string;
  nickname: string;
  /** Секрет, которым подписываются последующие запросы этого игрока. */
  token: string;
  createdAt: number;
}

export interface ProfileRequest {
  playerId: string;
  token: string;
  nickname: string;
}

export interface ScoreSubmission {
  playerId: string;
  token: string;
  /** Наличные + банк. */
  wealth: number;
  reputation: number;
  days: number;
  collections: number;
  level: number;
  /** Игровое время в минутах, прожитое персонажем. Нужно для валидации темпа. */
  playedMinutes: number;
}

export interface ScoreResponse {
  accepted: boolean;
  /** Причина отклонения или пометки, человекочитаемая. */
  reason?: string;
  ranks: Partial<Record<LeaderboardCategory, number>>;
}

export interface ApiError {
  error: string;
}

import type { LeaderboardCategory } from './leaderboard.js';
