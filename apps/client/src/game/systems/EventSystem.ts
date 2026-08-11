import { GameConfig } from '../config/GameConfig.js';
import { chance, pickWeighted } from '../core/rng.js';
import { EVENT_LIST } from '../../data/events.js';
import { evaluateCondition } from './Conditions.js';
import { applyEffect } from './Effects.js';
import type { EventChoice, RandomEventDefinition } from '../../types/events.js';
import type { GameContext } from '../state/GameContext.js';

/**
 * Случайные события. Зависят от района, времени, показателей, репутации, предметов и флагов.
 * После 03:00 в пул подмешиваются «странные» события.
 */
export class EventSystem {
  private lastEventMinutes = -999;

  constructor(private readonly ctx: GameContext) {}

  /** Вызывается на каждый игровой час. */
  tick(): void {
    const time = this.ctx.time;
    if (time.totalPlayedMinutes - this.lastEventMinutes < GameConfig.events.minMinutesBetween) return;
    if (this.ctx.ui === undefined) return;

    const snapshot = time.snapshot;
    const baseChance = snapshot.isLateNight
      ? GameConfig.events.lateNightWeirdChance
      : GameConfig.events.chancePerHour;

    // Низкий рассудок притягивает странности.
    const sanityFactor = 1 + (100 - this.ctx.player.stat('sanity')) / 220;
    if (!chance(baseChance * sanityFactor)) return;

    const event = this.pick();
    if (!event) return;

    this.lastEventMinutes = time.totalPlayedMinutes;
    this.ctx.player.data.eventCooldowns[event.id] = snapshot.day + (event.cooldownDays ?? 1);
    if (event.once) this.ctx.player.setFlag(`event:${event.id}`, 1);
    this.ctx.ui.showEvent(event);
  }

  private pick(): RandomEventDefinition | null {
    const snapshot = this.ctx.time.snapshot;
    const district = this.ctx.player.data.district;

    const pool = EVENT_LIST.filter((event) => {
      if (event.districts && !event.districts.includes(district)) return false;
      if (event.once && this.ctx.player.hasFlag(`event:${event.id}`)) return false;
      if ((this.ctx.player.data.eventCooldowns[event.id] ?? 0) > snapshot.day) return false;
      if (event.weird && !snapshot.isLateNight) return false;
      return evaluateCondition(this.ctx, event.conditions);
    });

    if (!pool.length) return null;
    return pickWeighted(pool, (event) => (snapshot.isLateNight && event.weird ? event.weight * 2.2 : event.weight));
  }

  /** Игрок выбрал вариант в окне события. */
  resolve(event: RandomEventDefinition, choice: EventChoice): string {
    const risky = choice.riskChance !== undefined && chance(choice.riskChance);
    if (risky) {
      applyEffect(this.ctx, choice.riskEffects);
      this.ctx.save(true);
      return choice.riskResult ?? choice.result;
    }
    applyEffect(this.ctx, choice.effects);
    this.ctx.save(true);
    return choice.result;
  }

  /** Принудительный запуск конкретного события (сюжетные триггеры). */
  force(eventId: string): boolean {
    const event = EVENT_LIST.find((entry) => entry.id === eventId);
    if (!event) return false;
    this.ctx.ui.showEvent(event);
    return true;
  }
}
