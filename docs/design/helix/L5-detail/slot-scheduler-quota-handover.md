---
title: "8-slot scheduler と quota handover 詳細設計"
canonical_layer_scheme: L1-L12
layer: L5
paired_layer: L8
status: draft
plan: docs/plans/PLAN-L5-97-slot-scheduler-quota-handover.md
pair_artifact: docs/test-design/helix/L8-slot-scheduler-quota-handover-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/slot-scheduler-quota-handover.md
behavior_contract_id: SLOT-SCHEDULER-QUOTA-HANDOVER-001
responsibility_owner: slot-scheduler-quota-handover
---

# 8-slot scheduler と quota handover 詳細設計

## 1. typed schema定義

scheduler が新設する typed record は slot accounting row、bounded queue snapshot、quota handover packet、
capacity evidence、conflict scope（§3.1）の 5 種類だけとする。lease は #213 の `WorkGraphLeaseV1`、terminal 判定は
`WorkerLifecycleReceiptCapability` をそのまま入力契約として再利用する（§4）。

### 1.1 slot accounting row の schema

```yaml
kind: slot_accounting_row
schema_version: helix-slot-accounting-row.v1
slot_id: string                 # 稼働 slot の識別子（capacity 内で一意）
parent_id: string               # 管理・統合セル側の親識別子（lane を束ねる単位）
task_id: string                 # 割り当てた task（work graph の node id と一致）
dependency_ids: string[]        # 当該 task が依存する dependency edge id の exact list
slot_state: enum                # queued / dispatched / leased / running / handover_pending / handover_completed / terminal / failed / backpressured
quota_snapshot:                 # dispatch 時点の quota 観測値
  consumed: integer
  limit: integer
  threshold: integer            # handover を起動する境界（threshold ≦ limit）
writer_lease:                   # #213 の WorkGraphLeaseV1 と同一構造
  fence_token: integer
  owner: string
  acquired_at: RFC3339
started_at: RFC3339 | null      # running へ遷移した時刻。未遷移は null
terminated_at: RFC3339 | null   # terminal / failed へ遷移した時刻。未終端は null
```

9 field は exact key set とし、1 field でも欠落・改変された row、および unknown 追加 field を持つ row は
いずれも admit しない（unknown field による欠落相殺の拒否）。`quota_snapshot` と `writer_lease` は
ネストレコードだが、内側にも exact key set を適用する。`slot_state` は上記 enum の値だけを許す。

### 1.2 bounded queue snapshot の schema

```yaml
kind: bounded_queue_snapshot
schema_version: helix-bounded-queue-snapshot.v1
capacity: integer          # 同時稼働 slot 上限。1..8 の範囲のみ許可（既定 8）
queue_limit: integer       # 待機 task 上限。必須 field（欠落＝unbounded として拒否）
entries: string[]          # 待機中 task_id の順序付き exact list（重複を許さない）
running: string[]          # 稼働中 task_id の exact list（length ≦ capacity）
```

`queue_limit` は必須であり、欠落・null・非正整数はいずれも unbounded queue として拒否する。
`entries.length` が `queue_limit` に達している状態での追加受理（`admitQueueEntry`、§2）は成功結果を
返さず、backpressure 結果（`{ ok: false, failure_code: "SCHEDULER_QUEUE_BACKPRESSURE" }`）を返す。
backpressure は「受理せず、かつ drop もしない」ことを意味し、呼び出し側が成功として扱えない
typed 結果とする。`entries` は backpressure 時に一切変更しない。

### 1.3 quota handover packet の schema

```yaml
kind: quota_handover_packet
schema_version: helix-quota-handover-packet.v1
lane_id: string
task_id: string
candidate_head: 40hex-git-sha       # 引き継ぎ時点の作業対象 HEAD
writer_lease:                        # 旧 owner が保持していた lease（fence token 系譜の起点）
  fence_token: integer
  owner: string
  acquired_at: RFC3339
remaining_scope:                     # 残作業境界
  allowed_paths: string[]
  forbidden_paths: string[]
target_runtime: string               # 引き継ぎ先 runtime
target_reviewer: string              # 引き継ぎ後も維持する independent reviewer identity
issued_at: RFC3339
packet_digest: sha256digest
```

