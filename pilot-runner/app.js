import {
  DEBRIEF,
  INTRO,
  PACKETS,
  QUESTIONS,
  advanceReveal,
  advanceSession,
  buildReport,
  choicesRevealed,
  isTerminal,
  terminalCause,
} from "./scenario.js";
import { VISUAL_HEIGHT, VISUAL_WIDTH, visualAssetFor, visualModeFromSearch } from "./visual.js";

const STORAGE_KEY = "kontur-narrative-v05-w2-runner";
const root = document.querySelector("#app");
const params = new URLSearchParams(location.search);
const queryCase = params.get("case")?.toUpperCase();
const visualMode = visualModeFromSearch(location.search);

function randomCase() {
  const list = ["LOW", "MID", "HIGH"];
  return list[crypto.getRandomValues(new Uint32Array(1))[0] % list.length];
}

function load() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function save(state) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function resetView() {
  root.replaceChildren();
  root.focus();
}

function currentMap(state, data) {
  if (!data.beats.length) return data.map;
  const safeAt = state.packetId === "NRV05-P05" ? 6 : 2;
  if (state.revealStep >= safeAt) return data.map;
  const routeStep = state.history.at(-1);
  return PACKETS[routeStep?.packetId]?.map ?? data.map;
}

function currentWater(state, data) {
  if (!data.beats.length) return data.water;
  const safeAt = state.packetId === "NRV05-P05" ? 6 : 2;
  if (state.revealStep >= safeAt) return data.water;
  const routeStep = state.history.at(-1);
  return PACKETS[routeStep?.packetId]?.water ?? data.water;
}

function appendSceneMedia(container, state, data) {
  const map = currentMap(state, data);
  if (!visualMode) {
    container.append(el("pre", map, "text-map"));
    return;
  }

  const asset = visualAssetFor(state.packetId, state.revealStep);
  if (asset) {
    const figure = el("figure", null, "scene-visual");
    const image = document.createElement("img");
    image.src = asset.src;
    image.alt = asset.alt;
    image.width = VISUAL_WIDTH;
    image.height = VISUAL_HEIGHT;
    image.loading = asset.loading;
    image.decoding = "async";
    figure.append(image);
    if (asset.caption) figure.append(el("figcaption", asset.caption));
    container.append(figure);
  } else {
    const text = data.beats.length && state.revealStep < (state.packetId === "NRV05-P05" ? 4 : 2)
      ? "Наблюдаемое последствие ещё не раскрыто."
      : "Для этой сцены отдельный визуальный кадр не подготовлен.";
    container.append(el("p", text, "visual-placeholder notice"));
  }

  const details = el("details", null, "scene-map");
  details.open = matchMedia("(min-width: 780px)").matches;
  details.append(el("summary", "Текстовая схема сцены"), el("pre", map, "text-map"));
  container.append(details);
}

function appendStatuses(container, data, revealStep = Number.POSITIVE_INFINITY) {
  if (!data.statuses) return;
  const grid = el("section", null, "status-grid");
  grid.setAttribute("aria-label", "Наблюдаемые состояния");
  if (revealStep >= 6 || data.terminal) {
    const krot = el("div", null, "status-card");
    krot.append(el("h3", "KROT"));
    data.statuses.krot.forEach((status) => krot.append(el("span", status, "status-tag")));
    grid.append(krot);
  }
  if (revealStep >= 4 || data.terminal) {
    const cassette = el("div", null, "status-card cassette-status");
    cassette.append(el("h3", "Кассета"));
    data.statuses.cassette.forEach((status) => cassette.append(el("span", status, "status-tag")));
    grid.append(cassette);
  }
  if (grid.childElementCount) container.append(grid);
}

function start() {
  const previous = load();
  const forced = ["LOW", "MID", "HIGH"].includes(queryCase) ? queryCase : null;
  save({
    startedAt: new Date().toISOString(),
    riskCase: forced ?? randomCase(),
    packetId: "NRV05-P01",
    revealStep: 0,
    introSeen: false,
    history: [],
    restarted: Boolean(previous),
    answers: {},
    visualMode,
  });
  render();
}

function choose(choiceId, buttons) {
  const state = load();
  if (!state || isTerminal(state.packetId) || !choicesRevealed(state)) return;
  buttons.forEach((button) => { button.disabled = true; });
  const next = advanceSession(state, choiceId);
  save(next);
  render();
}

function revealNext() {
  const state = load();
  if (!state || isTerminal(state.packetId)) return;
  save(advanceReveal(state));
  render();
}

function renderStart() {
  resetView();
  const box = el("section", null, "panel");
  box.append(
    el("h1", "КОНТУР — Тихий резервуар"),
    el("p", "Короткая текстовая игра о решениях во время аварийной экспедиции."),
    el("p", "Прохождение обычно занимает 15–30 минут. Ответы сохраняются только в этом браузере и никуда автоматически не отправляются.", "notice"),
  );
  const button = el("button", "Я согласен(на) и хочу начать", "primary");
  button.addEventListener("click", start);
  box.append(button);
  root.append(box);
}

function appendIntro(container, state) {
  if (state.introSeen) return;
  const intro = el("section", null, "intro");
  intro.append(el("h2", "До аварии"));
  INTRO.paragraphs.forEach((paragraph) => intro.append(el("p", paragraph)));
  container.append(intro);
  save({ ...state, introSeen: true });
}

