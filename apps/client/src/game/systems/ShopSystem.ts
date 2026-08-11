import { chance, randInt, shuffle } from '../core/rng.js';
import { evaluateCondition } from './Conditions.js';
import type { InventoryStack } from '../../types/items.js';
import type { ShopDefinition } from '../../types/npc.js';
import type { GameContext } from '../state/GameContext.js';

/**
 * Ассортимент магазина на текущий игровой день.
 * Предложения меняются: часть позиций выпадает случайно, редкие — по условиям.
 */
export function shopStock(ctx: GameContext, shop: ShopDefinition): InventoryStack[] {
  const day = ctx.time.snapshot.day;
  const store = ctx.player.data.shopStock;

  if (ctx.player.data.shopDay !== day) {
    ctx.player.data.shopDay = day;
    ctx.player.data.shopStock = {};
  }

  const existing = store[shop.id];
  if (existing) return existing;

  const available = shop.offers.filter((offer) => {
    if (offer.conditions && !evaluateCondition(ctx, offer.conditions)) return false;
    if (offer.chance !== undefined && !chance(offer.chance)) return false;
    return true;
  });

  const limited = shop.dailySlots ? shuffle(available).slice(0, shop.dailySlots) : available;
  const stock: InventoryStack[] = limited.map((offer) => ({
    itemId: offer.itemId,
    count: offer.stock ?? randInt(1, 3)
  }));

  ctx.player.data.shopStock[shop.id] = stock;
  return stock;
}

export function isShopOpen(ctx: GameContext, shop: ShopDefinition): boolean {
  const hour = ctx.time.snapshot.hour;
  const [from, to] = shop.openHours;
  return from <= to ? hour >= from && hour < to : hour >= from || hour < to;
}

export function takeFromStock(ctx: GameContext, shopId: string, itemId: string, count = 1): void {
  const stock = ctx.player.data.shopStock[shopId];
  if (!stock) return;
  const entry = stock.find((item) => item.itemId === itemId);
  if (!entry) return;
  entry.count -= count;
  if (entry.count <= 0) stock.splice(stock.indexOf(entry), 1);
}

/** Множитель цены конкретной позиции (у ломбарда цены пляшут). */
export function offerPriceMul(shop: ShopDefinition, itemId: string): number {
  const offer = shop.offers.find((entry) => entry.itemId === itemId);
  return offer?.priceMul ?? 1;
}
