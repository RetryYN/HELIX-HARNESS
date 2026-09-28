# IR153 W1–W4: 108件 disposition 要約

基準main: `559ae3ba4bfe660d666a57f227466d7dcdd440d9`。対象は IR153 W1 33 + W2 24 + W3 40 + W4 11 = 108 overlay-outside identities。

## 判定の読み方

本資料は旧IR153のW1業務要件33件、W2機能要件24件、W3非機能要件40件、W4移行要件11件を、旧原文の条件・出力/否定oracleと現行L2/L11・既決判断へ照合した結果である。全108 identityを含む機械可読明細は [108件の判定行列](legacy-ir108-disposition-matrix-2026-09-28.json)。各旧source行はarchive内の完全path、行番号、行SHA-256で識別し、現行参照先はmain 559の本文SHAを同JSONに固定した。

**注意:** 1 identityに複数の性質を記録するため、下記カテゴリ件数は相互排他的ではなく合計して108にならない。大きなtarget ID集合は調査の入口であり、意味条件やL11受入の充足証明ではない。W2は旧source表に独立した出力/oracle列があり24件すべてJSONへ転記した。W1/W3/W4には別列がないため、条件行とrecheck本文のnegative caseから照合した。現行L2要求、L11受入、候補の採否、受入実行は別々に評価した。未実行だけを要求欠落とはせず、未採択候補を採用済みとも扱わない。

## disposition 集計

|区分|件数|IDs|
|---|---:|---|
|現行で意味を再導出/保持|27|HIL-BR-01, HIL-BR-05, HIL-BR-06, HIL-BR-10, HIL-BR-13, HIL-BR-17, HIL-BR-21, HIL-BR-22, HIL-BR-23, HIL-BR-26, HIL-BR-27, HIL-FR-42, HIL-FR-43, HIL-FR-45, HIL-NFR-01, HIL-NFR-02, HIL-NFR-05, HIL-NFR-06, HIL-NFR-10, HIL-NFR-11, HIL-NFR-12, HIL-NFR-22, HIL-NFR-27, HIL-NFR-28, HIL-NFR-32, HIL-NFR-36, HIL-NFR-40|
|候補として保持・未採択|21|HIL-BR-02, HIL-BR-07, HIL-BR-11, HIL-BR-20, HIL-BR-29, HIL-BR-31, HIL-BR-32, HIL-BR-33, HIL-FR-25, HIL-FR-26, HIL-FR-29, HIL-FR-30, HIL-FR-35, HIL-FR-36, HIL-FR-38, HIL-NFR-13, HIL-NFR-16, HIL-NFR-21, HIL-NFR-23, HIL-NFR-35, HIL-NFR-37|
|人の意味判断を記録|7|HIL-BR-03, HIL-BR-16, HIL-BR-18, HIL-BR-28, HIL-FR-28, HIL-FR-56, HIL-NFR-03|
|主に実装/技術具体化|41|HIL-BR-04, HIL-BR-08, HIL-BR-09, HIL-BR-12, HIL-BR-19, HIL-BR-24, HIL-BR-25, HIL-FR-27, HIL-FR-32, HIL-FR-34, HIL-FR-48, HIL-FR-49, HIL-FR-51, HIL-FR-56, HIL-NFR-08, HIL-NFR-09, HIL-NFR-14, HIL-NFR-15, HIL-NFR-18, HIL-NFR-19, HIL-NFR-20, HIL-NFR-24, HIL-NFR-25, HIL-NFR-26, HIL-NFR-29, HIL-NFR-30, HIL-NFR-31, HIL-NFR-33, HIL-NFR-34, HIL-NFR-38, HIL-NFR-39, HIL-TR-01, HIL-TR-02, HIL-TR-03, HIL-TR-05, HIL-TR-06, HIL-TR-07, HIL-TR-08, HIL-TR-09, HIL-TR-10, HIL-TR-11|
|意味条件の真の残差候補|7|HIL-BR-09, HIL-BR-15, HIL-BR-30, HIL-FR-46, HIL-FR-47, HIL-FR-59, HIL-FR-60|
|scope/値/配置など人の判断が未決|16|HIL-BR-14, HIL-BR-15, HIL-BR-19, HIL-BR-30, HIL-FR-31, HIL-FR-33, HIL-FR-34, HIL-FR-46, HIL-FR-59, HIL-FR-60, HIL-NFR-04, HIL-NFR-07, HIL-NFR-09, HIL-NFR-17, HIL-NFR-19, HIL-TR-04|

## 真の要求意味残差候補

以下は近接IDやrouteの存在だけでは旧出力義務を閉じないと判定した項目。候補の追加採択を意味せず、必要性・配置・版はPO判断対象である。各引用先でL2/L11を対照したが、現行側に下記の旧出力保証と拒否oracleの組がない。

