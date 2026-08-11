import type Phaser from 'phaser';
import { bus } from '../game/core/EventBus.js';
import { InputState } from '../game/core/InputStateManager.js';
import { SaveService } from '../game/services/SaveService.js';
import { GameContext } from '../game/state/GameContext.js';
import type { UiBridge } from '../game/state/UiBridge.js';
import type { SleepQuality } from '../game/systems/SleepSystem.js';
import type { GameScene } from '../game/scenes/GameScene.js';
import { Hud } from './Hud.js';
import { Joystick } from './Joystick.js';
import { ToastStack } from './Toast.js';
import { MainMenuUi } from './screens/MainMenuUi.js';
import { showInventory } from './modals/InventoryModal.js';
import { showShop } from './modals/ShopModal.js';
import { showDialogue } from './modals/DialogueModal.js';
import { showEvent } from './modals/EventModal.js';
import { showJobs } from './modals/JobsModal.js';
import { showSleep } from './modals/SleepModal.js';
import { showPhone, type PhoneApp } from './modals/PhoneModal.js';
import { showPause } from './modals/PauseModal.js';
import { showSettings } from './modals/SettingsModal.js';
import { showNews, showStore } from './modals/MetaModals.js';
import { confirmModal, lootModal, messageModal } from './modals/SimpleModals.js';
import { uiRoot } from './dom.js';
import type { RandomEventDefinition } from '../types/events.js';
import type { NpcDefinition } from '../types/npc.js';

export interface UiHooks {
  newGame(): void;
  continueGame(): void;
  exitToMenu(): void;
}

/** Владелец всего DOM-интерфейса и единственная реализация UiBridge. */
export class UiManager implements UiBridge {
  private readonly root: HTMLElement;
  private readonly toasts: ToastStack;
  private readonly joystick: Joystick;
  private hud: Hud | null = null;
  private menu: MainMenuUi | null = null;
  private game: Phaser.Game | null = null;

  constructor(private readonly hooks: UiHooks) {
    this.root = uiRoot();
    this.toasts = new ToastStack(this.root);
    this.joystick = new Joystick(this.root);
    this.joystick.setVisible(false);

    bus.on('toast', (payload) => this.toasts.push(payload.text, payload.tone));
    bus.on('achievement', (payload) => this.toasts.push('Достижение: ' + payload.name, 'good'));
    bus.on('level:up', (payload) => this.toasts.push('Уровень ' + payload.level, 'good'));
  }

  attachGame(game: Phaser.Game): void {
    this.game = game;
  }

  private get ctx(): GameContext | null {
    return GameContext.current;
  }

  private get scene(): GameScene | null {
    const scene = this.game?.scene.getScene('Game');
    return (scene as GameScene | null) ?? null;
  }

  /** Контекст для меню-экранов: если партия не идёт, читаем сейв только для просмотра. */
  private viewingContext(): GameContext | null {
    if (this.ctx) return this.ctx;
    const snapshot = SaveService.load();
    if (!snapshot) return null;
    const context = new GameContext(snapshot);
    context.ui = this;
    return context;
  }

  // ─────────────────────────── ЭКРАНЫ ───────────────────────────

  showMenu(): void {
    this.hideHud();
    this.menu?.destroy();
    this.menu = new MainMenuUi(this.root, {
      onContinue: () => this.hooks.continueGame(),
      onNewGame: () => this.hooks.newGame(),
      onCharacter: () => this.openMetaApp('character'),
      onLeaderboard: () => this.openMetaApp('rating'),
      onCollection: () => this.openMetaApp('collection'),
      onShop: () => showStore(this.root),
      onNews: () => showNews(this.root),
      onSettings: () => showSettings(this.root)
    });
  }

  hideMenu(): void {
    this.menu?.destroy();
    this.menu = null;
  }

  private openMetaApp(app: PhoneApp): void {
    const context = this.viewingContext();
    if (!context) {
      void messageModal(this.root, 'Пока нечего показывать', 'Начни новую игру — и здесь появятся твои цифры.');
      return;
    }
    showPhone(this.root, context, app);
  }

  showHud(): void {
    if (this.hud) return;
    this.hud = new Hud(this.root, {
      onInventory: () => this.showInventory(),
      onPhone: () => this.showPhone(),
      onMenu: () => this.showPause()
    });
    this.hud.setPromptListener((label) => this.joystick.setActionLabel(label));
    this.joystick.setVisible(true);
    this.joystick.applyVisibility();
  }

  hideHud(): void {
    this.hud?.destroy();
    this.hud = null;
    this.joystick.setVisible(false);
  }

  // ─────────────────────────── UiBridge ───────────────────────────

  toast(text: string, tone: 'good' | 'bad' | 'neutral' | 'weird' = 'neutral'): void {
    this.toasts.push(text, tone);
  }

  message(title: string, text: string): Promise<void> {
    return messageModal(this.root, title, text);
  }

  confirm(title: string, text: string, okLabel?: string): Promise<boolean> {
    return confirmModal(this.root, title, text, okLabel);
  }

  showEvent(event: RandomEventDefinition): void {
    if (!this.ctx) return;
    showEvent(this.root, this.ctx, event);
  }

  showDialogue(npc: NpcDefinition): void {
    if (!this.ctx) return;
    showDialogue(
      this.root,
      this.ctx,
      npc,
      (shopId) => this.showShop(shopId),
      () => this.showJobs(this.ctx?.player.data.district ?? 'residential')
    );
  }

  showShop(shopId: string): void {
    if (!this.ctx) return;
    showShop(this.root, this.ctx, shopId);
  }

  showJobs(districtId: string): void {
    if (!this.ctx) return;
    showJobs(this.root, this.ctx, districtId);
  }

  showSleep(_spotId: string, quality: SleepQuality): void {
    if (!this.ctx) return;
    showSleep(this.root, this.ctx, quality, (minutes) => this.scene?.restOnSpot(minutes));
  }

  showInventory(): void {
    if (!this.ctx) return;
    showInventory(this.root, this.ctx, () => this.scene?.playEat());
  }

  showPhone(app: string = 'home'): void {
    if (!this.ctx) return;
    const needsPhone = app === 'home' || app === 'map' || app === 'messages' || app === 'rating';
    if (needsPhone && !this.ctx.player.hasPhone) {
      this.toast('Нужен телефон. Поищи в ломбарде.', 'bad');
      return;
    }
    showPhone(this.root, this.ctx, app as PhoneApp, (districtId) => this.showJobs(districtId));
  }

  showPause(): void {
    if (InputState.has('PAUSED')) return;
    showPause(this.root, {
      onResume: () => undefined,
      onInventory: () => this.showInventory(),
      onCharacter: () => this.openMetaApp('character'),
      onMap: () => this.showPhone('map'),
      onAchievements: () => this.openMetaApp('achievements'),
      onMainMenu: () => this.hooks.exitToMenu()
    });
  }

  showLoot(results: { name: string; count: number; money?: number; rarity?: string }[]): void {
    lootModal(this.root, results);
  }

  refresh(): void {
    this.hud?.refresh();
  }
}
