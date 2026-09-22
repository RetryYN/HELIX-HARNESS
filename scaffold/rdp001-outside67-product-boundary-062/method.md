# 調査方法

1. 最新`origin/main`のfresh detached worktreeを使用した。親通知時点の`b0b233f2`から#2001 merge後の`294bfd90`へbaseが進んだため、holding・register・selected sourceの不変を静的に再照合し、base driftをinventoryへ記録した。#2007 head `e2c8f63e`の変更ファイルを確認し、008／011の選択と001／010の参照混入を重複除外した。#2008 merge後は`ce66af3b`へrebaseしてbranchをmaterializeしたが、記録baseは`294bfd90`として保持し、live origin/main同値は要求しない。
2. outside67 holding 67行を走査し、59、63、64、65、66を「責務境界または製品間接続をsource本文が直接述べる」基準で選択した。既レビュー2件を除く残り65件から今回5件を取り出し、今回後の未調査を60件とした。
3. 各pairのpre-isolation／archive commitから同一source pathを`git show`で静的取得し、holdingのblob OID、SHA-256、bytes、relation、line countを照合した。source snapshotはbyte保存し、unified diffを生成した。
4. 選択sourceのうち製品境界へ直接関係するlineだけをproduct unit候補にした。各unitはpre/archive両revisionのexact line、line number、line digestを持つ。同一lineを要求分割の分母へ複数回算入せず、未選択lineを意味単位へ昇格しない。
5. legacy asset disposition、decision log、copy/read-after、phase/product classification、implementation crosswalk、product-unit decompositionのpath／blob OID exact-keyを静的走査した。0 matchや空consumer_refsはunknownの証拠として保持し、不在・正常・廃止・不要へ変換しない。
6. validatorはGit object、holding、snapshot、diff、unit span、unit／inventory keyset、固定意味record、四製品候補、unknown境界、overlap、分母、base driftを再計算する。base gateは記録した`base_origin_main`がexact HEADの祖先であることだけを検査し、live `origin/main`との一致を要求しない。検証時のorigin/main進行は記録して再照合し、静かに追随しない。selfcheckは改変された分母、source fragment、固定record、status、product候補、snapshot、overlap、旧実行をfail-closeする。
7. #2007検収で固定した境界をこの束にも反映した。product unitの4意味recordとinventoryのF/Q/P catalogを固定keyset・件数・status・順序で検査し、source fragmentのanchor mirrorを検証する。さらにsource ID／unit ID／pre・archive lineを独立canonical tableで固定し、candidate product、selection reason、source path、phase、anchor commitを改変しても通過しない負例を置いた。
