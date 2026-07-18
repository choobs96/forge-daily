<script lang="ts">
  import type { SwipeCard } from '../cards/loader';
  import { haptic } from '../util';

  let {
    card,
    revealed = $bindable(false),
    ongrade,
  }: {
    card: SwipeCard;
    revealed?: boolean;
    ongrade: (g: 'again' | 'good') => void;
  } = $props();

  let el: HTMLDivElement | undefined = $state();
  let dx = $state(0);
  let dragging = $state(false);
  let flying = $state<'left' | 'right' | null>(null);
  let startX = 0;
  let startY = 0;
  let lockedAxis: 'x' | 'y' | null = null;

  const COMMIT = 100;

  function down(e: PointerEvent) {
    if (flying) return;
    startX = e.clientX;
    startY = e.clientY;
    lockedAxis = null;
    dragging = true;
    // NOTE: do NOT capture the pointer here — capture retargets the eventual
    // click away from child buttons (Tap to reveal, links). Capture only once
    // a horizontal drag is actually detected, in move().
  }
  function move(e: PointerEvent) {
    if (!dragging || flying) return;
    const mx = e.clientX - startX;
    const my = e.clientY - startY;
    if (!lockedAxis) {
      if (Math.abs(mx) > 8 || Math.abs(my) > 8) {
        lockedAxis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
        if (lockedAxis === 'x') el?.setPointerCapture(e.pointerId);
      } else return;
    }
    if (lockedAxis === 'x') dx = mx;
  }
  function up() {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(dx) > COMMIT) {
      if (!revealed) {
        // active-recall gate: can't grade before revealing
        revealed = true;
        dx = 0;
        return;
      }
      commit(dx > 0 ? 'good' : 'again');
    } else {
      dx = 0;
    }
  }
  function commit(g: 'again' | 'good') {
    if (!revealed) {
      revealed = true;
      return;
    }
    flying = g === 'good' ? 'right' : 'left';
    haptic(g === 'good' ? 10 : [15, 30, 15]);
    setTimeout(() => ongrade(g), 260);
  }

  const rot = $derived(dx * 0.05);
  const stampOpacity = $derived(Math.min(1, Math.abs(dx) / 110));
</script>

<!-- svelte-ignore a11y_no_static_element_interactions — drag is an enhancement; the grade buttons below are the accessible path -->
<div
  bind:this={el}
  class="scard"
  class:dragging
  class:fly-left={flying === 'left'}
  class:fly-right={flying === 'right'}
  style="transform: translateX({flying ? (flying === 'right' ? 600 : -600) : dx}px) rotate({flying ? (flying === 'right' ? 16 : -16) : rot}deg)"
  onpointerdown={down}
  onpointermove={move}
  onpointerup={up}
  onpointercancel={up}
>
  <div class="stamp got" style="opacity:{dx > 0 && revealed ? stampOpacity : 0}">GOT IT</div>
  <div class="stamp forgot" style="opacity:{dx < 0 && revealed ? stampOpacity : 0}">FORGOT</div>

  <div class="head">
    <span class="chip primary">{card.cat}</span>
    <span class="chip">{card.level}</span>
  </div>
  <h2>{card.title}</h2>
  {#if card.hook}<p class="hook">"{card.hook}"</p>{/if}

  {#if revealed}
    <div class="body prose">
      <!-- eslint-disable-next-line svelte/no-at-html-tags — trusted authored content -->
      {@html card.body}
      {#if card.src}<a class="src" href={card.src} target="_blank" rel="noopener">source ↗</a>{/if}
    </div>
  {:else}
    <button class="reveal" onclick={() => (revealed = true)}>
      <span class="cue">Try to recall it from memory first</span>
      <span class="tap">Tap to reveal</span>
    </button>
  {/if}
</div>

{#if revealed}
  <div class="grade-row">
    <button class="btn btn-danger-ghost" onclick={() => commit('again')}>😅 Forgot</button>
    <button class="btn btn-success" onclick={() => commit('good')}>✅ Got it</button>
  </div>
{/if}

<style>
  .scard {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 20px;
    box-shadow: var(--shadow);
    touch-action: pan-y;
    user-select: none;
    transition: transform 0.35s var(--spring), opacity 0.3s;
    will-change: transform;
    overflow: hidden;
    max-height: 62dvh;
    overflow-y: auto;
  }
  .scard.dragging { transition: none; cursor: grabbing; }
  .scard.fly-left, .scard.fly-right { opacity: 0; transition: transform 0.3s ease-in, opacity 0.3s; }
  .head { display: flex; gap: 8px; margin-bottom: 10px; }
  h2 { font-size: 21px; }
  .hook { color: var(--ember-2); font-style: italic; margin: 0 0 12px; }
  .body :global(p:last-child) { margin-bottom: 0; }
  .src { display: inline-block; margin-top: 10px; font-size: 13px; }
  .reveal {
    width: 100%;
    border: 2px dashed var(--border);
    border-radius: var(--radius-sm);
    padding: 26px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    color: var(--text-dim);
  }
  .cue { font-size: 12.5px; color: var(--text-muted); }
  .tap { font-weight: 700; color: var(--primary); }
  .stamp {
    position: absolute;
    top: 18px;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 0.08em;
    padding: 5px 14px;
    border-radius: 10px;
    border: 3px solid;
    transform: rotate(-13deg);
    pointer-events: none;
    z-index: 2;
    transition: opacity 0.1s;
  }
  .stamp.got { right: 16px; color: var(--success); border-color: var(--success); transform: rotate(13deg); background: rgba(10, 12, 30, 0.7); }
  .stamp.forgot { left: 16px; color: var(--error); border-color: var(--error); background: rgba(10, 12, 30, 0.7); }
  .grade-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 14px;
    animation: page-in 0.25s var(--spring);
  }
</style>
