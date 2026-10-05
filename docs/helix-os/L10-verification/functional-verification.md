# HELIX-OS L10 機能総合検証（Stage 2b）

状態: L3未承認の候補／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

## Stage 2b — HELIXOS-L2-014 functional verification

以下は固定L2-014/L11行317に対する未実行oracle設計候補である。全fixtureは合成・secret-freeとし、target scopeとexact parent revisionへ結ぶ。通常例、独立negative、未見正常、期待状態、owner returnをCASEごとに定義する。HARNESS/INFRASTRUCTURE/SECURITY依存は常時・条件時・選択source時・参照資料のみを区別する。dependencyを人が代行しても必要field、authority、検証、receiptのいずれも省略しない。

### CASE-OS-014-01 — internal stage identity（AC-OS-014-01）

正常: synthetic stage `v0.1`、別のpublic product version field、scope、exact configuration revisionを入力し、内部stage identityと外部版を別recordに保つ。未見正常: 未使用の内部stage labelも同じ規則で扱い、public tagを推定しない。negativeを個別化: (a) internal stage labelをexternal semver/tagと同一視、(b) stage successから1.0到達を生成、(c) HELIX stageを対象製品release identityと同一視、(d) stage成立からWeb提供/外部公開を実施済みまたは許可済みと推定。期待: scope内stage stateだけを保持。意味/版の差は要求ownerへ、product release境界はHARNESSへ戻し、Web提供・外部公開は固定L2の別判断に残す。

### CASE-OS-014-02 — HARNESS packと必要安全依存のclosure（AC-OS-014-02）

正常 baseline: 選択packのHARNESS-L2-010 contract revision、HARNESS-L2-011 call input/scope/result contract、適用されるHARNESS-L2-022 verification/acceptance contract、該当INFRASTRUCTURE/SECURITY contractsが、同一stage scope/revisionへboundされ、選択/除外packと必要dependencyが明示される。次stage例では同じHARNESS pack体系の既存packに必要なpackの追加・更新を結び、前stageとは別のstage identityで記録する。固定L2上の必要な安全依存を全て満たし、未選択の無関係機構が未完成でもstage scope内の一周を確認する。dependency classは各contractが宣言する常時必須・特定操作時・選択input source時・reference-onlyの区別を保持する。HARNESS-L2-022のunit contract acceptanceはstage composite acceptanceを代替しない。

**field-level negative design**: 各fixtureでは下表の一つのdependency fieldと一つのstatus mutationだけを変え、残りを正常baselineに保つ。各fieldについて別々に `missing`, `unknown`, `stale revision`, `wrong revision/scope` を作る。fixture identityは `CASE-OS-014-02-<依存ID>-<field ID>-<status>` とし、例は `CASE-OS-014-02-H010-input-MISSING`、`CASE-OS-014-02-I019-rollback-revision-STALE`。各field/status組は独立fixtureとして照合し、まとめて1件のnegativeにしない。期待は該当operation/dependencyをunknown/unfinishedにしてstage release successを保留し、その契約を所有する既存ownerへ返す。適用されない操作・未選択sourceの条件は「未適用/未観測」と記録し、存在・欠落・適格性を推測しない。

| dependency source | required field identitiesを個別照合する範囲 | owner / return |
|---|---|---|
| HARNESS-L2-010 | `pack-id`, `owner`, `input`, `output`, `dependency-id-version`, `verification-scope-oracle`, `contract-version`, `stage-inclusion-exclusion`, `same-input-version-reproduction`, `prior-eligible-version-replacement`。各fieldへstatus別fixtureを作る | pack contract・scope・version不足はHARNESSへ |
| HARNESS-L2-011 | `capability-id`, `call-contract-version`, `input-scope`, `caller-permission`, `project-tenant-environment-isolation`, `progress-result-evidence`, `correlation-id`, `stop-resume`, `idempotency-key`, `expiry`, `dependency-versions`。適用される各fieldへstatus別fixtureを作る | 呼出しscope/input/receiptは呼出しowner/OSへ、contract/versionはHARNESSへ。authorityはSECURITYへ |
| HARNESS-L2-022 | `artifact-revision`, `paired-design-L5-L4`, `L3-L2-L11-conditions`, `paired-verification-L8-L9-L10`, `stage-evidence-result`, `stage-state-boundary`, `applied-owner-acceptance-record`。適用される各fieldへstatus別fixtureを作る | verification/oracle contractはHARNESSへ、operation evidence collectionはOSへ、human acceptanceはexisting ownerへ |
| INFRASTRUCTURE-L1-017/018/019/020/022 | `I017-backup-target/source-revision/time/completeness/location/integrity/expiry` と `I018-restore-execution/integrity/dependency-reconnect/start/verification` はbackup/restore operationがscopeにある場合、`I019-rollback-infra-version/config/artifact/dependency/data-compatibility/procedure` はrollback operation、`I020-independent-recovery/no-circular-dependency` は停止時の独立復旧、`I022-running-identity/location/start-time/version/config/artifact/dependencies` は宣言済み実行環境に限る。各適用fieldへstatus別fixtureを作る。 | 対応するbackup/restore/rollback/recovery/runtime identity evidenceはINFRASTRUCTUREへ。stage一般の環境health条件を新設しない。 |
| SECURITY-L2-005/006/008/016（適用条件は左記） | 固定親L2:627/631のcredential policyを保持する。`S005-actor/operation/target/environment/scope/expiry/purpose/credential-class/no-raw-secret`は選択operationがcredential-useを含む場合、`S008-actor/target/operation/revision/environment/scope/expiry`はそのoperationに必要なauthority条件。`S006-source/destination/protocol/endpoint/path/data-class/volume/purpose/authority/expiry`はstage scopeに明示された実network送信operationだけに適用する。`S016-asset-identity/classification-value/classification-record-owner/source/revision`は明示された送信operationが固定L2-006のdata classification inputとして分類recordを選択する場合だけ参照し（asset owner metadataと分類record metadataを区別）、それ以外は未適用/未観測とする。対応operation/inputがない状態からfixtureや依存を推定しない。 | credential/egress/authority/classification-recordの適用条件・意味はSECURITYへ返す。固定親の意味変更はPO経路へ。 |

