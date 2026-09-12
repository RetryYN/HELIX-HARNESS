---
title: "Cursor Cloud第三者実行レーンの独立境界"
status: confirmed
authority_status: canonical
owner_issue: 1293
layer: L4
canonical_vmodel: L1-L12
pair_layer: L9
completion_claim_allowed: true
runtime_activation_allowed: false
created: 2026-09-12
source_head: 2677f0ee8bfdd7fb4e2e4b6e59fc9c2037401567
plan: docs/plans/PLAN-L4-77-cursor-cloud-independent-execution-boundary.md
parent_design: docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md
pair_artifact: docs/test-design/helix/L9-cursor-cloud-independent-execution-boundary.md
---

# Cursor Cloud第三者実行レーンの独立境界

## 1. 責務と境界

目的は、既存#1293の1 assignmentを限定branchへ委譲し、外部で確認した成果を独立reviewへ戻すこと。
Codex／Nodeがscope・branch・assignment・budget・統合のauthorityを持ち、Cursorは限定worker、
Claudeはread-only独立reviewerのままとする。以下のport名は設計上の呼称であり、新しいexport／schema／gateではない。

```text
承認済みscope + IR main read-after
  → context/admission → branch事前発行 + 排他所有 + 有限資源の確保
  → 起動直前の外部owner/assignment/base HEAD照合 → launch
  → 実行中のscope・金額上限・deadline強制 → stop/終端の外部照合
  → remote output隔離回収・再検証 → blind exact-HEAD独立review
  → 同assignment・同branchへ修正返却、または親の検収/統合経路へ返す
```

各段階の証拠は同一assignmentへ結合する。起動前検査と起動後・回収時検査を別legにし、片方の成功で相殺しない。
provider runの終端、reviewのaccepted、branch所有の安全返却は別事象である。

## 2. 既存契約と不足portの対応

表内pathはrepository-relative。再利用は既存の意味・検証を保つもので、現状のままcloud対応済みという意味ではない。

機械照合する要求IDは省略せず、`3L-R-04`、`3L-R-05`、`3L-R-06`、`3L-R-07`、`3L-R-08`、`3L-R-12`、`3L-R-13`、`3L-R-14`、`3L-R-23`、`3L-R-24`、`3L-R-25` の11件を本境界へexact traceする。

