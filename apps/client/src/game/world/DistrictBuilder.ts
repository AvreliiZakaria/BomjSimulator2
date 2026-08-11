import Phaser from 'phaser';
import type { BuildingDef, DistrictDefinition, PropDef, RoadDef } from '../../types/world.js';

export interface BuiltDistrict {
  district: DistrictDefinition;
  colliders: Phaser.Physics.Arcade.StaticGroup;
  /** Окна, которые загораются ночью. */
  windowLayers: Phaser.GameObjects.Graphics[];
  /** Свечение фонарей: включается в тёмное время. */
  lampGlows: Phaser.GameObjects.Image[];
  /** Слой земли/дорог: рисуется один раз. */
  groundLayer: Phaser.GameObjects.Graphics;
  destroy(): void;
}

const STYLE_COLORS: Record<string, { wall: number; roof: number; accent: number }> = {
  panel: { wall: 0x6f7480, roof: 0x4c515b, accent: 0x585d68 },
  brick: { wall: 0x8a5d4a, roof: 0x5a3b30, accent: 0x764d3d },
  old: { wall: 0x7b7568, roof: 0x504b43, accent: 0x655f55 },
  glass: { wall: 0x46697f, roof: 0x2f4756, accent: 0x5c8aa6 },
  industrial: { wall: 0x5c5f63, roof: 0x3e4145, accent: 0x6d7074 },
  shop: { wall: 0x7d7a70, roof: 0x565349, accent: 0xa8a08c }
};

/**
 * Строит район из данных: земля, дороги, здания, декор, коллизии.
 * Здание: (x, y, w, h) — фасад и коллизия, height — видимая глубина крыши сверху.
 */
export class DistrictBuilder {
  static build(scene: Phaser.Scene, district: DistrictDefinition): BuiltDistrict {
    const colliders = scene.physics.add.staticGroup();
    const windowLayers: Phaser.GameObjects.Graphics[] = [];
    const lampGlows: Phaser.GameObjects.Image[] = [];

    const ground = scene.add.graphics();
    ground.setDepth(-10000);
    DistrictBuilder.drawGround(ground, district);

    for (const road of district.roads) DistrictBuilder.drawRoad(ground, road);

    for (const building of district.buildings) {
      DistrictBuilder.drawBuilding(scene, building, colliders, windowLayers);
    }

    for (const prop of district.props) {
      DistrictBuilder.drawProp(scene, prop, colliders, lampGlows);
    }

    // Невидимые стены по границам района.
    const b = district.bounds;
    const walls: [number, number, number, number][] = [
      [b.x - 40, b.y + b.h / 2, 80, b.h + 200],
      [b.x + b.w + 40, b.y + b.h / 2, 80, b.h + 200],
      [b.x + b.w / 2, b.y - 40, b.w + 200, 80],
      [b.x + b.w / 2, b.y + b.h + 40, b.w + 200, 80]
    ];
    for (const [x, y, w, h] of walls) {
      const wall = scene.add.rectangle(x, y, w, h);
      wall.setVisible(false);
      colliders.add(wall);
    }

    return {
      district,
      colliders,
      windowLayers,
      lampGlows,
      groundLayer: ground,
      destroy() {
        ground.destroy();
        colliders.clear(true, true);
        for (const layer of windowLayers) layer.destroy();
        for (const glow of lampGlows) glow.destroy();
      }
    };
  }

  private static drawGround(g: Phaser.GameObjects.Graphics, district: DistrictDefinition): void {
    const { x, y, w, h } = district.bounds;
    g.fillStyle(district.grassColor, 1);
    g.fillRect(x - 200, y - 200, w + 400, h + 400);

    // Пятна земли, чтобы поверхность не была плоской заливкой.
    g.fillStyle(district.groundColor, 0.55);
    for (let i = 0; i < 90; i += 1) {
      const px = x + Math.random() * w;
      const py = y + Math.random() * h;
      g.fillEllipse(px, py, 60 + Math.random() * 180, 30 + Math.random() * 90);
    }
  }

