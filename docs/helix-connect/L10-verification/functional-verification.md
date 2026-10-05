# HELIX-CONNECT L10 総合検証（Stage 1）

> 状態: 総合検証設計の草稿・未実行。対象は1.0採択親001〜005の5件。検証結果、CI合格、L3承認を表さない。旧runtime/test/CIは実行しない。

## 判定規約

各caseは下記の該当L3 AC IDを一つ以上明示して対応する。複数caseが一つのACを異なる正常・反例境界から検証する場合も、対応表とcase見出しで追跡できるようにする。共通FRの受入条件が個別ACを補う場合は、その規則と固定L11句（L11-001行44、L11-003行56）を対応表・当該caseから追跡する。検証入力は固定revisionの宣言/receipt/test fixtureから組み立て、外部送信や実環境副作用を要求しない。実行時はHARNESSがtest scope、証拠、依存version、停止/再開を扱い、OS/SECURITYがそれぞれのstate/authorityを保有する。未観測はpassでなくunknown。全体の合否を一つのtransport successに還元しない。

各caseの正常fixtureはL3「固定親の入出力と共通束縛」の同じ親行を含む。入力・出力と適用識別子を一つずつ欠落・不一致にした反例を同case内で測り、別field・別接続・既定値で補わない。登録・参照操作は送信許可を生成せず、送信適格性照合を行う操作だけ既存許可とdata-use条件を照合する。

## 親要件とL3/L10対応表

| 固定L2 identity | L3 FR | L3 AC | L10 case | 版 |
|---|---|---|---|---|
| `HELIXCONNECT-L2-001` | `CONNECT-FR-001-01` | `CONNECT-AC-001-01` | `CONNECT-CASE-001-01` | 1.0 |
| `HELIXCONNECT-L2-002` | `CONNECT-FR-002-01` | `CONNECT-AC-002-01` | `CONNECT-CASE-002-01` | 1.0 |
| `HELIXCONNECT-L2-003` | `CONNECT-FR-003-01` | `CONNECT-AC-003-01` | `CONNECT-CASE-003-01` | 1.0 |
| `HELIXCONNECT-L2-004` | `CONNECT-FR-004-01` | `CONNECT-AC-004-01` | `CONNECT-CASE-004-01` | 1.0 |
| `HELIXCONNECT-L2-005` | `CONNECT-FR-005-01` | `CONNECT-AC-005-01` | `CONNECT-CASE-005-01` | 1.0 |

## 句別被覆と責務分解（L3/AC/L10）

| 固定親 / L3 / AC / case | 入力 → 出力・保証 | 否定・境界oracle | 主担当 / 失敗時の戻し先 | 依存owner区分 | 版 |
|---|---|---|---|---|---|
| `HELIXCONNECT-L2-001` / `CONNECT-FR-001-01` / `CONNECT-AC-001-01` / `CONNECT-CASE-001-01` | endpoint/owner/direction/scope/contract・revisionを入力し、一意な登録identityを返す | 必須要素欠落、unknown、同一IDの矛盾宣言はusable不可。別IDのendpoint共有は許容 | CONNECTは登録結果。矛盾はsource/consumer endpoint ownerへ戻す | 業務意味=端点owner、authority=SECURITY、assignment=OS、fixture/証拠=HARNESS | 1.0 |
| `HELIXCONNECT-L2-002` / `CONNECT-FR-002-01` / `CONNECT-AC-002-01` / `CONNECT-CASE-002-01` | 現revision組・宣言互換範囲・read scope、送信時の既存許可を入力しcompatible/incompatible/unknown/staleと送信適格性を分離 | drift後のstale再照合なし、不一致/unknown、送信時の許可欠落でattempt 0 | 契約不一致は接続設計/契約owner、比較不能はunknown/stale記録・送信保留（固定L2に専用戻し先の明記なし）、読取りaccessは既存owner/authority、送信許可差はSECURITYへ返す | 契約=両端owner、authority=SECURITY、assignment=OS、測定証拠=HARNESS | 1.0 |
| `HELIXCONNECT-L2-003` / `CONNECT-FR-003-01` / `CONNECT-AC-003-01` / `CONNECT-CASE-003-01` | connection/operation/contract revision/compatibility receiptに結ぶenvelopeを入力し、技術結果を返す | 未識別operation、contract外、revision違いを成功扱いしない | 契約差は両端owner、scopeはSECURITY、業務結果はreceiver business ownerへ返す | 契約=両端owner、authority=SECURITY、進行=OS、fixture=HARNESS | 1.0 |
| `HELIXCONNECT-L2-004` / `CONNECT-FR-004-01` / `CONNECT-AC-004-01` / `CONNECT-CASE-004-01` | retryable technical failure、同一ID/digest/revision、既存契約上限を入力しattempt/receiptとunfinishedを返す | 異digest、上限超過、business failure再送、新revision混載を拒否。重複効果0 | operation ownerへ未完義務/試行数、業務結果はbusiness owner、expiryはSECURITYへ | retry契約=connection owner、authority=SECURITY、実行=OS/CONNECT、証拠=HARNESS | 1.0 |
| `HELIXCONNECT-L2-005` / `CONNECT-FR-005-01` / `CONNECT-AC-005-01` / `CONNECT-CASE-005-01` | register/check/send/receipt/retry/stale/deny/terminal eventsを入力し順序traceと観測端点を返す | 欠落/順序曖昧/片端未観測はunknown、通常trace/receiptへraw業務payload・secret・credentialを保存/複製する各反例は不合格 | trace欠落はoperation owner、data-use/authority不明はSECURITY/source ownerへ | event producer=接続端点、authority=SECURITY、状態=OS、証拠契約=HARNESS | 1.0 |

