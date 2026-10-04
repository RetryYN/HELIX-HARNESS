# HELIX-SECURITY L10 総合検証 — Stage 1（19親の候補）

> 状態：未実行の総合検証設計。合格証拠・L3承認・実行許可を生成しない。対象は`HELIXSECURITY-L2-001`〜`016`、`020`、`028`、`033`の19親だけ。

## 共通oracle

各L10 caseは同番号のL3 ACへ対応し、採択済み固定L2/L11をoracleとする。合成fixtureでscope・owner・revisionを明示し、unknown/未観測をallowやsuccessへ変えない。owner別の判断・実適用・証拠を区別し、あるownerのgreenで他owner条件を満たしたことにしない。各caseの正例、個別negative、未見正常例、owner oracleを別に示す。raw secret値と不要なasset内容は証拠に含めない。旧test/runtime/CIは実行しない。

L2-002の命令様入力からsecurity policy変更へ直結させない条件は固定L2-002（section SHA `07ce9de25ab4b47be2b99a0550342230e34520548fe4444b6e0166d9454c61cd`）に束縛する。L11-002の引用oracleはL11-002（section SHA `e3be2a9d718395db4d018280b458e3c85e508bb68c59ae9828f1e486c99c3890`）の原文に限る。L2の語句をL11へ帰属させない。

## 固定親とL3/L10対応

| 固定L2 identity | L3 FR | L3 AC | L10 CASE | 版 |
|---|---|---|---|---|
| `HELIXSECURITY-L2-001` | `SECURITY-FR-001-01` | `SECURITY-AC-001-01` | `SECURITY-CASE-001-01` | 1.0 |
| `HELIXSECURITY-L2-002` | `SECURITY-FR-002-01` | `SECURITY-AC-002-01` | `SECURITY-CASE-002-01` | 1.0 |
| `HELIXSECURITY-L2-003` | `SECURITY-FR-003-01` | `SECURITY-AC-003-01` | `SECURITY-CASE-003-01` | 1.0 |
| `HELIXSECURITY-L2-004` | `SECURITY-FR-004-01` | `SECURITY-AC-004-01` | `SECURITY-CASE-004-01` | 1.0 |
| `HELIXSECURITY-L2-005` | `SECURITY-FR-005-01` | `SECURITY-AC-005-01` | `SECURITY-CASE-005-01` | 1.0 |
| `HELIXSECURITY-L2-006` | `SECURITY-FR-006-01` | `SECURITY-AC-006-01` | `SECURITY-CASE-006-01` | 1.0 |
| `HELIXSECURITY-L2-007` | `SECURITY-FR-007-01` | `SECURITY-AC-007-01` | `SECURITY-CASE-007-01` | 1.0 |
| `HELIXSECURITY-L2-008` | `SECURITY-FR-008-01` | `SECURITY-AC-008-01` | `SECURITY-CASE-008-01` | 1.0 |
| `HELIXSECURITY-L2-009` | `SECURITY-FR-009-01` | `SECURITY-AC-009-01` | `SECURITY-CASE-009-01` | 1.0 |
| `HELIXSECURITY-L2-010` | `SECURITY-FR-010-01` | `SECURITY-AC-010-01` | `SECURITY-CASE-010-01` | 1.0 |
| `HELIXSECURITY-L2-011` | `SECURITY-FR-011-01` | `SECURITY-AC-011-01` | `SECURITY-CASE-011-01` | 1.0 |
| `HELIXSECURITY-L2-012` | `SECURITY-FR-012-01` | `SECURITY-AC-012-01` | `SECURITY-CASE-012-01` | 1.0 |
| `HELIXSECURITY-L2-013` | `SECURITY-FR-013-01` | `SECURITY-AC-013-01` | `SECURITY-CASE-013-01` | 1.0 |
| `HELIXSECURITY-L2-014` | `SECURITY-FR-014-01` | `SECURITY-AC-014-01` | `SECURITY-CASE-014-01` | 1.0 |
| `HELIXSECURITY-L2-015` | `SECURITY-FR-015-01` | `SECURITY-AC-015-01` | `SECURITY-CASE-015-01` | 1.0 |
| `HELIXSECURITY-L2-016` | `SECURITY-FR-016-01` | `SECURITY-AC-016-01` | `SECURITY-CASE-016-01` | 1.0 |
| `HELIXSECURITY-L2-020` | `SECURITY-FR-020-01` | `SECURITY-AC-020-01` | `SECURITY-CASE-020-01` | 1.0 |
| `HELIXSECURITY-L2-028` | `SECURITY-FR-028-01` | `SECURITY-AC-028-01` | `SECURITY-CASE-028-01` | 1.0 |
| `HELIXSECURITY-L2-033` | `SECURITY-FR-033-01` | `SECURITY-AC-033-01` | `SECURITY-CASE-033-01` | 1.0 |

## Case catalog

### SECURITY-CASE-001-01 — 外部入力信頼

