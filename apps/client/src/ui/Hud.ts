import { bus } from '../game/core/EventBus.js';
import { formatMoney, formatMoneyShort } from '../game/core/format.js';
import { GameContext } from '../game/state/GameContext.js';
import { PERIOD_LABELS } from '../types/time.js';
import { StatIcons, UiIcons } from './Icons.js';
import { el, isMobileLayout, onTap } from './dom.js';
import type { SurvivalStat } from '../types/logic.js';

const STATS: { key: SurvivalStat; label: string; color: string }[] = [
  { key: 'health', label: 'Здоровье', color: '#f2564e' },
  { key: 'hunger', label: 'Сытость', color: '#e0a13a' },
  { key: 'warmth', label: 'Тепло', color: '#e2703a' },
  { key: 'hygiene', label: 'Гигиена', color: '#4c9ef2' },
  { key: 'sanity', label: 'Рассудок', color: '#a86df0' }
];

/**
 * HUD ничего не вычисляет: он только показывает authoritative-состояние,
 * которое приходит событиями из систем.
 */
export class Hud {
  private root: HTMLElement;
  private survivalPanel: HTMLElement;
  private bars = new Map<SurvivalStat, { fill: HTMLElement; value: HTMLElement; row: HTMLElement }>();
  private dayNode: HTMLElement;
  private districtNode: HTMLElement;
  private moneyNode: HTMLElement;
  private bankNode: HTMLElement;
  private clockNode: HTMLElement;
  private objectiveNode: HTMLElement;
  private promptNode: HTMLElement;
  private xpFill: HTMLElement;
  private xpLabel: HTMLElement;
  private unsubscribers: (() => void)[] = [];
  private promptListener: ((label: string | null) => void) | null = null;

  constructor(
    parent: HTMLElement,
    private readonly actions: { onInventory: () => void; onPhone: () => void; onMenu: () => void }
  ) {
    this.survivalPanel = el('div', { class: 'hud__survival' });
    for (const stat of STATS) {
      const fill = el('div', { class: 'stat__fill' });
      fill.style.background = stat.color;
      const value = el('div', { class: 'stat__value', text: '0' });
      const row = el('div', { class: 'stat' }, [
        el('div', { class: 'stat__icon', html: StatIcons[stat.key] ?? '' }),
        el('div', { class: 'stat__body' }, [
          el('div', { class: 'stat__name', text: stat.label }),
          el('div', { class: 'stat__bar' }, [fill])
        ]),
        value
      ]);
      this.survivalPanel.append(row);
      this.bars.set(stat.key, { fill, value, row });
    }
    onTap(this.survivalPanel, () => {
      if (isMobileLayout()) this.survivalPanel.classList.toggle('hud__survival--expanded');
    });

    this.dayNode = el('div', { class: 'hud__day', text: 'День 1' });
    this.districtNode = el('div', { class: 'hud__district', text: 'Спальный район' });
    const center = el('div', { class: 'hud__center' }, [this.dayNode, this.districtNode]);

    this.moneyNode = el('div', { class: 'hud__money', text: '0 ₽' });
    this.bankNode = el('div', { class: 'hud__bank', text: '' });
    this.clockNode = el('div', { class: 'hud__clock', text: '08:00' });
    const right = el('div', { class: 'hud__right' }, [this.moneyNode, this.bankNode, this.clockNode]);

    this.objectiveNode = el('div', { class: 'hud__objective' });
    this.promptNode = el('div', { class: 'hud__prompt' });

    this.xpFill = el('div', { class: 'hud__xp-fill' });
    this.xpLabel = el('div', { text: 'Уровень 1' });
    const xp = el('div', { class: 'hud__xp' }, [this.xpLabel, el('div', { class: 'hud__xp-bar' }, [this.xpFill])]);

    const inventoryBtn = el('button', { class: 'btn btn--small' }, [
      el('span', { class: 'btn__ico', html: UiIcons.inventory ?? '' }),
      'Рюкзак'
    ]);
    const phoneBtn = el('button', { class: 'btn btn--small' }, [
      el('span', { class: 'btn__ico', html: UiIcons.map ?? '' }),
      'Телефон'
    ]);
    const menuBtn = el('button', { class: 'btn btn--small' }, [
      el('span', { class: 'btn__ico', html: UiIcons.menu ?? '' })
    ]);
    onTap(inventoryBtn, () => this.actions.onInventory());
    onTap(phoneBtn, () => this.actions.onPhone());
    onTap(menuBtn, () => this.actions.onMenu());

    this.root = el('div', { class: 'hud' }, [
      this.survivalPanel,
      center,
      right,
      this.objectiveNode,
      this.promptNode,
      xp,
      el('div', { class: 'hud__buttons' }, [inventoryBtn, phoneBtn, menuBtn])
    ]);
    parent.append(this.root);

    this.subscribe();
    this.refresh();
  }

