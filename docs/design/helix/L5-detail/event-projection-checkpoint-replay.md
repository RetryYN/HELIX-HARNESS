---
title: "orchestration event projection と checkpoint replay 詳細設計"
canonical_layer_scheme: L1-L12
layer: L5
paired_layer: L8
status: draft
plan: docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md
pair_artifact: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md
behavior_contract_id: EVENT-PROJECTION-CHECKPOINT-REPLAY-001
responsibility_owner: event-projection-checkpoint-replay
---

# orchestration event projection と checkpoint replay 詳細設計

## 1. typed schema定義

本層が新設する typed record は event envelope、append-only log snapshot、projection snapshot、
checkpoint record、checkpoint scope、recovery budget の 6 種類だけとする。lease は #213 の
`WorkGraphLeaseV1`、slot 会計は #214 の `SlotAccountingRowV1` をそのまま入力契約として再利用し、
本層で再定義しない（§4）。

### 1.1 event envelope の schema

```yaml
kind: orchestration_event_envelope
schema_version: helix-orchestration-event.v1
event_id: string                # event の一意識別子。append-only 列内で一意
event_type: enum                # requested / dispatched / leased / started / handover_requested / handover_completed / terminated / failed / reviewed / accepted
occurred_at: RFC3339            # event 発生時刻
plan_id: string                 # 発生元 PLAN
parent_lane_id: string          # 管理・統合セル側の親 lane
lane_id: string                 # 当該 event の lane
causation_id: string | null     # 直接の原因 event の event_id。起点 event のみ null
correlation_id: string          # 同一因果連鎖を束ねる識別子
head_sha: string                # 40 桁 hex。event が観測した HEAD
payload_digest: string          # sha256:<64 hex>。payload 本体の digest
```

`schema_version` を含む **11 field** を期待 key set とする。`payload_digest` 以外の field 欠落、
unknown 追加 field、または欠落を unknown field で置き換えた envelope は
`EVENT_ENVELOPE_INVALID` として admit しない。唯一、期待 key set から `payload_digest` だけが欠け、
unknown field が 0 件の場合は「envelope はあるが payload binding が無い」片肺として
`EVENT_ENVELOPE_INCOMPLETE` に分類する。この reason 分類の例外は欠落を許容するものではなく、
どちらの code でも必ず拒否する。`event_type` は上記 enum の値だけを許す。`causation_id` が null に
なれるのは `event_type: requested` の起点 event に限る。

`payload_digest` は envelope の外にある payload 本体を指す。event 片肺は 2 方向あるが、返す
failure code は §2.1 の判定順序に従って**別々**になる。

- **envelope は揃うが payload 側が欠ける**（`payload_digest` の key だけが無い、空、または非 sha256
  形式）: §2.1 の key set 分類または payload 形式検査で `EVENT_ENVELOPE_INCOMPLETE` となる。
- **payload だけを持ち envelope を欠く**: 11 field の期待 key setを満たさないため、§2.1 の
  `EVENT_ENVELOPE_INVALID` で先に拒否される。`EVENT_ENVELOPE_INCOMPLETE` には到達しない。

どちらも受理しない点は同じだが、失敗理由を 1 つの code へ丸めない。exact set 検査を先に置く
理由は §2.1 のとおりであり、この順序を変えて片肺を単一 code へ統合してはならない。

### 1.2 append-only log snapshot の schema

```yaml
kind: append_only_log_snapshot
schema_version: helix-append-only-log.v1
lane_id: string                 # このスナップショットが属する lane
entries:                        # 既存 event の順序付き exact list（append 順）
  - event_id: string
    event_type: enum
    occurred_at: RFC3339
    causation_id: string | null
    correlation_id: string
    payload_digest: string
sealed_event_ids: string[]      # terminal 到達済み correlation の event_id 集合
```

`entries` は append 順であり、既存要素の書き換えを表現する手段を持たない。訂正は後続 event の
追記だけで表現する。同一 `event_id` が `entries` に 2 回現れる snapshot は入力として不正
（`EVENT_LOG_SNAPSHOT_INVALID`）とする。

### 1.3 projection snapshot の schema

