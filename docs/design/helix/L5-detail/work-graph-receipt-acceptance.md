---
title: "work graph と三段 receipt 検収 詳細設計"
canonical_layer_scheme: L1-L12
layer: L5
paired_layer: L8
status: draft
plan: docs/plans/PLAN-L5-96-work-graph-receipt-acceptance.md
pair_artifact: docs/test-design/helix/L8-work-graph-receipt-acceptance-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/work-graph-receipt-acceptance.md
behavior_contract_id: WORK-GRAPH-RECEIPT-ACCEPTANCE-001
responsibility_owner: work-graph-receipt-acceptance
---

# work graph と三段 receipt 検収 詳細設計

## 1. typed schema定義

work graph 側で新設する receipt は delegation-request receipt と parent acceptance receipt の 2 種類だけとし、
既存の worker terminal receipt（`WorkerLifecycleReceiptCapability`、`src/runtime/worker-lifecycle-receipt.ts`）
と independent review receipt（`WorkerIndependentReviewCapability`、`src/runtime/worker-review-receipt.ts`）は
そのまま入力契約として再利用する（§4）。

### 1.1 delegation-request receipt の schema

```yaml
kind: delegation_request_receipt
schema_version: helix-delegation-request-receipt.v1
required_cell_binding:            # exact set。過不足・unknown追加fieldを許さない
  lane_id: string                 # 対象 lane（single-writer lease の scope）
  issue_id: string                # 紐付く Issue 番号（work graph の subject_id と一致）
  behavior_contract_id: string    # MIC-FR 系 contract ID
  responsibility_owner: string    # component 責務名
  base_head: 40hex-git-sha        # dispatch 判断時点の repository HEAD
  candidate_head: 40hex-git-sha   # worker が作業対象とする HEAD（base_head と同一または祖先関係）
  writer_lease:                   # fence token（capacity route の lease、§3）
    fence_token: integer
    owner: string
    acquired_at: RFC3339
  target_reviewer: string         # independent review を担う identity（worker と別 identity 必須）
  effective_rule_packet_digest: sha256digest   # 適用中 rule packet の digest（drift検知用）
  allowed_paths: string[]         # scope 内 path の exact list（重複・空文字を許さない）
  forbidden_paths: string[]       # scope 外 path の exact list
  lane_ready_receipt:             # Work graph validator が発行した READY 判定の証跡
    graph_snapshot_digest: sha256digest
    dependency_edge_ids: string[]   # 完了済み dependency edge の exact set
graph_snapshot_digest: sha256digest   # required_cell_binding.lane_ready_receipt と同値（束縛検証用の二重参照）
issued_at: RFC3339
receipt_digest: sha256digest
```

`required_cell_binding` は exact key set（`lane_id` / `issue_id` / `behavior_contract_id` /
`responsibility_owner` / `base_head` / `candidate_head` / `writer_lease` / `target_reviewer` /
`effective_rule_packet_digest` / `allowed_paths` / `forbidden_paths` / `lane_ready_receipt`）だけを許可する。
`worker-lifecycle-receipt.ts` の `exactKeys` と同型のチェックを適用し、1 field でも欠落・改変された packet、
または未知の追加 field を持つ packet はいずれも admit しない（unknown field による欠落相殺の拒否、
MIC-AC-004）。`writer_lease` と `lane_ready_receipt` はネストしたレコードだが、内側も exact key set を適用する。

### 1.2 parent acceptance receipt の schema

```yaml
kind: parent_acceptance_receipt
schema_version: helix-parent-acceptance-receipt.v1
lane_id: string
issue_id: string
repository_head: 40hex-git-sha        # 三段 receipt が共有する同一 HEAD
delegation_receipt_digest: sha256digest    # delegation-request receipt の receipt_digest
review_receipt_digest: sha256digest        # independent review receipt の receipt_digest（verdict=approve のみ許容）
review_head_sha: 40hex-git-sha             # reviewer が exact HEAD 検証を行った対象 SHA（repository_head と一致必須、§2.1）
terminal_receipt_digest: sha256digest      # worker terminal receipt の receipt_digest（terminal_state=accepted のみ許容）
evaluator:
  identity: string                    # delegation の writer / review の worker・reviewer いずれとも不一致
  session: string
  context_digest: sha256digest
sealed_at: RFC3339
receipt_digest: sha256digest
```

