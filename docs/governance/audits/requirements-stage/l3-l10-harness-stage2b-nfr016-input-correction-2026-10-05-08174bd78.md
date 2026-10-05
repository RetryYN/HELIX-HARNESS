# HARNESS Stage 2b NFR-016入力列の訂正記録

HARNESS L10 NFR検証の `CASE-HARNESS-L10-NFR-016-01` 入力欄に、固定L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の324行目が明示する `regression oracle` を追加した。変更は1行のみで、性能比較の6条件を列挙する既存oracleと一致させた。

本文commitは `08174bd78e4c6c3400af1b0c1d88bf6b8114313e`。base `fa642cddc3c4446e3635f1c6badd90209862cfac` 由来のStage 1 prefix 6件すべてのbytesは維持。直前body `75017bb2b68460314e0d8dc936dfb30fe9329ace` の訂正監査は書き換えていない。本記録はroot作成側の限定補正で、独立reviewではない。

固定L2-016/L11 G13、旧HR-FR-HIL-16/HAT-HIL-16/SRV-FR-007のfull file SHAとraw span SHA、6文書のcurrent SHAとprefix SHA、訂正行のliteral/hashは対のJSONにある。L3候補承認や性能値を生成せず、旧test/runtime/CIは実行していない。
