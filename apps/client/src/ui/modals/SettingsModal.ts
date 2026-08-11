import { Settings } from '../../game/services/SettingsService.js';
import { Modal } from '../Modal.js';
import { el, onTap } from '../dom.js';
import type { GameSettings, GraphicsQuality } from '../../types/save.js';

export function showSettings(parent: HTMLElement): Modal {
  const modal = new Modal(parent, { title: 'НАСТРОЙКИ', subtitle: 'Графика, звук, интерфейс, доступность' });

  const section = (title: string): HTMLElement => el('div', { class: 'phone__title', text: title });

  const choices = <K extends keyof GameSettings>(
    label: string,
    key: K,
    options: { value: GameSettings[K]; label: string }[]
  ): HTMLElement => {
    const row = el('div', { class: 'tabs' });
    const paint = (): void => {
      for (const child of Array.from(row.children)) {
        const node = child as HTMLElement;
        node.classList.toggle('tab--active', node.dataset.value === String(Settings.value[key]));
      }
    };
    for (const option of options) {
      const tab = el('button', { class: 'tab', text: option.label });
      tab.dataset.value = String(option.value);
      onTap(tab, () => {
        Settings.set(key, option.value);
        paint();
      });
      row.append(tab);
    }
    paint();
    return el('div', { class: 'field' }, [el('label', { text: label }), row]);
  };

  const slider = <K extends keyof GameSettings>(
    label: string,
    key: K,
    min = 0,
    max = 1,
    step = 0.05
  ): HTMLElement => {
    const input = el('input', {
      type: 'range',
      min: String(min),
      max: String(max),
      step: String(step),
      value: String(Settings.value[key])
    });
    const value = el('span', { class: 'muted', text: String(Settings.value[key]) });
    input.addEventListener('input', () => {
      Settings.set(key, Number(input.value) as unknown as GameSettings[K]);
      value.textContent = input.value;
    });
    return el('div', { class: 'field' }, [el('label', {}, [el('span', { text: label }), value]), input]);
  };

  const toggle = <K extends keyof GameSettings>(label: string, key: K, description?: string): HTMLElement => {
    const isOn = (): boolean => Boolean(Settings.value[key]);
    const button = el('button', {
      class: isOn() ? 'btn btn--small btn--primary' : 'btn btn--small',
      text: isOn() ? 'ВКЛ' : 'ВЫКЛ'
    });
    onTap(button, () => {
      const next = !isOn();
      Settings.set(key, next as unknown as GameSettings[K]);
      button.textContent = next ? 'ВКЛ' : 'ВЫКЛ';
      button.className = next ? 'btn btn--small btn--primary' : 'btn btn--small';
    });
    return el('div', { class: 'row' }, [
      el('div', { class: 'row__main' }, [
        el('div', { class: 'row__title', text: label }),
        description ? el('div', { class: 'row__desc', text: description }) : null
      ]),
      el('div', { class: 'row__side' }, [button])
    ]);
  };

  const graphicsOptions: { value: GraphicsQuality; label: string }[] = [
    { value: 'auto', label: 'Авто' },
    { value: 'low', label: 'Низкая' },
    { value: 'medium', label: 'Средняя' },
    { value: 'high', label: 'Высокая' }
  ];

  modal.setContent(
    section('Графика'),
    choices('Качество', 'graphics', graphicsOptions),
    choices('Кадры в секунду', 'fpsCap', [
      { value: 30, label: '30' },
      { value: 60, label: '60' }
    ]),
    el('div', { class: 'row__desc', text: 'Смена лимита кадров применится при следующем запуске.' }),
    section('Звук'),
    slider('Общая громкость', 'volumeMaster'),
    slider('Музыка', 'volumeMusic'),
    slider('Эффекты', 'volumeEffects'),
    slider('Окружение', 'volumeAmbience'),
    section('Интерфейс'),
    slider('Масштаб интерфейса', 'uiScale', 0.8, 1.4, 0.05),
    slider('Размер текста', 'textScale', 0.85, 1.35, 0.05),
    choices('Джойстик', 'showJoystick', [
      { value: 'auto', label: 'Авто' },
      { value: 'always', label: 'Всегда' },
      { value: 'never', label: 'Никогда' }
    ]),
    section('Доступность'),
    toggle('Меньше анимаций', 'reducedMotion', 'Отключает лишнее движение интерфейса'),
    toggle('Субтитры', 'subtitles', 'Текстовое дублирование звуковых событий'),
    toggle('Высокий контраст', 'highContrast', 'Более плотные панели и заметные границы')
  );

  modal.setFooter(
    modal.button('СБРОСИТЬ', () => {
      Settings.reset();
      modal.close();
      showSettings(parent);
    }, 'ghost'),
    modal.button('ГОТОВО', () => modal.close(), 'primary')
  );

  return modal;
}
