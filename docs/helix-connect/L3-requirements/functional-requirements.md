# HELIX-CONNECT L3 機能要件（Stage 1・Stage 2a 部分草稿）

> 状態: L3要件草稿・未承認。L3承認・実装方式確定・実装完了を表さない。既存Stage 1ではG0確定34件中CONNECT 5件を対象とし、SECURITY 19件と合わせた24件の部分草稿である。本追補はStage 2aの`HELIXCONNECT-L2-006`だけを追加する。本文は現行の固定L2/L11だけを要件化し、未指定技術値は根拠付き候補として区別する。

## 適用・責務境界

対象はStage 1のHELIXCONNECT-L2-001〜005とStage 2aのHELIXCONNECT-L2-006（各固定L2が明示するversion_target 1.0）。registration、revision compatibility、技術送受信、再送、trace、片側交換をFRごとに追跡する。CONNECTはsource/consumer ownerの業務意味やSECURITYの送信authorityを決めず、通信登録/互換結果だけから送信許可を生成しない。通信時の既存SECURITY authority/data-use条件、HARNESS-L2-010/011のpack交換/未完義務、OS assignmentは各ownerの正本を参照する。本文に記す状態・receiptは要求出力の論理モデルであり、wire format・DB・transport・adapter・algorithmの確定ではない。Stage 2aは片側交換の一接続だけを扱い、後続L2-007の複数辺compositeを前倒ししない。

## 旧L3構造の保持点

旧HELIXの形式sourceは、旧HELIX L3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`（asset `LEGACY-ASSET-C7F0C3B79CBAA72960BF`、lines 1–95、SHA-256 `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`）のFR/AC構成、旧HARNESS L3 README `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md`（asset `LEGACY-ASSET-9A772391C7FB1298D45F`、lines 1–56、SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）のfunctional/business/NFR 3 sub-doc定義、functional実体（asset `LEGACY-ASSET-B5B5E71B2AF1459D59A1`、lines 1–974、SHA-256 `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`）、business実体 `business-detail.md`（asset `LEGACY-ASSET-A6E2C7F0565E5F804F06`、lines 1–256、SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）、旧NFR grade（asset `LEGACY-ASSET-8CC5ABFC98C0D00183CA`、lines 1–73、SHA-256 `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`）である。functionalは入出力/振る舞い/ACの形式、NFRは候補/測定/判定の対応を参考にし、旧値は自動継承しない。旧READMEのG3 freeze/L12 pairは現行L10の新しい承認gateにしない。旧CLAUDE自律境界 `archive/legacy-generation-2026-09-14/root/CLAUDE.md`（asset `LEGACY-ASSET-6EBDB617A8104A7756D0`、lines 82–85、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）の保持点はAIがL3を起草し人は要件承認を担うことであり、現行の権威境界に従う。

## FR/AC

### CONNECT-FR-001-01 — 登録Identity

各connection identityは端点/owner/方向/scope/意味契約identityとrevision/adapter・transport revision/互換範囲/状態へ一意に結び付く。endpoint共有は異なるconnection identityなら許す。重複宣言/identity衝突/端点または契約の欠落・unknownをusableにしない。登録は業務承認・通信権限ではない。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：LEGACY-ASSET-9B7682EBDEA171005D45, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md` lines 24–83, SHA-256 `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`。package identity/compatibilityは隣接根拠に限り、直接のCONNECT FRは未発見。固定L2から再導出し、旧package identity schemaは再利用しない。

