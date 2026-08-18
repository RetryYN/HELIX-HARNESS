---
plan_id: PLAN-L4-73-nfr-typed-registry-quality-taxonomy
title: "PLAN-L4-73 (add-design): NFR typed registry と quality taxonomy の基本設計"
kind: add-design
layer: L4
drive: agent
status: draft
completion_claim_allowed: false
route_mode: add-feature
entry_signals:
  - "po_directive:Issue #219 の全 NFR typed registry と quality taxonomy を HR-NFR-REG-001..003 へ exact trace する"
created: 2026-08-12
updated: 2026-08-12
owner: Codex / TL
github_issue_id: 219
engineering_discipline_required: true
behavior_contract_id: NFR-TYPED-REGISTRY-001
responsibility_owner: nfr-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: policy
contract_preconditions: "requirements v1.3 §4.3 の HR-NFR-REG-001..007 が current authority であり、Issue #219 はこのうち registry／authority／taxonomy の 001..003 を担当する。nfr-grade 文書は compatibility material であり authority に昇格させない"
contract_postconditions: "stable ID を持つ NFR declaration、標準9特性とAI固有7特性、5種類の source authority、read-only structural admission、L9 system oracle の責務境界を固定し、測定・probe実行・履歴保存を #220／#221 へ分離する"
contract_invariants: "L1=能力、L3=観測可能挙動、ADR=技術選択、policy=閾値運用、runtime profile=環境値を混在させない。物理path名からcanonical layerを推定しない。registryは評価・実行・永続化を行わない"
contract_failures: "unknown ID／quality、authority欠落・混在、実装方式混入、metric/context/owner/oracle欠落、source digest drift、重複ID、partial registryをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。本 PLAN は L4/L9 pair の責務境界と system oracle を固定し、production code の red→green は PLAN-L7-550 で扱う"
complexity_effect: net_negative
complexity_justification: "NFR の散在 prose を単一 typed declaration と pure admission 境界へ集約し、測定・probe・DB責務を後続 Issue へ分離する"
removal_trigger: "typed NFR declaration が後継 schema へ移行し、同等以上の stable-ID・authority・taxonomy admission が current authority になった時"
pair_artifact: docs/test-design/helix/L9-nfr-typed-registry-quality-taxonomy-system-test-design.md
backprop_decision: not_required
backprop_decision_reason: "HR-NFR-REG-001..003 の既存要求を基本設計へ降下する additive change であり、上位要求の意味は変更しない"
agent_slots:
  - { role: aim, slot_label: "AIM — registry／measurement／probe責務境界とauthority分離" }
  - { role: qa, slot_label: "QA — partial registryとauthority driftのL9 fail-close oracle" }
  - { role: tl, slot_label: "TL — requirements v1.3 exact traceと#220／#221境界監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/nfr-typed-registry-quality-taxonomy.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-nfr-typed-registry-quality-taxonomy-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-06-helix-pillar-descent.md
  requires:
    - docs/governance/helix-harness-requirements_v1.3.md
  blocks:
    - docs/plans/PLAN-L5-99-nfr-typed-registry-quality-taxonomy.md
    - issue:219
---

# NFR typed registry と quality taxonomy の基本設計（L4/L9 pair）

## 目的

Issue #219 の behavior contract を、NFR declaration の登録境界と system-level fail-close oracle に
分解する。NFR を実装方式や単発の測定結果から切り離し、stable ID と source authority を持つ
機械可読 declaration として扱う。

## 対象と非対象

- 対象: `HR-NFR-REG-001..003`、標準9特性、AI固有7特性、5 authority role、revision、
  source digest、structural doctor admission を対象とする。
- 非対象: metric の意味評価と threshold 判定（#220）、probe 実行・時系列・DB保存（#221）、
  finding disposition（#223）、`HR-NFR-REG-004..007` の測定基盤。
- `docs/design/**/nfr-grade.md` は compatibility material のため source authority として受理しない。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | L4 の責務境界・taxonomy・authority 分離を固定 | [直列] | HR-NFR-REG-001..003 が orphan 0 |
| 2 | L9 doctor oracle を固定 | [直列] | missing／invalid／partial が green へ縮退しない |
| 3 | L5/L8 schema と L6/L7 実装へ降下 | [並列] | pair ごとの依存順序を維持 |
| 4 | 独立レビュー | [review] | current HEAD の blocker 0 と green command receipt |

本 PLAN は `status: draft` であり、独立レビューと current-head CI が揃うまで confirmed／完了を主張しない。
