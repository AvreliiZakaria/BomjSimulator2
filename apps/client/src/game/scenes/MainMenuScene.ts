import Phaser from 'phaser';
import { randFloat } from '../core/rng.js';

interface MenuCar {
  rect: Phaser.GameObjects.Rectangle;
  glow: Phaser.GameObjects.Image;
  speed: number;
}

/**
 * Атмосферный живой фон меню: силуэты города, окна, фонари, туман, машины, parallax.
 * Кнопки и текст рисует DOM-слой поверх канваса.
 */
export class MainMenuScene extends Phaser.Scene {
  private layers: Phaser.GameObjects.Container[] = [];
  private cars: MenuCar[] = [];
  private fog!: Phaser.GameObjects.TileSprite;
  private pointerOffset = 0;

  constructor() {
    super('MainMenu');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#080a10');

    // Небо
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x0d1220, 0x0d1220, 0x1b2233, 0x1b2233, 1);
    sky.fillRect(0, 0, width, height);
    sky.setScrollFactor(0);

    this.buildSkyline(0.18, 0x11151f, height * 0.52, 90, 240);
    this.buildSkyline(0.34, 0x161b28, height * 0.62, 70, 190);
    this.buildSkyline(0.6, 0x1d2432, height * 0.72, 55, 150);

    // Дорога
    const road = this.add.rectangle(width / 2, height * 0.9, width * 2, height * 0.2, 0x121620);
    road.setScrollFactor(0);

    for (let i = 0; i < 7; i += 1) this.spawnCar();

    // Фонари
    for (let i = 0; i < 8; i += 1) {
      const x = (width / 7) * i + 30;
      const glow = this.add.image(x, height * 0.78, 'glow');
      glow.setBlendMode(Phaser.BlendModes.ADD);
      glow.setTint(0xffcf7a);
      glow.setScale(1.6);
      glow.setAlpha(0.35);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.28, to: 0.45 },
        duration: 2200 + i * 180,
        yoyo: true,
        repeat: -1
      });
    }

    this.fog = this.add.tileSprite(0, 0, width, height, 'softFog');
    this.fog.setOrigin(0, 0);
    this.fog.setAlpha(0.5);
    this.fog.setScrollFactor(0);

    // Силуэт прохожего вдалеке
    const walker = this.add.rectangle(-40, height * 0.86, 10, 26, 0x0a0c12);
    this.tweens.add({
      targets: walker,
      x: width + 60,
      duration: 42000,
      repeat: -1,
      delay: 6000
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pointerOffset = (pointer.x / this.scale.width - 0.5) * 2;
    });

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
    });
  }

  private handleResize(size: Phaser.Structs.Size): void {
    this.fog?.setSize(size.width, size.height);
  }

  private buildSkyline(depth: number, color: number, baseY: number, minH: number, maxH: number): void {
    const { width } = this.scale;
    const container = this.add.container(0, 0);
    container.setData('parallax', depth);
    let x = -120;
    while (x < width + 240) {
      const w = randFloat(70, 160);
      const h = randFloat(minH, maxH);
      const building = this.add.rectangle(x + w / 2, baseY - h / 2, w, h, color);
      container.add(building);

      // Окна
      const cols = Math.max(1, Math.floor(w / 26));
      const rows = Math.max(1, Math.floor(h / 30));
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if (Math.random() > 0.42) continue;
          const win = this.add.rectangle(
            x + 14 + c * 26,
            baseY - h + 18 + r * 30,
            8,
            11,
            Math.random() > 0.85 ? 0xf2c14e : 0xd8c48a,
            randFloat(0.25, 0.7)
          );
          container.add(win);
          if (Math.random() > 0.9) {
            this.tweens.add({
              targets: win,
              alpha: { from: 0.1, to: 0.6 },
              duration: randFloat(2600, 7000),
              yoyo: true,
              repeat: -1
            });
          }
        }
      }
      x += w + randFloat(6, 26);
    }
    this.layers.push(container);
  }

  private spawnCar(): void {
    const { width, height } = this.scale;
    const toRight = Math.random() > 0.5;
    const y = height * (0.86 + Math.random() * 0.07);
    const rect = this.add.rectangle(
      toRight ? -80 : width + 80,
      y,
      randFloat(38, 70),
      12,
      0x2a303c
    );
    const glow = this.add.image(rect.x, y, 'glow');
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setTint(toRight ? 0xfff0c0 : 0xff8a7a);
    glow.setScale(0.5);
    glow.setAlpha(0.5);
    this.cars.push({ rect, glow, speed: (toRight ? 1 : -1) * randFloat(45, 110) });
  }

  override update(_time: number, delta: number): void {
    const { width } = this.scale;

    for (const layer of this.layers) {
      const depth = layer.getData('parallax') as number;
      layer.x = -this.pointerOffset * 26 * depth;
    }

    if (this.fog) this.fog.tilePositionX += delta * 0.012;

    for (const car of this.cars) {
      car.rect.x += (car.speed * delta) / 1000;
      car.glow.x = car.rect.x + (car.speed > 0 ? 22 : -22);
      car.glow.y = car.rect.y;
      if (car.speed > 0 && car.rect.x > width + 120) car.rect.x = -120;
      if (car.speed < 0 && car.rect.x < -120) car.rect.x = width + 120;
    }
  }
}
