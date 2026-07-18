<script lang="ts">
  import { router } from '../lib/router.svelte';
  import { HANDBOOK } from '../content/content';

  let { id }: { id: string } = $props();
  const ch = $derived(HANDBOOK.find((h) => h.id === id));
  const idx = $derived(HANDBOOK.findIndex((h) => h.id === id));
</script>

{#if !ch}
  <div class="page"><p class="muted">Chapter not found.</p></div>
{:else}
  <div class="page reader">
    <header class="chrome">
      <button class="close" onclick={() => router.go('library')} aria-label="Back">←</button>
      <span class="chip">{ch.words} words</span>
    </header>
    <h1 class="rtitle">{ch.title}</h1>
    <p class="dim">{ch.subtitle}</p>
    <article class="prose">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html ch.html}
    </article>
    <div class="pager">
      {#if idx > 0}
        <button class="btn btn-ghost" onclick={() => router.go(`read/${HANDBOOK[idx - 1]!.id}`)}>← {HANDBOOK[idx - 1]!.title}</button>
      {:else}<span></span>{/if}
      {#if idx < HANDBOOK.length - 1}
        <button class="btn btn-ghost" onclick={() => router.go(`read/${HANDBOOK[idx + 1]!.id}`)}>{HANDBOOK[idx + 1]!.title} →</button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .chrome { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .close { font-size: 22px; color: var(--text-muted); padding: 4px 10px 4px 0; }
  .rtitle { font-size: 23px; }
  .pager { display: flex; flex-direction: column; gap: 9px; margin-top: 22px; }
  .pager .btn { font-size: 13.5px; text-align: left; white-space: normal; }
</style>
