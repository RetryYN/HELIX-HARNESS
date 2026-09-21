# PHCAP-19 Learning／改善 research premise candidate

`status: research_premise_candidate`、`authority_effect: none`の静的候補である。基準HEADは
`e21962d3aad689b260f6396ec2dc862df6f1fce3`。Issue #1907はsemantic authorityとして使わない。
base SHAは候補の取得時点を記録するmetadataであり、mainの最新性を恒久gateにしない。source/current refの固定digestはvalidatorとscfctl staleで検査し、baseだけが進んだ場合は候補の意味を変えない。

## gapと境界

PHCAP-19の候補scopeはHELIX-OS、HELIX-HARNESS、HELIX-Web、HELIX-Web-OSの4製品だが、inventoryが直接current evidenceとして挙げるのはHELIX-OSのL2／L11だけである。HARNESS、Web、Web-OSは直接current ref欠落を`unknown`として保持する。隣接するL1／L2／L11候補文書の存在から未実装・実装済み・運用成立を推定しない。

- **HELIX-OS候補**: 観測、finding、candidate、learning promotion、memory／process projection、改善候補の採否・再観測を統制する。証拠を要求へ直接書き換えず、人間の採否と対象別backflowを保持する。
- **HELIX-HARNESS候補**: V-model、要求意味、設計・検証・pair、改善候補から最上流への差戻し、再合意、再検証の工程契約を所有する。学習運転、memory、project管理はOS側に置く。
- **HELIX-Web候補**: 利用者向け結果、目的・範囲・同意、Web固有の改善受入を所有する。横断学習やOS内部管理をWeb要求へ一括転用しない。
- **HELIX-Web-OS候補**: service runtimeの観測、tenant／data scope、log・telemetryの最小exportを所有する。credential／tenant原dataをOSへ暗黙共有せず、改善proposalから要求を直接変更しない。

4製品は候補unit／connectionであり、正式owner、要求採否、successor、実装許可を確定しない。

## 旧assetのbounded closure

対象はinventory代表5件に限定した。

1. `LEGACY-ASSET-02D897E62EF2FA267267`: L3 Universal Improvement Loop requirements
2. `LEGACY-ASSET-D65FB82C21C5EDBDFCE4`: L5 memory learning promotion design
3. `LEGACY-ASSET-C544D3D166699301485D`: L6 improvement source registry design
4. `LEGACY-ASSET-57A29D57A3AD07CA4DFF`: old finding qualification implementation source
5. `LEGACY-ASSET-0B5B38F146D9538C9A36`: L10 acceptance test design

5件すべてで台帳は`disposition: unresolved`、`implementation_status: unknown`、`consumer_refs: []`。append-only判断ログの該当行は0件である。source本文の`confirmed`、旧実装source、test design、promotion contractは歴史的記述として保持し、実行・pass・現行適合へ昇格しない。source spans、failure evidence、consumer候補、phase／product分類は`inventory.json`でassetへ紐づけた。

source spanはbounded sliceであり、各ファイルの未選択行、関連する全asset、全consumer closureは残差である。PHCAP-20 memory／継続との意味atom分割も未解決である。

## 検証境界

validatorはarchive bytes、exact source lines、asset／phase ledger、decision-log absence、current ref digest、製品境界とunknownを静的に照合する。selfcheckは直接current ref捏造、source改変、implementation／consumer／decision promotion、旧実行、矛盾削除を陰性例として拒否する。旧runtime・旧test・旧CIは実行していない。
