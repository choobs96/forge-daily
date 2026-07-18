/**
 * One-shot content extraction: legacy HTML pages -> src/content/*.json
 * Sources of truth:
 *  - learn.html    : MODULES (13 modules, ~52 lessons, rich HTML), PROBLEMS, LEVELS, POP_POOL
 *  - practice.html : PROBLEMS (richer copies; merged with learn's by id)
 *  - course.html   : TIPS, PRACTICES, RESOURCES, FAQ, MODULES (xp/desc)
 *  - index.html    : inline quizzes per module section (answerQuiz calls) + pop quiz pool
 * Emits a loss report so "preserve all content" is verifiable.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { evalPage } from './sandbox.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = resolve(root, 'src/content');
mkdirSync(outDir, { recursive: true });
const report = [];
const save = (name, data) => {
  const path = resolve(outDir, `${name}.json`);
  writeFileSync(path, JSON.stringify(data, null, 1));
  const n = Array.isArray(data) ? data.length : Object.keys(data).length;
  report.push(`${name}.json: ${n} top-level entries, ${(JSON.stringify(data).length / 1024).toFixed(1)}KB`);
};

// ---------- learn.html ----------
const learn = evalPage(resolve(root, 'public/legacy/learn.html'), ['MODULES', 'PROBLEMS', 'LEVELS', 'POP_POOL']).data;
if (!learn.MODULES?.length) throw new Error('learn.html MODULES extraction failed');

// ---------- practice.html ----------
const practice = evalPage(resolve(root, 'public/legacy/practice.html'), ['PROBLEMS']).data;

// ---------- course.html ----------
const course = evalPage(resolve(root, 'public/legacy/course.html'), [
  'MODULES', 'TIPS', 'PRACTICES', 'RESOURCES', 'FAQ', 'LEVELS',
]).data;

// ---------- index.html: per-module inline quizzes + pop pool ----------
const idxHtml = readFileSync(resolve(root, 'public/legacy/index.html'), 'utf8');
const $ = cheerio.load(idxHtml);
const inlineQuizzes = [];
$('section.module').each((_, sec) => {
  const moduleId = $(sec).attr('id');
  $(sec)
    .find('.quiz')
    .each((qi, q) => {
      const question = $(q).find('.quiz-q').html()?.trim();
      const opts = [];
      $(q)
        .find('.quiz-opt')
        .each((_, btn) => {
          const onclick = $(btn).attr('onclick') || '';
          const m = onclick.match(/answerQuiz\(this,\s*(true|false),\s*'((?:[^'\\]|\\.)*)'\)/);
          if (!m) return;
          opts.push({
            text: $(btn).html().trim(),
            correct: m[1] === 'true',
            explain: m[2].replace(/\\'/g, "'").replace(/&quot;/g, '"'),
          });
        });
      if (question && opts.length) inlineQuizzes.push({ id: `${moduleId}-q${qi}`, module: moduleId, q: question, opts });
    });
});
const idx = evalPage(resolve(root, 'public/legacy/index.html'), ['popQuizPool']).data;

// ---------- merge problems: practice copy wins (richer), union of both ----------
const problemsById = new Map();
const learnProblems = Object.entries(learn.PROBLEMS || {}).map(([id, p]) => ({ id, ...p }));
for (const p of learnProblems) problemsById.set(p.id, { ...p, cats: p.cats || [p.id.split('-')[0]] });
for (const p of practice.PROBLEMS || []) problemsById.set(p.id, { ...problemsById.get(p.id), ...p });
const problems = [...problemsById.values()];

// ---------- lesson screen-splitting ----------
// Each lesson's HTML is chunked into tap-through "screens": split at top-level
// element boundaries, grouping until a word budget is hit; tables/pre stay whole.
function splitScreens(html) {
  const $$ = cheerio.load(`<div id="__r">${html}</div>`, null, false);
  const kids = $$('#__r').children().toArray();
  if (!kids.length) return [html];
  const screens = [];
  let cur = [];
  let words = 0;
  const BUDGET = 95;
  for (const k of kids) {
    const el = $$(k);
    const w = el.text().split(/\s+/).filter(Boolean).length;
    const heavy = ['table', 'pre'].includes(k.tagName) || el.find('table,pre').length > 0;
    if (cur.length && (words + w > BUDGET || (heavy && words > 30))) {
      screens.push(cur.join('\n'));
      cur = [];
      words = 0;
    }
    cur.push($$.html(k));
    words += w;
    if (heavy && words > 40) {
      screens.push(cur.join('\n'));
      cur = [];
      words = 0;
    }
  }
  if (cur.length) screens.push(cur.join('\n'));
  return screens;
}

const modules = learn.MODULES.map((m) => {
  const courseMeta = (course.MODULES || []).find((c) => c.id === m.id) || {};
  return {
    id: m.id,
    n: m.n,
    title: m.title,
    subtitle: m.subtitle,
    level: m.level,
    xp: m.xp,
    desc: courseMeta.desc || m.subtitle,
    problemIds: m.problemIds || [],
    quiz: m.quiz || null,
    recap: m.recap || [],
    lessons: (m.lessons || []).map((l, i) => ({
      id: `${m.id}/l${i}`,
      title: l.title,
      screens: splitScreens(l.content || l.html || ''),
      html: l.content || l.html || '',
    })),
    bossQuestions: inlineQuizzes.filter((q) => q.module === m.id),
  };
});

// ---------- index.html: full handbook prose (the ~12k-word deep content) ----------
// Preserved verbatim for the Library reader; quizzes/complete buttons stripped
// (quizzes were extracted separately as boss questions above).
const handbook = [];
$('section.module').each((_, sec) => {
  const s = $(sec);
  const id = s.attr('id');
  const title = s.find('.module-header h2').first().text().trim();
  const subtitle = s.find('.module-subtitle').first().text().trim();
  const body = s.clone();
  body.find('.module-header, .quiz, .complete-btn').remove();
  const html = body.html()?.trim() || '';
  const words = cheerio.load(html).text().split(/\s+/).filter(Boolean).length;
  handbook.push({ id, title, subtitle, html, words });
});
save('handbook', handbook);

save('modules', modules);
save('problems', problems);
save('levels', learn.LEVELS || course.LEVELS);
save('popQuiz', [...(learn.POP_POOL || []), ...(idx.popQuizPool || [])]);
save('tips', course.TIPS || []);
save('practices', course.PRACTICES || []);
save('resources', course.RESOURCES || []);
save('faq', course.FAQ || []);

// ---------- loss report ----------
const lessonsTotal = modules.reduce((a, m) => a + m.lessons.length, 0);
const screensTotal = modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.screens.length, 0), 0);
const wordsTotal = modules.reduce(
  (a, m) => a + m.lessons.reduce((b, l) => b + cheerio.load(l.html).text().split(/\s+/).filter(Boolean).length, 0),
  0
);
report.push('---');
report.push(`modules: ${modules.length} | lessons: ${lessonsTotal} | screens: ${screensTotal} | lesson words: ${wordsTotal}`);
report.push(`problems merged: ${problems.length} (learn ${learnProblems.length} ∪ practice ${(practice.PROBLEMS || []).length})`);
report.push(`boss questions from index.html inline quizzes: ${inlineQuizzes.length}`);
report.push(`pop quiz pool: ${(learn.POP_POOL || []).length} + ${(idx.popQuizPool || []).length} from index`);
report.push(`handbook (index.html deep prose): ${handbook.length} chapters, ${handbook.reduce((a, h) => a + h.words, 0)} words`);
writeFileSync(resolve(root, 'scripts/extract/loss-report.txt'), report.join('\n') + '\n');
console.log(report.join('\n'));
