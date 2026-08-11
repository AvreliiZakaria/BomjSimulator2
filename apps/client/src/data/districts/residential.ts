import type { DistrictDefinition, PropDef } from '../../types/world.js';

/**
 * Спальный район — стартовая зона. Плотная: каждые 20–30 секунд
 * игрок натыкается на что-то полезное или интересное.
 *
 * Геометрия: (x, y, w, h) здания — это фасад и одновременно коллизия,
 * height — видимая глубина крыши сверху (3/4 обзор).
 */

const trees = (points: [number, number][]): PropDef[] =>
  points.map(([x, y]) => ({ kind: 'tree', x, y, collide: true, variant: Math.floor((x + y) % 3) }));

const lamps = (points: [number, number][]): PropDef[] =>
  points.map(([x, y]) => ({ kind: 'lamp', x, y, collide: false }));

export const residential: DistrictDefinition = {
  id: 'residential',
  name: 'Спальный район',
  subtitle: 'Панельки, дворы, контейнеры',
  bounds: { x: 0, y: 0, w: 2400, h: 1800 },
  unlockedFromStart: true,
  groundColor: 0x2f3238,
  grassColor: 0x39463a,
  spawn: { x: 780, y: 745 },
  trafficDensity: 0.7,
  crowdDensity: 0.8,

  roads: [
    { id: 'main_h', x: 0, y: 820, w: 2400, h: 160, orientation: 'h', lanes: 2, sidewalk: true },
    { id: 'cross_v', x: 1130, y: 0, w: 140, h: 1800, orientation: 'v', lanes: 2, sidewalk: true },
    { id: 'yard_h_top', x: 100, y: 380, w: 940, h: 70, orientation: 'h', lanes: 1 },
    { id: 'yard_h_bottom', x: 140, y: 1360, w: 900, h: 70, orientation: 'h', lanes: 1 },
    { id: 'yard_h_right', x: 1350, y: 1360, w: 960, h: 70, orientation: 'h', lanes: 1 }
  ],

  roadNodes: [
    { id: 'e0', x: -160, y: 940, next: ['e1'], spawn: true },
    { id: 'e1', x: 1200, y: 940, next: ['e2'] },
    { id: 'e2', x: 2560, y: 940, next: [], despawn: true },
    { id: 'w0', x: 2560, y: 860, next: ['w1'], spawn: true },
    { id: 'w1', x: 1200, y: 860, next: ['w2'] },
    { id: 'w2', x: -160, y: 860, next: [], despawn: true },
    { id: 's0', x: 1165, y: -160, next: ['s1'], spawn: true },
    { id: 's1', x: 1165, y: 900, next: ['s2'] },
    { id: 's2', x: 1165, y: 1960, next: [], despawn: true },
    { id: 'n0', x: 1235, y: 1960, next: ['n1'], spawn: true },
    { id: 'n1', x: 1235, y: 900, next: ['n2'] },
    { id: 'n2', x: 1235, y: -160, next: [], despawn: true }
  ],

  buildings: [
    { id: 'dom1', name: 'Дом 1', x: 140, y: 140, w: 400, h: 200, height: 80, style: 'panel', windowRows: 4, windowCols: 7, lit: true },
    { id: 'dom2', name: 'Дом 2', x: 620, y: 140, w: 380, h: 200, height: 80, style: 'panel', windowRows: 4, windowCols: 6, lit: true },
    { id: 'dom3', name: 'Дом 3 (расселён)', x: 140, y: 500, w: 300, h: 190, height: 70, style: 'old', windowRows: 3, windowCols: 5, lit: false },
    { id: 'dom5', name: 'Дом 5', x: 560, y: 500, w: 440, h: 190, height: 75, style: 'brick', windowRows: 3, windowCols: 8, lit: true },
    { id: 'dom7', name: 'Дом 7', x: 1400, y: 160, w: 420, h: 200, height: 80, style: 'panel', windowRows: 4, windowCols: 7, lit: true },
    { id: 'dom9', name: 'Дом 9', x: 1900, y: 160, w: 360, h: 200, height: 80, style: 'panel', windowRows: 4, windowCols: 6, lit: true },
    { id: 'shop_grocery', name: 'Продукты «Свет»', x: 1400, y: 560, w: 280, h: 150, height: 55, style: 'shop', windowRows: 1, windowCols: 4, lit: true },
    { id: 'shop_pawn', name: 'Ломбард', x: 1740, y: 560, w: 240, h: 150, height: 55, style: 'shop', windowRows: 1, windowCols: 3, lit: true },
    { id: 'shop_clothes', name: 'Секонд-хенд', x: 200, y: 1480, w: 280, h: 150, height: 55, style: 'shop', windowRows: 1, windowCols: 4, lit: true },
    { id: 'shop_hardware', name: 'Хозтовары', x: 560, y: 1480, w: 250, h: 150, height: 55, style: 'shop', windowRows: 1, windowCols: 3, lit: true },
    { id: 'dom11', name: 'Дом 11', x: 1400, y: 1120, w: 400, h: 190, height: 75, style: 'brick', windowRows: 3, windowCols: 7, lit: true },
    { id: 'garages', name: 'Гаражи', x: 1900, y: 1140, w: 380, h: 140, height: 45, style: 'industrial', windowRows: 0, windowCols: 0, lit: false },
    { id: 'dom13', name: 'Дом 13', x: 180, y: 1120, w: 380, h: 190, height: 75, style: 'panel', windowRows: 3, windowCols: 6, lit: true },
    { id: 'luck_club', name: 'Клуб удачи', x: 1880, y: 1480, w: 320, h: 160, height: 60, style: 'glass', windowRows: 1, windowCols: 5, lit: true },
    { id: 'housing_office', name: 'Жилищная контора', x: 1400, y: 1480, w: 300, h: 150, height: 55, style: 'shop', windowRows: 1, windowCols: 4, lit: true }
  ],

  props: [
    ...trees([
      [110, 400], [300, 400], [500, 405], [700, 400], [900, 400], [1050, 410],
      [120, 760], [340, 770], [560, 765], [980, 760],
      [1330, 420], [1330, 760], [1560, 780], [1880, 770], [2160, 760],
      [120, 1060], [420, 1070], [760, 1060], [1020, 1070],
      [1340, 1060], [1700, 1070], [2100, 1060],
      [180, 1700], [700, 1700], [1500, 1700], [2000, 1700]
    ]),
    ...lamps([
      [200, 800], [600, 800], [1000, 800], [1400, 800], [1800, 800], [2200, 800],
      [200, 1000], [600, 1000], [1000, 1000], [1400, 1000], [1800, 1000], [2200, 1000],
      [1100, 300], [1100, 600], [1100, 1200], [1100, 1500],
      [420, 430], [820, 430], [420, 1410], [820, 1410], [1600, 1410], [2000, 1410]
    ]),
    // Двор: стартовая точка. Лавочки, картон, контейнеры.
    { kind: 'bench', x: 700, y: 745, dir: 'h', collide: true },
    { kind: 'bench', x: 880, y: 745, dir: 'h', collide: true },
    { kind: 'bench', x: 300, y: 745, dir: 'h', collide: true },
    { kind: 'bench', x: 1500, y: 470, dir: 'h', collide: true },
    { kind: 'bench', x: 1960, y: 470, dir: 'h', collide: true },
    { kind: 'bench', x: 420, y: 1330, dir: 'h', collide: true },
    { kind: 'cardboard', x: 640, y: 700, collide: false },
    { kind: 'dumpster', x: 460, y: 720, collide: true },
    { kind: 'dumpster', x: 520, y: 720, collide: true },
    { kind: 'dumpster', x: 1020, y: 1330, collide: true },
    { kind: 'dumpster', x: 1860, y: 1330, collide: true },
    { kind: 'dumpster', x: 1340, y: 720, collide: true },
    { kind: 'bin', x: 1080, y: 800, collide: false },
    { kind: 'bin', x: 1300, y: 1000, collide: false },
    { kind: 'bin', x: 260, y: 1000, collide: false },
    { kind: 'bin', x: 1700, y: 800, collide: false },
    { kind: 'busStop', x: 900, y: 1010, collide: true },
    { kind: 'kiosk', x: 1320, y: 1010, collide: true },
    { kind: 'fence', x: 1880, y: 1300, dir: 'h', length: 400, collide: true },
    { kind: 'fence', x: 140, y: 700, dir: 'h', length: 180, collide: true },
    { kind: 'planter', x: 1420, y: 740, collide: true },
    { kind: 'planter', x: 1760, y: 740, collide: true },
    { kind: 'car', x: 240, y: 1010, variant: 0, collide: true },
    { kind: 'car', x: 400, y: 1010, variant: 1, collide: true },
    { kind: 'car', x: 560, y: 1010, variant: 2, collide: true },
    { kind: 'car', x: 1500, y: 1010, variant: 1, collide: true },
    { kind: 'car', x: 1660, y: 1010, variant: 0, collide: true },
    { kind: 'car', x: 2000, y: 1010, variant: 3, collide: true },
    { kind: 'car', x: 2160, y: 1330, variant: 2, collide: true },
    { kind: 'crate', x: 1960, y: 1320, collide: true },
    { kind: 'crate', x: 2010, y: 1330, collide: true },
    { kind: 'pipe', x: 1900, y: 1420, dir: 'h', length: 300, collide: false },
    { kind: 'grate', x: 1180, y: 1120, collide: false },
    { kind: 'grate', x: 820, y: 900, collide: false },
    { kind: 'puddle', x: 600, y: 1080, collide: false },
    { kind: 'puddle', x: 1560, y: 900, collide: false },
    { kind: 'sign', x: 1120, y: 780, collide: false },
    { kind: 'pole', x: 1100, y: 1050, collide: false },
    { kind: 'bush', x: 520, y: 400, collide: false },
    { kind: 'bush', x: 760, y: 1090, collide: false },
    { kind: 'bush', x: 1480, y: 1090, collide: false },
    { kind: 'pigeon', x: 660, y: 790, collide: false },
    { kind: 'pigeon', x: 690, y: 810, collide: false },
    { kind: 'pigeon', x: 1420, y: 1060, collide: false }
  ],

  interactables: [
    { id: 'dumpster_yard_1', kind: 'dumpster', x: 460, y: 720, label: 'Мусорный контейнер', lootTable: 'dumpster_residential' },
    { id: 'dumpster_yard_2', kind: 'dumpster', x: 520, y: 720, label: 'Мусорный контейнер', lootTable: 'dumpster_residential' },
    { id: 'dumpster_south', kind: 'dumpster', x: 1020, y: 1330, label: 'Мусорный контейнер', lootTable: 'dumpster_residential' },
    { id: 'dumpster_garage', kind: 'dumpster', x: 1860, y: 1330, label: 'Контейнер у гаражей', lootTable: 'industrial_container' },
    { id: 'dumpster_shops', kind: 'dumpster', x: 1340, y: 720, label: 'Контейнер у магазинов', lootTable: 'dumpster_residential' },
    { id: 'bin_1', kind: 'bin', x: 1080, y: 800, label: 'Урна', lootTable: 'street_bin' },
    { id: 'bin_2', kind: 'bin', x: 1300, y: 1000, label: 'Урна', lootTable: 'street_bin' },
    { id: 'bin_3', kind: 'bin', x: 260, y: 1000, label: 'Урна', lootTable: 'street_bin' },
    { id: 'bin_4', kind: 'bin', x: 1700, y: 800, label: 'Урна', lootTable: 'street_bin' },

    { id: 'bench_yard', kind: 'bench', x: 700, y: 745, label: 'Лавочка', sleepSpotId: 'bench' },
    { id: 'bench_yard_2', kind: 'bench', x: 880, y: 745, label: 'Лавочка', sleepSpotId: 'bench' },
    { id: 'bench_shops', kind: 'bench', x: 1500, y: 470, label: 'Лавочка', sleepSpotId: 'bench' },
    { id: 'cardboard_spot', kind: 'sleep', x: 640, y: 700, label: 'Картон у стены', sleepSpotId: 'cardboard' },

    { id: 'door_grocery', kind: 'shop', x: 1540, y: 715, label: 'Продукты «Свет»', shopId: 'grocery' },
    { id: 'door_pawn', kind: 'shop', x: 1860, y: 715, label: 'Ломбард Бориса', shopId: 'pawn' },
    { id: 'door_clothes', kind: 'shop', x: 340, y: 1635, label: 'Секонд-хенд «Второй шанс»', shopId: 'clothes' },
    { id: 'door_hardware', kind: 'shop', x: 685, y: 1635, label: 'Хозтовары', shopId: 'hardware' },

    { id: 'job_board', kind: 'job', x: 900, y: 1010, label: 'Доска подработок' },
    { id: 'housing_office', kind: 'home', x: 1550, y: 1635, label: 'Жилищная контора' },
    { id: 'business_spot', kind: 'business', x: 1320, y: 1010, label: 'Свободная точка под бизнес' },
    { id: 'atm_1', kind: 'atm', x: 1700, y: 715, label: 'Банкомат' },
    { id: 'casino_door', kind: 'casino', x: 2040, y: 1645, label: 'Клуб удачи' },

    {
      id: 'stash_garages',
      kind: 'stash',
      x: 2240, y: 1300,
      label: 'Щель между гаражами',
      lootTable: 'stash_yard'
    },
    {
      id: 'stash_dom3',
      kind: 'stash',
      x: 160, y: 700,
      label: 'Дыра в стене дома 3',
      lootTable: 'stash_yard',
      conditions: { periods: ['NIGHT', 'LATE_NIGHT'] },
      lockedText: 'Днём тут постоянно кто-то ходит. Ночью — другое дело.'
    },
    {
      id: 'anomaly_spot',
      kind: 'stash',
      x: 1180, y: 1120,
      label: 'Решётка ливнёвки',
      lootTable: 'late_night_anomaly',
      conditions: { periods: ['LATE_NIGHT'] },
      lockedText: 'Обычная решётка. Ничего интересного. Днём.'
    },
    {
      id: 'transit_market',
      kind: 'transit',
      x: 960, y: 1010,
      label: 'Остановка → Рынок',
      targetDistrict: 'market',
      conditions: { minLevel: 4 },
      lockedText: 'Водитель качает головой: «На рынок ездят те, кому есть чем торговать». Нужен 4-й уровень.'
    },
    {
      id: 'strange_door',
      kind: 'door',
      x: 300, y: 700,
      label: 'Дверь подъезда дома 3',
      conditions: { hasItem: { id: 'strange_key' }, periods: ['LATE_NIGHT'] },
      lockedText: 'Заперто. Замок странный: под него нужен странный ключ.',
      data: { flag: 'usedStrangeKey' }
    }
  ],

  npcs: [
    { npcId: 'grisha', x: 780, y: 700 },
    {
      npcId: 'zina',
      x: 620, y: 620,
      route: [
        { x: 620, y: 620 },
        { x: 980, y: 720 },
        { x: 980, y: 1000 },
        { x: 620, y: 1000 }
      ]
    },
    { npcId: 'boris', x: 1880, y: 730 },
    { npcId: 'luda', x: 1560, y: 730 },
    { npcId: 'artur', x: 1240, y: 1050 },
    {
      npcId: 'valera',
      x: 660, y: 800,
      route: [
        { x: 660, y: 800 },
        { x: 740, y: 860 },
        { x: 600, y: 880 }
      ]
    }
  ]
};
