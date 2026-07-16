# Эпизод 0 «Кислотный фронт»: исполнимая спецификация

Версия: `0.3.1-reviewed`

## 1. Назначение

Эпизод проверяет цикл «постоянное состояние → выбор → экспедиция → доктрина →
цена → отложенное последствие». Это конечный вертикальный срез, а не начало
универсального сценарного движка.

### 1.1. Цифровой мастер

Роль ограниченного цифрового мастера выполняет `EpisodeDirector`. Он не
импровизирует и не использует LLM. Он применяет этот авторский граф:

```text
RESCUE_GATE
→ NIGHT_PROJECT
→ REACTOR_ROUTE
→ DOCTRINE_CRISIS
→ CONSEQUENCE
→ NODE12_CONTACT
→ EPILOGUE
```

`EpisodeSessionState` содержит текущую `EpisodeStage`, публичный `WorldState`,
закрытый `HiddenWorldState`, seed, `randomDrawCount`, историю
решений и журнал. Для каждой нетерминальной стадии директор обязан выбрать ровно
одну следующую сцену. Если подходят ноль или больше одной сцены, это ошибка
спецификации или реализации, а не игровой исход.

Четыре обычных решения передаются как `ChoiceDecision(ChoiceId)`, а порядок
приказов — как `DoctrineDecision(Doctrine)`. Оба типа реализуют sealed interface
`PlayerDecision`; фиктивного `ChoiceId` для доктрины нет.

`current(session)` является чистым чтением и не расходует случайные значения.
После решения S2 директор автоматически разрешает `REACTOR_ROUTE` внутри
перехода, при необходимости делает единственный бросок и останавливается на
`DOCTRINE_CRISIS`. Автоматические стадии не считаются решениями игрока.

В `HiddenWorldState` этого эпизода заранее зафиксированы существование
`NODE_12`, его население 18 человек и подлинность аварии очистки воды. До
контакта эти факты не входят в публичный briefing. Значения кубиков также
неизвестны до броска. Других скрытых симуляций или импровизированных фактов нет.

`EpisodeSessionState.randomDrawCount` равен `0` до проверки и `2` после неё.
Production-реализация `DiceRoller` создаёт `java.util.SplittableRandom(seed)`,
пропускает `randomDrawCount` значений и для одного `d6` вызывает
`nextInt(1, 7)`. `2d6` потребляет два последовательных значения и возвращает
новый счётчик. Проверка выполняется максимум один раз за сессию. В тестах
`DiceRoller` можно заменить фиксированными значениями.

## 2. Публичная завязка

Убежище `KONTUR_7` содержит 43 человека. Главный генератор откажет через 48
часов, пищи осталось на четыре дня. Через шесть часов сектор накроет кислотный
фронт. Отряд `KROT`, `STRIZH`, `IGLA` уже прибыл на станцию эвакуации, где
заперты два специалиста:

- `VERA` — энергетик;
- `TIMUR` — агроном.

Главный шлюз заклинило. Это первый выбор игрока; отдельного выбора цели перед
станцией в вертикальном срезе нет.

## 3. Начальное состояние

```text
day = 1
population = 43
foodStatus = FOUR_DAYS
generatorHours = 48
powerMode = FULL
workshopStatus = ONLINE
spareParts = 2
reactorCondition = NONE
reactorLocation = NONE
reactorOutput = NONE
node12Relation = UNKNOWN

KROT.life = OPERATIONAL
KROT.actuator = WORN
STRIZH.life = OPERATIONAL
STRIZH.sensor = OPERATIONAL
IGLA.life = OPERATIONAL
IGLA.manipulator = OPERATIONAL

specialists = []
flags = []
```

В состоянии первого пользовательского выбора местоположение каждой машины —
`IN_FIELD`, поскольку отряд уже находится у станции. После S1 вернувшиеся
машины получают `AT_BASE`. Нормативные конечные множества:

```text
EpisodeStage = RESCUE_GATE | NIGHT_PROJECT | REACTOR_ROUTE | DOCTRINE_CRISIS |
               CONSEQUENCE | NODE12_CONTACT | EPILOGUE
MachineId = KROT | STRIZH | IGLA
SpecialistId = VERA | TIMUR
OrderCard = M | A | R
MachineLocation = AT_BASE | IN_FIELD | STRANDED | AWAY | LOST
MachineLife = OPERATIONAL | DAMAGED | LOST
KrotActuator = WORN | DAMAGED | CRIPPLED
StrizhSensor = OPERATIONAL | BURNED
IglaManipulator = OPERATIONAL | DAMAGED
FoodStatus = FOUR_DAYS | THREE_DAYS | SUSTAINABLE | RATIONED_TWO_DAYS
PowerMode = FULL | LIMITED | EMERGENCY
WorkshopStatus = ONLINE | OFFLINE
Node12Relation = UNKNOWN | CONTACTED | COOPERATIVE | ALLY | SILENT
ReactorCondition = NONE | FULL | DEGRADED | LOST
ReactorLocation = NONE | AT_BASE | STRANDED | INSTALLED | NODE12 | LOST
ReactorOutput = NONE | FULL | LIMITED
ReturnWindow = SHORT | NORMAL | LONG
ContactTiming = EARLY | LATE
OutcomeFamily = FULL_MODULE_IGLA_STRANDED | KROT_AND_MODULE_STRANDED |
                DEGRADED_MODULE_ALL_RETURNED | ALL_RETURNED_MODULE_LOST |
                KROT_STRANDED_MODULE_LOST
```

`LOST` в местоположении означает недоступность машины и обязан совпадать с
`MachineLife.LOST`. Аналогично `ReactorCondition.LOST` требует
`ReactorLocation.LOST` и `ReactorOutput.NONE`. Повреждение не означает потерю.
Шаг ремонта привода `KROT`:
`CRIPPLED → DAMAGED → WORN`. Шаг ремонта сенсора: `BURNED → OPERATIONAL`.

После сцены эвакуации проходит 12 часов: `generatorHours -= 12`. Если спасены
оба человека, `population = 45`; если один — `population = 44`. В обоих случаях
`foodStatus = THREE_DAYS`, пока не запущена теплица.

## 4. S1 — эвакуационный шлюз

Игрок видит кислотный фронт, оставшееся время и известную цену каждого решения.

| ChoiceId | Публичное обещание | Переход |
|---|---|---|
| `BREAK_GATE` | Спасти обоих; повредить тяжёлый привод | добавить `VERA`, `TIMUR`; `KROT.actuator = DAMAGED` |
| `TECH_CHANNEL_VERA` | Спасти только энергетика; сохранить машины | добавить `VERA`; `TIMUR` считается потерянным |
| `TECH_CHANNEL_TIMUR` | Спасти только агронома; сохранить машины | добавить `TIMUR`; `VERA` считается потерянной |
| `DISCHARGE_BATTERIES` | Спасти обоих и сохранить «Крота»; дальний сенсор «Стрижа» сгорит на обратном пути | добавить `VERA`, `TIMUR`; `STRIZH.sensor = BURNED`; добавить `BATTERIES_DISCHARGED` |

`TECH_CHANNEL_VERA` и `TECH_CHANNEL_TIMUR` могут показываться после промежуточной
кнопки «вывести одного», но в доменной модели это два разных `ChoiceId`.

## 5. S2 — ночной проект базы

Игрок выбирает ровно один доступный проект. До выбора показываются прямые цены.

| ChoiceId | Условие | Эффект |
|---|---|---|
| `START_GREENHOUSE` | спасён `TIMUR`, `spareParts >= 1` | `foodStatus = SUSTAINABLE`; `spareParts -= 1`; `generatorHours -= 6`; флаг `GREENHOUSE_ACTIVE` |
| `PATCH_GENERATOR` | спасена `VERA`, `spareParts >= 1` | `generatorHours += 48`; `spareParts -= 1`; флаг `GENERATOR_PATCHED` |
| `REPAIR_STRIZH_SENSOR` | сенсор `BURNED`, `spareParts >= 1` | сенсор `OPERATIONAL`; `spareParts -= 1` |
| `REPAIR_KROT_ACTUATOR` | привод `DAMAGED`, `spareParts >= 1` | привод `WORN`; `spareParts -= 1` |
| `CONSERVE_PARTS` | всегда | состояние не меняется; флаг `PARTS_CONSERVED` |

Недоступный проект не показывается. После проекта начинается день 2. Сам проект
не отменяет ценность реакторного модуля: полный модуль даёт постоянную мощность и
работающую мастерскую; заплатка только откладывает отказ старого генератора.

## 6. S3 — путь к энергоблоку и риск

Перед выходом игроку сообщается:

- реакторный модуль решит энергетическую проблему надолго;
- автоматика выбросит модуль сегодня, после нового фронта он станет недоступен;
- повреждённый сенсор повышает риск пути;
- при сгоревшем сенсоре путь может повредить корпус `STRIZH` и сократить окно
  возвращения;
- случайность не меняет правила доктрины.

Если сенсор `OPERATIONAL`, проверка не выполняется, `returnWindow = LONG`.

