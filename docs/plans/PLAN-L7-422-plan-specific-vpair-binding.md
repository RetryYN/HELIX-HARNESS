---
plan_id: PLAN-L7-422-plan-specific-vpair-binding
title: "PLAN-L7-422 (impl): PLAN固有Vペア4点結合gate — L6設計・L8 oracle・生成testをfail-closeで拘束する"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-11 /goal『設計とテスト設計/検証設計でVペアを作る。抜け漏れ絶対許さない』をPLAN-L6-65 confirmed後に実装へ降下"
created: 2026-07-11
updated: 2026-07-12
backprop_decision: not_required
backprop_decision_reason: "confirmed PLAN-L6-65の機能契約を実装するL7降下。新規上位要求は追加しない。"
owner: Codex
parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
verification_bindings:
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-006
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-007
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-008
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-009
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-010
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-011
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-012
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-013
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-014
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-015
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-016
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-017
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-018
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-019
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-020
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-021
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-022
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-023
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-024
    test_path: tests/slow/doctor.test.ts
agent_slots:
  - role: se
    slot_label: "BE logic — pure analyzer/authority/AST adapter"
  - role: qa
    slot_label: "QA — U-PSPB-006..024 red/green/oracle偽装・semantic pin・全test被覆検証"
  - role: tl
    slot_label: "TL — plan lint/doctor wiring・baseline authority・real repo判定"
generates:
  - artifact_path: docs/plans/PLAN-L7-422-plan-specific-vpair-binding.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/plan-specific-vpair-binding.ts
    artifact_type: source_module
  - artifact_path: src/schema/frontmatter.ts
    artifact_type: source_module
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: config/plan-specific-vpair-binding-authority.json
    artifact_type: config
  - artifact_path: docs/plans/PLAN-L7-419-skill-mythos-uplift.md
    artifact_type: markdown_doc
  - artifact_path: tests/plan-descent-specific-parent-binding.test.ts
    artifact_type: test_code
  - artifact_path: tests/slow/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
  requires:
    - docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
    - docs/plans/PLAN-L7-347-plan-descent-gate-impl.md
  references:
    - docs/plans/PLAN-L7-419-skill-mythos-uplift.md
review_evidence:
  - reviewer: codex-vpair-gate-design-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T14:56:22Z"
    tests_green_at: "2026-07-11T14:56:22Z"
    verdict: approve_after_fixes
    scope: "severity-first独立レビューを4回実施。authority事前許可、PLAN token境界、pending test、oracle regex SSoT、共有L8重複、doctor fail-close、local it/test偽装、lexical scope、var hoist反例を是正し、最終blocker 0。286 exemptionsは完了ではなく凍結legacy debtとして分離追跡する。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/frontmatter.test.ts tests/plan-descent-specific-parent-binding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T14:56:22Z"
        evidence_path: tests/plan-descent-specific-parent-binding.test.ts
        output_digest: "sha256:ff0257214b127e714b3ca6061accfe4ada53535b1f30d1a4a28d9f8f34bef5f0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T14:56:22Z"
        evidence_path: src/lint/plan-specific-vpair-binding.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T14:56:22Z"
        evidence_path: src/lint/plan-specific-vpair-binding.ts
        output_digest: "sha256:a10a1f2acf08543574d55798cc140f8199a9f7d184080f9075ecdb60a53f2c12"
  - reviewer: codex-vpair-authority-v2-reviewers
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T16:54:56Z"
    tests_green_at: "2026-07-11T16:54:36Z"
    verdict: approve_after_fixes
    scope: "authority v2 semantic pinとgenerated test全被覆deltaを2系統で敵対レビューした。初回にmissing-draft safetyとは独立して、agent_slotsのsemantic除外と旧v1 286 identity証明欠落をREQUEST_CHANGES。agent_slotsをdigestへ復帰し、旧fingerprint集合digest sha256:18296...をv2 full-entry pin sha256:72513...と独立固定、production validator/実config oracleへ配線した。canonical ordering、CRLF/NFC、未知field/body、partial binding、schema downgrade、tombstone chain、legacy-pin単独呼出しを反例化。最終2 reviewerともAPPROVE、blocker/high risk 0、286 identity維持・findings 0を確認した。"
    worker_model: codex
    reviewer_model: gpt-5.6
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/plan-descent-specific-parent-binding.test.ts tests/frontmatter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T16:54:36Z"
        evidence_path: tests/plan-descent-specific-parent-binding.test.ts
        output_digest: "sha256:d0c29ed016ef79f2d3cffdb6613eacff1fbf2f9ff822659e99f943bed3565064"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T16:54:36Z"
        evidence_path: src/lint/plan-specific-vpair-binding.ts
        output_digest: "sha256:44220009afe0690be55eb18f2b4b35dee3d3bb863b32a1b2318af0386a4f54fe"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T16:54:36Z"
        evidence_path: src/lint/plan-specific-vpair-binding.ts
        output_digest: "sha256:fc7542244c7293612d1e5d187256514bc1ef446f931d296ea8ec26f8744d4443"
      - kind: lint
        command: "bun src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-11T16:54:36Z"
        evidence_path: docs/plans/PLAN-L7-422-plan-specific-vpair-binding.md
        output_digest: "sha256:fda9177f828d3c4c2a3dd42b32b5cb2d9b9a04229d6c26afb3f58baff2489cf6"
---

# PLAN-L7-422: PLAN固有Vペア4点結合gate

## 0. 目的

PLAN-L6-65 confirmed contractを実装し、path存在だけの偽Vペアを起票・doctorの双方で拒否する。
PLAN ID、L6 parent、L8 exact oracle row、生成test内の実行可能caseを同一tupleで結合する。

## 1. 実装範囲

- strict `verification_bindings` schemaとpure analyzer/Node adapterを追加する。
- immutable initial authorityとresolved hash-chain tombstoneを検証する。
- plan lint単一/全走査、doctor hard gateへ同じanalyzerを配線する。
- PLAN-L7-419を固有L6/U-SKUP/test case/bindingへbackfillする。
- 既存debtはexact finding authorityでのみratchetし、新規PLANを免除しない。

## 2. 完了条件

- U-PSPB-006..024が各1件以上のred反例とgreen oracleを持つ。
- test comment/dead string/skip/todo/dynamic titleでoracle citationを偽装できない。
- `PLAN-L7-419` と本PLANがactive exemptionなしでgreenになる。
- authority v2が旧v1 fingerprint集合の独立pinで286 identityを維持しつつ各legacy PLANの意味をpinし、変更後の免除継続を拒否する。
- non-empty bindingを持つPLANの全generated test pathがbinding集合と双方向一致する。
- targeted test、typecheck、lint、plan lint、doctorがgreen。

## 3. スケジュール

- step 1 (parallel): pure analyzer/testとschema/PLAN-L7-419 backfillを分離実装。
- step 2 (serial): authority生成、lint/doctor配線、real repo redを解消。
- step 3 (parallel): independent reviewと全回帰。
