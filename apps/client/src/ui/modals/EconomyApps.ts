import { GameConfig } from '../../game/config/GameConfig.js';
import { formatMoney, formatMoneyShort, formatWeight } from '../../game/core/format.js';
import { HOUSING_LIST, HOUSING_UPGRADES } from '../../data/housing.js';
import { BUSINESS_TYPES } from '../../data/businesses.js';
import { CasinoSystem } from '../../game/systems/CasinoSystem.js';
import { UiIcons } from '../Icons.js';
import { el, onTap } from '../dom.js';
import type { GameContext } from '../../game/state/GameContext.js';

type Rerender = () => void;

const button = (label: string, handler: () => void, variant = ''): HTMLButtonElement => {
  const node = el('button', {
    class: variant ? 'btn btn--small btn--' + variant : 'btn btn--small',
    text: label
  });
  onTap(node, handler);
  return node;
};

// ─────────────────────────── БАНК ───────────────────────────

export function bankScreen(ctx: GameContext, rerender: Rerender): HTMLElement {
  const p = ctx.player;
  const host = el('div');

  if (!p.data.bankUnlocked) {
    host.append(
      el('div', {
        class: 'modal__text',
        text: 'Счёта пока нет. С ним наличные перестанут пропадать при неприятностях.'
      }),
      el('div', { class: 'kv' }, [
        el('span', { text: 'Открытие счёта' }),
        el('span', { text: formatMoney(GameConfig.economy.bankUnlockFee) })
      ]),
      el('div', { class: 'kv' }, [
        el('span', { text: 'Требуется уровень' }),
        el('span', { text: String(GameConfig.economy.bankUnlockLevel) })
      ]),
      el('div', { style: 'margin-top:14px' }, [
        button('ОТКРЫТЬ СЧЁТ', () => {
          const result = ctx.economy.openBank();
          if (!result.ok) ctx.ui.toast(result.reason ?? 'Отказ', 'bad');
          else ctx.ui.toast('Счёт открыт', 'good');
          rerender();
        }, 'primary')
      ])
    );
    return host;
  }

  const amount = el('input', { type: 'number', value: '100', min: '10' });

  host.append(
    el('div', { class: 'kv' }, [
      el('span', { text: 'Наличные' }),
      el('span', { class: 'accent', text: formatMoney(p.cash) })
    ]),
    el('div', { class: 'kv' }, [
      el('span', { text: 'На счету' }),
      el('span', { class: 'good', text: formatMoney(p.bank) })
    ]),
    el('div', { class: 'field', style: 'margin-top:14px' }, [el('label', { text: 'Сумма' }), amount]),
    el('div', { class: 'row__side' }, [
      button('ПОЛОЖИТЬ', () => {
        if (!p.deposit(Number(amount.value))) ctx.ui.toast('Не получилось', 'bad');
        rerender();
      }, 'primary'),
      button('СНЯТЬ', () => {
        if (!p.withdraw(Number(amount.value))) ctx.ui.toast('Не получилось', 'bad');
        rerender();
      })
    ]),
    el('div', {
      class: 'row__desc',
      style: 'margin-top:12px',
      text: 'Деньги на счету не теряются, если ты потеряешь сознание на улице.'
    })
  );
  return host;
}

// ─────────────────────────── ЖИЛЬЁ ───────────────────────────

