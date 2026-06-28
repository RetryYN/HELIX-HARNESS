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

## §0 既存 harness FR インベントリ接地（重複防止）

本書は top-down（charter 柱）だけでなく **bottom-up（既存 harness FR-L1-01..51）と突き合わせて**起草する
（設計駆動キュレーション原則: 各粒度で既存機能を洗い出し→取捨選択→機能一覧整合）。各 HBR/HNFR は
**「既存 FR（接地・再利用）」＋「GAP（net-new で本要件が足す分）」** を明示し、既存機構を二重定義しない。
インベントリ突合の要点（pmo-project-explorer、51 FR 全件マップ済）:

- **既存 FR が厚い柱**: P0（19 FR）/ P4（10 FR、ただし検出のみ・修復欠）/ P9（11 FR、projection のみ・enforcement 欠）。
- **既存 FR が薄い/欠の柱（HELIX の真の net-new）**: **P6**（FR-L1-05/17 のみ、gated-push/PR auto/CI auto-fix/tag は FR 無し）、**P8**（ほぼ皆無、外部検索/skillify/sandbox/escalation 境界の FR 無し）、**P7**（memory は impl detail 止まり、2 層 architecture/共有 access/Glossary SSoT の FR 無し）。
- **GAP を実装で先行充足（一部）した柱**: **P2/P7** — subagent loop 構造・worker≠verifier・2 層 memory architecture + 実 runtime bridge は既存 FR に無かった GAP で **PLAN-L7-175/176/177 が green**。ただし**残 GAP あり**（P2: typed agent↔tool contract / loop effort-budget、P7: Glossary SSoT 連結）→ 柱全体は partial、§1 GAP 列参照。

## §1 業務要求 (HBR、charter 柱 → 能力要件、既存 FR 接地つき)

| ID | 業務要求 (機械強制/検証可能) | 既存 FR（接地・再利用） | GAP（本要件の net-new） |
|----|------------------------------|--------------------------|--------------------------|
| **HBR-P0** | **逸脱受け止めと Forward 収束** — 駆動 workflow で逸脱・障害・暴走を受け止め `forward_return` 規律で必ず Forward 正本へ収束。AI 暴走ガード（lock/budget time-cap/Recovery） | FR-L1-08/10/11/13/14/15/16/18/24/25/26/27/44（mode/recovery/routing/onboarding） | `forward_return` を **first-class の機械検証規律**として未定義（複数 FR に暗黙散在）。**runaway guard（budget time-cap）standalone FR 無し** |
| **HBR-P1** | **要件承認後フル自動＋連続自律走行** — engine（resume 3 条件/job-queue/budget time-cap/fresh-session）で完走、Scrum 分割でスケール、version-up で今版外作業を保全 | FR-L1-13/23/29/30/31/42（Forward/Scrum fullback/screen/context handover/handover） | **continuous-run engine 自体（heartbeat/job-queue/budget time-cap/無人再入）の FR 無し**。**version-up lifecycle（`version_target`/タグ）FR 無し** |
| **HBR-P2** | **オーケストレーション根本強化＋ループエンジニアリング** — サブエージェントを loop 単位（解釈→検証→計画→実行→検証→返却）で動かし orchestrator 統括、worker≠verifier 自己評価禁止、effort/budget 制御 | FR-L1-09/12/28/37/39/41/46/48（guard/injection/W設計/model-effort/difficulty/drive-routing/roster/CLI） | loop 構造・worker≠verifier 専用 FR は既存に無し → **PLAN-L7-175/176 で充足済**。残=**typed agent↔tool contract 機械検証 / loop 内 effort-budget 制御** |
| **HBR-P3** | **強い検証基盤（完全自動の安全要）** — pair_closure/片肺禁止/機械 vs AI 判定境界を機械強制、成果を外部真実に照合（held-out） | FR-L1-02/03/05/21/22/25/45/50（TDD/trace/gate/W-gate/FE detector/refactor/doc-reviewer/DDD-TDD） | **pair_closure 専用 FR・片肺禁止 standalone・機械 vs AI 境界の formalize 無し**。**external-truth grounding（held-out）FR 無し** |
| **HBR-P4** | **自動保守システム** — drift/劣化/不整合を自動検出→**自動修復**、detection-routing 循環、学習ループ（recipe 蓄積/予防 gate 昇格）。根幹=P7 メモリ | FR-L1-08/11/18/19/33/34/36/38/43/49（検出・学習・inventory・評価・drift-lint） | **検出は厚いが「自動修復」FR 無し**。**learning→promote-to-gate/detector 専用 FR 無し**。劣化(flake/perf)検出未被覆 |
| **HBR-P6** | **GitHub 運用自動化** — gated push（全 gate PASS で authorized、raw push fail-close deny）/ PR クロスレビュー自動 / CI 失敗時 auto-fix-repush / タグ版管理 | FR-L1-05/17（fail-close gate / CI-PR linkage）**のみ＝薄い** | **gated-push 認可・PR 自動 cross-review・CI auto-fix-and-repush・tag/version lifecycle すべて FR 無し → 大きく net-new** |
| **HBR-P7** | **ハーネスネイティブ 2 層メモリ** — harness-memory（保守の根幹）と project-memory を分離、**全エージェント同一記憶共有（silo 禁止）** | FR-L1-19/36/38/46/47（learning/skill・model 評価 projection/roster/skill — memory は impl detail 止まり） | 2 層 memory **architecture FR・cross-agent 共有 access・Glossary SSoT 無し** → architecture は **PLAN-L7-175/176 で充足済**、残=**Glossary SSoT 連結** |
| **HBR-P8** | **外部連携・外部検索（原則）** — 外部（Web/docs/OSS/tool）を検索・参照し幻覚を外部照合で抑止、有益知見をスキル化して自己取込（自己拡張） | （直接無し。FR-L1-09/05 が security guard 側のみ） | **外部検索/web grounding・skillify ループ・sandbox/trust-boundary すべて FR 無し → ほぼ全部 net-new**（最大の空白） |
| **HBR-P9** | **HELIX DB 収束（trace/drift/coverage/contract）** — 成果物を台帳に収束し整合を機械追跡、**DB 未収束＝未完了**、影響範囲分析の資産保全 backbone | FR-L1-03/04/06/07/18/20/33/35/40/49/51（trace/registry/hook/doctor/observability/inventory/readiness/drive-state/drift/progress-color） | **「DB 未収束＝未完了」enforcement gate 無し**（green-command-digest が部分代替）。**cross-artifact relation graph FR・contract ledger 無し** |

