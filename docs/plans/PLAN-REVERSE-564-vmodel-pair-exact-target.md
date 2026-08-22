---
plan_id: PLAN-REVERSE-564-vmodel-pair-exact-target
title: "PLAN-REVERSE-564: pair-freezeのexact artifact／明示member setへ是正する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: normalization
forward_routing: L3
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T20:00:29Z"
    tests_green_at: "2026-08-16T20:00:29Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Issue #693のpair-freeze exact artifact／strict pair_group移行を、pair analyzer、L1-L12 authority、DDD-TDD guard、feedback residual manifest、G3 freeze packet、PR scope宣言へ照合した。directory prefixをcurrent成立根拠に戻さず、PLANのlegacy_retirement_stateをconsumer_migrationへ是正し、main同期後に露出したdigest／case count不整合を実測値へ更新した。Claude Codeのレビュー帰属やexternal review receiptはこのentryに記録していない。"
    green_commands:
      - kind: unit_test
        command: "npm exec --offline -- vitest run tests/ddd-tdd-rules.test.ts tests/feedback-test-owner-residual-disposition.test.ts tests/vmodel-pair.test.ts tests/helix-related-pairs.test.ts tests/canonical-reuse-authority.test.ts tests/l12-hybrid-recognition.test.ts --reporter dot"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-16T20:00:29Z"
        evidence_path: tests/vmodel-pair.test.ts
        output_digest: "sha256:91d6c659955e7fb9f174d2c8c5db73e21fe4a862cf637d801ea519affb8a75a4"
        result: "7 files / 138 tests passed"
      - kind: typecheck
        command: "npm exec --offline -- tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        evidence_path: tsconfig.json
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "exit 0"
      - kind: lint
        command: "npm exec --offline -- tsx src/cli.ts plan lint docs/plans/PLAN-REVERSE-564-vmodel-pair-exact-target.md"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: src/vmodel/lint.ts
        output_digest: "sha256:852abd4f929f07cc8d3c168d0a8f0f77a0ae75c01b86e13f4a7714746690ae27"
        result: "PLAN／pair binding／design reality／entry routing／number uniqueness all green"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #693 pair-freezeのrepository-wide directory prefix誤認をexact artifactへ是正する"
created: 2026-08-17
updated: 2026-08-17
owner: Codex / TL
github_issue_id: 693
behavior_contract_id: VMODEL-PAIR-EXACT-TARGET-001
responsibility_owner: vmodel-pair-freeze
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "pair_artifactの逆参照にdirectory prefix semanticsが残り、ancestor prefixやpath normalization差をexact pairとして数え得る"
contract_postconditions: "単一pairはcanonical exact file、複数pairはstrict pair_groupの明示member setでのみ成立し、directory／ancestor prefix／path traversal／symlink外参照はfail-closeする"
contract_invariants: "pair-freezeとdoctorが同一analyzerを使い、group authority・member集合・design側exact逆参照を一致させる。legacy stagingは明示exemption以外でcurrent判定へ戻さない"
contract_failures: "pair_artifactのdirectory、absolute path、backslash、dot／dotdot segment、duplicate separator、未解決member、重複member、暗黙prefixを受理しない"
tdd_red_required: false
tdd_red_waiver_reason: "既存のpair-freeze oracleへnegative path／group schema／explicit member-set回帰を先行追加し、現行289 pairを壊さずにfalse-green経路を閉じる"
mutation_oracle_evidence: "U-VPAIR-004c/004dがdirectory、ancestor prefix、traversal、backslash、absolute path、schema不正、member不一致を独立反証する"
complexity_effect: net_negative
complexity_justification: "暗黙のdirectory prefix判定を削除し、single pathとstrict group schemaの2経路へ責務を分離する"
removal_trigger: "全active pairがexact fileまたはstrict pair_groupへ移行し、legacy staging exemptionが0になった時点"
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
backprop_scope:
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/harness/L6-function-design/vmodel-pair-freeze.md
    reason: "pair-freezeのfunction contract、path boundary、group schemaを本PLANへ再束縛する。"
  - layer: L8-unit-test-design
    decision: preserve
    evidence_path: docs/test-design/harness/L8-unit-test-design.md
    reason: "negative oracleとexplicit member-set oracleをcurrent test-designへ投影する。"
agent_slots:
  - { role: se, slot_label: "SE — pair path／group schema boundary" }
  - { role: qa, slot_label: "QA — directory prefix／path normalization mutation" }
  - { role: tl, slot_label: "TL — V-pair authority／doctor同一判定" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-564-vmodel-pair-exact-target.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/vmodel/lint.ts, artifact_type: source_module }
  - { artifact_path: src/lint/canonical-reuse-consumer-baseline.ts, artifact_type: source_module }
  - { artifact_path: tests/vmodel-pair.test.ts, artifact_type: test_code }
  - { artifact_path: tests/helix-related-pairs.test.ts, artifact_type: test_code }
  - { artifact_path: tests/canonical-reuse-authority.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/harness/L6-function-design/vmodel-pair-freeze.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L7-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/harness/L1-operational-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/harness/L3-acceptance-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/harness/L8-integration-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/harness/L9-integration-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/harness/L9-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-document-agent-metadata-contracts.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-document-agent-metadata-integration.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-document-semantic-diff-integration.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-nfr-typed-registry-quality-taxonomy-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/hybrid-rebaseline-v0.5.0-collision-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/hybrid-rebaseline-v0.5.0-intake-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/legacy-helix-extension.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/operation-scope.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/upstream-substance-gap.md, artifact_type: test_design }
dependencies:
  parent: null
  requires: []
  blocks: []
  references:
    - docs/design/harness/L6-function-design/vmodel-pair-freeze.md
    - docs/test-design/harness/L7-unit-test-design.md
    - docs/test-design/harness/L8-unit-test-design.md
    - docs/plans/PLAN-L7-11-vmodel-pair-lint.md
    - docs/plans/PLAN-L7-12-verification-trigger.md
created_by_issue: 693
---

# pair-freezeのexact artifact／明示member setへの是正

## R0 現状採取

`src/vmodel/lint.ts` はtest-design側の `pair_artifact` を末尾slash付きdirectoryとして解釈し、
design docの所在directoryがそのprefixで始まれば双方向pairと数えていた。これにより、
repository-wide directoryやprefix衝突名が無関係なdesignを同時にpair済みと見せられる。

## R1 skip判定

既知のgate硬化ReverseなのでR1はskipする。新しいpair関係を推測せず、現行design側のexact逆参照集合を
member authorityとして保全する。

## R2 As-Is照合

単一pairは `pair_artifact` のexact file、複数pairは `pair_group` のstrict schemaとexplicit member setへ
分離する。directory値はlegacy staging exemption以外で受理しない。groupの `members` は実在する
canonical repository-relative design fileで、design側から同じtest-designへexactに逆参照される集合と一致させる。

## R3 意図照合

Issue #693の目的はpair数を増やすことではなく、曖昧なpath identityによるfalse greenを無くすことである。
absolute／traversal／dot segment／duplicate separator／backslash／symlink・repo外realpathへ縮退せず、
`pair-freeze`とdoctorが同じpure analyzer結果をfail-closeでsurfaceする。

## R4 Forward再入

current 289 pairをexact fileまたはstrict groupへ移行し、U-VPAIR-004c/004d、実repo pair-freeze、
typecheck、targeted回帰、PLAN lint、Claude exact-HEAD review、main read-afterを通過させる。
legacy stagingのdirectory値はcompatibility-onlyとして残すが、current pairの成立根拠には使わない。