|旧ID / source|保持すべき条件と旧出力・拒否oracle|現行比較と残る意味|候補/範囲|
|---|---|---|---|
|`HIL-BR-09` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:61` (line SHA `4bafa90da44e3d6bc2cb8f3f3517f16f1e7c72ff2d5872236de3cd3b2b2a3111`)|工程表のlayer×drive×task-kind×verification patternからHARNESS所有agent contractとW-agent teamを生成し、Claude/Codex固有定義へ決定論的に射影する。<br>旧出力/oracle: 旧行に独立した出力列なし; 原条件そのものを照合|`docs/helix-harness/L2-requirements/product-requirements.md:72-76,115-119`; `docs/helix-os/L2-requirements/governance-requirements.md:57,662-680`; 受入 `docs/helix-harness/L11-acceptance/product-acceptance.md:21-23,25,28-29`; `docs/helix-os/L11-acceptance/governance-acceptance.md:24,30,414,420`<br>残差: 工程/requirements inputから runtime-neutral specialist agent contract を生成する出力保証。割当/ticket生成と同一視できず、後継候補identity未割当。<br>後継ID未割当|
|`HIL-BR-15` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:67` (line SHA `880385839788ea49f14544ee9dd0f1ed5037bc84b1707a9ba55f4fa6a267c2f5`)|将来のproduct-data sourceをversioned connectorで取り込み、由来・鮮度・schema・authorityを保持した正規projectionとして設計判断、coverage、impact、Issue routing、docgen/detectorへ供給する。<br>旧出力/oracle: 旧行に独立した出力列なし; 原条件そのものを照合|`docs/helix-labo/L2-requirements/labo-requirements.md:49-75,161-193`; `docs/helix-brain/L2-requirements/brain-requirements.md:29-33,70-79`; `docs/helix-os/L2-requirements/governance-requirements.md:85-87,261-269,336-345`; 受入 `docs/helix-brain/L11-acceptance/brain-acceptance.md:66-67`; `docs/helix-labo/L11-acceptance/labo-acceptance.md:45,72,82`; `docs/helix-os/L11-acceptance/governance-acceptance.md:27,29-30,417,419-420`<br>残差: Product Data正規projectionを複数consumerへ渡す責務。現行接続は observation/source/event であり同じ出力契約ではない。product scopeの採択自体は未決。<br>後継ID未割当; scope: Product Data ingestion/projection scopeと各consumerの採否・版を決める。|
|`HIL-BR-30` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:82` (line SHA `8018d4ab61dd475b84ee1356de5de5137adf94bd41e975f2669c98371f1d401e`)|HARNESSは工程表、Design Contract Portfolio、判断pack、task分類から専門agent contractを必要時に自動生成し、runtime固有subagent定義へ射影する。専門化の根拠がないagent増殖を避け、worker/verifier/authority分離、最小context、tool/path権限、budget、停止条件を生成時に拘束する。<br>旧出力/oracle: 旧行に独立した出力列なし; 原条件そのものを照合|`docs/helix-harness/L2-requirements/product-requirements.md:72-76,340-360`; `docs/helix-os/L2-requirements/governance-requirements.md:57,293-305,538-552,662-680`; 受入 `docs/helix-harness/L11-acceptance/product-acceptance.md:205-206`; `docs/helix-os/L11-acceptance/governance-acceptance.md:25,345,415`<br>残差: specialist agent contractの生成物（objective/schema/tool/path/budget/checkpoint/escalation/verification contract）の責務。ID未割当、P-SPECIALIST A/B配置未決。<br>後継ID未割当; scope: P-SPECIALIST専門Worker契約のHARNESS/INT配置A/B。|
|`HIL-FR-46` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:136` (line SHA `a62b63ab18b23ac9564d6c7ffca7580ac9471a6d6e7374f8e4a26c93f0441b6c`)|Layer Ledger Registryはcanonical L1–L12ごとにledger type、粒度、必須node/edge、authority、input/output、entry/exit gate、template versionを登録する。L0 charterは層外authority anchorとして別登録する。各layer ledgerのrowはstable subject ID、revision、source span、semantic digest、status、owner、downstream/upstream edgeを持つ。<br>旧出力/oracle: layer ledger catalog、row revision、layer snapshot、coverage receipt|`docs/helix-harness/L2-requirements/product-requirements.md:42`; `docs/helix-os/L2-requirements/governance-requirements.md:642`; 受入 `docs/helix-harness/L11-acceptance/product-acceptance.md:23`; `docs/helix-os/L11-acceptance/governance-acceptance.md:324`<br>残差: canonical L1–L12 ledger type/required node-edge/authority/entry-exit/template版/L0 anchor/全層coverage receiptの一元catalog能力。HARNESS025/026採択済みだが当該能力は含まず。<br>後継ID未割当; scope: 一元layer ledger registryを別能力として採るか、既存分担で十分とするか。|
|`HIL-FR-47` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:137` (line SHA `785f0998ca9fd2192bcddc638d1ef1233551c251e307e631303642abe7713fad`)|Template Obligation Extractorは各layerのactive templateから章、field、table row、applicability rule、done-when、pair contractを原子的obligationとして機械抽出し、該当ledgerへ候補行を追加する。未対応template要素、空/TBD、抽出不能、同一obligation重複をfinding化し、LLM自由補完で埋めない。<br>旧出力/oracle: template atom、ledger proposal、extractor/version digest、gap finding|`docs/helix-harness/L2-requirements/product-requirements.md:42`; `docs/helix-os/L2-requirements/governance-requirements.md:642`; 受入 `docs/helix-harness/L11-acceptance/product-acceptance.md:23`; `docs/helix-os/L11-acceptance/governance-acceptance.md:324`<br>残差: active template全章/field/row/applicability/done-when/pairのatomic抽出と、空/TBD/抽出不能/重複をfinding化する能力。HARNESS025/026の設計生成/構成体oracleでは閉じない。<br>後継ID未割当|
|`HIL-FR-59` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:149` (line SHA `809e21f8712d919dadefec5a46f925499d4dd2b38215def9448e409dc6eac029`)|Specialist Agent Contract Compilerはworkflow phase、task-kind、設計義務、domain object、risk、judgment packからobjective、成果物schema、tool guidance、task boundary、context selectors、allowed/denied tools/paths、model/effort class、budget、checkpoint、escalation、verification contractを持つruntime中立agent contractを生成する。<br>旧出力/oracle: generated agent contract、input/output digest、generation rationale、guard validation receipt|`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:102`; `docs/helix-labo/L2-requirements/labo-requirements.md:45`; `docs/helix-os/L2-requirements/governance-requirements.md:41`; 受入 `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:71`; `docs/helix-labo/L11-acceptance/labo-acceptance.md:56`; `docs/helix-os/L11-acceptance/governance-acceptance.md:24`<br>残差: workflow/task/risk/judgment packからruntime-neutral specialist agent contractを生成する出力保証。OS/INT配置のみでは未充足。後継identity未割当、P-SPECIALIST A/B配置未決。<br>後継ID未割当; scope: P-SPECIALISTの配置とscope。|
|`HIL-FR-60` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:150` (line SHA `646140e1b0193743f2d10874a4b4dc234299f69b8580473b98914923d4016c35`)|Specialist Muster Gateは専門知識、独立context、並列性、blind verificationのいずれかに測定可能な利益がある場合だけ生成agentをmusterし、単一agentで十分なtaskは既存roleへ送る。生成agentをallowlist済みruntime型へ射影し、workerとverifierのprovider/model/authority分離、lease、fencing、retireを検査する。<br>旧出力/oracle: specialization decision、TeamDefinition、runtime projection、worker/verifier separation、lifecycle receipt|`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:102`; `docs/helix-labo/L2-requirements/labo-requirements.md:45`; `docs/helix-os/L2-requirements/governance-requirements.md:41`; 受入 `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:71`; `docs/helix-labo/L11-acceptance/labo-acceptance.md:56`; `docs/helix-os/L11-acceptance/governance-acceptance.md:24`<br>残差: 専門化の測定便益、single-worker充分性、worker/verifier分離に基づくmuster/retire判断の能力。後継identity未割当、P-SPECIALIST A/B配置未決。<br>後継ID未割当; scope: P-SPECIALISTのscope/配置。|

### 残差の扱い

- **BR-09 / BR-30 / FR-59 / FR-60:** agent assignment/ticketや配置案をcontract compiler/muster gateの出力と同一視しない。runtime-neutral specialist agent contractの生成保証、専門化の測定便益とsingle-worker十分性、worker/verifier分離・retire条件が残る。配置はP-SPECIALIST A/B未決で、架空の候補IDは割り当てない。
- **BR-15:** 正規化Product Data projectionを複数consumerへ渡す旧契約は、observation/source/event接続とは別。Product Dataの採否・consumer集合・版の判断と要求意味残差を分ける。
- **FR-46 / FR-47:** 採択済みHARNESS-025/026の設計unit/composite義務だけで、一元L1–L12 ledger catalog、全active templateのatomic extraction、空/TBD/抽出不能/重複をfinding化する能力を満たすとはしない。FR-46の採否はscope判断、FR-47は明示的な能力残差。

## 保留中の候補・人の判断・記録済み変更

候補の意味を実装済みとして数えない。未採択候補は次の通り: HIL-BR-02, HIL-BR-07, HIL-BR-11, HIL-BR-20, HIL-BR-29, HIL-BR-31, HIL-BR-32, HIL-BR-33, HIL-FR-25, HIL-FR-26, HIL-FR-29, HIL-FR-30, HIL-FR-35, HIL-FR-36, HIL-FR-38, HIL-NFR-13, HIL-NFR-16, HIL-NFR-21, HIL-NFR-23, HIL-NFR-35, HIL-NFR-37. 詳細な本文・対受入箇所とPO状態はJSONの各identityを参照。

scope/値/配置判断が残るID: HIL-BR-14, HIL-BR-15, HIL-BR-19, HIL-BR-30, HIL-FR-31, HIL-FR-33, HIL-FR-34, HIL-FR-46, HIL-FR-59, HIL-FR-60, HIL-NFR-04, HIL-NFR-07, HIL-NFR-09, HIL-NFR-17, HIL-NFR-19, HIL-TR-04. 特にNFR-04の数値budget、NFR-07の定量複雑度指標、NFR-17のfreshness/retention値、TR-04のplatform優先は上流の値を創作せず保留する。BR-14は一回限りmigration taskの閉包、BR-19はrepository migration owner/scopeであり、製品一般機能の不足へ拡張しない。

既決の人間意味変更として記録されているID: HIL-BR-03, HIL-BR-16, HIL-BR-18, HIL-BR-28, HIL-FR-28, HIL-FR-56, HIL-NFR-03. これは意味差分を隠さず示す。旧3-stage固定CIからscope-derived工程への変更など、現行decision recordが保持する差分と、現在の候補採択状態を分けた。

implementation-only主体のID: HIL-BR-04, HIL-BR-08, HIL-BR-09, HIL-BR-12, HIL-BR-19, HIL-BR-24, HIL-BR-25, HIL-FR-27, HIL-FR-32, HIL-FR-34, HIL-FR-48, HIL-FR-49, HIL-FR-51, HIL-FR-56, HIL-NFR-08, HIL-NFR-09, HIL-NFR-14, HIL-NFR-15, HIL-NFR-18, HIL-NFR-19, HIL-NFR-20, HIL-NFR-24, HIL-NFR-25, HIL-NFR-26, HIL-NFR-29, HIL-NFR-30, HIL-NFR-31, HIL-NFR-33, HIL-NFR-34, HIL-NFR-38, HIL-NFR-39, HIL-TR-01, HIL-TR-02, HIL-TR-03, HIL-TR-05, HIL-TR-06, HIL-TR-07, HIL-TR-08, HIL-TR-09, HIL-TR-10, HIL-TR-11. 旧schema/runner/IPC/tool名だけの不在、未実行、数値未選択を、ただちに新L2要求と扱わない。

## 固定した現行本文SHA-256

JSON `current_target_file_sha256` には16のL2/L11本文すべてを記録した。残差と直接関係するファイルは次の通り。

- `docs/helix-harness/L2-requirements/product-requirements.md` — `1e4e5b9be4258bfe5e3ab6a4c6911a7cab380617a01d50fa5ac5472adb849c99`
- `docs/helix-harness/L11-acceptance/product-acceptance.md` — `6262609e08a80b493d14cbbd9205befaff61e8046bc567128b37445f2b825974`
- `docs/helix-os/L2-requirements/governance-requirements.md` — `db2b119daa7fbc47b79b1652beba72149fb0d6969af7bb400c1650d77464f2b5`
- `docs/helix-os/L11-acceptance/governance-acceptance.md` — `86b7949cf7700300588e8dc2ccb4448e31111223d2f1cace81109533452d551e`
- `docs/helix-labo/L2-requirements/labo-requirements.md` — `c34b87dde7c94eecb7d4aa83146cf2f3de1b50c278bd0e99cbf9e96a01145f71`
- `docs/helix-labo/L11-acceptance/labo-acceptance.md` — `119fa43bce6753bdb0fed5420641617b9665907a7b1c3b2e6def590098e7442d`
- `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` — `39e31f6a18385c8ca37f57fcaac4076d55c5fba2c49f47eadbaf48be5ef48d6d`
- `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` — `f70b7b996d79c432ac4771fd58e2819e1619abfbedd96d145d38f31e21142630`
- `docs/helix-brain/L2-requirements/brain-requirements.md` — `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`
- `docs/helix-brain/L11-acceptance/brain-acceptance.md` — `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`

## 範囲と限界

この照合は旧IR153 W1–W4の指定108 identityに限定する。全旧資産4,020件やIR153の他waveを再監査したものではない。source lineの一致とtarget IDの列挙は対象を特定する証拠であり、意味被覆そのものは各旧条件・oracle、現行L2、L11受入、記録済みdecisionの実読によって判断した。候補の未採択、受入fixture未実行、後続版保全、scope保留はそれぞれ分けて記録した。
