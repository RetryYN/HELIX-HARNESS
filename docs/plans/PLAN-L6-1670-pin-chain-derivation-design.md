---
plan_id: PLAN-L6-1670-pin-chain-derivation-design
title: "変更pathからのpin追従先事前導出設計freeze"
kind: add-design
layer: L6
drive: be
status: confirmed
completion_claim_allowed: true
owner: Codex / TL
created: 2026-09-09
updated: 2026-09-09
github_issue_id: 1670
behavior_contract_id: PIN-CHAIN-DERIVATION-001
responsibility_owner: pin-chain-derivation
engineering_discipline_required: true
no_code_decision: no_change
ddd_modeling_decision: domain_service
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
contract_preconditions: "changed path集合と既存pin recordの実bytesを取得できる"
contract_postconditions: "対応pinのexact追従先、未対応形式のDEGRADED、semantic pinの再判定境界をL6/L7 pairとしてfreezeする"
contract_invariants: "既存gate・baseline・review判定を緩和せず、自動書換えを行わない"
contract_failures: "pin漏れ、記録値だけの照合、semantic pinの自動refresh、未対応surfaceのsilent無視を拒否する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "既存pin形式ごとのread-only adapter一箇所へ追従推測を集約し、CI再走と手作業を削減する"
removal_trigger: "全pin ownerが共通relation graphから同等のexact逆引きを提供しconsumer移行が成立した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md
pair_artifact: docs/test-design/helix/L6-pin-chain-derivation-unit-test-design.md
verification_bindings: []
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  parent: docs/design/helix/L5-detail/atomic-slice-admission.md
  requires: [docs/design/helix/L5-detail/atomic-slice-admission.md]
  references: ["issue:1323", "issue:1639", "issue:1675", "issue:1678"]
  blocks: []
generates:
  - { artifact_path: .helix/evidence/review-1680/vitest-targeted.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/pin-chain-derivation.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-pin-chain-derivation-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/plans/PLAN-L6-1670-pin-chain-derivation-design.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: design_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — pin adapterとread-only CLI" }
  - { role: qa, slot_label: "QA — stale／semantic／unknown反例" }
  - { role: aim, slot_label: "AIM — 自動refresh禁止とauthority境界を監査" }
review_evidence:
  - reviewer: "Claude Code / Opus 5"
    review_kind: cross_agent
    reviewed_at: "2026-09-08T23:02:35Z"
    tests_green_at: "2026-09-08T22:11:45Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: 84042278-2754-49c1-8218-d445bf829951
    reviewed_head_sha: 1f8a4f13878d5b312d52f23ce7b4d3e9a9b29e90
    receipt_url: https://github.com/RetryYN/HELIX-HARNESS/pull/1680#issuecomment-5593066168
    ci_evidence_generation: "run:34287708504:attempt:1:failure"
    scope: "exact HEAD 1f8a4f138でmetadata-only carry-forward、scope、evidence byte、対象140 tests、design-language、catalog digest伝播、DB replay収束を独立reviewerが確認した。引用CIはreceipt locator不在だけを理由に失敗したterminal generationであり成功主張やmerge admissionには用いない。runtime実装は後続#1679の責務として含めない。"
    green_commands:
      - kind: unit_test
        command: "npx vitest run tests/vmodel-pair.test.ts tests/design-language.test.ts --reporter=json --outputFile=.helix/evidence/review-1680/vitest-targeted.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-08T22:11:45Z"
        evidence_path: .helix/evidence/review-1680/vitest-targeted.json
        output_digest: "sha256:c13c1dad31999af424d314ec9a8b9ab4306b18998544d85f7b80d947c74f0ae3"
---

# 変更pathからのpin追従先事前導出

## 正本化スライス

Issue #1670で反復した追従漏れを、既存gateがredを出した後ではなくpush前に列挙する設計をfreezeする。
対象は実測済みのfeedback test-owner manifestとreviewed-safe semantic pinから開始し、adapter単位で追加する。
runtime source、実test、CLI配線はこのPLANでは所有せず、後続implementation PLANへ分離する。

## 未完了

- L6/L7 design pairの独立reviewとconfirmed化（完了）
- 後続implementation PLANによるruntime source、実test、CLI配線
- 本sliceの実測で未対応と確認したdesign catalog、V-pair、digest inventoryの逆引きadapter
- JSON generated surface、literal digest、集合／cross-table pin adapter
- Bugbot Aへの許可済みdeterministic refresh接続（別責務）
---
