# HELIXのシステム群による要求のカバレッジ

prepared_at: 2026-09-18
status: draft_review_pending
authority_effect: none

## この文書で行うこと

[HELIXの構造仮説（システム群）](../concept/helix-structure-tvo-po-statements-2026-09-18.md)の区分で、次の3つの母集団へ同じラベルを付け、層ごとに並べる。要求本文、意味、採否、successor、L1／L2／L11は変更しない。

| 波 | 母集団 | 件数 | 機械台帳 |
|---|---|---:|---|
| 第1波 | 旧Requirement IR | 153 | [legacy-ir-structure-classification.jsonl](legacy-ir-structure-classification.jsonl)。一覧は[別文書](legacy-ir-structure-classification.md) |
| 第2波 | 旧confirmed identity | 175 | [legacy-confirmed-identity-structure-classification.jsonl](legacy-confirmed-identity-structure-classification.jsonl) |
| 第3波 | 現行L2（4製品、draft・未採否） | 37 | [current-l2-structure-classification.jsonl](current-l2-structure-classification.jsonl) |

第2波は、層（主・副）、狙い、要求か決定かの軸を付けた。第3波は、層（主・副）だけを付けた。現行L2は1つのIDの下に補足本文（工程規則表や節）を持つため、副の所属は補足本文の内容も含めて付けた。製品の振り分けは第1波にしか存在しないため、第2波には付けていない。v1.3本体の節（§4.5、§4.9等）のうちconfirmed identityに入っていない本文は、本書の対象外である。

## 層ごとのカバレッジ（主の所属／副の所属）

| 層 | 旧IR 153 | 旧identity 175 | 現行L2 37 | 読み取り |
|---|---:|---:|---:|---|
| 入口：フルリバース | 12／2 | 4／0 | 0／0 | 現行L2に受け皿がない |
| サービス① 画面プロト／PoC | 0／5 | 2／2 | 0／2 | 現行L2では副の所属だけ。専用の要求がない |
| サービス② 要件定義 | 0／5 | 0／0 | 0／1 | 現行L2では副の所属だけ。専用の要求がない |
| サービス③ 設計 | 0／9 | 0／1 | 0／2 | 現行L2では副の所属だけ。専用の要求がない |
| サービス④ 開発 | 0／0 | 2／2 | 0／1 | 現行L2では副の所属だけ。専用の要求がない |
| サービス⑤ リファクタリング | 4／0 | 1／1 | 0／2 | 現行L2では副の所属だけ。専用の要求がない |
| サービス⑥ リリース | 1／4 | 1／4 | 3／4 |  |
| サービス⑦ 運用保守（仮置き） | 4／0 | 1／1 | 0／3 | 現行L2では副の所属だけ。専用の要求がない |
| 部品：要求エンジン（仮置き） | 6／2 | 0／0 | 1／0 |  |
| 部品：デザインHARNESS（仮置き） | 6／0 | 2／1 | 0／0 | 現行L2に受け皿がない |
| 部品：Design Template・設計義務（仮置き） | 11／2 | 0／0 | 1／0 | 旧要求が厚く、現行L2が薄い |
| 部品：リサーチWorkflow（仮置き） | 0／0 | 2／0 | 1／1 |  |
| 枠：開発方式・接続・Gate | 15／26 | 11／12 | 5／2 |  |
| コア | 18／19 | 7／6 | 0／3 | 現行L2では副の所属だけ。専用の要求がない |
| チケット・駆動モデル | 9／13 | 10／9 | 0／4 | 現行L2では副の所属だけ。専用の要求がない |
| OS：管理（土台） | 16／38 | 35／16 | 6／3 |  |
| OS：推進（チケット発行・レーン・サブエージェント） | 27／8 | 36／7 | 2／2 | 旧要求が厚く、現行L2が薄い |
| OS：検収（CI・テスト最適化・ベンチ） | 15／11 | 27／26 | 2／4 | 旧要求が厚く、現行L2が薄い |
| OS：改善loop（学習・判断pack・memory）（仮置き） | 9／1 | 17／6 | 1／3 | 旧要求が厚く、現行L2が薄い |
| HELIX-Web：窓口・ダッシュボード（仮置き） | 0／0 | 17／4 | 9／1 |  |
| HELIX-Web-OS：Webサービスの運転 | 0／0 | 0／0 | 6／2 |  |
| **計（主）** | **153** | **175** | **37** | |

## 読み取れること

- サービス④開発は、旧IRに0件、旧identityに2件（TDD強制、DDD／TDD厳格化）、現行L2に専用の要求がない。新規の要求形成が必要である。
- サービス⑥リリースと⑦運用保守は、旧要求が合計でも数件しかない。現行L2ではHARNESSの提供条件（`HARNESS-L2-006`／`007`）、OSの導入・更新（`HELIXOS-L2-006`）、Web-OSのservice運転（`HELIXWEBOS-L2-006`）に分かれており、HARNESSのサービスとしてのリリース／運用保守は要求になっていない。
- ダッシュボード（旧identityのPM／HM／GDの15画面とBR-06、UX-02）は、旧IR 153件には無く、旧identityにだけある。現行ではHELIX-WebのL2が受け皿である。社内向けの可視化とユーザー向けの窓口を同じ棚に置くかはPOの判断事項である。
- OSの推進（レーン、サブエージェント）は旧要求が最も厚い（旧IR 27件、旧identity 36件）が、現行L2は`HELIXOS-L2-004`と`009`の2件である。
- 入口のフルリバースは旧要求が16件あるが、現行L2に専用の要求がない。
- チケット・駆動モデルは旧要求が19件あるが、現行L2では副の所属だけである。
- 部品のリサーチWorkflowは、旧identityの`FR-L1-27`と`HBR-P8`、現行の`HELIXOS-L2-012`が素材である。

## 第2波：旧confirmed identity 175件

### 入口：フルリバース（主 4件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `FR-L1-14` | 枠：開発方式・接続・Gate | 品質の保証 | 要求 | ｜ **FR-L1-14** ｜ Reverseワークフロー（5 type: code/design/upgrade/normalization/fullback、R0-R4＋RGC） ｜ reverse-workflow ｜ 既存code／設計文書／依存 ｜ Rn成果物（evidence / contracts / as-is-design / gap-register / routing）。onboardingやIncident収束後のbackfillに利用できるが、development styleまたはcase-driven modelへ分類しない ｜ P0 ｜ PM-02 (Reverse 工程) / HM-07 ｜ |
| `FR-L1-33` | OS：管理（土台） | 品質の保証 | 要求 | ｜ **FR-L1-33** ｜ 既存資産棚卸し・充足度マッピング (コマンド / スキル / detector / template / state / hook / docs / tests の網羅確認) ｜ asset-mapping ｜ リポジトリ全資産 ｜ 充足度レポート、不足項目リスト。※ extended (既存 source capability W11/W12/W16 突合、2026-06-04): workflow/task/agent builder、audit/metrics/dashboard、asset/code catalog は本機能の棚卸し対象に含め、Phase 0 の必須開発導線ではなく、後続 PLAN の候補機能・trace hint・CI summary として分類する ｜ P2 ｜ HM-01 / HM-02 ｜ |
| `FR-L1-44` | サービス⑥ リリース | 成果物の提供 | 要求 | ｜ **FR-L1-44** ｜ 途中導入 onboarding workflow (既存プロジェクトへの harness baseline 確立) ｜ PO directed (2026-05-28) ｜ 既存コード/docs/PLAN 資産一覧、`.helix/` 未初期化状態 ｜ `.helix/` 初期 baseline、既存資産 → state import レポート、onboarding 完了 gate 証跡。FR-L1-14 の前段 context、FR-L1-07 初回 import 引継ぎ、FR-L1-26 段階移行と組合せ ｜ P1 ｜ GD-01 (Onboarding) ｜ |
| `NFR-16` | — | 品質の保証 | 要求 | ｜ **NFR-16** ｜ **onboarding 互換性** — 既存プロジェクトへの途中導入時、既存 docs / コード / state の不整合を block せず段階移行 ｜ FR-L1-44 連動。既存資産を harness state に段階的に取り込み、初回 import でプロジェクトを止めない ｜ |

### サービス① 画面プロト／PoC（主 2件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `BR-04` | チケット・駆動モデル | 品質の保証 | 要求 | ｜ **BR-04** ｜ PoC / 検証成果を契約化してから本実装へ合流させ、PoC の独り歩き・知見の散逸を防ぐ ｜ concept P3 ｜ |
| `FR-L1-15` | チケット・駆動モデル | 品質の保証 | 要求 | ｜ **FR-L1-15** ｜ Discovery／PoCをScrum非内包の別軸case-driven modelとして、S0 hypothesis → S1 experiment plan → S2 poc → S3 verify → S4 decideで実行する ｜ case-driven-workflow ｜ 仮説定義、verify script、選択済みdevelopment style ｜ poc PLAN、verify script、confirmed/rejected/pivot判定、S4後のstyle接続 ｜ P0 ｜ PM-02 (case-driven 工程) / HM-05 ｜ |

### サービス④ 開発（主 2件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `FR-L1-02` | 枠：開発方式・接続・Gate | 品質の保証 | 要求 | ｜ **FR-L1-02** ｜ TDD 強制フロー (テストファースト順序厳守・実装先行禁止) ｜ L7-implementation ｜ L6 機能設計 (関数仕様 / クラス設計 / エッジケース) ｜ テストコード (red) → 本体実装 (green) ｜ P0 ｜ PM-02 (L7 工程) / HM-07 ｜ |
| `FR-L1-50` | サービス③ 設計、OS：検収（CI・テスト最適化・ベンチ） | 品質の保証 | 要求 | ｜ **FR-L1-50** ｜ DDD/TDD 厳格化 automation (domain boundary / invariant trace / Red-first evidence / oracle strength / integration GWT) ｜ PO directed 2026-06-09 / IMP-097..101 ｜ DDD/TDD rule SSoT、PLAN evidence、source/test docs、L7/L8 test-design ｜ doctor lint findings、workflow anchor、L7 oracle、L8 GWT compliance ｜ P1 ｜ HM-07 / PM-04 ｜ |

### サービス⑤ リファクタリング（主 1件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `FR-L1-25` | チケット・駆動モデル | 品質の保証 | 要求 | ｜ **FR-L1-25** ｜ Refactor ワークフロー (振る舞い不変を axis-11 regression で機械検証、kind=refactor) ｜ refactor-workflow ｜ 対象コード、既存テスト (保護網) ｜ refactor PLAN、module、テスト緑確認結果 ｜ P1 ｜ PM-02 ｜ |

### サービス⑥ リリース（主 1件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `HBR-P6` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求に技術の決定が混在 | ｜ **HBR-P6** ｜ **GitHub 運用自動化 + 配布/フルセットアップ** — gated push（全 gate PASS で authorized、raw push fail-close deny）/ PR クロスレビュー自動 / CI 失敗時 auto-fix-repush / タグ版管理。加えて、配布 tag/release pin から **1 コマンドで repo-local hooks・Claude/Codex adapter・state/memory/evidence/feedback・GitHub rules/checks の baseline を bootstrap**できる ｜ FR-L1-05/17（fail-close gate / CI-PR linkage）**のみ＝薄い**。配布/途中導入の接地は FR-L1-44 + technical L1 の GitHub-pull/tag-pin/setup 方針 ｜ 起草時の未定義評価は履歴であり、現在は要件v1.3 HR-FR-HYB-008／010と§4.6.1へ接続する。L2の利用要求として`helix setup project`による導入・更新を扱い、公開・tag・promotion・cutoverの承認を一般開発の自走へ転用しない ｜ |

### サービス⑦ 運用保守（仮置き）（主 1件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `FR-L1-16` | チケット・駆動モデル | 品質の保証 | 要求 | ｜ **FR-L1-16** ｜ Incidentワークフロー（本番障害: 検出 → hotfix → 即release → 収束 → current L1〜L12へbackfill） ｜ incident-workflow ｜ 本番障害alert／SLO逸脱 ｜ troubleshoot/recovery PLAN、postmortem、L12 feedback。Reverse fullback経由で選択済みdevelopment styleへ戻す ｜ P0 ｜ PM-03 (障害シグナル) / HM-06 ｜ |

