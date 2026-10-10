# outside67 governance/crosswalk follow-up research (016/020/023/038/062)

initial exact base `1db1e9d78b9cb552394c647145343704efffe529` から作成したfresh isolated worktreeを、#2030 merge後のlatest main `3184d6131a7c8aecc21c1544ec7882c2ef94f033` へrebaselineし、outside67 holding 67 path_revision_pairのうち既済42件と重複しない5 sourceを静的に保持するresearch Scaffoldです。研究会計は47/67、残20ですが、これはpath_revision_pairの研究会計であり、正式要求identity、四製品owner、実装・縮退の分母ではありません。

候補は016 Concept v4.1 approval readiness audit、020 Infinity business target crosswalk、023 L2 freeze IR correction、038 new-generation Concept package source crosswalk、062 upstream rebaseline execution backlogです。各sourceから5本ずつ、合計25本のpre-isolation/archive exact line anchorとcurrent counterpartを保持します。multi-duty lineの完全分解は未了なのでcomposite_unresolvedとして残し、source fragment外のactor/action/condition/guard/sequenceを生成しません。

当初captureでは038のpre/archive/current counterpartは同一hashでした。後続captureでは038もarchive/current content driftとなり、016/020/023/062と合わせて5件のdriftを観測しています。038のpre/archive同一、他4件のpre/archive差分は保持します。062はcurrent pathが同一で、他4件はcurrent counterpartへpath relocationされています。hash・path・wording差分をsemantic equivalence、authority、successor、implementation、degradation、failure、consumer、decisionへ昇格していません。四製品はcandidate boundary only、formal product ownerとphase authorityはunknownです。旧7 ledgerのcandidate ID/path exact hitは0件ですが、不在・完了・承認の証拠とは扱いません。

SCF-B-0083はresearch Scaffold Bindingとして登録済みです。今回の検証幅は5 source pairであり、安全なbatch上限は断定せず、次batchはsource chainごとに独立確認します。旧archive runtime/test/CI、現行runtime、GitHub/PR/DB操作は行っていません。

stacked stop条件: origin/mainまたはparent lineageが進んだ場合はsource選定・正式化を停止し、最新mainへの再materializationとscope/base digestの再検証を行う。silent rebase・merge・holding昇格はしません。

## 固定入力の再照合（2026-10-10）

期待register digestに一致する`1c276ab26dc50ca5d0f2d8c25441f17c303b9919`の637行captureへ読取先を固定する。当初BASEとは別の後続入力更新であり、過去のholding数・revisionの時間的照合と研究全体のsource/consumer closureは未完として保持する。旧配置のholding/台帳4 pathは論理名を保持して現行legacy-migration配置へ解決する。counterpart062は現行本文から分離し、期待digestと一致する`7aa2c1208757381bb4f5723b45ffc875e305f930`の103行本文を歴史snapshotへ保全する。旧backlogの波・gate・承認記述を現行運用として復活させない。選択source/anchor・25 unit本文・研究会計・unknown残差は変更しない。後続counterpart captureに取り残された038のrelation oracleとscanのdrift一覧、062のscan digest/bytes、Bindingの観測条件だけを訂正する。採否・正式successor・holding解除・L3再開・Issue closeを生成しない。

当初のsame-hash観測はcommit `26124da8e`の記録として保持する。`f4d9192c1`では後続digestの038へsame-hashフラグを付けたまま参照を更新した。続く`22e308e87`は選択記録の038をcontent driftへ訂正し、`76f00c1c0`もscanのhash-equal/content-drift一覧を訂正したが、scanの旧drift一覧・062 captureとcanonical oracleは追随していなかった。今回の訂正は実際のGit本文hashの差に基づく静的観測の整合であり、旧sourceの意味を変更・採用するものではない。訂正前のfieldと対象commit/hashは再照合receiptへ固定する。
