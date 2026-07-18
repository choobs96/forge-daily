<script lang="ts">
  import { store } from '../lib/state/store.svelte';
  import { router } from '../lib/router.svelte';
  import { previewSession, forecast } from '../lib/session/builder';
  import { lessonById, moduleById } from '../content/content';
  import GoalRing from '../lib/ui/GoalRing.svelte';
  import Flame from '../lib/ui/Flame.svelte';
  import { seededShuffle, todayStr } from '../lib/util';

  const s = $derived(store.state);
  const preview = $derived(store.cardsReady ? previewSession(s, store.cards) : null);
  const fc = $derived(forecast(s, 7));
  const sessionDone = $derived(s.session?.date === store.today && s.session.done);
  const inProgress = $derived(s.session?.date === store.today && !s.session.done && s.session.idx > 0);
  const nextL = $derived(preview?.lesson ? lessonById(preview.lesson) : undefined);
  const hour = new Date().getHours();

  const cta = $derived(
    sessionDone
      ? 'GOAL MET — FORGE MORE?'
      : inProgress
        ? '▶ CONTINUE FORGING'
        : hour >= 22 && store.xpToday === 0
          ? '⚡ QUICK SAVE — 3 MIN'
          : '▶ START TODAY’S SESSION'
  );

  // mystery card of the day (deterministic)
  let mysteryOpen = $state(false);
  const mystery = $derived(
    store.cards.length ? seededShuffle(store.cards, `${todayStr()}|mystery`)[0]! : null
  );

  function start() {
    if (sessionDone) store.extendSession();
    store.ensureSession();
    router.go('session');
  }
  function quick() {
    store.startQuickSession();
    router.go('session');
  }
  const greeting = $derived(hour < 5 ? 'Night shift?' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');
  const streakAtRisk = $derived(s.streak.current > 0 && s.streak.lastActiveDay !== store.today && hour >= 18);
</script>

<div class="page">
  <header class="top">
    <div>
      <div class="brand">FORGE</div>
      <div class="muted small">{greeting} — {s.streak.current > 0 ? 'keep the flame alive' : 'light the flame'}</div>
    </div>
    <Flame streak={s.streak.current} />
  </header>

  {#if s.streak.pendingRepair}
    <div class="card repair">
      <b>💔 Your {s.streak.pendingRepair.brokenStreak}-day streak broke.</b>
      <p class="dim small">The anvil doesn't care. Complete a <b>double session</b> today to reforge it — one-time offer.</p>
    </div>
  {:else if streakAtRisk}
    <div class="card risk">🔥 <b>Streak at risk</b> — a 3-minute session before midnight keeps it.</div>
  {/if}

  <div class="ring-wrap">
    <GoalRing value={store.xpToday} goal={s.profile.dailyGoalXp} label="daily XP" />
  </div>

  <button class="btn btn-ember btn-block cta" onclick={start}>
    <span class="cta-main">{cta}</span>
    {#if preview && !sessionDone}
      <span class="cta-sub">
        ~{preview.estMinutes} min · {preview.reviews} reviews{preview.news ? ` · ${preview.news} new` : ''}{preview.lesson ? ' · 1 lesson step' : ''}
      </span>
    {/if}
  </button>
  {#if !sessionDone && preview && preview.reviews > 0}
    <button class="quick-link" onclick={quick}>Short on time? 3-min reviews only →</button>
  {/if}

  {#if nextL}
    <button class="card next-up" onclick={() => router.go(`lesson/${nextL.lesson.id}`)}>
      <div class="small muted">UP NEXT ON YOUR PATH</div>
      <div class="next-title">📘 {moduleById(nextL.module.id)?.title} — {nextL.lesson.title}</div>
    </button>
  {/if}

  <div class="card forecast">
    <div class="small muted" style="margin-bottom:8px">📬 REVIEW FORECAST</div>
    <div class="fc-row">
      {#each fc as n, i}
        <div class="fc-day">
          <div class="fc-bar-wrap"><div class="fc-bar" style="height:{Math.min(100, n * 12)}%"></div></div>
          <div class="fc-n">{n}</div>
          <div class="fc-label">{i === 0 ? 'today' : i === 1 ? 'tmrw' : `+${i}`}</div>
        </div>
      {/each}
    </div>
  </div>

  {#if mystery}
    <button class="card mystery" onclick={() => (mysteryOpen = !mysteryOpen)}>
      <div class="small muted">✦ CARD OF THE DAY</div>
      {#if mysteryOpen}
        <div class="m-title">{mystery.title}</div>
        <div class="prose small dim">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html mystery.body}
        </div>
      {:else}
        <div class="m-title">??? <span class="dim small">tap to unveil</span></div>
      {/if}
    </button>
  {/if}
</div>

<style>
  .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .brand {
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.14em;
    background: var(--ember-grad);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .ring-wrap { display: flex; justify-content: center; margin: 18px 0 22px; }
  .cta { flex-direction: column; gap: 3px; padding: 16px; border-radius: var(--radius); }
  .cta-main { font-size: 18px; letter-spacing: 0.03em; }
  .cta-sub { font-size: 12.5px; font-weight: 600; opacity: 0.75; }
  .quick-link { display: block; margin: 10px auto 0; color: var(--text-muted); font-size: 13.5px; font-weight: 600; }
  .next-up { display: block; width: 100%; text-align: left; margin-top: 18px; }
  .next-title { font-weight: 700; margin-top: 4px; }
  .forecast { margin-top: 14px; }
  .fc-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; align-items: end; }
  .fc-day { text-align: center; }
  .fc-bar-wrap { height: 44px; display: flex; align-items: flex-end; justify-content: center; }
  .fc-bar { width: 55%; min-height: 3px; border-radius: 4px 4px 0 0; background: var(--primary-grad); opacity: 0.85; }
  .fc-n { font-size: 12px; font-weight: 700; margin-top: 3px; }
  .fc-label { font-size: 10px; color: var(--text-muted); }
  .mystery { display: block; width: 100%; text-align: left; margin-top: 14px; border-style: dashed; }
  .m-title { font-weight: 800; margin-top: 4px; }
  .repair, .risk { margin-bottom: 14px; border-color: var(--ember); }
  .repair p { margin: 6px 0 0; }
</style>
