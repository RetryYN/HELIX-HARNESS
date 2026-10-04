# HELIX-SECURITY L3 機能要件 — Stage 1（19親の候補）

> 状態：L3要件の起草候補。L3承認、実装方式確定、実行・配布許可、受入結果を表さない。本書はHELIXSECURITY-L2-001〜016、020、028、033の19 identityだけを対象とする。

## 適用・authority・版境界

SECURITYは全操作にoperation-specific authority境界を適用し、有効な既決権限を再利用する。通常作業の毎回の人間承認を追加しない。既存authorityのactor/target/operation/revision/environment/scope/expiryを照合し、missing・mismatch・expired・unknownは既存L2契約どおりdeny/holdする。L2-009は該当scopeのrecipientへの停止伝播を保つ。L2-033は採択訂正版の適用範囲内で有効なscoped credential-useを認め、raw secretやsecret/機密task本文の露出を許さず、Worker出力からauthorityやstateを生成しない。

Stage 1だけを切り出す。L2-015はasset identity基盤、L2-016は分類記録、L2-020は決定的Guard基盤、L2-033は採択MPR `-002`と別pinされたP0追補の範囲を保つ。後続Web条件、1.x sink/publication enforcementを1.0へ前倒ししない。hold/reject親、Stage 2cの031、他Stageのidentityをこの文書へ含めない。技術値は根拠付き候補であり、parameterごとのPO承認を作らない。要求の意味・scope・owner・versionを変える場合にだけL2へ戻す。

## 旧HELIXからの対応と差分理由

旧HELIXのL3を形式・意味分類の起点として読み、下の親別paragraphに再利用/再導出/置換を記録する。旧L3工程定義（`root/docs/process/forward/L00-L06-design-phase.md` lines 148–168）にあるFR+AC、3 sub-doc、L10 pairの形式を起点とし、旧HELIXと旧HARNESSのL3 READMEに残る層番号・UX pair・G3 gateを現行L3/L10へ再導出する。assetのhistorical ledger statusは変更しない。旧IDを現行IDへ機械転用せず、旧G3 freeze、旧approval authority、runtime、CLI、test、旧数値は移植しない。各SECURITY意味は採択済みL2/L11から再導出する。

固定親は全て各section SHAとPO decision rowで特定する。共通source全体SHAはここで一度だけ記録する。f6dad revision（親001–016、020、028）のL2全体SHA `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。親033の別revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3` はL2全体SHA `d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5`、L11全体SHA `e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556`。033の採択MPRとP0追補はsource pin reportで別々のraw spanとして固定する。

| 旧source（archive相対path） | asset / source SHA-256 / 行 | Stage 1での処置と変更理由 |
|---|---|---|
| `root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605`; `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`; HR-FR-P8-04 168–171、HR-NFR-P8-02 186 | raw input/trusted metadata/instruction分離の部分再利用。対象・owner・classificationを現L2に沿って再導出。旧P8の全scopeを引き継がない。 |
| `root/docs/design/helix/L3-requirements/security-capability-broker-authority.md` | `LEGACY-ASSET-B62E49D2E156232B8C63`; `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`; CAP-001〜007 160–166 | typed capability/target等との部分類似のみ利用。現L2のsecurity policy、credential、classification、owner境界を再導出し、旧schema/runtimeを置換する。 |
| `root/docs/design/harness/L3-functional/README.md` | `LEGACY-ASSET-9A772391C7FB1298D45F`; `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`; 16–56 | functional/business/NFR三分割とFR/AC・pair関係の形式を保持。旧G3/sub-gateは現行承認手続きにしない。 |
| `root/docs/design/harness/L3-functional/functional-requirements.md` | `LEGACY-ASSET-B5B5E71B2AF1459D59A1`; `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`; 22–40（全体1–974） | FRを動作・ACへ結ぶ形を再導出。旧ID、UI/runtime/mode表は移さない。 |
| `root/docs/design/harness/L3-functional/business-detail.md` | `LEGACY-ASSET-A6E2C7F0565E5F804F06`; `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`; 21–39、84–104 | business分類を別に扱う形式だけを参照。BR-21/Learning Engine/HM-08の業務意味やownerはSecurityへ流用せず、現L2のownerへ残す。 |
| `root/docs/process/forward/L00-L06-design-phase.md` | `LEGACY-ASSET-F542125805B777D8A56A`; `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`; 148–168 | FR+AC、3 sub-doc、L10 pairの工程形式を参照する。旧L0–L6 layer mapping、UX wording、G3 freeze/role authorityは現行L3/L10と異なるため再導出し、現行gateへしない。 |
| `root/docs/design/helix/L3-requirements/nfr-grade.md` | `LEGACY-ASSET-8CC5ABFC98C0D00183CA`; `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`; 1–73 | 候補値・根拠・計測の提示形式を参考にし、旧数値を採用しない。 |
| `root/docs/design/harness/L3-functional/nfr-grade.md` | `LEGACY-ASSET-DB669724249A14A665F0`; `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d`; 21–34、58–74 | NFRと測定の形式を部分再利用。IPA grade、placeholder、旧pass閾値/CIを現行値にしない。 |
| `root/docs/test-design/helix/security-capability-broker-acceptance.md` | `LEGACY-ASSET-170112AB2FA2FFDBFEE9`; `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4`; 1–59 | negative fixtureのconsumer根拠として読む。旧oracleの実行・合格証拠化はしない。 |
| `root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` | `LEGACY-ASSET-44DD86E3DEC09E65EF51`; `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`; 1–200 | legacy受入consumerと隣接atomだけを確認し、現L10へそのまま移植しない。 |
| `root/docs/governance/helix-harness-requirements_v1.3.md` | `LEGACY-ASSET-02319C2481B9E01698D5`; `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`; HR-FR-P2-05 line 428 | archive atomはこのpathのline 428。別revisionの6fabd125 baselineはGit path `docs/governance/helix-harness-requirements_v1.3.md:409`。別pinとし、2 atomを統合せずMPR `-002`/P0訂正oracleの代わりにしない。 |

旧test/runtime/CLIは実行しない。旧資産ledgerが示すunresolved/historical状態をこの対応表から昇格しない。L2-033で旧P2-05と旧CAP-007 reason receiptは別のsource atomとして保持し、credential-useの意味は採択済みL2/L11から導く。

## FR / AC

### SECURITY-FR-001-01 — 外部入力の信頼・authority境界

