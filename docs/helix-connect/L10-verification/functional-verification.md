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
| revision continuityと未完義務のhandoff/rollback/recovery | `CONNECT-AC-006-03` | `CONNECT-CASE-006-03` | 旧revision→新revision→current comparison receipt→connection/operation/attempt/技術結果を一つのtraceで追跡し、未完義務を保持。旧新mix 0、再照合前send/retry 0 |
| exchange/recovery権限、owner分離 | `CONNECT-AC-006-04` | `CONNECT-CASE-006-04` | 有効authorityとmissing/unknown/expired/wrong-scopeを区別し、該当ownerへ戻す |

### CONNECT-CASE-006-01 — 4型の互換内一側交換

- **対象AC**: `CONNECT-AC-006-01`。
- **正常fixture**: 1登録済みconnectionについて、以下を互いに独立した4 variantとして実施する。(a)送信側機構本体交換、(b)送信側CONNECT adapter/transport交換、(c)受信側機構本体交換、(d)受信側CONNECT adapter/transport交換。各々で交換しない側の機構・意味契約revision・artifact/dependency revisionを固定し、交換側の旧新revisionと両端契約、compatibility range、変更scope、該当権限、HARNESS common-pack scope/recovery bindingを記録する。宣言範囲内の新revisionを再照合しcompatible receiptを得た後だけ、同一connection contract上でoperationを送受信する。**期待oracle**: 4/4 variantが独立に照合され、各々の固定側bytes/identity/revisionは前後一致する。未完operationの事前有無にかかわらず、交換側旧revision→交換後revision→同connection・scope・revision組に束縛したcurrent comparison receipt→connection/operation/attempt identity→技術結果を、一続きで順序づけられたtraceから辿れる。接続・operation/revisionとreceiptが一致し、接続技術結果を業務成立へ昇格しない。
- **入力欠落/不一致**: 各variantで登録接続identity、固定側機構identity、固定側契約revision、固定側artifact revision、固定側dependency revision、交換側旧revision、交換側新revision、変更scope、compatibility declaration、current comparison receiptを一つずつmissing/unknown/他scopeまたは他revisionに変える。**期待oracle**: 既存の交換許可が有効なら片側交換の結果を照合し、欠落/不一致の互換入力・receiptはcompatibleへ補完せずunknown/staleとして扱って送信・再送attempt 0にする。交換許可自体のmissing/unknown/expired/scope不一致だけはCASE-006-04で交換開始前に停止する。送信許可は互換参照照合を代替しない。
- **trace断絶negative fixtures**: 他の正常入力と各trace要素は保ち、(1)current comparison receiptが別connection・別scope・別revision組へ結び付く、(2)operation/attempt identityが現在のconnectionまたはcomparison receiptから切れる、(3)技術結果が該当operation/attemptへ結び付かない、を各々独立に変異する。**期待oracle**: どの断絶も互換送受信のpass根拠にせずtraceをunknown/staleとして保留する。正しいreceipt束縛を確認できない間はsend/retry attemptを発行しない。孤立した技術結果を成功として計上しない。

### CONNECT-CASE-006-02 — 互換・登録・意味変更failure matrix

- **対象AC**: `CONNECT-AC-006-02`。
- **negative fixtures**: 各交換variant (a)〜(d)ごとに、以下を別々のfixtureとして与える: (1)非互換revision、(2)未登録revision、(3)意味契約変更、(4)unknown compatibility result、(5)stale compatibility receipt。計20独立fixture。さらに固定側も同時更新する反例を与え、片側交換の証拠に含めない。
- **期待oracle**: 20 fixtureすべてで交換後の互換結果を分類し、送信・再送attempt 0、compatibleへの推測昇格0、固定側identity/contract revision更新0。固定側と交換側の両方が変化したfixtureはunknown/rejectとし、compatibleまたは片側交換成功にせず、片側交換のpass計数へ含めない。compatibility failureを検出するための片側交換・結果照合は許可反例でない限り開始を禁じない。staleはそのrevision組に再照合してcompatibleになるまで送信を保留する。技術互換の不一致はadapter owner、意味契約差分は両端ownerへ理由とrevisionを返し、既存停止/recovery先を記録する。許可があっても非互換/unknown/staleをoverrideしない。

### CONNECT-CASE-006-03 — 未完義務とrevision continuity

- **対象AC**: `CONNECT-AC-006-03`。
- **正常fixture**: 一側交換開始前に未完operationを置き、operation identity、ACK状態、過去attempt順、expiry、未完義務、停止位置、旧revision、交換後revision、現在の互換照合receiptと既存restart/recovery条件を入力する。互換内の交換で固定側を変更しない。**期待oracle**: 旧revision→交換後revision→現在の比較receipt→connection/operation identity・attempt・技術結果が一続きのtraceで結ばれ、交換前後receiptとhandoff/rollback/recovery参照が同じ未完義務と旧新revisionを明示し、各義務の状態を失わない。再照合・既存再開条件が成立するまでは追加send/retryを0に保つ。
- **negative fixtures**: traceの途中でreceiptが欠落・他connection/operationまたは他revisionへ結び付くケースを個別に与える。さらに、(1)operation identity欠落、(2)過去attempt順序/履歴欠落、(3)現在の再照合receiptより前にretryを試みるケースを各々独立して与える。従来のexpiry欠落/失効、旧revision receipt流用、新旧attemptの混合、ACK欠落、未完義務の一件欠落、固定側を新revisionと偽装、recovery先欠落も個別に保持する。**期待oracle**: 各反例はpassにせず停止、unknown/unfinishedとし、send/retryは0、欠落理由・停止地点・当該既存owner/recovery先を保持する。未完義務不存在の場合に架空義務を要求しない。

### CONNECT-CASE-006-04 — 交換/復旧authorityとowner別戻し

- **対象AC**: `CONNECT-AC-006-02`, `CONNECT-AC-006-04`。
- **fixture**: exchangeとrecoveryに適用される識別子付き有効許可を持つ通常例を用意し、許可missing、unknown、expired、scope不一致を個別変異する。別入力でadapter/transport技術互換failureと両端意味契約差分を与える。
- **期待oracle**: 有効な適用許可が確認できる場合だけ許可された交換/復旧fixtureを進める。権限反例ではexchange/send attempt 0でSECURITYへ戻す。adapter/transport互換はadapter owner、意味契約差分は両端owner、接続先の業務結果はreceiver business ownerを維持し、同じgeneric failure routeに畳み込まない。CONNECTはauthorityやbusiness resultを生成しない。

### CONNECT-CASE-006-05 — 未見の互換内正常revision

