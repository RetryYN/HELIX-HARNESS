---
plan_id: PLAN-L7-518-design-registry-sqlite-store
title: "PLAN-L7-518 (add-impl): Design Registry SQLite store（U-DRG-008）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#177 Design Registryを進める（slice3）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 177
engineering_discipline_required: true
behavior_contract_id: U-DRG-008
responsibility_owner: design-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L5設計 docs/design/helix/L5-detail/design-registry.md §2 の永続 schema 4 table と slice2 の RegistryStoreV1 契約・commitRegistry 再検証を正本とする。本スライスは harness.db（SQLite）上の Node transactional boundary（ADR-010: Node が唯一の transaction writer）として store を実装し、CLI 表面・authority 遷移の永続化・SCR intake は後続スライスとする"
contract_postconditions: "SqliteDesignRegistryStore が BEGIN IMMEDIATE 単一 transaction 内で append 順（node→edge→version→head）どおり書き、heads を lock 内 CAS（読み取り時 before-head を WHERE 条件へ含める）で前進させる。schema は registry（HARNESS_DB_REGISTRY_TABLES / HARNESS_DB_INDEXES）から DDL 生成し単一正本を維持、rebuild の truncate 対象外（IMMUTABLE_RECEIPT_TABLES）とする"
contract_invariants: "期待 head CAS 不一致・同一 write-set 再送（entity_id/edge_id/version_id PK と (from,to,relation)/(entity_id,revision) unique の DB 正本判定）・append fault・BEGIN 失敗・lock 内 CAS 競合・未 seed heads の全失敗経路で行増分 0。in-memory reference store と同一の意味契約を満たす"
contract_failures: "上記の全失敗経路を DRG_CAS_CONFLICT（内容 tamper は commitRegistry 側の DRG_STALE_INPUT）で fail-close し、silent genesis（未 seed heads への commit）を許さない"
tdd_red_required: true
red_at: "2026-08-08T00:27:59Z"
green_at: "2026-08-08T00:29:11Z"
mutation_oracle_evidence: "tests/design-registry-store-sqlite.test.ts が L8テスト設計スライス3表の反例を機械検査する。lock 内 CAS の WHERE 条件・ROLLBACK・duplicate の DB 正本判定・未 seed fail-close のいずれかを外す mutation は該当 fixture が red で kill する（行増分 0 の直接検証つき）"
complexity_effect: justified_positive
complexity_justification: "Design HARNESS の新規機能ユニット（#177）の第3スライス。schema tables 1本・store module 1本・oracle test 1本のみを追加し、CLI 表面は後続スライスへ分離する"
removal_trigger: "L5設計 design-registry §2 がsupersedeされ、後継設計のstoreへ置換された時"
parent_design: docs/design/helix/L6-function-design/design-registry.md
pair_artifact: docs/test-design/helix/L8-design-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-008, test_path: tests/design-registry-store-sqlite.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #177 slice分割（SQLite storeを第3スライスに）" }
  - { role: se, slot_label: "SE — SQLite store / schema tables 実装" }
  - { role: qa, slot_label: "QA — U-DRG-008 mutation oracle" }
  - { role: tl, slot_label: "TL — transactional boundary と CAS/rollback 境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-518-design-registry-sqlite-store.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/harness-db-tables-registry.ts, artifact_type: source_module }
  - { artifact_path: src/design/design-registry-sqlite-store.ts, artifact_type: source_module }
  - { artifact_path: tests/design-registry-store-sqlite.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/design/helix/L5-detail/design-registry.md
    - docs/plans/PLAN-L7-517-design-registry-transaction.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T00:44:14Z"
    tests_green_at: "2026-08-08T00:44:14Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Important 1件をprobe実証: 二重operation判定がPK制約依存で「同一entity_idへの再書込み全般」を無差別拒否し、正当なrevision-bump commitとの区別がPLAN/L5に未文書化、operation_idの永続列も無く将来のUPDATE経路で冪等性検出を失う。Minor 1件: append fault注入がversions 1経路のみ）。是正としてL5 §2へdesign_registry_operations台帳（operation_id PK + operation_digest unique、追記専用のidempotency/audit正本）を追補してschema/index/IMMUTABLE_RECEIPT_TABLES/storeへ実装し、genesis-only scope（revision更新のwrite経路は後続スライス、正当なrevision-bumpのfail-closeは意図した暫定scope）をL5 §2へ明文化、revision-bump・同一operation_id再送のfixtureをテストへ固定、append fault注入を4 table全経路のループへ拡張した。2回目approve（新規所見0）。reviewerはround 1のprobe（legitimate revision-bump→DRG_CAS_CONFLICTで行増分0がL5明文どおり、duplicate operation_idのhead-CAS通過状況下でのfail-close、head-step fault injectionの安全性）を同一手順で再実行して実測確認し、duplicate SELECTがBEGIN前early-returnかつtransaction内operations INSERTのPK制約が真のDB正本として独立機能する制御フロー、#175 slice5Aのscreen_terminal_receiptsパターンとの非対称性解消、schema配線（catalog/indexes/IMMUTABLE/state-db pin）の漏れなしを確認した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/design-registry-store-sqlite.test.ts tests/state-db.test.ts tests/coding-rules.test.ts tests/review-evidence.test.ts tests/design-language.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T00:44:14Z", evidence_path: tests/design-registry-store-sqlite.test.ts, output_digest: "sha256:610b76745c1456c1fb59d9b60a57e64d445ed15f93409f0e65277ae97d294b60", result: "review是正後worktree: 5 files / 69 tests green（U-DRG-008 oracle と state-db table-set pin / coding-rules / review-evidence / design-language gate を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T00:44:14Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T00:44:14Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T00:44:14Z"
    evidence_digest: "sha256:4be5b6df3959b4e32b86c7eec9fedbe8cfdb133fe1cb6e663ef57b24e4c5fa57"
  entries: []
---

# PLAN-L7-518: Design Registry SQLite store の実装

## 目的（Issue #177 第3スライス）

L5設計 §2 の永続 schema 4 table（design_registry_nodes / edges / versions / heads）と、
slice2 の `RegistryStoreV1` 契約を満たす `SqliteDesignRegistryStore` を TDD で実装する。
#175 slice5A の規律（registry 生成 DDL・BEGIN IMMEDIATE・lock 内 CAS・fault 注入 oracle・
IMMUTABLE_RECEIPT_TABLES 登録）を踏襲する。

- 二重 operation の判定は DB を正本とする: 同一 write-set の再送は entity_id / edge_id /
  version_id PK と (from,to,relation) / (entity_id,revision) unique 制約違反として rollback。
- 内容 tamper は slice2 の `commitRegistry` 再検証（DRG_STALE_INPUT）が store 手前で遮断する。

## §3 工程表

### Step 1: L5 §2 突き合わせとred oracle作成 [直列]

根拠: downstream_dependency（永続 schema と store 契約の確定が実装の前提）。

### Step 2: schema tables + SQLite store 実装 → green [直列]

根拠: file_conflict（同一module `src/design/design-registry-sqlite-store.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。
request changes → 是正 → approve の各ラウンドを review_evidence へ記録する。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #177 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L5設計 §2（table/PK/unique/状態）、slice2 の bundle/receipt/store 契約、
`src/design/screen-applicability-sqlite-store.ts`（#175 slice5A の transactional boundary idiom）。
DDL は `HARNESS_DB_REGISTRY_TABLES` + `HARNESS_DB_INDEXES` から生成し手書き DDL を持たない。
heads 未 seed は fail-close（silent genesis 禁止）。fault 注入（append/BEGIN/head 競合）は
options 経由の test 専用 hook とする。

## 後続スライス（本PLAN非対象）

- CLI / lint 表面（registry status / trace query の読み取り表面）
- authority 遷移（shadow→canonical→stale→retired）の永続化と markStaleLineage の適用 write
- screens 台帳からの SCR intake、public command の RegistryPolicyV1 例外判断
