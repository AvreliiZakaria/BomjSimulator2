import { bus } from '../core/EventBus.js';
import { chance, clamp } from '../core/rng.js';
import { requireItem } from '../../data/items.js';
import type { EquipSlot, InventoryStack } from '../../types/items.js';
import type { PlayerState } from '../state/PlayerState.js';
import type { GameContext } from '../state/GameContext.js';

export interface AddResult {
  added: number;
  overflow: number;
}

export class InventorySystem {
  constructor(private readonly ctx: GameContext) {}

  private get p(): PlayerState {
    return this.ctx.player;
  }

  get stacks(): InventoryStack[] {
    return this.p.data.inventory;
  }

  count(itemId: string): number {
    return this.stacks
      .filter((stack) => stack.itemId === itemId)
      .reduce((sum, stack) => sum + stack.count, 0);
  }

  has(itemId: string, count = 1): boolean {
    return this.count(itemId) >= count;
  }

  /** Сколько ещё штук этого предмета влезет по весу. */
  fits(itemId: string): number {
    const item = requireItem(itemId);
    if (item.weight <= 0) return 999;
    const free = this.p.capacity - this.p.carriedWeight;
    return Math.max(0, Math.floor(free / item.weight));
  }

  add(itemId: string, count = 1): AddResult {
    const item = requireItem(itemId);
    const allowed = Math.min(count, this.fits(itemId));
    let remaining = allowed;

    while (remaining > 0) {
      if (item.stackable) {
        const stack = this.stacks.find((entry) => entry.itemId === itemId && entry.count < item.maxStack);
        if (stack) {
          const room = item.maxStack - stack.count;
          const put = Math.min(room, remaining);
          stack.count += put;
          remaining -= put;
          continue;
        }
      }
      const put = item.stackable ? Math.min(item.maxStack, remaining) : 1;
      this.stacks.push({ itemId, count: put });
      remaining -= put;
    }

    if (allowed > 0) this.emit();
    this.ctx.quests.notify('collect', itemId, allowed);
    return { added: allowed, overflow: count - allowed };
  }

  remove(itemId: string, count = 1): boolean {
    if (this.count(itemId) < count) return false;
    let remaining = count;
    for (let i = this.stacks.length - 1; i >= 0 && remaining > 0; i -= 1) {
      const stack = this.stacks[i]!;
      if (stack.itemId !== itemId) continue;
      const take = Math.min(stack.count, remaining);
      stack.count -= take;
      remaining -= take;
      if (stack.count <= 0) this.stacks.splice(i, 1);
    }
    this.emit();
    return true;
  }

  drop(itemId: string, count = 1): void {
    if (this.remove(itemId, count)) {
      this.ctx.ui.toast(`Выброшено: ${requireItem(itemId).name}`, 'neutral');
    }
  }

  /** Использование предмета: еда, напитки, всё, что consumable. */
  use(itemId: string): boolean {
    const item = requireItem(itemId);
    if (!item.consumable || !this.has(itemId)) return false;
    const effects = item.effects ?? {};
    const spoiled = effects.spoilRisk ? chance(effects.spoilRisk) : false;

    const delta = {
      hunger: effects.hunger ?? 0,
      health: effects.health ?? 0,
      warmth: effects.warmth ?? 0,
      hygiene: effects.hygiene ?? 0,
      sanity: effects.sanity ?? 0,
      energy: effects.energy ?? 0
    };

    if (spoiled) {
      delta.hunger = Math.round(delta.hunger * 0.4);
      delta.health -= 6;
      delta.sanity -= 4;
    }

    this.p.modifyStats(delta);

    for (const roll of effects.statusChance ?? []) {
      const probability = spoiled ? Math.min(1, roll.chance * 1.8) : roll.chance;
      if (chance(probability)) {
        this.p.addStatus(roll.id);
        this.ctx.ui.toast(statusMessage(roll.id), 'bad');
      }
    }

    this.remove(itemId, 1);
    this.p.addSkillXp('survival', 4);
    this.ctx.quests.notify('eat', itemId, 1);
    this.ctx.ui.toast(
      spoiled ? `${item.name}: зря ты это съел` : `${item.name}: стало полегче`,
      spoiled ? 'bad' : 'good'
    );
    this.ctx.markDirty();
    return true;
  }

  equip(itemId: string): boolean {
    const item = requireItem(itemId);
    if (!item.slot || !this.has(itemId)) return false;
    const current = this.p.equipped(item.slot);
    if (current) {
      // Снятая вещь возвращается в инвентарь; если не влезает — всё равно отдаём (это уже наш вес).
      this.stacks.push({ itemId: current, count: 1 });
    }
    this.remove(itemId, 1);
    this.p.data.equipment[item.slot] = itemId;
    bus.emit('equipment:changed', undefined);
    this.emit();
    this.ctx.markDirty();
    return true;
  }

  unequip(slot: EquipSlot): boolean {
    const current = this.p.equipped(slot);
    if (!current) return false;
    this.p.data.equipment[slot] = null;
    this.stacks.push({ itemId: current, count: 1 });
    bus.emit('equipment:changed', undefined);
    this.emit();
    this.ctx.markDirty();
    return true;
  }

  sort(): void {
    const order = ['food', 'drink', 'valuable', 'anomaly', 'clothing', 'backpack', 'tool', 'material', 'collectible', 'quest', 'trash'];
    this.stacks.sort((a, b) => {
      const ia = order.indexOf(requireItem(a.itemId).category);
      const ib = order.indexOf(requireItem(b.itemId).category);
      if (ia !== ib) return ia - ib;
      return requireItem(b.itemId).basePrice - requireItem(a.itemId).basePrice;
    });
    this.emit();
  }

  /** Потеря части вещей при потере сознания. */
  loseRandom(fraction: number): void {
    const losable = this.stacks.filter((stack) => requireItem(stack.itemId).category !== 'quest');
    for (const stack of losable) {
      const lost = Math.floor(stack.count * clamp(fraction, 0, 1));
      if (lost > 0) this.remove(stack.itemId, lost);
    }
  }

  emit(): void {
    bus.emit('inventory:changed', { weight: this.p.carriedWeight, capacity: this.p.capacity });
  }
}

function statusMessage(id: string): string {
  switch (id) {
    case 'poison':
      return 'Живот скрутило. Отравление.';
    case 'cold':
      return 'Кажется, ты простыл.';
    case 'stress':
      return 'Нервы сдают.';
    case 'fatigue':
      return 'Усталость валит с ног.';
    default:
      return 'Стало хуже.';
  }
}
