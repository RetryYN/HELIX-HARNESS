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
| L10-INFRA-001-C02 負例 | INFRA-001-AC-01, INFRA-001-AC-02 | 同一名のresourceを持つproduction fixtureにstaging observationを誤結合する変異に加え、location、version、dependencyの欠落を各々独立に与える。別々の変異としてscope、authority、source、config、network、credential scope、dataの各environment軸を不一致またはunknownにする。 | cross-environment結合は拒否/unknown、欠落値はunknownのままresource sourceまたはCORE設計ownerへ返す。返却先ownerが識別できない変異ではunknownと未完の観測範囲を保持し、成功・利用可能にしない。各軸の不一致/unknownを利用可能にせず、staging成功でproductionをhealthy/availableにしない。 |
| L10-INFRA-001-C03 未見正常 | INFRA-001-AC-01, INFRA-001-AC-02 | 宣言済みscope内で未見のresource roleとrecovery environmentを加え、同じ属性契約で照合する。 | 型/roleが未見でもparent scope内なら列挙可能で、属性sourceとenvironmentが保持される。固定role一覧へのfallbackはない。 |
| L10-INFRA-001-C04 owner戻し | INFRA-001-AC-01 | resource owner、location、dependencyのいずれかを不明にする。返却先ownerが識別できるfixtureと返却先owner自体がunknownのfixtureを別々に与える。 | resource sourceまたはCORE設計ownerが識別できる場合は該当先へunknownを返す。返却先owner自体がunknownならunknownと未完の観測範囲を保持し、成功/利用可能にしない。CORE設計と観測sourceのrevision不一致はL2-002の条件であり、本caseへ持ち込まない。 |
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
| L10-INFRA-006-C02 負例 | INFRA-006-AC-01, INFRA-006-AC-02 | 対象operationはbootstrap、health check、service stop、rollback、recoveryの各々とし、別authorityの欠落・unknown・期限切れ・範囲外、およびtarget/revision mismatchをそれぞれ独立注入する。さらにcredential scopeまたはpolicyがunknownである変異をauthority unknownとは別々に与える。credential値は入力・記録しない。 | 全変異でoperation開始0、拒否/保留理由とSECURITYまたは該当resource/path ownerが見える。authority、credential scope、policyの不足を互いに代用せず、通常operation権限へfallbackしない。 |
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

## Stage 2b suffix — HELIXINFRASTRUCTURE-L2-002/007 機能総合検証

状態：候補のみ。対象は採択済み HELIXINFRASTRUCTURE-L2-002/007、version_target 1.0。固定L2/L11が要求意味のauthority、PO決定は親identity/revision/versionの採択登録、G0は実装順序のみを記録する。このL3/L10本文は未承認・未実行であり、実装・実行・配布の許可を生成しない。対象範囲とsource pinsは[Stage2b公開cutout監査](../../governance/audits/requirements-stage/l3-l10-infra-stage2b-main-publication-cutout-2026-10-05-72fa2f08.json)に固定する。

### 対象・適用範囲 — HELIXINFRASTRUCTURE-L2-002/007

対象は採択済みHELIXINFRASTRUCTURE-L2-002/007のみ、version_target 1.0。固定L2/L11の意味・scope・担当・版を保持する。本cutoutはこの2親だけを対象とし、他の親やstageを追加しない。候補草稿・未承認・未実行。

## HELIXINFRASTRUCTURE-L2-002 — L10 oracle（対応 `INFRA-002-FR-01`）

固定親・旧sourceのexact path/全文・span SHAはL3機能本文の「INFRA-002 固定親と旧資産の起点」と「Stage 2bの項目別再導出」を参照する。fixtureは同じ対象environment/resource/revisionに結び、他scopeの観測や設計承認を代用しない。