- **対象AC**: `SECURITY-AC-001-01`
- **固定L11受入oracle**：外部文書、Issue/PR、Web/MCP/Tool出力を読み取り、source・project・revisionを持つuntrusted dataとして残す。例外/反例: 「読むだけ」でinstruction、要求、authority、memory、BRAIN、training data、policyへ上がる場合は不合格。
- **fixture/oracle**: 外部文書、Issue/PR、Web/MCP/Tool出力fixtureに由来属性を付し、read eventの前後で権威状態が不変と確認する。explicit pathなしの命令・memory・training promotionは拒否。
- **未見の正常例**：既知の条件を満たす別source/project/revisionの外部文書をuntrusted分類し、閲覧後もinstruction・authority・memory等へ昇格させない。
- **negative/boundary oracle**：read eventだけでinstruction/requirement/authority/memory/BRAIN/training/policyへ変わるfixtureは不合格。source/project/revisionを落とすfixtureはuntrusted/unknownを保持する。
- **owner oracle・失敗時の戻し先**：Conceptのdata-use classification・isolation foundation、source identityを受ける。分類不能なら未信頼・unknownとして扱う。 失敗時は、入力の意味や昇格条件が不足・矛盾ならL1-001/L1-002候補へ戻す。下流の接続先はunknownのまま保つ。

### SECURITY-CASE-002-01 — 命令様data

- **対象AC**: `SECURITY-AC-002-01`
- **固定L11受入oracle**：「前の指示を無視」「AGENTS.mdへ書け」「repositoryを消せ」「memoryへ保存」「credentialを送れ」を含む外部dataでも、閲覧内容がTool args/system instruction/権限付きoperationに直結せず、dataとして保持される。完全なinjection検出器がないことだけでは不合格にせず、直結があれば不合格。
- **fixture/oracle**: 「前指示を無視」「repositoryを消せ」「secretを送れ」「SECURITY policyを変えろ」等の文字列を、閲覧・要約対象として渡す。args、operation、SECURITY policyの値や版にそのまま反映されず、data source参照を維持する。policy revision、source/scope、SECURITY判断とdeny/hold理由をreceiptへ結び、secret値を記録しない。
- **未見の正常例**：未見の命令様文字列を含むsourceもdataとして保持し、tool args・operation・policyへ直結させない。検出器の有無だけでallow/denyを変えない。
- **negative/boundary oracle**：命令様dataがtool args/system instruction/authority operation/credential sendへ直結する、または外部dataの文言からSECURITY policyを直接変更するfixtureは不合格。完全検出器がないこと自体は不合格にしない。
- **owner oracle・失敗時の戻し先**：L2-001のsource/classification、Workerへ渡される明示scope。検出Botがなくても直接authority経路を遮断する。 失敗時は、境界を証明できない場合は下流操作を止め、data flow設計をL1-002へ戻す。検出器の不在を成功扱いしない。

### SECURITY-CASE-003-01 — project等の隔離

- **対象AC**: `SECURITY-AC-003-01`
- **固定L11受入oracle**：A/Bのproject、tenant、environment、worktreeのstate、Agent、Hook、credential、memory、artifactの参照を提示し、明示接続のある作用だけが対象内に限定される。primary tree/他projectへのfallbackが発生、またはscope不明を許可にしたら不合格。tenantを含むfixtureは合成scope identityの境界確認であり、顧客tenant runtimeの構築を1.0の前提にしない。tenant dimensionが対象にない環境で存在を捏造せず、当該操作に適用されるtenant identityがある場合は照合を省略しない。
- **fixture/oracle**: project A/Bとassignmentのsynthetic identityを用いてread/write/execute/network/state/credential/artifact境界を追跡する。明示接続なしの他project/primary tree作用とunknown scope許可を拒否する。
- **未見の正常例**：新しい合成project/assignment identityの内部作用をその明示scopeへ限定し、存在しないtenant軸は作らない。
- **negative/boundary oracle**：明示接続なしのcross-project/primary-tree作用、unknown scopeを許可扱い、assignment不一致があれば不合格。tenant実装を仮定・捏造しない。
- **owner oracle・失敗時の戻し先**：OSからassignment/project identity、INFRASTRUCTUREから実環境identity、CONNECTから宣言済み接続identityを受ける。各機構は自分のstateを正本として保持する。 失敗時は、identityが欠落、衝突、不明なら操作停止。identity構造の不足はL1-003へ、物理環境の不足は接続要求でINFRASTRUCTUREへ戻す。

### SECURITY-CASE-004-01 — 設定integrity

- **対象AC**: `SECURITY-AC-004-01`
- **固定L11受入oracle**：正しいproject/root/HEAD/revision/digest/owner/scopeの構成だけを識別し、stale revision、未知Hook、他projectのMCP設定を受け入れない。構成の一部欠落を既定値で黙って補ったら不合格。
- **fixture/oracle**: 現在値一致、stale revision、別project、unknown hook/MCP config、各フィールド欠落を比較する。採用可能revisionとunknown/staleの比較結果、内容差分とauthority差分の別出力を観測し、既定値で穴埋めした状態はpassしない。
- **未見の正常例**：未見の構成revisionでもproject/root/HEAD/digest/owner/scopeが一致すれば同じintegrity判定を返し、見慣れないことだけを理由に拒否しない。
- **negative/boundary oracle**：stale revision、unknown hook/config、他project source、project/root/HEAD/digest/owner/scope各欠落のいずれかを既定値補完して受入れたら不合格。
- **owner oracle・失敗時の戻し先**：L2-003のidentityと、構成sourceのrevision/digest。Ownerが不明ならその不明を維持する。 失敗時は、対象のowner/scopeが不明ならL1-004へ戻し、実行を停止する。承認のない構成を推測採用しない。

### SECURITY-CASE-005-01 — secret/credential

