import { describe, it, expect } from 'vitest';
import { rate, seedFromLeitner, isDue, daysUntilDue } from './srs/engine';
import { migrateLegacy } from './state/migrate';
import { recordActiveDay, tryRepair, flameStage } from './gamify/streak';
import { calcLevel, comboXp } from './gamify/levels';
import { buildSession, forecast, nextLesson } from './session/builder';
import { parseCardsJs } from './cards/loader';
import { emptyState } from './state/schema';
import { todayStr, addDays, dayDiff, seededShuffle } from './util';
import type { SwipeCard } from './cards/loader';

const NOW = new Date('2026-07-18T08:00:00');

describe('SRS engine', () => {
  it('never schedules a correct NEW answer for the next day (the core complaint)', () => {
    const e = rate(undefined, 'card', 'good', NOW);
    expect(daysUntilDue(e, NOW)).toBeGreaterThanOrEqual(2);
  });

  it('grows intervals strictly on consecutive Good answers', () => {
    let e = rate(undefined, 'card', 'good', NOW);
    let prevGap = new Date(e.due).getTime() - NOW.getTime();
    let now = new Date(e.due);
    for (let i = 0; i < 5; i++) {
      e = rate(e, 'card', 'good', now);
      const gap = new Date(e.due).getTime() - now.getTime();
      expect(gap).toBeGreaterThan(prevGap);
      prevGap = gap;
      now = new Date(e.due);
    }
    // after 6 consecutive Good, interval should exceed a month
    expect(prevGap).toBeGreaterThan(30 * 86_400_000);
  });

  it('Again brings the card back tomorrow-ish and counts a lapse', () => {
    let e = rate(undefined, 'card', 'good', NOW);
    e = rate(e, 'card', 'again', new Date(e.due));
    const days = (new Date(e.due).getTime() - new Date(e.last!).getTime()) / 86_400_000;
    expect(days).toBeLessThanOrEqual(2);
    expect(e.lapses).toBeGreaterThanOrEqual(1);
  });

  it('seeds from Leitner preserving the due date', () => {
    const e = seedFromLeitner(3, '2026-08-01');
    expect(e.due.startsWith('2026-08-01')).toBe(true);
    expect(e.stability).toBe(30);
    expect(isDue(e, NOW)).toBe(false);
    expect(isDue(seedFromLeitner(0, '2026-07-17'), NOW)).toBe(true);
  });
});

describe('migration', () => {
  const legacy: Record<string, string> = {
    'ae-progress': JSON.stringify(['m0', 'm1']),
    'forge-completed': JSON.stringify(['m1', 'm4']),
    'forge-solved-ids': JSON.stringify(['sql-01', 'dbt-02']),
    'forge-xp': '850',
    'forge-swipe-xp': '430',
    'forge-streak': '12',
    'forge-last-visit': new Date('2026-07-17T20:00:00').toDateString(),
    'forge-swipe': JSON.stringify({
      byId: { 'seed-01': { box: 3, due: '2026-08-01', seen: true }, 'auto-1': { box: 0, due: '2026-07-17', seen: true } },
    }),
  };
  const storage = { getItem: (k: string) => legacy[k] ?? null };

  it('unions module completion from both legacy stores', () => {
    const s = migrateLegacy(storage, NOW);
    expect(Object.keys(s.progress.modules).sort()).toEqual(['m0', 'm1', 'm4']);
  });
  it('sums the split XP pools', () => {
    expect(migrateLegacy(storage, NOW).xp.total).toBe(1280);
  });
  it('preserves streak and Leitner due dates', () => {
    const s = migrateLegacy(storage, NOW);
    expect(s.streak.current).toBe(12);
    expect(s.streak.lastActiveDay).toBe('2026-07-17');
    expect(s.srs['card:seed-01']!.due.startsWith('2026-08-01')).toBe(true);
    expect(s.seenCards).toContain('auto-1');
  });
  it('handles a blank slate', () => {
    const s = migrateLegacy({ getItem: () => null }, NOW);
    expect(s.xp.total).toBe(0);
    expect(Object.keys(s.srs)).toHaveLength(0);
  });
});

describe('streak', () => {
  it('increments on consecutive days and tracks best', () => {
    const s = emptyState(NOW).streak;
    recordActiveDay(s, '2026-07-18');
    recordActiveDay(s, '2026-07-19');
    recordActiveDay(s, '2026-07-20');
    expect(s.current).toBe(3);
    expect(s.best).toBe(3);
  });
  it('same-day session does not double count', () => {
    const s = emptyState(NOW).streak;
    recordActiveDay(s, '2026-07-18');
    recordActiveDay(s, '2026-07-18');
    expect(s.current).toBe(1);
  });
  it('freeze absorbs a missed day; earned every 7 days', () => {
    const s = emptyState(NOW).streak;
    let day = '2026-07-01';
    for (let i = 0; i < 7; i++) {
      recordActiveDay(s, day);
      day = addDays(day, 1);
    }
    expect(s.current).toBe(7);
    expect(s.freezes).toBe(1);
    // miss one day
    day = addDays(day, 1);
    const res = recordActiveDay(s, day);
    expect(res.usedFreezes).toBe(1);
    expect(res.broke).toBe(false);
    expect(s.current).toBe(8);
    expect(s.freezes).toBe(0);
  });
  it('breaks without freezes and offers repair; repair restores', () => {
    const s = emptyState(NOW).streak;
    recordActiveDay(s, '2026-07-01');
    recordActiveDay(s, '2026-07-02');
    const res = recordActiveDay(s, '2026-07-06'); // 3 missed days, 0 freezes
    expect(res.broke).toBe(true);
    expect(s.current).toBe(1);
    expect(s.pendingRepair?.brokenStreak).toBe(2);
    expect(tryRepair(s, '2026-07-06')).toBe(true);
    expect(s.current).toBe(3);
    // second repair within 30 days refused
    s.pendingRepair = { brokenStreak: 5, offeredDay: '2026-07-10' };
    expect(tryRepair(s, '2026-07-10')).toBe(false);
  });
  it('flame stages', () => {
    expect(flameStage(0)).toBe('none');
    expect(flameStage(3)).toBe('ember');
    expect(flameStage(10)).toBe('flame');
    expect(flameStage(50)).toBe('blue');
    expect(flameStage(150)).toBe('white');
  });
});

