<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d')!;
    const W = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    const H = (canvas.height = canvas.offsetHeight * devicePixelRatio);
    const colors = ['#ff8a3d', '#ffb84d', '#4f7cff', '#a78bfa', '#3ddc97', '#fbbf24'];
    const N = 130;
    const parts = Array.from({ length: N }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.35,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 18 - 6,
      s: (Math.random() * 7 + 4) * devicePixelRatio,
      c: colors[Math.floor(Math.random() * colors.length)]!,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
    }));
    let frame = 0;
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.55;
        p.vx *= 0.99;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - frame / 110);
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      }
      frame++;
      if (frame < 120) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
  canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 90;
  }
</style>
