---
plan_id: PLAN-L7-562-workflow-classification-typed-routing
title: "PLAN-L7-562 (impl): workflow signalをrequirements由来typed identityへ分類する"
kind: impl
layer: L7
drive: agent
status: confirmed
backfill_state: complete
completion_claim_allowed: true
route_mode: version-up
entry_signals: ["po_directive:Issue #694 typed runtime Forward slice"]
created: 2026-08-15
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: WFCLASS-ROUTING-001
responsibility_owner: workflow-classification-typed-routing
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "requirements由来generated catalogは存在するが、runtime分類は旧mode identityを返している"
contract_postconditions: "signalをtyped axis／identityへ分類し、decision待ち、ambiguity、unknownを推測せず閉じるcurrent resolverが存在する"
contract_invariants: "requirements registryだけが意味authorityであり、current resolverはmode／model／catalog_route_id／route_classを出力しない"
contract_failures: "同率複数identity、decision待ち確定、unknownのlegacy推測、generated catalog driftをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "isolated dependent branchでresolverとoracleを同一atomic patchとして作成し、実在しないRed timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "legacy runtime consumerを一括破壊せず、current typed resolverを先に確立して後続adapter移行の単一境界にする"
removal_trigger: "全runtime／CLI／DB consumerがtyped resolverへ移行し、compatibility adapterが廃止された時にdual-green補助だけを除去する"
parent_design: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-typed-routing-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md, oracle_id: U-WFROUTE-001, test_path: tests/workflow-classification-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md, oracle_id: U-WFROUTE-002, test_path: tests/workflow-classification-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md, oracle_id: U-WFROUTE-003, test_path: tests/workflow-classification-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md, oracle_id: U-WFROUTE-004, test_path: tests/workflow-classification-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md, oracle_id: U-WFROUTE-005, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed signal resolver" }
  - { role: qa, slot_label: "QA — ambiguity／decision／legacy推測反例" }
  - { role: tl, slot_label: "TL — requirements authorityと後続adapter境界" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-15T01:40:00Z"
    tests_green_at: "2026-08-15T01:33:49Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-opus-5
    scope: "PR #703 exact HEAD 2cf340ef10b2fd60188701849980e6ccb64b78a3をClaude Code Opusがread-only独立レビューした。generated catalogのsignal_bindingsだけを入力とするtyped routing、decision_required／ambiguous／unknownのfail-close、legacy identity fieldのcurrent出力0件、freeze digest伝播を実測確認した。Critical 0、Blocker 0、Important 0、Minor 0でAPPROVE。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/workflow-classification-routing.test.ts tests/workflow-classification-catalog.test.ts tests/digest.test.ts tests/l3-g3-freeze-packet-v2.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T01:33:49Z"
        evidence_path: tests/workflow-classification-routing.test.ts
        output_digest: "sha256:a3d7f8a947789a9e09dd19c7b0f21aaf95cceb07a119e2349fe97bf81b7fdc68"
        result: "exact HEAD 2cf340ef: 4 files / 32 tests passed"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T01:40:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-15T01:40:00Z"
    evidence_digest: "sha256:d7c9f4f9412506e959f01154976fe7955bbf704c3254ddd4f0d563f2179d04cf"
  entries: []
generates:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/workflow/workflow-classification-routing.ts, artifact_type: source_module }
  - { artifact_path: src/workflow/contracts.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-classification-routing.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-55-workflow-classification-registry.md
  requires:
    - config/workflow-classification-catalog.v1.json
    - docs/design/helix/L6-function-design/workflow-classification-typed-routing.md
  references:
    - docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md
    - docs/plans/PLAN-REVERSE-694-workflow-classification-terminal-fullback.md
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - src/workflow/routing-contracts.ts
    - src/schema/route-map.ts
  blocks: []
---

# workflow分類typed routing実装

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | generated catalog bindingからtyped resolverを実装 | [直列] | U-WFROUTE-001 green |
| 2 | decision待ち、ambiguity、unknown／legacy推測を反証 | [直列] | U-WFROUTE-002..004 green |
| 3 | targeted、typecheck、full CI | [直列] | 同一HEAD green |
| 4 | Claude Code Opus独立review | [review] | blocker 0 |

旧runtime outputの廃止、legacy input-only adapter、CLI／schema／DB切替、doctor gateは後続原子的sliceとする。

## 終端収束

PR #708のcanonical merge、Claude Opus exact-HEAD review、CI／DB convergenceを
`PLAN-REVERSE-694-workflow-classification-terminal-fullback`のcurrent-main R0〜R4で再照合し、
同Reverse PLANの`requires`から本PLANへの逆向きlinkを確認した。これにより双方向linkと
requirements-owned typed routing契約が成立したため、`backfill_state: complete`および
`completion_claim_allowed: true`へ遷移する。本PRのcurrent-HEAD CI、Claude Opus exact-HEAD review、
main read-afterをterminal acceptanceとして要求し、いずれかの失敗を完了へ丸めない。
