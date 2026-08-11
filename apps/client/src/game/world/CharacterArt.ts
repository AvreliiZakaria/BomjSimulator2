import Phaser from 'phaser';
import type { Appearance } from '../../types/player.js';

export type Facing = 'S' | 'SE' | 'E' | 'NE' | 'N' | 'NW' | 'W' | 'SW';
export type CharacterAnim = 'idle' | 'walk' | 'sit' | 'search' | 'eat' | 'sleep';

const FACING_ORDER: Facing[] = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];

export function facingFromVector(dx: number, dy: number, fallback: Facing = 'S'): Facing {
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return fallback;
  const angle = Math.atan2(dy, dx);
  const index = Math.round((angle + Math.PI * 2) / (Math.PI / 4)) % 8;
  return FACING_ORDER[index] ?? fallback;
}

const toColor = (hex: string, fallback = 0x888888): number => {
  const parsed = Number.parseInt(hex.replace('#', ''), 16);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const shade = (color: number, amount: number): number => {
  const c = Phaser.Display.Color.IntegerToColor(color);
  const f = amount >= 0 ? 1 : 0;
  const t = amount >= 0 ? 255 : 0;
  const p = Math.abs(amount);
  return Phaser.Display.Color.GetColor(
    Math.round((t - c.red) * p) + c.red * f + (f ? 0 : Math.round(c.red * (1 - p))),
    Math.round((t - c.green) * p) + c.green * f + (f ? 0 : Math.round(c.green * (1 - p))),
    Math.round((t - c.blue) * p) + c.blue * f + (f ? 0 : Math.round(c.blue * (1 - p)))
  );
};

/**
 * Стилизованный человек, нарисованный кодом: голова, волосы/головной убор,
 * торс, руки, ноги, обувь, тень. 8 направлений и набор анимаций.
 * Никаких скачанных чужих ассетов — только собственная векторная отрисовка.
 */
export class CharacterSprite extends Phaser.GameObjects.Container {
  private gfx: Phaser.GameObjects.Graphics;
  private shadow: Phaser.GameObjects.Graphics;
  private facing: Facing = 'S';
  private anim: CharacterAnim = 'idle';
  private phase = 0;
  private lastFrame = -1;
  private appearance: Appearance;
  private readonly scaleFactor: number;
  private backpack = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    appearance: Appearance,
    options: { scale?: number } = {}
  ) {
    super(scene, x, y);
    this.appearance = { ...appearance };
    this.scaleFactor = options.scale ?? 1;

    this.shadow = scene.add.graphics();
    this.gfx = scene.add.graphics();
    this.add([this.shadow, this.gfx]);

    this.drawShadow();
    this.redraw();
    scene.add.existing(this);
  }

  setAppearance(appearance: Appearance): void {
    this.appearance = { ...appearance };
    this.lastFrame = -1;
    this.redraw();
  }

  setBackpack(value: boolean): void {
    if (this.backpack === value) return;
    this.backpack = value;
    this.lastFrame = -1;
    this.redraw();
  }

  setFacing(facing: Facing): void {
    if (this.facing === facing) return;
    this.facing = facing;
    this.lastFrame = -1;
  }

  get currentFacing(): Facing {
    return this.facing;
  }

  setAnim(anim: CharacterAnim): void {
    if (this.anim === anim) return;
    this.anim = anim;
    this.phase = 0;
    this.lastFrame = -1;
  }

  get currentAnim(): CharacterAnim {
    return this.anim;
  }

  /** deltaMs из update сцены. Перерисовываем только при смене кадра. */
  tick(deltaMs: number, speed = 1): void {
    const rate = this.anim === 'walk' ? 6.5 * speed : this.anim === 'search' ? 3.5 : 1.1;
    this.phase = (this.phase + (deltaMs / 1000) * rate) % 1;
    const frame = Math.floor(this.phase * 8);
    if (frame !== this.lastFrame) {
      this.lastFrame = frame;
      this.redraw();
    }
  }

  private drawShadow(): void {
    this.shadow.clear();
    this.shadow.fillStyle(0x000000, 0.32);
    this.shadow.fillEllipse(0, 0, 26 * this.scaleFactor, 10 * this.scaleFactor);
  }

  private redraw(): void {
    const g = this.gfx;
    const s = this.scaleFactor;
    const a = this.appearance;
    g.clear();

    const skin = toColor(a.skin, 0xd8a37a);
    const hair = toColor(a.hair, 0x3b2b22);
    const top = toColor(a.top, 0x4a5a72);
    const bottom = toColor(a.bottom, 0x33384a);
    const shoes = toColor(a.shoes, 0x2b2b30);

    const back = this.facing === 'N' || this.facing === 'NE' || this.facing === 'NW';
    const side = this.facing === 'E' || this.facing === 'W';
    const dir = this.facing.includes('W') ? -1 : 1;

    const t = this.phase * Math.PI * 2;
    const walking = this.anim === 'walk';
    const swing = walking ? Math.sin(t) * 3.4 : 0;
    const bob = walking ? -Math.abs(Math.sin(t)) * 1.6 : 0;

    if (this.anim === 'sleep') {
      this.drawLying(g, s, skin, hair, top, bottom, shoes);
      return;
    }

    const sitting = this.anim === 'sit';
    const searching = this.anim === 'search';
    const lean = searching ? 4 + Math.sin(t * 2) * 2 : 0;
    const baseY = (sitting ? -10 : 0) + bob;

    // Ноги
    const legTop = baseY - (sitting ? 12 : 22);
    const legH = sitting ? 10 : 22;
    g.fillStyle(bottom, 1);
    if (side) {
      g.fillRect((-3 + swing * 0.6) * s, legTop * s, 6 * s, legH * s);
      g.fillStyle(shade(bottom, -0.15), 1);
      g.fillRect((-3 - swing * 0.6) * s, legTop * s, 6 * s, legH * s);
    } else {
      g.fillRect((-6 + swing * 0.5) * s, legTop * s, 5.5 * s, legH * s);
      g.fillStyle(shade(bottom, -0.12), 1);
      g.fillRect((1 - swing * 0.5) * s, legTop * s, 5.5 * s, legH * s);
    }

    // Обувь
    g.fillStyle(shoes, 1);
    if (side) {
      g.fillRect((-4 + swing * 0.7) * s, (baseY - 3) * s, 9 * s * dir, 4 * s);
      g.fillRect((-4 - swing * 0.7) * s, (baseY - 2) * s, 8 * s * dir, 4 * s);
    } else {
      g.fillRect((-7 + swing * 0.5) * s, (baseY - 3.5) * s, 7 * s, 4 * s);
      g.fillRect((0.5 - swing * 0.5) * s, (baseY - 3.5) * s, 7 * s, 4 * s);
    }

    // Торс
    const torsoTop = baseY - (sitting ? 30 : 40) + lean * 0.4;
    const torsoH = sitting ? 18 : 20;
    g.fillStyle(top, 1);
    g.fillRoundedRect(-8.5 * s, torsoTop * s, 17 * s, torsoH * s, 3.5 * s);
    g.fillStyle(shade(top, -0.18), 1);
    g.fillRect((side ? dir * 4 : -8.5) * s, torsoTop * s, 4.5 * s, torsoH * s);

    // Рюкзак за спиной
    if (this.backpack) {
      g.fillStyle(shade(top, -0.45), 1);
      if (back) g.fillRoundedRect(-7 * s, (torsoTop + 2) * s, 14 * s, 15 * s, 3 * s);
      else if (side) g.fillRoundedRect((-dir * 9) * s, (torsoTop + 3) * s, 6 * s, 13 * s, 2 * s);
    }

    // Руки
    const armSwing = walking ? -swing : searching ? 5 + Math.sin(t * 2) * 3 : 0;
    g.fillStyle(skin, 1);
    if (side) {
      g.fillRoundedRect((dir * 5 - 2) * s, (torsoTop + 3 + armSwing * 0.4) * s, 4 * s, 15 * s, 2 * s);
    } else {
      g.fillStyle(shade(top, 0.05), 1);
      g.fillRoundedRect(-11.5 * s, (torsoTop + 2 - armSwing * 0.5) * s, 4 * s, 13 * s, 2 * s);
      g.fillRoundedRect(7.5 * s, (torsoTop + 2 + armSwing * 0.5) * s, 4 * s, 13 * s, 2 * s);
      g.fillStyle(skin, 1);
      g.fillCircle(-9.5 * s, (torsoTop + 15 - armSwing * 0.5) * s, 2.2 * s);
      g.fillCircle(9.5 * s, (torsoTop + 15 + armSwing * 0.5) * s, 2.2 * s);
    }

    // Шея и голова
    const headY = torsoTop - 8 + lean * 0.5;
    g.fillStyle(shade(skin, -0.2), 1);
    g.fillRect(-2.5 * s, (torsoTop - 3) * s, 5 * s, 4 * s);
    g.fillStyle(skin, 1);
    g.fillCircle((side ? dir * 1.5 : 0) * s, headY * s, 8 * s);

    // Лицо
    if (!back) {
      g.fillStyle(0x1b1b1f, 1);
      if (side) {
        g.fillCircle((dir * 4) * s, (headY - 1) * s, 1.2 * s);
      } else {
        g.fillCircle(-2.8 * s, (headY - 1) * s, 1.2 * s);
        g.fillCircle(2.8 * s, (headY - 1) * s, 1.2 * s);
      }
      if (this.anim === 'eat') {
        g.fillStyle(0x7a3b3b, 1);
        g.fillCircle(0, (headY + 3.5) * s, 1.8 * s);
      }
    }

    // Волосы / головной убор
    this.drawHair(g, s, headY, hair, back, side, dir);
  }

  private drawHair(
    g: Phaser.GameObjects.Graphics,
    s: number,
    headY: number,
    hair: number,
    back: boolean,
    side: boolean,
    dir: number
  ): void {
    const style = this.appearance.hairStyle;
    g.fillStyle(hair, 1);
    switch (style) {
      case 'bald':
        if (back) g.fillCircle(0, headY * s, 8 * s);
        break;
      case 'long':
        g.fillCircle((side ? dir * 1.5 : 0) * s, (headY - 2) * s, 8.4 * s);
        g.fillRoundedRect(-8.4 * s, (headY - 2) * s, 16.8 * s, 14 * s, 4 * s);
        break;
      case 'cap':
        g.fillStyle(shade(hair, -0.35), 1);
        g.fillCircle(0, (headY - 3) * s, 8.2 * s);
        g.fillRect(-8.2 * s, (headY - 4) * s, 16.4 * s, 4 * s);
        if (!back) g.fillRect((side ? dir * 3 : -6) * s, (headY - 4) * s, (side ? dir * 8 : 12) * s, 2.4 * s);
        break;
      case 'beanie':
        g.fillStyle(shade(hair, -0.2), 1);
        g.fillCircle(0, (headY - 3.5) * s, 8.4 * s);
        g.fillRect(-8.4 * s, (headY - 4) * s, 16.8 * s, 5 * s);
        break;
      case 'hood':
        g.fillStyle(shade(toColor(this.appearance.top), -0.25), 1);
        g.fillCircle(0, (headY - 1) * s, 10 * s);
        if (!back) {
          g.fillStyle(0x000000, 0.45);
          g.fillCircle(0, (headY + 0.5) * s, 6.6 * s);
        }
        break;
      case 'short':
      default:
        g.fillCircle((side ? dir * 1.5 : 0) * s, (headY - 2.4) * s, 8.2 * s);
        g.fillRect(-8.2 * s, (headY - 5) * s, 16.4 * s, 4 * s);
        break;
    }
  }

  private drawLying(
    g: Phaser.GameObjects.Graphics,
    s: number,
    skin: number,
    hair: number,
    top: number,
    bottom: number,
    shoes: number
  ): void {
    const breathe = Math.sin(this.phase * Math.PI * 2) * 0.6;
    g.fillStyle(bottom, 1);
    g.fillRoundedRect(-2 * s, (-14 + breathe) * s, 26 * s, 12 * s, 4 * s);
    g.fillStyle(shoes, 1);
    g.fillRoundedRect(22 * s, (-14 + breathe) * s, 8 * s, 11 * s, 3 * s);
    g.fillStyle(top, 1);
    g.fillRoundedRect(-20 * s, (-15 + breathe) * s, 24 * s, 14 * s, 5 * s);
    g.fillStyle(skin, 1);
    g.fillCircle(-24 * s, (-10 + breathe) * s, 7.5 * s);
    g.fillStyle(hair, 1);
    g.fillCircle(-26 * s, (-12 + breathe) * s, 7 * s);
  }

  override destroy(fromScene?: boolean): void {
    this.gfx.destroy();
    this.shadow.destroy();
    super.destroy(fromScene);
  }
}