- **対象AC**: `SECURITY-AC-005-01`
- **固定L11受入oracle**：raw credentialはcontext/log/artifactに現れず、範囲・operation・target・expiry付き利用だけが許可され、期限切れ/revoked credentialの後続利用が止まる。repository混入、直接Worker露出、egress漏れ、値入りreceiptがあれば不合格。
- **fixture/oracle**: normal fixtureでは非公開scope付きcredential-useだけを呼び出し、actor/operation/target/environment/scope/expiry/purposeを既存credential-use/authority tupleと照合し、生値が全観測出力から除外される。各fieldの欠落/不一致、expired/revoked、直接store、値入りartifact/receiptは個別拒否。
- **fixture追加**：複数consumerに同一canonical classifier identity/revisionを与える正常例と、consumer一つだけ独自判定を使う例、classifier版がstale/unknownの例を比較する。
- **未見の正常例**：異なる種類の合成credential consumerでも、既存canonical classifierの同一identity/revisionと完全な既存authority tupleを使う場合は、raw値を受け渡さず同じclassification/use結果を得る。consumer種別が未見という理由だけでdenyせず、未結束classifierやunknown authorityを許可にしない。
- **negative/boundary oracle**：raw secretがcontext/file/artifact/log/Tool result/egressに現れる、Workerへstoreを直接見せる、expired/revoked/mismatched useを続ける、秘密をreceiptへ書く、consumer別classifierを作る/同じinputの分類結果が食い違うfixtureは不合格。正しい非公開scoped credential-useを一律denyすることも不合格。
- **owner oracle・失敗時の戻し先**：L2-008 authority、L2-006 egress、Worker境界L2-007、INFRASTRUCTUREの安全な実資源境界。 失敗時は、欠落scope、期限切れ、未知のcredential class、検査不能はdeny/stop。方針の不足はL1-005へ、保存・注入境界はL2-024へ戻す。

### SECURITY-CASE-006-01 — egress

- **対象AC**: `SECURITY-AC-006-01`
- **固定L11受入oracle**：送信先/protocol/endpoint/data class/bytes/purpose/authority/expiryを照合し、明示許可された範囲内の送信だけを通す。分類はL2-016の1.0分類記録基盤から読み、L2-019や1.x sink enforcementが存在しない状態でも1.0の送信判定は成立する。vendor側privacy設定だけがある送信、未許可destination、未知classificationが通れば不合格。L2-019のasset-specific egressは別の1.x受入とする。
- **fixture/oracle**: 明示許可内、宛先/protocol/path不一致、unknown class/authority、期限切れを対比し、default-deny基準の許可一覧、個別判断、送信量計測とdata-minimization結果を出力として照合する。vendor privacy設定のみの根拠では許可されず、1.0判定を1.x sink availabilityへ依存させない。
- **未見の正常例**：既存ruleで明示許可された別endpoint/protocol/data classの組合せをscope内で扱い、未知・未許可条件だけをdenyする。
- **negative/boundary oracle**：未許可destination/protocol/path、unknown classification/purpose/authority/expiryを送信可能にしたら不合格。vendor privacy設定だけでallowしない。asset-specific 1.x sinkがないことだけで1.0一般egress判断を不合格にしない。
- **owner oracle・失敗時の戻し先**：L2-005のsecret検査、L2-016の1.0分類基盤（data-use classificationとasset exposure classの記録だけ）、CONNECTの論理接続、INFRASTRUCTUREの実network経路。L2-019のCore Asset Egress GuardとL2-016の1.x sink enforcementは依存に含めない。 失敗時は、宛先/分類/目的/authorityがunknownならdenyし、方針の意味差はL1-006へ戻す。物理経路の不明はL2-024へ。

### SECURITY-CASE-007-01 — 実行環境制約

- **対象AC**: `SECURITY-AC-007-01`
- **固定L11受入oracle**：各制約（write path、network、credential、environment、timeout、resource、diff検査、rollback、result collection）がWorker実行環境へ渡り、適用・観測状態を確認できる。いずれか未適用/unknownなのにhost fallbackで実行、制約をWorkerが自己拡張したら不合格。read-onlyでもwrite禁止の適用と操作対象scopeの実行後の変更なし観測を要する。rollbackだけは変更なしを確認できた場合に限り適用対象外とでき、変更有無がunknownなら成功扱いしない。以下の9制御fixture表で条件を個別に確認する。
- **fixture/oracle**: 制約ごとにrequest→environment acknowledgement/evidenceを検査。欠落・unsupported・自己拡張を投入し、起動停止/unknownを確認する。read-onlyもscope内変更なしを観測。rollback N/Aは変更なし確認時のみ。
- **未見の正常例**：新しいread-only assignmentでも、各適用可能な制約とowner宣言値・実適用観測がそろい、read-only変更なしを確認できる場合に同じ契約で扱う。
- **negative/boundary oracle**：一つでもconstraint→実行環境適用が未確認/unsupported/unknownなのに開始、host fallback、Worker自身のscope拡張があれば不合格。read-onlyで変更があれば不合格。変更なしを確認したrollback N/Aだけ許す。
- **owner oracle・失敗時の戻し先**：Concept/Worker実行契約、OS assignment、INFRASTRUCTURE実資源、L2-003/005/006/008。旧Runner/Sandbox actorを復活させない。 失敗時は、未適用/未観測/unsupportedは実行停止・unknown。SECURITY方針不足はL1-007、物理enforcement欠落はINFRASTRUCTURE接続の候補へ戻す。

## SECURITY-CASE-007-01 の9制御fixture

