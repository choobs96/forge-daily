<script lang="ts">
  import { router } from './lib/router.svelte';
  import { store } from './lib/state/store.svelte';
  import TabBar from './lib/ui/TabBar.svelte';
  import Today from './routes/Today.svelte';
  import Session from './routes/Session.svelte';
  import Path from './routes/Path.svelte';
  import Module from './routes/Module.svelte';
  import Lesson from './routes/Lesson.svelte';
  import Boss from './routes/Boss.svelte';
  import Drill from './routes/Drill.svelte';
  import Problem from './routes/Problem.svelte';
  import Library from './routes/Library.svelte';
  import Reader from './routes/Reader.svelte';
  import You from './routes/You.svelte';

  const route = $derived(router.route);
  const p0 = $derived(router.params[0] ?? '');
  const p1 = $derived(router.params[1] ?? '');
  /** lesson ids look like 'm3/l2' — rejoin the param segments */
  const lessonId = $derived(p1 ? `${p0}/${p1}` : p0);
  const fullscreen = $derived(['session', 'lesson', 'boss'].includes(route));

  // update app badge + refresh streak-at-risk state on resume
  $effect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') void store.updateAppBadge();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  });
</script>

{#if route === 'session'}
  <Session />
{:else if route === 'lesson'}
  <Lesson id={lessonId} />
{:else if route === 'boss'}
  <Boss id={p0} />
{:else if route === 'path'}
  <Path />
{:else if route === 'module'}
  <Module id={p0} />
{:else if route === 'drill'}
  <Drill />
{:else if route === 'problem'}
  <Problem id={p0} />
{:else if route === 'library'}
  <Library />
{:else if route === 'read'}
  <Reader id={p0} />
{:else if route === 'you'}
  <You />
{:else}
  <Today />
{/if}

{#if !fullscreen}
  <TabBar />
{/if}