5 要素（`lane_id` / `task_id` / `candidate_head` / `writer_lease` / `remaining_scope`）は
handover の必須束縛であり、1 件でも欠落した packet での slot 交代は拒否する。

### 1.4 capacity evidence の schema

```yaml
kind: capacity_evidence
schema_version: helix-capacity-evidence.v1
lane_count: integer          # fixture が実際に走らせた lane 数。必須 field
claimed_capacity: integer    # 主張する capacity
fixture_path: string         # evidence の出所
```

`lane_count` が欠落した evidence、および `lane_count < claimed_capacity` の evidence はいずれも
`SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED` で拒否する。4-lane fixture で 8-slot を主張する経路は
この 1 条件で閉じる。

## 2. 判定関数契約

```ts
// 概念シグネチャ（実装層 L6 で確定。ここでは契約のみ固定する）
function admitSlotAccountingRow(input: unknown):
  | { ok: true; row: SlotAccountingRowV1 }
  | { ok: false; failure_code: SchedulerFailureCode };

function evaluateDispatchAdmission(input: {
  queue: BoundedQueueSnapshotV1;
  candidate: SlotAccountingRowV1;
  candidateScope: ConflictScopeV1;                 // §3。candidate の conflict 判定材料
  running: SlotAccountingRowV1[];                  // 現在稼働中の row（capacity 会計の対象）
  runningScopes: Record<string, ConflictScopeV1>;  // task_id -> 稼働 row の conflict 判定材料
  readyDependencyIds: string[];                    // work graph が READY と判定した dependency edge id
}): { ok: true; admitted: SlotAccountingRowV1 }
  | { ok: false; failure_code: SchedulerFailureCode };

function admitQueueEntry(input: {
  queue: BoundedQueueSnapshotV1;
  taskId: string;
}): { ok: true; queue: BoundedQueueSnapshotV1 }
  | { ok: false; failure_code: SchedulerFailureCode };

function evaluateFrontierRecalculation(input: {
  mergedLaneId: string;                 // 直前に merge された lane
  candidate: SlotAccountingRowV1;       // merge 候補へ戻す対象 lane
  candidateScope: ConflictScopeV1;
  revalidated: {                        // lane A merge 後の再判定結果
    base_head: 40hex;                   // 再評価後の base HEAD
    ci_passed: boolean;
    review_approved: boolean;
    db_receipt_digest: sha256digest | null;
  };
  requestsMergeOrderDecision: boolean;  // dispatcher が merge 順序確定を要求したか
}): { ok: true; candidate: SlotAccountingRowV1 }
  | { ok: false; failure_code: SchedulerFailureCode };

function evaluateQuotaHandover(input: {
  current: SlotAccountingRowV1;         // handover 元。slot_state=running
  packet: QuotaHandoverPacketV1;
  successorOwner: string;
}): { ok: true; packet: QuotaHandoverPacketV1 }
  | { ok: false; failure_code: SchedulerFailureCode };

function evaluateSlotFailureIsolation(input: {
  failed: SlotAccountingRowV1;
  peers: SlotAccountingRowV1[];         // 依存関係の無い他 slot
  after: SlotAccountingRowV1[];         // failure 処理後の peers 観測値
}): { ok: true }
  | { ok: false; failure_code: SchedulerFailureCode };

function admitCapacityEvidence(input: unknown):
  | { ok: true; evidence: CapacityEvidenceV1 }
  | { ok: false; failure_code: SchedulerFailureCode };
```

`evaluateDispatchAdmission` の判定順序は次を単調に確認し、崩れた時点で fail-close する。

1. `candidate` と `running` の全 row が §1.1 の exact set を満たす（`SCHEDULER_SLOT_ACCOUNTING_INVALID`）。
2. `queue.queue_limit` が正整数として存在する（欠落は `SCHEDULER_QUEUE_UNBOUNDED`）。
3. `queue.capacity` が 1..8 の範囲内である（範囲外は `SCHEDULER_INPUT_INVALID`）。
3.5. `candidateScope` / `runningScopes` の各 scope / `readyDependencyIds` が形式を満たす
   （不正は `SCHEDULER_INPUT_INVALID`）。conflict 判定材料が欠けたまま 4 軸判定へ進まない。
