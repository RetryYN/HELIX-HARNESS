# HELIX-CONNECT L10 総合検証（Stage 1・Stage 2a・Stage 4 部分草稿）

> 状態: L10総合検証設計の草稿・未実行。検証実施結果、CI合格、L3承認を表さない。旧HELIX test/runtime/CIは実行しない。既存Stage 1ではCONNECT-L2-001〜005の5件を対象とし、本追補はStage 2aのCONNECT-L2-006を追加する。

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
| `HELIXCONNECT-L2-006` | `CONNECT-FR-006-01` | `CONNECT-AC-006-01,02` | `CONNECT-CASE-006-01..05` | 1.0 |

## 句別被覆と責務分解（L3/AC/L10）

| 固定親 / L3 / AC / case | 入力 → 出力・保証 | 否定・境界oracle | 主担当 / 失敗時の戻し先 | 依存owner区分 | 版 |
|---|---|---|---|---|---|
| `HELIXCONNECT-L2-001` / `CONNECT-FR-001-01` / `CONNECT-AC-001-01` / `CONNECT-CASE-001-01` | endpoint/owner/direction/scope/contract・revisionを入力し、一意な登録identityを返す | 必須要素欠落、unknown、同一IDの矛盾宣言はusable不可。別IDのendpoint共有は許容 | CONNECTは登録結果。矛盾はsource/consumer endpoint ownerへ戻す | 業務意味=端点owner、authority=SECURITY、assignment=OS、fixture/証拠=HARNESS | 1.0 |
| `HELIXCONNECT-L2-002` / `CONNECT-FR-002-01` / `CONNECT-AC-002-01` / `CONNECT-CASE-002-01` | 現revision組・宣言互換範囲・read scope、送信時の既存許可を入力しcompatible/incompatible/unknown/staleと送信適格性を分離 | drift後のstale再照合なし、不一致/unknown、送信時の許可欠落でattempt 0 | 契約差はendpoint owner、送信authorityはSECURITY、staleはCONNECT operation ownerへ返す | 契約=両端owner、authority=SECURITY、assignment=OS、測定証拠=HARNESS | 1.0 |
| `HELIXCONNECT-L2-003` / `CONNECT-FR-003-01` / `CONNECT-AC-003-01` / `CONNECT-CASE-003-01` | connection/operation/contract revision/compatibility receiptに結ぶenvelopeを入力し、技術結果を返す | 未識別operation、contract外、revision違いを成功扱いしない | 契約差は両端owner、scopeはSECURITY、業務結果はreceiver business ownerへ返す | 契約=両端owner、authority=SECURITY、進行=OS、fixture=HARNESS | 1.0 |
| `HELIXCONNECT-L2-004` / `CONNECT-FR-004-01` / `CONNECT-AC-004-01` / `CONNECT-CASE-004-01` | retryable technical failure、同一ID/digest/revision、既存契約上限を入力しattempt/receiptとunfinishedを返す | 異digest、上限超過、business failure再送、新revision混載を拒否。重複効果0 | operation ownerへ未完義務/試行数、業務結果はbusiness owner、expiryはSECURITYへ | retry契約=connection owner、authority=SECURITY、実行=OS/CONNECT、証拠=HARNESS | 1.0 |
| `HELIXCONNECT-L2-005` / `CONNECT-FR-005-01` / `CONNECT-AC-005-01` / `CONNECT-CASE-005-01` | register/check/send/receipt/retry/stale/deny/terminal eventsを入力し順序traceと観測端点を返す | 欠落/順序曖昧/片端未観測はunknown、payload非保存だけでは失敗でない | trace欠落はoperation owner、data-use/authority不明はSECURITY/source ownerへ | event producer=接続端点、authority=SECURITY、状態=OS、証拠契約=HARNESS | 1.0 |
| `HELIXCONNECT-L2-006` / `CONNECT-FR-006-01` / `CONNECT-AC-006-01,02` / `CONNECT-CASE-006-01..05` | 一接続の4交換類型ごとに固定側revisionと互換条件、未完義務を受けて交換後の同一契約通信または停止/handoffを返す | 固定側を変える、非互換/未登録/意味契約変更/stale/unknownで送信する、再照合前retry、義務欠落を拒否 | 意味差=両端owner、技術互換=adapter owner、許可=SECURITY、未完義務=connection operation owner | 接続契約=両端owner、更新/未完=HARNESS-L2-010/011、authority=SECURITY、進行=OS、検証証拠=HARNESS | 1.0 |

