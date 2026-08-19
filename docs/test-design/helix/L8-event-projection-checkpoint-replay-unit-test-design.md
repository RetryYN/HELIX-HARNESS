---
title: "orchestration event projection と checkpoint replay L8 unit test設計"
canonical_layer_scheme: L1-L12
layer: L8
sub_doc: unit-test-design
paired_layer: L5
status: draft
plan: docs/plans/PLAN-L5-98-event-projection-checkpoint-replay.md
pair_artifact: docs/design/helix/L5-detail/event-projection-checkpoint-replay.md
behavior_contract_id: EVENT-PROJECTION-CHECKPOINT-REPLAY-001
responsibility_owner: event-projection-checkpoint-replay
---

# orchestration event projection と checkpoint replay L8 unit test設計

## 1. unit oracle 一覧

L5 §2 の判定関数 8 種（envelope 受理、因果順序、冪等 ingest、lifecycle 遷移、projection drift、
checkpoint scope 選択、checkpoint replay、Recovery routing）を単体粒度で Red にする。
L9（U-EPR-S-001..037）は経路レベルの system oracle であり、本 L8 は判定関数 1 個ずつの
mutation・境界条件・判定順序を扱う。

| oracle_id | 種別 | 対象判定関数 | 合格条件 | L9対応 |
|---|---|---|---|---|
| U-EPR-001 | positive | `admitEventEnvelope` | 11 field 完備の envelope を admit し、正規化された `OrchestrationEventEnvelopeV1` を返す | U-EPR-S-001 |
| U-EPR-002 | mutation | `admitEventEnvelope` | `schema_version` を欠落させた envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-003 | mutation | `admitEventEnvelope` | `event_id` を欠落させた envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-004 | mutation | `admitEventEnvelope` | `event_type` を欠落させた envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-005 | mutation | `admitEventEnvelope` | `occurred_at` を欠落させた envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-006 | mutation | `admitEventEnvelope` | `plan_id` を欠落させた envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-007 | mutation | `admitEventEnvelope` | `parent_lane_id` を欠落させた envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-008 | mutation | `admitEventEnvelope` | `lane_id` を欠落させた envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-009 | mutation | `admitEventEnvelope` | `causation_id` の**キー自体**を欠落させた envelope を `EVENT_ENVELOPE_INVALID` で拒否する（null 値とキー欠落を区別する） | U-EPR-S-002 |
| U-EPR-010 | mutation | `admitEventEnvelope` | `correlation_id` を欠落させた envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-011 | mutation | `admitEventEnvelope` | `head_sha` を欠落させた envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-012 | mutation | `admitEventEnvelope` | `payload_digest` を欠落させた envelope を `EVENT_ENVELOPE_INCOMPLETE` で拒否する（片肺） | U-EPR-S-005 |
| U-EPR-013 | mutation | `admitEventEnvelope` | 欠落 field を unknown 追加 field で埋めた envelope を `EVENT_ENVELOPE_INVALID` で拒否する（相殺の否定） | U-EPR-S-003 |
| U-EPR-014 | mutation | `admitEventEnvelope` | field 数は 11 のままで unknown field を 1 件混ぜた envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-003 |
| U-EPR-015 | mutation | `admitEventEnvelope` | `payload_digest` が `sha256:` 接頭辞を欠く envelope を `EVENT_ENVELOPE_INCOMPLETE` で拒否する | U-EPR-S-005 |
| U-EPR-016 | mutation | `admitEventEnvelope` | `payload_digest` が空文字の envelope を `EVENT_ENVELOPE_INCOMPLETE` で拒否する | U-EPR-S-005 |
| U-EPR-017 | mutation | `admitEventEnvelope` | `head_sha` が 40 桁 hex でない envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-018 | mutation | `admitEventEnvelope` | enum 外の `event_type` を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-019 | mutation | `admitEventEnvelope` | `lane_id` が空文字の envelope を `EVENT_ENVELOPE_INVALID` で拒否する | U-EPR-S-002 |
| U-EPR-020 | positive | `admitEventEnvelope` | `event_type: requested` かつ `causation_id: null` の起点 envelope を admit する | U-EPR-S-001 |
| U-EPR-021 | mutation | `admitEventEnvelope` | `causation_id: null` かつ `event_type` が `requested` 以外の envelope を `EVENT_CAUSATION_UNRESOLVED` で拒否する | U-EPR-S-011 |
| U-EPR-022 | ordering | `admitEventEnvelope` | unknown field と形式不正を同時に持つ envelope が、exact set 検査を先着として `EVENT_ENVELOPE_INVALID` を返す | U-EPR-S-003 |
| U-EPR-023 | positive | `evaluateCausalOrder` | 原因 event が同一 correlation に存在し時刻順序も正しい envelope を受理する | U-EPR-S-001 |
| U-EPR-024 | mutation | `evaluateCausalOrder` | `occurred_at` が `observedAt` より後の envelope を `EVENT_FUTURE_TIMESTAMP` で拒否する | U-EPR-S-013 |
| U-EPR-025 | mutation | `evaluateCausalOrder` | 存在しない event を指す `causation_id` を `EVENT_CAUSATION_UNRESOLVED` で拒否する | U-EPR-S-011 |
| U-EPR-026 | mutation | `evaluateCausalOrder` | 別 `correlation_id` の event を指す `causation_id` を `EVENT_CORRELATION_MISMATCH` で拒否する | U-EPR-S-012 |
| U-EPR-027 | mutation | `evaluateCausalOrder` | 原因 event より前の `occurred_at` を持つ結果 event を `EVENT_CAUSAL_INVERSION` で拒否する | U-EPR-S-010 |
| U-EPR-028 | ordering | `evaluateCausalOrder` | 未来時刻と未解決 causation を同時に持つ envelope が、未来先書きを先着として `EVENT_FUTURE_TIMESTAMP` を返す | U-EPR-S-013 |
| U-EPR-029 | ordering | `evaluateCausalOrder` | correlation 不一致と時刻逆行を同時に持つ envelope が、correlation を先着として `EVENT_CORRELATION_MISMATCH` を返す | U-EPR-S-012 |
| U-EPR-030 | boundary | `evaluateCausalOrder` | `occurred_at` が `observedAt` と同時刻の envelope を受理する（未来先書きの境界） | U-EPR-S-013 |
| U-EPR-031 | boundary | `evaluateCausalOrder` | 原因 event と同時刻の結果 event を受理する（causal inversion の境界） | U-EPR-S-010 |
| U-EPR-032 | positive | `evaluateIdempotentIngest` | 未登録 `event_id` に対して `outcome: "appended"` を返す | U-EPR-S-001 |
| U-EPR-033 | positive | `evaluateIdempotentIngest` | 同一 `event_id` かつ同一 `payload_digest` に対して `outcome: "duplicate_absorbed"` を返す | U-EPR-S-007 |
| U-EPR-034 | mutation | `evaluateIdempotentIngest` | 同一 `event_id` かつ異なる `payload_digest` を `EVENT_DUPLICATE_DIGEST_MISMATCH` で拒否する | U-EPR-S-008 |
| U-EPR-035 | mutation | `evaluateIdempotentIngest` | `entries` に同一 `event_id` が重複する log snapshot を `EVENT_LOG_SNAPSHOT_INVALID` で拒否する | U-EPR-S-006 |
| U-EPR-036 | invariant | `evaluateIdempotentIngest` | `duplicate_absorbed` を返す呼び出しが `log.entries` の長さを変えない（列長不変） | U-EPR-S-007 |
| U-EPR-037 | invariant | `evaluateIdempotentIngest` | 同一 envelope を 3 回渡しても 2 回目以降が全て `duplicate_absorbed` になる | U-EPR-S-009 |
| U-EPR-038 | invariant | `evaluateIdempotentIngest` | digest 不一致で拒否した呼び出しが `log.entries` を一切変更しない（append-only 不変。拒否は `EVENT_DUPLICATE_DIGEST_MISMATCH` の 1 code で表す） | U-EPR-S-006 |
| U-EPR-039 | positive | `evaluateLifecycleTransition` | `requested` → `dispatched` → `leased` → `started` → `terminated` の列を全段受理する | U-EPR-S-001 |
| U-EPR-040 | mutation | `evaluateLifecycleTransition` | 先行 event の無い `terminated` を `EVENT_TRANSITION_ILLEGAL` で拒否する | U-EPR-S-014 |
| U-EPR-041 | mutation | `evaluateLifecycleTransition` | `requested` の直後に `started` を置く段飛ばしを `EVENT_TRANSITION_ILLEGAL` で拒否する | U-EPR-S-015 |
| U-EPR-042 | mutation | `evaluateLifecycleTransition` | `accepted` 済み correlation への追加遷移を `EVENT_TRANSITION_AFTER_SEAL` で拒否する | U-EPR-S-016 |
| U-EPR-043 | positive | `evaluateLifecycleTransition` | `handover_requested` → `handover_completed` の反復を受理する | U-EPR-S-001 |
| U-EPR-044 | mutation | `evaluateLifecycleTransition` | `handover_completed` が対応する `handover_requested` なしに現れる列を `EVENT_TRANSITION_ILLEGAL` で拒否する | U-EPR-S-014 |
| U-EPR-045 | positive | `evaluateLifecycleTransition` | `started` から `failed` への遷移を受理する | U-EPR-S-001 |
| U-EPR-046 | mutation | `evaluateLifecycleTransition` | `failed` の後に `dispatched` を置く逆行を `EVENT_TRANSITION_ILLEGAL` で拒否する | U-EPR-S-016 |
| U-EPR-047 | positive | `evaluateProjectionDrift` | identity 3 field と state 3 field が全一致する snapshot 対を受理する | U-EPR-S-017 |
| U-EPR-048 | mutation | `evaluateProjectionDrift` | `identity.plan_id` だけを変異させた対を `EVENT_PROJECTION_DRIFT` で拒否する | U-EPR-S-018 |
| U-EPR-049 | mutation | `evaluateProjectionDrift` | `identity.parent_lane_id` だけを変異させた対を `EVENT_PROJECTION_DRIFT` で拒否する | U-EPR-S-018 |
| U-EPR-050 | mutation | `evaluateProjectionDrift` | `state.lifecycle_state` だけを変異させた対を `EVENT_PROJECTION_DRIFT` で拒否する | U-EPR-S-019 |
| U-EPR-051 | mutation | `evaluateProjectionDrift` | `state.head_sha` だけを変異させた対を `EVENT_PROJECTION_DRIFT` で拒否する | U-EPR-S-019 |
| U-EPR-052 | mutation | `evaluateProjectionDrift` | `state.last_event_id` だけを変異させた対を `EVENT_PROJECTION_DRIFT` で拒否する | U-EPR-S-019 |
| U-EPR-053 | mutation | `evaluateProjectionDrift` | top-levelと`identity.lane_id`を同じ未知laneへ変え、そのlaneを`knownLaneIds`から除いたread-backを`EVENT_ORPHAN_LANE`で拒否する | U-EPR-S-022 |
| U-EPR-054 | mutation | `evaluateProjectionDrift` | identity 一致・state 不一致の対を成功へ読み替えず拒否する（片方一致の否定） | U-EPR-S-019 |
| U-EPR-055 | mutation | `evaluateProjectionDrift` | state 一致・identity 不一致の対を成功へ読み替えず拒否する（片方一致の否定） | U-EPR-S-018 |
| U-EPR-056 | mutation | `evaluateProjectionDrift` | event 追記の無い read-back 変更（手動編集相当）を `EVENT_PROJECTION_DRIFT` で拒否する | U-EPR-S-020 |
| U-EPR-057 | positive | `selectCheckpointScope` | 5 field 完備の scope に対して区間内 event_id を append 順で返す | U-EPR-S-025 |
| U-EPR-058 | mutation | `selectCheckpointScope` | `head_sha` を欠く scope を `EVENT_CHECKPOINT_SCOPE_MISSING` で拒否する | U-EPR-S-037 |
| U-EPR-059 | mutation | `selectCheckpointScope` | `parent_lane_id` を欠く scope を `EVENT_CHECKPOINT_SCOPE_MISSING` で拒否する | U-EPR-S-037 |
| U-EPR-060 | mutation | `selectCheckpointScope` | `lane_id` を欠く scope を `EVENT_CHECKPOINT_SCOPE_MISSING` で拒否する | U-EPR-S-037 |
| U-EPR-061 | mutation | `selectCheckpointScope` | `from_event_id` を欠く scope を `EVENT_CHECKPOINT_SCOPE_MISSING` で拒否する | U-EPR-S-037 |
| U-EPR-062 | mutation | `selectCheckpointScope` | `to_event_id` を欠く scope を `EVENT_CHECKPOINT_SCOPE_MISSING` で拒否する | U-EPR-S-037 |
| U-EPR-063 | mutation | `selectCheckpointScope` | `scope` が undefined のとき全体スコープへフォールバックせず `EVENT_CHECKPOINT_SCOPE_MISSING` を返す | U-EPR-S-037 |
| U-EPR-064 | mutation | `selectCheckpointScope` | log に存在しない `from_event_id` を `EVENT_CHECKPOINT_SCOPE_MISSING` で拒否する | U-EPR-S-037 |
| U-EPR-065 | mutation | `selectCheckpointScope` | `to_event_id` が `from_event_id` より前に位置する区間を `EVENT_CHECKPOINT_SCOPE_MISSING` で拒否する | U-EPR-S-037 |
| U-EPR-066 | invariant | `selectCheckpointScope` | 別 lane の event を追記しても同一 scope の返す `eventIds` が変化しない（lane 境界の実効性） | U-EPR-S-036 |
| U-EPR-067 | positive | `evaluateCheckpointReplay` | 束縛 3 件が揃い digest 2 件が一致する checkpoint を受理する | U-EPR-S-025 |
| U-EPR-068 | mutation | `evaluateCheckpointReplay` | `head_sha` を欠く checkpoint を `EVENT_CHECKPOINT_BINDING_MISSING` で拒否する | U-EPR-S-024 |
| U-EPR-069 | mutation | `evaluateCheckpointReplay` | `parent_lane_id` を欠く checkpoint を `EVENT_CHECKPOINT_BINDING_MISSING` で拒否する | U-EPR-S-024 |
| U-EPR-070 | mutation | `evaluateCheckpointReplay` | `event_boundary` を欠く checkpoint を `EVENT_CHECKPOINT_BINDING_MISSING` で拒否する | U-EPR-S-024 |
| U-EPR-071 | mutation | `evaluateCheckpointReplay` | `checkpoint.head_sha` が `currentHeadSha` と異なる場合に `EVENT_STALE_HEAD` を返す | U-EPR-S-028 |
| U-EPR-072 | mutation | `evaluateCheckpointReplay` | `event_boundary` の端点が `scopedEventIds` と一致しない場合に `EVENT_CHECKPOINT_SCOPE_MISSING` を返す | U-EPR-S-027 |
| U-EPR-073 | mutation | `evaluateCheckpointReplay` | `replayProjectionDigest` が記録と異なる場合に `EVENT_REPLAY_NOT_IDEMPOTENT` を返す | U-EPR-S-026 |
| U-EPR-074 | mutation | `evaluateCheckpointReplay` | `replayCheckpointDigest` が記録と異なる場合に `EVENT_REPLAY_NOT_IDEMPOTENT` を返す | U-EPR-S-026 |
| U-EPR-075 | ordering | `evaluateCheckpointReplay` | 束縛欠落と stale HEAD を同時に持つ入力が、束縛検査を先着として `EVENT_CHECKPOINT_BINDING_MISSING` を返す | U-EPR-S-024 |
| U-EPR-076 | ordering | `evaluateCheckpointReplay` | stale HEAD と digest 不一致を同時に持つ入力が、stale HEAD を先着として `EVENT_STALE_HEAD` を返す | U-EPR-S-028 |
| U-EPR-077 | positive | `routeRecovery` | `EVENT_RATE_LIMIT_INTERRUPTED` かつ budget 残ありで `route: "bounded_retry"` を返す | U-EPR-S-030 |
| U-EPR-078 | mutation | `routeRecovery` | `max_attempts` を欠く budget を `EVENT_RETRY_UNBOUNDED` で拒否する | U-EPR-S-031 |
| U-EPR-079 | mutation | `routeRecovery` | `max_attempts` が 0 の budget を `EVENT_RETRY_UNBOUNDED` で拒否する | U-EPR-S-031 |
| U-EPR-080 | boundary | `routeRecovery` | `attempt` が `max_attempts` と等しいとき `bounded_retry` を返す（上限の境界） | U-EPR-S-031 |
| U-EPR-081 | mutation | `routeRecovery` | `attempt` が `max_attempts` を超えたとき `route: "recovery"` を返す | U-EPR-S-031 |
| U-EPR-082 | mutation | `routeRecovery` | `EVENT_PROJECTION_DRIFT` など retry 不能な code に対して `route: "recovery"` を返す | U-EPR-S-032 |
| U-EPR-083 | invariant | `routeRecovery` | 返り値の `route` が `bounded_retry` / `recovery` の 2 値のみで、完了継続を表す値を持たない | U-EPR-S-032 |
| U-EPR-084 | invariant | 全 8 関数 | 各関数が入力オブジェクトを変更せず、返り値が呼び出し側の入力と構造を共有しない | U-EPR-S-033 |
| U-EPR-085 | invariant | 全 8 関数 | 同一入力に対する 2 回の呼び出しが同一結果を返す（determinism） | U-EPR-S-033 |
| U-EPR-086 | boundary | `evaluateCheckpointReplay` | digest 算出が `src/runtime/digest.ts` の `canonicalJson` / `sha256Digest` の出力と一致し、第二の算出系を経由しない | U-EPR-S-035 |
| U-EPR-087 | mutation | `selectCheckpointScope` | `entries` に同一 `event_id` が重複する log snapshot を、scope の形式検査より先に `EVENT_LOG_SNAPSHOT_INVALID` で拒否する（判定順序 0） | U-EPR-S-006 |
| U-EPR-088 | mutation | `admitEventEnvelope` | payload だけを持ち envelope を欠く入力が、exact set 検査で `EVENT_ENVELOPE_INVALID` を返す（`EVENT_ENVELOPE_INCOMPLETE` へ到達しないことの固定） | U-EPR-S-004 |
| U-EPR-089 | mutation | `admitEventEnvelope` | 11 field完備のenvelopeへunknown fieldを追加した12 field入力を`EVENT_ENVELOPE_INVALID`で拒否する | U-EPR-S-003 |
| U-EPR-090 | mutation | `admitEventEnvelope` | 空文字の`schema_version`を`EVENT_ENVELOPE_INVALID`で拒否する | U-EPR-S-002 |
| U-EPR-091 | mutation | `admitEventEnvelope` | RFC3339でない`occurred_at`を`EVENT_ENVELOPE_INVALID`で拒否する | U-EPR-S-002 |
| U-EPR-092 | mutation | `selectCheckpointScope` | `scope.lane_id`と`log.lane_id`の不一致を`EVENT_CHECKPOINT_SCOPE_MISSING`で拒否する | U-EPR-S-037 |
| U-EPR-093 | mutation | `selectCheckpointScope` | 40桁hexでない`scope.head_sha`を`EVENT_CHECKPOINT_SCOPE_MISSING`で拒否する | U-EPR-S-037 |
| U-EPR-094 | mutation | `selectCheckpointScope` | 空文字の`scope.parent_lane_id`を`EVENT_CHECKPOINT_SCOPE_MISSING`で拒否する | U-EPR-S-037 |
| U-EPR-095 | mutation | `routeRecovery` | 非数値の`max_attempts`を`EVENT_RETRY_UNBOUNDED`で拒否する | U-EPR-S-031 |
| U-EPR-096 | mutation | `routeRecovery` | 非数値の`attempt`を`EVENT_RETRY_UNBOUNDED`で拒否する | U-EPR-S-031 |
| U-EPR-097 | boundary | `routeRecovery` | `attempt: 0`を`EVENT_RETRY_UNBOUNDED`で拒否する | U-EPR-S-031 |
| U-EPR-098 | mutation | `evaluateLifecycleTransition` | 別correlationの後続entryを現在correlationの直前eventとして利用しない | U-EPR-S-015 |
| U-EPR-099 | mutation | `selectCheckpointScope` | 5 field完備scopeへのunknown追加fieldをexact set違反で拒否する | U-EPR-S-037 |
| U-EPR-100 | mutation | `evaluateCheckpointReplay` | 区間始点一致・終点不一致を`EVENT_CHECKPOINT_SCOPE_MISSING`で拒否する | U-EPR-S-027 |
| U-EPR-101 | ordering | `evaluateProjectionDrift` | top-level `lane_id`だけ、または`identity.lane_id`だけを変えた内部不整合snapshotを`EVENT_PROJECTION_DRIFT`で拒否し、`EVENT_ORPHAN_LANE`へ誤分類しない | U-EPR-S-018 |
| U-EPR-102 | boundary | `evaluateProjectionDrift` | top-levelとnested identityが整合した別laneを`knownLaneIds`へ含めた場合はorphanへ誤分類せず`EVENT_PROJECTION_DRIFT`で拒否する | U-EPR-S-018 |

