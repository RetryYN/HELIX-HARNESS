# HIL-14旧補助contractのplatform adapter・supply-chain条件監査

## 対象と照合基準

対象は旧`HR-FR-HIL-14` rev 1、`HAC-HIL-14a/b/c`、`HAT-HIL-14`、およびこれらの条件を展開したassertion/L6 function・test consumerである。親contractの6 requirement atomと三つのacceptanceを混同せず、HATの合成条件を別に照合する。24親contract全体、旧source全件の完了、実装・実行・releaseは判定しない。

現行比較基準は`origin/main` commit `ccd0f0e8d4d0e2ba875566609fd3302f3d1317d6`（#2444 read-after後）。同mainにはHIL-14cだけを対象にした[scope判断フレーム](hil14c-online-offline-lock-sbom-policy-scope-frame-2026-09-29.md)（file SHA-256 `74f9f8c872f9a47ba1a33712dd35a9b49b255e399e3f6613596f545e15e636c2`）と、親contract別の[補助IR再照合](legacy-auxiliary-contract-refinement-recheck-2026-09-28.md#L47)がある。フレームは採択・PO判断ではなく、14cの製品scope/repository受入scopeも未決としている。mainにはHIL-09〜13の限定監査があり、HIL-14全条件の専用auditは見当たらない。広域再照合の表だけでは旧consumer全条件と現行authorityの更新差分を確認できないため、この記録を追加する。

本体8機構の2026-09-28 decision recordが固定するL2/L11と明示候補集合、以降の2026-09-29 57件/11件、2026-09-30 live26のPO判断を確認した。判断対象のrevisionを固定するPO recordだけが対象意味のauthorityであり、source metadata、候補本文、MPR、PR履歴または旧test設計から採択を推定しない。旧source・旧test/runtime/CIは読取専用とし、実行していない。

## 旧sourceの来歴pinとauthority状態

旧JSONの実bytes SHA-256を再計算し、既存scope frameとcurrent carry-forwardのpinに一致した。

| 区分 | identity・状態 | file SHA-256 / semantic digest |
|---|---|---|
| system contract | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-14`; `specified` | `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab` / `d771b46b60a9f269213b4f08a3aca8823450f4dc38ddca9895228c8dfbdd5f99` |
| 正方向HAC | `requirements-ir/acceptance_cases.json#/HAC-HIL-14a`; `specified` | `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19` / `54d144fd7096197c42358ee06f4f19f4a34e05864123650ea165895f00c75cda` |
| 負方向HAC | `acceptance_cases.json#/HAC-HIL-14b`; `specified` | 同一file / `b1c43b94fd86e71efce9eb71a0e1ea8b4cd2b7e5350646b29ecc04c3ca9e8509` |
| 境界HAC | `acceptance_cases.json#/HAC-HIL-14c`; `specified` | 同一file / `e1e76253b2538bf9c9f7e246aa14fcfafb483efad8a58e2f66f5d010090bf3d0` |
| 親system test | `requirements-ir/system_tests.json#/HAT-HIL-14`; `designed_not_implemented` | `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a` / `465cd7dd4729b9a5911ab74f77dc20a9faa95a54d20db1170cd80e856f3017eb` |
| 要求IR source | `requirements-ir/requirements.json`の以下6行 | `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` |

旧IRの関係は`HIL-FR-34 + HIL-TR-04/05/06 + HIL-NFR-09/19 → HR-FR-HIL-14 → HAC-HIL-14a/b/c → HAT-HIL-14`である。同じpinを持つ要求statement digestは次のとおり。

