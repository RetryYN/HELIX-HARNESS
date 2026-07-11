---
plan_id: PLAN-L7-421-design-coverage-catalog
title: "PLAN-L7-421 (impl): 設計カバレッジ catalog の移植 — vmodel-docgen の catalog/profile/coverage 機構を TS/Bun で HELIX へ (FR-L1-12 / PLAN-L3-13 adoption)"
kind: impl
layer: L7
drive: agent
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-11 PO 指摘「設計カバレッジの参照先がなければ勝手に作らない？」「ZIP に仕組みが入ってない？それを使わないと」— ZIP の catalog/profile/coverage 機構を inventory-first で移植せよ"
backprop_decision: not_required
backprop_decision_reason: "PLAN-L3-13 (vmodel-docgen-fit / adoption-matrix、confirmed) が定義済みの ZIP 統合方針の実装であり、要求・設計の意味変更はない。Python runtime は持ち込まず (ADR-001)、機構を TS/Bun で再実装し、catalog データ構造は ZIP を正として踏襲する。"
created: 2026-07-11
updated: 2026-07-11
owner: Claude
agent_slots:
  - role: tl
    slot_label: "TL — catalog schema 移植と design-coverage gate 設計"
generates:
  - artifact_path: docs/plans/PLAN-L7-421-design-coverage-catalog.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/design-catalog.yaml
    artifact_type: design_doc
  - artifact_path: src/lint/design-coverage.ts
    artifact_type: source_module
  - artifact_path: tests/design-coverage.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/helix/L6-function-design/orchestration-memory.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/slow/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L5-06-skill.md
  requires:
    - docs/design/helix/L3-requirements/vmodel-docgen-fit.md
    - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
    - docs/plans/PLAN-L7-419-skill-mythos-uplift.md
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: cross_agent
    reviewed_at: "2026-07-11T21:40:19+09:00"
    tests_green_at: "2026-07-11T21:40:19+09:00"
    verdict: approve_after_fixes
    scope: "severity-first 独立レビュー。ZIP 122 trace、path traversal、baseline pin、doctor wiring、L6/L8 Vペアを突合した。Important 1件（L6関数契約とL8 U-DESIGNCOV oracleの欠落）を追補。敵対変異13件、real catalog 122件、typecheckを再検証し、未解消blockerなし。"
    worker_model: claude-fable-5
    reviewer_model: gpt-5.6
    green_commands:
      - kind: unit_test
        command: "bun test tests/design-coverage.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T21:40:19+09:00"
        evidence_path: tests/design-coverage.test.ts
        output_digest: "sha256:85f9226307cebbb2583e8953ab72a7d9bf25d803af66791f0c214d1cde503f1c"
      - kind: typecheck
        command: "bunx tsc --noEmit"
        runner: bun
        scope: repository
        exit_code: 0
        completed_at: "2026-07-11T21:40:19+09:00"
        evidence_path: src/lint/design-coverage.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  - reviewer: codex-adversarial-reviewer
    review_kind: cross_agent
    reviewed_at: "2026-07-11T21:52:18+09:00"
    tests_green_at: "2026-07-11T21:52:18+09:00"
    verdict: approve_after_fixes
    scope: "敵対検証 5 round (§4 に全所見と是正を記録)。round 1-4 fail (Important 計 8 / Minor 計 2) を全て是正し round 5 pass。baseline fingerprint pin / artifact 許可 root + traversal 拒否 / zip-01..122 完全一致 / trivial-na + empty-adoption / seed done 4 件降格 / カテゴリ別 message exact oracle。slice(0,1) mutant kill を worker・reviewer 双方で実測。"
    worker_model: claude-fable-5
    reviewer_model: gpt-5.6
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/design-coverage.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T21:52:18+09:00"
        evidence_path: tests/design-coverage.test.ts
        output_digest: "sha256:adc687b9ce704b596f27ccfc7fb957e229641ba9b6118ce78e51ebe682503b2e"
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_l0_extra: docs/design/harness/L1-requirements/functional-requirements.md
---

# PLAN-L7-421 (impl): 設計カバレッジ catalog の移植

## 0. 目的（PO 指摘への回答）

