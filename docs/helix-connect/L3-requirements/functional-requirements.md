# HELIX-CONNECT L3 機能要件（1.0対象親9件の草稿）

> 状態: L3要件草稿・未承認。L3承認・実装方式確定・実装完了を表さない。本書の対象はCONNECTの1.0採択親9件である。Stage 1はHELIXCONNECT-L2-001〜005の5件を扱う。Stage 2aは`HELIXCONNECT-L2-006`、Stage 4は`HELIXCONNECT-L2-008/009`、本Stage 5追補は`HELIXCONNECT-L2-007`を追加する。本文は現行の固定L2/L11だけを要件化し、未指定技術値は根拠付き候補として区別する。

## 適用・責務境界

対象はStage 1のHELIXCONNECT-L2-001〜005、Stage 2aのHELIXCONNECT-L2-006、Stage 4のHELIXCONNECT-L2-008/009、Stage 5のHELIXCONNECT-L2-007（各固定L2が明示するversion_target 1.0）。registration、revision compatibility、技術送受信、再送、trace、片側交換をFRごとに追跡する。CONNECTはsource/consumer ownerの業務意味やSECURITYの送信authorityを決めず、通信登録/互換結果だけから送信許可を生成しない。通信時の既存SECURITY authority/data-use条件、HARNESS-L2-010/011のpack交換/未完義務、OS assignmentは各ownerの正本を参照する。本文に記す状態・receiptは要求出力の論理モデルであり、wire format・DB・transport・adapter・algorithmの確定ではない。Stage 2aは片側交換の一接続だけを扱い、後続L2-007の複数辺compositeを前倒ししない。

## 旧L3構造の保持点

旧HELIXの形式sourceは、旧HELIX L3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md`（asset `LEGACY-ASSET-C7F0C3B79CBAA72960BF`、lines 1–95、SHA-256 `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`）のFR/AC構成、旧HARNESS L3 README `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md`（asset `LEGACY-ASSET-9A772391C7FB1298D45F`、lines 1–56、SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）のfunctional/business/NFR 3 sub-doc定義、functional実体（asset `LEGACY-ASSET-B5B5E71B2AF1459D59A1`、lines 1–974、SHA-256 `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`）、business実体 `business-detail.md`（asset `LEGACY-ASSET-A6E2C7F0565E5F804F06`、lines 1–256、SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）、旧NFR grade（asset `LEGACY-ASSET-8CC5ABFC98C0D00183CA`、lines 1–73、SHA-256 `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`）である。functionalは入出力/振る舞い/ACの形式、NFRは候補/測定/判定の対応を参考にし、旧値は自動継承しない。旧READMEのG3 freeze/L12 pairは現行L10の新しい承認gateにしない。旧CLAUDE自律境界 `archive/legacy-generation-2026-09-14/root/CLAUDE.md`（asset `LEGACY-ASSET-6EBDB617A8104A7756D0`、lines 82–85、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）の保持点はAIがL3を起草し人は要件承認を担うことであり、現行の権威境界に従う。

## FR/AC

### CONNECT-FR-001-01 — 登録Identity

各connection identityは端点/owner/方向/scope/意味契約identityとrevision/adapter・transport revision/互換範囲/状態へ一意に結び付く。endpoint共有は異なるconnection identityなら許す。重複宣言/identity衝突/端点または契約の欠落・unknownをusableにしない。登録は業務承認・通信権限ではない。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：LEGACY-ASSET-9B7682EBDEA171005D45, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md` lines 24–83, SHA-256 `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`。package identity/compatibilityは隣接根拠に限り、直接のCONNECT FRは未発見。固定L2から再導出し、旧package identity schemaは再利用しない。

- **固定親**：`HELIXCONNECT-L2-001` / `MPR-RC-HELIXCONNECT-L2-001-002`、semantic digest `sha256:895fae2d3c5cd5c725a31e6c16a6d7032e17da08f4e2e509fabb52f0cd85da18`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L56`（section SHA `sha256:86b1ee2f1a7447e6da2eb65266613d5b97bff31b0e5cb49dce7f4649cff5bf09`）、対L11 `32行`（section SHA `sha256:85da82e131a7b0665c0c00013c04927c9963da7dc2d38d2ce83f8c45dbd89a8f`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。



**責務・依存とfailure時の戻し先（固定L2の保持）**：接続候補と両端ownerが宣言した契約。通信、再送、他接続を必須にしない。 戻し先: 欠落/衝突/unknownは登録を未成立にし、不足または矛盾した宣言を該当する接続元・consumer ownerへ戻す。

**L3 acceptance (`CONNECT-AC-001-01`)**：登録identityと両端契約が一意に結び付き、不足・不明・同一接続identityの異なる宣言による重複・identity衝突は利用可能にならない。識別可能な別接続による端点共有は拒否しない。能力名、契約/成果物/依存版、scope、correlation ID、期限、冪等キー、result stateを含む完全descriptorを照合し、各必須値欠落・未登録revision・衝突をusableにせず、別identityや既定登録へのfallbackで補わない。登録から業務承認・SECURITY許可を生成しない

**対応L11 acceptance**：`HELIXCONNECT-L11-001`。

### CONNECT-FR-002-01 — 互換性/stale

開始前および関連revision変更後の再利用前に実revision組を照合する。照合は既存read scope内で単独実施でき、送信許可を要しない。compatible/incompatible/unknown/staleと原因revisionを記録し、再照合で確認した組だけstale解除。send判定時だけ既存SECURITY authority/data-useを追加照合し、参照のみはnot_evaluated。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：LEGACY-ASSET-9B7682EBDEA171005D45, 旧L3の同path lines 24–83（全体SHAは上記）は互換性条項の隣接根拠に限る。現在の互換要件は再導出。 旧distribution test consumer asset `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md` lines 1–58, SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`: integration oracleに限り、直接のidentity対応は未確認。

