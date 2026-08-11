import Phaser from 'phaser';

export type VehicleType = 'sedan' | 'compact' | 'van' | 'bus';

const SPECS: Record<VehicleType, { w: number; h: number; colors: number[]; speedMul: number }> = {
  sedan: { w: 78, h: 42, colors: [0x8c3a3a, 0x2f4a6d, 0x6d6a5f, 0x384a55], speedMul: 1 },
  compact: { w: 62, h: 38, colors: [0x3a6d4f, 0x7a7a80, 0xb08a3a], speedMul: 1.1 },
  van: { w: 96, h: 46, colors: [0xd8d3c6, 0x5a6470, 0x8a8d92], speedMul: 0.85 },
  bus: { w: 150, h: 52, colors: [0xc26a35, 0x3f6f9c], speedMul: 0.7 }
};

/** Машина, едущая по маршруту дорожных узлов. */
export class Vehicle {
  readonly container: Phaser.GameObjects.Container;
  private gfx: Phaser.GameObjects.Graphics;
  readonly type: VehicleType;
  private speed: number;
  private target: { x: number; y: number } | null = null;
  private nodeId: string;
  alive = true;

  constructor(scene: Phaser.Scene, x: number, y: number, type: VehicleType, speed: number, startNode: string) {
    this.type = type;
    this.speed = speed * SPECS[type].speedMul;
    this.nodeId = startNode;
    this.gfx = scene.add.graphics();
    this.container = scene.add.container(x, y, [this.gfx]);
    this.draw(0);
  }

  get currentNode(): string {
    return this.nodeId;
  }

  setTarget(node: { id: string; x: number; y: number }): void {
    this.nodeId = node.id;
    this.target = { x: node.x, y: node.y };
  }

  private draw(angle: number): void {
    const spec = SPECS[this.type];
    const color = spec.colors[Math.floor(Math.random() * spec.colors.length)]!;
    const vertical = Math.abs(Math.cos(angle)) < 0.5;
    const w = vertical ? spec.h : spec.w;
    const h = vertical ? spec.w : spec.h;

    const g = this.gfx;
    g.clear();
    g.fillStyle(0x000000, 0.32);
    g.fillEllipse(0, h * 0.42, w * 0.95, h * 0.45);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 9);
    g.fillStyle(0x1f2429, 0.85);
    if (vertical) {
      g.fillRoundedRect(-w / 2 + 5, -h / 2 + 12, w - 10, h * 0.28, 4);
      g.fillRoundedRect(-w / 2 + 5, h / 2 - h * 0.28 - 12, w - 10, h * 0.28, 4);
    } else {
      g.fillRoundedRect(-w / 2 + 12, -h / 2 + 5, w * 0.28, h - 10, 4);
      g.fillRoundedRect(w / 2 - w * 0.28 - 12, -h / 2 + 5, w * 0.28, h - 10, 4);
    }
    g.fillStyle(0xffffff, 0.14);
    g.fillRect(-w / 2, -h / 2, w, 3);
    // Фары
    g.fillStyle(0xffe9a8, 0.85);
    if (vertical) g.fillRect(-w / 2 + 6, -h / 2 - 2, 8, 4);
    else g.fillRect(w / 2 - 2, -h / 2 + 6, 4, 8);
  }

  update(deltaMs: number): boolean {
    if (!this.target) return false;
    const dx = this.target.x - this.container.x;
    const dy = this.target.y - this.container.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 8) return true;

    const step = (this.speed * deltaMs) / 1000;
    this.container.x += (dx / distance) * step;
    this.container.y += (dy / distance) * step;
    this.container.setDepth(this.container.y + 20);
    return false;
  }

  destroy(): void {
    this.alive = false;
    this.container.destroy();
  }
}
