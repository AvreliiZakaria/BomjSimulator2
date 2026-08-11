import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LeaderboardCategory } from '../../../packages/shared/src/index.ts';

const here = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(here, '..', 'data');
const DB_PATH = join(DATA_DIR, 'db.json');

export interface PlayerRecord {
  playerId: string;
  nickname: string;
  token: string;
  createdAt: number;
  updatedAt: number;
  suspicious: boolean;
  lastReason?: string;
  scores: Record<LeaderboardCategory, number>;
  playedMinutes: number;
}

export interface DbShape {
  version: number;
  season: number;
  seasonStartedAt: number;
  players: Record<string, PlayerRecord>;
}

const emptyDb = (): DbShape => ({
  version: 1,
  season: 1,
  seasonStartedAt: Date.now(),
  players: {}
});

let cache: DbShape | null = null;
let writeQueued = false;

/** Автоматическая инициализация: ни одной внешней зависимости, ни одного платного сервиса. */
export function initDb(): DbShape {
  if (cache) return cache;
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) {
    cache = emptyDb();
    flush();
    return cache;
  }
  try {
    const parsed = JSON.parse(readFileSync(DB_PATH, 'utf8')) as DbShape;
    if (!parsed || typeof parsed !== 'object' || !parsed.players) throw new Error('bad shape');
    cache = { ...emptyDb(), ...parsed };
  } catch {
    // Повреждённая база не должна ронять сервер: делаем бэкап и стартуем с чистой.
    try {
      renameSync(DB_PATH, `${DB_PATH}.corrupt-${Date.now()}`);
    } catch {
      /* игнорируем */
    }
    cache = emptyDb();
    flush();
  }
  return cache;
}

export function db(): DbShape {
  return cache ?? initDb();
}

/** Дебаунс записи: не пишем файл на каждый запрос. */
export function persist(): void {
  if (writeQueued) return;
  writeQueued = true;
  setTimeout(() => {
    writeQueued = false;
    flush();
  }, 400);
}

function flush(): void {
  if (!cache) return;
  const tmp = `${DB_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(cache, null, 2), 'utf8');
  renameSync(tmp, DB_PATH);
}

process.on('exit', flush);
