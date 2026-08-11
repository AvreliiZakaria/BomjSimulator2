/**
 * Монетизация. Правила жёсткие и зашиты в код:
 * — никакого pay-to-win;
 * — не продаём игровые рубли, влияющие на рейтинг богатства, казино и основной прогресс;
 * — только косметика, декор, питомцы, эмоции, сезонные наборы, отключение рекламы.
 *
 * Реальная платёжная интеграция и реклама не выдуманы: без ключей провайдера
 * сервис честно сообщает, что покупки недоступны.
 */

export type CosmeticKind = 'clothing' | 'skin' | 'decor' | 'pet' | 'emote' | 'seasonal' | 'utility';

export interface CosmeticProduct {
  id: string;
  name: string;
  description: string;
  kind: CosmeticKind;
  /** Цена в условных единицах магазина. Отображается, но не списывается без провайдера. */
  price: number;
}

export const COSMETICS: CosmeticProduct[] = [
  { id: 'skin_neon', name: 'Неоновая куртка', description: 'Светится в темноте. На тепло не влияет.', kind: 'clothing', price: 149 },
  { id: 'skin_classic', name: 'Классический образ', description: 'Другой набор цветов персонажа.', kind: 'skin', price: 99 },
  { id: 'decor_poster', name: 'Плакат «НУЛЬ»', description: 'Декор для жилья.', kind: 'decor', price: 79 },
  { id: 'decor_lamp', name: 'Ламповая лампа', description: 'Тёплый свет в комнате. Только внешний вид.', kind: 'decor', price: 89 },
  { id: 'pet_pigeon', name: 'Питомец: голубь', description: 'Ходит за тобой. Не Валера. Похож.', kind: 'pet', price: 199 },
  { id: 'emote_pack', name: 'Набор эмоций', description: 'Шесть жестов персонажа.', kind: 'emote', price: 119 },
  { id: 'season_winter', name: 'Зимний сезонный набор', description: 'Косметика сезона.', kind: 'seasonal', price: 249 },
  { id: 'no_ads', name: 'Отключить рекламу', description: 'Убирает необязательные рекламные предложения навсегда.', kind: 'utility', price: 299 }
];

export interface PurchaseResult {
  ok: boolean;
  reason?: string;
}

class MonetizationServiceImpl {
  /** Ключи провайдера не заданы — значит покупок нет. Никаких заглушек «как будто купил». */
  get isConfigured(): boolean {
    return false;
  }

  get adsConfigured(): boolean {
    return false;
  }

  catalog(): CosmeticProduct[] {
    return COSMETICS;
  }

  /** Проверка того, что товар не влияет на баланс игры. */
  isPayToWin(product: CosmeticProduct): boolean {
    return product.kind !== 'clothing' && product.kind !== 'skin' && product.kind !== 'decor' &&
      product.kind !== 'pet' && product.kind !== 'emote' && product.kind !== 'seasonal' &&
      product.kind !== 'utility';
  }

  async purchase(product: CosmeticProduct): Promise<PurchaseResult> {
    if (this.isPayToWin(product)) {
      return { ok: false, reason: 'Такой товар нарушал бы правило «никакого pay-to-win».' };
    }
    if (!this.isConfigured) {
      return { ok: false, reason: 'Платежи не подключены в этой сборке.' };
    }
    return { ok: false, reason: 'Провайдер не ответил.' };
  }

  async showRewardedAd(): Promise<PurchaseResult> {
    if (!this.adsConfigured) {
      return { ok: false, reason: 'Реклама не подключена в этой сборке.' };
    }
    return { ok: false, reason: 'Нет доступных роликов.' };
  }
}

export const Monetization = new MonetizationServiceImpl();