人が実施した作業も同じ行の必要field・source/revision・scope・authority・evidenceが揃うときだけclosureに含める。人分担を理由に安全dependencyをoptional化しない。failure fixtureは各field×statusごとに独立IDを割り当て、summaryで一括greenにしない。以下のnegativeも互いに独立する: (1) 必要な安全依存は揃うが未選択の無関係機構が未完成であることだけを理由にstageを保留する、(2) HARNESS-L2-010/011の選択pack契約を通さず別系統の簡易実装でstageを組む、(3) 安全依存の欠落を無関係機構の未完成へ読み替えて不合格理由を隠す。期待: (1)は無関係機構の完成をstage条件にせず、対象scope内の証拠で判定する。(2)は別系統実装を不適格としてHARNESSへ返す。(3)は必要安全依存をunknown/unfinishedのまま該当ownerへ返す。

**適用条件の逆向きnegative（各fixtureは独立）**: 各caseではbaselineの他dependency・field・statusを正常に保ち、対象operationがscopeに存在する事実は固定したまま、その依存だけ `not applicable` と申告する一つの変異を加える。各期待は申告を根拠にclosure/releaseを通さず、unknown/unfinishedを保って既存ownerへ返す。

| fixture | 固定する適用条件と唯一の変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-OS-014-02-I017-APPLICABILITY-OMITTED` | stage scopeにbackup operationがあるが、INFRASTRUCTURE-L1-017を未適用と申告する | backupの対象・元revision・時刻・完全さ・場所・完全性・期限の確認を保留し、stage closureをunknown/unfinishedにする。INFRASTRUCTUREへ返す。 |
| `CASE-OS-014-02-I018-APPLICABILITY-OMITTED` | stage scopeにrestore operationがあるが、INFRASTRUCTURE-L1-018を未適用と申告する | restore実行・完全性・依存再接続・起動・検証の確認を保留し、stage closureをunknown/unfinishedにする。INFRASTRUCTUREへ返す。 |
| `CASE-OS-014-02-I019-APPLICABILITY-OMITTED` | stage scopeにrollback operationがあるが、INFRASTRUCTURE-L1-019を未適用と申告する | 適格なrollback target、version/config/artifact/dependency/data互換性/procedureを確認できるまでclosureを保留する。INFRASTRUCTUREへ返す。 |
| `CASE-OS-014-02-S005-APPLICABILITY-OMITTED` | scope内の選択operationがcredential-useを含むが、SECURITY-L2-005を未適用と申告する | credential-useを許可済みとせず停止し、stage closureをunknown/unfinishedにする。SECURITYへ返す。raw secretをfixtureへ含めない。 |
| `CASE-OS-014-02-S006-APPLICABILITY-OMITTED` | scope内に明示されたnetwork send operationがあるが、SECURITY-L2-006を未適用と申告する | 送信をdeny/holdし、宛先・data classification・目的・authority等の該当条件を確認するまでclosureを保留する。SECURITYへ返す。 |
| `CASE-OS-014-02-S008-APPLICABILITY-OMITTED` | scope内operationがauthorityを必要とするが、SECURITY-L2-008を未適用と申告する | 必要authorityを推測せずoperationをholdし、closureをunknown/unfinishedにする。SECURITYへ返す。 |
| `CASE-OS-014-02-S016-APPLICABILITY-OMITTED` | 明示されたnetwork sendが選択したSECURITY-L2-006 data-classification inputとして分類recordを使うが、SECURITY-L2-016を未適用と申告する | 選択recordのasset identity/classification value/record owner/source/revisionを確認するまでclosureを保留する。SECURITYへ返す。asset-specific sink enforcementは追加しない。 |

未見正常: 別の選択pack/source構成で同じclosure規則を適用し、未選択sourceを未観測に保つ。

### CASE-OS-014-03 — scope内end-to-end work（AC-OS-014-03）

正常: 合成work itemについて要求確認→作業→HARNESS oracleで検証→結果記録の四状態が同一scope/revisionを指し、人が担う工程がある場合はactor/task/resultを明記する。未見正常: 別の狭いscopeでも四工程をつなぎ、未使用能力はcapability外として表示する。negativeは四段階それぞれの欠落を一つずつ変異し、別fixtureにする。さらに小機能を未接続のまま並べたcaseと人手工程のactor/task欠落caseを分ける。期待: unfinished/unknownのまま。要求意味不足は要求owner、工程/verification contractはHARNESS、OS record/dispatchはOSへ戻す。人手で行ったことから追加承認やowner判定を生成しない。

### CASE-OS-014-04 — stage tupleと再現性（AC-OS-014-04）

正常: synthetic stage tupleのpack/dependency identity+version、configuration revision、data format、supported environment、capability/limitation、acceptance evidence identity、update condition、rollback target/procedureを同じ revision-bound setに保存し、同一input tupleから同一構成を照合する。未見正常: 別のsynthetic environment tupleも独立identityで追跡する。negative fixture IDは `CASE-OS-014-04-<field ID>-<status>` とし、各field (pack/dependency identity+version, configuration, data format, environment, capability/limitation, evidence, update condition, rollback target/procedure) に対しmissing/unknown/stale/wrong-revisionを一組ずつ独立にする。別negativeでtagだけを唯一のstage identityにする。期待: reproducibility claimをしないで欠落field ownerへ戻す (pack contract→HARNESS、environment/rollback resource→INFRASTRUCTURE、authority→SECURITY、stage record→OS)。

### CASE-OS-014-05 — 実data・secret・credentialの混入防止（AC-OS-014-05）

正常: synthetic non-sensitive work dataとbackup/migrationへの別scope referenceだけを使い、stage artifact/evidenceに実案件data/secret/credentialがないことをfixture metadataから判別する。未見正常: secret値を含まず有効なcredential-use operationを行う別ケースは、既存SECURITY-L2-005/008 authorityが該当する場合のみに扱い、raw credentialをfixtureへ出さない。独立negative: (a) synthetic inputをreal project data markerにする、(b) secret-value markerをstage payloadへ含める、(c) credential-value markerを同梱する、(d) backup/migration payloadをstage artifactへ結合、(e) evidence/logへsecret/data値を書き出す。値そのものは保存・出力しない。期待: artifactを不適格/隔離扱いとし、DATA/secret boundaryはSECURITY、backup separationはINFRASTRUCTURE、stage packagingはOSへ返す。

### CASE-OS-014-06 — prior stageからnextへ進み、rollbackで状態を保つ（AC-OS-014-06）

正常: 合成stable prior stage S0の構成・pack/artifactを構築基盤としてS1を作り、必要packを同じHARNESS体系で追加/更新しながらS0の構成・artifactを変えずに保持する。S1を切替前に検証し、cutover前後の合成案件stateのidentity/valueとrecord identity/content/order/historyを照合して両方を引き継ぐ。切替後にS1上のstate valueを更新しrecord eventを追加する。更新後のstate/record current identity/value/historyを記録した後、S1の不成立を別fixtureで起こして構成・artifact/configurationだけをS0へrollbackする。rollback後もstate/recordは切替後のcurrent identity/value/historyを保ち、rollback transitionは新recordとして追記する。S0の古い構成checkpointを案件dataの時点復元に流用しない。L2の「前の段階で次を作る」「乗り換え」「戻し」をそれぞれtraceする。未見正常: 別の合成state value、複数record event、異なる追加/更新packでも、S0を保持して作ったnextへcutoverし、その後S0構成へ戻しながらcutover後のcurrent state/recordを維持する。独立negativeを各々別fixtureにする: (a) S0でなく開発中treeまたは無関係の構成を基盤にS1を作る、(b) S1構築中にS0の構成を変更または失う、(c) S1構築中にS0のartifactを変更または失う、(d) forward cutoverでstateだけを失う、(e) forward cutoverでrecord/historyだけを失う、(f) 構成は正しくS0へ戻すが古いcheckpoint復元でcutover後のstate updateを失う、(g) 案件stateは保つがrollbackで追加record/historyだけを失う、(h) next検証前に切り替える、(i) rollback target欠落、(j) rollback target wrong revision。期待: prior構成喪失、forward/rollbackでのstate/record喪失、復元範囲不明またはdata-format非互換はunknown/unfinishedとして保持する。prior構成・artifact境界、stage構築・cutoverと案件state/record custodyはOSへ、pack追加/更新契約とverificationはHARNESSへ、rollback target/procedure/data compatibilityはINFRASTRUCTURE-019へ、backup/restoreと復旧evidenceはINFRASTRUCTURE-017/018へ返す。構成rollback成功だけで案件state/record継承成功としない。成功記録から1.0を生成しない。

### CASE-OS-014-07 — 自己依存・宣言外dependency（AC-OS-014-07）

正常: synthetic dependency graphを段階境界で細分し、検査で見つかった隠れた自己依存edgeを除去する。除去後は必要な外部/固定dependencyだけが宣言され、起動・更新・recovery手順がstopped HELIXから独立した経路を指すことを確認する。未見正常: 別のclosed declared graphも細分・照合し、隠れた自己依存が見つからない場合に推測でedgeを作らない。各negativeは一つのedgeまたは除去状態だけを変える: (a) development worktree required, (b) next stage required, (c) another live stage required, (d) undeclared runtime dependency, (e) 分割後も検出した自己依存edgeを残す, (f) INFRA-020 recovery command/pathが停止中HELIXへ循環依存する。期待: self-sufficientとしない。dependency declarationはHARNESS-010、実environment/start/recoveryはINFRASTRUCTURE-020/022へ戻す。static graph edgeだけで実runtime dependencyを断定せず、観測不足はunknown。

### CASE-OS-014-08 — pack/stage/1.0 quality stateの分離（AC-OS-014-08）

正常: pack verification、stage scope acceptance/integration/update/rollback/operation evidence、Concept 1.0 attainmentの各stateに異なるidentity/sourceがあり、対象revisionへ結ぶ。未見正常: pack単体が適格でもstage evidenceが途中の状態をunfinishedとして保持する。独立negative: pack green→stage accepted、stage accepted→1.0 attained、stage delivery→最終requirement削減、提供範囲縮小→stage内required quality削減。期待:各境界のownerへ不足を返す (pack→HARNESS, stage→OSと適用されるHARNESS/INFRA/SECURITY, Concept 1.0→Concept/要求owner)。

### CASE-OS-014-09 — owner境界とHARNESS service ⑥（AC-OS-014-09）

正常: OS stage record、HARNESS pack/call/verification contract、INFRA resource/rollback evidence、SECURITY authority/secret policyを各source ownerへ結び、HARNESSサービス⑥の対象製品release recordを別identityにする。未見正常:対象製品releaseがscope外でもHELIX-stage recordを区別して保持する。negativeはOSがHARNESS contractを変更、OSがINFRA runtime stateを主張、OSがSECURITY許可を生成、HARNESS service⑥=HELIX stageと同一視、HELIX stageをOS-L2-021の対象project向けHARNESS構成版配布と同一視、新owner推測を各一つずつ変異する。021の配布条件は014へ取り込まない。期待: owner/source identityを偽らず、scope-specific ownerへ返す。return先不明はunknownを保ち既存parentへ戻す。新owner/approval gateを作らない。

### CASE-OS-014-10 — unmet capabilityとINFRASTRUCTURE-023除外（AC-OS-014-10）

正常: 未成立能力を「できないこと」に記し、固定L2で必要な操作に人手担当を割り当てる一方、必要安全条件は全て満たす。未見正常:別の明示unmet capabilityもscope/limitationへ保持し、L1-023を要求しない。negativeを個別化: capabilityをできると記す、担当人を落とす、担当記録でrequired safety dependencyを免除、L1-023の存在/完成をrelease条件化、L1-023をStage2b/1.0へ前倒し、L1-023欠落だけでstageを失格化。期待: 固定対象scopeを保ち、capability/operation ownerへ不足を戻す。INFRA-023は後続版・版未定であり、L2-014成立に必要な条件ではない。

### CASE-OS-014-11 — FRS-BR-008/009 disposition（AC-OS-014-11）

正常: `MPR-RC-HELIXOS-L2-014-002`のsource dispositionと固定PO決定に沿って、FRS-BR-008の内部で使う意味とFRS-BR-009の安全閉包/組合せ検証を現行契約へ再導出し、旧CI先行利用を使わない。固定coverage receiptでは6 source atomsのうち5件をcarried、1件Cursor限定委譲を保留する。未見正常: 同じ処分を別revision-bound planning recordでたどり、保留atomを対象へ混入しない。negativeを個別にする: 旧CI/wait/rerunを追加、Lite/Fullをstage名にする、保留Cursor委譲を復活、安全dependencyを落とす、HARNESS service⑥をOS配布境界へ取り込む、旧test/runtimeを合格証拠にする。期待: PO dispositionを保持しsource/owner不足へ戻す。旧source、登録、testから採択や実行許可を推測しない。

## Stage 2a — 8親の機能総合検証（015/016/017/018/019/020/023/027）

状態: L3対の検証設計候補。実行結果・L3承認・実装/実行許可を生成しない。L3 `functional-requirements.md`のAC IDに結び、fixed L2/L11 source revisionとownerをoracleにする。新世代CI未構築、旧test/runtime/CIは実行しない。

旧L3定義、旧L10 process、旧READMEとpaired testのpositive/negative/trace形からverification/backflowの意味を再導出する。旧processはL3↔L10、READMEはL3→L12と層対応が異なるため、この不一致を記録し、どちらの旧層対応も現行の正本として引き継がない。現在の配置は現行6 canonical文書によるL3/L10構成に従う。旧G3/L12 gateとtest runtimeは移さない。

各CASEはfixture input/digest、親L2 fixed revision、HARNESS contract/oracle source（適用時）、expected state/owner routeを保持する。一つのnegative CASEにつき一変数だけ変更する。運用・PR/review/CI/mailbox outcomeをPO decision、許可、acceptanceへ昇格しない。

### CASE-OS-015-01 — authority record正常（AC-OS-015-01）

別対象のConcept/L1/要求revision、decision record、raw eventとIssue/PR projectionを入力する。Oracleはsource identity/revision/digest/decision source/ownerをcanonicalへ辿り、projection close/merge/green変化後もauthorityが不変、訂正後も原eventが保持されること。合格は全traceが一致すること。

### AC-OS-015-02 — authority negative（AC-OS-015-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-015-02a` | target identity unknown | unresolvedを保持し対象canonical ownerへ戻す |
| `CASE-OS-015-02b` | target source revision stale/mismatch | authorityを成立扱いせずcanonical sourceへ戻す |
| `CASE-OS-015-02c` | digestを欠落または不一致 | current authority projectionに採用せずsourceへ戻す |
| `CASE-OS-015-02d` | decision sources conflict | unresolved conflictを保ちdecision ownerへ戻す |

