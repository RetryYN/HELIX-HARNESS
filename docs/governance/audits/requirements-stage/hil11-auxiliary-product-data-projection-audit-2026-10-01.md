# HIL-11旧補助contractのProduct Data projection残差監査

## 対象と基準

対象は旧補助system contract `HR-FR-HIL-11` rev 1、`HAC-HIL-11a/b/c`、`HAT-HIL-11`と、その直接consumer `HST-HIL-010`だけである。旧要求atomは`HIL-BR-15`、`HIL-FR-23`、`HIL-FR-24`、`HIL-NFR-17`の4件。24親contract全体、product source全件、全consumer census、要求stage closureは判定しない。

現行照合基準は`origin/main` `d177ca92b5a1044a942d6a8c51db0962fe7e31fd`（2026-10-01、#2439・#2440・#2441 read-after後）とする。HIL-09/10の監査記録とHIL-09の027採択authority訂正がmainへ統合された後の本文・判断・source holdingを確認した。PO判断記録は本文のcandidate表記やMPRの登録状態より優先する。L2/L11本文の存在、旧test設計、MPRの仮登録状態のいずれも、実装・実行・受入合格を意味しない。

## 旧source identityとatom

旧JSONはarchive内の次のbytesを基準とする。旧sourceを読むことに限り、archive内test、runtime、CLI、hook、CIは実行していない。

| 役割 | 対象identity / source | SHA-256・状態 |
|---|---|---|
| 親system contract | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-11` | file `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`; semantic digest `6bc63b9b4359c638f7b4f9b9809ff7871f21c9d2ee21bb86183ddfc749954cc7`; `specified` |
| 正常系acceptance | `requirements-ir/acceptance_cases.json#/HAC-HIL-11a` | file `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`; semantic digest `84127caef6713f3419bf22da1b5e3f4b56a920e35c212b7f7dcc67d10af1229a`; `specified` |
| 負例acceptance | 同file `#/HAC-HIL-11b` | 同file SHA; semantic digest `b4b147b0aa9a8b9b297082c171cec93f79e80d54e688387be6afffd6f4f71907`; `specified` |
| 境界acceptance | 同file `#/HAC-HIL-11c` | 同file SHA; semantic digest `2881ed4b85bbb298ab4bcf2c70caa6aaefa41be19e7964db8309c45f9487002b`; `specified` |
| system test | `requirements-ir/system_tests.json#/HAT-HIL-11` | file `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`; semantic digest `0d9f6abfd1ae52365fa8f81807e2b583d97baa563d3d6878bd236ad52ce28695`; `designed_not_implemented` |
| 要求IR | `requirements-ir/requirements.json#/HIL-BR-15`, `#/HIL-FR-23`, `#/HIL-FR-24`, `#/HIL-NFR-17` | file `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` |
| 移行元L1 source | `root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:67,113-114,197` | file `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`; 行SHA-256（同順）`880385839788ea49f14544ee9dd0f1ed5037bc84b1707a9ba55f4fa6a267c2f5`, `85a92638e7c8e010055e880609ea9c634e205df5c61f0e80bdea3fbc9be68c92`, `a61697f41088818ddbb852fe274453666708c8467ce3d60a538203140bbc91d4`, `186a5b69b53e453fec1351f40e72221a3fea749e727ba0668d842a512a9566f6` |

| atom | 原文statement digest | 本監査で保持するsource条件 |
|---|---|---|
| `HIL-BR-15` | `5f5450b0a801f1f4c6650a0b4ddb87d5eee23400f2126332ed0038ed06f01115` | 版付きproduct-data sourceから、lineage・鮮度・schema・authorityを保持した正規projectionを作り、設計判断、coverage、impact、Issue routing、docgen、detectorへ供給する。 |
| `HIL-FR-23` | `641f78a72962e9343b37991cb298f1e64e0630659c312dc62c5515db81f5f5eb` | registryはsource種別、connector/schema版、credential reference、classification、read/write方針、同期方式、owner、有効状態を保持する。credential値は保存しない。 |
| `HIL-FR-24` | `b021ff425efe0ba75863b33302ec3c41146b5c995ad9cfae41af926e80d152d2` | full/incremental snapshotを冪等に取得し、source record→canonical entity→requirement/design/Issue mapping、provenance、鮮度、tombstone、schema driftをread projectionへ投影する。証拠はsnapshot、watermark、mapping edge、stale/drift finding。 |
| `HIL-NFR-17` | `476a1cc64e906c7341e251fc5396cefeab2bb0ce3bbcdb3e34d67c6c8600b8f7` | classification、取得最小化、redaction、retention、freshness SLAを持ち、PII/secret/raw payloadを通常projectionやagent contextへ複製しない。このatomは数値SLA/retention値を定めない。 |

