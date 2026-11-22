/*
 * The Reactions screen (CM2021 only): nav entry, Map (chunks, chains, search, filters, cover mode), Train (cards of every kind,
 * marking, the "I was right" override, spaced boxes saved across a reload), and no page scroll at phone and laptop size.
 *   node tests/e2e/reactions.cjs   (DEXIE_FILE as in the other suites)
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
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const p = await ctx.newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  const boot = async () => { await p.goto(url); await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0); await p.waitForTimeout(600); };
  const noScroll = async (label) => {
    const m = await p.evaluate(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
    ok(m.sh <= m.ih + 1 && m.sw <= m.iw + 1, `${label}: the page does not scroll (${m.sw}x${m.sh} in ${m.iw}x${m.ih})`);
  };
  await boot();

  // 1. nav entry (phone tab bar, six tabs) on CM2021
  const nav = await p.evaluate(() => { const t = document.querySelector('.tabbar'); const b = [...t.querySelectorAll('[data-nav]')].filter((x) => !x.classList.contains('hidden')); const r = b.map((x) => x.getBoundingClientRect()); return { n: b.length, names: b.map((x) => x.dataset.nav).join(','), right: Math.max(...r.map((x) => x.right)), w: innerWidth, minW: Math.min(...r.map((x) => x.width)) }; });
  ok(nav.names.includes('reactions') && nav.n === 6, `CM2021 shows a Reactions tab (${nav.names})`);
  ok(nav.right <= nav.w + 1 && nav.minW >= 55, `six tabs fit a phone (right edge ${Math.round(nav.right)} of ${nav.w}, narrowest ${Math.round(nav.minW)}px)`);
  await p.click('.tabbar [data-nav="reactions"]'); await p.waitForTimeout(400);
  ok(await p.$('#rxView') !== null, 'the Reactions screen opens');
  await noScroll('Train start');

  // 2. Map
  await p.click('[data-rx-tab="map"]'); await p.waitForTimeout(250);
  const map = await p.evaluate(() => ({ groups: document.querySelectorAll('[data-rx-group]').length, rows: document.querySelectorAll('[data-rx-row]').length, sub: document.querySelectorAll('[data-rx-row] sub').length, unchecked: [...document.querySelectorAll('[data-rx-row]')].filter((r) => /not in your slides/.test(r.textContent)).length }));
  ok(map.groups === 14 && map.rows >= 90 && map.sub > 100, `Map shows ${map.groups} chunks and ${map.rows} reactions with typeset formulas`);
  ok(map.unchecked >= 8, `reactions the notes call unchecked carry a visible flag (${map.unchecked})`);
  await noScroll('Map');
  await p.fill('#rxSearch', 'haber'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.querySelectorAll('[data-rx-row]').length) === 1, 'search narrows to the Haber process');
  await p.fill('#rxSearch', ''); await p.waitForTimeout(150);
  await p.click('[data-rx-filter="finals"]'); await p.waitForTimeout(200);
  const fin = await p.evaluate(() => [...document.querySelectorAll('[data-rx-row]')].every((r) => r.querySelector('[data-rx-badge="finals"]')) && document.querySelectorAll('[data-rx-row]').length);
  ok(fin >= 8, `the finals filter keeps only reactions a final asked (${fin})`);
  await p.click('[data-rx-filter="finals"]'); await p.waitForTimeout(150);
  await p.click('#rxCover'); await p.waitForTimeout(200);
  const row = '[data-rx-row="n-haber"]';
  await p.fill('#rxSearch', 'haber'); await p.waitForTimeout(150);
  ok(!/2NH3/.test(await p.textContent(row)), 'cover mode hides the products');
  await p.click(row); await p.waitForTimeout(150);
  ok(/2NH3/.test(await p.textContent('[data-rx-row="n-haber"]')), 'tapping a covered row reveals it');
  await p.click('#rxCover'); await p.fill('#rxSearch', ''); await p.waitForTimeout(150);
  await p.click('[data-rx-mapview="chains"]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.querySelectorAll('[data-rx-chain]').length) === 6, 'Chains shows six flow charts');
  await noScroll('Chains');

  // 3. Train: answer every kind correctly through the real UI
  await p.click('[data-rx-tab="train"]'); await p.waitForTimeout(200);
  await p.click('#rxStart'); await p.waitForTimeout(400);
  const kinds = new Set(); let rights = 0, firstMiss = null;
  for (let i = 0; i < 12; i++) {
    const info = await p.evaluate(() => { const s = window.__MASTERY_ENGINE__.UI.appState.rx.session; const c = s.card; const r = window.__MASTERY_ENGINE__.UI.appState.reactions.reactions.find((x) => x.id === c.rid); return { kind: c.kind, rid: c.rid, answer: c.answer, eq: r.steps ? r.steps.join('\n') : r.eq, nuc: r.answer, done: !!s.done }; });
    if (info.done) break;
    kinds.add(info.kind);
    if (i === 0) await noScroll('a card');
    if (info.kind === 'cond') { await p.click('#rxReveal'); await p.click('[data-rx-rate="1"]'); }
    else {
      let text = info.eq;
      if (info.kind === 'gap') text = info.answer; else if (info.kind === 'nuc') text = info.nuc.A + info.nuc.sym; else if (info.kind === 'name') text = 'x';
      if (info.kind === 'name') { const aka = await p.evaluate((id) => window.__MASTERY_ENGINE__.UI.appState.reactions.reactions.find((x) => x.id === id).aka[0], info.rid); text = aka; }
      if (i === 3 && info.kind === 'write') { text = 'wrong -> answer'; firstMiss = info.rid; }
      await p.fill('#rxAnswer', text); await p.click('#rxCheck');
    }
    await p.waitForSelector('[data-rx-result], [data-rx-cond]');
    const v = await p.evaluate(() => document.querySelector('[data-rx-verdict]')?.textContent || 'rated');
    if (/^Correct|rated/.test(v)) rights++;
    await p.click('#rxNext');
    await p.waitForTimeout(80);
  }
  ok(kinds.has('gap') || kinds.has('write'), `session served ${[...kinds].join(', ')} cards`);
  ok(rights >= 8, `correct answers were marked correct (${rights} of the first 12)`);
  await p.waitForFunction(() => window.__MASTERY_ENGINE__.UI.appState.rx.session?.done || window.__MASTERY_ENGINE__.UI.appState.rx.session?.i >= 12, null, { timeout: 5000 }).catch(() => {});

  // finish via End session, then check the summary and stored boxes
  const sess = await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return { done: !!a.rx.session?.done, n: Object.keys(a.rxStats).length }; });
  if (!sess.done) { await p.click('#rxStop'); await p.waitForTimeout(200); }
  ok(await p.$('[data-rx-summary]') !== null, 'the session ends with a summary');
  await noScroll('Summary');
  const saved = await p.evaluate(async () => { const db = await window.__MASTERY_ENGINE__.DB.init(); const row = await db.settings.get('reactionStats'); return { n: Object.keys(row?.stats || {}).length, boxes: Object.values(row?.stats || {}).map((x) => x.box).join('') }; });
  ok(saved.n >= 8, `boxes are stored in the settings row (${saved.n} reactions: ${saved.boxes})`);
  await boot();
  await p.click('.tabbar [data-nav="reactions"]'); await p.waitForTimeout(300);
  const back = await p.evaluate(() => Object.keys(window.__MASTERY_ENGINE__.UI.appState.rxStats).length);
  ok(back === saved.n, 'progress survives a reload');

  // 4. a wrong answer, the override, and the box rule
  await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; a.rxStats = {}; });
  await p.evaluate(() => { const E = window.__MASTERY_ENGINE__; const a = E.UI.appState; a.rx.session = { queue: ['g1-na'], i: 0, results: [], retried: new Set(), card: { rid: 'g1-na', kind: 'write' }, result: null, revealed: false, opts: {} }; a.rx.tab = 'train'; E.UI.render(); });
  await p.fill('#rxAnswer', '4Na + O2 -> 2Na2O'); await p.click('#rxCheck'); await p.waitForSelector('[data-rx-result]');
  ok(/Not quite/.test(await p.textContent('[data-rx-verdict]')), 'a different product is marked wrong');
  ok(/Na<sub>2<\/sub>O<sub>2<\/sub>/.test(await p.innerHTML('[data-rx-result]')), 'the model answer is shown typeset');
  ok(await p.$('#rxOverride') !== null, 'a miss offers "I was right"');
  await p.click('#rxOverride'); await p.waitForTimeout(200);
  const ov = await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.rxStats['g1-na']);
  ok(ov && ov.box === 1 && ov.miss === 0 && ov.seen === 1, `the override counts it as right (${JSON.stringify(ov)})`);

  // 5. the Reactions tab is hidden for CM2011 and the route falls back
  await p.selectOption('#moduleSwitch', 'CM2011'); await p.waitForTimeout(900);
  ok(await p.evaluate(() => [...document.querySelectorAll('[data-nav="reactions"]')].every((x) => x.classList.contains('hidden'))), 'CM2011 has no Reactions tab');
  ok(await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.route !== 'reactions'), 'the route left Reactions when the module changed');
  await p.selectOption('#moduleSwitch', 'CM2021'); await p.waitForTimeout(700);

  // 6. laptop size
  await p.setViewportSize({ width: 1280, height: 800 });
  await p.click('aside [data-nav="reactions"]'); await p.waitForTimeout(300);
  await p.click('[data-rx-tab="map"]'); await p.waitForTimeout(250);
  await noScroll('Map at laptop size');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nreactions ok');
  process.exit(fails ? 1 : 0);
})();
