# confirmed175 DAC-FR-006 severity/disposition PO判断枠（2026-09-29）

## 目的と判断状態

この記録は、旧DAC-FR-006のsource条件と現行要求の差分を、POが選べるA/B/Cの判断枠として提示する。これはPO判断そのものではない。`authority_effect: none`、採択・正式な後継ID・source closure・owner移管はいずれも成立していない。旧source atomは`MPR-SH-CONFIRMED-003`内で`preserved_pending_rehome`として保持する。

基準はorigin/main `41b9d9a455df647115505e8f6e74bfd205481a8d`（2026-09-29）。旧文書は参照のみとし、旧CLI、runtime、workflow、test、CIを実行しない。

## 旧sourceとidentity pin

| 用途 | Asset / archive path:line | file SHA-256 | 対象行 SHA-256（改行を除く） |
|---|---|---|---|
| 旧機能要求 | `LEGACY-ASSET-D201753B1A0CC6EA3980` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/document-authority-census-requests.md:53`（`DAC-FR-006`） | `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66` | `a530b7e86791c8a5b21b9af8f34294b8be7cf12cca090b5289f518fbbf1e0ecd` |
| 旧詳細要求 | `LEGACY-ASSET-C6936A5DA79A6DAE4FE4` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/document-authority-census-requirements.md:63`（`DAC-R-008`） | `e05adb62d9ad07507f962cf060b3dbe66c161afc3f09391b29b3144ced57535c` | `6db927219a2be2b9fd211e9b7c687c247cdcb61e56bed67ad7093462d309eb38` |
| 旧受入例 | `LEGACY-ASSET-BBD687399574FEE23807` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/document-authority-census-acceptance.md:37–38`（`DAC-AC-012/013`） | `d8cddea062fa44774a44f1c2cfff5f5d1f01cd186b4abdf8d631b9577f6fd4a6` | `DAC-AC-012`: `e7bc1ff5bad012f8bfb9987c533a3a2436607f751f9ba8ff5a4eb69a54a4e80f`; `DAC-AC-013`: `cd01391d828a061ab964a108cd9a8f632ce0d1d03c7c95fcb7235e7226d42560` |
| 旧consumer認識文脈 | `LEGACY-ASSET-BB3491BEA3ED27817ACC` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/document-authority-census-recognition.md:26–27`（`DAC-BR-002/003`） | `8ec8569b3f7e5d3ecf30e8369c9264d25b4a4b6683c37382e6558881ffe515b2` | `DAC-BR-002`: `44124a97a13d0fe58cef8ececcfbcfbd5ad5200006ad415891e39e165a642b27`; `DAC-BR-003`: `f10b3541d5049cb8bbb0861c64bd9c5cbfd5f18a51dbc5cf7f268ed26a359635` |

資産台帳上、旧要求sourceはsource snapshot preservationだがproduct targetは`unresolved`、後継IDは空である。source保持は現行の所管確定や移管を意味しない。

## 旧条件と確認できる例

旧DAC-FR-006はauthority claim、active consumer、startup到達性、生成伝播を根拠にseverityとdispositionを決める。旧DAC-R-008はここへV-pair影響を加え、file名や古さのみで決めないとする。旧consumer認識はstartup、rule、generator、CLI、CI、template等のactive consumerとV-pair追従を調べる視点を示す。

旧acceptanceには、確認できる二つの端点がある。

- `DAC-AC-012`：古いがconsumerのないhistorical文書を、高severityや削除要求へ誤分類しない。
- `DAC-AC-013`：startup reachableなcandidateをcurrentとして読む場合、P0 findingとして拒否する。

この2例は結果の端点であり、severity語彙全体、状態から結果への完全なmapping、同時条件の優先規則を規定しない。特に「削除要求へ分類しない」はfinding disposition全体を定義せず、「P0」はこの一例以外へ外挿できない。

## 現行coverageと未決の意味

基準HEAD時点の[HELIX-OS L2](../../../helix-os/L2-requirements/governance-requirements.md) file SHA-256は`911e8f1eef71d35a7ad0ab381ea96cba9bffc01c4606c586687c63f16bbd02e7`、対の[L11](../../../helix-os/L11-acceptance/governance-acceptance.md)は`c67fdd664f3682dcdb865110451d0b6c31380c0b2abaadc427bc7e9a6b476d5c`。採択済み015はL2 `:642–650` / L11 `:324–330`。未採択106–109はL2 `:1326–1365` / L11 `:936–973`にある。