- **固定親**：`HELIXCONNECT-L2-002` / `MPR-RC-HELIXCONNECT-L2-002-002`、semantic digest `sha256:ebc3e58d7479cb2f80ada4ebba32363bdcf6cf67e908075b5b1ececb29f8e037`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L67`（section SHA `sha256:2f820064ab2f79b7762846fc6a2091a16d06951f02cabedd781d267ef2648756`）、対L11 `33行`（section SHA `sha256:f08497b4ac4e95eca764a95a9cec24fe288caff09df1bd8d397d5fee1ea1f22d`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。



**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-001の接続登録、端点ownerのversion/互換宣言。送信適格性を照合する操作では、該当するSECURITY authorityとdata-use条件を追加で参照する。通信実行を必須にしない。 戻し先: 契約不一致は接続設計・契約ownerへ、読取りaccess条件はその既存owner/authorityへ、送信時の許可scope/expiry問題はHELIX-SECURITYへ戻す。比較不能はunknown/staleとして記録し、送信は保留する。

**L3 acceptance (`CONNECT-AC-002-01`)**：既存scope/access条件下で互換性を照合し、結果をcompatible/incompatible/unknown/staleに区別して記録し、送信時のみ許可を確認する。互換条件の比較不能や未登録revisionはunknownのまま扱い、compatibleへ推定せず、送信attemptを0に保つ。revision変更後はstaleを検知して再照合まで通信を止める。read access欠落/拒否/unknownは比較をunknown/保留にし、参照のみの正常照合はcompatibleとsend eligibility not_evaluated、attempt 0を保つ。送信適格性はactor/target/operation/revision/environment/scope/expiryとdata-use条件の個別照合が成立したときだけeligibleで、不一致/不明/期限切れ/失効ではcompatible結果を保持してwithheld・attempt 0とする。未見の宣言範囲内revision組も同条件で照合し、宣言外・未登録revisionはunknownとする

**対応L11 acceptance**：`HELIXCONNECT-L11-002`。

### CONNECT-FR-003-01 — 契約に束縛した送受信

通信はconnection/operation/contract revision/互換receiptに束縛する。契約外入力・revision違い・未識別operationは成功でなく拒否または隔離。技術結果だけ返し業務完了を決めない。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：LEGACY-ASSET-9B7682EBDEA171005D45, 同じ旧L3 pathのlines 24–83/全体SHAは上記 and `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` 旧test pathのlines 1–58/SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`: package/integrationに隣接する根拠に限る。直接のCONNECT requirementは未発見のため再導出。

- **固定親**：`HELIXCONNECT-L2-003` / `MPR-RC-HELIXCONNECT-L2-003-001`、semantic digest `sha256:6eea10829958fee5807147b6a7cdd9d4e889f72fbf5b6cef24ab925e9b85bf42`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L80`（section SHA `sha256:538e057821cbe69138efe2b2ffd1c593d08be7a4348f01dc0c8afa26b4eac15e`）、対L11 `34行`（section SHA `sha256:b75ad5d62c39ae87f6c51b1dfe8bb65880350b02fa61ef36d5e16dbabf904196`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。



**責務・依存とfailure時の戻し先（固定L2の保持）**：登録済み接続と現時点の互換照合、端点双方の受領契約。別の接続を必須にしない。 戻し先: 契約・版問題は両端contract ownerへ、scope/許可問題はSECURITYへ、受領拒否・業務結果は受信側業務ownerへ返す。接続結果を業務完了へ昇格しない。

**L3 acceptance (`CONNECT-AC-003-01`)**：送受信が正しい接続identity・operation・契約revisionに束縛され、契約外入力を成功扱いしない。能力名、契約/成果物/依存版、target scope、correlation ID、期限、idempotency key、result stateを各々欠落・不一致にした反例を拒否し、対象接続・理由・観測地点を保持する。契約/版の修正先は両端contract ownerである。接続identityの混載を拒否し、送信に適用する許可の期限切れ・期限不明、許可/data-use不明・範囲外では送信attempt 0を保ちSECURITYへ返す。受領拒否/業務結果は受信側業務ownerに区別して返す

**対応L11 acceptance**：`HELIXCONNECT-L11-003`。

### CONNECT-FR-004-01 — 制御再送

再送は技術的retryable failureに限定し、同一operation identity/content digest/単一contract revision、契約上限・可否を守る。同一ID+digestは二重効果なし、異digestは衝突拒否。business resultは再送せずownerへ返し、新revisionに自動移行しない。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：旧distribution package L3 asset `LEGACY-ASSET-9B7682EBDEA171005D45`（lines 24–83、SHAは上記）およびdistribution受入consumer `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB`（lines 1–58、SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`）は隣接根拠に限る。具体的なidempotency/retry上限は固定L2/HARNESS pack contractから再導出し、旧algorithmはコピーしない。

