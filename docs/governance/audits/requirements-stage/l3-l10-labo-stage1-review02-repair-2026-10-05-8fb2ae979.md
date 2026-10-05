# HELIX-LABO Stage 1 Claude review02 修正記録

この記録はClaudeの再review `RH-PR2580-LABO-STAGE1-02` に対する作成側修正を固定する。対象本文commitは `8fb2ae97960ad0f7a84380e3d52ab99920ee2dc7`。詳細なcanonical SHA、固定sourceの実revision/full SHA/raw-LF SHA/literal、旧source pin、各findingの対応は[監査JSON](l3-l10-labo-stage1-review02-repair-2026-10-05-8fb2ae979.json)を参照する。初版・訂正01を含む従前のimmutable監査は変更していない。

修正は4所見を対象にした。N3では、`HELIXLABO-L2-001` L2:73に実在する観測欠落・権限外情報だけをsource責務への戻し先とした。source identity/revision不一致は元recordを保ってholdし、新routeを作らない。relation不一致である根拠がある場合に限り、`HELIXLABO-L2-011` L2:165のCorrelateへ戻す。L10のC02/C12とNFR測定、FR/AC/coverageをこの区分で揃えた。

N1ではsource status/recordとLABO processing hold・拒否を分けた。unknown/not_observedの誤変換およびidentity混合は元の値を保つholdで、新しいsource-owner routeを設けない。C15のscope欠落・未許可は固定L2-001に明示された欠落・権限外条件としてのみ戻す。

N2ではL11 §24 #1をFR coverageへ明示し、identity混合、scope欠落、scope未許可をそれぞれ独立入力としてNFR測定へ結んだ。N4ではL2:159の個別connector非代用をC13とcoverageへ明記し、要求parent IDまたは別connectionのidentity/receiptによる代用をreceipt不一致として止め、受領・接続成功を作らない。

固定sourceは、L2/L11をPO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の `git show` bytesから、PO記録を `633bf12ea8f948db8ba3d6600179c4a9507377a7`、MPR registerを現main `28b3d3645e6298c159758700c2edd3d396c336f5` からそれぞれ再計算した。特にL2:159–161はraw-LF SHA `44221dd644e0c18ef43b6f39177417f9a2442af46fff8cde08b827d981c372ec`、L11 §24 rows 109–116は `7e3bcd9acc0c1b35d2d6d5d56ffb5081825a4cae12386612a9a986a645cdc41d`。

過去のrepair-correction01監査はwhole L2/L11 SHAと行数をworking-tree snapshot値で記録していた。新しい監査は固定revision bytesを再取得し、L2=`f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`（455行）、L11=`bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`（203行）として訂正した。既存の親節raw-LF SHAは一致し、旧監査はそのまま保持した。このpin訂正は要求内容の変更ではない。

検証は `scfctl validate` 147件、fail 0、`stale=0`、`residuals=0`、`govcheck ok atoms=7622 requirements=57 files=58`、`git diff --check` pass。6 canonical合計227行、FR 2、AC 4、機能case 28、NFR候補5、L10 NFR測定行5。

本記録は作成側の修正証拠であり、root検収、修正後HEADの独立review、PO承認を表さない。旧runtime/test/CI/Bunは実行していない。