HATは3つのHACと`HST-HIL-010`すべてを参照する。scenarioはfull/incremental projection、必須証拠はconnector・lineage・watermark・redaction/query、負例境界はschema drift・cursor逆行・PII・stale-currentである。これは設計oracleであり実行receiptではない。

## 旧acceptance oracleとtest consumer

| 旧oracle / consumer | 期待結果とsourceで固定されたconsumer証拠 |
|---|---|
| `HAC-HIL-11a` 正常系 | 選択した版付きread connectorがfull/incremental projectionを実行し、lineage付きcurrent snapshot/entity/mapping/watermarkを作る。`HST-HIL-010`はL5/L8の`HST-CASE-010-01`, `-02`, `-09`、integrationの`IT-PDC-001`, `002`, `009`へ接続する。補助`IT-PDC-013`はseal後reconcile、`014`はfull同期で消えたrecordのtombstone化を扱う。原子的公開、単調なcursor、端から端のlineage、tombstoneによるmapping stale化が期待oracle。 |
| `HAC-HIL-11b` 負例 | schema drift/regression、cursor逆行、PII/secretやpolicy違反、禁止された直接write、partial result、invalid connectorでcurrent projection/watermarkを進めない。quarantine/failure証拠を残し、credential値・raw payloadを永続証拠に含めない。L5/L8 `IT-PDC-003`, `006`, `007`, `008`, `010`, `011`, `012`がこれらを固定する。 |
| `HAC-HIL-11c` 境界 | stale snapshotや無視されたtombstoneをcurrentのままにしない。source変更はstale化と再取得を明示する。L5/L8 `IT-PDC-004`, `005`, `011`, `012`, `014`は正当な削除、鮮度期限切れ、invalid/unknown lineage、policy failure、full結果からの消失とincrementalでの単なる不出現を区別する。 |
| unit consumer | L6設計の`U-PDC-001..020`はconnector契約とactivation、full/incremental計画、cursor codec、page chain、schema、canonical entity/mapping、tombstone、redaction/freshness、lineage、worker proposal、原子的projection commit/reconcile、policy、quarantineを扱う。これらはunit設計identityで、別HATでも実行証拠でもない。 |

