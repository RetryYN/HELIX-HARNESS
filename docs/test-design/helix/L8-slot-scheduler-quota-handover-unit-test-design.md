---
title: "8-slot scheduler と quota handover L8 unit test設計"
canonical_layer_scheme: L1-L12
layer: L8
sub_doc: unit-test-design
paired_layer: L5
status: draft
plan: docs/plans/PLAN-L5-97-slot-scheduler-quota-handover.md
pair_artifact: docs/design/helix/L5-detail/slot-scheduler-quota-handover.md
behavior_contract_id: SLOT-SCHEDULER-QUOTA-HANDOVER-001
responsibility_owner: slot-scheduler-quota-handover
---

# 8-slot scheduler と quota handover L8 unit test設計

## 1. unit oracle 一覧

L5 §1-4 の各判定関数（accounting row 検証、dispatch 判定順序、conflict exclusion 4 軸、quota handover、
failure isolation、capacity evidence）を単体粒度で Red にする。L9（U-SSQ-S-001..031）は経路レベルの
system oracle であり、本 L8 は判定関数 1 個ずつの mutation・境界条件・判定順序を扱う。

| oracle_id | 種別 | 対象判定関数 | 合格条件 | L9対応 |
|---|---|---|---|---|
| U-SSQ-001 | positive | `admitSlotAccountingRow` | 9 field 完備の row を admit し、正規化された `SlotAccountingRowV1` を返す | U-SSQ-S-001 |
| U-SSQ-002 | mutation | `admitSlotAccountingRow` | `slot_id` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-003 | mutation | `admitSlotAccountingRow` | `parent_id` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-004 | mutation | `admitSlotAccountingRow` | `task_id` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-005 | mutation | `admitSlotAccountingRow` | `dependency_ids` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-006 | mutation | `admitSlotAccountingRow` | `slot_state` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-007 | mutation | `admitSlotAccountingRow` | `quota_snapshot` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-008 | mutation | `admitSlotAccountingRow` | `writer_lease` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-009 | mutation | `admitSlotAccountingRow` | `started_at` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-010 | mutation | `admitSlotAccountingRow` | `terminated_at` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-011 | mutation | `admitSlotAccountingRow` | 欠落 field を unknown 追加 field で埋めた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する（欠落相殺の拒否） | U-SSQ-S-004 |
| U-SSQ-012 | negative | `admitSlotAccountingRow` | enum 外の `slot_state` を `SCHEDULER_INPUT_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-013 | mutation | `admitSlotAccountingRow` | ネストした `quota_snapshot` の `limit` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-014 | mutation | `admitSlotAccountingRow` | ネストした `writer_lease` の `fence_token` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-015 | positive | `evaluateDispatchAdmission` | 判定順序 1..8 を全て満たす候補を admit する | U-SSQ-S-001 |
| U-SSQ-016 | negative | `evaluateDispatchAdmission` | accounting row が不正な候補を、後続判定へ進まず `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する（判定順序 1） | U-SSQ-S-003 |
| U-SSQ-017 | negative | `evaluateDispatchAdmission` | `queue_limit` を欠落させた queue を `SCHEDULER_QUEUE_UNBOUNDED` で拒否する | U-SSQ-S-012 |
| U-SSQ-018 | negative | `evaluateDispatchAdmission` | `queue_limit` が null の queue を `SCHEDULER_QUEUE_UNBOUNDED` で拒否する | U-SSQ-S-012 |
| U-SSQ-019 | negative | `evaluateDispatchAdmission` | `queue_limit` が 0 以下の queue を `SCHEDULER_QUEUE_UNBOUNDED` で拒否する | U-SSQ-S-012 |
| U-SSQ-020 | negative | `evaluateDispatchAdmission` | `capacity` が 1..8 の範囲外（0 および 9）の queue を `SCHEDULER_INPUT_INVALID` で拒否する | U-SSQ-S-002 |
| U-SSQ-021 | negative | `evaluateDispatchAdmission` | `dependency_ids` が READY 集合に包含されない候補を `SCHEDULER_DEPENDENCY_NOT_READY` で拒否する | U-SSQ-S-005 |
| U-SSQ-022 | negative | conflict exclusion（Issue 軸） | 稼働 row と `issue_id` が同一の候補を `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` で拒否する | U-SSQ-S-006 |
| U-SSQ-023 | negative | conflict exclusion（責務軸） | 稼働 row と `behavior_contract_id` が同一の候補を `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` で拒否する | U-SSQ-S-007 |
| U-SSQ-024 | negative | conflict exclusion（責務軸） | 稼働 row と `responsibility_owner` が同一の候補を `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` で拒否する | U-SSQ-S-007 |
| U-SSQ-025 | negative | conflict exclusion（共有正本軸） | 稼働 row と `shared_authority_ids` が交差する候補を `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` で拒否する | U-SSQ-S-008 |
| U-SSQ-026 | negative | conflict exclusion（path 軸） | 稼働 row と `allowed_paths` が prefix 一致で交差する候補を `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` で拒否する | U-SSQ-S-009 |
| U-SSQ-027 | positive | conflict exclusion | 4 軸いずれも交差しない候補 8 件が全て admit され、fence token owner が 8 件とも異なる | U-SSQ-S-010 |
| U-SSQ-028 | negative | `evaluateDispatchAdmission` | 稼働 slot が `capacity` に達した状態の候補を `SCHEDULER_CAPACITY_EXCEEDED` で拒否する | U-SSQ-S-002 |
| U-SSQ-029 | negative | `evaluateDispatchAdmission` | `queue_limit` 欠落と capacity 超過が同時に成立する入力で `SCHEDULER_QUEUE_UNBOUNDED` を返す（判定順序 2 が 6 より先） | U-SSQ-S-012 |
| U-SSQ-030 | negative | `evaluateDispatchAdmission` | 稼働 row と同一レーン（`parent_id` / `task_id` 一致）で `writer_lease.owner` が異なる候補を `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` で拒否する（§2.1 条件 1） | U-SSQ-S-014 |
| U-SSQ-031 | negative | `evaluateDispatchAdmission` | `terminated_at` < `started_at` の候補を `SCHEDULER_TIME_ORDER_INVALID` で拒否する | U-SSQ-S-029 |
| U-SSQ-032 | negative | `admitQueueEntry` | queue 上限到達時に `SCHEDULER_QUEUE_BACKPRESSURE` を返し、`entries` の長さと内容が不変である（drop しない） | U-SSQ-S-011 |
| U-SSQ-033 | positive | `evaluateQuotaHandover` | `consumed` < `threshold` の状態で 5 要素完備の packet を admit し、lease 系譜が旧 owner から継続する | U-SSQ-S-015 |
| U-SSQ-034 | negative | `evaluateQuotaHandover` | `consumed` が `threshold` へ到達した後の handover を `SCHEDULER_QUOTA_EXHAUSTED` で拒否する | U-SSQ-S-016 |
| U-SSQ-035 | mutation | `evaluateQuotaHandover` | packet の `lane_id` を欠落させた handover を `SCHEDULER_HANDOVER_PACKET_MISSING` で拒否する | U-SSQ-S-017 |
| U-SSQ-036 | mutation | `evaluateQuotaHandover` | packet の `task_id` を欠落させた handover を `SCHEDULER_HANDOVER_PACKET_MISSING` で拒否する | U-SSQ-S-017 |
| U-SSQ-037 | mutation | `evaluateQuotaHandover` | packet の `candidate_head` を欠落させた handover を `SCHEDULER_HANDOVER_PACKET_MISSING` で拒否する | U-SSQ-S-017 |
| U-SSQ-038 | mutation | `evaluateQuotaHandover` | packet の `writer_lease` を欠落させた handover を `SCHEDULER_HANDOVER_PACKET_MISSING` で拒否する | U-SSQ-S-017 |
| U-SSQ-039 | mutation | `evaluateQuotaHandover` | packet の `remaining_scope` を欠落させた handover を `SCHEDULER_HANDOVER_PACKET_MISSING` で拒否する | U-SSQ-S-017 |
| U-SSQ-040 | mutation | `evaluateQuotaHandover` | packet の `lane_id` だけを別 lane へ変異させた通知を `SCHEDULER_HANDOVER_TARGET_MISMATCH` で拒否する | U-SSQ-S-019 |
| U-SSQ-041 | mutation | `evaluateQuotaHandover` | packet の `target_reviewer` だけを変異させた通知を `SCHEDULER_HANDOVER_TARGET_MISMATCH` で拒否する | U-SSQ-S-019 |
| U-SSQ-042 | mutation | `evaluateQuotaHandover` | packet の `candidate_head` だけを変異させた通知を `SCHEDULER_HANDOVER_TARGET_MISMATCH` で拒否する | U-SSQ-S-019 |
| U-SSQ-043 | negative | `evaluateQuotaHandover` | ack 済み packet の再配送を `SCHEDULER_HANDOVER_ACK_REPLAY` で拒否する | U-SSQ-S-020 |
| U-SSQ-044 | negative | `evaluateQuotaHandover` | 旧 owner の lease 未解放のまま後継 owner が acquire する handover を `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` で拒否する | U-SSQ-S-018 |
| U-SSQ-045 | positive | `evaluateSlotFailureIsolation` | failure 前後で peers の `slot_state`・`writer_lease`・queue 位置が不変なら ok を返す | U-SSQ-S-021 |
| U-SSQ-046 | negative | `evaluateSlotFailureIsolation` | peer の `slot_state` が変化した場合に `SCHEDULER_FAILURE_ISOLATION_BREACH` で拒否する | U-SSQ-S-021 |
| U-SSQ-047 | negative | `evaluateSlotFailureIsolation` | peer の `writer_lease` が解放された場合に `SCHEDULER_FAILURE_ISOLATION_BREACH` で拒否する | U-SSQ-S-022 |
| U-SSQ-048 | negative | `evaluateSlotFailureIsolation` | peer の queue 位置が変化した場合に `SCHEDULER_FAILURE_ISOLATION_BREACH` で拒否する | U-SSQ-S-022 |
| U-SSQ-049 | positive | `admitCapacityEvidence` | `lane_count` = `claimed_capacity` = 8 の evidence を admit する | U-SSQ-S-024 |
| U-SSQ-050 | negative | `admitCapacityEvidence` | `lane_count` 4 で `claimed_capacity` 8 を主張する evidence を `SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED` で拒否する | U-SSQ-S-025 |
| U-SSQ-051 | negative | `admitCapacityEvidence` | `lane_count` を欠落させた evidence を `SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED` で拒否する | U-SSQ-S-026 |
| U-SSQ-052 | negative | `evaluateFrontierRecalculation` | `requestsMergeOrderDecision` が true の入力を、他判定へ進まず `SCHEDULER_MERGE_AUTHORITY_VIOLATION` で拒否する | U-SSQ-S-031 |
| U-SSQ-053 | positive | `evaluateDispatchAdmission` | 同一 task 集合・同一 capacity で 2 回評価した結果（admit 順序・lease owner・queue 内容）が一致する | U-SSQ-S-030 |
| U-SSQ-054 | negative | `admitQueueEntry` | backpressure 結果が `ok: false` であり、呼び出し側が成功として扱えない（受理成功と読み替えない） | U-SSQ-S-013 |
| U-SSQ-055 | negative | `evaluateSlotFailureIsolation` | `failed.writer_lease` を解放せずに slot を除去する入力を `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` で拒否する | U-SSQ-S-023 |
| U-SSQ-056 | negative | `evaluateFrontierRecalculation` | merge 前 HEAD の `revalidated.base_head` を持つ候補を `SCHEDULER_INPUT_INVALID` で拒否する（merge 前 receipt の流用拒否） | U-SSQ-S-027 |
| U-SSQ-057 | positive | `evaluateFrontierRecalculation` | base drift・CI・review・DB receipt を全て再判定済みの候補だけを merge 候補へ復帰させる | U-SSQ-S-028 |
| U-SSQ-058 | negative | `evaluateDispatchAdmission` | 別 lane の初回 lease が同じ `fence_token` 値を持つ候補を、lane が異なる限り `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` としない（lane をまたいだ値一致を衝突扱いしない、§2.1） | U-SSQ-S-010 |
| U-SSQ-059 | negative | `evaluateQuotaHandover` | packet 欠落と ack 済みが同時成立する入力で `SCHEDULER_HANDOVER_PACKET_MISSING` を返す（判定順序 2 が 3 より先） | U-SSQ-S-017 |
| U-SSQ-060 | negative | `admitQueueEntry` | `entries` / `running` に既出の `taskId` を `SCHEDULER_INPUT_INVALID` で拒否する | U-SSQ-S-011 |
| U-SSQ-061 | negative | `admitQueueEntry` | `queue_limit` の欠落・null・0 以下を `SCHEDULER_QUEUE_UNBOUNDED` で拒否する（判定順序 1） | U-SSQ-S-012 |
| U-SSQ-062 | negative | `evaluateDispatchAdmission` | 稼働 row と同一レーン・同一 owner で `fence_token` が異なる候補を `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` で拒否する（§2.1 条件 2、旧 lease 未解放） | U-SSQ-S-018 |
| U-SSQ-063 | negative | `evaluateFrontierRecalculation` | `ci_passed` が false の候補を `SCHEDULER_INPUT_INVALID` で拒否する（判定順序 3） | U-SSQ-S-027 |
| U-SSQ-064 | negative | `evaluateFrontierRecalculation` | `review_approved` が false の候補を `SCHEDULER_INPUT_INVALID` で拒否する（判定順序 3） | U-SSQ-S-027 |
| U-SSQ-065 | negative | `evaluateFrontierRecalculation` | `db_receipt_digest` が null の候補を `SCHEDULER_INPUT_INVALID` で拒否する（判定順序 3） | U-SSQ-S-027 |

