---
title: "HELIX-Web-OSサービス運転要求案"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
status: draft
freeze_blocking: true
pair_artifact: docs/test-design/helix-web-os/L11-service-acceptance.md
parent_l1_candidate: docs/design/helix-web-os/L1-planning/system-intent.md
created: 2026-09-14
---

# HELIX-Web-OSサービス運転要求案

本書はHELIX-Web展開時にHELIX-OSの外へ構成するサービス運転基盤の要求案である。HARNESS Version 1完成前の
展開、外部接続、実装起動を許可しない。

| L2要求 | 親L1候補 |
|---|---|
| HELIXWEBOS-L2-001 | HELIXWEBOS-L1-001 |
| HELIXWEBOS-L2-002／003 | HELIXWEBOS-L1-002 |
| HELIXWEBOS-L2-004 | HELIXWEBOS-L1-003 |
| HELIXWEBOS-L2-005 | HELIXWEBOS-L1-004 |
| HELIXWEBOS-L2-006 | HELIXWEBOS-L1-005 |

| ID | HELIX-Web-OSに対する要求 | 確認する結果 |
|---|---|---|
| HELIXWEBOS-L2-001 | tenant・利用者・project・environmentごとにauthority、resource、state、evidenceを隔離できる | 一利用者の資格・job・data・結果が別scopeへ流れず、HELIX-OS内部stateをservice authorityとして共有しない |
| HELIXWEBOS-L2-002 | 適格なHARNESS能力をConnectorへ導入・更新・撤去し、Web版・Connector版・能力版・接続契約を追跡できる | Connectorに開発engineを重複実装せず、不適格版や更新失敗を利用可能と表示しない |
| HELIXWEBOS-L2-003 | 長時間jobの受付、配信、進行、切断、取消、再開、終端、結果不明を同じjob identityで管理できる | 再送・障害・再接続で副作用を二重実行せず、期限・予算・許可・未完義務を失わない |
| HELIXWEBOS-L2-004 | 認証、provider経路、credential利用、network／data scope、利用者環境から返送する情報を操作ごとに制御できる | 未確認経路、期限切れ権限、秘密送信、範囲外data返送を拒否し、サービス利用を横断学習同意へ変換しない |
| HELIXWEBOS-L2-005 | jobの原eventと証拠から、HELIX-Webのダッシュボードへ進行・状態・成果・停止・再開をrevision付きで投影できる | projection欠落・遅延・stale・conflict・結果不明を成功表示せず、画面表示を実行事実や受入の正本にしない |
| HELIXWEBOS-L2-006 | service release、deployment、monitoring、incident、backup、restore、rollback、maintenanceを対象版と証拠へ束縛し、許可されたservice log・telemetry・利用結果をHELIX-OSの改善入口へ渡せる | exportごとに出典、tenant／data scope、目的、同意、revision、時点、欠測、保持条件を示す。配備成功、復旧成功、恒久修復、Web利用者受入を分け、運用結果からHARNESS・Web・OS要求を直接変更しない |

HELIX-OSは本systemを管理対象projectとして開発・改善する。HELIX-Web-OSは展開後のservice runtimeを所有する。
両者のevent store、credential、tenant state、writer、release authorityを暗黙共有しない。service logはWeb-OSが
運転記録として保持し、許可・最小化したexportだけをHELIX-OSが改善入力として受領する。連携はversioned contract、
artifact、receipt、telemetry export、改善proposalとして行う。
