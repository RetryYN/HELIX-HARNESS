# DDDSTRICT原文行保全の訂正

独立review [F1](https://github.com/RetryYN/HELIX-HARNESS/pull/2897#issuecomment-6107933782)が初回30行の入力集合から、固定案legacy_sources指定45行のうち15行が欠けていることを指摘した。固定案の全spanを実fileで読み、原要求FR-L1-50、固有方向表、workflow placement、real repo guard、共有boundary matrixを含む45行を保全した。空行・見出し・表区切りも保持する。旧runtime／test／CIは実行していない。

初回source-lines／receipt／MPR行は当時の記録として書き換えず、[訂正source](dddstrict-adoption-source-lines-2026-10-11-r2.jsonl)と[訂正receipt](dddstrict-adoption-coverage-receipt-2026-10-11-r2.json)へ新しいrevisionを残す。初回30 atomのID・原文・hashは保持し、追加15 atomを一意に追記した。原文45行の保全先を`MPR-SH-DDDSTRICT-002`へ、候補仮登録を`MPR-RC-HARNESS-L2-005-002`へ訂正する。両方の001をsupersedesで指す002を台帳末尾へ追記し、生存末端を002へ置換する。

[PO判断](../../decisions/dddstrict-adoption-po-decision-2026-10-11.md)は要求meaningの採否根拠のまま保持する。そこに記した001と初回receiptは記録時点の参照であり、現在の仮登録・source保全は本訂正から読む。固定L2／対L11 text、意味digest、版、親revision、PO原文は変更しない。旧固有方向表は原文保全のままで、汎用005へ移管／削除したと主張しない。no_lossは限定入力45行の保全partitionだけであり、全source意味移管、formal successor、Issue closeを生成しない。
