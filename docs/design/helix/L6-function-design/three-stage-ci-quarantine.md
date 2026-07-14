---
title: "HELIX L6 機能設計 — three-stage CI quarantine"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-06
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_l5: docs/design/helix/L5-detail/three-stage-ci-quarantine.md
related_hst:
  - HST-HIL-003
  - HST-HIL-022
pair_artifact: docs/test-design/helix/L6-three-stage-ci-quarantine-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-06
  - HAC-HIL-06a
  - HAC-HIL-06b
  - HAC-HIL-06c
source_capabilities:
  - HU-CAP-006
---

# HELIX L6 機能設計 — three-stage CI quarantine

## §0 関数境界

pure functionはGit、GitHub、clock、DB、filesystemを直接読まず、SHA/tree/check profile/delivery/clock receiptを明示入力として判定する。
adapterはprovider observationを返すだけで、chain、stage、quarantine、merge eligibilityのwriteはNode portに限定する。
旧UT `github-ci-policy`は`HU-CAP-006`とpinned digestからfixture化し、旧moduleをproduct runtimeへimportしない。

## §1 public APIとexact oracle

| API | signature | DbC／result | L7 oracle | HAC | exact HST dispositionの対応 |
|---|---|---|---|---|---|
| `parseCiSourceCapabilityBinding` | `(raw, pinnedEvidence) => Result<CiSourceBinding, CiFailure>` | `HU-CAP-006`、root/base/source commit/tree、11-entry set/unique delta、全blob/span/dispositionをstrict照合しmain既存PLANを分離 | `U-CIQ-001` | `HAC-HIL-06a` | `HST-CASE-003-01` → `なし（正常系）` |
| `buildCiRequiredCheckProfile` | `(sourceBinding, profile, phase) => Result<CiCheckProfile, CiFailure>` | universal PR、source/pack別check、command/input scopeをversioned固定 | `U-CIQ-002` | `HAC-HIL-06a`, `HAC-HIL-06b` | `HST-CASE-003-08` → `HIL_CI_REQUIRED_CHECK_MISSING` |
| `createThreeStageCiChain` | `(issue, reverseTask, prejoinSource, profile) => CiChainPlan` | causality、Reverse候補SHA/tree/check-setから一意chainを生成 | `U-CIQ-003` | `HAC-HIL-06a` | `HST-CASE-003-01` → `なし（正常系）` |
| `planReversePrejoinStage` | `(chain, source, profile) => StageRunPlan` | ordinal 1、Forward join前、全required checkを要求 | `U-CIQ-004` | `HAC-HIL-06a`, `HAC-HIL-06b` | `HST-CASE-003-02` → `HIL_CI_PREJOIN_FAILED` |
| `validateForwardJoinReceipt` | `(prejoin, joinReceipt) => Result<ForwardJoinBinding, CiFailure>` | prejoin accepted、candidate parent SHA/tree、result SHA/treeを要求 | `U-CIQ-005` | `HAC-HIL-06b` | `HST-CASE-003-05` → `HIL_CI_STAGE_BYPASS` |
| `planForwardPostjoinStage` | `(chain, prejoin, joinBinding, profile) => StageRunPlan` | ordinal 2、合流SHA/tree、prejoin predecessorを固定 | `U-CIQ-006` | `HAC-HIL-06a`, `HAC-HIL-06b` | `HST-CASE-003-03` → `HIL_CI_POSTJOIN_FAILED` |
| `parseGithubExternalDelivery` | `(payload, repository, pr, postjoin) => Result<GithubDelivery, CiFailure>` | delivery/check suite/run、PR head SHA/tree、workflowをstrict検証 | `U-CIQ-007` | `HAC-HIL-06b` | `HST-CASE-003-09` → `HIL_CI_SHA_STALE` |
| `planGithubExternalStage` | `(chain, postjoin, delivery, profile) => StageRunPlan` | ordinal 3、postjoin SHA/treeとPR head一致、universal triggerを要求 | `U-CIQ-008` | `HAC-HIL-06a`, `HAC-HIL-06b` | `HST-CASE-003-04` → `HIL_CI_EXTERNAL_FAILED` |
| `validateCiStageOrder` | `(chain, candidateStage, predecessor) => StageOrderDecision` | ordinal単調、直前receipt、terminal/stale非再開 | `U-CIQ-009` | `HAC-HIL-06b` | `HST-CASE-003-11` → `HIL_CI_STAGE_BYPASS`; `HST-CASE-003-12` → `HIL_CI_STAGE_LINEAGE_INVALID` |
| `validateCiStageLineage` | `(chain, stage, source, predecessor) => CiLineageDecision` | chain/SHA/tree/check-set/input-scope/predecessorを全件照合 | `U-CIQ-010` | `HAC-HIL-06b` | `HST-CASE-003-06` → `HIL_CI_LINEAGE_MISMATCH`; `HST-CASE-003-07` → `HIL_CI_TREE_DIGEST_MISMATCH`; `HST-CASE-003-13` → `HIL_CI_RECEIPT_LINEAGE_INVALID` |
| `aggregateCiCheckResults` | `(stage, profile, checkRuns) => CiStageAggregation` | required check全件、exact command/scope、green conclusionだけを集計 | `U-CIQ-011` | `HAC-HIL-06a`, `HAC-HIL-06b` | `HST-CASE-003-08` → `HIL_CI_REQUIRED_CHECK_MISSING`; `HST-CASE-003-10` → `HIL_CI_CONCLUSION_NOT_GREEN` |
| `invalidateCiChainForHeadChange` | `(chain, priorHead, currentHead, delivery) => CiInvalidationPlan` | SHA/tree変更時に旧stage/eligibilityをstale化 | `U-CIQ-012` | `HAC-HIL-06b` | `HST-CASE-003-09` → `HIL_CI_SHA_STALE` |
| `deriveCiFailureFingerprint` | `(check, normalizedDiagnostic, toolchain, profile) => FailureFingerprint` | volatile path/time/run IDを除外し意味差は保持 | `U-CIQ-013` | `HAC-HIL-06c` | `HST-CASE-022-02` → `HIL_QUARANTINE_FINGERPRINT_MISMATCH` |
| `parseCiQuarantineRule` | `(raw, trustedNow, sourceProfile, packProfile, checkProfile) => Result<CiQuarantineRule, CiFailure>` | typed scope kind/ID、reason/evidence、source/pack/check profile、approvalを必須化し空・重複・unknownを拒否 | `U-CIQ-014` | `HAC-HIL-06c` | `HST-CASE-022-05` → `HIL_QUARANTINE_WILDCARD_FORBIDDEN`; `HST-CASE-022-06` → `HIL_QUARANTINE_REMEDIATION_MISSING`; `HST-CASE-022-10` → `HIL_QUARANTINE_OVERBROAD` |
| `evaluateCiQuarantineApplication` | `(stage, failures, ruleSet, workload) => CiQuarantineDecision` | 全workload完走後、全failure exact一致だけをcanonical `quarantined`へ遷移 | `U-CIQ-015` | `HAC-HIL-06c` | `HST-CASE-022-01` → `なし（正常系）`; `HST-CASE-022-02` → `HIL_QUARANTINE_FINGERPRINT_MISMATCH`; `HST-CASE-022-08` → `HIL_CI_QUARANTINE_INVALID`; `HST-CASE-022-09` → `HIL_QUARANTINE_SCOPE_INVALID` |
| `validateCiMinimumGate` | `(application, gateRun, originalWorkload) => MinimumGateDecision` | 追加gate green、元check非省略、minimum gate自身の隔離禁止 | `U-CIQ-016` | `HAC-HIL-06b`, `HAC-HIL-06c` | `HST-CASE-022-04` → `HIL_QUARANTINE_MINIMUM_GATE_MISSING` |
| `evaluateCiQuarantineExpiry` | `(rule, trustedClockReceipt, currentProfile) => QuarantineFreshness` | trusted clock、baseline/tree/profile/scope driftで失効 | `U-CIQ-017` | `HAC-HIL-06c` | `HST-CASE-022-03` → `HIL_QUARANTINE_EXPIRED` |
| `planCiSelfHealRoute` | `(failurePacket, policy, history) => CiSelfHealPlan` | confidence、failure kind、上限からretry/repush/quarantine/Issueを選択 | `U-CIQ-018` | `HAC-HIL-06b`, `HAC-HIL-06c` | `HST-CASE-022-07` → `HIL_QUARANTINE_EXHAUSTED` |
| `recordCiRecoveryAttemptResult` | `(prior, candidate, workload, evidence, newChain) => Result<CiRecoveryAttemptResult, CiFailure[]>` | retryはsame-tree全workload、repushはprior/rerequest/log/root-cause/diff/green/push/PR headと新chain三段完走を要求 | `U-CIQ-019` | `HAC-HIL-06b` | `HST-CASE-003-08` → `HIL_CI_REQUIRED_CHECK_MISSING` |
| `finalizeCiMergeEligibility` | `(chain, external, quarantines, branchPolicy) => CiMergeEligibility` | current PR head、三段完了、quarantine非green、required policyを照合 | `U-CIQ-020` | `HAC-HIL-06a`, `HAC-HIL-06b`, `HAC-HIL-06c` | `HST-CASE-003-13` → `HIL_CI_RECEIPT_LINEAGE_INVALID`; `HST-CASE-022-01` → `なし（正常系）` |
| `buildCiMutationCommitBundle` | `(mutation, current, operation) => Result<CiMutationCommitBundleV1, CiFailure>` | stage/quarantine/self-heal write setとexpected headsを正規化 | `U-CIQ-021` | `HAC-HIL-06a`, `HAC-HIL-06b`, `HAC-HIL-06c` | supporting |
| `commitCiMutationBundle` | `(bundle, store) => Promise<Result<CiMutationCommitReceiptV1, CiFailure>>` | check/receipt/event/projection/lineage/outcomeを単一Node transactionでCAS commit | `U-CIQ-022` | `HAC-HIL-06a`, `HAC-HIL-06b`, `HAC-HIL-06c` | supporting |
| `reconcileCiMutationCommit` | `(operationId, evidence, store) => Promise<Result<CiMutationCommitReceiptV1, CiFailure>>` | immutable evidenceからのみprojection/receiptを復元 | `U-CIQ-023` | `HAC-HIL-06b` | supporting |

