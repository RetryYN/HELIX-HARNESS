# HIL-15 補助条件・旧負例の現行照合

## 対象と根拠revision

本記録は `origin/main` の `9bea047e959329e7910050017fb43cbd718492a4` を基準とする静的照合である。旧source・consumerを読み、旧CLI、runtime、test、CIは実行していない。旧HATの `designed_not_implemented` とテスト設計本文の「全case未実装」を実行結果へ読み替えない。

| 旧source / consumer | 対象行 | SHA-256 | asset ID / 台帳上の状態 |
|---|---:|---|---|
| `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json` | 340–363 | `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab` | `LEGACY-ASSET-67761C517521603F844C`、`source_snapshot_preservation`、read-only source snapshot |
| `archive/legacy-generation-2026-09-14/root/requirements-ir/acceptance_cases.json` | 464–496 | `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19` | `LEGACY-ASSET-4886CEF2A7AB5B7AA5C8`、`source_snapshot_preservation`、read-only source snapshot |
| `archive/legacy-generation-2026-09-14/root/requirements-ir/system_tests.json` | 277–296 | `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a` | `LEGACY-ASSET-F7A988C2531DEAC3D23B`、`source_snapshot_preservation`、read-only source snapshot |
| `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` | HIL-BR-13 518–559; HIL-FR-17..20 2114–2284; HIL-NFR-11 4853–4894 | `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、`source_snapshot_preservation`、read-only source snapshot |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` | 65, 107–110, 191 | `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`source_snapshot_preservation`、source status `draft` |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md` | 49, 78 | `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | `LEGACY-ASSET-C7F0C3B79CBAA72960BF`、`unresolved` |
| `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md` | 1–83 | `d72c002d485628ba059346b6af6a7233cead8bdf060a2630289d1c8148e0e26f` | `LEGACY-ASSET-63DEDB3F6F768B251BC5`、`unresolved`、`legacy_test_design_or_oracle` |
| `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-screen-applicability-prototype-integration-test-design.md` | 30–44, 50–69, 76–85 | `16a40c2952c2e69b42147f6f08994352d6188d5d8a68e72f1d4d618fc9784b07` | `LEGACY-ASSET-CD32DDCC170620F5FBE8`、`unresolved`、`legacy_test_design_or_oracle` |
| `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md` | 47 | `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | `LEGACY-ASSET-FA8C6E69463183D6A19B`、`unresolved`、`legacy_test_design_or_oracle` |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/screen-applicability-prototype.md` | 38–46, 51–63, 80–91 | `aa744b5d6eb4121c14cd8f2e8660dac200183a1359b4f3cf6bdc3b5a14d882c0` | `LEGACY-ASSET-51B78F6A5128E2CD1448`、`unresolved` |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/screen-applicability-prototype.md` | 20–41, 57–64, 84–88 | `3f92059a9854d774c0278e51138396536bcbf55f6132478576d2064f836d2b64` | `LEGACY-ASSET-A65B5C20721DD2149886`、`unresolved` |

source manifestとtarget snapshotの同digestは物理保全を示す。要求採用、oracleへの昇格、実行可能性、consumer閉包は示さない。補助条件の構造・source関係は `docs/governance/legacy-migration/requirement/legacy-requirement-supplementary-source-carry-forward.jsonl`（SHA-256 `1a0591e1da6f9579d970aedfccff90ac6a8e1aefbbe0f4047e3aeb950a8449bb`）の `REQSRC-SUP-00622`、`00564`–`00566`、`00646` に照合した。

## 旧contractとIR atom link

`HR-FR-HIL-15` rev.1 は source status `specified`、contract digest `b05ffe97…d9491a`。旧文面は全PLANを `prototype_required` / `not_applicable` に分類し、前者はprototype→walkthrough→要求back-propagation/agreement、後者は構造skip時のみL3 freezeとする。遷移前提はscope digest/policyとcurrent agreementまたはno-UI receipt。暗黙・deferredのskip、static-only prototype、state/walkthrough欠落、stale skip/applicabilityを拒否し、applicability、artifact、walkthrough、delta、agreementを証拠として挙げる。

