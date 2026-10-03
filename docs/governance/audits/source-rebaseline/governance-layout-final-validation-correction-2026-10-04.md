# Governance最終検証監査の事実訂正（2026-10-04）

本追補は、[元監査MD](governance-layout-final-validation-2026-10-04.md)と[元監査JSON](governance-layout-final-validation-2026-10-04.json)の2点だけを訂正する。元監査はcommit `fd4be67cada3f93cfcd4a2ef340f3d8ee4858a1d`、MD SHA-256 `19dbdf56ce19801e7435e95f3948f8167145e761a88d4d892ac0f3ea7031897d`、JSON SHA-256 `20e7509d6df50e19299271ac175e0185f0a53d2ecb2e2649dbafc22ad4a4cf02`の時点記録として変更しない。

第一に、元監査が「#2424関連」とした713行から714行への記録は、#2424のtemplate seed PRではなく、#2554の要求終了時点に関するpending4-bun記録である。[その固定JSON](../requirements-stage/po-decision-pending4-bun-verification-2026-10-03.json)は713行から714行、candidate分母384件、authority effect `none`を記録する。この値は元監査の他のregister件数と別の対象・時点を持ち、修正後も件数・分母は変わらない。

第二に、元監査の「新しいvalidator実行は追加していない」は誤りである。rootがexact candidate HEAD `2a4c478d42146137cd0b4126914bb6775e7900b8`で137件を実行し、manifest `/tmp/l3-d0-gov-after-register-fix.json`に82 pass、55 fail、timeout 0、157.8秒を記録した。manifest SHA-256は `8bab10fe9f32c90885bc6715d755d1fcd1a937ad05be49e231ac969f175dbe21`。元監査のfinal-publish比較に関する82/55、exit差0、新規fail 0、およびf0dcd9から2a4c478dまでのreader SHA・exit・正規化出力一致という結論は変わらない。

この追補は要求意味、candidate採否、L3承認、実装・実行許可を生成しない。修正対象は上記2つの説明事実のみで、元監査に含まれる移動・register・Binding・137件比較の他の証拠と結論は維持する。機械可読の内容は[訂正JSON](governance-layout-final-validation-correction-2026-10-04.json)に記録する。
