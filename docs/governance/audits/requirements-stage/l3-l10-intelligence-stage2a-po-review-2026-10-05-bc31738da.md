# INTELLIGENCE Stage 2a L3/L10確認資料（2026-10-05）

本文revision `bc31738da28eb3e299767c486bf36e66b91177c6`。採択親010/066、6文書。L3未承認・L10未実行。

task属性、Worker capability、同scopeの観測実績とLABO根拠を併せて配置案を作り、未評価を保持してOSへ渡す案です。通常runtime経路とruntimeなしの人代行経路を別caseで検証し、proposal、評価、受領、assignmentの責務を分けます。価格・名前・benchmark値単独の選定は拒否し、cost観測を他の必要根拠と併用する正常対照も設計しています。

観測母集団の固定履歴とrolling window比較、必要bindingの保存率100%・不一致0を根拠付き候補として提示します。旧L3/要件の項目別再導出・置換と未確認範囲は監査に記録しました。

|正本|SHA-256|
|---|---|
|`docs/helix-intelligence/L3-requirements/functional-requirements.md`|`56bcd82393cbf48b2b47c8d4107cc247a50e0deea91075e568bab467db5baae2`|
|`docs/helix-intelligence/L3-requirements/business-requirements.md`|`479400d0dc86ced49caaa1860a98a6577e2e6684aaa84cbe659fd718ca349c1a`|
|`docs/helix-intelligence/L3-requirements/nfr-grade.md`|`5e7e541997323e89bc4501503aaf37214f52afaaad0f1f6a9062d74968113ba5`|
|`docs/helix-intelligence/L10-verification/functional-verification.md`|`3275b3b8e838aed7b31f4f35d18857fe7e266f9640f002bf1b9958c43cbda1ca`|
|`docs/helix-intelligence/L10-verification/business-verification.md`|`71553dfa1a5ce136af4aa11f4e8b69e8bc29064fadefc9db567fab9f4a344a96`|
|`docs/helix-intelligence/L10-verification/nfr-verification.md`|`c214f1939619f28728bd88cb1da3caa3a3d487cf1abfe0842e71fe843d67f8d8`|

静的監査: [l3-l10-intelligence-stage2a-static-validation-2026-10-05-bc31738da.json](l3-l10-intelligence-stage2a-static-validation-2026-10-05-bc31738da.json)。独立レビュー結果を併せてPOへ提示します。旧草稿への判断は継承しません。

作成側の追加検収で、指標ごとの分母・単位・欠測と、入力欠落/不一致の独立fixtureを補足しました。修正後exact HEADの独立reviewは未成立です。