## §2 非機能要求 (HNFR、charter 柱の非機能側面)

| ID | 非機能要求 (検証可能) | 既存 FR/機構（接地） | GAP（本要件の net-new） |
|----|----------------------|----------------------|--------------------------|
| **HNFR-P3** | **検証の厳格性** — pair_closure/片肺禁止/自己評価禁止を fail-close 強制、合格主張は実証跡（test/command green）裏付け必須（prose 主張禁止、coding≠substance） | review-evidence green_commands + green-command-digest（substance gate）/ FR-L1-05 | **external-truth grounding の厳格性基準**（内部整合だけでなく外部照合）を非機能水準として未定義 |
| **HNFR-P5** | **コンテキスト効率** — 動的注入・可逆圧縮で「必要分だけ」渡し長時間無人自走を支える。閾値到達前に handover 要約→fresh session、注入予算を持つ | FR-L1-12/31/37/42/47（injection/context-handover/effort/handover/skill-pack） | **injection budget（上限）・handover 前の圧縮/要約 contract が FR 無し**（FR-L1-31 は閾値 trigger のみ）。外部 delta=headroom CCR 可逆圧縮 |
| **HNFR-P8** | **外部連携セキュリティ（厳格・hard 制約）** — 外部連携は secret 漏洩防止/信頼境界/サンドボックス下でのみ。**不可逆操作の escalation 境界**＝本番/認証認可/決済/PII/secret/license/schema migration/破壊的データ/外部 API・infra 変更のみ人間へ戻す | FR-L1-09（agent guard）/ FR-L1-05 / SECRET_PATTERN | **sandbox/trust-boundary の機能要件化・escalation 境界の FR 化が無し**（CLAUDE.md 安全境界に prose で在るが FR 未昇格） |
| **HNFR-AC** | **エージェント整合（同一記憶・同一規則）** — 全エージェントが単一規則セットに従い同一記憶（P7 2 層）を共有、per-agent 規則乖離・記憶サイロ禁止。`rule-drift` を全エージェントへ一般化 | rule-drift（Codex↔Claude adapter 乖離検査）/ FR-L1-46/47 | rule-drift は 2 adapter のみ。**全 agent への一般化 + 共有 memory access の機械強制が net-new** |

## §2.5 外部研究 delta（2026-06-28、L1 re-freeze 反映候補、PO 承認待ち）

PLAN-L1-06 Step 2/3 の外部研究パス（pmo-tech-docs 委譲、2025–2026 ソース照合）で surface した、net-new GAP を
sharpen する delta。**verify-don't-blindly-adopt**: 概念 delta は HELIX precedence（仕組み≦harness）に適合する
もののみ採用候補とし、**個別ツール・数値・出典は一次未検証 → L3 で検証**（下記「要追加調査」）。仕組みを超えない。

