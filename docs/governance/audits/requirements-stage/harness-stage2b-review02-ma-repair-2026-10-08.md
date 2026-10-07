# HARNESS Stage 2b review02 M-a修正監査

対象はrevision 9ee03bd90393a53c21b9ed2fed01de71520192d8のHARNESS Stage 2b、固定親 HARNESS-L2-024 の AC-024-03 と R074/R096–R100 のみ。正式comment #2669 review02（6042441548）の全文・byte数・SHA-256をJSONへ固定した。authority/approval/decision effectはnone。

## 固定根拠と旧source

固定L2はrevision f6dad2a33e24f000b87d7f09b8d40288257e74ccの product-requirements.md:505/507/512/514、L11は同revisionの product-acceptance.md:247をraw span・LF込みSHAで固定した。L2:507は原文・選択肢・推奨案・影響候補をengine出力に含める。L2:514は未owner/必要形成情報不足を確認待ち候補と分離してHARNESS要求ownerへ戻す。L11:247は必要情報をengineが提示して合意待ちとする正常条件を定める。

旧RDJ-FR-003/AC-003とRDJ-FR-007/AC-007を対象行から読み、各旧sourceの全文SHAと行48–52/22–26のspanをJSONに固定した。前者は根拠付きの形成・優先要素の意味起点、後者は候補形成と人間判断/承認pending・owner/re-entryの分離起点とする。旧fixed two iterationsやruntimeは移植しない。

## 修正と由来

R074は入力にある原文/判断ownerのidentity保持と、選択肢/推奨案/影響候補を既存入力根拠からengineが形成しsource identity/revision/scopeへtraceする正常oracleに修正。R096/R100は原文・判断ownerという入力保持要素を各々欠落させるが、残る片方の入力値と、選択肢・推奨案・影響候補の形成根拠は正常のままにする。R097–R099はpacket出力そのものを入力扱いで欠かすのではなく、選択肢・推奨案・影響候補の形成に必要な既存入力根拠を各一項目だけ欠落させる。5 fixtureは「入力保持要素2件＋engine形成出力の根拠3件」であり、5つの入力要素を欠かすものではない。形成不足を示し、出力を推定・捏造せず、人の確認・合意待ち候補にせずHARNESS要求ownerへ戻す。新source依存、weight、数値は追加しない。AC-024-03とFV traceは固定L2:507/514、L11:247、旧RDJ-003/AC-003およびRDJ-007/AC-007へ同期した。

Formal review02は、review01で全5要素を入力値として扱わせた指示が由来の区別を落としていたと認めている。作成側はその依頼に忠実だった。Rootの前回検収もsource mismatchを見逃したことを本監査へ記録する。旧review記録は書き換えない。

Minor/未確認はJSONに保持し、Fableの旧承認を継承しない。CASEは実行していない。6本文のbefore/after SHA、正式body、固定span、旧source pinと最終静的検査は検証後に記録する。Rootがformal API全文・6本文before/after・固定raw span・旧source pinを独立再計算し一致を確認した。修正後HEADの独立reviewへ渡す。