- **固定親**：`HELIXCONNECT-L2-004` / `MPR-RC-HELIXCONNECT-L2-004-001`、semantic digest `sha256:2a62ae83a10c379554ce2ac586edeb887256ee8742f7c8b5c53f0c6250dc41ef`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L91`（section SHA `sha256:f4b6bcba98851d0c9bd8c73cd59e7fdf3722b5c177f45594cc20a47da33daccd`）、対L11 `35行`（section SHA `sha256:3b541266c8c31b7fd4a7e3010540c58099c8abaedb505f27701f4ba6bbe28c35`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。



**責務・依存とfailure時の戻し先（固定L2の保持）**：登録・互換照合・通信契約、受信側の同一identity重複排除契約。構成体や後続機構を必須にしない。 戻し先: digest衝突や再送上限到達は送信を停止し、connection operationのownerへ未完義務と試行数を返す。業務結果は元の業務ownerへ、許可期限切れはSECURITYへ戻す。新revisionへ自動混載再送しない。

**L3 acceptance (`CONNECT-AC-004-01`)**：接続契約が再送可能と定めた技術的失敗について、既存operation identity・同一digest・単一contract revisionで設定済み上限内の再送だけを許し、受信側効果は一回分とする。応答欠落はその一例であり唯一の再送契機ではない。異digest衝突、上限到達後の追加attempt、業務エラーまたは再送不能結果の再送は拒否し、未完結果を元operation ownerへ返す。新しい上限値・retry権限は作らない。

**対応L11 acceptance**：`HELIXCONNECT-L11-004`。

### CONNECT-FR-005-01 — 技術trace

登録・照合・送信・受領・attempt/retry/stale/拒否/終端をconnection/operation/contract revision/attempt identityで順序追跡する。技術状態と端点観測範囲を区別し、欠落/順序不明はunknown。通常のtrace/receiptにraw業務payload・secret・credential値を保存・複製しない。必要な本文の保持・削除・利用区分は元source/consumer ownerとSECURITYの契約に従い、CONNECTが再定義せず、業務判断を代筆しない。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：Legacy assets `LEGACY-ASSET-9B7682EBDEA171005D45` old L3 package requirements lines 24–83/SHA `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` and `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` 旧system testのlines 1–58/SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` はconsumer contextに限る。直接のtrace FRは確認されていない。固定L2/pack evidence contractから再導出。

