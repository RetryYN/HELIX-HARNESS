# HELIX-CONNECT L3 機能要件（Stage 1）

> 状態: 要件草稿・未承認。収録範囲は1.0採択親 `HELIXCONNECT-L2-001`〜`005` の5件。L3承認、方式確定、実装完了を表さない。

## 適用・責務境界

登録、互換照合、契約に束縛した送受信、制御再送、技術traceを親identityごとのFR/ACに分ける。CONNECTは両端ownerの業務意味、SECURITYのauthority、OSのassignmentを所有しない。通信結果から業務完了や許可を生成しない。状態・receiptは要求出力の論理モデルで、wire format、DB、transport、adapterの実装を確定しない。

共通packは採択済みHARNESS-L2-010/011の要求契約を参照する。#2564の未承認L3候補を承認済み依存にはしない。fixtureは同要求が列挙するidentity、入出力、依存版、互換範囲、検証、更新・切戻し・未完義務を宣言した契約例を用いる。実装・freezeへ降ろす際の未確定依存は別に照合する。今回の収録から他Stage・他機構の成立を推定しない。

## 旧HELIXを起点とする構造と対応

旧 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13–21,148–168`（SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`）のFR+ACと対の検証設計、旧HARNESS L3 README `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:1–56`（asset `LEGACY-ASSET-9A772391C7FB1298D45F`、SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）のfunctional/business/NFR 3 sub-docを保持する。旧のL10 UX受入・L12表記と現行L10総合検証は同一視せず、現行L3/L10の3対へ置き換える。理由は採択済み現行層対応に合わせるためで、旧gate・CLI・実装・数値は継承しない。

旧 `docs/design/helix/L3-requirements/` と `docs/test-design/helix/` を `CONNECT-FR`、`HELIXCONNECT-L2`、`connection identity`、`connectionIdentity` で検索した直接hitは0件。これは指定語と範囲の限界であり、旧全資産に類例がない証明ではない。各FRでは旧配布契約を隣接比較として記録し、採択済みL2/L11から意味を再導出する。旧package profile、allowlist、release/promotion authorityやalgorithmをCONNECTへ移さない。

旧対のsystem test `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md:1–58`（asset `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB`、SHA-256 `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`）から、AC・入力・正常・個別negative・証拠の対応形式を再導出する。旧consumer実行や旧CI合格は使用しない。

## 固定親の入出力と共通束縛

下表は基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7` の各親入力・出力を保持する。各FR/ACとL10 fixtureはこの宣言を使い、入力の必須要素欠落・不一致と結果の欠落を個別に比較する。適用されるSECURITY/data-use/classification識別子を受け渡すことと、送信操作のauthority照合は別であり、登録・参照照合へ送信許可を事前要求しない。未完義務は共通packが指定するscope・recovery先へ引き継ぐ。

| 固定親 | 入力 | 出力 |
|---|---|---|
| HELIXCONNECT-L2-001 | source/consumerと端点の所有者が宣言する接続目的・能力名、端点、方向、scope、契約・成果物・依存のrevisionと互換範囲、適用されるSECURITY許可とdata-use/classification識別子。 | 接続identity、登録revision、端点/能力/契約/依存の参照、状態、登録結果receipt。 |
| HELIXCONNECT-L2-002 | 互換性照合には、接続identity、登録receipt、実使用する両端契約/成果物/依存revision、互換宣言、scopeを使い、入力の読取りには適用される既存scope/access条件を守る。送信適格性を判断する操作に限り、actor、target、operation、environment、expiry、該当するSECURITY許可識別子とdata-use/classification条件を追加で照合する。 | revision組合せを固定した互換性receipt（compatible/incompatible/unknown/stale）。送信操作の要求がある場合のみ、互換成立と有効な適用許可/data-use条件の双方を満たした`eligible`、または理由付きの`withheld`を返す。参照のみの場合は`send_eligibility=not_evaluated`とし、送信attemptを発行しない。 |
| HELIXCONNECT-L2-003 | L2-001の接続登録とL2-002の現在revision照合、能力名、契約/成果物/依存revision、target scope、correlation ID、expiry、idempotency key、result stateの初期値、適用されるSECURITY/data-use識別子、契約に適合するmessage envelope。 | 端点へ渡されたenvelopeと受信側receipt、送信/受信/unknown/拒否のresult state、未完義務があれば共通recovery先へのhandoff情報。 |
| HELIXCONNECT-L2-004 | 未完operation、同一correlation/idempotency identityとdigest、元のscope/expiry/許可、直前attemptとACK/result state、互換確認済みの単一contract revision、契約上の再送上限と可否。 | attemptごとのreceipt、重複効果なしを示す受信確認、終端またはunknown/unfinished状態とrecovery先。 |
| HELIXCONNECT-L2-005 | 登録、照合、送信、受信確認、再送、取消、expiry、許可結果、stale/交換/切戻しeventとscope/version/correlation/attempt識別子。 | append-only技術trace、現在の結果状態、停止地点、未完義務とowner/recovery先へのhandoff参照。data-use区分はsource ownerの識別子で保つ。 |

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

開始前および関連revision変更後の再利用前に実revision組を照合する。照合は既存read scope内で単独実施でき、送信許可を要しない。登録時と使用時のrevisionを区別して記録し、compatible/incompatible/unknown/staleと原因revisionを記録し、再照合で確認した組だけstale解除。send判定時だけ既存SECURITY authority/data-useを追加照合し、参照のみはnot_evaluated。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：LEGACY-ASSET-9B7682EBDEA171005D45, 旧L3の同path lines 24–83（全体SHAは上記）は互換性条項の隣接根拠に限る。現在の互換要件は再導出。 旧distribution test consumer asset `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/distribution-package-release-system-test-design.md` lines 1–58, SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`: integration oracleに限り、直接のidentity対応は未確認。

