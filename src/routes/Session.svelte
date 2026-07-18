<script lang="ts">
  import { store } from '../lib/state/store.svelte';
  import { router } from '../lib/router.svelte';
  import { cardById } from '../lib/cards/loader';
  import { quizById, lessonById } from '../content/content';
  import { daysUntilDue } from '../lib/srs/engine';
  import { humanInterval, haptic } from '../lib/util';
  import SwipeCardView from '../lib/ui/SwipeCard.svelte';
  import QuizBlock from '../lib/ui/QuizBlock.svelte';
  import Confetti from '../lib/ui/Confetti.svelte';
  import Flame from '../lib/ui/Flame.svelte';

  const session = $derived(store.state.session);
  const item = $derived(session && !session.done ? (session.items[session.idx] ?? null) : null);

  let revealed = $state(false);
  let intervalToast = $state('');
  let xpFly = $state<{ amount: number; key: number } | null>(null);
  let toastTimer: ReturnType<typeof setTimeout>;

  // per-item derived content
  const cardId = $derived(
    item && (item.type === 'new' || (item.type === 'review' && item.id.startsWith('card:')))
      ? item.type === 'new'
        ? item.id
        : item.id.slice(5)
      : null
  );
  const card = $derived(cardId ? cardById(store.cards, cardId) : undefined);
  const quizId = $derived(
    item && (item.type === 'quiz' || (item.type === 'review' && item.id.startsWith('quiz:')))
      ? item.type === 'quiz'
        ? item.id
        : item.id.slice(5)
      : null
  );
  const quiz = $derived(quizId ? quizById(quizId) : undefined);
  const lessonRef = $derived(item?.type === 'lesson' ? lessonById(item.id) : undefined);
  let lessonScreen = $state(0);

  $effect(() => {
    void item;
    revealed = false;
    lessonScreen = 0;
  });

  function afterAnswer(res: { xp: number; entryKey: string }) {
    if (res.xp > 0) {
      xpFly = { amount: res.xp, key: Date.now() };
    }
    const entry = store.state.srs[res.entryKey];
    if (entry) {
      const d = daysUntilDue(entry);
      intervalToast = d <= 1 ? '😅 Again tomorrow' : `✅ Next review ${humanInterval(d)}`;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (intervalToast = ''), 1900);
    }
    setTimeout(() => store.advance(), 350);
  }

  function gradeCard(g: 'again' | 'good') {
    afterAnswer(store.answer(g));
  }
  function answerQuiz(correct: boolean) {
    afterAnswer(store.answer(correct ? 'good' : 'again'));
  }
  function lessonNext() {
    if (!lessonRef) return;
    haptic(6);
    if (lessonScreen < lessonRef.lesson.screens.length - 1) {
      lessonScreen += 1;
    } else {
      const earned = store.completeLesson(lessonRef.lesson.id);
      xpFly = { amount: earned, key: Date.now() };
      setTimeout(() => store.advance(), 350);
    }
  }
  function exit() {
    router.go('today');
  }

  // completion stats
  const skippedItems = $derived(session ? session.items.length - session.idx : 0);
  function forgeOn() {
    store.extendSession();
  }
  const canRepair = $derived(!!store.state.streak.pendingRepair);
  function claimRepair() {
    if (store.repairStreak()) haptic([20, 40, 20, 40, 60]);
  }
  const typeLabel = $derived(
    !item
      ? ''
      : item.relearn
        ? 'ONE MORE TIME'
        : item.type === 'review'
          ? `REVIEW${quiz ? ' · QUIZ' : card ? ` · ${card.cat}` : ''}`
          : item.type === 'new'
            ? `NEW · ${card?.cat ?? ''}`
            : item.type === 'quiz'
              ? 'POP QUIZ'
              : 'LESSON'
  );
</script>