| U-SSQ-066 | negative | `evaluateQuotaHandover` | packet の `writer_lease.fence_token` が稼働 row の lease と異なる handover を、CAS 失敗の `WORK_GRAPH_LEASE_CAS_STALE` をそのまま透過して拒否する | U-SSQ-S-018 |
| U-SSQ-067 | negative | `evaluateQuotaHandover` | packet が稼働 row と異なる `writer_lease.owner` を主張する handover を `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` で拒否する | U-SSQ-S-018 |
| U-SSQ-068 | negative | `evaluateQuotaHandover` | identifier 形式を満たさない `successorOwner` を `SCHEDULER_INPUT_INVALID` で拒否する | U-SSQ-S-017 |
| U-SSQ-069 | negative | `evaluateQuotaHandover` | `slot_state` が `running` でない source slot からの handover を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-015 |
| U-SSQ-070 | negative | `evaluateDispatchAdmission` | 形式不正な `candidateScope` を `SCHEDULER_INPUT_INVALID` で拒否する | U-SSQ-S-006 |
| U-SSQ-071 | negative | `evaluateDispatchAdmission` | 稼働 row に対応する conflict scope が未登録の入力を `SCHEDULER_INPUT_INVALID` で拒否する | U-SSQ-S-006 |
| U-SSQ-072 | negative | `evaluateDispatchAdmission` | 重複を含む `readyDependencyIds` を `SCHEDULER_INPUT_INVALID` で拒否する | U-SSQ-S-005 |
| U-SSQ-073 | negative | `evaluateSlotFailureIsolation` | 形式不正な観測後 peer row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-021 |
| U-SSQ-074 | positive | `admitSlotAccountingRow` | admit 結果のネストした `quota_snapshot` / `writer_lease` / `dependency_ids` が凍結されている | U-SSQ-S-001 |

