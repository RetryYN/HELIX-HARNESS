# REG-06 条件別照合：HIL-BR-21／22／27

基準HEADは `17bb8b6568b4fc065702bdafafdc6a7e4a37af6b`。手順5 REG-06 の旧source起点母集団から、同じ設計契約領域の3 identityだけを条件単位で再照合した読み取り専用監査である。旧source、旧CLI/runtime/test/CIは参照のみとし、実行していない。`authority_effect: none`。

## 判定

REG-06の3行はいずれも `adopted_meaning`／`remaining_condition: null` と記録され、下記の現行L2/L11条件で旧意味の再導出を確認できる。ただしcarry-forward authorityは `preserved_pending_rehome`、formal successor IDは3件とも未割当のままである。本監査は条件対応の根拠を固定するもので、IR identityの再配置・retire、受入実行、旧source全体の被覆を宣言しない。

## 固定sourceと監査入力

3件の旧行は同じ文書・assetに属する。Requirements IRのsource pointerは `requirements.json#/HIL-BR-21`、`#/HIL-BR-22`、`#/HIL-BR-27`（asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、source file SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）。対応する旧要求文書は [`infinity-loop-platform-requirements.md`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md)（asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`）。

IR108 matrixでは3行とも `legacy_output_oracle: null`。旧sourceは条件を述べるが、各条件の独立した出力oracleを特定していないため、以下のL11例は新世代の意味照合根拠として扱い、旧実行結果の再現とは扱わない。

| identity | 旧行 | 旧行SHA-256 | REG-06分類 |
|---|---:|---|---|
| HIL-BR-21 | 73 | `8369ba5931af089d75853750a76b87e29c2316f6b7d161d9d70f9ef02058d5ab` | adopted_meaning |
| HIL-BR-22 | 74 | `836dae29beb73621e534e560f67f26ef198dfdc9b25fa4f00c2dadeda7d47fca` | adopted_meaning |
| HIL-BR-27 | 79 | `5817952f602eee18e355553d0da608e8c290ae7d3575ac77a0b20301d4c7dcc6` | adopted_meaning |

| 証拠本文 | SHA-256 |
|---|---|
| 旧要求文書（上記path） | `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` |
| REG-06 JSON | `286352584c5ef17195b71c57be165eaf2b1d2da1a2877b53258b65e6ec58f4e6` |
| IR108 disposition matrix JSON | `0e26f66e4d593f7f710e17b8c2349dffd5849467f208fc5fbdda635e31dd224d` |

## 条件別の旧→現行照合

| 旧条件と保持点 | 現行条件・受入 | 差分／弱まりの確認 |
|---|---|---|
| **HIL-BR-21**（旧行73）：設計構造を改めても外部仕様・受入挙動を保つ。要求、公開contract、永続state semanticsが変わる場合はRedesign／Retrofitへ戻す。 | HARNESS L2 `product-requirements.md:105,111` と対L11 `product-acceptance.md:39-40` は、Scrum ReverseのSR0–SR4 receipt、findingをexactly-one routeへ送り、観測動作・公開surface・DB semantics・要求に差が出るDesign RefactorをRedesign／Retrofitへ戻す条件を記す。OS ticket種はL2 `governance-requirements.md:142-146`、対L11 `governance-acceptance.md:289-293`。 | 同じ意味の維持と意味差の上流戻しは再導出されている。旧 `DesignRefactor` 一体の駆動model／旧agent identityや旧実装を再利用する判定ではない。受入例39–40はScrum部分のcheckpointを具体に検査し、全方式での受入実行や設計全体の実証を示さない。 |
| **HIL-BR-22**（旧行74）：要求から設計義務を生成・消込し、閉じた要求集合で説明のない漏れを残さず、未知の要求まで網羅したと主張しない。 | HARNESS L2 `product-requirements.md:60`（L2-009）と対L11 `product-acceptance.md:29` はunit／connection／compositeのtemplate義務および不足inputのBackflowを対応づける。OS L2 `governance-requirements.md:652-660`（L2-016）と対L11 `governance-acceptance.md:331-336` は対象要求から関係先を追い、未接続・unknown・staleを残して下位成功から構成体完了を推定しない。 | 閉じた対象の設計義務と未確定範囲を分担して扱う意味を確認した。独立DB/schemaまたは一つの全層ledgerは要求されていない。要求集合そのものの全source atom閉包や漏れゼロを本監査から主張しない。 |
| **HIL-BR-27**（旧行79）：要求atom、義務、risk、状態遷移、failure境界、工程から必要十分な設計contract集合を導き、固定冊数やLLM自由補完に依存しない。 | HARNESS L2 `product-requirements.md:530-555`（L2-026 unit、025 composite）と対L11 `product-acceptance.md:332-360` は要求/L3 revisionから設計・対oracleへのtrace、unitとcompositeの別判定、unknown／不整合時の保留を具体化する。BRAIN L2 `brain-requirements.md:106-114,172-180` と対L11 `brain-acceptance.md:31,37` はPatternの適用条件と構成候補の状態を保持し、存在だけで適用・昇格させない。 | 025/026はPO判断で明示採用された候補（HARNESS判断記録 `:25,30-31,54-55`）。BRAIN-003/009もPO採用集合に含まれる（BRAIN判断記録 `:31,37,50,56`）。固定冊数・自由補完を拒む意味は保持する。自動走行engineや全requirementsからの一括導出実行、全Patternの完成はこの設計／受入条件から主張しない。 |

## revision・authorityと残る境界

現行mainで照合した文書bytesは次のとおり。HARNESS／OSの2026-09-28 PO判断記録は、固定HEAD `f6dad2a33e24f000b87d7f09b8d40288257e74cc`上の対象文書revisionを指定している。後から追加された本文は判断を自動継承しない。ここで引用した各既存L2/L11範囲はその固定本文に存在し、固定後の差分比較では範囲内本文の改変ではなく後続候補節の追加を確認した。BRAINの現行対象SHAはPO判断記録の固定SHAと一致する。

| 現行文書 | main `17bb8b6` のSHA-256 | 照合行 |
|---|---|---|
| [`product-requirements.md`](../../../helix-harness/L2-requirements/product-requirements.md) | `6c3023f9ca2be5d33f8e66ae2f2f0691bf69ff8070cfa386c953168e2d6eace9` | 48-60, 105, 111, 530-555 |
| [`product-acceptance.md`](../../../helix-harness/L11-acceptance/product-acceptance.md) | `92e5fef1771fb24c1c1cb110cc105a1b9fd58d73d003615ea17be09922f3a616` | 21-42, 332-360 |
| [`governance-requirements.md`](../../../helix-os/L2-requirements/governance-requirements.md) | `39b52c81e38cd7301a0efaaf76fa3dd9da046df574b4236da8e6a3cdf4bb9387` | 142-146, 652-660 |
| [`governance-acceptance.md`](../../../helix-os/L11-acceptance/governance-acceptance.md) | `dd91b61c131a32caa440d9ae8f3248fe900e7406fee85c07555452b0d4b77cef` | 289-293, 331-336 |
| [`brain-requirements.md`](../../../helix-brain/L2-requirements/brain-requirements.md) | `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03` | 106-114, 172-180 |
| [`brain-acceptance.md`](../../../helix-brain/L11-acceptance/brain-acceptance.md) | `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b` | 25-38 |

採択状態の根拠は本文のcandidate metadataでなく、[HARNESS PO判断記録](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md)（SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`）、[OS PO判断記録](../../decisions/helix-os-requirements-po-decision-2026-09-28.md)（`5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`）、[BRAIN PO判断記録](../../decisions/helix-brain-requirements-po-decision-2026-09-28.md)（`fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`）から読む。

旧IR carry-forward行はいずれも `preserved_pending_rehome` でsuccessor IDなし。IR108 matrixでも旧sourceごとの未対応0は未証明、large target listはcondition coverageではない。隣接HIL-BR-24／25は別分類（implementation_only）でschema／layer-ledgerの条件が未確定のため、このbatchへ含めない。本記録の結論はこの3条件の意味比較に限り、他の旧要求・conditionへの一般化はしない。
