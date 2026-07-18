<script lang="ts">
  import { store } from '../lib/state/store.svelte';
  import { router } from '../lib/router.svelte';
  import { moduleById, bossQuiz } from '../content/content';
  import QuizBlock from '../lib/ui/QuizBlock.svelte';
  import Confetti from '../lib/ui/Confetti.svelte';

  let { id }: { id: string } = $props();

  const module = $derived(moduleById(id));
  const questions = $derived(module ? bossQuiz(module) : []);
  let idx = $state(0);
  let correct = $state(0);
  let result = $state<{ passed: boolean; xp: number; pct: number } | null>(null);

  $effect(() => {
    void id;
    idx = 0;
    correct = 0;
    result = null;
  });

  function answered(ok: boolean) {
    if (ok) correct += 1;
    if (idx < questions.length - 1) {
      idx += 1;
    } else {
      const pct = Math.round((correct / questions.length) * 100);
      const r = store.recordBoss(id, pct);
      result = { ...r, pct };
    }
  }
</script>

{#if !module}
  <div class="page"><p class="muted">Module not found.</p></div>
{:else if result}
  {#if result.passed}<Confetti />{/if}
  <div class="page done">
    <div class="big">{result.passed ? '👑' : '⚔️'}</div>
    <h1>{result.passed ? 'Boss cleared!' : 'Not this time'}</h1>
    <p class="dim">{correct}/{questions.length} correct · {result.pct}%</p>
    {#if result.xp}<div class="xp">+{result.xp} XP</div>{/if}
    {#if !result.passed}
      <p class="muted small">You need 70%. Review the lessons and come back — the anvil will be here.</p>
    {/if}
    <div class="actions">
      <button class="btn btn-ghost" onclick={() => router.go('path')}>Path</button>
      {#if !result.passed}
        <button class="btn btn-primary" onclick={() => { idx = 0; correct = 0; result = null; }}>Retry</button>
      {:else}
        <button class="btn btn-primary" onclick={() => router.go('today')}>Continue</button>
      {/if}
    </div>
  </div>
{:else if questions.length === 0}
  <div class="page"><p class="muted">No boss quiz for this unit yet.</p></div>
{:else}
  <div class="page">
    <header class="chrome">
      <button class="close" onclick={() => router.go('path')} aria-label="Exit">✕</button>
      <div class="progress-track" style="flex:1">
        <div class="progress-fill ember" style="width:{(idx / questions.length) * 100}%"></div>
      </div>
      <span class="chip ember">👑 BOSS</span>
    </header>
    <h2 class="btitle">{module.title}</h2>
    <p class="muted small">Question {idx + 1} of {questions.length} · pass at 70%</p>
    {#key idx}
      <QuizBlock question={questions[idx]!} onanswer={answered} />
    {/key}
  </div>
{/if}

<style>
  .chrome { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .close { font-size: 20px; color: var(--text-muted); padding: 6px 10px; }
  .btitle { font-size: 20px; margin-bottom: 2px; }
  .done { text-align: center; padding-top: 10dvh; }
  .big { font-size: 52px; }
  .xp { color: var(--purple); font-weight: 900; font-size: 22px; margin: 8px 0; }
  .actions { display: grid; grid-template-columns: 1fr 1.6fr; gap: 10px; margin-top: 18px; }
</style>
