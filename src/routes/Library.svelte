<script lang="ts">
  import { router } from '../lib/router.svelte';
  import { store } from '../lib/state/store.svelte';
  import { HANDBOOK, MODULES, RESOURCES, PRACTICES, TIPS, FAQ } from '../content/content';
  import { seededRng, todayStr } from '../lib/util';

  let search = $state('');
  let tab = $state<'handbook' | 'resources' | 'practices' | 'faq'>('handbook');

  const tipOfDay = $derived(TIPS.length ? TIPS[Math.floor(seededRng(todayStr())() * TIPS.length)] : '');

  const chapters = $derived(
    HANDBOOK.filter((h) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return h.title.toLowerCase().includes(q) || h.html.toLowerCase().includes(q);
    })
  );
  function lessonsDone(mid: string): string {
    const m = MODULES.find((x) => x.id === mid);
    if (!m?.lessons.length) return '';
    const done = m.lessons.filter((l) => store.state.progress.lessons[l.id]).length;
    return `${done}/${m.lessons.length}`;
  }
  const resourceCats = $derived(Object.entries(RESOURCES));
</script>

<div class="page">
  <h1 class="title">📚 Library</h1>

  {#if tipOfDay}
    <div class="card tip prose small">
      <span class="muted">💡 TIP OF THE DAY — </span>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html tipOfDay}
    </div>
  {/if}

  <div class="tabs">
    {#each [['handbook', 'Handbook'], ['resources', 'Resources'], ['practices', 'Best practices'], ['faq', 'FAQ']] as [id, label] (id)}
      <button class="tab-btn" class:active={tab === id} onclick={() => (tab = id as typeof tab)}>{label}</button>
    {/each}
  </div>

  {#if tab === 'handbook'}
    <input class="search" type="search" placeholder="Search the full handbook…" bind:value={search} />
    <p class="muted small">The complete long-form curriculum — every word preserved, readable any time.</p>
    <div class="list">
      {#each chapters as h (h.id)}
        <button class="card row" onclick={() => router.go(`read/${h.id}`)}>
          <div class="row-main">
            <b>{h.title}</b>
            <div class="dim small">{h.subtitle}</div>
          </div>
          <div class="row-side">
            <span class="chip">{h.words}w</span>
            {#if lessonsDone(h.id)}<span class="chip primary">{lessonsDone(h.id)}</span>{/if}
          </div>
        </button>
      {/each}
    </div>
    <a class="card row legacy-link" href="legacy/relationships-explainer.html">
      <div class="row-main">
        <b>⭐ Deep Dive: Relationships tests in multi-layer lineage</b>
        <div class="dim small">Interactive scrollytelling explainer with live diagrams</div>
      </div>
    </a>
  {:else if tab === 'resources'}
    {#each resourceCats as [cat, items] (cat)}
      <div class="res-cat">
        <h3 class="res-head">{cat}</h3>
        {#each items as r}
          <div class="card res prose small">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <b>{@html String((r as Record<string, unknown>).title ?? '')}</b>
            {#if (r as Record<string, unknown>).author}<span class="dim"> — {(r as Record<string, unknown>).author}</span>{/if}
            {#if (r as Record<string, unknown>).why}
              <div class="dim" style="margin-top:3px">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html String((r as Record<string, unknown>).why)}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  {:else if tab === 'practices'}
    <ol class="prac">
      {#each PRACTICES as pr, i}
        <li class="card prose small">
          <b class="prac-n">{i + 1}</b>
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html pr}
        </li>
      {/each}
    </ol>
  {:else}
    {#each FAQ as f}
      <details class="card faq">
        <summary><b>{f.q}</b></summary>
        <div class="prose small dim" style="margin-top:8px">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html f.a}
        </div>
      </details>
    {/each}
  {/if}
</div>

<style>
  .title { font-size: 24px; font-weight: 900; }
  .tip { margin-bottom: 12px; border-style: dashed; }
  .tabs { display: flex; gap: 7px; overflow-x: auto; margin-bottom: 12px; padding-bottom: 4px; }
  .tab-btn {
    flex-shrink: 0;
    padding: 7px 14px;
    border-radius: 999px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-dim);
    font-size: 13.5px;
    font-weight: 700;
  }
  .tab-btn.active { background: var(--primary-soft); color: var(--primary); border-color: var(--primary); }
  .search {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    padding: 11px 14px;
    font: inherit;
    margin-bottom: 8px;
  }
  .list { display: flex; flex-direction: column; gap: 9px; }
  .row { display: flex; align-items: center; gap: 10px; text-align: left; width: 100%; padding: 13px 14px; }
  .row-main { flex: 1; }
  .row-side { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
  .legacy-link { margin-top: 9px; border-color: var(--gold); display: flex; color: var(--text); }
  .res-cat { margin-bottom: 14px; }
  .res-head { text-transform: capitalize; font-size: 15px; color: var(--text-dim); margin: 10px 0 8px; }
  .res { margin-bottom: 8px; }
  .prac { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  .prac-n { color: var(--ember-2); margin-right: 8px; }
  .faq { margin-bottom: 8px; }
  summary { cursor: pointer; }
</style>
