# WR245 SEC009 explicit-pair測定証拠

このscaffold artifactは、比較前に固定された245行のcasewise blindと、WR236固定30行の再利用範囲を既存L9 assignmentへ行別照合し、L8/L9のcase対応を実測したものです。authority/operation effectはありません。

- 新規blind 245行は245一致、0不一致。
- 再利用したWR236固定30行は29一致、1不一致。`SEC009-OS_ASSIGNMENT-ACTIONS-EMPTY`のblind unresolved対既存L9 conflictは固定したままです。review-followupは既存conflict側の根拠を支持しますが、blind mismatchを修正しません。
- 275割当は独立blind 245件と固定blind 30件を分けて記録。全体では274一致・1不一致であり、275件すべてがblind一致とは扱いません。
- 比較前固定blindの無変更bytesを `wr245-casewise-blind-fixed.json` に収録（SHA-256 `d047fcec…0d1db97`、Issue #3510 comment `6534549651`）。入力245件、四つのphase reference、opaque ID→legacy source pointer、RFC6902 copy操作を `wr245-*` 証拠に収録しています。`validate_wr245_materialization.py` はbase source commit `4ba3f600…` のGit blobから入力を再構成し、固定前入力ファイルSHA `95343ae9…e80cc2f`、reference bytes、245件各canonical digest、固定blindおよび測定結果との一致を検証します。
- L8/L9 nested inventoryは各285行。ID重複0、集合・contract group・positive/negative区分が285/285一致します。L8 `source_case`からlegacy L9 pointerを引くと285/285が同IDを指し、legacy/current L9の`expected_proposal`は285/285で同一。L8/L9既存assignmentは275/275で同じclass、2件は未割当のままです。L9の期待condition/finding_codesはL4 classと275/275一致し、操作なしの不変条件も275/275で一致しました。

## explicit projection案と中間結果

QA §3に合わせるにはL4 `failure_classifications`のsource marker・親reverse link、L9 class tableと283件（8 positive・275 assigned negative）のintegration indexが要ります。L8から現L9 nested pathへのconsumer pointerは830件、L4 nested class pointerはL8から308件、L9から308件です。nested L9ケースをflatten/撤去するとL8の830 current-revision pointerが切れます。

そこで測定用draftはnested L9 case payloadを残し、L9にID・state・contract・class refからなる283行のindexを作ります（2 ambiguousは元nested inventoryとauditに残してexplicit class indexから除外）。L4はtop-level `failure_classifications`をexplicit sourceとして宣言し、class IDを維持したまま`code`を既存`expected_classification`値へ写し、各contractに逆linkを追加します。L4 nested class payloadは変更しないため、既存pointer targetはL8 308/308、L9 308/308で同じ型・値を保ちます。L9の既存期待値も変更せず、新indexは元caseへのpointerを持ちます。draft bytesは`checker-trials/inputs/l4-proposed-pr-a.json`、`checker-trials/inputs/l9-proposed-pr-a.json`として収録しました。PR-B overlayのL5/L8/L9試行入力も同じ`checker-trials/inputs/`に収録しています。

RFC6901でL8とL9からL4 nested分類へ向く各308 pointerを全件解決しました。提案L4のnested payloadは元値・型が各308/308で完全一致し、必要fieldも直接残ります。nested分類行に`class_id`/`id`が無いため、checker上はtop-level 30 `failure_classifications`だけが明示class sourceになります。

現L5/L8でcurrent checkerを実行した中間状態はexplicit modeのFAILでした（exit 1、4-way failures 438）。内訳はL9からL8への対応未結線285、L4 owner未解決30、L5/L8 class key欠落各30（各key/classの2報告）、L5 marker不整合1、L8 table/array不在2です。これは意図したPR-A中間状態の静的結果であり、正式4-way PASSではありません。

PR-B相当のL5/L8 draftを重ねるchecker試行では、L8/L9 explicit indexに283行（positive 8、assigned negative 275）を置き、2 ambiguous行は元nested inventoryとauditに保持したままclass indexから外すと、matched 275・4-way failures 0でexit 0でした。ただしこの試行はL4/L5の`code`を既存`expected_classification`へ変更しています。現行では`code`はL4の`class_id`とL5 ruleの`id`に30/30で一致し、L8/L9 assignmentもIDを分類・rule参照に使います。意味保存の解はまずAI設計検討と独立reviewで探ります。承認済み上流の要求意味やauthority意味の変更が必要と判明した場合に限り、その上流変更を人の判断へ送ります。現在の記録は新しいhuman gateを設けるものではありません。L8の期待値をL3/L10/L4に照らして独立に起こす意味reviewは未実施です。2 ambiguousを両 explicit array から外す場合、checkerは両層同時省略を検出できません。独立測定した285件のcrosswalk、nested source inventory、L9のunassigned auditで明示的に保全する必要があります。L4 nested pointer位置をredirect objectに置き換える必要はありません。このコード意味の不一致は未解決です。正式L4/L9はこのworktreeでは未変更です。

