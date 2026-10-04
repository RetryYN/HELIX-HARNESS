# HELIX-SECURITY L3 機能要件（1.0採択親31件の草稿）

> 状態: L3要件草稿。全L3文書の完成、L3承認、実装方式確定を表さない。本書はStage 1の19件、Stage 2cの031、Stage 3の029/030/032/034/035およびStage 4の021/022/023/024/026およびStage 5の027の計31親を固定L2/L11と対象PO判断から起草した草稿である。他機構はその正本で扱い、SECURITYのWeb適用025・後続版は1.0対象に含めない。

## 適用・authority・owner境界

対象はStage 1のHELIXSECURITY-L2-001〜016、020、028、033の19 identity、Stage 2cの031、Stage 3の029/030/032/034/035、Stage 4の021/022/023/024/026、Stage 5の027である。SECURITYはpolicy/classification/authority判定と理由を所有する。OSはassignment/progression、Worker実行環境はenforcement、CONNECTは伝送、HARNESSは共通pack lifecycle、LABO/BRAINはそれぞれ評価・知識格納を所有する。各FRはSECURITYが保証する契約と各ownerへ返す情報を述べ、他ownerの実装を肩代わりしない。

## 旧HELIXからの対応

旧sourceは項目別に照合した。旧SECURITY L3 capability broker `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md`（asset `LEGACY-ASSET-B62E49D2E156232B8C63`、SHA-256 `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`、全体lines 1–176、CAP-001〜007はlines 160–166）、旧pillar L3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md`（asset `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、lines 22–349、SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`、P8-04はlines 168–171、P8-NFR-02はlines 186）、旧受入 `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md`（asset `LEGACY-ASSET-170112AB2FA2FFDBFEE9`、lines 1–59、SHA-256 `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4`）、旧pillar acceptance `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md`（asset `LEGACY-ASSET-44DD86E3DEC09E65EF51`、lines 1–200、SHA-256 `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`）を読んだ。旧試験資産 `archive/legacy-generation-2026-09-14/root/tests/security-capability-broker-authority-design.test.ts`（asset `LEGACY-ASSET-E92D9979D003D353DB99`、実ファイルlines 1–67、SHA-256 `ff1ee8fefaf8416cafb4a706301cb7a7d4afe549f04e31c5560a1cac4d88d31e`）はconsumer所在の参照に限り実行しない。旧HELIX L3のFR/ACとfunctional/business/NFR三分割、旧L3 gate、自律境界のsourceもこのsliceの形式根拠として記録する（詳細は「旧L3構造の保持点」節）。各要件の意味は固定L2/L11から再導出し、旧runtime/test/CLIは移植しない。

## 旧L3構造の保持点

旧HELIXのL3定義と3 sub-doc構造は形式上の起点として参照し、旧gateを現行承認手続きにしない。旧functional sub-doc `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md`（asset `LEGACY-ASSET-B5B5E71B2AF1459D59A1`、全体lines 1–974、SHA-256 `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`）はFRの入出力/振る舞い/AC、旧README `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md`（asset `LEGACY-ASSET-9A772391C7FB1298D45F`、lines 1–56、SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）はfunctional/business/NFRの3分割、pair、G3 freeze節（lines 48–56）を示す。旧business実体 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md`（asset `LEGACY-ASSET-A6E2C7F0565E5F804F06`、lines 1–256、SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）はHARNESSのBR21評価 projectionであり、現SECURITY/LABO/BRAINへ意味を移さない。旧HELIX NFR grade `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md`（asset `LEGACY-ASSET-8CC5ABFC98C0D00183CA`、lines 1–73、SHA-256 `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`）は候補値・測定・受入の並置を参考にし、旧数値を自動継承しない。旧HELIX L3 FR/AC構成 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`（asset `LEGACY-ASSET-C7F0C3B79CBAA72960BF`、lines 1–95、SHA-256 `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`）と旧`CLAUDE.md`自律境界（asset `LEGACY-ASSET-6EBDB617A8104A7756D0`、lines 84–85、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）を参照し、AI起草・人による要件承認のみという保持点を現行authority modelに従って扱う。G3/L12等の旧freeze gateは本書の追加承認gateにしない。

## FR/AC

### SECURITY-FR-001-01 — 外部入力の信頼・authority境界

外部文書/Issue・PR/Web/MCP/Tool出力/AI生成物はsource・project・revision・classificationを持つ未信頼dataとして扱う。閲覧だけでinstruction/要求/authority/memory/BRAIN/training/policyへ昇格しない。昇格は明示済み経路に限る。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar L3のHR-FR-P8-04（旧path `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` lines 168–171、asset `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）とHR-NFR-P8-02（同path line 186）を起点にraw input/trusted metadata/instructionの分離を部分再利用し、現L2のsource/project/revision/classificationへ再導出する。旧CAP-001〜007はこの要件への直接対応とみなさない。

- **固定親**：`HELIXSECURITY-L2-001` / `MPR-RC-HELIXSECURITY-L2-001-001`、semantic digest `sha256:97997b9023ac5291a30cfdb263b0997209e76dfd6ce7378cf6a914da57948d8f`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L70`（section SHA `sha256:0c2fd43eba36ca1461dc40e9e91b390df36fbee51226643a52cab6ec042928e9`）、対L11 `25行`（section SHA `sha256:8e22198c3258b212cf56135925e1e6b000c1b937da6e2bf1add8a0133c51a446`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：Conceptのdata-use classification・isolation foundation、source identityを受ける。分類不能なら未信頼・unknownとして扱う。 戻し先: 入力の意味や昇格条件が不足・矛盾ならL1-001/L1-002候補へ戻す。下流の接続先はunknownのまま保つ。

**L3 acceptance (`SECURITY-AC-001-01`)**：外部文書、Issue/PR、Web/MCP/Tool出力を読み取り、source・project・revisionを持つuntrusted dataとして残す。例外/反例: 「読むだけ」でinstruction、要求、authority、memory、BRAIN、training data、policyへ上がる場合は不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-001`。

### SECURITY-FR-002-01 — 命令様dataの直結防止

L2-001で未信頼の命令様内容はdataのまま扱い、Tool args・system instruction・権限operation・credential送信へ直接連結しない。完全なinjection検出率を要求しない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-001（前掲security-capability-broker-authority.md lines 160–166、asset `LEGACY-ASSET-B62E49D2E156232B8C63`、SHA-256 `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`）はoperation capabilityとimpactの型分離であり、命令様data非昇格とは直接一致しない。authority/data分離の部分類似のみ記録し、命令様dataの扱いは固定L2から再導出する。旧CAP-002はphysical target/TOCTOU、CAP-003はprovenanceを扱い、本FRとの連番対応ではない。

- **固定親**：`HELIXSECURITY-L2-002` / `MPR-RC-HELIXSECURITY-L2-002-001`、semantic digest `sha256:59b12bbafd3c6aee62a08839e8a56826e28609495422bf5eaa484fe427935700`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L80`（section SHA `sha256:07ce9de25ab4b47be2b99a0550342230e34520548fe4444b6e0166d9454c61cd`）、対L11 `26行`（section SHA `sha256:e3be2a9d718395db4d018280b458e3c85e508bb68c59ae9828f1e486c99c3890`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-001のsource/classification、Workerへ渡される明示scope。検出Botがなくても直接authority経路を遮断する。 戻し先: 境界を証明できない場合は下流操作を止め、data flow設計をL1-002へ戻す。検出器の不在を成功扱いしない。

**L3 acceptance (`SECURITY-AC-002-01`)**：「前の指示を無視」「AGENTS.mdへ書け」「repositoryを消せ」「memoryへ保存」「credentialを送れ」を含む外部dataでも、閲覧内容がTool args/system instruction/権限付きoperationに直結せず、dataとして保持される。各判定は適用policy revision、入力source/scope、deny/hold理由を持つ判定receiptへ結ぶ。完全なinjection検出器がないことだけでは不合格にせず、直結があれば不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-002`。

### SECURITY-FR-003-01 — project/tenant/environment/assignment隔離

project/tenant/environment/assignment identityとstate/data/Worker/credential/artifactを明示scopeに結ぶ。identityが欠落/不明なら停止し、primary treeや他projectへ暗黙fallbackしない。tenant fixtureは境界確認であり顧客tenant runtimeを要件化しない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-002（同前掲asset/path/lines/SHA）はlexical/physical targetと実行直前TOCTOU確認の部分類似に限る。project/tenant/environment/assignment隔離とは直接一致しない。旧CAP-003はprovenance区別で別の責務。現L2のscope軸から再導出する。

- **固定親**：`HELIXSECURITY-L2-003` / `MPR-RC-HELIXSECURITY-L2-003-002`、semantic digest `sha256:dc222ffbcdf2511878e805ad26239b4c5d9dd3c9d1a67982b48aee12f2fb8132`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L90`（section SHA `sha256:2d800eaf8c98669fc8f890559d4405efcd1b3d8855de573b59b70e7961541475`）、対L11 `27行`（section SHA `sha256:e68fcbc6750f2ce1d0508fccde5f97dfb9175e7e622cb22fc3b0d80817589eb0`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：OSからassignment/project identity、INFRASTRUCTUREから実環境identity、CONNECTから宣言済み接続identityを受ける。各機構は自分のstateを正本として保持する。 戻し先: identityが欠落、衝突、不明なら操作停止。identity構造の不足はL1-003へ、物理環境の不足は接続要求でINFRASTRUCTUREへ戻す。

**L3 acceptance (`SECURITY-AC-003-01`)**：A/Bのproject、tenant、environment、worktreeのstate、Agent、Hook、credential、memory、artifactの参照を提示し、明示接続のある作用だけが対象内に限定される。primary tree/他projectへのfallbackが発生、またはscope不明を許可にしたら不合格。tenantを含むfixtureは合成scope identityの境界確認であり、顧客tenant runtimeの構築を1.0の前提にしない。tenant dimensionが対象にない環境で存在を捏造せず、当該操作に適用されるtenant identityがある場合は照合を省略しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-003`。

### SECURITY-FR-004-01 — Agent/Hook/config integrity

project/root/HEAD/revision/digest/owner/scopeに構成を束ねる。stale、未知、他project構成を採らず、不足値を既定値で埋めない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-002（同前掲asset/path/lines/SHA）のTOCTOU再確認はstale/変更済み対象を通さない部分類似に限る。旧CAP-004はclassification/sink分離であり、構成revision項目とは直接一致しない。現在の構成項目は固定L2から再導出し、旧config形式を移さない。

