/*
 * Reactions > Patterns: the reactions cut by reagent and family, with the rule, the exceptions, cover mode and a test per pattern.
 *   node tests/e2e/patterns.cjs   (DEXIE_FILE as in the other suites)
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
  await p.goto(url);
  await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0);
  await p.waitForTimeout(600);
  const A = (fn, arg) => p.evaluate(fn, arg);
  const click = async (sel) => { await A((s) => document.querySelector(s)?.click(), sel); await p.waitForTimeout(250); };
  const noScroll = async (label) => {
    const m = await A(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
    ok(m.sh <= m.ih + 1 && m.sw <= m.iw + 1, `${label}: the page does not scroll (${m.sw}x${m.sh} in ${m.iw}x${m.ih})`);
  };

  await click('.tabbar [data-nav="reactions"]');
  await click('[data-rx-tab="patterns"]');
  const n = await A(() => document.querySelectorAll('[data-rx-pattern]').length);
  ok(n >= 8, `the Patterns tab lists ${n} patterns`);
  ok(await A(() => document.querySelectorAll('[data-rx-pattern] sub').length) > 20, 'equations are typeset');
  ok(await A(() => /exception/.test(document.querySelector('#rxPatternsBody').textContent)), 'exceptions are flagged');
  await noScroll('Patterns tab (phone)');

  // reagent chips filter
  const chips = await A(() => [...document.querySelectorAll('[data-rx-reagent]')].map((x) => x.dataset.rxReagent));
  ok(chips[0] === 'ALL' && ['O₂', 'H₂O', 'F₂', 'Cl₂'].every((x) => chips.includes(x)), `reagent chips (${chips.join(' ')})`);
  await A(() => document.querySelector('[data-rx-reagent="F₂"]').click()); await p.waitForTimeout(200);
  const f = await A(() => [...document.querySelectorAll('[data-rx-pattern]')].map((x) => x.dataset.rxPattern));
  ok(f.length >= 1 && f.length < n && f.includes('pat-f2'), `the F₂ chip narrows to ${f.length}`);
  await click('[data-rx-reagent="ALL"]');

  // cover: rule and products hidden, tap to reveal
  await click('#rxCover');
  ok(await A(() => !document.querySelector('[data-rx-pat-text]')) , 'Cover hides every rule');
  const before = await A(() => document.querySelector('[data-rx-pattern="pat-o2"] li').textContent);
  await A(() => document.querySelector('[data-rx-pattern="pat-o2"] [data-rx-pat-rule]').click()); await p.waitForTimeout(150);
  ok(await A(() => /Li₂O/.test(document.querySelector('[data-rx-pattern="pat-o2"] [data-rx-pat-text]').textContent)), 'tapping the rule box shows the rule');
  await A(() => document.querySelector('[data-rx-pattern="pat-o2"] li').click()); await p.waitForTimeout(150);
  const after = await A(() => document.querySelector('[data-rx-pattern="pat-o2"] li').textContent);
  ok(after.length > before.length, 'tapping a row shows its products');
  await click('#rxCover');

  // test a pattern: a session of its rows as write-the-equation cards
  await click('[data-rx-pat-test="pat-o2"]');
  ok(await A(() => document.querySelector('[data-rx-card]')?.dataset.rxCard) === 'write', 'Test starts write-the-equation cards');
  const want = await A(() => window.__MASTERY_ENGINE__.UI.appState.rx.session.queue.length);
  ok(want === 8, `one card per row (${want})`);
  const eq = await A(() => { const a = window.__MASTERY_ENGINE__.UI.appState; const s = a.rx.session; return a.reactions.reactions.find((r) => r.id === s.card.rid).eq; });
  if (eq) { await p.fill('#rxAnswer', eq); await click('#rxCheck'); ok(await A(() => /Correct/.test(document.querySelector('[data-rx-verdict]').textContent)), 'the model equation is marked correct'); }
  await click('#rxStop');
  await click('#rxBack');

  // predict the exception: options show reactants only, the answer breaks the rule, a miss is explained and recorded against the exception
  await click('[data-rx-tab="patterns"]');
  const nExc = await A(() => window.__MASTERY_ENGINE__.UI.appState.reactions.exceptions.length);
  ok(nExc >= 5 && /Predict the exception/.test(await A(() => document.querySelector('[data-rx-exc="ALL"]').textContent)), `the Patterns tab offers Predict the exception (${nExc})`);
  ok(await A(() => !!document.querySelector('[data-rx-pattern="pat-halide-h2o"] [data-rx-exc="pat-halide-h2o"]')), 'a pattern with exceptions has its own button');
  await click('[data-rx-exc="ALL"]');
  ok(await A(() => document.querySelector('[data-rx-card]')?.dataset.rxCard) === 'exc', 'it opens exception cards');
  const first = await A(() => { const a = window.__MASTERY_ENGINE__.UI.appState, s = a.rx.session; return { n: s.queue.length, answer: s.card.answer, opts: s.card.options, ids: [...document.querySelectorAll('[data-rx-choose]')].map((x) => x.dataset.rxChoose), hasProducts: /→\s*[A-Za-z0-9]/.test(document.querySelector('[data-rx-card]').textContent) }; });
  ok(first.n === nExc && first.ids.length >= 3 && first.ids.includes(first.answer), `a session has one card per exception (${first.n}) with ${first.ids.length} options`);
  ok(!first.hasProducts, 'the options show reactants only');
  const wrong = first.ids.find((x) => x !== first.answer);
  await click(`[data-rx-choose="${wrong}"]`);
  ok(/Not quite/.test(await A(() => document.querySelector('[data-rx-verdict]').textContent)) && await A(() => document.querySelectorAll('[data-rx-choose] sub').length) > 0, 'a wrong pick says so and then reveals every equation');
  ok(await A((id) => window.__MASTERY_ENGINE__.UI.appState.rxStats[id]?.miss === 1, first.answer), 'the miss is recorded against the exception reaction');
  await click('#rxNext');
  const second = await A(() => { const s = window.__MASTERY_ENGINE__.UI.appState.rx.session; return s.card.answer; });
  await click(`[data-rx-choose="${second}"]`);
  ok(/Correct/.test(await A(() => document.querySelector('[data-rx-verdict]').textContent)), 'the right pick is Correct');
  await click('#rxStop'); await click('#rxBack');

  await p.setViewportSize({ width: 1280, height: 800 }); await p.waitForTimeout(300);
  await click('[data-rx-tab="patterns"]');
  await noScroll('Patterns tab (laptop)');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\npatterns ok');
  process.exit(fails ? 1 : 0);
})();
