# HELIX-HARNESS L10 非機能検証設計（1.0対象親39件の草稿）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, 011, 022, 023 and Stage 2b HARNESS-L2-012..020, 024, Stage 2c HARNESS-L2-030..032; Stage 3 HARNESS-L2-034,036,038,039,040,041,042,043,044,046,047,049,054; Stage 4 HARNESS-L2-026..029; Stage 5 HARNESS-L2-021,025,033,035,037
paired_l3: ../L3-requirements/nfr-grade.md
execution_status: designed_only_not_executed

本書は[NFR候補](../L3-requirements/nfr-grade.md)の値を、[L3機能AC](../L3-requirements/functional-requirements.md)が定める正常・失敗・未評価fixtureで測る方法を示す。実行結果、達成、承認、release可否を示すものではない。functional ACが要求意味の正本で、本書は候補値を別の要求として重複定義しない。

## 測定表

case IDは `CASE-HARNESS-L10-NFR-<親番号>-<連番>` とし、親番号のtraceを維持する。

| L10 case ID | NFR候補 | 入力／比較 | 観測と合格材料 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-010-01` | `NFR-C-HARNESS-010-01` | 同じ入力、pack version、宣言artifact contractで独立に生成した結果を固定する。 | 宣言成果物のbytes digestを比較し、予期しない差分0件を照合する。metadata除外はartifact contractに明示された項目だけを適用し、除外前後の差分を記録する。 | 未宣言の正規化で差分を隠したら不合格。fixtureに必要なcontract／versionがないとき未評価。 |
| `CASE-HARNESS-L10-NFR-010-02` | `NFR-C-HARNESS-010-02` | 一つの対象packのみ更新し、更新前後の全pack identity/version/evidenceを比較する。 | 対象外packの変更件数0を確認する。変更1件以上は単一pack差し替え不合格。 | 複数pack更新を混ぜたfixtureは候補値の判定に使わず、別scopeと記録する。 |
| `CASE-HARNESS-L10-NFR-011-01` | `NFR-C-HARNESS-011-01` | 同じlogical operationを同一冪等keyと記録済stateでresume／再送する。効果のない中断と、効果を記録した後の重複送達を分ける。 | operation/correlation identityが保たれ、同じkeyによる追加effect 0件、処理効果が高々1回である証拠を照合する。 | 新keyによる別operation、同一keyで追加effectがあれば不合格。実際の副作用が入力にないfixtureは未評価ではなく、追加effectなしを設計上観測できるsynthetic oracleを使う。 |
| `CASE-HARNESS-L10-NFR-011-02` | `NFR-C-HARNESS-011-02` | expiry直前・ちょうど・直後のdispatchおよびresume開始、期限前開始・期限後結果の各fixtureを比較する。等号扱いは既存contractの規則に従い、規則未定義時はNFR文書の候補A (`now >= expiry`) と候補B (`now > expiry`) を同一clock fixtureで比較する。 | expiry後にsuccessとなった件数0。各dispatch/attempt/resume開始時点とresult timeに適用されたexpiry、result stateを相関IDで記録する。expiry後successは既存contractの開始境界規則と照合し、成功扱いしない。 | 時計・expiry authorityがfixtureで固定されない場合は未評価。TTL／clock skew許容値を本測定で作らない。 |
| `CASE-HARNESS-L10-NFR-023-01` | `NFR-C-HARNESS-023-01` | NFR候補文書のD1–D12全fixture（常時必須valid/missing/stale、operation true/false/unknown、selected valid/missing/unselected、暗黙fallback拒否、明示再選択、reference-only）を同一pack revisionで評価する。人代行は権限・隔離・版・検証・記録・受領receiptを含め、未実装依存を分類する入力も与える。 | 各fixtureで表に記載したclosure/state/reasonを観測し、同じinput・revisionの2回評価で意味digest差分0。D9は未観測、D10は保留、D11は新入力として再評価。classification-onlyはmissing/unknownを返し依存実装を要求しない。 | 条件や依存の不足をfalse／successに丸める、D10で暗黙fallback、D11の明示再選択を拒否、人代行receipt欠落、安全依存のoptional化は不合格。scope外は未評価。 |

### Stage 2b 候補ごとの総合測定

候補の適用範囲にある固定親、functional AC、入力revisionを明示して合成測定する。数値候補は要件採否前の比較・測定計画であり、固定SLOやPO parameter gateではない。

| L10 case ID | NFR候補ID | 入力／比較 | oracle／測定 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-012-01` | `NFR-C-HARNESS-012-01` | AC-012-01..03のUI/PoC両適用、片方N/A、両方N/A、結果backflow済／未済を組合せる。 | Prototype/PoC field別の入力・出力・N/A receiptおよび要件化/昇格状態を比較し、片方の代用0件・Decide前昇格0件を計数する。 | fieldを分けられない場合不合格。対象の画面有無または技術不確実性が不明ならその枝は未評価。 |
| `CASE-HARNESS-L10-NFR-013-01` | `NFR-C-HARNESS-013-01` | 正常な未見requirementと、traceなし追加、未承認出力のfixtureを対比する。 | 出力要件ごとの入力trace/backflow先とapproval stateを照合し、traceなし／自動昇格を0件とする。 | 上流入力・scopeが欠けて妥当性を判断できない場合unknown。 |
| `CASE-HARNESS-L10-NFR-014-01` | `NFR-C-HARNESS-014-01` | template適用による単体design obligation集合と対応L9/L8/L7検証設計を対応付け、template必須入力欠落/source不明を個別に変異。 | 各義務の根拠・検証対・template provenance欠落を数え、欠落0を候補oracleとする。 | 適用対象kind/risk/domainが決まらない場合はtemplate適合を未評価。 |
| `CASE-HARNESS-L10-NFR-015-01` | `NFR-C-HARNESS-015-01` | AC-015開発証拠を同一revisionで揃え、各stepとticket関係上省略した検査を1つずつ変える。 | trace欠落数とProvisional超過数を数える。CI greenのみ、または他ownerのCI evidenceなしで昇格しない。 | ticket/evidence scope未入力は未評価。 |
| `CASE-HARNESS-L10-NFR-016-01` | `NFR-C-HARNESS-016-01` | baselineとscope/owner提示budgetを固定後、同一workload/profile条件で候補Aの中央値比較と候補Bの分布・上側quantile比較を行い、実測数・標本数・環境・ばらつき・workload分布を記録する。 | 回帰oracle違反数、中央値差、分布差、上側quantile、confidence intervalを並記し、中央値だけでは見えない尾部回帰を比較できる根拠候補を得る。 | baseline/budget/workload/profile/統計条件/oracleが欠ければ未評価。budget数値は上流ownerが提示した場合のみ使い、未提示値を生成しない。標本不足やworkload偏りは別の制約／未評価として残り、分布併記で解消した扱いにしない。測定ばらつきの大きい結果を改善達成にしない。 |
| `CASE-HARNESS-L10-NFR-017-01` | `NFR-C-HARNESS-017-01` | eligible positiveとRelease Port必須条件欠落・未回収検査・revisionずれを対比し、同じinputでartifact再構成を行う。 | 不適格eligible件数とartifact identity/digest差を計数し、候補値0を照合する。 | 配備結果をこのcaseのoracleにしない。 |
| `CASE-HARNESS-L10-NFR-018-01` | `NFR-C-HARNESS-018-01` | 5状態の根拠を個々に与え、document-only/CI-only昇格を負例として、対象revision・時点・ownerを一つずつ欠く。 | 誤state遷移およびrecord field欠落数を測る。製品固有の品質閾値は入力されたowner基準とだけ比較する。 | owner基準、適用性、観測期間が不明ならその品質判定は未評価。 |
| `CASE-HARNESS-L10-NFR-019-01` | `NFR-C-HARNESS-019-01` | 任意stage由来の完全・部分・矛盾inputを与え、source/owner/revisionの各欠落を独立して評価する。 | 変換可能、unknown、inconsistentの各結果が原入力へtraceされるか測り、自動承認/release数0を照合する。 | 十分な入力を持つ正常な未見stageを拒否しない。 |
| `CASE-HARNESS-L10-NFR-020-01` | `NFR-C-HARNESS-020-01` | 隣接producer/consumer契約のvalid、版不一致、field欠落、許容未知fieldを比較する。 | field coverage欠落・不整合暗黙受理・upstream state変更を計数する。個々の欠落名と所在をoracle出力へ含める。 | 契約自体または双方ownerが提示されない場合未評価。 |
| `CASE-HARNESS-L10-NFR-024-01` | `NFR-C-HARNESS-024-01` | 同一engine/pack/target revision・scope・既回答で同じ質問順・理由・状態を反復比較し、score-only convergence fixtureと必須項目欠落fixtureを与える。 | 順序・理由・状態差分と必須不足の見逃し／誤った合意昇格を計数する。 | 入力revision、oracle、適用性根拠が不足すれば未評価。固定history件数・質問数・統計thresholdは新設しない。 |