| port／上位契約 | 再利用するexact path・型/関数・既存テスト | 残る不足とL9 oracle |
|---|---|---|
| context／3L-R-12 | `src/runtime/worker-context-packet.ts` の `WorkerContextPacketV1`、`attestWorkerContextAuthority`、`compileWorkerContextPacket`、`verifyWorkerContextEnvelope`。`tests/worker-context-packet.test.ts` | packetのexact fieldを勝手に増やさず、branch／action-bound assignment／金額／deadlineを結合する外側envelopeの契約は未実装。authority allowlistはthree-lane IRを現状では束縛しない。IT-CPA-001/002 |
| admission／3L-R-04/13 | `src/runtime/worker-descriptor-admission.ts` の `WorkerDescriptorV1`、`evaluateWorkerDescriptorAdmission`、`isWorkerAdmissionCurrent`。`tests/worker-descriptor-admission.test.ts` | Cursorの登録・現在の利用資格・requested/effective modelの外部provenanceは未確認。文字列provider名だけでadmitしない。IT-CPA-002/007 |
| assignment入力／3L-R-05/12/24 | `src/runtime/project-hook-assignment-provider.ts` の `ProjectHookAssignmentSnapshot`、`createAssignmentProjectHookAuthorityProvider`。`tests/project-hook-assignment-provider.test.ts` | snapshot readerからの変換だけで発行器ではない。branchの事前発行と外部owner再取得は不足。hookのroot情報をremote workerへ丸ごと送らない。IT-CPA-003 |
| atomic ownership／3L-R-23 | `src/runtime/work-graph-receipt-acceptance.ts` の `RequiredCellBindingV1`、`WorkGraphLeaseV1`、`acquireWorkGraphLease`、`releaseWorkGraphLease`、`evaluateDelegationRequestOrdering`。`tests/work-graph-receipt-acceptance.test.ts` | pureな値比較・生成はatomic lockではない。共有branch単位の線形化点、全writerを拘束する実効機構、再起動後の所有再照合、旧workerのwrite不能証拠が不足。#860がPhase A最小primitiveを所有し、#1293がCursor実consumer接続とE2Eを所有する。IT-CPA-004/005/010 |
| launch／3L-R-13/24 | `src/runtime/adapter.ts` の `admitWrapperLaunch`、`buildContextBoundWrapperAdapterPlan`。`.cursor/environment.json`、`.cursor/Dockerfile`、`.cursor/install.sh`。`tests/worker-wrapper-admission.test.ts`、`tests/cursor-cloud-environment.test.ts` | `AdapterProvider` はclaude/codex限定。Cursor remote launch、応答消失時のrun照合・重複起動防止は未実装。環境Build成功はcloud policy強制の証拠ではない。IT-CPA-006/007 |
| budget + deadline／3L-R-07/08/13 | `WorkerContextBoundary.budget`（`src/runtime/worker-context-packet.ts`）、`QuotaSnapshotV1` と `evaluateDispatchAdmission`（`src/runtime/slot-scheduler-quota-handover.ts`）。`tests/slot-scheduler-quota-handover.test.ts` | time/token/quotaを金額capへ読み替えない。pool・cycle・committed・reserve・鮮度の外部証拠、実効max costと絶対deadlineの強制機構は不足。通貨・金額単位のexact equalityは現行3L-R-07の明文ではなく、L3 amendment候補として別に正本化するまでruntime reject authorityへ使わない。IT-CPA-008/009 |
| stop／3L-R-13/23/25 | `ProjectHookAssignmentSnapshot.lifecycle_policy`、`releaseWorkGraphLease`、`src/runtime/worker-lifecycle-receipt.ts` の `WorkerLifecycleReceiptCapability` | ローカルtimeoutやstop応答をremote停止／write不能と見なさない。取消要求、終端確認、権限の失効、遅延write拒否の実証、取消/期限切れの安全返却経路は不足。IT-CPA-009/010/014 |
| remote output collection／3L-R-14 | `src/runtime/worker-output-admission.ts` の `admitWorkerOutput`、`WorkerValidatedOutputCapability`。`src/runtime/worker-isolation-broker.ts` の `WorkerIsolationRunReceiptCapability`、`resolveWorkerIsolationRunReceipt`。`tests/worker-output-admission.test.ts`、`tests/worker-isolation-broker.test.ts` | 既知output schemaはproposal/blind評価のみ。remote receipt用schema・真正性検証・外部read-after adapterは不足。local brokerのWeakMap sealをremote JSONへ付与しない。既存diff_digestはpath一覧でありdiff bytesのdigestではない。IT-CPA-011/012 |
| independent review返却／3L-R-06 | `src/runtime/worker-review-receipt.ts` の `WorkerIndependentReviewCapability`、`admitWorkerIndependentReview`。`src/runtime/worker-lifecycle-receipt.ts` の `createWorkerLifecycleReceipt`。`tests/worker-review-receipt.test.ts`、`tests/worker-isolation-broker.test.ts` | 現行review admissionもlocal broker由来originを要求する。remote originからの正規検証接続は不足し、castで迂回しない。実行receiptと独立review後terminal receiptを分ける。IT-CPA-013 |

再利用元PLANは `docs/plans/PLAN-L7-503-worker-context-authority.md`、
`docs/plans/PLAN-L7-669-project-hook-assignment-provider.md`、
`docs/plans/PLAN-L7-525-work-graph-receipt-acceptance.md`、
`docs/plans/PLAN-L7-527-slot-scheduler-quota-handover.md`、
`docs/plans/PLAN-L7-506-worker-lifecycle-receipt.md`、
`docs/plans/PLAN-RECOVERY-76-cursor-cloud-environment-admission.md`。
既存PLAN／型／テストの存在は、上表の不足portの成立証拠ではない。

