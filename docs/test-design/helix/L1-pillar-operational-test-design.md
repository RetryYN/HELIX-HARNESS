---
title: "HELIX L1 柱要件 運用テスト設計 — HBR/HNFR ⇔ HOT-* (片肺禁止 pair)"
layer: L14
kind: test_design
status: draft
created: 2026-06-28
owner: PO (人間 / RetryYN)
plan: PLAN-L1-06-helix-solo-conversion
pair_artifact: docs/design/helix/L1-requirements/pillar-requirements.md
---

# HELIX L1 柱要件 運用テスト設計 (HOT-*)

> `docs/design/helix/L1-requirements/pillar-requirements.md`（HBR/HNFR、charter P0–P9）の **L14 対**（片肺禁止）。
> OT-* ⇔ HBR/HNFR を **1:1** で立てる。ID は HELIX 名前空間 **HOT-** で harness の OT-01..47 と非衝突。
> **承認は PO（charter §3: L1 は人間承認）= PLAN-L1-06 Step 6 G-REQ.L1 re-freeze で対凍結**。
> 実装状態は虚偽宣言を禁じる（NFR-08）: P2/P7 は実装済（PLAN-L7-175/176、9 oracle green）、他柱は L1 宣言のみ（L3 降下で詳細化）。

## §0 量閉じ原則 (L1↔L14)

- 全 HBR（P0/P1/P2/P3/P4/P6/P7/P8/P9 = 9 件）/ 全 HNFR（P3/P5/P8/AC = 4 件）に **HOT-* を 1:1 対応**（孤児柱 = 0）。
- 各 HOT は **運用シナリオ（L14 観測可能）＋ 合否条件（機械検証可能）** を持つ。具体数値しきい値は L3 AC で確定（charter 柱の能力境界はここで凍結）。
- precedence: 仕組み=harness 上 / 機能=旧 HELIX 上、機能は仕組みを超えない。

## §1 運用テスト (HOT-*、業務柱 HBR)

| ID | 対応 | 運用シナリオ | 合否条件 | 実装状態 |
|----|------|--------------|----------|----------|
| **HOT-P0** | HBR-P0 | 逸脱・失敗・暴走を driver（Reverse/Recovery/Incident）で受け、`forward_return` 規律で Forward 正本へ収束。budget time-cap 到達で runaway を停止 | 逸脱試行が driver へ routing され forward_return で Forward へ戻る / time-cap 超過で停止が記録 / 未収束 0 | not-implemented（FR 接地厚いが forward_return first-class・runaway guard は net-new） |
| **HOT-P1** | HBR-P1 | 要件承認後、engine（resume 3 条件 / job-queue / budget time-cap / fresh-session）で無人完走、Scrum 分割でスケール、version-up で今版外作業を保全 | 承認後 human 介在 0 で完走 / job-queue 二重 claim 0 / time-cap で fresh-session 再入 / version_target 外作業が version-up へ隔離 | partial（loop/job-queue は PLAN-L7-176 実装、continuous-run engine 全体・version-up lifecycle は net-new） |
| **HOT-P2** | HBR-P2 | subagent を loop 単位（解釈→検証→計画→実行→検証→返却）で動かし orchestrator 統括、hybrid で worker≠verifier（自己評価禁止）、不在時 fail-close | tick が canResume gate / hybrid 不在で stopped+cross_runtime_unavailable（自己評価せず）/ selectVerifier が反対 provider | **implemented**（PLAN-L7-175/176、U-ORCH-001..006 green） |
| **HOT-P3** | HBR-P3 | design⇔test-design を pair 凍結（片肺禁止）、coverage 単独 pass 禁止、合格主張は green_commands 実証跡、成果を held-out 外部真実に照合 | 片肺 freeze 試行が block / prose-only 合格主張が substance gate で reject / held-out 照合無しの完了主張を検知 | partial（pair_closure/substance gate は既存、held-out external grounding は net-new） |
| **HOT-P4** | HBR-P4 | drift/劣化/不整合を自動検出→**自動修復**、検出→routing 循環、recipe 蓄積→予防 gate/detector へ昇格 | 検出 event が修復 action へ routing / recipe が gate/detector へ promote / 劣化（flake/perf）検出が発火 | not-implemented（検出は厚いが auto-repair/promote は net-new） |
| **HOT-P6** | HBR-P6 | 全 gate PASS で push authorized、raw push を fail-close deny、PR 自動 cross-review、CI 失敗で auto-fix-repush、tag で版管理 | gate 未充足 push が deny / PR が cross-review 経路に乗る / CI fail で auto-fix commit が repush / tag lifecycle が成立 | not-implemented（HELIX 最大 net-new 領域） |
| **HOT-P7** | HBR-P7 | harness/project 2 層 memory を分離、全エージェント同一記憶共有（silo 禁止）、SessionStart 想起、Glossary を SSoT 連結 | harness/project 層分離 / Claude↔Codex が同一 `.ut-tdd/memory` を共有（silo 0）/ secret reject / SessionStart で有界 surface | **implemented**（architecture: PLAN-L7-175/176、U-MEM-001..003 green + surface 配線）。Glossary SSoT 連結は net-new |
| **HOT-P8** | HBR-P8 | 外部（Web/docs/OSS/tool）を検索・参照し幻覚を外部照合で抑止、有益知見を skill 化して自己取込、sandbox/trust-boundary 下で実行 | 外部照合経路が成立 / skillify ループで skill が追加 / sandbox 外アクセスが escalation へ | not-implemented（外部検索/skillify/sandbox すべて net-new = 最大の空白） |
| **HOT-P9** | HBR-P9 | 成果物を harness.db 台帳へ収束、**DB 未収束＝未完了** enforcement、cross-artifact relation graph で影響分析、contract ledger 整合 | 未収束 artifact の完了主張を block / relation graph で impact 算出 / contract ledger が整合 | partial（projection 厚いが「未収束＝未完了」enforcement gate・relation graph・contract ledger は net-new） |

