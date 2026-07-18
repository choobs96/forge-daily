import type { ForgeState, SessionItem, SessionSnapshot } from '../state/schema';
import type { SwipeCard } from '../cards/loader';
import { isDue } from '../srs/engine';
import { MODULES, POP_QUIZ, CAT_TO_MODULE } from '../../content/content';
import { seededShuffle, todayStr } from '../util';

export const REVIEW_CAP = 12;

/** The next uncompleted lesson along the path (module order, lesson order). */
export function nextLesson(state: ForgeState): string | null {
  for (const m of MODULES) {
    for (const l of m.lessons) {
      if (!state.progress.lessons[l.id]) return l.id;
    }
  }
  return null;
}

/** Modules considered "reached": everything up to the frontier module. */
function reachedModules(state: ForgeState): Set<string> {
  const reached = new Set<string>();
  for (const m of MODULES) {
    reached.add(m.id);
    const bossPassed = m.id in state.progress.modules;
    const allLessons = m.lessons.every((l) => state.progress.lessons[l.id]);
    if (!bossPassed && !allLessons) break; // frontier module
  }
  return reached;
}

export interface SessionPreview {
  reviews: number;
  news: number;
  lesson: string | null;
  quiz: boolean;
  estMinutes: number;
}

/**
 * Compose today's session:
 *   1. due SRS reviews first (cap 12; overflow amortizes to later days)
 *   2. ONE lesson step (the path advances daily — that's the plot)
 *   3. fresh cards (profile.newPerDay), preferring reached-module categories
 *   4. one pop-quiz question
 * Deterministic per-day (seeded shuffle) so the deck is stable across reloads.
 */
export function buildSession(state: ForgeState, cards: SwipeCard[], now = new Date()): SessionSnapshot {
  const day = todayStr(now);
  const items: SessionItem[] = [];

  // 1. due reviews — most overdue first
  const due = Object.entries(state.srs)
    .filter(([, e]) => isDue(e, now))
    .sort((a, b) => new Date(a[1].due).getTime() - new Date(b[1].due).getTime())
    .slice(0, REVIEW_CAP);
  for (const [key] of due) {
    const [kind, ...rest] = key.split(':');
    items.push({ type: 'review', id: `${kind}:${rest.join(':')}` });
  }

  // 2. lesson step
  const lesson = nextLesson(state);

  // 3. fresh cards — prefer categories mapped to reached modules
  const reached = reachedModules(state);
  const seen = new Set(state.seenCards);
  const fresh = cards.filter((c) => !seen.has(c.id) && !state.srs[`card:${c.id}`]);
  const preferred = fresh.filter((c) => reached.has(CAT_TO_MODULE[c.cat] ?? ''));
  const rest = fresh.filter((c) => !reached.has(CAT_TO_MODULE[c.cat] ?? ''));
  const picked = [
    ...seededShuffle(preferred, `${day}|pref`),
    ...seededShuffle(rest, `${day}|rest`),
  ].slice(0, state.profile.newPerDay);
  const newItems: SessionItem[] = picked.map((c) => ({ type: 'new', id: c.id }));

  // 4. one quiz question, seeded daily, not one already tracked in SRS
  const quizPool = POP_QUIZ.filter((q) => !state.srs[`quiz:${q.id}`]);
  const fallbackPool = quizPool.length ? quizPool : POP_QUIZ;
  const quizPick = fallbackPool.length ? seededShuffle(fallbackPool, `${day}|quiz`)[0]! : null;

  // Assemble: reviews -> (lesson midway) -> new cards interleaved -> quiz last
  const mid = Math.ceil(items.length / 2);
  const assembled: SessionItem[] = [
    ...items.slice(0, mid),
    ...(lesson ? [{ type: 'lesson', id: lesson } as SessionItem] : []),
    ...items.slice(mid),
    ...newItems,
    ...(quizPick ? [{ type: 'quiz', id: quizPick.id } as SessionItem] : []),
  ];

  return {
    date: day,
    items: assembled,
    idx: 0,
    xp: 0,
    correct: 0,
    answered: 0,
    combo: 0,
    bestCombo: 0,
    done: false,
    startedAt: now.toISOString(),
  };
}

export function previewSession(state: ForgeState, cards: SwipeCard[], now = new Date()): SessionPreview {
  const snap = buildSession(state, cards, now);
  const reviews = snap.items.filter((i) => i.type === 'review').length;
  const news = snap.items.filter((i) => i.type === 'new').length;
  const lesson = snap.items.find((i) => i.type === 'lesson')?.id ?? null;
  const quiz = snap.items.some((i) => i.type === 'quiz');
  const estMinutes = Math.max(2, Math.round(reviews * 0.4 + news * 0.7 + (lesson ? 3 : 0) + (quiz ? 0.5 : 0)));
  return { reviews, news, lesson, quiz, estMinutes };
}

/** A 3-minute reviews-only rescue session (still saves the streak). */
export function buildQuickSession(state: ForgeState, now = new Date()): SessionSnapshot {
  const full = buildSession(state, [], now);
  const reviews = full.items.filter((i) => i.type === 'review').slice(0, 6);
  return { ...full, items: reviews };
}

/** Extra reviews / practice after the goal — never new lesson content
 * (tomorrow's plot is protected). */
export function buildBonusRound(state: ForgeState, cards: SwipeCard[], now = new Date()): SessionItem[] {
  const inSession = new Set((state.session?.items ?? []).map((i) => `${i.type}:${i.id}`));
  const due = Object.entries(state.srs)
    .filter(([, e]) => isDue(e, now))
    .filter(([key]) => !inSession.has(`review:${key}`))
    .slice(0, 8)
    .map(([key]) => ({ type: 'review', id: key }) as SessionItem);
  if (due.length) return due;
  const seen = new Set(state.seenCards);
  const fresh = cards.filter((c) => !seen.has(c.id));
  return seededShuffle(fresh, `${todayStr(now)}|bonus`)
    .slice(0, 5)
    .map((c) => ({ type: 'new', id: c.id }) as SessionItem);
}

/** Review forecast for the next N days (Today screen + You dashboard). */
export function forecast(state: ForgeState, days: number, now = new Date()): number[] {
  const buckets = new Array<number>(days).fill(0);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  for (const e of Object.values(state.srs)) {
    const d = Math.floor((new Date(e.due).getTime() - start.getTime()) / 86_400_000);
    const idx = Math.max(0, d); // overdue counts as today
    if (idx < days) buckets[idx]! += 1;
  }
  return buckets;
}
