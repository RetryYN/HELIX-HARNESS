# IR153 W4技術制約11件の旧source→現行要求再照合

## 固定範囲
- 基準main: `559ae3ba4bfe660d666a57f227466d7dcdd440d9`。旧sourceは参照のみ。旧runtime・CI・testは実行せず、追跡対象ファイルも変更しない。
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。各IDの旧原文行SHAを個別に記録。
- 旧技術方式が現行の要求意味として採択されたと推定しない。sourceの安全・authority・相互運用目的が現行責務に残るかと、特定runtime/schema/platform選択が未決かを分ける。

### HIL-TR-01

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:165`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `04461c622892d646d0a611c9a6d16d4749291388cc7673cab0978f0db733c5c0`; IR `#/HIL-TR-01` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧原文**: | **HIL-TR-01** | HELIX control planeはTypeScript strict＋Node.jsを唯一の正規runtimeとし、Bun固有API・command・lockfile・CI・distribution契約をactive surfaceから除去する。 |
- **現行L2照合先**: HARNESS-L2-010, HARNESS-L2-011, HELIXOS-L2-020。identity記載の参照行: `docs/helix-harness/L2-requirements/product-requirements.md:324`; `docs/helix-harness/L2-requirements/product-requirements.md:340`; `docs/helix-harness/L2-requirements/product-requirements.md:325`; `docs/helix-harness/L2-requirements/product-requirements.md:352`; `docs/helix-os/L2-requirements/governance-requirements.md:692`.
- **対L11受入**: `docs/helix-harness/L11-acceptance/product-acceptance.md:205`; `docs/helix-harness/L11-acceptance/product-acceptance.md:206`; `docs/helix-os/L11-acceptance/governance-acceptance.md:359`.
- **保持・変更・未決**: TypeScript strict/Node唯一化とBun除去という実装選択は現行HARNESS/OSの要件で確定していない。旧runtimeを復活せず、技術選択は根拠と検証方法を伴うL3の設計候補へ分ける。 版の根拠: HARNESS-L2-010: 個別本文に明示なし; HARNESS-L2-011: 個別本文に明示なし; HELIXOS-L2-020: 1.0.
- **状態区別**: PO採択対象内の現行本文revisionと未採択候補を分ける。特定実装方式の未選択、実行未了、意味の採否は別の状態である。

### HIL-TR-02

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:166`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `398c954fe379b991a5d67df87e6524b07489241198cdaa3465b5c9b103327f0b`; IR `#/HIL-TR-02` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧原文**: | **HIL-TR-02** | Pythonはproduct-data、document-engine、detector、analysis workerのdata/detection planeとして第一級化し、Node control planeとはversioned schema/event/CLI contractで接続する。 |
- **現行L2照合先**: HARNESS-L2-022, HELIXCONNECT-L11-001, HELIXCONNECT-L11-002, HELIXCONNECT-L2-001, HELIXCONNECT-L2-002, HELIXOS-L2-019, HELIXOS-L2-020。identity記載の参照行: `docs/helix-harness/L2-requirements/product-requirements.md:336`; `docs/helix-harness/L2-requirements/product-requirements.md:447`; `docs/helix-connect/L2-requirements/connect-requirements.md:33`; `docs/helix-connect/L2-requirements/connect-requirements.md:56`; `docs/helix-connect/L2-requirements/connect-requirements.md:34`; `docs/helix-connect/L2-requirements/connect-requirements.md:67`; `docs/helix-os/L2-requirements/governance-requirements.md:682`; `docs/helix-os/L2-requirements/governance-requirements.md:692`.
- **対L11受入**: `docs/helix-harness/L11-acceptance/product-acceptance.md:217`; `docs/helix-os/L11-acceptance/governance-acceptance.md:352`; `docs/helix-os/L11-acceptance/governance-acceptance.md:359`.
- **保持・変更・未決**: Pythonをdata/detection planeとして第一級化しNode control planeと版付き契約で接続する具体選択は未確定。意味として必要なscope/revision/contract/evidenceの接続と、言語/process選択を混同しない。 版の根拠: HARNESS-L2-022: 個別本文に明示なし; HELIXCONNECT-L2-001: 個別本文に明示なし; HELIXCONNECT-L2-002: 個別本文に明示なし; HELIXOS-L2-019: 1.0; HELIXOS-L2-020: 1.0.
- **状態区別**: PO採択対象内の現行本文revisionと未採択候補を分ける。特定実装方式の未選択、実行未了、意味の採否は別の状態である。