Projection-only approval、訂正によるraw event上書き、PR/memory/CIからのmeaning/approval/permission生成も期待oracle違反とする。

### CASE-OS-015-03 — unseen correction chain（AC-OS-015-03）

未見targetと複数回の修正・分類eventをheld-out入力にする。oracleはsource revision・訂正前後・original raw eventsを順に辿れること。未知の分類はunknownのままにし、PR/review statusから埋めない。

### CASE-OS-016-01 — portfolio states正常（AC-OS-016-01）

二つ以上のproject、各requirements revision、unit/connection/composite edges、dependencies、diff/verification/provision/operation stateを与える。Oracleはそれぞれunconnected/unagreed/unimplemented/unverified/unprovided/unknown/staleを別に表示し、下位対象成功を他対象へ波及させず、release-kanban recordをsourceにtraceする。

### AC-OS-016-02 — state/edge negative（AC-OS-016-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-016-02a` | unit successのみでconnection/composite completeとする | 拒否しunit/connection/compositeを別stateにする |
| `CASE-OS-016-02b` | owner identity欠落 | unknown/conflictを保持し要求/source ownerへ戻す |
| `CASE-OS-016-02c` | dependency edge欠落 | edge unknownのまま下流completeにしない |
| `CASE-OS-016-02d` | implementation diff欠落 | impactなしと推論せずsource ownerへ戻す |
| `CASE-OS-016-02e` | verification target欠落 | unknownを保持しsource/connection ownerへ戻す |

