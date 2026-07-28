---
plan_id: PLAN-L6-87-drive-model-closure
title: "PLAN-L6-87 (add-design): 全駆動経路と横断constructの収束設計"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-28 Forward／Scrum／Hybrid以外を含む全駆動経路を同じ精度で定義する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 204
engineering_discipline_required: true
behavior_contract_id: U-DRCAT-011
responsibility_owner: drive-model-closure
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "15 route catalogとForward収束gateがcurrentである"
contract_postconditions: "横断construct分類とIssue〜右腕projectionを既存catalog ownerへ統合する"
contract_invariants: "新routeを追加せず、route／subroute／trigger／専門工程を混同しない"
contract_failures: "construct欠落・重複・孤児parent、surface欠落、旧L0-L14 current説明を拒否する"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "旧mode READMEの重複・矛盾散文を削減し、既存catalogへ2 bounded sectionだけ追加する"
removal_trigger: "同じ分類とprojectionが上位workflow schemaへ統合されconsumer=0になった時点"
parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
agent_slots:
  - { role: se, slot_label: "SE — 15 route／横断construct／identity設計" }
  - { role: qa, slot_label: "QA — exact set／surface／branch prefix反例" }
  - { role: tl, slot_label: "TL — route分類とForward再合流監査" }
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-011, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-012, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-013, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-014, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-017, test_path: tests/branch-kind.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L6-87-drive-model-closure.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/drive-route-system.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/drive-route-catalog.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-drive-route-catalog.md, artifact_type: test_design }
  - { artifact_path: src/lint/branch-kind.ts, artifact_type: source_module }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-84-drive-route-convergence.md
  requires:
    - docs/plans/PLAN-L7-479-drive-route-convergence.md
  references:
    - config/drive-route-catalog.json
  blocks: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T07:55:00Z"
    tests_green_at: "2026-07-28T07:49:00Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #208 の HEAD e762e4ab を clean detached worktree で独立レビューした。本PLANはdrive route catalogへrouteごとのbranch_prefixesを宣言し駆動経路の機械正本を閉じる。PR #207でblockした2点（fix/がgoverned集合外、catalog宣言prefixをbranch admissionが拒否）は解消された。branchはadd/drive-model-closureへ是正され、GOVERNED_BRANCH_PREFIXESへretrofit/recovery/version-up/verifyを追加しREQUIRED_KIND_BY_BRANCHも同時に定義した。U-DRCAT-017はcatalogを実読して全branch_prefixesをclassifyBranchKindへ通す相互拘束oracleであり、片側だけprefixを増やすとtoEqualとclassifyの双方でredになる。実測で4 prefixがunknown_branch_prefixを出さず対応PLAN kindでok=true/findings=0になることを確認した。新規gateはservice/schema/DB/detectorを増やさず既存lint面に閉じている。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/branch-kind.test.ts tests/drive-route-catalog.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T07:49:00Z"
        evidence_path: tests/branch-kind.test.ts
        output_digest: "sha256:d58d46b6029faa4ea8cc8241a4a311926249328766a663116cd368c8e7eb9eda"
        result: "43 passed"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-28T07:52:00Z"
        evidence_path: src/lint/branch-kind.ts
        output_digest: "sha256:97fca1f9f95602c605a509622f7f307034cea9d91e730ee3cdb7b9b78b65f787"
        result: "型エラー 0"
---

# PLAN-L6-87: 全駆動経路と横断constructの収束設計

## 設計判断

15 route exact setは維持する。Scrum Reverse、Redesign、Design/Performance Refactor、
Security、NFR/Measurement findingを分類付きconstructへ固定し、Issueからright-armまでの
共通projectionを全routeへ課す。15 routeの意味identityである`catalog_route_id`と、
1回の実行を表す`episode_route_id`は別fieldとし、旧DB episode IDを破壊的に置換しない。