```yaml
kind: projection_snapshot
schema_version: helix-projection-snapshot.v1
lane_id: string
identity:                       # 投影対象の同一性
  plan_id: string
  parent_lane_id: string
  lane_id: string
state:                          # 投影された状態
  lifecycle_state: enum         # §2.4 の state machine の値
  head_sha: string
  last_event_id: string
```

`identity` と `state` は別軸として比較する。identity 一致・state 不一致、identity 不一致・state 一致の
いずれも drift（`EVENT_PROJECTION_DRIFT`）とし、片方一致を成功へ読み替えない。

### 1.4 checkpoint record の schema

```yaml
kind: checkpoint_record
schema_version: helix-checkpoint-record.v1
head_sha: string                # 40 桁 hex。必須
parent_lane_id: string          # 必須
event_boundary:                 # 必須。checkpoint が覆う event 区間
  from_event_id: string
  to_event_id: string
projection_digest: string       # sha256:<64 hex>
checkpoint_digest: string       # sha256:<64 hex>
```

`head_sha` / `parent_lane_id` / `event_boundary` の 3 束縛はいずれも必須であり、1 件でも欠けた
checkpoint での replay は `EVENT_CHECKPOINT_BINDING_MISSING` で拒否する。3 束縛は**個別に**検査し、
1 件欠落を他 2 件の充足で相殺しない。

### 1.5 checkpoint scope の schema

```yaml
kind: checkpoint_scope
schema_version: helix-checkpoint-scope.v1
head_sha: string
parent_lane_id: string
lane_id: string
from_event_id: string
to_event_id: string
```

`kind` と `schema_version` は exact key set から**除外**する（#214 の `SlotAccountingRowV1` の
`SLOT_ROW_KEYS` と同じ扱い）。§1.1 の event envelope だけが `schema_version` を exact set に
含める例外であり、本 schema を含む他 5 schema はこの除外側に属する。

scope は digest 算出の**入力集合を決める述語**であり、正規化規則も digest 関数も持たない（§4）。
scope が与えられない、または 5 field のいずれかが欠ける入力に対して、全体スコープへ暗黙
フォールバックしてはならない（`EVENT_CHECKPOINT_SCOPE_MISSING`）。

### 1.6 recovery budget の schema

```yaml
kind: recovery_budget
schema_version: helix-recovery-budget.v1
attempt: integer                # 現在の試行回数（1 起点）
max_attempts: integer           # 上限。必須 field（欠落＝unbounded として拒否）
```

`max_attempts` は必須であり、欠落・null・非正整数はいずれも unbounded retry として拒否する
（`EVENT_RETRY_UNBOUNDED`）。`attempt > max_attempts` は bounded retry の枯渇であり、成功へ
進めず Recovery へ送る（`EVENT_RECOVERY_REQUIRED`）。

## 2. 判定関数契約

```ts
// 概念シグネチャ（実装層 L6 で確定。ここでは契約のみ固定する）
function admitEventEnvelope(input: unknown):
  | { ok: true; envelope: OrchestrationEventEnvelopeV1 }
  | { ok: false; failure_code: EventFailureCode };

function evaluateCausalOrder(input: {
  envelope: OrchestrationEventEnvelopeV1;
  log: AppendOnlyLogSnapshotV1;
  observedAt: string;                   // 判定時点の時刻。未来先書きの基準
}): { ok: true } | { ok: false; failure_code: EventFailureCode };

function evaluateIdempotentIngest(input: {
  envelope: OrchestrationEventEnvelopeV1;
  log: AppendOnlyLogSnapshotV1;
}): { ok: true; outcome: "appended" | "duplicate_absorbed" }
  | { ok: false; failure_code: EventFailureCode };

function evaluateLifecycleTransition(input: {
  envelope: OrchestrationEventEnvelopeV1;
  log: AppendOnlyLogSnapshotV1;
}): { ok: true } | { ok: false; failure_code: EventFailureCode };

function evaluateProjectionDrift(input: {
  rebuilt: ProjectionSnapshotV1;        // event 列から再構築した projection
  readBack: ProjectionSnapshotV1;       // 投影先から読み戻した snapshot
  knownLaneIds: readonly string[];      // work graphで実在確認済みのlane membership
}): { ok: true } | { ok: false; failure_code: EventFailureCode };

function selectCheckpointScope(input: {
  scope: unknown;                       // CheckpointScopeV1 候補
  log: AppendOnlyLogSnapshotV1;
}): { ok: true; eventIds: string[] }    // scope が選んだ event_id の順序付き集合
  | { ok: false; failure_code: EventFailureCode };

function evaluateCheckpointReplay(input: {
  checkpoint: CheckpointRecordV1;
  scopedEventIds: string[];             // selectCheckpointScope の出力
  replayProjectionDigest: string;       // 同一 scope の replay 実測値
  replayCheckpointDigest: string;
  currentHeadSha: string;               // stale HEAD 判定の基準
}): { ok: true } | { ok: false; failure_code: EventFailureCode };

function routeRecovery(input: {
  failureCode: EventFailureCode;
  budget: RecoveryBudgetV1;
}): { ok: true; route: "bounded_retry" | "recovery" }
  | { ok: false; failure_code: EventFailureCode };
```