- **固定親**：`HELIXCONNECT-L2-005` / `MPR-RC-HELIXCONNECT-L2-005-001`、semantic digest `sha256:d2e2a658c6055384b4946a6aff9840ec3a1d719f9cc6863d8fc260ff0e3af871`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L102`（section SHA `sha256:2d913f153b1d7ee5e07e4dabc65baee93649ee06ad442c942b07541389835289`）、対L11 `36行`（section SHA `sha256:0bec83bfdd64af8ec58f0b15748bd9d4985e202b160076a82896a3a890056e22`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。



**責務・依存とfailure時の戻し先（固定L2の保持）**：connection operation eventと共通ログ/証拠の契約。本文payload保存を必須にしない。 戻し先: traceの欠落/順序不明はoperationをunknownとしてconnection operation ownerへ返し、業務完了を止める。data-useや許可の不明はSECURITY/source ownerへ戻す。

**L3 acceptance (`CONNECT-AC-005-01`)**：送受信・受信確認失敗・再送途中のstale・期限切れ・取消・許可失効・部分失敗を接続単位に順序追跡できる。証拠は接続identity、能力名、operation/correlation/idempotency identity、target scope、使用revision、期限、互換照合結果、各attemptの識別子・順序・結果、停止理由、成功を観測した端点を含む。成功・失敗・部分成功・同identity同digestの重複・異digest衝突・unknownを区別し、ACKなし・取消・期限切れ・許可失効をunknown/unfinishedとして保持し、途中成功をend-to-end成功や業務完了へ丸めない。通常trace/receiptへraw業務payload・secret・credential値を保存・複製しない

**対応L11 acceptance**：`HELIXCONNECT-L11-005`。

### CONNECT-FR-006-01 — 片側交換時の接続互換性

#### 固定親revisionとauthority

- 採択登録: `MPR-RC-HELIXCONNECT-L2-006-002`。基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の`docs/governance/management-provisional-requirement-register.jsonl:337`、row SHA-256（JSONL当該行bytesの終端LFを除外）`7c942e87dab797a4edff23da53f97b0b75ba27eecfdb5504f03bc9ba193854c0`、candidate semantic digest `sha256:876d54895668800e8a3f1866523fb65fb68bb7c13bad936396ecf43ecff30db7`。
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

## Stage 4 — HELIXCONNECT-L2-008/009（対の部分草稿）

固定親はbase 633bf12の採択revisionと判断記録で固定する。旧MCP profile調査は具体的な接続契約の完全一致根拠ではなく、profile identityと技術traceの部分類例である。両親とも固定L2/L11から要件を再導出する。

### CONNECT-FR-008-01 — MCP profile probe descriptor（親 HELIXCONNECT-L2-008）

Probe descriptorはcatalogに列挙されたMCP profile identity/revision、configuration identity/revision/type、descriptor schema/version、typed operation/tool capability、read-only probe descriptorを結ぶ。異なる型のconfig/descriptor、同一identityの競合定義、catalog未登録revisionはtarget/profileを確定せず、raw secret・credential値をdescriptorへ含めない。profile/config/descriptorの一件の失敗を他profileへ波及させない。descriptorの存在は安全性、permission、実行可能性の証明ではない。profile unknown/mismatchは拒否理由とprofile/revisionを記録してfail closedとし、default profileへfallbackせず、staleはHELIXCONNECT-L2-002の再照合へ戻す。probe設計はoperation spawn、送信権限、SECURITY判断を作らない。不正identity/config/descriptorの修正先はprofile提供元、policy/safetyのunknown・拒否はSECURITYへ区別して返す。確認は文書と静的fixtureに限り、証拠がなければunknownとする。descriptorの読出しはauthorization/probe/tool起動を生まず、この候補の成立は要求採択、実装、実行許可またはSECURITY-L2-034採択を意味しない。SECURITY-L2-034の採択を前提・依存・pass根拠にしない。

**受入条件**

- CONNECT-AC-008-01: catalogの各列挙profileについてprofile/configuration/descriptor identityとrevision/type/schema、typed capability、read-only probeを結び、正常descriptorが実行を開始しないことを確認する。L11-008のfixtureは静的文書のみで、実runtime/test/probeを実行しない。
- CONNECT-AC-008-02: 同一identity競合、config/descriptor型違い、catalog未登録revision、および各列挙fieldのmissing/stale/mismatchを個別に与える。unknown profileも該当targetをunknown/staleにして拒否理由とprofile/revisionを記録し、default profileや古いcompatible記録へfallbackしない。他profileの結果は不変。
- CONNECT-AC-008-03: descriptorの存在だけでpermission、安全、executableをtrueにする変異、descriptor読出しだけでauthorization/probe/tool実行を生成する変異を個別に拒否する。SECURITY authorityが無い場合もsend eligibilityを生成しない。確認は文書と静的fixtureに限り、証拠不足はunknownとし、本候補から要求採択・実装・実行許可・SECURITY-L2-034採択を生成しない。
- CONNECT-AC-008-04: raw secret・credential値をdescriptor/config observationへ含める入力をそれぞれ拒否し、値を出力・保存しない。別profileの有効descriptorは独立に維持する。

旧MCP profile調査 LEGACY-ASSET-1E45495250B6F9793189 はprofile特性の部分類例、旧gap audit DC0AE3267D63F3525BAEは旧L3該当が見つからなかった証拠、旧U-MCPPROFILE test FAAFFA616A44F65911EB は設計形式の参照に限る（正しいIDはFAAFFA616A44F65911EB）。旧test・runtimeは実行しない。

### CONNECT-FR-009-01 — typed feedback relation（親 HELIXCONNECT-L2-009）

必要時にdirection、serial/parallel execution topology、typed feedback relationを記録し、operation lineage、reason、endpoint、contract versionに結ぶ。自由文feedbackはfindingのまま保持し、resolution・受領・承認・完了へ変換しない。one-wayとpaired-bidirectionalは各方向のauthority・edgeを個別に保持し、片方向だけの宣言から逆方向の送信許可やrelationを推定しない。feedback未送信edgeは未完relationであり、独立にeligibleな初回edgeを止めない。独立宣言されたreverse feedback operationは新しい一方向operation identityとpayload digestを持つ。forward/reverseはcorrelationと因果operation lineageを共有しても同一operationとはみなさず、同一operationのretry/resumeだけが元identity・digest・contract revisionを維持する。serialは宣言順と宣言された先行条件を保持し、parallel joinは固定親が要求する全入力・terminal状態が揃うまでjoin結果を未完にする。欠落ACKは既に行ったattemptを維持し、受領/完了の確定だけを保留する。loop条件欠落は追加retryを0にするが、初回eligibilityを遡って変更しない。既存retry/budget/termination policyを使用し、attempt累積を保持する。各反復でbudgetをresetせず、deadline・terminal owner・停止理由を記録し、attempt回数またはretry capを追加しない。first-send dependency unknownとfeedback-specific unknownは別状態で返し、片方の未確定を他方の失敗へ混ぜない。

**受入条件**

- CONNECT-AC-009-01: 能力名、契約/成果物/依存版、target scope、correlation ID、期限、idempotency key、result stateを含む送受envelopeを照合し、各field欠落/不一致を個別に拒否する。one-wayとpaired-bidirectionalの各方向のauthority/edgeを独立照合し、逆方向未送信を送信済みと扱わない。serialは宣言順を保持し、必要な先行resultまたは宣言された先行条件が未成立の後続edgeを実行せず、parallel joinは固定親の全join条件が揃った場合だけterminal resultを作る。forwardと独立宣言されたreverse feedback operationは別々のoperation identity/digestを持ち、共有correlation/因果lineage・reason/endpoint/revisionへ関係づける。方向またはfeedbackのendpoint/contract revision欠落を利用可能にする反例と、宣言のない順序/joinを許容する反例は個別に拒否する。辺の一部成功を全体成功へ伝播する反例も拒否する。
- CONNECT-AC-009-02: 初回送信のendpoint、接続identity、契約revision、適用authorityをそれぞれmissing/unknown/stale/conflictにする個別fixtureでは、該当辺の初回送信attemptを0にし、missing inputとownerを返す。feedback送信のreason、source/target identity、契約revision、逆方向connection、適用authorityを各状態へ個別変異するとfeedback送信だけを保留する。parallel join条件不明はjoin/全体完了だけを保留し、ACK対応不明は既存attemptを保持して受領/完了だけ保留する。独立してeligibleな他操作へ伝播しない。eligibleな初回edgeとfeedback未送信、ACK未着、feedback endpoint/reason/contract欠落を個別fixtureにする。feedback欠落でも初回edgeは止めず、ACK未着はattemptを維持して受領/完了のみhold、loop条件欠落時は新規retryのみ0とする。
- CONNECT-AC-009-03: retry/budget/deadline/terminal owner/policy、累積attempt数、operation identityをそれぞれmissing/unknown/stale/conflictにする。追加retryは0、独自cap/send permissionなしでpolicy ownerへ戻す。欠落があっても既存attemptを消去/初回eligibilityを遡及変更しない。
- CONNECT-AC-009-04: 複数反復のattemptを累積し、次反復でbudget resetを試みるfixture、deadline超過、terminal owner不在を別々に与える。正常なbounded loopではforward/reverse-feedback operationにそれぞれ独立宣言済みidentityとdigestを持たせ、共通correlation/因果lineageへ結び、ACK/terminal eventは対応operationへ記録する。同一operationのretry/resumeだけは同一identity・digest・contract revisionを保つ。resumeでそのoperationを二重効果化する変異、retry時だけdigestを変える変異、shared correlationだけでforwardとreverseを同一operation扱いする変異は個別に拒否する。新しい重複排除義務は設けない。因果event/receipt traceへraw business payload/secret/credential値を複製しない。既存上限到達では新規retryを0にして、未解決をOS-040等の既存terminal ownerへ返す。期限/terminal解決が不明でも新規retryを止め、未完義務・停止理由・ownerを保持する。

旧UWJ-FR-006はfeedback loopの構造類例、HIL-NFR-04はbudgetの別owner類例、MIC-R-02は統合sequenceの類例として部分再利用する。方向・理由付きtyped relation自体は現行L2から再導出し、旧assetをCONNECT仕様とは見なさない。旧参照はUWJ `universal-workflow-ai-judgment-engine.md:50`、HIL `infinity-loop-platform-requirements.md:184`、MIC `management-integration-cell-requirements.md:62–68`（asset ID/full SHA/raw span SHAは以下の旧資産source mapに記録している）。

## Stage 4 fixed-parent and legacy source pins

基準commitはmain 633bf12。PO decision rowが採択根拠でありregister metadataは承認を生成しない。固定spanはinclusive physical lines、raw SHAは行末を含むbytes。

| 親 | PO判断／登録ID／row SHA | 固定L2 path・span・raw SHA・semantic digest | 固定L11 path・span・raw SHA | 基準commit／decision・L2・L11 full SHA |
|---|---|---|---|---|
| HELIXCONNECT-L2-008 | MPR-RC-HELIXCONNECT-L2-008-002 / docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L94 / 71dfba9e65926882b18cf9645aa5d302feadb4a0f2020ab63f2e7e2c22fa3732 | docs/helix-connect/L2-requirements/connect-requirements.md:274–284 / 4b5028444f8dfecc3ddad03d94c7de666e716e63974a2851123285af77472813 / sha256:4b5028444f8dfecc3ddad03d94c7de666e716e63974a2851123285af77472813 | docs/helix-connect/L11-acceptance/connect-acceptance.md:87–93 / 09dcbb00bee7d4a1680a16176d9f0bbe0c0d385a7d27a4fec61950f5c636b50e | 633bf12ea8f948db8ba3d6600179c4a9507377a7 / decision c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad / L2 94003c16183d96736994ee4d4d0483eb64a2db0eabca2ba20c5baebc8f86b7a1 / L11 aa213f2a9fa766d4d7e1e00fa333559fd83254c2f045a187a1f12df4236b54b9 |
| HELIXCONNECT-L2-009 | MPR-RC-HELIXCONNECT-L2-009-002 / docs/governance/decisions/po-decision-2026-09-29-57candidates.md#L95 / 765d6070ed419f678b00e0e7367d7a6048febb4002d04ced1baf1858cd3a4260 | docs/helix-connect/L2-requirements/connect-requirements.md:285–295 / d2fc48f4ce3049a078203b281a69a2d211789456ef4fa6a25cd074f96c04712f / sha256:d2fc48f4ce3049a078203b281a69a2d211789456ef4fa6a25cd074f96c04712f | docs/helix-connect/L11-acceptance/connect-acceptance.md:94–104 / 07e639a165d02d32deb8ae820418aadc9893837b5d3cab5b8387287cd3283ca1 | 633bf12ea8f948db8ba3d6600179c4a9507377a7 / decision c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad / L2 94003c16183d96736994ee4d4d0483eb64a2db0eabca2ba20c5baebc8f86b7a1 / L11 aa213f2a9fa766d4d7e1e00fa333559fd83254c2f045a187a1f12df4236b54b9 |

旧L3／paired test-designのitem別source map（asset IDはdisposition ledger照合済み。span raw bytesで再計算）：

| 親 | old asset/path/lines | full SHA-256 | raw span SHA-256 | 対応分類 |
|---|---|---|---|---|
| HELIXCONNECT-L2-008 | LEGACY-ASSET-1E45495250B6F9793189 / archive/legacy-generation-2026-09-14/root/docs/research/mcp-external-verification-profile-research-2026-06-09.md:28–36 | 08801af5be5429204827c0ce2e0adcacaee74bf5fa72b07a9d1c403c16dc330b | 81dde9dea84226a83b9c557ab7e97eff5905dc70c8301f3ae7d8750f1af4c7fb | profile identity/source attributesの隣接類例だけ部分参照。probeのsafe/executable/permissionは再利用せず固定親から再導出。 |
| HELIXCONNECT-L2-008 | LEGACY-ASSET-DC0AE3267D63F3525BAE / archive/legacy-generation-2026-09-14/root/docs/governance/hybrid-engine-requirements-extraction-gap-audit-2026-07-19.md:14–14 | 345928addace631d97f902b391fe6656581c1ff2caea1f94587149e008a98e70 | e7058b243f55074b242dcdcd0c847a353cf890dac5554cf08dfa9bc2ce25dff4 | 旧検索時点ではMCP profileのL1/L3直接hitなし。範囲限定の不在証拠であり、現行候補の承認根拠にしない。 |
| HELIXCONNECT-L2-008 | LEGACY-ASSET-DC0AE3267D63F3525BAE / archive/legacy-generation-2026-09-14/root/docs/governance/hybrid-engine-requirements-extraction-gap-audit-2026-07-19.md:57–60 | 345928addace631d97f902b391fe6656581c1ff2caea1f94587149e008a98e70 | beafa3a86575ae1391dd9ff591000b31a3f3eea2c06c710196920ee1f9f70c3b | 同gap auditの検索scope/方法を記録。旧runtime/CLIは実行せず、現行probe descriptorをL2から再導出。 |
| HELIXCONNECT-L2-009 | LEGACY-ASSET-5EE032D657C221184B00 / archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:50–50 | e20f475a3d1d082842415c2b734233e33a59f1b0bb1046c41e4ff4ec9c700e5b | 9a90b00908df1d4ba84ad2719cf354575dd6797b34b4d03ed03956edbefb046c | UWJ-FR-006 loop terminal/feedback lifecycleの構造類例を部分参照。CONNECT typed relation/directionは固定親から再導出。 |
| HELIXCONNECT-L2-009 | LEGACY-ASSET-6FFD7F4E58066D08B053 / archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md:22–22 | 1c4e07263eba5254cfe66b920c4baf46227e0e07cb47ff60ac2e854740645db3 | c0955b863f781efd03adc6d48f82ddc950331efe185ddc7cf26f35107e8401b9 | UWJ-AC-006 required field欠落時のnegative oracle形式のみ参照。 |
| HELIXCONNECT-L2-008 | LEGACY-ASSET-FAAFFA616A44F65911EB / archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L7-unit-test-design.md:558–563 | 0fd9f9dc3ac452fefaa74d3fea79c19a9fe2e162908ed763bfbcc56514186347 | 69ad06e2a671ff8636be0db88bb2caf4ba49bdcf1c51f34879ff6de043b8d952 | U-MCPPROFILE catalog/profile test形式の隣接類例に限定。旧profile setや旧前提は移植せず、現行catalog/revision/type条件は固定親から再導出。 |
| HELIXCONNECT-L2-009 | LEGACY-ASSET-719D5EC9C06FC4AAD0FF / archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:184–184 | db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb | 5c9f6a2b8121965a3c5a0742599921971bb89f7b3bc4f2315fc51df9bdb6b68d | HIL-NFR-04のiteration/time/token/cost budgetは別ownerの隣接類例。特定budget値を移植せず既存policy累積とdeadlineを固定親から再導出。 |
| HELIXCONNECT-L2-009 | LEGACY-ASSET-23D3D9769B093AFDCC25 / archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/management-integration-cell-requirements.md:62–68 | f840e16cab80b88fa4e4730ed49f47f0afeee2050cad309a3d87da4cce057ec6 | d5264cd41eb448f9a866e42063ebed79f6c0186b20883099d19f217547e55822 | MIC-R-02の統合sequence類例。旧merge authorityはCONNECTへ移さず、typed relationを現行L2から再導出。 |

旧runtime、CLI、testを実行せず、採択済みL2/L11の要求意味を本Stage4の正本に再導出した。

## Stage 5 — HELIXCONNECT-L2-007 複数接続の構成体

### CONNECT-FR-007-01 — 必須辺と終端のcomposite trace

構成体入力で指定されたrequired connection edgesについて、3つ以上の機構をまたぐ各edge identity、端点、能力名、contract revision、scope、順序、operation/correlation/idempotency対応、期限/result state、SECURITY/data-use識別子、edge ownerとrecovery先を分けて追跡する。各edgeが個別に登録・現revision照合され、operation handoffが終端まで確認されたときだけ技術的通信完了を報告する。先行edgeの成功と後続edgeの部分/失敗状態を保持し、stop locationと未完義務を引継ぐ。CONNECTは接続先の業務成立・承認を決めない。

このFRはL2-001..005の辺契約とHARNESS-L2-010/011のpack契約を参照する。required-edge集合や順序、接続業務の意味をこの文書で追加せず、構成体入力と各source ownerが宣言した契約を照合する。新たなexecution authority、共通retry cap、transport方式を生成しない。

**受入条件**

- `CONNECT-AC-007-01`: 3つ以上の機構、複数の接続identity、およびedgeごとに異なる能力名/契約revision/scopeを持つ正常fixtureを与え、各edgeについてL11-001のdescriptor必須field、すなわち能力名、契約/成果物/依存版、target scope、correlation ID、expiry、idempotency key、result state、SECURITY/data-use識別子を含む完全descriptorを個別に照合し、登録・互換照合・operation lineage・result/terminalが個別に追跡でき、宣言されたrequired edge全ての終端が確認された場合だけ構成体の技術完了となる。edgeごとの再送可否・上限・停止条件とoperation identityを追跡する。宣言済みhandoffは次edgeのidentity/contract/authority条件に従って別operationとして受渡し可能とし、未宣言または異なるoperationへ同一attemptを無断転用する受渡しと再送境界超過を拒否する。単体接続のgreenを他edgeへ転用せず、辺の一部成功を全体成功へ伝播しない。登録・構成体の技術完了から業務成立・業務承認またはSECURITY許可を生成しない。
- `CONNECT-AC-007-02`: 中間edgeにstale、timeout、異digest衝突、expiry、cancel、authority revoke、partial successを個別に与える。後続edgeの未許可送信/再送を0にし、先行成功を消さずpartial/unknownを保ち、停止edge・未完owner・recovery先を出す。いずれも構成体成功・業務承認を生成しない。

**責務と失敗時の戻し先**：edgeの登録・契約不一致は該当connection/両端ownerへ、SECURITY/data-use・expiryはSECURITYへ、operation/業務結果は元機構のownerへ戻す。後続edgeを実行済みにせず、先行の成功結果は保持する。

### HELIXCONNECT-L2-007 固定親・旧sourceとの照合

固定親はmain `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択revision。L2 `docs/helix-connect/L2-requirements/connect-requirements.md:128–138`（全文SHA `94003c16183d96736994ee4d4d0483eb64a2db0eabca2ba20c5baebc8f86b7a1`、raw span SHA `a2ce7b34ee2d389fbc60a45329c66014a02739150e0cc3c577188aa5578d6228`。末尾空行を含むraw spanと採択semantic digestは区別する）。対L11 `docs/helix-connect/L11-acceptance/connect-acceptance.md:74–77`（全文SHA `aa213f2a9fa766d4d7e1e00fa333559fd83254c2f045a187a1f12df4236b54b9`、raw span SHA `1caa90d7e3b407c72bea119a4084eb37e9e828c6889ea8621d65410a090a0ade`）。PO decision `helix-connect-requirements-po-decision-2026-09-28.md#L48`（decision SHA `82db2060dbaa77b5b9e6f38fa11219ec811b108b1870e6a86ca112810f9bae69`）、採択登録 `MPR-RC-HELIXCONNECT-L2-007-001`、PO対象semantic digest `44dac7757466d487bbfc30f3201b6c282c5ab72e3cb660ad528876ada555f75b`。

