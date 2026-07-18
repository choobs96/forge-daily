import { LEVELS } from '../../content/content';

export const XP = {
  review: 5,
  newCard: 15,
  quiz: 10,
  lessonStep: 20,
  lessonComplete: 10,
  problem: 30,
  problemHard: 40,
  bossPass: 60,
  bossRetake: 15,
  goalMet: 10,
  deepDive: 50,
} as const;

export const COMBO_THRESHOLD = 5;
export const COMBO_MULT = 1.5;

export interface LevelInfo {
  lvl: number;
  title: string;
  floor: number;
  next: number | null;
  pct: number;
}

export function calcLevel(xp: number): LevelInfo {
  let cur = LEVELS[0]!;
  let next: (typeof LEVELS)[number] | null = null;
  for (const l of LEVELS) {
    if (xp >= l.xp) cur = l;
    else {
      next = l;
      break;
    }
  }
  const span = next ? next.xp - cur.xp : 1;
  return {
    lvl: cur.lvl,
    title: cur.title,
    floor: cur.xp,
    next: next ? next.xp : null,
    pct: next ? Math.min(100, Math.round(((xp - cur.xp) / span) * 100)) : 100,
  };
}

export function comboXp(base: number, combo: number): number {
  return combo >= COMBO_THRESHOLD ? Math.round(base * COMBO_MULT) : base;
}