単一project/CI/PRを他project/composite証拠にする変異も不合格。ticket plan/CIのみでmerge/release readinessにしない。

### CASE-OS-016-03 — unseen portfolio relation（AC-OS-016-03）

未見dependency/relationを含む二対象以上のportfolioを投入。Oracleはknown stateを保ちunknown edge・owner・revisionを表示すること。未提示targetのcoverageを全repo censusとしてclaimしない。

### CASE-OS-017-01 — accepted inputsからticket候補（AC-OS-017-01）

同一accepted request/HARNESS contract/INT proposalを反復投入し、別の有効target/dependencyも対照にする。Oracleは同条件でtarget/kind/parent revision/scope/dependency/acceptance duty/return ownerが同じticket candidateとなり、別対象差を保持すること。INT提案はauthority/budget/deadline/dependencyとHARNESS語彙へ照合される。

### AC-OS-017-02 — suitability negative（AC-OS-017-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-017-02a` | INT proposalを無条件で採用 | OS適格性照合を通らず実行可能ticketにしない |
| `CASE-OS-017-02b` | HARNESS process term/order/dutyをOSが変更 | 元のHARNESS contractへ返しcandidateを保留 |
| `CASE-OS-017-02c` | fixed HARNESS partにないflowを1.0で生成 | unsupported/unknownで止め、既定戻し先を保つ |
| `CASE-OS-017-02d` | required input unknown | ticketを実行可能にせず要求/permission ownerへ戻す |
| `CASE-OS-017-02e` | unresolved dependencyをready化 | dependency ownerへ返し実行可能ticketにしない |
| `CASE-OS-017-02f` | restartでoriginal revision/stop reason/unfinished duties/budget/deadlineを落とす | 再開を不成立にし、累積条件を復元する |

