---
title: "Impact CI Recovery L8単体テスト設計"
layer: L8
artifact_type: test_design
status: draft
created: 2026-08-01
updated: 2026-08-01
owner: QA
plan: docs/plans/PLAN-L5-84-impact-ci-recovery.md
pair_artifact: docs/design/helix/L5-detail/impact-ci-recovery.md
related_l9: docs/test-design/helix/L9-impact-ci-recovery-system-test-design.md
queue_id: L3Q-PC-039
---

# Impact CI Recovery L8単体テスト設計

| oracle | 正例 | 反例／mutation |
|---|---|---|
| U-IMPACTCI-001 | inventory ID、owner、argv command、profile、kindが一意 | duplicate ID、owner欠落、空command、unknown enum、同一command別IDを拒否 |
| U-IMPACTCI-002 | changed pathから直接test、trace consumer、V-pair oracle、owner gateを選択 | relation edgeを1本削除、changed testをdeferredへ送るmutationを拒否 |
| U-IMPACTCI-003 | PLANの`generates`／`requires`／`pair_artifact`からcompanionを追加 | PLAN companionの一種を無視するmutationを拒否 |
| U-IMPACTCI-004 | selector／workflow／security／permission／secret／schema／migration／rollback／DB／authority／lockfile変更をfull化 | high-riskをknown-lowへ落としてtargeted terminalにするmutationを拒否 |
| U-IMPACTCI-005 | relation既知のknown-lowだけをselected/deferredへ分割 | unknown path、空relationを`known_no_consumer` receiptなしでdeferredへ送るmutationを拒否 |
| U-IMPACTCI-006 | selectedとdeferredの交差0、和集合inventory exact set、canonical sort | item欠落、余剰、重複、非決定順序を拒否 |
| U-IMPACTCI-007 | GitHub API current HEAD／body digest／merge-baseを同一snapshotへ束縛 | event payload再利用、取得後HEAD/body/base driftを`stale_snapshot`にする |
| U-IMPACTCI-008 | terminal receiptのresult IDがselected exact setと一致し全exit 0 | 別HEAD、別inventory、欠落result、余剰result、exit非0、未完時刻を拒否 |
| U-IMPACTCI-009 | rerunを新attemptとして追記し最初のterminal linkを維持 | terminal置換、同一item/HEAD/profileの二重terminalを拒否 |
| U-IMPACTCI-010 | post-mergeがcandidate deferred exact setを回収し、空集合receiptも発行 | deferred欠落、selected再実行による回収偽装、nightly成功によるfailure消去を拒否 |
| U-IMPACTCI-011 | profile/environment/cache class別のterminal母集団でp50/p95計算 | cold/warm混在、cancelled/superseded混入、母集団数欠落を拒否 |
| U-IMPACTCI-012 | correctness green＋budget超過をmerge greenとRecovery evidenceへ分離 | timeout延長、test除外、threshold緩和、`continue-on-error`を改善扱いするmutationを拒否 |

## 実行単位

- 純粋単体検証: inventory validator、impact selector、partition validator、receipt validator、percentile calculator。
- Fixture: known-low docs、source＋test、unknown path、security/schema、stale body、empty deferred、二重terminal。
- Integration／workflowはL6/L7で扱い、本L8のunit closureへ数えない。

## Mutation閉鎖

mandatory itemを1件削除する、risk tagを1件known-lowへ落とす、deferred itemを捨てる、event payloadをcurrent bodyより
優先する、terminal linkを上書きする、cold/warmを合算する各mutationが最低1 oracleをredにする。

上記12件のruntime test citationは`L3Q-IT-024`までpendingであり、本設計PRでは実行済みと主張しない。
