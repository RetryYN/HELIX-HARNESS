---
title: "HELIX-INFRASTRUCTURE Stage 1 結合検証設計"
canonical_vmodel: L1-L12
canonical_layer: L9
canonical_pair: L4
layer: L9
kind: verification_design
status: draft_candidate
authority_status: approved_parent_design_candidate
freeze_blocking: true
paired_l4: ../L4-basic-design/stage1-infrastructure.md
paired_l4_sha256: 84756e019c04744ede7825518e4a153f1373260df1b972c5651ade7824ab9dec
stage: 1
---

# HELIX-INFRASTRUCTURE Stage 1 結合検証設計

本書は[対のL4基本設計](../L4-basic-design/stage1-infrastructure.md)と一体のL9 oracle草稿であり、L3/L10承認、実装試験、実環境の観測、operation実行や合格を示さない。L4の現在のSHA-256はfrontmatterに固定する。固定親、6文書pin、旧source lineage、owner境界はL4 §§「固定対象」「旧HELIX source」「現行共通型」を参照する。

## 実施境界と既存型

fixtureは合成・匿名入力で設計し、credential/PII/external serviceを使わず、archiveの旧test/runtime/CIを実行しない。各caseはsource identity/revision/digest、scope/environment、観測可能なsourceとowner、期待する状態を分けて記録する。物理実体を読むfixture sourceがなければ、宣言データだけで物理的存在・適用・疎通を合格にせず、既存K1の `Unknown` / `Unobserved` を返す。

既存の[common-kernel L9](../../helix-harness/L9-integration-verification/common-kernel-integration-verification.md)のIV-K1/K2/K3/K5/K6/K7/K9/K10を利用する。機構固有の値型を共通カーネルの肯定へ直接読み替えず、現行のK1 `Observed<T>`とK2 key、K3 authority、K5 evidence、K6 read、K7 operation、K9 independent observation、K10 closureの各既存境界を通す。期待値は固定L10のcase条件を下流に具体化したもので、L10 caseの意味を拡張しない。

状態解釈は次のとおり。

| 入力状況 | 期待する分類 | このpairでの扱い |
|---|---|---|
| 必要field/宣言が対象scopeの完全読取で存在しないことを確認 | missing / 該当する既存非肯定 | 欠落を成功・0件・利用可能へしない。 |
| owner/ref/scope/物理観測を解決・読取できない | `Unknown` または `Unobserved` | 以前の観測をcurrentとせず、未完観測範囲を保持し該当ownerへ返す。 |
| 異revision/digest・相反source | `Stale` / `Unknown(conflict)` 等、共通契約に従う | 一方を選ばず全証拠を保持。 |
| assignment/declaration/graphのみ存在 | physical observation未成立 | 実体の存在、適用、疎通、操作成功を推定しない。 |

## INFRA-001機能case oracle

固定L10 functionalのC01–C15はすべて個別のcase identityを保つ。C02/C14/C15等で親L10が列挙した複数のmutationはそれぞれ単独変更として評価し、同じfixtureで同時に変えない。

ここで付ける `IV-INFRA-...` はCI IDgraphから参照するL9 verifier行の一意locatorである。機能行の固定L10 case IDとNFR行のL3 NFR IDは参照値として残し、入力、期待oracle、case数、測定候補、PO保留や承認範囲を変更しない。旧L3/L10の対traceと旧verification caseへの参照を現行の一意な行locatorで表す形式的差分であり、合否・承認gateや追加要件を生成しない。

