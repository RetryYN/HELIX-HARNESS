---
title: "work graph と三段 receipt 検収 L8 unit test設計"
canonical_layer_scheme: L1-L12
layer: L8
sub_doc: unit-test-design
paired_layer: L5
status: draft
plan: docs/plans/PLAN-L5-96-work-graph-receipt-acceptance.md
pair_artifact: docs/design/helix/L5-detail/work-graph-receipt-acceptance.md
behavior_contract_id: WORK-GRAPH-RECEIPT-ACCEPTANCE-001
responsibility_owner: work-graph-receipt-acceptance
---

# work graph と三段 receipt 検収 L8 unit test設計

## 1. unit oracle 一覧

L5 §1-4 の各判定関数（`required_cell_binding` 検証、fence token CAS、ordering 判定、既存 receipt 接続）を
単体粒度で Red にする。L9（U-WGR-S-001..020）は経路レベルの system oracle であり、本 L8 は判定関数 1 個ずつの
mutation・境界条件を扱う。ID 重複は避け、L9 と対応する場合は `L9対応` 列に oracle_id を記す。

| oracle_id | 種別 | 対象判定関数 | 合格条件 | L9対応 |
|---|---|---|---|---|
| U-WGR-001 | positive | `evaluateDelegationRequestOrdering` | READY 判定済み・exact set 完備・CAS 成功の入力で delegation-request receipt が 1 件 seal される | U-WGR-S-013 |
| U-WGR-002 | negative | `evaluateDelegationRequestOrdering` | `laneReadyReceipt` を欠落（dependency edge 未完了の graph snapshot）させた入力を `WORK_GRAPH_DEPENDENCY_NOT_READY` で拒否する | U-WGR-S-002 |
| U-WGR-003 | mutation | `required_cell_binding` exact set 検証 | `lane_id` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-004 | mutation | `required_cell_binding` exact set 検証 | `issue_id` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-005 | mutation | `required_cell_binding` exact set 検証 | `behavior_contract_id` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-006 | mutation | `required_cell_binding` exact set 検証 | `responsibility_owner` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-007 | mutation | `required_cell_binding` exact set 検証 | `base_head` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-008 | mutation | `required_cell_binding` exact set 検証 | `candidate_head` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-009 | mutation | `required_cell_binding` exact set 検証 | `writer_lease` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-010 | mutation | `required_cell_binding` exact set 検証 | `target_reviewer` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-011 | mutation | `required_cell_binding` exact set 検証 | `effective_rule_packet_digest` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-012 | mutation | `required_cell_binding` exact set 検証 | `allowed_paths` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-013 | mutation | `required_cell_binding` exact set 検証 | `forbidden_paths` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-014 | mutation | `required_cell_binding` exact set 検証 | `lane_ready_receipt` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | U-WGR-S-017 |
| U-WGR-015 | mutation | `required_cell_binding` exact set 検証 | exact set 12 field を全て備えた上で unknown 追加 field（例: `extra_hint`）を 1 個付与した packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否し、欠落 field を unknown field で相殺できないことを確認する（MIC-AC-004、false negative 抑止のため欠落単体 mutation U-WGR-003..014 とは別 fixture で検証） | U-WGR-S-017 |
| U-WGR-016 | mutation | `required_cell_binding` exact set 検証 | 12 field 全て揃うが `base_head` を書き換えた stale HEAD 値にした packet を `WORK_GRAPH_CELL_BINDING_INVALID` または `WORK_GRAPH_HEAD_DRIFT` のいずれか定義済み code で拒否する | U-WGR-S-017 |
| U-WGR-017 | negative | scope path 検証 | `allowed_paths` に含まれない changed path を伴う packet を `WORK_GRAPH_SCOPE_PATH_VIOLATION` で拒否する | U-WGR-S-017 |
| U-WGR-018 | negative | scope path 検証 | `forbidden_paths` に一致する changed path を伴う packet を `WORK_GRAPH_SCOPE_PATH_VIOLATION` で拒否する | U-WGR-S-017 |
| U-WGR-019 | negative | target reviewer 検証 | `target_reviewer` と `admitWorkerIndependentReview` の reviewer identity が不一致の場合を `WORK_GRAPH_TARGET_REVIEWER_MISMATCH` で拒否する | U-WGR-S-017 |
| U-WGR-020 | positive | fence token CAS 取得 | 現在 `fence_token` と要求側保持値が一致する場合、単調増加した新 `fence_token` へ更新し owner を要求側へ差し替える | - |
| U-WGR-021 | negative | fence token CAS 取得 | 現在 `fence_token` と要求側保持値が不一致（stale read）の場合を `WORK_GRAPH_LEASE_CAS_STALE` で拒否する | U-WGR-S-014 |
| U-WGR-022 | negative | fence token CAS 並行取得 | 同一 `lane_id` へ 2 件の acquire を同時投入し、先着 1 件だけ通過・後着は `WORK_GRAPH_LEASE_CAS_STALE` で拒否され、owner が 1 件に収束することを確認する | U-WGR-S-014 |
| U-WGR-023 | negative | fence token 解放条件 | worker terminal receipt 確定前（terminal_state 未 seal）に fence token 解放を要求した場合を `WORK_GRAPH_LEASE_EARLY_RELEASE` で拒否する | U-WGR-S-015 |
| U-WGR-024 | positive | fence token 解放条件 | worker terminal receipt が `accepted` / `rejected` / `quarantined` いずれかで sealed になった後の解放要求を admit する | - |
| U-WGR-025 | negative | reject/quarantine 再割当 | `rejected` で終端した dependency edge を READY へ自動復帰させず、新 delegation-request receipt が旧 `fence_token` と異なる新 `fence_token` を要求することを確認する | U-WGR-S-016 |
| U-WGR-026 | negative | reject/quarantine 再割当 | 旧 `fence_token` を再利用した再割当要求を `WORK_GRAPH_LEASE_CAS_STALE` で拒否する | U-WGR-S-016 |
| U-WGR-027 | negative | 先書き拒否（delegation） | `laneReadyReceipt` の `graph_snapshot_digest` が未確定（null）の状態で delegation-request receipt 生成を試行し、`WORK_GRAPH_RECEIPT_FUTURE_WRITE` で拒否する | U-WGR-S-004 |
| U-WGR-028 | negative | 先書き拒否（terminal→review） | independent review receipt が未 seal（`isWorkerIndependentReview()` が false）の状態で `createWorkerLifecycleReceipt` を呼び出し、既存 `WORKER_LIFECYCLE_REVIEW_UNSEALED` がそのまま伝播することを確認する | U-WGR-S-005 |
| U-WGR-029 | negative | 先書き拒否（acceptance→review） | `evaluateParentAcceptanceOrdering` に review 未 sealed（受け取った capability が `isWorkerIndependentReview()` で false）の入力を渡し、`WORK_GRAPH_ORDER_DIGEST_MISSING` で拒否する | U-WGR-S-006 |
| U-WGR-030 | negative | 先書き拒否（acceptance→terminal） | `evaluateParentAcceptanceOrdering` に terminal 未 sealed（`isWorkerLifecycleReceipt()` で false）の入力を渡し、`WORK_GRAPH_ORDER_DIGEST_MISSING` で拒否する | U-WGR-S-012 |
| U-WGR-031 | negative | 自己検収拒否（identity） | worker actor と reviewer actor を同一 identity にした `admitWorkerIndependentReview` 呼び出しが `HIL_ORCHESTRATION_IDENTITY_NOT_SEPARATED` を返し、work graph 側判定がこれをそのまま伝播することを確認する | U-WGR-S-007 |
| U-WGR-032 | negative | 自己検収拒否（session） | worker actor と reviewer actor を同一 session にした呼び出しが `HIL_ORCHESTRATION_SESSION_NOT_SEPARATED` を返し伝播することを確認する（identity/context は別軸に保つ単一 mutation） | U-WGR-S-008 |
| U-WGR-033 | negative | 自己検収拒否（context） | worker actor と reviewer actor を同一 context_digest にした呼び出しが `HIL_ORCHESTRATION_CONTEXT_NOT_INDEPENDENT` を返し伝播することを確認する（identity/session は別軸に保つ単一 mutation） | U-WGR-S-009 |
| U-WGR-034 | negative | 自己 acceptance 拒否（evaluator=writer） | `evaluator` を worker terminal receipt の起点 origin と同一 identity/session/context_digest にした parent acceptance 評価を `WORK_GRAPH_SELF_ACCEPTANCE` で拒否する | U-WGR-S-018 |
| U-WGR-035 | negative | 自己 acceptance 拒否（evaluator=reviewer） | `evaluator` を independent review receipt の `reviewer_model` と同一 identity/session/context_digest にした parent acceptance 評価を `WORK_GRAPH_SELF_ACCEPTANCE` で拒否する | U-WGR-S-018 |
| U-WGR-036 | negative | 同一 HEAD 検証 | delegation-request receipt の `candidate_head` だけを他 2 receipt と異なる値へ差し替え、`WORK_GRAPH_HEAD_DRIFT` で拒否する | U-WGR-S-010 |
| U-WGR-037 | negative | 同一 HEAD 検証 | parent acceptance receipt 入力の `review_head_sha` だけを異なる値へ差し替え、`WORK_GRAPH_HEAD_DRIFT` で拒否する | U-WGR-S-010 |
| U-WGR-038 | negative | 同一 HEAD 検証 | worker terminal receipt の `head_sha` だけを異なる値へ差し替え、`WORK_GRAPH_HEAD_DRIFT` で拒否する | U-WGR-S-010 |
| U-WGR-039 | negative | review verdict 検証 | independent review receipt の `verdict` が `reject` の状態で parent acceptance 評価を試行し、`WORK_GRAPH_REVIEW_NOT_APPROVED` で拒否する | U-WGR-S-011 |
| U-WGR-040 | negative | terminal 欠落検証 | worker terminal receipt を渡さず（null）parent acceptance 評価を試行し、`WORK_GRAPH_TERMINAL_MISSING` で拒否する | U-WGR-S-012 |
| U-WGR-041 | positive | `evaluateParentAcceptanceOrdering` | delegation・review（approve）・terminal（accepted）・evaluator（writer/reviewer と別 identity/session/context）が揃った入力で parent acceptance receipt が 1 件 seal され、`receipt_digest` が 3 receipt の `receipt_digest` を含む payload から再現できる | U-WGR-S-013 |
| U-WGR-042 | invariant | 冪等性・再構築 | 同一入力で `evaluateDelegationRequestOrdering` / `evaluateParentAcceptanceOrdering` を 2 回呼び出し、receipt digest・event 順序・lease owner が両回で一致する | U-WGR-S-020 |
| U-WGR-043 | negative | identifier 形式検証 | `lane_id` / `issue_id` に不正な identifier 形式（空文字、許可外文字）を渡した packet を `WORK_GRAPH_INPUT_INVALID` で拒否する | - |
| U-WGR-044 | mutation | `evaluateDelegationRequestOrdering` の分岐網羅 | dependency 未完了検査、exact set 検査、scope path 検査、CAS 取得検査をそれぞれ 1 分岐ずつ除去した mutant が全て Red になることを確認する（`toContain()` 文言確認だけを到達証拠にしない） | - |
| U-WGR-045 | mutation | `evaluateParentAcceptanceOrdering` の分岐網羅 | sealed 検査、同一 HEAD 検査、verdict 検査、terminal 検査、self-acceptance 検査をそれぞれ 1 分岐ずつ除去した mutant が全て Red になることを確認する | - |