契約は次の6つの旧IR atomを明示参照し、それぞれの `requirements.json` pointerから同じHAC 3件・HAT 1件・`RAS-HIL-15`へ結ぶ。全6 atomは旧IR内で `specified` / `frozen`、downstream obligation `pending_pair_descent`、設計artifact fields空、authority `RAS-HIL-15` である。

| 旧IR atom | 旧IR行 | atomの主な意味 |
|---|---:|---|
| `HIL-BR-13` | 518–559 | 画面工程の明示分類。UIはprototype、walkthrough、要求反映、agreement後にfreeze。非UIは証拠付きskip receipt。 |
| `HIL-FR-17` | 2114–2155 | scope/surfaceから適用性を判定。非UI skipには理由、判定者、input digest、再entry trigger。 |
| `HIL-FR-18` | 2157–2198 | UI prototypeの操作経路・状態・artifact provenance。 |
| `HIL-FR-19` | 2200–2241 | walkthrough観測、発見delta/no-delta、要求反映先、再作成判断の記録。 |
| `HIL-FR-20` | 2243–2284 | UIはartifact/walkthrough/要求反映/agreement、非UIはskip receiptを確認し、不足時freeze拒否。 |
| `HIL-NFR-11` | 4853–4894 | 暗黙skip禁止、静的wireframe/proseを操作可能prototypeの代替にしない、LLM自由文をskip証拠にしない。 |

旧IR要求と保存された旧L1原文のpointerは `docs/governance/legacy-migration/ir/legacy-ir-document-source-relation.jsonl`（SHA-256 `f7e713248c84ea53d50c96583f41fc827e0acf48ee98e13bc3967e78df12588f`、行13,50–53,113）にあり、これら6 atomは `ir_and_preserved_document_exact` / `preserved_pending_rehome`。対応元L1本文はsource status `draft` のまま保全される一方、Requirement IRの各identityは別のsource status `specified` / `definition_status: frozen` である。sourceの状態軸を混ぜない。一方、contract source `REQSRC-SUP-00622` は6 atomへの関係を列挙するが `relation_status: unmapped` / `successor_requirement_ids: []`。HAC 3件とHATも各 `preserved_pending_rehome` / `relation_status: unmapped` / successorなし。旧sourceとのリンクが読めることと、対象別後継への割当が完了したことを区別する。

旧L3 consumerの `infinity-loop-functional-requirements.md:49,78` は、HR-FR-HIL-15のscope digest/policy、current agreement/no-UI receiptおよび3 HAC oracleを再掲する。旧L6 test-design consumerは次のnegative mutationを設計するが、自身のstatusは`draft`、本文は「全case未実装」。移管、採用、実行証拠にはしない。

## 旧HAC/HATのnegative oracle全量

HAC-HIL-15a（acceptance_cases 464–474）はpositive: 根拠あるno-UI構造skipでfreeze。HAC-HIL-15b（475–485）はnegative: UIをprototype/walkthrough/agreement前にfreezeしない。HAC-HIL-15c（486–496）はboundary: scope変更で古い判定をstale化しL2へ戻す。HAT-HIL-15（system_tests 277–296）は `designed_not_implemented` で、必要証拠をapplicability、artifact/state、walkthrough/delta/agreement、negative boundaryをimplicit skip、static-only、stale receiptと指定する。

旧L6 test-designにある全12 mutation groupを列挙する。これらは設計済みoracleの記述であり、現行実装要件として自動採択したり旧schema/enum/9状態fixtureを移植したりしない。

