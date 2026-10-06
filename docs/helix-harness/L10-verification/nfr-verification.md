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
| `CASE-HARNESS-L10-NFR-012-01` | `NFR-C-HARNESS-012-01` | 選択対象ごとにPrototype/PoC適用判定、各outcome、revision/scope/source、Backflow traceと、非適用時の5固定fieldをplanned obligationとして列挙する。正常、非適用記録、Prototype/PoC混同、Decide前promotionを含む上記functional caseの結果と照合する。 | 必須outcome/traceの保持率候補100%、非適用field欠落0、Prototype/PoC誤分類0、Decide前production昇格0を数える。全項目は同じ対象revision/scopeへ結び付ける。 | source/applicability oracle不足は未評価。固定件数、成功率、回数、prototype usability/性能SLOを追加しない。分母0は率なし。 |
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

## Stage 4 suffix — HARNESS-L2-026/027/028/029候補の測定設計

設計のみで、実測結果や達成を表さない。planned obligationを事前に固定し、観測状態（valid/failed/missing/censored）と意味状態（valid/missing/unknown/stale/mismatch/conflict/unsupported/unselected）を別軸で保持する。未選択は未観測、分母0は率なし、oracle不足は未評価とする。planned母集団の状態合計を落とさない。

| L10 case ID | L3 NFR候補 | 入力・比較 | 観測oracle・失敗境界 |
|---|---|---|---|
| `CASE-HARNESS-L10-NFR-026-01` | `NFR-C-HARNESS-026-01` | 固定要求/template義務/CORE/BRAIN connector/設計要素/対oracleの適用scopeをplanned relation setへ列挙し、CASE-HARNESS-L10-026-01〜62（分割撤去した026-15は除く）を必要に応じfixtureとして使う。Pattern選択有無、UI/non-UI、014 receipt有無、026交換状態、unit/connection/composite結果を別々にする。 | 必要relationのsource/revision/scopeと内容oracle一致候補を測定。Pattern未選択をmissingと数えず、014 completion receiptなしの成立を許す。分母、template、oracleが未確定なら未評価。 |
| `CASE-HARNESS-L10-NFR-027-01` | `NFR-C-HARNESS-027-01` | 選択された各sourceについてidentity/revision/digest/scope/read permission、source span、type/parser dispositionをplanned fieldとして固定し、CASE-HARNESS-L10-027-01〜24とCASE-HARNESS-L10-027-25〜48を用い、019 input/result identity mismatchも別field状態で残す。 | source tuple/span保持候補、unsupported/unknown状態の誤分類数を別に集計。未選択sourceは母集団外かつ未観測、source/schema/oracle不足は未評価。runtime実測・処理速度を測らない。 |
| `CASE-HARNESS-L10-NFR-028-01` | `NFR-C-HARNESS-028-01` | 同一product/scopeで027 receipt、saved design/requirement revision/authority、known relation、affected setをplanned tupleにし、revision/relationを一項目ずつ変異する。exact-revision receipt、receipt欠落、別revision receipt、baseline不一致、選択operation contract欠落を別fixtureにする。CASE-HARNESS-L10-028-19〜45を用い、039〜041で019境界/read authorization/data-use、042〜045で所有/通信/サービス組合せ境界を各々照合する。 | exact known edgeのtrace保持とunknown edgeの保持を測る。類似名/pathでaffected/unaffectedを決めない。receipt欠落または対象revision不一致を別状態とし、approvedへ数えない。未表現関係はunknown。 |
| `CASE-HARNESS-L10-NFR-029-01` | `NFR-C-HARNESS-029-01` | 029五要素を個別planned obligationとして分類し、API repair/data migrationの選択・非選択、各source/owner/revision/compatibility条件とCASE-HARNESS-L10-029-25〜67（分割撤去した029-48は除く）のfield別fixtureを独立に比較する。 | 選択済み要素のtrace保持、未選択operationを強制する件数、proposalを実行/承認へ昇格する件数を別集計。五要素を一つのcoverage値で相殺しない。適用source/oracleなしは未評価。 |

