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
| CASE-INFRA-003-14 negative / capacity | INFRA-003-FR-04, INFRA-003-FR-05 / INFRA-003-AC-05, INFRA-003-AC-06 | shortage、unknown, stale, unmeasurable capacityを個別入力する。 | safe-to-acceptを返さず`capacity unavailable`としてOS/INTELLIGENCE decision ownerへ戻す。queue/pending/snapshotを保持。 |
| CASE-INFRA-003-15 unseen normal | INFRA-003-FR-04 / INFRA-003-AC-05 | 独立fixture `task-scope-05` に新resource typeと十分と宣言されたcapacityを与える。 | scope/source/decision-thresholdを個別照合して情報をhand offし、resource typeを選定しない。 |
| CASE-INFRA-003-16 read/partial failure + owner return | INFRA-003-FR-05 / INFRA-003-AC-06 | 既知observation後にread failureとpartial updateを別々に注入し、別fixtureでsource owner不明を与える。 | 以前の値をcurrentにせず、失敗範囲・未完observation・queueを保持し、source ownerまたはOS/INTELLIGENCEへ戻す。 |
| CASE-INFRA-003-17 negative / unbounded job | INFRA-003-FR-04 / INFRA-003-AC-05 | shortageだけのfixtureでjob上限を外し、他のfieldはknownとする。 | 無制限Job追加を成立扱いせず、capacity unavailableとpending requestをdecision ownerへ返す。 |
| CASE-INFRA-003-18 negative / unauthorized placement | INFRA-003-FR-04 / INFRA-003-AC-05 | 他node配置だけを未承認選択として変異する。 | nodeを選択・移動せず、OS/INTELLIGENCE decision ownerへ戻す。 |
| CASE-INFRA-003-19 negative / unauthorized cost choice | INFRA-003-FR-04 / INFRA-003-AC-05 | 低費用nodeと別nodeの双方がsource-qualified候補であるが、cost/placement決定権が入力されないfixtureを使う。 | Infrastructureはcost/nodeを選択せず、capacity unavailableまたは未解決判断をOS/INTELLIGENCEへ返す。 |
| CASE-INFRA-003-20 negative / snapshot dependency | INFRA-003-FR-04, INFRA-003-FR-05 / INFRA-003-AC-05, INFRA-003-AC-06 | 必要なL2-001 snapshotをmissing、stale、target revision mismatchの各独立fixtureにする。 | capacity判定を成立扱いにせずunknown/pendingを保持し、source ownerまたはOS/INTELLIGENCEへ戻す。 |

### L2-004 observability cases

| Case | FR/AC trace | Fixture・操作 | Oracle / owner |
|---|---|---|---|
| CASE-INFRA-004-01 normal | INFRA-004-FR-01, INFRA-004-FR-03 / INFRA-004-AC-01, INFRA-004-AC-03 | source/revision付きnormal resource/dependency/queue/runtime observationを独立に宣言する。 | state/source/target revisionを保持し、承認済みsourceにある分類だけを使う。 |
| CASE-INFRA-004-02 negative / classifications | INFRA-004-FR-01 / INFRA-004-AC-01 | degraded/unavailable/capacity/dependency/data-network/security-isolation/unknownを個別入力し、unknownをhealthyにする変異を別で試す。 | 各親定義stateを区別、unknownのhealthy昇格は拒否し、source/collector ownerへ戻して未完評価を保持。 |
| CASE-INFRA-004-03 unseen normal | INFRA-004-FR-01, INFRA-004-FR-03 / INFRA-004-AC-01, INFRA-004-AC-03 | 異なるsource IDだが同じapproved observation contractに適合するnormal fixtureを新規宣言する。 | 新source/revisionを別identityで保持し、未見であることだけで失敗にしない。 |
| CASE-INFRA-004-04 owner return | INFRA-004-FR-02, INFRA-004-FR-04 / INFRA-004-AC-02, INFRA-004-AC-04 | incident meaning/severity owner不明とcollector failureを別fixtureにする。 | meaning/severityはunknownで該当approved meaning ownerへ返す。collector failureはsource/collector ownerへ返しpending evaluationを保つ。 |
| CASE-INFRA-004-05 negative / stale or missing | INFRA-004-FR-03, INFRA-004-FR-04 / INFRA-004-AC-03, INFRA-004-AC-04 | stale target revision、missing telemetry、unknown sourceをそれぞれ独立入力。L2-019詳細freshness fieldsは入力gateにしない。 | staleをcurrentにせずunknown/unobserved、L2-019を依存にしない。未確認resourceを保持して観測source/collector ownerへ戻す。 |

| Case | FR/AC trace | Fixture・操作 | Oracle / owner |
|---|---|---|---|
| CASE-INFRA-004-06 normal approved severity | INFRA-004-FR-02 / INFRA-004-AC-02 | 承認済みmeaning source/revisionとseverityを持つ新source identityを独立宣言する。 | sourceの既存severity meaningを保持し、未見であることだけで失敗にしない。 |
| CASE-INFRA-004-07 unseen normal approved schema | INFRA-004-FR-02 / INFRA-004-AC-02 | 未見のseverity valueだが同じ承認済みschema/revision内で宣言されたfixtureを使う。 | 新規taxonomyを作らず承認済みmeaning sourceで照合する。 |
| CASE-INFRA-004-08 negative / unapproved severity | INFRA-004-FR-02 / INFRA-004-AC-02 | 他の観測は正常のまま、未承認severityの追加だけを変異する。 | severityを確定せずmeaning ownerへ返し、原因を推測しない。 |
| CASE-INFRA-004-09 negative / snapshot dependency | INFRA-004-FR-02, INFRA-004-FR-03 / INFRA-004-AC-02, INFRA-004-AC-03 | L2-001 snapshot referenceを欠落、stale、target revision不一致に各々独立変更する。 | meaning/severity/sourceを補完せずunknownで保留し、source/meaning ownerへ返す。 |

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

| Case | FR/AC trace | Fixture・操作 | Oracle / owner |
|---|---|---|---|
| CASE-INFRA-005-10 negative / retention owner | INFRA-005-FR-01 / INFRA-005-AC-01 | state ownerを欠落/unknown、またはownerのretention要求を欠落/unknownに一つずつ変異する。 | expiry適格性をunknownにし、state ownerが特定できればそこへ戻す。不明なら未解決のまま保留し、保持期間/ownerをInfrastructureが推定しない。 |
| CASE-INFRA-005-11 negative / backup job only | INFRA-005-FR-01, INFRA-005-FR-02 / INFRA-005-AC-01, INFRA-005-AC-02 | backup job successだけを記録し、actual restore evidenceは与えない。 | restore pass/successへ昇格せず、recovery design owner/OSへ戻しactual restoreの未完義務を保持。 |
| CASE-INFRA-005-12 negative / non-independent restore | INFRA-005-FR-02 / INFRA-005-AC-02 | restore environmentをsource/backup作成環境と独立でないものにする。 | restore検証として成立させずrecovery design owner/OSへ戻す。 |
| CASE-INFRA-005-13 negative / dependency reference | INFRA-005-FR-02 / INFRA-005-AC-02 | L2-001/002 dependency/snapshot参照をmissing、stale、revision mismatchの各独立fixtureにする。 | restore成功にせず、不一致と未完範囲を保持してrecovery design owner/OSへ戻す。 |
| CASE-INFRA-005-14 negative / recovery requirement | INFRA-005-FR-01, INFRA-005-FR-02 / INFRA-005-AC-01, INFRA-005-AC-02 | 適用されるstate recovery requirementだけをmissingまたはunknownにする独立fixtureを置き、他のowner/retention/backup fieldは既知で保つ。 | recovery eligibilityをunknownにしrestore successへ進めず、recovery requirementのsourceであるstate ownerへ確認する。restore failureはrecovery design ownerまたはOSへ返し、不明なowner/requirementは未解決義務として保持。 |

### L2-009 Work/Change integration cases

| Case | FR/AC trace | Fixture・操作 | Oracle / owner |
|---|---|---|---|
| CASE-INFRA-009-01 normal no-stage | INFRA-009-FR-01, INFRA-009-FR-02 / INFRA-009-AC-01, INFRA-009-AC-02 | 独立宣言のOS Work/Change identityとInfrastructure runtime/resource identityをversioned refsで結び、stage releaseを使わない。 | 通常接続は成立し、二重正本もstage待ちも発生しない。 |
| CASE-INFRA-009-02 conditional stage normal | INFRA-009-FR-02 / INFRA-009-AC-02 | 別fixtureで明示的にOS-L2-014 stage packへ収載し、同一stageの構成証拠、必要なInfrastructure依存、更新/rollback evidenceを各々独立source/revisionで与える。stage ID/pack revision/runtime revisionも別々にする。 | 3種のevidenceが同一stageへ結び、必要依存と更新/rollback結果を満たすことを照合する。conditionがあるときだけstage contractを参照しidentityを混同しない。 |
| CASE-INFRA-009-03 negative / mapping fields | INFRA-009-FR-01, INFRA-009-FR-03 / INFRA-009-AC-01, INFRA-009-AC-03 | target/runtime revision/Work ID/evidence refを一つずつ欠落・mismatch、stage IDとruntime revisionの誤併合を個別注入。 | resource change success不可。stage/current/rollback/pendingを保持。 |
| CASE-INFRA-009-04 unseen normal | INFRA-009-FR-01, INFRA-009-FR-02 / INFRA-009-AC-01, INFRA-009-AC-02 | 新しいwork/change identityとresourceを独立fixture宣言でstage無しに接続する。 | 新規identityでも通常接続契約を照合できる。 |
| CASE-INFRA-009-05 owner return | INFRA-009-FR-03 / INFRA-009-AC-03 | mismatch causeをWork/Change ownerとInfrastructure runtime ownerで別々に切替える。 | causeに対応OSまたはINFRA ownerへ戻し、状態と未完operationを残す。 |

| Case | FR/AC trace | Fixture・操作 | Oracle / owner |
|---|---|---|---|
| CASE-INFRA-009-06 negative / stage ownership and completion | INFRA-009-FR-01, INFRA-009-FR-02 / INFRA-009-AC-01, INFRA-009-AC-02 | (a) OS ticketをruntime stateの正本にする、(b) Infrastructureが作業承認を発行する、(c) 後続版HRI-L1-015を通常接続で必須化する、(d) 全7製品/L1-023完成までstage startを待つ、を各独立変異にする。通常接続の全体stage release待ち(e)は別negative CASE-INFRA-009-07に分離する。別正常fixtureはCASE-INFRA-009-02に置く。 | (a)(b)(c)(d)を各拒否しowner分離を維持。通常接続は全体release不要で成立し、条件付きstageの部分更新/rollback/未完操作を成功にしない。OS/INFRA ownerへ戻す。 |
| CASE-INFRA-009-07 negative / wait for whole HELIX stage release | INFRA-009-FR-02 / INFRA-009-AC-02 | 通常のstageなしWork/Change接続をHELIX全体stage release構成体の完成待ちにする変異だけを与える。HRI-L1-015やL1-023完成待ちはCASE-INFRA-009-06の独立別変異のまま。 | 通常接続を全体release待ちにせず、HELIX全体stage releaseがなくても成立する固定親scopeを保つ。誤った全体待ち条件のsource/責務がある場合はOSまたはInfrastructureの該当ownerへ戻す。 |
| CASE-INFRA-009-08 negative / partial stage update | INFRA-009-FR-02, INFRA-009-FR-03 / INFRA-009-AC-02, INFRA-009-AC-03 | 条件付きstage fixtureの更新だけを部分適用にする独立変異。stage構成・依存・他receiptは適格のままにする。 | update successを出さず、部分状態と未完operationを保持してOS/INFRA state ownerへ戻す。 |
| CASE-INFRA-009-09 negative / stage rollback failure | INFRA-009-FR-02, INFRA-009-FR-03 / INFRA-009-AC-02, INFRA-009-AC-03 | 条件付きstage fixtureのrollbackだけを失敗させ、更新前のeligible targetを持つ独立変異。 | rollback/connection successを出さず、実runtime revision、eligible rollback target、recovery dutyを保持してOS/INFRA ownerへ戻す。 |
| CASE-INFRA-009-10 negative / unfinished stage operation | INFRA-009-FR-02, INFRA-009-FR-03 / INFRA-009-AC-02, INFRA-009-AC-03 | stage operationを未完のまま停止し、部分結果と停止原因だけを与える独立変異。 | successを出さず、pending operationとstage/runtime stateを保持してOS/INFRA ownerへ戻す。 |

### L2-010 authorized Worker operations

