---
plan_id: PLAN-L7-514-screen-applicability-projection
title: "PLAN-L7-514 (add-impl): ScreenApplicability harness.db schema と SQLite-backed store（U-SAP-011 永続化）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#175 ScreenApplicabilityGateを進める（slice5/永続化A）"
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
github_issue_id: 175
engineering_discipline_required: true
behavior_contract_id: U-SAPDB-001
responsibility_owner: screen-applicability
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L5設計 docs/design/helix/L5-detail/screen-applicability-prototype.md §2（table 定義）と L6 §2/§5 の store 契約を正本とする。DDL は既存 harness.db schema DSL（単一列PK + unique index、FK/partial unique はアプリ層担保）に従い、slice4 の in-memory reference store と同一の ScreenApplicabilityStoreV1 意味契約を SQLite で実装する"
contract_postconditions: "screen applicability 系 table 群が harness.db schema registry に登録され、SqliteScreenApplicabilityStore が in-memory reference store と同一の U-SAP-011 oracle（36 cases）を共有 contract test として green にする。commitStageClosureAndGate は同一 SQLite transaction で stage/gate rows を atomic に書き、失敗時は rollback して増分 0"
contract_invariants: "gate row への write authority は SqliteScreenApplicabilityStore.commitStageClosureAndGate の成功経路のみ。既存 table・projection・rebuild の挙動を変えない（新 table は rebuild の truncate 対象へ追加するのみ）。in-memory store の挙動も不変"
contract_failures: "in-memory 版と同一の typed failure に加え、SQLite transaction の append fault 時は rollback して stage/gate/completion 全行の増分 0 とする"
tdd_red_required: true
red_at: "2026-08-07T05:22:25Z"
green_at: "2026-08-07T05:25:53Z"
mutation_oracle_evidence: "tests/screen-stage-closure-gate.test.ts の 36 oracle を store factory 差し替えで SQLite 実装にも適用する共有 contract test（tests/screen-store-sqlite.test.ts）が、in-memory 版と同一の build 前/後 tamper mutation を SQLite 経路で機械検査する。加えて transaction rollback（append fault 注入で全行増分 0）と schema DDL の real-repo regression を検査する"
complexity_effect: justified_positive
complexity_justification: "Design HARNESS の新規機能ユニット（#175）の永続化スライスA。schema 登録と SQLite store 1本・test 1本のみを追加し、CLI 表面は後続スライスBへ分離する"
removal_trigger: "L6設計 screen-applicability-prototype がsupersedeされ、後継設計のstoreへ置換された時"
parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md
pair_artifact: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAPDB-001, test_path: tests/screen-store-sqlite.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #175 永続化を schema+store（A）と CLI（B）へ分割" }
  - { role: se, slot_label: "SE — SQLite-backed store 実装" }
  - { role: qa, slot_label: "QA — 共有 contract test の factory 化" }
  - { role: tl, slot_label: "TL — Node transactional boundary（ADR-010）整合" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-514-screen-applicability-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/state-db/screen-applicability-sqlite-store.ts, artifact_type: source_module }
  - { artifact_path: tests/screen-store-sqlite.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/design/helix/L5-detail/screen-applicability-prototype.md
    - docs/design/helix/L6-function-design/screen-applicability-prototype.md
    - docs/plans/PLAN-L7-513-screen-stage-closure-store.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-07T05:46:30Z"
    tests_green_at: "2026-08-07T05:46:00Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Important 6件: BEGIN IMMEDIATEがtry外で型契約を破る、hydrate〜lock間のTOCTOUでheads無条件UPDATEがlost updateを許す、reference委譲のcommittedOperationsがSQLite経路で常に空となり二重gate判定が死んでいる、screen_stage_projectionsのみINSERT OR REPLACEで未説明・未テスト、手書きSCREEN_TABLES_DDLとschema registryの二重定義drift、IMMUTABLE_RECEIPT_TABLESコメントの過度な一般化。Minor 2件）。是正としてBEGIN失敗のtyped failure正規化、before-head条件付きUPDATE+changes検査のlock内CAS、DB正本の二重gate SELECT、REPLACE設計理由の明文化+同一snapshot連続commit契約テスト、DDLをregistry生成（createTableSql/createIndexSql）へ単一正本化、コメント是正、未seed fallback/validateAgreementBackpropPair直接テストを追加。2回目approve（Critical/Important 0件）。reviewerはPromise.all同時実行のread-only probeでlost update遮断（勝者1・敗者typed failure・gate/terminal各1行）を実測し、registry生成DDLが旧手書きDDLと10 table・3 index完全一致することを直接生成で確認、coverage Branch 94.11%を実測した。残Minor（begin_failed/cas_conflict分岐の回帰固定）はfault hook注入（injectBeginFault/onBeforeHeadUpdate）の決定的テスト2件として同スライス内で追補済み（139/139 green）。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/screen-store-sqlite.test.ts tests/screen-stage-closure-gate.test.ts tests/review-evidence.test.ts tests/design-language.test.ts tests/coding-rules.test.ts tests/digest-canonicalization.test.ts tests/digest.test.ts tests/projection-writer.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-07T05:46:00Z", evidence_path: tests/screen-store-sqlite.test.ts, output_digest: "sha256:cd2ccb164fe0bd4d60b533ff502719600a15ebd224d04a41d44cc6802aa6c475", result: "review是正後worktree: 8 files / 139 tests passed（U-SAPDB-001の47件を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-07T05:45:28Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-07T05:46:30Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-07T05:46:30Z"
    evidence_digest: "sha256:bc8a831f659156c0daeaa8e765fe91785bc81455054ab7a788a53b115693dc0e"
  entries: []
---

# PLAN-L7-514: harness.db schema と SQLite-backed store の実装

## 目的（Issue #175 永続化スライスA）

slice4 の in-memory reference store と同一の `ScreenApplicabilityStoreV1` 意味契約を、
harness.db（SQLite）上の Node transactional boundary として実装する（ADR-010: Node が唯一の
transaction writer）。CLI 表面は後続スライスB。

- L5 §2 の screen applicability 系 table 群を harness.db schema registry へ登録する
  （既存 DSL の制約により FK / partial unique はアプリ層＝store 検証で担保し、
  単一列 PK + unique index で表現する）。
- `SqliteScreenApplicabilityStore` は read 系 5 API / validateAgreementBackpropPair /
  commitStageClosureAndGate を同一契約で実装し、commit は単一 SQLite transaction で
  stage completion / projection / gate receipt / terminal receipt を append 順どおり書き、
  失敗時は rollback して増分 0 とする。
- slice4 の 36 oracle を store factory 差し替えで共有する contract test を新設し、
  in-memory / SQLite の両実装が同一 mutation 集合で green であることを機械検査する。

## §3 工程表

### Step 1: L5 §2 突き合わせと schema 登録 + red oracle（共有 contract test の factory 化） [直列]

根拠: downstream_dependency（schema と store 契約の確定が実装の前提）。

### Step 2: SqliteScreenApplicabilityStore 実装 → green [直列]

根拠: file_conflict（同一module `src/state-db/screen-applicability-sqlite-store.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。
request changes → 是正 → approve の各ラウンドを review_evidence へ記録する。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #175 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L5 §2 table 定義、L6 §2/§5 store 契約、slice4 実装（`src/design/screen-applicability-store.ts`）、
既存 schema DSL（`src/schema/harness-db-types.ts` / `harness-db.ts`）と projection 規約
（`src/state-db/projection-writer.ts`）。table は L5 命名のまま登録し、検証ロジックは slice4 の
pure 検証関数を再利用（store 本体から検証部を共有 helper へ抽出し、in-memory / SQLite の二重実装を
避ける）。テストは fixture/seed/mutation を slice4 と共通化した factory パターン
（`describe.each([inMemory, sqlite])`）とし、SQLite 固有の rollback fault 注入を追加する。
rebuild（`rebuildHarnessDb`）へは truncate 対象としてのみ配線し、runtime write 経路は本 store だけとする。

## 後続スライス（本PLAN非対象）

- スライスB: CLI 表面（`helix screen ...` 読み取り系）+ cli-surface oracle
- physical-data.md への harness 台帳 back-fill（スライスBと同時に整理）
- 申し送り継続: WALKTHROUGH_ITERATION_LIMIT の policy 化、短縮 ID 衝突対策
