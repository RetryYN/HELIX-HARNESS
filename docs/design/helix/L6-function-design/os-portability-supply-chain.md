---
title: "HELIX L6 機能設計 — OS portability / supply chain"
layer: L6
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
related_l5: docs/design/helix/L5-detail/os-portability-supply-chain.md
design_slice: HDS-HIL-14
related_hst:
  - HST-HIL-014
  - HST-HIL-017
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/test-design/helix/L6-os-portability-supply-chain-unit-test-design.md
next_pair_freeze: L7
requirements:
  - HR-FR-HIL-14
  - HAC-HIL-14a
  - HAC-HIL-14b
  - HAC-HIL-14c
---

# HELIX L6 機能設計 — OS portability / supply chain

## §0 設計規律

pure policyはplatform API、filesystem、network、process、clockを直接読まず、明示入力だけで決定する。副作用はportへ隔離し、
既知failureをdiscriminated unionで返す。`process.platform`等のplatform probeはadapter/bootstrapだけに置き、domain/gateから
直接呼ばない。以下のsignatureはL7実装前のdraftであり、実装済みAPIを主張しない。

## §1 function signatureとexact unit oracle

| API | signature | DbC／failure | 対応するL7 oracle |
|---|---|---|---|
| `canonicalizeOsExecutionProfile` | `(raw: unknown, policy: OsProfilePolicyV1) => ResultV1<OsExecutionProfileV1, OsSupplyChainFailureV1>` | `linux-full`、`macos-portable`、`windows-compatibility`だけを受理しscopeを弱化しない | `U-OSSC-001` |
| `validatePathFilesystemContract` | `(fixture: PathFixtureV1, observation: PathObservationV1, difference: ApprovedDifferenceV1 | null) => ContractResultV1` | separator/case/Unicode/symlink/permission/executableを全件評価し未宣言差分を拒否 | `U-OSSC-002` |
| `validateProcessContract` | `(fixture: ProcessFixtureV1, observation: ProcessObservationV1) => ContractResultV1` | cancel期限、child tree終了、exit reason、orphan 0を要求 | `U-OSSC-003` |
| `validateAtomicFileContract` | `(fixture: AtomicFileFixtureV1, journal: AtomicFileObservationV1[]) => ContractResultV1` | temp→flush→replace、failure時partial公開0、旧正本保持を要求 | `U-OSSC-004` |
| `validateLockAndSqliteContract` | `(fixture: LockSqliteFixtureV1, observation: LockSqliteObservationV1) => ContractResultV1` | owner/lease/fence、busy期限、rollback、retry上限を検証 | `U-OSSC-005` |
| `detectOsLogicFork` | `(artifacts: SourceArtifactV1[], policy: OsBranchPolicyV1) => OsLogicForkReportV1` | adapter/bootstrapだけをallowし、reason/owner/expiryなしallowlistを拒否 | `U-OSSC-006` |
| `resolveCanonicalDependencyGraph` | `(node: LockedManifestV1, python: LockedManifestV1, resolver: ResolverIdentityV1) => ResultV1<DependencyGraphV1, OsSupplyChainFailureV1>` | direct/transitive全件、artifact digest、source identityを要求しOS lock forkを拒否 | `U-OSSC-007` |
| `verifyOnlineInstall` | `(expected: DependencyGraphV1, observation: InstallObservationV1) => InstallReceiptV1` | clean環境、lock不変、取得artifactとpackage digestをexpected graphへ結線 | `U-OSSC-008` |
| `verifyOfflineInstallParity` | `(online: InstallReceiptV1, offline: InstallObservationV1) => InstallParityReceiptV1` | network attempt 0、graph/package digest完全一致、cache miss fail-close | `U-OSSC-009` |
| `buildUnifiedSbom` | `(graph: DependencyGraphV1, packages: GeneratedPackageV1[], schema: SbomSchemaV1) => ResultV1<UnifiedSbomV1, OsSupplyChainFailureV1>` | graph全component exactly once、Node/Python/package identityとlicense relation必須 | `U-OSSC-010` |
| `evaluateSupplyChainPolicy` | `(targets: ScanTargetV1[], scan: SecretScanReportV1, licenses: LicenseInventoryV1, policy: SupplyChainPolicyV1) => PolicyReceiptV1` | raw findingを返さず、finding/unclassified/prohibited/承認欠落をfail-close | `U-OSSC-011` |
| `evaluateOsSupplyChainCompletion` | `(matrix: OsMatrixReceiptV1, supply: SupplyChainReceiptV1, policy: CompletionPolicyV1) => CompletionDecisionV1` | Linux full必須、3 profile同一fixture、domain fork 0、offline/SBOM/policy greenを全て要求 | `U-OSSC-012` |
| `joinOsSupplyChainProvenance` | `(matrix: OsMatrixReceiptV1, supply: SupplyChainReceiptV1, expectedEnvelopeDigest: string, store: OsSupplyProvenanceAnchorStoreV1, trustedNow: TrustedNowV1) => Promise<ResultV1<JoinedOsSupplyEvidenceV1, OsSupplyChainFailureV1>>` | trusted producer登録、registered receipt、store current anchor、全provenance/freshnessをexact照合 | `U-OSSC-013` |

