import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig.js';
import { bus } from '../core/EventBus.js';
import { InputState } from '../core/InputStateManager.js';
import { VirtualInput } from '../core/VirtualInput.js';
import { clamp } from '../core/rng.js';
import { Settings } from '../services/SettingsService.js';
import { GameContext } from '../state/GameContext.js';
import { DistrictBuilder, type BuiltDistrict } from '../world/DistrictBuilder.js';
import { Player } from '../entities/Player.js';
import { NpcActor } from '../entities/NpcActor.js';
import { TrafficSystem } from '../systems/TrafficSystem.js';
import { CrowdSystem } from '../systems/CrowdSystem.js';
import { InteractionSystem } from '../systems/InteractionSystem.js';
import { DayNight } from '../effects/DayNight.js';
import { evaluateCondition } from '../systems/Conditions.js';
import { getDistrict, DISTRICTS } from '../../data/districts/index.js';
import { getNpc } from '../../data/npc.js';
import { requireItem } from '../../data/items.js';
import type { InteractableDef } from '../../types/world.js';
import type { SleepQuality } from '../systems/SleepSystem.js';

export class GameScene extends Phaser.Scene {
  private ctx!: GameContext;
  private player!: Player;
  private world: BuiltDistrict | null = null;
  private npcs: NpcActor[] = [];
  private traffic: TrafficSystem | null = null;
  private crowd: CrowdSystem | null = null;
  private interaction!: InteractionSystem;
  private dayNight!: DayNight;
  private interactables: InteractableDef[] = [];
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private unsubscribers: (() => void)[] = [];
  private sitStartMinutes: number | null = null;
  private saveTimer = 0;

  constructor() {
    super('Game');
  }

  create(): void {
    this.ctx = GameContext.require();
    // Полный сброс управления при каждом входе в сцену:
    // цикл GameScene -> Меню -> GameScene не должен ломать ввод.
    InputState.reset('GAMEPLAY');
    VirtualInput.reset();

    this.cameras.main.setBackgroundColor('#1a1d24');

    const districtId = this.ctx.player.data.district;
    this.buildDistrict(districtId, true);

    this.dayNight = new DayNight(this);

    this.interaction = new InteractionSystem(this.ctx, {
      onSearch: (def) => this.handleSearch(def),
      onTravel: (target) => this.travelTo(target),
      onSit: (def) => this.handleSleepSpot(def),
      onSleep: (def) => this.handleSleepSpot(def),
      onDoor: (def) => this.handleDoor(def)
    });

    this.setupInput();
    this.setupEvents();

    this.ctx.respawnHandler = () => {
      const district = getDistrict(this.ctx.player.data.district);
      if (district) this.player.setPosition(district.spawn.x, district.spawn.y);
    };

    this.ctx.quests.checkAutoStarts();
    bus.emit('ui:refresh', undefined);
    bus.emit('district:changed', {
      districtId,
      name: getDistrict(districtId)?.name ?? 'Город'
    });

    this.events.once('shutdown', () => this.teardown());
    this.events.once('destroy', () => this.teardown());
  }

  // ─────────────────────────── МИР ───────────────────────────

  private buildDistrict(districtId: string, initial = false): void {
    const district = getDistrict(districtId) ?? DISTRICTS.residential!;
    this.world = DistrictBuilder.build(this, district);
    this.interactables = district.interactables;

    const saved = this.ctx.player.data.position;
    const useSaved = initial && saved && saved.x > 0 && saved.y > 0 && this.ctx.player.data.district === district.id;
    const spawnX = useSaved ? saved.x : district.spawn.x;
    const spawnY = useSaved ? saved.y : district.spawn.y;

    if (!this.player) {
      this.player = new Player(this, spawnX, spawnY, this.ctx.player.data.appearance);
    } else {
      this.player.setPosition(spawnX, spawnY);
    }
    this.player.setBackpack(Boolean(this.ctx.player.equipped('backpack')));
    this.physics.add.collider(this.player.sprite, this.world.colliders);

    for (const spawn of district.npcs) {
      const definition = getNpc(spawn.npcId);
      if (!definition) continue;
      this.npcs.push(new NpcActor(this, definition, spawn));
    }

    this.traffic = new TrafficSystem(this, district);
    this.crowd = new CrowdSystem(this, district);

    const bounds = district.bounds;
    this.physics.world.setBounds(bounds.x, bounds.y, bounds.w, bounds.h);
    this.cameras.main.setBounds(bounds.x, bounds.y, bounds.w, bounds.h);
    this.applyCamera();
    this.cameras.main.startFollow(this.player.sprite, true, GameConfig.camera.lerp, GameConfig.camera.lerp);
  }

