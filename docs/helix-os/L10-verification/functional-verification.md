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