旧consumer sourceは、 L3 HAT map `root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:43`（SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`）、L5 detail `root/docs/design/helix/L5-detail/product-data-connector.md:33-57,86-109,193-238`（asset `LEGACY-ASSET-C3DE79BA9451172F3E43`、SHA `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04`）、L5 integration `root/docs/test-design/helix/L5-product-data-connector-integration-test-design.md:1-60`（SHA `259d6f685183191a85a499c35f179f03c4808277e2eda19bba3418f45774078c`）、L6 function design `root/docs/design/helix/L6-function-design/product-data-connector.md:27-57`（asset `LEGACY-ASSET-DD66C1B6B7BE234B37E6`、SHA `48014b188ebe0c3ffe18b86fa472f048a88e248316bf2b3218aaa605a5e55f42`）、L6 unit test design `root/docs/test-design/helix/L6-product-data-connector-unit-test-design.md:1-48`（SHA `a245ed54bc0fc941877ef5b29224c4fb9c70e98f1f62dacbbb8c71d92ac9389d`）、L9 HST対応表 `root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md`（SHA `e518b0cfe15ca4b999bd85120b8d74941a18ab0939ff6cda3dc20a8b7611b705`）。 旧test設計はfake/injected sourceを使う。旧detailにあるNode/Python分担、DB port、registry schema、active version制約を現行要求として採用せず、旧sourceに根拠のある機能と失敗境界を監査対象にした。

## 現行L2/L11とauthority状態

本文全体のcurrent-main SHAを下表に記す。固定revisionの採択状態は最新本文の見出しや仮登録状態ではなく、decision recordから読む。

| 現行pair / source | latest-main file SHA-256 | HIL-11との関係・authority境界 |
|---|---|---|
| HELIX-HARNESS L2/L11 `HARNESS-L2-019` | L2 `78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6`; L11 `a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e` | [2026-09-28 HARNESS PO判断](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md)はL1対象revisionを確定し、L2/L11一式を採択した。L2-019は既存sourceのFull Reverse入口であり、由来不明はunknownのまま保持し、観測結果を承認済み要求・設計へ昇格させない。正規Product Data取得やHIL-11のfull/incremental consumer projectionは定義しない。 |
| HELIX-HARNESS L2/L11 `HARNESS-L2-027` | 同上のHARNESS files | 同じHARNESS PO判断はMPR `MPR-RC-HARNESS-L2-027-003`を明示候補24件の一つとして、固定内容と`version_target: 1.0`を採択した。採択内容は選択されたcode、DB定義/schema、API定義、設定など静的artifactのrevision-bound observationである。稼働中serviceや顧客DB dataの走査、実適用は対象外。抽出出力は観測candidateのままで、正式な要求・承認設計へ昇格しない。この採択は、外部product dataをfull/incremental取得してcanonical entity・mapping・watermarkへ投影し、複数consumerへ配るHIL-11の契約・実行証拠を含まない。027の採択scopeと#2439監査の誤記訂正は[authority訂正追補](hil09-027-adoption-authority-correction-2026-10-01.md)にも記録されている。 |
| HELIX-HARNESS L2/L11 `HARNESS-L2-038` | L2 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`; L11 `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5` | [57候補PO判断](../../decisions/po-decision-2026-09-29-57candidates.md#L43)は`MPR-RC-HARNESS-L2-038-001`のL2 digest `dd5b5450801617bbd6cc1dfd2e522420399ec58fb7675a286221dd0d9415767c`と対L11 digest `dfa3b4c245af3987ee7738cc4a3aa758bb8f113b9d06079362d978ff63731297`を採択した（coverage receiptは`authority_effect: none`）。L2本文の「旧FR-24との境界」は、HIL-FR-24を本候補へ取り込まず、038が外部Product Data取得、full/incremental snapshot、watermark、canonical entity mapping、tombstone、schema driftを実装/所有しないと明記する。これは選択scopeのReverse内容閉包契約であり、HIL-11のProduct Data ingestion契約やownerを割り当てない。 |
| HELIX-OS L2/L11 `HELIXOS-L2-015/016` | L2 `bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf`; L11 `cd0e750cab9e694eed060a619d50527239e1b1291b9550cc0c95dbbd486c7112` | [2026-09-28 OS PO判断](../../decisions/helix-os-requirements-po-decision-2026-09-28.md)は固定pairと明示候補16件を採択した。L2-015はsource identity/revision/digest/authorityとunknown/staleを、L2-016はportfolio trace/stateを扱う。対の負例はmissing/unknown/staleを保持し、projection stateからauthorityを生成しない。Product Data entity正規化、full/incremental cursor・watermark・tombstone lifecycle、HIL-11 consumerは定義しない。 |
| HELIX-CONNECT L2/L11 `HELIXCONNECT-L2-001/002` | `docs/helix-connect/L2-requirements/connect-requirements.md`および`docs/helix-connect/L11-acceptance/connect-acceptance.md` | 採択済みの一般connection pairは、connection identity、endpoint契約互換、stale再確認、適用される既存access/data-use条件下の通信適格性を担う。現行source説明は、旧product-dataのsource schema/cursor/snapshot/DB projectionを一般connection契約へ再利用しないと明記する（`connect-requirements.md:254-262`）。互換性とtransportは意味正規化や業務data ingestionの採択を意味しない。 |
| HELIX-LABO source条件 | `docs/helix-labo/L2-requirements/labo-requirements.md`, `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 採択済みの観測/source条件は、source別の許可された観測とprovenance/unknown処理を扱う。[2026-09-28 LABO PO判断](../../decisions/helix-labo-requirements-po-decision-2026-09-28.md)はWeb/WEB-OS source契約を条件付き・版/適用範囲依存とし、一般product-data entity sourceやHIL-11 consumer集合を確定しない。 |

`f6dad2a33e24f000b87d7f09b8d40288257e74cc`のHARNESS/OS固定bytesと各PO判断記録が、採択されたpairのauthorityである。現行mainの全体bytesは後続変更を含み、decisionは将来revisionを自動承認しない。HARNESS-L2-027の本文に残るcandidate/所属候補表記、MPRの`registered_proposal`と`authority_effect: none`は判断前の本文・仮登録のmetadataであり、2026-09-28の明示採択を覆さない。一般pairの採択からHIL-11のproduct data owner責務は導かれない。

既存の残差記録も同じ境界を指摘している。`legacy-auxiliary-contract-refinement-recheck-2026-09-28.md`のHIL-11行はcanonical projectionとcursor/tombstone lifecycleの未被覆を記録し、`legacy-system-acceptance-negative-oracle-audit-2026-09-28.md`のHIL-11行は負例oracleの不足を記録する。`p1-product-data-document-review-release-disposition-2026-09-29.md`は旧source identity 3件を`preserved_pending`として保持し、product scope、consumer集合、owner、導入版が未決とする。これらは関連する照合結果であり、正式successorや採択判断ではない。HIL-09の027採択authority誤記は[訂正追補](hil09-027-adoption-authority-correction-2026-10-01.md)で解消済み。本書も同追補に従って027を採択済みとして扱う。

## carry-forwardとauthority状態

旧要求4件は`docs/governance/legacy-migration/requirement/legacy-requirement-carry-forward.jsonl`で`preserved_pending_rehome`のままである（HIL-BR-15行15、HIL-FR-23行56、HIL-FR-24行57、HIL-NFR-17行119）。各行は`successor_requirement_ids: []`、`decision_record: null`で、意味変更authorityは明示的な人間decisionに限る。この監査はその状態を記録し、後継IDを割り当てずholdingも解除しない。

下流作業では、次の状態を区別する。

- **採択済み**：固定されたHARNESS/OS要求と対になる受入。各PO判断に記載されたsource scope内に限る。
- **HARNESS-L2-027の採択済み内容**：固定revision上の静的source artifact抽出。採択された出力は観測candidateであり、HIL-11の顧客data ingestionやcanonical projectionは含まない。
- **未決**：product-data scope、参加consumer集合、要求owner、正式な導入版、および旧product-data能力を保持・置換・retireする選択。`concept-mechanism-version-requirement-crosswalk.jsonl:94`と[PO判断パケット:979](../../crosswalks/concept-requirement-po-decision-packet.md#L979)にはHIL-FR-24を「2.0候補（1.0は接続・記録土台のみ）」とする既存の版配置候補があるが、これはPOによるscope・owner・導入版の確定ではない。
- **未実装・未検証**：`HAT-HIL-11`は`designed_not_implemented`のまま。本監査では現行実行receipt、snapshot/entity/mapping/watermarkの証拠、redaction/quarantineの証拠、HAT合格を確認していない。

## 限定結論

旧sourceで保持されるのは、版付きsource identity、read policy/credential reference、full/incrementalのcanonical read projection、lineage/freshness/schema/cursor/watermark/tombstone、redaction/classification、及び失敗時にcurrentを進めない条件である。旧Node/Python/DB設計を現行方式として再利用する根拠はなく、HELIX-CONNECTの一般transportやOS provenanceをProduct Data意味契約へ読み替える根拠もない。

したがって、現mainで確認できた資料からはHIL-11に相当する採択済み製品scope契約、HIL-11専用consumer set、formal successor binding、または実行受入証拠を確認できない。採択済み`HARNESS-L2-038`はHIL-FR-24を明示的に取り込まず、Product Data取得からschema driftまでを実装・所有しないと定める選択scopeのReverse契約であり、HIL-11の後継ではない。crosswalk JSONL:94とPO判断パケット:979が記録する「2.0候補（1.0は接続・記録土台のみ）」は旧HIL-FR-24の版配置候補で、POの確定判断ではない。product-data scope、consumer、owner、正式な導入版は未決のままである。これは採択済み要求への違反、製品の不要判断、1.0導入指示、retire、あるいは正式な後継要求を意味しない。source holdingと既存authority状態を維持し、意味・scope・版の決定が必要な上流判断をこの監査から生成しない。

## 静的検証範囲

旧contract→HAC/HAT→HST identityと参照、L1/IRの4 atom、既存decisionの対象、latest-main L2/L11本文の固定SHA、carry-forwardの4行、旧L5/L6 test consumerのID連鎖を静的に確認した。archive内test/runtime/CLI/hook/CIを実行せず、新世代CIも用いていない。文書・candidate・test designの存在から実装、実行、合格、requirement closureを導いていない。
