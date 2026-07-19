export const runnerVersion = "v0.5.0-w2-draft.1";
export const scenarioVersion = "v0.5.0-w1";
export const contentVersion = "v0.5.0-w1-draft.2";

export const QUESTIONS = Object.freeze([
  "Что такое КОНТУР-7 и чем он был до Срыва?",
  "Сколько людей живёт в КОНТУРЕ-7 и что означает число часов воды?",
  "Почему люди не могут просто постоянно жить на поверхности?",
  "Что находится внутри кассеты и почему она важна?",
  "Кто такая Аша и какова была цель экспедиции?",
  "Для чего предназначены KROT и IGLA?",
  "Какова долгосрочная цель КОНТУРА-7 после этого кризиса?",
  "Каков был физический риск выбранного маршрута и что означал результат кубиков?",
  "Что именно произошло с выбранной машиной после броска?",
  "Если машина осталась в шахте: исправна ли она, может ли двигаться, где находится, работают ли телеметрия и маяк? Гарантирован ли её возврат?",
  "Какой выбор был самым трудным и почему?",
  "Хотелось бы увидеть следующий день именно этого мира?",
  "Это ощущалось историей или меню ресурсов?",
]);

export const DEBRIEF = "«Пара двух шестигранных кубиков в этой сессии была назначена до начала прохождения. Так три небольшие тестовые сессии покрывают осложнение, успех с ценой и преимущество. Это способ проверки сценария, а не правило будущей игры».";

export const INTRO = Object.freeze({
  id: "NRV05-INTRO",
  paragraphs: Object.freeze([
    "Семнадцать лет назад Срыв разделил промышленную сеть КОНТУР на изолированные узлы. Климатические установки перестали работать согласованно; над поверхностью движутся кислотные фронты и токсичные аэрозоли. Между фронтами туда можно выходить, но без устойчивой воды и защищённой инфраструктуры постоянно жить почти невозможно.",
    "КОНТУР-7 раньше регулировал давление и очищал воду. Теперь это подземное поселение 43 человек. «Воды на 18 часов» означает прогноз: столько очиститель сможет обеспечивать всех жителей при текущем расходе. Сменная кассета содержит фильтрующие мембраны, а не готовую воду; она может продлить работу очистителя.",
    "Кассета находится за затопляемым затвором вместе с Ашей, инженером насосной. На мостике ждут две незаменимые автономные машины экспедиции: тяжёлый KROT для силовых работ и лёгкая IGLA с тросовым манипулятором. Через четыре часа рассол поднимется выше площадки. Задача — вернуть Ашу и по возможности кассету, не потеряв экспедицию.",
    "Долгосрочная цель: «Сделать КОНТУР-7 устойчивым и восстановить связь с другими уцелевшими узлами».",
  ]),
});

export const RISK_CASES = Object.freeze({
  LOW: Object.freeze({ id: "LOW", dice: Object.freeze([2, 3]), label: "2 + 3", sum: 5, band: "осложнение" }),
  MID: Object.freeze({ id: "MID", dice: Object.freeze([3, 4]), label: "3 + 4", sum: 7, band: "успех с ценой" }),
  HIGH: Object.freeze({ id: "HIGH", dice: Object.freeze([5, 5]), label: "5 + 5", sum: 10, band: "преимущество" }),
});

