# NARRATIVE_SCENE_PACKETS — нормативный PublicScenePacket contract

## Версии, canonical IDs и defaults

Все 19 записей используют `scenarioVersion=v0.4.0-n1` и
`contentVersion=v0.4.0-n1-draft.3`. Канонические IDs: `NRV04-P01`…`NRV04-P19`
и `NRV04-PR01`…`NRV04-PR19`. Короткие `P01`…`P19` и `PR01`…`PR19` — aliases,
объявленные один раз здесь: `P01…P19 = NRV04-P01…NRV04-P19` попарно;
`PR01…PR19 = NRV04-PR01…NRV04-PR19` попарно.

### terminology defaults

Кассета — герметичный набор мембран; ниша — боковая камера Аши; рассол —
агрессивная жидкость; «база» означает КОНТУР. Игровые имена машин: KROT и IGLA.
В presentation не показываются служебные IDs, fingerprint или hidden state.

### styleConstraints defaults

Карта идёт до текста; не более семи узлов и трёх говорящих фигур; один абзац —
одно наблюдаемое изменение; цвет не единственный носитель смысла; нет enum,
score, авторской оценки или импровизации. `PRESSURE_SHAFT → EXIT` — два такта
одного presentation: результат риска, затем выбор на его основе.

## SceneLayoutRegistry

| `sceneLayoutId` | Узлы, связи, occupants, известные/закрытые маршруты, focus |
| --- | --- |
| `LAYOUT-CALL` | КОНТУР—верхний мостик—затвор; от затвора к нише Аши и кассете. Группа, KROT, IGLA на мостике; нижний проход закрыт затвором; focus=связь. |
| `LAYOUT-APPROACH` | КОНТУР—мостик—затвор—ниша/кассета; кромка и трос — два известных маршрута; focus=маршрут. |
| `LAYOUT-ANCHOR` | Мостик—KROT—затвор—ниша/площадка/кассета; сухой обход добавляется только в P06; focus=последствие якоря. |
| `LAYOUT-TETHER` | Мостик—трос—площадка—ниша/кассета; лестница и карта добавляются только в P09; focus=последствие троса. |
| `LAYOUT-TERMINAL` | КОНТУР, резервуар и одно точное место отсутствующей либо повреждённой фигуры; focus=фактическое последствие. |

## PacketRegistry

В каждой строке заданы все поля `PublicScenePacket`. Сокращения полей:
`fp=stateFingerprint`, `ws=publicWorldState`, `layout=sceneLayout`,
`chars=presentCharacters`, `facts=confirmedFacts`, `unknown=unresolvedQuestions`,
`prior=priorPublicConsequences`, `choices=availableChoices`,
`risk=optionalRiskPreview`, `term=terminology`, `style=styleConstraints`.
Во всех строках `term=defaults`, `style=defaults`.