- **固定親**：`HELIXCONNECT-L2-001` / `MPR-RC-HELIXCONNECT-L2-001-002`、semantic digest `sha256:895fae2d3c5cd5c725a31e6c16a6d7032e17da08f4e2e509fabb52f0cd85da18`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L56`（section SHA `sha256:86b1ee2f1a7447e6da2eb65266613d5b97bff31b0e5cb49dce7f4649cff5bf09`）、対L11 `32行`（section SHA `sha256:85da82e131a7b0665c0c00013c04927c9963da7dc2d38d2ce83f8c45dbd89a8f`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。



**責務・依存とfailure時の戻し先（固定L2の保持）**：接続候補と両端ownerが宣言した契約。通信、再送、他接続を必須にしない。 戻し先: 欠落/衝突/unknownは登録を未成立にし、不足または矛盾した宣言を該当する接続元・consumer ownerへ戻す。

**L3 acceptance (`CONNECT-AC-001-01`)**：登録identityと両端契約が一意に結び付き、不足・不明・同一接続identityの異なる宣言による重複・identity衝突は利用可能にならない。識別可能な別接続による端点共有は拒否しない

**対応L11 acceptance**：`HELIXCONNECT-L11-001`。

### CONNECT-FR-002-01 — 互換性/stale

開始前および関連revision変更後の再利用前に実revision組を照合する。照合は既存read scope内で単独実施でき、送信許可を要しない。compatible/incompatible/unknown/staleと原因revisionを記録し、再照合で確認した組だけstale解除。send判定時だけ既存SECURITY authority/data-useを追加照合し、参照のみはnot_evaluated。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：LEGACY-ASSET-9B7682EBDEA171005D45, 旧L3の同path lines 24–83（全体SHAは上記）は互換性条項の隣接根拠に限る。現在の互換要件は再導出。 旧distribution test consumer asset `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md` lines 1–120, SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`: integration oracleに限り、直接のidentity対応は未確認。

- **固定親**：`HELIXCONNECT-L2-002` / `MPR-RC-HELIXCONNECT-L2-002-002`、semantic digest `sha256:ebc3e58d7479cb2f80ada4ebba32363bdcf6cf67e908075b5b1ececb29f8e037`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L67`（section SHA `sha256:2f820064ab2f79b7762846fc6a2091a16d06951f02cabedd781d267ef2648756`）、対L11 `33行`（section SHA `sha256:f08497b4ac4e95eca764a95a9cec24fe288caff09df1bd8d397d5fee1ea1f22d`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。



**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-001の接続登録、端点ownerのversion/互換宣言。送信適格性を照合する操作では、該当するSECURITY authorityとdata-use条件を追加で参照する。通信実行を必須にしない。 戻し先: 契約不一致は接続設計・契約ownerへ、読取りaccess条件はその既存owner/authorityへ、送信時の許可scope/expiry問題はHELIX-SECURITYへ戻す。比較不能はunknown/staleとして記録し、送信は保留する。

**L3 acceptance (`CONNECT-AC-002-01`)**：既存scope/access条件下で互換性を照合し、送信時のみ許可を確認。revision変更後はstaleを検知して再照合まで通信を止める

**対応L11 acceptance**：`HELIXCONNECT-L11-002`。

### CONNECT-FR-003-01 — 契約に束縛した送受信

通信はconnection/operation/contract revision/互換receiptに束縛する。契約外入力・revision違い・未識別operationは成功でなく拒否または隔離。技術結果だけ返し業務完了を決めない。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：LEGACY-ASSET-9B7682EBDEA171005D45, 同じ旧L3 pathのlines 24–83/全体SHAは上記 and `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` 旧test pathのlines 1–120/SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`: package/integrationに隣接する根拠に限る。直接のCONNECT requirementは未発見のため再導出。

