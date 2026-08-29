---
plan_id: PLAN-L7-581-github-workflow-identity-migration-bundle-admission
title: "PLAN-L7-581 (fix): registry version-upのtyped PLAN migration bundleをstrict admissionする"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: VERSION_UP
entry_signals:
  ["po_directive:Issue #746 要件正本registryの移行bundle admission"]
created: 2026-08-16
updated: 2026-08-19
owner: Codex / TL
github_issue_id: 805
behavior_contract_id: GWID-MIGRATION-BUNDLE-001
responsibility_owner: github-workflow-identity-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "通常PRはtyped PLAN exactly oneを要求し、requirements registry version-upは複数typed PLANの同時移行を必要とする"
contract_postconditions: "strict migration bundleだけが複数typed PLANを受理され、通常PRの単一PLAN制約は不変となる"
contract_invariants: "requirements registryが意味authorityであり、legacy identityやproseからbundleを推測しない"
contract_failures: "marker／manifest／owner／authority path／version／digest／catalog identityの不一致を専用reasonでfail-closeする"
tdd_red_required: true
tdd_red_waiver_reason: null
red_at: "2026-08-16T08:48:03Z"
green_at: "2026-08-16T09:02:48Z"
mutation_oracle_evidence: "2026-08-16T08:53:13Zにcanonical registry／generated catalog同時変更条件を空集合へ一時変異し、tests/github-workflow-identity-admission.test.tsのU-GWIDADM-012がexpected authority_path_missing／received owner_invalidで1 failed、10 skipped、exit 1となるkillを実測した。2026-08-19T06:01 JSTにmigration owner判定を常時trueへ変異するとU-GWIDADM-017が、foreign PLAN契約のnon-null要求を常時trueへ変異するとU-GWIDADM-018が、それぞれpr_scope_plan_contract_mismatchを失いexit 1となることを実測した。条件復元後にtargeted greenを再確認する"
complexity_effect: justified_positive
complexity_justification: "通常単一PLAN経路を維持し、version-up専用のstrict marker／manifest value objectだけを追加する"
removal_trigger: "typed PLAN migrationが不要なimmutable registryへ移行した場合にbundle adapterを削除する"
backprop_decision: not_required
backprop_decision_reason: "GH-FR-020／GH-AC-018のL3 requirement artifactを同一sliceで更新済みのため、別backprop処理は不要"
parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md
pair_artifact: docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md
verification_bindings:
  - {
      parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md,
      oracle_id: U-GWIDADM-011,
      test_path: tests/github-workflow-identity-admission.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md,
      oracle_id: U-GWIDADM-012,
      test_path: tests/github-workflow-identity-admission.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md,
      oracle_id: U-GWIDADM-013,
      test_path: tests/github-workflow-identity-admission.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md,
      oracle_id: U-GWIDADM-014,
      test_path: tests/github-workflow-identity-admission.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md,
      oracle_id: U-GWIDADM-015,
      test_path: tests/github-workflow-identity-admission.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md,
      oracle_id: U-GWIDADM-016,
      test_path: tests/github-workflow-identity-admission.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md,
      oracle_id: U-GWIDADM-017,
      test_path: tests/github-workflow-identity-admission.test.ts,
    }
  - {
      parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md,
      oracle_id: U-GWIDADM-018,
      test_path: tests/github-workflow-identity-admission.test.ts,
    }
agent_slots:
  - { role: aim, slot_label: "AIM — recovery実装とfail-close境界" }
  - { role: se, slot_label: "SE — strict migration bundle parser" }
  - { role: qa, slot_label: "QA — manifest／owner／digest negative oracle" }
  - { role: tl, slot_label: "TL — requirements authority migration boundary" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T09:02:48Z"
    tests_green_at: "2026-08-16T09:02:48Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #746のstrict migration bundle admissionを独立reviewした。初回High 1件（non-typed PLAN混入迂回）とMedium 1件（negative oracle不足）、再review Medium 1件（authority片側欠落の非対称）を是正した。最終blocker／high／medium 0。通常single PLAN制約、marker、exact manifest、typed全件、VERSION_UP owner、current version／digest、catalog identity、canonical registry／catalog両pathを確認し、#745実データ12 PLANのdogfood admissionもgreen。current exact-HEAD freshnessはPRのClaude Code sealed receiptで別途束縛する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/github-workflow-identity-admission.test.ts && npm run typecheck && npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-581-github-workflow-identity-migration-bundle-admission.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-16T09:02:48Z"
        evidence_path: tests/github-workflow-identity-admission.test.ts
        output_digest: "sha256:c1530377f1c51597d1ce79d3431681e20e943624f89c9477c27ba02b2948c919"
        result: "12 tests green、typecheck green、PLAN lint全gate green、独立review blocker／high／medium 0、PR #745 dogfood admission green"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-16T09:02:48Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-16T09:02:48Z"
    evidence_digest: sha256:3122b4d217ef9bfe0f354471e3aa4c69e6adbf19aac6b065dfda718d01fbbd88
  entries: []
generates:
  - {
      artifact_path: docs/plans/PLAN-L7-581-github-workflow-identity-migration-bundle-admission.md,
      artifact_type: markdown_doc,
    }
  - {
      artifact_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md,
      artifact_type: design_doc,
    }
  - {
      artifact_path: docs/design/helix/L6-function-design/github-workflow-identity-admission.md,
      artifact_type: design_doc,
    }
  - {
      artifact_path: docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md,
      artifact_type: test_design,
    }
  - {
      artifact_path: src/adapters/github-workflow-identity-admission.ts,
      artifact_type: source_module,
    }
  - {
      artifact_path: src/lint/github-guards.ts,
      artifact_type: source_module,
    }
  - {
      artifact_path: tests/github-workflow-identity-admission.test.ts,
      artifact_type: test_code,
    }
  - {
      artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md,
      artifact_type: markdown_doc,
    }
dependencies:
  parent: docs/plans/PLAN-L7-574-github-workflow-identity-admission.md
  requires:
    - docs/plans/PLAN-L7-574-github-workflow-identity-admission.md
  references:
    - docs/plans/PLAN-L7-579-plan-entry-legacy-workflow-identity-isolation.md
  blocks:
    - docs/plans/PLAN-L3-60-workflow-catalog-projection-authority.md
---

# GitHub workflow identity移行bundle admission

通常PRのtyped PLAN exactly one制約を維持したまま、requirements-owned registry version-upだけを
machine-readableなexact migration bundleとして受理する。旧mode／modelやproseを互換判定へ使わない。

## 工程表

| Step | 作業                                  | 完了条件                         |
| ---- | ------------------------------------- | -------------------------------- |
| 1    | multiple PLAN failureを反例化         | U-GWIDADM-011／012 red           |
| 2    | strict bundle parserとconvergence検査 | U-GWIDADM-011..013 green         |
| 3    | requirements／L6／L8 backprop         | GH-FR-020／GH-AC-018とoracle一致 |
| 4    | mutation／独立review／CI              | blocker 0、canonical merge       |

## Scope境界

本sliceはGitHub workflow identity admissionだけを所有する。registry version-upそのもの、catalog projection、
README、DB、doctor、#655、#693、配布を混載しない。
