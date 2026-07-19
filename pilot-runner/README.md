# Pilot runner — «Тихий резервуар»

Автономный исследовательский web-runner причинной постановки W2 для frozen
narrative v0.5. Он не является production-игрой, Telegram Mini App или заменой
владельческого теста.

Запуск без зависимостей:

```bash
cd pilot-runner
python3 -m http.server 8080
```

Откройте `http://localhost:8080`. Runner использует
`runnerVersion=v0.5.0-w2-draft.2`, `scenarioVersion=v0.5.0-w1` и
`contentVersion=v0.5.0-w1-draft.2`. Для технической проверки риска используйте
`?case=low`, `?case=mid` или `?case=high`. Без параметра case назначается
один раз через Web Crypto и сохраняется в `sessionStorage` до завершения либо
явного перезапуска.

Необязательный visual mode включается только точным параметром `?visual=1`.
Без параметра, при `?visual=0` и неизвестном значении runner остаётся текстовым.
Изображения дополняют текстовую схему и не меняют решений или исходов.

Проверки:

```bash
node --test tests/scenario.test.mjs
```

Runner не отправляет данные в сеть. Отчёт копируется или скачивается только по
явному действию участника.
