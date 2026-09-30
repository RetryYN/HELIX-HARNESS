# FRS requirementsのfrontmatter参照8行：分類修正案

## 概要

- 基点: `0f5050e2b25cd622640c99c5de170cca087f7d8a`（#2386 merge後）。
- 対象: Functional Release Slice requirements sourceのYAML frontmatter `refines` list 8行（source lines 19–26）。
- 提案分類: 8行を `explanation / condition subtypeなし / not_condition` とする。authority effectは`none`。
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md`、asset `LEGACY-ASSET-B75E46DBE77592351574`、file SHA-256 `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17`。

## 分類理由

8行はいずれも`RLS-R-*`の識別子だけを列挙するfrontmatter参照行で、製品の動作、適用条件、成功・失敗oracleを記述しない。旧sourceの`refines`関係は本文bytesとcarry-forward inventoryにそのまま保持する。関連する旧要求の採択、coverage、successorや妥当性はこの分類から導かない。

分類は#2356/#2381のmetadata precedent（文書・要求・Behavior Contract等のIDだけで独立した規範述語のない行はexplanation）に合わせる。隣接する実要求本文（`RLS-R-01`など）はこのproposalから除外し、別source IDのまま保つ。sourceは`historical_candidate`、targetは`draft_candidate`、atomizationは`preserved_pending_atomization`。

| Source ID | 旧source line | 参照値 | 提案分類 | Source-line SHA-256 |
|---|---:|---|---|---|
| `LEGACY-CAND-LINE-002164` | 19 | `RLS-R-01` | explanation | `aaa5868643d47b12197300669813517a2ed60165a06b7d58297fd99e0615b173` |
| `LEGACY-CAND-LINE-002165` | 20 | `RLS-R-03` | explanation | `417055a9b206ad31fc9261aeb98c4889e802cba31f0668ae8e065b95ba1f088b` |
| `LEGACY-CAND-LINE-002166` | 21 | `RLS-R-05` | explanation | `24ea466105e75a2915829dfca69abd01775573737f43ea9797c384cd9d6e1afe` |
| `LEGACY-CAND-LINE-002167` | 22 | `RLS-R-07` | explanation | `939210e175d93d91de7aadf3b90c7c2c430292a6acab313c24bb83d434f75ba2` |
| `LEGACY-CAND-LINE-002168` | 23 | `RLS-R-09` | explanation | `25bd73c7405849e005f07f9e128bc4e07d0d6ac7b6e5ef24cb4ad8be5c0dc046` |
| `LEGACY-CAND-LINE-002169` | 24 | `RLS-R-10` | explanation | `1351bb3d90eebcb6fa953a6fb1ee45d64f5c27f4c5689c46b6569aaba8b18c2d` |
| `LEGACY-CAND-LINE-002170` | 25 | `RLS-R-11` | explanation | `f32bcad4b9896dc9da917c4bc53c24f159a4e1ada9bc5c620187a4d4f8ee0765` |
| `LEGACY-CAND-LINE-002171` | 26 | `RLS-R-12` | explanation | `50a243f249794ce3d4f8c7a800469edc186ac7fb4bfe1bd55f0b51e4b24e148d` |

## pool・union確認

#2385後の現行poolは471行。#2386後のproduct-targeted route unionは341 ID、HMCのpool外30 IDを含むall-route unionは371 ID、pool交差312行、未監査pool159行。8 selected IDsはいずれの前classification overlayとも交差せず、#2386までのroute unionとも交差しない。

この提案を適用した場合、product/unknown poolは463行、conditionは858から850、explanationは2,971から2,979、product requirement atomは820から812となる。route unionとpool交差は変わらず、未監査poolは151行となる。これは条件付き算術であり、proposal merge前の現行状態を置き換えない。

## 保持する境界

このproposalは旧source本文・source ID・参照先の文字列を変更せず、参照先要求の採択・移管、要求coverage、successor、現行authority、実装・受入を生成しない。旧archive workflow、CLI、hook、adapter、test、CI、runtimeは実行していない。静的にsource bytes、line digest、inventory、classification overlay intersection、route union membershipと算術を照合した。
