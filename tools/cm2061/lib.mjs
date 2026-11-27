/*
 * Authoring helpers for CM2061 (Chemistry and Biological Chemistry Laboratory I).
 * Source of truth for the bank: tools/cm2061/*.mjs -> `node tools/cm2061/build.mjs` -> public/content/cm2061/*.json.
 * Never hand-edit the JSON.
 *
 * Every item names its source in metadata.source: 'Manual p.NN' (printed page numbers; the contents page is one low
 * for 1A-6), '2015 paper style' (a pattern, never copied wording) or an external reference. Anything that goes
 * beyond the manual says so in its explanation ("Beyond the manual: ...").
 */
import * as base from '../cm2011/lib.mjs';

export const MODULE = 'CM2061';
export { calc, num, kw, written, order, recall, anyOf, has, range, choice, round } from '../cm2011/lib.mjs';

/** A node. Differs from the CM2011 helper only in the module code and in defaulting to a one-mark MCQ. */
export function node({ id, week, title, theme, tags = [], tier = 'atomic', exam = 'mcq_1mark', family, diff = 2, mins = 1, source, variants }) {
  if (!source) throw new Error(`node ${id}: metadata.source is required`);
  return {
    schemaVersion: '3.0', id, moduleCode: MODULE, tier,
    metadata: { title, source, week, primaryTheme: theme, conceptTags: tags, difficultyEstimate: diff, estimatedMinutes: mins, examStyle: exam, family: family || id },
    variants,
  };
}

const LETTERS = 'abcdefgh';

/**
 * One pick-one question as a single-variant node.
 *   right: [text, why]            the key and why it is right
 *   wrong: [[text, why], ...]     every distractor with the misconception it stands for and why it fails
 * The explanation is assembled from these, so every wrong option is explained and none is cited by letter.
 * `skill` links the node to a skill (see build.mjs); `chunk` is the skill-map topic the skill belongs to.
 */
export function mcq({ id, week, chunk, skill, skillName, source, stem, right, wrong, tags = [], diff = 2, beyond = false, hint, multiVariant }) {
  if (wrong.length < 3 || wrong.length > 4) throw new Error(`${id}: use 3 or 4 distractors (got ${wrong.length})`);
  const opts = [[LETTERS[0], right[0]], ...wrong.map((w, i) => [LETTERS[i + 1], w[0]])];
  const lines = wrong.map((w) => `- **${w[0]}**: ${w[1]}`).join('\n');
  const explanation = `**${right[0]}.** ${right[1]}${beyond ? ' *(Beyond the manual: standard organic or analytical chemistry.)*' : ''}\n\nWhy the others fail:\n${lines}\n\n*Source: ${source}.*`;
  const variant = base.pick({ id: `${id}-v1`, label: tags[0] || skillName || 'MCQ', marks: 1, stem, explanation, options: opts, correct: LETTERS[0], hint });
  return {
    node: node({ id, week, title: stem.length > 70 ? stem.slice(0, 67) + '...' : stem, theme: chunk, tags, diff, source, variants: [variant] }),
    skill: { id: skill, name: skillName, chunk },
  };
}

/** A set of related MCQs sharing one stem pattern as extra variants of the same node (same skill, fresh wording). */
export function mcqSet({ id, week, chunk, skill, skillName, source, items, tags = [], diff = 2, beyond = false }) {
  const made = items.map((it, i) => mcq({ id: `${id}-${i}`, week, chunk, skill, skillName, source: it.source || source, tags, diff, beyond: it.beyond ?? beyond, ...it }));
  const variants = made.map((m, i) => ({ ...m.node.variants[0], variantId: `${id}-v${i + 1}` }));
  return {
    node: node({ id, week, title: items[0].stem.length > 70 ? items[0].stem.slice(0, 67) + '...' : items[0].stem, theme: chunk, tags, diff, source, variants }),
    skill: { id: skill, name: skillName, chunk },
  };
}

/** A multi-select-all-that-apply question. right/wrong are [text, why] lists. */
export function mcqMulti({ id, week, chunk, skill, skillName, source, stem, right, wrong, tags = [], diff = 3, beyond = false }) {
  const opts = [...right, ...wrong].map((o, i) => [LETTERS[i], o[0]]);
  const correct = right.map((_, i) => LETTERS[i]);
  const explanation = `**Correct:** ${right.map((r) => `${r[0]} (${r[1]})`).join('; ')}.\n\nWhy the others fail:\n${wrong.map((w) => `- **${w[0]}**: ${w[1]}`).join('\n')}${beyond ? '\n\n*(Beyond the manual: standard chemistry.)*' : ''}\n\n*Source: ${source}.*`;
  const variant = base.pick({ id: `${id}-v1`, label: tags[0] || skillName, marks: Math.min(3, right.length), stem, explanation, options: opts, correct, multi: true });
  return {
    node: node({ id, week, title: stem.slice(0, 67), theme: chunk, tags, diff, exam: 'short_2to3', source, variants: [variant] }),
    skill: { id: skill, name: skillName, chunk },
  };
}

/** Put the steps in order. steps: [text, ...] already in the correct order (the app shuffles the display). */
export function orderItem({ id, week, chunk, skill, skillName, source, stem, steps, explanation, tags = [], diff = 3, beyond = false }) {
  const items = steps.map((t, i) => [`s${i + 1}`, t]);
  const variant = base.order({ id: `${id}-v1`, label: tags[0] || skillName, marks: Math.max(2, Math.ceil(steps.length / 2)), stem, explanation: `${explanation}${beyond ? ' *(Beyond the manual: standard practice.)*' : ''}\n\n*Source: ${source}.*`, items, direction: 'first step at the top' });
  return {
    node: node({ id, week, title: stem.slice(0, 67), theme: chunk, tags, diff, exam: 'short_2to3', source, variants: [variant] }),
    skill: { id: skill, name: skillName, chunk },
  };
}

/** Draw on paper, then reveal a model answer and tick a checklist (atomic_rubric). items: [criterion, marks][]; figure: SVG string. */
export function drawItem({ id, week, chunk, skill, skillName, source, stem, items, explanation, figure, caption, tags = [], diff = 3, hint }) {
  const variant = base.written({ id: `${id}-v1`, label: tags[0] || skillName, stem, explanation: `${explanation}\n\n*Source: ${source}.*`, items, paper: true, hint });
  variant.comparisonVisualAsset = { type: 'svg', payload: figure, caption: caption || 'Model answer' };
  return {
    node: node({ id, week, title: tags[0] || skillName, theme: chunk, tags, diff, exam: 'construct_4to6', mins: 6, source, variants: [variant] }),
    skill: { id: skill, name: skillName, chunk },
  };
}
