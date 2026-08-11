import type { AchievementDefinition, CollectionDefinition } from '../types/events.js';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first_earn', name: 'Первый заработок', description: 'Заработать первые деньги честным (ну почти) трудом.', check: 'firstEarn' },
  { id: 'money_10k', name: 'Десятка', description: 'Накопить 10 000 ₽.', check: 'money10k', value: 10000 },
  { id: 'money_100k', name: 'Сотка', description: 'Накопить 100 000 ₽.', check: 'money100k', value: 100000 },
  { id: 'money_1m', name: 'Миллион', description: 'Накопить 1 000 000 ₽.', check: 'money1m', value: 1000000 },
  { id: 'first_room', name: 'Своя дверь', description: 'Заселиться в первую комнату.', check: 'firstRoom' },
  { id: 'first_business', name: 'Своё дело', description: 'Открыть первый бизнес.', check: 'firstBusiness' },
  { id: 'nights_10', name: 'Ночной житель', description: 'Пережить 10 ночей после 03:00.', check: 'nights10', value: 10 },
  { id: 'level_10', name: 'Опытный', description: 'Достичь 10-го уровня.', check: 'level10', value: 10 },
  { id: 'collector', name: 'Собиратель', description: 'Собрать 10 предметов коллекции.', check: 'collection', value: 10 },
  { id: 'pigeon_friend', name: 'Друг Валеры', description: 'Секрет. Ты поймёшь, когда случится.', check: 'flag', flag: 'valeraFriend', hidden: true },
  { id: 'key_holder', name: 'Тот самый ключ', description: 'Секрет.', check: 'flag', flag: 'usedStrangeKey', hidden: true },
  { id: 'bus_0347', name: 'Маршрут, которого нет', description: 'Секрет.', check: 'flag', flag: 'rodeBus0347', hidden: true }
];

export const COLLECTIONS: CollectionDefinition[] = [
  { id: 'badge_star', name: 'Значок «Звезда»', category: 'badges', description: 'Начало любой коллекции.' },
  { id: 'tape_city', name: 'Кассета «Город спит»', category: 'tapes', description: 'Сторона А заиграна до дыр.' },
  { id: 'photo_yard', name: 'Фото старого двора', category: 'photos', description: 'Двор тот же, дома другие.' },
  { id: 'wet_photo', name: 'Мокрая фотография', category: 'weird', description: 'На ней ты. Хотя снимок старый.' },
  { id: 'black_feather', name: 'Чёрное перо', category: 'weird', description: 'Слишком большое для голубя.' },
  { id: 'strange_key', name: 'Странный ключ', category: 'weird', description: 'Всегда холодный.' },
  { id: 'ticket_0347', name: 'Билет 03:47', category: 'weird', description: 'Такого маршрута нет.' },
  { id: 'coin_collection', name: 'Старые монеты', category: 'finds', description: 'Кто-то собирал их всю жизнь.' },
  { id: 'old_camera', name: 'Плёночный фотоаппарат', category: 'finds', description: 'Внутри чужие воспоминания.' },
  { id: 'gold_ring', name: 'Золотое кольцо', category: 'finds', description: 'Чья-то история закончилась в мусорке.' }
];
