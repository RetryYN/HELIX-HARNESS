# HIL-09旧補助contractのsource receipt条件監査

## 対象と基準

本監査は旧補助system contract `HR-FR-HIL-09`と、それに直接結び付く`HAC-HIL-09a/b/c`、`HAT-HIL-09`、および親contractに列挙された10要求atomだけを扱う。24 contract等の母集団全体、全source census、要求stage全体のclosureは判定しない。

現行本文の最新参照基準はorigin/main `74e19f81a7506cdf171f176eaf55edb310eaf268`（2026-10-01）である。HELIX-OS L2/L11の採択authorityは、PO decisionが固定した`f6dad2a33e24f000b87d7f09b8d40288257e74cc`のbytesと外部decision recordから読む。最新mainに残る`candidate`表記だけで採択状態を上書きしない。

既存の[補助contract再照合](legacy-auxiliary-contract-refinement-recheck-2026-09-28.md)と[system acceptance negative oracle監査](legacy-system-acceptance-negative-oracle-audit-2026-09-28.md)は、HIL-09の移行inventory残差を既に特定している。本記録は24件の再要約を避け、HIL-09の各旧atomから正負oracle、旧test consumer、現行の未被覆条件へ直接つなぎ、残差の境界を明示する。

## 旧sourceとidentity

旧archiveと移行source copyの対応する3 JSONはbyte一致する。下記SHA-256はarchive側のファイルbytesであり、現行copyも同一SHAである。

| 役割 | exact identity | sourceと位置 | SHA-256 / 状態 |
|---|---|---|---|
| system contract | `HR-FR-HIL-09` rev 1 | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-09` | `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`; `specified` |
| positive acceptance | `HAC-HIL-09a` rev 1 | `.../requirements-ir/acceptance_cases.json#/HAC-HIL-09a` | 共通file SHA `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`; `specified` |
| negative acceptance | `HAC-HIL-09b` rev 1 | 同上`#/HAC-HIL-09b` | 同上; `specified` |
| boundary acceptance | `HAC-HIL-09c` rev 1 | 同上`#/HAC-HIL-09c` | 同上; `specified` |
| system test | `HAT-HIL-09` rev 1 | `.../requirements-ir/system_tests.json#/HAT-HIL-09` | `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`; `designed_not_implemented` |

3つのHACはいずれも`HR-FR-HIL-09`と`HAT-HIL-09`を参照し、HATはこの3 HACとsupporting test `HST-HIL-011`, `HST-HIL-020`を列挙する。scenarioは3 source groupをsnapshot/atom/coverageへ処理すること、required evidenceはmanifest、atom span、decision/edge/stale receiptである。これは設計意図であり、実行結果・合格記録ではない。

