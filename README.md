# НУЛЬ

**ВЫЖИВИ. ЗАРАБОТАЙ. ПОДНИМИСЬ.**

Браузерная игра: survival + экономический симулятор + RPG в компактном открытом городе.
После 03:00 город становится заметно страннее.

## Стек

- **Клиент:** TypeScript + Phaser 3 + Vite (Canvas), сложный UI — DOM/CSS поверх канваса
- **Сервер:** Node.js + TypeScript, HTTP API без зависимостей, локальная файловая БД (JSON), автоинициализация
- **Общий код:** `packages/shared` (типы, контракты API)

## Структура

```text
apps/
  client/   — игра (Phaser + Vite)
  server/   — leaderboard / profile API
packages/
  shared/   — общие типы и контракты
```

## Запуск

```bash
npm install
npm run dev          # клиент  -> http://localhost:5173
npm run dev:server   # сервер  -> http://localhost:8787
```

Сервер не обязателен: игра полностью играбельна оффлайн (локальный сейв, анонимная личность).
Без сервера отключаются только глобальные рейтинги.

## Скрипты

| Команда | Описание |
| --- | --- |
| `npm run dev` | dev-сервер клиента |
| `npm run dev:server` | API рейтингов |
| `npm run build` | продакшн-сборка клиента |
| `npm run typecheck` | проверка типов по всем воркспейсам |

## Платформы

Windows / macOS / Android / iOS · Chrome, Edge, Firefox, Safari · desktop, tablet, mobile portrait/landscape, safe-area.

## Принципы кода

- data-driven: контент лежит в `apps/client/src/data`, движок реализует общие системы
- один authoritative state денег: `PlayerState` -> событие -> HUD/сейв
- единый `InputStateManager` вместо россыпи флагов блокировки
- Y-based depth sorting, 3/4 top-down перспектива
- никакого pay-to-win, никаких ставок на реальные деньги