外部文書/Issue・PR/Web/MCP/Tool出力/AI生成物はsource・project・revision・classificationを持つ未信頼dataとして扱う。閲覧だけでinstruction/要求/authority/memory/BRAIN/training/policyへ昇格しない。昇格は明示済み経路に限る。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar L3のHR-FR-P8-04（旧path `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` lines 168–171、asset `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）とHR-NFR-P8-02（同path line 186）を起点にraw input/trusted metadata/instructionの分離を部分再利用し、現L2のsource/project/revision/classificationへ再導出する。旧CAP-001〜007はこの要件への直接対応とみなさない。

- **固定親**：`HELIXSECURITY-L2-001` / `MPR-RC-HELIXSECURITY-L2-001-001`、semantic digest `sha256:97997b9023ac5291a30cfdb263b0997209e76dfd6ce7378cf6a914da57948d8f`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L70`（section SHA `sha256:0c2fd43eba36ca1461dc40e9e91b390df36fbee51226643a52cab6ec042928e9`）、対L11 `25行`（section SHA `sha256:8e22198c3258b212cf56135925e1e6b000c1b937da6e2bf1add8a0133c51a446`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：Conceptのdata-use classification・isolation foundation、source identityを受ける。分類不能なら未信頼・unknownとして扱う。 戻し先: 入力の意味や昇格条件が不足・矛盾ならL1-001/L1-002候補へ戻す。下流の接続先はunknownのまま保つ。

**L3 acceptance (`SECURITY-AC-001-01`)**：外部文書、Issue/PR、Web/MCP/Tool出力を読み取り、source・project・revisionを持つuntrusted dataとして残す。例外/反例: 「読むだけ」でinstruction、要求、authority、memory、BRAIN、training data、policyへ上がる場合は不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-001`。

### SECURITY-FR-002-01 — 命令様dataの直結防止

L2-001で未信頼の命令様内容はdataのまま扱い、Tool args・system instruction・権限operation・credential送信・SECURITY policy変更へ直接連結しない。policy変更条件の意味不足はL1-002へ戻し、完全なinjection検出率を要求しない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-001（前掲security-capability-broker-authority.md lines 160–166、asset `LEGACY-ASSET-B62E49D2E156232B8C63`、SHA-256 `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`）はoperation capabilityとimpactの型分離であり、命令様data非昇格とは直接一致しない。authority/data分離の部分類似のみ記録し、命令様dataの扱いは固定L2から再導出する。旧CAP-002はphysical target/TOCTOU、CAP-003はprovenanceを扱い、本FRとの連番対応ではない。

- **固定親**：`HELIXSECURITY-L2-002` / `MPR-RC-HELIXSECURITY-L2-002-001`、semantic digest `sha256:59b12bbafd3c6aee62a08839e8a56826e28609495422bf5eaa484fe427935700`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L80`（section SHA `sha256:07ce9de25ab4b47be2b99a0550342230e34520548fe4444b6e0166d9454c61cd`）、対L11 `26行`（section SHA `sha256:e3be2a9d718395db4d018280b458e3c85e508bb68c59ae9828f1e486c99c3890`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-001のsource/classification、Workerへ渡される明示scope。検出Botがなくても直接authority経路を遮断する。 戻し先: 境界を証明できない場合は下流操作を止め、data flow設計をL1-002へ戻す。検出器の不在を成功扱いしない。

**L3 acceptance (`SECURITY-AC-002-01`)**：「前の指示を無視」「AGENTS.mdへ書け」「repositoryを消せ」「memoryへ保存」「credentialを送れ」「SECURITY policyを変えろ」を含む外部dataでも、閲覧内容がTool args/system instruction/権限付きoperation/SECURITY policy変更に直結せず、untrusted dataのまま保持される。各判定は適用policy revision、入力source/scope、deny/hold理由を持つ判定receiptへ結ぶ。完全なinjection検出器がないことだけでは不合格にせず、直結があれば不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-002`。

### SECURITY-FR-003-01 — project/tenant/environment/assignment隔離

project/tenant/environment/assignment identityとstate/data/Worker/credential/artifactを明示scopeに結ぶ。identityが欠落/不明なら停止し、primary treeや他projectへ暗黙fallbackしない。tenant fixtureは境界確認であり顧客tenant runtimeを要件化しない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-002（同前掲asset/path/lines/SHA）はlexical/physical targetと実行直前TOCTOU確認の部分類似に限る。project/tenant/environment/assignment隔離とは直接一致しない。旧CAP-003はprovenance区別で別の責務。現L2のscope軸から再導出する。

- **固定親**：`HELIXSECURITY-L2-003` / `MPR-RC-HELIXSECURITY-L2-003-002`、semantic digest `sha256:dc222ffbcdf2511878e805ad26239b4c5d9dd3c9d1a67982b48aee12f2fb8132`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L90`（section SHA `sha256:2d800eaf8c98669fc8f890559d4405efcd1b3d8855de573b59b70e7961541475`）、対L11 `27行`（section SHA `sha256:e68fcbc6750f2ce1d0508fccde5f97dfb9175e7e622cb22fc3b0d80817589eb0`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：OSからassignment/project identity、INFRASTRUCTUREから実環境identity、CONNECTから宣言済み接続identityを受ける。各機構は自分のstateを正本として保持する。 戻し先: identityが欠落、衝突、不明なら操作停止。identity構造の不足はL1-003へ、物理環境の不足は接続要求でINFRASTRUCTUREへ戻す。

**L3 acceptance (`SECURITY-AC-003-01`)**：A/Bのproject、tenant、environment、worktreeのstate、Agent、Hook、credential、memory、artifactの参照を提示し、明示接続のある作用だけが対象内に限定される。primary tree/他projectへのfallbackが発生、またはscope不明を許可にしたら不合格。tenantを含むfixtureは合成scope identityの境界確認であり、顧客tenant runtimeの構築を1.0の前提にしない。tenant dimensionが対象にない環境で存在を捏造せず、当該操作に適用されるtenant identityがある場合は照合を省略しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-003`。

### SECURITY-FR-004-01 — Agent/Hook/config integrity

project/root/HEAD/revision/digest/owner/scopeに構成を束ねる。stale、未知、他project構成を採らず、不足値を既定値で埋めない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-002（同前掲asset/path/lines/SHA）のTOCTOU再確認はstale/変更済み対象を通さない部分類似に限る。旧CAP-004はclassification/sink分離であり、構成revision項目とは直接一致しない。現在の構成項目は固定L2から再導出し、旧config形式を移さない。

- **固定親**：`HELIXSECURITY-L2-004` / `MPR-RC-HELIXSECURITY-L2-004-001`、semantic digest `sha256:58e9e513e934ff3c1ed8da378b05fcc7fdd3e2a27a503feb449bc7a305812d20`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L100`（section SHA `sha256:1373d55273872771775be0d6f770431d2675d52f23af0606989503eedeb0bc44`）、対L11 `28行`（section SHA `sha256:bd5cd1a6e0d604302743a36686d93c13fc57e95e62c48bbb64a17edc742911c5`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-003のidentityと、構成sourceのrevision/digest。Ownerが不明ならその不明を維持する。 戻し先: 対象のowner/scopeが不明ならL1-004へ戻し、実行を停止する。承認のない構成を推測採用しない。

