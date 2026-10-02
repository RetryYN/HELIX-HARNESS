# HIL-NFR-12／HELIXOS-L2-123責務境界追補

作成時の比較基準はPR #2523の旧HEAD `d948ebef2dac78e5f0642d6e64534f9fde2c3cdf`。最新main `6fcbd39232b63e731484e8e32d5362e8d58925c0` を取り込んでread-afterし、MPR 674行prefixを保持した。現PRでは既存081-001 rowをline 675へ原文bytesのまま置き、081-002をline 676に追記する。本追補は#2523 review finding F1への対応であり、旧sourceの意味、source atom、候補採択、formal successorを変更しない。

## F1への対応

両候補は旧HR-FR-HIL-09、HAC-HIL-09a/b/c、HAT-HIL-09をconsumer contextとして参照するが、扱うIR atomと保証は異なる。共通consumerはsource identityや責務を統合する根拠ではない。

| 候補 | 現在のsource scopeと保証範囲 | MPRの仮登録表示（採否根拠ではない） |
|---|---|---|
| HARNESS-L2/L11-081 | IR `HIL-NFR-12` 一atom。HARNESS側の意味oracleとして、宣言したsource scopeのpath／entry全量性、四つの偽完全性証拠の拒否、各判断のpath／entry・digest・抽出時点traceを扱う。source取得、snapshot形成、運転event、保存の実行ownerは割り当てない。 | MPR-RC-HARNESS-L2-081-001/002は`registered_proposal`／`authority_effect: none`と表示する。採否はdecision recordのexact対象照合から判断する。 |
| HELIXOS-L2/L11-123 | IR `HIL-BR-14` 一atom。ZIP・前身repository exact 2件・現行HELIX sourceのauthority receipt、receiptから導出するref／unique-entry／ref-entry-edge分母、BR-14のatomic dispositionからGateまでのtraceを扱う。 | MPR-RC-HELIXOS-L2-123-001は`registered_proposal`／`authority_effect: none`と表示する。採否はdecision recordのexact対象照合から判断する。 |

### oracleと証拠の境界

- 081のcomplete判定はNFR-12で宣言したscopeに対するHARNESS oracleで行う。OS-123候補のBR-14 authority receipt、分母、source declarationだけではNFR-12のentry列挙や判断traceの証拠にならず、登録行やconsumer共通性も同様である。ただし、receipt等の背後にあるsource evidenceで同一scope・entry・revision・digest・抽出時点が実照合されたものは共有可能で、NFR-12の全量性とtrace条件を個別に確認する。
- 123のauthority receiptと分母はBR-14候補scope内に限る。081のcoverage oracleがBR-14のauthority receipt、atom採否、requirement/design/test/Gate traceを代行しない。
- 両候補で近接する「sourceの列挙や読了だけでは採択・complete proofにならない」という条件は、それぞれのIR atomのoracleで判定する。同一scope・entry・revision・digest・抽出時点が実照合できたsource evidenceは共有できるが、片方のreceipt、採択結果、consumer一致だけから他方のoracle passを推定しない。両方の条件が適用されるoperationでは、各oracleを個別に満たす。
- 9/28 PO固定revisionで参照される旧consumerと、現行候補のscopeは区別する。HR/HAC/HATはcontextであり、旧HATは実行しない。

### 採否と責務移管

081の既存選択肢はA（NFR-12の意味oracleをHARNESS-L1-004へ接続する候補を採択）／B（targetを割り当てずholdingへ残す）。123の既存選択肢はA（BR-14列挙scopeを保つ候補）／B（holding維持）／C（明示subsetへの意味変更）である。二つの判断は独立し、一方の選択は他方の候補採択、依存、source owner割当を生成しない。123のCに基づくsubsetを081へ転用せず、081のAから123のBR-14 receiptをNFR-12の取得手段として割り当てない。

### 固定・現行証拠