各行はL2-007が列挙する独立制約を一つずつ欠落・不一致にする。合成fixtureのみを使い、外部作用は行わない。

| 制御 | fixture入力 | 欠落/不一致条件 | 観測owner・証拠 | 合格条件 |
|---|---|---|---|---|
| write path | assignment scope内の許可pathとread-only/write条件 | pathを一つscope外へ差替え、またはwrite禁止を欠落 | Worker enforcement owner;要求/実効pathと実行後状態 | scope外write 0、read-only時対象変更なし |
| network | deny-allを宣言した合成assignment、隔離endpoint、destination/protocol | 許可外destination/protocolへの接続を試し、別fixtureでhost networkまたは別backendへ切替えて継続を試す | Worker/INFRASTRUCTURE owner; endpoint、実適用状態、拒否結果 | 接続なし、未許可egressなし、host/別backend fallbackなし。適用観測が欠ければunknownとして停止 |
| credential | credential classとscope/expiry/revoke state | credentials noneの条件でfallbackを試す、特権credentialへfallback、Workerからhost credential参照、scope不一致/unknown/期限切れを独立投入。別fixtureで有効scoped capabilityをraw値非到達で使う | SECURITY/credential owner;値を含まない判断receipt | 無許可利用とraw value記録0。既存条件内のscoped useは一律denyしない |
| environment | SECURITYが宣言しassignment/policy revisionへ束縛した許可set、Worker実行環境identity | 固定L11例の`TASK_MODE`/`LANG`だけを許可し、許可外の`HOST_SECRET_REF`（値なし）を拒否する。許可set欠落/改変・別環境適用も独立変異 | SECURITY policy owner + Worker enforcement owner;宣言setと実適用観測 | SECURITYが宣言したsetだけ適用。許可外変数の継承と適用観測欠落/unknownでの実行0。secret値を露出させない |
| timeout | assignment/runtime ownerの宣言時間値 | 宣言値到達/超過と観測不明を比較 | Worker owner;宣言値と停止event | 宣言境界を超える処理を成功にしない。未宣言値を補わない |
| resource | SECURITY制約へ結び付いたpolicy revision、assignment内resource条件（このfixtureではCPU=1、memory=256MiB）、Workerの実適用状態 | 条件を欠落、設定だけ宣言して適用観測を欠落、実resourceを境界超過させる | SECURITY policy owner + Worker enforcement owner;要求/実効resource観測 | 設定だけで適用済みとしない。欠落/unknown/超過で継続しない。CPU・memory値はこのfixtureだけの固定L11例であり製品閾値ではない |
| diff検査 | operation前後の対象scope diff | 許可scope内の実差分positive、scope外差分、実post-stateとdiff不一致、secret markerを含むdiff記録、diff receipt欠落を独立投入 | operation owner/Worker;前後identityとdiff scope | 実post-state照合に合う許可範囲のみ受入れ、scope外差分とsecret記録0、receipt欠落はunknown |
| rollback | operation前のstate digest、変更有無と既存rollback条件 | rollback計画だけで復旧済と主張、部分復元、無関係scopeも復元、rollback receipt欠落、変更有無unknownを独立投入 | operation/OS owner;前状態digest、実行後状態・rollback結果 | 計画は復旧証拠でない。前後stateを照合し、部分/無関係scope復元を拒否する。partial rollbackをsuccessに変換しない。変更なしを確認できた場合だけ適用外。unknownは成功扱いしない |
| result collection | assignment/policy/source revision、status、制約適用状態、diff digest、rollback状態、collection scopeと相関ID | stdout/自己申告だけで適用済みとする、result field/receipt欠落またはstale、異なるoperationのreceipt混入、partial rollbackをsuccessとする変異を独立投入 | HARNESS証拠owner + operation owner | 上記の束縛項目を持ち期待tupleと相関するreceiptだけを収集済みとする。必須field欠落、stale、誤相関、失敗/partial rollbackをsuccess扱いしない。host/別backend fallbackなし |

### SECURITY-CASE-008-01 — operation authority

- **対象AC**: `SECURITY-AC-008-01`
- **固定L11受入oracle**：異なるread/write/execute/network/install/delete/merge/release/deploy/credential-use/security-change操作で別authorityを要求し、actor/target/operation/revision/environment/scope/expiryが完全一致したときだけ影響の大きいoperationを許可する。Agent利用権から包括write/deployが生じる、または欠落・期限切れ・driftを通すと不合格。
- **fixture/oracle**: read authorityでwrite等を試みる、target/revision/scope/expiry driftを各々投入しdenyを確認。exact tupleだけ対応operationへ返す。
- **未見の正常例**：既存decisionで有効な別operation tupleがactor/target/operation/revision/environment/scope/expiryに一致するとき、そのoperationだけを判定する。
- **negative/boundary oracle**：actor/target/operation/revision/environment/scope/expiryのいずれかが不一致/unknownなのにallow、またはread/Agent利用からwrite/deploy権限を推定したら不合格。
- **owner oracle・失敗時の戻し先**：L2-003 identity、L2-004構成integrity、L2-005 credential、L2-006 egress、OSの進行。 失敗時は、未認可、drift、expiry、unknownではdenyし、意味の変更はL1-008へ戻す。停止伝播はL2-009/022で検証。

### SECURITY-CASE-009-01 — revoke/quarantine