parent acceptance receipt は delegation-request receipt・independent review receipt・worker terminal receipt の
3 種の `receipt_digest` を必須入力として束縛し、`evaluator` の identity/session/context_digest がいずれの
writer/reviewer とも異なることを検証する（MIC-R-02 の TL 相当単一評価者による順序確定、writer/reviewer 自己
acceptance の拒否）。

## 2. ordering 検証の判定関数契約

判定関数は前段 receipt の `receipt_digest` を後段 receipt 生成関数の必須入力とし、未確定（欠落・null）の場合は
後段 receipt 生成関数自体を呼び出せない、または typed failure code を返す。`worker-lifecycle-receipt.ts` の
`createWorkerLifecycleReceipt` が sealed 済み review capability を必須入力とし未 seal を
`WORKER_LIFECYCLE_REVIEW_UNSEALED` で拒否する構造をそのまま外側へ延長する。

```ts
// 概念シグネチャ（実装層 L6 で確定。ここでは契約のみ固定する）
function evaluateDelegationRequestOrdering(input: {
  laneReadyReceipt: LaneReadyReceiptCapability;          // Work graph validator が発行、READY 判定の証跡
  requiredCellBinding: RequiredCellBindingV1;             // §1.1 exact set
  lease: FenceLeaseCapability;                            // §3 の CAS 割当結果
}): { ok: true; receipt: DelegationRequestReceiptCapability }
  | { ok: false; failure_code: WorkGraphFailureCode };

function evaluateParentAcceptanceOrdering(input: {
  delegation: DelegationRequestReceiptCapability;   // sealed 済みでなければならない
  review: WorkerIndependentReviewCapability;        // isWorkerIndependentReview() で sealed 確認
  terminal: WorkerLifecycleReceiptCapability;        // isWorkerLifecycleReceipt() で sealed 確認
  evaluator: EvaluatorActorV1;
}): { ok: true; receipt: ParentAcceptanceReceiptCapability }
  | { ok: false; failure_code: WorkGraphFailureCode };
```

`evaluateParentAcceptanceOrdering` の判定順序は次を単調に確認する。

1. `delegation` / `review` / `terminal` の 3 receipt がいずれも sealed（`isWorkerLifecycleReceipt` /
   `isWorkerIndependentReview` 相当の WeakSet 検証、または delegation 側の同型 sealed マーカー）であること。
2. `delegation.required_cell_binding.candidate_head` / parent acceptance receipt 入力の `review_head_sha` /
   `terminal.head_sha` が `repository_head` と 1 bit も違わず一致すること（同一 `repository_head` 検証、§2.1）。
3. `review.verdict === "approve"` かつ `terminal.terminal_state === "accepted"` であること。
4. `evaluator.identity` が `terminal` の worker actor（`worker-lifecycle-receipt.ts` の
   run 起点 origin）とも `review.reviewer_model` とも不一致であること（自己 acceptance 拒否）。
5. 上記いずれかが崩れた時点で fail-close し、後続の digest 計算・DB projection へ進まない。

### 2.1 同一 HEAD 検証

`repository_head` は delegation-request receipt の `required_cell_binding.candidate_head`、parent acceptance
receipt schema（§1.2）が required field として持つ `review_head_sha`、worker terminal receipt の `head_sha`
（`worker-lifecycle-receipt.ts` 側に実在する field）の 3 値を突合し、完全一致だけを許容する。既存の
`worker-review-receipt.ts`（`WorkerReviewActorV1` / `WorkerIndependentReviewCapability`）と
`WorkerIsolationExecutionOrigin` には HEAD field が存在しないため、review 経路の HEAD は既存 schema の
改変ではなく、本 PLAN が新設する parent acceptance receipt 入力契約の `review_head_sha`（reviewer が exact
HEAD 検証を行った対象 SHA、MIC-AC-003 の lane-ready 検証記録から供給）として束縛する。1 件でも drift した場合は parent acceptance receipt の digest 計算へ
到達せず `WORK_GRAPH_HEAD_DRIFT` を返す。