Expiry境界のfixtureでは、既存contractが定める比較規則を用いる。未定義なら候補A/Bの各々で直前・等号・直後のdispatch/resumeを比較し、期限切れsuccessが0件であることを測る。

### Stage 3 NFR候補測定case

各候補は固定parent由来の完全性/不正遷移を測る設計案であり、達成測定ではない。未確定技術閾値は比較候補と実測条件を残し、個別PO parameter gateを作らない。

| L10 case ID | NFR候補 | 入力／比較 | oracle／測定 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-034-01` | `NFR-C-HARNESS-034-01` | 固定13領域を適用/理由付きN/Aへ分類し、metric ID、対象requirement/NFR、測定対象、workload/environment/data、baseline、target/SLO、許容差、sampling/window、tool/probe、evidence schema、判定oracle、owner、実行layer、再測定triggerの各fieldをそろえたmetricと、一fieldずつmissing/stale/wrong-scopeにしたfixtureを比較する。hard limit/error budgetの混同とAI・永続化・fault・time-series条件の適用欠落も別々に変異する。 | 各14 fieldのunmatched数と適用領域/N-A理由を個別記録する。 | 適用領域の欠落と理由なしN/Aを別々に数える。unknown applicabilityは未評価とし分母から黙って除かない。自由記述だけで必須field欠落を埋めない。 |
| `CASE-HARNESS-L10-NFR-036-01` | `NFR-C-HARNESS-036-01` | selected profileのgate observationをticket/revision/profileと版付きreport windowで特定し、eligible denominator、通過数、除外、未実行を記録する。非画面N/Aは判定者識別・理由・対象revision・HEAD・再評価条件がcurrentなfixtureと、各field欠落/stale fixtureを比較する。画面追加・revision/HEAD/条件変更後の再評価欠落、OSによる根拠なきscope変更、036による画面有無推測、旧drive enum欠落のみの省略も変異する。依存漏れ・契約漏れ・接続欠損・デグレ、gap/duplicate/mismatchも別々に変異する。候補比較ではeligible gate単位とticket単位の母集団を並べ、既存≥90%目標と比較する（個別ticket合否には転用しない）。 | unmatched required view、duplicate level、false same-condition passを個別countし、NFR-13の既存≥90%条件の比率候補を算出する。非画面除外はcurrent applicability recordが全field揃う場合だけ行い、欠落/staleな非適用をeligible分母から落とさない。 | 4 cross-detectionのどれも他で相殺しない。scope/profile/window/applicability decision/eligible判定が不明または変更後の再評価未実施なら未評価であり、実測前に分母や閾値を固定しない。全ticket実行率に読み替えない。 |
| `CASE-HARNESS-L10-NFR-038-01` | `NFR-C-HARNESS-038-01` | selected source scopeの各適用obligation/endpointのforward・reverse relationと理由付きN/A。 | asymmetric relation/aggregate-only/unjustified N-A/no-finding countを測る。後段未作成はunresolvedとして別count。 | unknownをzeroにしない。全旧source一括走査なし。 |
| `CASE-HARNESS-L10-NFR-039-01` | `NFR-C-HARNESS-039-01` | selected UI/Experience/Frontend relation、screen identity/acceptance pair、before-after revisionを照合する。UX完了を主張するfixtureでは7軸別current evidenceとwalkthroughを与え、別fixtureでは候補/設計開始のみを与える。 | missing/stale/untraced relationを個別countし、未選択FE measurementを039の実測成果に含めない。 | 7軸の欠落はUX完了主張だけを保留する。候補/設計開始を止めず、非UIの理由付きN/Aを許可し、適用性不明は未評価とする。旧inventory全数を母集団にしない。 |
| `CASE-HARNESS-L10-NFR-040-01` | `NFR-C-HARNESS-040-01` | 12 layer/6 pair/L0 anchor契約候補と双方向edge fixture。 | 欠落layer/pair/anchor relationとone-sided edgeを分けて数える。 | catalog未実装は未完として記録、registration/executionを測定しない。 |
| `CASE-HARNESS-L10-NFR-041-01` | `NFR-C-HARNESS-041-01` | 同じactive template/extractor inputを反復し、1 obligation atom/gap対応を比較。 | atomic obligation coverageとsource/extractor semantic digest再現を測定。 | extractor/scope未固定は未評価。将来版L11や別extractorは混ぜない。 |
| `CASE-HARNESS-L10-NFR-042-01` | `NFR-C-HARNESS-042-01` | candidate routeごとにsemantic, consumer, oracle, dependency evidenceをそろえ、feature additionを別episodeにする。 | successful candidateのevidence missing数と同一episode混載数をcount。 | unknown consumer/oracleは未評価; performance改善量はこのNFRの判定対象外。 |
| `CASE-HARNESS-L10-NFR-043-01` | `NFR-C-HARNESS-043-01` | 適用rule/branchを確定したmatrixへpositive/boundary-negative例をひも付け、各例を個別削除。 | branch別pair coverage欠落を測る。単純例総数はoracleにしない。 | active branch denominatorが不明/staleなら未評価、0件と記録しない。 |
| `CASE-HARNESS-L10-NFR-044-01` | `NFR-C-HARNESS-044-01` | obligation class/contract relationをscope内で全列挙しreuse/delta/new/N/Aを比較。 | uncovered classとsemantic duplicateを個別count、正当closure時のみ両方0。 | N/A根拠やclass meaning unknownなら未評価。document countだけで判定しない。 |
| `CASE-HARNESS-L10-NFR-046-01` | `NFR-C-HARNESS-046-01` | workflow obligation/style/scope/reverse evidenceとScrum applicabilityを比較。 | unmapped applicable obligationと非Scrumへの誤ったScrum条件を別count。 | style/applicability不明は未評価。別styleをScrum扱いしない。 |
| `CASE-HARNESS-L10-NFR-047-01` | `NFR-C-HARNESS-047-01` | muster candidate/role sufficient/unknownをcomparison rationaleとworker/verifier identityで測る。 | 根拠なしmuster、sufficientを無視したmuster、authority conflation各count。 | LABO comparison applicability欠如はunknownでありfailure/benefit 0へ丸めない。 |
| `CASE-HARNESS-L10-NFR-049-01` | `NFR-C-HARNESS-049-01` | fixed L11-049の最小入力、5 check別positive/negative fixture、期待分類を与える。 | 案Aは実測ごとにTP/FP/FN/TN、precision=TP/(TP+FP)、recall=TP/(TP+FN)、適用範囲/未評価を報告し、事前閾値なしでwarning/unknownを保つ。案Bはcalibration結果から候補閾値を置いて別holdoutを測る。両案で初回測定前に数値閾値を決めない。 | 分母0・適用不明・fixture不足・精度未検証はunknownと未評価範囲を記録する。既知の不適合はwarning/findingとして残し、結果状態はpass/warning/unknownに限る。現草稿は親に合格閾値がないため案Aを推奨し、未評価をpassにしない。生成/Pattern/ID入力を追加必須にしない。 |
| `CASE-HARNESS-L10-NFR-054-01` | `NFR-C-HARNESS-054-01` | typed handoffと同一task/scope/revisionのOS assignment/profile identity、unknown axis変異。 | mismatchとunknown-as-successを別countし、未解決時にhandoff未完のままか確認。 | OS assignment未提示なら未評価。HARNESSの実行率へ読み替えない。 |


## 判定の限界

この測定は候補L3 revision、固定L2/L11、限定fixtureと明示scopeに限る。外部システム全体の性能、可用性、負荷耐性、全consumerでの互換性を証明しない。L10の合格材料だけでL3承認、HARNESS全体のVerified／Accepted、利用者受入、releaseを生成しない。実測を行う場合は下流の承認済み設計と既存authorityが必要だが、本草稿から実行許可を与えない。


## H022 NFR測定case

| L10 case ID | NFR候補ID | 入力／比較 | oracle／測定 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-022-01` | `NFR-C-HARNESS-022-01` | 同一revision/scopeでProvisional→Integrated→Verified→Acceptedの段階別証拠を与え、各必要evidenceを一つずつ欠落させる。 | 各遷移で必要条件を満たす場合だけ進み、誤昇格0件。L10 pass単独、L11記録なしはAcceptedにしない。 | scope/revisionやoracleが固定できないfixtureは未評価。実測をしておらず値は候補。 |

