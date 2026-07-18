import { STORE_KEY, emptyState, type ForgeState, type SessionItem, type SessionSnapshot } from './schema';
import { migrateLegacy, hasLegacyData } from './migrate';
import { rate, type Grade } from '../srs/engine';
import { recordActiveDay, tryRepair } from '../gamify/streak';
import { checkBadges, type BadgeDef } from '../gamify/badges';
import { XP, comboXp, COMBO_THRESHOLD } from '../gamify/levels';
import { buildSession, buildQuickSession, buildBonusRound } from '../session/builder';
import { loadCards, type SwipeCard } from '../cards/loader';
import { todayStr } from '../util';

function load(): ForgeState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ForgeState;
      if (parsed.v === 2) return parsed;
    }
  } catch {
    /* corrupted -> fall through */
  }
  if (hasLegacyData(localStorage)) {
    const migrated = migrateLegacy(localStorage);
    localStorage.setItem(STORE_KEY, JSON.stringify(migrated));
    return migrated;
  }
  return emptyState();
}

class ForgeStore {
  state = $state<ForgeState>(load());
  cards = $state<SwipeCard[]>([]);
  cardsReady = $state(false);
  /** transient UI events */
  lastEarnedBadges = $state<BadgeDef[]>([]);
  toast = $state<{ msg: string; kind: 'xp' | 'info' | 'streak' } | null>(null);

  constructor() {
    this.persist(); // materialize forge:v2 on first boot (also stamps a migration)
    void loadCards().then((c) => {
      this.cards = c;
      this.cardsReady = true;
    });
  }

  persist() {
    // Trim xp.byDay to the last 60 days to bound growth.
    const days = Object.keys(this.state.xp.byDay).sort();
    for (const d of days.slice(0, Math.max(0, days.length - 60))) delete this.state.xp.byDay[d];
    localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
  }

  // ---------- XP ----------
  get today(): string {
    return todayStr();
  }
  get xpToday(): number {
    return this.state.xp.byDay[this.today] ?? 0;
  }
  get goalMet(): boolean {
    return this.xpToday >= this.state.profile.dailyGoalXp;
  }
  addXp(amount: number) {
    this.state.xp.total += amount;
    this.state.xp.byDay[this.today] = (this.state.xp.byDay[this.today] ?? 0) + amount;
  }

  // ---------- session lifecycle ----------
  /** Today's session, building/rebuilding if stale. */
  ensureSession(): SessionSnapshot {
    const s = this.state.session;
    if (s && s.date === this.today) return s;
    this.state.session = buildSession(this.state, this.cards);
    this.persist();
    return this.state.session;
  }

  startQuickSession() {
    this.state.session = buildQuickSession(this.state);
    this.persist();
  }

  currentItem(): SessionItem | null {
    const s = this.state.session;
    if (!s || s.done) return null;
    return s.items[s.idx] ?? null;
  }

  /**
   * Grade the current session item. Returns earned xp and the next due text.
   * Wrong answers re-queue near the end of the session (in-session relearn).
   */
  answer(grade: Grade, itemOverride?: SessionItem): { xp: number; entryKey: string } {
    const s = this.state.session;
    const item = itemOverride ?? this.currentItem();
    if (!s || !item) return { xp: 0, entryKey: '' };
    const correct = grade !== 'again';

    let entryKey = '';
    let base = 0;
    if (item.type === 'review') {
      entryKey = item.id;
      const prev = this.state.srs[entryKey];
      this.state.srs[entryKey] = rate(prev, prev?.kind ?? 'card', grade);
      base = correct ? XP.review : 0;
      if (correct) this.state.stats.reviewsDone += 1;
    } else if (item.type === 'new') {
      entryKey = `card:${item.id}`;
      this.state.srs[entryKey] = rate(undefined, 'card', grade);
      if (!this.state.seenCards.includes(item.id)) this.state.seenCards.push(item.id);
      base = correct ? XP.newCard : 0;
      if (correct) this.state.stats.newLearned += 1;
    } else if (item.type === 'quiz') {
      entryKey = `quiz:${item.id}`;
      this.state.srs[entryKey] = rate(this.state.srs[entryKey], 'quiz', grade);
      base = correct ? XP.quiz : 0;
      this.state.stats.quizTotal += 1;
      if (correct) this.state.stats.quizCorrect += 1;
    }

    s.answered += 1;
    if (correct) {
      s.correct += 1;
      s.combo += 1;
      s.bestCombo = Math.max(s.bestCombo, s.combo);
    } else {
      s.combo = 0;
      // in-session relearn: requeue a copy near the end (only once).
      // A relearned NEW card becomes a review item, whose ids are srs-key
      // prefixed ('card:<id>') — keep the format consistent.
      if (!item.relearn) {
        const relearnItem: SessionItem =
          item.type === 'new' ? { type: 'review', id: `card:${item.id}`, relearn: true } : { ...item, relearn: true };
        const insertAt = Math.min(s.items.length, s.idx + Math.max(3, s.items.length - s.idx - 1));
        s.items.splice(insertAt, 0, relearnItem);
      }
    }
    const earned = comboXp(base, s.combo);
    if (earned) this.addXp(earned);
    s.xp += earned;
    this.persist();
    return { xp: earned, entryKey };
  }