全案件へ同一固定sequenceを当てる変異も拒否する。

### CASE-OS-017-03 — unseen allowed components（AC-OS-017-03）

未見targetで固定HARNESS componentの許可された別組合せを入力する。Oracleは既知部品のみを適用し、部品外の動的workflow能力を捏造せず、適格性差を説明する。

### CASE-OS-018-01 — assignment/attempt normal（AC-OS-018-01）

ticket/head/authority/Worker/caller lane/scope/lease/cumulative budget/deadlineとINFRA resource/LABO class statusを固定し、assignment→attempt→artifact/evidence→handoffを追跡する。作成Workerと別identity/context/authorityの独立review担当へ意味とunfinished dutiesを渡し、author自身を承認者にしない。

### AC-OS-018-02 — execution-control negatives（AC-OS-018-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-018-02a` | 同一leaseでduplicate claim | 重複claimを拒否 |
| `CASE-OS-018-02b` | 同一attemptでduplicate run | duplicate executionを防ぎOS stop evidenceを記録 |
| `CASE-OS-018-02c` | restart時にcumulative budgetをreset | attempt継続を止め元の制約を維持 |
| `CASE-OS-018-02d` | restart時にdeadlineをreset | attempt継続を止め元の制約を維持 |
| `CASE-OS-018-02e` | failure count reset | resetを拒否し既存attempt状態を保つ |
| `CASE-OS-018-02f` | unassessed Workerをassessedと表示 | LABO状態を改変せず未評価に保つ |
| `CASE-OS-018-02g` | author Workerが自分をapprove/independent-review済みにする | 独立性不成立として別reviewへ戻す |
| `CASE-OS-018-02h` | assignment scope mismatch | start/continueを停止しpartial output隔離、OSへ返す |
| `CASE-OS-018-02i` | target HEAD mismatch | start/continueを停止しpartial output隔離、OSへ返す |
| `CASE-OS-018-02j` | expired lease | 継続を停止しhandoff dutiesを保持 |
| `CASE-OS-018-02k` | Worker capability mismatch | start/continueを停止しLABO/OS ownerへ返す |
| `CASE-OS-018-02l` | authority stale/mismatch | start/continueを停止しSECURITY/source ownerへ返す |

