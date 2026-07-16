---
layer: L3
sub_doc: business
status: confirmed
pair_artifact: docs/test-design/harness/L3-acceptance-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_br: docs/design/harness/L1-requirements/business-requirements.md
related_l1_screen: docs/design/harness/L1-requirements/screen-requirements.md
next_pair_freeze: L12
v2_import: docs/migration/v2-import-ledger.md
created: 2026-05-28
updated: 2026-05-28
---

> **SSoT 参照**: BR-21 全文 = business-requirements.md §11 / HM-08 = screen-requirements.md §1.HM.08 / FR-L1-36/38/43 = functional-requirements.md §1 (P2 起点、現行 projection 実装済み)。
> **適用範囲**: BR-21 (AI 実行成果評価) + HM-08 画面連動 + FR-L1-36/38/43 (Learning Engine 系、P2) のみ。FR 一般詳細化は functional-requirements.md (PLAN-L3-01) 担当 (重複回避)。
> **L12 接続**: 全 AC を AT-* で被覆 (孤児 0)。

# HELIX-HARNESS — L3 業務要件詳細 (business-detail) — BR-21 + HM-08 + 評価 projection

## §1 評価対象 (U-BR21-1 採用、PLAN 単位を既定 + 補助単位)

L1 BR-21 で宣言した「AI 実行成果評価」の評価単位を以下で確定する:

| 評価単位 | 役割 | 計測時点 | 主担当指標 |
|---------|------|---------|----------|
| **PLAN 単位** (既定) | harness 最小遂行単位、KPI D-07 と直結 | PLAN status=completed 時 | 成功率 / トークンコスト / 所要時間 / 再実行回数 |
| **skill 単位** (補助) | skill 推奨精度評価 | skill 注入 → 利用 → PLAN 完了 サイクル末 | skill 採用率 / 採用後成功率 |
| **model 単位** (補助、opt-in) | model 選択基準改善 | task 委譲完了時 | model 別成功率 / コスト効率 |

> **TL 採用根拠**: PLAN 単位 = harness の業務単位、skill / model は補助メトリクス (drift 計測用)。3 単位を超える単位 (sprint 全体 / FR 単位) は集計コスト過大のためスキップする。

## §2 評価指標 (U-BR21-2 採用、5 指標、KPI D-07 統合)

| 指標 | 計算式 | 目標 | 計測場所 |
|------|-------|------|---------|
| **成功率** | (PLAN status=completed) / (全 PLAN 起票数) × 100 | ≥ 80% | `.helix/plan_registry/` 集計 |
| **トークンコスト** | PLAN ごとの sum(invocation_log.input_tokens + output_tokens) | (LCM 目標は L4 で確定、P0 では計測のみ) | `.helix/audit/invocation_log/` |
| **所要時間** | PLAN ごとの (PLAN updated - created) | (中央値 ≤ 1 sprint 推奨) | plan_registry timestamp 差分 |
| **再実行回数** | PLAN ごとの sum(invocation count) | < 3 回 (1 回再試行を許容) | invocation_log 集計 |
| **fail-close 発火率** | (agent guard block 件数) / (Agent 呼び出し総数) × 100 | < 5% | agent-guard audit log |

> **KPI 整合**: 成功率 → D-04 (回帰検出率) / トークンコスト → D-06 (bypass 件数のコスト側面) / 所要時間 → D-09 (handover 引継ぎ成功率) / 再実行回数 → D-04 / fail-close 発火率 → D-06。

#### AC-FR-BR21-01 (正常系: 5 指標全件記録)
- **前提**: PLAN-005 が status=completed (Forward 経路で 7 日掛け)
- **操作**: `helix plan close PLAN-005`
- **期待結果**: 5 指標全件が `.helix/evaluation/PLAN-005.json` に記録 / KPI D-04/06/09 集計に反映

#### AC-FR-BR21-02 (異常系: 指標欠落)
- **前提**: invocation_log 未整備 (Phase A 初期、FR-L1-20 未実装)
- **操作**: `helix plan close`
- **期待結果**: 警告 `Warning: invocation_log 不在、token cost 計測不可 (Phase A scope)` / 他 4 指標は記録 / 終了コード 0

#### AC-FR-BR21-03 (境界系: model 単位 opt-in 未設定)
- **前提**: `.helix/evaluation/model-opt-in.yaml` で `enabled: false`
- **操作**: PLAN close
- **期待結果**: model 単位指標をスキップ / PLAN 単位 + skill 単位のみ記録 / audit に opt-in 状態記録

## §3 改善サイクル頻度 (U-BR21-3 採用、sprint 末 + 任意手動)

