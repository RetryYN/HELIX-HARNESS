# REG-06 条件分類補正：HIL-FR-42／45

基準HEADは `db2a455bc2b868ffe8ced9d8abe91a46b6d9e551`。これはIR108の2 identityについて、旧条件と採択済みL2/L11の意味範囲を照合する読み取り専用監査記録である。`authority_effect: none`。L2、L11、IR108 matrix、carry-forward ledgerは変更しない。formal successor、要求採択、実装・受入実行を宣言しない。

## 判定

IR108 disposition matrix（固定基準commit `559ae3ba4bfe660d666a57f227466d7dcdd440d9`、SHA-256 `0e26f66e4d593f7f710e17b8c2349dffd5849467f208fc5fbdda635e31dd224d`）では、HIL-FR-42とHIL-FR-45はいずれも `adopted_meaning`／`remaining_condition: null` とされている。本照合ではこのnull分類は旧行全体を説明しないと判断する。FR-42では未消込等の追跡・Backflow・no-loss gateは再導出されているが、未解決の設計義務が1件でもあればpair-freezeを拒否する条件が残る。FR-45ではsource atomの全件行先、stale/digest不整合拒否、人間decisionの境界は再導出されており、残るのはsplit/merge等のidentity変更種別ごとにbefore/after両semantic digestを含むreceiptを適用前提とする明示条件である。

両要求のcarry-forward状態は [`legacy-requirement-carry-forward.jsonl`](../../legacy-migration/requirement/legacy-requirement-carry-forward.jsonl) のFR-42（75行目）・FR-45（78行目）にあるとおり `preserved_pending_rehome`、successor IDなしのままである。補正はこのauthority状態を変更しない。

## 固定した旧source

両行の旧文書は [`infinity-loop-platform-requirements.md`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md)、asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` である。IR carry-forward ledgerの旧Requirements IR pointerは同じ要求を `requirements.json#/HIL-FR-42` および `#/HIL-FR-45` として記録し、IR source file SHA-256は `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。

| ID／source行 | 旧行SHA-256 | 旧条件の要点 |
|---|---|---|
| HIL-FR-42、132行目 | `346e683c5f9c58018a57c29e652b84b79612466a24a3df6124d271ac0ddeddb8` | sourceから設計・oracle・gateまでを双方向に結び義務を生成する。未消込・孤児・placeholder・根拠のないN/A・aggregate一括消込が1件でもあればpair-freezeを拒否する。出力はobligation graph、discharge/coverage receipt、未消込finding。 |
| HIL-FR-45、135行目 | `618f08eec7918d50938b2b09914da9be34524d5f9662b5bdfd1dfa43aed4b871` | typed edgeで要求revisionと由来・authority・oracle・設計義務等を保つ。split/merge/rename/supersede/reject/N/Aは、before/after semantic digest、全source atomの処置、downstream stale、review authorityを持つreceiptがある場合だけ適用する。 |

両IDは行末に独立した旧出力欄を持つが、旧runtime/test/CIは実行・参照していない。ここでの結論は旧条件文と現行契約文の比較であり、旧oracleの実測再現ではない。

## 採択済み現行条件と残差

