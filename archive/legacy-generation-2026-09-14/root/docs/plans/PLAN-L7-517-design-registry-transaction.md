---
plan_id: PLAN-L7-517-design-registry-transaction
title: "PLAN-L7-517 (add-impl): Design Registry 取引系（U-DRG-006/007）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#177 Design Registryを進める（slice2）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 177
engineering_discipline_required: true
behavior_contract_id: U-DRG-006
responsibility_owner: design-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L6設計 docs/design/helix/L6-function-design/design-registry.md §1-§2 の buildRegistryCommit / commitRegistry / markStaleLineage 契約と slice1 の validated graph を正本とする。本スライスは in-memory reference store（決定的、DB/filesystem 非依存）を registry write authority の正本契約として実装し、SQLite 永続化・CLI 表面は後続スライスとする"
contract_postconditions: "buildRegistryCommit が append 順 node→edge→version→head 固定・write_set/operation digest 採番を決定的に行い、commitRegistry が digest 再検証を通過した bundle のみを store の atomic commit（期待 head CAS・二重 operation 検査・append fault rollback）へ委譲し、正常系 receipt に before/after head と挿入件数を bind する。markStaleLineage が上流 digest 差の entity と依存 edge・下流到達 entity を同一 lineage_id で決定的に stale 化する"
contract_invariants: "同義入力の build は同 operation_digest。CAS 不一致・二重 operation・digest 改変・append fault の全失敗経路で store 増分 0。markStaleLineage の同一入力再送は決定的同値で、上流（screen/interaction 等の非依存側）を stale 化しない"
contract_failures: "bundle の write_set/operation digest・append_order 改変=DRG_STALE_INPUT、期待 head CAS 不一致・二重 operation・append fault=DRG_CAS_CONFLICT、trigger の未知 entity_id=DRG_ID_INVALID、空 trigger・schema 不一致=DRG_STALE_INPUT を typed failure で fail-close する"
tdd_red_required: true
red_at: "2026-08-07T23:39:27Z"
green_at: "2026-08-07T23:40:16Z"
mutation_oracle_evidence: "tests/design-registry-commit.test.ts / tests/design-registry-stale.test.ts が L8テスト設計スライス2表の反例を機械検査する。digest 再計算検査・CAS・二重 operation 検査・append fault rollback・lineage 下流伝播・決定性のいずれかを外す mutation は該当 fixture が red で kill する（増分 0 の直接検証つき）"
complexity_effect: justified_positive
complexity_justification: "Design HARNESS の新規機能ユニット（#177）の第2スライス。取引 module 1本と oracle test 2本のみを追加し、SQLite 永続化・CLI は後続スライスへ分離する"
removal_trigger: "L6設計 design-registry がsupersedeされ、後継設計のtransactionへ置換された時"
parent_design: docs/design/helix/L6-function-design/design-registry.md
pair_artifact: docs/test-design/helix/L8-design-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-006, test_path: tests/design-registry-commit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-007, test_path: tests/design-registry-stale.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #177 slice分割（取引系を第2スライスに）" }
  - { role: se, slot_label: "SE — commit bundle / reference store 実装" }
  - { role: qa, slot_label: "QA — U-DRG-006/007 mutation oracle" }
  - { role: tl, slot_label: "TL — registry write authority と CAS/rollback 境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-517-design-registry-transaction.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/design-registry-transaction.ts, artifact_type: source_module }
  - { artifact_path: tests/design-registry-commit.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-registry-stale.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/design/helix/L6-function-design/design-registry.md
    - docs/plans/PLAN-L7-516-design-registry-core.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T00:00:46Z"
    tests_green_at: "2026-08-08T00:00:46Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Critical 4件を全てprobe実証: (1) write_set_digestがsemantic_digest列のみをhashし実フィールド（authority等）のtamperがcommitを通過するmasked mutation、(2) 同一原因でversions.supersedes_revisionが偽装可能、(3) buildRegistryCommitとstoreが呼び出し元オブジェクトを参照共有しcommit後の外部変異がstore stateへ漏洩、(4) markStaleLineageがparents逆参照edgeを辿り画面変更が業務要件をstale化する逆方向伝播。Important 2件: revision>1のsupersedes導出・空入力/schema不一致ガードが0-hit未テスト。Minor 2件）。是正としてwrite_set_digestを実フィールド再導出digest+version全fieldへ変更、commitRegistryへbundleContentViolation（node/edge semantic_digest・edge_id・version導出の再計算照合、改変=DRG_STALE_INPUT）を追加、build/store双方でnode/edge/versionをcloneし参照共有を遮断、伝播をslice1からexportしたREGISTRY_CHAIN_RELATIONSに限定、revision=3/空入力/schema不一致/fan-in dedup/内容tamper 6種/post-commit外部変異隔離の反例fixtureを追加した。2回目approve（blocking所見0、non-blocking Minor 2件は同round内で是正: 補助分岐のedge_id/versions個数/順序tamper反例を追加し、edge通知が全relation対象である意図的非対称をL6 docと実装コメントへ明記）。reviewerはround 1のprobe 5本を同一手順で再実行して全件fail-close/隔離への転化を直接確認し（node/edge/version tamper→DRG_STALE_INPUT、parents逆伝播→requirement非stale化、参照共有→隔離）、v8 coverage実測でround 1指摘の0-hit分岐（revision>1・空入力・schema不一致・fan-in dedup）が全てhitへ転じたことを確認、CAS並行実行の安全性（同期本体によるTOCTOU不在）もround 1のprobeで実測済み。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/design-registry-commit.test.ts tests/design-registry-stale.test.ts tests/design-registry-canonicalize.test.ts tests/design-registry-graph.test.ts tests/design-registry-closure.test.ts tests/design-registry-parents.test.ts tests/design-registry-trace.test.ts tests/coding-rules.test.ts tests/review-evidence.test.ts tests/design-language.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T00:00:46Z", evidence_path: tests/design-registry-commit.test.ts, output_digest: "sha256:f9cb7795cb4b7ea90c7258d698a9225df94eaf29d76f6c8710a2dcade613bbf2", result: "review是正後worktree: 10 files / 60 tests green（U-DRG-001〜007 oracle 7件と coding-rules / review-evidence / design-language gate を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T00:00:46Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T00:00:46Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T00:00:46Z"
    evidence_digest: "sha256:f3fa9b19ca652d2d14498c7df21e834807cf1b0ff95685864dcfe3c769b0bc49"
  entries: []
---

# PLAN-L7-517: Design Registry 取引系の実装

## 目的（Issue #177 第2スライス）

L6設計 §1 の取引系 3 API（`buildRegistryCommit` / `commitRegistry` / `markStaleLineage`）を
TDD で実装する。store は in-memory reference（registry write authority の正本契約）とし、
#175 slice4 の規律（lock 内 CAS・append 順固定・digest binding・失敗経路の増分 0 直接検証）を踏襲する。

- typed failure の割当（L6 §1 の draft 精緻化）: bundle 改変（write_set/operation digest・
  append_order）= `DRG_STALE_INPUT`、commit 時競合（期待 head CAS・二重 operation・
  append fault）= `DRG_CAS_CONFLICT`。
- `markStaleLineage` は起点 + 下流到達 entity と依存 edge を同一 `lineage_id`
  （決定的 sha256）で束ね、graph 自体は変異させない（authority 遷移の永続化は SQLite スライス）。

## §3 工程表

### Step 1: L6 §1-§2 突き合わせとred oracle作成 [直列]

根拠: downstream_dependency（bundle schema と store 契約の確定が実装の前提）。

### Step 2: 取引 module 実装 → green [直列]

根拠: file_conflict（同一module `src/design/design-registry-transaction.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。
request changes → 是正 → approve の各ラウンドを review_evidence へ記録する。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #177 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L6設計 §1（DbC）・§2（RegistryCommitBundleV1 / RegistryCommitReceiptV1 / RegistryStoreV1）、
L8テスト設計スライス2表、slice1 の型・digest idiom。write_set_digest は nodes/edges/versions の
semantic_digest 列、operation_digest は operation_id + expected_registry_head + write_set_digest の
固定キー順 sha256。reference store は staged copy → append（fault 注入点つき）→ head 前進の
単一同期区間で atomic を保証し、失敗経路は staged 破棄で増分 0 とする。

## 後続スライス（本PLAN非対象）

- SQLite store（shared contract factory で in-memory / SQLite の oracle 共有、#175 slice5A 方式）
- CLI / lint 表面、screens 台帳からの SCR intake
- authority 遷移（shadow→canonical→stale→retired）の永続化と markStaleLineage の適用 write
- public command（permission 不要）の RegistryPolicyV1 例外判断
