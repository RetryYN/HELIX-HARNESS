---
title: "HELIX-INFRASTRUCTURE Stage 1 機能総合検証候補"
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
layer: L10
kind: verification
status: draft_candidate
authority_status: draft_candidate
freeze_blocking: true
pair_artifact: docs/helix-infrastructure/L3-requirements/functional-requirements.md
stage: 1
---

# HELIX-INFRASTRUCTURE Stage 1 機能総合検証候補

本書は[機能要件候補](../L3-requirements/functional-requirements.md)と対になる設計検証である。L3の承認、実装試験、実際のenvironment健全性・復旧完了を示さない。各caseは入力source/revision、対象environment、観測地点、期待結果、失敗時ownerを記録する。業務完了・incident close・authorityはこの検証から生成しない。

## source pin

基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7`。PO固定L2/L11 source revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、L11全文SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`。本書の対象は採択済みHELIXINFRASTRUCTURE-L2-001（`MPR-RC-HELIXINFRASTRUCTURE-L2-001-003`, digest `1f419d31826a8f6627f0595822cd99d5b8c55db0bfd5faa25a735bca92b529c6`）とL2-006（`MPR-RC-HELIXINFRASTRUCTURE-L2-006-002`, digest `546bf30c3fca163f1ccb8303cbf26d3be45baa700c77099ddc7d3f6a4701fcbc`）に限る。

L2-005は採択済み依存入力であり、L3/L10対象ではない。005の未起草を006の未承認依存candidateとは扱わず、005自体の復旧要件を本Stageで受け入れたとも扱わない。

## 検証方式

検証入力は合成・匿名のresource descriptorと状態fixtureとする。実運用credential/PII/外部serviceを使わず、archiveの旧test/runtime/CIを実行しない。検証設計だけを定め、現在のHELIX-HARNESS実装を試験済みと主張しない。正常、明示negative、宣言対象外の未見正常、ownerへ戻す失敗を分離する。全caseで観測のsource/revisionと対象を固定する。

## HELIXINFRASTRUCTURE-L2-001 topology検証

