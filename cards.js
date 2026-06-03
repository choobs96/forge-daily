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
  }
];
