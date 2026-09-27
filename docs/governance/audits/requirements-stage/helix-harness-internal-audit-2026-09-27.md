# HARNESS 機構内監査（2026-09-27）

- 基準: `858026b250a15d4fec020b21b315c250decf960b`（G18統合後）。L2/L11本文は以下の記録したSHAで固定。
- 範囲: HARNESS L1/L2/L11全33 identity、PO能力補強第1〜4項、必要な旧source。本文・registerの変更、旧runtime/test/CI実行はしていない。受入はすべて未実行の候補として扱う。
- 本書は機構要求の整合監査であり、採択、source atom移管、no-loss、実装完了を判定しない。

## 読んだ正本と照合根拠

|対象|path / 行|SHA-256|照合内容|
|---|---|---|---|
|HARNESS L1|`docs/helix-harness/L1-planning/product-intent.md:1-67`|`238ae0590f43c10c0a59a0cea4a9907328752a81388891e1a115d4278db00e1f`|9つのL1企画候補、外部提供product、7 service、OS/LABO/INTとの境界、1.0土台|
|HARNESS L2|`docs/helix-harness/L2-requirements/product-requirements.md:1-675`|`7ee1004f8d2c0eea7816b1e321a3ad4abd284156c50704b41476940491d5d44d`|001–033の現行候補条件、kind、親relation、依存、責務境界|
|HARNESS L11|`docs/helix-harness/L11-acceptance/product-acceptance.md:1-442`|`e6e9211edef5809129b765511f6683b291eeb787889d89fe9b52fce44c00e378`|未実行状態、全identityの成功・反例とG12/G15/G16/G18追補受入|
|PO 原文|`docs/helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md:8-60`|`ab8bb6ae8cd418053d6baaafccaa80ee8ef2e715caab1576e5a00c306e97d1f8`|1項設計合成、2項reverse/delta、3項効果比較、4項test/data/double/repro/regression。既存をゼロ扱いせず詳細不足を補う。全項1.0採択を強制しない|
|PO判断・G15/16/18|`docs/governance/decisions/capability-reinforcement-po-decisions-2026-09-27.md:79-117`|`944160259ae40c7af0555fb6ce8ddcb2be64c261a8d4734276cfb2f259811282`|PO項目から候補範囲、HARNESS/CORE/BRAIN境界、保持点と差分|
|G18旧source対応|`docs/governance/decisions/test-reproduction-derivation-2026-09-27.md:19-65`|`332361d740294bb7f90a8114a00ab05c0b9aaac2f599dcef765a632f9c414cc1`|test/repro/regression候補・実行主体・authority境界、旧資産との対応|
|Concept|`docs/concept/helix-concept.md:114-127,218-277`|`06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78`|機構/product区別、7サービス、CORE・component所有、実行主体分離|
|初期CORE決定|`docs/governance/decisions/core-first-pack-po-decisions-2026-09-26.md:30-78`|`039f26cf46198e8c9bccc711c928973d0ebd6ada51f856729723a3ac829797e0`|pack所有と接続・受入契約のHARNESS ownership、test/CI実行はOS/user CI|
|旧設計template|`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:16-99`|`e254d995d1d9fbbcc74bb53b3356b4499ac20cca2280eeafde1412d08630c4cb`|template authority、根拠/unknown/trace、出力からauthorityを生成しない保持点|
|旧synthesis requirements|`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/system-synthesis-requirements.md:29-102`|`69c8a47a4b67729fceabb3df85ecd1c2caa0b9faa5e5b7d958eff48517fdbd79`|trace・提案と人承認境界。旧workflow/CIは持ち込まない|
|旧design-HARNESS|`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:37-56`|`7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d`|設計義務・証拠関係。現行L2へ意味再導出|
|旧test/repro運用例|`archive/legacy-generation-2026-09-14/root/docs/governance/ai-dev-team-operations_v1.1.md:716-750`|`4c03ceed6fd11985158cb9dd7d3e5f455274cf74e839523b756da7f35441867d`|failure再現と回帰の保持点。毎incidentへの強制手順にはしない|
|旧incident directive|`archive/legacy-generation-2026-09-14/root/docs/archive/intake/development-investment-stage-directives-source_v1.0.md:982-1026`|`7b7d0600bccd9045aa1c11f9762886c982b38e9446197f9dcf00637116833b04`|限定された入力、状態差、再現と副作用境界。現行authorityへ直輸入しない|

