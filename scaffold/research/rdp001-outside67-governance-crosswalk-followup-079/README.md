# outside67 governance/crosswalk follow-up research (015/018/029/032/067)

requested exact base `ea771fb2c496d40fcc429877b0fcd8cff6999526` から作成したfresh isolated worktreeを、#2027 merge後のlatest main `8e4a737a919caf768c9e0b916c83a5428966e58f` へfast-forward rebaselineし、outside67 holding 67 path_revision_pairのうち既済37件と重複しない5 sourceを静的に保持するresearch Scaffoldです。研究会計は42/67、残25ですが、これはpath_revision_pairの研究会計であり、正式要求identity、四製品owner、実装・縮退の分母ではありません。

候補は015 candidate source-target inventory、018 Concept v4.1 human decision packet、029 L2 source adoption sequence、032 legacy CI/AI runtime source inventory、067 L11 crosswalkです。各sourceから5本ずつ、合計25本のpre-isolation/archive exact line anchorとcurrent counterpartを保持します。multi-duty lineの完全分解は未了なのでcomposite_unresolvedとして残し、source fragment外のactor/action/condition/guard/sequenceを生成しません。

015/029/067はpre/archive同一、018/032はarchive revision差分です。全5件はcurrent counterpartへpath relocationされ、current content hashがarchiveと同一なのは015/032、content driftを観測したのは018/029/067です。hash・path・wording差分をsemantic equivalence、authority、successor、implementation、degradation、failure、consumer、decisionへ昇格していません。四製品はcandidate boundary only、formal product ownerとphase authorityはunknownです。旧7 ledgerのcandidate ID/path exact hitは0件ですが、不在・完了・承認の証拠とは扱いません。

SCF-B-0079はresearch Scaffold Bindingとして登録済みです。今回の検証幅は5 source pairであり、安全なbatch上限は断定せず、次batchはsource chainごとに独立確認します。旧archive runtime/test/CI、現行runtime、GitHub/PR/DB操作は行っていません。

stacked stop条件: origin/mainまたはparent lineageが進んだ場合はsource選定・正式化を停止し、最新mainへの再materializationとscope/base digestの再検証を行う。silent rebase・merge・holding昇格はしません。

## 固定register入力の再照合（2026-10-10）

期待digest `79c1e5a…fbcd` は当初baseとは別の、後続commit 1c276ab26dc50ca5d0f2d8c25441f17c303b9919の637行・45 holding captureに一致する。validator読取先とBindingを同一bytesのsnapshotへ結び、現在の台帳appendから過去の研究を分離した。元のlogical path、base、候補JSON/JSONL、unknown、未調査残差を保持し、以前のholding数は現在の生存holding数を表さない。selfcheckの成果物pathは現行research配置へ訂正した。以前のmetadataの時間的整合と研究全体のclosureは未完で、採否・authority・正式successor・全consumer closureは生成しない。

## 独立reviewによるregister来歴の確定

独立review F2: 研究base 8e4a737a919caf768c9e0b916c83a5428966e58f の入力はb68f3acae41fcd7796bf323e8eb3036aa13970c3af8608e13c5aaa1b237258dd/33行（72b9f368 captureと同一）。1c276ab2の79c1e5a6/637行は2026-09-29 refreshの記録値であり、研究時入力ではない。既存候補のrefresh記録との静的照合にだけ使い、当初baseの証拠や現在のholding/authorityへ継承しない。照合: docs/governance/audits/source-rebaseline/osa03-independent-review-input-reconciliation-2026-10-10.json