### §1.1 canonical 23件のAPI／単体oracle結線

次表は各canonical caseを一つの主API／L7 oracleへbindするatomic正本である。補助APIに同じcaseを参照しても、
state/failureの合否と23/23分母はこの表だけから採点する。

| exact HST | 主API | L7 oracle | pre_state | expected_state | canonical failure |
|---|---|---|---|---|---|
| `HST-CASE-003-01` | `createThreeStageCiChain` | `U-CIQ-003` | `implemented` | `prejoin_accepted` | `なし（正常系）` |
| `HST-CASE-003-02` | `planReversePrejoinStage` | `U-CIQ-004` | `implemented` | `failed` | `HIL_CI_PREJOIN_FAILED` |
| `HST-CASE-003-03` | `planForwardPostjoinStage` | `U-CIQ-006` | `postjoin_running` | `failed` | `HIL_CI_POSTJOIN_FAILED` |
| `HST-CASE-003-04` | `planGithubExternalStage` | `U-CIQ-008` | `external_running` | `failed` | `HIL_CI_EXTERNAL_FAILED` |
| `HST-CASE-003-05` | `validateForwardJoinReceipt` | `U-CIQ-005` | `created` | `created` | `HIL_CI_STAGE_BYPASS` |
| `HST-CASE-003-06` | `validateCiStageLineage` | `U-CIQ-010` | `prejoin_accepted` | `prejoin_accepted` | `HIL_CI_LINEAGE_MISMATCH` |
| `HST-CASE-003-07` | `validateCiStageLineage` | `U-CIQ-010` | `prejoin_accepted` | `prejoin_accepted` | `HIL_CI_TREE_DIGEST_MISMATCH` |
| `HST-CASE-003-08` | `aggregateCiCheckResults` | `U-CIQ-011` | `external_running` | `failed` | `HIL_CI_REQUIRED_CHECK_MISSING` |
| `HST-CASE-003-09` | `invalidateCiChainForHeadChange` | `U-CIQ-012` | `external_accepted` | `stale` | `HIL_CI_SHA_STALE` |
| `HST-CASE-003-10` | `aggregateCiCheckResults` | `U-CIQ-011` | `external_running` | `failed` | `HIL_CI_CONCLUSION_NOT_GREEN` |
| `HST-CASE-003-11` | `validateCiStageOrder` | `U-CIQ-009` | `assertion_input_ready` | `assertion_pass` | `HIL_CI_STAGE_BYPASS` |
| `HST-CASE-003-12` | `validateCiStageOrder` | `U-CIQ-009` | `assertion_input_ready` | `assertion_pass` | `HIL_CI_STAGE_LINEAGE_INVALID` |
| `HST-CASE-003-13` | `validateCiStageLineage` | `U-CIQ-010` | `assertion_input_ready` | `assertion_pass` | `HIL_CI_RECEIPT_LINEAGE_INVALID` |
| `HST-CASE-022-01` | `evaluateCiQuarantineApplication` | `U-CIQ-015` | `failed` | `quarantined` | `なし（正常系）` |
| `HST-CASE-022-02` | `evaluateCiQuarantineApplication` | `U-CIQ-015` | `failed` | `failed` | `HIL_QUARANTINE_FINGERPRINT_MISMATCH` |
| `HST-CASE-022-03` | `evaluateCiQuarantineExpiry` | `U-CIQ-017` | `failed` | `failed` | `HIL_QUARANTINE_EXPIRED` |
| `HST-CASE-022-04` | `validateCiMinimumGate` | `U-CIQ-016` | `failed` | `failed` | `HIL_QUARANTINE_MINIMUM_GATE_MISSING` |
| `HST-CASE-022-05` | `parseCiQuarantineRule` | `U-CIQ-014` | `proposed` | `proposed` | `HIL_QUARANTINE_WILDCARD_FORBIDDEN` |
| `HST-CASE-022-06` | `parseCiQuarantineRule` | `U-CIQ-014` | `proposed` | `proposed` | `HIL_QUARANTINE_REMEDIATION_MISSING` |
| `HST-CASE-022-07` | `planCiSelfHealRoute` | `U-CIQ-018` | `exhausted` | `failed` | `HIL_QUARANTINE_EXHAUSTED` |
| `HST-CASE-022-08` | `evaluateCiQuarantineApplication` | `U-CIQ-015` | `assertion_input_ready` | `assertion_pass` | `HIL_CI_QUARANTINE_INVALID` |
| `HST-CASE-022-09` | `evaluateCiQuarantineApplication` | `U-CIQ-015` | `assertion_input_ready` | `assertion_pass` | `HIL_QUARANTINE_SCOPE_INVALID` |
| `HST-CASE-022-10` | `parseCiQuarantineRule` | `U-CIQ-014` | `assertion_input_ready` | `assertion_pass` | `HIL_QUARANTINE_OVERBROAD` |