  private static drawRoad(g: Phaser.GameObjects.Graphics, road: RoadDef): void {
    // Тротуары
    g.fillStyle(0x53565c, 1);
    if (road.orientation === 'h') {
      g.fillRect(road.x, road.y - 26, road.w, road.h + 52);
    } else {
      g.fillRect(road.x - 26, road.y, road.w + 52, road.h);
    }

    // Асфальт
    g.fillStyle(0x35373c, 1);
    g.fillRect(road.x, road.y, road.w, road.h);

    // Разметка
    g.fillStyle(0xd8d2b8, 0.55);
    if (road.orientation === 'h') {
      const cy = road.y + road.h / 2 - 2;
      for (let x = road.x + 20; x < road.x + road.w; x += 90) g.fillRect(x, cy, 46, 4);
      g.fillStyle(0xd8d2b8, 0.25);
      g.fillRect(road.x, road.y + 6, road.w, 3);
      g.fillRect(road.x, road.y + road.h - 9, road.w, 3);
    } else {
      const cx = road.x + road.w / 2 - 2;
      for (let y = road.y + 20; y < road.y + road.h; y += 90) g.fillRect(cx, y, 4, 46);
      g.fillStyle(0xd8d2b8, 0.25);
      g.fillRect(road.x + 6, road.y, 3, road.h);
      g.fillRect(road.x + road.w - 9, road.y, 3, road.h);
    }
  }