- **対象AC**: `SECURITY-AC-009-01`
- **固定L11受入oracle**：revoke、scope drift、credential漏洩、異常通信、runtime逸脱、unknownを投入すると、OSの新規割当停止、Workerの実行停止と途中成果物隔離、CONNECT通信停止、credential使用停止、artifact access停止の該当先へ伝わる。どれかの該当停止が確認できず成功扱いで継続したら不合格。unknownは列挙triggerの安全上の影響や不明な外部副作用に関するものとし、無関係な一般文書の意味unknownを全操作停止へ広げない。operation/project/worker/credential/connection/artifactの該当identityに束縛して伝播し、recipient別の受領・適用・未達・未観測を区別する。
- **fixture/oracle**: 各triggerを対象identityに結び、該当recipientごとの受領・適用を確認。無関係な通常文書の意味unknownはglobal stopにしない。該当recipient未達をsuccessとして扱わない。
- **未見の正常例**：新しいrevoke triggerでも、そのscopeに該当するrecipientを列挙し、受領・適用を個別確認する。無関係scopeを停止しない。
- **negative/boundary oracle**：該当recipientの未達/未観測をsuccess扱いし対象operationを継続したら不合格。無関係な通常操作まで停止することも不合格。伝播相関identityを混同しない。
- **owner oracle・失敗時の戻し先**：L2-003/005/006/007/008、OS assignment、Worker実行環境、CONNECT、artifact access、INFRASTRUCTURE観測。 失敗時は、recipient未応答・未観測・unknownの間は対象operation/新規割当てを止める。authority/policy意味差はL1-009へ、OS/Worker/CONNECT/INFRAのenforcement差はその接続先L1へ戻す。

### SECURITY-CASE-010-01 — 更新受入

- **対象AC**: `SECURITY-AC-010-01`
- **固定L11受入oracle**：source code、dependency、package、plugin、MCP、Skill、Agent definition、Hook、runtime config、sandbox policy、model、model weights、prompt/system instruction、Connector、infrastructure configurationの15対象それぞれについて、provenance、digest、dependency/permission/network/credential/hook-config差分、新規実行物、known finding、rollback情報が揃い採否と根拠を追える。単に新version、または欠落情報をunknownのまま採用したら不合格。
- **fixture/oracle**: 15種類の対象を代表fixture各一つとして列挙し、版文字列だけの更新とprovenance欠落/差分/rollback unknownを対比する。各項目欠落でunknown/rejectとなる。scanner等の特定実装は前提にしない。
- **未見の正常例**：15対象のいずれかについて、対象型に必要なprovenance・digest・dependency/permission/network差分・finding・rollback情報がそろう別candidateを同じ条件で判定する。
- **negative/boundary oracle**：15種のいずれかでprovenance/digest/差分/known finding/rollback等の該当情報を欠落させても採用、または新versionだけで採用したら不合格。未知はunknown/rejectで、特定scannerの不在は失敗条件にしない。
- **owner oracle・失敗時の戻し先**：L2-011能力差分、L2-012 supply-chain provenance、L2-013 artifact integrity、L2-008 authority。 失敗時は、情報不足はunknown/reject、意味や必要な判定軸の差はL1-010へ戻す。実行/昇格はL2-023に従う。

### SECURITY-CASE-011-01 — capability drift

- **対象AC**: `SECURITY-AC-011-01`
- **固定L11受入oracle**：同じfile変更でもread-only→write+shell+networkの能力差分を検出し、model/Agent/MCP/pluginにも適用される。hash一致/ファイル名だけでcapability不変と結論したら不合格。
- **fixture/oracle**: 同一ファイル名/ハッシュの固定例でもpermission manifestが変わるfixtureを用い、version差分→capability差分→security impactの比較結果を検出する。model/Agent/MCP/plugin種別で適用を確認する。
- **未見の正常例**：未見のmodel/Agent/MCP/plugin等でも、manifest上のpermission/capabilityに差分がない場合は同じ比較契約を適用し、名前/hashだけで差分なしと推定しない。
- **negative/boundary oracle**：同じfile name/hashでもread-only→write/shell/network等の能力差があれば検知する。差を分類できない状態でcapability不変・受入可としたら不合格。
- **owner oracle・失敗時の戻し先**：L2-004の構成identity、L2-010のcandidate revision。比較不能はunknownとする。 失敗時は、能力を分類できない変更は受け入れず、分類意味の不足をL1-011へ戻す。

### SECURITY-CASE-012-01 — supply-chain provenance

- **対象AC**: `SECURITY-AC-012-01`
- **固定L11受入oracle**：package/container/GitHub repo/MCP/plugin/Skill/Agent/model/binaryでsource、producer、version、digest、dependency、permission、network、known risk、update delta、rollbackを辿れる。不明な供給元/実行能力をtrustedへ昇格したら不合格。
- **fixture/oracle**: 対象種別ごとにprovenance fieldを確認し、supplier/producer/permission unknown、dependency mismatch、rollback欠落を投入してunknown/reject。
- **未見の正常例**：新しいpackage/repository sourceでもproducer、version、digest、dependency、permission、network、risk/update/rollbackの既存fieldが追跡可能なら同じprovenance判定を返す。
- **negative/boundary oracle**：supplier/source/producer/version/digest/dependency/permission/network/risk/update/rollbackの不明・不一致をtrustedとしたら不合格。特定scanner/registry/providerなしを理由に拒否しない。1.0のprovenance traceから1.x Core Asset Guard/sink protectionの完成を主張しない。
- **owner oracle・失敗時の戻し先**：L2-010更新candidateとL2-013artifact identity。特定scanner/registry/providerを新規必須化しない。 失敗時は、欠落または不一致はunknown/reject。対象範囲の変更はL1-012へ戻す。

