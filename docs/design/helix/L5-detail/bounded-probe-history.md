---
title: "bounded probe履歴 詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-08-17
updated: 2026-08-17
owner: Codex / TL
plan: docs/plans/PLAN-L7-582-bounded-probe-history.md
pair_artifact: docs/test-design/helix/L8-bounded-probe-history-unit-test-design.md
---

# bounded probe履歴 詳細設計

## 1. plan／resultのstrict schema

planは`helix-bounded-probe-plan.v1`、resultは`helix-bounded-probe-result.v1`とする。双方とも
unknown field、欠落field、短縮HEAD、digest不正、値域超過を受理しない。planのidentityは
`run_id`、NFR ID／revision、registry digest、metric、probe ID、workload、environment、datasetを
digest、full HEAD、runner、join contextで構成する測定identityである。

resource boundはwarmup count、sample count、timeout、deadline、output bytes、CPU time、memory bytesを
持ち、networkは`deny`、credentialは`none`に固定する。実行器からraw stdout／stderrを返さず、digestと
byte数だけをresultへ載せる。

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

## 2. append-only eventの構造

eventはplan digest、result digest、前event digest、sequence、current identity、測定値、status、
quality、開始／完了／記録時刻、requirement／release／regression／improvement episodeのjoin keyを持つ。
SQLiteの`measurement_history_events`はUPDATE／DELETEをtriggerで拒否する。headはNode transaction内の
CASでのみ進め、同じrun IDの再送はplan digestとresult digestが同一の場合だけ冪等に返す。

## 3. fail-close境界

registry digest、current HEAD、dataset digestのいずれかが取得不能またはplanと不一致ならprobeを起動しない。
sample不足、timeout、failure、resource超過は`unknown`または`failed` eventとなり、#220へgreen観測として
渡さない。historyのchain、head、event digestのいずれかが不一致ならreplayを失敗させる。
---
