---
title: "HELIX L6 機能設計 — engine / detector execution"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
slice_id: HDS-HIL-10
related_l5: docs/design/helix/L5-detail/engine-detector-execution.md
design_slice: HDS-HIL-10
related_hst:
  - HST-HIL-008
  - HST-HIL-009
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/test-design/helix/L6-engine-detector-execution-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-10
  - HAC-HIL-10a
  - HAC-HIL-10b
  - HAC-HIL-10c
system_tests:
  - HST-HIL-008
  - HST-HIL-009
---

# HELIX L6 機能設計 — engine / detector execution

## §1 関数契約とexact oracle

| API | DbC | 単体oracle | exact HST disposition |
|---|---|---|---|
| `parseEngineVersionDescriptor` | capability/runtime/entrypoint/schema/package/config digestとstatusをstrict検証 | `U-EDX-001` | `HST-CASE-008-11` → `HIL_ENGINE_RUN_INCOMPLETE` |
| `parseDetectorVersionDescriptor` | rule/config/result schema、severity policy、owner/statusをstrict検証 | `U-EDX-002` | `HST-CASE-009-07` → `HIL_DETECTOR_FINDING_INCOMPLETE` |
| `resolveRegisteredVersion` | kind/ID/exact versionをactiveからexactly-one解決、unknownはlease 0 | `U-EDX-003` | `HST-CASE-008-09` → `HIL_REGISTRY_VERSION_UNKNOWN`; `HST-CASE-009-03` → `HIL_REGISTRY_VERSION_UNKNOWN` |
| `deriveExecutionIdentity` | snapshot/atomization/current decision/coverage receipt/DB relation root/version/config/input/schema/normalizationから時刻・OS非依存ID | `U-EDX-004` | `HST-CASE-008-06` → `HIL_ENGINE_RUN_NONDETERMINISTIC`; `HST-CASE-009-10` → `HIL_NONDETERMINISTIC_RESULT` |
| `validateFixedExecutionInput` | current snapshot再読込を禁止し全input/config digestを再計算 | `U-EDX-005` | `HST-CASE-008-10` → `HIL_HYBRID_INGESTION_INCOMPLETE`; `HST-CASE-008-11` → `HIL_ENGINE_RUN_INCOMPLETE` |
| `createEngineRunPlan` | engine run/lease/fence/worker requestをartifact authorityへ限定 | `U-EDX-006` | `HST-CASE-008-01` → `なし（正常系）`; `HST-CASE-008-05` → `なし（正常系）` |
| `validateEngineResultProposal` | run/version/input/config/exit/artifact set/provenanceを照合 | `U-EDX-007` | `HST-CASE-008-02` → `なし（正常系）`; `HST-CASE-008-03` → `なし（正常系）`; `HST-CASE-008-04` → `なし（正常系）` |
| `validateArtifactPath` | relative、root内、NULなし、symlink非escape | `U-EDX-008` | `HST-CASE-008-07` / `HIL_ARTIFACT_PATH_ESCAPE` |
| `validateArtifactManifest` | kind/path/schema/size/digest一意、manifest外bytes拒否 | `U-EDX-009` | `HST-CASE-008-01` → `なし（正常系）`; `HST-CASE-008-11` → `HIL_ENGINE_RUN_INCOMPLETE` |
| `createDetectorRunPlan` | detector run/lease/fence/requestをfinding authorityへ限定 | `U-EDX-010` | `HST-CASE-009-01` → `なし（正常系）` |
| `validateDetectorResultProposal` | rule/finding count/set digest/provenanceとschemaを照合 | `U-EDX-011` | `HST-CASE-009-05` → `HIL_DETECTOR_FINDING_EVIDENCE_MISSING`; `HST-CASE-009-07` → `HIL_DETECTOR_FINDING_INCOMPLETE` |
| `canonicalizeFindingEvidence` | separator/改行をversioned正規化し意味bytesを固定 | `U-EDX-012` | `HST-CASE-009-06` / `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC` |
| `deriveDetectorFingerprint` | detector major/rule/subject/location/evidence/normalizationからNode再導出 | `U-EDX-013` | `HST-CASE-009-02` → `なし（正常系）`; `HST-CASE-009-06` → `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC` |
| `evaluateDetectorSuppression` | exact fingerprint/scope/approval/expiry/version/baselineを検証 | `U-EDX-014` | `HST-CASE-009-04` / `HIL_DETECTOR_SUPPRESSION_EXPIRED` |
| `compareDeterministicRerun` | engine artifact setまたはdetector finding setをkind別比較 | `U-EDX-015` | `HST-CASE-008-06`, `HST-CASE-009-10` / `HIL_ENGINE_RUN_NONDETERMINISTIC`, `HIL_NONDETERMINISTIC_RESULT` |
| `planEngineAuthorityCommit` | sealed artifact参照、terminal run、event、provenanceを単一DB transactionへ計画 | `U-EDX-016` | `HST-CASE-008-08` / `HIL_ENGINE_RESULT_PARTIAL` |
| `planDetectorAuthorityCommit` | finding/occurrence、terminal run、event、provenanceを単一DB transactionへ計画 | `U-EDX-017` | `HST-CASE-009-02` → `なし（正常系）`; `HST-CASE-009-08` → `HIL_DB_PROJECTION_BOUNDARY_INVALID`; `HST-CASE-009-09` → `HIL_PROSE_ONLY_EVIDENCE` |
| `invalidateExecutionEvidence` | source/version/config/schema/normalization driftでartifact/baseline/suppression/receiptをstale化 | `U-EDX-018` | `HST-CASE-009-10` / `HIL_NONDETERMINISTIC_RESULT` |
| `resolveCurrentExecutionAuthority` | identityのatomization/decision/coverage/relation authorityをtrusted store current headから解決 | `U-EDX-019` | supporting authority oracle |
| `commitExecutionAuthority` | engine/detector別Node portでoperation/digest/expected head/idempotency付きbundleをcommit | `U-EDX-019` | supporting authority transaction oracle |
| `reconcileExecutionAuthority` | seal済みartifact/proposalから同一bundleを再検証しprojectionとterminal receiptを収束 | `U-EDX-020` | supporting reconcile oracle |

