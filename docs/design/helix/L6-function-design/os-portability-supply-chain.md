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
| `canonicalizeOsExecutionProfile` | `(raw: unknown, policy: OsProfilePolicy) => Result<OsExecutionProfile, OsSupplyChainFailureV1>` | `linux-full`、`macos-portable`、`windows-compatibility`だけを受理しscopeを弱化しない | `U-OSSC-001` |
| `validatePathFilesystemContract` | `(fixture: PathFixture, observation: PathObservation, difference: ApprovedDifference | null) => ContractResult` | separator/case/Unicode/symlink/permission/executableを全件評価し未宣言差分を拒否 | `U-OSSC-002` |
| `validateProcessContract` | `(fixture: ProcessFixture, observation: ProcessObservation) => ContractResult` | cancel期限、child tree終了、exit reason、orphan 0を要求 | `U-OSSC-003` |
| `validateAtomicFileContract` | `(fixture: AtomicFileFixture, journal: AtomicFileObservation[]) => ContractResult` | temp→flush→replace、failure時partial公開0、旧正本保持を要求 | `U-OSSC-004` |
| `validateLockAndSqliteContract` | `(fixture: LockSqliteFixture, observation: LockSqliteObservation) => ContractResult` | owner/lease/fence、busy期限、rollback、retry上限を検証 | `U-OSSC-005` |
| `detectOsLogicFork` | `(artifacts: SourceArtifact[], policy: OsBranchPolicy) => OsLogicForkReport` | adapter/bootstrapだけをallowし、reason/owner/expiryなしallowlistを拒否 | `U-OSSC-006` |
| `resolveCanonicalDependencyGraph` | `(node: LockedManifest, python: LockedManifest, resolver: ResolverIdentity) => Result<DependencyGraph, OsSupplyChainFailureV1>` | direct/transitive全件、artifact digest、source identityを要求しOS lock forkを拒否 | `U-OSSC-007` |
| `verifyOnlineInstall` | `(expected: DependencyGraph, observation: InstallObservation) => InstallReceipt` | clean環境、lock不変、取得artifactとpackage digestをexpected graphへ結線 | `U-OSSC-008` |
| `verifyOfflineInstallParity` | `(online: InstallReceipt, offline: InstallObservation) => InstallParityReceipt` | network attempt 0、graph/package digest完全一致、cache miss fail-close | `U-OSSC-009` |
| `buildUnifiedSbom` | `(graph: DependencyGraph, packages: GeneratedPackage[], schema: SbomSchema) => Result<UnifiedSbom, OsSupplyChainFailureV1>` | graph全component exactly once、Node/Python/package identityとlicense relation必須 | `U-OSSC-010` |
| `evaluateSupplyChainPolicy` | `(targets: ScanTarget[], scan: SecretScanReport, licenses: LicenseInventory, policy: SupplyChainPolicy) => PolicyReceipt` | raw findingを返さず、finding/unclassified/prohibited/承認欠落をfail-close | `U-OSSC-011` |
| `evaluateOsSupplyChainCompletion` | `(matrix: OsMatrixReceipt, supply: SupplyChainReceipt, policy: CompletionPolicy) => CompletionDecision` | Linux full必須、3 profile同一fixture、domain fork 0、offline/SBOM/policy greenを全て要求 | `U-OSSC-012` |
| `joinOsSupplyChainProvenance` | `(matrix, supply, expectedEnvelopeDigest, store, trustedNow) => Promise<Result<JoinedOsSupplyEvidenceV1, OsSupplyChainFailureV1>>` | trusted producer登録、registered receipt、store current anchor、全provenance/freshnessをexact照合 | `U-OSSC-013` |

## §2 schema

```ts
type OsProfileId = "linux-full" | "macos-portable" | "windows-compatibility";
type OsContractFacetV1 = "path_separator" | "case_unicode" | "symlink" | "permission_executable" | "process_signal" | "atomic_file" | "file_lock" | "sqlite_contention" | "executable_resolution";
type OsSupplyChainFailureCodeV1 =
  | "HIL_LINUX_COMPLETION_MISSING" | "HIL_OS_ADAPTER_LEAK" | "HIL_OS_CONTRACT_DIFFERENCE_UNDECLARED"
  | "HIL_OS_PATH_CONTRACT_VIOLATION" | "HIL_OS_PROCESS_CONTRACT_VIOLATION" | "HIL_OS_LOCK_CONTRACT_VIOLATION"
  | "HIL_SUPPLY_CHAIN_LOCK_DRIFT" | "HIL_SUPPLY_CHAIN_OFFLINE_MISMATCH" | "HIL_SBOM_COMPONENT_MISSING"
  | "HIL_SUPPLY_CHAIN_SECRET_FOUND" | "HIL_SUPPLY_CHAIN_LICENSE_UNCLASSIFIED" | "HIL_SUPPLY_CHAIN_LICENSE_PROHIBITED";
interface OsSupplyChainFailureV1 { schema_version: "helix-os-supply-chain-failure.v1"; code: OsSupplyChainFailureCodeV1; facet: OsContractFacetV1 | "supply_chain"; profile_id: OsProfileId | null; evidence_digest: string; cause_digest: string | null; retryable: boolean; snapshot_id: string; run_id: string }

interface OsExecutionProfile {
  schema_version: "helix-os-profile.v1";
  profile_id: OsProfileId;
  fixture_revision: string;
  difference_manifest_revision: string;
  blocking_facets: OsContractFacetV1[];
}

interface DependencyComponent {
  component_id: string;
  ecosystem: "node" | "python";
  name: string;
  version: string;
  artifact_digest: string;
  source_identity: string;
  relationship: "direct" | "transitive" | "generated-package";
  license_expression: string | null;
}

interface SupplyChainReceipt {
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
interface OsMatrixReceipt { run_id: string; snapshot_id: string; provenance: CommonProvenanceEnvelopeV1; matrix_digest: string }
interface JoinedOsSupplyEvidenceV1 { run_id: string; snapshot_id: string; envelope_digest: string; matrix_digest: string; supply_digest: string }
interface OsSupplyProvenanceAnchorStore { readCurrent(expectedEnvelopeDigest: string): Promise<Result<{ envelope: CommonProvenanceEnvelopeV1; producer_id: string; producer_registration_digest: string; registered_receipt_digest: string; store_head: string }, OsSupplyChainFailureV1>> }
```

`OsSupplyChainFailureCodeV1`はL5 §6の12 codeを完全列挙し、自由文字列へ縮退させない。`OsContractFacetV1`はL5 §3の9 facet IDと
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
