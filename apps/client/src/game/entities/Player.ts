import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig.js';
import { CharacterSprite, facingFromVector } from '../world/CharacterArt.js';
import type { Appearance } from '../../types/player.js';

export class Player {
  readonly sprite: CharacterSprite;
  readonly body: Phaser.Physics.Arcade.Body;
  private busy = false;

  constructor(scene: Phaser.Scene, x: number, y: number, appearance: Appearance) {
    this.sprite = new CharacterSprite(scene, x, y, appearance);
    scene.physics.world.enable(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setSize(GameConfig.player.hitboxWidth, GameConfig.player.hitboxHeight);
    this.body.setOffset(-GameConfig.player.hitboxWidth / 2, -GameConfig.player.hitboxHeight);
    this.body.setCollideWorldBounds(false);
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.body.reset(x, y);
  }

  setAppearance(appearance: Appearance): void {
    this.sprite.setAppearance(appearance);
  }

  setBackpack(value: boolean): void {
    this.sprite.setBackpack(value);
  }

  /** Занят анимацией (обыск, сон, еда) — движение блокируется. */
  setBusy(anim: 'search' | 'eat' | 'sit' | 'sleep' | null): void {
    this.busy = anim !== null;
    this.sprite.setAnim(anim ?? 'idle');
    if (this.busy) this.body.setVelocity(0, 0);
  }

  get isBusy(): boolean {
    return this.busy;
  }

  update(deltaMs: number, input: { x: number; y: number }, speedMultiplier = 1): void {
    if (!this.busy) {
      const length = Math.hypot(input.x, input.y);
      if (length > 0.08) {
        // Диагональ нормализуем: по диагонали не быстрее, чем по прямой.
        const nx = input.x / length;
        const ny = input.y / length;
        const speed = GameConfig.player.speed * speedMultiplier * Math.min(1, length);
        this.body.setVelocity(nx * speed, ny * speed);
        this.sprite.setFacing(facingFromVector(nx, ny, this.sprite.currentFacing));
        this.sprite.setAnim('walk');
      } else {
        this.body.setVelocity(0, 0);
        this.sprite.setAnim('idle');
      }
    }

    this.sprite.tick(deltaMs, speedMultiplier);
    this.sprite.setDepth(this.sprite.y);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
