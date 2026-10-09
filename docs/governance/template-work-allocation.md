# テンプレート作業の分担と読取り入口

## 現在の分担

本書は旧HARNESS一括所有の作業を、既決の責務へ割り当て直す案内である。要求意味・採択・実装許可の正本はConcept、対象別L2/L11、PO判断記録であり、本書やticketから生成しない。確認baseは`261566b7ce3eae52bdfe6e32fcea7bcbb85961ea`。現行L3以下は10/10巻き戻しで停止している。

| 作業単位 | ownerと対象 | 渡すもの | 現在許可される整理 |
|---|---|---|---|
| 汎用テンプレート | BRAIN。DST-HARNESS-002/005、DST-OS-001の汎用版・状態 | 意味契約・版・適用条件・seedの汎用構造 | 旧source/実例/seedを読み、既存BRAIN要求と候補の意味・対oracle・採否の対応を整理する |
| 製品要求への適用 | HARNESS-CORE。DST-HARNESS-001/003/004/006/007、DST-OS-005の停止・Backflow意味 | 製品固有の設計義務、適用/N/Aの意味、欠落入力のBackflow、変更影響 | HARNESS-L2-009/008と対L11に接続し、汎用構造と製品固有の意味を分けて要求整理する |
| 案件の適用記録・運転 | OS。DST-OS-001のproject exact set/版、003の適用・義務・N/A・Backflow・結果、004の候補登録/振分、005の適用 | 同じ因果関係の対象・revision・版・適用結果・候補の記録 | OSの既存登録・provenance・推進責務と候補を照合し、HARNESS/BRAINの意味を再定義しない |

DST-OS-002の選択は、HARNESS要求エンジン・BRAINパターン・INTELLIGENCE稼働判断の接続として扱い、単独ownerへすべてを割り当てない。改善はOSが候補を登録・振り分け、LABOが効果と退行を評価し、評価を経た汎用パーツをBRAINへ返す。LABO評価・INT提案・OS受領から採択を生成しない。

## 発行した作業指示

- 汎用構造の要求整理: `FT-BRAIN-TEMPLATE-REVIEW-001`
- 製品適用・Backflowの要求整理: `FT-HARNESS-TEMPLATE-REVIEW-001`
- exact set/版/結果・改善接続の要求整理: `FT-OS-TEMPLATE-REVIEW-001`

旧FT-HARNESS-DESIGNTPL-001とFT-OS-DESIGNTPL-001は過去の発行記録として保持する。既存seedはscaffoldのauthority状態とBindingを保持し、一括で物理移動・正式昇格しない。L3再開後の設計・実装作業は、POが定める順序・範囲と必要な上流状態から再構成する。

## 根拠と旧source対応

[Concept](../concept/helix-concept.md)、[9/25 PO指示](decisions/brain-helix-core-po-intent-2026-09-25.md)、[現行候補の担当表](../helix-brain/candidates/design-template-system-requirements.md#現行conceptに照らした担当)、[HARNESSの適用境界](../helix-harness/L2-requirements/product-requirements.md#design-templateと要求backflow)。担当表は配置の読み替えであり、候補の採用ではない。

旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:19–46`のJSON意味契約・ID/版・生成view・適用判定・portfolio・pairの役割を保持する。旧HARNESS一括所有から、9/25判断に沿い汎用構造BRAIN／製品固有適用CORE／案件運転OSへ分ける。理由は製品をまたぐ知識と製品固有の意味・実行事実のowner分離であり、旧source不在を理由に新たな機構や承認手続を加えない。
