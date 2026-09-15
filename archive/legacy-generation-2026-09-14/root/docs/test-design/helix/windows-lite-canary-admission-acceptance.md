---
title: "HELIX L10 受入テスト設計 — Windows Lite canary bounded admission"
canonical_layer_scheme: L1-L12
layer: L10
paired_requirement_layer: L3
artifact_type: test_design
status: confirmed
created: 2026-08-27
updated: 2026-08-27
owner: QA / Codex TL
plan: PLAN-L3-70-windows-lite-canary-admission
pair_artifact: docs/design/helix/L3-requirements/windows-lite-canary-admission-requirements.md
---

# HELIX L10 受入テスト設計 — Windows Lite canary bounded admission

文書、job数、単発greenだけでは合格にしない。#1002の既存artifact authority、Full／Lite aggregate、
cross-PR lease、stale拒否、性能母集団、main read-afterを同一candidateへ束縛する。

| WLCA-AC | 対応要件 | 受入操作 | 合格条件 | negative mutation |
|---|---|---|---|---|
| WLCA-AC-001 | WLCA-R-01 | policy各fieldを欠落・改変する | exact schema、上限、TTL、windowを検証する | unknown／default補完で通す |
| WLCA-AC-002 | WLCA-R-02 | active／waitingを上限まで投入する | active／waiting boundとtyped backpressureを返す | unbounded wait、drop、implicit skip |
| WLCA-AC-003 | WLCA-R-03 | owner、fence、expiry、heartbeatを変異する | stale completionを一件ずつ拒否する | old fence／expired ownerをsuccess化 |
| WLCA-AC-004 | WLCA-R-04 | Linux artifactとWindows inputを照合する | same source／profile／artifact／attemptを保持する | Windows再build、別artifactを許可 |
| WLCA-AC-005 | WLCA-R-05 | queue／lease／digest取得を不確実化する | success／authorized skipへ投影せずfail-closeする | Full green、event payload、PATで補完 |
| WLCA-AC-006 | WLCA-R-06 | terminal／timeout／contention／backpressureを混在させる | terminal durationだけで固定rank p95／p99を算出し分類を分離する | timeout除外を隠す、別artifact混在 |
| WLCA-AC-007 | WLCA-R-06 | event順、前digest、母集団digestを変異する | append-only replay不一致を検出する | update／delete／duplicateを受理 |
| WLCA-AC-008 | WLCA-R-07 | Full／Lite／Windowsのlane resultを組み合わせる | exact aggregateがsuccessまたはtyped dispositionだけ受理する | unauthorized skip、missing receiptを相殺 |
| WLCA-AC-009 | WLCA-R-08 | 既存scheduler／journal／measurementを接続する | 第二queue／第二lease／第二authorityを追加せず再構築可能 | GitHub設定だけを根拠にする |
| WLCA-AC-010 | WLCA-R-02/03 | PR 2件の同時実行、rerun、expiryを再生する | queue／lease／fence／attemptがcurrent HEADへ収束する | stale rerunを恒久green扱い |

## 受入証跡

各実行はcandidate HEAD、PR、run／attempt、lane、assignment、lease／fence、Linux artifact digest、profile digest、
measurement window、outcome、DB projection／replay、aggregate resultを保持する。secret、token、task本文、
private payloadは証跡へ出力しない。L3要件がdraftの間は本書を実行済み受入の証拠にしない。