**L3 acceptance (`SECURITY-AC-004-01`)**：正しいproject/root/HEAD/revision/digest/owner/scopeの構成だけを識別し、採用可能revisionとunknown/stale/他project由来の比較結果を返す。内容差分とauthority差分を分けて示し、stale revision、未知Hook、他projectのMCP設定を受け入れない。構成の一部欠落を既定値で黙って補ったら不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-004`。

### SECURITY-FR-005-01 — Credential/Secret境界

raw secretをAI context/log/artifactへ出さず、credential storeをWorkerへ直接公開しない。credentialのsecret/non-secret分類は固定L2-005が指す単一のcanonical classifierを使い、各消費者が独自分類を作らない。利用をactor/operation/target/environment/scope/expiry/目的に限定し、検査/revoke状態を扱う。値の混入・漏えいは停止。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-004（data classificationとsink authority分離）とCAP-005（external/destructive actionのexact target/action binding、同前掲asset/path/lines/SHA）は限定的な部分類似にとどまり、credential store/use/revokeに直接一致しない。current credential contractへ再導出し旧store/runtimeを持ち込まない。

- **固定親**：`HELIXSECURITY-L2-005` / `MPR-RC-HELIXSECURITY-L2-005-001`、semantic digest `sha256:8e8689912796e8fb3e22210619cb1283f6b27ab1804353dfa93fe43eec10a784`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L110`（section SHA `sha256:5eccc4d1683c144c57800071294756713aff52f78db467382665002c8ed39cad`）、対L11 `29行`（section SHA `sha256:19f3e8c523ec522f35982ed3837c21fb6c22623c587d17fd7ae6bad1f6a3f107`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-008 authority、L2-006 egress、Worker境界L2-007、INFRASTRUCTUREの安全な実資源境界。 戻し先: 欠落scope、期限切れ、未知のcredential class、検査不能はdeny/stop。方針の不足はL1-005へ、保存・注入境界はL2-024へ戻す。

**L3 acceptance (`SECURITY-AC-005-01`)**：全credential consumerが同一canonical secret classifierのidentity/revisionと判定を参照する。raw credentialはcontext/log/artifactに現れず、actor・operation・target・environment・scope・expiry・purposeが一致する利用だけを許可し、期限切れ/revoked credentialの後続利用を止める。repository混入、直接Worker露出、egress漏れ、値入りreceipt、consumer別classifierの作成/不一致、credential-use tupleの欠落/不一致があれば不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-005`。actor/environment/purposeは固定L2のcredential-use条件と既存L2-008 authority tupleから明示し、purposeを欠いた利用を許さない。

### SECURITY-FR-006-01 — Network/egress境界

送信元/destination/protocol/endpoint/path/classification/bytes/purpose/authority/expiryを照合し、明示許可された範囲のみ送る。unknownはdeny。定量上限を新設せず、L2-019/Core Asset Guardと1.x sink enforcementを1.0へ前倒ししない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-004（同前掲asset/path/lines/SHA）のdata classificationとsink authorityの分離は本要件の直接的な部分根拠である。egress scopeは固定L2から再導出する。旧CAP-006はruntime surface coverageであり、この要件への根拠ではない。asset別Web sink/publication policyは1.0へ含めない。

- **固定親**：`HELIXSECURITY-L2-006` / `MPR-RC-HELIXSECURITY-L2-006-001`、semantic digest `sha256:8bcb8c56772c18c8afb3bbd016cade4511da47533cbc39cb0f775860fe4bbee3`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L120`（section SHA `sha256:09459643b100dbe79ef0cf47100a4b56834d975ef309322bc3f8d7f4055d888a`）、対L11 `30行`（section SHA `sha256:a910c8b1352414d2e6e3ad39f093a936f19b8a3c353411eeefa7a877fba3f7e7`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-005のsecret検査、L2-016の1.0分類基盤（data-use classificationとasset exposure classの記録だけ）、CONNECTの論理接続、INFRASTRUCTUREの実network経路。L2-019のCore Asset Egress GuardとL2-016の1.x sink enforcementは依存に含めない。 戻し先: 宛先/分類/目的/authorityがunknownならdenyし、方針の意味差はL1-006へ戻す。物理経路の不明はL2-024へ。

**L3 acceptance (`SECURITY-AC-006-01`)**：送信先/protocol/endpoint/path/data class/bytes/purpose/authority/expiryを照合し、default-denyを基準とする許可一覧、operation別判断、計測値とdata-minimization結果を返す。明示許可範囲内だけ送る。分類はL2-016の1.0分類記録基盤から読み、L2-019や1.x sink enforcementが存在しない状態でも1.0の送信判定は成立する。vendor側privacy設定だけがある送信、未許可destination、未知classificationが通れば不合格。送信量上限は追加しない。L2-019のasset-specific egressは別の1.x受入とする。

**対応L11 acceptance**：`HELIXSECURITY-L2-006`。

### SECURITY-FR-007-01 — Worker実行環境への制約適用

path/network/credential/environment/timeout/resource/diff/rollback/result collection等の既存SECURITY制約をOS assignmentに基づき実行環境へ渡し、適用/観測を示す。enforcer ownerはWorker実行環境でありSECURITYではない。適用不能はunknown/停止、host fallback禁止。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-006（同前掲asset/path/lines/SHA）はruntimeごとのhook/sandbox coverageとunsupported時のhost fallback禁止を扱い、未適用時に停止する点だけ部分類似である。旧CAP-007はcanonical safety failureをlegacy greenで相殺せずreason receiptへ残す要件で、Worker制約適用とは別である。worker constraintsは固定L2から再導出し、旧Runner/Sandboxを復帰させない。

