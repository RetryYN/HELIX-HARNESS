---
plan_id: PLAN-L7-655-distribution-devos-runtime-identity
title: "PLAN-L7-655 (impl): DevOS distribution runtime identityを収束する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: VERSION_UP
entry_signals:
  - "po_directive:Issue #944でruntime／CLI／setupのDevOS current outputを収束する"
created: 2026-08-23
updated: 2026-08-23
owner: Codex / TL
github_issue_id: 944
behavior_contract_id: DISTRIBUTION-DEVOS-RUNTIME-IDENTITY-001
responsibility_owner: distribution-repository-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L3-65とPLAN-L7-654がDevOS requirements／instruction authorityを正本化している"
contract_postconditions: "runtime／CLI／setup／doctor／consumer artifactがDevOS current identityとtyped compatibility receiptを返す"
contract_invariants: "旧identityをcurrent outputへ再出力せず、tag／publish／remote mutationを実行しない"
contract_failures: "ambiguous identity、旧template混入、current fieldの旧identity差戻しをfail-closeする"
tdd_red_required: true
red_at: "2026-08-22T16:22:31Z"
green_at: "2026-08-22T16:37:05Z"
mutation_oracle_evidence: "2026-08-22T16:36:50Zにsrc/setup/distribution-identity.tsのcurrent repository／remote定数をDevOSから旧OSへ一時退行させ、tests/distribution-identity.test.tsのU-DISTID-002がexpected legacy_compatibility／converted_from付き、received current／converted_from nullで1 failed・3 passedとなりmutationをkillした。DevOSへ復元後の2026-08-22T16:37:05Zに同4 testsがexit 0、git diffでsource復元を確認した。"
complexity_effect: net_negative
complexity_justification: "散在する配布identity literalをtyped value objectと一方向adapterへ集約する"
removal_trigger: "旧OS redirect受理期間が終了しcompatibility trafficとcacheが0になった時"
parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md
pair_artifact: docs/test-design/helix/L8-distribution-devos-runtime-identity-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-001, test_path: tests/distribution-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-002, test_path: tests/distribution-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-003, test_path: tests/distribution-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-004, test_path: tests/distribution-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-005, test_path: tests/update-check.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-006, test_path: tests/setup.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-007, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-008, test_path: tests/doc-consistency.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-009, test_path: tests/github-ops-guard.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-010, test_path: tests/distribution-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-011, test_path: tests/doctor.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-012, test_path: tests/slow/doctor.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-013, test_path: tests/goal-evidence-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, oracle_id: U-DISTID-014, test_path: tests/version-up-readiness.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed identity／runtime projection" }
  - { role: qa, slot_label: "QA — legacy conversion／ambiguous input／output mutation" }
  - { role: tl, slot_label: "TL — requirements authority／#659 approval境界監査" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewer_session_id: "792345fd-722c-4696-85eb-02494ab28d30"
    reviewed_at: "2026-08-22T23:28:34Z"
    tests_green_at: "2026-08-22T23:10:49Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewed_head_sha: 9b862bfb0c2159ced4504e582d97640cf4575e8f
    scope: "PR #946 exact HEAD 9b862bfbをClaude Code Opusがclean detached checkoutでread-only独立reviewした。宣言66 pathと実差分66 pathの一致、DevOS current identity、旧OS input-only compatibility、external非改変、unknown fail-close、U-DISTID mutation 4/4 kill、digest pin一致を確認しblocker 0でapproveした。CI run 32603470581 attempt 2は全回帰・Biome・typecheck・DB rebuildがgreenで、run全体の唯一のfailureは本PLANのreview後confirmを要求するmerged-plan-statusだった。non-blockerのemitter literal複製debtはIssue #952へ分離した。canonical review: https://github.com/RetryYN/HELIX-HARNESS/pull/946#issuecomment-5383150071"
    green_commands:
      - kind: integration_test
        command: "GitHub Actions harness-check impact-ci: vitest run --project fast/slow shards"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-22T23:10:49Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:63618c736aa96047a330236577db73d6a913ded066c0bf9883cafa219b20a173"
        result: "同一HEAD 9b862bfbの全回帰stepがexit 0。run全体は後続doctorのPLAN lifecycle failureのみでfailureのためterminal CI successとは主張しない。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-22T23:28:34Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-22T23:28:34Z"
    evidence_digest: "sha256:4e0a545fa2c4074370ffc6fdb85be35381ed98462b44833c36580f738c7a55d9"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-655-distribution-devos-runtime-identity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-devos-runtime-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/helix-objective-evidence-audit.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/templates/adapter/.claude/CLAUDE.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/be-api.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/be-logic.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/code-reviewer.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/db-schema.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/devops-deploy.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/helix-tl.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/pdm-innovation-manager.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/pdm-marketing-innovation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/pdm-tech-innovation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/pmo-haiku.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/pmo-project-explorer.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/pmo-project-scout.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/pmo-sonnet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/pmo-tech-docs.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/pmo-tech-fork.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/pmo-tech-news.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/qa-test.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/refactor-scout.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/agents/security-audit.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/commands/build.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/commands/code-simplify.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/commands/helix-status.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/commands/helix-test.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/commands/sdd-plan.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/commands/sdd-review.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/commands/ship.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/commands/spec.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/.claude/commands/test.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/AGENTS.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/adapter/CLAUDE.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/github/common/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: src/setup/distribution-identity.ts, artifact_type: source_module }
  - { artifact_path: src/setup/index.ts, artifact_type: source_module }
  - { artifact_path: src/setup/update-check.ts, artifact_type: source_module }
  - { artifact_path: src/setup/templates.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: src/lint/doc-consistency.ts, artifact_type: source_module }
  - { artifact_path: src/lint/objective-evidence-audit.ts, artifact_type: source_module }
  - { artifact_path: tests/distribution-identity.test.ts, artifact_type: test_code }
  - { artifact_path: tests/update-check.test.ts, artifact_type: test_code }
  - { artifact_path: tests/setup.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/doc-consistency.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-ops-guard.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-acceptance.test.ts, artifact_type: test_code }
  - { artifact_path: tests/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: tests/goal-evidence-audit.test.ts, artifact_type: test_code }
  - { artifact_path: tests/version-up-readiness.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-65-distribution-repository-devos-authority.md
  requires:
    - docs/plans/PLAN-L7-654-distribution-devos-instruction-authority.md
  blocks:
    - issue:856
    - issue:659
---

# DevOS distribution runtime identity収束

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | typed identityとlegacy adapterをRed→Green | current／legacy／external／ambiguousを分離 |
| 2 | runtime／CLI／setupへ投影 | default、tag pin、command outputがDevOS |
| 3 | template／doctor／source projectionへ投影 | consumer readinessのcurrent bytesが一致 |
| 4 | targeted／全回帰／doctor | 全green |
| 5 | Claude exact-HEAD独立review | blocker 0 |

tag、publish、remote mutation、promotionはIssue #659のapproval境界まで実行しない。
