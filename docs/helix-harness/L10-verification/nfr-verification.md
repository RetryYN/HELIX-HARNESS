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
| `CASE-HARNESS-L10-NFR-024-01` | `NFR-C-HARNESS-024-01` | `CASE-HARNESS-L10-024-R001`〜`CASE-HARNESS-L10-024-R100`の各単独fixture、同じL3 ACとinput revisionを対応づける。 | NFR候補の不適格成立・欠落・誤昇格・不一致件数を対象fixture内で計数する。同じinputを再評価する場合は出力identity/理由/stateの差分を照合する。 | fixture/oracle不足は未評価。分母不明を0とせず、候補値から実測達成・承認・全製品品質を生成しない。 |

018の製品固有値はowner要求の範囲でのみ測定し、quality/SLO/対象環境/RTO/RPO/保持期間/予算を全製品へ共通固定しない。024の質問量・訂正率・必須見逃しは同じ／未見fixtureの別母集団として併記し、未観測を0にしない。PoC Backflowのfailure/timeout状態とowner/re-entry欠落は各一つの独立fixtureとして含める。

## Stage 5 suffix — HARNESS-L2-021/025/033/035/037 NFR測定CASE

候補値は設計のみで未実測。分母・観測状態・意味状態を事前に分類し、数値のないfieldを0や成功へ丸めない。次のCASEはfunctional CASE個別群を索引として参照し、CASE行自体を複数mutationの単独検証と誤認しない。

| L10 case ID | L3候補 | 入力・planned母集団 | oracle / 境界 |
|---|---|---|---|
| `CASE-HARNESS-L10-NFR-021-S5-01` | `NFR-C-HARNESS-021-01` | 選択scopeの必須relation tupleを事前登録し、`CASE-HARNESS-L10-021-S5-001`〜`006`および`CASE-HARNESS-L10-021-S5-007`〜`016`の正常・unit-only・trace欠落・版不一致・rollback不一致・運用source状態を個別集計する。 | Nmatched/Nrequired候補を算出し、unit success-only誤claim=0を別計数する。planned denominator 0なら率なし。unit/operation未選択は未観測。 |
| `CASE-HARNESS-L10-NFR-025-S5-01` | `NFR-C-HARNESS-025-01` | 常時必須connector/unit/oracle tupleと、選択された場合だけPattern tupleを別planned集合にする。参照する`CASE-HARNESS-L10-025-S5-001`〜`006`および`CASE-HARNESS-L10-025-S5-007`〜`041`, `062`〜`063`, `065`〜`066`を別行の観測として数える。 | 常時必須と選択時の保持率を別々に算出する。authority non-generationとknown owner/identity unknownも個別に保持し、非選択Patternをmissingへ加算しない。connector欠落/Pattern receipt不一致のfalse compatible countを分離する。 |
| `CASE-HARNESS-L10-NFR-033-S5-01` | `NFR-C-HARNESS-033-01` | 各選択operationのsource/oracle/reduction/run/result/consumer stepをplanned単位にし、`CASE-HARNESS-L10-033-S5-001`〜`007`および`CASE-HARNESS-L10-033-S5-008`〜`047`を独立観測する。 | 段階別保持率、誤ったregression-claim、test pass/Integrated/Verifiedの誤生成を別に計測する。S5-024/025はS5-005/006を指す索引aliasのため分母へ重ねない。post-fix runが選択されない通常caseでは未測定でありfailure扱いしない。 |
| `CASE-HARNESS-L10-NFR-035-S5-01` | `NFR-C-HARNESS-035-01` | 選択candidateごとにroot source、relation、acceptance contribution、alternative、budget-stateをplanned fieldとして固定し、scope拡張時は複雑さ・外部公開面・運用負債の変更前後測定も各々別fieldとして列挙する。`CASE-HARNESS-L10-035-S5-001`〜`006`、`CASE-HARNESS-L10-035-S5-007`〜`032`および`CASE-HARNESS-L10-035-S5-034`〜`046`を個別集計する。S5-033 tombstoneはplanned母集団から除外する。 | root/authority relation保持率とrootless false acceptanceを分ける。実装許可と実行許可の非生成は別field/fixtureにする。budget unknownおよび三観点いずれかの測定欠落はplanned内のunknown/missingとして保持し、0や別観点による相殺へ変換しない。閾値は追加しない。 |
| `CASE-HARNESS-L10-NFR-037-S5-01` | `NFR-C-HARNESS-037-01` | L2-009が二段適用を示すscopeだけでPhase 1/2のL2/L3/design/L9 tupleをplanned集合にする。`CASE-HARNESS-L10-037-S5-001`〜`007`および`CASE-HARNESS-L10-037-S5-008`〜`064`を個別観測し、適用unknown/自己適用は別に記録する。 | phase別保持率と誤流用合流数を別計測する。承認/許可非生成と根拠・適用限界を個別観測する。S5-023はS5-005を指す索引aliasのため分母へ重ねず、S5-006（receipt対Phase 2設計scope）とS5-027（receipt対merge scope）は別条件として計測する。009 false/unknownのscopeは分母外であり、unknownは非適用へ変換しない。 |