| L9 verifier ID | 固定L10 case参照 | L3 AC | 入力・単独変異 | 期待されるoracle / 戻し先 |
|---|---|---|---|---|
| `IV-INFRA-001-01` | `L10-INFRA-001-C01` | INFRA-001-AC-01, INFRA-001-AC-02 | HELIX各機構、Worker/Model Runtime（対象scope内の場合）、database/queue/artifact/evidence/log/metric storeをenvironment別に宣言。 | 全identityを別に記録し、7属性を値または明示unknown・source/revisionへ結ぶ。Model/Worker能力・ticket・SECURITY policyをINFRA値へしない。 |
| `IV-INFRA-001-02` | `L10-INFRA-001-C02` | INFRA-001-AC-01, INFRA-001-AC-02 | 同名resourceをstaging/productionで分離するfixtureに対し、cross-environment結合を一度に一つ試す。location/version/dependencyは別fixtureで各単独欠落。scope/authority/source/config/network/credential scope/dataは各々単独でunknownまたは不一致。 | 誤結合を拒否/unknown。欠落はunknownのままresource source/CORE設計ownerへ返す。owner不明ならunknown＋未完範囲。各環境軸で他environmentを成功にしない。 |
| `IV-INFRA-001-03` | `L10-INFRA-001-C03` | INFRA-001-AC-01, INFRA-001-AC-02 | 宣言scope内の未見resource roleとrecovery environmentを追加する。 | 未見だけで拒否せず、契約の属性/source/environmentを列挙。固定role fallbackを使わない。 |
| `IV-INFRA-001-04` | `L10-INFRA-001-C04` | INFRA-001-AC-01 | resource owner/location/dependency unknown。返却先が識別可能なfixtureとowner自体unknownのfixtureを分ける。 | 既知返却先ならresource sourceまたはCORE設計ownerへ戻す。返却先unknownなら成功・利用可能にせず未完範囲を保持。 |
| `IV-INFRA-001-05` | `L10-INFRA-001-C05` | INFRA-001-AC-03 | CONNECT logical identityとphysical pathを別々にし、8 path軸を宣言する。 | logical referenceとpath identity、各8軸を別々に追跡できる。 |
| `IV-INFRA-001-06` | `L10-INFRA-001-C06` | INFRA-001-AC-03 | pathの8軸を一つずつ欠落させる。logical IDだけのfixtureは別case入力にする。 | 欠落軸はunknown。logical IDからroute/physical pathを補わない。 |
| `IV-INFRA-001-07` | `L10-INFRA-001-C07` | INFRA-001-AC-03 | 新protocol名と、同一logical connectionを支える複数physical pathを宣言する。 | 未見protocol値を保持し、pathごとの8軸を観測する。allowlist・送信許可を生成しない。 |
| `IV-INFRA-001-08` | `L10-INFRA-001-C08` | INFRA-001-AC-03 | CONNECT宣言外route、またはsecurity boundary ownerの単独不一致を与える。 | 観測済みstateは保持し、logical contractはCONNECT、security boundaryはSECURITY、解決不能pathはsource ownerへ返す。 |
| `IV-INFRA-001-09` | `L10-INFRA-001-C09` | INFRA-001-AC-04 | persistent database/evidence store、temporary cache/queueを別identityとし、storage 6属性/recovery ref、資源/runtime各fieldをsource付きで与える。 | persistent/temporaryを分離し、6属性/recovery refと対象runtime fieldをenvironment/source/revisionへ結ぶ。能力・ticket・authority出力なし。 |
| `IV-INFRA-001-10` | `L10-INFRA-001-C10` | INFRA-001-AC-04 | temporary/persistent混同、retention/owner/confidentiality欠落、runtime version/endpoint欠落は各々別fixtureにする。 | 欠落はunknown。temporaryからpersistent backup/recoveryを満たしたとせず、runtime値を補完しない。 |
| `IV-INFRA-001-11` | `L10-INFRA-001-C11` | INFRA-001-AC-04 | Model Runtimeを含まないscopeと、新しいModel Runtimeを含むscopeを別々に与える。 | scope外では存在を仮定せず、scope内では全宣言fieldとunknownを列挙。 |
| `IV-INFRA-001-12` | `L10-INFRA-001-C12` | INFRA-001-AC-04 | SECURITY classificationとINFRA storage observationの矛盾、またはOS ticketとresource状態の矛盾を別々に与える。 | INFRAはclassification/ticketを決めない。各SECURITY/OS ownerへ矛盾を返す。 |
| `IV-INFRA-001-13` | `L10-INFRA-001-C13` | INFRA-001-AC-01, INFRA-001-AC-02 | 独立に宣言した`prod-green-02`/`resource-green-02`、属性、`inventory-fixture-02` revision `rev-02`とstaging上の同名別identityを与える。 | 全7属性、environment、source/revisionが一致し、staging値をproductionへ結合しない。 |
| `IV-INFRA-001-14` | `L10-INFRA-001-C14` | INFRA-001-AC-01 | 既知値があるresourceへlocation読取不能、version読取不能、部分更新中断をそれぞれ別々に与える。 | 旧値をcurrentとせず、読取不能/未完範囲を示す。旧観測は旧source/revisionとして区別する。 |
| `IV-INFRA-001-15` | `L10-INFRA-001-C15` | INFRA-001-AC-04 | lifecycle=`ready`のみ、environment=`production`のみを別fixtureとして、各々authority/operation許可への変換を試みる。 | どちらもauthorityまたは許可を作らない。観測stateは維持し、authorityは別条件のまま。 |

