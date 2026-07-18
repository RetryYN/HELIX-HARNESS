# NFR 正本化・測定契約 改善提案の検証記録（2026-07-19）

status: report（監査記録、confirmed 要件ではない）
scope: 外部レビュー（PO 提示、2026-07-19）による「検証項目追加より NFR 正本と測定契約の整理が先」
という改善提案 9 項目について、リポジトリ実物と突き合わせた事実確認と評価を記録する。
related: docs/governance/hybrid-engine-requirements-extraction-gap-audit-2026-07-19.md（抽出漏れ監査、補完関係）

## 1. 前提事実の検証結果

| # | レビューの主張 | 検証結果 | 根拠 |
|---|---|---|---|
| V-01 | NFR が P3/P5/P8/AC 等に分散し統合台帳が無い | **正確**。`nfr-grade.md` は存在するが status=placeholder の「projection（散在閾値の一覧化）」であり、§0 が「本書は新しい閾値を発明しない。閾値変更は L1/L3 正本へ back-merge」と自認。測定コマンド・測定環境・evidence path・owner・baseline/target/hard limit 列は無い | docs/design/helix/L3-requirements/nfr-grade.md:7,20-26 |
| V-02 | L3 に実装方式・閾値が直接混入 | **正確**（抽出漏れ監査時に検証済み）。MicroVM/gVisor（HR-FR-P8-03）、Rulesets/Merge Queue（HR-FR-P6-01）、confidence 0.75（HR-FR-P6-05）、fast 120s/default 600s/full 1800s（HR-NFR-P5-03）が L1/L3 本文に実在 | pillar-functional-requirements.md:141,145,151,165 |
| V-03 | 現行 NFR 分類は検証・context・security・agent consistency 中心 | **概ね正確**。nfr-grade §1 の分類 = 実装精度 / context 効率 / GitHub・配布 / memory・glossary / security・approval / adapter 一貫性の 6 種。信頼性・可用性・性能・回復性・可観測性等の標準特性は独立カテゴリとして存在しない | nfr-grade.md §1 |
| V-04 | 470MB harness.db ＋並列 commit 競合で SessionStart が 1 時間以上ハングした監査記録がある | **記録は実在、ただし再現性に留保**。harness memory に「SessionStart フック（bun src/cli.ts session start、.helix/harness.db が 470MB）で 1 時間以上ハング」の記録あり。一方、同 memory に「Terra が独立再現に失敗（PRAGMA busy_timeout=…）」の後続記録もあり、確定的な単一根本原因は未同定。**性能・同時実行・回復性 NFR が不在という指摘自体は再現性と無関係に成立** | .helix/memory/harness.jsonl（SessionStart ハング関連 3 エントリ） |
| V-05 | P4 に metric event → 改善候補変換の要求が既にある | **正確**。HR-FR-P4-03（confirmed）「実装精度、レビュー指摘、再作業、テスト時間、flake、デグレ検出を metric event として収集し、改善候補へ変換」＋ HAC-P4-03a。層別 trend は HR-FR-P9-03 | pillar-functional-requirements.md:140,155,211 |
| V-06 | Property-based / mutation / fuzz / soak / fault injection 等の手法が第一級でない | **正確**。docs/design・docs/test-design 全域 grep でこれら手法の体系的定義はヒットなし（"mutation" の一致はすべて DB mutation の意）。continuation crash recovery は既存定義が厚いという評価も既存監査と整合 | grep 全域走査 |
| V-07 | Infinity Loop 115 件は NFR 込みで draft・active 0 | **正確**（前回検証済み）。全行 `pending:source-atom-link` / `draft-authority-pending`、active 0/115 | infinity-loop-requirement-definition-ledger.md §2 |

## 2. 提案 9 項目の評価

