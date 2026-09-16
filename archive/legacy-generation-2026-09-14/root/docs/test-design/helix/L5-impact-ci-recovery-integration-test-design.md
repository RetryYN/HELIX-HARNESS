---
title: "Impact CI Recovery L8結合テスト設計"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: confirmed
created: 2026-08-02
updated: 2026-08-02
owner: QA / TL
plan: docs/plans/PLAN-L5-84-impact-ci-recovery.md
pair_artifact: docs/design/helix/L5-detail/impact-ci-recovery.md
queue_id: L3Q-PC-039
---

# Impact CI Recovery L8結合テスト設計

L5詳細設計とL8結合検証の双方向pairを固定する。L6 pure selectorの単体oracleは
`docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md`が別責務として所有し、本書へ重複させない。

| oracle | L5 pointer | 正例 | 反例／期待failure | 実行citation |
|---|---|---|---|---|
| IT-IMPACTCI-001 | §3、§4 | changed path、relation graph、PLAN companionからselected／deferred exact partitionを生成 | unknown path、空relation、partition欠落をfullへ倒さないmutationを拒否 | `tests/impact-ci.test.ts` |
| IT-IMPACTCI-002 | §4、§5 | Draftだけがimpact-selected、Ready／main／high-riskがfull exact set | Ready selective化、workflow／authority／security変更のknown-low化を拒否 | `tests/impact-ci.test.ts`; `tests/harness-check-workflow.test.ts` |
| IT-IMPACTCI-003 | §4、§6 | GitHubからHEAD、base、bodyを取得後に再読し同一snapshotへ束縛 | event payload再利用、取得後drift、別HEAD receiptを`stale_snapshot`／`receipt_binding_mismatch`で拒否 | `tests/impact-ci.test.ts`; `tests/harness-check-workflow.test.ts` |
| IT-IMPACTCI-004 | §5、§7 | candidate full、post-merge full、nightly fullを同一inventoryで分離 | 一方のsurface greenによる他surface red相殺、terminal上書き、回収欠落を拒否 | `tests/impact-ci.test.ts` |
| IT-IMPACTCI-005 | §8 | correctnessとperformance budgetを別結果として集計 | p95超過でtest除外、timeout延長、correctness greenの偽装を拒否 | `tests/impact-ci.test.ts` |
| IT-IMPACTCI-006 | §1、§9 | 既存workflow job、PLAN lint、authority、DB、Biome、doctorを再利用 | 新runner／新job／新DB table追加、required gate縮退、`continue-on-error`を拒否 | `tests/harness-check-workflow.test.ts`; `tests/impact-ci-recovery-detail-design.test.ts` |

## 完了条件

- 6 oracleすべてがcurrent HEADの実行citationへ解決する。
- selected／deferredの交差0・和集合exact、Ready／main full、unknown／high-risk fullを同時に満たす。
- L5 pairの成立をL6単体pairや将来receipt reporterの完了主張で代用しない。
- cancelled／superseded除外数、per-item receipt永続化、nightly activationは後続契約として未接続を維持する。