## 3. CAS/stale 判定

fence token は `continuation_fences` の `fence_token` / `owner` / `acquired_at` 3 列 CAS 構造を模した最小拡張と
し、delegation-request receipt 発行時に compare-and-swap で単一 owner へ割り当てる。

- **取得条件**: 対象 `lane_id` の現在 `fence_token` を読み取り、要求側が保持する `fence_token` と一致する場合
  だけ新しい `fence_token`（単調増加）へ更新し `owner` を要求側 identity に差し替える。不一致（stale read）は
  `WORK_GRAPH_LEASE_CAS_STALE` で拒否する。
- **並行 acquire の収束**: 同一 `lane_id` へ 2 件以上の acquire が同時に到達した場合、先着 1 件だけが CAS を
  通過し、後着は必ず不一致を観測して `WORK_GRAPH_LEASE_CAS_STALE` で拒否される（owner 不一致の並行 acquire を
  0 件へ収束）。
- **解放条件**: `fence_token` は worker terminal receipt が確定（`terminal_state` が
  `accepted` / `rejected` / `quarantined` のいずれかで sealed）するまで解放しない。それ以外の理由（例: worker
  進行中のタイムアウト推測、review 未確定段階での早期解放）による解放要求は `WORK_GRAPH_LEASE_EARLY_RELEASE`
  で拒否する。
- **reject/quarantine 時の再割当**: `terminal_state` が `rejected` または `quarantined` で終端した lane は、
  dependency edge を自動的に READY へ戻さない。再割当は新しい `fence_token`（旧値と異なる単調増加値）を持つ
  新しい delegation-request receipt として発行し、旧 `fence_token` を再利用する要求は
  `WORK_GRAPH_LEASE_CAS_STALE` で拒否する（stale lease の再利用禁止）。
- **後着 stale 拒否の一般化**: CAS 判定は `fence_token` の値一致だけで判断し、`owner` 文字列や `acquired_at`
  時刻の先着判定へフォールバックしない（時刻ベースの race 判定は使わない）。

## 4. 既存 worker-lifecycle/review receipt との接続点

新規 wrapper 型・新規 Receipt Engine・新規 DB table 系列は作らない。既存関数をそのまま入力契約として呼び出す。

- **independent review receipt**: `admitWorkerIndependentReview`（`src/runtime/worker-review-receipt.ts`）を
  そのまま呼び出す。`target_reviewer`（delegation-request receipt の required cell binding）は
  `admitWorkerIndependentReview` の `reviewerCurrent` に対応する identity と一致しなければならず、不一致は
  `WORK_GRAPH_TARGET_REVIEWER_MISMATCH` で拒否する。sealed 判定は `isWorkerIndependentReview()` をそのまま使う。
- **worker terminal receipt**: `createWorkerLifecycleReceipt`（`src/runtime/worker-lifecycle-receipt.ts`）を
  そのまま呼び出す。この関数は sealed 済み review capability を必須入力とし、未 seal を
  `WORKER_LIFECYCLE_REVIEW_UNSEALED` で拒否する既存 fail-close をそのまま利用する（work graph 側で重複判定を
  作らない）。sealed 判定は `isWorkerLifecycleReceipt()` をそのまま使う。
- **worker execution origin**: `resolveWorkerIsolationExecutionOrigin`（`src/runtime/worker-isolation-broker.ts`）
  を worker/reviewer 双方の origin 解決にそのまま使い、`evaluator` の識別にも同型の origin 解決を適用する。
- **work graph 正本**: `graph_nodes` / `dependency_edges`（`src/schema/harness-db-tables-graph.ts`）を READY
  task 抽出の唯一の入力とし、新規 graph 表現を作らない。
