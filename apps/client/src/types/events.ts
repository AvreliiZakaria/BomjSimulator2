import type { GameCondition, GameEffect } from './logic.js';

export interface EventChoice {
  text: string;
  conditions?: GameCondition;
  lockedHint?: string;
  effects?: GameEffect;
  /** Текст, который показываем после выбора. */
  result: string;
  /** Вероятность «плохого» исхода, 0..1. */
  riskChance?: number;
  riskEffects?: GameEffect;
  riskResult?: string;
}

export interface RandomEventDefinition {
  id: string;
  title: string;
  text: string;
  /** Вес в общем пуле. */
  weight: number;
  districts?: string[];
  conditions?: GameCondition;
  choices: EventChoice[];
  once?: boolean;
  cooldownDays?: number;
  /** Странные события после 03:00. */
  weird?: boolean;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  hidden?: boolean;
  /** Проверяется системой достижений по состоянию игрока. */
  check: 'firstEarn' | 'money10k' | 'money100k' | 'money1m' | 'firstRoom' | 'firstBusiness' | 'nights10' | 'flag' | 'collection' | 'level10';
  value?: number;
  flag?: string;
}

export interface CollectionDefinition {
  id: string;
  name: string;
  category: 'badges' | 'weird' | 'tapes' | 'photos' | 'finds';
  description: string;
}
