import type { DistrictDefinition } from '../../types/world.js';
import type { GameCondition } from '../../types/logic.js';
import { residential } from './residential.js';
import { market } from './market.js';

/** Реализованные и играбельные районы. */
const LIST: DistrictDefinition[] = [residential, market];

export const DISTRICTS: Record<string, DistrictDefinition> = Object.fromEntries(
  LIST.map((district) => [district.id, district])
);
export const DISTRICT_LIST = LIST;

export function getDistrict(id: string): DistrictDefinition | undefined {
  return DISTRICTS[id];
}

export interface PlannedDistrict {
  id: string;
  name: string;
  subtitle: string;
  unlock: GameCondition;
  unlockText: string;
}

/**
 * Районы, которые уже есть в мире как направление: игрок видит дороги и выезды,
 * чувствует масштаб города, но попасть туда пока нельзя.
 */
export const PLANNED_DISTRICTS: PlannedDistrict[] = [
  {
    id: 'station',
    name: 'Вокзал',
    subtitle: 'Круглосуточная толпа и круглосуточные проблемы',
    unlock: { minLevel: 6 },
    unlockText: 'Нужен 6-й уровень'
  },
  {
    id: 'industrial',
    name: 'Промзона',
    subtitle: 'Металл, склады, ночные смены',
    unlock: { minLevel: 9, minReputation: { track: 'street', value: 20 } },
    unlockText: '9-й уровень и уличная репутация 20'
  },
  {
    id: 'oldtown',
    name: 'Старый город',
    subtitle: 'Дворы-колодцы и вещи с историей',
    unlock: { minLevel: 12 },
    unlockText: 'Нужен 12-й уровень'
  },
  {
    id: 'center',
    name: 'Центр',
    subtitle: 'Витрины, камеры, дорогая еда',
    unlock: { minLevel: 15, minTotalWealth: 150000 },
    unlockText: '15-й уровень и капитал 150 000 ₽'
  },
  {
    id: 'business',
    name: 'Деловой район',
    subtitle: 'Стекло, охрана, чужие деньги',
    unlock: { minLevel: 20, minReputation: { track: 'business', value: 35 } },
    unlockText: '20-й уровень и деловая репутация 35'
  },
  {
    id: 'elite',
    name: 'Элитный район',
    subtitle: 'Тишина, которая стоит дорого',
    unlock: { minLevel: 26, minTotalWealth: 5000000 },
    unlockText: '26-й уровень и капитал 5 000 000 ₽'
  }
];

export const ALL_DISTRICT_NAMES: Record<string, string> = {
  ...Object.fromEntries(LIST.map((district) => [district.id, district.name])),
  ...Object.fromEntries(PLANNED_DISTRICTS.map((district) => [district.id, district.name]))
};
