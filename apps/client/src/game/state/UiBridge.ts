import type { RandomEventDefinition } from '../../types/events.js';
import type { NpcDefinition } from '../../types/npc.js';
import type { SleepQuality } from '../systems/SleepSystem.js';

/** Контракт между игровой логикой и интерфейсом. Системы не знают про DOM. */
export interface UiBridge {
  toast(text: string, tone?: 'good' | 'bad' | 'neutral' | 'weird'): void;
  message(title: string, text: string): Promise<void>;
  confirm(title: string, text: string, okLabel?: string): Promise<boolean>;
  showEvent(event: RandomEventDefinition): void;
  showDialogue(npc: NpcDefinition): void;
  showShop(shopId: string): void;
  showJobs(districtId: string): void;
  showSleep(spotId: string, quality: SleepQuality): void;
  showInventory(): void;
  showPhone(app?: string): void;
  showPause(): void;
  showLoot(results: { name: string; count: number; money?: number; rarity?: string }[]): void;
  refresh(): void;
}

/** Заглушка на случай, если UI ещё не подключился: игра не должна падать. */
export const NullUi: UiBridge = {
  toast: () => undefined,
  message: async () => undefined,
  confirm: async () => false,
  showEvent: () => undefined,
  showDialogue: () => undefined,
  showShop: () => undefined,
  showJobs: () => undefined,
  showSleep: () => undefined,
  showInventory: () => undefined,
  showPhone: () => undefined,
  showPause: () => undefined,
  showLoot: () => undefined,
  refresh: () => undefined
};
