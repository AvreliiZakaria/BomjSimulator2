import { ACHIEVEMENTS } from '../../data/achievements.js';
import type { GameContext } from '../state/GameContext.js';

export class AchievementSystem {
  constructor(private readonly ctx: GameContext) {}

  unlock(id: string): void {
    const definition = ACHIEVEMENTS.find((entry) => entry.id === id);
    if (!definition) return;
    if (this.ctx.player.unlockAchievement(definition.id, definition.name)) {
      this.ctx.ui.toast(`Достижение: ${definition.name}`, 'good');
      this.ctx.player.addXp(50);
    }
  }

  /** Проверяет все достижения по текущему состоянию. Дёшево, можно звать часто. */
  check(): void {
    const p = this.ctx.player;
    for (const definition of ACHIEVEMENTS) {
      if (p.hasAchievement(definition.id)) continue;
      let unlocked = false;
      switch (definition.check) {
        case 'firstEarn':
          unlocked = p.hasFlag('hasEarned');
          break;
        case 'money10k':
        case 'money100k':
        case 'money1m':
          unlocked = p.wealth >= (definition.value ?? 0);
          break;
        case 'firstRoom':
          unlocked = p.hasFlag('hasRoom');
          break;
        case 'firstBusiness':
          unlocked = p.hasFlag('hasBusiness');
          break;
        case 'nights10':
          unlocked = p.data.nightsAfterThree >= (definition.value ?? 10);
          break;
        case 'level10':
          unlocked = p.data.level >= (definition.value ?? 10);
          break;
        case 'collection':
          unlocked = p.data.collections.length >= (definition.value ?? 10);
          break;
        case 'flag':
          unlocked = Boolean(definition.flag && p.hasFlag(definition.flag));
          break;
        default:
          unlocked = false;
      }
      if (unlocked) this.unlock(definition.id);
    }
  }
}
