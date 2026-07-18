<script lang="ts">
  import { store } from '../lib/state/store.svelte';
  import { router } from '../lib/router.svelte';
  import { lessonById } from '../content/content';
  import { haptic } from '../lib/util';

  let { id }: { id: string } = $props();

  const ref = $derived(lessonById(id));
  let screen = $state(0);
  let finished = $state(false);
  let earned = $state(0);

  $effect(() => {
    void id;
    screen = 0;
    finished = false;
  });

  function next() {
    if (!ref) return;
    haptic(6);
    if (screen < ref.lesson.screens.length - 1) screen += 1;
    else {
      earned = store.completeLesson(ref.lesson.id);
      finished = true;
    }
  }
  function prev() {
    if (screen > 0) screen -= 1;
  }
  const nextLessonId = $derived.by(() => {
    if (!ref) return null;
    const i = ref.module.lessons.findIndex((l) => l.id === id);
    return ref.module.lessons[i + 1]?.id ?? null;
  });
</script>

{#if !ref}
  <div class="page"><p class="muted">Lesson not found.</p></div>
{:else if finished}
  <div class="page done">
    <div class="big">📘✨</div>
    <h1>Lesson complete</h1>
    <div class="xp">+{earned} XP</div>
    {#if ref.module.recap.length}
      <div class="card recap">
        <div class="small muted" style="margin-bottom:6px">REMEMBER</div>
        <ul>
          {#each ref.module.recap.slice(0, 3) as r}
            <li class="prose"><!-- eslint-disable-next-line svelte/no-at-html-tags -->{@html r}</li>
          {/each}
        </ul>
      </div>
    {/if}
    <div class="actions">
      <button class="btn btn-ghost" onclick={() => router.go('path')}>Path</button>
      {#if nextLessonId}
        <button class="btn btn-primary" onclick={() => router.go(`lesson/${nextLessonId}`)}>Next lesson →</button>
      {:else}
        <button class="btn btn-ember" onclick={() => router.go(`boss/${ref.module.id}`)}>👑 Boss quiz</button>
      {/if}
    </div>
  </div>
{:else}
  <div class="player">
    <header class="chrome">
      <button class="close" onclick={() => router.go('path')} aria-label="Exit">✕</button>
      <div class="dots">
        {#each ref.lesson.screens as _, i}
          <div class="dot" class:on={i <= screen}></div>
        {/each}
      </div>
      <span class="chip primary">{ref.module.id.toUpperCase()}</span>
    </header>
    <h2 class="ltitle">{ref.lesson.title}</h2>
    {#key screen}
      <div class="card prose screen">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html ref.lesson.screens[screen]}
      </div>
    {/key}
    <div class="nav-row">
      <button class="btn btn-ghost" onclick={prev} disabled={screen === 0}>←</button>
      <button class="btn btn-primary nav-next" onclick={next}>
        {screen < ref.lesson.screens.length - 1 ? 'Continue' : '✓ Complete'}
      </button>
    </div>
  </div>
{/if}

<style>
  .player {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    padding: 14px 16px calc(env(safe-area-inset-bottom, 0px) + 18px);
    max-width: 540px;
    margin: 0 auto;
  }
  .chrome { display: flex; align-items: center; gap: 12px; }
  .close { font-size: 20px; color: var(--text-muted); padding: 6px 10px; }
  .dots { flex: 1; display: flex; gap: 4px; }
  .dot { flex: 1; height: 6px; border-radius: 4px; background: var(--surface-2); transition: background 0.25s; }
  .dot.on { background: var(--primary); }
  .ltitle { font-size: 19px; margin: 16px 0 10px; }
  .screen { flex: 1; overflow-y: auto; animation: page-in 0.28s var(--spring); margin-bottom: 14px; max-height: 66dvh; }
  .nav-row { display: grid; grid-template-columns: 64px 1fr; gap: 10px; }
  .done { text-align: center; padding-top: 10dvh; }
  .big { font-size: 50px; }
  .xp { color: var(--purple); font-weight: 900; font-size: 22px; margin: 6px 0 18px; }
  .recap { text-align: left; margin-bottom: 16px; }
  .recap ul { margin: 0; padding-left: 1.2em; }
  .actions { display: grid; grid-template-columns: 1fr 1.6fr; gap: 10px; }
</style>
