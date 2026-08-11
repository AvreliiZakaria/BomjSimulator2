import { bus } from '../core/EventBus.js';
import { QUESTS, QUEST_LIST } from '../../data/quests.js';
import { evaluateCondition } from './Conditions.js';
import { applyEffect } from './Effects.js';
import type { ObjectiveType, QuestDefinition, QuestProgress, QuestState } from '../../types/quests.js';
import type { GameContext } from '../state/GameContext.js';

export class QuestSystem {
  constructor(private readonly ctx: GameContext) {}

  private get store(): Record<string, QuestProgress> {
    return this.ctx.player.data.quests;
  }

  stateOf(id: string): QuestState {
    return this.store[id]?.state ?? 'locked';
  }

  progressOf(id: string): QuestProgress | undefined {
    return this.store[id];
  }

  definition(id: string): QuestDefinition | undefined {
    return QUESTS[id];
  }

  activeQuests(): QuestDefinition[] {
    return QUEST_LIST.filter((quest) => this.stateOf(quest.id) === 'active' && !quest.hidden);
  }

  completedQuests(): QuestDefinition[] {
    return QUEST_LIST.filter((quest) => this.stateOf(quest.id) === 'completed');
  }

  start(id: string): boolean {
    const quest = QUESTS[id];
    if (!quest || this.stateOf(id) !== 'locked') return false;
    this.store[id] = { id, state: 'active', progress: {}, startedDay: this.ctx.time.snapshot.day };
    for (const objective of quest.objectives) this.store[id]!.progress[objective.id] = 0;
    applyEffect(this.ctx, quest.onStart);
    if (!quest.hidden) {
      this.ctx.ui.toast(`Новое задание: ${quest.title}`, 'neutral');
      bus.emit('objective:hint', { text: quest.objectives[0]?.description ?? quest.summary });
    }
    bus.emit('quest:updated', { questId: id });
    this.ctx.markDirty();
    return true;
  }

  complete(id: string): boolean {
    const quest = QUESTS[id];
    const entry = this.store[id];
    if (!quest || !entry || entry.state === 'completed') return false;
    entry.state = 'completed';
    entry.completedDay = this.ctx.time.snapshot.day;
    applyEffect(this.ctx, quest.rewards);
    if (!quest.hidden) this.ctx.ui.toast(`Задание закрыто: ${quest.title}`, 'good');
    else this.ctx.ui.toast('Что-то щёлкнуло. Кажется, ты что-то нашёл.', 'weird');
    if (quest.nextQuest) this.start(quest.nextQuest);
    bus.emit('quest:updated', { questId: id });
    this.ctx.achievements.check();
    this.ctx.save(true);
    return true;
  }

  fail(id: string): void {
    const entry = this.store[id];
    if (!entry || entry.state !== 'active') return;
    entry.state = 'failed';
    bus.emit('quest:updated', { questId: id });
    this.ctx.markDirty();
  }

  progress(questId: string, objectiveId: string, amount = 1): void {
    const quest = QUESTS[questId];
    const entry = this.store[questId];
    if (!quest || !entry || entry.state !== 'active') return;
    const objective = quest.objectives.find((item) => item.id === objectiveId);
    if (!objective) return;

    const current = entry.progress[objectiveId] ?? 0;
    const next = Math.min(objective.count, current + amount);
    if (next === current) return;
    entry.progress[objectiveId] = next;
    bus.emit('quest:updated', { questId });

    if (next >= objective.count && !objective.hidden) {
      this.ctx.ui.toast(`✓ ${objective.description}`, 'good');
    }
    this.tryComplete(questId);
  }

  /**
   * Универсальный вход для игровых событий: «подобрал предмет», «поговорил», «поработал».
   * Системы не знают про конкретные квесты — они просто сообщают, что произошло.
   */
  notify(type: ObjectiveType, target: string, amount = 1): void {
    for (const quest of QUEST_LIST) {
      if (this.stateOf(quest.id) !== 'active') continue;
      for (const objective of quest.objectives) {
        if (objective.type !== type) continue;
        if (objective.target && objective.target !== target && objective.target !== '*') continue;

        if (type === 'collect') {
          // Для сбора считаем фактическое количество в инвентаре, а не события.
          const owned = this.ctx.inventory.count(objective.target ?? target);
          const entry = this.store[quest.id]!;
          const value = Math.min(objective.count, owned);
          if (value !== (entry.progress[objective.id] ?? 0)) {
            entry.progress[objective.id] = value;
            bus.emit('quest:updated', { questId: quest.id });
          }
        } else if (type === 'money') {
          this.progress(quest.id, objective.id, amount);
        } else {
          this.progress(quest.id, objective.id, amount);
        }
      }
      this.tryComplete(quest.id);
    }
  }

  private tryComplete(questId: string): void {
    const quest = QUESTS[questId];
    const entry = this.store[questId];
    if (!quest || !entry || entry.state !== 'active') return;
    const done = quest.objectives
      .filter((objective) => !objective.optional)
      .every((objective) => (entry.progress[objective.id] ?? 0) >= objective.count);
    if (done) this.complete(questId);
  }

  /** Автостарт квестов, чьи условия выполнились. Вызывается на смену часа/района. */
  checkAutoStarts(): void {
    for (const quest of QUEST_LIST) {
      if (!quest.autoStart || this.stateOf(quest.id) !== 'locked') continue;
      if (evaluateCondition(this.ctx, quest.conditions)) this.start(quest.id);
    }
    // Скрытые цепочки: игрок не видит счётчик, но система его ведёт.
    for (const quest of QUEST_LIST) {
      if (this.stateOf(quest.id) !== 'active' || !quest.hidden) continue;
      const entry = this.store[quest.id]!;
      for (const objective of quest.objectives) {
        if (objective.type !== 'flag' || !objective.target) continue;
        const value = Math.min(objective.count, this.ctx.player.getFlag(objective.target));
        if (value !== (entry.progress[objective.id] ?? 0)) entry.progress[objective.id] = value;
      }
      this.tryComplete(quest.id);
    }
  }

  /** Текущая подсказка для HUD: первое незакрытое требование активного квеста. */
  currentHint(): string {
    for (const quest of this.activeQuests()) {
      const entry = this.store[quest.id]!;
      for (const objective of quest.objectives) {
        if (objective.hidden) continue;
        const value = entry.progress[objective.id] ?? 0;
        if (value < objective.count) {
          return objective.count > 1
            ? `${objective.description} (${value}/${objective.count})`
            : objective.description;
        }
      }
    }
    return '';
  }
}
