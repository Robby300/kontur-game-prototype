import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CHROMIUM = process.env.CHROMIUM_BIN ?? "/snap/bin/chromium";
const RUNNER_ROOT = fileURLToPath(new URL("../", import.meta.url));
const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://127.0.0.1");
      const relative = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      const path = join(RUNNER_ROOT, relative);
      if (!path.startsWith(RUNNER_ROOT)) {
        response.writeHead(403).end();
        return;
      }
      const content = await readFile(path);
      response.writeHead(200, { "content-type": MIME[extname(path)] ?? "application/octet-stream" });
      response.end(content);
    } catch {
      response.writeHead(404).end();
    }
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve({
      server,
      origin: `http://127.0.0.1:${server.address().port}`,
    }));
  });
}

function devtoolsUrl(process) {
  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error(`Chromium DevTools timeout: ${output}`)), 10_000);
    process.stderr.setEncoding("utf8");
    process.stderr.on("data", (chunk) => {
      output += chunk;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
    process.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Chromium exited before DevTools was ready: ${code}\n${output}`));
    });
  });
}

async function pageWebSocketUrl(browserUrl) {
  const endpoint = new URL(browserUrl);
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const targets = await fetch(`http://${endpoint.host}/json/list`).then((response) => response.json());
    const page = targets.find((target) => target.type === "page");
    if (page) return page.webSocketDebuggerUrl;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Chromium page target was not created");
}

async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  return {
    close: () => socket.close(),
    send(method, params = {}) {
      sequence += 1;
      const id = sequence;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
  };
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(client, expression, message) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate(client, expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(message);
}

async function click(client, selector, index = 0) {
  const clicked = await evaluate(client, `(() => {
    const element = document.querySelectorAll(${JSON.stringify(selector)})[${index}];
    if (!element) return false;
    element.click();
    return true;
  })()`);
  assert.equal(clicked, true, `${selector}[${index}] must be clickable`);
}

async function enterP05(client, origin, visualMode) {
  await evaluate(client, "sessionStorage.clear()");
  await client.send("Page.navigate", { url: `${origin}/?case=mid&visual=${visualMode ? 1 : 0}` });
  await waitFor(client, "document.readyState === 'complete' && Boolean(document.querySelector('button.primary'))", "start screen did not load");
  await click(client, "button.primary");
  await click(client, ".choices button", 0);
  await click(client, ".choices button", 0);
  await waitFor(client, "Boolean(document.querySelector('.continue'))", "P05 did not load");
}

async function advanceToStep(client, step) {
  await click(client, ".continue");
  await waitFor(client, `Boolean(document.querySelector('[data-reveal-step="${step}"]'))`, `reveal step ${step} did not load`);
}

async function visualP05Smoke(client, origin, viewport) {
  await client.send("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1, mobile: viewport.width < 780 });
  await client.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await enterP05(client, origin, true);
  for (let step = 1; step <= 4; step += 1) await advanceToStep(client, step);
  assert.equal(await evaluate(client, "document.querySelectorAll('img').length"), 0, "step 4 must not contain the P05 image");

  await advanceToStep(client, 5);
  const stepFive = await evaluate(client, `(() => {
    const beat5 = document.querySelector('[data-reveal-step="5"]');
    const figure = document.querySelector('[data-crisis-visual="true"]');
    const image = figure?.querySelector('img');
    const rect = image?.getBoundingClientRect();
    return {
      imageCount: document.querySelectorAll('img').length,
      directlyAfterBeat5: beat5?.nextElementSibling === figure,
      beforeBeat6: !document.querySelector('[data-reveal-step="6"]'),
      focused: document.activeElement === figure,
      tabIndex: figure?.tabIndex,
      imageInViewport: Boolean(rect && rect.top >= 0 && rect.bottom <= innerHeight),
      noOverflow: document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth,
    };
  })()`);
  assert.deepEqual(stepFive, {
    imageCount: 1,
    directlyAfterBeat5: true,
    beforeBeat6: true,
    focused: true,
    tabIndex: -1,
    imageInViewport: true,
    noOverflow: true,
  });

  await client.send("Page.reload");
  await waitFor(client, "document.querySelectorAll('[data-crisis-visual=\"true\"] img').length === 1", "step 5 refresh did not restore the image");
  assert.equal(await evaluate(client, `(() => {
    const beat5 = document.querySelector('[data-reveal-step="5"]');
    return beat5?.nextElementSibling === document.querySelector('[data-crisis-visual="true"]');
  })()`), true, "refresh must preserve the beat 5 -> image order");

  await advanceToStep(client, 6);
  assert.deepEqual(await evaluate(client, `({
    imageCount: document.querySelectorAll('img').length,
    imageBeforeBeat6: Boolean(document.querySelector('[data-crisis-visual="true"]')?.compareDocumentPosition(document.querySelector('[data-reveal-step="6"]')) & Node.DOCUMENT_POSITION_FOLLOWING),
    beat6Focused: document.activeElement === document.querySelector('[data-reveal-step="6"]'),
  })`), { imageCount: 1, imageBeforeBeat6: true, beat6Focused: true });

  await advanceToStep(client, 7);
  const final = await evaluate(client, `(() => {
    const causalOrder = [...document.querySelector('article.panel').children]
      .filter((node) => node.matches('.reveal-beat, [data-crisis-visual="true"], .status-grid, .choices'))
      .map((node) => node.dataset.revealStep ? 'beat-' + node.dataset.revealStep
        : node.dataset.crisisVisual ? 'image'
          : node.classList.contains('status-grid') ? 'statuses' : 'choices');
    return {
      imageCount: document.querySelectorAll('img').length,
      causalOrder,
      firstChoiceFocused: document.activeElement === document.querySelector('.choices button'),
      noOverflow: document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth,
    };
  })()`);
  assert.deepEqual(final, {
    imageCount: 1,
    causalOrder: ["beat-1", "beat-2", "beat-3", "beat-4", "beat-5", "image", "beat-6", "beat-7", "statuses", "choices"],
    firstChoiceFocused: true,
    noOverflow: true,
  });

  await enterP05(client, origin, false);
  for (let step = 1; step <= 7; step += 1) await advanceToStep(client, step);
  assert.equal(await evaluate(client, "document.querySelectorAll('img').length"), 0, "text mode must not contain images");
  assert.equal(await evaluate(client, "document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth"), true, "text mode must not overflow horizontally");
}

test("P05 causal DOM order, focus and responsive viewport remain correct in Chromium", { timeout: 45_000 }, async (context) => {
  try {
    await access(CHROMIUM);
  } catch {
    context.skip(`Chromium not available at ${CHROMIUM}`);
    return;
  }

  const { server, origin } = await startServer();
  const profile = await mkdtemp(join(tmpdir(), "kontur-browser-smoke-"));
  const chromium = spawn(CHROMIUM, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    `${origin}/?case=mid&visual=1`,
  ], { stdio: ["ignore", "ignore", "pipe"] });

  let client;
  try {
    const browserUrl = await devtoolsUrl(chromium);
    client = await connect(await pageWebSocketUrl(browserUrl));
    await client.send("Runtime.enable");
    await client.send("Page.enable");
    await visualP05Smoke(client, origin, { width: 390, height: 844 });
    await visualP05Smoke(client, origin, { width: 1440, height: 900 });
  } finally {
    client?.close();
    chromium.kill("SIGTERM");
    await new Promise((resolve) => server.close(resolve));
    await rm(profile, { recursive: true, force: true });
  }
});
