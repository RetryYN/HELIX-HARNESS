# HELIX-SECURITY L3 機能要件 — Stage 1（19親の候補）

> 状態：L3要件の起草候補。L3承認、実装方式確定、実行・配布許可、受入結果を表さない。本書はHELIXSECURITY-L2-001〜016、020、028、033の19 identityだけを対象とする。

## 適用・authority・版境界

SECURITYは全操作にoperation-specific authority境界を適用し、有効な既決権限を再利用する。通常作業の毎回の人間承認を追加しない。既存authorityのactor/target/operation/revision/environment/scope/expiryを照合し、missing・mismatch・expired・unknownは既存L2契約どおりdeny/holdする。L2-009は該当scopeのrecipientへの停止伝播を保つ。L2-033は採択訂正版の適用範囲内で有効なscoped credential-useを認め、raw secretやsecret/機密task本文の露出を許さず、Worker出力からauthorityやstateを生成しない。

Stage 1だけを切り出す。L2-015はasset identity基盤、L2-016は分類記録、L2-020は決定的Guard基盤、L2-033は採択MPR `-002`と別pinされたP0追補の範囲を保つ。後続Web条件、1.x sink/publication enforcementを1.0へ前倒ししない。hold/reject親、Stage 2cの031、他Stageのidentityをこの文書へ含めない。技術値は根拠付き候補であり、parameterごとのPO承認を作らない。要求の意味・scope・owner・versionを変える場合にだけL2へ戻す。

## 旧HELIXからの対応と差分理由

旧HELIXのL3を形式・意味分類の起点として読み、下の親別paragraphに再利用/再導出/置換を記録する。旧L3工程定義（`root/docs/process/forward/L00-L06-design-phase.md` lines 148–168）にあるFR+AC、3 sub-doc、L10 pairの形式を起点とし、旧HELIXと旧HARNESSのL3 READMEに残る層番号・UX pair・G3 gateを現行L3/L10へ再導出する。assetのhistorical ledger statusは変更しない。旧IDを現行IDへ機械転用せず、旧G3 freeze、旧approval authority、runtime、CLI、test、旧数値は移植しない。各SECURITY意味は採択済みL2/L11から再導出する。

固定親は各section SHA・固定revision・採択decision rowで特定する。18 parent（001–016/020/028）のPO採択decisionは `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、revision `49318f1f1de5810dfc61fdfe3a2565b86509009d`、full-file SHA-256 `7ad58a3f7d7dd68806e6eeb2c4b6ec97f9b8f2145ae9aae7969f1eedf4a7baff`。各identity行のraw LF inclusive SHAを次に示す。L2/L11本文固定revisionはこのdecision fileのrevisionとは別である。親033は後段の別decision pin（7581e0fc5 / 633bf12、採択MPR `-002`とP0補足）に従う。

| parent | decision row | row SHA-256 (LF inclusive) |
|---|---:|---|
| `HELIXSECURITY-L2-001` | 39 | `1694c5336f3dde12ecb8bbbcc705e59cf0de534d9818ca3aa9d0b598f355c671` |
| `HELIXSECURITY-L2-002` | 40 | `9ed6502099ca34fe48404363a7dad64a6642819a5a59b39cb7341e12f429b97e` |
| `HELIXSECURITY-L2-003` | 41 | `f9cfd2c09986ba079f2ae1d769967f297449e6ea725a1c83a7a5aaa1c0edbf0a` |
| `HELIXSECURITY-L2-004` | 42 | `921e9e0570c7d7297fae453d0e7dfaf5ab385d4893b1ec9b29a52935a549d27a` |
| `HELIXSECURITY-L2-005` | 43 | `39163f6602d9d9794fad41dffc1c10619f517063a22f9d5dfb9f3b118b9356d5` |
| `HELIXSECURITY-L2-006` | 44 | `ac98c4ab1162bf2fa7633422c5f6db09f776b8dc9f151b1b2138d6c46810b60b` |
| `HELIXSECURITY-L2-007` | 45 | `dd76bccbc42fbb41c68b5b47042d5ba595311af9fd37c15b64f606c165a59ca8` |
| `HELIXSECURITY-L2-008` | 46 | `9e57fb5d91284a753d6e237d4bc0ae28eff9dfab0890e889ca53fb624c3b0d0a` |
| `HELIXSECURITY-L2-009` | 47 | `c1b7c98cc2bfebae86a60bdefc9890a37218d80bfa92e50ecbb3b164ce3057ea` |
| `HELIXSECURITY-L2-010` | 48 | `2c9fa8975b8130cb39bfef2fbdce1207e7458eb310cacb797e4e5a7b1dc89f8c` |
| `HELIXSECURITY-L2-011` | 49 | `1300ce4fc99d51bbdcf8ef1ca9817222bb63748249a92dc479056852d8190204` |
| `HELIXSECURITY-L2-012` | 50 | `e2550180acfa2e7d9917908f35a6499f7187f100afe134acdb62bc66c6fc8af5` |
| `HELIXSECURITY-L2-013` | 51 | `50b032874c7c58dad8b5ab8844ff8c833a3a7f0cea8d500e37576dbcc1f4d183` |
| `HELIXSECURITY-L2-014` | 52 | `0b9185889c45812908334959d396a0075baa0d56b586c9652f5d6630158e6cf1` |
| `HELIXSECURITY-L2-015` | 53 | `85a043fb1220ea99dcd00c18749e082b724478fe9fd352412adfcd2b4bdc184a` |
| `HELIXSECURITY-L2-016` | 54 | `1a49a8025778d70bad7cb0f411adfcb54198d5f70dc80f069d2441d5439c44cf` |
| `HELIXSECURITY-L2-020` | 58 | `936009544f55cf61502a3832013b4ed4b218576628bb45e79f28666cf7643750` |
| `HELIXSECURITY-L2-028` | 66 | `abb2a405512392005f8baf77c854cdf330e1864da13e346d70db24623e8d7cec` |

`LEGACY-ASSET-EE5DBACC7F28F7D1F605`は台帳revision 1の旧source assetであり、2026-10-03のR2289-02訂正対象ではない。訂正対象はregister rows 728/729/912の3候補で、`HELIXSECURITY-L2-001`の`MPR-RC-HELIXSECURITY-L2-001-001 → -002`（semantic digest `sha256:97997b9023ac5291a30cfdb263b0997209e76dfd6ce7378cf6a914da57948d8f`）、`HELIXSECURITY-L2-002`の`MPR-RC-HELIXSECURITY-L2-002-001 → -002`（`sha256:59b12bbafd3c6aee62a08839e8a56826e28609495422bf5eaa484fe427935700`）、`HELIXSECURITY-L2-003`の`MPR-RC-HELIXSECURITY-L2-003-002 → -003`（`sha256:dc222ffbcdf2511878e805ad26239b4c5d9dd3c9d1a67982b48aee12f2fb8132`）である。各旧/後継registration pairでcandidate semantic digestは同一で、訂正はmetadata/pathのみ。過去の訂正監査は書き換えず、訂正履歴を新しい監査記録に残す。固定sourceの全体SHAは共通値として一度だけ記録する。f6dad2aのL2は`027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11は`25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

| 旧source（archive相対path） | asset / source SHA-256 / 行 | Stage 1での処置と変更理由 |
|---|---|---|
| `root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605`; `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`; HR-FR-P8-04 171のみ、HR-NFR-P8-02 186 | raw input/trusted metadata/instruction分離の部分再利用。対象・owner・classificationを現L2に沿って再導出。旧P8の全scopeを引き継がない。 |
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

**旧HELIX対応（再利用/再導出/置換）**：旧pillar L3のHR-FR-P8-04（旧path `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` line 171のみ、asset `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）とHR-NFR-P8-02（同path line 186）を起点にraw input/trusted metadata/instructionの分離を部分再利用し、現L2のsource/project/revision/classificationへ再導出する。旧CAP-001〜007はこの要件への直接対応とみなさない。

- **固定親**：`HELIXSECURITY-L2-001` / `MPR-RC-HELIXSECURITY-L2-001-001`、semantic digest `sha256:97997b9023ac5291a30cfdb263b0997209e76dfd6ce7378cf6a914da57948d8f`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L70`（section SHA `sha256:0c2fd43eba36ca1461dc40e9e91b390df36fbee51226643a52cab6ec042928e9`）、対L11 `25行`（section SHA `sha256:8e22198c3258b212cf56135925e1e6b000c1b937da6e2bf1add8a0133c51a446`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：Conceptのdata-use classification・isolation foundation、source identityを受け、各入力にsource・project・revision・classificationを保持する。AI生成物も他の入力と同じくuntrustedとして扱い、classification欠落/unknownを未信頼・unknownのまま示す。固定L2が要求する既存HARNESS/OS外部data境界との重複ownerを識別し、接続候補として渡す。戻し先: 入力の意味や昇格条件が不足・矛盾ならL1-001/L1-002候補へ戻す。下流の接続先はunknownのまま保つ。

**L3 acceptance (`SECURITY-AC-001-01`)**：外部文書、Issue/PR、Web/MCP/Tool出力、AI生成物を含む各入力source種別にsource・project・revision・data classificationを記録し、未信頼dataとして残す。分類不能のfixtureではunknown/untrustedと判定し、その状態を出力する。明示昇格経路がある正例はその経路と昇格先を判定情報に示し、read-only閲覧の結果とauthority作用の結果を別々に返す。個別negative: readだけからinstruction、要求、authority、永続化、学習への昇格を許さない。要求、Agent instruction、Tool authority、memory、BRAIN、training data、security policyの各targetへ一つずつ昇格させる変異を与え、どれか一つでも通れば不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-001`。