## Case catalog
### CONNECT-CASE-001-01 — `001` / 登録Identity

- **対象AC**: `CONNECT-AC-001-01`
- **固定L11受入oracle**：登録identityと両端契約が一意に結び付き、不足・不明・同一接続identityの異なる宣言による重複・identity衝突は利用可能にならない。識別可能な別接続による端点共有は拒否しない
- **正常fixture**: 各connection identityは端点/owner/方向/scope/意味契約identityとrevision/adapter・transport revision/互換範囲/状態へ一意に結び付く。endpoint共有は異なるconnection identityなら許す。重複宣言/identity衝突/端点または契約の欠落・unknownをusableにしない。登録は業務承認・通信権限ではない。
- **negative/boundary oracle**：端点/意味契約欠落、unknown、同identityの異宣言、identity衝突を個別に与え、いずれもusableにならないこと。異なるidentityで端点を共有する正例は拒否しない。能力名、契約/成果物/依存版、scope、correlation ID、期限、冪等キー、result stateの各必須値欠落と未登録revisionを個別fixtureにし、usableや別identity/既定登録へのfallbackを拒否、業務承認/SECURITY許可を生成しない。未見の別接続descriptorも同契約で照合する。
- **責務・失敗時の戻し先**：接続候補と両端ownerが宣言した契約。通信、再送、他接続を必須にしない。 failure時は、欠落/衝突/unknownは登録を未成立にし、不足または矛盾した宣言を該当する接続元・consumer ownerへ戻す。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-002-01 — `002` / 互換性/stale

- **対象AC**: `CONNECT-AC-002-01`
- **固定L11受入oracle**：既存scope/access条件下で互換性を照合し、送信時のみ許可を確認。revision変更後はstaleを検知して再照合まで通信を止める
- **正常fixture**: 開始前および関連revision変更後の再利用前に実revision組を照合する。照合は既存read scope内で単独実施でき、送信許可を要しない。登録時と使用時のrevisionを区別して記録し、compatible/incompatible/unknown/staleと原因revisionを記録し、再照合で確認した組だけstale解除。send判定時だけ既存SECURITY authority/data-useを追加照合し、参照のみはnot_evaluated。
- **negative/boundary oracle**：端点、意味契約revision、adapter/transport revision、互換範囲を一つずつ変えた4種類のstale fixture、互換不一致/unknown、read access拒否を対照し、登録時と使用時のrevision記録を別々に照合する。片方の記録欠落・取り違えは不合格とし、再照合前の送信と不一致組のstale解除を拒否する。特に有効な送信許可があっても互換結果がunknown/incompatible/staleなら送信適格性はwithheld、attempt 0とし、authorityで互換判定を上書きしない。reference-only結果からsend eligibilityを推定しない。送信時のactor/target/operation/revision/environment/scope/expiryとdata-useを各欠落/不明/不一致へ個別変異し、compatibleを保持したwithheld・attempt 0を照合する。read access欠落/拒否/unknownは比較unknown、未見の宣言範囲内revision組は参照照合可能、宣言外/未登録組はunknown、送信実行用許可は参照照合の前提にしない。
- **責務・失敗時の戻し先**：L2-001の接続登録、端点ownerのversion/互換宣言。送信適格性を照合する操作では、該当するSECURITY authorityとdata-use条件を追加で参照する。通信実行を必須にしない。 failure時は、契約不一致は接続設計・契約ownerへ、読取りaccess条件はその既存owner/authorityへ、送信時の許可scope/expiry問題はHELIX-SECURITYへ戻す。比較不能はunknown/staleとして記録し、送信は保留する。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-003-01 — `003` / 契約に束縛した送受信