  setPromptListener(listener: (label: string | null) => void): void {
    this.promptListener = listener;
  }

  private subscribe(): void {
    this.unsubscribers.push(
      bus.on('stats:changed', (stats) => {
        for (const stat of STATS) this.updateStat(stat.key, stats[stat.key]);
      }),
      bus.on('money:changed', (payload) => {
        this.moneyNode.textContent = formatMoney(payload.cash);
        this.bankNode.textContent = payload.bank > 0 ? 'банк ' + formatMoneyShort(payload.bank) : '';
      }),
      bus.on('time:tick', (time) => {
        this.clockNode.textContent = time.clock + ' · ' + PERIOD_LABELS[time.period];
        this.clockNode.classList.toggle('hud__clock--late', time.isLateNight);
        this.dayNode.textContent = 'День ' + time.day;
      }),
      bus.on('district:changed', (payload) => {
        this.districtNode.textContent = payload.name;
      }),
      bus.on('xp:changed', (payload) => {
        this.xpLabel.textContent = 'Уровень ' + payload.level;
        this.xpFill.style.width = Math.round(Math.min(1, payload.progress) * 100) + '%';
      }),
      bus.on('quest:updated', () => this.refreshObjective()),
      bus.on('ui:refresh', () => this.refresh()),
      bus.on('interaction:target', (target) => this.setPrompt(target ? target.label : null)),
      bus.on('objective:hint', (payload) => this.showObjective(payload.text))
    );
  }

  private updateStat(key: SurvivalStat, value: number): void {
    const entry = this.bars.get(key);
    if (!entry) return;
    const rounded = Math.round(value);
    entry.fill.style.width = Math.max(0, Math.min(100, rounded)) + '%';
    entry.value.textContent = String(rounded);
    entry.row.classList.toggle('stat--low', rounded <= 20);
  }

  private setPrompt(label: string | null): void {
    if (label) {
      this.promptNode.innerHTML = '<kbd>E</kbd>' + label.toUpperCase();
      this.promptNode.classList.add('hud__prompt--visible');
    } else {
      this.promptNode.classList.remove('hud__prompt--visible');
    }
    if (this.promptListener) this.promptListener(label);
  }

  private showObjective(text: string): void {
    this.objectiveNode.textContent = text;
    this.objectiveNode.classList.toggle('hud__objective--visible', Boolean(text));
  }

  private refreshObjective(): void {
    const ctx = GameContext.current;
    if (!ctx) return;
    this.showObjective(ctx.quests.currentHint());
  }

  refresh(): void {
    const ctx = GameContext.current;
    if (!ctx) return;
    const p = ctx.player;
    for (const stat of STATS) this.updateStat(stat.key, p.stat(stat.key));
    this.moneyNode.textContent = formatMoney(p.cash);
    this.bankNode.textContent = p.bank > 0 ? 'банк ' + formatMoneyShort(p.bank) : '';
    this.xpLabel.textContent = 'Уровень ' + p.data.level;
    this.xpFill.style.width = Math.round((p.data.xp / p.xpToNext) * 100) + '%';
    const time = ctx.time.snapshot;
    this.dayNode.textContent = 'День ' + time.day;
    this.clockNode.textContent = time.clock + ' · ' + PERIOD_LABELS[time.period];
    this.refreshObjective();
  }

  setVisible(visible: boolean): void {
    this.root.style.display = visible ? 'block' : 'none';
  }

  destroy(): void {
    for (const off of this.unsubscribers) off();
    this.unsubscribers = [];
    this.root.remove();
  }
}