## Case catalog
### CONNECT-CASE-001-01 — `001` / 登録Identity

- **対象AC**: `CONNECT-AC-001-01`
- **固定L11受入oracle**：登録identityと両端契約が一意に結び付き、不足・不明・同一接続identityの異なる宣言による重複・identity衝突は利用可能にならない。識別可能な別接続による端点共有は拒否しない
- **正常fixture**: 各connection identityは端点/owner/方向/scope/意味契約identityとrevision/adapter・transport revision/互換範囲/状態へ一意に結び付く。endpoint共有は異なるconnection identityなら許す。重複宣言/identity衝突/端点または契約の欠落・unknownをusableにしない。登録は業務承認・通信権限ではない。
- **negative/boundary oracle**：端点/意味契約欠落、unknown、同identityの異宣言、identity衝突を個別に与え、いずれもusableにならないこと。異なるidentityで端点を共有する正例は拒否しない。
- **責務・失敗時の戻し先**：接続候補と両端ownerが宣言した契約。通信、再送、他接続を必須にしない。 failure時は、欠落/衝突/unknownは登録を未成立にし、不足または矛盾した宣言を該当する接続元・consumer ownerへ戻す。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-002-01 — `002` / 互換性/stale

- **対象AC**: `CONNECT-AC-002-01`
- **固定L11受入oracle**：既存scope/access条件下で互換性を照合し、送信時のみ許可を確認。revision変更後はstaleを検知して再照合まで通信を止める
- **正常fixture**: 開始前および関連revision変更後の再利用前に実revision組を照合する。照合は既存read scope内で単独実施でき、送信許可を要しない。compatible/incompatible/unknown/staleと原因revisionを記録し、再照合で確認した組だけstale解除。send判定時だけ既存SECURITY authority/data-useを追加照合し、参照のみはnot_evaluated。
- **negative/boundary oracle**：revision変更後のstale状態、互換不一致/unknown、read access拒否を対照し、再照合前の送信と不一致組のstale解除を拒否する。reference-only結果からsend eligibilityを推定しない。送信時の期限切れ/失効/scope違いauthorityはattempt前に停止する。
- **責務・失敗時の戻し先**：L2-001の接続登録、端点ownerのversion/互換宣言。送信適格性を照合する操作では、該当するSECURITY authorityとdata-use条件を追加で参照する。通信実行を必須にしない。 failure時は、契約不一致は接続設計・契約ownerへ、読取りaccess条件はその既存owner/authorityへ、送信時の許可scope/expiry問題はHELIX-SECURITYへ戻す。比較不能はunknown/staleとして記録し、送信は保留する。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-003-01 — `003` / 契約に束縛した送受信

- **対象AC**: `CONNECT-AC-003-01`
- **固定L11受入oracle**：送受信が正しい接続identity・operation・契約revisionに束縛され、契約外入力を成功扱いしない
- **正常fixture**: 通信はconnection/operation/contract revision/互換receiptに束縛する。契約外入力・revision違い・未識別operationは成功でなく拒否または隔離。技術結果だけ返し業務完了を決めない。
- **negative/boundary oracle**：contract外envelope、異なる契約revision、operation identity欠落を投入し、正常受信/業務完了にしない。拒否または隔離理由と技術状態を記録する。
- **責務・失敗時の戻し先**：登録済み接続と現時点の互換照合、端点双方の受領契約。別の接続を必須にしない。 failure時は、契約・版問題は両端contract ownerへ、scope/許可問題はSECURITYへ、受領拒否・業務結果は受信側業務ownerへ返す。接続結果を業務完了へ昇格しない。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-004-01 — `004` / 制御再送

