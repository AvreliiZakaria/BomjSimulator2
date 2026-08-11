import { GameConfig } from '../config/GameConfig.js';
import { pickWeighted, randInt } from '../core/rng.js';
import type { GameContext } from '../state/GameContext.js';

export type SlotSymbol = string;

export interface SlotResult {
  symbols: SlotSymbol[];
  payout: number;
}

export interface WheelResult {
  multiplier: number;
  payout: number;
}

export interface CardResult {
  first: number;
  second: number;
  win: boolean;
  payout: number;
}

export interface RaceResult {
  winner: number;
  odds: number[];
  payout: number;
}

/**
 * Клуб удачи. Только внутриигровые деньги, заработанные геймплеем:
 * ставок на реальные деньги, вывода и покупки фишек за реальные деньги нет и не будет.
 * Все вероятности лежат в GameConfig.casino.
 */
export class CasinoSystem {
  constructor(private readonly ctx: GameContext) {}

  private takeBet(bet: number): boolean {
    const cfg = GameConfig.casino;
    const amount = Math.round(bet);
    if (amount < cfg.minBet || amount > cfg.maxBet) {
      this.ctx.ui.toast(`Ставка от ${cfg.minBet} до ${cfg.maxBet} ₽`, 'bad');
      return false;
    }
    if (!this.ctx.player.spendCash(amount, 'casino:bet')) {
      this.ctx.ui.toast('Не хватает наличных', 'bad');
      return false;
    }
    this.ctx.player.addFlag('casinoBets', 1);
    return true;
  }

  private payout(amount: number): void {
    if (amount > 0) {
      this.ctx.player.addCash(amount, 'casino:win');
      this.ctx.player.addSkillXp('luck', 8);
    }
    this.ctx.save(true);
  }

  spinSlots(bet: number): SlotResult | null {
    if (!this.takeBet(bet)) return null;
    const cfg = GameConfig.casino.slots;
    const symbols: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      const symbol = pickWeighted(cfg.symbols as readonly string[], (candidate) => {
        const index = (cfg.symbols as readonly string[]).indexOf(candidate);
        return (cfg.weights as readonly number[])[index] ?? 1;
      });
      symbols.push(symbol ?? 'bottle');
    }

    const payouts = cfg.payouts as Record<string, number>;
    let multiplier = 0;
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      multiplier = payouts[symbols[0]!] ?? 2;
    } else if (symbols[0] === symbols[1] || symbols[1] === symbols[2] || symbols[0] === symbols[2]) {
      multiplier = cfg.twoOfAKind;
    }

    const payout = Math.round(bet * multiplier);
    this.payout(payout);
    return { symbols, payout };
  }

  spinWheel(bet: number): WheelResult | null {
    if (!this.takeBet(bet)) return null;
    const cfg = GameConfig.casino.wheel;
    const segments = cfg.segments as readonly number[];
    const weights = cfg.weights as readonly number[];
    const multiplier =
      pickWeighted(segments, (segment) => weights[segments.indexOf(segment)] ?? 1) ?? 0;
    const payout = Math.round(bet * multiplier);
    this.payout(payout);
    return { multiplier, payout };
  }

  /** «Выше или ниже»: честная колода 2..14, дом берёт небольшую комиссию. */
  playCards(bet: number, guess: 'higher' | 'lower'): CardResult | null {
    if (!this.takeBet(bet)) return null;
    const first = randInt(2, 14);
    let second = randInt(2, 14);
    while (second === first) second = randInt(2, 14);

    const win = guess === 'higher' ? second > first : second < first;
    const payout = win ? Math.round(bet * 2 * (1 - GameConfig.casino.cards.houseEdge)) : 0;
    this.payout(payout);
    return { first, second, win, payout };
  }

  /** Крысиные и голубиные бега: коэффициенты видны до ставки. */
  race(bet: number, runner: number, odds: number[]): RaceResult | null {
    if (!this.takeBet(bet)) return null;
    // Шанс победы обратно пропорционален коэффициенту.
    const chances = odds.map((value) => 1 / value);
    const total = chances.reduce((sum, value) => sum + value, 0);
    let roll = Math.random() * total;
    let winner = 0;
    for (let i = 0; i < chances.length; i += 1) {
      roll -= chances[i]!;
      if (roll <= 0) {
        winner = i;
        break;
      }
    }
    const payout = winner === runner ? Math.round(bet * (odds[runner] ?? 2)) : 0;
    this.payout(payout);
    return { winner, odds, payout };
  }

  static makeOdds(count = GameConfig.casino.races.runners): number[] {
    const odds: number[] = [];
    for (let i = 0; i < count; i += 1) {
      odds.push(Number((1.6 + Math.random() * (GameConfig.casino.races.maxOdds - 1.6)).toFixed(1)));
    }
    return odds;
  }
}
