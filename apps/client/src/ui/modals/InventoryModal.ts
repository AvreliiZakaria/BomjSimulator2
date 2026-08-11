import { formatMoney, formatWeight } from '../../game/core/format.js';
import { requireItem } from '../../data/items.js';
import { CATEGORY_LABELS, EQUIP_SLOT_LABELS, RARITY_COLORS, RARITY_LABELS } from '../../types/items.js';
import { Modal } from '../Modal.js';
import { iconFor } from '../Icons.js';
import { el, onTap } from '../dom.js';
import type { EquipSlot, ItemCategory } from '../../types/items.js';
import type { GameContext } from '../../game/state/GameContext.js';

const TABS: { id: ItemCategory | 'all' | 'equipment'; label: string }[] = [
  { id: 'all', label: 'Всё' },
  { id: 'food', label: 'Еда' },
  { id: 'clothing', label: 'Одежда' },
  { id: 'material', label: 'Материалы' },
  { id: 'valuable', label: 'Ценности' },
  { id: 'anomaly', label: 'Странное' },
  { id: 'trash', label: 'Мусор' },
  { id: 'equipment', label: 'Экипировка' }
];

const SLOTS: EquipSlot[] = ['head', 'top', 'bottom', 'shoes', 'backpack', 'accessory', 'tool'];

export function showInventory(parent: HTMLElement, ctx: GameContext, onEat?: () => void): Modal {
  let tab: (typeof TABS)[number]['id'] = 'all';

  const modal = new Modal(parent, {
    title: 'РЮКЗАК',
    subtitle: 'Всё, что ты таскаешь на себе',
    size: 'wide'
  });

  const render = (): void => {
    const p = ctx.player;
    const weight = p.carriedWeight;
    const capacity = p.capacity;
    const overweight = weight > capacity;

    const tabsRow = el('div', { class: 'tabs' });
    for (const entry of TABS) {
      const button = el('button', {
        class: entry.id === tab ? 'tab tab--active' : 'tab',
        text: entry.label
      });
      onTap(button, () => {
        tab = entry.id;
        render();
      });
      tabsRow.append(button);
    }

    const header = el('div', { class: 'kv' }, [
      el('span', { text: 'Вес' }),
      el('span', {
        class: overweight ? 'bad' : '',
        text: formatWeight(weight) + ' / ' + formatWeight(capacity)
      })
    ]);

    const list = el('div', { class: 'list' });

    if (tab === 'equipment') {
      for (const slot of SLOTS) {
        const itemId = p.equipped(slot);
        const item = itemId ? requireItem(itemId) : null;
        const row = el('div', { class: 'row' }, [
          el('div', { class: 'row__icon', html: iconFor(item?.icon ?? 'box') }),
          el('div', { class: 'row__main' }, [
            el('div', { class: 'row__title', text: item ? item.name : 'Пусто' }),
            el('div', { class: 'row__desc', text: EQUIP_SLOT_LABELS[slot] })
          ]),
          el('div', { class: 'row__side' }, item ? [makeButton('Снять', () => {
            ctx.inventory.unequip(slot);
            render();
          })] : [])
        ]);
        list.append(row);
      }
    } else {
      const stacks = p.inventory.filter((stack) => {
        if (tab === 'all') return true;
        return requireItem(stack.itemId).category === tab;
      });

      if (!stacks.length) {
        list.append(el('div', { class: 'muted', text: 'Пусто. Город ждёт.' }));
      }

      for (const stack of stacks) {
        const item = requireItem(stack.itemId);
        const actions = el('div', { class: 'row__side' });

        if (item.consumable) {
          actions.append(
            makeButton('Съесть', () => {
              ctx.inventory.use(stack.itemId);
              onEat?.();
              render();
            }, 'primary')
          );
        }
        if (item.slot) {
          actions.append(
            makeButton('Надеть', () => {
              ctx.inventory.equip(stack.itemId);
              render();
            })
          );
        }
        actions.append(
          makeButton('✕', () => {
            ctx.inventory.drop(stack.itemId, 1);
            render();
          }, 'danger')
        );

        const rarity = el('span', { class: 'tag', text: RARITY_LABELS[item.rarity] });
        rarity.style.color = RARITY_COLORS[item.rarity];

        list.append(
          el('div', { class: 'row' }, [
            el('div', { class: 'row__icon', html: iconFor(item.icon) }),
            el('div', { class: 'row__main' }, [
              el('div', { class: 'row__title' }, [
                el('span', { text: item.name + (stack.count > 1 ? ' ×' + stack.count : '') }),
                rarity
              ]),
              el('div', {
                class: 'row__desc',
                text:
                  item.description +
                  ' · ' +
                  formatWeight(item.weight * stack.count) +
                  ' · ' +
                  formatMoney(item.basePrice)
              })
            ]),
            actions
          ])
        );
      }
    }

    modal.setContent(tabsRow, header, list);
  };

  const makeButton = (
    label: string,
    handler: () => void,
    variant: 'primary' | 'danger' | '' = ''
  ): HTMLButtonElement => {
    const cls = 'btn btn--small' + (variant ? ' btn--' + variant : '');
    const button = el('button', { class: cls, text: label });
    onTap(button, handler);
    return button;
  };

  modal.setFooter(
    modal.button('СОРТИРОВАТЬ', () => {
      ctx.inventory.sort();
      render();
    }, 'ghost'),
    modal.button('ЗАКРЫТЬ', () => modal.close())
  );

  render();
  return modal;
}
