# Candidate 4755 説明行の規範語スクリーン補集合 ranks 261–300 意味監査

> 40 source rowの意味と現行authority関係を静的に照合する。採択、successor、受入実行、source closureは生成しない。

## 対象と導出

- 基点 `cfe90f400613935d1dd2c8c99d30b10e9d15e9a7`。#2353 `reconciliation.row_records` 4,755行に#2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381をexact source IDで順に適用した。effective explanationは2,965行。
- 既存positive semantic-review slices 13件のsource IDs 255件を再構成し、補集合 `2965 - 255 = 2710` をnumeric source-ID順にrank付けした。ranks161–180は既存補集合監査と一致。
- 今回選択40 IDsのSHA-256: `dcb2f0e7305e96a3d8c46d9acf8b65fb54b5b9616fa3d29b02be8177a0d43ff4`。入力・source/asset ledger・F6 pair・decision recordsのcommit:path:SHAと各source line pinはpaired JSONに記録。

## 行別照合

|Rank|Source ID / archive line|意味・分類|F6／後続判断との関係・残差|
|---:|---|---|---|
|261|`LEGACY-CAND-LINE-000430`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:3`|historical source boundary。保存文書をhistorical input-onlyと位置付ける。要求・承認・実行権限の正本ではない。|旧source境界の説明で、現行authorityは生じない。|
|262|`LEGACY-CAND-LINE-000431`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:4`|tracking/provenance metadata。Issue追跡先と候補受入・承認・IR取込・runtime完成を別状態として記録する。Issue番号はdecision receiptではない。|個別row bindingや現行採択はない。|
|263|`LEGACY-CAND-LINE-000433`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:8`|archive restoration procedure。メモリ内復元検査の実行位置を説明する旧手順。|現行要求でも旧検査の実行許可でもない。|
|264|`LEGACY-CAND-LINE-000434`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:9`|restoration check scope。原文bytes検査と要求採用・承認・完了を区別するsource説明。|現行受入を生成しない。|
|265|`LEGACY-CAND-LINE-000436`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:12`|embedded source-check code。旧snapshot再構成コードのimport行。意味要求ではない。|archive codeは参照のみ、未実行。|
|266|`LEGACY-CAND-LINE-000437`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:13`|embedded source-check code。旧snapshot digest helperのimport行。|現行検証器・consumer bindingはない。|
|267|`LEGACY-CAND-LINE-000438`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:14`|embedded source-check code。保存blob読み取り処理のコード行。|旧runtimeは未実行。|
|268|`LEGACY-CAND-LINE-000439`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:15`|embedded source-check code。単一source blockを取得するコード行。|現行pair oracleではない。|
|269|`LEGACY-CAND-LINE-000443`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:19`|embedded source-check code。復元bytesのdigest算出コード。|実行証拠ではない。|
|270|`LEGACY-CAND-LINE-000444`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:20`|embedded source-check code。length/digest比較コード。|現行受入oracleとして採用されていない。|
|271|`LEGACY-CAND-LINE-000445`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:21`|embedded source-check code。digest mismatch exceptionの負経路コード。|旧negative testは実行していない。|
|272|`LEGACY-CAND-LINE-000446`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:22`|embedded source-check code。コードblock構文の閉じ括弧。独立要件ではない。|なし。|
|273|`LEGACY-CAND-LINE-000447`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:23`|embedded source-check code。旧復元検査の出力コード。|旧出力を現行receiptにしない。|
|274|`LEGACY-CAND-LINE-000448`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:24`|embedded source-check code。script終端の構文行。|なし。|
|275|`LEGACY-CAND-LINE-000450`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:27`|source snapshot metadata。原稿名とdigestを導入するprovenance行。|採択・正本化ではない。|
|276|`LEGACY-CAND-LINE-000451`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:28`|source snapshot digest。対象bytesのSHA-256記録。|Issue本文やdecision scopeとは区別する。|
|277|`LEGACY-CAND-LINE-000452`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:29`|source snapshot rules。復号bytesを改変せず扱うsnapshot説明。|現行設計条件へ昇格しない。|
|278|`LEGACY-CAND-LINE-000453`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:30`|Issue/body distinction。hash対象がIssue全体ではないというprovenance説明。|Issue stateから要求意味を導かない。|
|279|`LEGACY-CAND-LINE-000455`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-intake-source.md:33`|embedded base64 snapshot。保存payloadの行で、要求文章ではない。|payloadは復号・実行せず、line/file digestで固定。|
|280|`LEGACY-CAND-LINE-000458`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:2`|candidate title metadata。CI event concurrency L10 acceptance candidateのtitle。|title・旧layerは現行採択ではない。|
|281|`LEGACY-CAND-LINE-000459`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:3`|candidate status metadata。draft_candidateの自己記録。|approval/retire/canonical promotionを生成しない。|
|282|`LEGACY-CAND-LINE-000460`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:4`|candidate layer metadata。candidate内canonical L10 label。|現行layer mappingではない。|
|283|`LEGACY-CAND-LINE-000461`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:5`|candidate pair metadata。candidate内paired L3 label。|現行L2/L11 pair採択を示さない。|
|284|`LEGACY-CAND-LINE-000462`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:6`|candidate plan pointer。旧PLAN IDへの参照。|作業許可・承認・完了ではない。|
|285|`LEGACY-CAND-LINE-000463`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:7`|candidate artifact pointer。要求candidate pathへの参照。|pointerからadoptionを生成しない。|
|286|`LEGACY-CAND-LINE-000466`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:12`|table header。acceptance tableの列名header。oracleではない。|source rowは構造上の列見出し。|
|287|`LEGACY-CAND-LINE-000469`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:15`|acceptance candidate oracle。CIG-AC-002のcandidate scenario。event class間の独立性と同PR stale replacementを検査する規範的候補内容。|F6 L11にrow-specific adopted bindingなし。新世代CIは未構築。|
|288|`LEGACY-CAND-LINE-000476`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:24`|candidate scope accounting。CIG-R-01..04の候補内件数宣言。|候補内件数はcurrent source closure/adoptionではない。|
|289|`LEGACY-CAND-LINE-000477`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md:25`|candidate scope accounting。CIG-AC-001..007の候補内件数宣言。|実行済みoracleや受入ではない。|
|290|`LEGACY-CAND-LINE-000480`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:2`|candidate title metadata。CI event concurrency requirements candidate title。|titleから現行要求identityを割り当てない。|
|291|`LEGACY-CAND-LINE-000481`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:3`|candidate status metadata。draft_candidate status。|draftは拒否/retireやcanonicalizationを意味しない。|
|292|`LEGACY-CAND-LINE-000482`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:4`|candidate layer metadata。candidate内canonical L1 label。|旧layer番号を現行へ直写ししない。|
|293|`LEGACY-CAND-LINE-000483`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:5`|candidate pair metadata。candidate内canonical L12 label。|現行pair agreementではない。|
|294|`LEGACY-CAND-LINE-000484`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:6`|candidate plan pointer。L3作業plan参照。|plan IDは承認・実施許可ではない。|
|295|`LEGACY-CAND-LINE-000485`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:7`|Issue provenance pointer。source Issue number。|Issue ID/stateはdecisionではない。|
|296|`LEGACY-CAND-LINE-000489`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:14`|candidate user requirement。複数CI event classの証明義務を単一ref runへ縮約しない目的文。marker regexは該当しないが候補上の規範内容。|F6の一般CI境界と近接するがrow-specific pair adoption receiptなし。|
|297|`LEGACY-CAND-LINE-000490`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:15`|candidate user requirement。証明義務を保持してwait time/duplicate runsを制御する要求文。「できなければならない」はscreen regex対象外だが規範的候補。|OS 2026-09-28明示採用集合に含めず、row adoptionなし。|
|298|`LEGACY-CAND-LINE-000493`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:20`|table header。business-requirement tableの列名header。独立要求atomではない。|構造上のheader。|
|299|`LEGACY-CAND-LINE-000495`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:22`|business requirement candidate。CIG-BR-01の候補利用者要求。event classesを別の証明義務として扱う。|新世代CI候補にtopic relationはあるがこの旧rowのsource-specific adoptionはない。|
|300|`LEGACY-CAND-LINE-000503`<br>`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md:33`|candidate authority boundary。Issue起点の要求候補であり、承認・canonical promotion・runtime enablement・cancel authorityを与えないと明示する。|現行Issue/CI authority境界に意味上近いが、このrowのindividual adoption/execution authorityではない。|


## Authority・無損失境界

- 固定F6はHELIX-HARNESSとHELIX-OSのL2/L11 pair。新世代CIはOS candidate置き場にあり`draft_candidate / awaiting_human_approval`。CIG領域の広い関係はあるが、この40旧rowのrow-specific crosswalk/adoption receiptは確認できない。
- 2026-09-25 PO placement decisionは旧Bugbot限定修復候補をIntelligenceへ配置し、HARNESSには修復後検証義務を残す。これは今回のsource-byte restoration recipeや各old acceptance rowの採択・実行許可ではない。2026-09-28 PO decisionsは明示候補集合の範囲を保つ。
- Issue/plan/status/hash、候補文書内の件数宣言、candidate family近接から承認・実装・受入を導かない。全40行のsource stateは`historical_candidate / draft_candidate / preserved_pending_atomization`、meaning changeなし、successorなし。
- 34行はprovenance、code、metadata、table header、payload構造。6行（AC-002、要求文、BR-01、候補authority boundary）はmarker-negativeでも候補上の規範意味を持つ。
- 旧source code、復元手順、base64 payload、旧workflow/CLI/hook/adapter/runtime/test/CIは実行していない。

## 結果

row-specific current crosswalk 0、adopted pair binding 0、successor ID 0、closure 0。authority effectは`none`。source-line/asset ledger entry hashesとarchive source file/line/physical-byte hashesはpaired JSONに記録。

詳細pin: [paired JSON](legacy-candidate4755-explanation-normative-complement-ranks-261-300-2026-10-01.json)