| 旧case | 負例・拒否条件 |
|---|---|
| U-SAP-001 | screen-scope必須field欠落、未知capability、正規化順序違い、絶対locatorをreject。同義scopeは同digest。 |
| U-SAP-002 | UI / no-UI / deferred / free-textの曖昧な適用性、unknown capability、二重route選択をreject。 |
| U-SAP-003 | no-UI receiptのreason、判定者、evidence、provenance、再entry、期限/有効性のいずれか欠落で有効skipを発行しない。 |
| U-SAP-004 | capability / rule / scope digestの変更、stale receipt、重複再送による再entry task増加を拒否。 |
| U-SAP-005 | prototype-required判定に必要なscreen / interaction / state / data obligation欠落時にprototype taskを作らない。no-UI routeに誤ってprototypeを作らない。 |
| U-SAP-006 | static-only、起動失敗、trace欠落、9状態のfixture欠落、digest改変でartifact readyを出さない。 |
| U-SAP-007 | actor / observation / delta / target / rebuild判断欠落、iteration上限超過でwalkthrough receiptを出さない。 |
| U-SAP-008 | walkthroughなし、旧artifact、人以外のreview、digest不一致でagreementを出さない。 |
| U-SAP-009 | 未処理delta、wrong L1 revision、偽装no-deltaでback-propagationを完了しない。現行で要求対象に接続する際は対象要求revisionの条件も区別する。 |
| U-SAP-010 | skip/agreement双方欠落または同時成立、stale判定、deferred判定、部分transactionでfreeze passを出さない。 |
| U-SAP-011 | plan route後のUI/no-UI completion exact set、decision/skip authority identity、receipt ID/digest/current HEAD/canonical bytes/freshness不一致、stale/superseded/swapped receipt、順序逆転、二重gate、CAS/faultを拒否し、部分stage/gateを残さない。 |
| U-SAP-012 | capability IDの欠落・余剰・重複、stale/deferred decision、set digest、route優先順位、prototype task exact set、bundle/receipt/head/CAS/stage projection/port回数/gate payloadの改変を拒否。plan準備からgate passを出さない。 |

HST-CASE-012-02/03/04/05/09/10および024-02..08のfailure code/状態もtest-design:49–67に記録される。たとえば `HIL_SCREEN_DECISION_MISSING`、`HIL_SCREEN_RECEIPT_STALE`、`HIL_SCREEN_SKIP_EVIDENCE_MISSING`、`HIL_SCREEN_DEFERRED_NOT_CLOSED`、`HIL_SCREEN_IMPLICIT_SKIP`、`HIL_PROTOTYPE_NOT_EXECUTABLE`、`HIL_PROTOTYPE_STATE_MISSING`、`HIL_PROTOTYPE_WALKTHROUGH_MISSING`、`HIL_PROTOTYPE_DELTA_MISSING`。名前付き旧error codeは現行public contractとして扱わない。

## 追加consumer: L3 HAT設計、L5 integration、L5/L6設計

旧 `L3-infinity-loop-acceptance-test-design.md:47` は `HAT-HIL-15` を `HST-HIL-012` と `HST-HIL-024` に結び、no-UIまたはprototype routeの完了、applicability/artifact/state/walkthrough/delta/agreement、implicit skip/static-only/stale receiptを列挙する。この行はHATが両側の補助test identityを参照したことを示す。HSTの実行やHAT合格を証明しない。

旧integration test-design（見出し上L8、pathはL5-screen…）は9 scenario / 18 canonical primary HST caseを定義する。30–44行は固定clock/ID、no-UI/UI/deferred混在scope、executable/static-only artifact、human reviewerをfixtureに置き、receipt件数/digest/CAS/stale lineageをassertするとする（本文自身が全case未実装と明記）。特に `IT-SAP-009`（44, 76–79）は、plan-route集約・永続化と後段stage/gateを分け、UI/no-UI completionとauthorityのexact set、skip authorityのidentity、agreement/backprop receiptのhead/digest/canonical content、stale/superseded/expiry、順序逆転、二重gate、stage/gate CASおよび各append faultを個別に変異させる。完全なcurrent routeとcompletion一式が揃う場合だけstage+gateを一度commitし、他は部分receiptを0にするoracleである。50–69行はHST-CASE-012-01..10と024-01..08を18件のprimary caseとして対応づけ、73–85行は18件分母、scope再entry、transaction fault、write count、digestおよびreceipt内operation/commit/event binding swapを列挙する。共有scenarioをcase数へ重複加算しない。

