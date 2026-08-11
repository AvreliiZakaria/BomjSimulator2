import type { ShopDefinition } from '../types/npc.js';

const LIST: ShopDefinition[] = [
  {
    id: 'grocery',
    name: 'Продукты «Свет»',
    keeperNpcId: 'luda',
    buyMul: 1,
    sellMul: 0.35,
    buysCategories: ['food', 'drink'],
    openHours: [8, 22],
    offers: [
      { itemId: 'bread_half', stock: 6 },
      { itemId: 'noodles', stock: 8 },
      { itemId: 'canned_food', stock: 5 },
      { itemId: 'water_bottle', stock: 10 },
      { itemId: 'apple', stock: 8 },
      { itemId: 'tea', stock: 6 },
      { itemId: 'pie', stock: 5, chance: 0.7 },
      { itemId: 'chocolate', stock: 4, chance: 0.6 },
      { itemId: 'energy_drink', stock: 3, chance: 0.5 },
      { itemId: 'soup', stock: 3, chance: 0.4 },
      { itemId: 'pizza_slice', stock: 3, chance: 0.35 }
    ]
  },
  {
    id: 'pawn',
    name: 'Ломбард Бориса',
    keeperNpcId: 'boris',
    buyMul: 1.25,
    sellMul: 0.5,
    buysCategories: ['material', 'valuable', 'tool', 'clothing', 'backpack', 'collectible'],
    openHours: [9, 21],
    dailySlots: 6,
    offers: [
      { itemId: 'old_backpack', stock: 1, chance: 0.8 },
      { itemId: 'city_backpack', stock: 1, chance: 0.4, conditions: { minLevel: 4 } },
      { itemId: 'tourist_backpack', stock: 1, chance: 0.2, conditions: { minLevel: 9 } },
      { itemId: 'flashlight', stock: 2, chance: 0.7 },
      { itemId: 'magnet_stick', stock: 1, chance: 0.5 },
      { itemId: 'multitool', stock: 1, chance: 0.3, conditions: { minLevel: 5 } },
      { itemId: 'phone_basic', stock: 1, chance: 0.6 },
      { itemId: 'phone_smart', stock: 1, chance: 0.25, conditions: { minLevel: 6 } },
      { itemId: 'old_jacket', stock: 2, chance: 0.7 },
      { itemId: 'warm_jacket', stock: 1, chance: 0.35, conditions: { minLevel: 3 } },
      { itemId: 'boots', stock: 1, chance: 0.5 },
      { itemId: 'gloves', stock: 2, chance: 0.6 },
      { itemId: 'beanie', stock: 2, chance: 0.7 },
      { itemId: 'nice_watch', stock: 1, chance: 0.1, conditions: { minLevel: 12 } }
    ]
  },
  {
    id: 'zina',
    name: 'Бабка Зина',
    keeperNpcId: 'zina',
    buyMul: 0.9,
    sellMul: 0.85,
    buysCategories: ['anomaly', 'collectible', 'valuable'],
    openHours: [8, 21],
    dailySlots: 3,
    offers: [
      { itemId: 'bird_seed', stock: 5 },
      { itemId: 'scarf', stock: 1, chance: 0.6 },
      { itemId: 'glass_jar', stock: 4, chance: 0.5 },
      { itemId: 'photo_yard', stock: 1, chance: 0.3 },
      { itemId: 'tape_city', stock: 1, chance: 0.2 }
    ]
  },
  {
    id: 'clothes',
    name: 'Секонд-хенд «Второй шанс»',
    buyMul: 1,
    sellMul: 0.3,
    buysCategories: ['clothing', 'backpack'],
    openHours: [10, 20],
    dailySlots: 7,
    offers: [
      { itemId: 'tshirt', stock: 4 },
      { itemId: 'hoodie', stock: 3 },
      { itemId: 'sweatpants', stock: 4 },
      { itemId: 'jeans', stock: 3 },
      { itemId: 'sneakers', stock: 2 },
      { itemId: 'boots', stock: 2, chance: 0.6 },
      { itemId: 'warm_jacket', stock: 1, chance: 0.4 },
      { itemId: 'beanie', stock: 3 },
      { itemId: 'cap', stock: 3, chance: 0.7 },
      { itemId: 'scarf', stock: 2, chance: 0.6 },
      { itemId: 'coat', stock: 1, chance: 0.2, conditions: { minLevel: 8 } },
      { itemId: 'suit', stock: 1, chance: 0.1, conditions: { minLevel: 14 } },
      { itemId: 'suit_pants', stock: 1, chance: 0.15, conditions: { minLevel: 14 } },
      { itemId: 'dress_shoes', stock: 1, chance: 0.15, conditions: { minLevel: 14 } }
    ]
  },
  {
    id: 'hardware',
    name: 'Хозтовары',
    buyMul: 1.05,
    sellMul: 0.4,
    buysCategories: ['material', 'tool'],
    openHours: [9, 20],
    offers: [
      { itemId: 'gloves', stock: 5 },
      { itemId: 'flashlight', stock: 3 },
      { itemId: 'battery', stock: 20 },
      { itemId: 'magnet_stick', stock: 2 },
      { itemId: 'multitool', stock: 1, chance: 0.5, conditions: { minLevel: 4 } },
      { itemId: 'cardboard_sheet', stock: 10 }
    ]
  }
];

export const SHOPS: Record<string, ShopDefinition> = Object.fromEntries(LIST.map((shop) => [shop.id, shop]));
export const SHOP_LIST = LIST;

export function getShop(id: string): ShopDefinition | undefined {
  return SHOPS[id];
}
