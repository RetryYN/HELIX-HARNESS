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
| `CASE-HARNESS-L10-NFR-033-S5-01` | `NFR-C-HARNESS-033-01` | 各選択operationのsource/oracle/reduction/run/result/consumer stepをplanned単位にし、`CASE-HARNESS-L10-033-S5-001`〜`007`および`CASE-HARNESS-L10-033-S5-008`〜`036`を独立観測する。 | 段階別保持率と誤ったregression-claim数を別に計測する。post-fix runが選択されない通常caseでは未測定でありfailure扱いしない。 |
| `CASE-HARNESS-L10-NFR-035-S5-01` | `NFR-C-HARNESS-035-01` | 選択candidateごとにroot source、relation、acceptance contribution、alternative、budget-stateをplanned fieldとして固定し、scope拡張時は複雑さ・外部公開面・運用負債の変更前後測定も各々別fieldとして列挙する。`CASE-HARNESS-L10-035-S5-001`〜`006`および`CASE-HARNESS-L10-035-S5-007`〜`033`を個別集計する。 | root/authority relation保持率とrootless false acceptanceを分ける。budget unknownおよび三観点いずれかの測定欠落はplanned内のunknown/missingとして保持し、0や別観点による相殺へ変換しない。閾値は追加しない。 |
| `CASE-HARNESS-L10-NFR-037-S5-01` | `NFR-C-HARNESS-037-01` | L2-009が二段適用を示すscopeだけでPhase 1/2のL2/L3/design/L9 tupleをplanned集合にする。`CASE-HARNESS-L10-037-S5-001`〜`007`および`CASE-HARNESS-L10-037-S5-008`〜`057`を個別観測し、適用unknown/自己適用は別に記録する。 | phase別保持率と誤流用合流数を別計測する。009 false/unknownのscopeは分母外であり、unknownは非適用へ変換しない。 |

観測状態valid/failed/missing/censoredの件数は排他的に記録し、その合計をplannedへ照合する。意味状態missing/unknown/stale/mismatch/conflict/unselectedは別軸とし、分母から黙って除かない。fixture/source/oracle不足は未評価であり、未実施・未選択は0件の観測または達成ではない。

### Root検収補正 — planned CASE集合の追補

| 親 | 追加CASE集合 | 母集団と状態分類 |
|---|---|---|
| `HARNESS-L2-021` | `CASE-HARNESS-L10-021-S5-001–006` + `CASE-HARNESS-L10-021-S5-007–016` | E2E trace、統合update/rollback、L12 observation/return、LABO/OS責務を独立planned obligationにし、source/revision/scopeとrelease/operation stateを分ける。 |
| `HARNESS-L2-025` | `CASE-HARNESS-L10-025-S5-001–006` + `CASE-HARNESS-L10-025-S5-007–033` | 常時必須tuple、selected Patternのrequired input/relation/version、双方向trace、permission/data/oracle、unit/connection/compositeを別planned obligationにする。nonselected Patternは未観測で分母外。 |
| `HARNESS-L2-033` | `CASE-HARNESS-L10-033-S5-001–007` + `CASE-HARNESS-L10-033-S5-008–036` | source/unit/oracle/consumer fieldとstage receiptを分ける。repro、regression claim、修正後pass非選択を別状態にする。 |
| `HARNESS-L2-035` | `CASE-HARNESS-L10-035-S5-001–006` + `CASE-HARNESS-L10-035-S5-007–033` | root source、authority/revision、non-goal/scope、acceptance contribution、necessity/alternative、budgetをfield単独planned化しunknown/stale/mismatchを分母に保持。 |
| `HARNESS-L2-037` | `CASE-HARNESS-L10-037-S5-001–007` + `CASE-HARNESS-L10-037-S5-008–057` | 009 applicability、各phaseのL2/L3 authority、template、022 oracle/state、L4/L9、handoff、UI選択/非選択を別 obligationにする。nonselected operationは未観測。 |

100% trace coverageと誤ったsuccess/merge/authority 0件は静的分類の技術候補であり、実測ではない。planned denominatorを個別CASE集合で固定する。観測状態valid/failed/missing/censoredと意味状態missing/unknown/stale/mismatch/conflict/unselectedを分離する。分母不明を0へ変換せず、未実行は未測定とする。数値SLO・CI実行・性能測定は作らない。
