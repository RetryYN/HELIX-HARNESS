# LABO Stage 5 公式decision残余の現行本文照合

- 基準main: `f0e210b3cdf5c1f95dfcf07cfc3504a240dd2e4d`
- 範囲: LABO-050 R1–R2、LABO-061 R1–R13、LABO-063 R1–R17。公式decision recordと正式review本文を読み、固定L2/L11、現行六本文、対応旧source/consumerと照合した。
- 読み取り専用。旧runtime/test/CIは起動していない。

## 現行六本文の固定pin

- BR: SHA-256 `9f56b674f11f9b666bc546a20e7a7492d1dfe377a24495d351392698c8389777`
- FR: SHA-256 `0f11b654be30baae1749800ce3c184a146ceb4bce22710f762ef368f5d40e536`
- NFR: SHA-256 `d5838368f1ec9ee9e57cc143aa6e346ae1ff7f924d46c234880798098936b773`
- BV: SHA-256 `54e42a8af0d30f7eb1c2b75810b51fab6197558633ab3bac7a50b024e581445e`
- FV: SHA-256 `304aebc0edf618fd0eba2d73b745611b1d259ffd94429c0375df16ca58874bb4`
- NFRV: SHA-256 `922f8fccc63917178606dbb5edd165f5bdc6805de3753ead6d703b8342fdb8b7`

## 先に確認すべき実質残余

1. **063 R1（L3受入基準欠落）**: [functional-requirements.md](/home/tenni/HELIX-HARNESS/docs/helix-labo/L3-requirements/functional-requirements.md:1722) は固定L2/L11からAC01/02/03へtraceしますが、L3本文にAC定義見出し/本文がありません。ACラベルを使うL10 CASEは [functional-verification.md](/home/tenni/HELIX-HARNESS/docs/helix-labo/L10-verification/functional-verification.md:2952) にあります。固定親L2:480–489/L11:225–231の意味をL3の受入条件として明文化する欠落です。旧P4-02 source (`pillar-functional-requirements.md:149,230–231,237–240`) とpaired HAT-P4-02 `:112` が直接起点。
2. **063 R11/R17（CASE03bの再現不能・route選択不能）**: 現CASEは「target revisionだけ別」とだけ記しtarget ownerへ返します（FV:2961）。どの既存recordのrevisionかが特定されず、固定L2:488の観測提供主体への返却か、版変更後のLABO再評価か（L2:489）を選べません。既存fieldを一つ対象化した単独変異に限定する提案です。
3. **063 R10（正常系の全系譜未観測）**: CASE01はrepair result、HARNESS verification、target revision、再発event/反例を使ってcandidateを返します（FV:2958）。しかしL11:228のOS登録→対象owner採否/変更→verification→運用後観測/effectの別状態を一つの正常episodeで追跡しません。負例だけでは正常な系譜の受入を示せません。
4. **063 R7（知識owner曖昧）**: CASE04bは「既存knowledge owner」へ返します（FV:2965）。FR:1743のHMC-BR-003解釈とL11:231では1.0の知識評価/保持はLABOです。
5. **061 R4の一部（単独受入fixture不足）**: score起点のassignment/permission/admission/judge/qualification拒否（CASE103–106/113）、未選択taskを実行依存へ昇格しない扱い（AC02/CASE102）、未知applicabilityの保持（AC02/CASE03e）は現行本文にあります。独立caseが見当たらないのは、registration/delivery成功だけでisolation成功を主張する変異、LABOがWorkerを始動/候補採択する変異、059固定revisionへの遡及適用禁止です。L3 AC03の総則だけでは、これらの特定動作をfixtureで確かめた証拠になりません。
6. **063 R9の一部**: CASE34はrepair candidateだけから成功手順を主張するのを拒否しますが、「単一greenだけ」を独立変異にしていません。CASE05/06はOS backlog登録を知識保持と別field/失敗として扱うものの、登録成功の正常link fixtureはありません。過去評価で新規repairを強制しないことはFR:1728にあるが独立CASEはありません。

## 残余ごとの分類