- **L10-INFRA-002-C01**（AC `INFRA-002-AC-01`）：承認済designとtargetおよび一致actualを別sourceで与える。期待oracleは三つの入力と一致drift結果の相互traceであり、source bytesとauthorityは不変。
- **L10-INFRA-002-C02**（AC `INFRA-002-AC-01,AC-02`）：同じfixtureをresource missing、unexpected、version/config/network/permission/capacity差、runtime replacement、unknown dependencyの9類型に独立変異する。既知の差は種類・値・sourceを返し、unknown dependencyは未確認のまま。各差異の分類とsourceを個別に観測し、別変異の成功で相殺しない。
- **L10-INFRA-002-C03**（AC `INFRA-002-AC-02`）：design/target/observationを各々missing、stale、互換不明にした9入力を与える。該当部分の比較を保留し、source ownerと未確認scopeを返す。unknownを一致、missingをresource不存在の確定にしない。
- **L10-INFRA-002-C04**（AC `INFRA-002-AC-01`）：actual observationの値をapproved design/targetへ自動昇格しようとする入力を与える。design/target/actualのcanonical bytesとauthority状態は比較前後で不変で、昇格も修正実行も生じない。
- **L10-INFRA-002-C08**（AC `INFRA-002-AC-01,AC-02`）：scope外または未登録のunexpected resourceをapproved resourceとして扱おうとする入力を与える。resource identity・design/target/actualのcanonical bytesとauthority状態は不変で、承認済み扱いやscope追加をしない。
- **L10-INFRA-002-C09**（AC `INFRA-002-AC-01`）：driftを消す目的でdesign/target/actualの比較入力を上書きする要求操作を与える。操作を拒否し、比較入力のcanonical bytes・元の比較結果・authority状態が前後で不変であることを照合する。
- **L10-INFRA-002-C05**（AC `INFRA-002-AC-02`）：有限scopeの一部だけ正しいsourceがあり、残りが別environment/別revision/unknownである未見fixtureを与える。確認済み部分と未確認部分を区別し、元ownerへ返す。OS ticket/SECURITY authority/Worker契約を欠く状態では修正操作を生成しない。

## HELIXINFRASTRUCTURE-L2-007 — L10 oracle（対応 `INFRA-007-FR-01`）

固定親と旧sourceはL3機能本文の該当節でpinする。これは再構築の検証設計であり、今回復旧操作を実施した記録ではない。後続の承認済み設計・既存authorityに従う隔離環境で結果を観測する。 固定oracleはL11-007の検証に対応する既存verification sourceのidentity/revision・対象scope・期待結果をfixtureへ固定したものとする。具体sourceまたは期待結果が不明なfixtureはunknown/unassessedとし、business判定を新設しない。C01/C02の正常fixtureはこれらが揃った場合に限る。C04ではoracle source identity/revision・scope・期待結果の個別missing/unknown/mismatchも投入し、再構築成功にしない。

- **L10-INFRA-007-C01**（AC `INFRA-007-AC-01`）：元machineを利用不能とし、外部から取得できる完全なapproved design/config/artifact/dependency/data backup/version/deployment evidenceを与える。隔離環境の再構築、再接続、起動、固定oracle実結果を順に照合し、すべて成立したdeclared scopeだけを再構築済みにする。消失machine/control planeへの依存はなく、操作authorityは別sourceから取得する。
- **L10-INFRA-007-C02**（AC `INFRA-007-AC-01,AC-02`）：作成側に伏せた同scopeの別artifact/dependency版組合せで再構築する。入力と結果版・実制約を照合し、未対応組合せは未評価とする。前fixtureのgreenを別版へ流用しない。
- **L10-INFRA-007-C03**（AC `INFRA-007-AC-02`）：関連文書だけが存在し、backupも実再構築証拠もない入力を与える。rebuildable/successにせず、欠落情報とsource ownerを返す。
- **L10-INFRA-007-C04**（AC `INFRA-007-AC-02`）：design/config/artifact/dependency/data/version/deployment evidenceを一つずつmissing/stale/異版にする。さらにcredential authority不足、依存再接続失敗、起動失敗、verification failure、verification unknownを個別に与える。起動だけの成功や一部復元を全scope成功にしない。authority不足は該当SECURITY sourceへ返す。
- **L10-INFRA-007-C05**（AC `INFRA-007-AC-02`）：一部復元後に依存またはverificationで止まり、同じscope/版の不足を補って再開する。復元済み部分と残義務、停止原因、owner、再構築結果のprovenanceを維持し、再開前の未完結果を成功にしない。条件が変わる再開は新revisionで再照合する。

