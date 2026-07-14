---
title: "HELIX L5 詳細設計 — OS portability / supply chain"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
design_slice: HDS-HIL-14
related_hst:
  - HST-HIL-014
  - HST-HIL-017
pair_artifact: docs/test-design/helix/L5-os-portability-supply-chain-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-14
  - HAC-HIL-14a
  - HAC-HIL-14b
  - HAC-HIL-14c
  - HIL-FR-34
  - HIL-TR-04
  - HIL-TR-05
  - HIL-TR-06
  - HIL-NFR-09
  - HIL-NFR-19
---

# HELIX L5 詳細設計 — OS portability / supply chain

## §0 境界と完了意味

本書は`HR-FR-HIL-14`を、OS adapter契約とNode/Python supply chain契約へ降ろす。Linuxでの完了を必須とし、
macOSとWindowsはLinuxと同じfixture・同じ判定schemaを使うcompatibility検証とする。macOS/Windowsのgreen、
wrapperの起動、または現行Bun経路のgreenをLinux fullの代替にしない。

本書とL8テスト設計はdraftであり、Node移行、Python package導入、lock生成、CI変更、配布物生成を実施しない。
現行`src/lint/runtime-portability.ts`がBun前提を検査している事実はmigration inputであり、Node cutover完了証拠ではない。

## §1 実行profileと共通contract

| profile | 必須範囲 | 完了条件 | 代替禁止 |
|---|---|---|---|
| `linux-full` | path/filesystem、process、atomic file、lock、SQLite、online/offline install、SBOM、secret/license、package | 全blocking oracle green、未分類差分0、Bun fallback 0 | macOS/Windows結果、container内wrapperだけのgreen |
| `macos-portable` | Linuxと同一OS fixture、Linux canonical lockからのinstall、package smoke | 全compatibility oracle green、期待差分manifest以外0 | macOS専用domain分岐、macOS専用lock |
| `windows-compatibility` | Linuxと同一OS fixture、Linux canonical lockからのinstall、native process/path smoke | 全compatibility oracle green、期待差分manifest以外0 | WSL/Git Bashをnative Windows証拠として代用、Windows専用lock |

`OsDifferenceManifest`はprofile、contract facet、fixture ID、期待値、理由、根拠、承認revisionを1差分1行で保持する。
manifestにない差分、fixtureの削除・置換、assertionの弱化は`HIL_OS_CONTRACT_DIFFERENCE_UNDECLARED`で拒否する。
profile間で異なるのはadapterが返す正規化結果と明示済み期待差分だけであり、domain、gate、completion policyはforkしない。

## §2 module分解

| module | 責務 | 入力 | 出力 | 禁止 |
|---|---|---|---|---|
| `OsContractCoordinator` | 同一fixtureを3 profileへ配布し結果を集約 | profile matrix、fixture set、difference manifest | OS matrix receipt | OS別fixture、Linux未実行で完了 |
| `OsAdapter` | path、process、signal、atomic file、lock、SQLite、executable差分を正規化 | platform facts、port request | platform非依存result | domain/gate判断、supply-chain policy |
| `OsLogicForkDetector` | adapter境界外のplatform条件分岐を静的検出 | tracked source、allowlist revision | finding set | test skipを恒久allowlist化 |
| `SupplyChainVerifier` | lock、install graph、SBOM、secret/license結果を同一runへ結線 | canonical manifests/locks、policy、package set | supply-chain receipt | lock更新、依存取得、finding隠蔽 |
| `CanonicalDependencyResolver` | Node/Pythonの完全な依存graphをcanonical lockから構成 | manifest、lock、resolver version | component graph＋digest | floating version、OS別lock正本化 |
| `OfflineInstallVerifier` | networkなしinstallとonline installのgraph同一性を検査 | prefetched cache、canonical locks、online receipt | offline receipt＋差分 | network fallback、cache missのsoft pass |
| `UnifiedSbomBuilder` | Node packageとPython wheel/sdistを単一inventoryへ統合 | resolved graph、generated packages | SBOM＋component coverage | rootだけの列挙、component identity欠落 |
| `SupplyChainPolicyEvaluator` | source、dependency、generated packageへsecret/license policyを適用 | scan reports、license inventory、policy revision | policy receipt | raw finding本文保存、未分類licenseのgreen化 |
| `OsSupplyChainCompletionGate` | scope別のblocking判定とLinux必須条件を評価 | OS matrix、supply-chain receipt | completion decision | wrapper green代用、evidenceなしの手動PASS |

`process.platform`等のplatform判定は`OsAdapter`実装とadapter bootstrapだけに閉じる。domain、gate、state、policy、
orchestrationにplatform branchが1件でもあれば`HIL_OS_ADAPTER_LEAK`とする。現行の例外候補は自動継承せず、
実装時にsymbol単位でreason、owner、expiry、代替設計を持つallowlistへ再審査する。

