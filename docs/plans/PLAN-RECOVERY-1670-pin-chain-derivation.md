---
plan_id: PLAN-RECOVERY-1670-pin-chain-derivation
title: "変更pathからのpin追従先事前導出"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-09
updated: 2026-09-10
github_issue_id: 1670
behavior_contract_id: PIN-CHAIN-DERIVATION-001
responsibility_owner: pin-chain-derivation
engineering_discipline_required: true
no_code_decision: add_code
ddd_modeling_decision: domain_service
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
contract_preconditions: "changed path集合と既存pin recordの実bytesを取得できる"
contract_postconditions: "対応pinのexact追従先を重いCI前にread-only導出し、未対応形式をDEGRADEDで示す"
contract_invariants: "既存gate・baseline・review判定を緩和せず、自動書換えを行わない"
contract_failures: "pin漏れ、記録値だけの照合、semantic pinの自動refresh、未対応surfaceのsilent無視を拒否する"
tdd_red_required: true
red_at: "2026-09-09T03:42:00+09:00"
green_at: "2026-09-09T03:46:54+09:00"
mutation_oracle_evidence: "tests/pin-chain-derivation.test.tsで変異A（unsupportedSurfacesをall-or-nothingへ退行）を投入するとU-PINCHAIN-002/006がRed、変異B（count locationを値の最初の出現へ退行）を投入するとU-PINCHAIN-005がRedとなり、両変異をkillした。復元後5 tests green、git diff 0を独立Claudeが実測。"
complexity_effect: justified_positive
complexity_justification: "既存pin形式ごとのread-only adapter一箇所へ追従推測を集約し、CI再走と手作業を削減する"
removal_trigger: "全pin ownerが共通relation graphから同等のexact逆引きを提供しconsumer移行が成立した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md
pair_artifact: docs/test-design/helix/L6-pin-chain-derivation-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-001, test_path: tests/pin-chain-derivation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-002, test_path: tests/pin-chain-derivation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-003, test_path: tests/pin-chain-derivation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-004, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-005, test_path: tests/pin-chain-derivation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-006, test_path: tests/pin-chain-derivation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-007, test_path: tests/pin-chain-derivation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-008, test_path: tests/pin-chain-derivation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-009, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-010, test_path: tests/pin-chain-derivation.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1323", "issue:1639", "issue:1675", "issue:1678"]
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1670-pin-chain-derivation.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/pin-chain-derivation.ts, artifact_type: source_module }
  - { artifact_path: tests/pin-chain-derivation.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/evidence/PR-1679/vitest-targeted.json, artifact_type: json_config }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/pin-chain-derivation.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-pin-chain-derivation-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: design_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — pin adapterとread-only CLI" }
  - { role: qa, slot_label: "QA — stale／semantic／unknown反例" }
  - { role: aim, slot_label: "AIM — 自動refresh禁止とauthority境界を監査" }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-09T15:48:28Z"
    tests_green_at: "2026-09-09T15:47:58Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 44a875e0-4347-4802-8e8a-87cb4f105537
    reviewed_head_sha: ddc9f1ffed86d939e5953bb35702ac4eeba1359e
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1679#issuecomment-5604706922"
    ci_evidence_generation: "run:34371769705:attempt:1:failure"
    scope: "第一sliceの対象HEADを独立検収。inventory 21行とCLI digestの実体一致、177 tests成功を確認。CI run 34371769705はfailureであり、最終CI・merge・後続adapterの完成を意味しない。"
    green_commands:
      - kind: unit_test
        command: "npx vitest run --project fast tests/pin-chain-derivation.test.ts tests/cli-surface.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/goal-evidence-audit.test.ts tests/digest.test.ts --reporter=json --outputFile=.helix/evidence/review-1679/vitest-targeted.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-09T15:47:58Z"
        evidence_path: docs/governance/evidence/PR-1679/vitest-targeted.json
        output_digest: "sha256:f0b71876d084df17622ddd2387bb2b543b392422cc33b70f1d585f48952ae08f"
---

# 変更pathからのpin追従先事前導出

## 第一slice

Issue #1670で反復した追従漏れを、既存gateがredを出した後ではなくpush前に列挙する。対象は実測済みの
feedback test-owner manifestとreviewed-safe semantic pinから開始し、adapter単位で追加する。

## 検収範囲と残義務

confirmedは上記exact HEADに対する第一sliceの独立検収を表す。Issue #1670全体、最終CI、
merge/read-afterの完了主張は行わず、completion_claim_allowedはfalseを維持する。

- 証跡転記後HEADのrepo-wide guard、fresh CI、最終独立receipt、merge/read-after
- 本sliceの実測で未対応と確認したdesign catalog、V-pair、digest inventoryの逆引きadapter
- JSON generated surface、literal digest、集合／cross-table pin adapter
- Bugbot Aへの許可済みdeterministic refresh接続（別責務）

## 第二slice: digest inventory line逆引き

PR #1683で実測した`src/lint/outstanding.ts`の`sha256Json`行移動を反例とし、
`config/digest-canonicalization-inventory.json`の対応rowをsource pathから逆引きする。live lineは既存
`scanDigestInventory()`だけから取得し、独自scannerを追加しない。差分はread-only finding
（`kind=deterministic_pin`, `action=refresh_candidate`）として返し、inventoryを自動書換えしない。

このsliceはdigest inventory line adapterの局所実装・targeted testまでを対象とする。第一sliceの
feedback/reviewed-safe adapter、Issue #1670全体、PR、CI、merge/read-afterの完了を主張しない。
---