### SECURITY-FR-002-01 — 命令様dataの直結防止

L2-001で未信頼の命令様内容はdataのまま扱い、Tool args・system instruction・権限operation・credential送信・SECURITY policy変更へ直接連結しない。policy変更条件の意味不足はL1-002へ戻し、完全なinjection検出率を要求しない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-001（前掲security-capability-broker-authority.md lines 160–166、asset `LEGACY-ASSET-B62E49D2E156232B8C63`、SHA-256 `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`）はoperation capabilityとimpactの型分離であり、命令様data非昇格とは直接一致しない。authority/data分離の部分類似のみ記録し、命令様dataの扱いは固定L2から再導出する。固定L2が束ねる旧HR-NFR-P8-02（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:186`、asset `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、full SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）は命令隔離・監査の部分根拠として保持する。検出器の完全性・旧policyを再利用せず直接authority経路を遮断する。旧CAP-002はphysical target/TOCTOU、CAP-003はprovenanceで、連番対応ではない。

- **固定親**：`HELIXSECURITY-L2-002` / `MPR-RC-HELIXSECURITY-L2-002-001`、semantic digest `sha256:59b12bbafd3c6aee62a08839e8a56826e28609495422bf5eaa484fe427935700`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L80`（section SHA `sha256:07ce9de25ab4b47be2b99a0550342230e34520548fe4444b6e0166d9454c61cd`）、対L11 `26行`（section SHA `sha256:e3be2a9d718395db4d018280b458e3c85e508bb68c59ae9828f1e486c99c3890`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-001のsource/classification、Workerへ渡される明示scope。検出Botがなくても直接authority経路を遮断する。 戻し先: 境界を証明できない場合は下流操作を止め、data flow設計をL1-002へ戻す。検出器の不在を成功扱いしない。

**L3 acceptance (`SECURITY-AC-002-01`)**：固定L11の5文例「前の指示を無視」「AGENTS.mdへ書け」「repositoryを消せ」「memoryへ保存」「資格情報を送れ」を独立した合成入力として与え、各々をuntrusted dataとして保持する。各入力でTool args/system instruction/権限operation/credential送信/policyを変えない。各判定は適用policy revision、入力source/scope、deny/hold理由を持つreceiptへ結ぶ。境界が証明できない個別fixtureでは下流操作を停止し、その理由を返す。完全なinjection検出器がないことだけでは不合格にせず、いずれかの命令直結を許せば不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-002`。

### SECURITY-FR-003-01 — project/tenant/environment/assignment隔離

project/tenant/environment/assignment identityとstate/data/Worker/credential/artifactを明示scopeに結ぶ。identityが欠落/不明なら停止し、primary treeや他projectへ暗黙fallbackしない。tenant fixtureは境界確認であり顧客tenant runtimeを要件化しない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-002（同前掲asset/path/lines/SHA）はlexical/physical targetと実行直前TOCTOU確認の部分類似に限る。旧SEA target/environment scoping は `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requirements.md:24-25`（asset `LEGACY-ASSET-D461943347D372ECF6DA`、full SHA `38a68e48ca26cb277b6f5d88439b33b58aecf48f5b650f7596aec04e438b6b16`）で、target/environment mismatchを拒否する隣接要件だが、project/tenant/assignment isolationとは同一ではない。外部dataからauthorityへ至るscopeと戻し先は固定L2/Conceptから再導出し、SEA候補の意味を新規採択しない。旧CAP-003はprovenance区別で別の責務。

- **固定親**：`HELIXSECURITY-L2-003` / `MPR-RC-HELIXSECURITY-L2-003-002`、semantic digest `sha256:dc222ffbcdf2511878e805ad26239b4c5d9dd3c9d1a67982b48aee12f2fb8132`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L90`（section SHA `sha256:2d800eaf8c98669fc8f890559d4405efcd1b3d8855de573b59b70e7961541475`）、対L11 `27行`（section SHA `sha256:e68fcbc6750f2ce1d0508fccde5f97dfb9175e7e622cb22fc3b0d80817589eb0`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：OSからassignment/project identity、INFRASTRUCTUREから実環境identity、CONNECTから宣言済み接続identityを受ける。各機構は自分のstateを正本として保持する。 戻し先: identityが欠落、衝突、不明なら操作停止。identity構造の不足はL1-003へ、物理環境の不足は接続要求でINFRASTRUCTUREへ戻す。

**L3 acceptance (`SECURITY-AC-003-01`)**：各fixtureでproject、tenant（適用される場合）、environment、assignment/worktreeを個別に変異し、state、Agent、Hook、credential、memory、artifact、Worker、execution targetの参照が明示scope内に限られることを確認する。明示接続のないproject越境、primary-tree fallback、staging→production越境、別worktree作用、state/Agent/Hook/credential/memory/artifactの各resource越境を別々に試す。操作に適用されるtenant identityがあるのに照合を省略したfixture、identity collision、欠落/衝突/unknown identityも個別negativeとし、全て停止する。fixtureごとに変異するscope fieldは一つだけとし、他project/他environmentの正常対照例では明示接続内を許可する。tenant軸がない環境で顧客tenant runtimeを作らない。

**対応L11 acceptance**：`HELIXSECURITY-L2-003`。

### SECURITY-FR-004-01 — Agent/Hook/config integrity

project/root/HEAD/revision/digest/owner/scopeに構成を束ねる。stale、未知、他project構成を採らず、不足値を既定値で埋めない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-002（同前掲asset/path/lines/SHA）のTOCTOU再確認はstale/変更済み対象を通さない部分類似に限る。旧CAP-004はclassification/sink分離であり、構成revision項目とは直接一致しない。現在の構成項目は固定L2から再導出し、旧config形式を移さない。

- **固定親**：`HELIXSECURITY-L2-004` / `MPR-RC-HELIXSECURITY-L2-004-001`、semantic digest `sha256:58e9e513e934ff3c1ed8da378b05fcc7fdd3e2a27a503feb449bc7a305812d20`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L100`（section SHA `sha256:1373d55273872771775be0d6f770431d2675d52f23af0606989503eedeb0bc44`）、対L11 `28行`（section SHA `sha256:bd5cd1a6e0d604302743a36686d93c13fc57e95e62c48bbb64a17edc742911c5`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-003のidentityと、構成sourceのrevision/digest。Ownerが不明ならその不明を維持する。 戻し先: 対象のowner/scopeが不明ならL1-004へ戻し、実行を停止する。承認のない構成を推測採用しない。

**L3 acceptance (`SECURITY-AC-004-01`)**：全10構成種別（AGENTS.md、CLAUDE.md、Agent定義、Hook、Skill、MCP設定、runtime設定、Sandbox方針、system instruction、model設定）をそれぞれ独立fixtureで識別し、正しいproject/root/HEAD/revision/digest/owner/scopeだけを候補として返す。source revisionを含む各identity field、revision、digest、scopeの単独欠落/stale/別project変異を試し、内容差分とauthority差分を分離して示す。owner unknownはunknownのまま出力し、欠落をdefaultで補わない。未知Hook/config、stale revision、他project由来設定、revision欠落を受け入れたら不合格。Concept構成版の識別と切戻し候補のsource/revision/evidenceも同じ比較結果に記録し、意味の決定は行わない。

**対応L11 acceptance**：`HELIXSECURITY-L2-004`。

### SECURITY-FR-005-01 — Credential/Secret境界

raw secretをAI context/log/artifactへ出さず、credential storeをWorkerへ直接公開しない。credentialのsecret/non-secret分類は固定L2-005が指す単一のcanonical classifierを使い、各消費者が独自分類を作らない。利用をactor/operation/target/environment/scope/expiry/目的に限定し、検査/revoke状態を扱う。値の混入・漏えいは停止。

**旧HELIX対応（再利用/再導出/置換）**：旧 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/architecture.md:61–64`（asset `LEGACY-ASSET-99C939E249CAF40935CB`、source full SHA-256 `f4b9fcb98b4250879955f6eca0f2916dc1a27046820a8ad687e8f816b856bea2`）にはSECRET_PATTERN / isSecretLikeを機能moduleから分ける単一正本の設計がある。旧CAP-004（data classificationとsink authority分離）・CAP-005（exact target/action binding、前掲asset/path/lines/SHA）は限定的な部分類似であり、現credential store/use/revoke契約に一致しない。Capability Leaseは旧archive全体の検索で該当sourceを確認できず、現行の出所は `docs/governance/decisions/capability-lease-bootstrap-approval-2026-09-20.md`（fixed 633bf12 full SHA-256 `536ac2b9b6d68430fc5f04863735ce87041cf25fa5ba7c06d978690a3a454388`）である。固定L2が明示するsecret predicate一元化とCapability Leaseのscope/expiryをFR-005依存として保持する。旧実装を再利用せず、現L2のcredential classifier identity/revisionと有効scope/expiryから再導出する。

- **固定親**：`HELIXSECURITY-L2-005` / `MPR-RC-HELIXSECURITY-L2-005-001`、semantic digest `sha256:8e8689912796e8fb3e22210619cb1283f6b27ab1804353dfa93fe43eec10a784`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L110`（section SHA `sha256:5eccc4d1683c144c57800071294756713aff52f78db467382665002c8ed39cad`）、対L11 `29行`（section SHA `sha256:19f3e8c523ec522f35982ed3837c21fb6c22623c587d17fd7ae6bad1f6a3f107`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-008 authority、L2-006 egress、Worker境界L2-007、INFRASTRUCTUREの安全な実資源境界。 戻し先: 欠落scope、期限切れ、未知のcredential class、検査不能はdeny/stop。方針の不足はL1-005へ、保存・注入境界はL2-024へ戻す。

