---
plan_id: PLAN-L7-475-issue-hierarchy-contract
title: "PLAN-L7-475 (add-impl): GitHub Issue階層化とREADY leaf抽出契約"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-27 Issue増殖を防ぎ、親子・依存・重複・次タスク抽出を階層化する"
created: 2026-07-27
updated: 2026-07-27
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
contract_preconditions: "Issue候補がrole、parent、依存、duplicate search、dispositionを機械可読blockで提示する"
contract_postconditions: "孤児・cycle・非対称依存・上限超過を拒否し、open active non-blocked leafだけを次dispatch候補にする"
contract_invariants: "GitHubを第二正本にせず、新DB schema、新CI job、外部dependencyを追加しない"
contract_failures: "親欠落、親不在、cycle、深さ8超、子100超、依存非対称、duplicate不整合をfail-closeする"
tdd_red_required: true
red_at: "2026-07-27T23:18:00+09:00"
green_at: "2026-07-27T23:24:00+09:00"
mutation_oracle_evidence: "tests/issue-hierarchy.test.tsがorphan、parent cycle、非対称blocks、欠落contractのseeded反例を拒否する。これらの検査を素通しするmutation (orphan許容、cycle検出除去、片側依存許容、contract regex緩和) は同oracleにkillされredになり、valid treeのREADY leafだけを返す実装だけがgreenで残る"
complexity_effect: justified_positive
complexity_justification: "単一pure validatorと既存Issue template拡張だけで、平坦Issue探索と重複起票を削減する。DB schema、network client、CI jobは増やさない"
removal_trigger: "GitHub sub-issue projectionとharness.db issue graphが既存共通graph validatorへ統合された時点で本moduleを統合する"
parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-001, test_path: tests/issue-hierarchy.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — Issue hierarchy value objectとaudit"
  - role: qa
    slot_label: "QA — orphan、cycle、duplicate、READY leaf反例"
  - role: tl
    slot_label: "TL — GitHub projection正本境界とIssue #81収束"
