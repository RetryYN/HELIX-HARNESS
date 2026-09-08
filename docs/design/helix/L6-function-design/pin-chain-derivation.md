---
title: "pin追従連鎖の事前導出"
layer: L6
kind: recovery
status: draft
created: 2026-09-09
updated: 2026-09-09
owner: Codex / TL
plan: docs/plans/PLAN-L6-1670-pin-chain-derivation-design.md
pair_artifact: docs/test-design/helix/L7-pin-chain-derivation-unit-test-design.md
github_issue_id: 1670
behavior_contract_id: PIN-CHAIN-DERIVATION-001
responsibility_owner: pin-chain-derivation
---

# pin追従連鎖の事前導出

## 責務

変更pathから、そのbytes・件数・意味判定を固定している既存recordをpush前に逆引きする。
既存gateの合否やpin値は変更せず、後段CIで初めて判明していた追従先をread-onlyで提示する。

入力は明示されたchanged path集合、またはworking treeの実差分である。出力はchanged path、dependent
recordのexact path/location、field、recorded/live値、stale、pin kind、次actionを含む。

## 種別境界

- `deterministic_pin`: digest・test件数など機械再計算可能。`refresh_candidate`を返す。
- `semantic_review_pin`: reviewed-safe等の意味判定を伴う。値を更新せず`requires_reassessment`を返す。
- 未登録形式または登録済みrecordの必須field欠落: `DEGRADED`としてsurface／fieldを列挙する。
  欠落fieldを`stale`な既知pinへ偽装せず、追従不要へも読み替えない。

第一sliceはfeedback test-owner manifestとL12 reviewed-safe dispositionを扱う。自動書換え、新CI job、
万能literal parser、既存gateの緩和は行わない。対応形式はadapterを追加して段階的に広げる。

## 失敗境界

対象recordと必須fieldが存在してtargetだけが無い場合、live値は`null`でstaleとする。changed pathに登録済みpinがなく、
未対応か追従不要かを証明できない場合は`DEGRADED`とする。意味pinをdeterministic refreshへ昇格しない。