いずれも pure function とし、DB write、network、ファイル I/O、時刻取得を持たない。判定に必要な
時刻（`observedAt`）と現行 HEAD（`currentHeadSha`）は呼び出し側が入力として渡す。返り値は
入力オブジェクトを共有せず、呼び出し側が保持する入力を変更しない。

### 2.1 admitEventEnvelope の判定順序

1. 入力が object でない → `EVENT_ENVELOPE_INVALID`
2. key set が期待11件から `payload_digest` だけを除いた exact 10件である →
   `EVENT_ENVELOPE_INCOMPLETE`
3. key set が期待11件と一致しない（他 field 欠落、unknown追加、欠落とunknownの相殺）→
   `EVENT_ENVELOPE_INVALID`
4. `payload_digest` が空、または `sha256:<64 hex>` 形式でない → `EVENT_ENVELOPE_INCOMPLETE`
5. `head_sha` が40桁hexでない、identifier系fieldが空文字、`occurred_at`がRFC3339でない、または
   `event_type`がenum外 →
   `EVENT_ENVELOPE_INVALID`
6. `causation_id` が null かつ `event_type` が `requested` 以外 → `EVENT_CAUSATION_UNRESOLVED`

key set 分類（2, 3）を値形式検査（4, 5）より先に置く。`payload_digest` 単独欠落だけを先に片肺へ
分類した後、他の全 mismatch を invalid とすることで、U-EPR-012 と unknown field 相殺拒否を同時に
成立させる。逆順にすると、missing + unknown や unknown + 形式不正が片肺へ誤分類される。

### 2.2 evaluateCausalOrder の判定順序

1. `occurred_at` が `observedAt` より後 → `EVENT_FUTURE_TIMESTAMP`
2. `causation_id` が非 null かつ `log.entries` に該当 `event_id` が無い → `EVENT_CAUSATION_UNRESOLVED`
3. 原因 event の `correlation_id` が本 event と不一致 → `EVENT_CORRELATION_MISMATCH`
4. 原因 event の `occurred_at` が本 event の `occurred_at` より後 → `EVENT_CAUSAL_INVERSION`

未来先書き（1）を最初に置く。未来 event は原因解決の前に無条件で拒否すべきであり、
後段に置くと未解決 causation として誤診断されうる。correlation 検査（3）は causal inversion（4）
より前に置く。別 correlation の event を原因として時刻比較すると、比較自体が無意味だからである。

### 2.3 evaluateIdempotentIngest の判定順序

0. `log.entries` 内に同一 `event_id` が重複 → `EVENT_LOG_SNAPSHOT_INVALID`（前提検査）
1. `log.entries` に同一 `event_id` が無い → `{ ok: true, outcome: "appended" }`
2. 同一 `event_id` があり `payload_digest` も一致 → `{ ok: true, outcome: "duplicate_absorbed" }`
3. 同一 `event_id` があり `payload_digest` が不一致 → `EVENT_DUPLICATE_DIGEST_MISMATCH`

`duplicate_absorbed` は列長と side effect を増やさない。呼び出し側は `outcome` を見て append を
実行するかどうかを決め、`ok: true` だけを見て無条件に append してはならない。digest 不一致（3）は
「吸収」ではなく「拒否」であり、dedupe を暗黙上書きの隠れ蓑にしない。