| 優先 | 対象 GAP | delta（採用候補・概念） | 出典系統（2025–2026、要一次検証） |
|------|----------|--------------------------|-----------------------------------|
| P1 | HNFR-P8 | **escalation 境界を prose→FR 機械強制**へ昇格。不可逆操作のみ human approval、approval は action-binding（actor/tool/target/params/timestamp/expiry 記録）。**承認範囲は最小化**（過剰承認＝click-through 疲弊＝prompt-injection 攻撃面、というセキュリティ根拠つき） | OWASP LLM06:2025 Excessive Agency |
| P1 | HBR-P6 | gated-push の具体手段 = **GitHub Rulesets push rules（bypass-actor 限定で raw push deny）+ Merge Queue（required checks 全通過後のみ merge）**。GAP 列に実装手段として明記し L3 設計者の判断材料に | GitHub Docs（rulesets / merge queue） |
| P1 | HNFR-P5 | **artifact trail（変更ファイルパス追跡）を汎用圧縮と分離し harness DB へ専用記録**。汎用 summarization では artifact trail が消失する実証あり → projection-writer 連携を L1 から明示 | Factory AI context-compression 分析 |
| P2 | HNFR-P3 | external-truth grounding に **measurable AC**: 「外部参照 URL なき断定クレーム＝未検証＝gate reject」。span-level verification + source attribution（URL+公開日+版）を substance gate へ。self-verification 単独は禁止（worker≠verifier と連動） | RAG span-level verification / OWASP |
| P2 | HBR-P8 | sandbox/trust-boundary 具体化方針 = **外部コード実行は MicroVM デフォルト**（低リスク external call は gVisor、無制限禁止）。外部 API/GitHub は **action 単位の short-lived / fine-grained token**（タスク完了/失敗で失効、再利用禁止） | MicroVM(Firecracker/Kata) / short-lived token |
| P2 | HNFR-P5 | injection budget の **3 層 context 管理**（直近 N ターン逐語 / 中間 rolling summary / 古域は目標・制約のみ）。handover 圧縮は **anchored iterative**（sections 固定・新規 truncate 分のみ merge、全再生成禁止）。層境界ターン数は**要数値化** | Anchored Iterative Summarization / 3 層管理 |
| P3 | HBR-P6 | 自律 tag 版管理ツールは **semantic-release vs Release Please を ADR 化**（Release Please は PR 経由 gate レビューを持ち HELIX approval gate と親和）。CI auto-fix の **repush 信頼度閾値**（暫定 0.75+、未達は Issue 起票→escalate）を FR 化し際限ない repush を防ぐ | semantic-release(MIT) / Release Please(Apache-2.0) |

**採用しなかった/保留**: self-verification 単独（HNFR-P3 が明示禁止、best practice も不支持）/ ARIA delegation graph（arxiv 段階、実用 OSS 未確認）/ Anthropic compact beta（harness handover と競合有無 未確認）。

**要追加調査（L3 で一次検証してから採用）**: Release Please のカスタム gate hook 対応範囲 / ACON 等論文実装の TS 再実装可否（Python binding 禁止）/ MicroVM の Bun/TS プロセス統合 / 上記出典 URL の一次確認。**ADR-001 厳守: OSS は概念採取＋TS-Bun 再実装、bulk import 禁止。**

## §3 harness 既存 FR/BR/NFR との関係（重複させない・接地済）

- harness `business-requirements.md` の BR-01..08/21/22・`nfr.md` NFR-15 件・**`functional-requirements.md` の FR-L1-01..51 は既存資産**。本書 HBR/HNFR は §0/§1/§2 で **各 FR を接地（再利用）**し、**GAP（net-new）だけを足す**。番号は HELIX 名前空間で衝突しない。
- **二重定義しない**: 既存 FR が被覆する部分は「既存 FR」列で再利用宣言し、本要件は GAP 列の差分のみを規定する。仕組みは harness 正本、HELIX は方向性＋GAP 能力を積む。
- **L3 降下時の整合**: 各 HBR/HNFR を L3 FR へ分解する際は、接地 FR-L1-NN を親に持つ拡張として起票し、harness FR registry（51 件）と整合させる（新 FR は GAP 分のみ）。
- **取捨選択メモ**: P2/P7 の GAP は実装で先行充足（PLAN-L7-175/176）。P6/P8 は既存 FR がほぼ無く HELIX の最大 net-new 領域 → L3 で優先設計。P0/P4/P9 は既存 FR が厚いので「enforcement 化（forward_return/auto-repair/DB-未収束＝未完了）」の薄い差分に絞る。

## §4 pair（片肺禁止）/ 後続

- pair = `docs/test-design/helix/L1-pillar-operational-test-design.md`（OT-* ⇔ HBR/HNFR を 1:1。Step 4 で起票・対凍結）。
- **承認**: 本書は AI 起草 draft。PO レビュー → G-REQ.L1 re-freeze（Step 6）で status=confirmed。
- L3 降下: confirmed 後、各 HBR/HNFR を L3 FR（機能要件）+ AC（受入条件）へ分解（next_pair_freeze=L3）。
- 一部実装済（partial）の P2/P7（HBR-P2/P7）は L3 back-fill（[[helix-orchestration-memory]] HR-BR-07/12/NFR-03 + runtime R 系 + HR-BR-13R/14R bridge）と整合。残 GAP（typed contract / effort-budget / Glossary SSoT）は L3 で起票。