旧L5 detail design:38–46は全PLANの二値route、capabilityごとのdecision集約、deferred/undecided/stale時のgate 0、共通digestを要求する。51–63はscope normalizer、applicability evaluator、no-UI receipt writer、prototype planner/registry、walkthrough ledger、freeze gateをNode write authorityへ束ねる。80–91は9状態fixture exact set、state遷移、agreement前条件、skip/agreementを含むatomic commitとscope-change時のstale lineage/taskを記載する。旧L6 function design frontmatter:20–23は同じ親HAT/HACを参照する。30–41、57–64、84–88はpure API、Failure union、human review/authority receipt、task/agreement/backprop/gate、reentry/no-UI receiptの型と責務を細分する。とくに`ScreenFreezeInput`への束ね方や`U-SAP-011/012`の機能分割は旧API・実装境界であり、現行要求が要求するpublic API、Node/DB構成、固定error enum、exact 9-state fixture、特定receipt/table/schemaではない。

これら4 consumerは上表に記録したarchive assetが`unresolved`であり、旧integration/test-designは完全一致再利用対象外のclassである。原意のnegative oracleの網羅根拠として読むが、旧route、capability denominator、固定分母、field schema、transaction port、Node authority配置、9-state exact fixture、expiry/digest/CAS/error-code等の個別設計値を現行HARNESS L2/L11へそのまま追加しない。現行側で意味対応を確認できるのは、必要なPrototype/PoC、要求へ戻すこと、合意前freeze拒否、非適用理由等の受入結果までである。前掲の現行照合表にあるとおり、旧HAC-15cのscope-change失効から再entryに至るreceipt-level oracle全体の直接successorはL2/L11で確定したとは判定していない。

## 現行HARNESS L2/L11との意味照合

照合した現在の本文SHA-256はHARNESS L2 `78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6`、L11 `a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e`。

| 旧条件 | 現行の確認位置・判定 |
|---|---|
| UI prototypeの必要性と要求合意 | L2 `HARNESS-L2-001` (`product-requirements.md:52`) はL2.5（Prototype・PoC）と要求合意を区別。L2 `HARNESS-L2-003` (`:54,106–108`) は画面や不確定性のある対象がL2.5で不確定性を減らし、Prototypeは画面有無で判定、結果を要求へ戻してDecide前にL3 freezeしない。 |
| no-UIを一律「L2.5不要」としない | L2 `HARNESS-L2-003` `:106` はPrototypeとPoCを独立判定する。PoCは画面に関係なく技術成立性の不確実さで判定し、片方だけの非適用ではL2.5を飛ばさない。 |
| 根拠なしskip・適用性unknown/deferred・非UI記録の不足 | L2 `HARNESS-L2-003` `:106` は両方非適用時のみL2.5を飛ばし、L2要求は省略せず、非適用、理由、判定者、HEAD、要求への影響、再評価条件を記録する。L11 `:41–42` は画面なしでも技術PoCが必要な場合の省略、片方だけの非適用によるL2.5全体skip、Prototype agreement欠落、PoC結果未還流、非適用記録の必須項目欠落を拒否する。 |
| static-only、操作可能prototype欠落 | L11 `HARNESS-L2-003` `:41` がprototype合意欠落前のL3進行を拒否し、旧負例と意味上対応する。旧9-state fixture、old startup code・schemaの1:1 successorは確認していない。 |
| walkthrough delta / no-delta・要求反映欠落 | L11 `HARNESS-L2-003` `:42` はPoC result未還流を拒否。L2 `:106–107` はPrototypeをL2要求と反復し、結果をBackflowして要求へ戻すとする。旧walkthroughの固定receipt/iteration schemaは現行契約として確認できない。 |
| agreement / wrong revision / stale scope | L11 `:41–42` のPrototype agreement欠落拒否とL2 `:54,106–108` の必要合意・成果物状態・Backflow条件に意味対応がある。旧HAC-15cのscope-changeに対するreceipt-stale・再entry全詳細がHARNESS L2/L11 aloneで全て閉じたとは判定しない。L1影響のないscope変更をL1合意へ一律戻す旧動作も現行本文へ読み込まない。 |
| freeze状態の混同 | L2 `HARNESS-L2-003` `:54,108,112–113` とL11 `:41–43` は合意、L10検証、L11受入、L12評価等を別状態にし、前段成立や文書登録から後続完了を推定しない。 |

