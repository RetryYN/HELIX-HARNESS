---
plan_id: PLAN-L7-572-typed-plan-signal-identity-consistency
title: "PLAN-L7-572 (impl): typed PLAN signalとidentityを直交照合する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #726 typed PLAN signal identity consistency"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 726
behavior_contract_id: TYPED-PLAN-SIGNAL-IDENTITY-CONSISTENCY-001
responsibility_owner: typed-plan-workflow-identity
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "entry signalがDB sourceへ解決済みであり、current catalogとPLAN typed tupleがvalidである"
contract_postconditions: "canonical tokenとtyped tupleを別軸のままexact照合し、一致だけを受理する"
contract_invariants: "PLAN kind、specialist drive、workflow identityを同一enumへ畳み込まず、po_directiveからidentityを推測しない"
contract_failures: "矛盾、unknown、decision待ち、ambiguityを別reasonでfail-closeし、legacy mode greenで相殺しない"
tdd_red_required: false
tdd_red_waiver_reason: "isolated stacked branchでexact token resolverとoracleを同一atomic patchとして作成したため、存在しない実装前Red時刻を捏造しない。confirm前にseeded mutation killを実測する"
mutation_oracle_evidence: "2026-08-15T19:33:59Zにaxis／ID不一致判定をORからANDへ一時変異し、U-TPWSIG-002がexpected mismatch／received emptyで1 failed、他22 passed、exit 1となるkillを実測した。さらに2026-08-15T19:55:26Zにdecision待ち優先判定をsomeからeveryへ変異し、U-TPWSIG-003がexpected decision_required／received classifiedで1 failed、22 skipped、exit 1となる配列順退行killを実測した。各変異をapply_patchで復元後、同oracle greenを再確認した"
complexity_effect: justified_positive
complexity_justification: "typed PLANでskipされていたsignal整合をrequirements-owned catalog lookupへ統合し、旧mode kind比較への依存を増やさない"
removal_trigger: "typed PLAN entry admissionがversioned successorへ置換された時に同じsignal binding契約を移管する"
parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWSIG-001, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWSIG-002, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWSIG-003, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWSIG-004, test_path: tests/plan-entry-routing.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — exact typed signal binding" }
  - { role: qa, slot_label: "QA — mismatch／unknown／decision／ambiguity反例" }
  - { role: tl, slot_label: "TL — requirements authorityと軸分離境界" }
review_evidence:
  - reviewer: claude-code-opus
    review_kind: cross_agent
    reviewed_at: "2026-08-15T20:18:09Z"
    tests_green_at: "2026-08-15T20:15:14Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-opus-5
    scope: "Issue #726 typed PLAN signal整合sliceについて、requirements-owned signal binding、unknown／decision待ち／ambiguity／identity矛盾のreason分離、resolved-firstでもdecision待ちを優先する配列順非依存oracle、po_directive非推測境界を確認した。Claude Code Opusがblocker 0（PLAN確定とdigest inventory追従を除く）と判定した。PR terminal receiptはcurrent HEADのCI／DB convergence後に別途必須。"
    green_commands:
      - kind: unit_test
        command: "NODE_NO_WARNINGS=1 npx --no-install vitest run --project fast tests/plan-entry-routing.test.ts tests/workflow-contracts.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/design-coverage.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T20:15:14Z"
        evidence_path: tests/plan-entry-routing.test.ts
        output_digest: "sha256:c5e0a4a836da8205394cb2cf6b465633f5505141d1a6772352e4bd95bf6095c0"
        result: "4 files／74 tests passed。signal mismatch／unknown／decision_required／ambiguousと配列順非依存oracleを含む"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T20:18:09Z"
  review_binding:
    reviewer: claude-code-opus
    reviewed_at: "2026-08-15T20:18:09Z"
    evidence_digest: "sha256:e680e68e90434ae47edceb8c4a09a395ddb3cc397a43dc6fbd4f2034a2ef5ce9"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-572-typed-plan-signal-identity-consistency.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/workflow-classification-catalog.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-entry-routing.ts, artifact_type: source_module }
  - { artifact_path: tests/plan-entry-routing.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-571-typed-plan-authority-failure.md
  references:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  blocks: []
---

# typed PLAN signal／identity整合

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | canonical signal tokenのexact resolverを追加 | [直列] | U-TPWSIG-001／003 green |
| 2 | PLAN tupleとの直交照合をgateへ接続 | [直列] | U-TPWSIG-002／004 green |
| 3 | targeted、全回帰、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

Issue／PR／DB projectionへのtyped identity投影は#205の後続原子的sliceとする。