**L3 acceptance (`SECURITY-AC-005-01`)**：全credential consumerは同一canonical secret classifier identity/revisionと判定を参照する。repositoryへのsecret混入（file一般へ言い換えない）、直接Worker store露出、egress漏れ、値入りreceipt、consumer別classifier作成/不一致は独立negativeにする。未知のcredential classと検査不能状態も別々に与え、いずれもdeny/stopする。通常positiveはactor・operation・target・environment・scope・expiry・purposeが既存条件に一致した非公開capability useとし、生値はcontext/log/artifactへ現れない。expired/revoked後続利用を個別に止める。purposeはL2-005 credential-use requestの入力であり、L2-008の7要素authority tupleの一部とは記述しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-005`。credential request（固定L2-005）のactor/environmentを、既存L2-008 tupleと照合し、purposeは固定L2-005 request inputから受け取る。purpose欠落はdeny/unknownとし、L2-008 tupleに含めない。

### SECURITY-FR-006-01 — Network/egress境界

送信元/destination/protocol/endpoint/path/classification/bytes/purpose/authority/expiryを照合し、明示許可された範囲のみ送る。unknownはdeny。定量上限を新設せず、L2-019/Core Asset Guardと1.x sink enforcementを1.0へ前倒ししない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-004（同前掲asset/path/lines/SHA）のdata classificationとsink authorityの分離は本要件の直接的な部分根拠である。egress scopeは固定L2から再導出する。旧CAP-006はruntime surface coverageであり、この要件への根拠ではない。asset別Web sink/publication policyは1.0へ含めない。

- **固定親**：`HELIXSECURITY-L2-006` / `MPR-RC-HELIXSECURITY-L2-006-001`、semantic digest `sha256:8bcb8c56772c18c8afb3bbd016cade4511da47533cbc39cb0f775860fe4bbee3`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L120`（section SHA `sha256:09459643b100dbe79ef0cf47100a4b56834d975ef309322bc3f8d7f4055d888a`）、対L11 `30行`（section SHA `sha256:a910c8b1352414d2e6e3ad39f093a936f19b8a3c353411eeefa7a877fba3f7e7`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-005のsecret検査、L2-016の1.0分類基盤（data-use classificationとasset exposure classの記録だけ）、CONNECTの論理接続、INFRASTRUCTUREの実network経路。L2-019のCore Asset Egress GuardとL2-016の1.x sink enforcementは依存に含めない。 戻し先: 宛先/分類/目的/authorityがunknownならdenyし、方針の意味差はL1-006へ戻す。物理経路の不明はL2-024へ。

**L3 acceptance (`SECURITY-AC-006-01`)**：送信元、destination、protocol、endpoint/path、data class、bytes、purpose、authority、expiryを個別に照合し、許可一覧・operation判断・計測値・data-minimization結果を返す。既知でもscopeだけ不一致、purposeだけ不一致、authority tupleだけ不一致の変異を互いに独立して与え、全てを拒否する。source identity欠落もnegativeにする。明示許可された別source/destinationの正常例は通す。unknown classification/purpose/authority/expiry、vendor privacyだけの根拠では送信しない。物理network path unknownはL2-024へ戻す。送信量上限を追加しない。L2-019/1.x sink enforcementは1.0の必須条件にしない。

**対応L11 acceptance**：`HELIXSECURITY-L2-006`。

### SECURITY-FR-007-01 — Worker実行環境への制約適用

path/network/credential/environment/timeout/resource/diff/rollback/result collection等の既存SECURITY制約をOS assignmentに基づき実行環境へ渡し、適用/観測を示す。制約の出所・値はSECURITY policy revision、実行適用ownerはWorker実行環境、物理適用の観測ownerはINFRASTRUCTUREとする。適用不能はunknown/停止、host fallback禁止。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-006（同前掲asset/path/lines/SHA）はruntimeごとのhook/sandbox coverageとunsupported時のhost fallback禁止を扱い、未適用時に停止する点だけ部分類似である。旧CAP-007はcanonical safety failureをlegacy greenで相殺せずreason receiptへ残す要件で、Worker制約適用とは別である。worker constraintsは固定L2から再導出し、旧Runner/Sandboxを復帰させない。

- **固定親**：`HELIXSECURITY-L2-007` / `MPR-RC-HELIXSECURITY-L2-007-002`、semantic digest `sha256:1ee4d42a1e4178d598ce11b75268845578ba83bcb8ea471e2642ff8630c49504`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L130`（section SHA `sha256:052c634e25dff6bd1cba742d240f87d07c6d395852e994414522e4fcd243f210`）、対L11要約表 `31行`（section SHA `sha256:bb6dc9697c4bc21ad94cce4f2ad97c796706327d33686858eed1831378b4c155`）、詳細な9制御受入 `69–87行`（network `76行`、resource `80行`、rollback `82行`、result collection `83行`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：Concept/Worker実行契約、OS assignment、INFRASTRUCTURE実資源、L2-003/005/006/008。旧Runner/Sandbox actorを復活させない。 戻し先: 未適用/未観測/unsupportedは実行停止・unknown。SECURITY方針不足はL1-007、物理enforcement欠落はINFRASTRUCTURE接続の候補へ戻す。

**L3 acceptance (`SECURITY-AC-007-01`)**：各9制約（write path、network、credential、environment、timeout、resource、diff検査、rollback、result collection）について、SECURITY policy revision上の要求値がWorker実行環境に届き、適用と実適用観測を区別する。出力に停止可否・rollback可否・再開可否を含め、再開可否unknownなら再開しない。read-onlyというlabelだけで変更後観測を省かず、拒否receiptに内容やsecretを露出しない。1制約欠落/unknownを他制約のgreen/receiptで相殺したら不合格。具体の変異とownerはL10の9制御表に対応する。

**対応L11 acceptance**：`HELIXSECURITY-L2-007`。

### SECURITY-FR-008-01 — 操作ごとのauthority

actor/target/operation/revision/environment/scope/expiryが一致するoperation別判断と理由を返す。read/write/execute/network/install/delete/merge/release/deploy/credential-use/security-changeを包括権限にまとめない。

**旧HELIX対応（再利用/再導出/置換）**：旧source `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md`（asset `LEGACY-ASSET-B62E49D2E156232B8C63`、全体SHA-256 `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`、関連CAP lines 160–166）およびtest asset `LEGACY-ASSET-170112AB2FA2FFDBFEE9`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md` lines 1–59、SHA `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4`: typed tuple/negative fixtureは部分的な前例である。旧runtime/testは実行しない。

- **固定親**：`HELIXSECURITY-L2-008` / `MPR-RC-HELIXSECURITY-L2-008-001`、semantic digest `sha256:6135842a799b9883cb29c5ce9e6ffcf601997d66cb3d314c8031ba9cbbae9f2c`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L140`（section SHA `sha256:e00f26365cfbe64a4ee8369a9f6001ca4f1fb6f7f933b8055dd6ea47f0019d59`）、対L11 `32行`（section SHA `sha256:05d6af862333dd496de98c2f469b6e50a9d2817442b7b1c83c93ac9348821a25`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-003 identity、L2-004構成integrity、L2-005 credential、L2-006 egress、OSの進行。 戻し先: 未認可、drift、expiry、unknownではdenyし、意味の変更はL1-008へ戻す。停止伝播はL2-009/022で検証。

**L3 acceptance (`SECURITY-AC-008-01`)**：read、write、execute、network、install、delete、merge、release、deploy、credential-use、security-changeの11種を別々のoperation fixtureとして入力し、actor/target/operation/revision/environment/scope/expiryが一致したoperationだけを判定する。各結果はallow/deny/constrainと判断理由を返す。read authorityから残り10 operationへの各単独置換を拒否し、Agent利用権から包括write/deployを生成しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-008`。

### SECURITY-FR-009-01 — revoke/quarantine伝播

対象trigger/identityをOS assignment・Worker環境・CONNECT・credential/artifact accessの該当ownerへ相関可能に渡し、recipient別受領/適用/未達/未観測を分ける。SECURITYはpolicyとtrigger conditionだけを返し、各機構のstate変更・実行を代行しない。隔離は復旧可能な前状態identityを保持したうえで行い、隔離/復旧不能ならsuccessとせずrecovery/unknownへする。unknownを対象operation/risk scope内に制限する。固定L2に数値latencyがないため上限NFRは作らない。

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