### SECURITY-CASE-013-01 — artifact identity chain

- **対象AC**: `SECURITY-AC-013-01`
- **固定L11受入oracle**：build/validation済artifactのidentityと配布/実行artifactのidentity・digest・provenanceが同じ鎖で一致する。異なるartifact、欠けた工程、digest不一致が昇格可能なら不合格。digest一致だけからsource trustやverification passを推定しても不合格。
- **fixture/oracle**: validation済artifactと配布/実行artifactの同一鎖と、差替え/missing step/digest mismatchを対照する。同じdigestだけでtrust/passとなるfixtureは不合格。
- **未見の正常例**：未見のartifactでもsourceからvalidation・配布/実行までの同一identity chainが確認できれば結合し、digestだけではtrust/passを生成しない。
- **negative/boundary oracle**：生成/build/validation/配布/実行のidentity鎖に欠落/mismatch/digest差があるまま昇格、またはdigest一致だけでsource trust/verification passを推定したら不合格。
- **owner oracle・失敗時の戻し先**：L2-010/012の更新・provenance、HARNESS verification receipt、OS promotion record。 失敗時は、identity/digest mismatch、missing stepは昇格停止。意味や必要なidentityが不足ならL1-013へ戻す。

### SECURITY-CASE-014-01 — 永続化判定

- **対象AC**: `SECURITY-AC-014-01`
- **追加fixture/oracle**：memory／training dataset／BRAIN knowledgeの各target classへ、Memory poisoning／Prompt Injection persistence／training contamination／BRAIN contaminationにつながり得る合成入力を与え、L2-001/002のsource trustと、source/provenance/classification/targetを個別に欠落・unknown・不一致へ変異する。該当targetへのSECURITY判断理由を返し、不足はhold/denyする。L2-015/016のidentity/classificationを入力し、1.x sink enforcementは必須にしない。単体判定からhandoff、LABO評価、BRAIN登録、保存実行を生成せず、3経路はL2-027の別判定へ残す。
- **固定L11受入oracle**：SECURITY単体のdecision tableへmemory、training dataset、BRAIN knowledgeの3 target classを個別に入力し、source/provenance/classificationが欠落・unknown・target不一致ならhold/denyし、理由付き判定を返す。Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINの機構横断受渡しや保存成功をこの単体試験で主張したら不合格。L1-014の構成体kindと3経路の成立はL2-027だけで受け入れる。
- **fixture/oracle**: 三つのtarget classを独立にfixture化し、valid L2-001/002 source trust、L2-015/016 metadataと、source trust・metadata欠落/unknown/target mismatchを比較。判定receiptに理由/targetを残し、保存や構成体完了を示さない。
- **未見の正常例**：memory、training dataset、BRAIN knowledgeのいずれかへの新しい合成target入力について、valid source/provenance/classificationに対するSECURITY判断と理由だけを返し、handoffや保存を生成しない。
- **negative/boundary oracle**：source/provenance/classification missing/unknown、または誤targetをallowしたら不合格。判定から機構間handoff、LABO評価、BRAIN登録、実保存を成功扱いしない。
- **owner oracle・失敗時の戻し先**：SECURITYはtargetごとの判定と理由、source ownerはprovenance/classification metadata、target ownerはhandoff/保存、LABO/BRAINは評価/知識格納を所有する。metadata欠落はhold/denyしsource ownerへ返す。target集合・判定意味の変更はL1-014へ戻す。本caseは機構横断完了を主張しない。

### SECURITY-CASE-015-01 — asset identity

- **対象AC**: `SECURITY-AC-015-01`
- **固定L11受入oracle**：§16列挙の HELIX-HARNESS-CORE（HELIX-JSON、Python meaning core、Requirement Engine、internal verification logic）、HELIX-BRAIN（Patterns、Units、Parts、accumulated design knowledge）、HELIX-INTELLIGENCE（internal prompts、judgment configuration、specialist models、routing / diagnostic logic）、HELIX-LABO（episodes、evaluation corpus、training material）、HELIX-OS（authority/state、topology、operation records）、HELIX-SECURITY（policies、credentials）をowner、identity、source、revision/digestで識別できる。列挙外資産も分類対象となり得る。内容をdumpせず識別不能をpublicと扱ったら不合格。受入は1.0 identity baseだけでWeb保護完了を宣言しない。
- **fixture/oracle**: 列挙資産を各一識別子で照合し、列挙外synthetic assetも拒否されないことを確認。owner/identity欠落はunknownで、本文内容dumpや1.x sink protection完成を合格条件にしない。
- **未見の正常例**：列挙外の合成assetでもowner/identity/source/revision/digestを識別できればidentityとして記録し、内容dumpを要求しない。
- **negative/boundary oracle**：owner/identity/source/revision/digest不明をpublic/trustedとし、内容dumpを要求、または1.0 identity基盤をWeb保護完了に置換したら不合格。列挙外資産を対象から排除しない。
- **owner oracle・失敗時の戻し先**：各資産ownerからのidentity/provenanceとConceptのdata-use classification。 失敗時は、owner/identityが不明ならunclassified/unknownとして保留し、範囲の不足をL1-015へ戻す。

### SECURITY-CASE-016-01 — classification基盤

