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

## Stage 2c追補 — HELIXOS-L2-028 / HELIXOS-L2-029

状態: 以下はL3機能要件との対をなす検証候補で、case実行・PO承認・実装/実行許可ではない。固定oracleはf6dad2a33e24f000b87d7f09b8d40288257e74ccのL2/L11各親に限る。CASE IDは親ごとに完全修飾し、fixture ID・parent revision・scope・HARNESS oracle source・expected state・owner routeを記録する。一negative fixtureの変異は一変数のみ。存在しない業務oracleは作らない。

### CASE-OS-028-01 — 相談案の正常例（amount境界、AC-OS-028-01）

L11-028:462-463のAPI契約を固定oracleとする。`amount <= configured maximum`では201と指定額の永続化、`amount > maximum`では422かつ永続状態不変。元Workerが`maximum+1`で誤った201/更新を観測したfixtureをticketへ結ぶ。INTELLIGENCEは既存API contract、scope内validator source、適用可能な同型failure sourceから利用許可のあるsourceだけを選び、`>`/`>=`の境界根拠と拒否時副作用に限定したconsult案を作る。OSが別assignmentで認可した後だけ送信し、response/source/scope receiptを同一ticket/revisionへ束ねて元Workerへ戻す。connection receipt単体では実装修正/verification/compositeを合格にしない。

### CASE-OS-028-02 — 相談を使わない通常作業（AC-OS-028-02）

親L2-028:855-857の通常経路。相談を要しないticket/owner/revision/assignment/scope/budget/deadline/stop、必要oracle、該当operationのSECURITY authorityと実行制約、INFRASTRUCTURE資源状態を束ね、状態・版が有効な入力として確認する。停止/詰まり説明、consult提案、未選択consult source permission、相談receipt、相談worker稼働は要求しない。設計・code・BRAIN等の入力元を別途選択した場合はそのidentity/revision/利用許可等を保持する。SECURITY/INFRASTRUCTUREの常時入力と相談時・選択時入力を分け、consult完了やOS-029 composite完了は主張しない。正常subfixture `CASE-OS-028-02a`ではWorker/model classだけをunassessedとし、L2-027の限定初回条件とoperation authorityが成立した入力を与える。限定作業を進めてもevaluation stateはunassessedに保ち、consultを要求しない。`CASE-OS-028-02b`は同じ入力からL2-027必須条件のうちHARNESS oracle applicabilityだけを欠落させ、他条件を保ち、当該operationを開始せずoracle/requirement ownerへ戻す。

### CASE-OS-028-05 — 分解subtask handoff正常例（AC-OS-028-02/05）

固定L2-028:856の分解経路。各subtaskに親ticket、scope、dependency、acceptance condition、stop conditionが結ばれ、元Workerへ渡り、元Workerの結果とunfinished dutyが同じ親ticketへ返る正常fixtureを作る。相談を選んでいないため相談先、停止/詰まり説明、consult receiptは要求しない。

### CASE-OS-028-06 — 分解subtask bindingの単独negative（AC-OS-028-03/06）

各fixtureは正常CASE-OS-028-05から該当一項目だけを欠落または不一致へ変え、残り4項目と通常入力を固定する。実行可能handoffとして受け付けず、固定L2-028:860のowner境界に沿って欠落bindingを戻す。ticket/scope/authorityはOS/SECURITY、依存はその既存source owner（oracleはHARNESS、authorityはSECURITY、資源はINFRASTRUCTURE等）、acceptance/oracleはHARNESS/要求owner、stop/assignmentはOS/assignment ownerへ返し、未定義ownerは推測しない。

| CASE | 単独変異 | 期待状態／戻し先 |
|---|---|---|
| `CASE-OS-028-06a` | 親ticketだけ欠落/不一致 | subtaskを受理せず元ticket/OSへ返す |
| `CASE-OS-028-06b` | scopeだけ欠落/不一致 | scopeを推測せず元Worker/OSへ返す |
| `CASE-OS-028-06c` | dependencyだけ欠落/不一致 | 実行可能扱いせず、その依存の固定L2上の既存owner（例: oracleはHARNESS、authorityはSECURITY、resourceはINFRASTRUCTURE等）/OSへ返す。対応ownerがunknownなら推測せずunknownを保持する |
| `CASE-OS-028-06d` | acceptance conditionだけ欠落/不一致 | oracleを補わずHARNESS/要求ownerへ返す |
| `CASE-OS-028-06e` | stop conditionだけ欠落/不一致 | 実行を開始せずOS/assignment ownerへ返す |

### CASE-OS-028-07 — SECURITY/INFRA常時入力の単独negative（AC-OS-028-07）

通常CASE-OS-028-02と同じnon-consult operationを基準にし、各fixtureでは他の必須入力を有効のまま、表の一項目だけをmissingまたはunknownへ変える。該当operationだけをholdし、scope外・無関係作業の一律停止やconsult source permissionへの読み替えをしない。

| CASE | 単独変異 | 期待状態／戻し先 |
|---|---|---|
| `CASE-OS-028-07a` | 該当operationのSECURITY authorityだけをmissing/unknownにする | operationを開始せずOS/SECURITYへ戻す |
| `CASE-OS-028-07b` | SECURITY authorityは有効のまま、実行制約だけをmissing/unknownにする | 制約の適用を確認できるまで該当operationをholdしSECURITY/INFRASTRUCTUREへ戻す |
| `CASE-OS-028-07c` | SECURITY入力は有効のまま、該当INFRASTRUCTURE資源状態だけをmissing/unknownにする | 該当resource-dependent operationをholdしINFRASTRUCTURE/OSへ戻す |

### CASE-OS-028-03 — 相談時のnegative（AC-OS-028-03）

各行は別fixtureで、他条件をfixed-parent baselineに保つ。`CASE-OS-028-03b`のsourcepermission検査はconsult選択だけに限定せず、consultの有無を問わず入力元を実際に選択した操作へ適用する。未選択sourceのpermissionは要求しない。

| CASE | 1変数のnegative | 期待状態／戻し先 |
|---|---|---|
| `CASE-OS-028-03a` | OS authorization/assignment receiptなしでconsultをdispatch | connection未成立。OS/SECURITYへ戻す |
| `CASE-OS-028-03b` | 実際に選択したsourceの利用permissionだけをunknown/restrictedにする | selected supportをhold。source owner/SECURITYへ戻す |
| `CASE-OS-028-03c` | 正常なrequestのresponse receiptだけを欠落させる | 未解消/unfinishedのまま。OSへ戻し019 retentionを確認 |
| `CASE-OS-028-03d` | L11-028誤り例のとおり、助言だけで`>`を`>=`へ変える | requirement/oracleを変更しない。意味差分はHARNESS/requirement ownerへ戻す |
| `CASE-OS-028-03e` | consultantを同じ成果物のindependent reviewerとして再利用 | 独立review条件未成立。元Worker/OSへ返し別reviewerを要求 |
| `CASE-OS-028-03f` | 返却時の元assignment/scopeを別scopeへ結び替える | handoff拒否しOS/assignment ownerへ戻す |
| `CASE-OS-028-03g` | attempt/cost/partial/unfinished/restart dataのうちpartial resultだけを落とす | success表示拒否しOS-019へ保持 |
| `CASE-OS-028-03h` | 既存assignment budget到達後の継続を成功扱い | stop/unfinishedを保持しOSへ戻す。retry countを追加しない |
| `CASE-OS-028-03i` | 既存assignment deadline到達後の継続を成功扱い | stop/unfinishedを保持しOSへ戻す。retry countを追加しない |
| `CASE-OS-028-03j` | 既存assignment stop condition成立後の継続を成功扱い | stop/unfinishedを保持しOSへ戻す。retry countを追加しない |
| `CASE-OS-028-03k` | 元Worker再開入力から質問だけを欠落 | handoff/再開を成立扱いせずINTELLIGENCE/OSへ返しunfinishedを保持 |
| `CASE-OS-028-03l` | 元Worker再開入力から回答だけを欠落 | handoff/再開を成立扱いせずINTELLIGENCE/OSへ返しunfinishedを保持 |
| `CASE-OS-028-03m` | 元Worker再開入力からselected source revisionだけを欠落 | sourceを推測せずsource owner/SECURITY/OSへ返しunfinishedを保持 |
| `CASE-OS-028-03n` | 元Worker再開入力からunfinished dutyだけを欠落 | handoff/再開を成立扱いせずOS/元Workerへ返し義務を保持 |
| `CASE-OS-028-03o` | 実際に選択したsourceのrevisionだけをstale/conflictにする | selected supportをholdしsource owner/SECURITYへ戻す。現行revisionを推測しない |
| `CASE-OS-028-03p` | 選択sourceの利用範囲だけを当該ticket scope外にする | ticket scope外のsource利用を拒み、source owner/SECURITY/OSへ戻す |
| `CASE-OS-028-03q` | 実consultでsource/相談案receiptだけを欠落させる | connectionを未成立のまま保持しINTELLIGENCE/source owner/OSへ戻す |
| `CASE-OS-028-03r` | response等は揃え、元Workerへのreturn handoff receiptだけを欠落させる | connectionを未成立のまま保持しOS/元Workerへ戻す |

### CASE-OS-028-04 — 未見endpointとoracle適用可否（AC-OS-028-04）

L11-028:465の未見fixture。別endpointでvalidation不具合が出たが、拒否時の状態不変義務と既存oracleの適用可否が不明な状態を入力する。Oracleはgeneric ruleを類似性から生成せず、requirement/oracle ownerと不足情報を特定し、該当scopeだけholdする。相談不成立時もattempt/cost/stop reason/unfinished/restart conditionsをOS-019へ残す。

### CASE-OS-029-01 — 相談なしの準備と作業（AC-OS-029-01）

L11-029:473のnormal routeを別fixtureで表す。確定assignmentを持つ元Workerの作業前taskでsupportを選択した場合は、INTELLIGENCEがapproved request/designとHARNESS-022の既存oracleからtest/instruction candidateを正確なsource revisionへ結び、OSが同じ軽量Worker設定でticketを開始する。consultは選択せずOS-028 receiptを要求しない。approved requirement/pair/oracleの適用、元Workerの実作業、HARNESS-022が定める許可済み検証の実行結果とsource-bound receipt、元Workerおよびsupport/test候補作成者とは別identityの独立reviewerによるcurrent差分・oracle・resultの確認を維持する。findingがあれば同じ軽量Worker設定の元Workerへ返して修正・再検証し、新HEADとresultを再び束縛する。LABO-L2-060は効果測定を明示的に選んだ場合だけcomparison materialとして参照し、runtime prerequisiteにしない。oracle適用はHARNESS-022に宣言された義務だけで行い、このcaseで新しいbusiness outcomeを補わない。

### CASE-OS-029-07 — supportとconsultを選ばない作業・検証（AC-OS-029-01/06）

L2-029:873のsupport-unselected条件を、CASE-OS-029-01のINTELLIGENCE事前candidate経路と分けたnormal fixtureで照合する。確定assignmentを持つ元Workerがapproved requirementとpaired designを直接用い、既存HARNESS-022 oracleの適用義務を確認して許可済み経路で実作業と実検証を行い、対象source revisionに結ばれた結果receiptを記録する。support proposalとOS-028 consult receiptはいずれも要求しないが、必要な独立review/owner receiptは維持する。独立reviewerは元Workerと別identityでcurrent resultを確認する。findingがあれば元Workerが同一の軽量Worker設定で修正・再検証し、その新revisionのresult receiptと独立reviewを結び直す。proposal不要を検証義務免除と扱わず、oracleやbusiness outcomeを新設しない。

### CASE-OS-029-02 — 相談選択時のPATCH oracle（AC-OS-029-02）

L11-029:474のnormal routeを別fixtureで表す。既存PATCH oracleではdraftの有効変更を受け入れ永続化し、approvedの編集を拒否して永続値を変えず、unrelated field/stateは不変である。作業中consultを選択した場合だけ、scope内のsource/response/return receiptをCASE-OS-028-01とは別のOS-028 operationとして付ける。元Workerが修正し、HARNESS-022に結んだ許可済みOS-020 execution resultを得る。consultant/authorはreviewerにしない。

### CASE-OS-029-03 — HEAD変更後のcurrent independent review（AC-OS-029-03）

L11-029:475。HEAD-Aのreview receipt後に元WorkerがHEAD-Bへ変更したfixtureでは、HEAD-Aのresultまたはreview receiptだけを使うと不合格。新receiptはcurrent exact HEAD、base、task scope、HARNESS oracle、current resultを束縛し、reviewer identity/context/authorityが元Worker・支援者・test authorと別で、未解消 findingが0件である。findingが1件以上ならreview条件未達として元Workerへ戻す。作成者の自己approveはCASE-OS-029-04lで独立negativeとする。

### CASE-OS-029-04 — composite negative（AC-OS-029-04）

L11-029:476の誤りを独立one-variable fixturesに分ける。

