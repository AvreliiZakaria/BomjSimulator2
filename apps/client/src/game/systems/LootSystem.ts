import { GameConfig } from '../config/GameConfig.js';
import { chance, pickWeighted, randInt } from '../core/rng.js';
import { getLootTable } from '../../data/loot.js';
import { requireItem } from '../../data/items.js';
import type { LootEntry } from '../../types/items.js';
import type { GameContext } from '../state/GameContext.js';

export interface LootResult {
  itemId?: string;
  name: string;
  count: number;
  money?: number;
  rarity?: string;
}

export class LootSystem {
  constructor(private readonly ctx: GameContext) {}

  /** Крутит таблицу и сразу выдаёт результат игроку. */
  roll(tableId: string): LootResult[] {
    const table = getLootTable(tableId);
    if (!table) return [];

    const player = this.ctx.player;
    const luck = player.skill('luck');
    const survival = player.skill('survival');
    const lateNight = this.ctx.time.snapshot.isLateNight;

    const bonus =
      player.searchBonus +
      (survival - 1) * GameConfig.progression.skillBonus.survivalLoot +
      (lateNight ? GameConfig.loot.lateNightAnomalyBonus : 0);

    const emptyChance = Math.max(0, table.emptyChance - bonus * 0.5);
    if (chance(emptyChance)) return [];

    const rolls = randInt(table.rolls[0], table.rolls[1]) + (chance(bonus) ? 1 : 0);
    const pool = table.entries.filter((entry) => {
      if (entry.lateNightOnly && !lateNight) return false;
      if (entry.minLuck && luck < entry.minLuck) return false;
      return true;
    });

    const results: LootResult[] = [];

    for (let i = 0; i < rolls; i += 1) {
      const entry = pickWeighted<LootEntry>(pool, (candidate) => {
        const rare = candidate.minLuck ?? 0;
        const luckBoost = 1 + rare * (luck - 1) * GameConfig.progression.skillBonus.luckRare;
        return candidate.weight * luckBoost;
      });
      if (!entry) continue;

      if (entry.money) {
        const amount = randInt(entry.money[0], entry.money[1]);
        player.addCash(amount, 'loot');
        results.push({ name: 'Деньги', count: 1, money: amount });
        continue;
      }

      if (!entry.itemId) continue;
      const count = entry.count ? randInt(entry.count[0], entry.count[1]) : 1;
      const added = this.ctx.inventory.add(entry.itemId, count);
      const item = requireItem(entry.itemId);
      if (added.added > 0) {
        results.push({ itemId: entry.itemId, name: item.name, count: added.added, rarity: item.rarity });
        if (item.tags.includes('collection')) this.ctx.player.addCollection(entry.itemId);
      } else {
        results.push({ itemId: entry.itemId, name: `${item.name} (не унести)`, count: 0, rarity: item.rarity });
      }
    }

    if (results.length) {
      player.addSkillXp('survival', 6);
      player.addXp(4);
    }
    return results;
  }
}