  private teardownDistrict(): void {
    this.world?.destroy();
    this.world = null;
    for (const npc of this.npcs) npc.destroy();
    this.npcs = [];
    this.traffic?.clear();
    this.traffic = null;
    this.crowd?.clear();
    this.crowd = null;
  }

  private applyCamera(): void {
    const mobile = this.scale.width < GameConfig.ui.mobileBreakpoint;
    const targetWidth = mobile
      ? GameConfig.camera.targetViewWidthMobile
      : GameConfig.camera.targetViewWidthDesktop;
    const zoom = clamp(this.scale.width / targetWidth, 0.75, 2.2);
    this.cameras.main.setZoom(zoom);

    const deadzone = mobile ? GameConfig.camera.deadzoneMobile : GameConfig.camera.deadzoneDesktop;
    this.cameras.main.setDeadzone(deadzone.w, deadzone.h);
  }

  // ─────────────────────────── ВВОД ───────────────────────────

  private setupInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys('W,A,S,D,E,ESC,I,M,TAB,J') as Record<string, Phaser.Input.Keyboard.Key>;

    keyboard.on('keydown-E', () => this.interaction.interact());
    keyboard.on('keydown-ESC', () => this.ctx.ui.showPause());
    keyboard.on('keydown-I', () => {
      if (InputState.canInteract) this.ctx.ui.showInventory();
    });
    keyboard.on('keydown-M', () => {
      if (InputState.canInteract) this.ctx.ui.showPhone('map');
    });
  }

  private readInput(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    if (this.cursors) {
      if (this.cursors.left.isDown || this.keys?.A?.isDown) x -= 1;
      if (this.cursors.right.isDown || this.keys?.D?.isDown) x += 1;
      if (this.cursors.up.isDown || this.keys?.W?.isDown) y -= 1;
      if (this.cursors.down.isDown || this.keys?.S?.isDown) y += 1;
    }
    if (Math.abs(VirtualInput.x) > 0.05 || Math.abs(VirtualInput.y) > 0.05) {
      x += VirtualInput.x;
      y += VirtualInput.y;
    }
    return { x: clamp(x, -1, 1), y: clamp(y, -1, 1) };
  }

  private setupEvents(): void {
    this.unsubscribers.push(
      bus.on('time:hour', () => {
        this.ctx.quests.checkAutoStarts();
        this.ctx.events.tick();
        this.ctx.achievements.check();
      }),
      bus.on('time:day', () => this.ctx.onNewDay()),
      bus.on('equipment:changed', () => {
        this.player.setBackpack(Boolean(this.ctx.player.equipped('backpack')));
      })
    );

    this.scale.on('resize', this.applyCamera, this);
    this.unsubscribers.push(() => this.scale.off('resize', this.applyCamera, this));
  }

  // ─────────────────────────── ДЕЙСТВИЯ ───────────────────────────

  private handleSearch(def: InteractableDef): void {
    if (!def.lootTable) return;
    if (this.ctx.player.data.searchedToday.includes(def.id)) {
      this.ctx.ui.toast('Тут уже пусто. Завтра снова накидают.', 'neutral');
      return;
    }

    InputState.push('TRANSITION');
    this.player.setBusy('search');
    this.ctx.ui.toast('Копаешься...', 'neutral');

    this.time.delayedCall(GameConfig.player.searchSeconds * 1000, () => {
      this.player.setBusy(null);
      InputState.pop('TRANSITION');

      this.ctx.time.skip(GameConfig.interaction.searchMinutes);
      this.ctx.survival.resync();
      this.ctx.player.modifyStats({
        hygiene: GameConfig.interaction.searchHygieneCost,
        energy: GameConfig.interaction.searchEnergyCost
      });

      this.ctx.player.data.searchedToday.push(def.id);
      const results = this.ctx.loot.roll(def.lootTable!);
      this.ctx.ui.showLoot(
        results.map((entry) => ({
          name: entry.name,
          count: entry.count,
          money: entry.money,
          rarity: entry.rarity
        }))
      );
      this.ctx.save(true);
    });
  }

  private handleSleepSpot(def: InteractableDef): void {
    const quality = (def.sleepSpotId ?? 'ground') as SleepQuality;
    this.ctx.ui.showSleep(def.id, quality);
  }

  private handleDoor(def: InteractableDef): void {
    const flag = def.data?.flag;
    if (typeof flag === 'string') {
      this.ctx.player.setFlag(flag, 1);
      this.ctx.quests.checkAutoStarts();
      this.ctx.player.modifyStats({ sanity: -6 });
      void this.ctx.ui.message(
        def.label,
        'Ключ поворачивается легко, будто его тут и ждали. За дверью — двор. Тот самый, с которого ты начинал. Только пустой и без единого звука.'
      );
      this.ctx.save(true);
      return;
    }
    this.ctx.ui.toast('Заперто', 'neutral');
  }

  /** Переход между районами с проверкой условий открытия. */
  travelTo(districtId: string): void {
    const target = getDistrict(districtId);
    if (!target) {
      this.ctx.ui.toast('Туда пока не ходят автобусы', 'neutral');
      return;
    }

    if (!this.ctx.player.isDistrictUnlocked(districtId)) {
      if (!evaluateCondition(this.ctx, target.unlock)) {
        this.ctx.ui.toast(target.unlockText ?? 'Район пока закрыт', 'bad');
        return;
      }
      this.ctx.player.unlockDistrict(districtId);
      this.ctx.player.addXp(150);
      this.ctx.ui.toast(`Открыт район: ${target.name}`, 'good');
    }

    InputState.push('TRANSITION');
    this.cameras.main.fadeOut(320, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.teardownDistrict();
      this.ctx.player.data.district = districtId;
      this.ctx.player.data.position = { x: target.spawn.x, y: target.spawn.y };
      this.buildDistrict(districtId);
      this.ctx.time.skip(25);
      this.ctx.survival.resync();
      this.ctx.quests.notify('visit', districtId, 1);
      this.ctx.save(true);

      bus.emit('district:changed', { districtId, name: target.name });
      this.cameras.main.fadeIn(320, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        InputState.pop('TRANSITION');
      });
    });
  }

  /** Отдых на лавочке: вызывается из UI сна. */
  restOnSpot(minutes: number): void {
    this.player.setBusy('sit');
    this.ctx.time.skip(minutes);
    this.ctx.survival.resync();
    this.ctx.player.modifyStats({
      energy: (minutes / 60) * GameConfig.interaction.benchRestEnergy,
      sanity: (minutes / 60) * 2,
      hunger: -(minutes / 60) * 1.5
    });
    this.time.delayedCall(500, () => this.player.setBusy(null));
    this.ctx.save(true);
  }

  /** Анимация еды: вызывается из инвентаря. */
  playEat(): void {
    if (!this.player || this.player.isBusy) return;
    this.player.setBusy('eat');
    this.time.delayedCall(700, () => this.player.setBusy(null));
  }

  // ─────────────────────────── ЦИКЛ ───────────────────────────

  override update(_time: number, delta: number): void {
    if (!this.ctx || !this.player) return;

    const canMove = InputState.canMove;
    const input = canMove ? this.readInput() : { x: 0, y: 0 };

    let speedMul = 1;
    if (this.ctx.player.isOverweight) speedMul *= GameConfig.player.overweightSpeedMul;
    if (this.ctx.player.stat('energy') < 15) speedMul *= GameConfig.player.tiredSpeedMul;

    this.player.update(delta, input, speedMul);

    this.ctx.time.update(delta);
    this.ctx.survival.update();

    const snapshot = this.ctx.time.snapshot;
    const quality = Settings.quality;

    for (const npc of this.npcs) npc.update(delta, snapshot.hour);
    this.traffic?.update(delta, quality, snapshot.period);
    this.crowd?.update(delta, quality, snapshot.period, this.world?.district.crowdDensity ?? 0.6);
    this.dayNight.update(delta, snapshot, this.world);

    this.interaction.update(this.player.x, this.player.y, this.interactables, this.npcs);

    if (VirtualInput.consumeAction()) this.interaction.interact();

    // Позиция нужна диалогам и сейву.
    this.ctx.player.data.position = { x: Math.round(this.player.x), y: Math.round(this.player.y) };

    this.saveTimer += delta;
    if (this.saveTimer > 20000) {
      this.saveTimer = 0;
      this.ctx.save();
    }
  }

  /** Полная очистка: без неё повторные входы в сцену копили бы подписки. */
  private teardown(): void {
    for (const off of this.unsubscribers) off();
    this.unsubscribers = [];
    this.teardownDistrict();
    this.dayNight?.destroy();
    this.player?.destroy();
    this.player = undefined as unknown as Player;
    this.ctx.respawnHandler = null;
    this.input.keyboard?.removeAllListeners();
  }

  /** Используется UI: сколько весит предмет в руках игрока. */
  itemName(itemId: string): string {
    return requireItem(itemId).name;
  }
}
