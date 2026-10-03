# outside67 governance/crosswalk follow-up research (015/018/029/032/067)

requested exact base `ea771fb2c496d40fcc429877b0fcd8cff6999526` から作成したfresh isolated worktreeを、#2027 merge後のlatest main `8e4a737a919caf768c9e0b916c83a5428966e58f` へfast-forward rebaselineし、outside67 holding 67 path_revision_pairのうち既済37件と重複しない5 sourceを静的に保持するresearch Scaffoldです。研究会計は42/67、残25ですが、これはpath_revision_pairの研究会計であり、正式要求identity、四製品owner、実装・縮退の分母ではありません。

候補は015 candidate source-target inventory、018 Concept v4.1 human decision packet、029 L2 source adoption sequence、032 legacy CI/AI runtime source inventory、067 L11 crosswalkです。各sourceから5本ずつ、合計25本のpre-isolation/archive exact line anchorとcurrent counterpartを保持します。multi-duty lineの完全分解は未了なのでcomposite_unresolvedとして残し、source fragment外のactor/action/condition/guard/sequenceを生成しません。

015/029/067はpre/archive同一、018/032はarchive revision差分です。全5件はcurrent counterpartへpath relocationされ、current content hashがarchiveと同一なのは015/032、content driftを観測したのは018/029/067です。hash・path・wording差分をsemantic equivalence、authority、successor、implementation、degradation、failure、consumer、decisionへ昇格していません。四製品はcandidate boundary only、formal product ownerとphase authorityはunknownです。旧7 ledgerのcandidate ID/path exact hitは0件ですが、不在・完了・承認の証拠とは扱いません。

SCF-B-0079はresearch Scaffold Bindingとして登録済みです。今回の検証幅は5 source pairであり、安全なbatch上限は断定せず、次batchはsource chainごとに独立確認します。旧archive runtime/test/CI、現行runtime、GitHub/PR/DB操作は行っていません。

stacked stop条件: origin/mainまたはparent lineageが進んだ場合はsource選定・正式化を停止し、最新mainへの再materializationとscope/base digestの再検証を行う。silent rebase・merge・holding昇格はしません。
