export type TimePeriod = 'MORNING' | 'DAY' | 'EVENING' | 'NIGHT' | 'LATE_NIGHT';

export const PERIOD_LABELS: Record<TimePeriod, string> = {
  MORNING: 'Утро',
  DAY: 'День',
  EVENING: 'Вечер',
  NIGHT: 'Ночь',
  LATE_NIGHT: 'После трёх'
};

export interface TimeSnapshot {
  day: number;
  /** Минуты от полуночи, 0..1439. */
  minutes: number;
  hour: number;
  minute: number;
  period: TimePeriod;
  /** Строка вида «04:07». */
  clock: string;
  /** 0..1, где 0 — глубокая ночь, 1 — полдень. */
  daylight: number;
  isLateNight: boolean;
}