### 部品：デザインHARNESS（仮置き）（主 2件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `FR-L1-29` | サービス① 画面プロト／PoC | 成果物の提供 | 要求 | ｜ **FR-L1-29** ｜ 画面設計ワークフロー (L2: IA → 画面一覧・遷移 → ワイヤーフレーム Low-Fi/High-Fi → モックアップ → ユーザビリティテスト → コンポーネント化) ｜ screen-design-workflow ｜ L1 要求定義 ｜ L2 成果物 (画面一覧 / 遷移図 / ワイヤーフレーム / UI 要素)、G2 モック凍結 ｜ P1 ｜ PM-02 (L2 工程進捗管理) ｜ |
| `FR-L1-30` | サービス④ 開発 | 成果物の提供 | 要求 | ｜ **FR-L1-30** ｜ フロントデザイン UX ワークフロー (L10: ビジュアルデザイン → デザイントークン SSOT → a11y → ビジュアル回帰 → UX 磨き上げ) ｜ frontend-design-workflow ｜ L9 総合テスト結果、L2 ワイヤーフレーム ｜ L10 成果物、デザイントークン定義、L11 への引き渡し ｜ P1 ｜ (L10 carry) ｜ |

### 部品：リサーチWorkflow（仮置き）（主 2件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `FR-L1-27` | コア | 品質の保証 | 要求 | ｜ **FR-L1-27** ｜ Research ワークフロー (技術調査 → 比較評価 → ADR、kind=research、generates=research-memo + ADR) ｜ research-workflow ｜ 調査課題、選択肢・制約 ｜ research-memo、ADR ｜ P1 ｜ PM-02 / GD-01 (ADR) ｜ |
| `HBR-P8` | OS：改善loop（学習・判断pack・memory） | 品質の保証 | 要求 | ｜ **HBR-P8** ｜ **外部連携・外部検索（原則）** — 外部（Web/docs/OSS/tool）を検索・参照し幻覚を外部照合で抑止、有益知見をスキル化して自己取込（自己拡張） ｜ （直接無し。FR-L1-09/05 が security guard 側のみ） ｜ **外部検索/web grounding・skillify ループ・sandbox/trust-boundary すべて FR 無し → ほぼ全部 net-new**（最大の空白） ｜ |

### 枠：開発方式・接続・Gate（主 11件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `BR-01` | コア | 品質の保証 | 要求 | ｜ **BR-01** ｜ 設計⇔実装⇔テストの整合を機械強制し、AI 委譲しても回帰が壊れず **1 案件を L0-L14 通しで回せる** ｜ concept P1 / 成功① ③ ｜ |
| `BR-07` | OS：検収（CI・テスト最適化・ベンチ） | 品質の保証 | 要求 | ｜ **BR-07** ｜ **デグレ禁止** — 上流変更が下流の対応 (テスト・trace) を伴わずに通ることを防ぎ、回帰の劣化を機械的に検知・block できる体制を持つ (3 軸 = 上流→下流 ID 追随 / balance_ratio regression / trace 切れ。具体機構は L3 FR・L4 送り) ｜ v2 BR-12 翻案 / BR-03・BR-05 強化 ｜ |
| `UX-01` | — | 品質の保証 | 要求 | ｜ **UX-01** ｜ 核となる価値 = process/safety/automation の 3 バランス (§0 と同一、要求として再掲) ｜ 価値ヒアリング ｜ |
| `FR-L1-03` | コア | 品質の保証 | 要求 | ｜ **FR-L1-03** ｜ V字 双方向 trace (設計 ⇔ テスト設計 4 artifact ペア確認) ｜ test-perspective-gate / db-integration ｜ 設計 PLAN + テスト設計 PLAN ｜ trace 整合レポート、抜け漏れ検出 ｜ P0 ｜ **PM-04 (直接)** / HM-07 ｜ |
| `FR-L1-13` | チケット・駆動モデル | 品質の保証 | 要求 | ｜ **FR-L1-13** ｜ L1〜L12ワークフロー（PLAN → pair-freeze → implement → trace-freeze → review → accept）を、`FULL_L1_L12_V`、`PRODUCTION_SCRUM`、`V_DESIGN_SCRUM_IMPLEMENTATION`の同列development styleで実行する ｜ automation-gate-map / L1〜L12全工程 ｜ 選択済みstyleと工程ゲート通過条件 ｜ 工程進行、正規6 V-pairのゲート証跡。`helix review --uncommitted`をtrace-freeze後／accept前の差分レビュー導線として扱い、未コミット差分・design／test／code trace・依存／重複／機能整合をevidenceへ残す ｜ P0 ｜ PM-01 / PM-02 ｜ |
| `FR-L1-21` | OS：検収（CI・テスト最適化・ベンチ） | 品質の保証 | 要求 | ｜ **FR-L1-21** ｜ テスト観点 W 字ゲート (設計項目へのテスト観点抜け検出 + レベル間重複検出を static で fail-close) ｜ test-perspective-gate ｜ 設計 PLAN + テスト設計 PLAN、テストレベル定義 ｜ 観点抜け一覧、重複観点一覧、pass/fail ｜ P1 ｜ PM-04 ｜ |
| `FR-L1-23` | — | 品質の保証 | 要求 | ｜ **FR-L1-23** ｜ `PRODUCTION_SCRUM`をFull Vと同格のdevelopment styleとして実行し、L3 freeze後の各価値sliceで正規L4/L5設計、L6/L7実装、対応right-arm evidenceを閉じる ｜ scrum-workflow ｜ sprint完成increment、選択済みstyle、slice境界 ｜ sliceごとの正規V-pair evidenceとsystem整合。Scrumを縮退VやPoC phaseとして扱わず、fullbackは既存asset導入時の別workflowに限定する ｜ P1 ｜ PM-02 ｜ |
| `FR-L1-28` | — | 品質の保証 | 要求 | ｜ **FR-L1-28** ｜ HELIX W 2段設計（Phase 1一般system＋Phase 2 agent昇華をL10で合流するspecialist workflow） ｜ two-stage-agent-design ｜ Phase 1/2各L9成果物 ｜ L10合流済み成果物、L11〜L12統合flow。development styleやcase-driven modelへ混ぜない ｜ P1 ｜ (L10 carry、画面紐付け薄い) ｜ |
| `NFR-07` | — | 品質の保証 | 要求 | ｜ **NFR-07** ｜ **実務で機能する完成度** — 部分 MVP でなく、成功条件 5 つを総合的に満たして初めて価値 (MVP は存在しない) ｜ 成功条件: ① L0-L14 通し実行 / ② **solo+AI roster の gate 回転（worker≠verifier の役割境界が回る）** / ③ AI 委譲で回帰なし / ④ ダッシュボード進捗可視 / ⑤ PoC 契約化合流（**solo 改訂 PLAN-L1-06**: ②「複数人 team」→「solo+AI roster」） ｜ |
| `NFR-14` | OS：管理（土台） | 省力化とコスト削減 | 要求 | ｜ **NFR-14** ｜ **human-as-residue 原則** — 機械チェック (machine) と AI レビュー (NFR-12) で潰せない判断のみを人間 (PO) に escalate。silent pass を避ける反面、人間の判断負荷も極小化。**Recovery 収束 audit trail** (A-52 audit I-04): Recovery モード発動時、stop-hook が認識訂正履歴を自動 dump し audit trail (`.helix/recovery_log/`) に収める (recovery-workflow.md §基本フロー、収束時間 SLO は L3 NFR-grade で確定) ｜ concept §audit-framework §17.4 / 全 gate で machine → AI → human の優先順、判断要点 + 根拠 + 推奨アクション を構造化提示。**gate fail-close 例外権 = PO のみ + audit 記録 (S-03/B6=b)**、bypass 件数 0 を KPI D-06 で計測 / recovery-workflow.md (認識訂正履歴) ｜ |
| `CN-1` | — | 品質の保証 | 要求 | ｜ CN-1 ｜ canonical 層は L1-L12。企画=L1、要求＋画面プロト=L2、要件定義・凍結=L3とする。本書のL1分類だけでL2要求・合意とL11受入の接続済みを主張しない ｜ l12-canonical directive ｜ |

### コア（主 7件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `UX-03` | サービス⑥ リリース、HELIX-Web：窓口・ダッシュボード | 省力化とコスト削減 | 要求 | ｜ **UX-03** ｜ gate/lint 失敗時に **next_action が明確**、CLI 出力が分かりやすい、オンボーディングが滑らか ｜ DX (PO 確定 2026-05-27) ｜ |
| `FR-L1-48` | — | 品質の保証 | 要求に技術の決定が混在 | ｜ **FR-L1-48** ｜ 内部資産 command の helix CLI subcommand 化 (dashboard / asset / builder 等) ｜ A-77 棚卸 / rebuild map W11/W12/W16 / BR-22 ｜ legacy CLI binaries 70 件 / docs/commands 19 件 ｜ `helix` subcommand 体系 ｜ P1 ｜ HM-02 ｜ |
| `NFR-01` | — | 品質の保証 | 要求に技術の決定が混在 | ｜ **NFR-01** ｜ **cross-platform native（HELIX solo narrow）** — Windows / macOS / Linux で動くが、HELIX solo では **「開発者本人の単一プラットフォームが第一級」**（team 全体での多 OS 同時第一級保証は不要）。移植性は goal として維持 ｜ Windows = PowerShell entrypoint / macOS・Linux = bash entrypoint。WSL2 は任意互換環境 (必須外)。Git Bash 依存は局所化。**handover 保持期間 30 日 archive + 90 日削除 (B7=a)** で長期 stability 担保。**solo 改訂 (PLAN-L1-06)**: Windows 第一級の team 前提を「本人環境第一級」へ narrow ｜ |
| `NFR-02` | サービス⑥ リリース | 品質の保証 | 要求 | ｜ **NFR-02** ｜ **更新性第一 (updatability)** — harness 本体・skill 等の更新 / 保守が容易であること (実現手段 = plugin / skill MCP 化 等は L4 ADR 送り) ｜ 工程別 skill 注入機構 (FR-L1-12) + PLAN 内蔵物原則 (§3.6) で skill 更新を局所化 ｜ |
| `NFR-04` | — | 品質の保証 | 要求に技術の決定が混在 | ｜ **NFR-04** ｜ 統制対象repoは**言語非依存（全種類）**。harnessはPython semantic core＋TypeScript/Node transactional boundary ｜ harnessの実装境界は統制対象projectの言語を制約しない ｜ |
| `NFR-15` | HELIX-Web：窓口・ダッシュボード | 品質の保証 | 要求に技術の決定が混在 | ｜ **NFR-15** ｜ **server-optional 拡張** — Phase A (local DB + local dashboard) は server 不要、Phase B で server sync を opt-in 追加可能。harness core は local-first を維持し server を必須条件にしない ｜ dashboard Phase A 必須 / Phase B 拡張 (BR-20 / FR-L1-20 / L3-L4 carry、PGlite + ElectricSQL ADR-002 候補)。**Claude ↔ Codex provider 間 handover** (FR-L1-42、F5=a) で多 provider 拡張は将来対応 (現状 Claude+Codex のみ) ｜ |
| `CN-2` | — | 品質の保証 | 技術の決定（ADR候補） | ｜ CN-2 ｜ Python semantic core / TS-Node transactional boundary の層別 authority を維持する（ADR-009/010） ｜ ADR-009/010 ｜ |