- **対象AC**: `CONNECT-AC-003-01`
- **固定L11受入oracle**：送受信が正しい接続identity・operation・契約revisionに束縛され、契約外入力を成功扱いしない
- **正常fixture**: 同じoperation identityが両端記録に現れることを照合する。未完義務があるfixtureでは共通recovery先へのhandoff情報を返す。通信はconnection/operation/contract revision/互換receiptに束縛する。契約外入力・revision違い・未識別operationは成功でなく拒否または隔離。技術結果だけ返し業務完了を決めない。
- **negative/boundary oracle**：両端operation identity不一致、片端記録欠落、未完義務に対するhandoff欠落を個別に与え、成功へ丸めない。contract外envelope、異なる契約revision、operation identity欠落を投入し、正常受信/業務完了にしない。能力名、契約/成果物/依存版、target scope、correlation ID、期限、idempotency key、result stateをそれぞれ欠落/不一致へ変異し、正常受信にしない。別接続identityを混載する反例を拒否し、適用する許可の期限切れ・期限不明、許可/operation/target/environment/scope/data-use不明・範囲外は送信attempt 0。対象接続・拒否/隔離理由・観測地点・技術状態を保持し、契約/版の両端owner、SECURITY、受信側業務ownerへの戻し先を区別する。未見の適合envelopeでも同じ契約を照合する。
- **責務・失敗時の戻し先**：登録済み接続と現時点の互換照合、端点双方の受領契約。別の接続を必須にしない。 failure時は、契約・版問題は両端contract ownerへ、scope/許可問題はSECURITYへ、受領拒否・業務結果は受信側業務ownerへ返す。接続結果を業務完了へ昇格しない。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-004-01 — `004` / 制御再送

- **対象AC**: `CONNECT-AC-004-01`
- **固定L11受入oracle**：同一内容の再送は二重効果を生まず、異digest衝突・上限超過・再送不能結果は停止する
- **正常fixture**: 応答欠落と、接続契約上再送可能と宣言された別の技術的失敗を独立に与え、各々で同一logical operation identity/content digest/単一contract revisionを設定済み上限内で再送する。同じidentity+digestの再到着は二重効果なし。応答欠落だけをretry契機にしない。retry可否はその失敗の契約上の分類で決め、応答欠落そのものを全失敗のretry許可と読み替えない。同一operation identityで内容digestだけが異なる入力は衝突として拒否し、受信側の効果を増やさない。business resultや接続契約上retry不可に分類される失敗は再送せずownerへ返す。新revisionへ自動移行しない。
- **negative/boundary oracle**：異digestの同一operation、契約上限を超えるattempt、再送不能business result、scope/expiry失効を投入して停止させる。別々のfailure入力でretry分類をmissingとunknownに変異し、どちらもretryableと推測せず追加attempt 0、classification unknown、connection operation ownerへの戻しを期待する。retryableとされた技術失敗は契約上限内の再送対象とし、business resultおよび接続契約上retry不可に分類される失敗は再送しない。同一identity+digestの再到着は二重効果を生まず、新revisionへ自動移行しない。
- **責務・失敗時の戻し先**：登録・互換照合・通信契約、受信側の同一identity重複排除契約。構成体や後続機構を必須にしない。 failure時は、digest衝突や再送上限到達は送信を停止し、connection operationのownerへ未完義務と試行数を返す。業務結果は元の業務ownerへ、許可期限切れはSECURITYへ戻す。新revisionへ自動混載再送しない。
- **上限到達の戻し先oracle**: 追加attempt 0、未完義務・累積試行数はconnection operation ownerへ、未完の業務結果は元の業務ownerへ返ることをowner別の返却結果として照合する。片方の返却だけで両ownerへの引継ぎ完了にしない。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。

### CONNECT-CASE-005-01 — `005` / 技術trace

