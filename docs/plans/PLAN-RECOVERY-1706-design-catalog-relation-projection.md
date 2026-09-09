---
plan_id: PLAN-RECOVERY-1706-design-catalog-relation-projection
title: "Design Catalogを既存relation graphへ投影"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-10
updated: 2026-09-10
github_issue_id: 1706
behavior_contract_id: DESIGN-CATALOG-RELATION-PROJECTION-001
responsibility_owner: relation-graph
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: value_object
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
contract_preconditions: "design catalogはcoverage正本だがrelation graphでは単一design nodeのみで、item・artifact・digest・PLAN・oracleのimpactを追跡できない"
contract_postconditions: "既存relation graph loader/projectorがcatalog itemと既存authority consumerを型付きedgeで投影し、変更impactとdrift findingを返す"
contract_invariants: "別graph・別正本を作らず、semantic reviewed digestを自己更新せず、既存missing-projection fail-closeを維持する"
contract_failures: "catalog node/edge欠落、artifact削除、未登録design doc、reviewed digest missing/staleを無音で通さない"
tdd_red_required: true
red_at: "2026-09-10T06:35:35+09:00"
green_at: "2026-09-10T06:40:36+09:00"
mutation_oracle_evidence: "U-RELGRAPH-012でcatalog-item nodeを除去するとcatalogs/catalog-artifact edgeがstale-edgeとなりRED。U-RELGRAPH-013でdone artifact削除、catalog bytes変更によるdigest stale、未登録design doc追加を個別findingとしてREDに固定。"
complexity_effect: net_neutral
complexity_justification: "既存RelationGraphSourceSetとloader/projectorへcatalog入力を追加し、別engine・DB・graphを新設しない"
removal_trigger: "design catalog authorityが将来別のcanonical catalogへ正式移管され、同じtyped edge契約を後継loaderが所有した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/design-catalog-relation-projection.md
pair_artifact: docs/test-design/helix/L7-design-catalog-relation-projection-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: [docs/plans/PLAN-L7-32-cross-artifact-relation-graph.md]
  references: ["issue:1706", "issue:1679"]
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-catalog-relation-projection.md, oracle_id: U-RELGRAPH-012, test_path: tests/relation-graph-loader.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-catalog-relation-projection.md, oracle_id: U-RELGRAPH-013, test_path: tests/relation-graph-loader.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — missing-projectionの暫定node化とIssue #1706の未充足edgeを分離する" }
  - { role: se, slot_label: "SE — 既存loader/projectorへcatalog itemとauthority consumerを最小接続する" }
  - { role: qa, slot_label: "QA — node/edge欠落、artifact削除、digest stale、未登録docの反例を固定する" }
  - { role: tl, slot_label: "TL — semantic digest自己更新禁止とIssue scopeを維持する" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1706-design-catalog-relation-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-catalog-relation-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L7-design-catalog-relation-projection-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: src/graph/loader.ts, artifact_type: source_module }
  - { artifact_path: src/lint/relation-graph.ts, artifact_type: source_module }
  - { artifact_path: src/lint/relation-graph-types.ts, artifact_type: source_module }
  - { artifact_path: tests/relation-graph-loader.test.ts, artifact_type: test_code }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-09T23:18:08Z"
    tests_green_at: "2026-09-09T22:40:54Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 44a875e0-4347-4802-8e8a-87cb4f105537
    reviewed_head_sha: 2706a40c36b801825e3a3015018e1503d5ace9bd
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1709#issuecomment-5610069156"
    ci_evidence_generation: "run:34412862574:attempt:3:success"
    scope: "Issue #1706第一sliceのDesign Catalog relation projection、既存loader/projector利用、typed edge、drift finding、semantic digest自己更新禁止をexact HEADで独立検収した。後続consumer read-afterとIssue #1706全体の完了は主張しない。"
    green_commands:
      - kind: unit_test
        command: "npx vitest run tests/relation-graph-loader.test.ts tests/design-coverage.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/digest.test.ts --reporter=json --outputFile=.helix/evidence/review-1709/vitest-targeted-final.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-09T22:40:54Z"
        evidence_path: .helix/evidence/review-1709/vitest-targeted-final.json
        output_digest: "sha256:efed3de7c95ad84c6194d55c7579e07811a37eeca8b200d97b34bb053d32eecd"
---

# Design Catalogのrelation graph投影

## 目的

`docs/design/design-catalog.yaml`の変更を既存relation graphで解析し、catalog item、登録artifact、
semantic reviewed digest authority、design-coverage oracle、既存PLANへの影響を機械的に辿れるようにする。

## 境界

- 別graph、別catalog正本、別DBを作らない。
- catalog内容やreviewed digestを自動承認・自動更新しない。
- deterministicなartifact実在性とsemantic pinの再検収要求を分離する。
- 履歴上のgoverning PLANはrelation graphの`governed-by` edgeにのみ保持し、current PLANの依存正本にしない。

## 残義務

- targeted test、typecheck、PLAN lint、DB rebuild、fresh CIを実行する。
- 独立exact-HEAD reviewとcanonical receiptを得る。
- PR #1704/#1705相当のcatalog変更consumerでread-afterを確認する。
- merge後にharness.dbのmissing-projection findingが解消したことを確認する。