| 旧要求ID | statement digest | 比較対象として保持する意味 |
|---|---|---|
| `HIL-FR-34` | `427b87551182dc6c28a31d4f9617b0625120b63e983b25663da667e3a404676a` | 同一fixtureでpath separator/case/space/Unicode/permission/symlink/signal/process group/file lock/SQLite/executable discoveryをLinux/macOS/Windows adapterへ適用し、OS contract resultとadapter violationを返す。 |
| `HIL-TR-04` | `cdfeddca01d916f1241f11f4c74fe2dcf85e1b95ea8723633e912c1e6a09420b` | Linuxをprimary、macOSをportable、Windowsをcompatibility profileとする。WSL/Git Bash/PowerShellをcore前提にしない。 |
| `HIL-TR-05` | `472de11079841e874b39bc1170b95a07805818e7c31178541f8929560e2f6567` | path/process/signal/file lock/SQLite/executable discoveryをadapterへ隔離し、Linux CIを基準、macOS/Windows smokeを互換性証拠とする。 |
| `HIL-TR-06` | `0948d379b01567c2405bb4c61992b5a48423872c629c05d734e9aae523269e94` | Node/Python dependency lockとruntime version、offline/clean install、SBOM/secret/license検査を再現可能にする。 |
| `HIL-NFR-09` | `bd7c0c8c513f62da48ab6a012a04c35431b32ae1623e880ad1a2c26c33b2350d` | Linuxでcore gateを実行し、macOS/Windows差異をadapter contract testで検出する。OS別domain logic forkを作らない。 |
| `HIL-NFR-19` | `07cc796cd8d1ebc6ed1164f6c96551a811b4bca04caa94e51a451155df9fddc7` | 未実施のmacOS portable/Windows compatibility scopeを明示し、Windows wrapperのpassをLinux互換証拠にしない。 |

上表の最終digestはsource statementの値で、carry-forward台帳rowのdigestは`8fc272e3889410eca6fec14ded32b6ad196828355f6edd0fc9e247cb0efa21b2`である。`legacy-requirement-carry-forward.jsonl`（file SHA-256 `51ae96d3fd27cc4aaa6e445c27ff0c6f175199cae09efe4e1566b73c1e8019b0`）の6 IDはすべて`preserved_pending_rehome`であり、`requirement_change_authority: explicit_human_decision_only`、空の`successor_requirement_ids`、nullの`decision_record`を持つ。補助source台帳（SHA-256 `1a0591e1da6f9579d970aedfccff90ac6a8e1aefbbe0f4047e3aeb950a8449bb`）は、contractの`REQSRC-SUP-00621`、HACの`REQSRC-SUP-00561..563`、HATの`REQSRC-SUP-00645`を別項目として`preserved_pending_rehome`／`unmapped`で保持し、HATは`designed_not_implemented`のままである。既存14c frameに記録された資産台帳IDは、contractが`LEGACY-ASSET-67761C517521603F844C`、HACが`LEGACY-ASSET-4886CEF2A7AB5B7AA5C8`、HATが`LEGACY-ASSET-F7A988C2531DEAC3D23B`、要求IRが`LEGACY-ASSET-A60CF91DD2AF6693E6F9`。

## 旧consumerとoracleのsource pin

次のarchive consumerは旧contractの観測方法を設計している。状態は設計に限られ、source hashは実装または実行receiptではない。

| consumer | source pin | 対象を限定した読み取り |
|---|---|---|
| assertion matrix | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:121-127,139-144,389,405-406,417,420,430`; asset `LEGACY-ASSET-7B1C7AED3AA401868455`; file SHA-256 `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8` | HST-CASE-014-01..03はLinux full、macOS portable、Windows compatibilityの結果を個別に要求し、014-04..07はadapter漏出、root外symlink、process cancel、SQLite lock timeoutを扱う。HST-CASE-017-01..06はonline install、offlineでnetwork attempt 0かつdigest一致、SBOM component欠落、secret、license未分類、lock driftを扱う。各行の状態は`not-implemented`。 |
| L6 function design | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/os-portability-supply-chain.md:226-231`; asset `LEGACY-ASSET-9A01A0B72DB343D5859E`; file SHA-256 `b9976277c2d025b9ab0ae9454be97b679416e44823198d41b9b4aae127ffbc66` | HST-caseからIT-OSSCとU-OSSCへの対応表を置く。`verifyOfflineInstallParity`、network attempt 0、cache miss fail-close、OS completion条件とsupply-chain completion条件の分離を記述する。旧design詳細であり、現行採択schemaではない。 |
| L6 unit test design | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-os-portability-supply-chain-unit-test-design.md:30-47`; asset `LEGACY-ASSET-A1F623AB6959223426DA`; file SHA-256 `947ac36e26182e6818db8f8d9f6f83694a00850ee4e1b33018b3fc64c6b7bf67` | U-OSSC-002..006はpath/filesystem、process、lock/SQLite、domain forkの負境界を、007..011はlock drift/offline mismatch/SBOM欠落/secret/license未分類を個別に置く。012は必要profile/evidence欠落をcompletionで拒否し、013はprovenance/freshness joinを扱う。いずれも旧test設計である。 |
| L5 integration test design | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-os-portability-supply-chain-integration-test-design.md:37-50`; asset `LEGACY-ASSET-4B25EFA1E3D3BDA3DCF8`; file SHA-256 `fe8a08a9a251c86b1ec295d3d4c40f4055020b79a987f8e88d6569c47ff1e0d5` | IT-OSSC-001..009をOS matrix、adapter leak、online/offline install、SBOM/policy、provenance joinへ結び、9件すべての実行とnegative oracle assertionを旧L8 closure条件として記す。設計statusは`draft`で、実行済み証拠ではない。 |

