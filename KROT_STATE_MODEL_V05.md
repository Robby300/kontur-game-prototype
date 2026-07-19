# KROT — модель состояния v0.5

**Версии:** `scenarioVersion=v0.5.0-w1`,
`contentVersion=v0.5.0-w1-draft.1`.
**Статус:** нормативная docs-only модель W1; реализация в коде не разрешена
этим документом.

## 1. Поля состояния

Состояние KROT является произведением независимых измерений:

```text
condition = OPERATIONAL | DAMAGED | DESTROYED
mobility = MOBILE | IMMOBILIZED
location = BASE | UPPER_BRIDGE | PRESSURE_SHAFT
telemetryStatus = ONLINE | OFFLINE
beaconStatus = ACTIVE | INACTIVE
```

| Поле | Смысл |
| --- | --- |
| `condition` | Физическая исправность систем машины |
| `mobility` | Может ли машина перемещаться своим ходом сейчас |
| `location` | Последнее подтверждённое физическое место |
| `telemetryStatus` | Получает ли КОНТУР текущие служебные данные |
| `beaconStatus` | Работает ли отдельный поисковый маяк |

`location` не кодирует повреждение, `mobility` не кодирует уничтожение, а
`condition` не сообщает, находится ли машина на базе.

## 2. Вычисляемое recoveryPossible

`recoveryPossible` не хранится. Для «Тихого резервуара» оно вычисляется так:

```text
recoveryPossible =
    condition != DESTROYED
    && mobility == IMMOBILIZED
    && location == PRESSURE_SHAFT
    && telemetryStatus == ONLINE
    && beaconStatus == ACTIVE
```

Значение `true` означает только, что известны состояние и местоположение машины
и существует техническая возможность спланировать отдельную эвакуационную
операцию. Оно не обещает, что операция будет доступна немедленно или завершится
успешно.

## 3. Инварианты

- `DESTROYED` несовместим с `MOBILE`.
- `DESTROYED` в этом сценарии не используется.
- `BASE` не означает автоматически `OPERATIONAL`.
- `PRESSURE_SHAFT` не означает автоматически `IMMOBILIZED`.
- `ONLINE` и `ACTIVE` — разные признаки: потеря телеметрии не обязана выключать
  автономный маяк, и наоборот.
- Participant presentation показывает естественные русские формулировки, а не
  raw enum values.

## 4. Нормативные состояния в W1

| Пакеты | condition | mobility | location | telemetryStatus | beaconStatus | recoveryPossible |
| --- | --- | --- | --- | --- | --- | --- |
| P01–P03 | `OPERATIONAL` | `MOBILE` | `UPPER_BRIDGE` | `ONLINE` | `ACTIVE` | `false` |
| P04 | `DAMAGED` | `MOBILE` | `PRESSURE_SHAFT` | `ONLINE` | `ACTIVE` | `false` |
| P05 | `OPERATIONAL` | `IMMOBILIZED` | `PRESSURE_SHAFT` | `ONLINE` | `ACTIVE` | `true` |
| P06 | `OPERATIONAL` | `MOBILE` | `PRESSURE_SHAFT` | `ONLINE` | `ACTIVE` | `false` |
| P07–P09 | `OPERATIONAL` | `MOBILE` | `UPPER_BRIDGE` | `ONLINE` | `ACTIVE` | `false` |
| P10 | `DAMAGED` | `MOBILE` | `BASE` | `ONLINE` | `ACTIVE` | `false` |
| P11 | `OPERATIONAL` | `MOBILE` | `BASE` | `ONLINE` | `ACTIVE` | `false` |
| P12 | `DAMAGED` | `MOBILE` | `BASE` | `ONLINE` | `ACTIVE` | `false` |
| P13 | `OPERATIONAL` | `MOBILE` | `BASE` | `ONLINE` | `ACTIVE` | `false` |
| P14 | `OPERATIONAL` | `IMMOBILIZED` | `PRESSURE_SHAFT` | `ONLINE` | `ACTIVE` | `true` |
| P15–P19 | `OPERATIONAL` | `MOBILE` | `BASE` | `ONLINE` | `ACTIVE` | `false` |

Короткие P01…P19 в таблице — aliases `NRV05-P01`…`NRV05-P19`.

## 5. Переходы KROT

| Событие | До | После |
| --- | --- | --- |
| Выбор якорного маршрута | исправен, мобилен, верхний мостик | состояние определяется `2d6` |
| LOW: удар разрушившейся направляющей | исправен, мобилен | повреждён, остаётся способен вернуться |
| MID: рама зажимает опоры | исправен, мобилен | исправен, обездвижен в шахте, связь и маяк работают |
| MID + `SAVE_DAMAGED_CASSETTE` | исправен, обездвижен в шахте | то же состояние; машина оставлена |
| MID + `FREE_KROT` | исправен, обездвижен в шахте | рама повреждает привод при извлечении; повреждён, мобилен, база |
| HIGH: сухой обход | исправен, мобилен | исправен, мобилен, база |

Слова «оставлен», «повреждён» и «уничтожен» не являются взаимозаменяемыми.
