---
plan_id: PLAN-L7-680-skill-bun-residual-authority
title: "PLAN-L7-680 (refactor): inventory外skill guidanceをNode/npm authorityへ収束"
kind: refactor
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-26
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 1049
engineering_discipline_required: true
behavior_contract_id: AUTH-SURFACE-BUN-RETIREMENT-001
responsibility_owner: current-skill-runtime-command-authority-residual
change_slice: atomic
refactor_step: remove_legacy
legacy_retirement_state: consumer_zero
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "Node 24.15、npm、TypeScript、Vitest、Biomeがcurrent runtime authorityであり、Bunはhistorical detector以外のcurrent execution authorityを持たない"
contract_postconditions: "docs/skills配下のcurrent skill guidanceがNode/npm commandだけを案内し、active Bun commandを0件へ収束する"
contract_invariants: "historical receipt／retirement detectorは保持し、compatibility successでcurrent Node/npm failureを相殺しない"
contract_failures: "docs/skills/*.mdへbun run／bun test／bun audit／TypeScript-Bun前提が再出現した場合はruntime authority oracleでfail-closeする"
tdd_red_required: true
red_test: "固定14件だけを走査する既存oracleをdocs/skills/*.md全件走査へ拡張し、inventory外11文書の36 active Bun commandを列挙してRedにする"
complexity_effect: net_negative
complexity_justification: "廃止済みruntimeの二重command guidanceをcurrent skill全体から除去し、package scriptsとCI authorityへ一本化する"
removal_trigger: "current skill guidanceが別のrequirements-owned runtime authorityへversion-upされ、同等のcross-surface oracleが移行した時"
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
parent_design: docs/design/helix/L6-function-design/node-runtime-cutover.md
backprop_decision: not_required
backprop_decision_reason: "requirementsとADR-009/010で確定済みのNode/npm authorityをinventory外のcurrent skillへ投影するReverse是正で、上位意味を変更しない"
entry_signals:
  - "po_directive:Issue #1049 inventory外のcurrent skill guidanceに残るactive Bun commandを撤去する"
generates:
  - { artifact_path: docs/plans/PLAN-L7-680-skill-bun-residual-authority.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/skills/test-driven-development.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/git.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/refactoring.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/incremental-implementation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/gate-planning.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/verification.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/debt-register.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/adversarial-review.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/llm-agent-routing.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/planning-and-task-breakdown.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/tech-selection.md, artifact_type: markdown_doc }
  - { artifact_path: tests/runtime-authority-requirements.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/feedback-test-owner-disposition-residual.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/design/helix/L6-function-design/node-runtime-cutover.md
  requires:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/adr/ADR-009-node-python-linux-runtime.md
    - docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md
  blocks: []
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
agent_slots:
  - { role: se, slot_label: "SE — inventory外skill command authorityの一方向移行" }
  - { role: qa, slot_label: "QA — docs/skills全件のactive Bun command再出現mutation" }
---

# inventory外skill runtime command authority是正

## 目的

Issue #1049が特定した `docs/skills` inventory外11文書のactive Bun command 36行を、Node/npm authorityへ再束縛する。
Issue #253の先行sliceと同じ判定式を使い、固定された14件だけでなく `docs/skills/*.md` 全件をcurrent guidance
として検査する。historical、archive、migration、retirement detectorを書き換えず、current guidanceから
廃止済みBun commandを除去する。

## 工程

1. `docs/skills/*.md` 全件を走査し、active Bun commandとNode/npm置換先を採取する。
2. `npm run typecheck`、`npm run lint`、`npm run test`などpackage scriptsと一致する案内へ置換する。
3. runtime authority oracleの対象集合をディレクトリ全件から導出し、skill追加時の再発をfail-closeする。
4. PLAN lint、targeted test、typecheck、full CI、Claude exact-HEAD reviewで終端する。

## 受入条件

- `docs/skills/*.md` 全件のactive Bun commandが0件。
- Node/npm commandがcurrent package scriptsと一致する。
- historical detectorとreceipt allowlistを変更しない。
- current authority failureをlegacy successで相殺しない。
- oracleへ新しいskillを追加した場合も自動的に検査対象となる。