観測状態valid/failed/missing/censoredの件数は排他的に記録し、その合計をplannedへ照合する。意味状態missing/unknown/stale/mismatch/conflict/unselectedは別軸とし、分母から黙って除かない。fixture/source/oracle不足は未評価であり、未実施・未選択は0件の観測または達成ではない。

### Root検収補正 — planned CASE集合の追補

| 親 | 追加CASE集合 | 母集団と状態分類 |
|---|---|---|
| `HARNESS-L2-021` | `CASE-HARNESS-L10-021-S5-001–006` + `CASE-HARNESS-L10-021-S5-007–016` | E2E trace、統合update/rollback、L12 observation/return、LABO/OS責務を独立planned obligationにし、source/revision/scopeとrelease/operation stateを分ける。 |
| `HARNESS-L2-025` | `CASE-HARNESS-L10-025-S5-001–006` + `CASE-HARNESS-L10-025-S5-007–041` + `S5-062–063 + S5-065–066` | 常時必須tuple、selected Patternのrequired input/relation/version、双方向trace、permission/data/oracle、unit/connection/compositeを別planned obligationにする。採択・承認・実装許可/実装済み・利用者受入とowner identity状態を個別観測する。nonselected Patternは未観測で分母外。 |
| `HARNESS-L2-033` | `CASE-HARNESS-L10-033-S5-001–007` + `CASE-HARNESS-L10-033-S5-008–047` | source/unit/oracle/consumer fieldとstage receiptを分ける。repro、regression claim、修正後pass非選択、test pass/Integrated/Verified非生成を別状態にする。 |
| `HARNESS-L2-035` | `CASE-HARNESS-L10-035-S5-001–006` + `CASE-HARNESS-L10-035-S5-007–032` + `CASE-HARNESS-L10-035-S5-034–046` | root source、authority/revision、non-goal/scope、acceptance contribution、necessity/alternative、budgetをfield単独planned化しunknown/stale/mismatchを分母に保持。S5-033 tombstoneはplanned母集団から除外。実装許可と実行許可は別negative。 |
| `HARNESS-L2-037` | `CASE-HARNESS-L10-037-S5-001–007` + `CASE-HARNESS-L10-037-S5-008–064` | 009 applicability、各phaseのL2/L3 authority、template、022 oracle/state、L4/L9、handoff、UI選択/非選択を別 obligationにする。authority non-generationも各状態で個別観測し、nonselected operationは未観測。 |

100% trace coverageと誤ったsuccess/merge/authority 0件は静的分類の技術候補であり、実測ではない。planned denominatorを個別CASE集合で固定する。観測状態valid/failed/missing/censoredと意味状態missing/unknown/stale/mismatch/conflict/unselectedを分離する。分母不明を0へ変換せず、未実行は未測定とする。数値SLO・CI実行・性能測定は作らない。

Stage 5の索引aliasは021-S5-011→004、033-S5-024/025→005/006、037-S5-023→005と037-S5-057→053。これら5索引は個別fixture分母へ重複加算しない。