- **lease 列構造**: `continuation_fences`（`src/schema/harness-db-tables-core.ts`、`fence_token` / `owner` /
  `acquired_at` 3 列）の CAS 構造をそのまま模倣し、delegation-request receipt 側の `writer_lease` サブレコード
  として再利用する（新しい CAS アルゴリズムを別途設計しない）。

## 5. failure code一覧

すべて `WORK_GRAPH_*` 命名とし、いずれも fail-close（該当条件を満たさない限り receipt を admit/seal しない）。

| code | 条件 |
|---|---|
| `WORK_GRAPH_INPUT_INVALID` | receipt 入力の型・identifier 形式が不正（`lane_id` / `issue_id` 等の identifier 形式違反を含む） |
| `WORK_GRAPH_DEPENDENCY_NOT_READY` | dependency edge が未完了のまま delegation-request receipt 発行を試行（MIC-R-01） |
| `WORK_GRAPH_CELL_BINDING_INVALID` | `required_cell_binding` の exact set から 1 field でも欠落・改変、または unknown 追加 field による欠落相殺（MIC-AC-004） |
| `WORK_GRAPH_SCOPE_PATH_VIOLATION` | `allowed_paths` / `forbidden_paths` の scope 外 path が changed path に含まれる |
| `WORK_GRAPH_TARGET_REVIEWER_MISMATCH` | `target_reviewer` と independent review receipt の reviewer identity が不一致 |
| `WORK_GRAPH_LEASE_CAS_STALE` | fence token の CAS 取得が stale read（既に更新済みの `fence_token` に対する後着書込み、または旧 `fence_token` の再利用） |
| `WORK_GRAPH_LEASE_EARLY_RELEASE` | worker terminal receipt 確定前の fence token 解放要求 |
| `WORK_GRAPH_RECEIPT_FUTURE_WRITE` | 確定前の未来 receipt の先書き（delegation-request / worker terminal / independent review / parent acceptance いずれも） |
| `WORK_GRAPH_ORDER_DIGEST_MISSING` | 後段 receipt が要求する前段 `receipt_digest` が欠落（未 seal） |
| `WORK_GRAPH_HEAD_DRIFT` | 三段（＋delegation）receipt 間で `repository_head` が 1 bit でも不一致 |
| `WORK_GRAPH_REVIEW_NOT_APPROVED` | independent review receipt の `verdict` が `approve` でない状態での parent acceptance receipt 発行試行 |
| `WORK_GRAPH_TERMINAL_MISSING` | worker terminal receipt が欠落した状態での parent acceptance receipt 発行試行 |
| `WORK_GRAPH_SELF_ACCEPTANCE` | `evaluator` が writer（worker terminal 起点 origin）または reviewer（independent review の reviewer_model）と同一 identity/session/context_digest |

`WORKER_LIFECYCLE_*` / `WORKER_REVIEW_*` / `HIL_ORCHESTRATION_*` は既存関数がそのまま返す failure code であり、
本設計では再定義しない（§4 の接続点をそのまま通過させる）。

## 6. 実装順

1. Red fixture で「dependency 未完了のまま delegation-request receipt を admit してしまう」現状（未実装）を
   固定する。
2. `required_cell_binding` の exact set 検証と fence token CAS を実装し、`WORK_GRAPH_CELL_BINDING_INVALID` /
   `WORK_GRAPH_LEASE_CAS_STALE` を Red→Green にする。
3. `evaluateDelegationRequestOrdering` / `evaluateParentAcceptanceOrdering` を実装し、既存
   `admitWorkerIndependentReview` / `createWorkerLifecycleReceipt` を入力契約として接続する。
4. 同一 HEAD 検証・self-acceptance 拒否・reject/quarantine 再割当を実装し、L9 の U-WGR-S-001..020 を通す。
5. DB projection・doctor・full CI・独立 AI-B receipt を同一 HEAD へ束縛する。

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

work graph validator、delegation-request receipt issuer、parent acceptance evaluator（`WORK_GRAPH_*` 全 failure
code を含む）は本 PLAN での新規設計であり、実装・DB projection・trace 完了は主張しない。既存 3 資産
（worker terminal receipt / independent review receipt / worker execution origin）だけが現時点の実在部分である。