全率の分子・分母は対象revision/scopeに対する事前planned集合から数え、missing/unknown/stale/mismatch/unsupportedを分母から黙って除かない。各候補値はtrace完全性・誤分類防止の比較候補であり、固定親にない性能SLA、処理時間、閾値を加えない。

## Stage 2b 残件追補 — HARNESS-L2-017/018/019/020/024

本追補5親は未承認の起草。既承認prefixを変更せず、実行結果や下流許可を生成しない。

| NFR CASE ID | NFR候補 | 入力／比較 | 観測oracle | 限界 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-017-01` | `NFR-C-HARNESS-017-01` | `CASE-HARNESS-L10-017-R001`〜`CASE-HARNESS-L10-017-R020`の各単独fixture、同じL3 ACとinput revisionを対応づける。 | NFR候補の不適格成立・欠落・誤昇格・不一致件数を対象fixture内で計数する。同じinputを再評価する場合は出力identity/理由/stateの差分を照合する。 | fixture/oracle不足は未評価。分母不明を0とせず、候補値から実測達成・承認・全製品品質を生成しない。 |
| `CASE-HARNESS-L10-NFR-018-01` | `NFR-C-HARNESS-018-01` | `CASE-HARNESS-L10-018-R001`〜`CASE-HARNESS-L10-018-R058`の各単独fixture、同じL3 ACとinput revisionを対応づける。 | NFR候補の不適格成立・欠落・誤昇格・不一致件数を対象fixture内で計数する。同じinputを再評価する場合は出力identity/理由/stateの差分を照合する。 | fixture/oracle不足は未評価。分母不明を0とせず、候補値から実測達成・承認・全製品品質を生成しない。 |
| `CASE-HARNESS-L10-NFR-019-01` | `NFR-C-HARNESS-019-01` | `CASE-HARNESS-L10-019-R001`〜`CASE-HARNESS-L10-019-R024`の各単独fixture、同じL3 ACとinput revisionを対応づける。 | NFR候補の不適格成立・欠落・誤昇格・不一致件数を対象fixture内で計数する。同じinputを再評価する場合は出力identity/理由/stateの差分を照合する。 | fixture/oracle不足は未評価。分母不明を0とせず、候補値から実測達成・承認・全製品品質を生成しない。 |
| `CASE-HARNESS-L10-NFR-020-01` | `NFR-C-HARNESS-020-01` | `CASE-HARNESS-L10-020-R001`〜`CASE-HARNESS-L10-020-R023`の各単独fixture、同じL3 ACとinput revisionを対応づける。 | NFR候補の不適格成立・欠落・誤昇格・不一致件数を対象fixture内で計数する。同じinputを再評価する場合は出力identity/理由/stateの差分を照合する。 | fixture/oracle不足は未評価。分母不明を0とせず、候補値から実測達成・承認・全製品品質を生成しない。 |
| `CASE-HARNESS-L10-NFR-024-01` | `NFR-C-HARNESS-024-01` | `CASE-HARNESS-L10-024-R001`〜`CASE-HARNESS-L10-024-R095`の各単独fixture、同じL3 ACとinput revisionを対応づける。 | NFR候補の不適格成立・欠落・誤昇格・不一致件数を対象fixture内で計数する。同じinputを再評価する場合は出力identity/理由/stateの差分を照合する。 | fixture/oracle不足は未評価。分母不明を0とせず、候補値から実測達成・承認・全製品品質を生成しない。 |

018の製品固有値はowner要求の範囲でのみ測定し、quality/SLO/対象環境/RTO/RPO/保持期間/予算を全製品へ共通固定しない。024の質問量・訂正率・必須見逃しは同じ／未見fixtureの別母集団として併記し、未観測を0にしない。PoC Backflowのfailure/timeout状態とowner/re-entry欠落は各一つの独立fixtureとして含める。

## Stage 5 suffix — HARNESS-L2-021/025/033/035/037 NFR測定CASE

候補値は設計のみで未実測。分母・観測状態・意味状態を事前に分類し、数値のないfieldを0や成功へ丸めない。次のCASEはfunctional CASE個別群を索引として参照し、CASE行自体を複数mutationの単独検証と誤認しない。

| L10 case ID | L3候補 | 入力・planned母集団 | oracle / 境界 |
|---|---|---|---|
| `CASE-HARNESS-L10-NFR-021-S5-01` | `NFR-C-HARNESS-021-01` | 選択scopeの必須relation tupleを事前登録し、`CASE-HARNESS-L10-021-S5-001`〜`006`および`CASE-HARNESS-L10-021-S5-007`〜`016`の正常・unit-only・trace欠落・版不一致・rollback不一致・運用source状態を個別集計する。 | Nmatched/Nrequired候補を算出し、unit success-only誤claim=0を別計数する。planned denominator 0なら率なし。unit/operation未選択は未観測。 |
| `CASE-HARNESS-L10-NFR-025-S5-01` | `NFR-C-HARNESS-025-01` | 常時必須connector/unit/oracle tupleと、選択された場合だけPattern tupleを別planned集合にする。参照する`CASE-HARNESS-L10-025-S5-001`〜`006`および`CASE-HARNESS-L10-025-S5-007`〜`033`を別行の観測として数える。 | 常時必須と選択時の保持率を別々に算出する。非選択Patternをmissingへ加算しない。connector欠落/Pattern receipt不一致のfalse compatible countを分離する。 |
| `CASE-HARNESS-L10-NFR-033-S5-01` | `NFR-C-HARNESS-033-01` | 各選択operationのsource/oracle/reduction/run/result/consumer stepをplanned単位にし、`CASE-HARNESS-L10-033-S5-001`〜`007`および`CASE-HARNESS-L10-033-S5-008`〜`036`を独立観測する。 | 段階別保持率と誤ったregression-claim数を別に計測する。S5-024/025はS5-005/006を指す索引aliasのため分母へ重ねない。post-fix runが選択されない通常caseでは未測定でありfailure扱いしない。 |
| `CASE-HARNESS-L10-NFR-035-S5-01` | `NFR-C-HARNESS-035-01` | 選択candidateごとにroot source、relation、acceptance contribution、alternative、budget-stateをplanned fieldとして固定し、scope拡張時は複雑さ・外部公開面・運用負債の変更前後測定も各々別fieldとして列挙する。`CASE-HARNESS-L10-035-S5-001`〜`006`および`CASE-HARNESS-L10-035-S5-007`〜`041`を個別集計する。 | root/authority relation保持率とrootless false acceptanceを分ける。budget unknownおよび三観点いずれかの測定欠落はplanned内のunknown/missingとして保持し、0や別観点による相殺へ変換しない。閾値は追加しない。 |
| `CASE-HARNESS-L10-NFR-037-S5-01` | `NFR-C-HARNESS-037-01` | L2-009が二段適用を示すscopeだけでPhase 1/2のL2/L3/design/L9 tupleをplanned集合にする。`CASE-HARNESS-L10-037-S5-001`〜`007`および`CASE-HARNESS-L10-037-S5-008`〜`057`を個別観測し、適用unknown/自己適用は別に記録する。 | phase別保持率と誤流用合流数を別計測する。S5-023はS5-005を指す索引aliasのため分母へ重ねず、S5-006（receipt対Phase 2設計scope）とS5-027（receipt対merge scope）は別条件として計測する。009 false/unknownのscopeは分母外であり、unknownは非適用へ変換しない。 |

観測状態valid/failed/missing/censoredの件数は排他的に記録し、その合計をplannedへ照合する。意味状態missing/unknown/stale/mismatch/conflict/unselectedは別軸とし、分母から黙って除かない。fixture/source/oracle不足は未評価であり、未実施・未選択は0件の観測または達成ではない。

### Root検収補正 — planned CASE集合の追補

| 親 | 追加CASE集合 | 母集団と状態分類 |
|---|---|---|
| `HARNESS-L2-021` | `CASE-HARNESS-L10-021-S5-001–006` + `CASE-HARNESS-L10-021-S5-007–016` | E2E trace、統合update/rollback、L12 observation/return、LABO/OS責務を独立planned obligationにし、source/revision/scopeとrelease/operation stateを分ける。 |
| `HARNESS-L2-025` | `CASE-HARNESS-L10-025-S5-001–006` + `CASE-HARNESS-L10-025-S5-007–035` | 常時必須tuple、selected Patternのrequired input/relation/version、双方向trace、permission/data/oracle、unit/connection/compositeを別planned obligationにする。nonselected Patternは未観測で分母外。 |
| `HARNESS-L2-033` | `CASE-HARNESS-L10-033-S5-001–007` + `CASE-HARNESS-L10-033-S5-008–037` | source/unit/oracle/consumer fieldとstage receiptを分ける。repro、regression claim、修正後pass非選択を別状態にする。 |
| `HARNESS-L2-035` | `CASE-HARNESS-L10-035-S5-001–006` + `CASE-HARNESS-L10-035-S5-007–042` | root source、authority/revision、non-goal/scope、acceptance contribution、necessity/alternative、budgetをfield単独planned化しunknown/stale/mismatchを分母に保持。 |
| `HARNESS-L2-037` | `CASE-HARNESS-L10-037-S5-001–007` + `CASE-HARNESS-L10-037-S5-008–058` | 009 applicability、各phaseのL2/L3 authority、template、022 oracle/state、L4/L9、handoff、UI選択/非選択を別 obligationにする。nonselected operationは未観測。 |

100% trace coverageと誤ったsuccess/merge/authority 0件は静的分類の技術候補であり、実測ではない。planned denominatorを個別CASE集合で固定する。観測状態valid/failed/missing/censoredと意味状態missing/unknown/stale/mismatch/conflict/unselectedを分離する。分母不明を0へ変換せず、未実行は未測定とする。数値SLO・CI実行・性能測定は作らない。

Stage 5の索引aliasは021-S5-011→004、033-S5-024/025→005/006、037-S5-023→005と037-S5-057→053。これら5索引は個別fixture分母へ重複加算しない。

035-S5-033は撤去した旧変異のID保全用時点注記であり、同一変異aliasではない。個別fixture分母から除外し、運用負債欠測の個別変異は035-S5-041だけで評価する。

### Stage 3 NFR候補測定case

各候補は固定parent由来の完全性/不正遷移を測る設計案であり、達成測定ではない。未確定技術閾値は比較候補と実測条件を残し、個別PO parameter gateを作らない。

| L10 case ID | NFR候補 | 入力／比較 | oracle／測定 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-034-01` | `NFR-C-HARNESS-034-01` | 13 quality domainと該当時AI7条件（判断再現性・Worker/verifier独立性・根拠対応・反復停止性・費用・provider縮退・memory汚染耐性）下の全適用metric・全14項目を事前scope母集団にし、field presence案と意味tuple照合案を比較。 | 固定L2/L11の14項目を対応し、metric IDとtarget requirement/NFRのstable identityは区別して照合し、missing/stale/nonrepresentative/unmeasured/failedを別状態で測る。 | 他metric successで相殺しない。固定conditionが適用するmetricを省略して分母を狭めない。applicability unknownは未評価、既知母集団0は率なし。 |
| `CASE-HARNESS-L10-NFR-034-03` | `NFR-C-HARNESS-034-01` | 固定scopeにおけるerror budgetとhard limit、それぞれの適用metric、target、owner、観測結果を同一revisionに記録する。 | error budgetとhard limitの役割を入れ替える独立変異を行い、各固定条件に定められた超過時の結果と照合する。両者を同じ「閾値超過」へ畳まず、未観測と未達も分ける。 | 誤分類は不成立。値や超過時の処理が親にない場合は創作せずunknownを保持し、該当metric ownerへ戻す。 |
| `CASE-HARNESS-L10-NFR-036-01` | `NFR-C-HARNESS-036-01` | selected scopeにおけるdependency leak/contract leak/connection missing/regressionの各cross-detection axis、local/CI gate identity/content/version/scope、screen five-axis条件を母集団とする。 | 四軸の誤検出/見逃しを独立計数し、selected screen five detectorを軸別に記録。gate通過率候補90%以上は別途、selected scopeと期間を示す案を明記する。候補Aはその期間のeligible gate opportunity全件を分母、passを分子とし、missing/failed/censoredは個別状態で残す。候補Bはvalid outcomeだけの観測pass率も並記し、欠測除外による偏りを比較する。release cohort窓と暦期間窓を候補比較し、分子・分母・期間・除外理由を記録して測定可能性を評価する。窓の長さを根拠なく固定せず、個別ticket合否には使わない。 | cross-detection欠落0は親由来の候補。90%はL2由来の運用目標。profile/scope/applicability不明は未評価、全ticket実行率へ読み替えない。 |
| `CASE-HARNESS-L10-NFR-034-04` | `NFR-C-HARNESS-034-01` | 固定scopeで選択したDB/投影/継続state measurement contract、method revision前後の同一metric identity、未見provider/非AI対象を含める。個別条件=`CASE-HARNESS-L10-034-r11-condition-01-missing`〜`CASE-HARNESS-L10-034-r11-condition-11-missing`、method連続性=`CASE-HARNESS-L10-034-r11-result-continuity-after-method-change`、未見provider/非AI正常=`CASE-HARNESS-L10-034-r11-unseen-provider-non-ai-normal`。 | L2/L11で適用する個別計測条件の欠落、method変更後の連続性欠落、未知provider/非AIだけを理由にした拒否を個別に検出する。 | 必要な実測source/oracleが未提示なら未評価。AI固有条件を適用理由なく強制しない。 |
| `CASE-HARNESS-L10-NFR-038-01` | `NFR-C-HARNESS-038-01` | selected source scopeの各適用obligation/endpointのforward・reverse relationと理由付きN/A。 | asymmetric relation/aggregate-only/unjustified N-A/no-finding countを測る。後段未作成はunresolvedとして別count。 | unknownをzeroにしない。全旧source一括走査なし。 |
| `CASE-HARNESS-L10-NFR-038-03` | `NFR-C-HARNESS-038-01` | capability処置の根拠/authority、吸収先、採択状態、共有oracleを別fieldとして与える。根拠なし却下=`CASE-HARNESS-L10-038-r11-reject-without-basis`、吸収先なし=`CASE-HARNESS-L10-038-r11-absorb-without-target`、unknown採択=`CASE-HARNESS-L10-038-r11-unknown-as-adopted`、candidate承認化=`CASE-HARNESS-L10-038-r11-redesign-as-approved`、共有oracle正常=`CASE-HARNESS-L10-038-r11-shared-oracle-normal`。 | 根拠なし却下、吸収先なし、unknownの採択、candidateの承認化を各々測り、共有oracle正常利用も測る。 | authorityまたはsource未提示はunknownとして残す。 |
| `CASE-HARNESS-L10-NFR-039-01` | `NFR-C-HARNESS-039-01` | selected UI/Experience/Frontend relation, screen identity/acceptance pairとbefore-after revision。 | missing/stale/untraced relationを個別countし、未選択FE measurementを039の実測成果に含めない。 | applicability不明は未評価。旧inventory全数を母集団にしない。 |
| `CASE-HARNESS-L10-NFR-040-01` | `NFR-C-HARNESS-040-01` | 12 layer/6 pair/L0 anchor契約候補と双方向edge fixture。 | 欠落layer/pair/anchor relationとone-sided edgeを分けて数える。 | catalog未実装は未完として記録、registration/executionを測定しない。 |
| `CASE-HARNESS-L10-NFR-041-01` | `NFR-C-HARNESS-041-01` | 同じactive template/extractor inputを反復し、1 obligation atom/gap対応を比較。 | atomic obligation coverageとsource/extractor semantic digest再現を測定。 | extractor/scope未固定は未評価。将来版L11や別extractorは混ぜない。 |
| `CASE-HARNESS-L10-NFR-042-01` | `NFR-C-HARNESS-042-01` | candidate routeごとにsemantic, consumer, oracle, dependency evidenceをそろえ、feature additionを別episodeにする。 | successful candidateのevidence missing数と同一episode混載数をcount。 | unknown consumer/oracleは未評価; performance改善量はこのNFRの判定対象外。 |
| `CASE-HARNESS-L10-NFR-043-01` | `NFR-C-HARNESS-043-01` | 適用rule/branchを確定したmatrixへpositive/boundary-negative例をひも付け、各例を個別削除。 | branch別pair coverage欠落を測る。単純例総数はoracleにしない。 | active branch denominatorが不明/staleなら未評価、0件と記録しない。 |
| `CASE-HARNESS-L10-NFR-044-01` | `NFR-C-HARNESS-044-01` | obligation class/contract relationをscope内で全列挙しreuse/delta/new/N/Aを比較。 | uncovered classとsemantic duplicateを個別count、正当closure時のみ両方0。 | N/A根拠やclass meaning unknownなら未評価。document countだけで判定しない。 |
| `CASE-HARNESS-L10-NFR-046-01` | `NFR-C-HARNESS-046-01` | workflow obligation/style/scope/reverse evidenceとScrum applicabilityを比較。 | unmapped applicable obligationと非Scrumへの誤ったScrum条件を別count。 | style/applicability不明は未評価。別styleをScrum扱いしない。 |
| `CASE-HARNESS-L10-NFR-047-01` | `NFR-C-HARNESS-047-01` | muster candidate/role sufficient/unknownをcomparison rationaleとworker/verifier identityで測る。 | 根拠なしmuster、sufficientを無視したmuster、authority conflation各count。 | LABO comparison applicability欠如はunknownでありfailure/benefit 0へ丸めない。 |
| `CASE-HARNESS-L10-NFR-049-01` | `NFR-C-HARNESS-049-01` | fixed L11-049の最小入力、5 check別positive/negative fixture、期待分類を与える。 | 案Aはknown fixtureのtruth label（findingあり/なし）と判定器出力（yes/no）からTP=(あり,yes)、FP=(なし,yes)、FN=(あり,no)、TN=(なし,no)を数え、precision=TP/(TP+FP)、recall=TP/(TP+FN)、適用範囲/未評価をcheck別に報告し、事前閾値なしでwarning/unknownを保つ。各checkの観測fixtureのみを合算し、母数をn=TP+FP+FN+TN、precision分母をTP+FP、recall分母をTP+FNとして明記する。case行の4セルは再現用の各cell fixtureであり製品の最低試行数・合格閾値を新設しない。誤った出力は期待セルとして数えず、誤分類findingにする。案Bはcalibration結果から候補閾値を置いて別holdoutを測る。両案で初回測定前に数値閾値を決めない。 | 分母0・適用不明・fixture不足は未評価。現草稿は親に合格閾値がないため案Aを推奨し、未評価をpassにしない。生成/Pattern/ID入力を追加必須にしない。 |
| `CASE-HARNESS-L10-NFR-054-01` | `NFR-C-HARNESS-054-01` | typed handoffと同一task/scope/revisionのOS assignment/profile identity、unknown axis変異。 | mismatchとunknown-as-successを別countし、未解決時にhandoff未完のままか確認。 | OS assignment未提示なら未評価。HARNESSの実行率へ読み替えない。 |


