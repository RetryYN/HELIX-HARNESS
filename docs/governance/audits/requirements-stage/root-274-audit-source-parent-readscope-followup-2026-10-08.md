# 274親 index 追補：77監査sourceのparent別scope・固定根拠

- これは `/tmp/root-274-finding-unknown-residual-extract-2026-10-08.md/json` のappend-only追補。先行ファイル、元index、既存監査sourceは変更していない。
- 元index: `docs/governance/audits/requirements-stage/l3-stage-274-semantic-audit-index-d629e2525-2026-10-08.json` at `d629e25254a7c1d505543a0ce6ca3183c3fc4d67`, SHA-256 `95447df5f9f63e07e19cd884744a48328031f5cdc1dea2d22602871314b9458f`。77 audit refs / 71実source snapshots。全77 refのsnapshot bytes/length/SHAをindex pinと照合し一致。
- source本文は全77件を新たに意味全文reviewしていない。機械的なbytes照合・JSON/Markdownの範囲と固定pinのlocator抽出を行い、過去auditに記録された読了範囲と今回の再読範囲を分離した。

## 読scope抽出と監査未読の区別

- 元indexの302 parent-to-audit参照のうち、120はJSON pointer等の親別locator付き、214は「group-level scope; no machine-readable parent-specific locator extracted」。274親では116親に少なくとも一つ親別locator、157親は参照がgroup-level locatorのみ、OS036は参照なし。JSON sourceでは固定parent/L2/L11に関する構造化field locatorが40件、Markdown sourceでは固定親記述を含むlocator行を25件抽出した。残る12件はこの規則で固定locatorを抽出できていない。これは根拠不在ではなく抽出形式の限界であり、該当原文を個別確認する余地が残る。
- **group-level locatorは監査未読を意味しない。**元source metadataは各audit refについてmechanism/scope_parent_suffixesを持ち、対象parent groupを宣言する。JSONの親別record/固定pin pointer、Markdown上の行特定が機械抽出できないだけのケースが混じる。詳細はJSONの`parent_scope_fixed_evidence_map`。
- 204件のfinding-review unknownのうち203件はsemantic_evidence=`scoped_audit_recorded`。finding-review unknownは親別findingがindexに抽出されていない状態であり、意味監査未読と同義ではない。残るOS036だけは元indexでsemantic evidence unknownかつaudit refなし。
- 77 source snapshot bytesは全件一致したが、過去監査の限界（span-only、old source/consumer partial、fixture未実行等）はそのまま。今回も全77 source本文と274親のL2/L11/6文書を新規同深度で読み直したとは主張しない。

## 全274親ごとの証拠対応

次のJSON配列は全親について、元indexのaudit_ref、source snapshot path/full SHA、source側の宣言scope、記録されたrevision、親別read_scope_locator、source内で抽出できたL2/L11 fixed pin pointerを列挙する。`approval_parent_pin`はPO採択candidate digestであり、固定L2/L11 source pinとは区別して保持する。

|親数|scope extraction状態|意味|
|---:|---|---|
|116|少なくとも1つ親別locator|元indexがparent suffix/json pointer/read fieldsを抽出。source別固定pinはJSON各rowで確認。|
|157|参照はあるがgroup-scope locatorのみ|source scope parent suffixで対象群は宣言。親固有の行/意味をindexからは再現できず、監査未読とは断定しない。|
|1|OS036 audit refなし|元index上は真にscope evidence未登録。#2695の後続reviewは次節。|

## 追補で訂正した後続状態

- **#2689はSECURITY Stage 1 parent028**。OS Stage 2c parent028ではない。OS028/029は#2688。前報告のStage表示誤りを訂正した。
- **LABO063 #2694**: current HEAD `421e209a49067d6e728bc5c686cd845c8aca3889`, base `6e26ee3929e55bfa23dd7c809b7e6a1c88de0431`。review02 formal `6047400034` はMajor 0/Opus-Fable一致、条件1/2成立。review03 `6047432658` no findingsで条件3成立。APIではDraft/Open、未merge。本文6件はcondition3以後不変とformal記録。返さないMinor2件は判断記録に残る。独立要件review/condition3済みだがmain admission・mergeは未成立。
- **OS036 #2695**: HEAD `d8bc0d4f4a8d68e358d0fd8a5907c09c711a970c`, base同じく`6e26ee...`。formal `6047392796` Major0/Opus-Fable一致で条件1/2、`6047419887` no findingsで条件3成立。4 Minorは未解消記録。API上Ready/Open、merge依頼あり、未merge。本文内容は既存L2-010の戻し先へtuple不一致を限定し、既存non-upgrade policy sourceとHARNESS dutyを分離。新owner/selector/authorityなし。
- **OS014**: Root監査 `/tmp/root-os014-internal-deployment-synthetic-scope-2026-10-08.md/json` 全文を再読。合成secret-free未実行fixtureは実cutoverではなく、新たなfixture単位のPO許可gateを導かない。実際の内部deployment切替には既存PO許可が適用。R1は実cutover適用範囲の解釈残余として保持し、限定監査では新gapなし。
- **LABO061**: A040 `$` は限定読解で新規確定gapなし。A044は既存R1–R13を維持。#2629は起草PRでsemantic repairではない。Root通知の内部検収とPR mapping/source evidenceは区別する。

## 優先して追加確認すべき親範囲

- この抽出だけで未読親を157件と数えるのは誤り。157はlocatorがgroup-levelのみの件数で、source scope metadataには各対象parentが列挙されている。
- 親単位の正確なcase行・source spanを新たに人手照合するなら、優先範囲は、元indexにlocatorなしのOS036（現行PRのpost-merge main確認待ち）、およびgroup-scope locatorしかないとされるfinding-bearing rowsから始める。ほかのunknown203はfinding-review状態のみunknownで、監査読了証拠を消さない。
- 274全親のsource/consumer同深度監査、fixture実行、PR merge後read-after、独立review外の意味完全性は未実施。

## 再現検査

- 77/77 audit ref: snapshot `bytes`とSHA-256が元indexに一致。
- JSON syntax validation: JSON parse成功。
- 確認対象: prior extraction hash、#2694/#2695 API comments/reviews, OS014 MD/JSON. Repo編集なし、CI/runtime/fixture実行なし。
