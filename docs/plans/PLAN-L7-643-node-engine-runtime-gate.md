---
plan_id: PLAN-L7-643-node-engine-runtime-gate
title: "PLAN-L7-643 (impl): 実行中Nodeのengines適合をdoctorでfail-closeする"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
entry_signals: ["po_directive:Issue #660 local Node engines divergence"]
created: 2026-08-21
updated: 2026-08-21
owner: Claude / TL
github_issue_id: 660
behavior_contract_id: NODE-ENGINE-RUNTIME-GATE-001
responsibility_owner: node-engine-runtime-gate
engineering_discipline_required: true
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "engines.nodeの宣言とpinは検査されるが、実行中のNodeがその範囲を満たすかを検査するgateが無く、範囲外runtimeでローカルgateをgreenと報告できてしまう"
contract_postconditions: "doctorが実行中runtimeとengines.nodeの適合を判定し、範囲外・宣言欠落・解釈不能rangeをfail-closeする"
contract_invariants: "解釈できないrangeを適合とみなさない。宣言の有無とpin品質の判定は既存gateの責務であり重複させない"
contract_failures: "範囲外runtime、engines.node不在、AND連結以外のrange表記、壊れたversion表記をそれぞれ専用codeで拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "Issue #660の実測（runtime v22.23.1 vs engines >=24.15.0 <25 で検出されない）が既存Redであり、gateとoracleを同一atomic patchで導入するため未記録Red timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "既存gateが見ていない実行時適合という別軸を1 moduleで追加する。range解釈はAND連結に限定し、解釈不能を通さない側へ倒す"
removal_trigger: "engines.node由来のruntime判定をNode本体または共通toolchainが強制するようになり、本gateのfindingが恒常的に0となった時点で置換する"
parent_design: docs/design/helix/L6-function-design/node-engine-runtime-gate.md
pair_artifact: docs/test-design/helix/L8-node-engine-runtime-gate-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/node-engine-runtime-gate.md, oracle_id: U-NODEENG-001, test_path: tests/node-engine-runtime.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-engine-runtime-gate.md, oracle_id: U-NODEENG-002, test_path: tests/node-engine-runtime.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-engine-runtime-gate.md, oracle_id: U-NODEENG-003, test_path: tests/node-engine-runtime.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-engine-runtime-gate.md, oracle_id: U-NODEENG-004, test_path: tests/node-engine-runtime.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-engine-runtime-gate.md, oracle_id: U-NODEENG-005, test_path: tests/node-engine-runtime.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — engines range解釈とdoctor配線" }
  - { role: qa, slot_label: "QA — 境界値と解釈不能rangeの反例" }
  - { role: tl, slot_label: "TL — 既存engines gateとの責務境界" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-20T22:35:20Z"
  review_binding:
    reviewer: "Codex TL"
    reviewed_at: "2026-08-20T22:35:20Z"
    evidence_digest: "sha256:72e51dbe3186421052be7fc56d1a0ec97fc5a0a0e80444237665a64c41cc58da"
  entries: []
review_evidence:
  - reviewer: "Codex TL"
    review_kind: cross_agent
    reviewed_at: "2026-08-20T22:35:20Z"
    tests_green_at: "2026-08-20T22:35:05Z"
    verdict: approve
    worker_model: claude-code
    reviewer_model: gpt-5.6-codex
    scope: "PR #872 current HEAD 2bb0f0f3342097eb731eaa4c76d942361bb32772 のClaude著Node runtime gateを独立レビューした。range exact scope、doctor fail-close配線、failure code exact set、Issue #660実測負例を確認し、source mutation 5件を実測して5/5 killed・survived 0、復元後5 tests greenを確認した。Codex追加のdigest追従3ファイルは自己検収対象から除外し、Claude current-HEADレビューへ残す。receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/872#issuecomment-5362874922"
    green_commands:
      - kind: unit_test
        command: "npx vitest run tests/node-engine-runtime.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-20T22:35:05Z"
        evidence_path: tests/node-engine-runtime.test.ts
        output_digest: "sha256:8eb95673eb24e0a105d65df3f6c0412085c2fcb02e74df6bc21bdb983165e4a5"
        result: "1 file / 5 tests green; source mutation 5/5 killed"
mutation_oracle_evidence: "PR #872 HEAD 2bb0f0f3342097eb731eaa4c76d942361bb32772 で5変異を一件ずつ注入した。(1) out-of-range分岐をfalseへ固定、(2) unsupported range/version分岐をfalseへ固定、(3) declaration missing分岐をfalseへ固定、(4)上限比較<を<=へ変更、(5)下限比較>=を<=へ反転。全件tests/node-engine-runtime.test.tsがredとなり5/5 killed、survived 0。各変異復元後は5 tests greenかつsource bytesがHEADと一致した。"
generates:
  - { artifact_path: docs/plans/PLAN-L7-643-node-engine-runtime-gate.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/node-engine-runtime-gate.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-node-engine-runtime-gate-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/node-engine-runtime.ts, artifact_type: source_module }
  - { artifact_path: tests/node-engine-runtime.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L6-function-design/node-engine-runtime-gate.md
  requires: []
  references: []
  blocks: []
---

# 実行中Nodeのengines適合gate

## §背景

Issue #660は、ローカルNodeがv22.23.1で`engines.node`（`>=24.15.0 <25`、ADR-009 LTS範囲）を
満たさないまま、distribution readiness依存の2テストがローカルで常時failしていた事象である。
CIはNode 24でgreenのため、ローカルとCIのgate結果が静かに乖離した。

本PLAN起票時点でも同じ状態が再現している。Claude runtimeのセッションが
`node v22.23.1`で動いており、`helix doctor`はこれを検出しない。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | engines range解釈とruntime適合判定を実装 | [直列] | U-NODEENG-001..005 green |
| 2 | doctorへ配線し成功時出力を持たせる | [直列] | doctorがnode-engine-runtimeを報告 |
| 3 | 変異5件で検出力を実測 | [直列] | killed=5 survived=0 |
| 4 | targeted、全回帰、doctor、CI | [直列] | 同一HEAD green |
| 5 | Codex独立review | [review] | blocker 0 |

## §検出力

宣言したfailure codeが空虚でないことを変異注入で示す。範囲外判定の無効化、
解釈不能rangeの素通し、宣言欠落の素通し、上限比較の包含化、下限比較の反転の5件を
それぞれkillできることを実測する。

## §境界

`engines.node`の値は変更しない。ローカル環境の修復手段（Node導入手順の整備）は
本sliceの範囲外とし、gateは乖離の可視化までを担う。
SessionStartでのsurfaceは後続sliceで扱う。