| U-SSQ-075 | negative | `evaluateDispatchAdmission` | 稼働 row 集合に含まれる形式不正な row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-003 |
| U-SSQ-076 | negative | `evaluateSlotFailureIsolation` | 形式不正な failure lane row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-021 |
| U-SSQ-077 | negative | `evaluateSlotFailureIsolation` | 形式不正な基準 peer row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-021 |
| U-SSQ-078 | negative | `evaluateSlotFailureIsolation` | peer が消失した観測後集合を `SCHEDULER_FAILURE_ISOLATION_BREACH` で拒否する | U-SSQ-S-022 |
| U-SSQ-079 | negative | `evaluateFrontierRecalculation` | 形式不正な `mergedHead` を `SCHEDULER_INPUT_INVALID` で拒否する | U-SSQ-S-027 |
| U-SSQ-080 | negative | `evaluateFrontierRecalculation` | 形式不正な candidate row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | U-SSQ-S-027 |
| U-SSQ-081 | positive | `admitSlotAccountingRow` | admit 後も呼び出し側が渡した入力オブジェクトのネストが凍結されない（pure judgement の副作用ゼロ） | U-SSQ-S-001 |
| U-SSQ-082 | negative | `evaluateSlotFailureIsolation` | slot が増えた観測後集合を `SCHEDULER_FAILURE_ISOLATION_BREACH` で拒否する | U-SSQ-S-022 |