### チケット・駆動モデル（主 10件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `BR-05` | OS：管理（土台） | 品質の保証 | 要求 | ｜ **BR-05** ｜ 開発を PLAN 単位 + **phase-aware ID** でフェーズ管理し、**規約違反を機械検知できる** (起票規約 / lint 仕様は L3 FR・L5 送り) ｜ 本 session 確定 / requirements §1.10 A ｜ |
| `FR-L1-01` | OS：管理（土台） | 品質の保証 | 要求 | ｜ **FR-L1-01** ｜ 現行V字モデル（L1〜L12）全工程のPLAN起票・進捗管理機能。L0は層外authority anchorとする ｜ L0 charter / L1〜L12 current authority ｜ 工程・機能名・記載項目 ｜ PLANファイル（工程表＋実装計画内蔵） ｜ P0 ｜ PM-02 / PM-01 ｜ |
| `FR-L1-04` | — | 品質の保証 | 要求 | ｜ **FR-L1-04** ｜ PLAN kind による逸脱記録・ドキュメント生成計画 (kind + generates + requires) ｜ deviation-plan-map ｜ モード種別・成果物パス・依存 PLAN ｜ kind 付き PLAN レコード、generates 宣言 ｜ P0 ｜ PM-02 / HM-01 ｜ |
| `FR-L1-08` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求 | ｜ **FR-L1-08** ｜ 検出 → モード自動ルーティング (drift / 劣化 / 暴走 / 障害 → Recovery / Incident / Reverse / Refactor) ｜ detection-routing ｜ 検出シグナル ｜ モード発動トリガー、対応 kind PLAN 起票。※ extended: drive 自動判定 (FR-L1-41) を入力に加える ｜ P0 ｜ PM-01 (Mode ステータス) / HM-03 (drive 判定 配線) ｜ |
| `FR-L1-11` | — | 品質の保証 | 要求 | ｜ **FR-L1-11** ｜ 横断 4 機構 (interrupt / debt / drift-check / readiness) のモード進行非ブロック発動 ｜ cross-cutting-mechanisms ｜ 割り込みイベント / 負債台帳 / drift / 保留 ｜ sprint interrupted / debt-register / 乖離レポート / 後工程 PLAN 先送り ｜ P0 ｜ PM-03 (詰まり要因) / HM-07 ｜ |
| `FR-L1-24` | サービス④ 開発 | 品質の保証 | 要求 | ｜ **FR-L1-24** ｜ Add-feature ワークフロー (影響範囲差分追補、add-design / add-impl で既存 PLAN に requires 接続) ｜ add-feature-workflow ｜ 既存 PLAN、追加要求 ｜ add-design / add-impl PLAN、追補ドキュメント ｜ P1 ｜ PM-02 ｜ |
| `FR-L1-26` | サービス⑤ リファクタリング | 品質の保証 | 要求 | ｜ **FR-L1-26** ｜ Retrofit ワークフロー (影響評価 retrofit-matrix + 段階移行 config 更新、kind=retrofit) ｜ retrofit-workflow ｜ 移行対象構造・依存 ｜ retrofit-matrix、config、回帰テスト結果 ｜ P1 ｜ PM-02 ｜ |
| `FR-L1-40` | OS：管理（土台） | 品質の保証 | 要求に技術の決定が混在 | ｜ **FR-L1-40** ｜ drive 別 state 分離管理 (`.helix/drive/<drive>/`、skip_sub_doc 機械強制) ｜ PO directed (2026-05-28) ｜ drive 種別 (PLAN frontmatter)、L 層 ｜ drive 別 state 区画、skip_sub_doc 自動検証結果。FR-L1-06 (state 一元管理) の drive 軸 extension ｜ P1 ｜ HM-04 ｜ |
| `FR-L1-41` | — | 省力化とコスト削減 | 要求 | ｜ **FR-L1-41** ｜ drive 自動判定システム (PLAN/コード/依存から drive を自動分類 → orchestration_mode routing) ｜ PO directed (2026-05-28) ｜ PLAN 内容、コードファイル拡張子・パターン ｜ drive 判定結果、orchestration_mode routing 先。FR-L1-08 (mode 自動 routing) の drive 軸拡張 ｜ P1 ｜ HM-03 ｜ |
| `HBR-P0` | 枠：開発方式・接続・Gate | 品質の保証 | 要求 | ｜ **HBR-P0** ｜ **逸脱受け止めと選択済み開発スタイルへの収束** — workflowで逸脱・障害・暴走を受け止め、L3凍結時に合意したFull V／Production Scrum／V設計＋Scrum実装Hybridへ戻す。Discovery／PoCは独立したcase-driven routeとしてS4判断後だけ接続する。signalから開発スタイルを自動変更せず、lock／budget time-cap／Recoveryで暴走を停止する ｜ FR-L1-08/10/11/13/14/15/16/18/24/25/26/27/44は移管元。現行定義は要件v1.3 §4／§4.2 ｜ 旧Forward一律収束を置換。HR-FR-P0-01／02と対応するが、各styleへの返却・未解決route拒否・停止の実行証跡は別途検証する ｜ |

### OS：管理（土台）（主 35件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `FR-L1-06` | コア | 品質の保証 | 要求に技術の決定が混在 | ｜ **FR-L1-06** ｜ V モデル本線 state 一元管理 (plan_registry / code_catalog / contract_registry / skill_catalog 等 6 種) ｜ db-integration ｜ PLAN / コード / テスト / カバレッジ ｜ 成果物間の一致管理、drift 検証結果。※ extended: drive 別 state 区画 (FR-L1-40 と連動)、V モデル正本 DB の SSoT 強化 ｜ P0 ｜ **HM-04 (直接 DB 閲覧)** / HM-01 ｜ |
| `FR-L1-07` | — | 省力化とコスト削減 | 要求に技術の決定が混在 | ｜ **FR-L1-07** ｜ state 自動登録 (5 イベント hook: PLAN 起票 / コード変更 / Codex 実行 / ゲート通過 / 停止)。※ extended (PLAN-REVERSE-02 fullback、2026-06-02): **session-log hook (SessionStart/PostToolUse/Stop) が session イベントを fail-open で記録し PLAN 単位ダイジェストに圧縮** → continuation/audit/FR-L1-19 へ接続。state 自動登録 (fail-close) とは別系統の観測 hook (実装 src/runtime/session-log.ts、PLAN-L6-03/L7-01)。※ extended (PLAN-REVERSE-03 fullback、2026-06-02): session-log の facet として **forced-stop 検出** (SessionStart で dangling session を強制停止と推定 → 是正フィードバックのみ記録 → concept §2.6.1 `forced_stop`=`agent_runaway` 級 Recovery trigger、起票は人間 yes、実装 src/runtime/forced-stop.ts、PLAN-L6-04/L7-02) ｜ db-auto-registration ｜ hook イベント ｜ state 自動更新、手動登録漏れ排除、session ダイジェスト、forced-stop フィードバック ｜ P0 ｜ HM-04 / HM-03 (hook 配線) ｜ |
| `FR-L1-32` | — | 品質の保証 | 要求 | ｜ **FR-L1-32** ｜ フォルダ構成ルール (source process reference 文書 → 既存 docs/ への統合方針、tests 分散の役割明確化) ｜ folder-structure-review ｜ repo 文書群 ｜ docs/ への配置マッピング定義 ｜ P2 ｜ GD-01 (Architecture) ｜ |
| `FR-L1-35` | HELIX-Web：窓口・ダッシュボード | 品質の保証 | 要求 | ｜ **FR-L1-35** ｜ 基盤整備状況の可視化 (実装済み / 設計済み・実装未 / 未設計の 3 区分で検証・テスト・検出基盤を一覧表示) ｜ infra-readiness ｜ 各機構の実装状況 ｜ 整備状況一覧 (区分付き) ｜ P2 ｜ HM-01 ｜ |
| `FR-L1-51` | HELIX-Web：窓口・ダッシュボード | 成果物の提供 | 要求に技術の決定が混在 | ｜ **FR-L1-51** ｜ artifact progress color projection (実装中 / 依存未確認 / テスト済みを harness.db で赤黄緑に正規化) ｜ PLAN-L7-56 / PLAN-REVERSE-56 (2026-06-22) ｜ source artifact、covered-by test edge、impact_results、recovery PLAN ｜ `artifact_progress` projection、`helix progress artifacts` rows、linked test/dependency reason ｜ P1 ｜ HM-04 / PM-01 ｜ |
| `NFR-08` | 枠：開発方式・接続・Gate | 品質の保証 | 要求 | ｜ **NFR-08** ｜ **実装宣言の真実性** — 設計 doc が主張する CLI / file / schema field に実装状態列 (installed / partial / not-implemented) を必須化し、机上の「実装済」宣言を禁止する ｜ v2 BR-09 翻案。L3 以降の全設計 doc に `implementation_status` 列を必須化 (forward carry: `docs/migration/v2-import-ledger.md §2 F-6`) ｜ |
| `NFR-17` | OS：検収（CI・テスト最適化・ベンチ） | 安全と権限 | 要求 | ｜ **NFR-17** ｜ **統合セキュリティグレード (DevSecOps 5 段階 + OWASP Agentic Top 10 + EU AI Act Art.14 human oversight)** — 下記 3 観点を単一トレース ID 配下で機械保証し、G1-trace / KPI 計測 / L4 セキュリティ設計の親 NFR とする (A-54 audit 軸1 I-01: 観点のみで NFR-ID 不在 → trace 対象外だった漏れを解消) ｜ (a) 5 段階: Develop / Commit / Build / Deploy / Operate 各段の統制 (Build = SAST / SCA / Secret Scan、L0 §2.4) / (b) OWASP Agentic Top 10 (Prompt Injection / Insecure Tool Use 等、FR-L1-09) / (c) EU AI Act Art.14 (NFR-06 / NFR-14 / BR-02 で機械保証)。詳細グレードは L3 nfr-grade §5 + L4 セキュリティ設計 ｜ |
| `DAC-BR-001` | OS：検収（CI・テスト最適化・ベンチ） | 品質の保証 | 要求 | ｜ `DAC-BR-001` ｜ 開発者は、どの文書が現行正本で、どれが候補・参照・互換・履歴なのかを迷わず識別できる。 ｜ |
| `DAC-BR-002` | OS：検収（CI・テスト最適化・ベンチ） | 品質の保証 | 要求 | ｜ `DAC-BR-002` ｜ HELIXは、startup、agent instruction、generator、CLI、CI、setup template等のactive consumerが古いauthorityを読む事故をmerge前に止める。 ｜ |
| `DAC-BR-003` | OS：検収（CI・テスト最適化・ベンチ） | 品質の保証 | 要求 | ｜ `DAC-BR-003` ｜ 文書更新時に、生成物、digest、索引、consumer、V-pairへ必要な追従範囲を決定的に示す。 ｜ |
| `DAC-BR-004` | OS：検収（CI・テスト最適化・ベンチ） | 品質の保証 | 要求 | ｜ `DAC-BR-004` ｜ 文書の自動削除や意味変更をscannerへ許さず、所見を既存のRecovery、Redesign、Refactoring、Requirement Re-entryへ返す。 ｜ |
| `DAC-BR-005` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求 | ｜ `DAC-BR-005` ｜ 大量の既存負債を可視化しつつ、新規負債は即時拒否し、段階的にUNKNOWNをゼロへ収束できる。 ｜ |
| `DAC-FR-001` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求 | ｜ `DAC-FR-001` ｜ Git treeのexact HEADから対象artifactを列挙し、working treeや未追跡fileを正本inventoryへ混ぜない。 ｜ |
| `DAC-FR-002` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求 | ｜ `DAC-FR-002` ｜ artifact classとlifecycle dispositionを別軸で管理し、classごとに必要bindingを変える。 ｜ |
| `DAC-FR-003` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求 | ｜ `DAC-FR-003` ｜ authority bindingの参照先を再帰検査し、存在するが失効・互換・履歴化したtargetへのcurrent edgeを拒否する。 ｜ |
| `DAC-FR-004` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求 | ｜ `DAC-FR-004` ｜ artifactからconsumerへの逆向きgraphを構築し、startup reachabilityと生成伝播を明示する。 ｜ |
| `DAC-FR-005` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求 | ｜ `DAC-FR-005` ｜ source、generator、generated artifact、digest、consumerを同一provenance chainへ束縛する。 ｜ |
| `DAC-FR-006` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求 | ｜ `DAC-FR-006` ｜ authority claim、active consumer、startup到達性、生成伝播に基づきseverityとdispositionを決める。 ｜ |
| `DAC-FR-007` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求 | ｜ `DAC-FR-007` ｜ baseline debtと新規debtを分離し、new debt ratchetをfail-closeで適用する。 ｜ |
| `DAC-FR-008` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求 | ｜ `DAC-FR-008` ｜ findingをtyped taxonomyで発行し、曖昧な分類や修正先を推測しない。 ｜ |
| `DAC-FR-009` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求に技術の決定が混在 | ｜ `DAC-FR-009` ｜ #825の要求materialization監査、#1370のstartup projection、#206の旧surface是正と責務を重複させずAND条件で接続する。 ｜ |
| `DAC-FR-010` | OS：検収（CI・テスト最適化・ベンチ） | 省力化とコスト削減 | 要求 | ｜ `DAC-FR-010` ｜ Concept、requirements、README等のsemantic epochが変わったとき、旧epochのactive claimとconsumerを検出する。 ｜ |
| `DAC-NFR-001` | — | 品質の保証 | 要求 | ｜ `DAC-NFR-001` ｜ inventory、graph、findingは同一HEADと同一registry入力に対して決定的である。 ｜ |
| `DAC-NFR-002` | — | 品質の保証 | 要求 | ｜ `DAC-NFR-002` ｜ compatibility、historical、referenceの存在を欠陥扱いせず、active decision利用だけを拒否する。 ｜ |
| `DAC-NFR-003` | — | 品質の保証 | 要求 | ｜ `DAC-NFR-003` ｜ 全Markdownへ同じmetadataやRequirement IDを一律要求しない。 ｜ |
| `DAC-NFR-004` | — | 品質の保証 | 要求 | ｜ `DAC-NFR-004` ｜ GitHub、network、providerが無くてもrepo-local censusを再現できる。外部surfaceは別adapterで追加する。 ｜ |
| `DAC-NFR-005` | — | 品質の保証 | 要求 | ｜ `DAC-NFR-005` ｜ scannerは文書本文を書き換えず、削除せず、findingと修復候補だけを出力する。 ｜ |
| `HBR-P7` | OS：改善loop（学習・判断pack・memory） | 品質の保証 | 要求に技術の決定が混在 | ｜ **HBR-P7** ｜ **責務別の記録と共有可能な継続情報** — harness/projectのscopeを分離し、Claude/Codexから同じ正本revisionへ戻れるbounded recallを提供する。要件v1.3 HR-FR-HYB-005に従い、active memoryの内容を責務正本へ反映してからbody-free receiptへretireし、期限切れ・消費済み指示を再提示しない。要求の意味は指定文書・JSON、継続状態はDB projectionで確認する。provider delegation evidenceは委譲証拠でありprogress/continuation正本ではない ｜ FR-L1-19/36/38/46/47（learning/skill・model 評価 projection/roster/skill — memory は impl detail 止まり） ｜ 2 層 memory **architecture FR・cross-agent 共有 access・Glossary SSoT 無し** → architecture は **PLAN-L7-175/176 で充足済**、残=**Glossary SSoT 連結 / Codex SessionStart surface と Claude surface の同一 bounded recall 検証** ｜ |
| `HBR-P9` | コア | 品質の保証 | 要求に技術の決定が混在 | ｜ **HBR-P9** ｜ **HELIX DB 収束（trace/drift/coverage/contract）** — 成果物を台帳に収束し整合を機械追跡、**DB 未収束＝未完了**、影響範囲分析の資産保全 backbone ｜ FR-L1-03/04/06/07/18/20/33/35/40/49/51（trace/registry/hook/doctor/observability/inventory/readiness/drive-state/drift/progress-color） ｜ **「DB 未収束＝未完了」enforcement gate 無し**（green-command-digest が部分代替）。**cross-artifact relation graph FR・contract ledger 無し** ｜ |
| `HNFR-P8` | — | 安全と権限 | 要求 | ｜ **HNFR-P8** ｜ **外部連携セキュリティ（厳格・hard 制約）** — 外部連携は secret 漏洩防止/信頼境界/サンドボックス下でのみ。**不可逆操作の escalation 境界**＝本番/認証認可/決済/PII/secret/license/schema migration/破壊的データ/外部 API・infra 変更のみ人間へ戻す ｜ FR-L1-09（agent guard）/ FR-L1-05 / SECRET_PATTERN ｜ **sandbox/trust-boundary の機能要件化・escalation 境界の FR 化が無し**（CLAUDE.md 安全境界に prose で在るが FR 未昇格） ｜ |
| `BBG-BR01` | OS：推進（チケット発行・レーン・サブエージェント） | 省力化とコスト削減 | 要求 | BBG-BR01: HELIXを使う開発者・workerが、意味入力に集中でき、同じPLAN/PR定型欄や派生物を |
| `CN-3` | — | 品質の保証 | 要求 | ｜ CN-3 ｜ 新定義は要件正本（requirements v1.3 系列）へ載せてから runtime を移行する ｜ CLAUDE.md 本線 ｜ |
| `CN-4` | サービス⑥ リリース | 安全と権限 | 要求 | ｜ CN-4 ｜ release / tag / cutover / 自動 routing 有効化は action-binding approval 境界を維持 ｜ GitHub 自走運用ルール ｜ |
| `CN-5` | — | 安全と権限 | 要求 | ｜ CN-5 ｜ secret / credential / PII を assignment・event・evidence に書かない ｜ 安全境界 ｜ |
| `3L-BR-006` | — | 安全と権限 | 要求 | ### 3L-BR-006 HELIX規則を三層で強制する |