- **対象AC**: `CONNECT-AC-005-01`
- **固定L11受入oracle**：L3 `CONNECT-AC-005-01` の全状況と全証拠項目を個別照合する。成功・失敗・部分成功・同identity同digest重複・異digest衝突・unknownを区別し、raw業務payload・secret・credential値を通常trace/receiptへ保存・複製しない。
- **正常fixture**: 記録済みeventを不変に保持して新event・訂正eventを追記し、source ownerのdata-use区分識別子を保つ。登録・照合・送信・受領・attempt/retry/stale/交換/切戻し/拒否/終端をconnection/operation/contract revision/attempt identityで順序追跡する。技術状態と端点観測範囲を区別し、欠落/順序不明はunknown。通常trace/receiptへraw業務payload・secret・credential値を保存・複製せず、業務判断を代筆しない。
- **negative/boundary oracle**：記録済みeventの上書き、削除、順序差替えを個別に与え、いずれも不合格とする。訂正eventの追記は元eventを不変に保つ正常例として照合する。交換/切戻しeventの各追跡、source ownerのdata-use区分識別子保持を照合し、event欠落・識別子欠落/置換は不合格。attempt/event欠落、順序逆転、終端receipt欠落、片端観測不能を投入し、traceをcomplete/business successとせずunknown/unfinishedとしてownerへ返す。受信確認失敗、再送途中stale、期限切れ、取消、許可失効をそれぞれ独立変異し、停止地点・未完義務・owner/recovery先と観測済端点結果を保持する。ACの各証拠項目を一つずつ欠落させ、completeへ丸めない。同identity同digestの重複と異digest衝突は異なる結果として観測する。合成markerのみのraw業務payload・secret・credentialの各保存反例は、値を証拠出力せず不合格とする。未見のevent並びでも同じ証拠・非保存条件を照合する。
- **責務・失敗時の戻し先**：connection operation eventと共通ログ/証拠の契約。通常trace/receiptへraw業務payload・secret・credential値を保存・複製しない。必要な本文保持は元source/consumer ownerとSECURITYの契約を参照する。 failure時は、traceの欠落/順序不明はoperationをunknownとしてconnection operation ownerへ返し、業務完了を止める。data-useや許可の不明はSECURITY/source ownerへ戻す。
- **証拠**: fixture input、照合revision、event/receipt列、最終状態と未完owner。実通信payload自体は不要。


## Stage 2a — HELIXCONNECT-L2-006の総合検証

