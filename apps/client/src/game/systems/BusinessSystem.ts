import { GameConfig } from '../config/GameConfig.js';
import { randFloat } from '../core/rng.js';
import { BUSINESS_TYPES, BUSINESS_TYPE_LIST, type BusinessType } from '../../data/businesses.js';
import { evaluateCondition, describeCondition } from './Conditions.js';
import type { BusinessState } from '../../types/player.js';
import type { GameContext } from '../state/GameContext.js';

/**
 * Понятная, не бухгалтерская модель: товар → спрос → выручка → расходы → прибыль.
 * Игрок закупает товар, нанимает людей и раз в день забирает прибыль.
 */
export class BusinessSystem {
  constructor(private readonly ctx: GameContext) {}

  get owned(): BusinessState[] {
    return this.ctx.player.data.businesses;
  }

  available(): { type: BusinessType; ok: boolean; reason?: string }[] {
    return BUSINESS_TYPE_LIST.map((type) => {
      if (!evaluateCondition(this.ctx, type.conditions)) {
        return { type, ok: false, reason: describeCondition(type.conditions) };
      }
      if (this.ctx.player.cash < type.price) return { type, ok: false, reason: 'Не хватает денег' };
      return { type, ok: true };
    });
  }

  open(typeId: string, name?: string): { ok: boolean; reason?: string } {
    const type = BUSINESS_TYPES[typeId];
    if (!type) return { ok: false, reason: 'Нет такого варианта' };
    if (!evaluateCondition(this.ctx, type.conditions)) {
      return { ok: false, reason: describeCondition(type.conditions) };
    }
    if (!this.ctx.player.spendCash(type.price, `business:${typeId}`)) {
      return { ok: false, reason: 'Не хватает денег' };
    }

    const business: BusinessState = {
      id: `${typeId}-${Date.now().toString(36)}`,
      typeId,
      name: name?.trim() || type.name,
      level: 1,
      stock: 0,
      employees: 0,
      pending: 0,
      openedDay: this.ctx.time.snapshot.day,
      lastTickDay: this.ctx.time.snapshot.day
    };
    this.owned.push(business);
    this.ctx.player.setFlag('hasBusiness', 1);
    this.ctx.player.changeReputation('business', 10);
    this.ctx.player.addXp(120);
    this.ctx.achievements.check();
    this.ctx.save(true);
    return { ok: true };
  }

  restock(businessId: string, units: number): { ok: boolean; reason?: string } {
    const business = this.owned.find((entry) => entry.id === businessId);
    if (!business) return { ok: false, reason: 'Бизнес не найден' };
    const type = BUSINESS_TYPES[business.typeId]!;
    const room = type.maxStock - business.stock;
    const amount = Math.max(0, Math.min(units, room));
    if (amount <= 0) return { ok: false, reason: 'Склад полон' };

    const cost = amount * GameConfig.business.stockUnitCost;
    if (!this.ctx.player.spendCash(cost, 'business:restock')) return { ok: false, reason: 'Не хватает денег' };
    business.stock += amount;
    this.ctx.save(true);
    return { ok: true };
  }

  hire(businessId: string): { ok: boolean; reason?: string } {
    const business = this.owned.find((entry) => entry.id === businessId);
    if (!business) return { ok: false, reason: 'Бизнес не найден' };
    const type = BUSINESS_TYPES[business.typeId]!;
    if (business.employees >= type.employeeSlots) return { ok: false, reason: 'Больше людей не нужно' };
    business.employees += 1;
    this.ctx.save(true);
    return { ok: true };
  }

  fire(businessId: string): void {
    const business = this.owned.find((entry) => entry.id === businessId);
    if (business && business.employees > 0) business.employees -= 1;
    this.ctx.markDirty();
  }

