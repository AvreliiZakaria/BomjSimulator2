import { GameConfig } from '../config/GameConfig.js';
import { clamp } from '../core/rng.js';
import { requireItem } from '../../data/items.js';
import type { ShopDefinition } from '../../types/npc.js';
import type { GameContext } from '../state/GameContext.js';

/**
 * Все денежные операции проходят здесь, но состояние денег живёт в PlayerState.
 * Экономика только считает цены и вызывает addCash/spendCash.
 */
export class EconomyService {
  constructor(private readonly ctx: GameContext) {}

  /** Цена покупки игроком. */
  buyPrice(shop: ShopDefinition, itemId: string, priceMul = 1): number {
    const base = requireItem(itemId).basePrice;
    const trade = clamp(this.ctx.player.tradeBonus, 0, 0.35);
    return Math.max(1, Math.round(base * shop.buyMul * priceMul * (1 - trade * 0.5)));
  }

  /** Цена выкупа у игрока. */
  sellPrice(shop: ShopDefinition, itemId: string): number {
    const item = requireItem(itemId);
    const trade = clamp(this.ctx.player.tradeBonus, 0, 0.5);
    return Math.max(1, Math.round(item.basePrice * shop.sellMul * (1 + trade)));
  }

  buysCategory(shop: ShopDefinition, itemId: string): boolean {
    return shop.buysCategories.includes(requireItem(itemId).category) || shop.buysCategories.includes('*');
  }

  buy(shop: ShopDefinition, itemId: string, count = 1, priceMul = 1): { ok: boolean; reason?: string } {
    const price = this.buyPrice(shop, itemId, priceMul) * count;
    if (!this.ctx.player.canAfford(price)) return { ok: false, reason: 'Не хватает денег' };
    if (this.ctx.inventory.fits(itemId) < count) return { ok: false, reason: 'Слишком тяжело, не унесёшь' };

    this.ctx.player.spendCash(price, `buy:${itemId}`);
    this.ctx.inventory.add(itemId, count);
    this.ctx.player.addSkillXp('trade', 5 * count);
    this.ctx.player.addXp(2);
    this.ctx.quests.notify('interact', `buy:${itemId}`, count);
    this.ctx.save(true);
    return { ok: true };
  }

  sell(shop: ShopDefinition, itemId: string, count = 1): { ok: boolean; reason?: string; earned?: number } {
    if (!this.buysCategory(shop, itemId)) return { ok: false, reason: 'Такое здесь не берут' };
    if (!this.ctx.inventory.has(itemId, count)) return { ok: false, reason: 'Нечего продавать' };

    const earned = this.sellPrice(shop, itemId) * count;
    this.ctx.inventory.remove(itemId, count);
    this.ctx.player.addCash(earned, `sell:${itemId}`);
    this.ctx.player.addSkillXp('trade', 6 * count);
    this.ctx.player.addXp(3);
    this.ctx.player.setFlag('hasEarned', 1);
    this.ctx.quests.notify('money', 'earn', earned);
    this.ctx.achievements.check();
    this.ctx.save(true);
    return { ok: true, earned };
  }

  /** Открытие банковского счёта. */
  openBank(): { ok: boolean; reason?: string } {
    const p = this.ctx.player;
    if (p.data.bankUnlocked) return { ok: true };
    if (p.data.level < GameConfig.economy.bankUnlockLevel) {
      return { ok: false, reason: `Нужен ${GameConfig.economy.bankUnlockLevel}-й уровень` };
    }
    if (!p.spendCash(GameConfig.economy.bankUnlockFee, 'bank:open')) {
      return { ok: false, reason: `Нужно ${GameConfig.economy.bankUnlockFee} ₽ на открытие счёта` };
    }
    p.data.bankUnlocked = true;
    this.ctx.save(true);
    return { ok: true };
  }
}