- **対象AC**: `CONNECT-AC-006-01`。
- **正常fixture**: provided happy-path以外の未見revision組を使い、(a)〜(d)各交換型を一つずつ宣言済み互換範囲内で再照合する。未見であること以外は固定入力束縛・owner・scope・permission・HARNESS pack条件を満たす。
- **期待oracle**: 4型それぞれで固定側を不変に保ち、current comparison receiptと同じconnection contractの技術送受信を返す。未登録・範囲外revisionを未見正常例へ混ぜず、unknown/staleを正常へ格上げしない。未見fixtureは互換範囲を拡張しない。


## Stage 4 — 008/009の総合検証設計（未実行）

上記Stage 1の承認本文を保持し、採択済み008/009の1.0草稿に対する静的fixture設計を追補する。下表のCASE IDは個別変異を一意に識別し、一つのACに結ぶ。正常入力はL3各FRの全宣言を持ち、変異行は指定fieldだけを変えて他入力を正常に維持する。suffix M/U/S/Cはmissing/unknown/stale/conflictの独立fixtureである。expectedは判定oracleであり実行結果ではない。証拠はfixture ID、対象operation/profile/connection、revision、照合条件、reason、技術状態、未完・戻し先を持つ。実送信・MCP/probe/旧test/runtimeを起動せず、実許可や実安全性達成を生成しない。

固定sourceはL3と同じ633bf12 L2/L11、009の訂正後L11登録002を用いる。旧HYB-002のHR-AC（未登録profile拒否）とUWJ loop/停止形状を起点に、現行L11の操作別範囲へ再導出する。旧serial merge/CI/DBや層pairを機構間接続の実証にしない。

