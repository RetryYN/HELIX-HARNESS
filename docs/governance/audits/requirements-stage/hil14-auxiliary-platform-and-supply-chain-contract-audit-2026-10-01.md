# HIL-14旧補助contractのplatform adapter・supply-chain条件監査

## 対象と照合基準

対象は旧`HR-FR-HIL-14` rev 1、`HAC-HIL-14a/b/c`、`HAT-HIL-14`、およびこれらの条件を展開したassertion/L6 function・test consumerである。親contractの6 requirement atomと三つのacceptanceを混同せず、HATの合成条件を別に照合する。24親contract全体、旧source全件の完了、実装・実行・releaseは判定しない。

現行比較基準は`origin/main` commit `ccd0f0e8d4d0e2ba875566609fd3302f3d1317d6`（#2444 read-after後）。同mainにはHIL-14cだけを対象にした[scope判断フレーム](hil14c-online-offline-lock-sbom-policy-scope-frame-2026-09-29.md)（file SHA-256 `74f9f8c872f9a47ba1a33712dd35a9b49b255e399e3f6613596f545e15e636c2`）と、親contract別の[補助IR再照合](legacy-auxiliary-contract-refinement-recheck-2026-09-28.md#L47)がある。フレームは採択・PO判断ではなく、14cの製品scope/repository受入scopeも未決としている。mainにはHIL-09〜13の限定監査があり、HIL-14全条件の専用auditは見当たらない。広域再照合の表だけでは旧consumer全条件と現行authorityの更新差分を確認できないため、この記録を追加する。

本体8機構の2026-09-28 decision recordが固定するL2/L11と明示候補集合、以降の2026-09-29 57件/11件、2026-09-30 live26のPO判断を確認した。判断対象のrevisionを固定するPO recordだけが対象意味のauthorityであり、source metadata、候補本文、MPR、PR履歴または旧test設計から採択を推定しない。旧source・旧test/runtime/CIは読取専用とし、実行していない。

## 旧source pinとauthority

旧JSONの実bytes SHA-256を再計算し、既存scope frameとcurrent carry-forwardのpinに一致した。

| source | identity・状態 | file SHA-256 / semantic digest |
|---|---|---|
| contract | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-14`; `specified` | `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab` / `d771b46b60a9f269213b4f08a3aca8823450f4dc38ddca9895228c8dfbdd5f99` |
| positive HAC | `requirements-ir/acceptance_cases.json#/HAC-HIL-14a`; `specified` | `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19` / `54d144fd7096197c42358ee06f4f19f4a34e05864123650ea165895f00c75cda` |
| negative HAC | `acceptance_cases.json#/HAC-HIL-14b`; `specified` | same file / `b1c43b94fd86e71efce9eb71a0e1ea8b4cd2b7e5350646b29ecc04c3ca9e8509` |
| boundary HAC | `acceptance_cases.json#/HAC-HIL-14c`; `specified` | same file / `e1e76253b2538bf9c9f7e246aa14fcfafb483efad8a58e2f66f5d010090bf3d0` |
| parent system test | `requirements-ir/system_tests.json#/HAT-HIL-14`; `designed_not_implemented` | `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a` / `465cd7dd4729b9a5911ab74f77dc20a9faa95a54d20db1170cd80e856f3017eb` |
| source requirement IR | `requirements-ir/requirements.json` rows below | `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` |

The IR chain is `HIL-FR-34 + HIL-TR-04/05/06 + HIL-NFR-09/19 → HR-FR-HIL-14 → HAC-HIL-14a/b/c → HAT-HIL-14`. Requirement statement digests, from the same pinned IR, are:

