---
plan_id: PLAN-L5-85-atomic-slice-admission
title: "PLAN-L5-85 (add-design): Atomic Slice Admission詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-02 Issue #336としてL3Q-PC-037 Atomic Slice AdmissionのL5/L8 pairを閉じる"
created: 2026-08-02
updated: 2026-08-02
owner: Codex / TL
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-02T00:14:14Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-02T00:14:14Z"
    evidence_digest: "sha256:20f8ee67789cb743149e540cad98a4dcf7feae4e98656225b025c35f63f98039"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    reviewed_at: "2026-08-02T00:14:14Z"
    tests_green_at: "2026-08-02T00:12:56Z"
    verdict: approve
    scope: "PR #337 exact HEAD f90748b5eeba0d9af213e2625a63bb87ba34b6d9をClaude AI-Bがread-only収束review。CI run 30723994117のHEAD一致とfull regression／Biome／DB refresh／doctor green、declared 8 path、U-ATOMIC-001..013、pair ownership、digest追従を確認し、Critical/High/Medium 0、blocker 0、verdict approve。receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/337#issuecomment-5154138902"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/atomic-slice-admission-detail-design.test.ts tests/atomic-slice-admission-design.test.ts tests/design-coverage.test.ts tests/design-language.test.ts tests/oracle-test-trace.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-01T23:01:18Z", evidence_path: tests/atomic-slice-admission-detail-design.test.ts, output_digest: "sha256:513f37c2389b6e1958b04d5844c4b9c9ebb7ff6babb6fb6c642e4639e3ab4c93", result: "Codex author runtime: 5 files / 60 tests pass; Claude AI-B static review separately recorded" }
github_issue_id: 336
queue_id: L3Q-PC-037
engineering_discipline_required: true
behavior_contract_id: GH-AC-035
responsibility_owner: atomic-slice-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-59とL3Q-PC-036のL4/L9 pairがconfirmedかつmainへmerge済み"
contract_postconditions: "原子slice admissionの純粋関数、型、canonicalization、failure、状態遷移とL8 mutation oracleが実装可能な精度で一意になる"
contract_invariants: "contract／ownerは各1件、expected／actual pathとcompanionはexact集合、scope expansionは別runtimeの同一HEAD receiptへ束縛する"
contract_failures: "入力欠落・重複・未知owner・複数責務・companion不一致・stale HEAD・自己承認・計測不能な設計比較をfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存github-guards、ddd-tdd-rules、PLAN lintの結果を純粋合成し、新detector、schema、table、workflow jobを増やさない"
removal_trigger: "後続L6/L7で既存PR判定consumerの移行とdual-greenが成立し、旧分岐consumer=0 receiptが発行された時点"
pair_artifact: docs/test-design/helix/L8-atomic-slice-admission-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — 型／純粋関数／failure／状態遷移" }
  - { role: qa, slot_label: "QA — exact set／stale／scope expansion／設計refactor mutation" }
  - { role: tl, slot_label: "TL — 既存owner再利用とL6/L7 carry境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-85-atomic-slice-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/atomic-slice-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-atomic-slice-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/atomic-slice-admission-detail-design.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L4-59-atomic-slice-admission.md
  requires:
    - docs/design/helix/L4-basic-design/atomic-slice-admission.md
    - docs/test-design/helix/L9-atomic-slice-admission-system-test-design.md
    - docs/governance/l3-downstream-queue.json
  references:
    - src/lint/github-guards.ts
    - src/lint/ddd-tdd-rules.ts
  blocks:
    - queue:L3Q-IT-023
    - issue:336
---

# PLAN-L5-85: Atomic Slice Admission詳細設計

## 工程表

### Step 1: 既存owner inventory [直列]

- PR manifest、PLAN discipline、Issue hierarchy、design catalogの既存検査結果を入力として固定する。
- parserやdetectorを複製せず、純粋なadmission合成境界だけを設計する。

### Step 2: L5 contract [直列]

- canonical型、関数signature、評価順序、failure、stale条件、状態遷移を確定する。
- contract／owner／path／companion／scope expansionをexact集合として扱う。

### Step 3: 設計リファクタリングgate [直列]

- 同一oracleで既存owner直接合成案と新抽象化案を比較する。
- behavior、p95 budget、negative oracleを維持し、component、state、永続化、production code増分が小さい案を選ぶ。

### Step 4: L8 mutation oracle [直列]

- 複数behavior、owner drift、path欠落・余剰・重複、companion欠落、stale receipt、自己承認をkillする。
- L9 ST-ATOMIC-011／012を観測値と反例へ具体化する。

### Step 5: independent review [直列]

- authoring runtimeと異なるAI-BがL4/L9 descent、実装可能性、非縮退、過剰抽象化をread-only検証する。

## 受入条件

- AC-1: `L3Q-PC-037`だけを閉じ、L6/L7実装を完了扱いにしない。
- AC-2: 入力、canonicalization、評価順序、戻り値、failureが実装可能な精度で一意である。
- AC-3: L8 oracleがpositive／negative／mutationを持ち、L9 ST-ATOMIC-001〜012へtraceする。
- AC-4: L5/L8成果物を後続L6/L7成果物と二重pair ownershipにしない。
- AC-5: 新detector／schema／table／workflow jobを追加しない。

## 検証

- `npx --no-install vitest run --project fast tests/atomic-slice-admission-detail-design.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L5-85-atomic-slice-admission.md`