| CASE | 1変数のnegative | 期待状態／戻し先 |
|---|---|---|
| `CASE-OS-029-04a` | 支援助言でapproved-state editを許すようrequirementを変える | meaningを変更せずHARNESS/requirement ownerへ戻す |
| `CASE-OS-029-04b` | test helperの期待値を固定oracleと異なる200へ変える | oracle違反。HARNESS ownerへ戻しresult不採用 |
| `CASE-OS-029-04c` | consultant/test authorのidentityをindependent reviewerとして使う | review receipt不採用、独立review未成立 |
| `CASE-OS-029-04d` | HEAD-Aのsuccessful resultをHEAD-Bへ結ぶ | stale result拒否。current HEADで再検証 |
| `CASE-OS-029-04e` | CI greenだけをL11 Accepted receiptとして使う | Acceptedを生成せず利用者owner/受入契約へ戻す |
| `CASE-OS-029-04f` | proposal単体をOS-029 composite完了へ昇格 | 未完。残っているstage/ownerを保持 |
| `CASE-OS-029-04g` | 実consultを選んだrunでOS-028 receiptを欠落 | composite 未解消。OS/assignment ownerへ戻す |
| `CASE-OS-029-04h` | no-consult CASE-OS-029-01へOS-028 receiptを必須化 | 固定L11 normalを阻害。条件依存を正す |
| `CASE-OS-029-04i` | independent review finding 0件だけで他のHARNESS stage evidenceなしにVerifiedへ進める | Verifiedにせず不足stage/ownerへ戻す |
| `CASE-OS-029-04j` | Verified/current reviewだけで利用者acceptance receiptなしにAcceptedへ進める | Acceptedにせず利用者owner/受入契約へ戻す |
| `CASE-OS-029-04k` | HEAD-Aのindependent review receiptだけを変更済みHEAD-Bのreviewとして流用 | Bに対するreview未成立。current HEADの独立reviewerへ戻す |
| `CASE-OS-029-04l` | 作成者/元Workerが自分の成果をapproveする | independent review未成立。別identity/context/authorityのreviewerへ戻す |

### CASE-OS-029-05 — 未見endpointとunknown oracle（AC-OS-029-05）

L11-029:477.別endpointのapproved-edit類似事象で既存oracleの適用可否がunknown。INTELLIGENCEはsimilarityだけでruleを作らず、design/requirement ownerへ不足を返す。OSはverification plan candidate/unfinishedとして保持し、execution successやresumabilityを主張しない。

### CASE-OS-029-06a — 相談なしの因果順（AC-OS-029-06）

L11-029:478の全因果順を、L11-029:473のno-consult fixtureとは別のfixture identityで照合する。support選択時はproposal→相談前の元Worker初回差分→HARNESS-linked result→current independent review→必要なowner receiptを結び、support/consult未選択時はproposal/OS-028 receiptなしでapproved requirement/pair/oracle→元Workerの実作業・実検証→source-bound result→current independent review→必要なowner receiptを結ぶ。finding時は元Workerの同一軽量Worker設定での修正/retestを新HEADへ結ぶ。owner receiptまで揃った場合だけcomposite候補とする。oracleはHARNESS-022に存在する対象契約に限定し、新しいbusiness outcomeを足さない。

### CASE-OS-029-06b — 相談を選択した因果順（AC-OS-029-06）

L11-029:478の全因果順を、L11-029:474のPATCH fixtureとは別のfixture identityで照合する。proposalと相談前の元Worker初回失敗差分を先に固定し、OS authorization→consult request→response/return receipt→元Workerの相談後修正差分→HARNESS-linked result→current independent review→必要なowner receiptの順に同一scope/revisionと結ぶ。相談前の失敗差分は相談結果や修正差分とみなさない。OS-028 receiptはactual consultを選んだ場合にだけ含める。owner receiptまで揃った場合だけcomposite候補とする。

### CASE-OS-029-06c — 既存budget到達（AC-OS-029-06）

同じscope/revisionのcomposite attemptで既存assignment budgetだけを使い切り、他の期限/stopは未到達のfixture。成功/失敗の確定ではなくunfinishedで終了し、attempt/effect/finding/cost/time/restart stateを保存する。

### CASE-OS-029-06d — 既存deadline到達（AC-OS-029-06）

同じscope/revisionのcomposite attemptで既存assignment deadlineだけへ到達し、budget/別stopは未到達のfixture。unfinishedで終了し、attempt/effect/finding/cost/time/restart stateを保存する。

### CASE-OS-029-06e — 既存stop condition成立（AC-OS-029-06）

同じscope/revisionのcomposite attemptで既存stop conditionだけが成立し、budget/deadlineは未到達のfixture。unfinishedで終了し、attempt/effect/finding/cost/time/restart stateを保存する。固定retry countは追加しない。subunit successのみの変異はCASE-OS-029-04fと照合しcompositeへ昇格させない。

## 固定親 → FR/AC/CASE対応

| 固定親 | 機能要件 | AC / CASE | L11固定oracle |
|---|---|---|---|
| `HELIXOS-L2-028` | `FR-OS-028` | `AC-OS-028-01`→`CASE-OS-028-01`; `AC-OS-028-02`→`CASE-OS-028-02`, `CASE-OS-028-02a`, `CASE-OS-028-02b`, `CASE-OS-028-05`; `AC-OS-028-07`→`CASE-OS-028-07a`, `CASE-OS-028-07b`, `CASE-OS-028-07c`; `AC-OS-028-03`→`CASE-OS-028-03a`, `CASE-OS-028-03b`, `CASE-OS-028-03c`, `CASE-OS-028-03d`, `CASE-OS-028-03e`, `CASE-OS-028-03f`, `CASE-OS-028-03g`, `CASE-OS-028-03h`, `CASE-OS-028-03i`, `CASE-OS-028-03j`–`CASE-OS-028-03r`（`CASE-OS-028-02b`もL2-028:856の限定初回条件についてAC-OS-028-03へ対応）; `AC-OS-028-04`→`CASE-OS-028-04`; `AC-OS-028-05`→`CASE-OS-028-05`; `AC-OS-028-06`→`CASE-OS-028-06a`, `CASE-OS-028-06b`, `CASE-OS-028-06c`, `CASE-OS-028-06d`, `CASE-OS-028-06e` | L11:457-466 |
| `HELIXOS-L2-029` | `FR-OS-029` | `AC-OS-029-01`→`CASE-OS-029-01`, `CASE-OS-029-07`; `AC-OS-029-02`→`CASE-OS-029-02`; `AC-OS-029-03`→`CASE-OS-029-03`; `AC-OS-029-04`→`CASE-OS-029-04a`, `CASE-OS-029-04b`, `CASE-OS-029-04c`, `CASE-OS-029-04d`, `CASE-OS-029-04e`, `CASE-OS-029-04f`, `CASE-OS-029-04g`, `CASE-OS-029-04h`, `CASE-OS-029-04i`, `CASE-OS-029-04j`, `CASE-OS-029-04k`, `CASE-OS-029-04l`; `AC-OS-029-05`→`CASE-OS-029-05`; `AC-OS-029-06`→`CASE-OS-029-07` (unselected support/consult finding rework/retest), `CASE-OS-029-06a`, `CASE-OS-029-06b`, `CASE-OS-029-06c`, `CASE-OS-029-06d`, `CASE-OS-029-06e` | L11:468-478 |

## C13 未解消事項の引継ぎ（identityのみ）

