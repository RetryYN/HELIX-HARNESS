# HELIX-OS L10 機能総合検証（Stage 2b）

状態: L3未承認の候補／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

## Stage 2b — HELIXOS-L2-014 functional verification

以下は固定L2-014/L11行317に対する未実行oracle設計候補である。全fixtureは合成・secret-freeとし、target scopeとexact parent revisionへ結ぶ。通常例、独立negative、未見正常、期待状態、owner returnをCASEごとに定義する。HARNESS/INFRASTRUCTURE/SECURITY依存は常時・条件時・選択source時・参照資料のみを区別する。dependencyを人が代行しても必要field、authority、検証、receiptのいずれも省略しない。

### CASE-OS-014-01 — internal stage identity（AC-OS-014-01）

正常: synthetic stage `v0.1`、別のpublic product version field、scope、exact configuration revisionを入力し、内部stage identityと外部版を別recordに保つ。未見正常: 未使用の内部stage labelも同じ規則で扱い、public tagを推定しない。negativeを個別化: (a) internal stage labelをexternal semver/tagと同一視、(b) stage successから1.0到達を生成、(c) HELIX stageを対象製品release identityと同一視。期待: scope内stage stateだけを保持。意味/版の差は要求ownerへ、product release境界はHARNESSへ戻す。

### CASE-OS-014-02 — HARNESS packと必要安全依存のclosure（AC-OS-014-02）

正常 baseline: 選択packのHARNESS-L2-010 contract revision、HARNESS-L2-011 call input/scope/result contract、適用されるHARNESS-L2-022 verification/acceptance contract、該当INFRASTRUCTURE/SECURITY contractsが、同一stage scope/revisionへboundされ、選択/除外packと必要dependencyが明示される。dependency classは各contractが宣言する常時必須・特定操作時・選択input source時・reference-onlyの区別を保持する。HARNESS-L2-022のunit contract acceptanceはstage composite acceptanceを代替しない。

**field-level negative design**: 各fixtureでは下表の一つのdependency fieldと一つのstatus mutationだけを変え、残りを正常baselineに保つ。各fieldについて別々に `missing`, `unknown`, `stale revision`, `wrong revision/scope` を作る。fixture identityは `CASE-OS-014-02-<依存ID>-<field ID>-<status>` とし、例は `CASE-OS-014-02-H010-input-MISSING`、`CASE-OS-014-02-I019-rollback-revision-STALE`。各field/status組は独立fixtureとして照合し、まとめて1件のnegativeにしない。期待は該当operation/dependencyをunknown/unfinishedにしてstage release successを保留し、その契約を所有する既存ownerへ返す。適用されない操作・未選択sourceの条件は「未適用/未観測」と記録し、存在・欠落・適格性を推測しない。

| dependency source | required field identitiesを個別照合する範囲 | owner / return |
|---|---|---|
| HARNESS-L2-010 | `pack-id`, `owner`, `input`, `output`, `dependency-id-version`, `verification-scope-oracle`, `contract-version`, `stage-inclusion-exclusion`, `same-input-version-reproduction`, `prior-eligible-version-replacement`。各fieldへstatus別fixtureを作る | pack contract・scope・version不足はHARNESSへ |
| HARNESS-L2-011 | `capability-id`, `call-contract-version`, `input-scope`, `caller-permission`, `project-tenant-environment-isolation`, `progress-result-evidence`, `correlation-id`, `stop-resume`, `idempotency-key`, `expiry`, `dependency-versions`。適用される各fieldへstatus別fixtureを作る | 呼出しscope/input/receiptは呼出しowner/OSへ、contract/versionはHARNESSへ。authorityはSECURITYへ |
| HARNESS-L2-022 | `artifact-revision`, `paired-design-L5-L4`, `L3-L2-L11-conditions`, `paired-verification-L8-L9-L10`, `stage-evidence-result`, `stage-state-boundary`, `applied-owner-acceptance-record`。適用される各fieldへstatus別fixtureを作る | verification/oracle contractはHARNESSへ、operation evidence collectionはOSへ、human acceptanceはexisting ownerへ |
| INFRASTRUCTURE-L1-017/018/019/020/022 | `I017-backup-target/source-revision/time/completeness/location/integrity/expiry`; `I018-restore-execution/integrity/dependency-reconnect/start/verification`; `I019-rollback-infra-version/config/artifact/dependency/data-compatibility/procedure`; `I020-independent-recovery/no-circular-dependency`; `I022-running-identity/location/start-time/version/config/artifact/dependencies`。各fieldへstatus別fixtureを作る | resource identity/backup/restore/rollback/start/inspection evidenceはINFRASTRUCTUREへ |
| SECURITY-L2-005/006/008/016, when applicable | `S005-actor/operation/target/environment/scope/expiry/purpose/credential-class/no-raw-secret`; `S006-source/destination/protocol/endpoint/path/data-class/volume/purpose/authority/expiry` for actual egress only; `S008-actor/target/operation/revision/environment/scope/expiry`; `S016-asset-identity/classification-value/classification-record-owner/source/revision` (asset owner metadataと分類record metadataを区別)。条件適用される各fieldへstatus別fixtureを作る | policy/authority/credential/egress不足はSECURITYへ。対象L2意味の変更はPO経路へ |

