# HIL-11 Product Data projection残差と候補の条件照合

## 基準と対象

対象は旧HIL-11のsource registry・read projectionに関係する旧原文、`HR-FR-HIL-11`、`HAC-HIL-11a/b/c`、`HAT-HIL-11`と、現行main `1cd77015081b87d5bcde7d5e45ee4e0a227e02c2`上の関連L2/L11・decision・仮登録である。専用worktreeをこのcommitから開始し、候補を最新main `d31a4c8500d131001dc349bfbdfde82fb0b46839`へrebaseした。1cdからd31の間で本候補が参照するOS L2/L11、decision、MPR register、IR carry-forwardに差分はない。その後、AAFD候補が統合されたmain `72d08ebc1b45c8cf85c0e89359c48f78eb779fee`を取り込み、既存mainのregister prefixを保持した上で本候補の6行を後置した。構築時の1cdと親L1照合時のd31は履歴pinとして残す。現在の比較先は72d08ebである。archive内の旧test、runtime、CLI、hook、CIは実行していない。旧HATは`designed_not_implemented`であり、旧test設計、現行candidate、receiptは実行・合格証拠ではない。

候補本文はHELIX-OSの`HELIXOS-L2-112` / paired `L11`として起草し、`MPR-RC-HELIXOS-L2-112-001`へ仮登録し、append-only訂正`-002`（記録時刻）、`-003`（source atom input）、`-004`（親L1 decision pin）、`-005`（HIL-FR-23/NFR-17 oracle条件とcandidate digest）を追記した。さらに`-006`でsource-linesのfile SHAとstatement digestの定義を訂正した。過去revisionは履歴として残し、latest `-006`を参照する。これは一つの責務配分提案で、HIL-11のformal successor、source owner移管、consumer集合、product scope、正式な導入版を決めない。HELIX-OS L1は2026-09-28 decisionが`f6dad2a33e24f000b87d7f09b8d40288257e74cc`上のSHA-256 `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`を対象revisionとして固定・採択し、現行main `d31a4c8500d131001dc349bfbdfde82fb0b46839`のL1 file SHAも同値である。L1の`draft_candidate` metadataは固定bytesの一部として残るが、その採択状態はdecision recordから読む。この既採択親revisionは、新規`HELIXOS-L2-112`／L11 candidateを採択しない。`version_target: 2.0 candidate`は既存crosswalkの配置案の記録でありPO判断ではない。

## 旧sourceとsource atom

出発点は旧HELIXの`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`である。file SHA-256は`db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。同じ4 identityを旧IR `requirements.json`と照合し、その4 requirement identityをcandidate inputとした。旧L1行はidentity/source条件のcross-referenceとしてsource-lines ledgerへ記録し、別atomには数えない。

| 旧identity・行 | source line SHA-256 | 条件として保持する意味 |
|---|---|---|
| HIL-BR-15, 67 | `880385839788ea49f14544ee9dd0f1ed5037bc84b1707a9ba55f4fa6a267c2f5` | 将来のproduct-data sourceを版付きconnectorで読み、由来・鮮度・schema・authorityを保持した正規projectionを設計判断、coverage、impact、Issue routing、docgen/detectorへ供給する。列挙機能はconsumer候補の由来であり、今回すべてのconsumerを採択した意味ではない。 |
| HIL-FR-23, 113 | `85a92638e7c8e010055e880609ea9c634e205df5c61f0e80bdea3fbc9be68c92` | source種別、connector/schema version、credential reference、classification、read/write方針、同期方式、owner、有効状態を追跡し、connector contract/digestへ結ぶenable/disable receiptを残し、credential値を保存しない。 |
| HIL-FR-24, 114 | `a61697f41088818ddbb852fe274453666708c8467ce3d60a538203140bbc91d4` | full/incremental snapshotを冪等に読み、source record→canonical entity→requirement/design/Issue mapping、provenance/freshness/tombstone/schema driftをread projectionへ反映し、snapshot/watermark/mapping edge/stale-drift findingを証拠とする。 |
| HIL-NFR-17, 197 | `186a5b69b53e453fec1351f40e72221a3fea749e727ba0668d842a512a9566f6` | classification、最小取得、redaction、retention、freshness SLAを扱い、PII/secret/raw payloadを通常projectionまたはagent contextへ複製しない。sourceは数値SLAやretention値を指定しない。 |

同じ要求identityは旧IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json`（SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）と現行`legacy-requirement-carry-forward.jsonl`でも照合した。各identityは`preserved_pending_rehome`、`successor_requirement_ids: []`、`decision_record: null`である。旧L1行は`legacy-requirement-semantic-line-carry-forward.jsonl`で同じidentity・file/line digestへ結ばれる。旧system-contract、acceptance、system-testは別のsource collectionである。

