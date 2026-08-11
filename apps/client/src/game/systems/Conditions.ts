import { GameTimeService } from '../services/GameTimeService.js';
import type { GameCondition } from '../../types/logic.js';
import type { GameContext } from '../state/GameContext.js';

/** Единый вычислитель условий для диалогов, квестов, событий, работ и районов. */
export function evaluateCondition(ctx: GameContext, condition?: GameCondition): boolean {
  if (!condition) return true;
  const p = ctx.player;
  const time = ctx.time.snapshot;

  if (condition.minLevel !== undefined && p.data.level < condition.minLevel) return false;
  if (condition.maxLevel !== undefined && p.data.level > condition.maxLevel) return false;
  if (condition.minMoney !== undefined && p.cash < condition.minMoney) return false;
  if (condition.maxMoney !== undefined && p.cash > condition.maxMoney) return false;
  if (condition.minTotalWealth !== undefined && p.wealth < condition.minTotalWealth) return false;

  if (condition.hasItem && !ctx.inventory.has(condition.hasItem.id, condition.hasItem.count ?? 1)) return false;
  if (condition.missingItem && ctx.inventory.has(condition.missingItem, 1)) return false;

  if (condition.flag && !p.hasFlag(condition.flag)) return false;
  if (condition.notFlag && p.hasFlag(condition.notFlag)) return false;
  if (condition.flagAtLeast && p.getFlag(condition.flagAtLeast.key) < condition.flagAtLeast.value) return false;

  if (condition.minRelationship && p.getRelationship(condition.minRelationship.npcId) < condition.minRelationship.value)
    return false;
  if (condition.maxRelationship && p.getRelationship(condition.maxRelationship.npcId) > condition.maxRelationship.value)
    return false;
  if (condition.minReputation && p.getReputation(condition.minReputation.track) < condition.minReputation.value)
    return false;

  if (condition.periods && !condition.periods.includes(time.period)) return false;
  if (condition.minDay !== undefined && time.day < condition.minDay) return false;
  if (condition.maxDay !== undefined && time.day > condition.maxDay) return false;

  if (condition.minStat && p.stat(condition.minStat.stat) < condition.minStat.value) return false;
  if (condition.maxStat && p.stat(condition.maxStat.stat) > condition.maxStat.value) return false;

  if (condition.questCompleted && ctx.quests.stateOf(condition.questCompleted) !== 'completed') return false;
  if (condition.questActive && ctx.quests.stateOf(condition.questActive) !== 'active') return false;
  if (condition.questNotStarted && ctx.quests.stateOf(condition.questNotStarted) !== 'locked') return false;

  if (condition.district && p.data.district !== condition.district) return false;
  if (condition.minSkill && p.skill(condition.minSkill.skill) < condition.minSkill.value) return false;
  if (condition.chance !== undefined && Math.random() > condition.chance) return false;

  return true;
}

/** Человекочитаемое объяснение, почему заблокировано. */
export function describeCondition(condition?: GameCondition): string {
  if (!condition) return '';
  const parts: string[] = [];
  if (condition.minLevel) parts.push(`уровень ${condition.minLevel}`);
  if (condition.minMoney) parts.push(`${condition.minMoney} ₽`);
  if (condition.minTotalWealth) parts.push(`капитал ${condition.minTotalWealth} ₽`);
  if (condition.hasItem) parts.push(`предмет: ${condition.hasItem.id}`);
  if (condition.minReputation) parts.push(`репутация ${condition.minReputation.track} ${condition.minReputation.value}`);
  if (condition.minRelationship) parts.push(`доверие ${condition.minRelationship.npcId}`);
  if (condition.questCompleted) parts.push('нужно закрыть задание');
  if (condition.periods) parts.push(`время: ${condition.periods.join(', ')}`);
  if (condition.minSkill) parts.push(`навык ${condition.minSkill.skill} ${condition.minSkill.value}`);
  return parts.join(' · ');
}

export function isLateNight(minutes: number): boolean {
  return GameTimeService.periodOf(minutes) === 'LATE_NIGHT';
}
