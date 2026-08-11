import { formatMoney } from '../../game/core/format.js';
import { RARITY_COLORS } from '../../types/items.js';
import { Modal } from '../Modal.js';
import { el } from '../dom.js';

export function messageModal(
  parent: HTMLElement,
  title: string,
  text: string,
  okLabel = 'ПОНЯТНО'
): Promise<void> {
  return new Promise((resolve) => {
    const modal = new Modal(parent, {
      title: title.toUpperCase(),
      size: 'narrow',
      onClose: () => resolve()
    });
    modal.setContent(el('div', { class: 'modal__text', text }));
    modal.setFooter(modal.button(okLabel, () => modal.close(), 'primary'));
  });
}

export function confirmModal(
  parent: HTMLElement,
  title: string,
  text: string,
  okLabel = 'ДА'
): Promise<boolean> {
  return new Promise((resolve) => {
    let answer = false;
    const modal = new Modal(parent, {
      title: title.toUpperCase(),
      size: 'narrow',
      onClose: () => resolve(answer)
    });
    modal.setContent(el('div', { class: 'modal__text', text }));
    modal.setFooter(
      modal.button('ОТМЕНА', () => modal.close(), 'ghost'),
      modal.button(okLabel, () => {
        answer = true;
        modal.close();
      }, 'primary')
    );
  });
}

export interface LootLine {
  name: string;
  count: number;
  money?: number;
  rarity?: string;
}

/** Результат обыска: коротко и по делу. */
export function lootModal(parent: HTMLElement, results: LootLine[]): Modal {
  const modal = new Modal(parent, {
    title: results.length ? 'НАШЁЛ' : 'ПУСТО',
    size: 'narrow'
  });

  if (!results.length) {
    modal.setContent(el('div', { class: 'modal__text muted', text: 'Ничего. Бывает чаще, чем хотелось бы.' }));
  } else {
    const list = el('div', { class: 'list' });
    for (const line of results) {
      const title = el('div', { class: 'row__title' }, [
        el('span', { text: line.money ? 'Деньги' : line.name + (line.count > 1 ? ' ×' + line.count : '') })
      ]);
      if (line.rarity && RARITY_COLORS[line.rarity as keyof typeof RARITY_COLORS]) {
        const tag = el('span', { class: 'tag', text: '•' });
        tag.style.color = RARITY_COLORS[line.rarity as keyof typeof RARITY_COLORS];
        title.append(tag);
      }
      list.append(
        el('div', { class: 'row' }, [
          el('div', { class: 'row__main' }, [title]),
          el('div', { class: 'row__side' }, [
            line.money ? el('span', { class: 'accent', text: '+' + formatMoney(line.money) }) : null
          ].filter(Boolean) as HTMLElement[])
        ])
      );
    }
    modal.setContent(list);
  }

  modal.setFooter(modal.button('ЗАБРАТЬ', () => modal.close(), 'primary'));
  return modal;
}
