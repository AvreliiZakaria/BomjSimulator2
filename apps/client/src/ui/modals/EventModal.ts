import { evaluateCondition } from '../../game/systems/Conditions.js';
import { Modal } from '../Modal.js';
import { el, onTap } from '../dom.js';
import type { RandomEventDefinition } from '../../types/events.js';
import type { GameContext } from '../../game/state/GameContext.js';

/** Окно случайного события. Решения имеют последствия, иногда отложенные. */
export function showEvent(parent: HTMLElement, ctx: GameContext, event: RandomEventDefinition): Modal {
  const modal = new Modal(parent, {
    title: event.title.toUpperCase(),
    subtitle: event.weird ? 'После трёх' : undefined,
    size: 'narrow',
    closable: false,
    inputMode: 'DIALOGUE'
  });

  const text = el('div', { class: 'modal__text', text: event.text });
  if (event.weird) text.classList.add('weird');

  const choices = el('div', { class: 'list' });
  choices.style.marginTop = '16px';

  for (const choice of event.choices) {
    const allowed = evaluateCondition(ctx, choice.conditions);
    const button = el('button', {
      class: allowed ? 'row row--clickable' : 'row row--locked',
      style: 'text-align:left'
    }, [
      el('div', { class: 'row__main' }, [
        el('div', { class: 'row__title', text: choice.text }),
        !allowed && choice.lockedHint ? el('div', { class: 'row__desc', text: choice.lockedHint }) : null
      ])
    ]);

    if (allowed) {
      onTap(button, () => {
        const result = ctx.events.resolve(event, choice);
        showResult(result);
      });
    }
    choices.append(button);
  }

  const showResult = (result: string): void => {
    const resultNode = el('div', { class: event.weird ? 'modal__text weird' : 'modal__text', text: result });
    modal.setContent(text, resultNode);
    modal.setFooter(modal.button('ДАЛЬШЕ', () => modal.close(), 'primary'));
  };

  modal.setContent(text, choices);
  modal.setFooter();
  return modal;
}
