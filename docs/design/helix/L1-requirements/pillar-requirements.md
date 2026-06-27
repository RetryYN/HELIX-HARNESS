---
title: "HELIX L1 要件ドラフト — charter P0–P9 → 業務要求 (HBR) / 非機能要求 (HNFR)"
layer: L1
kind: design
status: draft
created: 2026-06-28
updated: 2026-06-28
owner: PO (人間 / RetryYN)
plan: PLAN-L1-06-helix-solo-conversion
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/L1-pillar-operational-test-design.md
---

# HELIX L1 要件ドラフト — charter P0–P9 → HBR / HNFR

> charter §7「P0–P9 を L1 の業務要求 (BR-*) / 非機能要求 (NFR-*) へ降ろす」の **AI 起草ドラフト**（PLAN-L1-06
> Step 2、status=draft）。**承認は PO（charter §3: L1 は人間承認）= Step 6 G-REQ.L1 re-freeze で確定**。
> ID は HELIX 名前空間 **HBR-/HNFR-** で harness の confirmed BR-NN/NFR-NN 件数・doc-consistency 正本を侵さない
> （harness L1 は solo 化のみ、HELIX 柱要件は本書で additive に積む）。各要件は「機械強制可能・検証可能」に書く。
> precedence: 仕組み=harness 上 / 機能=旧 HELIX 上、機能は仕組みを超えない。

## §1 業務要求 (HBR、charter 柱 → 能力要件)

| ID | 業務要求 (機械強制/検証可能) | trace |
|----|------------------------------|-------|
| **HBR-P0** | **逸脱受け止めと Forward 収束** — 直線 Forward 外の逸脱・障害・暴走を駆動 workflow（Reverse/Discovery/Incident/Recovery/Refactor/Retrofit/Research/Add-feature）で受け止め、`forward_return` 戻し規律で **必ず Forward 正本へ収束**できる。AI 暴走ガード（lock / budget time-cap / Recovery）を持つ（無人自走の安全弁） | charter P0 / 既存 harness 9-mode・REVERSE/RECOVERY・backfill-pairing 強化 |
| **HBR-P1** | **要件承認後フル自動＋連続自律走行** — §3 自律境界③を、走り続ける engine（resume 3 条件 AND / job-queue / budget time-cap / fresh-session 再起動）で完走。大規模は **Scrum 分割**（機能ユニットへ分割し L4–L7 を反復着地）でスケール。**version-up**（`version_target` 繰り越し・タグ lifecycle、P6 接続）で今版外作業を失わない | charter P1 / [[helix-orchestration-memory]] HR-BR-07 loop / 既存 Scrum mode |
| **HBR-P2** | **オーケストレーション根本強化＋ループエンジニアリング** — サブエージェントを「プロンプト多視点解釈→検証→計画→実行→検証→orchestrator 返却」ループ単位で動かし orchestrator が統括。**creation と judgement を別ランタイム/別モデルに分離（worker≠verifier、自己評価禁止を機械強制）**。effort/budget 制御を組み込む | charter P2 / **実装済**: orchestration pure core + runtime（PLAN-L7-175/176、U-ORCH-001..006） |
| **HBR-P3** | **強い検証基盤（完全自動の安全要）** — `pair_closure`（design⇔test を対で凍結、coverage100% 単独 pass 禁止）/ 片肺禁止 / 機械 vs AI 判定境界を機械強制し、成果を **外部の真実に照合**する（held-out 検証層、reward-hacking 抑止） | charter P3 / 既存 pair-freeze・oracle-test-trace・cross-review enforcement 強化。NFR 面 = HNFR-P3 |
| **HBR-P4** | **自動保守システム** — drift/劣化/不整合を自動検出→自動修復。**検出→自動ルーティング循環**（detection-routing）と**学習ループ**（成功 recipe 蓄積 / 頻出トラブル→予防 gate/detector へ昇格）。根幹は P7 ハーネスメモリ | charter P4 / 既存 doctor/drift gate 群 + [[helix-orchestration-memory]] P7 |
| **HBR-P6** | **GitHub 運用自動化** — commit/push の**ゲート化**（全 gate PASS で authorized push、raw push は fail-close で deny）/ PR クロスレビュー自動ワークフロー / **CI 失敗時に自動改善して上げ直し** / タグ版管理。CI はゲート証跡検証に専念 | charter P6 / 既存 harness-check CI + Branch Protection / commitlint |
| **HBR-P7** | **ハーネスネイティブ 2 層メモリ** — Claude 内蔵メモリは参考のみ。**ハーネスメモリ**（ハーネス自身改善＝保守の根幹、P4 土台）と**プロジェクトメモリ**（被開発物の知見）を分離し、**全エージェントが同一記憶を共有**（per-agent silo 禁止） | charter P7 / **実装済**: memory 2 層 jsonl + CLI（PLAN-L7-175/176、U-MEM-001..003） |
| **HBR-P8** | **外部連携・外部検索（原則）** — AI は内向きに閉じず、外部（Web/公式 docs/OSS/ツール）を**検索・参照して知見を取り込む**（幻覚を外部照合で抑止、P3 相乗）。有益知見は**スキル化して自己取り込み**（自己拡張ループ、P4/P7 接続） | charter P8 / 外部研究 delta（held-out/CCR 等）。セキュリティ面 = HNFR-P8 |
| **HBR-P9** | **HELIX DB 収束（trace/drift/coverage/contract）** — 成果物（doc/code/test/PR）を台帳に収束し整合を機械追跡。**DB に収束しない成果＝未完了**（AI「実装したつもり」詐称を防ぐ）。影響範囲分析を可能にする資産保全 backbone。横断「同一記憶共有」の機械的実体 | charter P9 / 既存 harness.db projection + green-command-digest（substance gate） |