## 3. 入出力の最小束縛（L5でexact schemaを決める）

- assignment envelopeはIssueまたはPLANの択一scope、責務、発行者、事前発行branch、base HEAD、
  assignment/action identity、context/policy digest、allowed/forbidden path、requirement/test参照、
  admitted descriptor/model条件、secret/network境界、有限の金額予算とdeadline、completion schemaを結合する。
  既存 `RequiredCellBindingV1` はIssue入力を持つため、PLAN択一を偽Issueへ変換しない。
- ownershipは同一repository＋branchを全processで排他的に確保する。二重予約を起動前に拒否し、
  有限資源の確保にも同じ競合規律を適用する。独立branch間の正当な並列性は維持する。
  `WorkGraphLeaseV1.fence_token` はnumber、hook snapshotのfenceはstringであり、暗黙castをしない。
- Phase A ownershipは取得時刻、有限expiry、owner/action identity、更新世代を持つ。healthy runは
  expiry前に同じowner/actionだけがbounded renewalでき、renewal失敗後は新規writeを許可しない。
  expiry、process消滅、古いheartbeatのいずれか一つだけで別writerがstealしてはならない。
  旧token／旧世代からのwriteは、返却後・renewal後・control再起動後のすべてで拒否する。
- launch直前に外部owner／assignment／base HEADを再取得し、同じ排他所有・資源確保がcurrentか再検証する。
  timeoutで起動結果が不明なら、同actionのrunを照合するまで再起動しない。
- 実行中のmax cost／deadline／scope強制はprovider側または同等の実効境界を要する。
  usage監視だけではhard capにならず、ローカル待機timeoutだけではremote TTLにならない。
  clock起点、skew許容、billing遅延、停止graceと課金尾部を含む上限保証はL5で明示し、未知なら起動を許さない。
- 回収入力はuntrusted。外部readerでrun identity、owner、branch、candidate HEADの帰属、PR、
  requested/effective model、usage/cost、変更path・diff bytes・test結果を取得し、取得時点とdigestを結合する。
  candidate HEADはbaseからの当該assignmentの進行を許し、単純同値で検査しない。
  戻り値の署名／digestだけでproducerの真正性を推測せず、worker自己申告だけでは成立しない。
- output bytesは隔離して検査し、scope逸脱、path traversal、symlink経由の脱出、過大／不正schemaを拒否する。
  戻り値のcommand／SQLを実行せず、remote結果を理由にmain／共有tree／DBへ自動writeしない。
  blind review packetにはexact candidate HEADと許可された証拠を渡し、worker会話・自己評価を渡さない。

## 4. 失敗と回復（観測状態の呼称であり新しいruntime enumではない）

| 失敗地点 | 即時の扱い | 回復の証拠／再開条件 |
|---|---|---|
| context/admission、branch未発行、起動前照合、資源不足 | launch 0。失敗理由を返す | 未起動が確認できた予約だけ安全に解消し、freshな入力で全前段を再評価 |
| 排他競合 | 敗者launch 0、勝者の所有を変更しない | 正当な終端と安全返却を外部確認するまで奪取しない |
| launch送信後の応答消失／control process再起動 | 起動結果不明として所有・費用予約を保持。盲目的retry禁止 | 同assignment/actionの外部runを照合。有限の照合期限後も不明なら隔離し再配車不可 |
| budget/deadline到達、scope違反、owner交代 | 新規write/dispatchを止める境界へ移し、stopと外部終端照合を要求 | stop ACKだけでは返却しない。残存run・権限・遅延writeが不能な証拠を得るまでbranchと予約を再利用しない |
| 回収通信失敗／不正output／candidate HEAD drift | 検収可能receipt 0。部分結果は隔離し、実行をやり直さない | 同runへのboundedな再回収・再照合のみ。費用のUNKNOWNを0にせず、期限超過は停止/隔離へ |
| reviewでchanges requested | 元assignment・同branchへ限定修正を返す。reviewerはwriteしない | 新HEADで旧reviewをstale化。予算/TTL/所有を再検証し、期限を暗黙延長しない。scope/設計変更は既存re-entryへ |
| 完了／取消／期限切れ後の返却 | provider終端だけでacceptedにしない | writer不能と費用照合、安全な予約解消を確認。acceptedには別途独立reviewが必要 |