| CASE ID | L3 AC | 固定親句 | fixture / 独立変異 | 期待oracle | 戻し先 |
|---|---|---|---|---|---|
| `CONNECT-CASE-008-01` | `CONNECT-AC-008-01` | L11:89 | 同profile/revisionの登録・設定型・operation/tool capability・安全/read-only descriptorが揃う | catalogと全typed descriptorが同じ組に束縛される。供給だけ | CONNECT供給 |
| `CONNECT-CASE-008-02` | `CONNECT-AC-008-01` | L2:278/L11:91 | 未登録profileだけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-03` | `CONNECT-AC-008-01` | L2:278/L11:91 | 未知profileだけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-04` | `CONNECT-AC-008-01` | L2:278/L11:91 | 同identityの競合宣言だけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-05` | `CONNECT-AC-008-01` | L2:278/L11:91 | 未登録revisionだけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-06` | `CONNECT-AC-008-01` | L2:278/L11:91 | 誤った設定型だけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-07` | `CONNECT-AC-008-01` | L2:278/L11:91 | operation/tool descriptor欠落だけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-08` | `CONNECT-AC-008-01` | L2:278/L11:91 | operation/tool descriptor型違いだけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-09` | `CONNECT-AC-008-01` | L2:278/L11:91 | 安全descriptor欠落だけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-10` | `CONNECT-AC-008-01` | L2:278/L11:91 | 安全descriptor型違いだけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-11` | `CONNECT-AC-008-01` | L2:278/L11:91 | read-only descriptor欠落だけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-12` | `CONNECT-AC-008-01` | L2:278/L11:91 | read-only descriptor型違いだけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-13` | `CONNECT-AC-008-01` | L2:278/L11:91 | descriptorの別profile束縛だけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-14` | `CONNECT-AC-008-01` | L2:278/L11:91 | descriptorの別revision束縛だけを正常fixtureへ変異 | usableにせず対象profile/revisionと理由を保持。既定profile/互換推定へfallbackしない | profile提供元 |
| `CONNECT-CASE-008-15` | `CONNECT-AC-008-02` | L2:276,280/L11:89,91 | descriptor存在・読出しだけからauthorizationを生成する | 生成を拒否。descriptor供給状態とSECURITY判定/実行は別 | SECURITY |
| `CONNECT-CASE-008-16` | `CONNECT-AC-008-02` | L2:276,280/L11:89,91 | descriptor存在・読出しだけからprobe起動を生成する | 生成を拒否。descriptor供給状態とSECURITY判定/実行は別 | SECURITY |
| `CONNECT-CASE-008-17` | `CONNECT-AC-008-02` | L2:276,280/L11:89,91 | descriptor存在・読出しだけからtool実行を生成する | 生成を拒否。descriptor供給状態とSECURITY判定/実行は別 | SECURITY |
| `CONNECT-CASE-008-18` | `CONNECT-AC-008-02` | L2:276,280/L11:89,91 | descriptor存在・読出しだけから実安全性を生成する | 生成を拒否。descriptor供給状態とSECURITY判定/実行は別 | SECURITY |
| `CONNECT-CASE-008-19` | `CONNECT-AC-008-02` | L2:276,280/L11:89,91 | descriptor存在・読出しだけから実行資格を生成する | 生成を拒否。descriptor供給状態とSECURITY判定/実行は別 | SECURITY |
| `CONNECT-CASE-008-20` | `CONNECT-AC-008-02` | L11:89 | descriptorへ合成raw secret markerを混入 | 不合格、値を証拠へ出さず元入力のownerへ返す | profile提供元 |
| `CONNECT-CASE-008-21` | `CONNECT-AC-008-02` | L11:89 | descriptorへ合成credential値 markerを混入 | 不合格、値を証拠へ出さず元入力のownerへ返す | profile提供元 |
| `CONNECT-CASE-008-22` | `CONNECT-AC-008-02` | L2:280/L11:91 | 034の別policy oracleまたはその採択を008のpass必須にする | 008供給oracleとして使用しない。SECURITY safetyは既存責務で別照合 | SECURITY |
| `CONNECT-CASE-008-23` | `CONNECT-AC-008-03` | L2:278/L11:91 | 登録契約revisionだけを更新、旧descriptorは残す | 当該revisionはstale。再照合前はusable/適格にせず正しい新組だけ解除 | profile提供元 |
| `CONNECT-CASE-008-24` | `CONNECT-AC-008-03` | L2:282/L11:93 | identity不正をprofile Aへ入力、Bは正常 | Aは理由付き不成立で提供元へ、無関係B状態は維持 | profile提供元 |
| `CONNECT-CASE-008-25` | `CONNECT-AC-008-03` | L2:282/L11:93 | config不正をprofile Aへ入力、Bは正常 | Aは理由付き不成立で提供元へ、無関係B状態は維持 | profile提供元 |
| `CONNECT-CASE-008-26` | `CONNECT-AC-008-03` | L2:282/L11:93 | descriptor不正をprofile Aへ入力、Bは正常 | Aは理由付き不成立で提供元へ、無関係B状態は維持 | profile提供元 |
| `CONNECT-CASE-008-27` | `CONNECT-AC-008-03` | L2:282/L11:93 | policy unknownをprofile Aへ入力、Bは正常 | SECURITYへ戻しCONNECTが判定上書きしない。B状態は維持 | SECURITY |
| `CONNECT-CASE-008-28` | `CONNECT-AC-008-03` | L2:282/L11:93 | safety unknownをprofile Aへ入力、Bは正常 | SECURITYへ戻しCONNECTが判定上書きしない。B状態は維持 | SECURITY |
| `CONNECT-CASE-008-29` | `CONNECT-AC-008-03` | L2:282/L11:93 | policy拒否をprofile Aへ入力、Bは正常 | SECURITYへ戻しCONNECTが判定上書きしない。B状態は維持 | SECURITY |
| `CONNECT-CASE-008-30` | `CONNECT-AC-008-03` | L2:282/L11:93 | safety拒否をprofile Aへ入力、Bは正常 | SECURITYへ戻しCONNECTが判定上書きしない。B状態は維持 | SECURITY |
| `CONNECT-CASE-008-31` | `CONNECT-AC-008-03` | L11:93 | 供給証拠が未観測 | unknown、passにしない。実probe/runtimeを要求しない | profile提供元 |
| `CONNECT-CASE-008-32` | `CONNECT-AC-008-01` | L2:278/L11:91 | 伏せた新profile名で同契約の正しい登録組を入力 | 同じ登録・型・束縛oracleでcatalog/descriptorを供給。未見名だけで拒否せず名前から値を補完しない | profile提供元 |
| `CONNECT-CASE-009-01` | `CONNECT-AC-009-01` | L11:96 | A→B one_way正常、B→A feedbackは逆connection/許可なし | 初回辺は独立eligible、feedbackは未送信return relationで送信成功にしない | 逆endpoint/authority owner |
| `CONNECT-CASE-009-02` | `CONNECT-AC-009-01` | L2:289/L11:96 | 独立逆connection・contract/scope/適用authorityを成立させB→Aを宣言 | 宣言二方向を別識別し各操作を照合。前向きだけの権限を使い回さない | 両endpoint/SECURITY |
| `CONNECT-CASE-009-03` | `CONNECT-AC-009-01` | L2:289/L11:99 | one_way登録だけから逆送信許可を生成 | 逆送信不可。初回辺の独立適格性は維持 | SECURITY |
| `CONNECT-CASE-009-04` | `CONNECT-AC-009-01` | L2:289/L11:99 | 受信だけから逆送信許可を生成 | 逆送信不可。初回辺の独立適格性は維持 | SECURITY |
| `CONNECT-CASE-009-05` | `CONNECT-AC-009-01` | L2:289/L11:99 | ACKだけから逆送信許可を生成 | 逆送信不可。初回辺の独立適格性は維持 | SECURITY |
| `CONNECT-CASE-009-06` | `CONNECT-AC-009-01` | L2:289/L11:99 | feedback eventだけから逆送信許可を生成 | 逆送信不可。初回辺の独立適格性は維持 | SECURITY |
| `CONNECT-CASE-009-07` | `CONNECT-AC-009-01` | L11:99 | paired_bidirectionalの片方向だけauthority確認 | 未確認方向はeligibleにせず両方向照合を要求 | 当該endpoint/SECURITY |
| `CONNECT-CASE-009-08-M` | `CONNECT-AC-009-01` | L11:100 | 初回辺のendpointだけをmissingにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-08-U` | `CONNECT-AC-009-01` | L11:100 | 初回辺のendpointだけをunknownにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-08-S` | `CONNECT-AC-009-01` | L11:100 | 初回辺のendpointだけをstaleにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-08-C` | `CONNECT-AC-009-01` | L11:100 | 初回辺のendpointだけをconflictにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-09-M` | `CONNECT-AC-009-01` | L11:100 | 初回辺のconnection identityだけをmissingにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-09-U` | `CONNECT-AC-009-01` | L11:100 | 初回辺のconnection identityだけをunknownにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-09-S` | `CONNECT-AC-009-01` | L11:100 | 初回辺のconnection identityだけをstaleにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-09-C` | `CONNECT-AC-009-01` | L11:100 | 初回辺のconnection identityだけをconflictにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-10-M` | `CONNECT-AC-009-01` | L11:100 | 初回辺の契約revisionだけをmissingにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-10-U` | `CONNECT-AC-009-01` | L11:100 | 初回辺の契約revisionだけをunknownにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-10-S` | `CONNECT-AC-009-01` | L11:100 | 初回辺の契約revisionだけをstaleにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-10-C` | `CONNECT-AC-009-01` | L11:100 | 初回辺の契約revisionだけをconflictにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-11-M` | `CONNECT-AC-009-01` | L11:100 | 初回辺の適用authorityだけをmissingにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-11-U` | `CONNECT-AC-009-01` | L11:100 | 初回辺の適用authorityだけをunknownにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-11-S` | `CONNECT-AC-009-01` | L11:100 | 初回辺の適用authorityだけをstaleにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-11-C` | `CONNECT-AC-009-01` | L11:100 | 初回辺の適用authorityだけをconflictにする | 当該初回辺はnot eligible、missing inputと理由を記録。別独立辺を一括停止しない | endpoint/contract/authorityの当該owner |
| `CONNECT-CASE-009-12` | `CONNECT-AC-009-01` | L11:100 | 独立適格な初回辺でfeedback reasonだけ欠落 | 初回送信を止めず対応する後続操作だけ保留 | 当該feedback/policy/join/ACK owner |
| `CONNECT-CASE-009-13` | `CONNECT-AC-009-01` | L11:100 | 独立適格な初回辺でloop policyだけ欠落 | 初回送信を止めず対応する後続操作だけ保留 | 当該feedback/policy/join/ACK owner |
| `CONNECT-CASE-009-14` | `CONNECT-AC-009-01` | L11:100 | 独立適格な初回辺でparallel joinだけ欠落 | 初回送信を止めず対応する後続操作だけ保留 | 当該feedback/policy/join/ACK owner |
| `CONNECT-CASE-009-15` | `CONNECT-AC-009-01` | L11:100 | 独立適格な初回辺でACKだけ欠落 | 初回送信を止めず対応する後続操作だけ保留 | 当該feedback/policy/join/ACK owner |
| `CONNECT-CASE-009-16` | `CONNECT-AC-009-02` | L11:98 | serialで先行必要結果成立後に宣言後続辺 | 宣言順と先行条件成立をtrace。先行未成立を正常にしない | 構成体/contract owner |
| `CONNECT-CASE-009-17` | `CONNECT-AC-009-02` | L2:290/L11:99 | serial先行必要結果だけ欠落 | 後続辺を実行せずunknown/unfinished、先行結果ownerへ | 先行endpoint/contract owner |
| `CONNECT-CASE-009-18` | `CONNECT-AC-009-02` | L11:98 | parallel独立辺がそれぞれ成立し宣言join全条件成立 | 独立operation/resultを追跡しjoin成立後だけcomposite完了 | 構成体owner |
| `CONNECT-CASE-009-19` | `CONNECT-AC-009-02` | L2:290/L11:99 | execution orderだけ欠落 | 推測しない、対象順序/依存をunknownでownerへ。OS計画を生成しない | HARNESS/OS既存contract owner |
| `CONNECT-CASE-009-20` | `CONNECT-AC-009-02` | L2:290/L11:99 | 依存条件だけ欠落 | 推測しない、対象順序/依存をunknownでownerへ。OS計画を生成しない | HARNESS/OS既存contract owner |
| `CONNECT-CASE-009-21-M` | `CONNECT-AC-009-02` | L11:103 | parallel joinだけmissing | join/composite完了だけ保留。各適格辺は独立に送信可能 | 構成体/contract owner |
| `CONNECT-CASE-009-21-U` | `CONNECT-AC-009-02` | L11:103 | parallel joinだけunknown | join/composite完了だけ保留。各適格辺は独立に送信可能 | 構成体/contract owner |
| `CONNECT-CASE-009-21-S` | `CONNECT-AC-009-02` | L11:103 | parallel joinだけstale | join/composite完了だけ保留。各適格辺は独立に送信可能 | 構成体/contract owner |
| `CONNECT-CASE-009-21-C` | `CONNECT-AC-009-02` | L11:103 | parallel joinだけconflict | join/composite完了だけ保留。各適格辺は独立に送信可能 | 構成体/contract owner |
| `CONNECT-CASE-009-22` | `CONNECT-AC-009-02` | L11:99 | 一部辺成功だけでcomposite完了にする | 全体成功へ昇格しない、未完辺とjoin義務を保持 | 構成体owner |
| `CONNECT-CASE-009-23` | `CONNECT-AC-009-03` | L2:291/L11:97 | typed feedback全束縛が同operation lineageへ結ぶ | 一方向relationを記録、受領/解決/承認/task完了は生成しない | feedback target owner |
| `CONNECT-CASE-009-24-M` | `CONNECT-AC-009-03` | L11:101 | feedbackのreasonだけmissing | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-24-U` | `CONNECT-AC-009-03` | L11:101 | feedbackのreasonだけunknown | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-24-S` | `CONNECT-AC-009-03` | L11:101 | feedbackのreasonだけstale | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-24-C` | `CONNECT-AC-009-03` | L11:101 | feedbackのreasonだけconflict | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-25-M` | `CONNECT-AC-009-03` | L11:101 | feedbackのsource connection/operationだけmissing | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-25-U` | `CONNECT-AC-009-03` | L11:101 | feedbackのsource connection/operationだけunknown | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-25-S` | `CONNECT-AC-009-03` | L11:101 | feedbackのsource connection/operationだけstale | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-25-C` | `CONNECT-AC-009-03` | L11:101 | feedbackのsource connection/operationだけconflict | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-26-M` | `CONNECT-AC-009-03` | L11:101 | feedbackのtarget connection/ownerだけmissing | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-26-U` | `CONNECT-AC-009-03` | L11:101 | feedbackのtarget connection/ownerだけunknown | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-26-S` | `CONNECT-AC-009-03` | L11:101 | feedbackのtarget connection/ownerだけstale | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-26-C` | `CONNECT-AC-009-03` | L11:101 | feedbackのtarget connection/ownerだけconflict | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-27-M` | `CONNECT-AC-009-03` | L11:101 | feedbackのcontract revisionだけmissing | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-27-U` | `CONNECT-AC-009-03` | L11:101 | feedbackのcontract revisionだけunknown | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-27-S` | `CONNECT-AC-009-03` | L11:101 | feedbackのcontract revisionだけstale | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-27-C` | `CONNECT-AC-009-03` | L11:101 | feedbackのcontract revisionだけconflict | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-28-M` | `CONNECT-AC-009-03` | L11:101 | feedbackの独立逆connectionだけmissing | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-28-U` | `CONNECT-AC-009-03` | L11:101 | feedbackの独立逆connectionだけunknown | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-28-S` | `CONNECT-AC-009-03` | L11:101 | feedbackの独立逆connectionだけstale | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-28-C` | `CONNECT-AC-009-03` | L11:101 | feedbackの独立逆connectionだけconflict | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-29-M` | `CONNECT-AC-009-03` | L11:101 | feedbackの適用authorityだけmissing | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-29-U` | `CONNECT-AC-009-03` | L11:101 | feedbackの適用authorityだけunknown | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-29-S` | `CONNECT-AC-009-03` | L11:101 | feedbackの適用authorityだけstale | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-29-C` | `CONNECT-AC-009-03` | L11:101 | feedbackの適用authorityだけconflict | feedback送信だけ保留、未送信return relation・missing input保持。初回不成立/解決済みにしない | fieldに対応するendpoint/contract/authority owner |
| `CONNECT-CASE-009-30` | `CONNECT-AC-009-03` | L2:291 | correlation/operation lineageだけ欠落 | typed relation成立/完了へ補完しない、unknown/unfinishedを対象ownerへ | feedback contract owner |
| `CONNECT-CASE-009-31` | `CONNECT-AC-009-03` | L2:291 | 停止/再開状態だけ欠落 | typed relation成立/完了へ補完しない、unknown/unfinishedを対象ownerへ | feedback contract owner |
| `CONNECT-CASE-009-32` | `CONNECT-AC-009-03` | L2:291/L11:99 | 自由文feedbackだけをtyped edge/resolvedにする | relation成立/解決にしない、findingと未完を保持 | 元finding/target owner |
| `CONNECT-CASE-009-33` | `CONNECT-AC-009-03` | L2:291 | edge記録/伝送だけで受領を生成 | 状態生成を拒否。技術伝送とownerの判定を分離 | 当該状態owner |
| `CONNECT-CASE-009-34` | `CONNECT-AC-009-03` | L2:291 | edge記録/伝送だけで解決を生成 | 状態生成を拒否。技術伝送とownerの判定を分離 | 当該状態owner |
| `CONNECT-CASE-009-35` | `CONNECT-AC-009-03` | L2:291 | edge記録/伝送だけで承認を生成 | 状態生成を拒否。技術伝送とownerの判定を分離 | 当該状態owner |
| `CONNECT-CASE-009-36` | `CONNECT-AC-009-03` | L2:291 | edge記録/伝送だけでtask完了を生成 | 状態生成を拒否。技術伝送とownerの判定を分離 | 当該状態owner |
| `CONNECT-CASE-009-37` | `CONNECT-AC-009-04` | L11:97 | forward/feedback、既存上限budget/期限/policy/終端owner、累積attemptが揃う | 追加attemptは既存条件内のみ。境界到達で未完・理由・累積試行を返す | OS-040等既存適用owner |
| `CONNECT-CASE-009-38-M` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのretry上限だけmissing | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-38-U` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのretry上限だけunknown | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-38-S` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのretry上限だけstale | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-38-C` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのretry上限だけconflict | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-39-M` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのbudgetだけmissing | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-39-U` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのbudgetだけunknown | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-39-S` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのbudgetだけstale | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-39-C` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのbudgetだけconflict | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-40-M` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの期限だけmissing | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-40-U` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの期限だけunknown | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-40-S` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの期限だけstale | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-40-C` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの期限だけconflict | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-41-M` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのtermination policyだけmissing | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-41-U` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのtermination policyだけunknown | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-41-S` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのtermination policyだけstale | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-41-C` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのtermination policyだけconflict | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-42-M` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの終端ownerだけmissing | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-42-U` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの終端ownerだけunknown | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-42-S` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの終端ownerだけstale | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-42-C` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの終端ownerだけconflict | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-43-M` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの累積attempt数だけmissing | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-43-U` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの累積attempt数だけunknown | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-43-S` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの累積attempt数だけstale | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-43-C` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopの累積attempt数だけconflict | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-44-M` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのoperation identityだけmissing | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-44-U` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのoperation identityだけunknown | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-44-S` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのoperation identityだけstale | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-44-C` | `CONNECT-AC-009-04` | L2:292/L11:102 | loopのoperation identityだけconflict | 追加retry0、loop未解決保留。初回適格性を遡って変えずmissing inputとowner記録 | 既存retry/budget/termination contract owner |
| `CONNECT-CASE-009-45` | `CONNECT-AC-009-04` | L2:292/L11:99 | sessionだけ交換して累積attempt/budgetをreset | reset拒否、元operationの累積値を維持 | 既存retry/budget owner |
| `CONNECT-CASE-009-46` | `CONNECT-AC-009-04` | L2:292/L11:97 | 既存上限到達後に追加attempt要求 | 追加retry0、未完・理由・試行数・再開停止状態を既存routeへ | OS-040等既存適用owner |
| `CONNECT-CASE-009-47` | `CONNECT-AC-009-04` | L2:292 | CONNECTが新retry上限/budget policy/解決条件を発行 | 発行を拒否、既存契約参照に限定 | 既存policy owner |
| `CONNECT-CASE-009-48` | `CONNECT-AC-009-05` | L11:104 | ACK未着 | attemptはACK待ち、受領/operation完了/composite完了は未成立、確認先owner記録 | endpoint ACK owner |
| `CONNECT-CASE-009-49-M` | `CONNECT-AC-009-05` | L11:104 | ACKのoperation対応だけmissing | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-49-U` | `CONNECT-AC-009-05` | L11:104 | ACKのoperation対応だけunknown | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-49-S` | `CONNECT-AC-009-05` | L11:104 | ACKのoperation対応だけstale | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-49-C` | `CONNECT-AC-009-05` | L11:104 | ACKのoperation対応だけconflict | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-50-M` | `CONNECT-AC-009-05` | L11:104 | ACKのconnection identity対応だけmissing | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-50-U` | `CONNECT-AC-009-05` | L11:104 | ACKのconnection identity対応だけunknown | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-50-S` | `CONNECT-AC-009-05` | L11:104 | ACKのconnection identity対応だけstale | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-50-C` | `CONNECT-AC-009-05` | L11:104 | ACKのconnection identity対応だけconflict | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-51-M` | `CONNECT-AC-009-05` | L11:104 | ACKの契約revision対応だけmissing | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-51-U` | `CONNECT-AC-009-05` | L11:104 | ACKの契約revision対応だけunknown | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-51-S` | `CONNECT-AC-009-05` | L11:104 | ACKの契約revision対応だけstale | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-51-C` | `CONNECT-AC-009-05` | L11:104 | ACKの契約revision対応だけconflict | ACK待ち保持、受領/operation/composite完了は未成立、missing input記録 | endpoint ACK/contract owner |
| `CONNECT-CASE-009-52` | `CONNECT-AC-009-05` | L2:293 | 因果traceの方向だけ欠落 | 一つの因果traceで辿れずunknown/unfinished、全体成功不可 | 該当event/operation owner |
| `CONNECT-CASE-009-53` | `CONNECT-AC-009-05` | L2:293 | 因果traceの辺順序だけ欠落 | 一つの因果traceで辿れずunknown/unfinished、全体成功不可 | 該当event/operation owner |
| `CONNECT-CASE-009-54` | `CONNECT-AC-009-05` | L2:293 | 因果traceのforward/feedback relationだけ欠落 | 一つの因果traceで辿れずunknown/unfinished、全体成功不可 | 該当event/operation owner |
| `CONNECT-CASE-009-55` | `CONNECT-AC-009-05` | L2:293 | 因果traceのoperation/attemptだけ欠落 | 一つの因果traceで辿れずunknown/unfinished、全体成功不可 | 該当event/operation owner |
| `CONNECT-CASE-009-56` | `CONNECT-AC-009-05` | L2:293 | 因果traceのcontract revisionだけ欠落 | 一つの因果traceで辿れずunknown/unfinished、全体成功不可 | 該当event/operation owner |
| `CONNECT-CASE-009-57` | `CONNECT-AC-009-05` | L2:293 | 因果traceのendpoint receiptだけ欠落 | 一つの因果traceで辿れずunknown/unfinished、全体成功不可 | 該当event/operation owner |
| `CONNECT-CASE-009-58` | `CONNECT-AC-009-05` | L2:293 | 因果traceの停止/終端状態だけ欠落 | 一つの因果traceで辿れずunknown/unfinished、全体成功不可 | 該当event/operation owner |
| `CONNECT-CASE-009-59` | `CONNECT-AC-009-05` | L2:293 | 既存traceに辺部分成功だけを与え全体成功へ昇格 | 全体成功にしない、対象未完と観測済み部分結果を保持 | 該当endpoint/contract/authority/composite owner |
| `CONNECT-CASE-009-60` | `CONNECT-AC-009-05` | L2:293 | 既存traceに互換staleだけを与え全体成功へ昇格 | 全体成功にしない、対象未完と観測済み部分結果を保持 | 該当endpoint/contract/authority/composite owner |
| `CONNECT-CASE-009-61` | `CONNECT-AC-009-05` | L2:293 | 既存traceにauthority unknownだけを与え全体成功へ昇格 | 全体成功にしない、対象未完と観測済み部分結果を保持 | 該当endpoint/contract/authority/composite owner |
| `CONNECT-CASE-009-62` | `CONNECT-AC-009-05` | L2:293 | 既存traceにjoin不成立だけを与え全体成功へ昇格 | 全体成功にしない、対象未完と観測済み部分結果を保持 | 該当endpoint/contract/authority/composite owner |
| `CONNECT-CASE-009-63` | `CONNECT-AC-009-05` | L2:294 | 技術eventだけから業務解決を生成 | CONNECTは生成せず元の意味/判断ownerへ戻す | 各既存owner |
| `CONNECT-CASE-009-64` | `CONNECT-AC-009-05` | L2:294 | 技術eventだけから要求採択を生成 | CONNECTは生成せず元の意味/判断ownerへ戻す | 各既存owner |
| `CONNECT-CASE-009-65` | `CONNECT-AC-009-05` | L2:294 | 技術eventだけからticket発行を生成 | CONNECTは生成せず元の意味/判断ownerへ戻す | 各既存owner |
| `CONNECT-CASE-009-66` | `CONNECT-AC-009-05` | L2:294 | 技術eventだけからbudget policyを生成 | CONNECTは生成せず元の意味/判断ownerへ戻す | 各既存owner |
| `CONNECT-CASE-009-67` | `CONNECT-AC-009-05` | L2:294 | 技術eventだけからfeedback内容判断を生成 | CONNECTは生成せず元の意味/判断ownerへ戻す | 各既存owner |
| `CONNECT-CASE-009-68` | `CONNECT-AC-009-05` | L2:294 | 合成raw secret markerをtraceへ複製 | 不合格、値を証拠へ出さず元source/SECURITYへ返す | source/SECURITY |
| `CONNECT-CASE-009-69` | `CONNECT-AC-009-05` | L2:294 | 合成credential markerをtraceへ複製 | 不合格、値を証拠へ出さず元source/SECURITYへ返す | source/SECURITY |
| `CONNECT-CASE-009-70` | `CONNECT-AC-009-05` | L2:294 | 合成不要payload markerをtraceへ複製 | 不合格、値を証拠へ出さず元source/SECURITYへ返す | source/SECURITY |
| `CONNECT-CASE-009-71` | `CONNECT-AC-009-06` | L2:290,294/L11:100–104 | 伏せた同scope新endpoint/topologyで宣言契約成立／別fixtureは宣言外 | 成立範囲は同操作別oracle、宣言外はunknownで外挿しない | 該当endpoint/contract owner |
| `CONNECT-CASE-009-72` | `CONNECT-AC-009-06` | L2:287,294 | endpointだけ変更して旧receiptを再使用 | 既存L2-002で再照合、旧未完・累積attemptを保持し他scopeへ流用しない | 変更したendpoint/contract/authority/policy owner |
| `CONNECT-CASE-009-73` | `CONNECT-AC-009-06` | L2:287,294 | contract revisionだけ変更して旧receiptを再使用 | 既存L2-002で再照合、旧未完・累積attemptを保持し他scopeへ流用しない | 変更したendpoint/contract/authority/policy owner |
| `CONNECT-CASE-009-74` | `CONNECT-AC-009-06` | L2-002:71/L2-009:289,294 | authorityだけ変更して旧receiptを再使用 | 既存SECURITY authorityのactor/target/operation/revision/environment/scope/expiry/data-useを操作時照合し、欠落/失効/不一致ならwithheld・当該送信attempt0。互換成立だけで許可せず旧累積試行は保持 | SECURITY |
| `CONNECT-CASE-009-75` | `CONNECT-AC-009-06` | L2-009:290,292,294 | execution topologyだけ変更して旧receiptを再使用 | 旧receiptを流用せず変更された対象条件が不明な操作をunknown/unfinishedで保留。topologyは順序/join、feedbackは当該送信、policyは追加retryだけを扱い、別独立適格辺と旧未完・累積試行を保持 | 構成体/順序contract owner |
| `CONNECT-CASE-009-76` | `CONNECT-AC-009-06` | L2-009:290,292,294 | feedback bindingだけ変更して旧receiptを再使用 | 旧receiptを流用せず変更された対象条件が不明な操作をunknown/unfinishedで保留。topologyは順序/join、feedbackは当該送信、policyは追加retryだけを扱い、別独立適格辺と旧未完・累積試行を保持 | feedback contract owner |
| `CONNECT-CASE-009-77` | `CONNECT-AC-009-06` | L2-009:290,292,294 | termination policyだけ変更して旧receiptを再使用 | 旧receiptを流用せず変更された対象条件が不明な操作をunknown/unfinishedで保留。topologyは順序/join、feedbackは当該送信、policyは追加retryだけを扱い、別独立適格辺と旧未完・累積試行を保持 | 既存termination policy owner |
| `CONNECT-CASE-008-33` | `CONNECT-AC-008-01` | L2:278/L11:91 | 伏せた新profile名だけを未登録として入力 | usableにせず拒否理由と対象profile/revisionを記録。名前から登録や互換を推定しない | profile提供元 |
| `CONNECT-CASE-008-34` | `CONNECT-AC-008-01` | L2:278 | 設定契約そのものの欠落を単独変異、他組は正常 | 当該不明/欠落要素と対象profile/revisionを記録しusableにしない、既定や他組で補完しない | profile提供元 |
| `CONNECT-CASE-008-35` | `CONNECT-AC-008-01` | L2:278 | profile revisionだけunknownを単独変異、他組は正常 | 当該不明/欠落要素と対象profile/revisionを記録しusableにしない、既定や他組で補完しない | profile提供元 |
| `CONNECT-CASE-008-36` | `CONNECT-AC-008-01` | L2:278 | 設定契約だけunknownを単独変異、他組は正常 | 当該不明/欠落要素と対象profile/revisionを記録しusableにしない、既定や他組で補完しない | profile提供元 |
| `CONNECT-CASE-008-37` | `CONNECT-AC-008-01` | L2:278 | typed descriptorだけunknownを単独変異、他組は正常 | 当該不明/欠落要素と対象profile/revisionを記録しusableにしない、既定や他組で補完しない | profile提供元 |
| `CONNECT-CASE-008-38` | `CONNECT-AC-008-02` | L2:280 | descriptorの存在/読出しだけからpolicyを生成/代替する | policy生成/代替を拒否し既存SECURITY判定を保持する | SECURITY |
| `CONNECT-CASE-009-78` | `CONNECT-AC-009-02` | L2:290 | serialの先行必要結果は成立、先行契約条件だけ不成立にする | 後続辺を実行せず契約条件不成立を理由としてunknown/unfinished保持。必要結果だけで相殺しない | 先行contract owner |


