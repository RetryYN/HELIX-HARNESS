# SECURITY Stage4 review01 root補正

本文 `074a82e1e538233b95565aa1c4767ce5ef834bb9`、base `1a7933157fef8327a0e2747348cbe57e596019aa`。正式5994525665のMajor5/Minor13に対する作成側の補正記録。旧時点監査は不変に保持する。

Worker配置越境、deny/unknown配送、実行前denyと実行中revoke/expiryのOS/Worker停止伝播、更新candidate provenance欠落を独立CASEへ結ぶ。有効既決権限再利用・毎回の人間approveなしをACへ固定しPO A70をraw pinした。3つの複合negativeを単独化し、SECURITY L1/INFRA L1-L2の宛先、三資源境界、観測されたfailed/not_applied、credential値（変換済みも含む）、判断origin/confidenceを補正した。

旧CAPのanalysis/semantic/Bot根拠という記述は誤りだった。CAP全176行/paired全59行の検索該当0を記録し、typed decision/unknownの62・128–131のみ部分参照、semantic/Bot境界は固定採択L2-026/PO§21§23由来の案と明示。SEA限定scopeは全操作へ黙って移さず、一般化はPO A70を根拠とした。024 target根拠も68–112へ訂正した。

024/026のPO採択001とmetadata-only002は登録ID/同semantic digest/変更metadataを実行で照合。版は021対象別能力、026 Guard/Bot境界1.0/能力1.xを保持した。source旧58と新16 pinsを再計算、6main prefix/64CASE15AC/trace定義/NFR範囲/静的検証を確認。validate147/fail0、stale0、residuals0、govcheck7622/57/58、diff PASS。

独立再reviewと承認は未成立。fixture・旧runtime/CIを実行せず、L2意味・範囲・owner・版を変更していない。
