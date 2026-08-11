import { DEFAULT_APPEARANCE } from '../../game/state/PlayerState.js';
import { characterSvg } from '../CharacterSvg.js';
import { Modal } from '../Modal.js';
import { el, onTap } from '../dom.js';
import type { Appearance } from '../../types/player.js';

const SKINS = ['#f0cfae', '#e8bd97', '#d8a37a', '#c08a5e', '#a3714b', '#8a5a3a', '#6d452c'];
const HAIRS = ['#1a1a1d', '#2b2019', '#4a3526', '#6b5136', '#8d7a5f', '#b9b2a5', '#8a3f2c'];
const TOPS = ['#4a5a72', '#5a4636', '#3d5a4a', '#6a3f45', '#2f3742', '#7a6a55', '#8d5f2c'];
const BOTTOMS = ['#33384a', '#2b3038', '#3a3a44', '#4a4033', '#2f4033'];
const SHOES = ['#2b2b30', '#22242a', '#3a2f25', '#4a4a50'];

const HAIR_STYLES: { id: Appearance['hairStyle']; label: string }[] = [
  { id: 'short', label: 'Короткие' },
  { id: 'long', label: 'Длинные' },
  { id: 'bald', label: 'Лысый' },
  { id: 'cap', label: 'Кепка' },
  { id: 'beanie', label: 'Шапка' },
  { id: 'hood', label: 'Капюшон' }
];

const PRESETS: { id: string; name: string; appearance: Partial<Appearance> }[] = [
  { id: 'default', name: 'Обычный', appearance: {} },
  { id: 'street', name: 'Уличный', appearance: { hairStyle: 'hood', top: '#3a4048', bottom: '#2b3038', shoes: '#22242a', hair: '#2b2019' } },
  { id: 'worker', name: 'Работяга', appearance: { hairStyle: 'cap', top: '#5a4636', bottom: '#4a4033', shoes: '#3a2f25', hair: '#4a3526' } },
  { id: 'winter', name: 'Зимний', appearance: { hairStyle: 'beanie', top: '#2f4033', bottom: '#33384a', shoes: '#2b2b30', hair: '#6b5136' } }
];

/** Кириллица, латиница, цифры, пробел, дефис, подчёркивание. 2–16 символов. */
const NAME_PATTERN = /^[\p{L}\p{N} _-]{2,16}$/u;

export function showCharacterCreate(
  parent: HTMLElement,
  onDone: (nickname: string, appearance: Appearance) => void,
  onCancel: () => void
): void {
  const appearance: Appearance = { ...DEFAULT_APPEARANCE };
  let nickname = '';
  let submitted = false;

  const modal = new Modal(parent, {
    title: 'СОЗДАНИЕ ПЕРСОНАЖА',
    subtitle: 'Как тебя будут звать в этом городе',
    size: 'wide',
    onClose: () => {
      if (!submitted) onCancel();
    }
  });

  const preview = el('div', { class: 'creator__preview', html: characterSvg(appearance) });
  const redraw = (): void => {
    preview.innerHTML = characterSvg(appearance);
  };

  const nameInput = el('input', { type: 'text', maxlength: 16, placeholder: 'Например: Ноль' });
  const nameHint = el('div', {
    class: 'row__desc',
    text: '2–16 символов: буквы, цифры, пробел, дефис, подчёркивание'
  });

  const startBtn = modal.button('НАЧАТЬ', () => submit(), 'primary');
  startBtn.setAttribute('disabled', '');

  const validate = (): void => {
    nickname = nameInput.value.trim();
    const ok = NAME_PATTERN.test(nickname);
    if (ok) startBtn.removeAttribute('disabled');
    else startBtn.setAttribute('disabled', '');
    nameHint.classList.toggle('bad', Boolean(nickname) && !ok);
  };

  nameInput.addEventListener('input', validate);
  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !startBtn.hasAttribute('disabled')) submit();
  });

  const colorsHost = el('div');

  const swatchRow = (label: string, colors: string[], key: 'skin' | 'hair' | 'top' | 'bottom' | 'shoes'): HTMLElement => {
    const row = el('div', { class: 'swatches' });
    const paint = (): void => {
      for (const child of Array.from(row.children)) {
        const node = child as HTMLElement;
        node.classList.toggle('swatch--active', node.dataset.color === appearance[key]);
      }
    };
    for (const color of colors) {
      const swatch = el('div', { class: 'swatch' });
      swatch.style.background = color;
      swatch.dataset.color = color;
      onTap(swatch, () => {
        appearance[key] = color;
        paint();
        redraw();
      });
      row.append(swatch);
    }
    paint();
    return el('div', { class: 'field' }, [el('label', { text: label }), row]);
  };

  const rebuildColors = (): void => {
    colorsHost.innerHTML = '';
    colorsHost.append(
      swatchRow('Цвет кожи', SKINS, 'skin'),
      swatchRow('Волосы', HAIRS, 'hair'),
      swatchRow('Верх', TOPS, 'top'),
      swatchRow('Низ', BOTTOMS, 'bottom'),
      swatchRow('Обувь', SHOES, 'shoes')
    );
  };

  const presetRow = el('div', { class: 'tabs' });
  for (const preset of PRESETS) {
    const tab = el('button', { class: 'tab', text: preset.name });
    onTap(tab, () => {
      Object.assign(appearance, DEFAULT_APPEARANCE, preset.appearance, { preset: preset.id });
      for (const child of Array.from(presetRow.children)) child.classList.remove('tab--active');
      tab.classList.add('tab--active');
      redraw();
      rebuildColors();
      paintHair();
    });
    if (preset.id === 'default') tab.classList.add('tab--active');
    presetRow.append(tab);
  }

  const hairRow = el('div', { class: 'tabs' });
  const paintHair = (): void => {
    for (const child of Array.from(hairRow.children)) {
      const node = child as HTMLElement;
      node.classList.toggle('tab--active', node.dataset.style === appearance.hairStyle);
    }
  };
  for (const style of HAIR_STYLES) {
    const tab = el('button', { class: 'tab', text: style.label });
    tab.dataset.style = style.id;
    onTap(tab, () => {
      appearance.hairStyle = style.id;
      paintHair();
      redraw();
    });
    hairRow.append(tab);
  }

  rebuildColors();
  paintHair();

  const form = el('div', {}, [
    el('div', { class: 'field' }, [el('label', { text: 'Имя' }), nameInput, nameHint]),
    el('div', { class: 'field' }, [el('label', { text: 'Заготовка' }), presetRow]),
    el('div', { class: 'field' }, [el('label', { text: 'Причёска / головной убор' }), hairRow]),
    colorsHost
  ]);

  modal.setContent(el('div', { class: 'creator' }, [preview, form]));
  modal.setFooter(modal.button('НАЗАД', () => modal.close(), 'ghost'), startBtn);

  function submit(): void {
    if (!NAME_PATTERN.test(nickname)) return;
    submitted = true;
    modal.close();
    onDone(nickname, { ...appearance });
  }

  window.setTimeout(() => nameInput.focus(), 60);
}
