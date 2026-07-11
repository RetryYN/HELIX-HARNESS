---
plan_id: PLAN-L7-419-skill-mythos-uplift
title: "PLAN-L7-419 (impl): skill pack 判断力アップリフト — 安価モデルに apex 級の判断・品質・詳細配慮を発揮させる skill 増強 (FR-L1-47 / FR-L1-12)"
kind: impl
layer: L7
drive: agent
parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-11 PO /goal 指示「ハイブリッド設計ドキュメントv1 を確認し、各ステージの判断能力・品質能力・詳細配慮を安価モデルでも apex 級に引き出す skill の新規作成と既存 skill のブラシュアップ。外部ソース（テックブログ/GitHub）からも大幅強化し開発を完全網羅する」"
backprop_decision: not_required
backprop_decision_reason: "FR-L1-47 (skill pack curate) / FR-L1-12 (L 単位 文脈注入) の既定路線内の pack 増強であり、要求・設計の意味変更はない。判断規律 SSoT (judgment-core) の版上げは PLAN-L7-335 が定めた運用手順 (§7) に従う。"
created: 2026-07-11
updated: 2026-07-11
owner: Claude
verification_bindings:
  - parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
    oracle_id: U-SKUP-001
    test_path: tests/skill-pack-uplift.test.ts
  - parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
    oracle_id: U-SKUP-002
    test_path: tests/skill-pack-uplift.test.ts
  - parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
    oracle_id: U-SKUP-003
    test_path: tests/skill-pack-uplift.test.ts
  - parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
    oracle_id: U-SKUP-004
    test_path: tests/skill-pack-uplift.test.ts
  - parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
    oracle_id: U-SKUP-005
    test_path: tests/skill-pack-uplift.test.ts
  - parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
    oracle_id: U-SKUP-006
    test_path: tests/skill-pack-uplift.test.ts
  - parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
    oracle_id: U-SKUP-007
    test_path: tests/skill-pack-uplift.test.ts
  - parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
    oracle_id: U-SKUP-008
    test_path: tests/skill-pack-uplift.test.ts
  - parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
    oracle_id: U-SKUP-009
    test_path: tests/skill-pack-uplift.test.ts
  - parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
    oracle_id: U-SKUP-010
    test_path: tests/skill-pack-uplift.test.ts
  - parent_design: docs/design/helix/L6-function-design/skill-pack-uplift.md
    oracle_id: U-SKUP-011
    test_path: tests/skill-pack-uplift.test.ts
agent_slots:
  - role: tl
    slot_label: "TL — skill pack 増強 (新規 5 pack + 既存 brush-up + judgment-core v2)"
generates:
  - artifact_path: docs/plans/PLAN-L7-419-skill-mythos-uplift.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/test-thinking.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/code-minimalism.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/design-tailoring.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/acceptance-criteria-thinking.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/skill-authoring.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/adversarial-review.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/browser-testing-and-screen-verification.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/planning-and-task-breakdown.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/testing.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/judgment-core.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/SKILL_MAP.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/estimation.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/test.md
    artifact_type: markdown_doc
  - artifact_path: tests/skill-pack-uplift.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L5-06-skill.md
  requires:
    - docs/plans/PLAN-L7-70-skill-pack-curation.md
    - docs/plans/PLAN-L7-335-judgment-core.md
    - docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
  references:
    - docs/plans/PLAN-L7-310-model-effort.md
    - docs/plans/PLAN-L7-382-skill-efficacy-evaluation.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_l0_extra: docs/design/harness/L1-requirements/functional-requirements.md
