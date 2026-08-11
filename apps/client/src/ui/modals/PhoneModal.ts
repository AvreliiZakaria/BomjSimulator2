import { formatMoney, formatMoneyShort, pluralize } from '../../game/core/format.js';
import { ServerClient } from '../../game/services/ServerClient.js';
import { getDistrict, PLANNED_DISTRICTS } from '../../data/districts/index.js';
import { ACHIEVEMENTS, COLLECTIONS } from '../../data/achievements.js';
import { REPUTATION_LABELS, SKILL_LABELS, type ReputationTrack, type SkillId } from '../../types/logic.js';
import { LEADERBOARD_LABELS, LEADERBOARD_CATEGORIES, type LeaderboardCategory } from '@nul/shared';
import { bankScreen, businessScreen, casinoScreen, housingScreen } from './EconomyApps.js';
import { characterSvg } from '../CharacterSvg.js';
import { Modal } from '../Modal.js';
import { UiIcons } from '../Icons.js';
import { clear, el, onTap } from '../dom.js';
import type { GameContext } from '../../game/state/GameContext.js';

export type PhoneApp =
  | 'home'
  | 'map'
  | 'messages'
  | 'work'
  | 'bank'
  | 'rating'
  | 'business'
  | 'collection'
  | 'housing'
  | 'casino'
  | 'achievements'
  | 'character';

const APPS: { id: PhoneApp; label: string; icon: string }[] = [
  { id: 'map', label: 'Карта', icon: 'map' },
  { id: 'messages', label: 'Сообщения', icon: 'messages' },
  { id: 'work', label: 'Работа', icon: 'work' },
  { id: 'bank', label: 'Банк', icon: 'bank' },
  { id: 'rating', label: 'Рейтинг', icon: 'rating' },
  { id: 'business', label: 'Бизнес', icon: 'business' },
  { id: 'housing', label: 'Жильё', icon: 'housing' },
  { id: 'collection', label: 'Коллекция', icon: 'collection' },
  { id: 'achievements', label: 'Достижения', icon: 'achievements' },
  { id: 'casino', label: 'Клуб удачи', icon: 'casino' },
  { id: 'character', label: 'Персонаж', icon: 'person' }
];

