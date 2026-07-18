import { fsrs, createEmptyCard, Rating, State, generatorParameters, type Card, type Grade as FsrsGrade } from 'ts-fsrs';
import type { SrsEntry } from '../state/schema';

export type Grade = 'again' | 'good' | 'easy';

// enable_short_term=false: a once-a-day app has no use for 10-minute learning
// steps — a correct answer on a NEW item schedules days out immediately.
// This is what makes "same card again tomorrow after I knew it" impossible.
const scheduler = fsrs(generatorParameters({ enable_fuzz: true, enable_short_term: false }));

const RATING: Record<Grade, FsrsGrade> = { again: Rating.Again, good: Rating.Good, easy: Rating.Easy };

function toCard(e: SrsEntry, now: Date): Card {
  const base = createEmptyCard(now);
  return {
    ...base,
    due: new Date(e.due),
    stability: e.stability,
    difficulty: e.difficulty,
    reps: e.reps,
    lapses: e.lapses,
    state: e.state as State,
    last_review: e.last ? new Date(e.last) : undefined,
  };
}

function fromCard(c: Card, prev: Partial<SrsEntry>, kind: SrsEntry['kind'], grade: Grade): SrsEntry {
  return {
    kind,
    due: c.due.toISOString(),
    stability: c.stability,
    difficulty: c.difficulty,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last: c.last_review ? new Date(c.last_review).toISOString() : undefined,
    seen: (prev.seen ?? 0) + 1,
    correct: (prev.correct ?? 0) + (grade === 'again' ? 0 : 1),
  };
}

/** Grade an item; pass undefined entry for a first encounter. */
export function rate(entry: SrsEntry | undefined, kind: SrsEntry['kind'], grade: Grade, now = new Date()): SrsEntry {
  const card = entry ? toCard(entry, now) : createEmptyCard(now);
  const rec = scheduler.next(card, now, RATING[grade]);
  return fromCard(rec.card, entry ?? {}, kind, grade);
}

/** Days until an entry is due (negative = overdue). */
export function daysUntilDue(entry: SrsEntry, now = new Date()): number {
  return Math.ceil((new Date(entry.due).getTime() - now.getTime()) / 86_400_000);
}

export function isDue(entry: SrsEntry, now = new Date()): boolean {
  // Due-today counts: compare against end of local day.
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return new Date(entry.due).getTime() <= end.getTime();
}

/**
 * Seed an entry from the legacy Leitner box system.
 * box n had interval INTERVALS[n]; map interval -> stability and PRESERVE the
 * existing due date so migration never dumps every card on day one.
 */
const LEITNER_INTERVALS = [1, 7, 14, 30, 60, 120, 180];
export function seedFromLeitner(box: number, dueDateStr: string, kind: SrsEntry['kind'] = 'card'): SrsEntry {
  const b = Math.max(0, Math.min(6, box));
  const stability = LEITNER_INTERVALS[b]!;
  const due = new Date(`${dueDateStr}T08:00:00`);
  return {
    kind,
    due: Number.isNaN(due.getTime()) ? new Date().toISOString() : due.toISOString(),
    stability,
    difficulty: 5,
    reps: b + 1,
    lapses: 0,
    state: State.Review,
    seen: b + 1,
    correct: b,
  };
}

/** Mastery notch 0..6 for UI (box-dots equivalent) derived from stability. */
export function masteryNotch(entry: SrsEntry): number {
  const s = entry.stability;
  if (s >= 120) return 6;
  if (s >= 60) return 5;
  if (s >= 30) return 4;
  if (s >= 14) return 3;
  if (s >= 7) return 2;
  if (s >= 3) return 1;
  return 0;
}
