/*
 * Weak-spots checks on a phone-size screen: get several questions wrong in different topics, then confirm the tab ranks
 * the topics, lists the questions still to fix, names the recurring slips, and that Redo / Drill / See-again work.
 * Needs a browser:  npx playwright install chromium  &&  npm run test:weak
 * If unpkg is unreachable, set DEXIE_FILE to a local copy of dexie@4.0.10/dist/dexie.mjs.
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
  const weakTab = async () => {
    await p.evaluate(() => document.querySelector('.nav-link[data-nav="readiness"]').click()); await p.waitForTimeout(250);
    await p.evaluate(() => document.querySelector('[data-seg-ready="weak"]').click()); await p.waitForTimeout(250);
  };

  // empty state first
  await weakTab();
  ok(await p.evaluate(() => /Nothing to diagnose yet/.test(document.querySelector('#appRoot').textContent)) && !!(await p.$('[data-go-study]')), 'with no history the tab explains itself and offers to start studying');

  const open = async (id, label) => {
    for (let i = 0; i < 40; i++) {
      await p.evaluate(async (nodeId) => { const { UI } = window.__MASTERY_ENGINE__; const a = UI.appState; a.route = 'study'; a.current = null; a.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: nodeId }; UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 120)); }, id);
      if (!label || (await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current?.inst.variant.perspectiveLabel)) === label) return true;
    }
    return false;
  };
  const answerStep = () => p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]')?.click());
  const submit = async () => { await p.evaluate(() => document.querySelector('#btnSubmitAnswer')?.click()); await p.waitForTimeout(350); };

  // three misses in VSEPR (lone-pair slips), two unbalanced equations, one pass for contrast
  for (let i = 0; i < 3; i++) {
    await open('bk-c1-vsepr-ex1'); await answerStep();
    await p.fill('#mf_a', 'linear'); await p.fill('#mf_b', 'T-shaped'); await p.fill('#mf_c', 'square pyramidal'); await submit();
  }
  ok(!!(await p.$('#btnDrillTopic')) && !!(await p.$('#btnRetryLater')), 'after a miss the result offers "Drill this topic" and "See again"');
  // limewater has a single variant, so it stays the same question however often it is drawn
  for (let i = 0; i < 2; i++) { await open('bk-c4-limewater'); await answerStep(); await p.fill('#equationAnsInput', 'Ca(OH)2 + CO2 -> CaCO3\nCaCO3 + CO2 -> Ca(HCO3)2'); await submit(); }
  await open('bk-c1-vsepr-ex1'); await answerStep();
  await p.fill('#mf_a', 'bent'); await p.fill('#mf_b', 'T-shaped'); await p.fill('#mf_c', 'square pyramidal'); await submit();
  ok(!(await p.$('#btnRetryLater')), 'after a pass there is no "See again" button');

  // the tags were stored with the attempts
  const tagged = await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.attemptLogs.flatMap((l) => l.errorTags || []));
  ok(tagged.filter((t) => t === 'shape:missed-lp').length === 3 && tagged.filter((t) => t === 'equation:unbalanced').length === 2, 'each wrong answer was tagged with its kind of slip (' + [...new Set(tagged)].join(', ') + ')');

  await weakTab();
  const tabLabel = await p.evaluate(() => document.querySelector('[data-seg-ready="weak"]').textContent.trim());
  ok(/Weak spots · \d+/.test(tabLabel), 'the tab label counts the questions still to fix: ' + tabLabel);
  const topics = await p.evaluate(() => [...document.querySelectorAll('[data-weak-topic]')].map((e) => ({ id: e.dataset.weakTopic, text: e.textContent.replace(/\s+/g, ' ').trim() })));
  // weakest first: the rows are ordered by their rank score, and the three topics we got wrong are on the list
  const ranks = await p.evaluate(() => [...document.querySelectorAll('[data-weak-topic]')].map((e) => Number(e.dataset.rank)));
  const ids = topics.map((t) => t.id);
  ok(ids.includes('vsepr') && ids.includes('reaction-toolkit') && ids.includes('s-block') && ranks.every((r, i) => i === 0 || ranks[i - 1] <= r), 'topics are listed weakest first, a two-topic question counting for both: ' + ids.join(' > ') + ' (' + ranks.join(', ') + ')');
  ok(/\d of your last \d+ answers missed/.test(topics[0].text) && /\d+%/.test(topics[0].text), 'it says how many recent answers missed, with a score bar');
  const misses = await p.evaluate(() => [...document.querySelectorAll('[data-weak-miss]')].map((e) => e.dataset.weakMiss));
  ok(misses.includes('bk-c4-limewater') && !misses.includes('bk-c1-vsepr-ex1'), 'still-to-fix lists the equation you missed, and not the VSEPR question you finally passed (' + misses.join(', ') + ')');
  const slips = await p.evaluate(() => [...document.querySelectorAll('[data-weak-slip]')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
  ok(slips.some((t) => /Missed lone pairs on the central atom ×3/.test(t)) && slips.some((t) => /Unbalanced equation ×2/.test(t)), 'recurring slips: ' + slips.map((t) => t.slice(0, 50)).join(' | '));

  // Redo opens that exact question
  await p.evaluate(() => document.querySelector('[data-weak-redo="bk-c4-limewater"]').click()); await p.waitForTimeout(400);
  ok(await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return a.route === 'study' && a.current?.node.id === 'bk-c4-limewater'; }), 'Redo opens that question');

  // Drill from the tab restricts the queue to the topic
  await weakTab();
  await p.evaluate(() => document.querySelector('[data-weak-drill="vsepr"]').click()); await p.waitForTimeout(400);
  ok(await p.evaluate(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return a.route === 'study' && a.filters.chunkId === 'vsepr' && a.filters.chunkNodeIds.includes(a.current.node.id); }), 'Drill starts a topic drill and serves a question from it');

  // "See again": a missed question comes back after the set number of cards
  await p.evaluate(() => { window.__MASTERY_ENGINE__.UI.appState.retryAfterCards = 2; window.__MASTERY_ENGINE__.UI.appState.filters = { moduleCode: 'ALL', tier: 'ALL', skillTag: null, forceNodeId: null }; });
  await open('bk-c1-vsepr-ex1'); await answerStep();
  await p.fill('#mf_a', 'linear'); await p.fill('#mf_b', 'T-shaped'); await p.fill('#mf_c', 'square pyramidal'); await submit();
  await p.waitForTimeout(250);
  ok(!!(await p.$('[data-retry-queued]')) && !(await p.$('#btnRetryLater')), 'a miss is queued automatically: "Coming back in N cards", no button to press');
  const served = [];
  for (let i = 0; i < 4; i++) {
    await p.evaluate(() => document.querySelector('#btnNextQuestion')?.click()); await p.waitForTimeout(300);
    served.push(await p.evaluate(() => window.__MASTERY_ENGINE__.UI.appState.current?.node.id));
    await p.evaluate(() => document.querySelector('.seg [data-step-go="answer"]')?.click());
    // answer anything so the card counter advances
    await p.evaluate(() => { const b = document.querySelector('#btnSubmitAnswer'); if (b) b.click(); }); await p.waitForTimeout(300);
  }
  ok(served.slice(0, 4).includes('bk-c1-vsepr-ex1'), 'the missed question came back within a few cards (served: ' + served.join(', ') + ')');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall weak-spots checks ok');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