4. `candidate.dependency_ids` が `readyDependencyIds` に完全包含される（`SCHEDULER_DEPENDENCY_NOT_READY`）。
5. `candidate` と `running` の間で conflict exclusion 4 軸（§3）が成立する（`SCHEDULER_CONFLICT_EXCLUSION_VIOLATION`）。
6. `running.length < queue.capacity` である（超過は `SCHEDULER_CAPACITY_EXCEEDED`）。
7. lease 占有の一意性が成立する（`SCHEDULER_LEASE_DOUBLE_OWNERSHIP`、判定キーは §2.1）。
8. `started_at` / `terminated_at` の時系列が逆行しない（`SCHEDULER_TIME_ORDER_INVALID`）。

capacity 超過の判定（6）は queue 判定（2）より後に置く。queue_limit 欠落を capacity 超過として
誤報告しないためであり、判定順序は L8 oracle で固定する。

### 2.1 lease 二重所有の判定キー

`acquireWorkGraphLease`（`src/runtime/work-graph-receipt-acceptance.ts`）が発行する `fence_token` は
`currentLease?.fence_token ?? 0` を +1 する **lane 内の単調カウンタ**であり、lane を識別する成分を
持たない。したがって別 lane の初回 lease は同じ `fence_token = 1` を持ち得る。二重所有の判定に
`fence_token` の値だけを使うと、無関係な lane 同士を誤って衝突と判定する。

判定キーは `(candidate.parent_id, candidate.task_id)` を lane 識別として使い、次の 2 条件で
`SCHEDULER_LEASE_DOUBLE_OWNERSHIP` を返す。

- `running` に同じ `(parent_id, task_id)` を持つ row が既に存在し、その `writer_lease.owner` が
  `candidate.writer_lease.owner` と異なる（同一 lane に 2 owner が同時成立）。
- 同一 lane の既存 row と `owner` は一致するが `fence_token` が異なる（旧 owner の lease を
  解放せずに新しい token を取得した状態。handover 中の未解放検知、§4）。

`fence_token` の値比較は同一 lane 内に限定し、lane をまたいだ値一致は衝突として扱わない。

### 2.2 判定順序（dispatch 以外の関数）

`evaluateDispatchAdmission` 以外の判定関数も、複数条件が同時成立したときに返す failure code を
一意にするため、判定順序を固定する。

**`admitQueueEntry`**
1. `queue.queue_limit` が正整数として存在する（`SCHEDULER_QUEUE_UNBOUNDED`）。
2. `taskId` が `entries` / `running` に重複しない（`SCHEDULER_INPUT_INVALID`）。
3. `entries.length < queue.queue_limit` である。到達している場合は `entries` を一切変更せずに
   `SCHEDULER_QUEUE_BACKPRESSURE` を返す（受理せず、かつ drop もしない）。

**`evaluateQuotaHandover`**
1. `current` が §1.1 の exact set を満たし `slot_state` が `running` である（`SCHEDULER_SLOT_ACCOUNTING_INVALID`）。
2. `packet` の 5 必須要素が揃っている（`SCHEDULER_HANDOVER_PACKET_MISSING`）。
3. `packet` が未 ack である（ack 済みの再配送は `SCHEDULER_HANDOVER_ACK_REPLAY`）。
4. `packet.lane_id` / `packet.target_reviewer` / `packet.candidate_head` が `current` 側の指定と
   一致する（`SCHEDULER_HANDOVER_TARGET_MISMATCH`）。
5. `current.quota_snapshot.consumed < threshold` である（到達後は `SCHEDULER_QUOTA_EXHAUSTED`）。
6. `packet.writer_lease.owner` が稼働 row の lease owner と一致する（不一致は
   `SCHEDULER_LEASE_DOUBLE_OWNERSHIP`）。CAS は owner を見ないため別分岐で判定する。
