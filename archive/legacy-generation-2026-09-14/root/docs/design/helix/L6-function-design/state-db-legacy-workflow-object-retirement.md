---
title: "state DB legacy workflow object retirement"
layer: L6
artifact_type: design
status: draft
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
plan: docs/plans/PLAN-L7-695-state-db-legacy-workflow-object-retirement.md
pair_artifact: docs/test-design/helix/L8-state-db-legacy-workflow-object-retirement.md
---

# state DBの旧workflow object除去

## 目的

#1127のfresh schemaだけでなく、既存`harness.db`もrequirements-owned typed workflow identityへ移行する。
旧`selected_drive_model`／`default_drive_model`列、`project_drive_model_candidates` tableとindexを
current DB authorityへ残さない。

## migration契約

- schema revision 47へのversion gateで旧index、旧table、旧2列をexact nameで除去する。
- migration全体をSQLite `SAVEPOINT`で囲み、既存の外側transaction内でもatomicに動作させる。
- DDL、column補完、trigger／index生成、`user_version`更新のいずれかが失敗した場合はsavepointへ
  rollbackし、旧schemaと旧versionを保持する。
- authoritative event、episode、PLAN、review receiptは削除しない。対象はderived current-location projectionだけとする。
- fresh DBと既にrevision 47へ到達したDBでは冪等にno-opとする。

## doctor契約

- live `.helix/harness.db`が存在する場合、fresh canonical schema objectとの`missing`／`extra`／`changed`を照合する。
- 旧table／indexなどcurrent authority外objectは`extra`としてhard failする。
- DB未materializeは違反にせず明示的なnot-materialized結果とする。
- DB open／schema read不能は推測せずfail-closeする。

## 非対象

visualization、CLI presentation、routing／allocation、authoritative event purge、配布cutoverは扱わない。