- **固定親**：`HELIXCONNECT-L2-002` / `MPR-RC-HELIXCONNECT-L2-002-002`、semantic digest `sha256:ebc3e58d7479cb2f80ada4ebba32363bdcf6cf67e908075b5b1ececb29f8e037`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L67`（section SHA `sha256:2f820064ab2f79b7762846fc6a2091a16d06951f02cabedd781d267ef2648756`）、対L11 `33行`（section SHA `sha256:f08497b4ac4e95eca764a95a9cec24fe288caff09df1bd8d397d5fee1ea1f22d`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：L2-001の接続登録、端点ownerのversion/互換宣言。送信適格性を照合する操作では、該当するSECURITY authorityとdata-use条件を追加で参照する。通信実行を必須にしない。 戻し先: 契約不一致は接続設計・契約ownerへ、読取りaccess条件はその既存owner/authorityへ、送信時の許可scope/expiry問題はHELIX-SECURITYへ戻す。比較不能はunknown/staleとして記録し、送信は保留する。

**L3 acceptance (`CONNECT-AC-002-01`)**：既存scope/access条件下で互換性を照合し、結果をcompatible/incompatible/unknown/staleに区別して記録し、送信時のみ許可を確認する。互換条件の比較不能や未登録revisionはunknownのまま扱い、compatibleへ推定せず、送信attemptを0に保つ。端点、意味契約revision、adapter/transport revision、互換範囲の変化を各々stale契機として検知し、再照合まで通信を止める。登録時と使用時のrevisionを区別した記録があり、原因revisionと照合結果に結び付く。read access欠落/拒否/unknownは比較をunknown/保留にし、参照のみの正常照合はcompatibleとsend eligibility not_evaluated、attempt 0を保つ。送信適格性はactor/target/operation/revision/environment/scope/expiryとdata-use条件の個別照合が成立したときだけeligibleで、不一致/不明/期限切れ/失効ではcompatible結果を保持してwithheld・attempt 0とする。未見の宣言範囲内revision組も同条件で照合し、宣言外・未登録revisionはunknownとする

**対応L11 acceptance**：`HELIXCONNECT-L11-002`。

### CONNECT-FR-003-01 — 契約に束縛した送受信

通信はconnection/operation/contract revision/互換receiptに束縛する。契約外入力・revision違い・未識別operationは成功でなく拒否または隔離。技術結果だけ返し業務完了を決めない。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：LEGACY-ASSET-9B7682EBDEA171005D45, 同じ旧L3 pathのlines 24–83/全体SHAは上記 and `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` 旧test pathのlines 1–58/SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`: package/integrationに隣接する根拠に限る。直接のCONNECT requirementは未発見のため再導出。

- **固定親**：`HELIXCONNECT-L2-003` / `MPR-RC-HELIXCONNECT-L2-003-001`、semantic digest `sha256:6eea10829958fee5807147b6a7cdd9d4e889f72fbf5b6cef24ab925e9b85bf42`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L80`（section SHA `sha256:538e057821cbe69138efe2b2ffd1c593d08be7a4348f01dc0c8afa26b4eac15e`）、対L11 `34行`（section SHA `sha256:b75ad5d62c39ae87f6c51b1dfe8bb65880350b02fa61ef36d5e16dbabf904196`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：登録済み接続と現時点の互換照合、端点双方の受領契約。別の接続を必須にしない。 戻し先: 契約・版問題は両端contract ownerへ、scope/許可問題はSECURITYへ、受領拒否・業務結果は受信側業務ownerへ返す。接続結果を業務完了へ昇格しない。

**L3 acceptance (`CONNECT-AC-003-01`)**：送受信が正しい接続identity・operation・契約revisionに束縛され、同じoperation identityが両端記録に現れ、契約外入力を成功扱いしない。未完義務がある場合は共通recovery先へのhandoff情報を返す。両端identityの不一致・片端記録欠落、必要なhandoff欠落を成功としない。能力名、契約/成果物/依存版、target scope、correlation ID、期限、idempotency key、result stateを各々欠落・不一致にした反例を拒否し、対象接続・理由・観測地点を保持する。契約/版の修正先は両端contract ownerである。接続identityの混載を拒否し、送信に適用する許可の期限切れ・期限不明、許可/data-use不明・範囲外では送信attempt 0を保ちSECURITYへ返す。受領拒否/業務結果は受信側業務ownerに区別して返す

**対応L11 acceptance**：`HELIXCONNECT-L11-003`。

### CONNECT-FR-004-01 — 制御再送

再送は技術的retryable failureに限定し、同一operation identity/content digest/単一contract revision、契約上限・可否を守る。同一ID+digestは二重効果なし、異digestは衝突拒否。business resultは再送せずownerへ返し、新revisionに自動移行しない。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：旧distribution package L3 asset `LEGACY-ASSET-9B7682EBDEA171005D45`（lines 24–83、SHAは上記）およびdistribution受入consumer `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB`（lines 1–58、SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc`）は隣接根拠に限る。具体的なidempotency/retry上限は固定L2/HARNESS pack contractから再導出し、旧algorithmはコピーしない。