## 2. fail-close 8 系統との対応

L4 §6 の fail-close 8 系統を、それぞれ次の unit oracle で単体粒度に分解する。

| fail-close 系統 | 対応 unit oracle |
|---|---|
| 8 超過 dispatch の拒否 | U-SSQ-020, U-SSQ-028, U-SSQ-029 |
| dependency 前倒し dispatch の拒否 | U-SSQ-021 |
| unbounded queue の拒否 | U-SSQ-017, U-SSQ-018, U-SSQ-019 |
| queue 上限到達時の backpressure（受理も drop もしない） | U-SSQ-032, U-SSQ-054, U-SSQ-060, U-SSQ-061 |
| lease 二重所有の拒否 | U-SSQ-030, U-SSQ-044, U-SSQ-055, U-SSQ-058, U-SSQ-062 |
| quota 枯渇（事後 handover）の拒否 | U-SSQ-034 |
| handover 喪失の拒否 | U-SSQ-035..U-SSQ-039, U-SSQ-040..U-SSQ-043, U-SSQ-059 |
| 1 lane failure による独立 lane 消失の拒否 | U-SSQ-045, U-SSQ-046, U-SSQ-047, U-SSQ-048 |
| 4-slot 結果による 8-slot claim の拒否 | U-SSQ-049, U-SSQ-050, U-SSQ-051 |
| exact set の unknown field 相殺の拒否 | U-SSQ-002..U-SSQ-014 |