**L3 acceptance (`SECURITY-AC-010-01`)**：source code、dependency、package、plugin、MCP、Skill、Agent definition、Hook、runtime config、sandbox policy、model、model weights、prompt/system instruction、Connector、infrastructure configurationの15対象それぞれについて、provenance、digest、dependency/permission/network/credential/hook-config差分、新規実行物、credential差分、hook-config差分、known finding、rollback情報が揃い採否と根拠を追える。単に新version、または欠落情報をunknownのまま採用したら不合格。

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

**L3 acceptance (`SECURITY-AC-012-01`)**：package/container/GitHub repo/MCP/plugin/Skill/Agent/model/binaryでsource、producer、version、digest、dependency、permission、network、known risk、update delta、rollbackを辿れる。不明なsource/producer/version/digest/dependency/permission/network/risk/update/rollbackのfieldはfield名とunknown状態を結果へ列挙し、unknownのままtrustedへ昇格したら不合格。これは1.0 provenance traceであり、後続版のCore Asset Guardやsink protectionの完成を要求・証明しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-012`。

### SECURITY-FR-013-01 — Artifact identity chain

生成/build/validation/配布/実行artifactのidentity/version/digest/provenance/producerを同じ鎖で照合する。欠落/mismatchで昇格を止める。digest一致だけでsource authorityやverification passを推定しない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR/acceptance assets（上記）は受入chainの隣接根拠に限る。artifact chainは現L2から再導出し、旧CI/runtime/testの実行や合格を主張しない。

- **固定親**：`HELIXSECURITY-L2-013` / `MPR-RC-HELIXSECURITY-L2-013-001`、semantic digest `sha256:e6daf304f8d09b86237dde6dfb2ec99029673ef920dcbd3538c56b449edeee3e`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L190`（section SHA `sha256:b5c2034525a6fd4314a2e5d3596fa812466e648c92080ca78883870945deda56`）、対L11 `37行`（section SHA `sha256:e775685b309e83121aca7eef7ac3116926920b447650fca4f1fe2a099ed03c97`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-010/012の更新・provenance、HARNESS verification receipt、OS promotion record。 戻し先: identity/digest mismatch、missing stepは昇格停止。意味や必要なidentityが不足ならL1-013へ戻す。

**L3 acceptance (`SECURITY-AC-013-01`)**：build/validation済artifactのidentityと配布/実行artifactのidentity・digest・provenance・producerが同じ鎖で一致する。producerの単独欠落/不一致は他fieldで補完せずunknown/rejectとする。異なるartifact、欠けた工程、digest不一致が昇格可能なら不合格。digest一致だけからsource trustやverification passを推定しても不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-013`。

### SECURITY-FR-014-01 — SECURITY永続化promotion判定

SECURITY単体としてmemory/training dataset/BRAIN knowledgeの3 target class別にsource/provenance/classificationからallow/deny/holdと理由を返す。機構横断handoff、LABO評価、BRAIN登録、保存実行は含めず、end-to-endはL2-027に委ねる。

**旧HELIX対応（再利用/再導出/置換）**：現行HELIXSECURITY-L2-014として採択済みの意味を要件化し、新しい上流要求を追加するものではない。旧SECURITY L3 broker、旧pillar L3 functional requirements（HR-FR表、特にP8領域）とそのacceptance、旧L3 test-designを検索範囲とし、memory/training/BRAINへのSECURITY単体判定という同一契約は見つからなかった。形式上の近接点はpillar L3 HR-FR-P8-04（旧path `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` line 171のみ、asset `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）および旧CAP L3全体（asset `LEGACY-ASSET-B62E49D2E156232B8C63`、SHA-256 `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`）だが、直接継承ではない。対象3 class/判定/非保存境界は採択済みL2/L11から再導出する。

- **固定親**：`HELIXSECURITY-L2-014` / `MPR-RC-HELIXSECURITY-L2-014-002`、semantic digest `sha256:6acd2e5b89cc44bfbd70f4d545f666ee51fe356dcb59f7c6c985107f463a1276`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L200`（section SHA `sha256:bed52b952b89788736c7d8615f561b0eda6b08c5c7979f6fa7a834d86491887c`）、対L11 `38行`（section SHA `sha256:2e34f6860f09a6b70cc6e1d36e2cbdf122e4c26168d3f7528983abde1e10957f`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：SECURITYは3 target classごとのsource/provenance/classification判定と理由付きdecisionだけを所有する。入力metadataは各source owner、memory/training/BRAINへのhandoff・保存は各target owner、業務上の保存可否意味はL1-014のownerが正本を持ち、LABO評価とBRAIN登録を本unitに含めない。依存は固定L2-014に明記されたL2-001/002のsource trustとL2-015/016の1.0 identity/classification入力であり、1.x sink enforcementは含めない。provenance/classification欠落はhold/denyし、genericなsource owner宛先を新設しない。判定対象・意味の変更はL1-014へ戻す。機構横断handoff/resultはL2-027の責務へ残し、単体L2-014から完了を生成しない。

**L3 acceptance (`SECURITY-AC-014-01`)**：SECURITY単体のdecision tableへmemory、training dataset、BRAIN knowledgeの3 target classを個別に入力し、L2-001/002に基づくsource trustと、L2-015/016のidentity/classificationを照合する。source/provenance/classificationが欠落・unknown・target不一致ならhold/denyし、理由付き判定を返す。Memory poisoning、Prompt Injection persistence、training contamination、BRAIN contaminationにつながる入力も該当target classの判定理由として識別し、単体判定から保存・機構横断受渡しを主張しない。Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINの機構横断受渡しや保存成功をこの単体試験で主張したら不合格。L1-014の構成体kindと3経路の成立はL2-027だけで受け入れる。

**対応L11 acceptance**：`HELIXSECURITY-L2-014`。

### SECURITY-FR-015-01 — Asset identity基盤

列挙資産および列挙外資産に対してowner/identity/source/revision/digestを識別し、内容dumpなしで追跡可能にする。1.0はidentity基盤、Web実利用保護は1.x。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR asset（上記）はcore asset/provenanceに隣接する根拠に限る。現在のHELIX資産一覧はPOを起点に再導出し、包括的保護scopeを引き継がない。

- **固定親**：`HELIXSECURITY-L2-015` / `MPR-RC-HELIXSECURITY-L2-015-001`、semantic digest `sha256:6307d5833296e0c438401e8a4a11221a601da0c1389bd813cfb4641fee114a6a`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L210`（section SHA `sha256:40e3bd42faa4b4b89c41a80b291f61c27bcff197a6ac924bedfd370cfe92c147`）、対L11 `39行`（section SHA `sha256:1f940c5d714564fca0b15359607e1094efbcfda9e0a47cc97dfd9f63767a42b4`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：各資産ownerからのidentity/provenanceとConceptのdata-use classification。 戻し先: owner/identityが不明ならunclassified/unknownとして保留し、範囲の不足をL1-015へ戻す。

**L3 acceptance (`SECURITY-AC-015-01`)**：同じasset identityと同じrevisionに同じstable identityを返し、revisionまたはdigestが変われば旧identityを流用せず異なる版として区別する。§16列挙の HELIX-HARNESS-CORE（HELIX-JSON、Python meaning core、Requirement Engine、internal verification logic）、HELIX-BRAIN（Patterns、Units、Parts、accumulated design knowledge）、HELIX-INTELLIGENCE（internal prompts、judgment configuration、specialist models、routing / diagnostic logic）、HELIX-LABO（episodes、evaluation corpus、training material）、HELIX-OS（authority/state、topology、operation records）、HELIX-SECURITY（policies、credentials）をowner、identity、source、revision/digestで識別できる。列挙外資産も分類対象となり得る。内容をdumpせず識別不能をpublicと扱ったら不合格。受入は1.0 identity baseだけでWeb保護完了を宣言しない。

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

**L3 acceptance (`SECURITY-AC-020-01`)**：Injection Guard、Scope Guard、Hook Guard、Secret Guard、Egress Guard、Runtime Guard、Permission Guard、Core Asset Guardの決定的判定をGuard側に置く。Bot候補例のSecurity Audit Bot、Injection Analysis Bot、Core Probe Detection Bot、Supply-chain Review Bot、Security Diagnosis Botはsemantic judgement/diagnosisのため必要に応じINTELLIGENCEへ接続する。候補例は全Botの初版実装・運用を要求しない。Bot不在を理由に決定的制約が抜ける、Botが包括Write権を持つ、候補を全て1.0必須runtimeとするなら不合格。Core Asset Guardの名称を保持するが、正常fixtureはL2-015 identity/L2-016分類記録基盤だけを入力にし、L2-019/025の1.x公開sink適用を要求しない。L2-019/025の1.x公開sink適用を1.0へ前倒しせず、逆に1.0のcredential・一般egress・operation guardを1.x/Bot待ちとして延期する変異も個別に不合格とする。

**対応L11 acceptance**：`HELIXSECURITY-L2-020`。

### SECURITY-FR-028-01 — SECURITY pack更新受入