  upgrade(businessId: string): { ok: boolean; reason?: string } {
    const business = this.owned.find((entry) => entry.id === businessId);
    if (!business) return { ok: false, reason: 'Бизнес не найден' };
    const type = BUSINESS_TYPES[business.typeId]!;
    if (!type.upgradesTo) return { ok: false, reason: 'Расти уже некуда' };
    const next = BUSINESS_TYPES[type.upgradesTo]!;
    const price = Math.round((next.price - type.price) * 0.8);
    if (!evaluateCondition(this.ctx, next.conditions)) {
      return { ok: false, reason: describeCondition(next.conditions) };
    }
    if (!this.ctx.player.spendCash(price, 'business:upgrade')) {
      return { ok: false, reason: `Нужно ${price} ₽` };
    }
    business.typeId = next.id;
    business.level += 1;
    business.name = business.name === type.name ? next.name : business.name;
    this.ctx.player.changeReputation('business', 8);
    this.ctx.player.addXp(200);
    this.ctx.save(true);
    return { ok: true };
  }

  collect(businessId?: string): number {
    let total = 0;
    for (const business of this.owned) {
      if (businessId && business.id !== businessId) continue;
      total += Math.round(business.pending);
      business.pending = 0;
    }
    if (total > 0) {
      this.ctx.player.addCash(total, 'business:collect');
      this.ctx.player.addSkillXp('trade', 20);
      this.ctx.quests.notify('money', 'earn', total);
      this.ctx.achievements.check();
      this.ctx.save(true);
    }
    return total;
  }

  /** Ежедневный расчёт. Простая формула: продажи ограничены складом и спросом. */
  dailyTick(): void {
    const day = this.ctx.time.snapshot.day;
    const cfg = GameConfig.business;

    for (const business of this.owned) {
      const type = BUSINESS_TYPES[business.typeId];
      if (!type || business.lastTickDay >= day) continue;
      business.lastTickDay = day;

      const employeeBonus = 1 + business.employees * cfg.employeeRevenueBonus;
      const reputationBonus = 1 + this.ctx.player.getReputation('business') / 200;
      const demand = Math.floor(type.baseDemand * employeeBonus * reputationBonus * randFloat(0.8, 1.2));
      const sold = Math.min(business.stock, demand);
      business.stock -= sold;

      const revenue = sold * cfg.stockUnitRevenue;
      const expenses = revenue * cfg.baseExpenseRatio + type.upkeep + business.employees * cfg.employeeCostPerDay;
      const profit = Math.round(revenue - expenses);

      business.pending += profit;

      if (business.pending < 0) {
        // Убыток гасим из наличных, иначе долг копится и бизнес закрывается.
        const debt = Math.abs(Math.round(business.pending));
        if (this.ctx.player.spendCash(debt, 'business:loss')) {
          business.pending = 0;
          this.ctx.ui.toast(`${business.name}: убыток ${debt} ₽`, 'bad');
        } else if (business.pending < -type.upkeep * cfg.maxPendingDays) {
          this.ctx.ui.toast(`${business.name} закрылся из-за долгов`, 'bad');
          this.owned.splice(this.owned.indexOf(business), 1);
        }
      } else if (sold > 0) {
        this.ctx.ui.toast(`${business.name}: +${profit} ₽ к выручке`, 'good');
      } else if (business.stock <= 0) {
        this.ctx.ui.toast(`${business.name}: пустой склад, продавать нечего`, 'bad');
      }
    }
  }

  get dailyProfitEstimate(): number {
    const cfg = GameConfig.business;
    return this.owned.reduce((sum, business) => {
      const type = BUSINESS_TYPES[business.typeId];
      if (!type) return sum;
      const demand = type.baseDemand * (1 + business.employees * cfg.employeeRevenueBonus);
      const sold = Math.min(business.stock, demand);
      const revenue = sold * cfg.stockUnitRevenue;
      return sum + Math.round(revenue * (1 - cfg.baseExpenseRatio) - type.upkeep - business.employees * cfg.employeeCostPerDay);
    }, 0);
  }
}
