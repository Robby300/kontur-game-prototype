# Pilot runner — «Тихий резервуар»

Автономный исследовательский web-runner для локального narrative-пилота. Он не
является production-игрой, Telegram Mini App или заменой NG1-теста.

Запуск без зависимостей:

```bash
cd pilot-runner
python3 -m http.server 8080
```

Откройте `http://localhost:8080`. Для технической проверки риска используйте
`?case=low`, `?case=mid` или `?case=high`. Без параметра case назначается
один раз через Web Crypto и сохраняется в `sessionStorage` до завершения либо
явного перезапуска.

Проверки:

```bash
node --test tests/scenario.test.mjs
```

Runner не отправляет данные в сеть. Отчёт копируется или скачивается только по
явному действию участника.