L4 §6 の 8 系統に、backpressure と exact set 相殺の 2 行を加えた 10 行で表す（backpressure は
「上限到達」であり unbounded queue の「上限未設定」とは逆の状態のため、同一行に混ぜない）。

exact set 検証（9 field）は U-SSQ-002..U-SSQ-010 の欠落単体 mutation と、それとは独立した fixture である
U-SSQ-011（unknown 追加 field 相殺）で二重に検証する。conflict exclusion 4 軸は U-SSQ-022..U-SSQ-026 で
**1 軸ずつ独立に**崩し、U-SSQ-027 で 4 軸非交差の positive を押さえる。MIC-R-02 の権限非移譲は
U-SSQ-052 が単体で担保し、MIC-AC-009（merge 後の base HEAD 再評価）は U-SSQ-056 / U-SSQ-063..065 の
negative と U-SSQ-057 の positive で両方向を担保する。

## 3. fixture 方針

fixture は L5 §7 の実在資産（`acquireWorkGraphLease` / `releaseWorkGraphLease` /
`verifyWorkerLifecycleReceipt`）をそのまま呼び出して lease と terminal 判定を組み立て、slot accounting
row・bounded queue snapshot・quota handover packet・capacity evidence は本 PLAN の新規実装（L6）に対して
positive/negative の両方向を張る。基準 fixture は capacity 8・queue_limit 4・conflict-free task 8 件を
既定とし、各 negative oracle は基準 fixture から**判定対象の 1 条件だけ**を差し替える（複数条件を同時に
崩す fixture は false negative を隠すため使わない）。

