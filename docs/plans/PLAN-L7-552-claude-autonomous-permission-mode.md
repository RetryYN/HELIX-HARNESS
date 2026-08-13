---
plan_id: PLAN-L7-552-claude-autonomous-permission-mode
title: "PLAN-L7-552 (add-impl): Claude無人レーンのpermission mode正規化"
kind: add-impl
layer: L7
drive: agent
status: confirmed
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
mutation_oracle_evidence: "tests/runtime-adapter.test.ts U-ADAPTER-013でCLAUDE_PERMISSION_ARGSのautoをbypassPermissionsへ一時mutationし、禁止argv検出で1 test failedとなるkillを2026-08-14に実測した"
complexity_effect: net_neutral
complexity_justification: "既存adapter argvへ固定2 tokenを追加し、新service、state、dependencyを増やさない"
removal_trigger: "Claude Code headless APIが非対話自律modeを安全既定として保証し、明示flagがdeprecatedになった時"
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/helix/L8-claude-autonomous-permission-mode-unit-test-design.md
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
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/plans/PLAN-L7-552-claude-autonomous-permission-mode.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/claude-autonomous-permission-mode.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-claude-autonomous-permission-mode-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/adapter-policy.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/runtime-adapter.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-78-claude-stdin-prompt-dispatch.md
  requires:
    - docs/design/helix/L5-detail/claude-autonomous-permission-mode.md
    - docs/test-design/helix/L8-claude-autonomous-permission-mode-unit-test-design.md
  blocks: [issue:667]
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-13T23:22:00Z"
    tests_green_at: "2026-08-13T23:20:40Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: claude:claude-opus-5
    scope: "PR #664 current HEAD dbae587a2cd3401c4494e82d856e81b688afdcfeを独立検証し、design catalog分類、execute限定auto mode、dry-run非混入、permission bypass非導入を確認。blocker 0。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/runtime-adapter.test.ts tests/design-coverage.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-13T23:20:40Z"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:9cfdd331e6514cabdaec937c7900c96c4e831b4ba9f618109de6137939c4849a"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-13T23:22:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-13T23:22:00Z"
    evidence_digest: "sha256:38a5a5c94f03e6995ab12911c53b62191690d341e064537c8582f8da2fd40f62"
  entries: []
---

# Claude無人レーンのpermission mode正規化

`helix claude --execute`がinteractive/manual defaultを継承して許可待ちになる経路を閉じる。Claude Codeの`auto` classifierを明示し、通常のrepo内作業は自律継続、高影響操作は既存soft/hard denyで停止させる。VS Code拡張はuser-level `permissions.defaultMode=auto`を継承し、危険なbypassはmachine/user settingsの双方で無効化する。