review_evidence:
  - reviewer: codex-reviewer
    review_kind: cross_agent
    reviewed_at: "2026-07-11T10:05:00+09:00"
    tests_green_at: "2026-07-11T09:41:23+09:00"
    verdict: approve_after_fixes
    scope: "敵対検証 5 round (攻撃者=Codex gpt-5.6、§4 に攻防記録)。round 1-4 の Important 所見は全て是正済み (多数決 vs FLAG 優先規則 / 英語 prose 日本語化 / regression test の AC 直結強化 — 副産物として実在しない helix task estimate 言及を実検出・是正 / 検出器盲点への file 比率 fence 追加)。round 5 の literal verdict は fail (残反例 = 混在 prose 1 行の局所置換) だが、この 1 クラスは advisor-fable 諮問 (5 軸、条件付き賛成) に基づき §4 の残余リスク受入として終端化 (握りつぶしではなく受入判断の記録)。fence は正本 design-language gate より厳格 (同一 analyzer baseline 0 + 比率 1.3 + anchor)。"
    worker_model: claude-fable-5
    reviewer_model: gpt-5.6
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/skill-pack-uplift.test.ts tests/judgment-core-coverage.test.ts tests/agent-context-efficiency.test.ts tests/skill-assignment.test.ts tests/skill-recommend.test.ts tests/asset-catalog.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T09:41:23+09:00"
        evidence_path: tests/skill-pack-uplift.test.ts
        output_digest: "sha256:509994a89cd23f0ca217c4af1d65f801a046ecda1640cbbbcba5d3152dfd7067"
  - reviewer: advisor-fable
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T10:05:00+09:00"
    tests_green_at: "2026-07-11T09:41:23+09:00"
    verdict: pass
    scope: "cross-runtime 判定が同一論点 (検出器強度) で 3 round 不収束のため呼出条件 2/5 で諮問。結論 = 条件付き賛成: fence 追加強化は経済合理性を欠く (残反例主体は test 自体を改変可能で repo 内完全化は原理不能)。条件 = 残余リスクの PLAN 実記載 + 攻防記録の evidence 記録 (本 frontmatter と §4 で充足)。"
    worker_model: claude-fable-5
    reviewer_model: claude-fable-5
---

# PLAN-L7-419 (impl): skill pack 判断力アップリフト

## 0. 目的

PO 指示（2026-07-11 /goal）: ハイブリッド設計ドキュメント v1（`ハイブリッド設計ドキュメントv1-fixed.zip`、
vmodel-docgen ハーネス）を確認し、各工程での「判断能力」「品質能力」「詳細配慮」を、安価なモデル
（Haiku / Sonnet worker）でも apex 級（Fable/Opus 相当）に発揮させるよう、skill の新規作成と
既存 skill のブラシュアップを行う。テックブログ・GitHub 等の外部ソースからも大幅に強化し、
開発工程を抜け漏れなく網羅する。

FR-L1-47（skill pack curate）/ FR-L1-12（L 単位 文脈注入）の延長。判断規律の SSoT は
judgment-core（PLAN-L7-335）であり、本 PLAN は「普遍原則は judgment-core、工程固有の判断フレームは
個別 pack」という既存の分担を維持したまま増強する。

## 1. 入力ソース（inventory-first）

1. **vmodel-docgen skills（zip 同梱 15 本）** — 精読済み。移植価値の高い判断フレーム:
   壊れ方視点カタログ / 書く前の 7 段の問い / 敵対検証の攻撃者・防御者規約（攻撃 4 種限定・
   no_attack 試行ログ・PASS-WEAK）/ 9 状態マトリクス / テーラリング判断（na 条件・粒度・記録先表）/
   止めどきの経済判断 / 1AC=1 判定 / 垂直スライス偽装の名指し。ツール固有 DSL（YAML 書式・
   `tools/build.py`）は移植しない（HELIX には PLAN schema / helix CLI という別の正本がある）。
2. **外部テックブログ / 公式 doc（14 ソース）** — Anthropic 公式の skill authoring 指針
   （段階的開示・判断自由度の段階分け・チェックリスト・フィードバックループ）、
   検証質問の独立回答による結論修正（Chain-of-Verification、arXiv:2309.11495）、
   多数決判定（self-consistency、arXiv:2203.11171）、サブ問題分解（least-to-most、
   arXiv:2205.10625）、根拠先出しの項目別採点（analytic rubric）。
