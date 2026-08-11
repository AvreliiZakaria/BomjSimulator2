import { evaluateCondition } from '../../game/systems/Conditions.js';
import { applyEffect } from '../../game/systems/Effects.js';
import { Modal } from '../Modal.js';
import { el, onTap } from '../dom.js';
import type { DialogueNode, NpcDefinition } from '../../types/npc.js';
import type { GameContext } from '../../game/state/GameContext.js';

/** Короткие деревья диалогов: никаких стен текста, условия и последствия — из данных. */
export function showDialogue(
  parent: HTMLElement,
  ctx: GameContext,
  npc: NpcDefinition,
  openShop: (shopId: string) => void,
  openJobs: () => void
): Modal {
  const relation = ctx.player.getRelationship(npc.id);
  const modal = new Modal(parent, {
    title: npc.name.toUpperCase(),
    subtitle: npc.title + (relation ? ' · отношение ' + Math.round(relation) : ''),
    inputMode: 'DIALOGUE'
  });

  const pickNode = (nodeId?: string): DialogueNode | null => {
    if (nodeId) return npc.dialogue.find((node) => node.id === nodeId) ?? null;
    for (const node of npc.dialogue) {
      if (evaluateCondition(ctx, node.conditions)) return node;
    }
    return npc.dialogue[0] ?? null;
  };

  const renderNode = (node: DialogueNode | null): void => {
    if (!node) {
      modal.close();
      return;
    }

    applyEffect(ctx, node.onEnter);

    const body = el('div', {}, [el('div', { class: 'modal__text', text: node.text })]);
    const choices = el('div', { class: 'list' });
    choices.style.marginTop = '16px';

    for (const choice of node.choices) {
      const allowed = evaluateCondition(ctx, choice.conditions);
      if (!allowed && !choice.showLocked && choice.conditions) continue;

      const button = el('button', {
        class: allowed ? 'row row--clickable' : 'row row--locked',
        style: 'text-align:left'
      }, [
        el('div', { class: 'row__main' }, [
          el('div', { class: 'row__title', text: choice.text }),
          !allowed && choice.lockedHint ? el('div', { class: 'row__desc', text: choice.lockedHint }) : null
        ])
      ]);

      if (allowed) {
        onTap(button, () => {
          applyEffect(ctx, choice.effects);
          ctx.save(true);

          if (choice.openShop) {
            modal.close();
            openShop(choice.openShop);
            return;
          }
          if (choice.openJobs) {
            modal.close();
            openJobs();
            return;
          }
          if (choice.next === null || choice.next === undefined) {
            modal.close();
            return;
          }
          renderNode(pickNode(choice.next));
        });
      }

      choices.append(button);
    }

    body.append(choices);
    modal.setContent(body);
    modal.setFooter(modal.button('УЙТИ', () => modal.close(), 'ghost'));
  };

  renderNode(pickNode());
  return modal;
}