035-S5-033は撤去した旧変異のID保全用時点注記であり、同一変異aliasではない。個別fixture分母から除外し、運用負債欠測の個別変異は035-S5-041だけで評価する。


## Stage 3 親034の非機能総合検証候補

| CASE / NFR | 母集団条件 | 検証境界 |
|---|---|---|
| `CASE-HARNESS-L10-NFR-034-01` / `NFR-C-HARNESS-034-01` | 適用scopeに選択されたmetricごとのL2-034 14項目とtarget requirement/NFR identity。 | field存在だけでなくsource/revision/scope/oracle tupleを対応させる。分母unknownは0にせず未評価。 |
| `CASE-HARNESS-L10-NFR-034-02` / `NFR-C-HARNESS-034-01` | 同一対象metricのunmeasured/stale/nonrepresentative/unmet状態を個別に保持する。別環境/別revisionの有効結果も元のscope/revisionでは保持する（機能fixture `CASE-HARNESS-L10-034-r21-other-environment-result-does-not-offset` / `CASE-HARNESS-L10-034-r21-other-revision-result-does-not-offset` を参照。これはNV内の独立定義数には加えない）。 | 他metricや別scope/revisionのsuccessで対象metricの未測定を相殺せず、実測のない率や実行結果を生成しない。 |
| `CASE-HARNESS-L10-NFR-034-03` / `NFR-C-HARNESS-034-01` | 条件付き品質領域、AI7および6risk techniqueの選択/理由付き非適用。 | Applicability unknownは未評価。N/Aには選択profile上の根拠を要求し、新しい閾値・method obligationを作らない。 |

NFR CASEは測定candidate分類であり、実測・CI success・performance SLOではない。


## Stage 3 親036のNFR測定CASE

測定候補であり実測ではない。母集団は選択されたticket/profile/scopeと、運用KPIではL3に明示したeligible windowに限る。未選択・未観測・missing/failed/censoredを成功または0へ変換しない。

| L10 case ID | NFR候補 | 入力／母集団 | oracle・限界 |
|---|---|---|---|
| `CASE-HARNESS-L10-NFR-036-01` | `NFR-C-HARNESS-036-01` | selected scope内のW観点、4 cross-detection軸、local/CI selected gate契約と条件付きscreen 5軸を区別して記録する。対応するnormal/negative/index CASEはfunctional verificationの036 tableにあり、索引はfixture分母に重ねない。 | 適用scopeごとに観測状態と意味状態を分けて記録し、unobservedを0へ丸めない。全件実行率やperformance SLOを作らない。 |
| `CASE-HARNESS-L10-NFR-036-02` | `NFR-C-HARNESS-036-02` | NFR-13のKPI D-02について、eligible gate opportunity population、測定window、分子/分母、excluded/missing/failed/censored状態を示す。functional normal fixture `CASE-HARNESS-L10-036-r11-operational-kpi-window-population-normal`は合成9/10例であり固定分母・window長ではない。 | 固定`≥90%`運用目標との比較だけを報告する。ticket-level pass/failへ転用せず、母集団/windowがunknownなら未評価とする。候補windowやcohort比較は技術案であり新しいPO parameter gateを作らない。適用母集団・期間・分母はL3で照合し、KPI D-02の要求意味を変更する場合はL2へ戻しPO判断を求める。その判断前に新しい意味で成立扱いせず、要求意味の変更と技術候補の比較を区別する。 |

## Stage 3 親038のNFR測定CASE

