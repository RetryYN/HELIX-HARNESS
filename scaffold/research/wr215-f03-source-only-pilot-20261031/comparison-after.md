# WR215 F03 比較後監査

対象はL5↔L8の1 V-pairに関連づくL9の2 synthetic witnessである。source-only記録を固定した後にL4/L5/L8/L9の該当class・case・witnessだけを照合した。比較前artifactは読み替えず、期待値に合わせて変更していない。

## 2 witnessの比較

| witness | 入力理由 | 既存negative class assignment | L8 expected pair結果 | L9 expected pair結果 | 実ticket / 実Reverse |
|---|---|---|---|---|---|
| `H003-F03-ORIGIN-MISSING` → `H003-L8-F03-ORIGIN-MISSING` | `origin`をnull化し、変更の正規由来が不明 | `F03_REQUIRED_PAIR_MISSING` | `pair_result.value`と`pair_results`のL8/L9/L10各`value`は全て`supported_synthetic_condition`でNORMALと同値。packet refsはcase別 | `pair_result=supported_synthetic_condition` | false / false |
| `H003-F03-TRACE-MISSING` → `H003-L8-F03-TRACE-MISSING` | `trace`を空にし、pair間のtrace辺が欠落 | `F03_REQUIRED_PAIR_MISSING` | `pair_result.value`と`pair_results`のL8/L9/L10各`value`は全て`supported_synthetic_condition`でNORMALと同値。packet refsはcase別 | `pair_result=supported_synthetic_condition` | false / false |

この表のclass欄は、既存`negative_class_assignment.classification`の値を転記したものだけであり、source-only artifactが分類を導出・確定した結果ではない。固定artifactは共通class化を確定していない。

## assignmentとexpectedの未解決差

L4/L5の`F03_REQUIRED_PAIR_MISSING`分類条件は、必要pairまたはその原traceが供給されていないのに成立扱いになること（axis `pair_trace`、state `missing`、backflow owner `HARNESS`）である。一方、2件のL8 `expected_partial_values`とL9 `expected_material`にはこのfailure codeや`missing` stateがなく、pair結果valueはNORMALと同じ`supported_synthetic_condition`である。case固有のsource packet refsは別値である。class codeはexpectedではなく`negative_class_assignment`にだけ現れる。

L5 `failure_output_contract`は、成立が確認された各ruleについて`output.failure_findings`へfindingを出すとする。したがって、現在見えているL8/L9期待がclass assignmentと対になってどのような差を検出するのか、またpair結果とtrace材料が別の意味単位かは、これらの文書だけでは解決しない。期待にmissing/findingがない点を、分類の成功や失敗として補わない。class/axis/state/ownerがexpectedと「一致」するとも、追加class差分がないとも結論しない。

## Reverse ticket条件のsource対応

固定artifactの`pair_and_trace_obligation`はL3義務の要約で、由来不明・trace欠落等を全体Reverse recovery candidateへ分ける記述を含むが、ticket発行条件を列挙する後続文は含まない。そのため固定artifactはticket候補の差を導出していない。

承認revision `771dd7e802189506d88cf9d9570c42b94cf7b8fb`のL3 `/requirements/66`原文は、Reverse recovery candidateの記述と別に、Reverse ticket発行条件として「由来欠落」を列挙する。「trace欠落」は同じ文の列挙には明記されていない。従って、origin側の`origin_missing`/Reverse ticket候補とtrace側のtriggerなし/ticket候補なしという差は、source-only artifactの導出でも、L9を見た後に初めて得た意味でもなく、artifactの要約で省略されたL3原文との対応にある。traceがticket発行を禁止されるとまでは推定しない。L9既存expectedでは2件とも実ticket発行・実Reverseはfalseである。

L4の`F03_TICKET_REVERSE_EFFECT_CONFLICT`（axis `actual_ticket_reverse_effect`、state `conflict`、owner `OS`）は、通常照合から実ticket発行またはReverse実行成功を生成した場合の分類である。現行expectedのfalseはこの実作用と矛盾しない。候補値と実作用は区別する。

## 固定source-only artifactの再利用価値と限界

固定artifactは由来不明とtrace欠落を別理由として保持し、両方に全体Reverse recovery candidateを残した。この意味はL3のpair/trace義務と対応する。ただしclassは導出しておらず、expectedのsupported pair結果とL4/L5のmissing分類との関係も解決していない。artifactの役割は、既存expectedを見ない導出過程とその固定時点を示す研究証拠である。L8/L9の新expected、case、class、oracle、algorithmとして扱わない。

現行L8へのpointer追加は行わない。既存L8は各caseのL5 contract・L9 mutation・input/expectedを参照する。source-only artifactをL8 input/oracleへ加える上流根拠はなく、ここで追加すると比較証拠と検証対象の意味を混ぜるためである。

## 読取範囲と逸脱

意図した比較対象はL4/L5のF03 class/rule、L8の上記2 caseとNORMAL、L9の対応する2 negative witnessである。先の読取で、L8の該当2 caseを表示する際に`cases`配列全体をtoolへ渡し、出力が大きく切り詰められた。未対象caseの内容はこの比較判断に使わず、本bundleへ転記しない。

旧失敗sourceを探す初回の文字列検索でもL4/L5/L8/L9 JSONを対象に含めてしまい、出力にL5の埋込`logical_source_code`が含まれた。algorithmは実行せず、その出力・内容を比較判断や本bundleの根拠に使わない。旧sourceと失敗記録の根拠はREADME記載の特定Markdown path/行を直接読んだ内容だけに限定した。

rootがbase 4beeで静的child 223 failuresを測定し、対象4文書のbase 51ebeとのbytes一致を確認した。これは4-way成立や223個の独立した意味欠陥を意味しない。4-way marker、case ID、input、既存expected、algorithmは変更していない。

## 静的な再確認案

1. 固定source-only artifactのSHA-256が`0f388cac639d6b1e056ec263849d0b133cc7e2b68b4bca2695b691d3d9bd7800`と一致すること。
2. 各caseの既存class assignmentとexpected pair結果を別々に比較し、supported結果とmissing/finding未記録の差を未解決として保持すること。
3. L3原文のticket発行条件とartifactの要約を別々に参照し、trace欠落のticket可否を推定しないこと。
4. 実ticket/実Reverseがfalseのままで、候補値をactual effectへ昇格しないこと。
5. SCF Bindingの形式・upstream hashを静的確認すること。

この記録ではalgorithm、旧runtime/test/CI、formal L8/L9検証を実行していない。