## 2. fail-close 8 系統との対応

L4 §6 の fail-close 系統を、それぞれ次の unit oracle で単体粒度に分解する。

| fail-close 系統 | 対応 unit oracle |
|---|---|
| event 片肺の拒否 | U-EPR-012, U-EPR-015, U-EPR-016, U-EPR-088 |
| exact set の unknown field 相殺の拒否 | U-EPR-002..U-EPR-011, U-EPR-013, U-EPR-014, U-EPR-022 |
| append-only 違反の拒否 | U-EPR-035, U-EPR-038, U-EPR-087 |
| duplicate side effect の拒否 | U-EPR-033, U-EPR-034, U-EPR-036, U-EPR-037 |
| causal inversion の拒否 | U-EPR-024..U-EPR-031 |
| illegal transition の拒否 | U-EPR-040, U-EPR-041, U-EPR-042, U-EPR-044, U-EPR-046 |
| projection drift の拒否 | U-EPR-048..U-EPR-052, U-EPR-054, U-EPR-055, U-EPR-056 |
| orphan lane の拒否 | U-EPR-053 |
| checkpoint / HEAD / parent 欠落の拒否 | U-EPR-068, U-EPR-069, U-EPR-070, U-EPR-075 |
| non-idempotent replay の拒否 | U-EPR-073, U-EPR-074 |
| 全体スコープ digest 流用の拒否 | U-EPR-058..U-EPR-066, U-EPR-072 |
| 無制限 retry の拒否 | U-EPR-078, U-EPR-079, U-EPR-081, U-EPR-083 |

