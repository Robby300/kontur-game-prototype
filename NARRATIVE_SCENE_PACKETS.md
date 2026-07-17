# NARRATIVE_SCENE_PACKETS — PublicScenePacket v0.4

Все записи используют `scenarioVersion = v0.4.0-n1` и
`contentVersion = v0.4.0-n1-draft.1`. `stateFingerprint` — стабильная строка
аудита только из перечисленного публичного состояния; участнику не показывается.
`HiddenWorldState`, причина скрытой поломки и назначенная пара кубиков в этом
документе не раскрываются до предусмотренного пакета результата.

## Общие термины

| Термин | Публичное значение |
| --- | --- |
| Кассета | Герметичный набор мембран, способный очистить запас воды. |
| Ниша | Небольшая боковая камера, где застряла Аша. |
| Рассол | Агрессивная жидкость, которая через 4 часа затопит нижние проходы. |

## Пакеты CALL и APPROACH

### `NRV04-P01`

| Поле | Значение |
| --- | --- |
| `presentationId` | `NRV04-PR01` |
| `sceneId` | `CALL` |
| `stateFingerprint` | `water18-brine4-ashaRadio-cassetteLocked-krotUpper-iglaUpper` |
| `publicWorldState` | Вода: 18 ч; рассол: 4 ч; Аша на радио в нише; кассета за затвором; KROT и IGLA на верхнем мостике. |
| `confirmedFacts` | Аша жива. Кассета существует. Оба объекта за одним затвором. |
| `unresolvedQuestions` | Что выдержит кромка затвора; успеет ли группа вывести и человека, и кассету. |
| `availableChoices` | `KEEP_ASHA_ON_CHANNEL`, `VERIFY_CASSETTE_SEAL` |

### `NRV04-P02`

| Поле | Значение |
| --- | --- |
| `presentationId` | `NRV04-PR02` |
| `sceneId` | `APPROACH` |
| `stateFingerprint` | `water18-brine4-callSpent-ashaHeard-cassetteUnverified-routeOpen` |
| `priorPublicConsequences` | Марина держала Ашу на канале; проверка кассеты отложена. Канал теперь закрыт, чтобы не разрядить связь. |
| `publicWorldState` | Вода: 18 ч; рассол: 4 ч; Аша отвечает, кассета не проверена; обе машины на мостике. |
| `confirmedFacts` | Аша ориентируется и слышит группу. |
| `unresolvedQuestions` | Выдержит ли затвор KROT; не перережет ли вода трос IGLA. |
| `optionalRiskPreview` | Оба маршрута требуют одной проверки `2d6 + 0`; неизвестна только пара кубиков. |
| `availableChoices` | `ANCHOR_WITH_KROT`, `TETHER_WITH_IGLA` |

### `NRV04-P03`

| Поле | Значение |
| --- | --- |
| `presentationId` | `NRV04-PR03` |
| `sceneId` | `APPROACH` |
| `stateFingerprint` | `water18-brine4-callSpent-ashaAlone-cassetteSealVerified-routeOpen` |
| `priorPublicConsequences` | Герметичность кассеты подтверждена; Аша четыре минуты была без голоса группы. Канал теперь закрыт, чтобы не разрядить связь. |
| `publicWorldState` | Вода: 18 ч; рассол: 4 ч; Аша на аварийной частоте, кассета герметична; обе машины на мостике. |
| `confirmedFacts` | Кассета цела и стоит риска. |
| `unresolvedQuestions` | Выдержит ли затвор KROT; не перережет ли вода трос IGLA. |
| `optionalRiskPreview` | Оба маршрута требуют одной проверки `2d6 + 0`; неизвестна только пара кубиков. |
| `availableChoices` | `ANCHOR_WITH_KROT`, `TETHER_WITH_IGLA` |

## Пакеты PRESSURE_SHAFT

Во всех шести пакетах до броска были известны источник риска и модификатор `0`.
`optionalRiskResult` появляется только здесь и содержит фактическую пару.

### `NRV04-P04`

| Поле | Значение |
| --- | --- |
| `presentationId` | `NRV04-PR04` |
| `sceneId` | `PRESSURE_SHAFT` |
| `stateFingerprint` | `anchor-low-water16-brine2-krotDamaged-ashaFlooding-cassetteReachable` |
| `publicWorldState` | Вода: 16 ч; рассол: 2 ч; KROT: привод повреждён, держит кромку; ниша Аши заливается; кассета доступна. |
| `confirmedFacts` | Кромка затвора осыпалась; одновременно вынести Ашу и закрепить кассету нельзя. |
| `unresolvedQuestions` | Сколько ещё выдержит ниша после следующего действия. |
| `optionalRiskResult` | `2 + 3 + 0 = 5` — осложнение. |
| `availableChoices` | `PULL_ASHA_OUT`, `LOCK_CASSETTE_IN` |

### `NRV04-P05`

| Поле | Значение |
| --- | --- |
| `presentationId` | `NRV04-PR05` |
| `sceneId` | `PRESSURE_SHAFT` |
| `stateFingerprint` | `anchor-mid-water16-brine2-krotStuck-cassetteCracked-ashaPlatform` |
| `publicWorldState` | Вода: 16 ч; рассол: 2 ч; KROT заклинило; Аша на площадке; кассета треснула, но её можно вынести. |
| `confirmedFacts` | Цель достигнута с ценой: кассета даст лишь половину ресурса, если забрать её сейчас. |
| `unresolvedQuestions` | Освободится ли KROT без нового обвала. |
| `optionalRiskResult` | `3 + 4 + 0 = 7` — успех с ценой. |
| `availableChoices` | `SAVE_DAMAGED_CASSETTE`, `FREE_KROT` |