HARNESS-L2-010/011のdescriptorとSECURITY更新candidateのidentity/version/digest/dependency range/provenanceとL2-010/013条件を照合し、SECURITY固有accept/reject/unknownを返す。共通pack lifecycle/rollback/unfinished obligationはHARNESS ownerに残す。version_targetは実artifact versionではない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR asset（上記）はupdate/integrityに隣接するのみ。旧HELIXのpillar L3 functional requirements/旧business detail、旧SECURITY broker requirement、旧L3 acceptance test designを検索範囲として読み、SECURITY/HARNESS間のdescriptor owner分割に直接相当する要件は見つからなかった。旧形式は完全一致再利用せず、固定L2-010/013とHARNESS-L2-010/011から意味を再導出。

- **固定親**：`HELIXSECURITY-L2-028` / `MPR-RC-HELIXSECURITY-L2-028-002`、semantic digest `sha256:76740f351c9bad546326e6f322ba4358348f622799a644ad1f4e0372c5ecefb1`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L342`（section SHA `sha256:af3954bd55e6b230bb615ff295c7926ef29c95e3c2cd5954250df0cf022d16b1`）、対L11 `52行`（section SHA `sha256:40bf0c7a90dbac79da072bee458309750676a1e80640dd067becc97cade6b16e`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：SECURITYはartifactのSECURITY固有accept/reject/unknown（provenance、許可、対象version/range条件）だけを所有する。HARNESSは共通descriptor・交換・rollback・未完義務lifecycleを所有する。依存はHARNESS-L2-010/011共通pack契約とSECURITY-L2-010/013だけに限り、OS progression/artifact ownerの意味を追加しない。戻し先: SECURITY固有の受入軸の意味変更はL1-010、artifact identity/integrityはL1-013、共通pack契約不足はHARNESS ownerへ返し、本unitで補完しない。

**L3 acceptance (`SECURITY-AC-028-01`)**：HARNESS-L2-010/011の共通pack descriptorを入力し、SECURITY更新candidateのidentity/version/artifact digestがdescriptorと一致し、dependency versionが宣言compatibility range内で、provenanceとL2-010/013のSECURITY条件を満たす場合だけSECURITY固有の受入判定を返す。`version_target`は目標版で実版ではない。identity/version/digest欠落、不一致、range外、unknownを通せば不合格。共通交換/rollback/未完義務lifecycleの所有・受入をSECURITY-L2-028の証拠に含めたら不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-028`。

### SECURITY-FR-033-01 — 外部AI Worker context bindingと出力境界

対象は外部AI Worker task dispatch。既存descriptor/assignment/current HEAD/SECURITY authority/rule revisionを同じtask contextへ束ね、L2-008/007成立時は既決有効authorityを再利用して起動する。Workerはassignment-bound隔離で実行。raw secret値またはsecret/機密task内容が外部Workerに露出する場合に限りdeny。一方、credential-use capabilityだけを理由にdenyせず、PO採択P0訂正どおり、raw値を露出しない既存credential capabilityを使うtaskは、既存operation authority・L2-007・egress条件を満たせば通常作業の都度承認なしで起動可。出力だけでauthority/approval/assignment/requirements/verified/canonical stateを作らない。新packet schema/runtime registry/per-task approvalなし。

**版/採択境界**：SECURITY L2/L11の固定親は旧来の f6dad2 ではなく、L2/L11のsource bytesを含むcommit `318ec4a04abb3c1cc17111b3d939f913facd5fd3` の訂正後 -002 revision。PO decisionは別の判断記録で、採択追補を含むdecision fileのfull SHA-256は `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`。このdecision fileの内容はfix commit `7581e0fc5` と固定統合snapshot `633bf12ea8f948db8ba3d6600179c4a9507377a7` で一致する。decision行92/113/124が訂正後L2/L11とP0追加受入digest `sha256:e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6` を固定する。行124の追加受入記録はfull decision fileとは別のraw spanとして確認する。要求本文source revisionと、その採択を記録するdecision revisionを別々にpinする。L2 front matterの旧「未採択候補」文言をauthority根拠にせず、対象revisionとPO decisionを組で読む。credential-use capabilityだけで一律denyするoracleは採らない。

**旧HELIX対応（再利用/再導出/置換）**：旧 `HR-FR-P2-05` はarchive source `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md` line 428（asset `LEGACY-ASSET-02319C2481B9E01698D5`、whole-file SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）および6fabd125 baseline Git path `docs/governance/helix-harness-requirements_v1.3.md:409`（fixed commit `6fabd125`、whole-file SHA-256 `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1`）を別revision atomとして参照する。旧SEC-FR-CAP-007（asset `LEGACY-ASSET-B62E49D2E156232B8C63`、旧L3 path/SHAは上記）は理由receiptに全failure reasonを記録する点だけの形式上の類似で、credential-use/Worker dispatch意味の根拠にはしない。2 source atomを統合せず、holdingを変更・解除しない。採択sourceは固定L2 registration `MPR-RC-HELIXSECURITY-L2-033-002`。PO decision fileの採択revisionはfix commit `7581e0fc5` と統合snapshot `633bf12ea8f948db8ba3d6600179c4a9507377a7` の両方でfull SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`。decision行92/113/124は同じfile SHA内にあり、行124のP0追加受入digestは `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`。訂正source pinは別spanとして扱う：L2 `security-requirements.md:479-485` raw SHA `15c0ea7827a41bd6bca6ba2b0fb70597ad1e9a9d27b5073687b2b41745fdc6df`、L11既存033節 `security-acceptance.md:124-133` raw SHA `6d83abe63e3e852d58d9a9a60ae39c6b29284b6b8ab781bdb86456e479e60be0`、L11追加P0補足 `145-151` raw SHA `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`、PO decision追加受入行 `:124` raw SHA `a24ae9b3400a40b478dddcfe3374a6df602b807cb0803973faeac44f6872b35f`。旧「secret task deny」の文言だけでは認証済みcredential-useの扱いを確定できず、採択済みPO追補が訂正後の範囲を定める。訂正前の未採択表現を有効なoracleとして使わない。

- **固定親**：`HELIXSECURITY-L2-033` / `MPR-RC-HELIXSECURITY-L2-033-002`、semantic digest `sha256:b486a0c44e8f21a6f8738dedeac91dcb94da335b73409b6adeaecf8fa639bf1a`。registration receipt `security-v13-worker-context-coverage-receipt-2026-09-28-r2.json` の `candidate_digest_rule` は、L2-033節とP0追補tailをそれぞれ末尾空行除去・LF 1個へ正規化し、LF区切りで連結したSHA-256である。この規則では固定source commit `318ec4a04abb3c1cc17111b3d939f913facd5fd3` の値が `b486a0c44e8f21a6f8738dedeac91dcb94da335b73409b6adeaecf8fa639bf1a`、統合snapshot `633bf12ea8f948db8ba3d6600179c4a9507377a7` の値はP0追補tailが異なるため `0008f6e6f06f48140267ccdea4842fcf22962d81812bb22f4f6446c78fd5c623` である。従ってb486値は318ec4aの候補digestとしてのみ引用する。L2 `docs/helix-security/L2-requirements/security-requirements.md#L455`（section SHA `sha256:ccb516e4eb6e0943e7d634e359a45370eabc31c597daa3fc5afb790895461004`）、対L11 `124–133行`（採択decisionのraw span SHA `sha256:6d83abe63e3e852d58d9a9a60ae39c6b29284b6b8ab781bdb86456e479e60be0`）。要求L2/L11 source commitは `318ec4a04abb3c1cc17111b3d939f913facd5fd3`。PO decision fileの採択revisionはfix commit `7581e0fc5` と統合snapshot `633bf12ea8f948db8ba3d6600179c4a9507377a7` の両方でfull SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`。対象decision行92/113/124は同じfile SHA内にあり、行124のP0追加受入digestは `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`。追加採択補正のsource pinは別spanとして扱う：fixed revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3` のL2 `security-requirements.md:479-485` raw SHA `15c0ea7827a41bd6bca6ba2b0fb70597ad1e9a9d27b5073687b2b41745fdc6df`、L11の既存033節 `security-acceptance.md:124-133` raw SHA `6d83abe63e3e852d58d9a9a60ae39c6b29284b6b8ab781bdb86456e479e60be0`、P0補足 `145-151` raw/PO採択追加受入digest `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`、PO追加受入行 `po-decision-2026-09-29-57candidates.md:124` raw SHA `a24ae9b3400a40b478dddcfe3374a6df602b807cb0803973faeac44f6872b35f`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：OSはassignment/progression、Worker環境ownerは実行隔離/enforcement、SECURITYはauthorityとcredential/egress条件を所有する。HARNESSは選択されたtask contractが許可済みinput、sanitization、oracle、検証を定める。CONNECTは固定L2-033に列挙されず、本FRで所有責務や依存を追加しない。Workerを使わないoperationには本FRを適用せず、provider名や追加runtimeかどうかで主Worker契約を狭めない。bindingが欠落/unknown/stale/不一致ならdispatchを停止し、理由・対象revision・不足・戻し先を結果に残してOS assignment ownerへ返す。policy意味の変更は該当SECURITY L2 ownerへ戻す。主WorkerのoperationにL2-029/031の制限を課す、追加runtime採用/追加権限を推定する、または新schema/別承認者を作れば不合格。

