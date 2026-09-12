---
plan_id: PLAN-L4-77-cursor-cloud-independent-execution-boundary
title: "PLAN-L4-77 (add-design): Cursor Cloud第三者実行レーンの独立境界"
kind: add-design
layer: L4
drive: agent
status: confirmed
github_issue_id: 1293
canonical_vmodel: L1-L12
completion_claim_allowed: true
runtime_activation_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:第三者レーンを親Issueの完了に依存させず完成可能にする"
created: 2026-09-12
updated: 2026-09-12
source_head: 2677f0ee8bfdd7fb4e2e4b6e59fc9c2037401567
parent_design: docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md
pair_artifact: docs/test-design/helix/L9-cursor-cloud-independent-execution-boundary.md
engineering_discipline_required: true
behavior_contract_id: CURSOR-CLOUD-INDEPENDENT-EXECUTION-001
responsibility_owner: cursor-cloud-execution
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: reuse
ddd_modeling_decision: none
contract_preconditions: "3L requirement/IRがmainへ成立し、Issue #1293が親Feature完了と独立に着手可能である"
contract_postconditions: "assignmentから独立review返却までをL4↔L9の一対へ固定し、後続L5/L8・L6/L7の入力にする"
contract_invariants: "Issue関係を着手依存へ読み替えず、別queue／DB／Assignment lifecycle／承認engineを作らない"
contract_failures: "必要条件が欠けるassignmentだけをfail-closeし、他レーンや親Feature全体へ停止を伝播させない"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。本sliceはL4/L9 pairを固定し、実行oracleとRed/GreenはL5/L8以降の義務とする"
complexity_effect: net_negative
complexity_justification: "親Issue完了への偽依存を除き、既存のassignment・isolation・review portへ収束する"
removal_trigger: "後継第三者実行境界へ全consumerが証拠付き移管された時"
review_evidence:
  - reviewer: "Claude independent reviewer / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-09-12T16:52:52Z"
    tests_green_at: "2026-09-12T16:52:52Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: fe061343-6172-4db5-8837-ef9aa5fd3af6
    reviewed_head_sha: dfee927956a425973f3c77cccb656c854e3d15f0
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1775#issuecomment-5647334169"
    ci_evidence_generation: "run:34706300546:attempt:1:failure"
    receipt_id: "claude-pr-review:RetryYN/HELIX-HARNESS#1775:dfee927956a425973f3c77cccb656c854e3d15f0:claude:run:34706300546:attempt:1:failure"
    receipt_digest: "sha256:9a1a04c31dea959ada740415fed94e5360e867e20d0259aee824b577b818050d"
    scope: "exact HEAD dfee92795を独立監査しblocker 0。L4 exact trace 11件、U-CPA-DESIGN-006、draft outstanding projection、reviewer model window、PR body scope manifestを再実測した。CI failureはdraftを検出するPOST_MERGE_PLANだけで、confirmed化後のfresh CIをmerge admissionとする。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/cursor-cloud-independent-execution-boundary-design.test.ts tests/cursor-cloud-environment.test.ts tests/cursor-cloud-run-authority.test.ts tests/outstanding.test.ts tests/review-evidence.test.ts tests/review-evidence-projection-parity.test.ts tests/left-arm-carry-log.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-09-12T16:52:52Z", evidence_path: tests/cursor-cloud-independent-execution-boundary-design.test.ts, output_digest: "sha256:9a1a04c31dea959ada740415fed94e5360e867e20d0259aee824b577b818050d", result: "reviewer(claude)がclean worktreeで7 files / 151 tests green。receipt 5647334169。" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-09-12T16:52:52Z"
  review_binding:
    reviewer: "Claude independent reviewer / claude-opus-5"
    reviewed_at: "2026-09-12T16:52:52Z"
    evidence_digest: "sha256:1683713338ec35ae3cb33a43c4a5a7b6bd103e60451c25bd8a26b93bce908cde"
  entries: []
agent_slots:
  - { role: se, slot_label: "SE — 第三者実行境界と既存port再利用" }
  - { role: qa, slot_label: "QA — L9反例、独立review、非完了境界" }
  - { role: tl, slot_label: "TL — 親子関係と着手依存の分離" }