### OS：推進（チケット発行・レーン・サブエージェント）（主 36件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `BR-02` | 枠：開発方式・接続・Gate | 安全と権限 | 要求に技術の決定が混在 | ｜ **BR-02** ｜ **AI agent roster の責務境界**（人間 = PO 1 名 = L0/L1/L2-mock/L3 承認のみ、実装/レビュー/検証等 = 別ランタイム/別モデルの AI agent）が日常 PR で gate・レビュー・役割境界を無理なく回せる。creation と judgement を別系統に分離し（worker≠verifier）役割境界を機械強制する（NFR-05 の GitHub権限証跡 + P2 orchestration に連結） ｜ concept P2（AI agent 責務境界）/ 成功② / charter §3 自律境界 ｜ |
| `BR-03` | OS：検収（CI・テスト最適化・ベンチ） | 安全と権限 | 要求 | ｜ **BR-03** ｜ AI 実装を安全に委譲でき、既存の設計・テストを破壊的に改変しない (回帰検知を保つ) ｜ concept P4 / 成功③ ｜ |
| `BR-22` | OS：改善loop（学習・判断pack・memory） | 省力化とコスト削減 | 要求 | ｜ **BR-22** ｜ **自前 runtime 内部資産体系を持つ** — HELIX は自身が使う/対象に提供する **subagent roster / skill pack / command** を HELIX 用の正本資産として持ち、source-derived資産を「そのまま使う」のでなく **HELIX 用に再構築**する。guard (呼出統制) だけでなく資産そのものを統制対象とする (再構築の HOW = FR-L1-46〜49) ｜ A-77 PO 指摘 (前提抜け) / Recovery PLAN-RECOVERY-01 ｜ |
| `FR-L1-09` | OS：管理（土台） | 安全と権限 | 要求 | ｜ **FR-L1-09** ｜ AI エージェントガード (agent_mandatory 監査 / budget 上限 / gate fail-close / lock) ｜ recovery-workflow ｜ AI 操作ログ、役割定義 ｜ 逸脱警告・停止、audit ログ ｜ P0 ｜ **HM-05 (直接 agent guard audit)** / HM-03 ｜ |
| `FR-L1-10` | チケット・駆動モデル | 品質の保証 | 要求に技術の決定が混在 | ｜ **FR-L1-10** ｜ Recovery 収束フロー (再開ポイント確定 / 認識訂正履歴 / cutover_orchestrator ロールバック) ｜ recovery-workflow ｜ 暴走状態ログ、PLAN ｜ recovery-log (再開ポイント・認識訂正履歴)。※ extended (A-54 audit 軸1 C-04): recovery kind PLAN は `aim` 必須 + 7 必須セクション (事故記録 / 議論順序 / 認識訂正履歴 / 中間結論 / context 再構築 / 再開ポイント / 再発防止、L0 §6.2)。hotfix ブランチは postmortem doc 存在 + recovery PLAN 紐付けを Branch Protection で必須化 (L0 §6.3、FR-L1-17 連動)。※ extended (既存 source capability W17 突合、2026-06-04): lock / job queue / rollback / cutover rehearsal は Recovery 収束と本番・準本番の安全停止に属する release hardening 能力として扱い、既定開発経路では任意、Recovery / Incident / Deploy 系 PLAN では証跡化対象にする ｜ P0 ｜ **HM-06 (直接)** / PM-03 ｜ |
| `FR-L1-12` | 枠：開発方式・接続・Gate | 省力化とコスト削減 | 要求 | ｜ **FR-L1-12** ｜ L 単位 文脈注入 (スキル / ワークフロー / 必須 agent / 推奨 command / orchestration の 5 要素) ｜ layer-context-injection ｜ L 種別、vmodel-semantics.yaml 注入セット定義 ｜ AI の選択空間限定、迷い排除。※ extended: 工程別スキル推挙システム (FR-L1-37 と連動) を含める。skill_catalog の各 L エントリに「推挙スコア + 選定理由」フィールド。※ extended (A-54 audit 軸1 C-01/I-03): 5 要素のうち orchestration は `orchestration_mode` 5 値 enum {pm_lead / claude_judge / claude_judge_codex_impl / codex_impl_qa_verify / claude_design_impl} (L0 §2.6.4) を注入し、各値の「誰が判断し誰が実装するか」を確定。hybrid 不在時は L0 §2.1.2.1 縮退規則に従い silent fallback を禁止し不在を明示記録 (FR-L1-08 連動、判断ゲートは必ず execution mode を参照)。※ extended (既存 source capability W3/W4/W10 突合、2026-06-04): `helix task classify` / `helix task estimate` / `helix skill suggest` / `helix team run` を本機能の実行面として扱い、team run は frontier-reviewer / worker / fast-checker へ役割分離し、同一 runtime + model による作成・承認の兼任を禁止する ｜ P0 ｜ HM-05 (skill 注入タブ) / HM-02 ｜ |
| `FR-L1-31` | — | 省力化とコスト削減 | 要求に技術の決定が混在 | ｜ **FR-L1-31** ｜ コンテキスト管理・自動走行 (Claude+Codex セッションクリーナー PoC: context 0.70 で fresh 再起動、DB continuation 引き継ぎ) ｜ continuous-run-context-management ｜ context 使用率、`harness.db` continuation projection ｜ fresh Claude セッション、検証済み next action による作業継続、サブスク課金内維持 ｜ P2 ｜ PM-05 (Continuation) ｜ |
| `FR-L1-37` | — | 省力化とコスト削減 | 要求 | ｜ **FR-L1-37** ｜ モデル/エフォート推挙システム (task × drive × L 別 model + reasoning effort 動的選定) ｜ PO directed (2026-05-28) ｜ task 分類結果 (FR-L1-39)、drive、L 層、budget 残量 ｜ 推奨 model ID、reasoning effort 値、選定根拠ログ。FR-L1-12 (L 単位注入) の model 粒度拡張。FR-L1-39 上流 input。※ extended (既存 source capability W3/W4 突合、2026-06-04): `helix task estimate` と `helix skill suggest` の出力を入力に、frontier-reviewer / worker / fast-checker の capability class と reasoning effort を選定する ｜ P1 ｜ HM-08 ｜ |
| `FR-L1-39` | — | 省力化とコスト削減 | 要求 | ｜ **FR-L1-39** ｜ タスク難易度測定システム (規模 / 依存 / 不確実性 × drive 別スコアリング) ｜ PO directed (2026-05-28) ｜ PLAN 内容 (kind/generates/requires)、過去実行ログ、drive ｜ task_complexity_score (P0/P1/P2 分類)、推奨エフォート。FR-L1-37 上流。FR-L1-05 の事前 triage。※ extended (既存 source capability W3 突合、2026-06-04): `helix task classify --text/--plan/--diff` を公開I/Oとし、kind / drive / size / complexity / risk flags を構造化して plan lint・gate・skill suggest に渡す ｜ P1 ｜ HM-08 / HM-05 ｜ |
| `FR-L1-42` | — | 品質の保証 | 要求に技術の決定が混在 | ｜ **FR-L1-42** ｜ AI プロバイダ間引継ぎ連携 (Claude ↔ Codex のみ、context+PLAN+budget evidence) ｜ PO directed (2026-05-28) ｜ `.helix/handover/provider/CURRENT.json`、mode.yaml、invocation_log、PLAN 位置 ｜ provider evidence package の生成・状態検証、fresh セッション起動確認。session continuation SSoT にはせず FR-L1-31 の DB projection と型・保存先を分離する ｜ P1 ｜ HM-03 / PM-05 ｜ |
| `FR-L1-46` | — | 品質の保証 | 要求 | ｜ **FR-L1-46** ｜ subagent roster の HELIX 化 (capability class 化 / model family / guard 統合 / legacy source 前提除去) ｜ A-77 棚卸 (internal-asset-inventory.md) / BR-22 ｜ `.claude/agents/*.md`、guard allowlist ｜ HELIX 正本 roster (rename + harden 済)、legacy source 前提残存 0 ｜ P1 ｜ HM-02 ｜ |
| `FR-L1-47` | OS：改善loop（学習・判断pack・memory） | 省力化とコスト削減 | 要求 | ｜ **FR-L1-47** ｜ skill pack の HELIX curate (HELIX 版 SKILL_MAP / core-optional-drop 区分 / helix CLI trigger / legacy source 用語除去) ｜ A-77 棚卸 / BR-22 ｜ source skill reference、SKILL_MAP ｜ `docs/skills/*.md` skill pack + HELIX 版 SKILL_MAP ｜ P1 ｜ HM-02 ｜ |
| `NFR-03` | — | 品質の保証 | 要求に技術の決定が混在 | ｜ **NFR-03** ｜ **AI mode 非依存** — standalone / claude-only / codex-only / hybrid で動作。**Claude Code + Codex hybrid を主軸** ｜ mode は `.helix/mode.yaml` で管理。hybrid 不在時は claude-only として動作、Codex 委譲 / team run は要求しない ｜ |
| `HBR-P1` | チケット・駆動モデル | 省力化とコスト削減 | 要求 | ｜ **HBR-P1** ｜ **合意した範囲での連続自律走行** — L2要求の合意とL3凍結後、選択済み開発スタイルに従って作業・検証・復旧を継続する。resume条件、job-queue、累積budget／time-capを維持し、今版外作業はversion-upへ保全する。要求の意味変更、L11利用者受入、release／cutover等の人間判断を自動承認しない ｜ FR-L1-13/23/29/30/31/42（Forward/Scrum fullback/screen/context continuation/provider delegation evidence） ｜ **continuous-run engine 自体（heartbeat/job-queue/budget time-cap/無人再入）の FR 無し**。**version-up lifecycle（`version_target`/タグ）FR 無し** ｜ |
| `HBR-P2` | — | 省力化とコスト削減 | 要求に技術の決定が混在 | ｜ **HBR-P2** ｜ **オーケストレーション根本強化＋ループエンジニアリング** — サブエージェントを loop 単位（解釈→検証→計画→実行→検証→返却）で動かし orchestrator 統括、worker≠verifier 自己評価禁止、effort/budget 制御。Claude 視点だけでなく **Codex CLI / Codex IDE / hosted API tool surface でも同じ状態遷移・同じ判定**で動く ｜ FR-L1-09/12/28/37/39/41/46/48（guard/injection/W設計/model-effort/difficulty/drive-routing/roster/CLI） ｜ loop 構造・worker≠verifier 専用 FR は既存に無し → **PLAN-L7-175/176/177 で一部充足済**。Codex `spawn_agent` guard parity は PLAN-L7-139 continuation で direct spawn/bulk spawn を fail-close 化済み。typed agent↔tool request/response registry core は PLAN-L7-213 で doctor hard gate 化済み。loop 内 effort-budget 制御は PLAN-L7-214 で `tickLoopEffortBudget` + `tick` 接続済み。hosted/API preflight core は PLAN-L7-215 で `validateAdapterParityMap` / `requireHostedSurfacePreflight` + CLI JSON evidence 化済み ｜ |
| `HNFR-P5` | — | 省力化とコスト削減 | 要求 | ｜ **HNFR-P5** ｜ **コンテキスト効率** — 動的注入・可逆圧縮で「必要分だけ」渡し長時間無人自走を支える。閾値到達前にevent-firstでdurable appendし、DB projection成功後だけcontinuation checkpointを公開する。bounded memory breadcrumbからfresh sessionを再開する注入予算を持つ ｜ FR-L1-12/31/37/42/47（injection/context-continuation/effort/skill-pack） ｜ **injection budget（上限）・continuation projectionとmemory圧縮 contract が FR 無し**（FR-L1-31 は閾値 trigger のみ）。外部 delta=headroom CCR 可逆圧縮 ｜ |
| `HNFR-AC` | OS：管理（土台） | 品質の保証 | 要求に技術の決定が混在 | ｜ **HNFR-AC** ｜ **エージェント整合（同一記憶・同一規則）** — 全エージェントが単一規則セットに従い同一記憶（P7 2 層）を共有、per-agent 規則乖離・記憶サイロ禁止。`rule-drift` を全エージェントへ一般化し、Claude/Codex の tool 名・hook surface 差分を adapter map で吸収する ｜ rule-drift（Codex↔Claude adapter 乖離検査）/ FR-L1-46/47 / codex-hook-adapter doctor ｜ rule-drift は 2 adapter のみ。**全 agent への一般化 + 共有 memory access の機械強制 + Codex hosted API surface（repo hook 非強制）での明示 preflight が net-new** ｜ |
| `BR-1` | — | 省力化とコスト削減 | 要求 | ### BR-1: 開発フローの常時前進 |
| `BR-2` | OS：管理（土台） | 品質の保証 | 要求に技術の決定が混在 | ### BR-2: scope正本の択一と専用branch（PO決定 2026-08-20） |
| `BR-4` | — | 品質の保証 | 要求 | ### BR-4: provider の生死に依存しない継続性 |
| `BR-5` | — | 品質の保証 | 要求に技術の決定が混在 | ### BR-5: 既存 Codex／Claude 通知経路への搬送路統合（新規要求） |
| `BR-6` | — | 品質の保証 | 要求 | ### BR-6: 段階導入と既存経路の無劣化（構成別固定配車、PO 決定 2026-08-20） |
| `BR-8` | — | 品質の保証 | 要求 | ### BR-8: resident lane／native subagent／CLI workerの分離 |
| `SR-1` | チケット・駆動モデル、OS：管理（土台） | 品質の保証 | 要求に技術の決定が混在 | ｜ SR-1 ｜ assignment を scope 正本（Issue または PLAN）＋branch＋base SHA＋lease へ束縛する dispatch 契約 ｜ BR-2 ｜ RLO-FR-007〜010, §9（Issue 必須部の改版要） ｜ |
| `SR-2` | — | 安全と権限 | 要求 | ｜ SR-2 ｜ 一 branch 一 writer の排他（lease／fence、sub-agent は親内包） ｜ BR-2 ｜ RLO-INV-003, RLO-FR-008, 025〜026 ｜ |
| `SR-3` | — | 品質の保証 | 要求 | ｜ SR-3 ｜ runtime capability の typed 検出と optional provider 投影 ｜ BR-6 ｜ RLO-FR-004〜006 ｜ |
| `SR-4` | コア | 品質の保証 | 要求に技術の決定が混在 | ｜ SR-4 ｜ バックグラウンド control plane（daemon、heartbeat、event、checkpoint、復元） ｜ BR-4 ｜ RLO-FR-001〜003, 027〜029 ｜ |
| `SR-5` | OS：検収（CI・テスト最適化・ベンチ） | 品質の保証 | 要求 | ｜ SR-5 ｜ worker completion packet（typed field＋digest、自然言語非正本） ｜ BR-3 ｜ RLO-FR-012〜013, §13 ｜ |
| `SR-8` | — | 省力化とコスト削減 | 要求 | ｜ SR-8 ｜ WIP／review 在庫の backpressure（初期 worker 2・在庫 2） ｜ BR-1 ｜ RLO-FR-021〜024 ｜ |
| `SR-9` | — | 品質の保証 | 要求に技術の決定が混在 | ｜ SR-9 ｜ 既存通知経路 adapter（Codex 委譲 wrapper／Claude hook surface）への配線 ｜ BR-5 ｜ RLO-FR-014, 016（搬送路の実装面） ｜ |
| `SR-10` | — | 品質の保証 | 要求に技術の決定が混在 | ｜ SR-10 ｜ lane 単位 HEAD／checkpoint の多 branch 並行管理 ｜ BR-1, BR-4 ｜ §14.1, RLO-AC-024〜026 ｜ |
| `3L-BR-001` | — | 品質の保証 | 要求に技術の決定が混在 | ### 3L-BR-001 第一級レーンをexact 3件へ固定する |
| `3L-BR-002` | — | 省力化とコスト削減 | 要求に技術の決定が混在 | ### 3L-BR-002 Codexの管制余力を保護する |
| `3L-BR-003` | — | 省力化とコスト削減 | 要求に技術の決定が混在 | ### 3L-BR-003 Cursorを第一級cloud実装capacityとして常用する |
| `3L-BR-005` | — | 省力化とコスト削減 | 要求 | ### 3L-BR-005 異なる資源を別軸で管理する |
| `3L-BR-009` | — | 省力化とコスト削減 | 要求 | ### 3L-BR-009 実運用で資源分散を証明する |

