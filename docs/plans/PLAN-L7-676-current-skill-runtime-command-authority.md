---
plan_id: PLAN-L7-676-current-skill-runtime-command-authority
title: "PLAN-L7-676 (refactor): current skill guidanceをNode/npm authorityへ収束"
kind: refactor
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: true
created: 2026-08-26
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 253
engineering_discipline_required: true
behavior_contract_id: AUTH-SURFACE-BUN-RETIREMENT-001
responsibility_owner: current-skill-runtime-command-authority
change_slice: atomic
refactor_step: remove_legacy
legacy_retirement_state: consumer_zero
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "Node 24.15、npm、TypeScript、Vitest、Biomeがcurrent runtime authorityであり、Bunはhistorical detector以外のcurrent execution authorityを持たない"
contract_postconditions: "Issue #253のexact skill inventoryがNode/npm commandだけを案内し、active Bun commandを0件へ収束する"
contract_invariants: "historical receipt／retirement detectorは保持し、compatibility successでcurrent Node/npm failureを相殺しない"
contract_failures: "current skillにbun run／bun test／bun audit／TypeScript-Bun前提が再出現した場合はruntime authority oracleでfail-closeする"
tdd_red_required: true
red_at: "2026-08-25T18:30:05Z"
green_at: "2026-08-25T18:30:18Z"
mutation_oracle_evidence: "docs/skills/code-review.mdのcurrent commandをnpm run testからbun run testへ一時変異し、tests/runtime-authority-requirements.test.tsがdocs/skills/code-review.md:40を列挙して1 failed／5 passed／exit 1となることを2026-08-25T18:30:05Zに実測した。Node/npm commandへ復元後、2026-08-25T18:30:18Zに6/6 greenへ戻り、tracked working treeがcleanであることを確認した。"
complexity_effect: net_negative
complexity_justification: "廃止済みruntimeの二重command guidanceを除去し、package scriptsとCI authorityへ一本化する"
removal_trigger: "current skill guidanceが別のrequirements-owned runtime authorityへversion-upされ、同等のcross-surface oracleが移行した時"
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md
backprop_decision: not_required
backprop_decision_reason: "requirementsとADR-009/010で確定済みのNode/npm authorityをcurrent skillへ投影するReverse是正で、上位意味を変更しない"
entry_signals:
  - "po_directive:Issue #253 current skill surfaceからactive Bun commandを撤去する"
generates:
  - { artifact_path: docs/plans/PLAN-L7-676-current-skill-runtime-command-authority.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/skills/dependency-map.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/data-migration.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/documentation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/db.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/code-review-and-quality.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/ci-gate-design.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/ci-deploy-and-rollback.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/testing.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/debugging-and-error-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/security-and-hardening.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/deprecation-cutover.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/error-fix.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/code-review.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/feedback-test-owner-disposition-residual.json, artifact_type: json_config }
  - { artifact_path: tests/l12-canonical-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/runtime-authority-requirements.test.ts, artifact_type: test_code }
  - { artifact_path: tests/feedback-test-owner-residual-disposition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L6-function-design/node-runtime-cutover.md
  requires:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/adr/ADR-009-node-python-linux-runtime.md
    - docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md
  references:
    - docs/skills/judgment-core.md
  blocks:
    - issue:243
    - issue:322
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
agent_slots:
  - { role: se, slot_label: "SE — skill command authorityの一方向移行" }
  - { role: qa, slot_label: "QA — active Bun command再出現mutation" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-25T23:39:11.000Z"
    tests_green_at: "2026-08-25T23:38:08Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: c7895aff-da7e-47a0-944a-36c68bb4f251
    scope: >-
      PR #1043の最終HEAD 94fb61e1fb5c7ac5595d5a7c4853e63ab6068ddaをClaude Codeが独立検収し、Issue #253が列挙する14件のexact skill inventoryについてactive Bun command 0、Node/npm authority、mutation oracle、DB projection／replay／checkpoint一致を確認してblocker 0 approveとした。PRのmerge commitは70c311562c0dcb8fb20ec0c2392b3645b9f5e90dであり、current mainの祖先としてread-after対象へ到達している。review receiptはhttps://github.com/RetryYN/HELIX-HARNESS/pull/1043#issuecomment-5418477260。
    green_commands:
      - kind: smoke
        command: "gh run view 32910176863 --repo RetryYN/HELIX-HARNESS --json status,conclusion,headSha,updatedAt,url --jq '{status,conclusion,headSha,updatedAt,url}'"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-25T23:38:08Z"
        evidence_path: tests/runtime-authority-requirements.test.ts
        output_digest: "sha256:78e2b8c02161e057085a3cdbd0bdd8adf12c82742f94a74d99aadf9b398e51d4"
        result: "terminal success / HEAD 94fb61e1fb5c7ac5595d5a7c4853e63ab6068dda"
---

# current skill runtime command authority是正

## 目的

Issue #253が列挙するcurrent `docs/skills`だけをNode/npm authorityへ再束縛する。historical、archive、migration、
retirement detectorを書き換えず、current guidanceから廃止済みBun commandを除去する。

## 工程

1. exact inventory内のactive Bun commandと廃止済みcombined runtime前提を採取する。
2. package scriptsと一致する`npm run typecheck`、`npm run lint`、`npm run test`、`npm audit`へ置換する。
3. existing runtime authority oracleへexact skill inventoryを追加し、再導入をfail-closeする。
4. PLAN lint、targeted test、typecheck、full CI、Claude exact-HEAD reviewで終端する。

## 受入条件

- exact inventoryのactive Bun commandが0件。
- Node/npm commandがcurrent package scriptsと一致する。
- historical detectorとreceipt allowlistを変更しない。
- current authority failureをlegacy successで相殺しない。