| 親 | ACの同一正本参照 | case集合 | 成立範囲 |
|---|---|---|---|
| `HELIXINFRASTRUCTURE-L2-002` | `INFRA-002-AC-01, INFRA-002-AC-02` | `L10-INFRA-002-C01..09` | 指定resource/environmentと固定三入力の比較 |
| `HELIXINFRASTRUCTURE-L2-007` | `INFRA-007-AC-01, INFRA-007-AC-02` | `L10-INFRA-007-C01..08` | 宣言した隔離復旧scope・版・固定oracleの結果 |

- **L10-INFRA-002-C06**（`INFRA-002-AC-02`）：L2-001のresource identity、environment identity、設計source identity/revisionとactual source identity/revisionを一項目ずつmissing/unknown/stale/mismatchへ変える。期待oracleは該当比較だけを保留し不足field/sourceと元ownerを返す。別source/環境から補完せず、未選択resourceは比較義務に加えない。
- **L10-INFRA-007-C06**（`INFRA-007-AC-02`）：L2-001のresource/environment identity、選択復旧に適用されるL2-005の復旧情報、L2-006の独立path/別authorityを一項目ずつmissing/unknown/stale/mismatchへ変える。期待oracleは再構築成功を出さず、対応source ownerへ返して復元済み部分と未完義務を保持する。非適用の復旧操作に義務を追加せず、必要な既存条件を推測で免除しない。

追加caseを含む集合は002がC01〜C09、007がC01〜C08。未見正常007-C02は入力版の適用可能性が既存sourceで示される合成fixtureに限り、版不明を正常と偽らない。各fixtureはsource/revision/environmentと期待oracleを別記し、別機能の性能値を判定へ流用しない。

- **L10-INFRA-007-C07**（`INFRA-007-AC-02`）：backupだけが存在し、適用対象のdesign/documentationや実再構築証拠がない入力を与える。backupの存在だけではrebuildable/successにせず、必要なdesign/source ownerへ返す。
- **L10-INFRA-007-C08**（`INFRA-007-AC-02`）：必要な情報が消失machine内だけにあり、外部から復元入力を取得できない入力を与える。rebuildable/successにせず、不足情報とowner、未完scopeを返す。

- **L10-INFRA-002-C07 — 未見正常**（`INFRA-002-AC-01`）：C01/C02と異なる合成resource/environment identityとsource revisionを独立に宣言し、approved design/target/actualの同対象対応を保ってversion差とnetwork差が併存する入力を与える。期待oracleは両差異を別source traceで返し、正本・authorityを変えず、source所有者・未確認scopeを保持する。未見名称のみで拒否せず、入力不明ならC03/C06の保留へ分ける。

## Stage 2a 追加範囲 — L2-003/004/005/009/010

このStage 2a検証候補は [L3 FR/AC](../L3-requirements/functional-requirements.md) と同じ固定親句・identityに結ぶ。採択済みL2-005もこのStage 2aでは直接の対象親であり、Stage1の006用依存入力扱いを拡張しない。全caseは合成・非secret fixtureで設計し、現在の実装、実credential、production、recoveryの実成功を証明しない。未見正常fixtureは既存例の入力値を使い回さず、独立して宣言する。failure/partialの戻し先はACとcaseの双方に置く。

### L2-003 resource/capacity cases

