# NARRATIVE_SCENE_PACKETS_V05 — нормативный PublicScenePacket contract

## Версии, IDs и intro

Все 19 записей используют `scenarioVersion=v0.5.0-w1` и
`contentVersion=v0.5.0-w1-draft.2`. Канонические IDs:
`NRV05-P01`…`NRV05-P19` и `NRV05-PR01`…`NRV05-PR19`. Короткие P01…P19 и
PR01…PR19 — только попарные aliases.

`NRV05-INTRO` описан в
[NARRATIVE_PRESENTATIONS_V05.md](NARRATIVE_PRESENTATIONS_V05.md). Он не является
`PublicScenePacket`, не имеет `presentationId`, не изменяет состояние, не
содержит выбора и не входит в граф путей.

## Defaults

### terminology

КОНТУР-7 — поселение 43 человек в бывшем узле давления и очистки воды.
«База» означает КОНТУР-7. Кассета — сменный блок фильтрующих мембран очистителя,
а часы воды — прогноз для жителей при текущем расходе. Аша — инженер насосной.
KROT — тяжёлая силовая автономная машина; IGLA — лёгкая автономная машина с
тросовым манипулятором. Рассол — агрессивная жидкость. «Хор» не используется.

### styleConstraints

Карта идёт до текста; один абзац — одно наблюдаемое изменение; цвет не является
единственным носителем смысла; participant text не содержит raw IDs, enum,
fingerprint, hidden state, score или авторскую оценку. PR04…PR09 содержат
результат риска и следующий выбор как два такта одного presentation.

### KROT state

Порядок пяти значений в сокращении `KROT[...]`:

```text
condition / mobility / location / telemetryStatus / beaconStatus
```

`recoveryPossible` вычисляется по
[KROT_STATE_MODEL_V05.md](KROT_STATE_MODEL_V05.md) и в packet state не хранится.

## SceneLayoutRegistry

| `sceneLayoutId` | Узлы, связи, occupants, известные/закрытые маршруты, focus |
| --- | --- |
| `LAYOUT-CALL` | КОНТУР-7—верхний мостик—затвор; от затвора к нише Аши и кассете; группа, KROT, IGLA на мостике; focus=связь |
| `LAYOUT-APPROACH` | КОНТУР-7—мостик—затвор—ниша/кассета; корродированная направляющая и трос — два известных маршрута; focus=маршрут |
| `LAYOUT-ANCHOR` | Мостик—KROT—затвор—ниша/площадка/кассета; сухой обход только в P06; focus=последствие якоря |
| `LAYOUT-TETHER` | Мостик—трос—площадка—ниша/кассета; лестница и карта только в P09; focus=последствие троса |
| `LAYOUT-TERMINAL` | КОНТУР-7, резервуар и одно точное место отсутствующей, оставленной или повреждённой фигуры; focus=фактическое последствие |

## PacketRegistry

Сокращения: `fp=stateFingerprint`, `ws=publicWorldState`, `layout=sceneLayout`,
`chars=presentCharacters`, `facts=confirmedFacts`,
`unknown=unresolvedQuestions`, `prior=priorPublicConsequences`,
`choices=availableChoices`, `risk=optionalRiskPreview`. Во всех строках
`term=defaults`, `style=defaults`.

