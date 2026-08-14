---
plan_id: PLAN-L4-74-measurement-evidence-evaluator
title: "PLAN-L4-74 (add-design): measurement evidence evaluator 基本設計"
kind: add-design
layer: L4
drive: agent
status: confirmed
completion_claim_allowed: false
route_mode: add-feature
entry_signals:
  - "po_directive:Issue #220 の measurement context／freshness／representativeness／threshold 判定を HR-NFR-REG-004/006 へ exact trace する"
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
ddd_modeling_decision: policy
contract_preconditions: "Issue #219 の typed NFR registry が current declaration authority であり、observation は workload／environment／data／sampling／window／HEAD／evidence digest と trusted evaluation time を明示する"
contract_postconditions: "binding、freshness、representativeness、thresholdを独立した決定論的statusへ評価し、baseline不明、baselineとobservationのHEAD／dataset不一致、stale、非代表、hard limit超過、推測値をgreenへ縮退しないL4/L9境界を固定する"
contract_invariants: "pure evaluatorはprobe実行、network、clock read、DB／履歴writeを行わない。final greenは全必須statusが成立した時だけ導出し、unknownをpassへ変換しない"
contract_failures: "declaration／observation binding不一致、欠落・非finite値、期限超過、代表率不足、比較方向・単位不一致、baseline／hard limit不明をstable findingとしてfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。本PLANはL4/L9 pairの責務境界とsystem oracleを固定し、production codeのred→greenは後続PLAN-L7-560で扱う"
complexity_effect: net_negative
complexity_justification: "NFRごとの個別boolean判定を一つのpure evaluator contractへ統合し、宣言・観測・実行・履歴の責務を分離する"
removal_trigger: "後継measurement evaluatorが同等以上のbinding／freshness／representativeness／threshold fail-close契約を提供し全consumerが移行した時"
pair_artifact: docs/test-design/helix/L9-measurement-evidence-evaluator-system-test-design.md
backprop_decision: not_required
backprop_decision_reason: "HR-NFR-REG-004/006とrequirements受入条件の既存意味を基本設計へ降下するadditive changeで、上位要求を変更しない"
agent_slots:
  - { role: aim, slot_label: "AIM — registry／observation／probe履歴の責務境界" }
  - { role: qa, slot_label: "QA — unknown propagationと境界値のL9反証" }
  - { role: tl, slot_label: "TL — requirements exact traceと#221非侵入監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-measurement-evidence-evaluator-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-06-helix-pillar-descent.md
  requires:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L4-basic-design/nfr-typed-registry-quality-taxonomy.md
    - docs/plans/PLAN-REVERSE-494-nfr-typed-registry-backfill.md
  blocks:
    - docs/plans/PLAN-L5-101-measurement-evidence-evaluator.md
    - issue:220
review_evidence:
  - reviewer: "Claude Code / claude-opus-5[1m] / session bdb26009-560e-4d33-915d-f63d371da79c"
    review_kind: cross_agent
    reviewed_at: "2026-08-14T11:09:04Z"
    tests_green_at: "2026-08-14T11:09:04Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: claude:claude-opus-5
    scope: "PR #689 HEAD 91b1dbf97cdd6b80d7305c57c9a24398def10b8e のclean detached worktreeでL4/L9 pair、design catalog登録、catalog digest再pinと指定7 suiteをClaude Code session bdb26009-560e-4d33-915d-f63d371da79cが独立検証し、PASS / blocker 0とした。probe実行・履歴・DB保存は#221へ残す。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/design-coverage.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/vmodel-pair.test.ts tests/gate-static.test.ts tests/backfill-pairing.test.ts tests/design-language.test.ts tests/ci-governance-self-heal.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-14T11:09:04Z"
        evidence_path: docs/test-design/helix/L9-measurement-evidence-evaluator-system-test-design.md
        output_digest: "sha256:1812c12c2ba5e622f57ee97f3358486e5b9226d82d2c58952f49a403fbdfde7c"
        result: "144 passed (7 files)"
---

# measurement evidence evaluator 基本設計（L4/L9 pair）

## 2026-08-14 訂正記録

PR #691のClaude独立reviewで、旧`contract_postconditions`の「異HEAD」がdeclaration bindingとbaseline bindingを
区別せず、current HEAD admissionまでevaluator責務に見せる過大claimと判明した。L4 §3〜§5／L9と同じく、
evaluatorが拒否するのはbaseline bindingとcurrent observationのHEAD／dataset不一致であり、observation自体の
current HEAD／dataset admissionは#221が担う意味へ訂正した。requirementsのfail-close意味は変更しない。

## 目的

Issue #220 の behavior contract を、受理済み NFR declaration と immutable observation から
検証状態を導出する pure evaluator と、system-level fail-close oracleへ分解する。

## 対象と非対象

- 対象: context binding、freshness、representativeness、threshold、baseline、hard limit、最終verdict。
- 対象: `HR-NFR-REG-004/006` の測定対象と反証手法を共通contractへ束縛すること。
- 非対象: probe実行、retry、scheduler、metric event／履歴／DB保存（#221）。
- 非対象: finding disposition（#223）とworkflow固有allocation判断（#188）。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | L4で宣言／観測／評価／履歴の境界を固定 | [直列] | #219／#221との責務重複0 |
| 2 | L9でunknown／stale／非代表／閾値違反を反証 | [直列] | false-green 0 |
| 3 | L5/L8 schemaへ降下 | [直列] | statusとfindingが一意 |
| 4 | L6/L7 pure evaluatorを実装 | [直列] | current-head review／CI green |

本PLANは上記current-head独立レビューでL4/L9設計sliceだけをconfirmed化する。L5/L8、L6/L7、
Issue #220全体、probe/historyを完了扱いにしない。
