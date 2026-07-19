import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  DEBRIEF,
  INTRO,
  KROT,
  PACKETS,
  QUESTIONS,
  RISK_CASES,
  advanceReveal,
  advanceSession,
  answersComplete,
  buildReport,
  choicesRevealed,
  contentVersion,
  isTerminal,
  playerText,
  recoveryPossible,
  revealedText,
  resolveTransition,
  runnerVersion,
  scenarioVersion,
  terminalCause,
} from "../scenario.js";
import {
  VISUAL_ASSETS,
  VISUAL_HEIGHT,
  VISUAL_WIDTH,
  visualAssetFor,
  visualModeFromSearch,
} from "../visual.js";

const presentationsSource = readFileSync(new URL("../../NARRATIVE_PRESENTATIONS_V05.md", import.meta.url), "utf8");
const protocolSource = readFileSync(new URL("../../NARRATIVE_TEST_PROTOCOL_V05.md", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const visualSource = readFileSync(new URL("../visual.js", import.meta.url), "utf8");
const htmlSource = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const normalize = (text) => text.replace(/\s+/g, " ").trim();

function normativePresentations() {
  const source = `${presentationsSource}\n## END`;
  const entries = [...source.matchAll(/^## (NRV05-PR\d{2})\n([\s\S]*?)(?=^## (?:NRV05-PR\d{2}|END))/gm)];
  return new Map(entries.map(([, id, section]) => {
    const visible = section
      .replace(/^```text\s*$/gm, "")
      .replace(/^```\s*$/gm, "")
      .replace(/^[12]\.\s+/gm, "");
    return [id, normalize(visible)];
  }));
}

const risks = Object.keys(RISK_CASES);
const firstChoices = ["KEEP_ASHA_ON_CHANNEL", "VERIFY_CASSETTE_SEAL"];
const routeChoices = ["ANCHOR_WITH_KROT", "TETHER_WITH_IGLA"];

function allPaths() {
  const paths = [];
  for (const firstChoice of firstChoices) {
    const approach = resolveTransition("NRV05-P01", firstChoice);
    for (const routeChoice of routeChoices) {
      for (const riskCase of risks) {
        const outcome = resolveTransition(approach, routeChoice, riskCase);
        for (const final of PACKETS[outcome].choices) {
          paths.push({
            firstChoice,
            approach,
            routeChoice,
            riskCase,
            outcome,
            finalChoice: final.id,
            terminal: resolveTransition(outcome, final.id),
          });
        }
      }
    }
  }
  return paths;
}

const expectedKrot = {
  "NRV05-P10": ["DAMAGED", "MOBILE", "BASE", "ONLINE", "ACTIVE"],
  "NRV05-P11": ["OPERATIONAL", "MOBILE", "BASE", "ONLINE", "ACTIVE"],
  "NRV05-P12": ["DAMAGED", "MOBILE", "BASE", "ONLINE", "ACTIVE"],
  "NRV05-P13": ["OPERATIONAL", "MOBILE", "BASE", "ONLINE", "ACTIVE"],
  "NRV05-P14": ["OPERATIONAL", "IMMOBILIZED", "PRESSURE_SHAFT", "ONLINE", "ACTIVE"],
  "NRV05-P15": ["OPERATIONAL", "MOBILE", "BASE", "ONLINE", "ACTIVE"],
  "NRV05-P16": ["OPERATIONAL", "MOBILE", "BASE", "ONLINE", "ACTIVE"],
  "NRV05-P17": ["OPERATIONAL", "MOBILE", "BASE", "ONLINE", "ACTIVE"],
  "NRV05-P18": ["OPERATIONAL", "MOBILE", "BASE", "ONLINE", "ACTIVE"],
  "NRV05-P19": ["OPERATIONAL", "MOBILE", "BASE", "ONLINE", "ACTIVE"],
};

const expectedTerminal = {
  "NRV05-P10": ["PEOPLE_OVER_FILTER", "база", "база", "потеряна", 900],
  "NRV05-P11": ["PEOPLE_OVER_FILTER", "повреждённый манипулятор, база", "база", "потеряна", 900],
  "NRV05-P12": ["FILTER_WITH_DEBT", "база", "затапливаемая ниша", "база, исправна", 5250],
  "NRV05-P13": ["FILTER_WITH_DEBT", "база", "добровольно у клапана", "база, исправна", 5240],
  "NRV05-P14": ["COSTLY_WATER", "база", "база", "база, 36 ч", 3060],
  "NRV05-P15": ["COSTLY_WATER", "потеряна в рассоле", "база", "база, 36 ч", 3060],
  "NRV05-P16": ["COSTLY_WATER", "оставлена на площадке", "база", "база, 36 ч", 3060],
  "NRV05-P17": ["COSTLY_WATER", "у Рема, без заряда", "база", "база, 36 ч", 3060],
  "NRV05-P18": ["SHARED_BYPASS", "база", "база", "база, исправна", 5250],
  "NRV05-P19": ["SHARED_BYPASS", "малый заряд, база", "база", "база, исправна", 5250],
};

function krotValues(state) {
  return [state.condition, state.mobility, state.location, state.telemetryStatus, state.beaconStatus];
}

test("runner keeps frozen W1 versions and adds an independent W2 runner version", () => {
  assert.equal(runnerVersion, "v0.5.0-w2-draft.1");
  assert.equal(scenarioVersion, "v0.5.0-w1");
  assert.equal(contentVersion, "v0.5.0-w1-draft.2");
  assert.match(appSource, /kontur-narrative-v05-w2-runner/);
  assert.doesNotMatch(appSource, /kontur-narrative-v04-runner/);
});

test("two first choices, two routes, three risk cases and two final choices create 24 unique paths", () => {
  const paths = allPaths();
  assert.equal(paths.length, 24);
  assert.equal(new Set(paths.map((path) => [path.firstChoice, path.routeChoice, path.riskCase, path.finalChoice].join("|"))).size, 24);
  assert(paths.every((path) => isTerminal(path.terminal)));
  assert(paths.every((path) => /^NRV05-P1[0-9]$/.test(path.terminal)));
  assert(paths.every((path) => Object.hasOwn(RISK_CASES, path.riskCase)));
});

test("all 19 packets and presentations are reachable, with exactly 10 terminal packets", () => {
  const reached = new Set(["NRV05-P01"]);
  for (const path of allPaths()) [path.approach, path.outcome, path.terminal].forEach((id) => reached.add(id));
  assert.equal(reached.size, 19);
  assert.equal(Object.keys(PACKETS).length, 19);
  assert.equal(new Set(Object.values(PACKETS).map((packet) => packet.presentationId)).size, 19);
  assert.equal(Object.values(PACKETS).filter((packet) => packet.terminal).length, 10);
  for (const [id, packet] of Object.entries(PACKETS)) {
    assert.match(id, /^NRV05-P(0[1-9]|1[0-9])$/);
    assert.equal(packet.presentationId, id.replace("-P", "-PR"));
  }
});

test("P03 plus tether and HIGH resolves through P09", () => {
  assert.equal(resolveTransition("NRV05-P03", "TETHER_WITH_IGLA", "HIGH"), "NRV05-P09");
});

test("each full path uses exactly one assigned risk case and one 2d6 result", () => {
  for (const path of allPaths()) {
    const risk = RISK_CASES[path.riskCase];
    assert.equal(risk.dice.length, 2);
    assert.equal(risk.dice[0] + risk.dice[1], risk.sum);
    assert.match(PACKETS[path.outcome].body[0], new RegExp(`${risk.dice[0]} \\+ ${risk.dice[1]} \\+ 0 = ${risk.sum}`));
  }
});

test("frozen participant presentations match PR01-PR09 and PR11-PR19 exactly", () => {
  const normative = normativePresentations();
  assert.equal(normative.size, 19);
  for (const packet of Object.values(PACKETS)) {
    if (packet.id === "NRV05-P10") continue;
    assert.equal(normalize(playerText(packet.id)), normative.get(packet.presentationId), packet.presentationId);
  }
});

test("NRV05 intro is exact, shown by app, and is not a packet or decision", () => {
  const match = presentationsSource.match(/^## NRV05-INTRO\n([\s\S]*?)\nПосле intro/m);
  assert(match);
  assert.equal(normalize(INTRO.paragraphs.join("\n")), normalize(match[1]));
  assert.equal(Object.hasOwn(PACKETS, INTRO.id), false);
  assert.equal(INTRO.paragraphs.some((text) => /\b[12]\.\s/.test(text)), false);
  assert.match(appSource, /appendIntro\(scene, state\)/);
  assert.match(appSource, /introSeen: false/);
});

test("terminal state matrix, water arithmetic and KROT fields match PathAudit", () => {
  for (const [id, expected] of Object.entries(expectedTerminal)) {
    const state = PACKETS[id].terminal;
    assert.deepEqual([state.family, state.igla, state.asha, state.cassette, state.waterMinutes], expected, id);
    assert.deepEqual(krotValues(state.krot), expectedKrot[id], id);
  }
  assert.equal(PACKETS["NRV05-P10"].terminal.waterMinutes, 900);
  assert.equal(PACKETS["NRV05-P14"].terminal.waterMinutes, 3060);
  assert.equal(PACKETS["NRV05-P13"].terminal.krot.condition, KROT.condition.OPERATIONAL);
  assert.equal(PACKETS["NRV05-P18"].terminal.krot.condition, KROT.condition.OPERATIONAL);
});

test("recoveryPossible is derived and never stored", () => {
  assert.equal(recoveryPossible(PACKETS["NRV05-P14"].terminal.krot), true);
  assert.equal(recoveryPossible(PACKETS["NRV05-P05"].krot), true);
  for (const packet of Object.values(PACKETS)) {
    assert.equal(Object.hasOwn(packet.krot, "recoveryPossible"), false);
    if (packet.terminal) assert.equal(Object.hasOwn(packet.terminal, "recoveryPossible"), false);
  }
  for (const id of ["NRV05-P10", "NRV05-P13", "NRV05-P18"]) assert.equal(recoveryPossible(PACKETS[id].krot), false);
});

test("P10 has two frozen causal histories and one physical terminal state", () => {
  const packet = PACKETS["NRV05-P10"];
  assert.deepEqual(Object.keys(packet.causes), ["LOW", "MID_EXTRACTION"]);
  const presentationWithoutQuotes = normalize(presentationsSource).replace(/[«»]/g, "");
  assert(presentationWithoutQuotes.includes(normalize(packet.causes.LOW)));
  assert(presentationWithoutQuotes.includes(normalize(packet.causes.MID_EXTRACTION)));
  const low = { packetId: "NRV05-P10", history: [{ packetId: "NRV05-P04", choiceId: "PULL_ASHA_OUT" }] };
  const mid = { packetId: "NRV05-P10", history: [{ packetId: "NRV05-P05", choiceId: "FREE_KROT" }] };
  assert.equal(terminalCause(low), "LOW");
  assert.equal(terminalCause(mid), "MID_EXTRACTION");
  assert.deepEqual(low.packetId, mid.packetId);
  assert.deepEqual(krotValues(packet.terminal.krot), expectedKrot[packet.id]);
  assert.notEqual(packet.causes.LOW, packet.causes.MID_EXTRACTION);
  const common = presentationsSource.match(/Затем в обоих случаях показать:\n([\s\S]*?)(?=^## NRV05-PR11)/m);
  assert(common);
  const normativeCommon = common[1].replace(/^```text\s*$/gm, "").replace(/^```\s*$/gm, "");
  assert.equal(normalize([packet.map, ...packet.body].join("\n")), normalize(normativeCommon));
});

test("PR05 reveals dice, consequences, states and dialogue in the frozen order", () => {
  const packet = PACKETS["NRV05-P05"];
  assert.equal(normalize(packet.beats.flat().join(" ")), normalize(packet.body.join(" ")));
  assert.equal(revealedText(packet.id, 0), "");
  assert.match(revealedText(packet.id, 1), /^Проверка: 3 \+ 4 \+ 0 = 7 — успех с ценой\.$/);
  assert.doesNotMatch(revealedText(packet.id, 1), /трес|разруш|зажат/iu);
  assert.match(revealedText(packet.id, 2), /KROT удерживает затвор\. Аша выходит на площадку\./);
  assert.match(revealedText(packet.id, 3), /направляющая обрушивается/);
  assert.doesNotMatch(revealedText(packet.id, 3), /36 часов|исправен|Телеметрия/);
  assert.match(revealedText(packet.id, 4), /36 часов вместо 72/);
  assert.doesNotMatch(revealedText(packet.id, 4), /исправен|Телеметрия/);
  assert.match(revealedText(packet.id, 5), /исправен[\s\S]*Хода нет/);
  assert.doesNotMatch(revealedText(packet.id, 5), /Телеметрия и маяк работают/);
  assert.match(revealedText(packet.id, 6), /Телеметрия и маяк работают/);
  assert.match(revealedText(packet.id, 7), /Нагрузка штатная[\s\S]*Мы ведь сможем вернуться/);
  assert.deepEqual(packet.statuses.krot, ["ИСПРАВЕН", "ОБЕЗДВИЖЕН", "В ШАХТЕ", "ТЕЛЕМЕТРИЯ РАБОТАЕТ", "МАЯК АКТИВЕН"]);
  assert.deepEqual(packet.statuses.cassette, ["ТРЕСНУЛА", "+36 ЧАСОВ"]);
});

test("all risk presentations use staged beats and choices stay locked until the final reveal", () => {
  for (const id of ["NRV05-P04", "NRV05-P05", "NRV05-P06", "NRV05-P07", "NRV05-P08", "NRV05-P09"]) {
    const packet = PACKETS[id];
    assert(packet.beats.length >= 2, id);
    assert.match(packet.beats[0][0], /^Проверка:/, id);
    const state = { packetId: id, riskCase: "MID", revealStep: 0, history: [] };
    assert.equal(choicesRevealed(state), false, id);
    assert.throws(() => advanceSession(state, packet.choices[0].id), /раскройте/, id);
    assert.equal(choicesRevealed({ ...state, revealStep: packet.beats.length }), true, id);
  }
});

test("revealStep survives serialization, never adds history and never changes risk", () => {
  const state = { packetId: "NRV05-P05", riskCase: "MID", revealStep: 2, history: [{ packetId: "NRV05-P02", choiceId: "ANCHOR_WITH_KROT" }] };
  const restored = JSON.parse(JSON.stringify(advanceReveal(state)));
  assert.equal(restored.revealStep, 3);
  assert.equal(restored.riskCase, "MID");
  assert.deepEqual(restored.history, state.history);
  assert.equal(restored.history.length, 1);
});

test("a packet choice cannot be submitted twice", () => {
  const initial = { packetId: "NRV05-P01", riskCase: "LOW", revealStep: 0, history: [] };
  const advanced = advanceSession(initial, "KEEP_ASHA_ON_CHANNEL");
  assert.equal(advanced.packetId, "NRV05-P02");
  assert.throws(() => advanceSession({ ...advanced, packetId: "NRV05-P01" }, "VERIFY_CASSETTE_SEAL"), /Предыдущий выбор/);
});

test("participant text and image alternatives contain no raw IDs or enum values", () => {
  const forbidden = /NRV05-|KEEP_ASHA|VERIFY_CASSETTE|ANCHOR_WITH|TETHER_WITH|PULL_ASHA|LOCK_CASSETTE|SAVE_DAMAGED|FREE_KROT|EVACUATE_|SEAL_BYPASS|CUT_IGLA|HOLD_FOR|RETURN_WITH|LEAVE_IGLA|TAKE_DRY|SEND_IGLA|PEOPLE_OVER_FILTER|FILTER_WITH_DEBT|COSTLY_WATER|SHARED_BYPASS|OPERATIONAL|DAMAGED|DESTROYED|MOBILE|IMMOBILIZED|UPPER_BRIDGE|PRESSURE_SHAFT|ONLINE|OFFLINE|ACTIVE|INACTIVE/;
  for (const packet of Object.values(PACKETS)) {
    if (packet.causes) {
      for (const cause of Object.keys(packet.causes)) assert.doesNotMatch(playerText(packet.id, cause), forbidden, `${packet.id}/${cause}`);
    } else {
      assert.doesNotMatch(playerText(packet.id), forbidden, packet.id);
    }
  }
  for (const asset of Object.values(VISUAL_ASSETS)) assert.doesNotMatch(asset.alt, forbidden);
});

test("exactly 13 protocol questions are required before the exact debrief", () => {
  assert.equal(QUESTIONS.length, 13);
  const normalizedProtocol = normalize(protocolSource);
  QUESTIONS.forEach((question, index) => assert(normalizedProtocol.includes(normalize(`${index + 1}. ${question}`)), question));
  assert(normalizedProtocol.replace(/> /g, "").includes(normalize(DEBRIEF)));
  const answers = Object.fromEntries(QUESTIONS.map((_, index) => [index, "ответ"]));
  assert.equal(answersComplete({ answers }), true);
  assert.equal(answersComplete({ answers: { ...answers, 12: "" } }), false);
});

test("local report contains versions, mode, one roll, three decisions, 13 answers and restart flag", () => {
  const answers = Object.fromEntries(QUESTIONS.map((_, index) => [index, `ответ ${index + 1}`]));
  const state = {
    startedAt: "2026-07-19T10:00:00.000Z",
    endedAt: "2026-07-19T10:01:30.000Z",
    riskCase: "MID",
    packetId: "NRV05-P14",
    visualMode: true,
    restarted: true,
    reportShown: true,
    answers,
    history: [
      { packetId: "NRV05-P01", choiceId: "KEEP_ASHA_ON_CHANNEL", label: "Оставить Ашу на голосовом канале" },
      { packetId: "NRV05-P02", choiceId: "ANCHOR_WITH_KROT", label: "Поставить KROT якорем" },
      { packetId: "NRV05-P05", choiceId: "SAVE_DAMAGED_CASSETTE", label: "Вынести треснувшую кассету" },
    ],
  };
  const report = buildReport(state, "test-agent");
  for (const line of [`runnerVersion: ${runnerVersion}`, `scenarioVersion: ${scenarioVersion}`, `contentVersion: ${contentVersion}`, "visualMode: on", "riskCase: MID (3 + 4)", "фактические кубики: 3 + 4", "длительность секунд: 90", "terminal packet: NRV05-P14", "перезапуск сессии: да"]) assert(report.includes(line), line);
  assert.equal((report.match(/^ответ \d+$/gm) ?? []).length, 13);
  assert.equal(state.history.length, 3);
  assert.doesNotMatch(report, /revealStep/);
});

test("visual mode is enabled only by exact visual=1", () => {
  assert.equal(visualModeFromSearch(""), false);
  assert.equal(visualModeFromSearch("?case=mid"), false);
  assert.equal(visualModeFromSearch("?visual=0"), false);
  assert.equal(visualModeFromSearch("?visual=true"), false);
  assert.equal(visualModeFromSearch("?visual=unknown"), false);
  assert.equal(visualModeFromSearch("?visual=1&case=mid"), true);
});

test("visual mapping uses only approved packets, exact dimensions and reveal gates", () => {
  assert.deepEqual(Object.keys(VISUAL_ASSETS), ["NRV05-P01", "NRV05-P02", "NRV05-P03", "NRV05-P05", "NRV05-P14"]);
  assert.deepEqual(Object.fromEntries(Object.entries(VISUAL_ASSETS).map(([id, item]) => [id, item.src])), {
    "NRV05-P01": "assets/visual-v1/01-opening-silent-reservoir.png",
    "NRV05-P02": "assets/visual-v1/02-route-choice.png",
    "NRV05-P03": "assets/visual-v1/02-route-choice.png",
    "NRV05-P05": "assets/visual-v1/03-krot-mid-crisis.png",
    "NRV05-P14": "assets/visual-v1/04-costly-water-epilogue.png",
  });
  assert.equal(VISUAL_WIDTH, 1672);
  assert.equal(VISUAL_HEIGHT, 941);
  assert.equal(visualAssetFor("NRV05-P05", 3), null);
  assert.equal(visualAssetFor("NRV05-P05", 4)?.src.endsWith("03-krot-mid-crisis.png"), true);
  assert.equal(visualAssetFor("NRV05-P14", 0)?.src.endsWith("04-costly-water-epilogue.png"), true);
  assert.match(VISUAL_ASSETS["NRV05-P02"].caption, /двух возможных маршрутов; ни один ещё не выбран/);
});

test("unmapped packets use a fallback and character sheet never enters the game flow", () => {
  for (const id of Object.keys(PACKETS).filter((packetId) => !VISUAL_ASSETS[packetId])) assert.equal(visualAssetFor(id), null, id);
  assert.match(appSource, /Для этой сцены отдельный визуальный кадр не подготовлен/);
  assert.match(appSource, /Текстовая схема сцены/);
  assert.doesNotMatch(visualSource, /character-sheet/);
  assert.doesNotMatch(appSource, /character-sheet/);
  assert.doesNotMatch(htmlSource, /character-sheet/);
  assert.doesNotThrow(() => readFileSync(new URL("../assets/visual-v1/character-sheet-asha-krot-igla.png", import.meta.url)));
});

test("copied PNG files preserve their approved SHA-256", () => {
  const expected = {
    "01-opening-silent-reservoir.png": "472d331a4d887cac3d2955d59a8e6eb51be2e72429d05c0cb552559f68cfc962",
    "02-route-choice.png": "89fadf28bcc12879ff7d036b3ead59d79179bfdfdcd5794685a929814e09dd1b",
    "03-krot-mid-crisis.png": "7f3eb4169dc73c4d1ca45ad20c244af531672f0a51fe60288e46a6fe84464bf1",
    "04-costly-water-epilogue.png": "4b5b0a58ba7e99b05b94ebde91fb34d8ae0c6151c19062937f6611704df9333b",
    "character-sheet-asha-krot-igla.png": "212e3eb1d5eb71bbc017f3162ebd3efa10df08503be0e2ac9d2d0852084e5071",
  };
  for (const [name, hash] of Object.entries(expected)) {
    const bytes = readFileSync(new URL(`../assets/visual-v1/${name}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), hash, name);
  }
});

test("runner contains no network API or automatic data submission", () => {
  const productionSource = [appSource, visualSource, readFileSync(new URL("../scenario.js", import.meta.url), "utf8")].join("\n");
  assert.doesNotMatch(productionSource, /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|\.submit\s*\(/);
  assert.match(appSource, /navigator\.clipboard\.writeText/);
  assert.match(appSource, /Скачать отчёт \.txt/);
});

test("default rendering remains textual and reduced motion is supported", () => {
  const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
  assert.match(appSource, /if \(!visualMode\)/);
  assert.match(appSource, /container\.append\(el\("pre", map, "text-map"\)\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-x: hidden/);
});
