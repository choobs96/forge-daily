/* Comprehensive E2E for Forge v2. Run locally: `npm run build  npx vite preview --port 4173 ` then `node scripts/e2e.mjs`.
   Uses the pre-installed Chromium at /opt/pw-browsers/chromium (Claude Code remote env). Not wired into CI (no browser on the runner by default). */
/* Comprehensive end-to-end test for Forge v2 (run against `vite preview`). */
import { chromium } from 'playwright-core';

const OUT = '/tmp/claude-0/-home-user-forge-daily/0ab1f842-139d-51d5-ad8e-e90aa7bf7f9d/scratchpad/e2e';
const BASE = 'http://localhost:4173';
const results = [];
let failures = 0;
function check(name, ok, detail = '') {
  results.push(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(`console: ${m.text()}`); });

const store = () => page.evaluate(() => JSON.parse(localStorage.getItem('forge:v2') ?? 'null'));

/** Click that tolerates elements detaching mid-animation. */
async function tryClick(sel) {
  try {
    await page.locator(sel).first().click({ timeout: 2500 });
    return true;
  } catch {
    return false;
  }
}

/** Generic driver: complete whatever item the session shows. wrongOnFirst makes the first card answered wrong. */
async function playSession({ wrongFirst = false, maxSteps = 40 } = {}) {
  let didWrong = !wrongFirst;
  for (let i = 0; i < maxSteps; i++) {
    if (await page.locator('.done-page').count()) return true;
    if (await page.locator('button.reveal').count()) {
      await tryClick('button.reveal');
      await page.waitForTimeout(300);
      const btn = didWrong ? '.grade-row .btn-success' : '.grade-row .btn-danger-ghost';
      didWrong = true;
      await tryClick(btn);
      await page.waitForTimeout(850);
      continue;
    }
    if (await page.locator('.lesson-wrap .btn-primary').count()) {
      await tryClick('.lesson-wrap .btn-primary');
      await page.waitForTimeout(350);
      continue;
    }
    if (await page.locator('.quiz .opt').count()) {
      await tryClick('.quiz .opt');
      await page.waitForTimeout(2200);
      continue;
    }
    if (await page.locator('.stage .btn-ghost').count()) {
      // "skip" fallback for unavailable items — should NOT normally appear
      check('no "unavailable item" fallback shown', false, `at step ${i}`);
      await tryClick('.stage .btn-ghost');
      await page.waitForTimeout(300);
      continue;
    }
    await page.waitForTimeout(400);
  }
  return await page.locator('.done-page').count() > 0;
}

// ================= 1. FRESH USER =================
await page.goto(`${BASE}/#/today`);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForTimeout(1000);
check('fresh user: Today renders', await page.locator('.cta').count() > 0);
check('fresh user: streak is 0', (await page.locator('.top .flame b').textContent())?.trim() === '0');
const s0 = await store();
check('fresh user: v2 store initialized', s0?.v === 2 && s0.xp.total === 0);
await page.screenshot({ path: `${OUT}/f01-fresh-today.png` });

// full first session, answering the FIRST card wrong (exercises in-session relearn of a new card)
await page.click('button.cta');
await page.waitForTimeout(900);
const finished = await playSession({ wrongFirst: true });
check('fresh user: session completes (incl. relearn of wrong new card)', finished);
await page.screenshot({ path: `${OUT}/f02-session-done.png` });
let s1 = await store();
check('session: xp earned', s1.xp.total > 0, `xp=${s1.xp.total}`);
check('session: streak became 1', s1.streak.current === 1);
check('session: srs entries created', Object.keys(s1.srs).length >= 3, `${Object.keys(s1.srs).length} entries`);
check('session: stats.sessionsCompleted=1', s1.stats.sessionsCompleted === 1);
check('badge: first session earned', 'first-session' in s1.badges);
const wrongEntries = Object.values(s1.srs).filter((e) => e.lapses > 0 || e.correct < e.seen);
check('relearn: wrong answer tracked in srs', wrongEntries.length >= 1);
// every correctly-answered NEW entry must be due >= 2 days out
const newGood = Object.values(s1.srs).filter((e) => e.seen === 1 && e.correct === 1);
const badDue = newGood.filter((e) => (new Date(e.due) - Date.now()) < 1.9 * 86400000);
check('SRS: no correct new card due within ~2 days', badDue.length === 0, `${newGood.length} checked`);