- **固定親**：`HELIXSECURITY-L2-004` / `MPR-RC-HELIXSECURITY-L2-004-001`、semantic digest `sha256:58e9e513e934ff3c1ed8da378b05fcc7fdd3e2a27a503feb449bc7a305812d20`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L100`（section SHA `sha256:1373d55273872771775be0d6f770431d2675d52f23af0606989503eedeb0bc44`）、対L11 `28行`（section SHA `sha256:bd5cd1a6e0d604302743a36686d93c13fc57e95e62c48bbb64a17edc742911c5`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-003のidentityと、構成sourceのrevision/digest。Ownerが不明ならその不明を維持する。 戻し先: 対象のowner/scopeが不明ならL1-004へ戻し、実行を停止する。承認のない構成を推測採用しない。

**L3 acceptance (`SECURITY-AC-004-01`)**：正しいproject/root/HEAD/revision/digest/owner/scopeの構成だけを識別し、採用可能revisionとunknown/stale/他project由来の比較結果を返す。内容差分とauthority差分を分けて示し、stale revision、未知Hook、他projectのMCP設定を受け入れない。構成の一部欠落を既定値で黙って補ったら不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-004`。

### SECURITY-FR-005-01 — Credential/Secret境界

raw secretをAI context/log/artifactへ出さず、credential storeをWorkerへ直接公開しない。credentialのsecret/non-secret分類は固定L2-005が指す単一のcanonical classifierを使い、各消費者が独自分類を作らない。利用をactor/operation/target/environment/scope/expiry/目的に限定し、検査/revoke状態を扱う。値の混入・漏えいは停止。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-004（data classificationとsink authority分離）とCAP-005（external/destructive actionのexact target/action binding、同前掲asset/path/lines/SHA）は限定的な部分類似にとどまり、credential store/use/revokeに直接一致しない。current credential contractへ再導出し旧store/runtimeを持ち込まない。

- **固定親**：`HELIXSECURITY-L2-005` / `MPR-RC-HELIXSECURITY-L2-005-001`、semantic digest `sha256:8e8689912796e8fb3e22210619cb1283f6b27ab1804353dfa93fe43eec10a784`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L110`（section SHA `sha256:5eccc4d1683c144c57800071294756713aff52f78db467382665002c8ed39cad`）、対L11 `29行`（section SHA `sha256:19f3e8c523ec522f35982ed3837c21fb6c22623c587d17fd7ae6bad1f6a3f107`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-008 authority、L2-006 egress、Worker境界L2-007、INFRASTRUCTUREの安全な実資源境界。 戻し先: 欠落scope、期限切れ、未知のcredential class、検査不能はdeny/stop。方針の不足はL1-005へ、保存・注入境界はL2-024へ戻す。

**L3 acceptance (`SECURITY-AC-005-01`)**：全credential consumerが同一canonical secret classifierのidentity/revisionと判定を参照する。raw credentialはcontext/log/artifactに現れず、actor・operation・target・environment・scope・expiry・purposeが一致する利用だけを許可し、期限切れ/revoked credentialの後続利用を止める。repository混入、直接Worker露出、egress漏れ、値入りreceipt、consumer別classifierの作成/不一致、credential-use tupleの欠落/不一致があれば不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-005`。actor/environment/purposeは固定L2のcredential-use条件と既存L2-008 authority tupleから明示し、purposeを欠いた利用を許さない。

### SECURITY-FR-006-01 — Network/egress境界

送信元/destination/protocol/endpoint/path/classification/bytes/purpose/authority/expiryを照合し、明示許可された範囲のみ送る。unknownはdeny。定量上限を新設せず、L2-019/Core Asset Guardと1.x sink enforcementを1.0へ前倒ししない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-004（同前掲asset/path/lines/SHA）のdata classificationとsink authorityの分離は本要件の直接的な部分根拠である。egress scopeは固定L2から再導出する。旧CAP-006はruntime surface coverageであり、この要件への根拠ではない。asset別Web sink/publication policyは1.0へ含めない。

- **固定親**：`HELIXSECURITY-L2-006` / `MPR-RC-HELIXSECURITY-L2-006-001`、semantic digest `sha256:8bcb8c56772c18c8afb3bbd016cade4511da47533cbc39cb0f775860fe4bbee3`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L120`（section SHA `sha256:09459643b100dbe79ef0cf47100a4b56834d975ef309322bc3f8d7f4055d888a`）、対L11 `30行`（section SHA `sha256:a910c8b1352414d2e6e3ad39f093a936f19b8a3c353411eeefa7a877fba3f7e7`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-005のsecret検査、L2-016の1.0分類基盤（data-use classificationとasset exposure classの記録だけ）、CONNECTの論理接続、INFRASTRUCTUREの実network経路。L2-019のCore Asset Egress GuardとL2-016の1.x sink enforcementは依存に含めない。 戻し先: 宛先/分類/目的/authorityがunknownならdenyし、方針の意味差はL1-006へ戻す。物理経路の不明はL2-024へ。

**L3 acceptance (`SECURITY-AC-006-01`)**：送信先/protocol/endpoint/path/data class/bytes/purpose/authority/expiryを照合し、default-denyを基準とする許可一覧、operation別判断、計測値とdata-minimization結果を返す。明示許可範囲内だけ送る。分類はL2-016の1.0分類記録基盤から読み、L2-019や1.x sink enforcementが存在しない状態でも1.0の送信判定は成立する。vendor側privacy設定だけがある送信、未許可destination、未知classificationが通れば不合格。送信量上限は追加しない。L2-019のasset-specific egressは別の1.x受入とする。

**対応L11 acceptance**：`HELIXSECURITY-L2-006`。

### SECURITY-FR-007-01 — Worker実行環境への制約適用

path/network/credential/environment/timeout/resource/diff/rollback/result collection等の既存SECURITY制約をOS assignmentに基づき実行環境へ渡し、適用/観測を示す。enforcer ownerはWorker実行環境でありSECURITYではない。適用不能はunknown/停止、host fallback禁止。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧CAP-006（同前掲asset/path/lines/SHA）はruntimeごとのhook/sandbox coverageとunsupported時のhost fallback禁止を扱い、未適用時に停止する点だけ部分類似である。旧CAP-007はcanonical safety failureをlegacy greenで相殺せずreason receiptへ残す要件で、Worker制約適用とは別である。worker constraintsは固定L2から再導出し、旧Runner/Sandboxを復帰させない。

- **固定親**：`HELIXSECURITY-L2-007` / `MPR-RC-HELIXSECURITY-L2-007-002`、semantic digest `sha256:1ee4d42a1e4178d598ce11b75268845578ba83bcb8ea471e2642ff8630c49504`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L130`（section SHA `sha256:052c634e25dff6bd1cba742d240f87d07c6d395852e994414522e4fcd243f210`）、対L11要約表 `31行`（section SHA `sha256:bb6dc9697c4bc21ad94cce4f2ad97c796706327d33686858eed1831378b4c155`）、詳細な9制御受入 `69–87行`（network `76行`、resource `80行`、rollback `82行`、result collection `83行`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：Concept/Worker実行契約、OS assignment、INFRASTRUCTURE実資源、L2-003/005/006/008。旧Runner/Sandbox actorを復活させない。 戻し先: 未適用/未観測/unsupportedは実行停止・unknown。SECURITY方針不足はL1-007、物理enforcement欠落はINFRASTRUCTURE接続の候補へ戻す。

**L3 acceptance (`SECURITY-AC-007-01`)**：各制約（write path、network、credential、environment、timeout、resource、diff検査、rollback、result collection）がWorker実行環境へ渡り、適用・観測状態を確認できる。環境変数の許可setはSECURITY制約として定め、対象assignmentとpolicy revisionへ結び付ける。現行Worker実行環境が制約を適用し、その実適用をWorker/INFRASTRUCTUREの観測で確認する。raw secret valueや許可されていないsecret参照を環境へ渡さない。いずれか未適用/unknownなのにhost fallbackで実行、制約をWorkerが自己拡張したら不合格。read-onlyでもwrite禁止の適用と操作対象scopeの実行後の変更なし観測を要する。rollbackだけは変更なしを確認できた場合に限り適用対象外とでき、変更有無がunknownなら成功扱いしない。許可された既存credential capabilityの使用を一律禁止せず、raw値の露出・無許可利用と区別する。条件別fixtureは[L10 SECURITY-CASE-007-01の9制御fixture表](../L10-verification/functional-verification.md)で制御ごとに列挙する。

**対応L11 acceptance**：`HELIXSECURITY-L2-007`。

### SECURITY-FR-008-01 — 操作ごとのauthority

actor/target/operation/revision/environment/scope/expiryが一致するoperation別判断と理由を返す。read/write/execute/network/install/delete/merge/release/deploy/credential-use/security-changeを包括権限にまとめない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧asset（上記lines 1–176、25–55）およびtest asset `LEGACY-ASSET-170112AB2FA2FFDBFEE9`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md` lines 1–59、SHA `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4`: typed tuple/negative fixtureは部分的な前例である。旧runtime/testは実行しない。

- **固定親**：`HELIXSECURITY-L2-008` / `MPR-RC-HELIXSECURITY-L2-008-001`、semantic digest `sha256:6135842a799b9883cb29c5ce9e6ffcf601997d66cb3d314c8031ba9cbbae9f2c`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L140`（section SHA `sha256:e00f26365cfbe64a4ee8369a9f6001ca4f1fb6f7f933b8055dd6ea47f0019d59`）、対L11 `32行`（section SHA `sha256:05d6af862333dd496de98c2f469b6e50a9d2817442b7b1c83c93ac9348821a25`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-003 identity、L2-004構成integrity、L2-005 credential、L2-006 egress、OSの進行。 戻し先: 未認可、drift、expiry、unknownではdenyし、意味の変更はL1-008へ戻す。停止伝播はL2-009/022で検証。

**L3 acceptance (`SECURITY-AC-008-01`)**：異なるread/write/execute/network/install/delete/merge/release/deploy/credential-use/security-change操作で別authorityを要求し、actor/target/operation/revision/environment/scope/expiryが完全一致したときだけ影響の大きいoperationを許可する。Agent利用権から包括write/deployが生じる、または欠落・期限切れ・driftを通すと不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-008`。

### SECURITY-FR-009-01 — revoke/quarantine伝播

対象trigger/identityをOS assignment・Worker環境・CONNECT・credential/artifact accessの該当ownerへ相関可能に伝え、受領/適用/失敗/未観測を分ける。owner別stateを保持し、unknown伝播を対象operationとrisk scope内に制限。latency閾値は本FRで確定せず、固定L2-009が数値latencyを作らないとしているため、数値latencyのNFR候補も作らない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧SECURITY authority/受入source（上記）はrevoke/fail-close oracleの候補として参照するが、owner別の意味は再導出する。旧end-to-end機構横断flowを再利用したとは主張しない。

- **固定親**：`HELIXSECURITY-L2-009` / `MPR-RC-HELIXSECURITY-L2-009-002`、semantic digest `sha256:8fb04c1b20003123cbcb8f1b23adaca402e0d94d784473ca63f18ecabf544a84`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L150`（section SHA `sha256:1e0f47fdc6cdce52f324d178b6c927b4519ab9412f51f7bfb1def0a33df9abca`）、対L11 `33行`（section SHA `sha256:749fcd644ce86f164a511fcef1381bbfd9aba301fccd6c6ce4d8f01e7fd7324e`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-003/005/006/007/008、OS assignment、Worker実行環境、CONNECT、artifact access、INFRASTRUCTURE観測。 戻し先: recipient未応答・未観測・unknownの間は対象operation/新規割当てを止める。authority/policy意味差はL1-009へ、OS/Worker/CONNECT/INFRAのenforcement差はその接続先L1へ戻す。

