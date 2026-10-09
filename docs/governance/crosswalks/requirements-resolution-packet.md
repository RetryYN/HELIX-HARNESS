# DDD／TDD厳格化の要求追補案

base `9460b78fb11864932a51cdb62917f1704e2e2275`。[JSON候補](requirements-resolution-packet.json)、SHA-256 `e7cdcf791967e0ebf5bb03290810f1f1f617b5d7b98138b67ebe20370ea124bb`。

#1854の旧FR-L1-50を起点に、HARNESS-L2-005の一identityと対L11へ5規律を追補する案。未採択であり、既存L2/L11/MPR/台帳/Bindingは変更していない。既決005の版・scope/riskと省略回収を保持する。

## 旧source・consumerと差分

旧FR50はfunctional-requirements.md L81、asset LEGACY-ASSET-6B6C5CB0E481BE01088B。DDD/TDD rule SSoT L39–58/125–139、asset LEGACY-ASSET-5E22432B0A5A8F7CC8B3と、旧unit test-design L666–673/675、asset LEGACY-ASSET-FAAFFA616A44F65911EBの負例を読んだ。archiveの完全path・file/区間digestはJSONへ固定した。意味の再導出であり、旧test/CLI/runtime/CIを実行しない。

原sourceとconsumerの結合検証層のL9/L8表記を同値へ丸めず、現行pair/検証kindの明示対応へ戻す。旧Node path・doctor・PLAN field/schemaを現在の必須実装にせず、5規律の意味を対象scopeへ対応させる。依存方向は対象の設計ownerが宣言した表から読み、旧HELIX固有の方向表は例・未移管として保持する。Redの実装前/後というFR02差分と既決TDDORDERを、この案で変更しない。

## 提案するL2追補

### HARNESS-L2-005 DDD／TDD厳格化の検証条件追補案（未採択）

一つの対象revision・scopeの開発／設計／検証成果に、宣言されたdomain境界・不変条件・TDD・単体／結合検証が適用される場合の検証義務を具体化する。既存005の言語/tool非依存、kindごとの義務、scope/riskからの検査選定・省略回収を保持する。HARNESSが条件とoracleを定め、実行・CI構築・結果保存はOSまたは利用者の環境が行う。

- **入力と適用**：対象要求／契約・artifact・対oracleのidentity/revision/scope、適用する規律とその根拠、宣言された依存方向／境界、不変条件集合と単体検証設計、TDD実観測、結合検証設計を受け取る。必要な入力が欠けた条件を合格にしない。domain／TDD／結合対象がないことと、入力不明・未実行を区別し、非適用は既存009の理由・判定者・対象revision・再評価条件へ結ぶ。全対象へ5検査の一律実行や新しい承認gateを追加しない。
- **依存方向・domain boundary**：対象scopeの設計ownerが宣言した依存方向表・循環条件を、対象revisionと適用される設計authority状態へ結んで参照する。その表で禁止された依存方向と循環を検出して不成立にし、他の規律表や別scopeの結果で相殺しない。共有契約のために禁止方向を変える必要があれば設計ownerへ戻す。依存方向表・適用状態が不明なら検証可能と補完せず、具体的な不足を返す。検証規範は対象の構成や境界を決めず、旧HELIXのlint/runtime/schema/CLI構成や方向表を外部製品へ必須化しない。
- **invariant trace**：scopeで宣言した各domain不変条件を、同じ対象の単体検証設計の明示oracle identityへ結ぶ。未解決のoracle、欠落、別revision、別の条件だけを検証するoracleを、その不変条件の被覆に数えない。traceの存在だけで振る舞いの成立を生成しない。
- **Red-first evidence**：適用契約がTDD証拠を求めるscopeでは、意図した欠陥を検出したRedと、凍結したoracleを最小実装で満たしたGreenの実観測を同じ対象／oracleに結び、Redの観測がGreenより後なら拒否する。欠落・実結果なし・時系列不明も成立にしない。testを記述した時刻をRedへ転用しない。実装前test／oracle凍結と現在の003/015・TDDORDERの意味は変更しない。静的reviewや人の受入全般へRed実行を拡張しない。
- **test oracle strength**：単体testには具体的な期待behaviorを判定する明示assertionまたは同等なoracleを要求する。実行しただけ、assertionなし、truthiness確認だけで具体的期待を判定しないtestを十分な検証としない。実装から期待値を逆算して正本にせず、oracle不足は対の設計ownerへ戻す。特定libraryやassertion syntaxを固定しない。
- **integration Given／When／Then**：適用する結合検証では、前提状態／入力、操作／事象、期待する観測結果をそれぞれ識別し、境界・依存・失敗経路と同じ対oracleへ結ぶ。名前だけのGiven／When／Then、期待結果の欠落、別scopeの結果を成立にしない。旧L8/L9の表記は原sourceに保持し、現行HARNESSのpair／検証kindへの対応を入力契約で明示してから用いる。層番号の一致だけで対応済みにしない。
- **出力と失敗**：適用した規律のidentity、対象revision/scope、oracle／実結果、違反・不足箇所、未評価範囲と戻し先を既存005の証拠条件へ結ぶ。適用規律のidentity欠落／unknownを別の規律へfallbackせず、不足findingとして返す。違反を0件やunknownをN/Aへ変換しない。境界／oracleの意味はHARNESSの設計・検証owner、要求の不足は008へ戻し、OSは元ticket／記録／未完義務を維持する。この検証条件だけで工程合格・受入・Releaseを生成しない。

