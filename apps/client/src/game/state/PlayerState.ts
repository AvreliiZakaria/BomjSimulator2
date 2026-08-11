import { GameConfig } from '../config/GameConfig.js';
import { bus } from '../core/EventBus.js';
import { clamp } from '../core/rng.js';
import { requireItem } from '../../data/items.js';
import type { EquipSlot, InventoryStack, StatusEffectId } from '../../types/items.js';
import type { ReputationTrack, SkillId, SurvivalStat } from '../../types/logic.js';
import type { Appearance, PlayerSnapshot, SurvivalStats } from '../../types/player.js';

const EMPTY_EQUIPMENT: Record<EquipSlot, string | null> = {
  head: null,
  top: null,
  bottom: null,
  shoes: null,
  backpack: null,
  accessory: null,
  tool: null
};

export const DEFAULT_APPEARANCE: Appearance = {
  skin: '#d8a37a',
  hair: '#3b2b22',
  hairStyle: 'short',
  top: '#4a5a72',
  bottom: '#33384a',
  shoes: '#2b2b30',
  preset: 'default'
};

/**
 * Единственный authoritative state игрока.
 * Деньги, показатели и инвентарь меняются ТОЛЬКО через методы этого класса,
 * который затем публикует события. HUD и сейв читают отсюда, ничего не пересчитывая.
 */
export class PlayerState {
  data: PlayerSnapshot;

  constructor(snapshot: PlayerSnapshot) {
    this.data = snapshot;
  }

  static createNew(nickname: string, appearance: Appearance): PlayerSnapshot {
    const start = GameConfig.survival.start;
    return {
      nickname,
      appearance,
      survival: { ...start },
      statuses: [],
      cash: GameConfig.economy.startCash,
      bank: 0,
      bankUnlocked: false,
      xp: 0,
      level: 1,
      skills: { survival: 1, trade: 1, charisma: 1, work: 1, luck: 1 },
      skillXp: { survival: 0, trade: 0, charisma: 0, work: 0, luck: 0 },
      inventory: [],
      equipment: { ...EMPTY_EQUIPMENT, top: 'tshirt', bottom: 'sweatpants', shoes: 'worn_shoes' },
      quests: {},
      flags: {},
      relationships: {},
      reputation: { street: 0, city: 0, business: 0, law: 0 },
      unlockedDistricts: ['residential'],
      district: 'residential',
      position: { x: 0, y: 0 },
      housing: { id: null, upgrades: [], storage: [], paidUntilDay: 0 },
      businesses: [],
      achievements: [],
      collections: [],
      day: GameConfig.time.startDay,
      minutes: GameConfig.time.startMinutes,
      playedMinutes: 0,
      nightsAfterThree: 0,
      searchedToday: [],
      jobCooldowns: {},
      eventCooldowns: {},
      shopDay: 0,
      shopStock: {}
    };
  }

  // ─────────────────────────── ДЕНЬГИ ───────────────────────────

  get cash(): number {
    return this.data.cash;
  }

  get bank(): number {
    return this.data.bank;
  }

  get wealth(): number {
    return this.data.cash + this.data.bank;
  }

  addCash(amount: number, reason = 'unknown'): void {
    if (!Number.isFinite(amount) || amount === 0) return;
    this.data.cash = Math.max(0, Math.round((this.data.cash + amount) * 100) / 100);
    this.emitMoney(amount, reason);
  }

  canAfford(amount: number): boolean {
    return this.data.cash >= amount;
  }

  spendCash(amount: number, reason = 'unknown'): boolean {
    if (amount <= 0) return true;
    if (this.data.cash < amount) return false;
    this.data.cash = Math.round((this.data.cash - amount) * 100) / 100;
    this.emitMoney(-amount, reason);
    return true;
  }

  deposit(amount: number): boolean {
    if (!this.data.bankUnlocked || amount <= 0 || this.data.cash < amount) return false;
    this.data.cash -= amount;
    this.data.bank += amount;
    this.emitMoney(0, 'deposit');
    return true;
  }

  withdraw(amount: number): boolean {
    if (!this.data.bankUnlocked || amount <= 0 || this.data.bank < amount) return false;
    this.data.bank -= amount;
    this.data.cash += amount;
    this.emitMoney(0, 'withdraw');
    return true;
  }