| Case | FR/AC trace | Fixture・操作 | Oracle / owner |
|---|---|---|---|
| CASE-INFRA-003-01 normal | INFRA-003-FR-01 / INFRA-003-AC-01 | local/VPS/dedicated/cloud/container/GPU/Worker resourceを別identityで宣言し、source/revisionを付ける。 | 宣言resourceとtype/fieldを同一視せず追跡。未見typeはunknownを残す。 |
| CASE-INFRA-003-02 negative / field-by-field | INFRA-003-FR-01 / INFRA-003-AC-02 | Network path各8軸を一軸ずつ欠落/ambiguousにする。logical CONNECT IDしかないfixtureも分ける。 | 欠落軸はunknown、routeは補完しない。security/purpose等を推測しない。 |
| CASE-INFRA-003-03 unseen normal | INFRA-003-FR-01 / INFRA-003-AC-01, INFRA-003-AC-02 | 別に宣言した `resource-violet-04` と新protocolのpathを使い、8軸にsource/revisionを付ける。 | 未見名称でもscope内の型付き観測を保持。既存CASEの具体例を流用しない。 |
| CASE-INFRA-003-04 owner return | INFRA-003-FR-01 / INFRA-003-AC-02 | logical pathとphysical path/security boundaryのowner情報が衝突する。 | path実状態を消さず、logical contractはCONNECT、security boundaryはSECURITY、source不明は観測元ownerへ返す。 |
| CASE-INFRA-003-05 normal | INFRA-003-FR-02 / INFRA-003-AC-03 | persistent/temporary DB, evidence/artifact, queue, cache, log/metric, model storeを別宣言し6属性+recovery refを与える。 | 各category・attribute・source/revisionを識別。 |
| CASE-INFRA-003-06 negative / storage fields | INFRA-003-FR-02 / INFRA-003-AC-03 | owner, durability, backup, retention, environment, confidentiality, recovery refの欠落を一つずつ試す。persistent/temporary誤結合も別試験。 | いずれもunknown/incomplete。temporary storeでbackup/recovery義務を満たしたとしない。 |
| CASE-INFRA-003-07 unseen normal | INFRA-003-FR-02 / INFRA-003-AC-03 | CASE-003-05と異なる独立identity/fixtureで、同一categoryの新しいlog/metric storeを宣言する。 | 固定値を継承せず6属性とrecovery referenceを新fixtureで照合する。 |
| CASE-INFRA-003-08 owner return | INFRA-003-FR-02 / INFRA-003-AC-03 | recovery reference ownerとstorage ownerのsource revisionが衝突する。 | storage観測を保持し、recovery requirement ownerへ矛盾を戻す。 |
| CASE-INFRA-003-09 normal | INFRA-003-FR-03 / INFRA-003-AC-04 | scope内Model Runtimeのmodel/server/version/GPU-memory/concurrency/latency/capacity/health/endpointを各source-qualifiedで与える。external model API、local LLM、GPU server、distributed model server、tuned modelを各独立type fixtureとして分類する。Worker nodeは該当resource fieldsのみ与える。 | 全field/source/revisionを対象environmentへ結ぶ。知能scoreや操作authorityを出さない。 |
| CASE-INFRA-003-10 negative / runtime fields | INFRA-003-FR-03 / INFRA-003-AC-04 | 上記Model Runtime fieldを一つずつ欠落/staleにする。各5 model typeでtype/class不一致のfixtureを個別に置く。別fixtureではscope外にModel Runtimeを置く。 | incomplete/unknownを維持。scope外runtimeの存在を仮定せずWorker資格を生成しない。 |
| CASE-INFRA-003-11 unseen normal | INFRA-003-FR-03 / INFRA-003-AC-04 | 独立の宣言scopeに新Model Runtime identityと未知のserver/version値を入れる。 | 未見値を保持し適用fieldのsource/revisionを追跡する。 |
| CASE-INFRA-003-12 owner return | INFRA-003-FR-03 / INFRA-003-AC-04 | Model quality値をresource capacityとして渡すmutationを加える。 | capacity observationとINTELLIGENCE/LABOのquality ownershipを分け、quality評価ownerへ返す。 |
| CASE-INFRA-003-13 normal | INFRA-003-FR-04 / INFRA-003-AC-05 | known, source-qualified capacityと起動要求、適用される判定閾値の宣言有無を入力する。 | thresholdが無ければunknownを返し、あれば観測情報をOS/INTELLIGENCEへ渡す。配置/cost判断は生成しない。 |
| CASE-INFRA-003-14 negative / capacity | INFRA-003-FR-04, INFRA-003-FR-05 / INFRA-003-AC-05, INFRA-003-AC-06 | shortage、unknown, stale, unmeasurable capacity、unbounded Job追加、unauthorized placementを別々に試す。 | safe-to-acceptを返さず decision ownerへ戻す。queue/pending/snapshot保持。 |
| CASE-INFRA-003-15 unseen normal | INFRA-003-FR-04 / INFRA-003-AC-05 | 独立fixture `task-scope-05` に新resource typeと十分と宣言されたcapacityを与える。 | scope/source/decision-thresholdを個別照合して情報をhand offし、resource typeを選定しない。 |
| CASE-INFRA-003-16 read/partial failure + owner return | INFRA-003-FR-05 / INFRA-003-AC-06 | 既知observation後にread failureとpartial updateを別々に注入し、別fixtureでsource owner不明を与える。 | 以前の値をcurrentにせず、失敗範囲・未完observation・queueを保持し、source ownerまたはOS/INTELLIGENCEへ戻す。 |