| atom | digest | source meaning retained for comparison |
|---|---|---|
| `HIL-FR-34` | `427b87551182dc6c28a31d4f9617b0625120b63e983b25663da667e3a404676a` | 同一fixtureでpath separator/case/space/Unicode/permission/symlink/signal/process group/file lock/SQLite/executable discoveryをLinux/macOS/Windows adapterへ適用し、OS contract resultとadapter violationを返す。 |
| `HIL-TR-04` | `cdfeddca01d916f1241f11f4c74fe2dcf85e1b95ea8723633e912c1e6a09420b` | Linuxをprimary、macOSをportable、Windowsをcompatibility profileとする。WSL/Git Bash/PowerShellをcore前提にしない。 |
| `HIL-TR-05` | `472de11079841e874b39bc1170b95a07805818e7c31178541f8929560e2f6567` | path/process/signal/file lock/SQLite/executable discoveryをadapterへ隔離し、Linux CIを基準、macOS/Windows smokeを互換性証拠とする。 |
| `HIL-TR-06` | `0948d379b01567c2405bb4c61992b5a48423872c629c05d734e9aae523269e94` | Node/Python dependency lockとruntime version、offline/clean install、SBOM/secret/license検査を再現可能にする。 |
| `HIL-NFR-09` | `bd7c0c8c513f62da48ab6a012a04c35431b32ae1623e880ad1a2c26c33b2350d` | Linuxでcore gateを実行し、macOS/Windows差異をadapter contract testで検出する。OS別domain logic forkを作らない。 |
| `HIL-NFR-19` | `07cc796cd8d1ebc6ed1164f6c96551a811b4bca04caa94e51a451155df9fddc7` | 未実施のmacOS portable/Windows compatibility scopeを明示し、Windows wrapperのpassをLinux互換証拠にしない。 |

The final digest above is a source statement digest; the carry-forward row digest is `8fc272e3889410eca6fec14ded32b6ad196828355f6edd0fc9e247cb0efa21b2`. The six IDs in `legacy-requirement-carry-forward.jsonl` (file SHA-256 `51ae96d3fd27cc4aaa6e445c27ff0c6f175199cae09efe4e1566b73c1e8019b0`) each remain `preserved_pending_rehome`, have `requirement_change_authority: explicit_human_decision_only`, empty `successor_requirement_ids`, and no `decision_record`. The supplementary ledger (SHA-256 `1a0591e1da6f9579d970aedfccff90ac6a8e1aefbbe0f4047e3aeb950a8449bb`) separately retains contract item `REQSRC-SUP-00621`, HAC items `REQSRC-SUP-00561..563`, and HAT item `REQSRC-SUP-00645` as `preserved_pending_rehome` / `unmapped`; HAT remains `designed_not_implemented`. Asset ledger path and source pins recorded by the existing 14c frame are `LEGACY-ASSET-67761C517521603F844C` (contract), `LEGACY-ASSET-4886CEF2A7AB5B7AA5C8` (HAC), `LEGACY-ASSET-F7A988C2531DEAC3D23B` (HAT), and `LEGACY-ASSET-A60CF91DD2AF6693E6F9` (requirement IR).

## Legacy consumer and oracle pins

The following archived consumers state how the old contract was meant to be made observable. Their statuses are design-only; source hashes are not implementation or run receipts.