### OS：検収（CI・テスト最適化・ベンチ）（主 27件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `BR-08` | — | 品質の保証 | 要求に技術の決定が混在 | ｜ **BR-08** ｜ **doc 品質の継続レビュー** — doc 品質専用の read-only reviewer (doc-reviewer、pmo-sonnet とは責務分離) を持ち、大規模 doc 改定・gate evidence 提出・pair freeze の前に必須召喚する ｜ v2 BR-11 翻案 ｜ |
| `FR-L1-05` | 枠：開発方式・接続・Gate | 省力化とコスト削減 | 要求に技術の決定が混在 | ｜ **FR-L1-05** ｜ 決定論的 static ゲート (fail-close、gate-checks.yaml、AI 不要) ｜ automation-gate-map ｜ 工程・成果物・数値品質 ｜ pass/fail 判定、ゲート証跡 (.helix/phase.yaml)。※ extended (既存 source capability W1/W2/W13 突合、2026-06-04): `helix gate <G>` は `helix status` の execution mode を参照し、判断ゲート (G0.5/G2/G4-G7/R4) では cross-agent / intra_runtime_subagent review 証跡を必須化する。gate / plan lint / vmodel lint / security guard の判定は runtime 差で分岐させず fail-close の単一ルールに寄せる ｜ P0 ｜ **PM-03 (直接)** / HM-07 ｜ |
| `FR-L1-17` | OS：管理（土台） | 品質の保証 | 要求に技術の決定が混在 | ｜ **FR-L1-17** ｜ CI/PR 連携 (ローカルゲート証跡 → CI 証跡検証 → branch protection PR 許可、ブランチ × モード対応) ｜ ci-pr-workflow ｜ ゲート証跡、push イベント ｜ PR 許可/拒否、CI チェック結果。※ extended (既存 source capability W8 突合、2026-06-04): `harness-check` は単一 Required Status Check とし、内部で branch-kind-check / commitlint / plan-lint / vmodel-lint / regression-test / poc-no-merge-guard / hotfix-postmortem-required / scrum-reverse-lint を branch type 別に適用する。commitlint / CODEOWNERS / branch protection は `helix setup` の team phase と接続する ｜ P0 ｜ PM-03 (gate 証跡) / HM-07 ｜ |
| `FR-L1-18` | — | 省力化とコスト削減 | 要求に技術の決定が混在 | ｜ **FR-L1-18** ｜ 横断検出 (依存漏れ / 契約漏れ / 接続欠損 / デグレ) を helix doctor で一括集約 ｜ cross-detection ｜ detector 全種実行結果 ｜ 横断検出レポート、モードルーティング先 ｜ P0 ｜ **HM-07 (直接 Doctor)** / PM-04 ｜ |
| `FR-L1-22` | 部品：デザインHARNESS | 品質の保証 | 要求 | ｜ **FR-L1-22** ｜ FE detector 5 軸 (mock-promotion / design-token-drift / a11y-regression / visual-regression / state-transition-drift) の決定論的判定 ｜ fe-detector-spec ｜ L2 モック / デザイントークン SSOT / スクリーンショット / 画面遷移定義 ｜ DetectorResult (pass/fail+詳細)、CI 証跡 ｜ P1 ｜ HM-07 (L2/L4 carry) ｜ |
| `FR-L1-38` | OS：改善loop（学習・判断pack・memory） | 省力化とコスト削減 | 要求に技術の決定が混在 | ｜ **FR-L1-38** ｜ model 評価システム (per-model success rate を model_runs + plan_registry から projection、opt-in) ｜ BR-21 / PLAN-L7-53 (2026-06-15 P2 carry から昇格) / PLAN-L7-57 / PLAN-L7-58 ｜ model_runs (run_id, runtime, model, role, drive, plan_id, started_at, completed_at, evidence_path)、plan_registry.status、.helix/config/model-opt-in.yaml (enabled:true で有効化)、runtime session telemetry ｜ model_evaluations projection (model PK、success_rate REAL 0.0-1.0、run_count INTEGER、success_count INTEGER、token/cost efficiency、evaluated_at TEXT)。opt-in 無効 = 0 行。cold-start = 0 行。未掲載 pricing は null のまま捏造しない ｜ P2 ｜ HM-08 ｜ |
| `FR-L1-45` | — | 品質の保証 | 要求に技術の決定が混在 | ｜ **FR-L1-45** ｜ doc-reviewer 必須召喚 (大規模 doc 改定 / gate evidence / pair freeze の品質観点 4 軸チェック、BR-08 派生) ｜ L3 back-propagation (A-47 → A-49) ｜ trigger event (doc 改定 / gate / pair freeze)、doc-reviewer role 定義 ｜ doc-reviewer 召喚記録 `.helix/audit/doc-reviews/<timestamp>.json`、品質観点 4 軸 (整合/網羅/一貫/明確) チェック結果、未召喚で gate (G1/G3/G7/G11) 通過禁止 (fail-close)、PO bypass = `HELIX_DOC_REVIEWER_BYPASS=1` + audit ｜ P0 ｜ PM-03 / HM-05 ｜ |
| `FR-L1-49` | — | 省力化とコスト削減 | 要求 | ｜ **FR-L1-49** ｜ 内部資産 drift lint (legacy absolute path残存 / docs-skills 空 / roster↔guard 整合の機械検証) ｜ A-77 棚卸 / IMP-033 rule engine / BR-22 ｜ roster / skill pack / guard allowlist ｜ drift 検出レポート (fail-close) ｜ P1 ｜ HM-07 ｜ |
| `NFR-05` | OS：管理（土台） | 品質の保証 | 要求に技術の決定が混在 | ｜ **NFR-05** ｜ **CI実行・PR許可・権限証跡をGitHubへ保存**する (具体実現手段は L3/L5 で確定) ｜ GHA workflow、branch protection、PR許可を対象HEAD・実行世代へ結び、監査可能な証拠として保存する。要求の意味・採否・合意は対象別のローカル要求正本を参照する。FR-L1-17 CI/PR連携 ｜ |
| `NFR-06` | 枠：開発方式・接続・Gate | 品質の保証 | 要求 | ｜ **NFR-06** ｜ **fail-close** — gate / lint は安全側に倒し、silent pass を許さない。**FE detector 5 軸決定論性適用** (A-52 audit I-03): drive=fe 時は fe-detector-spec.md の 5 軸 (mock-promotion / design-token-drift / a11y-regression / visual-regression / state-transition-drift、axis-15〜19) の pass 証跡を必須化し fail-close 対象とする (FR-L1-22 連動) ｜ subagent guard: blockOnFailure=true / gate-checks.yaml: exit 2 on fail / stdin 読取失敗も block / FE detector 5 軸 fail-close (drive=fe 時、fe-detector-spec.md) ｜ |
| `NFR-11` | — | 安全と権限 | 要求に技術の決定が混在 | ｜ **NFR-11** ｜ **GHA audit framework の役割分離** — GHA workflow と reviewer agent の権限・実行コンテキスト・出力責務を分離し、agent が gate の判定権限を持たない (machine 一次判定、AI/human は補完) ｜ concept §audit-framework §17 / FR-L1-09 AI ガード + NFR-12 連動 ｜ |
| `NFR-12` | — | 省力化とコスト削減 | 要求 | ｜ **NFR-12** ｜ **machine × AI 2 層補完機構** — Gate 判定・lint・detector は機械 (決定論的 static check) が一次、AI レビューが二次補完。両者の責務境界を明示し silent pass を防ぐ。**課金モード制約** (A-52 audit C-02): subscription / API credit の使い分けを harness が管理し、**サブスク内継続動作を default** とする (continuous-run-context-management.md §課金の制約、2026/6/15 Agent SDK クレジット分離対応)。context 0.70 閾値到達時の handover → fresh 再起動は NFR-15 server-optional と整合 ｜ concept §audit-framework §17 / FR-L1-05 (static gate) + FR-L1-19/20 (Learning Engine + 観測) で 2 層運用 / continuous-run-context-management.md (課金・context 閾値) ｜ |
| `NFR-13` | — | 品質の保証 | 要求に技術の決定が混在 | ｜ **NFR-13** ｜ **dev-local + CI 二重実行 (editor return loop)** — 同一 lint/gate を dev-local (editor PreToolUse / pre-commit) と CI (GHA harness-check) の両方で実行し、editor で fail なら commit 前に局所修正 loop に戻す。**機械検出目標** (A-52 audit I-01/I-02): cross-detection 全 axis (依存漏れ / 契約漏れ / 接続欠損 / デグレ) **0 件維持** + test-perspective-gate W字観点 (抜け / 重複) **0 件維持** を gate 通過条件に含む (cross-detection.md / test-perspective-gate.md 由来) ｜ concept §audit-framework §17.3 / FR-L1-17 (CI/PR) + `.claude/hooks/agent-guard.ts` (PreToolUse) の 2 段運用。**gate 通過率 ≥90% (KPI D-02、B5=b)** を運用目標、`.helix/gate_runs` で計測 / cross-detection.md / test-perspective-gate.md ｜ |
| `HBR-P3` | 枠：開発方式・接続・Gate | 品質の保証 | 要求 | ｜ **HBR-P3** ｜ **強い検証基盤（完全自動の安全要）** — pair_closure/片肺禁止/機械 vs AI 判定境界を機械強制、成果を外部真実に照合（held-out） ｜ FR-L1-02/03/05/21/22/25/45/50（TDD/trace/gate/W-gate/FE detector/refactor/doc-reviewer/DDD-TDD） ｜ **pair_closure 専用 FR・片肺禁止 standalone・機械 vs AI 境界の formalize 無し**。**external-truth grounding（held-out）FR 無し** ｜ |
| `HNFR-P3` | 枠：開発方式・接続・Gate | 品質の保証 | 要求 | ｜ **HNFR-P3** ｜ **検証の厳格性** — pair_closure/片肺禁止/自己評価禁止を fail-close 強制、合格主張は実証跡（test/command green）裏付け必須（prose 主張禁止、coding≠substance） ｜ review-evidence green_commands + green-command-digest（substance gate）/ FR-L1-05 ｜ **external-truth grounding の厳格性基準**（内部整合だけでなく外部照合）を非機能水準として未定義 ｜ |
| `BBG-BR02` | — | 安全と権限 | 要求 | BBG-BR02: 手作業削減によってscope、承認、証跡、独立レビューの真正性を下げないこと。 |
| `BR-3` | — | 安全と権限 | 要求 | ### BR-3: 検収独立性の維持 |
| `BR-7` | — | 省力化とコスト削減 | 要求 | ### BR-7: HELIX ベンチによる worker 適性評価（新規、PO 決定 2026-08-20） |
| `BR-9` | — | 省力化とコスト削減 | 要求 | ### BR-9: 検収内修復による収束速度の改善（追加要求、PO決定 2026-09-13） |
| `BR-10` | OS：管理（土台） | 省力化とコスト削減 | 要求 | ### BR-10: 成功証拠の工程間継承（追加要求、PO決定 2026-09-13） |
| `SR-6` | OS：推進（チケット発行・レーン・サブエージェント） | 安全と権限 | 要求 | ｜ SR-6 ｜ blind review dispatch と元 worker 差戻し循環 ｜ BR-3, BR-5 ｜ RLO-FR-014〜018 ｜ |
| `SR-7` | OS：管理（土台） | 品質の保証 | 要求に技術の決定が混在 | ｜ SR-7 ｜ merge admission（exact HEAD＋CI generation＋receipt＋DB convergenceの統合判定） ｜ BR-3 ｜ RLO-FR-019〜020 ｜ |
| `SR-11` | — | 省力化とコスト削減 | 要求 | ｜ SR-11 ｜ HELIX ベンチ実行・適性記録（モデル世代単位、FE/BE 実装適性を分離計測、設計適性を含む） ｜ BR-7 ｜ RLO-NFR-005, RLO-FR-031〜032 ｜ |
| `CN-6` | — | 安全と権限 | 要求に技術の決定が混在 | ｜ CN-6 ｜ main 直接 push 禁止・PR 経由・required check `harness-check` を変更しない ｜ branch protection ｜ |
| `3L-BR-004` | — | 安全と権限 | 要求に技術の決定が混在 | ### 3L-BR-004 Claudeの独立検収を維持する |
| `3L-BR-007` | — | 品質の保証 | 要求に技術の決定が混在 | ### 3L-BR-007 GitHub監査をHELIX capabilityとして所有する |
| `3L-BR-008` | OS：推進（チケット発行・レーン・サブエージェント） | 品質の保証 | 要求 | ### 3L-BR-008 モデル能力をrevision単位で段階認定する |

