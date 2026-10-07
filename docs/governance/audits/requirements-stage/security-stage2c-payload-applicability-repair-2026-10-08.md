# SECURITY Stage 2c：payload適用条件の整合修正

対象親は `HELIXSECURITY-L2-031` の1件。比較baseは `786ee7c85c5454e3b2314c1d8ee3ca28f5178db1`。この記録は修正理由と静的確認であり、承認・実行結果を生成しない。

固定要求 `633bf12ea8f948db8ba3d6600179c4a9507377a7` の `docs/helix-security/L2-requirements/security-requirements.md:427–446` は依存4区分の第3区分で、taskにファイル情報が必要な場合だけ選択payloadのsource identity/revision/path-digest manifest/classificationを束縛する。固定L11 `docs/helix-security/L11-acceptance/security-acceptance.md:104–115` は4区分のsame-revision評価を求める。固定L11自体にmanifestなし正常CASE-031-02があるとは主張しない。その正常例は現行L10 CASE-031-02で具体化されている。

現行L3 FR-031-02とL10 CASE-031-02はこの条件を保つ一方、FR-031-06とCASE-031-06は開始前不足列挙へpayloadを限定なく含め、ファイル情報不要taskまで拒否する読みが残っていた。FR-031-06とCASE-031-06のpayload不足・変更変異を適用taskに限定し、ファイル情報不要taskのpayload不在を拒否理由にしない正常対照を明記した。適用性unknownは非該当に丸めず保留する。既存authority、isolation、credential、classification等の独立条件を免除せず、要求の意味・範囲・owner・版を変えない。

旧sourceは `LEGACY-ASSET-C7F0C3B79CBAA72960BF` の `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:57`（HR-FR-HIL-23）を実読し、最小払い出し、sandbox、proposal再検証、拒否境界を意味再導出する既存処置を保持する。今回の差分は固定L2の選択入力条件を現行のfailure oracleへ一貫して適用する修正であり、旧runtime、schema、test、CIは実行しない。

静的確認：変更はL3/L10機能本文の031-06内に限定し、031-02のファイル情報要否別の正常・negative・未見正常との整合を確認した。選択payloadが適用されるtaskのmissing/unknown/staleおよびidentity/revision/digest変更は引き続き独立negative。非適用のtaskは他の適用条件を満たす必要があり、適用性unknownを正常へ昇格させない。business/NFRと他Stageは変更しない。`git diff --check` 合格。独立reviewと対象revisionの委任承認は未了であり、以前の本文承認を修正本文へ継承しない。