- **既定**: sprint 末 (Forward では G7 通過時 / Scrum では sprint review 末)
- **手動トリガー**: `helix evaluation run --since <date>` で任意期間集計
- **頻度上限**: 1 日 1 回 (telemetry コスト保護、NFR-13 dev-local+CI 整合)

> **TL 採用根拠**: 日次は telemetry コスト過大 (NFR-16 軽量原則違反)、週次は agile sprint と非同期、sprint 末が KPI 計測周期と整合。手動トリガーで柔軟性を確保する。

#### AC-FR-BR21-04 (正常系: sprint 末自動起動)
- **前提**: G7 通過直後 (sprint completed)
- **操作**: G7 通過 hook 発火
- **期待結果**: `helix evaluation run --auto` 自動実行 / sprint 内 PLAN 全件集計 / HM-08 ビュー更新

#### AC-FR-BR21-05 (異常系: 頻度上限超過)
- **前提**: 同日内に既に 1 回自動実行済、PO が手動再実行試行
- **操作**: `helix evaluation run --force`
- **期待結果**: 警告 `Warning: 本日 2 回目の実行 (telemetry cost 配慮、--force 指定で続行)` / 続行 / audit 記録

## §4 改善アクション (U-BR21-4 採用、通常改善は AI 自律、高影響のみ人間 residue)

| アクション種別 | 自動化レベル | 人間判断点 |
|-------------|------------|----------|
| skill 推奨アルゴリズム更新 | **自動適用可** (検証 green + rollback 可能な通常改善) | 高影響・不可逆・secret/PII/production 変更時のみ PO (S-03) |
| model 選択基準更新 | **自動適用可** (cost / quality 証跡付き) | provider 契約・課金上限・secret 変更時のみ TL/PO |
| detector ルール更新 | **自動適用可** (targeted regression 必須) | destructive / production / security policy 変更時のみ TL |
| PLAN テンプレート更新 | **自動適用可** (日本語 docs + lint green) | L0-L3 意味変更または不可逆 workflow 変更時のみ PO |
| skill 廃止 (rating 閾値以下) | **半自動** (フラグのみ、削除は人間専属、F6=a + CLAUDE.md destructive 禁止) | PO |

> **TL 採用根拠**: CC2 人間主導原則 + NFR-14 human-as-residue 整合、自動適用は AI 暴走源、半自動 = 提案 + 人間承認のサイクルで「学習する基盤」を実現。

#### AC-FR-BR21-06 (正常系: skill 廃止提案)
- **前提**: skill-X の rating が 30 日間 < 0.5 (採用率閾値以下)
- **操作**: evaluation run 完了
- **期待結果**: HM-08 に skill-X 廃止候補表示 + 提案テキスト生成 (AI 指示用コピー UI 提供) / PO 承認待ち状態 / skill 自体は削除されない

#### AC-FR-BR21-07 (異常系: 自動適用試行 block)
- **前提**: 何らかの実装ミスで skill 自動削除が試行される
- **操作**: `helix skill delete skill-X` が PO 承認なしで実行
- **期待結果**: fail-close `Error: skill 削除は PO 専属 + audit 記録必須 (CC2 / NFR-14)` / 削除されない / 終了コード 2

## §5 HM-08 画面連動 (U-BR21-5/6/7 採用)

### §5.1 データソース (4 件統合)

| ソース | 用途 |
|--------|------|
| `invocation_log` (FR-L1-20) | トークンコスト / 再実行回数 / model 別成功率 |
| `detector_runs` (FR-L1-18) | fail-close 発火率 / detector 検出率 |
| `gate_runs` (FR-L1-05) | gate 通過率 (KPI D-02) / sprint 末トリガー |
| `plan_registry` (FR-L1-04) | PLAN 件数 / 成功率 / 所要時間 |

集計バッチ (`.helix/evaluation/`) で 4 ソースを結合 → HM-08 表示用の派生ビューを生成。

### §5.2 表示頻度

- **集計バッチ**: sprint 末 + 手動トリガー (§3 整合)
- **HM-08 ポーリング**: 30 秒 (S2=b 全画面共通整合)、集計済み派生ビューを表示

### §5.3 AI 指示コピー UI (CC2 整合、必須)

HM-08 で改善提案 (例: skill 廃止 / PLAN テンプレ更新) が出た際、人間が AI (Claude/Codex) に貼り付けて「改善 PLAN を起票」を指示する **コピー＆ペースト用テキスト** を生成する。

```
提案例 (コピー＆ペースト用):
「以下の改善提案に基づき PLAN を起票してください:
- skill-X (採用率 0.42、30 日間トレンド低下) を廃止候補に追加
- PLAN テンプレ frontmatter に skill_review_required: true を追加
担当 agent_slots: tl / pmo-sonnet
priority: P1」
```