3. **GitHub OSS** — obra/superpowers（MIT・活発）: Iron Law 形式・claim-evidence 対応表・
   systematic-debugging 4 段・reviewer への context 最小化。google/eng-practices（CC-BY 3.0・
   出典明記で利用可）: 「改善なら承認」原則・Nit ラベル・対立解消フロー。
   OWASP ASVS は CC-BY-SA（share-alike 義務）のため転記せず名前と URL の参照のみに留める。
   anthropics/skills・awesome-claude-code 系は license 不明瞭 / NC-ND のため内容転用しない。

## 2. 範囲

### Add（新規 pack 5 本）

| pack | 中身（判断フレーム） | 主 layer |
|---|---|---|
| test-thinking | 壊れ方視点カタログ 6 軸・深さ配分・探索的テスト規律・止めどき+残余リスク言語化・全緑を疑う | L6-L10 |
| code-minimalism | 書く前の 7 段の問い・YAGNI 機械適用・ハードコード嗅覚・依存追加判断・生成 AI 時代の運用規則 | L5-L7 |
| design-tailoring | design doc の採用/skip 判断・粒度基準・決定の記録先一覧表・迷ったときの自問 | L1-L5 |
| acceptance-criteria-thinking | 1AC=1 判定・Given-When-Then・Done の偽装/垂直スライス偽装カタログ・探索発見の AC 昇格 | L3/L10-L12 |
| skill-authoring | 安価モデルを apex 級にする skill/委譲ブリーフの書き方（自由度段階分け・checklist・feedback loop・CoVe・analytic rubric・self-consistency の使いどころ） | L4-L7 |

### Brush-up（既存 pack 5 本 + 索引）

- adversarial-review: 敵対構造（投票ではない）・攻撃 4 種限定列挙・no_attack≥3 試行ログ・
  PASS-WEAK・防御は引用のみ（空欄=攻撃成立）・同系統モデルの盲点相関。
- browser-testing-and-screen-verification: 9 状態マトリクス・違和感言語化の 6 原則語彙・
  報告の型・AI 自己認識（信頼できる判定と落ちる判定）・a11y 数値基準。
- planning-and-task-breakdown: 縦割り（垂直スライス）分割パターンと横割り禁止・
  前倒しで作り込まない（漸進的詳細化）。
- testing: test-thinking への接続・オラクルの出所確定（実装から期待値を逆算しない）。
- judgment-core v1→v2: 逆説的品質シグナル（全緑を疑う）・止めどきの経済判断・7 段の問いの
  1 行宣言・evidence→verdict 順序（UNCERTAIN 許容）・レビュー承認原則（改善なら承認 / Nit 分離）。
  全 agent / command の `judgment_core:` marker を同一 commit で v2 へ追随させる。
- estimation: 見積もりのばらけ = 理解の相違の発見（平均せず原因を特定）を追補。
- `.claude/commands/test.md`: test-thinking pack への導線（壊れ方 3 通り言語化・全緑を疑う）を追補。
- SKILL_MAP: trigger table へ新規 pack 5 行を追加。
- debugging-and-error-recovery は inventory 確認の結果、obra/superpowers 由来の Iron Law +
  3-attempt escalation を既に搭載済みのため対象外（重複追記しない）。

## 3. 受入条件

- 新規 / 改修 pack はすべて有効な `skill.v1` frontmatter を持ち、`skill-assignment` lint の
  enum（skill_type 9 値・layers L0-L14・drive_models 10 値）に適合する。
- 本文は日本語 prose（design-language gate 準拠）で、実在する helix command / gate / state のみを
  参照する（vmodel-docgen 固有ツールの語彙を持ち込まない）。
- 外部ソース由来の内容は license を尊重する: MIT は再構成して利用、CC-BY は出典 URL 明記、
  CC-BY-SA / license 不明は転記しない（参照のみ）。
