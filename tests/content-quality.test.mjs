import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Scheduler, Evaluators } = loadEngine();
const banks = { cm2011: readContent('question-bank.json', 'cm2011'), cm2021: readContent('question-bank.json', 'cm2021') };
const variants = (b) => b.questionNodes.flatMap((n) => n.variants.map((v) => [n, v]));

test('every choice question shuffles its options (authored key-first, so position must not give it away)', () => {
  for (const [name, b] of Object.entries(banks)) {
    const bad = variants(b).filter(([, v]) => v.inputSlot.type === 'choice' && !v.inputSlot.shuffleOptions).map(([, v]) => v.variantId);
    assert.deepEqual(bad, [], `${name}: unshuffled choice variants`);
  }
});

test('shuffling moves the key around and keeps "none of the above" last', () => {
  const [, v] = variants(banks.cm2021).find(([, x]) => x.variantId === 'c6-isomer-type-v1');
  const keyPos = new Set();
  for (let seed = 1; seed <= 60; seed++) {
    const inst = Scheduler.instantiateVariant(v, seed * 7919);
    const labels = inst.variant.inputSlot.options.map((o) => o.label);
    assert.equal(labels[labels.length - 1], 'none of the above');
    keyPos.add(inst.variant.inputSlot.options.findIndex((o) => o.id === v.evaluator.targetIds[0]));
  }
  assert.ok(keyPos.size >= 2, `key never moved: ${[...keyPos]}`);
});

test('choice stems and explanations never refer to an option by letter or position (the order changes every time)', () => {
  const found = [];
  for (const [name, b] of Object.entries(banks)) {
    for (const [, v] of variants(b)) {
      if (v.inputSlot.type !== 'choice') continue;
      const t = `${v.stem} ${v.explanation || ''} ${v.hint || ''}`;
      if (/\boptions?\s+[a-e]\b|\bstatements?\s+\(?[a-e]\)?(?=[\s.,;:])|\((?:a|b|c|d|e)\)\s+(?:gives|is|are|has|also)|\b(?:first|second|third|last) (?:option|statement)\b/i.test(t)) found.push(`${name}/${v.variantId}`);
    }
  }
  assert.deepEqual(found, []);
});

test('the model answer printed for each typed field passes that field\'s own patterns (a correct reply is never marked wrong)', () => {
  const bad = [];
  for (const [name, b] of Object.entries(banks)) {
    for (const [, v] of variants(b)) {
      if (v.evaluator.type !== 'mapped_fields_match') continue;
      for (const [k, t] of Object.entries(v.evaluator.targets)) {
        if (!t.acceptedPatterns || !t.expectedDisplay || /[{$]/.test(t.expectedDisplay)) continue;
        const ok = t.acceptedPatterns.some((p) => new RegExp(p, t.caseSensitive ? '' : 'i').test(t.expectedDisplay));
        if (!ok) bad.push(`${name}/${v.variantId}.${k}: "${t.expectedDisplay}"`);
      }
    }
  }
  assert.deepEqual(bad, []);
});

test('blank answers never earn marks on typed questions', () => {
  const bad = [];
  for (const [name, b] of Object.entries(banks)) {
    for (const [n, v] of variants(b)) {
      if (v.evaluator.type !== 'mapped_fields_match') continue;
      const inst = Scheduler.instantiateVariant(v, 4242);
      const blank = Object.fromEntries(Object.keys(v.evaluator.targets).map((k) => [k, '']));
      if (Evaluators.evaluate(v, blank, inst.scope, {}, n).normalizedGrade > 0) bad.push(`${name}/${v.variantId}`);
    }
  }
  assert.deepEqual(bad, []);
});