| Case | FR/AC trace | Fixture・操作 | Oracle / owner |
|---|---|---|---|
| CASE-INFRA-010-01 normal read-only | INFRA-010-FR-01, INFRA-010-FR-02 / INFRA-010-AC-01, INFRA-010-AC-02 | declared target/scope/read target、空write-set、適用可能なread authority、valid OS ticket/assignment、009 refを持つread-only observation。 | read-only観測を許し、operationからのwriteを拒否する。declared target resourcesのbefore/after不変を確認し、無関係resource変化はfailureにしない。write authority/005 dutyを要求しない。 |
| CASE-INFRA-010-02 normal state-changing | INFRA-010-FR-01, INFRA-010-FR-02, INFRA-010-FR-04 / INFRA-010-AC-01, INFRA-010-AC-02, INFRA-010-AC-04 | 有効SECURITY authority/Worker contract/ticket/009 ref/update admission acceptedと、該当actionに適用される005 dutyを個別宣言し、Worker result receiptとは別のactual-state observationをtarget/action/revisionで相互参照する。 | 指定範囲のみ開始し、Worker resultとactual stateを別evidenceとして参照で結ぶ。適用不要な005義務は持ち込まない。 |
| CASE-INFRA-010-03 negative / authority | INFRA-010-FR-01, INFRA-010-FR-04 / INFRA-010-AC-01, INFRA-010-AC-04 | wrong target/project/action/revision/scope、expiry、revocation、credential scope mismatchを一項目ずつ独立negative fixtureにする。 | 各 mismatch/expired/revokedで開始前拒否、SECURITY/OSへ返却、secret値は記録しない。 |
| CASE-INFRA-010-04 negative / update admission | INFRA-010-FR-02 / INFRA-010-AC-02 | state-changing operationだけにdenied/unknown/mismatch/expired admissionを一つずつ与える。read-only対照fixtureは同じく有効なread authorityのままにする。 | mutating operation開始0。read-onlyはupdate admission不在だけでは拒否しない。 |
| CASE-INFRA-010-05 independent recovery normal | INFRA-010-FR-03 / INFRA-010-AC-03 | OS/CP停止中に006独立path/別authorityを使うbootstrap/recovery fixtureを宣言し、復旧後result sync receiptも別段で与える。 | 開始時に停止OS ticket/009応答を要求しない。復旧後の同期は010 traceへ記録。 |
| CASE-INFRA-010-06 negative / dependency route | INFRA-010-FR-03 / INFRA-010-AC-03 | OS停止中に通常OS/009 routeだけが利用可能なfixture、または006 path/authority欠落を個別に与える。 | operation開始0。006 path/SECURITY authorityの提供ownerへ返す。006側へresult sync義務は追加しない。 |
| CASE-INFRA-010-07 unseen normal | INFRA-010-FR-01, INFRA-010-FR-03 / INFRA-010-AC-01, INFRA-010-AC-03 | 新しいresource identityとscope内の同じ限定bootstrap/recovery actionを独立宣言する。 | 未見resourceだけで拒否せず、全 authority条件を照合する。操作集合を増やさない。 |
| CASE-INFRA-010-08 partial execution/owner return | INFRA-010-FR-04 / INFRA-010-AC-04 | operation途中のfailureで一部stateだけ変わったfixtureを入力し、責務原因はSECURITY/OS/INFRAごとに別case。 | success不可。actual before/after、receipt、未完recovery/rollback dutyを保持し原因ownerへ返す。 |
| CASE-INFRA-010-09 negative / read-only write attempt | INFRA-010-FR-01 / INFRA-010-AC-01 | CASE-INFRA-010-01と同じdeclared target/scope/read targetを使い、read-only operationから対象resourceへのwriteを試行する。 | writeを適用前に拒否し、operation起因の対象resource変更を認めない。read-onlyの分類をmutatingとして通さない。 |
| CASE-INFRA-010-10 negative contrast / unrelated state change | INFRA-010-FR-01 / INFRA-010-AC-01 | read-only operation中にdeclared read target外の無関係resourceだけが独立に変化するfixtureを用いる。declared target resourcesは変化させない。 | 無関係resourceのglobal digest差だけではread-only operationを失敗にしない。判定対象はdeclared target resourcesのbefore/afterとoperationのwrite-setに限る。 |
| CASE-INFRA-010-11 negative / credential persistence planes | INFRA-010-FR-01 / INFRA-010-AC-01 | 同じsynthetic credential referenceについて、normal resource stateへの保存、SECURITY条件なしのbackup保存、SECURITY条件なしのsnapshot保存を各独立変異で試す。秘密値はfixtureへ書かない。 | 3面の保存変異を独立に保存前に拒否し、SECURITY/OSへ戻す。backup/snapshot条件がunknownならSECURITYへ戻す。credential reference/必要metadataのみを保持する。 |
| CASE-INFRA-010-12 negative / unbounded shell | INFRA-010-FR-01 / INFRA-010-AC-01 | Worker requestからoperation-scoped command境界を外し、unbounded Shell実行だけを変異する。 | 開始前に拒否し、違反・未完義務を保持してSECURITY/OSへ戻す。 |
| CASE-INFRA-010-13 negative / worker reply without state evidence | INFRA-010-FR-01, INFRA-010-FR-04 / INFRA-010-AC-01, INFRA-010-AC-04 | Worker success replyだけを与え、別のactual before/after state evidenceを欠落させる。 | 変更成功と扱わずactual state unknown、operation receiptと未完義務を保持して実状態を担うInfrastructure ownerへ戻す。authority/scope違反が別途判明した場合だけ、その違反をSECURITY/OSへ戻す。 |
| CASE-INFRA-010-14 negative / INFRA authority issuance | INFRA-010-FR-01 / INFRA-010-AC-01 | 他条件正常のままINFRAがpolicy/authorityを自分で発行する変異を与える。 | authorityを無効として開始前拒否し、SECURITY authority ownerへ戻す。 |
| CASE-INFRA-010-15 negative / duty unknown or unmet | INFRA-010-FR-01, INFRA-010-FR-02 / INFRA-010-AC-01, INFRA-010-AC-02 | 適用されるL2-005 dutyをunknown、または未充足にそれぞれ独立変更する。 | state-changing operationを保留し、適用duty owner/OSへ戻す。 |
| CASE-INFRA-010-16 negative / normal ticket and assignment | INFRA-010-FR-02 / INFRA-010-AC-02 | 通常routeでticket欠落とassignment欠落を別々に与える。 | operationを開始せずOSへ戻す。 |
| CASE-INFRA-010-17 negative / recovery exemption reuse | INFRA-010-FR-02, INFRA-010-FR-03 / INFRA-010-AC-02, INFRA-010-AC-03 | OS稼働中の通常operationへ独立recovery routeのticket exemptionを流用する。 | 通常route条件を満たさないため開始せず、OSへ戻す。 |
| CASE-INFRA-010-18 negative / read-only authority applicability | INFRA-010-FR-01 / INFRA-010-AC-01 | read-only scopeに対しproject mismatch authorityを与え、他fieldを一致させる。 | read-onlyにもauthority scopeを適用し、開始前拒否する。 |
| CASE-INFRA-010-19 negative / independent-route post-recovery sync | INFRA-010-FR-03, INFRA-010-FR-04 / INFRA-010-AC-03, INFRA-010-AC-04 | CASE-INFRA-010-05と同じ、L2-006独立pathと別SECURITY authorityを用いたbootstrap/recovery routeだけを対象にする。復旧後のOS同期receiptを欠落またはrevision不一致にする。通常OS routeの停止/回収はこのfixtureへ混ぜない。 | successを確定せずactual state/unfinished operation/recovery dutyを保持しOSへ返す。通常routeの停止/回収はINFRA-010-FR-02/AC-02に従い、結果同期を独立routeから借用しない。 |
| CASE-INFRA-010-20 negative / read-only write enforcement evidence missing | INFRA-010-FR-01 / INFRA-010-AC-01 | read-only declarationと空write-setだけを与え、適用されたwrite prohibitionの証拠だけを欠落させる。他のread authority/scope/inputは正常。 | 読取専用宣言だけでは成功扱いせず、SECURITY/OSへ返す。 |
| CASE-INFRA-010-21 negative / read-only before-after evidence missing | INFRA-010-FR-01 / INFRA-010-AC-01 | read-only宣言とwrite禁止証跡を与えるが、対象scopeのbefore/after observationだけを欠落させる。 | 対象scopeの不変確認なしに成功扱いせず、SECURITY/OSへ返す。 |
| CASE-INFRA-010-22 negative / revoked update admission | INFRA-010-FR-02 / INFRA-010-AC-02 | 有効な通常authorityとticketを保ち、state-changing operationのupdate-admissionだけをrevokedにする。read-only対照は別fixtureで適格を保つ。 | 変更適用を開始前に拒否してSECURITYへ戻し、revoked状態と未完変更義務を保持する。read-onlyをupdate-admission不在だけで拒否しない。 |

## Stage 4 追加範囲 — HELIXINFRASTRUCTURE-L2-008/025