### HIL-TR-03

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:167`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `402bedf607bd03a88435f30d45358ea773cc1c6db77e1ebcdc27d295d53e4503`; IR `#/HIL-TR-03` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧原文**: | **HIL-TR-03** | ZIP Python実装は採用候補だが、HELIX state/gateを迂回して直接正本を書かない。入力digest、出力schema、provenance、detector resultをDBへ投影する。 |
- **現行L2照合先**: HARNESS-L2-022, HELIXOS-L2-015, HELIXOS-L2-019。identity記載の参照行: `docs/helix-harness/L2-requirements/product-requirements.md:336`; `docs/helix-harness/L2-requirements/product-requirements.md:447`; `docs/helix-os/L2-requirements/governance-requirements.md:642`; `docs/helix-os/L2-requirements/governance-requirements.md:682`.
- **対L11受入**: `docs/helix-harness/L11-acceptance/product-acceptance.md:217`; `docs/helix-os/L11-acceptance/governance-acceptance.md:324`; `docs/helix-os/L11-acceptance/governance-acceptance.md:352`.
- **保持・変更・未決**: ZIP/Python候補の直接正本書込禁止というauthority目的は現行source/OS/SECURITY境界と対応するが、ZIP選定・DB projection/schemaの固定はしない。 版の根拠: HARNESS-L2-022: 個別本文に明示なし; HELIXOS-L2-015: 1.0; HELIXOS-L2-019: 1.0.
- **状態区別**: PO採択対象内の現行本文revisionと未採択候補を分ける。特定実装方式の未選択、実行未了、意味の採否は別の状態である。

### HIL-TR-04

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:168`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `83bd39698247d03a8eeeb6b6bbc2d34a3d123603e15431c37946110adbd1033d`; IR `#/HIL-TR-04` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧原文**: | **HIL-TR-04** | OS優先順位はLinuxをprimary、macOSをfirst-class portable、Windowsをcompatibility profileとする。WSL/Git Bash/PowerShellをcore前提にしない。 |
- **現行L2照合先**: HELIXINFRASTRUCTURE-L2-001, HELIXINFRASTRUCTURE-L2-011。identity記載の参照行: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:32`; `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:138`.
- **対L11受入**: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md:34`; `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md:140`.
- **保持・変更・未決**: これは単なるCLI実装方式ではなく、Linux primary・macOS first-class portable・Windows compatibility profileという製品platform support scopeである。現行INFRA-001/011の抽象resource/runtime契約からこの優先順位は導けず、旧matrixも自動採択しない。実機smokeの未実施とは別の未確定な上流scope判断として保持する。 版の根拠: HELIXINFRASTRUCTURE-L2-001: 1.0; HELIXINFRASTRUCTURE-L2-011: 1.0, 1.0.
- **状態区別**: PO採択対象内の現行本文revisionと未採択候補を分ける。特定実装方式の未選択、実行未了、意味の採否は別の状態である。

### HIL-TR-05

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:169`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `0e311e5e2930b4ea28a4f36159a3dd74485e0b63be0d0eb5dd3e3cc0f1d99885`; IR `#/HIL-TR-05` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧原文**: | **HIL-TR-05** | path、process、signal、file lock、SQLite、executable discoveryをOS adapterへ隔離し、Linux CIを基準、macOS/Windows smokeを互換性証拠とする。 |
- **現行L2照合先**: HELIXINFRASTRUCTURE-L2-001, HELIXINFRASTRUCTURE-L2-003, HELIXOS-L2-020。identity記載の参照行: `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:32`; `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:52`; `docs/helix-os/L2-requirements/governance-requirements.md:692`.
- **対L11受入**: `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md:34`; `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md:54`; `docs/helix-os/L11-acceptance/governance-acceptance.md:359`.
- **保持・変更・未決**: path/process/signal/file lock/SQLite/executable discoveryをplatform adapterへ隔離する具体方式やLinux基準/macOS・Windows smokeは現行L2で固定されない。platform差を無視しない意味は保持し、adapter API/test方式を後続設計へ分ける。 版の根拠: HELIXINFRASTRUCTURE-L2-001: 1.0; HELIXINFRASTRUCTURE-L2-003: 1.0; HELIXOS-L2-020: 1.0.
- **状態区別**: PO採択対象内の現行本文revisionと未採択候補を分ける。特定実装方式の未選択、実行未了、意味の採否は別の状態である。

