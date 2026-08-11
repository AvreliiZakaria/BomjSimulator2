import { GameConfig } from '../config/GameConfig.js';
import { chance, randInt } from '../core/rng.js';
import type { GameContext } from '../state/GameContext.js';

export type SleepQuality = keyof typeof GameConfig.sleep.quality;

export const SLEEP_LABELS: Record<SleepQuality, string> = {
  ground: 'Голая земля',
  cardboard: 'Картон',
  bench: 'Лавочка',
  shelter: 'Укрытие',
  tent: 'Палатка',
  garage: 'Гараж',
  basement: 'Подвал',
  room: 'Комната',
  flat: 'Квартира',
  goodFlat: 'Хорошая квартира',
  house: 'Дом',
  penthouse: 'Пентхаус'
};

const INDOOR: SleepQuality[] = ['garage', 'basement', 'room', 'flat', 'goodFlat', 'house', 'penthouse', 'shelter'];

export class SleepSystem {
  constructor(private readonly ctx: GameContext) {}

  /** Сон до утра или на заданное количество часов. */
  sleep(quality: SleepQuality, hours = GameConfig.sleep.defaultHours): void {
    const cfg = GameConfig.sleep;
    const p = this.ctx.player;
    const factor = cfg.quality[quality] ?? 0.5;
    const indoor = INDOOR.includes(quality);

    this.ctx.time.skip(hours * 60);
    this.ctx.survival.resync();

    p.modifyStats({
      energy: cfg.energyPerHour * hours * factor,
      sanity: cfg.sanityPerHour * hours * factor,
      health: cfg.healthPerHour * hours * factor,
      hunger: cfg.hungerPerHour * hours,
      warmth: (indoor ? cfg.warmthPerHourIndoor : cfg.warmthPerHourOutdoor) * hours,
      hygiene: indoor ? 0 : -2 * hours * 0.5
    });

    if (indoor) {
      p.removeStatus('hypothermia');
      if (chance(0.6)) p.removeStatus('cold');
    }
    p.removeStatus('fatigue');

    // Ночь после 03:00 на улице — отдельная строчка в биографии.
    if (this.ctx.time.snapshot.isLateNight || !indoor) p.addFlag('nightsOutside', 1);
    p.data.nightsAfterThree += 1;

    const risk = cfg.risk[quality] ?? 0;
    let incidentText = '';
    if (risk > 0 && chance(risk)) {
      const stolen = Math.min(p.cash, randInt(10, Math.max(20, Math.round(p.cash * 0.4))));
      if (stolen > 0) {
        p.spendCash(stolen, 'sleep:theft');
        incidentText = `Утром недосчитался ${stolen} ₽. Спать надо крепче или в другом месте.`;
      } else {
        p.modifyStats({ sanity: -8, warmth: -10 });
        incidentText = 'Ночью кто-то долго стоял рядом. Утром никого.';
      }
    }

    this.ctx.onNewDay();
    this.ctx.quests.notify('sleep', quality, 1);
    this.ctx.achievements.check();
    this.ctx.save(true);

    const clock = this.ctx.time.snapshot.clock;
    void this.ctx.ui.message(
      `День ${this.ctx.time.snapshot.day}`,
      `${SLEEP_LABELS[quality]}: проспал ${hours} ч, сейчас ${clock}. ${incidentText}`.trim()
    );
  }

  /** Сколько часов до 07:00 — удобный «спать до утра». */
  hoursUntilMorning(): number {
    const minutes = this.ctx.time.minutesUntilHour(7);
    return Math.max(1, Math.round(minutes / 60));
  }
}
