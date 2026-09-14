---
plan_id: PLAN-L7-480-specialist-agent-registry
title: "PLAN-L7-480 (add-impl): 専門agent registry admission"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:2026-07-28 駆動モデルの専門工程経路と担当agent authorityを整備する"]
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 190
engineering_discipline_required: true
behavior_contract_id: UTH-FR-033
responsibility_owner: specialist-agent-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "L4/L9、L5/L8、L6/L7 pair draftが存在する"
contract_postconditions: "repository registryだけがadmitted team候補を返す"
contract_invariants: "worker/verifier authorityを分離しside effect 0"
contract_failures: "schema/digest/allowlist/capability/axis/runtime独立性欠落を拒否する"
tdd_red_required: true
red_at: "2026-07-28T10:58:00+09:00"
green_at: "2026-07-28T10:59:50+09:00"
mutation_oracle_evidence: "tests/specialist-agent-registry.test.tsがdefinition digestとprovider独立性の変異をkillする"
complexity_effect: justified_positive
complexity_justification: "既存allowlistをimportし、新config/loader/analyzer/selectorだけで統合する"
removal_trigger: "runtime rosterへatomic統合しconsumer=0になった時点"
parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md
pair_artifact: docs/test-design/helix/L8-specialist-agent-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-001, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-002, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-003, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-004, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-005, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-006, test_path: tests/specialist-agent-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/specialist-agent-registry.md, oracle_id: U-SAREG-007, test_path: tests/specialist-agent-registry.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — registry admission実装" }
  - { role: qa, slot_label: "QA — digest/independence mutation" }
  - { role: tl, slot_label: "TL — cross-provider収束review" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-480-specialist-agent-registry.md, artifact_type: markdown_doc }
  - { artifact_path: config/specialist-agent-registry.json, artifact_type: config }
  - { artifact_path: src/runtime/specialist-agent-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/specialist-agent-registry.test.ts, artifact_type: test_code }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-28T05:54:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-28T05:54:00Z"
    evidence_digest: "sha256:0b36748ecaa8131301320cd2b0871934e2efa7d3825807a6120a1d97b3c3523a"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T05:54:00Z"
    tests_green_at: "2026-07-28T05:52:00Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #203 の current HEAD 2a5a5f02 を clean detached worktree で独立レビューした。admission は definition digest 照合、launch allowlist、model class SSoT、duplicate agent_id、5 drive の worker 被覆を fail-close する。selectSpecialistTeam は entries を agent_id 昇順、capabilities と verification_axes を sortedUnique にして決定的に選び、各 verification axis について worker と runtime が異なる verifier だけを採用する。同 provider しか候補が無い axis は independent_verifier_missing で ok=false になり、部分成功へ丸めない。これは CLAUDE.md の hybrid judgement gate 分離と cross_agent review 規律 (worker≠reviewer) を機械強制するものである。security 面では sync_source.path が schema 段階で絶対 path、バックスラッシュ、親参照を拒否し、filesystem 読込より前に閉じることを実測で確認した (../../etc/passwd は sync_source.path:custom で拒否、正当な .claude/agents/*.md には path エラー無し)。doctor 配線は ok 集約 / failing-checks / messages の 3 箇所すべてに入っている。test oracle は U-SAREG-001〜007、IT-SAREG-002/003/005、ST-SAREG-002/003 の 17 件で、digest drift、allowlist 外 launch、capability 欠落、axis 欠落の部分成功丸め、duplicate agent_id、repository 外 path を個別に固定する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/specialist-agent-registry.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T05:52:00Z"
        evidence_path: tests/specialist-agent-registry.test.ts
        output_digest: "sha256:a4e7f39886009037c22a49ff8085910502b913a46cd38a64aa58abec7d5f1fc0"
        result: "17 passed"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-28T05:51:00Z"
        evidence_path: src/runtime/specialist-agent-registry.ts
        output_digest: "sha256:0db8ae86339ccf90607753a7bd7054edb5b07c1a3577ddb34a8154b1fbf18a91"
        result: "exit 0"
dependencies:
  parent: docs/plans/PLAN-L6-85-specialist-agent-registry.md
  requires: []
  references:
    - docs/plans/PLAN-L6-85-specialist-agent-registry.md
    - docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md
  blocks: []
---

# PLAN-L7-480: 専門agent registry admission

U-SAREG-001〜004、typecheck、doctor、PLAN gateをgreenにし、独立AI-Bが既存roster再利用と
worker/verifier独立性を確認する。
