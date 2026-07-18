<script lang="ts">
  import { store } from '../lib/state/store.svelte';
  import { router } from '../lib/router.svelte';
  import { ACTS, MODULES, moduleById, bossQuiz } from '../content/content';
  import { masteryNotch } from '../lib/srs/engine';
  import { CAT_TO_MODULE } from '../content/content';

  const s = $derived(store.state);

  /** module unlocked = first module, or previous module's boss passed */
  function unlocked(mid: string): boolean {
    const idx = MODULES.findIndex((m) => m.id === mid);
    if (idx <= 0) return true;
    return MODULES[idx - 1]!.id in s.progress.modules;
  }
  function lessonDone(id: string): boolean {
    return id in s.progress.lessons;
  }
  function modulePct(mid: string): number {
    const m = moduleById(mid)!;
    if (!m.lessons.length) return mid in s.progress.modules ? 100 : 0;
    const done = m.lessons.filter((l) => lessonDone(l.id)).length;
    return Math.round((done / m.lessons.length) * 100);
  }
  /** SRS health for a module: avg mastery of its attached cards (0..1) */
  function moduleHealth(mid: string): number {
    const entries = Object.entries(s.srs).filter(([k]) => {
      if (!k.startsWith('card:')) return false;
      const card = store.cards.find((c) => `card:${c.id}` === k);
      return card ? CAT_TO_MODULE[card.cat] === mid : false;
    });
    if (!entries.length) return 0;
    return entries.reduce((a, [, e]) => a + masteryNotch(e) / 6, 0) / entries.length;
  }
  /** the "current" node: first incomplete lesson of first unlocked-incomplete module */
  const currentLesson = $derived.by(() => {
    for (const m of MODULES) {
      for (const l of m.lessons) if (!lessonDone(l.id)) return l.id;
    }
    return null;
  });
  function rings(mid: string): number {
    const m = moduleById(mid)!;
    const learned = m.lessons.every((l) => lessonDone(l.id)) && m.lessons.length > 0;
    const bossPassed = mid in s.progress.modules;
    const mastered = moduleHealth(mid) >= 0.6;
    return (learned ? 1 : 0) + (bossPassed ? 1 : 0) + (mastered ? 1 : 0);
  }
</script>

<div class="page">
  <h1 class="title">Your Path</h1>
  <p class="muted small" style="margin-top:-6px">13 units · 4 acts · Analyst → Engineer</p>

  {#each ACTS as act (act.title)}
    <div class="act">
      <div class="act-head">{act.icon} {act.title}</div>
      {#each act.modules as mid (mid)}
        {@const m = moduleById(mid)!}
        {@const isOpen = unlocked(mid)}
        {@const pct = modulePct(mid)}
        {@const r = rings(mid)}
        <div class="unit card" class:locked={!isOpen}>
          <button class="unit-head" onclick={() => router.go(`module/${mid}`)}>
            <div class="unit-line">
              <span class="unit-n">M{m.n}</span>
              <b class="unit-title">{m.title}</b>
              <span class="rings" title="learned · boss · mastered">
                {#each [0, 1, 2] as i}
                  <span class="ring-dot" class:on={i < r}></span>
                {/each}
              </span>
            </div>
            <div class="unit-sub dim small">{m.subtitle}</div>
            <div class="progress-track" style="margin-top:8px">
              <div class="progress-fill" style="width:{pct}%"></div>
            </div>
          </button>

          {#if isOpen}
            <div class="nodes">
              {#each m.lessons as l, i (l.id)}
                <button
                  class="node"
                  class:done={lessonDone(l.id)}
                  class:current={currentLesson === l.id}
                  style="margin-left:{[8, 34, 52, 34][i % 4]}px"
                  onclick={() => router.go(`lesson/${l.id}`)}
                >
                  <span class="node-ic">{lessonDone(l.id) ? '●' : currentLesson === l.id ? '▶' : '○'}</span>
                  <span class="node-label">{l.title.replace(/^Lesson [\d.]+ [—-] /, '')}</span>
                </button>
              {/each}
              {#if bossQuiz(m).length}
                <button
                  class="node boss"
                  class:done={mid in s.progress.modules}
                  onclick={() => router.go(`boss/${mid}`)}
                >
                  <span class="node-ic">👑</span>
                  <span class="node-label">{mid in s.progress.modules ? `Boss cleared · ${s.progress.bosses[mid]}%` : 'Boss quiz'}</span>
                </button>
              {/if}
            </div>
          {:else}
            <div class="testout">
              🔒 Locked — <button class="testout-btn" onclick={() => router.go(`boss/${mid}`)}>Test out →</button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .title { font-size: 24px; font-weight: 900; }
  .act { margin-top: 20px; }
  .act-head {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 10px;
  }
  .unit { margin-bottom: 12px; padding: 14px; }
  .unit.locked { opacity: 0.65; }
  .unit-head { display: block; width: 100%; text-align: left; }
  .unit-line { display: flex; align-items: center; gap: 8px; }
  .unit-n {
    font-size: 11px;
    font-weight: 900;
    background: var(--primary-soft);
    color: var(--primary);
    padding: 2px 7px;
    border-radius: 6px;
  }
  .unit-title { flex: 1; font-size: 16px; }
  .rings { display: flex; gap: 3px; }
  .ring-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--surface-3);
  }
  .ring-dot.on { background: var(--gold); border-color: var(--gold); box-shadow: 0 0 6px rgba(251, 191, 36, 0.6); }
  .nodes { margin-top: 12px; display: flex; flex-direction: column; gap: 7px; }
  .node {
    display: flex;
    align-items: center;
    gap: 9px;
    text-align: left;
    color: var(--text-dim);
    font-size: 14.5px;
    padding: 6px 10px;
    border-radius: 10px;
    transition: background 0.15s;
    width: fit-content;
    max-width: calc(100% - 52px);
  }
  .node:active { background: var(--surface-2); }
  .node-ic { font-size: 15px; color: var(--surface-3); }
  .node.done { color: var(--text-muted); }
  .node.done .node-ic { color: var(--success); }
  .node.current { color: var(--text); font-weight: 700; }
  .node.current .node-ic {
    color: var(--ember);
    animation: pulse-node 1.6s ease-in-out infinite;
    display: inline-block;
  }
  @keyframes pulse-node { 50% { transform: scale(1.35); } }
  .node.boss { color: var(--gold); font-weight: 700; margin-left: 8px !important; }
  .testout { margin-top: 10px; font-size: 13.5px; color: var(--text-muted); }
  .testout-btn { color: var(--primary); font-weight: 700; font-size: 13.5px; }
</style>
