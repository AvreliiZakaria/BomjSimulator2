import type { ItemDefinition } from '../types/items.js';

type ItemDraft = Partial<ItemDefinition> & Pick<ItemDefinition, 'id' | 'name' | 'category'>;

const define = (draft: ItemDraft): ItemDefinition => ({
  description: '',
  rarity: 'common',
  weight: 0.3,
  basePrice: 5,
  stackable: true,
  maxStack: 20,
  tags: [],
  icon: 'box',
  ...draft
});

const LIST: ItemDefinition[] = [
  // ─────────────────────────── ЕДА ───────────────────────────
  define({
    id: 'bread_half',
    name: 'Полбулки хлеба',
    description: 'Чуть подсохшая, но это всё ещё хлеб.',
    category: 'food',
    weight: 0.2,
    basePrice: 12,
    consumable: true,
    icon: 'bread',
    effects: { hunger: 18, sanity: 1 },
    tags: ['edible']
  }),
  define({
    id: 'yogurt_expired',
    name: 'Просроченный йогурт',
    description: 'Срок годности закончился. Вопрос только в том, насколько давно.',
    category: 'food',
    weight: 0.15,
    basePrice: 4,
    consumable: true,
    icon: 'cup',
    effects: { hunger: 14, health: -2, spoilRisk: 0.45, statusChance: [{ id: 'poison', chance: 0.3 }] },
    tags: ['edible', 'risky']
  }),
  define({
    id: 'canned_food',
    name: 'Консервы',
    description: 'Надёжно как бетон. Открывается с боем.',
    category: 'food',
    weight: 0.4,
    basePrice: 45,
    consumable: true,
    icon: 'can',
    effects: { hunger: 30, health: 2 },
    tags: ['edible', 'storable']
  }),
  define({
    id: 'noodles',
    name: 'Лапша быстрого приготовления',
    description: 'Кипяток не обязателен. Но желателен.',
    category: 'food',
    weight: 0.1,
    basePrice: 28,
    consumable: true,
    icon: 'noodles',
    effects: { hunger: 24, warmth: 4 },
    tags: ['edible']
  }),
  define({
    id: 'shawarma',
    name: 'Шаурма',
    description: 'Городская классика. Состав — городская тайна.',
    category: 'food',
    weight: 0.35,
    basePrice: 160,
    consumable: true,
    icon: 'wrap',
    effects: { hunger: 48, sanity: 6, warmth: 5, spoilRisk: 0.08, statusChance: [{ id: 'poison', chance: 0.07 }] },
    tags: ['edible', 'street']
  }),
  define({
    id: 'soup',
    name: 'Горячий суп',
    description: 'Греет изнутри лучше любой куртки.',
    category: 'food',
    weight: 0.5,
    basePrice: 110,
    consumable: true,
    icon: 'bowl',
    effects: { hunger: 38, warmth: 14, health: 3, sanity: 4 },
    tags: ['edible', 'warm']
  }),
  define({
    id: 'pizza_slice',
    name: 'Кусок пиццы',
    description: 'Холодная пицца — тоже пицца.',
    category: 'food',
    weight: 0.25,
    basePrice: 130,
    consumable: true,
    icon: 'pizza',
    effects: { hunger: 34, sanity: 5 },
    tags: ['edible']
  }),
  define({
    id: 'sus_food',
    name: 'Подозрительная еда',
    description: 'Пахнет вопросами, на которые лучше не знать ответы.',
    category: 'food',
    rarity: 'uncommon',
    weight: 0.3,
    basePrice: 2,
    consumable: true,
    icon: 'skull',
    effects: {
      hunger: 26,
      sanity: -6,
      spoilRisk: 0.6,
      statusChance: [
        { id: 'poison', chance: 0.45 },
        { id: 'stress', chance: 0.2 }
      ]
    },
    tags: ['edible', 'risky', 'weird']
  }),
  define({
    id: 'apple',
    name: 'Яблоко',
    description: 'Немного помятое, но честное.',
    category: 'food',
    weight: 0.15,
    basePrice: 20,
    consumable: true,
    icon: 'apple',
    effects: { hunger: 12, health: 2, hygiene: 1 },
    tags: ['edible']
  }),
  define({
    id: 'sausage',
    name: 'Сосиска в тесте',
    description: 'Вокзальный деликатес.',
    category: 'food',
    weight: 0.2,
    basePrice: 65,
    consumable: true,
    icon: 'wrap',
    effects: { hunger: 26, warmth: 3, spoilRisk: 0.12, statusChance: [{ id: 'poison', chance: 0.1 }] },
    tags: ['edible']
  }),
  define({
    id: 'chocolate',
    name: 'Шоколадка',
    description: 'Быстрые калории и капля радости.',
    category: 'food',
    weight: 0.1,
    basePrice: 85,
    consumable: true,
    icon: 'bar',
    effects: { hunger: 14, energy: 8, sanity: 8 },
    tags: ['edible']
  }),
  define({
    id: 'pie',
    name: 'Пирожок',
    description: 'С чем-то. Продавец сказал «с картошкой».',
    category: 'food',
    weight: 0.15,
    basePrice: 45,
    consumable: true,
    icon: 'bread',
    effects: { hunger: 20, warmth: 4, spoilRisk: 0.1 },
    tags: ['edible']
  }),

  // ─────────────────────────── НАПИТКИ ───────────────────────────
  define({
    id: 'water_bottle',
    name: 'Бутылка воды',
    description: 'Вода. Иногда этого достаточно.',
    category: 'drink',
    weight: 0.5,
    basePrice: 35,
    consumable: true,
    icon: 'bottle',
    effects: { hunger: 5, health: 2, hygiene: 2, sanity: 2 },
    tags: ['drinkable']
  }),
  define({
    id: 'tea',
    name: 'Стакан чая',
    description: 'Горячий. Держать двумя руками.',
    category: 'drink',
    weight: 0.3,
    basePrice: 40,
    consumable: true,
    icon: 'cup',
    effects: { warmth: 16, energy: 5, sanity: 4, hunger: 3 },
    tags: ['drinkable', 'warm']
  }),
  define({
    id: 'energy_drink',
    name: 'Энергетик',
    description: 'Взбодрит. Потом отдашь с процентами.',
    category: 'drink',
    weight: 0.35,
    basePrice: 120,
    consumable: true,
    icon: 'can',
    effects: { energy: 32, sanity: -3, health: -2, statusChance: [{ id: 'stress', chance: 0.15 }] },
    tags: ['drinkable']
  }),

  // ─────────────────────────── МАТЕРИАЛЫ ───────────────────────────
  define({
    id: 'plastic_bottle',
    name: 'Пластиковая бутылка',
    description: 'Основа стартовой экономики.',
    category: 'material',
    weight: 0.06,
    basePrice: 3,
    maxStack: 60,
    icon: 'bottle',
    tags: ['recyclable']
  }),
  define({
    id: 'can_empty',
    name: 'Алюминиевая банка',
    description: 'Лёгкая, звонкая, принимают везде.',
    category: 'material',
    weight: 0.04,
    basePrice: 5,
    maxStack: 60,
    icon: 'can',
    tags: ['recyclable']
  }),
  define({
    id: 'scrap_metal',
    name: 'Металлолом',
    description: 'Тяжёлый, но за него платят.',
    category: 'material',
    weight: 1.2,
    basePrice: 22,
    maxStack: 30,
    icon: 'scrap',
    tags: ['recyclable']
  }),
  define({
    id: 'copper_wire',
    name: 'Медный провод',
    description: 'Медь дороже железа. Это база.',
    category: 'material',
    rarity: 'uncommon',
    weight: 0.4,
    basePrice: 70,
    maxStack: 30,
    icon: 'wire',
    tags: ['recyclable']
  }),
  define({
    id: 'battery',
    name: 'Батарейка',
    description: 'Может, ещё живая.',
    category: 'material',
    weight: 0.05,
    basePrice: 12,
    maxStack: 40,
    icon: 'battery',
    tags: ['tech']
  }),
  define({
    id: 'cardboard_sheet',
    name: 'Кусок картона',
    description: 'Матрас, стол и стена в одном лице.',
    category: 'material',
    weight: 0.3,
    basePrice: 4,
    maxStack: 20,
    icon: 'card',
    tags: ['bedding']
  }),
  define({
    id: 'glass_jar',
    name: 'Стеклянная банка',
    description: 'Бабка Зина такое любит.',
    category: 'material',
    weight: 0.4,
    basePrice: 8,
    maxStack: 25,
    icon: 'jar',
    tags: ['recyclable']
  }),
  define({
    id: 'phone_parts',
    name: 'Детали от телефона',
    description: 'Кому-то нужен именно этот шлейф.',
    category: 'material',
    rarity: 'uncommon',
    weight: 0.2,
    basePrice: 90,
    maxStack: 15,
    icon: 'chip',
    tags: ['tech']
  }),

  // ─────────────────────────── МУСОР ───────────────────────────
  define({ id: 'dirty_rag', name: 'Грязная тряпка', description: 'Ничего не стоит. Иногда это просто тряпка.', category: 'trash', weight: 0.2, basePrice: 1, icon: 'rag' }),
  define({ id: 'broken_toy', name: 'Сломанная игрушка', description: 'У неё была история.', category: 'trash', weight: 0.2, basePrice: 2, icon: 'toy' }),
  define({ id: 'old_newspaper', name: 'Старая газета', description: 'Новости позапрошлого года. Греет не хуже свежих.', category: 'trash', weight: 0.1, basePrice: 1, icon: 'paper', effects: { warmth: 2 }, consumable: false }),
  define({ id: 'bent_fork', name: 'Погнутая вилка', description: 'Три зуба из четырёх — рабочие.', category: 'trash', weight: 0.05, basePrice: 2, icon: 'fork' }),

  // ─────────────────────────── ОДЕЖДА ───────────────────────────
  define({ id: 'tshirt', name: 'Футболка', description: 'Просто футболка.', category: 'clothing', slot: 'top', weight: 0.2, basePrice: 150, stackable: false, maxStack: 1, icon: 'shirt', passive: { warmth: 2, style: 1 } }),
  define({ id: 'hoodie', name: 'Худи', description: 'Капюшон скрывает от ветра и от взглядов.', category: 'clothing', slot: 'top', weight: 0.6, basePrice: 700, stackable: false, maxStack: 1, icon: 'hoodie', passive: { warmth: 8, style: 3 } }),
  define({ id: 'old_jacket', name: 'Старая куртка', description: 'Пахнет подъездом, но греет.', category: 'clothing', slot: 'top', rarity: 'uncommon', weight: 1.2, basePrice: 220, stackable: false, maxStack: 1, icon: 'jacket', passive: { warmth: 10, style: -1 } }),
  define({ id: 'warm_jacket', name: 'Тёплая куртка', description: 'С ней ночь перестаёт быть врагом.', category: 'clothing', slot: 'top', rarity: 'rare', weight: 1.6, basePrice: 1900, stackable: false, maxStack: 1, icon: 'jacket', passive: { warmth: 22, style: 4 } }),
  define({ id: 'coat', name: 'Пальто', description: 'Выглядишь как человек с планами.', category: 'clothing', slot: 'top', rarity: 'rare', weight: 1.4, basePrice: 5200, stackable: false, maxStack: 1, icon: 'coat', passive: { warmth: 16, style: 12 } }),
  define({ id: 'suit', name: 'Костюм', description: 'Пропуск в кабинеты, где решают.', category: 'clothing', slot: 'top', rarity: 'veryRare', weight: 1.1, basePrice: 18000, stackable: false, maxStack: 1, icon: 'suit', passive: { warmth: 8, style: 25, tradeBonus: 0.05 } }),
  define({ id: 'sweatpants', name: 'Спортивные штаны', description: 'Универсальная городская форма.', category: 'clothing', slot: 'bottom', weight: 0.4, basePrice: 300, stackable: false, maxStack: 1, icon: 'pants', passive: { warmth: 6, style: 1 } }),
  define({ id: 'jeans', name: 'Джинсы', description: 'Прочные. Переживут тебя.', category: 'clothing', slot: 'bottom', weight: 0.7, basePrice: 850, stackable: false, maxStack: 1, icon: 'pants', passive: { warmth: 7, style: 5 } }),
  define({ id: 'suit_pants', name: 'Брюки', description: 'Со стрелками. Почти.', category: 'clothing', slot: 'bottom', rarity: 'rare', weight: 0.5, basePrice: 4200, stackable: false, maxStack: 1, icon: 'pants', passive: { warmth: 5, style: 14 } }),
  define({ id: 'sneakers', name: 'Кроссовки', description: 'Ноги — твой основной транспорт.', category: 'clothing', slot: 'shoes', weight: 0.8, basePrice: 900, stackable: false, maxStack: 1, icon: 'shoe', passive: { warmth: 5, style: 6 } }),
  define({ id: 'boots', name: 'Ботинки', description: 'Тяжёлые, тёплые, надёжные.', category: 'clothing', slot: 'shoes', rarity: 'uncommon', weight: 1.3, basePrice: 1500, stackable: false, maxStack: 1, icon: 'shoe', passive: { warmth: 12, style: 3 } }),
  define({ id: 'worn_shoes', name: 'Стоптанная обувь', description: 'Подошва просит каши.', category: 'clothing', slot: 'shoes', weight: 0.6, basePrice: 60, stackable: false, maxStack: 1, icon: 'shoe', passive: { warmth: 2, style: -2 } }),
  define({ id: 'dress_shoes', name: 'Туфли', description: 'Скрипят дорого.', category: 'clothing', slot: 'shoes', rarity: 'rare', weight: 0.7, basePrice: 3800, stackable: false, maxStack: 1, icon: 'shoe', passive: { warmth: 3, style: 15 } }),
  define({ id: 'beanie', name: 'Шапка', description: 'Тепло начинается с головы.', category: 'clothing', slot: 'head', weight: 0.1, basePrice: 250, stackable: false, maxStack: 1, icon: 'hat', passive: { warmth: 9, style: 2 } }),
  define({ id: 'cap', name: 'Кепка', description: 'Не греет, но образ держит.', category: 'clothing', slot: 'head', weight: 0.1, basePrice: 400, stackable: false, maxStack: 1, icon: 'hat', passive: { warmth: 2, style: 5 } }),
  define({ id: 'gloves', name: 'Перчатки', description: 'Руки скажут спасибо на разгрузке.', category: 'clothing', slot: 'accessory', weight: 0.1, basePrice: 320, stackable: false, maxStack: 1, icon: 'glove', passive: { warmth: 6, searchBonus: 0.08 } }),
  define({ id: 'scarf', name: 'Шарф', description: 'Бабушкин. Кусается, но греет.', category: 'clothing', slot: 'accessory', weight: 0.15, basePrice: 280, stackable: false, maxStack: 1, icon: 'scarf', passive: { warmth: 8, style: 2 } }),
  define({ id: 'nice_watch', name: 'Часы', description: 'Показывают время и статус.', category: 'clothing', slot: 'accessory', rarity: 'veryRare', weight: 0.1, basePrice: 12000, stackable: false, maxStack: 1, icon: 'watch', passive: { style: 20, tradeBonus: 0.04 } }),

  // ─────────────────────────── РЮКЗАКИ ───────────────────────────
  define({ id: 'plastic_bag', name: 'Пакет', description: 'Классика. Рвётся в самый нужный момент.', category: 'backpack', slot: 'backpack', weight: 0.05, basePrice: 10, stackable: false, maxStack: 1, icon: 'bag', passive: { capacity: 3 } }),
  define({ id: 'old_backpack', name: 'Старый рюкзак', description: 'Одна лямка держится на честном слове.', category: 'backpack', slot: 'backpack', rarity: 'uncommon', weight: 0.5, basePrice: 350, stackable: false, maxStack: 1, icon: 'backpack', passive: { capacity: 8, style: -1 } }),
  define({ id: 'city_backpack', name: 'Городской рюкзак', description: 'Нормальный человеческий рюкзак.', category: 'backpack', slot: 'backpack', rarity: 'rare', weight: 0.7, basePrice: 1800, stackable: false, maxStack: 1, icon: 'backpack', passive: { capacity: 16, style: 4 } }),
  define({ id: 'tourist_backpack', name: 'Туристический рюкзак', description: 'В нём можно унести половину рынка.', category: 'backpack', slot: 'backpack', rarity: 'veryRare', weight: 1.4, basePrice: 6500, stackable: false, maxStack: 1, icon: 'backpack', passive: { capacity: 28, style: 3 } }),
  define({ id: 'big_backpack', name: 'Большой качественный рюкзак', description: 'Финал эволюции таскания вещей.', category: 'backpack', slot: 'backpack', rarity: 'legendary', weight: 1.8, basePrice: 16000, stackable: false, maxStack: 1, icon: 'backpack', passive: { capacity: 45, style: 8 } }),

  // ─────────────────────────── ИНСТРУМЕНТЫ ───────────────────────────
  define({ id: 'multitool', name: 'Мультитул', description: 'Открывает консервы, двери и возможности.', category: 'tool', slot: 'tool', rarity: 'rare', weight: 0.3, basePrice: 2200, stackable: false, maxStack: 1, icon: 'tool', passive: { searchBonus: 0.15 } }),
  define({ id: 'magnet_stick', name: 'Палка с магнитом', description: 'Достаёт металл оттуда, куда не лезет рука.', category: 'tool', slot: 'tool', rarity: 'uncommon', weight: 0.9, basePrice: 700, stackable: false, maxStack: 1, icon: 'tool', passive: { searchBonus: 0.1 } }),
  define({ id: 'flashlight', name: 'Фонарик', description: 'После трёх это не роскошь.', category: 'tool', slot: 'tool', rarity: 'uncommon', weight: 0.3, basePrice: 550, stackable: false, maxStack: 1, icon: 'lamp', passive: { searchBonus: 0.12 } }),
  define({ id: 'phone_basic', name: 'Кнопочный телефон', description: 'Звонит. Больше ничего и не надо.', category: 'tool', rarity: 'uncommon', weight: 0.15, basePrice: 900, stackable: false, maxStack: 1, icon: 'phone', tags: ['phone'] }),
  define({ id: 'phone_smart', name: 'Смартфон', description: 'Карта, работа, банк, рейтинг. Весь город в кармане.', category: 'tool', rarity: 'rare', weight: 0.2, basePrice: 7500, stackable: false, maxStack: 1, icon: 'phone', tags: ['phone', 'smart'] }),

  // ─────────────────────────── ЦЕННОСТИ ───────────────────────────
  define({ id: 'gold_ring', name: 'Золотое кольцо', description: 'Кто-то очень расстроился.', category: 'valuable', rarity: 'veryRare', weight: 0.02, basePrice: 8500, maxStack: 5, icon: 'ring' }),
  define({ id: 'silver_chain', name: 'Серебряная цепочка', description: 'Тонкая, но настоящая.', category: 'valuable', rarity: 'rare', weight: 0.03, basePrice: 2600, maxStack: 5, icon: 'ring' }),
  define({ id: 'old_camera', name: 'Плёночный фотоаппарат', description: 'Внутри кто-то забыл плёнку.', category: 'valuable', rarity: 'rare', weight: 0.8, basePrice: 3400, stackable: false, maxStack: 1, icon: 'camera' }),
  define({ id: 'broken_smartphone', name: 'Разбитый смартфон', description: 'Экран паутиной, но плата целая.', category: 'valuable', rarity: 'uncommon', weight: 0.2, basePrice: 800, maxStack: 5, icon: 'phone' }),
  define({ id: 'coin_collection', name: 'Пакетик старых монет', description: 'Нумизматы такое любят.', category: 'valuable', rarity: 'rare', weight: 0.3, basePrice: 1900, maxStack: 5, icon: 'coin' }),

  // ─────────────────────────── АНОМАЛЬНОЕ ───────────────────────────
  define({ id: 'strange_key', name: 'Странный ключ', description: 'Холодный даже в тёплой руке. От чего он — непонятно.', category: 'anomaly', rarity: 'anomalous', weight: 0.05, basePrice: 0, stackable: false, maxStack: 1, icon: 'key', tags: ['weird', 'quest'] }),
  define({ id: 'humming_battery', name: 'Гудящая батарейка', description: 'Она не должна гудеть. Она гудит.', category: 'anomaly', rarity: 'anomalous', weight: 0.05, basePrice: 400, maxStack: 10, icon: 'battery', tags: ['weird'] }),
  define({ id: 'wet_photo', name: 'Мокрая фотография', description: 'На ней двор, в котором ты ночевал. И ты. Хотя снимок старый.', category: 'anomaly', rarity: 'anomalous', weight: 0.02, basePrice: 250, maxStack: 10, icon: 'photo', tags: ['weird', 'collection'] }),
  define({ id: 'ticket_0347', name: 'Билет на автобус 03:47', description: 'Такого маршрута нет. Билет есть.', category: 'anomaly', rarity: 'anomalous', weight: 0.01, basePrice: 0, stackable: false, maxStack: 1, icon: 'ticket', tags: ['weird', 'quest'] }),
  define({ id: 'black_feather', name: 'Чёрное перо', description: 'Слишком большое для голубя. Валера бы объяснил.', category: 'anomaly', rarity: 'anomalous', weight: 0.01, basePrice: 150, maxStack: 20, icon: 'feather', tags: ['weird', 'collection'] }),

  // ─────────────────────────── КОЛЛЕКЦИЯ ───────────────────────────
  define({ id: 'badge_star', name: 'Значок «Звезда»', description: 'Кто-то носил его с гордостью.', category: 'collectible', rarity: 'uncommon', weight: 0.01, basePrice: 120, maxStack: 10, icon: 'badge', tags: ['collection'] }),
  define({ id: 'tape_city', name: 'Кассета «Город спит»', description: 'Подписана от руки. Магнитофона у тебя нет.', category: 'collectible', rarity: 'rare', weight: 0.05, basePrice: 350, maxStack: 10, icon: 'tape', tags: ['collection'] }),
  define({ id: 'photo_yard', name: 'Фото старого двора', description: 'Двор тот же, дома другие.', category: 'collectible', rarity: 'uncommon', weight: 0.01, basePrice: 180, maxStack: 10, icon: 'photo', tags: ['collection'] }),

  // ─────────────────────────── КВЕСТОВОЕ ───────────────────────────
  define({ id: 'grisha_thermos', name: 'Термос дяди Гриши', description: 'Пустой. Гриша будет рад его вернуть.', category: 'quest', rarity: 'uncommon', weight: 0.4, basePrice: 0, stackable: false, maxStack: 1, icon: 'bottle', tags: ['quest'] }),
  define({ id: 'bird_seed', name: 'Пакетик зерна', description: 'Голуби считают тебя лучшим человеком города.', category: 'quest', weight: 0.2, basePrice: 30, maxStack: 10, icon: 'seed', tags: ['pigeon'] })
];

export const ITEMS: Record<string, ItemDefinition> = Object.fromEntries(
  LIST.map((item) => [item.id, item])
);

export const ITEM_LIST = LIST;

export function getItem(id: string): ItemDefinition | undefined {
  return ITEMS[id];
}

/** Безопасное получение: неизвестный id не должен ронять игру и сейв. */
export function requireItem(id: string): ItemDefinition {
  return (
    ITEMS[id] ?? {
      id,
      name: 'Неизвестный предмет',
      description: 'Что-то, чего быть не должно.',
      category: 'trash',
      rarity: 'common',
      weight: 0.1,
      basePrice: 0,
      stackable: true,
      maxStack: 10,
      tags: [],
      icon: 'box'
    }
  );
}