### L2-004 observability cases

| Case | FR/AC trace | Fixture・操作 | Oracle / owner |
|---|---|---|---|
| CASE-INFRA-004-01 normal | INFRA-004-FR-01, INFRA-004-FR-03 / INFRA-004-AC-01, INFRA-004-AC-03 | source/revision付きnormal resource/dependency/queue/runtime observationを独立に宣言する。 | state/source/target revisionを保持し、承認済みsourceにある分類だけを使う。 |
| CASE-INFRA-004-02 negative / classifications | INFRA-004-FR-01 / INFRA-004-AC-01 | degraded/unavailable/capacity/dependency/data-network/security-isolation/unknownを個別入力し、unknownをhealthyにする変異を別で試す。 | 各親定義stateを区別、unknownのhealthy昇格は拒否。 |
| CASE-INFRA-004-03 unseen normal | INFRA-004-FR-01, INFRA-004-FR-03 / INFRA-004-AC-01, INFRA-004-AC-03 | 異なるsource IDだが同じapproved observation contractに適合するnormal fixtureを新規宣言する。 | 新source/revisionを別identityで保持し、未見であることだけで失敗にしない。 |
| CASE-INFRA-004-04 owner return | INFRA-004-FR-02, INFRA-004-FR-04 / INFRA-004-AC-02, INFRA-004-AC-04 | incident meaning/severity owner不明とcollector failureを別fixtureにする。 | meaning/severityはunknownで該当approved meaning ownerへ返す。collector failureはsource/collector ownerへ返しpending evaluationを保つ。 |
| CASE-INFRA-004-05 negative / stale or missing | INFRA-004-FR-03, INFRA-004-FR-04 / INFRA-004-AC-03, INFRA-004-AC-04 | stale target revision、missing telemetry、unknown sourceをそれぞれ独立入力。L2-019詳細freshness fieldsは入力gateにしない。 | staleをcurrentにせずunknown/unobserved、L2-019を依存にしない。未確認resourceを保持。 |

### L2-005 backup/restore/rollback cases

