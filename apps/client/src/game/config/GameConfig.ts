/**
 * Единственный источник правды по балансу. Ни одно число из этого файла
 * не должно дублироваться внутри систем — только читаться отсюда.
 */
export const GameConfig = {
  version: '1.0.0',
  title: 'НУЛЬ',
  slogan: 'ВЫЖИВИ. ЗАРАБОТАЙ. ПОДНИМИСЬ.',

  time: {
    /** Игровых минут за одну реальную секунду. 1.5 => игровые сутки ≈ 16 реальных минут. */
    minutesPerRealSecond: 1.5,
    startDay: 1,
    startMinutes: 8 * 60,
    periods: {
      MORNING: [6 * 60, 10 * 60],
      DAY: [10 * 60, 18 * 60],
      EVENING: [18 * 60, 22 * 60],
      NIGHT: [22 * 60, 27 * 60],
      LATE_NIGHT: [3 * 60, 6 * 60]
    } as const,
    /** Часы, после которых город становится странным. */
    weirdHour: 3
  },

  survival: {
    start: { health: 100, hunger: 65, warmth: 75, hygiene: 55, sanity: 100, energy: 85 },
    /** Изменение показателя за игровой час при обычных условиях. */
    ratesPerHour: {
      hunger: -3.4,
      hygiene: -1.2,
      energy: -3.6,
      warmth: -1.0,
      sanity: -0.3,
      health: 0
    },
    /** Дополнительно ночью (22:00–06:00). */
    nightWarmthPerHour: -2.4,
    lateNightSanityPerHour: -1.8,
    /** Штрафы при нуле показателя. */
    starvingHealthPerHour: -4.5,
    freezingHealthPerHour: -5.5,
    exhaustedSanityPerHour: -2.5,
    filthySanityPerHour: -1.2,
    /** Восстановление здоровья, когда всё в порядке. */
    regenHealthPerHour: 1.4,
    regenRequires: { hunger: 45, warmth: 40, energy: 30 },
    lowWarning: 20,
    criticalWarning: 8,
    /** Каждая надетая вещь даёт warmth passive; это множитель к её эффекту за час. */
    clothingWarmthPerHour: 0.55,
    statusMinutes: { poison: 180, cold: 480, hypothermia: 240, fatigue: 300, stress: 240 },
    statusRatesPerHour: {
      poison: { health: -3.5, hunger: -2.5, hygiene: -2 },
      cold: { health: -1.2, energy: -1.5 },
      hypothermia: { health: -4, warmth: -3 },
      fatigue: { energy: -2, sanity: -1 },
      stress: { sanity: -2.2 }
    }
  },

  player: {
    speed: 158,
    /** Множитель скорости при полном рюкзаке. */
    overweightSpeedMul: 0.62,
    tiredSpeedMul: 0.78,
    hitboxWidth: 22,
    hitboxHeight: 16,
    /** Смещение хитбокса от центра спрайта вниз (ноги). */
    hitboxOffsetY: 20,
    interactRadius: 74,
    searchSeconds: 1.4
  },

  camera: {
    lerp: 0.12,
    deadzoneDesktop: { w: 120, h: 90 },
    deadzoneMobile: { w: 60, h: 50 },
    zoomDesktop: 1.15,
    zoomMobile: 1.0,
    /** Ширина игрового поля в мировых единицах, к которой подгоняем зум. */
    targetViewWidthDesktop: 1180,
    targetViewWidthMobile: 820
  },

  inventory: {
    /** Базовая грузоподъёмность в кг без рюкзака. */
    baseCapacity: 7,
    overweightPenaltyAt: 1.0
  },

  economy: {
    startCash: 17,
    /** Комиссия ломбарда/скупщиков уже зашита в множители магазинов. */
    bankUnlockLevel: 4,
    bankUnlockFee: 300,
    /** Доля наличных, теряемая при потере сознания. */
    blackoutCashLoss: 0.35,
    /** Штраф за просроченную аренду жилья. */
    rentGraceDays: 1,
    depositMin: 10
  },

  progression: {
    xpBase: 90,
    xpGrowth: 1.32,
    maxLevel: 60,
    skillXpPerLevel: 100,
    maxSkill: 10,
    skillBonus: {
      /** Прибавка к качеству лута за уровень «Выживания». */
      survivalLoot: 0.04,
      /** Прибавка к цене продажи за уровень «Торговли». */
      tradePrice: 0.025,
      /** Прибавка к оплате работы за уровень «Работы». */
      workPay: 0.03,
      /** Шанс редкой находки за уровень «Удачи». */
      luckRare: 0.02,
      /** Прибавка к отношению NPC за уровень «Харизмы». */
      charismaRelation: 0.15
    }
  },

  interaction: {
    /** Радиус, в котором показывается подсказка. */
    promptRadius: 96,
    /** Игровых минут на обыск мусорки. */
    searchMinutes: 12,
    searchHygieneCost: -3.5,
    searchEnergyCost: -1.5,
    benchRestMinutes: 60,
    benchRestEnergy: 12
  },

  loot: {
    /** Мусорки восстанавливаются на следующий игровой день. */
    resetEachDay: true,
    lateNightAnomalyBonus: 0.12
  },

  traffic: {
    maxCars: { low: 4, medium: 8, high: 14 },
    speed: { min: 70, max: 130 },
    /** Множители плотности по периодам суток. */
    densityByPeriod: {
      MORNING: 0.9,
      DAY: 1,
      EVENING: 0.85,
      NIGHT: 0.4,
      LATE_NIGHT: 0.12
    },
    spawnIntervalMs: 1400,
    despawnMargin: 420
  },

  crowd: {
    maxNpc: { low: 5, medium: 9, high: 14 },
    densityByPeriod: {
      MORNING: 0.8,
      DAY: 1,
      EVENING: 0.7,
      NIGHT: 0.3,
      LATE_NIGHT: 0.08
    },
    walkSpeed: 52
  },

  events: {
    /** Базовый шанс события за игровой час. */
    chancePerHour: 0.28,
    lateNightWeirdChance: 0.45,
    minMinutesBetween: 45
  },

  sleep: {
    /** Качество сна по типам мест: множитель восстановления. */
    quality: {
      ground: 0.35,
      cardboard: 0.5,
      bench: 0.45,
      shelter: 0.7,
      tent: 0.75,
      garage: 0.85,
      basement: 0.9,
      room: 1,
      flat: 1.15,
      goodFlat: 1.25,
      house: 1.35,
      penthouse: 1.5
    },
    /** Риск неприятностей во сне по типам мест, 0..1. */
    risk: {
      ground: 0.4,
      cardboard: 0.3,
      bench: 0.35,
      shelter: 0.12,
      tent: 0.1,
      garage: 0.05,
      basement: 0.03,
      room: 0,
      flat: 0,
      goodFlat: 0,
      house: 0,
      penthouse: 0
    },
    defaultHours: 8,
    energyPerHour: 12,
    sanityPerHour: 4,
    hungerPerHour: -2.2,
    warmthPerHourIndoor: 6,
    warmthPerHourOutdoor: -1.5,
    healthPerHour: 1.6
  },

  business: {
    /** Доля выручки, съедаемая расходами. */
    baseExpenseRatio: 0.35,
    employeeCostPerDay: 450,
    employeeRevenueBonus: 0.28,
    stockUnitCost: 40,
    stockUnitRevenue: 95,
    maxPendingDays: 5
  },

  casino: {
    /** Все вероятности собраны здесь. Только внутриигровые деньги. */
    minBet: 10,
    maxBet: 5000,
    slots: {
      /** Веса символов и выплаты за три в ряд. */
      symbols: ['bottle', 'can', 'coin', 'pigeon', 'key', 'seven'],
      weights: [30, 26, 20, 12, 8, 4],
      payouts: { bottle: 3, can: 4, coin: 6, pigeon: 10, key: 18, seven: 45 },
      twoOfAKind: 0.5
    },
    wheel: {
      segments: [0, 0.5, 1.5, 0, 2, 0.5, 5, 0],
      weights: [22, 18, 14, 20, 8, 12, 2, 24]
    },
    cards: {
      /** Угадать «выше/ниже»: честная колода, дом берёт комиссию. */
      houseEdge: 0.06
    },
    races: {
      runners: 5,
      /** Максимальный коэффициент. */
      maxOdds: 7
    }
  },

  save: {
    autosaveOn: ['sleep', 'purchase', 'quest', 'district', 'menu'] as const,
    /** Не чаще одного раза в N мс. */
    minIntervalMs: 4000
  },

  ui: {
    toastMs: 2600,
    mobileBreakpoint: 900,
    joystickRadius: 62
  },

  server: {
    enabled: true,
    url: 'http://localhost:8787',
    /** Как часто отправлять результат в рейтинг, игровых дней. */
    submitEveryDays: 1
  }
} as const;

export type GameConfigType = typeof GameConfig;