export const KROT = Object.freeze({
  condition: Object.freeze({ OPERATIONAL: "OPERATIONAL", DAMAGED: "DAMAGED", DESTROYED: "DESTROYED" }),
  mobility: Object.freeze({ MOBILE: "MOBILE", IMMOBILIZED: "IMMOBILIZED" }),
  location: Object.freeze({ BASE: "BASE", UPPER_BRIDGE: "UPPER_BRIDGE", PRESSURE_SHAFT: "PRESSURE_SHAFT" }),
  telemetryStatus: Object.freeze({ ONLINE: "ONLINE", OFFLINE: "OFFLINE" }),
  beaconStatus: Object.freeze({ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" }),
});

const krotState = (condition, mobility, location, telemetryStatus = KROT.telemetryStatus.ONLINE, beaconStatus = KROT.beaconStatus.ACTIVE) =>
  Object.freeze({ condition, mobility, location, telemetryStatus, beaconStatus });

const KROT_STATES = Object.freeze({
  upper: krotState(KROT.condition.OPERATIONAL, KROT.mobility.MOBILE, KROT.location.UPPER_BRIDGE),
  shaftDamaged: krotState(KROT.condition.DAMAGED, KROT.mobility.MOBILE, KROT.location.PRESSURE_SHAFT),
  shaftImmobilized: krotState(KROT.condition.OPERATIONAL, KROT.mobility.IMMOBILIZED, KROT.location.PRESSURE_SHAFT),
  shaftOperational: krotState(KROT.condition.OPERATIONAL, KROT.mobility.MOBILE, KROT.location.PRESSURE_SHAFT),
  baseDamaged: krotState(KROT.condition.DAMAGED, KROT.mobility.MOBILE, KROT.location.BASE),
  baseOperational: krotState(KROT.condition.OPERATIONAL, KROT.mobility.MOBILE, KROT.location.BASE),
});

export function recoveryPossible(state) {
  return state.condition !== KROT.condition.DESTROYED
    && state.mobility === KROT.mobility.IMMOBILIZED
    && state.location === KROT.location.PRESSURE_SHAFT
    && state.telemetryStatus === KROT.telemetryStatus.ONLINE
    && state.beaconStatus === KROT.beaconStatus.ACTIVE;
}

const choice = (id, label, consequence) => Object.freeze({ id, label, consequence });
const terminal = (family, krot, igla, asha, cassette, waterMinutes) =>
  Object.freeze({ family, krot, igla, asha, cassette, waterMinutes });
const packet = ({ id, scene, map, water, body, choices = [], krot, terminalState = null, beats = [], statuses = null, causes = null }) => Object.freeze({
  id,
  presentationId: id.replace("-P", "-PR"),
  scene,
  map,
  water,
  body: Object.freeze(body),
  choices: Object.freeze(choices),
  krot,
  terminal: terminalState,
  beats: Object.freeze(beats.map((beat) => Object.freeze(beat))),
  statuses: statuses ? Object.freeze(statuses) : null,
  causes: causes ? Object.freeze(causes) : null,
});

const maps = Object.freeze({
  call: `[КОНТУР-7: 43 человека, вода 18 ч] — мостик: KROT, IGLA, группа — [затвор]
                                                                  /        \\
                                                            [Аша]      [кассета]
                                                 рассол поднимется через 4 ч`,
  approach: `[КОНТУР-7: вода 18 ч] — KROT + IGLA — [затвор] — [Аша / кассета]
                                           |                 |
                               коррозия направляющей     рассол: 4 ч`,
  approachVerified: `[КОНТУР-7: вода 18 ч] — KROT + IGLA — [затвор] — [Аша / кассета: герметична]
                                           |                         |
                               коррозия направляющей             рассол: 4 ч`,
  anchorLow: `[мостик] — KROT: привод повреждён, проход удержан — [затвор]
                                                       /        \\
                                            [ниша Аши: заливает] [кассета]
                                                вода 16 ч; рассол 2 ч`,
  anchorMid: `[мостик] — [затвор: рама зажала опоры KROT] — [Аша, треснувшая кассета]
             KROT исправен; хода нет; связь и маяк работают
                                      вода 16 ч; рассол 2 ч`,
  anchorHigh: `[мостик] — KROT: исправен, держит затвор — [Аша + кассета]
                                                   \\
                                              [сухой обход]
                                         вода 16 ч; рассол 2 ч`,
  tetherLow: `[мостик: KROT] — [трос] — IGLA висит над рассолом
                                 |          \\
                              [Аша]      [кассета]
                         вода 16 ч; рассол 2 ч`,
  tetherMid: `[мостик: KROT] — [трос] — [площадка: Аша, кассета, IGLA]
                                           IGLA: манипулятор повреждён
                                      вода 16 ч; рассол 2 ч`,
  tetherHigh: `[мостик: KROT] — [трос] — [Аша + кассета] — [сухая лестница]
                              |
                    IGLA: малый заряд; карта клапанов
                         вода 16 ч; рассол 2 ч`,
  p10: `[КОНТУР-7: вода 15 ч] — Аша, IGLA — KROT: повреждён, мобилен, на базе
                              |
                       [кассета потеряна]`,
  p11: `[КОНТУР-7: вода 15 ч] — Аша, KROT — IGLA: манипулятор повреждён на базе
                              |
                       [кассета потеряна]`,
  p12: `[КОНТУР-7: вода 87 ч 30 мин, кассета] — KROT: повреждён на базе
                                                |
                                      [ниша Аши: затапливается]`,
  p13: `[КОНТУР-7: вода 87 ч 20 мин, кассета] — KROT: исправен на базе
                                                |
                                   [клапан: Аша герметизирует]`,
  p14: `[КОНТУР-7: вода 51 ч, Аша, треснувшая кассета, IGLA]
                              |
       [шахта: KROT исправен, обездвижен рамой; связь и маяк работают]`,
  p15: `[КОНТУР-7: вода 51 ч, Аша, треснувшая кассета, KROT]
                              |
                       [рассол: IGLA потеряна]`,
  p16: `[КОНТУР-7: вода 51 ч, Аша, треснувшая кассета, KROT]
                              |
                    [площадка: IGLA оставлена]`,
  p17: `[КОНТУР-7: вода 51 ч, Аша, треснувшая кассета, KROT]
                              |
                     [Рем: IGLA с картой, без заряда]`,
  p18: `[КОНТУР-7: вода 87 ч 30 мин, Аша, кассета, IGLA]
                              |
                    [KROT: исправен на базе]
                              |
                      [Рем: план сухого обхода]`,
  p19: `[КОНТУР-7: вода 87 ч 30 мин, Аша, кассета, KROT]
                              |
                       [IGLA: малый заряд на базе]
                              |
                      [Рем: координаты лестницы]`,
});

const routeChoices = Object.freeze([
  choice("ANCHOR_WITH_KROT", "Поставить KROT якорем", "KROT способен удержать затвор. Корродированная направляющая может разрушиться вокруг его силовых опор и запереть машину у кромки. IGLA остаётся наверху."),
  choice("TETHER_WITH_IGLA", "Вести IGLA на тросе", "KROT остаётся наверху. IGLA идёт по тросу, чья направляющая скрыта в мутном рассоле и может зажать трос или манипулятор."),
]);

export const PACKETS = Object.freeze({
  "NRV05-P01": packet({ id: "NRV05-P01", scene: "CALL", map: maps.call, water: "Вода: 18 ч · Рассол: 4 ч", krot: KROT_STATES.upper, body: [
    "Аша на радио: «Я в нише. Кассета на месте».",
    "Марина, диспетчер КОНТУРА-7: «Аша жива. Состояние кассеты и сколько времени она даст очистителю, мы пока не знаем. Связь и диагностика сидят на одном резерве».",
  ], choices: [
    choice("KEEP_ASHA_ON_CHANNEL", "Оставить Ашу на голосовом канале", "диагностику кассеты отложить."),
    choice("VERIFY_CASSETTE_SEAL", "Проверить герметичность кассеты", "на четыре минуты оставить Ашу без голоса."),
  ] }),
  "NRV05-P02": packet({ id: "NRV05-P02", scene: "APPROACH", map: maps.approach, water: "Вода: 18 ч · Рассол: 4 ч", krot: KROT_STATES.upper, body: [
    "Аша вела группу по шуму труб; голосовой канал закрыт, резерв связи исчерпан. Герметичность кассеты не подтверждена. Марина: «Теперь путь выбираем без подсказок».",
    "Рем, связист и картограф соседнего КАСКАДА: «Оба пути проверяются одинаково».",
    "Маршрут проверяется броском 2d6 без модификатора:\n2–6 — осложнение;\n7–9 — успех с ценой;\n10–12 — преимущество.\nШансы для маршрутов одинаковы; выбор определяет машину и часть конструкции под риском. Конкретное последствие заранее неизвестно.",
  ], choices: routeChoices }),
  "NRV05-P03": packet({ id: "NRV05-P03", scene: "APPROACH", map: maps.approachVerified, water: "Вода: 18 ч · Рассол: 4 ч", krot: KROT_STATES.upper, body: [
    "Диагностика подтвердила: целая кассета добавит к прогнозу воды для 43 жителей 72 часа при текущем расходе. Аша четыре минуты была без голоса группы.",
    "Рем, связист и картограф соседнего КАСКАДА: «Теперь вы знаете цену целой кассеты. Оба пути проверяются одинаково».",
    "Маршрут проверяется броском 2d6 без модификатора:\n2–6 — осложнение;\n7–9 — успех с ценой;\n10–12 — преимущество.\nШансы для маршрутов одинаковы; выбор определяет машину и часть конструкции под риском. Конкретное последствие заранее неизвестно.",
  ], choices: routeChoices }),
  "NRV05-P04": packet({ id: "NRV05-P04", scene: "PRESSURE_SHAFT", map: maps.anchorLow, water: "Вода: 16 ч · Рассол: 2 ч", krot: KROT_STATES.shaftDamaged, body: [
    "Проверка: 2 + 3 + 0 = 5 — осложнение.",
    "Корродированная направляющая разрушилась и ударила по приводу KROT. Машина удержала проход, но вода льётся в нишу Аши. Одновременно вытянуть Ашу и закрепить кассету нельзя.",
  ], beats: [
    ["Проверка: 2 + 3 + 0 = 5 — осложнение."],
    ["Корродированная направляющая разрушилась и ударила по приводу KROT. Машина удержала проход, но вода льётся в нишу Аши. Одновременно вытянуть Ашу и закрепить кассету нельзя."],
  ], choices: [
    choice("PULL_ASHA_OUT", "Вытянуть Ашу", "кассета уйдёт под рассол; повреждённый KROT вернётся на базу."),
    choice("LOCK_CASSETTE_IN", "Закрепить кассету", "Аша останется в затапливаемой нише на аварийной связи; повреждённый KROT вернётся на базу."),
  ] }),
  "NRV05-P05": packet({ id: "NRV05-P05", scene: "PRESSURE_SHAFT", map: maps.anchorMid, water: "Вода: 16 ч · Рассол: 2 ч", krot: KROT_STATES.shaftImmobilized, body: [
    "Проверка: 3 + 4 + 0 = 7 — успех с ценой.",
    "KROT удерживает затвор. Аша выходит на площадку.",
    "Корродированная направляющая обрушивается вокруг силовых опор. Удар повреждает оболочку кассеты: она добавит к прогнозу воды 36 часов вместо 72.",
    "KROT исправен, но его опоры зажаты разрушенной рамой. Хода нет. Телеметрия и маяк работают.",
    "KROT: «Нагрузка штатная. Рама разрушена. Ход заблокирован. Маяк активен».",
    "Аша: «Он удержал затвор для меня. Мы ведь сможем вернуться?»",
  ], beats: [
    ["Проверка: 3 + 4 + 0 = 7 — успех с ценой."],
    ["KROT удерживает затвор. Аша выходит на площадку."],
    ["Корродированная направляющая обрушивается вокруг силовых опор."],
    ["Удар повреждает оболочку кассеты: она добавит к прогнозу воды 36 часов вместо 72."],
    ["KROT исправен, но его опоры зажаты разрушенной рамой. Хода нет."],
    ["Телеметрия и маяк работают."],
    ["KROT: «Нагрузка штатная. Рама разрушена. Ход заблокирован. Маяк активен».", "Аша: «Он удержал затвор для меня. Мы ведь сможем вернуться?»"],
  ], statuses: {
    krot: ["ИСПРАВЕН", "ОБЕЗДВИЖЕН", "В ШАХТЕ", "ТЕЛЕМЕТРИЯ РАБОТАЕТ", "МАЯК АКТИВЕН"],
    cassette: ["ТРЕСНУЛА", "+36 ЧАСОВ"],
  }, choices: [
    choice("SAVE_DAMAGED_CASSETTE", "Вынести треснувшую кассету", "после ручного выхода прогноз воды составит 51 час. KROT останется исправным, но обездвиженным в шахте. По маяку можно подготовить отдельную попытку эвакуации; её успех не гарантирован."),
    choice("FREE_KROT", "Прекратить извлечение и освободить KROT", "кассета уйдёт под рассол. При аварийном извлечении рама ударит по приводу; повреждённый KROT вернётся на базу. После выхода прогноз воды составит 15 часов."),
  ] }),
  "NRV05-P06": packet({ id: "NRV05-P06", scene: "PRESSURE_SHAFT", map: maps.anchorHigh, water: "Вода: 16 ч · Рассол: 2 ч", krot: KROT_STATES.shaftOperational, body: [
    "Проверка: 5 + 5 + 0 = 10 — преимущество.",
    "KROT штатно удержал затвор и остался исправен. За затвором найден сухой обход; Аша и кассета доступны.",
    "Рем просит передать план обхода. Марина предупреждает: герметизация клапана отнимет сорок минут и оставит Ашу у него.",
  ], beats: [["Проверка: 5 + 5 + 0 = 10 — преимущество."], ["KROT штатно удержал затвор и остался исправен. За затвором найден сухой обход; Аша и кассета доступны."], ["Рем просит передать план обхода. Марина предупреждает: герметизация клапана отнимет сорок минут и оставит Ашу у него."]], choices: [
    choice("EVACUATE_THROUGH_BYPASS", "Уйти обходом", "вернуть Ашу, кассету и исправный KROT, передав Рему план, но не герметизируя клапан."),
    choice("SEAL_BYPASS_FOR_KASKAD", "Герметизировать клапан для КАСКАДА", "вернуть кассету и исправный KROT; Аша добровольно останется вести работу у клапана."),
  ] }),
  "NRV05-P07": packet({ id: "NRV05-P07", scene: "PRESSURE_SHAFT", map: maps.tetherLow, water: "Вода: 16 ч · Рассол: 2 ч", krot: KROT_STATES.upper, body: [
    "Проверка: 2 + 3 + 0 = 5 — осложнение.",
    "Скрытая направляющая срезала трос. Лебёдка может удерживать IGLA или вытянуть вручную Ашу и кассету, но не всё одновременно. Марина: «IGLA ещё отвечает».",
  ], beats: [["Проверка: 2 + 3 + 0 = 5 — осложнение."], ["Скрытая направляющая срезала трос. Лебёдка может удерживать IGLA или вытянуть вручную Ашу и кассету, но не всё одновременно. Марина: «IGLA ещё отвечает»."]], choices: [
    choice("CUT_IGLA_TETHER", "Перерезать трос", "IGLA будет потеряна в рассоле; ручной подъём повредит оболочку кассеты."),
    choice("HOLD_FOR_IGLA", "Удерживать IGLA", "прекратить извлечение кассеты, вернуть Ашу и IGLA с повреждённым манипулятором, сохранив попытку после ремонта."),
  ] }),
  "NRV05-P08": packet({ id: "NRV05-P08", scene: "PRESSURE_SHAFT", map: maps.tetherMid, water: "Вода: 16 ч · Рассол: 2 ч", krot: KROT_STATES.upper, body: [
    "Проверка: 3 + 4 + 0 = 7 — успех с ценой.",
    "IGLA дошла, но скрытая направляющая повредила манипулятор. Машина не удержит на подъёме одновременно кассету и собственный вес.",
  ], beats: [["Проверка: 3 + 4 + 0 = 7 — успех с ценой."], ["IGLA дошла, но скрытая направляющая повредила манипулятор. Машина не удержит на подъёме одновременно кассету и собственный вес."]], choices: [
    choice("RETURN_WITH_IGLA", "Прекратить извлечение и вернуться с IGLA", "кассета останется; Аша и IGLA вернутся, новая попытка возможна после ремонта манипулятора."),
    choice("LEAVE_IGLA_FOR_CASSETTE", "Оставить IGLA на площадке", "вручную поднять Ашу и кассету, повредив оболочку."),
  ] }),
  "NRV05-P09": packet({ id: "NRV05-P09", scene: "PRESSURE_SHAFT", map: maps.tetherHigh, water: "Вода: 16 ч · Рассол: 2 ч", krot: KROT_STATES.upper, body: [
    "Проверка: 5 + 5 + 0 = 10 — преимущество.",
    "Трос вывел к сухой лестнице и карте клапанов. IGLA не повреждена, но заряда хватит либо на возвращение с группой, либо на передачу карты Рему.",
  ], beats: [["Проверка: 5 + 5 + 0 = 10 — преимущество."], ["Трос вывел к сухой лестнице и карте клапанов. IGLA не повреждена, но заряда хватит либо на возвращение с группой, либо на передачу карты Рему."]], choices: [
    choice("TAKE_DRY_LADDER", "Уйти сухой лестницей", "вернуть Ашу, кассету и IGLA; с верхней галереи передать Рему координаты лестницы."),
    choice("SEND_IGLA_WITH_MAP", "Послать IGLA к Рему с картой", "IGLA останется у Рема без заряда; Аша и кассета пойдут ручным подъёмом, повреждая оболочку."),
  ] }),
  "NRV05-P10": packet({ id: "NRV05-P10", scene: "EPILOGUE", map: maps.p10, water: "Вода: 15 ч", krot: KROT_STATES.baseDamaged, causes: {
    LOW: "Удар разрушившейся направляющей повредил привод. KROT своим ходом вернулся на базу.",
    MID_EXTRACTION: "При аварийном извлечении разрушенная рама ударила по приводу. KROT освободили и вернули на базу повреждённым.",
  }, body: ["Аша, KROT и IGLA вернулись в КОНТУР-7. Кассета потеряна. При текущем расходе очиститель сможет обеспечивать 43 жителей ещё 15 часов. KROT повреждён, но мобилен; телеметрия и маяк работают. Марина: «Мы отступили с человеком и машинами. Следующая попытка потребует воды или деталей»."], terminalState: terminal("PEOPLE_OVER_FILTER", KROT_STATES.baseDamaged, "база", "база", "потеряна", 900) }),
  "NRV05-P11": packet({ id: "NRV05-P11", scene: "EPILOGUE", map: maps.p11, water: "Вода: 15 ч", krot: KROT_STATES.baseOperational, body: ["Аша, KROT и IGLA вернулись в КОНТУР-7. Кассета потеряна. При текущем расходе воды для 43 жителей хватит на 15 часов. Манипулятор IGLA повреждён, но машина на базе. Марина: «Новая попытка возможна после ремонта манипулятора»."], terminalState: terminal("PEOPLE_OVER_FILTER", KROT_STATES.baseOperational, "повреждённый манипулятор, база", "база", "потеряна", 900) }),
  "NRV05-P12": packet({ id: "NRV05-P12", scene: "EPILOGUE", map: maps.p12, water: "Вода: 87 ч 30 мин", krot: KROT_STATES.baseDamaged, body: ["Кассета добавила 72 часа к остатку: при текущем расходе воды для 43 жителей хватит на 87 часов 30 минут. Аша осталась в затапливаемой нише на аварийной связи. KROT повреждён и находится на базе. Рем: «Это не герметизация. Вода идёт к ней прямо сейчас»."], terminalState: terminal("FILTER_WITH_DEBT", KROT_STATES.baseDamaged, "база", "затапливаемая ниша", "база, исправна", 5250) }),
  "NRV05-P13": packet({ id: "NRV05-P13", scene: "EPILOGUE", map: maps.p13, water: "Вода: 87 ч 20 мин", krot: KROT_STATES.baseOperational, body: ["Кассета добавила 72 часа к остатку после сорока минут работы: при текущем расходе воды для 43 жителей хватит на 87 часов 20 минут. Аша добровольно осталась у клапана вести герметизацию. KROT исправен и находится на базе."], terminalState: terminal("FILTER_WITH_DEBT", KROT_STATES.baseOperational, "база", "добровольно у клапана", "база, исправна", 5240) }),
  "NRV05-P14": packet({ id: "NRV05-P14", scene: "EPILOGUE", map: maps.p14, water: "Вода: 51 ч", krot: KROT_STATES.shaftImmobilized, body: [
    "Аша и IGLA вернулись в КОНТУР-7. Треснувшая кассета подключена к очистителю: при текущем расходе воды для 43 жителей хватит на 51 час.",
    "KROT остался в шахте за затвором. Его корпус и системы исправны, но силовые опоры зажаты разрушенной рамой; машина не может двигаться. Телеметрия работает, маяк активен.",
    "Марина внесла в журнал новый долг: для попытки вернуть KROT придётся стабилизировать насосы, найти тяговое оборудование и снова войти в шахту до следующего кислотного фронта. Такая попытка технически возможна, но её успех не гарантирован.",
  ], statuses: { krot: ["ИСПРАВЕН", "ОБЕЗДВИЖЕН", "В ШАХТЕ", "ТЕЛЕМЕТРИЯ РАБОТАЕТ", "МАЯК АКТИВЕН"], cassette: ["ТРЕСНУЛА", "+36 ЧАСОВ"] }, terminalState: terminal("COSTLY_WATER", KROT_STATES.shaftImmobilized, "база", "база", "база, 36 ч", 3060) }),
  "NRV05-P15": packet({ id: "NRV05-P15", scene: "EPILOGUE", map: maps.p15, water: "Вода: 51 ч", krot: KROT_STATES.baseOperational, body: ["Аша и треснувшая кассета на базе; воды для 43 жителей хватит на 51 час. KROT исправен и находится на базе. IGLA потеряна в рассоле после перерезания троса. Марина: «IGLA потеряна внизу; это цена ручного подъёма»."], terminalState: terminal("COSTLY_WATER", KROT_STATES.baseOperational, "потеряна в рассоле", "база", "база, 36 ч", 3060) }),
  "NRV05-P16": packet({ id: "NRV05-P16", scene: "EPILOGUE", map: maps.p16, water: "Вода: 51 ч", krot: KROT_STATES.baseOperational, body: ["Аша и треснувшая кассета на базе; воды для 43 жителей хватит на 51 час. KROT исправен и находится на базе. IGLA оставлена на площадке шахты: её место известно, но машина недоступна до новой экспедиции."], terminalState: terminal("COSTLY_WATER", KROT_STATES.baseOperational, "оставлена на площадке", "база", "база, 36 ч", 3060) }),
  "NRV05-P17": packet({ id: "NRV05-P17", scene: "EPILOGUE", map: maps.p17, water: "Вода: 51 ч", krot: KROT_STATES.baseOperational, body: ["Аша и треснувшая кассета на базе; воды для 43 жителей хватит на 51 час. KROT исправен и находится на базе. IGLA находится у Рема с картой клапанов и без заряда; она не потеряна и не оставлена в шахте, но сегодня не вернётся."], terminalState: terminal("COSTLY_WATER", KROT_STATES.baseOperational, "у Рема, без заряда", "база", "база, 36 ч", 3060) }),
  "NRV05-P18": packet({ id: "NRV05-P18", scene: "EPILOGUE", map: maps.p18, water: "Вода: 87 ч 30 мин", krot: KROT_STATES.baseOperational, body: ["Аша и кассета на базе; при текущем расходе воды для 43 жителей хватит на 87 часов 30 минут. KROT исправен и находится на базе, IGLA на базе. Рем получил подтверждённый план сухого обхода: теперь два поселения знают один маршрут и отвечают за него вместе."], terminalState: terminal("SHARED_BYPASS", KROT_STATES.baseOperational, "база", "база", "база, исправна", 5250) }),
  "NRV05-P19": packet({ id: "NRV05-P19", scene: "EPILOGUE", map: maps.p19, water: "Вода: 87 ч 30 мин", krot: KROT_STATES.baseOperational, body: ["Аша и кассета на базе; при текущем расходе воды для 43 жителей хватит на 87 часов 30 минут. KROT исправен и находится на базе. IGLA на базе с малым зарядом, но без повреждений. Рем получил координаты сухой лестницы."], terminalState: terminal("SHARED_BYPASS", KROT_STATES.baseOperational, "малый заряд, база", "база", "база, исправна", 5250) }),
});

const route = Object.freeze({
  "NRV05-P01": { KEEP_ASHA_ON_CHANNEL: "NRV05-P02", VERIFY_CASSETTE_SEAL: "NRV05-P03" },
  "NRV05-P02": { ANCHOR_WITH_KROT: { LOW: "NRV05-P04", MID: "NRV05-P05", HIGH: "NRV05-P06" }, TETHER_WITH_IGLA: { LOW: "NRV05-P07", MID: "NRV05-P08", HIGH: "NRV05-P09" } },
  "NRV05-P03": { ANCHOR_WITH_KROT: { LOW: "NRV05-P04", MID: "NRV05-P05", HIGH: "NRV05-P06" }, TETHER_WITH_IGLA: { LOW: "NRV05-P07", MID: "NRV05-P08", HIGH: "NRV05-P09" } },
  "NRV05-P04": { PULL_ASHA_OUT: "NRV05-P10", LOCK_CASSETTE_IN: "NRV05-P12" },
  "NRV05-P05": { SAVE_DAMAGED_CASSETTE: "NRV05-P14", FREE_KROT: "NRV05-P10" },
  "NRV05-P06": { EVACUATE_THROUGH_BYPASS: "NRV05-P18", SEAL_BYPASS_FOR_KASKAD: "NRV05-P13" },
  "NRV05-P07": { CUT_IGLA_TETHER: "NRV05-P15", HOLD_FOR_IGLA: "NRV05-P11" },
  "NRV05-P08": { RETURN_WITH_IGLA: "NRV05-P11", LEAVE_IGLA_FOR_CASSETTE: "NRV05-P16" },
  "NRV05-P09": { TAKE_DRY_LADDER: "NRV05-P19", SEND_IGLA_WITH_MAP: "NRV05-P17" },
});

export function resolveTransition(packetId, choiceId, riskCase) {
  const choices = route[packetId];
  if (!choices || !choices[choiceId]) throw new Error("Недопустимый выбор для текущей сцены");
  const target = choices[choiceId];
  const nextPacketId = typeof target === "string" ? target : target[riskCase];
  if (!nextPacketId || !PACKETS[nextPacketId]) throw new Error("Для перехода нет нормативного пакета");
  return nextPacketId;
}

export function isTerminal(packetId) {
  return Boolean(PACKETS[packetId]?.terminal);
}

export function choiceLabel(packetId, choiceId) {
  return PACKETS[packetId]?.choices.find((item) => item.id === choiceId)?.label ?? "";
}

export function revealCount(packetId) {
  return PACKETS[packetId]?.beats.length ?? 0;
}

export function choicesRevealed(session) {
  const count = revealCount(session.packetId);
  return count === 0 || session.revealStep >= count;
}

export function advanceReveal(session) {
  const count = revealCount(session.packetId);
  if (!count || session.revealStep >= count) throw new Error("Все последствия уже раскрыты");
  return Object.freeze({ ...session, revealStep: session.revealStep + 1 });
}

export function revealedText(packetId, revealStep) {
  const beats = PACKETS[packetId]?.beats ?? [];
  return beats.slice(0, revealStep).flat().join("\n");
}

export function terminalCause(session) {
  if (session.packetId !== "NRV05-P10") return null;
  const prior = session.history.at(-1);
  if (prior?.packetId === "NRV05-P04") return "LOW";
  if (prior?.packetId === "NRV05-P05" && prior.choiceId === "FREE_KROT") return "MID_EXTRACTION";
  throw new Error("Для P10 отсутствует допустимая причинная история");
}

export function answersComplete(state) {
  return QUESTIONS.every((_, index) => Boolean(state.answers[index]?.trim()));
}

export function buildReport(state, userAgent) {
  if (!answersComplete(state) || !state.reportShown) throw new Error("Отчёт доступен только после 13 ответов и debrief");
  const risk = RISK_CASES[state.riskCase];
  const duration = Math.round((Date.parse(state.endedAt) - Date.parse(state.startedAt)) / 1000);
  return [
    "КОНТУР — Тихий резервуар: локальный отчёт",
    `runnerVersion: ${runnerVersion}`,
    `scenarioVersion: ${scenarioVersion}`,
    `contentVersion: ${contentVersion}`,
    `visualMode: ${state.visualMode ? "on" : "off"}`,
    `riskCase: ${state.riskCase} (${risk.label})`,
    `фактические кубики: ${risk.dice.join(" + ")}`,
    `время начала: ${state.startedAt}`,
    `время окончания: ${state.endedAt}`,
    `длительность секунд: ${duration}`,
    "решения:",
    ...state.history.map((item, index) => `${index + 1}. ${item.label}`),
    "служебный путь:",
    ...state.history.map((item) => `${item.packetId} + ${item.choiceId}`),
    `terminal packet: ${state.packetId}`,
    "ответы:",
    ...QUESTIONS.map((question, index) => `${index + 1}. ${question}\n${state.answers[index]}`),
    `userAgent: ${userAgent}`,
    `перезапуск сессии: ${state.restarted ? "да" : "нет"}`,
  ].join("\n");
}

export function playerText(packetId, cause = null) {
  const data = PACKETS[packetId];
  const causeText = cause && data.causes ? [data.causes[cause]] : [];
  return [data.map, ...causeText, ...data.body, ...data.choices.map((item) => `${item.label} — ${item.consequence}`)].join("\n");
}

export function advanceSession(session, choiceId) {
  if (!session || isTerminal(session.packetId) || session.history.some((step) => step.packetId === session.packetId)) {
    throw new Error("Предыдущий выбор уже зафиксирован");
  }
  if (!choicesRevealed(session)) throw new Error("Сначала раскройте все наблюдаемые последствия");
  const nextPacketId = resolveTransition(session.packetId, choiceId, session.riskCase);
  return Object.freeze({
    ...session,
    packetId: nextPacketId,
    revealStep: 0,
    history: [...session.history, { packetId: session.packetId, choiceId, label: choiceLabel(session.packetId, choiceId) }],
  });
}