## §2 schema

```ts
type ResultV1<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

type OsProfileIdV1 = "linux-full" | "macos-portable" | "windows-compatibility";
type OsContractFacetV1 = "path_separator" | "case_unicode" | "symlink" | "permission_executable" | "process_signal" | "atomic_file" | "file_lock" | "sqlite_contention" | "executable_resolution";
type OsSupplyChainFailureCodeV1 =
  | "HIL_LINUX_COMPLETION_MISSING" | "HIL_OS_ADAPTER_LEAK" | "HIL_OS_CONTRACT_DIFFERENCE_UNDECLARED"
  | "HIL_OS_PATH_CONTRACT_VIOLATION" | "HIL_OS_PROCESS_CONTRACT_VIOLATION" | "HIL_OS_LOCK_CONTRACT_VIOLATION"
  | "HIL_OS_SYMLINK_ESCAPE" | "HIL_OS_SQLITE_LOCK_TIMEOUT" | "HIL_OS_CONTRACT_VIOLATION"
  | "HIL_OS_PRIORITY_INVALID" | "HIL_OS_LOGIC_FORK"
  | "HIL_SUPPLY_CHAIN_LOCK_DRIFT" | "HIL_SUPPLY_CHAIN_OFFLINE_MISMATCH" | "HIL_SBOM_COMPONENT_MISSING"
  | "HIL_SUPPLY_CHAIN_SECRET_FOUND" | "HIL_SUPPLY_CHAIN_LICENSE_UNCLASSIFIED" | "HIL_SUPPLY_CHAIN_LICENSE_PROHIBITED"
  | "HIL_SUPPLY_CHAIN_NOT_REPRODUCIBLE" | "HIL_ACTION_BINDING_APPROVAL_MISSING"
  | "HIL_OS_INTERNAL_ERROR" | "HIL_SUPPLY_CHAIN_INTERNAL_ERROR";
interface OsSupplyChainFailureV1 { schema_version: "helix-os-supply-chain-failure.v1"; code: OsSupplyChainFailureCodeV1; facet: OsContractFacetV1 | "supply_chain"; profile_id: OsProfileIdV1 | null; evidence_digest: string; cause_digest: string | null; retryable: boolean; snapshot_id: string; run_id: string }

interface OsProfilePolicyV1 { policy_revision: string; required_profiles: OsProfileIdV1[]; linux_blocking_facets: OsContractFacetV1[]; fixture_revision: string; difference_manifest_revision: string; policy_digest: string }
interface OsExecutionProfileV1 {
  schema_version: "helix-os-profile.v1";
  profile_id: OsProfileIdV1;
  fixture_revision: string;
  difference_manifest_revision: string;
  blocking_facets: OsContractFacetV1[];
}

interface PathFixtureV1 { fixture_id: string; profile_id: OsProfileIdV1; facet_ids: OsContractFacetV1[]; canonical_path: string; expected_target_digest: string; expected_capabilities_digest: string; fixture_digest: string }
interface PathObservationV1 { fixture_id: string; native_path_digest: string; normalized_path: string; collision_digests: string[]; symlink_target_digest: string | null; permission_digest: string; executable_digest: string; observation_digest: string }
interface ApprovedDifferenceV1 { profile_id: OsProfileIdV1; facet_id: OsContractFacetV1; fixture_id: string; expected_digest: string; reason_digest: string; evidence_digest: string; approval_revision: string; expires_at: string | null }
interface ContractResultV1 { fixture_id: string; profile_id: OsProfileIdV1; evaluated_facets: OsContractFacetV1[]; failure_codes: OsSupplyChainFailureCodeV1[]; pass: boolean; result_digest: string }
interface ProcessFixtureV1 { fixture_id: string; profile_id: OsProfileIdV1; command_digest: string; child_tree_digest: string; cancel_deadline_ms: number; expected_exit_reason: string; fixture_digest: string }
interface ProcessObservationV1 { fixture_id: string; started_child_count: number; terminated_child_count: number; orphan_child_count: number; cancel_elapsed_ms: number; exit_reason: string; observation_digest: string }
interface AtomicFileFixtureV1 { fixture_id: string; profile_id: OsProfileIdV1; prior_authority_digest: string; candidate_digest: string; required_steps: ["temp_write", "flush", "replace"]; fixture_digest: string }
interface AtomicFileObservationV1 { sequence: number; step: "temp_write" | "flush" | "replace" | "fault"; published_digest: string | null; prior_authority_preserved: boolean; partial_publish_count: number; observation_digest: string }
interface LockSqliteFixtureV1 { fixture_id: string; profile_id: OsProfileIdV1; owner_id: string; lease_id: string; fence_token: string; busy_deadline_ms: number; retry_limit: number; fixture_digest: string }
interface LockSqliteObservationV1 { fixture_id: string; observed_owner_ids: string[]; accepted_fence_token: string | null; retry_count: number; elapsed_ms: number; rollback_complete: boolean; partial_commit_count: number; observation_digest: string }
interface SourceArtifactV1 { path: string; symbol: string; layer: "adapter" | "bootstrap" | "domain" | "gate" | "state" | "policy" | "orchestration"; platform_branch_digest: string; source_digest: string }
interface OsBranchPolicyV1 { policy_revision: string; allowed_layers: ["adapter", "bootstrap"]; allowlist: { symbol: string; reason_digest: string; owner: string; expires_at: string; replacement_design_digest: string }[]; policy_digest: string }
interface OsLogicForkReportV1 { scanned_artifact_count: number; finding_count: number; findings: { path: string; symbol: string; layer: string; failure_code: "HIL_OS_ADAPTER_LEAK"; evidence_digest: string }[]; allowlist_digest: string; report_digest: string }
interface LockedManifestV1 { ecosystem: "node" | "python"; manifest_digest: string; lock_digest: string; resolver_version: string; os_variant: null; components: DependencyComponentV1[] }
interface ResolverIdentityV1 { resolver_id: string; resolver_version: string; artifact_policy_digest: string; source_policy_digest: string; identity_digest: string }
interface DependencyComponentV1 {
  component_id: string;
  ecosystem: "node" | "python";
  name: string;
  version: string;
  artifact_digest: string;
  source_identity: string;
  relationship: "direct" | "transitive" | "generated-package";
  license_expression: string | null;
}
interface DependencyGraphV1 { resolver_identity_digest: string; node_manifest_digest: string; node_lock_digest: string; python_manifest_digest: string; python_lock_digest: string; components: DependencyComponentV1[]; component_count: number; graph_digest: string }
interface GeneratedPackageV1 { package_id: string; ecosystem: "node" | "python"; kind: "node-package" | "wheel" | "sdist"; name: string; version: string; artifact_digest: string; source_graph_digest: string; license_expression: string | null }
interface InstallObservationV1 { run_id: string; mode: "online" | "offline"; clean_environment: boolean; input_lock_digest: string; output_lock_digest: string; installed_components: DependencyComponentV1[]; generated_packages: GeneratedPackageV1[]; network_attempt_count: number; cache_miss_count: number; observation_digest: string }
interface InstallReceiptV1 { run_id: string; mode: "online"; lock_digest: string; graph_digest: string; package_set_digest: string; cache_inventory_digest: string; network_attempt_count: number; pass: boolean; receipt_digest: string }
interface InstallParityReceiptV1 { run_id: string; online_receipt_digest: string; offline_observation_digest: string; online_graph_digest: string; offline_graph_digest: string; online_package_set_digest: string; offline_package_set_digest: string; network_attempt_count: 0; cache_miss_count: 0; pass: boolean; receipt_digest: string }
interface SbomSchemaV1 { schema_id: string; schema_version: string; required_component_fields: string[]; relation_policy_digest: string; schema_digest: string }
interface UnifiedSbomV1 { schema_id: string; schema_version: string; graph_digest: string; package_set_digest: string; components: DependencyComponentV1[]; component_count: number; relation_digest: string; sbom_digest: string }
interface ScanTargetV1 { target_id: string; target_kind: "source" | "manifest-lock" | "dependency" | "generated-package" | "sbom-evidence"; content_digest: string; classification: string }
interface SecretScanReportV1 { scanner_digest: string; policy_revision: string; target_set_digest: string; finding_count: number; redacted_fingerprints: string[]; raw_finding_count: 0; report_digest: string }
interface LicenseInventoryV1 { graph_digest: string; entries: { component_id: string; license_expression: string | null; classification: "allowed" | "review_required" | "prohibited" | "unclassified"; approval_digest: string | null }[]; inventory_digest: string }
interface SupplyChainPolicyV1 { policy_revision: string; scanner_digest: string; allowed_license_expressions: string[]; prohibited_license_expressions: string[]; review_approval_schema_digest: string; policy_digest: string }
interface PolicyReceiptV1 { target_set_digest: string; scanner_digest: string; license_inventory_digest: string; policy_digest: string; secret_finding_count: number; license_counts: Record<"allowed" | "review_required" | "prohibited" | "unclassified", number>; approval_digests: string[]; failure_codes: OsSupplyChainFailureCodeV1[]; pass: boolean; receipt_digest: string }
interface CompletionPolicyV1 { policy_revision: string; required_profiles: OsProfileIdV1[]; required_fixture_revision: string; require_domain_fork_count: 0; require_offline_parity: true; require_complete_sbom: true; require_policy_green: true; max_evidence_age_ms: number; policy_digest: string }
interface CompletionDecisionV1 { run_id: string; snapshot_id: string; matrix_digest: string; supply_digest: string; evaluated_profile_ids: OsProfileIdV1[]; failure_codes: OsSupplyChainFailureCodeV1[]; pass: boolean; decision_digest: string }
interface TrustedNowV1 { trusted_now: string; clock_receipt_digest: string; max_skew_ms: number }

interface SupplyChainReceiptV1 {
  schema_version: "helix-supply-chain-receipt.v1";
  run_id: string;
  snapshot_id: string;
  provenance: CommonProvenanceEnvelopeV1;
  supply_digest: string;
  node_lock_digest: string;
  python_lock_digest: string;
  online_graph_digest: string;
  offline_graph_digest: string;
  network_attempt_count: number;
  sbom_digest: string;
  secret_finding_count: number;
  license_counts: Record<"allowed" | "review_required" | "prohibited" | "unclassified", number>;
  policy_digest: string;
  failure_codes: OsSupplyChainFailureCodeV1[];
}

interface CommonProvenanceEnvelopeV1 {
  schema_version: "helix-os-supply-provenance.v1"; run_id: string; snapshot_id: string;
  commit_digest: string; tree_digest: string; fixture_revision: string; difference_manifest_revision: string;
  resolver_digest: string; scanner_digest: string; evidence_schema_digest: string; toolchain_digest: string;
  package_set_digest: string; evidence_root_digest: string; approval_digest: string; created_at: string; fresh_until: string;
  envelope_digest: string;
}
interface OsMatrixReceiptV1 { run_id: string; snapshot_id: string; provenance: CommonProvenanceEnvelopeV1; profile_ids: OsProfileIdV1[]; fixture_revision: string; difference_manifest_revision: string; domain_fork_count: number; failure_codes: OsSupplyChainFailureCodeV1[]; matrix_digest: string }
interface JoinedOsSupplyEvidenceV1 { run_id: string; snapshot_id: string; envelope_digest: string; matrix_digest: string; supply_digest: string }
interface OsSupplyProvenanceAnchorStoreV1 { readCurrent(expectedEnvelopeDigest: string): Promise<ResultV1<{ envelope: CommonProvenanceEnvelopeV1; producer_id: string; producer_registration_digest: string; registered_receipt_digest: string; store_head: string }, OsSupplyChainFailureV1>> }
```