## Stage 2c — HARNESS-L2-030／031／032 NFR測定case

| L10 case ID | NFR候補 | 入力／観測 | 合格材料 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-030-01` | `NFR-C-HARNESS-030-01` | 同一要件/design/oracle/source版/scopeから独立生成したcaseを比較。contractが明示する非意味metadataは別集計する。 | 意味差分0。metadata除外は宣言contractに明記された分だけ。 | 未宣言正規化、期待値創作、根拠不明入力は不合格または未評価。 |
| `CASE-HARNESS-L10-NFR-031-01` | `NFR-C-HARNESS-031-01` | 合成元failure identity、複数reduction stage、oracle同一/不同/未返却receipt、secret markerを投入する。 | identityを全段階に追跡、different oracleを同一扱い0、raw marker露出0。 | receipt前確認済みclaim、元failure消去、markerの値記録は不合格。 |
| `CASE-HARNESS-L10-NFR-032-01` | `NFR-C-HARNESS-032-01` | 選択consumerの適合packetとfieldごとの不一致packetを比較し、handoff前のreceipt/resultなしでpacketを作る。handoff後のdelivery receiptとexecutor実行後のrun resultを順に与える。 | packet対応不一致0、handoff前のreceipt/result要求0、handoff receiptからrun result/passを作る件数0。 | consumer/schema不明は未評価、別consumerへのfallbackは不合格。 |

候補値の測定は合成fixtureで行う設計であり、実測・実行・承認ではない。

## Stage 4 NFR候補の測定設計

| L10 case ID | NFR候補 | 入力・測定 | 正常・反例と判定 | unknown/限界 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-026-01` | `NFR-C-HARNESS-026-01` | 選択L3/Template/CORE/Patternとtrace graph | 親要求ごとにartifact/oracle edgeを数え、欠落0を候補とする。CORE欠落・競合隠蔽は不合格。 | 未選択Patternは適用外。全Template実装率は測らない。 |
| `CASE-HARNESS-L10-NFR-027-01` | `NFR-C-HARNESS-027-01` | 静的source locator、revision/digest/scope、permission、出力observation | 全observationを正確なspanへ結び、誤source/実行アクセス0を候補とする。runtime・別revision混入は失敗。 | spanを特定できない観測はunknown。処理時間閾値は未指定。 |
| `CASE-HARNESS-L10-NFR-028-01` | `NFR-C-HARNESS-028-01` | design/requirement exact revisionとaffected-set oracle | 親が列挙する全対象との対応欠落数、known/unknownの誤昇格数を測る。全件対応と誤昇格0が候補。 | 未確定の設計owner意味を補完しない。 |
| `CASE-HARNESS-L10-NFR-029-01` | `NFR-C-HARNESS-029-01` | 選択operation、operation-specific dependencies、proposalとcustom logic trace | proposal根拠漏れ・custom logic消失・未選択依存の混入を個別計数し0を候補とする。 | 実装成功率やmigration timeを追加しない。 |