## §2 schema

```ts
type CiStageKind = "local_prejoin" | "internal_postjoin" | "github_external";

interface CiStageSourceV1 {
  sha: string;
  tree_digest: string;
  check_set_digest: string;
  input_scope_digest: string;
}

interface ProjectionDigestV1 {
  schema_version: "helix-projection-digest.v1";
  subject_kind: string;
  subject_id: string;
  subject_revision: number;
  event_head: string;
  projection_head: string;
  state_digest: string;
  row_count_digest: string;
}
type CiFailureCodeV1 = CiFailure["code"];

interface CiStageReceiptV1 {
  schema_version: "helix-ci-stage-receipt.v1";
  ci_chain_id: string;
  stage: CiStageKind;
  ordinal: 1 | 2 | 3;
  attempt: number;
  source: CiStageSourceV1;
  predecessor_receipt_digest: string | null;
  forward_join_receipt_digest: string | null;
  github_delivery_digest: string | null;
  result: "passed" | "accepted_with_quarantine" | "failed";
  check_result_set_digest: string;
  artifact_set_digest: string;
  event_chain_digest: string;
  failure_codes: CiFailureCodeV1[];
}

interface CiSourceBindingV1 {
  schema_version: "helix-ci-source-binding.v1";
  capability_id: "HU-CAP-006";
  source_root_locator: string;
  base_commit: string;
  base_tree: string;
  source_commit: string;
  source_tree: string;
  entry_set_digest: string;
  unique_delta_digest: string;
  entries: Array<{
    path: string;
    blob_id: string;
    content_digest: string;
    exact_delta_spans: string[];
    disposition: "adopt" | "harden" | "reference-only";
  }>;
  main_existing_asset_digests: string[];
}

type CiQuarantineScopeKind =
  | "check"
  | "test_oracle"
  | "platform"
  | "source_profile"
  | "pack_profile";

interface CiQuarantineScopeAtomV1 {
  kind: CiQuarantineScopeKind;
  id: string;
}

interface CiQuarantineRuleV1 {
  schema_version: "helix-ci-quarantine-rule.v1";
  check_id: string;
  failure_fingerprint: string;
  baseline_sha: string;
  baseline_tree_digest: string;
  exact_scopes: CiQuarantineScopeAtomV1[];
  reason_code: string;
  reason_rationale: string;
  evidence_digest: string;
  source_profile_digest: string;
  pack_profile_digest: string | null;
  check_profile_id: string;
  check_profile_version: string;
  check_profile_digest: string;
  owner: string;
  remediation_issue_id: string;
  expires_at: string;
  max_iterations: number;
  minimum_gate_profile_digest: string;
  approval_receipt_digest: string;
}

interface CiSelfHealAttemptV1 {
  attempt: number;
  route: "same_tree_retry" | "repush_new_chain" | "quarantine" | "issue_escalation";
  source_before: CiStageSourceV1;
  source_after: CiStageSourceV1;
  failure_fingerprint: string;
  sanitized_log_digest: string;
  root_cause_digest: string;
  diff_digest: string | null;
  green_command_receipt_digest: string | null;
  superseding_chain_id: string | null;
}

interface CiRecoveryAttemptResultV1 {
  schema_version: "helix-ci-recovery-attempt-result.v1";
  route: "same_tree_retry" | "repush_new_chain";
  prior_attempt_receipt_digest: string;
  rerequest_delivery_digest: string;
  full_workload_receipt_digest: string;
  sanitized_failure_log_digest: string;
  root_cause_digest: string;
  diff_digest: string | null;
  green_command_receipt_digest: string | null;
  push_receipt_digest: string | null;
  repository_id: string;
  pr_number: number;
  pr_head_sha: string;
  pr_head_tree_digest: string;
  superseding_chain_id: string | null;
  prejoin_receipt_digest: string | null;
  postjoin_receipt_digest: string | null;
  external_receipt_digest: string | null;
  verdict: "complete" | "incomplete" | "failed";
}
```

