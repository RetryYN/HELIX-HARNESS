# L3-D0: scaffold撤去状況の時点監査（2026-10-03）

source_commit: `633bf12ea8f948db8ba3d6600179c4a9507377a7`
authority_effect: none
scope: L3-D0の第一作業（O11のscaffold撤去状況確認）。配置移動とL3/L10本文は含まない。

## 結果と今回の操作

tracked Binding全143件を読むと、active 28件、registered 115件で、全件がreplacement pendingだった。formal_artifacts、transfer、target_revisions、確認receiptは全件未登録で、replacing／retiredは0件だった。Bindingの役割・義務・consumer・oracleと、監査内のID／宣言artifact pathの参照を照合した範囲で、全移管を確認できたものはない。現時点でcheck-replacement→retireへ進められる対象は0件と判定し、Binding変更・撤去は行わなかった。scaffold全体の撤去完了は主張しない。

個別の宣言artifact、Binding SHA-256、役割、consumer、他Bindingからのupstream参照、監査参照と判定理由は[143件の一覧](l3-d0-scaffold-retirement-inventory-2026-10-03.json)に保存した。この一覧は上記commitの観測記録であり、更新され続けるBinding台帳の代わりにはしない。利用者の未追跡memory、PHCAP資料、mailbox local状態は対象外である。

## 時点記録と置換の区別

監査1291ファイルをID／宣言artifact pathで照会し、完全一致の言及がある25ファイルを、正式移管の証拠か、snapshot・変更影響・validator検査の記録かに分けて読んだ。registered 115件のうち111件に監査でのID言及があり、27件はGoal 6のowner行へ対応する。監査のID言及は利用を証明せず、snapshotの存在はvalidatorの役割・義務・接続・検査の移管を証明しない。

[Goal 6の始末案](goal6-research-disposition-2026-09-25.md)は調査32件について導き直し31件・履歴保持／検査退役候補1件を記録するが、正式置換artifactが未成立で、check-replacement／retire未実行と明記している。SCF-B-0121は退役候補であり、正式後継と移管receiptが揃った状態ではない。registered 115件のうち113件の宣言artifactにはPython validator等が残る。これらの合否から正式runtimeの成立や要求authorityを生成しない。

`scfctl residuals=0`は退役済みartifactや宣言済み正式artifactの残留検査である。formal_artifactsが空の場合の未登録置換先の不在、全consumerの移管、全研究束の不要性を証明しない（[scfctl](../../../../scaffold/tools/scfctl.py):543–576）。本監査の「全移管を確認できない」は対象と検索範囲を限定した判定であり、repository外を含む全量の不在証明ではない。

## 旧HELIXを起点とする保持点・変更点