**L3 acceptance (`SECURITY-AC-033-01`)**：対象project、OS assignmentの目的・成果形式・許可scope・予算/期限、Worker descriptor、dispatch時HEAD、既存authority、規則revision、task boundaryを同一contextへ束ねる。provider名や追加runtimeかどうかで主Worker契約を狭めず、Workerを使わないoperationには本FRを適用しない。主Workerの通常taskに、追加runtimeだけを対象とするL2-029のopt-out/public-only条件やL2-031のproposal-only/canonical no-access条件を本要件だけで課さない。選択した追加runtimeではL2-029/031と既存L2-005/006/007/008の条件を同時に適用する。各taskでは対象assignmentのWorker descriptor、dispatch時HEAD、既存authority、規則revision、task boundaryが一致し、適用されるL2-007制約を確認する。Worker version/config変更、target変更、規則revision変更、authority revision変更、assignment scope変更をそれぞれ独立に与え、各変化で以前のbindingを流用せず該当scope・revisionを再照合する。互換性が確認できない場合はunknown/denyとして対象dispatchを止め、既存OS assignment ownerへ返す。L2-007の隔離制約が適用できない場合と適用を観測できない場合は別々に与え、いずれも該当dispatchだけを開始せず、理由・対象revision・不足・既存ownerへの戻し先を保持する。新しい固定schemaや別の承認者を補作しない。raw secret値またはsecret/機密task内容を渡す場合は拒否する。一方、PO採択P0訂正に従い、既存operation authorityと非公開・範囲付きcredential-use capabilityを使い、適用されるL2-007と該当egress条件を満たすtaskは、credential-useだけを理由に一律denyせず追加の毎回承認なしで起動可能とする。SECURITYがassignmentを決める、OSがauthorityを決める等のowner代行、または有効な既決authorityへ都度の人間承認を追加する変異は不合格とする。Worker出力単独からauthority、承認、assignment、要求状態、verified、canonical stateを生成せず、直接commit/adopt/merge/promoteもしない。isolated worktree内の通常成果作成は許容する。別の無関係taskを一律停止しない。別HEADで作成された成果を同一taskの結果として受理する変異も不合格とする。

**対応L11 acceptance**：`HELIXSECURITY-L2-033`。

## Stage 2c（1.0 target）：HELIXSECURITY-L2-031

### HELIXSECURITY-L2-031 の固定境界と旧sourceの扱い

このsuffixは、PO判断 `MPR-RC-HELIXSECURITY-L2-031-001` が本文どおり採択した `version_target: 1.0`、Stage 2c の単体候補をL3/L10へ導出する。要求本文と対L11の固定bytesは `633bf12ea8f948db8ba3d6600179c4a9507377a7` の `docs/helix-security/L2-requirements/security-requirements.md:427-446` と `docs/helix-security/L11-acceptance/security-acceptance.md:104-115`。PO判断は同commitの `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:90`。それぞれのfull SHA、raw LF span SHA、固定親の同一revisionは対応する時点監査記録に収録する。G0追補 `docs/governance/audits/requirements-stage/implementation-order-addendum-2026-10-03.md:542` はStage 2b完了をgateにせず、常時依存をINFRASTRUCTURE-010、OS-018、SECURITY-005/007/008/029へ限定する。SECURITY-006は外部接続・送信時、SECURITY-009は停止・逸脱時、SECURITY-022/023およびHARNESS/OSのverification・promotion条件は該当後段へ入る時だけ適用する。これらをproposal生成前の一律条件にしない。

対象はSECURITY-L2-029が区分する主Worker契約外の追加runtimeを実際に選んだoperationに限る。主Workerの通常task、追加runtimeを選んでいないtask、未採択のStage 1草稿へ拡張しない。SECURITYは分類・operation authority・egress/credential/isolation policyの判定、OSはticket/assignment・開始停止・handoff・未完義務、Worker環境は制約適用、INFRASTRUCTUREはruntime/resource/network/storageの実状態、HARNESSは選択された既存verification oracleを所有する。新しいissuer/承認者/state ownerは設けない。

旧sourceは次の項目ごとに限定して対応づける。旧L1 `infinity-loop-platform-requirements.md:84` のHIL-BR-32（LEGACY-ASSET-719D5EC9C06FC4AAD0FF）は追加runtime区分、proposal-only、隔離、canonical state/credential非到達、秘密・機密taskの委譲境界を再導出する。旧L3 `infinity-loop-functional-requirements.md:57,86` のHR-FR-HIL-23/HAC-HIL-23a/b/c（LEGACY-ASSET-C7F0C3B79CBAA72960BF）と旧対acceptance `L3-infinity-loop-acceptance-test-design.md:55`（HAT-HIL-23、LEGACY-ASSET-FA8C6E69463183D6A19B）は、隔離・最小payload・提案再検証・egress/scope/confidentiality拒否・失敗の隔離という対応項目だけを再導出する。旧P2-05 `pillar-functional-requirements.md:148,225-226` と旧HAT `L3-pillar-acceptance-test-design.md:105` は隔離/非権威化の近接例だけを再利用し、Python固有意味は置換する。旧WCC `worker-common-contract.md:57-58,128` はpath/egress/diff/secret境界の近接例だけ、旧HIL-FR-67 `infinity-loop-platform-requirements.md:157` は必要最小payloadの例だけを参照する。runtime名、旧actor、旧DB/receipt schema、実装・testは現行owner/契約へ置換し、実行しない。

旧source全体を満たしたとはしない。HR-FR-HIL-23が束ねるHIL-FR-64-69/HIL-NFR-37-40の他条件、quota/rate-limit閾値やHAC-23cの閾値、広範な環境浄化、恒久bypass防止、runtime固有auditをこの親へ追加・充足しない。旧HATは設計資料であり実行済み受入証拠ではない。固定L2の常時/操作時/選択入力/参照のみ4区分と、SEC-029のclassification/opt-out意味を保持し、候補と参照資料をauthorityにしない。

### SECURITY-FR-031-01 — 追加runtime分類とdependency closure

追加runtimeを選択したassignmentについて、runtime identity/version/config、SECURITY operation authorityのactor/target/operation/revision/environment/scope/expiry、OS assignment/ticket revision、INFRASTRUCTURE-L2-010の実行制約、SECURITY-L2-005/007/008/029の同一対象条件を識別する。採択後のpack revisionでは、dependency ID・owner・contract version・互換range・scopeを固定し、いずれかが未確定なら該当runtimeを開始しない。これは本候補の技術identityが未確定の間に実行へ進まない境界であり、追加承認者や毎回の人間承認を設けない。常時依存の欠落・unknown・stale・revision mismatchは開始前にdeny/holdし、個別の理由とownerへ返す。SECURITY-L2-006は外部接続/送信、SECURITY-L2-009は停止/逸脱、SECURITY-L2-022/023と選択HARNESS oracle/OS promotion条件はそれぞれの後段を実際に選んだ場合だけdependency closureへ加える。旧source・HAT・HARNESS-L2-023を参照資料として読むだけで現行の常時依存や安全条件を満たしたとはしない。**SECURITY-AC-031-01**は四区分、同一revision、適用条件、unknownを別に保つことを受入条件とする。

### SECURITY-FR-031-02 — 実行前入力と開始条件

開始入力はruntime/config identity、許可済みoperation/data class/scope/expiry、既存OS ticket/assignment/task revision、Worker/INFRASTRUCTURE制約、返却proposalに適用する既存schema/digest policyに限る。taskにファイル情報が必要な場合だけ、owner/systemが選択し別のisolated copyへ払い出した必要最小payloadのsource identity・revision・path/digest manifest・classificationを束縛する。ファイル情報を必要としないtaskにmanifestを要求しない。未選択payload sourceを推測・fallbackしない。開始前に実行結果、filesystem diff、完了receiptを要求しない。assignmentはruntime採用、要求承認、merge/promotionを許可しない。**SECURITY-AC-031-02**は適用条件に応じた入力だけで開始可否を判定し、未生成の実行後結果を前提にしないことを受入条件とする。

### SECURITY-FR-031-03 — proposal-onlyと権威境界

追加runtime、その出力または自己申告だけでは要求、priority、authority、ticket/assignment、採択状態、canonical artifact/evidence、acceptance、merge/promotionを作成・変更・承認・完了できない。proposalはuntrustedとしてHARNESSの選択済みoracleと既存OS進行条件へ返す。assignment-bound copy内での通常の編集/proposal生成は許す。同じ既決operation authority内の通常task反復は、対象とscopeが変わらない限り追加承認者やtaskごとの人間承認を要求しない。**SECURITY-AC-031-03**は各権威対象への出力単独の変更を拒否し、copy内の通常編集とproposal returnを許すことを受入条件とする。

### SECURITY-FR-031-04 — isolated copy、canonical access、credential/data境界

