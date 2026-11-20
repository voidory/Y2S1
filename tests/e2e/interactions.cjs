/*
 * Interactions: the sortable list (mouse and touch, animated), informative motion, the confidence tap and the slider figures.
 * Needs a browser:  node tests/e2e/interactions.cjs   (set DEXIE_FILE to a local dexie@4.0.10/dist/dexie.mjs if unpkg is blocked)
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
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const p = await ctx.newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
  await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
  await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0);
  await p.waitForTimeout(500);
  const force = async (id) => {
    await p.evaluate(async (nodeId) => { const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; delete a.reviewMap[nodeId]; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: nodeId }; await UI.loadNextQuestion(); }, id);
    await p.waitForTimeout(500);
    await p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]')?.click());
    await p.waitForTimeout(200);
  };
  const order = () => p.evaluate(() => [...document.querySelectorAll('#orderedListContainer [data-order-item]')].map((r) => r.dataset.orderItem));
  const centre = async (i, grip) => p.evaluate(([n, g]) => { const r = document.querySelectorAll('#orderedListContainer [data-order-item]')[n]; const t = g ? r.querySelector('[data-order-handle]') : r; const b = t.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, [i, grip]);

  // sortable, mouse
  await p.selectOption('#moduleSwitch', 'CM2011'); await p.waitForTimeout(800);
  await force('bk-m11-s-layout');
  const o0 = await order();
  ok(o0.length >= 4, `an ordering question is on screen (${o0.length} rows)`);
  ok(await p.evaluate(() => document.querySelectorAll('#orderedListContainer [data-order-handle]').length >= 4), 'each row has a grip');
  const a = await centre(0, false), z = await centre(o0.length - 1, false);
  await p.mouse.move(a.x, a.y); await p.mouse.down();
  await p.mouse.move(a.x, a.y + 20, { steps: 3 }); await p.waitForTimeout(60);
  ok(await p.evaluate(() => !!document.querySelector('#orderedListContainer .ord-lift') && getComputedStyle(document.querySelector('.ord-lift')).transform !== 'none'), 'the held row lifts and follows the pointer');
  await p.mouse.move(z.x, z.y + 6, { steps: 8 }); await p.waitForTimeout(260);
  ok(await p.evaluate(() => [...document.querySelectorAll('#orderedListContainer [data-order-item]')].slice(1).some((r) => /translateY\(-/.test(r.style.transform))), 'the other rows slide aside to open a gap');
  await p.mouse.up(); await p.waitForTimeout(450);
  const o1 = await order();
  ok(o1[o1.length - 1] === o0[0] && o1[0] === o0[1], `dropping at the bottom moves the first row to the end (${o0.join()} -> ${o1.join()})`);
  ok(await p.evaluate(() => [...document.querySelectorAll('#orderedListContainer [data-order-item]')].every((r) => !r.style.transform)), 'rows settle with no leftover transform');

  // buttons animate
  const before = await order();
  await p.evaluate(() => document.querySelectorAll('#orderedListContainer [data-order-move$=":1"]')[0].click());
  await p.waitForTimeout(40);
  ok(await p.evaluate(() => document.querySelectorAll('#orderedListContainer .ord-moving').length >= 1), 'the down button plays a slide');
  await p.waitForTimeout(400);
  const after = await order();
  ok(after[1] === before[0] && after[0] === before[1], 'and swaps the two rows');

  // sortable, touch (grip only)
  const cdp = await ctx.newCDPSession(p);
  const g0 = await centre(0, true), g2 = await centre(2, true);
  const t = (type, pt) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pt ? [{ x: pt.x, y: pt.y, id: 1 }] : [] });
  const pre = await order();
  await t('touchStart', g0);
  for (let k = 1; k <= 6; k++) { await t('touchMove', { x: g0.x, y: g0.y + (g2.y - g0.y + 8) * k / 6 }); await p.waitForTimeout(20); }
  await t('touchEnd'); await p.waitForTimeout(450);
  const post = await order();
  ok(post[2] === pre[0], `a finger on the grip drags a row (${pre.join(',')} -> ${post.join(',')})`);
  // touching the row body does not start a drag
  const body = await p.evaluate(() => { const r = document.querySelectorAll('#orderedListContainer [data-order-item]')[0]; const b = r.getBoundingClientRect(); return { x: b.x + b.width * 0.55, y: b.y + b.height / 2 }; });
  const pre2 = await order();
  await t('touchStart', body); await t('touchMove', { x: body.x, y: body.y + 60 }); await t('touchEnd'); await p.waitForTimeout(350);
  ok((await order()).join() === pre2.join(), 'touching the text does not drag (so the list can still scroll)');

  // graded: no grips, no drag
  await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.querySelectorAll('#orderedListContainer [data-order-handle]').length === 0), 'a graded list has no grips');

  // informative motion: a new card slides in; grading raises the verdict, counts the score up and moves the topic bar
  await p.selectOption('#moduleSwitch', 'CM2011'); await p.waitForTimeout(700);
  await force('bk-m11-x-acid');
  ok(await p.evaluate(() => !!document.querySelector('#appRoot > .anim-card-in')), 'a new card slides in');
  await p.evaluate(() => { const c = window.__MASTERY_ENGINE__.UI.appState.current; const t = c.inst.variant.evaluator.targets || {}; c.userInput = Object.fromEntries(Object.keys(t).map((k) => [k, '12345'])); });
  await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(80);
  ok(await p.evaluate(() => !!document.querySelector('[data-verdict].anim-verdict')), 'the verdict rises on grading');
  ok(await p.evaluate(() => document.querySelectorAll('.anim-bad').length >= 1), 'a wrong field shakes');
  await p.waitForTimeout(900);
  ok(await p.evaluate(() => { const n = document.querySelector('[data-countup]'); return n && n.textContent === n.dataset.countup + '%'; }), 'the score counts up to its value');
  ok(await p.evaluate(() => { const f = document.querySelector('[data-level-fill]'); return !!f && f.style.width === f.dataset.to + '%'; }), 'the topic bar moves to its new level');
  // confidence: tap, stored, noted, ranked
  await force('bk-m11-x-base');
  ok(await p.evaluate(() => document.querySelectorAll('[data-conf]').length === 3), 'three "how sure" chips sit above Submit');
  await p.evaluate(() => document.querySelector('[data-conf="sure"]').click());
  ok(await p.evaluate(() => document.querySelector('[data-conf="sure"]').getAttribute('aria-pressed') === 'true' && window.__MASTERY_ENGINE__.UI.appState.current.confidence === 'sure'), 'tapping a chip selects it');
  await p.evaluate(() => { const c = window.__MASTERY_ENGINE__.UI.appState.current; const t = c.inst.variant.evaluator.targets || {}; c.userInput = Object.fromEntries(Object.keys(t).map((k) => [k, '12345'])); });
  await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(700);
  ok(await p.evaluate(() => /sure, and it was wrong/i.test(document.querySelector('[data-conf-note]')?.textContent || '')), 'a sure miss is called out');
  const logged = await p.evaluate(() => { const l = window.__MASTERY_ENGINE__.UI.appState.attemptLogs[0]; return { c: l.confidence, t: l.errorTags }; });
  ok(logged.c === 'sure' && logged.t.includes('confident-miss'), `the attempt stores the confidence and the tag (${JSON.stringify(logged)})`);
  ok(await p.evaluate(() => { const r = window.__MASTERY_ENGINE__.UI.appState.session.retry.at(-1); const n = window.__MASTERY_ENGINE__.UI.appState.session.cards; return !!r && r.after - n <= 3; }), 'a sure miss comes back within 3 cards');
  await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; a.route = 'readiness'; a.ui.readinessTab = 'weak'; window.__MASTERY_ENGINE__.UI.render(); });
  await p.waitForTimeout(400);
  ok(await p.evaluate(() => /Sure but wrong/.test(document.querySelector('[data-sure-misses]')?.textContent || '')), 'Weak spots shows "sure but wrong" on the topic');

  // slider figures on the method sheets
  const figCase = async (mod, chunk, id) => {
    await p.selectOption('#moduleSwitch', mod); await p.waitForTimeout(700);
    await p.evaluate((c) => window.__MASTERY_ENGINE__.UI.showMethod(c), chunk); await p.waitForTimeout(250);
    ok(await p.evaluate((i) => !!document.querySelector(`#methodOverlay [data-fig="${i}"] svg path, #methodOverlay [data-fig="${i}"] svg rect`), id), `${id}: the sheet for ${chunk} shows the figure`);
    return p.evaluate((i) => { const f = document.querySelector(`#methodOverlay [data-fig="${i}"]`); return { read: () => f.querySelector('[data-fig-read]').innerText }; }, id).then(() => ({
      read: () => p.evaluate((i) => document.querySelector(`#methodOverlay [data-fig="${i}"] [data-fig-read]`).innerText, id),
      set: (k, v) => p.evaluate(([i, kk, vv]) => { const r = document.querySelector(`#methodOverlay [data-fig="${i}"] [data-fig-range="${kk}"]`); r.value = vv; r.dispatchEvent(new Event('input', { bubbles: true })); }, [id, k, v]),
      shot: (name) => p.locator(`#methodOverlay [data-fig="${id}"]`).screenshot({ path: name }),
    }));
  };
  let F = await figCase('CM2011', 'x-calc', 'extraction-ph');
  await F.set('K', 0.6); await F.set('pKa', 5); await F.set('pH', 5);
  ok(/D\s*1\.99|D\s*2\.0/.test((await F.read()).replace(/\n/g, ' ')) || /1\.99|1\.9\d|2\.0\d/.test(await F.read()), `at pH = pKa, D is about K/2 (${(await F.read()).replace(/\n/g, ' | ')})`);
  await F.set('pH', 9);
  ok(/0\.00/.test(await F.read()) || /D\s*[\d.]*\s*×/.test(await F.read()) || /(Neutral fraction\s*0\.[0-4])/.test(await F.read()), 'at high pH the acid is held in the water');
  F = await figCase('CM2011', 'c-concepts', 'van-deemter');
  const r0 = await F.read(); await F.set('B', 8);
  ok((await F.read()) !== r0, 'moving B moves the optimum read-out');
  F = await figCase('CM2011', 'c-calc', 'resolution');
  await F.set('alpha', 1.0);
  ok(/0\.00: poor/.test(await F.read()), 'alpha = 1 gives R_S = 0 (no separation)');
  await F.set('alpha', 1.4); await F.set('N', 20000); await F.set('kB', 6);
  ok(/baseline/.test(await F.read()), 'a good alpha, k and N reach baseline separation');
  F = await figCase('CM2011', 'p-calibration', 'calibration');
  ok(/Original sample/.test(await F.read()), 'the calibration figure reads out the original sample');
  F = await figCase('CM2021', 'field-energetics', 'oh-splitting');
  await F.set('n', 6); await F.set('r', 0.6);
  ok(/high spin/.test(await F.read()) && /4/.test(await F.read()), 'd6 weak field: high spin, 4 unpaired');
  await F.set('r', 1.6);
  ok(/low spin/.test(await F.read()), 'd6 strong field: low spin');
  ok(await p.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), 'the page behind the sheet does not scroll');
  if (process.env.SHOTS) { await F.shot(process.env.SHOTS + '/oh.png'); F = await figCase('CM2011', 'x-calc', 'extraction-ph'); await F.shot(process.env.SHOTS + '/ext.png'); F = await figCase('CM2011', 'c-calc', 'resolution'); await F.shot(process.env.SHOTS + '/res.png'); F = await figCase('CM2011', 'c-concepts', 'van-deemter'); await F.shot(process.env.SHOTS + '/vd.png'); }
  await p.keyboard.press('Escape');

  const reduced = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
  const q = await reduced.newPage();
  if (dexie) await q.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  await q.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
  await q.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await q.waitForTimeout(500);
  ok(await q.evaluate(() => { const d = getComputedStyle(document.querySelector('#appRoot > *')).animationDuration; return parseFloat(d) < 0.001; }), 'reduced-motion collapses the animations');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall interaction checks ok');
  process.exit(fails ? 1 : 0);
})();