- **固定親**：`HELIXSECURITY-L2-007` / `MPR-RC-HELIXSECURITY-L2-007-002`、semantic digest `sha256:1ee4d42a1e4178d598ce11b75268845578ba83bcb8ea471e2642ff8630c49504`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L130`（section SHA `sha256:052c634e25dff6bd1cba742d240f87d07c6d395852e994414522e4fcd243f210`）、対L11要約表 `31行`（section SHA `sha256:bb6dc9697c4bc21ad94cce4f2ad97c796706327d33686858eed1831378b4c155`）、詳細な9制御受入 `69–87行`（network `76行`、resource `80行`、rollback `82行`、result collection `83行`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：Concept/Worker実行契約、OS assignment、INFRASTRUCTURE実資源、L2-003/005/006/008。旧Runner/Sandbox actorを復活させない。 戻し先: 未適用/未観測/unsupportedは実行停止・unknown。SECURITY方針不足はL1-007、物理enforcement欠落はINFRASTRUCTURE接続の候補へ戻す。

**L3 acceptance (`SECURITY-AC-007-01`)**：各制約（write path、network、credential、environment、timeout、resource、diff検査、rollback、result collection）がWorker実行環境へ渡り、適用・観測状態を確認できる。環境変数の許可setはSECURITY制約として定め、対象assignmentとpolicy revisionへ結び付ける。現行Worker実行環境が制約を適用し、その実適用をWorker/INFRASTRUCTUREの観測で確認する。raw secret valueや許可されていないsecret参照を環境へ渡さない。いずれか未適用/unknownなのにhost fallbackで実行、制約をWorkerが自己拡張したら不合格。read-onlyでもwrite禁止の適用と操作対象scopeの実行後の変更なし観測を要する。rollbackだけは変更なしを確認できた場合に限り適用対象外とでき、変更有無がunknownなら成功扱いしない。許可された既存credential capabilityの使用を一律禁止せず、raw値の露出・無許可利用と区別する。条件別fixtureは[L10 SECURITY-CASE-007-01の9制御fixture表](../L10-verification/functional-verification.md)で制御ごとに列挙する。

**対応L11 acceptance**：`HELIXSECURITY-L2-007`。

### SECURITY-FR-008-01 — 操作ごとのauthority

actor/target/operation/revision/environment/scope/expiryが一致するoperation別判断と理由を返す。read/write/execute/network/install/delete/merge/release/deploy/credential-use/security-changeを包括権限にまとめない。

**旧HELIX対応（再利用/再導出/置換）**：旧asset（上記lines 1–176、25–55）およびtest asset `LEGACY-ASSET-170112AB2FA2FFDBFEE9`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md` lines 1–59、SHA `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4`: typed tuple/negative fixtureは部分的な前例である。旧runtime/testは実行しない。

- **固定親**：`HELIXSECURITY-L2-008` / `MPR-RC-HELIXSECURITY-L2-008-001`、semantic digest `sha256:6135842a799b9883cb29c5ce9e6ffcf601997d66cb3d314c8031ba9cbbae9f2c`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L140`（section SHA `sha256:e00f26365cfbe64a4ee8369a9f6001ca4f1fb6f7f933b8055dd6ea47f0019d59`）、対L11 `32行`（section SHA `sha256:05d6af862333dd496de98c2f469b6e50a9d2817442b7b1c83c93ac9348821a25`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-003 identity、L2-004構成integrity、L2-005 credential、L2-006 egress、OSの進行。 戻し先: 未認可、drift、expiry、unknownではdenyし、意味の変更はL1-008へ戻す。停止伝播はL2-009/022で検証。

**L3 acceptance (`SECURITY-AC-008-01`)**：異なるread/write/execute/network/install/delete/merge/release/deploy/credential-use/security-change操作で別authorityを要求し、actor/target/operation/revision/environment/scope/expiryが完全一致したときだけ影響の大きいoperationを許可する。Agent利用権から包括write/deployが生じる、または欠落・期限切れ・driftを通すと不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-008`。

### SECURITY-FR-009-01 — revoke/quarantine伝播

対象trigger/identityをOS assignment・Worker環境・CONNECT・credential/artifact accessの該当ownerへ相関可能に伝え、受領/適用/失敗/未観測を分ける。owner別stateを保持し、unknown伝播を対象operationとrisk scope内に制限。latency閾値は本FRで確定せず、固定L2-009が数値latencyを作らないとしているため、数値latencyのNFR候補も作らない。

**旧HELIX対応（再利用/再導出/置換）**：旧SECURITY authority/受入source（上記）はrevoke/fail-close oracleの候補として参照するが、owner別の意味は再導出する。旧end-to-end機構横断flowを再利用したとは主張しない。

- **固定親**：`HELIXSECURITY-L2-009` / `MPR-RC-HELIXSECURITY-L2-009-002`、semantic digest `sha256:8fb04c1b20003123cbcb8f1b23adaca402e0d94d784473ca63f18ecabf544a84`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L150`（section SHA `sha256:1e0f47fdc6cdce52f324d178b6c927b4519ab9412f51f7bfb1def0a33df9abca`）、対L11 `33行`（section SHA `sha256:749fcd644ce86f164a511fcef1381bbfd9aba301fccd6c6ce4d8f01e7fd7324e`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-003/005/006/007/008、OS assignment、Worker実行環境、CONNECT、artifact access、INFRASTRUCTURE観測。 戻し先: recipient未応答・未観測・unknownの間は対象operation/新規割当てを止める。authority/policy意味差はL1-009へ、OS/Worker/CONNECT/INFRAのenforcement差はその接続先L1へ戻す。

**L3 acceptance (`SECURITY-AC-009-01`)**：revoke、scope drift、credential漏洩、異常通信、runtime逸脱、unknownを投入すると、OSの新規割当停止、Workerの実行停止と途中成果物隔離、CONNECT通信停止、credential使用停止、artifact access停止の該当先へ伝わる。どれかの該当停止が確認できず成功扱いで継続したら不合格。unknownは列挙triggerの安全上の影響や不明な外部副作用に関するものとし、無関係な一般文書の意味unknownを全操作停止へ広げない。operation/project/worker/credential/connection/artifactの該当identityに束縛して伝播し、recipient別の受領・適用・未達・未観測を区別する。

**対応L11 acceptance**：`HELIXSECURITY-L2-009`。

### SECURITY-FR-010-01 — 更新受入

15対象のsource/provenance/digest/dependency/permission/network/credential/config差分/new executable/known finding/rollbackを照合し、accept/reject/unknownと根拠を返す。単にversionが新しいだけでは受入れない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR `LEGACY-ASSET-EE5DBACC7F28F7D1F605`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` lines 22–349、SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）は能力/updateに隣接する根拠である。現L2の15対象と処置は再導出し、旧対象集合を再利用したとは主張しない。