### CASE-OS-018-03 — unseen replacement/resume（AC-OS-018-03）

期限またはlease expiryの後、Worker交代/再開を行う。Oracleはunfinished dutiesとbudget/deadline/failure count/scopeを維持し、期限後の旧assignmentを流用しない。

### CASE-OS-018-04 — planned vs performed HIL-NFR-36 record（AC-OS-018-04）

accepted defaultから逸脱した品質issue fixtureで、予定手順、実際の手順、結果、逸脱理由を別々に入力する。Oracleは実績と予定を区別して記録すること。追加のdefault、retry上限、全件共通対応順は作らない。

### CASE-OS-019-01 — episode reconstruction normal（AC-OS-019-01）

source/revision/correlation ID/actor/data-use class付きの要求・判断・作業・検証・backflow/checkpoint eventからepisodeを再構成。Oracleはmissing/duplicate/stale/denied/not-runとsuccessを区別し、restart後もscope/deadline/budget/failure count/unfinished dutiesを保持する。

### AC-OS-019-02 — continuity negatives（AC-OS-019-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-019-02a` | 同eventを再配送 | 記録duplicateを分類し同じside effectを二重実行しない |
| `CASE-OS-019-02b` | raw eventsを欠きprovider memory/summaryだけ渡す | authority recoveryを拒否しoriginへevidence欠落を戻す |
| `CASE-OS-019-02c` | 保存またはprojection失敗後もsuccess checkpointを公開 | 不合格、raw eventから再構築 |
| `CASE-OS-019-02d` | unauthorized data-use classを他project/learning用途へ送る | 送信を拒否しSECURITY/origin ownerへ返す |

### CASE-OS-019-03 — unseen crash/replay sequence（AC-OS-019-03）

