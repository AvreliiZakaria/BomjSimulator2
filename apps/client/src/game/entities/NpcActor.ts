import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig.js';
import { CharacterSprite, facingFromVector } from '../world/CharacterArt.js';
import type { NpcDefinition, } from '../../types/npc.js';
import type { NpcSpawnDef, Vec2 } from '../../types/world.js';

/** NPC без всякого генеративного ИИ: расписание, маршрут и дерево диалогов из данных. */
export class NpcActor {
  readonly sprite: CharacterSprite;
  readonly definition: NpcDefinition;
  private route: Vec2[];
  private routeIndex = 0;
  private waitMs = 0;
  private label: Phaser.GameObjects.Text;
  private readonly home: Vec2;

  constructor(scene: Phaser.Scene, definition: NpcDefinition, spawn: NpcSpawnDef) {
    this.definition = definition;
    this.route = spawn.route ?? [];
    this.home = { x: spawn.x, y: spawn.y };

    const isPigeon = definition.id === 'valera';
    this.sprite = new CharacterSprite(scene, spawn.x, spawn.y, definition.appearance, {
      scale: isPigeon ? 0.45 : 1
    });

    this.label = scene.add.text(spawn.x, spawn.y - (isPigeon ? 28 : 78), definition.name, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '13px',
      color: definition.key ? '#f2c14e' : '#cfd4dc'
    });
    this.label.setOrigin(0.5, 1);
    this.label.setAlpha(0.85);
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  /** NPC на месте по расписанию? Вне активных часов он «ушёл домой». */
  isActive(hour: number): boolean {
    if (!this.definition.activeHours) return true;
    const [from, to] = this.definition.activeHours;
    return from <= to ? hour >= from && hour < to : hour >= from || hour < to;
  }

  update(deltaMs: number, hour: number): void {
    const active = this.isActive(hour);
    this.sprite.setVisible(active);
    this.label.setVisible(active);
    if (!active) return;

    if (this.route.length > 1 && this.definition.wanders !== false) {
      if (this.waitMs > 0) {
        this.waitMs -= deltaMs;
        this.sprite.setAnim('idle');
      } else {
        const target = this.route[this.routeIndex]!;
        const dx = target.x - this.sprite.x;
        const dy = target.y - this.sprite.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 6) {
          this.routeIndex = (this.routeIndex + 1) % this.route.length;
          this.waitMs = 1200 + Math.random() * 2600;
        } else {
          const speed = (GameConfig.crowd.walkSpeed * deltaMs) / 1000;
          this.sprite.x += (dx / distance) * speed;
          this.sprite.y += (dy / distance) * speed;
          this.sprite.setFacing(facingFromVector(dx, dy, this.sprite.currentFacing));
          this.sprite.setAnim('walk');
        }
      }
    } else {
      this.sprite.setAnim('idle');
    }

    this.label.setPosition(this.sprite.x, this.sprite.y - (this.definition.id === 'valera' ? 28 : 78));
    this.label.setDepth(this.sprite.y + 1);
    this.sprite.setDepth(this.sprite.y);
    this.sprite.tick(deltaMs);
  }

  faceTowards(x: number, y: number): void {
    this.sprite.setFacing(facingFromVector(x - this.sprite.x, y - this.sprite.y, this.sprite.currentFacing));
  }

  resetToHome(): void {
    this.sprite.setPosition(this.home.x, this.home.y);
  }

  destroy(): void {
    this.sprite.destroy();
    this.label.destroy();
  }
}