例外は**判定順序検証 oracle**（U-SSQ-029 / U-SSQ-059）に限る。これらは 2 条件を意図的に同時成立させ、
L5 §2 / §2.2 で固定した順序どおりに先着条件の failure code が返ることを確認するのが目的であり、
条件の取りこぼしを隠す用途ではない。それ以外の oracle で複数条件を同時に崩すことは認めない。

mutation は既存 mutation 検証契約（`docs/design/helix/L5-detail/requirement-refinement-authority.md` §4 と
同型）に従い、判定分岐を 1 つずつ除去した mutant を個別 fixture で Red にする。文言一致（`toContain()`）
だけを到達証拠にせず、failure code の一致で判定する。

## 4. eligible oracle 束縛表

PLAN-L7-527 の `verification_bindings` が参照する canonical 表。各行は実行可能な `it()` case 1 件と
1 対 1 で対応する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SSQ-001 | `admitSlotAccountingRow` | 9 field 完備の row を admit し、正規化された `SlotAccountingRowV1` を返す | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-002 | `admitSlotAccountingRow` | `slot_id` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-003 | `admitSlotAccountingRow` | `parent_id` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-004 | `admitSlotAccountingRow` | `task_id` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-005 | `admitSlotAccountingRow` | `dependency_ids` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-006 | `admitSlotAccountingRow` | `slot_state` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-007 | `admitSlotAccountingRow` | `quota_snapshot` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-008 | `admitSlotAccountingRow` | `writer_lease` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-009 | `admitSlotAccountingRow` | `started_at` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-010 | `admitSlotAccountingRow` | `terminated_at` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-011 | `admitSlotAccountingRow` | 欠落 field を unknown 追加 field で埋めた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-012 | `admitSlotAccountingRow` | enum 外の `slot_state` を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-013 | `admitSlotAccountingRow` | ネストした `quota_snapshot` の `limit` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-014 | `admitSlotAccountingRow` | ネストした `writer_lease` の `fence_token` を欠落させた row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-015 | `evaluateDispatchAdmission` | 判定順序 1..8 を全て満たす候補を admit する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-016 | `evaluateDispatchAdmission` | accounting row が不正な候補を後続判定へ進めず `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-017 | `evaluateDispatchAdmission` | `queue_limit` を欠落させた queue を `SCHEDULER_QUEUE_UNBOUNDED` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-018 | `evaluateDispatchAdmission` | `queue_limit` が null の queue を `SCHEDULER_QUEUE_UNBOUNDED` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-019 | `evaluateDispatchAdmission` | `queue_limit` が 0 以下の queue を `SCHEDULER_QUEUE_UNBOUNDED` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-020 | `evaluateDispatchAdmission` | `capacity` が 1..8 の範囲外の queue を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-021 | `evaluateDispatchAdmission` | `dependency_ids` が READY 集合に包含されない候補を `SCHEDULER_DEPENDENCY_NOT_READY` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-022 | conflict exclusion（Issue 軸） | 稼働 row と `issue_id` が同一の候補を `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-023 | conflict exclusion（責務軸） | 稼働 row と `behavior_contract_id` が同一の候補を `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-024 | conflict exclusion（責務軸） | 稼働 row と `responsibility_owner` が同一の候補を `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-025 | conflict exclusion（共有正本軸） | 稼働 row と `shared_authority_ids` が交差する候補を `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-026 | conflict exclusion（path 軸） | 稼働 row と `allowed_paths` が prefix 一致で交差する候補を `SCHEDULER_CONFLICT_EXCLUSION_VIOLATION` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-027 | conflict exclusion | 4 軸いずれも交差しない候補 8 件が全て admit され、fence token owner が 8 件とも異なる | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-028 | `evaluateDispatchAdmission` | 稼働 slot が `capacity` に達した状態の候補を `SCHEDULER_CAPACITY_EXCEEDED` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-029 | `evaluateDispatchAdmission` | `queue_limit` 欠落と capacity 超過が同時成立する入力で `SCHEDULER_QUEUE_UNBOUNDED` を返す | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-030 | `evaluateDispatchAdmission` | 稼働 row と同一レーンで `writer_lease.owner` が異なる候補を `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-031 | `evaluateDispatchAdmission` | `terminated_at` < `started_at` の候補を `SCHEDULER_TIME_ORDER_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-032 | `admitQueueEntry` | queue 上限到達時に `SCHEDULER_QUEUE_BACKPRESSURE` を返し `entries` が不変である | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-033 | `evaluateQuotaHandover` | `consumed` < `threshold` で 5 要素完備の packet を admit し lease 系譜が継続する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-034 | `evaluateQuotaHandover` | `consumed` が `threshold` へ到達した後の handover を `SCHEDULER_QUOTA_EXHAUSTED` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-035 | `evaluateQuotaHandover` | packet の `lane_id` を欠落させた handover を `SCHEDULER_HANDOVER_PACKET_MISSING` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-036 | `evaluateQuotaHandover` | packet の `task_id` を欠落させた handover を `SCHEDULER_HANDOVER_PACKET_MISSING` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-037 | `evaluateQuotaHandover` | packet の `candidate_head` を欠落させた handover を `SCHEDULER_HANDOVER_PACKET_MISSING` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-038 | `evaluateQuotaHandover` | packet の `writer_lease` を欠落させた handover を `SCHEDULER_HANDOVER_PACKET_MISSING` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-039 | `evaluateQuotaHandover` | packet の `remaining_scope` を欠落させた handover を `SCHEDULER_HANDOVER_PACKET_MISSING` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-040 | `evaluateQuotaHandover` | packet の `lane_id` だけを別 lane へ変異させた通知を `SCHEDULER_HANDOVER_TARGET_MISMATCH` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-041 | `evaluateQuotaHandover` | packet の `target_reviewer` だけを変異させた通知を `SCHEDULER_HANDOVER_TARGET_MISMATCH` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-042 | `evaluateQuotaHandover` | packet の `candidate_head` だけを変異させた通知を `SCHEDULER_HANDOVER_TARGET_MISMATCH` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-043 | `evaluateQuotaHandover` | ack 済み packet の再配送を `SCHEDULER_HANDOVER_ACK_REPLAY` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-044 | `evaluateQuotaHandover` | 旧 owner の lease 未解放のまま後継 owner が acquire する handover を `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-045 | `evaluateSlotFailureIsolation` | failure 前後で peers の state・lease・queue 位置が不変なら ok を返す | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-046 | `evaluateSlotFailureIsolation` | peer の `slot_state` が変化した場合に `SCHEDULER_FAILURE_ISOLATION_BREACH` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-047 | `evaluateSlotFailureIsolation` | peer の `writer_lease` が解放された場合に `SCHEDULER_FAILURE_ISOLATION_BREACH` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-048 | `evaluateSlotFailureIsolation` | peer の queue 位置が変化した場合に `SCHEDULER_FAILURE_ISOLATION_BREACH` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-049 | `admitCapacityEvidence` | `lane_count` = `claimed_capacity` = 8 の evidence を admit する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-050 | `admitCapacityEvidence` | `lane_count` 4 で `claimed_capacity` 8 を主張する evidence を `SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-051 | `admitCapacityEvidence` | `lane_count` を欠落させた evidence を `SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-052 | `evaluateFrontierRecalculation` | `requestsMergeOrderDecision` が true の入力を他判定へ進めず `SCHEDULER_MERGE_AUTHORITY_VIOLATION` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-053 | `evaluateDispatchAdmission` | 同一 task 集合・同一 capacity での 2 回評価結果が一致する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-054 | `admitQueueEntry` | backpressure 結果が `ok: false` であり成功として扱えない | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-055 | `evaluateSlotFailureIsolation` | `failed.writer_lease` を解放せずに slot を除去する入力を `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-056 | `evaluateFrontierRecalculation` | merge 前 HEAD の `revalidated.base_head` を持つ候補を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-057 | `evaluateFrontierRecalculation` | base drift・CI・review・DB receipt を全て再判定済みの候補だけを merge 候補へ復帰させる | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-058 | `evaluateDispatchAdmission` | 別 lane の初回 lease が同じ `fence_token` 値でも lane が異なれば衝突扱いしない | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-059 | `evaluateQuotaHandover` | packet 欠落と ack 済みが同時成立する入力で `SCHEDULER_HANDOVER_PACKET_MISSING` を返す | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-060 | `admitQueueEntry` | `entries` / `running` に既出の `taskId` を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-061 | `admitQueueEntry` | `queue_limit` の欠落・null・0 以下を `SCHEDULER_QUEUE_UNBOUNDED` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-062 | `evaluateDispatchAdmission` | 稼働 row と同一レーン・同一 owner で `fence_token` が異なる候補を `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-063 | `evaluateFrontierRecalculation` | `ci_passed` が false の候補を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-064 | `evaluateFrontierRecalculation` | `review_approved` が false の候補を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-065 | `evaluateFrontierRecalculation` | `db_receipt_digest` が null の候補を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-066 | `evaluateQuotaHandover` | packet の fence token が稼働 row の lease と異なる handover を `WORK_GRAPH_LEASE_CAS_STALE` の透過で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-067 | `evaluateQuotaHandover` | packet が異なる lease owner を主張する handover を `SCHEDULER_LEASE_DOUBLE_OWNERSHIP` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-068 | `evaluateQuotaHandover` | 形式不正な `successorOwner` を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-069 | `evaluateQuotaHandover` | `slot_state` が `running` でない source slot を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-070 | `evaluateDispatchAdmission` | 形式不正な `candidateScope` を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-071 | `evaluateDispatchAdmission` | conflict scope が未登録の稼働 row を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-072 | `evaluateDispatchAdmission` | 重複を含む `readyDependencyIds` を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-073 | `evaluateSlotFailureIsolation` | 形式不正な観測後 peer row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-074 | `admitSlotAccountingRow` | admit 結果のネストした record と配列が凍結されている | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-075 | `evaluateDispatchAdmission` | 稼働 row 集合の形式不正 row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-076 | `evaluateSlotFailureIsolation` | 形式不正な failure lane row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-077 | `evaluateSlotFailureIsolation` | 形式不正な基準 peer row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-078 | `evaluateSlotFailureIsolation` | peer が消失した観測後集合を `SCHEDULER_FAILURE_ISOLATION_BREACH` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-079 | `evaluateFrontierRecalculation` | 形式不正な `mergedHead` を `SCHEDULER_INPUT_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-080 | `evaluateFrontierRecalculation` | 形式不正な candidate row を `SCHEDULER_SLOT_ACCOUNTING_INVALID` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-081 | `admitSlotAccountingRow` | admit 後も入力オブジェクトのネストが凍結されない | `tests/slot-scheduler-quota-handover.test.ts` |
| U-SSQ-082 | `evaluateSlotFailureIsolation` | slot が増えた観測後集合を `SCHEDULER_FAILURE_ISOLATION_BREACH` で拒否する | `tests/slot-scheduler-quota-handover.test.ts` |