- **固定親**：`HELIXSECURITY-L2-010` / `MPR-RC-HELIXSECURITY-L2-010-001`、semantic digest `sha256:8d63bbbd688538d1a743705539e404b3a684d0631fcd585c74ef387bfca2fb31`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L160`（section SHA `sha256:9f4db5957220915c4df1843aa0c02b647e35c54adbeb83fefe79da5c0870bdb5`）、対L11 `34行`（section SHA `sha256:8c5d010b69e32c1ba25e091f8b2eb07af70988ff06190786f394fc32005a2f89`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-011能力差分、L2-012 supply-chain provenance、L2-013 artifact integrity、L2-008 authority。 戻し先: 情報不足はunknown/reject、意味や必要な判定軸の差はL1-010へ戻す。実行/昇格はL2-023に従う。

**L3 acceptance (`SECURITY-AC-010-01`)**：source code、dependency、package、plugin、MCP、Skill、Agent definition、Hook、runtime config、sandbox policy、model、model weights、prompt/system instruction、Connector、infrastructure configurationの15対象それぞれについて、provenance、digest、dependency/permission/network/credential/hook-config差分、新規実行物、known finding、rollback情報が揃い採否と根拠を追える。単に新version、または欠落情報をunknownのまま採用したら不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-010`。

### SECURITY-FR-011-01 — Capability drift

同一file/hash/nameから能力不変を推定せず、更新前後のread/write/shell/network等のcapability差を識別する。比較不能はunknown。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR asset（旧path lines 22–349、全体SHAは上記）と旧受入test `LEGACY-ASSET-44DD86E3DEC09E65EF51`（`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` lines 1–200、SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`）はrisk/changeの隣接例およびtest consumerの記録に限る。正確なcapability-diff条件は再導出。

- **固定親**：`HELIXSECURITY-L2-011` / `MPR-RC-HELIXSECURITY-L2-011-001`、semantic digest `sha256:dcd26abfcd8bff20835c05541fe7c3360e5e1a512679c48d6e7c53e368f22496`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L170`（section SHA `sha256:c75ce0a2c3ee1c84fc8b9b5c4a3221126fb74a2f967a4e377a4f4cff4809fd6f`）、対L11 `35行`（section SHA `sha256:ca300d27bd9d76885f8c7ceeb139db7d96bbca82e0b6211ac3005250dcfbdfbd`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-004の構成identity、L2-010のcandidate revision。比較不能はunknownとする。 戻し先: 能力を分類できない変更は受け入れず、分類意味の不足をL1-011へ戻す。

**L3 acceptance (`SECURITY-AC-011-01`)**：更新前後の構成・file差分・能力記述からversion差分、capability差分、security impactを対応付けて返し、model/Agent/MCP/pluginにも適用する。同じfile変更でもread-only→write+shell+networkの能力変化を検出する。比較不能はunknownとし、hash一致/ファイル名だけでcapability不変と結論したら不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-011`。

### SECURITY-FR-012-01 — Supply-chain provenance

package/container/repository/MCP/plugin/Skill/Agent/model/binaryごとにsource/producer/version/digest/dependencies/permissions/network/risk/update delta/rollbackを辿る。不明な供給元/能力をtrustedにしない。scanner/registry/providerの特定実装は要求しない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR/acceptance assetsはprovenance consumerの隣接資料に限る。source/producer項目は固定L2から再導出し、scanner/registry契約を再利用しない。

- **固定親**：`HELIXSECURITY-L2-012` / `MPR-RC-HELIXSECURITY-L2-012-001`、semantic digest `sha256:a9460cd56aa398e8b553910926987e8a7affc758781f1d0967540fd39acc6e1a`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L180`（section SHA `sha256:6d2afeee0c6f60a332265c1196c447f47b578e6e72700b8216d03d4e00f49a27`）、対L11 `36行`（section SHA `sha256:1663d911bb3c1800f17b00172f4e1ec8234cdc7605cb6d0dae2760bc3ed3c114`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-010更新candidateとL2-013artifact identity。特定scanner/registry/providerを新規必須化しない。 戻し先: 欠落または不一致はunknown/reject。対象範囲の変更はL1-012へ戻す。

**L3 acceptance (`SECURITY-AC-012-01`)**：package/container/GitHub repo/MCP/plugin/Skill/Agent/model/binaryでsource、producer、version、digest、dependency、permission、network、known risk、update delta、rollbackを辿れる。不明な供給元/実行能力をtrustedへ昇格したら不合格。これは1.0 provenance traceであり、後続版のCore Asset Guardやsink protectionの完成を要求・証明しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-012`。

### SECURITY-FR-013-01 — Artifact identity chain

生成/build/validation/配布/実行artifactのidentity/version/digest/provenance/producerを同じ鎖で照合する。欠落/mismatchで昇格を止める。digest一致だけでsource authorityやverification passを推定しない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR/acceptance assets（上記）は受入chainの隣接根拠に限る。artifact chainは現L2から再導出し、旧CI/runtime/testの実行や合格を主張しない。

- **固定親**：`HELIXSECURITY-L2-013` / `MPR-RC-HELIXSECURITY-L2-013-001`、semantic digest `sha256:e6daf304f8d09b86237dde6dfb2ec99029673ef920dcbd3538c56b449edeee3e`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L190`（section SHA `sha256:b5c2034525a6fd4314a2e5d3596fa812466e648c92080ca78883870945deda56`）、対L11 `37行`（section SHA `sha256:e775685b309e83121aca7eef7ac3116926920b447650fca4f1fe2a099ed03c97`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-010/012の更新・provenance、HARNESS verification receipt、OS promotion record。 戻し先: identity/digest mismatch、missing stepは昇格停止。意味や必要なidentityが不足ならL1-013へ戻す。