export function housingScreen(ctx: GameContext, rerender: Rerender): HTMLElement {
  const host = el('div');
  const current = ctx.housing.current;

  host.append(
    el('div', { class: 'kv' }, [
      el('span', { text: 'Сейчас' }),
      el('span', { class: current ? 'good' : 'muted', text: current ? current.name : 'Улица' })
    ])
  );

  if (current) {
    host.append(
      el('div', { class: 'kv' }, [
        el('span', { text: 'Склад' }),
        el('span', {
          text: formatWeight(ctx.housing.storedWeight) + ' / ' + formatWeight(ctx.housing.storageCapacity)
        })
      ]),
      el('div', { class: 'kv' }, [
        el('span', { text: 'Аренда оплачена до' }),
        el('span', {
          text: current.rentPerDay > 0 ? 'дня ' + ctx.player.data.housing.paidUntilDay : 'в собственности'
        })
      ]),
      el('div', { class: 'row', style: 'margin-top:12px' }, [
        el('div', { class: 'row__main' }, [
          el('div', { class: 'row__title', text: 'Отдых дома' }),
          el('div', { class: 'row__desc', text: 'Своя крыша — лучший сон в игре' })
        ]),
        el('div', { class: 'row__side' }, [
          button('Спать до утра', () => {
            ctx.sleep.sleep(ctx.housing.sleepQuality, ctx.sleep.hoursUntilMorning());
            rerender();
          }, 'primary')
        ])
      ])
    );

    const upgrades = el('div', { class: 'list', style: 'margin-top:12px' });
    for (const upgrade of HOUSING_UPGRADES) {
      const owned = ctx.player.data.housing.upgrades.includes(upgrade.id);
      upgrades.append(
        el('div', { class: owned ? 'row row--locked' : 'row' }, [
          el('div', { class: 'row__main' }, [
            el('div', { class: 'row__title', text: upgrade.name }),
            el('div', { class: 'row__desc', text: upgrade.description })
          ]),
          el('div', { class: 'row__side' }, [
            owned
              ? el('span', { class: 'tag', text: 'стоит' })
              : button(formatMoney(upgrade.price), () => {
                  const result = ctx.housing.buyUpgrade(upgrade.id);
                  if (!result.ok) ctx.ui.toast(result.reason ?? 'Нет', 'bad');
                  else ctx.ui.toast(upgrade.name + ' установлено', 'good');
                  rerender();
                }, 'primary')
          ])
        ])
      );
    }
    host.append(el('div', { class: 'phone__title', text: 'Обустройство' }), upgrades);
  }

  const list = el('div', { class: 'list', style: 'margin-top:12px' });
  for (const housing of HOUSING_LIST) {
    const check = ctx.housing.canTake(housing.id);
    const isCurrent = ctx.player.data.housing.id === housing.id;
    const actions = el('div', { class: 'row__side' });

    if (!isCurrent && check.ok) {
      if (housing.rentPerDay > 0) {
        actions.append(
          button('Снять ' + formatMoneyShort(housing.rentPerDay * 7), () => {
            const result = ctx.housing.rent(housing.id, 7);
            if (!result.ok) ctx.ui.toast(result.reason ?? 'Отказ', 'bad');
            rerender();
          }, 'primary')
        );
      }
      if (housing.buyPrice) {
        actions.append(
          button('Купить ' + formatMoneyShort(housing.buyPrice), () => {
            const result = ctx.housing.buy(housing.id);
            if (!result.ok) ctx.ui.toast(result.reason ?? 'Отказ', 'bad');
            rerender();
          })
        );
      }
    } else if (isCurrent) {
      actions.append(el('span', { class: 'tag', text: 'твоё' }));
    }

    list.append(
      el('div', { class: check.ok ? 'row' : 'row row--locked' }, [
        el('div', { class: 'row__icon', html: UiIcons.housing ?? '' }),
        el('div', { class: 'row__main' }, [
          el('div', { class: 'row__title' }, [
            el('span', { text: housing.name }),
            el('span', { class: 'tag', text: 'склад ' + housing.storage + ' кг' })
          ]),
          el('div', { class: 'row__desc', text: housing.description }),
          !check.ok ? el('div', { class: 'row__desc bad', text: check.reason ?? '' }) : null
        ]),
        actions
      ])
    );
  }

  host.append(el('div', { class: 'phone__title', text: 'Варианты жилья' }), list);
  return host;
}

// ─────────────────────────── БИЗНЕС ───────────────────────────