## §2 非機能要求 (HNFR、charter 柱の非機能側面)

| ID | 非機能要求 (検証可能) | trace |
|----|----------------------|-------|
| **HNFR-P3** | **検証の厳格性** — 完全自動を許容するための安全 backbone。pair_closure / 片肺禁止 / 自己評価禁止を fail-close で強制し、合格主張は実証跡（テスト/コマンド green）に裏付けられること（prose 主張禁止、coding≠substance） | charter P3 / HBR-P3 / 既存 review-evidence green_commands + green-command-digest |
| **HNFR-P5** | **コンテキスト効率** — 動的注入・可逆圧縮で「必要分だけ」渡し長時間無人自走を支える。**閾値到達前に handover 要約→fresh session 移行**、注入予算を持つ | charter P5 / 既存 handover + 外部 delta（headroom CCR 可逆圧縮） |
| **HNFR-P8** | **外部連携セキュリティ（厳格・hard 制約）** — 外部連携は secret 漏洩防止 / 信頼境界 / サンドボックス下でのみ。**不可逆操作の escalation 境界**＝本番影響/認証認可/決済/PII/secret/license/schema migration/破壊的データ操作/外部 API・infra 変更のみ人間へ戻し、それ以外は自走 | charter P8 §3 / 既存 SECRET_PATTERN / escalation 規約 |
| **HNFR-AC** | **エージェント整合（同一記憶・同一規則）** — 全エージェントが単一規則セットに従い同一記憶（P7 2 層）を共有し、per-agent 規則乖離・記憶サイロを作らない。既存 `rule-drift`（Codex↔Claude アダプタ乖離検査）を全エージェントへ一般化 | charter §横断原則 / 既存 rule-drift |

## §3 harness 既存 BR/NFR との関係（重複させない）

- harness `business-requirements.md` の BR-01..08/21/22・`nfr.md` NFR-15 件は **solo 化のみ**（PLAN-L1-06 Step 2 core 済）。本書 HBR/HNFR は **charter 柱由来の HELIX additive 要件**で、既存 ID と番号衝突しない。
- 既存 BR/NFR と意味が重なる箇所は trace 列で明示連結（例: HBR-P6 ↔ NFR-05 GitHub 権限正本、HBR-P3/HNFR-P3 ↔ 既存 pair-freeze）。**同一機構を二重定義しない**（仕組みは harness 正本、HELIX は方向性・追加能力を積む）。

## §4 pair（片肺禁止）/ 後続

- pair = `docs/test-design/helix/L1-pillar-operational-test-design.md`（OT-* ⇔ HBR/HNFR を 1:1。Step 4 で起票・対凍結）。
- **承認**: 本書は AI 起草 draft。PO レビュー → G-REQ.L1 re-freeze（Step 6）で status=confirmed。
- L3 降下: confirmed 後、各 HBR/HNFR を L3 FR（機能要件）+ AC（受入条件）へ分解（next_pair_freeze=L3）。
- 既に実装済の P2/P7（HBR-P2/P7）は L3 back-fill（[[helix-orchestration-memory]] HR-BR-07/12/NFR-03 + runtime R 系）と整合。
