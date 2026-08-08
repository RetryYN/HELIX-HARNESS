---
layer: L6
sub_doc: function-spec
status: draft
pair_artifact: docs/test-design/helix/L8-work-graph-receipt-acceptance-unit-test-design.md
plan: docs/plans/PLAN-L6-102-work-graph-receipt-acceptance.md
related_l5: docs/design/helix/L5-detail/work-graph-receipt-acceptance.md
behavior_contract_id: WORK-GRAPH-RECEIPT-ACCEPTANCE-001
responsibility_owner: work-graph-receipt-acceptance
---

> **L6 contract marker**: `evaluateDelegationRequestOrdering(request) => DelegationRequestResult` と
> `evaluateParentAcceptanceOrdering(request) => ParentAcceptanceResult` は work graph 検収の
> unit-test 粒度契約。pre: work graph が READY を確定し fence token を CAS 取得できる。
> post: exact set と順序と同一 HEAD を満たす入力だけを seal し、それ以外は `WORK_GRAPH_*` で fail-close する。

# work graph と三段 receipt 検収 機能設計

## 1. 目的

L5 が固定した typed schema・判定契約・failure code を pure function として実装し、work graph なし着手・
dependency 前倒し・receipt 先書き・同一 identity 自己検収・HEAD drift・review／親 acceptance 欠落の
6 系統を実行可能な oracle で fail-close する。既存の worker terminal receipt と independent review receipt は
入力契約として呼び出すだけで、work graph 側に重複判定を作らない。

## 2. 契約

| 契約 | 事前条件 | 事後条件 | 不変条件 |
|---|---|---|---|
| READY 束縛 | lane ready receipt が dependency edge の完了集合を持つ | READY 判定済み入力だけ delegation receipt を seal | 未完了 dependency は `WORK_GRAPH_DEPENDENCY_NOT_READY` |
| exact cell binding | required cell binding 12 field を受け取る | 過不足・unknown 追加 field を持つ packet を admit しない | unknown field で欠落を相殺できない |
| scope path | allowed／forbidden path と changed path を受け取る | scope 外 path を含む packet を拒否 | forbidden 優先で判定する |
| CAS lease | 現在 fence token を読み取れる | 値一致時だけ単調増加した token へ更新し owner を差し替える | 時刻ベースの先着判定へ退避しない |
| lease 解放 | worker terminal receipt の seal 状態を判定できる | terminal seal 後だけ解放を admit | 進行中の early release を拒否 |
| 再割当 | reject／quarantine で終端した lane | 新 fence token を持つ新 delegation receipt でのみ再割当 | 旧 token 再利用を stale として拒否 |
| ordering | 前段 receipt の seal 状態を判定できる | delegation → review → terminal → acceptance の順序でのみ seal | 未 seal 入力で後段 digest を計算しない |
| 同一 HEAD | candidate head／review head／terminal head を受け取る | 3 値完全一致時だけ acceptance を seal | 1 bit の drift も許容しない |
| 自己 acceptance 拒否 | evaluator と writer／reviewer の identity・session・context digest を受け取る | 3 軸すべて分離した evaluator だけ acceptance を seal | いずれか 1 軸の一致で拒否 |
| 冪等 | 同一入力を 2 回渡す | receipt digest・lease owner が両回一致 | 乱数・時刻を digest 材料にしない |

## 3. Vペア

- 右腕正本: `docs/test-design/helix/L8-work-graph-receipt-acceptance-unit-test-design.md`
- oracle: `U-WGR-001..045`
- test: `tests/work-graph-receipt-acceptance.test.ts`
- system 対: `docs/test-design/helix/L9-work-graph-receipt-acceptance-system-test-design.md`（`U-WGR-S-001..020`）

## 4. 関数分割

| 関数 | 責務 | 主な failure code |
|---|---|---|
| `acquireWorkGraphLease` | fence token の CAS 取得。値一致時だけ単調増加へ更新する | `WORK_GRAPH_LEASE_CAS_STALE` |
| `releaseWorkGraphLease` | terminal seal 後だけ解放を admit する | `WORK_GRAPH_LEASE_EARLY_RELEASE` |
| `evaluateDelegationRequestOrdering` | READY 束縛・exact set・scope path・lease 束縛を検証し delegation receipt を seal する | `WORK_GRAPH_DEPENDENCY_NOT_READY` / `WORK_GRAPH_CELL_BINDING_INVALID` / `WORK_GRAPH_SCOPE_PATH_VIOLATION` / `WORK_GRAPH_RECEIPT_FUTURE_WRITE` / `WORK_GRAPH_INPUT_INVALID` |
| `evaluateParentAcceptanceOrdering` | 3 receipt の seal・前段束縛・同一 HEAD・verdict・evaluator 分離を検証し acceptance receipt を seal する | `WORK_GRAPH_ORDER_DIGEST_MISSING` / `WORK_GRAPH_HEAD_DRIFT` / `WORK_GRAPH_REVIEW_NOT_APPROVED` / `WORK_GRAPH_TERMINAL_MISSING` / `WORK_GRAPH_SELF_ACCEPTANCE` / `WORK_GRAPH_TARGET_REVIEWER_MISMATCH` |
| `isDelegationRequestReceipt` / `isParentAcceptanceReceipt` | 同一 process 内の seal 判定（WeakSet） | - |
| `verifyDelegationRequestReceipt` / `verifyWorkerIndependentReviewCapability` | transport 越えを含む digest 再計算検証（§6.1） | `WORK_GRAPH_ORDER_DIGEST_MISSING` |