旧HELIXに現行HELIXCONNECT-L2-007と一対一の複数接続構成体要件は確認できない。旧distribution-package L3 `LEGACY-ASSET-9B7682EBDEA171005D45`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/distribution-package-release-requirements.md:24–83`、全文SHA `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c`、raw span SHA `60f558ed4c14b1b235e060dad063c8a07c202b02868a1004ae8f4855671e6c2e`）とpaired system test `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB`（`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md:22–31`、全文SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`、raw span SHA `d826f63a45f76c205a424ce412ad3a7de4fcac0a8d3b4e9090460e4e7e38abd5`）はsource/revision/consumer整合とpositive/negative分離の構造類例だけに使い、release/promotion authorityやbundle意味をCONNECTへ移さない。複数connection edge、技術終端、途中失敗と戻し先は固定L2/L11から再導出する。

## Review修正：個別L11受入本文の固定pin

基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7` の個別受入本文を、一覧行の要約と区別して固定する。全文SHA-256 `aa213f2a9fa766d4d7e1e00fa333559fd83254c2f045a187a1f12df4236b54b9`。001〜007は9/28固定親の対受入、008/009は57candidatesの採択対象の対受入であり、本文に残る候補表記から採否を生成しない。各spanは行末込みinclusive raw bytesである。

| 親identity | L11個別受入source | raw span SHA-256 |
|---|---|---|
| HELIXCONNECT-L2-001 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:42–45` | `d93c0dd16922ec35e15ba6c97051606a5091eea7aeffd9084092c8c14a97890e` |
| HELIXCONNECT-L2-002 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:46–53` | `609e81954fa14c0410fbd260a76f3042e4fcd1df875fa543b2886e06c5d30be6` |
| HELIXCONNECT-L2-003 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:54–57` | `2fececd4d6950cdcf5e30f2e9c1585d0db69fa4b75823b710624160a64f9f39a` |
| HELIXCONNECT-L2-004 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:58–61` | `e1d91d283608de01be754243a36f4136c1e94f91d3510e9f7cc15255aa830dd7` |
| HELIXCONNECT-L2-005 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:62–65` | `f5ed1adebfef458ff48643d9210d06f0b02d28d9dd22b5503e23fd61fc6dcc3c` |
| HELIXCONNECT-L2-006 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:68–71` | `54914d87573a375cda5935f8295699e91a5b1762e74ffb8974701a462d60cdbb` |
| HELIXCONNECT-L2-007 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:74–77` | `1caa90d7e3b407c72bea119a4084eb37e9e828c6889ea8621d65410a090a0ade` |
| HELIXCONNECT-L2-008 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:87–93` | `09dcbb00bee7d4a1680a16176d9f0bbe0c0d385a7d27a4fec61950f5c636b50e` |
| HELIXCONNECT-L2-009 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:94–104` | `07e639a165d02d32deb8ae820418aadc9893837b5d3cab5b8387287cd3283ca1` |

