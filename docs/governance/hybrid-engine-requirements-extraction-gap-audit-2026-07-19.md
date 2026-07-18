# ハイブリッドエンジン要件抽出漏れ監査（2026-07-19）

status: report（監査記録、confirmed 要件ではない）
scope: Vモデル L1-L12 エンジン＋スクラム（S0-S4）ハイブリッドエンジンに対し、既存リポジトリ資産
（src/ 200 capability・CLI 61 コマンド群・lint/doctor 約140 gate・hooks・agents・skills）から
要件定義（docs/design/helix/L1-requirements/ + L3-requirements/、約470 ID）への抽出漏れを全数照合した結果。
method: 実資産棚卸し・要件/ledger 列挙・14 疑義クラスタ個別照合の 3 パス（pmo-sonnet 並列委譲、Grep+Read 照合）。

## 1. 完全な抽出漏れ（対応する要件 ID が存在しない）

| # | 対象 | 実資産 | 照合結果 |
|---|---|---|---|
| G-01 | closure authority サブシステム | `src/state-db/closure-*`（backfill / convergence-epoch / auto-approval / evidence-materialization / terminal-boundaries）、CLI closure 系一式、`docs/governance/closure-authority-registry.yaml` | L1/L3 で "closure authority" 該当 ID 0 件。関連概念（pair_closure、HIL-FR-07 Closure Gate〔draft〕、HAC-P6-01b）はあるが「誰が close 権限を持つかの registry・authority 単位の承認記録・convergence epoch」は要件に未降下。**野良実装のまま要件不在の最重要 trace gap** |
| G-02 | MCP profile カタログ | CLI `mcp profile list/probe/safety/config`（src/cli.ts） | L1/L3 全体で "MCP" / "Model Context Protocol" ヒット 0 件 |

## 2. 部分的な抽出（概念のみ / verb 欠落 / status=proposed・draft 止まり）

| # | 対象 | 抽出済み部分 | 欠落部分 |
|---|---|---|---|
| G-03 | Scrum S0–S4 工程そのもの | HR-FR-P1-03（confirmed、「Scrum/PoC への分割」の抽象 1 件）、GH 要件での前提言及 | S0〜S4 の段階定義、`decideDiscoveryS4` / `routeScrumFullback`（src/workflow/contracts.ts）、`scrum-reverse` / `s4-decision-readiness` gate、CLI `s4 decision-packet` に対応する FR ID が無い。段階定義は CLAUDE.md 工程節にのみ存在。**ハイブリッドエンジン片翼の正本欠落** |
| G-04 | hybrid 多ランタイム git レーン協調 | GH-FR-005（proposed）の一文のみ | CLI `lane status`、work-guard / git-command-guard の foreign-edit override・one-shot marker・`guard_override_transactions` DB 監査の専用 FR 無し |
| G-05 | memory v2 の consume / deliver / takeover | write/list/surface（orchestration-memory.md confirmed）、compaction（HIL-FR-10 draft）、bounded recall（HR-FR-P7-01 confirmed） | one-shot 消費・expires-at 付き takeover の verb・ライフサイクル FR 無し |
| G-06 | feedback lifecycle 管理 | HLX-FR-12（confirmed、improvement backlog への送付概念） | `feedback_events` の SessionStart surface、CLI feedback 系（intake/classify/ack/pending/reverse-candidates）の専用 FR 無し |
| G-07 | skill 推薦・効果測定 | skillify→registry（HR-FR-P8-02 confirmed） | `skill suggest` 推薦ロジック・efficacy/telemetry 測定は HIL-FR-14（draft）断片のみ |
| G-08 | 配布 publish/sync/package | `helix setup project` bootstrap（HR-FR-P6-03 confirmed） | HELIX-HARNESS-OS への distribution plan/sync/package の FR 無し（PLAN-M-02 待ち言及のみ） |
| G-09 | VSCode 拡張 surface | visualization 用途 HR-FR-VIS-01..07（confirmed） | `vscode manifest/find` 等の独立 FR 無し。L3 自身が「下流実装 frontier」と明記 |
| G-10 | GitHub 自走運用 | GH-FR-001..016 / GH-NFR / GH-AC で網羅的に ID 化 | 文書全体が status=proposed（PO 承認待ち）。GH-FR ID ↔ 実装済み CLI（`helix github pr-create` 等）の trace edge 一覧無し |

## 3. ledger 自身が認識済みの構造的未閉鎖（新規発見ではないが分母として記録）

- 前身 2 リポジトリ（`unison-ai-product/UT-TDD_AGENT-HARNESS` / `RetryYN/ai-dev-kit-vscode`）の
  git authority receipt = 0/2 BLOCKED（infinity-loop-source-capability-ledger §1.2）。旧資産の原子化抽出が入口で停止。
- source-atomization-contract §8: ZIP 703/703 分類済みだが atomization 未閉鎖 FAIL、
  現行 HELIX full-tree 1,931 分類済みだが未閉鎖 FAIL。
- 個別 pending: HZ-TOOL-010（export_sheets.py、reject 候補）、HZ-TOOL-027（util.py、absorbed 候補）、
  HZ-CAP-010（build/ 427 files、fixture 採否未確定）。
- HIL 115 要件: 定義 115/115 完了、検証済み実装 0/115、pair frozen 0/19 slice。
  chat 一次要求 41 件の raw 完全性未証明。

## 4. 抽出済みと確認できたもの（漏れ疑い解消）

- RUN&Debug L7.5 証跡: HLX-FR-05 / HLX-AC-05a,b（confirmed）
- version-up 安全化フロー: HR-FR-P1-02 / HR-FR-P6-04 ほか（confirmed、activation packet 詳細まで）
- web 可視化 / progress tree: HR-FR-VIS-01..07（confirmed、下流 frontier 注記あり）
- provider evidence / action-binding approval packet: HR-FR-P1-02、HR-NFR-P8-01、HR-FR-P7-01（confirmed）

## 5. 推奨アクション（優先順）

1. G-01 closure authority の L3 要件を既存実装から Reverse back-fill で起草（`kind=add-impl` ペアリング必須）。
2. G-03 Scrum S0–S4 の段階定義を L1/L3 へ要件 ID 化（ハイブリッドエンジン正本の欠落解消）。
3. G-02 / G-04 / G-05 / G-06 / G-07 の小粒 FR 追補（既存文書への追記優先、重複 PLAN 新設回避）。
4. G-10 github-autonomous-operations-requirements の confirmed 化と GH-FR↔CLI trace edge 表の追加（PO 承認境界）。

## 監査証跡

- 実資産棚卸し: src/ 全 33 モジュール・CLI `.command()` 走査（src/cli.ts L1427-13831）・src/lint/ 約140 file ls
- 要件列挙: L1 4 本 + L3 17 本中 11 本全文 + infinity-loop 系 ledger 5 本
- 個別照合: 14 疑義クラスタを Grep+Read で L1/L3 全 21 文書に対して照合（検索語は各判定に記載）
- 制約: L3 の document-agent-metadata / glossary-ssot / nfr-grade / orchestration-memory-runtime /
  orchestration-runtime-bridge / retention-purge-policy は部分読解（Grep 照合のみ）。
  `docs/governance/generated/v051-remediation-finding-ledger.yaml` 未読。