| packetId / presentationId / sceneId / fp | ws; layout; chars | facts; unknown | prior; choices; risk |
| --- | --- | --- | --- |
| `NRV04-P01` / `NRV04-PR01` / `CALL` / `w1080-b240-ashaRadio-cassetteLocked-krotUpper-iglaUpper` | вода 18 ч, рассол 4 ч, Аша на радио, кассета locked, KROT/IGLA мостик; `LAYOUT-CALL`; Марина, Аша | Аша жива, кассета существует; выдержит ли затвор, успеют ли вывести Ашу и вынести кассету | initial; `KEEP_ASHA_ON_CHANNEL`, `VERIFY_CASSETTE_SEAL`; нет |
| `NRV04-P02` / `NRV04-PR02` / `APPROACH` / `w1080-b240-callAsha-cassetteUnverified-routeOpen` | вода 18 ч, рассол 4 ч, кассета непроверена; `LAYOUT-APPROACH`; Марина, Аша, Рем | Аша слышала группу; герметичность и цена целой кассеты неизвестны | голосовой резерв израсходован; `ANCHOR_WITH_KROT`, `TETHER_WITH_IGLA`; `2d6+0`, коррозия/трос, пара скрыта |
| `NRV04-P03` / `NRV04-PR03` / `APPROACH` / `w1080-b240-callSeal-cassetteVerified72-routeOpen` | вода 18 ч, рассол 4 ч, кассета verified; `LAYOUT-APPROACH`; Марина, Аша, Рем | целая кассета добавит 72 ч к остатку; выдержит ли маршрут | Аша была без голоса 4 мин; `ANCHOR_WITH_KROT`, `TETHER_WITH_IGLA`; `2d6+0`, коррозия/трос, пара скрыта |
| `NRV04-P04` / `NRV04-PR04` / `PRESSURE_SHAFT` / `w960-b120-anchor-krotDamagedNicheFlooding-cassetteReachable` | вода 16 ч, рассол 2 ч, KROT повреждён у кромки, ниша затапливается; `LAYOUT-ANCHOR`; Марина, Аша, Рем | кромка осыпалась; нельзя выполнить оба действия | маршрут=якорь; `PULL_ASHA_OUT`, `LOCK_CASSETTE_IN`; `2+3+0=5`, осложнение |
| `NRV04-P05` / `NRV04-PR05` / `PRESSURE_SHAFT` / `w960-b120-anchor-krotStranded-cassetteCracked-ashaPlatform` | вода 16 ч, рассол 2 ч, KROT заклинило, Аша на площадке, кассета треснула; `LAYOUT-ANCHOR`; Марина, Аша | кассета добавит 36 ч; освободится ли KROT без обвала | маршрут=якорь; `SAVE_DAMAGED_CASSETTE`, `FREE_KROT`; `3+4+0=7`, цена |
| `NRV04-P06` / `NRV04-PR06` / `PRESSURE_SHAFT` / `w960-b120-anchor-krotStrained-ashaSafe-cassetteSafe-bypassKnown` | вода 16 ч, рассол 2 ч, KROT под нагрузкой, Аша/кассета доступны, обход открыт; `LAYOUT-ANCHOR`; Марина, Аша, Рем | обход сухой; успеет ли «Каскад» | маршрут=якорь; `EVACUATE_THROUGH_BYPASS`, `SEAL_BYPASS_FOR_KASKAD`; `5+5+0=10`, преимущество |
| `NRV04-P07` / `NRV04-PR07` / `PRESSURE_SHAFT` / `w960-b120-tether-iglaHanging-ashaReachable-cassetteReachable` | вода 16 ч, рассол 2 ч, IGLA висит; `LAYOUT-TETHER`; Марина, Аша | лебёдка не удержит IGLA и ручной подъём вместе; выдержит ли трос | маршрут=трос; `CUT_IGLA_TETHER`, `HOLD_FOR_IGLA`; `2+3+0=5`, осложнение |
| `NRV04-P08` / `NRV04-PR08` / `PRESSURE_SHAFT` / `w960-b120-tether-iglaManipulatorDamaged-ashaSafe-cassetteSafe` | вода 16 ч, рассол 2 ч, IGLA на площадке с повреждённым манипулятором; `LAYOUT-TETHER`; Марина, Аша | IGLA не поднимет кассету; возможен возврат без кассеты | маршрут=трос; `RETURN_WITH_IGLA`, `LEAVE_IGLA_FOR_CASSETTE`; `3+4+0=7`, цена |
| `NRV04-P09` / `NRV04-PR09` / `PRESSURE_SHAFT` / `w960-b120-tether-iglaLowBattery-ashaSafe-cassetteSafe-dryLadderKnown` | вода 16 ч, рассол 2 ч, IGLA малый заряд, лестница/карта известны; `LAYOUT-TETHER`; Марина, Аша, Рем | лестница сухая; успеет ли IGLA передать карту | маршрут=трос; `TAKE_DRY_LADDER`, `SEND_IGLA_WITH_MAP`; `5+5+0=10`, преимущество |
| `NRV04-P10` / `NRV04-PR10` / `EPILOGUE` / `w900-b60-ashaBase-cassetteLost-krotDamagedBase-iglaBase-retreatOpen` | Аша, IGLA, повреждённый KROT на базе; кассета lost; вода 15 ч; `LAYOUT-TERMINAL`; Марина | отступление сохранило KROT; когда возможна новая попытка | выход 60 мин; нет; нет |
| `NRV04-P11` / `NRV04-PR11` / `EPILOGUE` / `w900-b60-ashaBase-cassetteLost-krotBase-iglaManipulatorDamagedBase-retreatOpen` | Аша, KROT, IGLA с повреждённым манипулятором на базе; вода 15 ч; `LAYOUT-TERMINAL`; Марина | отступление сохранило IGLA; нужен ремонт | выход 60 мин; нет; нет |
| `NRV04-P12` / `NRV04-PR12` / `EPILOGUE` / `w5250-b90-ashaFloodingNiche-cassetteBase-krotDamagedBase-iglaBase` | кассета, KROT повреждённый, IGLA на базе; Аша в затапливаемой нише; вода 87:30; `LAYOUT-TERMINAL`; Марина, Рем | кассета добавила 72 ч; ниша продолжает затапливаться | подъём 30 мин; нет; нет |
| `NRV04-P13` / `NRV04-PR13` / `EPILOGUE` / `w5240-b80-ashaSealingByChoice-cassetteBase-krotStrainedBase-iglaBase` | кассета, KROT с нагрузочным повреждением, IGLA на базе; Аша у клапана; вода 87:20; `LAYOUT-TERMINAL`; Марина, Рем | Аша осталась добровольно; клапан герметизируется | работа 40 мин; нет; нет |
| `NRV04-P14` / `NRV04-PR14` / `EPILOGUE` / `w3060-b60-ashaBase-cassetteCrackedBase-krotStranded-iglaBase` | Аша, треснувшая кассета, IGLA на базе; KROT на кромке; вода 51 ч; `LAYOUT-TERMINAL`; Марина | кассета добавила 36 ч; KROT оставлен | ручной выход 60 мин; нет; нет |
| `NRV04-P15` / `NRV04-PR15` / `EPILOGUE` / `w3060-b60-ashaBase-cassetteCrackedBase-krotBase-iglaLostBrine` | Аша, треснувшая кассета, KROT на базе; IGLA lost в рассоле; вода 51 ч; `LAYOUT-TERMINAL`; Марина | IGLA потеряна, не оставлена; кассета добавила 36 ч | ручной выход 60 мин; нет; нет |
| `NRV04-P16` / `NRV04-PR16` / `EPILOGUE` / `w3060-b60-ashaBase-cassetteCrackedBase-krotBase-iglaStrandedPlatform` | Аша, треснувшая кассета, KROT база; IGLA оставлена на площадке; вода 51 ч; `LAYOUT-TERMINAL`; Марина | IGLA не потеряна, но недоступна; кассета добавила 36 ч | ручной выход 60 мин; нет; нет |
| `NRV04-P17` / `NRV04-PR17` / `EPILOGUE` / `w3060-b60-ashaBase-cassetteCrackedBase-krotBase-iglaWithRem` | Аша, треснувшая кассета, KROT база; IGLA у Рема без заряда; вода 51 ч; `LAYOUT-TERMINAL`; Марина, Рем | IGLA не потеряна и не в шахте; кассета добавила 36 ч | ручной выход 60 мин; нет; нет |
| `NRV04-P18` / `NRV04-PR18` / `EPILOGUE` / `w5250-b90-ashaBase-cassetteBase-krotStrainedBase-iglaBase-bypassPlan` | Аша, кассета, IGLA и KROT с нагрузочным повреждением на базе; вода 87:30; `LAYOUT-TERMINAL`; Марина, Рем | план обхода передан Рему; кассета добавила 72 ч | обход 30 мин; нет; нет |
| `NRV04-P19` / `NRV04-PR19` / `EPILOGUE` / `w5250-b90-ashaBase-cassetteBase-krotBase-iglaLowBatteryBase-ladderPlan` | Аша, кассета, KROT, IGLA с малым зарядом на базе; вода 87:30; `LAYOUT-TERMINAL`; Марина, Рем | координаты лестницы переданы; кассета добавила 72 ч | лестница 30 мин; нет; нет |

Все per-packet поля определены в PacketRegistry; общие `terminology` и
`styleConstraints` применяются к каждой строке явно через `defaults`.