## 旧source照合の範囲と保持・変更

旧 `docs/design/helix/L3-requirements/` と `docs/test-design/helix/` を、`CONNECT-FR` / `HELIXCONNECT-L2` / `connection identity` / `connectionIdentity` の文字列で検索し直接hitは0件だった。これは指定語・指定範囲内の結果であり、旧資産全体に同じ意味がないとの証明ではない。旧配布契約のprofile/source/revision/consumer分離は001〜007の隣接比較、旧UWJ loop/terminalと対受入は009の正常・各必須field欠落の形式、旧HIL budgetは既存owner policy参照の比較に限る。旧MICのTL/main/combined CI/DB/merge権限は通信authorityへ移さず、sequence後のrevision drift再照合の観点だけを使う。

008の旧profile調査・U-MCPPROFILE形式からidentity/source/configの区別とsecret非永続化の観点を保持する。旧catalogのexact profile集合、既定enabled値、旧runtime指定、Bunの既定profileは現行候補へ移植せず、採択済みcatalog/revision/descriptor供給と非起動の条件を現行L2/L11から再導出する。旧調査のtrusted/smoke/toolkit推奨から新しいprobe gateや安全・実行資格を生成しない。これらの変更理由は採択済みowner/scope/版とBun非利用に合わせるためで、旧資産の不在だけを理由に新規統制を作らない。