L4 §6 の 8 系統に、orphan lane・全体スコープ流用・無制限 retry・exact set 相殺の 4 行を加えた
12 行で表す。全体スコープ流用は「checkpoint 欠落」とは逆に**束縛が揃っていても scope が
効いていない**状態を指すため、同一行に混ぜない。

## 3. fixture 方針

基準 fixture は、単一 lane・単一 correlation の 5 event 列（`requested` → `dispatched` → `leased` →
`started` → `terminated`）とし、各 negative oracle は基準から**判定対象の 1 条件だけ**を差し替える。
複数条件を同時に崩す fixture は false negative を隠すため使わない。

例外は**判定順序検証 oracle**（U-EPR-022 / U-EPR-028 / U-EPR-029 / U-EPR-075 / U-EPR-076 /
U-EPR-101）に限る。
これらは 2 条件を意図的に同時成立させ、L5 §2.1〜§2.7 で固定した順序どおりに先着条件の
failure code が返ることを確認するのが目的であり、条件の取りこぼしを隠す用途ではない。

envelope の 11 field 欠落 mutation（U-EPR-002..U-EPR-012）は 1 field ずつ独立に落とす。`causation_id` は
null 可能 field であるため、**キー欠落**（U-EPR-009）と **null 値**（U-EPR-020 / U-EPR-021）を別 oracle に
分離し、「null だから欠落と同じ」と読み替えない。