| Case | 対応AC | 入力と操作 | 観測点・合格材料 |
|---|---|---|---|
| L10-INFRA-001-C01 正常 | INFRA-001-AC-01, INFRA-001-AC-02 | HELIX-OS/BRAIN/LABO/INTELLIGENCE/SECURITY/CONNECT、Worker/Model Runtime（対象scopeに含む場合）、database/queue/artifact/evidence/log/metric storeのfixtureをenvironment別に宣言し、各identity/role/location/version/dependency/lifecycle、source/revision、network path、storage classを観測する。 | 宣言した全identityとenvironmentが別々に記録され、各resourceの7属性は値または明示unknown、source/revisionへ辿れる。Model/Worker能力、ticket、security policyをINFRASTRUCTURE所有値として出さない。 |
| L10-INFRA-001-C02 負例 | INFRA-001-AC-01, INFRA-001-AC-02 | 同一名のresourceを持つproduction fixtureにstaging observationを誤結合する変異に加え、location、version、dependencyの欠落を各々独立に与える。別々の変異としてscope、authority、source、config、network、credential scope、dataの各environment軸を不一致またはunknownにする。 | cross-environment結合は拒否/unknown、欠落値はunknownのままresource sourceまたはCORE設計ownerへ返す。返却先ownerが識別できない変異では停止して未解決ownerを記録する。各軸の不一致/unknownを利用可能にせず、staging成功でproductionをhealthy/availableにしない。 |
| L10-INFRA-001-C03 未見正常 | INFRA-001-AC-01, INFRA-001-AC-02 | 宣言済みscope内で未見のresource roleとrecovery environmentを加え、同じ属性契約で照合する。 | 型/roleが未見でもparent scope内なら列挙可能で、属性sourceとenvironmentが保持される。固定role一覧へのfallbackはない。 |
| L10-INFRA-001-C04 owner戻し | INFRA-001-AC-01 | resource owner、location、dependencyのいずれかを不明にする。返却先ownerが識別できるfixtureとowner自体がunknownのfixtureを別々に与える。 | resource sourceまたはCORE設計ownerが識別できる場合は該当先へunknownを返す。owner自体がunknownなら停止し、未解決ownerを記録して成功/利用可能にしない。CORE設計と観測sourceのrevision不一致はL2-002の条件であり、本caseへ持ち込まない。 |
| L10-INFRA-001-C05 正常 | INFRA-001-AC-03 | logical CONNECT identityとphysical pathを別identityにし、source/destination/protocol/endpoint/direction/purpose/security boundary/dependencyを与える。 | pathの8軸とlogical connection参照が別々に追跡できる。 |
| L10-INFRA-001-C06 負例 | INFRA-001-AC-03 | network pathのaxisを一つずつ除き、logical IDだけでrouteを補う変異を加える。 | 欠落axisはunknown、logical IDからphysical routeを生成しない。 |
| L10-INFRA-001-C07 未見正常 | INFRA-001-AC-03 | 新しいprotocol名と複数のphysical pathが同一logical connectionを支えるscope内fixtureを与える。 | 未見値を保持し、pathごとに8軸を記録する。protocolのallowlistをL3が捏造せず、業務の送信許可も判定しない。 |
| L10-INFRA-001-C08 owner戻し | INFRA-001-AC-03 | CONNECTの論理接続宣言にないrouteやsecurity boundaryのowner不一致を与える。 | 観測できたpath stateを保ち、論理契約はCONNECT、security boundaryはSECURITY、未解決resource/pathは該当source ownerへ返す。 |
| L10-INFRA-001-C09 正常 | INFRA-001-AC-04 | persistent database, evidence storeとtemporary cache/queueを与え、storage6属性・recovery参照を紐付ける。CPU/RAM/GPU/VRAM/network、宣言scope内のModel/Worker runtime fieldを別sourceから与える。 | storage classと6属性/recovery参照が区別され、runtime値は対象environment/source/revisionと結び付く。能力・ticket・authority判定は出ない。 |
| L10-INFRA-001-C10 負例 | INFRA-001-AC-04 | temporaryとpersistentを混ぜ、retention/owner/confidentialityを欠落させる。model runtimeのversion/endpointを欠落させる。 | 欠落をunknownとして明示する。temporary値でpersistent backup/recoveryを満たしたとせず、model属性を推定しない。 |
| L10-INFRA-001-C11 未見正常 | INFRA-001-AC-04 | scopeがModel Runtimeを含まないenvironmentと、scopeに新しいModel Runtimeを追加したenvironmentを別々に与える。 | 前者ではModel Runtimeの存在を仮定しない。後者では宣言された全runtime fieldを列挙し、未観測値をunknownとして示す。 |
| L10-INFRA-001-C12 owner戻し | INFRA-001-AC-04 | SECURITY classificationとInfrastructure storage observation、またはOSのticket stateを矛盾させる。 | Infrastructureはsecurity classification/ticketを決めず、security ownerまたはOS ownerへ矛盾を返す。 |
| L10-INFRA-001-C13 宣言済正常fixture | INFRA-001-AC-01, INFRA-001-AC-02 | C01とは別に宣言した `prod-green-02` environment / `resource-green-02` identityを入力する。role=`api`, location=`zone-b`, version=`r17`, dependency=`db-green-02`, lifecycle=`ready` とする。source=`inventory-fixture-02`, revision=`rev-02` を付け、同名resourceをstagingに別identityで置く。 | 独立したfixture宣言の全7属性、environment、source/revisionが一致する。staging値をproductionへ結合しない。 |
| L10-INFRA-001-C14 読取失敗/部分更新 | INFRA-001-AC-01 | 以前のobservationでは全属性が既知のresourceに、location/versionの読み取り不能と、更新途中で中断した部分更新を別々に与える。 | 以前の値をcurrentとして返さず、読み取り不能と未完の観測範囲を示す。残りの属性はsource/revision付きの旧観測として区別し、最新観測完了としない。 |
| L10-INFRA-001-C15 負例：resource stateからauthorityを生成 | INFRA-001-AC-04 | resource lifecycle=`ready` の観測だけを与える変異と、environment=`production` の観測だけを与える変異を別々に注入し、各々から許可/authority出力を要求する。 | 両変異ともsecurity authorityまたはoperation許可を生成せず、出力件数0。観測stateは保持し、authority不足を別条件として扱う。 |