`U-EDX-019`は`resolveCurrentExecutionAuthority` → `commitExecutionAuthority`のstable順exact function setを持つ
authority-resolution/commit compositionである。resolverはtrusted store current head、atomization、adoption decision、coverage receipt、
relation root、versionを一件ずつ偽装して反証し、commit側はresolver receipt、operation/identity digest、expected head、payload、write-set、
idempotencyを一件ずつ偽装してwrite 0を確認する。解決済みauthority以外をcommitできない一つの外部transaction結果として採点する。

## §2 schema候補

```ts
type ExecutionKind = "engine" | "detector";

interface ExecutionIdentityV1 {
  schema_version: "helix-execution-identity.v1";
  kind: ExecutionKind;
  capability_id: string;
  exact_version: string;
  source_snapshot_digest: string;
  atomization_revision: number;
  current_adoption_decision_digest: string;
  coverage_receipt_digest: string;
  db_relation_root_digest: string;
  config_digest: string;
  input_set_digest: string;
  result_schema_major: number;
  normalization_version: string;
}

interface DetectorFindingProposalV1 {
  run_id: string;
  detector_id: string;
  detector_version: string;
  rule_id: string;
  subject_kind: string;
  subject_id: string;
  canonical_location: string;
  severity: string;
  evidence_digest: string;
  fingerprint: string;
  proposal_only: true;
}

interface CurrentExecutionAuthorityStore { readCurrent(expectedAuthorityHead: string, trustedNow: string): Promise<Result<CurrentExecutionAuthorityV1, ExecutionAuthorityTransactionFailure>> }
interface CurrentExecutionAuthorityResolver { resolve(identity: ExecutionIdentityV1, expectedAuthorityHead: string, store: CurrentExecutionAuthorityStore): Promise<Result<CurrentExecutionAuthorityV1, ExecutionAuthorityTransactionFailure>> }
interface ExecutionAuthorityCommitBundleV1 { operation_id: string; operation_digest: string; idempotency_key: string; identity: ExecutionIdentityV1; authority: CurrentExecutionAuthorityV1; expected_authority_head: string; sealed_result_digest: string; expected_db_head: string; authority_kind: ExecutionKind; result_payload: EngineResultPayloadV1 | DetectorResultPayloadV1; events: ExecutionEventV1[]; provenance_edges: ExecutionProvenanceEdgeV1[]; exact_write_set: { table: string; key: string; action: "insert" | "update" }[]; append_order: ["result_reference", "terminal_run", "event", "provenance", "terminal_receipt"]; write_set_digest: string }
interface ExecutionAuthorityCommitReceiptV1 { operation_id: string; operation_digest: string; identity_digest: string; before_db_head: string; after_db_head: string; authority_kind: ExecutionKind; status: "committed" | "reconcile_pending"; terminal_receipt_digest: string; write_set_digest: string; action_counts: Record<string, number> }
type ExecutionFailureCode =
  | "HIL_ARTIFACT_PATH_ESCAPE"
  | "HIL_DB_PROJECTION_BOUNDARY_INVALID"
  | "HIL_DETECTOR_FINDING_EVIDENCE_MISSING"
  | "HIL_DETECTOR_FINDING_INCOMPLETE"
  | "HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC"
  | "HIL_DETECTOR_SUPPRESSION_EXPIRED"
  | "HIL_ENGINE_RESULT_PARTIAL"
  | "HIL_ENGINE_RUN_INCOMPLETE"
  | "HIL_ENGINE_RUN_NONDETERMINISTIC"
  | "HIL_HYBRID_INGESTION_INCOMPLETE"
  | "HIL_NONDETERMINISTIC_RESULT"
  | "HIL_PROSE_ONLY_EVIDENCE"
  | "HIL_PYTHON_AUTHORITY_BYPASS"
  | "HIL_REGISTRY_VERSION_UNKNOWN"
  | "HIL_RUN_IDEMPOTENCY_CONFLICT"
  | "HIL_WORKER_RESULT_QUARANTINED";
interface ExecutionAuthorityTransactionFailure { code: ExecutionFailureCode; evidence_digest: string; cause_code: string | null }
interface ExecutionAuthorityTransactionPort { commit(bundle: ExecutionAuthorityCommitBundleV1): Promise<Result<ExecutionAuthorityCommitReceiptV1, ExecutionAuthorityTransactionFailure>>; reconcile(bundle: ExecutionAuthorityCommitBundleV1): Promise<Result<ExecutionAuthorityCommitReceiptV1, ExecutionAuthorityTransactionFailure>>; findReceipt(operationId: string): Promise<ExecutionAuthorityCommitReceiptV1 | null> }
```

