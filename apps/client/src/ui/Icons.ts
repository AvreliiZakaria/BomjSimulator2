/**
 * Оригинальные векторные иконки. Никаких эмодзи в качестве финальных иконок
 * и никаких чужих наборов — только собственные контуры.
 */
const svg = (paths: string): string =>
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%">' +
  paths +
  '</svg>';

export const StatIcons: Record<string, string> = {
  health: svg('<path d="M12 20s-7-4.4-7-9.3A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.7C19 15.6 12 20 12 20z"/>'),
  hunger: svg('<path d="M5 8h14l-1.4 11.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>'),
  warmth: svg('<path d="M12 21c3 0 5-2 5-4.6 0-3.6-3.6-4.4-2.6-9.4C11 8 8.5 10.6 8.5 14 7 13 6.6 11.5 6.6 11.5 6 12.6 7 14 7 16.4 7 19 9 21 12 21z"/>'),
  hygiene: svg('<path d="M12 3.5s5.5 6 5.5 9.6A5.5 5.5 0 0 1 12 19a5.5 5.5 0 0 1-5.5-5.9C6.5 9.5 12 3.5 12 3.5z"/>'),
  sanity: svg('<path d="M12 4a4 4 0 0 0-4 4c-1.6.6-2.5 2-2.5 3.6 0 1.4.7 2.6 1.8 3.3-.2 2 1.4 3.6 3.4 3.6 1 0 1.7-.4 2.3-1 .6.6 1.3 1 2.3 1 2 0 3.6-1.6 3.4-3.6a3.9 3.9 0 0 0 1.8-3.3c0-1.7-1-3-2.5-3.6a4 4 0 0 0-4-4z"/>'),
  energy: svg('<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>')
};

