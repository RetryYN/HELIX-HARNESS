# Concept v4調査基準6行の分類修正提案

## 概要

- 基準HEAD: `0f5050e2b25cd622640c99c5de170cca087f7d8a`（#2386後）。対象は `LEGACY-CAND-LINE-002607`–`LEGACY-CAND-LINE-002612`、旧source物理行5–10。
- 6行を `explanation / subtypeなし / not_condition` とするbounded proposal。要求意味、authority、adoption、route coverageへの効果はない。
- #2385後pool 471件のうち6件が対象。適用時poolは465件。#2386後のroute union 371件（うちproduct-targeted 341、out-of-pool HMC 30）、pool交差312件は不変。未監査poolは159→153。

## 原文と分類根拠

旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-concept-v4-capability-delta.md`、asset `LEGACY-ASSET-93505A0E6A989C5C0F09`、file SHA-256 `af5a4cd6ad6dcb85be811bba8213a185d64a17239bfc3b5d69e728bfb03ac0cc`。asset ledger上は `Historical / product_target unresolved / authority historical / disposition unresolved`。carry-forwardは `historical_candidate → draft_candidate`、successor IDなし。

| ID | 行 | 原文 | 提案分類 | 理由 |
|---|---:|---|---|---|
| `LEGACY-CAND-LINE-002607` | 5 | `- repository: RetryYN/HELIX-HARNESS` | explanation | 対象repositoryの同定。製品動作条件ではない。 Line SHA-256 `4b1c8716d8b0f2c25af610fcff982c90586ecb99de625104dcb73e62bede2b67`; physical bytes SHA-256 `67818b633c41300fe40474409128bd9c43287eb4d8f5f4648669e87d385fb91f`. |
| `LEGACY-CAND-LINE-002608` | 6 | `- baseline main: a122bf933d89a9df8ec9048f26bf4e554dfc5d63` | explanation | 調査baselineのmain commit識別子。要求の適用条件ではない。 Line SHA-256 `0e300274372cb2335d3544f88c177dccfbbb7f868f20b69e936345ac59b6cdf3`; physical bytes SHA-256 `77436220f94d358ac134d3886eb5cab30ac46ecea53e5827db2cc5e896e36d79`. |
| `LEGACY-CAND-LINE-002609` | 7 | `- baseline tree: bee9c3fac6b768201605393a39b21ef0d80cad4d` | explanation | 調査baseline treeの識別hash。behaviorやacceptance predicateではない。 Line SHA-256 `a1cf15be061a8b25634044da23cf179ba5cb25d75aea49a98b08c10dda64866a`; physical bytes SHA-256 `23aaf5400aa278bdfa493bc0ee5091df2ef233ee39164ed3c3552c23a7846a07`. |
| `LEGACY-CAND-LINE-002610` | 8 | `- concept source digest: sha256:b9174fd408354243711c1245fd4b20c17b25f2b0283725c38f7b822b10519418` | explanation | Concept入力sourceのdigest。入力来歴metadataである。 Line SHA-256 `1d218596273fec6c3f34ac3f06b17d23e57ade2afeac6e0f691797dc0aa666f8`; physical bytes SHA-256 `09304004e34d0964f9020204ce404dc789b1eb42e6147198dd5aa925bad5e5db`. |
| `LEGACY-CAND-LINE-002611` | 9 | `- inventory source digest: sha256:10370d8ed8ce33fa45b5271b8d363347cb68b62235082c58cc941ddec697d507` | explanation | inventory入力sourceのdigest。入力来歴metadataである。 Line SHA-256 `36e62b47d39dff5b3cf30f457667c819159a3574f7f477b3e9503f68c2b995e5`; physical bytes SHA-256 `47e080bb9267fa73aad25094b62b17f8ca0203d6bcae8faef2bdedbdf593da92`. |
| `LEGACY-CAND-LINE-002612` | 10 | `- method: src全path、current governance、design catalog、L3 requirement family、Release composition、` | explanation | 調査で照合したpath/catalog/family/release/Issue/PR inventoryの方法記述。調査手法を列挙し、製品の規範条件は述べない。 Line SHA-256 `1aad5283e9ac261edd7db3b1961448e284a96a130ee3b9c0e6ea739bb64462c4`; physical bytes SHA-256 `6a4ee497cefdb89bbebeb429325044652e137d70b1243fa016c135b52716b324`. |

6行は「調査基準」節の対象識別・baseline/input provenance・調査方法で、製品の動作、受入oracle、必須状態遷移、操作権限条件を述べていない。補正対象はこの6行に限る。物理行11（`LEGACY-CAND-LINE-002613`）はmethod listの続きだが、#2353のexact row baselineですでに`explanation / subtypeなし / not_condition`。以後の分類overlayとの交差はなく、product/unknown pool外でroute unionにも含まれないため、訂正不要として対象外にする。後続のcapability mappingや結論、除外・補正（19–54行）は変更・評価しない。

## 隣接するmethod続き行の状態

`LEGACY-CAND-LINE-002613`（物理行11、`open Issue／PRの責務inventory`）は、#2353 row baselineで`explanation / subtypeなし / not_condition`。file SHA-256 `af5a4cd6ad6dcb85be811bba8213a185d64a17239bfc3b5d69e728bfb03ac0cc`、line SHA-256 `553b7f88d25dff3195b3b09c7a858e797beab7a5a4bf7b5dc6051182d0b89486`、physical-line SHA-256 `5d4be15ecaa5bdf79bf37c425de3a8a70a8677a523975ccc6906be60cd92fc89`。#2356〜#2385分類overlayおよび#2386までのroute-audit unionとの交差はなく、現在pool外。したがってこのproposalで再分類せず、baselineの説明分類を保持する。

## pool・監査unionとの照合

#2353 exact row recordsでは6 IDすべてが `condition / product_requirement_atom / unknown`。#2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381、#2385の分類overlayは選択IDとの交差が0件で、6 IDは#2385後の471 poolに残る。#2386までのroute unionも、#2378、#2380、#2379、#2383、#2384、#2386のsource selection/union IDとの交差は0件。

| 指標 | #2385/#2386後 | 6行提案適用時 | 差 |
|---|---:|---:|---:|
| product/unknown pool | 471 | 465 | -6 |
| condition | 858 | 852 | -6 |
| explanation | 2,971 | 2,977 | +6 |
| product_requirement_atom subtype | 820 | 814 | -6 |
| product-targeted route union | 341 | 341 | 0 |
| 全route union（HMC 30含む） | 371 | 371 | 0 |
| poolとroute unionの交差 | 312 | 312 | 0 |
| 未監査pool | 159 | 153 | -6 |

算式: `471 − 312 = 159`; `(471 − 6) − 312 = 153`。件数は提案を適用した場合の条件付き計算であり、累積recountを代替しない。

## 境界と検証

- 6 IDのsource line text/SHAと#2353 effective rowを照合した。既存classification overlaysおよびroute-audit selection/union IDとの交差はすべて0。
- authority effectは`none`。現行L2/L11要求、successor、採択、実装完了、Concept全体のcoverageを主張しない。
- 旧source bytes、既存audit snapshotを変更しない。旧archive tools/tests/runtime/workflow/CIは実行していない。
- 機械可読証跡: `{json_path.name}`。固定入力のhashと行別raw-byte hashはJSONに記録。
