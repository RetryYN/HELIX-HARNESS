# HELIX-INFRASTRUCTURE L2/L11 消化記録（2026-09-27）

本記録は[機構内監査](helix-infrastructure-internal-audit-2026-09-27.md)のC1/C2/C3を消化する別記録である。過去の監査本文は変更しない。参照起点は監査基準のL1/L2/L11、PO原文・判断記録と、次の旧sourceである。

- `LEGACY-ASSET-17C4BF78919578FEBB18` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md:68-98,108-119,164-171`, SHA-256 `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0`: environment/permission/credential/sink/expiry identity、plan/apply/receiptの分離、actionに対応するrollback/backup/health evidence、unknown/ambiguous targetのfail-closeを意味比較に保持した。旧schema/planner/runtimeや全操作へのbackup手続きは移植していない。
- `LEGACY-ASSET-5D41345F55800F23AC38` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md:7-15`, SHA-256 `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6`: provenance、restore/rollback、unknown/stale、test evidenceの候補を比較した。未承認L3候補の数値・fault injection手順を現行1.0受入へコピーしない。
- L1/POの版根拠は`infrastructure-intent.md:77-78,85-86,96`、PO原文`runtime-infrastructure-l1-po-original-2026-09-26.md:261-292,677-693,895-911,1058-1083`、判断記録`infrastructure-concept-placement-po-decisions-2026-09-26.md:58-63,74-82`。PO明示の1.0最低18項目を維持し、それを越す機能は`1.0より後（版は未定）`のままとした。

### L2-010 / L11-010: 操作別条件

- 更新・変更を実適用する場合だけ対象target/revision/scopeに一致したSECURITY update-admissionが必要であり、通常のaction authorityは別に全実操作で照合する。acceptedでなければ適用前に停止する。read-onlyにupdate-admissionは一律要求しないが、SECURITY authority/action/scopeは維持する。
- read-only fixtureはoperation scope、read target、許可対象resourceのbefore/afterと空のwrite-setを照合し、write禁止と当該操作が起こした変更なしを観測する。稼働中resource全体のdigest不変は要求しない。無関係なrunning stateの変化でread-onlyを不合格にしない。
- state-changing operationでは当該actionに適用される復旧義務とbefore/afterを確認する。L2-005に基づくbackup/restore/rollback/recoveryは適用義務がある場合に要求し、全actionへの一律backupやrollbackを追加しない。該当義務が不明/未充足なら変更前に保留する。
- 全実操作はSECURITY制約下のWorker実行契約を通し、OOBもこのWorker経路を用いる。独立bootstrap/recoveryではL1-020/021・L2-006のOOB resource/pathと別SECURITY authorityを開始条件とし、停止中OS ticket/assignmentや通常L2-009応答を要求しない。これは通常operationのticket/authority免除ではない。OS/通常Control Plane復旧後に結果をWork/Change traceへ同期する。Worker結果receiptは実行後の入力と明記し、開始前に自己の結果を要求しない。

### L11-001 / L11-003: Model Runtime属性の観測

対象scopeに含まれるModel Runtimeのmodel/version/server/GPU-memory requirement/concurrency/latency/capacity/health/endpointをsource/revisionと結び、capacityやhealthの未観測/stale/unknownをhealthy/十分なcapacityとしない。対象scope外のruntimeを捏造せず、実測値は保持し、容量の十分性の閾値・適用条件が未設定ならその判定をunknownに戻す。これはPOの18項目内にあるresource inventoryをL11で判定可能にしたもので、model能力の評価/配置決定をINFRASTRUCTUREへ移さない。

### L11-011: 1.0構成体

1.0最低18項目と後続版未定の境界、単体/接続/構成体の別判定を維持する。構成体全体では復旧能力を含む最低18項目をすべて確認する。個々の操作では該当するrestore/rollback/recovery端を確認するが、read-onlyや無関係な操作に全backupを課さない。OOB startはSECURITY制約下のWorker実行契約、独立path、別authorityで確認し、通常Control Plane復旧後の同期も構成体fixtureへ反映する。stage integrationはHELIXOS-L2-014 stageへ収載する場合に限る。

本追補はL1の意味、最低項目数、版境界を変更せず、L2-010のsecurity/update/recovery依存をoperation条件に分け、L11-001/003/010/011の既存scopeへoracleを具体化する。要求採択、実行許可、実環境の成立を生成しない。
