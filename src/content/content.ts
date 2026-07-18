import modulesJson from './modules.json';
import problemsJson from './problems.json';
import levelsJson from './levels.json';
import popQuizJson from './popQuiz.json';
import tipsJson from './tips.json';
import practicesJson from './practices.json';
import resourcesJson from './resources.json';
import faqJson from './faq.json';
import handbookJson from './handbook.json';

export interface QuizOpt {
  text: string;
  correct: boolean;
  explain?: string;
}
export interface QuizQuestion {
  id: string;
  q: string;
  opts: QuizOpt[];
  module?: string;
}
export interface Lesson {
  id: string;
  title: string;
  screens: string[];
  html: string;
}
export interface ModuleQuizRaw {
  q: string;
  opts: [string, boolean, string][];
}
export interface Module {
  id: string;
  n: number;
  title: string;
  subtitle: string;
  level: string;
  xp: number;
  desc: string;
  problemIds: string[];
  quiz: ModuleQuizRaw | null;
  recap: string[];
  lessons: Lesson[];
  bossQuestions: QuizQuestion[];
}
export interface Problem {
  id: string;
  title: string;
  diff: 'easy' | 'medium' | 'hard';
  cats: string[];
  statement: string;
  hint: string;
  solution: string;
  explain: string;
}
export interface LevelDef {
  lvl: number;
  xp: number;
  title: string;
}
export interface HandbookChapter {
  id: string;
  title: string;
  subtitle: string;
  html: string;
  words: number;
}

export const MODULES = modulesJson as unknown as Module[];
export const PROBLEMS = problemsJson as unknown as Problem[];
export const LEVELS = levelsJson as unknown as LevelDef[];
export const TIPS = tipsJson as unknown as string[];
export const PRACTICES = practicesJson as unknown as string[];
export const RESOURCES = resourcesJson as unknown as Record<string, unknown[]>;
export const FAQ = faqJson as unknown as { q: string; a: string }[];
export const HANDBOOK = handbookJson as unknown as HandbookChapter[];

/** Pop-quiz pool normalized to QuizQuestion. Sources use two shapes. */
export const POP_QUIZ: QuizQuestion[] = (popQuizJson as unknown as Record<string, unknown>[]).map((raw, i) => {
  if (Array.isArray(raw.opts) && Array.isArray((raw.opts as unknown[])[0])) {
    const opts = (raw.opts as [string, boolean, string?][]).map(([text, correct, explain]) => ({ text, correct, explain }));
    return { id: `pop-${i}`, q: String(raw.q), opts };
  }
  // index.html popQuizPool shape: {q, options:[..], answer: idx, why}
  const options = (raw.options ?? raw.opts) as string[];
  const answer = Number(raw.answer ?? raw.a ?? 0);
  return {
    id: `pop-${i}`,
    q: String(raw.q),
    opts: options.map((text, j) => ({ text, correct: j === answer, explain: j === answer ? String(raw.why ?? '') : undefined })),
  };
});

/** Boss quiz for a module: module quiz + extracted inline quizzes. */
export function bossQuiz(m: Module): QuizQuestion[] {
  const qs: QuizQuestion[] = [];
  if (m.quiz) {
    qs.push({
      id: `${m.id}-boss-main`,
      q: m.quiz.q,
      opts: m.quiz.opts.map(([text, correct, explain]) => ({ text, correct, explain })),
      module: m.id,
    });
  }
  qs.push(...m.bossQuestions);
  return qs;
}

/** Which module a swipe-card category reinforces (for new-card prioritization). */
export const CAT_TO_MODULE: Record<string, string> = {
  SQL: 'm1',
  Modeling: 'm4',
  Platform: 'm5',
  dbt: 'm6',
  Spark: 'm7',
  Streaming: 'm9',
  DQ: 'm10',
  Role: 'm12',
  Career: 'm12',
};

export const ACTS: { title: string; icon: string; modules: string[] }[] = [
  { title: 'Act I · Foundations', icon: '🔨', modules: ['m0', 'm1', 'm2', 'm3'] },
  { title: 'Act II · The Warehouse', icon: '🏛️', modules: ['m4', 'm5', 'm6', 'm7'] },
  { title: 'Act III · Pipelines', icon: '🔥', modules: ['m8', 'm9', 'm10'] },
  { title: 'Act IV · The Forge Master', icon: '⚔️', modules: ['m11', 'm12'] },
];

/** Find any quiz question by id (pop pool, boss questions, module quizzes). */
export function quizById(id: string): QuizQuestion | undefined {
  const pop = POP_QUIZ.find((q) => q.id === id);
  if (pop) return pop;
  for (const m of MODULES) {
    const bq = m.bossQuestions.find((q) => q.id === id);
    if (bq) return bq;
    if (id === `${m.id}-boss-main`) return bossQuiz(m).find((q) => q.id === id);
  }
  return undefined;
}

export function moduleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}
export function lessonById(id: string): { module: Module; lesson: Lesson } | undefined {
  const mid = id.split('/')[0]!;
  const m = moduleById(mid);
  const l = m?.lessons.find((x) => x.id === id);
  return m && l ? { module: m, lesson: l } : undefined;
}
