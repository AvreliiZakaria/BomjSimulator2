type Attrs = Record<string, string | number | boolean | undefined>;

/** Микро-хелпер вместо фреймворка: UI игры — это DOM поверх канваса. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: (Node | string | null | undefined)[] = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (key === 'class') node.className = String(value);
    else if (key === 'html') node.innerHTML = String(value);
    else if (key === 'text') node.textContent = String(value);
    else if (key === 'value' && node instanceof HTMLInputElement) node.value = String(value);
    else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, String(value));
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

export function clear(node: Element): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function onTap(node: HTMLElement, handler: (event: Event) => void): void {
  node.addEventListener('click', (event) => {
    event.preventDefault();
    handler(event);
  });
}

export function uiRoot(): HTMLElement {
  const root = document.getElementById('ui-root');
  if (!root) throw new Error('#ui-root не найден');
  return root;
}

export const isMobileLayout = (): boolean => window.innerWidth < 900;