この案は旧FR-L1-50の5規律に対応する限定追補である。旧doctor／PLAN／DB／lint実装を移植しない。旧rule SSoT全体、workflow anchor配置、GreenDefinition/history、FR-L1-02のRedと本体実装の順序差分、formal successor、L3再開・実装・受入成功は別に保持する。005の既決版指定を保持し、版指定を追加しない。

## 提案する対L11追補

### HARNESS-L2-005 DDD／TDD厳格化追補の対L11案（未採択）

**正常**：同じ対象revision/scopeのfixtureについて、対象の設計ownerが宣言した依存方向と循環条件、全domain不変条件と対応する単体oracle、適用契約が求めるRedとGreenの実観測・順序、具体的期待behaviorを判定するassertion、結合検証の前提／操作／期待結果を照合する。各条件の適用／非適用根拠と未評価範囲、005の証拠条件・戻し先を識別できる。条件が満たされた記録の存在だけで工程合格や受入を生成しない。

**負例**：宣言された方向表で禁止される依存または循環、1件の不変条件だけoracleが欠落／未解決／別revision、Red欠落／Greenより後のRed／test記述時刻だけのRed、assertionなしまたはtruthinessだけで期待behaviorを判定しないtest、Given／When／Thenの期待観測が欠けた結合testを、一つずつ混入する。適用条件の違反を特定のfindingと戻し先へ結び、他条件の成功や件数0で相殺しない。規律identity不明を既知ruleへfallbackせず、不足を返す。OSの結果保存成功を検証成功にしない。

**unknown／回復／未見例**：対象の依存方向、oracle対応、時点や実結果が未観測なら未評価／不足を明示し、N/A／passを生成しない。必要入力・設計・検証契約をownerが補った後、同じ対象revision/scopeと更新した根拠を結んで再照合する。作成側に未公開の禁止依存・不変条件抜け・oracle弱化・結合期待欠落を使い、記述欄の充足だけでは成立しないことを確認する。未観測・未実行と、根拠付きの非適用を区別する。現在のL3停止中にfixtureを実行したとは主張しない。

これは005の検証規範の対oracle案であり、OSのCI実装、旧lintの再利用、旧要求全体の移管／正式successor、L3承認・再開を含まない。

## 採否と未完

独立review後に、この追補の対象revision採否を問う。FR50のworkflow anchor/GreenDefinition/関連後続案、他ruleと全source/formal successor、FR02・FR24・FR30の移管は残す。005採用だけで#1854をcloseせず、schema/実装/L3再開を生成しない。SEEDFIRSTは採用済みの限定知識として、前packetをJSONのresolved_packet.packetに完全一致で保持する。
