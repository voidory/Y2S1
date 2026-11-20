import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Content } = loadEngine();

test('method pages: every page serves real topics, has the standard sections, and the topics that carry marks are covered', () => {
  for (const [dir, code, minShare] of [['cm2011', 'CM2011', 0.99], ['cm2021', 'CM2021', 0.6]]) {
    const doc = readContent('methods.json', dir);
    const map = readContent('skill-map.json', dir);
    assert.equal(doc.module, code);
    const chunks = new Set(map.chunks.map((c) => c.id));
    const ids = new Set();
    for (const m of doc.methods) {
      assert.ok(!ids.has(m.id), `duplicate ${m.id}`); ids.add(m.id);
      assert.ok(m.title && m.summary, `${m.id} has a title and summary`);
      for (const c of m.chunks) assert.ok(chunks.has(c), `${m.id}: topic ${c} exists`);
      for (const h of ['## Use it when', '## Steps', '## Traps']) assert.ok(m.md.includes(h), `${m.id} has "${h}"`);
      const words = m.md.split(/\s+/).length;
      assert.ok(words > 120 && words < 700, `${m.id} is concise (${words} words)`);
    }
    const covered = new Set(doc.methods.flatMap((m) => m.chunks));
    const share = map.skills.filter((k) => covered.has(k.chunk)).reduce((a, k) => a + k.weight, 0);
    assert.ok(share >= minShare, `${dir}: pages cover ${(share * 100).toFixed(0)}% of the marks`);
  }
});

test('method pages: CM2021 pages are flagged as written without the slides, CM2011 pages are not', () => {
  assert.ok(readContent('methods.json', 'cm2021').methods.every((m) => /not from your slides/.test(m.flag || '')));
  assert.ok(readContent('methods.json', 'cm2011').methods.every((m) => !m.flag));
});

test('method pages: methodForChunk finds the page for a topic and nothing for an unknown one', () => {
  const doc = readContent('methods.json', 'cm2011');
  assert.equal(Content.methodForChunk(doc, 'x-calc').id, 'extraction');
  assert.equal(Content.methodForChunk(doc, 'x-concepts').id, 'extraction');
  assert.equal(Content.methodForChunk(doc, 'nope'), null);
  assert.equal(Content.methodForChunk(null, 'x-calc'), null);
});