- **固定親**：`HELIXCONNECT-L2-004` / `MPR-RC-HELIXCONNECT-L2-004-001`、semantic digest `sha256:2a62ae83a10c379554ce2ac586edeb887256ee8742f7c8b5c53f0c6250dc41ef`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L91`（section SHA `sha256:f4b6bcba98851d0c9bd8c73cd59e7fdf3722b5c177f45594cc20a47da33daccd`）、対L11 `35行`（section SHA `sha256:3b541266c8c31b7fd4a7e3010540c58099c8abaedb505f27701f4ba6bbe28c35`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：登録・互換照合・通信契約、受信側の同一identity重複排除契約。構成体や後続機構を必須にしない。 戻し先: digest衝突や再送上限到達は送信を停止し、connection operationのownerへ未完義務と試行数を返す。業務結果は元の業務ownerへ、許可期限切れはSECURITYへ戻す。新revisionへ自動混載再送しない。

**L3 acceptance (`CONNECT-AC-004-01`)**：接続契約が再送可能と定めた技術的失敗について、既存operation identity・同一digest・単一contract revisionで設定済み上限内の再送だけを許し、受信側効果は一回分とする。応答欠落はその一例であり唯一の再送契機ではない。異digest衝突、上限到達後の追加attempt、業務エラーまたは再送不能結果の再送は拒否し、未完義務・試行数は元connection operation ownerへ返し、業務結果は元の業務ownerへ返す。上限到達時も未完の業務結果を業務ownerへ戻すL11判定と、operationの義務引継ぎを別々に記録する。許可期限切れでは追加attempt 0としSECURITYへ戻す。新しい上限値・retry権限は作らない。

**対応L11 acceptance**：`HELIXCONNECT-L11-004`。

### CONNECT-FR-005-01 — 技術trace

登録・照合・送信・受領・attempt/retry/stale/交換/切戻し/拒否/終端をconnection/operation/contract revision/attempt identityで順序追跡する。記録済みtrace eventを書き換え・削除・順序差替えせず、訂正は追記で表す。data-use区分はsource ownerの識別子で保つ。技術状態と端点観測範囲を区別し、欠落/順序不明はunknown。通常のtrace/receiptにraw業務payload・secret・credential値を保存・複製しない。必要な本文の保持・削除・利用区分は元source/consumer ownerとSECURITYの契約に従い、CONNECTが再定義せず、業務判断を代筆しない。

**範囲外**：transport/wire/schema・business success semantics・approval・実装方式は本FRで確定しない。未指定の技術値は旧値を自動継承せず、根拠・比較案・測定方法・判定境界を添えた候補として示してよい（実装値・承認値ではない）。親の意味・scope・owner・version変更が必要なときだけL2へ戻す。

**旧HELIX対応（再利用区分）**：Legacy assets `LEGACY-ASSET-9B7682EBDEA171005D45` old L3 package requirements lines 24–83/SHA `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` and `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` 旧system testのlines 1–58/SHA `3b3e8b72c51ac418ed58c9278cb07f683c37eaf723d6710d12c1ddfb34a811fc` はconsumer contextに限る。直接のtrace FRは確認されていない。固定L2/pack evidence contractから再導出。

- **固定親**：`HELIXCONNECT-L2-005` / `MPR-RC-HELIXCONNECT-L2-005-001`、semantic digest `sha256:d2e2a658c6055384b4946a6aff9840ec3a1d719f9cc6863d8fc260ff0e3af871`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md#L102`（section SHA `sha256:2d913f153b1d7ee5e07e4dabc65baee93649ee06ad442c942b07541389835289`）、対L11 `36行`（section SHA `sha256:0bec83bfdd64af8ec58f0b15748bd9d4985e202b160076a82896a3a890056e22`）。PO decision `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md`、固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2全体SHA `sha256:31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11全体SHA `sha256:bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。

**責務・依存とfailure時の戻し先（固定L2の保持）**：connection operation eventと共通ログ/証拠の契約。本文payload保存を必須にしない。 戻し先: traceの欠落/順序不明はoperationをunknownとしてconnection operation ownerへ返し、業務完了を止める。data-useや許可の不明はSECURITY/source ownerへ戻す。

**L3 acceptance (`CONNECT-AC-005-01`)**：記録済み技術trace eventは上書き・削除・順序差替えせず、訂正を追記で表す。交換/切戻しeventも追跡し、data-use区分はsource ownerの識別子を保持する。送受信・受信確認失敗・再送途中のstale・期限切れ・取消・許可失効・部分失敗を接続単位に順序追跡できる。証拠は接続identity、能力名、operation/correlation/idempotency identity、target scope、使用revision、期限、互換照合結果、各attemptの識別子・順序・結果、停止理由、成功を観測した端点を含む。成功・失敗・部分成功・同identity同digestの重複・異digest衝突・unknownを区別し、ACKなし・取消・期限切れ・許可失効をunknown/unfinishedとして保持し、途中成功をend-to-end成功や業務完了へ丸めない。通常trace/receiptへraw業務payload・secret・credential値を保存・複製しない

**対応L11 acceptance**：`HELIXCONNECT-L11-005`。

## Review修正：個別L11受入本文の固定pin

