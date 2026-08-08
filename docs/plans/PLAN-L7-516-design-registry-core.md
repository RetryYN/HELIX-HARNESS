---
plan_id: PLAN-L7-516-design-registry-core
title: "PLAN-L7-516 (add-impl): Design Registry 純関数群（U-DRG-001〜005）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#177 Design Registryを進める（slice1）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 177
engineering_discipline_required: true
behavior_contract_id: U-DRG-002
responsibility_owner: design-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L6設計 docs/design/helix/L6-function-design/design-registry.md §0-§2 の型・signature・DbC と L5詳細設計 §2 の stable ID 規約・adjacency 正本表を正本とする。本スライスは pure evaluator 群（filesystem/clock/DB 非依存）のみを実装し、取引系（build/commit/stale 遷移）・永続化・CLI 表面は後続スライスとする"
contract_postconditions: "canonicalizeRegistryDeclaration が kind 別 ID regex・path/class 名主キー拒否・stable sort・dedup・semantic_digest 採番を決定的に行い、validateRegistryGraph が重複 ID・片端欠落 edge・adjacency 表外・permission 素通り invokes を fail-close し、computeTraceClosure が chain orphan を全列挙、validateParentGraph が HR-FR-DHR-006 の 6 原子被覆を検査、queryTrace が stale mark つき双方向 trace を決定的に返す"
contract_invariants: "同義入力（順序違い・完全重複）は同 declaration_digest。stale/retired entity を含む chain は closed へ算入しない。pure API は入力 graph を変異させない"
contract_failures: "ID regex 逸脱=DRG_ID_INVALID、重複=DRG_DUPLICATE_ID、片端欠落=DRG_EDGE_ORPHAN、adjacency 表外=DRG_RELATION_INVALID、service 直列 chain 破り=DRG_UNGUARDED_INVOKE、chain 欠落=DRG_CHAIN_ORPHAN、親原子喪失=DRG_PARENT_LOST を typed failure で fail-close する"
tdd_red_required: true
red_at: "2026-08-07T18:31:37Z"
green_at: "2026-08-07T18:33:33Z"
mutation_oracle_evidence: "tests/design-registry-{canonicalize,graph,closure,parents,trace}.test.ts が L8テスト設計スライス1表の反例を機械検査する。regex 判定・adjacency 判定・orphan 列挙・stale 遮断・4 原子判定のいずれかを外す mutation は該当 fixture が red で kill する（U-DRG-001〜005 の各行に kill 条件を明記）"
complexity_effect: justified_positive
complexity_justification: "Design HARNESS の新規機能ユニット（#177）の第1スライス。pure module 1本と oracle test 5本のみを追加し、取引系・永続化・CLI は後続スライスへ分離する"
removal_trigger: "L6設計 design-registry がsupersedeされ、後継設計のregistryへ置換された時"
parent_design: docs/design/helix/L6-function-design/design-registry.md
pair_artifact: docs/test-design/helix/L8-design-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-001, test_path: tests/design-registry-canonicalize.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-002, test_path: tests/design-registry-graph.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-003, test_path: tests/design-registry-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-004, test_path: tests/design-registry-parents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-005, test_path: tests/design-registry-trace.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #177 slice分割（純関数群を第1スライスに）" }
  - { role: se, slot_label: "SE — pure evaluator 群実装" }
  - { role: qa, slot_label: "QA — U-DRG-001〜005 mutation oracle" }
  - { role: tl, slot_label: "TL — adjacency 正本表と typed failure 境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-516-design-registry-core.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L5-design-registry-integration-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L6-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/design-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/tools/design-registry-fixture.ts, artifact_type: source_module }
  - { artifact_path: tests/design-registry-canonicalize.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-registry-graph.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-registry-closure.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-registry-parents.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-registry-trace.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/design/helix/L5-detail/design-registry.md
    - docs/design/helix/L6-function-design/design-registry.md
    - docs/test-design/helix/L6-design-registry-unit-test-design.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-07T18:56:23Z"
    tests_green_at: "2026-08-07T18:56:23Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Important 3件をprobe実証: (1) 同一edge_id（from/to/relation）のauthority違い重複がcanonicalize dedupとvalidateRegistryGraphの双方をすり抜ける、(2) 起点requirement自身がstale/retiredだとorphan判定を素通りし静かなgreenを返す、(3) taint集約がAND意味論でクリーン経路がstale経路を打ち消す。Minor 3件: DRG_UNGUARDED_INVOKEの過剰分類（requirement→command invokesまで誤分類）、kind×atom_role/service_role不整合の受理、roleless guarded_by assertの弱さ）。是正としてvalidateRegistryGraphへseenEdgeIdsのDRG_DUPLICATE_ID検査を追加、computeTraceClosureのseed前isTraversable検査でstale起点をorphan化、taint集約をsticky-OR（false→true昇格のみ再訪問の単調収束）へ変更しL6 docへ集約規則を明記、isServiceChainBreakを直列chain内の段飛ばし・role不一致・interaction直結に限定、parseNodeへkind×role整合チェックを追加、対応するU-DRG-002/003/005 fixtureを6件追加した。2回目approve（Critical/Important/Minor 0件）。reviewerはround 1のprobe 1〜4を同一手順で再実行して全件fail-closeへ転じたことを直接確認し（probe1: DRG_DUPLICATE_ID、probe2: DRG_CHAIN_ORPHAN、probe3: 両edge挿入順でstale_tainted=true、probe4: DRG_RELATION_INVALID）、Minor-2確認のprobe5（kind×role不整合2件のDRG_ID_INVALID reject）を追加実測、sticky-ORの単調収束性・無限ループ耐性のadversarial re-reviewでも新規所見なしを確認した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/design-registry-canonicalize.test.ts tests/design-registry-graph.test.ts tests/design-registry-closure.test.ts tests/design-registry-parents.test.ts tests/design-registry-trace.test.ts tests/coding-rules.test.ts tests/review-evidence.test.ts tests/design-language.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-07T18:56:23Z", evidence_path: tests/design-registry-graph.test.ts, output_digest: "sha256:3cfdc1cf37e411b189846ddd2cb4a513d1de2a747e4ef7024c8405c3ee1383d5", result: "review是正後worktree: 8 files green（U-DRG-001〜005 oracle 5件と coding-rules / review-evidence / design-language gate を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-07T18:53:13Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-07T18:56:23Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-07T18:56:23Z"
    evidence_digest: "sha256:cc3c5bb343c3d18c3d9e8a3bd17e98b2538728a49c3aa4a5be2a1f22a9571f97"
  entries: []
---

# PLAN-L7-516: Design Registry 純関数群の実装

## 目的（Issue #177 第1スライス）

L6設計 §1 の pure API 5 本（`canonicalizeRegistryDeclaration` / `validateRegistryGraph` /
`computeTraceClosure` / `validateParentGraph` / `queryTrace`）を TDD で実装する。
本 PR には #177 設計フェーズの正本 doc 4 本（L5/L6 設計・L5/L6 pair テスト設計、3 ラウンド
intra-runtime 設計レビュー approve 済み）と、その catalog 登録・L8 実行正本を同乗させる
（PR #444 の pr_scope_source_companions_missing 教訓により docs-only 分離をやめ、
PLAN + tests 同乗の feature PR へ統合）。

- 設計精緻化: adjacency 表外の kind×relation へ typed failure `DRG_RELATION_INVALID` を新設
  （既存 enum に汎用 adjacency 違反 code が無いため。L6 §0/§1・L5 §5 を同時更新）。
- `RegistryPolicyV1` は本スライスでは schema_version のみ（permission 不要な public command の
  例外扱いは取引系スライスの判断へ申し送り、緩和は入れない）。

## §3 工程表

### Step 1: L6 §0-§2 突き合わせとred oracle作成 [直列]

根拠: downstream_dependency（型・adjacency 正本表の確定が実装の前提）。

### Step 2: pure evaluator 群実装 → green [直列]

根拠: file_conflict（同一module `src/design/design-registry.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。
request changes → 是正 → approve の各ラウンドを review_evidence へ記録する。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #177 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L6設計 §0（型）・§1（DbC と adjacency 正本表）・§2（stable ID 規約は L5 §2）、
L8テスト設計スライス1表。sha256 canonical digest・typed failure・fail-close 集約は
`src/design/screen-applicability.ts` と同 idiom とする。chain 閉包は requirement
（atom_role=null）起点の BFS で forward relation exact set を辿り、stale/retired を遮断する。
親グラフは parents edge の直接到達（adjacency 表準拠）で user_task/business_outcome 両原子と
user_task の 4 原子被覆を検査する。trace は方向別 BFS で stale taint を伝播する。

## 後続スライス（本PLAN非対象）

- 取引系（buildRegistryCommit / commitRegistry / markStaleLineage、U-DRG-006/007）
- SQLite store + 共有 contract（#175 slice4/5 の store パターン踏襲)
- CLI / lint 表面、screens 台帳からの SCR intake
- public command（permission 不要）の RegistryPolicyV1 例外判断