HELIX には「この案件に必要な設計文書種は何で、どれが todo / na（理由付き）/ done か」の
機械参照（ZIP の catalog.yaml + profiles.yaml + `build.py coverage` 相当）が無く、
「必要文書を黙って省く」「catalog 外の文書種を勝手に起こす」を検出できない。
ZIP に実装済みの仕組みを**設計ソース（正本）として移植**する。ゼロから設計しない。

## 1. 移植元（ZIP の機構、精読済み）

| ZIP の機構 | 内容 | HELIX への移植先 |
|---|---|---|
| `docs/catalog.yaml` | categories + items（id / name / category / **status: done・todo・na** / file / note / **detail: 詳細・標準・簡易**） | `docs/design/design-catalog.yaml`（schema `design-catalog.v1`） |
| `docs/profiles.yaml` | 規模（PoC/Standard/Enterprise）・形態（Web/Mobile/Desktop/CLI/APIService）別に default_status + adopt 表 + detail_override を一括適用 | catalog 内 `profiles:` 節（一括適用 CLI は Part 2） |
| `build.py coverage` | done/(done+todo) の総合・カテゴリ別 % 、**done 宣言と実態（記入率・placeholder 残）の乖離検出（--strict で exit 1）**、粒度宣言と実態行数の乖離（情報） | `src/lint/design-coverage.ts` + doctor gate `design-coverage` |
| 52_テーラリング | 「なぜ書かないか」の理由記録。**gate を黙らせる目的の na 禁止** | items の `na_reason` 必須フィールド（理由なき na = red） |
| `build.py activation` | 文書の活性化状態の可視化 | Part 2（本 PLAN 対象外） |

## 2. 範囲（Part 1）

1. **`docs/design/design-catalog.yaml`**: ZIP の 122 文書種を `source: zip-NN` トレース付きで
   registry 化し、HELIX-HARNESS 自身（CLI/TS 製品）を最初の案件として全 122 件に
   status / artifact / na_reason を付与する。判定素材は 2026-07-11 の被覆突合
   （充足 45 / 部分 43 / 欠落 34）と adoption-matrix。**na 条件は ZIP の規律を踏襲**:
   関心事が構造的に存在しない場合のみ（例: harness は SaaS/Mobile/Desktop 製品ではない）。
   「まだ書いていない」は todo のままにする。
2. **`src/lint/design-coverage.ts`**（doctor gate は Part 2 配線、まず real-repo regression test で強制）:
   - schema 検査（status enum / category 実在 / source 一意）。
   - **na → na_reason 必須**（理由なき na = red。「gate を黙らせる na」の機械禁止）。
   - **done → artifact 必須かつ実在**（done 宣言と実態の乖離 = red。ZIP の coverage --strict 相当）。
   - **catalog 外検出**: `docs/design/` 配下の実在 doc が、どの item の artifact にも
     baseline にも該当しない → red（「勝手に作る」の検出。既存 doc は baseline 凍結し、
     新規からfail-close — design-language gate と同じ baseline 方式）。
   - coverage 集計 message（総合 % / カテゴリ別 / todo 残）。
3. **`tests/design-coverage.test.ts`**: synthetic 変異（理由なき na / artifact 欠落 done /
   catalog 外新規 doc）+ real-repo regression（catalog green・122 件・na には全件理由）。

## 3. 受入条件

- catalog は ZIP 122 種を全件 `source: zip-NN` で trace し、HELIX 案件としての status を持つ
  （na には全件理由。todo は「計画済み残工程」として adoption-matrix の後続に接続）。
- 変異 3 種（理由なき na / artifact 無し done / catalog 外 doc）がそれぞれ red になる test。
- 現行 repo で gate green（baseline 凍結の実測証明）。
- typecheck / lint / targeted tests green。cross-runtime review evidence を confirmed 前に記録。

## 4. 敵対検証の経過（cross-runtime、attacker=Codex gpt-5.6）