### 001〜009の旧routing-container管理状態

`docs/governance/audits/source-rebaseline/l2-source-register.md:7-10,30-49`は旧要求を削減せず37件をrouting containerとして扱い、全件のsource照合、L3接続、IR移管が未完とする。`docs/governance/requirement-carry-forward-status.md:7-24`、`docs/governance/legacy-migration/ir/legacy-ir-rehome-wave-register.md:6-8,24-36`の照合では、IR 153件は`preserved_pending_rehome`、successor割当0。HARNESS-L2-001〜009ごとのsource atom successor binding/被覆は確認できない。現L2/L11自身も旧source atom・digest・successor・未被覆atomを照合する要件としている（L2 `product-requirements.md:18-26`、L11 `product-acceptance.md:15-18`）。

従って001〜009は「個別source atom successorが未確定のrouting container」という別管理状態として扱う。これは要求意味の欠落、source損失、廃止、不採用、採択のいずれも証明しない。management provisional registerへの未登録は登録状態の観測であり、要求品質上のfindingではない。

## 33 identity 条件・受入照合

表の行位置はL2本文とL11本文の相互参照位置。成功は要求された期待結果の要約、判定列は本監査での静的判定であり、実行結果ではない。L1親は省略せず現行本文に記されたIDを完全表記した。

