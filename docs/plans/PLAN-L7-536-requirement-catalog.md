---
plan_id: PLAN-L7-536-requirement-catalog
title: "PLAN-L7-536 (add-impl): L1 要求正本からの versioned requirement catalog（U-DRC-001〜006）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-10 デザインハーネスを進めろ（#177 の L3 承認取得後、L4 以降の第 1 スライス）"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 177
engineering_discipline_required: true
behavior_contract_id: HR-FR-DHR-007
responsibility_owner: design-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "L3 design-registry-requirement-family-authority.md が PO 承認により confirmed（2026-08-10）。実 screen_trace 85 行の requirement_id（BR-01 / FR-L1-01 / UX-02）は registry の REQUIREMENT_ID_PATTERNS と 1 件も一致せず全件 unmapped で、registry table は live row 0 件。L1 正本から実在 ID を構造的に取り出す供給源が存在しない"
contract_postconditions: "src/design/requirement-catalog.ts が L1 正本（business-requirements.md §1.2 / functional-requirements.md §1）の定義表から { requirement_id, requirement_kind, source_pointer } を抽出し、catalog_version と source_digest を伴う versioned catalog を pure に返す。file I/O は loadRequirementCatalogSources のみに隔離する"
contract_invariants: "regex を広げて family を通す実装にしない（L1 に存在しない BR-99 が有効 edge 端点になり trace を捏造できる）。採用条件は family 一致ではなく定義行の実在。buildRequirementCatalog は pure で Markdown 解釈を intake module へ持ち込まない。既存の REQUIREMENT_ID_PATTERNS / isRegistryRequirementId / buildScreenIntake の挙動を変えない（本スライスは供給源の新設のみ）"
contract_failures: "parser が黙って空集合を返し『catalog に無い＝全件不存在』として偽の fail-close を装う経路、本文中の言及を定義行として過剰受理して架空 ID を実在にする経路、参照表（functional §1.2 carry note）を定義表と誤認して偽の重複を出す経路、片方の doc だけ抽出 0 件でも全体が非空なら通る経路を、DRC_SOURCE_EMPTY / DRC_SECTION_MISSING / DRC_EMPTY_EXTRACTION（doc 単位判定）/ DRC_DUPLICATE_ID / DRC_ID_NONCANONICAL の 5 code で塞ぐ"
tdd_red_required: true
red_at: "2026-08-10T02:47:47Z"
green_at: "2026-08-10T02:50:57Z"
mutation_oracle_evidence: "tests/requirement-catalog.test.ts が L8 の U-DRC-001〜006 を機械検査する。7 mutation をいずれも exit 非 0 で kill することを実測（7/7）。locator と改変内容: (1) src/design/requirement-catalog.ts の functional 規則 section_end を /^###?\\s/mu → /^##\\s/mu（carry note 表を取り込む）、(2) DEFINITION_ROW を /^\\|\\s*\\*\\*([A-Z][A-Z0-9-]*)\\*\\*\\s*\\|/u → /\\b([A-Z][A-Z0-9-]*-\\d+)\\b/u（強調要求を外し本文言及を過剰受理）、(3) buildRequirementCatalog の if (extracted === 0) → if (false)（doc 単位の抽出 0 件検査を無効化）、(4) definitionSection の return null → return \"\"（section 欠落を空集合で吸収）、(5) if (seen.has(rawId)) → if (false)（重複を silent に畳む）、(6) if (!CANONICAL_BY_KIND[kind].test(rawId)) → if (false)（BR-9 を通す）、(7) kindOf の rawId.startsWith(prefix) → rawId.startsWith(prefix.slice(0, 2))（prefix 判定を緩め FR-99 を fr と誤認）。各 mutation 後に restored して 6/6 green を確認済み。**(3) と (7) は初回追試で生存した**: (3) は全体の entries.length === 0 ガードが同じ code を返すため単一 doc fixture では区別できず、片方の doc だけ抽出 0 件で他方が非空という反例を U-DRC-004 へ追加して kill した。(7) は review 是正で prefix 表を単一化した際に生まれた面で、未知 family（FR-99）が非正準ではなく無視であることを固定する反例を U-DRC-005 へ追加して kill した。いずれも『全部 kill』と報告せず生存を記録して塞いだ"
complexity_effect: justified_positive
complexity_justification: "#177 L4 以降の第 1 スライス。新規 pure module 1 本のみで、既存 module の signature も挙動も変えない。Markdown 解釈を 1 箇所へ閉じることで、後続スライス（intake 注入）が I/O を持たずに済む"
removal_trigger: "#257 Canonical Design IR が同等の requirement catalog を供給し、Markdown loader の consumer が 0 になった時点（L3 §2.1 の『置換可能』区分。恒久側の family 認識とは lifecycle が異なる）"
parent_design: docs/design/helix/L6-function-design/design-registry.md
pair_artifact: docs/test-design/helix/L8-design-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRC-001, test_path: tests/requirement-catalog.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRC-002, test_path: tests/requirement-catalog.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRC-003, test_path: tests/requirement-catalog.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRC-004, test_path: tests/requirement-catalog.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRC-005, test_path: tests/requirement-catalog.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRC-006, test_path: tests/requirement-catalog.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #177 L4 以降の slice 分割（catalog 供給源を第 1 スライスに）" }
  - { role: se, slot_label: "SE — pure な catalog builder と I/O 境界の分離" }
  - { role: qa, slot_label: "QA — 偽 fail-close・過剰受理・参照表誤認の 3 経路を oracle で塞ぐ" }
  - { role: tl, slot_label: "TL — 定義表 section を明示宣言する方式の妥当性（doc 全体走査との比較）" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-536-requirement-catalog.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/requirement-catalog.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-catalog.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-30-design-registry-requirement-family-authority.md
  requires:
    - docs/plans/PLAN-L7-530-design-registry-public-command.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-10T03:12:00Z"
    tests_green_at: "2026-08-10T03:10:00Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLI は #514 対称化対応で稼働中のため、規定代替の intra_runtime_subagent（claude-sonnet-5, read-only）が実施した。verdict=approve（Critical 0 / Important 1 / Minor 2）。**Important**: left_arm_carry.review_binding.evidence_digest が 64 桁オールゼロのプレースホルダのまま status=confirmed になっており、実体のない自己申告レビューを confirmed の裏付けに使っている（PLAN claim discipline 抵触）。是正: 本レビュー完了後に実 digest を算出して束縛した。**Minor-1**: mutation_oracle_evidence が 6 件を prose で説明するのみで file:line locator を欠き、独立検証者が改変内容を推測で復元する必要があった。是正: 7 件すべてに locator と改変前後を明記した。**Minor-2**: kindOf と looksLikeKind が prefix 判定を二重に持ち、family 追加時に片方だけ更新すると非正準検査が抜ける。是正: PREFIX_BY_KIND の単一表へ統合し looksLikeKind を削除した。**是正で生まれた面を自己追試して生存を発見**: prefix 表統合後に startsWith(prefix) を startsWith(prefix.slice(0,2)) へ緩める mutation が生存した（未知 family FR-99 が fr と誤認され「無視」ではなく DRC_ID_NONCANONICAL になる差が oracle に無かった）。U-DRC-005 へ反例を追加して kill し、mutation 実測を 6/6 から 7/7 へ更新した。**reviewer による独立検証**: 実 L1 正本に対して buildRequirementCatalog を実行し BR 9 件（BR-01〜08 / BR-22）・UX 3 件（UX-01〜03）・FR-L1 51 件（01〜51 連番過不足なし）を実測。正本冒頭の件数確定注記（BR 10 / UX 3 / FR-L1 51）と突き合わせ、欠落は BR-21 のみで、その原因が §11 の属性テーブル形式（太字が ID という文字列側に掛かり BR-21 に掛からない）であることまで確認した。これは PLAN §3 / L5 §8.1 の既知の限界の記述と一致し、他に未申告の取りこぼしは無い。抽出範囲については functional §1 の carry note 表（FR-L1-45 / FR-L1-01 の重複行を含む）が範囲外にあり二重カウントされないことを実測で確認した。mutation は 7 件中 4 件を reviewer 側でも独立に再現し kill を確認、残り 2 件（重複・非正準）は静的読解のみで未実測と明記された。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/requirement-catalog.test.ts tests/design-registry-screen-intake.test.ts tests/design-coverage.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-10T03:10:00Z", evidence_path: tests/requirement-catalog.test.ts, output_digest: "sha256:c20d6dd0a729bc4ff8053517b8e06d46ab6f21a1b6f01eba16692f73ad62af66", result: "3 files / 24 passed + 1 skipped" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T03:10:00Z", evidence_path: docs/plans/PLAN-L7-536-requirement-catalog.md, output_digest: "sha256:067d4b252d8d0efa815a8f76b9a3dc75acb7823f2ca51a0197ef0f22f59e5534", result: "plan-schedule / plan-descent / plan-specific-vpair-binding / design-reality-binding / plan-entry-routing すべて OK" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T03:10:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-10T03:12:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-10T03:12:00Z"
    evidence_digest: "sha256:03df96a683432356c67782b18e8a7b14ace517c82b769b2a26e832275ea1512f"
  entries: []
---

# PLAN-L7-536: L1 要求正本からの versioned requirement catalog

## §1 目的

L3 `design-registry-requirement-family-authority.md`（confirmed、PO 承認 2026-08-10）の D-1
「L1 の原 ID（BR / UX / FR-L1）を再採番せず registry の requirement family として認識する」を
実装するための供給源を作る。

**regex を広げない**（L3 §2「なぜ案 1 = regex に family を追加で終わらせないか」）。
`REQUIREMENT_ID_PATTERNS` へ family を足すだけだと、L1 に存在しない `BR-99` が有効な edge 端点に
なり trace を捏造できる。採用条件を「family 一致」から「L1 正本の定義行に**実在**すること」へ
変えるため、L1 から versioned catalog を抽出して consumer へ明示注入する。

## §2 工程表

### Step 1: inventory（L1 正本の実形と既存 parser 資産の把握）[直列]

根拠: downstream_dependency（既存 `g1-trace.ts` / `fr-registry-audit.ts` の抽出規則に揃えるか
新設するかで設計が変わる。実測の結果、既存資産は `Set<string>` しか返さず `source_pointer` /
`source_digest` を持たないため catalog 構造の生成は新規実装になる）。

### Step 2: red（U-DRC-001〜006 の oracle を先に書く）[直列]

根拠: downstream_dependency（TDD 規律。module 不在で red を実測してから実装する）。

### Step 3: green（pure な catalog builder と I/O 境界の実装）[直列]

根拠: downstream_dependency（oracle が定義された後にのみ実装を当てる）。

### Step 4: mutation 追試と oracle 補強 [直列]

根拠: downstream_dependency（green だけでは oracle が load-bearing か判定できない）。

### Step 5: 設計文書・テスト設計への反映 [並列]

根拠: parallel（L5 §8 / L6 §4 / L8 oracle 表は同一判断から同時に導ける）。

### Step 6: review [直列]

根拠: downstream_dependency（実装確定後の成果物に対して検証する）。

## §2.1 実装計画

新規 `src/design/requirement-catalog.ts`（pure builder + I/O loader）と
`tests/requirement-catalog.test.ts`（U-DRC-001〜006）。既存 module は変更しない。

抽出範囲は**定義表 section を明示宣言**する（L5 §8.1）。doc 全体や §1 全体を走査すると、
実 `functional-requirements.md` の `### §1.2 carry note`（参照表）が定義表と区別できず、
`FR-L1-45` / `FR-L1-51` が 2 件ずつ現れる。実装中に実正本で実際に発生し、reality fence
（U-DRC-006）が検出した。Set で畳めば silent に消え、畳まなければ偽の重複検出になるため、
どちらも許容せず範囲宣言で曖昧さを解消した。

## §3 実装中に判明した事実

- 実 `business-requirements.md` の BR / UX 定義表は `### §1.2 WHAT` にあり、`## §1` 直下ではない。
  一方 `functional-requirements.md` の FR-L1 定義表は `## §1` 直下にある。doc ごとに位置が違うため
  共通の「§1 を見る」規則では両立しない。
- `BR-21` は §11 の carry 記述であり定義行の形を持たない。catalog へは入らないため、`BR-21` を
  参照する trace が現れた場合は edge 化されず unmapped として列挙される（捏造しない）。
  これは既知の限界として L5 §8.1 に明記した。
- 既存 `extractG1P0FrIds`（`src/lint/g1-trace.ts`）は doc 全体を走査し `| P0 |` セルで絞るが、
  carry note 表も `| P0 |` を持つため同じ重複を拾っている。`Set` に入れるため silent に畳まれて
  表面化していない。本 slice では触らない（別 owner・別 failure domain）。

## §4 本 PLAN の非対象

- catalog を `buildScreenIntake` へ注入して edge 採用条件を切り替える部分（HR-FR-DHR-008 / 009 / 011）。
  次スライスで起票する。
- 恒久 family 認識と暫定 loader の lifecycle 分離宣言（HR-FR-DHR-012）。
- `HIL-*` の連番桁数不整合（L3 §6 のとおり別 slice）。
- `g1-trace.ts` の同種 over-acceptance の是正（別 owner・別回帰面）。

## §5 残リスク

- L1 の Markdown 見出しと表形式が事実上の機械契約になる。書式変更は `DRC_SECTION_MISSING` /
  `DRC_EMPTY_EXTRACTION` で検知されるが、「検知される」ことと「壊れない」ことは別である。
  U-DRC-006 の reality fence が実正本に対する最後の砦であり、これを削ると fixture だけで green になる。
- `BR-21` のように定義行形式を持たない実在 ID は catalog に入らない。現行 `screen_trace` は参照して
  いないため実害はないが、将来参照されれば unmapped として現れる（silent には消えない）。
