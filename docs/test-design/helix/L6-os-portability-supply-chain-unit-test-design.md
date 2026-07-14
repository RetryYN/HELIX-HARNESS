---
title: "HELIX L7 単体テスト設計 — OS portability / supply chain"
layer: L6
executed_at_layer: L7
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
pair_artifact: docs/design/helix/L6-function-design/os-portability-supply-chain.md
next_pair_freeze: L6
requirements:
  - HR-FR-HIL-14
  - HAC-HIL-14a
  - HAC-HIL-14b
  - HAC-HIL-14c
---

# HELIX L7 単体テスト設計 — OS portability / supply chain

| ID | 対象function | 前提／操作 | 期待結果／failure oracle | test参照先 |
|---|---|---|---|---|
| `U-OSSC-001` | `canonicalizeOsExecutionProfile` | 3 profileとunknown、facet欠落、scope弱化入力を正規化 | 3 profileだけ決定的に受理し、Linux facet欠落とunknownをcontract failureにする | `tests/os-execution-profile.test.ts` |
| `U-OSSC-002` | `validatePathFilesystemContract` | separator、case collision、NFC/NFD、symlink escape、permission、executableのpositive/negative observation | 全facet個別判定、未宣言差分は`HIL_OS_CONTRACT_DIFFERENCE_UNDECLARED`、path異常は`HIL_OS_PATH_CONTRACT_VIOLATION` | `tests/os-path-filesystem-contract.test.ts` |
| `U-OSSC-003` | `validateProcessContract` | normal exit、deadline cancel、child spawn、cancel無視、orphan childを評価 | child tree終了と期限を満たす場合だけgreen、異常は`HIL_OS_PROCESS_CONTRACT_VIOLATION` | `tests/os-process-contract.test.ts` |
| `U-OSSC-004` | `validateAtomicFileContract` | write/flush/replace各段成功と各段fault journalを評価 | 成功時だけ新正本、fault時partial 0・旧正本保持、違反は`HIL_OS_LOCK_CONTRACT_VIOLATION` | `tests/os-atomic-file-contract.test.ts` |
| `U-OSSC-005` | `validateLockAndSqliteContract` | lock競合、旧fence、stale owner、SQLite busy/timeout/rollback/retry上限を評価 | 単一owner、旧fence拒否、bounded retry、partial commit 0。違反は`HIL_OS_LOCK_CONTRACT_VIOLATION` | `tests/os-lock-sqlite-contract.test.ts` |
| `U-OSSC-006` | `detectOsLogicFork` | adapter/bootstrap内branch、domain/gate/state内branch、期限なしallowlistを走査 | 許可境界だけfinding 0、禁止branchと不完全allowlistを`HIL_OS_ADAPTER_LEAK`で列挙 | `tests/os-logic-fork.test.ts` |
| `U-OSSC-007` | `resolveCanonicalDependencyGraph` | Node/Pythonのdirect/transitive lock、floating version、artifact digest欠落、OS別lockを解決 | stable graphを順序非依存生成し、欠落/floating/OS forkを`HIL_SUPPLY_CHAIN_LOCK_DRIFT`で拒否 | `tests/supply-chain-dependency-graph.test.ts` |
| `U-OSSC-008` | `verifyOnlineInstall` | clean install observation、lock mutation、余剰/欠落component、生成packageを比較 | expected graphとpackageを完全結線し、lock/graph差分を`HIL_SUPPLY_CHAIN_LOCK_DRIFT`で拒否 | `tests/supply-chain-install-verifier.test.ts` |
| `U-OSSC-009` | `verifyOfflineInstallParity` | network 0の同一graph、network attempt、cache miss、1 artifact mutationをonline receiptと比較 | network 0かつgraph/package digest一致だけgreen、反例は`HIL_SUPPLY_CHAIN_OFFLINE_MISMATCH` | `tests/supply-chain-install-verifier.test.ts` |
| `U-OSSC-010` | `buildUnifiedSbom` | Node/Python direct/transitive、Node package、wheel/sdist、欠落/重複identityを入力 | 全component exactly onceの決定的SBOMを返し、欠落/重複を`HIL_SBOM_COMPONENT_MISSING`で拒否 | `tests/supply-chain-sbom.test.ts` |
| `U-OSSC-011` | `evaluateSupplyChainPolicy` | clean scan、redacted finding、allowed/review-required/prohibited/unclassified licenseを評価 | cleanまたは有効承認だけgreen。secret、未分類、禁止/承認欠落を各L5 failure codeで拒否し検出値本文を返さない | `tests/supply-chain-policy.test.ts` |
| `U-OSSC-012` | `evaluateOsSupplyChainCompletion` | 3 profile green、Linux欠落、fixture revision差、domain fork、offline/SBOM/policy failureを集約 | 全条件greenだけPASS。Linux欠落は`HIL_LINUX_COMPLETION_MISSING`、他のfailureを保持してfalse green 0 | `tests/os-supply-chain-completion.test.ts` |
| `U-OSSC-013` | `joinOsSupplyChainProvenance` | trusted producer registration、registered receipt、store head/expected digest、全provenance/freshnessを一件ずつ改変 | store current anchorだけjoin。caller envelope、未知producer、未登録receipt、stale headはcompletion input 0 | `tests/os-supply-chain-provenance.test.ts` |

## §1 合否と証跡

`U-OSSC-001`、`U-OSSC-002`、`U-OSSC-003`、`U-OSSC-004`、`U-OSSC-005`、`U-OSSC-006`、
`U-OSSC-007`、`U-OSSC-008`、`U-OSSC-009`、`U-OSSC-010`、`U-OSSC-011`、`U-OSSC-012`、`U-OSSC-013`の13件すべてで
Red/Green、期待failure code、mutation input、result digestを保存する。host OS依存のtest skipを単体合格へ数えず、pure functionには
明示observationを注入する。mock call countだけでなく、canonical bytes、component集合、network/process/write count、raw secret非保持を
直接assertする。

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
