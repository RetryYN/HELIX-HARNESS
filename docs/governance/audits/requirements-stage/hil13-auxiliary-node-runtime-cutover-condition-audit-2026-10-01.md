# HIL-13旧補助contractのNode runtime cutover条件監査

## 対象と基準

対象は旧補助system contract `HR-FR-HIL-13` rev 1、`HAC-HIL-13a/b/c`、`HAT-HIL-13`と、これらを参照するL5/L6設計・test consumerだけである。旧要求atomは`HIL-BR-19`、`HIL-FR-33`、`HIL-TR-01`、`HIL-TR-11`の4件。24親contract、全HIL atom、runtime実測、旧cutover全計画の完了は判定しない。

現行比較基準は`origin/main` `8297a0af40fd5469e447c932a6689f008b6ee11d`（2026-10-01、#2443 read-after後）。HARNESS/OSの固定L1/L2/L11 PO判断、2026-09-29の57件・11件判断、2026-09-30 live26判断、既存のHIL-13再照合を読んだ。判断対象revisionを固定するPO decisionは各decision recordに限り、現行本文の候補表記、MPR、旧設計、CI、会話から採択や実行を推定しない。旧source、CLI、runtime、hook、test、CIは参照だけにし、実行していない。

## 旧source identityとatom

旧JSONのファイルSHAを再計算してsource identityと照合した。contractは`specified`、HAC三件は`specified`、HATは`designed_not_implemented`である。

| 役割 | source identity | file SHA-256・semantic digest |
|---|---|---|
| system contract | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-13` | `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`; `3206e47b94bbc19635e0f0fb44796caf1c0e7d8935cc68dc266e57dccf0773e7` |
| positive acceptance | `requirements-ir/acceptance_cases.json#/HAC-HIL-13a` | file `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`; `3358feb7d61c0012ca559aaf016827bc17f54433b7aed3455707cb50df1c5ebd` |
| negative acceptance | `acceptance_cases.json#/HAC-HIL-13b` | same file SHA; `7083d54876e80684a44336b77f2e8cfa4d08b1b9e632d43db5e6066c7e306068` |
| boundary acceptance | `acceptance_cases.json#/HAC-HIL-13c` | same file SHA; `e3d8fd17230c7252757e67bdfe57b5ed9b8f38162b46b0c4b0c42687cfdbab9a` |
| system test | `requirements-ir/system_tests.json#/HAT-HIL-13` | `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`; `43de34e55f7eb0a4b9bc7aa0ebb61ef6e923ebbbd16b0d8293230d795112f4f9` |
| requirements IR | `requirements-ir/requirements.json` rows for the four IDs | `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` |

| atom | semantic digest | 比較対象として保持するsource条件 |
|---|---|---|
| `HIL-BR-19` | `95d7e1242d77cdba8ed1447e36382caf4e23413b6d5a3d40241feffa5a6521d1` | 完了条件は、開発・実行・検証・配布の全active surfaceがBunなしで再現可能であること。一部互換では完了としない。 |
| `HIL-FR-33` | `21cb2d593ce14771ea0675e9dd5e441eb2ffaa214c7e300437836f052a2b80dd` | activeなsource/import/command/script/test/package/lock/CI/hook/template/setup/distribution依存をinventory化する。historical/archive行は理由を付けて区別し、分類済み台帳とactive件数を出す。 |
| `HIL-TR-01` | `20132aa5c7cc5ca9107e826e3ee2be6b3eb959414424594fb8dfbf317b1c5afc` | 旧control planeの目標はstrict TypeScriptとNodeを唯一runtimeとし、Bun固有API/command/lock/CI/distribution契約を除くこと。 |
| `HIL-TR-11` | `a60d775089a0729e6c2b8f17c106df23d54fa922f79adb0301520cc665775696` | cutover時にclean install/build/test/CLI/hooks/package/distributionをBun binary/loader/API/lockなしで実行可能にする。 |

旧contractは四atomをHAC 13a/b/cとHAT 13へ結ぶ。HAC 13aはBun-less Linuxでのend-to-end green、13bはactive残存の検出、13cはhistorical allowlistとactive依存の分離を期待する。contractのtransition/evidence fieldsはBun-less Linux環境、Node lock、surface inventory、全surface green、active finding 0、inventory/workflow/lock/package evidenceを求め、部分完了claimを拒否する。これは旧migrationとtest oracleの記述であり、現行runtimeの選定や実行receiptではない。

## 旧設計consumer

sourceを固定したconsumer記録は、inventory/gate設計、integration coverage、unit oracle、system acceptanceの分担を示す。これらはdraftまたは設計artifactのままである。