人が実施した作業も同じ行の必要field・source/revision・scope・authority・evidenceが揃うときだけclosureに含める。人分担を理由に安全dependencyをoptional化しない。failure fixtureは各field×statusごとに独立IDを割り当て、summaryで一括greenにしない。未見正常: 別の選択pack/source構成で同じclosure規則を適用し、未選択sourceを未観測に保つ。

### CASE-OS-014-03 — scope内end-to-end work（AC-OS-014-03）

正常: 合成work itemについて要求確認→作業→HARNESS oracleで検証→結果記録の四状態が同一scope/revisionを指し、人が担う工程がある場合はactor/task/resultを明記する。未見正常: 別の狭いscopeでも四工程をつなぎ、未使用能力はcapability外として表示する。negativeは四段階それぞれの欠落を一つずつ変異し、別fixtureにする。さらに小機能を未接続のまま並べたcaseと人手工程のactor/task欠落caseを分ける。期待: unfinished/unknownのまま。要求意味不足は要求owner、工程/verification contractはHARNESS、OS record/dispatchはOSへ戻す。人手で行ったことから追加承認やowner判定を生成しない。

### CASE-OS-014-04 — stage tupleと再現性（AC-OS-014-04）

正常: synthetic stage tupleのpack/dependency identity+version、configuration revision、data format、supported environment、capability/limitation、acceptance evidence identity、update condition、rollback target/procedureを同じ revision-bound setに保存し、同一input tupleから同一構成を照合する。未見正常: 別のsynthetic environment tupleも独立identityで追跡する。negative fixture IDは `CASE-OS-014-04-<field ID>-<status>` とし、各field (pack/dependency identity+version, configuration, data format, environment, capability/limitation, evidence, update condition, rollback target/procedure) に対しmissing/unknown/stale/wrong-revisionを一組ずつ独立にする。別negativeでtagだけを唯一のstage identityにする。期待: reproducibility claimをしないで欠落field ownerへ戻す (pack contract→HARNESS、environment/rollback resource→INFRASTRUCTURE、authority→SECURITY、stage record→OS)。

### CASE-OS-014-05 — 実data・secret・credentialの混入防止（AC-OS-014-05）

正常: synthetic non-sensitive work dataとbackup/migrationへの別scope referenceだけを使い、stage artifact/evidenceに実案件data/secret/credentialがないことをfixture metadataから判別する。未見正常: secret値を含まず有効なcredential-use operationを行う別ケースは、既存SECURITY-L2-005/008 authorityが該当する場合のみに扱い、raw credentialをfixtureへ出さない。独立negative: (a) synthetic inputをreal project data markerにする、(b) secret-value markerをstage payloadへ含める、(c) credential-value markerを同梱する、(d) backup/migration payloadをstage artifactへ結合、(e) evidence/logへsecret/data値を書き出す。値そのものは保存・出力しない。期待: artifactを不適格/隔離扱いとし、DATA/secret boundaryはSECURITY、backup separationはINFRASTRUCTURE、stage packagingはOSへ返す。

### CASE-OS-014-06 — prior stageからnextへ進み、rollbackで状態を保つ（AC-OS-014-06）

正常: 合成prior stage S0とその構成checkpointを保持したままnext stage S1を構築し、切替前にS1を検証する。切替後、S1上の合成案件stateの値を更新し、案件recordへ新しいeventを追加する。更新後のstate identity/valueとrecord identity/content/order/historyを記録した後、S1の不成立を別fixtureで起こして構成・artifact/configurationをS0へrollbackする。rollback後も案件state/recordは切替後のcurrent identity/value/historyを保ち、rollback transitionは新しいrecordとして追記する。S0の古い構成checkpointを案件dataの時点復元に流用しない。L2の「乗り換えと戻し」両遷移をtraceする。未見正常: 別の合成state valueと複数record eventでも、prior構成identityへ戻しながら切替後のcurrent state/record identity/value/historyを維持する。独立negative: (a) 構成は正しくS0へ戻すが、古いcheckpoint復元で切替後の案件state更新だけを失う。(b) 構成と案件stateは保持するが、古いcheckpoint復元で切替後に追加したrecord/historyだけを失う。(c) next検証前の切替、(d) rollback target欠落、(e) rollback target wrong revisionをそれぞれ別fixtureにする。期待: state/recordの更新喪失、欠落、復元範囲不明またはdata-format非互換はunknown/unfinishedとして保持し、案件state/record custodyはOSへ、rollback target/procedure/data compatibilityはINFRASTRUCTURE-019へ、backup/restoreと復旧evidenceはINFRASTRUCTURE-017/018へ返す。構成rollback成功だけで案件state/record継承成功としない。成功記録から1.0を生成しない。