HAT-HIL-14はsupporting testとしてHST-HIL-014とHST-HIL-017を挙げ、scenarioを`3 OS contractとsupply chainを検証`、必要証拠を`OS matrix、offline digest、SBOM/secret/license`とする。兄弟acceptanceは同一視できない。14aは宣言scopeのplatform profileが成立する正条件、14bはadapter/platform異常を拒否する条件、14cはonline/offline supply-chain parity条件である。旧sourceには、いずれかの設計caseが実行またはpassした証拠はない。

### assertion caseと旧consumer oracleの対応

assertion matrixの同じfile SHA `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8`にある後続行（lines 389, 405-406, 417, 420, 430）は、既存scope frameが引用した014-01..07/017-01..06を追加のfailure/evidence条件で細分する。L6 function design lines 226-231はそのcaseから9つの旧L5 integration caseとL6 unit oracleへedgeを張り、L5 integration design lines 49-50は9件すべてを実行する旧closure条件を明記する。以下はsource上の対応であり、case実行の報告ではない。

| assertion case / 旧requirement | assertion oracle | 旧L5 / L6のedge | HIL-14範囲との境界 |
|---|---|---|---|
| HST-CASE-014-08 / HIL-FR-34 | 共通OS edge fixtureで3 profileへ適用し、domain logic漏出があれば`HIL_OS_CONTRACT_VIOLATION` | IT-OSSC-001 / U-OSSC-012 | 14a/14bを結ぶ旧composite oracle。適用範囲・runtime実績は未確認。 |
| HST-CASE-014-09 / HIL-TR-04 | profile順位をLinux full / macOS portable / Windows compatibilityに一致させ、不一致を`HIL_OS_PRIORITY_INVALID` | IT-OSSC-001 / U-OSSC-001 | 三OSのtier意味を明示する旧境界。現行製品support scopeの採択とは別。 |
| HST-CASE-014-10 / HIL-NFR-09 | Linux fullと二つのcompatibility profileを同一contractで比較し、domain logic forkを`HIL_OS_LOGIC_FORK` | IT-OSSC-004 / U-OSSC-006 | domain code内OS分岐を拒否する旧負条件。 |
| HST-CASE-014-11 / HIL-NFR-19 | Linux未実行でWindows wrapperだけgreenなら、`HIL_LINUX_COMPLETION_MISSING`でcompletionを拒否 | IT-OSSC-001 / U-OSSC-012 | 異OS wrapperの結果からLinux completionを推定しない旧負条件。 |
| HST-CASE-017-07 / HIL-TR-06 | clean/offline install、version再現、統合SBOM、secretゼロ、license policy適合を結び、`HIL_SUPPLY_CHAIN_NOT_REPRODUCIBLE` | IT-OSSC-005 / U-OSSC-012 | HIL-14内のsupply-chain composite条件。017-01..06の個別install/policy oracleと合成する旧design。 |
| HST-CASE-017-08 / HIL-NFR-06 | 高影響operationのapproval欠落時、`HIL_ACTION_BINDING_APPROVAL_MISSING`で適用を拒否 | IT-OSSC-008 / U-OSSC-011 | **HIL-14の6 atom外。** HIL-NFR-06（要求IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`、record digest `78f07fafe80871cc1d10d2ecfbb7e6df9c0f164de45e534117b89442bb9766e5`、statement digest `fb3dadec4964b55ee41b0849950ab28bdcb8808e80d065d38c06bc9ca91bf279`）は`HR-FR-HIL-05`、`HAC-HIL-05c`（acceptance file SHA `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`、semantic digest `d6fdac44f2e4e0925e6fd4c66cd4285a15ab7e138541c59749a928e73e906d88`）、`HAT-HIL-05`（system-test file SHA `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`、semantic digest `cfa8c4c91f550f466e6571851189e1546bde1ad521d92ec535913d655bc18402`）へ属する。HAT-HIL-14がHST-HIL-017をsupporting testとして列挙していても、このcaseをHIL-14 acceptance/atom denominatorへ加算しない。高影響authority条件の旧oracleとして関連を保持するだけで、14cのlicense policy境界とも混ぜない。 |

したがって旧HST-HIL-017はHIL-14関連case 017-01..07に加えて、親HIL-05由来の017-08も含む。HIL-14の三HACを全量照合する際は、supporting test identityを介してHIL-NFR-06/HAC-HIL-05cを二重計上せず、HAT-HIL-14へ追加要求を生成しない。

## 現行L2/L11の採択済み隣接条件と後続PO判断

比較HEADにおける現行file全体のSHA-256:

| 所有機構 | L2 / L11 identityとpin | 関連する採択範囲 | HIL-14との境界 |
|---|---|---|---|
| HELIX-OS | `governance-requirements.md` SHA-256 `bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf`; `governance-acceptance.md` SHA-256 `cd0e750cab9e694eed060a619d50527239e1b1291b9550cc0c95dbbd486c7112`; L2/L11-020 at `:692-700` / `:359-364`, L2/L11-021 at `:702-710` / `:366-371` | PO decision `helix-os-requirements-po-decision-2026-09-28.md` (SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`)はOS-020/021を明示採択集合`014–029`に含める。020は選択CI profileを組み立てて運転し、run状態を保持する。021は選択したHARNESS構成のtarget projectへの配布・更新・復旧を扱う。 | 020はLinux/macOS/Windowsの製品support tierを決めず、旧adapter oracleも追加しない。021は選択構成の配布であり、3 OSの製品保証またはonline/offline dependency parityではない。 |
| HELIX-HARNESS | `product-requirements.md` SHA-256 `78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6`; `product-acceptance.md` SHA-256 `a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e`; L2/L11-005 at `:118-121` / `:25`, L2/L11-022 at `:447-462` / `:217-218` | PO decision `helix-harness-requirements-po-decision-2026-09-28.md` (SHA `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`)はHARNESSの採択集合を固定する。005は検証義務・期待failure・証拠・差戻し先を、022は段階別の検証/受入契約を担う。 | 選択したtask/構造にoracleと証拠を定められるが、どちらの判断も旧3 OS matrix、adapter fixture群、lock/SBOM/policy parity、親HIL-14 HATを追加していない。 |
| HELIX-SECURITY | `security-requirements.md` SHA-256 `d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5`; `security-acceptance.md` SHA-256 `e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556`; L2/L11-005, 008, 012 at L2 `:110-147,180-188` / L11 `:29,32,36` | PO decision `helix-security-requirements-po-decision-2026-09-28.md` (SHA `7ad58a3f7d7dd68806e6eeb2c4b6ec97f9b8f2145ae9aae7969f1eedf4a7baff`)はcredential・operation authority・provenance条件を採択している。 | SECURITYはsecret境界、scope付きoperation authority、supply-chain provenanceを保持する。provenance fieldだけでは3 OS support scope、adapter parity、再現可能なclean/offline install、SBOM完全性またはlicense policy gateを確立しない。 |

