export type ItemCategory =
  | 'money'
  | 'food'
  | 'drink'
  | 'clothing'
  | 'backpack'
  | 'material'
  | 'trash'
  | 'valuable'
  | 'tool'
  | 'anomaly'
  | 'quest'
  | 'collectible';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'veryRare' | 'legendary' | 'anomalous';

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  veryRare: 'Очень редкий',
  legendary: 'Легендарный',
  anomalous: 'Аномальный'
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9aa4b2',
  uncommon: '#67c06d',
  rare: '#4c9ef2',
  veryRare: '#a86df0',
  legendary: '#f2c14e',
  anomalous: '#f2564e'
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  money: 'Деньги',
  food: 'Еда',
  drink: 'Напитки',
  clothing: 'Одежда',
  backpack: 'Рюкзаки',
  material: 'Материалы',
  trash: 'Мусор',
  valuable: 'Ценности',
  tool: 'Инструменты',
  anomaly: 'Аномальное',
  quest: 'Задания',
  collectible: 'Коллекция'
};

export type EquipSlot = 'head' | 'top' | 'bottom' | 'shoes' | 'backpack' | 'accessory' | 'tool';

export const EQUIP_SLOT_LABELS: Record<EquipSlot, string> = {
  head: 'Голова',
  top: 'Верх',
  bottom: 'Низ',
  shoes: 'Обувь',
  backpack: 'Рюкзак',
  accessory: 'Аксессуар',
  tool: 'Инструмент'
};

export type StatusEffectId = 'poison' | 'cold' | 'hypothermia' | 'fatigue' | 'stress';

export interface ItemEffects {
  /** Мгновенные изменения показателей при использовании. */
  hunger?: number;
  health?: number;
  warmth?: number;
  hygiene?: number;
  sanity?: number;
  energy?: number;
  money?: number;
  /** Шанс подхватить статус, 0..1. */
  statusChance?: { id: StatusEffectId; chance: number }[];
  /** Шанс, что еда испорчена и эффекты уйдут в минус, 0..1. */
  spoilRisk?: number;
}

export interface ItemPassive {
  /** Пассивная защита от холода, пока вещь надета. */
  warmth?: number;
  /** Прибавка к переносимому весу. */
  capacity?: number;
  /** Влияние на внешний вид и отношение города. */
  style?: number;
  /** Множитель цены продажи (торговый инструмент). */
  tradeBonus?: number;
  /** Бонус к качеству поиска в мусорках. */
  searchBonus?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: Rarity;
  /** Килограммы. */
  weight: number;
  basePrice: number;
  stackable: boolean;
  maxStack: number;
  effects?: ItemEffects;
  passive?: ItemPassive;
  slot?: EquipSlot;
  consumable?: boolean;
  tags: string[];
  /** Ключ процедурной иконки (см. ui/ItemIcon.ts). */
  icon: string;
}

export interface InventoryStack {
  itemId: string;
  count: number;
}

export interface LootEntry {
  itemId?: string;
  /** Диапазон денег, если это денежная находка. */
  money?: [number, number];
  count?: [number, number];
  weight: number;
  /** Условия появления, например только после 03:00. */
  minLuck?: number;
  lateNightOnly?: boolean;
}

export interface LootTable {
  id: string;
  /** Сколько раз крутим таблицу. */
  rolls: [number, number];
  /** Шанс, что попытка вообще ничего не даст, 0..1. */
  emptyChance: number;
  entries: LootEntry[];
}