| packetId / presentationId / sceneId / fp | ws; layout; chars | facts; unknown | prior; choices; risk |
| --- | --- | --- | --- |
| `NRV05-P01` / `NRV05-PR01` / `CALL` / `w1080-b240-ashaRadio-cassetteLocked-krotOperationalMobileUpper` | вода 18 ч, рассол 4 ч; Аша на радио; кассета locked; `KROT[OPERATIONAL/MOBILE/UPPER_BRIDGE/ONLINE/ACTIVE]`; IGLA на мостике; `LAYOUT-CALL`; Марина, диспетчер КОНТУРА-7, Аша | Аша жива; кассета нужна очистителю; её состояние и прибавка неизвестны | initial after intro; `KEEP_ASHA_ON_CHANNEL`, `VERIFY_CASSETTE_SEAL`; нет |
| `NRV05-P02` / `NRV05-PR02` / `APPROACH` / `w1080-b240-callAsha-cassetteUnverified-routeOpen` | вода 18 ч, рассол 4 ч, кассета непроверена; `KROT[OPERATIONAL/MOBILE/UPPER_BRIDGE/ONLINE/ACTIVE]`; IGLA на мостике; `LAYOUT-APPROACH`; Марина, Аша, Рем — связист и картограф КАСКАДА | Аша слышала группу; герметичность и прибавка целой кассеты неизвестны | голосовой резерв израсходован; `ANCHOR_WITH_KROT`, `TETHER_WITH_IGLA`; `2d6+0`: 2–6 осложнение, 7–9 успех с ценой, 10–12 преимущество; шансы равны; риски — обрушение направляющей вокруг опор KROT либо скрытая под рассолом направляющая троса IGLA; пара и исход скрыты |
| `NRV05-P03` / `NRV05-PR03` / `APPROACH` / `w1080-b240-callSeal-cassetteVerified72-routeOpen` | вода 18 ч, рассол 4 ч, кассета verified; `KROT[OPERATIONAL/MOBILE/UPPER_BRIDGE/ONLINE/ACTIVE]`; IGLA на мостике; `LAYOUT-APPROACH`; Марина, Аша, Рем — связист и картограф КАСКАДА | целая кассета добавит 72 ч к остатку; исход маршрута неизвестен | Аша была без голоса 4 мин; `ANCHOR_WITH_KROT`, `TETHER_WITH_IGLA`; тот же `2d6+0`, равные шансы и публичные физические риски; пара и исход скрыты |
| `NRV05-P04` / `NRV05-PR04` / `PRESSURE_SHAFT` / `w960-b120-anchor-krotDamagedNicheFlooding-cassetteReachable` | вода 16 ч, рассол 2 ч; `KROT[DAMAGED/MOBILE/PRESSURE_SHAFT/ONLINE/ACTIVE]`; ниша затапливается; `LAYOUT-ANCHOR`; Марина, Аша, Рем | направляющая разрушилась и ударила привод; вместе выполнить оба действия невозможно | маршрут=якорь; `PULL_ASHA_OUT`, `LOCK_CASSETTE_IN`; `2+3+0=5`, осложнение |
| `NRV05-P05` / `NRV05-PR05` / `PRESSURE_SHAFT` / `w960-b120-anchor-krotOperationalImmobilized-cassetteCracked-ashaPlatform` | вода 16 ч, рассол 2 ч; `KROT[OPERATIONAL/IMMOBILIZED/PRESSURE_SHAFT/ONLINE/ACTIVE]`; Аша на площадке; кассета треснула; `LAYOUT-ANCHOR`; Марина, Аша | KROT исправен, опоры зажаты рамой, телеметрия и маяк работают; из этих признаков следует техническая возможность отдельной попытки эвакуации, её успех неизвестен; кассета добавит 36 ч | маршрут=якорь; `SAVE_DAMAGED_CASSETTE`, `FREE_KROT`; `3+4+0=7`, успех с ценой |
| `NRV05-P06` / `NRV05-PR06` / `PRESSURE_SHAFT` / `w960-b120-anchor-krotOperational-ashaSafe-cassetteSafe-bypassKnown` | вода 16 ч, рассол 2 ч; `KROT[OPERATIONAL/MOBILE/PRESSURE_SHAFT/ONLINE/ACTIVE]`; Аша и кассета доступны; обход открыт; `LAYOUT-ANCHOR`; Марина, Аша, Рем | KROT исправен; обход сухой; успеет ли КАСКАД неизвестно | маршрут=якорь; `EVACUATE_THROUGH_BYPASS`, `SEAL_BYPASS_FOR_KASKAD`; `5+5+0=10`, преимущество |
| `NRV05-P07` / `NRV05-PR07` / `PRESSURE_SHAFT` / `w960-b120-tether-iglaHanging-ashaReachable-cassetteReachable` | вода 16 ч, рассол 2 ч; `KROT[OPERATIONAL/MOBILE/UPPER_BRIDGE/ONLINE/ACTIVE]`; IGLA висит; `LAYOUT-TETHER`; Марина, Аша | направляющая срезала трос; лебёдка не удержит IGLA и ручной подъём вместе | маршрут=трос; `CUT_IGLA_TETHER`, `HOLD_FOR_IGLA`; `2+3+0=5`, осложнение |
| `NRV05-P08` / `NRV05-PR08` / `PRESSURE_SHAFT` / `w960-b120-tether-iglaManipulatorDamaged-ashaSafe-cassetteSafe` | вода 16 ч, рассол 2 ч; `KROT[OPERATIONAL/MOBILE/UPPER_BRIDGE/ONLINE/ACTIVE]`; IGLA на площадке с повреждённым манипулятором; `LAYOUT-TETHER`; Марина, Аша | IGLA не поднимет кассету; возврат без кассеты возможен | маршрут=трос; `RETURN_WITH_IGLA`, `LEAVE_IGLA_FOR_CASSETTE`; `3+4+0=7`, успех с ценой |
| `NRV05-P09` / `NRV05-PR09` / `PRESSURE_SHAFT` / `w960-b120-tether-iglaLowBattery-ashaSafe-cassetteSafe-dryLadderKnown` | вода 16 ч, рассол 2 ч; `KROT[OPERATIONAL/MOBILE/UPPER_BRIDGE/ONLINE/ACTIVE]`; IGLA с малым зарядом; лестница и карта известны; `LAYOUT-TETHER`; Марина, Аша, Рем | лестница сухая; успеет ли IGLA передать карту неизвестно | маршрут=трос; `TAKE_DRY_LADDER`, `SEND_IGLA_WITH_MAP`; `5+5+0=10`, преимущество |
| `NRV05-P10` / `NRV05-PR10` / `EPILOGUE` / `w900-b60-ashaBase-cassetteLost-krotDamagedMobileBase-iglaBase-retreatOpen` | Аша и IGLA на базе; кассета lost; вода 15 ч; `KROT[DAMAGED/MOBILE/BASE/ONLINE/ACTIVE]`; `LAYOUT-TERMINAL`; Марина | физическое состояние одинаково: KROT повреждён, мобилен и на базе; новая попытка требует воды или деталей | prior: после осложнения направляющая ударила привод; после успеха с ценой рама ударила привод при освобождении; ведущий выбирает только уже показанную причину; choices=нет; risk=нет |
| `NRV05-P11` / `NRV05-PR11` / `EPILOGUE` / `w900-b60-ashaBase-cassetteLost-krotOperationalBase-iglaManipulatorDamagedBase-retreatOpen` | Аша и KROT на базе; IGLA с повреждённым манипулятором на базе; вода 15 ч; `KROT[OPERATIONAL/MOBILE/BASE/ONLINE/ACTIVE]`; `LAYOUT-TERMINAL`; Марина | отступление сохранило IGLA; нужен ремонт | выход 60 мин; нет; нет |
| `NRV05-P12` / `NRV05-PR12` / `EPILOGUE` / `w5250-b90-ashaFloodingNiche-cassetteBase-krotDamagedMobileBase-iglaBase` | кассета, повреждённый KROT и IGLA на базе; Аша в затапливаемой нише; вода 87:30; `KROT[DAMAGED/MOBILE/BASE/ONLINE/ACTIVE]`; `LAYOUT-TERMINAL`; Марина, Рем | кассета добавила 72 ч; ниша продолжает затапливаться | подъём 30 мин; нет; нет |
| `NRV05-P13` / `NRV05-PR13` / `EPILOGUE` / `w5240-b80-ashaSealingByChoice-cassetteBase-krotOperationalBase-iglaBase` | кассета, исправные KROT и IGLA на базе; Аша у клапана; вода 87:20; `KROT[OPERATIONAL/MOBILE/BASE/ONLINE/ACTIVE]`; `LAYOUT-TERMINAL`; Марина, Рем | Аша осталась добровольно; клапан герметизируется; KROT исправен | работа 40 мин; нет; нет |
| `NRV05-P14` / `NRV05-PR14` / `EPILOGUE` / `w3060-b60-ashaBase-cassetteCrackedBase-krotOperationalImmobilizedPressureOnlineActive-iglaBase` | Аша, треснувшая кассета и IGLA на базе; вода 51 ч; `KROT[OPERATIONAL/IMMOBILIZED/PRESSURE_SHAFT/ONLINE/ACTIVE]`; `LAYOUT-TERMINAL`; Марина | KROT исправен, обездвижен разрушенной рамой и оставлен в шахте; телеметрия онлайн, маяк активен; из этих признаков следует техническая возможность отдельной попытки эвакуации, её успех не гарантирован; кассета добавила 36 ч | ручной выход 60 мин; нет; нет |
| `NRV05-P15` / `NRV05-PR15` / `EPILOGUE` / `w3060-b60-ashaBase-cassetteCrackedBase-krotOperationalBase-iglaLostBrine` | Аша, кассета и KROT на базе; IGLA lost в рассоле; вода 51 ч; `KROT[OPERATIONAL/MOBILE/BASE/ONLINE/ACTIVE]`; `LAYOUT-TERMINAL`; Марина | IGLA потеряна, не оставлена; кассета добавила 36 ч | ручной выход 60 мин; нет; нет |
| `NRV05-P16` / `NRV05-PR16` / `EPILOGUE` / `w3060-b60-ashaBase-cassetteCrackedBase-krotOperationalBase-iglaStrandedPlatform` | Аша, кассета и KROT на базе; IGLA оставлена на площадке; вода 51 ч; `KROT[OPERATIONAL/MOBILE/BASE/ONLINE/ACTIVE]`; `LAYOUT-TERMINAL`; Марина | IGLA не потеряна, но недоступна; кассета добавила 36 ч | ручной выход 60 мин; нет; нет |
| `NRV05-P17` / `NRV05-PR17` / `EPILOGUE` / `w3060-b60-ashaBase-cassetteCrackedBase-krotOperationalBase-iglaWithRem` | Аша, кассета и KROT на базе; IGLA у Рема без заряда; вода 51 ч; `KROT[OPERATIONAL/MOBILE/BASE/ONLINE/ACTIVE]`; `LAYOUT-TERMINAL`; Марина, Рем | IGLA не потеряна и не в шахте; кассета добавила 36 ч | ручной выход 60 мин; нет; нет |
| `NRV05-P18` / `NRV05-PR18` / `EPILOGUE` / `w5250-b90-ashaBase-cassetteBase-krotOperationalBase-iglaBase-bypassPlan` | Аша, кассета, исправные KROT и IGLA на базе; вода 87:30; `KROT[OPERATIONAL/MOBILE/BASE/ONLINE/ACTIVE]`; `LAYOUT-TERMINAL`; Марина, Рем | KROT исправен; план обхода передан Рему; кассета добавила 72 ч | обход 30 мин; нет; нет |
| `NRV05-P19` / `NRV05-PR19` / `EPILOGUE` / `w5250-b90-ashaBase-cassetteBase-krotOperationalBase-iglaLowBatteryBase-ladderPlan` | Аша, кассета и KROT на базе; IGLA с малым зарядом на базе; вода 87:30; `KROT[OPERATIONAL/MOBILE/BASE/ONLINE/ACTIVE]`; `LAYOUT-TERMINAL`; Марина, Рем | координаты лестницы переданы; кассета добавила 72 ч | лестница 30 мин; нет; нет |

Все per-packet поля определены в реестре. P10 содержит две причинные истории,
но одно физическое состояние и один terminal packet.