oracle_id 範囲は U-WGR-001..045。

## 2. fail-close 6 系統との対応

L4 §6 の fail-close 6 系統（work graph 未確定着手拒否／delegation 前倒し拒否／未来 receipt 先書き拒否／
自己検収拒否／HEAD drift 拒否／review・terminal 未確定 acceptance 拒否）は、それぞれ次の unit oracle で
単体粒度に分解する。

| fail-close 系統 | 対応 unit oracle |
|---|---|
| work graph 未確定での着手拒否 | U-WGR-002 |
| dependency 未完了での前倒し delegation 拒否 | U-WGR-002 |
| 未来 receipt の先書き拒否（4 段共通） | U-WGR-027, U-WGR-028, U-WGR-029, U-WGR-030 |
| 自己検収拒否（identity/session/context 3 軸 + evaluator 2 方向） | U-WGR-031, U-WGR-032, U-WGR-033, U-WGR-034, U-WGR-035 |
| `repository_head` drift 拒否 | U-WGR-036, U-WGR-037, U-WGR-038 |
| review 未 approve／terminal 未確定での acceptance 拒否 | U-WGR-039, U-WGR-040 |

MIC-AC-004（unknown field による欠落相殺拒否）は U-WGR-003..016 の欠落単体 mutation と、それらとは独立した
fixture である U-WGR-015（unknown 追加 field 相殺）で二重に検証する。CAS/stale 判定は U-WGR-020..026、
ordering 判定は U-WGR-001, U-WGR-027..030, U-WGR-041 で検証する。

