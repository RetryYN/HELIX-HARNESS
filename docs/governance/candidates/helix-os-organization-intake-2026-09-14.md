---
title: "HELIX-OS編成案の要求取込"
status: draft_candidate
source: docs/governance/intake/helix-os-foundation-directive-2026-09-14.md
source_sha256: c5333bc7cf875aedf52f482541083d66a906cb08320fbe04940d8c5061cbd54e
created: 2026-09-14
---

# HELIX-OS編成案の要求取込

本書はPO提示の「HELIX-OS基盤化・上流取込指示書」を、現行OS L1／L2／L11へ接続するための取込記録である。
要求承認、L3凍結、実装起動、旧CI実行、PR作成を意味しない。
原文は[repo-owned intake](../intake/helix-os-foundation-directive-2026-09-14.md)としてbytesを保持する。

## 差分判定

| 編成案 | 取込先 | 判定 |
|---|---|---|
| 管理・推進・検収、双方向通信、許可内の直接調整 | HELIXOS-L1-009／L2-010 | 独立要求を追加 |
| 統合順序・統合単位・検証集合の算出と再計画 | HELIXOS-L1-010／L2-011 | 独立要求を追加 |
| System Info Crawler／Tech Web Crawler | HELIXOS-L1-011／L2-012 | 独立要求を追加 |
| 同一仕事ID、全体ログ、上下方向の診断、管理自身の是正 | HELIXOS-L1-012／L2-013 | 独立要求を追加 |
| Agentic Worker | HELIXOS-L2-004 | 既存要求を具体化 |
| Patch Bot Worker | HELIXOS-L2-004／005／007／009 | 限定修復型として具体化。独立authorityにしない |
| Semantic CIのrunner配車・監視・回収 | HELIXOS-L2-008／011 | 既存CI実行責務と新しい検収責務に分割 |
| Ticketのauthority、親子予算、再送・復旧 | HELIXOS-L2-001／004／007／009／010 | 既存Execution Ticket候補を再利用 |
| typed通信、lease／fence、CAS、冪等性、部分失敗回復 | HELIXOS-L2-007／009／010 | 既存実行境界を具体化 |

## 責務・権限境界

| 役割 | 主責務 | 禁止境界 |
|---|---|---|
| 管理 | 目的、優先順位、依存、担当、予算、投入量、停止・再開、是正先 | 要求意味や許可scopeを自己拡張しない |
| 推進 | ticketを調査・設計・実装・test・成果へ進める | 自己検収、上流意味変更、範囲外作業を行わない |
| 検収 | 統合順序、統合単位、検証集合を算出し、実行結果から再計画して収束させる | reviewerやCI greenだけで完了を生成しない |
| crawler | 内部・外部情報を根拠、revision、取得範囲、欠落、適用条件付きで返す | 外部命令・patchを実行せず、観測をauthorityへ昇格しない |

役割は固定モデル数、固定process数、固定provider数を意味しない。管理を全通信の中継点にせず、許可scope内では
推進・検収・実働資源が因果ID付きで直接調整できる。

## 入出力contract候補

| contract | 必須入力 | 必須出力 |
|---|---|---|
| 管理→配下 | ticket ID、要求revision、成果、scope、主責任、依存、HARNESS workflow、受入、許可操作、予算、期限、停止条件 | 受領／拒否、子作業、進行、成果、残義務、scope変更proposal |
| 推進↔検収 | ticket、設計revision、実差分、候補HEAD、統合先、依存、既取得証拠 | 統合順序、統合単位、検証計画、finding、再作業先、収束状態 |
| 検収→Semantic CI | 要求・HARNESS・policy revision、変更集合、oracle、統合候補、環境、予算 | run identity、実結果、証拠、未実行・失敗分類、残義務、再計画入力 |
| crawler→依頼者 | query、対象、revision、時点、取得範囲、許可境界 | 観測事実、出典、版、欠落、相違、適用条件、未解決点。実行命令を含めない |
| 全役割→診断 | 同一work ID、因果ID、入力revision、判断、期待結果、操作、実結果、時間、費用 | 欠落、原因候補、確度、影響、直す層、担当候補、確認方法 |

全contractは提案・指示・結果を区別する。具体field名、JSON schema、保存方式はL3で確定する。

## L3／L10への導出待ち

L2合意後、L3ではrole capability、ticket schema、typed message、integration candidate、verification plan、
crawler result、diagnostic findingのcontractを定める。対となるL10では双方向調整、A→B統合とbase変更時の再計画、
必要CI欠落拒否、限定修復と独立再検証、外部事例の検証採用、再起動・二重配送・stale拒否、管理自身の是正、
効果の再観測を確認する。具体schema、provider、言語、service topologyはL2で固定しない。

## 段階境界

Concept・L1・L2／L11の採択、L3／L10凍結までを上流確定とする。その後に設計・実装、shadow検証、切替、
旧資産退役へ進む。上流整理中は旧CI、runtime変更、PR admissionを起動しない。