  addBank(amount: number, reason = 'bank'): void {
    this.data.bank = Math.max(0, this.data.bank + amount);
    this.emitMoney(0, reason);
  }

  private emitMoney(delta: number, reason: string): void {
    bus.emit('money:changed', { cash: this.data.cash, bank: this.data.bank, delta, reason });
  }

  // ─────────────────────────── ПОКАЗАТЕЛИ ───────────────────────────

  get survival(): SurvivalStats {
    return this.data.survival;
  }

  stat(name: SurvivalStat): number {
    return this.data.survival[name];
  }

  modifyStats(delta: Partial<Record<SurvivalStat, number>>, silent = false): void {
    let changed = false;
    for (const [key, value] of Object.entries(delta) as [SurvivalStat, number][]) {
      if (!value) continue;
      const before = this.data.survival[key];
      const after = clamp(before + value, 0, 100);
      if (after !== before) {
        this.data.survival[key] = after;
        changed = true;
      }
    }
    if (changed && !silent) bus.emit('stats:changed', { ...this.data.survival });
  }

  setStat(name: SurvivalStat, value: number): void {
    this.data.survival[name] = clamp(value, 0, 100);
    bus.emit('stats:changed', { ...this.data.survival });
  }

  // ─────────────────────────── СТАТУСЫ ───────────────────────────

  hasStatus(id: StatusEffectId): boolean {
    return this.data.statuses.some((status) => status.id === id);
  }

  addStatus(id: StatusEffectId, minutes?: number): void {
    const duration = minutes ?? GameConfig.survival.statusMinutes[id];
    const existing = this.data.statuses.find((status) => status.id === id);
    if (existing) existing.minutesLeft = Math.max(existing.minutesLeft, duration);
    else this.data.statuses.push({ id, minutesLeft: duration });
    bus.emit('status:changed', [...this.data.statuses]);
  }

  removeStatus(id: StatusEffectId): void {
    const before = this.data.statuses.length;
    this.data.statuses = this.data.statuses.filter((status) => status.id !== id);
    if (this.data.statuses.length !== before) bus.emit('status:changed', [...this.data.statuses]);
  }

  tickStatuses(minutes: number): void {
    if (!this.data.statuses.length) return;
    let changed = false;
    for (const status of this.data.statuses) {
      status.minutesLeft -= minutes;
      if (status.minutesLeft <= 0) changed = true;
    }
    if (changed) {
      this.data.statuses = this.data.statuses.filter((status) => status.minutesLeft > 0);
      bus.emit('status:changed', [...this.data.statuses]);
    }
  }

  // ─────────────────────────── ОПЫТ И НАВЫКИ ───────────────────────────

  xpForLevel(level: number): number {
    return Math.round(GameConfig.progression.xpBase * Math.pow(GameConfig.progression.xpGrowth, level - 1));
  }

  get xpToNext(): number {
    return this.xpForLevel(this.data.level);
  }

  addXp(amount: number): void {
    if (amount <= 0) return;
    this.data.xp += amount;
    let leveled = false;
    while (this.data.xp >= this.xpToNext && this.data.level < GameConfig.progression.maxLevel) {
      this.data.xp -= this.xpToNext;
      this.data.level += 1;
      leveled = true;
      bus.emit('level:up', { level: this.data.level });
    }
    bus.emit('xp:changed', {
      xp: this.data.xp,
      level: this.data.level,
      toNext: this.xpToNext,
      progress: this.data.xp / this.xpToNext
    });
    if (leveled) bus.emit('ui:refresh', undefined);
  }

  skill(id: SkillId): number {
    return this.data.skills[id] ?? 1;
  }

  addSkillXp(id: SkillId, amount: number): void {
    if (amount <= 0) return;
    this.data.skillXp[id] = (this.data.skillXp[id] ?? 0) + amount;
    const needed = GameConfig.progression.skillXpPerLevel * this.skill(id);
    if (this.data.skillXp[id]! >= needed && this.skill(id) < GameConfig.progression.maxSkill) {
      this.data.skillXp[id] = 0;
      this.data.skills[id] = this.skill(id) + 1;
      bus.emit('toast', { text: `Навык вырос: ${id} → ${this.data.skills[id]}`, tone: 'good' });
    }
  }

