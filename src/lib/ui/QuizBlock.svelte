<script lang="ts">
  import type { QuizQuestion } from '../../content/content';
  import { shuffle, haptic } from '../util';

  let {
    question,
    onanswer,
  }: {
    question: QuizQuestion;
    onanswer: (correct: boolean) => void;
  } = $props();

  let picked = $state<number | null>(null);
  let opts = $derived(shuffle(question.opts.map((o, i) => ({ ...o, key: i }))));
  // re-shuffle only when the question changes
  $effect(() => {
    void question.id;
    picked = null;
  });

  function pick(i: number) {
    if (picked !== null) return;
    picked = i;
    const correct = opts[i]!.correct;
    haptic(correct ? 10 : [15, 30, 15]);
    setTimeout(() => onanswer(correct), correct ? 900 : 1800);
  }
  const explanation = $derived(picked !== null ? (opts[picked]!.explain ?? opts.find((o) => o.correct)?.explain ?? '') : '');
</script>

<div class="quiz card">
  <div class="q prose">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html question.q}
  </div>
  <div class="opts">
    {#each opts as o, i (o.key)}
      <button
        class="opt"
        class:correct={picked !== null && o.correct}
        class:wrong={picked === i && !o.correct}
        class:faded={picked !== null && picked !== i && !o.correct}
        onclick={() => pick(i)}
      >
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html o.text}
      </button>
    {/each}
  </div>
  {#if picked !== null && explanation}
    <div class="explain" class:good={opts[picked]!.correct}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html explanation}
    </div>
  {/if}
</div>

<style>
  .q { font-weight: 600; margin-bottom: 14px; font-size: 16.5px; }
  .opts { display: flex; flex-direction: column; gap: 9px; }
  .opt {
    text-align: left;
    background: var(--surface-2);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    font-size: 15px;
    line-height: 1.45;
    transition: transform 0.12s var(--spring), border-color 0.15s, background 0.15s, opacity 0.2s;
  }
  .opt:active { transform: scale(0.98); }
  .opt.correct { border-color: var(--success); background: var(--success-soft); }
  .opt.wrong { border-color: var(--error); background: var(--error-soft); animation: shake 0.35s; }
  .opt.faded { opacity: 0.45; }
  .explain {
    margin-top: 12px;
    font-size: 14px;
    color: var(--text-dim);
    background: var(--error-soft);
    border-left: 3px solid var(--error);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    padding: 9px 12px;
    animation: page-in 0.25s var(--spring);
  }
  .explain.good { background: var(--success-soft); border-color: var(--success); }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }
</style>
