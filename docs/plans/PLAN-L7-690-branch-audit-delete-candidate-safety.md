---
plan_id: PLAN-L7-690-branch-audit-delete-candidate-safety
title: "PLAN-L7-690: branch auditの削除候補判定をmain到達性とworktree非占有へ束縛する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1110 Branch Inventory／Convergence Auditのread-only安全slice"
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1110
behavior_contract_id: BRANCH-AUDIT-DELETE-SAFETY-001
responsibility_owner: branch-audit
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "Issue #1110がbranch lifecycle監査の要求・受入条件を既に所有し、本sliceは既存read-only branch auditの危険なdelete-candidate判定をその要求へ追従させる内部是正であるため、上位要求の追加変更は不要。"
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "local branch refs、canonical main ref、履歴完全性、全worktreeのnamed branch占有をread-onlyで取得する"
contract_postconditions: "delete-candidateは完全履歴上でcanonical mainへ到達し、かつ全worktreeで非占有のlocal branchだけへ限定される"
contract_invariants: "branch／worktree／remote refを削除せず、provider名からownerやworkflowを推測せず、#631のcleanup apply責務を侵食しない"
contract_failures: "main ref取得不能、shallow history、goneだがmain未到達、worktree占有をsilent skipまたは削除候補へ投影しない"
tdd_red_required: true
red_test: "U-BRAS-002／004／005／006／007／008を先行追加し、旧gone即削除・HEAD基準merge・worktree未検査実装で6 tests redを確認する"
red_at: "2026-08-28T01:12:14+09:00"
green_at: "2026-08-28T01:15:51+09:00"
mutation_oracle_evidence: "実装前Redに加え、2026-08-28T01:19:59+09:00にgone-unmergedをdelete-candidateへ変異してU-BRAS-002が1 failed、01:20:18+09:00にworktree占有guardを除去してU-BRAS-004が1 failed、01:20:30+09:00にresult.okをtrue固定してU-BRAS-005／006が2 failedとなることを個別実測した。全変異をapply_patchで復元し、01:20:40+09:00にbranch audit関連10 testsがgreenとなった。"
complexity_effect: justified_positive
complexity_justification: "既存pure analyzerへmain authorityとworktree occupancyを明示入力し、削除実行や別inventory engineを増やさず危険な推測だけをfail-closeへ置換する。"
removal_trigger: "#1110のtyped lifecycle inventoryが本read-only判定を同等以上のmain／worktree証拠付きで置換し、helix branch auditのconsumer移行が完了した時"
parent_design: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md
pair_artifact: docs/test-design/helix/L8-branch-audit-delete-candidate-safety-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md, oracle_id: U-BRAS-001, test_path: tests/branch-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md, oracle_id: U-BRAS-002, test_path: tests/branch-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md, oracle_id: U-BRAS-003, test_path: tests/branch-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md, oracle_id: U-BRAS-004, test_path: tests/branch-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md, oracle_id: U-BRAS-005, test_path: tests/branch-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md, oracle_id: U-BRAS-006, test_path: tests/branch-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md, oracle_id: U-BRAS-007, test_path: tests/branch-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md, oracle_id: U-BRAS-008, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md, oracle_id: U-BRAS-009, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md, oracle_id: U-BRAS-010, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
refines:
  - PLAN-L7-138-quality-branch-audit
agent_slots:
  - role: aim
    slot_label: "AIM — #1110と#631の監査／削除責務境界を確認"
  - role: se
    slot_label: "SE — main到達性とworktree占有のpure判定"
  - role: qa
    slot_label: "QA — gone／shallow／missing main／worktree反例"
  - role: tl
    slot_label: "TL — fail-close優先順位と原子scope"
generates:
  - artifact_path: docs/plans/PLAN-L7-690-branch-audit-delete-candidate-safety.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L8-branch-audit-delete-candidate-safety-unit-test-design.md
    artifact_type: test_design
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/audit/branches.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/branch-audit.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: PLAN-L7-138-quality-branch-audit
  requires:
    - docs/plans/PLAN-L7-138-quality-branch-audit.md
  blocks: []
  references:
    - "issue:1110"
    - "issue:631"
---

# PLAN-L7-690: branch auditのdelete-candidate安全化

## 目的

既存`helix branch audit`がupstreamの`[gone]`だけを根拠にlocal branchを`delete-candidate`へ
分類し、merge判定もcurrent `HEAD`を基準にしている欠陥を是正する。削除候補はcanonical mainへの
到達性と全worktree非占有が証明できた場合だけに限定し、証明不能はtyped `review`へ閉じる。

## スコープ

- canonical mainは`origin/main`、存在しない場合だけlocal `main`へ解決する。
- `git branch --merged`はcurrent `HEAD`ではなく解決済みmain refを基準にする。
- `git worktree list --porcelain`からnamed branchを収集し、detached worktreeをownerと推測しない。
- worktree占有branchはmerged／goneでも`keep`とする。
- `[gone]`かつmain未到達は`review / gone-unmerged`とする。
- main ref取得不能とshallow historyは全非保護候補をtyped `review`へ閉じ、CLIをnon-zeroにする。
- JSON receiptへmain ref、解決成否、履歴完全性、branch別worktree占有を投影する。

## 受入条件

- [ ] `[gone]`だけで`delete-candidate`にならない。
- [ ] canonical mainへmerge済みかつworktree非占有のbranchだけを削除候補へ分類する。
- [ ] current／protected／worktree占有branchは常に`keep`となる。
- [ ] missing main ref／shallow historyは`ok=false`かつdelete candidate 0へfail-closeする。
- [ ] detached worktreeはnamed branchとして誤認しない。
- [ ] CLI JSONとtextがauthorityを表示し、fail-close時はexit 1となる。
- [ ] branch、worktree、remote refを一切変更・削除しない。
- [ ] targeted、typecheck、Biome、PLAN lint、current-head CI、Claude独立reviewを完了する。

## 非対象

GitHub PR／Issue／assignment／lease join、remote branch inventory、overlap graph、behind閾値、scheduled
full auditは#1110後続sliceで扱う。branch／worktree削除とcleanup applyは#631のままとし、本sliceへ混載しない。
