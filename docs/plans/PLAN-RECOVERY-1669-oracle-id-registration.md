---
plan_id: PLAN-RECOVERY-1669-oracle-id-registration
title: "PLAN-RECOVERY-1669: oracle ID の未登録と宣言に無い多重出現を fail-close する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-08
updated: 2026-09-09
owner: Cursor / TL
github_issue_id: 1669
behavior_contract_id: ORACLE-ID-REGISTRATION-001
responsibility_owner: oracle-id-registration
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
complexity_effect: net_neutral
complexity_justification: "既存 oracle-test-trace hard gate へ逆方向検査を足すだけで、別 detector と別 CI job を増やさない"
removal_trigger: "未登録と未宣言多重の baseline が 0 になり、後続 PLAN が同じ gate を引き継いだ時"
backprop_decision: not_required
backprop_decision_reason: "既存 doctor / harness-check の oracle-test-trace 接続と判定強度を維持し、独立 job や baseline の現在値置換を追加しない Recovery である"
entry_signals: [regression_dev]
contract_preconditions: "oracle-test-trace は test-design 宣言 ID の tests citation だけを hard gate し、tests 側の未登録 ID と宣言に無い多重出現を検出しない"
contract_postconditions: "同一 gate が未登録 ID と宣言に無い多重出現を fail-close し、L8 または PLAN が全 path を宣言する多重・fast/slow pair・freeze 伝播・doctor lane は衝突にしない"
contract_invariants: "既存未 citation baseline 89 件を現在値へ置き換えない。未登録 debt は corrected classifier の exact 547 ID と provenance を one-time 固定し縮小のみ。独立 CI job を増やさない"
contract_failures: "未登録 NEW を green にする、宣言に無い多重を green にする、L8/PLAN 宣言済み多重や fast/slow/freeze/doctor lane を衝突にする、baseline を現在値へ代入する、別 CI job を追加する場合は fail-close する"
tdd_red_required: true
red_test: "U-OTT-008/014/020/021 が未登録 NEW・宣言に無い多重・現在値 baseline 置換・本文 mention の偽登録を red にし、U-OTT-010/012/013/015 が正当な多重を green のまま残す"
red_at: "2026-09-09T00:00:13Z"
green_at: "2026-09-09T00:51:00Z"
mutation_oracle_required: true
mutation_oracle: "U-OTT-019 が L8 宣言済み多重を衝突扱いする mutation を red にし、U-OTT-020 が未登録 baseline を現在集合へ置き換える mutation を red にする。U-OTT-021 が本文 token mention を登録源にする mutation を red にする"
mutation_oracle_evidence: "tests/oracle-test-trace.test.ts の U-OTT-019/020/021。2026-09-09T00:54:37Z に Node v24.15.0 で npx vitest run --project fast tests/oracle-test-trace.test.ts が 21 passed / exit 0。U-OTT-019 は naiveCollision=true かつ explained=true を要求し、L8 宣言済み多重を衝突扱いする mutation を kill する。U-OTT-020 は ORACLE_UNREGISTERED_BASELINE に無い U-NEWUNREG-002 を unregistered/new/missing へ残し、現在値代入 mutation を kill する。U-OTT-021 は design 本文の U-PROSEMENTION-001 を registered に入れず unregistered へ残す。"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-008, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-009, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-010, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-011, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-012, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-013, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-014, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-015, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-016, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-017, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-018, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-019, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-020, test_path: tests/oracle-test-trace.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OTT-021, test_path: tests/oracle-test-trace.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references:
    - issue:1669
    - issue:1667
    - issue:1403
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1669-oracle-id-registration.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/lint/oracle-test-trace.ts, artifact_type: source_module }
  - { artifact_path: src/lint/oracle-test-trace-baseline.ts, artifact_type: source_module }
  - { artifact_path: tests/oracle-test-trace.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/harness/L6-function-design/governance-enforcement.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: tl, slot_label: "TL — 未登録と未宣言多重を既存 oracle-test-trace へ束縛する" }
  - { role: qa, slot_label: "QA — 正当な多重 citation と negative/mutation oracle を検証する" }
  - { role: aim, slot_label: "AIM — 既存 green 相殺と独立 CI job 追加が無いことを監査する" }