generates:
  - { artifact_path: docs/plans/PLAN-L7-475-issue-hierarchy-contract.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/github-issue-hierarchy-rules.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/issue-hierarchy.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-hierarchy.test.ts, artifact_type: test_code }
  - { artifact_path: .github/ISSUE_TEMPLATE/add-feature.md, artifact_type: template }
  - { artifact_path: .github/ISSUE_TEMPLATE/recovery.md, artifact_type: template }
  - { artifact_path: docs/templates/github/common/add-feature.md, artifact_type: template }
  - { artifact_path: docs/templates/github/common/recovery.md, artifact_type: template }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-27T14:24:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-27T17:57:00Z"
    evidence_digest: "sha256:7f95427954c804386122cc9abdc9e64fc8a41f6c56ae003e0b599434ff486e66"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-27T17:57:00Z"
    tests_green_at: "2026-07-27T17:55:40Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #157 の current HEAD 6e05e620 を clean detached worktree で再レビューし、前回 HEAD af9c12bb で block とした B-1 の解消を確認した。B-1 の実体は #157 固有の実装欠陥ではなく plan-descent の駆動モデル不整合だったという Codex の主張を、正本で裏取りした: docs/process/modes/add-feature.md の IMP-043 は本 PR 以前から『経路 B の add-impl (L7) は Reverse より前に存在する bottom-up build であり、この先行実装は禁止対象ではない』『ただし G7 4-artifact trace 凍結は Reverse が G3 ペア凍結を閉じるまで保留』と明記しており、Route B は新設概念ではなく既存 authority である。gate 側の除外は kind=add-impl かつ route_mode=add-feature に限定され、通常 impl と Forward add-impl の設計先行規律は維持される (src/lint/plan-descent.ts の条件を diff で確認)。補償制御として backfill_state=pending_reverse と completion_claim_allowed=false が PLAN へ記録され、backfill gate は当該 PLAN を conditionalPending として surface する。PLAN-L6-80 が同一 responsibility U-IHIER-001 の L6 差分設計と L6 test design pair を供給する。実装本体 (auditIssueHierarchy の cycle/対称性/duplicate/READY leaf、parseIssueHierarchyContract の fail-close) は前回 review の結論どおり欠陥なし。gate 3 本の変更には design doc 更新と反例 test が伴い、tests/plan-descent.test.ts・branch-kind.test.ts・backfill-pairing.test.ts を含む 7 suite 139 passed。doctor の plan-descent と merged-plan-status は OK へ回復した。非 blocker 3 件 (gate 変更が U-IHIER-001 Feature へ同梱され所有 responsibility PLAN 側に review evidence が無い、branch-kind の feature 拡張は add/ への branch rename で回避可能、issue-scope-authority-gates.md が PLAN-L6-80 confirmed 下でも status=draft のまま) は Issue へ分離し current PR を収束させる。"
    green_commands:
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-27T17:53:00Z"
        evidence_path: src/lint/plan-descent.ts
        output_digest: "sha256:da6c24c30c6af4aadbb378f824798137c7a8664674cfa9aa7157b6b3619a1089"
        result: "exit 0"
      - kind: unit_test
        command: "npx --no-install vitest run tests/issue-hierarchy.test.ts tests/plan-descent.test.ts tests/branch-kind.test.ts tests/backfill-pairing.test.ts tests/setup.test.ts tests/digest.test.ts tests/l3-g3-freeze-packet-v2.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-27T17:55:40Z"
        evidence_path: tests/issue-hierarchy.test.ts
        output_digest: "sha256:e7081b53778f26fd80374b96506af2d3b044f77649b426a3e5ac1dff7f22aa1b"
        result: "139 passed"
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-27T15:14:00Z"
    tests_green_at: "2026-07-27T15:12:30Z"
    verdict: block
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #157 の current HEAD af9c12bb を clean detached worktree で独立レビューした (requested_head 513b786b ではなく current HEAD を正本とした)。実装品質としての欠陥は無い: auditIssueHierarchy の parent cycle は visited set と depth>8 の二重打ち切りで停止し、parent 欠落時は byNumber.get が undefined を返して loop が終了するため無限走査にならない。blocks/blocked_by の対称性は双方向に検査され片側欠落を relation_not_symmetric で拒否する。duplicate は disposition=duplicate かつ自己参照でない既存 target を要求し、duplicate_of 単独指定を duplicate_disposition_invalid で拒否する。readyLeafIssues は open/active/leaf/blockedBy 全 closed/自身に finding 無しの task/finding だけを返し、tests/issue-hierarchy.test.ts の valid tree で [151] のみに絞られることを確認した。parseIssueHierarchyContract は field 固定順 regex で fail-close する。fixture 系 red (digest inventory 行ずれ、feedback-refactor-disposition の src/cli.ts source_file_sha256、distribution template byte manifest、mutation_oracle_evidence の kill signal 欠落、Issue template 見出しの英語 prose 4 件) は本 review で全て収束させた。ただし B-1 を blocker として verdict=block とする。B-1: parent_design docs/design/helix/L6-function-design/issue-scope-authority-gates.md が status=draft のまま L7 実装だけが先行しており、plan-descent の parent_design_not_confirmed (実装が設計 confirm を追い越す fail-close) に該当する。実測で status=confirmed は plan-descent violation、status=draft は merged-plan-status violation (src/cli.ts が merge 済 deliverable) となり、PR #157 の scope 内に green 状態が存在しない。当該 L6 design は design_slice HDS-HIL-05 / PLAN-L1-07 infinity-loop に属し、本 PR の責務外であるため独立 reviewer 権限で confirm しない。解消は L6 issue-scope-authority-gates の pair-freeze と confirm を別 PLAN で通すことであり、PO 判断へ escalate する。非 blocker 1 件 (github issue-hierarchy-audit の --input-json が JSON.parse 結果を無検証で IssueHierarchyNode[] へ cast し不正形状入力で TypeError crash する) は Issue へ分離する。"
    green_commands:
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-27T15:12:30Z"
        evidence_path: src/runtime/issue-hierarchy.ts
        output_digest: "sha256:1f57cadc67a4c7e05aa0a7ca8c753effad385f2e8321844e54c6939e9c619f97"
        result: "exit 0"
      - kind: unit_test
        command: "npx --no-install vitest run tests/issue-hierarchy.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-27T15:10:56Z"
        evidence_path: tests/issue-hierarchy.test.ts
        output_digest: "sha256:e7081b53778f26fd80374b96506af2d3b044f77649b426a3e5ac1dff7f22aa1b"
        result: "2 passed"
dependencies:
  parent: docs/plans/PLAN-L6-80-issue-hierarchy-contract.md
  requires:
    - docs/process/modes/add-feature.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
  blocks: []
---

# PLAN-L7-475: GitHub Issue階層化とREADY leaf抽出契約

## 目的

Issueをroot/capability/task/findingへ型付けし、親子・依存・重複・終端関係を保持する。
次dispatchは全Issueの平坦走査ではなく、検証済みREADY leafからだけ選ぶ。
本PLANはAdd-feature Route Bの先行buildであり、人間signoffを要求しない。merge後にReverse
fullbackでL3へback-fillし、G7 trace確定はそのG3 pair-freezeまで保留する。

## 非対象

- GitHub Projects v2へのwrite adapter。
- GitHubを正本にする双方向同期。
- 新DB schema、CI job、常駐daemon。
- PR #156のClaude convergence変更。

## 完了条件

- Issue templateが機械可読hierarchy blockを持つ。
- pure auditが孤児、cycle、上限、非対称依存、duplicate不整合を拒否する。
- READY leaf抽出がparked、duplicate、blocked、親Issueを除外する。
- targeted tests、plan lint、typecheck、full CI、独立reviewがgreenになる。

## 旧review blockerの処置

2026-07-27のreviewが示した`parent_design_not_confirmed`は、#157固有の実装欠陥ではなく、
`plan-descent`が正本Add-feature Route Bを通常Forwardとして扱う駆動モデル不整合だった。
`PLAN-L6-80`で同一responsibilityのL6差分pairを追加し、gateを
`kind=add-impl && route_mode=add-feature`に限ってRoute Bとして扱う。通常`impl`および
Forward add-implの設計先行規律は維持し、新candidate HEADを独立reviewへ再提出する。
