---
plan_id: PLAN-L7-686-atomic-contract-id-authority
title: "PLAN-L7-686 (fix): atomic contract ID segment authorityを共有parserへ統一する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1088 atomic contract ID validator segment authority drift"
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
github_issue_id: 1088
behavior_contract_id: ATOMIC-CONTRACT-ID-AUTHORITY-001
responsibility_owner: atomic-contract-id-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
irreversible_impact: none
no_code_decision: modify
ddd_modeling_decision: value_object
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-26T20:57:44Z"
    tests_green_at: "2026-08-26T20:55:21Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: c7895aff-da7e-47a0-944a-36c68bb4f251
    reviewed_head_sha: f35a905da6620c8bc8a91ae439af55a54194e9a9
    scope: "PR #1089 current HEAD f35a905da6620c8bc8a91ae439af55a54194e9a9をClaude Code Opusが独立検収し、2〜6 segmentの共有parser、3 consumerのexact accept／reject集合、7 segment・小文字・空segmentのmutation killを確認した。類似regexは別概念として過剰統合せず、内容blocker 0と判定した。merge前のPLAN confirmed化のみを収束条件とした。review: https://github.com/RetryYN/HELIX-HARNESS/pull/1089#issuecomment-5431027565"
    green_commands:
      - kind: smoke
        command: "gh run view 33011095339 --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-26T20:55:21Z"
        evidence_path: tests/atomic-contract-id.test.ts
        output_digest: "sha256:0c442da71e285e7c86d50d49567ca317597057484761338e6630d241236ed2b9"
        result: "terminal success / HEAD f35a905da6620c8bc8a91ae439af55a54194e9a9"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-26T20:57:44Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-26T20:57:44Z"
    evidence_digest: "sha256:7b7b6bf30b6828e6c54efe3494ad8a7dc45d74887a17cca4f8e8f397162933e4"
  entries: []
backprop_decision: not_required
backprop_decision_reason: "ID文法のL3 backpropを本slice内でGH-AC-043へ直接反映済みであり、追加の上位集約taskは不要"
contract_preconditions: "PR／atomic slice／Issue closureがbehavior contract IDを独立regexで判定している"
contract_postconditions: "L3正本の2〜6 segment文法を共有parserへ投影し、全consumerが同じaccept／reject集合を返す"
contract_invariants: "既存の正規2〜6 segment ID、exactly-one behavior、owner、receipt照合の意味を変更しない"
contract_failures: "7／8 segmentまたは不正文法を一つのsurfaceだけが受理する、あるいは正規6 segmentを拒否する"
tdd_red_required: true
red_test: "U-ATOMIC-ID-002でIssue closureの7 segment受理を再現し、共有parser切替前にredとする"
mutation_oracle_evidence: "2026-08-27T04:47:09+09:00に共有parserの上限を6から8 segmentへ一時拡張し、U-ATOMIC-ID-002とU-ICGRAPH-006が7 segment受理を検出して2 failed／exit 1となるkillを実測した。apply_patchで上限6へ復元し、targeted 53 tests greenを再確認する"
complexity_effect: net_negative
complexity_justification: "3 consumerの重複regexを共有value-object parser 1件へ縮約し、新しいstate／DB／I/Oを追加しない"
removal_trigger: "behavior contract ID schemaのversion-upで新しいrequirements-owned parserへatomic migrationする時"
parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md
pair_artifact: docs/test-design/helix/L8-atomic-slice-admission-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-ID-001, test_path: tests/atomic-contract-id.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-ID-002, test_path: tests/atomic-contract-id.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-686-atomic-contract-id-authority.md, artifact_type: markdown_doc }
  - { artifact_path: src/schema/atomic-contract-id.ts, artifact_type: source_module }
  - { artifact_path: tests/atomic-contract-id.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L3-requirements/github-atomic-development-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/atomic-slice-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-atomic-slice-admission-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/github-guards.ts, artifact_type: source_module }
  - { artifact_path: src/lint/issue-closure-graph.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/atomic-slice-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-closure-graph.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/github-l3-trace-authority-hygiene.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-494-atomic-slice-admission.md
  requires:
    - docs/plans/PLAN-L7-494-atomic-slice-admission.md
    - docs/design/helix/L3-requirements/github-atomic-development-requirements.md
  references:
    - issue:1088
  blocks: []
agent_slots:
  - { role: se, slot_label: "SE — shared parser／consumer migration" }
  - { role: qa, slot_label: "QA — 6／7／8 segment boundary mutation oracle" }
  - { role: tl, slot_label: "TL — requirements／PR／Issue closure exact-set監査" }
---

# PLAN-L7-686: atomic contract ID authority統一

## 目的

正本に文法を追加し、最大6 segmentと8 segmentへ分岐しているconsumerを共有parserへ収束させる。
値の推測補正やlegacy outputは追加しない。

## 検証

1. 2 segmentと6 segmentの境界値を受理する。
2. 7／8 segment、小文字、空segment、連続hyphen、空白、underscoreを拒否する。
3. PR scope、atomic slice runtime、Issue closureが同じ共有parserを呼ぶ。
4. targeted suite、typecheck、PLAN lint、doctorをcurrent HEADで実行する。

## 非対象

一般purpose contract ID、semantic contract、tool contract、既存IDの一括renameは変更しない。
