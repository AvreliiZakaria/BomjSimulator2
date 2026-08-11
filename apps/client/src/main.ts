import Phaser from 'phaser';
import './styles/main.css';
import { GameConfig } from './game/config/GameConfig.js';
import { InputState } from './game/core/InputStateManager.js';
import { SaveService } from './game/services/SaveService.js';
import { Settings } from './game/services/SettingsService.js';
import { ServerClient } from './game/services/ServerClient.js';
import { GameContext } from './game/state/GameContext.js';
import { PlayerState } from './game/state/PlayerState.js';
import { BootScene } from './game/scenes/BootScene.js';
import { PreloadScene } from './game/scenes/PreloadScene.js';
import { MainMenuScene } from './game/scenes/MainMenuScene.js';
import { GameScene } from './game/scenes/GameScene.js';
import { UiManager } from './ui/UiManager.js';
import { showCharacterCreate } from './ui/screens/CharacterCreateUi.js';
import { uiRoot } from './ui/dom.js';

const parent = document.getElementById('game-root');
if (!parent) throw new Error('#game-root не найден');

// Настройки читаем до создания игры: от них зависит лимит кадров.
const settings = Settings.value;

const ui = new UiManager({
  newGame: () => startNewGame(),
  continueGame: () => continueGame(),
  exitToMenu: () => exitToMenu()
});

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent,
  backgroundColor: '#0b0d12',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false }
  },
  fps: {
    target: settings.fpsCap,
    min: 20,
    forceSetTimeOut: settings.fpsCap === 30
  },
  render: {
    antialias: true,
    roundPixels: false,
    powerPreference: 'high-performance'
  },
  input: { activePointers: 3 },
  scene: [BootScene, PreloadScene, MainMenuScene, GameScene]
});

ui.attachGame(game);

game.events.once(Phaser.Core.Events.READY, () => {
  const menuScene = game.scene.getScene('MainMenu');
  const gameScene = game.scene.getScene('Game');

  if (menuScene) {
    menuScene.events.on(Phaser.Scenes.Events.CREATE, () => ui.showMenu());
    menuScene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => ui.hideMenu());
  }
  if (gameScene) {
    gameScene.events.on(Phaser.Scenes.Events.CREATE, () => ui.showHud());
    gameScene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => ui.hideHud());
  }
});

function beginSession(): void {
  const context = GameContext.require();
  context.ui = ui;
  void ServerClient.ensureSession(context.player.data.nickname);
  game.scene.stop('MainMenu');
  game.scene.start('Game');
}

function startNewGame(): void {
  showCharacterCreate(
    uiRoot(),
    (nickname, appearance) => {
      GameContext.current?.destroy();
      SaveService.clear();
      SaveService.updateIdentity({ nickname });

      const snapshot = PlayerState.createNew(nickname, appearance);
      const context = new GameContext(snapshot);
      context.ui = ui;
      context.save(true);
      beginSession();
    },
    () => undefined
  );
}

function continueGame(): void {
  const snapshot = SaveService.load();
  if (!snapshot) {
    ui.toast('Сохранение не найдено', 'bad');
    return;
  }
  GameContext.current?.destroy();
  const context = new GameContext(snapshot);
  context.ui = ui;
  beginSession();
}

function exitToMenu(): void {
  const context = GameContext.current;
  if (context) {
    context.save(true);
    context.destroy();
  }
  InputState.reset('GAMEPLAY');
  game.scene.stop('Game');
  game.scene.start('MainMenu');
}

// Сохраняемся, когда игрок сворачивает вкладку или закрывает её.
const saveOnLeave = (): void => {
  GameContext.current?.save(true);
};
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveOnLeave();
});
window.addEventListener('pagehide', saveOnLeave);
window.addEventListener('beforeunload', saveOnLeave);

// Подсказка для совсем узких окон.
const rotateHint = document.getElementById('rotate-hint');
const checkViewport = (): void => {
  if (!rotateHint) return;
  const tooSmall = window.innerWidth < 380 || window.innerHeight < 320;
  rotateHint.hidden = !tooSmall;
  rotateHint.style.display = tooSmall ? 'flex' : 'none';
};
window.addEventListener('resize', checkViewport);
window.addEventListener('orientationchange', checkViewport);
checkViewport();

console.info(GameConfig.title + ' ' + GameConfig.version + ' — ' + GameConfig.slogan);
