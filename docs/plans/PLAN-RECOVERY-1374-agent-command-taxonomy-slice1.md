---
plan_id: PLAN-RECOVERY-1374-agent-command-taxonomy-slice1
title: "PLAN-RECOVERY-1374: agent/command taxonomyのcurrent authority収束（第一slice）"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
github_issue_id: 1374
behavior_contract_id: AGENT-COMMAND-AUTHORITY-1374-S1
responsibility_owner: authority-taxonomy-migration
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "Issue #1374がagent/commandの旧V-pair、独自NFR閾値、review/release/deploy authority混同を既存是正対象としている"
contract_postconditions: "対象6文書がcurrent L1-L12 pair、typed Requirement/NFR policy、分離したreview・merge・release・deployment・runtime admissionを案内する"
contract_invariants: "agent本文を新しいRequirement/Policy正本にせず、未定義閾値はunknownのまま保持し、review結果を実行authorizationへ昇格しない"
contract_failures: "対象文書がL0-L14、固定NFR閾値、G4/G6またはL12 deployをcurrent authorityとして再導入した場合に退行テストが失敗する"
tdd_red_required: false
tdd_red_waiver_reason: "既存文書のauthority driftを除去する限定Recoveryであり、追加した退行テストは旧tokenとauthority混同の再導入を直接拒否する。"
mutation_oracle_required: false
mutation_oracle_evidence: null
complexity_effect: net_negative
complexity_justification: "6つのactive guidanceから重複した旧pair・固定閾値・承認混同を除き、既存typed authorityへの参照へ収束する。"
removal_trigger: "Issue #1374の残surfaceが後続sliceで収束しても、本PLANは第一sliceの変更・検収履歴として保持する。"
backprop_decision: not_required
backprop_decision_reason: "新要求ではなく、Issue #1374とPLAN-RECOVERY-78が既に所有するstartup authority driftの限定是正である。"
parent_design: docs/design/helix/L6-function-design/agent-command-taxonomy-authority.md
pair_artifact: docs/test-design/helix/L8-agent-command-taxonomy-authority-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/agent-command-taxonomy-authority.md, oracle_id: U-ACTA-001, test_path: tests/layer-authority-drift.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/agent-command-taxonomy-authority.md, oracle_id: U-ACTA-002, test_path: tests/layer-authority-drift.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/agent-command-taxonomy-authority.md, oracle_id: U-ACTA-003, test_path: tests/layer-authority-drift.test.ts }
dependencies:
  parent: PLAN-RECOVERY-78-effective-agent-startup-authority
  requires: []
  references:
    - "issue:1370"
    - "issue:1374"
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — 旧layer・gate・authorization混同の対象限定監査" }
  - { role: qa, slot_label: "QA — active agent/command guidanceの退行検査" }
  - { role: tl, slot_label: "TL — #1374第一sliceのscopeと残義務管理" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1374-agent-command-taxonomy-slice1.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/agent-command-taxonomy-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-agent-command-taxonomy-authority-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/governance/feedback-test-owner-disposition-residual.json, artifact_type: json_config }
  - { artifact_path: tests/feedback-test-owner-residual-disposition.test.ts, artifact_type: test_code }
  - { artifact_path: config/specialist-agent-registry.json, artifact_type: json_config }
  - { artifact_path: .claude/agents/devops-deploy.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/pmo-sonnet.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/qa-test.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/security-audit.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/commands/ship.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/commands/spec.md, artifact_type: markdown_doc }
  - { artifact_path: tests/layer-authority-drift.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l12-canonical-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-09T22:38:55Z"
    tests_green_at: "2026-09-09T22:33:43Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 44a875e0-4347-4802-8e8a-87cb4f105537
    reviewed_head_sha: 830b670231c9ecff3432e2c7bcbdf94c4bea7606
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1700#issuecomment-5609705172"
    ci_evidence_generation: "run:34410353410:attempt:1:success"
    scope: "Issue #1374第一sliceの対象6文書、current L1-L12 authority、Requirement/NFR policy参照、review・merge・release・deployment・runtime admission分離、およびdeterministic pin追従をexact HEADで独立検収した。Issue #1374全体や後続surfaceの完了は主張しない。"
    green_commands:
      - kind: unit_test
        command: "npx vitest run tests/layer-authority-drift.test.ts tests/specialist-agent-registry.test.ts tests/feedback-test-owner-residual-disposition.test.ts tests/l12-canonical-authority.test.ts tests/l12-hybrid-recognition.test.ts --reporter=json --outputFile=.helix/evidence/review-1700/vitest-targeted-830.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-09T22:33:43Z"
        evidence_path: .helix/evidence/review-1700/vitest-targeted-830.json
        output_digest: "sha256:9df69c88b62bc8caed9dc893412b71194f337535e5b2c714ae843b4e28ca4ebb"
---

# agent/command taxonomyのcurrent authority収束（第一slice）

## 対象

Issue #1374のうち、activeなPMO・QA・security・deployment agentと`/spec`・`/ship`に残る
旧layer/gate、独自NFR閾値、reviewと実行authorizationの混同だけを是正する。

## 受入条件

- current guidanceがL1-L12と正規V-pairだけを案内し、L0 charterを層外authorityとして保持する。
- QA・security・deploymentの検査値はRequirement / NFR / security policyへtraceし、未定義値を`unknown`として扱う。
- independent review、merge admission、release authorization、deployment authorization、runtime admissionを相互に代替しない。
- `tests/layer-authority-drift.test.ts`が対象6文書への旧authority再導入を拒否する。
- current HEADのtargeted test、PLAN lint、branch-kind、独立review、CIが成立するまでdraftを維持する。

## 非対象と残義務

本sliceはagent roster、guard exact set、FE固有agent、`/test`、`/build`、`/sdd-review`、provider runtimeを変更しない。
Issue #1374全体の完了は主張せず、未対象surfaceは同Issueの後続sliceとして残す。review evidenceや実行証拠を
作成側が補作せず、独立review後に正規receiptを転記する。
