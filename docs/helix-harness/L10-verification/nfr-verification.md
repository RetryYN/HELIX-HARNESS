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
| `CASE-HARNESS-L10-NFR-015-01` | `NFR-C-HARNESS-015-01` | frozen design/contract/test、実装artifact revision、CORE工程契約とCORE検証契約それぞれのidentity/revision/scope、Red/Green oracle、双方向trace、選択CI範囲と省略記録をplanned field化しCASE-015群の結果と照合する。両契約の3 fieldずつを別依存として計上し、missing/unknown/stale/mismatchを分母から除かない。 | 独立tuple trace候補100%、oracle不一致の誤pass 0を確認する。Red/Greenをoracleに対応づけ、CI greenは別fieldの実測状態とする。fixture/sourceにない契約schema・owner・結果は未評価/unknownのまま保持する。 | CI運転結果がない場合は未測定。固定CI種別・test数・時間・coverage閾値や契約schema/ownerを設定しない。 |
| `CASE-HARNESS-L10-NFR-016-01` | `NFR-C-HARNESS-016-01` | paired before/after scopeのrequirements/contract/behavior/consumer oracleと、性能を選ぶ場合のbaseline/budget/workload/profile/statistical conditionを列挙。案Aの局所benchmark/変更量と案Bのpaired regression＋比較可能性能観測を比較する。 | 案Bを候補とし、必要oracle/trace保持候補100%、既知回帰/誤Backflow 0、性能測定条件field保持候補100%を状態別に記録する。 | 選択されない性能改善は未測定。具体的改善閾値・環境許容差・SLAは発明しない。oracleや比較可能性が不足すれば未評価。 |