- judgment-core v2 への改訂は `judgment-core-coverage` gate green（全 marker 同一 commit 追随）。
- `helix plan lint` / `helix doctor` / `bun run typecheck` / `bun run lint` / `bun run test` green。
- review evidence（cross-runtime または intra_runtime_subagent）を confirmed 前に記録する。

## 4. 敵対検証の経過（cross-runtime、attacker=Codex gpt-5.6）

adversarial-review の是正ループ（FLAG → 是正 → 再攻撃）を 4 round 実施した。

| round | verdict | 所見と是正 |
|---|---|---|
| 1 | fail (Important 3) | ①skill-authoring の多数決が FLAG 優先と競合 → §2-13 に「多数決は敵対検証の verdict を上書きしない」優先規則を追加。②planning/testing の英語主体 prose → 該当文を日本語化。③regression test が主要 AC を機械検証しない → 実在 command 照合・design-language 適用・license anchor・優先規則 anchor を追加 |
| 2 | fail (Important 2) | ①command 照合が第 1 語のみ → 第 2 階層 subcommand も各 command の --help と照合するよう強化。**この強化が estimation.md の実在しない `helix task estimate` 言及を実検出**し、現行 CLI（task classify 実装済み）へ是正。②design-language 検査が SKILL_MAP / commands/test.md を未カバー → touchedPaths へ追加 |
| 3 | fail (Important 1) | commands/test.md の prose 検査が anchor 2 語のみ → design-language と同一ヒューリスティック（baseline 0）を .claude/commands/*.md 全 7 file へ直接適用。他 2 攻撃（第 2 階層照合・SKILL_MAP）は反駁済み |
| 4 | fail (Important 1) | 行単位ヒューリスティックは「英文行 + 行末に日本語 1 語」で回避可能（検出器自身の盲点への攻撃）→ file 単位の日本語/英語 文字数比 fence（現行実測 1.35-1.84 の直下 = 閾値 1.3）を追加。fence の責務は非意図的な英語 prose 化の回帰検出と定義 |
| 5 | fail (Important 1) | 残反例 =「日本語 1 語を含む混在文 1 行への局所置換は、行単位検査（日本語 1 字で行を skip する `shouldIgnoreLine`）を素通りし、file 比率の余剰が吸収する」。advisor-fable への最終諮問（5 軸判定、下記）で**残余リスクとして受入**を決定 |

### 残余リスク受入（advisor-fable 諮問 2026-07-11、条件付き賛成）

- **受け入れる残余リスク**: 日本語混在 1 行（〜数行）の英語主体 prose 化は本 fence の検出器
  （正本 design-language analyzer + file 比率 1.3）の責務外。これは正本 gate 自体が repo 全体
  1013 doc で検出できない既知の盲点クラスであり、AC の基準（gate 準拠）を fence は既に超えている。
- **なぜ強化しない**: 残反例を実行できる主体は repo 書込権を持ち test file 自体を改変できるため、
  repo 内検出器の完全化は原理的に不可能（脅威モデル上の管轄外）。file 別 baseline 凍結案は
  正当な日本語編集まで false positive にし保守コストが検出価値を上回るため不採用。
- **非意図的回帰の捕捉**: agent が英語段落・英語行を書く主要クラスは行単位検査が fail-close で
  捕捉する。残余クラスの統制は検出器ではなく、cross-runtime 敵対検証（本 PLAN が強化した
  adversarial-review 規約）と PO の抜き打ち確認、および「gate を黙らせる目的の修正の禁止」
  （CLAUDE.md 禁止事項）が担う。
- 本受入は test-thinking §5（止める判断は残余リスクの言語化とセット）と judgment-core §2 の
  運用実例である。

## 5. 状態

2026-07-11 起票。新規 5 pack + brush-up 7 pack + judgment-core v2（marker 28 件同一 commit 追随）
+ SKILL_MAP + regression fence（tests/skill-pack-uplift.test.ts、11 tests）を実装済み。