| round | verdict | 所見と是正 |
|---|---|---|
| 1 | fail (Important 5 / Minor 1) | ①baseline を catalog.yaml の追記だけで増やせ、rogue doc + baseline 1 行の同時追加で green にできる → baseline fingerprint pin（`DESIGN_BASELINE_FINGERPRINT`、src 側定数）を導入し、catalog 単独編集では `baseline-fingerprint-drift` で red（意図的変更は src 定数の同時更新＝コードレビュー面へ強制昇格）。②done artifact が実在すれば無関係ファイル（package.json）でも green → 許可 root（docs/ src/ tests/ .claude/ + CLAUDE.md/AGENTS.md）検査 `artifact-outside-scope` を追加。③122 全件 trace が件数のみで zip-200..321 への全置換でも green → 期待集合 zip-01..122 との完全一致検査（範囲外= `unknown-source`、欠番= `missing-zip-trace`、境界 zip-00/123/999 の red test 付き）。④na_reason が「N/A」1 語でも通り、全件 na で分母 0 でも ok → 実質下限 10 字 + 禁止句 `trivial-na-reason`、分母 0 は `empty-adoption` で red。⑤seed の done 過大宣言 4 件（単体/結合/総合/受入テスト設計書が lint/skill を artifact に流用）→ todo へ降格（note に理由、done 43 / todo 57 / na 22 = 43.0%）。⑥(Minor) 空分母の意味未規定 → ④の empty-adoption で解消 |
| 2 | fail (Important 1) | ①許可 root 検査が未正規化 startsWith のため `docs/../package.json` の path traversal で迂回できる → 正規形 repo 相対 path 検査（`isCanonicalRepoRelativePath`: 絶対 path・`..`・`.`・空 segment・`\\` 区切りを拒否）を scope 判定の前提条件に追加。traversal 変異 5 種（`docs/../` / 3 段 `../` / `./` / 絶対 / backslash）の red test を追加。round 1 の是正①③④⑤は変異 kill 込みで PASS 判定 |
| 3 | fail (Important 1 / Minor 1) | ①PLAN §2 が要求する coverage message の「カテゴリ別 % / todo 残」が未実装（AC/scope 乖離）→ `DesignCoverageResult.categories`（カテゴリ別 done/todo/na/%）を追加し、message に「カテゴリ別: ...」「todo 残: ...」行を出力（oracle test 付き。全件 na のカテゴリは採用対象外として省く）。②(Minor) 空 segment 拒否の green mutant（`docs//design/a.md` 未検査）→ traversal red test に空 segment vector を追加。round 2 の traversal 是正は mutation-kill 込みで PASS 判定 |
| 4 | fail (Important 1) | ①カテゴリ別 message の oracle が `basic 50%` の部分一致のみで、採用カテゴリの部分列挙変異（`adopted.slice(0, 1)`）が green のまま → message 行全体の exact 一致 assert + 複数カテゴリ todo の全列挙 fence（`todo 残: basic=1, test=2`）へ厳密化。是正後に slice mutant を手元適用して 1 failed（kill）→ 復元 13 pass を実測。round 3 の①（categories 構造）②（空 segment）は mutation-kill 込みで PASS 判定 |
| 5 | pass | 新規所見なし。round 4 の①の排除を確認（reviewer 側でも slice mutant を隔離コピーで再現し U-DESIGNCOV-002 が exit 1 で kill、復元後 13 pass / tsc exit 0 / biome exit 0 を実測） |

### 残余リスク（受入済み・機械検査の限界の言語化）

- artifact の**内容**が文書種に意味的に対応するかは機械検査しない（許可 root + 実在 + 全件 trace まで）。
  done 宣言の意味的妥当性は catalog 変更時の cross-runtime review が担保する（本 §4 の spot check がその実例）。
- baseline fingerprint は「catalog 単独編集での回避」を塞ぐもので、src 定数と yaml を**同時に**書き換える
  攻撃は塞がない。それは通常のコードレビュー + 本 test の pin 変更として可視化される前提。

## 5. 状態

2026-07-11 confirmed。catalog seed、lint、敵対変異 test、L6/L8 Vペア、doctor hard gate 配線まで完了。

### green_commands（検証コマンド）

- `bun test tests/design-coverage.test.ts` — 13 pass / 0 fail
- `bunx tsc --noEmit` — exit 0