本節は006だけの追加case群であり、前段Stage 1本文と001〜005の対応表・caseは保持する。固定親は[f6 L2-006](../L2-requirements/connect-requirements.md#L115)、[L11 acceptance row](../L11-acceptance/connect-acceptance.md#L37)、[L11 exchange fixture](../L11-acceptance/connect-acceptance.md#L68)。Po採択集合はmain `633bf12ea8f948db8ba3d6600179c4a9507377a7`のPO記録line 48。親の入出力・owner・依存契約はL3の[FR-006-01](../L3-requirements/functional-requirements.md#L137)と同じものを使う。

### AC→case trace

| 固定L2句 | L3 AC候補 | L10 case | 観測oracle |
|---|---|---|---|
| 4種類の一側交換、固定側/契約revisionを固定、互換時だけ同契約で送受信 | `CONNECT-AC-006-01` | `CONNECT-CASE-006-01`, `006-05` | 4型を独立に照合し、固定側変更0、互換receipt/送受信のidentity・revision束縛 |
| 不一致・unknown・stale・意味契約変更は通信停止 | `CONNECT-AC-006-02` | `CONNECT-CASE-006-02` | 片側交換後に4型×5 failure classを照合し、各send/retry attempt 0。許可不備だけ交換開始前に停止 |
| revision continuityと未完義務のhandoff/rollback/recovery | `CONNECT-AC-006-03` | `CONNECT-CASE-006-03` | operation/ACK/attempt/expiry/obligation保持、旧新mix 0、再照合前send/retry 0 |
| exchange/recovery権限、owner分離 | `CONNECT-AC-006-04` | `CONNECT-CASE-006-04` | 有効authorityとmissing/unknown/expired/wrong-scopeを区別し、該当ownerへ戻す |

### CONNECT-CASE-006-01 — 4型の互換内一側交換

- **対象AC**: `CONNECT-AC-006-01`。
- **正常fixture**: 1登録済みconnectionについて、以下を互いに独立した4 variantとして実施する。(a)送信側機構本体交換、(b)送信側CONNECT adapter/transport交換、(c)受信側機構本体交換、(d)受信側CONNECT adapter/transport交換。各々で交換しない側の機構・意味契約revision・artifact/dependency revisionを固定し、交換側の旧新revisionと両端契約、compatibility range、変更scope、該当権限、HARNESS common-pack scope/recovery bindingを記録する。宣言範囲内の新revisionを再照合しcompatible receiptを得た後だけ、同一connection contract上でoperationを送受信する。**期待oracle**: 4/4 variantが独立に照合され、各々の固定側bytes/identity/revisionは前後一致、接続・operation/revisionとreceiptが一致する。接続技術結果を業務成立へ昇格しない。
- **入力欠落/不一致**: 各variantで登録接続identity、固定側機構identity、固定側契約revision、固定側artifact revision、固定側dependency revision、交換側旧revision、交換側新revision、変更scope、compatibility declaration、current comparison receiptを一つずつmissing/unknown/他scopeまたは他revisionに変える。**期待oracle**: 既存の交換許可が有効なら片側交換の結果を照合し、欠落/不一致の互換入力・receiptはcompatibleへ補完せずunknown/staleとして扱って送信・再送attempt 0にする。交換許可自体のmissing/unknown/expired/scope不一致だけはCASE-006-04で交換開始前に停止する。送信許可は互換参照照合を代替しない。

### CONNECT-CASE-006-02 — 互換・登録・意味変更failure matrix

- **対象AC**: `CONNECT-AC-006-02`。
- **negative fixtures**: 各交換variant (a)〜(d)ごとに、以下を別々のfixtureとして与える: (1)非互換revision、(2)未登録revision、(3)意味契約変更、(4)unknown compatibility result、(5)stale compatibility receipt。計20独立fixture。さらに固定側も同時更新する反例を与え、片側交換の証拠に含めない。
- **期待oracle**: 20 fixtureすべてで交換後の互換結果を分類し、送信・再送attempt 0、compatibleへの推測昇格0、固定側identity/contract revision更新0。compatibility failureを検出するための片側交換・結果照合は許可反例でない限り開始を禁じない。staleはそのrevision組に再照合してcompatibleになるまで送信を保留する。技術互換の不一致はadapter owner、意味契約差分は両端ownerへ理由とrevisionを返し、既存停止/recovery先を記録する。許可があっても非互換/unknown/staleをoverrideしない。

### CONNECT-CASE-006-03 — 未完義務とrevision continuity

- **対象AC**: `CONNECT-AC-006-03`。
- **正常fixture**: 一側交換開始前に未完operationを置き、operation identity、ACK状態、過去attempt順、expiry、未完義務、停止位置、前後revisionと既存restart/recovery条件を入力する。互換内の交換で固定側を変更しない。**期待oracle**: 交換前後receiptとhandoff/rollback/recovery参照が同じ未完義務と旧新revisionを明示し、各義務の状態を失わない。再照合・既存再開条件が成立するまでは追加send/retryを0に保つ。
- **negative fixtures**: expiry欠落/失効、旧revision receipt流用、新旧attemptの混合、ACK欠落、未完義務の一件欠落、固定側を新revisionと偽装、recovery先欠落を個別に与える。**期待oracle**: 完了扱いをせず停止、unknown/unfinishedとし、欠落理由・停止地点・当該既存owner/recovery先を保持する。未完義務不存在の場合に架空義務を要求しない。

### CONNECT-CASE-006-04 — 交換/復旧authorityとowner別戻し

- **対象AC**: `CONNECT-AC-006-02`, `CONNECT-AC-006-04`。
- **fixture**: exchangeとrecoveryに適用される識別子付き有効許可を持つ通常例を用意し、許可missing、unknown、expired、scope不一致を個別変異する。別入力でadapter/transport技術互換failureと両端意味契約差分を与える。
- **期待oracle**: 有効な適用許可が確認できる場合だけ許可された交換/復旧fixtureを進める。権限反例ではexchange/send attempt 0でSECURITYへ戻す。adapter/transport互換はadapter owner、意味契約差分は両端owner、接続先の業務結果はreceiver business ownerを維持し、同じgeneric failure routeに畳み込まない。CONNECTはauthorityやbusiness resultを生成しない。

### CONNECT-CASE-006-05 — 未見の互換内正常revision

- **対象AC**: `CONNECT-AC-006-01`。
- **正常fixture**: provided happy-path以外の未見revision組を使い、(a)〜(d)各交換型を一つずつ宣言済み互換範囲内で再照合する。未見であること以外は固定入力束縛・owner・scope・permission・HARNESS pack条件を満たす。
- **期待oracle**: 4型それぞれで固定側を不変に保ち、current comparison receiptと同じconnection contractの技術送受信を返す。未登録・範囲外revisionを未見正常例へ混ぜず、unknown/staleを正常へ格上げしない。未見fixtureは互換範囲を拡張しない。
