import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Scheduler } = loadEngine();

test('exam mode serves only cards that can be answered without options, and never a pick-one variant when a typed one exists', () => {
  for (const dir of ['cm2011', 'cm2021']) {
    const bank = readContent('question-bank.json', dir);
    const nodes = bank.questionNodes;
    const mixed = nodes.filter((n) => n.variants.some((v) => v.inputSlot.type === 'choice') && n.variants.some((v) => v.inputSlot.type !== 'choice'));
    for (const n of mixed.slice(0, 20)) {
      for (let i = 0; i < 25; i++) assert.notEqual(Scheduler.selectVariant(n, undefined, { typedOnly: true }).inputSlot.type, 'choice', `${dir}/${n.id}`);
    }
    const allChoice = new Set(nodes.filter((n) => n.variants.every((v) => v.inputSlot.type === 'choice')).map((n) => n.id));
    assert.ok(allChoice.size > 0);
    for (let i = 0; i < 40; i++) {
      const pick = Scheduler.selectNextNode(nodes, {}, {}, [], Scheduler.DEFAULT_SETTINGS, { typedOnly: true, moduleCode: nodes[0].moduleCode });
      assert.ok(pick.node && !allChoice.has(pick.node.id), `${dir}: served an options-only card in exam mode`);
    }
  }
});
