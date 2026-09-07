---
plan_id: PLAN-RECOVERY-1603-review-receipt-plan-binding
title: "PLAN-RECOVERY-1603: sealed receiptとPLAN review evidenceを同じreviewer sessionへ束縛する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 1603
behavior_contract_id: REVIEW-RECEIPT-PLAN-BINDING-001
responsibility_owner: review-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
complexity_effect: net_neutral
backprop_decision: not_required
backprop_decision_reason: "独立review要件の意味は変えず、既存PLAN evidenceと既存sealed receiptの欠落joinを追加するRecoveryである。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "PLAN review_evidenceとPR sealed receiptはreviewer sessionをそれぞれ保持するが、receipt seal/admissionで相互照合されていない。"
contract_postconditions: "base非terminalからHEAD terminalへ遷移したPLANごとに、sealed receiptと同じreviewer session/modelのcross-agent技術承認が存在する場合だけreceipt sealとmerge admissionを通過できる。"
contract_invariants: "human approvalと技術reviewを混同せず、既存receiptのHEAD・CI・DB・runtime独立性検査を緩和せず、Issue #1430のevidence substance責務を複製しない。"
contract_failures: "差分PLAN取得不能、PLAN parse不能、cross-agent承認欠落、session/model不一致をtyped reasonでfail-closeする。"
tdd_red_required: true
red_test: "tests/review-receipt-plan-binding.test.tsのU-RRPB-002..006を実装前に実行し、接合関数が未存在のためredを確認する。"
red_at: "2026-09-06T19:45:27Z"
green_at: "2026-09-06T21:25:16Z"
mutation_oracle_required: true
mutation_oracle: "tests/review-receipt-plan-binding.test.ts::U-RRPB-002..013 と tests/claude-pr-convergence.test.ts::U-CPRCONV-020 が session、model、review_kind、status、PLAN path、seal/merge callsiteのseeded defectを個別にfail-closeしてkillする。"
mutation_oracle_evidence: "tests/review-receipt-plan-binding.test.ts::U-RRPB-002..013 が session/model/review_kind/status/PLAN path、accepted status、base非terminal→HEAD terminal母集団、Git取得・parse失敗、provider prefix、local candidate HEAD不一致を、tests/claude-pr-convergence.test.ts::U-CPRCONV-020 がmerge callsiteのterminal PLAN session不一致をrequired checks参照前に独立してfail-closeする。Claude clean clone実測は .helix/evidence/review-1605/vitest-targeted.log（7 files / 246 tests passed、sha256:287be3005652ec16d16373f10cfab7eb6ea3b46187f5c3606368593746d34e02）。"
parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md
pair_artifact: docs/test-design/helix/L8-review-receipt-plan-binding-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-001, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-002, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-003, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-004, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-005, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-006, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-007, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-008, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-009, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-010, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-011, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-012, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-RRPB-013, test_path: tests/review-receipt-plan-binding.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, oracle_id: U-CPRCONV-020, test_path: tests/claude-pr-convergence.test.ts }
dependencies:
  parent: docs/plans/PLAN-L7-648-review-evidence-reviewer-identity.md
  requires: []
  references:
    - "issue:1603"
    - "issue:1430"
    - "issue:923"
    - "PLAN-RECOVERY-1543-reviewer-session-model-history"
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — 独立review authorityと証拠帰属の非緩和を監査" }
  - { role: tl, slot_label: "TL — receiptとPLANのauthority join境界を確認" }
  - { role: se, slot_label: "SE — changed PLAN抽出とexact照合を実装" }
  - { role: qa, slot_label: "QA — session/model/review kindの独立反例を検証" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1603-review-receipt-plan-binding.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/review-receipt-plan-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-review-receipt-plan-binding-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/review-receipt-plan-binding.ts, artifact_type: source_module }
  - { artifact_path: tests/review-receipt-plan-binding.test.ts, artifact_type: test_code }
  - { artifact_path: .helix/evidence/review-1605/npm-ci.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1605/vitest-targeted.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1605/tsc.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1605/biome.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1605/plan-lint.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1605/doctor.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1605/head.txt, artifact_type: other }
modifies:
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-06T22:52:30Z"
    tests_green_at: "2026-09-06T22:49:52Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 9867601a-a3ad-4369-980c-11757d63a7de
    reviewed_head_sha: 09302cb04c8245d1c60b884025a74f5efda14dd1
    scope: "独立reviewとclean clone再実測は https://github.com/RetryYN/HELIX-HARNESS/pull/1605#issuecomment-5562747275 。doctor exit 1は環境起因4件と差替前の空tsc artifactを含むためgreen commandへ昇格しない。旧HEADのred／空artifact evidenceは再利用していない。"
    green_commands:
      - kind: smoke
        command: "npm ci --no-audit --no-fund"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T22:43:26Z"
        evidence_path: .helix/evidence/review-1605/npm-ci.log
        output_digest: "sha256:cc76df147bbb2b62c2264ce72f33bed6a0e076f22f02995443a68a87312da0b5"
      - kind: unit_test
        command: "npx vitest run tests/review-receipt-plan-binding.test.ts tests/cli-surface.test.ts tests/review-evidence.test.ts tests/digest.test.ts tests/feedback-refactor-disposition.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/plan-descent-specific-parent-binding.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-06T22:49:29Z"
        evidence_path: .helix/evidence/review-1605/vitest-targeted.log
        output_digest: "sha256:287be3005652ec16d16373f10cfab7eb6ea3b46187f5c3606368593746d34e02"
      - kind: typecheck
        command: "npx tsc --noEmit -p . --extendedDiagnostics"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T22:49:42Z"
        evidence_path: .helix/evidence/review-1605/tsc.log
        output_digest: "sha256:bca5556536be5819de89c816bfee8d2b15d775efdf0fb0ca560edbabaa5b0dec"
        result: "exit 0; tsc extended diagnostics 972 bytes; Files 1370"
      - kind: lint
        command: "npx biome check src tests"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T22:49:43Z"
        evidence_path: .helix/evidence/review-1605/biome.log
        output_digest: "sha256:eb15a4da8c6a95ecbe0609fc78c694a5293bf73981e7fa20beedb617d9dc020f"
      - kind: lint
        command: "npx tsx src/cli.ts plan lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T22:49:52Z"
        evidence_path: .helix/evidence/review-1605/plan-lint.log
        output_digest: "sha256:b3e679521694d41be8a60f5b7f1977553da6eed9268396b94f6741ba732592b9"
---

# PLAN-RECOVERY-1603

Issue #1603で実測された2件の誤帰属経路を閉じる。作成側spawnのreviewは補助検証として利用可能だが、
独立reviewとしてPLANをterminal化する根拠にはしない。最終receiptのreviewer session/modelと、変更対象PLANの
技術承認entryをreceipt seal前に接合する。

seal後のPLAN変更で接合を迂回できないよう、`pr-merge-reviewed`でも同じjoinを再評価する。既存terminal
PLANへの注記だけを再review対象にせず、baseからHEADでterminal化した遷移だけを対象とする。