### CASE-OS-014-07 — 自己依存・宣言外dependency（AC-OS-014-07）

正常: synthetic dependency graphに必要な外部/固定dependencyだけを宣言し、起動・更新・recovery手順がstopped HELIXから独立した経路を指す。未見正常: 別のclosed declared graphを対象に同じ照合を行う。各negativeは一つのedgeだけを変える: (a) development worktree required, (b) next stage required, (c) another live stage required, (d) undeclared runtime dependency. さらに INFRA-020 recovery command/pathが停止中HELIXへ循環依存するfixtureを一つ別にする。期待: self-sufficientとしない。dependency declarationはHARNESS-010、実environment/start/recoveryはINFRASTRUCTURE-020/022へ戻す。static graph edgeだけで実runtime dependencyを断定せず、観測不足はunknown。

### CASE-OS-014-08 — pack/stage/1.0 quality stateの分離（AC-OS-014-08）

正常: pack verification、stage scope acceptance/integration/update/rollback/operation evidence、Concept 1.0 attainmentの各stateに異なるidentity/sourceがあり、対象revisionへ結ぶ。未見正常: pack単体が適格でもstage evidenceが途中の状態をunfinishedとして保持する。独立negative: pack green→stage accepted、stage accepted→1.0 attained、stage delivery→最終requirement削減、提供範囲縮小→stage内required quality削減。期待:各境界のownerへ不足を返す (pack→HARNESS, stage→OSと適用されるHARNESS/INFRA/SECURITY, Concept 1.0→Concept/要求owner)。

### CASE-OS-014-09 — owner境界とHARNESS service ⑥（AC-OS-014-09）

正常: OS stage record、HARNESS pack/call/verification contract、INFRA resource/rollback evidence、SECURITY authority/secret policyを各source ownerへ結び、HARNESSサービス⑥の対象製品release recordを別identityにする。未見正常:対象製品releaseがscope外でもHELIX-stage recordを区別して保持する。negativeはOSがHARNESS contractを変更、OSがINFRA runtime stateを主張、OSがSECURITY許可を生成、HARNESS service⑥=HELIX stageと同一視、新owner推測を各一つずつ変異する。期待: owner/source identityを偽らず、scope-specific ownerへ返す。return先不明はunknownを保ち既存parentへ戻す。新owner/approval gateを作らない。

### CASE-OS-014-10 — unmet capabilityとINFRASTRUCTURE-023除外（AC-OS-014-10）

正常: 未成立能力を「できないこと」に記し、固定L2で必要な操作に人手担当を割り当てる一方、必要安全条件は全て満たす。未見正常:別の明示unmet capabilityもscope/limitationへ保持し、L1-023を要求しない。negativeを個別化: capabilityをできると記す、担当人を落とす、担当記録でrequired safety dependencyを免除、L1-023の存在/完成をrelease条件化、L1-023をStage2b/1.0へ前倒し、L1-023欠落だけでstageを失格化。期待: 固定対象scopeを保ち、capability/operation ownerへ不足を戻す。INFRA-023は後続版・版未定であり、L2-014成立に必要な条件ではない。

### CASE-OS-014-11 — FRS-BR-008/009 disposition（AC-OS-014-11）

正常: `MPR-RC-HELIXOS-L2-014-002`のsource dispositionと固定PO決定に沿って、FRS-BR-008の内部で使う意味とFRS-BR-009の安全閉包/組合せ検証を現行契約へ再導出し、旧CI先行利用を使わない。固定coverage receiptでは6 source atomsのうち5件をcarried、1件Cursor限定委譲を保留する。未見正常: 同じ処分を別revision-bound planning recordでたどり、保留atomを対象へ混入しない。negativeを個別にする: 旧CI/wait/rerunを追加、Lite/Fullをstage名にする、保留Cursor委譲を復活、安全dependencyを落とす、HARNESS service⑥をOS配布境界へ取り込む、旧test/runtimeを合格証拠にする。期待: PO dispositionを保持しsource/owner不足へ戻す。旧source、登録、testから採択や実行許可を推測しない。
