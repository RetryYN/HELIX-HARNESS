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
