/*
 * Out of scope (content/cm2021/out-of-scope.json): Chapter 9 is hidden from the queue, Bank, Plan, meters and mock, and the three
 * Chapter 7 questions that used to be filed under week 9 now sit in Chapter 7.
 *   node tests/e2e/scope.cjs   (DEXIE_FILE as in the other suites)
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
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  if (dexie) await p.route('https://unpkg.com/dexie@4.0.10/dist/dexie.mjs', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: dexie }));
  const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  await p.goto(url);
  await p.waitForFunction(() => window.__MASTERY_ENGINE__ && window.__MASTERY_ENGINE__.UI.appState.nodes.length > 0);
  await p.waitForTimeout(700);
  const A = (fn, arg) => p.evaluate(fn, arg);
  const click = async (sel) => { await A((s) => document.querySelector(s)?.click(), sel); await p.waitForTimeout(300); };

  const st = await A(() => { const a = window.__MASTERY_ENGINE__.UI.appState; return { c9: a.nodes.filter((n) => n.id.startsWith('bk-c9-')).length, all: a.allNodes.filter((n) => n.id.startsWith('bk-c9-')).length, chunk: !!a.skillMap.chunks.find((c) => c.id === 'kinetics'), skills: a.skillMap.skills.filter((s) => s.id.startsWith('c9.')).length, jt: !!a.nodes.find((n) => n.id === 'bk-c7-jt-more'), wk: (a.modules.find((m) => m.moduleCode === 'CM2021').weeks || []).map((w) => w.weekNum) }; });
  ok(st.c9 === 0 && st.all === 0, 'no Chapter 9 question is loaded');
  ok(!st.chunk && st.skills === 0, 'the Substitution kinetics chunk and its skills are gone from the skill map');
  ok(st.jt && !st.wk.includes(9) && st.wk.includes(8), `the module lists chapters without 9 (${st.wk.join(',')}), and the Ch 7 deck questions are still served`);

  // the Bank, the mock chapter list, the Plan topics
  await click('.nav-link[data-nav="bank"]');
  await A(() => { const i = document.querySelector('input[type="search"], #bankSearch'); if (i) { i.value = 'Trans-effect'; i.dispatchEvent(new Event('input', { bubbles: true })); } });
  await p.waitForTimeout(300);
  ok(await A(() => !/Trans-effect series/.test(document.querySelector('#appRoot').textContent)), 'the Bank does not list the trans-effect questions');
  await click('.nav-link[data-nav="mock"]');
  ok(await A(() => document.querySelectorAll('[data-mock-ch]').length > 0 && !document.querySelector('[data-mock-ch="9"]')), 'the mock chapter list has no Ch 9');
  await click('.nav-link[data-nav="readiness"]');
  ok(await A(() => !/Substitution kinetics/.test(document.querySelector('#appRoot').textContent)), 'the Plan does not list Substitution kinetics');
  await click('.nav-link[data-nav="study"]');
  // 60 cards of the normal queue never serve one
  const served = await A(async () => { const { UI } = window.__MASTERY_ENGINE__, a = UI.appState; const seen = []; for (let i = 0; i < 60; i++) { UI.loadNextQuestion(); await new Promise((r) => setTimeout(r, 15)); seen.push(a.current?.node.id); } return seen; });
  ok(served.length === 60 && !served.some((id) => /^bk-c9-/.test(id)), 'sixty queue cards include no Chapter 9 question');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nscope ok');
  process.exit(fails ? 1 : 0);
})();