| Scope | R | 分類 | 現状 | 主な現行根拠 |
|---|---|---|---|---|
| LABO-050 | R1 | 固定親の意味から導いた戻し先区分 | 一部解消。ルート分割は本文に明示、固定親の明文再現はない | FR:1574–1580; FV:2572–2576,2600–2604 |
| LABO-050 | R2 | 証拠不足／任意明確化 | 責務境界は保持、宛先は未特定のまま | FV:2605; FR:1576,1580; L2固定source L2:300–302 |
| LABO-061 | R1 | 証拠・件数表記 | 部分解消。ID実態の明示はまだ不十分 | FV:2790,2792–2925; NFR:Stage 5 061 row; NFRV:061 inventory |
| LABO-061 | R2 | owner明記・証拠文言 | 一部残存。CASE86はunknown化済み | FR:1697,1705,1709; FV:2842–2843,2834,2848,2851–2854 |
| LABO-061 | R3 | 計数・表示ラベル | 部分解消。CASE24はnormalだがheader未同期。102の「normal baseline」語が残る | FV:2790,2817,2914; NFR denominator entry |
| LABO-061 | R4 | 受入検証不足 | 部分解消。明示された項目は閉じ、独立fixture不足が残る | FR:1693–1709; FV:2800–2801,2817,2823,2848,2914–2925; L3 AC02/03 |
| LABO-061 | R5 | 証拠locator精度 | L3対応表の誤参照が残る | FR:1696–1697 |
| LABO-061 | R6 | 任意明確化・編集表記 | 一部残存 | FV:2790,2797,2823,2914,2835–2840 |
| LABO-061 | R7 | 証拠provenance不足 | 監査pathのみ。現在L3/L10に実質影響なし | official review01 disposition JSON path metadata; six bodies contain source citations |
| LABO-061 | R8 | 証拠provenance・歴史的基準 | 本文は旧L10 snapshotを基準と明記。祖先でない事実は現状も同じ | FV:2790, FR:1713; official decision record |
| LABO-061 | R9 | 証拠・件数明確化 | 監査記載のみ | disposition/audit record |
| LABO-061 | R10 | 任意明確化・表示順 | 解消対象は表示順のみ | FV:2792–2925 |
| LABO-061 | R11 | 任意明確化・表示順 | 解消対象は表示順のみ | FV:2802–2803 |
| LABO-061 | R12 | 受入証拠・runtime禁止境界 | 本文境界はあり、単独fixtureはない | FR:1705,1709; FV:2790,2914; repo instructions prohibit legacy runtime |
| LABO-061 | R13 | 意味欠陥なし／任意route明確化 | 現在の返却は固定区分内 | FR:1694,1697,1709; FV:2852,2920 |
| LABO-063 | R1 | 固定親の受入要件をL3へ定義する不足 | 残存。高確度 | FR:1722–1733 crosswalk references AC01/02/03, but no AC definition headings/body in 063 FR; FV:2952–3026 CASE rows use AC labels |
| LABO-063 | R2 | 証拠・行locator精度 | 本文crosswalkの引用行ずれが残る | FR:1724–1733; decision record cites L2 input 480–482 vs exact L2 input 483; return route 488 vs table 489–490; L11 rows offset |
| LABO-063 | R3 | 証拠・分母明確化 | 多くは解消。same-axis candidates remain, but indexes now excluded | FV:2954,2960,2972–2987,3024; NFR:146–152 |
| LABO-063 | R4 | 任意の文言明確化 | 解消済み | FV:2973,2983 |
| LABO-063 | R5 | 証拠・分類明確化 | 候補であることは明示、5 normal IDsはまだ未列挙 | FV:2954–2959; NFR:151–152 |
| LABO-063 | R6 | 任意の用語対応明確化 | 意味routeは分類内。語彙対応が残る | FR:1720,1729; FV:2966–2969,2977,2988,2995–2996 |
| LABO-063 | R7 | owner帰属明確化不足 | 残存。1.0 ownerが曖昧 | FV:2965; FR:1743; BV:97 |
| LABO-063 | R8 | 任意の記述一貫性 | 拒否は成立。destination wording differs | FV:3010,3023 |
| LABO-063 | R9 | 受入検証不足 | 部分的に残存 | FR:1728; FV:2958,2982,2999–3000; no direct one-green-only normal/nonnormal row identified |
| LABO-063 | R10 | 受入検証不足 | 残存。full positive lineage未形成 | FV:2958–2959,2999–3001; BV:97; FR:1720 |
| LABO-063 | R11 | 受入fixture定義不足 | 残存 | FV:2961 |
| LABO-063 | R12 | 監査provenance | audit / tmp path only | review disposition JSON `review05_raw_path`; current FR:1735–1744 has repository source spans |
| LABO-063 | R13 | 監査証拠整合 | audit metadata only | decision record referenced spans; FR:1724–1733 |
| LABO-063 | R14 | 任意の文言明確化 | 日本語表現に英文混在 | FR:1720–1745; FV:2954–3026 |
| LABO-063 | R15 | 規範文言の一貫性 | 一部残存。L3 AC未定義が主要問題 | FR:1726; FV:3001,3003,3004,3016; NFR:146–152 |
| LABO-063 | R16 | 任意oracle明確化 | 部分的に残存 | FV:2995,2966–2969,2977–2996 |
| LABO-063 | R17 | owner classification gap | 残存。same CASE03b as R11 | FV:2961; FR:1729; CASE29/40/58 nearby for differentiated return categories |

## 根拠と限界

- 固定親: 050=`f6dad2a33e24f000b87d7f09b8d40288257e74cc` L2:298–303/L11:120–126。061/063=`318ec4a04abb3c1cc17111b3d939f913facd5fd3`、061 L2:457–469/L11:205–215、063 L2:480–489/L11:225–231。
- 旧source: 061のR04/R08 `helix-bench-evaluation.md:96–120,143–147` と対応acceptance `:32–40`。063直接sourceはP4-02 HR-FR/HAC、paired consumer HAT-P4-02、UIL R11/R12は関連sourceとして分離。全span/pinはJSONに記録。
- 公式判断: 050 #2623 formal review03 comment 6013922417、061 #2629 comments 6017505879/6017673994、063 #2630 comments 6018603693/6018940116。各decision markdownのfull SHAはJSONに記録。
- これは指定残余の分類であり、全274親や全consumerの意味監査ではない。PO追加確認、L10実行、新しいgate/thresholdは要求・生成していない。
