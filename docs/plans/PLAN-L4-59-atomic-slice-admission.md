---
plan_id: PLAN-L4-59-atomic-slice-admission
title: "PLAN-L4-59 (add-design): Atomic Slice Admission基本設計"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-02 Issue #334としてL3Q-PC-036 Atomic Slice AdmissionのL4/L9 pairを閉じる"
created: 2026-08-02
updated: 2026-08-02
owner: Codex / TL
github_issue_id: 334
engineering_discipline_required: true
behavior_contract_id: GH-AC-035
responsibility_owner: atomic-slice-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: no_change
ddd_modeling_decision: domain_service
contract_preconditions: "GH-AC-035とsupporting invariant GH-AC-040、PLAN-L3-36、L3Q-PC-036がfreeze済み"
contract_postconditions: "原子sliceのintent、責務footprint、companion、scope expansion、admission decisionのL4 componentとL9 oracleが一意になる"
contract_invariants: "新規／改修を同じ規則で扱い、exactly-one behavior contractとresponsibility ownerを満たさない混載を受理しない"
contract_failures: "複数behavior、複数aggregate、owner不明、companion欠落、manifest drift、自己承認scope expansionをfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存github-guards、ddd-tdd-rules、PLAN lintを再利用し、重複したPR判定と手動レビュー往復を単一admissionへ集約する"
removal_trigger: "旧PR scope判定の全consumerがatomic admissionへ移行し、dual-green 30日かつconsumer=0 receiptが成立した時点"
pair_artifact: docs/test-design/helix/L9-atomic-slice-admission-system-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — intent／footprint／companion／admission component境界" }
  - { role: qa, slot_label: "QA — 複数behavior、owner drift、scope expansionのL9反例" }
  - { role: tl, slot_label: "TL — 既存guard再利用と設計リファクタリング" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-59-atomic-slice-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/atomic-slice-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-atomic-slice-admission-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/atomic-slice-admission-design.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/helix-objective-evidence-audit.md, artifact_type: markdown_doc }
  - { artifact_path: tests/goal-evidence-audit.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-08-01T19:11:55Z"
    reviewed_at: "2026-08-01T19:16:31Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #335 HEAD 62b9b2e19820d7bd3a5e5f3d9ea9e6ae1c2348deをread-only内容review。Critical/High/Medium 0、contract blocker 0。L3Q-PC-036のL4/L9 pair、GH-AC-035唯一behavior、GH-AC-040 supporting invariant、catalog digest三者一致、outstanding 21件同期、新detector・専用永続化・DB table・workflow job追加0を確認。CI stale-body所見は後続fresh eventでscope gate greenを確認する外部receipt条件とし、設計内容のblockerではない。receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/335#issuecomment-5152996266"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/atomic-slice-admission-design.test.ts tests/design-coverage.test.ts tests/ddd-tdd-rules.test.ts tests/design-language.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-01T18:24:00Z", evidence_path: tests/atomic-slice-admission-design.test.ts, output_digest: "sha256:8410002e08a19d20d0c2c89f1e64bc325e3840b563ef6aec86039eabc7ec4598" }
dependencies:
  parent: docs/plans/PLAN-L3-36-atomic-development-contract.md
  requires:
    - docs/design/helix/L3-requirements/github-atomic-development-requirements.md
    - docs/test-design/helix/github-atomic-development-system-test-design.md
    - docs/governance/l3-downstream-queue.json
  references:
    - src/lint/github-guards.ts
    - src/lint/ddd-tdd-rules.ts
    - docs/governance/github-issue-hierarchy-rules.md
  blocks:
    - queue:L3Q-PC-037
    - issue:334
---

# PLAN-L4-59: Atomic Slice Admission基本設計

## 工程表

### Step 1: inventoryと責務再利用 [直列]

- 既存PR scope guard、DDD/TDD discipline、PLAN lint、Issue hierarchyの検査責務をinventory化する。
- 同じfieldとfailureを検査する新detector、schema、DB tableを作らない。

### Step 2: L4 componentとdata flow [直列]

- Issue／PLAN／PR manifestからintentを束縛し、changed pathから責務footprintとcompanion exact setを解決する。
- admit、split、Recoveryの状態遷移とstale条件を固定する。

### Step 3: 設計リファクタリング [直列]

- 機能・性能・negative oracleを維持したまま、既存owner直接合成案と新規抽象化案を比較する。
- code／component／永続化面が小さい案を選び、右腕へ測定可能なoracleを渡す。

### Step 4: L9 negative oracle [直列]

- 複数behavior／aggregate、owner drift、companion欠落、過大path family、scope自己承認を拒否する。
- blockerとsuccessor improvementを分離し、current PRを有限回で収束させる。

### Step 5: independent review [直列]

- authoring runtimeと異なるAI-Bがexact HEADをread-onlyで検査する。

## 受入条件

- AC-1: `L3Q-PC-036`だけを閉じ、L5/L8とL6/L7を完了扱いにしない。
- AC-2: 新規／改修の両方でexactly-one behavior contractとresponsibility ownerを要求する。
- AC-3: source companion、expected／actual path、scope expansionをexact集合で判定する。
- AC-4: 既存guardを再利用し、新detector／schema／DB tableを追加しない。
- AC-5: targeted test、PLAN lint、typecheck、独立AI-B reviewがcurrent HEADでgreenである。

## 検証

- `npx --no-install vitest run --project fast tests/atomic-slice-admission-design.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L4-59-atomic-slice-admission.md`