| L10 case ID | NFR候補 | 入力／母集団 | 独立変異 | oracle・限界 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-038-01` | `NFR-C-HARNESS-038-01` | selected source scopeの各適用obligation/endpointのforward・reverse relationと理由付きN/A。 | asymmetric relation/aggregate-only/unjustified N-A/no-finding countを測る。後段未作成はunresolvedとして別count。 | unknownをzeroにしない。全旧source一括走査なし。 |
| `CASE-HARNESS-L10-NFR-038-03` | `NFR-C-HARNESS-038-01` | capability処置の根拠/authority、吸収先、採択状態、共有oracleを別fieldとして与える。根拠なし却下=`CASE-HARNESS-L10-038-r11-reject-without-basis`、authority欠落却下=`CASE-HARNESS-L10-038-r17-reject-without-authority`、吸収先なし=`CASE-HARNESS-L10-038-r11-absorb-without-target`、unknown採択=`CASE-HARNESS-L10-038-r11-unknown-as-adopted`、candidate承認化=`CASE-HARNESS-L10-038-r11-redesign-as-approved`、共有oracle正常=`CASE-HARNESS-L10-038-r11-shared-oracle-normal`。 | 根拠だけの欠落（`CASE-HARNESS-L10-038-r11-reject-without-basis`）とauthorityだけの欠落（`CASE-HARNESS-L10-038-r17-reject-without-authority`）、吸収先なし、unknownの採択、candidateの承認化を各々測り、共有oracle正常利用も測る。 | authorityまたはsource未提示はunknownとして残す。 |
| `CASE-HARNESS-L10-NFR-038-02` | `NFR-C-HARNESS-038-01` | 全selected capability identity/count manifest、source atom relation、endpoint/obligation per-stage set。 | set equality、unique IDs、forward/reverse edge、per-stage outstanding obligationsを個別に測る。初期要求形成成立と後続完了claimを別stateに記録する。 | unsupported/unknownとbudget/checkpoint残義務は未完で分母から除外しない。未選択は未観測として別記。 |


## Stage 3 親039のNFR検証

独立NFR measurement CASEは追加しない。UXの7軸current evidenceとhuman evaluationは`functional-verification.md`のAC-02で状態ごとに検証する。実測母集団・閾値・率は固定L2にないため作らず、未知・未観測・missing・staleを成功や0件として扱わない。NFR分類と機能fixtureの定義数を実測結果として報告しない。

## Stage 3 親040の非機能検証

| L10 case ID | NFR候補 | 入力／母集団 | 計測候補 | oracle・限界 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-040-01` | `NFR-C-HARNESS-040-01` | 12 layer/6 pair/L0 anchorの契約候補と双方向edge fixture。 | layer/pair/anchor relationの欠落と片方向edgeを分けて数える。 | catalog未実装は未完として記録、registration/executionは測定しない。 |
| `CASE-HARNESS-L10-NFR-040-02` | `NFR-C-HARNESS-040-01` | L2-040で列挙されたledger contract field、6 pair edges、L0独立anchor fieldsとsource snapshot population。 | selected catalog relation欠落・片edge・staleを各別計上。snapshot coverageと未完/stale populationを明示する。 | OS保存が未構築でもHARNESSの意味oracleを代替しない。未提示契約は未完/unknown。 |

## Stage 3 親042の非機能検証

| CASE ID | NFR候補 | 検証対象 | 観測 | 限界 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-042-01` | 独立NFRなし | 性能refactorを選択した場合のbaseline/budget/workload/profile/statistical condition/regression oracle | HARNESS-L2-016と対L11に固定された入力・oracleが適用可能かを参照する。 | 本候補では数値を設定せず、実測性能受入を再定義しない。 |


## Stage 3 親041のNFR測定CASE

測定候補であり実測ではない。populationは指定active template revisionとselection scopeでsource spanから列挙できるobligationに限定する。missing/unknown applicability、unselected template、extractor unavailable、gapを成功やゼロに変換しない。

| L10 case ID | NFR候補 | 入力／母集団 | oracle・限界 |
|---|---|---|---|
| `CASE-HARNESS-L10-NFR-041-01` | `NFR-C-HARNESS-041-01` | selected template/scopeのsource obligation ID・span・revisionと、atom/typed gap disposition、provenance mismatch、duplicate、unaccounted findingを別々に記録する。 | 各入力義務がatomまたはgapへtraceされたかを候補計測する。unresolved gapは未解決であり成功ではない。unknown applicabilityは009へ戻し母集団からsuccess扱いで除外しない。率・閾値・性能実測を作らない。 |

## Stage 3 親047の非機能検証

| CASE ID | NFR候補 | 検証対象 | 観測 | 限界 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-047-01` | 共通thresholdなし | task適用の利益・既存role比較 | task/scope/revisionと比較evidenceに結ばれた定性的・測定可能な根拠をACで確認する。 | 一律数値、固定team-size、provider/model単独の判定を加えない。OS budget適用とruntime performanceはHARNESS NFRへ移管しない。 |