|ID / L2位置|親L1 / kind・版|L2条件の要点|L11位置・期待結果|静的所見|
|---|---|---|---|---|
|HARNESS-L2-001 `L2:40,52`|`HARNESS-L1-001`; 基本工程pair|L1–L12のpairと層を対応し、L2.5適用/非適用を区別|`L11:21,33-40`; legacy/current pair混同拒否、適用理由を残す|旧container状態は上記の通り。全source atom対応は未実施で受入未評価|
|HARNESS-L2-002 `L2:41,53`|`HARNESS-L1-002`; 工程/駆動分離|方式とticket種類、release順を分離し各単位の状態を追う|`L11:21-22,41-48`; discovery/PoC混同・順序違反を不合格|未実行。元source atomの個別binding未確定|
|HARNESS-L2-003 `L2:42,54`|`HARNESS-L1-002`,`HARNESS-L1-003`,`HARNESS-L1-006`; freeze/backflow|状態、戻し先、L2.5、Refactorと意味変更を区別|`L11:23,49-57`; 未合意進行・右側で意味変更を拒否|未実行。source atom照合未確定|
|HARNESS-L2-004 `L2:43,55`|`HARNESS-L1-003`,`HARNESS-L1-004`,`HARNESS-L1-006`; 影響範囲|変更からaffected test/reverificationを導出|`L11:24,58-64`;変更条件の検証漏れを検出|未実行。source atom照合未確定|
|HARNESS-L2-005 `L2:44,56`|`HARNESS-L1-002`,`HARNESS-L1-004`; 検証/CI契約|risk・layer・変更に適合するCI契約、省略検査の回収、OS運転分離|`L11:25,65-70`; fixed-depth/CI-green代用を拒否|未実行。HARNESSが契約、OS/user CIが運転という分担が整合|
|HARNESS-L2-006 `L2:45,57`|`HARNESS-L1-005`; 外部利用|明示版/依存で内部運用なしにservice利用|`L11:26,178-188`; 選択serviceを外部環境で利用|未実行。7単位の具体pack設計とは区別|
|HARNESS-L2-007 `L2:46,58`|`HARNESS-L1-007`; 製品群1.0|複数製品/自身、全7service、1.0土台7項目の証拠|`L11:27,178-188`; 単一demoや一部土台だけでは未完成|未実行。Web完成をHARNESS完成条件に混入していない|
|HARNESS-L2-008 `L2:47,59`|`HARNESS-L1-008`; 要求engine意味形成|質問・指示とcandidate意味比較、L2.5 backflow、人合意/操作権限を生成しない|`L11:28,115-176`; 欠落/追加/対象違い/未確定を提示|未実行。024がこの能力を補強し、別engineを作らない|
|HARNESS-L2-009 `L2:48,60`|`HARNESS-L1-009`; design template|kindごとの設計義務、入力欠落backflow|`L11:29,190-197`; templateをauthority/成功と誤認しない|未実行。026/025が具体化候補|
|HARNESS-L2-010 `L2:324,340-350`|`HARNESS-L1-005`,`HARNESS-L1-008`; 全単位共通単体|pack I/O、依存、oracle、版、一意 owner（service/component/CORE）、収載表、再現/rollback|`L11:205`; pack別交換と所有・適格性確認|未実行。G16/G18 pack ownerの明示性はC1参照|
|HARNESS-L2-011 `L2:325,352-361`|`HARNESS-L1-005`; 全単位共通呼出し単体|GUI非依存、version/compatibility、権限/隔離、receipt、stop/resume|`L11:206`; headless呼出し、版不一致・権限逸脱・expiry拒否|未実行。G18 connectionはconsumer schema/権限へ具体接続|
|HARNESS-L2-012 `L2:326,363-369`|`HARNESS-L1-005`,`HARNESS-L1-007`,`HARNESS-L1-006`; service①単体|prototypeとPoCを分離しbackflow、非適用根拠を保存|`L11:207`; production昇格/Decide前合意を拒否|未実行|
|HARNESS-L2-013 `L2:327,371-377`|`HARNESS-L1-005`,`HARNESS-L1-007`,`HARNESS-L1-008`,`HARNESS-L1-001`; service②単体|根拠から要求・L2/L11,L3/L10 pairを形成、人承認を待つ|`L11:208`; 正常候補形成、不足・意味追加、人承認境界|未実行|
|HARNESS-L2-014 `L2:328,379-385`|`HARNESS-L1-005`,`HARNESS-L1-007`,`HARNESS-L1-009`,`HARNESS-L1-001`; service③単体|承認済みL3からtemplate設計と対oracle、欠落backflow。026を内部必須packとする具体化はL2:530-542|`L11:209,274-280,332-341`; designと対oracle、API/state/permission/DB invariantの実結果確認|未実行。026は014出力を補う内部pack。serviceとunitの二重所有回避を明記|
|HARNESS-L2-015 `L2:329,387-393`|`HARNESS-L1-005`,`HARNESS-L1-007`,`HARNESS-L1-001`,`HARNESS-L1-004`; service④単体|frozen designからRed/Green/local refactor/atomic CI。成果Provisional|`L11:210,282-288`; seeded違反・oracleで実結果を確認し上位状態を自動生成しない|未実行。code/CI存在だけで品質にしない受入補強あり|
|HARNESS-L2-016 `L2:330,395-401`|`HARNESS-L1-005`,`HARNESS-L1-007`,`HARNESS-L1-003`; service⑤単体|behavior/contract保持、意味変更backflow、performance baseline/oracle|`L11:211,290-296`; before/after同scope比較と退行拒否|未実行|
|HARNESS-L2-017 `L2:331,403-409`|`HARNESS-L1-005`,`HARNESS-L1-007`,`HARNESS-L1-004`; service⑥単体|022適格成果とRelease Port、再現/rollback、配備とObservedを分離|`L11:212`; provisional・外部未検証・回収漏れ拒否|未実行。配布実行はOS/user deployment|
|HARNESS-L2-018 `L2:332,411-417`|`HARNESS-L1-005`,`HARNESS-L1-007`,`HARNESS-L1-001`; service⑦単体|配備済み成果と承認済み運用品質要求からL12観測/backflow|`L11:213`; artifact存在だけをObservedにしない|未実行。monitor/incident運転はOS、改善評価LABO|
|HARNESS-L2-019 `L2:333,419-425`|`HARNESS-L1-003`,`HARNESS-L1-005`; full reverse入口単体|どのserviceからも旧要件/code/PoCを取り込み、変換とunknownを残す|`L11:214`; 推測補完・承認昇格・入口制限を拒否|未実行。027をsource-type選択時のunitとして接続候補|
|HARNESS-L2-020 `L2:334,427-436`|`HARNESS-L1-003`,`HARNESS-L1-008`; service handoff connection|隣接serviceのversioned I/O、backflow、未完義務引継ぎ、外部成果も照合|`L11:215`; stale/meaning rewrite/単体passの接続化を拒否|未実行|
|HARNESS-L2-021 `L2:335,438-445`|`HARNESS-L1-007`,`HARNESS-L1-008`; integrated composite|要求から運用/L12までの端から端義務・横断NFR・構成version/rollback|`L11:216`; 下位pass合算で構成体合格にしない|未実行|
|HARNESS-L2-022 `L2:336,447-461`|`HARNESS-L1-005`,`HARNESS-L1-001`,`HARNESS-L1-004`; CORE単体|Provisional→Integrated→Verified→Accepted段階契約、user CI可、④非依存|`L11:217,298-304`; stageごとoracle/evidenceと利用者受入を分ける|未実行。COREが義務/oracle、OSがticket/実行/検収を担当|
|HARNESS-L2-023 `L2:463-494`|primary `HARNESS-L1-005`; dependency contract unit, `version_target: 1.0`|依存4区分、条件式、unknown/stale保留、安全必須、選択source未観測。010/011を補強|`L11:223`; 同入力closure再現、unknown・human delegationも義務維持|未実行。1.0依存を過剰な後続版へ拡張しない規則あり|
|HARNESS-L2-024 `L2:499-524`|primary `HARNESS-L1-008`; context `HARNESS-L1-006`,`HARNESS-L1-005`,`HARNESS-L1-007`,`HARNESS-L1-001`; engine unit, 1.0|同revision既回答照合、影響順、根拠ある再質問、形成情報不足と人の合意待ち分離。固定iteration件数を使わない|`L11:240`; normal/error/unseen、failure/cancel/timeout、初回空履歴、質問量等は補助計測|未実行。engine/OSの責務重複なし|
|HARNESS-L2-026 `L2:530-542`|`HARNESS-L1-005`,`HARNESS-L1-007`,`HARNESS-L1-009`,`HARNESS-L1-001`; unit, 1.0|③ design内pack。Template/CORE/BRAIN connector必須、個別Pattern選択時のみ。画面/API/permission/state/DB/oracleを合成|`L11:332-341`; approved後編集禁止の横断設計oracle、Pattern conflict代替も不変条件維持を確認|未実行。L2本文は依存とBRAIN/CORE ownershipを明示|
|HARNESS-L2-025 `L2:544-555`|`HARNESS-L1-001`,`HARNESS-L1-004`,`HARNESS-L1-005`,`HARNESS-L1-007`,`HARNESS-L1-009`; composite, 1.0|026 design + 必要なBRAIN connectionの端から端invariant。026を生成前提にせず、025→026順|`L11:342-360`; 単体成功と構成体oracleを分離、Pattern selection時だけreceipt|未実行。自己循環なし|
|HARNESS-L2-027 `L2:559-569`|`HARNESS-L1-001`,`HARNESS-L1-003`,`HARNESS-L1-005`; unit, 1.0|選択した静的source型のversioned observation。source authority/read boundary必須、requirement/design/receiptはraw extractionに不要。019選択型利用時に必要|`L11:365-374`; source spanを使い正/誤/未見構造抽出内容を検査、未選択type未観測|未実行。正確なservice/component/CORE owner allocationはrelease manifest段階の確認事項（C1）|
|HARNESS-L2-028 `L2:571-581`|`HARNESS-L1-001`,`HARNESS-L1-003`,`HARNESS-L1-004`,`HARNESS-L1-005`,`HARNESS-L1-006`; connection, 1.0|027 receiptと現行saved design/requirement traceのdelta/affected set照合。approved主張にapproval receipt必須|`L11:375-382`; code/API/DB差分とexact affected scope、unknown/stale拒否|未実行。consumerとしての正本owner allocationはrelease manifest段階の確認事項（C1）|
|HARNESS-L2-029 `L2:583-596`|`HARNESS-L1-001`,`HARNESS-L1-003`,`HARNESS-L1-004`,`HARNESS-L1-005`,`HARNESS-L1-006`; composite, 1.0|source observation→design delta→改修提案/回帰契約、適用は提案のみ|`L11:383-402`; custom processing維持、意味別proposal、禁止migration副作用|未実行。owner allocationはrelease manifest段階の確認事項（C1）|
|HARNESS-L2-030 `L2:601-617`|`HARNESS-L1-001`,`HARNESS-L1-004`,`HARNESS-L1-005`,`HARNESS-L1-007`; unit, 1.0|014 design + 022 oracleからscenario/case/data/double候補を生成。実行とoracle authorityを所有しない|`L11:408-414`; 制約/edge/拒否状態/外部応答を実際にoracle比較、誤り・未見も検査|未実行。owner allocationはrelease manifest段階の確認事項（C1）|
|HARNESS-L2-031 `L2:619-635`|`HARNESS-L1-001`,`HARNESS-L1-004`,`HARNESS-L1-005`,`HARNESS-L1-007`; unit, 1.0|許可されたsanitized failure inputを縮小し同一failure確認、修正前fail/修正後passの候補。run resultは後段|`L11:416-422`; 具体PATCH縮小例、各縮小結果を後続receiptで確かめ同一oracle違反を保持|未実行。permission, 022 oracle、032 executor境界を保持。owner allocationはrelease manifest段階の確認事項（C1）|
|HARNESS-L2-032 `L2:637-653`|`HARNESS-L1-001`,`HARNESS-L1-004`,`HARNESS-L1-005`,`HARNESS-L1-007`; connection, 1.0|artifact→選択OS-020/user CI schemaへのversioned packet。HARNESSはoracle/artifact、executorは隔離実行/result|`L11:424-430`; packet/revision/oracle/schema一致とconsumer後続receipt確認|未実行。接続能力のowner allocationはrelease manifest段階の確認事項（C1）|
|HARNESS-L2-033 `L2:655-671`|`HARNESS-L1-001`,`HARNESS-L1-004`,`HARNESS-L1-005`,`HARNESS-L1-007`; composite, 1.0|030/031→必要時032、候補作成から実行後結果、回帰成立まで段階trace。開始前receipt要求なし|`L11:432-438`; case/repro/reduction/pre-fix fail/post-fix passの個別receipt条件|未実行。owner allocationはrelease manifest段階の確認事項（C1）|