未見のcrash/restart/replay順序をheld-out入力にし、raw sourceからepisodeを復元する。記録件数やprojection生成だけをcompletionとしない。

### CASE-OS-020-01 — scoped obligation profile/run（AC-OS-020-01）

HARNESS-L2-022等の実際に選択されたcontract/oracle、requirements pair、ticket, changeset/base, runner/environmentを入力する。HARNESSが要求する対象義務のみをprofileへ写し、exact HEAD/oracle/env/run identityと状態success/fail/denied/skipped/interrupted/staleを照合する。CIを動かした結果ではなく設計oracleを示すcaseである。

### AC-OS-020-02 — verification negatives（AC-OS-020-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-020-02a` | すべての仕事へ固定段数を要求 | HARNESS契約にない義務を追加せず不合格 |
| `CASE-OS-020-02b` | OSがHARNESS oracleを追加/削除 | HARNESS ownerへ戻しprofile未確定 |
| `CASE-OS-020-02c` | applicable obligationを一つ欠落 | unfinishedとしてHARNESS/ticket/resource ownerへ戻す |
| `CASE-OS-020-02d` | exact base/headと異なるHEADのgreenを使う | resultを現対象の成功にしない |
| `CASE-OS-020-02e` | CI successからmeaning review/acceptance/merge/releaseを推論 | decisionを生成せず不合格 |
| `CASE-OS-020-02f` | 旧CI greenを新世代結果として使う | 不合格。旧CIは実行しない |

### CASE-OS-020-03 — unseen mixed obligations（AC-OS-020-03）

複数義務を持つ未見diffについて、固定HARNESS contractに照らしたselection rationaleを記録し、義務を追加/省略しない。plan stateとrun stateは別にする。

### CASE-OS-023-01 — sender/receiver handoff normal（AC-OS-023-01）

OS-016から対象要求revision、unit/connection/composite relationとsource-bound stateを含むportfolio traceを入力し、015/017/018/019/020からauthority、ticket、assignment/attempt、evidence、検証義務/結果の該当sourceを接続する。exact revision/digest/causal ID/scope/duty/stop reason/evidenceを送る。unit outcome、connection acceptance、composite acceptanceを別oracleで照合し、receiverがunfinished dutiesを受理した記録を確認する。

### AC-OS-023-02 — handoff negatives（AC-OS-023-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-023-02a` | revision/digest mismatch | connection unresolved、origin source/managementへ返す |
| `CASE-OS-023-02b` | authority/evidence mismatch | acceptanceを拒否しorigin ownerを保持 |
| `CASE-OS-023-02c` | unit successのみでconnection/composite/next stage accepted化 | 不合格、別判定を保つ |
| `CASE-OS-023-02d` | receiver未受領なのにticket complete | 不合格、unfinished dutiesとticketを保留 |

### CASE-OS-023-03 — mixed-duties unseen handoff（AC-OS-023-03）

未見receiverとcompleted/unfinished混在を入力し、各dutyを元scope/revisionに維持する。transport receiptだけでbusiness successを作らない。

### CASE-OS-027-01 — unassessed-only normal（AC-OS-027-01）

Worker/model性能履歴だけを「未評価」にし、他入力は全て固定L2条件に合致させる。6条件すべてのevidenceと有効authority、人が狭いscope/Worker/budget/deadline/stop/HARNESS dutiesを確認した状態なら、性能未評価を理由に拒否しない。条件成立の記録後に限る限定初回作業を設計上許容し、作成Workerとは異なる確認者actorが実行結果を確認した記録に結果、対象revision、scope、確認時点、未完義務を束縛する。確認記録は固定L2/L11のevidenceであり、実行許可や新しい毎回承認gateを作らない。成功結果もLABO評価前はunassessedに留める。これは実行・許可の実証ではない。

### AC-OS-027-02 — 六つのlow-risk条件を個別に破る

正常な基準入力では六条件とoperation authorityを成立させる。各行では対象条件内の一fieldまたは事実だけを変え、非対象の五条件を保つ。02e1〜02e3は条件5への変異でoperation authority自体が不成立となるため、変異後にauthority有効とは記録しない。他の条件への変異では操作authorityを有効に保つ。02a5のdata-use許可欠落と条件5の操作authority不一致は別のfixtureとして照合する。