## §3 OS契約facet

| facet | 共通fixture／不変条件 | adapterが吸収する差分 | blocking例 |
|---|---|---|---|
| path separator | canonical pathは`/`、absolute/traversal/NULを拒否 | native pathへの変換 | root外escape、separator二重解釈 |
| case／Unicode | raw pathと表示用NFCを分離しcollisionを検出 | filesystemのcase sensitivity、NFD観測 | case/NFC衝突のsilent merge |
| symlink | link自体とtargetを識別しscope外targetを追跡しない | junction/reparse point表現 | link経由escape、loop未検出 |
| permission／executable | 読書実行能力を明示的にprobe | POSIX modeとWindows ACL/executable解決 | permission errorの成功扱い |
| process／signal | child tree、cancel、期限、終了理由をreceipt化 | signalとprocess tree termination手段 | orphan child、cancel後継続 |
| atomic file | temp write、flush、rename/replace、失敗時非公開 | rename/replace primitive | partial publish、既存正本破壊 |
| file lock | owner、lease、fence、stale判定を保持 | advisory/mandatory lock primitive | 二重owner、旧fence write |
| SQLite contention | busy期限、transaction rollback、再試行上限を固定 | driver/locking mode | timeoutなし待機、partial commit |
| executable resolution | explicit pathと検証済みPATH lookupだけを許可 | executable suffix、PATH delimiter | shell暗黙dispatch、別binary採用 |

L6 `OsContractFacetV1`のexact allowlistは表順に`path_separator`、`case_unicode`、`symlink`、
`permission_executable`、`process_signal`、`atomic_file`、`file_lock`、`sqlite_contention`、`executable_resolution`の9値とする。
表示名からの推測、自由文字列、複数facetのaggregate aliasを禁止する。

Linuxでは全facetを実filesystem・実process・実SQLiteで実行する。macOS/Windowsも同じfixture IDを実行し、
環境上実行不能なfacetを暗黙skipしない。実行不能はblocking resultとし、scope変更には上位要求の再承認を要する。

## §4 canonical dependencyとoffline再現性

NodeとPythonはそれぞれ単一のcanonical manifest/lockを持ち、direct/transitive dependency、artifact digest、source identity、
resolver versionを固定する。package managerとlock形式はL4未確定事項を閉じる別decisionで選定し、本書では複数lockの併存、
OS別lock、範囲versionだけの固定を許可しない。macOS/WindowsはLinux canonical lockを入力に解決する。

online installはclean Linuxで取得元、component graph、cache inventory、生成package digestを記録する。offline installはそのcacheを
唯一の入力とし、network attempt 0、missing cache時fail-close、onlineと同じcomponent identity/version/artifact digestを要求する。
比較はstdout文字列やdirectory件数ではなくcanonical component graph digestで行う。

lock更新は通常実装に混載せず、独立IssueとUniversal Reverseを先行させる。更新receiptはsource diff、旧新lock digest、
旧新component graph、SBOM diff、secret/license判定、rollback pointを必須とする。いずれか欠落時は
`HIL_SUPPLY_CHAIN_LOCK_DRIFT`とし、Forward合流を許可しない。

## §5 SBOM・secret・license契約

統合SBOMはNode、Python、生成packageを同じrun IDへ束ね、各componentにecosystem、name、version、artifact digest、
package URL相当のstable identity、direct/transitive区分、source/lock relation、license expressionを持たせる。
resolved graphの全componentがSBOMへexactly onceで対応し、余剰・欠落・identity conflictをgreenにしない。SBOM形式は
実装PLANでschema versionを固定し、形式変更は同一component graphからの決定的再生成とschema migration evidenceを要する。

secret scanはsource、manifest/lock、dependency material、生成package、SBOM/evidenceを対象にする。receiptへ保存するのは
scanner/policy version、対象digest、finding count、redacted fingerprint、判定だけとし、検出値やcredential本文を保存しない。
finding 1件以上は`HIL_SUPPLY_CHAIN_SECRET_FOUND`でfail-closeする。

license policyはSPDX相当のexpressionをcomponent単位で正規化し、`allowed / review_required / prohibited / unclassified`を返す。
`unclassified`と`prohibited`はgreen禁止、`review_required`は承認evidenceが同じcomponent identityとpolicy revisionへbindした場合だけ
通過できる。承認が認証・配布・ライセンス判断を伴う場合は人へescalateし、AIの自己承認を許可しない。

## §6 evidence bundleとfailure契約

`.helix/evidence/os-supply-chain/<run_id>/`を実装時の候補rootとし、次を同一root digestへbindする。