- **固定親**：`HELIXCONNECT-L2-003` / `MPR-RC-HELIXCONNECT-L2-003-001`、semantic digest `sha256:6eea10829958fee5807147b6a7cdd9d4e889f72fbf5b6cef24ab925e9b85bf42`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L80`（section SHA `sha256:538e057821cbe69138efe2b2ffd1c593d08be7a4348f01dc0c8afa26b4eac15e`）、対L11 `34行`（section SHA `sha256:b75ad5d62c39ae87f6c51b1dfe8bb65880350b02fa61ef36d5e16dbabf904196`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。



**責務・依存とfailure時の戻し先（固定L2の保持）**：登録済み接続と現時点の互換照合、端点双方の受領契約。別の接続を必須にしない。 戻し先: 契約・版問題は両端contract ownerへ、scope/許可問題はSECURITYへ、受領拒否・業務結果は受信側業務ownerへ返す。接続結果を業務完了へ昇格しない。

**L3 acceptance (`CONNECT-AC-003-01`)**：送受信が正しい接続identity・operation・契約revisionに束縛され、契約外入力を成功扱いしない

**対応L11 acceptance**：`HELIXCONNECT-L11-003`。

### CONNECT-FR-004-01 — 制御再送

再送は技術的retryable failureに限定し、同一operation identity/content digest/単一contract revision、契約上限・可否を守る。同一ID+digestは二重効果なし、異digestは衝突拒否。business resultは再送せずownerへ返し、新revisionに自動移行しない。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：旧distribution package L3 asset `LEGACY-ASSET-9B7682EBDEA171005D45`（lines 24–83、SHAは上記）およびdistribution受入consumer `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB`（lines 1–120、SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`）は隣接根拠に限る。具体的なidempotency/retry上限は固定L2/HARNESS pack contractから再導出し、旧algorithmはコピーしない。

- **固定親**：`HELIXCONNECT-L2-004` / `MPR-RC-HELIXCONNECT-L2-004-001`、semantic digest `sha256:2a62ae83a10c379554ce2ac586edeb887256ee8742f7c8b5c53f0c6250dc41ef`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L91`（section SHA `sha256:f4b6bcba98851d0c9bd8c73cd59e7fdf3722b5c177f45594cc20a47da33daccd`）、対L11 `35行`（section SHA `sha256:3b541266c8c31b7fd4a7e3010540c58099c8abaedb505f27701f4ba6bbe28c35`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。



**責務・依存とfailure時の戻し先（固定L2の保持）**：登録・互換照合・通信契約、受信側の同一identity重複排除契約。構成体や後続機構を必須にしない。 戻し先: digest衝突や再送上限到達は送信を停止し、connection operationのownerへ未完義務と試行数を返す。業務結果は元の業務ownerへ、許可期限切れはSECURITYへ戻す。新revisionへ自動混載再送しない。

**L3 acceptance (`CONNECT-AC-004-01`)**：同一内容の再送は二重効果を生まず、異digest衝突・上限超過・再送不能結果は停止する

**対応L11 acceptance**：`HELIXCONNECT-L11-004`。

### CONNECT-FR-005-01 — 技術trace

登録・照合・送信・受領・attempt/retry/stale/拒否/終端をconnection/operation/contract revision/attempt identityで順序追跡する。技術状態と端点観測範囲を区別し、欠落/順序不明はunknown。本文payload保存は必須でなく、業務判断を代筆しない。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：Legacy assets `LEGACY-ASSET-9B7682EBDEA171005D45` old L3 package requirements lines 24–83/SHA `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` and `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` 旧system testのlines 1–120/SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` はconsumer contextに限る。直接のtrace FRは確認されていない。固定L2/pack evidence contractから再導出。