{#if !session}
  <div class="page"><p class="muted">No session — head back to Today.</p></div>
{:else if session.done}
  <!-- ============ COMPLETE ============ -->
  <Confetti />
  <div class="page done-page">
    <div class="done-emoji">⚒️✨</div>
    <h1 class="done-title">SESSION FORGED</h1>
    <div class="done-stats">
      <div class="stat"><b>+{session.xp}</b><span>XP</span></div>
      <div class="stat"><Flame streak={store.state.streak.current} size="sm" /><span>streak</span></div>
      <div class="stat"><b>{session.correct}/{session.answered}</b><span>correct</span></div>
    </div>
    <div class="goal-line card">
      Daily goal
      <div class="progress-track" style="margin:8px 0">
        <div
          class="progress-fill"
          class:ember={store.goalMet}
          style="width:{Math.min(100, (store.xpToday / store.state.profile.dailyGoalXp) * 100)}%"
        ></div>
      </div>
      <b>{store.xpToday}/{store.state.profile.dailyGoalXp} {store.goalMet ? '✓' : ''}</b>
    </div>
    {#if canRepair}
      <button class="btn btn-ember btn-block" onclick={claimRepair}>💪 Double session done — REFORGE MY STREAK</button>
    {/if}
    {#if session.bestCombo >= 5}
      <div class="combo-note">🔥 Best combo ×{session.bestCombo}</div>
    {/if}
    <div class="done-actions">
      <button class="btn btn-ghost" onclick={forgeOn}>⚒️ Forge on</button>
      <button class="btn btn-primary" onclick={exit}>Done ✓</button>
    </div>
    {#if store.lastEarnedBadges.length}
      <div class="badges-earned card">
        {#each store.lastEarnedBadges as b (b.id)}
          <div class="badge-row"><span class="badge-ic">{b.icon}</span> <b>{b.name}</b> <span class="dim small">{b.desc}</span></div>
        {/each}
      </div>
    {/if}
  </div>
{:else if item}
  <!-- ============ PLAYER ============ -->
  <div class="player">
    <header class="chrome">
      <button class="close" onclick={exit} aria-label="Exit session">✕</button>
      <div class="segments">
        {#each session.items as it, i (i)}
          <div class="seg" class:filled={i < session.idx} class:current={i === session.idx}></div>
        {/each}
      </div>
      <Flame streak={store.state.streak.current} size="sm" />
    </header>

    <div class="type-chip"><span class="chip" class:ember={item.relearn}>{typeLabel}</span></div>

    <main class="stage">
      {#if card}
        {#key `${session.idx}-${item.id}`}
          <SwipeCardView {card} bind:revealed ongrade={gradeCard} />
        {/key}
      {:else if quiz}
        {#key `${session.idx}-${item.id}`}
          <QuizBlock question={quiz} onanswer={answerQuiz} />
        {/key}
      {:else if lessonRef}
        <div class="lesson-wrap">
          <div class="lesson-head">
            <span class="chip primary">{lessonRef.module.title}</span>
            <h2>{lessonRef.lesson.title}</h2>
          </div>
          <div class="lesson-dots">
            {#each lessonRef.lesson.screens as _, i}
              <div class="ldot" class:on={i <= lessonScreen}></div>
            {/each}
          </div>
          {#key lessonScreen}
            <div class="card prose lesson-screen">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html lessonRef.lesson.screens[lessonScreen]}
            </div>
          {/key}
          <button class="btn btn-primary btn-block" onclick={lessonNext}>
            {lessonScreen < lessonRef.lesson.screens.length - 1 ? 'Continue →' : '✓ Finish lesson step'}
          </button>
        </div>
      {:else}
        <!-- content unavailable (e.g. card removed) — skip -->
        <div class="card">
          <p class="muted">This item is no longer available.</p>
          <button class="btn btn-ghost btn-block" onclick={() => store.advance()}>Skip →</button>
        </div>
      {/if}
    </main>

    {#if session.combo >= 5}
      <div class="combo-banner">🔥 Combo ×1.5</div>
    {/if}
    {#if intervalToast}
      <div class="interval-toast">{intervalToast}</div>
    {/if}
    {#if xpFly}
      {#key xpFly.key}
        <div class="xp-fly">+{xpFly.amount} XP</div>
      {/key}
    {/if}
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
  .segments { flex: 1; display: flex; gap: 3px; }
  .seg { flex: 1; height: 6px; border-radius: 4px; background: var(--surface-2); transition: background 0.3s; }
  .seg.filled { background: var(--success); }
  .seg.current { background: var(--primary); animation: pulse 1.6s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: 0.55; } }
  .type-chip { margin: 14px 0 10px; }
  .stage { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; }
  .lesson-head h2 { font-size: 20px; margin-top: 8px; }
  .lesson-dots { display: flex; gap: 5px; margin: 8px 0 12px; }
  .ldot { width: 8px; height: 8px; border-radius: 50%; background: var(--surface-3); transition: background 0.2s; }
  .ldot.on { background: var(--primary); }
  .lesson-screen { margin-bottom: 14px; animation: page-in 0.3s var(--spring); max-height: 58dvh; overflow-y: auto; }
  .combo-banner {
    position: fixed;
    top: 64px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--ember-grad);
    color: #2a1400;
    font-weight: 900;
    padding: 6px 16px;
    border-radius: 999px;
    animation: page-in 0.3s var(--spring);
    z-index: 60;
  }
  .interval-toast {
    position: fixed;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface-3);
    border: 1px solid var(--border);
    padding: 9px 18px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 14px;
    animation: page-in 0.25s var(--spring);
    z-index: 60;
    white-space: nowrap;
  }
  .xp-fly {
    position: fixed;
    top: 54%;
    left: 50%;
    transform: translateX(-50%);
    color: var(--purple);
    font-weight: 900;
    font-size: 22px;
    pointer-events: none;
    animation: fly 0.9s ease-out forwards;
    z-index: 60;
  }
  @keyframes fly {
    from { opacity: 1; transform: translate(-50%, 0); }
    to { opacity: 0; transform: translate(-50%, -90px); }
  }

  /* completion */
  .done-page { text-align: center; padding-top: 8dvh; }
  .done-emoji { font-size: 52px; animation: page-in 0.5s var(--spring); }
  .done-title {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 0.1em;
    background: var(--ember-grad);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin: 8px 0 20px;
  }
  .done-stats { display: flex; justify-content: center; gap: 26px; margin-bottom: 18px; }
  .stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .stat b { font-size: 22px; }
  .stat span { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .goal-line { text-align: left; margin-bottom: 14px; font-size: 14px; }
  .combo-note { color: var(--ember-2); font-weight: 700; margin-bottom: 12px; }
  .done-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px; }
  .badges-earned { margin-top: 16px; text-align: left; border-color: var(--gold); }
  .badge-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
  .badge-ic { font-size: 22px; }
</style>
