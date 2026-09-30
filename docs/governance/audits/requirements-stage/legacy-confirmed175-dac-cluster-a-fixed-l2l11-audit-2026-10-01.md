# confirmed175 条件比較: DAC cluster A 5 identity

## 目的・判定範囲

基準main `29bbd42f8c5d4399776b9b5cfc4fc18f789ea300`で、Document Authority Census旧L1の機能要求3件と非機能要求2件を、旧L3契約・L10受入oracleから固定f6 L2/L11へ静的に照合した。対象は同じ旧asset `LEGACY-ASSET-D201753B1A0CC6EA3980`の次のsource-qualified identityである。

| Source-qualified identity | 旧L1 | 判定 |
|---|---:|---|
| `helix/L1-requirements/document-authority-census-requests.md::DAC-FR-001` | 48 | 部分的な一般記録契約。exact-HEAD inventoryは未対応 |
| `helix/L1-requirements/document-authority-census-requests.md::DAC-FR-002` | 49 | 一般のpack/authority記録のみ。classごとのbinding scannerは未対応 |
| `helix/L1-requirements/document-authority-census-requests.md::DAC-FR-003` | 50 | 一般のauthority記録と局所近接候補。再帰的なactive-edge拒否は未対応 |
| `helix/L1-requirements/document-authority-census-requests.md::DAC-NFR-002` | 64 | compatibility等の存在を欠陥扱いしない境界に部分接続。active-decision利用拒否は未確認 |
| `helix/L1-requirements/document-authority-census-requests.md::DAC-NFR-003` | 65 | 文書種別・consumer別metadata適用条件は未確認 |

旧L1 source file SHA-256は `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`。旧L3は `document-authority-census-requirements.md`、file SHA-256 `e05adb62d9ad07507f962cf060b3dbe66c161afc3f09391b29b3144ced57535c`。旧L10は`document-authority-census-acceptance.md`、file SHA-256 `d8cddea062fa44774a44f1c2cfff5f5d1f01cd186b4abdf8d631b9577f6fd4a6`。各source atom、関連契約、反例行の個別SHA-256は同名JSONへ記録した。

旧L1のidentity carry-forward台帳では5件ともsource status `confirmed`、carry-forward `preserved_pending_rehome`、successor未割当、変更authority `explicit_human_decision_only`である。資産明細台帳のrow 421 / revision 3 / row SHA-256 `eeace2db2a8183a6563428d4c486dedeb7a0ba0286703b195948c5cd4e749f56`は同一asset ID・archive path・source SHAを示し、holding `MPR-SH-CONFIRMED-003`とsemantic-line inventoryのidentity/line SHAも照合した。statusを変更せず、successorも割り当てない。

## 旧契約とnegative exception

旧L3はDAC-FR-001にtracked exact HEAD、path/blob identity/digestの固定を課す（R-001）。FR-002ではclassをpath名から推測せず、class-specific schema/catalog/frontmatter/owner registryを組み合わせ、競合をambiguousとして拒否する（R-002）。dispositionは自己申告を証拠にせず、authority index・candidate registry・archive境界・generation provenanceへexact joinする（R-003）。

FR-003のL3 R-004は参照先が存在するだけでは足りず、disposition・epoch・owner・digestを再帰検査し、cycle・dangling・dead authorityを拒否する。R-013では`input_policy`をlifecycle dispositionと分け、temporary/migration/compatibility/historical inputにowner、expiryまたはretirement condition、consumer scopeを適用する。missing情報は推測せず、期限切れ・旧authorityをcurrent edgeまたはcurrent outputへ昇格させない。

L10はこの境界をnegative oracleまで具体化する。AC-001はuntrackedまたはdirty-working-treeだけの文書をinventoryから除外し、AC-002はtracked blob変更時にdigestとinventory revisionが変わることを要求する。AC-003はpath/catalogのclass競合をfail-closeし、AC-004はhistorical frontmatterのcanonical自己申告を拒む。AC-005/006はcompatibility targetへのcurrent edge、cycle、danglingを検出する。AC-012はconsumerのない古いhistorical文書を高severityや削除要求に誤分類しない一方、AC-013はstartup reachable candidateをcurrentとして読む場合P0で拒否する。AC-021..023はtemporary等に必要情報が欠ける場合、またはcompatibility/historical inputをcurrent authority/outputへ投影する場合の拒否境界を定める。

DAC-NFR-002の中心は「compatibility/historical/referenceがある」こと自体と「active decision inputに使う」ことの区別である。NFR-003はすべてのMarkdownへ共通metadataやRequirement IDを一律要求しない。L3のclass-specific schemaおよび入力policyは適用単位を示すが、全ファイル同一metadataを意味しない。

## 固定f6 L2/L11との条件比較

POの固定対象はHELIX-OS L2/L11のrevision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。判断記録はL2/L11の対象本文SHA-256をそれぞれ`c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`、`925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`として固定し、HELIXOS-L2-015とその対L11を採用候補集合に含めた。監査HEADでの対象節line pinsはJSONを参照。

HARNESS-L2-010/011も共通契約として比較した。010は各packのinput/output/dependency/verification/version/owner、収載境界、再現・rollbackを扱う。011は画面なしのcall、capability/contract/dependency version照合、渡された権限・隔離、進行/結果/証拠、停止再開と非対応version等の負例を扱う。この一般契約は、Censusのartifact分類やinventory authorityの代替ではない。