- **対象AC**: `CONNECT-AC-004-01`
- **固定L11受入oracle**：同一内容の再送は二重効果を生まず、異digest衝突・上限超過・再送不能結果は停止する
- **正常fixture**: 再送は技術的retryable failureに限定し、同一operation identity/content digest/単一contract revision、契約上限・可否を守る。同一ID+digestは二重効果なし、異digestは衝突拒否。business resultは再送せずownerへ返し、新revisionに自動移行しない。
- **negative/boundary oracle**：異digestの同一operation、契約上限を超えるattempt、再送不能business result、scope/expiry失効を投入して停止させる。同一identity+digestの再到着は二重効果を生まず、新revisionへ自動移行しない。
- **責務・失敗時の戻し先**：登録・互換照合・通信契約、受信側の同一identity重複排除契約。構成体や後続機構を必須にしない。 failure時は、digest衝突や再送上限到達は送信を停止し、connection operationのownerへ未完義務と試行数を返す。業務結果は元の業務ownerへ、許可期限切れはSECURITYへ戻す。新revisionへ自動混載再送しない。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-005-01 — `005` / 技術trace

- **対象AC**: `CONNECT-AC-005-01`
- **固定L11受入oracle**：送受信・再送・stale・部分失敗を接続単位に順序追跡できる
- **正常fixture**: 登録・照合・送信・受領・attempt/retry/stale/拒否/終端をconnection/operation/contract revision/attempt identityで順序追跡する。技術状態と端点観測範囲を区別し、欠落/順序不明はunknown。本文payload保存は必須でなく、業務判断を代筆しない。
- **negative/boundary oracle**：attempt/event欠落、順序逆転、終端receipt欠落、片端観測不能を投入し、traceをcomplete/business successとせずunknown/unfinishedとしてownerへ返す。payload非保存のみでは失敗にしない。
- **責務・失敗時の戻し先**：connection operation eventと共通ログ/証拠の契約。本文payload保存を必須にしない。 failure時は、traceの欠落/順序不明はoperationをunknownとしてconnection operation ownerへ返し、業務完了を止める。data-useや許可の不明はSECURITY/source ownerへ戻す。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-006-01..05 — `006` / 片側交換

