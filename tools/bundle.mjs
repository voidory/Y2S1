/* Builds ONE self-contained HTML file for sharing: dist/y2s1-standalone.html
     node tools/bundle.mjs
   It inlines everything index.html loads from elsewhere: both question banks, skill maps, method pages and the Tanabe–Sugano data
   (served to the app through a small fetch shim), Dexie, KaTeX (with its fonts), Lucide, the Tailwind runtime and the web fonts.
   The result opens by double-click and works offline; progress is stored per browser, so a friend starts fresh.
   Libraries are downloaded once into .bundle-cache/ (curl, so the agent proxy is honoured). */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cache = path.join(root, '.bundle-cache');
fs.mkdirSync(cache, { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
function get(name, url, { text = true } = {}) {
  const file = path.join(cache, name);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    execFileSync('curl', ['-sSL', '--fail', '-m', '60', '-A', UA, '-o', file, url], { stdio: ['ignore', 'inherit', 'inherit'] });
  }
  return text ? fs.readFileSync(file, 'utf8') : fs.readFileSync(file);
}
const b64 = (buf) => Buffer.from(buf).toString('base64');
/** Make code safe inside an inline <script>. */
const safe = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const swap = (from, to) => {
  if (!html.includes(from)) throw new Error(`index.html no longer contains: ${from.slice(0, 70)}`);
  html = html.replace(from, () => to);
};

/* 1. content files, served through a fetch shim */
const files = {};
for (const dir of fs.readdirSync(path.join(root, 'public/content'))) {
  for (const f of fs.readdirSync(path.join(root, 'public/content', dir))) {
    files[`content/${dir}/${f}`] = JSON.parse(fs.readFileSync(path.join(root, 'public/content', dir, f), 'utf8'));
  }
}
const shim = `<script>
(function () {
  var FILES = ${safe(JSON.stringify(files))};
  var real = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (url, opts) {
    var key = String(url).split('?')[0].replace(/^(\\.\\/|\\/)?(public\\/)?/, '');
    if (Object.prototype.hasOwnProperty.call(FILES, key)) {
      return Promise.resolve(new Response(JSON.stringify(FILES[key]), { status: 200, headers: { 'content-type': 'application/json' } }));
    }
    return real ? real(url, opts) : Promise.reject(new Error('offline'));
  };
})();
</script>`;

/* 2. Tailwind runtime (the config script that follows it stays as it is) */
swap('<script src="https://cdn.tailwindcss.com"></script>', `${shim}\n  <script>${safe(get('tailwind.js', 'https://cdn.tailwindcss.com/3.4.17'))}</script>`);

/* 3. fonts: the Latin subset of each Google font, inlined as woff2 */
const fontLink = html.match(/<link href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)" rel="stylesheet" \/>/);
if (!fontLink) throw new Error('font link not found');
const css = get('fonts.css', fontLink[1].replace(/&amp;/g, '&'));
const faces = css.split('}').map((b) => b + '}').filter((b) => /@font-face/.test(b) && /unicode-range:[^;]*U\+0000-00FF/.test(b));
let fontCss = '';
faces.forEach((b, i) => {
  const url = b.match(/url\((https:[^)]+)\)/)?.[1];
  if (!url) return;
  const data = get(`font-${i}.woff2`, url, { text: false });
  fontCss += b.replace(/src:[^;]+;/, `src: url(data:font/woff2;base64,${b64(data)}) format('woff2');`).replace(/unicode-range:[^;]*;/, '');
});
html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, '');
swap(fontLink[0], `<style>${fontCss}</style>`);

/* 4. KaTeX: stylesheet with woff2 fonts inlined, then the scripts */
let katexCss = get('katex.min.css', 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css');
katexCss = katexCss.replace(/src:[^;}]*\}?/g, (m) => m); // (kept; fonts replaced below)
katexCss = katexCss.replace(/src:\s*url\(fonts\/(KaTeX_[A-Za-z0-9-]+)\.woff2\)\s*format\("woff2"\)[^;}]*/g, (m, name) => {
  const data = get(`${name}.woff2`, `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/fonts/${name}.woff2`, { text: false });
  return `src:url(data:font/woff2;base64,${b64(data)}) format("woff2")`;
});
if (/url\(fonts\//.test(katexCss)) throw new Error('some KaTeX fonts were not inlined');
swap('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />', `<style>${katexCss}</style>`);
swap('<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>', `<script>${safe(get('katex.min.js', 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js'))}</script>`);
swap('<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>', `<script>${safe(get('auto-render.min.js', 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js'))}</script>`);

/* 5. Lucide and Dexie */
swap('<script defer src="https://unpkg.com/lucide@0.468.0"></script>', `<script>${safe(get('lucide.js', 'https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js').replace(/\/\/# sourceMappingURL=.*$/m, ''))}</script>`);
let dexie = get('dexie.mjs', 'https://cdn.jsdelivr.net/npm/dexie@4.0.10/dist/dexie.mjs').replace(/\/\/# sourceMappingURL=.*$/m, '');
const exp = dexie.match(/export \{[^}]*Dexie\$1 as default[^}]*\};?/);
if (!exp) throw new Error('Dexie export statement not found');
dexie = dexie.replace(exp[0], '');
swap(`import Dexie from 'https://unpkg.com/dexie@4.0.10/dist/dexie.mjs';\n    window.__DexieLib = Dexie;`, `${safe(dexie)}\n    window.__DexieLib = Dexie$1;`);

/* 6. nothing may still point at the network */
const left = [...html.matchAll(/(?:src|href)="(https?:[^"]+)"|import[^;]*from '(https?:[^']+)'/g)].map((m) => m[1] || m[2]);
if (left.length) throw new Error('still loads from the network: ' + left.join(', '));

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', 'y2s1-standalone.html');
fs.writeFileSync(out, html);
console.log(`${out}  ${(fs.statSync(out).size / 1e6).toFixed(2)} MB`);