## Stage 3 親049のNFR測定候補

**採択済み固定親**：PO `po-decision-2026-09-30-live26.md:39,72`の登録`MPR-RC-HARNESS-L2-049-003`。source_repository_revision `ea6f756f96a7370de78e412d737c7a7ed472114a`、L2 `product-requirements.md:1070–1092` SHA-256 `a5df1f7bdca708046ec9ad68e1eea0974884da63205b8995ad45dcd8f0bbc116`、L11 `product-acceptance.md:802–814` SHA-256 `f3fb47da21371084e9f8c7c7f7ca6dd945c8e98ae7c7b70597c3fc44e4e08ee7`。旧318のL11および登録-002を親にしない。

| NFR候補 | 入力・母集団 | oracle・限界 |
|---|---|---|
| `NFR-C-HARNESS-049-01` | 選択scope/revision内のmeasurement rowごとに、screen ID、device/view/locale、profile、oracle/手段版、fixture、結果・evidenceを結ぶ。 | source側に数値性能値がないためthresholdを設けない。missing/unknown/unselectedを成功、0、coverageへ変換しない。 |
| `NFR-C-HARNESS-049-02` | 検査精度はscope適用可能な既知fixtureと期待分類・観測結果の対応を母集団として扱う。 | fixture/candidate/run件数単独でaccuracy成立を作らず、unknown/missing fixture revisionは未評価とする。 |

本表は測定候補であり、実測、performance SLO、検査精度、要求受入を成立させない。

### HELIX-HARNESS L2-044 — NFR総合検証（Stage 3、version_target: 1.0、起草候補）

起草候補。Stage 3、`version_target: 1.0`。POがHARNESS-L2-044に条件付き採択したB route / Design Contract Portfolioを対象とする。この候補はL3承認・実装・実行・個別部品配置・設計成立を表さない。

**固定親・判断根拠**：L2親は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`の `docs/helix-harness/L2-requirements/product-requirements.md:1002–1014`、全file SHA-256 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、span SHA-256 `b005641da8a8dffac0bbddd33b5ef71762f7a9c221fa31b23cb1bb2111e1a26d`。 L11対は同revisionの `docs/helix-harness/L11-acceptance/product-acceptance.md:735–745`、全file SHA-256 `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、span SHA-256 `9c79b73100f4afa63abba7f79d47b8931a1c29983ac08a3e4ded95e56107bfc8`。 PO判断は `17a2f310358ee7fe209b9d37cddf4a927c740248` の `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:49`、SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、line SHA-256 `212948ea669ed647a3a3b188b0efb39a9e2d2fdf020e7be5cd8f088fac79807b`、registration `MPR-RC-HARNESS-L2-044-002`。POはB route / Design Contract Portfolioを条件付き採択し、採択済み025/026へ無断追記しない。