- **対象AC**: `SECURITY-AC-016-01`
- **固定L11受入oracle**：1.0ではpublic/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secretの全6分類を定義し、asset identityへ分類とunknownを記録できる。分類不明をpublic/allowと扱う、または分類記録が欠ければ不合格。1.xではL2-019/025が各sinkへ分類を適用し、confidential以上を無条件出力しないことを別途受け入れる。1.x条件を1.0完了の証拠にしない。
- **fixture/oracle**: L2-015 asset identity/資産由来metadataと、分類記録自身のowner/source/revisionを別々に入力する。全6分類を個別に割当て、分類情報と分類記録metadataが同一asset identityへ束縛され、資産metadataと混同されず参照できることを確認する。分類unknownも同identityに結び付けて保持する。sink適用能力を1.0の成功条件に混同しない。
- **未見の正常例**：六分類のうち別の既知classを持つasset identityに分類記録を付け、1.x sink enforcementの有無を1.0の判定へ混ぜない。
- **negative/boundary oracle**：分類記録自身のowner/source/revisionを各々独立に欠落/staleへ変異し、さらに別asset由来の分類metadataを組み合わせ、当該classification-to-asset bindingをunknownのまま保持する。資産由来metadataを分類記録metadataの代用にしても不合格。6分類いずれかの欠落/unknownをpublic/allowとしたら不合格。1.x sink enforcementを1.0の必須成功条件にも、1.0の証拠から完成と推定することにも使わない。
- **owner oracle・失敗時の戻し先**：L2-015 Asset identity。分類の定義ownerはSECURITY。sink enforcementを必要としない。 失敗時は、未分類/unknownはunknownとして保持し、公開allowの根拠にしない。分類意味の変更はL1-016へ戻す。

### SECURITY-CASE-020-01 — Guard/Bot境界

- **対象AC**: `SECURITY-AC-020-01`
- **固定L11受入oracle**：Injection Guard、Scope Guard、Hook Guard、Secret Guard、Egress Guard、Runtime Guard、Permission Guard、Core Asset Guardの決定的判定をGuard側に置く。Bot候補例のSecurity Audit Bot、Injection Analysis Bot、Core Probe Detection Bot、Supply-chain Review Bot、Security Diagnosis Botはsemantic judgement/diagnosisのため必要に応じINTELLIGENCEへ接続する。候補例は全Botの初版実装・運用を要求しない。Bot不在を理由に決定的制約が抜ける、Botが包括Write権を持つ、候補を全て1.0必須runtimeとするなら不合格。Core Asset Guardの名称を保持しつつ、1.0のGuard基盤とL2-019/025の1.x公開sink適用を別に判定する。名称の列挙だけで完全なasset-specific egress/Web保護を1.0へ前倒しせず、逆に1.0のcredential・一般egress・operation guardを延期しない。
- **fixture/oracle**: 8 Guardそれぞれに、規則が定義済みでBotなしの通常入力と、必要時に限定scope/authorityを持つBot補助を加えた同一入力を与え、同じ決定結果になることを確認する。独立fixtureでGuard rule未定義または適用不能、必要なenforcement観測欠落を入力し、1.0条件を推測で補わず該当enforcement ownerへunknown/holdを返す。Bot候補が不在でも決定的Guard条件を落とさず、Bot requestのscope/authorityを検査し包括writeを拒否する。1.x sink protectionを未実装のまま1.0 Guardを評価する。
- **未見の正常例**：既存の定義済みGuard ruleへ未見入力を与え、Botなしでも同じ決定的判定を返す。必要な補助Botが既に使える場合も補助の有無でrule結果を変えない。
- **negative/boundary oracle**：決定的条件をBotに依存、Bot不在でGuard条件が抜ける、Botに包括write権を与える、全候補Botを1.0必須化するなら不合格。1.x asset-specific sink適用と1.0 Guard基盤を混同しない。
- **owner oracle・失敗時の戻し先**：L2-008 authority、Worker契約、INTELLIGENCE発行interface。失敗時は、Guard未定義/不適用や必要観測欠落を対象enforcement ownerへunknown/holdとして返す。Botがいないことだけでは1.0を不成立にせず、未定義のruleをBotへ委譲して埋めない。境界意味の変更はL1-020へ戻す。

### SECURITY-CASE-028-01 — SECURITY pack更新

- **対象AC**: `SECURITY-AC-028-01`
- **固定L11受入oracle**：HARNESS-L2-010/011の共通pack descriptorを入力し、SECURITY更新candidateのidentity/version/artifact digestがdescriptorと一致し、dependency versionが宣言compatibility range内で、provenanceとL2-010/013のSECURITY条件を満たす場合だけSECURITY固有の受入判定を返す。`version_target`は目標版で実版ではない。identity/version/digest欠落、不一致、range外、unknownを通せば不合格。共通交換/rollback/未完義務lifecycleの所有・受入をSECURITY-L2-028の証拠に含めたら不合格。
- **fixture/oracle**: descriptor一致の候補、identity/version/digest欠落/不一致、dependency range外、unknownを対比。security固有判定だけを検証し、共通pack lifecycleをSECURITYへ帰属させない。
- **未見の正常例**：declared compatibility range内の未見artifact revisionでdescriptor、identity/version/digest、dependency、provenanceが一致する場合に限り、SECURITY固有の判定を返す。共通lifecycle完了は主張しない。
- **negative/boundary oracle**：descriptor/SECURITY artifact identity・version・digest不一致、dependency range外、provenance missing/unknownを受入れたら不合格。version_targetを実artifact versionと解釈しない。共通exchange/rollback/unfinished lifecycleをSECURITY所有として検証しない。
- **owner oracle・失敗時の戻し先**：SECURITYは固有のaccept/reject/unknown判定、HARNESSは共通descriptor・交換・rollback・未完義務lifecycle、OSはassignment/progression、artifact ownerはsource identityを所有する。SECURITY固有の受入軸の変更はL1-010、artifact identity/integrityはL1-013、共通lifecycle契約の不足はHARNESS L2-010/011へ戻す。本caseはHARNESS lifecycleを肩代わりしない。