## 5. 判定順序

`evaluateDelegationRequestOrdering` は次の順で単調に検査し、最初に失敗した時点で digest 計算へ進まない。

1. identifier 形式（`lane_id` / `issue_id` ほか）を検証する。
2. lane ready receipt の graph snapshot digest が確定していることを検証する。
3. dependency edge の完了集合が READY であることを検証する。
4. required cell binding の exact set を検証する（内側の lease と lane ready receipt も exact）。
5. changed path が allowed／forbidden path の scope 内であることを検証する。
6. lease の CAS 取得結果が要求 lane と一致することを検証する。

`evaluateParentAcceptanceOrdering` は次の順で検査する。

1. delegation・review・terminal の seal 判定（§6.1 の digest 再計算。terminal 欠落は `WORK_GRAPH_TERMINAL_MISSING`）。
2. target reviewer と review 側 reviewer identity の一致。
3. candidate head・review head・terminal head の完全一致。
4. terminal receipt の `verifier_receipt_digest` が review receipt の `receipt_digest` と一致すること
   （前段束縛。不一致は `WORK_GRAPH_ORDER_DIGEST_MISSING`）。
5. review verdict が approve であること。terminal state が accepted であることは、既存
   `verifyWorkerLifecycleReceipt` が approve と非 accepted の同居を拒否するため、本 module で
   重複判定を置かない（到達不能な分岐を作らない）。
6. evaluator が writer とも reviewer とも identity・session・context digest すべてで不一致。

## 6. failure 到達表

L5 §5 の 13 code はすべて本 module の分岐から到達する。到達証拠は `tests/work-graph-receipt-acceptance.test.ts`
の U-WGR oracle であり、文言一致ではなく failure code の同一性で判定する。U-WGR-044／045 は分岐除去 mutant が
Red になることを確認し、分岐網羅を prose 主張ではなく実行で裏付ける。分岐除去 mutant 19 体を実際に
生成して全件 killed（生存 0）であることを確認済みであり、到達不能と判明した分岐は防御的に残さず削除して
到達可能な前段束縛検査へ置き換えた。

## 6.1 seal 検証の trust boundary

foreign receipt の seal 判定は 3 種すべてで digest 再計算を canonical とし、同一 process 内では
WeakSet を先に照合する（`verifyDelegationRequestReceipt` は WeakSet を通れば即 true、通らない場合は
digest 再計算へ降りる）。worker terminal は `verifyWorkerLifecycleReceipt`、independent review は
`verifyWorkerIndependentReviewCapability`、delegation は `verifyDelegationRequestReceipt` が
それぞれ payload から `receipt_digest` を再計算して一致を要求する。DB projection や scheduler
（#214）が receipt を永続化して読み戻す構成でも、WeakSet の非成立で機能停止しない。

digest 再計算は unkeyed SHA-256 であり、payload を知る呼び出し元は形式的に整合する receipt を
自作できる。したがって本 module が保証するのは「receipt が自己整合であり、順序・HEAD・identity
分離の制約を満たすこと」までであり、**receipt の provenance（`admitWorkerIndependentReview` /
`createWorkerLifecycleReceipt` を実際に通過したこと）は呼び出し元が保証する**。work graph の
呼び出し元は、receipt を生成した同一 transaction 内の capability か、harness DB projection から
読み戻した行だけを入力に渡さなければならない。任意入力を受ける外部 surface（CLI 引数・network
payload）へ本 module を直結してはならない。この境界は #214 の scheduler 配線時に
transactional boundary 側で機械強制する。

## 7. 実装境界

- 新規 DB table・workflow・network 呼び出しを作らない（pure function のみ）。
- 既存 `verifyWorkerLifecycleReceipt` と review receipt digest 再計算を入力契約としてそのまま使い、
  `createWorkerLifecycleReceipt` / `admitWorkerIndependentReview` が返す receipt を改変しない。
- digest は既存 receipt と同じ `sha256Digest(canonicalJson(payload))` を使い、乱数・現在時刻を材料にしない。