- **固定親**：`HELIXCONNECT-L2-005` / `MPR-RC-HELIXCONNECT-L2-005-001`、semantic digest `sha256:d2e2a658c6055384b4946a6aff9840ec3a1d719f9cc6863d8fc260ff0e3af871`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L102`（section SHA `sha256:2d913f153b1d7ee5e07e4dabc65baee93649ee06ad442c942b07541389835289`）、対L11 `36行`（section SHA `sha256:0bec83bfdd64af8ec58f0b15748bd9d4985e202b160076a82896a3a890056e22`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。



**責務・依存とfailure時の戻し先（固定L2の保持）**：connection operation eventと共通ログ/証拠の契約。本文payload保存を必須にしない。 戻し先: traceの欠落/順序不明はoperationをunknownとしてconnection operation ownerへ返し、業務完了を止める。data-useや許可の不明はSECURITY/source ownerへ戻す。

**L3 acceptance (`CONNECT-AC-005-01`)**：送受信・再送・stale・部分失敗を接続単位に順序追跡できる

**対応L11 acceptance**：`HELIXCONNECT-L11-005`。

### CONNECT-FR-006-01 — 片側交換時の接続互換性

#### 固定親revisionとauthority

- 採択登録: `MPR-RC-HELIXCONNECT-L2-006-002`。基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の`docs/governance/management-provisional-requirement-register.jsonl:337`、row SHA-256 `7c942e87dab797a4edff23da53f97b0b75ba27eecfdb5504f03bc9ba193854c0`、candidate semantic digest `sha256:876d54895668800e8a3f1866523fb65fb68bb7c13bad936396ecf43ecff30db7`。
- PO判断: `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md:48`。基準main633のdecision全文SHA-256 `82db2060dbaa77b5b9e6f38fa11219ec811b108b1870e6a86ca112810f9bae69`はHELIXCONNECT-L2-001〜007を採択し、version_target 1.0と各適用条件を維持する。対象要求revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定L2親: `docs/helix-connect/L2-requirements/connect-requirements.md` 115–125行、全文SHA-256 `31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、inclusive raw-span SHA-256 `f5e21133232013d16d0306fd333c1c2e216c0163e3570f746242fd636b295db7`、heading「### HELIXCONNECT-L2-006 片側交換時の接続互換性（connection）」。
- 固定L11親: `docs/helix-connect/L11-acceptance/connect-acceptance.md` line 37の一覧SHA-256とline 70の個別受入手順を固定L11全文SHA-256 `bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`から読む。L11-006はconnection受入であり、片側交換4類型ごとの試験、固定側不変、互換時の再照合後送信、未完operation/ACK/attempt/期限/義務のhandoff、非互換等の送信0を要求する。
- version candidate: `1.0`; sequence: `Stage 2a`; prerequisite identityはStage 2a assignment上なし。接続登録、両端の互換宣言、HARNESS-L2-010/011、該当SECURITY許可は固定L2の単独成立依存として保持する。

#### 要件（候補）

一つの登録済み接続で、送信側機構本体、送信側adapter/transport、受信側機構本体、受信側adapter/transportのいずれか一つを交換する。交換しない側の機構・契約revisionとL2列挙のartifact/dependency revision、scopeを固定し、交換側の旧新revision、交換scope、未完operation/義務/期限/attempt、交換・復旧権限を記録する。交換後の端点契約と接続契約の互換性を個別照合し、互換範囲内と確認したrevision組に限り、固定側を改変せず同一接続契約上で送受信する。変更前後のrevision、照合、送受信結果、handoff/rollback/recovery receiptを一連で辿れるようにする。

非互換、unknown、stale、未登録revision、意味契約変更は通信停止とし、両側同時変更を片側交換成功へ読み替えない。再照合と再開条件が成立する前はretryせず、旧新revisionを同一operationに混ぜない。失敗時は未完operation/ACK/attempt/期限/義務とrecovery先をhandoffへ残し、意味契約差分は両端owner、技術互換差分はadapter owner、許可範囲はSECURITYへ戻す。

#### 受入条件（AC候補）

- **CONNECT-AC-006-01 — 正常・4類型追跡**：L11が列挙する4交換類型を別々に照合する。各ケースで固定側の機構・契約revisionと対象artifact/dependency revisionが交換前後で不変、交換側の新revisionが宣言互換範囲内、再照合がcurrentであり、同一接続契約上の通信だけが成立する。交換前後のrevision・互換receipt・送受信と未完operation/ACK/attempt/期限/義務をtraceし、交換前後を混在させず保持する。
- **CONNECT-AC-006-02 — 否定・未見境界**：4類型それぞれに(a)非互換revision、(b)未登録revision、(c)意味契約変更、(d)stale、(e)unknownの照合結果を個別に与える。全20 fixtureで通信attempt 0とする。固定側を変更済みと偽装せず、handoff/rollback/recovery先と残る義務を保持する。再照合・再開条件成立前にretryしない。4×5のfixture数はL11の列挙境界を測定する候補であり、新しい承認条件ではない。

#### 固定親句の被覆

