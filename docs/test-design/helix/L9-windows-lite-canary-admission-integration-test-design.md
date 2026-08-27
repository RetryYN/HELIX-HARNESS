---
title: "Windows Lite canary bounded admission L9結合テスト設計"
canonical_layer_scheme: L1-L12
layer: L9
artifact_type: test_design
sub_doc: integration-test-design
status: draft
created: 2026-08-27
updated: 2026-08-27
owner: QA / Codex TL
plan: docs/plans/PLAN-L3-70-windows-lite-canary-admission.md
pair_artifact: docs/design/helix/L6-function-design/windows-lite-canary-admission.md
related_l3: docs/design/helix/L3-requirements/windows-lite-canary-admission-requirements.md
---

# Windows Lite canary bounded admission L9結合テスト設計

L6 kernel、既存slot／work-graph lease、event journal、Linux artifact receipt、GitHub Actions adapter、
既存aggregateの接合だけを検証する。GitHub Actionsの一時的な成功表示や通知本文はreceiptの代わりにしない。

| IT-ID | 経路 | 合格条件 | 反例 |
|---|---|---|---|
| IT-WLCA-001 | PR 2件が同時にWindows laneへ到達 | cross-PR active／waiting bound内で決定的にadmit／backpressureされる | PRごとのref concurrencyだけで無制限実行になる |
| IT-WLCA-002 | Linux artifact→Windows smoke | 同一source／profile／artifact digestを使う | Windows側再build、別artifact、receipt欠落をsuccessにする |
| IT-WLCA-003 | lease取得→heartbeat→completion | assignment、HEAD、attempt、owner、fenceが最後まで一致する | stale owner／古いfence／別attemptのcompletionを受理する |
| IT-WLCA-004 | lease expiry後の再実行 | 旧leaseは無効化され、新attempt／新fenceへ移る | expiry後の旧completionをmerge aggregateへ送る |
| IT-WLCA-005 | queue満杯／Actions pending置換 | bounded backpressureまたはfail-closeを観測可能なreceiptへ残す | pending dropを暗黙skip／greenへする |
| IT-WLCA-006 | state／API／artifact read failure | Windows successを生成せずuncertainまたはfailureへ閉じる | event payload、Full green、PAT fallbackで補完する |
| IT-WLCA-007 | duplicate／stale completion | append-only event dedupeとstale rejectionが再現する | 同一measurement／leaseを二重計上する |
| IT-WLCA-008 | Full＋Lite＋Windows aggregate | 既存exact aggregateがsuccessまたは正規typed dispositionだけ受理する | unauthorized skip、missing lease、wrong artifactをFull greenで相殺する |
| IT-WLCA-009 | current HEAD read-after | workflow run、artifact、measurement、DB projectionが同一HEADへ収束する | 古いrunをcurrent receiptとして再利用する |
| IT-WLCA-010 | concurrent fixture＋rerun | retryが新attemptとしてboundedに記録され、旧attemptは母集団を汚染しない | rerun greenを恒久修正扱いする |

L9実装では実runnerへの外部作用をfixture／adapter境界へ閉じ、実GitHub設定変更や外部queue追加を行わない。
実Actions canaryはL3確認・L6/L8実装・独立review後の別受入工程として扱う。
