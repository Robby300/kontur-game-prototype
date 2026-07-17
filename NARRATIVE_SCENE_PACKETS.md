# NARRATIVE_SCENE_PACKETS — PublicScenePacket v0.4

Все записи: `scenarioVersion=v0.4.0-n1`, `contentVersion=v0.4.0-n1-draft.2`.
`stateFingerprint` построен только из публичного состояния и не показывается
участнику. Значения в `availableChoices` — служебные ID для ведущего.

## Рабочие пакеты

| Packet | Presentation | State fingerprint | Публичное состояние и выборы |
| --- | --- | --- | --- |
| P01 | PR01 | `w1080-b240-ashaRadio-cassetteLocked-krotUpper-iglaUpper` | Вода 18 ч; рассол 4 ч; Аша на радио, кассета за затвором. `KEEP_ASHA_ON_CHANNEL`, `VERIFY_CASSETTE_SEAL`. |
| P02 | PR02 | `w1080-b240-callAsha-cassetteUnverified-routeOpen` | Аша слышала группу; герметичность неизвестна. Известная цена целой кассеты пока не подтверждена. `ANCHOR_WITH_KROT`, `TETHER_WITH_IGLA`. |
| P03 | PR03 | `w1080-b240-callSeal-cassetteVerified72-routeOpen` | Герметичность подтверждена: целая кассета добавит 72 ч к остатку. Аша четыре минуты была без голоса группы. `ANCHOR_WITH_KROT`, `TETHER_WITH_IGLA`. |
| P04 | PR04 | `w960-b120-anchor-krotDamagedNicheFlooding-cassetteReachable` | Вода 16 ч; рассол 2 ч; KROT повреждён и держит кромку; ниша Аши затапливается. `PULL_ASHA_OUT`, `LOCK_CASSETTE_IN`. |
| P05 | PR05 | `w960-b120-anchor-krotStranded-cassetteCracked-ashaPlatform` | Вода 16 ч; рассол 2 ч; KROT заклинило на кромке; Аша на площадке; кассета треснула. `SAVE_DAMAGED_CASSETTE`, `FREE_KROT`. |
| P06 | PR06 | `w960-b120-anchor-krotStrained-ashaSafe-cassetteSafe-bypassKnown` | Вода 16 ч; рассол 2 ч; KROT под нагрузкой; Аша и кассета доступны; найден сухой обход. `EVACUATE_THROUGH_BYPASS`, `SEAL_BYPASS_FOR_KASKAD`. |
| P07 | PR07 | `w960-b120-tether-iglaHanging-ashaReachable-cassetteReachable` | Вода 16 ч; рассол 2 ч; IGLA висит над рассолом; Аша и кассета доступны. `CUT_IGLA_TETHER`, `HOLD_FOR_IGLA`. |
| P08 | PR08 | `w960-b120-tether-iglaManipulatorDamaged-ashaSafe-cassetteSafe` | Вода 16 ч; рассол 2 ч; IGLA на площадке, манипулятор повреждён; Аша и кассета доступны. `RETURN_WITH_IGLA`, `LEAVE_IGLA_FOR_CASSETTE`. |
| P09 | PR09 | `w960-b120-tether-iglaLowBattery-ashaSafe-cassetteSafe-dryLadderKnown` | Вода 16 ч; рассол 2 ч; IGLA на площадке с малым зарядом; найдены лестница и карта. `TAKE_DRY_LADDER`, `SEND_IGLA_WITH_MAP`. |

P02 и P03 сохраняют разную улику первого выбора: только P03 подтверждает
формулу `remaining + 72 hours` для целой кассеты. Это отражается в известной
цене маршрута и причинной сводке, не только в реплике.

## Terminal packets

| Packet | Family | Presentation | State fingerprint | Одно точное публичное состояние |
| --- | --- | --- | --- | --- |
| P10 | `PEOPLE_OVER_FILTER` | PR10 | `w900-b60-ashaBase-cassetteLost-krotDamagedBase-iglaBase-retreatOpen` | Аша на базе; кассета потеряна; вода 15 ч; KROT повреждён на базе, IGLA на базе. Новая попытка возможна после пополнения. |
| P11 | `PEOPLE_OVER_FILTER` | PR11 | `w900-b60-ashaBase-cassetteLost-krotBase-iglaManipulatorDamagedBase-retreatOpen` | Аша на базе; кассета потеряна; вода 15 ч; KROT на базе, IGLA на базе с повреждённым манипулятором. Новая попытка возможна после ремонта. |
| P12 | `FILTER_WITH_DEBT` | PR12 | `w5250-b90-ashaFloodingNiche-cassetteBase-krotDamagedBase-iglaBase` | Кассета на базе; вода 87 ч 30 мин; Аша остаётся в затапливаемой нише на аварийной связи; KROT повреждён на базе. |
| P13 | `FILTER_WITH_DEBT` | PR13 | `w5240-b80-ashaSealingByChoice-cassetteBase-krotStrainedBase-iglaBase` | Кассета на базе; вода 87 ч 20 мин; Аша добровольно ведёт герметизацию у клапана; KROT с нагрузочным повреждением на базе. |
| P14 | `COSTLY_WATER` | PR14 | `w3060-b60-ashaBase-cassetteCrackedBase-krotStranded-iglaBase` | Аша и треснувшая кассета на базе; вода 51 ч; KROT оставлен на кромке, IGLA на базе. |
| P15 | `COSTLY_WATER` | PR15 | `w3060-b60-ashaBase-cassetteCrackedBase-krotBase-iglaLostBrine` | Аша и треснувшая кассета на базе; вода 51 ч; KROT на базе; IGLA потеряна в рассоле. |
| P16 | `COSTLY_WATER` | PR16 | `w3060-b60-ashaBase-cassetteCrackedBase-krotBase-iglaStrandedPlatform` | Аша и треснувшая кассета на базе; вода 51 ч; KROT на базе; IGLA оставлена на площадке шахты. |
| P17 | `COSTLY_WATER` | PR17 | `w3060-b60-ashaBase-cassetteCrackedBase-krotBase-iglaWithRem` | Аша и треснувшая кассета на базе; вода 51 ч; KROT на базе; IGLA находится у Рема с картой клапанов. |
| P18 | `SHARED_BYPASS` | PR18 | `w5250-b90-ashaBase-cassetteBase-krotStrainedBase-iglaBase-bypassPlan` | Аша и кассета на базе; вода 87 ч 30 мин; KROT с нагрузочным повреждением на базе, IGLA на базе; Рем получил план обхода. |
| P19 | `SHARED_BYPASS` | PR19 | `w5250-b90-ashaBase-cassetteBase-krotBase-iglaLowBatteryBase-ladderPlan` | Аша и кассета на базе; вода 87 ч 30 мин; KROT на базе, IGLA на базе с малым зарядом; Рем получил координаты лестницы. |

Терминалы не содержат альтернатив через «либо»: потеря, оставление, нахождение
у Рема, повреждение KROT, повреждение IGLA, затапливаемая Аша и Аша у клапана
разделены физически.