raw provider log、secret、credential、PIIはschemaへ持たせない。trusted clock receiptはquarantine expiryへ明示注入し、
provider timestampだけで期限を延長しない。check profile、failure normalization、self-heal policyはversion/digestへbindする。

```ts
interface CiMutationCommitBaseV1 {
  operation_id: string;
  payload_digest: string;
  chain_id: string;
  stage_attempt_id: string;
  expected_event_head: string;
  expected_projection_head: string;
  check_result_set_digest: string;
  stage_receipt_digest: string;
  lineage_digest: string;
  optional_outcome_digest: string | null;
}

type CiMutationCommitBundleV1 =
  | (CiMutationCommitBaseV1 & { mutation_kind: "stage_completion" | "quarantine_application" | "self_heal_outcome" })
  | (CiMutationCommitBaseV1 & {
      mutation_kind: "quarantine_rule_create" | "quarantine_rule_update" | "quarantine_rule_expire";
      rule_id: string;
      rule_revision: number;
      prior_rule_revision: number | null;
      rule_digest: string;
      expected_rule_head: string;
      approval_receipt_digest: string;
      freshness_receipt_digest: string;
    });

interface CiMutationCommitReceiptV1 {
  operation_id: string;
  payload_digest: string;
  mutation_kind: CiMutationCommitBundleV1["mutation_kind"];
  before_event_head: string;
  after_event_head: string;
  before_projection_head: string;
  after_projection_head: string;
  rule_revision: number | null;
  write_set_digest: string;
  row_count_digest: string;
}

interface CiImmutableEvidenceV1 {
  operation_id: string;
  payload_digest: string;
  chain_id: string;
  stage_attempt_id: string;
  mutation_kind: CiMutationCommitBundleV1["mutation_kind"];
  check_result_set_digest: string;
  stage_receipt_digest: string;
  lineage_digest: string;
  expected_event_head: string;
  expected_projection_head: string;
}

interface CiMutationStore {
  commit(bundle: CiMutationCommitBundleV1): Promise<Result<CiMutationCommitReceiptV1, CiFailure>>;
  readOperation(operationId: string): Promise<CiMutationCommitReceiptV1 | null>;
  readEventHead(chainId: string): Promise<string>;
  readProjectionHead(chainId: string): Promise<string>;
  readRuleHead(ruleId: string): Promise<string | null>;
  reconcile(operationId: string, evidence: CiImmutableEvidenceV1): Promise<Result<CiMutationCommitReceiptV1, CiFailure>>;
  rebuildProjection(chainId: string): Promise<ProjectionDigestV1>;
}

type CiFailure = {
  code: "HIL_CI_CONCLUSION_NOT_GREEN" | "HIL_CI_EXTERNAL_FAILED" | "HIL_CI_LINEAGE_MISMATCH" | "HIL_CI_POSTJOIN_FAILED" | "HIL_CI_PREJOIN_FAILED" | "HIL_CI_QUARANTINE_INVALID" | "HIL_CI_RECEIPT_LINEAGE_INVALID" | "HIL_CI_REQUIRED_CHECK_MISSING" | "HIL_CI_SHA_STALE" | "HIL_CI_STAGE_BYPASS" | "HIL_CI_STAGE_LINEAGE_INVALID" | "HIL_CI_TREE_DIGEST_MISMATCH" | "HIL_QUARANTINE_EXHAUSTED" | "HIL_QUARANTINE_EXPIRED" | "HIL_QUARANTINE_FINGERPRINT_MISMATCH" | "HIL_QUARANTINE_MINIMUM_GATE_MISSING" | "HIL_QUARANTINE_OVERBROAD" | "HIL_QUARANTINE_REMEDIATION_MISSING" | "HIL_QUARANTINE_SCOPE_INVALID" | "HIL_QUARANTINE_WILDCARD_FORBIDDEN" | "HIL_CI_TRANSACTION_CONFLICT" | "HIL_CI_TRANSACTION_RECONCILE_FAILED";
  evidence_digest: string;
  operation_id?: string;
};
```

