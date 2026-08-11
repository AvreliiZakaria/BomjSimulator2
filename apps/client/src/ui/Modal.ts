import { InputState } from '../game/core/InputStateManager.js';
import { clear, el, onTap } from './dom.js';

export interface ModalOptions {
  title: string;
  subtitle?: string;
  size?: 'narrow' | 'normal' | 'wide';
  closable?: boolean;
  /** Режим ввода, который держится, пока окно открыто. */
  inputMode?: 'MODAL' | 'DIALOGUE' | 'PAUSED';
  onClose?: () => void;
  bare?: boolean;
}

export class Modal {
  readonly layer: HTMLElement;
  readonly body: HTMLElement;
  readonly foot: HTMLElement;
  private readonly options: ModalOptions;
  private closed = false;

  constructor(parent: HTMLElement, options: ModalOptions) {
    this.options = options;
    const size = options.size ?? 'normal';

    this.body = el('div', { class: 'modal__body' });
    this.foot = el('div', { class: 'modal__foot' });

    const closeBtn = el('button', { class: 'modal__close', 'aria-label': 'Закрыть', text: '✕' });
    const head = el('div', { class: 'modal__head' }, [
      el('div', {}, [
        el('div', { class: 'modal__title', text: options.title }),
        options.subtitle ? el('div', { class: 'modal__subtitle', text: options.subtitle }) : null
      ]),
      options.closable === false ? null : closeBtn
    ]);

    const modalClass =
      'modal' + (size === 'wide' ? ' modal--wide' : size === 'narrow' ? ' modal--narrow' : '');
    const modal = el('div', { class: modalClass }, options.bare ? [this.body] : [head, this.body, this.foot]);

    this.layer = el('div', { class: 'modal-layer' }, [modal]);
    parent.append(this.layer);

    InputState.push(options.inputMode ?? 'MODAL');

    onTap(closeBtn, () => this.close());
    this.layer.addEventListener('mousedown', (event) => {
      if (event.target === this.layer && options.closable !== false) this.close();
    });
    document.addEventListener('keydown', this.handleKey);
  }

  private handleKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.options.closable !== false) {
      event.stopPropagation();
      this.close();
    }
  };

  setContent(...nodes: (Node | string)[]): void {
    clear(this.body);
    for (const node of nodes) this.body.append(node);
  }

  setFooter(...nodes: (Node | string)[]): void {
    clear(this.foot);
    for (const node of nodes) this.foot.append(node);
  }

  button(
    label: string,
    handler: () => void,
    variant: 'primary' | 'ghost' | 'danger' | '' = ''
  ): HTMLButtonElement {
    const button = el('button', { class: variant ? `btn btn--${variant}` : 'btn', text: label });
    onTap(button, handler);
    return button;
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    document.removeEventListener('keydown', this.handleKey);
    // Снимаем ровно свой режим: управление всегда возвращается игроку.
    InputState.pop(this.options.inputMode ?? 'MODAL');
    this.layer.remove();
    this.options.onClose?.();
  }

  get isClosed(): boolean {
    return this.closed;
  }
}
