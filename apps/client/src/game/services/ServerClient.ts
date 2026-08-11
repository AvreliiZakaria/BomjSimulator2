import { GameConfig } from '../config/GameConfig.js';
import { SaveService } from './SaveService.js';
import {
  ApiRoutes,
  type LeaderboardCategory,
  type LeaderboardResponse,
  type ScoreResponse,
  type SessionResponse
} from '@nul/shared';

/**
 * Клиент сервера рейтингов. Игра полностью играбельна без него:
 * любая ошибка сети просто отключает глобальные таблицы до следующей попытки.
 */
class ServerClientImpl {
  private online: boolean | null = null;
  private lastSubmitDay = 0;

  get baseUrl(): string {
    return SaveService.identity().serverUrl ?? GameConfig.server.url;
  }

  get isOnline(): boolean {
    return this.online === true;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T | null> {
    if (!GameConfig.server.enabled) return null;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) {
        this.online = false;
        return null;
      }
      this.online = true;
      return (await response.json()) as T;
    } catch {
      this.online = false;
      return null;
    }
  }

  async ensureSession(nickname: string): Promise<boolean> {
    const identity = SaveService.identity();
    const result = await this.request<SessionResponse>(ApiRoutes.session, {
      method: 'POST',
      body: JSON.stringify({ playerId: identity.playerId, nickname })
    });
    if (!result) return false;
    SaveService.updateIdentity({ playerId: result.playerId, nickname: result.nickname, token: result.token });
    return true;
  }

  async submitScore(payload: {
    wealth: number;
    reputation: number;
    days: number;
    collections: number;
    level: number;
    playedMinutes: number;
    nickname: string;
  }): Promise<ScoreResponse | null> {
    if (payload.days - this.lastSubmitDay < GameConfig.server.submitEveryDays) return null;
    const identity = SaveService.identity();
    if (!identity.token) {
      const ok = await this.ensureSession(payload.nickname);
      if (!ok) return null;
    }
    const current = SaveService.identity();
    this.lastSubmitDay = payload.days;
    return this.request<ScoreResponse>(ApiRoutes.score, {
      method: 'POST',
      body: JSON.stringify({
        playerId: current.playerId,
        token: current.token,
        wealth: Math.round(payload.wealth),
        reputation: Math.round(payload.reputation),
        days: payload.days,
        collections: payload.collections,
        level: payload.level,
        playedMinutes: Math.round(payload.playedMinutes)
      })
    });
  }

  async leaderboard(category: LeaderboardCategory): Promise<LeaderboardResponse | null> {
    const identity = SaveService.identity();
    const params = new URLSearchParams({ category, playerId: identity.playerId });
    return this.request<LeaderboardResponse>(`${ApiRoutes.leaderboard}?${params.toString()}`);
  }
}

export const ServerClient = new ServerClientImpl();