  private static drawBuilding(
    scene: Phaser.Scene,
    building: BuildingDef,
    colliders: Phaser.Physics.Arcade.StaticGroup,
    windowLayers: Phaser.GameObjects.Graphics[]
  ): void {
    const palette = STYLE_COLORS[building.style] ?? STYLE_COLORS.panel!;
    const wall = building.wallColor ?? palette.wall;
    const roof = building.roofColor ?? palette.roof;

    const g = scene.add.graphics();
    g.setDepth(building.y + building.h);

    // Крыша (вид сверху под углом)
    g.fillStyle(roof, 1);
    g.fillRect(building.x, building.y - building.height, building.w, building.height);
    g.fillStyle(0x000000, 0.18);
    g.fillRect(building.x, building.y - building.height, building.w, 6);
    g.fillStyle(palette.accent, 0.5);
    g.fillRect(building.x + 8, building.y - building.height + 10, building.w - 16, 4);

    // Фасад
    g.fillStyle(wall, 1);
    g.fillRect(building.x, building.y, building.w, building.h);
    g.fillStyle(0x000000, 0.22);
    g.fillRect(building.x, building.y + building.h - 10, building.w, 10);
    g.lineStyle(2, 0x000000, 0.25);
    g.strokeRect(building.x, building.y - building.height, building.w, building.h + building.height);

    // Окна (день)
    const rows = building.windowRows ?? 0;
    const cols = building.windowCols ?? 0;
    const litLayer = scene.add.graphics();
    litLayer.setDepth(building.y + building.h + 0.5);
    litLayer.setAlpha(0);

    if (rows > 0 && cols > 0) {
      const padX = 16;
      const padY = 18;
      const cellW = (building.w - padX * 2) / cols;
      const cellH = (building.h - padY * 2) / rows;
      const winW = Math.max(8, cellW * 0.6);
      const winH = Math.max(10, cellH * 0.58);
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const wx = building.x + padX + col * cellW + (cellW - winW) / 2;
          const wy = building.y + padY + row * cellH + (cellH - winH) / 2;
          g.fillStyle(0x2b3138, 1);
          g.fillRect(wx, wy, winW, winH);
          g.fillStyle(0x8fa3b5, 0.25);
          g.fillRect(wx + 1, wy + 1, winW - 2, winH * 0.35);
          if (building.lit !== false && Math.random() > 0.45) {
            litLayer.fillStyle(0xffd98a, 0.85);
            litLayer.fillRect(wx, wy, winW, winH);
          }
        }
      }
    }

    if (building.style === 'shop') {
      // Витрина и вывеска
      g.fillStyle(0x1e2226, 1);
      g.fillRect(building.x + 12, building.y + building.h - 62, building.w - 24, 46);
      g.fillStyle(0xc9b27a, 0.9);
      g.fillRect(building.x + 10, building.y - 14, building.w - 20, 12);
      litLayer.fillStyle(0xfff0c0, 0.5);
      litLayer.fillRect(building.x + 12, building.y + building.h - 62, building.w - 24, 46);
      // Дверь
      g.fillStyle(0x2f2a24, 1);
      g.fillRect(building.x + building.w / 2 - 16, building.y + building.h - 44, 32, 44);
    }

    windowLayers.push(litLayer);

    if (building.name) {
      const label = scene.add.text(building.x + building.w / 2, building.y - building.height - 12, building.name, {
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '13px',
        color: '#c8cdd6'
      });
      label.setOrigin(0.5, 1);
      label.setAlpha(0.55);
      label.setDepth(building.y + building.h + 1);
    }

    // Коллизия: фасад + крыша, чтобы игрок не заходил на здание сверху.
    const body = scene.add.rectangle(
      building.x + building.w / 2,
      building.y - building.height + (building.h + building.height) / 2,
      building.w,
      building.h + building.height
    );
    body.setVisible(false);
    colliders.add(body);
  }

  private static drawProp(
    scene: Phaser.Scene,
    prop: PropDef,
    colliders: Phaser.Physics.Arcade.StaticGroup,
    lampGlows: Phaser.GameObjects.Image[]
  ): void {
    const g = scene.add.graphics();
    g.setDepth(prop.y);
    const x = prop.x;
    const y = prop.y;
    let collision: { w: number; h: number; offsetY: number } | null = null;

    switch (prop.kind) {
      case 'tree': {
        const size = 26 + (prop.variant ?? 0) * 5;
        g.fillStyle(0x000000, 0.28);
        g.fillEllipse(x, y + 2, size * 1.3, size * 0.5);
        g.fillStyle(0x4a3a2c, 1);
        g.fillRect(x - 5, y - 34, 10, 34);
        g.fillStyle(0x2f4a2f, 1);
        g.fillCircle(x, y - 52, size);
        g.fillStyle(0x3b5c39, 1);
        g.fillCircle(x - size * 0.35, y - 58, size * 0.75);
        g.fillStyle(0x476b42, 1);
        g.fillCircle(x + size * 0.3, y - 62, size * 0.6);
        collision = { w: 20, h: 16, offsetY: -8 };
        break;
      }
      case 'bush':
        g.fillStyle(0x000000, 0.22);
        g.fillEllipse(x, y + 2, 34, 12);
        g.fillStyle(0x35502f, 1);
        g.fillCircle(x - 8, y - 10, 12);
        g.fillCircle(x + 8, y - 12, 13);
        g.fillCircle(x, y - 16, 11);
        break;
      case 'bench': {
        const len = prop.length ?? 74;
        g.fillStyle(0x000000, 0.26);
        g.fillEllipse(x, y + 3, len, 14);
        g.fillStyle(0x5b4632, 1);
        g.fillRect(x - len / 2, y - 16, len, 12);
        g.fillStyle(0x6d573f, 1);
        g.fillRect(x - len / 2, y - 34, len, 10);
        g.fillStyle(0x3a3a3e, 1);
        g.fillRect(x - len / 2 + 6, y - 8, 6, 10);
        g.fillRect(x + len / 2 - 12, y - 8, 6, 10);
        collision = { w: len, h: 14, offsetY: -8 };
        break;
      }
      case 'lamp': {
        g.fillStyle(0x000000, 0.25);
        g.fillEllipse(x, y + 2, 18, 7);
        g.fillStyle(0x4a4d52, 1);
        g.fillRect(x - 3, y - 96, 6, 96);
        g.fillRect(x - 3, y - 100, 26, 6);
        g.fillStyle(0xdcd6b8, 0.9);
        g.fillEllipse(x + 22, y - 92, 18, 9);
        const glow = scene.add.image(x + 22, y - 92, 'glow');
        glow.setDepth(9001);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        glow.setScale(1.4);
        glow.setAlpha(0);
        glow.setTint(0xffd68a);
        lampGlows.push(glow);
        break;
      }
      case 'bin':
        g.fillStyle(0x000000, 0.25);
        g.fillEllipse(x, y + 2, 26, 10);
        g.fillStyle(0x3f5147, 1);
        g.fillRect(x - 11, y - 30, 22, 30);
        g.fillStyle(0x4d6156, 1);
        g.fillRect(x - 13, y - 34, 26, 6);
        break;
      case 'dumpster':
        g.fillStyle(0x000000, 0.3);
        g.fillEllipse(x, y + 3, 62, 16);
        g.fillStyle(0x2f5a4a, 1);
        g.fillRect(x - 28, y - 34, 56, 34);
        g.fillStyle(0x3d6f5c, 1);
        g.fillRect(x - 30, y - 42, 60, 10);
        g.fillStyle(0x000000, 0.25);
        g.fillRect(x - 28, y - 12, 56, 5);
        g.fillStyle(0x24483b, 1);
        g.fillCircle(x - 20, y - 1, 4);
        g.fillCircle(x + 20, y - 1, 4);
        collision = { w: 58, h: 22, offsetY: -12 };
        break;
      case 'fence': {
        const len = prop.length ?? 120;
        g.fillStyle(0x55504a, 1);
        if (prop.dir === 'v') {
          g.fillRect(x - 3, y, 6, len);
          for (let i = 0; i < len; i += 22) g.fillRect(x - 8, y + i, 16, 4);
          collision = { w: 10, h: len, offsetY: len / 2 };
        } else {
          g.fillRect(x, y - 34, len, 5);
          g.fillRect(x, y - 14, len, 5);
          for (let i = 0; i < len; i += 24) g.fillRect(x + i, y - 40, 5, 40);
          collision = { w: len, h: 12, offsetY: -8 };
        }
        break;
      }
      case 'car': {
        const colors = [0x8c3a3a, 0x2f4a6d, 0x6d6a5f, 0x3a6d4f, 0x7a7a80];
        const color = colors[(prop.variant ?? 0) % colors.length]!;
        g.fillStyle(0x000000, 0.3);
        g.fillEllipse(x, y + 3, 76, 22);
        g.fillStyle(color, 1);
        g.fillRoundedRect(x - 34, y - 62, 68, 62, 10);
        g.fillStyle(0x1f2429, 0.85);
        g.fillRoundedRect(x - 26, y - 52, 52, 20, 5);
        g.fillRoundedRect(x - 26, y - 24, 52, 16, 5);
        g.fillStyle(0xffffff, 0.12);
        g.fillRect(x - 34, y - 62, 68, 4);
        collision = { w: 66, h: 56, offsetY: -30 };
        break;
      }
      case 'busStop':
        g.fillStyle(0x000000, 0.28);
        g.fillEllipse(x, y + 3, 120, 22);
        g.fillStyle(0x3d4550, 0.9);
        g.fillRect(x - 58, y - 92, 116, 8);
        g.fillRect(x - 58, y - 84, 6, 84);
        g.fillRect(x + 52, y - 84, 6, 84);
        g.fillStyle(0x2b3138, 0.55);
        g.fillRect(x - 52, y - 84, 104, 60);
        g.fillStyle(0x5b6472, 1);
        g.fillRect(x - 40, y - 26, 80, 10);
        collision = { w: 116, h: 16, offsetY: -8 };
        break;
      case 'kiosk':
        g.fillStyle(0x000000, 0.28);
        g.fillEllipse(x, y + 3, 96, 22);
        g.fillStyle(0x6b6257, 1);
        g.fillRect(x - 44, y - 76, 88, 76);
        g.fillStyle(0x8a7f6d, 1);
        g.fillRect(x - 48, y - 84, 96, 10);
        g.fillStyle(0x1f2429, 0.9);
        g.fillRect(x - 34, y - 60, 68, 30);
        g.fillStyle(0xc9b27a, 0.85);
        g.fillRect(x - 40, y - 72, 80, 8);
        collision = { w: 90, h: 30, offsetY: -16 };
        break;
      case 'cardboard':
        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(x, y + 2, 70, 16);
        g.fillStyle(0x9b7c52, 1);
        g.fillRect(x - 34, y - 12, 68, 14);
        g.fillStyle(0x8a6c46, 1);
        g.fillRect(x - 30, y - 18, 58, 8);
        break;
      case 'crate':
        g.fillStyle(0x000000, 0.25);
        g.fillEllipse(x, y + 2, 40, 12);
        g.fillStyle(0x7a5f3d, 1);
        g.fillRect(x - 18, y - 34, 36, 34);
        g.fillStyle(0x8d7047, 1);
        g.fillRect(x - 18, y - 38, 36, 6);
        g.lineStyle(2, 0x5a452c, 1);
        g.strokeRect(x - 18, y - 34, 36, 34);
        collision = { w: 36, h: 16, offsetY: -10 };
        break;
      case 'planter':
        g.fillStyle(0x000000, 0.22);
        g.fillEllipse(x, y + 2, 46, 14);
        g.fillStyle(0x6b6b66, 1);
        g.fillRect(x - 22, y - 22, 44, 22);
        g.fillStyle(0x3d5c38, 1);
        g.fillEllipse(x, y - 24, 44, 16);
        collision = { w: 44, h: 18, offsetY: -10 };
        break;
      case 'pipe': {
        const len = prop.length ?? 160;
        g.fillStyle(0x565b60, 1);
        if (prop.dir === 'v') g.fillRect(x - 7, y, 14, len);
        else g.fillRect(x, y - 14, len, 14);
        g.fillStyle(0x6a7075, 0.6);
        if (prop.dir === 'v') g.fillRect(x - 7, y, 4, len);
        else g.fillRect(x, y - 14, len, 4);
        break;
      }
      case 'puddle':
        g.fillStyle(0x2b3a44, 0.7);
        g.fillEllipse(x, y, 70, 26);
        g.fillStyle(0x6d8ea3, 0.25);
        g.fillEllipse(x - 10, y - 4, 30, 10);
        break;
      case 'grate':
        g.fillStyle(0x2a2d31, 1);
        g.fillRect(x - 20, y - 12, 40, 24);
        g.lineStyle(2, 0x1a1c1f, 1);
        for (let i = 0; i < 5; i += 1) g.lineBetween(x - 18 + i * 9, y - 10, x - 18 + i * 9, y + 10);
        break;
      case 'sign':
        g.fillStyle(0x4a4d52, 1);
        g.fillRect(x - 2, y - 60, 4, 60);
        g.fillStyle(0x9aa3ad, 1);
        g.fillRect(x - 22, y - 84, 44, 26);
        g.fillStyle(0x2b3138, 1);
        g.fillRect(x - 18, y - 78, 36, 6);
        g.fillRect(x - 18, y - 68, 26, 5);
        break;
      case 'pole':
        g.fillStyle(0x4a4d52, 1);
        g.fillRect(x - 3, y - 70, 6, 70);
        break;
      case 'pigeon':
        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(x, y + 1, 14, 5);
        g.fillStyle(0x6f7681, 1);
        g.fillEllipse(x, y - 6, 14, 10);
        g.fillStyle(0x5c636e, 1);
        g.fillCircle(x + 6, y - 11, 4);
        g.fillStyle(0xd4a04a, 1);
        g.fillTriangle(x + 9, y - 11, x + 13, y - 10, x + 9, y - 9);
        break;
      default:
        break;
    }

    if (prop.tint !== undefined) g.setTint?.(prop.tint);

    if (prop.collide && collision) {
      const body = scene.add.rectangle(x, y + collision.offsetY, collision.w, collision.h);
      body.setVisible(false);
      colliders.add(body);
    }
  }
}