#### AC-FR-BR21-08 (正常系: HM-08 表示)
- **前提**: 集計バッチ完了 (sprint 末トリガー)
- **操作**: HM-08 アクセス
- **期待結果**: 4 ソース統合ビュー表示 / 5 指標サマリ + skill/model 別 詳細テーブル / 30 秒ポーリングで自動更新

#### AC-FR-BR21-09 (異常系: 集計バッチ失敗)
- **前提**: invocation_log が破損 (JSON parse error)
- **操作**: 集計バッチ実行
- **期待結果**: 該当データソースをスキップ + 警告 `Warning: invocation_log 破損、token cost 指標欠落` / 他 3 ソースは正常集計 / HM-08 に警告バナー表示

## §6 後続引き継ぎ境界 (U-BR21-8 採用、projection 実装済み + HM-08/改善ループ引き継ぎ)

### §6.1 現行実装済みスコープ

- **projection**: FR-L1-36/38/43 は PLAN-L7-53 で `skill_evaluations` / `model_evaluations` / `poc_evaluations` として実装済み
- **token/cost**: FR-L1-38 の token/cost 効率は PLAN-L7-57/58 で telemetry scan + model_evaluations 集計として実装済み
- **画面**: HM-08 表示・操作 UX は L4/L10 へ引き継ぐ
- **改善サイクル**: §4 の提案生成・人間承認・適用ループは後続へ引き継ぐ

### §6.2 後続引き継ぎの着手条件 (U-BR21-9 採用、A-44 ledger)

以下の **AND 条件**を全て満たした時点で HM-08 表示・改善ループの本格化に着手:

1. **Phase A G14 通過** (workflow 標準完了点、技術判断)
2. **KPI D-07 (AI 委譲時間率) 直近 1 sprint ≥ 50% 達成** (MVP 範囲で AI 委譲が機能している証明、目標値 ≥ 70% の手前)

> **後続調整可能**: PO が目標値を引き上げたい場合は L4/Phase B 着手 PLAN で再調整。

### §6.3 後続実装範囲

- HM-08 表示 (skill/model/PoC 評価 projection の UI 表示)
- §4 改善アクションの半自動適用パイプライン (提案 + 承認 + 適用 + 評価のループ)
- HM-08 リアルタイム表示 (集計バッチ → イベントストリーム移行)
- §6.4 telemetry (PII redaction + 同意の既定値)

### §6.4 telemetry (U-BR21-10 採用)

- **PLAN 評価**: 既定で有効 (KPI D-07 計測の必須インフラ)
- **model 評価**: opt-in (`.helix/evaluation/model-opt-in.yaml`)
- **PII redaction**: 必須 (prompt 本文除外、NFR-09/14 整合)
- **詳細設計**: Phase B 着手時 PLAN で確定 (本 sub-doc は宣言のみ)

## §7 FR-L1-36/38/43 詳細化 (projection 実装契約)

### FR-BR21-36: スキル評価システム

- **L1 上流**: FR-L1-36
- **入力**: `skill_invocations.accepted=1`、`plan_registry.status`、`asOf`
- **出力**: `skill_evaluations` projection (skill_rating / adoption_count / success_count / unused_flag)
- **振る舞い**: skill 別に採用 PLAN と成功 PLAN を集計し、30 日未発火を unused としてフラグ化する。削除は人間専属

#### AC-FR-BR21-36-01 (正常系)
- **前提**: skill-X が直近 sprint で 5 PLAN に採用、5 件全て成功
- **操作**: sprint 末バッチ実行
- **期待結果**: skill_rating = 1.0 / 廃止候補フラグ false / HM-08 に維持ステータス表示

#### AC-FR-BR21-36-02 (境界系)
- **前提**: skill-X が直近 30 日採用 0 件 (使われていない)
- **操作**: バッチ実行
- **期待結果**: 警告 `skill-X 30 日採用 0 件 (未使用 skill)` / 廃止候補フラグ true / 削除は人間専属 (AC-FR-BR21-06)

### FR-BR21-38: model 評価システム (opt-in)

- **L1 上流**: FR-L1-38
- **入力**: `model_runs`、`plan_registry.status`、`.helix/config/model-opt-in.yaml`
- **出力**: `model_evaluations` projection (success_rate / run_count / success_count / token・cost 効率)
- **振る舞い**: model 別成功率と token/cost 効率を集計し、FR-L1-37 (model 推挙) のフィードバック入力にする

