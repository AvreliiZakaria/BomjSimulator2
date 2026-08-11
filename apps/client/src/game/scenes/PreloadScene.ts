import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig.js';
import { pick } from '../core/rng.js';

const PHRASES = [
  'Город ничего тебе не должен.',
  'У тебя осталось 17 ₽.',
  'После трёх лучше быть дома.',
  'Не все голуби просто голуби.',
  'Сегодня будет холодно.'
];

/**
 * Никаких внешних ассетов: все текстуры генерируются кодом.
 * Экран загрузки — логотип, полоса и случайная фраза.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0b0d12');

    const logo = this.add.text(width / 2, height / 2 - 70, GameConfig.title, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '86px',
      color: '#f2c14e',
      fontStyle: 'bold'
    });
    logo.setOrigin(0.5);

    const slogan = this.add.text(width / 2, height / 2 - 6, GameConfig.slogan, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '15px',
      color: '#8d95a3'
    });
    slogan.setOrigin(0.5);

    const barW = Math.min(360, width * 0.7);
    const barBg = this.add.rectangle(width / 2, height / 2 + 46, barW, 6, 0x272b34).setOrigin(0.5);
    const bar = this.add.rectangle(width / 2 - barW / 2, height / 2 + 46, 0, 6, 0xf2c14e).setOrigin(0, 0.5);

    const phrase = this.add.text(width / 2, height / 2 + 84, pick(PHRASES), {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '14px',
      color: '#6f7887',
      fontStyle: 'italic'
    });
    phrase.setOrigin(0.5);

    this.load.on('progress', (value: number) => bar.setSize(barW * value, 6));
    this.load.on('complete', () => {
      barBg.setAlpha(0.4);
      bar.setAlpha(0.4);
    });

    this.generateTextures();
  }

  /** Радиальные свечения, туманные пятна и шум — всё рисуется в рантайме. */
  private generateTextures(): void {
    if (!this.textures.exists('glow')) {
      const size = 256;
      const canvas = this.textures.createCanvas('glow', size, size);
      const ctx = canvas?.getContext();
      if (ctx) {
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.35, 'rgba(255,255,255,0.45)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        canvas?.refresh();
      }
    }

    if (!this.textures.exists('softFog')) {
      const size = 512;
      const canvas = this.textures.createCanvas('softFog', size, size);
      const ctx = canvas?.getContext();
      if (ctx) {
        ctx.clearRect(0, 0, size, size);
        for (let i = 0; i < 26; i += 1) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const r = 40 + Math.random() * 120;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
          gradient.addColorStop(0, 'rgba(255,255,255,0.09)');
          gradient.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
        canvas?.refresh();
      }
    }
  }

  create(): void {
    this.time.delayedCall(420, () => this.scene.start('MainMenu'));
  }
}