**L3 acceptance (`SECURITY-AC-009-01`)**：revoke、scope drift、credential漏洩、異常通信、runtime逸脱、unknownを投入すると、OSの新規割当停止、Workerの実行停止と途中成果物隔離、CONNECT通信停止、credential使用停止、artifact access停止の該当先へ伝わる。どれかの該当停止が確認できず成功扱いで継続したら不合格。unknownは列挙triggerの安全上の影響や不明な外部副作用に関するものとし、無関係な一般文書の意味unknownを全操作停止へ広げない。operation/project/worker/credential/connection/artifactの該当identityに束縛して伝播し、recipient別の受領・適用・未達・未観測を区別する。

**対応L11 acceptance**：`HELIXSECURITY-L2-009`。

### SECURITY-FR-010-01 — 更新受入

15対象のsource/provenance/digest/dependency/permission/network/credential/config差分/new executable/known finding/rollbackを照合し、accept/reject/unknownと根拠を返す。単にversionが新しいだけでは受入れない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR `LEGACY-ASSET-EE5DBACC7F28F7D1F605`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` lines 22–349、SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）は能力/updateに隣接する根拠である。現L2の15対象と処置は再導出し、旧対象集合を再利用したとは主張しない。

- **固定親**：`HELIXSECURITY-L2-010` / `MPR-RC-HELIXSECURITY-L2-010-001`、semantic digest `sha256:8d63bbbd688538d1a743705539e404b3a684d0631fcd585c74ef387bfca2fb31`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L160`（section SHA `sha256:9f4db5957220915c4df1843aa0c02b647e35c54adbeb83fefe79da5c0870bdb5`）、対L11 `34行`（section SHA `sha256:8c5d010b69e32c1ba25e091f8b2eb07af70988ff06190786f394fc32005a2f89`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-011能力差分、L2-012 supply-chain provenance、L2-013 artifact integrity、L2-008 authority。 戻し先: 情報不足はunknown/reject、意味や必要な判定軸の差はL1-010へ戻す。実行/昇格はL2-023に従う。

**L3 acceptance (`SECURITY-AC-010-01`)**：source code、dependency、package、plugin、MCP、Skill、Agent definition、Hook、runtime config、sandbox policy、model、model weights、prompt/system instruction、Connector、infrastructure configurationの15対象それぞれについて、provenance、digest、dependency/permission/network/credential/hook-config差分、新規実行物、known finding、rollback情報が揃い採否と根拠を追える。単に新version、または欠落情報をunknownのまま採用したら不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-010`。

### SECURITY-FR-011-01 — Capability drift

同一file/hash/nameから能力不変を推定せず、更新前後のread/write/shell/network等のcapability差を識別する。比較不能はunknown。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR asset（旧path lines 22–349、全体SHAは上記）と旧受入test `LEGACY-ASSET-44DD86E3DEC09E65EF51`（`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` lines 1–200、SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6`）はrisk/changeの隣接例およびtest consumerの記録に限る。正確なcapability-diff条件は再導出。

- **固定親**：`HELIXSECURITY-L2-011` / `MPR-RC-HELIXSECURITY-L2-011-001`、semantic digest `sha256:dcd26abfcd8bff20835c05541fe7c3360e5e1a512679c48d6e7c53e368f22496`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L170`（section SHA `sha256:c75ce0a2c3ee1c84fc8b9b5c4a3221126fb74a2f967a4e377a4f4cff4809fd6f`）、対L11 `35行`（section SHA `sha256:ca300d27bd9d76885f8c7ceeb139db7d96bbca82e0b6211ac3005250dcfbdfbd`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-004の構成identity、L2-010のcandidate revision。比較不能はunknownとする。 戻し先: 能力を分類できない変更は受け入れず、分類意味の不足をL1-011へ戻す。

**L3 acceptance (`SECURITY-AC-011-01`)**：更新前後の構成・file差分・能力記述からversion差分、capability差分、security impactを対応付けて返し、model/Agent/MCP/pluginにも適用する。同じfile変更でもread-only→write+shell+networkの能力変化を検出する。比較不能はunknownとし、hash一致/ファイル名だけでcapability不変と結論したら不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-011`。

### SECURITY-FR-012-01 — Supply-chain provenance

package/container/repository/MCP/plugin/Skill/Agent/model/binaryごとにsource/producer/version/digest/dependencies/permissions/network/risk/update delta/rollbackを辿る。不明な供給元/能力をtrustedにしない。scanner/registry/providerの特定実装は要求しない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR/acceptance assetsはprovenance consumerの隣接資料に限る。source/producer項目は固定L2から再導出し、scanner/registry契約を再利用しない。

- **固定親**：`HELIXSECURITY-L2-012` / `MPR-RC-HELIXSECURITY-L2-012-001`、semantic digest `sha256:a9460cd56aa398e8b553910926987e8a7affc758781f1d0967540fd39acc6e1a`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L180`（section SHA `sha256:6d2afeee0c6f60a332265c1196c447f47b578e6e72700b8216d03d4e00f49a27`）、対L11 `36行`（section SHA `sha256:1663d911bb3c1800f17b00172f4e1ec8234cdc7605cb6d0dae2760bc3ed3c114`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-010更新candidateとL2-013artifact identity。特定scanner/registry/providerを新規必須化しない。 戻し先: 欠落または不一致はunknown/reject。対象範囲の変更はL1-012へ戻す。

**L3 acceptance (`SECURITY-AC-012-01`)**：package/container/GitHub repo/MCP/plugin/Skill/Agent/model/binaryでsource、producer、version、digest、dependency、permission、network、known risk、update delta、rollbackを辿れる。不明な供給元/実行能力をtrustedへ昇格したら不合格。これは1.0 provenance traceであり、後続版のCore Asset Guardやsink protectionの完成を要求・証明しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-012`。

### SECURITY-FR-013-01 — Artifact identity chain

生成/build/validation/配布/実行artifactのidentity/version/digest/provenance/producerを同じ鎖で照合する。欠落/mismatchで昇格を止める。digest一致だけでsource authorityやverification passを推定しない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR/acceptance assets（上記）は受入chainの隣接根拠に限る。artifact chainは現L2から再導出し、旧CI/runtime/testの実行や合格を主張しない。

- **固定親**：`HELIXSECURITY-L2-013` / `MPR-RC-HELIXSECURITY-L2-013-001`、semantic digest `sha256:e6daf304f8d09b86237dde6dfb2ec99029673ef920dcbd3538c56b449edeee3e`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L190`（section SHA `sha256:b5c2034525a6fd4314a2e5d3596fa812466e648c92080ca78883870945deda56`）、対L11 `37行`（section SHA `sha256:e775685b309e83121aca7eef7ac3116926920b447650fca4f1fe2a099ed03c97`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-010/012の更新・provenance、HARNESS verification receipt、OS promotion record。 戻し先: identity/digest mismatch、missing stepは昇格停止。意味や必要なidentityが不足ならL1-013へ戻す。

**L3 acceptance (`SECURITY-AC-013-01`)**：build/validation済artifactのidentityと配布/実行artifactのidentity・digest・provenanceが同じ鎖で一致する。異なるartifact、欠けた工程、digest不一致が昇格可能なら不合格。digest一致だけからsource trustやverification passを推定しても不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-013`。

### SECURITY-FR-014-01 — SECURITY永続化promotion判定

SECURITY単体としてmemory/training dataset/BRAIN knowledgeの3 target class別にsource/provenance/classificationからallow/deny/holdと理由を返す。機構横断handoff、LABO評価、BRAIN登録、保存実行は含めず、end-to-endはL2-027に委ねる。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：現行HELIXSECURITY-L2-014として採択済みの意味を要件化し、新しい上流要求を追加するものではない。旧SECURITY L3 broker、旧pillar L3 functional requirements（HR-FR表、特にP8領域）とそのacceptance、旧L3 test-designを検索範囲とし、memory/training/BRAINへのSECURITY単体判定という同一契約は見つからなかった。形式上の近接点はpillar L3 HR-FR-P8-04（旧path `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` lines 168–171、asset `LEGACY-ASSET-EE5DBACC7F28F7D1F605`、SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）および旧CAP L3全体（asset `LEGACY-ASSET-B62E49D2E156232B8C63`、SHA-256 `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7`）だが、直接継承ではない。対象3 class/判定/非保存境界は採択済みL2/L11から再導出する。

- **固定親**：`HELIXSECURITY-L2-014` / `MPR-RC-HELIXSECURITY-L2-014-002`、semantic digest `sha256:6acd2e5b89cc44bfbd70f4d545f666ee51fe356dcb59f7c6c985107f463a1276`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L200`（section SHA `sha256:bed52b952b89788736c7d8615f561b0eda6b08c5c7979f6fa7a834d86491887c`）、対L11 `38行`（section SHA `sha256:2e34f6860f09a6b70cc6e1d36e2cbdf122e4c26168d3f7528983abde1e10957f`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：SECURITYは3 target classごとのsource/provenance/classification判定と理由付きdecisionだけを所有する。入力metadataは各source owner、memory/training/BRAINへのhandoff・保存は各target owner、業務上の保存可否意味はL1-014のownerが正本を持ち、LABO評価とBRAIN登録を本unitに含めない。依存は固定L2-014に明記されたL2-001/002のsource trustとL2-015/016の1.0 identity/classification入力であり、1.x sink enforcementは含めない。provenance/classification欠落はhold/denyしてsource ownerへ補足を返す。判定対象・意味の変更はL1-014へ戻し、機構横断handoffはL2-027のownerへ返す。

**L3 acceptance (`SECURITY-AC-014-01`)**：SECURITY単体のdecision tableへmemory、training dataset、BRAIN knowledgeの3 target classを個別に入力し、L2-001/002に基づくsource trustと、L2-015/016のidentity/classificationを照合する。source/provenance/classificationが欠落・unknown・target不一致ならhold/denyし、理由付き判定を返す。Memory poisoning、Prompt Injection persistence、training contamination、BRAIN contaminationにつながる入力も該当target classの判定理由として識別し、単体判定から保存・機構横断受渡しを主張しない。Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINの機構横断受渡しや保存成功をこの単体試験で主張したら不合格。L1-014の構成体kindと3経路の成立はL2-027だけで受け入れる。

**対応L11 acceptance**：`HELIXSECURITY-L2-014`。

### SECURITY-FR-015-01 — Asset identity基盤

列挙資産および列挙外資産に対してowner/identity/source/revision/digestを識別し、内容dumpなしで追跡可能にする。1.0はidentity基盤、Web実利用保護は1.x。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR asset（上記）はcore asset/provenanceに隣接する根拠に限る。現在のHELIX資産一覧はPOを起点に再導出し、包括的保護scopeを引き継がない。

- **固定親**：`HELIXSECURITY-L2-015` / `MPR-RC-HELIXSECURITY-L2-015-001`、semantic digest `sha256:6307d5833296e0c438401e8a4a11221a601da0c1389bd813cfb4641fee114a6a`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L210`（section SHA `sha256:40e3bd42faa4b4b89c41a80b291f61c27bcff197a6ac924bedfd370cfe92c147`）、対L11 `39行`（section SHA `sha256:1f940c5d714564fca0b15359607e1094efbcfda9e0a47cc97dfd9f63767a42b4`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：各資産ownerからのidentity/provenanceとConceptのdata-use classification。 戻し先: owner/identityが不明ならunclassified/unknownとして保留し、範囲の不足をL1-015へ戻す。

