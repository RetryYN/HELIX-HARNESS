# HELIX-OS Stage 3 1.0 L3/L10 公開草稿 cutout

2026-10-05時点の記録。対象は採択済みの HELIXOS-L2-032/033/034/035/036/037/038/040/041/042/043/044/049/050/051 の15親。版未指定の親、OS-039、他機構、source worktreeにあるStage2a/2b/2c本文は含めていない。049–051の条件付き採択条件は各親の範囲に保った。

canonical本文は source candidate `ea34a9cf71bdaed624f5dbdefd39b7050f89250c` のStage3 suffixを、main `3b63e2a99f82d83e8ad76e9b33dc1199924f9a7c` の6正本全文へ追加した。Stage1/既存本文のprefixは全6ファイルでbaseとbyte一致する。canonical body commitは `7474eaa5f36725801e7684e6d945ab3080143869`。固定L2/L11は `633bf12ea8f948db8ba3d6600179c4a9507377a7`、採択statusは各親のPO decision rowから照合した。

L10には73個の親ACすべてに対する75個のfunctional CASE rowがあり、欠落ACとCASE ID重複は0。CASEには通常、個別negative、未見正常、状態不明時の戻し先を親別に記載した。BR/BVでは対象に独立business outcomeがないことを明記し、functional FR/AC参照に留めた。NFRは根拠・比較案・L10測定を持つ候補として記載し、個別値のPO gateや新しいStage gateを設けていない。

root公開前gapへの主な反映は、032の個別eligibility field、033のengine/detector別receiptとpartial/failed否定、034のdisposition別receiptおよびaccepted-riskの両要件、035の遅着event/resume、036のoracle・scope代替否定、037の二経路、040のretry episode/台帳不明/他task継続、041のwithdrawn claimと旧指示の分離、042のscope/revalidation条件、043のrequest/call/resultと権限の分離、044のprose-only制限、049–051の分母・owner・independence/current-head条件である。

038はL11基本範囲671–689と追加範囲690–696、PO決定行35および範囲行37–40を別々にpinした。採択basis `909c8015326f35f8d42ce12e3c388923de411d1f` と記録revision `5aa100319361b0cc86edd3c51815ec777d55410a` を記録し、追加条件はHARNESS-041-003適用時に限る。歴史的な「未採択」表記を現状の採否に使わず、OSはHARNESS抽出findingの意味を再判定しない。

旧sourceは51 bounded spanについて旧asset ID、full file SHA-256、物理行、LF-inclusive raw span SHA-256を再計算して固定した。040の実引用範囲hashを照合し、041のasset IDとバッククォートを補正した。043のpillar/worker/HAT sourceはADR-010後の別時点sourceとして明示し、固定L2が参照するv1.3 Node専有権限の未決sourceと混同していない。旧runtime/test/CIは実行していない。

静的検証は `scfctl validate` で147 bindings / fail 0、`govcheck` で7622 atoms・57 requirements・58 files PASS、`git diff --check` PASS。旧runtime/test/CI/Bunは実行していない。これは作成側の静的検証であり、rootの最終検収および独立reviewは未完了。新しいPO承認、実行許可、実装・release完了を生成しない。

全source pins、6本文SHA、parent AC→CASE対応、038の採択範囲、旧source raw pins、検証境界は隣接JSON `l3-os-stage3-1_0-cutout-audit-2026-10-05.json` に記録した。