engine proposalとdetector proposalはdiscriminated unionの別variantとし、artifact fieldとfinding fieldの同時存在を拒否する。
proposalにauthoritative ID/current flagを持たせない。Nodeがvalidated proposalとrun identityから正本IDを生成する。

## §3 配置候補と依存方向

| path候補 | 責務 |
|---|---|
| `src/schema/engine-detector-execution.ts` | version、run、artifact、finding、receipt、failure unionの定義 |
| `src/runtime/execution-registry.ts` | versioned descriptorのexact解決 |
| `src/runtime/execution-identity.ts` | 正規化したinput/config/run identity |
| `src/runtime/engine-runner.ts` | engine planとworker proposal受領 |
| `src/runtime/engine-artifact.ts` | path/manifest/digest/seal検証 |
| `src/runtime/detector-runner.ts` | detector planとworker proposal受領 |
| `src/runtime/detector-finding.ts` | evidence/fingerprint/suppression/dedupeの判定 |
| `src/runtime/execution-determinism.ts` | rerun比較とquarantine finding |
| `src/state-db/engine-execution-projection.ts` | engine transaction/rebuild |
| `src/state-db/detector-execution-projection.ts` | detector transaction/rebuild |

runnerは共通`PythonWorkerBroker`/`ResultIngestionPort`へ依存するが、child processやSQLite driverを直接操作しない。
engine moduleはfinding repositoryへ、detector moduleはartifact registryへwriteしない。