**append-only 違反を別 code にしない理由**: `log.entries` は §1.2 のとおり append 済み event の
exact list であり、`entries` に存在する `event_id` は定義上すべて append 済みである。したがって
ステップ 3 に到達する入力（同一 `event_id` かつ digest 不一致）は、常に同時に「append 済み event の
書き換え要求」でもある。本関数の入力は `{ envelope, log }` だけであり、「訂正の再送」と「明示的な
上書き要求」を区別する材料を持たないため、両者を別 failure code へ分けると一方が到達不能になる。
よって append-only 違反は `EVENT_DUPLICATE_DIGEST_MISMATCH` の 1 code で表し、L4 §6 の
「既に `appended` 済みの event の書き換えを拒否し、訂正は後続 event の追記だけで表現する」は
このステップ 3 が担う。

### 2.4 evaluateLifecycleTransition の state machine

```text
requested → dispatched → leased → started → (handover_requested → handover_completed)* → terminated
                                     └──────────────────────────────────────────────────→ failed
terminated | failed → reviewed → accepted
```

1. 同一 correlation に先行 event が無く `event_type` が `requested` 以外 → `EVENT_TRANSITION_ILLEGAL`
2. 直前 event から本 event への遷移が上記 machine に存在しない（段飛ばしを含む） → `EVENT_TRANSITION_ILLEGAL`
3. 同一 correlation が `sealed_event_ids` に含まれる（`accepted` 済み）状態での追加遷移 → `EVENT_TRANSITION_AFTER_SEAL`

「直前 event」はlog全体の末尾ではなく、入力envelopeと同じ`correlation_id`を持つentriesだけを
append順に絞った末尾とする。別correlationの後続eventを現在laneの前段として利用してはならない。

`appended` を経由しない projection、`projected` を経由しない checkpoint は、呼び出し順序として
存在しない。本関数は event 列の遷移のみを判定し、projection / checkpoint の順序は
呼び出し側の合成が保証する。

### 2.5 evaluateProjectionDrift の判定順序

1. 各 snapshot の top-level `lane_id` と `identity.lane_id` が内部不一致 →
   `EVENT_PROJECTION_DRIFT`
2. internally consistentな`rebuilt.lane_id`または`readBack.lane_id`が`knownLaneIds`に存在しない →
   `EVENT_ORPHAN_LANE`
3. `rebuilt.identity` と `readBack.identity` の 3 field が不一致 → `EVENT_PROJECTION_DRIFT`
4. `rebuilt.state` と `readBack.state` の 3 field が不一致 → `EVENT_PROJECTION_DRIFT`

snapshot内部整合を最初に確定し、その後にwork graphから渡された実在lane集合でmembershipを検査する。
これにより、top-levelとnested identityのlaneを揃えた未知laneは`EVENT_ORPHAN_LANE`へ到達する。
別の実在laneへ変えたread-backはmembershipを通過し、identity不一致として
`EVENT_PROJECTION_DRIFT`になる。一方、top-levelだけまたはnested identityだけを変えた壊れたsnapshotも
orphanへ誤分類せず`EVENT_PROJECTION_DRIFT`となる。`knownLaneIds`は新しいauthorityではなく、#213の
work graph authorityから呼び出し側が投影する入力であり、本関数はlane registryを再実装しない。
identityとstateは引き続き別段で比較し、片方一致を
成功へ読み替えない。手動編集・green表示・Issue closeだけの完了主張は、event列に対応する追記が
無いため`rebuilt`側が動かず、必ず（1）、（3）、（4）のいずれかでdriftとなる。

### 2.6 selectCheckpointScope の判定順序

0. `log.entries` 内に同一 `event_id` が重複 → `EVENT_LOG_SNAPSHOT_INVALID`（前提検査。区間端点の
   解決が一意でなくなるため、scope の形式検査より先に実行する）
1. `scope` が object でない、または 5 field の exact key set を満たさない → `EVENT_CHECKPOINT_SCOPE_MISSING`
2. `head_sha`が40桁hexでない、または`parent_lane_id` / `lane_id` / event境界IDが空文字 →
   `EVENT_CHECKPOINT_SCOPE_MISSING`
