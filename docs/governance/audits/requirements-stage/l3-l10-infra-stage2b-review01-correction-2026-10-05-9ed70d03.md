# INFRA Stage 2b #2587 review修正記録

修正本文commit `9ed70d037e32cbe3f69d27adeb4ba46b45e29139`（旧本文HEAD `8d475edae430f05e0216ce1b8e6132b744f89cd7`、review comment #5986545754）。対象は固定済みL2-002/007、version_target 1.0のみ。形式上の監査recordであり、authority effectはありません。

正式review comment本文SHA-256: `525b72df583f66e58856710dda3063621b662a5515e4c234db612d85fd4b3ad0`。Major 1、Minor 5、Blocker 0を、次のとおり本文と監査の訂正へ反映しました。

- 002のactual昇格、unexpected resourceの承認扱い、比較入力上書きをC04/C08/C09へ分離し、比較入力・正本bytes・authority不変をAC-01と各oracleへ追加。
- 002のFR crosswalkにC06依存negativeとC07未見正常を追加。
- BR文書のcase rangeを002 C01–C09、007 C01–C08へ修正。
- 007の文書のみ、backupのみ、消失machine内のみをC03/C07/C08の別入力にした。
- 007 FR crosswalkへC06 dependency-negativeを追加。
- 6件の旧資産pinへasset_idを加えた新監査を作成。以前のcutout監査JSONはbyte不変。

L11原文literal pinsは固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の `infrastructure-acceptance.md` 50行（002）および100行（007）で、両行のraw-LF SHAと全文SHAをJSONに記録しました。15個のsource pinsは指定commit/pathから全文・inclusive physical-line spanを再計算して全件一致。Stage1 prefixは6/6文書で承認revisionおよびcutout baseとbyte一致。現canonical 6文書SHA、全行SHA pins、AC/case対応表をJSONに収録しています。

静的検証: `scfctl validate` 147/fail 0、`stale=0`、`residuals=0`、`govcheck` atoms=7622 / requirements=57 / files=58、`git diff --check` pass。旧runtime/test/CI/Bunは実行していません。

旧publication cutout監査、root static JSON、summary、prior cutout/history artifactsを新記録からhash/blob/sizeでpinし、不変を確認しました。history-availability JSONの詳細fieldとroot static JSON詳細fieldはこの作業の意味検査範囲外であり、未確認状態として次の独立reviewへ明示carryしています。

この記録は作成側修正の証拠で、独立review、PO承認、L3承認、実装・実行・配布を生成しません。
