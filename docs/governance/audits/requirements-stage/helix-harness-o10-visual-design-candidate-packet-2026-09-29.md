# O10 Visual Design HARNESS 候補照合packet（2026-09-29）

status: candidate_for_PO_review
authority_effect: none

## 起点と候補範囲

[O10作業依頼source snapshot](o10-visual-design-harness-request-source-snapshot-2026-09-29.md)の依頼に基づき、HELIX-HARNESSの単一identity `HARNESS-L2-049`と対の`HARNESS-L11-049`を候補化した。O10 sourceは作業の起点で、要求authorityではない。候補は未採択で、実装・実行・検査・PO合意の事実を主張しない。

O10が示す1.0項目を既存候補と重ならないよう配置した。

| O10項目 | 候補上の配置 |
|---|---|
| Pattern/CORE/profileの制約内でrenderable prototypeを作る | 既存HARNESS-L2-039候補が広いExperience/UI/Frontend contract内で扱う。049は生成者にならず、039の採択も前提にしない。 |
| semantic identityとExperience/UI/Frontendの関係 | 既存039候補の領域。049はidentityを発行せず、入力に不足すれば戻す。 |
| 表示結果を測る（accessibility、contrast、viewport、主要state、文言量） | 049の責務。対象screen/device/view/stateのsource spanだけ旧VDH-FR-011から選択する。 |
| 検査精度をknown positive/negative fixtureで評価し、不確かな検査はwarningにする | O10 task basisからの新規提案。既存LABO接続へ評価を渡し、LABOに新要求を追加しない。 |
| 画面文言の役割・上限目安と冗長なcopyの指摘 | O10 task basisからの新規提案。旧VDH-FR-005の情報優先順位は参照し、量の明示ルールが旧sourceにあったとは主張しない。 |
| vision/brand/prototype agreementと受入は人、`implemented`と`ux_verified`は別 | 049は機械計測結果からこれらの状態を生成しない。既存039候補が同領域を含むため、049は状態の所有・判定を追加しない。 |
| real-data/user UX、prototype-implementation drift、analytics event linkage | O10指定どおり1.0候補から除外し後続版へ保留。211-file intake、legacy sub-check、DB/runtimeも移植しない。 |

単独で成立する049のinputは、利用許可とscope/revisionが結ばれたrenderable prototype、適用profile、検査oracle、既知のpositive/negative fixtureである。これらを受け、049は描画条件と各測定の結果・証拠・unknown/warning・差戻し先を返す。別のprototype producerや039の採択を前提にしない。

## 旧source spanと保留

- 旧FR source: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md`、asset `LEGACY-ASSET-335176749F6322C3CD8D`、source SHA-256 `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d`。
- 19 FR本文cellを25個の非重複spanへ分け、1 span（VDH-FR-011の主要state/device/view条件）を049候補へ、他24 spanを`MPR-SH-VDH-O10-001`へ保全する。FR-003/005/010/013等のO10依頼上の記述もsource holdingに残り、049がそれらの責務を受け継いだとは主張しない。
- 旧assessment audit: asset `LEGACY-ASSET-4E880D2FCD37879BA300`、SHA-256 `9699f18b937dae6ec9edcbf18aba8d3d0854192baa217a02fee7ca67914cef56`。旧文書管理実装とscreen/prototypeの設計段階を分けた記録として読む。旧実装状態は現行の実装証拠にしない。
- O10で「文字数/文言の量」について旧L3 sourceと旧L2-screenをbounded searchした。FR-005の情報優先順位とL2-screenのMarkdownRenderer記述はあるが、明示的な画面copy量・冗長さの規則は見つからなかった。O10にある目安・重複・説明過多検出は新規案である。

## 現行の関係とdecision状態

親は現行HELIX-HARNESS L1（commit `5d9e1fc3a6d45a791014b44ee9a729c852db8a41`で参照）と現行Conceptである。BRAIN Visual Design/UX Pattern提供、LABOの検査精度評価、INTELLIGENCEの配置案は既存接続を利用し、各接続の候補採択は推定しない。product固有screen/flow/token/Visual Identityは製品HELIX-HARNESS-COREの所有範囲に置く。

本packetは`HARNESS-L2-049`/`HARNESS-L11-049`の対象revision、version target、適用範囲と保留範囲の照合を提示する。要求採択、L3承認、実装、実測、PO agreementを含まない。人間decision対象はcandidate pairの内容そのものであり、別の承認段階は追加しない。