export function businessScreen(ctx: GameContext, rerender: Rerender): HTMLElement {
  const host = el('div');
  const owned = ctx.business.owned;

  if (owned.length) {
    host.append(
      el('div', { class: 'kv' }, [
        el('span', { text: 'Прогноз прибыли в день' }),
        el('span', { class: 'good', text: formatMoney(ctx.business.dailyProfitEstimate) })
      ])
    );

    const list = el('div', { class: 'list', style: 'margin-top:10px' });
    for (const business of owned) {
      const type = BUSINESS_TYPES[business.typeId];
      if (!type) continue;

      const actions = el('div', { class: 'row__side' }, ([
        button('Товар +20', () => {
          const result = ctx.business.restock(business.id, 20);
          if (!result.ok) ctx.ui.toast(result.reason ?? 'Нет', 'bad');
          else ctx.ui.toast('Закуплено 20 единиц', 'good');
          rerender();
        }),
        business.pending > 0
          ? button('Забрать ' + formatMoneyShort(business.pending), () => {
              const total = ctx.business.collect(business.id);
              ctx.ui.toast('Выручка: ' + formatMoney(total), 'good');
              rerender();
            }, 'primary')
          : null,
        type.employeeSlots > business.employees
          ? button('Нанять', () => {
              const result = ctx.business.hire(business.id);
              if (!result.ok) ctx.ui.toast(result.reason ?? 'Нет', 'bad');
              rerender();
            })
          : null,
        type.upgradesTo
          ? button('Развить', () => {
              const result = ctx.business.upgrade(business.id);
              if (!result.ok) ctx.ui.toast(result.reason ?? 'Нет', 'bad');
              else ctx.ui.toast('Бизнес вырос', 'good');
              rerender();
            })
          : null
      ].filter(Boolean) as HTMLElement[]));

      list.append(
        el('div', { class: 'row' }, [
          el('div', { class: 'row__icon', html: UiIcons.business ?? '' }),
          el('div', { class: 'row__main' }, [
            el('div', { class: 'row__title' }, [
              el('span', { text: business.name }),
              el('span', { class: 'tag', text: type.name })
            ]),
            el('div', {
              class: 'row__desc',
              text:
                'Товар: ' + business.stock + '/' + type.maxStock +
                ' · Сотрудники: ' + business.employees + '/' + type.employeeSlots +
                ' · Накоплено: ' + formatMoney(business.pending)
            })
          ]),
          actions
        ])
      );
    }
    host.append(list);
  }

  const available = el('div', { class: 'list', style: 'margin-top:12px' });
  for (const entry of ctx.business.available()) {
    const actions = el('div', { class: 'row__side' }, [
      entry.ok
        ? button('Открыть ' + formatMoneyShort(entry.type.price), () => {
            const result = ctx.business.open(entry.type.id);
            if (!result.ok) ctx.ui.toast(result.reason ?? 'Отказ', 'bad');
            else ctx.ui.toast(entry.type.name + ': открыто', 'good');
            rerender();
          }, 'primary')
        : el('span', { class: 'tag', text: 'закрыто' })
    ]);

    available.append(
      el('div', { class: entry.ok ? 'row' : 'row row--locked' }, [
        el('div', { class: 'row__main' }, [
          el('div', { class: 'row__title', text: entry.type.name }),
          el('div', { class: 'row__desc', text: entry.type.description }),
          !entry.ok ? el('div', { class: 'row__desc bad', text: entry.reason ?? '' }) : null
        ]),
        actions
      ])
    );
  }

  host.append(el('div', { class: 'phone__title', text: 'Открыть новое дело' }), available);
  return host;
}

// ─────────────────────────── КЛУБ УДАЧИ ───────────────────────────

