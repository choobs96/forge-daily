<script lang="ts">
  import { store } from '../lib/state/store.svelte';
  import { router } from '../lib/router.svelte';
  import { PROBLEMS } from '../content/content';

  const s = $derived(store.state);
  let filter = $state('all');
  let search = $state('');

  const CAT_NAMES: Record<string, string> = {
    sql: 'SQL', dbt: 'dbt', python: 'Python', spark: 'Spark', model: 'Modeling', design: 'System Design',
  };
  const filters = ['all', 'sql', 'dbt', 'python', 'spark', 'model', 'design', 'easy', 'medium', 'hard', 'unsolved'];

  const solved = $derived(new Set(Object.keys(s.progress.problems)));
  const filtered = $derived(
    PROBLEMS.filter((p) => {
      if (filter === 'unsolved' && solved.has(p.id)) return false;
      if (['easy', 'medium', 'hard'].includes(filter) && p.diff !== filter) return false;
      if (Object.keys(CAT_NAMES).includes(filter) && !p.cats.includes(filter)) return false;
      if (search) {
        const t = `${p.title} ${p.statement}`.toLowerCase();
        if (!t.includes(search.toLowerCase())) return false;
      }
      return true;
    })
  );
  const pct = $derived(Math.round((solved.size / PROBLEMS.length) * 100));
</script>

<div class="page">
  <h1 class="title">⚔️ Drill</h1>
  <div class="card hero">
    <div class="hero-row">
      <div><b class="hero-n">{solved.size}</b><span class="dim">/{PROBLEMS.length} solved</span></div>
      <span class="chip success">{pct}%</span>
    </div>
    <div class="progress-track" style="margin-top:8px">
      <div class="progress-fill" style="width:{pct}%"></div>
    </div>
  </div>

  <input class="search" type="search" placeholder="Search problems…" bind:value={search} />
  <div class="filters">
    {#each filters as f (f)}
      <button class="fbtn" class:active={filter === f} onclick={() => (filter = f)}>
        {CAT_NAMES[f] ?? f}
      </button>
    {/each}
  </div>

  <div class="list">
    {#each filtered as p (p.id)}
      <button class="prob card" onclick={() => router.go(`problem/${p.id}`)}>
        <div class="prob-line">
          <span class="check" class:on={solved.has(p.id)}>{solved.has(p.id) ? '✓' : ''}</span>
          <b class="prob-title">{p.title}</b>
          <span class="diff {p.diff}">{p.diff}</span>
        </div>
        <div class="cats">
          {#each p.cats as c}<span class="chip">{CAT_NAMES[c] ?? c}</span>{/each}
        </div>
      </button>
    {:else}
      <p class="muted">No problems match.</p>
    {/each}
  </div>
</div>

<style>
  .title { font-size: 24px; font-weight: 900; }
  .hero { margin-bottom: 14px; }
  .hero-row { display: flex; justify-content: space-between; align-items: center; }
  .hero-n { font-size: 26px; }
  .search {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    padding: 11px 14px;
    font: inherit;
    margin-bottom: 10px;
  }
  .filters { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 8px; -webkit-overflow-scrolling: touch; }
  .fbtn {
    flex-shrink: 0;
    padding: 6px 13px;
    border-radius: 999px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-dim);
    font-size: 13px;
    font-weight: 700;
    text-transform: capitalize;
  }
  .fbtn.active { background: var(--primary-soft); color: var(--primary); border-color: var(--primary); }
  .list { display: flex; flex-direction: column; gap: 9px; }
  .prob { text-align: left; padding: 13px 14px; }
  .prob-line { display: flex; align-items: center; gap: 9px; }
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
  .prob-title { flex: 1; font-size: 15px; }
  .diff { font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; }
  .diff.easy { color: var(--success); background: var(--success-soft); }
  .diff.medium { color: var(--gold); background: rgba(251, 191, 36, 0.12); }
  .diff.hard { color: var(--error); background: var(--error-soft); }
  .cats { display: flex; gap: 5px; margin-top: 7px; }
</style>