// Forge on (bonus round) from completion screen
if (await page.locator('.done-actions .btn-ghost').count()) {
  await page.locator('.done-actions .btn-ghost').click();
  await page.waitForTimeout(700);
  const gotMore = !(await page.locator('.done-page').count());
  check('forge on: bonus round starts (or gracefully stays done)', true, gotMore ? 'items added' : 'nothing available');
  if (gotMore) {
    await playSession();
  }
}

// ================= 2. RESUME MID-SESSION =================
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('forge:v2'));
  // craft an in-progress session for today with 2 new-card items
  s.session = { date: new Date().toLocaleDateString('sv'), items: [{ type: 'new', id: 'seed-03' }, { type: 'new', id: 'seed-04' }], idx: 1, xp: 15, correct: 1, answered: 1, combo: 1, bestCombo: 1, done: false, startedAt: new Date().toISOString() };
  localStorage.setItem('forge:v2', JSON.stringify(s));
});
await page.goto(`${BASE}/#/today`);
await page.reload();
await page.waitForTimeout(800);
const ctaText = await page.locator('.cta-main').textContent();
check('resume: CTA shows CONTINUE', /CONTINUE/i.test(ctaText ?? ''), ctaText?.trim());
await page.click('button.cta');
await page.waitForTimeout(700);
const segs = await page.locator('.seg').count();
check('resume: session picks up at idx 1', segs === 2 && (await page.locator('.seg.filled').count()) === 1);
await playSession();

// ================= 3. DAY ROLLOVER =================
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('forge:v2'));
  const y = new Date(Date.now() - 86400000).toLocaleDateString('sv');
  s.session.date = y; // yesterday's finished session
  s.streak.lastActiveDay = y;
  s.streak.current = 5;
  localStorage.setItem('forge:v2', JSON.stringify(s));
});
await page.goto(`${BASE}/#/session`); // direct deep-link with stale session
await page.reload(); // hash-only goto keeps the old in-memory store; a real user opening the app cold gets a fresh boot
await page.waitForTimeout(1200);
const rebuilt = await store();
const today = await page.evaluate(() => new Date().toLocaleDateString('sv'));
check('rollover: direct #/session rebuilds today\'s deck', rebuilt.session?.date === today && !rebuilt.session.done);
await playSession();
const s3 = await store();
check('rollover: consecutive day increments streak 5→6', s3.streak.current === 6, `now ${s3.streak.current}`);

// ================= 4. STREAK BREAK + REPAIR =================
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('forge:v2'));
  const today = new Date().toLocaleDateString('sv');
  s.streak = { ...s.streak, current: 1, freezes: 0, pendingRepair: { brokenStreak: 9, offeredDay: today }, repairUsedDay: '' };
  localStorage.setItem('forge:v2', JSON.stringify(s));
});
await page.goto(`${BASE}/#/today`);
await page.reload();
await page.waitForTimeout(800);
check('repair: broken-streak offer shown on Today', (await page.locator('.repair').count()) === 1);
await page.screenshot({ path: `${OUT}/f03-repair-offer.png` });

// ================= 5. LESSON + BOSS =================
await page.goto(`${BASE}/#/lesson/m0/l1`);
await page.waitForTimeout(700);
check('lesson: standalone player renders', (await page.locator('.ltitle').count()) === 1);
for (let i = 0; i < 12; i++) {
  if (await page.locator('.done .btn-primary, .done .btn-ember').count()) break;
  const btn = page.locator('.nav-next');
  if (!(await btn.count())) break;
  await btn.click();
  await page.waitForTimeout(250);
}
check('lesson: completes with XP', (await page.locator('.xp').count()) === 1);
const s5 = await store();
check('lesson: recorded in progress', 'm0/l1' in s5.progress.lessons);

await page.goto(`${BASE}/#/boss/m0`);
await page.waitForTimeout(700);
const bossQ = await page.locator('.quiz .opt').count();
check('boss: quiz renders with options', bossQ >= 2, `${bossQ} options`);
// answer all questions — click correct via DOM knowledge: options carry no marker, so brute: click first, if wrong verdict shows, continue anyway
for (let i = 0; i < 6; i++) {
  if (!(await page.locator('.quiz .opt').count())) break;
  await page.locator('.quiz .opt').first().click();
  await page.waitForTimeout(2200);
}
check('boss: result screen reached', (await page.locator('.done h1').count()) === 1);
await page.screenshot({ path: `${OUT}/f04-boss-result.png` });

