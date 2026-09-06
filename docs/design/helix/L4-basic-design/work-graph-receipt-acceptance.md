---
title: "work graph と三段 receipt 検収 基本設計"
canonical_layer_scheme: L1-L12
layer: L4
paired_layer: L9
status: draft
plan: docs/plans/PLAN-L4-70-work-graph-receipt-acceptance.md
pair_artifact: docs/test-design/helix/L9-work-graph-receipt-acceptance-system-test-design.md
behavior_contract_id: WORK-GRAPH-RECEIPT-ACCEPTANCE-001
responsibility_owner: work-graph-receipt-acceptance
---

# work graph と三段 receipt 検収 基本設計

## 1. 目的と境界

実作業へ入る前に work graph（`graph_nodes` / `dependency_edges`）と capacity route（single-writer lease、
`continuation_fences` 相当の fence token パターン）を確定し、delegation-request receipt を発行してから
task を dispatch する。task 完了後は 独立 review receipt（`worker-review-receipt.ts` の identity/session/context 分離検証）、
worker terminal receipt（`worker-lifecycle-receipt.ts` の hash-chained event chain）、
親 acceptance receipt の三段を、別 identity・別 session・別 context かつ同一 HEAD・順序付きで
閉じる。receipt の先書き（未来 receipt の事前発行）と worker 自己承認を拒否する。既存の worker lifecycle
receipt / independent review receipt の仕組みを再利用し、別 Receipt Engine、別 ledger、別 DB table 系列、
別 workflow を新設しない。要件 trace 先は MIC-FR-001 / MIC-R-01..04 / MIC-AC-001..004
（`requirements-ir/refinement_contracts.json` に admit 済み）。

## 2. 構成責務

| component | 責務 | 禁止 |
|---|---|---|
| Work graph validator | `graph_nodes` / `dependency_edges` から READY task を抽出し、依存未完了・changed path・共有正本・DB projection・authority owner の競合が無いことを検証する（MIC-R-01） | dependency frontier を見ずに task を dispatch すること、graph 未確定での着手許可 |
| Delegation-request receipt issuer | READY task ごとに typed task packet と single-writer lease（fence token パターン、MIC-R-04 の `required_cell_binding` exact set）を exactly once 割り当て、発行 receipt に READY 判定の証跡（graph snapshot digest）を束縛する | 未来時刻の receipt 先発行、同一 lease の重複割当、exact set 欠落での admit |
| Worker terminal receipt issuer | `createWorkerLifecycleReceipt`（`worker-lifecycle-receipt.ts`）を再利用し、`requested → admitted → sandboxed → running → proposal_received → revalidated → {accepted\|rejected\|quarantined}` の hash-chained event を worker session 内で確定する | terminal state を review 前に確定すること、event chain の途中欠落・並べ替え |
| Independent review receipt issuer | `admitWorkerIndependentReview`（`worker-review-receipt.ts`）を再利用し、reviewer の identity・session・context_digest が worker と分離していることを検証してから verdict を発行する（MIC-R-03） | reviewer が worker と同一 identity/session/context であること、writer lease や Ready 化権限を reviewer が取得すること |
| Parent acceptance evaluator | worker terminal receipt・independent review receipt・delegation-request receipt の repository_head が一致し、順序（delegation → review → terminal → acceptance）が単調であることを検証してから親 acceptance receipt を発行する（MIC-R-02 の TL 統合権限に対応） | writer/reviewer による直接 merge 相当の自己 acceptance、review 欠落での acceptance、HEAD drift の看過 |

## 3. 正本グラフ

```text
graph_nodes / dependency_edges (work graph)
  └─ Work graph validator: READY task 抽出（依存・path・owner 競合なし）
       └─ Delegation-request receipt（lease + task packet, MIC-AC-001）
            └─ Independent review receipt（worker-review-receipt.ts、identity/session/context 分離で sealed）
                 └─ Worker terminal receipt（worker-lifecycle-receipt.ts、sealed review capability を必須入力に hash-chained）
                      └─ Parent acceptance receipt（同一 repository_head、順序付き三段の最終束縛）
```

三段 receipt（worker terminal / independent review / parent acceptance）は同一 `repository_head` を
共有しなければならない。delegation-request receipt が確定するまで worker の実行は開始できず、
independent review receipt（sealed verdict）が確定するまで worker terminal receipt は発行できず
（`worker-lifecycle-receipt.ts` の `createWorkerLifecycleReceipt` は sealed 済み review capability を
必須入力とし、未 seal を `WORKER_LIFECYCLE_REVIEW_UNSEALED` で拒否する）、worker terminal receipt が
確定し independent review の verdict が `approve` になるまで parent acceptance receipt は発行できない。
同型の先書き拒否パターンを work graph 側の delegation-request receipt にも適用する。

## 4. 状態とtransaction

```text
graph_confirmed → delegation_requested → review_sealed → worker_terminal_sealed → acceptance_sealed
                                    └────────────────────────────→ rejected / quarantined
```

