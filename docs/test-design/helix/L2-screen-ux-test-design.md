---
title: "HELIX L2 画面・モック UX テスト設計"
layer: L10
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
legacy_physical_layer: L10
kind: test_design
status: draft
freeze_blocking: true
created: 2026-07-04
updated: 2026-09-14
owner: Codex
pair_artifact: docs/design/helix/L2-screen/screen-mock-boundary.md
---

# HELIX L2 画面・モック UX テスト設計

本書はL2要求に対するL11受入の整備案である。`layer: L10`は旧体系のprojectionとして保持する。
L3／L10総合テストとは区別し、合意した利用目的と操作を実データ・実操作・WCAG観点で検証する。
旧confirmedを本revisionの承認としない。canonical再利用禁止は維持し、個別delta・対応oracle・
独立review evidence・digest更新が揃うまで本書を下流実行の承認入力にしない。

## テスト観点

| ID | 対応 | 検証観点 | 合格条件 |
|---|---|---|---|
| HUX-L2-01 | L2-AC-01 | 合意済み要求に対応するnode／edge／blockerを実操作で確認し、要求からプロト・L3・受入結果へ辿る | 指定した要求文書・正本JSON・DB投影から再現でき、対応欠落と未検証項目を表示する。LLM生成図を正本にしない |
| HUX-L2-02 | L2-AC-02 | モックのみ、実装のみ、総合テストのみの各状態とL11受入済みを区別する | 対象要求revisionに結び付く実操作・accessibility・blocker表示・操作承認境界の証跡が欠ける場合は未受入とする。旧doctorの層名やgreen単独を合格条件にしない |
| HUX-L2-03 | L2-AC-03 | S4判断とプロト合意の欠落・revision不一致を確認する | `PLAN-DISCOVERY-10`のS4判断に加え、要求ID・要求revision・プロトrevision・合意者・判断記録が一致するまでL3凍結への受渡しを認めない |

## 完了境界

L11受入には上記3観点の実行結果が必要である。本書には実行結果や人の合意証拠を追加していない。
要求の整備、pairの存在、旧テストの成功を受入完了の証拠としない。
