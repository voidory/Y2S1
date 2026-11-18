import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export const rootDir = process.cwd();

/** Runs the main <script type="module"> of index.html in a DOM-less sandbox and returns window.__MASTERY_ENGINE__. */
export function loadEngine() {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
  const sandbox = {
    window: {}, document: undefined, console: { log() {}, warn() {}, error() {} },
    Math, Date, Number, String, Boolean, Array, Object, Set, Map, RegExp, JSON, Error, Promise, setTimeout, clearTimeout,
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(scripts[scripts.length - 1][1], sandbox);
  return sandbox.window.__MASTERY_ENGINE__;
}

export function readContent(name) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, 'public/content/cm2021', name), 'utf8'));
}

/** Just enough of Dexie for Content.syncBank. */
export function fakeDb() {
  const nodes = new Map();
  const rows = new Map();
  const reviews = new Map();
  const logs = [];
  return {
    nodes,
    rows,
    reviews,
    logs,
    reviewStates: {
      toCollection: () => ({ primaryKeys: async () => [...reviews.keys()] }),
      bulkDelete: async (ids) => { ids.forEach((i) => reviews.delete(i)); },
    },
    attemptLogs: {
      orderBy: () => ({ uniqueKeys: async () => [...new Set(logs.map((l) => l.nodeId))] }),
      where: () => ({ anyOf: (ids) => ({ delete: async () => { const set = new Set(ids); let n = 0; for (let i = logs.length - 1; i >= 0; i--) if (set.has(logs[i].nodeId)) { logs.splice(i, 1); n++; } return n; } }) }),
    },
    settings: { get: async (k) => rows.get(k), put: async (r) => { rows.set(r.key, r); } },
    questionNodes: {
      toCollection: () => ({ primaryKeys: async () => [...nodes.keys()] }),
      bulkPut: async (arr) => { arr.forEach((n) => nodes.set(n.id, n)); },
      bulkDelete: async (ids) => { ids.forEach((i) => nodes.delete(i)); },
    },
    transaction: async (...args) => args[args.length - 1](),
  };
}

export function fakeFetch(files) {
  return async (url) => {
    const body = files[url];
    if (body === undefined) return { ok: false, status: 404, json: async () => { throw new Error('404'); } };
    return { ok: true, status: 200, json: async () => (typeof body === 'string' ? JSON.parse(body) : structuredClone(body)) };
  };
}