### HIL-TR-06

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:170`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `79e8af744e7986bcf0d5bfb1682e10d4494a383637ddb22151a6abbc1a327f19`; IR `#/HIL-TR-06` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧原文**: | **HIL-TR-06** | Node/Python双方のdependency lock、runtime version、offline/clean install、SBOM/secret/license検査を再現可能にする。 |
- **現行L2照合先**: HELIXOS-L2-020, HELIXSECURITY-L2-003, HELIXSECURITY-L2-005, HELIXSECURITY-L2-008。identity記載の参照行: `docs/helix-os/L2-requirements/governance-requirements.md:692`; `docs/helix-security/L2-requirements/security-requirements.md:41`; `docs/helix-security/L2-requirements/security-requirements.md:90`; `docs/helix-security/L2-requirements/security-requirements.md:43`; `docs/helix-security/L2-requirements/security-requirements.md:110`; `docs/helix-security/L2-requirements/security-requirements.md:46`; `docs/helix-security/L2-requirements/security-requirements.md:140`.
- **対L11受入**: `docs/helix-os/L11-acceptance/governance-acceptance.md:359`; `docs/helix-security/L11-acceptance/security-acceptance.md:27`; `docs/helix-security/L11-acceptance/security-acceptance.md:29`; `docs/helix-security/L11-acceptance/security-acceptance.md:32`.
- **保持・変更・未決**: Node/Python双方のlock/runtime version、offline clean install、SBOM/secret/license scanを全件要求する具体build gateは現行L2/L11にない。security/integrity目的は保持するが、特定toolchain・scan pipelineを旧条件から自動採用しない。 版の根拠: HELIXOS-L2-020: 1.0; HELIXSECURITY-L2-003: 個別本文に明示なし; HELIXSECURITY-L2-005: 個別本文に明示なし; HELIXSECURITY-L2-008: 個別本文に明示なし.
- **状態区別**: PO採択対象内の現行本文revisionと未採択候補を分ける。特定実装方式の未選択、実行未了、意味の採否は別の状態である。

### HIL-TR-07

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:171`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `909543892476ba1cf5f75440ac49fb2d9a4cfeb28dad74430c8e4afdadee2432`; IR `#/HIL-TR-07` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧原文**: | **HIL-TR-07** | SQLite/harness.dbはcontrol planeのevent/projection backboneを維持し、Python分析用read modelとNode write authorityを分離する。write authority変更はL4で決定する。 |
- **現行L2照合先**: HELIXOS-L2-015, HELIXOS-L2-019。identity記載の参照行: `docs/helix-os/L2-requirements/governance-requirements.md:642`; `docs/helix-os/L2-requirements/governance-requirements.md:682`.
- **対L11受入**: `docs/helix-os/L11-acceptance/governance-acceptance.md:324`; `docs/helix-os/L11-acceptance/governance-acceptance.md:352`.
- **保持・変更・未決**: SQLite/harness.db、Node write authority/Python read modelというDB方式は現行L2で確定していない。source/evidence continuityとwrite-authority分離の意味は既存ownerへ分ける。書込authority変更はL3決定とする旧条件が現行の意思決定正本にあるとは確認できないため、廃止とも採択とも断定しない。 版の根拠: HELIXOS-L2-015: 1.0; HELIXOS-L2-019: 1.0.
- **状態区別**: PO採択対象内の現行本文revisionと未採択候補を分ける。特定実装方式の未選択、実行未了、意味の採否は別の状態である。

### HIL-TR-08

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:172`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `6b4edb6a06e80046b947a43b1e3b7878645bbb20e8342c7e03c2413fd8aaf792`; IR `#/HIL-TR-08` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧原文**: | **HIL-TR-08** | Node↔Pythonの初期正規IPCはchild process＋versioned JSON Lines over stdioとし、stdoutをprotocol、stderrを診断専用にする。envelopeはschema/run/request/type/sequence/deadline/payload digestを持つ。 |
- **現行L2照合先**: HELIXCONNECT-L11-001, HELIXCONNECT-L11-002, HELIXCONNECT-L2-001, HELIXCONNECT-L2-002, HELIXOS-L2-018, HELIXOS-L2-023。identity記載の参照行: `docs/helix-connect/L2-requirements/connect-requirements.md:33`; `docs/helix-connect/L2-requirements/connect-requirements.md:56`; `docs/helix-connect/L2-requirements/connect-requirements.md:34`; `docs/helix-connect/L2-requirements/connect-requirements.md:67`; `docs/helix-os/L2-requirements/governance-requirements.md:672`; `docs/helix-os/L2-requirements/governance-requirements.md:722`.
- **対L11受入**: `docs/helix-os/L11-acceptance/governance-acceptance.md:345`; `docs/helix-os/L11-acceptance/governance-acceptance.md:380`.
- **保持・変更・未決**: child process＋JSON Lines/stdin/stdout protocol envelopeは現行機構間契約で強制されない。versioned contract、scope、receipt等の意味相互運用条件と具体IPCを分離し、stdio/schemaはL3の候補方式とする。 版の根拠: HELIXCONNECT-L2-001: 個別本文に明示なし; HELIXCONNECT-L2-002: 個別本文に明示なし; HELIXOS-L2-018: 1.0; HELIXOS-L2-023: 1.0.
- **状態区別**: PO採択対象内の現行本文revisionと未採択候補を分ける。特定実装方式の未選択、実行未了、意味の採否は別の状態である。

