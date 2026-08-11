import type { DistrictDefinition } from '../../types/world.js';

/** Рынок — второй доступный район: торговля, дешёвая еда, точки под бизнес. */
export const market: DistrictDefinition = {
  id: 'market',
  name: 'Рынок',
  subtitle: 'Ряды, крики, наличные',
  bounds: { x: 0, y: 0, w: 1800, h: 1300 },
  unlock: { minLevel: 4 },
  unlockText: 'Нужен 4-й уровень',
  groundColor: 0x33343a,
  grassColor: 0x3b4739,
  spawn: { x: 240, y: 640 },
  trafficDensity: 0.35,
  crowdDensity: 1,

  roads: [
    { id: 'market_h', x: 0, y: 560, w: 1800, h: 150, orientation: 'h', lanes: 2, sidewalk: true },
    { id: 'market_v', x: 820, y: 0, w: 120, h: 1300, orientation: 'v', lanes: 1, sidewalk: true }
  ],

  roadNodes: [
    { id: 'e0', x: -160, y: 675, next: ['e1'], spawn: true },
    { id: 'e1', x: 900, y: 675, next: ['e2'] },
    { id: 'e2', x: 1960, y: 675, next: [], despawn: true },
    { id: 'w0', x: 1960, y: 600, next: ['w1'], spawn: true },
    { id: 'w1', x: 900, y: 600, next: ['w2'] },
    { id: 'w2', x: -160, y: 600, next: [], despawn: true }
  ],

  buildings: [
    { id: 'market_hall', name: 'Крытый рынок', x: 200, y: 180, w: 520, h: 240, height: 90, style: 'industrial', windowRows: 2, windowCols: 8, lit: true },
    { id: 'market_pawn', name: 'Скупка', x: 1040, y: 200, w: 260, h: 150, height: 55, style: 'shop', windowRows: 1, windowCols: 3, lit: true },
    { id: 'market_food', name: 'Столовая', x: 1360, y: 200, w: 280, h: 150, height: 55, style: 'shop', windowRows: 1, windowCols: 4, lit: true },
    { id: 'market_storage', name: 'Склады', x: 1040, y: 900, w: 600, h: 180, height: 60, style: 'industrial', windowRows: 0, windowCols: 0, lit: false },
    { id: 'market_clothes', name: 'Одежда оптом', x: 200, y: 900, w: 400, h: 170, height: 60, style: 'shop', windowRows: 1, windowCols: 5, lit: true }
  ],

  props: [
    { kind: 'kiosk', x: 320, y: 500, collide: true },
    { kind: 'kiosk', x: 470, y: 500, collide: true },
    { kind: 'kiosk', x: 620, y: 500, collide: true },
    { kind: 'kiosk', x: 1120, y: 500, collide: true },
    { kind: 'kiosk', x: 1280, y: 500, collide: true },
    { kind: 'crate', x: 260, y: 760, collide: true },
    { kind: 'crate', x: 310, y: 780, collide: true },
    { kind: 'crate', x: 1500, y: 760, collide: true },
    { kind: 'crate', x: 1550, y: 790, collide: true },
    { kind: 'dumpster', x: 700, y: 800, collide: true },
    { kind: 'dumpster', x: 1620, y: 830, collide: true },
    { kind: 'bin', x: 900, y: 740, collide: false },
    { kind: 'bin', x: 1000, y: 500, collide: false },
    { kind: 'bench', x: 500, y: 760, dir: 'h', collide: true },
    { kind: 'bench', x: 1000, y: 830, dir: 'h', collide: true },
    { kind: 'lamp', x: 200, y: 540, collide: false },
    { kind: 'lamp', x: 700, y: 540, collide: false },
    { kind: 'lamp', x: 1200, y: 540, collide: false },
    { kind: 'lamp', x: 1650, y: 540, collide: false },
    { kind: 'lamp', x: 400, y: 860, collide: false },
    { kind: 'lamp', x: 1300, y: 860, collide: false },
    { kind: 'tree', x: 120, y: 500, collide: true },
    { kind: 'tree', x: 1720, y: 500, collide: true },
    { kind: 'tree', x: 120, y: 1150, collide: true },
    { kind: 'tree', x: 900, y: 1150, collide: true },
    { kind: 'car', x: 200, y: 740, variant: 1, collide: true },
    { kind: 'car', x: 1380, y: 740, variant: 3, collide: true },
    { kind: 'fence', x: 1040, y: 1090, dir: 'h', length: 600, collide: true },
    { kind: 'pigeon', x: 760, y: 790, collide: false },
    { kind: 'pigeon', x: 800, y: 810, collide: false }
  ],

  interactables: [
    { id: 'market_dumpster_1', kind: 'dumpster', x: 700, y: 800, label: 'Контейнер за рядами', lootTable: 'dumpster_residential' },
    { id: 'market_dumpster_2', kind: 'dumpster', x: 1620, y: 830, label: 'Контейнер у складов', lootTable: 'industrial_container' },
    { id: 'market_bin', kind: 'bin', x: 900, y: 740, label: 'Урна', lootTable: 'street_bin' },
    { id: 'market_shop_food', kind: 'shop', x: 1500, y: 355, label: 'Столовая', shopId: 'grocery' },
    { id: 'market_shop_pawn', kind: 'shop', x: 1170, y: 355, label: 'Скупка', shopId: 'pawn' },
    { id: 'market_shop_clothes', kind: 'shop', x: 400, y: 1075, label: 'Одежда оптом', shopId: 'clothes' },
    { id: 'market_jobs', kind: 'job', x: 1000, y: 830, label: 'Доска подработок' },
    { id: 'market_business', kind: 'business', x: 1120, y: 500, label: 'Свободное место под точку' },
    { id: 'market_bench', kind: 'bench', x: 500, y: 760, label: 'Лавочка', sleepSpotId: 'bench' },
    { id: 'market_stash', kind: 'stash', x: 1660, y: 1090, label: 'Тайник за складами', lootTable: 'stash_yard' },
    { id: 'transit_residential', kind: 'transit', x: 860, y: 740, label: 'Остановка → Спальный район', targetDistrict: 'residential' }
  ],

  npcs: [{ npcId: 'zina', x: 420, y: 700 }]
};