この追記は採択済み `HELIXINFRASTRUCTURE-L2-008` と `HELIXINFRASTRUCTURE-L2-025` の1.0候補である。固定要求意味はmain `633bf12ea8f948db8ba3d6600179c4a9507377a7` のL2/L11、PO確認対象は `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。既承認prefixのbytesを保ち、この追記の承認・実装結果は別に判断する。実装順序はG0案Bに従う。後続版、自動配置最適化、高度な自動増減、Web展開を受入条件へ加えない。

### Stage 4 fixtureとoracle

対のL3 INFRA-008/025各ACをシステム境界で照合する設計であり、今回の実装試験結果ではない。合成・非secretのfixtureを用いる。各行は独立CASE IDを持ち、変異の成功を他行へ流用しない。normal、held-out normal、missing/unknown/stale/mismatch、owner戻しを別の入力identityで実行する。未見正常は契約に明示対応する新入力であり、適用不明なら正常ではない。stale判定は既存source契約に従い、新しい時間値やexpiry gateを作らない。固定親pin/旧source処置はL3機能本文と同時点監査へ結ぶ。

| CASE | AC trace | 種別 | 入力と操作 | 期待oracle・戻し先 |
|---|---|---|---|---|
| CASE-INFRA-008-S4-01 | INFRA-008-AC-01, INFRA-008-AC-02 | 正常 | design-core-a/rev-d1/scope-a approved、versioned interface i1。target-a/rev-t4とactual-a/rev-a7を同対象参照で結ぶ。 | 設計/target/actualを別identity/revisionで追跡し、一致比較入力を提供。全canonical設計bytes不変。 |
| CASE-INFRA-008-S4-02 | INFRA-008-AC-02 | drift正常 | 正常とは別fixtureのapproved design-core-b、target-bとactual-bのconfig差。 | 差異を比較入力として保ち、actualをdesign/targetに書換えず変更提案を別状態に保持。 |
| CASE-INFRA-008-S4-03 | INFRA-008-AC-01, INFRA-008-AC-02 | 未見正常 | held-out design-core-uと新resource/environment、支持されたinterfaceで別target/runtime revisionsを与える。 | 契約適用を照合できれば正常にtargetを結ぶ。未知の名前だけで拒否せず、revision文字列の同値を強制しない。 |
| CASE-INFRA-008-S4-04 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign identityだけをmissingにする。他fieldは正常。 | design identityの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-05 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign identityだけをunknownにする。他fieldは正常。 | design identityの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-06 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign identityだけをstaleにする。他fieldは正常。 | design identityの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-07 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign identityだけをmismatchにする。他fieldは正常。 | design identityの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-08 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign revisionだけをmissingにする。他fieldは正常。 | design revisionの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-09 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign revisionだけをunknownにする。他fieldは正常。 | design revisionの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-10 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign revisionだけをstaleにする。他fieldは正常。 | design revisionの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-11 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign revisionだけをmismatchにする。他fieldは正常。 | design revisionの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-12 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign scopeだけをmissingにする。他fieldは正常。 | design scopeの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-13 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign scopeだけをunknownにする。他fieldは正常。 | design scopeの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-14 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign scopeだけをstaleにする。他fieldは正常。 | design scopeの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-15 | INFRA-008-AC-01 | 個別負例 | 正常入力のdesign scopeだけをmismatchにする。他fieldは正常。 | design scopeの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-16 | INFRA-008-AC-01 | 個別負例 | 正常入力の承認状態だけをmissingにする。他fieldは正常。 | 承認状態の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-17 | INFRA-008-AC-01 | 個別負例 | 正常入力の承認状態だけをunknownにする。他fieldは正常。 | 承認状態の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-18 | INFRA-008-AC-01 | 個別負例 | 正常入力の承認状態だけをstaleにする。他fieldは正常。 | 承認状態の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-19 | INFRA-008-AC-01 | 個別負例 | 正常入力の承認状態だけをmismatchにする。他fieldは正常。 | 承認状態の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-20 | INFRA-008-AC-01 | 個別負例 | 正常入力のversioned design interfaceだけをmissingにする。他fieldは正常。 | versioned design interfaceの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-21 | INFRA-008-AC-01 | 個別負例 | 正常入力のversioned design interfaceだけをunknownにする。他fieldは正常。 | versioned design interfaceの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-22 | INFRA-008-AC-01 | 個別負例 | 正常入力のversioned design interfaceだけをstaleにする。他fieldは正常。 | versioned design interfaceの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-23 | INFRA-008-AC-01 | 個別負例 | 正常入力のversioned design interfaceだけをmismatchにする。他fieldは正常。 | versioned design interfaceの問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-24 | INFRA-008-AC-01 | 個別負例 | 正常入力のL2-001 resource/environment参照だけをmissingにする。他fieldは正常。 | L2-001 resource/environment参照の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-25 | INFRA-008-AC-01 | 個別負例 | 正常入力のL2-001 resource/environment参照だけをunknownにする。他fieldは正常。 | L2-001 resource/environment参照の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-26 | INFRA-008-AC-01 | 個別負例 | 正常入力のL2-001 resource/environment参照だけをstaleにする。他fieldは正常。 | L2-001 resource/environment参照の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-27 | INFRA-008-AC-01 | 個別負例 | 正常入力のL2-001 resource/environment参照だけをmismatchにする。他fieldは正常。 | L2-001 resource/environment参照の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-28 | INFRA-008-AC-01 | 個別負例 | 正常入力のL2-002 comparison参照だけをmissingにする。他fieldは正常。 | L2-002 comparison参照の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-29 | INFRA-008-AC-01 | 個別負例 | 正常入力のL2-002 comparison参照だけをunknownにする。他fieldは正常。 | L2-002 comparison参照の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-30 | INFRA-008-AC-01 | 個別負例 | 正常入力のL2-002 comparison参照だけをstaleにする。他fieldは正常。 | L2-002 comparison参照の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-31 | INFRA-008-AC-01 | 個別負例 | 正常入力のL2-002 comparison参照だけをmismatchにする。他fieldは正常。 | L2-002 comparison参照の問題範囲でtarget確定/比較成立を保留し、CORE/上流design ownerへ返す。不足と未確認scopeを保持し補完しない。 |
| CASE-INFRA-008-S4-32 | INFRA-008-AC-01, INFRA-008-AC-02 | 境界負例 | 未承認designからtarget確定だけを試みる。他の入力は適用可能。 | 該当誤確定/変更/owner移管/比較を成立扱いにせず、CORE/design ownerへ返し比較保留と入力bytesを保持する。 |
| CASE-INFRA-008-S4-33 | INFRA-008-AC-01, INFRA-008-AC-02 | 境界負例 | actual値をapproved designへ上書きだけを試みる。他の入力は適用可能。 | 該当誤確定/変更/owner移管/比較を成立扱いにせず、CORE/design ownerへ返し比較保留と入力bytesを保持する。 |
| CASE-INFRA-008-S4-34 | INFRA-008-AC-01, INFRA-008-AC-02 | 境界負例 | drift解消としてtargetを無言上書きだけを試みる。他の入力は適用可能。 | 該当誤確定/変更/owner移管/比較を成立扱いにせず、CORE/design ownerへ返し比較保留と入力bytesを保持する。 |
| CASE-INFRA-008-S4-35 | INFRA-008-AC-01, INFRA-008-AC-02 | 境界負例 | INFRAへCORE設計意味ownerを移すだけを試みる。他の入力は適用可能。 | 該当誤確定/変更/owner移管/比較を成立扱いにせず、CORE/design ownerへ返し比較保留と入力bytesを保持する。 |
| CASE-INFRA-008-S4-36 | INFRA-008-AC-01, INFRA-008-AC-02 | 境界負例 | COREをruntime actual ownerにするだけを試みる。他の入力は適用可能。 | 該当誤確定/変更/owner移管/比較を成立扱いにせず、CORE/design ownerへ返し比較保留と入力bytesを保持する。 |
| CASE-INFRA-008-S4-37 | INFRA-008-AC-01, INFRA-008-AC-02 | 境界負例 | 変更提案だけで設計変更を実施だけを試みる。他の入力は適用可能。 | 該当誤確定/変更/owner移管/比較を成立扱いにせず、CORE/design ownerへ返し比較保留と入力bytesを保持する。 |
| CASE-INFRA-008-S4-38 | INFRA-008-AC-01, INFRA-008-AC-02 | 境界負例 | 変更提案だけで実操作を実施だけを試みる。他の入力は適用可能。 | 該当誤確定/変更/owner移管/比較を成立扱いにせず、CORE/design ownerへ返し比較保留と入力bytesを保持する。 |
| CASE-INFRA-008-S4-39 | INFRA-008-AC-01, INFRA-008-AC-02 | 境界負例 | 別environmentのactualを対象比較へ結ぶだけを試みる。他の入力は適用可能。 | 該当誤確定/変更/owner移管/比較を成立扱いにせず、actualの資源source ownerへ返し比較保留と入力bytesを保持する。 |
| CASE-INFRA-025-S4-01 | INFRA-025-AC-01, INFRA-025-AC-02 | 正常 | Worker-w1とresource-r1を別identityにし、OS ticket-t1、要求-q1、責務-o1、Worker実行契約-wc1のsource/revision、必要CPU/memory/GPU/storage/network/process/container、capacity/state、SECURITY条件と実隔離source/revisionを与える。 | 実資源とWorkerを対応づけ、適用属性と実隔離を照合。OS/SECURITYと実資源の正本が分離する。 |
| CASE-INFRA-025-S4-02 | INFRA-025-AC-01, INFRA-025-AC-02 | 未見正常 | 別宣言のWorker-uと新resource-r9、既存契約で適用を説明できる実行方式と実隔離証拠。 | 未見値を固定allowlistへ補完せず、同じ必要参照/条件を満たすscopeで接続成立。 |
| CASE-INFRA-025-S4-03 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のWorker identityだけをmissingにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-04 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のWorker identityだけをunknownにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-05 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のWorker identityだけをstaleにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-06 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のWorker identityだけをmismatchにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-07 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のOS ticket参照だけをmissingにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-08 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のOS ticket参照だけをunknownにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-09 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のOS ticket参照だけをstaleにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-10 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のOS ticket参照だけをmismatchにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-11 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の要求参照だけをmissingにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-12 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の要求参照だけをunknownにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-13 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の要求参照だけをstaleにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-14 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の要求参照だけをmismatchにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-15 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の作業責務参照だけをmissingにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-16 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の作業責務参照だけをunknownにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-17 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の作業責務参照だけをstaleにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-18 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の作業責務参照だけをmismatchにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-19 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のCPUだけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-20 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のCPUだけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-21 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のCPUだけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-22 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のCPUだけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-23 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のmemoryだけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-24 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のmemoryだけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-25 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のmemoryだけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-26 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のmemoryだけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-27 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のGPUだけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-28 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のGPUだけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-29 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のGPUだけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-30 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のGPUだけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-31 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のstorageだけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-32 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のstorageだけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-33 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のstorageだけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-34 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のstorageだけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-35 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のnetworkだけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-36 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のnetworkだけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-37 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のnetworkだけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-38 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のnetworkだけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-39 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のprocess/container環境だけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-40 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のprocess/container環境だけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-41 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のprocess/container環境だけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-42 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | Worker要求量/環境条件は正常に保ち、実資源側の観測value/source/revisionについて適用必須のprocess/container環境だけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-43 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の実資源identityだけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-44 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の実資源identityだけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-45 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の実資源identityだけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-46 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の実資源identityだけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-47 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のcapacityだけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-48 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のcapacityだけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-49 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のcapacityだけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-50 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のcapacityだけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-51 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のstateだけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-52 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のstateだけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-53 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のstateだけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-54 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のstateだけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-55 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のL2-001参照だけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-56 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のL2-001参照だけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-57 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のL2-001参照だけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-58 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のL2-001参照だけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-59 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のL2-003参照だけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-60 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のL2-003参照だけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-61 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のL2-003参照だけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-62 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のL2-003参照だけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-63 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のWorker実行契約だけをmissingにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-64 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のWorker実行契約だけをunknownにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-65 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のWorker実行契約だけをstaleにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-66 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のWorker実行契約だけをmismatchにし、他fieldを正常にする。 | 接続成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-67 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のSECURITY隔離条件だけをmissingにし、他fieldを正常にする。 | 接続成立とせずSECURITYへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-68 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のSECURITY隔離条件だけをunknownにし、他fieldを正常にする。 | 接続成立とせずSECURITYへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-69 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のSECURITY隔離条件だけをstaleにし、他fieldを正常にする。 | 接続成立とせずSECURITYへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-70 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須のSECURITY隔離条件だけをmismatchにし、他fieldを正常にする。 | 接続成立とせずSECURITYへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-71 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の隔離実適用観測だけをmissingにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-72 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の隔離実適用観測だけをunknownにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-73 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の隔離実適用観測だけをstaleにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-74 | INFRA-025-AC-01, INFRA-025-AC-02 | 個別負例 | 適用必須の隔離実適用観測だけをmismatchにし、他fieldを正常にする。 | 接続成立とせず資源ownerへ該当問題を戻す。未完作業と元資源の観測と、移動がある場合は移動先の観測を保持し、unknownを非適用や十分にしない。 |
| CASE-INFRA-025-S4-75 | INFRA-025-AC-01 | 非適用正常 | 既存契約でGPU非適用を明示するCPU-only resourceとWorkerを別fixtureで与える。 | 非適用理由とsourceを保持。GPU不足の推定失敗を作らず、残る適用属性を照合する。 |
| CASE-INFRA-025-S4-76 | INFRA-025-AC-02 | 資源不足 | 正常の実capacityだけを必要容量未満にする。 | 接続成立とせず資源ownerへ返す。OS作業参照と未完義務を保持する。 |
| CASE-INFRA-025-S4-77 | INFRA-025-AC-02 | 隔離不能 | 他の入力は正常で、その資源方式ではSECURITY条件を実施できない。 | 接続成立とせずSECURITYへ戻し、利用資源の実状態と未完義務を保持。policyを変更しない。 |
| CASE-INFRA-025-S4-78 | INFRA-025-AC-02 | 宣言のみ | SECURITY条件と隔離宣言は存在するが実適用の観測を持たない。 | 宣言だけで隔離成立とせず実観測を担う資源ownerへ戻す。SECURITY条件自体が不明ならSECURITYへ返し、未観測を保持。 |
| CASE-INFRA-025-S4-79 | INFRA-025-AC-03 | 移動正常 | 既存操作契約下で同じWorker/ticket/要求/責務をresource-r1からr2へ接続し、両resourceの前後source/revisionと未完作業を別々に記録。 | 作業参照を保持、元/移動先状態を区別し、資源変更でWorker責務を消さない。 |
| CASE-INFRA-025-S4-80 | INFRA-025-AC-03 | 移動未見正常 | 独立のWorker-u2と資源x/yへ同一作業参照を結び、既存契約に適用する移動結果を与える。 | 新資源名称だけで拒否せず、旧資源の成功を移動先へ転用せず各実状態を照合。 |
| CASE-INFRA-025-S4-81 | INFRA-025-AC-03, INFRA-025-AC-04 | 移動負例 | ticket参照を移動後に消去だけを独立変異にする。 | 接続/移動成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。元/移動先と未完の既知情報を保持し、正本を移管しない。 |
| CASE-INFRA-025-S4-82 | INFRA-025-AC-03, INFRA-025-AC-04 | 移動負例 | 要求参照を移動後に消去だけを独立変異にする。 | 接続/移動成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。元/移動先と未完の既知情報を保持し、正本を移管しない。 |
| CASE-INFRA-025-S4-83 | INFRA-025-AC-03, INFRA-025-AC-04 | 移動負例 | Worker責務参照を移動後に消去だけを独立変異にする。 | 接続/移動成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。元/移動先と未完の既知情報を保持し、正本を移管しない。 |
| CASE-INFRA-025-S4-84 | INFRA-025-AC-03, INFRA-025-AC-04 | 移動負例 | 未完義務を移動後に消去だけを独立変異にする。 | 接続/移動成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。元/移動先と未完の既知情報を保持し、正本を移管しない。 |
| CASE-INFRA-025-S4-85 | INFRA-025-AC-03, INFRA-025-AC-04 | 移動負例 | 元資源状態を消去だけを独立変異にする。 | 接続/移動成立とせず資源ownerへ該当問題を戻す。元/移動先と未完の既知情報を保持し、正本を移管しない。 |
| CASE-INFRA-025-S4-86 | INFRA-025-AC-03, INFRA-025-AC-04 | 移動負例 | 移動先状態を欠落だけを独立変異にする。 | 接続/移動成立とせず資源ownerへ該当問題を戻す。元/移動先と未完の既知情報を保持し、正本を移管しない。 |
| CASE-INFRA-025-S4-87 | INFRA-025-AC-03, INFRA-025-AC-04 | 移動負例 | 旧資源のsuccessを新資源currentへ流用だけを独立変異にする。 | 接続/移動成立とせず資源ownerへ該当問題を戻す。元/移動先と未完の既知情報を保持し、正本を移管しない。 |
| CASE-INFRA-025-S4-88 | INFRA-025-AC-03, INFRA-025-AC-04 | 移動負例 | ticket正本をINFRAへ移管だけを独立変異にする。 | 接続/移動成立とせずOSまたは既存作業参照ownerへ該当問題を戻す。元/移動先と未完の既知情報を保持し、正本を移管しない。 |
| CASE-INFRA-025-S4-89 | INFRA-025-AC-03 | 移動状態 | 資源移動を失敗とする独立fixture。 | 失敗/部分/停止を成功にしない。同作業lineageと未完義務/両resource状態を保つ。revision変更時は新適用条件を照合し、資源ownerまたはOS/SECURITYの該当ownerへ戻す。 |
| CASE-INFRA-025-S4-90 | INFRA-025-AC-03 | 移動状態 | 資源移動を部分移動とする独立fixture。 | 失敗/部分/停止を成功にしない。同作業lineageと未完義務/両resource状態を保つ。revision変更時は新適用条件を照合し、資源ownerまたはOS/SECURITYの該当ownerへ戻す。 |
| CASE-INFRA-025-S4-91 | INFRA-025-AC-03 | 移動状態 | 資源移動を停止後同scope再開とする独立fixture。 | 停止中は未完を保持する。再開時に適用条件と両資源状態を再照合できれば同作業lineageで接続を再開し、失敗だけを資源ownerまたはOS/SECURITYの該当ownerへ戻す。 |
| CASE-INFRA-025-S4-92 | INFRA-025-AC-03 | 移動状態 | 資源移動を再開時revision変更とする独立fixture。 | 停止中は未完を保持する。再開時に適用条件と両資源状態を再照合できれば同作業lineageで接続を再開し、失敗だけを資源ownerまたはOS/SECURITYの該当ownerへ戻す。 |
| CASE-INFRA-025-S4-93 | INFRA-025-AC-01, INFRA-025-AC-04 | 境界負例 | Workerをmachine identityへ同一化だけを正常入力へ加える。 | 該当する誤identity/owner/権限代用/追加条件を成立させず、OSまたは既存作業参照ownerへ該当問題を戻す。最適化/高度増減だけの欠如で適格な接続を不合格にしない。 |
| CASE-INFRA-025-S4-94 | INFRA-025-AC-01, INFRA-025-AC-04 | 境界負例 | INFRAがWorker assignmentを発行だけを正常入力へ加える。 | 該当する誤identity/owner/権限代用/追加条件を成立させず、OSへ該当問題を戻す。最適化/高度増減だけの欠如で適格な接続を不合格にしない。 |
| CASE-INFRA-025-S4-95 | INFRA-025-AC-01, INFRA-025-AC-04 | 境界負例 | INFRAがSECURITY policyを変更だけを正常入力へ加える。 | 該当する誤identity/owner/権限代用/追加条件を成立させず、SECURITYへ該当問題を戻す。最適化/高度増減だけの欠如で適格な接続を不合格にしない。 |
| CASE-INFRA-025-S4-96 | INFRA-025-AC-01, INFRA-025-AC-04 | 境界負例 | INFRAが操作authorityを発行だけを正常入力へ加える。 | 該当する誤identity/owner/権限代用/追加条件を成立させず、SECURITYへ該当問題を戻す。最適化/高度増減だけの欠如で適格な接続を不合格にしない。 |
| CASE-INFRA-025-S4-97 | INFRA-025-AC-01, INFRA-025-AC-04 | 境界負例 | 資源接続結果だけでL2-010構成体を受入だけを正常入力へ加える。 | 接続結果をL2-010の操作許可や構成体受入へ代用せず、接続とL2-010の検証を別に保持する。 |
| CASE-INFRA-025-S4-98 | INFRA-025-AC-01, INFRA-025-AC-04 | 境界負例 | 自動配置最適化欠如を本接続の失敗条件にするだけを正常入力へ加える。 | 最適化/高度増減の欠如だけでは適格な接続を不合格にしない。接続の成立条件と観測結果を保持し、配置判断や別ownerへの戻しを生成しない。 |
| CASE-INFRA-025-S4-99 | INFRA-025-AC-01, INFRA-025-AC-04 | 境界負例 | 高度な自動増減欠如を本接続の失敗条件にするだけを正常入力へ加える。 | 最適化/高度増減の欠如だけでは適格な接続を不合格にしない。接続の成立条件と観測結果を保持し、配置判断や別ownerへの戻しを生成しない。 |
| CASE-INFRA-025-S4-100 | INFRA-025-AC-02, INFRA-025-AC-03 | owner不明 | 資源不足のsourceは判明しているが資源ownerを識別できない。 | 戻し先を推測せず未解決owner、未完作業、元資源と移動先の観測状態を保持し接続成立を示さない。 |
| CASE-INFRA-008-S4-40 | INFRA-008-AC-02 | 比較入力負例 | target identityだけをmissingにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-41 | INFRA-008-AC-02 | 比較入力負例 | target identityだけをunknownにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-42 | INFRA-008-AC-02 | 比較入力負例 | target identityだけをstaleにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-43 | INFRA-008-AC-02 | 比較入力負例 | target identityだけをmismatchにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-44 | INFRA-008-AC-02 | 比較入力負例 | target revisionだけをmissingにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-45 | INFRA-008-AC-02 | 比較入力負例 | target revisionだけをunknownにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-46 | INFRA-008-AC-02 | 比較入力負例 | target revisionだけをstaleにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-47 | INFRA-008-AC-02 | 比較入力負例 | target revisionだけをmismatchにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-48 | INFRA-008-AC-02 | 比較入力負例 | target scopeだけをmissingにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-49 | INFRA-008-AC-02 | 比較入力負例 | target scopeだけをunknownにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-50 | INFRA-008-AC-02 | 比較入力負例 | target scopeだけをstaleにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-51 | INFRA-008-AC-02 | 比較入力負例 | target scopeだけをmismatchにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-52 | INFRA-008-AC-02 | 比較入力負例 | target sourceだけをmissingにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-53 | INFRA-008-AC-02 | 比較入力負例 | target sourceだけをunknownにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-54 | INFRA-008-AC-02 | 比較入力負例 | target sourceだけをstaleにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-55 | INFRA-008-AC-02 | 比較入力負例 | target sourceだけをmismatchにし、designは適用可能に保つ。 | 当該比較を保留し、CORE/design ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-56 | INFRA-008-AC-02 | 比較入力負例 | actual identityだけをmissingにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-57 | INFRA-008-AC-02 | 比較入力負例 | actual identityだけをunknownにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-58 | INFRA-008-AC-02 | 比較入力負例 | actual identityだけをstaleにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-59 | INFRA-008-AC-02 | 比較入力負例 | actual identityだけをmismatchにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-60 | INFRA-008-AC-02 | 比較入力負例 | actual revisionだけをmissingにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-61 | INFRA-008-AC-02 | 比較入力負例 | actual revisionだけをunknownにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-62 | INFRA-008-AC-02 | 比較入力負例 | actual revisionだけをstaleにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-63 | INFRA-008-AC-02 | 比較入力負例 | actual revisionだけをmismatchにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-64 | INFRA-008-AC-02 | 比較入力負例 | actual scopeだけをmissingにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-65 | INFRA-008-AC-02 | 比較入力負例 | actual scopeだけをunknownにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-66 | INFRA-008-AC-02 | 比較入力負例 | actual scopeだけをstaleにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-67 | INFRA-008-AC-02 | 比較入力負例 | actual scopeだけをmismatchにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-68 | INFRA-008-AC-02 | 比較入力負例 | actual sourceだけをmissingにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-69 | INFRA-008-AC-02 | 比較入力負例 | actual sourceだけをunknownにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-70 | INFRA-008-AC-02 | 比較入力負例 | actual sourceだけをstaleにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-71 | INFRA-008-AC-02 | 比較入力負例 | actual sourceだけをmismatchにし、designは適用可能に保つ。 | 当該比較を保留し、資源source ownerへ不足/不一致を返す。三入力を変更せず未確認scopeを保持する。 |
| CASE-INFRA-008-S4-72 | INFRA-008-AC-02 | 要求変更負例 | 正常比較入力のactual値だけを根拠として上流要求のcanonical bytesを書き換えようとする。他の入力は正常。 | 要求変更を拒否し、全入力bytesを不変に保持してCORE/上流ownerへ返す。観測値から要求承認を生成しない。 |
| CASE-INFRA-008-S4-73 | INFRA-008-AC-02 | 承認生成負例 | actual/design/targetのbytesは一切変更せず、actualにapproved designの承認状態だけを付ける。 | 承認状態の生成を拒否し、入力bytesと既存承認状態を保持してCORE/design ownerへ返す。actualを承認designへ昇格しない。 |

全CASEでinput/output identity、source/revision/scope、適用条件、対象owner、target確定/比較/接続の各状態、保持した未完義務を記録する。025移動は元資源と移動先を別に観測する。必要観測missingは設計上の期待拒否と、後続検証そのものの未実行を分ける。

## Stage 5 追加範囲 — HELIXINFRASTRUCTURE-L2-011

### Stage 5 CASEの入力と単独変異
negative CASEの「対象/版」と「入力」は変異前の正常baseline literalを示し、「変異」に記した一つのfieldだけをそのbaselineへ適用してoracleを評価する。入力欄に変異後の値を重ねて書かない。baselineを既存normal CASEから参照する場合は、そのCASEの正常fixture literalを指す。正常CASEは変異なしで、入力と対象fixtureをそのまま照合する。複合CASEでもunit/connection/compositeの正常baselineを固定し、列挙した一つの変異だけを評価する。`mapping={environment=…,resource=…}`はこの合成fixtureの値記法に限り、規範schemaを定義しない。
各CASEの共通Stage scope identityは `infra-011-stage5-sim`、環境identityは `verification-sim`。両者を別fieldとして保持する。

対象は `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5。以下は実装・実行・配布を許可しない合成fixture設計候補であり、旧runtime/test/CIは起動しない。各CASEは基準scope `infra-011-stage5-sim`、親source revision `sim-r1` に束縛し、同一CASE内では明示した単独変異だけを適用する。ownerが固定親で特定されない場合はunknown。