### HIL-TR-09

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:173`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `cd97bee6bd8482ada1107a9d38e6f78557a61d0d91dc803d39147c46413cc050`; IR `#/HIL-TR-09` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧原文**: | **HIL-TR-09** | Python workerはharness.dbへ直接writeせず、Nodeがschema検証済みresult/findingをtransactionalにcommitする。Pythonへは必要最小限のread snapshotだけを渡す。 |
- **現行L2照合先**: HELIXOS-L2-015, HELIXOS-L2-019, HELIXSECURITY-L2-015。identity記載の参照行: `docs/helix-os/L2-requirements/governance-requirements.md:642`; `docs/helix-os/L2-requirements/governance-requirements.md:682`; `docs/helix-security/L2-requirements/security-requirements.md:53`; `docs/helix-security/L2-requirements/security-requirements.md:210`.
- **対L11受入**: `docs/helix-os/L11-acceptance/governance-acceptance.md:324`; `docs/helix-os/L11-acceptance/governance-acceptance.md:352`; `docs/helix-security/L11-acceptance/security-acceptance.md:39`.
- **保持・変更・未決**: 非authority Python workerの直接正本書込を避け、検証済み結果のみauthority側へ渡すという境界は現行OS/SECURITY分担へ再導出できる。Node transactional commitやread snapshot形式の特定は要求文言として確認できない。 版の根拠: HELIXOS-L2-015: 1.0; HELIXOS-L2-019: 1.0; HELIXSECURITY-L2-015: 個別本文に明示なし.
- **状態区別**: PO採択対象内の現行本文revisionと未採択候補を分ける。特定実装方式の未選択、実行未了、意味の採否は別の状態である。

### HIL-TR-10

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:174`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `3b5c0041f969f4b120a88747391b21e884f61bb3ca170d99e8678d93dcf45119`; IR `#/HIL-TR-10` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧原文**: | **HIL-TR-10** | harness.dbはproduct source/snapshot/mapping、engine registry/run/artifact、detector registry/run/finding、IPC run、CI stage/quarantine、agent instance/lifecycleを論理的に分離する。 |
- **現行L2照合先**: HELIXOS-L2-015, HELIXOS-L2-016, HELIXOS-L2-019。identity記載の参照行: `docs/helix-os/L2-requirements/governance-requirements.md:642`; `docs/helix-os/L2-requirements/governance-requirements.md:652`; `docs/helix-os/L2-requirements/governance-requirements.md:682`.
- **対L11受入**: `docs/helix-os/L11-acceptance/governance-acceptance.md:324`; `docs/helix-os/L11-acceptance/governance-acceptance.md:331`; `docs/helix-os/L11-acceptance/governance-acceptance.md:352`.
- **保持・変更・未決**: 旧DBの論理table separationは現行L2の機構責務分担と混同しない。各機能責務はownerごとに明記するが、旧storage schema・table構成を現行要件へ移植しない。 版の根拠: HELIXOS-L2-015: 1.0; HELIXOS-L2-016: 1.0; HELIXOS-L2-019: 1.0.
- **状態区別**: PO採択対象内の現行本文revisionと未採択候補を分ける。特定実装方式の未選択、実行未了、意味の採否は別の状態である。

### HIL-TR-11