補助oracleは`LEGACY-ASSET-67761C517521603F844C`の`archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-11`（file SHA `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`、semantic digest `6bc63b9b4359c638f7b4f9b9809ff7871f21c9d2ee21bb86183ddfc749954cc7`）である。HAC source fileは`archive/legacy-generation-2026-09-14/root/requirements-ir/acceptance_cases.json`、`LEGACY-ASSET-4886CEF2A7AB5B7AA5C8`、SHA `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`。HAC-HIL-11a（`84127caef6713f3419bf22da1b5e3f4b56a920e35c212b7f7dcc67d10af1229a`）はlineage付きcurrent projection、HAC-HIL-11b（`b4b147b0aa9a8b9b297082c171cec93f79e80d54e688387be6afffd6f4f71907`）はdrift/regression/PII等でcurrent/watermarkを前進させない条件、HAC-HIL-11c（`2881ed4b85bbb298ab4bcf2c70caa6aaefa41be19e7964db8309c45f9487002b`）はstale/tombstoneの明示と再取得の境界である。HAT-HIL-11は`system_tests.json#/HAT-HIL-11`（file SHA `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`、semantic digest `0d9f6abfd1ae52365fa8f81807e2b583d97baa563d3d6878bd236ad52ce28695`）で、これらHACと`HST-HIL-010`を参照する設計oracleである。scenarioはfull/incremental projection、connector/lineage/watermark/redaction/query evidence、schema drift/cursor regression/PII/stale-currentの境界を束ねる。旧L5/L8 `HST-CASE-010-01/-02/-09`、`IT-PDC-001/-002/-009`の正常系、`IT-PDC-003/-006/-007/-008/-010/-011/-012`の負例、`IT-PDC-004/-005/-011/-012/-014`の境界とL6 `U-PDC-001..020`はconsumer/test設計identityとして照合し、実行しない。

旧L5/L6設計も読み、条件の由来を照合した。L5 `product-data-connector.md:33-57,86-109,193-238`（asset `LEGACY-ASSET-C3DE79BA9451172F3E43`、SHA `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04`）にはprovider source record key、versioned registry、read-only boundary、full/incremental cursor、canonical mapping、redaction/freshness、atomic snapshot/watermark、quarantine、tombstoneとfailure oracleがある。L6 `L6-function-design/product-data-connector.md:27-57`（asset `LEGACY-ASSET-DD66C1B6B7BE234B37E6`、SHA `48014b188ebe0c3ffe18b86fa472f048a88e248316bf2b3218aaa605a5e55f42`）は旧関数分割の設計資料である。旧Node/Python分担、HarnessDbPort、harness.db、transaction実装、credential store、API/test/runtime構成を現行方式に再利用しない。

## 現行で保持済みの一般条件とHIL-11固有残差

current-mainのauthorityは対象decisionから確認し、候補metadataや仮登録statusから採択を推定しない。

| 現行pair / authority | 既に保持する条件 | Product Dataとしては残る条件 |
|---|---|---|
| 採択済みHELIX-OS L2/L11-015/016、007/009（`helix-os-requirements-po-decision-2026-09-28.md`の16候補） | source identity/revision/digest/authority出所、一般provenance/event、durable projection・継続/再構築、unknown/staleをauthorityへ昇格しない | data source key/connector schema登録、full/incremental取得計画、source cursor/watermark、canonical product entityとmapping edge、tombstone/消失規則、schema drift/redaction等のProduct Data契約・oracleは確定しない。 |
| HARNESS L2/L11-019 | 既存source Reverse入口から由来不明をunknownに保持 | canonical Product Data read projectionを作らず、HIL-11の取得consumerにならない。 |
| 採択済みHARNESS L2/L11-027 | 固定revisionのcode/schema/API/config等の静的artifact observation。採択範囲は2026-09-28 decisionとauthority訂正追補に従う | live service/customer/product dataのread、full/incremental snapshot、entity normalization、cursor/watermark、consumer mappingではない。 |
| 採択済みHARNESS L2/L11-038 | 選択されたreverse対象に対する内容閉包・証拠 | 明文でHIL-FR-24、外部Product Data取得、full/incremental snapshot、watermark、canonical entity、tombstone、schema driftを範囲外とする。 |
| 採択済みHELIX-CONNECT L2/L11-001〜007 | connection identity、契約互換、stale再照合、適用中access条件に従うtransport/retry/trace | `connect-requirements.md:254-262`がproduct-data source schema/cursor/snapshot/DB projectionをgeneric connection contractへ再利用しないと明記。transport採択はprojection semantic mappingの採択ではない。 |
| SECURITY・source/consumer owner | 既存のauthority、classification/data-use、業務上のcanonical意味は各ownerの既存契約を使う | HIL-11の具体source、許可scope、canonical entity mappingと参加consumer集合は、対応する上流ownerが選んでいない。OS候補はそれを作らず参照する。 |

