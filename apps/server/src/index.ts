import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomUUID, randomBytes } from 'node:crypto';
import { initDb, db, persist, type PlayerRecord } from './db.ts';
import {
  ApiRoutes,
  API_VERSION,
  LEADERBOARD_CATEGORIES,
  validateScore,
  type LeaderboardCategory,
  type LeaderboardEntry,
  type LeaderboardResponse,
  type ProfileRequest,
  type ScoreSubmission,
  type SessionRequest
} from '../../../packages/shared/src/index.ts';

const PORT = Number(process.env.PORT ?? 8787);

initDb();

function send(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Cache-Control': 'no-store'
  });
  res.end(payload);
}

async function readJson<T>(req: IncomingMessage): Promise<T | null> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > 64 * 1024) return null;
    chunks.push(chunk as Buffer);
  }
  if (!chunks.length) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
  } catch {
    return null;
  }
}

function sanitizeNickname(raw: unknown): string {
  const value = String(raw ?? '').trim().slice(0, 16);
  const cleaned = value.replace(/[^\p{L}\p{N} _-]/gu, '');
  return cleaned.length >= 2 ? cleaned : `Ноль-${Math.floor(Math.random() * 9000 + 1000)}`;
}

function auth(playerId: unknown, token: unknown): PlayerRecord | null {
  const record = db().players[String(playerId)];
  if (!record) return null;
  return record.token === String(token) ? record : null;
}

function buildLeaderboard(category: LeaderboardCategory, playerId?: string): LeaderboardResponse {
  const state = db();
  const rows = Object.values(state.players)
    .filter((p) => (p.scores?.[category] ?? 0) > 0)
    .sort((a, b) => (b.scores[category] ?? 0) - (a.scores[category] ?? 0));

  const toEntry = (record: PlayerRecord, index: number): LeaderboardEntry => ({
    rank: index + 1,
    playerId: record.playerId,
    nickname: record.nickname,
    value: record.scores[category] ?? 0,
    updatedAt: record.updatedAt,
    suspicious: record.suspicious || undefined
  });

  const top = rows.slice(0, 50).map(toEntry);
  let self: LeaderboardEntry | undefined;
  let distanceToNext: number | undefined;

  if (playerId) {
    const index = rows.findIndex((p) => p.playerId === playerId);
    if (index >= 0) {
      self = toEntry(rows[index]!, index);
      const above = rows[index - 1];
      if (above) distanceToNext = (above.scores[category] ?? 0) - self.value;
    }
  }

  return { category, season: state.season, top, self, distanceToNext, total: rows.length };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }

  if (url.pathname === ApiRoutes.health) {
    send(res, 200, { ok: true, apiVersion: API_VERSION, season: db().season });
    return;
  }

  if (url.pathname === ApiRoutes.session && req.method === 'POST') {
    const body = await readJson<SessionRequest>(req);
    if (!body) {
      send(res, 400, { error: 'Некорректное тело запроса' });
      return;
    }
    const state = db();
    const nickname = sanitizeNickname(body.nickname);
    const existing = body.playerId ? state.players[body.playerId] : undefined;
    if (existing) {
      existing.nickname = nickname;
      existing.updatedAt = Date.now();
      persist();
      send(res, 200, {
        playerId: existing.playerId,
        nickname: existing.nickname,
        token: existing.token,
        createdAt: existing.createdAt
      });
      return;
    }
    const record: PlayerRecord = {
      playerId: body.playerId && /^[a-zA-Z0-9-]{6,64}$/.test(body.playerId) ? body.playerId : randomUUID(),
      nickname,
      token: randomBytes(24).toString('hex'),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      suspicious: false,
      playedMinutes: 0,
      scores: { wealth: 0, reputation: 0, days: 0, collections: 0, season: 0 }
    };
    state.players[record.playerId] = record;
    persist();
    send(res, 200, {
      playerId: record.playerId,
      nickname: record.nickname,
      token: record.token,
      createdAt: record.createdAt
    });
    return;
  }

  if (url.pathname === ApiRoutes.profile && req.method === 'POST') {
    const body = await readJson<ProfileRequest>(req);
    const record = body && auth(body.playerId, body.token);
    if (!record) {
      send(res, 401, { error: '不 авторизовано' });
      return;
    }
    record.nickname = sanitizeNickname(body!.nickname);
    record.updatedAt = Date.now();
    persist();
    send(res, 200, { playerId: record.playerId, nickname: record.nickname });
    return;
  }

  if (url.pathname === ApiRoutes.score && req.method === 'POST') {
    const body = await readJson<ScoreSubmission>(req);
    const record = body && auth(body.playerId, body.token);
    if (!record) {
      send(res, 401, { error: 'Не авторизовано' });
      return;
    }
    const result = validateScore(body!);
    const s = result.sanitized;
    record.suspicious = result.suspicious;
    record.lastReason = result.reason;
    record.playedMinutes = Math.max(record.playedMinutes, s.playedMinutes);
    record.updatedAt = Date.now();
    // Рейтинг только растёт: сервер хранит лучший подтверждённый результат.
    record.scores.wealth = Math.max(record.scores.wealth, s.wealth);
    record.scores.reputation = Math.max(record.scores.reputation, s.reputation);
    record.scores.days = Math.max(record.scores.days, s.days);
    record.scores.collections = Math.max(record.scores.collections, s.collections);
    record.scores.season = Math.max(
      record.scores.season,
      Math.floor(s.wealth / 100 + s.reputation * 5 + s.days * 50 + s.collections * 25)
    );
    persist();

    const ranks: Partial<Record<LeaderboardCategory, number>> = {};
    for (const category of LEADERBOARD_CATEGORIES) {
      const board = buildLeaderboard(category, record.playerId);
      if (board.self) ranks[category] = board.self.rank;
    }
    send(res, 200, { accepted: true, reason: result.reason, ranks });
    return;
  }

  if (url.pathname === ApiRoutes.leaderboard && req.method === 'GET') {
    const raw = url.searchParams.get('category') as LeaderboardCategory | null;
    const category: LeaderboardCategory =
      raw && LEADERBOARD_CATEGORIES.includes(raw) ? raw : 'wealth';
    send(res, 200, buildLeaderboard(category, url.searchParams.get('playerId') ?? undefined));
    return;
  }

  send(res, 404, { error: 'Не найдено' });
});

server.listen(PORT, () => {
  console.log(`[НУЛЬ] сервер рейтингов слушает http://localhost:${PORT}`);
});