各遷移は前段 receipt の `receipt_digest` を後段 receipt の入力として束縛する（`worker-lifecycle-receipt.ts`
の `verifier_receipt_digest` と同型）。fence token（capacity route の lease）は delegation-request receipt
発行時に単一 owner へ CAS（compare-and-swap）で割り当て、worker terminal receipt 確定または reject/quarantine
まで解放しない。同一 lease への並行割当は fail-close する。receipt を過去 HEAD へ遡って書き換える、または
未確定の independent review 状態を先取りして worker terminal receipt を発行することは禁止する。途中失敗（reject /
quarantine）は work graph 上の当該 dependency edge を READY へ戻さず、再割当は新しい delegation-request
receipt（新 lease）として扱う。

## 5. 設計リファクタリングgate

三段 receipt は worker terminal / independent review / parent acceptance の 3 種類だけとし、component
ごとの追加 receipt 種別、新 DB table、新 Receipt Engine は採用しない。work graph 側の受け皿は
`graph_nodes` / `dependency_edges` を継続利用し、delegation-request receipt は既存 lease パターン
（`continuation_fences` の `fence_token` / `owner` / `acquired_at` 3 列 CAS 構造）を模倣した最小拡張に
留める。既存 `worker-lifecycle-receipt.ts` / `worker-review-receipt.ts` の関数シグネチャと failure code
体系（`WORKER_LIFECYCLE_*` / `WORKER_REVIEW_*` / `HIL_ORCHESTRATION_*`）をそのまま呼び出し、独自の
並行 validator を新設しない。

## 6. L9合否境界

- work graph 未確定（READY 判定なし）での task 着手は拒否する。
- dependency edge が未完了のまま前倒しで delegation-request receipt を発行することを拒否する。
- delegation-request receipt・worker terminal receipt・independent review receipt・親 acceptance receipt のいずれも、確定前の未来 receipt の先書きを拒否する。
- worker terminal receipt の worker actor と independent review receipt の reviewer actor が同一
  identity・同一 session・同一 context_digest であることを拒否する（自己検収の拒否）。
- 三段 receipt 間で `repository_head` が drift している場合は parent acceptance receipt を発行しない。
- worker terminal receipt が確定していない、または independent review receipt の verdict が `approve`
  でない状態での parent acceptance receipt 発行を拒否する。
- required cell binding は unknown 追加 field で field 欠落を相殺できない（MIC-AC-004 negative mutation）。
- MIC-R-01..04 と MIC-AC-001..004 を欠落・重複 0 で束縛する。

| 要件 ID | 対応 component | 対応 fail-close |
|---|---|---|
| MIC-R-01 | Work graph validator / Delegation-request receipt issuer | dependency 未完了・競合 task の同時 dispatch 拒否 |
| MIC-R-02 | Parent acceptance evaluator | writer/reviewer による直接 acceptance（merge 相当）の拒否、TL 相当の単一評価者による順序確定 |
| MIC-R-03 | Independent review receipt issuer | 自己 review・write 可能 review・stale HEAD・blocker 残存の拒否 |
| MIC-R-04 | Delegation-request receipt issuer | `required_cell_binding` exact set 欠落・stale HEAD・lease 競合・scope 外 path・target reviewer 不一致の拒否 |
| MIC-AC-001 | Work graph validator | dependency frontier へ独立 task 2 件・競合 task 1 件を投入し、独立 2 件だけを exactly once 割当 |
| MIC-AC-002 | Parent acceptance evaluator | 2 lane の lane-ready 候補の順序は評価者だけが決定し、writer/reviewer による直接確定を拒否 |
| MIC-AC-003 | Independent review receipt issuer | writer terminal 後、別 identity/session/context の reviewer が exact HEAD を検証し、blocker 0 かつ同一 HEAD の場合だけ receipt 発行 |
| MIC-AC-004 | Delegation-request receipt issuer | required cell binding の各 field を 1 件ずつ欠落・改変し、unknown 追加 field による欠落相殺も拒否して、exact set が揃った packet だけを admit |

## 7. 現在の設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "worker-lifecycle-receipt",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-lifecycle-receipt.ts",
      "resource_kind": "typescript_export",
      "resource_name": "createWorkerLifecycleReceipt",
      "source_digest": "sha256:0bffec75b257d7f101ade5e7e54974e13a46e596b714ecf1ed4d747f8553e2a4",
      "current_authority": true
    },
    {
      "asset_id": "worker-independent-review",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-review-receipt.ts",
      "resource_kind": "typescript_export",
      "resource_name": "admitWorkerIndependentReview",
      "source_digest": "sha256:76ced4ac5d3ac84dfb08f88a9263133242275dbb5b738a704620f9be6fba9eee",
      "current_authority": true
    },
    {
      "asset_id": "worker-execution-origin",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-isolation-broker.ts",
      "resource_kind": "typescript_export",
      "resource_name": "resolveWorkerIsolationExecutionOrigin",
      "source_digest": "sha256:5a0f69619306f27c2c04fac3f05566346aec5c499631d62440d34c7e7b0e220d",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```

これは worker terminal receipt / independent review receipt の既存実在部分だけを示す。work graph
validator、delegation-request receipt issuer、parent acceptance evaluator は本 PLAN での新規設計であり、
実装・DB projection・trace 完了は主張しない。
