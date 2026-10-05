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

## Stage 3：HELIX-OS 15項目のL10総合検証案

各CASEは同じ番号のL3 ACを照合する。文書上のfixture設計であり、旧test/runtimeを実行した結果や現行実装受入を主張しない。原因・scope・owner・revisionがunknownなら成功へ丸めず、該当scopeを未完として戻す。

| CASE ID | L3 AC | 入力・操作 | 期待oracle／negative・unknown |
|---|---|---|---|
| CASE-OS-L10-032-01 | AC-OS-L3-032-01 | policyあり/なしのprofileを分け、check/version/fingerprint/baseline/current HEAD/scope/remediation/expiry/minimum gateを入力。 | policy選択時だけ完全一致する1件をeligible。baseline/current HEADを別々にreceiptへ記録しfailureはfailのまま。非選択は通常profileを通す。 |
| CASE-OS-L10-032-02 | AC-OS-L3-032-02 | fingerprint、version、baseline、scope、期限、owner、gateを各一つずつ変異。 | 各mutationでeligible 0。未宣言互換version、scope外HEAD、expired policyを拒否。 |
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
| CASE-OS-L10-035-04 | AC-OS-L3-035-05 | event intakeのdurable記録後、L2-010 job登録前に中断し、既存event/checkpointからresume。 | partial eventは保持され、同じlogical jobが一つだけ登録される。処理済み表示・registration receiptはjob登録後にのみ成立する。 |
| CASE-OS-L10-036-01 | AC-OS-L3-036-01 | 複数のRetrofit upgradeを含むticketでpreflight前の影響調査/未確定plan draft、各upgradeのpreflight成功、plan確定、各apply直前に最新source/authorityを再照合。 | 未確定draftはpreflight成功前から可能。全upgradeに両境界の同ticket/revision記録があり一致するものだけapply可能。通常非-Retrofitは対象外。 |
| CASE-OS-L10-036-02 | AC-OS-L3-036-02 | 各upgradeのpreflight未実施/failed/stale、wrong ticket・revision、apply直前drift/authority失効を一件ずつ変異。 | 影響upgradeのplan確定/apply 0。影響調査/未確定draftは継続可能で、未完理由とownerが維持される。 |
| CASE-OS-L10-036-03 | AC-OS-L3-036-03 | 適用可能contract/result ownerをunknownにする。 | unknownのままplanを保留。技術compatibilityをOSが補完しない。 |
| CASE-OS-L10-037-01 | AC-OS-L3-037-01 | 同じscopeの連続2観測期間、source revision、明示drift条件適合の差分。 | 観測双方を同期間へ結び、条件成立時のみticket candidateへsource-backed handoff。 |
| CASE-OS-L10-037-02 | AC-OS-L3-037-02 | 期間片方欠落、stale source、差分なし、同finding再送。 | 欠落はnot-observed、staleはstale、差分なしはcandidateなし、再送はduplicate candidateなし。 |
| CASE-OS-L10-037-03 | AC-OS-L3-037-03 | detector/applicability unknownに加え、無関係ticketの許可済み処理をfixtureに置く。 | 対象scopeのみ未評価、無関係ticketは同期停止されない。 |
| CASE-OS-L10-038-01 | AC-OS-L3-038-01 | 有効HARNESS contract/templateと041-003の対応済み抽出結果、選択layer、L0別anchor、source atom proposalを入力。 | 一度だけappend、snapshotとreceiptのbase/template/contract/scope/source digestが往復追跡可能。approval stateは不変。 |
| CASE-OS-L10-038-02 | AC-OS-L3-038-02 | stale base/template、authority/scope欠落、L0 row化、同一proposal再送、各保存境界失敗、および041-003の複数obligationを単一atomにまとめたfindingを個別投入。 | stale/unauthorized拒否、duplicate append 0、L0 layer row 0、部分成功claim 0。非原子的findingではcandidate row増分0、rejected outcome findingを追記し、snapshot bytes不変。 |
| CASE-OS-L10-038-03 | AC-OS-L3-038-03 | 同一active template bytes/revision・scope・applicability・extractor/versionによる041-003再抽出でsemantic digestが異なる二結果を投入し、別に未対応atom/contractと独立した適格layerも入力。 | 不一致はquarantineしcurrent update 0、既存snapshot bytes不変。未知atomはgapのまま、独立に適格なlayerだけ処理を続ける。 |
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
| CASE-OS-L10-044-01 | AC-OS-L3-044-01 | finding、同一source/headと選択された既存OS-L2-007条件を満たす記録。 | 該当findingのみresolved。 |
| CASE-OS-L10-044-02 | AC-OS-L3-044-02 | prose-only、wrong head/finding/source mismatchを別々に投入。 | 全fixtureでresolutionなし、finding open。 |
| CASE-OS-L10-044-03 | AC-OS-L3-044-03 | selected source unresolvedと別未選択source不在を比較。 | 選択source不在は保留、未選択sourceは追加必須化しない。 |
| CASE-OS-L10-049-01 | AC-OS-L3-049-01 | 有限task状態表とconfigured limit、READY/依存/優先順/authority/scope/競合を満たし、適用可能なINTELLIGENCE low-impact evidenceと後段検証担当/capacity確保済みの適格idle task。 | 各状態別集計、適格taskだけ別assignment。上限とrun countを別値として返す。 |
| CASE-OS-L10-049-02 | AC-OS-L3-049-02 | dependency/authority/scope/path/deadline/downstream owner/capacity/limitを各々欠落・不適合化。 | 不適格dispatch 0、idleはidle、理由を残す。 |
| CASE-OS-L10-049-03 | AC-OS-L3-049-03 | resource/proposal/observation時点をunknownにする。 | 割当可能・実行中へ推定せず、source ownerへ返す。 |
| CASE-OS-L10-050-01 | AC-OS-L3-050-01 | 同一期間のtyped backlog/wait/rework/reviewer capacityと独立reviewer候補。 | review capacity不足が主因の範囲だけHEAD/generation boundの一意assignment。 |
| CASE-OS-L10-050-02 | AC-OS-L3-050-02 | downstream bottleneck、limit、reviewerなし、重複generation、active lease、threshold欠落を個別変異。 | 不当増枠0、active lease不変、merge/Ready権限の追加0。 |
| CASE-OS-L10-050-03 | AC-OS-L3-050-03 | 原因/threshold/authority/適性unknownと、別対象の許可済みreviewを入力。 | 対象scopeだけbackpressure、無関係な許可済みreviewは継続可。 |
| CASE-OS-L10-050-04 | AC-OS-L3-050-01 | 一時capacity増枠の縮退条件成立後、active review leaseを保持したまま完了させ、HEAD変更対象には新世代reviewを割当。 | active leaseを中断せず完了後に縮退する。変更HEADは独立review対象となり、各merge前の最新base/content HEAD・scope・admission照合は既存規則のまま。 |
| CASE-OS-L10-051-01 | AC-OS-L3-051-01 | task class別evidence、INTELLIGENCE案、authority/capability、作成/review候補を入力。 | 条件適用内の役割別配置を対象revisionへ記録。異方向の適格配置も正常。 |
| CASE-OS-L10-051-02 | AC-OS-L3-051-02 | 同一context両役割、Cursor reviewer、stale evidence、wrong scope/authority/headを個別変異。 | 不適切配置0。provider名差のみの独立性claim 0。 |
| CASE-OS-L10-051-03 | AC-OS-L3-051-03 | evidence/availability/scopeをunknownにする。 | 未割当・戻し先記録。Claude優先/Cursor条件でunknownを迂回しない。 |
| CASE-OS-L10-032-04 | AC-OS-L3-032-04 | common eligible baselineからreason、remediation ticket、current HEAD/tree、scope、iteration ceiling、wildcard rule、provenance、required HARNESS oracleを一つずつ欠落/変更する。 | 変異ごとeligible=0。候補外sourceで不足を埋めず、元failureとownerを保持する。 |
| CASE-OS-L10-032-05 | AC-OS-L3-032-05 | policy選択の条件unknownとpolicy非選択/未登録checkを別fixtureにし、既存HARNESS義務を入力する。 | unknownはquarantine対象だけ保留してHARNESS/OS/SECURITY/INFRASTRUCTUREの該当ownerへ戻す。非選択profileは通常扱いを保つ。 |
| CASE-OS-L10-033-04 | AC-OS-L3-033-04 | engineのrun/artifact/digest/exit status、detectorのrun/finding fields/dedupe/provenanceを各々一つ欠落。partial/failed executionも別caseにする。 | 一つの欠落も全体再現を許可せず、partial/failedを成功にしない。engine/detector owner・HARNESS oracle・OS run・SECURITY/INFRASTRUCTUREを分けて戻す。 |
| CASE-OS-L10-033-05 | AC-OS-L3-033-05 | 未見正常のselected capability集合を同じsnapshotで2回処理し、別scopeでrequired field/source/compatibility unknownを与える。 | 成立するscopeだけ再現を記録する。unknownのscopeは未評価のまま各入力ownerへ戻す。 |
| CASE-OS-L10-034-04 | AC-OS-L3-034-04 | directive cancel/supersede、finding accepted-risk、non-actionable findingを独立fixture化し、accepted-riskではL5 action-binding PO receiptまたは独立reviewを一方ずつ外す。 | accepted-riskは両方揃う時のみ既存receiptを関連付ける。directive receiptをfindingへ流用せず、原eventを非終端で保つ。 |
| CASE-OS-L10-034-05 | AC-OS-L3-034-05 | 分類前durable intake保存失敗、projection closeとlocal closure receipt不一致、appeal/reopen receipt欠落を個別投入する。 | 原eventを欠落/終端化せず未完として保持。既存source/authority ownerへ戻す。 |
| CASE-OS-L10-035-06 | AC-OS-L3-035-04 | 新HEAD登録後に旧HEADのeventを遅着させる。 | 現行revisionは巻き戻らず、旧eventはそのsource/headの履歴へ結ばれる。 |
| CASE-OS-L10-035-05 | AC-OS-L3-035-05 | eventをdurable intake後、OS-L2-010登録receipt前に中断し、同じevent再送とbase ref/event identity/authority applicability欠落の各fixtureを使う。 | resumeは同じjob identityを一つだけ登録。receipt前は完了表示しない。欠落は該当source/OS/SECURITY ownerへ戻す。 |
| CASE-OS-L10-036-04 | AC-OS-L3-036-04 | 選択upgradeのunknown oracle、別dependency/config scope、一般CI greenのみ、rollback planのみを個別入力する。 | どれも選択preflightの成功にならずplan確定/applyを止める。oracle/technical owner/authority/resourceへ別々に戻す。 |
| CASE-OS-L10-037-04 | AC-OS-L3-037-04 | 正常経路A: weekly HARNESS design/implementation driftをexisting Reverse/Backflowへ渡す。正常経路B: source-classified cumulative debtをLABO評価、OS-L2-022 candidate、OS-L2-010 repayment-plan candidateへ渡す。 | 両方を別traceで観測し、責務/優先順位/gateを既存契約から維持する。2 periodsはmissingness/continuity観測であり成立閾値でない。 |
| CASE-OS-L10-037-05 | AC-OS-L3-037-05 | sourceなしcandidate、candidateからexecution/priorityへの自動昇格、LABO-063別scopeの一般化をそれぞれ入力する。 | 候補を作らず/昇格せずscopeを保つ。owner/source/priority unknownはそのownerへ戻す。no-delta、not observed、condition not metは区別する。 |
| CASE-OS-L10-038-04 | AC-OS-L3-038-04 | base L11 671–689とsupplement 690–696を別spanとして照合し、PO row 35とscope 37–40、HARNESS-041-003 adoptionを関連付ける。 | supplement適用条件を確認するが抽出findingの意味は再判定しない。historical “unadopted” wordingだけから状態を作らない。 |
| CASE-OS-L10-040-04 | AC-OS-L3-040-04 | same experiment retryの途中でWorker/sessionを交代し、resumeする。別experimentを対照として置く。 | same episodeのcounter/budgetを維持し、別experimentを混ぜない。 |
| CASE-OS-L10-040-05 | AC-OS-L3-040-05 | retry ledgerをmissing/unreadableにするcaseと、有効ledgerでinput capに到達するcaseを別々に実施する。 | missingはunknown/owner return、cap到達だけがexisting typed routeへ戻る。 |
| CASE-OS-L10-040-06 | AC-OS-L3-040-06 | task Aのcap到達と、別task Bの許可済み継続を同時に入力する。 | task Aだけを既存routeへ戻し、Bを停止しない。 |
| CASE-OS-L10-041-04 | AC-OS-L3-041-04 | withdrawn claimと旧instructionを含むcoordination stateを別々に用い、source rereadはmissingにする。 | 両者の値をsecret/private reasoningから復元しない。coordination-only未完としてOS-L2-009/元sourceへ戻す。 |
| CASE-OS-L10-042-04 | AC-OS-L3-042-04 | common valid outputからschema/version、digest、target revision、source policy/revisionを一つずつ欠落/改変する。digest一致だけの反例も用いる。 | 欠落/不一致は個別に保留し、digest一致だけで内容/authority適合を宣言しない。 |
| CASE-OS-L10-042-05 | AC-OS-L3-042-05 | 既存契約に定めるexpiry超過、別scopeへの緩和流用、再検証receipt欠落を別fixtureにする。 | それぞれ昇格せず、契約/authority ownerへ戻す。親にないsize/timeout/policy条件は作らない。 |
| CASE-OS-L10-042-06 | AC-OS-L3-042-06 | valid期限内・同一scope outputと、期限欠測/比較不能outputを対にする。 | 先は適用契約の範囲で検証候補、後者はunknownとして別表示し、成功にもfailureにも丸めない。 |
| CASE-OS-L10-043-04 | AC-OS-L3-043-04 | request/call/resultを共通正常event chainとして用意し、event欠落・role/scope/correlation/revision mismatchを一つずつ変異する。 | chain不成立はowner return、因果履歴を保ち誤承認/完了を作らない。 |
| CASE-OS-L10-043-05 | AC-OS-L3-043-05 | tool call単独でpermissionを発生させる変異と、result単独でverification/completion/write authorityを発生させる変異を独立実施。 | いずれも新しいauthority/stateを生成しない。通常のrequest不要operationはrequestなしで扱う。 |
| CASE-OS-L10-049-04 | AC-OS-L3-049-04 | 同一scope/time window内でconfigured capacity・経過観測秒・assignment/task counts・unused capacity・unfinished lineageを別々に固定しutilizationを算出する。 | denominatorが明示され、counts/未完系譜と別指標。dummy taskを作らない。missing time/capacityは未評価で成功分母に入れない。 |
| CASE-OS-L10-049-05 | AC-OS-L3-049-05 | downstream owner/capacity、READY、priority、deadline、lease、authority、config revisionを一項目ずつ不適合化する。 | 不適合範囲のみ保留、HARNESS義務と未完理由を保持。OSはimpactを判定しない。 |
| CASE-OS-L10-050-06 | AC-OS-L3-050-04 | review待ち件数・待ち時間・rework占有率・reviewer稼働率、scope/period、主因、eligible reviewer availability、authority/context/leaseが揃う正常fixtureを作る。 | capacity causeに対応するassignment候補だけ記録し、quality/Ready/merge stateは別に保つ。 |
| CASE-OS-L10-050-05 | AC-OS-L3-050-05 | reviewer capacity/lease/priority/deadline/downstream owner/capacity/authorityを個々に欠落・失効させ、別fixtureでcreator/subagent reviewer、HEAD drift、base drift、scope drift、複数PRの片方merge後に残りのbaseを再取得しない条件を与える。 | 不当増枠0。capacityからindependence、branch edit、Ready、merge authorityを生成しない。 |
| CASE-OS-L10-051-04 | AC-OS-L3-051-04 | Claude-create/Codex-reviewおよび適格性が成立する逆配置を別task fixturesで行う。 | 各条件に合う配置のみ記録し、providerを恒久優先matrixへしない。 |
| CASE-OS-L10-051-05 | AC-OS-L3-051-05 | Cursor reviewer、同一runtime/context、stale evidence、wrong scope/authority/HEAD、provider-name-only independenceを各々独立に変異。 | 各誤配置を拒否し、現行ownerへ戻す。 |
| CASE-OS-L10-051-06 | AC-OS-L3-051-06 | LABO evidence / INTELLIGENCE proposalまたは適格sourceの一つをunknownにし、別適格候補がある組合せとない組合せを対照にする。 | 適格根拠がある候補のみ選択。根拠なしは未割当として対応ownerへ戻す。 |