3. `scope.lane_id` が `log.lane_id` と不一致 → `EVENT_CHECKPOINT_SCOPE_MISSING`
4. `from_event_id` / `to_event_id` が `log.entries` に存在しない → `EVENT_CHECKPOINT_SCOPE_MISSING`
5. `to_event_id` が `from_event_id` より前に位置する → `EVENT_CHECKPOINT_SCOPE_MISSING`
6. 上記を満たす場合、`lane_id` が一致し区間内にある event_id を append 順で返す

scope 未指定時に全体スコープへ暗黙フォールバックする経路を持たない。これは既存資産
`createL3G3LogicalDbReceipt` が `checkpoint_tables` に対するリポジトリ全体スコープしか持たない
という実装事実に対する fail-close であり、全体スコープ digest を lane checkpoint として流用すると
無関係 lane の追記で恒常的に drift を誤検出するため拒否する。

### 2.7 evaluateCheckpointReplay の判定順序

1. `checkpoint` の `head_sha` / `parent_lane_id` / `event_boundary` を**個別に**検査し、
   1 件でも欠落 → `EVENT_CHECKPOINT_BINDING_MISSING`
2. `checkpoint.head_sha` が `currentHeadSha` と不一致 → `EVENT_STALE_HEAD`
3. `checkpoint.event_boundary.from_event_id` が `scopedEventIds` の先頭、または
   `to_event_id` が末尾と不一致 → `EVENT_CHECKPOINT_SCOPE_MISSING`
   （stale HEAD（2）を先に置く理由: HEAD が古い checkpoint は区間端点も古い可能性が高く、
   scope 不一致として報告すると「scope 選択の誤り」と誤診断されるため、HEAD の鮮度を先に確定する）
4. `replayProjectionDigest` が `checkpoint.projection_digest` と不一致 → `EVENT_REPLAY_NOT_IDEMPOTENT`
5. `replayCheckpointDigest` が `checkpoint.checkpoint_digest` と不一致 → `EVENT_REPLAY_NOT_IDEMPOTENT`

束縛検査（1）を stale HEAD（2）より先に置く。束縛が欠けた checkpoint に対して HEAD 比較を先に
行うと、比較対象が存在しないまま stale と誤診断されうる。digest 照合（4, 5）は最後に置き、
照合を経ずに成功へ抜ける経路を作らない。

### 2.8 routeRecovery の判定順序

1. `budget.max_attempts` が欠落・null・非正整数 → `EVENT_RETRY_UNBOUNDED`
2. `budget.attempt` が非整数または1未満 → `EVENT_RETRY_UNBOUNDED`
3. `budget.attempt > budget.max_attempts` → `{ ok: true, route: "recovery" }`
4. `failureCode` が retry 可能集合（`EVENT_RATE_LIMIT_INTERRUPTED`、`EVENT_STALE_HEAD`）に属する
   → `{ ok: true, route: "bounded_retry" }`
5. それ以外 → `{ ok: true, route: "recovery" }`

いずれの経路も「完了へ進む」を返さない。`route` は bounded_retry か recovery の 2 値のみであり、
成功継続を表す値を持たない。

## 3. digest の責務分割

### 3.1 再利用する既存契約

正規化と算出のプリミティブは `src/shared/canonical-digest.ts` の `canonicalJson`（object key 順・array 順・
JSON 妥当性）と `sha256Digest` を**そのまま使う**。第二の canonicalization 規則・第二の sha256
算出系を定義しない。

### 3.2 本層の新規責務

`selectCheckpointScope` が `head_sha` / `parent_lane_id` / `lane_id` / event 区間で入力集合を絞る。
scope selector は正規化も digest 算出も行わず、選んだ `eventIds` を返すだけとする。

### 3.3 呼び出さない既存 export

`createL3G3LogicalDbReceipt` は同じプリミティブを import して使う既存 authority だが、本層からは
**呼び出さない**。bootstrap policy を読み込んで harness.db を 2 回 full rebuild する doctor 専用の
重量関数であり、event 単位の判定経路で呼ぶ対象ではない。加えて `head_sha` / `parent_lane_id` /
event 境界を引数に取らず、`logicalDatabaseDigest` の絞り込みも `includeTable` によるテーブル単位に
留まる。

## 4. #213／#214 資産との接続点

