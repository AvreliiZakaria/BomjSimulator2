import type { NpcDefinition } from '../types/npc.js';

const LIST: NpcDefinition[] = [
  {
    id: 'grisha',
    name: 'Дядя Гриша',
    title: 'уличный философ',
    district: 'residential',
    key: true,
    personality: 'саркастичный, но не злой',
    appearance: {
      skin: '#c99169',
      hair: '#9a9a95',
      hairStyle: 'beanie',
      top: '#5b5240',
      bottom: '#3a3630',
      shoes: '#2a2724'
    },
    wanders: false,
    activeHours: [7, 23],
    services: [],
    dialogue: [
      {
        id: 'first',
        text: 'Новенький. Вижу по глазам: думаешь, это временно. Все так думают.',
        conditions: { notFlag: 'met:grisha' },
        onEnter: { setFlag: [{ key: 'met:grisha', value: 1 }], relationship: [{ npcId: 'grisha', delta: 5 }] },
        choices: [
          {
            text: 'Где тут можно поесть?',
            effects: {
              relationship: [{ npcId: 'grisha', delta: 3 }],
              startQuest: 'q_first_meal',
              toast: { text: 'Гриша показал на мусорку у дома', tone: 'neutral' }
            },
            next: 'food'
          },
          { text: 'Где переночевать?', next: 'sleep' },
          { text: 'Обойдусь.', effects: { relationship: [{ npcId: 'grisha', delta: -2 }] }, next: null }
        ]
      },
      {
        id: 'root',
        text: 'Опять ты. Значит, ещё живой. Уже неплохо.',
        choices: [
          { text: 'Есть работа?', next: 'work' },
          { text: 'Что тут вообще происходит после трёх?', next: 'night' },
          {
            text: 'Держи, поешь.',
            conditions: { hasItem: { id: 'bread_half' } },
            effects: {
              takeItems: [{ id: 'bread_half' }],
              relationship: [{ npcId: 'grisha', delta: 12 }],
              reputation: [{ track: 'street', delta: 4 }],
              xp: 20,
              addFlag: [{ key: 'fedGrisha', value: 1 }]
            },
            next: 'fed'
          },
          {
            text: 'Верну термос.',
            conditions: { hasItem: { id: 'grisha_thermos' } },
            effects: {
              takeItems: [{ id: 'grisha_thermos' }],
              relationship: [{ npcId: 'grisha', delta: 20 }],
              money: 150,
              xp: 60,
              progressObjective: [{ questId: 'q_thermos', objectiveId: 'return', amount: 1 }]
            },
            next: 'thermos'
          },
          { text: 'Пойду.', next: null }
        ]
      },
      {
        id: 'food',
        text: 'Контейнеры во дворе. Не морщься: там иногда лежит нормальный хлеб. Просто не ешь то, что шевелится.',
        choices: [{ text: 'Понял.', next: null }]
      },
      {
        id: 'sleep',
        text: 'Лавочка у второго подъезда. Картон возьми из контейнера, без него к утру будешь как ледышка.',
        effects: undefined,
        choices: [{ text: 'Спасибо.', effects: { relationship: [{ npcId: 'grisha', delta: 2 }] }, next: null }]
      },
      {
        id: 'work',
        text: 'Бутылки, банки, металл. Скучно, зато честно. Борис в ломбарде всё это берёт.',
        choices: [
          { text: 'Займусь.', effects: { startQuest: 'q_first_money' }, next: null },
          { text: 'А что-то посерьёзнее?', conditions: { minLevel: 5 }, next: 'work2' }
        ]
      },
      {
        id: 'work2',
        text: 'Посерьёзнее — это к Артуру. Но он смотрит не на руки, а на репутацию. Заработай имя сначала.',
        choices: [{ text: 'Разберусь.', next: null }]
      },
      {
        id: 'night',
        text: 'После трёх? Город выдыхает. Машин нет, окон нет, людей почти нет. А кто есть — тем лучше не мешать.',
        effects: undefined,
        choices: [
          {
            text: 'Ты серьёзно?',
            effects: { setFlag: [{ key: 'knowsAboutNight', value: 1 }], xp: 15 },
            next: 'night2'
          },
          { text: 'Ясно.', next: null }
        ]
      },
      {
        id: 'night2',
        text: 'Я тут двадцать лет. Серьёзнее не бывает. Захочешь проверить: возьми фонарь и не иди на голоса.',
        choices: [{ text: 'Запомню.', next: null }]
      },
      {
        id: 'fed',
        text: 'Хлеб. Настоящий. Ты либо дурак, либо человек. Пока склоняюсь ко второму.',
        choices: [{ text: 'Да ладно.', next: null }]
      },
      {
        id: 'thermos',
        text: 'Ты его нашёл. И принёс. Держи полторы сотни, у меня больше нет. И зайди, если станет совсем плохо.',
        choices: [{ text: 'Зайду.', next: null }]
      }
    ]
  },
  {
    id: 'zina',
    name: 'Бабка Зина',
    title: 'знает всё про район',
    district: 'residential',
    key: true,
    personality: 'ворчливая, но справедливая',
    appearance: {
      skin: '#e0b08c',
      hair: '#c9c4bd',
      hairStyle: 'long',
      top: '#7c4a5e',
      bottom: '#3f3546',
      shoes: '#31302f'
    },
    shopId: 'zina',
    services: ['shop'],
    wanders: true,
    activeHours: [8, 21],
    dialogue: [
      {
        id: 'first',
        text: 'Стой. Ты не местный. Ходишь, смотришь. Смотреть можно, брать нельзя.',
        conditions: { notFlag: 'met:zina' },
        onEnter: { setFlag: [{ key: 'met:zina', value: 1 }] },
        choices: [
          { text: 'Я ничего не беру.', effects: { relationship: [{ npcId: 'zina', delta: 5 }] }, next: 'ok' },
          { text: 'А вам какое дело?', effects: { relationship: [{ npcId: 'zina', delta: -10 }] }, next: null }
        ]
      },
      {
        id: 'root',
        text: 'Ну? Принёс чего интересного? Я странное покупаю, обычное не предлагай.',
        choices: [
          { text: 'Покажи, что берёшь.', openShop: 'zina', next: null },
          { text: 'Расскажи про район.', next: 'district' },
          {
            text: 'Что это за ключ?',
            conditions: { hasItem: { id: 'strange_key' } },
            effects: { setFlag: [{ key: 'askedAboutKey', value: 1 }], xp: 30 },
            next: 'key'
          },
          { text: 'Ничего, просто зашёл.', next: null }
        ]
      },
      {
        id: 'ok',
        text: 'Ладно. Будешь себя нормально вести, буду покупать у тебя всякое. Плачу честно, не как Борис.',
        choices: [{ text: 'Договорились.', next: null }]
      },
      {
        id: 'district',
        text: 'Дом три расселили, но свет там по ночам горит. Дом пять — нормальные люди. В контейнер у пятого лучше не лезь ночью.',
        effects: undefined,
        choices: [
          { text: 'Почему?', effects: { setFlag: [{ key: 'zinaWarning', value: 1 }] }, next: 'why' },
          { text: 'Учту.', next: null }
        ]
      },
      {
        id: 'why',
        text: 'Потому что я в четыре утра видела, как оттуда кто-то вылезал. И контейнер был закрыт. Снаружи.',
        choices: [{ text: '...', effects: { stats: { sanity: -3 } }, next: null }]
      },
      {
        id: 'key',
        text: 'Убери. Убери, я сказала. Такие ключи в этом районе не от дверей. Найдёшь замок — не открывай.',
        choices: [{ text: 'А если открою?', next: 'key2' }, { text: 'Хорошо.', next: null }]
      },
      {
        id: 'key2',
        text: 'Тогда не приходи потом с вопросами. Приходи сразу с извинениями.',
        choices: [{ text: 'Понял.', next: null }]
      }
    ]
  },
  {
    id: 'boris',
    name: 'Борис',
    title: 'ломбард',
    district: 'residential',
    key: true,
    personality: 'деловой, без сантиментов',
    appearance: {
      skin: '#cf9a72',
      hair: '#2c2621',
      hairStyle: 'bald',
      top: '#2f3d4f',
      bottom: '#2a2c33',
      shoes: '#1f1f22'
    },
    shopId: 'pawn',
    services: ['shop'],
    activeHours: [9, 21],
    dialogue: [
      {
        id: 'root',
        text: 'Покупаю, продаю, оцениваю. Торговаться можно, но недолго.',
        choices: [
          { text: 'Показывай товар.', openShop: 'pawn', next: null },
          { text: 'Есть работа?', next: 'work' },
          {
            text: 'Возьмёшь это?',
            conditions: { hasItem: { id: 'gold_ring' } },
            effects: { relationship: [{ npcId: 'boris', delta: 5 }] },
            next: 'ring'
          },
          { text: 'Пока.', next: null }
        ]
      },
      {
        id: 'work',
        text: 'Разгрузка бывает. Спина у тебя вроде есть. Спроси на бирже подработок.',
        choices: [{ text: 'Спрошу.', openJobs: true, next: null }]
      },
      {
        id: 'ring',
        text: 'Золото. Настоящее. Не спрашиваю где взял, но цену дам хорошую.',
        choices: [{ text: 'Продать.', openShop: 'pawn', next: null }, { text: 'Подумаю.', next: null }]
      }
    ]
  },
  {
    id: 'artur',
    name: 'Артур',
    title: 'смотрит на людей как на активы',
    district: 'residential',
    key: true,
    personality: 'холодный, вежливый, опасный',
    appearance: {
      skin: '#d3a077',
      hair: '#1e1a17',
      hairStyle: 'short',
      top: '#23293a',
      bottom: '#1b1e28',
      shoes: '#15161a'
    },
    services: ['business'],
    activeHours: [11, 22],
    dialogue: [
      {
        id: 'low',
        text: 'Я разговариваю с теми, у кого есть что терять. Возвращайся, когда появится.',
        conditions: { maxLevel: 4 },
        choices: [{ text: 'Появится.', next: null }]
      },
      {
        id: 'root',
        text: 'Ты уже не совсем никто. Это можно исправить в правильную сторону.',
        conditions: { minLevel: 5 },
        choices: [
          { text: 'Что предлагаешь?', next: 'offer' },
          {
            text: 'Хочу открыть своё дело.',
            conditions: { minMoney: 6000 },
            lockedHint: 'Нужен стартовый капитал',
            showLocked: true,
            effects: { setFlag: [{ key: 'businessUnlocked', value: 1 }] },
            next: 'business'
          },
          { text: 'Ничего.', next: null }
        ]
      },
      {
        id: 'offer',
        text: 'Город любит тех, кто считает. Начни с тележки, закончишь офисом. Или не закончишь, тут как повезёт.',
        choices: [{ text: 'Я подумаю.', effects: { setFlag: [{ key: 'businessUnlocked', value: 1 }], xp: 40 }, next: null }]
      },
      {
        id: 'business',
        text: 'Тогда открывай. Место найдёшь сам, я только скажу: пустой склад — это не бизнес, а мебель.',
        choices: [{ text: 'Понял.', next: null }]
      }
    ]
  },
  {
    id: 'valera',
    name: 'Валера',
    title: 'голубь',
    district: 'residential',
    key: true,
    personality: 'голубь',
    appearance: {
      skin: '#6f7681',
      hair: '#3f4650',
      hairStyle: 'bald',
      top: '#5c636e',
      bottom: '#454b54',
      shoes: '#33373d'
    },
    wanders: true,
    dialogue: [
      {
        id: 'root',
        text: 'Голубь смотрит на тебя. Долго. Не моргая.',
        choices: [
          {
            text: 'Покормить',
            conditions: { hasItem: { id: 'bread_half' } },
            effects: {
              takeItems: [{ id: 'bread_half' }],
              addFlag: [{ key: 'fedValera', value: 1 }],
              xp: 10,
              stats: { sanity: 3 }
            },
            next: 'fed'
          },
          {
            text: 'Покормить зерном',
            conditions: { hasItem: { id: 'bird_seed' } },
            effects: {
              takeItems: [{ id: 'bird_seed' }],
              addFlag: [{ key: 'fedValera', value: 2 }],
              xp: 15,
              stats: { sanity: 5 }
            },
            next: 'fed'
          },
          { text: 'Уйти', next: null }
        ]
      },
      {
        id: 'fed',
        text: 'Он не клюёт сразу. Сначала кивает. Как будто засчитал.',
        choices: [{ text: '...', next: null }]
      }
    ]
  },
  {
    id: 'luda',
    name: 'Люда',
    title: 'продавец в «Свете»',
    district: 'residential',
    personality: 'усталая, но добрая',
    appearance: {
      skin: '#e3b191',
      hair: '#7a4a2c',
      hairStyle: 'long',
      top: '#4c7f6a',
      bottom: '#3b4048',
      shoes: '#2f3033'
    },
    shopId: 'grocery',
    services: ['shop'],
    activeHours: [8, 22],
    dialogue: [
      {
        id: 'root',
        text: 'Заходи. Только руки не трогай витрину, я вчера мыла.',
        choices: [
          { text: 'Что есть поесть?', openShop: 'grocery', next: null },
          {
            text: 'Можно что-нибудь бесплатно?',
            conditions: { maxMoney: 20, maxStat: { stat: 'hunger', value: 25 } },
            effects: {
              giveItems: [{ id: 'bread_half' }],
              relationship: [{ npcId: 'luda', delta: 8 }],
              reputation: [{ track: 'street', delta: 2 }]
            },
            next: 'free'
          },
          { text: 'Просто смотрю.', next: null }
        ]
      },
      {
        id: 'free',
        text: 'Держи. Хлеб всё равно списывать. Только не привыкай, ладно?',
        choices: [{ text: 'Спасибо.', next: null }]
      }
    ]
  }
];

export const NPCS: Record<string, NpcDefinition> = Object.fromEntries(LIST.map((npc) => [npc.id, npc]));
export const NPC_LIST = LIST;

export function getNpc(id: string): NpcDefinition | undefined {
  return NPCS[id];
}