runtimeはassignment-bound isolated working copy/sandbox内でのみ動作し、canonical repositoryおよびHELIXの要求・authority・ticket/assignment・workflow・evidence/receipt stateへ直接read/writeできない。正規owner/systemが選択した必要最小payloadの別copyを使うことは許可された入力経路であり、直接canonical readと区別する。classificationは既存SECURITY-L2-016の1.0分類記録とSECURITY-L2-029の適用条件に従い、未分類/unknownをpublicへ写像しない。raw credential/secret値をruntime、context、環境、payload、receiptへ露出させない。非公開capabilityは既存005/006/007/008の操作・target・revision・scope・expiry条件が一致した場合に限る。SEC-029に従い、opt-out未完/unknown時は公開可能コード以外を委譲せず、opt-out完了だけでHELIX-confidential以上を許可しない。全追加runtimeをpublic-onlyへ狭めない。**SECURITY-AC-031-04**は許可copy経路、直接canonical read/write、credential、classification/opt-outを別条件として受け入れる。

### SECURITY-FR-031-05 — conditional operationと実行後receipt/oracle

外部runtime接続またはdata送信には既存SECURITY-006の宛先/data/目的/expiryを適用する。SECURITYはpolicy・data/credential/egress条件を返すとともに、それらが実行環境へ適用されたかの観測照合を返す。停止または逸脱時はSECURITY-009の既存停止・隔離経路へ進む。verification/adoptionへ進む場合だけSECURITY-022/023と選択されたHARNESS oracle、OS側promotion/handoff条件を適用する。実行後のWorker/INFRASTRUCTURE適用観測とOS result/diff receiptを分け、HARNESSは選択済み既存oracleでproposalを検証する。SECURITY自身はproposal、receipt、OS stateを生成しない。**SECURITY-AC-031-05**は条件のないoperationに条件付きdependencyを要求せず、後段receiptが揃わないrunをaccepted/verified/promotedと扱わないことを受入条件とする。

### SECURITY-FR-031-06 — owner別failure、未完義務、scope分離

開始前にauthority/runtime/scope/payload/isolation/credential/classificationまたは条件付きegress条件が欠落・unknown・staleなら該当operationだけ開始しない。開始後に境界逸脱、必要観測、diff、result receiptが欠落・unknown・staleなら該当結果を隔離/holdし、既存SEC-009/OS assignmentの未完義務へ戻す。policy/authority意味はSECURITY owner、assignment/開始停止/handoffはOS、enforcementはWorker、実resource/network/storage観測はINFRASTRUCTURE、proposal verificationはHARNESSへそれぞれ返す。runtime/version/config、scope、payload、credential/data classification、authorityが変わった場合は旧判定を流用せず再照合する。scope外read/write、許可path外diff、deny対象egress、制約適用unknown、host fallbackは対象runを停止し結果を隔離する。無関係なoperationや通常主Workerを一律停止しない。**SECURITY-AC-031-06**はownerごとのfailure destinationと無関係scopeの継続を受入条件とする。


## Stage 3 — 選択operationのruntime・profile安全境界

本節は採択済み1.0の029、030、032、034、035を親とする未承認草稿である。固定親の本文中の候補状態表示は、その後の対象revision付きPO判断と組で読む。035はPOが**scope A（追加runtimeだけ）・配置A（SECURITY policy、Worker強制、OS運転）**を選択済みであり、未決として再質問しない。032のdeny優先は主Workerと追加runtime双方に適用する。草稿は実runtime使用、bypass、MCP起動の許可を生成しない。

### `SECURITY-FR-029-01` — 追加runtimeの委譲分類と型別ローカル証拠

入力は選択runtime identity/version/config、operation/assignment/target revision/scope、data分類、許可path・検査結果、opt-outの対象・出所・時点、既存authorityと適用policy、実環境の観測である。SECURITYは委譲可否・不足・採用条件の充足状態を別々に返す。機密以上はpath allowlistとsecret/PII検査を含むローカル制御で遮断し、分類unknownをpublicへ丸めない。opt-out未完・不明では既存条件を満たす公開可能コードだけを限定委譲でき、runtime採用は未完のまま。完了後も機密以上を許さない。

ローカル保証は同じtupleのsandbox適用、該当network operationのallowlistとegress実測、該当write operationのFS差分を型別に返す。全operationへ四型すべてを課さず、read-onlyは既存007のwrite禁止と対象scope不変oracleを使う。適用性unknownを非該当へ落とさない。provider UI・宣言・flagはopt-out申告の出所として残せるがローカル強制の代用にならず、ローカル成功はprovider訓練停止の証明でもない。SECURITYはpolicy、INFRASTRUCTURE/Workerは適用観測、OSはassignmentと未完義務を所有する。対象外の主Worker・未選択sourceを止めず、別tuple証拠への暗黙fallbackをしない。

- **`SECURITY-AC-029-01` 分類・委譲・採用の分離**：publicと機密/secret/PII・unknown、およびopt-out完了/未完/不明を個別比較し、機密以上を遮断する。未完opt-out下の適格public委譲は採用完了へ昇格せず、有効な既存scoped credential-useだけを理由に拒否しない。
- **`SECURITY-AC-029-02` 型別適用観測**：同じtupleで適用対象のsandbox、allowlist、egress、FS差分を独立に照合し、一型の欠落/不一致/unknownを他型で相殺しない。read-onlyやnetworkなしの根拠付き非該当と適用unknownを分ける。
- **`SECURITY-AC-029-03` 出所・版・owner**：runtime/config/target/scopeの変更で旧証拠を流用せず、不足をpolicy/実環境/data/runtime条件の該当ownerへ返す。provider申告とローカル観測を独立に保持し、主Workerへの条件拡張・1.x Web強制を生成しない。

### `SECURITY-FR-030-01` — agentic自動適用範囲の変更確認

自動適用への新規昇格・task/operation/data/実行範囲の拡大について、変更前後revision、段階・scope、操作権限、最小権限、監査経路、巻戻し/停止、risk ownerの実責務と戻し先、継続監視/異常検知、変更に対応するthreat model、継続risk reviewを受ける。各条件の充足/不足/unknownと根拠を返し、揃わなければその拡大を認めず以前の状態・未完義務を保持する。risk ownerの名前だけでは責務充足としない。INTELLIGENCEの意味判断、HARNESSの検証、Worker/INFRASTRUCTUREの強制、OSの昇格運転を代行しない。有効な同一revision/scopeでの通常反復へ追加の都度承認を設けない。

- **`SECURITY-AC-030-01` 独立条件の照合**：固定親の各条件を同じ変更revision/scopeへ結び、各欠落/unknownを個別に示す。監査ログだけで監視・巻戻し・risk reviewを満たした扱いにしない。
- **`SECURITY-AC-030-02` 変更・監視・未完保持**：新接続先/能力/data範囲を加えた対象へ旧確認を無検査で流用せず、該当拡大だけを保留する。継続監視で条件喪失を検出したとき既存009の対象停止/隔離経路へ返す。
- **`SECURITY-AC-030-03` 既決範囲とowner**：有効な同一条件内の通常反復は新しいrisk承認者・人間approveなしで既存判断を再利用できる。SECURITYの条件照合をOSの昇格・操作許可やINTELLIGENCEの意味判断へ昇格させない。

### `SECURITY-FR-032-01` — Worker操作のpermanent deny優先

主Worker/追加runtimeを問わず、repository-level bypassを試みる操作へ、対象repository/operationと既存policy revision・適用状態、one-shot marker/provider flagを束縛する。有効なpermanent denyに下位機構から許可・解除を与えず、unknown/staleは既存fail-closeへ返す。deny非適用を確認した操作は既存008 authorityへ戻し、本要件から新しいallow/denyを発行しない。policyの変更主体・解除手続き・承認者は増設しない。

- **`SECURITY-AC-032-01` 同一対象の優先**：主/追加Workerそれぞれに有効denyとone-shot/provider flagを個別入力し、下位機構後もdenyが維持される。
- **`SECURITY-AC-032-02` 適用状態の分離**：unknown/staleと確認済み非適用を区別し、前者は未解決、後者は既存authorityへ戻す。無関係操作への一律denyや032から035のprimary適用を生成しない。

### `SECURITY-FR-034-01` — MCP profile別operation条件

既存CONNECT/構成経路が選んだprofile identity/revision、tool capability、read-only probe指定、要求operation、credential要否/egress先を受け、既存004/005/006/007/008によるprofile別allow/deny/unknownと不足理由を返す。read-only指定probeへwrite/副作用capabilityを割り当てず、raw secret要求を拒否する。有効な非公開scoped credential-useは既存条件内で利用可能であり一律禁止しない。別profile/revisionの条件やCONNECT互換性でpolicyを補わない。catalog列挙・typed設定・probe供給・登録集合の未完意味はそのownerへ保持し、registry/schema/probe方式を補作しない。

- **`SECURITY-AC-034-01` profile束縛とprobe**：同一profile/revisionのcapabilityとoperationを照合し、欠落/unknown/stale/不一致およびwrite可能probeをそのprofile operationでdeny/holdする。
- **`SECURITY-AC-034-02` secret・egress・authority**：raw secret、未許可destination、authority tuple不成立を個別に拒否し、既存条件を満たすscoped credential-use正例を通す。
- **`SECURITY-AC-034-03` ownerと未closure**：CONNECTのidentity/互換、SECURITYのpolicy、Worker/INFRASTRUCTUREの適用観測を分ける。未確定catalog/typed/probe意味は未closureとし、無関係profileや正常反復へ一律停止・毎回承認を追加しない。

