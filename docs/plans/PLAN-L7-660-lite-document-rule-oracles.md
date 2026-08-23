---
plan_id: PLAN-L7-660-lite-document-rule-oracles
title: "PLAN-L7-660 (impl): Lite配布文書guardを規則単位oracleへ固定する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-08-24
updated: 2026-08-24
owner: Codex / TL
github_issue_id: 970
behavior_contract_id: DISTRIBUTION-LITE-DOCUMENT-RULE-ORACLES-001
responsibility_owner: distribution-lite-consumer-documents
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: no_change
ddd_modeling_decision: none
contract_preconditions: "Lite配布文書guardとbuilder拒否境界がproduction実装済みである"
contract_postconditions: "空文書、配布先identity欠落、development guidance、builder接合、runtime third-party inputの各規則が独立反例でredになる"
contract_invariants: "配布文書bytes、document manifest schema、production failure codeを変更しない"
contract_failures: "各guardまたはbuilder拒否を除去したmutationを対応するU-DISTDOC oracleが検出する"
tdd_red_required: false
tdd_red_waiver_reason: "Issue #970に9 seeded defects中5件SURVIVEDの実測とbuilder誤admit反例が記録済みであり、未記録timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "production分岐を増やさず、規則単位fixtureとesbuild境界mockだけを追加する"
removal_trigger: "各規則が別のgenerated contract verifierへ置換され同等mutation evidenceが固定された時"
mutation_oracle_evidence: "Claude独立レビューでN2/N3/N4/N6/N7 SURVIVEDを実測。各規則を独立fixtureへ分解して削除mutationをred化する"
parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-documents-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:PR #963のClaude独立レビュー由来Issue #970を原子的に回収する"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-005, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-007, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-008, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-009, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-010, test_path: tests/distribution-lite-runtime-third-party.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — 規則単位mutation oracle" }
  - { role: tl, slot_label: "TL — production source不変とbuilder接合確認" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewer_session_id: "dc96b0e4-d8a6-4ba0-b7e9-a8e3c0d6ce8a"
    reviewed_at: "2026-08-23T21:48:51Z"
    tests_green_at: "2026-08-23T21:45:45Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude-opus-5
    reviewed_head_sha: 8ef48ba6e1bfdba310724ed9156cc747a659b915
    scope: "PR #973 current HEAD 8ef48ba6e1bfdba310724ed9156cc747a659b915をClaude Codeがread-onlyで検収し、Issue #970のN2/N3/N4/N6/N7 mutationをすべてKILLED、復元後10 tests green、production無変更を確認した。harness-check run 32667400539は全回帰テスト部分がgreenで、overall redはconfirm前のmerged-plan-statusのみ。非blocker指摘U-DISTDOC-005をverification_bindingsへ追加した。canonical comment: https://github.com/RetryYN/HELIX-HARNESS/pull/973#issuecomment-5388647609。receipt digestはこのPLANへ記録しない。"
    green_commands:
      - kind: unit_test
        command: "gh run view 32667400539 --repo RetryYN/HELIX-HARNESS --log | sed -n '32960,33080p' # vitest full regression step"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-23T21:45:45Z"
        evidence_path: tests/distribution-lite-documents.test.ts
        output_digest: "sha256:078e07b163951c3ec093946017a4b912e47f53eaaf8c87ae5c344be1ed0427e8"
        result: "全回帰のbulk 489 files / 4632 tests、stateful 1 file / 89 tests、slow 4 files / 137 testsがgreen。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-23T21:48:51Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-23T21:48:51Z"
    evidence_digest: "sha256:17def635c966df67f55d5fdeac70e101577f7912084edf68832568718072dd09"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-660-lite-document-rule-oracles.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-consumer-documents-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/distribution-lite-documents.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-runtime-third-party.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-658-lite-consumer-distribution-docs.md
  requires:
    - docs/plans/PLAN-L7-658-lite-consumer-distribution-docs.md
  references:
    - issue:970
  blocks:
    - issue:970
---

# Lite配布文書guardの規則単位検証

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | README反例の分離 | 正規READMEへ禁止句を挿入し、別規則による代替redを排除 |
| 2 | 文書別empty oracle | 5文書を個別に空白化して`document_empty`を確認 |
| 3 | identity／builder接合 | 配布先token欠落とclean commit上の文書redをexact failureで拒否 |
| 4 | runtime input境界 | esbuild metafileのthird-party inputをartifact生成前に拒否 |
| 5 | 回帰確認 | targeted、typecheck、Biome、PLAN lintがgreen |

## 境界

配布文面、manifest schema、production guard、publish経路は変更しない。