**L3 acceptance (`SECURITY-AC-015-01`)**：§16列挙の HELIX-HARNESS-CORE（HELIX-JSON、Python meaning core、Requirement Engine、internal verification logic）、HELIX-BRAIN（Patterns、Units、Parts、accumulated design knowledge）、HELIX-INTELLIGENCE（internal prompts、judgment configuration、specialist models、routing / diagnostic logic）、HELIX-LABO（episodes、evaluation corpus、training material）、HELIX-OS（authority/state、topology、operation records）、HELIX-SECURITY（policies、credentials）をowner、identity、source、revision/digestで識別できる。列挙外資産も分類対象となり得る。内容をdumpせず識別不能をpublicと扱ったら不合格。受入は1.0 identity baseだけでWeb保護完了を宣言しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-015`。

### SECURITY-FR-016-01 — Asset exposure classification基盤

public/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secretとunknownを定義・asset identityへ記録する。unknownをpublic/allowと推定しない。1.x sink enforcementを1.0 acceptanceにしない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR/acceptance assets（上記）はdata sensitivityの隣接例に限る。6分類語彙と版境界は固定PO/L2から再導出し、1.x Web sinkを前倒ししない。

- **固定親**：`HELIXSECURITY-L2-016` / `MPR-RC-HELIXSECURITY-L2-016-001`、semantic digest `sha256:4b57ed4eccad237ce1a952559682456afa7ec1b4578865c3eac452e8b7bc7392`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L220`（section SHA `sha256:b5ce60587c348e5c055053a1b79187d36ef76a6a816733648a3fc73492ab951c`）、対L11 `40行`（section SHA `sha256:3e3b6e6d56a643ee76b377cbfff5917628782bbee2bf69bf97afd9efe84baea6`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-015 Asset identity。分類の定義ownerはSECURITY。sink enforcementを必要としない。 戻し先: 未分類/unknownはunknownとして保持し、公開allowの根拠にしない。分類意味の変更はL1-016へ戻す。

**L3 acceptance (`SECURITY-AC-016-01`)**：1.0ではpublic/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secretの全6分類を定義し、asset identityへ分類とunknownを記録できる。分類不明をpublic/allowと扱う、または分類記録が欠ければ不合格。1.xではL2-019/025が各sinkへ分類を適用し、confidential以上を無条件出力しないことを別途受け入れる。1.x条件を1.0完了の証拠にしない。

**対応L11 acceptance**：`HELIXSECURITY-L2-016`。

### SECURITY-FR-020-01 — Guard/Bot責務境界

Injection/Scope/Hook/Secret/Egress/Runtime/Permission/Core Asset Guardの決定的条件をBot不在時も判定可能とし、意味診断Botは必要時、限定目的/authorityで接続する。例示Bot全部を1.0必須化せず、包括writeを与えない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR/acceptance assets（上記）は決定的enforcementと分析の区別に隣接する根拠である。現Guard一覧とBot任意境界は再導出し、旧Bot一覧/runtimeを保持しない。

- **固定親**：`HELIXSECURITY-L2-020` / `MPR-RC-HELIXSECURITY-L2-020-002`、semantic digest `sha256:ff4c66c0065372a575fd0dfef3ac759cad15684d78a0712d7320de383bbe7b80`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L260`（section SHA `sha256:196ce1051902b8e8ca91d8a78998ade4caf3b3fa5cb837fb81b09e72aecb34da`）、対L11 `44行`（section SHA `sha256:e1f35dbf0b682c5116651b9ae56775164928126e546ae8a3b8c7a57448b41fe5`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-008 authority、Worker契約、INTELLIGENCE発行interface。 戻し先: Guard未定義/不適用はenforcementのownerへ戻す。Botがいないことだけで1.0を不成立としない。境界意味の変更はL1-020へ戻す。

**L3 acceptance (`SECURITY-AC-020-01`)**：Injection Guard、Scope Guard、Hook Guard、Secret Guard、Egress Guard、Runtime Guard、Permission Guard、Core Asset Guardの決定的判定をGuard側に置く。Bot候補例のSecurity Audit Bot、Injection Analysis Bot、Core Probe Detection Bot、Supply-chain Review Bot、Security Diagnosis Botはsemantic judgement/diagnosisのため必要に応じINTELLIGENCEへ接続する。候補例は全Botの初版実装・運用を要求しない。Bot不在を理由に決定的制約が抜ける、Botが包括Write権を持つ、候補を全て1.0必須runtimeとするなら不合格。Core Asset Guardの名称を保持しつつ、1.0のGuard基盤とL2-019/025の1.x公開sink適用を別に判定する。名称の列挙だけで完全なasset-specific egress/Web保護を1.0へ前倒しせず、逆に1.0のcredential・一般egress・operation guardを延期しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-020`。

### SECURITY-FR-028-01 — SECURITY pack更新受入

HARNESS descriptorへSECURITY artifact identity/version/digest/dependency range/provenanceとL2-010/013条件を束ね、SECURITY固有accept/reject/unknownを返す。共通pack lifecycle/rollback/unfinished obligationはHARNESS ownerに残す。version_targetは実artifact versionではない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧pillar FR asset（上記）はupdate/integrityに隣接するのみ。現在の機構間descriptor owner分割に直接相当する旧要件は確認されていない。固定L2-010/013とHARNESS-L2-010/011から再導出。

- **固定親**：`HELIXSECURITY-L2-028` / `MPR-RC-HELIXSECURITY-L2-028-002`、semantic digest `sha256:76740f351c9bad546326e6f322ba4358348f622799a644ad1f4e0372c5ecefb1`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L342`（section SHA `sha256:af3954bd55e6b230bb615ff295c7926ef29c95e3c2cd5954250df0cf022d16b1`）、対L11 `52行`（section SHA `sha256:40bf0c7a90dbac79da072bee458309750676a1e80640dd067becc97cade6b16e`）。PO decision `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体SHA `sha256:25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：SECURITYはartifactのSECURITY固有accept/reject/unknown（provenance、許可、対象version/range条件）だけを所有する。HARNESSは共通descriptor・交換・rollback・未完義務lifecycle、OSはassignment/progression、artifact ownerはartifact identity/sourceを所有する。依存はHARNESS-L2-010/011共通pack契約、SECURITY-L2-010/013、該当artifact owner宣言。戻し先: SECURITY固有の受入軸の意味変更はL1-010、artifact identity/integrityはL1-013、共通pack契約不足はHARNESS ownerへ返し、本unitで補完しない。

**L3 acceptance (`SECURITY-AC-028-01`)**：HARNESS-L2-010/011の共通pack descriptorを入力し、SECURITY更新candidateのidentity/version/artifact digestがdescriptorと一致し、dependency versionが宣言compatibility range内で、provenanceとL2-010/013のSECURITY条件を満たす場合だけSECURITY固有の受入判定を返す。`version_target`は目標版で実版ではない。identity/version/digest欠落、不一致、range外、unknownを通せば不合格。共通交換/rollback/未完義務lifecycleの所有・受入をSECURITY-L2-028の証拠に含めたら不合格。

**対応L11 acceptance**：`HELIXSECURITY-L2-028`。

### SECURITY-FR-033-01 — 外部AI Worker context bindingと出力境界

対象は外部AI Worker task dispatch。既存descriptor/assignment/current HEAD/SECURITY authority/rule revisionを同じtask contextへ束ね、L2-008/007成立時は既決有効authorityを再利用して起動する。Workerはassignment-bound隔離で実行。raw secret値またはsecret/機密task内容が外部Workerに露出する場合に限りdeny。一方、credential-use capabilityだけを理由にdenyせず、PO採択P0訂正どおり、raw値を露出しない既存credential capabilityを使うtaskは、既存operation authority・L2-007・egress条件を満たせば通常作業の都度承認なしで起動可。出力だけでauthority/approval/assignment/requirements/verified/canonical stateを作らない。新packet schema/runtime registry/per-task approvalなし。

**版/採択境界**：SECURITY L2/L11の固定親は旧来の f6dad2 ではなく `318ec4a04abb3c1cc17111b3d939f913facd5fd3` の訂正後 -002 revision。PO記録 `docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L92,L113,L124` によりP0訂正付きL11を採択対象とする（L11追補節digest `sha256:e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`）。L2 front matterの旧「未採択候補」文言をauthority根拠にせず、対象revisionとPO decisionを組で読む。credential-use capabilityだけで一律denyするoracleは採らない。

**要件版**：Stage 1 / `version_target: 1.0`（SECURITY-L2-015はidentity基盤のみ、016は分類記録のみ、020はGuard 1.0、028のsecurity固有更新判定、033はPO採択訂正版のscope）。

**範囲外**：親の意味・範囲・担当・版を変えない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示せる（実装値・承認値ではない）。実装方式・schema・registry・provider/runtime・承認手続きを要件として固定しない。1.x/Web sink/publication conditionsを1.0へ前倒しせず、保留・不採択identityを親にしない。

**旧HELIX対応（再利用/再導出/置換）**：旧 `HR-FR-P2-05` はarchive source `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md` line 428（asset `LEGACY-ASSET-02319C2481B9E01698D5`、whole-file SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）および6fabd125 baselineの同path line 409（fixed commit `6fabd125`、whole-file SHA-256 `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1`）を別revision atomとして参照する。旧SEC-FR-CAP-007（asset `LEGACY-ASSET-B62E49D2E156232B8C63`、旧L3 path/SHAは上記）は理由receiptに全failure reasonを記録する点だけの形式上の類似で、credential-use/Worker dispatch意味の根拠にはしない。2 source atomを統合せず、holdingを変更・解除しない。採択sourceは固定L2 registration `MPR-RC-HELIXSECURITY-L2-033-002`。PO decision `po-decision-2026-09-29-57candidates.md#L92,L113,L124`はP0訂正済みL2/L11をSHA/digestで固定する。旧「secret task deny」の文言だけでは認証済みcredential-useの扱いを確定できず、POは訂正を採択した。訂正前の未採択表現を有効なoracleとして使わない。

