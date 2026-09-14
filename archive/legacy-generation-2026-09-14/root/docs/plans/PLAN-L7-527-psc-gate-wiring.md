---
plan_id: PLAN-L7-527-psc-gate-wiring
title: "PLAN-L7-527 (add-impl): semantic contract 層 — gate 配線（U-PSC-006 / SA-PSC-03 実 gate 面）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#230 Python意味コアとNode transaction境界を進める（slice5）"
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 230
engineering_discipline_required: true
behavior_contract_id: U-PSC-006
responsibility_owner: semantic-contract-revalidator
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "PLAN-L7-524/525/526 confirmed（pure 関数群と store が着地済み）であること、L4 §2 分離原則と L6 §5 の gate 契約を正本とする。本スライスは静的検査 gate の配線のみを実装し、実 doc・実 sidecar を通す end-to-end 検証（SA-PSC-01/02/04）は L9 の責務とする"
contract_postconditions: "analyzeSemanticBoundary が ADR-010 境界の 3 不変条件（Python 非露出 / semantic table の単一 writer / IMMUTABLE 登録）を実 repo source から検査し、doctor が semantic-boundary check として集約して違反時に fail-close する"
contract_invariants: "検査は文字列リテラルを保持する tokenizer でコメントのみを除去したコード本体を走査し、設計意図を説明する散文やコメントアウトされた SQL を違反として誤検出しない。実 repo に対して違反 0 を regression fence として固定する。**保証範囲は best-effort**: 識別子のスコープ解決を行わないため、分割代入・object property・配列要素・エイリアシング・let 再代入経由で table 名を運ぶ迂回は検出できない。誤検出回避のため識別子追跡は SQL キーワード行に限定する。決定的保証は L9 実 gate assertion に委ねる"
contract_failures: "src/semantic からの DB path / credential / repository write（fs 書込・git 実行）/ process 起動（child_process・spawn 系）/ .helix/ 到達=python-exposure、semantic_result_* への write（リテラル SQL に加え動的テーブル名・ORM 風呼び出しも距離非依存の識別子追跡で捕捉（宣言と使用の行間距離に依存しない。ただしスコープ解決は行わず、同名変数の偶発一致による誤検出を避けるため識別子追跡は SQL キーワード行に限定する））を持つ src/semantic/semantic-commit-store.ts 以外の source=single-writer、IMMUTABLE_RECEIPT_TABLES 未登録の semantic table=immutable-registration。違反は種別ごとに全列挙し doctor を fail-close させる"
tdd_red_required: true
red_at: "2026-08-08T12:33:17Z"
green_at: "2026-08-08T12:35:39Z"
mutation_oracle_evidence: "tests/semantic-boundary.test.ts が L8テスト設計スライス5表（U-PSC-006）を機械検査する。3 不変条件それぞれの違反 fixture（db-path / credential / repository write / process 起動 / .helix 到達の 5 反例、rogue writer とテンプレートリテラル・文字列連結・ORM 風の動的 3 反例と宣言〜使用の行間 gap 0/2/5/10 の 4 反例、IMMUTABLE 登録漏れ）と誤検出の非退行（table 名列挙のみの登録簿、および無関係な同名変数の偶発一致）・文字列中の `//` が同一行の違反を隠さないことと複数種別の同時違反の全列挙、および実 repo 入力へ違反を注入すると必ず落ちること（fence が検出力ゼロでない実証）・実 repo に対する違反 0・doctor 経由の同判定のいずれを外す mutation も red で kill する"
complexity_effect: justified_positive
complexity_justification: "#230 の第5スライス。lint 関数 1 本と doctor check 1 本、oracle test 1 本のみ"
removal_trigger: "L6設計 semantic-contract-revalidator §5 がsupersedeされ、後継設計へ置換された時"
parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md
pair_artifact: docs/test-design/helix/L8-semantic-contract-revalidator-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md, oracle_id: U-PSC-006, test_path: tests/semantic-boundary.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — SA-PSC-03 のうち静的検査で機械化できる範囲の切り出し" }
  - { role: se, slot_label: "SE — analyzeSemanticBoundary と doctor 配線" }
  - { role: qa, slot_label: "QA — U-PSC-006 mutation oracle（3 不変条件 + 実 repo fence）" }
  - { role: tl, slot_label: "TL — 誤検出（散文・コメント）と検出漏れの境界レビュー" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-527-psc-gate-wiring.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/semantic-contract-revalidator.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-semantic-contract-revalidator-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/semantic-boundary.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/semantic-boundary.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L4-53-python-semantic-core-node-boundary.md
  requires:
    - docs/plans/PLAN-L7-524-psc-semantic-contract.md
    - docs/plans/PLAN-L7-525-psc-transaction-consumer.md
    - docs/plans/PLAN-L7-526-psc-intake-receipt.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T13:17:00Z"
    tests_green_at: "2026-08-08T13:17:00Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして4ラウンドでレビューした。1回目request changes（Important 3件をprobe実証: (1) ADR-010決定2の4分類のうちrepository write（git実行・fs書込）が丸ごと欠落しspawn経由のenv転送も検出不能、(2) 単一writer検査が動的テーブル名（template literal/文字列連結/ORM風）で自明にバイパス、(3) stripCommentsの行ベース正規表現が文字列中の`//`以降を巻き添えに削り同一行の実違反を隠す false negative）。是正としてrepository-write/process-spawnパターン追加、近接検査追加（実装中に先頭\bが`).insert(`を取りこぼすword-boundaryバグを自前probeで発見し修正）、文字列リテラルを保持するtokenizerへ置換。2回目request changes（Important 1件: 3行窓がgap≧2で破れる）→ 距離非依存の識別子追跡へ作り替え。3回目request changes（Important 2件: (1) 識別子名衝突による false positive でCIを止めるリスク、(2) 分割代入・property・配列要素・エイリアシング・let再代入は依然検出漏れでregex対症療法が限界）。是正として識別子追跡をSQLキーワード行へ限定して誤検出を解消し、reviewerの推奨に従いregex追加を打ち切って「best-effort静的検査でスコープ解決を行わない。決定的保証はL9実gate assertion」という限界をmodule doc/L6 §5/PLAN/L8の4箇所へ明記した。4回目approve（Critical/Important/Minor全て0）。reviewerは限界記述と実装の一致（広くも狭くもない）、round1〜2で塞いだ真の違反の非退行（動的5パターン全件捕捉・gap 0/2/5/10 green）、否定的claimは開示・肯定的claimは恒久testで裏付けというclaim discipline整合を確認した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/semantic-boundary.test.ts tests/doctor.test.ts tests/coding-rules.test.ts tests/design-language.test.ts tests/l12-hybrid-recognition.test.ts tests/digest.test.ts tests/vmodel-pair.test.ts tests/ddd-tdd-rules.test.ts tests/design-coverage.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T13:17:00Z", evidence_path: tests/semantic-boundary.test.ts, output_digest: "sha256:f4def86ccf80a71fea73a93e7988c48c43ba6acd25be0fdbdee35548ad18f2c5", result: "review是正後worktree: 9 files / 182 tests green（U-PSC-006 oracle・5露出反例・動的3反例・gap 0/2/5/10・誤検出非退行・実repo fence を含む）" }
      - { kind: lint, command: "npx biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T13:17:00Z", evidence_path: biome.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（error 0、既存 warning 17・純増 0）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T13:17:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T13:17:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-08T13:17:00Z"
    evidence_digest: "sha256:21c635b149140bb136a7e0028c3d21088c5d0e9cc171a145c7a719edab55c656"
  entries: []
---

# PLAN-L7-527: semantic contract 層 — gate 配線の実装

## 目的（Issue #230 第5スライス）

SA-PSC-03 のうち静的検査で機械化できる範囲を doctor の 1 check として配線する。
pure 関数群が正しくても配線 drift（Python への DB 露出・別 writer の追加・IMMUTABLE 登録漏れ）で
ADR-010 境界は崩れうるため、実 repo に対する regression fence を持つ。

## §3 工程表

### Step 1: L6 §5 契約追記と red oracle 作成 [直列]

根拠: downstream_dependency（検査対象の不変条件確定が実装の前提）。

### Step 2: analyzeSemanticBoundary + doctor 配線 → green [直列]

根拠: file_conflict（`src/doctor/index.ts` の集約点への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #230 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L4 §2 分離原則、L6 §5。検査はコメント除去後のコード本体のみを走査し、
設計意図の散文（`harness.db` への言及等）を誤検出しない。実 repo の違反 0 を
regression fence としてテストで固定する。

## SA-PSC-03 のうち本スライス非対象

- 実 gate 経路での source / sidecar / schema / HEAD / digest drift 検出（実 doc を通す L9）
- browser evidence 偽装の検出（browser 実行系の実装が前提、L4 §5 で非 scope）
- 別 authoring DB の実 runtime 検出（本スライスは静的登録検査まで）

## 後続（本PLAN非対象）

- Python 意味コア骨格（L5 §0 の supply-chain freeze / HDS-HIL-14 着地後）
- L9 SA-PSC-01〜04（実 doc・実 spawn・実 gate・実 inventory の end-to-end）