7. 旧 owner の lease が解放済みである（未解放のまま後継が acquire する要求は
   `SCHEDULER_LEASE_DOUBLE_OWNERSHIP`）。
8. `successorOwner` が identifier 形式を満たす（不正は `SCHEDULER_INPUT_INVALID`）。
9. `acquireWorkGraphLease` の CAS に observed = 稼働 row の `writer_lease`、expected =
   `packet.writer_lease.fence_token` を渡す。両方を packet 由来にすると比較が自己参照になり
   CAS が無効化されるため禁止する。CAS 失敗は `WORK_GRAPH_*` をそのまま透過させる（§4）。

packet 欠落（2）を ack 判定（3）より先に置くのは、必須要素を欠く packet の ack 状態を評価しない
ためである。

**`evaluateSlotFailureIsolation`**
1. `failed`、`peers`、`after`（failure 処理後の観測値）の全 row が exact set を満たす
   （`SCHEDULER_SLOT_ACCOUNTING_INVALID`）。観測後 row も検証対象に含める。
2. `failed.writer_lease` が解放済みである（未解放のまま slot を除去する要求は
   `SCHEDULER_LEASE_DOUBLE_OWNERSHIP`）。
3. `after` の各 peer が `peers` と `slot_state`・`writer_lease`・queue 位置で完全一致する
   （差分は `SCHEDULER_FAILURE_ISOLATION_BREACH`）。

**`evaluateFrontierRecalculation`**
1. `requestsMergeOrderDecision` が true なら、他の判定へ進まず
   `SCHEDULER_MERGE_AUTHORITY_VIOLATION` を返す（MIC-R-02 の権限非移譲）。
2. `revalidated.base_head` が merge 後の HEAD と一致する（merge 前 HEAD の receipt 流用は
   `SCHEDULER_INPUT_INVALID`）。
3. `ci_passed` / `review_approved` / `db_receipt_digest` が全て再判定済みである（欠落は
   `SCHEDULER_INPUT_INVALID`）。上記を満たす候補だけを merge 候補へ復帰させ、順序の確定と
   親 acceptance receipt の発行は #213 の Parent acceptance evaluator に委ねる。

**`admitCapacityEvidence`**
1. `lane_count` / `claimed_capacity` / `fixture_path` が揃っている（欠落は
   `SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED`）。
2. `lane_count >= claimed_capacity` である（不足は `SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED`）。

## 3. conflict exclusion 4 軸

### 3.1 判定材料の schema

conflict 判定に必要な field は slot accounting row（§1.1 の exact set 9 field）には含まれない。
accounting row は exact set であり unknown 追加 field を許さないため、判定材料は別レコードとして
dispatch 入力へ明示的に供給する。

```yaml
kind: conflict_scope
schema_version: helix-conflict-scope.v1
task_id: string                  # 対応する slot accounting row の task_id
issue_id: string                 # RequiredCellBindingV1.issue_id から供給
behavior_contract_id: string     # RequiredCellBindingV1.behavior_contract_id から供給
responsibility_owner: string     # RequiredCellBindingV1.responsibility_owner から供給
allowed_paths: string[]          # RequiredCellBindingV1.allowed_paths から供給
shared_authority_ids: string[]   # 共有正本・DB projection・authority owner の識別子集合
```

conflict 判定に使う 4 field（`issue_id` / `behavior_contract_id` / `responsibility_owner` /
`allowed_paths`）は #213 の `RequiredCellBindingV1`（`src/runtime/work-graph-receipt-acceptance.ts` に
実在する 12 field の exact set）から**そのまま写して**供給し、binding 側の型を改変しない。
`task_id` は対応する `SlotAccountingRowV1.task_id` と一致させる相関キーであり、conflict 判定そのものには
使わない（`RequiredCellBindingV1` に同名 field は無く、同型は `lane_id` である）。
`shared_authority_ids` だけは `RequiredCellBindingV1` に実在しないため、本 PLAN が新設する
`ConflictScopeV1` の field として定義する（既存 binding へ field を追加しない。追加すると #213 の
exact set 検証が全て壊れるため）。供給元は work graph 側の node 属性（共有正本・DB projection・
authority owner の識別子）とし、scheduler は受け取った値を判定するだけで生成しない。

