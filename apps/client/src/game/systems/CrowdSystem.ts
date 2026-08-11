import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig.js';
import { pick, randFloat, randInt } from '../core/rng.js';
import { CharacterSprite, facingFromVector } from '../world/CharacterArt.js';
import type { DistrictDefinition, Vec2 } from '../../types/world.js';
import type { TimePeriod } from '../../types/time.js';
import type { ResolvedQuality } from '../services/SettingsService.js';
import type { Appearance } from '../../types/player.js';

const SKINS = ['#e8bd97', '#d8a37a', '#c08a5e', '#a3714b', '#8a5a3a', '#f0cfae'];
const HAIRS = ['#2b2019', '#4a3526', '#6b5136', '#8d7a5f', '#9a9a95', '#1a1a1d'];
const TOPS = ['#3f4a5c', '#5a4636', '#3d5a4a', '#6a3f45', '#2f3742', '#7a6a55', '#44506b'];
const BOTTOMS = ['#2b3038', '#3a3a44', '#4a4033', '#333b47'];
const SHOES = ['#22242a', '#2f2a25', '#1c1e22'];
const STYLES: Appearance['hairStyle'][] = ['short', 'long', 'cap', 'hood', 'bald', 'beanie'];

const randomAppearance = (): Appearance => ({
  skin: pick(SKINS),
  hair: pick(HAIRS),
  hairStyle: pick(STYLES),
  top: pick(TOPS),
  bottom: pick(BOTTOMS),
  shoes: pick(SHOES)
});

interface Pedestrian {
  sprite: CharacterSprite;
  target: Vec2;
  waitMs: number;
  speed: number;
}

/** Обычные прохожие. Ночью их почти нет, после 03:00 — единицы. */
export class CrowdSystem {
  private people: Pedestrian[] = [];
  private walkPoints: Vec2[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    district: DistrictDefinition
  ) {
    for (const road of district.roads) {
      if (road.orientation === 'h') {
        for (let x = road.x + 40; x < road.x + road.w; x += 120) {
          this.walkPoints.push({ x, y: road.y - 16 });
          this.walkPoints.push({ x, y: road.y + road.h + 16 });
        }
      } else {
        for (let y = road.y + 40; y < road.y + road.h; y += 120) {
          this.walkPoints.push({ x: road.x - 16, y });
          this.walkPoints.push({ x: road.x + road.w + 16, y });
        }
      }
    }
    if (!this.walkPoints.length) {
      this.walkPoints.push({ x: district.spawn.x, y: district.spawn.y });
    }
  }

  private desiredCount(quality: ResolvedQuality, period: TimePeriod, density: number): number {
    const base = GameConfig.crowd.maxNpc[quality];
    const factor = GameConfig.crowd.densityByPeriod[period] ?? 1;
    return Math.max(0, Math.round(base * factor * density));
  }

  update(deltaMs: number, quality: ResolvedQuality, period: TimePeriod, density: number): void {
    const desired = this.desiredCount(quality, period, density);

    while (this.people.length < desired) this.spawn();
    while (this.people.length > desired) {
      const person = this.people.pop();
      person?.sprite.destroy();
    }

    for (const person of this.people) {
      if (person.waitMs > 0) {
        person.waitMs -= deltaMs;
        person.sprite.setAnim('idle');
      } else {
        const dx = person.target.x - person.sprite.x;
        const dy = person.target.y - person.sprite.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 8) {
          person.target = pick(this.walkPoints);
          person.waitMs = randInt(0, 2600);
        } else {
          const step = (person.speed * deltaMs) / 1000;
          person.sprite.x += (dx / distance) * step;
          person.sprite.y += (dy / distance) * step;
          person.sprite.setFacing(facingFromVector(dx, dy, person.sprite.currentFacing));
          person.sprite.setAnim('walk');
        }
      }
      person.sprite.setDepth(person.sprite.y);
      person.sprite.tick(deltaMs);
    }
  }

  private spawn(): void {
    const start = pick(this.walkPoints);
    const sprite = new CharacterSprite(this.scene, start.x, start.y, randomAppearance());
    this.people.push({
      sprite,
      target: pick(this.walkPoints),
      waitMs: randInt(0, 1800),
      speed: randFloat(GameConfig.crowd.walkSpeed * 0.75, GameConfig.crowd.walkSpeed * 1.35)
    });
  }

  clear(): void {
    for (const person of this.people) person.sprite.destroy();
    this.people = [];
  }
}
