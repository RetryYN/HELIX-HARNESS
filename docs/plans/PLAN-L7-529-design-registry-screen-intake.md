---
plan_id: PLAN-L7-529-design-registry-screen-intake
title: "PLAN-L7-529 (add-impl): Design Registry SCR intake（U-DRG-012）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#177 Design Registryを進める（slice6 = slice4 の申し送り第2項）"
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 177
engineering_discipline_required: true
behavior_contract_id: U-DRG-012
responsibility_owner: design-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "slice1〜5 が着地済みであること。L5 §1 が『screen ノードは screens/screen_trace を正本供給源として吸収し、別の screen 台帳を新設しない』と定めた供給源境界を実装で満たす"
contract_postconditions: "buildScreenIntake が台帳 screen_id を SCR-<小文字化> へ決定的に採番し、元 ID を source_pointer（screens:<screen_id>）へ保持した authority=shadow の screen ノードを返す。登録済み requirement family の trace だけが decomposes_to edge となり、未登録 family は unmapped_requirements へ全件列挙され trace_intake_complete=false を宣言する。loadScreenIntakeInputs は既存台帳のみを読み registry 側 table へ write しない"
contract_invariants: "registry の ID 空間に requirement を捏造しない（未登録 family へ edge を張らない）。重複判定は正準化後の値（entity_id / edge_id）で行い、採番が畳む差異を判定側が見落とさない。trace は silent drop しない（trace_edges + unmapped_requirements が入力 trace 総数に一致する）。trace_intake_complete と assertScreenIntakeComplete の判定は常に一致し、片方だけ green になる経路を作らない。intake は read-only であり複製台帳を新設しない。同義入力（順序違い）は同一 intake_digest"
contract_failures: "重複 screen_id（正準化後の entity_id で判定するため大文字小文字違いの衝突も含む）=DRG_DUPLICATE_ID、同一 (requirement, screen) 対の trace 二重登録による edge_id 衝突=DRG_DUPLICATE_ID、台帳列の型乖離=読み取り時 throw、正準化不能 screen_id=DRG_ID_INVALID、台帳に無い screen を指す trace=DRG_EDGE_ORPHAN、空台帳=DRG_STALE_INPUT、未完了 intake の完了扱い=assertScreenIntakeComplete が unmapped 全件を DRG_ID_INVALID で返す"
tdd_red_required: true
red_at: "2026-08-08T15:40:05Z"
green_at: "2026-08-08T15:41:25Z"
mutation_oracle_evidence: "tests/design-registry-screen-intake.test.ts が L8テスト設計スライス6表の反例を機械検査する。ID 採番・source_pointer 保持・捏造防止（未登録 family への edge 生成）・全件列挙・silent drop 防止・complete 判定の一致・read-only 性のいずれを外す mutation も該当 fixture が red で kill する。U-DRG-012c は実 harness.db に対する reality fence（件数は pin せず構造不変条件のみ。台帳が無い / 空の環境は skip として可視化し、検査せず green になる経路を作らない）。edge_id 重複 guard・entity_id 重複 guard・reader の shape check の 3 mutation はいずれも exit 非 0 で kill を実測済み"
complexity_effect: justified_positive
complexity_justification: "#177 の第6スライス。pure builder 1 本・gate 1 本・read-only reader 1 本と oracle test 1 本のみを追加し、既存台帳を供給源として再利用する（新規 table・新規 ID 空間を作らない）"
removal_trigger: "screens/screen_trace 台帳が後継の Canonical Design IR intake（#257）へ置換された時"
parent_design: docs/design/helix/L6-function-design/design-registry.md
pair_artifact: docs/test-design/helix/L8-design-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-012, test_path: tests/design-registry-screen-intake.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-012b, test_path: tests/design-registry-screen-intake.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-012c, test_path: tests/design-registry-screen-intake.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #177 slice分割（SCR intake を第6スライスに）" }
  - { role: se, slot_label: "SE — buildScreenIntake / assertScreenIntakeComplete / reader 実装" }
  - { role: qa, slot_label: "QA — U-DRG-012 / 012b / 012c oracle" }
  - { role: tl, slot_label: "TL — 未登録 requirement family の扱い（捏造禁止と scope 境界）" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-529-design-registry-screen-intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/design-registry-screen-intake.ts, artifact_type: source_module }
  - { artifact_path: src/design/design-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/design-registry-screen-intake.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/plans/PLAN-L7-528-design-registry-authority-transition.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T01:00:00Z"
    tests_green_at: "2026-08-09T01:00:00Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Critical 0・Important 3・Minor 2、いずれもprobe実証）。Important-1=同一(requirement, screen)対のtraceが2行あるとedge_idが重複した配列をok:trueかつtrace_intake_complete:trueで返す（silent-green）。trace_edges+unmapped==traces総数という不変条件は表面上成立するためsilent drop検査では捕捉できない。Important-2=重複検出が生のscreen_idキーだったため、採番が畳む大文字小文字差（PM-01 / pm-01）が同一SCR-pm-01を2件生成する。Important-3=U-DRG-012cの実repo fenceが生のreturnでearly exitし「検査したgreen」と区別できない。Minor 2件=readerの二重型キャスト（schema乖離をsilent化）、assertScreenIntakeCompleteの二重条件の意図不明瞭。是正: (1) seenEdgeIdsでedge_id衝突をDRG_DUPLICATE_IDへfail-close（「validatorへ通す運用が徹底されている限り安全」という暗黙の前提に寄りかからない旨をコメント明記）、(2) 重複検出を正準化後のentity_idベースへ統一、(3) ctx.skip(理由)へ置換しreporter上でskipとして可視化、(4) requireTextによるruntime shape checkを導入し列の欠落・型違いをthrowで顕在化、(5) 二重条件の防御意図をコメント化。2回目approve（Critical/Important/Minor全て0）。reviewerは3 mutation（edge_id重複guard・entity_id重複guard・reader shape check）をいずれもexit非0でkill追試し、round1で実証した2バグのprobeを再実行してok:false + DRG_DUPLICATE_IDへ転換したことを実測、さらに.helix/harness.dbを一時退避してctx.skipが「2 passed | 1 skipped」としてreporterに現れることを確認した。claim（L8スライス6表・PLAN 3フィールド）は過大も過小もないと判定された。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/design-registry-screen-intake.test.ts tests/design-registry-authority-transition.test.ts tests/design-registry-graph.test.ts tests/design-registry-canonicalize.test.ts tests/design-registry-store-sqlite.test.ts tests/state-db.test.ts tests/digest.test.ts tests/coding-rules.test.ts tests/design-language.test.ts tests/vmodel-pair.test.ts tests/design-coverage.test.ts tests/review-evidence.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T01:00:00Z", evidence_path: tests/design-registry-screen-intake.test.ts, output_digest: "sha256:68e04fb6d9657ff44122e39c40d578e747d7ad1c3ccb3c00500e4f50488b8fdf", result: "review是正後worktree: 12 files / 154 tests green（U-DRG-012 / 012b / 012c と registry 既存 suite・digest inventory・coding-rules・design-language・vmodel-pair を含む）" }
      - { kind: lint, command: "npx biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T01:00:00Z", evidence_path: biome.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（error 0、純増 0）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T01:00:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-09T01:00:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-09T01:00:00Z"
    evidence_digest: "sha256:b7ed8a9877543841f462c6361cd5fae5e33248c182606d7420a619b5bfc400a4"
  entries: []
---

# PLAN-L7-529: Design Registry の SCR intake（既存台帳からの screen ノード吸収）

## 目的（Issue #177 第6スライス）

L5 §1 は「screen ノードは `screens`/`screen_trace` を正本供給源として吸収し、別の screen 台帳を
新設しない」と定めていたが、実装は未着地だった。slice4 の申し送り第2項の解消。

## 実装で判明した設計上の食い違い（重要）

実 `screen_trace`（85 行）の requirement_id は `BR-01` / `FR-L1-01` / `UX-02` であり、
registry の requirement ID family（`HIL-(BR|FR|NFR)-*` / `VDH-FR-*` / `HR-FR-DHR-*`）と
**1 件も一致しない**。

L5 §1 は「screen ノードを吸収する」とだけ書いており、trace 先の requirement をどう扱うかを
定めていなかった。ここで edge を張るには requirement ノードを registry の ID 空間へ**捏造**する
必要があり、それは VDH-FR-003（semantic ID 原則）と「path/class 名だけの trace を fail-close する」
方針に反する。

したがって本スライスは:

- screen ノードの intake は実施する（15 screen すべてが `SCR-*` へ写る）
- 未登録 family への edge は**作らない**。`unmapped_requirements` へ**全件列挙**し
  `trace_intake_complete=false` を宣言する
- 未完了 intake を完了として扱わせない gate（`assertScreenIntakeComplete`）を用意する
- family の対応付け方針は Design Registry 単独では決められない（要求 ID 空間の authority に属する）
  ため、本 PLAN の非対象として Issue #177 へ申し送る

## §3 工程表

### Step 1: 実台帳の形の確認と red oracle 作成 [直列]

根拠: downstream_dependency（実データの形が intake 契約を決める）。

### Step 2: pure builder + gate + reader 実装 → green [直列]

根拠: downstream_dependency（契約確定後の実装）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #177 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: `src/schema/harness-db-tables-evaluation.ts` の `screens` / `screen_trace`、
`src/design/design-registry.ts` の `REQUIREMENT_ID_PATTERNS`（family の単一正本）。
family 判定は既存 pattern を `isRegistryRequirementId` として export して共有し、二重定義を作らない。

## 後続スライス（本PLAN非対象）

- public command（permission 不要）の RegistryPolicyV1 例外判断
- `screen_trace` 未登録 requirement family（BR / FR-L1 / UX）の registry ID 空間への写像方針
