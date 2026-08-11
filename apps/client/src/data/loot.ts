import type { LootTable } from '../types/items.js';

/**
 * Таблицы лута. Движок ничего не знает про конкретные предметы —
 * только крутит веса и отдаёт результат.
 */
const TABLES: LootTable[] = [
  {
    id: 'dumpster_residential',
    rolls: [1, 2],
    emptyChance: 0.22,
    entries: [
      { itemId: 'plastic_bottle', count: [1, 3], weight: 34 },
      { itemId: 'can_empty', count: [1, 3], weight: 26 },
      { itemId: 'cardboard_sheet', count: [1, 2], weight: 20 },
      { itemId: 'old_newspaper', count: [1, 2], weight: 16 },
      { itemId: 'dirty_rag', weight: 14 },
      { itemId: 'glass_jar', weight: 12 },
      { itemId: 'bread_half', weight: 11 },
      { itemId: 'yogurt_expired', weight: 10 },
      { money: [3, 14], weight: 9 },
      { itemId: 'broken_toy', weight: 8 },
      { itemId: 'scrap_metal', weight: 7 },
      { itemId: 'battery', weight: 6 },
      { itemId: 'canned_food', weight: 5 },
      { itemId: 'bent_fork', weight: 5 },
      { itemId: 'old_jacket', weight: 3, minLuck: 2 },
      { itemId: 'plastic_bag', weight: 3 },
      { itemId: 'copper_wire', weight: 2, minLuck: 3 },
      { itemId: 'broken_smartphone', weight: 1.5, minLuck: 4 },
      { itemId: 'strange_key', weight: 0.8, lateNightOnly: true },
      { itemId: 'wet_photo', weight: 0.7, lateNightOnly: true }
    ]
  },
  {
    id: 'street_bin',
    rolls: [1, 1],
    emptyChance: 0.34,
    entries: [
      { itemId: 'plastic_bottle', count: [1, 2], weight: 40 },
      { itemId: 'can_empty', count: [1, 2], weight: 30 },
      { itemId: 'old_newspaper', weight: 18 },
      { itemId: 'dirty_rag', weight: 12 },
      { money: [2, 9], weight: 10 },
      { itemId: 'apple', weight: 7 },
      { itemId: 'bread_half', weight: 6 },
      { itemId: 'battery', weight: 5 },
      { itemId: 'badge_star', weight: 1.2, minLuck: 3 },
      { itemId: 'black_feather', weight: 0.9, lateNightOnly: true }
    ]
  },
  {
    id: 'stash_yard',
    rolls: [1, 2],
    emptyChance: 0.1,
    entries: [
      { money: [15, 60], weight: 26 },
      { itemId: 'canned_food', count: [1, 2], weight: 20 },
      { itemId: 'scrap_metal', count: [1, 2], weight: 16 },
      { itemId: 'copper_wire', weight: 12 },
      { itemId: 'water_bottle', weight: 12 },
      { itemId: 'old_backpack', weight: 8 },
      { itemId: 'flashlight', weight: 6 },
      { itemId: 'silver_chain', weight: 3, minLuck: 3 },
      { itemId: 'coin_collection', weight: 2.5, minLuck: 4 },
      { itemId: 'gold_ring', weight: 1, minLuck: 6 },
      { itemId: 'tape_city', weight: 2 },
      { itemId: 'humming_battery', weight: 1.5, lateNightOnly: true }
    ]
  },
  {
    id: 'industrial_container',
    rolls: [2, 3],
    emptyChance: 0.15,
    entries: [
      { itemId: 'scrap_metal', count: [1, 3], weight: 34 },
      { itemId: 'copper_wire', count: [1, 2], weight: 22 },
      { itemId: 'battery', count: [1, 4], weight: 18 },
      { itemId: 'phone_parts', weight: 12 },
      { itemId: 'cardboard_sheet', count: [1, 3], weight: 12 },
      { money: [10, 45], weight: 10 },
      { itemId: 'multitool', weight: 2, minLuck: 4 },
      { itemId: 'magnet_stick', weight: 3 },
      { itemId: 'ticket_0347', weight: 0.6, lateNightOnly: true }
    ]
  },
  {
    id: 'late_night_anomaly',
    rolls: [1, 1],
    emptyChance: 0.35,
    entries: [
      { itemId: 'wet_photo', weight: 24 },
      { itemId: 'black_feather', weight: 22 },
      { itemId: 'humming_battery', weight: 18 },
      { itemId: 'strange_key', weight: 10 },
      { itemId: 'ticket_0347', weight: 6 },
      { money: [30, 120], weight: 14 },
      { itemId: 'tape_city', weight: 8 }
    ]
  },
  {
    id: 'pockets',
    rolls: [1, 1],
    emptyChance: 0.4,
    entries: [
      { money: [5, 25], weight: 45 },
      { itemId: 'bread_half', weight: 14 },
      { itemId: 'battery', weight: 12 },
      { itemId: 'badge_star', weight: 5 },
      { itemId: 'photo_yard', weight: 5 }
    ]
  }
];

export const LOOT_TABLES: Record<string, LootTable> = Object.fromEntries(
  TABLES.map((table) => [table.id, table])
);

export function getLootTable(id: string): LootTable | undefined {
  return LOOT_TABLES[id];
}
