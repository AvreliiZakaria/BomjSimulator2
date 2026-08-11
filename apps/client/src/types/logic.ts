import type { StatusEffectId } from './items.js';
import type { TimePeriod } from './time.js';

export type SurvivalStat = 'health' | 'hunger' | 'warmth' | 'hygiene' | 'sanity' | 'energy';

export type ReputationTrack = 'street' | 'city' | 'business' | 'law';

export const REPUTATION_LABELS: Record<ReputationTrack, string> = {
  street: 'Улица',
  city: 'Город',
  business: 'Бизнес',
  law: 'Закон'
};

export type SkillId = 'survival' | 'trade' | 'charisma' | 'work' | 'luck';

export const SKILL_LABELS: Record<SkillId, string> = {
  survival: 'Выживание',
  trade: 'Торговля',
  charisma: 'Харизма',
  work: 'Работа',
  luck: 'Удача'
};

/** Универсальные условия: используются диалогами, квестами, событиями, разблокировкой районов. */
export interface GameCondition {
  minLevel?: number;
  maxLevel?: number;
  minMoney?: number;
  maxMoney?: number;
  minTotalWealth?: number;
  hasItem?: { id: string; count?: number };
  missingItem?: string;
  flag?: string;
  notFlag?: string;
  flagAtLeast?: { key: string; value: number };
  minRelationship?: { npcId: string; value: number };
  maxRelationship?: { npcId: string; value: number };
  minReputation?: { track: ReputationTrack; value: number };
  periods?: TimePeriod[];
  minDay?: number;
  maxDay?: number;
  minStat?: { stat: SurvivalStat; value: number };
  maxStat?: { stat: SurvivalStat; value: number };
  questCompleted?: string;
  questActive?: string;
  questNotStarted?: string;
  district?: string;
  minSkill?: { skill: SkillId; value: number };
  chance?: number;
}

/** Универсальные последствия. Всё, что игра умеет менять, описывается этим типом. */
export interface GameEffect {
  money?: number;
  bank?: number;
  xp?: number;
  giveItems?: { id: string; count?: number }[];
  takeItems?: { id: string; count?: number }[];
  stats?: Partial<Record<SurvivalStat, number>>;
  status?: StatusEffectId[];
  cureStatus?: StatusEffectId[];
  setFlag?: { key: string; value: number | boolean }[];
  addFlag?: { key: string; value: number }[];
  relationship?: { npcId: string; delta: number }[];
  reputation?: { track: ReputationTrack; delta: number }[];
  skillXp?: { skill: SkillId; amount: number }[];
  startQuest?: string;
  completeQuest?: string;
  failQuest?: string;
  progressObjective?: { questId: string; objectiveId: string; amount?: number }[];
  unlockDistrict?: string;
  unlockAchievement?: string;
  addCollection?: string;
  advanceMinutes?: number;
  message?: string;
  toast?: { text: string; tone?: 'good' | 'bad' | 'neutral' | 'weird' };
}