- lease: #213 の `acquireWorkGraphLease` / `releaseWorkGraphLease` が fence token CAS の唯一の
  authority。本層は lease を取得も解放もせず、event の `lane_id` / `head_sha` を通じて系譜を参照する
  だけとする。
- terminal: #213 の `verifyWorkerLifecycleReceipt` が terminal 判定の唯一の authority。本層の
  `event_type: terminated` は receipt 検証済みの事実を記録する event であり、本層で terminal 条件を
  再判定しない。
- slot 会計: #214 の `admitSlotAccountingRow` が exact set 9 field の唯一の検証者。本層は
  accounting row を event source として受け取るだけで、9 field の再検証を行わない。

これら 3 資産は **型として関数引数に受け取らない**。§2 の 8 関数はいずれも `WorkGraphLeaseV1` /
`WorkerLifecycleReceipt` / `SlotAccountingRowV1` を引数に取らず、`lane_id` / `head_sha` / `plan_id` の
**field 値の一致**でのみ参照する。typed schema を 6 種に限定する範囲宣言と整合させるためであり、
実装時にこれらの型を引数へ追加してはならない。

`WORK_GRAPH_*` / `WORKER_LIFECYCLE_*` / `SCHEDULER_*` は既存関数がそのまま返す failure code であり、
本設計では再定義せず透過させる。したがって呼び出し側の合成では失敗型が union になるが、
既存 code を `EVENT_*` へ再命名してはならない。

## 5. failure code一覧

すべて `EVENT_*` 命名とし、いずれも fail-close（条件を満たさない限り append / projection /
checkpoint を admit しない）。

| code | 条件 | 到達関数 |
|---|---|---|
| `EVENT_ENVELOPE_INVALID` | object以外、`payload_digest`以外のfield欠落、unknown追加・欠落相殺、identifier／時刻形式・enum不正 | `admitEventEnvelope` (1,3,5) |
| `EVENT_ENVELOPE_INCOMPLETE` | `payload_digest`だけのkey欠落、空、非sha256形式（event片肺） | `admitEventEnvelope` (2,4) |
| `EVENT_LOG_SNAPSHOT_INVALID` | log snapshot 内に同一 `event_id` が重複 | `evaluateIdempotentIngest` (0) / `selectCheckpointScope` (0) |
| `EVENT_DUPLICATE_DIGEST_MISMATCH` | 同一 `event_id` かつ `payload_digest` 不一致。これは「暗黙上書き」であり同時に「append 済み event の書き換え要求」でもある（append-only 違反はこの 1 code で表す。§2.3 の注記を参照） | `evaluateIdempotentIngest` (3) |
| `EVENT_FUTURE_TIMESTAMP` | `occurred_at` が `observedAt` より後（先書き） | `evaluateCausalOrder` (1) |
| `EVENT_CAUSATION_UNRESOLVED` | 存在しない event を指す `causation_id`、または起点以外の null | `admitEventEnvelope` (5) / `evaluateCausalOrder` (2) |
| `EVENT_CORRELATION_MISMATCH` | `correlation_id` を跨いだ causation 解決 | `evaluateCausalOrder` (3) |
| `EVENT_CAUSAL_INVERSION` | 原因より前に結果が確定する時刻順序 | `evaluateCausalOrder` (4) |
| `EVENT_TRANSITION_ILLEGAL` | state machine に無い遷移（前段欠落・段飛ばし） | `evaluateLifecycleTransition` (1,2) |
| `EVENT_TRANSITION_AFTER_SEAL` | `accepted` 済み correlation への追加遷移 | `evaluateLifecycleTransition` (3) |
| `EVENT_PROJECTION_DRIFT` | snapshot内部lane不整合、または再構築projectionとread-backのidentity/state不一致 | `evaluateProjectionDrift` (1,3,4) |
| `EVENT_ORPHAN_LANE` | internally consistentなsnapshotのlaneが`knownLaneIds`に存在しない | `evaluateProjectionDrift` (2) |
| `EVENT_CHECKPOINT_SCOPE_MISSING` | scope未指定・field欠落／形式不正・lane不一致・区間不正、およびcheckpoint境界とscope両端点の不一致 | `selectCheckpointScope` (1..5) / `evaluateCheckpointReplay` (3) |
| `EVENT_CHECKPOINT_BINDING_MISSING` | `head_sha` / `parent_lane_id` / `event_boundary` のいずれかの欠落 | `evaluateCheckpointReplay` (1) |
| `EVENT_STALE_HEAD` | checkpoint の `head_sha` が現行 HEAD と不一致 | `evaluateCheckpointReplay` (2) |
| `EVENT_REPLAY_NOT_IDEMPOTENT` | replay digest が checkpoint 記録と不一致 | `evaluateCheckpointReplay` (4,5) |
| `EVENT_RATE_LIMIT_INTERRUPTED` | 投影が rate limit で中断した観測 | `routeRecovery` の入力 code（呼び出し側が供給） |
| `EVENT_RETRY_UNBOUNDED` | `max_attempts`の欠落・null・非正整数、または`attempt`の非整数・1未満 | `routeRecovery` (1,2) |
| `EVENT_RECOVERY_REQUIRED` | bounded retry枯渇、またはretry不能な失敗。**`EventFailureCode` unionには含めない**（`routeRecovery`の`route: "recovery"`としてのみ表現する識別子であり、enum memberとして宣言しない） | `routeRecovery` (3,5) の route 値 |

