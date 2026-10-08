---
title: "HELIX-INFRASTRUCTURE Stage 1 詳細検証設計"
canonical_vmodel: L1-L12
canonical_layer: L8
canonical_pair: L5
layer: L8
kind: detailed_verification_design
status: draft_candidate
authority_status: approved_parent_design_candidate
freeze_blocking: true
paired_l5: ../L5-detail-design/stage1-infrastructure.md
paired_l5_sha256: 4315697aab2b9eb3045a6f3b8c592879c233a882cd91a65393bbdb636aa43e0d
stage: 1
---

# HELIX-INFRASTRUCTURE Stage 1 詳細検証設計

本書は[対のL5詳細設計](../L5-detail-design/stage1-infrastructure.md)の検証fixtureと期待oracleを定める設計候補である。L4/L9の固定意味・40個のL9 verifier ID、L3/L10の全体pin、親scope、owner境界を維持する。fixtureは合成入力の構造と結果分類を定めるもので、実sourceの存在、物理状態、実行、authority、復旧結果、測定合格を生成しない。

## 1. 固定入力と実施境界

L5本文SHA-256はfrontmatterの`paired_l5_sha256`に固定する。L5が固定するL4 SHA-256は`84756e019c04744ede7825518e4a153f1373260df1b972c5651ade7824ab9dec`、L9 SHA-256は`b83eee2452ec0b41ef23ffd6a3aea3e1374f82dbffc3e8c7bb54908b01ae9d8b`。L4/L9の固定対象はL3/L10六本文全体であり、機能親は`HELIXINFRASTRUCTURE-L2-001`と`HELIXINFRASTRUCTURE-L2-006`の2 identity、L2-005は006の適用復旧義務を読む入力依存に限る。

L4/L9で定義済みの40行は、001の15 verifier、006の19 verifier、NFRの6 verifierから成る。下表はその全IDを一つずつ対応付け、各正常fixtureと単独変異、oracleをL5のcomponent/API境界へ詳細化する。行内の「別fixture」「一つずつ」は、それぞれ独立した入力変異であり、複数欠陥を同時に入れない。

合成fixtureは既存K2 `SubjectRef`/`ResultKey`、K6の読取観測、K3 permission query/check、K5 evidence参照、K7 operation参照を使う既存契約の入力として表す。値、identity、revision、ownerはfixture内だけのデータであり、製品schemaや新しいowner/permission/APIを定義しない。fixtureで使うauthorityは既存型の入力参照として与え、authority記録・可否・有効性をこのpairで作らない。

すべてのcaseで、reader/operation adapter/Worker/CONNECT/SECURITY/OSへの実呼出しは行わない。`prepare_operation_check`等のL5境界は入力の構成と期待値の照合対象であり、対象operationを開始しない。L10の技術候補値もfixtureに与えられたときの比較条件であって、実測値、実装値、SLO、L3追加承認ではない。

## 2. 共通fixtureと状態判定

