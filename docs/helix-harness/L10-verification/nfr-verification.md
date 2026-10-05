# HELIX-HARNESS L10 非機能検証設計（Stage 1: HARNESS-L2-010/011/023）

status: draft_for_l3_review
approval: not_approved
scope: Stage 1 only; HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023
paired_l3: ../L3-requirements/nfr-grade.md
execution_status: designed_only_not_executed

この文書はL3 NFR候補を対応する固定L3 ACと合成fixtureで測る設計であり、NFR候補を要求として重複定義しない。実行結果、達成、承認、release可否を示さない。

## 測定表

| L10 case ID | NFR候補ID | 入力・比較 | 観測oracle | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-010-01` | `NFR-C-HARNESS-010-01` | 同じ入力、pack version、宣言artifact contractで独立に生成した結果を固定する。 | 宣言成果物のbytes digestを比較し、予期しない差分0件を照合する。metadata除外はartifact contractに明示された項目だけを適用し、除外前後の差分を記録する。 | 未宣言の正規化で差分を隠したら不合格。fixtureに必要なcontract／versionがないとき未評価。 |
| `CASE-HARNESS-L10-NFR-010-02` | `NFR-C-HARNESS-010-02` | 一つの対象packのみ更新し、更新前後の全pack identity/version/evidenceを比較する。 | 対象外packの変更件数0を確認する。変更1件以上は単一pack差し替え不合格。 | 複数pack更新を混ぜたfixtureは候補値の判定に使わず、別scopeと記録する。 |
| `CASE-HARNESS-L10-NFR-011-01` | `NFR-C-HARNESS-011-01` | 同じlogical operationを同一冪等keyと記録済stateでresume／再送する。効果のない中断と、効果を記録した後の重複送達を分ける。呼出し元が別keyで開始する別operationも対照に置く。 | operation/correlation identityが保たれ、同じkeyによる追加effect 0件、処理効果が高々1回である証拠を照合する。 | HARNESSが同一operationのresume時にkeyを変える変異、同一keyで追加effectがあれば不合格。呼出し元が別keyで開始する別operationは許容する。実際の副作用が入力にないfixtureは未評価ではなく、追加effectなしを設計上観測できるsynthetic oracleを使う。 |
| `CASE-HARNESS-L10-NFR-011-02` | `NFR-C-HARNESS-011-02` | expiry直前・ちょうど・直後のpreflight、dispatch直前／直後、およびresume開始、期限前開始・期限後結果の各fixtureを比較する。dispatch後の期限切れはeffect実行後に結果成立を確認できない場合を含む。等号扱いは既存contractの規則に従い、規則未定義時はNFR文書の候補A (`now >= expiry`) と候補B (`now > expiry`) を同一clock fixtureで比較する。 | dispatch前の期限切れはsuccess receiptを返さずblocked/heldとし、effect 0を観測する。dispatch後に期限切れ・snapshot drift等で結果成立を確認できない場合はsuccessでないuncertain/unknown receiptとする。期限前に開始し期限後に結果が到着したfixtureもsuccessにしない。すべてのcheckpoint/result stateを相関IDとexpiryに結び付ける。 | clock、expiry authority、checkpointまたはresult timeがfixtureで固定されない場合は未評価。TTL／clock skew許容値を本測定で作らない。 |
| `CASE-HARNESS-L10-NFR-023-01` | `NFR-C-HARNESS-023-01` | NFR候補文書のD1–D15全fixture（必須missing/stale、operation true/false/unknown、source selected/unselected/選択unknown、暗黙fallback、明示再選択、reference-only偽装、未解決cycle、矛盾条件）を同一pack revisionで評価する。人代行は権限・隔離・版・検証・記録・受領receiptを含め、未実装依存を分類する入力も与える。 | 各fixtureのclosure/state/reasonとowner returnを観測し、同じinput・revisionの2回評価で意味digest差分0。D9は存在・不在等を未観測、D10は暗黙fallback保留、D11は新入力として再評価、D12の安全条件偽装は拒否、D13–D15はunknown/保留。選択依存の版・scope・理由は相関ID付きHARNESS-L2-011結果/evidenceに結ぶ。classification-onlyはmissing/unknownを返し依存実装を要求しない。 | 未選択source・条件不成立依存・無関係な能力全体をclosure/holdへ過剰追加、unknownをfalse/未選択/参照のみへ丸める、D10 fallback、D11明示再選択拒否、参照資料偽装の保留のみ、人代行receipt欠落、安全依存のoptional化、closureから機能/owner/版や許可を生成すれば不合格。scope外は未評価。 |

## 限界

比較digestは試験内のoracleであり、正本schemaや実装方式を新設しない。fixture、固定revision、contract、適用authorityのいずれかが不足する場合は未評価として記録する。expiry比較は既存contractを優先し、未定義の場合のみL3 NFRの案A/Bを同じclock fixtureで比較する。preflight/dispatch前期限切れのblockedとdispatch後結果不確実のuncertainは旧sourceから部分再導出した候補判定であり、現行実装方式を指定しない。TTL、clock-skew、retry count等の値をこの測定で作らない。

## Stage 2b suffix — HARNESS-L2-012/013 技術候補の測定

測定は設計のみであり、実測結果や達成を表さない。planned対象は選択scope内で明示された必須outcome/obligationの集合とし、missing/unknown/staleや未評価を分母から黙って除外しない。分母0は率なしとする。

| L10 case ID | L3 NFR候補 | 入力・比較 | 観測oracle | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-012-01` | `NFR-C-HARNESS-012-01` | 選択対象ごとにPrototype/PoC適用判定、各outcome、revision/scope/source、Backflow traceと、非適用時の5固定fieldをplanned obligationとして列挙する。正常、非適用記録、Prototype/PoC混同、Decide前promotionを含む上記functional caseの結果と照合する。 | 必須outcome/traceの保持率候補100%、非適用field欠落0、Prototype/PoC誤分類0、Decide前production昇格0を数える。全項目は同じtarget revision/scopeへ結び付ける。 | source/applicability oracle不足は未評価。固定件数、成功率、回数、prototype usability/性能SLOを追加しない。分母0は率なし。 |
| `CASE-HARNESS-L10-NFR-013-01` | `NFR-C-HARNESS-013-01` | 対象input scopeに必要なConcept/L1・instruction・evidence、該当時の012 result、first/second status、要求identity、pair artifacts、各逸脱condition dispositionに加え、要求エンジン部品とCORE各々の入力契約identity/revision/scopeをplanned setへ列挙し、functional 013 casesを測定する。比較案Aは依存名のpresenceだけを照合し、案Bは各依存の選択契約tupleとsource、revision、scope、field stateまで照合する。 | 案Bを技術候補とする。各選択形成で必須な2依存×3 fieldを分母に置き、missing/unknown/stale/mismatchも状態別に残す。根拠付きtuple保持候補100%、要件identity混在0、人の意味判断/approval/operation authorityを自動成立とする件数0。契約内容/schema/ownerが固定sourceから確定しないfieldはunknownとして、fixture仮定の値を製品値として扱わない。 | 案Aはstaleまたはscope違いの契約も名前が存在すれば通し得るため、固定L2の対象・版・scopeを守る検査に不十分。必須contract/owner/sourceが判定できない場合は未評価または未解決状態として分母に残す。要求形成回数・固定iteration/weight/threshold/latencyや全件数上限を作らない。必要契約tuple自体が未知なら分母0へ変換せず未評価。 |