#### AC-FR-BR21-38-01 (正常系)
- **前提**: model-opt-in.yaml で `enabled: true`、model-A / model-B 両方使用履歴あり
- **操作**: バッチ実行
- **期待結果**: model 別 success_rate / run_count / success_count / token・cost 効率を projection し、HM-08 表示入力として利用可能

#### AC-FR-BR21-38-02 (境界系)
- **前提**: opt-in `enabled: false`
- **操作**: バッチ実行
- **期待結果**: model 評価をスキップ / PLAN/skill 評価のみ実行 / audit に opt-in 状態記録

### FR-BR21-43: PoC サクセス計測

- **L1 上流**: FR-L1-43
- **入力**: Discovery (S0-S4) 完了 PLAN / decision_outcome
- **出力**: `poc_evaluations` projection (poc_success_rate / confirmed_count / rejected_count / pivot_count / total_count)
- **振る舞い**: 判断済み PoC の confirmed / rejected / pivot を集計し、pivot は分母に含めて非成功として扱う

#### AC-FR-BR21-43-01 (正常系)
- **前提**: 直近 10 件 PoC のうち confirmed 6 件 / rejected 3 件 / pivot 1 件
- **操作**: バッチ実行
- **期待結果**: PoC 成功率 60% を HM-08 に表示 / pivot 1 件の原因分析提案

#### AC-FR-BR21-43-02 (異常系)
- **前提**: PoC PLAN が 1 件も無し
- **操作**: バッチ実行
- **期待結果**: 情報 `info: PoC PLAN 0 件、計測対象なし` / HM-08 に「データ蓄積中」表示 / KPI ゼロ起算

## §8 関連文書

- L1 業務要求 §11 BR-21: `docs/design/harness/L1-requirements/business-requirements.md` §11
- L1 機能要求 FR-L1-36/38/43: `docs/design/harness/L1-requirements/functional-requirements.md` §1
- L1 画面要求 HM-08: `docs/design/harness/L1-requirements/screen-requirements.md` §1.HM.08
- L3 functional (P0 FR-01〜18): `docs/design/harness/L3-functional/functional-requirements.md`
- L3 nfr-grade (NFR 閾値): `docs/design/harness/L3-functional/nfr-grade.md`
- L12 運用/価値検証: `docs/test-design/harness/L3-acceptance-test-design.md`
- PLAN: `docs/plans/PLAN-L3-02-business-detail.md`

## §9 引き継ぎ / 次工程 (L4 / Phase B)

- **L4 基本設計**: BR-21 評価指標の UI 表示・改善ループ・state schema 境界は L4 基本設計で確定
- **L4 データ設計**: 評価指標 entity (PlanEvaluation / SkillEvaluation / ModelEvaluation / PocEvaluation) は L4 データ設計で確定し、L7 projection 実装と整合させる
- **実装済み projection**: FR-L1-36/38/43 の projection は PLAN-L7-53/57/58 で実装済み。後続は HM-08 表示・改善アクション適用ループ
- **NFR-18 (telemetry PII redaction)**: nfr-grade.md §7.3 引き継ぎと整合、Phase B 着手時に確定 (旧 NFR-17 を A-54 で NFR-18 にリネーム、NFR-17 = 統合セキュリティとの ID 衝突解消)
- **L10 システム/Real UX evidence**: HM-08 画面の最終 UX 確定は L10 システム/Real UX evidenceへ送り
- **CC2 引き継ぎ強化**: 全 §4 改善アクションは半自動 (提案 + 人間承認) の二段階を厳守、L4 / L5 で詳細実装

### §9.1 PdM / tech-docs / fork 提案の引き継ぎ (A-46、functional §7.1-§7.3 にも集約)

- **§2 評価指標拡張候補** (PdM tech-innovation): D-14 reviewer cognitive load (reviewer 認知負荷、SPACE Satisfaction、CC2 の計測可能 proxy) / D-15 handover record 完全性 / D-16 gate block time / D-17 PLAN diff LOC を §2 5 指標に追加検討
- **NSM 提案** (PdM marketing-innovation): NSM = Verified AI delivery rate (D-10 候補、process × safety × automation 統合) を BR-NSM-01 として L1 BR add-design 候補に追記済 (business §9 引き継ぎ)
- **HM-08 viral loop** (PdM PLG): handover JSON 共有リンク化 (チーム横断採用の共有導線)、Phase B 引き継ぎ
- **Phase B Learning Engine 入力強化** (PdM tech-innovation): LinearB LT 分解 (5 phase buckets) + Pluralsight churn (14 日同一ファイル再編集率) を Learning Engine 主入力に追加、HM-08 BR-21 cold start (初期データ不足) を回避