| 固定L2/L11の句・条件 | 要件／AC | 対応L10 case | 観測する状態・動作 |
|---|---|---|---|
| 入力: 登録接続、固定側機構/契約/artifact/dependency revision、交換側旧新revision/scope、未完operation/義務/期限/attempt、交換/復旧権限・互換条件 | `CONNECT-FR-006-01 / CONNECT-AC-006-01,02` | `CONNECT-CASE-006-01..05` | 交換類型ごとの完全な入力とsource revision |
| 保証: 片側を交換し、固定側を変えずに互換を個別照合、互換内なら同一契約上で通信 | `CONNECT-FR-006-01 / CONNECT-AC-006-01` | `CONNECT-CASE-006-01..04` | 4類型の固定側before/after一致、current互換receipt、同一contract送受信 |
| 否定: 非互換/未登録/意味契約変更/stale/unknownを個別に与えて停止し、両側同時変更を成功扱いしない | `CONNECT-FR-006-01 / CONNECT-AC-006-02` | `CONNECT-CASE-006-05` | 各類型×5境界の20 fixtureで送信attempt 0、固定側不変 |
| handoff/recovery: 未完operation/ACK/attempt/期限/義務を保持し、再照合・再開条件前にretryしない | `CONNECT-FR-006-01 / CONNECT-AC-006-01,02` | `CONNECT-CASE-006-01..05` | 未完state、handoff receipt、再開前retry 0 |
| 依存/戻し先: 登録接続、両端互換宣言、HARNESS-L2-010/011、該当SECURITY許可; 意味差は両端owner、技術差はadapter owner、許可差はSECURITY | `CONNECT-FR-006-01 / CONNECT-AC-006-02` | `CONNECT-CASE-006-05` | dependency identityと未完義務/owner別返却 |

#### 旧HELIX対応（項目別再利用区分）

接続の片側交換と固定側を変えず同一契約で継続する直接一致の旧L3は、`docs/design/helix/L3-requirements/`内を探索した範囲では確認できない。旧technology-environment-reconciliationはrevision drift・根拠付き比較・unknown/stale fail-closeのfailure patternだけ部分再導出し、外部技術inventory/upgrade lifecycleを持ち込まない。distribution-package-releaseのartifact/version compatibilityは隣接例として比較し、package promotion/approval/OS固有挙動は再利用しない。4交換類型、固定側不変、handoff対象と接続固有の返却先は固定L2/L11から再導出する。

| 旧asset ID | 旧source path・行 | 全文SHA-256 | 該当span SHA-256 (LF保持) | 対応と差分 |
|---|---|---|---|---|
| `LEGACY-ASSET-7F8960532611D89D03E1` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/technology-environment-reconciliation-requirements.md` 32–70, 72–94 | `65bef49aa5ee9dd84481684f359cbb28d1a41ad34f85aa3826854fb6e9c560bc` | `c58abfe822a6c95a70d11c10e6355ef14f032c4c6cf9993c24f6eb24f41d4477`; `afaad3aaa2f623b5979b658c32525c0552dce29b8591dc58e8b11b8b1ab684bf` | revision/source driftとfail-closeの類例だけ再導出。inventory/upgrade lifecycleは置換・除外。 |
| `LEGACY-ASSET-9B7682EBDEA171005D45` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md` 24–83 | `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | `60f558ed4c14b1b235e060dad063c8a07c202b02868a1004ae8f4855671e6c2e` | package/version compatibilityの隣接比較のみ。distribution/release authorityとpromotion規則は置換・除外。 |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md` 1–58 | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` | artifact compatibility/revision driftのintegration oracle候補を限定参照。remote release test/runtimeは実行・移植しない。 |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` 32–90, 91–216 | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | `0b6f167d1e4002f0f92a80294992ee3b785f676685402c1945b15d5f38ee0228`; `066ad9e1de61935f6a5c5a939a5e78a4348f29431a9737f187edb991b71d82e4` | FR/ACとnormal/negative/boundary oracle対応の形式だけ参照。旧HAT/L12/runtimeは現行L10に移植しない。 |

**対応L11 acceptance**：`HELIXCONNECT-L11-006`。
