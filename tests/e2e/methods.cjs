/*
 * "How to do this" pages: a missed question offers its topic's page, the page opens full screen with the named slip on top,
 * closes with the button or Escape, CM2021 pages carry the "not from your slides" flag, and the Weak spots topic card offers it.
 * Needs a browser:  node tests/e2e/methods.cjs   (set DEXIE_FILE to a local dexie@4.0.10/dist/dexie.mjs if unpkg is blocked)
 */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..', '..');
const dexie = process.env.DEXIE_FILE ? fs.readFileSync(process.env.DEXIE_FILE, 'utf8') : null;
const srv = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'Content-Type': f.endsWith('.json') ? 'application/json' : f.endsWith('.html') ? 'text/html' : 'text/plain' });
  fs.createReadStream(f).pipe(r);
});
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) fails++; };
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
  await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
  await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0);
  await p.waitForTimeout(500);
  const force = async (id) => {
    await p.evaluate(async (nodeId) => { const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; delete a.reviewMap[nodeId]; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: nodeId }; await UI.loadNextQuestion(); }, id);
    await p.waitForTimeout(500);
  };
  const submitWrong = async (useSlip) => {
    await p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]')?.click());
    await p.evaluate((val) => { const c = window.__MASTERY_ENGINE__.UI.appState.current; const t = c.inst.variant.evaluator.targets || {}; c.userInput = Object.fromEntries(Object.keys(t).map((k) => [k, k === 'D' && val != null ? String(c.inst.scope.K) : '12345'])); }, useSlip ? 1 : null);
    await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(600);
  };

  // CM2011: a missed extraction question
  await p.selectOption('#moduleSwitch', 'CM2011'); await p.waitForTimeout(900);
  await force('bk-m11-x-acid');
  await p.evaluate(async () => { const { UI } = window.__MASTERY_ENGINE__; let g = 0; while (UI.appState.current.inst.variant.variantId !== 'x-acid-chain' && g++ < 30) { delete UI.appState.reviewMap['bk-m11-x-acid']; await UI.loadNextQuestion(); } });
  await submitWrong(true);
  ok(await p.evaluate(() => !!document.querySelector('#btnMethod')), 'a missed question offers "How to do this"');
  await p.evaluate(() => document.querySelector('#btnMethod').click()); await p.waitForTimeout(500);
  const ov = await p.evaluate(() => { const o = document.querySelector('#methodOverlay'); if (!o) return null; const r = o.firstElementChild.getBoundingClientRect(); return { title: o.querySelector('[data-method-title]').textContent, h: [...o.querySelectorAll('[data-method-h]')].map((x) => x.textContent), flag: !!o.querySelector('[data-method-flag]'), full: r.width >= innerWidth - 2 && r.height >= innerHeight - 2, raw: /\*\*|<sub>|\$\$/.test(o.querySelector('[data-method-body]').innerText) }; });
  ok(ov && /Extraction/.test(ov.title), `the page opens for the topic (${ov && ov.title})`);
  ok(ov && ov.h.includes('Steps') && ov.h.includes('Traps'), 'it has Use it when, Steps and Traps');
  ok(ov && ov.full, 'it fills the phone screen');
  ok(ov && !ov.flag, 'a CM2011 page carries no "not from your slides" flag');
  ok(ov && !ov.raw, 'no raw markdown or tags show');
  ok(await p.evaluate(() => !!document.querySelector('[data-method-hit]')), 'the slip you made is named at the top');
  ok(await p.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), 'the page behind does not scroll');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !document.querySelector('#methodOverlay')), 'Escape closes it');
  await p.evaluate(() => document.querySelector('#btnMethod').click()); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('#methodOverlay [data-method-close]:last-of-type').click()); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !document.querySelector('#methodOverlay')), 'the Back to practice button closes it');

  // CM2021: flagged
  await p.selectOption('#moduleSwitch', 'CM2021'); await p.waitForTimeout(900);
  await force('bk-c8-spin-only');
  await submitWrong();
  ok(await p.evaluate(() => !!document.querySelector('#btnMethod')), 'a CM2021 miss offers the page too');
  await p.evaluate(() => document.querySelector('#btnMethod').click()); await p.waitForTimeout(400);
  ok(await p.evaluate(() => /slides/.test((document.querySelector('[data-method-flag]') || document.querySelector('[data-method-checked]'))?.textContent || '')), 'a CM2021 page says whether it was checked against your slides');
  await p.keyboard.press('Escape');

  // a topic with no page offers nothing
  const bare = await p.evaluate(() => { const { UI, Weakness, Content } = window.__MASTERY_ENGINE__; const a = UI.appState; const n = a.nodes.find((x) => { const c = Weakness.chunksOf(a.skillMap, x.id)[0]; return c && !Content.methodForChunk(a.methods.CM2021, c) && x.variants.every((v) => v.inputSlot.type === 'mapped_fields' || v.inputSlot.type === 'typed_short'); }); return n ? n.id : null; });
  ok(!!bare, `found a CM2021 question in a topic without a page (${bare})`);
  if (bare) {
    await force(bare);
    await p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]')?.click());
    await p.evaluate(() => { const c = window.__MASTERY_ENGINE__.UI.appState.current; const v = c.inst.variant; c.userInput = v.inputSlot.type === 'typed_short' ? '999' : Object.fromEntries(Object.keys(v.evaluator.targets || {}).map((k) => [k, '999'])); });
    await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(600);
    ok(await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current.phase === 'graded' && !document.querySelector('#btnMethod')), 'a topic with no page shows no button');
  }

  // Weak spots card
  await p.selectOption('#moduleSwitch', 'CM2011'); await p.waitForTimeout(900);
  await p.evaluate(async () => {
    const { UI, DB } = window.__MASTERY_ENGINE__; const a = UI.appState; const db = await DB.init();
    const ids = a.nodes.filter((n) => /bk-m11-x-/.test(n.id)).slice(0, 4).map((n) => n.id);
    let t = Date.now();
    for (const id of ids) for (let i = 0; i < 2; i++) { const l = { nodeId: id, variantId: 'v', timestamp: t++, normalizedGrade: 0, passed: false, errorTags: [], missedSkillTags: [] }; a.masteryLogs.push({ nodeId: id, variantId: 'v', timestamp: l.timestamp, normalizedGrade: 0 }); }
    a.route = 'readiness'; a.ui.readinessTab = 'weak'; UI.render();
  });
  await p.waitForTimeout(500);
  const wk = await p.evaluate(() => ({ n: document.querySelectorAll('[data-weak-method]').length }));
  ok(wk.n >= 1, `the Weak spots topic card offers the page (${wk.n})`);
  if (wk.n) { await p.evaluate(() => document.querySelector('[data-weak-method]').click()); await p.waitForTimeout(300); ok(await p.evaluate(() => !!document.querySelector('#methodOverlay')), 'it opens from Weak spots'); }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  console.log(fails ? `\n${fails} FAILED` : '\nall method-page checks ok');
  await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})();
