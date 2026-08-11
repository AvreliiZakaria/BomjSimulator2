import { formatDuration, formatMoney } from '../../game/core/format.js';
import { Modal } from '../Modal.js';
import { el, onTap } from '../dom.js';
import type { GameContext } from '../../game/state/GameContext.js';

/** Биржа подработок района: время смены, оплата, требования. */
export function showJobs(parent: HTMLElement, ctx: GameContext, districtId: string): Modal {
  const modal = new Modal(parent, {
    title: 'ДОСКА ПОДРАБОТОК',
    subtitle: 'Работа занимает игровое время и силы',
    size: 'wide'
  });

  const render = (): void => {
    const list = el('div', { class: 'list' });
    const jobs = ctx.jobs.listFor(districtId);

    if (!jobs.length) list.append(el('div', { class: 'muted', text: 'Здесь ничего не предлагают.' }));

    for (const entry of jobs) {
      const job = entry.job;
      const pay = formatMoney(job.payMin) + ' – ' + formatMoney(job.payMax);

      const button = el('button', {
        class: entry.available ? 'btn btn--small btn--primary' : 'btn btn--small',
        text: entry.available ? 'РАБОТАТЬ' : 'НЕЛЬЗЯ'
      });
      if (!entry.available) button.setAttribute('disabled', '');
      else {
        onTap(button, () => {
          const result = ctx.jobs.work(job.id);
          if (!result.ok) {
            ctx.ui.toast(result.reason ?? 'Не вышло', 'bad');
          } else {
            ctx.ui.toast('Смена закрыта: +' + formatMoney(result.earned ?? 0), 'good');
          }
          render();
        });
      }

      list.append(
        el('div', { class: entry.available ? 'row' : 'row row--locked' }, [
          el('div', { class: 'row__main' }, [
            el('div', { class: 'row__title' }, [
              el('span', { text: job.name }),
              el('span', { class: 'tag', text: formatDuration(job.durationMinutes) })
            ]),
            el('div', { class: 'row__desc', text: job.description }),
            el('div', {
              class: entry.available ? 'row__desc accent' : 'row__desc bad',
              text: entry.available ? pay : entry.reason ?? 'Недоступно'
            })
          ]),
          el('div', { class: 'row__side' }, [button])
        ])
      );
    }

    modal.setContent(list);
  };

  modal.setFooter(modal.button('ЗАКРЫТЬ', () => modal.close()));
  render();
  return modal;
}