- **固定親**：`HELIXSECURITY-L2-033` / `MPR-RC-HELIXSECURITY-L2-033-002`、semantic digest `sha256:b486a0c44e8f21a6f8738dedeac91dcb94da335b73409b6adeaecf8fa639bf1a`。L2 `docs/helix-security/L2-requirements/security-requirements.md#L455`（section SHA `sha256:ccb516e4eb6e0943e7d634e359a45370eabc31c597daa3fc5afb790895461004`）、対L11 `124行`（section SHA `sha256:437651116a0b5571759c217733ee29a93ae4d4ae3b35bdb5f0377f1352186659`）。PO decision `docs/governance/decisions/po-decision-2026-09-29-57candidates.md`、固定revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`。L2全体SHA `sha256:d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5`、L11全体SHA `sha256:e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556`。追加採択補正のsource pinは別spanとして扱う：fixed revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3` のL2 `security-requirements.md:479-485` raw SHA `15c0ea7827a41bd6bca6ba2b0fb70597ad1e9a9d27b5073687b2b41745fdc6df`、L11の既存033節 `security-acceptance.md:124-133` raw SHA `6d83abe63e3e852d58d9a9a60ae39c6b29284b6b8ab781bdb86456e479e60be0`、P0補足 `145-151` raw/PO採択追加受入digest `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`、PO追加受入行 `po-decision-2026-09-29-57candidates.md:124` raw SHA `a24ae9b3400a40b478dddcfe3374a6df602b807cb0803973faeac44f6872b35f`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：OSはassignment/progression、Worker環境ownerは実行隔離/enforcement、SECURITYはauthorityとcredential/egress条件、HARNESSは共通task contract/証拠交換を所有する。CONNECTは伝送結果を所有するが送信authorityを生成しない。依存は既存assignment、L2-005/006/007/008、HARNESS共通契約に限る。bindingが欠落/unknown/stale/不一致ならdispatchを停止し、対象revisionと不足をOS assignment ownerへ返す。policy意味の変更は該当SECURITY L2 ownerへ戻す。

**L3 acceptance (`SECURITY-AC-033-01`)**：主Workerの通常taskに、追加runtimeだけを対象とするL2-029のopt-out/public-only条件やL2-031のproposal-only/canonical no-access条件を本要件だけで課さない。選択した追加runtimeではL2-029/031と既存L2-005/006/007/008の条件を同時に適用する。各taskでは対象assignmentのWorker descriptor、dispatch時HEAD、既存authority、規則revision、task boundaryが一致し、適用されるL2-007制約を確認する。Worker version/config変更、target変更、規則revision変更、authority revision変更、assignment scope変更をそれぞれ独立に与え、各変化で以前のbindingを流用せず該当scope・revisionを再照合する。互換性が確認できない場合はunknown/denyとして対象dispatchを止め、既存OS assignment ownerへ返す。新しい固定schemaや別の承認者を補作しない。raw secret値またはsecret/機密task内容を渡す場合は拒否する。一方、PO採択P0訂正に従い、既存operation authorityと非公開・範囲付きcredential-use capabilityを使い、適用されるL2-007と該当egress条件を満たすtaskは、credential-useだけを理由に一律denyせず追加の毎回承認なしで起動可能とする。SECURITYがassignmentを決める、OSがauthorityを決める等のowner代行、または有効な既決authorityへ都度の人間承認を追加する変異は不合格とする。Worker出力単独からauthority、承認、assignment、要求状態、verified、canonical stateを生成しない。別の無関係taskを一律停止しない。

**対応L11 acceptance**：`HELIXSECURITY-L2-033`。

## Stage 2c — HELIXSECURITY-L2-031（部分草稿追補）

### 適用範囲・固定親

本追補は追加runtimeの単体境界のみで、全L3完成・承認・実装を示さない。固定親は `HELIXSECURITY-L2-031`、`MPR-RC-HELIXSECURITY-L2-031-001`、revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`。`docs/helix-security/L2-requirements/security-requirements.md`の全文SHA-256は `d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5`、427–446節のnormalized SHA-256は `db2fd29654cc210b3c06568f4e421560b069d36f8d69f04fbe413d83ad532765`。登録IDは `MPR-RC-HELIXSECURITY-L2-031-001`、PO判断は[decision 57 L90](../../governance/decisions/po-decision-2026-09-29-57candidates.md#L90)。対L11 `docs/helix-security/L11-acceptance/security-acceptance.md`は固定revision同一、全文SHA-256 `e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556`、104–115節のraw SHA-256 `3b2700d511ea0feb8bbeb3dcedd7dd3eb9d1a26a2aeb9c79f57f835c045c0cd7`。依存4区分の実本文はL2-031 438–441行で照合する。

適用対象はL2-029が定義する主Worker契約外の追加runtimeだけ。SECURITYは既存条件下のallow/deny/constrain、classificationとauthority判断を所有し、OSはassignment/progression、Worker環境/INFRASTRUCTUREは実行隔離と適用観測、HARNESSはproposalの既存oracle再検証を所有する。通常主Worker、追加runtimeを選ばないtask、無関係scopeへ一律に広げない。既存のoperation authorityが同じtaskの反復を許す場合、作業ごとの人間確認を追加しない。

### 旧sourceの項目別対応

| 現行L2-031の項目 | 旧asset/path/行/SHA | 判断と限定 |
|---|---|---|
| 追加runtime・proposal-only・canonical到達禁止 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:84`、全文SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | HIL-BR-32のproposal-only、隔離、canonical/credential非到達、機密委譲禁止を隣接起点として照合。旧`.helix/`とharness DBは現行機構の正本名・pathでないため現要件へ再導入しない。現L2-031が定めた適用範囲へ再導出し、asset authorityは継承しない。 |
| proposal・隔離実行・再検証 | `LEGACY-ASSET-C7F0C3B79CBAA72960BF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:57,86`、全文SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6` | HR-FR-HIL-23とHAC-HIL-23a/b/cのconsumer/oracle構造を読んだ。隔離proposalと再検証、逸脱拒否の共通意味だけを部分再利用し、現行owner・scopeは採択L2から再導出。quota/egress fail-close、bypass常態化、環境浄化全般は031の充足claimへ含めない。 |
| 具体的受入consumer/oracle | `LEGACY-ASSET-FA8C6E69463183D6A19B`、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:55`、全文SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a` | HAT-HIL-23が列挙するsandbox/egress/payload/FS diff/audit、機密漏洩・allowlist外通信・bypass・未検証proposalをconsumer/oracle資料として確認。旧testは実行していない。 |
| sandbox／payload／revalidationの旧要求群 | 同 `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、同L1 source:84,154–159,217–220、同SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | HIL-FR-64..67とHIL-NFR-37/39のうち現L2-029/031に明記された分類、最小copy、credential/canonical遮断、proposal再検証、local enforcement境界のみを既存条件として保持。HIL-FR-68のadapter、HIL-FR-69のharness.db audit schema、旧path/configは置換する。HIL-NFR-38 bypass lifecycleとHIL-NFR-40 quota/rate制限は本親の要件ではなく数値・routeを追加しない。 |

旧test-designのstatus `designed_not_implemented` を実行済み・承認済み証拠として扱わず、旧assetの採否を現行authorityへ引き継がない。

### `SECURITY-FR-031-01` — 追加runtimeのscopeと既存authority
L2-031が宣言する依存4区分を、同じ対象revisionで分類する。常時必須はL2-029、005、007、008、HELIXOS-L2-018、HELIXINFRASTRUCTURE-L2-010であり、対象ごとにdependency identity、owner、contract version、適用range、scope、compatibility evidenceを一致させる。採択済みpack revisionでこの宣言を固定し、いずれかが未解決の間はruntimeを開始しない。外部runtimeへ接続またはdata送信するoperationでは006を、停止/逸脱時は009を、proposalを検証・採択・昇格するstageでは022/023と該当HARNESS verification・OS promotion/handoff条件を適用する。選択した入力元だけsource dependencyを閉じ、未選択sourceは未観測とする。旧BR/HR/HAC/HAT/WCCは意味basis/consumer資料であり実行dependencyではない。HARNESS-L2-023は4区分を宣言する参照契約で、010/011を031の常時dependencyとしない。後段条件をproposal生成前の承認へ前倒ししない。

L2-029で対象となる追加runtime operationについてのみ、SECURITYは既存policy・classification・operation authorityを対象runtime/config、operation、target revision、scope、expiryに照合し、allow/deny/constrain/unknownと理由を返す。主Workerや追加runtimeを使わないtaskにはこの要件を適用しない。既存authorityが許す同一taskの反復に、新しい承認者や毎回の人確認を加えない。L2-005/006/007/008/029の条件をこの要件で置換・緩和しない。

**受入条件**

- **`SECURITY-AC-031-01` scope/authorityの限定**：追加runtime、既存policy/authority、OS assignment、対象revision/scopeが一致する合成fixtureでのみ判定を返す。常時必須のL2-029/005/007/008、OS-018、INFRASTRUCTURE-010をそれぞれ個別にmissing/stale/wrong-scope/wrong-version/out-of-range/compatibility-unknownへ変異し、該当runをholdして宣言ownerへ戻す。採択済みpack revisionとdependency declaration自体が未確定のcaseではruntime開始を保留する。006/009/022/023等はFR-031-01に定める操作/段階条件に限る。scope/authority driftは既存経路へdeny/unknownとして返す。HARNESS-L2-023は参照契約とし、010/011を常時dependencyへ戻さない。主Worker・無関係operationを巻き込まず、許可済み同一authority内の反復に新しいper-task confirmationを要求しない。

### `SECURITY-FR-031-02` — proposal-onlyとisolated copy

追加runtimeにはowner/systemが選択・複製した最小payloadをcanonical sourceから分離したassignment-bound isolated working copyで提供する。runtimeはそのcopyの許可範囲でproposal/限定diffを返せるが、canonical repository、要求・authority・ticket/assignment/workflow/evidence/receipt stateへの直接read/write、commit、accept/promoteを行わない。SECURITYはpolicyの可否と判断理由を返し、OSや実行環境を代行しない。

- **`SECURITY-AC-031-02` 直接到達拒否とproposal許可**：限定copy内での読み取り・提案・許可内編集はproposalとして回収可能。一方、canonical pathまたはstateへの直接read/writeとproposalからauthority/ticket/acceptance/merge/promoteを作る各attemptは拒否・停止される。canonicalアクセスを試みたreceiptはauthority変更にならない。

### `SECURITY-FR-031-03` — data/credential境界の保持

L2-029のclassification、opt-out、secret/機密task遮断と、L2-005/007/008の既存credential・制約・authority条件を常時適用する。L2-006は外部runtimeへ接続/data送信するoperationで必須とする。L2-009は停止/逸脱時、L2-022/023と該当HARNESS verification・OS promotion/handoff条件はproposalの検証・採択・昇格stageで適用し、後段条件をproposal生成前の追加承認へ変換しない。raw credentialをruntimeへ渡さず、raw valueをcontext/env/payload/artifact/receiptへ出さない。既存の範囲付き非公開credential-use capabilityはその既存条件が満たされれば使用でき、credential利用というだけの一律拒否を加えない。customer-owned/service-internal等を031だけでpublic-onlyへ狭めず、opt-out完了をsecret/機密委譲の許可へ読み替えない。