### OS：改善loop（学習・判断pack・memory）（仮置き）（主 17件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `BR-21` | — | 省力化とコスト削減 | 要求 | ## §11 BR-21 AI 実行成果の継続評価と改善サイクル |
| `D-01` | チケット・駆動モデル | 品質の保証 | 要求に技術の決定が混在 | ｜ **D-01** ｜ PLAN 起票数/sprint ｜ sprint 期間中に起票された PLAN 件数 ｜ ≥ 1 件/sprint ｜ `.helix/plan_registry/` / `helix plan list` ｜ |
| `D-02` | OS：検収（CI・テスト最適化・ベンチ） | 品質の保証 | 要求に技術の決定が混在 | ｜ **D-02** ｜ gate 通過率 ｜ gate pass 件数 / gate 総実行件数 × 100 ｜ ≥ 90 % ｜ `.helix/gate_runs/` / `helix gate log` ｜ |
| `D-03` | 枠：開発方式・接続・Gate | 品質の保証 | 要求に技術の決定が混在 | ｜ **D-03** ｜ V-model 順序遵守違反 ｜ 前工程未完了で後工程着手した検知件数 ｜ 0 件 ｜ `helix doctor` / `helix plan lint` ｜ |
| `D-04` | OS：検収（CI・テスト最適化・ベンチ） | 品質の保証 | 要求に技術の決定が混在 | ｜ **D-04** ｜ 回帰検出率 ｜ テストで検出した回帰件数 / 回帰発生総件数 × 100 ｜ ≥ 80 % ｜ CI gate / `helix trace` ｜ |
| `D-05` | 枠：開発方式・接続・Gate | 品質の保証 | 要求に技術の決定が混在 | ｜ **D-05** ｜ 4 artifact trace 整合率 ｜ trace 整合 PLAN 件数 / 全 PLAN 件数 × 100 ｜ ≥ 95 % ｜ `helix trace check` / `.helix/artifact/trace/` ｜ |
| `D-06` | OS：推進（チケット発行・レーン・サブエージェント） | 安全と権限 | 要求に技術の決定が混在 | ｜ **D-06** ｜ agent guard bypass 件数 ｜ `HELIX_ALLOW_RAW_AGENT=1` 実行件数 (audit 記録) ｜ 0 件 目標 (PO 承認時のみ許容) ｜ `.helix/audit/` / agent-guard log ｜ |
| `D-07` | OS：推進（チケット発行・レーン・サブエージェント） | 省力化とコスト削減 | 要求に技術の決定が混在 | ｜ **D-07** ｜ AI 委譲時間率 ｜ AI 委譲タスク工数 / 総開発工数 × 100 ｜ ≥ 70 % ｜ PLAN `drive:` 集計 / `helix status` ｜ |
| `D-08` | OS：検収（CI・テスト最適化・ベンチ） | 品質の保証 | 要求に技術の決定が混在 | ｜ **D-08** ｜ gate override 件数/sprint ｜ PO による gate fail-close 例外行使件数 ｜ ≤ 2 件/sprint ｜ `.helix/audit/` / gate override log ｜ |
| `D-09` | OS：推進（チケット発行・レーン・サブエージェント） | 品質の保証 | 要求に技術の決定が混在 | ｜ **D-09** ｜ continuation 再開成功率 ｜ next authority 実行成功件数 / continuation event 総件数 × 100 ｜ ≥ 95 % ｜ `harness.db` continuation projection / `helix status` ｜ |
| `FR-L1-19` | — | 省力化とコスト削減 | 要求 | ｜ **FR-L1-19** ｜ Learning Engine (成功実行 recipe 蓄積・頻出トラブル予防ルール化・スキル推薦改善・L 単位注入更新) ｜ learning-engine ｜ feedback_hook 5 軸 / skill 発火ログ / recovery-log / interrupt 履歴 / detector 結果 ｜ recipe (pattern_key 付き)、予防ルール、推薦精度改善。※ extended: スキル破棄・改修自動化を含む。skill_rating 閾値以下を廃止候補としてフラグ、削除は人間確認必須 (F6=a、CLAUDE.md destructive 禁止事項)。ログ型失敗/成功蓄積 (event-sourced recipe log) を recipe store 実装方式として明記。※ extended (A-54 audit 軸1 C-02): 「失敗を仕組みに変換」原則 (L0 §1.4) に基づき GitHub PR / GHA / job summary から失敗 event を pull し、失敗種別の集計・同種反復検出・再発防止 PLAN 自動提案へ接続する (本人/AI roster 共有 audit。failure_log local とは分離 L0 §8.5、escalation L0-L3 §8.3 の入力経路) ｜ P1 ｜ HM-08 / GD-01 ｜ |
| `FR-L1-20` | OS：管理（土台） | 品質の保証 | 要求 | ｜ **FR-L1-20** ｜ 観測・計測層 (5 hook で AI 実行を全量ログ化、発火 / トラブル / 精度 / 予算のメトリクス集約) ｜ observability-metrics ｜ AI 実行イベント全種 ｜ invocation_log / action_logs / gate_runs / accuracy_score / budget_events、dashboard メトリクス。※ extended: スキル使用パラメータ + モデルパラメータ + トラブル計測 + トークン/利用コスト の 4 軸を計測対象に追加 (L3 で AC 詳細化、F7=b に従い L1 はスコープ宣言のみ) ｜ P1 ｜ HM-05 / HM-08 ｜ |
| `FR-L1-34` | — | 省力化とコスト削減 | 要求に技術の決定が混在 | ｜ **FR-L1-34** ｜ スキル・コマンド穴の優先順位管理 (vmodel-semantics 注入セット定義 / helix recover / helix route / retrofit skill 等) ｜ integration-map ｜ 穴リスト、設計確定済み仕様 ｜ 優先順位付き実装タスクリスト ｜ P2 ｜ HM-02 ｜ |
| `FR-L1-36` | — | 省力化とコスト削減 | 要求に技術の決定が混在 | ｜ **FR-L1-36** ｜ スキル評価システム (per-skill rating / adoption / success / unused flag を skill_invocations + plan_registry から projection) ｜ BR-21 / PLAN-L7-53 (2026-06-15 P2 carry から昇格) ｜ skill_invocations.accepted=1 件、plan_registry.status、asOf timestamp ｜ skill_evaluations projection (skill_rating 0.0-1.0、adoption_count、success_count、unused_flag)。cold-start = 0 行。unused = 30 日以内発火なし。削除は人手のみ ｜ P2 ｜ HM-05 ｜ |
| `FR-L1-43` | サービス① 画面プロト／PoC | 品質の保証 | 要求に技術の決定が混在 | ｜ **FR-L1-43** ｜ PoC サクセス計測 (confirmed / rejected / pivot 件数から成功率を projection) ｜ BR-21 / PLAN-L7-53 (2026-06-15 P2 carry から昇格) ｜ plan_registry (kind=poc, decision_outcome∈{confirmed,rejected,pivot}) ｜ poc_evaluations projection (poc_success_rate 0.0-1.0、confirmed_count、rejected_count、pivot_count、total_count)。cold-start = 0 行。決定未記録 PoC は分母除外 ｜ P2 ｜ HM-08 ｜ |
| `HBR-P4` | サービス⑦ 運用保守 | 省力化とコスト削減 | 要求 | ｜ **HBR-P4** ｜ **自動保守システム** — drift/劣化/不整合を自動検出→**自動修復**、detection-routing 循環、学習ループ（recipe 蓄積/予防 gate 昇格）。根幹=P7 メモリ ｜ FR-L1-08/11/18/19/33/34/36/38/43/49（検出・学習・inventory・評価・drift-lint） ｜ **検出は厚いが「自動修復」FR 無し**。**learning→promote-to-gate/detector 専用 FR 無し**。劣化(flake/perf)検出未被覆 ｜ |
| `S-BR-001` | OS：推進（チケット発行・レーン・サブエージェント） | 省力化とコスト削減 | 要求 | ## S-BR-001 利用者価値 |