| CASE | single mutation | expected / owner |
|---|---|---|
| `CASE-OS-027-02a1` | asset identity欠落 | start拒否、SECURITY/source ownerへ戻す |
| `CASE-OS-027-02a2` | classification owner欠落 | start拒否、SECURITY/source ownerへ戻す |
| `CASE-OS-027-02a3` | classification source/revisionをstale化 | start拒否、SECURITY/source ownerへ戻す |
| `CASE-OS-027-02a4` | planned output classification/scope欠落 | start拒否、OS/SECURITYへ戻す |
| `CASE-OS-027-02a5` | data-use permissionを欠落 | start拒否、SECURITYへ戻す |
| `CASE-OS-027-02a6` | input/outputをsecretまたはHELIX-restrictedにする | start拒否、SECURITYへ戻す |
| `CASE-OS-027-02b` | credential accessまたはraw secret read/input/outputが必要になる | start拒否、SECURITYへ戻す。別の人確認で上書きしない |
| `CASE-OS-027-02c` | networkなしをunauthorized destination/protocol/path/egressへ変更（SECURITY-006明示許可なし） | start/retry拒否、SECURITYへ戻す |
| `CASE-OS-027-02d` | isolationまたはSECURITY制約の一つを未適用にする、またはhost fallback | start拒否。partial outputがあれば隔離しINFRA/SECURITYへ戻す |
| `CASE-OS-027-02e1` | authorized actorを別actorにする | start拒否、authority sourceへ戻す |
| `CASE-OS-027-02e2` | target/operationのうち一方を変更 | start拒否、authority sourceへ戻す |
| `CASE-OS-027-02e3` | revision/environment/scope/expiryのうち一つをstale/mismatch | start拒否、authority sourceへ戻す |
| `CASE-OS-027-02f` | 取り消せる小成果物を不可逆変更/release/tag/distribution/rollback不能へ変更 | start拒否、OS/authority ownerへ戻す。人確認で免除しない |

### CASE-OS-027-03a〜03k — 独立した開始/適用scope negative（AC-OS-027-03）

共通normal baselineでは六条件とoperation authorityを確認済みにする。各fixtureは一つの追加required input/bindingだけを変える。03aはauthority欠落であり、六条件のうち条件5（operationごとの有効authority）と重複する。03aでは他の五条件を満たしたまま条件5に重なるauthority fieldだけを外し、六条件全て成立とは記録しない。これは重複するauthority oracleの個別traceである。

| CASE | single mutation | expected / owner |
|---|---|---|
| `CASE-OS-027-03a` | operation authority missing | start拒否、SECURITY authority sourceへ戻す |
| `CASE-OS-027-03b` | HARNESS oracle missing | start拒否、HARNESS ownerへ戻す |
| `CASE-OS-027-03c` | authorized budget missing | start拒否、OS/ticket ownerへ戻す |
| `CASE-OS-027-03d` | deadline missing | start拒否、OS/ticket ownerへ戻す |
| `CASE-OS-027-03e` | stop condition missing | start拒否、OS/ticket ownerへ戻す |
| `CASE-OS-027-03f` | task scope outside accepted bound | start拒否、OS/source ownerへ戻す |
| `CASE-OS-027-03g` | verification scope outside accepted bound | start拒否、HARNESS/OS ownerへ戻す |
| `CASE-OS-027-03h` | exact HEAD mismatch | 現対象として実行/検証しない |
| `CASE-OS-027-03i` | partial successを完了扱い | 不合格、unfinished dutyを保持 |
| `CASE-OS-027-03j` | LABOがOS assignment/Workerを指定 | 不合格、OS ownerへ戻す |
| `CASE-OS-027-03k` | scoreのみでscope/branch/authority変更 | 不合格、permissionと評価を分離 |

### CASE-OS-027-04 — unseen conforming task（AC-OS-027-04）

未公開task fixtureが同じ6条件・authority・scope・oracleを満たすとき、その限定入力の範囲でのみ扱い、unknownを推測で埋めない。成功後も適用scope付きLABO評価が未完ならunassessedを保つ。

### CASE-OS-027-05 — human substitute trace（AC-OS-027-05）

INT/LABO runtimeを前提にしないhuman proposal/evidence fixtureにtask identity、source/contract revision、scope、unassessed、actor/timeを束縛する。OS receiptとassignmentは別状態。human inputをINT-generated/LABO-assessed/permissionとして表示したら不合格。実行結果を人が確認した場合は、作成Workerと異なる確認者actor、対象revision、scope、確認時点、結果、未完義務を同じ確認recordへ束縛し、proposal/evidence代行とは別に追跡する。

### CASE-OS-027-06 — evidence-scoped LABO assessment（AC-OS-027-06）

適用可能なoracle revision/criterion/comparison conditionを特定し、実結果/failure/counterexample/unknownに適用した状態をLABO ownerが確認する。対象task/model class/scopeだけassessedとし、別scopeには流用しない。oracle不在・scope mismatch・実適用なし・一回成功のみならunassessed/evaluation-unknown。

### C13 carry-forward

C13-M findings、minor findings、unreviewed legacy crosswalkは従前のaudit scopeどおりcarryする。本文を作成したこと、source SHA一致、静的参照検査は独立reviewやfinding closureではない。