export function casinoScreen(ctx: GameContext, rerender: Rerender): HTMLElement {
  const casino = new CasinoSystem(ctx);
  const host = el('div');
  const bet = el('input', { type: 'number', value: '50', min: String(GameConfig.casino.minBet) });
  const output = el('div', {
    class: 'modal__text muted',
    text: 'Только внутриигровые деньги. Никаких реальных ставок и вывода.'
  });

  const reels = el('div', { class: 'slots' }, [
    el('div', { class: 'slot', html: UiIcons.casino ?? '' }),
    el('div', { class: 'slot', html: UiIcons.casino ?? '' }),
    el('div', { class: 'slot', html: UiIcons.casino ?? '' })
  ]);

  const symbolIcon: Record<string, string> = {
    bottle: UiIcons.wheel ?? '',
    can: UiIcons.business ?? '',
    coin: UiIcons.bank ?? '',
    pigeon: UiIcons.rating ?? '',
    key: UiIcons.collection ?? '',
    seven: UiIcons.seven ?? ''
  };

  const betValue = (): number => Math.max(GameConfig.casino.minBet, Math.round(Number(bet.value) || 0));

  function gameRow(name: string, description: string, handler: () => void): HTMLElement {
    const row = el('button', { class: 'row row--clickable', style: 'text-align:left' }, [
      el('div', { class: 'row__main' }, [
        el('div', { class: 'row__title', text: name }),
        el('div', { class: 'row__desc', text: description })
      ])
    ]);
    onTap(row, handler);
    return row;
  }

  function showCards(guess: 'higher' | 'lower'): void {
    const result = casino.playCards(betValue(), guess);
    if (!result) return;
    output.textContent =
      (result.win ? 'Угадал: ' : 'Не угадал: ') +
      result.first + ' → ' + result.second +
      (result.payout > 0 ? ' · ' + formatMoney(result.payout) : '');
    output.className = result.win ? 'modal__text good' : 'modal__text muted';
    rerender();
  }

  const games = el('div', { class: 'list' }, [
    gameRow('Слоты', 'Три в ряд — крупный выигрыш', () => {
      const result = casino.spinSlots(betValue());
      if (!result) return;
      reels.innerHTML = '';
      for (const symbol of result.symbols) {
        reels.append(el('div', { class: 'slot', html: symbolIcon[symbol] ?? UiIcons.casino ?? '' }));
      }
      output.textContent = result.payout > 0 ? 'Выигрыш: ' + formatMoney(result.payout) : 'Мимо.';
      output.className = result.payout > 0 ? 'modal__text good' : 'modal__text muted';
      rerender();
    }),
    gameRow('Колесо', 'Один сектор из восьми', () => {
      const result = casino.spinWheel(betValue());
      if (!result) return;
      output.textContent =
        result.payout > 0
          ? 'Множитель ×' + result.multiplier + ' → ' + formatMoney(result.payout)
          : 'Ноль. Символично.';
      output.className = result.payout > 0 ? 'modal__text good' : 'modal__text muted';
      rerender();
    }),
    gameRow('Карты: выше', 'Следующая карта старше', () => showCards('higher')),
    gameRow('Карты: ниже', 'Следующая карта младше', () => showCards('lower')),
    gameRow('Голубиные гонки', 'Ставка на одного из пяти', () => {
      const odds = CasinoSystem.makeOdds();
      const runner = Math.floor(Math.random() * odds.length);
      const result = casino.race(betValue(), runner, odds);
      if (!result) return;
      output.textContent =
        result.payout > 0
          ? 'Твой голубь пришёл первым: ' + formatMoney(result.payout)
          : 'Победил голубь №' + (result.winner + 1) + '. Твой отвлёкся.';
      output.className = result.payout > 0 ? 'modal__text good' : 'modal__text muted';
      rerender();
    })
  ]);

  host.append(
    el('div', { class: 'kv' }, [
      el('span', { text: 'Наличные' }),
      el('span', { class: 'accent', text: formatMoney(ctx.player.cash) })
    ]),
    el('div', { class: 'field' }, [el('label', { text: 'Ставка, ₽' }), bet]),
    reels,
    output,
    games
  );
  return host;
}