- 081 source atomは旧IR `requirements.json#/HIL-NFR-12` 一件。L1 line 192はcorroboration、HR/HAC/HATはconsumer contextで別atomに数えない。旧holding `MPR-SH-IR-003#HIL-NFR-12` は`preserved_pending_rehome`、successor未割当のまま。
- 123 source atomは旧IR `requirements.json#/HIL-BR-14` 一件。L1 line 66はcorroboration、同HR/HAC/HATはcontextで別atomに数えない。`MPR-SH-IR-003#HIL-BR-14` のholdingも維持する。
- 123のsection digestsはL2 `sha256:66881747d87d799a8fcec031674d7b6ca54df0f19fffa29c2f34d30cf8e10afc`、L11 `sha256:7f7131426421fde996fed2c380184696304536aa2d1e5c117a5fd57e737f9bfd`。この追補で123本文・source ledger・MPR 123行は変更しない。
- 081のr1 receiptとMPR 081-001行はpoint-in-time記録として保持する。最新mainの674行prefixの後ろに081-001の原行をline 675へ置き、081-002 registrationをline 676へ追加した。[r2 receipt](../requirement-registration/hil-nfr12-coverage-candidate-receipt-2026-10-02-r2.json)が今回のpair本文・boundary追補を固定する。

PR review reference: [#2523 F1](https://github.com/RetryYN/HELIX-HARNESS/pull/2523#issuecomment-5944566014)。review commentは修正理由であり、要求の採択やsource authorityではない。

## 最新mainとのread-after

比較対象の最新mainは`91db17752d29c8bb8dd30a4b4bf693136bcd858f`。そのMPR 674行prefixはSHA-256 `693b5d7bc983d85a75e7680d0d95dc4ce905cc71474f9a5b0e18231bf135767e`で、今回の登録ファイル先頭674行とbyte一致する。既存081-001の行bytesとr1 receiptは変更せず、最新main prefixの後ろに081-001を675行目、081-002を676行目へ記録した。

最新mainのHARNESS本文全文SHA-256はL2 `dace6c9470a1f0ddb23129805e8458f2f28ab3b219f37db628231cc0ceb1ac47`、L11 `64a6f6b0bf05f12d04e995f73e373114b40b96c276c4fd06818a43f741c6635e`。これらはmainのbytesであり、今回追補後のcandidate full-file pinsは[r2 receipt](../requirement-registration/hil-nfr12-coverage-candidate-receipt-2026-10-02-r2.json)に分けて記録する。最新main上のOS-123 section digestはL2 `66881747d87d799a8fcec031674d7b6ca54df0f19fffa29c2f34d30cf8e10afc`、L11 `7f7131426421fde996fed2c380184696304536aa2d1e5c117a5fd57e737f9bfd`。各文書の全文SHA-256はL2 `5e8a521274d6f21deb6b10a42625e39d9e82550856efb59adccc40679f8fa9a5`、L11 `f1e3de3192aecb32b7a60352714d95ccace8ad28608dec2174a5de14da6654ec`。BR-14 receiptのSHA-256は`5c76a58d0d9f9e348b0f5a35792d355b475c876e2add3c53b4445cae964818c4`。

### adoption authorityの照合

採否はMPRの`registered_proposal`や`authority_effect`から読まず、decision recordが対象にしたexact identity・registration revisionとsection digestから確認する。9/28記録（記録commit `03b1969b26a30e9e2b68149bff2e10c5bfe78110`、判断対象revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、file SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`）は固定した明示候補24件の集合を採択するが、`HARNESS-L2-081`／`MPR-RC-HARNESS-L2-081-001`も`HELIXOS-L2-123`／`MPR-RC-HELIXOS-L2-123-001`もその集合に含まない。後続の9/29 57候補記録（記録commit `7581e0fc5f2a790eb5bf6f163e70d4b900ff4a45`、file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）と9/30 live26記録（記録commit `5744308b9194656635bbf0fee4ea5ad460b93d15`、file SHA-256 `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`）もそれぞれの全対象表を確認し、これらのexact identity／registration revisionを採択対象に列挙しない。現decision文書全体でのidentity検索にも該当はない。よってこれらは比較時点で未採択候補として扱い、source/consumerの共通性やMPR metadataで採否を補わない。各候補の判断は独立している。