- **旧source**: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:175`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; line SHA-256 `0357f4fadff0d8791fe111864cefa590b0be7d9aa90fca4d1cbc39a17ad6397a`; IR `#/HIL-TR-11` (IR SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`).
- **旧原文**: | **HIL-TR-11** | Bun cutover完了時はNode clean install/build/test/CLI/hooks/package/distributionをBun binary/loader/API/lockfileなしで実行可能にする。 |
- **現行L2照合先**: HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-022, HELIXOS-L2-020。identity記載の参照行: `docs/helix-harness/L2-requirements/product-requirements.md:324`; `docs/helix-harness/L2-requirements/product-requirements.md:340`; `docs/helix-harness/L2-requirements/product-requirements.md:325`; `docs/helix-harness/L2-requirements/product-requirements.md:352`; `docs/helix-harness/L2-requirements/product-requirements.md:336`; `docs/helix-harness/L2-requirements/product-requirements.md:447`; `docs/helix-os/L2-requirements/governance-requirements.md:692`.
- **対L11受入**: `docs/helix-harness/L11-acceptance/product-acceptance.md:205`; `docs/helix-harness/L11-acceptance/product-acceptance.md:206`; `docs/helix-harness/L11-acceptance/product-acceptance.md:217`; `docs/helix-os/L11-acceptance/governance-acceptance.md:359`.
- **保持・変更・未決**: 旧Bun cutover時のNode clean install/build/test/CLI/hooks/package/distributionの一括completion条件は現行候補の採択条件として確認できない。旧CI実行禁止とNode切替受入は別の命題であり、現行runtimeの版付き比較/検証条件を実装時に確定する。 版の根拠: HARNESS-L2-010: 個別本文に明示なし; HARNESS-L2-011: 個別本文に明示なし; HARNESS-L2-022: 個別本文に明示なし; HELIXOS-L2-020: 1.0.
- **状態区別**: PO採択対象内の現行本文revisionと未採択候補を分ける。特定実装方式の未選択、実行未了、意味の採否は別の状態である。


## TR04の上流判断残り

- **原文の選択肢A**: 旧sourceのplatform matrixを維持し、Linuxをprimary、macOSをfirst-class portable、Windowsをcompatibility profileとする。影響: INFRASTRUCTURE-L2-001/011、運用・検証のplatform scopeと、後続adapter/smoke設計。
- **選択肢B**: 別の具体的platform matrixを上流scopeとして選び直す。その場合は対象OSごとのsupport tierと、CI/実機で確認する保証を明示する。影響: 同じINFRASTRUCTURE候補、後続HARNESS/OS portability条件。
- 旧sourceの意味は技術実装ではなく支援対象の優先順位であるためL3のruntime選択だけへ送らない。PO決定の明示記録を確認できない限りA/Bどちらも採択済みとせず、候補本文も旧matrixへ自動的に戻さない。

## 照合した現行文書のSHA-256

- `docs/helix-brain/L11-acceptance/brain-acceptance.md` — `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`
- `docs/helix-brain/L2-requirements/brain-requirements.md` — `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`
- `docs/helix-connect/L11-acceptance/connect-acceptance.md` — `bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`
- `docs/helix-connect/L2-requirements/connect-requirements.md` — `31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`
- `docs/helix-harness/L11-acceptance/product-acceptance.md` — `6262609e08a80b493d14cbbd9205befaff61e8046bc567128b37445f2b825974`
- `docs/helix-harness/L2-requirements/product-requirements.md` — `1e4e5b9be4258bfe5e3ab6a4c6911a7cab380617a01d50fa5ac5472adb849c99`
- `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` — `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`
- `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` — `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`
- `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` — `f70b7b996d79c432ac4771fd58e2819e1619abfbedd96d145d38f31e21142630`
- `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` — `39e31f6a18385c8ca37f57fcaac4076d55c5fba2c49f47eadbaf48be5ef48d6d`
- `docs/helix-labo/L11-acceptance/labo-acceptance.md` — `119fa43bce6753bdb0fed5420641617b9665907a7b1c3b2e6def590098e7442d`
- `docs/helix-labo/L2-requirements/labo-requirements.md` — `c34b87dde7c94eecb7d4aa83146cf2f3de1b50c278bd0e99cbf9e96a01145f71`
- `docs/helix-os/L11-acceptance/governance-acceptance.md` — `86b7949cf7700300588e8dc2ccb4448e31111223d2f1cace81109533452d551e`
- `docs/helix-os/L2-requirements/governance-requirements.md` — `db2b119daa7fbc47b79b1652beba72149fb0d6969af7bb400c1650d77464f2b5`
- `docs/helix-security/L11-acceptance/security-acceptance.md` — `a931c77c099d2fe9dcef184da6c0427db35653308c21d0ac90b6210c02dc4ef5`
- `docs/helix-security/L2-requirements/security-requirements.md` — `286385d4e59ea69667c095a0a483338d8fb8786c7c7ec2c381c127775b8435ca`