**source・測定境界**：旧起点はHIL-FR-54、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:144`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、line/span SHA-256 `b8c3eb6a8d4e25985f97f95281851e79a0cf6bf6576d3d6a074abdb1df97b070`。旧HIL-FR-55は別要求として043に残り、044へ移さない。 HR-FR-HIL-20/HAT-HIL-20/HOT-HIL-50等のpaired consumerは広い複合要求なので、044へ全量移管したとは扱わない。 この設計は候補NFRをL3のFR/ACと合成fixtureで測る。NFRを重ねて新しい要件にせず、性能・費用・時間・成功率・契約数の閾値を作らない。9-classはfixture母集団の入力条件であってgeneralized thresholdではない。

| 検証ID | NFR候補 | 合成fixture / 比較 | oracle | 未評価・不合格 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-044-01` | `NFR-C-HARNESS-044-01` | 9-classのB0で、各適用classのsource/scope/revision、contract/version、oracle/relationが揃うnormal portfolioと、既存直接fixtureの一つずつのsource/contract/oracle/relation欠落を比較する。全入力は合成である。 | class集合とcoverage outputを集合比較し、uncovered=0が固定された正常条件で成立し、欠落時は該当classを未被覆またはunknownのまま保持するか確認。 | class母集団、scope、source identityまたはoracle不明なら未評価。欠落をclass除外で隠せば不合格。 |
| `CASE-HARNESS-L10-NFR-044-02` | `NFR-C-HARNESS-044-02` | 同一義務classへ一つのnormative contractを割り当てるbaselineと、意味重複契約だけを一件追加する旧直接fixtureを比較する。 | duplicate findingと対象class/contractを列挙し、独立義務を落とさず意味重複0条件を照合。 | duplicate意味oracleが固定できなければ未評価。重複を契約削除で隠せば不合格。 |
| `CASE-HARNESS-L10-NFR-044-03` | `NFR-C-HARNESS-044-03` | candidate stateのB0とauthority output単一変異fixture7件、missing/unknown/stale/conflictの既存fixtureを比較。 | candidateやunknownが承認・採択・実装・実行・利用者受入へ変換されず、unknownを合格にしない。 | authority baselineが未確定なら未評価。既存authorityを推測して生成すれば不合格。 |

**実行限界**：fixtureは設計候補で未実行。full integration、性能、release、L3承認、受入実施を示さない。source pinがcurrent branchで不一致の場合、固定対象revisionとの差として記録し、latest baseの本文をこの測定結果へ混ぜない。

## Stage 3 親043の非機能検証

| CASE ID | NFR候補 | 検証対象 | 観測 | 限界 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-043-01` | 独立NFRなし | fixed L2-043の選択scope内adequacy matrix | 数値性能・coverage率ではなく、適用rule/branchとoracle/risk根拠のtraceを機能ACで確認する。 | 新規閾値やall-combinations実行を設けない。 |

## Stage 3 親046の非機能検証

起草候補。Stage 3、`version_target: 1.0`。対象は採択済みHARNESS-L2-046のFull V workflow条件と、明示的にProduction Scrumが選択・許可されたscopeのScrum slice/backfill条件に限る。候補文書・検証fixtureは採択済みL2/L11本文や運転結果を置換せず、releaseやruntime authorityを付与しない。

**固定親とPO根拠**：親L2は`318ec4a04abb3c1cc17111b3d939f913facd5fd3`の `docs/helix-harness/L2-requirements/product-requirements.md:1025–1035`（全file SHA-256 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、対象span SHA-256 `47cc23b066cc970427a8b9193eda3be9cc06a43f19b7cb03e6f78a0116d6e01e`）。対L11は同revisionの `docs/helix-harness/L11-acceptance/product-acceptance.md:759–771`（全file SHA-256 `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、span SHA-256 `a8e99f7df7166566c04b1113b045851d8417e17e8078c034f8f2a34ebfe4f37f`）。PO判断は `17a2f310358ee7fe209b9d37cddf4a927c740248` の `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:51`、file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、row SHA-256 `60fb90a139b313760ad5a259e2362e3c406e071aa1dfba8ed6d21d0cb9fb55a4`。POは`HARNESS-L2-046`を採択し、registrationは`MPR-RC-HARNESS-L2-046-001`。隣接row 52の`HARNESS-L2-047`は046へ混ぜない。

**source/測定境界**：旧起点はv1.3 `LEGACY-ASSET-02319C2481B9E01698D5`。§4.4 L259はFull Vのsystem workflow/L1–L5段階freezeと12 workflow条件の検証（atom S1）およびProduction Scrumのslice delta先行・Scrum Reverse/backfill時点・SR4前release-ready不可（独立atom S2）を別条件として記述する。§10 L647は両者を要約する別atomで、第三の独立条件に数えない。6fabd125 baselineの同文companionも別revisionとして保持する。旧consumerのUWJ-FR-015とL4 boundaryは確認範囲に限定し、consumer全体網羅は主張しない。 NFR候補をL3機能条件から重複定義せず、synthetic scopeで観測する。時間・成功率・SLA・追加gateは設けない。

