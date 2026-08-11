import Phaser from 'phaser';
import { lerp } from '../core/rng.js';
import type { BuiltDistrict } from '../world/DistrictBuilder.js';
import type { TimeSnapshot } from '../../types/time.js';

interface Stop {
  at: number;
  color: number;
  alpha: number;
}

/** Ключевые точки суточного освещения. Между ними всё интерполируется плавно. */
const STOPS: Stop[] = [
  { at: 0, color: 0x0b1220, alpha: 0.72 },
  { at: 0.15, color: 0x101a2c, alpha: 0.6 },
  { at: 0.35, color: 0x2a2f45, alpha: 0.42 },
  { at: 0.6, color: 0x6a5a52, alpha: 0.2 },
  { at: 0.85, color: 0xfdf3e0, alpha: 0.05 },
  { at: 1, color: 0xffffff, alpha: 0 }
];

const mixColor = (a: number, b: number, t: number): number => {
  const ca = Phaser.Display.Color.IntegerToColor(a);
  const cb = Phaser.Display.Color.IntegerToColor(b);
  return Phaser.Display.Color.GetColor(
    Math.round(lerp(ca.red, cb.red, t)),
    Math.round(lerp(ca.green, cb.green, t)),
    Math.round(lerp(ca.blue, cb.blue, t))
  );
};

/**
 * Плавная смена дня и ночи. Никаких скачков за один кадр:
 * целевые значения задаются временем, а текущие подтягиваются интерполяцией.
 */
export class DayNight {
  private overlay: Phaser.GameObjects.Rectangle;
  private fog: Phaser.GameObjects.Rectangle;
  private currentAlpha = 0;
  private currentColor = 0xffffff;
  private currentFog = 0;
  private lampAlpha = 0;

  constructor(private readonly scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    this.overlay = scene.add.rectangle(0, 0, width * 2, height * 2, 0x0b1220, 0);
    this.overlay.setOrigin(0, 0);
    this.overlay.setScrollFactor(0);
    this.overlay.setDepth(9000);
    this.overlay.setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.fog = scene.add.rectangle(0, 0, width * 2, height * 2, 0x8fa0b5, 0);
    this.fog.setOrigin(0, 0);
    this.fog.setScrollFactor(0);
    this.fog.setDepth(9002);

    scene.scale.on('resize', this.handleResize, this);
  }

  private handleResize(size: Phaser.Structs.Size): void {
    this.overlay.setSize(size.width * 2, size.height * 2);
    this.fog.setSize(size.width * 2, size.height * 2);
  }

  private sample(daylight: number): { color: number; alpha: number } {
    for (let i = 0; i < STOPS.length - 1; i += 1) {
      const a = STOPS[i]!;
      const b = STOPS[i + 1]!;
      if (daylight >= a.at && daylight <= b.at) {
        const t = b.at === a.at ? 0 : (daylight - a.at) / (b.at - a.at);
        return { color: mixColor(a.color, b.color, t), alpha: lerp(a.alpha, b.alpha, t) };
      }
    }
    return { color: 0xffffff, alpha: 0 };
  }

  update(deltaMs: number, time: TimeSnapshot, world: BuiltDistrict | null): void {
    const target = this.sample(time.daylight);
    // После 03:00 мир холоднее, туманнее и пустее.
    const fogTarget = time.isLateNight ? 0.16 : time.daylight < 0.25 ? 0.07 : 0.02;
    const lampTarget = time.daylight < 0.55 ? 1 - time.daylight : 0;

    const t = Math.min(1, deltaMs / 900);
    this.currentAlpha = lerp(this.currentAlpha, target.alpha, t);
    this.currentColor = mixColor(this.currentColor, target.color, t);
    this.currentFog = lerp(this.currentFog, fogTarget, t * 0.6);
    this.lampAlpha = lerp(this.lampAlpha, lampTarget, t);

    this.overlay.setFillStyle(this.currentColor, 1);
    this.overlay.setAlpha(this.currentAlpha);
    this.fog.setFillStyle(time.isLateNight ? 0x9fb0c4 : 0xb8c4d2, 1);
    this.fog.setAlpha(this.currentFog);

    if (world) {
      for (const layer of world.windowLayers) layer.setAlpha(this.lampAlpha * 0.9);
      for (const glow of world.lampGlows) glow.setAlpha(this.lampAlpha * 0.55);
    }
  }

  destroy(): void {
    this.scene.scale.off('resize', this.handleResize, this);
    this.overlay.destroy();
    this.fog.destroy();
  }
}