後続PO recordは、上記の対象source decisionを拡張していない。`po-decision-2026-09-29-57candidates.md`（SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）、`po-decision-2026-09-29-11candidates.md`（SHA `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`）、`po-decision-2026-09-30-live26.md`（SHA `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`）を対象に、`HR-FR-HIL-14`、`HAC-HIL-14a/b/c`、`HIL-FR-34`、`HIL-TR-04/05/06`、`HIL-NFR-09/19`をexact-ID検索したが、HIL-14採択、scope判断、successor割当、closureの明示はなかった。一方、57件判断の53行にある`HELIXOS-L2-030`（`MPR-RC-HELIXOS-L2-030-003`）は保留であり、本体実行OSとconsumer利用先を分け、配布段階と切替条件を確定することを求める。Windowsの即時却下やLinux限定を意味しない。この保留条件はHAC-14aの3 OS scopeを読む際の近接判断であり、HIL-14の採択済みpairまたはformal successorには数えない。このexact-ID検索は全判断記録の網羅的 census を主張しない。

2026-09-26 Worker実行モデル判断（SHA `1c93bf0aadccfdf6b536a32d3923a17fbd00a1fd830850f9369b5b6d6b12efb2`）は、実行の起動/停止・結果回収・証拠をWorker、契約の意味とOS差分の受入をHELIX-HARNESSの検証契約へ置く。汎用証拠保管だけではOSを単独ownerにしない。この責務分離はrouting候補の根拠に限られ、HIL-14のsuccessorや採択を割り当てない。

