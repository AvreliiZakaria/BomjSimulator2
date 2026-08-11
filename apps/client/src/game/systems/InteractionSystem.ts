import { GameConfig } from '../config/GameConfig.js';
import { bus } from '../core/EventBus.js';
import { InputState } from '../core/InputStateManager.js';
import { evaluateCondition } from './Conditions.js';
import { getNpc } from '../../data/npc.js';
import type { InteractableDef } from '../../types/world.js';
import type { NpcActor } from '../entities/NpcActor.js';
import type { GameContext } from '../state/GameContext.js';

export interface InteractionTarget {
  kind: 'object' | 'npc';
  label: string;
  def?: InteractableDef;
  npc?: NpcActor;
  distance: number;
}

export interface InteractionHandlers {
  onSearch(def: InteractableDef): void;
  onTravel(districtId: string): void;
  onSit(def: InteractableDef): void;
  onSleep(def: InteractableDef): void;
  onDoor(def: InteractableDef): void;
}

/**
 * Универсальная система взаимодействия: мусорки, лавочки, двери, NPC,
 * магазины, места сна, тайники, транспорт. Всегда выбирает ближайший валидный объект.
 */
export class InteractionSystem {
  private current: InteractionTarget | null = null;

  constructor(
    private readonly ctx: GameContext,
    private readonly handlers: InteractionHandlers
  ) {}

  get target(): InteractionTarget | null {
    return this.current;
  }

  /** Ищем ближайшую цель. Вызывается каждый кадр, дёшево. */
  update(playerX: number, playerY: number, objects: InteractableDef[], npcs: NpcActor[]): void {
    let best: InteractionTarget | null = null;
    const hour = this.ctx.time.snapshot.hour;

    for (const def of objects) {
      const radius = def.radius ?? GameConfig.interaction.promptRadius;
      const distance = Math.hypot(def.x - playerX, def.y - playerY);
      if (distance > radius) continue;
      if (!best || distance < best.distance) {
        best = { kind: 'object', label: def.label, def, distance };
      }
    }

    for (const npc of npcs) {
      if (!npc.isActive(hour)) continue;
      const distance = Math.hypot(npc.x - playerX, npc.y - playerY);
      if (distance > GameConfig.interaction.promptRadius) continue;
      if (!best || distance < best.distance) {
        best = { kind: 'npc', label: npc.definition.name, npc, distance };
      }
    }

    const changed = best?.label !== this.current?.label || best?.kind !== this.current?.kind;
    this.current = best;
    if (changed) {
      bus.emit(
        'interaction:target',
        best ? { label: best.label, kind: best.kind === 'npc' ? 'npc' : best.def?.kind ?? 'object' } : null
      );
    }
  }

  /** Нажали E / контекстную кнопку. */
  interact(): void {
    if (!InputState.canInteract || !this.current) return;
    const target = this.current;

    if (target.kind === 'npc' && target.npc) {
      const definition = getNpc(target.npc.definition.id) ?? target.npc.definition;
      target.npc.faceTowards(this.ctx.player.data.position.x, this.ctx.player.data.position.y);
      this.ctx.quests.notify('talk', definition.id, 1);
      this.ctx.ui.showDialogue(definition);
      return;
    }

    const def = target.def;
    if (!def) return;

    if (def.conditions && !evaluateCondition(this.ctx, def.conditions)) {
      this.ctx.ui.toast(def.lockedText ?? 'Пока недоступно', 'bad');
      return;
    }

    this.ctx.quests.notify('interact', def.id, 1);

    switch (def.kind) {
      case 'dumpster':
      case 'bin':
      case 'stash':
        this.handlers.onSearch(def);
        break;
      case 'bench':
        this.handlers.onSit(def);
        break;
      case 'sleep':
        this.handlers.onSleep(def);
        break;
      case 'shop':
        if (def.shopId) this.ctx.ui.showShop(def.shopId);
        break;
      case 'job':
        this.ctx.ui.showJobs(this.ctx.player.data.district);
        break;
      case 'home':
        this.ctx.ui.showPhone('housing');
        break;
      case 'business':
        this.ctx.ui.showPhone('business');
        break;
      case 'atm':
        this.ctx.ui.showPhone('bank');
        break;
      case 'casino':
        this.ctx.ui.showPhone('casino');
        break;
      case 'transit':
        if (def.targetDistrict) this.handlers.onTravel(def.targetDistrict);
        break;
      case 'door':
        this.handlers.onDoor(def);
        break;
      case 'sign':
        void this.ctx.ui.message(def.label, String(def.data?.text ?? 'Ничего интересного.'));
        break;
      default:
        this.ctx.ui.toast('Ничего не происходит', 'neutral');
        break;
    }
  }
}
