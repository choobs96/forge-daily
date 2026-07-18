<script lang="ts">
  import { store } from '../lib/state/store.svelte';
  import { router } from '../lib/router.svelte';
  import { moduleById, PROBLEMS, bossQuiz, HANDBOOK } from '../content/content';

  let { id }: { id: string } = $props();
  const m = $derived(moduleById(id));
  const s = $derived(store.state);
  const probs = $derived(m ? PROBLEMS.filter((p) => m.problemIds.includes(p.id)) : []);
  const hasHandbook = $derived(HANDBOOK.some((h) => h.id === id));
</script>

{#if !m}
  <div class="page"><p class="muted">Module not found.</p></div>
{:else}
  <div class="page">
    <header class="chrome">
      <button class="close" onclick={() => router.go('path')} aria-label="Back">←</button>
      <span class="chip primary">Module {m.n} · {m.level}</span>
    </header>
    <h1 class="mtitle">{m.title}</h1>
    <p class="dim">{m.subtitle}</p>

    <div class="section-h small muted">LESSONS</div>
    <div class="list">
      {#each m.lessons as l (l.id)}
        <button class="card row" onclick={() => router.go(`lesson/${l.id}`)}>
          <span class="check" class:on={!!s.progress.lessons[l.id]}>{s.progress.lessons[l.id] ? '✓' : ''}</span>
          <span class="row-t">{l.title}</span>
        </button>
      {/each}
      {#if bossQuiz(m).length}
        <button class="card row boss" onclick={() => router.go(`boss/${id}`)}>
          <span class="b-ic">👑</span>
          <span class="row-t">{id in s.progress.modules ? `Boss cleared · best ${s.progress.bosses[id]}%` : 'Boss quiz — pass to unlock the next unit'}</span>
        </button>
      {/if}
    </div>

    {#if probs.length}
      <div class="section-h small muted">PRACTICE ({probs.length})</div>
      <div class="list">
        {#each probs as p (p.id)}
          <button class="card row" onclick={() => router.go(`problem/${p.id}`)}>
            <span class="check" class:on={!!s.progress.problems[p.id]}>{s.progress.problems[p.id] ? '✓' : ''}</span>
            <span class="row-t">{p.title}</span>
            <span class="chip">{p.diff}</span>
          </button>
        {/each}
      </div>
    {/if}

    {#if hasHandbook}
      <button class="btn btn-ghost btn-block" style="margin-top:16px" onclick={() => router.go(`read/${id}`)}>
        📖 Read the full chapter in the Library
      </button>
    {/if}
  </div>
{/if}

<style>
  .chrome { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .close { font-size: 22px; color: var(--text-muted); padding: 4px 10px 4px 0; }
  .mtitle { font-size: 22px; margin-bottom: 2px; }
  .section-h { margin: 18px 0 8px; letter-spacing: 0.08em; }
  .list { display: flex; flex-direction: column; gap: 8px; }
  .row { display: flex; align-items: center; gap: 10px; text-align: left; width: 100%; padding: 12px 14px; }
  .row-t { flex: 1; font-size: 14.5px; font-weight: 600; }
  .check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--surface-3);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }
  .check.on { background: var(--success); border-color: var(--success); color: #04331f; font-weight: 900; }
  .boss { border-color: var(--gold); }
  .b-ic { font-size: 18px; }
</style>