- **`SECURITY-AC-031-03` classificationとsecret非到達**：L2-029が許すclass/opt-out/authority条件では既存範囲で評価可能。unknown分類、raw secret要求、secret/機密task内容、適用不能なegress/隔離条件は拒否またはunknownで停止し、合成secret markerの値はどの出力にも現れない。既存credential capabilityの正常例はraw値なしで許可され、一律拒否されない。

### `SECURITY-FR-031-04` — 実行後receiptと責務境界

実行前にはpolicy/authority、assignment、runtime/config、payload manifest/digest、scope、execution constraintsを照合し、result/diff/完了receiptを開始前提にしない。実行後はWorker/INFRASTRUCTUREの観測とOSの既存assignment記録によりresult/diff receiptが作られ、HARNESSが選択済みoracleでproposalを再検証する。receiptは後続証拠であり、SECURITY判断、OS昇格、HARNESS受入を単独で生成しない。

- **`SECURITY-AC-031-04` 順序・適用観測・担当**：結果receiptのない実行前入力でpolicy条件を照合できる。Worker環境/INFRASTRUCTUREがpolicyで指定された隔離・data/credential/egress条件の実適用観測を返し、SECURITYが同一対象revision/scopeとowner別責務へ突合する。deny/unknown後にhostへfallbackして実行した場合、またはpayload・credential条件・data classificationが変化したのに旧照合を流用した場合は不合格とする。SECURITYがcommitを決定する、INFRASTRUCTUREがSECURITY authorityを発行する、OSがenforcerまたは実資源を代替する越境も拒否する。Workerの自己申告だけでHARNESS再検証を満たしたり、HARNESS再検証を迂回してOS昇格を成立させたりする変異も拒否し、HARNESS verificationとOS promotionは各ownerの既存条件に戻す。観測欠落・非適用・別revision/scope/assignment/runtime/target・誤owner・drift・scope外diff・egress逸脱・既存quota制限による失敗は対象runを成功扱いせず停止/隔離し、未完義務を添えて既存HELIXSECURITY-L2-009の停止伝播へ渡し、OSの既存assignment/未完義務記録へ返す。quota上限や新しいretry/routing規則は本要件で追加しない。SECURITY自身はenforcementや実行receiptを生成しない。OSはprogression/未完義務、Worker環境/INFRASTRUCTUREは実行・観測、HARNESSは既存oracle再検証を担当する。SECURITYはassignment、commit判断、実行、資源配置を所有しない。receiptだけでproposalをaccepted/canonical化したら不合格。

## Stage 3 — 選択operationのruntime・profile安全境界

本節は採択済み1.0の029、030、032、034、035を親とする未承認草稿である。固定親の本文中の候補状態表示は、その後の対象revision付きPO判断と組で読む。035はPOが**scope A（追加runtimeだけ）・配置A（SECURITY policy、Worker強制、OS運転）**を選択済みであり、未決として再質問しない。032のdeny優先は主Workerと追加runtime双方に適用する。草稿は実runtime使用、bypass、MCP起動の許可を生成しない。

各親が定める依存・適用範囲を個別に保つ。SECURITY-035は固定L2-035自身が定める4区分（常時、選択操作時、選択runtime入力時、参照資料のみ）を保持し、HARNESS-L2-023の分類例を別親へ移植しない。SECURITY-031も固定L2-031自身の4区分を使う。旧runtime/tool/testは参照資料のみで、現行policy・authority・oracleを参照のみへ落とさない。

### `SECURITY-FR-029-01` — 追加runtimeの委譲分類と型別ローカル証拠

選択した追加runtime operationについて、source/target revision、runtime identity/version/config、OS-018 assignment、採択済みSECURITY-029 scope、SECURITY-007が要求する許可隔離環境とその適用状態を常時入力する。operationに応じてdata分類、許可path・検査結果、opt-outの対象・出所・時点、既存authority・適用policyと実環境観測も受ける。SECURITYは委譲可否・不足・採用条件の充足状態を別々に返す。機密以上はpath allowlistとsecret/PII検査を含むローカル制御で遮断し、分類unknownをpublicへ丸めない。opt-out未完・不明では既存条件を満たす公開可能コードだけを限定委譲でき、runtime採用は未完のまま。完了後も機密以上を許さない。

ローカル保証は同じtupleのsandbox適用、該当network operationのallowlistとegress実測、該当write operationのFS差分を型別に返す。全operationへ四型すべてを課さず、read-onlyは既存007のwrite禁止と対象scope不変oracleを使う。適用性unknownを非該当へ落とさない。provider UI・宣言・flagはopt-out申告の出所として残せるがローカル強制の代用にならず、ローカル成功はprovider訓練停止の証明でもない。SECURITYはpolicy、INFRASTRUCTURE/Workerは適用観測、OSはassignmentと未完義務を所有する。対象外の主Worker・未選択sourceを止めず、別tuple証拠への暗黙fallbackをしない。

- **`SECURITY-AC-029-01` 分類・委譲・採用の分離**：publicと機密/secret/PII・unknown、およびopt-out完了/未完/不明を個別比較し、機密以上を遮断する。public codeであっても既存のoperation authority、target/scope、expiry、許可隔離環境と適用検査を省略しない。未完opt-out下の適格public委譲は採用完了へ昇格せず、有効な既存scoped credential-useだけを理由に拒否しない。これは追加runtimeだけに適用し、主Workerの許可済み非公開repository作業を029の追加制約だけで止めない。
- **`SECURITY-AC-029-02` 型別適用観測**：選択operationごとにsource/target revision、runtime identity/version/config、OS-018 assignment、029 scope、許可隔離環境の実適用状態を常時結び、各要素の欠落/stale/scope不一致を該当runの未完として扱う。payloadまたはclassificationが変わった場合も旧判断・証拠を流用しない。加えてoperationに適用されるsandbox/allowlist/egress/FS差分を型別に独立照合し、一型の欠落/不一致/unknownを他型で相殺しない。read-onlyやnetworkなしの根拠付き非該当と適用unknownを分け、全operationへ未規定の制約を広げない。個別fixtureは`SECURITY-CASE-029-04`を参照する。
- **`SECURITY-AC-029-03` 出所・版・owner**：runtime/config/target/scope/payload/classificationの変更で旧証拠を流用せず、常時必須tupleまたは適用条件の不足をpolicy/実環境/data/runtimeの宣言ownerへ返す。provider申告とローカル適用観測を独立に保持する。追加runtimeが主Workerであると名乗るだけで029条件を逃れる変異と、主Worker通常taskへ029のopt-out/public-only・機密以上遮断を拡張する変異をいずれも拒否する。1.x Web強制を生成しない。CASE-029-04でtupleの個別欠落とこの戻し先を照合する。

### `SECURITY-FR-030-01` — agentic自動適用範囲の変更確認

自動適用への新規昇格・task/operation/data/実行範囲の拡大について、変更前後revision、段階・scope、操作権限、最小権限、監査経路、巻戻し/停止、risk ownerの実責務と戻し先、継続監視/異常検知、変更に対応するthreat model、継続risk reviewを受ける。各条件の充足/不足/unknownと根拠を返し、揃わなければその拡大を認めず以前の状態・未完義務を保持する。risk ownerの名前だけでは責務充足としない。INTELLIGENCEの意味判断、HARNESSの検証、Worker/INFRASTRUCTUREの強制、OSの昇格運転を代行しない。有効な同一revision/scopeでの通常反復へ追加の都度承認を設けない。

- **`SECURITY-AC-030-01` 独立条件の照合**：固定親の各条件を同じ変更revision/scopeへ結び、各欠落/unknownを個別に示す。監査ログだけで監視・巻戻し・risk reviewを満たした扱いにしない。
- **`SECURITY-AC-030-02` 変更・監視・未完保持**：新接続先/能力/data範囲を加えた対象へ旧確認を無検査で流用せず、該当拡大だけを保留する。継続監視で条件喪失を検出したとき既存009の対象停止/隔離経路へ返す。
- **`SECURITY-AC-030-03` 既決範囲とowner**：有効な同一条件内の通常反復は新しいrisk承認者・人間approveなしで既存判断を再利用できる。SECURITYの条件照合をOSの昇格・操作許可やINTELLIGENCEの意味判断へ昇格させない。

### `SECURITY-FR-032-01` — Worker操作のpermanent deny優先

主Worker/追加runtimeを問わず、repository-level bypassを試みる操作へ、対象repository/operationと既存policy revision・適用状態、one-shot marker/provider flagを束縛する。有効なpermanent denyに下位機構から許可・解除を与えず、unknown/staleは既存fail-closeへ返す。deny非適用を確認した操作は既存008 authorityへ戻し、本要件から新しいallow/denyを発行しない。policyの変更主体・解除手続き・承認者は増設しない。

- **`SECURITY-AC-032-01` 同一対象の優先**：主/追加Workerそれぞれに有効denyとone-shot/provider flagを個別入力し、下位機構後もdenyが維持される。
- **`SECURITY-AC-032-02` 適用状態の分離**：主Workerと追加runtimeの対象操作について、unknown/staleと確認済み非適用を区別し、前者は既存fail-close状態で保持し、後者は既存authorityへ戻す。provider/runtime区分で適用漏れを作らず、無関係操作への一律deny、policy変更主体・失効主体・追加承認者の新設、旧runtime/enforcerの復帰、032から035のprimary適用を生成しない。

### `SECURITY-FR-034-01` — MCP profile別operation条件

既存CONNECT/構成経路が選んだprofile identity/revision、tool capability、read-only probe指定、要求operation、credential要否/egress先を受け、既存004/005/006/007/008によるprofile別allow/deny/unknownと不足理由を返す。read-only指定probeへwrite/副作用capabilityを割り当てず、raw secret要求を拒否する。有効な非公開scoped credential-useは既存条件内で利用可能であり一律禁止しない。別profile/revisionの条件やCONNECT互換性でpolicyを補わない。catalog列挙・typed設定・probe供給・登録集合の未完意味はそのownerへ保持し、registry/schema/probe方式を補作しない。

- **`SECURITY-AC-034-01` profile束縛とprobe**：同一profile/revisionのcapabilityとoperationを照合し、欠落/unknown/stale/不一致およびwrite可能probeをそのprofile operationでdeny/holdする。
- **`SECURITY-AC-034-02` secret・egress・authority**：raw secret、未許可destination、authority tuple不成立を個別に拒否し、既存条件を満たすscoped credential-use正例を通す。
- **`SECURITY-AC-034-03` ownerと未closure**：CONNECTのidentity/互換、SECURITYのpolicy、Worker/INFRASTRUCTUREの適用観測を分ける。CONNECTがcredential/egress/tool safety policyを発行する、SECURITYがprofile registryまたは業務上の意味を所有する、Workerが制約を自己拡張する各変異は不合格とし、既存ownerへ戻す。未確定catalog/typed/probe意味は未closureとし、無関係profileや正常反復へ一律停止・毎回承認を追加しない。

