export interface SrsEntry {
  kind: 'card' | 'quiz';
  due: string; // ISO datetime
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: number; // ts-fsrs State enum value
  last?: string;
  seen: number;
  correct: number;
}

export type SessionItemType = 'review' | 'new' | 'quiz' | 'lesson';
export interface SessionItem {
  type: SessionItemType;
  /** card id, quiz question id, or lesson id */
  id: string;
  /** for re-queued in-session relearn items */
  relearn?: boolean;
}
export interface SessionSnapshot {
  date: string;
  items: SessionItem[];
  idx: number;
  xp: number;
  correct: number;
  answered: number;
  combo: number;
  bestCombo: number;
  done: boolean;
  startedAt: string;
}

export interface ForgeState {
  v: 2;
  profile: {
    createdAt: string;
    dailyGoalXp: number; // 20 | 40 | 60
    newPerDay: number;
    haptics: boolean;
  };
  xp: {
    total: number;
    byDay: Record<string, number>; // capped to last 60 days
  };
  streak: {
    current: number;
    best: number;
    lastActiveDay: string; // '' if never
    freezes: number;
    freezeEarnedAtStreak: number; // streak length when last freeze was granted
    repairUsedDay: string; // last day a streak repair was used
    pendingRepair: { brokenStreak: number; offeredDay: string } | null;
  };
  progress: {
    lessons: Record<string, string>; // lessonId -> completedAt ISO
    modules: Record<string, string>; // moduleId -> completedAt (boss passed)
    problems: Record<string, string>; // problemId -> solvedAt
    bosses: Record<string, number>; // moduleId -> best score pct
  };
  srs: Record<string, SrsEntry>; // 'card:<id>' | 'quiz:<id>'
  badges: Record<string, string>; // badgeId -> earnedAt
  seenCards: string[];
  session: SessionSnapshot | null;
  stats: {
    reviewsDone: number;
    newLearned: number;
    quizCorrect: number;
    quizTotal: number;
    sessionsCompleted: number;
  };
}

export const STORE_KEY = 'forge:v2';

export function emptyState(now = new Date()): ForgeState {
  return {
    v: 2,
    profile: { createdAt: now.toISOString(), dailyGoalXp: 40, newPerDay: 3, haptics: true },
    xp: { total: 0, byDay: {} },
    streak: {
      current: 0,
      best: 0,
      lastActiveDay: '',
      freezes: 0,
      freezeEarnedAtStreak: 0,
      repairUsedDay: '',
      pendingRepair: null,
    },
    progress: { lessons: {}, modules: {}, problems: {}, bosses: {} },
    srs: {},
    badges: {},
    seenCards: [],
    session: null,
    stats: { reviewsDone: 0, newLearned: 0, quizCorrect: 0, quizTotal: 0, sessionsCompleted: 0 },
  };
}
