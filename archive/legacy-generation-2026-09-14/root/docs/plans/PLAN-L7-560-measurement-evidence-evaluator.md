---
plan_id: PLAN-L7-560-measurement-evidence-evaluator
title: "PLAN-L7-560 (add-impl): measurement evidence evaluatorとunit oracle"
kind: add-impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: true
route_mode: add-feature
entry_signals: ["po_directive:Issue #220 のpure measurement evaluatorを実装する"]
created: 2026-08-14
updated: 2026-08-15
owner: Codex / TL
github_issue_id: 220
engineering_discipline_required: true
behavior_contract_id: MEASUREMENT-EVIDENCE-EVALUATOR-001
responsibility_owner: measurement-harness
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L4-74／L5-101／L6-107がmeasurement evaluation contractと#221非対象境界を定義している"
contract_postconditions: "pure evaluator、ordered analysis failure、6独立status、stable finding、green/red/unknown truth table、U-MEVAL-001..015を実装する"
contract_invariants: "同一inputは同一result。入力を変更せず外部I/O 0。異binding、stale、非代表、unknown baseline、threshold/hard limit failureをgreenへしない"
contract_failures: "unknown field、invalid scalar/time、binding drift、stale、sample不足、未知評価状態、comparator境界、baseline不一致、hard limitを反証する"
tdd_red_required: false
tdd_red_waiver_reason: "isolated branchでtestとproduction moduleを同一atomic patchとして作成し、実在しないRed timestampを捏造しない。15 named oracle、境界表、mutation-sensitive assertions、独立review、current-head CIで受入を閉じる"
complexity_effect: justified_positive
complexity_justification: "新規pure moduleとtestは増えるが、依存追加・I/O・DB・CLIを持たず共通contractへ判定を集約する"
removal_trigger: "後継evaluatorへ全consumerが移行しv1 usageが0になった時"
backfill_state: complete
parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md
pair_artifact: docs/test-design/helix/L8-measurement-evidence-evaluator-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-001, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-002, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-003, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-004, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-005, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-006, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-007, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-008, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-009, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-010, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-011, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-012, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-013, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-014, test_path: tests/measurement-evidence-evaluator.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, oracle_id: U-MEVAL-015, test_path: tests/measurement-evidence-evaluator.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — evaluator production実装" }
  - { role: qa, slot_label: "QA — U-MEVAL-001..015／mutation-sensitive oracle" }
  - { role: tl, slot_label: "TL —責務境界とcurrent-head review収束" }
generates:
  - { artifact_path: src/requirements/measurement-evidence-evaluator.ts, artifact_type: source_module }
  - { artifact_path: tests/measurement-evidence-evaluator.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-107-measurement-evidence-evaluator.md
  requires:
    - docs/design/helix/L6-function-design/measurement-evidence-evaluator.md
    - docs/plans/PLAN-REVERSE-558-measurement-evidence-evaluator-backfill.md
  blocks:
    - issue:220
review_evidence:
  - reviewer: "Claude Code / claude-sonnet-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-14T15:29:29Z"
    tests_green_at: "2026-08-14T14:57:50Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-sonnet-5
    scope: "PR #691 exact HEAD 7e5c43caeb9734b12a77eb0fcd1287b4479e9552をClaude Code Sonnetがread-only独立レビューした。b68 reviewのIMPORTANT-3/4/5とM-6/7/8をpath／oracle／mutation命題で再確認し、Critical 0、Blocker 0、Important 0、Minor 0でAPPROVE。CI run 31811996937のterminal successも確認した。receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/691#issuecomment-5295110921。Reverse backfillは#692 pendingのためcompletion_claim_allowed=falseを維持する。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/measurement-evidence-evaluator.test.ts tests/vmodel-pair.test.ts tests/design-coverage.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/backfill-pairing.test.ts tests/gate-static.test.ts tests/ddd-tdd-rules.test.ts tests/design-language.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-14T14:57:50Z", evidence_path: tests/measurement-evidence-evaluator.test.ts, output_digest: "sha256:d084703150383a65623233a294c94e15fa01eb7b04ca41718e8b255c8e2686ca", result: "exact HEAD 7e5c43ca: 8 files / 172 tests passed" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-14T15:29:29Z"
  review_binding:
    reviewer: "Claude Code / claude-sonnet-5"
    reviewed_at: "2026-08-14T15:29:29Z"
    evidence_digest: "sha256:30ead9760c366a86dc9eafbcc4603a8c1d5013979ee25ec00782fb58bc262329"
  entries: []
---

# measurement evidence evaluatorとunit oracle

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | U-MEVAL-001..015をRedとして追加 | [直列] | production export不在でRed |
| 2 | pure evaluatorを実装 | [直列] | 全oracle green |
| 3 | L8 citationとdesign realityを確定 | [直列] | orphan／未実装claim 0 |
| 4 | 独立レビューとCI | [review] | blocker 0、current HEAD green |

Issue #220のcompletionはpure evaluator契約だけを対象とする。probe execution、current HEAD／dataset admission、
metric history、DB保存はIssue #221へ分離済みであり、本PLANの未了条件へ再混入させない。
Reverse backfill、current-head CI、Claude Code Opus独立review、DB convergenceをterminal evidenceとして要求する。
