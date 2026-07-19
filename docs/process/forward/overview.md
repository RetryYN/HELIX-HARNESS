<!-- HELIX:L3-PROGRESSION-AUTHORITY:v1 -->
> **L3進行authority**: 層・pair・runtime判断は docs/governance/l3-progression-authority-rebaseline-2026-07-19.md を正とする。本文の旧layer/runtime表現はdomain contentだけを保持するcompatibility debtであり、L3 freeze条件へ使用しない。

> **現行authority（2026-07-19）**: canonical ForwardはL1-L12。正規pairはL1↔L12 / L2↔L11 / L3↔L10 / L4↔L9 / L5↔L8 / L6↔L7。L0-L14記述はcompatibility projectionである。

# Forward ワークフロー概要 (V-model L1-L12)

出典: concept v3.1 §2.3 / §3.1 / requirements v1.2 §1.4

---

## 1. Forward とは

Forward は層外anchorのL0企画を入力に、**L1事業要求 → L6機能設計 → L7単体実装・検証 → L12価値・運用品質検証**をV字で進む、HELIXの中核経路。
他のすべての mode (Scrum / Reverse / Discovery / Recovery / Refactor / Retrofit / Add-feature) は最終的に Forward に合流する。

---

## 2. V 字構造の 3 区画

```
左腕 (設計降下)        谷         右腕 (検証上昇)
L0 企画（層外anchor）
L1 事業要求                         L12 価値・運用品質検証
L2 要求定義                         L11 人間受入検証
L3 機能要件                         L10 UX受入検証
L4 基本設計                         L9 system検証
L5 詳細設計                         L8 integration検証
L6 機能設計                         L7 unit実装・検証
```

| 区画 | レイヤー | 役割 |
|------|---------|------|
| 左腕 | L1-L6 | ① 設計 + ③ テスト設計をpairで凍結 |
| 谷 | L6↔L7 | ② 実装コード + ④ テストコード (TDD Red先行) |
| 右腕 | L7-L12 | 左腕pairの③テスト設計を④テストコードとして実施 |

---

## 3. TDD-first 原則

- 左腕の各層で **① 設計 ⇔ ③ テスト設計** を同時に起票・凍結する (Pair freeze、G1-G6)。
- 谷 L7 に入る前に L6 単体テスト設計に対応する **④ テストコードを先行作成 (TDD Red)** し、その状態で実装を開始する。
- テスト設計 doc なしの「テストも書いた」は **逆ピラミッド**として G6/G7 で fail-close する (AP-8)。
- 要求修正後は **G-SF semantic feature frontier gate** を通し、意味単位を `confirmed_current` /
  `frontier_pending_decision` / `parked_future_version` / `approval_gated_cutover` / `rejected_or_archived`
  に分類する。frontier/parked/approval-gated が残る場合、selected gate green を whole-program 完了へ読み替えない。

---

## 4. V-pair ペア表（canonical L1-L12）

各V-pairは対応する検証本質を持つ。旧L0-L14成果物はcompatibility参照としてのみ使用し、canonical gate判定へ直接入力しない。

| 左（設計・定義） | 右（検証・実施） | canonical検証本質 |
|---|---|---|
| L1 | L12 | 事業・運用品質と価値の成立 |
| L2 | L11 | 要求・人間受入の成立 |
| L3 | L10 | 機能要件・UX受入の成立 |
| L4 | L9 | 基本設計・system品質の成立 |
| L5 | L8 | 詳細設計・integration品質の成立 |
| L6 | L7 | 機能設計・unit実装の成立 |

一次根拠: `docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md` / `docs/governance/l3-progression-authority-rebaseline-2026-07-19.md`

> **旧L0-L14 compatibility要点 (PLAN-RECOVERY-02、2026-06-04 snapshot)**:
> - **L0 企画 ⇔ 価値検証**: 従来ペア無しだった穴を埋める。G0.5 + L14→L0 feedback で企画目的の価値実現を検証。
> - **谷 = 3 点合算 (L6→単体テスト→L7、最小単位)**: L7 実装は L6 設計 ① + 単体テスト設計 ③ を見て、単体テストを先に具体化 (TDD red) → コード ② を実装。単体テストの居場所は谷 (L6⇔L7、表記 `layer:L6/executed_at:L7`)。
> - **右腕 = データ実在性エスカレーション** (右腕工程順 L8→L14): 合成/テストデータ (単体→結合 L8→総合 L9) → 本番実データ (**実データ検証=画面 L10** が先 → **本番受入=要件 L12** が後) → 運用 L14 (実データ×時間) → 価値 (実成果)。
> - **L2 = L1 のフェーズ分離**: 画面要求→要求/要件 (L1→L3)、画面詳細→L5。L2⇔L10 の右腕は「ワイヤーモック自体」で独立 test-design doc は作らない (mock が ③ を兼ねる、欠落でなく設計意図)。
> - **L7 (谷) / L13 デプロイ後検証**: L7 は谷 (①③ を受け 3 点合算で ②④ を作る)、L13 は L12 の続き (実環境 smoke、直接の左腕ペアなし)。