`OsSupplyChainFailureCodeV1`はL5 §6の詳細failure 12件、HST境界failure 7件、adapter境界internal failure 2件を合わせた21 codeを完全列挙し、自由文字列へ縮退させない。`OsContractFacetV1`はL5 §3の9 facet IDと
順序・集合がexact一致するlocal型である。receiptはraw command、raw scanner出力、
credential、PIIを持たず、commandとstdout/stderrはdigest参照だけを持つ。

13 public APIは`U-OSSC-001`〜`013`へ一対一でownerを持つ。各UからL8の少なくとも一つのITへedgeを逆引きし、API/Uの欠落・重複owner、
未知API、L6/L7/L8のfailure/state差を拒否する。HST primary表で複数caseが同じU/ITを共有する場合もcase ownerの重複ではなく、
各case ID、pre/expected state、failureを独立joinする。

## §3 実装配置候補とauthority

| path | owner | 制約 |
|---|---|---|
| `src/schema/os-portability.ts` | profile、fixture、observation、failure schema | platform API import禁止 |
| `src/schema/supply-chain.ts` | graph、SBOM、policy、receipt schema | package manager固有型を公開しない |
| `src/runtime/os-adapter.ts` | adapter interfaceとbootstrap | platform判定の唯一のproduct runtime境界 |
| `src/runtime/os-adapters/` | Linux/macOS/Windows port実装 | domain/gate判断禁止 |
| `src/policy/os-contract.ts` | OS observationのpure validation | filesystem/process直接操作禁止 |
| `src/lint/os-logic-fork.ts` | source scanと期限付きallowlist検査 | test skipを自動許可しない |
| `src/supply-chain/dependency-graph.ts` | lock→canonical graph | network/filesystem直接操作禁止 |
| `src/supply-chain/install-verifier.ts` | online/offline receipt比較 | install実行はinjected port経由 |
| `src/supply-chain/sbom.ts` | unified SBOM生成 | component欠落時partial SBOMをgreenにしない |
| `src/supply-chain/policy.ts` | secret/license判定 | raw finding永続化禁止 |
| `src/gates/os-supply-chain-completion.ts` | blocking completion decision | adapter、scanner、installer直接実行禁止 |