031の4区分は固定L2-031の分類をそのまま使う。常時必須は029、005、007、008、OS-018、INFRASTRUCTURE-010の該当契約。006は外部runtimeへの接続/data送信時、009は停止/逸脱時、022/023・該当HARNESS検証・OS promotion/handoffはproposalを検証・採択・昇格へ進めるstageで必須。選択sourceだけsource dependencyを閉じ、未選択sourceは未観測とする。旧runtime/tool/testとHARNESS-L2-023自体は参照資料のみだが、現行policy・authority・oracleを参照のみへ落とさない。missing/unknown/staleは該当operation/stageだけを未完とする。

### `SECURITY-FR-035-01` — 追加runtimeのrun限定設定とdeny能力

対象はPO scope Aの追加runtimeで、policy/authorityはSECURITY、適用・cleanup強制はWorker、run/assignmentはOSである。既存operation authorityと既存repository policy/deny状態を常時照合する。選択runtimeについてallowlist能力とrepository policy/denyの適用状態を照合する。bypass系設定を選択したrunに限り、run開始/終端/cleanupの観測とrepository deny switchの設定能力を追加照合する。明示allowlist対応ならdeny既定+allowlistを使い、YOLO代替を選ばない。非対応と確認できるruntimeだけ、既存policy内で選ばれた経過措置をそのrunに限定できる。bypass利用許可や経過期限・runtime一覧を新設しない。

選ばれたbypass/YOLO/auto-approve設定はsuccess/failure/cancelの各終端で除去し、未確認/残置をcleanup成功にせず次runへ持ち越さない。repositoryから恒久denyを設定でき、その適用がcleanup後も維持されることを観測する。032の優先順位は再利用するが、優先順位の成立だけでswitch能力を証明しない。能力・policy・適用状態unknown/staleは該当選択を保留し既存ownerへ戻す。bypass非選択の通常操作を本要件だけで新規gateへ置かない。

- **`SECURITY-AC-035-01` 能力に応じた選択**：固定L2-035自身の4区分を保持する。対象revision・既存operation authority・既存repository policy/deny状態は常時確認し、選択runtimeのallowlist能力とpolicy適用状態は選択入力に応じて確認する。run開始/終端/cleanupとdeny switch設定能力はbypass系設定を選択した場合に限って追加照合し、HR/HAC/HATはconsumer資料として保持する。非対応の確認と有効policyを持つ経過措置はrun限定として区別し、対応/能力unknownをYOLO許可へ丸めない。
- **`SECURITY-AC-035-02` 全終端cleanup**：success/failure/cancel各終端でrun設定が除去され次runへ継承されない。残置/観測欠落は未完としWorker/OSへ返す。
- **`SECURITY-AC-035-03` deny能力・優先・scope**：対象revisionの既存operation authorityと既存repository policy/deny状態は、bypass選択の有無にかかわらず常時入力し、該当operationへ適用される既存条件を照合する。選択runtimeについては選択入力に応じてallowlist能力とrepository policyの適用状態を追加確認する。repository deny switchの設定能力とcleanup後の維持はbypass選択runで追加照合し、032の同一対象deny優先を保つ。別repository/runtimeの判定を流用せず、同一repository・runtime・revisionの根拠へ結び直す。既存policy/deny状態をbypass選択時だけ確認する変異は不合格。bypassを選ばない通常operationは既存authorityと既存policyの判定だけに従い、allowlist能力unknownだけからdenyを作らない。既存policyの適用状態がunknownの場合も、その既存契約で定まる対象operationの結果だけを未確定として記録し、035だけの一律停止・新gateへ広げない。主Workerへの035四条件拡張や新gateは作らず、既存006/007/008/OS018条件を免除しない。

### Stage 3固定親の出所とrevision

固定revisionは`633bf12`。L2全文SHAは`aa9d6446e97d7027da6c15bbb315bdfa524edf0fa3e5252403f91e7cbac1abdf`。以下は意味digest（外側空白除去＋末尾LF）とraw spanを区別する。029はPOが選んだ二partを保持し、後半だけで採択済み前半を置換しない。035は候補本文の選択肢にPOのscope A・配置Aを適用する。

| 親／登録 | PO判断 | 固定L2行／意味SHA | 固定L11行／raw span SHA |
|---|---|---|---|
| `HELIXSECURITY-L2-029` / `MPR-RC-HELIXSECURITY-L2-029-003` | `docs/governance/decisions/po-decision-2026-10-03-additions10.md#L35` | 405–416 / `0faf8ac952341e621c2f76f7ef44249f03a673ac0a37180f0034914df00f4745` | part 1: 89–95 / `3a5d5311fd03cae17db54bd1ad323cb4222d44d43196c3a4d50ce2a8cf2759f0`; adopted supplement part 2: 169–222 / `9454998c4b19552f845ad5c6f3ba0f16ac64030e82b95409b970dada40814288` (separate span; neither part substitutes for the other) |
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


## Stage 4 — 選択接続5親

固定revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA-256は `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全体は `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。以下は各親からの再導出であり、旧broker/runtime/CLIを実行・移植しない。

| 親／登録ID | 固定L2 path・行／raw SHA-256 | 固定L11 path・行／raw SHA-256 | PO判断 |
|---|---|---|---|
| `HELIXSECURITY-L2-021` / `MPR-RC-HELIXSECURITY-L2-021-002` | `docs/helix-security/L2-requirements/security-requirements.md:272–281` / `cf27dfc9615353be1922f95922470126b14957e2d6cdb8ad25f8264ac4693b82` | `docs/helix-security/L11-acceptance/security-acceptance.md:45` / `500f771536a55e1370038c36dd1bd6d8f007e1bc43e9fae93b24e457a32e4b3f` | `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md#L59` |
| `HELIXSECURITY-L2-022` / `MPR-RC-HELIXSECURITY-L2-022-001` | `docs/helix-security/L2-requirements/security-requirements.md:282–291` / `0e646922e4279d2a1f86400c4bdbf563146a21dddcb845fd90303096d44d37fd` | `docs/helix-security/L11-acceptance/security-acceptance.md:46` / `c6e21bc9a77b828f3d5dccc6976468828b517af83d9c103c693c115e81003363` | `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md#L60` |
| `HELIXSECURITY-L2-023` / `MPR-RC-HELIXSECURITY-L2-023-001` | `docs/helix-security/L2-requirements/security-requirements.md:292–301` / `1915e008f9d96f3f4b9e45cbbf406f328563d4d88c4f07f89e6b6ed255c2c9ab` | `docs/helix-security/L11-acceptance/security-acceptance.md:47` / `ac72a6ebd9c56464050d76be9fc0f9d0765efcff17a0adb4a91597abd41760f7` | `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md#L61` |
| `HELIXSECURITY-L2-024` / `MPR-RC-HELIXSECURITY-L2-024-001` | `docs/helix-security/L2-requirements/security-requirements.md:302–311` / `873045e83bea3519766839557e281eb6d345be698f422ddf492ace8f095fc71b` | `docs/helix-security/L11-acceptance/security-acceptance.md:48` / `efce6df4ce18371035b1b4772da986eaf88f065ed6224546b82afd15dd49aedd` | `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md#L62` |
| `HELIXSECURITY-L2-026` / `MPR-RC-HELIXSECURITY-L2-026-001` | `docs/helix-security/L2-requirements/security-requirements.md:322–331` / `6187c8fa6abec3a3ed307f923661c23d06db832007d7703a56a7b7c8692cc1df` | `docs/helix-security/L11-acceptance/security-acceptance.md:50` / `29279c52cffa7deeca6a3d4353b495e006998d9f41587332d29df6d7635d2772` | `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md#L64` |

### 項目別の旧source対応

| 親 | 旧asset／path・行 | 全体SHA-256／raw span SHA-256 | 保持・再導出・置換 |
|---|---|---|---|
| `HELIXSECURITY-L2-021` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:168–171` | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` / `e8a9bb380860412a602572814f10c7dbc792863f7858f596fa930534d8d01511` | 外部source/raw/trusted/instructionの分離とsource traceは旧P8の近接起点。CONNECT→SECURITY→LABO/INTELLIGENCE receipt、trust非昇格、永続化014/027分離は固定L2から再導出。旧research/skillify/runtime手続きは置換。 |
| `HELIXSECURITY-L2-021` | `LEGACY-ASSET-44DD86E3DEC09E65EF51` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:123–129` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` / `a68ccf6656f83eb322737c1cdd2d6e88fa749e56e06b6567e7a853ef2fc31a72` | 外部source/raw/trusted/instructionの分離とsource traceは旧P8の近接起点。CONNECT→SECURITY→LABO/INTELLIGENCE receipt、trust非昇格、永続化014/027分離は固定L2から再導出。旧research/skillify/runtime手続きは置換。 |
| `HELIXSECURITY-L2-022` | `LEGACY-ASSET-B62E49D2E156232B8C63` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:160–166` | `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` / `851ea0172fb9de5c90248726fc4073ca24ab58180e635fc3bb1d8f8b8c43f279` | CAPのoperation/impact/authorityとeffective enforcementを混ぜない形を近接起点に再導出。対象tupleのSECURITY→OS→Worker接続は固定L2に従い旧capability schema/host broker/approvalRequired一般化は置換。 |
| `HELIXSECURITY-L2-022` | `LEGACY-ASSET-170112AB2FA2FFDBFEE9` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:19–29` | `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` / `c4380c036258a51a43b302fba30abe2609afbcc6f6ab80ebe661eaad1d2da6c9` | CAPのoperation/impact/authorityとeffective enforcementを混ぜない形を近接起点に再導出。対象tupleのSECURITY→OS→Worker接続は固定L2に従い旧capability schema/host broker/approvalRequired一般化は置換。 |
| `HELIXSECURITY-L2-023` | `LEGACY-ASSET-B62E49D2E156232B8C63` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:156–166` | `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` / `0196a961f5043319172e0e1bfd17fe84ff77a1419d4385aa6ed76ec9193a3611` | 旧CAPのcurrent safety失敗を他greenで相殺しない、実装/review/read-after独立の失敗形だけ参照。admission/実行/verification/promotionは固定L2からowner別再導出し旧CLI/DB/admission gateは置換。 |
| `HELIXSECURITY-L2-023` | `LEGACY-ASSET-170112AB2FA2FFDBFEE9` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:16–29` | `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` / `7e9778e1977e19abc85e7ddec4dc30f81171be006bae9623f03b1ad5ea2c3b36` | 旧CAPのcurrent safety失敗を他greenで相殺しない、実装/review/read-after独立の失敗形だけ参照。admission/実行/verification/promotionは固定L2からowner別再導出し旧CLI/DB/admission gateは置換。 |
| `HELIXSECURITY-L2-024` | `LEGACY-ASSET-B62E49D2E156232B8C63` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:160–166` | `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` / `851ea0172fb9de5c90248726fc4073ca24ab58180e635fc3bb1d8f8b8c43f279` | 旧CAP006のcovered/unsupported適用と値非表示receiptの観点を近接参照し、policy/実資源/Worker強制の三者は固定L2から再導出。物理FS方法や固定sandbox/tokenを指定せず旧brokerを置換。 |
| `HELIXSECURITY-L2-024` | `LEGACY-ASSET-170112AB2FA2FFDBFEE9` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:19–29` | `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` / `c4380c036258a51a43b302fba30abe2609afbcc6f6ab80ebe661eaad1d2da6c9` | 旧CAP006のcovered/unsupported適用と値非表示receiptの観点を近接参照し、policy/実資源/Worker強制の三者は固定L2から再導出。物理FS方法や固定sandbox/tokenを指定せず旧brokerを置換。 |
| `HELIXSECURITY-L2-026` | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:168–171` | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` / `e8a9bb380860412a602572814f10c7dbc792863f7858f596fa930534d8d01511` | 旧P8の信頼境界・判断材料/source traceの観点を近接参照。決定Guard/意味判断Botの別責務、必要時Botの限定authorityは固定020/026から再導出し、全候補Bot/意味観測1.xを1.0へ前倒ししない。 |
| `HELIXSECURITY-L2-026` | `LEGACY-ASSET-44DD86E3DEC09E65EF51` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:123–129` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` / `a68ccf6656f83eb322737c1cdd2d6e88fa749e56e06b6567e7a853ef2fc31a72` | 旧P8の信頼境界・判断材料/source traceの観点を近接参照。決定Guard/意味判断Botの別責務、必要時Botの限定authorityは固定020/026から再導出し、全候補Bot/意味観測1.xを1.0へ前倒ししない。 |

