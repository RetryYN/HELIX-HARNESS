# INTELLIGENCE Stage 5 追加修正記録（2026-10-06）

対象はStage 5の既存9親 `060/061/062/063/069/070/071/074/077` に限る。本文修正は `e50d452190ecf9aab320f721f7b519a22945f892`、基準本文は `d5df7123d8000edb1a5faafd0921e522d8e0f4da`、固定根拠はmain `5acae384305b01d10e88eeb2e6406f847baf66df` である。JSONには対象revision、固定L2/L11/PO/G0のfull/raw-LF pin、6本文のSHAとmain prefix、変更行literal/hashを記録した。

## 修正

- 062の全receipt存在・順序だけ逆転したfixtureから「最初の欠落stage」を取り除き、順序不成立として該当する既存stage ownerへ返す。実際のreceipt欠落は既存のstage別fixtureに残した。permission欠落・actor/scope不一致、isolation evidence欠落はSECURITYへ戻し、execution/verification/acceptanceは各既存ownerを保持した。
- 069ではHARNESS-L2-010のpack契約を常時照合し、HARNESS-L2-011 callのidentity/revision/scope/provenanceはそのcallを選択したoperationでだけ照合する。未選択call・期待値oracleなしの通常計算を正常例で示し、計算実行ownerをHARNESSへ移していない。
- 070ではL2-040送達契約、source/model identity、connector登録、互換判定、transport receipt、LABO consumer契約を分けた。CONNECT技術failureの独立fixtureを追加し、source identityはProduct Core/HARNESSの該当source owner、connector技術failureはCONNECT、consumer receipt/contractはLABOへ戻す。
- 074の04は旧複合fixtureの索引とし、source completeness、observation window、applicability ownerの単独unknownを04a–04cへ分割した。05eはscopeのみ、05zはscope一致・evidence不足のみとし、各ケースを別々に追跡する。
- 077の03fは旧複合writeの索引とし、Release、Assignment、merge authority/stateの各変更を03h–03jへ分けた。05mは要求対象revisionとreceipt revisionの具体的な不一致入力、他binding正常、stale/unknown oracle、選択source ownerへの戻しを明示した。
- NFR/NVを同期した。071は固定3正常scenarioと7独立negative、074は04a–cの3 unknown facetと05a–zの26 fixtureを別母集団、077-05は4 unknown補完+5直接変更+12 receipt binding+5 fallback/origin=26、070は17 fixtureとしている。077-03fの索引は独立fixtureへ数えない。

## 静的確認

- `git diff --check`: PASS。
- functional-verification内のCASE定義行は261件、ID重複なし。今回新設した10 IDはそれぞれ1回定義され、FR/NFRの範囲参照に反映済み。
- 6 canonical本文はmain `5acae384` の各ファイル全bytesをprefixとして保持。
- 前回監査の41固定source pinを、登録済みsource commit/path/行から全blob SHAとraw-LF span SHAで再計算し一致を確認した。対象6親に関係する23 pinをこの記録へ継承した。
- L3/L10文書のみを変更し、旧runtime、旧test/CI、Bunは実行していない。実装・実行、独立review、委任L3承認、PO事後確認は未実施。

## 変更fixture census

補完fixture集合は以前の129件から139件へ更新された（060:9、061:5、062:9、063:8、069:23、070:17、071:10、074:29、077:29）。内訳には新規ID 10件が含まれる。旧複合ID 062-02g、074-04、077-03fは保持するが、そこから架空の欠落・複数独立negative数を数えない。

## 不変記録と限界

従前のbody/source auditとcorrection auditは変更せず保持する。従前MDに文字どおり未展開のtemplate tokenがあるため、この追補は正確なcommit・SHA・行pinを独自に固定し、過去記録を書き換えない。継承した旧source disposition/pinの範囲外まで再読したとは主張しない。この記録は作成側の補正・照合であり、独立review、L3承認、実装/実行の証拠ではない。詳細は同名JSONを正本とする。
