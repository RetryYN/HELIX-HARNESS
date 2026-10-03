# HIL-12旧worker IPC contractの限定条件監査

## 基準と範囲

監査対象は旧補助contract `HR-FR-HIL-12`、対応する`HAC-HIL-12a/b/c`、`HAT-HIL-12`、および`HST-HIL-007`が参照する旧設計・consumer条件である。旧要求atomは`HIL-FR-27`、`HIL-TR-02/07/08/09/10`、`HIL-NFR-14`。24親contract全体、全旧要求の被覆、実装状態、requirements stageの閉包は判定しない。

現行照合基準は`origin/main` `9a2796a74dbc7679782253121d4aeb4fccdc675c`（2026-10-01）。archiveの旧source、旧testとconsumer文書を読むだけで、実行していない。新世代CIも実行していない。

| 旧source | path・位置 | SHA-256 / source ID |
|---|---|---|
| requirement atom | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:117, 179-194` | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; file `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` |
| parent contract | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json:269-293` (`#/HR-FR-HIL-12`) | `LEGACY-ASSET-67761C517521603F844C`; file `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`; contract digest `fe7373f829aaac4acd8a7497c5d27454961c36270d22d2213498b979591619ad` |
| acceptance cases | `archive/legacy-generation-2026-09-14/root/requirements-ir/acceptance_cases.json:365-397` (`#/HAC-HIL-12a/b/c`) | `LEGACY-ASSET-4886CEF2A7AB5B7AA5C8`; file `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19` |
| system test | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_tests.json:219-237` (`#/HAT-HIL-12`) | file `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`; test status `designed_not_implemented` |
| assertion consumer | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:66-77` (`HST-CASE-007-01..12`; supplementary rows at `:384,403,407-409,425`) | `LEGACY-ASSET-7B1C7AED3AA401868455`; file `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8` |
| L5 detailed design consumer | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/python-worker-runtime.md:27-45,55-71,109-151,223-245` | `LEGACY-ASSET-BC2275DCE9BFFCF813C8`; file `4c26544b5cf6e63ed226838ff5e04b3a669f6a9aa13456ffc5e5fb41fc755f8a` |
| L6 design consumer | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/python-worker-runtime.md:26-92` | `LEGACY-ASSET-FA37B89CBB3EBE4E9E8C`; file `f80c88da9c498ef1fa2b4b1ecdbb605951b52a4f435524cb494a5c46382f7d14` |
| test consumer | `archive/legacy-generation-2026-09-14/root/tests/infinity-loop-strict-design-contract.test.ts:297-320` | `LEGACY-ASSET-E4984136A19ADCADF97D`; file `efb2d92201285f249022d3929e4893efc770fbc5fecedc1961419ed6bddaed94` |

旧contractはNode supervisorがPython workerをversioned JSON Lines IPCで管理し、互換protocol・deadline/lease・authority mapのもとでterminal receiptを一つ記録し、schema検証済みresultだけをNode authorityでtransaction commitする要求である。HACは正常result一回commit、IPC異常時のterminal化とpartial result 0、cancel/timeout後のlate resultおよびdirect write拒否を分担する。

HSTの分母は区別する。assertion case台帳の主scenario欄にある`HST-CASE-007-01..12`（同ファイル66–77行目）が12件のruntime scenarioである。同台帳の後段にある`HST-CASE-007-13..18`（384、403、407–409、425行目）はrequirement assertion用の補助6件で、L5/L6のprimary mapping表（L5 223–245行、L6 67–92行）が設計上その18件を主IT/APIへ対応付けている。これら6件を追加のcanonical runtime scenarioとして数えない。全12+6件の各statusは設計上のfixture/期待値であり、実行済み結果ではない。旧testはsource/設計所有関係を静的に検査するコードを含むだけで、本監査では起動していない。

L5設計はauthority・sandbox・partial result・atomic transactionの詳細を示すが、frontmatterと本文は`draft`で、Node/Python/JSONL・schema・write-root・transactionの具体化を記す旧設計である。そのsource statusは保持し、現行要件のsuccessorや承認済み技術設計としては扱わない。特にL5の「Python semantic authority／Node transaction writer」という設計固有の用語を、現行Worker責務やSECURITY authorityの決定へ転記しない。

## 現行authorityとL2/L11照合

現行OS L2/L11の採否は見出しmetadataではなく、`docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md`と対象節で読む。同decisionは固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のOS L2/L11本文に合意し、OS-L2-018/019/020を含む014〜029を明示採択した。現行mainでも対象6節のsection digestは固定revisionと一致する。

| 現行要求対 | 固定L2 section SHA-256 | 固定L11 section SHA-256 | HIL-12との関係・限界 |
|---|---|---|---|
| `HELIXOS-L2-018` | `4ca189ed491490e2ed1ee75095b64d2e294319e6132d4595d631fcd4ba8bc408` | `77e8ef58e9774503379bb3a84a0218fa29dbad536e142122c7bee8e8bc0b1d53` | Worker assignment/attempt、実行停止、成果回収、交代時のhandoff、独立reviewとlease/scopeの追跡をOS運転責務として採択。Node/Python、JSONL protocol、具体supervisor/schemaやworker実装を採択したものではない。 |
| `HELIXOS-L2-019` | `9362a64eef0f04968a8b1e89fde0027a145d5ab5c6aa9a6423d6e05e19ed447a` | `9e17211bf2f7f54a58e2be30e23335954d94e184573912ed4f3ac92246838351` | provenance、event/checkpoint、stale/拒否/未実行と成功の区別、再構築・継続を採択。旧IPC envelopeやprojection schemaそのもののsuccessorとはしない。 |
| `HELIXOS-L2-020` | `fa62debc978fba6f5ab4146c0d3515a7ce7b5b4df3e054bd953b0f55e2f8878a` | `a9e5f9430836d409a7885b548fa8bff7a874184c024e74e28627cb9d7c59c88c` | HARNESSが定めた検証義務の選択・隔離実行・結果回収・再開をOSが運転し、success/fail/denied/skipped/interrupted/staleを区別する。旧worker contract全体、旧schema又はPython方式の受入を意味しない。 |

authority boundaryは採択済み`HELIXSECURITY-L2-008`とその対が持つoperation単位のallow/deny/constrainである（`docs/helix-security/L2-requirements/security-requirements.md:140-148`、L11 `security-acceptance.md:32`）。OSのassignment、実行環境、result receiptは認可正本を代行しない。HARNESSはverification/oracleの意味を持ち、OSは実行を運転する。これらの分担から旧Node/Python通信方式を必須技術として導かない。

2026-09-26の[Worker実行モデルPO判断](../../decisions/worker-execution-model-po-decisions-2026-09-26.md)（SHA-256 `1c93bf0aadccfdf6b536a32d3923a17fbd00a1fd830850f9369b5b6d6b12efb2`、特に§「Workerの置き場所」および「Workerの要求の置き場所」、lines 82–92）はこの分担と直接関係する。Workerは独立機構や共通部品として置かず、共通実行契約をHELIX-OSが持つ。authority・権限制約・隔離条件はSECURITY、実resourceはINFRASTRUCTURE、配置案はINTELLIGENCEに残す。これはHIL-12を読む際の現行owner境界を定める判断であり、旧Python runtime設計の選択や`HR-FR-HIL-12`のformal successor割当、HAT/HST受入実行を行う判断ではない。したがってOS-L2-018の実行責務を踏まえても、旧L5/L6の技術詳細は歴史的な設計資料に留める。

後発判断の55件受領資料自体は判断記録ではない。後続の57候補decision（file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）および11候補decision（`6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`）は、各記録が列挙するexact identity/revisionに限って採否を決めている。2026-09-30 live26 decision（file SHA-256 `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`）も、同記録が固定する26 identityのrevisionに限る。同記録の明示対象は[26 identity索引](po-decision-ready-index-unclassified-live-26-2026-09-29.md)（SHA-256 `1630f6bb213bf5812e82e63e5920d8cacb9db343e62afc0abfd63050f7518035`）で固定されている。該当decision table/indexに`HR-FR-HIL-12`、`HAC-HIL-12a/b/c`、`HAT-HIL-12`またはOS-L2-018/019/020をHIL-12のformal successorへ結ぶidentityはない。従って、これらの判断から直接formal successorは生じない。一方、次の採択pairはHAC-HIL-12b/cおよび旧HIL-FR-27へ関連する近接条件として記録する。MPR register bytesはSHA-256 `ada29e38e99bef16d1c68324129be1519723090cbcc910b50f4c5d47387c626a`。

| 後発採択pair | 決定・MPR pin | 採択対象L2/L11 pin | HIL-12への限定的な近接と非successor境界 |
|---|---|---|---|
| `HELIXSECURITY-L2-031` | 57候補decision line 90；MPR register line 501 `MPR-RC-HELIXSECURITY-L2-031-001`, candidate digest `db2fd29654cc210b3c06568f4e421560b069d36f8d69f04fbe413d83ad532765` | L2 file `d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5`; L2 digest above. L11 file `e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556`; section digest `858ca59ad817afe5d81dbb3f6e8c6176f61e5cff49570c4efcb39dfa469f852a` | HAC-12b/cのuntrusted proposal、canonical evidenceへ直接read/write到達させない境界に近い。ただしL2-031はL2-029の主Worker契約外の**追加runtimeだけ**を対象とし、通常の主Workerへ拡張しない。HIL-12の旧Python workerを追加runtimeとみなす根拠にはせず、Node/Python/JSONL、terminal receipt、partial-write全体のsuccessorや合成受入にしない。 |
| `HELIXSECURITY-L2-033` | 57候補decision line 92で`MPR-RC-HELIXSECURITY-L2-033-002`を採択、line 124でP0 L11追補を追加採択。MPR register line 571、candidate digest `b486a0c44e8f21a6f8738dedeac91dcb94da335b73409b6adeaecf8fa639bf1a` | L2 file `d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5`; L2 digest above. L11 file `e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556`; section digest `6d83abe63e3e852d58d9a9a60ae39c6b29284b6b8ab781bdb86456e479e60be0`; adopted P0 L11 addendum digest `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6` | external AI Workerのassignment/scope/HEAD/authority bindingと出力非権威性がHAC-12b/cの未検証result・direct write拒否へ近い。MPR -002のP0訂正はraw secret値・secret/機密内容の受渡しと、既存L2-005の限定credential-use capabilityを区別し、認証付きoperationを一律denyしない。これは旧HIL-12のcommit/IPC oracle全体を定めず、HR-FR-HIL-12/HAC/HATのformal successorでもない。 |
| `HELIXOS-L2-040` | 57候補decision line 63；MPR register line 553 `MPR-RC-HELIXOS-L2-040-001`, digest `dfd272b75826d37333671f7152a0a58d2d013f0bd13a3f3957a76a39dcdfad80` | L2 file `89d79c76a7d46c4e1c76cf88046eac5a22dfcddcd96726c75cf82f0ddd80bdb2`; L2 digest above. L11 file `7547b0ada257c2cbc65771c8c83aaec58f4405e85e095f9bdfae4d1b56f2a0fd`; section digest `a70e3b1af4b22d3370c6a845fc6b5ced1e1162e2cea66cb1d0664211130533e7` | 旧HIL-FR-27のtimeout/lease/Worker交代後の継続に対し、retry上限・失敗回数・budgetの持続とtyped returnが近接する。source atomは旧HXT-AC-015に限定され、IPCやlate-result fenceのsuccessorではない。 |
| `HARNESS-L2-054` | 11候補decision line 34；MPR register line 609 `MPR-RC-HARNESS-L2-054-001`, digest `b76b7b1adec804a25bd9333663aa9b0d074f68518764c2874c994bcdf6ead193` | L2 file `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108`; L2 digest above. L11 file `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7`; `HARNESS-L11-054` digest `5d1ab0bad44ae305053932f0c82bcf472e145046125b638f5facab13eaaa2aa0` | specialist contractからOS assignmentへのtask/scope/revision handoffがWorker assignment条件に近い。旧HIL-12 runtime protocolやresult commitは対象外で、HIL-12のformal successorとはしない。 |

これらのL2/L11本文にはdecision前の`候補` metadataが残るが、採否状態はdecision記録が優先する。各MPR行は`registered_proposal`／`authority_effect: none`の管理projectionであり、上記の決定identity・revision範囲を超えて採択やsuccessorを作らない。2026-09-29 decision群の採択を、HIL-12 source atomへのsuccessor assignmentやHST実行結果へ転用しない。

## source carry-forwardと被覆判定

現行[旧補助contract再照合](legacy-auxiliary-contract-refinement-recheck-2026-09-28.md)のHIL-12行（45行目）は、OS-L2-018/019/020とSECURITY-L2-008を近接責務として照合し、status/receipt/provenance/中断・失敗と実行権限の分離は再導出可能、JSONL・Node/Python・transaction方式は未採択技術設計と整理する。本監査はそこから旧HAT/HSTと現行採択pairのrevision関係・source holdingをsource単位で固定する。旧要件全体の完全なatom inventoryや正式な責務移管の完了は主張しない。

| preserved source identity | carry source item | 現在のcarry state | successor assignment |
|---|---|---|---|
| `HR-FR-HIL-12` | `REQSRC-SUP-00619` | `preserved_pending_rehome`, `relation_status: unmapped` | `[]` |
| `HAC-HIL-12a/b/c` | `REQSRC-SUP-00555/00556/00557` | `preserved_pending_rehome`, `relation_status: unmapped` | 各`[]` |
| `HAT-HIL-12` | `REQSRC-SUP-00643` | `preserved_pending_rehome`, `relation_status: unmapped` | `[]` |

この照合から結論できることは、現行採択pairが一般的なworker execution、evidence continuity、CI運転の近接条件を持つこと、旧HIL-12が要求した技術名・protocol詳細が現行L2/L11の必須技術ではないこと、旧補助sourceとHAT/HACがcarry-forward上は正式successor未割当で保持されることまでである。`HR-FR-HIL-12`の一括successor割当、旧HAC/HATの合成受入、個別worker failure oracleのcoverage、implementation/execution closureは証明されない。特に`HIL-TR-02/07/08/09/10`と旧NFRの個別atomすべてについてformal successor mappingが閉じたとは主張しない。

旧sourceから保つ意味は、期限・lease・権限に拘束された実行、未検証・異常・遅延resultを成功へ昇格しないこと、実行主体が権威ある記録を不正に書き換えないこと、失敗状態と証拠を区別することである。現行の責務分担へ再導出する場合もこの意味を弱めない。変更されるのは、旧Node/Python/JSONL/schema/transaction設計を新世代の採択要件として移植せず、worker実行・検証義務・authorityを現行ownerへ分ける点であり、理由は固定済み現行L2/L11と機構境界である。旧asset ledger上の該当sourceはhistorical/snapshotとして保持し、実行・copy・retireを行わない。

## 静的確認

- 旧source JSONのarchive bytesとgovernance source snapshotのfile digestが一致することを上記SHA-256で照合した。
- 現行OS-L2/L11-018/019/020のsection digestを2026-09-28判断対象revisionと現行mainで比較し、一致を確認した。
- carry-forward JSONLの5件（parent contract、HAC 3件、HAT 1件）は、記録したsource item ID、未解決state、空successor集合と一致する。
- HST runtime scenario 12件（`01..12`）と補助 assertion 6件（`13..18`）を区別し、両方ともdesign-only/not-implementedとして扱った。
- 後続57候補およびlive26 decisionの明示対象範囲に、HIL-12 successorを追加するidentityがないことを照合した。
- legacy runtime/test/CI、新世代CI、実装を実行していない。これはsource-status監査であり、動作検証ではない。
