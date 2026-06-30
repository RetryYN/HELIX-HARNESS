---
plan_id: PLAN-L7-94-outstanding-work-surface
title: "PLAN-L7-94 (impl): outstanding-work surface — 未了の正の集計 (非終端 PLAN 層別 + open defer) を status/handover に additive surface (IMP-139)"
kind: impl
layer: L7
drive: db
parent_design: docs/design/harness/L6-function-design/function-spec.md
status: confirmed
created: 2026-06-22
updated: 2026-06-30
owner: PM (Opus) / PO (人間)
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T11:17:00+09:00"
    tests_green_at: "2026-06-30T11:16:00+09:00"
    verdict: pass
    scope: "PO『4 は対応しろ』(2026-06-22) を受け IMP-139 (status/handover/DB が『未了の正の集計シグナル』を出さず doctor green=完了 と誤読され得る) を実装。新規 src/lint/outstanding.ts: analyzeOutstandingWork (純関数、非終端 PLAN を layer 別集計、terminal=confirmed/completed/accepted と archived を除外、key 昇順決定論、openDefers を Math.max(0) クランプ) + loadOutstandingPlanRows (docs/plans frontmatter から layer/status) + computeOutstandingWork (placeholder-deps specBackfillWaits を open defer として合成、I/O 失敗は fail-open ゼロ寄せ) + outstandingSummaryLine。surface 2 面: (1) ut-tdd status --json に outstanding を additive 付加 (nextAction を additive 付加した A-138/PLAN-L7-84 の前例に倣う、既存 6 field 不変) + status text に 1 行。(2) handover CURRENT.json pointer に outstanding を additive (session 再開時の完了主張を機械照合可能に)。gate ではない informational surface (非 fail-close)。2026-06-30 に意味別 blocker 分類と requiredAction/requiredEvidence を追加。さらに `completionReadiness` を追加し、doctor green とは別に whole-program / L14 全件達成 claim の ready/blocked を機械判定する。2026-06-30 continuation で `completionDecisionPacketForOutstanding` と `ut-tdd completion decision-packet` を追加し、PO/S4 判断・version-up activation・action-binding approval・不可逆 migration signoff を PLAN 単位の decision packet として出す。status JSON に `completionDecisionPacket` を additive に接続し、blocked status text から packet command へ直接辿れるようにした。2026-06-30 continuation 2 で `s4-decision-readiness` hard gate を追加し、S3 verified PoC が S4 decision record (allowed_outcome / decision_owner / decision_basis / forward_route / reverse_fullback_required) 無しに outstanding から消えないようにした。2026-06-30 continuation 3 で `cutover-readiness` hard gate を追加し、不可逆 L14 cutover が cutover decision record (allowed_outcome / trigger_condition / blast_radius_baseline / dry_run_plan / rollback_plan / state_backup_plan / approval_scope / audit_record / post_cutover_monitoring / legacy_alias_policy) 無しに completion packet から消えないようにした。test 14 ケース (analyze 5 + completion readiness 2 + decision packet 2 + summaryLine 2 + loader/compute 3) + S4 readiness 4 ケース + cutover readiness 4 ケース + CLI status/decision-packet surface + 既存 handover/status スイート不破壊。typecheck/Biome/Vitest/doctor green。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/outstanding.test.ts tests/cli-surface.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T11:07:00+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:a279910596bb502d4d795d754d70e54f27cbd21e7974725a08501c2c48998cd0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T11:07:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:b35707e9badca9217c24a07404fbd7915b0b06d31008dfafdb4ed679b3bc0f0a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T11:07:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:b35707e9badca9217c24a07404fbd7915b0b06d31008dfafdb4ed679b3bc0f0a"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-06-30T11:07:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:b35707e9badca9217c24a07404fbd7915b0b06d31008dfafdb4ed679b3bc0f0a"
agent_slots:
  - role: tl
    slot_label: "TL - outstanding-work additive surface (status/handover, IMP-139)"
generates:
  - artifact_path: docs/plans/PLAN-L7-94-outstanding-work-surface.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/s4-decision-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/cutover-readiness.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/handover/index.ts
    artifact_type: source_module
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/s4-decision-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/cutover-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/handover.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
related_l0: docs/governance/ut-tdd-agent-harness-concept_v3.1.md
---

# PLAN-L7-94 (impl): outstanding-work surface (IMP-139)

## 0. Objective

「未了の正の集計シグナル」(非終端 PLAN の層別数 + open defer 数 + 意味別待ち理由) を `ut-tdd status --json` と
handover CURRENT.json に **additive** に surface し、「doctor green = 完了」誤読 (PLAN 完了 ≠ 層完了) を
機械照合可能にする。informational surface であり gate ではない。

## 1. Problem (IMP-139)