Если сенсор `BURNED`, выполняется `2d6 + preparationModifier`:

- `+1`, если выбран `CONSERVE_PARTS` и установлен флаг `PARTS_CONSERVED`;
- иначе `0`.

Таким образом, трата ночи на теплицу или генератор сохраняет их прямую пользу,
но лишает экспедицию бонуса подготовки. Ремонт сенсора полностью убирает бросок.

| Итог | Эффект |
|---|---|
| `<= 6` | `returnWindow = SHORT`; `STRIZH.life = DAMAGED` |
| `7–9` | `returnWindow = NORMAL`; `STRIZH.life = DAMAGED` |
| `>= 10` | `returnWindow = LONG` |

Публичный отчёт после проверки показывает два кубика, модификатор, сумму и
созданное окно возвращения. До броска скрыты только значения кубиков.

## 7. S3 — доктрина реакторной экспедиции

Игрок упорядочивает `M`, `A`, `R`.

- `M`: закрепить реакторный модуль;
- `A`: освободить обездвиженного `KROT`;
- `R`: начать возвращение при критическом заряде.

В кризисе одновременно истинны три наблюдаемых условия: крепления модуля
разрушаются, привод `KROT` заблокирован, заряд достиг порога возвращения.

Действия исполняются сверху вниз с переоценкой состояния. `R` завершает сцену.
Для вертикального среза терминальные семейства зафиксированы таблицей:

| Doctrine | OutcomeFamily | Результат до S4 |
|---|---|---|
| `M>A>R` | `FULL_MODULE_IGLA_STRANDED` | `reactorCondition = FULL`, `reactorLocation = AT_BASE`; `KROT` вернулся; `IGLA.location = STRANDED` |
| `M>R>A` | `KROT_AND_MODULE_STRANDED` | `STRIZH` и `IGLA` вернулись; `KROT.location = STRANDED`; `reactorCondition = FULL`, `reactorLocation = STRANDED` |
| `A>M>R` | `DEGRADED_MODULE_ALL_RETURNED` | все машины вернулись; `reactorCondition = DEGRADED`, `reactorLocation = AT_BASE` |
| `A>R>M` | `ALL_RETURNED_MODULE_LOST` | все машины вернулись; `reactorCondition = LOST`, `reactorLocation = LOST` |
| `R>M>A` | `KROT_STRANDED_MODULE_LOST` | `STRIZH` и `IGLA` вернулись; `KROT.location = STRANDED`; `reactorCondition = LOST`, `reactorLocation = LOST` |
| `R>A>M` | `KROT_STRANDED_MODULE_LOST` | тот же физический результат, но в журнале сохраняется другой порядок |

Причинная семантика:

- если `A` выполняется до `M`, `KROT` освобождается без потери `IGLA`, но модуль
  успевает получить повреждение;
- если `M` выполняется до `A`, полный модуль сохраняется, но для освобождения
  нагруженного `KROT` машине `IGLA` приходится отдать силовой блок;
- если `R` выполняется до `A`, неподвижный `KROT` остаётся в секторе;
- если `R` выполняется до `M`, незакреплённый модуль теряется.

Предыдущее состояние привода `KROT` сохраняется после возвращения и влияет на
итоговую сводку, но не меняет таблицу семейств в этом эпизоде.

Слово «вернулся» в таблице нормативно означает `location = AT_BASE`. В начале
кризиса все три машины получают `IN_FIELD`; после разрешения ни одна машина не
может остаться `IN_FIELD`. До S4 `reactorOutput = NONE` во всех семействах.

## 8. S4 — решение по последствиям экспедиции

Показываются только варианты семейства фактического исхода.

### 8.1. `FULL_MODULE_IGLA_STRANDED`

| ChoiceId | Эффект |
|---|---|
| `INSTALL_FULL_POWER` | `reactorLocation = INSTALLED`, `reactorOutput = FULL`; `powerMode = FULL`; мастерская `ONLINE`; `IGLA.life = LOST`, `IGLA.location = LOST` |
| `POWER_RESCUE_BEACON` | `reactorLocation = INSTALLED`, `reactorOutput = LIMITED`; `powerMode = LIMITED`; мастерская `OFFLINE`; `IGLA.location = AT_BASE`; флаг `RESCUE_BEACON_ACTIVE` |
| `SEND_KROT_FOR_IGLA` | `reactorLocation = INSTALLED`, `reactorOutput = FULL`; `powerMode = FULL`; `IGLA.location = AT_BASE`; привод `KROT = CRIPPLED`; мастерская `ONLINE` |

