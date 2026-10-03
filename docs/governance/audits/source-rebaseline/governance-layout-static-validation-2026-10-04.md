# Governance配置後の静的検証本文（2026-10-04）

この追補は `governance-web-scaffold-layout-integration-audit-2026-10-04` の137件比較要約に対し、exact HEAD `f0dcd917ea26ce90cc7d628d9f8e0d0b799307f6` で実測した全137 readerのpath・実SHA・exit code・出力・所要時間をJSONに保持する。rootが現行treeの各reader SHAを独立照合し、137件すべて一致した。後続の監査追補とWeb/scaffold公開枝の合流はreader/inputを変更していないため、未変更の137件を再実行していない。

結果は82成功・55既存失敗、timeout0。base64beの79成功・58失敗との差は既に記録した3件の読取補正のみで、passからfailへの変化0件。全件成功とは扱わず、既存失敗の出力を残す。この記録は静的検証の証拠であり、L3承認や実行許可を生成しない。旧runtime/test/CIは実行していない。

旧起点と配置変更の保持点・変更理由は既存の配置規則とGovernance固定履歴移動監査に記録した。既存時点監査を変更せず、実測manifestのSHAと全結果をこの時点追補へ収める。