`ut-tdd status` (mode + next のみ) も handover digest (commits/files/failures のみ) も CURRENT.json も
「層内の非終端 (draft 等) PLAN 数 / open な explicit-defer 数」を出さない。merged-plan-status
([[PLAN-L7-87]]) / plan-completion-drift ([[PLAN-L7-93]]) は drift を fail-close 検出するが、それは
「異常」検出であって「未了の総量」を可視化しない。結果、完了主張が機械照合不能だった
([[feedback_coverage_not_substance]] / [[feedback_verify_carry_status_against_code]])。

## 2. Fix

`src/lint/outstanding.ts` (新規) + status / handover 配線:

- `analyzeOutstandingWork(plans, openDefers)`: 非終端 PLAN を layer 別集計 (純関数)。
  terminal (confirmed/completed/accepted) と archived を除外、key 昇順、openDefers は Math.max(0)。
- `blockersByKind` / `items`: 非終端 PLAN を `version_up_parked`、`po_decision_pending`、
  `human_approval_pending`、`irreversible_migration_pending`、`active_draft` に分類する。これは完了判定ではなく、
  「要求・設計・承認・将来版保全のどこで止まっているか」を status/handover から照合するための意味 surface。
- `items[].requiredAction` / `items[].requiredEvidence`: blocker を人間が再解釈しなくても、S4 decision、
  version-up activation、action-binding approval、不可逆 cutover signoff のどの証跡を足せば進められるかを
  PLAN 単位で出す。これは自動承認ではなく、承認なしに進めてはいけない境界を明示するための additive surface。
- `completionReadiness`: `nonTerminalPlansTotal` / `openDefers` / `blockersByKind` を全件完了 claim 用に集約し、
  `ready` / `blocked` と required actions を返す。これは doctor health と分離した判定で、doctor green を
  L14 全件達成の代替にしない。
- `completionDecisionPacketForOutstanding`: `completionReadiness` が blocked のとき、未了 PLAN を
  `po_s4_decision` / `version_up_activation` / `human_action_approval` /
  `irreversible_migration_signoff` / `workflow_continuation` の decision item に変換する。
  各 item は allowed outcomes と next workflow route を持ち、PO が何を記録すれば S4 / version-up / L14
  cutover へ進めるかを機械出力にする。これは判断代行ではなく、判断待ちの証跡化である。
- `loadOutstandingPlanRows(repoRoot)`: docs/plans frontmatter から layer/status (registry を介さず最新値)。
- `computeOutstandingWork(repoRoot)`: open defer = placeholder-deps `specBackfillWaits` を合成
  (上位仕様確定待ちの正当な carry、threshold は descent-obligation 担当)。I/O 失敗は fail-open。
- status `--json` に `outstanding` と `completionDecisionPacket` を additive
  (既存 6 field + nextAction 不変、A-138/PLAN-L7-84 前例)。status text に `outstandingSummaryLine`、
  `completionReadinessLine`、blocked 時の `ut-tdd completion decision-packet --json` 導線を出す。
- `ut-tdd completion decision-packet [--json]` が同じ outstanding 正本から decision packet を出す。
- handover `runHandover` が CURRENT.json pointer に `outstanding` を additive 記録。

placement: placeholder-deps / shared を再利用するため解析層 `src/lint/outstanding.ts` に置く
(runtime→lint は coding-rules module-boundary 違反ゆえ、消費側 cli / handover が lint を import する形)。

## 3. Acceptance Criteria — met

- [x] 非終端 PLAN を layer 別に集計 (terminal/archived 除外、決定論順)。
- [x] 非終端 PLAN を意味別 blocker に分類し、status --json / handover の outstanding に additive surface。
- [x] 非終端 PLAN ごとの requiredAction / requiredEvidence を出し、承認待ち・S4 判断待ち・version-up parked を
  「次に残すべき証跡」へ落とす。
- [x] `completionReadiness` で whole-program / L14 全件達成 claim の ready/blocked を doctor green と別判定する。
- [x] `completion decision-packet` で PO/S4・version-up・approval・不可逆 migration の判断待ちを
  PLAN 単位の allowed outcomes / next route へ落とす。
- [x] open defer (spec-backfill placeholder_deps carry) を集計。
- [x] status --json / status text / handover CURRENT.json に additive surface (既存契約不変)。blocked status から
  decision packet へ直接辿れる。
- [x] informational surface = 非 fail-close (gate ではない、doctor.ok に連動させない)。
- [x] test 10 ケース (analyze 5 / summaryLine 2 / loader+compute 3)。typecheck / Biome / Vitest / doctor green。

## 4. Out of scope

- 専用 harness.db 物理表の新設 = 集計はオンデマンド導出で足り、db-projection-coverage gate を増やさない
  (将来 telemetry 集計が要れば別 PLAN)。
- 非終端の fail-close 化 = 本 surface は「正の量」の可視化であり、drift の fail-close は
  merged-plan-status / plan-completion-drift が担当 (相補)。