При `returnWindow = SHORT` вариант `SEND_KROT_FOR_IGLA` недоступен. При
`returnWindow = LONG` он оставляет привод `KROT = DAMAGED`, а не `CRIPPLED`.

### 8.2. `KROT_AND_MODULE_STRANDED`

| ChoiceId | Эффект |
|---|---|
| `RECOVER_KROT_AND_MODULE` | `KROT.location = AT_BASE`; `reactorCondition = DEGRADED`, `reactorLocation = INSTALLED`, `reactorOutput = LIMITED`; `powerMode = LIMITED`; `IGLA.manipulator = DAMAGED`; мастерская `OFFLINE` |
| `RECOVER_MODULE_ONLY` | `KROT.life = LOST`, `KROT.location = LOST`; `reactorLocation = INSTALLED`, `reactorOutput = FULL`; `powerMode = FULL`; мастерская `ONLINE` |
| `ABANDON_REACTOR_SITE` | `KROT.life = LOST`, `KROT.location = LOST`; `reactorCondition = LOST`, `reactorLocation = LOST`, `reactorOutput = NONE`; старый генератор остаётся единственным источником |

При `returnWindow = LONG` в первом варианте манипулятор `IGLA` остаётся
`OPERATIONAL`. При `SHORT` первый вариант недоступен.

### 8.3. `DEGRADED_MODULE_ALL_RETURNED`

| ChoiceId | Эффект |
|---|---|
| `INSTALL_LIMITED_MODULE` | `reactorLocation = INSTALLED`, `reactorOutput = LIMITED`; `powerMode = LIMITED`; мастерская `OFFLINE` |
| `DISASSEMBLE_MODULE` | `reactorCondition = LOST`, `reactorLocation = LOST`, `reactorOutput = NONE`; `generatorHours += 168`; `spareParts += 2` |
| `OFFER_MODULE_FOR_TRADE` | модуль остаётся `DEGRADED` в `AT_BASE`; `node12Relation = CONTACTED`; флаг `TRADE_OFFER_SENT` |

### 8.4. `ALL_RETURNED_MODULE_LOST`

| ChoiceId | Эффект |
|---|---|
| `ACCEPT_AUSTERITY` | эпилог моделирует ожидаемый отказ: `powerMode = EMERGENCY`; мастерская `OFFLINE` |
| `CANNIBALIZE_KROT` | `KROT.life = LOST`, `KROT.location = LOST`; `generatorHours += 168`; `spareParts += 2` |
| `BROADCAST_FOR_HELP` | `node12Relation = CONTACTED`; флаг `HELP_REQUEST_SENT` |

### 8.5. `KROT_STRANDED_MODULE_LOST`

| ChoiceId | Эффект |
|---|---|
| `RESCUE_KROT_WITH_IGLA` | `KROT.location = AT_BASE`; `IGLA.manipulator = DAMAGED`; модуль `LOST` |
| `ABANDON_KROT` | `KROT.life = LOST`, `KROT.location = LOST`; модуль `LOST` |
| `REQUEST_EXTERNAL_RESCUE` | `node12Relation = CONTACTED`; `KROT.location = AT_BASE`, привод `CRIPPLED`; флаг `OWES_NODE12` |

При `returnWindow = LONG` первый вариант не повреждает `IGLA`. При `SHORT` он
недоступен.

## 9. S5 — Узел-12 как отложенное последствие

Сцена происходит в каждом прохождении. Ранние решения определяют время контакта.

`contactTiming = EARLY`, если истинно хотя бы одно условие:

- `RESCUE_BEACON_ACTIVE`;
- сенсор `STRIZH` исправен, машина не потеряна и находится `AT_BASE`;
- ранее установлен `node12Relation = CONTACTED`.

Иначе `contactTiming = LATE`: слабое сообщение принимается штатной радиостанцией
только после прохождения фронта.

Сообщение сообщает правду: в `NODE_12` живут 18 человек, у них работает
мастерская, но отказывает очистка воды. При `EARLY` остаётся 36 часов, при `LATE`
— 12 часов. Они просят помощь и предлагают ремонт.

Доступные ответы:

| ChoiceId | Условие | Эффект |
|---|---|---|
| `SEND_GREENHOUSE_CULTURES` | `GREENHOUSE_ACTIVE` и `contactTiming = EARLY` | `foodStatus = RATIONED_TWO_DAYS`; `node12Relation = ALLY`; в эпилоге доступные сенсор и привод ремонтируются на одну ступень |
| `SHARE_REACTOR_POWER` | `reactorOutput = FULL` | `reactorOutput = LIMITED`; `powerMode = LIMITED`; `node12Relation = ALLY`; мастерская базы становится `OFFLINE` |
| `TRADE_DEGRADED_MODULE` | флаг `TRADE_OFFER_SENT`, `reactorCondition = DEGRADED`, `reactorLocation = AT_BASE` | модуль получает `reactorLocation = NODE12`; `generatorHours += 120`; `node12Relation = COOPERATIVE`; доступные сенсор и привод ремонтируются на одну ступень |
| `SEND_IGLA_TO_NODE12` | `IGLA.life != LOST` и `IGLA.location = AT_BASE` | `IGLA.location = AWAY`; `node12Relation = COOPERATIVE`; сенсор `STRIZH` ремонтируется; при `LATE` манипулятор `IGLA` получает `DAMAGED` из-за спешки |
| `IGNORE_NODE12` | всегда | `node12Relation = SILENT`; флаг `NODE12_IGNORED` |

Ремонт от `SEND_GREENHOUSE_CULTURES` и `TRADE_DEGRADED_MODULE` не возвращает
потерянную машину и применяется только к машине в `AT_BASE`: привод
`CRIPPLED → DAMAGED → WORN`, сенсор `BURNED → OPERATIONAL`.

## 10. Эпилог

Эпилог показывает фактическое состояние и один профиль. `durablePower = true`,
если `reactorOutput != NONE` либо `generatorHours >= 168`. «Все машины
сохранены» означает, что ни у одной машины `life = LOST`; местоположение `AWAY`
считается сохранением. Профиль выбирается по первому совпавшему правилу:

1. теплица активна и `NODE_12 = ALLY` → `AGRARIAN_ALLIANCE`;
2. `durablePower`, полная мощность, мастерская работает, все машины сохранены → `INDUSTRIAL_HUB`;
3. `durablePower`, полная мощность, но потеряна машина → `POWERED_STRONGHOLD`;
4. ограниченная мощность и все машины сохранены → `MOBILE_COMMUNE`;
5. `NODE_12 = ALLY` или `COOPERATIVE` → `DEPENDENT_NETWORK`;
6. аварийная мощность или `durablePower = false` → `AUSTERITY_ENCLAVE`;
7. иначе → `SURVIVAL_OUTPOST`.

Сводка обязана показать:

- население и специалистов;
- пищу;
- энергию и мастерскую;
- каждую машину и её ключевой модуль;
- отношения с `NODE_12`;
- профиль убежища;
- все пять выбранных игроком решений: S1, S2, доктрину, S4 и S5;
- seed.

Нет общего score, победы или скрытой оценки морали.

## 11. Публичный журнал

Каждый переход создаёт доменные события. Из них строятся два представления:

- атмосферное сообщение;
- раскрываемая причинная цепочка.

Причинная цепочка доктрины имеет форму:

```text
Наблюдения: MODULE_AT_RISK, KROT_IMMOBILIZED, ENERGY_CRITICAL
→ совпали M, A, R
→ первым выполнен M
→ модуль закреплён; состояние изменено
→ совпали A, R
→ выполнен A; KROT освобождён; IGLA оставила силовой блок
→ совпал R
→ начато возвращение
→ итог: FULL_MODULE_IGLA_STRANDED
```

Скрытые будущие ветки и недоступные последствия в журнал не попадают.

## 12. Инварианты

- Одинаковые начальное состояние, seed и решения дают одинаковый итог и журнал.
- Любой предложенный `ChoiceId` применим к текущему состоянию.
- Неприменимый `ChoiceId` отклоняется без изменения состояния.
- Ресурсы не становятся отрицательными.
- Потерянная машина не выполняет последующие действия.
- Один специалист не может быть одновременно спасён и потерян.
- Полный и ограниченный модуль взаимоисключающие.
- Каждый путь содержит ровно пять принятых игровых решений: S1, S2, доктрину,
  S4 и S5. Просмотр отчёта и подтверждение ввода решениями не считаются.
- Все шесть доктрин достижимы.
- Все семь профилей эпилога достижимы автоматическим перебором.
- `NODE12_CONTACT` достигается ровно один раз в каждом прохождении.
- Для каждой нетерминальной стадии `EpisodeDirector` выбирает ровно одну сцену.
- Только `DOCTRINE_CRISIS` принимает `DoctrineDecision`; остальные стадии выбора
  принимают `ChoiceDecision`.
- `current(session)` не меняет состояние, журнал и `randomDrawCount`.
- `randomDrawCount` принимает только значения `0` и `2`.