| # | 提案 | 評価 | 補足 |
|---|---|---|---|
| P-01 | NFR 統合台帳（nfr-registry.yaml / DB 台帳、測定契約 11 属性） | **妥当・最優先**。nfr-grade.md（placeholder projection）の後継として正本化するのが自然。HAT 対応が既に存在するため台帳化コストは低い | 既存 `requirements-binding` 機構（src/config/）と接続可能 |
| P-02 | 要件と実装方式の分離（L1 能力 / L3 観測可能動作 / ADR 技術選定 / policy / runtime profile） | **妥当**。前回レビュー指摘（層の再配置未実施）と同一方向。L1 GAP 列は「実装手段として明記し L3 判断材料に」と自覚的であり、無自覚な混入ではなく再配置作業が未実施という性格 | v1.3 起草・L0 改訂と同一トランザクションで行うと効率的 |
| P-03 | NFR 分類の標準化（14 標準特性＋AI 固有 7 特性） | **妥当**。特に AI 固有特性（判断再現性、worker/verifier 独立性、grounding 率、loop 停止性、コスト、provider 縮退、memory 汚染耐性）は既存実装（cross-verifier、loop-stop-rules、loop-effort-budget、memory-hygiene）が先行しており、要件側が追いついていない状態 | 抽出漏れ監査 G-05/G-06/G-07 と重なる |
| P-04 | DB 性能・同時実行・長時間運転 NFR | **妥当・実害根拠あり**。V-04 のハング記録が動機。p95/p99、lock 待機上限、busy timeout 縮退、projection rebuild 時間、vacuum/archive 方針、soak はいずれも現行要件に不在 | 既存 `db hygiene` / `state-hygiene` 実装はあるが要件 ID なし |
| P-05 | 故障注入テストの第一級化（13 シナリオ） | **妥当**。continuation crash recovery の既存パターンを全主要サブシステム（gate / approval / cutover / projection / GitHub 連携）へ一般化する方向 | |
| P-06 | テスト手法拡張（PBT / mutation / model-based state-machine / differential / race / fuzz / soak / snapshot compat） | **妥当**。特に state-machine testing は Gate・状態遷移・approval・Reverse・cutover と相性が良いという評価に同意。ただし P-01〜P-04 の後段 | |
| P-07 | 閾値の 3 段階化（target / error budget / hard limit） | **妥当**。現行は単一値直書き（V-02）。3 段階化は P-01 台帳のスキーマ属性として実装するのが自然 | |
| P-08 | NFR 実測値の時系列保存と P4 metric との join | **妥当**。HR-FR-P4-03 / P9-03（confirmed）が既に半分を要求済みであり、NFR 台帳との join は既存要求の延長。全くの新規要求ではない | token-tracker / metrics CLI が実装先行 |
| P-09 | 115 件 draft の NFR 正本化（7 段階: source atom authority → freeze） | **妥当・ただし blocker あり**。source atom authority 接続は前身 2 リポジトリの authority receipt 0/2 BLOCKED が先行 blocker。PO 承認・freeze は PO 専権境界 | 前回レビュー「要件定義完了 7 条件」の条件 4/6 と同一 |

## 3. 総合評価

- 「検証項目を増やすより NFR 正本と測定契約の整理が先」という優先判断は、V-01〜V-07 の事実関係
  および既存 2 監査（抽出漏れ監査、要件正本化レビュー）と整合し、**妥当**。
- 優先実装案 4 点（①NFR 統合台帳、②DB 性能・同時実行・長時間運転 NFR、③故障注入/soak/race、
  ④115 件 draft の NFR 正本化）は、①→②→③が AI 側で起草可能、④は authority receipt blocker 解消と
  PO 承認境界を含むため最後。順序に同意。
- 留意点: V-04 のハング事象は独立再現に失敗した記録があるため、P-04 の閾値設計時は
  「事象の再現」ではなく「NFR 契約の不在」を根拠として起草し、実測 baseline は P-08 の
  時系列収集開始後に確定させるべき。

## 監査証跡

- nfr-grade.md 全文（placeholder 宣言、§1 分類表、§2 閾値 25 行）
- pillar-requirements.md / pillar-functional-requirements.md の該当行（V-02, V-05）
- .helix/memory/harness.jsonl の SessionStart ハング関連エントリ（470MB、busy_timeout、独立再現失敗）
- docs/design/ / docs/test-design/ 全域 grep（soak / fault injection / property-based / mutation）
- infinity-loop-requirement-definition-ledger.md §2（active 0/115、前回監査から引用）
