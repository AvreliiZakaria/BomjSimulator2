import { GameConfig } from '../config/GameConfig.js';
import { bus } from '../core/EventBus.js';
import { chance } from '../core/rng.js';
import type { SurvivalStat } from '../../types/logic.js';
import type { GameContext } from '../state/GameContext.js';

/**
 * Показатели выживания. Считает только эта система, HUD ничего не вычисляет.
 * Работает от прожитых игровых минут, поэтому не зависит от FPS и корректно
 * переживает мгновенные скачки времени (работа, сон, поиск).
 */
export class SurvivalSystem {
  private lastMinutes = 0;
  private warnedLow = new Set<SurvivalStat>();

  constructor(private readonly ctx: GameContext) {
    this.lastMinutes = ctx.time.totalPlayedMinutes;
  }

  /** Сбросить точку отсчёта: сон и работа сами начисляют свои эффекты. */
  resync(): void {
    this.lastMinutes = this.ctx.time.totalPlayedMinutes;
  }

  update(): void {
    const now = this.ctx.time.totalPlayedMinutes;
    const elapsed = now - this.lastMinutes;
    if (elapsed <= 0) return;
    this.lastMinutes = now;
    this.apply(elapsed);
  }

  private apply(minutes: number): void {
    const hours = minutes / 60;
    const p = this.ctx.player;
    const cfg = GameConfig.survival;
    const snapshot = this.ctx.time.snapshot;
    const night = snapshot.period === 'NIGHT' || snapshot.period === 'LATE_NIGHT';

    const delta: Partial<Record<SurvivalStat, number>> = {
      hunger: cfg.ratesPerHour.hunger * hours,
      hygiene: cfg.ratesPerHour.hygiene * hours,
      energy: cfg.ratesPerHour.energy * hours,
      sanity: cfg.ratesPerHour.sanity * hours,
      warmth: cfg.ratesPerHour.warmth * hours,
      health: 0
    };

    // Одежда греет, ночь и «после трёх» — забирают.
    delta.warmth! += p.warmthFromClothes * cfg.clothingWarmthPerHour * hours;
    if (night) delta.warmth! += cfg.nightWarmthPerHour * hours;
    if (snapshot.isLateNight) delta.sanity! += cfg.lateNightSanityPerHour * hours;
    if (this.ctx.isIndoors) delta.warmth! += 4 * hours;

    // Критические состояния.
    if (p.stat('hunger') <= 0) delta.health! += cfg.starvingHealthPerHour * hours;
    if (p.stat('warmth') <= 0) {
      delta.health! += cfg.freezingHealthPerHour * hours;
      if (chance(0.15 * hours)) p.addStatus('hypothermia');
    }
    if (p.stat('energy') <= 0) {
      delta.sanity! += cfg.exhaustedSanityPerHour * hours;
      if (chance(0.2 * hours)) p.addStatus('fatigue');
    }
    if (p.stat('hygiene') <= 15) delta.sanity! += cfg.filthySanityPerHour * hours;
    if (p.stat('warmth') < 25 && chance(0.08 * hours)) p.addStatus('cold');

    // Восстановление, когда базовые потребности закрыты.
    const req = cfg.regenRequires;
    if (
      p.stat('hunger') > req.hunger &&
      p.stat('warmth') > req.warmth &&
      p.stat('energy') > req.energy &&
      !p.data.statuses.length
    ) {
      delta.health! += cfg.regenHealthPerHour * hours;
    }

    // Статусы тикают своим эффектом.
    for (const status of p.data.statuses) {
      const rates = cfg.statusRatesPerHour[status.id] as Partial<Record<SurvivalStat, number>> | undefined;
      if (!rates) continue;
      for (const [key, value] of Object.entries(rates) as [SurvivalStat, number][]) {
        delta[key] = (delta[key] ?? 0) + value * hours;
      }
    }

    p.modifyStats(delta);
    p.tickStatuses(minutes);
    this.checkWarnings();

    if (p.stat('health') <= 0) this.blackout();
  }

  private checkWarnings(): void {
    const p = this.ctx.player;
    const watch: SurvivalStat[] = ['hunger', 'warmth', 'health', 'energy', 'sanity'];
    const labels: Record<string, string> = {
      hunger: 'Голод сводит с ума',
      warmth: 'Ты замерзаешь',
      health: 'Со здоровьем плохо',
      energy: 'Ноги не держат',
      sanity: 'Мысли путаются'
    };
    for (const stat of watch) {
      const value = p.stat(stat);
      if (value <= GameConfig.survival.lowWarning && !this.warnedLow.has(stat)) {
        this.warnedLow.add(stat);
        bus.emit('toast', { text: labels[stat] ?? 'Плохо', tone: 'bad' });
      } else if (value > GameConfig.survival.lowWarning + 12) {
        this.warnedLow.delete(stat);
      }
    }
  }

  /** Не «смерть», а потеря сознания: город даёт второй шанс, но забирает часть нажитого. */
  private blackout(): void {
    const p = this.ctx.player;
    const lostCash = Math.round(p.cash * GameConfig.economy.blackoutCashLoss);
    if (lostCash > 0) p.spendCash(lostCash, 'blackout');
    this.ctx.inventory.loseRandom(0.3);

    p.modifyStats({ health: 45, hunger: 25, warmth: 35, energy: 30, sanity: -10 });
    p.data.statuses = [];
    p.addFlag('blackouts', 1);

    this.ctx.time.skip(6 * 60);
    this.resync();
    this.ctx.respawnAtSafeSpot();
    this.ctx.save(true);

    void this.ctx.ui.message(
      'Ты отключился',
      lostCash > 0
        ? `Очнулся в приёмном покое. Наличных стало меньше на ${lostCash} ₽, часть вещей пропала. Деньги в банке не тронули.`
        : 'Очнулся в приёмном покое. Часть вещей пропала. Терять уже почти нечего.'
    );
  }
}