## Stage 5 — HELIXCONNECT-L2-007の総合検証（未実行）

固定親はf6dad2a33のL2:128–138/L11:74–77。各fixtureは合成の機構/辺identityと宣言済み契約を使い、実送信・旧runtime/test/CIを実行しない。正常fixtureの全要素は変異指定された一項目以外保持する。4ACはL3のCONNECT-FR-007-01へ対応し、下表は全て個別定義で索引CASEを含まない。未観測はpassにしない。

| CASE ID | L3 AC | 正常入力 | 単独変異／正常分岐 | 期待oracle | 戻し先 |
|---|---|---|---|---|---|
| `CONNECT-CASE-007-01` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | なし（正常） | 全必須辺の技術的終端だけcomplete。辺順・operation lineage・端点・revision・結果を構成体traceから辿る | 構成体connection owner |
| `CONNECT-CASE-007-02` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。同scope/契約内でfixture未見の機構Dと辺e3を宣言し、必要な全receiptを与える | なし（未見正常） | 固定契約適合なら未見という理由で拒否せず全宣言辺を照合する。過去e1/e2のgreenだけでe3を補わない | 構成体connection owner |
| `CONNECT-CASE-007-03` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | 辺identityだけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。recovery欠落を先行成功の消去にしない | 当該辺connection owner |
| `CONNECT-CASE-007-04` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | 辺順序だけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。recovery欠落を先行成功の消去にしない | 当該辺connection owner |
| `CONNECT-CASE-007-05` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | correlationだけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。recovery欠落を先行成功の消去にしない | 当該辺connection owner |
| `CONNECT-CASE-007-06` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | scopeだけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。recovery欠落を先行成功の消去にしない | 当該辺connection owner |
| `CONNECT-CASE-007-07` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | 辺登録receiptだけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。recovery欠落を先行成功の消去にしない | 当該辺connection owner |
| `CONNECT-CASE-007-08` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | 現revision互換receiptだけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。recovery欠落を先行成功の消去にしない | 当該辺connection owner |
| `CONNECT-CASE-007-09` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | 端点operation mappingだけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。recovery欠落を先行成功の消去にしない | 当該辺connection owner |
| `CONNECT-CASE-007-10` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | expiryだけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。recovery欠落を先行成功の消去にしない | 当該辺connection owner |
| `CONNECT-CASE-007-11` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | idempotency identityだけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。recovery欠落を先行成功の消去にしない | 当該辺connection owner |
| `CONNECT-CASE-007-12` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | result stateだけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。recovery欠落を先行成功の消去にしない | 当該辺connection owner |
| `CONNECT-CASE-007-13` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | 適用SECURITY許可だけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。当該操作と後続の未許可send/retryを0に保ち、許可を生成しない | SECURITY |
| `CONNECT-CASE-007-14` | `CONNECT-AC-007-01` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | recovery先だけ欠落。他入力は有効 | 全体完了を成立させず、欠落field/辺/未完義務を保持。対象操作に必要な入力を推測せず該当ownerへ返す。recovery欠落を先行成功の消去にしない | 当該辺connection owner |
| `CONNECT-CASE-007-15` | `CONNECT-AC-007-02` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | 端点identityだけ別辺または別対象revisionへ付け替える。他束縛は有効 | 構成体lineage不一致を拒否し、停止位置と未完辺を示す。別辺receiptで欠落を補わない | 当該辺connection owner |
| `CONNECT-CASE-007-16` | `CONNECT-AC-007-02` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | 契約revisionだけ別辺または別対象revisionへ付け替える。他束縛は有効 | 構成体lineage不一致を拒否し、停止位置と未完辺を示す。別辺receiptで欠落を補わない | 当該辺connection owner |
| `CONNECT-CASE-007-17` | `CONNECT-AC-007-02` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | operation対応だけ別辺または別対象revisionへ付け替える。他束縛は有効 | 構成体lineage不一致を拒否し、停止位置と未完辺を示す。別辺receiptで欠落を補わない | 当該辺connection owner |
| `CONNECT-CASE-007-18` | `CONNECT-AC-007-02` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | correlationだけ別辺または別対象revisionへ付け替える。他束縛は有効 | 構成体lineage不一致を拒否し、停止位置と未完辺を示す。別辺receiptで欠落を補わない | 当該辺connection owner |
| `CONNECT-CASE-007-19` | `CONNECT-AC-007-02` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | scopeだけ別辺または別対象revisionへ付け替える。他束縛は有効 | 構成体lineage不一致を拒否し、停止位置と未完辺を示す。別辺receiptで欠落を補わない | 当該辺connection owner |
| `CONNECT-CASE-007-20` | `CONNECT-AC-007-02` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛 | idempotency identityだけ別辺または別対象revisionへ付け替える。他束縛は有効 | 構成体lineage不一致を拒否し、停止位置と未完辺を示す。別辺receiptで欠落を補わない | 当該辺connection owner |
| `CONNECT-CASE-007-21` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功を記録、e2が中間辺となるA→B→C→Dの3辺fixture | e2だけstale。e1記録とe3契約は保持 | 全体成功を報告せずe1成功を保持、e2の停止理由/結果/未完義務と未実行e3を区別。未許可の後続send/retryを0とし、接続failureと業務判断/再計画の戻しを分ける | e2 connection owner。許可失効はSECURITYへ照合し、業務判断/再計画は元機構/OSの既存owner |
| `CONNECT-CASE-007-22` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功を記録、e2が中間辺となるA→B→C→Dの3辺fixture | e2だけtimeout。e1記録とe3契約は保持 | 全体成功を報告せずe1成功を保持、e2の停止理由/結果/未完義務と未実行e3を区別。未許可の後続send/retryを0とし、接続failureと業務判断/再計画の戻しを分ける | e2 connection owner。許可失効はSECURITYへ照合し、業務判断/再計画は元機構/OSの既存owner |
| `CONNECT-CASE-007-23` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功を記録、e2が中間辺となるA→B→C→Dの3辺fixture | e2だけ異digest再送衝突。e1記録とe3契約は保持 | 全体成功を報告せずe1成功を保持、e2の停止理由/結果/未完義務と未実行e3を区別。未許可の後続send/retryを0とし、接続failureと業務判断/再計画の戻しを分ける | e2 connection owner。許可失効はSECURITYへ照合し、業務判断/再計画は元機構/OSの既存owner |
| `CONNECT-CASE-007-24` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功を記録、e2が中間辺となるA→B→C→Dの3辺fixture | e2だけ期限切れ。e1記録とe3契約は保持 | 全体成功を報告せずe1成功を保持、e2の停止理由/結果/未完義務と未実行e3を区別。未許可の後続send/retryを0とし、接続failureと業務判断/再計画の戻しを分ける | e2 connection owner。許可失効はSECURITYへ照合し、業務判断/再計画は元機構/OSの既存owner |
| `CONNECT-CASE-007-25` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功を記録、e2が中間辺となるA→B→C→Dの3辺fixture | e2だけ取消。e1記録とe3契約は保持 | 全体成功を報告せずe1成功を保持、e2の停止理由/結果/未完義務と未実行e3を区別。未許可の後続send/retryを0とし、接続failureと業務判断/再計画の戻しを分ける | e2 connection owner。許可失効はSECURITYへ照合し、業務判断/再計画は元機構/OSの既存owner |
| `CONNECT-CASE-007-26` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功を記録、e2が中間辺となるA→B→C→Dの3辺fixture | e2だけ許可失効。e1記録とe3契約は保持 | 全体成功を報告せずe1成功を保持、e2の停止理由/結果/未完義務と未実行e3を区別。未許可の後続send/retryを0とし、接続failureと業務判断/再計画の戻しを分ける | e2 connection owner。許可失効はSECURITYへ照合し、業務判断/再計画は元機構/OSの既存owner |
| `CONNECT-CASE-007-27` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功を記録、e2が中間辺となるA→B→C→Dの3辺fixture | e2だけ部分成功。e1記録とe3契約は保持 | 全体成功を報告せずe1成功を保持、e2の停止理由/結果/未完義務と未実行e3を区別。未許可の後続send/retryを0とし、接続failureと業務判断/再計画の戻しを分ける | e2 connection owner。許可失効はSECURITYへ照合し、業務判断/再計画は元機構/OSの既存owner |
| `CONNECT-CASE-007-28` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功を記録、e2が中間辺となるA→B→C→Dの3辺fixture | e2だけunknown。e1記録とe3契約は保持 | 全体成功を報告せずe1成功を保持、e2の停止理由/結果/未完義務と未実行e3を区別。未許可の後続send/retryを0とし、接続failureと業務判断/再計画の戻しを分ける | e2 connection owner。許可失効はSECURITYへ照合し、業務判断/再計画は元機構/OSの既存owner |
| `CONNECT-CASE-007-29` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功、e2 timeout、e3未実行、各未完項目は宣言済み | 停止位置だけ出力から欠落 | handoff未完を示し全体成功にしない。先行成功/後続未実行を保持し、欠落を既存connection ownerへ返す | 失敗辺connection owner |
| `CONNECT-CASE-007-30` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功、e2 timeout、e3未実行、各未完項目は宣言済み | 未完辺identityだけ出力から欠落 | handoff未完を示し全体成功にしない。先行成功/後続未実行を保持し、欠落を既存connection ownerへ返す | 失敗辺connection owner |
| `CONNECT-CASE-007-31` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功、e2 timeout、e3未実行、各未完項目は宣言済み | 未完義務だけ出力から欠落 | handoff未完を示し全体成功にしない。先行成功/後続未実行を保持し、欠落を既存connection ownerへ返す | 失敗辺connection owner |
| `CONNECT-CASE-007-32` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功、e2 timeout、e3未実行、各未完項目は宣言済み | ownerだけ出力から欠落 | handoff未完を示し全体成功にしない。先行成功/後続未実行を保持し、欠落を既存connection ownerへ返す | 失敗辺connection owner |
| `CONNECT-CASE-007-33` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功、e2 timeout、e3未実行、各未完項目は宣言済み | recovery handoffだけ出力から欠落 | handoff未完を示し全体成功にしない。先行成功/後続未実行を保持し、欠落を既存connection ownerへ返す | 失敗辺connection owner |
| `CONNECT-CASE-007-34` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功、e2 timeout | e1成功記録だけを消して全辺失敗に丸める | 部分状態の消失を拒否し先行結果を不変に保持する | 構成体connection owner |
| `CONNECT-CASE-007-35` | `CONNECT-AC-007-03` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。e1成功、e2 unknown | 未実行後続辺だけを実行済みとして記録 | 証拠のない後続実行を拒否し未完辺を保持する | 構成体connection owner |
| `CONNECT-CASE-007-36` | `CONNECT-AC-007-04` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。全辺の技術通信完了 | 業務成立だけを技術receiptから生成 | 生成を拒否する。技術completeと元ownerの業務結果/承認、SECURITY authorityを分離する | 元業務owner／承認主体。送信許可はSECURITY |
| `CONNECT-CASE-007-37` | `CONNECT-AC-007-04` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。全辺の技術通信完了 | 結果承認だけを技術receiptから生成 | 生成を拒否する。技術completeと元ownerの業務結果/承認、SECURITY authorityを分離する | 元業務owner／承認主体。送信許可はSECURITY |
| `CONNECT-CASE-007-38` | `CONNECT-AC-007-04` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。全辺の技術通信完了 | 新しい送信許可だけを技術receiptから生成 | 生成を拒否する。技術completeと元ownerの業務結果/承認、SECURITY authorityを分離する | 元業務owner／承認主体。送信許可はSECURITY |
| `CONNECT-CASE-007-39` | `CONNECT-AC-007-04` | 合成fixture A→B→C。辺e1/e2の能力名・契約revision・scopeを区別し、全登録/現互換receipt・operation mapping・correlation/idempotency/expiry/result/authority/recoveryを同対象revisionへ束縛。共通packはGUI/provider/CI製品に依存しない宣言済みI/O | 特定GUIの不在だけで契約適合構成体を拒否する | 固定HARNESS010/011に従いGUI不在だけで拒否しない。Web能力の追加を導出しない | 構成体contract owner |