## §4 transactionと冪等性

`plan*AuthorityCommit`はpure planを返し、`commitExecutionAuthority`だけがNode portを通じて一transactionで
operation、identity digest、expected DB head、idempotency keyを検証し、event append、kind別projection、terminal receiptを行う。
artifact seal失敗はDB write 0、DB rollbackはauthoritative row 0、seal済みorphanは非currentのままreconcileする。
`reconcileExecutionAuthority`は同一operation/identity/sealed digest/expected headからのみ再開し、別digest再送、head競合、
engine/detector write set混載、暗黙のartifact rewriteを拒否する。
同じidempotency key＋同じidentityは同じterminal receiptを返し、異なるidentityは
`HIL_RUN_IDEMPOTENCY_CONFLICT`でcommit 0とする。

`ExecutionFailureCode`はL5/L6/L7/L8 quartetが使用する16 tokenのclosed unionであり、transaction固有5 tokenだけへ
縮退させない。known failureはL5 §7のtokenをそのままdiscriminated unionにし、alias/renameしない。unknown例外はcause digest付き
`HIL_WORKER_RESULT_QUARANTINED`へ境界変換する。CLI候補は成功0、契約/検証failure 2、I/O 3、internal/reconcile 4。

## §5 実装順とfreeze

1. 20 unit oracleとfailure token一致testをRedにする。
2. engine/detector descriptor、exact version解決、execution identityを実装する。
3. engine result、artifact path/manifest/seal検証を実装する。
4. detector result、evidence/fingerprint/suppression/dedupeを実装する。
5. rerun comparatorとquarantineを実装する。
6. engine/detector別Node transaction、event、projection/rebuildを実装する。
7. 20 unit、14 integration、22 HST、ZIP固定snapshot実run、別runtime reviewを実行する。

20/20のRed/Green、全failure code、mutation、authoritative write count、digest冪等性が揃うまでL7をgreenにしない。

## primary atomic assertion台帳