- **固定親**: PO採択revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-connect/L2-requirements/connect-requirements.md` 115–125行、全文SHA-256 `31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b`、該当span SHA-256 `f5e21133232013d16d0306fd333c1c2e216c0163e3570f746242fd636b295db7`。対L11 `docs/helix-connect/L11-acceptance/connect-acceptance.md` line 37 summary SHA-256 `5bd8bae5f18be3e5b9e7e9539efc559220c816f69022093df5751a71b515f70c`、line 70 individual procedure SHA-256 `5781868b7fb4f5b885b8c4ef52fe3fa4c62dc8656232a3159b07abb227c790a7`、全文SHA-256 `bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad`。
- **対応AC**: `CONNECT-AC-006-01`, `CONNECT-AC-006-02`。以下の4正常fixtureは独立実施し、negative matrixは各交換類型に交差適用する。

#### 交換類型ごとの正常fixture

- **CONNECT-CASE-006-01**（AC `CONNECT-AC-006-01`）: 送信側機構本体だけを交換する。送信側adapter/transport、受信側機構と契約、登録接続、HARNESS共有pack契約を交換前後revisionとして区別し、未完operation/ACK/attempt/期限/義務を入力する。**期待oracle**: 固定側機構・契約/artifact/dependency revisionが交換前後で一致し、新revisionが宣言範囲内とcurrent照合で確認された後のみ同一接続契約上の送受信が成立する。旧新revisionを混在せず未完義務をhandoffできる。
- **CONNECT-CASE-006-02**（AC `CONNECT-AC-006-01`）: 送信側adapter/transportだけを交換し、送信側機構本体とその契約および受信側を固定する。**期待oracle**: 固定側不変を保ち、adapter/transport変更後の端点契約と接続契約を個別再照合し、互換確認後だけ送受信する。
- **CONNECT-CASE-006-03**（AC `CONNECT-AC-006-01`）: 受信側機構本体だけを交換し、受信側adapter/transportと送信側を固定する。**期待oracle**: 固定側不変を保ち、受信側新revisionの契約を確認して同一接続契約で送受信する。
- **CONNECT-CASE-006-04**（AC `CONNECT-AC-006-01`）: 受信側adapter/transportだけを交換し、受信側機構本体とその契約および送信側を固定する。**期待oracle**: 固定側不変を保ち、adapter/transport変更後の互換照合結果と送受信を同一接続identityにtraceする。

各正常fixtureで、revision・互換照合・通信結果・handoff receiptを一続きの証拠から辿る。再照合と再開条件が成立するまではretryを0とし、継続時にも元operation identityと未完ACK/attempt/期限/義務を保つ。検証は宣言/receipt fixture内で行い、外部端点への送信、prototypeや実機の用意を要求しない。

#### 否定・未見の組合せ

- **CONNECT-CASE-006-05**（AC `CONNECT-AC-006-02`）: 前記4交換類型の各々に対し、(a)非互換revision、(b)未登録revision、(c)意味契約変更、(d)stale、(e)unknownの照合結果を個別に投入する。4類型×5境界の全20 fixtureで通信attempt 0、固定側revision/契約/artifact/dependency不変、未完義務とrecovery先を保持する。staleとunknownを別条件としてcompatibleと読み替えず、両側更新による成功へ置換しない。authority/scope不明はSECURITYへ、意味差分は両端ownerへ、技術互換差分はadapter ownerへ返す。20 fixtureはL11の列挙境界に対応する候補測定集合であり、新PO gateではない。

| 固定親 | L3/AC/case | 観測する状態・動作 |
|---|---|---|
| `HELIXCONNECT-L2-006` 入力/依存 | `CONNECT-FR-006-01 / CONNECT-AC-006-01,02 / CONNECT-CASE-006-01..05` | 登録接続、固定側/交換側revision、scope、互換宣言、未完operation/ACK/attempt/期限/義務、HARNESS-L2-010/011、該当SECURITY許可 |
| `HELIXCONNECT-L2-006` 互換時保証 | `CONNECT-FR-006-01 / CONNECT-AC-006-01 / CONNECT-CASE-006-01..04` | 4種類を個別に交換し、固定側不変、互換内のcurrent照合後のみ同一契約送信、前後revision/evidence trace |
| `HELIXCONNECT-L2-006` 否定/戻し先 | `CONNECT-FR-006-01 / CONNECT-AC-006-02 / CONNECT-CASE-006-05` | 4類型×5個別invalidationの20 fixtureで通信attempt 0、handoff/recovery ownerと残workを保持 |
| `HELIXCONNECT-L2-006` 再開境界 | `CONNECT-FR-006-01 / CONNECT-AC-006-01,02 / CONNECT-CASE-006-01..05` | 再照合/再開条件前retry 0、旧新revision混在0、未完義務の欠落0 |

- **証拠**: fixture revision tuple、fixed-side before/after fingerprint、compatibility receipt、attempt/event順序、未完義務とowner別handoff。payload保存・実通信は要求しない。


## 横断シナリオと総合判定

1. **revision drift → dispatch**: `CONNECT-AC-001-01`登録後、端点または契約revisionを変更する。`CONNECT-AC-002-01`がstaleを検出し、新しい互換照合前に`CONNECT-AC-003-01`の送信を止める。通信許可と業務完了は生成しない。
2. **retry → evidence**: `CONNECT-AC-004-01`で同一operation/digestの技術retryと異digest衝突を用意し、`CONNECT-AC-005-01`のordered traceから二重効果なし、停止、未完ownerを復元する。
3. **unknown authority**: compatibilityがcompatibleでもSECURITY authority/data-useがunknown/expiredなら、送信eligibilityはwithheldでattemptなし。compatibility oracleをauthority oracleに流用しない。

4. **one-side replacement → handoff**: `CONNECT-CASE-006-01..04`を独立に行い、各々で固定側revision不変、互換照合後の同一契約通信、未完義務のhandoffを確認する。`CONNECT-CASE-006-05`は各交換類型に非互換/未登録/意味契約変更/stale/unknownを個別に交差適用し、計20 fixtureすべてで送信attempt 0を確認する。

総合passはStage 1の5件とStage 2a L2-006の2件を合わせた7個のL3 AC候補が個別に成立し、横断シナリオでrevision/authority/retry/trace/片側交換の連鎖が保たれること。任意項目の未観測、業務ownerの結果、未実施の旧デグレ検証をpassとして補完しない。

## Stage 4 — CONNECT-L2-008/009 L10 oracle

固定L2/L11は633bf12の採択revision。probeやfeedbackのfixtureは静的な受入設計であり、実際のMCP接続・送信を行わない。

### HELIXCONNECT-L2-008（CONNECT-FR-008-01）

- CONNECT-CASE-008-01（AC CONNECT-AC-008-01）: catalog列挙の複数profileから一件を選び、profile/config identity・revision・type、descriptor schema/version、typed capability、read-only probe descriptorを全てsource付きで与える。relationを再構成でき、operation spawnは0。他profileの入力/結果は不変。
- CONNECT-CASE-008-02（AC CONNECT-AC-008-02）: 各列挙fieldを単独でmissing/stale/mismatch、configとdescriptorの型不一致、同一identityの異なる宣言、catalog未登録revisionに変異する。該当profileだけtarget未確定/unknown/staleとなり、古いcompatibleへfallbackしない。
- CONNECT-CASE-008-03（AC CONNECT-AC-008-03）: descriptorあり・permissionなし、安全判定なし・実行可能と主張する反例。executable/safe/send eligibilityをfalseまたはunknownに留め、SECURITYへauthority照合を戻す。
- CONNECT-CASE-008-04（AC CONNECT-AC-008-04）: raw secretをconfig/descriptorに含める反例を与え、拒否・値の非出力を確認する。同時に独立profileの正常descriptorが通ることを確認。

### HELIXCONNECT-L2-009（CONNECT-FR-009-01）

- CONNECT-CASE-009-01（AC CONNECT-AC-009-01）: one-wayとpaired-bidirectionalを別々に与え、各方向のauthority/edgeを検査する。未送信reverse edgeを送信済みと偽る変異は拒否。serialでは先行結果前の後続edgeを止め、parallelではrequired input/terminal edgeを一つずつ欠落させjoin resultをholdし、全条件がある正常fixtureだけjoinを出す。
- CONNECT-CASE-009-02（AC CONNECT-AC-009-02）: eligible first edge＋未送信feedback、ACK未着、feedback endpoint/reason/contract unknownを独立変異する。第一edgeはfeedback欠落で止めず、ACK未着ではattemptを保ったまま受領/完了だけholdし、loop条件欠落は追加retryだけ0となる。
- CONNECT-CASE-009-03（AC CONNECT-AC-009-03）: retry/budget/deadline/terminal-owner/policyのmissing/staleを各個別に与える。追加attempt 0、既存attempt数保持、初回eligibility不変、owner別backflowをoracleとする。
- CONNECT-CASE-009-04（AC CONNECT-AC-009-04）: 2反復目でattempt countをresetする反例、budget境界超過、deadline expiry、terminal owner不明を分ける。累積attemptは単調に保持し、deadline/terminal確定まで新規retryを止め、停止理由と未完義務を残す。

全caseの観測はdescriptor/relation tuple、revision、attempt count、authority stateである。期待oracleは送信権限ではなく、relation completenessとfail-closed処理である。
