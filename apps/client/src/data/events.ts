import type { RandomEventDefinition } from '../types/events.js';

const LIST: RandomEventDefinition[] = [
  {
    id: 'wallet',
    title: 'Кошелёк',
    text: 'На тротуаре лежит кошелёк. Внутри деньги и чей-то пропуск с фотографией.',
    weight: 12,
    cooldownDays: 3,
    choices: [
      {
        text: 'Забрать деньги',
        effects: { money: 450, reputation: [{ track: 'law', delta: -4 }], stats: { sanity: -4 } },
        result: 'Ты берёшь деньги и уходишь быстрым шагом. Никто не видел. Кроме тебя.'
      },
      {
        text: 'Отнести по адресу на пропуске',
        effects: {
          xp: 80,
          money: 200,
          reputation: [{ track: 'city', delta: 8 }, { track: 'law', delta: 5 }],
          stats: { sanity: 6 }
        },
        result: 'Хозяин долго смотрит на тебя, потом суёт двести рублей. «Люди, оказывается, бывают».'
      },
      { text: 'Пройти мимо', effects: { xp: 5 }, result: 'Не твоё — не твоя проблема.' }
    ]
  },
  {
    id: 'help_request',
    title: 'Просьба помочь',
    text: 'Женщина с двумя сумками не может поднять их на четвёртый этаж.',
    weight: 14,
    cooldownDays: 2,
    conditions: { minStat: { stat: 'energy', value: 20 } },
    choices: [
      {
        text: 'Помочь',
        effects: {
          money: 150,
          xp: 40,
          stats: { energy: -8 },
          reputation: [{ track: 'city', delta: 5 }],
          skillXp: [{ skill: 'charisma', amount: 20 }]
        },
        result: 'Сто пятьдесят рублей и «спасибо, сынок». Второе почему-то дороже.'
      },
      { text: 'Отказаться', effects: { reputation: [{ track: 'city', delta: -2 }] }, result: 'Она молча берёт сумки сама.' }
    ]
  },
  {
    id: 'fridge',
    title: 'Подозрительный холодильник',
    text: 'У контейнеров стоит холодильник. Дверца прикрыта, но не закрыта. Внутри что-то есть.',
    weight: 10,
    cooldownDays: 4,
    choices: [
      {
        text: 'Открыть',
        riskChance: 0.35,
        effects: { giveItems: [{ id: 'canned_food', count: 2 }, { id: 'water_bottle' }], xp: 30 },
        result: 'Консервы и вода. Кто-то выкинул целый запас.',
        riskEffects: { stats: { sanity: -10, hygiene: -12 }, status: ['stress'] },
        riskResult: 'Запах бьёт в лицо. Ты закрываешь дверцу и долго стоишь, глядя в стену.'
      },
      { text: 'Не трогать', result: 'Некоторые двери лучше не открывать. Даже холодильные.' }
    ]
  },
  {
    id: 'lost_item',
    title: 'Потерянный предмет',
    text: 'Под лавочкой блестит что-то металлическое.',
    weight: 13,
    cooldownDays: 2,
    choices: [
      {
        text: 'Достать',
        riskChance: 0.2,
        effects: { giveItems: [{ id: 'silver_chain' }], xp: 25 },
        result: 'Серебряная цепочка. Тонкая, но настоящая.',
        riskEffects: { stats: { hygiene: -6, health: -3 } },
        riskResult: 'Пустая обёртка от жвачки и порез о жестянку. Отлично.'
      },
      { text: 'Пройти мимо', result: 'Не сегодня.' }
    ]
  },
  {
    id: 'drunk_offer',
    title: 'Щедрый прохожий',
    text: 'Мужик у ларька настойчиво предлагает тебе сто рублей «за просто так».',
    weight: 9,
    cooldownDays: 3,
    choices: [
      {
        text: 'Взять',
        effects: { money: 100, stats: { sanity: -2 } },
        result: 'Он хлопает тебя по плечу и уходит петь. Деньги настоящие.'
      },
      {
        text: 'Отказаться',
        effects: { reputation: [{ track: 'street', delta: 3 }], stats: { sanity: 4 } },
        result: '«Гордый. Уважаю». И уходит петь всё равно.'
      }
    ]
  },
  {
    id: 'police_check',
    title: 'Проверка документов',
    text: 'Патруль. «Документы есть?»',
    weight: 8,
    cooldownDays: 3,
    conditions: { maxStat: { stat: 'hygiene', value: 45 } },
    choices: [
      {
        text: 'Объяснить спокойно',
        riskChance: 0.3,
        effects: { reputation: [{ track: 'law', delta: 3 }], xp: 20 },
        result: 'Тебя отпускают. Даже говорят, где столовая с дешёвыми обедами.',
        riskEffects: { money: -200, stats: { sanity: -8 }, advanceMinutes: 90 },
        riskResult: 'Полтора часа в отделении и минус двести рублей «за беспокойство».'
      },
      {
        text: 'Уйти дворами',
        riskChance: 0.45,
        effects: { stats: { energy: -10 }, reputation: [{ track: 'street', delta: 3 }, { track: 'law', delta: -3 }] },
        result: 'Ты знаешь эти дворы лучше. Оторвался.',
        riskEffects: { money: -350, stats: { energy: -18, sanity: -6 }, advanceMinutes: 120 },
        riskResult: 'Не оторвался. Два часа и триста пятьдесят рублей.'
      }
    ]
  },
  {
    id: 'street_musician',
    title: 'Уличный музыкант',
    text: 'Парень с гитарой играет так себе, но народ слушает. Он кивает: «Подпоёшь?»',
    weight: 8,
    cooldownDays: 3,
    conditions: { minStat: { stat: 'sanity', value: 40 } },
    choices: [
      {
        text: 'Подпеть',
        riskChance: 0.3,
        effects: { money: 180, xp: 30, stats: { sanity: 8 }, skillXp: [{ skill: 'charisma', amount: 30 }] },
        result: 'Вы собрали больше, чем он один. Он честно делит пополам.',
        riskEffects: { stats: { sanity: -5 } },
        riskResult: 'Люди расходятся быстрее, чем приходили. Он молча забирает гитару.'
      },
      { text: 'Просто послушать', effects: { stats: { sanity: 4 } }, result: 'Три минуты, когда ничего не надо решать.' }
    ]
  },
  {
    id: 'free_soup',
    title: 'Полевая кухня',
    text: 'Волонтёры раздают горячий суп из фургона.',
    weight: 11,
    cooldownDays: 2,
    conditions: { maxStat: { stat: 'hunger', value: 55 } },
    choices: [
      {
        text: 'Взять порцию',
        effects: { stats: { hunger: 35, warmth: 12, sanity: 5 }, xp: 15 },
        result: 'Горячо. Ты забыл, что еда бывает горячей.'
      },
      {
        text: 'Помочь раздавать',
        conditions: { minStat: { stat: 'energy', value: 25 } },
        effects: {
          stats: { hunger: 30, warmth: 10, energy: -10, sanity: 10 },
          reputation: [{ track: 'city', delta: 6 }],
          xp: 50
        },
        result: 'Два часа за раздачей. Тебя накормили последним и дали добавку.'
      }
    ]
  },
  // ─────────────── ПОСЛЕ 03:00 ───────────────
  {
    id: 'weird_bus',
    title: 'Странный автобус',
    text: 'На остановке стоит автобус без номера. Двери открыты. Внутри горит свет, но нет ни водителя, ни пассажиров.',
    weight: 10,
    weird: true,
    cooldownDays: 5,
    choices: [
      {
        text: 'Зайти',
        riskChance: 0.5,
        effects: {
          giveItems: [{ id: 'ticket_0347' }],
          stats: { sanity: -10 },
          xp: 60,
          setFlag: [{ key: 'rodeBus0347', value: 1 }]
        },
        result: 'Двери закрываются. Через четыре минуты ты выходишь на своей остановке. Часы показывают на два часа позже.',
        riskEffects: { stats: { sanity: -18, warmth: -10 }, status: ['stress'] },
        riskResult: 'Ты заходишь. Салон пустой и очень длинный. Ты выходишь через ту же дверь и стоишь один на остановке. Автобуса нет.'
      },
      { text: 'Не подходить', effects: { stats: { sanity: -3 } }, result: 'Двери закрываются сами. Автобус уезжает без единого звука.' }
    ]
  },
  {
    id: 'wrong_sign',
    title: 'Вывеска',
    text: 'Магазин «Свет» работает. На вывеске написано «СВЕТ» — но буквы стоят в другом порядке, чем днём.',
    weight: 9,
    weird: true,
    cooldownDays: 4,
    choices: [
      {
        text: 'Зайти внутрь',
        riskChance: 0.4,
        effects: { giveItems: [{ id: 'canned_food', count: 2 }], money: -60, stats: { sanity: -8 } },
        result: 'Продавщица похожа на Люду. Почти. Она молча пробивает консервы и не берёт сдачу.',
        riskEffects: { stats: { sanity: -14 }, status: ['stress'] },
        riskResult: 'Дверь заперта. Внутри горит свет и стоит человек спиной. Он не двигается.'
      },
      { text: 'Уйти', effects: { stats: { sanity: -2 } }, result: 'Ты оборачиваешься через двадцать шагов. Вывеска выключена.' }
    ]
  },
  {
    id: 'silhouette',
    title: 'Силуэт',
    text: 'В конце двора стоит человек. Ты смотришь на него минуту. Он не шевелится и, кажется, тоже смотрит.',
    weight: 11,
    weird: true,
    cooldownDays: 3,
    choices: [
      {
        text: 'Подойти',
        riskChance: 0.55,
        effects: { giveItems: [{ id: 'strange_key' }], stats: { sanity: -12 }, xp: 70 },
        result: 'Никого. На асфальте лежит ключ. Холодный, будто пролежал тут всю зиму.',
        riskEffects: { stats: { sanity: -20, energy: -15 }, status: ['stress'] },
        riskResult: 'Ты подходишь, и он оказывается вешалкой с курткой. Когда ты отходишь, куртка поворачивается.'
      },
      { text: 'Уйти в другую сторону', effects: { stats: { sanity: -4, energy: -5 } }, result: 'Ты идёшь длинной дорогой. Так спокойнее.' }
    ]
  },
  {
    id: 'message',
    title: 'Сообщение',
    text: 'На стене подъезда свежей краской написано твоё имя и время: 03:47.',
    weight: 8,
    weird: true,
    cooldownDays: 6,
    conditions: { minDay: 3 },
    choices: [
      {
        text: 'Стереть',
        effects: { stats: { sanity: -6, hygiene: -5 }, xp: 20 },
        result: 'Краска свежая, стирается плохо. Через день надпись будет снова. Ты это почему-то знаешь.'
      },
      {
        text: 'Сфотографировать в памяти и уйти',
        effects: { stats: { sanity: -10 }, setFlag: [{ key: 'sawMessage', value: 1 }], xp: 40 },
        result: 'Ты запоминаешь. Это, кажется, и требовалось.'
      }
    ]
  },
  {
    id: 'empty_city',
    title: 'Пустой город',
    text: 'Ни одной машины. Ни одного окна. Ты идёшь по центральной дороге посередине, и это нормально.',
    weight: 12,
    weird: true,
    cooldownDays: 2,
    choices: [
      {
        text: 'Идти дальше',
        effects: { stats: { sanity: -5, energy: -5 }, xp: 25, addFlag: [{ key: 'walkedEmptyCity', value: 1 }] },
        result: 'Ты доходишь до конца улицы. Позади зажигаются окна. По одному.'
      },
      {
        text: 'Сесть и подождать рассвет',
        effects: { advanceMinutes: 120, stats: { warmth: -12, sanity: 8 } },
        result: 'Ты сидишь на бордюре два часа. В шесть утра проезжает первая маршрутка, и город снова становится обычным.'
      }
    ]
  },
  {
    id: 'pigeon_council',
    title: 'Совет голубей',
    text: 'Одиннадцать голубей сидят полукругом. В центре — один, крупнее остальных. Все молчат.',
    weight: 7,
    weird: true,
    cooldownDays: 5,
    conditions: { flagAtLeast: { key: 'fedValera', value: 2 } },
    choices: [
      {
        text: 'Поклониться',
        effects: { addFlag: [{ key: 'fedValera', value: 1 }], xp: 50, stats: { sanity: 5 } },
        result: 'Крупный голубь кивает. Остальные разлетаются. Ты чувствуешь себя странно принятым.'
      },
      { text: 'Уйти', effects: { stats: { sanity: -4 } }, result: 'Ты слышишь за спиной хлопанье крыльев. Оно не удаляется.' }
    ]
  }
];

export const EVENT_LIST = LIST;
export const EVENTS: Record<string, RandomEventDefinition> = Object.fromEntries(
  LIST.map((event) => [event.id, event])
);
