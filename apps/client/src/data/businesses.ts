import type { GameCondition } from '../types/logic.js';

export interface BusinessType {
  id: string;
  name: string;
  description: string;
  tier: number;
  price: number;
  /** Сколько единиц товара продаётся в день при полном складе и без сотрудников. */
  baseDemand: number;
  maxStock: number;
  employeeSlots: number;
  /** Ежедневные фиксированные расходы. */
  upkeep: number;
  district: string;
  conditions?: GameCondition;
  upgradesTo?: string;
}

const LIST: BusinessType[] = [
  {
    id: 'cart',
    name: 'Тележка',
    description: 'Скупаешь дёшево, катаешь по району, продаёшь дороже.',
    tier: 1,
    price: 6000,
    baseDemand: 12,
    maxStock: 40,
    employeeSlots: 0,
    upkeep: 60,
    district: 'residential',
    conditions: { minLevel: 5, minReputation: { track: 'business', value: 5 } },
    upgradesTo: 'stall'
  },
  {
    id: 'stall',
    name: 'Ларёк',
    description: 'Точка на рынке. Уже не бегаешь, уже стоишь.',
    tier: 2,
    price: 45000,
    baseDemand: 30,
    maxStock: 120,
    employeeSlots: 1,
    upkeep: 350,
    district: 'market',
    conditions: { minLevel: 9 },
    upgradesTo: 'kiosk'
  },
  {
    id: 'kiosk',
    name: 'Киоск',
    description: 'Стекло, свет, вывеска. Люди заходят сами.',
    tier: 3,
    price: 160000,
    baseDemand: 65,
    maxStock: 260,
    employeeSlots: 2,
    upkeep: 1100,
    district: 'market',
    conditions: { minLevel: 13 },
    upgradesTo: 'shop'
  },
  {
    id: 'shop',
    name: 'Магазин',
    description: 'Настоящее помещение, настоящая выручка, настоящие проблемы.',
    tier: 4,
    price: 700000,
    baseDemand: 140,
    maxStock: 600,
    employeeSlots: 4,
    upkeep: 4200,
    district: 'center',
    conditions: { minLevel: 18 },
    upgradesTo: 'chain'
  },
  {
    id: 'chain',
    name: 'Сеть',
    description: 'Несколько точек. Ты уже не продавец, ты владелец.',
    tier: 5,
    price: 3200000,
    baseDemand: 420,
    maxStock: 2000,
    employeeSlots: 10,
    upkeep: 18000,
    district: 'business',
    conditions: { minLevel: 24 },
    upgradesTo: 'company'
  },
  {
    id: 'company',
    name: 'Компания',
    description: 'Офис в деловом районе. Из окна виден твой первый двор.',
    tier: 6,
    price: 15000000,
    baseDemand: 1400,
    maxStock: 8000,
    employeeSlots: 30,
    upkeep: 90000,
    district: 'business',
    conditions: { minLevel: 30 }
  }
];

export const BUSINESS_TYPES: Record<string, BusinessType> = Object.fromEntries(
  LIST.map((entry) => [entry.id, entry])
);
export const BUSINESS_TYPE_LIST = LIST;