dependencies:
  parent: docs/plans/PLAN-L3-78-three-lane-cloud-governance-authority.md
  requires:
    - docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md
    - docs/test-design/helix/three-lane-cloud-governance-acceptance.md
  references:
    - issue:1293
    - issue:1358
    - issue:1362
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L4-77-cursor-cloud-independent-execution-boundary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/cursor-cloud-independent-execution-boundary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-cursor-cloud-independent-execution-boundary.md, artifact_type: test_design }
  - { artifact_path: tests/cursor-cloud-independent-execution-boundary-design.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/governance/candidates/README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
---

# Cursor Cloud第三者実行レーンのL4↔L9 Forward

## 位置付けと独立着手

本PLANはIssue #1293だけに束縛したL4設計sliceである。Issue #1358は上位の責務・要求対応先だが、
その完了を本sliceの着手条件にしない。#1362のbilling-cycle E2E、Notification Fabric、Bench、
Phase Bの#860全体完成も、本sliceの設計・後続実装を一括停止させない。

`PLAN-L4-77-cursor-cloud-independent-execution-boundary`は、origin/main
`2677f0ee8bfdd7fb4e2e4b6e59fc9c2037401567`、remote/open refs、GitHub code searchで実PLAN衝突0を
確認し、Issue #1293の記録へ束縛して予約した。L7専用reservationをL4へ偽装せず、別allocatorも増設しない。

上位authorityはconfirmedな`PLAN-L3-78-three-lane-cloud-governance-authority`と、mainへ収載済みの
three-lane Requirement IRである。L4/L9はcanonical pathへ一度だけ移し、旧candidate 3文書は残さない。
このpromotionはruntime有効化ではない。L5/L8 schema、L6/L7 TDD、独立review、実provider検証が
成立するまで、外部副作用の許可を発行しない。

## 最小成果物と除外

[L4境界](../design/helix/L4-basic-design/cursor-cloud-independent-execution-boundary.md)と
[L9統合oracle](../test-design/helix/L9-cursor-cloud-independent-execution-boundary.md)の1対だけを用意する。
3L-FR-005「HELIX policyの強制」と、その3L-R-12〜14／23〜25が定める
policy束縛・cloud強制・外部read-after・single writer・起動前identity・段階移行を主対象とし、
3L-FR-002のscope／authority／review返却、3L-FR-003の予算入力を接続条件として参照する。
8 Feature全体、#860全体、monthly budget engine、Bench、7日／cycle実証を所有しない。
#1643／#1634／#1650のCI・独立検収・統合、親の正本移管検証も対象外とする。

no-code-firstはreuseで止める。対案のCursor専用queue／DB／承認engineは既存責務を重複させるため採らない。
最初の限定実案件は1件で検証するが、正本のWIP=2や条件付きburst policyを変更する意味ではない。

## 進行と検証

| 段階 | 本sliceで用意するもの | 未成立のまま残す条件 |
|---|---|---|
| L4/L9 | 再利用契約、不足port、failure recovery、Given/When/Then | 独立設計review、pair-freeze |
| L5/L8 | 後続への入力境界のみ | 具体的な外部強制機構、型・失敗コード・時計・冪等性・永続化先・receipt真正性の契約 |
| L6/L7 | 実装しない | Red→最小Green→Refactor、競合／遅延writeの実consumer検証 |

この文書変更はfrontmatter、pair相互参照、既存path／symbol、L9行の構造、禁止語彙、
変更pathの限定、`git diff --check`、`helix guard commitlint` のsubjectとcommit rangeで検証する。
構造greenをPLAN lint、pair-freeze、runtime oracle、実cloud成功、独立検収のgreenへ昇格しない。
実行するL9 oracleはこの時点で0件である。

#860はAssignment／lease authorityとPhase Aに必要な最小の原子的排他primitiveを所有する。
#1293はそのprimitiveをCursor Cloudの実consumerへ接続し、最初の限定実案件でE2E実証する。
Phase Bの汎用lease/fenceも#860のowner範囲として維持する。Phase Aでも原子的排他・遅延write不能・
予算/TTL・前後照合が必須であり、不足条件のある対象だけを起動不可とする。
課金・credential利用・外部API前提の確定は既存の人間確認境界を維持し、本sliceは実行許可を発行しない。
