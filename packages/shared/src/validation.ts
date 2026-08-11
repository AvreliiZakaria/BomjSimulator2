import type { ScoreSubmission } from './api.js';

/**
 * Античит-эвристики. Сервер не доверяет числу, присланному клиентом:
 * ограничиваем достижимый капитал темпом игры, а остальные метрики — здравым смыслом.
 */
export const AntiCheatLimits = {
  /** Максимум рублей за один игровой день при идеальной игре. */
  maxWealthPerDay: 250_000,
  /** Стартовая подушка, чтобы день 1 не считался читом. */
  wealthBaseline: 5_000,
  maxReputation: 1_000,
  maxLevel: 100,
  maxCollections: 500,
  /** Минут игрового времени в сутках. */
  minutesPerDay: 24 * 60,
  /** Разумный минимум игрового времени на один день прогресса. */
  minMinutesPerDay: 180
} as const;

export interface ValidationResult {
  ok: boolean;
  suspicious: boolean;
  reason?: string;
  /** Значения, обрезанные до допустимых. */
  sanitized: Omit<ScoreSubmission, 'playerId' | 'token'>;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

export function validateScore(input: ScoreSubmission): ValidationResult {
  const days = Math.floor(clamp(input.days, 1, 100_000));
  const playedMinutes = clamp(input.playedMinutes, 0, days * AntiCheatLimits.minutesPerDay * 2);
  const wealthCeiling = AntiCheatLimits.wealthBaseline + days * AntiCheatLimits.maxWealthPerDay;

  const sanitized = {
    wealth: Math.floor(clamp(input.wealth, 0, wealthCeiling)),
    reputation: Math.floor(clamp(input.reputation, -AntiCheatLimits.maxReputation, AntiCheatLimits.maxReputation)),
    days,
    collections: Math.floor(clamp(input.collections, 0, AntiCheatLimits.maxCollections)),
    level: Math.floor(clamp(input.level, 1, AntiCheatLimits.maxLevel)),
    playedMinutes: Math.floor(playedMinutes)
  };

  let suspicious = false;
  let reason: string | undefined;

  if (input.wealth > wealthCeiling) {
    suspicious = true;
    reason = 'Капитал превышает достижимый за прожитые дни.';
  } else if (playedMinutes < days * AntiCheatLimits.minMinutesPerDay) {
    suspicious = true;
    reason = 'Слишком мало игрового времени на количество дней.';
  } else if (input.level > 1 + days * 3) {
    suspicious = true;
    reason = 'Уровень растёт быстрее допустимого.';
  }

  return { ok: true, suspicious, reason, sanitized };
}