describe('levels & combo', () => {
  it('maps xp to the 20-level ladder', () => {
    expect(calcLevel(0).lvl).toBe(1);
    expect(calcLevel(12000).lvl).toBe(20);
    expect(calcLevel(12000).next).toBeNull();
    const mid = calcLevel(500);
    expect(mid.lvl).toBeGreaterThan(1);
    expect(mid.pct).toBeGreaterThanOrEqual(0);
    expect(mid.pct).toBeLessThanOrEqual(100);
  });
  it('combo multiplies xp after 5 in a row', () => {
    expect(comboXp(10, 4)).toBe(10);
    expect(comboXp(10, 5)).toBe(15);
  });
});

describe('session builder', () => {
  const mkCards = (n: number): SwipeCard[] =>
    Array.from({ length: n }, (_, i) => ({
      id: `c${i}`,
      cat: i % 2 ? 'SQL' : 'Career',
      level: 'Core',
      title: `Card ${i}`,
      hook: '',
      body: '<p>x</p>',
      tags: [],
    }));

  it('reviews come first, capped at 12, and the deck is deterministic per day', () => {
    const s = emptyState(NOW);
    for (let i = 0; i < 20; i++) s.srs[`card:old${i}`] = seedFromLeitner(0, '2026-07-10');
    const a = buildSession(s, mkCards(30), NOW);
    const b = buildSession(s, mkCards(30), NOW);
    expect(a.items.map((i) => i.id)).toEqual(b.items.map((i) => i.id));
    const reviews = a.items.filter((i) => i.type === 'review');
    expect(reviews).toHaveLength(12);
    expect(a.items[0]!.type).toBe('review');
    const news = a.items.filter((i) => i.type === 'new');
    expect(news).toHaveLength(s.profile.newPerDay);
  });

  it('includes exactly one lesson step and one quiz', () => {
    const s = emptyState(NOW);
    const snap = buildSession(s, mkCards(10), NOW);
    expect(snap.items.filter((i) => i.type === 'lesson')).toHaveLength(1);
    expect(snap.items.filter((i) => i.type === 'quiz')).toHaveLength(1);
    expect(nextLesson(s)).toBe('m0/l0');
  });

  it('never selects already-seen cards as new', () => {
    const s = emptyState(NOW);
    s.seenCards = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
    const snap = buildSession(s, mkCards(10), NOW);
    const news = snap.items.filter((i) => i.type === 'new').map((i) => i.id);
    expect(news.every((id) => !s.seenCards.includes(id))).toBe(true);
  });

  it('forecast buckets dues by day with overdue counted today', () => {
    const s = emptyState(NOW);
    s.srs['card:a'] = seedFromLeitner(0, '2026-07-10'); // overdue
    s.srs['card:b'] = seedFromLeitner(1, todayStr(NOW)); // today
    s.srs['card:c'] = seedFromLeitner(1, addDays(todayStr(NOW), 3));
    const f = forecast(s, 7, NOW);
    expect(f[0]).toBe(2);
    expect(f[3]).toBe(1);
  });
});

describe('cards.js parser', () => {
  it('parses the window.SWIPE_CARDS assignment', () => {
    const src = `/* header */\nwindow.SWIPE_CARDS = [{"id":"a","cat":"SQL","level":"Core","title":"T","hook":"h","body":"<p>b</p>","tags":[]}];\n`;
    const cards = parseCardsJs(src);
    expect(cards).toHaveLength(1);
    expect(cards[0]!.id).toBe('a');
  });
  it('drops malformed entries instead of crashing', () => {
    const src = `window.SWIPE_CARDS = [{"id":"a","title":"T"}, null, {"nope":1}];`;
    expect(parseCardsJs(src)).toHaveLength(1);
  });
});

describe('date utils', () => {
  it('addDays/dayDiff roundtrip across month boundaries', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01');
    expect(dayDiff('2026-07-31', '2026-08-01')).toBe(1);
    expect(dayDiff('2026-07-18', '2026-07-18')).toBe(0);
  });
  it('seeded shuffle is stable', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7];
    expect(seededShuffle(arr, 'x')).toEqual(seededShuffle(arr, 'x'));
  });
});