| consumer | pin | bounded reading |
|---|---|---|
| Assertion matrix | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:121-127,139-144`; asset `LEGACY-ASSET-7B1C7AED3AA401868455`; file SHA-256 `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8` | HST-CASE-014-01..03 separately require Linux full, macOS portable, Windows compatibility results; 014-04..07 cover adapter leak, root-escaping symlink, process cancellation and SQLite lock timeout. HST-CASE-017-01..06 cover online install, offline network=0/same digest, missing SBOM component, secret, unclassified license, and lock drift. Every row says `not-implemented`. |
| Function design | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/os-portability-supply-chain.md`; asset `LEGACY-ASSET-9A01A0B72DB343D5859E`; file SHA-256 `b9976277c2d025b9ab0ae9454be97b679416e44823198d41b9b4aae127ffbc66` | Draft design distinguishes adapter-only OS differences, same-fixture profile matrix, offline-install parity, complete unified SBOM and secret/license policy receipt. It names `verifyOfflineInstallParity`, network attempt count 0, cache-miss fail-close, and separate OS/supply-chain completion decisions. These are old design details, not current adopted schema. |
| Unit test design | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-os-portability-supply-chain-unit-test-design.md`; asset `LEGACY-ASSET-A1F623AB6959223426DA`; file SHA-256 `947ac36e26182e6818db8f8d9f6f83694a00850ee4e1b33018b3fc64c6b7bf67` | Draft U-OSSC-002..006 preserve path/filesystem, process, lock/SQLite and domain-fork negative oracles; U-OSSC-007..011 preserve lock drift/offline mismatch/SBOM omission/secret/license-unclassified failures; U-OSSC-012 blocks completion when a required profile or evidence is missing. |

HAT-HIL-14 names HST-HIL-014 and HST-HIL-017, scenario `3 OS contractとsupply chainを検証`, and required evidence `OS matrix、offline digest、SBOM/secret/license`. The sibling acceptance cases are not interchangeable: 14a is the declared platform-profile positive condition, 14b is adapter/platform failure rejection, and 14c is online/offline supply-chain parity. The old source does not supply evidence that any design case ran or passed.

## Current adopted L2/L11 neighbors and later decisions

Current complete-file hashes at the comparison HEAD:

| owner | L2 / L11 identity and pin | adopted scope relevant here | boundary against HIL-14 |
|---|---|---|---|
| HELIX-OS | `governance-requirements.md` SHA-256 `bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf`; `governance-acceptance.md` SHA-256 `cd0e750cab9e694eed060a619d50527239e1b1291b9550cc0c95dbbd486c7112`; L2/L11-020 at `:692-700` / `:359-364`, L2/L11-021 at `:702-710` / `:366-371` | PO decision `helix-os-requirements-po-decision-2026-09-28.md` (SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`) includes OS-020/021 in its adopted explicit set `014–029`. 020 assembles/runs the selected CI profile and preserves run status; 021 handles selected HARNESS configuration delivery/update/recovery to target projects. | 020 does not declare Linux/macOS/Windows product support tiers or add old adapter oracle. 021 concerns selected configuration distribution, not a 3-OS product guarantee or online/offline dependency parity. |
| HELIX-HARNESS | `product-requirements.md` SHA-256 `78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6`; `product-acceptance.md` SHA-256 `a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e`; L2/L11-005 at `:118-121` / `:25`, L2/L11-022 at `:447-462` / `:217-218` | PO decision `helix-harness-requirements-po-decision-2026-09-28.md` (SHA `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`) fixes HARNESS's adopted set. 005 owns verification obligations, expected failures, evidence and return paths; 022 owns staged verification/acceptance contract. | These let the chosen task/structure specify its oracle and evidence; neither decision adds this old 3-OS matrix, adapter fixture set, lock/SBOM/policy parity condition, nor the HIL-14 parent HAT. |
| HELIX-SECURITY | `security-requirements.md` SHA-256 `d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5`; `security-acceptance.md` SHA-256 `e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556`; L2/L11-005, 008, 012 at L2 `:110-147,180-188` / L11 `:29,32,36` | PO decision `helix-security-requirements-po-decision-2026-09-28.md` (SHA `7ad58a3f7d7dd68806e6eeb2c4b6ec97f9b8f2145ae9aae7969f1eedf4a7baff`) includes credential/operation authority/provenance conditions. | Security preserves secrets, scoped operation authority and supply-chain provenance. Provenance fields do not establish 3-OS support scope, adapter parity, reproducible clean/offline installation, SBOM completeness, or a license policy gate. |

