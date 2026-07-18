import type { ForgeState } from '../state/schema';
import { dayDiff } from '../util';

export const MAX_FREEZES = 2;
export const FREEZE_EVERY = 7;

/**
 * Advance the streak for a completed session on `day`.
 * Streak = "completed at least one session that day" — decoupled from the XP
 * goal on purpose (goal is the aspiration, streak is the habit).
 * Missed days are absorbed by freeze tokens; otherwise a one-time repair is
 * offered (double session) before the streak resets.
 */
export function recordActiveDay(s: ForgeState['streak'], day: string): { usedFreezes: number; broke: boolean } {
  if (!s.lastActiveDay) {
    s.current = 1;
    s.lastActiveDay = day;
    s.best = Math.max(s.best, s.current);
    return { usedFreezes: 0, broke: false };
  }
  const gap = dayDiff(s.lastActiveDay, day);
  if (gap <= 0) return { usedFreezes: 0, broke: false }; // same day
  let usedFreezes = 0;
  let broke = false;
  if (gap === 1) {
    s.current += 1;
  } else {
    const missed = gap - 1;
    if (missed <= s.freezes) {
      s.freezes -= missed;
      usedFreezes = missed;
      s.current += 1;
    } else {
      broke = true;
      s.pendingRepair = { brokenStreak: s.current, offeredDay: day };
      s.current = 1;
    }
  }
  s.lastActiveDay = day;
  // Earn a freeze every 7 consecutive days, hold max 2.
  if (s.current > 0 && s.current % FREEZE_EVERY === 0 && s.freezeEarnedAtStreak !== s.current) {
    if (s.freezes < MAX_FREEZES) s.freezes += 1;
    s.freezeEarnedAtStreak = s.current;
  }
  s.best = Math.max(s.best, s.current);
  return { usedFreezes, broke };
}

/** Streak repair: double session completed on the offer day restores the flame. */
export function tryRepair(s: ForgeState['streak'], day: string): boolean {
  if (!s.pendingRepair || s.pendingRepair.offeredDay !== day) return false;
  if (s.repairUsedDay && dayDiff(s.repairUsedDay, day) < 30) return false; // once per 30 days
  s.current = s.pendingRepair.brokenStreak + 1;
  s.best = Math.max(s.best, s.current);
  s.pendingRepair = null;
  s.repairUsedDay = day;
  return true;
}

export type FlameStage = 'none' | 'ember' | 'flame' | 'blue' | 'white';
export function flameStage(current: number): FlameStage {
  if (current <= 0) return 'none';
  if (current < 7) return 'ember';
  if (current < 30) return 'flame';
  if (current < 100) return 'blue';
  return 'white';
}
