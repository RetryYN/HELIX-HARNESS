---
plan_id: PLAN-L7-519-design-registry-cli
title: "PLAN-L7-519 (add-impl): Design Registry CLI 読み取り表面（U-DRG-009）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#177 Design Registryを進める（slice4）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 177
engineering_discipline_required: true
behavior_contract_id: U-DRG-009
responsibility_owner: design-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "slice3 の SqliteDesignRegistryStore（読み取り helper 含む）と #175 slice B（helix screen 読み取り表面）の CLI idiom を正本とする。本スライスは読み取り専用の CLI 表面のみを追加し、write 表面・authority 遷移・SCR intake は後続スライスとする"
contract_postconditions: "helix registry status / operations が read helper（readDesignRegistryStatus / listDesignRegistryOperations）経由で head・row counts・operations 台帳を報告し、--json は schema_version=registry-cli.v1 + source_command 付きで exit 0、エラーは stderr JSON + exitCode=1 に正規化し db を必ず close する"
contract_invariants: "CLI 表面は読み取り専用で registry へ write しない。helper は table 欠落 db で throw（typed error 経路の入口）、空 DB で空状態、limit<=0/非整数で空を返す（fail-safe read）"
contract_failures: "db open/read 失敗は stderr への registry-cli.v1 JSON + exitCode=1 で fail-close する"
tdd_red_required: true
red_at: "2026-08-08T01:31:48Z"
green_at: "2026-08-08T01:32:39Z"
mutation_oracle_evidence: "tests/design-registry-cli.test.ts が L8テスト設計スライス4表の反例を機械検査する。helper の read 一致・schema_version/source_command・fail-safe read（table 欠落 throw / 空 DB / limit 境界）のいずれかを外す mutation は該当 fixture が red で kill する"
complexity_effect: justified_positive
complexity_justification: "Design HARNESS の新規機能ユニット（#177）の第4スライス。CLI command group 1つと read helper 1本・oracle test 1本のみを追加する"
removal_trigger: "registry CLI 表面が後継設計の表面へ置換された時"
parent_design: docs/design/helix/L6-function-design/design-registry.md
pair_artifact: docs/test-design/helix/L8-design-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-009, test_path: tests/design-registry-cli.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #177 slice分割（CLI 読み取り表面を第4スライスに）" }
  - { role: se, slot_label: "SE — registry CLI command group 実装" }
  - { role: qa, slot_label: "QA — U-DRG-009 oracle" }
  - { role: tl, slot_label: "TL — 読み取り専用境界と typed error 正規化" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-519-design-registry-cli.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/design-registry-sqlite-store.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/design-registry-cli.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/plans/PLAN-L7-518-design-registry-sqlite-store.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T01:45:03Z"
    tests_green_at: "2026-08-08T01:45:03Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が1ラウンドでレビューしapprove（Critical/Important 0件、Minor 1件=CLI subprocess経路が実DBに対するschema形状検証のみで内容一致はhelper側テストが担う構造 — #175 slice Bのscreen-cli承認済みidiomと完全同型のため対応なし可と判定）。reviewerはscreen group（PLAN-L7-515）とのidiom完全一致（--json schema/stderr JSON正規化/finally db close/limit NaNフォールバック）、読み取り専用性（registry groupにINSERT/UPDATE/DELETEなし、helperはSELECTのみ、LIMITはbound parameterで文字列連結なし）、pin更新の正当性（src/cli.ts実測sha256とfeedback-refactor-disposition 8行・worker-wrapper-admission source_digest 3行・digest inventoryの全一致、design-registry-sqlite-store.tsは新規createHash追加なしでinventory対象外が正しい）、テストのoracle強度（helper内容一致+CLI schema形状+table欠落throw+空DB fail-safeの両面）を実測確認した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/design-registry-cli.test.ts tests/feedback-refactor-disposition.test.ts tests/design-reality-binding.test.ts tests/digest.test.ts tests/coding-rules.test.ts tests/review-evidence.test.ts tests/design-language.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T01:45:03Z", evidence_path: tests/design-registry-cli.test.ts, output_digest: "sha256:a0e43a0e0c1efe2916e5034df0f669df5e0b086f0d98e9534d9d12002fc7cfb7", result: "review後worktree: 7 files / 90 tests green（U-DRG-009 oracle と pin 系 gate / coding-rules / review-evidence / design-language を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T01:45:03Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T01:45:03Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T01:45:03Z"
    evidence_digest: "sha256:f4e97f0be5ddbd87f7cd15afb608b2bcf7444cbb9f914406221ef1b81e94401f"
  entries: []
---

# PLAN-L7-519: Design Registry CLI 読み取り表面の実装

## 目的（Issue #177 第4スライス）

slice3 の SQLite store が書く runtime 証跡（head / nodes / edges / versions / operations 台帳）を
`helix registry status` / `helix registry operations` として読み取り専用で可視化する
（#175 slice B の `helix screen` idiom 踏襲。feedback-list パターンの --json / stderr JSON /
db close 規律）。

## §3 工程表

### Step 1: #175 slice B idiom 突き合わせとred oracle作成 [直列]

根拠: downstream_dependency（CLI 出力 schema の確定が実装の前提）。

### Step 2: read helper + CLI command group 実装 → green [直列]

根拠: file_conflict（src/cli.ts への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #177 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: `src/cli.ts` の screen group（PLAN-L7-515）と feedback-list パターン、slice3 の
read helper。cli.ts の source digest pin（feedback-refactor-disposition 8 行）と digest
inventory は編集後に refresh する。

## 後続スライス（本PLAN非対象）

- authority 遷移の永続化（revision 更新 UPDATE 経路・markStaleLineage 適用 write）
- screens 台帳からの SCR intake、public command の RegistryPolicyV1 例外判断