**全ケースの合否材料**: input identity総数、各identityの観測範囲、field別の値/unknown、source/revision、environment、拒否/保留理由、owner return。代表例だけの一致や文書の存在は実環境の成立証拠にしない。

## HELIXINFRASTRUCTURE-L2-006 independent recovery検証

各caseは通常HELIX/HELIX-OS control planeを停止または非応答にした合成環境を使う。操作の実行者はfixture上のSECURITY制約付きWorkerを表す。credential値そのものを記録せず、authority identity・revision・scope・expiryの検証結果だけを記録する。

| Case | 対応AC | 入力と操作 | 観測点・合格材料 |
|---|---|---|---|
| L10-INFRA-006-C01 bootstrap正常 | INFRA-006-AC-01, INFRA-006-AC-02 | HELIX/OS停止中、bootstrapの正しいtarget/action/revision/scope/authority/expiryをfixtureで照合する。 | 独立pathのroute evidenceと6条件照合があり、bootstrapだけが限定開始される。 |
| L10-INFRA-006-C02 負例 | INFRA-006-AC-01, INFRA-006-AC-02 | 別authorityの欠落・unknown・期限切れ・範囲外、およびtarget/revision mismatchをそれぞれ独立注入する。さらにcredential scopeまたはpolicyがunknownである変異をauthority unknownとは別々に与える。credential値は入力・記録しない。 | 全変異でoperation開始0、拒否/保留理由とSECURITYまたは該当resource/path ownerが見える。authority、credential scope、policyの不足を互いに代用せず、通常operation権限へfallbackしない。 |
| L10-INFRA-006-C03 未見正常 | INFRA-006-AC-01, INFRA-006-AC-02 | 宣言済みrecovery resourceのうち未見の個体と、固定fixtureにない適用scope内revisionを与える。 | 事前規則に従ってresource/authorityを個別照合し、未見だけで拒否しない。登録外・未知authorityは利用可と推定しない。 |
| L10-INFRA-006-C04 owner戻し | INFRA-006-AC-01, INFRA-006-AC-02 | SECURITY authorityとresource ownerのrevisionが相反する、または独立path/authorityを提供するownerが不明なfixtureを与える。 | 操作を止め、authority問題はSECURITY、resource/path問題は該当INFRASTRUCTURE ownerへ返す。提供owner自体を識別できない場合は循環して同じunknown ownerへ返さず、停止・未解決owner記録・残る義務を保持する。 |
| L10-INFRA-006-C05 health check正常 | INFRA-006-AC-02 | health checkを別target・operation identityで照合し、read-only observationとして実行する。 | health checkの結果を記録し、状態変更を開始しない。 |
| L10-INFRA-006-C06 service stop正常 | INFRA-006-AC-02 | service stopを許可scopeと別SECURITY authorityで照合し、操作前提と結果を記録する。 | 対象serviceだけを扱い、停止中のHELIX/OS control planeをrouteに用いない。 |
| L10-INFRA-006-C07 rollback正常 | INFRA-006-AC-02 | rollbackを許可scope、resource revision、authority、および採択済L2-005が当該actionに適用する復旧義務で照合する。 | rollback固有の前提・結果・未完義務が記録され、read-only操作に義務を一般化しない。 |
| L10-INFRA-006-C08 recovery正常 | INFRA-006-AC-02 | recoveryを別target・operation identityで照合し、適用されるL2-005復旧義務を確認する。 | recovery結果と未完義務が操作identityに紐づいて残る。 |
| L10-INFRA-006-C09 正常 | INFRA-006-AC-03 | 同一recovery fixtureで正常完了、部分結果、失敗を別々に与え、各source observationの最終適格revisionを記録する。 | 結果状態・最終適格revision・未完の操作/制約/復旧義務が分離され、後続観測で消去されない。 |
| L10-INFRA-006-C10 負例 | INFRA-006-AC-03 | 部分結果の後に古いrevisionのsuccessを現行値で上書きするmutationを与える。 | 上書きは不適格として残り、最後の適格revisionと未完義務が保持される。 |
| L10-INFRA-006-C11 未見正常 | INFRA-006-AC-03 | 未見のrecovery resource IDとoperation orderで適用条件を満たすfixtureを与える。 | 秒数や順序を固定せず、source付きoperation lineage、結果状態、未完義務を保持する。 |
| L10-INFRA-006-C12 owner戻し | INFRA-006-AC-03 | 同じsourceが相反revisionを返す、または復旧義務のownerが特定できないfixtureを与える。 | INFRASTRUCTUREは一方を選ばず、相反するevidenceと未解決義務をsourceまたは該当責務ownerへ返す。 |
| L10-INFRA-006-C13 負例：未定義operation | INFRA-006-AC-02 | 許可された5種に含まれない第6のoperationを、対象・revision・scopeが一致するfixtureで要求する。 | operation開始0。未定義であることを明示し、5種へ読み替えない。 |
| L10-INFRA-006-C14 負例：health checkから暗黙stop | INFRA-006-AC-02 | read-only health checkの実行fixtureに、health異常時の暗黙service stop変異を加える。 | health checkの観測結果だけを記録し、別operationのauthorityなしにservice stateを変更しない。 |
| L10-INFRA-006-C15 負例：rollback復旧義務不明 | INFRA-006-AC-02 | rollbackに適用される採択済L2-005の復旧義務がunknownまたは未充足となるfixtureを与える。 | rollback開始0。対象義務とunknown/未充足理由を保持し、該当ownerへ返す。 |
| L10-INFRA-006-C16 負例：停止control plane経由 | INFRA-006-AC-01 | HELIX/OS control planeが停止したfixtureで、service stopの唯一のrouteを停止中OS経由にする。 | operation開始0。独立path要件を満たさないrouteを拒否し、独立path ownerへ返す。 |
| L10-INFRA-006-C17 負例：通常operation authorityの流用 | INFRA-006-AC-01, INFRA-006-AC-02 | 通常operationには有効だが、独立recovery operationには適用されないauthorityだけを提示する。target/action等の通常operation条件は一致させる。 | authorityが通常operation向けに有効でも独立recovery開始0。別SECURITY authorityの不足を示してSECURITYへ返す。 |
| L10-INFRA-006-C18 負例：recovery義務unknown | INFRA-006-AC-02 | recovery operationに適用される採択済L2-005義務だけをunknownまたは未充足にする。rollback義務は正常に満たす。 | recovery開始0。recovery固有の未解決義務とownerを示す。C15のrollback欠落と独立に観測する。 |
| L10-INFRA-006-C19 負例：完全自動failoverを1.0条件化 | INFRA-006-AC-02 | 5種の限定操作と別authorityを満たすfixtureへ、完全自動failover能力がないことだけを理由に失敗する判定変異を与える。 | 固定親外の完全自動failoverを1.0要件に加えず、5操作の適格性と分ける。既存の限定操作判定をこの変異だけで不合格にしない。 |

**合否材料**: operationごとのtarget/action/revision/scope/authority/expiry、path独立性、実操作の有無、前後state、worker receipt、final eligible revision、結果状態、未完義務と差戻し先。

本検証は完全自動failover、recovery time objective、automatic incident closure、service/business readinessを判定しない。
