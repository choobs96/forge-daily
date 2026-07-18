import type { ForgeState } from '../state/schema';

export interface BadgeDef {
  id: string;
  icon: string;
  name: string;
  desc: string;
  hidden?: boolean;
  cond: (s: ForgeState) => boolean;
}

const moduleDone = (s: ForgeState, id: string) => id in s.progress.modules;
const solvedCount = (s: ForgeState) => Object.keys(s.progress.problems).length;
const lessonsDone = (s: ForgeState) => Object.keys(s.progress.lessons).length;

/** Ported from course.html's 18 BADGES, re-cut against the v2 state so ~6 are
 * reachable in the first month (early wins), plus hidden variable-reward ones. */
export const BADGES: BadgeDef[] = [
  { id: 'first-step', icon: '👣', name: 'First Step', desc: 'Complete your first lesson', cond: (s) => lessonsDone(s) >= 1 },
  { id: 'first-session', icon: '⚒️', name: 'Lit the Forge', desc: 'Complete your first session', cond: (s) => s.stats.sessionsCompleted >= 1 },
  { id: 'ten-cards', icon: '🃏', name: 'Card Collector', desc: 'Learn 10 cards', cond: (s) => s.stats.newLearned >= 10 },
  { id: 'fifty-cards', icon: '🎴', name: 'Deck Builder', desc: 'Learn 50 cards', cond: (s) => s.stats.newLearned >= 50 },
  { id: 'hundred-reviews', icon: '🔁', name: 'The Grind', desc: '100 reviews done', cond: (s) => s.stats.reviewsDone >= 100 },
  { id: 'sql-slinger', icon: '🗡️', name: 'SQL Slinger', desc: 'Pass the Advanced SQL boss', cond: (s) => moduleDone(s, 'm1') },
  { id: 'pythonista', icon: '🐍', name: 'Pythonista', desc: 'Pass the Python boss', cond: (s) => moduleDone(s, 'm2') },
  { id: 'git-flow', icon: '🌿', name: 'Git Flow', desc: 'Pass the Git & CI/CD boss', cond: (s) => moduleDone(s, 'm3') },
  { id: 'modeling-master', icon: '⭐', name: 'Modeling Master', desc: 'Pass the Data Modeling boss', cond: (s) => moduleDone(s, 'm4') },
  { id: 'dbt-disciple', icon: '🧱', name: 'dbt Disciple', desc: 'Pass the dbt boss', cond: (s) => moduleDone(s, 'm6') },
  { id: 'spark-whisperer', icon: '⚡', name: 'Spark Whisperer', desc: 'Pass the Spark boss', cond: (s) => moduleDone(s, 'm7') },
  { id: 'cdc-detective', icon: '🕵️', name: 'CDC Detective', desc: 'Pass the Ingestion & CDC boss', cond: (s) => moduleDone(s, 'm9') },
  { id: 'dq-guardian', icon: '🛡️', name: 'DQ Guardian', desc: 'Pass the Data Quality boss', cond: (s) => moduleDone(s, 'm10') },
  { id: 'architect', icon: '🏗️', name: 'System Architect', desc: 'Pass the System Design boss', cond: (s) => moduleDone(s, 'm11') },
  { id: 'half-way', icon: '🌗', name: 'Half Way', desc: 'Pass 7 module bosses', cond: (s) => Object.keys(s.progress.modules).length >= 7 },
  { id: 'completionist', icon: '👑', name: 'The Completionist', desc: 'Pass all 13 bosses', cond: (s) => Object.keys(s.progress.modules).length >= 13 },
  { id: 'hot-streak', icon: '🔥', name: 'Hot Streak', desc: '7-day streak', cond: (s) => s.streak.current >= 7 || s.streak.best >= 7 },
  { id: 'on-fire', icon: '🌋', name: 'On Fire', desc: '30-day streak', cond: (s) => s.streak.current >= 30 || s.streak.best >= 30 },
  { id: 'centurion', icon: '💎', name: 'Centurion', desc: '100-day streak', cond: (s) => s.streak.best >= 100 },
  { id: 'practice-devotee', icon: '🎯', name: 'Practice Devotee', desc: 'Solve 20 problems', cond: (s) => solvedCount(s) >= 20 },
  { id: 'arena-champion', icon: '🏆', name: 'Arena Champion', desc: 'Solve all 43 problems', cond: (s) => solvedCount(s) >= 43 },
  { id: 'night-owl', icon: '🦉', name: 'Night Owl', desc: 'Session after 11pm', hidden: true, cond: () => new Date().getHours() >= 23 },
  { id: 'early-bird', icon: '🐦', name: 'Early Bird', desc: 'Session before 6am', hidden: true, cond: () => new Date().getHours() < 6 },
  { id: 'perfect-ten', icon: '💯', name: 'Flawless', desc: '10+ correct, none wrong, in one session', hidden: true,
    cond: (s) => (s.session?.done ?? false) && (s.session?.answered ?? 0) >= 10 && s.session?.correct === s.session?.answered },
];

/** Returns newly earned badges and stamps them into state. */
export function checkBadges(s: ForgeState, now = new Date()): BadgeDef[] {
  const earned: BadgeDef[] = [];
  for (const b of BADGES) {
    if (s.badges[b.id]) continue;
    if (b.cond(s)) {
      s.badges[b.id] = now.toISOString();
      earned.push(b);
    }
  }
  return earned;
}