## INFRA-006機能case oracle

固定L10のoperation identityとC01–C19を保つ。C02が列挙するoperation種・authority条件は個別変異であり、独立したnegativeをひとつずつ与える。bootstrap/health check/service stop/rollback/recoveryは5種類のみ。

| L9 verifier ID | 固定L10 case参照 | L3 AC | 入力・単独変異 | 期待されるoracle / 戻し先 |
|---|---|---|---|---|
| `IV-INFRA-006-01` | `L10-INFRA-006-C01` | INFRA-006-AC-01, INFRA-006-AC-02 | HELIX/OS停止中にbootstrapのtarget/action/revision/scope/別authority/expiryを一致させ、独立path証拠を与える。 | fixture上で6条件とpathを別々に照合し、bootstrapだけを限定判定する。 |
| `IV-INFRA-006-02` | `L10-INFRA-006-C02` | INFRA-006-AC-01, INFRA-006-AC-02 | 5 operation各々について、authorityの欠落/unknown/expired/out-of-scope、target mismatch、revision mismatch、credential scope unknown、policy unknownを単独fixtureに分ける。 | 該当operation開始0。理由/ownerを保持し、authority・credential scope・policyを相互代替せず、通常authorityへfallbackしない。 |
| `IV-INFRA-006-03` | `L10-INFRA-006-C03` | INFRA-006-AC-01, INFRA-006-AC-02 | 宣言済みrecovery resource内の未見個体、次にfixtureで未見の適用scope内revisionを分けて与える。 | 未見だけでは拒否しない。各resource/authorityを照合し、登録外やunknown authorityは利用可能と推定しない。 |
| `IV-INFRA-006-04` | `L10-INFRA-006-C04` | INFRA-006-AC-01, INFRA-006-AC-02 | authority/resource owner revision conflictと、independent path/authority owner unknownを別々に与える。 | 該当operationを止める。authorityはSECURITY、resource/pathは該当ownerへ戻す。owner自体unknownなら未解決owner/dutyを保持し、循環差戻ししない。 |
| `IV-INFRA-006-05` | `L10-INFRA-006-C05` | INFRA-006-AC-02 | health checkを別target/operation identityでread-only observationとして与える。 | health結果を記録し、state-changing actionを開始しない。 |
| `IV-INFRA-006-06` | `L10-INFRA-006-C06` | INFRA-006-AC-02 | service stopを許可scope、別authority、前提/結果付きで与える。 | 対象serviceだけを操作対象として判定し、停止中control planeをrouteにしない。 |
| `IV-INFRA-006-07` | `L10-INFRA-006-C07` | INFRA-006-AC-02 | rollbackに適用されるL2-005義務、target revision、別authorityを与える。 | rollback固有の前提/結果/未完義務を記録。read-only操作へ義務を広げない。 |
| `IV-INFRA-006-08` | `L10-INFRA-006-C08` | INFRA-006-AC-02 | recovery operationと適用L2-005義務を与える。 | recoveryの結果/未完義務をoperation identityに結ぶ。 |
| `IV-INFRA-006-09` | `L10-INFRA-006-C09` | INFRA-006-AC-03 | 同一fixtureでnormal completion、partial result、failureを別々に与える。 | 状態、最終eligible revision、未完義務を区別して保持し後続観測で消さない。 |
| `IV-INFRA-006-10` | `L10-INFRA-006-C10` | INFRA-006-AC-03 | partial resultの後に、古いrevisionのsuccessをcurrentへ上書きする単独変異。 | 古いsuccessは非適格。最後のeligible revisionと未完義務を保持する。 |
| `IV-INFRA-006-11` | `L10-INFRA-006-C11` | INFRA-006-AC-03 | 未見recovery resource IDと未見operation orderをそれぞれ別fixtureで与え、適用条件を満たす。 | 秒数/固定順序を要求せず、source付きlineage、state、未完義務を保持する。 |
| `IV-INFRA-006-12` | `L10-INFRA-006-C12` | INFRA-006-AC-03 | 同一sourceの相反revisionと、recovery duty owner unknownを別々に与える。 | 一方を選ばず相反evidenceまたは未解決義務をsource/ownerへ返す。 |
| `IV-INFRA-006-13` | `L10-INFRA-006-C13` | INFRA-006-AC-02 | 固定5種にない第6 operationをtarget/revision/scope一致の形で要求する。 | operation開始0。未定義operationを明示し、既存5種へ読み替えない。 |
| `IV-INFRA-006-14` | `L10-INFRA-006-C14` | INFRA-006-AC-02 | read-only health check結果からservice stopを暗黙開始する単独変異。 | 観測のみ。別operation authorityなしに状態変更しない。 |
| `IV-INFRA-006-15` | `L10-INFRA-006-C15` | INFRA-006-AC-02 | rollbackに適用されるL2-005 dutyだけをunknownまたは未充足にする。 | rollback開始0。対象dutyと理由を保持し該当ownerへ戻す。 |
| `IV-INFRA-006-16` | `L10-INFRA-006-C16` | INFRA-006-AC-01 | HELIX/OS停止中にservice stopの唯一routeが停止中OS経由であるfixture。 | operation開始0。independent path条件を満たさないrouteとしてpath ownerへ返す。 |
| `IV-INFRA-006-17` | `L10-INFRA-006-C17` | INFRA-006-AC-01, INFRA-006-AC-02 | 通常operationには有効だがindependent recoveryに適用されないauthorityだけを与える。 | 独立recovery開始0。別SECURITY authority不足としてSECURITYへ返す。 |
| `IV-INFRA-006-18` | `L10-INFRA-006-C18` | INFRA-006-AC-02 | recoveryの適用dutyだけunknown/未充足、rollback側dutyは満たす。 | recovery開始0。recovery固有dutyを保持し、C15のrollback欠落と混ぜない。 |
| `IV-INFRA-006-19` | `L10-INFRA-006-C19` | INFRA-006-AC-02 | 5限定operationと別authority条件を満たし、fully automatic failoverだけがない。 | failover不在のみで既存5 operationの適格性を否定しない。failoverを1.0条件にしない。 |