review_evidence: []
---

# PLAN-RECOVERY-1669: oracle ID の未登録と宣言に無い多重出現を fail-close する

Issue #1669 / behavior contract `ORACLE-ID-REGISTRATION-001`。
既存`oracle-test-trace` hard gate を再利用し、tests から見た未登録 ID と宣言に無い多重出現を
fail-close する。独立 CI job は作らない。

## 原因

`plan-specific-vpair-binding` は宣言済み `oracle_id` が宣言済み `test_path` に出るかだけを見る。
未登録 ID は検査対象に入らず、衝突 ID も既存 binding が満たされていれば green のまま残る。
`U-PRSCOPE-008` は main 着地済みの未登録起点である。

## 判定

- 抽出は実行可能な `it()` / `test()` の exact ID に限定する。連番や prefix 意味は推測しない。
- 登録源は L8 eligible 表と L6/L8 の `U-ID` / `ID` / `oracle` 列だけ。本文 token mention は登録にしない。
- 登録先は L6 design または L8 test-design の少なくとも一方。両方を要求する規約がある場合だけ両方を見る。
- 正当な多重は L8 citation、PLAN `verification_bindings`、fast/slow pair、freeze 伝播、
  doctor lane（残り feature path が 1 件以下）だけである。
- 既存未登録は corrected classifier 下の exact 547 ID と path provenance を one-time 固定する。
  現在値への実行時置換は禁止し、縮小のみ可。
- live loader の missing/stale/new/multiple は 0、ok は true。NEW fixture は red のまま。
- 既存未 citation baseline 89 件は触らない。

## 受入と反例

- 未登録 NEW（`U-OTT-008`）と宣言に無い多重（`U-OTT-014`）は red。
- design 本文の例示 mention だけがある tests-only ID（`U-OTT-021`）は unregistered のまま red。
- L8 / PLAN が全 path を宣言する多重、fast/slow、freeze、doctor lane は green。
- baseline を現在の未登録集合へ置き換える mutation は `U-OTT-020` が kill する。
- L8 宣言済み多重を衝突扱いする mutation は `U-OTT-019` が kill する。
- 既存 green を相殺する別 CI job を追加しない。

## ライフサイクル正本（CI run 34297057974）

`status: draft` は通過用の仮値ではなく、現時点の作業状態そのものである。本 PLAN は未 review・未 merge、
`completion_claim_allowed: false`、`review_evidence: []` であり、終端 status（confirmed / completed / accepted）
や archived ではない。outstanding 集計は artifact progress 色で除外せず、非終端 PLAN を `active_draft` として残す。

実測（HEAD `158dc2eab`、Node v24.15.0）:

- live `computeOutstandingWork` → `decision_count=99`、本 PLAN を含む。blocker=`active_draft`
- committed `docs/governance/generated/outstanding-snapshot.json` → `decision_count=98`、本 PLAN 欠落
- `inspectOutstandingSnapshot` → `G-10: outstanding snapshot missing live plan PLAN-RECOVERY-1669-oracle-id-registration`

snapshot を 98 のまま通すために status を終端へ進めることは禁止する。欠落しているのは snapshot の追従であり、
PLAN のライフサイクルではない。

required path（allowed write exact set 外のため本 slice では編集しない）:

- `docs/governance/generated/outstanding-snapshot.json`
- 正規修復 command: `helix db rebuild`（手書き禁止）
- 編集する場合の scope 追記: Allowed path families と Expected changed paths へ同 path を足す

## 完了境界

targeted tests、plan lint、typecheck、Biome が Node 24 で green であること。
全 CI と独立 review は自己申告しない。outstanding snapshot 追従は上記 required path の別権限で行う。