**L3 acceptance (`SECURITY-AC-013-01`)**：build/validation済artifactのidentityと配布/実行artifactのidentity・digest・provenanceが同じ鎖で一致する。異なるartifact、欠けた工程、digest不一致が昇格可能なら不合格。digest一致だけからsource trustやverification passを推定しても不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-013`。

### SECURITY-FR-014-01 — SECURITY永続化promotion判定

SECURITY単体としてmemory/training dataset/BRAIN knowledgeの3 target class別にsource/provenance/classificationからallow/deny/holdと理由を返す。機構横断handoff、LABO評価、BRAIN登録、保存実行は含めず、end-to-endはL2-027に委ねる。

**旧HELIX対応（再利用/再導出/置換）**：現行HELIXSECURITY-L2-014として採択済みの意味を要件化し、新しい上流要求を追加するものではない。旧SECURITY L3 broker、旧pillar L3 functional requirements（HR-FR表、特にP8領域）とそのacceptance、旧L3 test-designを検索範囲とし、memory/training/BRAINへのSECURITY単体判定という同一契約は見つからなかった。形式上の近接点はpillar L3 HR-FR-P8-04（旧path `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` lines 168–171、asset `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）および旧CAP L3全体（asset `LEGACY-ASSET-B62E49D2E156232B8C63`、SHA-256 `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`）だが、直接継承ではない。対象3 class/判定/非保存境界は採択済みL2/L11から再導出する。

- **固定親**：`HELIXSECURITY-L2-014` / `MPR-RC-HELIXSECURITY-L2-014-002`、semantic digest `sha256:6acd2e5b89cc44bfbd70f4d545f666ee51fe356dcb59f7c6c985107f463a1276`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L200`（section SHA `sha256:bed52b952b89788736c7d8615f561b0eda6b08c5c7979f6fa7a834d86491887c`）、対L11 `38行`（section SHA `sha256:2e34f6860f09a6b70cc6e1d36e2cbdf122e4c26168d3f7528983abde1e10957f`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：SECURITYは3 target classごとのsource/provenance/classification判定と理由付きdecisionだけを所有する。入力metadataは各source owner、memory/training/BRAINへのhandoff・保存は各target owner、業務上の保存可否意味はL1-014のownerが正本を持ち、LABO評価とBRAIN登録を本unitに含めない。依存は固定L2-014に明記されたL2-001/002のsource trustとL2-015/016の1.0 identity/classification入力であり、1.x sink enforcementは含めない。provenance/classification欠落はhold/denyしてsource ownerへ補足を返す。判定対象・意味の変更はL1-014へ戻し、機構横断handoffはL2-027のownerへ返す。

**L3 acceptance (`SECURITY-AC-014-01`)**：SECURITY単体のdecision tableへmemory、training dataset、BRAIN knowledgeの3 target classを個別に入力し、L2-001/002に基づくsource trustと、L2-015/016のidentity/classificationを照合する。source/provenance/classificationが欠落・unknown・target不一致ならhold/denyし、理由付き判定を返す。Memory poisoning、Prompt Injection persistence、training contamination、BRAIN contaminationにつながる入力も該当target classの判定理由として識別し、単体判定から保存・機構横断受渡しを主張しない。Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINの機構横断受渡しや保存成功をこの単体試験で主張したら不合格。L1-014の構成体kindと3経路の成立はL2-027だけで受け入れる。

**対応L11 acceptance**：`HELIXSECURITY-L2-014`。

### SECURITY-FR-015-01 — Asset identity基盤

列挙資産および列挙外資産に対してowner/identity/source/revision/digestを識別し、内容dumpなしで追跡可能にする。1.0はidentity基盤、Web実利用保護は1.x。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR asset（上記）はcore asset/provenanceに隣接する根拠に限る。現在のHELIX資産一覧はPOを起点に再導出し、包括的保護scopeを引き継がない。

- **固定親**：`HELIXSECURITY-L2-015` / `MPR-RC-HELIXSECURITY-L2-015-001`、semantic digest `sha256:6307d5833296e0c438401e8a4a11221a601da0c1389bd813cfb4641fee114a6a`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L210`（section SHA `sha256:40e3bd42faa4b4b89c41a80b291f61c27bcff197a6ac924bedfd370cfe92c147`）、対L11 `39行`（section SHA `sha256:1f940c5d714564fca0b15359607e1094efbcfda9e0a47cc97dfd9f63767a42b4`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：各資産ownerからのidentity/provenanceとConceptのdata-use classification。 戻し先: owner/identityが不明ならunclassified/unknownとして保留し、範囲の不足をL1-015へ戻す。

**L3 acceptance (`SECURITY-AC-015-01`)**：§16列挙の HELIX-HARNESS-CORE（HELIX-JSON、Python meaning core、Requirement Engine、internal verification logic）、HELIX-BRAIN（Patterns、Units、Parts、accumulated design knowledge）、HELIX-INTELLIGENCE（internal prompts、judgment configuration、specialist models、routing / diagnostic logic）、HELIX-LABO（episodes、evaluation corpus、training material）、HELIX-OS（authority/state、topology、operation records）、HELIX-SECURITY（policies、credentials）をowner、identity、source、revision/digestで識別できる。列挙外資産も分類対象となり得る。内容をdumpせず識別不能をpublicと扱ったら不合格。受入は1.0 identity baseだけでWeb保護完了を宣言しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-015`。

### SECURITY-FR-016-01 — Asset exposure classification基盤

public/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secretとunknownを定義し、分類情報と分類記録自身のowner/source/revisionをL2-015 asset identityへ束縛して記録する。資産由来metadataと分類記録metadataを混同しない。unknownをpublic/allowと推定しない。1.x sink enforcementを1.0 acceptanceにしない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR/acceptance assets（上記）はdata sensitivityの隣接例に限る。6分類語彙と版境界は固定PO/L2から再導出し、1.x Web sinkを前倒ししない。

- **固定親**：`HELIXSECURITY-L2-016` / `MPR-RC-HELIXSECURITY-L2-016-001`、semantic digest `sha256:4b57ed4eccad237ce1a952559682456afa7ec1b4578865c3eac452e8b7bc7392`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L220`（section SHA `sha256:b5ce60587c348e5c055053a1b79187d36ef76a6a816733648a3fc73492ab951c`）、対L11 `40行`（section SHA `sha256:3e3b6e6d56a643ee76b377cbfff5917628782bbee2bf69bf97afd9efe84baea6`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-015 Asset identity。分類の定義ownerはSECURITY。sink enforcementを必要としない。 戻し先: 未分類/unknownはunknownとして保持し、公開allowの根拠にしない。分類意味の変更はL1-016へ戻す。

