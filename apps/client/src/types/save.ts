import type { PlayerSnapshot } from './player.js';

export const SAVE_VERSION = 3;
export const SAVE_KEY = 'nul:save:v1';
export const SETTINGS_KEY = 'nul:settings:v1';
export const IDENTITY_KEY = 'nul:identity:v1';

export interface SaveGame {
  version: number;
  savedAt: number;
  player: PlayerSnapshot;
}

export type GraphicsQuality = 'auto' | 'low' | 'medium' | 'high';

export interface GameSettings {
  graphics: GraphicsQuality;
  fpsCap: 30 | 60;
  volumeMaster: number;
  volumeMusic: number;
  volumeEffects: number;
  volumeAmbience: number;
  uiScale: number;
  textScale: number;
  reducedMotion: boolean;
  subtitles: boolean;
  highContrast: boolean;
  showJoystick: 'auto' | 'always' | 'never';
}

export interface LocalIdentity {
  playerId: string;
  nickname: string;
  token?: string;
  serverUrl?: string;
}
