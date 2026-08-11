import { formatMoney, formatWeight } from '../../game/core/format.js';
import { getShop } from '../../data/shops.js';
import { requireItem } from '../../data/items.js';
import { isShopOpen, offerPriceMul, shopStock, takeFromStock } from '../../game/systems/ShopSystem.js';
import { RARITY_COLORS } from '../../types/items.js';
import { Modal } from '../Modal.js';
import { iconFor } from '../Icons.js';
import { el, onTap } from '../dom.js';
import type { GameContext } from '../../game/state/GameContext.js';

export function showShop(parent: HTMLElement, ctx: GameContext, shopId: string): Modal | null {
  const shop = getShop(shopId);
  if (!shop) return null;

  let tab: 'buy' | 'sell' = 'buy';

  const modal = new Modal(parent, {
    title: shop.name.toUpperCase(),
    subtitle: isShopOpen(ctx, shop)
      ? 'Открыто до ' + shop.openHours[1] + ':00'
      : 'Закрыто. Работает с ' + shop.openHours[0] + ':00',
    size: 'wide'
  });

  const smallButton = (label: string, handler: () => void, primary = false): HTMLButtonElement => {
    const button = el('button', { class: primary ? 'btn btn--small btn--primary' : 'btn btn--small', text: label });
    onTap(button, handler);
    return button;
  };

  const render = (): void => {
    const open = isShopOpen(ctx, shop);

    const tabsRow = el('div', { class: 'tabs' }, [
      tabButton('Купить', 'buy'),
      tabButton('Продать', 'sell')
    ]);

    const balance = el('div', { class: 'kv' }, [
      el('span', { text: 'Наличные' }),
      el('span', { class: 'accent', text: formatMoney(ctx.player.cash) })
    ]);
    const weightRow = el('div', { class: 'kv' }, [
      el('span', { text: 'Свободный вес' }),
      el('span', { text: formatWeight(Math.max(0, ctx.player.capacity - ctx.player.carriedWeight)) })
    ]);

    const list = el('div', { class: 'list' });

    if (!open) {
      list.append(el('div', { class: 'muted', text: 'Сейчас закрыто. Приходи в рабочие часы.' }));
    } else if (tab === 'buy') {
      const stock = shopStock(ctx, shop);
      if (!stock.length) list.append(el('div', { class: 'muted', text: 'Сегодня пусто. Загляни завтра.' }));

      for (const entry of stock) {
        const item = requireItem(entry.itemId);
        const price = ctx.economy.buyPrice(shop, entry.itemId, offerPriceMul(shop, entry.itemId));
        const affordable = ctx.player.cash >= price;
        const fits = ctx.inventory.fits(entry.itemId) >= 1;

        const button = smallButton(formatMoney(price), () => {
          const result = ctx.economy.buy(shop, entry.itemId, 1, offerPriceMul(shop, entry.itemId));
          if (!result.ok) {
            ctx.ui.toast(result.reason ?? 'Не вышло', 'bad');
            return;
          }
          takeFromStock(ctx, shop.id, entry.itemId, 1);
          ctx.ui.toast('Куплено: ' + item.name, 'good');
          render();
        }, true);
        if (!affordable || !fits) button.setAttribute('disabled', '');

        list.append(itemRow(item.name, item.description, item.icon, item.rarity, entry.count, button, !affordable || !fits));
      }
    } else {
      const sellable = ctx.player.inventory.filter((stack) => ctx.economy.buysCategory(shop, stack.itemId));
      if (!sellable.length) {
        list.append(el('div', { class: 'muted', text: 'У тебя нет того, что здесь берут.' }));
      }

      for (const stack of sellable) {
        const item = requireItem(stack.itemId);
        const price = ctx.economy.sellPrice(shop, stack.itemId);

        const side = el('div', { class: 'row__side' }, [
          smallButton('+' + formatMoney(price), () => {
            const result = ctx.economy.sell(shop, stack.itemId, 1);
            if (!result.ok) ctx.ui.toast(result.reason ?? 'Не берут', 'bad');
            render();
          }, true),
          stack.count > 1
            ? smallButton('Всё ×' + stack.count, () => {
                const result = ctx.economy.sell(shop, stack.itemId, stack.count);
                if (result.ok) ctx.ui.toast('Продано на ' + formatMoney(result.earned ?? 0), 'good');
                render();
              })
            : null
        ].filter(Boolean) as HTMLElement[]);

        list.append(itemRow(item.name, item.description, item.icon, item.rarity, stack.count, side, false));
      }
    }

    modal.setContent(tabsRow, balance, weightRow, list);
  };

  const tabButton = (label: string, id: 'buy' | 'sell'): HTMLElement => {
    const button = el('button', { class: id === tab ? 'tab tab--active' : 'tab', text: label });
    onTap(button, () => {
      tab = id;
      render();
    });
    return button;
  };

  const itemRow = (
    name: string,
    description: string,
    icon: string,
    rarity: keyof typeof RARITY_COLORS,
    count: number,
    side: HTMLElement,
    dimmed: boolean
  ): HTMLElement => {
    const title = el('div', { class: 'row__title' }, [
      el('span', { text: name + (count > 1 ? ' ×' + count : '') })
    ]);
    const dot = el('span', { class: 'tag', text: '•' });
    dot.style.color = RARITY_COLORS[rarity];
    title.append(dot);

    return el('div', { class: dimmed ? 'row row--locked' : 'row' }, [
      el('div', { class: 'row__icon', html: iconFor(icon) }),
      el('div', { class: 'row__main' }, [title, el('div', { class: 'row__desc', text: description })]),
      side.classList.contains('row__side') ? side : el('div', { class: 'row__side' }, [side])
    ]);
  };

  modal.setFooter(modal.button('ЗАКРЫТЬ', () => modal.close()));
  render();
  return modal;
}
