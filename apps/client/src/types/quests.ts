import type { GameCondition, GameEffect } from './logic.js';

export type QuestState = 'locked' | 'active' | 'completed' | 'failed';

export type ObjectiveType =
  | 'collect'
  | 'money'
  | 'talk'
  | 'visit'
  | 'interact'
  | 'job'
  | 'sleep'
  | 'flag'
  | 'eat'
  | 'custom';

export interface QuestObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  /** id предмета / NPC / района / интерактивного объекта / флага. */
  target?: string;
  count: number;
  optional?: boolean;
  hidden?: boolean;
}

export interface QuestDefinition {
  id: string;
  title: string;
  summary: string;
  giver?: string;
  kind: 'main' | 'side' | 'hidden' | 'repeatable';
  /** Автостарт, когда условия выполнены. */
  autoStart?: boolean;
  conditions?: GameCondition;
  objectives: QuestObjective[];
  rewards?: GameEffect;
  onStart?: GameEffect;
  nextQuest?: string;
  /** Скрытые квесты не показываются в журнале до завершения. */
  hidden?: boolean;
}

export interface QuestProgress {
  id: string;
  state: QuestState;
  progress: Record<string, number>;
  startedDay?: number;
  completedDay?: number;
}