### HELIXSECURITY-L2-021 — 外部情報の分類接続

`SECURITY-FR-021-01` / version_target `1.0`。CONNECTのsource契約revisionとcontract version、入力・出力identityを受け、SECURITYの分類・取扱条件・理由を同じ情報単位へ束縛してLABO/INTELLIGENCEへ渡す。伝送成功、外部sourceの主張、分類済みという状態からinstruction信頼・authority・永続化を生成しない。014/027の保存経路は別契約である。

- `SECURITY-AC-021-01` — sourceと分類の結合: source identity/revision、CONNECT contract version、入力出力identity、分類判断と根拠を受領traceで結合し、contract versionの欠落または不一致、別source/revisionの判断流用をそれぞれ拒否する。
- `SECURITY-AC-021-02` — deny・unknown伝播: deny/unknownをpublic/allowへ変換せず、受領側まで対象範囲と理由を維持する。CONNECTは再送・搬送、SECURITYは判断をそれぞれ所有する。
- `SECURITY-AC-021-03` — 受領と利用の分離: 受領traceは信頼instruction・利用許可・保存成功の証拠にならず、LABO/INTELLIGENCEの利用判断と保存ownerの結果を別に保持する。CONNECTはsecurity policyや利用許可を作らず、SECURITYは通信・再送・搬送・保存を所有しない。

### HELIXSECURITY-L2-022 — 判断・割当・強制の接続

`SECURITY-FR-022-01` / version_target `1.0`。INTELLIGENCEの依頼をSECURITYのoperation判断へ渡し、OSが有効な判断に基づき割り当て、Workerが同じ条件を強制する。依頼、判定、assignment、適用結果を別ownerの出力として残す。

- `SECURITY-AC-022-01` — 依頼から判断: actor/target/operation/revision/environment/scope/expiryを照合し、allow/deny/制約と理由を返す。INTELLIGENCE依頼だけからauthorityを作らず、SECURITY判断なしで依頼から実行へ進めない。
- `SECURITY-AC-022-02` — 判断から割当: OS assignmentは同じ対象tupleと有効なSECURITY判断を参照し、SECURITYがWorkerを配置したりOSがdenyをoverrideしたりしない。
- `SECURITY-AC-022-03` — 割当から適用: Workerの実適用観測を判断条件と照合し、宣言だけをenforcement完了にしない。開始後revokeも009の該当scopeへ返す。SECURITYはOS assignment、Worker配置、CONNECT通信・再送を所有せず、各ownerへ戻す。

### HELIXSECURITY-L2-023 — 候補から昇格までの独立結果

`SECURITY-FR-023-01` / version_target `1.0`。候補のprovenance・capability差分、admission、Worker隔離実行、HARNESS verification、OS promotionの対象revision・結果・未完理由を区別する。後続結果はその段階で記録し、実行前に将来receiptを要求しない。

- `SECURITY-AC-023-01` — 候補とadmission: 候補の出所・対象revision・能力差分を判断対象へ結合し、admissionは限定条件の判断であり実行・検証・昇格完了を生成しない。
- `SECURITY-AC-023-02` — 実行の結果: admitted範囲の隔離実行結果をWorkerが記録し、隔離実観測欠落と実行失敗をHARNESS成功で相殺しない。
- `SECURITY-AC-023-03` — 検証の結果: HARNESSは同一実行対象を検証し、CI green・ticket・別HEAD結果から検証完了を作らない。
- `SECURITY-AC-023-04` — 昇格の結果: OSは各段階の結果と現行条件を照合し昇格結果を別記録する。候補・admission・検証のいずれか単独でも、OS ticket/昇格要求単独でも昇格しない。

### HELIXSECURITY-L2-024 — policy・資源・実強制の接続

`SECURITY-FR-024-01` / version_target `1.0`。SECURITYのnetwork/credential/environment/isolation/operation更新・egress条件、INFRASTRUCTUREの実資源状態、Workerの強制観測を対象revisionとscopeで結ぶ。OSの仕事状態は別契約とする。

- `SECURITY-AC-024-01` — 条件の引渡し: 適用条件・対象scope・revision・理由を実資源ownerとWorkerへ渡し、policy宣言を資源準備・適用済みへ昇格させない。
- `SECURITY-AC-024-02` — 実資源と強制: INFRASTRUCTUREの実状態とWorkerの観測を独立照合し、資源準備済みだけで制約強制を完了にしない。
- `SECURITY-AC-024-03` — credential取扱境界: credential raw値を通常resource/backup/snapshotへ無条件保存しない。既存scoped利用能力とraw値非到達を区別し、保存policyを新設しない。INFRASTRUCTUREはsecurity policy/classification/authorityを生成せず、SECURITYは通常資源・backup/snapshotへの配置を決めない。

### HELIXSECURITY-L2-026 — Guardと任意の意味判断の接続

`SECURITY-FR-026-01` / version_target `1.0`。020の決定的Guard責務はGuardが保持する。観測eventの出所・分類・限定した意味判断依頼と必要時のINTELLIGENCE判断をSECURITYの材料へ接続する。1.0は接続境界を対象とし意味観測・exfiltration・Bot実能力の後続版を前倒ししない。

- `SECURITY-AC-026-01` — 決定的判定: Bot不在でも020の決定的ruleを適用し、Botへの委譲・全候補Bot必須化をしない。
- `SECURITY-AC-026-02` — 判断材料の限定: 意味判断が必要な場合はevent/source/revision、判断目的・対象scope・出所と確度を区別して渡す。判断材料からoperation authorityを作らない。
- `SECURITY-AC-026-03` — 版とownerの分離: INTELLIGENCEは必要時Botの限定判断を担い、SECURITYはpolicyを判断し、OS/Workerは既存実行責務を持つ。Bot具体稼働・model routing・後続意味検出達成を1.0合格条件にしない。INTELLIGENCEはoperation authorityやGuard結果を作らず、SECURITYはmodel選定/routingやBot自身の実行を所有しない。

## Stage 5 — HELIXSECURITY-L2-027 永続化promotion構成体

`SECURITY-FR-027-01` / version_target `1.0`。Context/Agent output→Memory、Episode→Training Dataset、Product Knowledge→BRAINの3経路を、source/provenance/classification、promotion request、SECURITY判定、対象sinkへの受渡し結果またはdeny/holdまで個別に追跡する。各sinkの保存・評価・登録はそのownerの接続契約へ保ち、LABO評価やOS登録を全経路の新しい必須工程にしない。Training Dataset受渡しから実学習やINTELLIGENCE 3.0能力を生成しない。

固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、登録 `MPR-RC-HELIXSECURITY-L2-027-002`、PO `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md#L65`。L2 `docs/helix-security/L2-requirements/security-requirements.md:332–341` 全体SHA `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、raw `9c8d1c515b1a390d2a5a21f9c271ae29c14b76bad612a8d669bd94335042888e`、正規化意味 `f3d5fa59eba03cf77fbb8d17180b8d086061cef34818ea87e19209b8be33eb9e`。L11 `docs/helix-security/L11-acceptance/security-acceptance.md:51` 全体SHA `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`、raw `8ba92962fcdf759c86afcbfdba02508ef36ad1f356517d6283fe439067b5b7a1`。

旧sourceはStage 4の021/026で読んだP8-04とpaired testの近接起点である。旧P8-04とpaired testのsource/trust境界と正常/否定oracle形式は近接起点。同じ3promotion経路のcompositeは旧L3で確認できず、固定現行027から各sink ownerへのhandoffまで再導出。旧research/skillify/runtime/DBや全経路LABO評価・OS登録は継承しない。 検索範囲は旧HELIX L3 pillar/security capability brokerおよびpaired acceptanceであり、固定027と同じ三経路構成体の独立旧L3は確認できなかった。新しい上流意味は追加せず採択済み027から起草する。

| 旧asset／path・行 | 全体SHA-256／raw span SHA-256 | 処置 |
|---|---|---|
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` / `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:168–171` | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` / `e8a9bb380860412a602572814f10c7dbc792863f7858f596fa930534d8d01511` | 信頼境界と正常/否定oracle形式を再導出。旧runtime/DBを置換。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` / `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:123–129` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` / `a68ccf6656f83eb322737c1cdd2d6e88fa749e56e06b6567e7a853ef2fc31a72` | 信頼境界と正常/否定oracle形式を再導出。旧runtime/DBを置換。 |

- `SECURITY-AC-027-01` — 経路別の構成体追跡: 三経路それぞれのsource/request/revision・分類・判断・sink結果を結び、単体014または一経路の成功を構成体成功にしない。

- `SECURITY-AC-027-02` — 欠落・deny・holdの保持: 各経路のsource/provenance/classification/判断/sink結果を独立照合し、欠落・unknownは永続化前にhold/denyとして保持する。

- `SECURITY-AC-027-03` — sink ownerの固有処理: sink受渡し結果とその後の保存・評価・登録結果を区別し、接続契約で必要な固有処理だけを各ownerへ返す。

- `SECURITY-AC-027-04` — 未見経路条件と局所unknown: 未見sink契約revisionでも既存適用条件が確認できる部分を照合し、互換性・分類・判断不明は該当経路に残す。
