/**
 * Состояние виртуального управления. Пишет сюда мобильный джойстик из DOM,
 * читает игровая сцена. Ни сцена не знает про DOM, ни DOM про сцену.
 */
export const VirtualInput = {
  x: 0,
  y: 0,
  /** Одноразовый флаг нажатия контекстной кнопки. */
  action: false,

  set(x: number, y: number): void {
    VirtualInput.x = x;
    VirtualInput.y = y;
  },

  reset(): void {
    VirtualInput.x = 0;
    VirtualInput.y = 0;
    VirtualInput.action = false;
  },

  pressAction(): void {
    VirtualInput.action = true;
  },

  consumeAction(): boolean {
    if (!VirtualInput.action) return false;
    VirtualInput.action = false;
    return true;
  }
};
