import { GameConfig } from '../game/config/GameConfig.js';
import { el } from './dom.js';

export class ToastStack {
  private root: HTMLElement;

  constructor(parent: HTMLElement) {
    this.root = el('div', { class: 'toasts' });
    parent.append(this.root);
  }

  push(text: string, tone: 'good' | 'bad' | 'neutral' | 'weird' = 'neutral'): void {
    const node = el('div', { class: `toast toast--${tone}`, text });
    this.root.append(node);
    // Больше пяти сообщений на экране — визуальный шум.
    while (this.root.children.length > 5) this.root.firstElementChild?.remove();
    window.setTimeout(() => {
      node.style.transition = 'opacity .3s ease, transform .3s ease';
      node.style.opacity = '0';
      node.style.transform = 'translateX(12px)';
      window.setTimeout(() => node.remove(), 320);
    }, GameConfig.ui.toastMs);
  }
}