現行`src/runtime/adapter.ts`、`src/lint/runtime-portability.ts`、`src/lint/secret-scan.ts`は実装時の差分調査対象である。
既存機能を別系統へ複製せず、共通port/policyへ収束させる。Bun前提lintを削除するだけでは完了とせず、Node canonical lock、
Linux full、offline、SBOM、licenseまでRedを作った後に置換する。

## §4 failure/resultとCLI境界

known contract failureはthrowせず`Result`または判定receiptへ返す。unexpected I/O/runtime exceptionはadapter境界で
`HIL_OS_INTERNAL_ERROR`または`HIL_SUPPLY_CHAIN_INTERNAL_ERROR`へcause digest付きで変換する。この2 codeは診断用であり、
L5の具体failureをinternalへ丸めない。CLI候補は成功0、contract/policy failure 2、I/O failure 3、internal failure 4とし、
stdoutはschema JSON、診断はstderr、双方をevidenceではdigest化する。

## §5 WBS

1. 現行platform branch、Bun lock/install/package、secret scan、license surfaceをtracked tree全件からinventory化する。
2. schemaとfailure unionを`U-OSSC-001`、`U-OSSC-007`、`U-OSSC-011`のRedで固定する。
3. pure OS validatorを`U-OSSC-002`、`U-OSSC-003`、`U-OSSC-004`、`U-OSSC-005`で実装する。
4. logic fork detectorを`U-OSSC-006`で実装し、既存例外をsymbol単位で再審査する。
5. canonical graphとonline/offline verifierを`U-OSSC-007`、`U-OSSC-008`、`U-OSSC-009`で実装する。
6. unified SBOMとsecret/license policyを`U-OSSC-010`、`U-OSSC-011`で実装する。
7. completion gateを`U-OSSC-012`で実装し、Linux missingのfalse greenを固定する。
8. Linux fullを先に完遂し、同一fixtureをmacOS/Windows nativeへ展開する。
9. L8の9 integration oracleとclean/offline package再生成を実行し、別runtime reviewを得る。