CASE集合: 86件（unit 54、operation 5、recovery 9、connection/composite 9、scope境界 2、environment/operation negative 6、partial composite 1）。この7区分は形式別の分母である。これはfixture形式別の件数で、意味保証や実行結果を示さない。

「入力」は変異前の合成基準値、「変異」はその値に適用する差分を示す。dot表記は列挙fieldへの選択子であり、`name@revision`のrevision部だけを変える場合はidentityを保持する。normal CASEでは差分を適用しない。

#### CASE-INFRA-011-S5-001 — 項目01 資源identity / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `resource_id=api-db-sim-01; type=database; role=api-state; environment=verification-sim; location=zone-sim-a; resource_revision=sim-r17; dependencies=[db-sim]; lifecycle=active-sim; source=infra-catalog-sim; source_revision=sim-r1; core_design=core-infra-sim@sim-r5`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: resource_id=api-db-sim-01; type=database; role=api-state; environment=verification-sim; location=zone-sim-a; resource_revision=sim-r17; dependencies=[db-sim]; lifecycle=active-sim; source=infra-catalog-sim; source_revision=sim-r1; core_design=core-infra-sim@sim-r5
- oracle: resource identity/type/role/location/version/dependency/lifecycleをそのsource/revisionで照合し、CORE design参照と同一scopeを記録する。operation permissionや別項目の成立は生成しない。
- owner/戻し先: resource source ownerは固定親で未特定=unknown。CORE design参照の問題はCORE design owner
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-002 — 項目01 資源identity / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `resource_id=api-db-sim-01; type=database; role=api-state; environment=verification-sim; location=zone-sim-a; resource_revision=sim-r17; dependencies=[db-sim]; lifecycle=active-sim; source=infra-catalog-sim; source_revision=sim-r1; core_design=core-infra-sim@sim-r5`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: resource_idだけを空欄にする（他fieldは固定）
- 入力: resource_id=api-db-sim-01; type=database; role=api-state; environment=verification-sim; location=zone-sim-a; resource_revision=sim-r17; dependencies=[db-sim]; lifecycle=active-sim; source=infra-catalog-sim; source_revision=sim-r1; core_design=core-infra-sim@sim-r5
- oracle: identity未完として保留し、resource source owner=unknownへ返す。
- owner/戻し先: resource source ownerは固定親で未特定=unknown。CORE design参照の問題はCORE design owner
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-003 — 項目01 資源identity / mismatch

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `resource_id=api-db-sim-01; type=database; role=api-state; environment=verification-sim; location=zone-sim-a; resource_revision=sim-r17; dependencies=[db-sim]; lifecycle=active-sim; source=infra-catalog-sim; source_revision=sim-r1; core_design=core-infra-sim@sim-r5`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: core_design.revisionだけをsim-r6へ変更する
- 入力: resource_id=api-db-sim-01; type=database; role=api-state; environment=verification-sim; location=zone-sim-a; resource_revision=sim-r17; dependencies=[db-sim]; lifecycle=active-sim; source=infra-catalog-sim; source_revision=sim-r1; core_design=core-infra-sim@sim-r5
- oracle: 別設計revisionを合成せずCORE design接続を保留する。
- owner/戻し先: resource source ownerは固定親で未特定=unknown。CORE design参照の問題はCORE design owner
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-004 — 項目02 Topology / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `nodes=[api-sim,db-sim]; path={id=path-sim-01,source=api-sim,destination=db-sim,protocol=tcp,endpoint=db-sim:sim-port,direction=outbound,purpose=state-read,security_boundary=app-to-data,dependency=db-sim,revision=sim-r1}; declared_edge=api-sim→db-sim`。対象scopeは `infra-011-stage5-sim`、環境identityは `verification-sim`、親source revisionは `sim-r1`。
- 変異: 正常fixture。変異なし。
- 入力: nodes=[api-sim,db-sim]; path={id=path-sim-01,source=api-sim,destination=db-sim,protocol=tcp,endpoint=db-sim:sim-port,direction=outbound,purpose=state-read,security_boundary=app-to-data,dependency=db-sim,revision=sim-r1}; declared_edge=api-sim→db-sim
- oracle: 宣言edgeと8 path axesを同じsource/revisionで記録し、nodesおよびdependencyと一致させる。
- owner/戻し先: 正常時は戻し先なし。resource source ownerは固定親で未特定=unknown。宣言設計との不一致はCORE design owner。
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-005 — 項目02 Topology / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `nodes=[api-sim,db-sim]; path={id=path-sim-01,source=api-sim,destination=db-sim,protocol=tcp,endpoint=db-sim:sim-port,direction=outbound,purpose=state-read,security_boundary=app-to-data,dependency=db-sim,revision=sim-r1}; declared_edge=api-sim→db-sim`。対象scopeは `infra-011-stage5-sim`、環境identityは `verification-sim`、親source revisionは `sim-r1`。
- 変異: `path.purpose`だけを空欄にする。
- 入力: nodes=[api-sim,db-sim]; path={id=path-sim-01,source=api-sim,destination=db-sim,protocol=tcp,endpoint=db-sim:sim-port,direction=outbound,purpose=state-read,security_boundary=app-to-data,dependency=db-sim,revision=sim-r1}; declared_edge=api-sim→db-sim
- oracle: topology照合を保留し、未完fieldを保持する。宣言設計との差異が確認されない限り、CORE設計責務を原因にしない。
- owner/戻し先: resource source ownerは固定親で未特定=unknown。宣言設計との不一致が確認された場合だけCORE design owner。
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-006 — 項目02 Topology / mismatch

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `nodes=[api-sim,db-sim]; path={id=path-sim-01,source=api-sim,destination=db-sim,protocol=tcp,endpoint=db-sim:sim-port,direction=outbound,purpose=state-read,security_boundary=app-to-data,dependency=db-sim,revision=sim-r1}; declared_edge=api-sim→db-sim`。対象scopeは `infra-011-stage5-sim`、環境identityは `verification-sim`、親source revisionは `sim-r1`。
- 変異: `path.destination`だけを `cache-sim` へ変更し、declared_edge/nodes/他path axesは保持する。
- 入力: nodes=[api-sim,db-sim]; path={id=path-sim-01,source=api-sim,destination=db-sim,protocol=tcp,endpoint=db-sim:sim-port,direction=outbound,purpose=state-read,security_boundary=app-to-data,dependency=db-sim,revision=sim-r1}; declared_edge=api-sim→db-sim
- oracle: path宣言とnodes/declared_edgeの差を検出し、topology照合を保留する。
- owner/戻し先: 宣言設計との不一致のためCORE design owner。
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-007 — 項目03 Environment / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `environment_id=verification-sim; resource_id=api-db-sim-01; mapping={environment=verification-sim,resource=api-db-sim-01}; environment_refs={verification=verification-sim,production=production-sim}; config_refs={verification=cfg-ver-sim,production=cfg-prod-sim}; network_refs={verification=net-ver-sim,production=net-prod-sim}; credential_scope_refs={verification=cred-scope-ver-sim,production=cred-scope-prod-sim}; data_refs={verification=data-ver-sim,production=data-prod-sim}; version_refs={verification=sim-r17,production=sim-r16}; authority_refs={verification=auth-ver-sim,production=auth-prod-sim}; production_evidence_source=production-sim; production_evidence_result=sim-success; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: environment_id=verification-sim; resource_id=api-db-sim-01; mapping={environment=verification-sim,resource=api-db-sim-01}; environment_refs={verification=verification-sim,production=production-sim}; config_refs={verification=cfg-ver-sim,production=cfg-prod-sim}; network_refs={verification=net-ver-sim,production=net-prod-sim}; credential_scope_refs={verification=cred-scope-ver-sim,production=cred-scope-prod-sim}; data_refs={verification=data-ver-sim,production=data-prod-sim}; version_refs={verification=sim-r17,production=sim-r16}; authority_refs={verification=auth-ver-sim,production=auth-prod-sim}; production_evidence_source=production-sim; production_evidence_result=sim-success; source_revision=sim-r1
- oracle: このfixtureに明示したverification/productionのenvironment identityとconfig/network/credential-scope/data/version/authority参照を分離して記録する。ここにないenvironmentへの被覆は主張しない。verificationの成功をproduction成立の証拠にせず、credential値は含めない。
- owner/戻し先: environment/resource mapping source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-008 — 項目03 Environment / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `environment_id=verification-sim; resource_id=api-db-sim-01; mapping={environment=verification-sim,resource=api-db-sim-01}; environment_refs={verification=verification-sim,production=production-sim}; config_refs={verification=cfg-ver-sim,production=cfg-prod-sim}; network_refs={verification=net-ver-sim,production=net-prod-sim}; credential_scope_refs={verification=cred-scope-ver-sim,production=cred-scope-prod-sim}; data_refs={verification=data-ver-sim,production=data-prod-sim}; version_refs={verification=sim-r17,production=sim-r16}; authority_refs={verification=auth-ver-sim,production=auth-prod-sim}; production_evidence_source=production-sim; production_evidence_result=sim-success; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: mappingだけを空欄にする
- 入力: environment_id=verification-sim; resource_id=api-db-sim-01; mapping={environment=verification-sim,resource=api-db-sim-01}; environment_refs={verification=verification-sim,production=production-sim}; config_refs={verification=cfg-ver-sim,production=cfg-prod-sim}; network_refs={verification=net-ver-sim,production=net-prod-sim}; credential_scope_refs={verification=cred-scope-ver-sim,production=cred-scope-prod-sim}; data_refs={verification=data-ver-sim,production=data-prod-sim}; version_refs={verification=sim-r17,production=sim-r16}; authority_refs={verification=auth-ver-sim,production=auth-prod-sim}; production_evidence_source=production-sim; production_evidence_result=sim-success; source_revision=sim-r1
- oracle: 所属を推定せずenvironment mappingを未完としてsource owner=unknownへ返す。
- owner/戻し先: environment/resource mapping source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-009 — 項目03 Environment / mismatch

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `environment_id=verification-sim; resource_id=api-db-sim-01; mapping={environment=verification-sim,resource=api-db-sim-01}; environment_refs={verification=verification-sim,production=production-sim}; config_refs={verification=cfg-ver-sim,production=cfg-prod-sim}; network_refs={verification=net-ver-sim,production=net-prod-sim}; credential_scope_refs={verification=cred-scope-ver-sim,production=cred-scope-prod-sim}; data_refs={verification=data-ver-sim,production=data-prod-sim}; version_refs={verification=sim-r17,production=sim-r16}; authority_refs={verification=auth-ver-sim,production=auth-prod-sim}; production_evidence_source=production-sim; production_evidence_result=sim-success; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: mapping.environmentだけをproduction-simへ変更する
- 入力: environment_id=verification-sim; resource_id=api-db-sim-01; mapping={environment=verification-sim,resource=api-db-sim-01}; environment_refs={verification=verification-sim,production=production-sim}; config_refs={verification=cfg-ver-sim,production=cfg-prod-sim}; network_refs={verification=net-ver-sim,production=net-prod-sim}; credential_scope_refs={verification=cred-scope-ver-sim,production=cred-scope-prod-sim}; data_refs={verification=data-ver-sim,production=data-prod-sim}; version_refs={verification=sim-r17,production=sim-r16}; authority_refs={verification=auth-ver-sim,production=auth-prod-sim}; production_evidence_source=production-sim; production_evidence_result=sim-success; source_revision=sim-r1
- oracle: verification対象とproduction mappingを混同せず不一致として保留する。
- owner/戻し先: environment/resource mapping source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-010 — 項目04 Desired/Actual分離 / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `design={record=design-sim@sim-r5,resource=api-db-sim-01,scope=verification-sim}; target={record=target-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim}; actual={record=actual-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim,observation=sim-observed}; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: design={record=design-sim@sim-r5,resource=api-db-sim-01,scope=verification-sim}; target={record=target-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim}; actual={record=actual-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim,observation=sim-observed}; source_revision=sim-r1
- oracle: design/target/actualのrecord identityは別々に保ち、同じ対象resource/scopeへの参照を照合する。actualをdesign承認済み状態へ昇格しない。
- owner/戻し先: desired side CORE design owner。actual resource source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-011 — 項目04 Desired/Actual分離 / mismatch

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `design={record=design-sim@sim-r5,resource=api-db-sim-01,scope=verification-sim}; target={record=target-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim}; actual={record=actual-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim,observation=sim-observed}; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: actual.resourceだけをapi-db-sim-02へ変更する
- 入力: design={record=design-sim@sim-r5,resource=api-db-sim-01,scope=verification-sim}; target={record=target-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim}; actual={record=actual-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim,observation=sim-observed}; source_revision=sim-r1
- oracle: desired/actualの別記録を保ち差異を表示。expected-state owner=CORE design owner、actual source owner=unknownへ戻す。
- owner/戻し先: desired side CORE design owner。actual resource source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-012 — 項目04 Desired/Actual分離 / unknown

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `design={record=design-sim@sim-r5,resource=api-db-sim-01,scope=verification-sim}; target={record=target-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim}; actual={record=actual-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim,observation=sim-observed}; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: actual.observationだけをunknownにする
- 入力: design={record=design-sim@sim-r5,resource=api-db-sim-01,scope=verification-sim}; target={record=target-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim}; actual={record=actual-sim@sim-r7,resource=api-db-sim-01,scope=verification-sim,observation=sim-observed}; source_revision=sim-r1
- oracle: unknownから一致・driftなしを結論せず、actual source owner=unknownへ返す。
- owner/戻し先: desired side CORE design owner。actual resource source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-013 — 項目05 Drift / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `expected={source_revision=sim-r7,version=sim-r7,config=cfg-sim-r7,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; actual={version=sim-r7,config=cfg-sim-r8,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; comparison_source=sim-compare@sim-r1; difference=config`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: expected={source_revision=sim-r7,version=sim-r7,config=cfg-sim-r7,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; actual={version=sim-r7,config=cfg-sim-r8,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; comparison_source=sim-compare@sim-r1; difference=config
- oracle: expected/actualの各比較fieldを記録し、示されたconfig差分だけをdriftとして返す。capacity採否や自動修正を生成しない。
- owner/戻し先: expected-state CORE design owner。actual source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-014 — 項目05 Drift / unknown

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `expected={source_revision=sim-r7,version=sim-r7,config=cfg-sim-r7,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; actual={version=sim-r7,config=cfg-sim-r8,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; comparison_source=sim-compare@sim-r1; difference=config`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: actual.configだけをunknownにする
- 入力: expected={source_revision=sim-r7,version=sim-r7,config=cfg-sim-r7,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; actual={version=sim-r7,config=cfg-sim-r8,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; comparison_source=sim-compare@sim-r1; difference=config
- oracle: drift有無を結論せずunknownを保持しactual source owner=unknownへ返す。
- owner/戻し先: expected-state CORE design owner。actual source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-015 — 項目05 Drift / stale

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `expected={source_revision=sim-r7,version=sim-r7,config=cfg-sim-r7,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; actual={version=sim-r7,config=cfg-sim-r8,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; comparison_source=sim-compare@sim-r1; difference=config`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: expected.source_revisionだけをsim-r6へ戻す
- 入力: expected={source_revision=sim-r7,version=sim-r7,config=cfg-sim-r7,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; actual={version=sim-r7,config=cfg-sim-r8,network=net-sim-a,permission=perm-sim-a,capacity_ref=capacity-sim-r1,dependencies=[db-sim]}; comparison_source=sim-compare@sim-r1; difference=config
- oracle: 現行性を推定せず比較を保留しCORE design ownerへ返す。
- owner/戻し先: expected-state CORE design owner。actual source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-016 — 項目06 Compute/Network/Storage / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `compute={resource=worker-host-sim,cpu=2-vCPU,memory=4-GiB}; network={path=path-sim-01,protocol=tcp,direction=outbound,purpose=state-read,boundary=app-to-data}; persistent_storage={id=state-vol-sim,kind=persistent,owner=storage-owner-sim,durability=sim-durable,backup=backup-sim-01,retention=retention-sim-01,environment=verification-sim,confidentiality=confidential-sim,recovery=recovery-sim-01}; temporary_storage={id=cache-vol-sim,kind=temporary,owner=storage-owner-sim,durability=sim-ephemeral,backup=not-applicable-sim,retention=retention-sim-02,environment=verification-sim,confidentiality=internal-sim,recovery=not-applicable-sim}; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: compute={resource=worker-host-sim,cpu=2-vCPU,memory=4-GiB}; network={path=path-sim-01,protocol=tcp,direction=outbound,purpose=state-read,boundary=app-to-data}; persistent_storage={id=state-vol-sim,kind=persistent,owner=storage-owner-sim,durability=sim-durable,backup=backup-sim-01,retention=retention-sim-01,environment=verification-sim,confidentiality=confidential-sim,recovery=recovery-sim-01}; temporary_storage={id=cache-vol-sim,kind=temporary,owner=storage-owner-sim,durability=sim-ephemeral,backup=not-applicable-sim,retention=retention-sim-02,environment=verification-sim,confidentiality=internal-sim,recovery=not-applicable-sim}; source_revision=sim-r1
- oracle: compute/network/永続・一時storageの属性と観測値をsource付きで記録する。recoveryを含む固定7属性を保持する。network.pathは項目02の`path-sim-01`を参照し、8 path軸の評価は項目02で行う。
- owner/戻し先: resource source ownerは固定親で未特定=unknown。宣言設計との不一致はCORE design owner。CONNECTは論理接続とphysical pathの区別に限る。
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-017 — 項目06 Compute/Network/Storage / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `compute={resource=worker-host-sim,cpu=2-vCPU,memory=4-GiB}; network={path=path-sim-01,protocol=tcp,direction=outbound,purpose=state-read,boundary=app-to-data}; persistent_storage={id=state-vol-sim,kind=persistent,owner=storage-owner-sim,durability=sim-durable,backup=backup-sim-01,retention=retention-sim-01,environment=verification-sim,confidentiality=confidential-sim,recovery=recovery-sim-01}; temporary_storage={id=cache-vol-sim,kind=temporary,owner=storage-owner-sim,durability=sim-ephemeral,backup=not-applicable-sim,retention=retention-sim-02,environment=verification-sim,confidentiality=internal-sim,recovery=not-applicable-sim}; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: persistent_storage.recoveryだけを空欄にする
- 入力: compute={resource=worker-host-sim,cpu=2-vCPU,memory=4-GiB}; network={path=path-sim-01,protocol=tcp,direction=outbound,purpose=state-read,boundary=app-to-data}; persistent_storage={id=state-vol-sim,kind=persistent,owner=storage-owner-sim,durability=sim-durable,backup=backup-sim-01,retention=retention-sim-01,environment=verification-sim,confidentiality=confidential-sim,recovery=recovery-sim-01}; temporary_storage={id=cache-vol-sim,kind=temporary,owner=storage-owner-sim,durability=sim-ephemeral,backup=not-applicable-sim,retention=retention-sim-02,environment=verification-sim,confidentiality=internal-sim,recovery=not-applicable-sim}; source_revision=sim-r1
- oracle: 永続storageのrecovery参照を未完としてsource owner=unknownへ返す。その他のfieldはbaselineを保持する。
- owner/戻し先: resource source ownerは固定親で未特定=unknown。宣言設計との不一致はCORE design owner。CONNECTは論理接続とphysical pathの区別に限る。
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-018 — 項目06 Compute/Network/Storage / unknown

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `compute={resource=worker-host-sim,cpu=2-vCPU,memory=4-GiB}; network={path=path-sim-01,protocol=tcp,direction=outbound,purpose=state-read,boundary=app-to-data}; persistent_storage={id=state-vol-sim,kind=persistent,owner=storage-owner-sim,durability=sim-durable,backup=backup-sim-01,retention=retention-sim-01,environment=verification-sim,confidentiality=confidential-sim,recovery=recovery-sim-01}; temporary_storage={id=cache-vol-sim,kind=temporary,owner=storage-owner-sim,durability=sim-ephemeral,backup=not-applicable-sim,retention=retention-sim-02,environment=verification-sim,confidentiality=internal-sim,recovery=not-applicable-sim}; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: network.boundaryだけをunknownにする
- 入力: compute={resource=worker-host-sim,cpu=2-vCPU,memory=4-GiB}; network={path=path-sim-01,protocol=tcp,direction=outbound,purpose=state-read,boundary=app-to-data}; persistent_storage={id=state-vol-sim,kind=persistent,owner=storage-owner-sim,durability=sim-durable,backup=backup-sim-01,retention=retention-sim-01,environment=verification-sim,confidentiality=confidential-sim,recovery=recovery-sim-01}; temporary_storage={id=cache-vol-sim,kind=temporary,owner=storage-owner-sim,durability=sim-ephemeral,backup=not-applicable-sim,retention=retention-sim-02,environment=verification-sim,confidentiality=internal-sim,recovery=not-applicable-sim}; source_revision=sim-r1
- oracle: network path照合を保留し、resource sourceまたは設計ownerは固定親で特定できなければunknown。CONNECTは論理接続とphysical pathの区別に限る。
- owner/戻し先: resource source ownerは固定親で未特定=unknown。宣言設計との不一致はCORE design owner。CONNECTは論理接続とphysical pathの区別に限る。
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-019 — 項目07 Model/Worker Runtime / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `model={id=model-sim,revision=model-r2}; worker={id=worker-sim,contract=worker-contract-sim@sim-r3}; binding={worker=worker-sim,resource=worker-host-sim}; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: model={id=model-sim,revision=model-r2}; worker={id=worker-sim,contract=worker-contract-sim@sim-r3}; binding={worker=worker-sim,resource=worker-host-sim}; source_revision=sim-r1
- oracle: model/runtime/Worker identity、contract revision、resource bindingを別fieldで照合し、modelの存在でWorker実行を推定しない。
- owner/戻し先: Worker契約の責務ownerは固定親で未特定=unknown。runtime/resource source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-020 — 項目07 Model/Worker Runtime / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `model={id=model-sim,revision=model-r2}; worker={id=worker-sim,contract=worker-contract-sim@sim-r3}; binding={worker=worker-sim,resource=worker-host-sim}; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: binding.resourceだけを空欄にする
- 入力: model={id=model-sim,revision=model-r2}; worker={id=worker-sim,contract=worker-contract-sim@sim-r3}; binding={worker=worker-sim,resource=worker-host-sim}; source_revision=sim-r1
- oracle: Worker応答をresource bindingへ代用しない。欠けたunit/connection ownerが固定親で特定されない場合はunknownとする。resource source owner=unknown。
- owner/戻し先: 欠けたunit/connection ownerは固定親で未特定=unknown。runtime/resource source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-021 — 項目07 Model/Worker Runtime / stale

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `model={id=model-sim,revision=model-r2}; worker={id=worker-sim,contract=worker-contract-sim@sim-r3}; binding={worker=worker-sim,resource=worker-host-sim}; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: worker.contract.revisionだけをsim-r2へ変更する
- 入力: model={id=model-sim,revision=model-r2}; worker={id=worker-sim,contract=worker-contract-sim@sim-r3}; binding={worker=worker-sim,resource=worker-host-sim}; source_revision=sim-r1
- oracle: current contractと照合できない状態を保持し、欠けたunit/connection ownerは固定親で未特定のためunknownとする。
- owner/戻し先: 欠けたunit/connection ownerは固定親で未特定=unknown。runtime/resource source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-022 — 項目08 Capacity / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none
- oracle: capacity/utilization/queue/concurrency/saturation/rejection/backpressureの観測値を記録し、数値から安全性・配置・費用採否を結論しない。
- owner/戻し先: capacity measurement source owner=unknown。起動要求なしのCASEではOS/INTELLIGENCEへの起動要求returnは非適用。起動要求を含む場合はL2-003:59に従いOS/INTELLIGENCEへ未完状態とresource snapshotを保持して戻す。採否はOSまたはINTELLIGENCEの既存判断、合成値は閾値/採否ではない
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-023 — 項目08 Capacity / unknown

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: capacity_observation.queue_depthだけをunknownにする
- 入力: capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none
- oracle: 安全受入/配置採否を導かず、queue観測unknownを保持してmeasurement source owner=unknownへ返す。
- owner/戻し先: capacity measurement source owner=unknown。起動要求なしのCASEではOS/INTELLIGENCEへの起動要求returnは非適用。起動要求を含む場合はL2-003:59に従いOS/INTELLIGENCEへ未完状態とresource snapshotを保持して戻す。採否はOSまたはINTELLIGENCEの既存判断、合成値は閾値/採否ではない
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-024 — 項目08 Capacity / unobserved

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: capacity_observation.cpu_usedだけを未観測にする
- 入力: capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none
- oracle: 可観測性欠落として保持し、safe capacityを結論しない。
- owner/戻し先: capacity measurement source owner=unknown。起動要求なしのCASEではOS/INTELLIGENCEへの起動要求returnは非適用。起動要求を含む場合はL2-003:59に従いOS/INTELLIGENCEへ未完状態とresource snapshotを保持して戻す。採否はOSまたはINTELLIGENCEの既存判断、合成値は閾値/採否ではない
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-025 — 項目09 Observability / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `signals={health=sim-healthy,metric=sim-metric,log=sim-log,resource=api-db-sim-01,dependency=db-sim,queue=sim-queue,error=sim-no-signal,latency=sim-observation,recovery_state=sim-recovery-ready}; collector={id=collector-sim,state=available}; deployment_revision=sim-r1; coverage=declared-sim-scope`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: signals={health=sim-healthy,metric=sim-metric,log=sim-log,resource=api-db-sim-01,dependency=db-sim,queue=sim-queue,error=sim-no-signal,latency=sim-observation,recovery_state=sim-recovery-ready}; collector={id=collector-sim,state=available}; deployment_revision=sim-r1; coverage=declared-sim-scope
- oracle: 列挙したsignalとcollector state、coverageを同一source/revisionで記録する。synthetic error signal不在を実環境のerror-zero保証にしない。
- owner/戻し先: observation/collector source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-026 — 項目09 Observability / unobserved

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `signals={health=sim-healthy,metric=sim-metric,log=sim-log,resource=api-db-sim-01,dependency=db-sim,queue=sim-queue,error=sim-no-signal,latency=sim-observation,recovery_state=sim-recovery-ready}; collector={id=collector-sim,state=available}; deployment_revision=sim-r1; coverage=declared-sim-scope`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: collector.stateだけをunobservedへ変更する
- 入力: signals={health=sim-healthy,metric=sim-metric,log=sim-log,resource=api-db-sim-01,dependency=db-sim,queue=sim-queue,error=sim-no-signal,latency=sim-observation,recovery_state=sim-recovery-ready}; collector={id=collector-sim,state=available}; deployment_revision=sim-r1; coverage=declared-sim-scope
- oracle: 観測不能を正常/error-zeroへ変換せず、未観測scopeを記録してcollector source owner=unknownへ返す。
- owner/戻し先: observation/collector source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-027 — 項目09 Observability / unknown

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `signals={health=sim-healthy,metric=sim-metric,log=sim-log,resource=api-db-sim-01,dependency=db-sim,queue=sim-queue,error=sim-no-signal,latency=sim-observation,recovery_state=sim-recovery-ready}; collector={id=collector-sim,state=available}; deployment_revision=sim-r1; coverage=declared-sim-scope`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: coverageだけをunknownにする
- 入力: signals={health=sim-healthy,metric=sim-metric,log=sim-log,resource=api-db-sim-01,dependency=db-sim,queue=sim-queue,error=sim-no-signal,latency=sim-observation,recovery_state=sim-recovery-ready}; collector={id=collector-sim,state=available}; deployment_revision=sim-r1; coverage=declared-sim-scope
- oracle: 代表範囲を推定せずcoverage unknownを保持する。
- owner/戻し先: observation/collector source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-028 — 項目10 Incident state / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `runtime_state=degraded-sim; observation={signal=sim-signal-01,state=degraded-sim,source=collector-sim@sim-r1}; incident_classification={value=sim-approved-classification,source=approved-policy-sim@sim-r2,revision=sim-r2}`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: runtime_state=degraded-sim; observation={signal=sim-signal-01,state=degraded-sim,source=collector-sim@sim-r1}; incident_classification={value=sim-approved-classification,source=approved-policy-sim@sim-r2,revision=sim-r2}
- oracle: 分類参照は入力されたapproved policy source/revisionに結び、incident declaration/severity/closureを独自生成しない。
- owner/戻し先: approved incident-meaning ownerが入力で特定できればそのowner、特定できなければunknown。observation source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-029 — 項目10 Incident state / unknown

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `runtime_state=degraded-sim; observation={signal=sim-signal-01,state=degraded-sim,source=collector-sim@sim-r1}; incident_classification={value=sim-approved-classification,source=approved-policy-sim@sim-r2,revision=sim-r2}`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: runtime_stateだけをunknownにする
- 入力: runtime_state=degraded-sim; observation={signal=sim-signal-01,state=degraded-sim,source=collector-sim@sim-r1}; incident_classification={value=sim-approved-classification,source=approved-policy-sim@sim-r2,revision=sim-r2}
- oracle: 観測済みdegraded stateをunknownへ丸めず、unknownのruntime_stateはunknownのまま保持する。observation source owner=unknownへ戻し、incident classification/severityは生成しない。
- owner/戻し先: 観測stateの欠落・不一致はobservation source owner=unknownへ戻す。incident meaningはこのfixtureで判定しない。
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-030 — 項目10 Incident state / unauthorized

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `runtime_state=degraded-sim; observation={signal=sim-signal-01,state=degraded-sim,source=collector-sim@sim-r1}; incident_classification={value=sim-approved-classification,source=approved-policy-sim@sim-r2,revision=sim-r2}`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: incident_classification.sourceだけをunapproved-source-sim@sim-r2へ変更する
- 入力: runtime_state=degraded-sim; observation={signal=sim-signal-01,state=degraded-sim,source=collector-sim@sim-r1}; incident_classification={value=sim-approved-classification,source=approved-policy-sim@sim-r2,revision=sim-r2}
- oracle: 未承認分類からincident meaning/severityを生成しない。runtime_state=degraded-simとobservation.state=degraded-simは分類参照の不適合と別に保持する。meaning ownerが入力で特定されなければunknown。
- owner/戻し先: 未承認sourceはmeaning ownerを示さないためunknown。observation source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-031 — 項目11 Backup/Restore / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `backup={artifact=backup-sim-01,source_revision=sim-r7,time=sim-time-01,completeness=sim-complete,location=sim-location,integrity=sim-ok,expiry=sim-policy-ref}; restore={result=sim-verified,target=api-db-sim-01,revision=sim-r7,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok}; scope=verification-sim`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: backup={artifact=backup-sim-01,source_revision=sim-r7,time=sim-time-01,completeness=sim-complete,location=sim-location,integrity=sim-ok,expiry=sim-policy-ref}; restore={result=sim-verified,target=api-db-sim-01,revision=sim-r7,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok}; scope=verification-sim
- oracle: backup artifact/job metadataとrestore integrity/reconnect/startup/verificationを別resultとして記録し、この合成例のrestore結果をverification済みとする。
- owner/戻し先: state owner / recovery design owner（固定L2の役割）。OS work/change ownerはOS operation requestがこのunit fixtureにないため非適用。個別source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-032 — 項目11 Backup/Restore / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `backup={artifact=backup-sim-01,source_revision=sim-r7,time=sim-time-01,completeness=sim-complete,location=sim-location,integrity=sim-ok,expiry=sim-policy-ref}; restore={result=sim-verified,target=api-db-sim-01,revision=sim-r7,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok}; scope=verification-sim`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: restore.verificationだけを欠落させる
- 入力: backup={artifact=backup-sim-01,source_revision=sim-r7,time=sim-time-01,completeness=sim-complete,location=sim-location,integrity=sim-ok,expiry=sim-policy-ref}; restore={result=sim-verified,target=api-db-sim-01,revision=sim-r7,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok}; scope=verification-sim
- oracle: backup成功をrestore成功へ代用せずrestoreを未完にしrecovery design ownerへ返す。
- owner/戻し先: state owner / recovery design owner（固定L2の役割）。OS work/change ownerはOS operation requestがこのunit fixtureにないため非適用。個別source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-033 — 項目11 Backup/Restore / mismatch

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `backup={artifact=backup-sim-01,source_revision=sim-r7,time=sim-time-01,completeness=sim-complete,location=sim-location,integrity=sim-ok,expiry=sim-policy-ref}; restore={result=sim-verified,target=api-db-sim-01,revision=sim-r7,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok}; scope=verification-sim`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: restore.revisionだけをsim-r6へ変更する
- 入力: backup={artifact=backup-sim-01,source_revision=sim-r7,time=sim-time-01,completeness=sim-complete,location=sim-location,integrity=sim-ok,expiry=sim-policy-ref}; restore={result=sim-verified,target=api-db-sim-01,revision=sim-r7,integrity=sim-ok,dependency_reconnect=sim-ok,startup=sim-ok,verification=sim-ok}; scope=verification-sim
- oracle: backup source revisionとの不一致を保持しrecovery design ownerへ返す。
- owner/戻し先: state owner / recovery design owner（固定L2の役割）。OS work/change ownerはOS operation requestがこのunit fixtureにないため非適用。個別source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-034 — 項目12 Rollback / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `rollback={target_revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7,result=sim-verified}; current_revision=sim-r8; unfinished_duty=none`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: rollback={target_revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7,result=sim-verified}; current_revision=sim-r8; unfinished_duty=none
- oracle: rollback targetとartifact/config/dependency/data/procedure/resultをcurrent revisionに対して照合し、未完義務なしの合成結果を示す。
- owner/戻し先: recovery design owner。OS operation ownerは適用され入力で特定できる場合、その他はunknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-035 — 項目12 Rollback / mismatch

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `rollback={target_revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7,result=sim-verified}; current_revision=sim-r8; unfinished_duty=none`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: rollback.target_revisionだけをsim-r6へ変更する
- 入力: rollback={target_revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7,result=sim-verified}; current_revision=sim-r8; unfinished_duty=none
- oracle: 現行/適格targetとの不一致でrollback完了を示さずrecovery design ownerへ返す。
- owner/戻し先: recovery design owner。OS operation ownerは適用され入力で特定できる場合、その他はunknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-036 — 項目12 Rollback / unknown

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `rollback={target_revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7,result=sim-verified}; current_revision=sim-r8; unfinished_duty=none`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: rollback.resultだけをunknownにする
- 入力: rollback={target_revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7,result=sim-verified}; current_revision=sim-r8; unfinished_duty=none
- oracle: rollback実行成功を推定せず未完を保持する。
- owner/戻し先: recovery design owner。OS operation ownerは適用され入力で特定できる場合、その他はunknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-037 — 項目13 Deployment version / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `runtime_revision=infra-runtime-sim@sim-r17; runtime_artifact=artifact-sim-r17; os_stage_release=os-stage-sim@sim-r4; identifiers_are_distinct=true; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: runtime_revision=infra-runtime-sim@sim-r17; runtime_artifact=artifact-sim-r17; os_stage_release=os-stage-sim@sim-r4; identifiers_are_distinct=true; source_revision=sim-r1
- oracle: runtime revision/artifactとOS stage release identityを別fieldで記録し、OS stage IDをruntime versionに代用しない。
- owner/戻し先: runtime version source owner=unknown。stage収載時のOS stage identity owner
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-038 — 項目13 Deployment version / mismatch

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `runtime_revision=infra-runtime-sim@sim-r17; runtime_artifact=artifact-sim-r17; os_stage_release=os-stage-sim@sim-r4; identifiers_are_distinct=true; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: runtime_revisionだけをos-stage-sim@sim-r4へ置換する
- 入力: runtime_revision=infra-runtime-sim@sim-r17; runtime_artifact=artifact-sim-r17; os_stage_release=os-stage-sim@sim-r4; identifiers_are_distinct=true; source_revision=sim-r1
- oracle: runtime revisionとOS stage releaseを同一視せずversion照合を保留する。
- owner/戻し先: runtime version source owner=unknown。stage収載時のOS stage identity owner
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-039 — 項目13 Deployment version / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `runtime_revision=infra-runtime-sim@sim-r17; runtime_artifact=artifact-sim-r17; os_stage_release=os-stage-sim@sim-r4; identifiers_are_distinct=true; source_revision=sim-r1`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: runtime_revisionだけを空欄にする
- 入力: runtime_revision=infra-runtime-sim@sim-r17; runtime_artifact=artifact-sim-r17; os_stage_release=os-stage-sim@sim-r4; identifiers_are_distinct=true; source_revision=sim-r1
- oracle: OS stage idからruntime versionを推定せずsource owner=unknownへ返す。
- owner/戻し先: runtime version source owner=unknown。stage収載時のOS stage identity owner
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-040 — 項目14 Security connection / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim}; resource=api-db-sim-01; action=inspect-sim`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim}; resource=api-db-sim-01; action=inspect-sim
- oracle: 通常接続に適用されるSECURITY authority reference/condition/source/revisionを記録する。別authority要件はL2-006独立recoveryだけに限定する。単なるresource観測から権限を生成しない。
- owner/戻し先: SECURITY authority owner。resource source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-041 — 項目14 Security connection / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim}; resource=api-db-sim-01; action=inspect-sim`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: authority.refだけを空欄にする
- 入力: authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim}; resource=api-db-sim-01; action=inspect-sim
- oracle: 接続/operationを許可済みとせずSECURITY authority ownerへ戻す。
- owner/戻し先: SECURITY authority owner。resource source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-042 — 項目14 Security connection / mismatch

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim}; resource=api-db-sim-01; action=inspect-sim`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: authority.conditionだけをscope-production-simへ変更する
- 入力: authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim}; resource=api-db-sim-01; action=inspect-sim
- oracle: 他scope authorityを流用せず接続を保留しSECURITY ownerへ戻す。
- owner/戻し先: SECURITY authority owner。resource source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-043 — 項目15 OS connection / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; runtime={id=api-db-sim-01,revision=infra-runtime-sim@sim-r17}; link={work_ticket=os-work-sim-01,runtime_revision=infra-runtime-sim@sim-r17}`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; runtime={id=api-db-sim-01,revision=infra-runtime-sim@sim-r17}; link={work_ticket=os-work-sim-01,runtime_revision=infra-runtime-sim@sim-r17}
- oracle: OS work/change参照とruntime resource/revision linkを別ownerのsource付きで追跡する。ticketをruntime状態の正本にしない。
- owner/戻し先: OS work/change owner。runtime source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-044 — 項目15 OS connection / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; runtime={id=api-db-sim-01,revision=infra-runtime-sim@sim-r17}; link={work_ticket=os-work-sim-01,runtime_revision=infra-runtime-sim@sim-r17}`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: work.ticketだけを空欄にする
- 入力: work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; runtime={id=api-db-sim-01,revision=infra-runtime-sim@sim-r17}; link={work_ticket=os-work-sim-01,runtime_revision=infra-runtime-sim@sim-r17}
- oracle: OS work/change linkを成立扱いせずOS work/change ownerへ返す。
- owner/戻し先: OS work/change owner。runtime source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-045 — 項目15 OS connection / mismatch

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; runtime={id=api-db-sim-01,revision=infra-runtime-sim@sim-r17}; link={work_ticket=os-work-sim-01,runtime_revision=infra-runtime-sim@sim-r17}`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: link.runtime_revisionだけをinfra-runtime-sim-r16へ変更する
- 入力: work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; runtime={id=api-db-sim-01,revision=infra-runtime-sim@sim-r17}; link={work_ticket=os-work-sim-01,runtime_revision=infra-runtime-sim@sim-r17}
- oracle: 別runtime revisionで補完せずOS connectionを保留する。
- owner/戻し先: OS work/change owner。runtime source owner=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-046 — 項目16 Worker execution / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim; authority_ref=security-authority-sim-01; work_ref=os-work-sim-01`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim; authority_ref=security-authority-sim-01; work_ref=os-work-sim-01
- oracle: Worker contract/assignment、resource mapping、SECURITY/OS referencesを別参照として記録し、resource availabilityだけでexecution成立を推定しない。
- owner/戻し先: 固定L2-025:294のresource owner、OS/SECURITY条件はそれぞれの既存owner。Worker契約の責務ownerは固定親で未特定=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-047 — 項目16 Worker execution / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim; authority_ref=security-authority-sim-01; work_ref=os-work-sim-01`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: worker.contractだけを空欄にする
- 入力: worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim; authority_ref=security-authority-sim-01; work_ref=os-work-sim-01
- oracle: resourceの正常だけでWorker接続を成立させずWorker契約sourceの責務ownerは固定親で未特定のためunknownとして保留する。
- owner/戻し先: Worker契約の責務ownerは固定親で未特定=unknown。別途resource不足がある場合に限り固定L2-025:294のresource ownerへ戻し、OS/SECURITY条件はそれぞれの既存owner
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-048 — 項目16 Worker execution / stale

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim; authority_ref=security-authority-sim-01; work_ref=os-work-sim-01`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: worker.contract.revisionだけをsim-r2へ変更する
- 入力: worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim; authority_ref=security-authority-sim-01; work_ref=os-work-sim-01
- oracle: stale contractをcurrentとして採用せずWorker契約sourceの責務ownerは固定親で未特定のためunknownとして保留する。
- owner/戻し先: Worker契約の責務ownerは固定親で未特定=unknown。別途resource不足がある場合に限り固定L2-025:294のresource ownerへ戻し、OS/SECURITY条件はそれぞれの既存owner
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-049 — 項目17 Bootstrap/Out-of-Band Recovery / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `path={id=oob-path-sim-01,resource=oob-host-sim,depends_on_os=false}; authority={ref=security-authority-sim-oob,source=SECURITY-sim@sim-r3}; worker={contract=worker-contract-oob-sim@sim-r3}; recovery={action=bootstrap-sim,result=sim-verified}; os_ticket=none; post_recovery_sync=sim-recorded`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: path={id=oob-path-sim-01,resource=oob-host-sim,depends_on_os=false}; authority={ref=security-authority-sim-oob,source=SECURITY-sim@sim-r3}; worker={contract=worker-contract-oob-sim@sim-r3}; recovery={action=bootstrap-sim,result=sim-verified}; os_ticket=none; post_recovery_sync=sim-recorded
- oracle: OSに依存しないpath/resource、別authority、Worker contract、recovery resultとOS復帰後syncを個別に記録する。OS ticketは前提にしない。
- owner/戻し先: resource source owner=unknown; SECURITY authority owner; Worker契約sourceの責務ownerは固定親で未特定=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-050 — 項目17 Bootstrap/Out-of-Band Recovery / mismatch

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `path={id=oob-path-sim-01,resource=oob-host-sim,depends_on_os=false}; authority={ref=security-authority-sim-oob,source=SECURITY-sim@sim-r3}; worker={contract=worker-contract-oob-sim@sim-r3}; recovery={action=bootstrap-sim,result=sim-verified}; os_ticket=none; post_recovery_sync=sim-recorded`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: path.depends_on_osだけをtrueにする
- 入力: path={id=oob-path-sim-01,resource=oob-host-sim,depends_on_os=false}; authority={ref=security-authority-sim-oob,source=SECURITY-sim@sim-r3}; worker={contract=worker-contract-oob-sim@sim-r3}; recovery={action=bootstrap-sim,result=sim-verified}; os_ticket=none; post_recovery_sync=sim-recorded
- oracle: OS停止中の独立pathと認めずrecoveryを保留しresource source owner=unknownへ返す。
- owner/戻し先: resource source owner=unknown; SECURITY authority owner; Worker契約sourceの責務ownerは固定親で未特定=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-051 — 項目17 Bootstrap/Out-of-Band Recovery / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `path={id=oob-path-sim-01,resource=oob-host-sim,depends_on_os=false}; authority={ref=security-authority-sim-oob,source=SECURITY-sim@sim-r3}; worker={contract=worker-contract-oob-sim@sim-r3}; recovery={action=bootstrap-sim,result=sim-verified}; os_ticket=none; post_recovery_sync=sim-recorded`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: authority.refだけを空欄にする
- 入力: path={id=oob-path-sim-01,resource=oob-host-sim,depends_on_os=false}; authority={ref=security-authority-sim-oob,source=SECURITY-sim@sim-r3}; worker={contract=worker-contract-oob-sim@sim-r3}; recovery={action=bootstrap-sim,result=sim-verified}; os_ticket=none; post_recovery_sync=sim-recorded
- oracle: independent path/Worker結果があっても許可済みrecoveryと扱わずSECURITY ownerへ返す。
- owner/戻し先: resource source owner=unknown; SECURITY authority owner; Worker契約sourceの責務ownerは固定親で未特定=unknown
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-052 — 項目18 Rebuildability / 正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `rebuild={inputs=[artifact-sim-r17,config-sim-r17,data-sim-r17],dependency_reconnect=sim-ok,startup_verification=sim-ok,result=sim-verified}; scope=verification-sim; revision=sim-r17`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 基準入力。記載field/valueをそのまま提示し、他項目・共通scope・source revisionは固定。
- 入力: rebuild={inputs=[artifact-sim-r17,config-sim-r17,data-sim-r17],dependency_reconnect=sim-ok,startup_verification=sim-ok,result=sim-verified}; scope=verification-sim; revision=sim-r17
- oracle: artifact/config/data inputs、dependency reconnection、startup verification、resultを同じruntime revisionへ結び、文書/backupの存在だけでrebuildableとしない。
- owner/戻し先: rebuild/recovery ownerは固定親で未特定=unknown。該当dependency責務ownerはinputで特定できる範囲だけ
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-053 — 項目18 Rebuildability / missing

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `rebuild={inputs=[artifact-sim-r17,config-sim-r17,data-sim-r17],dependency_reconnect=sim-ok,startup_verification=sim-ok,result=sim-verified}; scope=verification-sim; revision=sim-r17`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: rebuild.dependency_reconnectだけを欠落させる
- 入力: rebuild={inputs=[artifact-sim-r17,config-sim-r17,data-sim-r17],dependency_reconnect=sim-ok,startup_verification=sim-ok,result=sim-verified}; scope=verification-sim; revision=sim-r17
- oracle: input/document存在からrebuildabilityを推定せず未完を保持、該当dependency ownerが不明ならunknown。
- owner/戻し先: rebuild/recovery ownerは固定親で未特定=unknown。該当dependency責務ownerはinputで特定できる範囲だけ
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-054 — 項目18 Rebuildability / mismatch

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `rebuild={inputs=[artifact-sim-r17,config-sim-r17,data-sim-r17],dependency_reconnect=sim-ok,startup_verification=sim-ok,result=sim-verified}; scope=verification-sim; revision=sim-r17`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: revisionだけをsim-r16へ変更する
- 入力: rebuild={inputs=[artifact-sim-r17,config-sim-r17,data-sim-r17],dependency_reconnect=sim-ok,startup_verification=sim-ok,result=sim-verified}; scope=verification-sim; revision=sim-r17
- oracle: 別revisionのrebuild evidenceを流用せずrebuild/recovery owner=unknownへ返す。
- owner/戻し先: rebuild/recovery ownerは固定親で未特定=unknown。該当dependency責務ownerはinputで特定できる範囲だけ
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-055 — 操作別 通常read-only正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `request={target=api-db-sim-01,action=inspect-sim,revision=infra-runtime-sim@sim-r17,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,target=api-db-sim-01,target_revision=infra-runtime-sim@sim-r17,action=inspect-sim,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1}; os={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim@sim-r17}; write_scope=declared; write_set=empty; writes=none; before=sim-r1; after=sim-r1`。対象scopeは `infra-011-stage5-sim`、環境identityは `verification-sim`、親source revisionは `sim-r1`。
- 変異: 正常fixture。変異なし。18 unit itemの値は再判定しない。
- 入力: request={target=api-db-sim-01,action=inspect-sim,revision=infra-runtime-sim@sim-r17,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,target=api-db-sim-01,target_revision=infra-runtime-sim@sim-r17,action=inspect-sim,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1}; os={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim@sim-r17}; write_scope=declared; write_set=empty; writes=none; before=sim-r1; after=sim-r1
- oracle: L2-010に従いtarget/action/revision/scope/expiry、SECURITY authority、SECURITY制約下Worker契約、通常OS assignment/ticketとL2-009 Work/Change接続を個別に確認する。宣言scope内のwrite-setは空でwriteは許されず、writeなし・operation起因の状態変更なしを照合する。read-onlyへ適用根拠のないrecovery dutyは要求しない。
- owner/戻し先: 正常時は戻し先なし。各参照の不一致・欠落時だけ既存SECURITY/Worker/OS source ownerへ戻し、owner未特定はunknown。
- trace: `INFRA-011-AC-03/04`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-056 — 操作別 適用recovery duty付きstate change正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `request={target=api-db-sim-01,action=replace-sim,revision=sim-r2,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,target=api-db-sim-01,target_revision=sim-r2,action=replace-sim,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; update_admission=accepted; worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1}; os={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim@sim-r17}; applicable_duty=restore-check-sim; duty_result=sim-verified; before=sim-r1; after=sim-r2`。対象scopeは `infra-011-stage5-sim`、環境identityは `verification-sim`、親source revisionは `sim-r1`。
- 変異: 正常fixture。変異なし。18 unit itemの値は再判定しない。
- 入力: request={target=api-db-sim-01,action=replace-sim,revision=sim-r2,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,target=api-db-sim-01,target_revision=sim-r2,action=replace-sim,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; update_admission=accepted; worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1}; os={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim@sim-r17}; applicable_duty=restore-check-sim; duty_result=sim-verified; before=sim-r1; after=sim-r2
- oracle: L2-010に従いtarget/action/revision/scope/expiry、有効なSECURITY authority、accepted update admission、SECURITY制約下Worker契約、通常OS assignment/ticketとL2-009 Work/Change接続、適用recovery dutyを個別に照合する。before/after stateと義務resultを記録し、実operation許可は生成しない。
- owner/戻し先: 正常時は戻し先なし。欠落・不一致は該当SECURITY/OS/Worker/recovery source ownerへ戻し、固定親で特定されないownerはunknown。
- trace: `INFRA-011-AC-03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-057 — 操作別 既存契約に基づくupdate正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `request={target=api-db-sim-01,action=update-sim,revision=sim-r2,scope=infra-011-stage5-sim,environment=verification-sim}; security_authority=security-authority-sim-01; update_admission=accepted; worker_contract=worker-contract-sim@sim-r3; os_work=os-work-sim-01; before=sim-r1; after=sim-r2; result=sim-applied`。対象scopeは `infra-011-stage5-sim`、環境identityは `verification-sim`、親source revisionは `sim-r1`。
- 変異: 正常fixture。変異なし。18 unit itemの値は再判定しない。
- 入力: request={target=api-db-sim-01,action=update-sim,revision=sim-r2,scope=infra-011-stage5-sim,environment=verification-sim}; security_authority=security-authority-sim-01; update_admission=accepted; worker_contract=worker-contract-sim@sim-r3; os_work=os-work-sim-01; before=sim-r1; after=sim-r2; result=sim-applied
- oracle: L2-010のtarget/action/revision/scope、SECURITY authority、accepted update admission、Worker契約、OS work/change、実結果を個別に照合する。候補文書から許可を作らない。
- owner/戻し先: 正常時は戻し先なし。個別参照の不一致はその参照の固定ownerへ戻し、owner未特定ならunknown。
- trace: `INFRA-011-AC-02/03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-058 — 操作別 OS停止中のindependent recovery正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `os_state=down-sim; os_ticket=none; path={id=oob-path-sim-01,depends_on_os=false}; security_authority=security-authority-sim-oob; worker_contract=worker-contract-oob-sim@sim-r3; action=bootstrap-sim; result=sim-verified; after_os_up_sync=sim-recorded`。対象scopeは `infra-011-stage5-sim`、環境identityは `verification-sim`、親source revisionは `sim-r1`。
- 変異: 正常fixture。変異なし。18 unit itemの値は再判定しない。
- 入力: os_state=down-sim; os_ticket=none; path={id=oob-path-sim-01,depends_on_os=false}; security_authority=security-authority-sim-oob; worker_contract=worker-contract-oob-sim@sim-r3; action=bootstrap-sim; result=sim-verified; after_os_up_sync=sim-recorded
- oracle: ticket/assignmentを要求せず、independent path/resource、別SECURITY authority、制約下Worker契約、実結果と復帰後同期を各々照合する。ticket不要は通常操作へ一般化しない。
- owner/戻し先: 正常時は戻し先なし。resource source owner未特定はunknownとして記録し、正常fixtureから差戻しを生成しない。
- trace: `INFRA-011-AC-04`。合成fixtureの設計候補であり未実行.

#### CASE-INFRA-011-S5-059 — 復旧境界 restore結果欠落

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-031 normal fixture。current_active_revision=sim-r8、eligible_rollback_target=sim-r7、os_operation_request=noneは固定する。
- 変異: `restore.result`だけをmissingへ変更。
- 入力: baseline=CASE-INFRA-011-S5-031.normal; current_active_revision=sim-r8; eligible_rollback_target=sim-r7; os_operation_request=none
- oracle: backupとrestoreを別判定しrestore成功へ昇格しない。current active revisionとeligible rollback targetを保持する。recovery design ownerへ戻す。OS work/change ownerはOS操作要求が本fixtureにないため非適用。
- owner/戻し先: recovery design owner。具体owner/source ownerは固定親で未特定ならunknown。
- trace: `INFRA-011-AC-03`。合成fixtureの設計候補であり未実行.

#### CASE-INFRA-011-S5-060 — 復旧境界 restore integrity失敗

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-031 normal fixture。current_active_revision=sim-r8、eligible_rollback_target=sim-r7、os_operation_request=noneは固定する。
- 変異: `restore.integrity`だけをsim-failedへ変更。
- 入力: baseline=CASE-INFRA-011-S5-031.normal; current_active_revision=sim-r8; eligible_rollback_target=sim-r7; os_operation_request=none
- oracle: restore失敗を保持し成功/rollback完了にしない。current active revisionとeligible rollback targetを保持する。recovery design ownerへ戻す。OS work/change ownerはOS操作要求がないため非適用。
- owner/戻し先: recovery design owner。具体owner/source ownerは固定親で未特定ならunknown。
- trace: `INFRA-011-AC-03`。合成fixtureの設計候補であり未実行.

#### CASE-INFRA-011-S5-061 — 復旧境界 dependency reconnect未観測

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-031 normal fixture。current_active_revision=sim-r8、eligible_rollback_target=sim-r7、os_operation_request=noneは固定する。
- 変異: `restore.dependency_reconnect`だけをunobservedへ変更。
- 入力: baseline=CASE-INFRA-011-S5-031.normal; current_active_revision=sim-r8; eligible_rollback_target=sim-r7; os_operation_request=none
- oracle: unobservedを成功へ丸めずrestore/rebuild未完とし、current active revisionとeligible rollback targetを保持する。OS work/change ownerはOS操作要求がないため非適用。
- owner/戻し先: dependency source owner=unknown、recovery design owner。
- trace: `INFRA-011-AC-03`。合成fixtureの設計候補であり未実行.

#### CASE-INFRA-011-S5-062 — 復旧境界 independent path欠落

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-064 normal fixture。
- 変異: `independent_path`だけをmissingへ変更。
- 入力: baseline=CASE-INFRA-011-S5-064.normal
- oracle: restoreからbootstrap/recoveryを推定しない。稼働版と未完義務を保持しrecoveryを保留する。
- owner/戻し先: independent resource source owner=unknown。
- trace: `INFRA-011-AC-03/04`。合成fixtureの設計候補であり未実行.

#### CASE-INFRA-011-S5-063 — 復旧境界 rebuild startup失敗

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-052 normal fixture。current_active_revision=sim-r8、eligible_rollback_target=sim-r7は固定する。
- 変異: `rebuild.startup_verification`だけをsim-failedへ変更。
- 入力: `baseline=CASE-INFRA-011-S5-052.normal; current_active_revision=sim-r8; eligible_rollback_target=sim-r7`
- oracle: rebuildabilityを別判定で失敗として部分結果、current active revision、eligible rollback target、未完義務を保持する。
- owner/戻し先: rebuild/recovery owner=unknown（固定親で未特定）。
- trace: `INFRA-011-AC-03`。合成fixtureの設計候補であり未実行.

#### CASE-INFRA-011-S5-064 — 復旧境界 OS停止中ticketなしの正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `scope=infra-011-stage5-sim; environment=verification-sim; source_revision=sim-r1; os_state=down-sim; os_ticket=none; independent_path=sim-available; security_authority=sim-authorized; worker_contract=sim-current; recovery.result=sim-verified; after_os_up_sync=sim-recorded`。
- 変異: 正常fixture。変異なし。
- 入力: `baseline={scope=infra-011-stage5-sim,environment=verification-sim,source_revision=sim-r1,os_state=down-sim,os_ticket=none,independent_path=sim-available,security_authority=sim-authorized,worker_contract=sim-current,recovery.result=sim-verified,after_os_up_sync=sim-recorded}`
- oracle: OS ticket欠落を独立recovery拒否理由にしない。独立path/authority/Worker/resultと復帰後同期を別々に確認する。ticket不要を通常操作へ一般化しない。
- owner/戻し先: 正常時は戻し先なし。
- trace: `INFRA-011-AC-04`。合成fixtureの設計候補であり未実行.

#### CASE-INFRA-011-S5-065 — 復旧境界 independent authority欠落

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-064 normal fixture。
- 変異: `security_authority`だけをmissingへ変更。
- 入力: baseline=CASE-INFRA-011-S5-064.normal; security_authority=missing
- oracle: 許可済みrecoveryと扱わず停止し、未完義務と最終適格revisionを保持する。
- owner/戻し先: SECURITY authority owner。
- trace: `INFRA-011-AC-04`。合成fixtureの設計候補であり未実行.

#### CASE-INFRA-011-S5-066 — 復旧境界 復旧後operation同期欠落

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-058 normal fixture。
- 変異: `after_os_up_sync`だけをmissingへ変更。
- 入力: baseline=CASE-INFRA-011-S5-058.normal; after_os_up_sync=missing
- oracle: recovery resultは保持するがconnection/compositeは未完とし、未完同期を消さない。
- owner/戻し先: OS work/change owner。同期source ownerが特定できなければunknown。
- trace: `INFRA-011-AC-04`。合成fixtureの設計候補であり未実行.

#### CASE-INFRA-011-S5-067 — 復旧境界 OS-014 stage収載時の正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `scope=infra-011-stage5-sim; environment=verification-sim; source_revision=sim-r1; stage_release_inclusion=true; os_014_stage_ref=os-stage-sim@sim-r4; requested_evidence=none`。
- 変異: 正常fixture。変異なし。
- 入力: 上記の全fieldをそのまま提示する。
- oracle: OS-014は実際にOS Stage releaseへ収載する場合だけstage integration evidenceとして別照合する。通常のL2-011 1.0受入の前提にはしない。顧客runtimeや後続版機能はこのfixtureへ加えない。
- owner/戻し先: 正常時は戻し先なし。
- trace: `INFRA-011-AC-04`。合成fixtureの設計候補であり未実行.

#### CASE-INFRA-011-S5-068 — 接続/合成 CORE design参照欠落

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `unit_results=CASE-INFRA-011-S5-072.normal.unit_results; core_design={id=core-infra-sim,revision=sim-r5}; target_scope=infra-011-stage5-sim`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: core_design.revisionだけをmissingにする
- 入力: unit_results=CASE-INFRA-011-S5-072.normal.unit_results; core_design={id=core-infra-sim,revision=sim-r5}; target_scope=infra-011-stage5-sim
- oracle: CORE接続だけ保留しCORE design ownerへ戻す。
- owner/戻し先: CORE design owner
- trace: `INFRA-011-AC-02`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-069 — 接続/合成 OS work/change参照欠落

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `runtime={id=api-db-sim-01,revision=infra-runtime-sim@sim-r17}; os_work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; action=deploy-sim`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: os_work.ticketだけをmissingにする
- 入力: runtime={id=api-db-sim-01,revision=infra-runtime-sim@sim-r17}; os_work={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim}; action=deploy-sim
- oracle: OS connectionを保留しOS work/change ownerへ戻す。CASE-INFRA-011-S5-058のOS停止中独立recoveryへticket要件を足さない。
- owner/戻し先: OS work/change owner
- trace: `INFRA-011-AC-02`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-070 — 接続/合成 SECURITY authority欠落

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `resource=api-db-sim-01; action=inspect-sim; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim,scope=infra-011-stage5-sim,environment=verification-sim}`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: security_authority.refだけをmissingにする
- 入力: resource=api-db-sim-01; action=inspect-sim; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,condition=scope-infra-011-stage5-sim,scope=infra-011-stage5-sim,environment=verification-sim}
- oracle: 許可済みconnection/operationとせずSECURITY authority ownerへ戻す。
- owner/戻し先: SECURITY authority owner
- trace: `INFRA-011-AC-02`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-071 — 接続/合成 Worker contract欠落

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: worker.contractだけをmissingにする
- 入力: worker={id=worker-sim,contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01}; resource={id=worker-host-sim,revision=sim-r1}; mapping=worker-sim→worker-host-sim
- oracle: 資源対応の成功でWorker connectionを成立させずWorker契約の責務ownerは固定親で未特定=unknownとして保留する。
- owner/戻し先: 欠けたunit/connection ownerは固定親で未特定=unknown
- trace: `INFRA-011-AC-02`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-072 — 接続/合成 composite正常

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `unit_results={CASE-INFRA-011-S5-001=normal@sim-r1,CASE-INFRA-011-S5-004=normal@sim-r1,CASE-INFRA-011-S5-007=normal@sim-r1,CASE-INFRA-011-S5-010=normal@sim-r1,CASE-INFRA-011-S5-013=normal@sim-r1,CASE-INFRA-011-S5-016=normal@sim-r1,CASE-INFRA-011-S5-019=normal@sim-r1,CASE-INFRA-011-S5-022=normal@sim-r1,CASE-INFRA-011-S5-025=normal@sim-r1,CASE-INFRA-011-S5-028=normal@sim-r1,CASE-INFRA-011-S5-031=normal@sim-r1,CASE-INFRA-011-S5-034=normal@sim-r1,CASE-INFRA-011-S5-037=normal@sim-r1,CASE-INFRA-011-S5-040=normal@sim-r1,CASE-INFRA-011-S5-043=normal@sim-r1,CASE-INFRA-011-S5-046=normal@sim-r1,CASE-INFRA-011-S5-049=normal@sim-r1,CASE-INFRA-011-S5-052=normal@sim-r1}; connections={CORE={design=core-infra-sim@sim-r5,target_scope=infra-011-stage5-sim};OS={work=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim@sim-r17};SECURITY={authority=security-authority-sim-01@sim-r3,scope=infra-011-stage5-sim,environment=verification-sim};Worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1,mapping=worker-sim→worker-host-sim}}; scope=infra-011-stage5-sim; environment=verification-sim; source_revision=sim-r1; current_active_revision=sim-r8; eligible_rollback_target={revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7}; composite_result={state=sim-complete,unfinished_duties=[]}`。
- 変異: 正常fixture。変異なし。列挙した18 normal unit fixtureと4 normal connection tupleを使う。CASE-029 unknownとCASE-047 missingは含めない。
- 入力: 上記全fieldをそのまま提示する。unit results、4 connection tuple、稼働版、適格rollback先、composite result、未完義務をそれぞれ明示する。
- oracle: 18 unit、各connection、compositeを別々に記録し、未完義務なしとする。独立business outcome/approval/release/executionは生成しない。
- owner/戻し先: 正常時は戻し先なし。未完時のみ該当するunit/connection ownerへ戻し、固定親で特定されなければunknown。
- trace: `INFRA-011-AC-03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-073 — 接続/合成 composite CORE revision不一致

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `unit_results=CASE-INFRA-011-S5-072.normal.unit_results; core_design={id=core-infra-sim,revision=sim-r5}; expected_core_revision=sim-r5; other_connections=normal`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: core_design.revisionだけをsim-r6へ変更する
- 入力: unit_results=CASE-INFRA-011-S5-072.normal.unit_results; core_design={id=core-infra-sim,revision=sim-r5}; expected_core_revision=sim-r5; other_connections=normal
- oracle: unit resultは保持しCORE connection/compositeを保留。CORE design ownerへ戻す。
- owner/戻し先: CORE design owner
- trace: `INFRA-011-AC-02/03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-074 — 接続/合成 composite restore証拠欠落

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `unit_results=CASE-INFRA-011-S5-072.normal.unit_results excluding CASE-INFRA-011-S5-031; recovery=CASE-INFRA-011-S5-031.normal; os_operation_request=none`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: restore.verificationだけをmissingへ変更する
- 入力: unit_results=CASE-INFRA-011-S5-072.normal.unit_results excluding CASE-INFRA-011-S5-031; recovery=CASE-INFRA-011-S5-031.normal; os_operation_request=none
- oracle: backup/他項目の部分成功は保持しcompositeを保留。recovery design ownerへ戻す。OS work/change ownerはOS操作要求がこのfixtureにないため非適用。
- owner/戻し先: recovery design owner（具体ownerは固定親で未特定ならunknown）
- trace: `INFRA-011-AC-03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-075 — 接続/合成 capacity採否の独立decision_refなし

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 正常fixture。変異なし。
- 入力: capacity_observation={resource=worker-host-sim,cpu_used=1-vCPU,cpu_capacity=2-vCPU,memory_used=2-GiB,memory_capacity=4-GiB,utilization=sim-observation-50pct,queue_depth=3-sim-observation,concurrency=1-sim-observation,saturation=sim-observation-low,rejection=sim-observation-none,backpressure=sim-observation-active,source=capacity-sim@sim-r1}; decision_ref=none
- oracle: infra観測の記録は可能。OS/INTELLIGENCE採否を要求/代行せず、compositeから採否を生成しない。
- owner/戻し先: 戻し先なし。capacity採否はOSまたはINTELLIGENCE decision ownerの既存所管で、本fixtureは判断を要求しない。
- trace: `INFRA-011-AC-01/03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-076 — 接続/合成 外部authority非生成

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、fixture `unit_results=CASE-INFRA-011-S5-072.normal.unit_results; connections=CASE-INFRA-011-S5-072.normal.connections; external_approval=none; execution_state=not_requested`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: 正常fixture。変異なし。
- 入力: unit_results=CASE-INFRA-011-S5-072.normal.unit_results; connections=CASE-INFRA-011-S5-072.normal.connections; external_approval=none; execution_state=not_requested
- oracle: L3候補から承認・実装・操作・配布状態を生成しない。
- owner/戻し先: 戻し先なし。authority/approval/実行stateはこのL3候補から生成しない。
- trace: `INFRA-011-AC-01..04`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-077 — scope境界 後続版条件の暗黙前提化

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `scope=infra-011-stage5-sim; version_target=1.0; later_feature=not_requested`。
- 変異: `later_feature`だけを`automated_failover`へ変更。
- 入力: scope=infra-011-stage5-sim; version_target=1.0; later_feature=not_requested
- oracle: 後続版条件を1.0構成の前提へ暗黙に加えず不適合とする。owner/承認を新設しない。
- owner/戻し先: 戻し先なし。対象外条件として保持する。
- trace: `INFRA-011-AC-04`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-078 — scope境界 HELIX-WEB顧客runtime混入

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baseline `scope=infra-011-stage5-sim; version_target=1.0; HELIX-WEB-customer-runtime=excluded; included_runtime=none`。対象scopeは `infra-011-stage5-sim`、親source revisionは `sim-r1`。
- 変異: `included_runtime`だけを`HELIX-WEB-customer-runtime-sim`へ変更。
- 入力: scope=infra-011-stage5-sim; version_target=1.0; HELIX-WEB-customer-runtime=excluded; included_runtime=none
- oracle: HELIX-WEB顧客runtimeを本体構成体へ混ぜたため不適合とし、1.0成立にしない。
- owner/戻し先: 戻し先なし。L2-011 scope外として保持する。
- trace: `INFRA-011-AC-04`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-079 — Environment別成功の流用

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-007正常入力で、production_evidence_source=production-sim、production_evidence_result=sim-success。
- 変異: `production_evidence_source`だけをverification-simへ変更。
- 入力: environment_id=verification-sim; resource_id=api-db-sim-01; mapping={environment=verification-sim,resource=api-db-sim-01}; environment_refs={verification=verification-sim,production=production-sim}; config_refs={verification=cfg-ver-sim,production=cfg-prod-sim}; network_refs={verification=net-ver-sim,production=net-prod-sim}; credential_scope_refs={verification=cred-scope-ver-sim,production=cred-scope-prod-sim}; data_refs={verification=data-ver-sim,production=data-prod-sim}; version_refs={verification=sim-r17,production=sim-r16}; authority_refs={verification=auth-ver-sim,production=auth-prod-sim}; production_evidence_source=production-sim; production_evidence_result=sim-success; source_revision=sim-r1
- oracle: verification環境の成功をproduction成立の証拠にせず、環境混同を保留する。
- owner/戻し先: environment/resource source owner=unknown。
- trace: `INFRA-011-AC-01`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-080 — update admission欠落

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-057のaccepted normal fixture。
- 変異: `update_admission`だけをmissingへ変更。
- 入力: request={target=api-db-sim-01,action=update-sim,revision=sim-r2,scope=infra-011-stage5-sim,environment=verification-sim}; security_authority=security-authority-sim-01; update_admission=accepted; worker_contract=worker-contract-sim@sim-r3; os_work=os-work-sim-01; before=sim-r1; after=sim-r2; result=sim-applied
- oracle: L2-010 update admission条件を満たさないため変更を開始しない。既存参照条件とoperation結果を混同しない。
- owner/戻し先: 該当SECURITY update-admission source owner。個別ownerが特定できない場合はunknown。
- trace: `INFRA-011-AC-02/03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-081 — update admission denied

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-057のaccepted normal fixture。
- 変異: `update_admission`だけをdeniedへ変更。
- 入力: request={target=api-db-sim-01,action=update-sim,revision=sim-r2,scope=infra-011-stage5-sim,environment=verification-sim}; security_authority=security-authority-sim-01; update_admission=accepted; worker_contract=worker-contract-sim@sim-r3; os_work=os-work-sim-01; before=sim-r1; after=sim-r2; result=sim-applied
- oracle: accepted以外は更新開始条件を満たさず変更を保留する。
- owner/戻し先: 該当SECURITY update-admission source owner。個別ownerが特定できない場合はunknown。
- trace: `INFRA-011-AC-02/03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-082 — read-onlyが状態を変更

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-055正常fixture（writes=none; before=sim-r1; after=sim-r1）。
- 変異: `after`だけをsim-r2へ変更。
- 入力: request={target=api-db-sim-01,action=inspect-sim,revision=infra-runtime-sim@sim-r17,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,target=api-db-sim-01,target_revision=infra-runtime-sim@sim-r17,action=inspect-sim,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1}; os={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim@sim-r17}; write_scope=declared; write_set=empty; writes=none; before=sim-r1; after=sim-r1
- oracle: read-onlyのwrite禁止およびoperation起因の変更なしに反するため不適合とする。
- owner/戻し先: source ownerが特定されない場合はunknown。
- trace: `INFRA-011-AC-03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-083 — state changeの適用recovery duty欠落

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-056 normal fixture（applicable_duty=restore-check-sim; duty_result=sim-verified）。
- 変異: `applicable_duty`だけをmissingへ変更。
- 入力: request={target=api-db-sim-01,action=replace-sim,revision=sim-r2,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,target=api-db-sim-01,target_revision=sim-r2,action=replace-sim,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; update_admission=accepted; worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1}; os={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim@sim-r17}; applicable_duty=restore-check-sim; duty_result=sim-verified; before=sim-r1; after=sim-r2
- oracle: 適用recovery義務をunknown/未充足として変更を成功扱いせず、未完義務を残す。OS Work/Change参照はS5-056の正常値を保持し、そのoperationに含まれるOS work/change ownerの照合責務も維持する。欠落fieldはrecovery dutyだけである。recovery design ownerとOS work/change ownerへ戻す。基準fixtureのOS work/change正常参照を保持する。
- owner/戻し先: recovery design ownerとOS work/change owner。具体ownerが固定親で未特定ならunknown。
- trace: `INFRA-011-AC-03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-084 — state changeの適用recovery duty unknown

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-056 normal fixture（applicable_duty=restore-check-sim; duty_result=sim-verified）。
- 変異: `applicable_duty`だけをunknownへ変更。
- 入力: request={target=api-db-sim-01,action=replace-sim,revision=sim-r2,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,target=api-db-sim-01,target_revision=sim-r2,action=replace-sim,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; update_admission=accepted; worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1}; os={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim@sim-r17}; applicable_duty=restore-check-sim; duty_result=sim-verified; before=sim-r1; after=sim-r2
- oracle: 適用recovery義務unknownのstate changeを成功扱いせず、未完義務を残す。OS Work/Change参照はS5-056の正常値を保持し、そのoperationに含まれるOS work/change ownerの照合責務も維持する。欠落fieldはrecovery dutyだけである。recovery design ownerとOS work/change ownerへ戻す。基準fixtureのOS work/change正常参照を保持する。
- owner/戻し先: recovery design ownerとOS work/change owner。具体ownerが固定親で未特定ならunknown。
- trace: `INFRA-011-AC-03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-085 — composite部分結果と稼働版/適格rollback先保持

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-072 normal fixture。scope/source、18 unit results、4 connection tuple、current_active_revision=sim-r8、eligible_rollback_target=sim-r7とartifact/config/dependency/data/procedureはすべて固定。
- 変異: `composite_result`だけを`{state=sim-complete,unfinished_duties=[]}`から`{state=partial,missing_component={field=connection-result-receipt,source=connection-result-sim@sim-r1},unfinished_duties=[record-connection-result-sim],responsible_owner=unknown}`へ置換する。他fieldはbaselineのまま。
- 入力: `unit_results={CASE-INFRA-011-S5-001=normal@sim-r1,CASE-INFRA-011-S5-004=normal@sim-r1,CASE-INFRA-011-S5-007=normal@sim-r1,CASE-INFRA-011-S5-010=normal@sim-r1,CASE-INFRA-011-S5-013=normal@sim-r1,CASE-INFRA-011-S5-016=normal@sim-r1,CASE-INFRA-011-S5-019=normal@sim-r1,CASE-INFRA-011-S5-022=normal@sim-r1,CASE-INFRA-011-S5-025=normal@sim-r1,CASE-INFRA-011-S5-028=normal@sim-r1,CASE-INFRA-011-S5-031=normal@sim-r1,CASE-INFRA-011-S5-034=normal@sim-r1,CASE-INFRA-011-S5-037=normal@sim-r1,CASE-INFRA-011-S5-040=normal@sim-r1,CASE-INFRA-011-S5-043=normal@sim-r1,CASE-INFRA-011-S5-046=normal@sim-r1,CASE-INFRA-011-S5-049=normal@sim-r1,CASE-INFRA-011-S5-052=normal@sim-r1}; connections={CORE={design=core-infra-sim@sim-r5,target_scope=infra-011-stage5-sim};OS={work=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim@sim-r17};SECURITY={authority=security-authority-sim-01@sim-r3,scope=infra-011-stage5-sim,environment=verification-sim};Worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1,mapping=worker-sim→worker-host-sim}}; scope=infra-011-stage5-sim; environment=verification-sim; source_revision=sim-r1; current_active_revision=sim-r8; eligible_rollback_target={revision=sim-r7,artifact=artifact-sim-r7,config=cfg-sim-r7,dependency=dep-sim-r7,data_ref=data-sim-r7,procedure=rollback-sim-r7}; composite_result={state=sim-complete,unfinished_duties=[]}`。
- oracle: 構成体を未成立にし、partial result、欠落field/source、未完義務、責務owner=unknownを保持する。current active revisionと適格rollback targetも保持し、rollback実行や成功を生成しない。
- owner/戻し先: connection-result責務ownerは固定親で特定されないためunknownを維持する。
- trace: `INFRA-011-AC-03`。合成fixtureの設計候補であり未実行。