| fixture family | 正常入力 | 単独変異の形 | 期待状態と戻し先 |
|---|---|---|---|
| source-qualified resource | 固定scopeのresource identity、environment、値または明示unknown、source/revisionを揃えた読取観測 | field欠落、identity重複、異environment、source revisionの差、read failureをそれぞれ別にする | 完全scopeの読取で確認した欠落だけをmissingとして扱う。読取不能/部分更新/owner不明はK1 `Unknown`または`Unobserved`。旧値をcurrentとせず、resource sourceまたはCORE設計ownerへ返す。 |
| path/storage projection | logical CONNECT reference、各physical path、storage、recovery refを別identity・source/revisionで与える | 8 path軸または6 storage属性のうち一つだけ欠落/不一致、同名identityの誤併合を別々にする | 欠落は補完せずunknown。logical path意味はCONNECT、security boundaryはSECURITY、resource fieldは宣言source ownerへ戻す。 |
| operation eligibility | 5つの既存operation kindから一つ、対象参照、action、revision、scope、別SECURITY authority ref、expiry、適用義務refを与える | 欠落/不一致条件は一回に一つだけ変える。通常operation authority、resource `ready`、OS ticketを別authorityに代用する変異も独立させる | K3の既存checkに従う期待だけを照合する。入力不足/unknownは該当operationのみ非肯定であり、Workerや物理操作を呼ばない。SECURITY/OS/該当source ownerへ戻す。 |
| operation/evidence state | K5/K7の既存参照を持つnormal、refused、failed、partial、unknown結果を各々別fixtureにする | 旧revisionのsuccessによる上書き、義務消去、health observationからのstate changeを別々にする | 結果・eligible revision・未完義務を分離。部分/失敗/unknownを成功化せず、他operationへ保留を広げない。 |
| NFR measurement | 宣言fixture内の分母、個別予定項目、candidate parameter、source/revision | 数値、回数、遅延、欠落、未観測を個別に変える | 可観測性とoracle一致を分離し、unknownを分母から除かない。分母0は率なし、適用scope不明は分母不明、未実行は未測定。 |

K1結果は共通kernelで既に定義された値型と理由だけで表す。`missing`は完全読取が示す欠落に限り、owner/ref/scope/readが未解決なら`Unknown`/`Unobserved`、異なるcurrent sourceやdigestの競合は既存契約に従う。K5/K6 receiptは読取範囲の証拠であり物理適用や成功そのものではない。

## 3. INFRA-001 fixture展開（15 verifier）