注: 001–009はL2の既存L1-ID接続表`product-requirements.md:310-318`、010–022は同表`:324-336`、023/024および026/025/027–033は各節冒頭の親L1記述を採った。行範囲は改行単位の現baseline位置。

## 具体所見

### C1 — G16/G18 pack owner を release manifest で未解決のままにしない

- **根拠**: `docs/helix-harness/L2-requirements/product-requirements.md:340-350`は、packをservice①〜⑦/component/COREの一つに所有させ、複数service共有の能力はcomponent/COREに置き、release unitへ収める/収めないを明示すると要求する。G15では026について「③設計serviceが利用する」「014はservice入口、026は内部pack」と`L2:534-542`に明記され、025も`L2:546-555`でcomposite境界が定まる。
- **現行候補の観測**: G16各節`L2:559-596`およびG18各節`L2:601-671`はunit/connection/composite kind、I/O、依存、処理責務を説明するが、027–033個別にservice/component/CORE ownerとrelease-unit収載先までは割当てていない。`product-acceptance.md:406`では030/031を独立versioned capability packと呼ぶ一方、ownerや収載mapの行はない。親L1 IDとkindだけではpack ownerを決められない。
- **確度・stage境界**: これは現本文の矛盾や、まだ設計されていない実装の欠陥とは判定しない。L2-010に対するrelease manifest/pack allocationのstage-close条件として残す。L3 pack設計で単一owner・closure・収載/非収載を決める計画なら、その設計に明示してから検証する必要がある。候補をrelease manifestへ収載済み、またはL2-010 pack境界適合済みと扱う段階でownerを空欄にするのは不適合。
- **具体反例**: 外部利用者が⑦運用serviceだけを収載したmanifestでincident縮小031とuser-CI接続032を選ぶ。しかしmanifestが031/032を⑦内、shared component、COREのどこへ所有/収載するか未宣言なら、選択serviceの依存closureと交換/rollback ownerを再現できず、L2-010/L11-010のpack一覧・一意所有oracleを評価できない。これは実行時のOS/user-CI ownerとは別のpack ownership問題。
- **影響**: `HARNESS-L2-027`〜`HARNESS-L2-033`（026/025はowner/boundaryを既に説明する対照）、`HARNESS-L2-010/011`、release manifest。候補修正は新機構の追加でなく、L3で確定する事項の一覧へ引き継ぎ、pack catalogに各IDの単一ownerと収載/除外を記録し、複数service共有はcomponent/COREへ置くこと。032ではHARNESS接続pack ownerとOS-020/user-CI実行ownerを別に記す。割当根拠が不足する場合は推定せず、対象L1/POへ返す。