#860はPhase Aの原子的ownership取得・renewal・返却・stale token拒否primitiveと、Phase Bの汎用lease/fenceを所有する。
#1293はそれをCursor Cloud adapterへ接続し、最初の実案件証拠と外部read-after E2Eを所有する。
Phase Aの旧runが未終端・write可能なら移行も再配車も拒否するが、
#860全体の完了をPhase A設計の前提にしない。

## 6. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": ["WORKER_ISOLATION_SCOPE_VIOLATION"],
  "assets": [
    {
      "asset_id": "worker-isolation-policy",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-isolation-policy.ts",
      "resource_kind": "typescript_export",
      "resource_name": "auditWorkerIsolationScope",
      "source_digest": "sha256:805e02513c6068ce1b00420fba88d80fd1e8f860e9078f7592153cf3ba6c55b2",
      "current_authority": true
    },
    {
      "asset_id": "worker-context-authority",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-context-packet.ts",
      "resource_kind": "typescript_export",
      "resource_name": "attestWorkerContextAuthority",
      "source_digest": "sha256:e0019264841da35c7018cd41931073234f6ddd1926d6f923ba675c1b445e035f",
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
      "asset_id": "worker-output-admission",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-output-admission.ts",
      "resource_kind": "typescript_export",
      "resource_name": "admitWorkerOutput",
      "source_digest": "sha256:dfdbf9bdb2ab14dd8302ad2b9c8f6c717b5527727ca59b6b5cdb87e9983e0bf5",
      "current_authority": true
    },
    {
      "asset_id": "cursor-run-authority",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/cursor-cloud-run-authority.ts",
      "resource_kind": "typescript_export",
      "resource_name": "decideCursorFollowUpDispatch",
      "source_digest": "sha256:9084dc352318b39d25cb609c5256a82d61b4ac60e0dcd47a9adb3ef06b0b3923",
      "current_authority": true
    }
  ],
  "failure_reachability": [
    {
      "reason_code": "WORKER_ISOLATION_SCOPE_VIOLATION",
      "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/worker-isolation-policy.ts",
      "source_symbol": "auditWorkerIsolationScope",
      "test_path": "tests/worker-isolation-policy.test.ts",
      "oracle_id": "U-WIP-006",
      "identity_fields": [],
      "post_resolution_checks": [],
      "fixture": { "changed_path": "outside/allowed.ts" },
      "expected_reason": "WORKER_ISOLATION_SCOPE_VIOLATION",
      "mutation": {
        "remove_post_resolution_check": "if (changedPaths.some((path) => !pathIsWritable(path, writablePaths))) {",
        "expected_reason_after_mutation": "RED_BY_ORACLE",
        "execution_test_path": "tests/design-reality-binding.test.ts",
        "execution_oracle_id": "U-DRB-015",
        "execution_helper": "executeIsolationPolicyMutationOracle"
      }
    }
  ]
}
```

既存runtime資産の実在だけを束縛する。Cursor transport、remote receipt、実効budget/deadline、
外部write不能の実装済みclaimではない。failure reachabilityはL5/L8でexact化する。

## 5. 未知境界と次層への引渡し

L5/L8へ渡す不足は、原子的ownershipの実consumer、cloud scope/secret/network強制、通貨cap/deadline、
remote launchの冪等照合、stop後のwrite不能、remote receiptの真正性、review originへの接続である。
外部API仕様・credential・課金権限は本調査で確認も変更もしていない。未確認の能力は利用可能と仮定せず、
不足が埋まるまで実dispatchを拒否する。既存#1293と既存承認経路へ返し、別Issueや承認engineで迂回しない。
