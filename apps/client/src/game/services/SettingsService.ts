import { SaveService, DEFAULT_SETTINGS } from './SaveService.js';
import { bus } from '../core/EventBus.js';
import type { GameSettings, GraphicsQuality } from '../../types/save.js';

export type ResolvedQuality = 'low' | 'medium' | 'high';

class SettingsServiceImpl {
  private current: GameSettings = { ...DEFAULT_SETTINGS };
  private loaded = false;

  get value(): GameSettings {
    if (!this.loaded) {
      this.current = SaveService.loadSettings();
      this.loaded = true;
      this.applyToDom();
    }
    return this.current;
  }

  set<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
    this.value[key] = value;
    SaveService.saveSettings(this.current);
    this.applyToDom();
    bus.emit('ui:refresh', undefined);
  }

  patch(patch: Partial<GameSettings>): void {
    Object.assign(this.value, patch);
    SaveService.saveSettings(this.current);
    this.applyToDom();
    bus.emit('ui:refresh', undefined);
  }

  reset(): void {
    this.current = { ...DEFAULT_SETTINGS };
    SaveService.saveSettings(this.current);
    this.applyToDom();
  }

  /** «auto» превращаем в реальный уровень по возможностям устройства. */
  get quality(): ResolvedQuality {
    const setting: GraphicsQuality = this.value.graphics;
    if (setting !== 'auto') return setting;
    const cores = navigator.hardwareConcurrency ?? 4;
    const mobile = window.matchMedia('(pointer: coarse)').matches;
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    if (mobile && (cores <= 4 || small)) return 'low';
    if (cores >= 8 && !mobile) return 'high';
    return 'medium';
  }

  get isTouch(): boolean {
    return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  }

  get wantsJoystick(): boolean {
    const mode = this.value.showJoystick;
    if (mode === 'always') return true;
    if (mode === 'never') return false;
    return this.isTouch;
  }

  private applyToDom(): void {
    const root = document.documentElement;
    root.style.setProperty('--ui-scale', String(this.current.uiScale));
    root.style.setProperty('--text-scale', String(this.current.textScale));
    root.classList.toggle('reduced-motion', this.current.reducedMotion);
    root.classList.toggle('high-contrast', this.current.highContrast);
  }
}

export const Settings = new SettingsServiceImpl();
