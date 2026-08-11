import type { GameCondition } from './logic.js';

export interface Vec2 {
  x: number;
  y: number;
}

export interface RectDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type BuildingStyle = 'panel' | 'brick' | 'old' | 'glass' | 'industrial' | 'shop';

export interface BuildingDef extends RectDef {
  id: string;
  style: BuildingStyle;
  /** Визуальная высота фасада в пикселях (3/4 перспектива). */
  height: number;
  name?: string;
  /** Оттенок стен, если нужен нестандартный. */
  wallColor?: number;
  roofColor?: number;
  windowRows?: number;
  windowCols?: number;
  /** Светятся ли окна ночью. */
  lit?: boolean;
}

export type PropKind =
  | 'tree'
  | 'bush'
  | 'bench'
  | 'lamp'
  | 'bin'
  | 'dumpster'
  | 'fence'
  | 'car'
  | 'busStop'
  | 'sign'
  | 'cardboard'
  | 'kiosk'
  | 'planter'
  | 'barrier'
  | 'pipe'
  | 'puddle'
  | 'crate'
  | 'pigeon'
  | 'grate'
  | 'pole';

export interface PropDef {
  kind: PropKind;
  x: number;
  y: number;
  /** Поворот для заборов/труб: 'h' | 'v'. */
  dir?: 'h' | 'v';
  /** Длина для протяжённых объектов. */
  length?: number;
  variant?: number;
  collide?: boolean;
  tint?: number;
}

export interface RoadDef extends RectDef {
  id: string;
  orientation: 'h' | 'v';
  lanes: number;
  sidewalk?: boolean;
}

export interface RoadNodeDef {
  id: string;
  x: number;
  y: number;
  next: string[];
  spawn?: boolean;
  despawn?: boolean;
}

export type InteractionKind =
  | 'dumpster'
  | 'bin'
  | 'bench'
  | 'sleep'
  | 'door'
  | 'shop'
  | 'job'
  | 'stash'
  | 'transit'
  | 'sign'
  | 'atm'
  | 'casino'
  | 'home'
  | 'pickup'
  | 'business';

export interface InteractableDef {
  id: string;
  kind: InteractionKind;
  x: number;
  y: number;
  label: string;
  /** Радиус срабатывания, по умолчанию из конфига. */
  radius?: number;
  lootTable?: string;
  shopId?: string;
  jobId?: string;
  /** Для мест сна. */
  sleepSpotId?: string;
  targetDistrict?: string;
  conditions?: GameCondition;
  /** Сообщение, если условия не выполнены. */
  lockedText?: string;
  data?: Record<string, string | number | boolean>;
}

export interface NpcSpawnDef {
  npcId: string;
  x: number;
  y: number;
  /** Точки патрулирования; если пусто — NPC стоит. */
  route?: Vec2[];
}

export interface DistrictDefinition {
  id: string;
  name: string;
  subtitle: string;
  bounds: RectDef;
  /** Условия открытия района. */
  unlock?: GameCondition;
  unlockText?: string;
  unlockedFromStart?: boolean;
  groundColor: number;
  grassColor: number;
  spawn: Vec2;
  buildings: BuildingDef[];
  roads: RoadDef[];
  roadNodes: RoadNodeDef[];
  props: PropDef[];
  interactables: InteractableDef[];
  npcs: NpcSpawnDef[];
  /** Плотность трафика днём, 0..1. */
  trafficDensity: number;
  /** Плотность прохожих днём, 0..1. */
  crowdDensity: number;
}
