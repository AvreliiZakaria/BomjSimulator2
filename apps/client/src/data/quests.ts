import type { QuestDefinition } from '../types/quests.js';

const LIST: QuestDefinition[] = [
  {
    id: 'q_first_meal',
    title: 'Найди что-нибудь поесть',
    summary: 'Голод — первая проблема. Контейнеры во дворе, магазин на углу.',
    kind: 'main',
    autoStart: true,
    objectives: [{ id: 'eat', description: 'Съесть что-нибудь', type: 'eat', target: '*', count: 1 }],
    rewards: { xp: 40, toast: { text: 'Уже легче', tone: 'good' } },
    nextQuest: 'q_first_night'
  },
  {
    id: 'q_first_night',
    title: 'Найди, где переночевать',
    summary: 'Ночью холодает. Лавочка, картон, укрытие — что найдёшь.',
    kind: 'main',
    objectives: [{ id: 'sleep', description: 'Переночевать где угодно', type: 'sleep', target: '*', count: 1 }],
    rewards: { xp: 60, money: 0, reputation: [{ track: 'street', delta: 3 }] },
    nextQuest: 'q_first_money'
  },
  {
    id: 'q_first_money',
    title: 'Первые деньги',
    summary: 'Собери вторсырьё и сдай его. Так начинают все.',
    kind: 'main',
    objectives: [
      { id: 'bottles', description: 'Собрать бутылки', type: 'collect', target: 'plastic_bottle', count: 5 },
      { id: 'earn', description: 'Заработать 150 ₽', type: 'money', target: 'earn', count: 150 }
    ],
    rewards: { xp: 120, money: 50, skillXp: [{ skill: 'trade', amount: 40 }] },
    nextQuest: 'q_backpack'
  },
  {
    id: 'q_backpack',
    title: 'Во что складывать',
    summary: 'С пакетом далеко не уедешь. Нужен рюкзак.',
    kind: 'main',
    objectives: [{ id: 'get', description: 'Достать любой рюкзак', type: 'collect', target: 'old_backpack', count: 1 }],
    rewards: { xp: 150, reputation: [{ track: 'street', delta: 5 }] },
    nextQuest: 'q_roof'
  },
  {
    id: 'q_roof',
    title: 'Своя крыша',
    summary: 'Палатка, гараж, подвал — что угодно, лишь бы своё.',
    kind: 'main',
    objectives: [{ id: 'housing', description: 'Обзавестись жильём', type: 'interact', target: '*housing', count: 1 }],
    rewards: { xp: 300, reputation: [{ track: 'city', delta: 8 }] },
    nextQuest: 'q_business_start'
  },
  {
    id: 'q_business_start',
    title: 'Своё дело',
    summary: 'Артур говорил про тележку. С неё начинают все, кто потом покупает город.',
    kind: 'main',
    conditions: { minLevel: 5 },
    objectives: [{ id: 'open', description: 'Открыть первый бизнес', type: 'flag', target: 'hasBusiness', count: 1 }],
    rewards: { xp: 500, reputation: [{ track: 'business', delta: 15 }] }
  },
  {
    id: 'q_thermos',
    title: 'Термос дяди Гриши',
    summary: 'Гриша обронил термос где-то в районе. Он не признается, но скучает по нему.',
    kind: 'side',
    giver: 'grisha',
    conditions: { minRelationship: { npcId: 'grisha', value: 15 } },
    autoStart: true,
    objectives: [
      { id: 'find', description: 'Найти термос', type: 'collect', target: 'grisha_thermos', count: 1 },
      { id: 'return', description: 'Вернуть термос Грише', type: 'custom', count: 1 }
    ],
    rewards: { xp: 200, reputation: [{ track: 'street', delta: 8 }], giveItems: [{ id: 'canned_food', count: 2 }] }
  },
  {
    id: 'q_clean_look',
    title: 'Выглядеть как человек',
    summary: 'Чтобы взяли на нормальную работу, надо перестать пугать прохожих.',
    kind: 'side',
    conditions: { minLevel: 3 },
    autoStart: true,
    objectives: [{ id: 'hygiene', description: 'Поднять гигиену выше 60', type: 'custom', count: 1 }],
    rewards: { xp: 120, reputation: [{ track: 'city', delta: 5 }] }
  },
  {
    id: 'q_night_watch',
    title: 'После трёх',
    summary: 'Гриша сказал, что город после трёх другой. Надо посмотреть самому.',
    kind: 'side',
    conditions: { flag: 'knowsAboutNight' },
    autoStart: true,
    objectives: [{ id: 'nights', description: 'Пережить 3 ночи после 03:00', type: 'flag', target: 'nightsOutside', count: 3 }],
    rewards: { xp: 250, giveItems: [{ id: 'flashlight' }], stats: { sanity: -5 } }
  },
  // ─────────────── СКРЫТЫЕ ЦЕПОЧКИ ───────────────
  // Игрок не видит счётчик и не знает, что что-то началось.
  {
    id: 'q_hidden_valera',
    title: 'Валера',
    summary: 'Ты просто кормил голубя.',
    kind: 'hidden',
    hidden: true,
    autoStart: true,
    conditions: { flagAtLeast: { key: 'fedValera', value: 1 } },
    objectives: [{ id: 'feed', description: 'Кормить голубя', type: 'flag', target: 'fedValera', count: 7, hidden: true }],
    rewards: {
      xp: 400,
      setFlag: [{ key: 'valeraFriend', value: 1 }],
      giveItems: [{ id: 'black_feather' }],
      addCollection: 'black_feather',
      unlockAchievement: 'pigeon_friend',
      toast: { text: 'Валера сел тебе на плечо. Город на секунду затих.', tone: 'weird' }
    }
  },
  {
    id: 'q_hidden_key',
    title: 'Странный ключ',
    summary: 'Ключ был холодный. Ты всё равно попробовал.',
    kind: 'hidden',
    hidden: true,
    autoStart: true,
    conditions: { hasItem: { id: 'strange_key' } },
    objectives: [{ id: 'use', description: 'Найти, что открывает ключ', type: 'flag', target: 'usedStrangeKey', count: 1, hidden: true }],
    rewards: {
      xp: 600,
      money: 3000,
      unlockAchievement: 'key_holder',
      addCollection: 'strange_key',
      stats: { sanity: -12 },
      toast: { text: 'За дверью был твой первый двор. Только пустой.', tone: 'weird' }
    }
  },
  {
    id: 'q_hidden_bus',
    title: 'Маршрут 03:47',
    summary: 'Автобус, которого нет в расписании.',
    kind: 'hidden',
    hidden: true,
    autoStart: true,
    conditions: { hasItem: { id: 'ticket_0347' } },
    objectives: [{ id: 'ride', description: 'Сесть в автобус', type: 'flag', target: 'rodeBus0347', count: 1, hidden: true }],
    rewards: {
      xp: 800,
      unlockAchievement: 'bus_0347',
      addCollection: 'ticket_0347',
      giveItems: [{ id: 'wet_photo' }],
      stats: { sanity: -20 },
      toast: { text: 'Ты вышел на своей остановке. Через два часа. Проехав четыре минуты.', tone: 'weird' }
    }
  }
];

export const QUESTS: Record<string, QuestDefinition> = Object.fromEntries(LIST.map((quest) => [quest.id, quest]));
export const QUEST_LIST = LIST;
