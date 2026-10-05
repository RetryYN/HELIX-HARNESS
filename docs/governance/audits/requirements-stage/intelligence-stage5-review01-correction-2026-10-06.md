# INTELLIGENCE Stage 5 review01 補正記録

この追補は#2619 review01のMajor 21/Minor 22に対する作成側の修正候補と静的なsource/line pinを記録する。独立再review、L3承認、実行合格、Ready、mergeを成立させない。旧時点記録は変更していない。

- 対象: 060, 061, 062, 063, 069, 070, 071, 074, 077 の9親
- review HEAD: `d3624b7832297bc810ead663313016259d511d51`
- body commit: `7b18d316c21f40dd47c23e34333da497e757f299`
- 固定basis: `633bf12ea8f948db8ba3d6600179c4a9507377a7`
- 対象comment: [PR #2619 review01](https://github.com/RetryYN/HELIX-HARNESS/pull/2619#issuecomment-6004286992)
- comment raw UTF-8 SHA-256: `a297b0d340129bc54adca497df08d1fc2357e49ee3515d37c5bd6ab65c41b392`

## 確認した結果

6 canonicalの本文SHAと1d7 main prefix SHAを固定した。6文書すべてprefix bytes一致。FV全表のunique CASE IDはreview前 789、現在 886、差分 97。補正sectionには78 table rows、78 unique IDsがある。これはreview01のfixture designであり、成立・独立確認済みの数ではない。

固定L2各節、L11の親別/共通span、PO decision row、管理登録rowはbasis commit 633bf12からraw-LF hash付きで記録した。G0配属は導入commit 59336627f11475456038db80ce6232ee39bbfa8f の別sourceからpinし、633のbasisと混同していない。旧asset ledgerが指す18ファイルを同じGit revisionから引き、file SHAと現行本文が引用するbounded spansのSHAを照合した。旧runtime・test・CI・Bunは起動していない。

静的確認は `scfctl validate` 147/0、`stale=0`、`residuals=0`、`govcheck: ok atoms=7622 requirements=57 files=58`、`git diff --check` PASS。

## 所見ごとの記録

JSONの`formal_findings`に全43所見の原文・対象CASE/AC/NFR・作成側の対応状態を格納した。すべての状態はroot意味検収/独立再review待ちであり、解消や承認の主張ではない。

## 旧時点記録と限界

既存の22親候補監査、source-body audit、root follow-up、root acceptanceはその時点の記録として保持し、raw SHAをJSONに記録した。以前のCASE件数やlocatorの誤差はこの新しい追補で明示したが、旧JSON/MDは書き換えていない。

旧sourceは台帳に登録されたファイル全体と、当該親FRが引用する行範囲を固定した。引用範囲外の旧資料全体まで意味照合したとは主張しない。

JSONには全current changed-line pins（物理行・LF込みSHA・literal）、全fixed/legacy spans、6本文/ prefix SHA、変更履歴を格納している。