  // ─────────────────────────── ФЛАГИ / ОТНОШЕНИЯ / РЕПУТАЦИЯ ───────────────────────────

  getFlag(key: string): number {
    return this.data.flags[key] ?? 0;
  }

  hasFlag(key: string): boolean {
    return (this.data.flags[key] ?? 0) > 0;
  }

  setFlag(key: string, value: number | boolean): void {
    this.data.flags[key] = typeof value === 'boolean' ? (value ? 1 : 0) : value;
  }

  addFlag(key: string, delta = 1): number {
    this.data.flags[key] = this.getFlag(key) + delta;
    return this.data.flags[key]!;
  }

  getRelationship(npcId: string): number {
    return this.data.relationships[npcId] ?? 0;
  }

  changeRelationship(npcId: string, delta: number): void {
    const charismaBonus = delta > 0 ? delta * GameConfig.progression.skillBonus.charismaRelation * (this.skill('charisma') - 1) : 0;
    this.data.relationships[npcId] = clamp(this.getRelationship(npcId) + delta + charismaBonus, -100, 100);
  }

  getReputation(track: ReputationTrack): number {
    return this.data.reputation[track] ?? 0;
  }

  changeReputation(track: ReputationTrack, delta: number): void {
    this.data.reputation[track] = clamp(this.getReputation(track) + delta, -100, 100);
  }

  get totalReputation(): number {
    return Object.values(this.data.reputation).reduce((sum, value) => sum + value, 0);
  }

  // ─────────────────────────── ЭКИПИРОВКА И ВЕС ───────────────────────────

  equipped(slot: EquipSlot): string | null {
    return this.data.equipment[slot] ?? null;
  }

  private sumPassive(key: 'warmth' | 'capacity' | 'style' | 'tradeBonus' | 'searchBonus'): number {
    let total = 0;
    for (const itemId of Object.values(this.data.equipment)) {
      if (!itemId) continue;
      const value = requireItem(itemId).passive?.[key];
      if (typeof value === 'number') total += value;
    }
    return total;
  }

  get warmthFromClothes(): number {
    return this.sumPassive('warmth');
  }

  get styleScore(): number {
    return this.sumPassive('style');
  }

  get tradeBonus(): number {
    return this.sumPassive('tradeBonus') + (this.skill('trade') - 1) * GameConfig.progression.skillBonus.tradePrice;
  }

  get searchBonus(): number {
    return this.sumPassive('searchBonus');
  }

  get capacity(): number {
    return GameConfig.inventory.baseCapacity + this.sumPassive('capacity');
  }

  get carriedWeight(): number {
    let total = 0;
    for (const stack of this.data.inventory) total += requireItem(stack.itemId).weight * stack.count;
    return Math.round(total * 100) / 100;
  }

  get isOverweight(): boolean {
    return this.carriedWeight > this.capacity;
  }

  get inventory(): InventoryStack[] {
    return this.data.inventory;
  }

  // ─────────────────────────── РАЙОНЫ / ДОСТИЖЕНИЯ ───────────────────────────

  isDistrictUnlocked(id: string): boolean {
    return this.data.unlockedDistricts.includes(id);
  }

  unlockDistrict(id: string): boolean {
    if (this.isDistrictUnlocked(id)) return false;
    this.data.unlockedDistricts.push(id);
    return true;
  }

  hasAchievement(id: string): boolean {
    return this.data.achievements.includes(id);
  }

  unlockAchievement(id: string, name: string): boolean {
    if (this.hasAchievement(id)) return false;
    this.data.achievements.push(id);
    bus.emit('achievement', { id, name });
    return true;
  }

  addCollection(id: string): boolean {
    if (this.data.collections.includes(id)) return false;
    this.data.collections.push(id);
    return true;
  }

  /** Есть ли телефон — от него зависят приложения (карта, банк, работа, рейтинг). */
  get hasPhone(): boolean {
    return this.data.inventory.some((stack) => requireItem(stack.itemId).tags.includes('phone'));
  }

  get hasSmartPhone(): boolean {
    return this.data.inventory.some((stack) => requireItem(stack.itemId).tags.includes('smart'));
  }
}
