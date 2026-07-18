<script lang="ts">
  let { value, goal, size = 130, label = '' }: { value: number; goal: number; size?: number; label?: string } = $props();

  const r = $derived((size - 14) / 2);
  const circ = $derived(2 * Math.PI * r);
  const pct = $derived(Math.min(1, goal > 0 ? value / goal : 0));
  const done = $derived(pct >= 1);
</script>

<div class="ring" style="width:{size}px;height:{size}px">
  <svg width={size} height={size} viewBox="0 0 {size} {size}">
    <circle cx={size / 2} cy={size / 2} {r} fill="none" stroke="var(--surface-2)" stroke-width="10" />
    <circle
      cx={size / 2}
      cy={size / 2}
      {r}
      fill="none"
      stroke={done ? 'url(#ember-grad)' : 'url(#ring-grad)'}
      stroke-width="10"
      stroke-linecap="round"
      stroke-dasharray={circ}
      stroke-dashoffset={circ * (1 - pct)}
      transform="rotate(-90 {size / 2} {size / 2})"
      class="fill"
    />
    <defs>
      <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4f7cff" />
        <stop offset="1" stop-color="#a78bfa" />
      </linearGradient>
      <linearGradient id="ember-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff8a3d" />
        <stop offset="1" stop-color="#ffb84d" />
      </linearGradient>
    </defs>
  </svg>
  <div class="center">
    <div class="value" class:done>{value}<span class="goal">/{goal}</span></div>
    {#if label}<div class="label">{label}</div>{/if}
  </div>
</div>

<style>
  .ring { position: relative; display: inline-block; }
  .fill { transition: stroke-dashoffset 0.8s var(--spring); }
  .center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .value { font-size: 26px; font-weight: 800; }
  .value.done { color: var(--ember-2); }
  .goal { font-size: 14px; font-weight: 600; color: var(--text-muted); }
  .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
</style>