**L3 acceptance (`SECURITY-AC-016-01`)**：1.0では全6分類を定義し、分類情報と分類記録自身のowner/source/revisionをL2-015 asset identityへ束縛して記録できる。資産由来metadataと分類記録metadataは別に扱う。分類情報または分類記録metadataが欠落・stale、別asset由来と不整合、または分類unknownの場合はunknownとして保持し、public/allowと扱えば不合格。1.xではL2-019/025が各sinkへ分類を適用し、confidential以上を無条件出力しないことを別途受け入れる。1.x条件を1.0完了の証拠にしない。

**対応L11 acceptance**：`HELIXSECURITY-L2-016`。

### SECURITY-FR-020-01 — Guard/Bot責務境界

Injection/Scope/Hook/Secret/Egress/Runtime/Permission/Core Asset Guardの決定的条件をBot不在時も判定可能とし、意味診断Botは必要時、限定目的/authorityで接続する。例示Bot全部を1.0必須化せず、包括writeを与えない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR/acceptance assets（上記）は決定的enforcementと分析の区別に隣接する根拠である。現Guard一覧とBot任意境界は再導出し、旧Bot一覧/runtimeを保持しない。

- **固定親**：`HELIXSECURITY-L2-020` / `MPR-RC-HELIXSECURITY-L2-020-002`、semantic digest `sha256:ff4c66c0065372a575fd0dfef3ac759cad15684d78a0712d7320de383bbe7b80`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L260`（section SHA `sha256:196ce1051902b8e8ca91d8a78998ade4caf3b3fa5cb837fb81b09e72aecb34da`）、対L11 `44行`（section SHA `sha256:e1f35dbf0b682c5116651b9ae56775164928126e546ae8a3b8c7a57448b41fe5`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-008 authority、Worker契約、INTELLIGENCE発行interface。 戻し先: Guard未定義/不適用はenforcementのownerへ戻す。Botがいないことだけで1.0を不成立としない。境界意味の変更はL1-020へ戻す。

**L3 acceptance (`SECURITY-AC-020-01`)**：Injection Guard、Scope Guard、Hook Guard、Secret Guard、Egress Guard、Runtime Guard、Permission Guard、Core Asset Guardの決定的判定をGuard側に置く。Bot候補例のSecurity Audit Bot、Injection Analysis Bot、Core Probe Detection Bot、Supply-chain Review Bot、Security Diagnosis Botはsemantic judgement/diagnosisのため必要に応じINTELLIGENCEへ接続する。候補例は全Botの初版実装・運用を要求しない。Bot不在を理由に決定的制約が抜ける、Botが包括Write権を持つ、候補を全て1.0必須runtimeとするなら不合格。Core Asset Guardの名称を保持しつつ、1.0のGuard基盤とL2-019/025の1.x公開sink適用を別に判定する。名称の列挙だけで完全なasset-specific egress/Web保護を1.0へ前倒しせず、逆に1.0のcredential・一般egress・operation guardを延期しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-020`。

### SECURITY-FR-028-01 — SECURITY pack更新受入

HARNESS descriptorへSECURITY artifact identity/version/digest/dependency range/provenanceとL2-010/013条件を束ね、SECURITY固有accept/reject/unknownを返す。共通pack lifecycle/rollback/unfinished obligationはHARNESS ownerに残す。version_targetは実artifact versionではない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR asset（上記）はupdate/integrityに隣接するのみ。現在の機構間descriptor owner分割に直接相当する旧要件は確認されていない。固定L2-010/013とHARNESS-L2-010/011から再導出。

- **固定親**：`HELIXSECURITY-L2-028` / `MPR-RC-HELIXSECURITY-L2-028-002`、semantic digest `sha256:76740f351c9bad546326e6f322ba4358348f622799a644ad1f4e0372c5ecefb1`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L342`（section SHA `sha256:af3954bd55e6b230bb615ff295c7926ef29c95e3c2cd5954250df0cf022d16b1`）、対L11 `52行`（section SHA `sha256:40bf0c7a90dbac79da072bee458309750676a1e80640dd067becc97cade6b16e`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：SECURITYはartifactのSECURITY固有accept/reject/unknown（provenance、許可、対象version/range条件）だけを所有する。HARNESSは共通descriptor・交換・rollback・未完義務lifecycle、OSはassignment/progression、artifact ownerはartifact identity/sourceを所有する。依存はHARNESS-L2-010/011共通pack契約、SECURITY-L2-010/013、該当artifact owner宣言。戻し先: SECURITY固有の受入軸の意味変更はL1-010、artifact identity/integrityはL1-013、共通pack契約不足はHARNESS ownerへ返し、本unitで補完しない。

**L3 acceptance (`SECURITY-AC-028-01`)**：HARNESS-L2-010/011の共通pack descriptorを入力し、SECURITY更新candidateのidentity/version/artifact digestがdescriptorと一致し、dependency versionが宣言compatibility range内で、provenanceとL2-010/013のSECURITY条件を満たす場合だけSECURITY固有の受入判定を返す。`version_target`は目標版で実版ではない。identity/version/digest欠落、不一致、range外、unknownを通せば不合格。共通交換/rollback/未完義務lifecycleの所有・受入をSECURITY-L2-028の証拠に含めたら不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-028`。

### SECURITY-FR-033-01 — 外部AI Worker context bindingと出力境界

対象は外部AI Worker task dispatch。既存descriptor/assignment/current HEAD/SECURITY authority/rule revisionを同じtask contextへ束ね、L2-008/007成立時は既決有効authorityを再利用して起動する。Workerはassignment-bound隔離で実行。raw secret値またはsecret/機密task内容が外部Workerに露出する場合に限りdeny。一方、credential-use capabilityだけを理由にdenyせず、PO採択P0訂正どおり、raw値を露出しない既存credential capabilityを使うtaskは、既存operation authority・L2-007・egress条件を満たせば通常作業の都度承認なしで起動可。出力だけでauthority/approval/assignment/requirements/verified/canonical stateを作らない。新packet schema/runtime registry/per-task approvalなし。

