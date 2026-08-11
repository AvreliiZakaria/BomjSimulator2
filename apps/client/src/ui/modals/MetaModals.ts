import { Monetization } from '../../game/services/MonetizationService.js';
import { NEWS } from '../../data/news.js';
import { Modal } from '../Modal.js';
import { el, onTap } from '../dom.js';

/** Магазин косметики: ничего, что влияет на прогресс, рейтинг или казино. */
export function showStore(parent: HTMLElement): Modal {
  const modal = new Modal(parent, {
    title: 'МАГАЗИН',
    subtitle: 'Только внешний вид. Прогресс не продаётся.'
  });

  const list = el('div', { class: 'list' });
  for (const product of Monetization.catalog()) {
    const button = el('button', { class: 'btn btn--small', text: String(product.price) });
    onTap(button, () => {
      void Monetization.purchase(product).then((result) => {
        void messageInline(parent, product.name, result.reason ?? 'Готово');
      });
    });

    list.append(
      el('div', { class: 'row' }, [
        el('div', { class: 'row__main' }, [
          el('div', { class: 'row__title', text: product.name }),
          el('div', { class: 'row__desc', text: product.description })
        ]),
        el('div', { class: 'row__side' }, [button])
      ])
    );
  }

  modal.setContent(
    el('div', {
      class: 'modal__text muted',
      text: Monetization.isConfigured
        ? 'Покупки доступны.'
        : 'Платежи в этой сборке не подключены: витрина показана, но купить ничего нельзя.'
    }),
    list
  );
  modal.setFooter(modal.button('ЗАКРЫТЬ', () => modal.close(), 'primary'));
  return modal;
}

export function showNews(parent: HTMLElement): Modal {
  const modal = new Modal(parent, { title: 'НОВОСТИ', subtitle: 'Что изменилось в городе' });
  const list = el('div', { class: 'list' });
  for (const entry of NEWS) {
    list.append(
      el('div', { class: 'row' }, [
        el('div', { class: 'row__main' }, [
          el('div', { class: 'row__title' }, [
            el('span', { text: entry.title }),
            el('span', { class: 'tag', text: entry.date })
          ]),
          el('div', { class: 'row__desc', text: entry.text })
        ])
      ])
    );
  }
  modal.setContent(list);
  modal.setFooter(modal.button('ЗАКРЫТЬ', () => modal.close(), 'primary'));
  return modal;
}

function messageInline(parent: HTMLElement, title: string, text: string): Promise<void> {
  return new Promise((resolve) => {
    const modal = new Modal(parent, { title: title.toUpperCase(), size: 'narrow', onClose: () => resolve() });
    modal.setContent(el('div', { class: 'modal__text', text }));
    modal.setFooter(modal.button('ОК', () => modal.close(), 'primary'));
  });
}