`EVENT_RECOVERY_REQUIRED` は `routeRecovery` の失敗型ではなく `route: "recovery"` として返るため、
呼び出し側が完了へ進めないことを型で保証する。

## 6. 実装順

1. `admitEventEnvelope` の exact set 検証と判定順序 1..6 を実装し、`EVENT_ENVELOPE_INVALID` /
   `EVENT_ENVELOPE_INCOMPLETE` を到達させる。
2. `evaluateCausalOrder` と `evaluateIdempotentIngest` を §2.2 / §2.3 の順序どおりに実装し、
   `duplicate_absorbed` が列長と side effect を増やさないことを oracle で固定する。
3. `evaluateLifecycleTransition` の state machine（§2.4）を実装する。
4. `evaluateProjectionDrift` の identity / state 分離判定と `EVENT_ORPHAN_LANE` を実装する。
5. `selectCheckpointScope` と `evaluateCheckpointReplay` を実装し、全体スコープへの暗黙
   フォールバックが存在しないことを oracle で固定する。
6. `routeRecovery` を実装し、返り値に成功継続の値が無いことを型で固定する。
7. mutation runner で分岐網羅を機械検証し、full CI・独立 AI-B receipt を同一 HEAD へ束縛する。

## 7. 現在の設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "canonical-json",
      "classification": "existing_runtime",
      "artifact_path": "src/shared/canonical-digest.ts",
      "resource_kind": "typescript_export",
      "resource_name": "canonicalJson",
      "source_digest": "sha256:c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000",
      "current_authority": true
    },
    {
      "asset_id": "sha256-digest",
      "classification": "existing_runtime",
      "artifact_path": "src/shared/canonical-digest.ts",
      "resource_kind": "typescript_export",
      "resource_name": "sha256Digest",
      "source_digest": "sha256:c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000",
      "current_authority": true
    },
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
      "asset_id": "worker-terminal-receipt",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-lifecycle-receipt.ts",
      "resource_kind": "typescript_export",
      "resource_name": "verifyWorkerLifecycleReceipt",
      "source_digest": "sha256:0bffec75b257d7f101ade5e7e54974e13a46e596b714ecf1ed4d747f8553e2a4",
      "current_authority": true
    },
    {
      "asset_id": "slot-accounting-row",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/slot-scheduler-quota-handover.ts",
      "resource_kind": "typescript_export",
      "resource_name": "admitSlotAccountingRow",
      "source_digest": "sha256:923b792ed7db89813c3ae12bccdade457e3a5469207c5b6533dfae71491365e5",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```

これは event source と digest プリミティブとして再利用する既存資産の実在部分だけを示す。
§2 の判定関数 8 種、§1 の typed schema 6 種、§5 の `EVENT_*` failure code 19 種（うち `EVENT_RECOVERY_REQUIRED` は route 値であり union member は 18 種）は本 PLAN での
新規設計であり、実装・DB projection・trace 完了は主張しない。既存資産として宣言しているのは
上記 5 件だけである。