#### CASE-INFRA-011-S5-086 — read-only write試行の拒否

- 対象/版: `HELIXINFRASTRUCTURE-L2-011` 1.0 / Stage 5、変異前baselineはCASE-INFRA-011-S5-055正常fixture（write_set=empty; writes=none; before=sim-r1; after=sim-r1）。対象scopeは `infra-011-stage5-sim`、環境identityは `verification-sim`、親source revisionは `sim-r1`。
- 変異: `write_attempt={target=api-db-sim-01,action=write-sim,scope=infra-011-stage5-sim}`だけを追加する。baselineの他fieldはそのまま。
- 入力: request={target=api-db-sim-01,action=inspect-sim,revision=infra-runtime-sim@sim-r17,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; security_authority={ref=security-authority-sim-01,source=SECURITY-sim@sim-r3,revision=sim-r3,target=api-db-sim-01,target_revision=infra-runtime-sim@sim-r17,action=inspect-sim,scope=infra-011-stage5-sim,environment=verification-sim,expiry=sim-expiry-01}; worker={contract=worker-contract-sim@sim-r3,assignment=assignment-sim-01,resource=worker-host-sim@sim-r1}; os={ticket=os-work-sim-01,change=os-change-sim-01,revision=os-rev-sim-4,scope=infra-011-stage5-sim,environment=verification-sim,runtime=api-db-sim-01@infra-runtime-sim@sim-r17}; write_scope=declared; write_set=empty; writes=none; before=sim-r1; after=sim-r1
- oracle: empty write-setへの試行を拒否し、writeを実行しない。前後状態が同一でも拒否を省略しない。通常read-onlyのwrite禁止はOS停止中independent recovery例外によって緩和しない。
- owner/戻し先: 正常baselineへの戻し先なし。試行が拒否されず変更された場合、該当operation source ownerが特定できなければunknown。
- trace: `INFRA-011-AC-03/04`。合成fixtureの設計候補であり未実行。