| L9 verifier ID / L10 case | 正常fixtureと単独変異 | 期待oracle・責務境界 |
|---|---|---|
| `IV-INFRA-001-01` / `L10-INFRA-001-C01` | environment別の複数機構resourceとWorker/Model Runtime、database/queue/artifact/evidence/log/metric storeを別identityで与える。各resourceのrole/environment/location/version/dependency/lifecycle stateを一度に一属性ずつ欠落させる。 | 各identityと7属性のvalue-or-unknown、source/revisionが保たれる。重複/不明identityを補完しない。Model/Worker能力、ticket、SECURITY policyはINFRA projectionに入らない。 |
| `IV-INFRA-001-02` / `L10-INFRA-001-C02` | stagingとproductionに同表示名・異identityのresourceを置く。cross-environment結合を単一変異とし、scope/authority/source/config/network/credential scope/dataの8軸の不一致およびlocation/version/dependency欠落は一つずつ別fixtureにする。 | identityをまたぐ結合は不成立。軸ごとのunknown/mismatchを保持し、他environmentをcurrent成功にしない。CORE設計またはresource source ownerへ戻す。 |
| `IV-INFRA-001-03` / `L10-INFRA-001-C03` | 宣言scopeに契約適合する未見resource role、続いて未見recovery environmentを個別に追加する。 | 未見だけでは拒否せず宣言された7属性/source/environmentを扱う。固定role fallbackや既定値なし。 |
| `IV-INFRA-001-04` / `L10-INFRA-001-C04` | owner/location/dependencyがunknownなresourceを与え、返却owner既知とowner自体unknownを分ける。 | owner既知なら該当resource source/CORE設計ownerへの返却を保持。返却先不明はunknownと未完範囲のまま。利用可能へ昇格しない。 |
| `IV-INFRA-001-05` / `L10-INFRA-001-C05` | CONNECT logical identityと一つのphysical pathを別refとして与え、source/destination/protocol/endpoint/direction/purpose/security boundary/dependencyを持たせる。 | 8 path軸とlogical refが別々に追跡される。logical IDからphysical routeを合成しない。 |
| `IV-INFRA-001-06` / `L10-INFRA-001-C06` | 8 path軸それぞれの正常fixtureを用意し、各fixtureで一軸だけを欠落。logical IDだけの入力も独立fixtureにする。 | 該当軸または実pathはunknown。残りの軸を保持し、logical IDで穴埋めしない。CONNECT/宣言source ownerへ戻す。 |
| `IV-INFRA-001-07` / `L10-INFRA-001-C07` | 未見protocol値を持つpathと、一つのlogical connectionに結びつく複数physical pathを宣言する。 | protocol値をそのまま保持しpath別8軸を照合。新protocolをallowlist化せず通信許可を出さない。 |
| `IV-INFRA-001-08` / `L10-INFRA-001-C08` | CONNECT宣言にないroute、security boundary ownerの不一致をそれぞれ独立に与える。 | 観測値と不一致を保持し、routeの論理契約はCONNECT、security boundaryはSECURITY、実体sourceは宣言ownerへ戻す。 |
| `IV-INFRA-001-09` / `L10-INFRA-001-C09` | persistent database/evidence storeとtemporary cache/queueを分離し、owner/durability/backup/retention/environment/confidentiality、recovery ref、対象resource/runtime属性をsource付きで与える。 | persistent/temporary identityとstorage 6属性/recovery refを別々に保持。scope内resource/runtimeだけをsource/revisionへ結ぶ。能力・ticket・authorityを生成しない。 |
| `IV-INFRA-001-10` / `L10-INFRA-001-C10` | temporary/persistent混同、retention欠落、owner欠落、confidentiality欠落、runtime version/endpoint欠落を個別fixtureにする。 | 各欠落をunknownとして保持。temporaryをpersistent backup/recoveryとみなさず、runtime値も補完しない。該当ownerへ返す。 |
| `IV-INFRA-001-11` / `L10-INFRA-001-C11` | Model Runtimeを含まない宣言scopeと、新しいModel Runtimeを含むscopeをそれぞれ完全読取のfixtureとして与える。 | scope外runtimeを仮定しない。scope内では列挙fieldとunknownを列挙し、実runtime稼働を宣言から肯定しない。 |
| `IV-INFRA-001-12` / `L10-INFRA-001-C12` | SECURITY classificationとstorage observationの不一致、OS ticketとresource stateの不一致を別fixtureにする。 | INFRAはclassification/ticketを裁定しない。不一致を各SECURITY/OS ownerへ返し、resource observationを上書きしない。 |
| `IV-INFRA-001-13` / `L10-INFRA-001-C13` | `prod-green-02`/`resource-green-02`、7属性、`inventory-fixture-02` revision `rev-02`を揃え、stagingには同名異identityのresourceを置く。 | production側source/revisionとの一致だけを記録し、stagingの値を結合しない。 |
| `IV-INFRA-001-14` / `L10-INFRA-001-C14` | 既知値に対するlocation読取不能、version読取不能、部分更新中断をそれぞれ単独発生させる。 | 以前の観測は古いsource/revisionとして残しcurrent値へしない。読取不能/未完範囲を示すK1非肯定となる。 |
| `IV-INFRA-001-15` / `L10-INFRA-001-C15` | `lifecycle=ready`だけを持つ入力と`environment=production`だけを持つ入力を別々に与え、両方ともauthority/operation許可への射影を試すfixtureとする。 | どちらからもauthority/許可が作られない。観測stateのみ保持し、authority条件は別sourceのまま。 |

## 4. INFRA-006 fixture展開（19 verifier）

以下はoperationの適格性・結果参照を合成入力で照合するfixture設計であり、operation実行fixtureではない。5 operationを表す入力kindは固定L2/L3/L10どおりで、一覧外のkindは既存境界で非肯定となる。

