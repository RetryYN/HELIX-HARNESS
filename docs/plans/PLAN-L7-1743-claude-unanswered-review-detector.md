---
plan_id: PLAN-L7-1743-claude-unanswered-review-detector
title: "Claude review未応答のread-only検出"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
github_issue_id: 1743
behavior_contract_id: CLAUDE-MENTION-UNANSWERED-DETECTOR-001
responsibility_owner: github-operations
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
entry_signals: [feature_addition]
contract_preconditions: "open PR／Issueのcomment observationをreadでき、前回request artifactの取得結果をloaded／bootstrap／missing／expiredへ分類できる"
contract_postconditions: "未応答、v4 sealed receiptによる回答済み、bot無視、untrusted response、前回artifact観測gapをtyped JSONへ副作用なしで分類する"
contract_invariants: "既存receipt admissionを緩和せず、GitHub observationとDB projectionを意味正本へ昇格させない"
contract_failures: "編集消失、別HEAD、先行reply、bot、spoof responder、未封緘見出しを回答へ誤分類せず、pagination read-after driftを実processでfail-closeし、前回artifact不存在・期限切れを異常なしへ変換しない"
tdd_red_required: true
mutation_oracle_required: true
red_at: "2026-09-12T00:30:44Z"
green_at: "2026-09-12T00:30:55Z"
mutation_oracle_evidence: "tests/claude-unanswered-review-detector.test.ts::U-CLUNANS-005 killed the seeded trusted-responder bypass mutant (1 failed, exit 1); restored implementation passed (exit 0)"
complexity_effect: net_negative
complexity_justification: "session依存scannerをpure detectorと再構築可能artifactへ集約する"
removal_trigger: "provider-neutral review-request lifecycleへ同一contractで統合された時"
backprop_decision: not_required
backprop_decision_reason: "既存GitHub運用要求の検出欠落を局所是正し要求意味を変更しない"
parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md
pair_artifact: docs/test-design/helix/L8-claude-unanswered-review-detector-unit-test-design.md
dependencies:
  parent: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md
  requires: []
  references: ["issue:1743", "issue:1737"]
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md, oracle_id: U-CLUNANS-001, test_path: tests/claude-unanswered-review-detector.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md, oracle_id: U-CLUNANS-002, test_path: tests/claude-unanswered-review-detector.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md, oracle_id: U-CLUNANS-003, test_path: tests/claude-unanswered-review-detector.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md, oracle_id: U-CLUNANS-004, test_path: tests/claude-unanswered-review-detector.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md, oracle_id: U-CLUNANS-005, test_path: tests/claude-unanswered-review-detector.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md, oracle_id: U-CLUNANS-006, test_path: tests/claude-unanswered-review-detector.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md, oracle_id: U-CLUNANS-007, test_path: tests/claude-unanswered-review-detector.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md, oracle_id: U-CLUNANS-008, test_path: tests/claude-unanswered-review-detector.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md, oracle_id: U-CLUNANS-009, test_path: tests/claude-unanswered-review-detector.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md, oracle_id: U-CLUNANS-010, test_path: tests/claude-unanswered-review-detector.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
agent_slots:
  - { role: se, slot_label: "SE — request／response identity境界" }
  - { role: qa, slot_label: "QA — 編集、HEAD、bot、spoof反例" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-1743-claude-unanswered-review-detector.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/claude-unanswered-review-detector.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-claude-unanswered-review-detector-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/claude-unanswered-review-detector.ts, artifact_type: source_module }
  - { artifact_path: src/cli/claude-unanswered-review-detector.ts, artifact_type: source_module }
  - { artifact_path: .github/scripts/collect-claude-review-observation.mjs, artifact_type: source_module }
  - { artifact_path: .github/workflows/claude-unanswered-review-audit.yml, artifact_type: yaml_config }
  - { artifact_path: tests/claude-unanswered-review-detector.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence:
  - reviewer: "Claude independent reviewer / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-09-13T07:03:01Z"
    tests_green_at: "2026-09-13T07:03:01Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: fe061343-6172-4db5-8837-ef9aa5fd3af6
    reviewed_head_sha: c43895dc1b1347ae33e3aac7d5acd883af934b37
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1767#issuecomment-5651827415"
    ci_evidence_generation: "run:34743611340:attempt:1:failure"
    receipt_id: "claude-pr-review:RetryYN/HELIX-HARNESS#1767:c43895dc1b1347ae33e3aac7d5acd883af934b37:claude:run:34743611340:attempt:1:failure"
    receipt_digest: "sha256:4d61767b8117271bb472d1be1ff9b0208914e83407a83d9cd77bb847295a940c"
    scope: "exact HEAD c43895dc1を独立監査し内容blocker 0。CI failureはdraft PLANのPOST_MERGE_PLAN循環だけで、他preflightは全green、unauthorized skip 0。reviewer側clean worktreeでdetectorとG3 pinの51/51、PLAN governance、DB replay、scope 14 path、catalog単一pinを再検証した。本receiptはconfirmed化の証拠でありmerge admissionには用いず、success世代で受け直す。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/claude-unanswered-review-detector.test.ts tests/l3-g3-freeze-packet-v2.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-09-13T07:03:01Z", evidence_path: tests/claude-unanswered-review-detector.test.ts, output_digest: "sha256:4d61767b8117271bb472d1be1ff9b0208914e83407a83d9cd77bb847295a940c", result: "Claude reviewerのclean worktreeで2 files / 51 tests green。receipt 5651827415。" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-09-12T03:44:20Z"
  review_binding:
    reviewer: "Claude Code / Fable 5.1"
    reviewed_at: "2026-09-12T03:44:20Z"
    evidence_digest: "sha256:ac41b886b7f643b60ee0b6b45a14bd3975675db4829afb6fe6acc22813408f30"
  entries: []
---

# 実装順序

1. pure detectorとidentity negative oracleを固定する。
2. paginationを含むread-only GitHub observation adapterとtyped JSON CLIを接続する。
3. 前回artifactを入力へ戻すscheduled shadow workflowを追加する。
4. exact HEADのCIと独立review後に非required shadow運用へ入れる。

Issue作成、外部通知、required化、receipt／PLAN／DB書込みは後続の別承認対象とする。