### HELIX-Web：窓口・ダッシュボード（仮置き）（主 17件）

| ID | 副の層 | 狙い | 区分 | 原文 |
|---|---|---|---|---|
| `BR-06` | OS：管理（土台） | 成果物の提供 | 要求 | ｜ **BR-06** ｜ 複数プロダクト / 案件の工程表・進捗を **リアルタイムに横断可視化する専用 UI ダッシュボード**を提供する (実装アーキテクチャ = サーバー / DB 形式は §5 → L2/L4) ｜ ダッシュボードヒアリング / 成功④ ｜ |
| `UX-02` | OS：管理（土台） | 成果物の提供 | 要求 | ｜ **UX-02** ｜ 工程表ダッシュボード (専用 UI) で PO と AI agent roster が進捗・詰まり・フェーズを把握できる (BR-06 の体験面) ｜ ダッシュボードヒアリング ｜ |
| `PM-01` | — | 成果物の提供 | 要求 | ｜ **PM-01** ｜ プロジェクト俯瞰ダッシュボード ｜ 4 階層プルダウン (俯瞰 / 工程 / 割当 / 詳細) による案件横断可視化 ｜ BR-06 / UX-02 / FR-L1-20 / FR-L1-08 ｜ |
| `PM-02` | — | 成果物の提供 | 要求 | ｜ **PM-02** ｜ 工程ビュー ｜ 工程単位 deep-dive (進捗・担当・詰まりのみ、URL `/project/<案件>/L<N>`) ｜ FR-L1-01 / FR-L1-04 ｜ |
| `PM-03` | — | 成果物の提供 | 要求 | ｜ **PM-03** ｜ Gate + 詰まり要因ビュー ｜ gate 通過状況 + 証跡 + next_action + 発生中トラブル横断 ｜ FR-L1-05 / UX-03 ｜ |
| `PM-04` | — | 成果物の提供 | 要求 | ｜ **PM-04** ｜ Trace ビュー ｜ 4 artifact 双方向 trace + V-model pair 状態統合 ｜ FR-L1-03 / FR-L1-18 / BR-07 ｜ |
| `PM-05` | — | 成果物の提供 | 要求に技術の決定が混在 | ｜ **PM-05** ｜ Continuation ビュー ｜ `harness.db` continuation projection 可視化、起動時 auto 表示 (S6=a) ｜ FR-L1-31 / FR-L1-01 ｜ |
| `PM-06` | — | 成果物の提供 | 要求 | ｜ **PM-06** ｜ 設計書ビューア ｜ L1-L12設計書ツリーと層外L0 charter anchorを Markdown/YAML/Mermaid 整形プレビュー (プロジェクト単位、共有用) ｜ BR-01 / BR-07 / FR-L1-01 / FR-L1-32 ｜ |
| `HM-01` | — | 成果物の提供 | 要求 | ｜ **HM-01** ｜ 機能一覧ビュー ｜ FR-L1 51 件 × implementation_status 可視化 (3 階層プルダウン) ｜ FR-L1-20 / FR-L1-29 ｜ |
| `HM-02` | — | 成果物の提供 | 要求 | ｜ **HM-02** ｜ カバレッジヒートマップビュー ｜ 機能可視化・弱点診断 (観点 8 × 軸 5 = 40 通り heat map) ｜ FR-L1-12 / BR-06 ｜ |
| `HM-03` | — | 成果物の提供 | 要求 | ｜ **HM-03** ｜ 配線図ビュー ｜ 静的アーキ + 動的エラー赤表示 (CC1=a 採用) ｜ FR-L1-07 / FR-L1-18 ｜ |
| `HM-04` | — | 成果物の提供 | 要求に技術の決定が混在 | ｜ **HM-04** ｜ データベース閲覧ビュー ｜ `.helix/` state 全 table + 整合性チェック結果 + artifact progress 赤黄緑 projection (CC1=a 採用) ｜ FR-L1-07 / FR-L1-18 / FR-L1-51 ｜ |
| `HM-05` | — | 成果物の提供 | 要求 | ｜ **HM-05** ｜ Audit / 実行ログビュー ｜ AI 実行ログ + agent guard 判定 + budget + skill 注入タブ統合 (S8=b) ｜ FR-L1-09 / FR-L1-20 / FR-L1-12 ｜ |
| `HM-06` | — | 成果物の提供 | 要求に技術の決定が混在 | ｜ **HM-06** ｜ Recovery ビュー ｜ 暴走対応 + 再開ポイント + CLI ロールバックコマンドコピー (S5=b) ｜ FR-L1-10 ｜ |
| `HM-07` | — | 成果物の提供 | 要求に技術の決定が混在 | ｜ **HM-07** ｜ Doctor 結果ビュー ｜ `helix doctor` 全量検出の構造化表示 ｜ FR-L1-18 / `helix doctor` ｜ |
| `HM-08` | OS：改善loop（学習・判断pack・memory） | 成果物の提供 | 要求 | ｜ **HM-08** ｜ AI 効果データ + Learning Engine ビュー ｜ BR-21 連動、skill/model 評価 + recipe 蓄積 + L3 forward carry ｜ BR-21 / FR-L1-12 ｜ |
| `GD-01` | — | 成果物の提供 | 要求 | ｜ **GD-01** ｜ ガイド/ドキュメント統合ビュー ｜ 左サイドナビ切替による静的知識ベース提供 ｜ UX-03 / FR-L1-29 / FR-L1-44 ｜ |

## 第3波：現行L2

### サービス⑥ リリース（主 3件）

| ID | 副の層 | 原文 |
|---|---|---|
| `HARNESS-L2-006` | — | ｜ HARNESS-L2-006 ｜ 外部利用者が、提供範囲・版・必要依存・導入条件を確認してHARNESSを利用できる ｜ 2026-09-14 PO指示、HBR-P6の提供物側条件 ｜ HELIX内部の管理対象や運用記録を持たなくても、明示された構成で提供機能を利用できる ｜ |
| `HARNESS-L2-007` | 枠：開発方式・接続・Gate | ｜ HARNESS-L2-007 ｜ 検証フェーズで複数のプロダクトを開発し、HELIX自身のプロジェクトにも適用した結果を含めて、HELIX-HARNESS製品群Version 1の完成を確認できる ｜ 2026-09-14 PO指示、Vision §3／§13 ｜ 性質の異なる対象で要求から受入・運用評価までの成立証拠を確認し、HELIX-Web等の展開前提を判定できる。Web自体の完成をVersion 1へ含めない ｜ |
| `HELIXOS-L2-006` | OS：管理（土台） | ｜ HELIXOS-L2-006 ｜ HARNESSの提供版を新規・既存プロジェクトへ導入し、更新・復旧できる ｜ HBR-P6、柱要求§2.7、v1.3 HR-FR-HYB-008 ｜ source・要求revision・artifactが辿れ、既存成果を壊さず導入できる ｜ |

### 部品：要求エンジン（仮置き）（主 1件）

| ID | 副の層 | 原文 |
|---|---|---|
| `HARNESS-L2-008` | サービス② 要件定義、部品：リサーチWorkflow | ｜ HARNESS-L2-008 ｜ Concept／企画L1、利用者指示と根拠から要求候補を形成し、単体・接続・構成体の対象粒度を分け、要求化漏れ・企画外追加・矛盾・重複・過剰解釈・対象違い・scope／non-goal逸脱・変更影響を提示して、人間の訂正と合意により要求へ収束できる ｜ 2026-09-15 PO発言記録、旧Requirement Engine／ADR-010 ｜ 意味密度の高い処理をPython coreとして複数製品へ適用でき、機能A、A→Bの接続、A–Cから成るシステムAの要求と成立を混同せず、出力を承認済み要求や操作権限へ自動昇格させない ｜ |

### 部品：Design Template・設計義務（仮置き）（主 1件）

| ID | 副の層 | 原文 |
|---|---|---|
| `HARNESS-L2-009` | サービス③ 設計 | ｜ HARNESS-L2-009 ｜ 要求kind、対象、構成、risk、domainに合うversioned Design Templateから必要な設計義務を導き、templateが必要とする要求入力の不足を質問・要求候補として上流へ戻せる ｜ 2026-09-15 PO指示、旧Design Template Registry ｜ 初期seedを参照して設計の恣意性を抑え、templateから要求意味を自動決定せず、unit・connection・composite固有の設計と検証へ接続できる ｜ |

### 部品：リサーチWorkflow（仮置き）（主 1件）

| ID | 副の層 | 原文 |
|---|---|---|
| `HELIXOS-L2-012` | OS：管理（土台） | ｜ HELIXOS-L2-012 ｜ 内部system情報と外部技術情報を、出典・revision・時点・取得範囲・欠落・適用条件付きで調査できる ｜ HELIX-OS編成案 §3／6 ｜ 内部事例を先に照合し、不足分だけを未信頼外部情報として取得する。秘密を送信せず、取得文の命令やpatchを実行せず、closed／mergedだけで解決済みにしない ｜ |

### 枠：開発方式・接続・Gate（主 5件）

| ID | 副の層 | 原文 |
|---|---|---|
| `HARNESS-L2-001` | コア | ｜ HARNESS-L2-001 ｜ 企画・要求・要件・設計・実装・検証をL1–L12と正規V-pairで構成できる ｜ v1.3 §2、HBR-P3 ｜ L2要求とL11受入、L3要件とL10総合検証を混同せず、各層の成果と対が分かる ｜ |
| `HARNESS-L2-002` | チケット・駆動モデル、サービス① 画面プロト／PoC | ｜ HARNESS-L2-002 ｜ 対象プロダクトに適した開発styleと工程の進め方を選べる ｜ HBR-P0／P1、v1.3 §4 ｜ Full V／Production Scrum／Hybridを区別し、Discovery／PoCを別軸で扱う ｜ |
| `HARNESS-L2-003` | チケット・駆動モデル、サービス① 画面プロト／PoC | ｜ HARNESS-L2-003 ｜ 工程の開始・凍結・差戻し・再開・完了に必要な条件を確認できる ｜ HBR-P0／P3、HNFR-P3 ｜ 必要な合意、対成果物、検証、未解決事項が明示され、実行成功だけで工程完了にならない ｜ |
| `HARNESS-L2-004` | コア、サービス③ 設計、サービス⑤ リファクタリング | ｜ HARNESS-L2-004 ｜ 要求から設計・テストへ対応を定義し、変更時の再検証範囲を決められる ｜ HBR-P3／P9 ｜ 上下流traceとV-pairの欠落を識別し、変更した要求が検証から落ちない ｜ |
| `HARNESS-L2-005` | OS：検収（CI・テスト最適化・ベンチ）、サービス④ 開発、サービス⑤ リファクタリング | ｜ HARNESS-L2-005 ｜ 言語・tool・実装方式が異なっても、layer・pair・変更種別・riskに応じた検証義務と証拠条件を適用できる ｜ HNFR-P3、v1.3 §4、新世代CI要求候補 ｜ 特定CIやWorkerに依存せず、対象revision、oracle、expected failure、証拠、有効期限、差戻し先を説明できる ｜ |

