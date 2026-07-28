---
plan_id: PLAN-L7-479-drive-route-convergence
title: "PLAN-L7-479 (add-impl): 駆動経路Forward収束gate"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-28 全駆動経路の再合流を機械保証する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 197
engineering_discipline_required: true
behavior_contract_id: U-DRCAT-008
responsibility_owner: drive-route-convergence
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L6-84がroute graphとexact set反例を定義する"
contract_postconditions: "既存doctor hard gateがForward到達不能、Forward非終端、Forward出口付き循環、重複、specialist driftを拒否する"
contract_invariants: "validatorはpure/read-onlyで、route選択、PLAN、Issue、DBを変更しない"
contract_failures: "Forward出口の有無にかかわらず循環するgraph、dead-end、duplicate transition、専門工程置換をfindingへ変換する"
tdd_red_required: true
red_at: "2026-07-28T12:22:56+09:00"
green_at: "2026-07-28T12:23:33+09:00"
mutation_oracle_evidence: "tests/drive-route-catalog.test.ts のU-DRCAT-008〜010を先に追加し、旧validatorで3件redを確認した。独立reviewでForward出口付き2-cycleが旧候補をgreen通過する反例を追加し、cycle検出後に10/10 greenとなった。reachability検査だけへ戻すmutation、forward_spine終端検査を外すmutation、route内部一意性検査を外すmutationは同oracleにkillされredになる"
complexity_effect: net_neutral
complexity_justification: "既存pure lint内のbounded graph walkと集合比較だけで閉じ、別detectorやdoctor checkを追加しない"
removal_trigger: "drive route catalog ownerへ同等検査が統合され本deltaの独立traceが不要になった時点"
parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-008, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-009, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-010, test_path: tests/drive-route-catalog.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — bounded graph walk実装" }
  - { role: qa, slot_label: "QA — seeded cycle／duplicate mutation" }
  - { role: tl, slot_label: "TL —既存doctor ownerへの統合" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-479-drive-route-convergence.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/drive-route-catalog.ts, artifact_type: source_module }
  - { artifact_path: tests/drive-route-catalog.test.ts, artifact_type: test_code }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-28T04:36:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-28T04:36:00Z"
    evidence_digest: "sha256:8161c605754d480fe5625a3966ef69c8fc2e6bc22821133f01801e3db9b22019"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T04:36:00Z"
    tests_green_at: "2026-07-28T04:34:00Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #201 の current HEAD fac79694 を clean detached worktree で独立レビューした。reachesForwardSpine は DFS + visited set で停止性が担保され循環入力でも無限走査しない。forward_spine_not_terminal は forward_full_v.next_routes が空であることを、route 内部検査は start_layers / phases / exit_conditions / next_routes の重複を、specialist exact set は screen_design / frontend_design を拘束する。前 HEAD 08e79f8b への独立 review で、契約と test 名が主張する有限収束を gate が担保していない点を blocker として指摘した: reverse/research へ 2-cycle を注入しても両者が spine へ到達可能なため findings 0 で通過した。fac79694 で route_cycle_detected が追加され、同一反例と self-loop の双方を検出し、無改変 catalog では findings 0 のままであることを再実測で確認した。現行 catalog は非 spine route 間が acyclic で forward_full_v.next_routes も空であり、契約と実装と実データが一致する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/drive-route-catalog.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T04:34:00Z"
        evidence_path: tests/drive-route-catalog.test.ts
        output_digest: "sha256:252b4fbc63b9134a5e03e5e51eb6ba16a1412921afd3b00a7e6e3803db088484"
        result: "10 passed"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-28T04:33:00Z"
        evidence_path: src/lint/drive-route-catalog.ts
        output_digest: "sha256:3958dd32e67f21e03ef2ccda1e1cfdeaa0f78cef0a0207a353e41914caa07ee0"
        result: "exit 0"
dependencies:
  parent: docs/plans/PLAN-L6-84-drive-route-convergence.md
  requires:
    - docs/plans/PLAN-L6-84-drive-route-convergence.md
  references:
    - docs/plans/PLAN-L7-476-drive-route-catalog-gate.md
  blocks: []
---

# PLAN-L7-479: 駆動経路Forward収束gate

## 完了条件

- U-DRCAT-008〜010とtypecheckがgreen。
- 独立AI-Bがroute reachability、軸分離、既存doctor統合をcurrent HEADで確認する。