HARNESS L2は工程の要求・凍結条件を所有する。どの操作主体がscope、approval、event、receipt、stale、再entryを永続化して管理するかを補うとき、旧ownerの記載だけでHARNESSへ全て集約しない。現行HARNESS-L2-003/L11が直接規定するのは利用要求・受入条件であり、旧PLAN schemaや旧test designのAPI/DB/schemaを規定しない。

## Authorityと未解決状態

2026-09-28のHELIX-HARNESS PO判断記録（`HDEC-HARNESS-REQUIREMENTS-2026-09-28`）は、固定したL1 revisionと対になるL2/L11一式、明示候補24件を対象に合意した記録である（decision file SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`、特に:18–25,64–75）。これは旧IRの6 atom・補助contract/HAC/HATのsuccessor assignmentやsource closureを生成しない。ここで参照した現行ファイルのSHAは上記の現在bytesに対する値で、decisionの別固定revisionへ承認を拡張するものではない。

上流authorityモデル（SHA-256 `812f423b4b9952666b0ef91e741fec62f54caa3c884124ec534abbbe70be4616`）の5軸を適用すると、旧IR atomは `source_authority_state=specified_frozen` を保つ。対象別L2/L11がPO判断対象となったことと、旧atomごとの `carry_forward_state` は別である。carry-forward status表（SHA-256 `034cbbe54defe5ed48518499183a4be9c623a243830254b40473ce42d2a710bb`）はIR補助system contract/HAC/HAT全134件についてsuccessor assignment 0、`preserved_pending_rehome` 134。HIL-15のHAC/HAT行も supplementary-source carry-forward上は unmapped / successorなし。contract候補の製品routingはHARNESS/OS接続候補に過ぎず、`authority_effect: none`・`successor_assignment_status: unassigned` である。

よって、この照合は意味上の部分対応を記録する。6 atomまたはcontract/HAC/HATのcovered、retired、実装済み、実行済み、受入合格を宣言しない。古い固定schema/enum/error codeを戻すことも提案しない。未対応原子を削除・意味変更せず保持し、source atomごとの採否とsuccessor assignmentを別途続ける。

## 現行と異なる点・静的確認

旧sourceは全PLANへ固定二値routeを要求するが、現行ではL2.5適用をUI Prototypeと技術PoCに分ける。保持する条件は「暗黙skip禁止、必要な確認と合意前にL3 freezeしない、変更影響で古い根拠をそのまま有効扱いしない」。差は2026-09-24のHARNESS判断と現行L2/L11本文を起点にし、画面のない対象でPoCが必要とのPO指示を反映した。既存の `l2-freeze-ir-correction.md` のHIL-15再導出と一致する。これは新たな承認手続き・scopeではなく、指定HARNESS L2/L11 revisionと旧条件の意味照合である。

静的確認では上記のsource SHAとline/pointer、6 IR atomとcontractのtyped reference、supplementary carry-forward 5件、現行L2/L11 IDおよび参照位置を照合した。文書revision、ID対応、参照、責務境界の確認のみ。旧testやruntimeを実行しておらず、現行製品動作の検証でもない。
