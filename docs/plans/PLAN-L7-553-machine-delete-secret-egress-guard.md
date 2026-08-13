---
plan_id: PLAN-L7-553-machine-delete-secret-egress-guard
title: "PLAN-L7-553 (add-design/add-impl): 機械削除・secret egress強制境界"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
completion_claim_allowed: false
entry_signals: ["po_directive:2026-08-14 Issue #665 IDE自動運用のhost破壊・secret egressをfail-closeする"]
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 665
engineering_discipline_required: true
behavior_contract_id: MACHINE-DELETE-SECRET-EGRESS-GUARD-001
responsibility_owner: runtime-safety-boundary
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "hook payload、repo root、Git egress baseまたは明示的な検証失敗が得られる"
contract_postconditions: "静的単一file以外の機械削除とsecret write/Git egressが実行前に値非表示でblockされる"
contract_invariants: "safe単一file削除と通常read/build/testを通し、hookだけで任意コードの完全sandboxを主張しない"
contract_failures: "parse/script/Git scope不能、dynamic/recursive/repo外削除、secret marker、--no-verifyをfail-closeする"
tdd_red_required: true
red_at: "2026-08-14T03:32:43+09:00"
green_at: "2026-08-14T03:42:30+09:00"
mutation_oracle_evidence: "safe fence、dynamic/recursive/interpreter/raw-device、write/add/commit/push secretの反例をtests/machine-safety-guard.test.tsとtests/secret-egress-hook.test.tsで固定"
complexity_effect: justified_positive
complexity_justification: "dev/CLI/consumerが共有する二つのclassifier追加で、既存の運用規律だけだったCritical境界を機械強制する"
removal_trigger: "OS sandboxがdirect IDE shellを含む全runtimeへ強制され、同じpre-execution/egress oracleを代替した時"
parent_design: docs/design/harness/L6-function-design/destructive-command-guard.md
pair_artifact: docs/test-design/harness/L8-destructive-command-guard.md
backfill_state: complete
inventory_evidence:
  - { source: "src/runtime/git-command-guard.ts", checked_at: "2026-08-14", scope: "destructive Git taxonomy", decision: "reuse", rejection_reason: "general filesystem/secret egressは非責務" }
  - { source: "src/lint/secret-scan.ts", checked_at: "2026-08-14", scope: "credential marker", decision: "reuse", rejection_reason: "docs-only loaderとannotated example allowはegress境界へ流用しない" }
  - { source: "src/runtime/worker-isolation-broker.ts", checked_at: "2026-08-14", scope: "sandbox second boundary", decision: "reuse", rejection_reason: "direct IDE shellへ未配線" }
  - { source: "git@github.com:RetryYN/ai-dev-kit-vscode.git", checked_at: "2026-08-14", scope: "旧HELIX destructive/secret guard inventory", decision: "reject", rejection_reason: "現行Node hookへbulk importせずbehavior contractだけ再実装" }
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/destructive-command-guard.md, oracle_id: U-SAFETY-001, test_path: tests/machine-safety-guard.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/destructive-command-guard.md, oracle_id: U-SAFETY-005, test_path: tests/secret-egress-hook.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/destructive-command-guard.md, oracle_id: U-SAFETY-006, test_path: tests/secret-egress-hook.test.ts }
generates:
  - { artifact_path: src/runtime/machine-safety-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/machine-safety-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/secret-egress-hook.ts, artifact_type: source_module }
  - { artifact_path: tests/machine-safety-guard.test.ts, artifact_type: test_code }
  - { artifact_path: tests/secret-egress-hook.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/harness/L6-function-design/destructive-command-guard.md
  requires:
    - docs/plans/PLAN-L7-443-destructive-command-guard-transaction.md
    - docs/plans/PLAN-L7-370-security-credential-egress-guard.md
  blocks: [issue:665, issue:626]
agent_slots:
  - { role: se, slot_label: "SE — machine safety/secret egress classifier実装" }
  - { role: qa, slot_label: "QA — safe fence、history blob、adapter parity敵対検証" }
  - { role: tl, slot_label: "TL — L3 backpropとsandbox限界の判断" }
review_evidence: []
---

# 機械削除・secret egress強制境界

Issue #665の要求を既存HR-FR-P8-03、HR-NFR-P8-01/03、HR-NFR-AC-01/02の実行境界へ降ろし、
direct IDE shellの事故を運用規律ではなくPreToolUseで止める。新規L3要件の追加は#669で
脅威面全体を分解してから正規Forward routeへ送る。Cursor等hook非対応runtimeは#626でsandbox wrapperへ
接続するまでhost直接自動実行をsafeと扱わない。
