import test from "node:test";
import assert from "node:assert/strict";
import { PACKETS, RISK_CASES, advanceSession, isTerminal, playerText, resolveTransition } from "../scenario.js";

const risks = Object.keys(RISK_CASES);
const first = ["KEEP_ASHA_ON_CHANNEL", "VERIFY_CASSETTE_SEAL"];
const routes = ["ANCHOR_WITH_KROT", "TETHER_WITH_IGLA"];
const expectedTerminal = {
  "NRV04-P10": ["PEOPLE_OVER_FILTER", "повреждён, база", "база", "база", "потеряна", 900],
  "NRV04-P11": ["PEOPLE_OVER_FILTER", "база", "повреждённый манипулятор, база", "база", "потеряна", 900],
  "NRV04-P12": ["FILTER_WITH_DEBT", "повреждён, база", "база", "затапливаемая ниша", "база, исправна", 5250],
  "NRV04-P13": ["FILTER_WITH_DEBT", "нагрузочное повреждение, база", "база", "добровольно у клапана", "база, исправна", 5240],
  "NRV04-P14": ["COSTLY_WATER", "оставлен на кромке", "база", "база", "база, 36 ч", 3060],
  "NRV04-P15": ["COSTLY_WATER", "база", "потеряна в рассоле", "база", "база, 36 ч", 3060],
  "NRV04-P16": ["COSTLY_WATER", "база", "оставлена на площадке", "база", "база, 36 ч", 3060],
  "NRV04-P17": ["COSTLY_WATER", "база", "у Рема, без заряда", "база", "база, 36 ч", 3060],
  "NRV04-P18": ["SHARED_BYPASS", "нагрузочное повреждение, база", "база", "база", "база, исправна", 5250],
  "NRV04-P19": ["SHARED_BYPASS", "база", "малый заряд, база", "база", "база, исправна", 5250],
};

function allPaths() {
  const result=[];
  for (const firstChoice of first) {
    const firstPacket=resolveTransition("NRV04-P01",firstChoice);
    for (const route of routes) for (const riskCase of risks) {
      const outcome=resolveTransition(firstPacket,route,riskCase);
      for (const finalChoice of PACKETS[outcome].choices) result.push({ firstChoice, firstPacket, route, riskCase, outcome, finalChoice:finalChoice.id, terminal:resolveTransition(outcome,finalChoice.id) });
    }
  }
  return result;
}

test("two first choices, two routes, three cases and two final choices create 24 unique full paths", () => {
  const paths=allPaths();
  assert.equal(first.length,2); assert.equal(routes.length,2); assert.equal(risks.length,3);
  assert.equal(paths.length,24);
  assert.equal(new Set(paths.map((p)=>[p.firstChoice,p.route,p.riskCase,p.finalChoice].join("|"))).size,24);
  assert(paths.every((p)=>isTerminal(p.terminal)));
  assert(paths.every((p)=>/^NRV04-P1[0-9]$/.test(p.terminal)));
  assert(paths.every((p)=>Object.keys(RISK_CASES).includes(p.riskCase)));
});

test("P03 plus tether and HIGH resolves through P09", () => {
  assert.equal(resolveTransition("NRV04-P03","TETHER_WITH_IGLA","HIGH"),"NRV04-P09");
});

test("all 19 packets are reachable and references resolve", () => {
  const reached=new Set(["NRV04-P01"]);
  for (const path of allPaths()) [path.firstPacket,path.outcome,path.terminal].forEach((id)=>reached.add(id));
  assert.equal(reached.size,19);
  for (const [id,data] of Object.entries(PACKETS)) {
    assert.match(id,/^NRV04-P(0[1-9]|1[0-9])$/);
    assert.equal(data.presentationId, id.replace("-P","-PR"));
    if (!isTerminal(id)) for (const item of data.choices) assert.doesNotThrow(()=>resolveTransition(id,item.id,"LOW"));
  }
});

test("terminal water and physical state match PathAudit", () => {
  for (const [id,values] of Object.entries(expectedTerminal)) {
    const state=PACKETS[id].terminal;
    assert.deepEqual([state.family,state.krot,state.igla,state.asha,state.cassette,state.waterMinutes],values);
  }
});

test("player-visible text contains no raw IDs", () => {
  const forbidden=["KEEP_ASHA_ON_CHANNEL","VERIFY_CASSETTE_SEAL","ANCHOR_WITH_KROT","TETHER_WITH_IGLA","FREE_KROT","NRV04-P","NRV04-PR","PEOPLE_OVER_FILTER","COSTLY_WATER"];
  for (const id of Object.keys(PACKETS)) for (const token of forbidden) assert.equal(playerText(id).includes(token),false,`${id} leaked ${token}`);
});

test("session state cannot choose the previous option twice", () => {
  const initial={packetId:"NRV04-P01",riskCase:"LOW",history:[]};
  const advanced=advanceSession(initial,"KEEP_ASHA_ON_CHANNEL");
  assert.equal(advanced.packetId,"NRV04-P02");
  assert.throws(()=>advanceSession({...advanced,packetId:"NRV04-P01"},"VERIFY_CASSETTE_SEAL"),/Предыдущий выбор/);
});
