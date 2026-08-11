import type { SurvivalStats, StatusEffectInstance } from '../../types/player.js';
import type { TimeSnapshot, TimePeriod } from '../../types/time.js';
import type { InputMode } from './InputStateManager.js';

export interface ToastPayload {
  text: string;
  tone?: 'good' | 'bad' | 'neutral' | 'weird';
  icon?: string;
}

export interface GameEventMap {
  'money:changed': { cash: number; bank: number; delta: number; reason: string };
  'stats:changed': SurvivalStats;
  'status:changed': StatusEffectInstance[];
  'inventory:changed': { weight: number; capacity: number };
  'equipment:changed': void;
  'time:tick': TimeSnapshot;
  'time:hour': TimeSnapshot;
  'time:day': TimeSnapshot;
  'time:period': { period: TimePeriod; previous: TimePeriod; snapshot: TimeSnapshot };
  'xp:changed': { xp: number; level: number; toNext: number; progress: number };
  'level:up': { level: number };
  'quest:updated': { questId: string };
  'objective:hint': { text: string };
  'district:changed': { districtId: string; name: string };
  'interaction:target': { label: string; kind: string } | null;
  'toast': ToastPayload;
  'input:mode': { mode: InputMode; previous: InputMode };
  'game:over': { reason: string };
  'achievement': { id: string; name: string };
  'save:written': { at: number };
  'ui:refresh': void;
}

type Handler<T> = (payload: T) => void;

/**
 * Маленькая типизированная шина событий. HUD и UI ничего не считают сами —
 * они только слушают то, что публикуют системы.
 */
export class EventBus {
  private handlers = new Map<keyof GameEventMap, Set<Handler<never>>>();

  on<K extends keyof GameEventMap>(event: K, handler: Handler<GameEventMap[K]>): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as Handler<never>);
    return () => this.off(event, handler);
  }

  once<K extends keyof GameEventMap>(event: K, handler: Handler<GameEventMap[K]>): void {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });
  }

  off<K extends keyof GameEventMap>(event: K, handler: Handler<GameEventMap[K]>): void {
    this.handlers.get(event)?.delete(handler as Handler<never>);
  }

  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of [...set]) {
      try {
        (handler as Handler<GameEventMap[K]>)(payload);
      } catch (error) {
        console.error(`[EventBus] обработчик ${String(event)} упал`, error);
      }
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

/** Глобальная шина: живёт дольше сцен, поэтому переживает GameScene -> MainMenu -> GameScene. */
export const bus = new EventBus();