採択状態はcandidate metadataでなく、[HARNESS PO判断記録](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md)（SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`）と[OS PO判断記録](../../decisions/helix-os-requirements-po-decision-2026-09-28.md)（SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`）から読む。HARNESS-L2-004/009はPOが合意したHARNESS L2/L11一式に含まれ、HELIXOS-L2-015/016/019はPOが採用したOS候補集合（014–029）に含まれる。PO判断が固定した対象revision（`f6dad2a33e24f000b87d7f09b8d40288257e74cc`）のSHAはHARNESS L2 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、HARNESS L11 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`、OS L2 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`、OS L11 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`。引用する既採択行はこの固定本文にも存在し、`db2a455`までの後続差分では変更されず、候補追補だけが追加されている。以下の各文書SHAは照合対象の `db2a455` 本文を識別する。

### HIL-FR-42

採択済みHARNESS-L2-004は要求変更から影響する設計・testと再検証範囲を導き、変更条件の検証漏れを識別する。HARNESS-L2-009はversioned templateから設計義務を導き、必須input不足をBackflowできる。対L11はtrace欠落、templateの適用差、required input不足を確認する（[HARNESS L2](../../../helix-harness/L2-requirements/product-requirements.md) SHA-256 `6c3023f9ca2be5d33f8e66ae2f2f0691bf69ff8070cfa386c953168e2d6eace9`, lines 55, 60; [HARNESS L11](../../../helix-harness/L11-acceptance/product-acceptance.md) SHA-256 `92e5fef1771fb24c1c1cb110cc105a1b9fd58d73d003615ea17be09922f3a616`, lines 24, 29, 69, 129–130). 採択済みHELIXOS-L2-016は要求から関係先へのtrace、未接続・unknown・staleの状態を分け、未解決edgeを下流完了に進めない（[OS L2](../../../helix-os/L2-requirements/governance-requirements.md) SHA-256 `39b52c81e38cd7301a0efaaf76fa3dd9da046df574b4236da8e6a3cdf4bb9387`, lines 652–660; [OS L11](../../../helix-os/L11-acceptance/governance-acceptance.md) SHA-256 `dd91b61c131a32caa440d9ae8f3248fe900e7406fee85c07555452b0d4b77cef`, lines 331–336).

OS側にも採択済みL2/L11の共通保持条件がある。[OS L2](../../../helix-os/L2-requirements/governance-requirements.md) SHA-256 `39b52c81e38cd7301a0efaaf76fa3dd9da046df574b4236da8e6a3cdf4bb9387`, lines 23–25 は要求意味の無承認変更を止め、入力source atom完全集合・保持先・人間decision対象・HARNESS無損失receiptを登録し、未計上・stale・digest不一致等が1件でもあればmerge可能にしない。[OS L11](../../../helix-os/L11-acceptance/governance-acceptance.md) SHA-256 `dd91b61c131a32caa440d9ae8f3248fe900e7406fee85c07555452b0d4b77cef`, lines 44–45 は各atomの行先、source集合digest、候補semantic digest、`authority_effect`、template義務・N/A・Backflow・消込を照合し、template欠落の自由形式fallbackを拒否する。このためFR-42のsource atom no-loss、根拠のないN/A/未消込の可視化・差戻しは採択済み意味として保持される。

HARNESS-L2-025/026と対L11も、要求から設計要素・oracleへの双方向trace、構成体固有義務、unknown/不一致時の差戻しを採択済み範囲で確認する。それでも、上記のsource atom gateはsource→要求の無損失割当と要求PRのmergeを対象とし、全設計義務の消込完了をpair-freeze前提にするものではない。未解決の義務・孤児・placeholder・根拠のないN/A・一括消込が1件でもあればpair freezeを拒否する旧FR-42条件は残る。

matrixがFR-42に列挙するHARNESS-L2-003/004/005/008/010/011/014/022/025/026、HELIXOS-L2-015/016/019/020は全て採択済み本文で確認した。003/005は工程gateと検証義務、008は要求意味形成、010/011はpack境界と呼出し条件、014/025/026は設計提供・unit/composite trace、022はpairごとの検証/受入stateを扱う。OS-015/016/019/020はauthority記録、relation/stale、continuity、検収/CI運転を扱う。これらは隣接するtrace・検証・進行条件を満たすが、個々のdesign obligationが全消込済みであることをfreeze時に判定するcondition-level gateは定めない。HARNESS-L2-004/009とOS L2 `:23,25`、OS L11 `:44,45`はmatrix target外も含めて関連条件として追加確認した。

近似候補の境界も確認した。HARNESS-L2-041（[L2](../../../helix-harness/L2-requirements/product-requirements.md) lines 957–966、[L11](../../../helix-harness/L11-acceptance/product-acceptance.md) lines 699–709）はactive templateの指定scope内抽出候補で、旧HIL-FR-47由来かつ未採択である。HARNESS-L2-044（同L2 lines 1002–1011、同L11 lines 735–745）は別source HIL-FR-54由来の未採択portfolio候補で、未被覆classと意味重複ゼロを検査する。044は欠けたgateに意味的に近いものの、いずれもFR-42を採択済みで満たす証拠にも、FR-42のsuccessorにもならない。

### HIL-FR-45

採択済み[OS L2](../../../helix-os/L2-requirements/governance-requirements.md) `:23,25` はsource集合・HARNESS無損失receipt・各atomの行先を要求PRへ束縛し、未計上atom、stale、digest不一致、wrong product、仮登録欠落があればmerge可能状態にしない。意味変更・縮退・retireは人間decisionなしに登録しない。対の[OS L11](../../../helix-os/L11-acceptance/governance-acceptance.md) `:44` はsource atom集合digest、候補semantic digest、無損失receipt、保持先または人間decision対象への各atom割当を検査する。これによりFR-45のsource atom全件処置と authority gate は既採択条件で保持される（OS L2 SHA-256 `39b52c81e38cd7301a0efaaf76fa3dd9da046df574b4236da8e6a3cdf4bb9387`; OS L11 SHA-256 `dd91b61c131a32caa440d9ae8f3248fe900e7406fee85c07555452b0d4b77cef`）。

matrix対象のHARNESS-L2-003/004/005/008/010/011/014/022とOS-015/016/019/020は全て確認した。003/008/014は意味・人間判断・Backflow境界、004/005/022は要求変更影響・検証/受入義務、010/011はpack/呼出し契約、OS-015/016/019/020はprovenance・stale/trace・continuity・検収状態をそれぞれ扱う。これらはsource atom全件割当やauthority gateを補強するが、OS L2 `:23,25`／L11 `:44`が既に担うno-loss条件を重ねて要求する根拠にはならず、identity変更の個別適用条件も明記しない。

したがってFR-45の残差は、旧条件が列挙するsplit/merge/rename/supersede/reject/N/Aのうちどのidentity-change operationを適用するかを明示し、そのoperationに対応するbefore/after両semantic digestを一つのchange/applicability receiptへ束縛してから適用する条件に限定する。atomごとの行先、no-loss判定、人間decision境界、stale/digest拒否は採択済みOS L2 `:23,25`／L11 `:44`等にあるため、残差として重ねて数えない。現行条件は候補semantic digestとsource atom集合digestを持つが、両方をidentity-change operationの前後意味digestとして区別し、operation-specific receiptの成立を適用条件にすることまでは明示していない。新しい要求やledger schemaは提案せず、この旧条件と採択済み一般gateとの残る差だけを記録する。

## REG-06分類差分と除外範囲

既存の[IR108 matrix](legacy-ir108-disposition-matrix-2026-09-28.json)は本2行を `adopted_meaning`／`remaining_condition:null` と記録している。本監査の条件単位照合では、FR-42/45それぞれ上記の残差があるため、そのnull分類は旧行全体について支持できない。加えて、matrixの `current_target_file_sha256` はmatrix基準commit `559ae3ba4bfe660d666a57f227466d7dcdd440d9` のbytesを指し、PO固定対象 `f6dad2a` と本監査基準 `db2a455` の対象file SHAとは一致しない。matrixのdisposition記録を参照する一方、採択意味の照合はPOが確定したrevisionおよび `db2a455` まで不変の引用範囲から独立に行った。対象はこの2行だけで、108件全体の未対応件数やsource closureを再集計しない。carry-forwardの未配置状態も変えない。

HIL-FR-43（matrix同じく `adopted_meaning`／null）はこの記録の対象外とする。採択済みHARNESS-L2-008/024と対L11に意味単位の比較、欠落・追加・対象違いの検出、質問・訂正への差戻しがあり、旧行の厳密なatom出力形式／challenge queue名だけではmaterialな意味欠落を確定できないためである。これはFR-43全条件の独立な再証明ではない。

## 検証範囲

- 旧source、全matrix target ID、上記の追加関連L2/L11条件、PO判断記録、matrix、carry-forward ledger、PR #2275のreview comment `#issuecomment-5871552571` を静的に照合した。旧runtime・test・CIは実行していない。
- 本記録の追加は監査証拠であり、要求本文や既存matrixの書換え、採用、successor割当、要求段階完了を意味しない。
- baselineの本文SHAはmatrix値と一致する。REG-06 population audit JSON（SHA-256 `286352584c5ef17195b71c57be165eaf2b1d2da1a2877b53258b65e6ec58f4e6`）は母集団・relation join監査で、個別condition完了を主張しない。
