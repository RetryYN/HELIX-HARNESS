# F03/F05独立手動照合の記録（L9 PR-A範囲）

## 方法と限界

別workerがcandidate manifestを見る前に、固定main `821a655ad6949b2a7a5344b26e3c170cccc353a6` のL3/L4/L5と固定raw snapshot `ed3981e7b9419d796adf1981f8990c6b626ecabe` のL9 `raw_utf8` からF03 14件・F05 8件を手動で照合した。元メモSHA-256はF03 `181c85c63c6e286830e71b3d6bf0c7d62df9b581f163226b047df62a6e98c619`、F05 `35dbf7772bd15adcfe31c99e3e4488cf7d6b1cfaa943c35342e7291800710baf`。

独立照合ではL5も読まれており、特にF03のwrong-layer 3件のL5 rule順を確認した。そのため、元メモをL4/L9間のL9出力順の独立根拠とは扱わない。PR-AではL3/L4 class情報と固定L9入力からfinding集合を保持し、L4に順序規則がないwrong-layer 3件のL9順序はunknownとする。L5はcode・ownerの一致確認に限る。

## F03: 14件

根拠はL3 `HARNESS-L3-003-F03` の `/requirements/66/obligation`、L4 `/contracts/3/negative_classifications/0..3` と固定L9 raw。trace欠落1件は `F03_REQUIRED_PAIR_MISSING`、L9観点欠落10件は各々 `F03_L9_DIMENSION_UNKNOWN`。いずれもL4がcodeとbackflow ownerを単独で定める。

wrong-layer 3件はL4から `F03_REQUIRED_PAIR_MISSING` と `F03_PAIR_SCOPE_CONFLICT` の2-code集合までを導出できる。L4には両classの一意なemission orderがない。元の独立メモで見たL5順 `F03_REQUIRED_PAIR_MISSING` → `F03_PAIR_SCOPE_CONFLICT` はL9期待の根拠に採用しない。3件の候補には集合と順序unknownを記録した。

## F05: 8件

根拠はL3 `HARNESS-L3-003-F05` の `/requirements/68/obligation`、L4 `/contracts/5/negative_classifications/0..4`・`connection_detail/port_fields`・`initial_order` と固定L9 raw。各rawで対象必須fieldの観測のみnull、定義seq `0` は開始seq `1` より前。他のrequired observationは存在する。

8件ともL4から `F05_REQUIRED_PORT_FIELD_MISSING` のsingleton codeとHARNESS ownerを導出する。未決authorityを操作許可にせず、戻り先null・Reverse未実行を保ち、恒久対策・backfill・Issue closeを成立させないため、他4 classは発火しない。L5はL4 code/ownerとの一致確認のみで、singleton出力候補の生成元ではない。

## 限界

これは固定文書・pointer・raw bytesと手動class照合の記録であり、関数実行、製品test、checker合格、freezeを意味しない。既存期待・182件のcase populationは変更しない。175件の未形成caseは残る。
