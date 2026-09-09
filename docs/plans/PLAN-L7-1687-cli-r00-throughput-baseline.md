---
plan_id: PLAN-L7-1687-cli-r00-throughput-baseline
title: "PLAN-L7-1687 (refactor): CLI-R00 throughput baselineをrepo-owned artifact/collector/testとして固定する"
kind: refactor
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
irreversible_impact: none
created: 2026-09-09
updated: 2026-09-09
owner: Cursor / TL
github_issue_id: 1687
responsibility_owner: cli-r00-throughput-baseline
behavior_contract_id: CLI-R00-THROUGHPUT-BASELINE-001
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "Issue #1687がCLI-R00でthroughput指標を列挙し、既存measurement-evidence-evaluator／Impact CI／harness-check shard契約が存在する。src/cli.tsは分割前monolithである。"
contract_postconditions: "13指標がmeasured／proxy／unmeasurableに分類され、同一条件再計測可能なfrozen artifactとpure collector、L6↔L8 pair、targeted testsが揃う。src/cli.tsとCLI契約は未変更。"
contract_invariants: "CLI command／option／exit code／JSON field／authority／fail-close／review／CI gateを変更しない。測定不能を測定済みへ偽装しない。検証削減を高速化と呼ばない。R01以降を実装しない。"
contract_failures: "指標欠落、proxyの直接観測化、測定不能の数値比較、条件軸の混在、未知key、短縮HEAD、collectorからsrc/cli.tsへの逆依存をfail-closeする。"
tdd_red_required: true
tdd_red_waiver_reason: "本sliceは新規collectorのcharacterizationであり、実装前に既存moduleが存在しない。oracleはmutationで欠落指標・分類偽装・条件混在を殺す。"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/cli-r00-throughput-baseline.test.ts が U-CLIR00-003/004/011/012 で測定不能の数値化、proxyのmeasured化、指標欠落、unmeasurable delta比較をいずれもfail/killする。"
complexity_effect: justified_positive
complexity_justification: "分割前baselineを後付けしないため、観測責務のpure moduleとfrozen artifactを1組追加する。CLI compositionと既存gateへ接続しない。"
removal_trigger: "CLI-R07が同一条件でcandidate比較を終えたあと、後継baseline schemaへ全consumerが移行し本v1 artifactの参照が0になった時。"
entry_signals: [structural]
agent_slots:
  - { role: aim, slot_label: "AIM — 測定可能／不能の分類と同一条件を固定" }
  - { role: se, slot_label: "SE — collectorとfrozen artifact" }
  - { role: qa, slot_label: "QA — mutationと構造再計測" }
  - { role: tl, slot_label: "TL — src/cli.ts非変更とR00原子scope" }
parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md
pair_artifact: docs/test-design/helix/L8-cli-r00-throughput-baseline-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-001, test_path: tests/cli-r00-throughput-baseline.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-002, test_path: tests/cli-r00-throughput-baseline.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-003, test_path: tests/cli-r00-throughput-baseline.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-004, test_path: tests/cli-r00-throughput-baseline.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-005, test_path: tests/cli-r00-throughput-baseline.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-006, test_path: tests/cli-r00-throughput-baseline.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-007, test_path: tests/cli-r00-throughput-baseline.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-008, test_path: tests/cli-r00-throughput-baseline.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-009, test_path: tests/cli-r00-throughput-baseline.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-010, test_path: tests/cli-r00-throughput-baseline.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-011, test_path: tests/cli-r00-throughput-baseline.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, oracle_id: U-CLIR00-012, test_path: tests/cli-r00-throughput-baseline.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REFACTOR
backprop_decision: not_required
backprop_decision_reason: "既存Requirement／Policy／CLI契約の意味は変えず、分割前throughput baselineの観測契約だけを追加するcharacterizationである。"
dependencies:
  parent: docs/process/modes/refactor.md
  requires: []
  references:
    - "issue:1687"
    - "issue:1353"
    - "issue:1040"
    - docs/design/helix/L6-function-design/measurement-evidence-evaluator.md
    - docs/design/helix/L6-function-design/ci-execution-telemetry.md
    - docs/design/helix/L6-function-design/impact-ci-recovery.md
    - docs/plans/PLAN-RECOVERY-40-lazy-typescript-cli-startup.md
generates:
  - { artifact_path: docs/plans/PLAN-L7-1687-cli-r00-throughput-baseline.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-cli-r00-throughput-baseline-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/cli-r00-throughput-baseline.ts, artifact_type: source_module }
  - { artifact_path: config/cli-r00-throughput-baseline.v1.json, artifact_type: json_config }
  - { artifact_path: tests/cli-r00-throughput-baseline.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
review_evidence: []
---

# PLAN-L7-1687: CLI-R00 throughput baseline

## 0. 目的

Issue #1687 の原子scope **CLI-R00** だけを閉じる。refactor着手前のthroughput baselineを
後付けせず、repo-owned artifact／collector／targeted testsとして固定する。

`src/cli.ts` は変更しない。CLI挙動、authority意味、gate、既存test、R01以降は対象外。

## 1. 着手時点のtree

開始branchは `refactor/1687-cli-r00-baseline`。baseline HEADは
`282ec52199c876976db02267df56622eed62cc3d`。Issue本文の main 観測
704,434 bytes は当時のorigin/mainであり、本branchは#1672／#1679取り込み後の
715,943 bytes を着手前実測とする。他PRの未merge差分は取り込まない。

## 2. 変更範囲

- L6設計とL8テスト設計のpair
- pure collector `src/runtime/cli-r00-throughput-baseline.ts`
- frozen artifact `config/cli-r00-throughput-baseline.v1.json`
- targeted tests
- 新規L6設計を既存`detailed-design` catalog itemへ登録（authority新設ではない）

## 3. 測定記録

| 指標 | 観測 | 値 | 条件 |
|---|---|---|---|
| CI_WALL_CLOCK | measured | 1445s | GitHub run 34380027551、main push、同一HEAD |
| FULL_REGRESSION_WALL_CLOCK | measured | 1434s | 同runのpreflight開始→finalize完了 |
| FULL_REGRESSION_INVOCATION_COUNT | measured | 1 | 同runで4 shardが起動。reuseではない |
| CLI_COMMAND_STARTUP_TIME | measured | p50=1827ms | Node 24.15.0、`tsx src/cli.ts --version`、n=5 |
| TARGETED_TEST_WALL_CLOCK | measured | p50=582ms n=3 | Node 24.15.0、同一テストpath。閾値oracleにしない |
| CHANGED_FILE_FAN_OUT | proxy | 1 | `src/cli.ts` |
| CHANGED_SYMBOL_FAN_OUT | proxy | top-level family数 | `program.command` 再抽出 |
| DIFF_BYTES / REVIEW_CONTEXT | proxy | 715943 bytes | token見積もりはsupportingのみ |
| collision proxy | proxy | family数 | 同時open PR数はhistorical note |
| CI_RERUN_COUNT / REVIEW_RECEIPT_REGEN_COUNT / BASE_SYNC_COUNT | unmeasurable | null | 理由をartifactへ残す |

隣接する別HEADのCI wall（1428／1382／1225／1328s）はhistorical noteであり、
同一条件sampleではない。

## 4. 完了条件（本原子scope）

- 13指標が分類され、測定不能が明示されている
- frozen artifactが同条件で構造proxyを再計測できる
- targeted testsがmutationを殺す
- `src/cli.ts` のdiffが空
- #1687全体の受入（inventory 100%、分割完了、R07比較）は残義務