### 3.2 4 軸の衝突条件

`candidateScope` と `runningScopes` の各エントリについて次の 4 軸を**それぞれ独立に**判定し、
1 軸でも衝突したら `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` を返す。

| 軸 | 衝突条件 | 供給元 |
|---|---|---|
| Issue | `issue_id` が同一 | `RequiredCellBindingV1.issue_id` |
| 責務 | `behavior_contract_id` または `responsibility_owner` が同一 | `RequiredCellBindingV1` の同名 field |
| 共有正本 | `shared_authority_ids` が交差 | `ConflictScopeV1`（本 PLAN 新設、work graph node 属性） |
| changed path | `allowed_paths` の path 集合が交差（prefix 一致を含む） | `RequiredCellBindingV1.allowed_paths` |

本判定は**複数 row 間の相互排他**であり、単一 binding の per-task 判定（dependency READY / base_head /
scope path / lease CAS）は #213 の `evaluateDelegationRequestOrdering` が唯一の実装者であるため
再実装しない（L4 §5 の設計 gate）。

## 4. lease と terminal receipt の接続点

新規 lease アルゴリズム・新規 Receipt Engine・新規 DB table 系列は作らない。

- **lease 取得**: `acquireWorkGraphLease`（`src/runtime/work-graph-receipt-acceptance.ts`）をそのまま呼ぶ。
  CAS 失敗は同関数が返す `WORK_GRAPH_LEASE_CAS_STALE` をそのまま透過させ、scheduler 側で再判定しない。
- **lease 解放**: `releaseWorkGraphLease` をそのまま呼ぶ。terminal receipt 検証を通らない解放要求は
  同関数の `WORK_GRAPH_LEASE_EARLY_RELEASE` で拒否される。
- **terminal 判定**: `verifyWorkerLifecycleReceipt`（`src/runtime/worker-lifecycle-receipt.ts`）をそのまま
  使い、scheduler 側で terminal state を再定義しない。
- **handover の lease 系譜**: 旧 owner の `releaseWorkGraphLease` 成功と後継 owner の
  `acquireWorkGraphLease` 成功を 1 遷移として扱う。旧 owner 解放前の後継 acquire は
  `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` で拒否する。
- **観測記録との分離**: `src/runtime/agent-slots.ts` は fail-open な並列観測であり、本判定関数の
  入力にも根拠にもしない。capacity gate の authority は §1.2 の `capacity` と §1.1 の accounting row だけとする。

## 5. failure code一覧

すべて `SCHEDULER_*` 命名とし、いずれも fail-close（条件を満たさない限り dispatch / handover / evidence を
admit しない）。

| code | 条件 |
|---|---|
| `SCHEDULER_INPUT_INVALID` | 入力の型・identifier 形式・enum 値・capacity 範囲（1..8）が不正 |
| `SCHEDULER_SLOT_ACCOUNTING_INVALID` | slot accounting row の exact set 9 field から欠落・改変、または unknown 追加 field による欠落相殺 |
| `SCHEDULER_CAPACITY_EXCEEDED` | 稼働 slot 数が `capacity` に達した状態での dispatch 試行 |
| `SCHEDULER_DEPENDENCY_NOT_READY` | `dependency_ids` が READY 集合に包含されない前倒し dispatch |
| `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` | conflict exclusion 4 軸のいずれかが稼働 row と衝突 |
| `SCHEDULER_QUEUE_UNBOUNDED` | `queue_limit` の欠落・null・非正整数（unbounded queue） |
| `SCHEDULER_QUEUE_BACKPRESSURE` | `admitQueueEntry` で queue 上限到達。受理せず、かつ drop もしない typed 結果（`ok: false` として返し、呼び出し側は成功として扱えない） |
| `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` | 同一 task／fence token に対する 2 owner の同時成立（handover 中の旧 owner 未解放を含む） |
| `SCHEDULER_QUOTA_EXHAUSTED` | `quota_snapshot.consumed` が `threshold` へ到達した後の handover 試行（事後 handover） |
| `SCHEDULER_HANDOVER_PACKET_MISSING` | handover packet の 5 必須要素のいずれかが欠落した状態での slot 交代 |
| `SCHEDULER_HANDOVER_TARGET_MISMATCH` | handover 通知の lane／target reviewer／candidate HEAD が指定と不一致 |
| `SCHEDULER_HANDOVER_ACK_REPLAY` | ack 済み handover 通知の再配送・再 ack |
| `SCHEDULER_FAILURE_ISOLATION_BREACH` | 1 slot の failure により依存関係の無い他 slot の state・lease・queue 位置が変化 |
| `SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED` | `lane_count` 欠落、または `lane_count < claimed_capacity` の capacity evidence |
| `SCHEDULER_TIME_ORDER_INVALID` | `terminated_at` < `started_at`、または未来時刻の snapshot 先書き |
| `SCHEDULER_MERGE_AUTHORITY_VIOLATION` | `evaluateFrontierRecalculation` へ merge 順序確定・親 acceptance 発行の要求（`requestsMergeOrderDecision`）が渡された（MIC-R-02 の権限非移譲） |