## §2 非機能 運用テスト (HOT-*、非機能柱 HNFR)

| ID | 対応 | 運用シナリオ | 合否条件 | 実装状態 |
|----|------|--------------|----------|----------|
| **HOT-N3** | HNFR-P3 | pair_closure/片肺禁止/自己評価禁止を fail-close 強制、合格主張は test/command green 裏付け必須（prose 主張禁止、coding≠substance）、外部照合水準 | prose-only 主張が substance gate で reject / hybrid 自己評価が block / external-truth 照合基準を充足 | partial（substance gate 既存、external-truth 厳格性基準は net-new） |
| **HOT-N5** | HNFR-P5 | 動的注入・可逆圧縮で「必要分だけ」渡し、注入予算上限を持ち、閾値到達前に handover 要約→fresh session | 注入が budget 上限内 / 閾値到達で handover 要約生成→fresh 再入 / memory surface が有界（直近 12 件・各 240 字） | partial（surfaceMemory 有界化は実装済、injection budget 全体・可逆圧縮 CCR は net-new） |
| **HOT-N8** | HNFR-P8 | 外部連携は secret 漏洩防止/信頼境界/sandbox 下のみ、不可逆操作（本番/認証認可/決済/PII/secret/license/schema migration/破壊的データ/外部 API・infra）を人間へ escalate | secret パターンが reject / 不可逆操作が escalation 境界で停止→人間 / sandbox 外アクセスが deny | partial（SECRET_PATTERN/guard 既存、sandbox/trust-boundary・escalation の FR 化は net-new） |
| **HOT-NAC** | HNFR-AC | 全エージェントが単一規則セット ＋ 同一記憶（P7 2 層）を共有、per-agent 規則乖離/記憶サイロ禁止、`rule-drift` を全 agent へ一般化 | rule-drift が adapter 乖離を block / 全 agent が同一 `.ut-tdd/memory` を共有（silo 0）/ 規則乖離を検知 | partial（rule-drift は 2 adapter のみ、全 agent 一般化 + 共有 memory access の機械強制は net-new） |

## §3 trace（孤児 0）

- HBR: HBR-P0→HOT-P0 / HBR-P1→HOT-P1 / HBR-P2→HOT-P2 / HBR-P3→HOT-P3 / HBR-P4→HOT-P4 / HBR-P6→HOT-P6 / HBR-P7→HOT-P7 / HBR-P8→HOT-P8 / HBR-P9→HOT-P9。**孤児 HBR = 0**（9/9）。
- HNFR: HNFR-P3→HOT-N3 / HNFR-P5→HOT-N5 / HNFR-P8→HOT-N8 / HNFR-AC→HOT-NAC。**孤児 HNFR = 0**（4/4）。
- 逆方向: 全 HOT-* が HBR/HNFR を親に持つ（孤児 OT = 0）。

## §4 後続（L3 降下）

- 各 HOT の **具体数値しきい値（time-cap 秒数 / gate 通過率 / injection budget トークン上限等）は L3 AC で確定**。本書は L1 能力境界の対凍結まで。
- implemented（HOT-P2/P7）は既存 oracle（U-ORCH-001..006 / U-MEM-001..003）が L7 単体側の被覆。本 OT は L14 運用観測側の対。
- not-implemented 柱（P6/P8 等）は L3 で優先設計（pillar-requirements §0/§3 の GAP 大の領域）。
