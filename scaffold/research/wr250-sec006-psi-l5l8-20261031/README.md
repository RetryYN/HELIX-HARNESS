# WR250 SEC006 L5/L8 candidate evidence

## 境界と根拠

本ディレクトリはWR250で追加したL5 failure rules、L8既存negative rowsの分類割当、各L9負例に対するL8 candidate案、および行別の静的照合を記録するscaffold evidenceである。authority effectはなく、候補は正式なtest/oracleではない。L4/L9本文、L9 expected/oracle/residual、認証・認可構成、実動作は変更していない。

設計起点はbase `1b155cc648d589d32ca111efb3fbfcea1c4048b7` のL3 F01/F02、L10 F01/F02、L4の10 `failure_classifications`。legacy比較は `LEGACY-ASSET-D461943347D372ECF6DA` と `LEGACY-ASSET-349061A71CEF2554B9A7`。#3918 L5/L8 precedent、#3987 L4/L9 10分類・98割当、#3992 review comment 6534981379も照合した。旧本文はコピーしていない。

## L5/L8 candidate案

- L5にL4の10分類へ結ぶfailure ruleを追補した。classification、axis/state、side effect、owner、preserved behaviorを持つ。
- L8既存52 negative rowすべてにsource-backed `negative_class_assignment` を追補した。L8の局所findingと`expected_result`は保持した。
- L9の98 negative rowごとに1件の簡潔なL8 candidate案を置いた。各counterexampleは行固有の短文で、全fixture JSONをL8へ複写していない。各期待はL3/L10/L4 source pointerから導出した分類、ordered finding codes、axis/state、side effectである。L9は行別比較先であり、期待の根拠ではない。
- 候補98件は`oracle_id`と`test_citation`がnull、`execution_state=not_executed`。候補数や比較結果を実行・test evidenceとして数えない。
- #3992 reviewに沿ってL5 `code`は`expected_classification`の意味を表す。L4の`code`との不一致はL4を変更せず記録した。key/ID改称では一致させていない。

## 行別照合と限界

`rowwise-comparison.json`は98行それぞれのcandidate ID、L9 source pointer、source class pointer、短い反例、実入力field audit、期待比較を記録する。反例文のfield値はL9 counterexample内の該当pathから照合し、auditでpresent・explicit null・omittedを区別する。期待比較はcandidate対L4 classのcondition/finding_codes/axis/state/side effectと、L4対L9のcondition/ordered finding_codesに限定し、各対応値を行別に記録した。L4対L9で比較可能なconditionとordered finding_codesは各98/98一致。full expected object、preserved fields等は比較していない。

candidateはL9各rowの比較pointerをscaffoldに一意に記録する設計案だが、既存L8 52件とL9各行の同一counterexample/期待対応を確認した証拠ではない。既存L8行はclass-only assignmentのまま個別crosswalkを推測しない。形式上のL8↔L9一対一、実行、oracle、test citationは未成立である。

L9の`multi_contract_residual`には16 negative rowsがあり、98 main negative casesへ加算していない。4層すべてにexplicit equivalence markerがないため追加・選択していない。check-childはlegacy modeの中間FAILで、verification summaryに実測結果を記録する。pair/cap/pin PASSは4-way PASSを意味しない。

## bindingと検証

SCF-B-0201のWR244固定blind/comparison/audit/summaryは書き換えていない。binding内にWR244時点の旧L5/L8 hashesとbase revisionを保持し、WR250で追補した現行L5/L8だけを再束縛した。これは#3991のSCF-B-0203 precedentに沿う。同一bindingを追補し、重複bindingは作っていない。

実施したのはJSON、ID、pointer、hash、行別条件/finding code、checker、scaffold validate/staleの静的確認のみ。旧runtime、test、CI、CLI/hook、L4 algorithmは起動しない。