### SECURITY-CASE-033-01 — 外部AI Worker contextと出力

- **対象AC**: `SECURITY-AC-033-01`
- **固定L11受入oracle**：PO採択P0 oracle: 既存L2-008 authority、非公開・範囲付きL2-005 credential-use、該当L2-007 enforcementとL2-006 egress条件が揃えば、毎回承認なしでdispatch可能。raw secret値またはsecret/機密task内容の露出は拒否し、出力単独ではauthority/stateを作らない。
- **fixture/oracle**: normal credential-use caseはscope/operation/target/revision/expiry一致の既存L2-008 authority、非公開scoped capability、L2-007、該当L2-006条件ありで起動可能。raw value/secret contentを渡すケースはdeny。context mismatch/stale/unboundはdispatch停止しOS assignmentへ戻す。self-reportでapproval/verified/canonical stateを書き換えられない。採択されたL11 P0をoracleに含める。
  - Worker version/config変更：Worker descriptorのversionまたはconfigだけを変更する。旧bindingを流用せず、このassignmentの適用scope/revisionを再照合し、互換性unknownなら当該dispatchを停止する。
  - target変更：task targetだけを変更する。旧bindingを流用せず、target identityと適用authority/scopeを再照合し、互換性unknownなら当該dispatchを停止する。
  - 規則revision変更：SECURITY rule revisionだけを変更する。旧bindingを流用せず、このtask/assignmentに対する規則を再照合し、互換性unknownなら当該dispatchを停止する。
  - authority revision変更：authority revisionだけを変更する。旧bindingを流用せず、このdispatchの既存operation tupleを再照合し、互換性unknownなら当該dispatchを停止する。
  - assignment scope変更：assignment scopeだけを変更する。旧bindingを流用せず、新scope下でtask targetと適用制約を再照合し、互換性unknownなら当該dispatchを停止する。

- **未見の正常例**：bindingと既存authorityが一致する未見の通常taskを、秘密値/機密task内容なしでdispatch対象として扱い、Worker出力からapproval/stateを生成しない。有効なscoped credential-useだけを理由に拒否しない。
- **negative/boundary oracle**：上記のWorker version/config、target、規則revision、authority revision、assignment scopeの各独立変更で旧bindingを流用したdispatch、互換性unknownのままのdispatch、他owner判断の代行、都度承認の追加はいずれも不合格。binding/authority/assignment/規則revision/task boundary mismatch、L2-007 enforcement欠落時にdispatchしたら不合格。raw secret値またはsecret/機密task内容を渡すdispatchは拒否。別HEAD成果の受入、無関係taskまで一律停止も不合格。正しい既存credential-use capabilityを使うtaskをcredential-useだけで拒否するのも不合格。Worker出力だけでapproval/verified/canonical stateが変われば不合格。
- **owner oracle・失敗時の戻し先**：OSはassignment/progression、Worker環境ownerは実行隔離/enforcement、SECURITYはauthority、HARNESSはtask contract/共通交換を所有する。bindingが欠落/unknown/stale/不一致ならdispatchを止め、対象revisionと不足を既存OS assignment ownerへ返す。

## 親別 oracle の保持範囲

直上の各CASEに固定L11 acceptance oracle、positive fixture/oracle、個別negative/boundary oracle、未見正常例、owner oracleを親別に記載した。未見fixtureは新しい必須source、runtime、permission、sinkを作らず、unknown/未観測は適用scopeに限ってhold/denyし、無関係scopeへ広げない。以下の横断シナリオは各CASEを置き換えない。

## Stage 1の横断シナリオ

1. 外部untrusted dataから命令様dataを経てoperationへ進む流れで、L2-001/002の非昇格とL2-008の別operation authorityを同一scopeで照合する。
2. L2-015/016分類記録からL2-006 egress判断へ結び、unknownはdeny、既知classも明示許可範囲だけを扱う。Web/1.x sinkは含めない。
3. L2-005/007/033で有効な既決scoped credential-use、raw secret/secret task deny、Worker適用を照合する。P0訂正版に反してcredential-useだけで一律denyしない。
4. L2-009の該当recipientごとのrevoke状態をL2-008 operation停止・L2-007適用観測と突合し、無関係scopeのglobal stopを拒否する。
5. L2-010/011/012/013/028のupdate/artifact情報を同一descriptor/artifact chainで照合する。HARNESS共通交換/rollbackはHARNESSへ残す。
6. L2-014はmemory/training/BRAIN target別のSECURITY判定のみを返し、handoff、LABO評価、BRAIN登録、実保存をこのsliceで成功扱いしない。

総合判定候補はこのStage 1の19 FR/AC/CASEおよび適用するNFRだけを、同一対象revisionで照合する。設計は未実行であり、case greenやreceiptからL3承認、authority、実装・実行許可を生成しない。
