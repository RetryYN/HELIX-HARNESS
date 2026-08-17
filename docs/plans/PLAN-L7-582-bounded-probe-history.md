---
plan_id: PLAN-L7-582-bounded-probe-history
title: "PLAN-L7-582 (impl): bounded probe実行とappend-only測定履歴を実装する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:0ff1f90cd2e329b52f784ada54c18d06a79253488664290290327b81bef17f47
  target_axis: specialist_capability
  target_id: NFR_MEASUREMENT
entry_signals: ["po_directive:Issue #221 bounded probe/history"]
created: 2026-08-17
updated: 2026-08-17
owner: Codex / TL
github_issue_id: 221
behavior_contract_id: BOUNDED-PROBE-HISTORY-001
responsibility_owner: measurement-harness
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: aggregate
contract_preconditions: "Issue #219のNFR registryとIssue #220のpure evaluatorが受理済みであり、probe ID、registry digest、current HEAD、dataset digestを実行前に取得できる"
contract_postconditions: "allowlist probeだけをresource bound内で実行し、plan／result／event digestとcurrent headをappend-only historyへ一つのSQLite transactionで記録し、再送を同一bytesだけ冪等に扱う"
contract_invariants: "任意command、shell、network、credential、raw output、推測されたHEAD／datasetを受理しない。不足sample、timeout、failureはgreenへ縮退させない"
contract_failures: "schema、allowlist、registry／HEAD／dataset不一致、deadline／CPU／memory／output超過、sample不足、history head競合、同一run payload conflictをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "隔離worktreeでcontract、SQLite schema、実行port、oracleを同一atomic sliceとして追加し、偽のRed時刻を記録せず、targeted test・schema authority・typecheck・Biomeで受入を閉じる"
complexity_effect: justified_positive
complexity_justification: "実測履歴のrun/event/headを分離してappend-only chainを保持するが、任意command adapterや別DBを追加せず既存Node SQLite boundaryへ束ねる"
removal_trigger: "measurement history schema major version更新時にversioned successorへ移管する"
parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md
pair_artifact: docs/test-design/helix/L8-bounded-probe-history-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md, oracle_id: U-PH-001, test_path: tests/bounded-probe-history.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md, oracle_id: U-PH-002, test_path: tests/bounded-probe-history.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md, oracle_id: U-PH-003, test_path: tests/bounded-probe-history.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md, oracle_id: U-PH-004, test_path: tests/bounded-probe-history.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md, oracle_id: U-PH-005, test_path: tests/bounded-probe-history.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — bounded probe portとhistory store" }
  - { role: qa, slot_label: "QA — resource／chain／conflict negative oracle" }
  - { role: tl, slot_label: "TL — #219／#220境界とcurrent-head admission" }
generates:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/plans/PLAN-L7-582-bounded-probe-history.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/bounded-probe-history.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/bounded-probe-history.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/bounded-probe-history.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-bounded-probe-history-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-bounded-probe-history-system-test-design.md, artifact_type: test_design }
  - { artifact_path: src/measurement/bounded-probe-history.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-evaluation.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/migration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/schema-authority.ts, artifact_type: source_module }
  - { artifact_path: tests/bounded-probe-history.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-550-nfr-typed-registry-quality-taxonomy.md
    - docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md
  references:
    - docs/plans/PLAN-L7-581-github-workflow-identity-migration-bundle-admission.md
  blocks:
    - issue:193
    - issue:188
---

# bounded probe実行と測定履歴

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | L4〜L6で実行・保存境界を固定 | #219／#220との責務重複0、任意commandなし |
| 2 | allowlist portとresource admissionを実装 | U-PH-001〜003 green |
| 3 | SQLite append-only event／head／replayを実装 | U-PH-004〜005、schema authority green |
| 4 | L8／L9、mutation、current-head CI、Claude exact-HEAD review | blocker 0、completion_claim_allowed=trueへ遷移可能 |

## 責務境界

NFRの意味・threshold・freshness判定は#219／#220を再実装しない。本PLANは、受理済みdeclarationへ
束縛されたprobeを bounded に実行し、current HEAD・dataset digest・runner・resource boundsを
receiptへ残し、metric eventをappend-onlyで保存する。#188はこの履歴をconsumerとして利用し、
独自のmeasurement taxonomyやthreshold evaluatorを追加しない。

不足sample、timeout、probe failure、resource超過はunknownまたはfailedとして保存し、成功へ丸めない。
---