The exact-source decisions are not broadened by the later PO records. A search for `HR-FR-HIL-14`, `HAC-HIL-14a/b/c`, `HIL-FR-34`, `HIL-TR-04/05/06`, and `HIL-NFR-09/19` in `po-decision-2026-09-29-57candidates.md` (SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`), `po-decision-2026-09-29-11candidates.md` (SHA `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`), and `po-decision-2026-09-30-live26.md` (SHA `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`) found no explicit HIL-14 adoption, scope decision, successor assignment or closure. This exact-ID check does not assert a repository-wide decision census.

The 2026-09-26 Worker execution model decision (SHA `1c93bf0aadccfdf6b536a32d3923a17fbd00a1fd830850f9369b5b6d6b12efb2`) places execution/start-stop/result collection/evidence with Worker and contract meaning/OS-difference acceptance with HELIX-HARNESS verification contract. It explicitly avoids a standalone OS owner based only on generic evidence storage. This responsibility split informs candidate routing only; it assigns no HIL-14 successor or adoption.

## 条件別negative oracle残差

| 条件 | 旧positive/negative oracle | 現行L2/L11との関係 | 残差とauthority状態 |
|---|---|---|---|
| HAC-HIL-14a / 3 OS scope | Linux full、macOS portable、Windows compatibilityを別profileとして定義scopeでgreenにする。未実施profileを明示し、wrapper passを他OS証拠にしない。 | OS-020は選択profile・HEAD・oracle・environment/runの束縛と状態区別、HARNESS-005/022は必要義務・oracle・段階証拠を扱う。 | 採択済み要求はどのHELIX-HARNESS製品・対象projectにどのsupport tierを保証するか決めない。Linux/macOS/Windowsを本体製品の必須保証へ拡張するscopeはPO未決。3 profileがgreenになったという実行証拠もない。 |
| HAC-HIL-14b / adapter負境界 | adapter leak、root外symlink/write、process cancel後の子process残存、lock/SQLite timeoutでpartial transactionがないこと。旧HIL-FR-34にはcase/Unicode/permission/executable discoveryもある。 | HARNESS-005は選択された構造に固有のexpected failureを要求でき、OS-020は実行結果を区分できる。SECURITY-007/008の実行制約・authorityは適用operationを守る。 | 現行採択L2/L11に、このplatform fixture群、domain fork=0 oracle、adapter違反のfailure taxonomyは特定されない。general expected-failure契約を旧failure一式の採択としない。技術方式とsupport scopeも未決のまま。 |
| HAC-HIL-14c / online-offline parity | 同一canonical lock/graph・policy・SBOM、offline network attempt 0、online/offline digest一致。負例はcache miss、artifact/lock drift、SBOM component欠落、secret、unclassified/prohibited license。 | HARNESS-005/022は選択義務・受入証拠、OS-020は実行、OS-021は選択HARNESS構成配布、SECURITY-012はsource/provenance/digest/dependency等の追跡を担う。 | いずれもonline/offline同一lock/SBOM/policyを要求しない。既存scope frameのA/B/C/DのいずれもPO選択されず、推奨Dは判断ではない。14cの対象scopeも未決。 |
| HAT-HIL-14 / 合成 | OS matrix、offline digest、SBOM/secret/license evidenceを結び、adapter leak/process/lock/unlock/policy違反を拒否する。 | 採択済みunit/contract neighborsのreceiptは選択された各構造の証拠である。HARNESS-L2-005/022は上位構成体固有のoracle/evidenceを下位unit passから自動推定しない。 | 現行の承認済みcomposite identityと対応L11で3条件を一括受け入れた証拠は確認できない。HATは旧source上も`designed_not_implemented`。HATの実行/green、現行composite acceptance、formal successorはいずれも未確認/未割当。 |

## 限定結論と停止境界

HIL-14はHIL-13の次に行う補助contract監査対象として妥当である。最新mainにはHIL-14cのscope判断フレームが既にあるため本監査はこれを再提案せず、14a/bのsupport-tier・adapter oracleと、14a/b/cを束ねるHATの合成条件を追加照合した。旧条件には具体的な正常・失敗fixtureがあるが、それらはarchiveの未実装consumerであり、新世代で採択された条件でも実績でもない。

本記録は候補/L2/L11の追加・採択、product scope決定、formal successor/owner割当、source meaning変更/retire、旧holding解除をしない。六つの旧IR要求と補助sourceは`preserved_pending_rehome`、後継IDなしのまま保持する。現行の隣接L2/L11が有効な運転・authority・provenance責務を持つことと、HIL-14の要求意味/negative oracleが合成済みであることを分ける。旧test/runtime/CI、新世代CIはいずれも実行していない。実装、OS互換実績、SBOM/license/secret pass、L11受入、HIL-14またはStep5閉包を主張しない。

静的照合範囲は旧JSONのfile SHAとtyped IDs/status、IR atomとHAC/HAT link、carry-forward rows、旧assertion/L6 consumer pins、現行採択L2/L11のID/内容/PO記録、later PO recordsへのexact-ID検索、既存HIL-14c frameとの基準差分である。