| 条件 | 現行関係と状態 | この判断枠で扱う境界 |
|---|---|---|
| authority出所・revision・digestとunknown/conflict/staleの保持 | `HELIXOS-L2-015` / `HELIXOS-L11-015`。2026-09-28のHELIX-OS PO判断で当該L2/L11一式を採用済み。 | 出所・未解決状態は追跡するが、旧severity/dispositionへの変換規則はない。採用済み015をDAC-FR-006の正式後継とはしない。 |
| binding参照先の再帰確認 | `HELIXOS-L2/L11-106`。DAC-FR-003一atom由来の未採択候補。 | FR-006の状態→outcome mappingを定義しない。 |
| artifact/consumer graphとsource provenance | `HELIXOS-L2/L11-108/109`。DAC-FR-004/005各一atom由来の未採択候補。 | consumer/reachability/provenanceの入力側候補であり、FR-006のseverity/disposition規則ではない。 |
| taxonomy/mapping revisionを使うhandoff | `HELIXOS-L2/L11-107`。DAC-FR-008の限定handoff候補、未採択。旧finding type自体の分類意味は保留中。 | 既存typeと選択済みmappingのhandoffだけを扱う候補で、taxonomy語彙やFR-006 outcomeを採択しない。 |

2026-09-28のHELIX-OS PO判断は固定対象の`HELIXOS-L2/L11-015`を採用したが、DAC-FR-006のformal successor・条件別closureは判断していない。2026-09-29の57候補判断にもDAC-FR-006は含まれない。上記106–109もそれぞれ限定された別source atomの候補であり、FR-006へ範囲を広げない。旧identity ledgerはDAC-FR-006を`preserved_pending_rehome`、`successor_requirement_ids: []`、`decision_record: null`と記録する。

今回確認した旧sourceからは、次の意味が決まらない。

- severityの許容語彙・定義、およびP0の一般適用条件。
- dispositionの許容集合と「削除要求へ分類しない」以外の意味。
- authority claim、active consumer、startup、生成伝播、V-pair影響の各状態をどの結果へ写すか、衝突時の優先順位・threshold。
- 結果を決める人またはowner、適用対象scope、結果の権限境界。

これらに推測値を補わず、severity labelやthreshold、owner、taxonomyを新設しない。

## POの選択肢

| 選択 | 内容 | 既存IDへの影響 |
|---|---|---|
| **A — 意味を定めてから限定再導出** | POがseverity/disposition語彙、状態→結果mapping、競合規則、適用scopeと所管方針を明示したうえで、FR-006の限定L2/L11候補と受入例を起草する。定義がない間は起草・採用に進まない。 | `HELIXOS-L2/L11-015`のauthority記録条件を維持し、置換しない。106–109およびHARNESSの別条件へ拡張しない。候補作成後も採用は別の対象revision判断に従う。 |
| **B — holdingを継続（推奨）** | `CONFIRMED-DAC-FR-006`を`MPR-SH-CONFIRMED-003`に保全し、severity/dispositionの意味と所管をPO判断待ちにする。meaning decisionが整うまでFR-006の新L2/L11候補を作らない。 | 採択済み015と未採択106–109をその状態・範囲のまま保つ。formal successor、coverage closure、owner移管を作らない。 |
| **C — 明示的な意味変更・置換またはretire** | 対象source revision、保持・変更する意味、変更理由、影響する要求と条件を指定した人間decisionを記録し、既存authority state modelに従ってsource atomを置換またはretireする。 | 015を自動successorとせず、必要な変更を明示する。意味変更/retireの判断前にholdingを閉じない。106–109の候補状態は変更しない。 |

**推奨はB**。現在の根拠で再現可能な判断は、2つの旧例を記録し未知を保持するところまでであり、分類結果を一意に決める契約は導けない。Bは既存のsource holdingを継続する選択肢であり、severity/disposition自体の採択や要求stageの完了ではない。

## 静的照合と限界

旧asset ledger、source-qualified identity ledger、source condition crosswalk、HELIX-OS L2/L11、2026-09-28 HELIX-OS PO判断、2026-09-29 57候補判断を読んで照合した。旧L1/L3とacceptanceのsource file/line digestを再計算し、current L2/L11の所在と本文SHAを確認した。参照した主な現行記録は[DAC-FR-004〜008 crosswalk](confirmed175-dac-fr004-008-condition-crosswalk-2026-09-29.md)、[HELIX-OS要求PO判断](../../decisions/helix-os-requirements-po-decision-2026-09-28.md)、[57候補PO判断](../../decisions/po-decision-2026-09-29-57candidates.md)である。

これは静的な一identity判断枠であり、旧consumer全域の閉包、severity/disposition採択、要件採否、実装、runtime、L11実行を証明しない。既存holdingsを解除せず、他のDAC-FR-004/005/007/008の状態も変更しない。
