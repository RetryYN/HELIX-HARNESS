# outside67 governance/crosswalk follow-up research (016/020/023/038/062)

initial exact base `1db1e9d78b9cb552394c647145343704efffe529` から作成したfresh isolated worktreeを、#2030 merge後のlatest main `3184d6131a7c8aecc21c1544ec7882c2ef94f033` へrebaselineし、outside67 holding 67 path_revision_pairのうち既済42件と重複しない5 sourceを静的に保持するresearch Scaffoldです。研究会計は47/67、残20ですが、これはpath_revision_pairの研究会計であり、正式要求identity、四製品owner、実装・縮退の分母ではありません。

候補は016 Concept v4.1 approval readiness audit、020 Infinity business target crosswalk、023 L2 freeze IR correction、038 new-generation Concept package source crosswalk、062 upstream rebaseline execution backlogです。各sourceから5本ずつ、合計25本のpre-isolation/archive exact line anchorとcurrent counterpartを保持します。multi-duty lineの完全分解は未了なのでcomposite_unresolvedとして残し、source fragment外のactor/action/condition/guard/sequenceを生成しません。

研究base `3184d6131a7c8aecc21c1544ec7882c2ef94f033`の固定counterpartでは038だけがarchiveとhash一致し、016/020/023/062は不一致である。5件すべてを同じ研究baseのGit bytesへ固定する。現行mainとの観測は別receiptに記録し、研究時点の観測を上書きしない。hash/pathの一致から意味同値・採択・正式successor・実装・consumer closureを生成しない。

SCF-B-0083はresearch Scaffold Bindingとして登録済みです。今回の検証幅は5 source pairであり、安全なbatch上限は断定せず、次batchはsource chainごとに独立確認します。旧archive runtime/test/CI、現行runtime、GitHub/PR/DB操作は行っていません。

stacked stop条件: origin/mainまたはparent lineageが進んだ場合はsource選定・正式化を停止し、最新mainへの再materializationとscope/base digestの再検証を行う。silent rebase・merge・holding昇格はしません。

## 固定入力の再照合（2026-10-10）

期待register digestに一致する`1c276ab26dc50ca5d0f2d8c25441f17c303b9919`の637行captureへ読取先を固定する。当初BASEとは別の後続入力更新であり、過去のholding数・revisionの時間的照合と研究全体のsource/consumer closureは未完として保持する。旧配置のholding/台帳4 pathは論理名を保持して現行legacy-migration配置へ解決する。counterpart062は現行本文から分離し、期待digestと一致する`7aa2c1208757381bb4f5723b45ffc875e305f930`の103行本文を歴史snapshotへ保全する。旧backlogの波・gate・承認記述を現行運用として復活させない。選択source/anchor・25 unit本文・研究会計・unknown残差は変更しない。後続counterpart captureに取り残された038のrelation oracleとscanのdrift一覧、062のscan digest/bytes、Bindingの観測条件だけを訂正する。採否・正式successor・holding解除・L3再開・Issue closeを生成しない。

当初のsame-hash観測はcommit `26124da8e`の記録として保持する。`f4d9192c1`では後続digestの038へsame-hashフラグを付けたまま参照を更新した。続く`22e308e87`は選択記録の038をcontent driftへ訂正し、`76f00c1c0`もscanのhash-equal/content-drift一覧を訂正したが、scanの旧drift一覧・062 captureとcanonical oracleは追随していなかった。今回の訂正は実際のGit本文hashの差に基づく静的観測の整合であり、旧sourceの意味を変更・採用するものではない。訂正前のfieldと対象commit/hashは再照合receiptへ固定する。

## 独立review F1の訂正

先行再照合の7aa2c120中間captureと038の後日driftを研究時観測に使った処理は誤りだった。全5 counterpartを研究base3184d613へ戻し、038一致と062 aca38dce/9565 bytesを保持する。selected/inventory/scanのcounterpartだけを訂正し、25 unitとpre/archive sourceは不変。後日のhashは別観測として[独立review照合receipt](../../../docs/governance/audits/source-rebaseline/osa03-independent-review-input-reconciliation-2026-10-10.json)に保存する。先行receiptは当時の記録として不変、全研究closureやIssue closeは生成しない。

## 独立reviewによるregister来歴の確定

独立review F2: 研究base 3184d6131a7c8aecc21c1544ec7882c2ef94f033 の入力はb68f3acae41fcd7796bf323e8eb3036aa13970c3af8608e13c5aaa1b237258dd/33行（72b9f368 captureと同一）。1c276ab2の79c1e5a6/637行は2026-09-29 refreshの記録値であり、研究時入力ではない。既存候補のrefresh記録との静的照合にだけ使い、当初baseの証拠や現在のholding/authorityへ継承しない。照合: docs/governance/audits/source-rebaseline/osa03-independent-review-input-reconciliation-2026-10-10.json
