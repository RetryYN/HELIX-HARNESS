---
title: "UI Domain・Pattern Profile L9総合テスト設計（L4 pair）"
layer: L4
sub_doc: system-test-design
artifact_type: test_design
executed_at_layer: L9
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-10
owner: QA
pair_artifact: docs/design/helix/L4-basic-design/ui-domain-pattern-profile.md
github_issue_id: 209
---

# UI Domain・Pattern Profile L9総合テスト設計（L4 pair）

L4基本設計 §2 の system assertion（SA-UDP-01〜03）を L9 で検証する。test citation は
実装 PLAN が確定する。

L8（IT-UDP、型・段間契約）との差分は「実 repository 正本・実 gate 配線・生成→消費の
全経路」であり、L9 は L8 の再実行ではない。

| SA-ID | 対象 | 検証内容（L9 固有粒度） | citation |
|---|---|---|---|
| SA-UDP-01 | 実 L2 正本 end-to-end intake | 実 repository の L2 screen 設計正本全件を入力に intake→typed 化→registry consumer trace の全経路を通し、class/path 主キー 0 件と #177 ID 空間整合を assert | **未実装ブロック**（下記） |
| SA-UDP-02 | 実 gate 配線経由の 3 者同時 load | 実 profile / contract / 共通 pack 一式を doctor/lint 配線後の実 gate 経路で検証し、混入・競合の fail-close を実行環境で assert | `tests/ui-domain-system.test.ts` U-UDP-008 / 008b / 008c（PLAN-L7-540） |
| SA-UDP-03 | 生成→消費の全経路 | 実 risk matrix から生成した fixture 列を実テスト実行計画（fixture consumer）へ接続し、実バリエーション下の被覆 3 条件維持を assert | `tests/ui-domain-system.test.ts` U-UDP-009 / 009b（PLAN-L7-540） |

oracle ID は harness の PLAN schema が U-/IT- 接頭辞のみを許すため U-UDP-008/009 とし、
本書が SA-UDP-02/03 の citation として当該 test を指す（PSC の SA-PSC-03a と同じ扱い）。

実 asset 正本は `config/ui-domain/harness-console-bundle.json`（L2 正本
`docs/design/harness/L2-screen/` からの抽出、L5 §8 が抽出規約の正本）。実 gate 配線は
`src/design/ui-domain-gate.ts` → `src/doctor/index.ts`（runFullDoctor 集約）であり、
U-UDP-008b が配線 3 点（ok 集計 / 全体 ok / メッセージ集約）を機械確認する。

## SA-UDP-01 未実装ブロック（着地前に green を主張しない）

SA-UDP-01 の上流（#257 Canonical Design IR intake による L2 正本→typed entity 化、および
#177 経路で commit された実 registry 台帳の population）が未到達のため、本 SA は citation を
持たない。受け皿を先に書くと「実装が無いのに green」になるため書かない（PSC SA-PSC-03b と
同じ規律）。#257 到達時に本 doc へ citation を追記する。
