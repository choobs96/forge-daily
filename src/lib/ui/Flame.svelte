<script lang="ts">
  import { flameStage } from '../gamify/streak';

  let { streak, size = 'md' }: { streak: number; size?: 'sm' | 'md' | 'lg' } = $props();
  const stage = $derived(flameStage(streak));
  const icon = $derived(stage === 'none' ? '🩶' : stage === 'ember' ? '🔥' : stage === 'flame' ? '🔥' : stage === 'blue' ? '🔵' : '⚪');
</script>

<span class="flame {stage} {size}" title="{streak}-day streak">
  <span class="ic">{stage === 'blue' ? '🔥' : stage === 'white' ? '🔥' : icon}</span>
  <b>{streak}</b>
</span>

<style>
  .flame {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-weight: 800;
    color: var(--ember-2);
  }
  .flame.none { color: var(--text-muted); }
  .flame.none .ic { filter: grayscale(1) opacity(0.5); }
  .flame.blue .ic { filter: hue-rotate(190deg) saturate(1.6); }
  .flame.white .ic { filter: saturate(0.1) brightness(1.8); }
  .flame.blue { color: #7ab5ff; }
  .flame.white { color: #fff; }
  .flame.lg { font-size: 24px; }
  .flame.lg .ic { font-size: 30px; }
  .flame.sm { font-size: 13px; }
  .flame.flame .ic, .flame.blue .ic, .flame.white .ic { animation: flicker 2.4s ease-in-out infinite; display: inline-block; }
  @keyframes flicker {
    0%, 100% { transform: scale(1) rotate(-2deg); }
    50% { transform: scale(1.12) rotate(2deg); }
  }
</style>