/** Внутриигровой телефон: диегетический интерфейс всех «мета»-экранов. */
export function showPhone(
  parent: HTMLElement,
  ctx: GameContext,
  startApp: PhoneApp = 'home',
  openJobs?: (districtId: string) => void
): Modal {
  const modal = new Modal(parent, { title: 'Телефон', bare: true, size: 'narrow' });
  modal.body.style.padding = '0';
  modal.body.style.display = 'flex';
  modal.body.style.justifyContent = 'center';

  const status = el('div', { class: 'phone__status' }, [
    el('span', { text: ctx.time.snapshot.clock }),
    el('span', { text: ctx.player.data.nickname }),
    el('span', { class: 'accent', text: formatMoneyShort(ctx.player.cash) })
  ]);
  const screen = el('div', { class: 'phone__screen' });
  const homeButton = el('button', { class: 'phone__home', 'aria-label': 'На главный экран' });
  const phone = el('div', { class: 'phone' }, [status, screen, homeButton]);
  modal.body.append(phone);

  let current: PhoneApp = startApp;

  const rerender = (): void => open(current);

  const backRow = (title: string): HTMLElement => {
    const back = el('button', { class: 'btn btn--small btn--ghost', text: '← Назад' });
    onTap(back, () => open('home'));
    return el('div', { class: 'row', style: 'border:none;background:none;padding:6px 0' }, [
      back,
      el('div', { class: 'phone__title', style: 'margin:0', text: title })
    ]);
  };

  function open(app: PhoneApp): void {
    current = app;
    clear(screen);
    status.firstElementChild!.textContent = ctx.time.snapshot.clock;
    status.lastElementChild!.textContent = formatMoneyShort(ctx.player.cash);

    if (app === 'home') {
      screen.append(homeScreen());
      return;
    }

    const titles: Record<string, string> = {
      map: 'Карта',
      messages: 'Сообщения',
      work: 'Работа',
      bank: 'Банк',
      rating: 'Рейтинг',
      business: 'Бизнес',
      collection: 'Коллекция',
      housing: 'Жильё',
      casino: 'Клуб удачи',
      achievements: 'Достижения',
      character: 'Персонаж'
    };
    screen.append(backRow(titles[app] ?? ''));

    switch (app) {
      case 'map':
        screen.append(mapScreen());
        break;
      case 'messages':
        screen.append(messagesScreen());
        break;
      case 'work':
        screen.append(workScreen());
        break;
      case 'bank':
        screen.append(bankScreen(ctx, rerender));
        break;
      case 'rating':
        screen.append(ratingScreen());
        break;
      case 'business':
        screen.append(businessScreen(ctx, rerender));
        break;
      case 'housing':
        screen.append(housingScreen(ctx, rerender));
        break;
      case 'casino':
        screen.append(casinoScreen(ctx, rerender));
        break;
      case 'collection':
        screen.append(collectionScreen());
        break;
      case 'achievements':
        screen.append(achievementsScreen());
        break;
      case 'character':
        screen.append(characterScreen());
        break;
      default:
        break;
    }
  }

  function homeScreen(): HTMLElement {
    const grid = el('div', { class: 'phone__apps' });
    for (const app of APPS) {
      const node = el('button', { class: 'phone__app' }, [
        el('span', { html: UiIcons[app.icon] ?? '' }),
        el('span', { text: app.label })
      ]);
      onTap(node, () => open(app.id));
      grid.append(node);
    }
    return grid;
  }

  function mapScreen(): HTMLElement {
    const district = getDistrict(ctx.player.data.district);
    const host = el('div');
    if (!district) return host;

    const map = el('div', { class: 'map' });
    const bounds = district.bounds;
    const toPercent = (x: number, y: number): { left: string; top: string } => ({
      left: ((x - bounds.x) / bounds.w) * 100 + '%',
      top: ((y - bounds.y) / bounds.h) * 100 + '%'
    });

    // Дороги — чтобы карта читалась.
    for (const road of district.roads) {
      const node = el('div');
      node.style.position = 'absolute';
      node.style.background = 'rgba(255,255,255,.08)';
      node.style.left = ((road.x - bounds.x) / bounds.w) * 100 + '%';
      node.style.top = ((road.y - bounds.y) / bounds.h) * 100 + '%';
      node.style.width = (road.w / bounds.w) * 100 + '%';
      node.style.height = (road.h / bounds.h) * 100 + '%';
      map.append(node);
    }

    const colors: Record<string, string> = {
      shop: '#67c06d',
      job: '#f2c14e',
      home: '#4c9ef2',
      business: '#a86df0',
      transit: '#e2703a',
      atm: '#67c06d',
      casino: '#f2564e'
    };

    // Секреты на карте не показываем.
    for (const item of district.interactables) {
      const color = colors[item.kind];
      if (!color) continue;
      const position = toPercent(item.x, item.y);
      const dot = el('div', { class: 'map__dot' });
      dot.style.background = color;
      dot.style.left = position.left;
      dot.style.top = position.top;
      map.append(dot);
      const label = el('div', { class: 'map__label', text: item.label });
      label.style.left = position.left;
      label.style.top = position.top;
      map.append(label);
    }

    const player = ctx.player.data.position;
    const playerPosition = toPercent(player.x, player.y);
    const playerDot = el('div', { class: 'map__dot' });
    playerDot.style.background = '#ffffff';
    playerDot.style.boxShadow = '0 0 0 3px rgba(255,255,255,.25)';
    playerDot.style.left = playerPosition.left;
    playerDot.style.top = playerPosition.top;
    map.append(playerDot);

    host.append(el('div', { class: 'phone__title', text: district.name }), map);

    const list = el('div', { class: 'list', style: 'margin-top:12px' });
    for (const planned of PLANNED_DISTRICTS) {
      list.append(
        el('div', { class: 'row row--locked' }, [
          el('div', { class: 'row__main' }, [
            el('div', { class: 'row__title', text: planned.name }),
            el('div', { class: 'row__desc', text: planned.subtitle + ' · ' + planned.unlockText })
          ])
        ])
      );
    }
    host.append(el('div', { class: 'phone__title', text: 'Остальной город' }), list);
    return host;
  }

  function messagesScreen(): HTMLElement {
    const host = el('div', { class: 'list' });
    const messages: { from: string; text: string }[] = [];

    for (const quest of ctx.quests.activeQuests()) {
      messages.push({ from: 'Задание', text: quest.title + ': ' + quest.summary });
    }
    if (ctx.player.hasFlag('knowsAboutNight')) {
      messages.push({ from: 'Дядя Гриша', text: 'После трёх не ходи на голоса. Просто не ходи.' });
    }
    if (ctx.player.hasFlag('zinaWarning')) {
      messages.push({ from: 'Бабка Зина', text: 'К контейнеру у пятого дома ночью не лезь.' });
    }
    if (ctx.business.owned.length) {
      messages.push({ from: 'Бизнес', text: 'Прогноз на день: ' + formatMoney(ctx.business.dailyProfitEstimate) });
    }
    if (!messages.length) messages.push({ from: 'Город', text: 'Пока тихо. Это ненадолго.' });

    for (const message of messages) {
      host.append(
        el('div', { class: 'row' }, [
          el('div', { class: 'row__main' }, [
            el('div', { class: 'row__title', text: message.from }),
            el('div', { class: 'row__desc', text: message.text })
          ])
        ])
      );
    }
    return host;
  }

  function workScreen(): HTMLElement {
    const host = el('div');
    const button = el('button', { class: 'btn btn--primary', text: 'ОТКРЫТЬ БИРЖУ ПОДРАБОТОК' });
    onTap(button, () => {
      modal.close();
      openJobs?.(ctx.player.data.district);
    });

    const list = el('div', { class: 'list', style: 'margin-top:12px' });
    for (const entry of ctx.jobs.listFor(ctx.player.data.district)) {
      list.append(
        el('div', { class: entry.available ? 'row' : 'row row--locked' }, [
          el('div', { class: 'row__main' }, [
            el('div', { class: 'row__title', text: entry.job.name }),
            el('div', {
              class: entry.available ? 'row__desc accent' : 'row__desc',
              text: entry.available
                ? formatMoney(entry.job.payMin) + ' – ' + formatMoney(entry.job.payMax)
                : entry.reason ?? ''
            })
          ])
        ])
      );
    }

    host.append(button, list);
    return host;
  }

  function ratingScreen(): HTMLElement {
    const host = el('div');
    const tabs = el('div', { class: 'tabs' });
    const content = el('div', { class: 'list' });
    let category: LeaderboardCategory = 'wealth';

    const load = async (): Promise<void> => {
      clear(content);
      content.append(el('div', { class: 'muted', text: 'Загрузка...' }));
      const board = await ServerClient.leaderboard(category);
      clear(content);

      if (!board) {
        content.append(
          el('div', { class: 'muted', text: 'Сервер рейтингов недоступен. Игра работает и без него.' }),
          el('div', { class: 'kv' }, [
            el('span', { text: 'Твой результат' }),
            el('span', { class: 'accent', text: localValue(category) })
          ])
        );
        return;
      }

      if (board.self) {
        content.append(
          el('div', { class: 'kv' }, [
            el('span', { text: 'Твоё место' }),
            el('span', { class: 'accent', text: '#' + board.self.rank + ' · ' + board.self.value })
          ])
        );
        if (board.distanceToNext !== undefined) {
          content.append(
            el('div', { class: 'kv' }, [
              el('span', { text: 'До следующего места' }),
              el('span', { text: String(board.distanceToNext) })
            ])
          );
        }
      }

      for (const entry of board.top.slice(0, 20)) {
        content.append(
          el('div', { class: 'row' }, [
            el('div', { class: 'row__main' }, [
              el('div', { class: 'row__title' }, [
                el('span', { text: '#' + entry.rank + ' ' + entry.nickname }),
                entry.suspicious ? el('span', { class: 'tag bad', text: 'проверяется' }) : null
              ]),
              el('div', { class: 'row__desc', text: String(entry.value) })
            ])
          ])
        );
      }
      if (!board.top.length) content.append(el('div', { class: 'muted', text: 'Таблица пока пуста. Займи первое место.' }));
    };

    for (const id of LEADERBOARD_CATEGORIES) {
      const tab = el('button', { class: id === category ? 'tab tab--active' : 'tab', text: LEADERBOARD_LABELS[id] });
      onTap(tab, () => {
        category = id;
        for (const child of Array.from(tabs.children)) child.classList.remove('tab--active');
        tab.classList.add('tab--active');
        void load();
      });
      tabs.append(tab);
    }

    host.append(tabs, content);
    void load();
    return host;
  }

  function localValue(category: LeaderboardCategory): string {
    const p = ctx.player;
    switch (category) {
      case 'wealth':
        return formatMoney(p.wealth);
      case 'reputation':
        return String(Math.round(p.totalReputation));
      case 'days':
        return pluralize(ctx.time.snapshot.day, 'день', 'дня', 'дней');
      case 'collections':
        return String(p.data.collections.length);
      default:
        return String(p.data.level);
    }
  }

  function collectionScreen(): HTMLElement {
    const host = el('div');
    const owned = ctx.player.data.collections;
    host.append(
      el('div', { class: 'kv' }, [
        el('span', { text: 'Собрано' }),
        el('span', { class: 'accent', text: owned.length + ' / ' + COLLECTIONS.length })
      ])
    );
    const list = el('div', { class: 'list', style: 'margin-top:10px' });
    for (const entry of COLLECTIONS) {
      const has = owned.includes(entry.id);
      list.append(
        el('div', { class: has ? 'row' : 'row row--locked' }, [
          el('div', { class: 'row__main' }, [
            el('div', { class: 'row__title', text: has ? entry.name : '???' }),
            el('div', { class: 'row__desc', text: has ? entry.description : 'Ещё не найдено' })
          ])
        ])
      );
    }
    host.append(list);
    return host;
  }

  function achievementsScreen(): HTMLElement {
    const host = el('div', { class: 'list' });
    for (const achievement of ACHIEVEMENTS) {
      const has = ctx.player.hasAchievement(achievement.id);
      if (achievement.hidden && !has) {
        host.append(
          el('div', { class: 'row row--locked' }, [
            el('div', { class: 'row__main' }, [
              el('div', { class: 'row__title', text: 'Секретное достижение' }),
              el('div', { class: 'row__desc', text: 'Откроется само' })
            ])
          ])
        );
        continue;
      }
      host.append(
        el('div', { class: has ? 'row' : 'row row--locked' }, [
          el('div', { class: 'row__main' }, [
            el('div', { class: 'row__title', text: achievement.name }),
            el('div', { class: 'row__desc', text: achievement.description })
          ]),
          el('div', { class: 'row__side' }, [has ? el('span', { class: 'tag good', text: 'получено' }) : null].filter(Boolean) as HTMLElement[])
        ])
      );
    }
    return host;
  }

  function characterScreen(): HTMLElement {
    const p = ctx.player;
    const host = el('div');

    host.append(
      el('div', { style: 'display:flex;justify-content:center', html: characterSvg(p.data.appearance, 120) }),
      el('div', { class: 'kv' }, [el('span', { text: 'Имя' }), el('span', { text: p.data.nickname })]),
      el('div', { class: 'kv' }, [el('span', { text: 'Уровень' }), el('span', { text: String(p.data.level) })]),
      el('div', { class: 'kv' }, [el('span', { text: 'Опыт' }), el('span', { text: Math.round(p.data.xp) + ' / ' + p.xpToNext })]),
      el('div', { class: 'kv' }, [el('span', { text: 'Капитал' }), el('span', { class: 'accent', text: formatMoney(p.wealth) })]),
      el('div', { class: 'kv' }, [el('span', { text: 'Ночей после 03:00' }), el('span', { text: String(p.data.nightsAfterThree) })])
    );

    host.append(el('div', { class: 'phone__title', text: 'Навыки' }));
    for (const key of Object.keys(SKILL_LABELS) as SkillId[]) {
      host.append(
        el('div', { class: 'kv' }, [el('span', { text: SKILL_LABELS[key] }), el('span', { text: String(p.skill(key)) })])
      );
    }

    host.append(el('div', { class: 'phone__title', text: 'Репутация' }));
    for (const key of Object.keys(REPUTATION_LABELS) as ReputationTrack[]) {
      const value = Math.round(p.getReputation(key));
      host.append(
        el('div', { class: 'kv' }, [
          el('span', { text: REPUTATION_LABELS[key] }),
          el('span', { class: value >= 0 ? 'good' : 'bad', text: String(value) })
        ])
      );
    }

    return host;
  }

  onTap(homeButton, () => open('home'));
  open(startApp);
  return modal;
}
