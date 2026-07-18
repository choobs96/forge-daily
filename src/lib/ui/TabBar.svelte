<script lang="ts">
  import { router } from '../router.svelte';

  const tabs = [
    { id: 'today', icon: '🔥', label: 'Today' },
    { id: 'path', icon: '🗺️', label: 'Path' },
    { id: 'drill', icon: '⚔️', label: 'Drill' },
    { id: 'library', icon: '📚', label: 'Library' },
    { id: 'you', icon: '👤', label: 'You' },
  ];
  const active = $derived(router.route);
</script>

<nav class="tabbar">
  {#each tabs as t (t.id)}
    <button class="tab" class:active={active === t.id} onclick={() => router.go(t.id)} aria-label={t.label}>
      <span class="icon">{t.icon}</span>
      <span class="label">{t.label}</span>
    </button>
  {/each}
</nav>

<style>
  .tabbar {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 540px;
    height: var(--tab-h);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    background: rgba(19, 22, 50, 0.92);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-top: 1px solid var(--border);
    z-index: 50;
  }
  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: var(--text-muted);
    transition: transform 0.15s var(--spring);
  }
  .tab:active { transform: scale(0.9); }
  .icon { font-size: 21px; filter: grayscale(1) opacity(0.65); transition: filter 0.2s; }
  .label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.02em; }
  .tab.active { color: var(--text); }
  .tab.active .icon { filter: none; }
</style>
