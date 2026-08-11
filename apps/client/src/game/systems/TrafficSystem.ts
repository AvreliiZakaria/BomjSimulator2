import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig.js';
import { pick, randFloat } from '../core/rng.js';
import { Vehicle, type VehicleType } from '../entities/Vehicle.js';
import type { DistrictDefinition, RoadNodeDef } from '../../types/world.js';
import type { TimePeriod } from '../../types/time.js';
import type { ResolvedQuality } from '../services/SettingsService.js';

const TYPES: VehicleType[] = ['sedan', 'sedan', 'compact', 'compact', 'van', 'bus'];

/**
 * Трафик по дорожной сети: спавн вне камеры, движение по полосам,
 * деспавн на конечных узлах. Машины не накапливаются.
 * После 03:00 их почти нет.
 */
export class TrafficSystem {
  private vehicles: Vehicle[] = [];
  private nodes = new Map<string, RoadNodeDef>();
  private spawnNodes: RoadNodeDef[] = [];
  private timer = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly district: DistrictDefinition
  ) {
    for (const node of district.roadNodes) this.nodes.set(node.id, node);
    this.spawnNodes = district.roadNodes.filter((node) => node.spawn);
  }

  private maxCars(quality: ResolvedQuality, period: TimePeriod): number {
    const base = GameConfig.traffic.maxCars[quality];
    const density = GameConfig.traffic.densityByPeriod[period] ?? 1;
    return Math.max(0, Math.round(base * density * this.district.trafficDensity));
  }

  update(deltaMs: number, quality: ResolvedQuality, period: TimePeriod): void {
    // Движение и деспавн
    for (let i = this.vehicles.length - 1; i >= 0; i -= 1) {
      const vehicle = this.vehicles[i]!;
      const reached = vehicle.update(deltaMs);
      if (!reached) continue;

      const node = this.nodes.get(vehicle.currentNode);
      const nextId = node?.next.length ? pick(node.next) : null;
      const next = nextId ? this.nodes.get(nextId) : null;
      if (!next || node?.despawn) {
        vehicle.destroy();
        this.vehicles.splice(i, 1);
      } else {
        vehicle.setTarget(next);
      }
    }

    // Спавн
    this.timer += deltaMs;
    const limit = this.maxCars(quality, period);
    if (this.timer >= GameConfig.traffic.spawnIntervalMs && this.vehicles.length < limit && this.spawnNodes.length) {
      this.timer = 0;
      this.spawn();
    }

    // Страховка от накопления
    if (this.vehicles.length > limit + 4) {
      const extra = this.vehicles.splice(0, this.vehicles.length - limit);
      for (const vehicle of extra) vehicle.destroy();
    }
  }

  private spawn(): void {
    const start = pick(this.spawnNodes);
    const nextId = start.next[0];
    const next = nextId ? this.nodes.get(nextId) : null;
    if (!next) return;

    const type = pick(TYPES);
    const speed = randFloat(GameConfig.traffic.speed.min, GameConfig.traffic.speed.max);
    const vehicle = new Vehicle(this.scene, start.x, start.y, type, speed, start.id);
    vehicle.setTarget(next);
    this.vehicles.push(vehicle);
  }

  clear(): void {
    for (const vehicle of this.vehicles) vehicle.destroy();
    this.vehicles = [];
  }

  get count(): number {
    return this.vehicles.length;
  }
}
