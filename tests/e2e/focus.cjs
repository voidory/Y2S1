/*
 * Focus sets: the Plan tab lists skill bundles that cut across topics (CM2021: Tanabe-Sugano, named processes, ...), a Drill button
 * serves only those questions with a strip, the Topic dropdown offers the same sets, and End returns to the normal queue.
 * Also: the CM2021 final-style paper on the Mock tab.
 * node tests/e2e/focus.cjs   (DEXIE_FILE as in the other suites)
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
  const url = `http://127.0.0.1:${srv.address().port}/index.html`;
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  await p.goto(url); await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await p.waitForTimeout(600);
  const A = (fn, arg) => p.evaluate(fn, arg);
  const noScroll = async (label) => {
    const m = await A(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
    ok(m.sh <= m.ih + 1 && m.sw <= m.iw + 1, `${label}: the page does not scroll (${m.sw}x${m.sh} in ${m.iw}x${m.ih})`);
  };
  await p.selectOption('#moduleSwitch', 'CM2021'); await p.waitForTimeout(900);

  // 1. the Plan tab lists the sets
  await p.click('.tabbar [data-nav="readiness"]'); await p.waitForTimeout(350);
  const rows = await A(() => [...document.querySelectorAll('[data-focus-row]')].map((r) => r.dataset.focusRow));
  ok(rows.includes('ts') && rows.includes('processes') && rows.length >= 8, `the Plan tab lists the focus sets (${rows.join(', ')})`);
  const tsText = await A(() => document.querySelector('[data-focus-row="ts"]').textContent.replace(/\s+/g, ' '));
  ok(/Tanabe/.test(tsText) && /\d+ q · \d+ unseen · 0 to fix/.test(tsText), `a row shows its size and state (${tsText.slice(0, 120)})`);

  // 2. drilling one serves only its questions, with a strip
  const want = await A(() => { const E = window.__MASTERY_ENGINE__, a = E.UI.appState; return E.Content.focusNodeIds(a.skillMap, a.focusSets.CM2021.sets.find((s) => s.id === 'ts')); });
  await p.click('[data-focus-start="CM2021|ts"]'); await p.waitForTimeout(500);
  ok(await p.$('[data-focus-strip]') !== null, 'the focus strip appears');
  ok(/Tanabe/.test(await A(() => document.querySelector('[data-focus-strip]').textContent)), 'it names the set');
  await noScroll('study with the focus strip');
  const served = new Set(); let allIn = true;
  for (let i = 0; i < 8; i++) {
    const id = await A(() => window.__MASTERY_ENGINE__.UI.appState.current.node.id);
    served.add(id); if (!want.includes(id)) allIn = false;
    await A(() => document.querySelector('#btnSkipNode').click()); await p.waitForTimeout(250);
  }
  ok(allIn, `every card came from the set (${served.size} different of ${want.length})`);

  // 3. the Topic dropdown offers the sets; picking another set switches
  await A(() => document.querySelector('[data-open-sheet="filters"]').click()); await p.waitForTimeout(300);
  const hasOpt = await A(() => !!document.querySelector('#studyChunkFilter option[value="set:processes"]'));
  ok(hasOpt, 'the Topic dropdown has a Focus sets group');
  await p.selectOption('#studyChunkFilter', 'set:processes').catch(() => {}); await p.waitForTimeout(400);
  ok(await A(() => window.__MASTERY_ENGINE__.UI.appState.filters.focusId) === 'processes', 'choosing a set from the dropdown switches to it');
  ok(await A(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return a.filters.chunkNodeIds.includes(a.current.node.id); }), 'and the question shown belongs to it');

  // 4. End returns to the normal queue
  await A(() => document.querySelector('#btnFocusOff').click()); await p.waitForTimeout(400);
  ok(await p.$('[data-focus-strip]') === null, 'End closes the focus set');
  ok(await A(() => !window.__MASTERY_ENGINE__.UI.appState.filters.focusId), 'the filter is cleared');

  // 4b. "Draw it on paper": only draw-then-compare variants, and they fit the screen
  await p.click('.tabbar [data-nav="readiness"]'); await p.waitForTimeout(350);
  await p.click('[data-focus-start="CM2021|draw"]'); await p.waitForTimeout(500);
  let allDraw = true, kinds = new Set();
  for (let i = 0; i < 6; i++) {
    const r = await A(() => { const v = window.__MASTERY_ENGINE__.UI.appState.current.inst.variant; return { draw: Boolean(v.drawOnPaperThenCompare), id: v.variantId }; });
    if (!r.draw) allDraw = false; kinds.add(r.id);
    await noScroll(`draw card ${r.id}`);
    await A(() => document.querySelector('#btnSkipNode').click()); await p.waitForTimeout(250);
  }
  ok(allDraw, `the Draw it on paper set serves only draw variants (${[...kinds].join(', ')})`);
  await A(() => document.querySelector('#btnFocusOff').click()); await p.waitForTimeout(300);

  // 5. the CM2021 final-style paper
  await p.click('.tabbar [data-nav="mock"]').catch(() => {}); await p.waitForTimeout(350);
  const hasPaper = await p.$('#btnStartFinalPaper');
  ok(hasPaper !== null, 'the Mock tab offers a final-style paper for CM2021');
  if (hasPaper) {
    ok(/4 questions, about 100 marks, 120 min/.test(await A(() => document.querySelector('#btnStartFinalPaper').parentElement.textContent.replace(/\s+/g, ' '))), 'it says 4 questions, about 100 marks, 120 min');
    await A(() => document.querySelector('#btnStartFinalPaper').click()); await p.waitForTimeout(700);
    const paper = await A(() => { const m = window.__MASTERY_ENGINE__.UI.appState.mock; const q = m?.paper?.questions || m?.questions || []; return { n: q.length, total: m?.paper?.totalMarks ?? null }; });
    ok(paper.n >= 15, `the paper has ${paper.n} parts${paper.total ? ` and ${paper.total} marks` : ''}`);
  }

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nfocus ok');
  process.exit(fails ? 1 : 0);
})();