---

## 5. 4 artifact と別置き原則

| Artifact | 種別 | 配置 |
|----------|------|------|
| ① 設計 | 文書 | `docs/design/` |
| ② 実装コード | コード | `src/` |
| ③ テスト設計 | 文書 | `docs/test-design/` |
| ④ テストコード | コード | `tests/` |

① と ③ を同一文書に混在させない (AP-1/AP-2)。
③ と ④ も同一ファイルに混在させない (AP-3)。

出典: concept v3.1 §2.3 4 artifact / requirements v1.2 §2.1

---

## 6. 3 段階 freeze

| Freeze 段階 | タイミング | 凍結対象 | ゲート |
|------------|-----------|----------|--------|
| **A: Pair freeze** | L7 着手前 (各設計層) | ① + ③ ペア | G1-G6 |
| **A2: TDD Red freeze** | L7 最初のステップ | ③ + ④ 単体テスト先行 | L7 entry |
| **B: 4 artifact trace freeze** | L7 完了後 | ① + ② + ③ + ④ の 8 directed edge | G7 |

出典: concept v3.1 §2.3 3 段階 freeze

---

## 7. gate 体系 (概念)

| gate | タイミング | 確認対象 (概念) |
|------|-----------|----------------|
| G0.5 | L0 → L1 | 企画書が L1 業務要求へ trace できるか |
| G1 | L1 完了 | 必須sub-doc + L1↔L12 pair + 業務⇔画面⇔機能trace |
| G2 | L2 完了 | ワイヤーモック (or 画面要求) 凍結 |
| G3 | L3 完了 | FR+AC ⇔ 受入テスト設計 ペア凍結 |
| G4 | L4 完了 | アーキ/ADR ⇔ 総合テスト設計 ペア凍結 |
| G5 | L5 完了 | D-API/D-DB/D-CONTRACT ⇔ 結合テスト設計 凍結 (API/Schema Freeze) |
| G6 | L6 完了 | 関数 signature + WBS ⇔ 単体テスト設計 凍結 |
| G7 | L7 完了 | 4 artifact trace (必須 8 directed edge + coverage ≥ 80%) |
| G8-G9 | L8/L9 完了 | 結合・総合テスト品質 |
| G10-G12 | L10-L12 完了 | UX / UAT / release・運用品質 |

詳細な fail-close 条件は requirements v1.2 §2.2。

---

## 7.1 工程表 (roadmap) と PLAN の二層 (human/AI plane)

Forward 降下は **二層**で回す (定義正本 = concept §10.2、PLAN-RECOVERY-04)。

- **工程表 (roadmap) = 人間向け全プログラム進行台帳**: 機能群 (feature-group) を**結合テスト粒度**で並べた進行順序。**全プログラム (層外L0 anchor / Forward L1-L12 / cutover) を被覆**し、**人間が見て「ここ担当する」と自己割当**する。中央 UI (フロント) へ harness.db projection 経由で返す。master-hub PLAN の `roadmap:` block (gate+span) として機械登録し、`helix doctor` の `program-coverage` が未登録バンド = 残り frontier を surface する。
- **PLAN (区間 / span) = AI 開発のオーケストレーション**: 工程表の 1 区間 = 1 機能群のスプリント。依存洗い出し → 難易度分類 → agent 割当 → 並列/直列 (§工程表 Step の `[並列]/[直列]` + 直列化3条件)。leaf = 機能設計 ⇔ 単体テスト仕様書 (単体 V-pair) → 実装 + テストコード。

> 人間が「何を・誰が」(工程表)、AI が「どう作るか」(PLAN) を担う。「実装どこまで?」は工程表 (doctor program-coverage) から機械的に answer する。

---

## 8. このドキュメントの位置付けと残作業

この forward 定義は **正本化済** (PLAN-REVERSE-01、2026-06-04)。以下は carry として今後の PLAN で扱う。

- 各 mode (Scrum / Reverse / Discovery / Recovery / Add-feature) の詳細 → `docs/process/modes/`
- gate の機械検証条件 → `docs/process/gates.md`
- drive 別 (be/fe/db/fullstack/agent) の挙動差異 → concept v3.1 §3.7 を参照

詳細メカニクスは carry として残す (内容は消さない)。

## MCP verification profile workflow 運用