基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7` の個別受入本文を、一覧行の要約と区別して固定する。全文SHA-256 `aa213f2a9fa766d4d7e1e00fa333559fd83254c2f045a187a1f12df4236b54b9`。001〜005は9/28固定親の対受入であり、本文に残る候補表記から採否を生成しない。各spanは行末込みinclusive raw bytesである。

| 親identity | L11個別受入source | raw span SHA-256 |
|---|---|---|
| HELIXCONNECT-L2-001 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:42–45` | `d93c0dd16922ec35e15ba6c97051606a5091eea7aeffd9084092c8c14a97890e` |
| HELIXCONNECT-L2-002 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:46–53` | `609e81954fa14c0410fbd260a76f3042e4fcd1df875fa543b2886e06c5d30be6` |
| HELIXCONNECT-L2-003 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:54–57` | `2fececd4d6950cdcf5e30f2e9c1585d0db69fa4b75823b710624160a64f9f39a` |
| HELIXCONNECT-L2-004 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:58–61` | `e1d91d283608de01be754243a36f4136c1e94f91d3510e9f7cc15255aa830dd7` |
| HELIXCONNECT-L2-005 | `docs/helix-connect/L11-acceptance/connect-acceptance.md:62–65` | `f5ed1adebfef458ff48643d9210d06f0b02d28d9dd22b5503e23fd61fc6dcc3c` |


## Stage 2a 追加 — HELIXCONNECT-L2-006のみ

本節だけがStage 2aの追補であり、前段のStage 1対象・bytesは書き換えない。対象は採択済み`HELIXCONNECT-L2-006`の1.0候補のみ。L3未承認、実装・送信・交換許可、L10実行・合格を生成しない。Stage2aの他親、Stage2b、Stage2c、L2-007 compositeは含めない。

### 固定親・依存境界

- PO採択parent: `HELIXCONNECT-L2-006`、registration `MPR-RC-HELIXCONNECT-L2-006-002`、semantic digest `876d54895668800e8a3f1866523fb65fb68bb7c13bad936396ecf43ecff30db7`、`version_target: 1.0`。採択集合はmain `633bf12ea8f948db8ba3d6600179c4a9507377a7`のPO record line 48、固定本文は`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 要求本文: [L2-006](../L2-requirements/connect-requirements.md#L115)、対応L11要約 [L11-006](../L11-acceptance/connect-acceptance.md#L37)、接続確認本文 [L11-006](../L11-acceptance/connect-acceptance.md#L68)。要求意味の正本は固定L2/L11であり、本節はそこから正常・失敗・handoffの判定を再導出する。
- 登録・現revision照合・送受信の具体的な既存Stage 1参考点は[FR-001/AC-001](functional-requirements.md#L33)/[CASE-001](../L10-verification/functional-verification.md#L32)、[FR-002/AC-002](functional-requirements.md#L49)/[CASE-002](../L10-verification/functional-verification.md#L41)、[FR-003/AC-003](functional-requirements.md#L65)/[CASE-003](../L10-verification/functional-verification.md#L50)。これらはmainの既存Stage 1 canonicalのexact bytesへの参照で、別の未承認L3をauthorityにしない。要求・受入authorityは対応する固定L2/L11のまま。本文全体と該当spanのmain `e89ca224043575d440f5672f81c681ec6a76df4a` SHAは本追補のsource-pinsへ固定する。
- 006の固定依存は登録済み単一connection、両端のversion互換宣言、HARNESS-L2-010/011のartifact/dependency version・verification scope・更新/切戻し/未完義務契約、および該当するSECURITY許可である。001/002/003はconnection登録・互換照合・通信という006で用いる操作のStage1参照点で、別connection edge、L2-007 composite、未承認の他機構L3を成立前提にしない。

### CONNECT-FR-006-01 — 片側交換時の接続互換性

**固定親からの再導出**：一つの登録済みconnectionで片側の機構本体またはそのCONNECT adapter/transportを交換する。交換されない側の機構とその契約revisionを入力時から固定し、交換側の旧/新revision、両端契約、接続契約、変更scope、互換条件を別々に結ぶ。宣言された互換範囲内と再照合で確かめられた組合せだけ、固定側を変えず同一接続契約上で送受信できる。交換前後のrevision、照合receipt、送受信結果をconnection/operation identityへ束縛する。

| 固定L2-006句 | 要件上の保持点 |
|---|---|
| 片側機構または当該側adapter/transportを交換 | 送信側機構、送信側adapter/transport、受信側機構、受信側adapter/transportを別の交換型として固定する |
| 変更されない側の機構・契約revisionを固定 | 固定側の機構、意味契約、artifact/dependency revisionとscopeを交換前後で同一の基準として追跡する |
| 交換後endpoint/接続契約を個別照合 | 互換範囲、両端revision、connection identityに対する現在の照合結果receiptを保持する |
| 互換確認時だけ固定側を変更せず送受信 | compatible再照合後だけ対象connectionで送受信。固定側を更新したことにする置換・共同変更はこの正常条件を満たさない |
| incompatible/unknown/stale/意味契約変更は停止 | send attemptを開始せず、固定側変更や両側同時変更で適合扱いにしない |
| 交換前後のrevision/照合/通信を追跡 | 交換前後のconnection・端点・契約・artifact/dependency revision、compatibility receipt、operation/attemptと技術結果を追跡し、未完義務をhandoff/rollback/recovery receiptへ保つ |

**入力・出力・依存**：固定入力は登録接続、固定側機構と契約/artifact/dependency revision、交換側の旧新revision、変更scope、互換宣言、該当する未完operation/義務/期限/attempt、交換・復旧に適用される既存許可。出力は、固定側を変更しない交換後のcompatibility照合・送受信結果、または理由を記したreject/unknown/staleと未完義務を持つhandoff/rollback/recovery receipt。登録接続と両端互換宣言、HARNESS共通pack、該当するSECURITY許可を用い、別接続を要求しない。

**責務・戻し先**：固定側/交換側の意味契約差分は両端owner、adapter/transportの技術互換はadapter owner、許可範囲・失効・不足はSECURITYへ戻す。固定L2-006で宛先が明示された区分だけを使いownerを新設しない。失敗時は通信停止を維持し、停止位置・現在/旧revision・未完義務・既存recovery先を記録する。業務結果や交換承認をCONNECT receiptから生成しない。

**旧HELIXとの対応と差分**：旧L3工程定義`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168`のFR+ACとL10対の構造を保持し、旧G3 gateを現行L10へ持ち込まず三canonical対へ再導出する。直接の旧CONNECT/片側交換要件は指定した旧L3フォルダで確認できなかった（探索語・範囲と限界をsource-pinsに記録）。隣接資産`LEGACY-ASSET-7F8960532611D89D03E1`（Technology Environment Reconciliation）はversion drift、evidence、adapter隔離の類例だけを再導出し、外部tech inventory/upgrade lifecycleを追加しない。`LEGACY-ASSET-9B7682EBDEA171005D45`（distribution package release）は固定source/consumer分離・artifact identityの比較材料に限り、CONNECTの両端交換契約に読み替えない。旧の配布system testとTER acceptance、共通L3 test-designは正常/negative/oracleとtraceの形を参照するが、旧package release、環境更新、旧gate/CIの意味・値・実行を移さない。保持/再導出/置換の対応と各full/raw SHAはsource-pinsに記録する。

**受入条件（AC候補）**

- **CONNECT-AC-006-01 — 互換範囲内の一側交換**：4交換型を独立fixtureにし、各fixtureで登録済みconnection、変更側旧新revision、固定側機構・契約revision、scope、宣言互換条件を入力する。変更側を互換範囲内の新revisionへ交換し現在の両端契約を再照合した結果だけcompatibleとなり、同じconnection契約上の技術送受信ができる。各正常fixtureで変更側旧revision→交換後revision→同connection・scope・revision組に束縛したcurrent comparison receipt→connection/operation/attempt identity→技術結果を、一続きで順序づけられたtraceから辿れる。固定側のidentity/content/revisionを前後で変更せず、業務意味/承認/許可を生成しない。未完operationがない場合は存在しない未完義務を作らない。
- **CONNECT-AC-006-02 — 非互換・不明・stale fail-close**：各4交換型について、不一致revision、未登録revision、意味契約変更、unknown照合、stale照合receiptをそれぞれ独立に与える（4×5の独立fixture）。交換後の互換照合で不一致・unknown・staleを検出し得るが、すべて送信・再送attempt 0で、compatibleを推定せず、固定側revisionを書き換えず、交換側の適切な技術ownerまたは両端契約ownerへ該当failureを戻す。両側を同時変更するfixtureはunknown/rejectとし、compatibleや片側交換の成功にせず、片側交換のpass計数から除外する。
- **CONNECT-AC-006-03 — revision/未完義務continuity**：交換前に未完operationがあるfixtureで、旧revision→交換後revision→現在の互換照合receipt→connection/operation identity・attempt・技術結果を一続きのconnection traceで辿れるようにし、operation/ACK/attempt/expiry/義務を旧revisionと対応づけて交換後receipt/handoff/rollback/recoveryにも欠落なく保持する。旧新revisionの混載・旧receipt流用を拒否し、現在の互換照合と既存restart/recovery条件が確認される前は再開・retry・送信を0にする。停止位置と既存recovery先を明示する。
- **CONNECT-AC-006-04 — authority/owner境界**：交換/復旧に適用するSECURITY許可が存在し有効な正常fixtureと、許可missing/unknown/expired/scope不一致の各反例を区別する。後者はexchange/sendを開始せず保留し、SECURITYへ戻す。契約意味の差分は両端owner、adapter/transport互換failureはadapter ownerへ戻し、receiptだけで両者の業務成立や承認を生成しない。

### 旧assetの意味区分

| 旧asset | 今回の扱い |
|---|---|
| `LEGACY-ASSET-F542125805B777D8A56A`（旧L3 process definition） | FR+AC/paired verification形式を再利用。旧G3 gate・承認roleは現行へ再導出しない |
| `LEGACY-ASSET-7F8960532611D89D03E1`（Technology Environment Reconciliation L3） | 双側revision drift/evidence/adapter分離の隣接類例のみ意味を再導出。CONNECT交換要件の完全一致sourceではない |
| `LEGACY-ASSET-30FFE84409079C9B06D1`（同TER paired acceptance） | independent oracle/unknown/fail-closeの検証形式だけ再導出。外部provider lifecycleは対象外 |
| `LEGACY-ASSET-9B7682EBDEA171005D45`（distribution package L3） | 固定sourceとconsumer差分の隣接比較。artifact allowlist/release authorityを採用しない |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB`（distribution system test） | before/after、consumer境界、個別negativeの形式だけ再導出。配布/release/test実行を行わない |
| `LEGACY-ASSET-44DD86E3DEC09E65EF51`（shared pillar test design） | FR/AC/case trace形式の旧起点。旧case ID・HAT/L12機構を移植しない |


## Stage 4 — profile供給と方向・feedback relation（008/009、1.0草稿）

対象は固定revision `633bf12ea8f948db8ba3d6600179c4a9507377a7` の `HELIXCONNECT-L2-008`（登録002、L2:274–284、L11:87–93）と `HELIXCONNECT-L2-009`（登録002、L2:285–295、訂正L11:94–104）。L2 full SHA `94003c16183d96736994ee4d4d0483eb64a2db0eabca2ba20c5baebc8f86b7a1`、L11 full SHA `aa213f2a9fa766d4d7e1e00fa333559fd83254c2f045a187a1f12df4236b54b9`。PO `po-decision-2026-09-29-57candidates.md:15,94–95` の008配置A（供給CONNECT、安全SECURITY）、009案A（direction/order属性、feedback型付き戻り辺、操作別unknown停止）を保持する。既承認本文を更新せず追補した草稿で、実装・実送信・probe起動の許可ではない。

### CONNECT-FR-008-01 — profile catalogとtyped descriptor

入力は利用可能として宣言された登録profile identity/revision、同profile/revisionに束縛した設定契約と型、operation/tool capability descriptor、安全・read-only probe descriptor。出力は宣言を列挙したcatalogと型付きdescriptor、拒否またはunknownの理由・対象profile/revision・修正先である。必須の組の欠落、不明、競合、不一致を利用可能にせず、既定profileや互換推定で埋めない。登録契約revision変更はL2-002のstale再照合へ結び、再検証まで当該revisionを適格にしない。

CONNECTはdescriptorを供給し、probe・toolを起動せず、実安全性・資格・authorizationを判定しない。SECURITY-L2-005〜008の既存policy/authorityを代替せず、別親034の採択やpolicy oracleを008の成立条件にしない。descriptorはraw secret/credential値を含まず、業務上のprobe意味は元機構に残す。identity/config/descriptor不備はprofile提供元、policy/safety不明・拒否はSECURITYへ返す。失敗を対象profile/revisionへ束縛し、無関係なprofileの状態を変えない。具体schema、registry、provider/runtime、tool実行方式は本要件で確定しない。

- `CONNECT-AC-008-01`：登録済み同profile/revisionの設定型・operation/tool capability・安全/read-only descriptorの全組が列挙・供給される。未登録/未知profile、競合宣言、未登録revision、設定型不一致、descriptor欠落/型違い/束縛違いはusableにならず、対象と理由を残す。未見profileも同じ登録・型・束縛で照合し、名前から補完しない。
- `CONNECT-AC-008-02`：descriptorの存在・読出しからauthorization/policy/probe起動/tool実行/実安全性/実行資格を生成・代替せず、raw secret/credentialを含めない。安全判定はSECURITY、業務probe意味は元機構に残る。034の別policy oracleや採択を必須とせず、供給と実行を分離する。
- `CONNECT-AC-008-03`：契約revision変更後はstaleで再照合し、正しい新revision組だけ再検証する。不備はprofile提供元、policy/safety不明・拒否はSECURITYへ区別して返し、無関係なprofileは維持する。証拠なしはunknownでpassにしない。

**旧HELIX項目対応**：旧v1.3 HYB-002 `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:286`（asset `LEGACY-ASSET-02319C2481B9E01698D5`、full SHA `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）とbaseline `docs/governance/requirements-source/helix-requirements-v1.3-baseline-6fabd125.txt:271`（full SHA `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1`）のS01列挙/設定、S02typed safety/read-only供給、S04未登録拒否、各2revision計6atomを意味再導出する。旧同じ行のS03/S05/S06 credential/egress/tool capability安全判定はSECURITY側に残し、CONNECTへ移さない。旧source holding2件は保持しHYB-002全体のclosureを主張しない。旧固定runtime/schemaや実probe実行は置換し、今回の宣言descriptorと静的oracleへ分ける。変更理由は固定親の供給/安全owner分離と操作境界である。対consumerは同じ旧行のHR-AC-HYB-002の未登録拒否だけを008へ再導出し、secret要求/write可能probeの安全判定を供給の合格証拠に移さない。

### CONNECT-FR-009-01 — direction/order属性とtyped feedback edge

入力はL2-001の接続identity・方向・両端契約、L2-002のrevision照合、L2-005の因果traceであり、再送/loop時にL2-004の既存再送契約、構成体時にL2-007を照合する。適用しないloop/join/feedback条件を初回辺の必須入力にしない。各操作に必要なscope/authorityを既存契約で照合し、direction、必要時のserial/parallel属性、feedbackのsource connection/operation・target connection/owner・reasonまたは根拠参照・correlation/operation lineage・contract revision・停止/再開状態を返す。directionは既存identityの属性を明確化し、別の接続種や送信許可を作らない。

`one_way`は宣言一方向だけ。逆送信には独立した逆方向connection/directionとそのoperationの既存SECURITY scope/authorityが必要。`paired_bidirectional`は二方向を別識別し、両方向のendpoint contract/scope/operation-time authorityを個別照合する。登録・受信・ACK・feedback eventから逆方向許可を推論しない。

serialは宣言順と先行結果/契約条件を保持する。parallelは独立identity/scope/contract/operation/resultを持つ辺と宣言join条件で構成し、join全条件成立までcompositeを完了しない。順序・依存・join不足はunknown/unfinishedで、HARNESS/OSのworkflow/ticket計画を代替しない。feedbackは新たな一方向typed edgeであり、自由文だけでrelation成立・finding解決にしない。edge記録/伝送は受領・解決・承認・task完了を生成しない。

bounded loopはforward/feedback辺と既存ownerのretry/budget/stop policy参照・期限・終端routeを持つ。上限値を新設せず既存適用契約から読む。終了条件、policy、累積attempt、期限、operation identityの欠落/unknown/staleでは開始/継続せず、session交換で累積上限をresetしない。上限到達で既存ownerへ未完・理由・累積試行を返す。方向、辺順序、operation/attempt、revision、endpoint receipt、停止/終端は一つの因果traceで辿る。部分成功/ACKなし/互換stale/authority unknown/join不成立を全体成功にしない。CONNECTは送信/逆送信許可、業務解決、要求採択、ticket発行、budget policy、feedback内容判断を生成しない。traceにraw secret/credential/不要payloadを複製しない。

- `CONNECT-AC-009-01`：片方向は登録方向のみ。feedback未送信を保持し、逆送信は独立connectionと適用authority成立時だけ可能。双方向は二方向を個別確認する。初回送信のendpoint/connection identity/revision/authority不足は当該辺をeligibleにせずmissing inputと該当endpoint/contract/authority ownerを記録する。feedback reason/loop policy/join/ACK不足だけで独立適格な初回辺を止めない。
- `CONNECT-AC-009-02`：serialの宣言順・先行必要結果・契約条件を保持し、それぞれ未成立なら後続を実行しない。parallelの独立辺を個別追跡する。join不足はjoin/composite完了だけ保留し、適格な各辺を一括停止しない。順序/依存を推測せず該当構成体/contract ownerへ返す。
- `CONNECT-AC-009-03`：typed feedbackは全束縛を持ち、記録/伝送と受領/解決/承認/完了を区別する。reason/source/target/revision/独立逆connection/適用authority不足はfeedback送信だけ保留し未送信relation・missing input・該当ownerを記録する。初回送信不成立や解決済みに読み替えない。自由文をtyped relationやresolvedへ変換しない。
- `CONNECT-AC-009-04`：既存retry上限/budget/期限/termination policy/終端owner/累積attempt/operation identityを照合し、欠落・unknown・stale・conflictでは追加retryを行わず未解決で保留する。適格だった初回辺を遡って不成立にしない。session交換でresetせず上限到達時OS-040等の既存適用ownerへ未完・理由・累積attemptを返す。新上限・budget policy・解決条件を作らない。
- `CONNECT-AC-009-05`：ACK未着またはoperation/connection identity/revisionとの対応不足はattemptをACK待ちで保持し、受領/operation完了/composite完了を成立させずmissing inputと確認先ownerを記録する。因果traceの方向/辺順序/forward-feedback/attempt/revision/endpoint receipt/停止終端が追跡可能で、部分成功を全体成功にしない。技術eventから業務解決・要求採択・ticket発行・許可・budgetを生成せずraw secret/credential/不要payloadをtraceへ複製しない。
- `CONNECT-AC-009-06`：未見の同契約内辺・revision・topologyでも上記操作別oracleを適用する。契約不明や宣言外はunknown/unfinishedのまま該当ownerへ戻し外挿しない。端点・意味契約revision・adapter/transport revision・互換範囲の変更だけをL2-002:69のstale互換再照合へ戻す。authority変更はL2-002:71の操作時SECURITY適格性照合で扱う。順序/topology・feedback binding・termination policy変更はL2-009:290/292/294に従い、必要条件が不明な対象操作をunknown/unfinishedで該当ownerへ戻し旧receiptを流用しない。新revisionだけで旧未完や累積試行を消さない。

**旧HELIX項目対応**：CONNECT固有typed relationの旧一致定義はL2:295とcoverage receiptの限定検索では未発見。新規type構成はPO採択登録002を起点に再導出し、旧sourceの不在を承認と読み替えない。旧UWJ-FR-006 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:50`（asset `LEGACY-ASSET-5EE032D657C221184B00`）のreturn/continue/stop/上限/terminal/再開はloop形状の隣接比較、旧HIL-NFR-04 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:184`（asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`）の停止理由/checkpointは既存owner参照へ意味再導出する。旧MIC-R-02とflow `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/management-integration-cell-requirements.md:66,132`（asset `LEGACY-ASSET-23D3D9769B093AFDCC25`）のserial後base再照合は隣接failure形状だけを保持し、TL/DB/CI運用をCONNECTへ移さない。旧HIL-BR-25同L1:77の上下/左右pair双方向は層の関係であり、機構間方向・送信authorityの根拠に置換しない。各5旧lineはreference-onlyで直接candidate input0件。旧engineのUWJ-AC-006形状は新L11操作別oracleへ置換し、旧実行/合格を証拠にしない。検索限界はL3-requirements/governance-candidates/L1-requirementsの既存receipt範囲でありarchive全体の不在を主張しない。

**review01表記補足**：008のPO採択対象は登録002。現行register:1029の `MPR-RC-HELIXCONNECT-L2-008-003` は002のlocator訂正であり、意味/候補digestは同じ。現行holdingは `MPR-SH-SUPPLEMENTARY-004` と `MPR-SH-V13-BASELINE-001`、coverage receiptは `connect-v13-hyb-002-profile-supply-coverage-receipt-2026-09-29-r2.json` へ対応する。過去receiptの未採択metadataをPO採択状態へ継承しない。009のL2:290の宣言join条件は構成体のjoin成立・完了の条件として、PO:95と訂正L11:103に従い読む。join条件の欠落だけで各独立適格辺の送信を一括停止せず、join/composite完了だけ保留する。


## Stage 5 — 複数機構の接続完全性（007、1.0草稿）

対象は採択親`HELIXCONNECT-L2-007`のみ（`MPR-RC-HELIXCONNECT-L2-007-001`、semantic digest `44dac7757466d487bbfc30f3201b6c282c5ab72e3cb660ad528876ada555f75b`）。PO記録 `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md` が固定したrevision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2:128–138、L11:74–77と一覧38を正本とする。L2 full SHA `31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、L11 full SHA `bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。各現行本文のcandidate表記から採否を生成しない。Stage5配属は既存G0追補の007対応を用いる。これは要件・検証設計草稿で、送信・実装・承認・検証実行を許可しない。

### CONNECT-FR-007-01 — 全辺の技術終端と未完引継ぎ

入力は構成体の辺identity/順序/correlation/scope、各辺登録と現revision照合、端点operation mapping、expiry/idempotency/result state、適用SECURITY許可識別子とdata-use識別子（別々に辺へ束縛）および辺ごとのrecovery先。出力は各辺の送信結果・受信結果を個別に含む構成体trace、技術的終端state、停止時の未完辺/義務/owner/recovery handoffである。各辺の端点・契約revision・順序・operation lineage・SECURITY許可識別子・data-use識別子・送信結果・受信結果・再送境界・終端結果を構成体の追跡から辿る。全必須辺の個別登録・互換確認・終端までの受渡しが揃った場合だけ技術通信completeとする。単辺greenから残辺を推定せず、未実行・unknownを成功に丸めない。

中間辺のstale/失敗/部分成功/unknownでは停止位置、先行成功、未完辺、未完義務と既存owner/recoveryを保持する。未許可の後続send/retryを伝播せず、後続未実行を実行済みにしない。failureは当該connection owner、業務判断/再計画は元機構/OS等の既存ownerへ返す。CONNECTは業務成立・結果承認を判定せずSECURITY許可を発行しない。

依存は構成体を成す全辺の固定L2-001..005、HARNESS-L2-010/011の宣言I/O・依存版・統合検証範囲・構成更新/切戻し/未完義務、各ownerの意味契約と適用SECURITY条件である。既承認の001..005機能ACを辺ごとに参照して再定義しない。特定transport/GUI/provider/CI製品、共通latency/retry数、DB/schema、業務完了、Web後続機能を定めない。接続の具体的revision/期限/retryはowner契約の入力で、未知を候補上の確定値に補わない。意味・scope・owner・版変更が必要な場合だけL2へ戻す。

- `CONNECT-AC-007-01`：全宣言辺の入力と登録・現在互換receiptを個別に照合し、終端までのtraceが揃う場合だけ技術complete。13必須入力の単独欠落を推測で補わず未完とし、同契約内の未見機構/辺は適合なら拒否しない。
- `CONNECT-AC-007-02`：端点/契約revision/operation/correlation/scope/idempotency/SECURITY許可識別子/data-use識別子/送受信結果を辺ごとに束縛し、各一つだけの取り違えを拒否する。順序・再送境界・終端を一つのtraceへ結び、他辺のreceiptで補完しない。
- `CONNECT-AC-007-03`：固定L11の7中間failureとunknownを独立fixtureにする。全体成功を止め、先行成功と後続未実行を保持し、停止位置/未完辺/義務/owner/recoveryを個別に照合する。後続の未許可send/retryを発行せず既存ownerへ返す。
- `CONNECT-AC-007-04`：全辺技術completeから業務成立・結果承認・送信許可を生成しない。HARNESS010/011の共通pack境界を保ち、GUIの不在だけで契約適合fixtureを拒否しない。

**旧HELIX項目対応**：旧L3 process `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–168` と旧HARNESS L3 README `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:1–56` のFR+AC、3 sub-doc、paired oracle形式を保持し、旧L10 UX/L12層番号・gate/CLIを現行L3/L10の3対へ置換する。旧distribution L3 asset `LEGACY-ASSET-9B7682EBDEA171005D45` の24–83とpaired system test `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` の1–58はsource/consumerの分離、identity、正常/個別negative/証拠の隣接比較に限り、release/promotion/allowlistやremote権限を007に転用しない。直接のCONNECT007旧atomは既存receiptで0件であり、旧全資産の不在や網羅を意味しない。archive/docs全textの指定語「接続完全性」「connection completeness」「複数機構」「connection inventory」のWorker検索は直接L3/paired consumer未同定、複数機構は一般Concept分類1件のみで直接sourceにしない。固定L2/L11から接続完全性と失敗oracleを意味再導出し、旧の具体実装・値を置換する。変更理由はPO採択済みCONNECT責務と現行層への対応である。検索範囲・原文/SHA・未確認範囲は時点監査へ固定する。