## Stage 5 NFR測定case

| L10 case ID | NFR候補 | 入力／比較 | 合格材料 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-021-01` | `NFR-C-HARNESS-021-01` | 固定L2-021の一つの構成体全体の端から端relation、横断NFR、統合version/update/rollback/L12運用検証trace。個別release unitの選択範囲に閉じる案と全構成体義務のtrace案を比較。 | 固定L2-021の全構成体義務の未trace数0、rollback先と版対応が明示。 | scope不明は未評価。 |
| `CASE-HARNESS-L10-NFR-025-01` | `NFR-C-HARNESS-025-01` | cross-element design graphと適用oracleを与え、既知Pattern conflictの見落とし、候補代替の不変条件違反、意味変更案の採用提案を個別mutationする。対照正常例では制約・根拠・影響範囲を記録し、既知不変条件を全て保つ代替候補をoracleで比較する。conflict/scope/oracle自体が不明なfixtureも別に与える。 | relation欠落・既知conflict見逃し・不変条件を破る候補採用は個別にfail計数。意味変更案は採用候補にせずL2-008へ戻す。known violationとunknown/未評価を別集計する。 | 未選択Patternは未観測。unknownな適用scope/conflict/oracleはholdで、既知違反のfailと相殺しない。UI証拠適用性はUI条件に従う。 |
| `CASE-HARNESS-L10-NFR-033-01` | `NFR-C-HARNESS-033-01` | candidate/reproduction/regression stagesのreceiptを一つずつ欠落し、同一failure oracleを比較。 | 各段階の欠落が成立claimに隠れず、誤claim0。 | 未実行run resultは未評価。 |
| `CASE-HARNESS-L10-NFR-035-01` | `NFR-C-HARNESS-035-01` | source→candidate→acceptance graphと、scope拡張の複雑さ・公開面・運用負債各before/afterの欠落・旧revision・追加数のみのmutation。 | valid edges全件trace、循環を根拠成立に数えない。 | authority/予算unknownを未評価に保つ。 |
| `CASE-HARNESS-L10-NFR-037-01` | `NFR-C-HARNESS-037-01` | 009-selected two-phase scope、両phase revision/L4/L9 receipt、片方欠落mutation。 | phase boundary/receipt欠落0、片phaseのみでmerge0。 | 009非適用は分母外、未見scopeは適用性unknown。 |

計測は候補設計であり、実装実行や外部system性能の保証ではない。