### `NRV04-P06`

| Поле | Значение |
| --- | --- |
| `presentationId` | `NRV04-PR06` |
| `sceneId` | `PRESSURE_SHAFT` |
| `stateFingerprint` | `anchor-high-water16-brine2-krotStrained-ashaSafe-cassetteSafe-bypassKnown` |
| `publicWorldState` | Вода: 16 ч; рассол: 2 ч; KROT: привод под нагрузкой; Аша и кассета доступны; найден сухой обход. |
| `confirmedFacts` | Обход ведёт к верхней галерее и не затоплен. |
| `unresolvedQuestions` | Успеет ли «Каскад» воспользоваться обходом после ухода группы. |
| `optionalRiskResult` | `5 + 5 + 0 = 10` — преимущество. |
| `availableChoices` | `EVACUATE_THROUGH_BYPASS`, `SEAL_BYPASS_FOR_KASKAD` |

### `NRV04-P07`

| Поле | Значение |
| --- | --- |
| `presentationId` | `NRV04-PR07` |
| `sceneId` | `PRESSURE_SHAFT` |
| `stateFingerprint` | `tether-low-water16-brine2-iglaHanging-ashaReachable-cassetteReachable` |
| `publicWorldState` | Вода: 16 ч; рассол: 2 ч; IGLA висит над рассолом на повреждённом тросе; Аша и кассета доступны. |
| `confirmedFacts` | Направляющий срезал оболочку троса; держать IGLA и пользоваться лебёдкой одновременно нельзя. |
| `unresolvedQuestions` | Выдержит ли трос ещё один рывок. |
| `optionalRiskResult` | `2 + 3 + 0 = 5` — осложнение. |
| `availableChoices` | `CUT_IGLA_TETHER`, `HOLD_FOR_IGLA` |

### `NRV04-P08`

| Поле | Значение |
| --- | --- |
| `presentationId` | `NRV04-PR08` |
| `sceneId` | `PRESSURE_SHAFT` |
| `stateFingerprint` | `tether-mid-water16-brine2-iglaManipulatorDamaged-ashaSafe-cassetteSafe` |
| `publicWorldState` | Вода: 16 ч; рассол: 2 ч; IGLA: манипулятор повреждён; Аша и кассета на площадке. |
| `confirmedFacts` | IGLA дошла, но её захват больше не удержит кассету и собственный вес на подъёме. |
| `unresolvedQuestions` | Можно ли вернуть машину без кассеты до подъёма рассола. |
| `optionalRiskResult` | `3 + 4 + 0 = 7` — успех с ценой. |
| `availableChoices` | `RETURN_WITH_IGLA`, `LEAVE_IGLA_FOR_CASSETTE` |

### `NRV04-P09`

| Поле | Значение |
| --- | --- |
| `presentationId` | `NRV04-PR09` |
| `sceneId` | `PRESSURE_SHAFT` |
| `stateFingerprint` | `tether-high-water16-brine2-iglaLowBattery-ashaSafe-cassetteSafe-dryLadderKnown` |
| `publicWorldState` | Вода: 16 ч; рассол: 2 ч; IGLA: батарея мала, но корпус цел; Аша и кассета доступны; найдена сухая лестница и карта клапанов. |
| `confirmedFacts` | Лестница выводит к верхней галерее; карта может помочь Рему удержать насосную. |
| `unresolvedQuestions` | Успеет ли IGLA дойти до Рема с картой до подъёма рассола. |
| `optionalRiskResult` | `5 + 5 + 0 = 10` — преимущество. |
| `availableChoices` | `TAKE_DRY_LADDER`, `SEND_IGLA_WITH_MAP` |

## Терминальные пакеты EPILOGUE

### `NRV04-P10` — `T01 PEOPLE_OVER_FILTER`

`presentationId = NRV04-PR10`; `stateFingerprint = terminal-people-water12-filterLost-machineDamaged-kaskadContact`.
Публичное состояние: Аша жива, кассета потеряна, воды 12 часов; одна машина
повреждена, но доступна; «Каскад» отвечает на связи. Выборов нет.

### `NRV04-P11` — `T02 FILTER_WITH_DEBT`

`presentationId = NRV04-PR11`; `stateFingerprint = terminal-filter-water72-ashaInShaft-kaskadDebt`.
Публичное состояние: кассета даст 72 часа воды; Аша остаётся в нише на связи;
Рем называет это долгом КОНТУРА перед «Каскадом». Выборов нет.

### `NRV04-P12` — `T03 COSTLY_WATER`

`presentationId = NRV04-PR12`; `stateFingerprint = terminal-costlyWater36-ashaSafe-machineAbsent-kaskadChance`.
Публичное состояние: Аша и кассета у группы; кассета даёт 36 часов воды; одна
машина потеряна или осталась в шахте. Выборов нет.

### `NRV04-P13` — `T04 SHARED_BYPASS`

`presentationId = NRV04-PR13`; `stateFingerprint = terminal-sharedBypass-water72-ashaSafe-machinesAvailable-kaskadAlliance`.
Публичное состояние: Аша и кассета возвращены; воды 72 часа; обе машины
доступны; «Каскад» получил подтверждённый план сухого обхода. Выборов нет.

## Аудит покрытий

- Пакеты: 13; presentations: 13; терминалы: 4; полные пути: 24.
- Каждая из трёх полос имеет по два наблюдаемо разных пакета маршрута и иной
  набор следующего выбора.
- `P01` меняет `P02`/`P03`; `P02`/`P03` меняют маршрут и пакет результата;
  `P04`…`P09` меняют терминал. Ни один выбор не существует лишь ради строки
  эпилога.