全artifactは同じtyped `CommonProvenanceEnvelope`を持つ。envelopeはrun/snapshot ID、commit/tree digest、fixture/difference
revision、resolver/scanner/schema/tool/package/root/approval digest、created_at/fresh_untilを必須とし、matrixとsupply-chain receiptの
envelope digestをexact joinする。runまたはsnapshotが異なる結果の寄せ集め、期限切れ、field欠落、root digestだけ一致する別内容を拒否する。

| artifact | 必須内容 |
|---|---|
| `os-matrix.json` | OS、arch、profile、fixture ID、result、failure code、difference manifest revisionを記録 |
| `environment.json` | Node/Python/SQLite/package manager/scanner version、clean/offline識別 |
| `dependency-graphs.json` | Node/Python online/offline graph digest、lock digest、component countを記録 |
| `sbom.json` | schema version、全component identity、root digest |
| `policy-receipt.json` | secret finding count、license分類count、policy/scanner digest、承認参照 |
| `package-receipt.json` | Node package、wheel/sdist、artifact digest、再生成比較 |
| `completion-receipt.json` | command、exit code、stdout/stderr digest、全artifact digest、最終decision |

completion gateはOS matrixとsupply-chain receiptを同一run/snapshot/envelopeへjoinしてから判定する。provenance fieldを一つでも
mutationした場合、matrix単独greenまたはsupply単独greenを再利用せずcompletion 0とする。

生のsecret、credential、PII、未redact scanner出力、依存source本文はbundleへ保存しない。既知failureは次で固定する。

| code | 条件 | 完了への影響 |
|---|---|---|
| `HIL_LINUX_COMPLETION_MISSING` | Linux full未実行またはfacet欠落 | 全profile完了を拒否 |
| `HIL_OS_ADAPTER_LEAK` | adapter外platform分岐 | HAC-HIL-14bを拒否 |
| `HIL_OS_CONTRACT_DIFFERENCE_UNDECLARED` | manifest外差分 | 対象profileを拒否 |
| `HIL_OS_PATH_CONTRACT_VIOLATION` | path/case/Unicode/symlink/permission異常 | 対象profileを拒否 |
| `HIL_OS_PROCESS_CONTRACT_VIOLATION` | cancel/signal/child cleanup異常 | 対象profileを拒否 |
| `HIL_OS_LOCK_CONTRACT_VIOLATION` | atomic file/lock/SQLite異常 | 対象profileを拒否 |
| `HIL_SUPPLY_CHAIN_LOCK_DRIFT` | lock/manifest/graph/rollback evidence不整合 | mergeを拒否 |
| `HIL_SUPPLY_CHAIN_OFFLINE_MISMATCH` | network attemptまたはonline/offline graph差分 | HAC-HIL-14cを拒否 |
| `HIL_SBOM_COMPONENT_MISSING` | resolved componentのSBOM欠落・重複 | HAC-HIL-14cを拒否 |
| `HIL_SUPPLY_CHAIN_SECRET_FOUND` | scan findingあり | mergeを拒否 |
| `HIL_SUPPLY_CHAIN_LICENSE_UNCLASSIFIED` | 未分類licenseあり | mergeを拒否 |
| `HIL_SUPPLY_CHAIN_LICENSE_PROHIBITED` | 禁止licenseまたは承認欠落 | mergeを拒否 |

## §7 L8 oracleへの双方向trace

| L5境界 | exact L8 oracle |
|---|---|
| Linux全OS facetとLinux必須完了 | `IT-OSSC-001` |
| macOS同一fixtureと期待差分manifest | `IT-OSSC-002` |
| Windows native同一fixtureと期待差分manifest | `IT-OSSC-003` |
| adapter外platform分岐0 | `IT-OSSC-004` |
| canonical Node/Python lockとonline graph | `IT-OSSC-005` |
| offline network 0とgraph/package同一性 | `IT-OSSC-006` |
| Node/Python/生成package統合SBOM | `IT-OSSC-007` |
| source/dependency/packageのsecret/license fail-close | `IT-OSSC-008` |
| common provenance envelopeとmatrix/supply同一snapshot join | `IT-OSSC-009` |

## §8 freeze条件

L5/L8 pairは`IT-OSSC-001`、`IT-OSSC-002`、`IT-OSSC-003`、`IT-OSSC-004`、`IT-OSSC-005`、
`IT-OSSC-006`、`IT-OSSC-007`、`IT-OSSC-008`、`IT-OSSC-009`の設計レビュー、全failure fixture、evidence schema、別runtime reviewが
揃うまでdraftとする。実行時は9件すべてのgreenが必要であり、処理量削減、sample化、known failureの無期限隔離を認めない。

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

common provenanceはtrusted producer registry、registered receipt、current anchor storeに固定する。caller envelope、未知producer、
未登録receipt、stale store headはcompletion input 0とし、unit 13件／integration 9件を正規分母とする。
