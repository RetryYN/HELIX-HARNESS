---
plan_id: PLAN-L7-548-closure-evidence-probe-reentrancy
title: "closure evidence probe の同一repo再入 fail-close"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
route_mode: forward
entry_signals:
  - "po_directive:2026-08-11 /goal PR対応を継続し、Claudeレビューでクローズ可能にする"
created: 2026-08-11
updated: 2026-08-11
owner: Codex / TL
agent_slots:
  - { role: se, slot_label: "SE - closure probe reentrancy boundary" }
  - { role: qa, slot_label: "QA - recursive execution and fixture contract" }
engineering_discipline_required: true
behavior_contract_id: CLOSURE-PROBE-REENTRANCY-001
responsibility_owner: closure-evidence-probe
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: policy
contract_preconditions: "closure evidence probe が --execute で回帰コマンドを起動し、子processへ対象repoの再入境界を伝播する"
contract_postconditions: "同一repoの再入はDB再構築・証跡出力前に exit 2 で fail-close し、fixture repo と通常の親probeは実行契約を維持する"
contract_invariants: "再入を成功扱いにせず、対象repoの絶対path一致だけを境界判定に使い、親probeは一度だけ実行する"
contract_failures: "再入markerが同一repoへ解決した場合は診断stderrを出し、証跡record/outputを生成せず終了する"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "既存の子process起動に環境markerとfail-close判定を加えるだけで、DB schema・外部API・常駐processを増やさない"
removal_trigger: "同一repo再入を検出する環境marker境界が単一実装へ統合され、重複する旧判定経路が存在しないことを確認した時点"
parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md
pair_artifact: docs/test-design/harness/closure-evidence-semantic-authority.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, oracle_id: U-CLOSURE-PROBE-REENTRANCY-001, test_path: tests/cli-surface.test.ts }
generates:
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-78-closure-evidence-semantic-authority.md
  requires: [docs/plans/PLAN-L6-78-closure-evidence-semantic-authority.md]
mutation_oracle_evidence: "tests/cli-surface.test.ts の current-head review で M-1（isClosureEvidenceProbeReentrant を常時 false）と M-2（子processへの marker env 伝播削除）を各単独適用し、それぞれ 1 failed を実測。復元後 1 passed。U-CLOSURE-PROBE-REENTRANCY-001 が両欠陥を kill する。"
review_evidence:
  - reviewer: "Claude independent reviewer"
    review_kind: cross_agent
    reviewed_at: "2026-08-10T20:42:15Z"
    tests_green_at: "2026-08-10T20:42:15Z"
    verdict: approve_after_fixes
    scope: "current HEAD 89ebe487 の closure probe reentrancy 実装を read-only severity-first review。コードと mutation oracle は妥当、PLAN-L7-548 の status=draft・review_evidence 空だけを blocker として確認。"
    worker_model: gpt-5-codex
    reviewer_model: claude-opus-5
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/cli-surface.test.ts -t 'writes executed evidence probe records as handoff artifacts without overwrite' --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:9e22640968d6368909e2302ff8d116bb64c36e99d26a8458fce7f2130324eb83"
---

# PLAN-L7-548

closure evidence の machine recovery probe が、同じrepoを対象にした回帰commandから再入した場合の
ハングと証跡欠落を防ぐ。再入境界は子processへ伝播する対象repoの絶対path markerで判定し、fixture
repoなど別rootのprobe実行は維持する。

本PLANは実装を含むが、Claudeによるcurrent HEADの独立レビューとCIのterminal greenが揃うまで
完了主張を許可しない。
