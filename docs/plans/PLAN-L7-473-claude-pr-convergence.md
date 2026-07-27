---
plan_id: PLAN-L7-473-claude-pr-convergence
title: "PLAN-L7-473 (impl): Codex PRからClaude Code収束reviewへの自動接続"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-27 ClaudeCodeへの自動PR化が完了するまでG1/G3承認を保留する"
created: 2026-07-27
updated: 2026-07-27
owner: Codex / TL
github_issue_id: 149
engineering_discipline_required: true
behavior_contract_id: U-CPRCONV-001
responsibility_owner: claude-pr-convergence
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "Codexがcurrent branchからdraft PRを作成し、GitHub PR URL、current HEAD、base branchを取得できる"
contract_postconditions: "同一PRの最新HEAD review requestだけがVS Code Claudeへ配送され、Claude receipt、同一HEAD CI/DB、blocker 0が揃った明示mergeだけをwrapperが許可する"
contract_invariants: "Claude二レーン・daemon・新DB schema・native auto-mergeを追加せず、非blockerはIssueへ分離し、PR作成者とreviewer runtimeを分離する"
contract_failures: "通知失敗はPRをdraftのままfail、旧HEAD・CI red・DB未収束・blocker・receipt改変・直接gh pr mergeをfail-closeする"
tdd_red_required: true
red_at: "2026-07-27T08:20:00+09:00"
green_at: "2026-07-27T08:51:00+09:00"
mutation_oracle_evidence: "tests/claude-pr-convergence.test.ts の旧HEAD、別HEAD CI、CI red、closed PR、blocker、未収束DB、改変receipt反例と tests/git-command-guard.test.ts のdirect gh pr merge反例がseeded mutationをkilledし、targeted 71 tests green"
complexity_effect: justified_positive
complexity_justification: "既存pr-create、Git共通dir wake、git-command-guardを接続するだけとし、新service・dependency・CI job・DB schemaを増やさず手動チャット貼付けと15分pollを削除する"
removal_trigger: "Claude CodeがGitHub PR event mailbox、current HEAD supersede、review ACK、receipt-bound mergeを公式提供した時点で本adapterを削除する"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-CPRCONV-001, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-MEMWAKE-001, test_path: tests/claude-memory-wake.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-GITGUARD-010, test_path: tests/git-command-guard.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-ICLOSE-004, test_path: tests/goal-evidence-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-CPRCONV-002, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-CPRCONV-003, test_path: tests/github-merge-readiness.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — pr-create、wake、receipt、merge admission接続"
  - role: qa
    slot_label: "QA — stale HEAD、CI red、blocker、receipt改変、直接merge反例"
  - role: tl
    slot_label: "TL — Claude VS Code実機E2Eと収束review"
generates:
  - { artifact_path: docs/plans/PLAN-L7-473-claude-pr-convergence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/orchestration-memory.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/helix-objective-evidence-audit.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/claude-memory-wake.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/git-command-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/git-command-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/audit/github-merge-readiness.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/claude-memory-wake.test.ts, artifact_type: test_code }
  - { artifact_path: tests/git-command-guard.test.ts, artifact_type: test_code }
  - { artifact_path: tests/goal-evidence-audit.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-merge-readiness.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
review_evidence: []
dependencies:
  parent: docs/plans/PLAN-L7-469-claude-memory-async-wake.md
  requires:
    - docs/design/helix/L6-function-design/orchestration-memory.md
  references:
    - docs/test-design/harness/L8-unit-test-design.md
  blocks:
    - G1/G3-PO-APPROVAL
---

# PLAN-L7-473: Codex PRからClaude Code収束reviewへの自動接続

## 目的

Codexがdraft PRを作成した後の手動チャット貼付け、15分poll、古い通知の順次消化を廃止し、同一PRの
current HEADをClaude Code収束reviewへ自動配送する。Claudeはblockerだけを現PRへ返し、非blockerをIssueへ
分離する。mergeはcurrent HEADに束縛したClaude receipt、CI、DB convergenceが揃った場合だけ専用wrapperから
明示実行する。

## 非対象

- Claudeを二レーンへ増やす。
- 常駐daemon、GitHub webhook server、新CI job、新DB schemaを追加する。
- GitHub native auto-mergeを有効化する。
- G1/G3要件集合、L4以降の設計、PR #147またはPR #115を変更する。

## 完了条件

- `helix github pr-create --apply --claude-converge`成功時にClaude review requestが自動発行される。
- `helix github pr-notify`がpush後の新HEADを同一PR keyでsupersedeできる。
- Stop hookはPR requestを通常通知より優先し、同一PRの旧requestを配送しない。
- `helix github pr-review-receipt`がClaude/current HEAD/CI/DB/commentをimmutable ACKへ束縛する。
- `helix github pr-merge-reviewed`が旧HEAD、CI red、DB未収束、blocker、改変receiptを拒否する。
- direct `gh pr merge`はClaude/Codex hookで拒否される。
- targeted、typecheck、full CI、VS Code Claude実機E2E、独立reviewがgreenになる。
