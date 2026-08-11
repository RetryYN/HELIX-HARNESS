---
plan_id: PLAN-L7-537-catalog-intake
title: "PLAN-L7-537 (add-impl): requirement catalog を screen intake へ注入し edge 採用条件を実在性へ切り替える（U-DRG-014）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-10 進めて（#177 L4 以降 第 2 スライス）"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 177
engineering_discipline_required: true
behavior_contract_id: HR-FR-DHR-008
responsibility_owner: design-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L7-536 が versioned requirement catalog を供給済み。buildScreenIntake は registry family（HIL / VDH / HR-FR-DHR）一致だけを edge 採用条件としており、実 screen_trace 85 行が全件 unmapped で registry table は live row 0 件"
contract_postconditions: "ScreenIntakeInputV1 が catalog を必須で受け取り、edge 採用条件が『既存 registry family、または catalog 実在かつ requirement_kind exact match』へ切り替わる。intake_digest が catalog_version / source_digest に依存し、loadScreenIntakeInputs が台帳と catalog の両方を read-only で読む唯一の I/O 境界になる"
contract_invariants: "既存 registry family の採用経路と挙動を変えない（catalog を経由せず従来どおり通す後方互換）。buildScreenIntake は pure のままで file I/O も Markdown 解釈も持たない。trace_edges と unmapped_requirements の合計は入力 trace 数に一致する（silent drop を作らない）。unmapped は失敗ではなく trace_intake_complete=false として判断を上へ返す"
contract_failures: "空 catalog を『全件不存在』として ok:true で成立させる経路（catalog を空にするだけで fail-close を装える）、provenance 欠落 catalog を受理して digest 束縛を無意味にする経路、実在 ID を借りて別 kind を名乗る kind spoofing を実在不在と同じ reason へ潰す経路、catalog を optional にして未注入呼び出しが静かに成立する経路を、DRG_STALE_INPUT と reason 分離（requirement_not_in_catalog / requirement_kind_mismatch）で塞ぐ"
tdd_red_required: true
red_at: "2026-08-10T04:05:00Z"
green_at: "2026-08-10T04:09:00Z"
mutation_oracle_evidence: "tests/design-registry-catalog-intake.test.ts が L8 の U-DRG-014 / 014b〜014e を機械検査する。6 mutation をいずれも exit 非 0 で kill することを実測（6/6）。locator と改変内容（すべて src/design/design-registry-screen-intake.ts）: (1) if (input.catalog.entries.length === 0) → if (false)（空 catalog を許容）、(2) provenance 検査 if (!isNonEmpty(catalog_version) || !isNonEmpty(source_digest)) → if (false)、(3) if (catalogKind !== trace.requirement_kind) → if (false)（kind spoofing を通す）、(4) if (catalogKind === undefined) → if (false)（catalog 不在を通す。2 oracle が red）、(5) intake_digest から catalog_source_digest / catalog_version の 2 行を削除（provenance 束縛を外す）、(6) if (!isRegistryRequirementId(...)) → if (true)（既存 family bypass を外す。2 oracle が red）。各 mutation 後に restored して 8/8 green を確認済み"
complexity_effect: justified_positive
complexity_justification: "既存 module の入力型に 1 フィールドと分岐 2 つを足すのみで、新規 module も schema も dependency も増やさない。catalog 構築は PLAN-L7-536 の既存 pure 関数を呼ぶだけ"
removal_trigger: "#257 Canonical Design IR が同等の requirement 供給を担い、screens / screen_trace adapter と Markdown catalog loader の consumer が 0 になった時点"
parent_design: docs/design/helix/L6-function-design/design-registry.md
pair_artifact: docs/test-design/helix/L8-design-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-014, test_path: tests/design-registry-catalog-intake.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #177 L4 以降の slice 分割（採用条件切替を第 2 スライスに）" }
  - { role: se, slot_label: "SE — catalog 明示注入と reason 分離の実装" }
  - { role: qa, slot_label: "QA — 空 catalog による偽 fail-close と kind spoofing の 2 経路を oracle で塞ぐ" }
  - { role: tl, slot_label: "TL — catalog を必須にする判断（optional との比較）と後方互換境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-537-catalog-intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/design-registry-screen-intake.ts, artifact_type: source_module }
  - { artifact_path: tests/design-registry-catalog-intake.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-536-requirement-catalog.md
  requires:
    - docs/plans/PLAN-L7-536-requirement-catalog.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-10T04:35:00Z"
    tests_green_at: "2026-08-10T04:33:00Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLI は #514 対称化（PR #520）の merge 直後で稼働中のため、規定代替の intra_runtime_subagent（claude-sonnet-5, read-only）が実施した。verdict=request_changes（Critical 1 / Important 1）→ 是正済み。**Critical**: left_arm_carry.review_binding.evidence_digest が sha256 形式でない placeholder のまま status=confirmed になっており、plan lint --gate frontmatter が invalid_frontmatter で fail することを reviewer が実コマンドで再現した（PLAN-L7-536 と同じ落とし穴を連続で踏んだ）。是正: 本レビュー確定後に computeCarryReviewSemanticDigest の実測値を束縛した。**Important**: src/design/design-registry-screen-intake.ts の module 先頭コメントが catalog 導入前の『BR/FR-L1/UX は edge を作らず全件 unmapped』という旧記述のままで、新 §9.1 の実挙動（catalog 実在なら edge 化）と矛盾していた。CLAUDE.md の development residue 禁止に抵触するため全面書き換えた。**reviewer による独立検証**: 後方互換 claim（既存 registry family の挙動不変）をコードパスで確認し、変更が L1 family の採用経路の追加に限定されていること、trace_edges + unmapped == traces が catalog 導入後も成立し silent drop 経路が無いことを確認した。実台帳を自分で走らせ edge 83 / unmapped 2 を再現し、BR-20 が business-requirements.md に定義行を持たないことを grep で独立確認した。既存 U-DRG-012 の期待値変更が『テストを都合よく緩めた』ものではなく、捏造防止の担保が U-DRG-014b（catalog に無い ID は edge にならない）へ移されていることも確認した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/design-registry-catalog-intake.test.ts tests/design-registry-screen-intake.test.ts tests/requirement-catalog.test.ts tests/design-coverage.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-10T04:33:00Z", evidence_path: tests/design-registry-catalog-intake.test.ts, output_digest: "sha256:0b21605b3c27040984d63889b47ec5f21fd88d64ac52d1e2f0061c5393cc73a3", result: "4 files green" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T04:33:00Z", evidence_path: docs/plans/PLAN-L7-537-catalog-intake.md, output_digest: "sha256:a5aad05d7120a4b9534d5e34a192b03d4a6df5fdc3e11ae2d990320555265e4c", result: "5 gate すべて OK" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T04:33:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-10T04:35:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-10T04:35:00Z"
    evidence_digest: "sha256:31150576c0cdbafd21bab2e7841a2a34b7fc2d5befbb58db2bf3503bcfa87710"
  entries: []
---

# PLAN-L7-537: catalog 注入による edge 採用条件の切替

## §1 目的

PLAN-L7-536 が供給する versioned requirement catalog を `buildScreenIntake` へ明示注入し、
edge 採用条件を「registry family 一致」から「**既存 registry family、または catalog 実在かつ
kind exact match**」へ切り替える。これにより実 `screen_trace` の L1 family trace が
捏造なしで edge 化され、registry の live row が 0 件から動く。

## §2 設計判断

### §2.1 catalog は optional にせず必須にする

optional にすると未注入の呼び出しが「catalog に無いので全件 unmapped」として**静かに成立**する。
これは供給欠落と実在不在の混同であり、L3 §3 が塞ぐと宣言した「誤って green になる経路」に当たる。
既存 12 箇所の呼び出しは明示的に catalog を渡すよう更新した。

### §2.2 空 catalog と provenance 欠落は intake ごと失敗させる

同じ理由で、空 catalog（`entries.length === 0`）と provenance 欠落（`catalog_version` /
`source_digest` が空）は `DRG_STALE_INPUT` で失敗させる。unmapped 列挙として返すと、
catalog を空にするだけで fail-close を装えてしまう。

### §2.3 kind 不一致を実在不在と別 reason にする

実在 ID を借りて別 kind を名乗る経路（kind spoofing）は存在確認だけでは通る。
`requirement_not_in_catalog` と `requirement_kind_mismatch` を分けることで、
「登録漏れ」と「参照側の誤り」を下流が区別できる。

### §2.4 既存 registry family は catalog を経由しない

`HIL-*` / `VDH-FR-*` / `HR-FR-DHR-*` は従来どおり `isRegistryRequirementId` で採用する。
本スライスは L1 family の採用経路を**足す**だけで、既存挙動を変えない。

## §3 工程表

### Step 1: red（U-DRG-014 / 014b〜014e を先に書く）[直列]

根拠: downstream_dependency（TDD 規律。5 oracle が red であることを実測してから実装する）。

### Step 2: green（catalog 注入と reason 分離の実装）[直列]

根拠: downstream_dependency（oracle 定義後にのみ実装を当てる）。

### Step 3: 既存 oracle の追随 [直列]

根拠: shared_state（`U-DRG-012` 系は同一 module の挙動を固定しており、採用条件の変更で期待値が動く）。

### Step 4: 実台帳に対する適用実測 [直列]

根拠: downstream_dependency（fixture だけでは実 85 行に対する挙動が分からない）。

### Step 5: mutation 追試 [直列]

根拠: downstream_dependency（green だけでは oracle が load-bearing か判定できない）。

### Step 6: 設計文書・テスト設計への反映と review [並列]

根拠: parallel（L5 §9 / L6 §5 / L8 oracle 表は同一判断から同時に導ける）。

## §3.1 実装計画

`src/design/design-registry-screen-intake.ts` に catalog 引数・照合分岐 2 つ・digest 束縛・
供給欠落の fail-close を追加する。`loadScreenIntakeInputs` は `repoRoot` を受け取り、
台帳と catalog の両方を read-only で読む。catalog 構築失敗は throw で顕在化させる。

## §4 実台帳に対する適用実測（2026-08-10）

catalog 63 件を実 `screen_trace` 85 行へ適用した結果:

| 指標 | 値 |
|---|---|
| screens | 15 |
| traces | 85 |
| trace_edges | **83** |
| unmapped | **2** |
| trace_intake_complete（全 trace 成立フラグ） | false |

registry の live row は 0 件から 15 node + 83 edge へ動く。残る 2 件は捏造せず列挙する。

| requirement_id | screen | reason | 扱い |
|---|---|---|---|
| `BR-20` | HM-04 | `requirement_not_in_catalog` | **L1 に定義行が無いまま 4 箇所から参照されている**。Issue #530 として起票し L1 owner 判断へ回した |
| `BR-21` | HM-08 | `requirement_not_in_catalog` | §11 の属性テーブル形式で定義行の形を持たない（PLAN-L7-536 §3 の既知の限界） |

`BR-20` は gate の誤検知ではなく、**参照だけがあって定義が無い実在の欠陥**を fail-close が
表面化させたもの。捏造しない設計が意図どおり働いた結果である。

## §5 本 PLAN の非対象

- registry graph の requirement 端点実在検査（HR-FR-DHR-011）。次スライスで起票する。
- 恒久 family 認識と暫定 loader の lifecycle 分離宣言（HR-FR-DHR-012）。
- `BR-20` の定義復元または参照是正（Issue #530。L1 は人間 authority）。
- `BR-21` を定義行形式へ揃える是正（別 slice）。

## §6 残リスク

- `trace_intake_complete` は `BR-20` / `BR-21` が解決するまで false のまま。85 行中 83 行は成立
  するため #209 の L9（SA-UDP-01〜03 が要求する 15 SCR ノード）はブロックしない。
- catalog が 63 件（BR 9 / UX 3 / FR-L1 51）であることに依存する oracle は置いていない
  （件数は正本更新で動くため）。件数固定ではなく実在性と kind 一致だけを検査している。