| consumer | sourceとSHA-256 | 関係・限界 |
|---|---|---|
| L5 detail | `root/docs/design/helix/L5-detail/node-runtime-cutover.md`; `49f3e4c324b19e728f7c05787bbd698f841728a526eedc7cec3f756b3601e9f9`; asset `LEGACY-ASSET-B6DC14C1DA937E3AC96C` | HDS-HIL-13はNode minimumとBun cutoverを分け、provisional gateをcutover完了としない。`CutoverActivationReceipt`を記述し、activation contractのRedesignまでpreflightをblockする。draftのみ。 |
| L5 integration test design | `root/docs/test-design/helix/L5-node-runtime-cutover-integration-test-design.md`; `b89080f8726709d68f0eef7a714b36df63df294caf944dc49a555abbd4c16d22`; asset `LEGACY-ASSET-369870F6C88C47193EE4` | `IT-NCUT-001..013`はclean installから配布、surface inventory、drift/failure、activation、terminal receiptを扱う。test設計では未実装とされ、実行証拠ではない。 |
| L6 function design | `root/docs/design/helix/L6-function-design/node-runtime-cutover.md`; `50e5f918079220551310bb8aaf8431e640a91ce13fd83ccb1de480ba1b9b88c1`; asset `LEGACY-ASSET-F54C515C9BB8965C1F4A` | inventory/classification、Node minimum、Bun cutover、activation、terminal functionをdraft APIとして定義する。実装済みまたはpair freeze済みとは主張しないと明記。 |
| L6 unit test design | `root/docs/test-design/helix/L6-node-runtime-cutover-unit-test-design.md`; `b96c4765faae73ff5ba695bbb47fb8ab216dae82d96f2703667afae1aa4d3bc5`; asset `LEGACY-ASSET-C32310860865671C6A08` | `U-NCUT`の負例oracleはinventory欠落、active/historical誤分類、runtime/lock不一致、部分gate、authority更新を扱う。test設計のみ。 |
| HST consumer map | `root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md`; `e518b0cfe15ca4b999bd85120b8d74941a18ab0939ff6cda3dc20a8b7611b705` | HST-HIL-013は四atomをBunなしclean Linux、active依存0、quarantine 0へ結ぶ。mapの状態はdesign/partial implementationで、成功実行ではない。 |
| assertion cases | `root/docs/governance/infinity-loop-system-assertion-cases.md`; `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8` | `HST-CASE-013-01..11`はend-to-end acceptanceをassertion caseへ分ける。matrixでは未実装とされる。 |
| L3 acceptance map | `root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md`; `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | HAT-HIL-13をHST-HIL-013、Node lock/workflow/artifact evidence、Bun残存/partial-claim負例へ結ぶ。設計mapのみ。 |

旧設計における次の分離は比較根拠として保持する。Node minimumの結果は限定段階のreceipt、全surface provisional gateは非終端、authority activationは別の固定sequenceとreceiptを必要とし、terminal completionには個別の証拠が要る。旧receipt名や実装詳細を現行要求として採択する意味ではない。後に有効な現行契約のもとで実行receiptが作られても、そのexact scope/revisionの証拠となるだけであり、receipt schemaや名称の存在だけでは実行もHIL-13閉包も証明しない。

## 現行L2/L11と後続PO判断

2026-09-28のHARNESS/OS PO判断は`f6dad2a33e24f000b87d7f09b8d40288257e74cc`で固定したL2/L11一式を採択する。そのauthorityは固定bytesに限られ、後続の全編集へ自動適用されない。比較したlatest-mainのファイル全体SHAを記す。HARNESS L2 `78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6`, L11 `a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e`; OS L2 `bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf`, L11 `cd0e750cab9e694eed060a619d50527239e1b1291b9550cc0c95dbbd486c7112`.

| 比較対象 | 判断/source | HIL-13への含意 |
|---|---|---|
| HARNESS / OS固定L2/L11 | [`helix-harness-requirements-po-decision-2026-09-28.md`](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md), SHA `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`; [`helix-os-requirements-po-decision-2026-09-28.md`](../../decisions/helix-os-requirements-po-decision-2026-09-28.md), SHA `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da` | 固定された要求・受入一式を確認した。これらの判断はHIL-13 source identityまたはNode/Bun cutover契約を直接採択していない。HELIX-HARNESSは外部提供する製品、HELIX-OSは製品でない機構である。機構側のruntime規則をconsumer製品へ移さない。 |
| `HARNESS-L2-027` | 同HARNESS判断、現行L2/L11 | POが採択したのは選択source内のcode、DB/schema、API、configuration等の静的抽出をobservation candidateにする範囲。repository全体のactive runtime inventory、Node限定control plane、Bun撤去、clean install/package移行、cutover authorityまでは含まない。 |
| `HARNESS-L2-052` + `HELIXOS-L2-053` | 11候補判断の採択pair | command意味identityと再送判定、関連するartifact群の原子的確定/失敗隔離が採択された近接条件である。sourceはHIL-FR-52とその候補対に限られ、runtime選択、全active surface inventory、Bun cutover、HIL-13 successorにはならない。採択そのものも候補L11の実行を証明しない。 |
| 57候補判断と55候補の受領経路 | [`po-decision-2026-09-29-57candidates.md`](../../decisions/po-decision-2026-09-29-57candidates.md), SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad` | 判断は列挙したcandidate revisionだけを固定する。55候補handoffは来歴として記録されるが、HIL-13の判断にはならない。HIL-13 identityの明示、formal successor割当は見当たらない。近接する実行・証拠条件の採択範囲は、それぞれ選択されたsource atomとscopeに限る。 |
| 11候補判断 | [`po-decision-2026-09-29-11candidates.md`](../../decisions/po-decision-2026-09-29-11candidates.md), SHA `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5` | ここで固定したexact revisionはHIL-13やBun-cutover successorを割り当てない。 |
| live26判断 | [`po-decision-2026-09-30-live26.md`](../../decisions/po-decision-2026-09-30-live26.md), SHA `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145` | 26件のexact candidate identityと選択は、HIL-13、四atom、Node/Bun cutover successor、実行証拠を割り当てない。同判断はL3承認、実装/実行許可、旧sourceのformal successor割当を含まない。live26が採択した`HARNESS-L2-057` + `HELIXOS-L2-054`はclosure意味条件と証拠handoff、`HARNESS-L2-058` + `HELIXOS-L2-034` + `HELIXOS-L2-101`はPR finding分類・risk境界の組であり、HIL-13のruntime migrationやその実行receiptとは別scopeである。 |
| 既存source再照合 | [`legacy-auxiliary-contract-refinement-recheck-2026-09-28.md`](legacy-auxiliary-contract-refinement-recheck-2026-09-28.md#L46), SHA `2368a0be3c1394018adf0eb23774242b58a240f01962f8dc40d2f35eb6f2714e`; [`legacy-system-acceptance-negative-oracle-audit-2026-09-28.md`](legacy-system-acceptance-negative-oracle-audit-2026-09-28.md#L37), SHA `865e499afd81e0df5603beb8b144e9f68af54a9fc11b0d57fbae4a6cd8d9861e` | HIL-13を旧技術migration候補に分類し、固定機構L1/L2/L11にNode/Bun cutover identityがないとする。現在の必須runtimeを推定せず、一回限りのmigrationに限るfailure oracleを保持する。 |

現行crosswalk (`concept-mechanism-version-requirement-crosswalk.jsonl` rows 56, 103, 180, 190; SHA `488c49703e37c60cf26d8b326ba823030f95844b767293b37475a52c3220640e`)は旧atomの配置先候補をHELIX-OSとするが、successor identityとL11 acceptanceは未割当、導入版は未指定、runtime選択は未決と記録する。機構配置候補や近接する採択要求はformal successor bindingではない。

## carry-forwardとauthority状態

SHA-256 `51ae96d3fd27cc4aaa6e445c27ff0c6f175199cae09efe4e1566b73c1e8019b0`の`legacy-requirement-carry-forward.jsonl`では、4 ID全件が`preserved_pending_rehome`である。各行の`successor_requirement_ids`は空、`decision_record`はnull、`requirement_change_authority`は`explicit_human_decision_only`。本監査はsuccessor割当、意味変更、旧要求retire、holding解除を行わない。crosswalkの`disposition_candidate`はauthorityを持つ判断ではない。

## 限定結論

旧sourceはsource固定された一回限りのmigration条件を保持する。全active surfaceをinventory化し、historical evidenceを分け、宣言したNode workflowをBunなしで実行し、active残存と部分完了を拒否する。gateの成功証拠はauthority activationやterminal closureと区別する。旧L5/L6 consumerは詳細APIとreceipt設計を加えるが、draft/test設計であり、現行要求、実装、実行、受入結果の根拠にはならない。

ここで確認した固定後続PO判断は、HIL-13を現行製品runtime要求として確立せず、formal successorも指定しない。また、現在のactive surfaceがBunを使用しているか否かも確立しない。このread-only監査ではHAT/HST実行receipt、findings 0件のinventory、cutover activation receipt、terminal receiptを作成・確認していない。sourceは`preserved_pending_rehome`のまま保持する。一回限りのmigration意味を維持・再導出・retireする判断と、現行runtime targetを決める判断は別のauthority判断である。採択、migration完了、cutover、実装/実行許可、Step5/requirements-stage閉包を主張しない。

## 静的照合

確認したのは旧JSON identityとsemantic digest、HR→HAC/HAT→HST参照、L5/L6 consumer identityと境界、四つのcarry-forward行、現行decision対象とsource crosswalkの状態である。archive内の実行物およびcurrent runtime/statusを調査・実行していない。旧test設計のstatus、文書中のreceipt type、隣接L2/L11の採択をexecution receiptの代用にしていない。