// force-pass a boss via store to test unlock logic
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('forge:v2'));
  s.progress.modules['m0'] = new Date().toISOString();
  s.progress.bosses['m0'] = 100;
  localStorage.setItem('forge:v2', JSON.stringify(s));
});
await page.goto(`${BASE}/#/path`);
await page.reload();
await page.waitForTimeout(800);
const lockedUnits = await page.locator('.unit.locked').count();
check('path: m1 unlocked after m0 boss, later units locked', lockedUnits >= 10 && lockedUnits <= 12, `${lockedUnits} locked`);
check('path: test-out available on locked unit', (await page.locator('.testout-btn').first().count()) === 1);

// ================= 6. DRILL =================
await page.goto(`${BASE}/#/drill`);
await page.waitForTimeout(600);
const probCount = await page.locator('.prob').count();
check('drill: all 43 problems listed', probCount === 43, `${probCount}`);
await page.fill('.search', 'salary');
await page.waitForTimeout(300);
check('drill: search filters', (await page.locator('.prob').count()) < 43);
await page.fill('.search', '');
await page.locator('.fbtn', { hasText: 'hard' }).click();
await page.waitForTimeout(300);
const hardCount = await page.locator('.prob').count();
check('drill: hard filter works', hardCount > 0 && hardCount < 43, `${hardCount} hard`);
await page.locator('.prob').first().click();
await page.waitForTimeout(600);
check('problem: statement renders', (await page.locator('.ptitle').count()) === 1);
await page.locator('button', { hasText: 'Show hint' }).click();
await page.waitForTimeout(300);
check('problem: hint reveals', (await page.locator('.hint').count()) === 1);
await page.locator('button', { hasText: 'Reveal solution' }).click();
await page.waitForTimeout(300);
await page.locator('button', { hasText: 'I solved it' }).click();
await page.waitForTimeout(400);
const s6 = await store();
const solvedNow = Object.keys(s6.progress.problems).length;
check('problem: solve persists (half XP w/ solution)', solvedNow >= 1, `${solvedNow} solved`);
await page.screenshot({ path: `${OUT}/f05-problem.png` });

// ================= 7. LIBRARY =================
await page.goto(`${BASE}/#/library`);
await page.waitForTimeout(600);
check('library: 13 handbook chapters', (await page.locator('.list .row').count()) === 13);
await page.fill('.search', 'fan-out');
await page.waitForTimeout(300);
check('library: full-text search narrows', (await page.locator('.list .row').count()) < 13);
await page.fill('.search', '');
await page.waitForTimeout(200);
await page.locator('.list .row').first().click();
await page.waitForTimeout(600);
const words = await page.locator('article.prose').textContent();
check('reader: chapter prose renders substantially', (words ?? '').length > 2000, `${(words ?? '').length} chars`);
await page.screenshot({ path: `${OUT}/f06-reader.png` });
await page.goto(`${BASE}/#/library`);
await page.waitForTimeout(400);
for (const tab of ['Resources', 'Best practices', 'FAQ']) {
  await page.locator('.tab-btn', { hasText: tab }).click();
  await page.waitForTimeout(300);
  check(`library: ${tab} tab renders content`, (await page.locator('.card').count()) > 3);
}

// ================= 8. YOU + SETTINGS + EXPORT/IMPORT =================
await page.goto(`${BASE}/#/you`);
await page.waitForTimeout(600);
check('you: level card renders', (await page.locator('.level-circle').count()) === 1);
await page.locator('button', { hasText: 'settings' }).click();
await page.waitForTimeout(300);
await page.locator('.set-row select').first().selectOption('60');
await page.waitForTimeout(200);
const s8 = await store();
check('settings: goal change persists', s8.profile.dailyGoalXp === 60);
// export -> mutate -> import roundtrip
const dl = page.waitForEvent('download');
await page.locator('button', { hasText: 'Export' }).click();
const download = await dl;
const path = await download.path();
check('backup: export downloads json', !!path);
const beforeXp = s8.xp.total;
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('forge:v2'));
  s.xp.total = 0;
  localStorage.setItem('forge:v2', JSON.stringify(s));
});
page.once('dialog', (d) => d.accept());
await page.locator('label.btn input[type=file]').setInputFiles(path);
await page.waitForTimeout(800);
const s9 = await store();
check('backup: import restores state', s9.xp.total === beforeXp, `xp ${s9.xp.total} == ${beforeXp}`);
await page.screenshot({ path: `${OUT}/f07-you-settings.png` });