| L9 verifier ID / L10 case | 正常fixtureと単独変異 | 期待oracle・責務境界 |
|---|---|---|
| `IV-INFRA-006-01` / `L10-INFRA-006-C01` | HELIX/OS control plane応答をfixture入力から除き、bootstrapのtarget/action/revision/scope/別authority/expiryを一つずつ一致させ、独立path refを与える。 | 6条件とpathの入力照合だけが成立し、bootstrapのoperation request eligibilityのみを示す。実行を始めず、fixture外のpathを証明しない。 |
| `IV-INFRA-006-02` / `L10-INFRA-006-C02` | 固定5 kindの各々について、authority missing/unknown/expired/out-of-scope、target mismatch、revision mismatch、credential scope unknown、policy unknownを一変異ずつ独立に作る。 | 各fixtureで該当operationのeligibilityは非肯定。reason/ownerを保持し、通常authority等で補完しない。実operation/Worker呼出しは0。 |
| `IV-INFRA-006-03` / `L10-INFRA-006-C03` | 宣言済みrecovery resource内に未見個体、次に適用scope内の未見revisionをそれぞれ与える。 | 未見だけで拒否しない。入力された各resource/authorityを照合し、未登録/unknown authorityは利用可能と推定しない。 |
| `IV-INFRA-006-04` / `L10-INFRA-006-C04` | authority/resource owner revision conflict、independent path owner unknown、authority owner unknownをそれぞれ個別に与える。 | 対象operationだけ非肯定。authorityはSECURITY、resource/pathは対応source ownerへ返す。owner不明を循環的に自己解決しない。 |
| `IV-INFRA-006-05` / `L10-INFRA-006-C05` | health-check kindと対象resourceのread-only observation refを与え、state-changing requestは存在しない正常fixtureにする。 | health observationだけを記録する期待。state-changing actionを呼ばず、service-wide healthを作らない。 |
| `IV-INFRA-006-06` / `L10-INFRA-006-C06` | service-stop kind、対象scope、別authority ref、前提/結果refを整えた合成入力を与える。 | 対象operationのfixture照合のみ。OS停止時の唯一routeが停止中OSなら独立経路条件は非肯定（IV-006-16）。実停止なし。 |
| `IV-INFRA-006-07` / `L10-INFRA-006-C07` | rollback kindについて、適用されるL2-005義務参照、target revision、別authority refを揃え、duty欠落を別fixtureにする。 | duty/target/authorityの照合を分離。該当義務がunknown/未充足の入力ではrollback eligibilityを肯定しない。read-only kindへdutyを広げない。 |
| `IV-INFRA-006-08` / `L10-INFRA-006-C08` | recovery kindと該当L2-005 duty/refを与え、result/unfinished duty参照を別々に持たせる。 | recovery用結果と未完義務をoperation identityへ関連付けるfixture oracle。実recoveryを開始しない。 |
| `IV-INFRA-006-09` / `L10-INFRA-006-C09` | 同一operation keyに対するnormal completion、partial result、failureを三つの独立入力fixtureで与える。 | K5/K7既存stateを区別し、eligible revisionと未完義務を保持。正常結果fixture以外をsuccessへ丸めない。 |
| `IV-INFRA-006-10` / `L10-INFRA-006-C10` | partial result後に古いrevisionのsuccess observationを追加し、current上書きだけを試す。 | 古いsuccessはcurrentにならず、最後のeligible revisionと未完義務が残る。 |
| `IV-INFRA-006-11` / `L10-INFRA-006-C11` | 未見recovery resource IDと未見operation orderを別fixtureにして、各々他の適用条件は満たす。 | 秒数・固定順序を要求せずsource付きlineage/state/dutyを保持。未見だけで失敗にしない。 |
| `IV-INFRA-006-12` / `L10-INFRA-006-C12` | 同一sourceの相反revisionと、recovery duty owner unknownを別々に与える。 | どちらかを任意選択しない。相反sourceまたは未解決義務の既存非肯定を保持しownerへ返す。 |
| `IV-INFRA-006-13` / `L10-INFRA-006-C13` | 固定5 kind以外の6番目のkindを、target/revision/scopeだけは一致するように与える。 | operation eligibility非肯定、operation request開始なし。未定義kindを既存5 kindへ読み替えない。 |
| `IV-INFRA-006-14` / `L10-INFRA-006-C14` | health-check observationに加え、そこからservice-stop requestを暗黙生成する単独変異を作る。 | read-only observationのみを残し、別operation authority/refなしの状態変更を生成しない。 |
| `IV-INFRA-006-15` / `L10-INFRA-006-C15` | rollbackに適用されるL2-005 duty一つだけをunknown、別fixtureでは未充足とする。 | rollback eligibilityは非肯定。duty/reasonを該当ownerへ戻し、他operationへ拡張しない。 |
| `IV-INFRA-006-16` / `L10-INFRA-006-C16` | HELIX/OS停止中という合成入力で、service-stopの唯一route refが停止中OSを通るようにする。 | independent path条件は非肯定、requestは実行されない。path/owner不明なら該当範囲unknownで返す。 |
| `IV-INFRA-006-17` / `L10-INFRA-006-C17` | 通常operationには適用するがindependent recoveryには適用されないauthority refだけを与える。 | recovery側eligibilityは非肯定。既存SECURITY authority条件の不足として返し、通常operationの可否を変えない。 |
| `IV-INFRA-006-18` / `L10-INFRA-006-C18` | recovery dutyだけをunknown/未充足にし、rollback dutyは満たす独立fixtureを作る。 | recoveryだけ非肯定。rollback dutyを代替として使わない。 |
| `IV-INFRA-006-19` / `L10-INFRA-006-C19` | 固定5 kindと別authority条件を入力で満たし、fully automatic failoverの入力だけは存在しない。 | failover不在から5 operationの非適格を導かない。failoverを1.0条件にしない。 |

