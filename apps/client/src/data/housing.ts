import type { GameCondition } from '../types/logic.js';
import type { SleepQuality } from '../game/systems/SleepSystem.js';

export interface HousingUpgrade {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Прибавка к качеству сна. */
  sleepBonus?: number;
  storageBonus?: number;
  sanityPerDay?: number;
  /** Защита наличных дома (сейф). */
  safe?: boolean;
  requiresTier?: number;
}

export interface HousingDefinition {
  id: string;
  name: string;
  description: string;
  tier: number;
  quality: SleepQuality;
  district: string;
  /** Аренда за игровой день. Ноль — жильё в собственности. */
  rentPerDay: number;
  buyPrice?: number;
  /** Килограммы хранения. */
  storage: number;
  conditions?: GameCondition;
  lockedText?: string;
}

const LIST: HousingDefinition[] = [
  {
    id: 'tent',
    name: 'Палатка',
    description: 'Своя крыша. Тонкая, но своя.',
    tier: 1,
    quality: 'tent',
    district: 'residential',
    rentPerDay: 0,
    buyPrice: 1200,
    storage: 8
  },
  {
    id: 'garage',
    name: 'Гараж',
    description: 'Холодный бетон, зато замок и стены.',
    tier: 2,
    quality: 'garage',
    district: 'residential',
    rentPerDay: 180,
    buyPrice: 45000,
    storage: 40,
    conditions: { minLevel: 3 },
    lockedText: 'Хозяин сдаёт только тем, кого хоть кто-то знает. Нужен 3-й уровень.'
  },
  {
    id: 'basement',
    name: 'Подвал',
    description: 'Тепло от труб, шум от труб. Размен честный.',
    tier: 3,
    quality: 'basement',
    district: 'residential',
    rentPerDay: 320,
    storage: 55,
    conditions: { minLevel: 5, minReputation: { track: 'street', value: 10 } }
  },
  {
    id: 'room',
    name: 'Комната',
    description: 'Кровать, окно, дверь с ключом. Первая настоящая победа.',
    tier: 4,
    quality: 'room',
    district: 'residential',
    rentPerDay: 850,
    buyPrice: 320000,
    storage: 80,
    conditions: { minLevel: 7 }
  },
  {
    id: 'flat',
    name: 'Квартира',
    description: 'Отдельная кухня. Ты бы год назад не поверил.',
    tier: 5,
    quality: 'flat',
    district: 'residential',
    rentPerDay: 2200,
    buyPrice: 1400000,
    storage: 140,
    conditions: { minLevel: 12 }
  },
  {
    id: 'goodFlat',
    name: 'Хорошая квартира',
    description: 'Ремонт, лифт, консьерж, который здоровается.',
    tier: 6,
    quality: 'goodFlat',
    district: 'center',
    rentPerDay: 6500,
    buyPrice: 5200000,
    storage: 220,
    conditions: { minLevel: 18, minTotalWealth: 1500000 }
  },
  {
    id: 'house',
    name: 'Дом',
    description: 'Двор, забор, тишина. Ту самую тишину ты когда-то боялся.',
    tier: 7,
    quality: 'house',
    district: 'elite',
    rentPerDay: 0,
    buyPrice: 14000000,
    storage: 400,
    conditions: { minLevel: 24 }
  },
  {
    id: 'penthouse',
    name: 'Пентхаус',
    description: 'Отсюда виден весь город. Включая двор, где ты начинал.',
    tier: 8,
    quality: 'penthouse',
    district: 'elite',
    rentPerDay: 0,
    buyPrice: 42000000,
    storage: 600,
    conditions: { minLevel: 30 }
  }
];

export const HOUSING: Record<string, HousingDefinition> = Object.fromEntries(
  LIST.map((entry) => [entry.id, entry])
);
export const HOUSING_LIST = LIST;

export const HOUSING_UPGRADES: HousingUpgrade[] = [
  { id: 'bed', name: 'Нормальная кровать', description: 'Спина скажет спасибо.', price: 4500, sleepBonus: 0.12 },
  { id: 'wardrobe', name: 'Шкаф', description: 'Больше места под вещи.', price: 3200, storageBonus: 40 },
  { id: 'fridge', name: 'Холодильник', description: 'Еда перестаёт портиться.', price: 9000, storageBonus: 25 },
  { id: 'lamp', name: 'Лампа', description: 'Свет, при котором можно думать.', price: 1200, sanityPerDay: 2 },
  { id: 'tv', name: 'Телевизор', description: 'Фоновый шум вместо тишины.', price: 7500, sanityPerDay: 3 },
  { id: 'computer', name: 'Компьютер', description: 'Открывает удалённые подработки.', price: 28000, sanityPerDay: 2, requiresTier: 4 },
  { id: 'safe', name: 'Сейф', description: 'Наличные дома больше не пропадают.', price: 35000, safe: true, requiresTier: 3 }
];

export function getHousing(id: string | null): HousingDefinition | undefined {
  return id ? HOUSING[id] : undefined;
}
