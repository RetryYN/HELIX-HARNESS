---
plan_id: PLAN-L7-515-screen-applicability-cli
title: "PLAN-L7-515 (add-impl): ScreenApplicability CLI 表面（helix screen status/gates、U-SAPCLI-001）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#175 ScreenApplicabilityGateを進める（スライスB/CLI）"
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
github_issue_id: 175
engineering_discipline_required: true
behavior_contract_id: U-SAPCLI-001
responsibility_owner: screen-applicability
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "PLAN-L7-514 の harness.db schema と SqliteScreenApplicabilityStore を前提とする。CLI は読み取り専用（gate write authority は store の commit 経路のみ、CLI から write しない）"
contract_postconditions: "helix screen status --json が heads と row counts を、helix screen gates --json が gate receipts 一覧を schema_version 付き JSON で返す。table 未作成の DB でも fail せず空状態を報告する（ensure は CREATE IF NOT EXISTS のみ）"
contract_invariants: "CLI 経路は SELECT（および冪等な CREATE IF NOT EXISTS）以外の write を行わない。既存 CLI コマンドの挙動を変えない"
contract_failures: "table 欠落・SQL エラー等の DB 例外は該当行を skip せず、CLI が schema_version 付き typed error（stderr JSON + exit code 非0）へ正規化して fail-close する"
tdd_red_required: true
red_at: "2026-08-07T09:27:57Z"
green_at: "2026-08-07T09:29:09Z"
mutation_oracle_evidence: "tests/screen-cli.test.ts の mutation oracle: red_at 時点で helper/CLI 未実装のため全 test が fail（red）することを実測済み。green 後も table 欠落 db では readScreenStatus / listScreenGateReceipts が throw して fail-close し（CLI typed error 経路の入口固定）、limit<=0 は空返し、seed 済み :memory: db では counts/heads/一覧が store 書込内容と一致、実 CLI spawn では JSON schema（schema_version / source_command / exit 0）を機械検査する"
complexity_effect: justified_positive
complexity_justification: "#175 の最終スライス。CLI 2 コマンドと read helper・test 1本のみを追加する"
removal_trigger: "L6設計 screen-applicability-prototype がsupersedeされ、後継設計のCLI表面へ置換された時"
parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md
pair_artifact: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAPCLI-001, test_path: tests/screen-cli.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #175 最終スライス（CLI 読み取り表面）" }
  - { role: se, slot_label: "SE — helix screen status/gates 実装" }
  - { role: qa, slot_label: "QA — read helper unit + CLI spawn oracle" }
  - { role: tl, slot_label: "TL — 読み取り専用境界の維持" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-515-screen-applicability-cli.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/screen-applicability-sqlite-store.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/screen-cli.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/design/helix/L6-function-design/screen-applicability-prototype.md
    - docs/plans/PLAN-L7-514-screen-applicability-projection.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-07T09:50:00Z"
    tests_green_at: "2026-08-07T09:45:50Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Important 1件: PLAN contract_failures/mutation_oracle_evidenceとL8 §6が『不正payload行のfail-close』を検証済みと主張するが該当testが存在せず、helperはpayload列をSELECTすらしない虚偽claim = PLAN claim discipline違反。Minor 2件: openHarnessDbReadOnly非採用の機械強制の弱さ、spawn二重呼び出しのtimeout余裕）。是正としてCLI両コマンドへtyped error経路（catch→schema_version付きstderr JSON+exitCode=1、db?.close()安全化）を実装、table欠落dbでhelperがthrowするunit固定testを追加し、claimを実検証範囲（table欠落・SQLエラーの正規化+limit<=0）へ正確化、it timeoutを120sへ拡張、cli.ts digest pinを最終内容へ再pin。2回目approve（Critical/Important 0件）。reviewerはclaim-実装-テストの1:1対応をdiffで確認し、24 tests green・tsc 0・plan lint全OK・biome 0・wrapper commands非改変（digestシフトのみ）を実測した。非ブロッキング申し送り= 破損DB fixtureでのspawn統合テストとopenHarnessDbReadOnly二段構成（ensure専用write→readonly切替）は後続改善。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/screen-cli.test.ts tests/screen-store-sqlite.test.ts tests/screen-stage-closure-gate.test.ts tests/coding-rules.test.ts tests/digest.test.ts tests/digest-canonicalization.test.ts tests/design-language.test.ts tests/review-evidence.test.ts tests/left-arm-carry-log.test.ts tests/design-reality-binding.test.ts tests/ci-governance-self-heal.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-07T09:45:50Z", evidence_path: tests/screen-cli.test.ts, output_digest: "sha256:d5fd0a64244b83f8ba7c109e681ac8a918107d716468fa062cf2389670e849d4", result: "review是正後worktree: 11 files / 192 tests passed（U-SAPCLI-001の4件を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-07T09:44:11Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-07T09:50:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-07T09:50:00Z"
    evidence_digest: "sha256:9f82cc3a31f3d6925879fab186158597898d94368a2ec702d46cfec2bdc7cbb4"
  entries: []
---

# PLAN-L7-515: ScreenApplicability CLI 表面の実装

## 目的（Issue #175 最終スライス）

harness.db に永続化された screen applicability runtime 証跡を読み取る CLI 表面を追加する。

- `helix screen status [--json]`: heads（stage/gate）と各 table の row counts を報告。
- `helix screen gates [--json] [--limit N]`: gate receipts の一覧（id / operation / verdict / route）。
- read helper（`readScreenStatus` / `listScreenGateReceipts`）は store module に置き、
  unit oracle は seed 済み `:memory:` db で検査する。CLI からの write は行わない。

## §3 工程表

### Step 1: read helper 契約確定と red oracle 作成 [直列]

根拠: downstream_dependency（helper 契約の確定が CLI 実装の前提）。

### Step 2: read helper + CLI 2 コマンド実装 → green [直列]

根拠: file_conflict（同一 module `src/cli.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。
request changes → 是正 → approve の各ラウンドを review_evidence へ記録する。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #175 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: PLAN-L7-514 の store 実装と schema、既存 CLI 規約（feedback list / reverse-candidates の
JSON 出力 pattern、`src/cli.ts`）。cli-surface.test.ts（他 runtime が活発に編集中）へは触れず、
oracle は専用の tests/screen-cli.test.ts に置く（spawn helper は同 pattern を局所再実装）。
schema_version は "screen-cli.v1" とし、JSON へ source_command を含める。

## 後続（本PLAN非対象）

- 申し送り継続: WALKTHROUGH_ITERATION_LIMIT の policy 化、短縮 ID 衝突対策、rule digest 差分 reentry
