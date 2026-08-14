---
plan_id: PLAN-L5-101-measurement-evidence-evaluator
title: "PLAN-L5-101 (add-design): measurement observation と evaluation result schema 詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
completion_claim_allowed: false
route_mode: add-feature
entry_signals: ["po_directive:Issue #220 の L4 measurement evaluation contract を exact schema へ降下する"]
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 220
engineering_discipline_required: true
behavior_contract_id: MEASUREMENT-EVIDENCE-EVALUATOR-001
responsibility_owner: measurement-harness
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-74 が declaration／immutable observation／trusted evaluation time、6つの独立status、unknown propagation、#221との責務境界を定義している"
contract_postconditions: "helix-measurement-evaluation.v1 の input／observation／window／baseline binding／result／finding exact schemaとU-MEVAL-001..015を固定する"
contract_invariants: "異revision／異HEAD／異context／不正時刻／非finite値を補完しない。各statusを独立保持し、全必須statusが成立した場合だけgreenを返す。入力はimmutableで、clock／probe／network／DBへ触れない"
contract_failures: "unknown field、binding drift、stale、不正window、sample不足、非代表ratio、未知comparator、unit mismatch、baseline不在／不一致、hard limit不明／超過、finding順序driftをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。本PLANはL5/L8 pairのschemaとunit oracleを固定し、実装とRed→GreenはPLAN-L7-560が担う"
complexity_effect: net_negative
complexity_justification: "曖昧なmeasurement booleanをexact inputと独立statusへ分解し、metric固有判定と共通評価の二重実装を防ぐ"
removal_trigger: "helix-measurement-evaluation.v1 の後継schemaへreceipt付きmigrationが完了し、v1 consumerが0になった時"
pair_artifact: docs/test-design/helix/L8-measurement-evidence-evaluator-unit-test-design.md
backprop_decision: not_required
backprop_decision_reason: "confirmed L4/L9 contractを型とunit oracleへ具体化し、上位要求の意味を変更しない"
agent_slots:
  - { role: se, slot_label: "SE — observation／window／result exact schema詳細化" }
  - { role: qa, slot_label: "QA — U-MEVAL-001..015と境界／mutation観点" }
  - { role: tl, slot_label: "TL — #219 declarationと#221 probe/historyの責務境界監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/measurement-evidence-evaluator.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-measurement-evidence-evaluator-unit-test-design.md, artifact_type: test_design }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-14T12:36:18Z"
    tests_green_at: "2026-08-14T12:36:18Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: claude:claude-opus-5
    scope: "PR #690 current HEAD 54f808c8 のL5/L8 sliceをclean detached worktreeでread-only独立レビュー。L5↔L8双方向pair、catalog/freeze/lint/testの同一digest pin、exact scope、未実装citationを持たないdraft L8 oracle、#221との責務境界を確認しblocker 0。L6/L7とIssue #220 closureは未確認・未完了として除外した。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/design-coverage.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/vmodel-pair.test.ts tests/gate-static.test.ts tests/backfill-pairing.test.ts tests/design-language.test.ts tests/ci-governance-self-heal.test.ts tests/oracle-test-trace.test.ts tests/left-arm-carry-log.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-14T12:36:18Z"
        evidence_path: docs/test-design/helix/L8-measurement-evidence-evaluator-unit-test-design.md
        output_digest: "sha256:9332085e12cd3eab66786fec40630436a4c6175bbd2a77a98fc15824fa75d2fb"
        result: "170 passed (9 files)"
dependencies:
  parent: docs/plans/PLAN-L4-74-measurement-evidence-evaluator.md
  requires:
    - docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md
    - docs/design/helix/L5-detail/nfr-typed-registry-quality-taxonomy.md
  blocks:
    - docs/plans/PLAN-L6-107-measurement-evidence-evaluator.md
    - issue:220
---

# measurement observation と evaluation result schema 詳細設計（L5/L8 pair）

## 目的

L4の責務境界を、受理済みNFR declarationを参照するimmutable observation、trusted evaluation time、
6つの独立status、stable finding、最終verdictのexact schemaへ降ろす。L8は各分岐へ到達するunit oracleを
定義し、L6/L7実装前の将来oracleとしてdraftを維持する。

## 設計判断

- observationはregistry declarationを複製せず、stable ID／revisionと測定contextを明示束縛する。
- time、ratio、sample count、metric valueは型だけでなくfinite／range／順序を検査する。
- baselineとhard limitはthreshold passから独立させ、unknownをpassへ変換しない。
- findingはstable code順、重複なしとし、入力順やobject key順へ依存しない。
- probe起動、retry、scheduler、event/history writeは#221へ、pure evaluator実装はL6/L7へ残す。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | input／observation／window exact schemaを定義 | [直列] | binding材料が省略不能 |
| 2 | status／finding／verdict schemaを定義 | [直列] | unknown propagationが一意 |
| 3 | L8 unit oracleを定義 | [直列] | U-MEVAL-001..015が全分岐を反証 |
| 4 | 独立レビュー | [review] | current HEAD blocker 0 |

本PLANは独立レビューとdraft HEAD CI greenを確認してconfirmedとした。L8 oracleはL6/L7実装前のためdraftを維持する。
