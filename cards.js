/* ===================================================================
   Forge - Daily Swipe deck
   window.SWIPE_CARDS - atomic learning cards, loaded by swipe.html.
   Loaded via <script src> (not fetch) so it works on file:// URLs.
   Regenerated / topped-up by the refresh job.
   Schema: { id, cat, level, title, hook, body(HTML), tags[], src }
   =================================================================== */
window.SWIPE_CARDS = [
  {
    "id": "seed-01",
    "cat": "Modeling",
    "level": "Core",
    "title": "Grain is a promise, not a guess",
    "hook": "If you cannot say it in one sentence, the model is not designed yet.",
    "body": "<p>Declare the grain of every fact before writing SQL: <em>one row per ___</em>. Example: <code>fct_job_assignments</code> = one row per (job_id, contractor_id). Every join must preserve it. Validate after each join with <code>count(*)</code> vs <code>count(distinct pk)</code> &mdash; if they differ, you have fan-out and your sums are inflated.</p>",
    "tags": [
      "grain",
      "fact",
      "fan-out"
    ],
    "src": "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/declare-grain/"
  },
  {
    "id": "seed-02",
    "cat": "dbt",
    "level": "Core",
    "title": "Slim CI: build only what changed",
    "hook": "Stop rebuilding 800 models to test a one-line edit.",
    "body": "<p>State-based selection builds just the modified models and their children:</p><pre><code>dbt build -s <span class=\"kw\">state:modified+</span> --defer --state target/</code></pre><p>It diffs your branch against a stored manifest, so CI runs 5&ndash;20x faster. The <code>+</code> suffix pulls in downstream dependents so you never ship a change that silently breaks a child model.</p>",
    "tags": [
      "ci",
      "selectors",
      "performance"
    ],
    "src": "https://docs.getdbt.com/reference/node-selection/syntax"
  },
  {
    "id": "seed-03",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Data skew is the #1 hidden killer",
    "hook": "199 tasks finish in 30s; one runs for 25 minutes. That is skew.",
    "body": "<p>One join key holding most of the rows means one executor does most of the work while the rest idle. Three fixes, cheapest first:</p><ol><li>Turn on AQE skew handling (free): <code>spark.sql.adaptive.skewJoin.enabled=true</code></li><li>Salt the heavy key to spread it across partitions</li><li>Broadcast the small side to remove the shuffle entirely</li></ol>",
    "tags": [
      "skew",
      "aqe",
      "performance"
    ],
    "src": "https://spark.apache.org/docs/latest/sql-performance-tuning.html"
  },
  {
    "id": "seed-04",
    "cat": "SQL",
    "level": "Core",
    "title": "NOT IN + NULL = zero rows",
    "hook": "The subquery returns one NULL and your whole result silently vanishes.",
    "body": "<p>The expression <code>where id not in (select x from t)</code> returns ZERO rows if <code>x</code> contains any NULL, because id = NULL is unknown, never false. Use <code>not exists</code> instead &mdash; it is NULL-safe and usually plans better:</p><pre><code><span class=\"kw\">select</span> a.* <span class=\"kw\">from</span> accounts a\n<span class=\"kw\">where not exists</span> (<span class=\"kw\">select</span> <span class=\"num\">1</span> <span class=\"kw\">from</span> jobs j <span class=\"kw\">where</span> j.account_id = a.account_id);</code></pre>",
    "tags": [
      "null",
      "anti-join"
    ],
    "src": "https://modern-sql.com/caniuse/null"
  },
  {
    "id": "seed-05",
    "cat": "Streaming",
    "level": "Advanced",
    "title": "CDC tombstones inflate your counts",
    "hook": "Active contractors 12% higher than the CRM? Check this filter first.",
    "body": "<p>Change-data-capture tables keep deleted rows as tombstones flagged <code>__is_deleted = true</code>. Forget the filter and deleted records pad your totals. In a CDC pipeline this is a production correctness bug on every kafka_cdc table:</p><pre><code><span class=\"kw\">where</span> __is_deleted = <span class=\"kw\">false</span></code></pre><p>The latest-row-per-key pattern needs it too, after the <code>row_number()</code> dedupe.</p>",
    "tags": [
      "cdc",
      "soft-delete",
      "correctness"
    ],
    "src": "https://debezium.io/documentation/reference/stable/connectors/mysql.html"
  },
  {
    "id": "seed-06",
    "cat": "Modeling",
    "level": "Core",
    "title": "SCD2 reconstructs history",
    "hook": "Attribute revenue to the plan tier the account had at the time, not today.",
    "body": "<p>A Slowly Changing Dimension Type 2 keeps a row per version with <code>valid_from</code> / <code>valid_to</code> / <code>is_current</code>. The fact joins to the version valid on the event date:</p><pre><code><span class=\"kw\">on</span> d.account_id = f.account_id\n  <span class=\"kw\">and</span> f.event_date >= d.valid_from\n  <span class=\"kw\">and</span> (f.event_date < d.valid_to <span class=\"kw\">or</span> d.valid_to <span class=\"kw\">is null</span>)</code></pre><p>Type 1 just overwrites &mdash; use it only when history does not matter.</p>",
    "tags": [
      "scd",
      "history",
      "snapshot"
    ],
    "src": "https://docs.getdbt.com/docs/build/snapshots"
  },
  {
    "id": "craft-01",
    "cat": "dbt",
    "level": "Advanced",
    "title": "Microbatch: lookback catches late data",
    "hook": "dbt 1.9 splits a backfill into idempotent time slices.",
    "body": "<p>The <code>microbatch</code> strategy shards an incremental run by <code>event_time</code> into <code>batch_size</code> windows (day/hour). Each batch is reprocessed independently, so a failed or re-run window is idempotent. <code>lookback=3</code> re-runs the last 3 batches every time to absorb late-arriving rows. <code>begin</code> sets the floor for full-refresh. dbt auto-filters upstream refs that declare <code>event_time</code> — no manual <code>is_incremental()</code> WHERE needed.</p><pre><code>{{ config(materialized='incremental',\n  incremental_strategy='microbatch',\n  event_time='occurred_at', batch_size='day',\n  lookback=3, begin='2024-01-01') }}</code></pre>",
    "tags": [
      "microbatch",
      "late-arriving",
      "dbt-1.9"
    ],
    "src": "https://docs.getdbt.com/docs/build/incremental-microbatch"
  },
  {
    "id": "craft-02",
    "cat": "dbt",
    "level": "Advanced",
    "title": "Unit tests mock inputs, not warehouse data",
    "hook": "dbt 1.8 finally lets you test SQL logic with fixtures.",
    "body": "<p>Data tests assert on real built rows; <em>unit tests</em> assert on hand-fed input rows, so you verify transformation logic (a CASE, a window, a date-diff) before a single row of prod exists. They run at <code>dbt build</code>, not against the warehouse table. Use them on gnarly logic: deduping, SCD2 boundaries, revenue math. Mock only the columns the model touches via <code>format: dict</code>.</p><pre><code>unit_tests:\n  - name: test_is_active_flag\n    model: stg_accounts\n    given:\n      - input: ref('raw_accounts')\n        rows: [{status: 'A'}, {status: 'X'}]\n    expect:\n      rows: [{is_active: true}, {is_active: false}]</code></pre>",
    "tags": [
      "unit-tests",
      "fixtures",
      "dbt-1.8"
    ],
    "src": "https://docs.getdbt.com/docs/build/unit-tests"
  },
  {
    "id": "craft-03",
    "cat": "dbt",
    "level": "Senior",
    "title": "Contracts + versions = safe breaking changes",
    "hook": "Ship a column rename without paging every downstream team.",
    "body": "<p>A model <code>contract: {enforced: true}</code> makes dbt verify the built schema (names, types, constraints) at build time — a drifted type fails the run instead of silently breaking BI. To make a breaking change, publish a new <code>version:</code> (v2) alongside v1, point new consumers at <code>ref('model', v=2)</code>, deprecate v1 with <code>deprecation_date</code>, then retire it. Consumers migrate on their own schedule; the DAG never has a hard cutover.</p>",
    "tags": [
      "contracts",
      "model-versions",
      "schema-drift"
    ],
    "src": "https://docs.getdbt.com/docs/collaborate/govern/model-versions"
  },
  {
    "id": "craft-04",
    "cat": "dbt",
    "level": "Senior",
    "title": "insert_overwrite vs merge for backfills",
    "hook": "merge dedupes; insert_overwrite replaces whole partitions.",
    "body": "<p><code>merge</code> upserts by unique key — correct but it scans the target and can fan out on duplicate keys. <code>insert_overwrite</code> atomically replaces entire partitions matched by the incremental rows; rerunning a day overwrites it cleanly, making backfills idempotent <em>without</em> a unique key. Prefer insert_overwrite for append-mostly fact tables partitioned by date; prefer merge when rows mutate in place. On Databricks insert_overwrite needs <code>partition_by</code> set or it replaces the whole table.</p>",
    "tags": [
      "insert-overwrite",
      "merge",
      "idempotent-backfill"
    ],
    "src": "https://docs.getdbt.com/docs/build/incremental-strategy"
  },
  {
    "id": "craft-05",
    "cat": "dbt",
    "level": "Advanced",
    "title": "dbt-expectations beats hand-rolled tests",
    "hook": "Column-level distribution and freshness tests, declaratively.",
    "body": "<p><code>dbt-expectations</code> ports Great Expectations into dbt YAML: value ranges, regex match, row-count-between, distinct-count, and <code>expect_column_values_to_be_within_n_stdevs</code> for cheap anomaly detection. <code>dbt-utils</code> gives the structural staples — <code>unique_combination_of_columns</code> (composite-key grain check), <code>recency</code>, <code>relationships</code>. Put grain + not-null + accepted-values at staging; put business-rule and distribution tests at marts. Set <code>severity: warn</code> on noisy distribution tests so they alert without blocking the build.</p>",
    "tags": [
      "dbt-expectations",
      "dbt-utils",
      "data-quality"
    ],
    "src": "https://github.com/calogica/dbt-expectations"
  },
  {
    "id": "craft-06",
    "cat": "Spark",
    "level": "Senior",
    "title": "Liquid Clustering: the decision rule",
    "hook": "Stop partitioning. Mostly.",
    "body": "<p>Databricks now recommends Liquid Clustering for new tables — it replaces both partitioning and ZORDER (and is incompatible with them). The rule: if a partition column would yield more than ~5,000 distinct values (over-partitioning, small files) use LC; if fewer and queries always filter that column, partition + ZORDER can still win. LC lets you redefine keys without rewriting data, and <code>CLUSTER BY AUTO</code> + Predictive Optimization picks and re-tunes keys for UC-managed tables. Cap clustering at 1–4 high-cardinality filter/join columns.</p>",
    "tags": [
      "liquid-clustering",
      "zorder",
      "partitioning"
    ],
    "src": "https://docs.databricks.com/aws/en/delta/clustering"
  },
  {
    "id": "craft-07",
    "cat": "Spark",
    "level": "Senior",
    "title": "Deletion vectors defer the rewrite",
    "hook": "Delete a row without rewriting its 100MB file.",
    "body": "<p>Deletion vectors bring merge-on-read to Delta: a DELETE/UPDATE/MERGE marks rows in a side file instead of rewriting whole Parquet files (copy-on-write). Massive speedup when few rows change across many files. The cost: readers reconcile the vectors, so they accumulate. Run <code>reorg table t apply (purge)</code> to physically rewrite affected files and coalesce small ones, then <code>vacuum</code> to drop the old files. For compliance deletes you MUST purge — the data still sits in the original file until then.</p>",
    "tags": [
      "deletion-vectors",
      "merge-on-read",
      "reorg-purge"
    ],
    "src": "https://docs.databricks.com/aws/en/delta/deletion-vectors"
  },
  {
    "id": "craft-08",
    "cat": "Spark",
    "level": "Senior",
    "title": "Diagnose spill before adding nodes",
    "hook": "Spill to disk is the silent 10x tax.",
    "body": "<p>When a shuffle partition exceeds executor memory, Spark spills to disk — the stage still finishes, so it hides in plain sight. Check the SQL plan's <em>Spill (Memory)/Spill (Disk)</em> metrics, not just runtime. Fix by shrinking partition size: raise <code>spark.sql.shuffle.partitions</code> so each is ~128–200MB, or let AQE coalesce. Skew (one giant partition) spills even when totals fit — salt the key or rely on AQE skew-join. Adding executors rarely helps; right-sizing partitions does.</p>",
    "tags": [
      "spill",
      "partition-sizing",
      "shuffle"
    ],
    "src": "https://spark.apache.org/docs/latest/sql-performance-tuning.html"
  },
  {
    "id": "craft-09",
    "cat": "Spark",
    "level": "Advanced",
    "title": "The small-file problem and auto-compaction",
    "hook": "A million 10KB files will kill your read latency.",
    "body": "<p>Streaming and frequent MERGEs produce tiny files; the driver spends more time listing metadata than reading data. Delta fights this with <em>optimized writes</em> (<code>delta.autoOptimize.optimizeWrite</code>) which shuffles to fewer, larger files before commit, and <em>auto-compaction</em> (<code>autoCompact</code>) which coalesces small files after the write. For batch, schedule <code>optimize</code>. Target ~128MB–1GB per file. On Unity Catalog managed tables, Predictive Optimization runs OPTIMIZE/VACUUM automatically so you stop hand-scheduling maintenance.</p>",
    "tags": [
      "small-files",
      "auto-compaction",
      "optimized-writes"
    ],
    "src": "https://docs.databricks.com/aws/en/delta/tune-file-size"
  },
  {
    "id": "craft-10",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Tune the broadcast join threshold",
    "hook": "AQE broadcasts at runtime — but only up to a cap.",
    "body": "<p>A broadcast hash join ships the small side to every executor and skips the shuffle — far faster than sort-merge when one side fits in memory. The catch: <code>spark.sql.autoBroadcastJoinThreshold</code> defaults to 10MB and is measured on <em>estimated</em> size, so a 50MB dimension that would broadcast fine never does. AQE re-checks actual post-filter sizes and can promote joins, but still respects the cap. Raise the threshold for dim-heavy workloads, or force it with a <code>/*+ broadcast(d) */</code> hint when stats lie.</p>",
    "tags": [
      "broadcast-join",
      "aqe",
      "join-tuning"
    ],
    "src": "https://spark.apache.org/docs/latest/sql-performance-tuning.html"
  },
  {
    "id": "craft-11",
    "cat": "Modeling",
    "level": "Senior",
    "title": "Kimball vs OBT vs Activity Schema",
    "hook": "Columnar engines changed the denormalization math.",
    "body": "<p>Star schema keeps a single source of truth and is BI-tool friendly, but every query re-joins. In columnar warehouses (Delta, BigQuery) wide One-Big-Table avoids joins, prunes unused columns cheaply, and caches well — at the cost of fan-out bugs and storage. Activity Schema models everything as a single <em>activity stream</em> (entity, verb, timestamp, features) — elegant for behavioural/event analytics, awkward for finance-style snapshots. Common 2026 pattern: Kimball marts as the governed core, OBT serving layers built on top for specific dashboards/Genie.</p>",
    "tags": [
      "star-schema",
      "obt",
      "activity-schema"
    ],
    "src": "https://www.getdbt.com/blog/kimball-dimensional-model"
  },
  {
    "id": "craft-12",
    "cat": "Modeling",
    "level": "Senior",
    "title": "Data Vault: when the audit trail wins",
    "hook": "Hubs, links, satellites — flexibility over query ergonomics.",
    "body": "<p>Data Vault splits business keys (hubs), relationships (links), and descriptive/historised attributes (satellites). It excels at multi-source integration, full auditability, and parallel loads where sources change shape often — you bolt on a new satellite without remodelling. The price: many joins and a presentation layer (usually a star) on top before anyone can query it sanely. Choose it for regulated, source-volatile enterprise warehouses; skip it for a focused analytics mart where Kimball is faster to build and read.</p>",
    "tags": [
      "data-vault",
      "hubs-links-satellites",
      "audit"
    ],
    "src": "https://www.databricks.com/glossary/data-vault"
  },
  {
    "id": "craft-13",
    "cat": "Modeling",
    "level": "Advanced",
    "title": "When denormalization actually wins",
    "hook": "Pre-join only when the read pattern is stable.",
    "body": "<p>Denormalize into a wide table when: queries repeatedly join the same dims, the join keys are stable, and read frequency dwarfs write frequency. It wins on columnar storage because unused columns aren't scanned and there's no shuffle-join. It loses when dimensions are SCD2-volatile (you re-stamp the whole fact on every attribute change) or when the same attribute lives in many tables (update anomalies). Rule of thumb: normalise for write integrity in the core, denormalise in a derived serving layer you can always rebuild.</p>",
    "tags": [
      "denormalization",
      "wide-table",
      "serving-layer"
    ],
    "src": "https://docs.databricks.com/aws/en/lakehouse/medallion"
  },
  {
    "id": "craft-14",
    "cat": "DQ",
    "level": "Senior",
    "title": "Write-Audit-Publish gates bad data",
    "hook": "Validate in isolation; publish is just a metadata commit.",
    "body": "<p>WAP writes new data to an isolated branch/staging table, runs quality + business-rule checks there, and only <em>publishes</em> (a cheap metadata pointer swap on Delta/Iceberg) if checks pass. Consumers never see a half-loaded or failing dataset. It beats post-hoc dbt tests because failures never reach prod in the first place. On Delta you can emulate it with a staging table + atomic <code>REPLACE</code>/swap; Iceberg branches make the publish a true zero-copy commit.</p>",
    "tags": [
      "wap",
      "branching",
      "blue-green"
    ],
    "src": "https://lakefs.io/blog/data-engineering-patterns-write-audit-publish/"
  },
  {
    "id": "craft-15",
    "cat": "DQ",
    "level": "Advanced",
    "title": "Freshness SLAs and reconciliation",
    "hook": "Row counts that match aren't the same as data that's correct.",
    "body": "<p>Two cheap, high-value checks beyond schema tests. <em>Freshness SLA</em>: alert when <code>max(updated_at)</code> lags now by more than the agreed window — catches a silently stalled pipeline that schema tests pass. <em>Reconciliation</em>: compare an aggregate against the source of truth (e.g. <code>sum(revenue)</code> in the mart vs the billing system, or staging row count vs source after the <code>__is_deleted</code> filter). A drift threshold (say ±0.5%) flags fan-outs, dropped CDC rows, and double-counts that null/unique tests never see.</p>",
    "tags": [
      "freshness-sla",
      "reconciliation",
      "observability"
    ],
    "src": "https://docs.getdbt.com/docs/build/sources#source-data-freshness"
  },
  {
    "id": "craft-16",
    "cat": "Streaming",
    "level": "Senior",
    "title": "CDC tombstones aren't deletes you can filter",
    "hook": "A null-value Kafka record means the key is gone.",
    "body": "<p>Debezium emits a delete as TWO messages: a change event with <code>op='d'</code>, then a <em>tombstone</em> — a record with the key and a <code>null</code> value — so log-compacted topics drop the key entirely. If your bronze ingestion silently skips null-value records, you lose deletes and your silver latest-row view keeps ghosts. Handle both: capture <code>op='d'</code> as a soft-delete flag, and don't discard tombstones during ingestion. Then your latest-row MERGE can delete or mark the key correctly.</p>",
    "tags": [
      "tombstone",
      "debezium",
      "cdc-delete"
    ],
    "src": "https://debezium.io/documentation/reference/stable/connectors/postgresql.html"
  },
  {
    "id": "craft-17",
    "cat": "Streaming",
    "level": "Senior",
    "title": "Out-of-order events need watermarks",
    "hook": "Late data either corrupts aggregates or never arrives.",
    "body": "<p>Events arrive out of order (network, retries, mobile offline). For the <em>latest-row</em> silver model you must dedupe by the source commit timestamp / LSN, not arrival time — order by <code>row_number() over (partition by pk order by source_ts desc)</code> so a late stale event can't overwrite a newer one. For windowed aggregates in Structured Streaming, a <code>withWatermark</code> defines how long to wait for late events before finalising a window; too tight drops late data, too loose holds state forever. Pick the watermark from observed lateness, not a guess.</p>",
    "tags": [
      "out-of-order",
      "watermark",
      "latest-row"
    ],
    "src": "https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html"
  },
  {
    "id": "craft-18",
    "cat": "Streaming",
    "level": "Senior",
    "title": "Exactly-once = idempotent MERGE + checkpoint",
    "hook": "At-least-once delivery is fine if your sink dedupes.",
    "body": "<p>Kafka/Structured Streaming give at-least-once, so duplicates WILL replay after a failure. You reach effective exactly-once two ways. Sink side: a MERGE keyed on the business/event id that does nothing on a re-seen key (idempotent upsert), so replays are harmless. Engine side: <code>foreachBatch</code> writing to Delta with a per-batch checkpoint and <code>txnAppId</code>/<code>txnVersion</code> dedup, so Delta rejects a re-committed batchId. Never rely on the source not duplicating — make the write idempotent.</p>",
    "tags": [
      "exactly-once",
      "idempotent-merge",
      "checkpoint"
    ],
    "src": "https://docs.databricks.com/aws/en/structured-streaming/delta-lake"
  },
  {
    "id": "craft-19",
    "cat": "SQL",
    "level": "Advanced",
    "title": "QUALIFY filters window results inline",
    "hook": "Dedupe without a wrapping subquery.",
    "body": "<p>You can't put a window function in a WHERE clause. The classic dedupe wraps a <code>row_number()</code> in a subquery and filters <code>rn = 1</code> outside. <code>qualify</code> (Databricks, Snowflake, BigQuery) filters on the window result in the same SELECT — less nesting, easier to read.</p><pre><code>select *\nfrom stg_accounts\nqualify row_number() over (\n  partition by account_id\n  order by updated_at desc) = 1;</code></pre><p>Reads cleaner than a CTE and the optimizer treats it identically.</p>",
    "tags": [
      "qualify",
      "dedupe",
      "window"
    ],
    "src": "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-qualify.html"
  },
  {
    "id": "craft-20",
    "cat": "SQL",
    "level": "Advanced",
    "title": "GROUPING SETS does many GROUP BYs at once",
    "hook": "Subtotals and grand totals in a single scan.",
    "body": "<p>Instead of UNIONing several aggregations at different grains, <code>grouping sets</code> computes them in one pass. <code>rollup(a,b)</code> is the hierarchical shorthand (a+b, a, grand total); <code>cube(a,b)</code> gives every combination. Use <code>grouping(col)</code> to tell a real NULL from a subtotal placeholder.</p><pre><code>select region, product, sum(revenue)\nfrom sales\ngroup by grouping sets (\n  (region, product), (region), ());</code></pre><p>One scan, three grains — cheaper than three queries and far cleaner than UNION ALL.</p>",
    "tags": [
      "grouping-sets",
      "rollup",
      "cube"
    ],
    "src": "https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-groupby.html"
  },
  {
    "id": "role-01",
    "cat": "Role",
    "level": "Foundations",
    "title": "Analytics engineer: the analyst-coder hybrid",
    "hook": "The role dbt invented now sits between analyst and data engineer.",
    "body": "<p>Analytics engineering owns the transformation layer: turning raw warehouse tables into clean, tested, documented models analysts trust. You write SQL and <code>dbt</code>, apply software rigour (version control, tests, CI), but stay close to business questions. AE postings jumped 114% from 2023 to 2024. Your analyst instinct for what a number <em>means</em> is the edge engineers lack.</p>",
    "tags": [
      "role",
      "career"
    ],
    "src": "https://www.getdbt.com/blog/what-is-analytics-engineering"
  },
  {
    "id": "role-02",
    "cat": "Role",
    "level": "Core",
    "title": "AE vs DE vs analyst: blurring boundaries",
    "hook": "The lines are dissolving, and that is your opening.",
    "body": "<p>dbt Labs notes analysts are drifting left into modelling while data engineers adopt <code>dbt</code> as standard. Rough split: DE owns ingestion and infrastructure (pipelines, orchestration, platform); AE owns transformation and semantics; analyst owns the last mile to the business. The middle is widening into a full-stack data person. Pick the boundary you want to grow into rather than waiting for a title.</p>",
    "tags": [
      "role",
      "career"
    ],
    "src": "https://www.getdbt.com/blog/how-ai-is-changing-the-analytics-stack"
  },
  {
    "id": "role-03",
    "cat": "Role",
    "level": "Core",
    "title": "Trust is now the job, not speed",
    "hook": "In 2026 stakeholders care more that the number is right than fast.",
    "body": "<p>The dbt 2026 report found respondents rating <em>trust in data</em> as important jumped from 66% to 83% year over year, and poor data quality is the top challenge cited by over 56% of teams. As AI floods pipelines with code, the scarce skill is the human who guarantees correctness. Frame your work as producing trustworthy models, not just shipping more of them.</p>",
    "tags": [
      "role",
      "ai"
    ],
    "src": "https://www.prnewswire.com/news-releases/new-dbt-labs-report-finds-ai-driven-acceleration-is-outpacing-trust-and-governance-302741246.html"
  },
  {
    "id": "role-04",
    "cat": "Role",
    "level": "Core",
    "title": "Data modeling is the durable moat",
    "hook": "AI writes SQL; it does not decide your grain.",
    "body": "<p>Deciding a model's grain, picking a stable surrogate key, choosing dimensional vs wide-table, and handling soft deletes and CDC are judgment calls AI cannot make without your business context. On Databricks this means knowing when a row is an in-place CDC update versus a new fact. Master modeling fundamentals (Kimball, slowly changing dimensions, fan-out traps) and you stay valuable as code generation gets cheap.</p>",
    "tags": [
      "role",
      "skills"
    ],
    "src": "https://www.getdbt.com/blog/how-ai-is-changing-the-analytics-stack"
  },
  {
    "id": "role-05",
    "cat": "Role",
    "level": "Core",
    "title": "Bring software rigour to analytics",
    "hook": "What separates AE from analyst is engineering discipline.",
    "body": "<p>Treat models like code: Git branches, pull requests, CI that runs <code>dbt build</code>, tests on every model (uniqueness, not-null, relationships), and clear documentation. This is the literal job description gap when an analyst pivots. Start by adding tests and a YAML doc to one model you already own; reviewers notice rigour faster than they notice clever SQL.</p>",
    "tags": [
      "role",
      "skills"
    ],
    "src": "https://datadriven.io/data-engineer-roadmap"
  },
  {
    "id": "role-06",
    "cat": "Role",
    "level": "Advanced",
    "title": "The semantic layer is your AI interface",
    "hook": "Define a metric once; humans and agents both consume it.",
    "body": "<p>A semantic layer (Databricks Metric Views, dbt Semantic Layer) centralises metric definitions so revenue means one thing everywhere. It is now the contract that lets AI answer reliably: dbt measured 83% correct natural-language answers through its semantic layer, some queries hitting 100%. Owning metric definitions makes you the person who makes Genie and text-to-SQL trustworthy, a fast-rising AE responsibility.</p>",
    "tags": [
      "role",
      "ai",
      "skills"
    ],
    "src": "https://omni.co/articles/best-semantic-layer-for-ai-and-bi-2026"
  },
  {
    "id": "role-07",
    "cat": "Role",
    "level": "Advanced",
    "title": "FinOps: cost is an engineering metric now",
    "hook": "Warehouse spend is up 57%; someone has to own it.",
    "body": "<p>The dbt 2026 report shows 57% of teams report rising warehouse and compute spend. Engineers are now expected to understand cost alongside performance, shifting cost decisions left into design. On Databricks: right-size warehouses, prune full-refresh incrementals, avoid correlated subqueries, and watch DBU burn. Becoming the person who cuts a model's cost is a concrete, visible win on the pivot path.</p>",
    "tags": [
      "role",
      "skills"
    ],
    "src": "https://www.prnewswire.com/news-releases/new-dbt-labs-report-finds-ai-driven-acceleration-is-outpacing-trust-and-governance-302741246.html"
  },
  {
    "id": "role-08",
    "cat": "Role",
    "level": "Advanced",
    "title": "Data contracts and validation as a service",
    "hook": "Catch the broken schema before the dashboard does.",
    "body": "<p>As autonomous agents write more pipelines, the safeguard is explicit contracts: agreed schemas, types, and freshness SLAs between producers and consumers, enforced by tests in CI. Pair with anomaly checks (row-count diffs, null-rate drift) so a silent fan-out is caught at build, not in a stakeholder's report. This validation layer is increasingly the AE's core deliverable, not an afterthought.</p>",
    "tags": [
      "role",
      "skills",
      "ai"
    ],
    "src": "https://www.getdbt.com/blog/how-ai-is-changing-the-analytics-stack"
  },
  {
    "id": "role-09",
    "cat": "AI",
    "level": "Core",
    "title": "What AI automates vs what it cannot",
    "hook": "Know which half of your job just got cheaper.",
    "body": "<p>AI handles well: boilerplate SQL, scaffolding <code>dbt</code> models, generating tests, drafting docs, and debugging suggestions, getting simple pipelines ~80% there in minutes. AI cannot touch: architecture decisions, business context, data contracts, cost trade-offs, and diagnosing why the pipeline breaks every third Tuesday. Lean your career toward the second list; let assistants own the first.</p>",
    "tags": [
      "ai",
      "career"
    ],
    "src": "https://alper-korukcu.medium.com/the-data-engineer-role-in-2026-whats-actually-changing-and-what-s-just-noise-6eeeddd809b9"
  },
  {
    "id": "role-10",
    "cat": "AI",
    "level": "Core",
    "title": "AI-assisted coding is now the default",
    "hook": "72% of analytics teams already code with AI daily.",
    "body": "<p>The dbt 2026 report found 72% of respondents prioritise AI-assisted coding, but only 24% prioritise AI-assisted pipeline management like testing and observability. That gap is the opportunity: everyone generates code fast, few validate it well. Use Claude, Copilot, dbt Copilot and Databricks Genie to draft, then be the engineer who closes the testing and observability gap they leave behind.</p>",
    "tags": [
      "ai",
      "career"
    ],
    "src": "https://www.prnewswire.com/news-releases/new-dbt-labs-report-finds-ai-driven-acceleration-is-outpacing-trust-and-governance-302741246.html"
  },
  {
    "id": "role-11",
    "cat": "AI",
    "level": "Advanced",
    "title": "Vibe coding does not scale to data",
    "hook": "Generation is free; knowing it is correct is not.",
    "body": "<p>The bottleneck has moved from writing code to verifying it. 96% of developers do not fully trust AI output is correct, yet only 48% always review before committing. In data, a wrong join silently corrupts every downstream dashboard. Karpathy himself now pushes <em>agentic engineering</em> over vibe coding: AI drafts, but a rigorous human owns review, tests, and reconciliation.</p>",
    "tags": [
      "ai",
      "skills"
    ],
    "src": "https://simonwillison.net/2026/May/6/vibe-coding-and-agentic-engineering/"
  },
  {
    "id": "role-12",
    "cat": "AI",
    "level": "Advanced",
    "title": "Correctness is your AI-proof moat",
    "hook": "Iterating on AI output compounds errors, not fixes them.",
    "body": "<p>A 2025 IEEE study found a 37.6% rise in critical defects after five rounds of AI refinement; problems compound rather than self-correct. dbt reports 71% of teams fear hallucinated outputs reaching stakeholders. The defensible skill is verification: grain checks, row-count reconciliation, null profiling, and comparing model output to a trusted source of truth. Be the validation layer agents cannot replace.</p>",
    "tags": [
      "ai",
      "skills"
    ],
    "src": "https://www.prnewswire.com/news-releases/new-dbt-labs-report-finds-ai-driven-acceleration-is-outpacing-trust-and-governance-302741246.html"
  },
  {
    "id": "role-13",
    "cat": "AI",
    "level": "Core",
    "title": "Genie and text-to-SQL need a curator",
    "hook": "Natural-language BI is only as good as the model behind it.",
    "body": "<p>Tools like Databricks Genie answer business questions in plain English, but accuracy collapses without curated tables, clear column descriptions, sample queries, and a semantic layer. That curation is an emerging AE responsibility. If you make Genie reliable for a stakeholder team, you have demonstrated exactly the AE skill set: modeling, metric definition, and business context working together.</p>",
    "tags": [
      "ai",
      "skills"
    ],
    "src": "https://www.getdbt.com/blog/ai-agents-and-the-data-lake"
  },
  {
    "id": "role-14",
    "cat": "Career",
    "level": "Core",
    "title": "Pivot internally: own one model end to end",
    "hook": "Analysts make the best analytics engineers, per dbt.",
    "body": "<p>dbt argues analysts pivot fastest because they already know the data and the business. Concrete path inside your company: shadow AE pull requests to learn the review bar, then claim ownership of one real model, refactoring it with tests, docs, and a clean PR. One owned model in production beats any tutorial. Your Salesforce and Tableau context is the differentiator engineers lack.</p>",
    "tags": [
      "career",
      "role"
    ],
    "src": "https://docs.getdbt.com/blog/analysts-make-the-best-aes"
  },
  {
    "id": "role-15",
    "cat": "Career",
    "level": "Core",
    "title": "Build a public dbt portfolio",
    "hook": "A live repo beats a resume bullet every time.",
    "body": "<p>Spin up a free dbt project on a public dataset: stage raw sources, build a staging layer, add marts, write tests, and document with <code>dbt docs</code>. Push it to GitHub with a clear README showing your lineage DAG. Hiring managers can read your modeling judgment directly. Bonus credibility: contribute a fix or test to an open-source dbt package like dbt-utils.</p>",
    "tags": [
      "career",
      "skills"
    ],
    "src": "https://github.com/dbt-labs/docs.getdbt.com/discussions/1540"
  },
  {
    "id": "role-16",
    "cat": "Career",
    "level": "Core",
    "title": "Interview reality: SQL in every round",
    "hook": "SQL is the single most-tested skill in data interviews.",
    "body": "<p>Expect SQL in every loop, at production volume, not toy tables: window functions, anti-joins, deduplication, and slowly changing dimensions. dbt and modeling rounds probe your mental model, not syntax recall. Increasingly there is a take-home dbt project (sometimes 10-plus hours) plus a present-your-solution follow-up. Practise reasoning aloud about grain and edge cases, since that is what interviewers actually score.</p>",
    "tags": [
      "career",
      "skills"
    ],
    "src": "https://dev.to/hadil/data-engineering-interview-prep-2026-what-actually-matters-sql-pipelines-system-design-478j"
  },
  {
    "id": "role-17",
    "cat": "Career",
    "level": "Advanced",
    "title": "System design for data has shifted",
    "hook": "Not design a warehouse, but design within constraints.",
    "body": "<p>2026 system-design rounds moved from design a batch warehouse to design a pipeline that processes 10K LLM documents a day with rate limits, retries, and a cost budget. Interviewers want cost awareness, idempotency, backfills, and failure handling. Also clarify AI policy upfront: companies are split between banning and requiring AI in interviews, and guessing wrong can cost you the offer.</p>",
    "tags": [
      "career",
      "ai"
    ],
    "src": "https://dev.to/hadil/data-engineering-interview-prep-2026-what-actually-matters-sql-pipelines-system-design-478j"
  },
  {
    "id": "role-18",
    "cat": "Career",
    "level": "Senior",
    "title": "The market: demand and pay are real",
    "hook": "AE and DE remain among the best-paid data roles in 2026.",
    "body": "<p>2026 analytics engineer total comp typically runs ~$81k-$173k; data engineers average ~$125k-$130k with seniors past $200k in major hubs, and ~20% projected DE job growth this decade. AI raises the bar rather than removing roles: routine work shrinks, judgment-heavy work pays more. Position yourself on modeling, validation, and business context, the parts the market is paying up for.</p>",
    "tags": [
      "career"
    ],
    "src": "https://motionrecruitment.com/it-salary/data-engineering"
  },
  {
    "id": "plat-01",
    "cat": "Platform",
    "level": "Foundations",
    "title": "The format war is over; catalogs won",
    "hook": "Stop agonising over Delta vs Iceberg. The real battle moved up a layer.",
    "body": "<p>Through 2025-2026 the file-format debate cooled because the formats converged on the same Parquet data and read-interop got easy. The fight shifted to the <strong>metadata control plane</strong> (the catalog): who governs tables, vends credentials, and enforces access. Databricks added native Iceberg support in June 2025; engines now read each other's tables. The format you pick matters less than the catalog you commit to.</p>",
    "tags": [
      "lakehouse",
      "table-format",
      "catalog"
    ],
    "src": "https://datalakehousehub.com/blog/2026-05-choosing-iceberg-control-plane/"
  },
  {
    "id": "plat-02",
    "cat": "Platform",
    "level": "Core",
    "title": "Delta vs Iceberg vs Hudi trilemma",
    "hook": "Three open table formats, one shrinking gap.",
    "body": "<p>All three add ACID transactions, time travel and schema evolution on top of Parquet. <strong>Delta Lake</strong> is Databricks-native and Spark-tight. <strong>Iceberg</strong> won the vendor-neutral open standard race (Snowflake, BigQuery, AWS, Dremio all back it). <strong>Hudi</strong> excels at upsert-heavy streaming ingestion. In 2026 the differences narrowed so much that interop tooling (UniForm, XTable) lets one copy of data serve all three.</p>",
    "tags": [
      "table-format",
      "delta",
      "iceberg",
      "hudi"
    ],
    "src": "https://www.dremio.com/blog/apache-iceberg-vs-delta-lake/"
  },
  {
    "id": "plat-03",
    "cat": "Platform",
    "level": "Core",
    "title": "Delta UniForm: one copy, two formats",
    "hook": "Write Delta, let Snowflake read it as Iceberg, no second copy.",
    "body": "<p>UniForm makes a Delta table readable by Iceberg (and Hudi) clients. After a Delta write commits, Databricks <strong>asynchronously generates Iceberg metadata</strong> against the same Parquet files, no data rewrite and negligible overhead. The classic pattern: ETL in Databricks, then point Snowflake/BigQuery/Athena at it via an Iceberg catalog integration. It dissolves the lock-in argument for picking a format up front.</p>",
    "tags": [
      "delta",
      "iceberg",
      "uniform",
      "interop"
    ],
    "src": "https://www.databricks.com/blog/delta-lake-universal-format-uniform-iceberg-compatibility-now-ga"
  },
  {
    "id": "plat-04",
    "cat": "Platform",
    "level": "Advanced",
    "title": "The Iceberg REST Catalog spec",
    "hook": "The one API that every catalog now pretends to speak.",
    "body": "<p>The Iceberg <strong>REST Catalog spec</strong> became the de-facto universal interface for table metadata. <strong>Apache Polaris</strong> (donated by Snowflake to the ASF) is the reference open-source implementation. Unity Catalog, AWS Glue and BigLake all implement the same REST API, so any compliant engine can discover and read tables from any compliant catalog. It is the closest thing the lakehouse has to a standard plug.</p>",
    "tags": [
      "catalog",
      "iceberg",
      "polaris",
      "rest-catalog"
    ],
    "src": "https://www.snowflake.com/en/engineering-blog/apache-polaris-supports-iceberg-delta-lake/"
  },
  {
    "id": "plat-05",
    "cat": "Platform",
    "level": "Senior",
    "title": "Governance is the real lock-in",
    "hook": "Reading is interoperable. Permissions are not.",
    "body": "<p>Engines can now read each other's tables, but <strong>governance models have not converged</strong>. Every catalog (Unity, Polaris, Glue) ships its own RBAC model, policy language and credential-vending scheme, and there is no cross-catalog governance standard. That makes the security and access layer the deepest, stickiest lock-in vector left, far harder to migrate than the data files themselves. Choose your catalog for its governance story, not its read support.</p>",
    "tags": [
      "catalog",
      "governance",
      "unity-catalog",
      "lock-in"
    ],
    "src": "https://www.nidhivichare.com/blog/catalog-wars-part-2"
  },
  {
    "id": "plat-06",
    "cat": "Platform",
    "level": "Core",
    "title": "Unity Catalog is multi-format on purpose",
    "hook": "Polaris speaks only Iceberg; Unity speaks everything.",
    "body": "<p>Databricks open-sourced <strong>Unity Catalog</strong> as a unified governance layer for Delta Lake, Iceberg, Hudi and unstructured files, plus ML models and functions. That breadth is the strategic counter to Iceberg-only catalogs like Polaris and Snowflake Open Catalog. For your stack it is the single place to govern dbt models, enforce row/column access, and trace lineage across formats, not just a metastore.</p>",
    "tags": [
      "unity-catalog",
      "governance",
      "databricks",
      "catalog"
    ],
    "src": "https://medium.com/@kywe665/unity-catalog-vs-apache-polaris-522b69a4d7df"
  },
  {
    "id": "plat-07",
    "cat": "Platform",
    "level": "Core",
    "title": "Databricks and Snowflake are converging",
    "hook": "The lakehouse vs warehouse line is blurring fast.",
    "body": "<p>The two giants are racing toward the same middle. Databricks added warehouse-style SQL, serverless and native Iceberg; Snowflake added external Iceberg tables, Polaris and Snowpark for code-first work. Open table formats are the enabler: both can sit on the <strong>same Iceberg/Delta files in object storage</strong>. The differentiator is no longer storage but the compute, governance and AI/BI experience layered on top.</p>",
    "tags": [
      "lakehouse",
      "databricks",
      "snowflake",
      "convergence"
    ],
    "src": "https://www.dimensionlabs.io/blog/analytics-stack"
  },
  {
    "id": "plat-08",
    "cat": "dbt",
    "level": "Core",
    "title": "dbt Fusion: a Rust engine for dbt",
    "hook": "30x faster, but not where you think.",
    "body": "<p>dbt's <strong>Fusion engine</strong> (Rust, public beta May 2025) replaces the Python core. It natively parses SQL, giving real-time errors and column-level lineage in your editor. The headline ~30x speedup applies to <strong>parsing and compiling the DAG, not query execution</strong>, your warehouse still runs the SQL. Fusion also enables state-aware orchestration: rebuild a model only when its upstream source has fresh data.</p>",
    "tags": [
      "dbt",
      "fusion",
      "rust",
      "performance"
    ],
    "src": "https://github.com/dbt-labs/dbt-fusion"
  },
  {
    "id": "plat-09",
    "cat": "dbt",
    "level": "Advanced",
    "title": "dbt Mesh and cross-project refs",
    "hook": "How a 5000-model monorepo gets broken up safely.",
    "body": "<p>dbt Mesh lets multiple dbt projects reference each other via governed <strong>cross-project refs</strong>, instead of one giant monolith. Each domain team owns its project, exposes public models as contracts, and downstream teams depend on them with versioning and access controls. It is dbt's answer to data mesh: domain ownership with enterprise governance. Available on the dbt platform Enterprise tier.</p>",
    "tags": [
      "dbt",
      "dbt-mesh",
      "data-mesh",
      "governance"
    ],
    "src": "https://docs.getdbt.com/docs/fusion/about-fusion"
  },
  {
    "id": "plat-10",
    "cat": "dbt",
    "level": "Advanced",
    "title": "SQLMesh: the dbt challenger",
    "hook": "Test against prod data without cloning a single table.",
    "body": "<p>SQLMesh parses SQL via SQLGlot, so it catches errors at compile time and auto-categorises changes as breaking or non-breaking. Its killer feature is <strong>virtual environments</strong>: dev creates logical views over shared physical tables, no full clone, near-instant feedback. Teams report 40-60% warehouse-cost cuts versus dbt's clone model. dbt stays the safe default for ecosystem; SQLMesh wins when cost or column-level safety dominate.</p>",
    "tags": [
      "sqlmesh",
      "dbt",
      "virtual-environments",
      "lineage"
    ],
    "src": "https://www.modern-datatools.com/compare/dbt-vs-sqlmesh"
  },
  {
    "id": "plat-11",
    "cat": "Modeling",
    "level": "Core",
    "title": "Semantic layer: define metrics once",
    "hook": "Stop redefining revenue in every dashboard.",
    "body": "<p>A semantic layer moves metric definitions <strong>out of the BI tool and into the modeling layer</strong>. dbt's MetricFlow defines metrics in YAML; change revenue once and it updates everywhere it is queried, Tableau, a copilot, an API. On your stack, Databricks Metric Views play the same role inside Unity Catalog and feed Genie's natural-language querying. One definition, consistent numbers across every tool.</p>",
    "tags": [
      "semantic-layer",
      "metricflow",
      "dbt",
      "metric-views"
    ],
    "src": "https://docs.getdbt.com/docs/build/about-metricflow"
  },
  {
    "id": "plat-12",
    "cat": "Modeling",
    "level": "Senior",
    "title": "Headless BI: metrics as an API",
    "hook": "What if every tool queried the same metric backend?",
    "body": "<p>Headless BI exposes the semantic layer over APIs so any consumer queries identical metrics. Cube, for example, serves one metric definition through four interfaces (SQL, REST, GraphQL, MDX) so a dashboard, a product UI, an AI copilot and a partner integration all hit the same logic, no re-implementation. The BI tool becomes a thin presentation layer over a governed metric backbone.</p>",
    "tags": [
      "headless-bi",
      "semantic-layer",
      "cube",
      "api"
    ],
    "src": "https://analytify.ai/glossary/headless-bi/"
  },
  {
    "id": "plat-13",
    "cat": "Platform",
    "level": "Core",
    "title": "Airflow 3.0: assets enter the room",
    "hook": "The task-first orchestrator finally learned to think in data.",
    "body": "<p>Airflow 3.0 added <strong>DAG versioning</strong>, <strong>event-driven scheduling</strong> and first-class <strong>data assets</strong>, narrowing the gap with asset-native tools. Airflow stays the 2026 default for its huge ecosystem and production mileage. Its model is still fundamentally task-centric (run this, then that), but assets let a DAG trigger when upstream data changes rather than purely on a clock.</p>",
    "tags": [
      "orchestration",
      "airflow",
      "assets",
      "scheduling"
    ],
    "src": "https://reintech.io/blog/data-pipeline-orchestration-airflow-dagster-prefect-2026"
  },
  {
    "id": "plat-14",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Dagster: assets, not tasks",
    "hook": "Declare the data you want; let the tool figure out the steps.",
    "body": "<p>Dagster inverts the model: you declare <strong>assets</strong> (the tables/files that should exist) instead of tasks. Because assets are the primary abstraction, Dagster knows the data lineage and skips re-materialising downstream assets when upstream data has not changed, free incremental processing and caching. It is the strongest fit for greenfield, dbt-heavy modern-data-stack teams who want a data-centric mental model.</p>",
    "tags": [
      "orchestration",
      "dagster",
      "assets",
      "lineage"
    ],
    "src": "https://dagster.io/blog/dagster-airflow"
  },
  {
    "id": "plat-15",
    "cat": "Spark",
    "level": "Core",
    "title": "Single-node renaissance: DuckDB and Polars",
    "hook": "Most of your jobs never needed a cluster.",
    "body": "<p>DuckDB and Polars are <strong>single-node</strong> engines optimised to squeeze one machine, and they crush Spark on small-to-medium data because they skip distributed overhead (network shuffles, disk spills, JVM startup). Spark optimises for distribution and wins on truly large jobs, tens to hundreds of GB and up. The 2026 norm is hybrid: DuckDB/Polars for quick analyses and dev, Spark for heavy production ETL.</p>",
    "tags": [
      "duckdb",
      "polars",
      "spark",
      "single-node"
    ],
    "src": "https://milescole.dev/data-engineering/2024/12/12/Should-You-Ditch-Spark-DuckDB-Polars.html"
  },
  {
    "id": "plat-16",
    "cat": "Streaming",
    "level": "Core",
    "title": "Log-based CDC with Debezium",
    "hook": "Capture every row change in under a second, without polling.",
    "body": "<p>Debezium is the reference <strong>log-based CDC</strong> implementation: it reads the database transaction log (MySQL binlog, Postgres WAL) and emits row-level change events to Kafka in under a second from commit, with no query load on the source. But Debezium only captures changes, you pair it with a stream processor (Kafka Streams, Flink, ksqlDB) to transform, filter or enrich the events in flight.</p>",
    "tags": [
      "cdc",
      "debezium",
      "kafka",
      "streaming"
    ],
    "src": "https://streamkap.com/resources-and-guides/best-cdc-tools-compared"
  },
  {
    "id": "plat-17",
    "cat": "Streaming",
    "level": "Foundations",
    "title": "Ingestion split into three modes",
    "hook": "ETL did not die; it shattered into three jobs.",
    "body": "<p>In 2026 what used to be one ETL bucket is three distinct modes. <strong>Batch</strong>: managed ELT like Fivetran and Airbyte for periodic loads. <strong>Streaming</strong>: Kafka/Confluent for continuous event pipelines. <strong>Eventing/CDC</strong>: Debezium for database change capture, Snowplow/Segment for clickstream. Picking the right mode per source, not forcing everything through one tool, is the core ingestion design decision.</p>",
    "tags": [
      "ingestion",
      "elt",
      "fivetran",
      "cdc"
    ],
    "src": "https://www.dimensionlabs.io/blog/analytics-stack"
  },
  {
    "id": "plat-18",
    "cat": "Platform",
    "level": "Senior",
    "title": "Data contracts: the producer handshake",
    "hook": "Data mesh fails without an enforceable interface.",
    "body": "<p>A <strong>data contract</strong> is a formal, versioned schema-and-quality agreement between a data producer and its consumers. The Open Data Contract Standard (ODCS, under the Linux Foundation Bitol project) is the emerging spec; the Data Contract CLI lints contracts, tests them against live Databricks/Snowflake data, and flags breaking changes before they ship. Contracts are the missing primitive that makes decentralised data-mesh ownership actually safe.</p>",
    "tags": [
      "data-contracts",
      "data-mesh",
      "data-products",
      "governance"
    ],
    "src": "https://www.carlosacchi.cloud/data-contracts-the-missing-handshake-between-data-producers-and-consumers-2468cf220d42"
  },
  {
    "id": "auto-20260602-1",
    "cat": "Platform",
    "level": "Core",
    "title": "Fivetran and dbt Labs merged",
    "hook": "The two tools you are learning are now one company.",
    "body": "<p>The merger completed on 1 June 2026 (all-stock, the combined company nearing ~$600M ARR): Fivetran's George Fraser is CEO, dbt's Tristan Handy is President. Alongside it, <code>dbt Core v2.0</code> shipped in alpha under Apache 2.0, running on the Rust Fusion engine. The pitch is one stack from ingestion through transformation to feed trustworthy AI agents. For your pivot: the ingest and transform layers are consolidating, so fluency in both halves is now baseline.</p>",
    "tags": [
      "dbt",
      "fivetran",
      "industry"
    ],
    "src": "https://www.businesswire.com/news/home/20260601514374/en/Fivetran-dbt-Labs-Complete-Merger-to-Create-the-Data-Infrastructure-for-Trusted-AI-Agents"
  },
  {
    "id": "auto-20260602-2",
    "cat": "Platform",
    "level": "Advanced",
    "title": "DuckLake puts metadata in a SQL database",
    "hook": "Iceberg and Delta keep metadata in files. DuckLake keeps it in Postgres.",
    "body": "<p>DuckLake (v1.0, April 2026) stores table metadata in a SQL catalog &mdash; SQLite, Postgres or DuckDB &mdash; instead of a pile of JSON and Avro manifest files in object storage. One transactional query replaces listing thousands of tiny metadata files, so snapshots, schema changes and multi-table commits are fast and fully ACID. Data still lives in Parquet. v1.0 adds data inlining for small writes plus Iceberg-compatible deletion vectors; clients exist for Spark, Trino and DataFusion.</p>",
    "tags": [
      "ducklake",
      "table-format",
      "catalog"
    ],
    "src": "https://ducklake.select/2026/04/13/ducklake-10/"
  },
  {
    "id": "auto-20260602-3",
    "cat": "Platform",
    "level": "Core",
    "title": "Lakebase: Postgres inside the lakehouse",
    "hook": "OLTP and OLAP stop being two separate databases.",
    "body": "<p>Lakebase (GA February 2026, built on the Neon Postgres engine Databricks acquired for ~$1B) is serverless Postgres that sits next to Unity Catalog. Separated compute and storage give single-digit-millisecond latency and over 10K QPS for app and agent workloads, and it syncs with managed Delta tables &mdash; no custom ETL to shuttle operational data into analytics. You can branch the database like code and reset to prod data instantly. The lakehouse now serves transactions, not just analytics.</p>",
    "tags": [
      "lakebase",
      "postgres",
      "oltp",
      "databricks"
    ],
    "src": "https://www.databricks.com/blog/announcing-lakebase-public-preview"
  },
  {
    "id": "auto-20260602-4",
    "cat": "SQL",
    "level": "Advanced",
    "title": "VARIANT beats JSON-in-a-string",
    "hook": "Stop dumping JSON into a string column and re-parsing it every query.",
    "body": "<p>VARIANT is the open binary type for semi-structured data across Parquet, Delta and Iceberg. Versus JSON held in a string it is parsed once and reads about 8x faster, while still accepting any nested shape. <em>Shredding</em> goes further: hot fields are written as real Parquet columns, so a query touching a few keys reads only those &mdash; up to 30x faster reads (writes 20-50% slower). DBR 17.2+ does it transparently. Navigate with path syntax:</p><pre><code>select payload:user.id, payload:items[0].sku\nfrom events;</code></pre>",
    "tags": [
      "variant",
      "semi-structured",
      "shredding"
    ],
    "src": "https://www.databricks.com/blog/introducing-open-variant-data-type-delta-lake-and-apache-spark"
  },
  {
    "id": "auto-20260602-5",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Spark Declarative Pipelines: DLT goes open source",
    "hook": "Declare the tables you want; Spark wires the DAG.",
    "body": "<p>Databricks donated Delta Live Tables to the Apache Spark project as <strong>Spark Declarative Pipelines</strong>, landing as a native capability in the Spark 4.x series. You declare the streaming and materialized tables you want plus their queries; the engine derives the dependency DAG, checkpoints, retries, CDC handling and observability instead of you wiring task order by hand. It is the open, vendor-neutral form of the declarative-asset idea Dagster popularised &mdash; now built into Spark itself, not a proprietary add-on.</p>",
    "tags": [
      "spark",
      "declarative-pipelines",
      "dlt"
    ],
    "src": "https://www.databricks.com/blog/bringing-declarative-pipelines-apache-spark-open-source-project"
  },
  {
    "id": "auto-20260602-6",
    "cat": "Modeling",
    "level": "Advanced",
    "title": "Open Semantic Interchange standardises metrics",
    "hook": "A vendor-neutral file format for your metric definitions.",
    "body": "<p>OSI (launched September 2025 by Snowflake, dbt Labs, Salesforce and others) is a vendor-neutral YAML spec for semantic constructs &mdash; datasets, metrics, dimensions, relationships &mdash; built on dbt's MetricFlow format. The point: define <em>revenue</em> once and carry that definition between dbt, Snowflake, Tableau and AI tools without re-implementing it per tool. It is the interchange layer that sits above any single semantic engine, so an AI agent reads the same metric meaning everywhere it asks.</p>",
    "tags": [
      "semantic-layer",
      "osi",
      "metrics",
      "interop"
    ],
    "src": "https://www.snowflake.com/en/blog/open-semantic-interchange-ai-standard/"
  },
  {
    "id": "auto-20260603-1",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Spark 4.0 turns silent nulls into errors",
    "hook": "The cast that quietly returned null now stops your job dead.",
    "body": "<p>Spark 4.0 flips <code>spark.sql.ansi.enabled</code> to true by default. Operations that used to return null on failure &mdash; invalid casts, divide-by-zero, arithmetic overflow, out-of-range array access &mdash; now raise runtime errors. Better integrity, but pipelines that leaned on null-on-failure break loudly on upgrade. When you actually want a null instead of a crash, switch to the explicit safe variants:</p><pre><code>select try_cast(qty as int),\n       try_divide(revenue, orders)\nfrom sales;</code></pre>",
    "tags": [
      "spark",
      "ansi",
      "null-handling",
      "migration"
    ],
    "src": "https://www.databricks.com/blog/introducing-apache-spark-40"
  },
  {
    "id": "auto-20260603-2",
    "cat": "SQL",
    "level": "Advanced",
    "title": "Pipe syntax reads top-to-bottom",
    "hook": "Stop nesting subqueries inside-out; chain each step with an arrow.",
    "body": "<p>The pipe operator passes one relation into the next step, so a query reads in execution order instead of select-then-from-then-where. Start with a table, then append operators:</p><pre><code>from orders\n|&gt; where status = 'paid'\n|&gt; aggregate sum(amount) as revenue group by region\n|&gt; order by revenue desc;</code></pre><p>Any prefix of the chain is itself a valid query, so you debug by deleting the tail. It is in Spark 4.0, BigQuery, Databricks and Snowflake.</p>",
    "tags": [
      "sql",
      "pipe-syntax",
      "readability"
    ],
    "src": "https://www.databricks.com/blog/sql-gets-easier-announcing-new-pipe-syntax"
  },
  {
    "id": "auto-20260603-3",
    "cat": "Platform",
    "level": "Senior",
    "title": "Iceberg V3 row lineage makes CDC cheap",
    "hook": "Every row gets a permanent serial number, so engines diff snapshots instead of full scans.",
    "body": "<p>Iceberg V3 (ratified 2025) stamps each row with a <code>_row_id</code> and a <code>_last_updated_sequence_number</code>. Engines find exactly which rows changed between two snapshots by matching IDs across commits &mdash; no full-table compare, no hand-built CDC table. If an ID disappears and a new one arrives on the same key, that is an update. Snowflake Dynamic Tables and Streams already run on this metadata, turning incremental processing on open tables into a near-free range scan.</p>",
    "tags": [
      "iceberg",
      "row-lineage",
      "cdc",
      "incremental"
    ],
    "src": "https://www.databricks.com/blog/apache-icebergtm-v3-moving-ecosystem-towards-unification"
  },
  {
    "id": "auto-20260603-4",
    "cat": "AI",
    "level": "Advanced",
    "title": "MCP keeps data agents governed",
    "hook": "The agent that builds your pipeline needs a tool belt that is authenticated and audited.",
    "body": "<p>Agentic tools like Databricks Genie Code now build pipelines, debug failures and ship dashboards, the way coding agents reshaped software. The risk is an agent wielding a copied token against production. Model Context Protocol is the fix: managed MCP servers expose Genie spaces, Databricks SQL, Vector Search and Unity Catalog functions as discoverable tools. Every call the agent makes is authenticated and auditable in the workspace &mdash; governance is the feature, not the autonomy.</p>",
    "tags": [
      "mcp",
      "agents",
      "governance",
      "genie"
    ],
    "src": "https://www.databricks.com/blog/introducing-genie-code"
  },
  {
    "id": "auto-20260604-1",
    "cat": "SQL",
    "level": "Advanced",
    "title": "Run an LLM from a SQL select",
    "hook": "ai_query turns a 50M-row enrichment job into one line of SQL.",
    "body": "<p>AI Functions call a model straight from Databricks SQL &mdash; no Python serving code. Task-specific ones (<code>ai_classify</code>, <code>ai_extract</code>, <code>ai_parse_document</code>) are tuned for classification, entity extraction and sentiment; <code>ai_query</code> gives full control of model and prompt. They auto-manage parallelism, retries and scaling, so batch LLM inference over millions of rows runs like any other query. Use DBR 15.4 ML LTS+ for batch performance.</p><pre><code>select ai_classify(review_text,\n  array('praise', 'complaint')) as label\nfrom reviews;</code></pre>",
    "tags": [
      "ai-functions",
      "ai-query",
      "batch-inference"
    ],
    "src": "https://docs.databricks.com/aws/en/large-language-models/ai-functions"
  },
  {
    "id": "auto-20260604-2",
    "cat": "Modeling",
    "level": "Advanced",
    "title": "Delta IDENTITY keys disable concurrent writes",
    "hook": "Auto-incrementing surrogate keys come with three sharp catches.",
    "body": "<p><code>generated always as identity</code> auto-assigns a unique bigint per insert &mdash; handy for surrogate keys. But three catches bite: (1) declaring it <strong>disables concurrent transactions</strong> on the table, so parallel writers serialise or fail; (2) values are unique and monotonic but <strong>not contiguous</strong> &mdash; gaps are normal, never read them as a count; (3) you <strong>cannot add one to an existing table</strong>, you rebuild. For dimensions with concurrent loads, a hash surrogate key is often safer.</p><pre><code>create table dim_account (\n  account_key bigint generated always as identity,\n  account_id string);</code></pre>",
    "tags": [
      "identity-column",
      "surrogate-key",
      "delta"
    ],
    "src": "https://www.databricks.com/blog/2022/08/08/identity-columns-to-generate-surrogate-keys-are-now-available-in-a-lakehouse-near-you.html"
  },
  {
    "id": "auto-20260604-3",
    "cat": "Platform",
    "level": "Senior",
    "title": "ABAC: one policy masks a thousand tables",
    "hook": "Tag a column 'pii' once; the mask follows it everywhere.",
    "body": "<p>Unity Catalog attribute-based access control (GA 2026) attaches row filters and column masks to <strong>governed tags</strong> at the catalog or schema level, so a single policy applies automatically to every matching table &mdash; no per-table UDF wiring. Tag a column <code>pii</code> and the masking policy hides it from non-privileged roles across the whole catalog, including tables created later. Higher-level admins own the policy, so table owners can't override it, and it evaluates faster than table-specific filter UDFs.</p>",
    "tags": [
      "abac",
      "unity-catalog",
      "governance"
    ],
    "src": "https://www.databricks.com/blog/abac-row-filtering-and-column-masking-policies-governed-tags-and-data-classification-are-now"
  },
  {
    "id": "auto-20260604-4",
    "cat": "Streaming",
    "level": "Advanced",
    "title": "Auto Loader: incremental file ingestion done right",
    "hook": "Don't re-list a bucket of millions of files on every run.",
    "body": "<p>Auto Loader (<code>cloudFiles</code>) incrementally ingests new files from object storage with exactly-once guarantees. Directory-listing mode re-scans the whole path &mdash; fine until the folder holds millions of files. File-notification / managed-file-events mode subscribes to a cloud queue and reads new files from an event cache, scaling to millions of files an hour without the listing tax. You can switch modes anytime and keep exactly-once. Run the stream at least weekly so the incremental cache stays warm.</p><pre><code>spark.readStream.format('cloudFiles')\n  .option('cloudFiles.format', 'json')\n  .option('cloudFiles.useManagedFileEvents', 'true')\n  .load(path)</code></pre>",
    "tags": [
      "auto-loader",
      "cloudfiles",
      "ingestion"
    ],
    "src": "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/file-events-explained"
  },
  {
    "id": "auto-20260604-5",
    "cat": "Platform",
    "level": "Core",
    "title": "Lakeflow Connect ingests without CDC config",
    "hook": "Pull from Oracle or Postgres with a cursor column, no Debezium.",
    "body": "<p>Lakeflow Connect is Databricks-native managed ingestion &mdash; GA connectors for Salesforce, Workday and SQL Server, governed by Unity Catalog and powered by serverless Spark Declarative Pipelines. New in 2026: <strong>query-based connectors</strong> (public preview) read a source by polling a cursor column (an <code>updated_at</code> or incrementing id), so you ingest Oracle, Teradata, MySQL and Postgres incrementally with no CDC setup and no ingestion gateway. Simpler than log-based CDC when you don't need sub-second freshness.</p>",
    "tags": [
      "lakeflow-connect",
      "ingestion",
      "cdc"
    ],
    "src": "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/"
  },
  {
    "id": "auto-20260604-6",
    "cat": "AI",
    "level": "Advanced",
    "title": "Grade text-to-SQL on execution, not string match",
    "hook": "Two different queries can both be right - compare the result sets.",
    "body": "<p>Before trusting a Genie or text-to-SQL assistant, build an eval harness. The metric that matters is <strong>execution accuracy</strong>: run the generated SQL and the gold SQL, then compare result sets &mdash; not string similarity, since many correct queries look nothing alike. Benchmarks like BIRD top out near ~80% even for frontier models on multi-table questions, so measure on <em>your</em> schema. Tools like Promptfoo and Tiger Data's suite automate test cases and schema validation. This eval is the AE skill that makes natural-language BI shippable.</p>",
    "tags": [
      "text-to-sql",
      "evaluation",
      "genie"
    ],
    "src": "https://research.aimultiple.com/text-to-sql/"
  },
  {
    "id": "auto-20260609-1",
    "cat": "Platform",
    "level": "Core",
    "title": "Lakehouse Federation queries data in place",
    "hook": "Read Postgres, MySQL or Redshift from Databricks without copying a single row.",
    "body": "<p>Federation registers an external SQL database as a Unity Catalog <strong>connection</strong> plus a foreign catalog; queries are pushed down to the source over JDBC and governed by UC like any managed table &mdash; no ETL, no object-storage copy. Reach for it for on-demand reporting, POCs, exploratory analysis and incremental migration. The trade-off versus ingestion (Lakeflow Connect, Fivetran): every query hits the <em>live</em> source, adding load there and missing the speed and durability of a materialized Delta copy. Federate for ad-hoc; ingest for production.</p>",
    "tags": [
      "lakehouse-federation",
      "query-pushdown",
      "unity-catalog"
    ],
    "src": "https://docs.databricks.com/aws/en/query-federation/"
  },
  {
    "id": "auto-20260609-2",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Spark Connect decouples client from driver",
    "hook": "Spark 4.0's default client protocol: a 1.5MB PySpark client with no local JVM.",
    "body": "<p>Spark Connect is a gRPC client-server protocol &mdash; the default client protocol in Spark 4.0 &mdash; that replaces the old Py4J bridge. The client sends unresolved logical plans (the DataFrame API) to a remote driver. Three wins: PySpark runs from any IDE, notebook or app server with no local JVM; a client crash no longer takes down the driver; and you upgrade server-side dependencies without touching the client. Classic in-process mode still exists; Connect is just the new default.</p><pre><code>spark = SparkSession.builder \\\n  .remote('sc://host:15002').getOrCreate()</code></pre>",
    "tags": [
      "spark-connect",
      "grpc",
      "spark-4"
    ],
    "src": "https://spark.apache.org/docs/latest/spark-connect-overview.html"
  },
  {
    "id": "auto-20260609-3",
    "cat": "SQL",
    "level": "Advanced",
    "title": "MERGE WITH SCHEMA EVOLUTION auto-adds columns",
    "hook": "A new upstream column flows into the target table without a manual alter.",
    "body": "<p>In DBR 15.4 LTS+ you can put schema evolution directly in the merge. Columns present in the source query but missing from the target are added inside the same write transaction, so an added upstream field lands automatically instead of failing on <code>update set *</code>. It is an <em>additive</em> feature &mdash; it does not rename or drop, and a narrowing type change still errors (safe widening like int to bigint is handled by Delta's separate type-widening setting, not this clause).</p><pre><code>merge with schema evolution into dim_account t\nusing staging s on t.id = s.id\nwhen matched then update set *\nwhen not matched then insert *;</code></pre>",
    "tags": [
      "merge",
      "schema-evolution",
      "delta"
    ],
    "src": "https://docs.databricks.com/aws/en/sql/language-manual/delta-merge-into"
  },
  {
    "id": "auto-20260609-4",
    "cat": "dbt",
    "level": "Advanced",
    "title": "Semantic Layer exports materialize a metric",
    "hook": "Hand a non-SL-aware tool the governed metric as a plain table.",
    "body": "<p>A saved query bundles related metrics, dimensions and filters; an <strong>export</strong> runs it and writes the result to a physical table or view via a <code>create table</code> on the dbt job schedule. That is the integration path for consumers that cannot call the Semantic Layer API &mdash; point a Tableau extract or a Genie space at the exported table and they read the exact same governed definition without re-implementing it. It is the inverse of headless-BI's query-the-API model, and it needs the hosted MetricFlow server (dbt platform, 1.7+).</p>",
    "tags": [
      "semantic-layer",
      "exports",
      "saved-queries"
    ],
    "src": "https://docs.getdbt.com/docs/use-dbt-semantic-layer/exports"
  },
  {
    "id": "auto-20260609-5",
    "cat": "Platform",
    "level": "Core",
    "title": "system.billing.usage attributes every DBU",
    "hook": "FinOps stops being a guess when cost is a SQL table you can join and group.",
    "body": "<p>Databricks system tables put cost telemetry inside Unity Catalog as queryable tables. <code>system.billing.usage</code> holds one row per usage record with <code>custom_tags</code>, <code>billing_origin_product</code> and identity columns, so you attribute DBU spend to a team, job or pipeline with plain SQL &mdash; serverless included, via tag policies. Join it to <code>system.query.history</code> to pin down the expensive queries. This is the concrete mechanic behind cost-as-an-engineering-metric: tag your workloads, then group by tag.</p>",
    "tags": [
      "system-tables",
      "finops",
      "cost-attribution"
    ],
    "src": "https://docs.databricks.com/aws/en/admin/system-tables/billing"
  },
  {
    "id": "auto-20260609-6",
    "cat": "SQL",
    "level": "Advanced",
    "title": "Collations: case-insensitive without lower()",
    "hook": "Stop wrapping every join key in lower() &mdash; declare the column case-insensitive once.",
    "body": "<p>Spark 4.0 adds <strong>collations</strong>: per-column comparison rules baked into the type. Type a column <code>collate utf8_lcase</code> and equality, joins, <code>group by</code> and <code>order by</code> all compare case-insensitively with no <code>lower()</code> in sight &mdash; and <code>startswith</code>/<code>endswith</code> run up to 10x faster than the wrapped version because the optimizer keeps the raw column. ICU named collations add true language-aware ordering. Gotcha: collation is part of the type, so comparing two differently-collated columns throws <code>COLLATION_MISMATCH</code> &mdash; cast one side.</p><pre><code>create table t (name string collate utf8_lcase);\n<span class=\"cm\">-- 'Jian' = 'jian' is now true; no lower() needed</span>\n<span class=\"kw\">select</span> * <span class=\"kw\">from</span> t <span class=\"kw\">where</span> name = <span class=\"str\">'jian'</span>;</code></pre>",
    "tags": [
      "collation",
      "spark-4",
      "case-insensitive"
    ],
    "src": "https://www.databricks.com/blog/introducing-collations-databricks"
  },
  {
    "id": "auto-20260609-7",
    "cat": "Platform",
    "level": "Core",
    "title": "Predictive Optimization runs maintenance for you",
    "hook": "Delete your scheduled OPTIMIZE and VACUUM jobs &mdash; the platform decides when to run them.",
    "body": "<p>Predictive Optimization watches Unity Catalog managed tables and automatically fires <code>optimize</code> (compact files), <code>vacuum</code> (purge tombstoned data) and <code>analyze</code> (refresh stats) only when its model judges the payback beats the cost. As of 2025 it is <strong>on by default</strong> for new UC managed tables and accounts. This is not write-time auto-compaction &mdash; that fires inside each write. PO is a managed background service scheduling maintenance across the whole catalog, so you stop hand-tuning cron jobs and chasing small-file debt.</p>",
    "tags": [
      "predictive-optimization",
      "unity-catalog",
      "maintenance"
    ],
    "src": "https://docs.databricks.com/aws/en/optimizations/predictive-optimization"
  },
  {
    "id": "auto-20260609-8",
    "cat": "AI",
    "level": "Core",
    "title": "Tableau Pulse watches metrics; Agent writes the calc",
    "hook": "Your BI tool now monitors metrics for you and authors the calculation when you describe it.",
    "body": "<p>Two AI features now ship inside Tableau, not bolted on. <strong>Tableau Pulse</strong> continuously scans your published metrics, runs anomaly detection, and pushes a natural-language newsfeed explaining the <em>what</em> and <em>why</em> of each move &mdash; monitoring instead of a dashboard you must remember to open. <strong>Tableau Agent</strong> (formerly Einstein Copilot) authors calculations from a plain-English description and summarises dashboards inline. The catch for an analytics engineer: both lean on well-defined metrics upstream &mdash; sloppy semantics produce confident, wrong narratives.</p>",
    "tags": [
      "tableau",
      "pulse",
      "anomaly-detection"
    ],
    "src": "https://www.tableau.com/products/tableau-agent"
  },
  {
    "id": "auto-20260609-9",
    "cat": "Streaming",
    "level": "Advanced",
    "title": "Real-Time Mode: sub-300ms without a second engine",
    "hook": "A trigger config flag drops Structured Streaming from seconds to single-digit-ms p99.",
    "body": "<p>Classic Structured Streaming is micro-batch: it waits to form a batch, so latency floors at hundreds of ms to seconds. <strong>Real-Time Mode</strong> (GA in Spark 4.1, Dec 2025) instead schedules the query's stages concurrently as a long-lived job and processes events as they arrive &mdash; single-digit-millisecond p99 on stateless queries, under 300ms on many stateful ones. You switch it on with a trigger config change; the same DataFrame and SQL code runs, so you reach Flink-class latency without standing up a second engine.</p>",
    "tags": [
      "real-time-mode",
      "structured-streaming",
      "spark-4"
    ],
    "src": "https://www.databricks.com/blog/announcing-general-availability-real-time-mode-apache-spark-structured-streaming-databricks"
  },
  {
    "id": "auto-20260610-1",
    "cat": "Platform",
    "level": "Core",
    "title": "Managed Iceberg: Databricks writes Iceberg natively now",
    "hook": "UniForm only let Iceberg engines read your Delta. Now Unity Catalog creates and writes native Iceberg.",
    "body": "<p>UniForm exposed Delta tables <em>read-only</em> to Iceberg clients. Managed Iceberg (GA 2026) goes further: Unity Catalog creates, writes and optimizes native Iceberg tables that any engine reaches through the Iceberg REST Catalog. You get Predictive Optimization and Liquid Clustering on Iceberg, plus v3 features &mdash; deletion vectors, row tracking, the <code>variant</code> type. The format question stops being Delta-or-Iceberg; it becomes one governed table, written by whichever engine your team already runs.</p>",
    "tags": [
      "iceberg",
      "unity-catalog",
      "managed-iceberg"
    ],
    "src": "https://www.databricks.com/blog/announcing-full-apache-iceberg-support-databricks"
  },
  {
    "id": "auto-20260610-2",
    "cat": "Platform",
    "level": "Core",
    "title": "Lakeflow Designer: no-code ETL that emits real code",
    "hook": "A drag-and-drop ETL canvas an analyst can use &mdash; that still ships reviewable Python.",
    "body": "<p>Lakeflow Designer (public preview) is a visual, no-code builder for Lakeflow Declarative Pipelines, with a natural-language assistant grounded in your catalog. The detail that makes it safe: every drag-drop transformation compiles to production Python you can review, version in Git and fold into a larger workflow. It is not a black-box GUI &mdash; it is the same declarative engine with a front door for analysts, so no-code output and code-first pipelines converge instead of splitting into shadow ETL.</p>",
    "tags": [
      "lakeflow",
      "no-code",
      "etl"
    ],
    "src": "https://www.databricks.com/blog/announcing-lakeflow-designer-no-code-etl"
  },
  {
    "id": "auto-20260610-3",
    "cat": "DQ",
    "level": "Advanced",
    "title": "Data diff catches what assertion tests miss",
    "hook": "Tests are green, the row count matches &mdash; and a shifted join silently changed 4% of values.",
    "body": "<p>Assertion tests check ranges, nulls and accepted values; reconciliation checks row counts. Neither catches a value that quietly changed because a join shifted or a <code>case</code> branch flipped. Data diffing compares your model's dev output against prod row-by-row &mdash; a git diff for tables &mdash; and posts the value-level deltas onto the pull request. Run it in CI with open-source data-diff or dbt's <code>audit_helper</code>, and a reviewer sees exactly which rows a refactor moved before merge.</p>",
    "tags": [
      "data-diff",
      "ci",
      "regression"
    ],
    "src": "https://www.datafold.com/data-diff"
  },
  {
    "id": "auto-20260610-4",
    "cat": "AI",
    "level": "Core",
    "title": "An enterprise agent inherits your data model",
    "hook": "An agent is only as reliable as the modeled data it stands on &mdash; which is your job.",
    "body": "<p>Agent Bricks (Supervisor GA, April 2026) builds domain agents as governed Unity Catalog objects: they reach data through UC-secured tools, keep memory and state in Lakebase, and a supervisor orchestrates several into one workflow. The durable lesson for an analytics engineer is the Genie lesson again &mdash; the agent inherits your semantics. Clean grain, clear metric definitions and curated tables make it answer correctly; sloppy modeling makes it confidently wrong, at scale.</p>",
    "tags": [
      "agent-bricks",
      "unity-catalog",
      "governance"
    ],
    "src": "https://www.databricks.com/blog/agent-bricks-supervisor-agent-now-ga-orchestrate-enterprise-agents"
  },
  {
    "id": "auto-20260610-5",
    "cat": "SQL",
    "level": "Core",
    "title": "SQL UDFs: reuse a rule without the Python tax",
    "hook": "Stop pasting the same case expression into thirty models &mdash; define it once as a function.",
    "body": "<p>Spark 4 and Databricks register pure-SQL functions with no Python sandbox: write the logic once, govern it in Unity Catalog, reuse it everywhere. Scalar functions return one value per row; table functions return a whole table in the <code>from</code> clause. Because the body is SQL, the optimizer inlines it &mdash; no serialization tax like a Python UDF. Centralising a business rule here means one definition to fix, not thirty drifting copies.</p><pre><code>create or replace function main.dim.fmt_phone(p string)\n  returns string\n  return regexp_replace(p, <span class=\"str\">'[^0-9]'</span>, <span class=\"str\">''</span>);</code></pre>",
    "tags": [
      "sql-udf",
      "unity-catalog",
      "reuse"
    ],
    "src": "https://spark.apache.org/docs/latest/sql-ref-functions-udf-scalar.html"
  },
  {
    "id": "auto-20260611-1",
    "cat": "DQ",
    "level": "Core",
    "title": "Same column name, different unit of measure",
    "hook": "The migration matched schemas and row counts perfectly &mdash; and inflated the metric 100x.",
    "body": "<p>Real lesson from migrating the PAM flat table from Silver staging to Kafka domain events: Silver <code>value</code> columns were in <strong>dollars</strong>; Kafka <code>balance_total_credits</code> (and every <code>*_credits</code> column) was in <strong>credits</strong>, 100 credits = $1. Schemas lined up, joins worked, totals were 100x wrong. When switching a model to a new source, reconcile an <em>aggregate in business units</em> against the old source &mdash; row counts and schema checks pass while units silently lie.</p>",
    "tags": [
      "from-my-work",
      "units",
      "reconciliation",
      "migration"
    ],
    "src": "memory/patterns.md 2026-05-07 - PAM flat table Silver-to-Kafka migration"
  },
  {
    "id": "auto-20260611-2",
    "cat": "SQL",
    "level": "Core",
    "title": "AVG of rates is not the rate",
    "hook": "Averaging per-row CTRs gives a 2-impression row the same vote as a 200k-impression row.",
    "body": "<p>A rate metric must be the ratio of sums, never the average of per-row ratios &mdash; <code>avg(ctr)</code> weights every row equally, so low-volume rows drag the number away from the true rate:</p><pre><code>sum(clicks) / sum(impressions)  <span class=\"cm\">-- correct</span>\navg(clicks / impressions)       <span class=\"cm\">-- wrong</span></code></pre><p>Hit this in a Databricks AI/BI dashboard: widget expressions forbid division, which tempts the AVG shortcut. Compute the rate as a dataset-level custom calculation with <code>measure()</code>, or pre-aggregate in SQL.</p>",
    "tags": [
      "from-my-work",
      "rates",
      "weighted-average",
      "dashboards"
    ],
    "src": "memory/patterns.md 2026-05-11 - dashboard rate-metric rule"
  },
  {
    "id": "auto-20260611-3",
    "cat": "DQ",
    "level": "Advanced",
    "title": "DQX: quarantine bad rows, do not just flag them",
    "hook": "dbt tests judge a table after it is built; DQX filters rows while the pipeline runs.",
    "body": "<p>DQX (Databricks Labs, v1 May 2026) applies row- and column-level quality rules to PySpark DataFrames in flight, batch or streaming. Each failing row can be dropped, marked with a reason column, or <strong>quarantined</strong> to a side table for repair &mdash; so the good 99% ships on time instead of the whole load failing one assertion. It also profiles input data and auto-generates candidate rules. Complements dbt tests, which only validate after materialization.</p>",
    "tags": [
      "dqx",
      "quarantine",
      "data-quality"
    ],
    "src": "https://databrickslabs.github.io/dqx/"
  },
  {
    "id": "auto-20260611-4",
    "cat": "Spark",
    "level": "Senior",
    "title": "Row-level concurrency: two MERGEs, one file, no conflict",
    "hook": "Deletion vectors quietly bought you concurrent writers.",
    "body": "<p>Concurrent MERGE/UPDATE/DELETE jobs used to abort with <code>ConcurrentAppendException</code> when they touched the same data file. On DBR 14.3+ with deletion vectors enabled, Delta reconciles at the <em>row</em> level: two transactions modifying different rows in the same file have their deletion vectors merged instead of one failing. Catches: partitioned tables do not get it (one more reason to prefer Liquid Clustering), and writes to the <em>same</em> rows still conflict &mdash; serialise those.</p>",
    "tags": [
      "row-level-concurrency",
      "deletion-vectors",
      "merge"
    ],
    "src": "https://docs.databricks.com/aws/en/optimizations/isolation/row-level-concurrency"
  },
  {
    "id": "auto-20260611-5",
    "cat": "dbt",
    "level": "Core",
    "title": "dbt Core v2: one Rust runtime, strict spec",
    "hook": "The Python engine is gone &mdash; and your silently ignored YAML typos now fail loudly.",
    "body": "<p>dbt Core v2.0 (alpha June 2026, still Apache 2.0) runs on the same open-sourced Rust runtime as Fusion, so OSS users stop waiting for features to be ported from the paid engine. Day-to-day changes: a tightly defined <strong>language spec</strong> turns misspelled configs from silent no-ops into errors; artifacts ship as <strong>Parquet</strong> you can query with DuckDB instead of a giant manifest.json; built-in <code>dbt lint</code> is SQLFluff-compatible at roughly 50x the speed.</p>",
    "tags": [
      "dbt-core-v2",
      "fusion",
      "rust"
    ],
    "src": "https://docs.getdbt.com/blog/dbt-core-v2-is-here"
  },
  {
    "id": "auto-20260612-1",
    "cat": "DQ",
    "level": "Advanced",
    "title": "Incremental models hoard rows the source hard-deleted",
    "hook": "Counts dropped after a full refresh? The pipeline may finally be telling the truth.",
    "body": "<p>Real lesson from Salesforce-sourced models (<code>stg_tradie_account__salesforce_account</code> and children): an incremental run only inserts and updates &mdash; it never removes a row the source <em>hard-deleted</em>. Purged records (stale test accounts) linger in the model for months, then a <code>--full-refresh</code> drops them all at once and the count dive looks like a pipeline bug. Before blaming the transformation, diff the missing IDs against the raw source table &mdash; if they are gone there too, the refresh was a correction, not a regression.</p>",
    "tags": [
      "from-my-work",
      "incremental",
      "hard-deletes",
      "full-refresh"
    ],
    "src": "memory/patterns.md 2026-06-12 - SF full-refresh count-drop investigation"
  },
  {
    "id": "auto-20260612-2",
    "cat": "SQL",
    "level": "Core",
    "title": "Date ranges overlap; equality checks miss them",
    "hook": "The dedup only caught cycles starting the same day - shifted-but-overlapping cycles leaked straight through.",
    "body": "<p>Real bug in a billing-cycle dedup: old-subscription cycles were excluded only when their <code>cycle_start</code> <em>equalled</em> a current-sub cycle's start. Cycles that began earlier but covered the same period slipped into the metrics. The correct test for any two date ranges is interval intersection:</p><pre><code>where old.cycle_start &lt;= cur.cycle_end\n  and cur.cycle_start &lt;= old.cycle_end</code></pre><p>Apply it anywhere validity windows collide &mdash; SCD2 versions, subscriptions, billing periods. Test overlap, never boundary equality.</p>",
    "tags": [
      "from-my-work",
      "date-ranges",
      "overlap",
      "dedup"
    ],
    "src": "memory/patterns.md 2026-05-07 - account_cycles overlap dedup"
  },
  {
    "id": "auto-20260612-3",
    "cat": "SQL",
    "level": "Advanced",
    "title": "Stored procedures land in Unity Catalog",
    "hook": "begin...end, loops and execute immediate - warehouse SQL finally went procedural.",
    "body": "<p>Spark 4.0 added ANSI SQL/PSM scripting &mdash; <code>begin...end</code> blocks with declared variables, <code>if</code>/<code>case</code>, loops, exception handlers, and dynamic SQL via <code>identifier()</code> and <code>execute immediate</code>. Databricks then made <code>create procedure</code> GA (Feb 2026): the script persists in Unity Catalog with governed permissions, takes <code>in</code>/<code>out</code>/<code>inout</code> parameters, and runs via <code>call</code>. Reach for it for parameterised maintenance and admin loops &mdash; but keep core transformations in dbt models, where lineage and tests live.</p>",
    "tags": [
      "stored-procedures",
      "sql-scripting",
      "unity-catalog"
    ],
    "src": "https://www.databricks.com/blog/introducing-sql-stored-procedures-databricks"
  },
  {
    "id": "auto-20260612-4",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Type widening: int to bigint without a rewrite",
    "hook": "The column outgrew its type - and you no longer rebuild the table to fix it.",
    "body": "<p>Set <code>delta.enableTypeWidening = true</code> and <code>alter table t alter column c type bigint</code> becomes a metadata-only change &mdash; no data files rewritten. Supported widenings: byte/short/int to bigint, decimal or double; float to double; date to timestamp_ntz; decimal precision growth. With <code>mergeSchema</code>, a wider source type auto-widens the target during MERGE and Auto Loader writes. Two catches: the protocol upgrade locks out readers below DBR 15.4, and several widenings break Iceberg/UniForm compatibility until metadata is regenerated.</p>",
    "tags": [
      "type-widening",
      "delta",
      "schema-evolution"
    ],
    "src": "https://docs.databricks.com/aws/en/delta/type-widening"
  },
  {
    "id": "auto-20260612-5",
    "cat": "Platform",
    "level": "Core",
    "title": "Tableau is building its own semantic layer",
    "hook": "Every vendor now wants to own where revenue is defined - including your BI tool.",
    "body": "<p>Tableau Semantics (inside Tableau Next and Salesforce Data Cloud) defines semantic models &mdash; entities, metrics, relationships &mdash; that ground Tableau Agent's answers, and 2026.1 even auto-generates them from workspaces. The architectural question for an analytics engineer: where do definitions live? Warehouse-side layers (Databricks Metric Views, dbt Semantic Layer) serve every tool from one definition; BI-side semantics risk re-fragmenting metrics per tool &mdash; the very problem semantic layers were meant to kill. OSI interchange is the proposed bridge. Choose deliberately.</p>",
    "tags": [
      "tableau-semantics",
      "semantic-layer",
      "tableau-next"
    ],
    "src": "https://www.tableau.com/blog/what-is-tableau-semantics"
  },
  {
    "id": "auto-20260612-6",
    "cat": "SQL",
    "level": "Advanced",
    "title": "Gaps and islands: number the runs, not the rows",
    "hook": "The same stage entered five times in a row is one journey step, not five.",
    "body": "<p>Real pattern from opportunity stage-history analysis: an opp can re-enter the same stage repeatedly, and the question is the true entry date of each consecutive <em>run</em>. Flag changes with <code>lag()</code>, then a running sum turns flags into group ids:</p><pre><code><span class=\"cm\">-- cte 1: flag run starts</span>\ncase when stage = lag(stage) over (partition by opp_id order by ts)\n  then 0 else 1 end as is_new_run\n<span class=\"cm\">-- cte 2: number the runs</span>\nsum(is_new_run) over (partition by opp_id order by ts) as run_id</code></pre><p>Group by <code>run_id</code> for first-entry dates. Same trick solves sessions, streaks, and downtime windows.</p>",
    "tags": [
      "from-my-work",
      "gaps-and-islands",
      "window-functions",
      "sessionization"
    ],
    "src": "memory/patterns.md 2026-03-03 - opp stage-group dedup (LAG + cumulative SUM)"
  },
  {
    "id": "auto-20260612-7",
    "cat": "DQ",
    "level": "Core",
    "title": "A UTC timestamp can hide local midnight",
    "hook": "Casting to date silently moved every billing cycle boundary to the previous day.",
    "body": "<p>Hard-won reconciling Kafka billing-cycle events against the admin UI: cycle dates arrived as UTC strings ending <code>T14:00:00.000Z</code> &mdash; which <em>is</em> midnight AEST. A naive <code>cast(cycle_end as date)</code> truncates in UTC and lands every boundary on the previous day, so cycles drift into the wrong month. Convert first &mdash; <code>from_utc_timestamp(cycle_end, 'Australia/Sydney')</code> &mdash; then truncate. Any event timestamp ending in a constant offset like 14:00Z is a hidden local midnight; treat it as a tell.</p>",
    "tags": [
      "from-my-work",
      "timezones",
      "utc",
      "date-truncation"
    ],
    "src": "memory/feedback_kafka_aest_utc - Kafka cycle dates are UTC, admin is AEST"
  },
  {
    "id": "auto-20260612-8",
    "cat": "Platform",
    "level": "Core",
    "title": "Salesforce zero-copy: CRM data without the pipeline",
    "hook": "The era of syncing CRM tables into the warehouse is starting to close.",
    "body": "<p>Salesforce Data Cloud and Databricks now share data <em>bi-directionally with zero copy</em>: Data Cloud publishes unified profiles, segments and engagement data into Databricks via Delta Sharing and Iceberg, and federates queries against lakehouse tables in the other direction &mdash; no ETL job, no replica to keep fresh. If your CRM data currently lands through a replication connector (Fivetran-style sync into a raw schema), this is the pattern positioned to replace it: governed live access instead of synced copies.</p>",
    "tags": [
      "zero-copy",
      "delta-sharing",
      "salesforce",
      "data-cloud"
    ],
    "src": "https://www.salesforce.com/blog/salesforce-crm-data-databricks-zero-copy-sharing/"
  },
  {
    "id": "auto-20260612-9",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Streaming tables ingest; materialized views refine",
    "hook": "Same pipeline, two table types, opposite update semantics.",
    "body": "<p>Both are Databricks-managed tables, but the semantics differ. A <strong>streaming table</strong> processes each input row exactly once and appends &mdash; built for bronze ingestion from Kafka or cloud files; if a source row is later updated, the change is not reprocessed. A <strong>materialized view</strong> recomputes its defining query (incrementally where possible), so upstream updates and deletes flow through &mdash; right for silver/gold joins and aggregates. Rule of thumb: ingest with streaming tables, refine with materialized views, and let dashboards read the precomputed MV instead of rescanning.</p>",
    "tags": [
      "streaming-tables",
      "materialized-views",
      "lakeflow",
      "medallion"
    ],
    "src": "https://docs.databricks.com/aws/en/data-engineering/tables-views"
  },
  {
    "id": "auto-20260612-10",
    "cat": "Streaming",
    "level": "Advanced",
    "title": "Zerobus: when the best bus is no bus",
    "hook": "Five-second latency into Delta with no Kafka cluster to babysit.",
    "body": "<p>Zerobus Ingest (GA, part of Lakeflow Connect) is a push API that writes events <em>directly</em> into a Unity Catalog Delta table &mdash; gRPC or REST, SDKs for Python/Java/Go/Rust/TypeScript, latency as low as ~5 seconds, up to 100 MB/sec per connection, serverless scaling by just opening more connections. The architectural shift: when the lakehouse is the stream's <em>only</em> consumer, the Kafka cluster in the middle is pure overhead &mdash; brokers, partitions and offsets you manage for nothing. Keep a real bus only when multiple systems consume the stream.</p>",
    "tags": [
      "zerobus",
      "ingestion",
      "lakeflow-connect",
      "kafka"
    ],
    "src": "https://www.databricks.com/blog/announcing-general-availability-zerobus-ingest-part-lakeflow-connect"
  },
  {
    "id": "auto-20260616-1",
    "cat": "SQL",
    "level": "Advanced",
    "title": "approx_count_distinct for sanity checks, exact for metrics",
    "hook": "Counting distinct shuffles everything; for a sanity check you do not need the precise number.",
    "body": "<p><code>count(distinct col)</code> forces a full shuffle to deduplicate &mdash; on billions of rows that shuffle <em>is</em> the slow part of exploration. <code>approx_count_distinct(col)</code> uses HyperLogLog: 10&ndash;100x faster, ~2% error. Reach for it on grain checks, null-rate profiling and &ldquo;how big is this&rdquo; questions where 2% never changes the decision. Switch back to exact <code>count(distinct)</code> only for the production metric you actually report.</p>",
    "tags": [
      "from-my-work",
      "performance",
      "exploration",
      "hyperloglog"
    ],
    "src": "patterns.md 2026-04-22 - exploration sanity-check rule"
  },
  {
    "id": "auto-20260616-2",
    "cat": "dbt",
    "level": "Advanced",
    "title": "A 'table' upstream stamps every row on each rebuild",
    "hook": "Your incremental model re-scans an upstream's entire history every day, and nothing changed.",
    "body": "<p>A model materialized as <code>table</code> (not <code>incremental</code>) sets <code>__model_updated_ts = current_timestamp()</code> on <em>all</em> rows each rebuild. A downstream checkpoint-incremental model that watermarks on that column then sees every upstream row as new and re-scans the whole table daily. Harmless when the upstream is tiny (&lt;1% of total); expensive when it is large. Fix: checkpoint against a real event timestamp, or make the upstream incremental too.</p>",
    "tags": [
      "from-my-work",
      "incremental",
      "checkpoint",
      "materialization"
    ],
    "src": "datadex int_lead_claimed_unified / patterns.md 2026-03-10"
  },
  {
    "id": "auto-20260616-3",
    "cat": "Streaming",
    "level": "Advanced",
    "title": "AUTO CDC INTO derives SCD2 so you skip the MERGE",
    "hook": "150 lines of MERGE to maintain a slowly-changing dimension, replaced by about seven.",
    "body": "<p>In Lakeflow Spark Declarative Pipelines, <code>auto cdc into</code> (and <code>auto cdc from snapshot</code>) take a CDC feed or raw snapshots and compute SCD type 1 or type 2 for you &mdash; ordering by a sequence column, handling out-of-order events and deletes. You declare the keys, the sequence column and the SCD type; the engine maintains the history. It replaces the older APPLY CHANGES APIs (same syntax, still supported) and the hand-rolled MERGE that used to encode all of that logic.</p>",
    "tags": [
      "cdc",
      "scd",
      "lakeflow",
      "merge"
    ],
    "src": "https://community.databricks.com/t5/technical-blog/from-150-lines-of-merge-into-to-7-lines-of-sql-auto-cdc-comes-to/ba-p/155355"
  },
  {
    "id": "auto-20260616-4",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Variant shredding stores hot fields as typed columns",
    "hook": "A VARIANT column is one binary blob, until shredding pulls the fields you query into Parquet.",
    "body": "<p><code>variant</code> stores semi-structured data as a single binary value &mdash; flexible, but every field read touches the whole blob. Shredding (Spark 4.1) automatically extracts the frequently-queried fields and writes them as separate, typed Parquet columns. The engine then reads just those columns and prunes the rest, so column pruning and predicate pushdown work again and I/O drops sharply, while rare fields stay in the blob. You get JSON flexibility with near-columnar scan speed.</p>",
    "tags": [
      "variant",
      "shredding",
      "parquet",
      "spark-4"
    ],
    "src": "https://www.databricks.com/blog/introducing-apache-sparkr-41"
  },
  {
    "id": "auto-20260616-5",
    "cat": "AI",
    "level": "Core",
    "title": "Your next data consumer is an agent, not a person",
    "hook": "Dashboards assume a human reads them; agents need the meaning written down.",
    "body": "<p>A growing share of queries now come from autonomous agents that must discover and use data with no human to interpret a cryptic column name. Gartner projects 60% of agentic-analytics efforts relying on MCP alone will fail by 2028 for lack of a consistent semantic layer. The emerging skill &mdash; context engineering &mdash; is embedding machine-readable meaning (metrics, grain, constraints, lineage) alongside the data, so an agent uses it correctly instead of guessing.</p>",
    "tags": [
      "agents",
      "context-engineering",
      "semantic-layer",
      "career"
    ],
    "src": "https://atlan.com/know/context-layer-for-ai-agents/"
  },
  {
    "id": "auto-20260617-1",
    "cat": "DQ",
    "level": "Core",
    "title": "Organic rows hide behind a blank string, not a null",
    "hook": "A 'valid' flag and a blank-string filter - miss either and partner job counts quietly inflate.",
    "body": "<p>Real gotcha querying <code>marketplace__jobs_claims_category_geo_account</code>: about 4.6% of partner rows are invalid or test jobs, so always filter <code>valid_indicator = 'valid'</code>. And <code>partnership_type</code> stores a <strong>blank string</strong> (not null) for organic jobs &mdash; isolate true partner rows with <code>partnership_type &lt;&gt; ''</code>, never <code>is not null</code>, which lets every organic row leak through. Two filters, both easy to forget, both silently over-count.</p>",
    "tags": [
      "from-my-work",
      "soft-filter",
      "blank-string",
      "correctness"
    ],
    "src": "patterns.md 2026-04-16 - marketplace jobs_claims valid_indicator + partnership_type"
  },
  {
    "id": "auto-20260617-2",
    "cat": "DQ",
    "level": "Core",
    "title": "Fivetran renames every Salesforce __c field",
    "hook": "The custom field __c you know from SOQL does not exist in Databricks under that name.",
    "body": "<p>Salesforce data replicated into Databricks by Fivetran has every custom field's trailing <code>__c</code> stripped to a single <code>_c</code>, and names lowercased. So <code>Tradie_Engagement_Summary__c</code> in Salesforce is <code>tradie_engagement_summary_c</code> in <code>lakehouse_production.hipages_salesforce</code>, and a query written with the SOQL name errors on an unknown column. Always DESCRIBE the raw replicated table first &mdash; the warehouse column names are not the SOQL field names.</p>",
    "tags": [
      "from-my-work",
      "salesforce",
      "fivetran",
      "column-naming"
    ],
    "src": "patterns.md 2026-04-02 - Fivetran strips __c to _c on SF custom fields"
  },
  {
    "id": "auto-20260617-3",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Photon does not crash on unsupported ops - it falls back",
    "hook": "Hit an operation Photon cannot run and it quietly hands that part back to Spark.",
    "body": "<p>Photon is Databricks' vectorized C++ engine: Catalyst still plans the query, but Photon executes supported operators in columnar batches instead of the JVM's row-by-row path. The catch &mdash; an unsupported operation does not error, it transparently falls back to Spark for that part. Correct results, but you silently lose the speedup. Check the query profile for the percentage of task time spent in Photon, and the plan DAG colours Photon operators distinctly from the Spark ones.</p>",
    "tags": [
      "photon",
      "vectorized",
      "query-plan"
    ],
    "src": "https://docs.databricks.com/aws/en/compute/photon"
  },
  {
    "id": "auto-20260617-4",
    "cat": "SQL",
    "level": "Advanced",
    "title": "The default window frame is RANGE, and it bites running sums",
    "hook": "Add an order by to your running total and tied rows suddenly share one inflated number.",
    "body": "<p>A running total written as <code>sum(x) over (order by dt)</code> with no explicit frame defaults to <code>range between unbounded preceding and current row</code>. range groups <em>peer</em> rows sharing the same ordered value, so two rows on the same date both get the cumulative total <em>through</em> that date &mdash; not a true row-by-row sum. Always state the frame; rows also skips the slower range spool.</p><pre><code>sum(x) over (order by dt\n  rows between unbounded preceding and current row)</code></pre>",
    "tags": [
      "window-functions",
      "frame",
      "rows-vs-range",
      "running-total"
    ],
    "src": "https://sqlpad.io/tutorial/sql-window-frames-explained-rows-vs-range-running-totals-and-the-default-that-changes-your-results/"
  },
  {
    "id": "auto-20260617-5",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Shallow clone: a prod-sized test table for almost nothing",
    "hook": "Copy the metadata, not the files - then mind the VACUUM.",
    "body": "<p>A shallow clone duplicates only a table's metadata, not its data files &mdash; near-instant and near-free, ideal for testing a migration or refactor against prod-scale data. dbt's <code>dbt clone</code> command uses it to stand up a CI environment without re-running models. The catch: the clone points at the source's files, so a <code>vacuum</code> on the source deletes files the clone still needs and breaks it. Treat shallow clones as short-lived.</p><pre><code>create table dev.dim_account\n  shallow clone prod.dim_account;</code></pre>",
    "tags": [
      "shallow-clone",
      "zero-copy",
      "dbt-clone",
      "delta"
    ],
    "src": "https://docs.databricks.com/aws/en/delta/clone"
  },
  {
    "id": "auto-20260618-1",
    "cat": "Modeling",
    "level": "Advanced",
    "title": "Latest-row snapshots erase past trends",
    "hook": "Filtering to the current state per entity makes closed records vanish from every prior month.",
    "body": "<p>Real bug from PRO opportunity touch-point analysis. A &ldquo;current state per opp&rdquo; view keeps only the latest row per opportunity and filters to in-progress &mdash; perfect for a <em>today</em> snapshot, fatal for a monthly trend, because an opp that closed in March no longer appears in March's count. For a time series, query <em>all</em> stage transitions, roll up compliance per entity <em>within</em> each period, then group by month. Snapshot logic answers &ldquo;now&rdquo;; trend logic must reconstruct each period's population.</p>",
    "tags": [
      "from-my-work",
      "snapshot",
      "trends",
      "point-in-time"
    ],
    "src": "patterns.md 2026-03-03 - PRO opp touch-point snapshot vs trend"
  },
  {
    "id": "auto-20260618-2",
    "cat": "DQ",
    "level": "Core",
    "title": "A picklist field can be a free-text dump",
    "hook": "The column is named like a category, but only a fifth of rows hold a valid value.",
    "body": "<p>Real gotcha: Salesforce <code>Business_Structure__c</code> looks like a structured picklist, but reps treated it as a notes field &mdash; suburbs, job descriptions, random text. Only ~87K of 467K rows (about 19%) held one of the five valid values. Before using any categorical field as a dimension or filter, profile it: <code>count(distinct)</code>, top values by frequency, and the share matching the expected set. A low validity rate means clean or exclude it &mdash; never group by it raw.</p>",
    "tags": [
      "from-my-work",
      "profiling",
      "categorical",
      "salesforce"
    ],
    "src": "patterns.md 2026-03-09 - SF Business_Structure__c free-text notes dump"
  },
  {
    "id": "auto-20260618-3",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Delta catalog-managed tables",
    "hook": "The catalog, not the _delta_log files, is now the authority on who can commit.",
    "body": "<p>Delta 4.x <strong>catalog-managed tables</strong> (preview) move commit authority from the filesystem to the catalog (e.g. Unity Catalog). Clients reference tables by name, not path; the catalog resolves storage and brokers concurrency. Writers stop doing filesystem put-if-absent atomic writes &mdash; they stage commits under <code>_delta_log/_staged_commits</code> and ask the catalog to ratify them. This closes the governance gap where path-based writes bypassed controls, and unlocks multi-engine and multi-table transactions. The practical cost: hardcoded path-based writes break.</p>",
    "tags": [
      "delta",
      "catalog-managed",
      "unity-catalog",
      "governance"
    ],
    "src": "https://delta.io/blog/2026-02-02-delta-catalog-managed-tables/"
  },
  {
    "id": "auto-20260618-4",
    "cat": "dbt",
    "level": "Core",
    "title": "lag_tolerance skips fresh-enough models",
    "hook": "Stop rebuilding the whole DAG on every schedule - let dbt skip models whose data has not changed.",
    "body": "<p>dbt's state-aware orchestration (Fusion) skips a model when neither its SQL (ignoring whitespace/comments) nor any upstream source data has changed, reusing builds across jobs via shared model-level state. The newer <code>lag_tolerance</code> config improves on <code>build_after</code>: it compares against the <em>freshness of the underlying data</em>, not the model's last run. Example: skip rebuilding <code>dim_wizards</code> if it was refreshed within the last 4 hours, even when the job fires more often. Direct warehouse-cost and runtime savings versus full-DAG reruns.</p>",
    "tags": [
      "state-aware",
      "lag-tolerance",
      "fusion",
      "orchestration"
    ],
    "src": "https://docs.getdbt.com/docs/deploy/state-aware-about"
  },
  {
    "id": "auto-20260618-5",
    "cat": "AI",
    "level": "Core",
    "title": "Genie Agent mode runs a research loop",
    "hook": "Genie can now plan, run many queries, and iterate - not just translate one question to one SQL.",
    "body": "<p>Databricks Genie <strong>Agent mode</strong> (Research Agent) adds multi-step reasoning on top of single-shot text-to-SQL. For a &ldquo;why did revenue spike?&rdquo; question it drafts a research plan with hypotheses, runs multiple queries against Unity Catalog, learns from each result, and iterates until confident &mdash; returning a report with citations, charts and supporting tables (exportable to PDF). Standard mode stays faster for simple lookups. Constraint: Agent mode is UI-only, no API. Note: from 6 July 2026 Genie moves to pay-as-you-go pricing beyond a free monthly allowance.</p>",
    "tags": [
      "genie",
      "agent-mode",
      "research-agent",
      "databricks"
    ],
    "src": "https://docs.databricks.com/aws/en/genie/agent-mode"
  },
  {
    "id": "auto-20260619-1",
    "cat": "DQ",
    "level": "Core",
    "title": "A 404 from the source API can be a real state",
    "hook": "The endpoint returned 404 for hundreds of accounts - and that was the answer, not an error.",
    "body": "<p>Reconciling Databricks credit-expiry against the shed admin API, the per-account usage endpoint returned <code>404 ActiveSubscriptionNotFound</code> for many tradies. That is not a failure to retry &mdash; it is the API encoding a legitimate state: the account has no active subscription (cancelled or expired). The rows still exist, and Kafka (<code>stg_accounts_balance_updated__events</code>) still holds their data. Lesson: before treating a source error as missing data, check whether it means a real state, and reconcile against the canonical full-population source, not the API that hides inactive rows.</p>",
    "tags": [
      "from-my-work",
      "reconciliation",
      "source-of-truth",
      "api"
    ],
    "src": "patterns.md 2026-05-14 - shed usage API 404 = cancelled account; use Kafka for full population"
  },
  {
    "id": "auto-20260619-2",
    "cat": "DQ",
    "level": "Core",
    "title": "A column can die; profile nulls by time, not overall",
    "hook": "A field fully populated for years went 100% null after a system change - and one null check would never catch it.",
    "body": "<p>Profiling Salesforce lead features, <code>Telephone_Status__c</code> looked usable in aggregate but was 100% null for every 2024-and-later lead &mdash; a field the business simply stopped writing. A single null-rate check across all history hides this, because old populated rows dilute the recent gap. Profile key columns segmented by month or load date, not once over everything. A column that died on a date is invisible to one count of nulls, and feeding it into a model or feature set silently poisons exactly the recent rows you care about.</p>",
    "tags": [
      "from-my-work",
      "profiling",
      "null-rate",
      "salesforce"
    ],
    "src": "patterns.md 2026-03-09 - SF Telephone_Status__c 100% null for 2024+ leads"
  },
  {
    "id": "auto-20260619-3",
    "cat": "Platform",
    "level": "Core",
    "title": "Reverse ETL: the warehouse drives the SaaS tools",
    "hook": "The same dbt model that feeds a dashboard can now write straight into Salesforce.",
    "body": "<p>Reverse ETL syncs modeled warehouse tables back out to operational SaaS &mdash; CRM, ad networks, marketing, customer success &mdash; so a governed mart populates a Salesforce field, not just a chart. Hightouch and Census lead in 2026; Census coined &ldquo;operational analytics&rdquo; for the pattern, and Gartner reports warehouse-native activation jumped from a priority for 38% of teams to 72%. The analytics-engineer angle: your model gains a higher-stakes consumer &mdash; a wrong value lands directly in a rep's CRM, so grain and dedup correctness matter even more than on a dashboard.</p>",
    "tags": [
      "reverse-etl",
      "operational-analytics",
      "hightouch",
      "census"
    ],
    "src": "https://hightouch.com/blog/reverse-etl"
  },
  {
    "id": "auto-20260619-4",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Iceberg partition evolution changes layout, no rewrite",
    "hook": "Repartition a billion-row table by editing metadata, not rewriting a single old file.",
    "body": "<p>Iceberg <strong>hidden partitioning</strong> stores the partition transform (say <code>day(ts)</code>) in metadata, so queries filter on the raw column and the engine derives the partition &mdash; no exposed partition column to get wrong, no <code>where dt = ...</code> boilerplate. <strong>Partition evolution</strong> then changes the scheme as a metadata-only operation: new data uses the new layout, old files keep theirs, and the engine reconciles both at read time. Contrast Delta Liquid Clustering, which replaces partitioning with adaptive background re-clustering (ongoing compute) rather than evolving a declared scheme.</p>",
    "tags": [
      "iceberg",
      "partition-evolution",
      "hidden-partitioning",
      "liquid-clustering"
    ],
    "src": "https://www.dremio.com/blog/future-proof-partitioning-and-fewer-table-rewrites-with-apache-iceberg/"
  },
  {
    "id": "auto-20260619-5",
    "cat": "Platform",
    "level": "Core",
    "title": "dlt: code-first Python ingestion that self-maintains",
    "hook": "Write a Python function that yields rows; schema evolution and incremental load come free.",
    "body": "<p>dlt (data load tool, by dltHub) is an open-source Python library for ingestion: you write an ordinary function that yields records and dlt handles schema inference, schema evolution, incremental loading, normalization, merges and retries implicitly. It runs anywhere Python runs &mdash; Airflow, a serverless function, a notebook &mdash; with no backend service, unlike managed Fivetran or Airbyte, which is why it fits custom and long-tail sources those connectors do not cover. By early 2026 the community passed 81k pipelines, and roughly 91% of new ones are now authored by AI agents driving the library.</p>",
    "tags": [
      "dlt",
      "ingestion",
      "python",
      "schema-evolution"
    ],
    "src": "https://dlthub.com/docs/intro"
  },
  {
    "id": "auto-20260619-6",
    "cat": "DQ",
    "level": "Advanced",
    "title": "OpenLineage turns 'what breaks?' into a query",
    "hook": "Know which dashboard a column rename will break before you ship the rename.",
    "body": "<p>OpenLineage is an open standard that instruments jobs (Spark, dbt, Airflow) to emit run / job / dataset lineage as they run &mdash; including <strong>column-level</strong> lineage via a facet recording each output column's input columns and the transform type (direct derivation vs indirect influence, plus masking). The payoff is self-service impact analysis: a governance platform reading the lineage can auto-notify every downstream owner when an upstream schema changes. &ldquo;Who depends on this column?&rdquo; stops being a code-grep-and-ask-around and becomes a catalog query you run before the change.</p>",
    "tags": [
      "openlineage",
      "column-lineage",
      "impact-analysis",
      "lineage"
    ],
    "src": "https://openlineage.io/docs/spec/facets/dataset-facets/column_lineage_facet/"
  },
  {
    "id": "auto-20260622-1",
    "cat": "DQ",
    "level": "Core",
    "title": "Soft-delete is not the only validity flag",
    "hook": "You filtered __is_deleted - and 4.6% test and junk jobs still padded the count.",
    "body": "<p>Real gotcha from the marketplace jobs model: <code>marketplace__jobs_claims_category_geo_account</code> carries a <code>valid_indicator</code> column, and about 4.6% of partner rows are flagged <code>'invalid'</code> &mdash; test and junk jobs that <code>__is_deleted</code> never touches. Soft-delete and business-validity are <em>different dimensions</em>. Before aggregating any domain fact, ask what validity flags exist beyond the soft-delete one &mdash; <code>valid_indicator</code>, <code>status</code>, <code>is_test</code> &mdash; and filter them:</p><pre><code><span class=\"kw\">where</span> valid_indicator = <span class=\"st\">'valid'</span></code></pre>",
    "tags": [
      "from-my-work",
      "validity-flag",
      "filters",
      "soft-delete"
    ],
    "src": "memory/patterns.md 2026-04-16 - marketplace jobs valid_indicator filter"
  },
  {
    "id": "auto-20260622-2",
    "cat": "dbt",
    "level": "Advanced",
    "title": "Self-healing incremental: retry the rows that were not ready",
    "hook": "A claim arrived before its job assignment, so the join key was null - and the next run heals it.",
    "body": "<p>Real pattern from <code>int_lead_claimed_unified</code>: ~58 claims land from domain events <em>before</em> the matching <code>job_assignment_id</code> exists, so the LEFT JOIN leaves the key null. Instead of dropping or erroring, the incremental design re-selects those still-unresolved rows on every run; once the assignment arrives, the key fills in. The rule for any incremental that joins two async streams: keep first-miss rows in the next batch's candidate set so late arrivals self-heal &mdash; never treat the first null as final.</p>",
    "tags": [
      "from-my-work",
      "incremental",
      "late-arriving",
      "dbt"
    ],
    "src": "memory/patterns.md 2026-03-10 - int_lead_claimed_unified self-healing null job_assignment_id"
  },
  {
    "id": "auto-20260622-3",
    "cat": "Platform",
    "level": "Advanced",
    "title": "DuckLake puts the catalog in a SQL database",
    "hook": "Iceberg scatters metadata across JSON and Avro files; DuckLake keeps it in one SQL table.",
    "body": "<p>DuckLake (1.0, April 2026) keeps the data as Parquet in object storage but stores <em>all</em> table metadata &mdash; snapshots, schema, statistics, deletion vectors &mdash; in a SQL database instead of a tree of manifest files. A new snapshot is just a transactional insert, so thousands of tiny changes do not spawn the metadata-file storms that plague Iceberg and Delta. <strong>Data inlining</strong> writes small inserts straight into the catalog DB and flushes to Parquet later. Clients exist for Spark, Trino and DataFusion.</p>",
    "tags": [
      "ducklake",
      "lakehouse",
      "catalog",
      "metadata"
    ],
    "src": "https://ducklake.select/2026/04/13/ducklake-10/"
  },
  {
    "id": "auto-20260622-4",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Declarative pipelines are now in open-source Spark",
    "hook": "Databricks donated DLT's core to Apache Spark - declare the datasets, not the execution order.",
    "body": "<p>Spark Declarative Pipelines (Apache Spark 4.1, via the <code>pyspark.pipelines</code> module) brings the Delta-Live-Tables model into vendor-neutral open source &mdash; Databricks donated the DLT core at the 2025 Data+AI Summit. You declare datasets (streaming tables, materialized views) and their queries; the engine infers the dependency graph, runs them in order, and handles incremental refresh and retries with no hand-wired task DAG. Databricks' Lakeflow Spark Declarative Pipelines is the managed superset. The win: pipeline logic stops being locked to one vendor's runtime.</p>",
    "tags": [
      "spark",
      "declarative-pipelines",
      "lakeflow",
      "open-source"
    ],
    "src": "https://www.waitingforcode.com/apache-spark-structured-streaming/spark-declarative-pipelines-101/read"
  },
  {
    "id": "auto-20260622-5",
    "cat": "Platform",
    "level": "Core",
    "title": "Lakebase: OLTP Postgres inside the lakehouse",
    "hook": "The app database and the warehouse stop being two systems with a pipeline between them.",
    "body": "<p>Lakebase (GA February 2026) is managed serverless Postgres fused into Databricks and governed by Unity Catalog. Its <strong>LTAP</strong> architecture (Lake Transactional/Analytical Processing) aims to run transactional and analytical workloads on one copy of data &mdash; no reverse-ETL or read replica to keep the app and the warehouse in sync &mdash; and adds instant database branching and point-in-time recovery. For an analytics engineer it means the operational source and the lakehouse converge, shrinking the ingestion gap reverse ETL was invented to bridge.</p>",
    "tags": [
      "lakebase",
      "ltap",
      "oltp",
      "unity-catalog"
    ],
    "src": "https://www.databricks.com/product/lakebase"
  },
  {
    "id": "auto-20260623-1",
    "cat": "dbt",
    "level": "Advanced",
    "title": "A null column silently collides surrogate keys",
    "hook": "Two different rows, both null in one input, hash to the exact same key.",
    "body": "<p><code>dbt_utils.generate_surrogate_key</code> coalesces every null input to the literal string 'null' before hashing. So if you build a key from a <strong>nullable</strong> attribute, two distinct rows that are both null there produce an identical key &mdash; collapsing grain or creating phantom duplicates that no schema check catches. Rule: build keys from columns that are always unique per row, never optional ones. Verify after every build:</p><pre><code>select count(*), count(distinct sk) from {{ this }}; <span class=\"cm\">-- must match</span></code></pre>",
    "tags": [
      "from-my-work",
      "surrogate-key",
      "null",
      "grain"
    ],
    "src": "memory/platform-constraints.md - generate_surrogate_key nullable-column collision"
  },
  {
    "id": "auto-20260623-2",
    "cat": "SQL",
    "level": "Advanced",
    "title": "lead()'s third argument closes the open interval",
    "hook": "The newest row of every entity ends in null - decide what 'still current' means.",
    "body": "<p>Building validity windows (scd2, billing cycles) with <code>lead(start_dt) over (partition by id order by start_dt)</code> leaves the latest row's end date <strong>null</strong> &mdash; the open interval. An implicit null silently shrinks 'as of today' durations and drops current rows from <code>between</code> filters and overlap joins. Pass a default so 'open' is explicit:</p><pre><code>lead(start_dt, 1, current_timestamp())\n  over (partition by id order by start_dt) as end_dt</code></pre>",
    "tags": [
      "from-my-work",
      "window",
      "lead",
      "scd2"
    ],
    "src": "memory/patterns.md 2026-03-03 - lead default current_timestamp implicit as-of-today"
  },
  {
    "id": "auto-20260623-3",
    "cat": "Platform",
    "level": "Core",
    "title": "Lakehouse//RT: millisecond serving, no second database",
    "hook": "The speed layer agents need, without copying data into a separate store.",
    "body": "<p>Lakehouse//RT (Databricks, June 2026), powered by the new <strong>Reyden</strong> engine, serves high-concurrency, low-latency queries directly on governed Delta and Iceberg tables &mdash; benchmarked at sub-100ms over 12,000 queries/sec, as low as 10ms on small datasets. Unlike streaming ingestion latency, this is the <em>query-serving</em> layer: no separate real-time database, no CDC pipeline, no second copy to govern. It closes the gap that forced teams to bolt a dedicated serving store onto the lakehouse for dashboards and agent lookups.</p>",
    "tags": [
      "lakehouse-rt",
      "reyden",
      "real-time",
      "serving"
    ],
    "src": "https://www.databricks.com/company/newsroom/press-releases/databricks-launches-lakehousert-bring-real-time-analytics-directly"
  },
  {
    "id": "auto-20260623-4",
    "cat": "dbt",
    "level": "Advanced",
    "title": "The new dbt semantic layer lives inside model YAML",
    "hook": "No more standalone semantic_models files drifting from the models they describe.",
    "body": "<p>dbt's 2026 semantic-layer spec embeds the semantic model <strong>alongside each model's YAML entry</strong> instead of in separate files, promotes frequently-used options to top-level keys, and collapses 'measures' into plain metrics. Definitions sit next to the columns they describe, so they stop drifting out of sync. Paired with the dbt MCP server (now OAuth, so Claude or ChatGPT query governed metrics with your dbt login &mdash; no token hand-off), one metric definition serves BI, SQL, and AI agents alike.</p>",
    "tags": [
      "semantic-layer",
      "metricflow",
      "mcp",
      "yaml"
    ],
    "src": "https://www.getdbt.com/blog/what-s-shipped-in-dbt-may-2026"
  },
  {
    "id": "auto-20260623-5",
    "cat": "Role",
    "level": "Senior",
    "title": "Your new deliverable: machine-readable context",
    "hook": "The metric defs and lineage you write are now the agent's reasoning substrate.",
    "body": "<p>dbt Labs' 2026 framing of the analytics engineer: the durable work is being the <strong>AI context provider</strong>. Agents reason reliably only from what you structure for them &mdash; metric definitions, column-level lineage, model docs, schema contracts. 'Semantic precision' &mdash; a definition unambiguous to both a human and a model &mdash; becomes a real skill and a shipped artifact. Competing with AI on raw code production shrinks the role; owning the context that makes every agent correct expands it.</p>",
    "tags": [
      "career",
      "ai-context",
      "semantic-precision",
      "governance"
    ],
    "src": "https://www.getdbt.com/blog/the-analytics-engineer-in-2026-system-designer-governance-owner-ai-context-provider"
  },
  {
    "id": "auto-20260624-1",
    "cat": "DQ",
    "level": "Senior",
    "title": "Two money columns, two different units",
    "hook": "Summing dollars and credits inflated revenue 100x before anyone noticed.",
    "body": "<p>Two columns that both look like money are not the same money. In the PAM flat table, Silver <code>stg_hip_value_products.value</code> is in <strong>dollars</strong>, but the Kafka <code>balance_total_credits</code> field is in <strong>credits</strong> &mdash; and 100 credits = $1. Comparing or summing them across the two sources inflated paid revenue 100x. Before any arithmetic that spans systems, confirm the unit of every money-like column and convert explicitly: <code>credits / 100.0 as dollars</code>.</p>",
    "tags": [
      "from-my-work",
      "units",
      "credits",
      "correctness"
    ],
    "src": "PAM flat-table migration: Silver value=dollars vs Kafka balance_total_credits=credits (100 credits = $1)"
  },
  {
    "id": "auto-20260624-2",
    "cat": "SQL",
    "level": "Senior",
    "title": "Cycle dedup needs overlap, not a shared start date",
    "hook": "An old cycle that starts earlier but covers the same period slips straight through.",
    "body": "<p>Deduping overlapping billing cycles by matching the same <code>cycle_start</code> is too narrow: an old-subscription cycle that <em>starts earlier</em> but still covers the same period never matches, survives, and double-counts. The correct test is range <strong>intersection</strong>, not equal start dates:</p><pre><code><span class=\"kw\">on</span> old.cycle_start &lt; cur.cycle_end\n  <span class=\"kw\">and</span> old.cycle_end &gt; cur.cycle_start</code></pre><p>Two ranges overlap iff each starts before the other ends. Equality only catches the aligned case and leaks the rest.</p>",
    "tags": [
      "from-my-work",
      "dedup",
      "date-range",
      "overlap"
    ],
    "src": "PAM account_cycles dedup: use date-range overlap, not matching cycle_start"
  },
  {
    "id": "auto-20260624-3",
    "cat": "Platform",
    "level": "Core",
    "title": "Asset Bundles are now Declarative Automation Bundles",
    "hook": "Same YAML-as-infrastructure idea, a new name, and a deeper engine swap.",
    "body": "<p>Databricks Asset Bundles &mdash; the IaC way to ship jobs, pipelines and dashboards as version-controlled YAML alongside your code &mdash; were renamed <strong>Declarative Automation Bundles</strong> in 2026. The bigger change is underneath: the Terraform deployment engine is being deprecated, and the new <strong>Direct Deployment Engine</strong> becomes the sole supported path in 2026 &mdash; faster plans, no local Terraform state to manage. If you scripted bundles around <code>.terraform</code> state files, that assumption breaks; redeploy on the direct engine.</p>",
    "tags": [
      "bundles",
      "iac",
      "ci-cd",
      "direct-deployment-engine"
    ],
    "src": "https://docs.databricks.com/aws/en/dev-tools/bundles/"
  },
  {
    "id": "auto-20260624-4",
    "cat": "Streaming",
    "level": "Senior",
    "title": "transformWithState replaces flatMapGroupsWithState",
    "hook": "Spark 4.0's v2 stateful operator: composite state, TTL, and timers built in.",
    "body": "<p>Spark 4.0 ships <code>transformWithState</code>, the v2 arbitrary-stateful operator replacing <code>flatMapGroupsWithState</code> / <code>mapGroupsWithState</code> (Scala) and <code>applyInPandasWithState</code> (Python). You define a stateful processor object holding composite state &mdash; <code>ValueState</code>, <code>ListState</code>, <code>MapState</code> &mdash; with per-key TTL eviction and named timers, instead of hand-rolling one opaque state blob. It is the right tool for session windows, dedup-with-expiry, and custom event-time logic. Databricks recommends it over the legacy operators for all new streaming state.</p>",
    "tags": [
      "transformwithstate",
      "structured-streaming",
      "spark-4",
      "stateful"
    ],
    "src": "https://spark.apache.org/docs/4.0.0/streaming/structured-streaming-transform-with-state.html"
  },
  {
    "id": "auto-20260624-5",
    "cat": "SQL",
    "level": "Advanced",
    "title": "Higher-order functions reshape arrays without exploding",
    "hook": "Skip the explode-aggregate-collect_list shuffle; work on the array in place.",
    "body": "<p>To reshape an array column the reflex is <code>explode</code> &rarr; aggregate &rarr; <code>collect_list</code> &mdash; a shuffle plus a fan-out risk. Higher-order functions operate on the array in place: <code>transform</code> maps each element, <code>filter</code> keeps some, <code>aggregate</code> folds to a scalar, <code>exists</code> tests a predicate.</p><pre><code><span class=\"kw\">select</span> transform(prices, p -&gt; p * 1.1) <span class=\"kw\">as</span> marked_up,\n  aggregate(prices, 0, (acc, p) -&gt; acc + p) <span class=\"kw\">as</span> total\n<span class=\"kw\">from</span> orders</code></pre><p>No explode, no regroup &mdash; the grain stays one row per order.</p>",
    "tags": [
      "higher-order-functions",
      "arrays",
      "transform",
      "spark-sql"
    ],
    "src": "https://docs.databricks.com/aws/en/sql/language-manual/functions/transform"
  },
  {
    "id": "auto-20260626-1",
    "cat": "SQL",
    "level": "Advanced",
    "title": "collect_list compresses a history into one journey string",
    "hook": "Turn an opp's stage history into in-out-in-in and read the path at a glance.",
    "body": "<p>To analyse how entities <em>move</em> through stages, flatten the ordered event rows into a single string per entity. An order-preserving window <code>collect_list</code> builds the path; <code>concat_ws</code> joins it:</p><pre><code><span class=\"kw\">with</span> seq <span class=\"kw\">as</span> (\n  <span class=\"kw\">select</span> opp_id,\n    collect_list(stage) <span class=\"kw\">over</span> (\n      <span class=\"kw\">partition by</span> opp_id <span class=\"kw\">order by</span> ts\n      <span class=\"kw\">rows between unbounded preceding</span>\n        <span class=\"kw\">and unbounded following</span>) <span class=\"kw\">as</span> path\n  <span class=\"kw\">from</span> stage_transitions)\n<span class=\"kw\">select</span> opp_id, concat_ws(<span class=\"st\">'-'</span>, any_value(path)) <span class=\"kw\">as</span> journey\n<span class=\"kw\">from</span> seq <span class=\"kw\">group by</span> opp_id</code></pre><p>Now group by <code>journey</code> to rank common paths. Use an explicit <code>rows</code> frame &mdash; plain <code>collect_list</code> order isn't guaranteed in Spark.</p>",
    "tags": [
      "from-my-work",
      "collect-list",
      "sequence",
      "window"
    ],
    "src": "memory/patterns.md 2026-03-06 - opp journey sequence (collect_list + concat_ws)"
  },
  {
    "id": "auto-20260626-2",
    "cat": "dbt",
    "level": "Senior",
    "title": "One checkpoint per upstream, stored in the model itself",
    "hook": "A single max(updated_at) is wrong when an incremental unions five sources.",
    "body": "<p>When an incremental model pulls from several event tables, one global watermark mis-fires: a lagging source forces a re-scan of all, or a fast one skips late rows from a slow one. The datadex pattern stores a <em>map</em> of per-source checkpoints inside the built table, then reads each back next run to resume every source independently.</p><pre><code><span class=\"cm\">-- inject: persist a watermark per upstream</span>\nmap(<span class=\"st\">'src_a'</span>, (<span class=\"kw\">select max</span>(__dl_updated) <span class=\"kw\">from</span> src_a),\n    <span class=\"st\">'src_b'</span>, (<span class=\"kw\">select max</span>(__dl_updated) <span class=\"kw\">from</span> src_b)) <span class=\"kw\">as</span> __evt_checkpoint\n<span class=\"cm\">-- extract: read each source's own max back from {{ this }}</span></code></pre><p>Alias every CTE's timestamp to one name so the macros stay generic.</p>",
    "tags": [
      "from-my-work",
      "incremental",
      "checkpoint",
      "dbt-macros"
    ],
    "src": "datadex macros/events_table_incrementation.sql - inject/extract_events_table_checkpoint"
  },
  {
    "id": "auto-20260626-3",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Iceberg v3 row lineage is CDC without Debezium",
    "hook": "Every row now carries an id and the sequence number that last touched it.",
    "body": "<p>Apache Iceberg v3 (GA on Databricks Runtime 18.0+ and Snowflake from May 2026) makes row lineage mandatory: the engine maintains <code>_row_id</code> and <code>_last_updated_sequence_number</code> on every row automatically. That lets you derive change-data-capture &mdash; what was inserted or updated since snapshot N &mdash; natively from the table, no external CDC connector. v3 also brings deletion vectors (up to 10x faster DML) and a native VARIANT type. The lesson: pick a runtime/catalog that actually exposes v3, not just reads it.</p>",
    "tags": [
      "iceberg-v3",
      "row-lineage",
      "cdc",
      "table-format"
    ],
    "src": "https://www.databricks.com/blog/next-era-open-lakehouse-apache-icebergtm-v3-public-preview-databricks"
  },
  {
    "id": "auto-20260626-4",
    "cat": "Career",
    "level": "Core",
    "title": "The stack is consolidating: Fivetran absorbed dbt Labs",
    "hook": "Best-of-breed is giving way to bundled platforms in 2026.",
    "body": "<p>Fivetran completed its dbt Labs merger on 1 June 2026 (~$10B valuation, 100k+ data teams). It is the 2026 theme: Microsoft Fabric, Databricks Lakeflow and Snowflake native ingestion all now bundle ingest plus transform, and the best-of-breed-per-layer era is fading. For your pivot the merger <em>validates</em> dbt as the industry standard, but expect fewer vendor choices and rising bills (some teams saw 4&ndash;8x price jumps). Bet on transferable craft &mdash; SQL and modeling &mdash; over loyalty to any single tool.</p>",
    "tags": [
      "career",
      "consolidation",
      "dbt",
      "industry"
    ],
    "src": "https://www.getdbt.com/blog/dbt-labs-and-fivetran-merge-announcement"
  },
  {
    "id": "auto-20260626-5",
    "cat": "SQL",
    "level": "Core",
    "title": "Pipe syntax: read a query top to bottom",
    "hook": "Spark 4 chains steps with |&gt; instead of inside-out subqueries.",
    "body": "<p>Spark 4.0's pipe syntax chains operations in execution order, so a query reads like a pipeline instead of an inside-out <code>select ... from (select ...)</code>. Each <code>|&gt;</code> takes the previous result and applies one step:</p><pre><code><span class=\"kw\">from</span> jobs\n|&gt; <span class=\"kw\">where</span> status = <span class=\"st\">'won'</span>\n|&gt; aggregate count(*) <span class=\"kw\">as</span> c <span class=\"kw\">group by</span> category\n|&gt; <span class=\"kw\">order by</span> c <span class=\"kw\">desc</span></code></pre><p>Same optimizer, same plan &mdash; a pure readability win. For debugging, comment out the last pipe to inspect the intermediate result. Ideal for ad-hoc exploration where the logic grows step by step.</p>",
    "tags": [
      "pipe-syntax",
      "spark-4",
      "readability"
    ],
    "src": "https://www.databricks.com/blog/introducing-apache-spark-40"
  },
  {
    "id": "auto-20260629-1",
    "cat": "DQ",
    "level": "Advanced",
    "title": "Two free-text taxonomies never equi-join cleanly",
    "hook": "Joining SF lead categories to marketplace categories matched only 61% of rows.",
    "body": "<p>Real trap from the lead-scoring build: <code>category_c</code> in Salesforce and the marketplace category are both hand-typed taxonomies, so <code>'Air Con'</code> vs <code>'Air Conditioning'</code> and <code>'Plumber'</code> vs <code>'Plumbers'</code> meant a direct equi-join silently dropped ~39% of rows. A 100% join rate on two free-text fields should make you suspicious, not relieved. The fix is two-stage: normalise first (strip the legacy numbered prefix with <code>regexp_replace(category_c, '^[0-9]+ - ', '')</code>, lowercase, trim), then fuzzy-match the residue (levenshtein, soundex, or a curated mapping table) instead of trusting equality.</p>",
    "tags": [
      "from-my-work",
      "fuzzy-join",
      "free-text",
      "data-quality"
    ],
    "src": "memory/patterns.md 2026-03-09 - SF lead Category__c vs marketplace category 61% match"
  },
  {
    "id": "auto-20260629-2",
    "cat": "SQL",
    "level": "Advanced",
    "title": "Escaped quotes break Spark SQL regex",
    "hook": "A backslash-quote inside a regexp_replace silently corrupted the pattern.",
    "body": "<p>Hit while cleaning SF free-text in Python-built Spark SQL: putting an escaped single quote inside a character class (<code>[A-Za-z &/\\']</code>) breaks the regex &mdash; the shell/Python escaping mangles the <code>\\'</code> before Spark ever parses it, so the pattern matches the wrong thing without erroring. The rule: keep quote characters out of regex literals entirely. Build the character class from unquoted ranges only:</p><pre><code>regexp_replace(name, <span class=\"st\">'[^A-Za-z &/-]'</span>, <span class=\"st\">''</span>)</code></pre><p>If you genuinely need to match a quote, match it via its code point or a separate branch &mdash; never inline the escaped character.</p>",
    "tags": [
      "from-my-work",
      "regex",
      "spark-sql",
      "data-cleaning"
    ],
    "src": "memory/patterns.md 2026-03-09 - escaped quotes break Spark regex, use character classes"
  },
  {
    "id": "auto-20260629-3",
    "cat": "SQL",
    "level": "Advanced",
    "title": "Point-in-time joins: there is no ASOF JOIN in SQL",
    "hook": "Match each event to the value that was current at that instant - without a keyword for it.",
    "body": "<p>A point-in-time (as-of) join answers what was the price/plan/balance <em>at the moment of this event</em> &mdash; the closest dimension row at or before the event time. PySpark has <code>merge_asof</code>, but Spark and Databricks SQL still ship no <code>asof join</code> keyword. The portable pattern is an inequality join plus <code>qualify</code>:</p><pre><code><span class=\"kw\">select</span> e.*, d.price\n<span class=\"kw\">from</span> events e\n<span class=\"kw\">join</span> prices d\n  <span class=\"kw\">on</span> d.symbol = e.symbol\n  <span class=\"kw\">and</span> d.ts &lt;= e.ts\n<span class=\"kw\">qualify</span> row_number() <span class=\"kw\">over</span> (\n  <span class=\"kw\">partition by</span> e.event_id <span class=\"kw\">order by</span> d.ts <span class=\"kw\">desc</span>) = <span class=\"num\">1</span></code></pre><p>The <code>&lt;=</code> picks all prior rows; <code>row_number()=1</code> keeps the latest. Index/cluster on the time key &mdash; the inequality join can fan out hard before the dedupe.</p>",
    "tags": [
      "point-in-time",
      "asof-join",
      "qualify",
      "time-series"
    ],
    "src": "https://www.waitingforcode.com/apache-spark-sql/asof-join-apache-spark-sql/read"
  },
  {
    "id": "auto-20260629-4",
    "cat": "Spark",
    "level": "Core",
    "title": "Spark 4.0 ANSI mode turns silent nulls into errors",
    "hook": "The cast that used to return null now throws mid-pipeline.",
    "body": "<p>Spark 4.0 (May 2025) flipped <code>spark.sql.ansi.enabled</code> to <code>true</code> by default. Operations that quietly returned <code>null</code> in Spark 3 &mdash; an invalid <code>cast('abc' as int)</code>, divide-by-zero, arithmetic overflow, a BIGINT inserted into an INT column &mdash; now raise runtime errors. It is the single biggest breaking change in the upgrade and surfaces only when dirty data hits the bad path, so it can pass tests and fail in prod. Do not just disable ANSI; wrap the cases you intend to tolerate with <code>try_cast</code> / <code>try_divide</code>, which return null for that op while keeping strict semantics everywhere else.</p>",
    "tags": [
      "spark-4",
      "ansi-mode",
      "try-cast",
      "breaking-change"
    ],
    "src": "https://spark.apache.org/docs/latest/sql-ref-ansi-compliance.html"
  },
  {
    "id": "auto-20260629-5",
    "cat": "AI",
    "level": "Advanced",
    "title": "The dbt MCP server makes your models the agent's API",
    "hook": "Agents stop guessing schemas and start calling your governed metrics.",
    "body": "<p>The dbt MCP server exposes your dbt project to AI agents over the Model Context Protocol: the Semantic Layer (governed metric queries), the Discovery API (model metadata and lineage), and the CLI. Instead of an agent free-handing SQL against raw tables and hallucinating a revenue definition, it calls a tool that returns the <em>one</em> agreed metric. The protocol is now governed by the Linux Foundation's Agentic AI Foundation. The career read: curating the semantic layer and its metadata is what makes agentic analytics trustworthy &mdash; that curation is the analytics-engineer job, not a side quest.</p>",
    "tags": [
      "mcp",
      "semantic-layer",
      "ai-agents",
      "dbt"
    ],
    "src": "https://docs.getdbt.com/blog/introducing-dbt-mcp-server"
  },
  {
    "id": "auto-20260630-1",
    "cat": "dbt",
    "level": "Advanced",
    "title": "A merge-incremental cannot delete - add a post-hook",
    "hook": "Merge inserts and updates; the row that quietly goes stale lives forever.",
    "body": "<p>Real pattern from the jobs <code>left join</code> claims incremental model. A <code>merge</code>-based incremental only knows two moves &mdash; insert a new row, update a matched one. It has no way to say <em>this previously-claimed row is no longer claimed</em>, so a stale row just lingers. The fix is a <code>post_hook</code> that runs a delete after the merge to evict rows the source dropped:</p><pre><code>post_hook=<span class=\"str\">\"delete from {{ this }} t where not exists (\n  select 1 from source s where s.job_id = t.job_id)\"</span></code></pre><p><code>insert_overwrite</code> dodges this by rewriting whole partitions, but the team preferred checkpoint-based merge for efficiency &mdash; so the delete hook is the price. Picking merge for a left-join incremental? Always answer: what removes rows the source no longer has?</p>",
    "tags": [
      "from-my-work",
      "incremental",
      "merge",
      "post-hook"
    ],
    "src": "memory/patterns.md 2026-03-10 - jobs LEFT JOIN claims merge incremental post-hook"
  },
  {
    "id": "auto-20260630-2",
    "cat": "dbt",
    "level": "Core",
    "title": "sqlfluff indents SQL inside Jinja, not under it",
    "hook": "Stepping the SQL in under a {% if %} tag looks tidy - and fails LT02.",
    "body": "<p>Real lint gotcha from datadex models. Wrapping SQL in a <code>{% if %} ... {% endif %}</code> block tempts you to indent the SQL one level deeper, the way you would nest any code block. sqlfluff's <strong>LT02</strong> (layout.indent) does not treat the Jinja control tag as an indent level &mdash; it wants the SQL inside aligned with the surrounding SQL:</p><pre><code>{% if is_incremental() %}\n<span class=\"kw\">where</span> updated_at &gt; (<span class=\"kw\">select</span> max(updated_at) <span class=\"kw\">from</span> {{ this }})\n{% endif %}</code></pre><p>The <code>where</code> sits flush with the code around the block, not stepped in under <code>{% if %}</code>. Worth knowing because hipages PRs must pass lint before merge.</p>",
    "tags": [
      "from-my-work",
      "sqlfluff",
      "jinja",
      "lint"
    ],
    "src": "memory/patterns.md 2026-03-10 - sqlfluff LT02 inside Jinja if blocks"
  },
  {
    "id": "auto-20260630-3",
    "cat": "Spark",
    "level": "Advanced",
    "title": "DataFusion Comet: an open-source Photon",
    "hook": "A drop-in accelerator that runs your Spark plan in Rust - no code changes.",
    "body": "<p>Apache DataFusion Comet is an OSS plugin that intercepts Spark's physical plan and executes supported operators natively in <strong>Rust on Apache Arrow</strong> columnar batches, off the JVM row-by-row path. You add a jar plus a few configs; unsupported operators fall back to vanilla Spark, so you can enable it incrementally and safely. Comet 0.16 (May 2026) supports Spark 4.0 and 4.1 and benchmarks near <strong>2x</strong> on TPC-DS at ~1TB &mdash; roughly 50% compute savings. It is the open answer to proprietary native engines like Photon, and real leverage if you run Spark anywhere off Databricks.</p>",
    "tags": [
      "comet",
      "datafusion",
      "performance"
    ],
    "src": "https://datafusion.apache.org/comet/"
  },
  {
    "id": "auto-20260630-4",
    "cat": "Platform",
    "level": "Advanced",
    "title": "XTable translates table formats both ways",
    "hook": "UniForm only lets Iceberg read your Delta; XTable makes the metadata bidirectional.",
    "body": "<p>Apache XTable (incubating; backed by Onehouse, Microsoft, Google) writes the metadata of one lakehouse format <em>from</em> another &mdash; Delta to Iceberg, Iceberg to Hudi, any direction &mdash; without copying the data. It reads your existing <code>_delta_log</code> / <code>metadata</code> / <code>.hoodie</code> and emits sibling metadata for the other formats in place, so the same Parquet files are queryable as all three. The contrast with Delta UniForm: UniForm is <strong>one-way and read-only</strong> (expose Delta as Iceberg/Hudi); XTable is <strong>omni-directional</strong>. Caveat &mdash; still incubating: merge-on-read tables and deletion vectors are not yet supported, so verify before relying on it in prod.</p>",
    "tags": [
      "xtable",
      "iceberg",
      "interoperability"
    ],
    "src": "https://xtable.apache.org/"
  },
  {
    "id": "auto-20260630-5",
    "cat": "SQL",
    "level": "Core",
    "title": "when not matched by source deletes in one merge",
    "hook": "The third merge clause turns an upsert into a full sync - no separate delete pass.",
    "body": "<p>Everyone knows merge's two clauses: <code>when matched</code> (update) and <code>when not matched</code> (insert). Delta and Databricks add a third &mdash; <code>when not matched by source</code> &mdash; which fires for <em>target</em> rows that have no match in the source. That makes one statement a full sync: upsert what the source has, delete what it does not.</p><pre><code><span class=\"kw\">merge into</span> dim_account t\n<span class=\"kw\">using</span> daily_snapshot s <span class=\"kw\">on</span> t.id = s.id\n<span class=\"kw\">when matched then update set</span> *\n<span class=\"kw\">when not matched then insert</span> *\n<span class=\"kw\">when not matched by source then delete</span>;</code></pre><p>Always scope it with an extra predicate (e.g. <code>and t.region = 'au'</code>) so it only deletes inside the slice the source actually covers &mdash; otherwise it wipes rows the snapshot never meant to manage. This is the native version of the dbt delete post-hook.</p>",
    "tags": [
      "merge",
      "when-not-matched-by-source",
      "full-sync"
    ],
    "src": "https://docs.databricks.com/aws/en/sql/language-manual/delta-merge-into.html"
  },
  {
    "id": "auto-20260701-1",
    "cat": "dbt",
    "level": "Advanced",
    "title": "Snapshots: hard_deletes='new_record' tracks the delete",
    "hook": "A row vanishing from the source should be history, not a silent gap.",
    "body": "<p>By default a dbt snapshot ignores a source hard-delete &mdash; the row just stops updating, so you cannot tell &ldquo;deleted&rdquo; from &ldquo;unchanged&rdquo;. dbt 1.9 adds a <code>hard_deletes</code> config with three modes: <code>ignore</code> (old default), <code>invalidate</code> (close the current row's validity window), and <code>new_record</code> (insert a fresh version flagged <code>dbt_is_deleted = true</code>, and flip it back to false if the key reappears). The third gives you a continuous, queryable deletion trail.</p><pre><code>snapshots:\n  - name: snap_accounts\n    config:\n      strategy: timestamp\n      updated_at: updated_at\n      hard_deletes: new_record</code></pre><p>Gotcha: dbt does NOT migrate existing snapshots &mdash; only enable it on net-new ones, or rebuild the table first.</p>",
    "tags": [
      "snapshots",
      "hard-deletes",
      "scd2",
      "dbt-1.9"
    ],
    "src": "https://docs.getdbt.com/reference/resource-configs/hard-deletes"
  },
  {
    "id": "auto-20260701-2",
    "cat": "Platform",
    "level": "Advanced",
    "title": "PyIceberg: write Iceberg from Python, no JVM",
    "hook": "You do not need a Spark cluster to land a table in the lakehouse.",
    "body": "<p>PyIceberg is the official pure-Python client for Apache Iceberg &mdash; it talks straight to a catalog (REST, Glue, Hive, Nessie), with no Spark or JVM. You load a table, append a PyArrow table or pandas frame, and it handles schema evolution, partitioning and time-travel natively. Ideal for small/medium ingestion, ML feature writes, and local dev where spinning a cluster is overkill.</p><pre><code>from pyiceberg.catalog import load_catalog\ncat = load_catalog(\"prod\")\ntbl = cat.load_table(\"sales.orders\")\ntbl.append(arrow_table)   # commits a new snapshot</code></pre><p>The catch: it is single-process, so for genuinely large rewrites or heavy MERGE you still want Spark/Trino. Treat PyIceberg as the lightweight on-ramp, not the replacement.</p>",
    "tags": [
      "pyiceberg",
      "iceberg",
      "python",
      "ingestion"
    ],
    "src": "https://py.iceberg.apache.org/"
  },
  {
    "id": "auto-20260701-3",
    "cat": "Streaming",
    "level": "Senior",
    "title": "Apache Paimon: the streaming-first table format",
    "hook": "When Iceberg drowns in delete files, this is why a fourth format exists.",
    "body": "<p>Feed a high-churn CDC stream of updates and deletes into Iceberg via merge-on-read and you accumulate a growing pile of delete files between compactions, hurting reads. Apache Paimon is built for exactly this: an <strong>LSM-tree</strong> store (like a database engine) that absorbs high-frequency upserts cheaply, tuned for Flink. Its standout trick &mdash; a primary-key table doubles as a <em>changelog source</em>, emitting +I/-U/+U/-D records, so one Flink job's output streams into the next. Use Paimon for mutable, real-time streams; keep Iceberg as the default for append-heavy, mixed-engine batch analytics. It is a specialist, not an Iceberg replacement.</p>",
    "tags": [
      "paimon",
      "lsm-tree",
      "flink",
      "table-format"
    ],
    "src": "https://datalakehousehub.com/blog/2026-05-paimon-vs-iceberg-mutable-streams/"
  },
  {
    "id": "auto-20260701-4",
    "cat": "SQL",
    "level": "Advanced",
    "title": "Recursive CTEs landed in Databricks SQL",
    "hook": "Walk a hierarchy or a graph without exploding it into N self-joins.",
    "body": "<p>From Databricks Runtime 17.0 / DBSQL 2025.20, <code>with recursive</code> is supported (ANSI syntax, also now in open-source Spark). An <em>anchor</em> query seeds the result; a <em>recursive</em> member references the CTE and re-runs until it adds no new rows &mdash; perfect for org charts, category trees, and bill-of-materials.</p><pre><code><span class=\"kw\">with recursive</span> chain(id, parent_id, lvl) <span class=\"kw\">as</span> (\n  <span class=\"kw\">select</span> id, parent_id, <span class=\"num\">0</span> <span class=\"kw\">from</span> categories <span class=\"kw\">where</span> parent_id <span class=\"kw\">is null</span>\n  <span class=\"kw\">union all</span>\n  <span class=\"kw\">select</span> c.id, c.parent_id, chain.lvl + <span class=\"num\">1</span>\n  <span class=\"kw\">from</span> categories c <span class=\"kw\">join</span> chain <span class=\"kw\">on</span> c.parent_id = chain.id)\n<span class=\"kw\">select</span> * <span class=\"kw\">from</span> chain;</code></pre><p>Safety rails stop runaways: max depth 100 and 1M rows, or the query errors. For deep traversals raise the limit deliberately rather than looping in Python.</p>",
    "tags": [
      "recursive-cte",
      "hierarchy",
      "databricks-sql"
    ],
    "src": "https://www.databricks.com/blog/introducing-recursive-common-table-expressions-databricks"
  },
  {
    "id": "auto-20260701-5",
    "cat": "Modeling",
    "level": "Core",
    "title": "A lookup seed with duplicate keys fans out the fact",
    "hook": "Forget select distinct on the reference table and your row count quietly doubles.",
    "body": "<p>Real pattern from the <code>rpt_jobs</code> migration bridge. Legacy reason codes are mapped to display strings via a seed (<code>ref_job_closed_reason</code>), but the seed holds duplicates &mdash; several PascalCase codes collapse to the same legacy string. Left-join that raw and the fact fans out: &ldquo;Small Job&rdquo; appears twice, every metric on it inflates. The fix is to dedupe the lookup at the join boundary and verify cardinality before trusting it:</p><pre><code><span class=\"kw\">select distinct</span> job_closed_reason, legacy_closed_reason\n<span class=\"kw\">from</span> {{ ref(<span class=\"st\">'ref_job_closed_reason'</span>) }}\n<span class=\"kw\">where</span> job_closed_reason <span class=\"kw\">is not null and</span> job_closed_reason &lt;&gt; <span class=\"st\">''</span></code></pre><p>A seed feels safe because it is small and hand-curated &mdash; that is exactly why fan-out from it goes unnoticed. Treat every dimension/seed join as a grain risk: confirm one row per key first.</p>",
    "tags": [
      "from-my-work",
      "fan-out",
      "seed",
      "grain"
    ],
    "src": "datadex: domains/marketplace/models/marts/rpt_jobs.sql"
  },
  {
    "id": "auto-20260701-6",
    "cat": "dbt",
    "level": "Senior",
    "title": "Bake incremental safeguards into one macro",
    "hook": "Three silent incremental bugs, solved once instead of per model.",
    "body": "<p>The datadex <code>create_incremental_loading_cte</code> macro wraps three safeguards every staging model needs, so none get forgotten. (1) <strong>Dedup</strong>: a <code>row_number() over (partition by pk order by ts desc)</code> kept at <code>= 1</code>, because CDC sources emit multiple rows per key per batch. (2) <strong>Cold-start</strong>: a baseline-table cutoff so the very first run does not full-scan history. (3) <strong>Quote-aware watermark</strong>: <code>quote_source_inc_value</code> &mdash; a high-watermark column that is a <em>string</em> timestamp must be compared as a quoted literal; compare it unquoted and the filter silently returns nothing or everything. Encoding these in a macro keeps every model consistent and turns three easy-to-miss bugs into one reviewed implementation.</p>",
    "tags": [
      "from-my-work",
      "incremental",
      "macro",
      "cdc"
    ],
    "src": "datadex: macros/create_incremental_loading_cte.sql"
  },
  {
    "id": "auto-20260702-1",
    "cat": "DQ",
    "level": "Core",
    "title": "A Salesforce custom field can be 99.8% empty",
    "hook": "Before you build a metric on a column, check how often it is even filled.",
    "body": "<p>On hipages Salesforce data, <code>tradie_engagement_summary_c</code> is populated for only ~0.2% of leads and ~0% of accounts; <code>telephone_status_c</code> is 100% null for 2024+ leads. A feature, filter, or join built on a near-empty column reflects the tiny populated minority, not the population &mdash; pure noise dressed as signal. Profile fill rate before trusting any column:</p><pre><code><span class=\"kw\">select</span> count(col) / count(*) <span class=\"kw\">as</span> fill_rate <span class=\"kw\">from</span> t;</code></pre><p>Below ~10% filled, a column cannot carry a metric. Drop it, or confirm the sparsity is expected first.</p>",
    "tags": [
      "from-my-work",
      "null-profiling",
      "salesforce"
    ],
    "src": "patterns.md 2026-04-02 - tradie_engagement_summary_c 0.2% populated"
  },
  {
    "id": "auto-20260702-2",
    "cat": "Modeling",
    "level": "Advanced",
    "title": "Roll a per-event flag up to the entity before you count it",
    "hook": "Counting 'any bad touchpoint' at event grain over-weights the busy accounts.",
    "body": "<p>To answer <em>how many opportunities had any out-of-touch event</em>, collapse events to one row per opp first, then aggregate. Counting the raw event flag weights each opp by its number of touchpoints, so a chatty account distorts the total. Pattern:</p><pre><code><span class=\"kw\">with</span> per_opp <span class=\"kw\">as</span> (\n  <span class=\"kw\">select</span> opp_id, month,\n    max(<span class=\"kw\">case when</span> tp_outcome = <span class=\"str\">'out'</span> <span class=\"kw\">then</span> <span class=\"num\">1</span> <span class=\"kw\">else</span> <span class=\"num\">0</span> <span class=\"kw\">end</span>) <span class=\"kw\">as</span> has_any_out\n  <span class=\"kw\">from</span> touchpoints <span class=\"kw\">group by</span> opp_id, month)\n<span class=\"kw\">select</span> month, sum(has_any_out) <span class=\"kw\">from</span> per_opp <span class=\"kw\">group by</span> month;</code></pre><p>Roll up to the decision grain first, measure second.</p>",
    "tags": [
      "from-my-work",
      "grain",
      "rollup"
    ],
    "src": "patterns.md 2026-03-03 - PRO touchpoint opp-level rollup"
  },
  {
    "id": "auto-20260702-3",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Lance: the AI-native table format beside Iceberg",
    "hook": "Iceberg runs your SQL; Lance serves your embeddings and training rows.",
    "body": "<p>Lance is a 2026 open lakehouse format built for multimodal AI &mdash; images, video, audio, text, and embeddings in one table, with a native vector index and data versioning. It delivers ~100x faster random access than Parquet for single-row lookups (feeding a model) without losing scan speed. The emerging pattern: Iceberg for governed structured analytics, Lance co-located in the same object store for retrieval and training data, DuckDB bridging the two with SQL. Apache Polaris added Lance table support via its Generic Table API in January 2026.</p>",
    "tags": [
      "lance",
      "multimodal",
      "vector",
      "ai-native"
    ],
    "src": "https://www.lancedb.com/blog/from-bi-to-ai-lance-and-iceberg"
  },
  {
    "id": "auto-20260702-4",
    "cat": "Streaming",
    "level": "Senior",
    "title": "Query a streaming query's state like a table",
    "hook": "Your aggregate looks wrong - now you can read the state store directly.",
    "body": "<p>Spark 4.0's State Data Source lets you point a batch read at a running or checkpointed stream's state store and inspect the actual key-value pairs it holds &mdash; the running counts, dedup keys, and session windows you previously had to guess at from logs. Two readers: <code>statestore</code> for the contents, <code>state-metadata</code> for operator info. Databricks extends it with a changelog feed in CDC format so you see how state evolved over batches. It turns 'why is this aggregate off?' from log-archaeology into a query.</p>",
    "tags": [
      "structured-streaming",
      "state-store",
      "debugging",
      "spark-4"
    ],
    "src": "https://www.databricks.com/blog/announcing-state-reader-api-new-statestore-data-source"
  },
  {
    "id": "auto-20260702-5",
    "cat": "AI",
    "level": "Advanced",
    "title": "Agent Bricks auto-builds the eval it grades itself on",
    "hook": "Describe the task, connect the data - it generates its own benchmark.",
    "body": "<p>Databricks Agent Bricks takes a plain-English task plus your Unity Catalog data and automatically generates task-aware benchmarks, LLM judges, and synthetic data that mimics yours, then searches optimization techniques to trade off cost against quality. The lesson for a data person: the scarce input is no longer prompt-tweaking but a clean, well-described data model and a correct definition of a 'good answer'. At the 2026 Data + AI Summit Databricks reported 100k+ agents built this way. Own the eval definition and you own the agent's quality.</p>",
    "tags": [
      "agent-bricks",
      "evaluation",
      "llm-judge",
      "databricks"
    ],
    "src": "https://www.databricks.com/blog/introducing-agent-bricks"
  },
  {
    "id": "auto-20260703-1",
    "cat": "DQ",
    "level": "Core",
    "title": "One in twenty partner jobs is not a real job",
    "hook": "Skip the validity filter and every volume and conversion number reads high.",
    "body": "<p>On <code>marketplace__jobs_claims_category_geo_account</code>, roughly 4.6% of partner rows carry <code>valid_indicator &lt;&gt; 'valid'</code> &mdash; test jobs, cancelled fakes, and bad data. Count them and your job volume, claim rate, and conversion all inflate silently. Make it the first line of any partner analysis:</p><pre><code><span class=\"kw\">select</span> ... <span class=\"kw\">from</span> marketplace__jobs_claims_category_geo_account\n<span class=\"kw\">where</span> valid_indicator = <span class=\"str\">'valid'</span>;</code></pre><p>A cheap filter that prevents a whole class of over-counting.</p>",
    "tags": [
      "from-my-work",
      "data-quality",
      "filtering"
    ],
    "src": "patterns.md 2026-04-14 - marketplace jobs valid_indicator filter"
  },
  {
    "id": "auto-20260703-2",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Custom Spark connectors are pure Python now",
    "hook": "A REST API or Google Sheet as a Spark source - no Scala, no JVM.",
    "body": "<p>The Python Data Source API went GA in October 2025 (Spark 4.0, DBR 15.4 LTS+). Before it, a custom connector meant Data Source v1/v2 in Scala or Java and deep Spark internals. Now you subclass <code>DataSource</code> plus a <code>DataSourceReader</code> in Python, yield Arrow batches, and register it &mdash; batch or streaming. Then read it like any built-in format:</p><pre><code>df = spark.read.format(<span class=\"str\">\"restapi\"</span>).option(<span class=\"str\">\"url\"</span>, url).load()</code></pre><p>It unlocks REST APIs, Sheets, HuggingFace, and proprietary systems without leaving Python.</p>",
    "tags": [
      "spark-4",
      "python",
      "connectors",
      "arrow"
    ],
    "src": "https://www.databricks.com/blog/announcing-general-availability-python-data-source-api"
  },
  {
    "id": "auto-20260703-3",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Clean Rooms: join data you are never allowed to see",
    "hook": "Two companies compute on shared data; neither reads the other's raw rows.",
    "body": "<p>Databricks Clean Rooms (GA on AWS and Azure in FY26) let up to 10 organisations run approved notebooks over each other's data using Delta Sharing on isolated serverless compute. Collaborators see only schemas &mdash; column names and types &mdash; never row-level data, which stays in each party's own Unity Catalog. Notebooks write to temporary output tables, so you control exactly what leaves the room, and egress is locked down. FY26 added HIPAA compliance and cross-cloud federated querying. The pattern for privacy-safe partner analytics without a raw-data handoff.</p>",
    "tags": [
      "clean-rooms",
      "governance",
      "privacy",
      "delta-sharing"
    ],
    "src": "https://www.databricks.com/blog/top-10-questions-you-asked-about-databricks-clean-rooms-answered"
  },
  {
    "id": "auto-20260703-4",
    "cat": "Platform",
    "level": "Core",
    "title": "Lakebridge automates the warehouse migration grind",
    "hook": "Profiling, SQL conversion, and reconciliation for a legacy move - free and open.",
    "body": "<p>Lakebridge (a free, open databrickslabs project) automates migrations from legacy warehouses to Databricks SQL in three stages: <strong>Analyzer</strong> profiles and assesses the source, <strong>Converter</strong> rewrites legacy SQL and ETL into Databricks or Spark SQL, and <strong>Validator</strong> reconciles row counts and correctness after cutover. Databricks claims it handles up to ~80% of migration tasks. The lesson for a pivoting analyst: a warehouse migration is now a repeatable, tool-assisted workflow with a built-in reconciliation gate &mdash; not a risky hand-port you eyeball afterwards.</p>",
    "tags": [
      "migration",
      "tooling",
      "databricks-labs"
    ],
    "src": "https://www.databricks.com/blog/introducing-lakebridge-free-open-data-migration-databricks-sql"
  },
  {
    "id": "auto-20260703-5",
    "cat": "SQL",
    "level": "Senior",
    "title": "Coalescing evolving structs needs a shape-normalise first",
    "hook": "A wrapper cast on the result is too late - the mismatch is at plan time.",
    "body": "<p>Snowplow lands each schema version as its own column, and the reflex is <code>coalesce()</code> across them to grab the latest one present. Trap: if the entity is a struct and a newer version added a field, the branches have different shapes and <code>coalesce()</code> throws <code>DATATYPE_MISMATCH</code> at plan time. Wrapping <code>transform()</code> around the coalesce does not help &mdash; it only fixes the output type. Normalise each branch to one canonical <code>named_struct</code> first, casting a typed null for fields older versions lack:</p><pre><code><span class=\"kw\">coalesce</span>(\n  transform(entity_v5, x -&gt; named_struct(<span class=\"str\">'job_id'</span>, x.job_id, <span class=\"str\">'label'</span>, x.label)),\n  transform(entity_v3, x -&gt; named_struct(<span class=\"str\">'job_id'</span>, x.job_id, <span class=\"str\">'label'</span>, <span class=\"kw\">cast</span>(null <span class=\"kw\">as</span> string)))\n)</code></pre>",
    "tags": [
      "from-my-work",
      "spark-sql",
      "schema-evolution",
      "struct"
    ],
    "src": "datadex macros/get_columns_from_table.sql - get_latest_value_from_columns_based_on_pattern"
  },
  {
    "id": "auto-20260704-1",
    "cat": "SQL",
    "level": "Advanced",
    "title": "Averaging a rate weights the wrong rows",
    "hook": "sum(numerator) / sum(denominator) is the only honest rate.",
    "body": "<p>Computing conversion or click-through as <code>avg(per_row_rate)</code> silently over-weights low-volume rows &mdash; a day with 1 click / 1 impression counts the same as one with 5k / 10k. Divide the totals instead:</p><pre><code><span class=\"kw\">select</span> <span class=\"kw\">sum</span>(clicks) / <span class=\"kw\">sum</span>(impressions) <span class=\"kw\">as</span> ctr</code></pre><p>In databricks ai/bi widgets division is banned in <code>fields[].expression</code>, so build it as a dataset custom calculation (<code>measure(sum(clicks)) / measure(sum(impressions))</code>) or pre-aggregate in sql.</p>",
    "tags": [
      "from-my-work",
      "rate-metric",
      "aggregation",
      "dashboard"
    ],
    "src": "patterns.md 2026-05-11 - rate metrics use sum/sum, never avg-of-rates"
  },
  {
    "id": "auto-20260704-2",
    "cat": "DQ",
    "level": "Advanced",
    "title": "Dollars and credits in one sum is a silent bug",
    "hook": "100 credits = one dollar - and nothing in the schema warns you.",
    "body": "<p>In the pam flat-table migration, silver <code>stg_hip_value_products.value</code> is in <strong>dollars</strong> while kafka <code>balance_total_credits</code> (every <code>*_credits</code> column in domain_events) is in <strong>credits</strong>, at 100 credits to the dollar. Both are plain numerics, so a join-and-sum compiles fine and inflated paid revenue 100x. The rule: confirm the <em>unit</em> of every numeric column before you add or compare it &mdash; the type system never catches a unit mismatch, only a human reading the source does.</p>",
    "tags": [
      "from-my-work",
      "units",
      "credits",
      "correctness"
    ],
    "src": "patterns.md 2026-05-07 - silver dollars vs kafka credits (100:1) inflation bug"
  },
  {
    "id": "auto-20260704-3",
    "cat": "SQL",
    "level": "Advanced",
    "title": "VARIANT stores JSON and stays queryable",
    "hook": "About 8x faster than a json string, and nested types survive.",
    "body": "<p>Spark 4.0 and Delta added the <code>variant</code> type for semi-structured data: one column holds arbitrary nested json in a compact binary form, but a nested int stays an int and reads roughly 8x faster than parsing a json string on every query. Build it with <code>parse_json()</code> and pull fields with path syntax:</p><pre><code><span class=\"kw\">select</span> parse_json(raw):user.id::bigint <span class=\"kw\">from</span> events;</code></pre><p>Databricks now recommends variant over json-as-string, and over rigid structs when the schema keeps drifting.</p>",
    "tags": [
      "variant",
      "semi-structured",
      "spark-4",
      "delta"
    ],
    "src": "https://www.databricks.com/blog/introducing-open-variant-data-type-delta-lake-and-apache-spark"
  },
  {
    "id": "auto-20260704-4",
    "cat": "Platform",
    "level": "Senior",
    "title": "Iceberg v3 gives you CDC without a CDC tool",
    "hook": "Every row now carries an id and a last-updated sequence number.",
    "body": "<p>Iceberg v3 (GA on Snowflake May 2026, Databricks Runtime 18.0+) makes row lineage a table-level guarantee: each row gets a stable <code>_row_id</code> plus a <code>_last_updated_sequence_number</code> stamped by the commit that last changed it. So you can derive change-data-capture natively &mdash; diff two snapshots by sequence number &mdash; instead of bolting on Debezium or a merge-audit column. v3 also brings deletion vectors (up to 10x faster DML) and a real <code>variant</code> type, converging Iceberg and Delta capabilities.</p>",
    "tags": [
      "iceberg-v3",
      "row-lineage",
      "cdc",
      "table-format"
    ],
    "src": "https://www.databricks.com/blog/next-era-open-lakehouse-apache-icebergtm-v3-public-preview-databricks"
  },
  {
    "id": "auto-20260704-5",
    "cat": "Streaming",
    "level": "Advanced",
    "title": "Declarative pipelines are now open-source Spark",
    "hook": "DLT's engine landed in Apache Spark 4.1 as pyspark.pipelines.",
    "body": "<p>Databricks open-sourced its declarative pipeline framework into Apache Spark 4.1 (the <code>pyspark.pipelines</code> module), branded Lakeflow Spark Declarative Pipelines. You declare tables and the flows between them in sql/python and the engine derives the DAG, incrementality, and retries &mdash; no hand-written orchestration. Code against open-source Spark runs unchanged on Databricks. The catch: <code>auto cdc</code> (out-of-order CDC handling with SCD1/SCD2) is a Lakeflow-only extension, not in the open-source module.</p>",
    "tags": [
      "lakeflow",
      "declarative-pipelines",
      "spark-4-1",
      "dlt"
    ],
    "src": "https://docs.databricks.com/aws/en/ldp/"
  },
  {
    "id": "auto-20260705-1",
    "cat": "SQL",
    "level": "Advanced",
    "title": "A fixed +10h offset breaks twice a year",
    "hook": "Half the year your AEST conversion is silently one hour wrong.",
    "body": "<p>Converting UTC to Sydney time with <code>ts + interval 10 hours</code> is wrong for the ~5 months of daylight saving, when the state runs AEDT (+11). Every timestamp near midnight lands on the wrong day, drifting rows into the wrong reporting bucket. Use a named IANA zone so the switch is handled for you:</p><pre><code>convert_timezone(<span class=\"st\">'UTC'</span>, <span class=\"st\">'Australia/Sydney'</span>, ts)</code></pre><p>Our own <code>timezone_convert_utc_to_business_timezone</code> macro does exactly this. A constant hour offset is a code smell for any zone that observes DST.</p>",
    "tags": [
      "from-my-work",
      "timezone",
      "dst",
      "convert-timezone"
    ],
    "src": "datadex macros/timezone.sql"
  },
  {
    "id": "auto-20260705-2",
    "cat": "DQ",
    "level": "Advanced",
    "title": "Bot traffic inflates web session counts",
    "hook": "Crawlers, scrapers and pingers pad every Snowplow metric you report.",
    "body": "<p>Web-event tables carry a heavy tail of non-human traffic &mdash; Googlebot, Bingbot, PhantomJS, uptime pingers &mdash; and counting it overstates sessions, conversion denominators, and category demand. Filter on the user agent before you aggregate:</p><pre><code><span class=\"kw\">and not</span> rlike(useragent,\n  <span class=\"st\">'.*(bot|crawl|spider|slurp|archiv|pingdom|phantomjs).*'</span>)</code></pre><p>Our <code>filter_bots</code> macro does this, plus a false-positive allowlist for mobile apps mis-flagged as bots. Craft note: a <code>coalesce</code>-based null guard errored in Spark, so it uses <code>(not flag = true or flag is null)</code> instead.</p>",
    "tags": [
      "from-my-work",
      "bot-filter",
      "snowplow",
      "web-analytics"
    ],
    "src": "datadex macros/filter_bots.sql"
  },
  {
    "id": "auto-20260705-3",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Ibis: one dataframe API, twenty backends",
    "hook": "Prototype on DuckDB locally, run on Spark in prod, change one line.",
    "body": "<p>Ibis is a portable Python dataframe library that decouples the API from execution: you write pandas-style expressions and Ibis compiles them (via SQLGlot) to whichever engine your connection points at &mdash; 20+ backends including DuckDB, Polars, Spark, BigQuery, Trino. Iterate fast on a local DuckDB sample, then switch the connection string to a distributed backend when you outgrow one machine, with no query rewrite. It is a pragmatic answer to the single-node-vs-cluster and vendor-lock questions in one library.</p>",
    "tags": [
      "ibis",
      "dataframe",
      "portability",
      "duckdb"
    ],
    "src": "https://ibis-project.org/why"
  },
  {
    "id": "auto-20260705-4",
    "cat": "AI",
    "level": "Advanced",
    "title": "Your dbt marts can back a RAG app",
    "hook": "A Delta Sync index turns a governed table into a live knowledge base.",
    "body": "<p>Databricks AI Search (formerly Vector Search) builds a vector index directly on a Delta table. A <em>Delta Sync</em> index watches the source via Change Data Feed and incrementally re-embeds rows as they change &mdash; no hand-built ingestion or nightly full re-index. It supports hybrid keyword-plus-semantic search and inherits Unity Catalog governance. For the pivot: the same modeling and freshness rigour you apply to marts now feeds retrieval quality for an LLM app, keeping the AE close to how data is actually consumed.</p>",
    "tags": [
      "vector-search",
      "rag",
      "delta-sync",
      "embeddings"
    ],
    "src": "https://docs.databricks.com/aws/en/vector-search/vector-search"
  },
  {
    "id": "auto-20260705-5",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Read parallelism is set by files, not cores",
    "hook": "A slow scan on an idle cluster is often too few input partitions.",
    "body": "<p>Spark builds read partitions by packing files up to <code>spark.sql.files.maxPartitionBytes</code> (default 128MB), plus a ~4MB <code>openCostInBytes</code> per file. So a handful of large files yields few partitions and most executors sit idle no matter how many cores you add. Shrinking the value raises parallelism for a scan-bound job (streaming, many small files); the default suits large files. This is the <em>read</em> knob &mdash; distinct from <code>shuffle.partitions</code>, which governs post-shuffle sizing. Right-size it before scaling the cluster.</p>",
    "tags": [
      "maxpartitionbytes",
      "read-partitions",
      "parallelism",
      "tuning"
    ],
    "src": "https://spark.apache.org/docs/latest/sql-performance-tuning.html"
  },
  {
    "id": "auto-20260706-1",
    "cat": "SQL",
    "level": "Core",
    "title": "approx_count_distinct is 10-100x cheaper for exploration",
    "hook": "count(distinct) does an exact shuffle you rarely need while profiling.",
    "body": "<p>An exact <code>count(distinct col)</code> shuffles every value to one place to dedupe &mdash; expensive on a billion-row grain check. For profiling, grain sanity, and null-rate exploration, <code>approx_count_distinct(col)</code> uses HyperLogLog: 10-100x faster on Spark with ~2% error, no full shuffle.</p><pre><code><span class=\"kw\">select</span> approx_count_distinct(account_id) <span class=\"kw\">as</span> approx_pk,\n       count(*) <span class=\"kw\">as</span> rows\n<span class=\"kw\">from</span> fct_jobs;</code></pre><p>Switch to exact <code>count(distinct)</code> only for production metrics where the 2% matters.</p>",
    "tags": [
      "approx-count-distinct",
      "hyperloglog",
      "profiling",
      "from-my-work"
    ],
    "src": "patterns.md 2026-04-22 — approx_count_distinct for exploration"
  },
  {
    "id": "auto-20260706-2",
    "cat": "Modeling",
    "level": "Advanced",
    "title": "A row-count drop after full-refresh is not always a bug",
    "hook": "Incremental models quietly hoard records the source already deleted.",
    "body": "<p>Rows vanishing from an SF-sourced model after <code>--full-refresh</code> usually is not a transformation bug. An incremental run only ever appends/merges, so it <em>retains</em> records that were later hard-deleted or purged upstream (stale test accounts, GDPR wipes). A full-refresh rebuilds from the live source and drops them all at once &mdash; the count falls, but the new count is the correct one. Before suspecting your SQL, diff the missing IDs against the raw source table. If they are gone there too, the pipeline is fine.</p>",
    "tags": [
      "full-refresh",
      "incremental",
      "hard-delete",
      "from-my-work"
    ],
    "src": "lessons-locked.md 2026-06-12 — SF full-refresh drops purged rows"
  },
  {
    "id": "auto-20260706-3",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Spark Connect: the driver is now a remote server",
    "hook": "Stable in Spark 4.0 — your app is a thin gRPC client, not the driver.",
    "body": "<p>Classic Spark tightly couples your app to the JVM driver. <strong>Spark Connect</strong> (GA in Spark 4.0) splits them: the client turns DataFrame ops into unresolved logical plans, serialises them as protobuf, and ships them over gRPC to a remote driver. Wins: embed Spark in an IDE, notebook, or app server; upgrade the cluster without touching client code; a crashing client no longer kills the driver serving everyone else. It is also how Databricks Connect and non-JVM clients talk to a cluster.</p>",
    "tags": [
      "spark-connect",
      "grpc",
      "spark-4.0",
      "thin-client"
    ],
    "src": "https://spark.apache.org/docs/latest/spark-connect-overview.html"
  },
  {
    "id": "auto-20260706-4",
    "cat": "dbt",
    "level": "Advanced",
    "title": "dbt --empty: validate the DAG without scanning data",
    "hook": "Build every model with zero rows to catch broken refs for free.",
    "body": "<p>The <code>--empty</code> flag (dbt 1.8+) wraps each input in <code>limit 0 where false</code>, so models build their real schema and DDL but scan no data. It proves refs resolve, SQL compiles against actual warehouse types, and column contracts hold &mdash; at near-zero cost.</p><pre><code>dbt build -s <span class=\"kw\">state:modified+</span> --empty --defer --state target/</code></pre><p>Pair it with Slim CI for a cheap dry-run pull-request check; run the full-data build only on merge. Catches drift that a <code>dbt compile</code> alone misses.</p>",
    "tags": [
      "dbt-empty",
      "dry-run",
      "slim-ci",
      "dbt-1.8"
    ],
    "src": "https://docs.getdbt.com/docs/build/empty-flag"
  },
  {
    "id": "auto-20260706-5",
    "cat": "AI",
    "level": "Advanced",
    "title": "ai_query brings the LLM inside your SQL",
    "hook": "Classify or extract across a whole table with one function call.",
    "body": "<p>Databricks AI Functions run inference straight from SQL. Task-specific ones &mdash; <code>ai_classify</code>, <code>ai_extract</code>, <code>ai_translate</code>, <code>ai_parse_document</code> &mdash; are tuned for one job; <code>ai_query</code> is the general escape hatch for any model with a custom prompt.</p><pre><code><span class=\"kw\">select</span> review_id,\n  ai_classify(body, array('praise','complaint','question')) <span class=\"kw\">as</span> intent\n<span class=\"kw\">from</span> tradie_reviews;</code></pre><p>Since March 2025 they are fully serverless (no endpoint setup) and scale to batch inference inside a dbt model or DLT pipeline. Cost lands under MODEL_SERVING / BATCH_INFERENCE.</p>",
    "tags": [
      "ai-functions",
      "ai-query",
      "batch-inference",
      "databricks"
    ],
    "src": "https://docs.databricks.com/aws/en/large-language-models/ai-functions"
  },
  {
    "id": "auto-20260707-1",
    "cat": "Platform",
    "level": "Advanced",
    "title": "CTAS quietly strips VARCHAR back to STRING",
    "hook": "Your cast(col as varchar(255)) never made it into the Delta schema.",
    "body": "<p>A <code>cast(col <span class=\"kw\">as</span> varchar(255))</code> inside <code>create table ... as select</code> gets normalised to unbounded <code>string</code> in Delta's stored schema. Harmless &mdash; until a connector reads that schema: the Salesforce sync maps unbounded string to a 1,048,576-char field, blowing SF's 32,000 limit, and rejects the column. Same trap: <code>bigint</code> is precision 19 vs SF's max 18. Fix: drop the table, <code>create table</code> with explicit column DDL (<code>varchar(n)</code>, <code>decimal(18,s)</code>), then <code>insert into ... select</code>. Verify with <code>show create table</code>.</p>",
    "tags": [
      "delta",
      "ctas",
      "varchar",
      "salesforce-sync",
      "from-my-work"
    ],
    "src": "pam_portfolio_flat_sf_v2 build — platform-constraints.md, Databricks→SF sync"
  },
  {
    "id": "auto-20260707-2",
    "cat": "Modeling",
    "level": "Advanced",
    "title": "A dim table covers a population, not the universe",
    "hook": "The dim you based your build on was silently missing 24% of accounts.",
    "body": "<p>Every dimension table encodes upstream filter decisions someone else made. A lookup that reads like <em>all accounts</em> turned out to be <em>PAM-attributable accounts only</em> &mdash; three separate drop points upstream &mdash; and the flat table built on it silently lost rows; falling back to the raw source recovered 1,131 of them. Before basing a build on any dim, profile its population: <code>count(<span class=\"kw\">distinct</span> key)</code> in the dim vs the raw source, and diff a sample of the missing keys to learn <em>which</em> segment is excluded.</p>",
    "tags": [
      "dimension",
      "population",
      "coverage",
      "profiling",
      "from-my-work"
    ],
    "src": "memory/poc-dc-sf-id-gaps.md — poc_dc is PAM-attributable, not all accounts"
  },
  {
    "id": "auto-20260707-3",
    "cat": "Spark",
    "level": "Advanced",
    "title": "Arrow-native UDFs skip the pandas hop",
    "hook": "Spark 4.1 lets Python UDFs consume Arrow batches directly.",
    "body": "<p>Classic Python UDFs pickle rows one at a time; pandas UDFs fixed the batching but still convert every batch Arrow &rarr; pandas &rarr; Arrow, paying conversion and memory on both edges. Spark 4.1 adds <strong>Arrow-native UDFs and UDTFs</strong>: your function receives and returns Arrow RecordBatches directly, so there is no pandas dependency, no conversion tax, and lower peak memory. If a UDF only shuffles columns around or calls a vectorised library that already speaks Arrow, this is now the fastest Python path &mdash; worth re-benchmarking your slowest pandas UDFs.</p>",
    "tags": [
      "spark-4.1",
      "arrow",
      "pyspark",
      "udf",
      "performance"
    ],
    "src": "https://spark.apache.org/releases/spark-release-4.1.0.html"
  },
  {
    "id": "auto-20260707-4",
    "cat": "SQL",
    "level": "Advanced",
    "title": "SQL scripting is GA: loops and IF in pure SQL",
    "hook": "Spark 4.1 runs procedural blocks without a Python wrapper.",
    "body": "<p>SQL scripting hit GA in Spark 4.1 and is on by default: <code>begin ... end</code> blocks with variables, control flow, exception handlers, and dynamic SQL &mdash; no notebook Python glue needed.</p><pre><code><span class=\"kw\">begin</span>\n  <span class=\"kw\">declare</span> cnt <span class=\"kw\">int</span>;\n  <span class=\"kw\">set</span> cnt = (<span class=\"kw\">select</span> count(*) <span class=\"kw\">from</span> new_rows);\n  <span class=\"kw\">if</span> cnt &gt; <span class=\"num\">0</span> <span class=\"kw\">then</span> <span class=\"kw\">insert into</span> tgt <span class=\"kw\">select</span> * <span class=\"kw\">from</span> new_rows;\n  <span class=\"kw\">end if</span>;\n<span class=\"kw\">end</span></code></pre><p>Use it for conditional backfills and guarded merges; it is also the body language for Unity Catalog stored procedures.</p>",
    "tags": [
      "sql-scripting",
      "spark-4.1",
      "control-flow",
      "execute-immediate"
    ],
    "src": "https://spark.apache.org/releases/spark-release-4.1.0.html"
  },
  {
    "id": "auto-20260707-5",
    "cat": "SQL",
    "level": "Advanced",
    "title": "Theta sketches: distinct counts you can merge and intersect",
    "hook": "approx_count_distinct gives a number; a sketch gives reusable state.",
    "body": "<p><code>approx_count_distinct</code> returns one number you cannot reuse. A <strong>sketch</strong> is a tiny mergeable summary: store one per day or segment, then union them across any window later &mdash; no rescan of raw events. Spark 4.1 ships Apache DataSketches natively: <strong>Theta</strong> sketches support union, <em>intersection and difference</em> (e.g. audience overlap between two campaigns &mdash; impossible with plain HLL counts), and <strong>KLL</strong> sketches do the same trick for quantiles. Pattern: aggregate sketches in a daily incremental model, merge at query time.</p>",
    "tags": [
      "datasketches",
      "theta",
      "kll",
      "spark-4.1",
      "approximation"
    ],
    "src": "https://spark.apache.org/releases/spark-release-4.1.0.html"
  },
  {
    "id": "auto-20260708-1",
    "cat": "DQ",
    "level": "Advanced",
    "title": "Your bot filter flags the mobile app as a bot",
    "hook": "Filtering bots by user-agent quietly dropped real homeowner-app traffic.",
    "body": "<p>A user-agent bot filter matches suspicious agent strings &mdash; but native mobile clients send agents like <code>homeowner-ios/</code> and <code>okhttp/</code> (the Android HTTP library) that look automated and get caught as bots. So your session counts silently <em>deflate</em> for the whole app cohort, and no error ever fires. The fix is a false-positive allowlist layered on top of the bot rule: <code><span class=\"kw\">where</span> ua <span class=\"kw\">like</span> 'homeowner-ios/%' <span class=\"kw\">or</span> ua <span class=\"kw\">like</span> 'okhttp/%'</code>. Keep it in one macro so every staging model applies the same exception.</p>",
    "tags": [
      "bot-filter",
      "snowplow",
      "user-agent",
      "dq",
      "from-my-work"
    ],
    "src": "datadex macros/snowplow_bot_filter_false_positives.sql"
  },
  {
    "id": "auto-20260708-2",
    "cat": "SQL",
    "level": "Core",
    "title": "Put the null test first in a bucketing case",
    "hook": "A null radius did not stay null - it landed in your top bucket.",
    "body": "<p>A bucketing <code>case</code> that leads with numeric thresholds and ends in <code>else</code> lets null rows fall through to the last branch &mdash; so a null radius quietly reports as the <code>'100+'</code> bucket and inflates it. sql evaluates <code>null &lt;= 30</code> as unknown, never true, so every threshold skips the null and <code>else</code> swallows it. Lead with the null test so missing stays missing:</p><pre><code><span class=\"kw\">case</span>\n  <span class=\"kw\">when</span> radius_km <span class=\"kw\">is null then null</span>\n  <span class=\"kw\">when</span> radius_km &lt;= <span class=\"num\">30</span> <span class=\"kw\">then</span> '0-30'\n  <span class=\"kw\">else</span> '100+'\n<span class=\"kw\">end</span></code></pre>",
    "tags": [
      "case",
      "null-handling",
      "bucketing",
      "from-my-work"
    ],
    "src": "datadex macros/radius_in_km_bucket.sql"
  },
  {
    "id": "auto-20260708-3",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Apache Polaris is now the vendor-neutral Iceberg catalog",
    "hook": "The catalog that governs your tables graduated to a top-level Apache project in Feb 2026.",
    "body": "<p>Snowflake donated Polaris to Apache in 2024; it graduated to a top-level project in February 2026 after 18 months of incubation with Google, Microsoft and Confluent. It implements the Iceberg REST Catalog spec and ships RBAC, credential vending, catalog federation and SQL views &mdash; so Spark, Trino, Snowflake and Dremio can all read the same governed tables with no proprietary lock-in. The takeaway: the <em>catalog</em>, not the file format, is now where governance and multi-engine interop actually live.</p>",
    "tags": [
      "apache-polaris",
      "iceberg",
      "catalog",
      "rest-catalog",
      "governance"
    ],
    "src": "https://polaris.apache.org/blog/2026/02/19/apache-polaris-graduates-to-top-level-project/"
  },
  {
    "id": "auto-20260708-4",
    "cat": "AI",
    "level": "Advanced",
    "title": "Text-to-SQL collapses on real enterprise schemas",
    "hook": "Top models solve 6% of Spider 2.0 - down from 87% on the old benchmark.",
    "body": "<p>Spider 1.0 is a solved toy: models hit ~87% execution accuracy. Spider 2.0 rebuilt the test around real enterprise workloads &mdash; databases with 3,000+ columns, BigQuery and Snowflake dialects, multi-step transforms. gpt-4 solves 6%; o1-preview only 21%. The gap is schema scale and dialect, not SQL syntax. This is the hard data behind the curator role: a text-to-SQL surface like Genie needs a small, curated, well-described semantic layer, or the model drowns in the real warehouse.</p>",
    "tags": [
      "text-to-sql",
      "spider-2.0",
      "genie",
      "evaluation",
      "semantic-layer"
    ],
    "src": "https://arxiv.org/abs/2411.07763"
  },
  {
    "id": "auto-20260708-5",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Snowflake's new ingestion engine is 20-year-old Apache NiFi",
    "hook": "Openflow is managed NiFi - Snowflake's answer to Fivetran and Lakeflow Connect.",
    "body": "<p>Openflow (GA 2025, expanding through 2026) is Snowflake's managed data-integration service, and under the hood it is <strong>Apache NiFi</strong> &mdash; the flow-based tool that began life as the NSA's NiagaraFiles. You compose familiar NiFi processors plus Snowflake components to ingest structured, semi-structured and unstructured data, and can run the data plane inside your own VPC (BYOC). The lesson for a platform-watcher: the shiny 'new' ingestion layer each warehouse ships is often a battle-tested OSS engine wrapped in managed hosting.</p>",
    "tags": [
      "snowflake",
      "openflow",
      "nifi",
      "ingestion",
      "byoc"
    ],
    "src": "https://docs.snowflake.com/en/user-guide/data-integration/openflow/about"
  },
  {
    "id": "auto-20260709-1",
    "cat": "Platform",
    "level": "Advanced",
    "title": "Read secrets with a parser, never shell-grep the config",
    "hook": "grep over a nested config returns an empty string, and your script silently runs unauthenticated.",
    "body": "<p>Shell text tools flatten structure. <code>grep -m1 '^host' ~/.databrickscfg</code> returns the whole <code>host = https://...</code> line, not the url; grepping a pat out of nested json yields zero chars. The empty credential does not error &mdash; it silently fails auth downstream. Read config with a real parser at runtime:</p><pre><code>python3 -c \"import json,os; e=json.load(open(os.path.expanduser('~/.claude.json')))['mcpServers']['databricks']['env']; print(e['DATABRICKS_TOKEN'])\"</code></pre><p>Never hardcode the value into a script that persists.</p>",
    "tags": [
      "from-my-work",
      "secrets",
      "config",
      "shell"
    ],
    "src": "memory/patterns.md 2026-07-06 - never shell-grep nested config for creds"
  },
  {
    "id": "auto-20260709-2",
    "cat": "Modeling",
    "level": "Advanced",
    "title": "A re-owned job leaves a duplicate row in the fact",
    "hook": "When a job changes owner, both owners' rows survive and your counts double.",
    "body": "<p>In our marketplace fact a job whose consumer changed hands lands <strong>twice</strong> &mdash; one row per owner &mdash; so <code>count(*)</code> over-reports. The dedup keeps the current owner and deletes the stale one: within each duplicated job, find the original via</p><pre><code><span class=\"kw\">first_value</span>(consumer_user_id) <span class=\"kw\">over</span> (<span class=\"kw\">partition by</span> latest_job_id <span class=\"kw\">order by</span> last_modified_ts <span class=\"kw\">asc</span>)</code></pre><p>then a post-hook deletes rows matching it. When an entity's identity can churn, dedup on the newest record, not a blind <code>distinct</code>.</p>",
    "tags": [
      "from-my-work",
      "fan-out",
      "dedup",
      "window"
    ],
    "src": "datadex macro find_latest_job_owner"
  },
  {
    "id": "auto-20260709-3",
    "cat": "Platform",
    "level": "Advanced",
    "title": "LTAP unifies OLTP and OLAP on one copy",
    "hook": "Databricks' answer to HTAP joins the two worlds at the storage layer, not the engine.",
    "body": "<p>Announced June 2026, <strong>LTAP</strong> (Lake Transactional/Analytical Processing) runs operational, analytical and streaming workloads over a single copy of data on open object storage &mdash; Delta and Iceberg &mdash; governed by Unity Catalog. It builds on Lakebase (serverless Postgres) and folds it under the lakehouse. Unlike HTAP, which unifies at the engine, LTAP unifies at <em>storage</em>: no ETL, no replicas, so operational and analytical results never drift apart.</p>",
    "tags": [
      "ltap",
      "lakebase",
      "oltp",
      "htap",
      "databricks"
    ],
    "src": "https://www.databricks.com/company/newsroom/press-releases/databricks-launches-ltap-first-lake-transactionalanalytical"
  },
  {
    "id": "auto-20260709-4",
    "cat": "DQ",
    "level": "Advanced",
    "title": "ZeroOps traces a pipeline failure and drafts the fix",
    "hook": "It follows lineage to the root cause, then tests a repair on a shallow clone before you approve.",
    "body": "<p>Genie ZeroOps, now inside Lakeflow, watches live pipelines. When one breaks it traces the failure through Unity Catalog's column-level lineage back to the root cause, proposes a fix, and validates that fix against a <strong>shallow clone</strong> of the affected table &mdash; all before a human approves. Steal the pattern even without the product: a self-healing pipeline should prove its repair on a cheap clone, never on prod.</p>",
    "tags": [
      "zeroops",
      "lakeflow",
      "lineage",
      "self-healing",
      "databricks"
    ],
    "src": "https://www.databricks.com/blog/unifying-data-and-governance-agentic-era-whats-new-azure-databricks"
  },
  {
    "id": "auto-20260709-5",
    "cat": "AI",
    "level": "Advanced",
    "title": "Lakebase Search puts vector retrieval inside Postgres",
    "hook": "Hybrid vector plus full-text search native to your operational database - no separate vector store.",
    "body": "<p>Lakebase Search (beta, 2026) builds hybrid vector <em>and</em> full-text retrieval directly into Lakebase's Postgres, with 32x compression that makes 1B+ vector indexes cheap. For a data engineer shipping a RAG or agent app it collapses a moving part: your embeddings live beside the operational rows they describe, under the same Unity Catalog identity &mdash; instead of syncing a bolt-on vector db that drifts out of step with the source data.</p>",
    "tags": [
      "lakebase",
      "vector-search",
      "rag",
      "postgres",
      "databricks"
    ],
    "src": "https://www.databricks.com/blog/whats-new-azure-databricks-fabcon-2026-lakebase-lakeflow-and-genie"
  }
];
