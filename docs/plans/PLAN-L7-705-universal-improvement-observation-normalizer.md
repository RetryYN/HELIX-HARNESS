---
plan_id: PLAN-L7-705-universal-improvement-observation-normalizer
title: "PLAN-L7-705 (add-impl): Universal Improvement観測正規化とbaseline分離を実装する"
kind: add-impl
layer: L7
drive: agent
status: confirmed
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:Issue #1232 UIL-02 観測正規化とbaseline比較を実装する"
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
github_issue_id: 1232
behavior_contract_id: UNIVERSAL-IMPROVEMENT-OBSERVATION-NORMALIZER-001
responsibility_owner: universal-improvement-observation-normalizer
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "confirmed UIL-R-02を実装し、既存UIL-01 admissionとdigest authorityを変更しない。"
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "#1231のrequirements-owned source registryとrepository-bound admissionがcanonical merge可能である"
contract_postconditions: "admit済みsource eventだけをstable identity、baseline／observed／predicted、causation、confidence、counterevidenceへ決定的に正規化する"
contract_invariants: "read-only、入力順非依存、baseline／observed／predicted非混同、AI非依存、部分成功なし、authority writeなし"
contract_failures: "forged source、wrong revision、invalid baseline／prediction／confidence／digest、duplicate event、unresolved causationをfail-closeする"
tdd_red_required: true
red_test: "U-UILNORM-001..007で未実装module、forged registry、baseline混同、順序依存、duplicate／causation不整合、malformed inputを検出する"
red_at: 2026-08-30T17:46:03+09:00
green_at: 2026-08-30T17:46:35+09:00
mutation_oracle_evidence: "tests/universal-improvement-observation-normalizer.test.tsのU-UILNORM-003..007でregistry proof偽装、wrong revision、missing baselineへのrevision混入、duplicate event、unresolved causation、invalid confidence／digest／correlation、correlation_id欠落／非string、outer／nested input破壊を変異し、throwや型強制によるsilent acceptへ縮退せずfail-closeする。2026-08-30T17:46:03+09:00にcorrelation_id型guardを弱めるmutationを実測し、U-UILNORM-007が1 failed／6 passedでkillした。guard復元後の17:46:35+09:00に同suite 7 tests greenを実測した。2026-08-30T19:39:16+09:00にconfidence.scoreの上限／下限／finite判定を個別に弱めても検出できるよう、valid basis_digestのまま2／-0.1／NaNを与える独立反例をU-UILNORM-006へ追加し、normalizer＋source registry 15 tests greenを実測した。"
complexity_effect: justified_positive
complexity_justification: "UIL-01 admissionを再利用し、後続finding/candidate責務を混載せず、正規化境界を一つ追加する。"
removal_trigger: "後継normalized event schemaへ全consumerが移行し、本schemaのeventが0件になった時。"
parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md
pair_artifact: docs/test-design/helix/L8-universal-improvement-observation-normalizer-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-001, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-002, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-003, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-004, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-005, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-006, test_path: tests/universal-improvement-observation-normalizer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, oracle_id: U-UILNORM-007, test_path: tests/universal-improvement-observation-normalizer.test.ts }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-30T08:17:37Z"
    tests_green_at: "2026-08-30T08:17:37Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: 62f1d495-e49d-4944-ac26-dc9c09e1814e
    reviewed_head_sha: 94375455105ce771c3a4412fac57d2e46efdf7ae
    scope: "PR #1236 HEAD 94375455105ce771c3a4412fac57d2e46efdf7aeをClaude Codeが独立pre-confirm reviewした。旧HEADのcorrelation_id型強制blockerを欠落／数値mutationで再現し、typeof guardと2反例で解消、UIL-02責務境界とauthority write 0を確認した。blocker 0、non-blocker 6。最終exact-HEAD merge receiptは別途取得する。review: https://github.com/RetryYN/HELIX-HARNESS/pull/1236#issuecomment-5467592090"
    green_commands:
      - kind: unit_test
        command: "npm exec -- vitest run tests/universal-improvement-observation-normalizer.test.ts tests/universal-improvement-source-registry.test.ts && npm exec -- tsc --noEmit && npm exec -- biome check src/runtime/universal-improvement-observation-normalizer.ts tests/universal-improvement-observation-normalizer.test.ts && npm exec -- tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-30T08:17:37Z"
        evidence_path: tests/universal-improvement-observation-normalizer.test.ts
        output_digest: "sha256:39be4b8107b0d00e41a59f5727f8c05ce6fc4d9d1049343148397726186d33cb"
        result: "normalizer 7＋source registry 8の15 tests、typecheck、Biome、PLAN governanceがgreen"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-30T08:17:37Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-30T08:17:37Z"
    evidence_digest: "sha256:216781efa84a277fe29c02ceb6224c83304d7e0d91ac259da7d7d5d240498aaa"
  entries: []
agent_slots:
  - { role: se, slot_label: "SE — admitted source、stable event、baseline separation" }
  - { role: qa, slot_label: "QA — forgery／missing／duplicate／causation mutation" }
  - { role: tl, slot_label: "TL — UIL-01再利用と後続candidate境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-705-universal-improvement-observation-normalizer.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/universal-improvement-observation-normalizer.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-universal-improvement-observation-normalizer-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/universal-improvement-observation-normalizer.ts, artifact_type: source_module }
  - { artifact_path: tests/universal-improvement-observation-normalizer.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-74-universal-improvement-loop.md
  requires:
    - docs/plans/PLAN-L7-703-universal-improvement-source-registry.md
  blocks:
    - issue:1246
references:
  - issue:1210
  - issue:1231
  - issue:1232
---

# Universal Improvement観測正規化とbaseline分離

## §工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | UIL-R-02とUIL-01 admissionの境界を固定 | 直列 | source authority再実装0 |
| 2 | event schema／validator／normalizer実装 | 直列 | U-UILNORM-001〜006 green |
| 3 | 独立review、CI、Reverse fullback | 直列 | current HEAD receiptとmain read-after |

本PLANは#1231をstack baseとし、親がcanonical mergeするまでReady化しない。
