<script lang="ts">
  import { store } from '../lib/state/store.svelte';
  import { router } from '../lib/router.svelte';
  import { PROBLEMS } from '../content/content';
  import { haptic } from '../lib/util';

  let { id }: { id: string } = $props();
  const p = $derived(PROBLEMS.find((x) => x.id === id));
  const solved = $derived(!!store.state.progress.problems[id]);

  let showHint = $state(false);
  let showSolution = $state(false);
  let earned = $state(0);

  $effect(() => {
    void id;
    showHint = false;
    showSolution = false;
    earned = 0;
  });

  function markSolved() {
    if (!p) return;
    earned = store.solveProblem(p.id, p.diff, showSolution);
    haptic([15, 30, 15]);
  }
</script>

{#if !p}
  <div class="page"><p class="muted">Problem not found.</p></div>
{:else}
  <div class="page">
    <header class="chrome">
      <button class="close" onclick={() => router.go('drill')} aria-label="Back">←</button>
      <span class="diff {p.diff}">{p.diff}</span>
    </header>
    <h1 class="ptitle">{p.title}</h1>
    <div class="card prose">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html p.statement}
    </div>

    <div class="stack">
      {#if !showHint}
        <button class="btn btn-ghost btn-block" onclick={() => (showHint = true)}>💡 Show hint</button>
      {:else}
        <div class="card hint prose">
          <div class="small muted" style="margin-bottom:4px">HINT</div>
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html p.hint}
        </div>
      {/if}

      {#if !showSolution}
        <button class="btn btn-ghost btn-block" onclick={() => (showSolution = true)}>🔓 Reveal solution</button>
      {:else}
        <div class="card prose">
          <div class="small muted" style="margin-bottom:4px">SOLUTION</div>
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html p.solution}
          {#if p.explain}
            <div class="explain">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html p.explain}
            </div>
          {/if}
        </div>
      {/if}

      {#if solved}
        <div class="solved-note">✅ Solved{earned ? ` · +${earned} XP` : ''}</div>
        <button class="btn btn-ghost btn-block" onclick={() => store.unsolveProblem(p.id)}>↺ Mark unsolved</button>
      {:else}
        <button class="btn btn-success btn-block" onclick={markSolved}>
          ✓ I solved it {showSolution ? '(with solution — half XP)' : ''}
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .chrome { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .close { font-size: 22px; color: var(--text-muted); padding: 4px 10px 4px 0; }
  .ptitle { font-size: 21px; margin-bottom: 12px; }
  .stack { display: flex; flex-direction: column; gap: 11px; margin-top: 13px; }
  .hint { border-color: var(--gold); }
  .explain { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border); color: var(--text-dim); font-size: 14.5px; }
  .solved-note { text-align: center; color: var(--success); font-weight: 800; }
  .diff { font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; }
  .diff.easy { color: var(--success); background: var(--success-soft); }
  .diff.medium { color: var(--gold); background: rgba(251, 191, 36, 0.12); }
  .diff.hard { color: var(--error); background: var(--error-soft); }
</style>
