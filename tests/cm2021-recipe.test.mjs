import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, readContent } from './helpers/load-engine.mjs';

const { Scheduler } = loadEngine();
const bank = readContent('question-bank.json', 'cm2021');
const recipe = Scheduler.FINAL_RECIPES.CM2021;

test('CM2021 final-style paper: the finals\' shape, 100 marks, every part resolves', () => {
  assert.ok(recipe && recipe.durationMinutes === 120 && recipe.sections.length === 4);
  const want = [25, 25, 30, 20];
  const ids = new Set(bank.questionNodes.map((n) => n.id));
  for (const sec of recipe.sections) for (const part of sec.parts) for (const e of part) {
    const [nid, vid] = e.split('/');
    assert.ok(ids.has(nid), `${e}: node exists`);
    assert.ok(vid && bank.questionNodes.find((n) => n.id === nid).variants.some((v) => v.variantId === vid), `${e}: variant exists`);
  }
  for (let i = 0; i < 60; i++) {
    const paper = Scheduler.assembleRecipePaper(bank.questionNodes, recipe, { random: Math.random });
    assert.equal(paper.sections.map((s) => s.marks).join(), want.join(), `marks per question ${paper.sections.map((s) => s.marks)}`);
    assert.equal(paper.totalMarks, 100);
    assert.equal(new Set(paper.questions.map((q) => q.node.id + q.inst.variant.variantId)).size, paper.questions.length, 'no part is used twice');
    assert.equal(paper.sections[0].marks, 25);
    assert.ok(paper.questions.filter((q) => /Question 1/.test(q.section)).length === 5, 'Q1 has five parts');
  }
});
