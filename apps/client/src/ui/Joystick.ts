import { GameConfig } from '../game/config/GameConfig.js';
import { VirtualInput } from '../game/core/VirtualInput.js';
import { Settings } from '../game/services/SettingsService.js';
import { el } from './dom.js';

/** Мобильное управление: джойстик слева, контекстная кнопка справа. */
export class Joystick {
  private root: HTMLElement;
  private knob: HTMLElement;
  private actionButton: HTMLButtonElement;
  private pointerId: number | null = null;
  private center = { x: 0, y: 0 };

  constructor(parent: HTMLElement) {
    this.knob = el('div', { class: 'joystick__knob' });
    this.root = el('div', { class: 'joystick' }, [this.knob]);
    this.actionButton = el('button', { class: 'action-btn', text: 'ДЕЙСТВИЕ' });

    parent.append(this.root, this.actionButton);

    this.root.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);

    this.actionButton.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      VirtualInput.pressAction();
    });

    this.applyVisibility();
    window.addEventListener('resize', () => this.applyVisibility());
  }

  applyVisibility(): void {
    this.root.style.display = Settings.wantsJoystick ? 'block' : 'none';
  }

  setActionLabel(label: string | null): void {
    if (label && Settings.wantsJoystick) {
      this.actionButton.textContent = label;
      this.actionButton.classList.add('action-btn--visible');
    } else {
      this.actionButton.classList.remove('action-btn--visible');
    }
  }

  setVisible(visible: boolean): void {
    this.root.style.visibility = visible ? 'visible' : 'hidden';
    if (!visible) this.actionButton.classList.remove('action-btn--visible');
  }

  private onDown = (event: PointerEvent): void => {
    event.preventDefault();
    this.pointerId = event.pointerId;
    const rect = this.root.getBoundingClientRect();
    this.center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    this.update(event.clientX, event.clientY);
  };

  private onMove = (event: PointerEvent): void => {
    if (this.pointerId !== event.pointerId) return;
    this.update(event.clientX, event.clientY);
  };

  private onUp = (event: PointerEvent): void => {
    if (this.pointerId !== event.pointerId) return;
    this.pointerId = null;
    this.knob.style.transform = 'translate(0px, 0px)';
    VirtualInput.set(0, 0);
  };

  private update(clientX: number, clientY: number): void {
    const radius = GameConfig.ui.joystickRadius;
    let dx = clientX - this.center.x;
    let dy = clientY - this.center.y;
    const distance = Math.hypot(dx, dy);
    if (distance > radius) {
      dx = (dx / distance) * radius;
      dy = (dy / distance) * radius;
    }
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    VirtualInput.set(dx / radius, dy / radius);
  }

  destroy(): void {
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    this.root.remove();
    this.actionButton.remove();
  }
}