候補値の比較方法と境界は親が明示する形成範囲に限定する。missing情報を補完して測定率を上げず、failed/missing/unknown/pending-human-decisionを別の理由として記録する。NFR測定から要件確定や人の承認を生成しない。

## Stage 2b suffix — HARNESS-L2-014/015/016 技術候補の測定

planned母集団は選択親の固定scopeで宣言される義務/traceとし、未選択は背景として別記する。観測可否（valid/failed/missing/censored）と意味状態（valid/missing/unknown/conflict/stale/mismatch）を混同せず、分母0では率なし。試験実行はここでは行わない。

| L10 case ID | L3 NFR候補 | 入力・比較 | 観測oracle | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-014-01` | `NFR-C-HARNESS-014-01` | 選択scopeのapproved requirement制約、template applicability/義務、設計要素、対verification oracleを事前planned setにし、案Aの存在確認と案Bの意味対応を比較する。 | L2/L11が求める制約充足とpair対応を観測する案Bを候補とする。必須trace保持候補100%、既知義務の未対応/矛盾0件を、valid/missing/unknown/conflict別に数える。 | applicability/oracle不足は未評価、unselectedは分母外。template義務数・設計品質・一般成功率を新設しない。 |
| `CASE-HARNESS-L10-NFR-015-01` | `NFR-C-HARNESS-015-01` | frozen design/contract/test、実装artifact revision、CORE工程契約とCORE検証契約それぞれのidentity/revision/scope、Red/Green oracle、双方向trace、選択CI範囲と省略記録をplanned field化しCASE-015群の結果と照合する。両契約の3 fieldずつを別依存として計上し、missing/unknown/stale/mismatchを分母から除かない。固定L11 G13の「費用/時間が改善しても品質未達なら成功にしない」比較用に、品質oracle未達・費用低下・時間短縮が同時にあるfixtureもplanned setへ含める。 | 独立tuple trace候補100%、oracle不一致の誤pass 0、費用/時間改善による品質失敗の相殺0を候補として確認する。Red/Greenをoracleに対応づけ、CI greenは別fieldの実測状態とする。fixture/sourceにない契約schema・owner・結果は未評価/unknownのまま保持する。 | CI運転結果がない場合は未測定。固定CI種別・test数・時間・coverage閾値や契約schema/ownerを設定しない。 |
| `CASE-HARNESS-L10-NFR-016-01` | `NFR-C-HARNESS-016-01` | paired before/after scopeのrequirements/contract/behavior/consumer oracleと、性能を選ぶ場合のbaseline/budget/workload/profile/statistical condition/regression oracleを列挙。案Aの局所benchmark/変更量と案Bのpaired regression＋比較可能性能観測を比較する。 | 案Bを候補とし、必要oracle/trace保持候補100%、既知回帰/誤Backflow 0、6性能測定条件field保持候補100%を状態別に記録する。費用/時間の改善とbehavior/contract/requirement regressionが同時にあるfixtureでは回帰を相殺せずfailureとして数える。 | 選択されない性能改善は未測定。具体的改善閾値・環境許容差・SLAは発明しない。oracleや比較可能性が不足すれば未評価。 |
## Stage 2a suffix — HARNESS-L2-022 NFR候補検証

| L10 case ID | L3 NFR候補 | 入力・比較 | oracleと失敗境界 |
|---|---|---|---|
| `CASE-HARNESS-L10-NFR-022-01` | `NFR-C-HARNESS-022-01` | 選択scope内の各必須FR/ACを一つ以上の適切なL10 oracleへ対応させる正常traceを作る（FR/ACとCASEは多対多でよく、一対一制約を置かない）。対応漏れ、重複ID、artifact revision違い、scope違い、必須result/evidence欠落を一fieldずつ独立に変異する。さらに、すべての必須tupleが一致する完全trace（completeness 100%、mismatch 0件）のままstage-specific quality oracleだけを未達にするnegative fixtureを与える。quality/security/acceptanceのstage別oracle結果はtrace completeness測定と別に記録する。 | 正常は選択scopeの全必須FR/ACに必要なCASE対応がありtupleが一致する。完全traceでもstage-specific quality oracle未達なら、trace integrity候補は完全のまま記録する一方、品質pass・上位state・Acceptedを生成せず実際に満たしたstageに留める。候補境界の100%と0件は必須traceの完全性・不一致測定だけを表し、品質判定thresholdを新設しない（固定L11:268）。ID重複は識別子不備として別に拒否し、正当な複数CASE/AC対応は保持する。各変異をpassにせず理由を記録する。対象集合や必要oracleが欠ける場合は未評価、oracle/receipt不足の品質も未評価のままにする。 |

この候補値は技術案であり、L3要件の承認や実測達成を示さない。比較条件が不足する場合は未評価と記録する。固定親に根拠のない性能SLAの数値は設定しない。
## Stage 2c suffix — HARNESS-L2-030/031/032 NFR候補の測定

測定は固定親revisionと選択scope内の明示必須obligationを母集団とする。planned, valid, failed, missing, stale/mismatch, unknown, censored, unselected/unmeasuredを区別して記録し、除外した結果も母集団を偽らない。分母0は割合なし／測定対象なしとする。以下は設計のみで実測値ではない。

| L10 case ID | L3候補 | 入力・集計母集団 | 観測oracle・判定境界 |
|---|---|---|---|
| `CASE-HARNESS-L10-NFR-030-01` | `NFR-C-HARNESS-030-01` | 選択scopeにおいて親が明示する必要case field、requirement/design/oracle/source/scope traceをplanned母集団とし、各fieldをvalid/missing/conflict/unknown/unselectedで記録。同一input/source revision/scope/seedの生成proposalを比較する。 | 必須宣言field/trace保持率は定義された母集団上100%、根拠のないexpected value/permission/boundaryまたは未選択source推論は0件。case bytes同一を要求せず、意味digestを比較する場合も試験内oracleと明記。分母0では率なし。 |
| `CASE-HARNESS-L10-NFR-031-01` | `NFR-C-HARNESS-031-01` | 選択reduction operationのplanned stepごとにsource/revision/scope/permission/sanitization/oracle/result receiptとsymptom stateを記録。future fix/passと未選択stepを分母に混ぜない。 | 必須trace/receipt保持率100%、receiptなしまたは症状違いのsame-failure assertion 0件、original deletion 0件。valid/failed/missing/unknown/censoredを別集計し、同じoracleのreceiptがないstepはsame-failure確認済みに数えない。planned denominator=0なら率なし。 |
| `CASE-HARNESS-L10-NFR-032-01` | `NFR-C-HARNESS-032-01` | 選択packet obligationごとにartifact/source/revision/scope/oracle/consumer schema/permission/receipt-slotをplanned fieldとして分類。unselected consumersはunmeasuredと別記する。 | planned selected packet obligationsの必須trace保持率100%、unknown/incompatible/undeclared contractをvalid connection扱い0件、handoffからrun/pass推論0件。failed/missing/stale/mismatch/unknown/censoredを残す。分母0では割合なし。 |

未見正常fixtureは固定親が宣言するscopeと適用可能なoracle内でのみ測定する。source・oracle・permission・compatibility rangeが不足するfixtureは判定不能/未評価で記録し、未選択範囲を失敗にも成功にも数えない。case count、mutation threshold、reduction ratio、latency/throughput/SLA等の固定親にない数量は設けない。結果は測定候補を評価する設計であり、L3承認、実測達成、release判定を生成しない。


### Stage 2c測定分類の補足

Nrequiredは対象revision/scopeで選択操作に適用する契約必須項目の集合であり、missing/unknown/不一致も分母に残す。Nmatchedはsource/意味/版/範囲がoracleと一致して保持された項目数、保持率候補はNmatched/Nrequired。名前やpresenceだけの案Aと、意味/source tupleまで照合する案Bを比較し、意味差分を見逃さないBを候補とする。契約必須項目の定義自体が不明な状態をNrequired=0へ変換しない。既知の対象集合が0なら率なし、必須定義不足なら未評価と理由を別記する。

plannedは総予定試行数。観測可否はvalid（判定できる観測が得られた、不合格も含む）、failed（処理エラーで判定可能な観測を得られない）、missing（必要入力/結果がない）、censored（停止/打切りで観測未完）を排他的に記録し、Nplanned=Nvalid+Nfailed+Nmissing+Ncensoredを確認する。意味状態のvalid/missing/stale/mismatch/conflict/unknownは別軸で、観測状態の件数へ重ねて加算しない。未選択consumer/sourceは未観測の背景として別記し選択操作の分母外。未実施は未測定、欠測/停止を0の観測や成功にしない。

### Stage 3 NFR候補測定case

各候補は固定parent由来の完全性/不正遷移を測る設計案であり、達成測定ではない。未確定技術閾値は比較候補と実測条件を残し、個別PO parameter gateを作らない。

| L10 case ID | NFR候補 | 入力／比較 | oracle／測定 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-034-01` | `NFR-C-HARNESS-034-01` | 13 quality domainと該当時AI7条件（判断再現性・Worker/verifier独立性・根拠対応・反復停止性・費用・provider縮退・memory汚染耐性）下の全適用metric・全14項目を事前scope母集団にし、field presence案と意味tuple照合案を比較。 | identity/condition/target-surface/baseline/target-or-N-A+reason/tolerance/sampling-window/probe/evidence/oracle/owner/execution-layer/re-measure-triggerおよびrequirement/NFR traceを対応し、missing/stale/nonrepresentative/unmeasured/failedを別状態で測る。 | 他metric successで相殺しない。固定conditionが適用するmetricを省略して分母を狭めない。applicability unknownは未評価、既知母集団0は率なし。
| `CASE-HARNESS-L10-NFR-036-01` | `NFR-C-HARNESS-036-01` | selected scopeにおけるdependency leak/contract leak/connection missing/regressionの各cross-detection axis、local/CI gate identity/content/version/scope、screen five-axis条件を母集団とする。 | 四軸の誤検出/見逃しを独立計数し、selected screen five detectorを軸別に記録。gate通過率候補90%以上は別途、全運用母集団・対象期間・分母付きの観測指標として比較し個別ticket合否には使わない。 | cross-detection欠落0は親由来の候補。90%はL2由来の運用目標。profile/scope/applicability不明は未評価、全ticket実行率へ読み替えない。
| `CASE-HARNESS-L10-NFR-038-01` | `NFR-C-HARNESS-038-01` | selected source scopeの各適用obligation/endpointのforward・reverse relationと理由付きN/A。 | asymmetric relation/aggregate-only/unjustified N-A/no-finding countを測る。後段未作成はunresolvedとして別count。 | unknownをzeroにしない。全旧source一括走査なし。 |
| `CASE-HARNESS-L10-NFR-039-01` | `NFR-C-HARNESS-039-01` | selected UI/Experience/Frontend relation, screen identity/acceptance pairとbefore-after revision。 | missing/stale/untraced relationを個別countし、未選択FE measurementを039の実測成果に含めない。 | applicability不明は未評価。旧inventory全数を母集団にしない。 |
| `CASE-HARNESS-L10-NFR-040-01` | `NFR-C-HARNESS-040-01` | 12 layer/6 pair/L0 anchor契約候補と双方向edge fixture。 | 欠落layer/pair/anchor relationとone-sided edgeを分けて数える。 | catalog未実装は未完として記録、registration/executionを測定しない。 |
| `CASE-HARNESS-L10-NFR-041-01` | `NFR-C-HARNESS-041-01` | 同じactive template/extractor inputを反復し、1 obligation atom/gap対応を比較。 | atomic obligation coverageとsource/extractor semantic digest再現を測定。 | extractor/scope未固定は未評価。将来版L11や別extractorは混ぜない。 |
| `CASE-HARNESS-L10-NFR-042-01` | `NFR-C-HARNESS-042-01` | candidate routeごとにsemantic, consumer, oracle, dependency evidenceをそろえ、feature additionを別episodeにする。 | successful candidateのevidence missing数と同一episode混載数をcount。 | unknown consumer/oracleは未評価; performance改善量はこのNFRの判定対象外。 |
| `CASE-HARNESS-L10-NFR-043-01` | `NFR-C-HARNESS-043-01` | 適用rule/branchを確定したmatrixへpositive/boundary-negative例をひも付け、各例を個別削除。 | branch別pair coverage欠落を測る。単純例総数はoracleにしない。 | active branch denominatorが不明/staleなら未評価、0件と記録しない。 |
| `CASE-HARNESS-L10-NFR-044-01` | `NFR-C-HARNESS-044-01` | obligation class/contract relationをscope内で全列挙しreuse/delta/new/N/Aを比較。 | uncovered classとsemantic duplicateを個別count、正当closure時のみ両方0。 | N/A根拠やclass meaning unknownなら未評価。document countだけで判定しない。 |
| `CASE-HARNESS-L10-NFR-046-01` | `NFR-C-HARNESS-046-01` | workflow obligation/style/scope/reverse evidenceとScrum applicabilityを比較。 | unmapped applicable obligationと非Scrumへの誤ったScrum条件を別count。 | style/applicability不明は未評価。別styleをScrum扱いしない。 |
| `CASE-HARNESS-L10-NFR-047-01` | `NFR-C-HARNESS-047-01` | muster candidate/role sufficient/unknownをcomparison rationaleとworker/verifier identityで測る。 | 根拠なしmuster、sufficientを無視したmuster、authority conflation各count。 | LABO comparison applicability欠如はunknownでありfailure/benefit 0へ丸めない。 |
| `CASE-HARNESS-L10-NFR-049-01` | `NFR-C-HARNESS-049-01` | fixed L11-049の最小入力、5 check別positive/negative fixture、期待分類を与える。 | 案Aは実測ごとにTP/FP/FN/TN、precision=TP/(TP+FP)、recall=TP/(TP+FN)、適用範囲/未評価を報告し、事前閾値なしでwarning/unknownを保つ。案Bはcalibration結果から候補閾値を置いて別holdoutを測る。両案で初回測定前に数値閾値を決めない。 | 分母0・適用不明・fixture不足は未評価。現草稿は親に合格閾値がないため案Aを推奨し、未評価をpassにしない。生成/Pattern/ID入力を追加必須にしない。 |
| `CASE-HARNESS-L10-NFR-054-01` | `NFR-C-HARNESS-054-01` | typed handoffと同一task/scope/revisionのOS assignment/profile identity、unknown axis変異。 | mismatchとunknown-as-successを別countし、未解決時にhandoff未完のままか確認。 | OS assignment未提示なら未評価。HARNESSの実行率へ読み替えない。 |