`ProjectionDigestV1`の共有semantic shape正本はL4基本設計 §2.3、failure codeのexact authorityは`CiFailure["code"]`とする。reconcileは`CiImmutableEvidenceV1`のchain/stage/lineage/headからだけ復元する。

## §3 不変条件

1. stage ordinalは1、2、3の順で、predecessor receiptなしに次段を作らない。
2. prejoin sourceからForward join result、postjoin sourceからPR headへのlineage edgeを一意に持つ。
3. required check、command、fixture/input scope、artifact schemaの件数/digestはretryやquarantineで減らさない。
4. `accepted_with_quarantine`は`passed`でもgreenでもなく、applicationとminimum gateを必須とする。
5. 新fingerprint、期限切れ、scope外、owner/Issueなし、minimum gate非greenはstage failureである。
6. quarantine scopeはtyped非空・重複0で、reason/evidence/source-pack/check-profile/approvalへbindする。
7. same-tree retryはSHA/tree/check-set/input-scope不変、repushは全Result evidenceを持つ新chainをprejoinからexternalまで完走する。
8. security、permission、unknown failureは自動修正せずIssueへ送る。
9. merge eligibilityはcurrent PR headのexternal receiptとbranch policyが一致する場合だけtrueにする。

## §4 配置候補

| path候補 | 責務 |
|---|---|
| `src/schema/ci-chain.ts` | chain、stage、check、receipt、quarantine、self-heal failure型 |
| `src/ci/source-capability-binding.ts` | HU-CAP-006とpinned evidence検証 |
| `src/ci/check-profile.ts` | universal triggerとsource/pack required workload |
| `src/ci/three-stage-orchestrator.ts` | stage順序、Forward join、GitHub delivery、lineage |
| `src/ci/check-result.ts` | provider conclusion、required set、workload完全性 |
| `src/ci/quarantine.ts` | rule、fingerprint、期限、application、minimum gateの判定 |
| `src/ci/self-heal.ts` | retry/repush/quarantine/Issue route、Result evidence、新chain三段完走 |
| `src/ci/merge-eligibility.ts` | current external receiptとbranch policyの判定 |
| `src/state-db/ci-chain-projection.ts` | L4 CI/quarantine table projectionとrebuild |

GitHub adapter、Git command、clock、SQLite driverはportの外側に置き、pure policyから直接importしない。

## §5 failure、CLI、実装順

known failureはL5 §8のcanonical tokenをrenameせずdiscriminated unionへ入れる。処理量削減は
`HIL_CI_REQUIRED_CHECK_MISSING`、self-heal上限は`HIL_QUARANTINE_EXHAUSTED`をcanonical境界とし、local詳細causeをreceiptへ併記する。
unknown例外はcause digest付き`HIL_CI_STAGE_LINEAGE_INVALID`へ丸めるが、既知lineage/quarantine failureを失わない。

CLI候補は成功0、contract/policy failure 2、provider/I/O failure 3、internal/reconciliation failure 4とする。
実装順はschema/failure、source binding/profile、三段lineage、result aggregation、quarantine、self-heal、projection、
L7 20件、L8 14件、HST-HIL-003/022、別runtime reviewとする。本書はdraftであり実装完了を主張しない。
