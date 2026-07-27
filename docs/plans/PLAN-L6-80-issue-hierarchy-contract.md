---
plan_id: PLAN-L6-80-issue-hierarchy-contract
title: "PLAN-L6-80 (add-design): GitHub Issue階層とREADY leaf抽出契約"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-28 Featureを通常Forwardの承認待ちにせずAdd-feature Route Bで完遂する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 164
engineering_discipline_required: true
behavior_contract_id: U-IHIER-001
responsibility_owner: github-issue-hierarchy
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "Issue候補が機械可読なrole、parent、依存、duplicate search、dispositionを持つ"
contract_postconditions: "階層監査が構造違反をfail-closeし、open active non-blocked leafだけをREADYとして返す"
contract_invariants: "GitHubはprojectionであり正本DBを置換せず、新DB schema、新CI job、外部dependencyを追加しない"
contract_failures: "親欠落、orphan、cycle、深さ8超、子100超、非対称依存、duplicate不整合をfindingとして返す"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "既存Issue templateと単一pure validatorだけを変更し、平坦探索と重複起票を減らす"
removal_trigger: "harness.dbの共通graph validatorがGitHub Issue projectionを同一契約で扱える時点で統合する"
pair_artifact: docs/test-design/helix/L6-issue-scope-authority-gates-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — Issue階層value objectと最小公開関数の設計" }
  - { role: qa, slot_label: "QA — 構造違反とREADY leafの反例設計" }
  - { role: tl, slot_label: "TL — Add-feature Route Bと後段Reverse境界の確認" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-80-issue-hierarchy-contract.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-issue-scope-authority-gates-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/process/modes/add-feature.md
  references:
    - docs/governance/github-issue-hierarchy-rules.md
  blocks:
    - docs/plans/PLAN-L7-475-issue-hierarchy-contract.md
---

# PLAN-L6-80: GitHub Issue階層とREADY leaf抽出契約

## 目的

Add-feature Route BのL6差分設計として、Issue階層の値オブジェクト、監査failure、
READY leaf抽出条件を`U-IHIER-001`へ固定する。既存HDS-HIL-05全体のconfirmは行わず、
同一責務の差分だけをL7実装へ渡す。

## 設計リファクタリング判定

既存templateの設定だけではcycle・orphan・非対称依存を検査できず、既存graph validatorの再利用先もない。
新DB schemaやadapterを作らず、pure parser／audit／selectorの三関数へ限定する案が最小である。

## 完了条件

- L6設計とunit test設計に`U-IHIER-001`のpre/post/invariant/failureが一致して記載される。
- L7 add-implが本PLANを`dependencies.parent`として参照する。
- 通常Forwardを緩和せず、Add-feature Route Bだけが後段Reverse前の先行buildとして扱われる。

## 確認状態

本PLANがconfirmするのは`U-IHIER-001`の追加差分だけであり、既存HDS-HIL-05全体ではない。
人間signoffを持たないAdd-feature契約に従い、設計・pair oracle・L7 parent bindingの一致をもって
agent confirmとする。