旧atomの直接sourceは`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json`（SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）、移行時のL1 sourceは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`（SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）である。以下の各IDは同じ3 HACとHATをIR上で参照する。`DOWNSTREAM-*`は`pending_pair_descent`であり、これらの要求recordは旧design/template/task evidenceを捏造していない。

| 旧atom | IR source位置・`statement.semantic_digest` | atomが示す条件 |
|---|---|---|
| `HIL-BR-14` | `requirements.json:561–563`; 移行L1 `:66`; `917252a5fad425980897510684f7ca3053711fe8c0541da3cb2eb2c84873fe5c` | ZIP・指定2 predecessor repo・現行HELIX sourceのadvertised ref authorityをatomic sourceへ分解し、採否→requirement/design/test/gateへtraceする。ref、unique entry、ref-entry edgeの分母はauthority receipt由来とし、観測数を固定しない。 |
| `HIL-FR-15` | `:2028–2030`; 移行L1 `:105`; `73dfa183c290d8b7f4e9698e5933b93c4643d9347a6ef8256cdb4c9d95a33ed0` | ZIP metadata/spec/trace/impact/consistency/assignment/schedule/detectorをHELIX契約へ変換し、source digest・adoption decision・DB relationを保持する。 |
| `HIL-FR-16` | `:2071–2073`; 移行L1 `:106`; `3f8059576753f54ac5cbc51a29d19afcc1189f6aee6403196ff3ac7540b0c574` | 現行HELIX・ZIP・指定2 repoのA/B一致する全advertised `refs/heads/*`, `refs/tags/*`, `refs/pull/*/{head,merge}`を機能単位で判定する。symbolic HEADとannotated-tag peelは証拠でありref分母行ではない。 |
| `HIL-FR-21` | `:2286–2288`; 移行L1 `:111`; `f25bd0492adc5256b7159de126ae2e70568b08d4bd420d640fa5bd804eddcb3c` | ZIP entry、2 repo identity、namespace、A/B advertisement digest、全ref→object→commit/tree→entry edge、sealed mirror receipt、現行HELIX symbol/doc/testと観測・source/tree/extractor版をimmutable manifestへ固定し、driftで下流receiptをstale化する。 |
| `HIL-FR-22` | `:2329–2331`; 移行L1 `:112`; `9d401a7bd016ded7263eeb3c0546e1bcd15a7fb8acca13fd78bfabd2a80021ac` | 各capabilityを一意IDでdispositionし、根拠・HIL要求・設計・test・detector/gateへ双方向joinする。未判断、根拠なしreject、孤立atom、複合ID一括合格はpair-freezeを拒否する。 |
| `HIL-FR-37` | `:2974–2976`; 移行L1 `:127`; `34d1fde675a0d97523f479286326cfb162b2b897e5d76921a7dcae514bcb8482` | file/entry/symbolごとのatomic behaviorへsource span、extractor版、parent aggregate、I/O/副作用を付す。parent/file分類はcoverage重みに算入せず、open childを隠せない。 |
| `HIL-TR-03` | `:6249–6251`; 移行L1 `:167`; `8e14a234b93d4d5c78924b8ec9bd1fb6b926d7559504cde2371581f875ad8d92` | Python ZIP実装は候補であり、HELIX state/gateを迂回して正本へwriteしない。input digest/output schema/provenance/detector resultを投影する。特定Python/DB方式は現行必須としない。 |
| `HIL-NFR-08` | `:4724–4726`; 移行L1 `:188`; `8724cbf48e2e8c314888e5bb12ca828a87ff3abea6e434155031ca65c74d4110` | failure codeとprovenanceを要求し、prose-only passを拒否する。 |
| `HIL-NFR-12` | `:4896–4898`; 移行L1 `:192`; `a85de817bf5698825a759488e16ad07868c18cfe03a62d7b6fe478e3e422391e` | source全量列挙はsource path/entry、digest、抽出時点へ再現可能にする。文書名、代表fixture、検索結果0件、包括要求は完全性証拠にならない。 |
| `HIL-NFR-22` | `:5326–5328`; 移行L1 `:202`; `e0dcb185c615c632c93ff9df21f645e9293ed76f21317a5d1abe9a91123e84b9` | coverage分母はatomic behaviorのみ。aggregate parent、directory/file数、代表fixtureはcovered weightへ入れず、source/extractor差分で全child receiptをstale化する。 |

## 旧positive／negative／boundary oracleとconsumer evidence

| 旧oracle | 原条件と期待結果 | 直接の旧consumer evidence |
|---|---|---|
| `HAC-HIL-09a` positive | ZIP + exact 2 sealed Git authorities + current HEADから、receipt由来ref/content/edge分母とatomic traceを生成する。正常完了証拠はmanifest、atom span、disposition・trace edge。 | 旧`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:41`はHAT-09の`HST-HIL-011/020`とmanifest/atom/decision-edge-stale receiptを対応づける。L5 IT design `:36–40`の`IT-SCAP-001..005`はZIP、sealed mirrors/current receipt、HEAD、3-source統合、receipt由来分母・double-count 0、projection/rebuildを詳述する。さらに同L5 `:46`の`IT-SCAP-011`はexact 2 repoのheads/tags/pull fixtureをA/B同一でexact refspec materializeし、symbolic/pseudo refを分母外証拠に分け、tag peelと全object/tree/edge検証、quarantine cleanup後のsealed receiptを要求する。 |
| `HAC-HIL-09b` negative | parent-only、child omission、overlap、advertised ref omission/extra、unverified objectはfreeze拒否。旧契約failure fieldはaggregate-only、unclassified/duplicate、remote identity不一致、A/B drift、ref/object欠落、stale、prose-only、Python authority bypassを列挙する。 | 旧`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-source-capability-atomization-closure-unit-test-design.md:29–62`はsource-span欠落/gap/overlap、unclassified kind、aggregate-only weight、pending decision、orphan chain/target、invalid denominatorを失敗oracleとして示す。特に`:61`の`U-SATOM-033`はimmutable commit artifactをDB投影前にsealし、mode/count/lineageの不整合やrow欠落・余分、append faultでcommit 0。L5 IT `:47`の`IT-SCAP-012`はA/B間ref add/delete/move、tag retarget、pull-merge消滅を各注入し、`HSCAP_REF_ADVERTISEMENT_DRIFT`とcandidate/authority/current増分0を要求する。 |
| `HAC-HIL-09c` boundary | remote identity、advertisement A/B、namespace policy、sourceまたはextractor変更後、旧authority/snapshot/atom/coverage receiptをcurrentとして再利用せずstaleにする。 | L5 IT `:41`の`IT-SCAP-006`はZIP/remote identity/advertisement/namespace/HEAD/rule digest driftで旧receiptをstaleにする。IT `:48`の`IT-SCAP-013`はauthority CASでA/B/refspec/content/closure/peel/bundle/mirror digest driftとdependency-index/write faultを注入し、same-op冪等またはauthorityと全snapshot/atomization/coverageのatomic staleだけを許す（partial/false-current 0）。L6 U `:60–62`はextractor staleとsealed artifact rebuild境界を補う。 |

HATの親レベルoracleは上記の3 HACを一組として三source→snapshot/atom/coverageを扱う。IT-SCAP-011..013はL5設計上のGit-authority supporting oracleで、HAC fieldに別identityとして追加列挙されたものではない。U-SATOM-033/034もL6のatomization内部oracleであり、HAT-09の別system test identityではない。旧test designの期待結果と、旧`HAT-HIL-09`のstatus `designed_not_implemented`を分け、いずれからも実行receiptは導かない。

L5 IT designのfixtureにあるZIP `703/703`、seed tree `1,756 + 175 = 1,931`は、その資料が固定したtest fixtureの期待件数である。HIL-BR-14/HIL-FR-16/HIL-FR-21の一般分母をこの数へ固定する根拠ではない。旧requirementはref/content/edge分母をreceiptから導く。

参照した旧consumer bytesは以下のとおり（いずれも旧archive内source）。L5 integration test design `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-source-capability-capture-integration-test-design.md:36–48`（IT-SCAP-001..013の該当行、SHA-256 `5e8a7707259eb4e44881be81c353b5371b86e08722ae345baca6537e27c43ef4`）。L6 atomization unit test design `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-source-capability-atomization-closure-unit-test-design.md:29–62`（U-SATOM-001..034、SHA-256 `e966b3513c960f626e1c355db0e221c4d36d2683e2e40703a635e01c7c2119fc`）。親HAT対応表は`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:41`（SHA-256 `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`）。旧test/runtime/CLI/hook/CIは実行していない。

## 現行L2/L11の固定revisionと最新main

HELIX-OSのPO decisionは固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` とL11 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` を確定し、L2-015/016を含む明示16候補を採択した（[OS PO decision](../../decisions/helix-os-requirements-po-decision-2026-09-28.md)、現mainでSHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`）。同recordは旧source holdingと未解決atomを維持し、デグレ検証完了を意味しないと明記する。