supporting caseを混入させず、正本primary caseをrangeなしで主IT/Uへ結線する。

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | 主IT結線 | U結線 |
|---|---|---|---|---|---|
| `HST-CASE-008-01` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-006`, `U-EDX-009` |
| `HST-CASE-008-02` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-007` |
| `HST-CASE-008-03` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-007` |
| `HST-CASE-008-04` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-007` |
| `HST-CASE-008-05` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-003` | `U-EDX-006` |
| `HST-CASE-008-06` | `committed` | `quarantined` | `HIL_ENGINE_RUN_NONDETERMINISTIC` | `IT-EDX-008` | `U-EDX-004`, `U-EDX-015` |
| `HST-CASE-008-07` | `result_staged` | `quarantined` | `HIL_ARTIFACT_PATH_ESCAPE` | `IT-EDX-006` | `U-EDX-008` |
| `HST-CASE-008-08` | `result_staged` | `failed` | `HIL_ENGINE_RESULT_PARTIAL` | `IT-EDX-010` | `U-EDX-016` |
| `HST-CASE-008-09` | `queued` | `queued` | `HIL_REGISTRY_VERSION_UNKNOWN` | `IT-EDX-002` | `U-EDX-003` |
| `HST-CASE-009-01` | `queued` | `committed` | `なし（正常系）` | `IT-EDX-004` | `U-EDX-010` |
| `HST-CASE-009-02` | `committed` | `committed` | `なし（正常系）` | `IT-EDX-009` | `U-EDX-013`, `U-EDX-017` |
| `HST-CASE-009-03` | `queued` | `queued` | `HIL_REGISTRY_VERSION_UNKNOWN` | `IT-EDX-002` | `U-EDX-003` |
| `HST-CASE-009-04` | `running` | `committed` | `HIL_DETECTOR_SUPPRESSION_EXPIRED` | `IT-EDX-007` | `U-EDX-014` |
| `HST-CASE-009-05` | `result_staged` | `quarantined` | `HIL_DETECTOR_FINDING_EVIDENCE_MISSING` | `IT-EDX-007` | `U-EDX-011` |
| `HST-CASE-009-06` | `result_staged` | `quarantined` | `HIL_DETECTOR_FINGERPRINT_NONDETERMINISTIC` | `IT-EDX-007` | `U-EDX-012`, `U-EDX-013` |
| `HST-CASE-008-10` | `assertion_input_ready` | `assertion_pass` | `HIL_HYBRID_INGESTION_INCOMPLETE` | `IT-EDX-003` | `U-EDX-005` |
| `HST-CASE-008-11` | `assertion_input_ready` | `assertion_pass` | `HIL_ENGINE_RUN_INCOMPLETE` | `IT-EDX-001` | `U-EDX-001`, `U-EDX-005`, `U-EDX-009` |
| `HST-CASE-009-07` | `assertion_input_ready` | `assertion_pass` | `HIL_DETECTOR_FINDING_INCOMPLETE` | `IT-EDX-001` | `U-EDX-002`, `U-EDX-011` |
| `HST-CASE-008-12` | `assertion_input_ready` | `assertion_pass` | `HIL_PYTHON_AUTHORITY_BYPASS` | `IT-EDX-005` | `U-EDX-016` |
| `HST-CASE-009-08` | `assertion_input_ready` | `assertion_pass` | `HIL_DB_PROJECTION_BOUNDARY_INVALID` | `IT-EDX-011` | `U-EDX-017` |
| `HST-CASE-009-09` | `assertion_input_ready` | `assertion_pass` | `HIL_PROSE_ONLY_EVIDENCE` | `IT-EDX-007` | `U-EDX-017` |
| `HST-CASE-009-10` | `assertion_input_ready` | `assertion_pass` | `HIL_NONDETERMINISTIC_RESULT` | `IT-EDX-012` | `U-EDX-004`, `U-EDX-015`, `U-EDX-018` |

## authority／result完全schema

```ts
interface CurrentExecutionAuthorityV1 { authority_head: string; source_snapshot_id: string; source_snapshot_digest: string; atomization_revision: number; atom_id: string; atom_revision: number; atom_digest: string; adoption_decision_revision: number; adoption_decision_digest: string; coverage_receipt_id: string; coverage_receipt_digest: string; relation_root_digest: string; capability_id: string; registry_version: string; registry_version_digest: string; schema_major: number; normalization_version: string; issued_at: string; fresh_until: string }
interface EngineArtifactV1 { artifact_id: string; kind: string; relative_path: string; media_type: string; schema_version: string; size_bytes: number; content_digest: string; source_provenance_digest: string }
interface EngineResultPayloadV1 { kind: "engine"; run_id: string; identity_digest: string; version_digest: string; input_set_digest: string; config_digest: string; exit_code: number; artifacts: EngineArtifactV1[]; artifact_set_digest: string }
interface DetectorFindingV1 { finding_id: string; rule_id: string; subject_kind: string; subject_id: string; location: string; severity: string; evidence_digest: string; fingerprint: string }
interface DetectorResultPayloadV1 { kind: "detector"; run_id: string; identity_digest: string; version_digest: string; input_set_digest: string; config_digest: string; rule_set_digest: string; findings: DetectorFindingV1[]; finding_set_digest: string }
interface ExecutionEventV1 { event_id: string; operation_id: string; sequence: number; run_id: string; kind: ExecutionKind; event_type: "result_committed" | "result_quarantined" | "reconciled"; payload_digest: string; previous_event_head: string; event_head: string }
interface ExecutionProvenanceEdgeV1 { edge_id: string; result_id: string; authority_head: string; source_kind: "snapshot" | "atom" | "decision" | "coverage" | "relation_root" | "registry_version"; source_id: string; source_digest: string }
```

resolverはstoreのcurrent bytesから全bindingとfreshnessを再検証する。engine/detector strict unionのunknown/余剰field、artifact/finding swap、authority head/version/provenance mismatch、caller digest、stale/CAS/faultはcommit 0とする。