scope 系 oracle（U-EPR-058..U-EPR-066）は 5 field を 1 件ずつ落とすほか、`scope` そのものが
undefined の場合（U-EPR-063）を独立に持つ。これは既存資産が全体スコープしか持たないという実装
事実に対する回帰であり、暗黙フォールバックを実装した場合に必ず Red になる。U-EPR-066 は別 lane の
追記に対する不変性を押さえ、lane 境界が実効であることを positive 側から確認する。

mutation は判定分岐を 1 つずつ除去した mutant を個別 fixture で Red にする。文言一致
（`toContain()`）だけを到達証拠にせず、failure code の一致で判定する。

## 4. eligible oracle 束縛表

後続PLAN-L7-531-event-projection-checkpoint-replayが`verification_bindings`で参照すべきcanonical表。
当該PLANは本pair修正の完了後に作成し、現在は実在・実装完了を主張しない。各行は実行可能な`it()` case 1件と
1 対 1 で対応する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-EPR-001 | `admitEventEnvelope` | 11 field 完備の envelope を admit し正規化して返す | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-002 | `admitEventEnvelope` | `schema_version` 欠落を `EVENT_ENVELOPE_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-003 | `admitEventEnvelope` | `event_id` 欠落を `EVENT_ENVELOPE_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-004 | `admitEventEnvelope` | `event_type` 欠落を `EVENT_ENVELOPE_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-005 | `admitEventEnvelope` | `occurred_at` 欠落を `EVENT_ENVELOPE_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-006 | `admitEventEnvelope` | `plan_id` 欠落を `EVENT_ENVELOPE_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-007 | `admitEventEnvelope` | `parent_lane_id` 欠落を `EVENT_ENVELOPE_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-008 | `admitEventEnvelope` | `lane_id` 欠落を `EVENT_ENVELOPE_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-009 | `admitEventEnvelope` | `causation_id` のキー欠落を `EVENT_ENVELOPE_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-010 | `admitEventEnvelope` | `correlation_id` 欠落を `EVENT_ENVELOPE_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-011 | `admitEventEnvelope` | `head_sha` 欠落を `EVENT_ENVELOPE_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-012 | `admitEventEnvelope` | `payload_digest` 欠落を `EVENT_ENVELOPE_INCOMPLETE` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-013 | `admitEventEnvelope` | 欠落を unknown field で相殺した envelope を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-014 | `admitEventEnvelope` | field 数 11 のまま unknown field を混ぜた envelope を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-015 | `admitEventEnvelope` | `sha256:` 接頭辞を欠く `payload_digest` を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-016 | `admitEventEnvelope` | 空文字の `payload_digest` を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-017 | `admitEventEnvelope` | 40 桁 hex でない `head_sha` を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-018 | `admitEventEnvelope` | enum 外の `event_type` を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-019 | `admitEventEnvelope` | 空文字の `lane_id` を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-020 | `admitEventEnvelope` | 起点 event の `causation_id: null` を admit する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-021 | `admitEventEnvelope` | 起点以外の `causation_id: null` を `EVENT_CAUSATION_UNRESOLVED` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-022 | `admitEventEnvelope` | unknown field と形式不正の同時成立で exact set 検査が先着する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-023 | `evaluateCausalOrder` | 正しい因果順序の envelope を受理する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-024 | `evaluateCausalOrder` | 未来 `occurred_at` を `EVENT_FUTURE_TIMESTAMP` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-025 | `evaluateCausalOrder` | 未解決 `causation_id` を `EVENT_CAUSATION_UNRESOLVED` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-026 | `evaluateCausalOrder` | correlation 跨ぎの causation を `EVENT_CORRELATION_MISMATCH` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-027 | `evaluateCausalOrder` | 時刻逆行を `EVENT_CAUSAL_INVERSION` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-028 | `evaluateCausalOrder` | 未来時刻と未解決 causation の同時成立で未来先書きが先着する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-029 | `evaluateCausalOrder` | correlation 不一致と時刻逆行の同時成立で correlation が先着する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-030 | `evaluateCausalOrder` | `observedAt` と同時刻の envelope を受理する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-031 | `evaluateCausalOrder` | 原因と同時刻の結果 event を受理する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-032 | `evaluateIdempotentIngest` | 未登録 `event_id` に `appended` を返す | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-033 | `evaluateIdempotentIngest` | 同一 digest の再投入に `duplicate_absorbed` を返す | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-034 | `evaluateIdempotentIngest` | digest 不一致の再投入を `EVENT_DUPLICATE_DIGEST_MISMATCH` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-035 | `evaluateIdempotentIngest` | `event_id` 重複の log snapshot を `EVENT_LOG_SNAPSHOT_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-036 | `evaluateIdempotentIngest` | `duplicate_absorbed` が列長を変えない | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-037 | `evaluateIdempotentIngest` | 3 回投入で 2 回目以降が全て `duplicate_absorbed` になる | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-038 | `evaluateIdempotentIngest` | digest 不一致の拒否が `log.entries` を変更しない | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-039 | `evaluateLifecycleTransition` | 正規 5 段遷移を全段受理する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-040 | `evaluateLifecycleTransition` | 前段の無い `terminated` を `EVENT_TRANSITION_ILLEGAL` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-041 | `evaluateLifecycleTransition` | 段飛ばし遷移を `EVENT_TRANSITION_ILLEGAL` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-042 | `evaluateLifecycleTransition` | seal 後の追加遷移を `EVENT_TRANSITION_AFTER_SEAL` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-043 | `evaluateLifecycleTransition` | handover 反復を受理する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-044 | `evaluateLifecycleTransition` | 対応要求の無い `handover_completed` を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-045 | `evaluateLifecycleTransition` | `started` → `failed` を受理する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-046 | `evaluateLifecycleTransition` | `failed` 後の逆行遷移を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-047 | `evaluateProjectionDrift` | identity と state が全一致する対を受理する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-048 | `evaluateProjectionDrift` | `identity.plan_id` 単独変異を `EVENT_PROJECTION_DRIFT` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-049 | `evaluateProjectionDrift` | `identity.parent_lane_id` 単独変異を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-050 | `evaluateProjectionDrift` | `state.lifecycle_state` 単独変異を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-051 | `evaluateProjectionDrift` | `state.head_sha` 単独変異を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-052 | `evaluateProjectionDrift` | `state.last_event_id` 単独変異を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-053 | `evaluateProjectionDrift` | top-levelとnested identityが整合した未知lane read-backを`EVENT_ORPHAN_LANE`で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-054 | `evaluateProjectionDrift` | identity 一致・state 不一致を成功へ読み替えない | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-055 | `evaluateProjectionDrift` | state 一致・identity 不一致を成功へ読み替えない | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-056 | `evaluateProjectionDrift` | event 追記の無い read-back 変更を drift で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-057 | `selectCheckpointScope` | 5 field 完備の scope が区間内 event_id を append 順で返す | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-058 | `selectCheckpointScope` | `head_sha` 欠落を `EVENT_CHECKPOINT_SCOPE_MISSING` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-059 | `selectCheckpointScope` | `parent_lane_id` 欠落を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-060 | `selectCheckpointScope` | `lane_id` 欠落を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-061 | `selectCheckpointScope` | `from_event_id` 欠落を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-062 | `selectCheckpointScope` | `to_event_id` 欠落を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-063 | `selectCheckpointScope` | `scope` undefined で全体スコープへフォールバックしない | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-064 | `selectCheckpointScope` | log 不在の `from_event_id` を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-065 | `selectCheckpointScope` | 逆転区間を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-066 | `selectCheckpointScope` | 別 lane の追記で `eventIds` が変化しない | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-067 | `evaluateCheckpointReplay` | 束縛 3 件と digest 2 件が揃う checkpoint を受理する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-068 | `evaluateCheckpointReplay` | `head_sha` 欠落を `EVENT_CHECKPOINT_BINDING_MISSING` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-069 | `evaluateCheckpointReplay` | `parent_lane_id` 欠落を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-070 | `evaluateCheckpointReplay` | `event_boundary` 欠落を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-071 | `evaluateCheckpointReplay` | HEAD 不一致を `EVENT_STALE_HEAD` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-072 | `evaluateCheckpointReplay` | 境界端点の不一致を `EVENT_CHECKPOINT_SCOPE_MISSING` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-073 | `evaluateCheckpointReplay` | projection digest 不一致を `EVENT_REPLAY_NOT_IDEMPOTENT` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-074 | `evaluateCheckpointReplay` | checkpoint digest 不一致を `EVENT_REPLAY_NOT_IDEMPOTENT` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-075 | `evaluateCheckpointReplay` | 束縛欠落と stale HEAD の同時成立で束縛検査が先着する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-076 | `evaluateCheckpointReplay` | stale HEAD と digest 不一致の同時成立で stale HEAD が先着する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-077 | `routeRecovery` | rate limit かつ budget 残ありで `bounded_retry` を返す | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-078 | `routeRecovery` | `max_attempts` 欠落を `EVENT_RETRY_UNBOUNDED` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-079 | `routeRecovery` | `max_attempts` が 0 の budget を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-080 | `routeRecovery` | `attempt == max_attempts` で `bounded_retry` を返す | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-081 | `routeRecovery` | 上限超過で `recovery` を返す | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-082 | `routeRecovery` | retry 不能 code で `recovery` を返す | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-083 | `routeRecovery` | `route` が 2 値のみで完了継続値を持たない | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-084 | 全 8 関数 | 入力オブジェクトを変更せず返り値が入力と構造を共有しない | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-085 | 全 8 関数 | 同一入力の 2 回呼び出しが同一結果を返す | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-086 | `evaluateCheckpointReplay` | digest が `canonicalJson` / `sha256Digest` の出力と一致し第二の算出系を経由しない | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-087 | `selectCheckpointScope` | `event_id` 重複の log snapshot を形式検査より先に `EVENT_LOG_SNAPSHOT_INVALID` で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-088 | `admitEventEnvelope` | payload だけの入力が `EVENT_ENVELOPE_INVALID` を返す | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-089 | `admitEventEnvelope` | exact 11 fieldにunknown fieldを追加した入力を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-090 | `admitEventEnvelope` | 空`schema_version`を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-091 | `admitEventEnvelope` | RFC3339でない`occurred_at`を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-092 | `selectCheckpointScope` | scopeとlogのlane不一致を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-093 | `selectCheckpointScope` | 不正`head_sha`を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-094 | `selectCheckpointScope` | 空`parent_lane_id`を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-095 | `routeRecovery` | 非数値`max_attempts`を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-096 | `routeRecovery` | 非数値`attempt`を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-097 | `routeRecovery` | `attempt: 0`を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-098 | `evaluateLifecycleTransition` | 別correlationの末尾entryを前段として利用しない | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-099 | `selectCheckpointScope` | unknown追加fieldを拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-100 | `evaluateCheckpointReplay` | 始点一致・終点不一致を拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-101 | `evaluateProjectionDrift` | snapshot内部lane不整合を`EVENT_PROJECTION_DRIFT`で拒否しorphanへ誤分類しない | `tests/event-projection-checkpoint-replay.test.ts` |
| U-EPR-102 | `evaluateProjectionDrift` | 別の既知laneをorphanへ誤分類せず`EVENT_PROJECTION_DRIFT`で拒否する | `tests/event-projection-checkpoint-replay.test.ts` |