## 5. NFR fixture展開（6 verifier）

NFRは固定L3/L10文書の候補値・比較条件を同一親範囲内で測る設計である。行中の候補値は採択済み要件が定める検証用技術候補であり、採択済み実装値・実測値ではない。全fixtureで母集団は宣言した合成scope内だけに限定し、unknown/未観測を分母から除かない。

| L9 verifier ID / NFR | 正常fixtureと個別変異 | 期待oracle・記録材料 |
|---|---|---|
| `IV-INFRA-NFR-001-01` / `INFRA-NFR-001-01` | 宣言resourceの7属性、environment 8軸、CORE design revision、runtime revisionをsource-qualifiedに揃える。各必須field欠落、environment軸差、runtime revisionとOS stage release identityの混同を一つずつ変える。 | fixture scopeの必須fieldを値またはunknownとsource/revisionへ結ぶ。分母は宣言fixture内の必須field、unknownは除外しない。実環境全数の主張なし。記録はidentity/field別分母、known/unknown、source/revision、不一致・欠落。 |
| `IV-INFRA-NFR-001-02` / `INFRA-NFR-001-02` | path 8軸とstorage 6属性+recovery refを揃え、path/storage各軸を別々に欠落させる。 | 軸単位の欠落/unknownを検出しcomplete扱いしない。記録は軸別状態、environment/source/revision。未見protocol/pathをallowlist化しない。 |
| `IV-INFRA-NFR-001-03` / `INFRA-NFR-001-03` | logical connectionとphysical pathを別identity・referenceで与え、name一致、endpoint一致を別々の誤併合変異にする。 | identity/refの件数と対応を記録し、誤併合候補許容0件を照合する。誤併合を検出しても通信許可を作らずCONNECT/path ownerへ返す。 |
| `IV-INFRA-NFR-006-01` / `INFRA-NFR-006-01` | target/action/revision/scope/別SECURITY authority/expiryの各条件が一致するfixtureから、条件ごとの欠落/mismatch/expiredを独立に変える。通常operationでは有効だが独立recoveryには不適用のauthorityも別fixtureにする。 | 6条件の照合状況、authority identity/revision、requestの非肯定/肯定候補を記録。credential値を含めない。技術候補6/6とinvalid pass 0はfixture上のoracle候補であり実測値ではない。 |
| `IV-INFRA-NFR-006-02` / `INFRA-NFR-006-02` | 5 operationを各々正常fixture、停止中OS/control-plane唯一route、通常authority流用、policy/credential unknownに分ける。第6 operationとfully automatic failover条件化の誤りも別fixtureにする。 | kindごとのfixture coverage候補5/5、route/authority状態、非肯定理由を記録。通常route依存0を照合するが、全自動failoverは条件にも測定対象にも加えない。 |
| `IV-INFRA-NFR-006-03` / `INFRA-NFR-006-03` | health probe候補5秒×3回と比較候補1秒×1回/10秒×5回をfixture入力に置く。応答遅延0/4/6秒、未応答1/2/3回、途中復帰を別々に変える。 | probeごとのelapsed/timeout/count/recovery observationを分けて記録。6秒を5秒以内へ丸めない。3回未応答からservice-wide incident/severityを作らず、owner不明ならunknownでL2-004側へ戻す。SLO/実測合格を生成しない。 |