### Stage 3 NFRの母集団・追加測定条件

| L10 case ID | NFR候補ID | input/population | oracle・比較候補 | 未評価・戻し |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-034-02` | `NFR-C-HARNESS-034-01` | 034-01の適用metric契約fieldおよび各metric結果stateを要求revision/scope別に記録。 | field presence案と同一source authority/revision/condition/oracle tuple案を比較し、根拠付き候補は後者。targetとerror budget/hard limitは別々に保持し、該当時はDB/projection/継続stateの選択実装に基づくp95/p99/lock/busy/再構築/保守/並行/soak測定を対応させる。各fieldの欠落/stale、未測定、非代表、未達、error budget/hard-limit超過を個別変異する。 | 13 domainやAI適用条件の分母を選択で狭めない。分母0は率なし、適用性unknownは未評価。該当metric owner、測定環境 ownerへ戻す。 |
| `CASE-HARNESS-L10-NFR-036-02` | `NFR-C-HARNESS-036-01` | 四cross-detection axis別のplanned requirement/view set、画面適用性、local/CI gate snapshots、およびKPI対象期間・母集団を分ける。 | 各軸の未検出、local/CI mismatch、screen五軸それぞれのmissing/failを独立に測る。運用KPIは分子/分母/期間を表示し、90%候補との比較だけ行う。 | applicability unknownや母集団不明を0として扱わず未評価。KPIでticket-level failureを相殺しない。 |
| `CASE-HARNESS-L10-NFR-038-02` | `NFR-C-HARNESS-038-01` | 全selected capability identity/count manifest、source atom relation、endpoint/obligation per-stage set。 | set equality、unique IDs、forward/reverse edge、per-stage outstanding obligationsを個別に測る。初期要求形成成立と後続完了claimを別stateに記録する。 | unsupported/unknownとbudget/checkpoint残義務は未完で分母から除外しない。未選択は未観測として別記。 |
| `CASE-HARNESS-L10-NFR-039-02` | `NFR-C-HARNESS-039-01` | Experience graph、selected screen relations、7 UX evidence axis、scope/revision/currentnessをplanned setにする。 | each axisのcurrent evidence coverage候補100%はUX完了claimに限る。各missing/stale/unknownを独立変異し、UI N/Aを拒否する。 | future measurement未完はcandidate start gateにせず、UX completionのみ未完。対象母集団0は率なし。 |
| `CASE-HARNESS-L10-NFR-040-02` | `NFR-C-HARNESS-040-01` | L2-040で列挙されたledger contract field、6 pair edges、L0 independent anchor fieldsとsource snapshot population。 | selected catalog relation欠落・片edge・staleを各別計上。snapshot coverageと未完/stale populationを明示する。 | OS保存が未構築でもHARNESSの意味oracleを代替しない。未提示契約は未完/unknown。 |
| `CASE-HARNESS-L10-NFR-041-02` | `NFR-C-HARNESS-041-01` | L2:960/962の原子性、L11:705の対応/各ledger候補行、L11:713のmerge反例、同一入力/抽出器の意味digest。各義務はFV `CASE-HARNESS-L10-041-r09-001`（候補行欠落）、`CASE-HARNESS-L10-041-r04-one-obligation-split`、`CASE-HARNESS-L10-041-r04-two-obligations-merge`、`CASE-HARNESS-L10-041-r04-digest-mismatch`へ個別に対応する。 | 原子対応、候補行欠落、分割/統合による損失、digest不一致を別々に測定し、同一入力/抽出器のdigest一致は別の正常比較とする。 | template/scope unknownは未観測のまま保持する。性能閾値や将来版L11を追加しない。 |
| `CASE-HARNESS-L10-NFR-042-02` | `NFR-C-HARNESS-042-01` | semantic/consumer/oracle/dependency evidenceとroute rationale; feature-addition episodeは別population。 | candidate evidence completenessと誤routeを個別計上する。 | missing owner/sourceはunknown。performance幅は016選択時のみ。 |
| `CASE-HARNESS-L10-NFR-043-02` | `NFR-C-HARNESS-043-01` | 選択scopeのrule/branch分母、positive/boundary-negative/risk関係。positive欠落=`CASE-HARNESS-L10-043-r09-001`、boundary-negative欠落=`CASE-HARNESS-L10-043-r09-002`、branch分母除外=`CASE-HARNESS-L10-043-r09-003`、risk根拠conflict/stale=`CASE-HARNESS-L10-043-r06-risk-basis-conflict`, `CASE-HARNESS-L10-043-r06-risk-basis-stale`、oracle未結合=`CASE-HARNESS-L10-043-r04-oracle-unbound`を各々単独測定する。 | 分母とoracle/risk根拠を別項目で評価し、例数だけで十分性を判定しない。 | 未選択branch・適用unknownは未評価とし0へ置換しない。 |
| `CASE-HARNESS-L10-NFR-044-02` | `NFR-C-HARNESS-044-01` | 選択scope内の義務class、reuse/delta/new/N/A根拠、契約関係。隠されたclass/revision/applicabilityと重複割当・意味重複を`CASE-HARNESS-L10-044-r09-004`、`CASE-HARNESS-L10-044-r09-002`、`CASE-HARNESS-L10-044-r09-003`、`CASE-HARNESS-L10-044-r09-001`、`CASE-HARNESS-L10-044-r04-semantic-duplicate`で個別に測定する。normative contract孤立は`CASE-HARNESS-L10-044-08`、複数契約の境界/理由欠落は`CASE-HARNESS-L10-044-05`へ対応する。 | 未被覆class、隠されたrevision/branch、重複割当、意味重複、孤立normative contract、複数契約境界/理由欠落を別々に測定する。 | 025/043の出力だけではcoverageを確定しない。意味/ownerがunknownなら未評価を維持する。 |
| `CASE-HARNESS-L10-NFR-046-02` | `NFR-C-HARNESS-046-01` | Full Vの適用workflow母集団と、選択Scrum scope/trigger/pair集合を別にする。 | 適用義務relationの未対応候補数と、非ScrumへのScrum義務誤適用数を別々に計数する。 | style/適用性unknownは未評価とし、他styleを分母へ加えない。 |
| `CASE-HARNESS-L10-NFR-047-02` | `NFR-C-HARNESS-047-01` | 比較結果、既存roleの十分性、全contract field、3つのtrace/evidence field、LABO適用状態。 | 根拠のないmuster、field欠落、identityとauthorityの混同を独立計上する。 | LABO evidence unknownはunknownのまま保持し、provider/price/benchmark単独を便益根拠にしない。 |
| `CASE-HARNESS-L10-NFR-049-02` | `NFR-C-HARNESS-049-01` | fixed minimum inputsと5 checkごとのactual result/expected class、positive/negative fixture、scope/revision。 | check別にtruth positive/negative×detected yes/noをTP/FP/FN/TNへ写像し、precision=TP/(TP+FP)、recall=TP/(TP+FN)を報告する。誤出力は期待cellと照合して誤分類findingとし、別cellの正解として数えない。母数n=TP+FP+FN+TN、precision分母TP+FP、recall分母TP+FNをcheck別に示し、0分母は未評価とする。fixture四セルはcase例であり最低試行数・閾値ではない。案Aはthresholdなしの結果報告、案Bはcalibration後に別holdoutで候補閾値を比較。 | 分母0、適用unknown、fixture不足は未評価。O10 generation routeを決めない。 |
| `CASE-HARNESS-L10-NFR-054-02` | `NFR-C-HARNESS-054-01` | 既存OS assignmentへのhandoffとtask/scope/revision、および条件付き軸のevidence/receipt。 | receipt/identity/scopeの整合性を測定し、revision変更による依存evidenceのstaleは別に計上する。 | 軸mapping未決はunknownとして保持する。assignment/responseは既存OS assignment契約へ返し、HARNESSの実行率として報告しない。 |

planned sample sizeや測定期間が上流に固定されていない場合、候補設計で比較可能性を説明できるsample planを出典付き候補として示し、実測前に初回条件を記録する。統計的境界が判断上必要な場合はL3で根拠・比較案・測定方法・判定境界付き候補を起草して対のL10へ結び、L4へ渡す。parameterごとのPO質問は作らない。measurement evidenceだけで親の状態/owner/versionを変えない。


### Stage 3 共通測定候補の観測母集団

90% gate通過率はL2-036の運用目標であり、ticket別合否ではない。測定案はselected scopeと対象期間を固定したうえでeligible gate opportunity全件を分母、passを分子とする方法と、valid outcomeだけの観測率を併記して欠測による偏りを比較する方法を候補にする。暦期間窓とrelease cohort窓も比較し、期間・分子・分母・除外根拠を記録する。期間長や対象母集団値を親にない定数として固定しない。分母0は率なし、対象定義や適用性が不明なら未評価とする。

各率測定ではplanned件数、valid、failed、missing、censoredを観測状態として分離し、観測されたfailed/missing/censoredも件数として保持する。意味状態のmissing/stale/mismatch/unknownは別軸で報告し、欠測を0や成功へ変換しない。実測のない指標だけを未実測と呼ぶ。
