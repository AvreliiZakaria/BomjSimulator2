import { GameConfig } from '../config/GameConfig.js';
import { bus } from '../core/EventBus.js';
import { PlayerState, DEFAULT_APPEARANCE } from '../state/PlayerState.js';
import {
  SAVE_KEY,
  SAVE_VERSION,
  SETTINGS_KEY,
  IDENTITY_KEY,
  type GameSettings,
  type LocalIdentity,
  type SaveGame
} from '../../types/save.js';
import type { PlayerSnapshot } from '../../types/player.js';

export const DEFAULT_SETTINGS: GameSettings = {
  graphics: 'auto',
  fpsCap: 60,
  volumeMaster: 0.8,
  volumeMusic: 0.5,
  volumeEffects: 0.8,
  volumeAmbience: 0.6,
  uiScale: 1,
  textScale: 1,
  reducedMotion: false,
  subtitles: true,
  highContrast: false,
  showJoystick: 'auto'
};

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn('[Save] не удалось записать хранилище', error);
  }
}

/** Миграции по версиям схемы. Каждая версия умеет подняться до следующей. */
const MIGRATIONS: Record<number, (save: SaveGame) => SaveGame> = {
  1: (save) => {
    const player = save.player as PlayerSnapshot & { money?: number };
    if (typeof player.money === 'number') {
      player.cash = player.money;
      delete player.money;
    }
    player.bank ??= 0;
    player.bankUnlocked ??= false;
    return { ...save, version: 2, player };
  },
  2: (save) => {
    const player = save.player;
    player.businesses ??= [];
    player.collections ??= [];
    player.eventCooldowns ??= {};
    player.shopStock ??= {};
    player.shopDay ??= 0;
    return { ...save, version: 3, player };
  }
};

/** Добивает недостающие поля: старый или частично битый сейв не должен ронять игру. */
function normalize(snapshot: Partial<PlayerSnapshot>): PlayerSnapshot {
  const fresh = PlayerState.createNew(snapshot.nickname ?? 'Ноль', snapshot.appearance ?? DEFAULT_APPEARANCE);
  const merged: PlayerSnapshot = {
    ...fresh,
    ...snapshot,
    appearance: { ...fresh.appearance, ...(snapshot.appearance ?? {}) },
    survival: { ...fresh.survival, ...(snapshot.survival ?? {}) },
    skills: { ...fresh.skills, ...(snapshot.skills ?? {}) },
    skillXp: { ...fresh.skillXp, ...(snapshot.skillXp ?? {}) },
    equipment: { ...fresh.equipment, ...(snapshot.equipment ?? {}) },
    reputation: { ...fresh.reputation, ...(snapshot.reputation ?? {}) },
    housing: { ...fresh.housing, ...(snapshot.housing ?? {}) },
    quests: snapshot.quests ?? {},
    flags: snapshot.flags ?? {},
    relationships: snapshot.relationships ?? {},
    inventory: Array.isArray(snapshot.inventory) ? snapshot.inventory : [],
    statuses: Array.isArray(snapshot.statuses) ? snapshot.statuses : [],
    unlockedDistricts: snapshot.unlockedDistricts?.length ? snapshot.unlockedDistricts : ['residential'],
    businesses: snapshot.businesses ?? [],
    achievements: snapshot.achievements ?? [],
    collections: snapshot.collections ?? [],
    searchedToday: snapshot.searchedToday ?? [],
    jobCooldowns: snapshot.jobCooldowns ?? {},
    eventCooldowns: snapshot.eventCooldowns ?? {},
    shopStock: snapshot.shopStock ?? {}
  };
  return merged;
}

class SaveServiceImpl {
  private lastWrite = 0;

  hasSave(): boolean {
    return Boolean(safeGet(SAVE_KEY));
  }

  load(): PlayerSnapshot | null {
    const raw = safeGet(SAVE_KEY);
    if (!raw) return null;
    try {
      let save = JSON.parse(raw) as SaveGame;
      if (!save || typeof save !== 'object' || !save.player) throw new Error('битая структура');
      while (save.version < SAVE_VERSION) {
        const migrate = MIGRATIONS[save.version];
        if (!migrate) {
          save = { ...save, version: SAVE_VERSION };
          break;
        }
        save = migrate(save);
      }
      return normalize(save.player);
    } catch (error) {
      console.error('[Save] сейв повреждён, откладываем копию и начинаем заново', error);
      safeSet(`${SAVE_KEY}:corrupt:${Date.now()}`, raw);
      try {
        window.localStorage.removeItem(SAVE_KEY);
      } catch {
        /* игнорируем */
      }
      return null;
    }
  }

  /** force=true игнорирует троттлинг (выход в меню, сон, конец дня). */
  write(snapshot: PlayerSnapshot, force = false): void {
    const now = Date.now();
    if (!force && now - this.lastWrite < GameConfig.save.minIntervalMs) return;
    this.lastWrite = now;
    const payload: SaveGame = { version: SAVE_VERSION, savedAt: now, player: snapshot };
    safeSet(SAVE_KEY, JSON.stringify(payload));
    bus.emit('save:written', { at: now });
  }

  clear(): void {
    try {
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      /* игнорируем */
    }
  }

  meta(): { savedAt: number; day: number; nickname: string; cash: number } | null {
    const raw = safeGet(SAVE_KEY);
    if (!raw) return null;
    try {
      const save = JSON.parse(raw) as SaveGame;
      return {
        savedAt: save.savedAt,
        day: save.player.day ?? 1,
        nickname: save.player.nickname ?? 'Ноль',
        cash: save.player.cash ?? 0
      };
    } catch {
      return null;
    }
  }

  // ─────────────────────────── НАСТРОЙКИ ───────────────────────────

  loadSettings(): GameSettings {
    const raw = safeGet(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<GameSettings>) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings(settings: GameSettings): void {
    safeSet(SETTINGS_KEY, JSON.stringify(settings));
  }

  // ─────────────────────────── ЛИЧНОСТЬ ───────────────────────────

  /** Анонимная локальная личность: игра запускается без всякой регистрации. */
  identity(): LocalIdentity {
    const raw = safeGet(IDENTITY_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as LocalIdentity;
      } catch {
        /* пересоздадим ниже */
      }
    }
    const identity: LocalIdentity = {
      playerId: `nul-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`,
      nickname: 'Ноль'
    };
    safeSet(IDENTITY_KEY, JSON.stringify(identity));
    return identity;
  }

  updateIdentity(patch: Partial<LocalIdentity>): LocalIdentity {
    const identity = { ...this.identity(), ...patch };
    safeSet(IDENTITY_KEY, JSON.stringify(identity));
    return identity;
  }
}

export const SaveService = new SaveServiceImpl();