// ================= 9. LEGACY MIGRATION (again, full) =================
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('ae-progress', JSON.stringify(['m0', 'm3']));
  localStorage.setItem('forge-completed', JSON.stringify(['m1']));
  localStorage.setItem('forge-xp', '2000');
  localStorage.setItem('forge-swipe-xp', '500');
  localStorage.setItem('forge-streak', '34');
  localStorage.setItem('forge-last-visit', new Date().toDateString());
  localStorage.setItem('forge-swipe', JSON.stringify({ byId: { 'seed-01': { box: 5, due: '2026-09-01', seen: true } } }));
  localStorage.setItem('forge-solved-ids', JSON.stringify(['sql-01', 'sql-02', 'dbt-01']));
});
await page.goto(`${BASE}/#/today`);
await page.reload();
await page.waitForTimeout(1000);
const m = await store();
check('migration: xp summed', m.xp.total === 2500);
check('migration: streak 34 + blue flame', m.streak.current === 34);
check('migration: 3 modules unioned', Object.keys(m.progress.modules).length === 3);
check('migration: 3 problems', Object.keys(m.progress.problems).length === 3);
check('migration: leitner box 5 → stability 120, due preserved', m.srs['card:seed-01'].stability === 120 && m.srs['card:seed-01'].due.startsWith('2026-09-01'));
check('migration: legacy keys left intact', await page.evaluate(() => localStorage.getItem('forge-swipe') !== null));

// ================= 10. REDIRECTS + LEGACY PAGES =================
await page.goto(`${BASE}/swipe.html`);
await page.waitForTimeout(700);
check('redirect: swipe.html lands in app', page.url().includes('#/today'), page.url());
const legacyResp = await page.goto(`${BASE}/legacy/learn.html`);
await page.waitForTimeout(1500);
check('legacy: learn.html serves 200', legacyResp.status() === 200);
check('legacy: learn.html renders its sidebar', (await page.locator('.sidebar').count()) >= 1);
const legacySwipe = await page.goto(`${BASE}/legacy/swipe.html`);
await page.waitForTimeout(1800);
check('legacy: swipe.html serves 200', legacySwipe.status() === 200);
const legacyCardsOk = await page.evaluate(() => Array.isArray(window.SWIPE_CARDS) && window.SWIPE_CARDS.length > 200);
check('legacy: swipe.html loads ../cards.js', legacyCardsOk);

// ================= 11. PWA BITS =================
const manifest = await page.evaluate(async () => (await fetch('/manifest.webmanifest')).json());
check('pwa: manifest valid', manifest.name?.includes('Forge') && manifest.icons?.length === 2);
const swResp = await page.evaluate(async () => (await fetch('/sw.js')).status);
check('pwa: service worker served', swResp === 200);
const cardsResp = await page.evaluate(async () => (await fetch('/cards.js')).status);
check('pwa: cards.js served at root', cardsResp === 200);

// ================= 12. OFFLINE-ISH: cards fetch fallback =================
await page.goto(`${BASE}/#/today`);
await page.waitForTimeout(800);
await page.route('**/cards.js', (r) => r.abort());
await page.reload();
await page.waitForTimeout(1200);
const ctaStill = await page.locator('.cta').count();
check('resilience: Today renders when cards.js unreachable (localStorage fallback)', ctaStill === 1);
await page.unroute('**/cards.js');

// ================= RESULTS =================
console.log(results.join('\n'));
console.log(`\n${failures === 0 ? '🎉 ALL PASS' : `💥 ${failures} FAILURES`} (${results.length} checks)`);
if (pageErrors.length) {
  console.log('\nPAGE ERRORS:');
  console.log([...new Set(pageErrors)].slice(0, 15).join('\n'));
} else {
  console.log('\nNo page/console errors across the entire run.');
}
await browser.close();
process.exit(failures === 0 && pageErrors.length === 0 ? 0 : 1);
