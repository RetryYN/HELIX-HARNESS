# IR153 HIL-FR-51〜55 現行L2/L11条件照合（2026-10-02）

## 対象と原文pin

基準は `f38bde044a7dfbf12aec0203b21a9384eef6ad8f`。旧資産 `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` のL1 requirement file SHA-256は `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。物理行141–145の5条項を原文hash付きで照合した。旧IR file SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`、system contract/acceptance/test sourceのfile pinと各semantic digestはpaired JSONに収録した。

全5 IR recordはrevision 1 / specified / frozen。FR51–53はHR-FR-HIL-19、FR54–55はHR-FR-HIL-20を参照し、各HAC/HATは共通consumerである。下流は`pending_pair_descent`、formal successor IDsは空。共通contract/HAC/HATの関係は照合根拠であり、各FRへ別個の条件として二重計上しない。HAT-HIL-19/20はいずれも`designed_not_implemented`であり、旧oracleの実行結果とは扱わない。

## 条件と採択済み行き先

| 旧IR | source line | 現行行き先・正確な採択 | 監査判断 |
|---|---:|---|---|
| HIL-FR-51 | 141 | HELIXOS-L2-001/002/007/009の該当本文と対L11（9/28 decisionが固定したL2/L11全file target revision。本文はL2/L11 full-file SHAで特定）およびHARNESS-008/016/003/004/022で、提案差分・authority/revision・trace/pair/impact/security・rollbackを責務分割して扱う。OS L2「要求正本を更新する管理条件」ではpolicy/evidence/scope別に自動適用、修復、人間判断、拒否、競合を区別し、変更対象・旧revision・impact・証拠・復旧経路を結ぶ。decisionが採用した明示候補集合はHELIXOS-L2-014〜029の16件であり、001〜013を個別candidate採択済みとは記載しない。001/002/007/009は固定file target revision内の既存本文を crosswalk で参照する。 | 旧6つの意味は現行の適用判断＋impact/stale状態＋recovery経路に分割されている。`auto_admit_with_stale_propagation`という旧enum表記はそのままないが、自動適用と影響/stale伝播が別の結果項目にある。表記不一致だけで欠落とは判定しない。 |
| HIL-FR-52 | 142 | 5 atom partitionのうちcommand identity atomは採択HARNESS-052-001（9/29 11候補row32、L2 `d49f8cf1…1d25c` / L11 `3027c6b9…a633b`）。4 artifact-transaction atomsは採択HELIXOS-053-001（row36、L2 `fe880fc8…240bc` / L11 `64bc9d0b…8177`）、HARNESS-052採択を条件にする。 | command identityとOS atomic commitの責務分離で、同一command再送、異payload/base conflict、multi-artifact partial current 0、CAS、before/after/write/rollback/conflict receiptを保つ。旧`harness.db`を現行DBやschemaにしない。 |
| HIL-FR-53 | 143 | HARNESS-053-001採択（9/29 11候補row33、L2 `ebc78869…10587` / L11 `c22abfd2…bb61f`）。receiptはstatement atom+4 output atomsに局所分割。 | immutable path非依存identity、意味revision/diff、rename/move/split/merge/supersede lineageとauthority/oracle/typed-edge対応、四出力を保持。ID文字列一致だけでlineageを閉じず、missing relationはunknown/incomplete。 |
| HIL-FR-54 | 144 | HARNESS-044-002を条件付き採択（9/29 57候補row49、B route/Design Contract Portfolio、L2 `690f2bfa…212f2` / L11 `9c79b731…7bfc8`）。採択済み025/026へ無断追補しない。 | atom/Design Obligation Graphのclass分け、原則1 normative contract/class、reuse/delta/new/根拠付きN/A、uncovered=0・semantic duplicate=0の最小portfolio候補、matrix/manifest/findingsを保持。 |
| HIL-FR-55 | 145 | HARNESS-043-002を条件付き採択（9/29 57候補row48、B route/Core配置、L2 `da678d91…c6666` / L11 `583bfaf6…b4b4`）。CORE配置はこの判断が新しく選んだ配置で、旧「HARNESS内の部品」印から継承した扱いにしない。 | active rule/applicability branchごとのcanonical positive+boundary negative、riskで未被覆の場合に限定した追加例、件数でなくrule/branch/risk coverage、matrix/risk rationale/redundancyを保持。 |

各pairのexact section digests、decision file SHA、coverage receiptのSHA、MPR source atom数・atom refs・preserved holdingをpaired JSONに記録した。043/044はdecision前receiptが`authority_effect:none`／`PO未採択`と記録するが、後続57-candidate decisionが同一exact revisionを条件付き採択済みである。current statusをreceipt metadataだけで逆算しない。

## 選択sliceと保持境界

- FR52は旧line 142を1 command identity atom（HARNESS）+4 atomicity/base-CAS/receipt atoms（OS）へ非重複分割し、二候補のreceiptが選択全5atomを割り当てる。OS pair adoptionはHARNESS-052採択条件付きである。
- FR53はL1 line 143のstatement 1 atomと右端4 output atomsだけを053へ結ぶ。旧IR record、shared HR19/HAC/HAT全体、formal successorは別holdingに残る。
- FR54/55はそれぞれL1 line 144/145の一atomずつがselected source scopeで、両方とも後続PO decisionでexact current pair revisionが条件付き採択されている。HR20/HAC/HAT、旧IR record、旧template/portfolio tool全体は別source scopeであり、ここからclosureを主張しない。
- `version_target`、配置、新旧名の選択は各decisionに定められた範囲で読む。L2/L11 candidate frontmatterや作成時receiptの「未採択」表示に従って後続PO decisionを打ち消さない。
- 正式successor IDが未設定なのはregistry状態であり、既採択のL2/L11意味が欠ける根拠とはしない。一方、採択から旧IR/HR全体closure、implementation/run、test pass、holding解除を推定しない。

## FR51結果分類の意味対応

旧FR51は6 outcomeを一つ選ぶ。「自動受入＋stale伝播」は現行OS L2表の単一ラベルではなく、適用判断の自動適用とOS-002/007の影響・stale状態に分けて記録される。旧enumと文字一致しないことを意味損失とみなさず、変更scope/revision・影響範囲・stale保持・rollback/recovery outcomeが組になって識別されることを対応条件とした。現行要求はこの分離責務を支えており、本監査では独立の条件欠落を確認しなかった。

## 検証範囲

旧source物理行と全file pin、候補/受入pair section digests、adoption decision rows、旧HAC/HAT linksを照合した。JSON parseと`git diff --check`を行った。旧archive runtime/CLI/test/CI、新generation runtime test、共通8 gate、137比較は実行していない。要求本文・decision・receiptは変更せず、paired auditのみ作成した。

## root採択範囲の再検収

9/28 OS decisionの対象revision節は、固定f6dad2a上のL2-001〜029と対L11本文一式への合意を明記する。014〜029の16件は新たな明示candidate採用の集合であり、既存001/002/007/009も固定本文への合意範囲に含まれる。file pinだけから採否を推定しないことと、decisionの明示した本文合意範囲を狭めないことを両立する。rootが初回に全001〜029合意を過大とした返却理由は不正確だったため訂正する。