- 旧`repository-structure.md`（`LEGACY-ASSET-FDBA655B1CFF75DCDC0E`）、[旧本文](../../../../archive/legacy-generation-2026-09-14/root/docs/governance/repository-structure.md):58,74,117,148–150、SHA-256 `6f8ee784049d03279641151714c3572656eb20c64cfb769853b6e885abf4f262`は、現在の正本と移行・historical記録を区別する。保持する点は正本と時点記録の分離である。本監査は意味の再導出の材料であり、旧実行経路は移植・実行しない。
- 旧HIL-FR-53、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、[旧L1本文](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md):143、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`は、path・名称から独立したidentity、move履歴、authority・oracle・edgeを失わないことを定める。保持する点はID／状態／digestを配置と区別すること。今回は移動していないので位置履歴・台帳revisionは変更していない。
- RG14-009は[旧rule atom台帳](../../legacy-migration/rule-atom/legacy-rule-atom-inventory.jsonl):7034にあり、旧`repository-structure.md:99–100`を指す。L3/L10の置き場所を先に判断し、今回空directoryを先行作成しない。実際のdirectoryは本ゴールの指定に従い最初の文書と同時に作る。旧層番号・旧PLAN・旧runtimeを現行の追加gateにしない。
- 旧のpath非依存identityと履歴保持を現行のBinding監査へ意味再導出する際は、runtime状態や旧正本から撤去完了を推定せず、現行[Scaffold Binding契約](../../../../scaffold/README.md):50–68の全移管・check-replacement・read-after・retireへ束縛する。旧CLI・harness.db・旧層番号は継承せず、非実行archive境界と正式consumer未移管を保持する。新しい承認手続きは作らない。[9/26配置判断](../../decisions/governance-legacy-migration-layout-po-decisions-2026-09-26.md)のWeb分離とlegacy-migration配置は変えない。

## D0の次の作業

撤去適格0件という確認を起点に、R2289-02のMPR-SH-CANDIDATE-003の旧pathを既存の訂正revision契約で是正し、governanceの現在規則・台帳と固定記録の配置を分ける。003をsupersedeすると生存中候補249件の保留先参照にも訂正が必要になるため、この監査PRでregisterへ追記しない。過去の登録行とreceiptは保持する。

続けて既存工程別audits分類を照合し、L3/L10の置き場所を記録する。L3本文起草はその決定の後に始める。今回の監査、review、mergeはL3承認、実装許可、要求の採否や完了を生成しない。

## Binding一覧

| ID | state | 役割 | 判定 |
|---|---|---|---|
| `SCF-B-0001` | active | Scaffold Bindingの登録・検査・置換確認・撤去遷移・残留検出 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0002` | active | 旧ルール群の要求候補と規則atomを、要求単位の仮のルール集として無損失に保持し、参照可能にする | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0003` | active | 共通規則・対象revisionを固定した通知を既存VS Code GUIの両レーンへ届け、明示ACKと応答対応を確認する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0004` | active | 6 source pathのbaseline／pre-isolation provenance、registry／catalog参照関係、HARNESS製品境界をreview可能な仮束へ固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0005` | active | DELEGATED-DOC-003/028のsource blobを14 coverage spanと59 semantic atomへ分け、REF-0303/0759/0760のpair／body edge、旧phase・implementation・consumer状態、否定条件を同じreview単位で保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0006` | active | DELEGATED-DOC-008/017のsource blobをlossless coverageとRDJ-FR/RDJ-AC意味候補へ分け、pair／parent／authority edge、HARNESS候補とOS consumer候補、phase／implementation／consumer未確認境界を同じreview単位で保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0007` | active | PREISO-REV-000003..000008のbaseline／pre-isolation／archive provenance、24 diff hunk、要求・制約・provenance・metadata候補、旧asset／phase状態、未処理分母をreview可能なscaffoldへ固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0008` | active | DELEGATED-DOC-006/015のsource blobを8 coverage spanと11 semantic atomへ分け、REF-0308/0424/0425/0765のpair／inbound edge、security negative、actor／authority、旧phase・implementation・consumer状態を同じreview単位で保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0009` | active | PREISO-REV-000009..000014／000017..000022のbaseline／pre-isolation／archive provenance、58 diff hunk、候補分類、旧asset／phase状態、未処理分母をreview可能なscaffoldへ固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0010` | active | DELEGATED-DOC-002/013/004/029のsource blobをlossless coverageと原ID／actor／authority／negative atom候補へ分け、L3/L10 parity、missing crossdoc reference、HARNESS候補とOS consumer候補、phase／implementation／consumer未確認境界を保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0011` | active | RUL-OSP-04 の primary／secondary relation atom と旧 source exact span、legacy asset、product／authority／consumer候補を一つの scaffold research candidate として保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0012` | active | RDP-001 pre-isolation source revisionのexact Git-object provenanceとhunk-level research-premise候補を保持し、candidate product／phase／legacy status、compound hold、review-only subunit、未完了denominator、counterevidenceを後続の意味reviewへ引き渡す。 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0013` | active | DELEGATED-DOC-005/014 と DOC-011/018のsource blobをfull coverageとsource atom候補へ分け、原ID／actor／authority／negative、L3/L10 AC/T parity、missing crossdoc、HARNESS／OS owner候補、phase／implementation／consumer未確認境界を保持する。 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0014` | active | PHCAP-17の旧incident capabilityと現行HARNESS／HELIX-OS／HELIX-Web-OS境界を、直接current evidenceの有無・unknown・矛盾を保ったresearch premiseとして固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0015` | active | RDP-001 pre-isolation source revisionのexact Git-object provenanceとhunk-level research-premise候補を保持し、PR #1946候補との非重複、candidate product／phase／legacy status、compound hold、review-only subunit、未完了denominator、counterevidenceを後続の意味reviewへ引き渡す。 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0016` | active | PHCAP-19の旧learning／改善capabilityと現行HELIX-OS／HELIX-HARNESS／HELIX-Web／HELIX-Web-OS境界を、direct evidenceの有無・unknown・矛盾を保ったresearch premiseとして固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0017` | active | DELEGATED-DOC-007/016とDOC-030/034の固定source blobをlossless full coverage、原ID／atomized／unatomized partition、actor／authority／negative atom候補へ記録し、両L3/L10 parityと未解決参照、HARNESS／OS owner・consumer候補、phase／implementation unknown境界を保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0018` | active | RDP-001 pre-isolation source revisionのexact Git-object provenanceとhunk-level research-premise候補を保持し、PR #1949候補との非重複、candidate product／phase／legacy status、compound hold、review-only subunit、未完了denominator、counterevidenceを後続の意味reviewへ引き渡す。 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0019` | active | RDP-001 PREISOLATION-002の8 review-only subunitについて、hunk classificationとsemantic atomizationを分離したcandidate-only provenanceを保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0020` | active | PHCAP-20の旧memory／continuation capabilityと現行HELIX-OS、および3製品の非対象接続境界を、旧到達・current evidence・unknown・矛盾を保持したresearch premiseとして固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0021` | active | selected RDP-001 reference edgeをsource lineとtarget blobへ無損失で結び、relation、target class、actor／authority／negative、owner product／phase候補、failure／consumer unknownを保持するedge classification scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0022` | active | PREISO-REV-000330..000333の要件・検証含有hunkを、先行144 pathとの非重複、Git object provenance、compound hold、未処理denominator、negative boundary付きで後続の意味reviewへ引き渡す | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0023` | registered | RDP-001 holding外新規67 pathの保存先・authority gapをread-onlyで監査し、後続semantic reviewへ引き渡す | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0024` | active | PHCAP-18の旧refactor capabilityと現行HELIX-HARNESS／HELIX-OS／HELIX-Web／HELIX-Web-OS境界を、direct evidenceの有無・unknown・矛盾を保ったresearch premiseとして固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0025` | active | PHCAP-14のphase到達、旧L3／L7／L10相当のrelease asset、製品別artifact／promotion／rollback境界、legacy implementation／degradation／current gapをresearch premiseとして束ねる。 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0027` | registered | RDP-001 PREISOLATION未評価source holdingのatom化前静的監査 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0028` | active | PHCAP-16 operations/monitoringの旧asset到達層、product unit split、current direct ref、failure/consumer/decision residualを、実装・authority・採否へ昇格させないresearch premise candidateとして保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0029` | registered | RDP-001 DELEGATED-DOC-003 未処理先頭8文書のfile blob静的監査 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0030` | active | PHCAP-06の旧Design／L3 asset、phase／product evidence、unknown境界、failure／consumer候補をcandidate-only inventoryとして保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0031` | active | PHCAP-07におけるHELIX-Web／HELIX-Web-OS製品別L10証拠gap、旧到達層、current direct／adjacent／unknown、oracle／CI／failure／consumer残差を、正式採否・実装・受入へ昇格させないresearch premise candidateとして保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0032` | registered | DELEGATED-DOC-001の旧source行を意味atom候補へ分け、exact anchor、4対象product候補、PHCAP候補、旧実装／degraded／failure／consumer unknown境界を同じ静的review単位で保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0033` | registered | DELEGATED-DOC-009の旧L3 Universal Workflow AI判断エンジンsourceを全87行・51 exact span・51 semantic atom候補へ分解し、HARNESS／OS connection候補、4製品分母、L3とdownstream layer signal、legacy implementation／degraded／failure／consumer／decision unknownを同一scaffoldへ保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0034` | registered | PHCAP-02/03の要求登録・分類、四製品routing、phase join、旧実装／failure／consumer evidenceの欠落をresearch premiseとして保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0035` | registered | outside-67の四製品direct path先頭15件について、13 live source holdingとのexact inclusion relationと新holding必要性候補をread-onlyで固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0036` | registered | outside-67旧L1 4件のsemantic relationとhistorical snapshot由来13 live holdingへの保存関係をread-onlyで固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0037` | registered | PHCAP-15 Deployの四製品境界候補、旧asset source／decision／failure／consumer evidence、candidate phase joinをread-onlyで束ね、正式なphase／product／implementation導出前のresearch premiseを保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0038` | registered | outside-67全67 path revision pairをsource_holding候補として保存し、正式appendの前提と歴史的capture移行阻害を固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0039` | registered | PHCAP-04/05の四製品L2／L11境界、旧asset source／decision／failure／consumer residual、candidate phase joinをread-onlyで束ね、正式な要求採否・受入導出前のresearch premiseを保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0040` | registered | outside-67のhistorical 13 captureを14 holding current stateから分離し、67 path_revision_pair source_holding登録候補と移行阻害をreview可能に固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0041` | registered | PHCAP-08/09のWBS名監査、ticket path catalog、旧asset source/phase/product/failure/consumer候補、四製品境界をread-only research premiseとして保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0042` | registered | PHCAP-10／11の旧asset到達層、四製品candidate、current direct/missing ref、implementation／failure／consumer residualを、静的research premise candidateとして保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0043` | registered | outside-67 global rows 31–48のpath_revision_pairと親d272固定の13 live holding関係を静的監査し、product／phase／implementation／degradation／semantic-inclusion unknown境界を保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0044` | registered | outside67 global ordinal 49–67のpath-based product／phase候補とimplementation／degradation／semantic inclusion unknown、13 live holding exact relationを固定する研究用分類束 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0045` | registered | outside-67 reportのrows 16–30について、13 live source holdingとのexact physical relationとpath-based candidate/unknown境界をread-onlyで固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0046` | registered | PHCAP-12/13の旧asset、四製品unit／connection、現行candidate ref、failure／consumer unknownをread-only research premiseとして保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0047` | registered | PHCAP-01のConcept／L1、四製品責務・接続候補、旧asset phase／product／実装・failure・consumer residualをread-only research premiseとして保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0048` | registered | DELEGATED-DOC-002の旧GitHub原子的開発・CI・リファクタリングsourceを独立契約／拒否条件／受入単位へ分解し、shared source relation、四製品候補、PHCAP-11／18候補、legacy implementation／degraded／failure／consumer／decision unknown、B0010 pair候補との未解決connectionをauthority noneのscaffoldで検証する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0049` | registered | REQATOM A1 first fiveのqueue／semantic line／exact source closure、四製品candidate routing、implementation／degradation／phase unknown、actor／authority／failure／negative意味を独立review用に保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0050` | registered | REQATOM A1 0006--0010のqueue／semantic line／exact source closure、四製品candidate routing、旧actor／authority／failure／consumer意味、implementation／degradation／phase unknownを独立review用に保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0051` | active | PHCAP-15/17代表旧asset六件と218要求unit crosswalkのbounded direct-link監査を、要求採否・phase authority・製品owner・旧実装・current implementationへ昇格させないresearch premiseとして固定する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0052` | registered | REQATOM A1 0011--0030のqueue／semantic line／exact source closure、四製品candidate routing、旧actor／authority／failure／consumer意味、implementation／degradation／phase unknownを独立review用に保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0053` | registered | PHCAP-15/17の候補pool membershipを要求unit逐語source contractと旧source scope／connection／exceptionへ静的照合し、direct semantic linkの肯定／否定／unknownと旧asset残差を束ねる | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0054` | registered | PHCAP-15 Deployの旧asset implementation／failure／consumer分類gapを、phase pool membershipと要求リンクを分離したread-only research premiseとして保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0055` | registered | PHCAP-15 Deployの未調査candidate 12件について、旧asset source／decision／failure／consumer／implementation statusと四製品候補をread-onlyで保持し、既調査範囲との非重複と残分母を検証する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0056` | registered | REQATOM A1 0031--0050のqueue／semantic line／exact source closure、四製品candidate routing、旧actor／authority／failure／consumer意味、implementation／degradation／phase unknownを独立review用に保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0057` | registered | outside67 Web／Web-OS L2 source gapのsemantic line／atom candidate、revision差分、product／connection boundary、未確定実装・failure・consumer・decisionをsource anchor付きで保持する研究用Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0058` | registered | REQATOM A1 0051--0070のqueue／semantic line／exact source closure、四製品candidate routing、旧actor／authority／failure／consumer意味、implementation／degradation／phase unknownを独立review用に保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0059` | registered | PHCAP-15 Deploy third12 sampleの12旧assetについて、旧asset source／decision／failure／consumer evidence、旧phase／product候補、旧／現行implementationとdegradation unknownをread-onlyで保持し、pool12 sampleとの非重複と残分母を検証する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0060` | registered | PHCAP-15 Deployの未レビューcandidate 12件について、旧asset source／decision／failure／consumer evidence、旧phase／product候補、旧／現行implementationとdegradation unknownをread-onlyで保持し、既レビュー範囲との非重複と残分母を検証する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0061` | registered | Wave37 schema10 research premiseとして、旧sourceの要求文とsource chain、四製品candidate、phase候補、旧asset implementation status、failure／consumer unknownを独立reviewへ渡す。 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0062` | registered | outside67製品境界sourceのsemantic unit、revision差分、四製品候補、legacy unknownを扱うread-only Scaffold research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0063` | registered | PHCAP-15 Deploy第五12 sampleの12旧assetについて、旧asset source／decision／failure／consumer evidence、旧phase／product候補、旧／現行implementationとdegradation unknownをread-onlyで保持し、既レビュー5束との非重複と残分母を検証する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0064` | registered | Wave38 schema10 research premiseとして、旧sourceの要求文とsource chain、四製品candidate、phase候補、旧asset implementation status、failure／consumer unknownを独立reviewへ渡す。 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0065` | registered | PHCAP-15 Deploy第六12 sampleの12旧assetについて、旧asset source／decision／failure／consumer evidence、旧phase／product候補、旧／現行implementationとdegradation unknownをread-onlyで保持し、既レビュー6束との非重複と残8件分母を検証する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0066` | registered | outside67 030/033/043/045/055 source pairのsemantic candidate、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0067` | registered | PHCAP-15 Deploy最終候補8 sampleの8旧assetについて、旧asset source／decision／failure／consumer evidence、旧phase／product候補、旧／現行implementationとdegradation unknownをread-onlyで保持し、既レビュー6束＋SCF-B-0065との非重複とpool coverageを検証する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0068` | registered | Wave39のrequirements／design／implementation_source 15 edgeと7 source atom候補を、TR08共有関係・TR01 routing hold・旧asset status unknownを含む静的Scaffoldとしてroot reviewへ渡す | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0069` | registered | outside67 034/036/046/052/056 source pairのsemantic candidate、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0070` | registered | Wave40のrequirements／design／implementation_source 11 edgeと8 source atom候補を、FR33／NFR05 missing evidence、製品境界・phase未確定、旧asset status unknownを含む静的Scaffoldとしてroot reviewへ渡す | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0071` | registered | outside67 035/037/047/054/057 source pairのsemantic candidate、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0072` | registered | Wave41のHARNESS／OS product unit 5件について、requirements／design／implementation_sourceのcandidate edge、共有source relation、missing evidence、旧asset status unknownを保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0073` | registered | outside67 001/004/007/010/060 source pairのsemantic candidate、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0074` | registered | outside67 002/005/013/031/061 source pairのsemantic candidate、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0075` | registered | Wave42のHARNESS／OS product unit 5件について、requirements／design／implementation_sourceのcandidate edge、共有source relation、missing evidence、旧asset status unknownを保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0076` | registered | outside67 003/006/009/012/014 source pairのproduct entry／shared L2 crosswalk candidate、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0077` | registered | Wave43のHARNESS／OS product unit 5件について、requirements／design／implementation_sourceのcandidate edge、共有source relation、missing evidence、旧asset status unknownを保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0078` | registered | Wave44のHELIX-OS product unit 10件について、requirements／design／implementation_sourceのcandidate edge、独立pool照合、missing evidence、旧asset status unknownを保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0079` | registered | outside67 015/018/029/032/067 source pairのsource/judgement-history/failure/consumer boundary、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0080` | registered | Web／Web-OS旧Vision exact span、現行L2 relation候補、legacy asset evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0081` | registered | Web／Web-OS Vision bounded semantic atom candidateとcomposite_unresolvedをsource line／connective付きで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0082` | registered | Wave45のHARNESS／OS候補7 unitについて、requirements／design／implementation_sourceのcandidate edge、独立pool照合、missing evidence、旧asset status unknownを保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0083` | registered | outside67 016/020/023/038/062 source pairのsource/judgement-history/failure/consumer boundary、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0084` | registered | SCF-B-0081未処理Vision spanからsource-bound Web／Web-OS semantic atom候補とcomposite_unresolvedを保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0085` | registered | outside67 019/022/024/041/058 source pairのsource/judgement-history/failure/consumer boundary、exact path/blob/sha receipt、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0086` | registered | Wave46のHARNESS／OS候補6 unitについて、requirements／design／implementation_sourceのcandidate edge、独立pool照合、missing evidence、旧asset status unknownを保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0087` | registered | outside67 017/021/025/026/027 source pairのsource/judgement-history/failure/consumer boundary、exact path/blob/sha receipt、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0088` | registered | 残り9 Vision parent spanをsource-bound Web／Web-OS semantic atom候補・composite_unresolvedとして保持し、四製品境界と未確定状態を機械検査する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0089` | registered | Wave47の旧要求source unitについて、exact anchor、role candidate pool、四製品候補境界、phase／implementation／degradation statusをresearch premiseとして保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0090` | registered | outside67 028/039/040/042/044 source pairのsource/judgement-history/failure/consumer boundary、exact path/blob/sha receipt、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0091` | registered | 29 parent span全件と35 candidate recordのsource-bound coverage、四製品candidate boundary、phase／implementation未接続状態を再現可能なmatrixとして保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0092` | registered | outside67 final 048/049/050/051/053 source pairのsource/judgement-history/failure/consumer boundary、exact path/blob/sha receipt、revision差分、四製品候補、legacy evidence unknownをread-onlyで保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0093` | registered | Wave48の旧要求source unitについて、exact anchor、role candidate pool、四製品候補境界、phase／implementation／degradation statusをresearch premiseとして保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0094` | registered | Wave49の旧要求source unitについて、exact anchor、role candidate pool、四製品候補境界、phase／implementation／degradation statusをresearch premiseとして保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0095` | registered | PATH-001〜005のpre-isolation/archive source line、全863行のline partition、差分、旧資産証拠境界を再現可能な静的研究束として保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0096` | registered | RDP-001 outside67 PATH-006〜010 source snapshot／line coverage／atom candidateを保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0097` | registered | Wave50の旧IR残2 source unitについて、exact anchor、role candidate pool、phase／product候補境界、implementation／degradation statusをresearch premiseとして保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0099` | registered | RDP-001 outside67 PATH-011〜015 source snapshot／line coverage／semantic atom候補を保持する静的Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0100` | registered | queue18と先行153件候補、旧IR原文、製品境界、旧asset source／history／failure／consumerを静的に突合するresearch-only bridge | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0101` | registered | 旧要求30 unitの原文・Wave1–50 edge・PHCAP20・四製品L1・asset source/history/failure/consumerを、候補とauthorityを分離して保持する静的phase-gap Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0102` | registered | br-implementation-evidence-0102-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0103` | registered | PO未承認correctionの意味差分と、現行218 unit集合への仮説影響を人間decisionへ返すresearch-only Scaffold Binding | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0104` | registered | br-implementation-evidence-0104-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0105` | registered | phase-status-taxonomy-30-unit-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0106` | registered | br-implementation-evidence-0106-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0107` | registered | Wave1–50 unresolved legacy asset product classification static research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0108` | registered | src/lint/ implementation_source 95件について旧source本文と四製品L1／boundary、Wave semantic link、旧history／failure／consumerを静的に突合し、14件の意味review済み候補と81件の未評価分母を再現可能に保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0109` | registered | fr-implementation-evidence-0109-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0110` | registered | fr-implementation-evidence-0110-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0111` | registered | fr-implementation-evidence-0111-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0112` | registered | tr-implementation-evidence-0112-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0113` | registered | nfr-implementation-evidence-0113-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0114` | registered | nfr-implementation-evidence-0114-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0115` | registered | implementation-evidence-strength-0115-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0116` | registered | phase-cross-20-review-0116-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0117` | registered | src/runtime/implementation_source 73件について旧source本文と四製品L1／boundary、Wave semantic link、旧history／failure／consumerを静的に突合し、候補・競合・根拠不足を再現可能に保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0118` | registered | fixed-base legacy execution/result receipt asset-level evidence partition research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0119` | registered | phase-source-human-review-0119-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0120` | registered | src/schema/implementation_source 31件について旧source本文と四製品L1／boundary、Wave semantic link、phase、旧history／failure／consumerを静的に突合し、候補・競合・根拠不足と縮退証拠を再現可能に保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0121` | registered | outside67 Web／Web-OS未処理4 pathのL1 anchor候補とREADME contextをsource digest／line／全field比較で保持するresearch-only Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0122` | registered | fixed-base non-executable requirement source implementation/failure/consumer evidence partition research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0123` | registered | 五つの旧実装source領域59件について旧source本文と四製品L1／boundary、Wave semantic link、phase、旧history／failure／consumerを静的に突合し、候補・競合・根拠不足と縮退証拠を再現可能に保持する | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0124` | registered | Vision 35 candidate atomと代表legacy asset 12件のsource／history／failure／consumerを照合し、phase／asset unknown boundaryを保持するresearch-only Scaffold | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0125` | registered | fixed-base legacy status implementation degradation failure consumer evidence partition research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0126` | registered | legacy-implementation-residual-product-boundary-research-0126-static | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0127` | registered | legacy-state-db-product-boundary-research-0127-static | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0128` | registered | legacy-lint-candidate-product-boundary-research-0128-static | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0129` | registered | research-only static cross-check of existing FR unit evidence | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0130` | registered | phase-direct-evidence-first5-0130-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0131` | registered | phase-direct-evidence-next5-0131-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0132` | registered | research-only static cross-check of existing FR unit evidence | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0133` | registered | legacy-runtime-residual-product-boundary-research-0133-static | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0134` | registered | phase-gap-cross-analysis-0134-static-research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0141` | registered | legacy-config-product-boundary-research-0141-static | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0142` | registered | legacy research assets static product-boundary research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0144` | registered | legacy-asset-overlap-reconciliation-research-state-0144-static | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0145` | registered | legacy-ai-instruction-product-boundary-research-0145-static | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0146` | registered | legacy-evidence-crosswalk-218-record-fixed-base-static-research-0146 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0147` | registered | legacy asset product-boundary research | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0148` | registered | legacy-test-design-worker-workflow-phase-product-classification-0148-static | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0149` | registered | legacy-asset-evidence-depth-projection-768-record-occurrences-0149 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0150` | registered | legacy-worker-execution-checkpoint-quota-phase-product-classification-0150-static | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0151` | registered | 設計テンプレ由来の設計パターン・設計ユニット・パーツと導出物の調査候補一覧 | 全移管receipt未確認、撤去適格でない |
| `SCF-B-0152` | registered | 設計テンプレseed候補（ログ、非機能、保守・運用、ロジック、依存、AWS初期設計、設計review）と、OSの決める事項の司会進行への入力材料 | 全移管receipt未確認、撤去適格でない |

## 静的検証

- 143件のBinding snapshotを現行ファイルのID・state・role・artifact・replacement・consumer・SHA-256と照合し、一致した。対象ID集合の欠落・重複は0件だった。
- scfctl validate：143件、fail=0。stale=0、residuals=0。selftest：69 cases、fail=0。
- tracked研究validator全137件：[前後比較](l3-d0-scaffold-validator-results-2026-10-03.json)はpass 82／fail 55、終了結果の差分0件。失敗55件は変更前からの失敗として保持し、green、不要、撤去可能へ読み替えない。未追跡validatorは件数に含めない。
- govcheck：atoms 7622、requirements 57、files 58でok。gen_rulebook --check：files 59でok。govcheck_selftest：baselineと否定例10件が合格。
- 新規Markdown相対リンクの参照先存在とgit diff --checkを確認した。追加した監査だけが差分であり、既存Binding・台帳・文書・research・CIを変更していない。

これらは時点監査の静的確認であり、新世代CI、正式L10の合格、要求・L3承認の証拠ではない。