## 3. fixture 方針

fixture は L4 §7 の実在資産（`createWorkerLifecycleReceipt` / `admitWorkerIndependentReview` /
`resolveWorkerIsolationExecutionOrigin`）をそのまま呼び出して worker terminal receipt / independent review
receipt を組み立て、work graph 側の delegation-request receipt / parent acceptance receipt は本 PLAN の
新規実装（L6）に対して positive/negative の両方向を張る。同一 `repository_head`（40hex）を基準 fixture 間で
共有し、drift 検証用の mutation だけが 1 bit 差し替えを行う。mutation は既存 mutation 検証契約
（`docs/design/helix/L5-detail/requirement-refinement-authority.md` §4 と同型）に従い、判定分岐を 1 つずつ
除去した mutant を個別 fixture で Red にする。文言一致（`toContain()`）だけを到達証拠にしない。

## 4. eligible oracle 束縛表

PLAN-L7-525 の `verification_bindings` が参照する canonical 表。各行は実行可能な `it()` case 1 件と
1 対 1 で対応する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WGR-001 | `evaluateDelegationRequestOrdering` | READY 判定済み・exact set 完備・CAS 成功の入力で delegation-request receipt が 1 件 seal される | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-002 | `evaluateDelegationRequestOrdering` | `laneReadyReceipt` を欠落（dependency edge 未完了の graph snapshot）させた入力を `WORK_GRAPH_DEPENDENCY_NOT_READY` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-003 | `required_cell_binding` exact set 検証 | `lane_id` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-004 | `required_cell_binding` exact set 検証 | `issue_id` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-005 | `required_cell_binding` exact set 検証 | `behavior_contract_id` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-006 | `required_cell_binding` exact set 検証 | `responsibility_owner` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-007 | `required_cell_binding` exact set 検証 | `base_head` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-008 | `required_cell_binding` exact set 検証 | `candidate_head` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-009 | `required_cell_binding` exact set 検証 | `writer_lease` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-010 | `required_cell_binding` exact set 検証 | `target_reviewer` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-011 | `required_cell_binding` exact set 検証 | `effective_rule_packet_digest` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-012 | `required_cell_binding` exact set 検証 | `allowed_paths` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-013 | `required_cell_binding` exact set 検証 | `forbidden_paths` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-014 | `required_cell_binding` exact set 検証 | `lane_ready_receipt` を欠落させた packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-015 | `required_cell_binding` exact set 検証 | exact set 12 field を全て備えた上で unknown 追加 field（例: `extra_hint`）を 1 個付与した packet を `WORK_GRAPH_CELL_BINDING_INVALID` で拒否し、欠落 field を unknown field で相殺できないことを確認する（MIC-AC-004、false negative 抑止のため欠落単体 mutation U-WGR-003..014 とは別 fixture で検証） | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-016 | `required_cell_binding` exact set 検証 | 12 field 全て揃うが `base_head` を書き換えた stale HEAD 値にした packet を `WORK_GRAPH_CELL_BINDING_INVALID` または `WORK_GRAPH_HEAD_DRIFT` のいずれか定義済み code で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-017 | scope path 検証 | `allowed_paths` に含まれない changed path を伴う packet を `WORK_GRAPH_SCOPE_PATH_VIOLATION` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-018 | scope path 検証 | `forbidden_paths` に一致する changed path を伴う packet を `WORK_GRAPH_SCOPE_PATH_VIOLATION` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-019 | target reviewer 検証 | `target_reviewer` と `admitWorkerIndependentReview` の reviewer identity が不一致の場合を `WORK_GRAPH_TARGET_REVIEWER_MISMATCH` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-020 | fence token CAS 取得 | 現在 `fence_token` と要求側保持値が一致する場合、単調増加した新 `fence_token` へ更新し owner を要求側へ差し替える | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-021 | fence token CAS 取得 | 現在 `fence_token` と要求側保持値が不一致（stale read）の場合を `WORK_GRAPH_LEASE_CAS_STALE` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-022 | fence token CAS 並行取得 | 同一 `lane_id` へ 2 件の acquire を同時投入し、先着 1 件だけ通過・後着は `WORK_GRAPH_LEASE_CAS_STALE` で拒否され、owner が 1 件に収束することを確認する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-023 | fence token 解放条件 | worker terminal receipt 確定前（terminal_state 未 seal）に fence token 解放を要求した場合を `WORK_GRAPH_LEASE_EARLY_RELEASE` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-024 | fence token 解放条件 | worker terminal receipt が `accepted` / `rejected` / `quarantined` いずれかで sealed になった後の解放要求を admit する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-025 | reject/quarantine 再割当 | `rejected` で終端した dependency edge を READY へ自動復帰させず、新 delegation-request receipt が旧 `fence_token` と異なる新 `fence_token` を要求することを確認する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-026 | reject/quarantine 再割当 | 旧 `fence_token` を再利用した再割当要求を `WORK_GRAPH_LEASE_CAS_STALE` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-027 | 先書き拒否（delegation） | `laneReadyReceipt` の `graph_snapshot_digest` が未確定（null）の状態で delegation-request receipt 生成を試行し、`WORK_GRAPH_RECEIPT_FUTURE_WRITE` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-028 | 先書き拒否（terminal→review） | independent review receipt が未 seal（`isWorkerIndependentReview()` が false）の状態で `createWorkerLifecycleReceipt` を呼び出し、既存 `WORKER_LIFECYCLE_REVIEW_UNSEALED` がそのまま伝播することを確認する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-029 | 先書き拒否（acceptance→review） | `evaluateParentAcceptanceOrdering` に review 未 sealed（受け取った capability が `isWorkerIndependentReview()` で false）の入力を渡し、`WORK_GRAPH_ORDER_DIGEST_MISSING` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-030 | 先書き拒否（acceptance→terminal） | `evaluateParentAcceptanceOrdering` に terminal 未 sealed（`isWorkerLifecycleReceipt()` で false）の入力を渡し、`WORK_GRAPH_ORDER_DIGEST_MISSING` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-031 | 自己検収拒否（identity） | worker actor と reviewer actor を同一 identity にした `admitWorkerIndependentReview` 呼び出しが `HIL_ORCHESTRATION_IDENTITY_NOT_SEPARATED` を返し、work graph 側判定がこれをそのまま伝播することを確認する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-032 | 自己検収拒否（session） | worker actor と reviewer actor を同一 session にした呼び出しが `HIL_ORCHESTRATION_SESSION_NOT_SEPARATED` を返し伝播することを確認する（identity/context は別軸に保つ単一 mutation） | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-033 | 自己検収拒否（context） | worker actor と reviewer actor を同一 context_digest にした呼び出しが `HIL_ORCHESTRATION_CONTEXT_NOT_INDEPENDENT` を返し伝播することを確認する（identity/session は別軸に保つ単一 mutation） | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-034 | 自己 acceptance 拒否（evaluator=writer） | `evaluator` を worker terminal receipt の起点 origin と同一 identity/session/context_digest にした parent acceptance 評価を `WORK_GRAPH_SELF_ACCEPTANCE` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-035 | 自己 acceptance 拒否（evaluator=reviewer） | `evaluator` を independent review receipt の `reviewer_model` と同一 identity/session/context_digest にした parent acceptance 評価を `WORK_GRAPH_SELF_ACCEPTANCE` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-036 | 同一 HEAD 検証 | delegation-request receipt の `candidate_head` だけを他 2 receipt と異なる値へ差し替え、`WORK_GRAPH_HEAD_DRIFT` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-037 | 同一 HEAD 検証 | parent acceptance receipt 入力の `review_head_sha` だけを異なる値へ差し替え、`WORK_GRAPH_HEAD_DRIFT` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-038 | 同一 HEAD 検証 | worker terminal receipt の `head_sha` だけを異なる値へ差し替え、`WORK_GRAPH_HEAD_DRIFT` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-039 | review verdict 検証 | independent review receipt の `verdict` が `reject` の状態で parent acceptance 評価を試行し、`WORK_GRAPH_REVIEW_NOT_APPROVED` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-040 | terminal 欠落検証 | worker terminal receipt を渡さず（null）parent acceptance 評価を試行し、`WORK_GRAPH_TERMINAL_MISSING` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-041 | `evaluateParentAcceptanceOrdering` | delegation・review（approve）・terminal（accepted）・evaluator（writer/reviewer と別 identity/session/context）が揃った入力で parent acceptance receipt が 1 件 seal され、`receipt_digest` が 3 receipt の `receipt_digest` を含む payload から再現できる | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-042 | 冪等性・再構築 | 同一入力で `evaluateDelegationRequestOrdering` / `evaluateParentAcceptanceOrdering` を 2 回呼び出し、receipt digest・event 順序・lease owner が両回で一致する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-043 | identifier 形式検証 | `lane_id` / `issue_id` に不正な identifier 形式（空文字、許可外文字）を渡した packet を `WORK_GRAPH_INPUT_INVALID` で拒否する | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-044 | `evaluateDelegationRequestOrdering` の分岐網羅 | dependency 未完了検査、exact set 検査、scope path 検査、CAS 取得検査をそれぞれ 1 分岐ずつ除去した mutant が全て Red になることを確認する（`toContain()` 文言確認だけを到達証拠にしない） | `tests/work-graph-receipt-acceptance.test.ts` |
| U-WGR-045 | `evaluateParentAcceptanceOrdering` の分岐網羅 | sealed 検査、同一 HEAD 検査、verdict 検査、terminal 検査、self-acceptance 検査をそれぞれ 1 分岐ずつ除去した mutant が全て Red になることを確認する | `tests/work-graph-receipt-acceptance.test.ts` |