## 条件別negative oracle残差

| 条件 | 旧positive/negative oracle | 現行L2/L11との関係 | 残差とauthority状態 |
|---|---|---|---|
| HAC-HIL-14a / 3 OS scope | Linux full、macOS portable、Windows compatibilityを別profileとして定義scopeでgreenにする。未実施profileを明示し、wrapper passを他OS証拠にしない。 | OS-020は選択profile・HEAD・oracle・environment/runの束縛と状態区別、HARNESS-005/022は必要義務・oracle・段階証拠を扱う。保留中のOS-030は本体実行OSとconsumer利用先を分けて判断する条件を示すだけで、採択済みpairではない。 | 採択済み要求はどのHELIX-HARNESS製品・対象projectにどのsupport tierを保証するか決めない。Linux/macOS/Windowsを本体製品の必須保証へ拡張するscopeはPO未決。OS-030の保留はWindows即時却下やLinux限定を意味せず、配布段階・切替条件の確定待ちである。3 profileがgreenになったという実行証拠もない。 |
| HAC-HIL-14b / adapter負境界 | adapter leak、root外symlink/write、process cancel後の子process残存、lock/SQLite timeoutでpartial transactionがないこと。旧HIL-FR-34にはcase/Unicode/permission/executable discoveryもある。 | HARNESS-005は選択された構造に固有のexpected failureを要求でき、OS-020は実行結果を区分できる。SECURITY-007/008の実行制約・authorityは適用operationを守る。 | 現行採択L2/L11に、このplatform fixture群、domain fork=0 oracle、adapter違反のfailure taxonomyは特定されない。general expected-failure契約を旧failure一式の採択としない。技術方式とsupport scopeも未決のまま。 |
| HAC-HIL-14c / online-offline parity | 同一canonical lock/graph・policy・SBOM、offline network attempt 0、online/offline digest一致。負例はcache miss、artifact/lock drift、SBOM component欠落、secret、unclassified/prohibited license。 | HARNESS-005/022は選択義務・受入証拠、OS-020は実行、OS-021は選択HARNESS構成配布、SECURITY-012はsource/provenance/digest/dependency等の追跡を担う。 | いずれもonline/offline同一lock/SBOM/policyを要求しない。既存scope frameのA/B/C/DのいずれもPO選択されず、推奨Dは判断ではない。14cの対象scopeも未決。 |
| HAT-HIL-14 / 合成 | OS matrix、offline digest、SBOM/secret/license evidenceを結び、adapter leak/process/lock/unlock/policy違反を拒否する。 | 採択済みunit/contract neighborsのreceiptは選択された各構造の証拠である。HARNESS-L2-005/022は上位構成体固有のoracle/evidenceを下位unit passから自動推定しない。 | 現行の承認済みcomposite identityと対応L11で3条件を一括受け入れた証拠は確認できない。HATは旧source上も`designed_not_implemented`。HATの実行/green、現行composite acceptance、formal successorはいずれも未確認/未割当。 |

## 限定結論と停止境界

HIL-14はHIL-13の次に行う補助contract監査対象として妥当である。最新mainにはHIL-14cのscope判断フレームが既にあるため本監査はこれを再提案せず、14a/bのsupport-tier・adapter oracleと、14a/b/cを束ねるHATの合成条件を追加照合した。旧条件には具体的な正常・失敗fixtureがあるが、それらはarchiveの未実装consumerであり、新世代で採択された条件でも実績でもない。

本記録は候補/L2/L11の追加・採択、product scope決定、formal successor/owner割当、source meaning変更/retire、旧holding解除をしない。六つの旧IR要求と補助sourceは`preserved_pending_rehome`、後継IDなしのまま保持する。現行の隣接L2/L11が有効な運転・authority・provenance責務を持つことと、HIL-14の要求意味/negative oracleが合成済みであることを分ける。旧test/runtime/CI、新世代CIはいずれも実行していない。実装、OS互換実績、SBOM/license/secret pass、L11受入、HIL-14またはStep5閉包を主張しない。

静的照合範囲は旧JSONのfile SHAとtyped ID/status、IR atomとHAC/HAT link、carry-forward台帳、旧assertion/L5/L6 consumerのsource pin、現行採択L2/L11のID/本文/PO record、後続PO record内のexact-ID検索、既存HIL-14c frameとの基準差分である。
