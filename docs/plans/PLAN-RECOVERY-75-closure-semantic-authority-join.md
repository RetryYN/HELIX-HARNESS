---
plan_id: PLAN-RECOVERY-75-closure-semantic-authority-join
title: "PLAN-RECOVERY-75: closure semantic authority exact join"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
created: 2026-09-01
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1345
behavior_contract_id: CLOSURE-SEMANTIC-AUTHORITY-JOIN-001
responsibility_owner: closure-evidence-materialization
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1345 probe green後もsemantic authorityをjoinする正規portがなくclosureが恒久blockする"
contract_preconditions: "probe executionはprocess値だけを証明し、semantic値を発明しない"
contract_postconditions: "validated bundleだけがPLAN＋artifact kindへexact joinされapproval scopeへdigest束縛される"
contract_invariants: "bundle欠落、wrong PLAN／HEAD／oracle、unaccepted runtimeは従来どおりfail-closeする"
contract_failures: "source path escape、digest／payload不一致、重複record、HEAD／oracle driftをstable errorで拒否する"
tdd_red_required: true
red_test: "semantic authority receiptの入力portがないため実receiptが存在してもplaceholderが恒久的に残る"
red_at: "2026-09-01T21:12:00+09:00"
green_at: "2026-09-01T21:53:12+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/closure-evidence-semantic-authority.test.ts のU-CESA-010のoracle exact join条件を`!==`から`===`へ反転すると、wrong oracle bundleを拒否できず1 failed／exit 1となることを2026-09-01T21:52:56+09:00に実測した。production条件へ復元後、同testは1 passed／exit 0。U-CESA-009とU-CESA-011の実test citationを個別に束縛し、oracle-test-traceの新規orphan 0も実測した。加えてsemantic authority 9/9、CLI targeted 2/2、G3 freeze targeted 5/5、typecheck、PLAN governance checked=1120、Biome error 0を実測した。"
complexity_effect: justified_positive
complexity_justification: "既存probe materializerへtyped bundle loaderを一つ追加し、別authority DBや別closure engineを作らない"
removal_trigger: "closure authority projectionが同じtyped bundleをDBから完全供給する時"
backprop_decision: not_required
backprop_decision_reason: "既存#24のfail-close意図を維持し、欠けていたjoin portだけを回復する"
parent_design: docs/design/helix/L6-function-design/closure-semantic-authority-join.md
pair_artifact: docs/test-design/helix/L8-closure-semantic-authority-join-unit-test-design.md
dependencies:
  parent: PLAN-L7-440-closure-evidence-semantic-authority
  requires:
    - docs/plans/PLAN-L7-440-closure-evidence-semantic-authority.md
  references:
    - "issue:1345"
    - "issue:655"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-75-closure-semantic-authority-join.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/closure-semantic-authority-join.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-closure-semantic-authority-join-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/state-db/closure-evidence-semantic-authority.ts, artifact_type: source_module }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/operation-scope.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/current-location.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: cli_extension }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-evidence-semantic-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/current-location.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/visualization-treeview.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — closure authorityと推測禁止境界" }
  - { role: se, slot_label: "SE — typed bundleとexact join" }
  - { role: qa, slot_label: "QA — wrong PLAN／HEAD／oracle／digest mutation" }
  - { role: tl, slot_label: "TL — #655終端線と原子scope統制" }
review_evidence:
  - reviewer: "Claude Code / Opus"
    review_kind: cross_agent
    reviewed_at: "2026-09-01T15:38:10Z"
    tests_green_at: "2026-09-01T15:37:41Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "9867601a-a3ad-4369-980c-11757d63a7de"
    reviewed_head_sha: b31912f082442899eb2cb6a5ab8b04fcffd7750d
    scope: "PR #1347 main取り込み後のexact HEADでsemantic authority bundle 7段fail-close、canonical digest置換、probe値で意味値を埋めない設計、approval scopeへのsemantic bundle digest束縛、oracle test citation、#1348由来のdigest系との非干渉を独立検証しBLOCKER 0。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/1347#issuecomment-5496459692"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/design-language.test.ts tests/digest.test.ts tests/feedback-refactor-disposition.test.ts tests/coding-rules.test.ts tests/current-location.test.ts tests/ddd-tdd-rules.test.ts tests/closure-evidence-semantic-authority.test.ts tests/design-coverage.test.ts tests/left-arm-carry-log.test.ts tests/source-boundary-integration.test.ts tests/visualization-treeview.test.ts tests/ci-execution-telemetry.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-01T15:37:41Z"
        evidence_path: tests/closure-evidence-semantic-authority.test.ts
        output_digest: "sha256:eea72262535e8ae91a0489edddf3cacd636e916c99f4949d45169f2decb053d9"
        result: "12 test files / 152 tests green"
---

# closure semantic authority exact joinの復旧

Probeが証明できない意味値を発明せず、既存authority artifactの実体とdigestを検証してからだけ
evidence candidateへ投影する。approval／apply境界は変更しない。

## Reverse fullbackとmain read-after

- canonical merge: PR #1347、merge commit `8f615b2a1c4d0d93b976c1d006aaf8522e90f28f`
- independent review: Claude Code / Opus、BLOCKER 0、receipt
  `https://github.com/RetryYN/HELIX-HARNESS/pull/1347#issuecomment-5496814257`
- Ready admission: run `33529802454` terminal success
- post-main read-after: run `33530537308`が同一main HEADでpreflight、bulk-1、bulk-2、stateful、finalize、
  doctor、aggregateをすべてterminal success
- post-main CodeQL: run `33530536422` terminal success

R0の実装・fixture、R1のtyped semantic bundle、R2のL6責務、R3の推測禁止意図、R4のcurrent-main
再接着を照合し、上流要求変更は不要と判定した。approvalなしapply、close-ready不可逆境界、#1299 L3承認は
非対象のまま維持する。
