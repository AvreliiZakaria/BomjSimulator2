import { Modal } from '../Modal.js';
import { showSettings } from './SettingsModal.js';
import { el, onTap } from '../dom.js';

export interface PauseActions {
  onResume(): void;
  onInventory(): void;
  onCharacter(): void;
  onMap(): void;
  onAchievements(): void;
  onMainMenu(): void;
}

/** Пауза: игровое время стоит, пока окно открыто. */
export function showPause(parent: HTMLElement, actions: PauseActions): Modal {
  const modal = new Modal(parent, {
    title: 'ПАУЗА',
    size: 'narrow',
    inputMode: 'PAUSED',
    onClose: () => actions.onResume()
  });

  const item = (label: string, handler: () => void): HTMLElement => {
    const row = el('button', { class: 'row row--clickable', style: 'text-align:left' }, [
      el('div', { class: 'row__main' }, [el('div', { class: 'row__title', text: label })])
    ]);
    onTap(row, handler);
    return row;
  };

  modal.setContent(
    el('div', { class: 'list' }, [
      item('Продолжить', () => modal.close()),
      item('Инвентарь', () => {
        modal.close();
        actions.onInventory();
      }),
      item('Персонаж', () => {
        modal.close();
        actions.onCharacter();
      }),
      item('Карта', () => {
        modal.close();
        actions.onMap();
      }),
      item('Достижения', () => {
        modal.close();
        actions.onAchievements();
      }),
      item('Настройки', () => showSettings(parent)),
      item('Выйти в главное меню', () => {
        modal.close();
        actions.onMainMenu();
      })
    ])
  );

  modal.setFooter(modal.button('ПРОДОЛЖИТЬ', () => modal.close(), 'primary'));
  return modal;
}