export const ItemIcons: Record<string, string> = {
  box: svg('<path d="M4 8 12 4l8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4"/><path d="M12 12v8"/>'),
  bread: svg('<path d="M4 12c0-3 3-5 8-5s8 2 8 5-2 6-8 6-8-3-8-6z"/><path d="M8 10c1 2 1 4 0 6"/>'),
  can: svg('<ellipse cx="12" cy="6" rx="6" ry="2.5"/><path d="M6 6v12c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6"/>'),
  bottle: svg('<path d="M10 3h4v3l2 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3z"/><path d="M8 13h8"/>'),
  cup: svg('<path d="M6 8h12l-1 10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M18 10h2a2 2 0 0 1 0 4h-2"/>'),
  bowl: svg('<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M8 8c0-1 1-2 2-2M13 8c0-1 1-2 2-2"/>'),
  noodles: svg('<path d="M5 9h14l-1.2 9.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M8 9c0-2 1-4 4-4s4 2 4 4"/>'),
  wrap: svg('<path d="M7 5h10l-2 15H9z"/><path d="M8 9h8M8.5 13h7"/>'),
  pizza: svg('<path d="M12 4 4 19l16-4z"/><circle cx="11" cy="13" r="1"/><circle cx="14" cy="16" r="1"/>'),
  apple: svg('<path d="M12 8c-3-2-7 0-7 4.5S9 21 12 21s7-4 7-8.5S15 6 12 8z"/><path d="M12 8V5c0-1 1-2 2-2"/>'),
  bar: svg('<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M10 4v16M14 4v16"/>'),
  skull: svg('<path d="M12 3a7 7 0 0 0-7 7v3l2 2v3h10v-3l2-2v-3a7 7 0 0 0-7-7z"/><circle cx="9.5" cy="11" r="1.4"/><circle cx="14.5" cy="11" r="1.4"/>'),
  scrap: svg('<path d="M4 16 9 6l5 6 3-4 3 8z"/>'),
  wire: svg('<path d="M4 16c3 0 3-8 6-8s3 8 6 8 4-4 4-4"/>'),
  battery: svg('<rect x="4" y="8" width="14" height="9" rx="2"/><path d="M18 11h2v3h-2"/><path d="M8 11v3M11 11v3"/>'),
  card: svg('<rect x="3" y="7" width="18" height="11" rx="2"/><path d="M3 12h18"/>'),
  jar: svg('<path d="M8 4h8v3l1 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9l1-2z"/><path d="M7 12h10"/>'),
  chip: svg('<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3"/>'),
  rag: svg('<path d="M5 8c4-3 10-3 14 0-1 5-3 9-7 12-4-3-6-7-7-12z"/>'),
  toy: svg('<circle cx="12" cy="9" r="4"/><path d="M8 20c0-3 2-5 4-5s4 2 4 5"/>'),
  paper: svg('<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4M8 12h8M8 16h6"/>'),
  fork: svg('<path d="M9 3v6a3 3 0 0 0 6 0V3"/><path d="M12 9v12"/>'),
  shirt: svg('<path d="M8 4 4 7l2 3 2-1v11h8V9l2 1 2-3-4-3-2 2h-4z"/>'),
  hoodie: svg('<path d="M8 4 4 8l2 3 2-1v10h8V10l2 1 2-3-4-4-4 3z"/><path d="M12 7v5"/>'),
  jacket: svg('<path d="M8 4 4 7v13h16V7l-4-3-4 3z"/><path d="M12 4v16"/>'),
  coat: svg('<path d="M8 4 5 7v14h14V7l-3-3-4 3z"/><path d="M12 7v14M9 12h1M15 12h1"/>'),
  suit: svg('<path d="M8 4 5 7v14h14V7l-3-3-4 4z"/><path d="m12 8-2 4 2 9 2-9z"/>'),
  pants: svg('<path d="M7 4h10l-1 16h-3l-1-8-1 8H8z"/>'),
  shoe: svg('<path d="M4 16h8l3-3 5 2v3H4z"/><path d="M4 14v2"/>'),
  hat: svg('<path d="M6 13a6 6 0 0 1 12 0z"/><path d="M3 14h18"/>'),
  glove: svg('<path d="M8 20V9a1.5 1.5 0 0 1 3 0V4.5a1.5 1.5 0 0 1 3 0V9l2 1v10z"/>'),
  scarf: svg('<path d="M6 6c3 3 9 3 12 0"/><path d="M8 8v10l2-2 2 2V8"/>'),
  watch: svg('<circle cx="12" cy="12" r="5"/><path d="M9 7 8 3h8l-1 4M9 17l-1 4h8l-1-4"/>'),
  bag: svg('<path d="M6 8h12l1 12H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  backpack: svg('<path d="M6 9a6 6 0 0 1 12 0v11H6z"/><path d="M9 9V7a3 3 0 0 1 6 0v2M8 14h8"/>'),
  tool: svg('<path d="M14 6a4 4 0 0 0 5 5l-9 9-4-4 9-9z"/><path d="M6 20 4 18"/>'),
  lamp: svg('<path d="M8 4h8l2 7H6z"/><path d="M12 11v6M9 20h6"/>'),
  phone: svg('<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>'),
  ring: svg('<circle cx="12" cy="14" r="5"/><path d="m9 6 3-3 3 3-3 3z"/>'),
  coin: svg('<circle cx="12" cy="12" r="7"/><path d="M12 8v8M10 10h3a2 2 0 0 1 0 4h-3"/>'),
  camera: svg('<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 7l1.5-2h5L16 7"/>'),
  key: svg('<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M15 12v2"/>'),
  ticket: svg('<path d="M4 8h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/><path d="M12 8v10"/>'),
  feather: svg('<path d="M18 5c-6 0-11 5-11 11l-2 3 3-2c6 0 11-5 11-11z"/><path d="M8 16 17 7"/>'),
  badge: svg('<circle cx="12" cy="10" r="5"/><path d="m9 14-1 7 4-2 4 2-1-7"/>'),
  tape: svg('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/>'),
  photo: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m5 16 4-4 3 3 3-4 4 5"/>'),
  seed: svg('<path d="M12 4c4 2 6 5 6 9a6 6 0 0 1-12 0c0-4 2-7 6-9z"/><path d="M12 9v8"/>'),
  pigeon: svg('<path d="M4 14c3-1 5-4 8-4s5 2 8 1c-1 4-4 7-8 7-3 0-6-2-8-4z"/><circle cx="17" cy="9" r="1"/>')
};

export const UiIcons: Record<string, string> = {
  map: svg('<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>'),
  messages: svg('<path d="M4 5h16v11H9l-5 4z"/>'),
  work: svg('<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M9 7V5h6v2"/>'),
  bank: svg('<path d="m3 9 9-5 9 5"/><path d="M5 9v9M10 9v9M14 9v9M19 9v9M3 20h18"/>'),
  rating: svg('<path d="M5 20V10M12 20V4M19 20v-7"/>'),
  business: svg('<path d="M4 9h16v11H4z"/><path d="M9 9V6h6v3M4 13h16"/>'),
  collection: svg('<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>'),
  housing: svg('<path d="m4 11 8-6 8 6v9H4z"/><path d="M10 20v-6h4v6"/>'),
  casino: svg('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.4"/><circle cx="15" cy="15" r="1.4"/><circle cx="12" cy="12" r="1.4"/>'),
  inventory: svg('<path d="M4 8h16v12H4z"/><path d="M9 8V6a3 3 0 0 1 6 0v2M4 12h16"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  person: svg('<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  seven: svg('<path d="M7 6h10l-6 13"/>'),
  wheel: svg('<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7"/>'),
  cards: svg('<rect x="4" y="5" width="10" height="14" rx="2"/><path d="M14 8h4a2 2 0 0 1 2 2v9H10"/>'),
  achievements: svg('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3M10 20h4M12 13v7"/>')
};

export const iconFor = (key: string): string => ItemIcons[key] ?? ItemIcons.box!;