## business要件とNFR測定case

固定L3 businessの全体SHA-256 `c2b22bc5af8bf721c9f6e4594e81046dde2ed2a9555fa0643accb76f8a37f97e` は、親に独立business outcomeがないため独立business要件なしと定める。固定L10 business SHA-256 `8801b848f6b16d5214a45b3652446a228e829c687f9203e50c02ad2bf5ddbe70` も独立business test/oracleなしとする。L3 business lines 17,19およびL10 business line 19の義務は、機能caseを正本にし、業務成功/incident close/復旧完了/費用や配置の採否を生成しないことで満たす。

固定L3 NFR SHA-256 `a381b4b88fe6b5621fecf1195470b45bd5fbfd1f1dc88fee7dc3cf259abbb3ab` とL10 NFR SHA-256 `562545cfb95e81bce5db29628b5fbb3a82c20fbb41db6867364ff60b2c84c63a` の6義務を次の測定候補へ対応付ける。値はL3の同一承認に束ねる候補で、実測値や別PO decisionではない。

| L9 verifier ID | L3 NFR ID | 母集団 / 比較する値 | L10 oracle candidate |
|---|---|---|---|
| `IV-INFRA-NFR-001-01` | `INFRA-NFR-001-01` | 宣言fixture scopeのresource、7属性、environment 8軸、CORE設計revision、runtime revision。 | declared scope必須fieldのsource-qualified照合候補。欠落/unknown/環境軸差を個別mutation、unknown除外や実環境全数の主張をしない。 |
| `IV-INFRA-NFR-001-02` | `INFRA-NFR-001-02` | pathごと8軸、storageごと6属性＋recovery reference。 | field/axisごとの欠落とunknownを個別に与え、complete扱いしない。 |
| `IV-INFRA-NFR-001-03` | `INFRA-NFR-001-03` | logical connectionとphysical path identity/reference。 | 等しいname/endpointでの誤併合を単独変異とし、候補許容0件。 |
| `IV-INFRA-NFR-006-01` | `INFRA-NFR-006-01` | target/action/revision/scope/別SECURITY authority/expiryの6条件。action/expiry細目は採択済みL2-010 lines 126–134, 特に129,132を入力とする。 | 6条件それぞれ欠落/mismatch/expiredを単独測定し、通常operation authorityだけのケースを別判定。credential値は記録しない。 |
| `IV-INFRA-NFR-006-02` | `INFRA-NFR-006-02` | 固定5 operationと停止中OS/control plane route。 | 5種類を別ケースにし、coverage 5/5候補と通常route依存の欠如を測る。6th op/fully automatic failoverを1.0条件にしない。 |
| `IV-INFRA-NFR-006-03` | `INFRA-NFR-006-03` | health probe 5秒×3回候補（比較: 1秒×1回、10秒×5回）、遅延0/4/6秒、未応答1/2/3回、途中復帰。 | 各遅延/回数/途中復帰を個別に与える。6秒を5秒以内へ丸めない。3回未応答でもservice-wide incident/severityはunknownでL2-004側ownerが不明なら決めない。 |