Forward work では、external MCP server、plugin、test foundation を profile rule 経由でのみ推奨できる。これらは verification aid であり、authoring source ではない。

- Relation graph impact expansion を先に実行し、impacted artifact、test、DB projection table、diagram を特定する。
- `helix verify recommend --changed <path>` は changed-file signal を verification profile へ map し、JSON または Mermaid graph evidence を出せる。完全な DB-backed relation graph expansion は後続 scope のままにする。
- external MCP/test foundation profile を追加または有効化する前に、`helix mcp profile list/probe` を使う。probe check は evidence のみであり package install は行わない。
- `helix mcp inspect <name> --method tools/list` は MCP Inspector readiness gate である。既定では refuse し、実 MCP inspection の前に明示的な external allow-list を要求する。
- `helix verify run --profile <name>` は既定で built-in profile を実行する。external profile は explicit allow-list review (`--allow-external`) と package/auth/Docker check 充足を要求する。
- `--save-evidence` は normalized profile evidence を `.helix/evidence/verification-profiles/` に保存し、後続 DB collector が同じ shape を ingest できるようにする。
- Browser/UI signal は exploratory browser inspection 用の Playwright MCP と、deterministic browser test 用の Playwright provider 付き Vitest Browser Mode を推奨する。
- DB/service-contract signal は Docker が利用可能な場合に Node.js 向け Testcontainers を推奨する。
- API mock gap と flaky external API signal は MSW を推奨する。
- GitHub issue/PR/CI/backlog signal は、まず read-only または narrow-toolset GitHub MCP profile を推奨する。
- MCP profile の追加または変更は、accept 前に MCP Inspector smoke evidence を要求する。
- unavailable profile は finding であり silent pass ではない。G7/accept は、その gate に profile rule が有効化された後にだけ fail-close できる。
- raw MCP/tool output は evidence のまま残し、gate は normalized DB row を consume する。

## Canonical document export workflow 運用

Forward work では、canonical HELIX document を spreadsheet / Excel / PPTX output へ変換できるが、derived artifact としてのみ扱う。正本は Markdown/source document と DB projection row のままである。

- Requirements / concept / detailed design / PLAN / ADR / test-design export は `document_export_*` projection row を使う。
- Pair-freeze または gate-review milestone は、external package なしで human review 用の `doc-csv-matrix` または `doc-markdown-summary` を推奨してよい。
- XLSX と PPTX export は、使用前に ExcelJS / SheetJS / PptxGenJS / D2 の renderer readiness evidence を要求する。
- Export dataset は source path、section ID、FR/AC/AT/PLAN/ADR IDs、status、trace、evidence link を保持しなければならない。
- Generated spreadsheet/deck は、source snapshot hash が canonical document set と一致しなくなった時点で stale である。
- export file から下した human decision は review/gate/handover evidence として別途記録する。export file の編集は canonical docs を更新しない。

## Tool adapter workflow 運用

Forward work では dependency-cruiser、Knip、Madge、Graphviz、Mermaid、D2 を optional graph/diagram adapter としてのみ使える。

- Core relation graph collection はTypeScript/Node transactional boundary、Python semantic core、DB projectionの責務境界を維持する。
- `catalogToolAdapters` は adapter metadata と trigger signal を定義する。
- `probeToolAdapter` は package/executable/config/workspace readiness を、package install なしで確認する。
- raw adapter output は bounded evidence であり、gate は normalized `tool_runs`、`dependency_edges`、`diagram_artifacts`、findings を consume する。
- missing adapter は finding であり、無関係な check failure ではない。
- adapter による auto-fix/delete behavior は、rollback evidence 付きの future human-approved PLAN が追加されるまで scope 外である。

## 下位 L Reverse backprop

Forward の下位 L (L4-L14) で追加機能・改善起票・受入条件変更・DB projection・guardrail・workflow rule を発見した場合、局所 carry のまま完了扱いしない。全体一貫性の原則として、該当発見は requirements v1.2 §6.8.8 の `backprop_decision` に分類する。

- `local_impl_only`: 上位要求・設計・受入条件を変えない局所補正。理由を audit に残す。
- `requires_design_normalization`: L4-L6 / test-design の整合補正が必要。Reverse `normalization` / `design` で戻す。
- `requires_requirement_backprop`: FR / AC / 機能一覧 / 運用ポリシーの意味が増える。Reverse `fullback` / `design` で L1/L3 へ戻す。
- `requires_concept_policy`: 企画価値・本番影響・認証/PII/ライセンス等を変える。人間判断後に concept / requirements へ戻す。

G7 / accept 時点で `requires_*` が未処理なら、Forward は完了ではなく back-prop 未了である。先行実装を許す場合も `add-design` / `add-impl` と `reverse/*` の pairing を evidence に残す。
