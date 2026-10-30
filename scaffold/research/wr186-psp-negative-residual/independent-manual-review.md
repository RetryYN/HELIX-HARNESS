# WR186 F03/F05入力監査の再確認

## 確認方法

固定L9 raw snapshot `ed3981e7b9419d796adf1981f8990c6b626ecabe` と対象caseのmutationを入力事実として読み、L3/L4の分類文およびL5 failure output条件が要求するclaimが入力資料にあるかを照合した。L9既存 `expected_material` は処理結果の観測ではないため、finding形成根拠に使わない。過去の独立照合メモもL5順序を見ていたため、F03のfinding/order根拠として採用しない。

## F03 14件

- 観点欠落10件は、raw上の未形成/nullだけを示す。L4 `/contracts/3/negative_classifications/1` とL5 `/failure_rules/20` が要求する「未決を成功または空観測へ補った」出力はrawにないため、finding setは `unknown/unformed`。
- trace欠落1件は、mutationでtraceが空になる入力差を示す。しかしL4 `/contracts/3/negative_classifications/0` とL5 `/failure_rules/19` が要求する「trace未供給を成立扱いした」処理出力はrawにない。よってfinding setは `unknown/unformed`。
- wrong-pair 3件は、固定rawの `paired_comparisons` が持つpair入力とmutationでpairのlayer値を変更する入力差を示す。`paired_comparisons` は比較対象の入力であり、処理がpair不一致をどう分類したかという出力ではない。L4 `/contracts/3/negative_classifications/0,2` とL5 `/failure_rules/19,21` が要求する「不一致なのに同一pairとして比較した」処理結果はrawにない。既存 `expected_material` も期待であって実出力ではないため、集合・owner・順序を形成しない。L4はrule orderも定めない。

## F05 8件

対象Port fieldがrawで欠落/nullという入力差は保持する。一方、L4 `/contracts/5/negative_classifications/0` とL5 `/failure_rules/23` が要求する「欠落のままRelease-eligible扱いした」処理出力はrawにない。したがって8件ともfinding setは `unknown/unformed`。

## 訂正後の状態

対象22件は空集合でもpositiveでもなく、finding set・owner・ordered outputが未形成である。raw hash、raw pointer、mutation pointer、L3/L4 source pointerは各行に保持した。L9のexisting cases/expectations、182件の母集団、formal projection row、checker marker、freezeは変更しない。元の候補主張はgit履歴に残るが、現在の監査正本では撤回済みと明示する。
