# HELIX-CONNECT L10 総合検証（Stage 1 草稿）

> 状態: L10総合検証設計の草稿。検証実施結果、CI合格、L3承認を表さない。旧HELIX test/runtime/CIは実行しない。本書はG1 Stage 1の33件全体ではなく、CONNECT-L2-001〜005の5件を対象とする。

## 判定規約

各caseは下記L3 AC IDと一対一で対応する。検証入力は固定revisionの宣言/receipt/test fixtureから組み立て、外部送信や実環境副作用を要求しない。実行時はHARNESSがtest scope、証拠、依存version、停止/再開を扱い、OS/SECURITYがそれぞれのstate/authorityを保有する。未観測はpassでなくunknown。全体の合否を一つのtransport successに還元しない。

## 親要件とL3/L10対応表

| 固定L2 identity | L3 FR | L3 AC | L10 case | 版 |
|---|---|---|---|---|
| `HELIXCONNECT-L2-001` | `CONNECT-FR-001-01` | `CONNECT-AC-001-01` | `CONNECT-CASE-001-01` | 1.0 |
| `HELIXCONNECT-L2-002` | `CONNECT-FR-002-01` | `CONNECT-AC-002-01` | `CONNECT-CASE-002-01` | 1.0 |
| `HELIXCONNECT-L2-003` | `CONNECT-FR-003-01` | `CONNECT-AC-003-01` | `CONNECT-CASE-003-01` | 1.0 |
| `HELIXCONNECT-L2-004` | `CONNECT-FR-004-01` | `CONNECT-AC-004-01` | `CONNECT-CASE-004-01` | 1.0 |
| `HELIXCONNECT-L2-005` | `CONNECT-FR-005-01` | `CONNECT-AC-005-01` | `CONNECT-CASE-005-01` | 1.0 |

## Case catalog
### CONNECT-CASE-001-01 — `001` / 登録Identity

- **対象AC**: `CONNECT-AC-001-01`
- **固定L11受入oracle**：登録identityと両端契約が一意に結び付き、不足・不明・同一接続identityの異なる宣言による重複・identity衝突は利用可能にならない。識別可能な別接続による端点共有は拒否しない
- **正常fixture**: 各connection identityは端点/owner/方向/scope/意味契約identityとrevision/adapter・transport revision/互換範囲/状態へ一意に結び付く。endpoint共有は異なるconnection identityなら許す。重複宣言/identity衝突/端点または契約の欠落・unknownをusableにしない。登録は業務承認・通信権限ではない。
- **negative/boundary oracle**：端点/意味契約欠落、unknown、同identityの異宣言、identity衝突を個別に与え、いずれもusableにならないこと。異なるidentityで端点を共有する正例は拒否しない。
- **責務・failure return**：接続候補と両端ownerが宣言した契約。通信、再送、他接続を必須にしない。 failure時は、欠落/衝突/unknownは登録を未成立にし、不足または矛盾した宣言を該当する接続元・consumer ownerへ戻す。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-002-01 — `002` / 互換性/stale

- **対象AC**: `CONNECT-AC-002-01`
- **固定L11受入oracle**：既存scope/access条件下で互換性を照合し、送信時のみ許可を確認。revision変更後はstaleを検知して再照合まで通信を止める
- **正常fixture**: 開始前および関連revision変更後の再利用前に実revision組を照合する。照合は既存read scope内で単独実施でき、送信許可を要しない。compatible/incompatible/unknown/staleと原因revisionを記録し、再照合で確認した組だけstale解除。send判定時だけ既存SECURITY authority/data-useを追加照合し、参照のみはnot_evaluated。
- **negative/boundary oracle**：revision変更後のstale状態、互換不一致/unknown、read access拒否を対照し、再照合前の送信と不一致組のstale解除を拒否する。reference-only結果からsend eligibilityを推定しない。送信時の期限切れ/失効/scope違いauthorityはattempt前に停止する。
- **責務・failure return**：L2-001の接続登録、端点ownerのversion/互換宣言。送信適格性を照合する操作では、該当するSECURITY authorityとdata-use条件を追加で参照する。通信実行を必須にしない。 failure時は、契約不一致は接続設計・契約ownerへ、読取りaccess条件はその既存owner/authorityへ、送信時の許可scope/expiry問題はHELIX-SECURITYへ戻す。比較不能はunknown/staleとして記録し、送信は保留する。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-003-01 — `003` / 契約に束縛した送受信