旧HELIX対応は`LEGACY-ASSET-D461943347D372ECF6DA`（security engagement authority候補、行24-42）と`LEGACY-ASSET-B62E49D2E156232B8C63`（security capability broker、行121-151）。権限・runtimeを移植せずSEC009の承認済み要求へ意味を再導出します。同種のcase重複失敗はQA §3が参照するPR #3835 R1 comment 6471193507に記録され、明示classとpair比較の根拠です。

旧HELIX runtime/test/CI、L4 algorithm、実停止・隔離・復旧は実行していません。静的checker試行は文書比較のみです。


## 固定証拠と再現確認

四referenceはbase source commit `4ba3f600df75aa6e860e0ddf53db68644e1edf98` のL8 `/cases/0..3/raw_input/value` と照合し、REFERENCE-1はL9 `/cases/0/given/input` とも一致します。opaque input IDからL9 `/cases/{index}/given/input` へのsource mapping、null context 231件にphase referenceから適用するRFC6902 copy operations、元fixture履歴に記録された310 copy＋remove操作を検証器が再生します。後者は `3f504b89b6f10fb4a696a3922dfa69ca3c9953bf` の記録を再生し、parent fixtureとの一致を確認します。

`python3 validate_wr245_materialization.py` はPASS。固定blindの245行とmeasurement detailを全行照合し、postfreeze comparisonとbase L9既存assignmentも確認します。検証器はclass、期待結果、assignmentを導出しません。


## 71 multi-contractと2 ambiguousの行別根拠

`multi-contract-residual-audit.json` は、71件それぞれのcase/source-input pointer、実入力のfinding pointerと値、L9 expectedの軸、L3/L10/L4各対象のID・pointer・意味、return owner、PR-Bで推測割当をしない扱いを記録します。28正例は全5 recipientを通る横断正例として保持し、43負例はevent identity 21件、expected identity 20件、trigger 1件、phase境界1件の個別値を記録しています。2 ambiguousもfinding値、戻り先、PR-B dispositionを別行で保持します。

`python3 validate_wr245_residual_audit.py` は元fixtureのGit履歴を読み、全73件のsource ID/pointer、実入力値とfinding、L3/L10/L4 crosswalk、return owner、PR-B dispositionを照合します。class割当や期待値は生成しません。


## PR #3992 R1訂正とchecker再現

R1 F1のdigest転記訂正は`r1-correction.json`に追記しました。`measurement.json`の当時固定された値は書き換えず、誤値・正値・固定blind bytesのdigestを併記し、materialization validatorが訂正値とbytesを照合します。

R1 F2向けのchecker trial入力、基底L5/L8 source revision/SHA、checker source SHA、保存report、再実行scriptは`checker-trials/`にあります。`python3 checker-trials/replay_checker_trials.py`でPR-A中間FAIL 438件（matched 0）とPR-B shape overlayのmatched 275（failure 0）を再現・照合します。PR-B試行ではL4 `code` 30件とL5 `code` 30件を安定IDから既存expected outcome値へ写しています。これはchecker形状の測定結果であり、formal L4/L5の意味承認や変更許可を示しません。R1の設計判断は安定`class_id`/rule `id`を保ち`code`を既存expected outcomeへ揃える downstream schema resolutionをAIが別途進められるとしています。既存試行draftは承認済みformal変更ではありません。


## R2 independent review disposition: 2 ambiguous cases remain unassigned

`r2-ambiguous-source-first-design.json` に残したsource-first案は、singleton patternから複合class候補を考えた設計ドラフトであり、上流にその組合せを独立分類するtaxonomyがあるかを過大評価していた。独立review後のformal PR-A案ではF01/F02複合classを追加せず、両caseを既存classへ割当てない。L3/L10/L4は331の継続・未適用・receipt未解決を個別recipientのfindingとして支持し、335のisolation/recovery両軸をunknownとして保つが、複数recipientまたは複数軸の組合せ自体を再利用可能なclassとする定義は見つからない。exact patternはいずれも元356件のsingletonである。新しい上流要求や人の承認gateは作らない。

そのためPR-Aの明示表は既存30 class、L9 integration index 283行（positive 8、assigned negative 275）。曖昧2件はnested L9 sourceと`unassigned_single_contract_negative_cases` auditに保持し、L8/L9 explicit membershipには入れない。checkerは同時省略を検出できないため、この2件のsource inventory/auditを別途検証する。71 multi-contract残差は従来どおり完全保持。L9の285 nested given/when/expected_proposalは変更なし。

このPR-A中間状態のchecker実測はexit 1、4-way FAIL、436 failures、matched 0。内訳はL9 integration未参照283、L4 owner未解決30、L5/L8 class key欠落各60、L5 marker不足1、L8 class table不足1、L8 `unit_cases`不足1。PR-BはL5/L8に既存30 classと283行のcase対応を実装してこの側の不足を解消できるが、2 ambiguousには上流根拠が追加されない限りclassを割当てない。


### Pointer count reconciliation

一時検討版ではunassigned audit rowを空配列にしたため、L9 nested pointer countを305と誤抽出した。最終案はbaseの2 unassigned audit rowとそこに含まれるL4 pointerを保持し、L8/L9とも308参照・31 unique pointer stringとなる。RFC6901の値・型・必要fieldは308/308で一致し、固定`measurement.json`の308/308と整合する。