率は予定単位を分母にする。分母0なら率なし、適用範囲不明なら分母不明、未実行なら未測定である。可観測性、期待oracleとの一致、operation eligibilityは別項目で扱い、候補値から合格や実行実績を導かない。

## 6. business境界、旧sourceの保持点、結果の戻し先

固定L3 businessは対象2親に独立business outcomeを設けず、functional FR/ACを正本とする。固定L10 businessも独立test/oracleなし。L3 business lines 17,19とL10 business line 19のcaseは、機能case参照を保持し、業務成功、incident close、復旧完了、費用・配置の採否を出さない境界として扱う。

L5 §2で全文SHA-256、asset ID、読取行、旧consumer/failure、保持・変更と理由を記録した旧5資産のうち、L9/L8形式・AC traceは`LEGACY-ASSET-F542125805B777D8A56A`から形式だけを再導出し、旧G3/AP-4を置換する。identity/ambiguous target/credential referenceのnegative観点は`LEGACY-ASSET-17C4BF78919578FEBB18`および`LEGACY-ASSET-F46AB11BD14F2C0469F4`の失敗例から再導出するが、provider schema/old permission/oracle/runtimeは置換する。旧plane/topologyと数値は`LEGACY-ASSET-653A097F9C9EE51F6FDD`および`LEGACY-ASSET-235F57A4DC453383E6C7`に照らし持ち込まず、現行resource identity/source/ownerへ再導出する。旧asset statusや旧consumer_refsの空欄は現行実装・承認の根拠にしない。

| 観測されたfixture上の問題 | 既存の戻し先 | caseで保持する非肯定 |
|---|---|---|
| resource identity/field/source/revisionが欠落・不一致 | 宣言済みresource source owner、CORE設計意味ならCORE owner | 元観測、source/revision、unknown/missingの根拠、未完scope |
| logical/physical pathまたはsecurity boundaryが不一致 | CONNECT、SECURITY、宣言済みpath source owner | logical/physical identityの区別、不一致軸、owner不明の範囲 |
| assignment/change stateがoperationに必要だが不明 | 該当operationに対する既存OS assignment/source owner | assignmentはOS入力であり物理適用や実行receiptではない |
| authority/expiry/policy inputが不一致または不明 | SECURITY authority/policy owner | K3既存query/check入力、authority identity/revision、未解決条件。credential値なし |
| L2-005の適用義務が不明/未充足 | 採択済みL2-005の該当義務owner | 影響するstate-changing operationと義務だけを非肯定にする |
| read evidence/ledgerが部分的・損傷 | source owner、共通K5/K6の既存契約 | missingとunreadable/unknownを区別し、部分読取を完全走査にしない |

L4/L9、固定L3/L10、L5/L8は設計物であり、これらのcaseのfixtureは未実行である。未解決owner/source/authorityは影響するoperation/ACだけに残し、Stage全体を止めたりowner/gateを追加したりしない。要求の意味、scope、owner、versionの変更が必要なときだけ既存L2へ戻す。
