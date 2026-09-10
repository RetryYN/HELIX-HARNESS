---
plan_id: PLAN-RECOVERY-1684-requirement-definition-trace-census
title: "Requirement↔Definition trace census 第一slice"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-09
updated: 2026-09-11
github_issue_id: 1684
behavior_contract_id: REQUIREMENT-DEFINITION-TRACE-CENSUS-001
responsibility_owner: requirement-ir-authority
engineering_discipline_required: true
no_code_decision: add_code
ddd_modeling_decision: pure_function
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
contract_preconditions: "canonical Requirement IR shardsと既存owner/digest関数をread-onlyで取得できる"
contract_postconditions: "宣言済みstable IDからedge recordとorphan/stale/ambiguous/valid shared finding exact setを再構築する"
contract_invariants: "要求本文を書き換えず、意味推測せず、正当なmany-to-many共有をduplicateにせず、DB/GitHub writeとsrc/cli.ts編集を行わない"
contract_failures: "未解決ID、revision不一致、owner不一致、入力不正をsilent greenまたはduplicateへ変換しない"
tdd_red_required: true
red_at: "2026-09-09T18:21:27Z"
green_at: "2026-09-09T18:27:21Z"
mutation_oracle_evidence: "2026-09-09T18:27:08ZにVALID_SHARED_REQUIREMENTの発火閾値をresolved.length>=2から>=99へ変異させ、U-RDTC-001が1 failed / 6 skipped、exit 1となった。共有DefinitionをVALID_SHAREDへ分類しない退行をkillした。閾値を2へ復元後、2026-09-09T18:27:21Zに7 tests green、biome 0、tsc 0を再実測した。"
complexity_effect: justified_positive
complexity_justification: "既存IR宣言フィールドのread-only compiler一箇所へtrace棚卸しを集約し、機能台帳や意味修復を増やさない"
removal_trigger: "後続censusが同一edge/finding契約をCLI/doctorへ統合し、本pure coreの独立所有が不要になった時"
entry_signals:
  - "po_directive:Issue #1684 Requirement↔Definition trace censusのread-only deterministic第一slice"
parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md
pair_artifact: docs/test-design/helix/L8-requirement-definition-trace-census-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, oracle_id: U-RDTC-001, test_path: tests/requirement-definition-trace-census.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, oracle_id: U-RDTC-002, test_path: tests/requirement-definition-trace-census.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, oracle_id: U-RDTC-003, test_path: tests/requirement-definition-trace-census.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, oracle_id: U-RDTC-004, test_path: tests/requirement-definition-trace-census.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, oracle_id: U-RDTC-005, test_path: tests/requirement-definition-trace-census.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, oracle_id: U-RDTC-006, test_path: tests/requirement-definition-trace-census.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, oracle_id: U-RDTC-007, test_path: tests/requirement-definition-trace-census.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, oracle_id: U-RDTC-008, test_path: tests/requirement-definition-trace-census.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, oracle_id: U-RDTC-009, test_path: tests/requirement-definition-trace-census.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, oracle_id: U-RDTC-010, test_path: tests/requirement-definition-trace-census.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, oracle_id: U-RDTC-011, test_path: tests/requirement-definition-trace-census.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1684", "issue:825", "issue:1170", "issue:1169", "issue:1033", "issue:1682"]
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1684-requirement-definition-trace-census.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-definition-trace-census.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-definition-trace-census-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/requirements/requirement-definition-trace-census.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-definition-trace-census.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — #1684のread-only境界と#1682/#1170非侵食を監査" }
  - { role: se, slot_label: "SE — 宣言IDからのdeterministic edge compiler" }
  - { role: qa, slot_label: "QA — orphan/stale/ambiguous/shared反例" }
  - { role: tl, slot_label: "TL — 既存owner再利用と第一slice原子scope" }
review_evidence:
  - reviewer: "Claude Code / claude-fable-5-1"
    review_kind: cross_agent
    reviewed_at: "2026-09-10T16:37:15Z"
    tests_green_at: "2026-09-10T16:30:37Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: "44a875e0-4347-4802-8e8a-87cb4f105537"
    reviewed_head_sha: 294abafbea40d361fbdd9b7b682331028de231c1
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1723#issuecomment-5622122101"
    scope: "PR #1723 HEAD 294abafbea40d361fbdd9b7b682331028de231c1の第一sliceを独立検収。旧4 blockerの反例再実行、U-RDTC-010/011、51/51 targeted Vitest、commit済みevidence bytesを照合しblockers 0。CI failureはdraft PLANのmerged-plan-statusのみであり、本転記とconfirmed化後のsuccess世代、ready世代、main read-afterを別途必要とする。Issue #1684全体やdoctor/CLI/DB統合の完了を主張しない。"
    green_commands:
      - kind: test
        command: "npx vitest run tests/requirement-definition-trace-census.test.ts --reporter=json --outputFile=.helix/evidence/review-1723/vitest-targeted-final.json"
        runner: vitest
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-10T16:30:37Z"
        evidence_path: .helix/evidence/review-1723/vitest-targeted-final.json
        output_digest: "sha256:39c34feebb299f5451e70d83415eb0a9f70ad9333a718524a4577de6576dbb96"
---

# Requirement↔Definition trace census 第一slice

## 目的

Issue #1684の第一sliceとして、RequirementとDefinitionを文書単位の1対1へ固定せず、canonical
Requirement IRのstable IDから多対多traceを再構築する。本sliceはread-only deterministic coreと
targeted testsに限定する。

## 第一sliceの範囲

- Requirement → Definition の`REFINES`
- Definition → Requirement の`SATISFIES`
- 複数Requirementが同一Definitionを共有する`SHARED_BY`と`VALID_SHARED_REQUIREMENT`
- Requirement → Acceptance の`ACCEPTED_BY`
- orphan / stale revision / ambiguous owner の最低限finding

再利用するauthorityは`primary_system_contract_id`、`downstream_obligation.owner_id`、
`system_contract.requirement_ids`、`acceptance_ids`、既存`requirementIrSemanticDigest`である。
新しいownerや意味digestは作らない。

## 受入条件

- [x] 宣言済みIDからedge record exact setを再構築できる。
- [x] 正当なmany-to-many共有をduplicateとして検出しない。
- [x] orphan / stale / ambiguous を個別分類できる。
- [x] 要求本文の自動書換え、意味推測、DB/GitHub write、`src/cli.ts`編集、#1682/#1685再実装が無い。
- [x] targeted testsがgreenである。

## 非対象

#1170の意味保存修復、#1169 Requirement Re-entry、#1682機能台帳runtime、unbound
implementation / operation evidence、doctor/CLI配線、新scheduler、全Requirementの一括merge/split。

## 残義務

Issue #1684全体のAC 2〜11、mutation/doctor/DB replay、Claude exact-HEAD review、main
read-afterは後続sliceである。本PLANの`completion_claim_allowed`はfalseを維持する。
