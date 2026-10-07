# LABO-068 review06修正本文の時点監査

本文revision `b4220ad45204a516f76df8416d0cc5a02384c8f0`、base `ceda1c53b53c53fffb8c23f394add1f2b809deb1`。正式6023443332 M1/M2を固定318ec4a L2:545/548、L11:284/286へ戻して再導出した。旧33IDと六列を保持し、実験許可・SECURITY許可・identity未発行かつ非拒否assignmentの算入を各々一出力だけ変える3反例を加えた。正常B0はidentity A〜Dと別assignment J0を区別しcount4とする。共通規定六本文、FR02/03、AC03を対応させた。

JSONに正式review全文、過去comment raw、六actualSHA、変更前後全文を保存した。R4は正式review06でM1へ格上げされ、R1–3/R5–14は解消を主張しない。旧時点監査は変更していない。govcheckと変更diffcheckはPASS。独立review、Fable一致、L3承認、fixture実行は未確認。
