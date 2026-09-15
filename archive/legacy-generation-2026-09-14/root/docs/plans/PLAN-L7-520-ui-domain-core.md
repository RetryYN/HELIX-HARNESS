---
plan_id: PLAN-L7-520-ui-domain-core
title: "PLAN-L7-520 (add-impl): UI Domain・Pattern Profile 純関数群（U-UDP-001〜004）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#209 UI domain・Pattern Profileを進める（slice1）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 209
engineering_discipline_required: true
behavior_contract_id: U-UDP-001
responsibility_owner: ui-domain-pattern-profile
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L6設計 docs/design/helix/L6-function-design/ui-domain-pattern-profile.md §0-§2 の型・signature・DbC と L5詳細設計 §1-§2 の prefix 規約・隔離規則を正本とする。本スライスは pure evaluator 群（canonicalize / contract / isolation / profile、filesystem/clock/DB 非依存）のみを実装し、pairwise selector・registry consumer 接続・CLI 表面は後続スライスとする"
contract_postconditions: "canonicalizeUiDomain が kind 別 prefix regex・class/path/DOM selector 主キー拒否・stable sort・dedup・semantic_digest 採番を決定的に行い、validatePatternContract が required/forbidden 競合と対象非実在を fail-close して索引を返し、guardRulePackIsolation が共通 pack への product 値混入を全列挙 fail-close し、validateUiProfile が profile 必須要素の欠落を全列挙 fail-close する。schema_version 不一致・stale/retired の canonical 渡しは全 API 共通の入口検査で UDP_STALE_INPUT"
contract_invariants: "同義入力（順序違い・完全重複）は同 declaration_digest。pure API は入力を変異させず、write authority を持たない（registry write は #177 の transaction 経路）"
contract_failures: "ID regex 逸脱・class/path/DOM 主キー=UDP_ID_INVALID、required/forbidden 競合=UDP_CONTRACT_CONFLICT、product 値混入=UDP_PRODUCT_VALUE_IN_COMMON_PACK、profile 必須欠落=UDP_PROFILE_INCOMPLETE、schema/stale 入力=UDP_STALE_INPUT を typed failure で fail-close する"
tdd_red_required: true
red_at: "2026-08-08T02:33:52Z"
green_at: "2026-08-08T02:35:04Z"
mutation_oracle_evidence: "tests/ui-domain-{canonicalize,contract,rulepack,profile}.test.ts が L8テスト設計スライス1表の反例を機械検査する。prefix regex・主キー拒否・入口検査・競合判定・実在検査・混入判定の各枝・必須判定の各枝のいずれかを外す mutation は該当 fixture が red で kill する"
complexity_effect: justified_positive
complexity_justification: "Design HARNESS の新規機能ユニット（#209）の第1スライス。pure module 1本と oracle test 4本のみを追加し、selector・接続・CLI は後続スライスへ分離する"
removal_trigger: "L6設計 ui-domain-pattern-profile がsupersedeされ、後継設計へ置換された時"
parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md
pair_artifact: docs/test-design/helix/L8-ui-domain-pattern-profile-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, oracle_id: U-UDP-001, test_path: tests/ui-domain-canonicalize.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, oracle_id: U-UDP-002, test_path: tests/ui-domain-contract.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, oracle_id: U-UDP-003, test_path: tests/ui-domain-rulepack.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, oracle_id: U-UDP-004, test_path: tests/ui-domain-profile.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #209 slice分割（純関数群を第1スライスに）" }
  - { role: se, slot_label: "SE — pure evaluator 群実装" }
  - { role: qa, slot_label: "QA — U-UDP-001〜004 mutation oracle" }
  - { role: tl, slot_label: "TL — prefix 規約と隔離境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-520-ui-domain-core.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/ui-domain-pattern-profile.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/ui-domain-pattern-profile.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ui-domain-pattern-profile.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L4-ui-domain-pattern-profile-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L5-ui-domain-pattern-profile-integration-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L6-ui-domain-pattern-profile-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-ui-domain-pattern-profile-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/ui-domain-pattern-profile.ts, artifact_type: source_module }
  - { artifact_path: tests/tools/ui-domain-fixture.ts, artifact_type: source_module }
  - { artifact_path: tests/ui-domain-canonicalize.test.ts, artifact_type: test_code }
  - { artifact_path: tests/ui-domain-contract.test.ts, artifact_type: test_code }
  - { artifact_path: tests/ui-domain-rulepack.test.ts, artifact_type: test_code }
  - { artifact_path: tests/ui-domain-profile.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/design/helix/L5-detail/ui-domain-pattern-profile.md
    - docs/design/helix/L6-function-design/ui-domain-pattern-profile.md
    - docs/test-design/helix/L6-ui-domain-pattern-profile-unit-test-design.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T02:45:36Z"
    tests_green_at: "2026-08-08T02:45:36Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Critical 2件をprobe実証: (1) guardRulePackIsolationのbrand値判定が完全一致Setでcss埋め込み・hex表記ゆれ・profile_id大小文字違いが素通り、(2) canonicalizeUiDomainのdedupがsemantic_digest単位のため同一entity_idの非同値宣言が主キー重複のまま通過（#177 slice1のdedup教訓と同型の再発）。Important 1件: wildcard×具体IDの交差競合が未検出。Minor 2件）。是正として隔離判定を大小文字正規化+部分一致（contains）へ変更しL5 §2へ判定規則を明文化、entity_id単位の一意性検査（完全重複のみdedup・非同値同一IDはUDP_ID_INVALID）を追加、wildcard交差競合（同一kind+conditionの双方向）を検出しL5 §2へ意味論を明記、forbidden_indexのSet dedupと防御縦深コメントを追加、反例fixture 5件を追加した。2回目approve（新規所見0）。reviewerはround 1のprobe全件を同一手順で再実行して部分埋め込み・大小文字違い・非同値重複・wildcard交差（双方向）の全件がfail-closeへ転じたことを直接確認し、condition違いの非競合契約がgreenのまま（過剰検出なし）であることも確認した。transliterated path（SCR-src-components-approve-tsx等）は構文的禁止の設計範囲外として既知の受容済み残存限界に記録。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/ui-domain-canonicalize.test.ts tests/ui-domain-contract.test.ts tests/ui-domain-rulepack.test.ts tests/ui-domain-profile.test.ts tests/coding-rules.test.ts tests/review-evidence.test.ts tests/design-language.test.ts tests/vmodel-pair.test.ts tests/design-coverage.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T02:45:36Z", evidence_path: tests/ui-domain-canonicalize.test.ts, output_digest: "sha256:2044253f8abc700f3e630718a0f3f250439592b71bcc0e18bc26f5ba40a48e4f", result: "review是正後worktree: 9 files / 127 tests green（U-UDP-001〜004 oracle と設計 doc gate 群を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T02:45:36Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T02:45:36Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T02:45:36Z"
    evidence_digest: "sha256:910387bd7dbb4338fa1bca326ed35098bd3eaf56849b7bc5e95e96e6c91d718d"
  entries: []
---

# PLAN-L7-520: UI Domain・Pattern Profile 純関数群の実装

## 目的（Issue #209 第1スライス）

L6設計 §1 の pure API 4 本（`canonicalizeUiDomain` / `validatePatternContract` /
`guardRulePackIsolation` / `validateUiProfile`）を TDD で実装する。本 PR には #209
設計フェーズの正本 doc 6 本（L4/L5/L6 設計・pair テスト設計、3 ラウンド intra-runtime
設計レビュー approve 済み）と catalog 登録・digest 再束縛・L8 実行正本を同乗させる
（#177 と同じ統合 PR 方式）。

## §3 工程表

### Step 1: L6 §0-§2 突き合わせとred oracle作成 [直列]

根拠: downstream_dependency（型・prefix 規約・隔離規則の確定が実装の前提）。

### Step 2: pure evaluator 群実装 → green [直列]

根拠: file_conflict（同一module `src/design/ui-domain-pattern-profile.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。
request changes → 是正 → approve の各ラウンドを review_evidence へ記録する。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #209 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L6設計 §0（型）・§1（DbC）・§2（schema）、L5 §1（prefix 規約・住み分け）・§2
（隔離規則）、L8テスト設計スライス1表。sha256 canonical digest・typed failure・fail-close
集約は #177 slice1 と同 idiom。class/path/DOM 主キー判定は「/ または . を含む」「#/./[ 開始
または > を含む」「CamelCase 開始」の機械判定とする。

## 後続スライス（本PLAN非対象）

- pairwise selector（U-UDP-005、seeded-pairwise アルゴリズム）
- registry consumer 接続（#177 の commit 経路への consumer trace 登録）と CLI 表面
- L9 system assertion（SA-UDP-01〜03、実 L2 正本 end-to-end）