- **対象AC**: `CONNECT-AC-003-01`
- **固定L11受入oracle**：送受信が正しい接続identity・operation・契約revisionに束縛され、契約外入力を成功扱いしない
- **正常fixture**: 通信はconnection/operation/contract revision/互換receiptに束縛する。契約外入力・revision違い・未識別operationは成功でなく拒否または隔離。技術結果だけ返し業務完了を決めない。
- **negative/boundary oracle**：contract外envelope、異なる契約revision、operation identity欠落を投入し、正常受信/業務完了にしない。拒否または隔離理由と技術状態を記録する。
- **責務・failure return**：登録済み接続と現時点の互換照合、端点双方の受領契約。別の接続を必須にしない。 failure時は、契約・版問題は両端contract ownerへ、scope/許可問題はSECURITYへ、受領拒否・業務結果は受信側業務ownerへ返す。接続結果を業務完了へ昇格しない。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-004-01 — `004` / 制御再送

- **対象AC**: `CONNECT-AC-004-01`
- **固定L11受入oracle**：同一内容の再送は二重効果を生まず、異digest衝突・上限超過・再送不能結果は停止する
- **正常fixture**: 再送は技術的retryable failureに限定し、同一operation identity/content digest/単一contract revision、契約上限・可否を守る。同一ID+digestは二重効果なし、異digestは衝突拒否。business resultは再送せずownerへ返し、新revisionに自動移行しない。
- **negative/boundary oracle**：異digestの同一operation、契約上限を超えるattempt、再送不能business result、scope/expiry失効を投入して停止させる。同一identity+digestの再到着は二重効果を生まず、新revisionへ自動移行しない。
- **責務・failure return**：登録・互換照合・通信契約、受信側の同一identity重複排除契約。構成体や後続機構を必須にしない。 failure時は、digest衝突や再送上限到達は送信を停止し、connection operationのownerへ未完義務と試行数を返す。業務結果は元の業務ownerへ、許可期限切れはSECURITYへ戻す。新revisionへ自動混載再送しない。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-005-01 — `005` / 技術trace

- **対象AC**: `CONNECT-AC-005-01`
- **固定L11受入oracle**：送受信・再送・stale・部分失敗を接続単位に順序追跡できる
- **正常fixture**: 登録・照合・送信・受領・attempt/retry/stale/拒否/終端をconnection/operation/contract revision/attempt identityで順序追跡する。技術状態と端点観測範囲を区別し、欠落/順序不明はunknown。本文payload保存は必須でなく、業務判断を代筆しない。
- **negative/boundary oracle**：attempt/event欠落、順序逆転、終端receipt欠落、片端観測不能を投入し、traceをcomplete/business successとせずunknown/unfinishedとしてownerへ返す。payload非保存のみでは失敗にしない。
- **責務・failure return**：connection operation eventと共通ログ/証拠の契約。本文payload保存を必須にしない。 failure時は、traceの欠落/順序不明はoperationをunknownとしてconnection operation ownerへ返し、業務完了を止める。data-useや許可の不明はSECURITY/source ownerへ戻す。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。


## 横断シナリオと総合判定

1. **revision drift → dispatch**: `CONNECT-AC-001-01`登録後、端点または契約revisionを変更する。`CONNECT-AC-002-01`がstaleを検出し、新しい互換照合前に`CONNECT-AC-003-01`の送信を止める。通信許可と業務完了は生成しない。
2. **retry → evidence**: `CONNECT-AC-004-01`で同一operation/digestの技術retryと異digest衝突を用意し、`CONNECT-AC-005-01`のordered traceから二重効果なし、停止、未完ownerを復元する。
3. **unknown authority**: compatibilityがcompatibleでもSECURITY authority/data-useがunknown/expiredなら、送信eligibilityはwithheldでattemptなし。compatibility oracleをauthority oracleに流用しない。

総合passは全5 ACが個別に成立し、横断シナリオでrevision/authority/retry/traceの連鎖が保たれること。任意項目の未観測、業務ownerの結果、未実施の旧デグレ検証をpassとして補完しない。
