---
plan_id: PLAN-L7-675-issue-dependency-cross-contract-audit
title: "PLAN-L7-675 (add-impl): Issue hierarchyとdependency contractをexact照合する"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #634のcurrent-main read-afterでhierarchy blocked_byとmachine depends_onの乖離を検出した"
created: 2026-08-26
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 634
behavior_contract_id: ISSUE-DEPENDENCY-CROSS-CONTRACT-001
responsibility_owner: github-issue-hierarchy
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "Issue hierarchy contractとhelix-issue-dependency.v1が別projectionとして取得できる"
contract_postconditions: "relationを宣言するcurrent hierarchy Issueでdependency block欠落とblocks/blocked_by集合差をstable findingにする"
contract_invariants: "parent/childだけのIssueやhistorical proseをdependency採用と推測せず、PR focusとrepository-wide auditの境界を維持する"
contract_failures: "dependency contract欠落、blocked_by/depends_on不一致、blocks集合不一致を個別reasonでfail-closeする"
tdd_red_required: true
red_at: "2026-08-26T01:25:00+09:00"
green_at: "2026-08-26T01:26:46+09:00"
mutation_oracle_evidence: "2026-08-26T01:27:13+09:00にgovernedHierarchyNodes filterを常にfalseへ変異し、U-IHIER-012がexpected false／received trueで1 failed・11 passedとなり、dependency block欠落とhierarchy/dependency集合差を黙ってskipする退行をkillした。filter復元後12 tests green、typecheck、Biome greenを再確認した。"
complexity_effect: net_negative
complexity_justification: "二つの既存projection間にpure比較を一つ追加し、黙ってskipされる依存graphを除去する"
removal_trigger: "hierarchyとdependencyが単一versioned typed graphへ統合された時"
parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-012, test_path: tests/issue-hierarchy.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-675-issue-dependency-cross-contract-audit.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/runtime/issue-hierarchy.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-hierarchy.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: PLAN-L7-556-issue-dependency-doctor
  requires:
    - docs/plans/PLAN-L7-556-issue-dependency-doctor.md
  blocks: [issue:635]
  references:
    - "issue:634"
agent_slots:
  - { role: se, slot_label: "SE — hierarchy/dependency pure cross audit" }
  - { role: qa, slot_label: "QA — missing/mismatch mutation oracle" }
  - { role: tl, slot_label: "TL — adoption boundaryとrepository-wide wiring" }
---

# Issue dependency cross-contract audit

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | hierarchy relationとdependency projectionの差をRed化 | 欠落・両方向集合差が既存auditを通過することを実測 |
| 2 | pure cross-contract auditを実装 | stable findingを個別に返す |
| 3 | live CLIへ接続 | PR focusとscheduled full auditを維持 |
| 4 | live Issueを依存順に是正 | repository-wide findingsが0になる |
| 5 | CI・Claude review・main read-after | #634のcompletion claimを再証明 |

relationを持たないhierarchy Issueへdependency blockを一律要求しない。`blocks`または`blocked_by`が非空の
current active Issueだけをcross-contract対象とし、legacy／historical集合は明示的移行なしにcurrent greenへ使わない。

## live Red baseline

2026-08-26にGitHub repository-wide auditを実行し、hierarchy relationを持つ100 Issueに対して114 findingsを取得した。
内訳はdependency block欠落81、`blocks`集合差5、`blocked_by`／`depends_on`集合差6、既存dependency非対称8、
target欠落10、その他PLAN binding／malformed contract 4である。#204本線では#228／#229／#231／#243の集合差と、
#235／#246／#248／#253／#322のcontract欠落を実測した。findingをallowlistで隠さず、typed migration inventoryへ
固定して依存順にlive Issueを是正する。
