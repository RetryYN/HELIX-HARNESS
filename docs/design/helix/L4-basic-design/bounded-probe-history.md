---
title: "bounded probe履歴 基本設計"
layer: L4
artifact_type: design
status: draft
created: 2026-08-17
updated: 2026-08-17
owner: Codex / TL
plan: docs/plans/PLAN-L7-582-bounded-probe-history.md
pair_artifact: docs/test-design/helix/L9-bounded-probe-history-system-test-design.md
---

# bounded probe履歴 基本設計

## 1. 入力から履歴まで

```text
NFR registry／current HEAD／dataset digest
  → typed probe plan
  → fixed allowlist port
  → bounded result
  → append-only measurement event
  → SQLite history head／replay
```

## 設計実在性束縛

実装sliceでcurrent sourceとfailure witnessを束縛する。設計段階では、未確定のprobe adapterや
外部実行器を実在assetとして先取りせず、L7実装のexact HEAD検収へ委ねる。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```

planはprobe IDを受け取るが、任意の実行ファイル、shell文字列、network先、credentialを持たない。
probeの実装選択はNode側の固定allowlistが所有し、portはplanのtimeout、deadline、CPU、memory、
output、network deny、credential noneを満たしたresultだけを返す。

## 2. 責務分離

| 境界 | 所有者 | 本sliceの扱い |
|---|---|---|
| NFR taxonomy／declaration | #219 | 参照のみ |
| pure verdict／threshold／freshness | #220 | 再実装しない |
| current HEAD／dataset admission | #221 | 実行前に必須化 |
| probe execution／resource bound | #221 | allowlist portで実装 |
| metric history／event join | #221 | append-onlyで実装 |
| switching／routing／allocation | #188 | 履歴consumerとして後続 |

---