function appendChoices(container, data) {
  const choices = el("div", null, "choices");
  const buttons = [];
  data.choices.forEach((item, index) => {
    const button = el("button", `${index + 1}. ${item.label} — ${item.consequence}`);
    button.addEventListener("click", () => choose(item.id, buttons));
    buttons.push(button);
    choices.append(button);
  });
  container.append(choices);
}

function renderReveal(container, state, data) {
  if (state.revealStep === 0) {
    container.append(el("p", "Маршрут зафиксирован. Бросок ещё не раскрыт.", "pending-result"));
  } else {
    data.beats.slice(0, state.revealStep).forEach((beat, index) => {
      const block = el("section", null, index === 0 ? "reveal-beat dice-result" : "reveal-beat");
      beat.forEach((line) => block.append(el("p", line)));
      container.append(block);
    });
    appendStatuses(container, data, state.revealStep);
  }

  if (!choicesRevealed(state)) {
    const label = state.revealStep === 0 ? "Показать бросок 2d6" : "Продолжить";
    const button = el("button", label, "primary continue");
    button.addEventListener("click", revealNext);
    container.append(button);
  } else {
    appendChoices(container, data);
  }
}

function render() {
  const state = load();
  if (!state) return renderStart();
  if (isTerminal(state.packetId)) {
    if (state.reportShown) return renderReport(state);
    if (state.debriefShown) return renderDebrief(state);
    return renderTerminal(state);
  }

  resetView();
  const data = PACKETS[state.packetId];
  root.append(el("div", currentWater(state, data), "panel water"));
  const scene = el("article", null, `panel${state.packetId === "NRV05-P05" && state.revealStep >= 3 ? " accident" : ""}`);
  scene.append(el("h1", "Тихий резервуар"));
  appendIntro(scene, state);
  scene.append(el("h2", data.beats.length ? "Результат маршрута" : "Текущая сцена"));
  appendSceneMedia(scene, state, data);
  if (data.beats.length) {
    renderReveal(scene, state, data);
  } else {
    data.body.forEach((line) => scene.append(el("p", line)));
    appendChoices(scene, data);
  }
  root.append(scene);
}

function renderTerminal(savedState) {
  let state = savedState;
  if (!state.endedAt) {
    save({ ...state, endedAt: new Date().toISOString() });
    state = load();
  }
  resetView();
  const data = PACKETS[state.packetId];
  const box = el("article", null, "panel terminal");
  box.append(el("div", data.water, "panel water"), el("h1", "Итог"));
  if (data.causes) box.append(el("p", data.causes[terminalCause(state)], "cause-line"));
  appendSceneMedia(box, state, data);
  data.body.forEach((line) => box.append(el("p", line)));
  appendStatuses(box, data);
  box.append(el("h2", "Вопросы после прохождения"));

  const areas = [];
  QUESTIONS.forEach((question, index) => {
    const label = el("label", `${index + 1}. ${question}`);
    label.htmlFor = `answer-${index}`;
    const area = document.createElement("textarea");
    area.id = `answer-${index}`;
    area.value = state.answers[index] ?? "";
    area.addEventListener("input", () => {
      const latest = load();
      save({ ...latest, answers: { ...latest.answers, [index]: area.value } });
    });
    areas.push(area);
    box.append(label, area);
  });

  const error = el("p", "Ответьте на все 13 вопросов, чтобы перейти к разбору теста.", "notice");
  error.id = "answers-error";
  error.setAttribute("role", "alert");
  error.hidden = true;
  areas.forEach((area) => area.setAttribute("aria-describedby", error.id));

  const actions = el("div", null, "choices");
  const finish = el("button", "Завершить ответы", "primary");
  finish.addEventListener("click", () => {
    const latest = load();
    const emptyIndex = QUESTIONS.findIndex((_, index) => !latest.answers[index]?.trim());
    if (emptyIndex >= 0) {
      error.hidden = false;
      areas[emptyIndex].focus();
      return;
    }
    save({ ...latest, debriefShown: true });
    renderDebrief(load());
  });
  const again = el("button", "Начать заново", "danger");
  again.addEventListener("click", () => {
    if (confirm("Текущая сессия будет заменена. Продолжить?")) start();
  });
  actions.append(finish, again);
  box.append(error, actions);
  root.append(box);
}

function renderDebrief(state) {
  resetView();
  const box = el("section", null, "panel");
  box.append(el("h1", "Как работали кубики"), el("p", DEBRIEF, "notice"));
  const show = el("button", "Показать отчёт", "primary");
  show.addEventListener("click", () => {
    const latest = load();
    save({ ...latest, reportShown: true });
    renderReport(load());
  });
  box.append(show);
  root.append(box);
}

function renderReport(state) {
  resetView();
  const text = buildReport(state, navigator.userAgent);
  const box = el("section", null, "panel");
  box.append(
    el("h1", "Локальный отчёт"),
    el("p", "Отчёт существует только в этом браузере, пока вы сами не скопируете или не скачаете его.", "notice"),
    el("pre", text, "report"),
  );
  const actions = el("div", null, "choices");
  const copy = el("button", "Скопировать отчёт", "primary");
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(text);
    copy.textContent = "Отчёт скопирован";
  });
  const download = el("button", "Скачать отчёт .txt");
  download.addEventListener("click", () => {
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    anchor.download = "kontur-tihiy-rezervuar-report.txt";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  });
  const again = el("button", "Начать заново", "danger");
  again.addEventListener("click", () => {
    if (confirm("Текущая сессия будет заменена. Продолжить?")) start();
  });
  actions.append(copy, download, again);
  box.append(actions);
  root.append(box);
}

render();
