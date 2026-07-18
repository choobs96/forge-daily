<script lang="ts">
  import { store } from '../lib/state/store.svelte';
  import { calcLevel } from '../lib/gamify/levels';
  import { BADGES } from '../lib/gamify/badges';
  import { forecast } from '../lib/session/builder';
  import { masteryNotch } from '../lib/srs/engine';
  import Flame from '../lib/ui/Flame.svelte';
  import { todayStr, addDays } from '../lib/util';

  const s = $derived(store.state);
  const level = $derived(calcLevel(s.xp.total));
  const fc = $derived(forecast(s, 14));
  const fcMax = $derived(Math.max(1, ...fc));

  // last 8 weeks activity heatmap (goal-hit = ember, active = blue)
  const weeks = $derived.by(() => {
    const out: { day: string; xp: number }[][] = [];
    const today = todayStr();
    let cursor = addDays(today, -55);
    for (let w = 0; w < 8; w++) {
      const week: { day: string; xp: number }[] = [];
      for (let d = 0; d < 7; d++) {
        week.push({ day: cursor, xp: s.xp.byDay[cursor] ?? 0 });
        cursor = addDays(cursor, 1);
      }
      out.push(week);
    }
    return out;
  });

  // SRS health buckets
  const srsEntries = $derived(Object.values(s.srs));
  const healthBuckets = $derived.by(() => {
    const b = [0, 0, 0, 0]; // new-ish, learning, strong, mastered
    for (const e of srsEntries) {
      const n = masteryNotch(e);
      if (n <= 1) b[0]! += 1;
      else if (n <= 3) b[1]! += 1;
      else if (n <= 5) b[2]! += 1;
      else b[3]! += 1;
    }
    return b;
  });
  const accuracy = $derived.by(() => {
    const seen = srsEntries.reduce((a, e) => a + e.seen, 0);
    const correct = srsEntries.reduce((a, e) => a + e.correct, 0);
    return seen ? Math.round((correct / seen) * 100) : 0;
  });

  const visibleBadges = $derived(BADGES.filter((b) => !b.hidden || s.badges[b.id]));

  // ---------- settings ----------
  let showSettings = $state(false);
  function exportData() {
    const blob = new Blob([store.exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `forge-progress-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function importData(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    void file.text().then((raw) => {
      if (store.importJson(raw)) alert('Progress imported ✓');
      else alert('Import failed — not a valid Forge backup.');
    });
  }
  function downloadIcs() {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Forge//Reminder//EN',
      'BEGIN:VEVENT',
      'UID:forge-daily-reminder',
      'DTSTART;TZID=Australia/Sydney:20260101T080000',
      'RRULE:FREQ=DAILY',
      'SUMMARY:⚒️ Forge — daily session',
      `DESCRIPTION:Reviews are waiting. ${location.origin}${location.pathname}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'forge-reminder.ics';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function resetAll() {
    if (confirm('Reset ALL progress? Export a backup first!')) store.resetAll();
  }
</script>

<div class="page">
  <header class="top">
    <h1 class="title">👤 You</h1>
    <button class="chip" onclick={() => (showSettings = !showSettings)}>⚙️ settings</button>
  </header>

  {#if showSettings}
    <div class="card settings">
      <label class="set-row">
        Daily goal
        <select bind:value={s.profile.dailyGoalXp} onchange={() => store.persist()}>
          <option value={20}>Casual · 20 XP</option>
          <option value={40}>Regular · 40 XP</option>
          <option value={60}>Serious · 60 XP</option>
        </select>
      </label>
      <label class="set-row">
        New cards / day
        <select bind:value={s.profile.newPerDay} onchange={() => store.persist()}>
          {#each [1, 2, 3, 4, 6, 8] as n}<option value={n}>{n}</option>{/each}
        </select>
      </label>
      <div class="set-actions">
        <button class="btn btn-ghost" onclick={exportData}>⬇ Export</button>
        <label class="btn btn-ghost">
          ⬆ Import<input type="file" accept=".json" hidden onchange={importData} />
        </label>
        <button class="btn btn-ghost" onclick={downloadIcs}>🗓 Reminder</button>
        <button class="btn btn-danger-ghost" onclick={resetAll}>Reset</button>
      </div>
      <p class="muted small" style="margin:8px 0 0">
        Progress lives on this device. Export regularly. The app badge shows due reviews when installed to your home screen.
      </p>
    </div>
  {/if}

  <div class="card level">
    <div class="level-circle">{level.lvl}</div>
    <div class="level-main">
      <b>{level.title}</b>
      <div class="progress-track" style="margin:7px 0 4px">
        <div class="progress-fill" style="width:{level.pct}%"></div>
      </div>
      <span class="dim small">
        {s.xp.total.toLocaleString()} XP{level.next ? ` · ${(level.next - s.xp.total).toLocaleString()} to next` : ' · MAX'}
      </span>
    </div>
  </div>

  <div class="stat-row">
    <div class="card stat"><Flame streak={s.streak.current} /><span class="stat-l">streak</span></div>
    <div class="card stat"><b>{s.streak.best}</b><span class="stat-l">best</span></div>
    <div class="card stat"><b>{s.streak.freezes}🧊</b><span class="stat-l">freezes</span></div>
    <div class="card stat"><b>{accuracy}%</b><span class="stat-l">accuracy</span></div>
  </div>

  <div class="card">
    <div class="small muted" style="margin-bottom:8px">LAST 8 WEEKS</div>
    <div class="heat">
      {#each weeks as week, wi (wi)}
        <div class="heat-col">
          {#each week as d (d.day)}
            <div
              class="heat-cell"
              class:active={d.xp > 0}
              class:goal={d.xp >= s.profile.dailyGoalXp}
              title="{d.day}: {d.xp} XP"
            ></div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <div class="card">
    <div class="small muted" style="margin-bottom:8px">📬 14-DAY REVIEW FORECAST</div>
    <div class="fc">
      {#each fc as n, i (i)}
        <div class="fc-bar" style="height:{(n / fcMax) * 46 + 3}px" title="+{i}d: {n}"></div>
      {/each}
    </div>
  </div>

  <div class="card">
    <div class="small muted" style="margin-bottom:8px">🃏 KNOWLEDGE HEALTH — {srsEntries.length} items tracked</div>
    <div class="health">
      {#each [['New', healthBuckets[0], 'var(--text-muted)'], ['Learning', healthBuckets[1], 'var(--primary)'], ['Strong', healthBuckets[2], 'var(--purple)'], ['Mastered', healthBuckets[3], 'var(--gold)']] as [label, n, color] (label)}
        <div class="h-item">
          <b style="color:{color}">{n}</b>
          <span class="stat-l">{label}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="card">
    <div class="small muted" style="margin-bottom:10px">🏆 BADGES — {Object.keys(s.badges).length}/{BADGES.length}</div>
    <div class="badges">
      {#each visibleBadges as b (b.id)}
        <div class="badge" class:earned={s.badges[b.id]} title="{b.name}: {b.desc}">
          <span class="b-ic">{b.icon}</span>
          <span class="b-name">{b.name}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .top { display: flex; justify-content: space-between; align-items: center; }
  .title { font-size: 24px; font-weight: 900; margin: 0; }
  .settings { margin: 12px 0; }
  .set-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; font-weight: 600; }
  select {
    background: var(--surface-2);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 7px 10px;
    font: inherit;
  }
  .set-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin-top: 10px; }
  .set-actions .btn { padding: 9px 6px; font-size: 12.5px; min-height: 40px; }
  .level { display: flex; gap: 14px; align-items: center; margin: 14px 0; }
  .level-circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--primary-grad);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 23px;
    font-weight: 900;
    flex-shrink: 0;
    box-shadow: 0 0 22px rgba(167, 139, 250, 0.4);
  }
  .level-main { flex: 1; }
  .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
  .stat { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 11px 6px; }
  .stat b { font-size: 17px; }
  .stat-l { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .card { margin-bottom: 12px; }
  .heat { display: flex; gap: 4px; justify-content: space-between; }
  .heat-col { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .heat-cell { aspect-ratio: 1; border-radius: 4px; background: var(--surface-2); }
  .heat-cell.active { background: var(--primary); opacity: 0.65; }
  .heat-cell.goal { background: var(--ember); opacity: 1; }
  .fc { display: flex; align-items: flex-end; gap: 4px; height: 52px; }
  .fc-bar { flex: 1; background: var(--primary-grad); border-radius: 3px 3px 0 0; min-height: 3px; }
  .health { display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; }
  .h-item { display: flex; flex-direction: column; gap: 2px; }
  .h-item b { font-size: 19px; }
  .badges { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    opacity: 0.32;
    filter: grayscale(1);
    text-align: center;
  }
  .badge.earned { opacity: 1; filter: none; }
  .b-ic { font-size: 27px; }
  .b-name { font-size: 10px; color: var(--text-dim); font-weight: 600; }
</style>
