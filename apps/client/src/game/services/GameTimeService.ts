import { GameConfig } from '../config/GameConfig.js';
import { bus } from '../core/EventBus.js';
import { InputState } from '../core/InputStateManager.js';
import { formatClock } from '../core/format.js';
import type { TimePeriod, TimeSnapshot } from '../../types/time.js';

/**
 * Игровое время. Считается от delta, а не от кадров: 30 и 60 FPS дают одинаковый темп.
 * Единственный владелец day/minutes — этот сервис, PlayerState только хранит их для сейва.
 */
export class GameTimeService {
  private day: number;
  private minutes: number;
  private accumulator = 0;
  private lastHour = -1;
  private period: TimePeriod;
  private playedMinutes: number;
  private paused = false;

  constructor(day = GameConfig.time.startDay, minutes = GameConfig.time.startMinutes, playedMinutes = 0) {
    this.day = day;
    this.minutes = minutes;
    this.playedMinutes = playedMinutes;
    this.period = GameTimeService.periodOf(minutes);
    this.lastHour = Math.floor(minutes / 60);
  }

  static periodOf(minutes: number): TimePeriod {
    const m = ((minutes % 1440) + 1440) % 1440;
    if (m >= 6 * 60 && m < 10 * 60) return 'MORNING';
    if (m >= 10 * 60 && m < 18 * 60) return 'DAY';
    if (m >= 18 * 60 && m < 22 * 60) return 'EVENING';
    if (m >= 22 * 60 || m < 3 * 60) return 'NIGHT';
    return 'LATE_NIGHT';
  }

  /** 0 — глубокая ночь, 1 — полдень. Плавная кривая, без скачков между кадрами. */
  static daylightOf(minutes: number): number {
    const m = ((minutes % 1440) + 1440) % 1440;
    const points: [number, number][] = [
      [0, 0.04],
      [4 * 60, 0.02],
      [5.5 * 60, 0.12],
      [7 * 60, 0.55],
      [9 * 60, 0.92],
      [13 * 60, 1],
      [17 * 60, 0.9],
      [19 * 60, 0.55],
      [20.5 * 60, 0.22],
      [22 * 60, 0.08],
      [24 * 60, 0.04]
    ];
    for (let i = 0; i < points.length - 1; i += 1) {
      const [x0, y0] = points[i]!;
      const [x1, y1] = points[i + 1]!;
      if (m >= x0 && m <= x1) {
        const t = x1 === x0 ? 0 : (m - x0) / (x1 - x0);
        const smooth = t * t * (3 - 2 * t);
        return y0 + (y1 - y0) * smooth;
      }
    }
    return 0.5;
  }

  get snapshot(): TimeSnapshot {
    const minutes = Math.floor(this.minutes);
    return {
      day: this.day,
      minutes,
      hour: Math.floor(minutes / 60),
      minute: minutes % 60,
      period: this.period,
      clock: formatClock(minutes),
      daylight: GameTimeService.daylightOf(minutes),
      isLateNight: this.period === 'LATE_NIGHT'
    };
  }

  get totalPlayedMinutes(): number {
    return this.playedMinutes;
  }

  setPaused(value: boolean): void {
    this.paused = value;
  }

  /** deltaMs приходит из Phaser update(). */
  update(deltaMs: number): void {
    if (this.paused || !InputState.timeFlows) return;
    const gameMinutes = (deltaMs / 1000) * GameConfig.time.minutesPerRealSecond;
    this.advance(gameMinutes, false);
  }

  /** Мгновенный проход времени: работа, сон, поиск в мусорке. */
  skip(minutes: number): void {
    this.advance(minutes, true);
  }

  private advance(gameMinutes: number, instant: boolean): void {
    if (gameMinutes <= 0) return;
    this.accumulator += gameMinutes;
    this.playedMinutes += gameMinutes;

    const previousPeriod = this.period;
    this.minutes += gameMinutes;

    let dayRolled = false;
    while (this.minutes >= 1440) {
      this.minutes -= 1440;
      this.day += 1;
      dayRolled = true;
    }

    this.period = GameTimeService.periodOf(this.minutes);
    const snapshot = this.snapshot;

    // tick публикуем не чаще, чем раз в игровую минуту, чтобы не спамить UI.
    if (instant || this.accumulator >= 1) {
      this.accumulator = 0;
      bus.emit('time:tick', snapshot);
    }

    if (snapshot.hour !== this.lastHour) {
      const hoursPassed = Math.max(1, Math.round(gameMinutes / 60));
      this.lastHour = snapshot.hour;
      for (let i = 0; i < Math.min(hoursPassed, 24); i += 1) bus.emit('time:hour', snapshot);
    }

    if (this.period !== previousPeriod) {
      bus.emit('time:period', { period: this.period, previous: previousPeriod, snapshot });
    }

    if (dayRolled) bus.emit('time:day', snapshot);
  }

  /** Сколько игровых минут до указанного часа. */
  minutesUntilHour(hour: number): number {
    const target = hour * 60;
    const now = this.minutes;
    return target > now ? target - now : 1440 - now + target;
  }

  restore(day: number, minutes: number, playedMinutes: number): void {
    this.day = day;
    this.minutes = minutes;
    this.playedMinutes = playedMinutes;
    this.period = GameTimeService.periodOf(minutes);
    this.lastHour = Math.floor(minutes / 60);
  }
}
