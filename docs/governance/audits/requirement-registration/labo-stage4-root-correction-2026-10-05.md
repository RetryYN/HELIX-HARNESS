# HELIX-LABO Stage 4 root correction verification

対象は固定採択親 `HELIXLABO-L2-036/037/038/039/040/041/052/054` のStage 4 L3/L10候補である。対象L2/L11は `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO決定・候補registerの実在revisionは `633bf12ea8f948db8ba3d6600179c4a9507377a7` に固定した。633にはPO決定行と8つの管理register行がある。registerは `registered_proposal` / `authority_effect: none` で、L3承認とは区別する。決定・registerのfull SHA、親ごとのraw LF span、旧sourceと資産台帳の照合は同名JSONに格納した。

本文修正は `6c9686b36e670500532f89ff7a5cb0079604a2eb` と `171c1555bf07a440e515da2d90325ca79febbb7e`。PO行が後続revisionから入ったとする記述を訂正し、旧source disposition表の終端を修復した。各親の正常/未見正常fixtureを具体化し、target/source identity、revision、scope、connector、receiptの固定親にある欠落条件を独立CASEとして記録した。054にはunknown jobの成功保証、scoreによるscope/branch/merge authority変更を個別に拒否するcaseを加え、配置案はINTELLIGENCE、指定/割当はOSとした。独立business outcomeがないためBR/BV/BCASEは追加していない。

L10は86個の一意CASE、L3は8 FR/16 ACで、各CASEのAC参照が解決する。Stage 4 NFR verificationにも86件すべてを参照し、同じ8親のnormal/held-out/個別変異を測定母集団として記載した。6 canonicalのStage 1 prefix bytesは基準revision `0a150fba9c98fd99f491c79a0652ddb3bdf4434a` と一致し、旧authoring監査JSON/MDのbytesは不変である。

静的検証は `scfctl validate` 147 bindings / 0 failures、`stale=0`、`residuals=0`、`govcheck` 7622 atoms / 57 requirements / 58 filesでPASS。`git diff --check`もPASS。旧runtime/test/CIと新しいfixtureの実行は行っていない。

これは作成側の訂正記録であり、root最終検収および独立reviewは未了である。L3承認、実装・実行・配布許可、業務完了は生成していない。
