import { bus } from '../core/EventBus.js';
import { requireItem } from '../../data/items.js';
import type { GameEffect } from '../../types/logic.js';
import type { GameContext } from '../state/GameContext.js';

/**
 * Единый исполнитель последствий. Диалоги, квесты, события и работы
 * описывают результат данными, а меняет состояние только этот модуль.
 */
export function applyEffect(ctx: GameContext, effect?: GameEffect): void {
  if (!effect) return;
  const p = ctx.player;

  if (effect.money) p.addCash(effect.money, 'effect');
  if (effect.bank) p.addBank(effect.bank, 'effect');
  if (effect.xp) p.addXp(effect.xp);

  if (effect.giveItems) {
    for (const entry of effect.giveItems) {
      const result = ctx.inventory.add(entry.id, entry.count ?? 1);
      if (result.added > 0) {
        ctx.ui.toast(`+ ${requireItem(entry.id).name} ×${result.added}`, 'good');
      }
      if (result.overflow > 0) {
        ctx.ui.toast('Не всё влезло: слишком тяжело', 'bad');
      }
    }
  }

  if (effect.takeItems) {
    for (const entry of effect.takeItems) ctx.inventory.remove(entry.id, entry.count ?? 1);
  }

  if (effect.stats) p.modifyStats(effect.stats);
  if (effect.status) for (const id of effect.status) p.addStatus(id);
  if (effect.cureStatus) for (const id of effect.cureStatus) p.removeStatus(id);

  if (effect.setFlag) for (const entry of effect.setFlag) p.setFlag(entry.key, entry.value);
  if (effect.addFlag) for (const entry of effect.addFlag) p.addFlag(entry.key, entry.value);

  if (effect.relationship) for (const entry of effect.relationship) p.changeRelationship(entry.npcId, entry.delta);
  if (effect.reputation) for (const entry of effect.reputation) p.changeReputation(entry.track, entry.delta);
  if (effect.skillXp) for (const entry of effect.skillXp) p.addSkillXp(entry.skill, entry.amount);

  if (effect.startQuest) ctx.quests.start(effect.startQuest);
  if (effect.completeQuest) ctx.quests.complete(effect.completeQuest);
  if (effect.failQuest) ctx.quests.fail(effect.failQuest);
  if (effect.progressObjective) {
    for (const entry of effect.progressObjective) {
      ctx.quests.progress(entry.questId, entry.objectiveId, entry.amount ?? 1);
    }
  }

  if (effect.unlockDistrict && p.unlockDistrict(effect.unlockDistrict)) {
    ctx.ui.toast('Открыт новый район', 'good');
  }

  if (effect.unlockAchievement) ctx.achievements.unlock(effect.unlockAchievement);
  if (effect.addCollection && p.addCollection(effect.addCollection)) {
    ctx.ui.toast('Новая запись в коллекции', 'good');
  }

  if (effect.advanceMinutes) ctx.time.skip(effect.advanceMinutes);

  if (effect.toast) ctx.ui.toast(effect.toast.text, effect.toast.tone);
  if (effect.message) bus.emit('toast', { text: effect.message });

  ctx.markDirty();
}
