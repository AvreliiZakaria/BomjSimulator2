import { GameConfig } from '../../game/config/GameConfig.js';
import { formatMoney } from '../../game/core/format.js';
import { SaveService } from '../../game/services/SaveService.js';
import { el, onTap } from '../dom.js';

export interface MainMenuActions {
  onContinue(): void;
  onNewGame(): void;
  onCharacter(): void;
  onLeaderboard(): void;
  onCollection(): void;
  onShop(): void;
  onNews(): void;
  onSettings(): void;
}

/** Главное меню поверх анимированного города. Часы 02:47 — атмосферная деталь. */
export class MainMenuUi {
  private root: HTMLElement;

  constructor(parent: HTMLElement, actions: MainMenuActions) {
    const meta = SaveService.meta();

    const continueBtn = el('button', {
      class: 'btn btn--primary',
      text: meta ? 'ПРОДОЛЖИТЬ · День ' + meta.day + ' · ' + formatMoney(meta.cash) : 'ПРОДОЛЖИТЬ'
    });
    if (!meta) continueBtn.setAttribute('disabled', '');
    onTap(continueBtn, () => {
      if (!continueBtn.hasAttribute('disabled')) actions.onContinue();
    });

    const list = el('div', { class: 'menu__buttons' }, [continueBtn]);

    const entries: [string, () => void][] = [
      ['НОВАЯ ИГРА', actions.onNewGame],
      ['ПЕРСОНАЖ', actions.onCharacter],
      ['РЕЙТИНГ', actions.onLeaderboard],
      ['КОЛЛЕКЦИЯ', actions.onCollection],
      ['МАГАЗИН', actions.onShop],
      ['НОВОСТИ', actions.onNews],
      ['НАСТРОЙКИ', actions.onSettings]
    ];

    for (const entry of entries) {
      const button = el('button', { class: 'btn', text: entry[0] });
      onTap(button, entry[1]);
      list.append(button);
    }

    this.root = el('div', { class: 'menu' }, [
      el('div', { class: 'menu__clock', text: '02:47' }),
      el('div', { class: 'menu__logo', text: GameConfig.title }),
      el('div', { class: 'menu__slogan', text: GameConfig.slogan }),
      list,
      el('div', { class: 'menu__version', text: 'v' + GameConfig.version })
    ]);
    parent.append(this.root);
  }

  setVisible(visible: boolean): void {
    this.root.style.display = visible ? 'flex' : 'none';
  }

  destroy(): void {
    this.root.remove();
  }
}
