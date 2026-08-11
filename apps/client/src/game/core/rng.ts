/** Утилиты случайности. Все вероятности игры проходят через них. */

export const randFloat = (min: number, max: number): number => min + Math.random() * (max - min);

export const randInt = (min: number, max: number): number =>
  Math.floor(min + Math.random() * (max - min + 1));

export const chance = (probability: number): boolean => Math.random() < probability;

export function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

export function pickWeighted<T>(list: readonly T[], weightOf: (item: T) => number): T | null {
  let total = 0;
  for (const item of list) total += Math.max(0, weightOf(item));
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const item of list) {
    roll -= Math.max(0, weightOf(item));
    if (roll <= 0) return item;
  }
  return list[list.length - 1] ?? null;
}

export function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
