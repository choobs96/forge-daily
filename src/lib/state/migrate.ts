import { emptyState, type ForgeState } from './schema';
import { seedFromLeitner } from '../srs/engine';
import { todayStr } from '../util';

/**
 * One-time migration of every legacy store into forge:v2.
 * Legacy keys are read but NOT deleted (rollback safety; cleanup is a later
 * phase). Nothing the user earned is lost:
 *   ae-progress          index.html module completion
 *   forge-completed      course/learn module completion
 *   forge-solved-ids     solved problems (learn + practice shared)
 *   forge-xp             base XP
 *   forge-swipe-xp       swipe XP (summed into total — fixes the split)
 *   forge-streak/last-visit
 *   forge-swipe          Leitner SRS state {byId:{box,due,seen}}
 */
export function migrateLegacy(storage: Pick<Storage, 'getItem'>, now = new Date()): ForgeState {
  const state = emptyState(now);
  const read = (k: string): unknown => {
    try {
      const raw = storage.getItem(k);
      return raw == null ? null : JSON.parse(raw);
    } catch {
      return storage.getItem(k);
    }
  };

  // --- module completion (union of both legacy stores) ---
  const completed = new Set<string>();
  const ae = read('ae-progress');
  if (Array.isArray(ae)) for (const id of ae) completed.add(String(id));
  const fc = read('forge-completed');
  if (Array.isArray(fc)) for (const id of fc) completed.add(String(id));
  for (const id of completed) {
    state.progress.modules[id] = now.toISOString();
    state.progress.bosses[id] = 100;
  }

  // --- solved problems ---
  const solved = read('forge-solved-ids');
  if (Array.isArray(solved)) for (const id of solved) state.progress.problems[String(id)] = now.toISOString();

  // --- XP: sum the two legacy pools ---
  const baseXp = Number(read('forge-xp')) || 0;
  const swipeXp = Number(read('forge-swipe-xp')) || 0;
  state.xp.total = Math.max(0, baseXp + swipeXp);

  // --- streak ---
  const streak = Number(read('forge-streak')) || 0;
  const lastVisitRaw = storage.getItem('forge-last-visit');
  let lastActive = '';
  if (lastVisitRaw) {
    const d = new Date(lastVisitRaw);
    if (!Number.isNaN(d.getTime())) lastActive = todayStr(d);
  }
  state.streak.current = streak;
  state.streak.best = streak;
  state.streak.lastActiveDay = lastActive;

  // --- SRS: Leitner boxes -> FSRS seeds, preserving due dates ---
  const swipe = read('forge-swipe') as { byId?: Record<string, { box?: number; due?: string; seen?: boolean }> } | null;
  if (swipe?.byId && typeof swipe.byId === 'object') {
    for (const [cardId, v] of Object.entries(swipe.byId)) {
      if (!v || typeof v !== 'object') continue;
      const box = Number(v.box) || 0;
      const due = typeof v.due === 'string' ? v.due : todayStr(now);
      state.srs[`card:${cardId}`] = seedFromLeitner(box, due, 'card');
      state.seenCards.push(cardId);
    }
  }

  // --- derived stats seeds ---
  state.stats.newLearned = state.seenCards.length;

  return state;
}

export function hasLegacyData(storage: Pick<Storage, 'getItem'>): boolean {
  return ['ae-progress', 'forge-completed', 'forge-swipe', 'forge-xp', 'forge-streak'].some(
    (k) => storage.getItem(k) != null
  );
}