C13からのOS carry identityは、[Claude13指摘コメント](https://github.com/RetryYN/HELIX-HARNESS/pull/2564#issuecomment-5981101754) SHA-256 `4d837e616451040cb15762e98b65cb9f104db8856f0319f4f376a47459644f1c`に基づく未解消contextとして列挙する。source locator/case correspondenceはこの追補で修正・再採択しない。各identityは未解消・未reviewのままで、本追補は独立reviewでも指摘解消でもない。

- `Claude13 OS minor 015-07 deletion oracle` — 未解消の引継ぎ。今回未評価・未解消。
- `Claude13 OS minor AC-017-29 impact candidates and Unknown` — 未解消の引継ぎ。今回未評価・未解消。
- `Claude13 OS minor AC-018-01 failure return boundary` — 未解消の引継ぎ。今回未評価・未解消。
- `Claude13 OS minor L11-31 planner/executor separation` — 未解消の引継ぎ。今回未評価・未解消。
- `Claude13 OS minor L11-227 / L2-470 promotion and identity conditions` — 未解消の引継ぎ。今回未評価・未解消。
- `Claude13 OS minor crosswalk source index` — 未解消の引継ぎ。今回未評価・未解消。
- `Claude13 OS minor non-promotion/state retention` — 未解消の引継ぎ。今回未評価・未解消。
- `Claude13 M12 / OS audit-map mismatch` — 未解消の引継ぎ。今回未評価・未解消。
- `OS legacy table cells only keyword checked` — 未review。今回未評価。
- `OS global source and coverage limits` — 未review。今回未評価。

## Stage 2a — 8親の機能総合検証（015/016/017/018/019/020/023/027）

状態: L3対の検証設計候補。実行結果・L3承認・実装/実行許可を生成しない。L3 `functional-requirements.md`のAC IDに結び、fixed L2/L11 source revisionとownerをoracleにする。新世代CI未構築、旧test/runtime/CIは実行しない。

旧L3定義、旧L10 process、旧READMEとpaired testのpositive/negative/trace形からverification/backflowの意味を再導出する。旧processはL3↔L10、READMEはL3→L12と層対応が異なるため、この不一致を記録し、どちらの旧層対応も現行の正本として引き継がない。現在の配置は現行6 canonical文書によるL3/L10構成に従う。旧G3/L12 gateとtest runtimeは移さない。

各CASEはfixture input/digest、親L2固定revision、対象revision、実行者actor、理由/evidence、使用したHARNESS契約版、expected state/owner routeを保持する。L11:322の全結果fieldをbindingし、OS Stage2aの8親すべてに適用する。一つのnegative CASEにつき一変数だけ変更する。運用・PR/review/CI/mailbox outcomeをPO decision、許可、acceptanceへ昇格しない。

### CASE-OS-015-01 — authority record正常（AC-OS-015-01）

別対象のConcept/L1/要求revision、decision record、raw eventとIssue/PR projectionを入力する。Oracleは管理record schema revision、source identity/revision/digest/decision source/owner、結果のtarget revision・実行者actor・根拠・使用HARNESS契約版を固定しcanonicalへ辿る。projection close/merge/green変化後もauthority不変、訂正後も原event保持を確認する。合格は全traceが一致すること。

### AC-OS-015-02 — authority negative（AC-OS-015-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-015-02a` | target identity unknown | unresolvedを保持し対象canonical ownerへ戻す |
| `CASE-OS-015-02b` | target source revision stale/mismatch | authorityを成立扱いせずcanonical sourceへ戻す |
| `CASE-OS-015-02c` | digestを欠落または不一致 | current authority projectionに採用せずsourceへ戻す |
| `CASE-OS-015-02d` | decision sources conflict | unresolved conflictを保ちdecision ownerへ戻す |
| `CASE-OS-015-02e` | PR/memoryだけから採否またはapprovalを表示 | authorityを生成せずdecision ownerへ戻す |
| `CASE-OS-015-02f` | 訂正で原raw eventを上書き | 上書きを不合格とし、元eventを保持して訂正eventを追記する 。戻し先はL11:329のcanonical sourceまたはdecision authorityへ返す |
| `CASE-OS-015-02g` | wrong productのsourceを選択 | 対象authorityへ採用せずcanonical ownerへ戻す |
| `CASE-OS-015-02h` | Issue/CIだけから要求意味または実装許可を生成 | meaning/permissionを生成しない 。戻し先はL11:329のcanonical sourceまたはdecision authorityへ返す |
| `CASE-OS-015-02i` | result bindingからexecutor actorを欠落 | resultをunresolvedに保ち管理/sourceへ戻す |
| `CASE-OS-015-02j` | result bindingから根拠を欠落 | resultをunresolvedに保ちoracle/sourceへ戻す |
| `CASE-OS-015-02k` | 使用HARNESS契約版を欠落 | resultを現行契約へ束縛せずHARNESS/OS sourceへ戻す |

各rowは独立fixtureで、他のbindingと入力は正常のまま保つ。

### CASE-OS-015-03 — unseen correction chain（AC-OS-015-03）

未見targetと複数回の修正・分類eventをheld-out入力にする。oracleはsource revision・訂正前後・original raw eventsを順に辿れること。未知の分類はunknownのままにし、PR/review statusから埋めない。

### CASE-OS-016-01 — portfolio states正常（AC-OS-016-01）

fixtureにはinput/digest、固定L2 parent revision、対象revision、実行actor、理由/evidence、HARNESS契約版を束縛する。二つ以上のproject、各requirements revision、unit/connection/composite edges、dependencies、diff/verification/provision/operation stateを与える。Oracleはそれぞれunconnected/unagreed/unimplemented/unverified/unprovided/unknown/staleを別に表示し、下位対象成功を他対象へ波及させず、release-kanban recordをsourceにtraceする。

### AC-OS-016-02 — state/edge negative（AC-OS-016-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-016-02a` | unit successのみでconnection/composite completeとする | 拒否しunit/connection/compositeを別stateにする |
| `CASE-OS-016-02b` | owner identity欠落 | unknown/conflictを保持し要求/source ownerへ戻す |
| `CASE-OS-016-02c` | dependency edge欠落 | edge unknownのまま下流completeにしない |
| `CASE-OS-016-02d` | implementation diff欠落 | impactなしと推論せずsource ownerへ戻す |
| `CASE-OS-016-02e` | verification target欠落 | unknownを保持しsource/connection ownerへ戻す |
| `CASE-OS-016-02f` | unresolved edgeをresume時に落とす | edgeを保持し再評価前に下流完了へ進めない |
| `CASE-OS-016-02g` | 一つのproject/CI/PRを別projectまたはcompositeの完了根拠へ流用 | cross-project completionを拒否し各対象stateを分ける 。戻し先はL11:336のtarget requirementまたはconnection ownerへ返す |
| `CASE-OS-016-02h` | CIまたはticket planだけでmerge/release readinessを表示 | readinessを生成せずsource ownerへ戻す |
| `CASE-OS-016-02i` | stale reasonをresume時に落とす | stale reasonを保持し再評価前に下流完了へ進めない |

### CASE-OS-016-03 — unseen portfolio relation（AC-OS-016-03）

未見dependency/relationを含む二対象以上のportfolioを投入。Oracleはknown stateを保ちunknown edge・owner・revisionを表示すること。未提示targetのcoverageを全repo censusとしてclaimしない。

### CASE-OS-017-01 — accepted inputsからticket候補（AC-OS-017-01）

fixtureにはinput/digest、固定L2 parent revision、対象revision、実行actor、理由/evidence、HARNESS契約版を束縛する。同一accepted request/HARNESS contract/INT proposalを反復投入し、別の有効target/dependencyも対照にする。Oracleは同条件でtarget/kind/parent revision/scope/dependency/acceptance duty/return ownerが同じticket candidateとなり、別対象差を保持すること。L2-017の1.0許可対象へ途中結果を与え、既定戻し先と元ticket identityを保って差し戻せることもnormalで確認する。INT提案はauthority/budget/deadline/dependencyとHARNESS語彙へ照合され、LABO水準/evidenceが提供された場合だけそのsource bindingを保持する。

### AC-OS-017-02 — suitability negative（AC-OS-017-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-017-02a` | INT proposalを無条件で採用 | OS適格性照合を通らず実行可能ticketにしない |
| `CASE-OS-017-02b` | HARNESS process term/order/dutyをOSが変更 | 元のHARNESS contractへ返しcandidateを保留 |
| `CASE-OS-017-02c` | fixed HARNESS partにないflowを1.0で生成 | unsupported/unknownで止め、既定戻し先を保つ |
| `CASE-OS-017-02d` | required input unknown | ticketを実行可能にせず要求/permission ownerへ戻す |
| `CASE-OS-017-02e` | unresolved dependencyをready化 | dependency ownerへ返し実行可能ticketにしない |
| `CASE-OS-017-02f` | restartでoriginal revision/stop reason/unfinished duties/budget/deadlineを落とす | 再開を不成立にし、累積条件を復元する |
| `CASE-OS-017-02g` | 全案件へ同一固定sequenceを適用 | HARNESS既定部品と当該入力に基づくflowだけを保持する 。戻し先はL11:343のmissing inputまたはresponsibilityへ返す |
| `CASE-OS-017-02h` | conflictをresolvedとして扱う | conflictを保留し既存判断主体へ戻す |
| `CASE-OS-017-02i` | scope逸脱を無視 | ticketを実行可能にせず既存scope ownerへ返す |
| `CASE-OS-017-02j` | permission不足を無視 | ticketを実行可能にせず既存permission ownerへ返す |

### CASE-OS-017-03 — unseen allowed components（AC-OS-017-03）

未見targetで固定HARNESS componentの許可された別組合せを入力する。Oracleは既知部品のみを適用し、部品外の動的workflow能力を捏造せず、適格性差を説明する。

### CASE-OS-017-HXT-TYPE-01〜21 — ticket type row trace（AC-OS-017-01/02）

各CASEはその行だけを入力する独立fixtureである。normalは固定L2/L11の同ID行から目的・発行区分・合流先を同じticketへ写して一致を照合する。negativeは同じ行のL11反例を一つずつ独立variantにし、反例条件だけを変異してexpected rejectionと既定戻し先を照合する。旧名称や未採択flowを導入しない。

| CASE | 固定L2/L11 atom | normal / negative oracle |
|---|---|---|
| `CASE-OS-017-HXT-TYPE-01` | `HXT-TYPE-01`（Forward 大） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-02` | `HXT-TYPE-02`（Forward 中） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-03` | `HXT-TYPE-03`（Forward 小） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-04` | `HXT-TYPE-04`（Discovery） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-05` | `HXT-TYPE-05`（PoC） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-06` | `HXT-TYPE-06`（Prototype） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-07` | `HXT-TYPE-07`（Decide） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-08` | `HXT-TYPE-08`（Backflow） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-09` | `HXT-TYPE-09`（Reverse） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-10` | `HXT-TYPE-10`（Recovery） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-11` | `HXT-TYPE-11`（Incident） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-12` | `HXT-TYPE-12`（Refactor） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-13` | `HXT-TYPE-13`（Design-refactor） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-14` | `HXT-TYPE-14`（Performance-refactor） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-15` | `HXT-TYPE-15`（Redesign） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-16` | `HXT-TYPE-16`（Retrofit） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-17` | `HXT-TYPE-17`（Research） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-18` | `HXT-TYPE-18`（Add-feature） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-19` | `HXT-TYPE-19`（Version-up） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-20` | `HXT-TYPE-20`（Experiment（案）） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |
| `CASE-OS-017-HXT-TYPE-21` | `HXT-TYPE-21`（Training（案、3.0）） | L2/L11の同じ行にある目的・発行区分・合流先を一組で保持し、同じ行の反例を独立入力として拒否する。未決の人判断・scope・versionを補完せず、L2/L11に明記された戻し先がある場合だけそこへ戻す。固定行に戻し先がないことから新しい戻し先を作らない。 |

### CASE-OS-017-HXT-FLOW-01〜09 — flow row trace（AC-OS-017-01/02）

| CASE | 固定L2/L11 atom | normal / negative oracle |
|---|---|---|
| `CASE-OS-017-HXT-FLOW-01` | `HXT-FLOW-01` | L2/L11の同ID行にある起点・経路・合流先を保ってnormal traceを完成する。同じ行の反例を独立入力として拒否し、ticket identity・未完義務・裁定/評価責務を保持する。 |
| `CASE-OS-017-HXT-FLOW-02` | `HXT-FLOW-02` | L2/L11の同ID行にある起点・経路・合流先を保ってnormal traceを完成する。同じ行の反例を独立入力として拒否し、ticket identity・未完義務・裁定/評価責務を保持する。 |
| `CASE-OS-017-HXT-FLOW-03` | `HXT-FLOW-03` | L2/L11の同ID行にある起点・経路・合流先を保ってnormal traceを完成する。同じ行の反例を独立入力として拒否し、ticket identity・未完義務・裁定/評価責務を保持する。 |
| `CASE-OS-017-HXT-FLOW-04` | `HXT-FLOW-04` | L2/L11の同ID行にある起点・経路・合流先を保ってnormal traceを完成する。同じ行の反例を独立入力として拒否し、ticket identity・未完義務・裁定/評価責務を保持する。 |
| `CASE-OS-017-HXT-FLOW-05` | `HXT-FLOW-05` | L2/L11の同ID行にある起点・経路・合流先を保ってnormal traceを完成する。同じ行の反例を独立入力として拒否し、ticket identity・未完義務・裁定/評価責務を保持する。 |
| `CASE-OS-017-HXT-FLOW-06` | `HXT-FLOW-06` | L2/L11の同ID行にある起点・経路・合流先を保ってnormal traceを完成する。同じ行の反例を独立入力として拒否し、ticket identity・未完義務・裁定/評価責務を保持する。 |
| `CASE-OS-017-HXT-FLOW-07` | `HXT-FLOW-07` | L2/L11の同ID行にある起点・経路・合流先を保ってnormal traceを完成する。同じ行の反例を独立入力として拒否し、ticket identity・未完義務・裁定/評価責務を保持する。 |
| `CASE-OS-017-HXT-FLOW-08` | `HXT-FLOW-08` | L2/L11の同ID行にある起点・経路・合流先を保ってnormal traceを完成する。同じ行の反例を独立入力として拒否し、ticket identity・未完義務・裁定/評価責務を保持する。 |
| `CASE-OS-017-HXT-FLOW-09` | `HXT-FLOW-09` | L2/L11の同ID行にある起点・経路・合流先を保ってnormal traceを完成する。同じ行の反例を独立入力として拒否し、ticket identity・未完義務・裁定/評価責務を保持する。 |

L11:274に従い、入力・判断の不足をシステムで補完した場合は不成立とする。各FLOW行に複数の反例がある場合は、対象行の他条件を正常に保ち、反例を一つずつ独立variantとして照合する。

### CASE-OS-023-HXT-USE-01 — 周辺job boundary（AC-OS-023-01/02）

Crawler/Bugbotは `CASE-OS-023-HXT-USE-01` として023で固定L2/L11の既存ticket種類/割当へ接続するnormalを照合する。独立negativeでは新しい種類の追加、またはWEB-OS未決jobの内部OS state/writer/authority化をそれぞれ単独変異し拒否する。

### CASE-OS-017-HXT-SYS-01 — ticket composite trace（AC-OS-017-01/02、AC-OS-023-01/02）

Normalは親要求revisionからHARNESS版、INTELLIGENCE proposal、OS eligibility/issue、HARNESS検収plan/resultまで同一ticketを追跡する。固定L2-010の束ね条件に従い、023側でも本CASEを参照し、handoff上のrevision/scope/unfinished dutiesを保つ。個別negativeは (a) BRAINに稼働判断を戻す、(b) INTELLIGENCE/HARNESSがticket発行、(c) PR mergeだけで完了、(d) 部品外flowを1.0へ生成、(e) 開発方式をticket typeへする、(f) 突発と計画を混同、を一つずつ変異し固定L11反例として拒否する。authority境界と未完義務を保持する。

### CASE-OS-018-01 — assignment/attempt normal（AC-OS-018-01）

ticket/head/authority/Worker/caller lane/scope/lease/cumulative budget/deadlineとINFRA resource/LABO class statusを固定し、assignment→attempt→artifact/evidence→handoffを追跡する。作成Workerと別identity/context/authorityの独立review担当へ意味とunfinished dutiesを渡し、author自身を承認者にしない。

### AC-OS-018-02 — execution-control negatives（AC-OS-018-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-018-02a` | 同一leaseでduplicate claim | 重複claimを拒否しattemptと停止理由を記録、OS管理/推進へ返す |
| `CASE-OS-018-02b` | 同一attemptでduplicate run | 二重実行を防ぎ停止理由を記録、OS管理/推進へ返す |
| `CASE-OS-018-02c` | restart時にcumulative budgetをreset | 継続を止め元budget/attempt/未完義務を保持し、停止理由とともにOS管理/推進へ返す |
| `CASE-OS-018-02d` | restart時にdeadlineをreset | 継続を止め元deadline/attempt/未完義務を保持し、停止理由とともにOS管理/推進へ返す |
| `CASE-OS-018-02e` | failure count reset | resetを拒否し元failure count/attemptを保ち、停止理由とともにOS管理/推進へ返す |
| `CASE-OS-018-02f` | unassessed Workerをassessedと表示 | assignment/continueを保留し未評価と停止理由を記録、OS管理/推進へ返す。recordからLABOの既存水準source ownerへ訂正依頼する |
| `CASE-OS-018-02g` | author Workerが自分をapprove/independent-review済みにする | review完了扱いを止め停止理由と未完review dutyを記録、OS管理/推進へ返し、既存の独立review担当へhandoffする |
| `CASE-OS-018-02h` | assignment scope mismatch | start/continueを停止しpartial outputを隔離、停止理由・scope・未完義務を記録してOS管理/推進へ返す。recordから元のticket/scope ownerへ訂正依頼する |
| `CASE-OS-018-02i` | target HEAD mismatch | start/continueを停止しpartial outputを隔離、停止理由・expected/observed HEAD・未完義務を記録してOS管理/推進へ返す。recordから要求revision/ticketの既存source ownerへ確認を依頼する |
| `CASE-OS-018-02j` | expired lease | partial outputを隔離し継続を止め、停止理由（lease失効）・未完義務・累積制約を記録してOS管理/推進へ返す。再開は新しい適格assignmentに結び、失効leaseを再利用しない |
| `CASE-OS-018-02k` | Worker capability mismatch | partial outputを隔離しstart/continueを停止する。停止理由（capability不一致）・attempt・未完義務を記録してOS管理/推進へ返す。管理recordから既存LABO capability source ownerへ訂正依頼する |
| `CASE-OS-018-02l` | authority stale/mismatch | partial outputを隔離しstart/continueを停止する。停止理由（authority mismatch）・attempt・未完義務を記録してOS管理/推進へ返す。管理recordから既存SECURITY authority source ownerへ訂正依頼する |
| `CASE-OS-018-02m` | OSがSECURITY認可を代替 | start/continueを停止し、停止理由・partial output・未完義務を隔離記録してOS管理/推進へ返す。記録から既存SECURITY ownerへの確認を依頼する |
| `CASE-OS-018-02n` | OSがINFRA実環境stateを代替 | start/continueを停止し、停止理由・partial output・未完義務を隔離記録してOS管理/推進へ返す。記録から既存INFRASTRUCTURE ownerへの確認を依頼する |
| `CASE-OS-018-02o` | 実行中に累積budgetを超過 | attemptを停止し消費/許可budgetと理由・未完義務をOS管理/推進へ戻す |
| `CASE-OS-018-02p` | 実行中に期限を超過 | attemptを停止しdeadline・停止時点・理由・未完義務をOS管理/推進へ戻す |

### CASE-OS-018-03 — unseen replacement/resume（AC-OS-018-03）

期限またはlease expiryの後、Worker交代/再開を行う。Oracleはunfinished dutiesとbudget/deadline/failure count/scopeを維持し、期限後の旧assignmentを流用しない。

### CASE-OS-018-04a〜04l — conditional HIL-NFR-36 evidence（AC-OS-018-04）

L2-018-002の選択分岐を分ける。`CASE-OS-018-04a`は適用default/order sourceが選択され有効なときのnormalで、対象revisionと根拠receipt、予定step、実際に通ったstepと順序、結果、逸脱理由を別々に記録する。`04b`は逸脱根拠receipt欠落、`04c`は逸脱根拠receiptの別revision、`04d`は実際に通ったstep receipt欠落、`04e`はstep順序不整合、`04f`は既存sourceから適用対象と確認できる選択default/order source referenceの欠落、`04g`は選択source stale、`04h`はsource owner unknown、`04j`はsource scope unknown、`04k`はsource間conflictをそれぞれ独立variantとする。これらでは該当するreceipt facetだけをunknown/未完にし、assignmentの可否・継続は既存authority/制約で別判定する。receipt欠落だけで事前gateまたは全assignment停止を加えない。sourceが適用可能で選択対象だがその参照が欠落した場合（04f）と、quality eventなし・consult/support未選択の正常境界（04i）を区別する。`04i`はquality eventなし、かつconsult/supportが未選択のnormalに限り、未選択receiptを作らない。適用sourceのunknown/欠落は04lで別に検査する。provider名だけで独立性を判定せず、FR-63・別scope・INT案からdefault/orderを補わない。追加default、retry上限、全件共通対応順は作らない。

| CASE | fixture | expected / owner |
|---|---|---|
| `CASE-OS-018-04a` | 適用可能なdefault/order sourceと根拠receiptを選択 | 対象revision、予定/実施stepと順序、結果、逸脱理由を記録し、実績と予定を分ける |
| `CASE-OS-018-04b` | 適用sourceが選択され逸脱reason receiptだけを欠落 | 該当receipt facetをunknown/未完として元のdecision/policy meaning ownerへ返す。assignment可否・継続は既存authority/制約で別判定し、追加gateを作らない |
| `CASE-OS-018-04c` | deviation reason receiptのrevisionを不一致にする | 当該receipt facetをstale/unknownとして未完保持し、assignment可否・継続は既存authority/制約で別判定し、該当facetを元のdecision/policy meaning ownerへ返す |
| `CASE-OS-018-04d` | 実際に通ったstepのreceiptだけを欠落 | 該当stepの実績receipt facetを未完とし、assignment可否・継続は既存authority/制約で別判定し、該当facetを元のdecision/policy meaning ownerへ返す |
| `CASE-OS-018-04e` | step receipt順序を不一致にする | 順序receipt facetだけunknown/未完とし、実績順序を推測しない。assignment可否・継続は既存authority/制約で別判定し、該当facetを元のdecision/policy meaning ownerへ返す |
| `CASE-OS-018-04f` | 既存の適用根拠はdefault/order sourceを選択しているが、その参照が欠落 | 当該receipt facetをunknown/未完とし、FR-63等から補完しない。assignment可否・継続は既存authority/制約で別判定し、該当facetを元のdecision/policy meaning ownerへ返す |
| `CASE-OS-018-04g` | default/order sourceをstaleにする | 当該receipt facetをstale/unknownで保持し、古いsourceで採択しない。assignment可否・継続は既存authority/制約で別判定し、該当facetを元のdecision/policy meaning ownerへ返す |
| `CASE-OS-018-04h` | default/order source ownerをunknownにする | 当該receipt facetのownerをunknownで保持し、新ownerを作らない。assignment可否・継続は既存authority/制約で別判定し、該当facetを元のdecision/policy meaning ownerへ返す |
| `CASE-OS-018-04i` | quality eventがなくconsult/supportも未選択 | 未選択consult/support receiptを生成しない正常境界。適用sourceの有無や欠落はこのfixtureで判定しない |
| `CASE-OS-018-04j` | 適用sourceのscopeを特定できない | 当該receipt facetだけscope unknown/未完とし、別scopeから補完しない。assignment可否・継続は既存authority/制約で別判定し、該当facetを元のdecision/policy meaning ownerへ返す |
| `CASE-OS-018-04k` | 適用source間のconflict | 当該receipt facetだけconflict/未完とし、優先sourceを推測しない。assignment可否・継続は既存authority/制約で別判定し、該当facetを元のdecision/policy meaning ownerへ返す |
| `CASE-OS-018-04l` | 選択されたtask/scopeに適用するdefault/order sourceが存在しない | 当該facetをunknown/未完として保持し、適用外・逸脱なしと分類せず、元のdecision/policy meaning ownerへ返す。assignment可否・継続は既存authority/制約で別判断する |

### CASE-OS-018-05a/05b — provider identity/context boundary（AC-OS-018-01/04）

正常例では同一provider内の別identityを分け、別provider名でも同じidentity/contextなら名称だけで独立としない。各negativeは対象以外の条件を正常に保つ。

| CASE | 独立variant | expected / owner |
|---|---|---|
| `CASE-OS-018-05a` | 同一provider内の別identityを統合する | 独立review完了扱いを止め、停止理由と未完のreview dutyを記録してOS管理/推進へ返す。 |
| `CASE-OS-018-05b` | 別provider名・同一identity/contextを独立扱いする | 独立review完了扱いを止め、停止理由と未完のreview dutyを記録してOS管理/推進へ返す。 |

identity/context/authority evidenceの不足も既存ownerへ戻し、CASE-OS-018-02gと同じ停止・未完記録のoracleを適用する。

### CASE-OS-019-01 — episode reconstruction normal（AC-OS-019-01）

source/revision/correlation ID/actor/data-use class付きの要求・判断・作業・検証・backflow/checkpoint eventからepisodeを再構成。Oracleはmissing/duplicate/stale/denied/not-runとsuccessを区別し、restart後もscope/deadline/budget/failure count/unfinished dutiesを保持する。

### AC-OS-019-02 — continuity negatives（AC-OS-019-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-019-02a` | 同eventを再配送 | 記録duplicateを分類し同じside effectを二重実行しない |
| `CASE-OS-019-02b` | raw eventsを欠きprovider memory/summaryだけ渡す | authority recoveryを拒否しoriginへevidence欠落を戻す |
| `CASE-OS-019-02c` | 保存またはprojection失敗後もsuccess checkpointを公開 | 不合格、raw eventから再構築 |
| `CASE-OS-019-02d` | unauthorized data-use classを他project/learning用途へ送る | 送信を拒否しSECURITY/origin ownerへ返す |
| `CASE-OS-019-02e` | event/record countだけをepisode completionとする | completionを拒否しrequired state/evidenceへ戻す |
| `CASE-OS-019-02f` | replay時に失敗位置の証拠を欠落させraw-event全件再読込で成功扱い | checkpointを確定せず失敗位置・未完義務を保持してorigin ownerへ返す |

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
| `CASE-OS-020-02g` | oracle入力を欠落 | unfinishedとしてHARNESS/ticket ownerへ返しgreenにしない |
| `CASE-OS-020-02h` | declared environment identityを別環境へ変更 | resultを対象runへ流用せずunfinishedとし、HARNESS契約またはticketへ戻す（固定L2:699、L11:364） |
| `CASE-OS-020-02i` | interruption後にHEAD/義務/許可bindingを差替え | resumeを止め元bindingとunfinished dutyを維持する |
| `CASE-OS-020-02j` | failure後に検査を弱めgreenを作る | 不合格を保持し変更された義務をHARNESS ownerへ戻す |
| `CASE-OS-020-02k` | required isolation boundaryなしでrunする | 実行を拒否しpartial resultがあれば隔離する |
| `CASE-OS-020-02l` | 監視境界なしでrunする | 実行を拒否しpartial resultがあれば隔離、監視不足をHARNESS/OS既存ownerへ戻す |

### CASE-OS-020-03 — unseen mixed obligations（AC-OS-020-03）

複数義務を持つ未見diffについて、固定HARNESS contractに照らしたselection rationaleを記録し、義務を追加/省略しない。plan stateとrun stateは別にする。

### CASE-OS-023-01 — sender/receiver handoff normal（AC-OS-023-01）

OS-016から対象要求revision、unit/connection/composite relationとsource-bound stateを含むportfolio traceを入力し、015/017/018/019/020からauthority、ticket、assignment/attempt、evidence、検証義務/結果の該当sourceを接続する。exact revision/digest/causal ID/scope/duty/stop reason/evidenceを送る。unit outcome、connection acceptance、composite acceptanceを別oracleで照合し、receiverがunfinished dutiesを受理した記録を確認する。

### AC-OS-023-02 — handoff negatives（AC-OS-023-02）

| CASE | mutation（他条件は正常） | expected / owner |
|---|---|---|
| `CASE-OS-023-02a` | revision mismatch | connection unresolved、origin source/managementへ返す |
| `CASE-OS-023-02b` | digest mismatch | connection unresolved、origin source/managementへ返す |
| `CASE-OS-023-02c` | authority mismatch | acceptanceを拒否しorigin ownerを保持 |
| `CASE-OS-023-02d` | evidence mismatch | acceptanceを拒否しorigin ownerを保持 |
| `CASE-OS-023-02e` | receiver未受領なのにticket complete | 不合格、unfinished dutiesとticketを保留 |
| `CASE-OS-023-02f` | creatorが同じ成果の独立reviewerを兼ねる | 独立review成立扱いせず既存独立review dutyを保持 |
| `CASE-OS-023-02g` | 推進役が検収義務/acceptance dutyを変更 | 変更を拒否し固定HARNESS/要求sourceへ戻す |
| `CASE-OS-023-02h` | 検収役が要求またはticketを発行 | 発行を拒否しOS推進/既存要求ownerへ返す |
| `CASE-OS-023-02i` | versioned interface identity/versionを欠落 | connectionをunresolvedに保ちinterface ownerへ戻す |
| `CASE-OS-023-02j` | SECURITY/INFRA境界を別ownerに置換 | source authorityを生成せず該当既存ownerへ戻す |
| `CASE-OS-023-02k` | unit successからticket completionを生成 | completionを拒否しticketと別判定を保つ |
| `CASE-OS-023-02l` | 他のhandoff bindingを正常に保ち、unit successだけからconnection acceptedを生成 | connection acceptanceを拒否しunit outcomeを保つ |
| `CASE-OS-023-02m` | 他のhandoff bindingを正常に保ち、unit successだけからcomposite acceptedを生成 | composite acceptanceを拒否しunit/connection stateを保つ |
| `CASE-OS-023-02n` | 他のhandoff bindingを正常に保ち、unit successだけからnext-stage acceptedを生成 | 次段acceptanceを拒否しunit/connection/composite判定を別に保つ |

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
| `CASE-OS-027-02f` | 取り消せる成果物を不可逆変更/release/tag/distribution/rollback不能へ変更 | start拒否、OS/authority ownerへ戻す。人確認で免除しない |

### CASE-OS-027-03a〜03ax — 独立した開始/適用scope negative（AC-OS-027-03）

共通normal baselineでは六条件とoperation authorityを確認済みにする。各fixtureは一つの追加required input/bindingだけを変える。03aはauthority欠落であり、六条件のうち条件5と重複する。欠番03ab/03ae/03aqは予約・未使用として記録し、03vは03ajと同じauthority-missing変異のため03ajへ統合した。03wはconflict状態を保持する。

| CASE | single mutation | expected / owner |
|---|---|---|
| `CASE-OS-027-03a` | operation authority missing | start拒否、SECURITY authority sourceへ戻す |
| `CASE-OS-027-03b` | HARNESS oracle missing | start拒否、HARNESS ownerへ戻す |
| `CASE-OS-027-03c` | authorized budget missing | start拒否、OS/ticket ownerへ戻す |
| `CASE-OS-027-03d` | deadline missing | start拒否、OS/ticket ownerへ戻す |
| `CASE-OS-027-03e` | stop condition missing | start拒否、OS/ticket ownerへ戻す |
| `CASE-OS-027-03f` | task scope outside accepted bound | start拒否、OS/source ownerへ戻す |
| `CASE-OS-027-03g` | verification scope outside accepted bound | start拒否、HARNESS/OS ownerへ戻す |
| `CASE-OS-027-03h` | exact HEAD mismatch | 現対象として実行/検証せず、expected/observed revisionを保持しticket/要求source ownerへ返す |
| `CASE-OS-027-03i` | partial successを完了扱い | 不合格、unfinished dutyを保持 |
| `CASE-OS-027-03j` | LABOがOS assignment/Workerを指定 | 不合格、OS ownerへ戻す |
| `CASE-OS-027-03k` | scoreのみでscope/branch/authority変更 | 不合格、permissionと評価を分離 |
| `CASE-OS-027-03l` | unassessedをqualifiedへ書き換え | unassessedを維持しLABO assessment ownerへ返す |
| `CASE-OS-027-03m` | oracleを実際に適用せずassessedと表示 | assessedを拒否しunknown/unassessedを維持 |
| `CASE-OS-027-03n` | 初回成功を別task/model class/scopeへ外挿 | scope外へ流用せずunassessedとする |
| `CASE-OS-027-03o` | human substituteのversion/scope/actor/receiptを欠落 | substitute evidenceを未完にして既存OS/source ownerへ返す |
| `CASE-OS-027-03p` | 実行中に予算超過 | attemptを停止しOS/ticket ownerへ許可/消費値・理由・未完義務を戻す |
| `CASE-OS-027-03q` | 実行開始後にaccepted scopeを変更 | attemptを停止しscope/source ownerへ返す |
| `CASE-OS-027-03r` | HARNESS validationを省略 | pass扱いせずHARNESS/OS ownerへ戻す |
| `CASE-OS-027-03s` | evidenceを別sourceへ差替え | resultを拒否しorigin/contract ownerへ返す |
| `CASE-OS-027-03t` | CI未構築をpass扱い | 未実行/unknownを保持し、成功を生成しない |
| `CASE-OS-027-03u` | classification evidenceをunknownにする | unknownとして停止しSECURITY ownerへ戻す |
| `CASE-OS-027-03w` | applicability evidenceをconflictにする | conflictを保持し既存source ownerへ戻す |
| `CASE-OS-027-03x` | generated artifactをaccepted output scope外へ出す | handoffを止めartifactを隔離しOS/SECURITY ownerへ戻す |
| `CASE-OS-027-03y` | performance historyでfailure/eligibility不成立を相殺 | 不合格条件を維持しscoreで上書きしない |
| `CASE-OS-027-03z` | Worker結果statusを欠落させる | 元statusとreasonを保持しOS record ownerへ返す |
| `CASE-OS-027-03aa` | requested oracleだけを人が変更 | 変更を拒否し既存要求/HARNESS ownerへ返す |
| `CASE-OS-027-03ac` | 実行中に期限超過 | attemptを停止しOS/ticket ownerへdeadline・理由・未完義務を戻す |
| `CASE-OS-027-03ad` | requested dutyだけを人が変更 | 変更を拒否し既存HARNESS/要求ownerへ戻す |
| `CASE-OS-027-03af` | classification evidence missing | unknownを保持しSECURITY/source ownerへ戻す |
| `CASE-OS-027-03ag` | classification evidence stale | staleを保持しSECURITY/source ownerへ戻す |
| `CASE-OS-027-03ah` | classification evidence conflict | conflictを保持しSECURITY/source ownerへ戻す |
| `CASE-OS-027-03ai` | authority evidence unknown | unknownを保持しSECURITY authority ownerへ戻す |
| `CASE-OS-027-03aj` | authority evidence missing | missingを保持しSECURITY authority ownerへ戻す |
| `CASE-OS-027-03ak` | authority evidence stale | staleを保持しSECURITY authority ownerへ戻す |
| `CASE-OS-027-03al` | authority evidence conflict | conflictを保持しSECURITY authority ownerへ戻す |
| `CASE-OS-027-03am` | applicability evidence unknown | unknownを保持し既存source ownerへ戻す |
| `CASE-OS-027-03an` | applicability evidence missing | missingを保持し既存source ownerへ戻す |
| `CASE-OS-027-03ao` | applicability evidence stale | staleを保持し既存source ownerへ戻す |
| `CASE-OS-027-03ap` | generated artifact classification/scope outside planned bound | handoffを止めartifactを隔離しOS/SECURITY ownerへ戻す |
| `CASE-OS-027-03ar` | unknown resultをsuccessへcoerce | unknownとreasonを保持しOS record ownerへ返す |
| `CASE-OS-027-03as` | Bench source/evidence不足をLABOでなく別ownerへ返す | L2:835どおりLABOへ戻し、OSで代替しない |
| `CASE-OS-027-03at` | task attribute/receipt不足をOSまたはINTでなくLABOへ返す | L2:835どおりOSまたはINTへ戻し、LABOで代替しない |
| `CASE-OS-027-03au` | evidenceのrevisionだけを差替え | resultを拒否しorigin/contract ownerへ返す |
| `CASE-OS-027-03av` | operationにassignment recordがない | success表示を拒否し既存OS assignment ownerへ戻す |
| `CASE-OS-027-03aw` | 作成Worker本人の記録だけで別actorによるhuman confirmation recordを欠落 | success表示を拒否し未完確認義務を保持して既存OS管理/推進へ戻す |
| `CASE-OS-027-03ax` | LABO受領recordを欠落 | success表示を拒否し未完受領義務を保持して既存LABO ownerへ戻す |

### CASE-OS-027-04 — unseen conforming task（AC-OS-027-04）

未公開task fixtureが同じ6条件・authority・scope・oracleを満たすとき、その限定入力の範囲でのみ扱い、unknownを推測で埋めない。成功後も適用scope付きLABO評価が未完ならunassessedを保つ。

### CASE-OS-027-05 — human substitute trace（AC-OS-027-05）

INT/LABO runtimeを前提にしないhuman proposal/evidence fixtureにtask identity、source/contract revision、scope、unassessed、actor/time、basis/reason、受領側revisionを束縛する。OS receiptとassignmentは別状態。human inputをINT-generated/LABO-assessed/permissionとして表示したら不合格。実行結果を人が確認した場合は、作成Workerと異なる確認者actor、対象revision、受領側revision、scope、確認時点、根拠、結果、未完義務を同じ確認recordへ束縛し、proposal/evidence代行とは別に追跡する。

### CASE-OS-027-06 — evidence-scoped LABO assessment（AC-OS-027-06）

適用可能なoracle revision/criterion/comparison conditionを特定し、成功・失敗・拒否・中断・unknownの別状態と実結果/failure/counterexampleを含め実際に適用した状態をLABO ownerが確認する。対象task/model class/scopeだけassessedとし、別scopeには流用しない。oracle不在・scope mismatch・実適用なし・一回成功のみならunassessed/evaluation-unknown。

正常CASE-OS-027-05/06のresult envelopeは固定L2:832に従い成功・失敗・拒否・中断・unknownを区別し、根拠、受領側revision、scope、確認者actor/timeとunfinished dutiesを含める。固定L2:835の戻し先は、Bench source/evidence不足ならLABO、task属性またはINT receipt不足ならOSまたはINTELLIGENCEとし、OSがLABO判断・assignmentを代行しない。CASE-OS-027-03as/03atはこの2経路を別々に検査する。

### C13 carry-forward

C13-M findings、minor findings、unreviewed legacy crosswalkは従前のaudit scopeどおりcarryする。本文を作成したこと、source SHA一致、静的参照検査は独立reviewやfinding closureではない。

## Stage 3：HELIX-OS 15項目のL10総合検証案

各CASE IDの番号は親L2を示し、個々のCASEの照合先は表の「L3 AC」列に明記する。番号一致をAC対応の推定に使わない。文書上のfixture設計であり、旧test/runtimeを実行した結果や現行実装受入を主張しない。原因・scope・owner・revisionがunknownなら成功へ丸めず、該当scopeを未完として戻す。

| CASE ID | L3 AC | 入力・操作 | 期待oracle／negative・unknown |
|---|---|---|---|
| CASE-OS-L10-032-01 | AC-OS-L3-032-01 | policy選択runでexact check versionのnormal fixtureと、policyに明示登録された別version compatibility fixtureを別々に入力。baseline/current run/scope/expiry/remediation/oracleを束縛する。 | exact versionと明示compatibilityの双方で、他条件が一致する限定receiptのみeligible。baselineとcurrent runは別field、failureはfailのまま。非選択profileは通常条件を保つ。 |
| CASE-OS-L10-032-02 | AC-OS-L3-032-02 | 共通eligible baselineからfingerprint、version compatibility宣言、baseline、scope、期限、owner/ticket、gateを一つずつ変異した独立fixture。追加で期限と上限が同時に欠落するfixtureも別に置く。 | 明示compatibilityがない別versionを含み、各不一致だけでeligibleにならない。missing fieldを他sourceから補完しない。 |
| CASE-OS-L10-032-03 | AC-OS-L3-032-03 | 未fixture fingerprint/versionとpolicy非選択run。 | 未知checkは当該failureだけ保留、policy非選択runはpolicy欠落を理由に拒否しない。 |
| CASE-OS-L10-033-01 | AC-OS-L3-033-01 | 選択された全engine/detectorを同一snapshot/target/revision/configでrun→rerun。 | 全選択集合のartifact digest/finding fingerprint一致、owner別receipt完備時だけ限定scope再現成立。 |
| CASE-OS-L10-033-02 | AC-OS-L3-033-02 | 各capability欠落、版/config/snapshot drift、artifact/finding混同、digest差異に加え、detector identity/version、finding code/severity/location/subject/evidence、dedupe identity、原provenanceを一fieldずつ欠落させる。 | 各変異で全scope再現claim 0。artifact digest/fingerprintが一致してもfinding必要field欠落を見逃さずpartialを明示。 |
| CASE-OS-L10-033-03 | AC-OS-L3-033-03 | 未選択能力を省いた正常fixtureと選択済みunknown version fixture。 | 未選択runは不要。選択unknownだけ未評価で残し既存分のprovenanceを保持。 |
| CASE-OS-L10-034-01 | AC-OS-L3-034-01 | 合成directive duplicateに生存target/oracle包含、finding false-positiveに独立反証、accepted-riskに適切なexisting receipt。 | dispositionごとの必要根拠と原event/履歴を相互trace。各種authorityを相互流用しない。 |
| CASE-OS-L10-034-02 | AC-OS-L3-034-02 | target消失、oracle非包含、same-author false-positive、accepted-risk receipt欠落、Issue projection closeを個別変異。 | 対象eventのみ非終端、削除/terminalize 0。ownerと欠落証拠を返す。 |
| CASE-OS-L10-034-03 | AC-OS-L3-034-03 | 未知disposition後にchallenge/reopenを入力。 | unknown保持、先行event不変、新根拠がappend。別dispositionへ自動分類しない。 |
| CASE-OS-L10-035-01 | AC-OS-L3-035-01 | 選択repoの複数base branch・stacked PRのcreate/update/complete eventを投入しL2-010 registration responseを読む。 | 全選択eventはhead/sourceに結ばれ、論理jobとwork-item registration receiptが一つずつ。監査実行/レビュー完了は要求しない。 |
| CASE-OS-L10-035-02 | AC-OS-L3-035-02 | 同一event再送、新head、旧receipt、base/stacked PRの除外、scope外repo、author/providerを理由とする対象event除外を個別変異。 | 同eventの二重job 0、旧head結果の現行転用0、scope外追加0、既存scope eventの根拠なし除外0。 |
| CASE-OS-L10-035-03 | AC-OS-L3-035-03 | action/source versionがunknownのeventと固定契約が支持する未fixture event。 | unknownは未観測として残す。明示対応済みeventは処理し、未知ラベルのみでdropしない。 |
| CASE-OS-L10-035-05a | AC-OS-L3-035-05 | event intakeのdurable記録後、L2-010 job登録前に中断し、既存event/checkpointからresume。 | partial eventは保持され、同じlogical jobが一つだけ登録される。処理済み表示・registration receiptはjob登録後にのみ成立する。 |
| CASE-OS-L10-036-01 | AC-OS-L3-036-01 | 複数のRetrofit upgradeを含むticketでpreflight前の影響調査/未確定plan draft、各upgradeのpreflight成功、plan確定、各apply直前に最新source/authorityを再照合する。別fixtureでは未見のpackage manager/dependency/config形式でも選択oracleが明示対応する正常upgradeを入力する。 | 未確定draftはpreflight成功前から可能。全upgradeに両境界の同ticket/revision記録があり一致するものだけapply可能。未見形式も既存oracleが対応する範囲では同条件で扱う。非upgrade Retrofitはこのupgrade順序条件の対象外。 |
| CASE-OS-L10-036-02 | AC-OS-L3-036-02 | 各upgradeのpreflight未実施/failed/stale、wrong ticket・revision、apply直前drift/authority失効を一件ずつ変異。 | 影響upgradeのplan確定/apply 0。影響調査/未確定draftは継続可能で、未完理由とownerが維持される。 |
| CASE-OS-L10-036-03 | AC-OS-L3-036-03 | 適用可能contract/result ownerをunknownにする。 | unknownのままplanを保留。技術compatibilityをOSが補完しない。 |
| CASE-OS-L10-037-01 | AC-OS-L3-037-01 | 旧BR §3.3/FR-L1-11の週次観測で、同一scope/source revisionにHARNESS drift差分ありの週と差分なしの週を別fixtureにする。 | 差分ありは既存Reverse/Backflowへ送る。差分なしは報告のみ。負債経路はsource owner分類後の別traceに限る。 |
| CASE-OS-L10-037-02 | AC-OS-L3-037-02 | 共通正常入力から週次観測欠落、stale source、scope外/別revision oracle、差分なしでReverse ticket発行、未分類sourceを負債candidate化、OSによる閾値補作、readiness gate bypassを各々一変数で変える。 | 各該当caseだけ未観測/stale/unknown/拒否し元sourceまたは既存ownerへ返す。差分なしではticketを出さない。 |
| CASE-OS-L10-037-03 | AC-OS-L3-037-03 | detector/applicability unknownに加え、無関係ticketの許可済み処理をfixtureに置く。 | 対象scopeのみ未評価、無関係ticketは同期停止されない。 |
| CASE-OS-L10-038-01 | AC-OS-L3-038-01 | 有効HARNESS contract/templateと041-003の対応済み抽出結果、選択layer、L0別anchor、source atom proposalを入力。 | 一度だけappend、snapshotとreceiptのbase/template/contract/scope/source digestが往復追跡可能。approval stateは不変。 |
| CASE-OS-L10-038-02 | AC-OS-L3-038-02 | stale base/template、authority/scope欠落、L0 row化、同一proposal再送、各保存境界失敗、および041-003の複数obligationを単一atomにまとめたfindingを個別投入。 | stale/unauthorized拒否、duplicate append 0、L0 layer row 0、部分成功claim 0。非原子的findingではcandidate row増分0、rejected outcome findingを追記し、snapshot bytes不変。 |
| CASE-OS-L10-038-03 | AC-OS-L3-038-03 | 対象input/template/extractor versionに束縛済みのHARNESS-L2-041-003 nondeterminism findingを入力し、別fixtureで未対応atom/contractと独立した適格layerを入力。 | OSは抽出を再比較・再判定しない。findingに従うwriter outcomeを記録しquarantine/current update 0/snapshot不変を保つ。未知atomはgapのまま、独立適格layerだけ継続可能。 |
| CASE-OS-L10-040-01 | AC-OS-L3-040-01 | 入力済retry上限へ到達したattemptと現行ticket routeを投入。 | retryを止め、既存typed route candidate、cause、lineage/open dutyを保持。 |
| CASE-OS-L10-040-02 | AC-OS-L3-040-02 | 上限未到達、別scope、値欠落/改変、再送を各々試す。 | premature route、counter reset、二重Recoveryは0。 |
| CASE-OS-L10-040-03 | AC-OS-L3-040-03 | policy/route不明、旧route名だけ存在するfixture。 | 継続せずunknown owner return。旧名だけで型を作らない。 |
| CASE-OS-L10-041-01 | AC-OS-L3-041-01 | sourceを読めないsession後、現行canonical sourceと既存coordination-only stateから再開。 | current source revisionでだけ再結合。未完義務/停止理由維持。 |
| CASE-OS-L10-041-02 | AC-OS-L3-041-02 | source drift/取得失敗/authority revoke/禁止情報持越しを個別変異。 | 継続は保留されtyped return。receipt/fixtureにsecret/private reasoningがない。 |
| CASE-OS-L10-041-03 | AC-OS-L3-041-03 | 許容state範囲をunknownにする。 | coordination-only未完を返し、作業内容を推定しない。 |
| CASE-OS-L10-042-01 | AC-OS-L3-042-01 | 正schema/version/digestとsource/attemptを持つWorker出力。 | 成果とprovenanceが一致し、検証済候補だけ返す。 |
| CASE-OS-L10-042-02 | AC-OS-L3-042-02 | schema/digest違反、選択済み既存契約に明示された適用条件違反、緩和条件各欠落、再検証receipt欠落を個別投入。 | 各不適格出力の昇格0。別scope緩和の流用0。 |
| CASE-OS-L10-042-03 | AC-OS-L3-042-03 | 新schema versionをunknownにし、独立assignmentに有効outputを置く。 | 対象成果のみ保留、独立有効成果の状態を変えない。 |
| CASE-OS-L10-043-01 | AC-OS-L3-043-01 | requestを要求するoperationでは有効なrequest→call→result連鎖、request不要の許可済みoperationではrequestなしのcall→resultを入力。 | 前者は各eventがtarget/revision/correlationで追跡可能。後者に追加request/approvalを課さない。 |
| CASE-OS-L10-043-02 | AC-OS-L3-043-02 | request必須operationだけでrequest欠落、scope違い、duplicate、failed callからsuccess resultへの変異。別のrequest不要operationに不要requestを差し込む対照も入力。 | 前者はchainを保留しauthority ownerへ返す。request不要の対照を新しいapproval要件にしない。 |
| CASE-OS-L10-043-03 | AC-OS-L3-043-03 | unknown event/authorityと通知ACKのみを入力。 | 保留・owner返却。approval/完了 receiptを生成しない。 |
| CASE-OS-L10-044-01 | AC-OS-L3-044-01 | findingにprose-only handoverだけを与える。 | resolutionにせずopenのまま保持。 |
| CASE-OS-L10-044-02 | AC-OS-L3-044-02 | 固定された既存source lifecycle/evidence contractをunknown、stale、conflictの各状態にする。 | 該当findingだけ保留し理由・未完を既存OS evidenceへ残す。未選択source不在は条件に加えない。 |
| CASE-OS-L10-044-03 | AC-OS-L3-044-03 | source HEAD mismatchまたは未定義typed receiptが提示される。 | 本候補で適合/不適合や戻し先を推定せず、該当findingだけ保留し理由・未完状態を既存OS evidenceへ残す。 |
| CASE-OS-L10-049-01 | AC-OS-L3-049-01 | 有限task状態表とconfigured limit、READY/依存/優先順/authority/scope/競合を満たし、適用可能なINTELLIGENCE low-impact evidenceと後段検証担当/capacity確保済みの適格idle task。 | 各状態別集計、適格taskだけ別assignment。上限とrun countを別値として返す。 |
| CASE-OS-L10-049-02 | AC-OS-L3-049-02 | dependency/authority/scope/path/deadline/downstream owner/capacity/limitを各々欠落・不適合化。 | 不適格dispatch 0、idleはidle、理由を残す。 |
| CASE-OS-L10-049-03 | AC-OS-L3-049-03 | resource/proposal/observation時点をunknownにする。 | 割当可能・実行中へ推定せず、source ownerへ返す。 |
| CASE-OS-L10-050-01 | AC-OS-L3-050-01 | 同一期間のtyped backlog/wait/rework/reviewer capacityと独立reviewer候補。 | review capacity不足が主因の範囲だけHEAD/generation boundの一意assignment。 |
| CASE-OS-L10-050-02 | AC-OS-L3-050-02 | downstream bottleneck、limit、reviewerなし、重複generation、active lease、threshold欠落を個別変異し、別fixtureで原因・観測値・待ち義務を省く。 | 不当増枠0、active lease不変、merge/Ready権限の追加0。backpressure時に原因・観測値・待ち義務を保持する。 |
| CASE-OS-L10-050-03 | AC-OS-L3-050-03 | 原因/threshold/authority/適性unknownと、別対象の許可済みreviewを入力。 | 対象scopeだけbackpressure、無関係な許可済みreviewは継続可。 |
| CASE-OS-L10-050-04 | AC-OS-L3-050-04 | 既存設定の縮退条件を満たす通常fixtureと、active leaseが残る対照fixtureを入力する。 | 新規review assignment増加を止める。縮退は選択可能な対応であり、active leaseを中断しない。merge前base/HEAD/scope/admission照合は既存規則。 |
| CASE-OS-L10-051-01 | AC-OS-L3-051-01 | task class別evidence、INTELLIGENCE案、authority/capability、作成/review候補を入力。 | 条件適用内の役割別配置を対象revisionへ記録。異方向の適格配置も正常。 |
| CASE-OS-L10-051-02 | AC-OS-L3-051-02 | 同一context両役割、Cursor reviewer、stale evidence、wrong scope/authority/headを個別変異。 | 不適切配置0。provider名差のみの独立性claim 0。 |
| CASE-OS-L10-051-03 | AC-OS-L3-051-03 | evidence/availability/scopeをunknownにする。 | 未割当・戻し先記録。Claude優先/Cursor条件でunknownを迂回しない。 |
| CASE-OS-L10-032-04 | AC-OS-L3-032-04 | common eligible baselineからreason、remediation ticket、current HEAD/tree、scope、iteration ceiling、wildcard rule、provenance、required HARNESS oracleを一つずつ欠落/変更する。別fixtureではexpiryとiteration ceilingを同時に欠落させる。 | 変異ごとeligible=0。候補外sourceで不足を埋めず、元failureとownerを保持する。 |
| CASE-OS-L10-032-05 | AC-OS-L3-032-05 | policy選択の条件unknownとpolicy非選択/未登録checkを別fixtureにし、既存HARNESS義務を入力する。 | unknownはquarantine対象だけ保留してHARNESS/OS/SECURITY/INFRASTRUCTUREの該当ownerへ戻す。非選択profileは通常扱いを保つ。 |
| CASE-OS-L10-033-04 | AC-OS-L3-033-04 | engineのrun/artifact/digest/exit status、detectorのrun/finding fields/dedupe/provenanceを各々一つ欠落。partial/failed executionも別caseにする。 | 一つの欠落も全体再現を許可せず、partial/failedを成功にしない。engine/detector owner・HARNESS oracle・OS run・SECURITY/INFRASTRUCTUREを分けて戻す。 |
| CASE-OS-L10-033-05 | AC-OS-L3-033-05 | 未見正常のselected capability集合を同じsnapshotで2回処理し、別scopeでrequired field/source/compatibility unknownを与える。 | 成立するscopeだけ再現を記録する。unknownのscopeは未評価のまま各入力ownerへ戻す。 |
| CASE-OS-L10-034-04 | AC-OS-L3-034-04 | directive cancel/supersede、finding accepted-risk、non-actionable findingを独立fixture化し、accepted-riskではL5 action-binding PO receiptまたは独立reviewを一方ずつ外す。 | accepted-riskは両方揃う時のみ既存receiptを関連付ける。directive receiptをfindingへ流用せず、原eventを非終端で保つ。 |
| CASE-OS-L10-034-05 | AC-OS-L3-034-05 | 分類前durable intake保存失敗、projection closeとlocal closure receipt不一致、appeal/reopen receipt欠落を個別投入する。 | 原eventを欠落/終端化せず未完として保持。既存source/authority ownerへ戻す。 |
| CASE-OS-L10-035-04 | AC-OS-L3-035-04 | 新HEAD登録後に旧HEADのeventを遅着させる。 | 現行revisionは巻き戻らず、旧eventはそのsource/headの履歴へ結ばれる。 |
| CASE-OS-L10-035-05b | AC-OS-L3-035-05 | eventをdurable intake後、OS-L2-010登録receipt前に中断し、同じevent再送とbase ref/event identity/authority applicability欠落の各fixtureを使う。 | resumeは同じjob identityを一つだけ登録。receipt前は完了表示しない。欠落は該当source owner、OS-L2-010、または既存authority ownerへ戻す。 |
| CASE-OS-L10-036-04 | AC-OS-L3-036-04 | 選択upgradeのunknown oracle、別dependency/config scope、一般CI greenのみ、rollback planのみを個別入力する。 | どれも選択preflightの成功にならずplan確定/applyを止める。oracle/technical owner/authority/resourceへ別々に戻す。 |
| CASE-OS-L10-037-04 | AC-OS-L3-037-04 | 正常経路A: weekly HARNESS design/implementation driftをexisting Reverse/Backflowへ渡す。正常経路B: source-classified cumulative debtをLABO評価、OS-L2-022 candidate、OS-L2-010 repayment-plan candidateへ渡す。 | 両方を別traceで観測し、責務/優先順位/gateを既存契約から維持する。2 periodsはmissingness/continuity観測であり成立閾値でない。 |
| CASE-OS-L10-037-05 | AC-OS-L3-037-05 | sourceなしcandidate、candidateからexecution/priorityへの自動昇格、LABO-063別scopeの一般化をそれぞれ入力する。 | 候補を作らず/昇格せずscopeを保つ。owner/source/priority unknownはそのownerへ戻す。no-delta、not observed、condition not metは区別する。 |
| CASE-OS-L10-038-04 | AC-OS-L3-038-04 | base L11 671–689、supplement 690–696、adopted unseen-normal 698–700、boundary/result 702–704を別spanとして照合し、PO row 35とscope 37–40、HARNESS-041-003 adoptionを関連付ける。 | supplement適用条件を確認するが抽出findingの意味は再判定しない。historical “unadopted” wordingだけから状態を作らない。 |
| CASE-OS-L10-038-05g | AC-OS-L3-038-04 | 固定L11にない組合せの新contract revisionを入力し、HARNESS契約がそのrevisionを明示的に支持し、source span・scope・atom schema・layer/baseが一致する。 | 内容をOSが補完せず、既存writer条件を満たすproposalとして通常appendする。これは未見正常例で、unknown/stale条件を省略しない。 |
| CASE-OS-L10-040-04 | AC-OS-L3-040-04 | 同じ本線attemptでWorker/sessionを交代しresume、別に実験retryを交代/resumeし本線を並行入力する。 | 各lineageのcounter/budgetを交代で初期化しない。実験budgetを本線に混ぜない。 |
| CASE-OS-L10-040-05 | AC-OS-L3-040-05 | retry ledgerをmissing/unreadableにするfixtureと、有効ledgerで入力済みcapへ到達するfixtureを別々に実施する。 | missingはHELIXOS-L2-019記録ownerへ戻し追加retryを保留。cap到達だけが既存typed routeへ戻る。 |
| CASE-OS-L10-040-06 | AC-OS-L3-040-06 | task Aのcap到達と、別task Bの許可済み継続を同時に入力する。 | task Aだけを既存routeへ戻し、Bを停止しない。 |
| CASE-OS-L10-041-04 | AC-OS-L3-041-04 | withdrawn claimと旧instructionを含むcoordination stateを別々に用い、source rereadはmissingにする。 | 両者の値をsecret/private reasoningから復元しない。coordination-only未完として固定L2が示す既存authority ownerへ戻す。 |
| CASE-OS-L10-042-04 | AC-OS-L3-042-04 | common valid outputからschema/version、digest、target revision、source policy/revisionを一つずつ欠落/改変する。digest一致だけの反例も用いる。 | 欠落/不一致は個別に保留し、digest一致だけで内容/authority適合を宣言しない。 |
| CASE-OS-L10-042-05 | AC-OS-L3-042-05 | 既存契約に定めるexpiry超過、別scopeへの緩和流用、再検証receipt欠落を別fixtureにする。 | それぞれ昇格せず、契約/authority ownerへ戻す。親にないsize/timeout/policy条件は作らない。 |
| CASE-OS-L10-042-06 | AC-OS-L3-042-06 | valid期限内・同一scope outputと、期限欠測/比較不能outputを対にする。 | 先は適用契約の範囲で検証候補、後者はunknownとして別表示し、成功にもfailureにも丸めない。 |
| CASE-OS-L10-043-04 | AC-OS-L3-043-04 | request/call/resultを共通正常event chainとして用意し、event欠落・role/scope/correlation/revision mismatchを一つずつ変異する。 | chain不成立はowner return、因果履歴を保ち誤承認/完了を作らない。 |
| CASE-OS-L10-043-05 | AC-OS-L3-043-05 | tool call単独でpermissionを発生させる変異と、result単独でverification/completion/write authorityを発生させる変異を独立実施。 | いずれも新しいauthority/stateを生成しない。通常のrequest不要operationはrequestなしで扱う。 |
| CASE-OS-L10-049-04 | AC-OS-L3-049-04 | 同一scope/time window内でconfigured capacity・経過観測秒・assignment/task counts・unused capacity・unfinished lineageを別々に固定しutilizationを算出する。 | denominatorが明示され、counts/未完系譜と別指標。dummy taskを作らない。missing time/capacityは未評価で成功分母に入れない。 |
| CASE-OS-L10-049-05 | AC-OS-L3-049-05 | downstream owner/capacity、READY、priority、deadline、lease、authority、config revisionを一項目ずつ不適合化する。 | 不適合範囲のみ保留、HARNESS義務と未完理由を保持。OSはimpactを判定しない。 |
| CASE-OS-L10-050-01b | AC-OS-L3-050-01 | review待ち件数・待ち時間・rework占有率・reviewer稼働率、scope/period、主因、eligible reviewer availability、authority/context/leaseが揃う正常fixtureを作る。 | capacity causeに対応するassignment候補だけ記録し、quality/Ready/merge stateは別に保つ。 |
| CASE-OS-L10-050-01c | AC-OS-L3-050-01 | 現行review_merge担当者が既存merge admissionを満たしたreview結果を使ってmergeを行う正常case。 | 既存admission後のmerge可能状態を保ち、本候補だけで拒否/追加許可を作らない。 |
| CASE-OS-L10-050-05 | AC-OS-L3-050-05 | reviewer capacity/lease/priority/deadline/downstream owner/capacity/authorityを個々に欠落・失効させ、別fixtureでcreator/subagent reviewer、HEAD drift、base drift、scope drift、複数PRの片方merge後に残りのbaseを再取得しない条件を与える。 | 不当増枠0。capacityからindependence、branch edit、Ready、merge authorityを生成しない。 |
| CASE-OS-L10-051-04 | AC-OS-L3-051-04 | 要求/設計taskのClaude-create/Codex-review、適格性が成立する逆配置、非要求/設計taskの適格配置を別fixtureにする。 | Claude優先は要求/設計taskに限り、各正常配置のscope/evidenceを維持。 |
| CASE-OS-L10-051-05 | AC-OS-L3-051-05 | Cursor reviewer、同一runtime/context、stale evidence、wrong scope/authority/HEAD、provider-name-only independence、通知/ACK/reviewer名だけのassignment/review receiptを各々独立に変異。 | 各誤配置/receiptを拒否し既存ownerへ戻す。 |
| CASE-OS-L10-051-06 | AC-OS-L3-051-06 | LABO evidence / INTELLIGENCE proposalまたは適格sourceの一つをunknownにし、別適格候補がある組合せとない組合せを対照にする。 | 適格根拠がある候補のみ選択。根拠なしは未割当として対応ownerへ戻す。 |
| CASE-OS-L10-051-07 | AC-OS-L3-051-07 | reviewerが対象content HEADをread-onlyで読みfindingを作成側へ返し、修正後HEADを別reviewとして読む正常循環を与える。 | 各finding/revisionが結び、前HEAD receiptを新HEADへ流用しない。 |
| CASE-OS-L10-051-08 | AC-OS-L3-051-08 | 適性計測/配置案のみでscope・branch・budget・authority・review成立を変える変異と、通知/ACK/reviewer名のみでassignment/receiptを作る変異を独立入力。 | 状態を変更せず既存authority/assignment ownerへ返す。 |
| CASE-OS-L10-032-06 | AC-OS-L3-032-06 | policy create/change/extend/stop/applyを別operationとして入力し、authority scope/actor/operation/revision/有効期間一致と欠落・失効を個別に変異。 | 有効な既決authorityだけ再利用し、不足・不一致・失効した操作のみ保留。重複承認を新設しない。 |
| CASE-OS-L10-033-06a | AC-OS-L3-033-06 | dedupe候補を適用し原run/artifact/finding evidenceを消す変異。 | dedupeを拒否し原provenanceとevidenceを保持。 |
| CASE-OS-L10-033-06b | AC-OS-L3-033-06 | 異なるrun結果をquarantineまたはunfinishedとして記録しない変異。 | 差異と未完義務を保持し再現成功にしない。 |
| CASE-OS-L10-033-06c | AC-OS-L3-033-06 | registry referenceだけでrunまたはwrite permissionを成立させる変異。 | 権限を生成せず既存authority ownerへ戻す。 |
| CASE-OS-L10-036-06a | AC-OS-L3-036-04 | OSが選択HARNESS oracleを改変する。 | oracleを変更せず、選択HARNESS ownerへ戻す。 |
| CASE-OS-L10-036-06b | AC-OS-L3-036-04 | preflight resultだけからSECURITY authorityを生成する。 | authorityを生成せず既存SECURITY ownerへ戻す。 |
| CASE-OS-L10-043-06e | AC-OS-L3-043-04 | assignment-aのevent chainだけsource revision不一致にする。別assignment-bのWorker作業は契約/authority/sourceが正常で独立している。 | assignment-aのchainだけunknown/未完としてoperation ownerへ戻し、無関係なassignment-bを同期停止しない。 |
| CASE-OS-L10-043-06f | AC-OS-L3-043-04 | 同じlogical event identityとassignment/source/revisionを持つrequest/call/resultを、既存L2-009の保存前・永続化後・再投影/再構築後の静的期待fixtureへ別に結ぶ。 | 全時点から同一logical eventへ辿り、request/call/resultの段階と因果参照を保持する。投影のidentity変更や別event生成を正常にせず既存記録ownerへ戻す。 |
| CASE-OS-L10-044-04 | AC-OS-L3-044-03 | 未見finding instanceに既存source contractが明示するstatusを入力。 | source statusを保持し、OS独自evidence sufficiencyを追加しない。 |
| CASE-OS-L10-049-07 | AC-OS-L3-049-01 | 未見task identityを有限fixtureへ加え、既存設定・READY/dependency/priority/authority/scope/後段義務・担当・capacityをすべて満たす。 | task単位の既存条件で評価し、登録数と実行/throughputは分ける。 |
| CASE-OS-L10-050-08 | AC-OS-L3-050-01 | 未見のreview backlog eventを既存typed metric contractで入力し、原因・eligible reviewer・既存設定を満たす。 | 新thresholdを作らず既存capacity候補だけ記録し、quality/Ready/mergeを生成しない。 |

#### Stage 3 review01追加fixture（個別oracle）

以下は上の固定親別CASEを補い、各行が独立fixtureとなる。CASEの追加はL2/L11意味を拡張せず、指定した既存ACを観測する。

| CASE ID | L3 AC | 入力・操作 | 期待oracle／negative・unknown |
|---|---|---|---|
| CASE-OS-L10-034-06a | AC-OS-L3-034-02 | digestが異なるduplicate候補を入力。 | digest不一致を理由に同一findingとして確定・統合せず、origin eventを保持してtarget/oracle包含の確認待ちにする。 |
| CASE-OS-L10-034-06b | AC-OS-L3-034-02 | 文面類似だけがある異なるfindingを入力。 | 同一findingへ統合しない。 |
| CASE-OS-L10-034-06c | AC-OS-L3-034-02 | Issue番号一致だけの候補を入力。 | digest/source/target根拠なしに統合しない。 |
| CASE-OS-L10-034-06d | AC-OS-L3-034-02 | 失効したtargetだけを入力。 | 生存targetを確認できないためduplicate terminalizationを成立させず、対象をownerへ返す。 |
| CASE-OS-L10-034-06e | AC-OS-L3-034-02 | 元finding/evidence欠落のfalse-positive claim。 | 元eventを消さず反証根拠不足として保留。 |
| CASE-OS-L10-034-06f1 | AC-OS-L3-034-02 | 反証source identityがunknown。 | false-positive終端を拒否し不足sourceを返す。 |
| CASE-OS-L10-034-06f2 | AC-OS-L3-034-02 | 反証source identityがstale。 | false-positive終端を拒否し現行sourceを再取得する。 |
| CASE-OS-L10-034-06g | AC-OS-L3-034-04 | CI greenだけのdirective/finding確定を入力。 | authority receiptとして流用しない。 |
| CASE-OS-L10-034-06h | AC-OS-L3-034-04 | 別scope/古いPO receiptだけを入力。 | action binding不一致として保留。 |
| CASE-OS-L10-034-06i | AC-OS-L3-034-03 | PR updateだけを与えappeal reopen済みと表示する変異。 | reopenを生成せず、既存dispositionとeventを保持。 |
| CASE-OS-L10-034-06j | AC-OS-L3-034-03 | dispositionに異議経路/receiptがない状態でterminal表示。 | terminal化せずunknown/未完。 |
| CASE-OS-L10-034-06k | AC-OS-L3-034-03 | finding source kind unknown。 | 種別を推測せずunknown保持。 |
| CASE-OS-L10-034-06l | AC-OS-L3-034-02 | 元findingを覆す独立反証の代わりに、根拠が同じ主張を言い換えただけのfalse-positive claimを与える。 | 独立反証として受け入れずfalse-positive終端を保留し、原finding/evidenceを保持して既存source/authority ownerへ照合を戻す。 |
| CASE-OS-L10-034-06d2 | AC-OS-L3-034-02 | 失効ではなく、閉じたtargetだけをduplicate候補へ与える。他の参照は正常。 | 生存targetの条件を満たさずduplicateを確定しない。元event/未完義務を保持し既存ownerへ返す。 |
| CASE-OS-L10-034-06m | AC-OS-L3-034-04 | review findingのcancel/supersedeを、既存PO権限に結ぶreceipt付きで入力する正常fixture。 | directiveの取消しと同一扱いせず、対象findingの既存PO権限receiptを追記し、原eventと先行履歴を保持する。 |
| CASE-OS-L10-035-07a | AC-OS-L3-035-02 | delivery filterが一部base/stacked scopeを除外しているのに全scope網羅表示。 | coverageをpartialとして保持し全scope claimを拒否。 |
| CASE-OS-L10-035-07b1 | AC-OS-L3-035-01 | event受領だけでjob completeと表示。 | registrationだけ記録しjob completeを生成しない。 |
| CASE-OS-L10-035-07b2 | AC-OS-L3-035-01 | event受領だけでreviewedと表示。 | registrationだけ記録しreview resultを生成しない。 |
| CASE-OS-L10-035-07b3 | AC-OS-L3-035-01 | event受領だけでCI passと表示。 | registrationだけ記録しCI resultを生成しない。 |
| CASE-OS-L10-035-07b4 | AC-OS-L3-035-01 | event受領だけでmergeableと表示。 | registrationだけ記録しmergeabilityを生成しない。 |
| CASE-OS-L10-035-07b5 | AC-OS-L3-035-01 | event受領だけでrequirement approvedと表示。 | registrationだけ記録しrequirement approvalを生成しない。 |
| CASE-OS-L10-035-07c | AC-OS-L3-035-05 | job登録後receipt受領前に停止し、再起動後既存job identityで再相関。 | receipt受領前を完了扱いせず、既存jobへ結ぶ。 |
| CASE-OS-L10-035-07d | AC-OS-L3-035-03 | 未見の新base branchでscope内PR event。 | 固定契約が支持する範囲でeventを扱い、未対応部だけunknownとして戻す。 |
| CASE-OS-L10-036-05 | AC-OS-L3-036-01 | 未見package manager/dependency種類/config形式だが選択oracleが対応する正常upgrade。 | OSは方式/schema名だけを理由に拒否せずscope/revisionを結ぶ。 |
| CASE-OS-L10-037-06a | AC-OS-L3-037-03 | 週次観測を同期gateとして全作業停止へ変える。 | gateを生成せず、既存同scope gateだけ適用し、無関係作業を一律停止しない。 |
| CASE-OS-L10-037-06b | AC-OS-L3-037-02 | 差分なしの週にReverse ticket発行。 | ticketを作らず報告のみ。 |
| CASE-OS-L10-037-06c | AC-OS-L3-037-02 | scope外oracleを同一扱いする。 | 候補を保留し元scope/sourceへ戻す。 |
| CASE-OS-L10-037-06d | AC-OS-L3-037-02 | OSが負債定義または閾値を補う。 | 追加条件を拒否しsource ownerへ戻す。 |
| CASE-OS-L10-037-06e | AC-OS-L3-037-02 | 同scope既存readiness/authority gateを迂回。 | gateを維持し当該scopeを未完にする。 |
| CASE-OS-L10-037-06f | AC-OS-L3-037-03 | 未見project/scope/revisionとLABO-063適用可能性あり/unknown。 | 適用可能なsourceだけ接続し、unknownは未評価のままownerへ戻す。 |
| CASE-OS-L10-038-05a | AC-OS-L3-038-02 | 同じproposal/correlation IDへ異なるpayloadを再送する。 | rejectや成功receiptを出さずconflictとして両payloadと対象revisionを保持し、既存snapshotを不変にする。 |
| CASE-OS-L10-038-05b | AC-OS-L3-038-02 | 同じproposal/correlation IDへ異なるbase digestを再送する。 | rejectや成功receiptを出さずconflictとして両入力と対象revisionを保持し、既存row/snapshotを不変にする。 |
| CASE-OS-L10-038-05c1 | AC-OS-L3-038-02 | HARNESS-L2-040が未採択または無効。 | commit/appendを保留しHARNESS ownerへ戻す。 |
| CASE-OS-L10-038-05c2 | AC-OS-L3-038-02 | 対象revisionへ適用するHARNESS-L2-041 revision -002の契約状態だけを無効にする。他のwriter入力は正常。 | 適用契約が無効のためwriterを保留しHARNESS契約ownerへ戻す。-002という版番号だけを無効理由とせず、採択済み-003の追加failure契約とは分離する。 |
| CASE-OS-L10-038-05c3 | AC-OS-L3-038-02 | L2-009 applicabilityがunknown。 | commit/appendを保留し既存契約ownerへ戻す。 |
| CASE-OS-L10-038-05d1 | AC-OS-L3-038-02 | OSがHARNESS proposalを補完する。 | semantic editを拒否し原proposalを保持する。 |
| CASE-OS-L10-038-05d2 | AC-OS-L3-038-02 | OSがHARNESS proposalを統合する。 | semantic editを拒否し原proposalを保持する。 |
| CASE-OS-L10-038-05d3 | AC-OS-L3-038-02 | OSがHARNESS proposalを削除する。 | semantic editを拒否し原proposalを保持する。 |
| CASE-OS-L10-038-05e1 | AC-OS-L3-038-02 | append結果を採択と表示。 | append receiptだけを記録し採択stateを生成しない。 |
| CASE-OS-L10-038-05e2 | AC-OS-L3-038-02 | append結果をL3開始許可と表示。 | append receiptだけを記録し開始許可を生成しない。 |
| CASE-OS-L10-038-05e3 | AC-OS-L3-038-02 | append結果をCI greenと表示。 | append receiptだけを記録しCI stateを生成しない。 |
| CASE-OS-L10-038-05e4 | AC-OS-L3-038-02 | append結果をmerge readinessと表示。 | append receiptだけを記録しmerge readinessを生成しない. |
| CASE-OS-L10-038-05f1 | AC-OS-L3-038-03 | HARNESS finding欠落。 | outcome unknown/staleで保留しOS側で意味を再評価しない。 |
| CASE-OS-L10-038-05f2 | AC-OS-L3-038-03 | HARNESS findingが別inputへ束縛。 | outcome unknown/staleで保留しOS側で意味を再評価しない。 |
| CASE-OS-L10-038-05f3 | AC-OS-L3-038-03 | HARNESS finding状態が不明。 | outcome unknown/staleで保留しOS側で意味を再評価しない。 |
| CASE-OS-L10-038-05h | AC-OS-L3-038-02 | 正常append結果だけをPO decisionとして表示する。 | 状態遷移を拒否し、append結果と未判断のPO状態を分けて該当authority ownerへ返す。 |
| CASE-OS-L10-038-05i | AC-OS-L3-038-02 | 正常append結果だけをHARNESS validation passとして表示する。 | 状態遷移を拒否し、append結果をHARNESS判定へ流用せず該当判定ownerへ返す。 |
| CASE-OS-L10-038-05j | AC-OS-L3-038-02 | 正常append結果だけをrelease readinessとして表示する。 | 状態遷移を拒否し、append結果とrelease readinessを分けて該当authority/判定ownerへ返す。 |
| CASE-OS-L10-040-07a | AC-OS-L3-040-02 | 要求意味不足をRecovery成功で隠す。 | typed routeは成立せず要求engine/ownerへ戻す。 |
| CASE-OS-L10-040-07b | AC-OS-L3-040-02 | context復旧要件をBackflowで代替。 | Recoveryの既存中断工程境界を保持する。 |
| CASE-OS-L10-040-07c | AC-OS-L3-040-02 | route待ちをclose/successへ昇格。 | open dutyと停止理由を保持する。 |
| CASE-OS-L10-040-07d | AC-OS-L3-040-01 | Backflow→要求engine、Recovery→中断工程の型別戻し先。 | 各入力を固定L2 routeへ返し別型を混同しない。 |
| CASE-OS-L10-040-07e | AC-OS-L3-040-03 | 未見budget/policy revisionで適用上限が不明。 | 追加retryを保留し、記録ではなく上限を決定する既存policy ownerへ戻す。 |
| CASE-OS-L10-040-07f | AC-OS-L3-040-05 | ledgerに遅着attempt eventがあり、current lineageの再構築が未完。 | cap到達を推定せず追加retryを保留し、元eventと未完状態をHELIXOS-L2-019記録ownerへ戻す。 |
| CASE-OS-L10-041-05a | AC-OS-L3-041-02 | 会話要約だけでcanonical sourceの代わりにする。 | 正本確認済みとせずcoordination-only未完で固定L2の既存authority ownerへ戻す。 |
| CASE-OS-L10-041-05b | AC-OS-L3-041-02 | conflict sourceを確認済みと表示。 | conflictを保持し継続を保留して固定L2の既存authority ownerへ戻す。 |
| CASE-OS-L10-041-05c | AC-OS-L3-041-02 | CLR-R06 candidateまたはpacket存在を採択根拠に昇格。 | candidate/packetをauthorityにせず、固定L2の既存authority ownerへ戻す。 |
| CASE-OS-L10-041-05d | AC-OS-L3-041-02 | secret/private reasoningだけをcoordination packetへ含める。 | 内容を排除して固定L2の既存authority ownerへ戻す。 |
| CASE-OS-L10-042-07a | AC-OS-L3-042-02 | strict validation未実施。 | output accepted/verifiedにならず既存assignmentへ理由を残す。 |
| CASE-OS-L10-042-07b | AC-OS-L3-042-02 | Worker自己申告だけ。 | 検証済み扱いにしない。 |
| CASE-OS-L10-042-07c | AC-OS-L3-042-02 | 適用HARNESS oracle欠落。 | authority/validationを推測せずHARNESSへ戻す。 |
| CASE-OS-L10-042-07d | AC-OS-L3-042-05 | receiptのoracleが異なる。 | 緩和成果を昇格せず既存contract ownerへ戻す。 |
| CASE-OS-L10-042-07e | AC-OS-L3-042-05 | receiptが別成果/revisionに属する。 | receiptを流用しない。 |
| CASE-OS-L10-042-07f1 | AC-OS-L3-042-02 | OSがschemaを発行/変更する。 | semantic editを拒否し契約ownerへ戻す。 |
| CASE-OS-L10-042-07f2 | AC-OS-L3-042-02 | OSがdigest algorithmを発行/変更する。 | semantic editを拒否し契約ownerへ戻す。 |
| CASE-OS-L10-042-07f3 | AC-OS-L3-042-02 | OSがHARNESS oracleを発行/変更する。 | oracleを変更せずHARNESS ownerへ戻す。 |
| CASE-OS-L10-042-07f4 | AC-OS-L3-042-02 | OSがSECURITY permissionを発行/変更する。 | authorityを作らずSECURITY ownerへ戻す。 |
| CASE-OS-L10-043-06a | AC-OS-L3-043-04 | chainがassignmentへ束縛されずresultを別assignmentと混同。 | chain unknown/unfinished、該当operation ownerへ返す。 |
| CASE-OS-L10-043-06b | AC-OS-L3-043-05 | SECURITYがOS assignment/progressを所有すると表示。 | 所有境界を変更せずSECURITY/OS既存sourceへ戻す。 |
| CASE-OS-L10-043-06c | AC-OS-L3-043-05 | 旧Node専有条件を本候補だけで現行へ移す。 | 未決authorityを採用せずunknown維持。 |
| CASE-OS-L10-043-06d | AC-OS-L3-043-06 | 未見Worker/別assignmentだが同一既存event contractを使う。 | 既存型でtraceできる部分のみ正常とし、未定義schemaは補わない。 |
| CASE-OS-L10-049-06a | AC-OS-L3-049-02 | 後段義務/担当/実施capacityが未確保。 | 新assignmentを保留し未完理由を保持。 |
| CASE-OS-L10-049-06b | AC-OS-L3-049-01 | 後段review/mergeがまだ完了していないが割当前の検証義務・担当・容量は確保済み。 | それ自体を割当拒否理由にしない。後段は既存担当/admissionへ残す。 |
| CASE-OS-L10-049-06c | AC-OS-L3-049-02 | 設定上限が2から5へ切替、またはsetting missing/unknown/stale。 | 有効設定ごとに判定し、不明なら新規dispatch保留。 |
| CASE-OS-L10-049-06d | AC-OS-L3-049-04 | utilizationを分子/分母単位・時点・scopeなしで提示。 | 指標を算出済み扱いせず、分母式の根拠を示す。 |
| CASE-OS-L10-049-06e | AC-OS-L3-049-05 | 旧provider数/8-slot/CI/DB/Merge TrainまたはLEGACY-ASSET-23D3D9769B093AFDCC25の旧capacity値を成立証拠にする。 | 旧候補値を除外し固定親条件で判定し、成果・予算・未完義務のlineageを保持する。 |
| CASE-OS-L10-050-07a | AC-OS-L3-050-02 | provider/model名差だけでindependent review認定。 | independenceを成立させない。 |
| CASE-OS-L10-050-07b | AC-OS-L3-050-02 | review完了だけで他HARNESS stage condition成立と表示。 | capacity/review状態だけを記録しstage状態は変更しない。 |
| CASE-OS-L10-050-07c | AC-OS-L3-050-02 | 既存原因/観測値/待ち義務を落としてbackpressureする。 | 三つを保持し該当scopeを限定する。 |
| CASE-OS-L10-050-07d | AC-OS-L3-050-04 | 負荷が既存縮退条件を満たす。 | 新規増枠を停止し、縮退は可能な場合に選べる。active lease完了前の中断や縮退を必須としない。 |
| CASE-OS-L10-050-07e | AC-OS-L3-050-05 | stale時に作成側へ原因なしで返す。 | 理由付きで該当作成側へ返し未完を保持。 |
| CASE-OS-L10-051-09a | AC-OS-L3-051-04 | Claude優先を実装/運用等、要求・設計以外のtaskに適用。 | 優先条件を適用せず、task別の通常適格性だけ判定。 |
| CASE-OS-L10-051-09b | AC-OS-L3-051-07 | exact HEAD read-only finding→作成側修正→新HEAD再review。 | 全revision/actor/returnをtraceし、前receiptを流用しない。 |
| CASE-OS-L10-051-09c | AC-OS-L3-051-08 | LABO/INTELLIGENCEだけでscope/branch/budget/authority/review成立を変更。 | 各変更を拒否し既存authority/assignment ownerへ戻す。 |
| CASE-OS-L10-051-09d | AC-OS-L3-051-09 | 適格taskのtask class/scope/revision/evidence/runtime/context、authority、review finding return、新HEAD再reviewを一つのlineageで入力。 | 選択と独立reviewの全fieldが同じchange lineageへ結び、provider名だけでは独立性を判断しない。 |