**版/採択境界**：SECURITY L2/L11の固定親は旧来の f6dad2 ではなく、L2/L11のsource bytesを含むcommit `318ec4a04abb3c1cc17111b3d939f913facd5fd3` の訂正後 -002 revision。PO decisionは別の判断記録で、採択追補を含むdecision fileのfull SHA-256は `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`。このdecision fileの内容はfix commit `7581e0fc5` と固定統合snapshot `633bf12ea8f948db8ba3d6600179c4a9507377a7` で一致する。decision行92/113/124が訂正後L2/L11とP0追加受入digest `sha256:e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6` を固定する。行124の追加受入記録はfull decision fileとは別のraw spanとして確認する。要求本文source revisionと、その採択を記録するdecision revisionを別々にpinする。L2 front matterの旧「未採択候補」文言をauthority根拠にせず、対象revisionとPO decisionを組で読む。credential-use capabilityだけで一律denyするoracleは採らない。

**旧HELIX対応（再利用/再導出/置換）**：旧 `HR-FR-P2-05` はarchive source `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md` line 428（asset `LEGACY-ASSET-02319C2481B9E01698D5`、whole-file SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）および6fabd125 baseline Git path `docs/governance/helix-harness-requirements_v1.3.md:409`（fixed commit `6fabd125`、whole-file SHA-256 `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1`）を別revision atomとして参照する。旧SEC-FR-CAP-007（asset `LEGACY-ASSET-B62E49D2E156232B8C63`、旧L3 path/SHAは上記）は理由receiptに全failure reasonを記録する点だけの形式上の類似で、credential-use/Worker dispatch意味の根拠にはしない。2 source atomを統合せず、holdingを変更・解除しない。採択sourceは固定L2 registration `MPR-RC-HELIXSECURITY-L2-033-002`。PO decision fileの採択revisionはfix commit `7581e0fc5` と統合snapshot `633bf12ea8f948db8ba3d6600179c4a9507377a7` の両方でfull SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`。decision行92/113/124は同じfile SHA内にあり、行124のP0追加受入digestは `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`。訂正source pinは別spanとして扱う：L2 `security-requirements.md:479-485` raw SHA `15c0ea7827a41bd6bca6ba2b0fb70597ad1e9a9d27b5073687b2b41745fdc6df`、L11既存033節 `security-acceptance.md:124-133` raw SHA `6d83abe63e3e852d58d9a9a60ae39c6b29284b6b8ab781bdb86456e479e60be0`、L11追加P0補足 `145-151` raw SHA `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`、PO decision追加受入行 `:124` raw SHA `a24ae9b3400a40b478dddcfe3374a6df602b807cb0803973faeac44f6872b35f`。旧「secret task deny」の文言だけでは認証済みcredential-useの扱いを確定できず、採択済みPO追補が訂正後の範囲を定める。訂正前の未採択表現を有効なoracleとして使わない。

- **固定親**：`HELIXSECURITY-L2-033` / `MPR-RC-HELIXSECURITY-L2-033-002`、semantic digest `sha256:b486a0c44e8f21a6f8738dedeac91dcb94da335b73409b6adeaecf8fa639bf1a`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L455`（section SHA `sha256:ccb516e4eb6e0943e7d634e359a45370eabc31c597daa3fc5afb790895461004`）、対L11 `124行`（section SHA `sha256:437651116a0b5571759c217733ee29a93ae4d4ae3b35bdb5f0377f1352186659`）。要求L2/L11 source commitは `318ec4a04abb3c1cc17111b3d939f913facd5fd3`。PO decision fileの採択revisionはfix commit `7581e0fc5` と統合snapshot `633bf12ea8f948db8ba3d6600179c4a9507377a7` の両方でfull SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`。対象decision行92/113/124は同じfile SHA内にあり、行124のP0追加受入digestは `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`。追加採択補正のsource pinは別spanとして扱う：fixed revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3` のL2 `security-requirements.md:479-485` raw SHA `15c0ea7827a41bd6bca6ba2b0fb70597ad1e9a9d27b5073687b2b41745fdc6df`、L11の既存033節 `security-acceptance.md:124-133` raw SHA `6d83abe63e3e852d58d9a9a60ae39c6b29284b6b8ab781bdb86456e479e60be0`、P0補足 `145-151` raw/PO採択追加受入digest `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`、PO追加受入行 `po-decision-2026-09-29-57candidates.md:124` raw SHA `a24ae9b3400a40b478dddcfe3374a6df602b807cb0803973faeac44f6872b35f`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：OSはassignment/progression、Worker環境ownerは実行隔離/enforcement、SECURITYはauthorityとcredential/egress条件、HARNESSは共通task contract/証拠交換を所有する。CONNECTは伝送結果を所有するが送信authorityを生成しない。依存は既存assignment、L2-005/006/007/008、HARNESS共通契約に限る。bindingが欠落/unknown/stale/不一致ならdispatchを停止し、対象revisionと不足をOS assignment ownerへ返す。policy意味の変更は該当SECURITY L2 ownerへ戻す。

**L3 acceptance (`SECURITY-AC-033-01`)**：主Workerの通常taskに、追加runtimeだけを対象とするL2-029のopt-out/public-only条件やL2-031のproposal-only/canonical no-access条件を本要件だけで課さない。選択した追加runtimeではL2-029/031と既存L2-005/006/007/008の条件を同時に適用する。各taskでは対象assignmentのWorker descriptor、dispatch時HEAD、既存authority、規則revision、task boundaryが一致し、適用されるL2-007制約を確認する。Worker version/config変更、target変更、規則revision変更、authority revision変更、assignment scope変更をそれぞれ独立に与え、各変化で以前のbindingを流用せず該当scope・revisionを再照合する。互換性が確認できない場合はunknown/denyとして対象dispatchを止め、既存OS assignment ownerへ返す。新しい固定schemaや別の承認者を補作しない。raw secret値またはsecret/機密task内容を渡す場合は拒否する。一方、PO採択P0訂正に従い、既存operation authorityと非公開・範囲付きcredential-use capabilityを使い、適用されるL2-007と該当egress条件を満たすtaskは、credential-useだけを理由に一律denyせず追加の毎回承認なしで起動可能とする。SECURITYがassignmentを決める、OSがauthorityを決める等のowner代行、または有効な既決authorityへ都度の人間承認を追加する変異は不合格とする。Worker出力単独からauthority、承認、assignment、要求状態、verified、canonical stateを生成しない。別の無関係taskを一律停止しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-033`。
