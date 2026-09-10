---
plan_id: PLAN-L7-1110-repository-hygiene-inventory
title: "PLAN-L7-1110: 正本化前のrepository hygiene read-only inventory"
kind: recovery
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-11
updated: 2026-09-11
owner: Codex / TL
github_issue_id: 1110
behavior_contract_id: REPOSITORY-HYGIENE-INVENTORY-001
responsibility_owner: repository-hygiene
engineering_discipline_required: true
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1110 正本化前のrepository hygiene read-only inventory"
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "Issue #1110がread-only inventory要求を既に所有し、本sliceは実装開始前の証拠境界を具体化する。"
no_code_decision: add_code
ddd_modeling_decision: pure_function
complexity_effect: justified_positive
complexity_justification: "削除effectを増やさず、既存証拠面を単一pure analyzerへ結合して回収候補の推測を減らす。"
removal_trigger: "#1110のcanonical inventory projectionが同じfail-close分類をproduction loader、CLI、DB receipt込みで置換した時"
contract_preconditions: "main、worktree、open PR、active writerの証拠面をtyped入力として受け取る"
contract_postconditions: "完全証明されたworktreeだけをreclaim candidateとし、保護対象と証明不能を分離する"
contract_invariants: "削除を実行せず、unknownをgreenへ変換せず、provider名からownerを推測しない"
contract_failures: "detached、shallow、取得不能、cleanliness／reachability不明をunknown_fail_closedへ投影する"
tdd_red_required: true
red_test: "U-RHYG-001〜004を先行追加し、module不在でsuite Redを確認した"
red_at: "2026-09-11T08:20:54+09:00"
green_at: "2026-09-11T08:21:39+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-11T08:26:22+09:00にactive writer保護条件を一時無効化しU-RHYG-002が1 failed／3 passed、08:44:56+09:00にdefault branch保護実装前のU-RHYG-005が1 failed／4 passedとなることを実測した。各条件を修復後にgreenを再確認した。"
parent_design: docs/design/helix/L6-function-design/repository-hygiene-inventory.md
pair_artifact: docs/test-design/helix/L8-repository-hygiene-inventory-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/repository-hygiene-inventory.md, oracle_id: U-RHYG-001, test_path: tests/repository-hygiene-inventory.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/repository-hygiene-inventory.md, oracle_id: U-RHYG-002, test_path: tests/repository-hygiene-inventory.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/repository-hygiene-inventory.md, oracle_id: U-RHYG-003, test_path: tests/repository-hygiene-inventory.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/repository-hygiene-inventory.md, oracle_id: U-RHYG-004, test_path: tests/repository-hygiene-inventory.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/repository-hygiene-inventory.md, oracle_id: U-RHYG-005, test_path: tests/repository-hygiene-inventory.test.ts }
generates:
  - { artifact_path: .helix/evidence/review-1731/vitest-targeted.json, artifact_type: json_config }
  - { artifact_path: docs/plans/PLAN-L7-1110-repository-hygiene-inventory.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/repository-hygiene-inventory.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-repository-hygiene-inventory-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/audit/repository-hygiene.ts, artifact_type: source_module }
  - { artifact_path: tests/repository-hygiene-inventory.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: PLAN-L7-690-branch-audit-delete-candidate-safety
  requires:
    - docs/plans/PLAN-L7-690-branch-audit-delete-candidate-safety.md
  blocks: []
  references:
    - "issue:1110"
    - "issue:631"
---

# PLAN-L7-1110: リポジトリ衛生状態の読取専用棚卸し

## 今回の範囲

Issue #1110の実装順Aのうち、worktree回収可否をPR／writer証拠と結合するpure analyzerを追加する。
production loader、CLI、DB receipt、overlap graph、cleanup applyは後続sliceで接続する。

## 受入条件

- [x] Red-firstでmodule不在を観測する。
- [x] clean／main到達／unownedだけを候補にする。
- [x] dirty／未到達／open PR／active writerを保護する。
- [x] detached／shallow／取得不能／unknownをfail-closeする。
- [x] canonical default branchを回収候補にしない。
- [ ] PLAN lint、関連回帰、独立review、CI、main read-afterを完了する。