| Identity | 固定f6で保持する隣接契約 | 固定f6で確認できない条件 |
|---|---|---|
| DAC-FR-001 | OS-015は対象/source identity、revision、digest、判断出所と訂正/stale/conflictを記録する。HARNESS-010/011は選択pack/callのversionとscopeを扱う。 | Git tree exact HEADから全対象artifactを列挙し、working tree/未追跡fileを排除するinventoryとAC-001/002のoracle。 |
| DAC-FR-002 | OS-015のauthority/projection記録、HARNESS-010のpack identity/version/dependency/scope/owner。 | artifact classとlifecycle/input policyの分離、class-specific schema/binding、exact join、path/catalog競合の拒否、自己申告を拒むclass-binding scanner。 |
| DAC-FR-003 | OS-015のprovenance/revision/digestとunresolved conflict、HARNESS-011の選択callに対するversion compatibility。 | binding chainの再帰走査と、ownerが失効/compatibility/historicalとしたtargetへのcurrent-edge拒否、cycle/dangling/dead-authority oracle。 |
| DAC-NFR-002 | OS-015のauthority・stale・unknown保持。後発OS-110は明示された範囲でactive edgeがないcompatibility/historical/referenceをfindingにしない条件に部分接続。 | その存在のみを欠陥にしないことに加え、active-decision useを拒否する一般条件。OS-110は当該拒否規則を確定しない。 |
| DAC-NFR-003 | OS-015 metadataはその管理record、HARNESS-010/011 metadataは選択pack/callに適用。 | Markdown種別・consumer relationごとのmetadata/Requirement ID適用性と、全Markdownへ一律適用しないoracle。 |

OS-015のL2/L11はsource・対象revision・digest・判断出所を追跡し、原eventを保った訂正を扱う。projection上のPR/Issue/CI stateからauthorityを生成しない。これは要求一般の管理契約である。L2/L11にはDAC専用のtracked-tree census、class resolver、再帰binding scanner、文書metadata applicabilityは明記されていない。HARNESS-010/011もpack/callの契約であり、この不足を埋めない。

## 後発57/11/live26判断の近接screen

57候補判断（`HDEC-REQUIREMENTS-57-2026-09-29`）、11候補判断（`HDEC-REQUIREMENTS-11-2026-09-29`）、live26判断（`HDEC-REQUIREMENTS-LIVE26-2026-09-30`）とその明示registration identityを、5つのsource-qualified identityとの完全一致と意味近接で照合した。完全一致は全decisionで0件。57/11の採択対象から5条件へ接続する意味近接行は確認しなかった。live26では次の局所候補を個別に比較した。全件とも別のOS requirement identityであり、旧source identityのsuccessorまたはclosureではない。

| 後発採択identity / registration | 固定節digest（L2 / L11） | 近接範囲と限界 |
|---|---|---|
| HELIXOS-L2-106 / `MPR-RC-HELIXOS-L2-106-001` | `b1f3d62a…9598fcc` / `bc577dbc…d32bc835` | DAC-FR-003の1 atomだけを明示入力した候補。再帰確認は入力されたbinding/reference chain内に限定。全repo census、追加status規則、owner移管、formal successor、FR-003 closureではない。receiptは`requirement-registration/dac-fr-003-authority-binding-coverage-receipt-2026-09-29.json`。 |
| HELIXOS-L2-108 / `MPR-RC-HELIXOS-L2-108-001` | `c02375c0…1670a0d` / `bdfa0e18…81a36e` | 旧DAC-FR-004の明示artifact/consumer scopeとowner提示forward relationが対象。未列挙範囲をcompleteとしない。選択したFR-003や全inventoryの代わりではない。 |
| HELIXOS-L2-109 / `MPR-RC-HELIXOS-L2-109-001` | `29d7ec73…fa96d80` / `0af4980b…97ca25d3` | 旧DAC-FR-005の選択source→generator→artifact→consumer chainだけを対象。全provenance inventoryではない。 |
| HELIXOS-L2-110 / `MPR-RC-HELIXOS-L2-110-001` | `fe250f3c…d86e43be` / `56926a9d…e18452d34` | 旧DAC-FR-010の限定epoch/consumer差分。NFR-002の隣接nonfinding条件は持つが、active decision利用を拒否する追加規則は明記されず、DAC-NFR-002を閉じない。 |

ライブ26のPO判断は106/107を根拠不足時の未解決保持、108/109/110を明示入力範囲に限定して承認している。106のsourceはDAC-FR-003だけであり、FR-001/002またはNFR-002/003へ広げない。108/109はそれぞれ旧FR-004/005の候補、110は旧FR-010の候補であり、本監査対象のsource identityへの採択・後続割当ではない。

## 重複確認・方法・限界

- confirmed175 population、identity/semantic carry-forward台帳、既存requirements-stage Markdown/JSONから5つのsource-qualified identityを検索した。full audit/queue/inventoryのpopulation rowは個票の意味比較ではない。
- related contextとしてDAC-FR-003の局所候補監査、DAC-BR-001..005監査、DAC-NFR-001/004/005監査を読み、重複した条件比較を避けた。
- 旧L1、L3、L10 source/consumerと固定f6 L2/L11の関連行を読み、原文条件と負例を保った。ファイル・line SHA-256をJSONへ記録した。
- 旧CLI/runtime/hook/test/CIを実行していない。実装・scanner・L11 oracleの実行結果は扱っていない。

## 状態

| 項目 | 結果 |
|---|---|
| 5 source identity | `preserved_pending_rehome`を維持 |
| source owner / successor | 未決 / 未割当 |
| 固定f6比較 | OS-015、HARNESS-010/011は一般契約として部分接続。Census固有条件は残差 |
| authority effect | `none` |
| implementation / execution / acceptance closure | 主張しない |

この監査は旧要求の意味変更、採否、owner移管、successor割当、L3承認、実装・実行・受入、要求stage closureを生成しない。
