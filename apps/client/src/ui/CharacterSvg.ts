import type { Appearance } from '../types/player.js';

const darken = (hex: string, amount = 0.18): string => {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  if (!Number.isFinite(value)) return hex;
  const r = Math.max(0, Math.round(((value >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((value >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((value & 255) * (1 - amount)));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

function hairShape(appearance: Appearance): string {
  const hair = appearance.hair;
  switch (appearance.hairStyle) {
    case 'bald':
      return '';
    case 'long':
      return (
        '<path d="M38 34a22 22 0 0 1 44 0v34a10 10 0 0 1-10 8H48a10 10 0 0 1-10-8z" fill="' + hair + '"/>' +
        '<circle cx="60" cy="36" r="23" fill="' + hair + '"/>'
      );
    case 'cap':
      return (
        '<path d="M37 34a23 23 0 0 1 46 0v4H37z" fill="' + darken(hair, 0.35) + '"/>' +
        '<path d="M83 36h22v6H83z" fill="' + darken(hair, 0.45) + '"/>'
      );
    case 'beanie':
      return (
        '<path d="M36 36a24 24 0 0 1 48 0v6H36z" fill="' + darken(hair, 0.2) + '"/>' +
        '<rect x="34" y="40" width="52" height="10" rx="5" fill="' + darken(hair, 0.05) + '"/>'
      );
    case 'hood':
      return '<path d="M32 44a28 28 0 0 1 56 0v14c0 6-8 10-28 10s-28-4-28-10z" fill="' + darken(appearance.top, 0.28) + '"/>';
    case 'short':
    default:
      return '<path d="M38 36a22 22 0 0 1 44 0v6c-6-6-14-9-22-9s-16 3-22 9z" fill="' + hair + '"/>';
  }
}

/**
 * Векторный превью-персонаж для создания героя и профиля.
 * Те же параметры внешности, что и у внутриигрового спрайта.
 */
export function characterSvg(appearance: Appearance, size = 180): string {
  const skin = appearance.skin;
  const top = appearance.top;
  const bottom = appearance.bottom;
  const shoes = appearance.shoes;
  const height = Math.round(size * 1.8);

  return [
    '<svg viewBox="0 0 120 220" width="' + size + '" height="' + height + '" xmlns="http://www.w3.org/2000/svg">',
    '<ellipse cx="60" cy="208" rx="34" ry="9" fill="rgba(0,0,0,.35)"/>',
    '<rect x="44" y="150" width="14" height="50" rx="6" fill="' + bottom + '"/>',
    '<rect x="62" y="150" width="14" height="50" rx="6" fill="' + darken(bottom) + '"/>',
    '<rect x="38" y="192" width="24" height="12" rx="5" fill="' + shoes + '"/>',
    '<rect x="60" y="192" width="24" height="12" rx="5" fill="' + darken(shoes, 0.1) + '"/>',
    '<rect x="38" y="86" width="44" height="70" rx="14" fill="' + top + '"/>',
    '<rect x="38" y="86" width="12" height="70" rx="8" fill="' + darken(top, 0.22) + '"/>',
    '<rect x="26" y="92" width="13" height="48" rx="6" fill="' + top + '"/>',
    '<rect x="81" y="92" width="13" height="48" rx="6" fill="' + darken(top, 0.12) + '"/>',
    '<circle cx="32" cy="146" r="7" fill="' + skin + '"/>',
    '<circle cx="88" cy="146" r="7" fill="' + skin + '"/>',
    '<rect x="53" y="72" width="14" height="18" fill="' + darken(skin, 0.22) + '"/>',
    '<circle cx="60" cy="46" r="24" fill="' + skin + '"/>',
    '<circle cx="52" cy="44" r="2.6" fill="#1b1b1f"/>',
    '<circle cx="68" cy="44" r="2.6" fill="#1b1b1f"/>',
    '<path d="M53 56c4 3 10 3 14 0" stroke="' + darken(skin, 0.35) + '" stroke-width="2" fill="none" stroke-linecap="round"/>',
    hairShape(appearance),
    '</svg>'
  ].join('');
}
