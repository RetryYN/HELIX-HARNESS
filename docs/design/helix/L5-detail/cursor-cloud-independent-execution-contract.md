---
title: "Cursor Cloud第三者実行レーン typed契約詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-09-12
owner: SE
plan: docs/plans/PLAN-L5-105-cursor-cloud-independent-execution-contract.md
pair_artifact: docs/test-design/helix/L8-cursor-cloud-independent-execution-contract-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/cursor-cloud-independent-execution-boundary.md
github_issue_id: 1293
behavior_contract_id: CURSOR-CLOUD-INDEPENDENT-EXECUTION-001
responsibility_owner: cursor-cloud-execution
---

# Cursor Cloud第三者実行レーン typed契約

上位traceは`3L-R-05`、`3L-R-06`、`3L-R-07`、`3L-R-08`、`3L-R-12`、`3L-R-13`、
`3L-R-14`、`3L-R-23`、`3L-R-24`、`3L-R-25`であり、いずれも本pairで縮退させない。

## 1. 権限envelope

`CursorCloudAssignmentV1`はunknown fieldを拒否し、次の必須fieldを持つ。

| group | exact fields | 制約 |
|---|---|---|
| identity | `schema_version`, `repository`, `assignment_id`, `action_id`, `owner`, `issued_at`, `expires_at`, `generation` | IDは非空、時刻はUTC、expiryは有限、generationは正整数 |
| scope | `scope_kind`, `issue_number`, `plan_id`, `requirement_ids`, `test_ids`, `responsibility_owner` | `scope_kind=issue`ならissueだけ、`plan`ならplanだけ。両方／両方なしを拒否 |
| git | `branch`, `base_head`, `allowed_paths`, `forbidden_paths` | branchはHELIXが起動前発行。SHAは40 hex。pathはrelative・重複/overlapなし |
| policy | `context_digest`, `policy_digest`, `descriptor_digest`, `requested_model`, `allowed_effective_models` | digestはsha256。provider名だけでadmitしない |
| resource | `budget_snapshot_digest`, `budget_reservation_id`, `absolute_deadline`, `max_attempts`, `max_parallelism` | UNKNOWN／stale budgetは拒否。値は有限正数。通貨意味はbudget owner契約を参照 |
| boundary | `secret_profile`, `network_profile`, `completion_schema_digest` | allowlist IDとdigestだけを渡し、credential値やDB pathを渡さない |

外側envelopeは既存`WorkerContextPacketV1`を変更せず参照する。Issueを偽PLANへ、PLANを偽Issueへ変換しない。

## 2. ownershipと起動

`CursorBranchOwnershipV1`は`repository`, `branch`, `assignment_id`, `action_id`, `owner`, `generation`,
`fence_token`, `acquired_at`, `expires_at`, `renewal_count`, `state`を持つ。取得の線形化点は#860 ownerの
既存assignment primitiveとし、一覧読取やprocess-local objectをlockとしない。同一repository＋branchの勝者は1件、
異なるbranchは並行可能。renewalは同一owner/action/current generationだけ、回数・絶対expiryを延長しない。

起動直前に外部readerから`owner`, `assignment_id`, `branch`, `base_head`, `observed_at`を取得し、envelope、
ownership、budget reservationのcurrent性を同時再検証する。送信後応答消失は`launch_unknown`とし、
同actionの外部run照合が終わるまでretry、所有返却、予算解放を禁止する。

## 3. 実行・回収・review

実行中はprovider側または同等の実効境界でallowed path、forbidden path、secret、network、max cost、
absolute deadlineを強制する。prompt、build成功、事後usage観測を強制証拠にしない。

`CursorExternalRunObservationV1`は`run_id`, `assignment_id`, `action_id`, `owner`, `branch`, `base_head`,
`candidate_head`, `pr_number`, `requested_model`, `effective_model`, `usage_state`, `cost_state`, `changed_paths`,
`diff_bytes_digest`, `test_receipt_digests`, `provider_observed_at`, `reader_identity`, `observation_digest`を必須にする。
起動後と回収時の2 legを別receiptとして保持し、前段成功で後段を省略しない。candidate HEADは当該assignmentに
帰属するbaseからの進行を許し、baseとの単純同値を要求しない。usage/cost UNKNOWNは0へ変換しない。

remote bytesは隔離targetでsize、schema、path traversal、symlink、diff bytes digestを検査する。command／SQL／codeを
実行せず、main、共有tree、HELIX DBへ自動writeしない。blind reviewにはexact candidate HEADと外部証拠だけを渡す。
changes requestedはbudget、deadline、ownershipを再検証して元assignment・同branchへ返す。scope／設計変更は
既存workflowへre-entryし、reviewerはwriteしない。

## 4. failure優先順位

| order | reason code | 意味 |
|---:|---|---|
| 1 | `CURSOR_ASSIGNMENT_SCHEMA_INVALID` | unknown/missing field、Issue/PLAN択一違反、unsafe path |
| 2 | `CURSOR_ASSIGNMENT_AUTHORITY_STALE` | 要求・policy・descriptor・base HEADの失効 |
| 3 | `CURSOR_BRANCH_NOT_PREISSUED` | HELIXによる事前発行・owner束縛なし |
| 4 | `CURSOR_BRANCH_OWNERSHIP_CONFLICT` | atomic ownership敗者、stale token、無効renewal |
| 5 | `CURSOR_BUDGET_UNAVAILABLE` | UNKNOWN、stale、不足、予約競合 |
| 6 | `CURSOR_PREDISPATCH_IDENTITY_MISMATCH` | 外部owner／assignment／branch／base不一致 |
| 7 | `CURSOR_LAUNCH_OUTCOME_UNKNOWN` | 送信後の外部run帰属が未確定 |
| 8 | `CURSOR_RUNTIME_POLICY_VIOLATION` | scope／secret／network／cost／deadline違反 |
| 9 | `CURSOR_EXTERNAL_OBSERVATION_INVALID` | 2 leg欠落、reader不明、run／HEAD帰属不明 |
| 10 | `CURSOR_REMOTE_OUTPUT_INVALID` | schema、size、path、symlink、diff bytes不整合 |
| 11 | `CURSOR_REVIEW_STALE_OR_FOREIGN` | 自己review、旧HEAD、別assignment／branch |
| 12 | `CURSOR_SAFE_RELEASE_UNPROVEN` | 終端・write不能・費用照合が未証明 |

最初に成立した理由だけを返す。同一`assignment_id+action_id+generation`のreplayは同じ結果を返し、
新しい副作用を作らない。retry回数、総時間、費用、同時実行数はenvelope上限を超えない。

## 5. Phase A/Bと独立境界

Phase Aもatomic ownership、stale write拒否、前後2 leg、budget/deadlineを省略しない。Phase Bは#860の
lease/fenceへreceipt付き移行する。旧run終端・旧token write不能・A/B二重writer 0が証明できなければ停止を保つ。
#860全体、#1358親Feature、#1362 billing E2E、Notification、Benchの完了は本pairの着手依存ではない。
ただし不足する当該入力だけはfail-closeし、他branch／他レーンへ全体停止を伝播させない。

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

このbindingは再利用するscope検査の現在実在だけを証明する。上記`CURSOR_*` reasonはL6/L7 runtimeの
実装前契約であり、実装・到達可能性を偽って宣言しない。後続PLANは各reasonを実行可能oracleへ結合してから
runtime activationを求める。