  /** Lesson step completed inside a session (or standalone from the Path). */
  completeLesson(lessonId: string): number {
    let earned: number = XP.lessonStep;
    if (!this.state.progress.lessons[lessonId]) {
      this.state.progress.lessons[lessonId] = new Date().toISOString();
      earned += XP.lessonComplete;
    } else {
      earned = Math.round(XP.lessonStep / 2); // re-doing a lesson
    }
    this.addXp(earned);
    const s = this.state.session;
    if (s) s.xp += earned;
    this.checkAndToastBadges();
    this.persist();
    return earned;
  }

  advance() {
    const s = this.state.session;
    if (!s) return;
    s.idx += 1;
    if (s.idx >= s.items.length) this.finishSession();
    this.persist();
  }

  finishSession() {
    const s = this.state.session;
    if (!s || s.done) return;
    s.done = true;
    if (this.goalMet) {
      this.addXp(XP.goalMet);
      s.xp += XP.goalMet;
    }
    this.state.stats.sessionsCompleted += 1;
    const res = recordActiveDay(this.state.streak, this.today);
    if (res.usedFreezes > 0) {
      this.toast = { msg: `🧊 ${res.usedFreezes} freeze${res.usedFreezes > 1 ? 's' : ''} held your flame`, kind: 'streak' };
    }
    this.checkAndToastBadges();
    this.persist();
    void this.updateAppBadge();
  }

  extendSession() {
    const s = this.state.session;
    if (!s) return;
    const bonus = buildBonusRound(this.state, this.cards);
    if (!bonus.length) return;
    s.items.push(...bonus);
    s.done = false;
    this.persist();
  }

  repairStreak(): boolean {
    const ok = tryRepair(this.state.streak, this.today);
    if (ok) this.persist();
    return ok;
  }

  // ---------- boss ----------
  recordBoss(moduleId: string, scorePct: number): { passed: boolean; xp: number } {
    const passed = scorePct >= 70;
    const prevBest = this.state.progress.bosses[moduleId] ?? -1;
    this.state.progress.bosses[moduleId] = Math.max(prevBest, scorePct);
    let earned = 0;
    if (passed && !(moduleId in this.state.progress.modules)) {
      this.state.progress.modules[moduleId] = new Date().toISOString();
      earned = XP.bossPass;
    } else if (passed) {
      earned = XP.bossRetake;
    }
    if (earned) this.addXp(earned);
    this.checkAndToastBadges();
    this.persist();
    return { passed, xp: earned };
  }

  // ---------- problems ----------
  solveProblem(id: string, diff: string, usedSolution: boolean): number {
    if (this.state.progress.problems[id]) return 0;
    this.state.progress.problems[id] = new Date().toISOString();
    const earned = usedSolution ? Math.round(XP.problem / 2) : diff === 'hard' ? XP.problemHard : XP.problem;
    this.addXp(earned);
    this.checkAndToastBadges();
    this.persist();
    return earned;
  }

  unsolveProblem(id: string) {
    delete this.state.progress.problems[id];
    this.persist();
  }

  // ---------- badges / notifications ----------
  checkAndToastBadges() {
    const earned = checkBadges(this.state);
    if (earned.length) this.lastEarnedBadges = earned;
  }

  async updateAppBadge() {
    try {
      const nav = navigator as Navigator & { setAppBadge?: (n: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
      const dueCount = Object.values(this.state.srs).filter((e) => new Date(e.due).getTime() <= Date.now()).length;
      if (dueCount > 0) await nav.setAppBadge?.(dueCount);
      else await nav.clearAppBadge?.();
    } catch {
      /* unsupported */
    }
  }

  // ---------- backup ----------
  exportJson(): string {
    return JSON.stringify(this.state, null, 2);
  }
  importJson(raw: string): boolean {
    try {
      const parsed = JSON.parse(raw) as ForgeState;
      if (parsed.v !== 2 || !parsed.profile || !parsed.srs) return false;
      this.state = parsed;
      this.persist();
      return true;
    } catch {
      return false;
    }
  }
  resetAll() {
    this.state = emptyState();
    this.persist();
  }
}

export const store = new ForgeStore();