| 検証ID | NFR候補 | 入力・比較 | oracle | 未評価・不合格 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-046-01` | `NFR-C-HARNESS-046-01` | Full V B0で12条件のapplicability、L1–L5 freeze、対応V-pair evidenceを固定し、各condition別欠落fixtureと比較する。 | 12 condition identitiesの全てをscope/revision内で列挙し、欠落した条件だけを未完/unknownにする。Full V-specific denominatorにScrum-only obligationsは含めない。 | applicability/oracle unknownは未評価。欠落を別style条件や別scopeの証拠で補えば不合格。 |
| `CASE-HARNESS-L10-NFR-046-02` | `NFR-C-HARNESS-046-02` | Full V selected scopeの適用L1–L5層と段階freeze traceを同revisionで評価。 | 適用層ごとにworkflow revision・freeze evidence・V-pair relationが追跡可能。 | 適用層不明はL2-002/003へ戻しunknown維持。 |
| `CASE-HARNESS-L10-NFR-046-03` | `NFR-C-HARNESS-046-03` | Production Scrumまたは許可合成Scrum inputとFull V-only negative controlを並べ、Scrum側は既存trigger成立・不成立の両方をsource定義に従って評価し、trigger不成立のSR4-missing反例も含める。 | Scrum-specific delta/backfill/checkpoint receiptの適用は既存triggerに従い、Full VではScrum condition適用数0。Production Scrumが選択・合成適用されるscopeのSR4 receipt missing/unknownはtrigger成立有無にかかわらずrelease-ready不可。 | scope selectionまたはtrigger適用条件unknownは未評価。Full VをScrum要求で不合格にすれば不合格。 |

**実行限界**：文書上のoracle candidateのみ。runtime、旧test/CI、L3承認、実行・release結果を検証していない。

## Stage 3 親054の非機能検証：専門Worker判定・契約のOS割当handoff（起草候補、version_target: 1.0）

**採択本文の固定**：PO記録のsource_repository_revision `5aa100319361b0cc86edd3c51815ec777d55410a`。L2 `product-requirements.md:1154–1162` SHA-256 `b76b7b1adec804a25bd9333663aa9b0d074f68518764c2874c994bcdf6ead193`、L11 `product-acceptance.md:865–875` SHA-256 `5d1ab0bad44ae305053932f0c82bcf472e145046125b638f5facab13eaaa2aa0`。旧調査snapshot e94838f5の同本文とbyte一致。末尾空行込みの物理span digestは別の監査pinとして区別する。

**状態と根拠**：本節はHARNESS-L2-054／L11-054の意味をL3要件とL10 oracleへ再導出する起草候補である。POの決定記録 `MPR-RC-HARNESS-L2-054-001` は採択（判断記録revision `b0b0719dfe786370e9bee48c5d2f753710546b6f`、PO row 34）。固定L2/L11本文に残る「未採択候補」は当時の本文メタデータであり、この後のPO決定を覆さない。L2-047は別親で、その既存のmuster判断を受け渡すだけで意味を変更しない。PO-047条件判断や別親の採択を本候補から生成しない。

**旧sourceとの扱い**：旧HIL-BR-09/30、HIL-FR-59/60/61/62/63の対応を起点に、工程・入力・必要性判断・runtime-neutral契約・OS handoffへ責務を再導出する。旧runtime固有projectionや旧TeamDefinition schemaは再利用しない。旧100 CASE IDとraw literalは監査用に保持し、現行fixture条件は固定L2/L11に沿って再導出する。旧source全体、旧runtime/testの実行、旧要件の全件closureを主張しない。HIL-FR-63の歴史的effort defaultは旧sourceにとどめ、1.0の技術値や閾値へ前倒ししない。

**責務とauthority**：HARNESSはprocess/verificationの意味、muster必要性判断、runtime-neutral contract内容と型付きhandoffを所有する。OSは正規のassignment発行者であり、assignment、profile、budget/deadline、lifecycle、実行と結果を既存契約の範囲で所有する。INTELLIGENCEはplacement proposal、LABOはevidenceの適用可能性、SECURITYはoperation authority・制約・隔離を所有する。HARNESSがOS assignmentを発行したりWorkerを起動したりしない。通常の既存roleへのOS assignmentは許される。`existing_role_sufficient`なら追加specialist contractも追加specialist assignmentも生成しない。

**型付きhandoffの候補条件**：対象task/ticket identity、scope、要求/oracle revision、`layer × drive`、process phase、task-kind、verification pattern、design obligation/oracle、domain/risk、judgment-pack revision、single-worker比較条件、適用可能なLABO evidenceと未評価状態を保持する。必要な場合のみINTELLIGENCE proposal、OS profile/budget/deadline/lifecycle、SECURITY authority/制約への参照を結ぶ。`muster_candidate`は契約参照（複数の場合はその全体集合）と対応するinput/output digest、複数参照時の集合digest、generation-rule revision、理由、比較対象/evidence、guard結果を同じscope/revisionに結ぶ。digestの算法、wire format、enum、固定worker数、threshold、TeamDefinition、provider/runtime固有fieldは新設しない。receiptやdigest自体はauthorityではない。

`existing_role_sufficient`は入力にある対象既存role参照と比較根拠を値として返し、両値が同一task/scope/revisionに対応する入力値と一致することを照合する。specialist contractを含めず、既存roleへの通常assignmentはOSが発行する。この分岐から追加specialist assignmentや新規Worker起動を生成しない。`unknown_or_defer`は不足・不確実・staleの条件、既知の責務区分、再照合に必要な入力を入力値に対応させて返し、それぞれが同じtask/scope/revisionに一致することを照合する。既知の責務区分へ個体identityの特定有無にかかわらず不足を返し、個別source identityやowner identityが特定できないときはその個体だけunknownのまま別記する。ownerの新設、値の推定、unknown軸の別軸への畳込みをしない。OS応答/assignmentが欠落、対象不一致、revision不一致または条件不明ならhandoffは未完である。

### 品質検証 `NV-HARNESS-L10-054`

| 品質特性 | 静的oracle確認 | 制限 |
|---|---|---|
| 追跡可能性 | c03でlayer/drive applicability-scopeのsource inputと出力値を項目別照合し、複数時の全参照集合・集合digestも正常照合する。c20–c22はfield単独欠落/集合不一致を拒否し、c04–c07はscope/revision等を照合 | 値は合成fixture source-input。集合digestはalgorithm/wire formatを定義しない |
| authority境界 | c09–c12/c23–c28/c32–c35/c38–c54でassignment、Worker起動、authority、実行許可、security許可、要求採択、L3承認、provider/model差からの独立性推定を独立fieldで拒否。c51–c54は仮登録3出力とhandoff実行許可を単独で拒否 | 実行・承認・security decisionを示さない |
| 証拠の非昇格 | c29–c34/c38–c47でsource/coverage receipt・候補・fixture・OS例から要求採択/L3承認、仮登録・候補本文からWorker起動、証拠存在からoracle実行/合格、runtime projection、assignment、security許可、利用者受入が生成される各fieldを個別拒否 | すべて静的合成fixtureであり、正常入力を既存ownerへ転嫁しない |
| fail-closedな不確実性 | c08/c36/c37に加えc55–c62でlayer/drive applicability-scopeのmissing/stale/conflict/unknownを各field単独で保留 | owner個体が未知ならunknownのまま |
| 既存role境界 | c01/c02でOS既存roleの普通のassignmentを許し、追加specialistだけを拒否 | 比較条件の新閾値を追加しない |

**測定方法**：本candidateでは構造化された合成fixture fieldの静的照合のみを提案する。実測値、性能閾値、環境、toolchain、runtime projection、実行済み結果は定義・主張しない。
