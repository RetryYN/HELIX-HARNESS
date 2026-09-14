---
plan_id: PLAN-L7-558-ai-decision-proposal-authority
title: "PLAN-L7-558 (add-impl): AI proposalとcommit authority分離"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: complete
completion_claim_allowed: true
entry_signals:
  - "po_directive:2026-08-14 Issue #187 UWJ-FR-009/010 proposal authority"
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 187
engineering_discipline_required: true
behavior_contract_id: AI-DECISION-PROPOSAL-AUTHORITY-001
responsibility_owner: universal-workflow-judgment
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "UWJ-FR-009/010とAC-009/010がconfirmed L3正本に存在する"
contract_postconditions: "完全な判断chainだけをproposal-onlyで受理しcommit verifier手前で停止する"
contract_invariants: "AI自己承認、権限昇格、high-impact、DB/Git/GitHub direct writeを許さない"
contract_failures: "schema、authority、candidate、policy、unresolved、oracle、verifier違反をstable findingへ変換する"
tdd_red_required: true
red_at: "2026-08-14T14:18:17+09:00"
green_at: "2026-08-14T14:18:52+09:00"
mutation_oracle_evidence: "proposal action allowlist条件を一時反転し、2026-08-14にU-UWPROP-001/003の2 testsがfailed、U-UWPROP-002/004/005の3 testsがpassedとなることを実測した。元実装へ復元後5 tests green。tests/ai-decision-proposal.test.ts"
complexity_effect: justified_positive
complexity_justification: "既存src/workflow pure contractへ単一strict validatorを追加しwriterやserviceを増やさない"
removal_trigger: "Universal Workflow envelope admissionへ同一contractとして統合する時点"
parent_design: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md
pair_artifact: docs/test-design/helix/L8-ai-decision-proposal-authority-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md, oracle_id: U-UWPROP-001, test_path: tests/ai-decision-proposal.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md, oracle_id: U-UWPROP-002, test_path: tests/ai-decision-proposal.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md, oracle_id: U-UWPROP-003, test_path: tests/ai-decision-proposal.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md, oracle_id: U-UWPROP-004, test_path: tests/ai-decision-proposal.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md, oracle_id: U-UWPROP-005, test_path: tests/ai-decision-proposal.test.ts }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/ai-decision-proposal-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/ai-decision-proposal-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ai-decision-proposal-authority-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-ai-decision-proposal-authority-detail-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-ai-decision-proposal-authority-system-test-design.md, artifact_type: test_design }
  - { artifact_path: src/workflow/ai-decision-proposal.ts, artifact_type: source_module }
  - { artifact_path: tests/ai-decision-proposal.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md
  requires:
    - docs/plans/PLAN-L7-478-universal-workflow-envelope.md
    - docs/plans/PLAN-REVERSE-187-ai-decision-proposal-authority-backfill.md
  blocks: [issue:188]
agent_slots:
  - { role: se, slot_label: "SE — deterministic proposal validator" }
  - { role: qa, slot_label: "QA — authority／oracle mutation" }
  - { role: tl, slot_label: "TL — UWJ-FR-009/010 authority境界" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-14T07:36:15Z"
    tests_green_at: "2026-08-14T07:36:15Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: claude:claude-opus-5
    scope: "PR #686 (feature/ai-proposal-authority-187) HEAD c390f34f の Codex 著寄与を Claude Code 収束レーンで独立レビューした。L4↔L9 / L5↔L8-detail / L6↔L8 の pair 双方向性を確認し、allowlist 判定 !allowedProposalActions.has(action) を反転する mutation を実注入して U-UWPROP-001 / U-UWPROP-003 の 2 件のみが failed、復元後 5 passed となることを実測した。実装依存は zod のみで execSync / spawn / writeFileSync / sqlite / fetch / gh api への参照が 0 件であり、AI が提案のみを行い commit authority を持たないという contract_invariants が実装レベルで担保されている。blocker 0。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/ai-decision-proposal.test.ts tests/vmodel-pair.test.ts tests/gate-static.test.ts tests/backfill-pairing.test.ts tests/design-language.test.ts tests/left-arm-carry-log.test.ts tests/ddd-tdd-rules.test.ts --reporter=json | sha256sum"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-14T07:36:15Z"
        evidence_path: tests/ai-decision-proposal.test.ts
        output_digest: "sha256:455a8eb16ebd0fba17dccfe6a12f2ec8d71d046495b48f639ef5bc9f3aa9d482"
        result: "152 passed (7 files)"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-14T07:36:15Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-14T07:36:15Z"
    evidence_digest: "sha256:e16dafcc2383f5e25dc8a762cd3bbb4f36488788261c744ce8d2f8ab172ca095"
  entries: []
---

# AI proposalとcommit authority分離

L3正本UWJ-FR-009/010、UWJ-AC-009/010を`U-UWPROP-001`〜`U-UWPROP-005`へ降ろす。
旧HELIXはdeterministic分類のbehavior atomだけを採用し、Python writerは再導入しない。

## Reverse終端収束

`PLAN-REVERSE-187-ai-decision-proposal-authority-backfill`との双方向linkを同一transactionで接続した。
Reverseで`preserve`判定されたL4〜L6／L8 unitをconfirmedへ遷移し、L8 detail／L9は本PLANの
`generates`所有物としてForward実装時のpair review evidenceと終端整合に基づきconfirmedへ遷移した。
Issue #874のfailure-code oracle correctionをread-afterしたため、`backfill_state: complete`および
`completion_claim_allowed: true`を宣言する。
