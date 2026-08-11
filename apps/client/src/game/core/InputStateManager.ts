import { bus } from './EventBus.js';

export type InputMode = 'GAMEPLAY' | 'MODAL' | 'PAUSED' | 'SITTING' | 'TRANSITION' | 'DIALOGUE';

/**
 * Единственный источник правды по тому, что игрок сейчас может делать.
 * Никаких параллельных isLocked/canMove/isModal — только этот стек.
 */
class InputStateManagerImpl {
  private stack: InputMode[] = ['GAMEPLAY'];

  get mode(): InputMode {
    return this.stack[this.stack.length - 1] ?? 'GAMEPLAY';
  }

  /** Может ли игрок ходить. */
  get canMove(): boolean {
    return this.mode === 'GAMEPLAY';
  }

  /** Может ли игрок жать E / тапать контекстную кнопку. */
  get canInteract(): boolean {
    return this.mode === 'GAMEPLAY' || this.mode === 'SITTING';
  }

  /** Идёт ли игровое время. */
  get timeFlows(): boolean {
    return this.mode !== 'PAUSED' && this.mode !== 'TRANSITION';
  }

  get isBlocking(): boolean {
    return this.mode === 'MODAL' || this.mode === 'PAUSED' || this.mode === 'DIALOGUE';
  }

  push(mode: InputMode): void {
    const previous = this.mode;
    this.stack.push(mode);
    if (previous !== mode) bus.emit('input:mode', { mode, previous });
  }

  /** Снимает конкретный режим (безопасно, если его уже нет). */
  pop(mode?: InputMode): void {
    const previous = this.mode;
    if (this.stack.length <= 1) return;
    if (mode) {
      const index = this.stack.lastIndexOf(mode);
      if (index > 0) this.stack.splice(index, 1);
    } else {
      this.stack.pop();
    }
    if (this.stack.length === 0) this.stack.push('GAMEPLAY');
    if (previous !== this.mode) bus.emit('input:mode', { mode: this.mode, previous });
  }

  replaceTop(mode: InputMode): void {
    const previous = this.mode;
    this.stack[this.stack.length - 1] = mode;
    if (previous !== mode) bus.emit('input:mode', { mode, previous });
  }

  has(mode: InputMode): boolean {
    return this.stack.includes(mode);
  }

  /**
   * Полный сброс. Вызывается при входе в GameScene и выходе в меню,
   * чтобы управление гарантированно восстанавливалось после любого модального окна.
   */
  reset(mode: InputMode = 'GAMEPLAY'): void {
    const previous = this.mode;
    this.stack = [mode];
    if (previous !== mode) bus.emit('input:mode', { mode, previous });
  }
}

export const InputState = new InputStateManagerImpl();
