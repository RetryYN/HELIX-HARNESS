---
plan_id: PLAN-L7-559-derived-requirement-trace
title: "PLAN-L7-559 (add-impl): Derived requirementとtrace compiler"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-08-14 Issue #186 UWJ-FR-005/008/016 derived trace compiler"
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 186
engineering_discipline_required: true
behavior_contract_id: DERIVED-REQUIREMENT-TRACE-001
responsibility_owner: universal-workflow-judgment
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "UWJ-FR-005/008/016とAC-005/008/016がconfirmed L3正本に存在し、#184/#185がclosedである"
contract_postconditions: "各transitionへFR/AC/test、8派生candidate、双方向trace、L1〜L12と正規6 pairをexact生成する"
contract_invariants: "source revision/snapshot/oracleを共有し、先行confirmed、推測補正、DB/Git/GitHub writeを行わない"
contract_failures: "orphan、片edge、stale、先行confirmed、placement/pair欠落・重複をstable findingへ変換する"
tdd_red_required: true
red_at: "2026-08-14T13:33:00+09:00"
green_at: "2026-08-14T13:34:20+09:00"
mutation_oracle_evidence: "tests/derived-requirement-trace.test.ts に対してderived_system status判定を !== candidate から === candidate へ一時反転し、U-DTRACE-004が1 failed、他3 tests passedとなることを2026-08-14に実測した。元実装へ復元後4 tests green。"
inventory_evidence: "current src/workflow envelope/interview contractsと旧HELIX add-feature-workflow/L3-requirements-definitionをread-only比較。旧sourceは工程順と双方向trace意図のみ採用し、transition artifact graph、8派生系統、revision/snapshot、L1〜L12 canonical pairは本PLANで再設計する。"
complexity_effect: justified_positive
complexity_justification: "既存src/workflow pure Zod contractへcompiler/validator一組を追加し、永続化やserviceを増やさない"
removal_trigger: "Universal Workflow envelope admissionへ同一trace graph contractを統合する時点"
parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md
pair_artifact: docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-001, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-002, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-003, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-004, test_path: tests/derived-requirement-trace.test.ts }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/derived-requirement-trace.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/derived-requirement-trace.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/derived-requirement-trace.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-derived-requirement-trace-detail-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-derived-requirement-trace-system-test-design.md, artifact_type: test_design }
  - { artifact_path: src/workflow/derived-requirement-trace.ts, artifact_type: source_module }
  - { artifact_path: tests/derived-requirement-trace.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L6-function-design/derived-requirement-trace.md
  requires: [docs/plans/PLAN-L7-478-universal-workflow-envelope.md, docs/plans/PLAN-L7-557-workflow-interview-unresolved.md]
  blocks: [issue:188]
agent_slots:
  - { role: se, slot_label: "SE — deterministic trace compiler" }
  - { role: qa, slot_label: "QA — orphan/cardinality/revision mutation oracle" }
  - { role: tl, slot_label: "TL — UWJ-FR-005/008/016 authority boundary" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-14T07:37:00Z"
    tests_green_at: "2026-08-14T07:37:00Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: claude:claude-opus-5
    scope: "PR #685 (feature/derived-requirement-trace-186) HEAD eba66faf の Codex 著寄与を Claude Code 収束レーンで独立レビューした。L4↔L9 / L5↔L8-detail / L6↔L8 の pair 双方向性、U-DTRACE-004 の mutation kill (status 判定 !== candidate を === へ反転し 1 件のみ failed、復元後 4 passed) を実注入で確認し、依存が zod のみで DB/Git/GitHub write を持たない pure evaluator であることを検証した。L12 scanner の canonical pair 誤検出は記述順に起因することを regex 実測で特定し、文意を変えない順序調整で解消したことを確認した。blocker 0。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/l12-hybrid-recognition.test.ts tests/l12-canonical-authority.test.ts tests/derived-requirement-trace.test.ts --reporter=json | sha256sum"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-14T07:37:00Z"
        evidence_path: tests/derived-requirement-trace.test.ts
        output_digest: "sha256:9da326e6dd4a0a374b130cea9d1e47c9a8c08a12b9deea89406e827701b9b632"
        result: "29 passed (3 files)"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-14T07:37:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-14T07:37:00Z"
    evidence_digest: "sha256:5a66199a27c6066899939f2250731f0854659cd5504dfdd36bd25dd2a68fbe22"
  entries: []
---

# Derived requirementとtrace compiler

L3正本 UWJ-FR-005/008/016、UWJ-AC-005/008/016を`U-DTRACE-001`〜`U-DTRACE-004`へ降ろす。
派生候補を個別layer gateより先にconfirmedへ上げず、L1〜L12 canonicalだけをcurrent authorityにする。
