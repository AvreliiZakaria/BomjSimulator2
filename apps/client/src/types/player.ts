import type { EquipSlot, InventoryStack, StatusEffectId } from './items.js';
import type { ReputationTrack, SkillId, SurvivalStat } from './logic.js';
import type { QuestProgress } from './quests.js';

export interface Appearance {
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'cap' | 'hood' | 'bald' | 'beanie';
  top: string;
  bottom: string;
  shoes: string;
  preset?: string;
}

export type SurvivalStats = Record<SurvivalStat, number>;

export interface StatusEffectInstance {
  id: StatusEffectId;
  /** Оставшиеся игровые минуты. */
  minutesLeft: number;
}

export interface HousingState {
  /** id из data/housing.ts, null — улица. */
  id: string | null;
  upgrades: string[];
  storage: InventoryStack[];
  /** День, до которого оплачено. */
  paidUntilDay: number;
}

export interface BusinessState {
  id: string;
  typeId: string;
  name: string;
  level: number;
  stock: number;
  employees: number;
  /** Накопленная невыплаченная выручка. */
  pending: number;
  openedDay: number;
  lastTickDay: number;
}

export interface PlayerSnapshot {
  nickname: string;
  appearance: Appearance;
  survival: SurvivalStats;
  statuses: StatusEffectInstance[];
  cash: number;
  bank: number;
  bankUnlocked: boolean;
  xp: number;
  level: number;
  skills: Record<SkillId, number>;
  skillXp: Record<SkillId, number>;
  inventory: InventoryStack[];
  equipment: Record<EquipSlot, string | null>;
  quests: Record<string, QuestProgress>;
  flags: Record<string, number>;
  relationships: Record<string, number>;
  reputation: Record<ReputationTrack, number>;
  unlockedDistricts: string[];
  district: string;
  position: { x: number; y: number };
  housing: HousingState;
  businesses: BusinessState[];
  achievements: string[];
  collections: string[];
  day: number;
  minutes: number;
  playedMinutes: number;
  nightsAfterThree: number;
  searchedToday: string[];
  jobCooldowns: Record<string, number>;
  eventCooldowns: Record<string, number>;
  shopDay: number;
  shopStock: Record<string, InventoryStack[]>;
}
