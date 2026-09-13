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
  - { artifact_path: docs/governance/evidence/PR-1767/vitest-targeted.json, artifact_type: json_config }
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
    reviewed_at: "2026-09-13T07:34:00Z"
    tests_green_at: "2026-09-13T07:21:27Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: fe061343-6172-4db5-8837-ef9aa5fd3af6
    reviewed_head_sha: e69951634b50b1a6dbf1ba4e08c0139acfa97df5
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1767#issuecomment-5651975405"
    ci_evidence_generation: "run:34745099202:attempt:1:failure"
    receipt_id: "claude-pr-review:RetryYN/HELIX-HARNESS#1767:e69951634b50b1a6dbf1ba4e08c0139acfa97df5:claude:run:34745099202:attempt:1:failure"
    receipt_digest: "sha256:7e20089d2e0d3ff238944cb1dffa46105243abc0e583f0df0e965d8cf0d5835d"
    scope: "exact HEAD e69951634の独立検収で内容blocker 0。run 34745099202の唯一のfailureは旧receiptのreviewed_atが後生成したtest evidenceより前だった順序違反であり、本receiptはそのtest evidenceを07:34:00Zに再検証した。merge admissionには用いず、confirmed化後のsuccess世代で受け直す。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/claude-unanswered-review-detector.test.ts tests/l3-g3-freeze-packet-v2.test.ts --reporter=json --outputFile=.helix/evidence/review-1767/vitest-targeted.json", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-09-13T07:21:27Z", evidence_path: docs/governance/evidence/PR-1767/vitest-targeted.json, output_digest: "sha256:eca986bacb7c8b5e69c649ef0b435412ab82ba634b9bcf9cc7050191211f6a48", result: "最終main追従HEADで2 files / 51 tests green。JSON出力bytesをGit管理しdigestを固定した。" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-09-12T03:44:20Z"
  review_binding:
    reviewer: "Claude independent reviewer / claude-opus-5"
    reviewed_at: "2026-09-13T07:34:00Z"
    evidence_digest: "sha256:29caff6903422e5dd521613e51173b1de4b9ec135152426c89e0887fd7c06f26"
  entries: []
---

# 実装順序

1. pure detectorとidentity negative oracleを固定する。
2. paginationを含むread-only GitHub observation adapterとtyped JSON CLIを接続する。
3. 前回artifactを入力へ戻すscheduled shadow workflowを追加する。
4. exact HEADのCIと独立review後に非required shadow運用へ入れる。

Issue作成、外部通知、required化、receipt／PLAN／DB書込みは後続の別承認対象とする。