### Stage 3 NFRの母集団・追加測定条件

| L10 case ID | NFR候補ID | input/population | oracle・比較候補 | 未評価・戻し |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-034-02` | `NFR-C-HARNESS-034-01` | 034-01の適用metric契約fieldおよび各metric結果stateを要求revision/scope別に記録。 | field presence案と同一source authority/revision/condition/oracle tuple案を比較し、根拠付き候補は後者。targetとerror budget/hard limitは別々に保持し、該当時はDB/projection/継続stateの選択実装に基づくp95/p99/lock/busy/再構築/保守/並行/soak測定を対応させる。各fieldの欠落/stale、未測定、非代表、未達、error budget/hard-limit超過を個別変異する。 | 13 domainやAI適用条件の分母を選択で狭めない。分母0は率なし、適用性unknownは未評価。該当metric owner、測定環境 ownerへ戻す。 |
| `CASE-HARNESS-L10-NFR-036-02` | `NFR-C-HARNESS-036-01` | 四cross-detection axis別のplanned requirement/view set、screen applicability、local/CI gate snapshots、およびKPI対象期間・母集団を分ける。 | 各軸の未検出、local/CI mismatch、screen五軸それぞれのmissing/failを独立に測る。運用KPIは分子/分母/期間を表示し、90%候補との比較だけ行う。 | applicability unknownや母集団不明を0として扱わず未評価。KPIでticket-level failureを相殺しない。 |
| `CASE-HARNESS-L10-NFR-038-02` | `NFR-C-HARNESS-038-01` | 全selected capability identity/count manifest、source atom relation、endpoint/obligation per-stage set。 | set equality、unique IDs、forward/reverse edge、per-stage outstanding obligationsを個別に測る。初期要求形成成立と後続完了claimを別stateに記録する。 | unsupported/unknownとbudget/checkpoint残義務は未完で分母から除外しない。未選択は未観測として別記。 |
| `CASE-HARNESS-L10-NFR-039-02` | `NFR-C-HARNESS-039-01` | Experience graph、selected screen relations、7 UX evidence axis、scope/revision/currentnessをplanned setにする。 | each axisのcurrent evidence coverage候補100%はUX完了claimに限る。各missing/stale/unknownを独立変異し、UI N/Aを拒否する。 | future measurement未完はcandidate start gateにせず、UX completionのみ未完。対象母集団0は率なし。 |
| `CASE-HARNESS-L10-NFR-040-02` | `NFR-C-HARNESS-040-01` | 12 ledger contract fields、6 pair edges、L0 independent anchor fieldsとsource snapshot population。 | selected catalog relation欠落・片edge・staleを各別計上。snapshot coverageと未完/stale populationを明示する。 | OS保存が未構築でもHARNESSの意味oracleを代替しない。未提示契約は未完/unknown。 |
| `CASE-HARNESS-L10-NFR-041-02` | `NFR-C-HARNESS-041-01` | adopted base obligationsと後続-003追加split/merge obligations、同一input/extractor revision/digest。 | atomic mapping欠落・false same-digest・split/merge lossを別測定し、same-input/extractor semantic digest一致候補を比較する。 | 未選択templateは未観測、別revisionは別母集団。方式/時間thresholdを作らない。 |
| `CASE-HARNESS-L10-NFR-042-02` | `NFR-C-HARNESS-042-01` | semantic/consumer/oracle/dependency evidenceとroute rationale; feature-addition episodeは別population。 | candidate evidence completenessと誤routeを個別計上する。 | missing owner/sourceはunknown。performance幅は016選択時のみ。 |
| `CASE-HARNESS-L10-NFR-043-02` | `NFR-C-HARNESS-043-01` | adopted B/CORE routeのselected rule/branch分母、positive/boundary-negative/risk-justified case relation。 | branch別required pair trace欠落候補0。branch・oracle・risk根拠を1つずつ欠落する。 | 適用branch unknownは未評価であり0分母へ落とさない。 |
| `CASE-HARNESS-L10-NFR-044-02` | `NFR-C-HARNESS-044-01` | adopted B/Design Contract Portfolioのselected classes、reuse/delta/new/N-A basis、contract relations。 | uncovered class、unexplained semantic duplicate、orphan oracleを別々に測定する。 | 025/043出力だけではcoverage成立しない。owner/meaning unknownは未評価。 |
| `CASE-HARNESS-L10-NFR-046-02` | `NFR-C-HARNESS-046-01` | Full V applicable workflow populationと別のselected Scrum scope/trigger/pair set。 | applicable unmapped relation candidate 0、非Scrumへ誤適用されたScrum duty 0を別計数。 | style/applicability unknownは未評価、他styleを分母へ足さない。 |
| `CASE-HARNESS-L10-NFR-047-02` | `NFR-C-HARNESS-047-01` | comparison outcomes、existing-role sufficiency、12 contract fields、3 trace/evidence fields、LABO applicability state。 | unsubstantiated muster/field omissions/identity-authority conflationを独立計上。 | LABO evidence unknownはunknownのまま; provider/price/benchmark単独をbenefit evidenceにしない。 |
| `CASE-HARNESS-L10-NFR-049-02` | `NFR-C-HARNESS-049-01` | fixed minimum inputsと5 checkごとのactual result/expected class、positive/negative fixture、scope/revision。 | check別TP/FP/FN/TN、precision/recallを報告。案Aはthresholdなしの結果報告、案Bはcalibration後に別holdoutで候補閾値を比較。 | 分母0、適用unknown、fixture不足は未評価。O10 generation routeを決めない。 |
| `CASE-HARNESS-L10-NFR-054-02` | `NFR-C-HARNESS-054-01` | existing OS assignment handoff, task/scope/revision and conditional axis evidence/receipt. | receipt/identity/scope consistencyを測り、revision change dependent evidence staleを別計上。 | axis mapping未決はunknown。assignment/responseはOS ownerへ、HARNESSは実行率を報告しない。 |

planned sample sizeや測定期間が上流に固定されていない場合、候補設計で比較可能性を説明できるsample planを出典付き候補として示し、実測前に初回条件を記録する。統計的境界が判断上必要な場合はL3で根拠・比較案・測定方法・判定境界付き候補を起草して対のL10へ結び、L4へ渡す。parameterごとのPO質問は作らない。measurement evidenceだけで親の状態/owner/versionを変えない。
