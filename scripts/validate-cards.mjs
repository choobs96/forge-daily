/**
 * CI guard for cards.js — the append-only contract with the external
 * content-refresh job. Fails the build if the job (or anyone) ever emits
 * garbage: bad JSON payload, missing fields, duplicate ids, unknown category.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const text = readFileSync(resolve(root, 'cards.js'), 'utf8');

const assignMatch = text.match(/window\.SWIPE_CARDS\s*=/);
if (!assignMatch) fail('no window.SWIPE_CARDS assignment');
const start = text.indexOf('[', assignMatch.index + assignMatch[0].length - 1);
const end = text.lastIndexOf(']');
if (start === -1 || end === -1) fail('no array literal found');

let cards;
try {
  cards = JSON.parse(text.slice(start, end + 1));
} catch (e) {
  fail(`array is not valid JSON: ${e.message}`);
}
if (!Array.isArray(cards) || cards.length === 0) fail('empty or non-array payload');

const KNOWN_CATS = new Set(['SQL', 'dbt', 'Spark', 'Modeling', 'Platform', 'DQ', 'Streaming', 'AI', 'Role', 'Career']);
const REQUIRED = ['id', 'cat', 'level', 'title', 'body'];
const seen = new Set();
const errors = [];
cards.forEach((c, i) => {
  for (const f of REQUIRED) {
    if (typeof c?.[f] !== 'string' || !c[f].trim()) errors.push(`card[${i}] (${c?.id ?? '?'}): missing/empty '${f}'`);
  }
  if (c?.id) {
    if (seen.has(c.id)) errors.push(`card[${i}]: duplicate id '${c.id}'`);
    seen.add(c.id);
  }
  if (c?.cat && !KNOWN_CATS.has(c.cat)) errors.push(`card[${i}] (${c.id}): unknown cat '${c.cat}'`);
  if (c?.tags && !Array.isArray(c.tags)) errors.push(`card[${i}] (${c.id}): tags not an array`);
});

if (errors.length) {
  console.error(`cards.js validation FAILED (${errors.length} errors):`);
  for (const e of errors.slice(0, 20)) console.error('  - ' + e);
  process.exit(1);
}
console.log(`cards.js OK: ${cards.length} cards, ${seen.size} unique ids`);

function fail(msg) {
  console.error(`cards.js validation FAILED: ${msg}`);
  process.exit(1);
}