| Case | FR/AC trace | Fixture・操作 | Oracle / owner |
|---|---|---|---|
| CASE-INFRA-005-01 normal | INFRA-005-FR-01 / INFRA-005-AC-01 | 対象/source revision、time、complete location、integrity、expiryが宣言されたbackupを独立fixtureとして記録する。 | backup recordの完全性だけを確認しrestoreableを推定しない。 |
| CASE-INFRA-005-02 negative / backup fields | INFRA-005-FR-01 / INFRA-005-AC-01 | incomplete, wrong target/revision, integrity mismatch, expired, configured-only, artifact-exists-onlyを個別に注入する。 | 各々を別stateとし、restore successへ昇格しない。 |
| CASE-INFRA-005-03 unseen normal | INFRA-005-FR-01 / INFRA-005-AC-01 | 異なるDB/resource identityを新規宣言し同じbackup fieldsを埋める。 | 新fixtureでsource/revision等を照合。CASE-005-01を重複宣言として再利用しない。 |
| CASE-INFRA-005-04 owner return | INFRA-005-FR-01, INFRA-005-FR-04 / INFRA-005-AC-01, INFRA-005-AC-04 | backup source/target ownerが不明なpartial recordを入力する。 | success不可。欠落fieldとrecovery design owner/OSへの戻し先を表示し、未完 dutyを残す。 |
| CASE-INFRA-005-05 normal actual restore | INFRA-005-FR-02 / INFRA-005-AC-02 | 独立restore環境でintegrity/reconnect/startup/verification evidenceを段階別に与える。 | 4 evidenceのsource/revisionが揃った場合にのみrestore resultをcompleteと記録する。 |
| CASE-INFRA-005-06 negative / restore steps | INFRA-005-FR-02 / INFRA-005-AC-02 | integrity, dependency reconnect, startup, verification failureを一項目ずつ別fixtureで注入する。 | 対応evidenceの欠落を個別に検出しrestore success不可。failure stateと未完義務を保持。 |
| CASE-INFRA-005-07 normal eligible rollback | INFRA-005-FR-03 / INFRA-005-AC-03 | version/config/artifact/dependency/data-compatible targetとrecovery procedureを結んだ別rollback fixtureを使う。 | eligible target/resultを追跡し、incident stateは変更しない。 |
| CASE-INFRA-005-08 negative / rollback | INFRA-005-FR-03, INFRA-005-FR-04 / INFRA-005-AC-03, INFRA-005-AC-04 | incompatible fieldごと、unknown target、procedureなし、rollback後未確認を個別に入れる。 | rollback eligibility/success不可、incident close不可。recovery design owner/OSへ返し prior state保持。 |
| CASE-INFRA-005-09 partial/unknown owner return | INFRA-005-FR-04 / INFRA-005-AC-04 | 部分restore後に未完verificationとowner ambiguityを与える。 | last eligible state/failure/unfinished dutiesを保持し、ownerを推測せず停止。 |

### L2-009 Work/Change integration cases

| Case | FR/AC trace | Fixture・操作 | Oracle / owner |
|---|---|---|---|
| CASE-INFRA-009-01 normal no-stage | INFRA-009-FR-01, INFRA-009-FR-02 / INFRA-009-AC-01, INFRA-009-AC-02 | 独立宣言のOS Work/Change identityとInfrastructure runtime/resource identityをversioned refsで結び、stage releaseを使わない。 | 通常接続は成立し、二重正本もstage待ちも発生しない。 |
| CASE-INFRA-009-02 conditional stage normal | INFRA-009-FR-02 / INFRA-009-AC-02 | 別fixtureで明示的にOS-L2-014 stage packへ収載し、stage ID/pack revision/runtime revisionを別々に与える。 | conditionがあるときだけstage contractを参照し、identityの混同をしない。 |
| CASE-INFRA-009-03 negative / mapping fields | INFRA-009-FR-01, INFRA-009-FR-03 / INFRA-009-AC-01, INFRA-009-AC-03 | target/runtime revision/Work ID/evidence refを一つずつ欠落・mismatch、stage IDとruntime revisionの誤併合を個別注入。 | resource change success不可。stage/current/rollback/pendingを保持。 |
| CASE-INFRA-009-04 unseen normal | INFRA-009-FR-01, INFRA-009-FR-02 / INFRA-009-AC-01, INFRA-009-AC-02 | 新しいwork/change identityとresourceを独立fixture宣言でstage無しに接続する。 | 新規identityでも通常接続契約を照合できる。 |
| CASE-INFRA-009-05 owner return | INFRA-009-FR-03 / INFRA-009-AC-03 | mismatch causeをWork/Change ownerとInfrastructure runtime ownerで別々に切替える。 | causeに対応OSまたはINFRA ownerへ戻し、状態と未完operationを残す。 |

### L2-010 authorized Worker operations