各段階でRed/Green、command/exit、fixture/policy/lock digestを保存する。単体13件または結合9件の一部省略、OS別fixture、
代表componentだけのSBOM、secret/license scan後回しを完了条件にしない。

## primary atomic assertion台帳

Linux-primary、multi-OS、supply-chain provenanceを維持し、supporting caseを混入させず正本primary caseをrangeなしで結線する。

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | 主IT結線 | U結線 |
|---|---|---|---|---|---|
| `HST-CASE-014-01` | `queued` | `passed` | `なし（正常系）` | `IT-OSSC-001` | `U-OSSC-012` |
| `HST-CASE-014-02` | `queued` | `passed` | `なし（正常系）` | `IT-OSSC-002` | `U-OSSC-001` |
| `HST-CASE-014-03` | `queued` | `passed` | `なし（正常系）` | `IT-OSSC-003` | `U-OSSC-001` |
| `HST-CASE-014-04` | `verifying` | `failed` | `HIL_OS_ADAPTER_LEAK` | `IT-OSSC-004` | `U-OSSC-006` |
| `HST-CASE-014-05` | `running` | `failed` | `HIL_OS_SYMLINK_ESCAPE` | `IT-OSSC-001` | `U-OSSC-002` |
| `HST-CASE-014-06` | `running` | `cancelled` | `なし（正常系）` | `IT-OSSC-001` | `U-OSSC-003` |
| `HST-CASE-014-07` | `running` | `failed` | `HIL_OS_SQLITE_LOCK_TIMEOUT` | `IT-OSSC-001` | `U-OSSC-005` |
| `HST-CASE-017-01` | `queued` | `passed` | `なし（正常系）` | `IT-OSSC-005` | `U-OSSC-008` |
| `HST-CASE-017-02` | `queued` | `passed` | `なし（正常系）` | `IT-OSSC-006` | `U-OSSC-009` |
| `HST-CASE-017-03` | `verifying` | `failed` | `HIL_SBOM_COMPONENT_MISSING` | `IT-OSSC-007` | `U-OSSC-010` |
| `HST-CASE-017-04` | `verifying` | `failed` | `HIL_SUPPLY_CHAIN_SECRET_FOUND` | `IT-OSSC-008` | `U-OSSC-011` |
| `HST-CASE-017-05` | `verifying` | `approval_required` | `HIL_SUPPLY_CHAIN_LICENSE_UNCLASSIFIED` | `IT-OSSC-008` | `U-OSSC-011` |
| `HST-CASE-017-06` | `queued` | `failed` | `HIL_SUPPLY_CHAIN_LOCK_DRIFT` | `IT-OSSC-005` | `U-OSSC-007` |
| `HST-CASE-014-08` | `assertion_input_ready` | `assertion_pass` | `HIL_OS_CONTRACT_VIOLATION` | `IT-OSSC-001` | `U-OSSC-012` |
| `HST-CASE-014-09` | `assertion_input_ready` | `assertion_pass` | `HIL_OS_PRIORITY_INVALID` | `IT-OSSC-001` | `U-OSSC-001` |
| `HST-CASE-017-07` | `assertion_input_ready` | `assertion_pass` | `HIL_SUPPLY_CHAIN_NOT_REPRODUCIBLE` | `IT-OSSC-005` | `U-OSSC-012` |
| `HST-CASE-017-08` | `assertion_input_ready` | `assertion_pass` | `HIL_ACTION_BINDING_APPROVAL_MISSING` | `IT-OSSC-008` | `U-OSSC-011` |
| `HST-CASE-014-10` | `assertion_input_ready` | `assertion_pass` | `HIL_OS_LOGIC_FORK` | `IT-OSSC-004` | `U-OSSC-006` |
| `HST-CASE-014-11` | `assertion_input_ready` | `assertion_pass` | `HIL_LINUX_COMPLETION_MISSING` | `IT-OSSC-001` | `U-OSSC-012` |
