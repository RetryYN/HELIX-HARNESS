---
plan_id: PLAN-M-01-cutover-backfill
title: "PLAN-M-01: legacy-source isolation backfill の計画"
kind: design
layer: L14
drive: fullstack
status: completed
created: 2026-06-11
updated: 2026-06-11
owner: Codex TL / PO
master_hub: true
agent_slots:
  - role: tl
    slot_label: "TL - cutover stale-doc backfill owner"
  - role: docs
    slot_label: "Docs - ADR-001 and cutover strategy alignment reviewer"
generates:
  - artifact_path: docs/plans/PLAN-M-01-cutover-backfill.md
    artifact_type: markdown_doc
roadmap:
  layer: cutover
  gates:
    - id: G-CUTOVER.A
      name: stale strategy evidence
      exit_criteria: "ADR-001 and A-130 evidence identify the legacy-source cutover strategy as stale and requiring backfill before execution."
    - id: G-CUTOVER.B
      name: cutover route ready
      exit_criteria: "The stale strategy is routed to a concrete backfill roadmap and the cutover program band is covered in roadmap rollup."
  spans:
    - plan_id: PLAN-M-01-cutover-backfill
      after_gate: entry
      before_gate: G-CUTOVER.A
    - plan_id: PLAN-M-00-verify-cutover
      after_gate: G-CUTOVER.A
      before_gate: G-CUTOVER.B
dependencies:
  parent: PLAN-M-00-verify-cutover
  requires:
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
    - docs/migration/helix-source-inventory.md
    - docs/plans/PLAN-L7-44-harness-db-master.md
  references:
    - .helix/audit/A-130-harness-db-segment-accept.md
    - docs/migration/helix-identifier-cutover-strategy.md
review_evidence:
  - reviewer: codex-intra-runtime-review
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-11"
    tests_green_at: "2026-06-11"
    verdict: pass
    scope: "Cutover backfill completion: stale legacy-source cutover strategy is rewritten to ADR-001 current truth and harness.db roadmap/review evidence projections are implemented. No production cutover, credential, infrastructure, or destructive state operation is authorized."
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-intra-runtime-review
---

# PLAN-M-01: legacy-source isolation backfill の計画

## 0. 位置づけ

この plan は program roadmap registry における cutover band の受け皿である。A-130 の carry を具体的な経路へ落とし込む。

- ADR-001 では source concepts の参照は許されるが、実行可能な behavior は HELIX-owned paths の下で TypeScript/Bun により再構築する。
- 以前の cutover strategy は、backfill なしには executable truth として扱えない。
- harness.db の L7 close により cutover は可視化されるが、production や destructive migration を許可するものではない。

## 1. 範囲

対象:

- cutover を covered program band として登録する。
- stale な strategy document を、ADR-001 に整合した HELIX-owned truth に書き換える。
- roadmap rollup と review evidence metadata を `harness.db` へ投影する。

対象外:

- production cutover の実行。
- vendor snapshot files の変更。
- credentials、infrastructure、repository protection、external service configuration の変更。

## 3. 工程表

### Step 1: [直列] stale strategy evidence の確認

直列理由: downstream_dependency。

ADR-001、A-130、migration inventory を使って stale condition を定義する。legacy runtime paths、Python code-port assumptions、old source command routes は、実行可能な HELIX guidance として残してはならない。

### Step 2: [直列] cutover roadmap の登録

直列理由: downstream_dependency。

`roadmap.layer: cutover` を登録し、`PROGRAM_BANDS.cutover` を parked carry text ではなく concrete roadmap で覆う。

### Step 3: [直列] verification

直列理由: downstream_dependency。

roadmap と doctor の checks を実行し、cutover band が covered であり parked cutover work 由来の frontier が残っていないことを示す。

### Step 4: [直列] review

直列理由: shared_state。

review evidence を記録する。review scope は意図的に backfill registration に限定されており、production cutover の実施承認として読んではならない。

## 3.1 実装計画

- backfill route は documentation と roadmap registration の変更である。
- `docs/migration/helix-identifier-cutover-strategy.md` は、現在の HELIX-owned execution/state rules に backfill 済みである。
- `harness.db` projection には、roadmap rollups、band coverage、gate progress、review evidence registry rows が含まれる。
- rollback は non-destructive である。document/projection commit を revert し、`.helix/harness.db` を sources から rebuild する。

## 4. DoD

- [x] `roadmap.layer: cutover` が confirmed PLAN に存在する。
- [x] Cutover はもはや `.helix/audit/A-130...` の carry text のみに依存していない。
- [x] production に影響する cutover execution は対象外のままであり、人間の承認が必要である。
- [x] cutover strategy doc は ADR-001 の current truth へ backfill 済みである。
- [x] `harness.db` rebuild は roadmap と review evidence feedback rows を投影する。