### 既に本文で閉じていて重複findingにしない項目

- **サービス/productと共通部品**: Concept `helix-concept.md:240-277`にサービス①画面proto/PoC、②要件、③設計、④開発、⑤refactor、⑥release、⑦運用保守の7独立提供単位と、CORE/requirement engine/Design Template等を区別。L2 `:363-445`の012–022とL11 `:199-218`は各service単独成立、handoff、構成体、CORE検証/受入を分離する。026は③内pack、025はdesign compositeとして既存所有を維持。
- **G15 BRAIN connector/Pattern**: `L2:534-555`, `L11:332-360`でBRAIN connector契約が常時必須、選択Patternは選択時のみ、その全件完成は要求しない。HARNESS/COREが設計合成を所有し、BRAINは知識提供。Pattern衝突の制約・根拠・影響と不変条件を保つ代替案も要件化済み。
- **G16 source/dataとsaved design**: `L2:559-596`, `L11:361-402`は027 raw-source operationと028/029 saved design comparisonを区別する。source許可・digest・scopeはraw extractionの必須条件、requirement/design revisionは027単体に強制しない。unknown/未選択を保持し、提案から設計authorityやmigration適用を作らない。
- **G18 test/reproとexecutor**: PO item 4 (`PO source:36-42`)およびdecision `test-reproduction-derivation...:19-65`と、`L2:601-671`/`L11:404-442`は、014 design/022 oracle、030/031生成、032選択executor接続、OS-020/user CI実行、033 composite traceを分離。正常例だけでなく誤り・未見例、case/data/double、具体reduction oracle、pre-fix failure/post-fix passを含む。failure inputを扱わない通常生成はincident dependencyを負わず、run receiptは開始前提でなく後段結果。未実装であること自体は矛盾findingとしない。
- **旧資産からの差分**: 旧template authority、trace/unknown保持、再現/回帰の意味を現行契約へ再導出し、旧workflow・CI・runtime・thresholdを移植/実行していない。旧sourceの番号やartifactだけを現行採択証拠にしていない。

## 結論

HARNESSのL2/L11候補はPO第1・2・4項の要求を既存責務に接続し、service/CORE/BRAIN/OSの基本境界、単体/接続/構成体、未評価と受入の区別は本文上おおむね閉じている。具体的なstage-close確認点は、G16/G18で追加された能力packごとの一意 owner と収載/除外先を、release manifest設計でL2-010に従って確定すること（C1）。現行要求候補だけからは未設計実装の欠陥とせず、確定前に収載済みと誤認しない。001–009のsource atom successor対応も独立に未確定であり、routing container状態を保ったまま別途扱う。

## 作成側の検収と引継ぎ

GPT6 Luna highの調査をCodex executionが検収した。C1は要求欠落の修正要求ではなく、L2-010に既にある一意所有・依存閉包をL3で具体化する持越し事項とする。今回、追加の要求本文修正候補は0件。後続の機構別消化ではこの処置とsource atom対応の未確定範囲を確認し、横断整理・総合検証へ渡す。監査文書のmergeで要求採択・source全量被覆・L3着手許可を生成しない。
