import type { GameCondition, GameEffect } from './logic.js';
import type { Appearance } from './player.js';

export interface DialogueChoice {
  text: string;
  conditions?: GameCondition;
  /** Показывать ли вариант, если условия не выполнены (серым). */
  showLocked?: boolean;
  lockedHint?: string;
  effects?: GameEffect;
  /** Следующий узел или null — закрыть диалог. */
  next?: string | null;
  /** Открыть магазин/работу/сон прямо из диалога. */
  openShop?: string;
  openJobs?: boolean;
}

export interface DialogueNode {
  id: string;
  /** Реплика NPC. Держим коротко: никаких стен текста. */
  text: string;
  conditions?: GameCondition;
  onEnter?: GameEffect;
  choices: DialogueChoice[];
}

export interface NpcDefinition {
  id: string;
  name: string;
  title: string;
  district: string;
  appearance: Appearance;
  personality: string;
  /** Порядок важен: берём первый узел, чьи условия выполнены. */
  dialogue: DialogueNode[];
  shopId?: string;
  services?: ('shop' | 'jobs' | 'bank' | 'sleep' | 'business')[];
  /** Может ли NPC ходить по маршруту. */
  wanders?: boolean;
  /** Часы, когда NPC на месте. */
  activeHours?: [number, number];
  key?: boolean;
}

export interface ShopOffer {
  itemId: string;
  /** Множитель к базовой цене. */
  priceMul?: number;
  stock?: number;
  /** Шанс появления в ассортименте дня, 0..1. */
  chance?: number;
  conditions?: GameCondition;
}

export interface ShopDefinition {
  id: string;
  name: string;
  keeperNpcId?: string;
  /** Множитель цены покупки игроком. */
  buyMul: number;
  /** Множитель цены выкупа у игрока. */
  sellMul: number;
  /** Какие категории магазин вообще выкупает. */
  buysCategories: string[];
  openHours: [number, number];
  offers: ShopOffer[];
  /** Сколько случайных позиций из offers показываем за день. */
  dailySlots?: number;
}

export interface JobDefinition {
  id: string;
  name: string;
  description: string;
  district: string;
  /** Игровых минут на смену. */
  durationMinutes: number;
  payMin: number;
  payMax: number;
  /** Затраты на смену. */
  cost: {
    energy?: number;
    hunger?: number;
    hygiene?: number;
    warmth?: number;
    sanity?: number;
    health?: number;
  };
  conditions?: GameCondition;
  lockedText?: string;
  /** Раз в сколько игровых дней можно повторять. */
  cooldownDays?: number;
  reputation?: { track: string; delta: number }[];
  skill?: string;
  xp: number;
  requiresItem?: string;
  workHours?: [number, number];
}