### `SECURITY-FR-035-01` — 追加runtimeのrun限定設定とdeny能力

対象はPO scope Aの追加runtimeで、policy/authorityはSECURITY、適用・cleanup強制はWorker、run/assignmentはOSである。選択runtimeのallowlist能力、repository deny switchの設定能力と適用状態、既存authority、run開始/終端/cleanup観測を受ける。明示allowlist対応ならdeny既定+allowlistを使い、YOLO代替を選ばない。非対応と確認できるruntimeだけ、既存policy内で選ばれた経過措置をそのrunに限定できる。bypass利用許可や経過期限・runtime一覧を新設しない。

選ばれたbypass/YOLO/auto-approve設定はsuccess/failure/cancelの各終端で除去し、未確認/残置をcleanup成功にせず次runへ持ち越さない。repositoryから恒久denyを設定でき、その適用がcleanup後も維持されることを観測する。032の優先順位は再利用するが、優先順位の成立だけでswitch能力を証明しない。能力・policy・適用状態unknown/staleは該当選択を保留し既存ownerへ戻す。bypass非選択の通常操作を本要件だけで新規gateへ置かない。

- **`SECURITY-AC-035-01` 能力に応じた選択**：allowlist対応はallowlist使用、非対応の確認と有効policyを持つ経過措置はrun限定として区別する。対応/能力unknownをYOLO許可へ丸めない。
- **`SECURITY-AC-035-02` 全終端cleanup**：success/failure/cancel各終端でrun設定が除去され次runへ継承されない。残置/観測欠落は未完としWorker/OSへ返す。
- **`SECURITY-AC-035-03` deny能力・優先・scope**：repository deny能力/適用を別個に照合し、032の同一対象deny優先を保ちcleanup後もdenyを維持する。主Workerへ035の四条件を拡張せず、通常操作や既存006/007/008/OS018条件を免除しない。

### Stage 3固定親の出所とrevision

固定revisionは`633bf12`。L2全文SHAは`aa9d6446e97d7027da6c15bbb315bdfa524edf0fa3e5252403f91e7cbac1abdf`。以下は意味digest（外側空白除去＋末尾LF）とraw spanを区別する。029はPOが選んだ二partを保持し、後半だけで採択済み前半を置換しない。035は候補本文の選択肢にPOのscope A・配置Aを適用する。

| 親／登録 | PO判断 | 固定L2行／意味SHA | 固定L11行／raw span SHA |
|---|---|---|---|
| `HELIXSECURITY-L2-029` / `MPR-RC-HELIXSECURITY-L2-029-003` | `docs/governance/decisions/po-decision-2026-10-03-additions10.md#L35` | 405–416 / `0faf8ac952341e621c2f76f7ef44249f03a673ac0a37180f0034914df00f4745` | 89–95 / `3a5d5311fd03cae17db54bd1ad323cb4222d44d43196c3a4d50ce2a8cf2759f0`; 169–222 / `9454998c4b19552f845ad5c6f3ba0f16ac64030e82b95409b970dada40814288` |
| `HELIXSECURITY-L2-030` / `MPR-RC-HELIXSECURITY-L2-030-001` | `docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L89` | 417–426 / `9986b0be6d71313db5ad7de6125e90cb278d7d47f7c93d8eee88357e3d1688e8` | 97–103 / `908b321efad903489d8d83dd1e1dc7d46bce0993e4b1f2787450591b8cca3567` |
| `HELIXSECURITY-L2-032` / `MPR-RC-HELIXSECURITY-L2-032-001` | `docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L91` | 447–454 / `ccdd634fb92621105310b91465e01bd089238cc430491ff3c8ac51a3d80403c8` | 116–123 / `277d24b23c7407eeb6e34574a26b16794f47c07caddf15d4fc456ce39b6e740f` |
| `HELIXSECURITY-L2-034` / `MPR-RC-HELIXSECURITY-L2-034-001` | `docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L93` | 468–478 / `9543e2848037912dd04c10d46438be064961b808a26bad58b090d868308eb166` | 135–144 / `2f697a2bf2ec986f1f21ced2d7bfe4b285b367960de874f75c21d0de5bbe314f` |
| `HELIXSECURITY-L2-035` / `MPR-RC-HELIXSECURITY-L2-035-001` | `docs/governance/decisions/po-decision-2026-10-03-additions10.md#L43` | 487–499 / `788594f7b2d11ccd87c984b0751584aa91dbdeb7cb83ae17ba211be67ae0828c` | 153–168 / `9559fe06667f3a77d1a9c37238c2c8834add365ee7e49c7e3b5692963a8fa60d` |

L11全文SHAは`e4d92364e3a8c88332ee48358ac6b08c2d8cdd51cd5e00b111fff4c3f43b68d0`。POが記したL11意味digestは030 `661965ac2c99e78160a11d9fedb3d10b44d88938cbb946cbfba04589067f7df8`、032 `5dcf1c19728badff041220d610a85c3507a6c6f70fea57c0081ae9902705c6f1`、034 `3ff1762c435c7343ba96541f5b149dbf5b6264152306b2ace486a9efa54dbc77`、035 `76f7f174a03db3d162c14409b4c970b75d202af4794c5faf6d7832593a42fa7b`。029はpart1 `3a5d5311fd03cae17db54bd1ad323cb4222d44d43196c3a4d50ce2a8cf2759f0`、part2 `9454998c4b19552f845ad5c6f3ba0f16ac64030e82b95409b970dada40814288`、composite `bad6c3ebc301cecf328777a9497ad17cfcc9df023b57a5e897db8f44437da210`。raw範囲hashを意味digestとして扱わない。

### Stage 3項目別の旧source対応

| 現親 | 旧asset／archive path／行／全文SHA | 再利用・再導出・置換 |
|---|---|---|
| 029 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:84,217,219` / `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | HIL-BR-32とNFR-37/39の分類・opt-out・ローカル保証を保持して再導出。対象操作の型別適用性は現PO/L11から具体化。旧provider名・全consumer条件・旧runtimeは置換。 |
| 030 | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:187,299–300` / `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | HR-NFR-P8-03/HAC-N8-03a,bの段階導入・独立条件・継続risk reviewを再導出。旧risk gate実装・DB・方法・承認者は置換。 |
| 030 | `LEGACY-ASSET-44DD86E3DEC09E65EF51` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:142` / `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | HAT-N8-03の独立条件negative形を再導出。旧testの実行・合格は継承しない。 |
| 032 | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:150,230` / `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | HR-FR-P2-07とHACのdeny優先を対象Worker operationへ再導出。旧state/DB物理名やpolicy変更機構は置換。 |
| 032 | `LEGACY-ASSET-44DD86E3DEC09E65EF51` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:107` / `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | HAT-P2-07のmarker/flagに対する優先oracleを再導出。旧enforcer/testは実行しない。 |
| 034 | `LEGACY-ASSET-02319C2481B9E01698D5` / `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:286` / `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | HR-FR-HYB-002/HR-AC-HYB-002のprofile別safety、raw-secret要求、write可能probe拒否だけ再導出。catalog/typed供給・未登録profileの意味はholdingへ保持。 |
| 035 | `LEGACY-ASSET-A60CF91DD2AF6693E6F9` / `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json:6019–6040` / `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HIL-NFR-38 statementを規範起点に四条件を保持し再導出。PO scope A・配置Aへ結び、旧JSON正本/DB/runtime/未選択scope案は置換。 |
| 035 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:218` / `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | NFR-38のcorroborationとして同一意味を保持し、別要求atomに数えない。 |
| 029・035 | `LEGACY-ASSET-C7F0C3B79CBAA72960BF` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:57,86` / `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | HR-FR-HIL-23/HAC-HIL-23の共有consumer contextを保持。隔離/egress/diff/再検証は隣接oracleの参考であり、全条件を各NFRへ一律配賦しない。 |
| 029・035 | `LEGACY-ASSET-FA8C6E69463183D6A19B` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:55` / `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | HAT-HIL-23の統合negative観点だけ再導出。既存031のproposal-onlyも別親であり、035や029の成功から全consumer closureを生成しない。 |

034のHYB-002検索は旧governance v1.3、旧L3-requirements、test-designを対象とし、対応する独立L3/test-designを確認できなかったためv1.3のFR/AC行を起点とする。catalog/typed/probe供給の新規案は起草せず既存source holdingへ保つ。旧sourceを現authorityへ昇格せず、参照した旧runtime/test/CIは実行しない。

### 029の規範sourceとcorroborationの区別

旧IR `requirements.json#/HIL-NFR-37`（5971–5992行）と `#/HIL-NFR-39`（6067–6088行、LEGACY-ASSET-A60CF91DD2AF6693E6F9）を規範sourceとして保持する。旧L1 217/219行は同文のcorroborationであり別atomに数えない。BR-32は追加runtime区分、HR/HAC/HAT-HIL-23は共有consumer/oracle contextである。consumer全条件のclosureを029だけで生成しない。既存034のcatalog/typed/probe意味はそのownerに保持し、旧source holdingをL3起草で終端化しない。
