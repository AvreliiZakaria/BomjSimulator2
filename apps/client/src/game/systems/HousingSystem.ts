import { HOUSING, HOUSING_UPGRADES, getHousing } from '../../data/housing.js';
import { evaluateCondition, describeCondition } from './Conditions.js';
import { requireItem } from '../../data/items.js';
import type { SleepQuality } from './SleepSystem.js';
import type { GameContext } from '../state/GameContext.js';

export class HousingSystem {
  constructor(private readonly ctx: GameContext) {}

  get current() {
    return getHousing(this.ctx.player.data.housing.id);
  }

  /** Качество сна с учётом улучшений. */
  get sleepQuality(): SleepQuality {
    return this.current?.quality ?? 'ground';
  }

  get storageCapacity(): number {
    const base = this.current?.storage ?? 0;
    const bonus = this.ctx.player.data.housing.upgrades.reduce((sum, id) => {
      const upgrade = HOUSING_UPGRADES.find((entry) => entry.id === id);
      return sum + (upgrade?.storageBonus ?? 0);
    }, 0);
    return base + bonus;
  }

  get hasSafe(): boolean {
    return this.ctx.player.data.housing.upgrades.includes('safe');
  }

  canTake(housingId: string): { ok: boolean; reason?: string } {
    const housing = HOUSING[housingId];
    if (!housing) return { ok: false, reason: 'Такого жилья нет' };
    if (!evaluateCondition(this.ctx, housing.conditions)) {
      return { ok: false, reason: housing.lockedText ?? describeCondition(housing.conditions) };
    }
    return { ok: true };
  }

  /** Снять жильё: платим за первые 7 дней вперёд. */
  rent(housingId: string, days = 7): { ok: boolean; reason?: string } {
    const check = this.canTake(housingId);
    if (!check.ok) return check;
    const housing = HOUSING[housingId]!;
    if (housing.rentPerDay <= 0) return { ok: false, reason: 'Это жильё только покупается' };

    const total = housing.rentPerDay * days;
    if (!this.ctx.player.spendCash(total, `rent:${housingId}`)) {
      return { ok: false, reason: `Нужно ${total} ₽ за ${days} дней вперёд` };
    }

    const state = this.ctx.player.data.housing;
    if (state.id !== housingId) {
      state.id = housingId;
      state.upgrades = [];
    }
    state.paidUntilDay = Math.max(state.paidUntilDay, this.ctx.time.snapshot.day) + days;
    this.afterMove(housingId);
    return { ok: true };
  }

  buy(housingId: string): { ok: boolean; reason?: string } {
    const check = this.canTake(housingId);
    if (!check.ok) return check;
    const housing = HOUSING[housingId]!;
    if (!housing.buyPrice) return { ok: false, reason: 'Это жильё только в аренду' };
    if (!this.ctx.player.spendCash(housing.buyPrice, `buy:${housingId}`)) {
      return { ok: false, reason: 'Не хватает денег' };
    }
    const state = this.ctx.player.data.housing;
    state.id = housingId;
    state.paidUntilDay = 99999;
    this.ctx.player.setFlag(`owns:${housingId}`, 1);
    this.afterMove(housingId);
    return { ok: true };
  }

  private afterMove(housingId: string): void {
    const housing = HOUSING[housingId]!;
    if (housing.tier >= 4) this.ctx.player.setFlag('hasRoom', 1);
    this.ctx.player.changeReputation('city', 3);
    this.ctx.quests.notify('interact', `housing:${housingId}`, 1);
    this.ctx.achievements.check();
    this.ctx.ui.toast(`Теперь у тебя есть: ${housing.name}`, 'good');
    this.ctx.save(true);
  }

  buyUpgrade(upgradeId: string): { ok: boolean; reason?: string } {
    const upgrade = HOUSING_UPGRADES.find((entry) => entry.id === upgradeId);
    const housing = this.current;
    if (!upgrade) return { ok: false, reason: 'Нет такого улучшения' };
    if (!housing) return { ok: false, reason: 'Сначала нужно жильё' };
    if (upgrade.requiresTier && housing.tier < upgrade.requiresTier) {
      return { ok: false, reason: 'Для этого нужно жильё получше' };
    }
    if (this.ctx.player.data.housing.upgrades.includes(upgradeId)) {
      return { ok: false, reason: 'Уже стоит' };
    }
    if (!this.ctx.player.spendCash(upgrade.price, `upgrade:${upgradeId}`)) {
      return { ok: false, reason: 'Не хватает денег' };
    }
    this.ctx.player.data.housing.upgrades.push(upgradeId);
    this.ctx.save(true);
    return { ok: true };
  }

  /** Списание аренды в начале игрового дня. */
  dailyTick(): void {
    const state = this.ctx.player.data.housing;
    const housing = this.current;
    if (!housing || housing.rentPerDay <= 0) return;
    const day = this.ctx.time.snapshot.day;
    if (day <= state.paidUntilDay) return;

    if (this.ctx.player.spendCash(housing.rentPerDay, 'rent')) {
      state.paidUntilDay = day;
      this.ctx.ui.toast(`Аренда: -${housing.rentPerDay} ₽`, 'neutral');
    } else {
      state.id = null;
      state.storage = [];
      this.ctx.player.changeReputation('city', -5);
      void this.ctx.ui.message('Тебя выселили', 'Аренда не оплачена. Вещи со склада пропали, ты снова на улице.');
    }
  }

  /** Положить вещь на домашний склад. */
  store(itemId: string, count = 1): boolean {
    if (!this.current) return false;
    if (!this.ctx.inventory.has(itemId, count)) return false;
    const weight = requireItem(itemId).weight * count;
    if (this.storedWeight + weight > this.storageCapacity) return false;
    this.ctx.inventory.remove(itemId, count);
    const storage = this.ctx.player.data.housing.storage;
    const stack = storage.find((entry) => entry.itemId === itemId);
    if (stack) stack.count += count;
    else storage.push({ itemId, count });
    this.ctx.markDirty();
    return true;
  }

  take(itemId: string, count = 1): boolean {
    const storage = this.ctx.player.data.housing.storage;
    const stack = storage.find((entry) => entry.itemId === itemId);
    if (!stack || stack.count < count) return false;
    const result = this.ctx.inventory.add(itemId, count);
    if (result.added <= 0) return false;
    stack.count -= result.added;
    if (stack.count <= 0) storage.splice(storage.indexOf(stack), 1);
    this.ctx.markDirty();
    return true;
  }

  get storedWeight(): number {
    return this.ctx.player.data.housing.storage.reduce(
      (sum, stack) => sum + requireItem(stack.itemId).weight * stack.count,
      0
    );
  }
}
