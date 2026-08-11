import { bus } from '../core/EventBus.js';
import { GameTimeService } from '../services/GameTimeService.js';
import { SaveService } from '../services/SaveService.js';
import { EconomyService } from '../services/EconomyService.js';
import { ServerClient } from '../services/ServerClient.js';
import { PlayerState } from './PlayerState.js';
import { NullUi, type UiBridge } from './UiBridge.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { LootSystem } from '../systems/LootSystem.js';
import { SurvivalSystem } from '../systems/SurvivalSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { JobSystem } from '../systems/JobSystem.js';
import { SleepSystem } from '../systems/SleepSystem.js';
import { EventSystem } from '../systems/EventSystem.js';
import { HousingSystem } from '../systems/HousingSystem.js';
import { BusinessSystem } from '../systems/BusinessSystem.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import type { PlayerSnapshot } from '../../types/player.js';

/**
 * Склейка всего: один объект, через который системы видят друг друга.
 * Живёт ровно столько, сколько идёт партия, и пересоздаётся при новой игре.
 */
export class GameContext {
  static current: GameContext | null = null;

  player!: PlayerState;
  time!: GameTimeService;
  inventory!: InventorySystem;
  loot!: LootSystem;
  survival!: SurvivalSystem;
  economy!: EconomyService;
  quests!: QuestSystem;
  jobs!: JobSystem;
  sleep!: SleepSystem;
  events!: EventSystem;
  housing!: HousingSystem;
  business!: BusinessSystem;
  achievements!: AchievementSystem;

  ui: UiBridge = NullUi;
  /** Игрок сейчас внутри помещения: влияет на тепло и погоду. */
  isIndoors = false;
  /** Куда возвращать игрока после потери сознания. Ставит GameScene. */
  respawnHandler: (() => void) | null = null;

  private dirty = false;

  constructor(snapshot: PlayerSnapshot) {
    // Порядок важен: системы читают ctx.time и ctx.player в конструкторах.
    this.player = new PlayerState(snapshot);
    this.time = new GameTimeService(snapshot.day, snapshot.minutes, snapshot.playedMinutes);
    this.inventory = new InventorySystem(this);
    this.quests = new QuestSystem(this);
    this.achievements = new AchievementSystem(this);
    this.loot = new LootSystem(this);
    this.survival = new SurvivalSystem(this);
    this.economy = new EconomyService(this);
    this.jobs = new JobSystem(this);
    this.sleep = new SleepSystem(this);
    this.events = new EventSystem(this);
    this.housing = new HousingSystem(this);
    this.business = new BusinessSystem(this);

    GameContext.current = this;
  }

  static require(): GameContext {
    if (!GameContext.current) throw new Error('GameContext ещё не создан');
    return GameContext.current;
  }

  markDirty(): void {
    this.dirty = true;
  }

  /** Синхронизирует время и позицию в снимок перед записью. */
  syncSnapshot(position?: { x: number; y: number }): PlayerSnapshot {
    const snapshot = this.time.snapshot;
    this.player.data.day = snapshot.day;
    this.player.data.minutes = snapshot.minutes;
    this.player.data.playedMinutes = Math.round(this.time.totalPlayedMinutes);
    if (position) this.player.data.position = { x: Math.round(position.x), y: Math.round(position.y) };
    return this.player.data;
  }

  save(force = false): void {
    SaveService.write(this.syncSnapshot(), force || this.dirty);
    this.dirty = false;
  }

  respawnAtSafeSpot(): void {
    this.respawnHandler?.();
  }

  /** Начало нового игрового дня: аренда, бизнес, сброс мусорок и ассортимента. */
  onNewDay(): void {
    this.player.data.searchedToday = [];
    this.player.data.shopDay = this.time.snapshot.day;
    this.player.data.shopStock = {};
    this.housing.dailyTick();
    this.business.dailyTick();
    this.quests.checkAutoStarts();
    this.achievements.check();
    this.submitScore();
    this.save(true);
    bus.emit('ui:refresh', undefined);
  }

  /** Отправка результата в глобальный рейтинг. Оффлайн — просто ничего не произойдёт. */
  submitScore(): void {
    const p = this.player;
    void ServerClient.submitScore({
      wealth: p.wealth,
      reputation: p.totalReputation,
      days: this.time.snapshot.day,
      collections: p.data.collections.length,
      level: p.data.level,
      playedMinutes: this.time.totalPlayedMinutes,
      nickname: p.data.nickname
    });
  }

  destroy(): void {
    if (GameContext.current === this) GameContext.current = null;
  }
}
