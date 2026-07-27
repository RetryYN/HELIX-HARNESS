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
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-27T17:57:00Z"
    tests_green_at: "2026-07-27T17:55:40Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #157 の current HEAD 6e05e620 で本 add-design PLAN を独立レビューした。issue-scope-authority-gates.md へ追加された §0.1 は parseIssueHierarchyContract / auditIssueHierarchy / readyLeafIssues の事前条件・事後条件・不変条件を U-IHIER-001 として固定し、L7 実装 (src/runtime/issue-hierarchy.ts) の振る舞いと一致することを確認した。pair_artifact の docs/test-design/helix/L6-issue-scope-authority-gates-unit-test-design.md も同一契約を参照する。本 PLAN は HDS-HIL-05 全体の confirm を主張せず同一 responsibility の差分だけを所有すると明記しており、PLAN-L1-07 slice の pair-freeze を迂回していない。追加コードを pure parser/audit/selector に限定し GitHub client・DB schema・CI job・常駐処理を増やさない制約も L7 実装と整合する。後段 Reverse まで completion_claim_allowed=false とする保留も明記済み。非 blocker: 本 PLAN は status=confirmed だが generates 対象の issue-scope-authority-gates.md 自体は status=draft のままであり、差分所有と doc status の対応が読み取りにくい。Issue へ分離する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/issue-hierarchy.test.ts tests/plan-descent.test.ts tests/branch-kind.test.ts tests/backfill-pairing.test.ts tests/setup.test.ts tests/digest.test.ts tests/l3-g3-freeze-packet-v2.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-27T17:55:40Z"
        evidence_path: tests/issue-hierarchy.test.ts
        output_digest: "sha256:e7081b53778f26fd80374b96506af2d3b044f77649b426a3e5ac1dff7f22aa1b"
        result: "139 passed"
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
