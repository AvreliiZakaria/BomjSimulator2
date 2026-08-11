import { GameConfig } from '../../game/config/GameConfig.js';
import { SLEEP_LABELS, type SleepQuality } from '../../game/systems/SleepSystem.js';
import { Modal } from '../Modal.js';
import { el, onTap } from '../dom.js';
import type { GameContext } from '../../game/state/GameContext.js';

/** Место для сна: качество, риск и выбор длительности. */
export function showSleep(
  parent: HTMLElement,
  ctx: GameContext,
  quality: SleepQuality,
  onRest: (minutes: number) => void
): Modal {
  const factor = GameConfig.sleep.quality[quality] ?? 0.5;
  const risk = GameConfig.sleep.risk[quality] ?? 0;
  const untilMorning = ctx.sleep.hoursUntilMorning();

  const modal = new Modal(parent, {
    title: SLEEP_LABELS[quality].toUpperCase(),
    subtitle: 'Качество сна ' + Math.round(factor * 100) + '%',
    size: 'narrow'
  });

  const info = el('div', {}, [
    el('div', { class: 'kv' }, [el('span', { text: 'Восстановление' }), el('span', { text: Math.round(factor * 100) + '%' })]),
    el('div', { class: 'kv' }, [
      el('span', { text: 'Риск неприятностей' }),
      el('span', { class: risk > 0.2 ? 'bad' : risk > 0 ? '' : 'good', text: Math.round(risk * 100) + '%' })
    ]),
    el('div', { class: 'kv' }, [el('span', { text: 'Сейчас' }), el('span', { text: ctx.time.snapshot.clock })])
  ]);

  const buttons = el('div', { class: 'list' });
  buttons.style.marginTop = '14px';

  const option = (label: string, description: string, handler: () => void): HTMLElement => {
    const row = el('button', { class: 'row row--clickable', style: 'text-align:left' }, [
      el('div', { class: 'row__main' }, [
        el('div', { class: 'row__title', text: label }),
        el('div', { class: 'row__desc', text: description })
      ])
    ]);
    onTap(row, handler);
    return row;
  };

  buttons.append(
    option('Посидеть час', 'Немного бодрости, время идёт', () => {
      modal.close();
      onRest(60);
      ctx.ui.toast('Час прошёл. Стало чуть легче.', 'neutral');
    }),
    option('Поспать 4 часа', 'Короткий сон', () => {
      modal.close();
      ctx.sleep.sleep(quality, 4);
    }),
    option('Спать до утра (' + untilMorning + ' ч)', 'Полноценный отдых до 07:00', () => {
      modal.close();
      ctx.sleep.sleep(quality, untilMorning);
    })
  );

  modal.setContent(info, buttons);
  modal.setFooter(modal.button('ОТМЕНА', () => modal.close(), 'ghost'));
  return modal;
}
