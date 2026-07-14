---
title: "HELIX L8 結合テスト設計 — OS portability / supply chain"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-14
related_hst:
  - HST-HIL-014
  - HST-HIL-017
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/design/helix/L5-detail/os-portability-supply-chain.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-14
  - HAC-HIL-14a
  - HAC-HIL-14b
  - HAC-HIL-14c
---

# HELIX L8 結合テスト設計 — OS portability / supply chain

## §0 共通oracle

全caseは同一commit/tree、fixture revision、difference manifest、canonical Node/Python manifest/lock、policy revisionへbindする。
command、exit code、stdout/stderr digest、OS/arch、runtime/tool version、artifact digestを保存する。Linuxはclean native環境でfull、
macOSとWindowsはnative環境で同一fixtureをcompatibility実行する。WSL、Git Bash、container wrapper、現行Bun fallbackは
Windows nativeまたはLinux Node完了の代替証拠にしない。全caseは未実装である。

| ID | 結合対象 | Given / When | Then / evidence | exact L5 pointer |
|---|---|---|---|---|
| `IT-OSSC-001` | Linux `OsAdapter`→`OsContractCoordinator`→completion gate | clean Linuxでpath separator、case、Unicode、symlink、permission、executable、process cancel、atomic file、file lock、SQLite contentionを実fixture実行 | 全facet green、orphan process 0、partial write 0、Linux completion receiptあり。1 facet欠落で`HIL_LINUX_COMPLETION_MISSING` | `§1 linux-full`、`§3 OS contract facet`、`§6 HIL_LINUX_COMPLETION_MISSING` |
| `IT-OSSC-002` | macOS adapter→共通fixture→difference manifest | macOS nativeで`IT-OSSC-001`と同一fixture IDを実行し、case/Unicode/permission差分をmanifestと比較 | compatibility green、未宣言差分0。fixture置換または未宣言差分は`HIL_OS_CONTRACT_DIFFERENCE_UNDECLARED` | `§1 macos-portable`、`§3 OS contract facet`、`§6 HIL_OS_CONTRACT_DIFFERENCE_UNDECLARED` |
| `IT-OSSC-003` | Windows adapter→共通fixture→difference manifest | Windows native Node processで同一fixture IDを実行し、path、reparse point、process tree、atomic replace、lockを検査 | compatibility green、WSL/Git Bash依存0、未宣言差分0。process/lock異常は対応failure code | `§1 windows-compatibility`、`§3 OS contract facet`、`§6 HIL_OS_PROCESS_CONTRACT_VIOLATION`、`§6 HIL_OS_LOCK_CONTRACT_VIOLATION` |
| `IT-OSSC-004` | tracked source→`OsLogicForkDetector`→gate | adapter/bootstrap内の許可fixtureとdomain/gate/state/orchestration内のplatform branch mutationを走査 | 許可fixture finding 0、各mutationを`HIL_OS_ADAPTER_LEAK`で拒否、allowlistはreason/owner/expiry必須 | `§2 OsLogicForkDetector`、`§6 HIL_OS_ADAPTER_LEAK` |
| `IT-OSSC-005` | canonical manifests/locks→online install→component graph | clean LinuxでNode/Python direct/transitive dependencyとNode package、wheel/sdistをonline解決 | lock不変、floating/OS lock 0、全component artifact digestあり。lock/source/rollback evidence欠落を`HIL_SUPPLY_CHAIN_LOCK_DRIFT`で拒否 | `§4 canonical dependencyとoffline再現性`、`§6 HIL_SUPPLY_CHAIN_LOCK_DRIFT` |
| `IT-OSSC-006` | prefetched cache→offline install→online parity | networkを遮断し`IT-OSSC-005`のcacheと同一lockだけで再install/package | network attempt 0、Node/Python graph digestとpackage digestがonlineと一致。cache miss、fallback、1 component mutationを`HIL_SUPPLY_CHAIN_OFFLINE_MISMATCH`で拒否 | `§4 canonical dependencyとoffline再現性`、`§6 HIL_SUPPLY_CHAIN_OFFLINE_MISMATCH` |
| `IT-OSSC-007` | resolved graph＋generated packages→`UnifiedSbomBuilder` | Node transitive、Python transitive、Node package、wheel、sdistを含むgraphからSBOMを生成 | 全component exactly once、stable identity/license relationあり、余剰0。欠落・重複・identity conflictを`HIL_SBOM_COMPONENT_MISSING`で拒否 | `§5 SBOM・secret・license契約`、`§6 HIL_SBOM_COMPONENT_MISSING` |
| `IT-OSSC-008` | source/dependency/package→scanner＋license policy→completion gate | clean fixture、redacted secret finding fixture、unclassified/prohibited/review-required license fixtureを評価 | cleanのみgreen。findingは`HIL_SUPPLY_CHAIN_SECRET_FOUND`、未分類は`HIL_SUPPLY_CHAIN_LICENSE_UNCLASSIFIED`、禁止/承認欠落は`HIL_SUPPLY_CHAIN_LICENSE_PROHIBITED`。evidenceに検出値本文0 | `§5 SBOM・secret・license契約`、`§6 HIL_SUPPLY_CHAIN_SECRET_FOUND`、`§6 HIL_SUPPLY_CHAIN_LICENSE_UNCLASSIFIED`、`§6 HIL_SUPPLY_CHAIN_LICENSE_PROHIBITED` |
| `IT-OSSC-009` | trusted anchor store→OS matrix＋supply receipt join→completion gate | producer registration、registered receipt、store head/expected digest、全provenance/freshnessをmutation | trusted current anchorだけPASS。caller envelope、未知producer、未登録receipt、stale headはcompletion 0 | `§6 evidence bundle` |

## §1 合否

`IT-OSSC-001`、`IT-OSSC-002`、`IT-OSSC-003`、`IT-OSSC-004`、`IT-OSSC-005`、`IT-OSSC-006`、
`IT-OSSC-007`、`IT-OSSC-008`、`IT-OSSC-009`の9件すべてを実行し、期待failure code、write/network/process count、全digestを直接assertする。
Linux full未実行、macOS/Windows fixture差替え、offline時network attempt、SBOM sample、secret/license scan省略が1件でもあれば
L8合格にしない。

9 ITからL7の13 UとL6の13 public APIへ全edgeを逆引きし、ownerなしAPI/U、別owner重複、API名差を0件とする。L5 §3の
9 facet allowlistとL6 `OsContractFacetV1`、L5 §6の12 failureとL6 `OsSupplyChainFailureCodeV1`を集合比較し、primary各caseの
pre/expected state、failure、U、ITがL6/L7/L8でexact一致しない場合はintegration closureを拒否する。

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
