/**
 * Evaluate the inline <script> blocks of a legacy Forge page inside a VM with
 * a permissive DOM stub, then read out its top-level data constants.
 * The legacy pages keep all content in JS array/object literals (MODULES,
 * PROBLEMS, BADGES, ...), so this is a lossless extraction path.
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as cheerio from 'cheerio';

function domStub() {
  const el = () =>
    new Proxy(function () {}, {
      get(_t, prop) {
        if (prop === 'style' || prop === 'dataset' || prop === 'classList') {
          return new Proxy({}, { get: () => () => {}, set: () => true });
        }
        if (prop === Symbol.toPrimitive) return () => '';
        return typeof prop === 'string' && /^(add|remove|set|append|insert|toggle|scroll|focus|click|attach)/.test(prop)
          ? () => {}
          : el();
      },
      set: () => true,
      apply: () => el(),
    });
  const doc = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === 'querySelectorAll') return () => [];
        if (prop === 'documentElement' || prop === 'body' || prop === 'head') return el();
        if (typeof prop === 'string' && /^(getElementById|querySelector|createElement)$/.test(prop)) return () => el();
        if (typeof prop === 'string' && /^add/.test(prop)) return () => {};
        return el();
      },
      set: () => true,
    }
  );
  return doc;
}

export function evalPage(file, wanted) {
  const html = readFileSync(file, 'utf8');
  const $ = cheerio.load(html);
  const scripts = $('script:not([src])')
    .map((_, s) => $(s).text())
    .get();
  const storage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
  const ctx = {
    document: domStub(),
    window: { addEventListener: () => {}, matchMedia: () => ({ matches: false }) },
    localStorage: storage,
    navigator: { serviceWorker: undefined, vibrate: () => {} },
    location: { hash: '', href: '' },
    history: { replaceState: () => {} },
    console: { log: () => {}, warn: () => {}, error: () => {} },
    setInterval: () => 0,
    setTimeout: () => 0,
    alert: () => {},
    confirm: () => false,
    URL: URL,
    Blob: class {},
    Math,
    Date,
    JSON,
  };
  ctx.window.localStorage = storage;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const src of scripts) {
    try {
      vm.runInContext(src, ctx, { timeout: 10000 });
    } catch (e) {
      // Bootstrap render calls may throw against the stub — data consts are
      // hoisted/evaluated before the bootstrap lines, so this is tolerable,
      // but report it so a real parse failure is visible.
      console.error(`  [warn] script eval stopped in ${file}: ${e.message}`);
    }
  }
  // Top-level const/let live in the context's global lexical scope, not on the
  // context object — capture them with a follow-up script in the same context.
  const captureSrc =
    'JSON.stringify({' +
    wanted.map((n) => `${n}: (typeof ${n} !== 'undefined' ? ${n} : undefined)`).join(',') +
    '})';
  let out = {};
  try {
    out = JSON.parse(vm.runInContext(captureSrc, ctx, { timeout: 10000 }));
  } catch (e) {
    console.error(`  [warn] capture failed in ${file}: ${e.message}`);
  }
  return { data: out, $ };
}