### OS：管理（土台）（主 6件）

| ID | 副の層 | 原文 |
|---|---|---|
| `HELIXOS-L2-001` | — | ｜ HELIXOS-L2-001 ｜ プロジェクトごとの企画・要求正本・採否・合意revisionと担当責務を確認できる ｜ HCV4-L2-001／002、HBR-P9 ｜ GitHubの状態から要求を推定せず、何に対する要求かと判断の出所が分かる ｜ |
| `HELIXOS-L2-002` | コア | ｜ HELIXOS-L2-002 ｜ プロジェクト群の要求から作業・実装・検証・提供・運用まで追跡し、欠落と競合を把握できる ｜ HCV4-L2-002／003、HBR-P3／P9 ｜ 未接続・未合意・未実装・未検証を区別し、部分成功で全体完了にならない ｜ |
| `HELIXOS-L2-003` | 枠：開発方式・接続・Gate | ｜ HELIXOS-L2-003 ｜ 共通統制と各プロダクトの開発方式の選択を区別し、変更影響を対象範囲へ伝播できる ｜ PO指摘、HCV4-L2-001／004／006、HBR-P0 ｜ あるプロダクトの方式変更が他プロダクトや共通統制を暗黙に変えない ｜ |
| `HELIXOS-L2-007` | OS：検収（CI・テスト最適化・ベンチ） | ｜ HELIXOS-L2-007 ｜ Worker・判断・操作・検証のログと証拠を保存し、対象プロジェクトと要求revisionから参照できる ｜ HBR-P7／P9、v1.3 HR-FR-HYB-006 ｜ 欠落・重複・古い証拠を識別し、ログの存在だけで承認・完了にしない ｜ |
| `HELIXOS-L2-010` | OS：推進（チケット発行・レーン・サブエージェント）、OS：検収（CI・テスト最適化・ベンチ）、チケット・駆動モデル | ｜ HELIXOS-L2-010 ｜ 管理・推進・検収を別責務として編成し、同じticketと因果関係を保ちながら双方向に調整できる ｜ HELIX-OS編成案 §1／2／6、2026-09-15 PO指示 ｜ 管理は目的・要求・制約・優先度・依存・資源・停止を推進へ渡す。推進はHARNESSのnormative工程語彙・順序を参照し、operational tag、mapping、composition、workflow instance生成規則を所有してticketと成果を生成する。管理は登録・統制し、検収はHARNESS contractへの収束を判断する。許可内の直接通信を保ち、固定モデル数や全通信の中央中継を要求しない ｜ |
| `HELIXOS-L2-013` | OS：検収（CI・テスト最適化・ベンチ）、OS：改善loop（学習・判断pack・memory） | ｜ HELIXOS-L2-013 ｜ 管理・推進・検収・Worker・crawler・CIを同じ仕事へ関連付け、要求からの欠落と失敗からの原因候補を双方向に診断して是正効果まで追跡できる ｜ HELIX-OS編成案 §5 ｜ 観測事実・AI仮説・承認・表示、未着手・観測停止・正常を区別する。管理自身も是正対象とし、自動writeせず、修正後の症状と退行を再観測する ｜ |

### OS：推進（チケット発行・レーン・サブエージェント）（主 2件）

| ID | 副の層 | 原文 |
|---|---|---|
| `HELIXOS-L2-004` | — | ｜ HELIXOS-L2-004 ｜ Workerへ作業を割り当てて実行・回収し、優先度・予算・依存・レビュー能力の制約内で進行を統制できる ｜ 常駐レーン・三社レーン要求、HBR-P1／P2 ｜ 実行担当の交代で責務・未完義務・累積制約が失われず、自己承認や二重割当を防ぐ ｜ |
| `HELIXOS-L2-009` | OS：管理（土台） | ｜ HELIXOS-L2-009 ｜ 中断・担当交代・障害後に、許可範囲内で継続・復旧できる ｜ HBR-P1／P2、HNFR-P5／P8 ｜ 累積予算・期限・未完義務を保持し、二重実行や範囲外操作を防ぐ ｜ |

### OS：検収（CI・テスト最適化・ベンチ）（主 2件）

| ID | 副の層 | 原文 |
|---|---|---|
| `HELIXOS-L2-008` | — | ｜ HELIXOS-L2-008 ｜ 承認済み上流revisionとHARNESSの検証契約から責務に合うCI profileを組み立て、隔離して実行・監視・回収・再開できる ｜ HBR-P6、v1.3 HR-FR-HYB-010、新世代CI要求候補 ｜ 上流意味reviewと下流CIを分け、未実行・失敗・中断・staleを区別し、旧CI greenで新世代未実行やreview・承認を代替しない ｜ |
| `HELIXOS-L2-011` | OS：推進（チケット発行・レーン・サブエージェント）、チケット・駆動モデル | ｜ HELIXOS-L2-011 ｜ ticket、設計、実差分、統合先、依存と承認済みHARNESS契約から、統合順序・統合単位・検証実行計画を導出し、実行結果とbase変更に応じて再計画できる ｜ HELIX-OS編成案 §1／4 ｜ HARNESSの検証義務を追加・削除せず、実際の統合候補で具体化する。必要CI欠落、影響不明、契約解釈不明、stale結果を拒否し、review、内容検証、merge admission、release、運用評価を分けて収束させる ｜ |

### OS：改善loop（学習・判断pack・memory）（仮置き）（主 1件）

| ID | 副の層 | 原文 |
|---|---|---|
| `HELIXOS-L2-005` | サービス⑦ 運用保守 | ｜ HELIXOS-L2-005 ｜ HARNESS自身への適用を含む観測・失敗・改善候補を、出典と適用範囲を保持して対象要求へ還流し、採択後の変更・再検証・効果確認まで継続できる ｜ HBR-P4／P7／P8、HCV4-L2-006 ｜ HARNESS自身と各productの改善を同じ機構で追跡し、経験を正本へ勝手に昇格させず、訂正・棄却・保留・失効と影響範囲を確認できる ｜ |

### HELIX-Web：窓口・ダッシュボード（仮置き）（主 9件）

| ID | 副の層 | 原文 |
|---|---|---|
| `HELIXWEB-L2-001` | — | ｜ HELIXWEB-L2-001 ｜ 初期Connector構想 ｜ §6.1、U08／09 ｜ 利用者がWebから自分の許可された開発環境を選び、対象プロジェクトの操作と進行をダッシュボードで確認できる。全コード・計算資源をSaaSへ移すことを必須にしない ｜ |
| `HELIXWEB-L2-002` | サービス⑥ リリース | ｜ HELIXWEB-L2-002 ｜ 初期Connector構想 ｜ §3.2、§6.1、§10 ｜ 必要な開発能力の提供版を選び、Connectorへの導入・互換性・更新・撤去と結果を確認できる。Connectorに開発engineを重複実装しない ｜ |
| `HELIXWEB-L2-003` | HELIX-Web-OS：Webサービスの運転 | ｜ HELIXWEB-L2-003 ｜ 初期Connector構想 ｜ §6.2、§10、§13 ｜ 長時間jobの実行・切断・取消・再開・終端と証拠を確認できる。結果不明の副作用を無条件に再実行しない ｜ |
| `HELIXWEB-L2-004` | HELIX-Web-OS：Webサービスの運転 | ｜ HELIXWEB-L2-004 ｜ 接続前に方式確定 ｜ §6.2、O03／04 ｜ 対応するprovider経路と利用条件、利用者環境から返送する情報の範囲を確認できる。未確認のログイン再利用や経路を対応済みと表示しない ｜ |
| `HELIXWEB-L2-005` | サービス⑦ 運用保守 | ｜ HELIXWEB-L2-005 ｜ 操作別に段階採択 ｜ §7、U17、O05 ｜ 何を変更し、何を許可し、何を受け入れるかを自分で判断し、検収済み範囲の保守・改修を行える。残る専門判断を確認できる ｜ |
| `HELIXWEB-L2-006` | — | ｜ HELIXWEB-L2-006 ｜ Web3の将来構想 ｜ §6.3、U14、O08 ｜ 適用範囲・版・評価証拠を確認したHDAを開発補助に利用できる。学習と分散推論の提供責務を分け、応答を独立検収済みとみなさない ｜ |
| `HELIXWEB-L2-007` | — | ｜ HELIXWEB-L2-007 ｜ 能力接続時に採択 ｜ §10、§11 ｜ Webが採用する開発能力・Connector・モデル・接続契約の構成版を確認できる。Webの変更で無関係なHARNESSやモデルを一斉更新しない ｜ |
| `HELIXWEB-L2-008` | OS：改善loop（学習・判断pack・memory） | ｜ HELIXWEB-L2-008 ｜ 改善還流時に採択 ｜ §10、§11 学習とデータ利用 ｜ Web-OSのservice log・telemetry・利用結果をどの目的・範囲でHELIX-OSの改善へ渡すかを確認できる。サービス利用をログexportや横断学習への包括同意とみなさない ｜ |
| `HELIXWEB-L2-009` | サービス⑥ リリース | ｜ HELIXWEB-L2-009 ｜ 展開前に必須 ｜ §3、§13、2026-09-14 PO指示 ｜ 複数プロダクトの開発検証とHELIX自身への適用を含む、HELIX-HARNESS製品群Version 1の完成証拠を確認した後にHELIX-Webを展開できる。Webの完成をVersion 1へ算入せず、HARNESS未完成のまま展開しない ｜ |

### HELIX-Web-OS：Webサービスの運転（主 6件）

| ID | 副の層 | 原文 |
|---|---|---|
| `HELIXWEBOS-L2-001` | — | ｜ HELIXWEBOS-L2-001 ｜ tenant・利用者・project・environmentごとにauthority、resource、state、evidenceを隔離できる ｜ 一利用者の資格・job・data・結果が別scopeへ流れず、HELIX-OS内部stateをservice authorityとして共有しない ｜ |
| `HELIXWEBOS-L2-002` | サービス⑥ リリース | ｜ HELIXWEBOS-L2-002 ｜ 適格なHARNESS能力をConnectorへ導入・更新・撤去し、Web版・Connector版・能力版・接続契約を追跡できる ｜ Connectorに開発engineを重複実装せず、不適格版や更新失敗を利用可能と表示しない ｜ |
| `HELIXWEBOS-L2-003` | — | ｜ HELIXWEBOS-L2-003 ｜ 長時間jobの受付、配信、進行、切断、取消、再開、終端、結果不明を同じjob identityで管理できる ｜ 再送・障害・再接続で副作用を二重実行せず、期限・予算・許可・未完義務を失わない ｜ |
| `HELIXWEBOS-L2-004` | — | ｜ HELIXWEBOS-L2-004 ｜ 認証、provider経路、credential利用、network／data scope、利用者環境から返送する情報を操作ごとに制御できる ｜ 未確認経路、期限切れ権限、秘密送信、範囲外data返送を拒否し、サービス利用を横断学習同意へ変換しない ｜ |
| `HELIXWEBOS-L2-005` | HELIX-Web：窓口・ダッシュボード | ｜ HELIXWEBOS-L2-005 ｜ jobの原eventと証拠から、HELIX-Webのダッシュボードへ進行・状態・成果・停止・再開をrevision付きで投影できる ｜ projection欠落・遅延・stale・conflict・結果不明を成功表示せず、画面表示を実行事実や受入の正本にしない ｜ |
| `HELIXWEBOS-L2-006` | サービス⑥ リリース、サービス⑦ 運用保守、OS：改善loop（学習・判断pack・memory） | ｜ HELIXWEBOS-L2-006 ｜ service release、deployment、monitoring、incident、backup、restore、rollback、maintenanceを対象版と証拠へ束縛し、許可されたservice log・telemetry・利用結果をHELIX-OSの改善入口へ渡せる ｜ exportごとに出典、tenant／data scope、目的、同意、revision、時点、欠測、保持条件を示す。配備成功、復旧成功、恒久修復、Web利用者受入を分け、運用結果からHARNESS・Web・OS要求を直接変更しない ｜ |