`WORK_GRAPH_*` / `WORKER_LIFECYCLE_*` は #213 の既存関数がそのまま返す failure code であり、
本設計では再定義せず §4 の接続点を透過させる。したがって判定関数の失敗型は
`SchedulerFailureCode | WorkGraphFailureCode` の union であり、CAS 失敗を
`SCHEDULER_LEASE_DOUBLE_OWNERSHIP` へ再命名してはならない。

## 6. 実装順

1. Red fixture で「capacity 超過 dispatch と queue_limit 欠落を admit してしまう」現状（未実装）を固定する。
2. `admitSlotAccountingRow` の exact set 検証と `evaluateDispatchAdmission` の判定順序 1..8、
   `admitQueueEntry` の 1..3 を実装し、`SCHEDULER_SLOT_ACCOUNTING_INVALID` /
   `SCHEDULER_QUEUE_UNBOUNDED` / `SCHEDULER_QUEUE_BACKPRESSURE` / `SCHEDULER_CAPACITY_EXCEEDED` を
   Red→Green にする。
3. conflict exclusion 4 軸（§3.2）と lease 二重所有の判定キー（§2.1）を実装し、#213 の per-task 判定を
   再実装していないことを oracle で固定する。
4. `evaluateQuotaHandover`、`evaluateSlotFailureIsolation`、`evaluateFrontierRecalculation`、
   `admitCapacityEvidence` を §2.2 の判定順序どおりに実装し、L8 の U-SSQ-001..065 を通す。
5. mutation runner で分岐網羅を機械検証し、full CI・独立 AI-B receipt を同一 HEAD へ束縛する。

## 7. 現在の設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "work-graph-lease",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/work-graph-receipt-acceptance.ts",
      "resource_kind": "typescript_export",
      "resource_name": "acquireWorkGraphLease",
      "source_digest": "sha256:629e516db0b29a0f7b657f26cc7bd7646775eb70fa376015241d522f4a7c0063",
      "current_authority": true
    },
    {
      "asset_id": "work-graph-lease-release",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/work-graph-receipt-acceptance.ts",
      "resource_kind": "typescript_export",
      "resource_name": "releaseWorkGraphLease",
      "source_digest": "sha256:629e516db0b29a0f7b657f26cc7bd7646775eb70fa376015241d522f4a7c0063",
      "current_authority": true
    },
    {
      "asset_id": "worker-terminal-receipt",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-lifecycle-receipt.ts",
      "resource_kind": "typescript_export",
      "resource_name": "verifyWorkerLifecycleReceipt",
      "source_digest": "sha256:0bffec75b257d7f101ade5e7e54974e13a46e596b714ecf1ed4d747f8553e2a4",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```

slot capacity accountant と dependency-aware dispatcher、bounded queue controller と quota handover
coordinator、そして slot failure isolator と capacity evidence gate（`SCHEDULER_*` 全 failure code を含む）は
本 PLAN での新規設計であり、実装・DB projection・trace 完了は主張しない。既存 3 資産（lease 取得／解放、
terminal receipt 検証）だけが現時点の実在部分である。