対応して候補化する残差は、(1) versioned source record keyとconnector/schema/mapping registrationを一体で参照し、enable/disable receiptを対象registry revision・connector contract revision/content digest・既存authorityに束縛、(2) full/incremental snapshot・cursor/watermark単調性・冪等性、(3) source record→canonical entity→明示consumerのlineage/mapping、(4) stale/freshness、schema drift、explicit tombstoneとfull消失/incremental不在の区別、(5) classification/minimization/redactionと不許可時にcurrent/watermarkを進めないnegative oracleである。enable/disable receiptのcontract digest・revision束縛と既存authority下の状態切替を含める。missing/unknown/stale freshness SLAまたはretention policy参照をunseen oracleで拒否し、値が未指定でも数値や具体主体を作らない。consumer集合、所有者、正式版も確定しない。

## 候補の意味と限界

`HELIXOS-L2-112`は既存採択済みOS-L2-015/016/007/009を置換せず、許可範囲内でread sourceのsnapshotとprojection evidenceを維持する候補である。source ownerはkey/schema/connector/source freshness semanticsを、consumer ownerはcanonical entityとmapping semanticsを、SECURITYは既存data-use/authorityを持つ。OSは明示選択・許可されたinputの耐久projectionと未解決/失敗の保持を担う提案である。CONNECTは一般transport、HARNESSは静的reverse/evidence等の既存範囲を維持する。

L11候補は旧HAC-HIL-11a（full/incremental正常lineage）、11b（schema/cursor/policy/PII等の拒否とcurrent/watermark不前進）、11c（freshness/tombstone/消失の境界）を静的fixture oracleへ再導出した。完全full/incremental実行またはruntime成立をrequirements-stage gateに加えない。source owner/consumer/正式版の上流判断をreceipt、candidate、MPRから生成しない。

## candidate input / receipt / pin

選択したsource atomは`MPR-SH-IR-003`が保持する4つのIR requirement identityだけである。対応する旧L1行はsource trace cross-referenceであり追加atomではない。補助contract、HAC/HAT、L5/L6設計はoracle/contextであって追加要件atomではない。候補のno-lossはこの4つに限定する。旧requirements IR全体、24 contract全体、system test/test consumer closure、旧candidate collection全量、formal successor、meaning change/retireは主張しない。原IR/candidate/supplementary holdingと旧carry-forwardの`preserved_pending_rehome`状態を維持する。

- Candidate base: `1cd77015081b87d5bcde7d5e45ee4e0a227e02c2`
- L2 section digest: `6bfc4a3bef86e22a0ba044be7c8b1d5539b3f00e5445b76c9e690b7b02df0ba6`
- L11 section digest: `sha256:3796ec774e093ee96d93d729b781c0980bb9eabc9339099e1ccb0f78857c6d99`
- Source atom set digest: `sha256:0ea93e048acc41d5c5bf22dede0085a1208cf29c786016a164c326131219f1d4` (4 IR identity atoms)
- Source atom file SHA-256: `sha256:8bde161da7a54a62d121179265acb1f7789d3c0d09411ad4ee94461f509caa8e`
- Receipt: `docs/governance/audits/requirement-registration/hil11-product-data-projection-coverage-receipt-2026-10-02.json`
- Source-lines: `docs/governance/audits/requirement-registration/hil11-product-data-projection-source-lines-2026-10-02.jsonl`
- Register addition: `MPR-RC-HELIXOS-L2-112-001` and append-only corrections through `MPR-RC-HELIXOS-L2-112-006` are retained in `management-provisional-requirement-register.jsonl`; latest revision corrects the exact adopted parent L1 pin and records the FR-23/NFR-17 condition additions and candidate digest, while the new L2/L11 remains unadopted with `authority_effect: none`.

registerのprefixはPR比較先72d08ebのbytesと一致し、候補001〜006の6行だけを追加している。これらは静的な候補証拠であり、判断記録や実行receiptではない。現行OS本文の追補に伴いPHCAP-14/16 inventoryの4 file SHAとbindingの現行pinを更新した。選択された原文の行・意味・分類・authorityは変えていない。