| current boundary | fixed-f6 bytes / refs | latest-main `74e19f81a7506cdf171f176eaf55edb310eaf268` bytes / refs | HIL-09 relation |
|---|---|---|---|
| HELIX-OS L2 | `docs/helix-os/L2-requirements/governance-requirements.md`, SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | same path, SHA `bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf`; L2-015/016 at `:642–660` | L2-015 holds source identity/revision/digest, origin and unknown/stale; L2-016 tracks requirement-to-work/test/evidence trace and keeps unknown/stale. These are adopted general OS requirements. |
| HELIX-OS L11 | `docs/helix-os/L11-acceptance/governance-acceptance.md`, SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` | same path, SHA `cd0e750cab9e694eed060a619d50527239e1b1291b9550cc0c95dbbd486c7112`; L11-015/016 at `:324–357` | Negative cases prevent projection state from creating authority and prevent missing trace/unknown from becoming completion. They do not assert HIL-09's three-source capture or complete receipt-derived census ran. |
| HELIX-HARNESS L2 | `docs/helix-harness/L2-requirements/product-requirements.md`, SHA `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` | same path, SHA `78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6`; L2-019 `:419–426`, L2-027 `:559–570` | Adopted L2-019 is Full Reverse/unknown boundary. L2-027 is a selected-source extraction candidate. Neither by itself asserts the exact ZIP + two repositories, all advertised refs, sealed mirror receipts, or full atomic-behavior denominator. |
| HELIX-HARNESS L11 | `docs/helix-harness/L11-acceptance/product-acceptance.md`, SHA `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` | same path, SHA `a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e`; L11-019 `:214`, L11-027 candidates `:365–397` | L11-019 preserves unknown and rejects inferred approval; L11-027 is an unexecuted selected-source candidate with explicit limits. The latest-main text does not supply HAT-09's migration inventory closure evidence. |

HELIX-OS L2-015/016 latest-main headings still carry historical “candidate” labels in the fixed bytes. Their state is adopted by the explicit PO decision above, not by heading text. Conversely, this adoption is not a closure finding for old HIL-09. HARNESS-L2-027 and associated L11 remain candidate material, not a successor or acceptance outcome.

## 直接照合した未被覆条件と限定処置

この照合で確認した現行L2/L11本文とsource-holding recordからは、HIL-09固有の以下の実証receiptまたは正式後継割当を確認できない。一般provenance/Full Reverse/selected-source extractionの隣接記述は、その不在を埋めない。

1. **exact source censusとsealed authority**：ZIP entry、current HELIX HEAD、および指定された2つの旧repoについて、観測対象scopeに対するsource set全量、current advertised refsのA/B一致、正確なremote identity、exact refspec materialization、tag peelと全object/tree/edge検証、quarantine後のsealed receipt（L5 IT-SCAP-011）が未提示。これはpositive design oracleであり、実際のreceipt取得済みという意味ではない。
2. **advertisement race拒否**：A/B間のref add/delete/move、tag retarget、pull merge消滅で`HSCAP_REF_ADVERTISEMENT_DRIFT`、candidate/authority/current増分0となる境界（L5 IT-SCAP-012）の対象fixture実行receiptが未提示。
3. **receipt由来の三分母**：ref件数、unique tree entry数、ref-entry edge数がauthority receiptから導出され、expected/observed equalityと重複・欠落のない分母を示すreceiptが未提示。IT-SCAP-013のA/B/refspec/content/closure/peel/bundle/mirror差・dependency-index omission/duplicate・write/CAS faultに対し、authority＋全snapshot/atomization/coverageがatomic staleとなりpartial/false-current 0となるreceiptも未提示。固定数、ファイル数、代表fixtureで代替しない。
4. **atomic behavior censusとartifact/rebuild closure**：全source span/entry/symbolから作るatom denominator、atomごとのextractor/version/parent/I/O/effect、disposition evidence、HIL requirement/design/test/detector/gateへの双方向join、pending/orphan/overlap=0を示す同一revision-bound receiptは未提示。加えてU-SATOM-033のDB前immutable artifact seal/invalid projection時commit 0、U-SATOM-034の同一verified artifact＋shared lifecycle entryだけを使ったexact rebuild（欠落/tamper/fork/grouped replay/暗黙rewrite拒否）について、実行artifactまたはreconcile/rebuild receiptは確認できない。
5. **stale cascade**：repo identity、advertisement、namespace、source/head、extractorのいずれかが変わった後、authority→snapshot→atom→coverageの旧receiptを失効させた対象revision-bound evidenceを確認できない。採択済み一般的なstale処理は、HIL-09 exact-inputでの実証ではない。
6. **実行状態**：旧HAT-09は`designed_not_implemented`であり、現行CIは未構築。旧HAT/U/IT設計、文書の存在、migration source holdingを実行結果または受入合格に読み替えない。

現行移行manifest `legacy-requirement-supplementary-source-carry-forward.jsonl`（SHA-256 `1a0591e1da6f9579d970aedfccff90ac6a8e1aefbbe0f4047e3aeb950a8449bb`）の行546–548、616、640は、上記HAC 3件・contract 1件・HAT 1件を`preserved_pending_rehome` / `relation_status: unmapped` / `successor_requirement_ids: []`として保持する。system testの旧statusは`designed_not_implemented`である。これはsource custodyの証拠であり、全source censusやcoverage receiptではない。

**限定処置**：HIL-09を「migration-only exact-source / sealed-snapshot / denominator residual」として未解決のsource holdingに維持する。formal successor ID、L2/L11閉包、採択範囲拡張、retire、implementation/acceptance completionはこの監査から割り当てない。具体的な残差receiptと採否は別のtarget-revision-bound作業で判断する。これは要求意味を削る判定でも、一般製品にcrawlerを追加する提案でもない。

## 検証範囲

SHA-256、IR pointer/ID対応、HAC/HAT参照閉包、固定f6とlatest-mainのファイルSHA、および差分を静的に照合する。旧runtime、test、CLI、hook、CIは起動しない。source holdingや旧設計上のoracleの存在は、capture実行、formal successor、採択追加、L2/L11 acceptance passを証明しない。
