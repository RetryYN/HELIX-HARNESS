---
schema_version: skill.v1
name: db
skill_type: design-contract
applies_to:
  layers:
    - L3
    - L4
    - L5
    - L6
    - L7
    - L8
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Retrofit
    - Refactor
---

# DB 設計

HELIX における persistent storage change に伴う schema design、state-model design、
migration strategy、harness.db projection obligations を扱う
（FR-L1-06 harness DB gate_runs / state projection）。PLAN が table、column、index、
migration を追加・変更・削除する場合に適用する。

## この skill を読む条件

- DB schema を導入または変更する L4 basic-design doc を書く。
- PLAN が `harness.db` tables（`plan_registry`、`artifact_registry`、`model_runs`、
  `trace_edges`、`coverage`、`findings`、`gate_runs`）を拡張する必要がある。
- Reverse R1 pass で undocumented schema を design doc へ抽出する必要がある。
- column/table rename または drop の前に migration script を設計する必要がある。

## harness.db projection awareness（projection 認識）

`.helix/harness.db` は SQLite projection DB である。`src/state-db/projection-writer.ts` が *write* し、
`helix doctor`、`helix vmodel lint`、`helix metrics` が *read* する。
application database ではなく harness state である。rules:

- `harness.db` を手編集しない。必ず `helix db rebuild` で regenerate する。
- harness state を追加する new PLAN は、projection writer 経由で appropriate table に row を追加する。
  bare SQL inserts は authoritative ではない。
- `helix doctor` が projection mismatch を報告した場合、追加診断の前に `helix db rebuild` を実行し、
  `helix doctor` を再実行する。

## schema change の V-model obligations

**L3 (functional):** 各 entity と role に名前を付け、invariants を plain language で記載する
（例: "a `plan_registry` row must always have a non-null `layer`"）。

**L4 (basic design):** L4 doc に ER diagram（Mermaid `erDiagram`）を作る。
各 table について columns、types、PK/FK、nullable flags を記載する。migration section には、
reversibility notes 付きで DDL changes の ordered list を含める。

**L5（detailed design）:** index strategy、query access patterns、constraint enforcement を記録する。
migration が destructive（DROP COLUMN、data transformation）の場合は rollback path を明示する。

**L6 (unit-test design):** 少なくとも 1 つの happy-path insert/update、
1 つの constraint-violation path、1 つの migration-step idempotency check を覆う。

## Migration design rules（migration 設計 rule）

- すべての schema change は `src/state-db/migrations/` 配下の numbered migration file として ship する
  （format: `NNN_<description>.sql`）。
- migrations は additive first。required にする前に nullable columns として追加し、
  old tables を drop する前に new tables を追加する。
- destructive migrations には、data loss が intentional かつ approved であることを示す
  PLAN `review_evidence` entry が必要。
- migration files 追加後、`helix doctor` は 0 で終了しなければならない。
  governance checks は migration ordering が monotonic で gaps が無いことを確認する。

## schema PLAN の pair-freeze checklist

- [ ] `docs/design/.../L4-basic/` に ER diagram 付きの L4 doc が存在する。
- [ ] L4 doc の migration section が各 DDL step を順序通りに列挙している。
- [ ] migration file(s) が `src/state-db/migrations/` 配下に存在し、gap なく numbered されている。
- [ ] L6 unit-test design が constraint violations と migration idempotency を覆っている。
- [ ] `helix plan lint` exits 0.
- [ ] `helix doctor` exits 0.
- [ ] harness.db changes の場合、`helix db rebuild` が成功し、projection-writer tests が green
      （`bun run test`）。
