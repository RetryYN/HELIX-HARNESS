---
plan_id: PLAN-L7-552-claude-autonomous-permission-mode
title: "PLAN-L7-552 (add-impl): Claude無人レーンのpermission mode正規化"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
completion_claim_allowed: false
entry_signals: ["po_directive:Claudeの自動運用がユーザー許可待ちで停止し得るため緊急確認する"]
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 667
engineering_discipline_required: true
behavior_contract_id: CLAUDE-AUTONOMOUS-PERMISSION-MODE-001
responsibility_owner: runtime-adapter
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "HELIX wrapperがClaude Codeをheadless print modeでexecuteし、Claude Code 2.1.222以降がauto permission modeを提供する"
contract_postconditions: "execute時だけauto modeを明示し、通常repo作業は許可待ちへ落ちず、高影響操作はClaudeのsafety classifierでfail-closeする"
contract_invariants: "bypassPermissions、dangerously-skip-permissions、repo hook無効化を導入せず、dry-run argvとstdin prompt境界を変えない"
contract_failures: "manual default継承による無人停止、またはpermission bypassによる安全境界消失を拒否する"
tdd_red_required: true
red_at: "2026-08-14T03:09:26+09:00"
green_at: "2026-08-14T03:09:27+09:00"
mutation_oracle_evidence: "tests/runtime-adapter.test.ts U-ADAPTER-013がexecute時auto欠落、dry-runへの混入、bypassPermissionsまたはdangerously-skip-permissions混入を反例として検出し、targeted 25 tests green"
complexity_effect: net_neutral
complexity_justification: "既存adapter argvへ固定2 tokenを追加し、新service、state、dependencyを増やさない"
removal_trigger: "Claude Code headless APIが非対話自律modeを安全既定として保証し、明示flagがdeprecatedになった時"
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-ADAPTER-013, test_path: tests/runtime-adapter.test.ts }
backprop_decision: not_required
backprop_decision_reason: "既存FR-L1-42のprovider boundaryと完全自動運用を実装面で正規化し、要求意味を追加・変更しない"
backfill_state: pending_reverse
agent_slots:
  - { role: se, slot_label: "SE — Claude adapter permission argv実装" }
  - { role: qa, slot_label: "QA — auto/bypass両方向oracle" }
  - { role: tl, slot_label: "TL — CLI/VS Code実効設定と独立review収束" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-552-claude-autonomous-permission-mode.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/function-spec.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L7-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/adapter-policy.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/runtime-adapter.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-78-claude-stdin-prompt-dispatch.md
  requires:
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/helix/L8-claude-autonomous-permission-mode-unit-test-design.md
  blocks: [issue:667]
review_evidence: []
---

# Claude無人レーンのpermission mode正規化

`helix claude --execute`がinteractive/manual defaultを継承して許可待ちになる経路を閉じる。Claude Codeの`auto` classifierを明示し、通常のrepo内作業は自律継続、高影響操作は既存soft/hard denyで停止させる。VS Code拡張はuser-level `permissions.defaultMode=auto`を継承し、危険なbypassはmachine/user settingsの双方で無効化する。