L10 NFRの未見正常/owner戻し/記録材料も保持する。対象scope外resourceの不存在を主張せず、母集団は各宣言fixtureに限る。measurement evidenceはoperation-health候補とsource/revision、probe elapsed/countを示すにとどめ、SLO/達成宣言を行わない。

## source/owner返却と合否境界

| 観測/依存 | 該当するownerまたは契約 | 本caseで保持するもの |
|---|---|---|
| resource identity/field/sourceの不一致または未知 | 宣言済みresource source owner。CORE設計参照の意味はCORE owner。 | 元値、unknown理由、source/revision、未完観測範囲。ownerが解決しない場合はunknown。 |
| logical/physical pathまたはsecurity boundary不一致 | logical contractはCONNECT、security boundary/authorityはSECURITY、resource/path sourceは宣言owner。 | logical identityとphysical identityを分離し、ownerごとの不一致を保つ。 |
| OS assignment/change state欠落 | 該当operationの既存OS assignment/source owner。 | assignmentはOS所有入力。物理適用/実行成功のreceiptにしない。 |
| 独立operation authority/expiry不一致 | SECURITY authority/policy owner。 | K3の既存tuple/check、authority identity/revision、未解決condition。credential値は保持しない。 |
| 適用L2-005復旧義務がunknown/未充足 | 採択済みL2-005の該当義務owner。 | 影響するstate-changing operationとdutyだけを止め、他operationへ広げない。 |
| read receipt/ledger不足または損傷 | 各source、K5/K6の既存owner境界。 | missingとunreadable/unknownを区別し、部分読取を完全走査としない。 |

本書の「期待」はL9設計oracleである。fixture未実行のためpass/fail実績は存在しない。L10実行、physical observation、実操作、サービス水準、operation成功、owner authorityを本書から生成しない。要求の意味/scope/owner/versionの変更が必要なら既存L2へ返す。未解決のtechnical detailは既存型のunknown/stale/non-valueとして限定範囲に残し、新しいownerや承認gateを作らない。