| Case | FR/AC trace | Fixture・操作 | Oracle / owner |
|---|---|---|---|
| CASE-INFRA-010-01 normal read-only | INFRA-010-FR-01, INFRA-010-FR-02 / INFRA-010-AC-01, INFRA-010-AC-02 | declared target/scope/read target、空write-set、適用可能なread authority、valid OS ticket/assignment、009 refを持つread-only observation。 | read-only観測を許し、operationからのwriteを拒否する。declared target resourcesのbefore/after不変を確認し、無関係resource変化はfailureにしない。write authority/005 dutyを要求しない。 |
| CASE-INFRA-010-02 normal state-changing | INFRA-010-FR-01, INFRA-010-FR-02 / INFRA-010-AC-01, INFRA-010-AC-02 | 有効SECURITY authority/Worker contract/ticket/009 ref/update admission acceptedと、該当actionに適用される005 dutyを個別宣言。 | 指定範囲のみ開始。適用不要な005義務は持ち込まない。 |
| CASE-INFRA-010-03 negative / authority | INFRA-010-FR-01, INFRA-010-FR-04 / INFRA-010-AC-01, INFRA-010-AC-04 | wrong target/action/revision/scope, expiry, credential scope mismatchを一項目ずつ独立negative fixtureにする。 | 各 mismatchで開始前拒否、SECURITY/OSへ返却、secret値は記録しない。 |
| CASE-INFRA-010-04 negative / update admission | INFRA-010-FR-02 / INFRA-010-AC-02 | state-changing operationだけにdenied/unknown/mismatch/expired admissionを一つずつ与える。read-only対照fixtureは同じく有効なread authorityのままにする。 | mutating operation開始0。read-onlyはupdate admission不在だけでは拒否しない。 |
| CASE-INFRA-010-05 independent recovery normal | INFRA-010-FR-03 / INFRA-010-AC-03 | OS/CP停止中に006独立path/別authorityを使うbootstrap/recovery fixtureを宣言し、復旧後result sync receiptも別段で与える。 | 開始時に停止OS ticket/009応答を要求しない。復旧後の同期は010 traceへ記録。 |
| CASE-INFRA-010-06 negative / dependency route | INFRA-010-FR-03 / INFRA-010-AC-03 | OS停止中に通常OS/009 routeだけが利用可能なfixture、または006 path/authority欠落を個別に与える。 | operation開始0。006 path/SECURITY authorityの提供ownerへ返す。006側へresult sync義務は追加しない。 |
| CASE-INFRA-010-07 unseen normal | INFRA-010-FR-01, INFRA-010-FR-03 / INFRA-010-AC-01, INFRA-010-AC-03 | 新しいresource identityとscope内の同じ限定bootstrap/recovery actionを独立宣言する。 | 未見resourceだけで拒否せず、全 authority条件を照合する。操作集合を増やさない。 |
| CASE-INFRA-010-08 partial execution/owner return | INFRA-010-FR-04 / INFRA-010-AC-04 | operation途中のfailureで一部stateだけ変わったfixtureを入力し、責務原因はSECURITY/OS/INFRAごとに別case。 | success不可。actual before/after、receipt、未完recovery/rollback dutyを保持し原因ownerへ返す。 |
| CASE-INFRA-010-09 negative / read-only write attempt | INFRA-010-FR-01 / INFRA-010-AC-01 | CASE-INFRA-010-01と同じdeclared target/scope/read targetを使い、read-only operationから対象resourceへのwriteを試行する。 | writeを適用前に拒否し、operation起因の対象resource変更を認めない。read-onlyの分類をmutatingとして通さない。 |
| CASE-INFRA-010-10 negative contrast / unrelated state change | INFRA-010-FR-01 / INFRA-010-AC-01 | read-only operation中にdeclared read target外の無関係resourceだけが独立に変化するfixtureを用いる。declared target resourcesは変化させない。 | 無関係resourceのglobal digest差だけではread-only operationを失敗にしない。判定対象はdeclared target resourcesのbefore/afterとoperationのwrite-setに限る。 |
