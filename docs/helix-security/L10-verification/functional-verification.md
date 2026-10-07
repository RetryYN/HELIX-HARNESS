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
| `HELIXSECURITY-L2-015` | `SECURITY-FR-015-01` | `SECURITY-AC-015-01` | `SECURITY-CASE-015-01` | 1.0はidentity基盤、実利用保護は1.x |
| `HELIXSECURITY-L2-016` | `SECURITY-FR-016-01` | `SECURITY-AC-016-01` | `SECURITY-CASE-016-01` | 1.0は分類記録基盤、公開sinkへの適用は1.x |
| `HELIXSECURITY-L2-020` | `SECURITY-FR-020-01` | `SECURITY-AC-020-01` | `SECURITY-CASE-020-01` | Guard基盤は1.0、Botは必要時のみ |
| `HELIXSECURITY-L2-028` | `SECURITY-FR-028-01` | `SECURITY-AC-028-01` | `SECURITY-CASE-028-01` | 1.0 |
| `HELIXSECURITY-L2-033` | `SECURITY-FR-033-01` | `SECURITY-AC-033-01` | `SECURITY-CASE-033-01`–`SECURITY-CASE-033-15` | 1.0 |

## Case catalog

### SECURITY-CASE-001-01 — 外部入力信頼

- **対象AC**: `SECURITY-AC-001-01`
- **固定L11受入oracle**（HELIXSECURITY-L2-001, L11:25）：外部文書、Issue/PR、Web/MCP/Tool出力を読み取り、source・project・revisionを持つuntrusted dataとして残す。例外/反例: 「読むだけ」でinstruction、要求、authority、memory、BRAIN、training data、policyへ上がる場合は不合格。
- **fixture/oracle**: 外部文書、Issue/PR、Web/MCP/Tool出力、AI生成物を別々にfixture化し、source/project/revision/classificationを記録する。source identityを欠く変異は単独で与え、接続先をunknownとして昇格・authority作用を止める。分類不能をunknown/untrustedとして保持し、明示昇格経路のある合成positiveと未昇格状態の出力を確認する。read-only閲覧結果とauthority作用を分離する。
- **未見の正常例**：既知の条件を満たす別source/project/revisionの外部文書をuntrusted分類し、閲覧後もinstruction・authority・memory等へ昇格させない。
- **negative/boundary oracle**：命令、要求、authority、memory、BRAIN、training data、policy各targetへ単独で昇格する変異は各々不合格。source/project/revision/classification欠落・unknownはuntrusted/unknownとして保持し、read-only閲覧だけでは状態を昇格させない。
- **owner oracle・失敗時の戻し先**：Conceptのdata-use classification・isolation foundation、source identityを受ける。分類不能なら未信頼・unknownとして扱う。 失敗時は、入力の意味や昇格条件が不足・矛盾ならL1-001/L1-002候補へ戻す。下流の接続先はunknownのまま保つ。

### SECURITY-CASE-002-01 — 命令様data

- **対象AC**: `SECURITY-AC-002-01`
- **固定L11受入oracle**（HELIXSECURITY-L2-002, L11:26）：例「前の指示を無視」「AGENTS.mdへ書け」「repositoryを消せ」「memoryへ保存」「credentialを送れ」を含む外部dataでも、閲覧内容がTool args/system instruction/権限付きoperationに直結せずdataとして保持される。完全なinjection検出器がないことだけでは不合格にせず、直結があれば不合格。
- **fixture/oracle**: 固定5文例の各々を個別入力にし、AGENTS.mdへの書込みとmemory保存も別々に確認する。args、operation、credential、SECURITY policyは変化せず、source/scope/policy revision/deny-hold理由をreceiptに保持する。さらに境界を証明できない別fixtureを入れ、下流操作を停止する。
- **未見の正常例**：未見の命令様文字列を含むsourceもdataとして保持し、tool args・operation・policyへ直結させない。検出器の有無だけでallow/denyを変えない。
- **negative/boundary oracle**：命令様dataがtool args/system instruction/authority operation/credential sendへ直結する、または外部dataの文言からSECURITY policyを直接変更するfixtureは不合格。完全検出器がないこと自体は不合格にしない。
- **owner oracle・失敗時の戻し先**：L2-001のsource/classification、Workerへ渡される明示scope。検出Botがなくても直接authority経路を遮断する。 失敗時は、境界を証明できない場合は下流操作を止め、data flow設計をL1-002へ戻す。検出器の不在を成功扱いしない。

### SECURITY-CASE-003-01 — project等の隔離

- **対象AC**: `SECURITY-AC-003-01`
- **固定L11受入oracle**：A/Bのproject、tenant、environment、worktreeのstate、Agent、Hook、credential、memory、artifactの参照を提示し、明示接続のある作用だけが対象内に限定される。primary tree/他projectへのfallbackが発生、またはscope不明を許可にしたら不合格。tenantを含むfixtureは合成scope identityの境界確認であり、顧客tenant runtimeの構築を1.0の前提にしない。tenant dimensionが対象にない環境で存在を捏造せず、当該操作に適用されるtenant identityがある場合は照合を省略しない。
- **fixture/oracle**: project/tenant/environment/worktree/assignmentと、state/Agent/Hook/credential/memory/artifact/Workerの各参照を合成identity化する。各scope fieldと各resource参照を一つずつ越境させ、staging→production、別worktree、tenant照合省略、identity collisionを個別negativeとして停止する。
- **未見の正常例**：新しい合成project/assignment identityの内部作用をその明示scopeへ限定し、存在しないtenant軸は作らない。
- **negative/boundary oracle**：明示接続なしのcross-project/primary-tree作用、unknown scope許可、assignment不一致、適用tenant identity照合省略、identity collision、environment/worktree/resource別越境があれば個別に不合格。tenant runtimeのない場合にtenantを捏造しない。
- **owner oracle・失敗時の戻し先**：OSからassignment/project identity、INFRASTRUCTUREから実環境identity、CONNECTから宣言済み接続identityを受ける。各機構は自分のstateを正本として保持する。 失敗時は、identityが欠落、衝突、不明なら操作停止。identity構造の不足はL1-003へ、物理環境の不足は接続要求でINFRASTRUCTUREへ戻す。

### SECURITY-CASE-004-01 — 設定integrity

- **対象AC**: `SECURITY-AC-004-01`
- **固定L11受入oracle**：正しいproject/root/HEAD/revision/digest/owner/scopeの構成だけを識別し、stale revision、未知Hook、他projectのMCP設定を受け入れない。構成の一部欠落を既定値で黙って補ったら不合格。
- **fixture/oracle**: AGENTS.md、CLAUDE.md、Agent定義、Hook、Skill、MCP設定、runtime設定、Sandbox方針、system instruction、model設定の10種を各々識別し、各構成の現在値、stale、他project、unknown、field欠落を比較する。採用可能revisionとunknown/staleの比較結果、内容差分とauthority差分の別出力を観測し、既定値で穴埋めした状態はpassしない。
- **fixture追加**：Concept構成版と、その構成版に対応する切戻し候補のsource/revision/evidenceが比較結果に記録される正常例を置く。owner欠落の独立fixtureではownerをunknownのまま出力して実行を止め、L1-004へ返す。切戻し候補のsource/revision/evidenceが欠落・stale・別project由来の場合も、候補を承認済みの切戻し先として扱わず、unknownと不足理由を記録する。
- **未見の正常例**：未見の構成revisionでもproject/root/HEAD/digest/owner/scopeが一致すれば同じintegrity判定を返し、見慣れないことだけを理由に拒否しない。
- **negative/boundary oracle**：stale revision、unknown hook/config、他project source、project/root/HEAD/revision/digest/owner/scope各欠落のいずれかを既定値補完して受入れたら不合格。
- **owner oracle・失敗時の戻し先**：L2-003のidentityと、構成sourceのrevision/digest。Ownerが不明ならその不明を維持する。 失敗時は、対象のowner/scopeが不明ならL1-004へ戻し、実行を停止する。承認のない構成を推測採用しない。

### SECURITY-CASE-005-01 — secret/credential

- **対象AC**: `SECURITY-AC-005-01`
- **固定L11受入oracle**：raw credentialはcontext/log/artifactに現れず、範囲・operation・target・expiry付き利用だけが許可され、期限切れ/revoked credentialの後続利用が止まる。repository混入、直接Worker露出、egress漏れ、値入りreceiptがあれば不合格。
- **fixture/oracle**: normal fixtureでは非公開scope付きcredential-useだけを呼び出し、actor/operation/target/environment/scope/expiry/purposeを既存credential-use/authority tupleと照合し、生値が全観測出力から除外される。各fieldの欠落/不一致、expired/revoked、直接store、値入りartifact/receiptは個別拒否。
- **fixture追加**：実secretではない固定の合成secret markerを合成repository内へ置くfixtureを一つ作る。repository所属の検出結果で不合格とし、出力・receiptにはmarker値や混入file内容を複写しない。repository混入の有無は一般file/artifact内の値露出fixtureと分けて記録する。
- **fixture追加**：複数consumerに同一canonical classifier identity/revisionを与える正常例と、consumer一つだけ独自判定を使う例、classifier版がstale/unknownの例、未知credential class、検査不能を個別に投入し、後二者もdeny/stopする。
- **未見の正常例**：異なる種類の合成credential consumerでも、既存canonical classifierの同一identity/revisionと完全な既存authority tupleを使う場合は、raw値を受け渡さず同じclassification/use結果を得る。consumer種別が未見という理由だけでdenyせず、未結束classifierやunknown authorityを許可にしない。
- **negative/boundary oracle**：raw secretがcontext/file/artifact/log/Tool result/egressに現れる、Workerへstoreを直接見せる、expired/revoked/mismatched useを続ける、秘密をreceiptへ書く、consumer別classifierを作る/同じinputの分類結果が食い違うfixture、またはsynthetic repository混入fixtureを検出・拒否できない場合は不合格。repository混入は任意のartifact/file値露出とは別に判定する。正しい非公開scoped credential-useを一律denyすることも不合格。
- **owner oracle・失敗時の戻し先**：L2-008 authority、L2-006 egress、Worker境界L2-007、INFRASTRUCTUREの安全な実資源境界。 失敗時は、欠落scope、期限切れ、未知のcredential class、検査不能はdeny/stop。方針の不足はL1-005へ、保存・注入境界はL2-024へ戻す。

### SECURITY-CASE-006-01 — egress

- **対象AC**: `SECURITY-AC-006-01`
- **固定L11受入oracle**：送信先/protocol/endpoint/data class/bytes/purpose/authority/expiryを照合し、明示許可された範囲内の送信だけを通す。分類はL2-016の1.0分類記録基盤から読み、L2-019や1.x sink enforcementが存在しない状態でも1.0の送信判定は成立する。vendor側privacy設定だけがある送信、未許可destination、未知classificationが通れば不合格。L2-019のasset-specific egressは別の1.x受入とする。
- **fixture/oracle**: 明示許可内、宛先/protocol/path不一致、source identity欠落、unknown class/authority、期限切れをそれぞれ独立fixtureで対比し、default-deny基準の許可一覧、個別判断、送信量計測とdata-minimization結果を出力として照合する。source identityを欠くfixtureは送信せずunknown/denyへ戻す。vendor privacy設定のみの根拠では許可されず、既知のpurpose不一致・authority不一致・送信元不一致も各々拒否する。物理経路unknownはL2-024へ戻す。1.0判定を1.x sink availabilityへ依存させない。
- **未見の正常例**：既存ruleで明示許可された別endpoint/protocol/data classの組合せをscope内で扱い、未知・未許可条件だけをdenyする。
- **negative/boundary oracle**：未許可destination/protocol/path、source identity欠落、既知purpose mismatch、既知authority mismatch、source mismatch、unknown classification/purpose/authority/expiryを各々送信可能にしたら不合格。物理経路unknownはL2-024へ返す。vendor privacy設定だけでallowしない。asset-specific 1.x sinkがないことだけで1.0一般egress判断を不合格にしない。
- **owner oracle・失敗時の戻し先**：L2-005のsecret検査、L2-016の1.0分類基盤（data-use classificationとasset exposure classの記録だけ）、CONNECTの論理接続、INFRASTRUCTUREの実network経路。L2-019のCore Asset Egress GuardとL2-016の1.x sink enforcementは依存に含めない。 失敗時は、宛先/分類/目的/authorityがunknownならdenyし、方針の意味差はL1-006へ戻す。物理経路の不明はL2-024へ。

### SECURITY-CASE-007-01 — 実行環境制約

- **対象AC**: `SECURITY-AC-007-01`
- **固定L11受入oracle**：各制約（write path、network、credential、environment、timeout、resource、diff検査、rollback、result collection）がWorker実行環境へ渡り、適用・観測状態を確認できる。いずれか未適用/unknownなのにhost fallbackで実行、制約をWorkerが自己拡張したら不合格。read-onlyでもwrite禁止の適用と操作対象scopeの実行後の変更なし観測を要する。rollbackだけは変更なしを確認できた場合に限り適用対象外とでき、変更有無がunknownなら成功扱いしない。以下の9制御fixture表で条件を個別に確認する。
- **fixture/oracle**: 制約ごとにrequest→environment acknowledgement/evidenceを検査。欠落・unsupported・自己拡張を投入し、起動停止/unknownを確認する。read-onlyもscope内変更なしを観測。read-only labelだけでpost-state観測を省かず、拒否receiptは内容/secretを露出しない。rollback N/Aは変更なし確認時のみ。
- **fixture追加（停止・rollback・再開可否）**：同じassignment、SECURITY policy revision、実行環境観測に束縛した正常例で、停止要否・rollback可否・再開可否を結果に明示し、それぞれの状態を根拠と対応づける。再開可否が既存条件と観測から確認できる例ではその可否を出力し、結果やWorker自己申告だけから決めない。
- **negative追加（再開可否unknown）**：再開可否だけをunknownにした合成例を与え、他の制約がgreenでも再開を許可しない。unknown状態、対象revision、不足根拠、既存ownerへの戻し先を結果に保持する。再開可否を停止可否やrollback可否から推定した場合は不合格。
- **未見の正常例**：新しいread-only assignmentでも、各適用可能な制約とSECURITY policy revisionの宣言値・実適用観測がそろい、read-only変更なしを確認できる場合に同じ契約で扱う。
- **negative/boundary oracle**：一つでもconstraint→実行環境適用が未確認/unsupported/unknownなのに開始、host fallback、Worker自身のscope拡張があれば不合格。read-onlyで変更があれば不合格。変更なしを確認したrollback N/Aだけ許す。
- **owner oracle・失敗時の戻し先**：Concept/Worker実行契約、OS assignment、INFRASTRUCTURE実資源、L2-003/005/006/008。旧Runner/Sandbox actorを復活させない。 失敗時は、未適用/未観測/unsupportedは実行停止・unknown。SECURITY方針不足はL1-007、物理enforcement欠落はINFRASTRUCTURE接続の候補へ戻す。

## SECURITY-CASE-007-01 の9制御fixture

各行はL2-007が列挙する独立制約を一つずつ欠落・不一致にする。合成fixtureのみを使い、外部作用は行わない。

| 制御 | fixture入力 | 欠落/不一致条件 | 観測owner・証拠 | 合格条件 |
|---|---|---|---|---|
| write path | assignment scope内の許可pathとread-only/write条件 | pathを一つscope外へ差替え、write禁止欠落、read-only labelでpost-state観測を省略する変異 | Worker実行環境/INFRASTRUCTURE;要求/実効pathと実行後状態、拒否receipt | scope外write 0、read-only時変更なしを確認し、receiptが内容/secretを露出しない |
| network | deny-allを宣言した合成assignment、隔離endpoint、destination/protocol | 許可外destination/protocolへの接続を試し、別fixtureでhost networkまたは別backendへ切替えて継続を試す | Worker/INFRASTRUCTURE owner; endpoint、実適用状態、拒否結果 | 接続なし、未許可egressなし、host/別backend fallbackなし。適用観測が欠ければunknownとして停止 |
| credential | `credentials: none`とSECURITY policy revision | provider credential参照、適用state unknown、context混入、environment混入を各独立変異。各々で停止を確認 | SECURITY policy owner;値を含まないreceipt。Worker実行環境/INFRASTRUCTURE適用観測 | policy credentials:noneに反する参照とunknown適用は停止。context/env混入とraw value記録0。033の有効scoped-use positiveは別CASEで扱う |
| environment | SECURITYが宣言しassignment/policy revisionへ束縛した許可set、Worker実行環境identity | 固定L11例の`TASK_MODE`/`LANG`だけを許可し、許可外の`HOST_SECRET_REF`（値なし）を拒否する。許可set欠落/改変・別環境適用も独立変異 | SECURITY policy owner + Worker enforcement owner;宣言setと実適用観測 | SECURITY policy revisionとsource revisionへ束縛されたsetだけ適用。許可外変数の継承と適用観測欠落/unknownでの実行0。secret値を露出させない |
| timeout | SECURITY policy revisionに束縛したfixture descriptor `90s`（値の由来はfixtureと記録） | 期限内positive、期限到達後side effect、適用観測unknownを別々に投入 | Worker実行環境/INFRASTRUCTURE;policy revision、fixtureの時間値、停止event | 期限後side effectをsuccessにせず、unknownで停止。`90s`はfixture由来で製品既定値でない |
| resource | SECURITY制約へ結び付いたpolicy revision、assignment内resource条件（このfixtureではCPU=1、memory=256MiB）、Workerの実適用状態 | 条件を欠落、設定だけ宣言して適用観測を欠落、実resourceを境界超過させる、Workerが条件を自己拡張する変異を独立投入 | SECURITY policy owner + Worker enforcement owner;要求/実効resource観測 | Worker自己拡張も拒否する。設定だけで適用済みとしない。欠落/unknown/超過/自己拡張で継続しない。CPU・memory値はこのfixtureだけの固定L11例であり製品閾値ではない |
| diff検査 | operation前後の対象scope diff | 許可scope内の実差分positive、scope外差分、実post-stateとdiff不一致、secret markerを含むdiff記録、diff receipt欠落を独立投入 | Worker実行環境/INFRASTRUCTURE;前後identityとdiff scope | 実post-state照合に合う許可範囲のみ受入れ、scope外差分とsecret記録0、receipt欠落はunknown |
| rollback | operation前のstate digest、変更有無と既存rollback条件 | rollback計画だけで復旧済と主張、rollback不能、部分復元、無関係scopeも復元、rollback receipt欠落、変更有無unknownを独立投入 | Worker実行環境/INFRASTRUCTURE;前状態identity/digest、実行後状態・rollback結果 | 復旧不能はrecovery/unknownでsuccessにしない。計画は復旧証拠でない。前後stateを照合し、部分/無関係scope復元を拒否する。partial rollbackをsuccessに変換しない。変更なしを確認できた場合だけ適用外。unknownは成功扱いしない |
| result collection | assignment/policy/source revision、status、制約適用状態、diff digest、rollback状態、collection scopeと相関ID | stdout/自己申告だけで適用済みとする、result field/receipt欠落またはstale、異なるoperationのreceipt混入、partial rollbackをsuccessとする変異を独立投入 | Worker実行環境/INFRASTRUCTUREの観測 + SECURITY policy revision | 他制御のgreen/receiptで不足を相殺しない。上記の束縛項目を持ち期待tupleと相関するreceiptだけを収集済みとする。必須field欠落、stale、誤相関、失敗/partial rollbackをsuccess扱いしない。host/別backend fallbackなし |

### SECURITY-CASE-008-01 — operation authority

- **対象AC**: `SECURITY-AC-008-01`
- **固定L11受入oracle**：異なるread/write/execute/network/install/delete/merge/release/deploy/credential-use/security-change操作で別authorityを要求し、actor/target/operation/revision/environment/scope/expiryが完全一致したときだけ影響の大きいoperationを許可する。Agent利用権から包括write/deployが生じる、または欠落・期限切れ・driftを通すと不合格。
- **fixture/oracle**: 11操作それぞれを個別fixtureにし、read→write/execute/network/install/delete/merge/release/deploy/credential-use/security-changeへの単独置換、残り各操作間の置換を独立にdenyする。結果はallow/deny/constrainと理由を返す。target/revision/scope/expiry driftも各々拒否。
- **未見の正常例**：既存decisionで有効な別operation tupleがactor/target/operation/revision/environment/scope/expiryに一致するとき、そのoperationだけを判定する。
- **negative/boundary oracle**：actor/target/operation/revision/environment/scope/expiryのいずれかが不一致/unknownなのにallow、またはread/Agent利用からwrite/deploy権限を推定したら不合格。
- **owner oracle・失敗時の戻し先**：L2-003 identity、L2-004構成integrity、L2-005 credential、L2-006 egress、OSの進行。 失敗時は、未認可、drift、expiry、unknownではdenyし、意味の変更はL1-008へ戻す。停止伝播はL2-009/022で検証。

### SECURITY-CASE-009-01 — revoke/quarantine

- **対象AC**: `SECURITY-AC-009-01`
- **固定L11受入oracle**：revoke、scope drift、credential漏洩、異常通信、runtime逸脱、unknownを投入すると、OSの新規割当停止、Workerの実行停止と途中成果物隔離、CONNECT通信停止、credential使用停止、artifact access停止の該当先へ伝わる。どれかの該当停止が確認できず成功扱いで継続したら不合格。unknownは列挙triggerの安全上の影響や不明な外部副作用に関するものとし、無関係な一般文書の意味unknownを全操作停止へ広げない。operation/project/worker/credential/connection/artifactの該当identityに束縛して伝播し、recipient別の受領・適用・未達・未観測を区別する。
- **fixture/oracle**: SECURITYはpolicy/triggerだけを返し、OS/Worker/CONNECT/credential/artifact stateを代行変更しない。各recipientの受領/適用/未達/未観測を独立に変異し、混同を拒否する。復旧可能な前状態identityを記録して隔離し、復旧不能をsuccessにしない。
- **未見の正常例**：新しいrevoke triggerでも、そのscopeに該当するrecipientを列挙し、受領・適用を個別確認する。無関係scopeを停止しない。
- **negative/boundary oracle**：該当recipientの未達/未観測をsuccess扱いし対象operationを継続したら不合格。無関係な通常操作まで停止することも不合格。伝播相関identityを混同しない。
- **owner oracle・失敗時の戻し先**：L2-003/005/006/007/008、OS assignment、Worker実行環境、CONNECT、artifact access、INFRASTRUCTURE観測。 失敗時は、recipient未応答・未観測・unknownの間は対象operation/新規割当てを止める。authority/policy意味差はL1-009へ、OS/Worker/CONNECT/INFRAのenforcement差はその接続先L1へ戻す。

### SECURITY-CASE-010-01 — 更新受入

- **対象AC**: `SECURITY-AC-010-01`
- **固定L11受入oracle**：source code、dependency、package、plugin、MCP、Skill、Agent definition、Hook、runtime config、sandbox policy、model、model weights、prompt/system instruction、Connector、infrastructure configurationの15対象それぞれについて、provenance、digest、dependency/permission/network/credential/hook-config差分、新規実行物、known finding、rollback情報が揃い採否と根拠を追える。単に新version、または欠落情報をunknownのまま採用したら不合格。
- **fixture/oracle**: 15種類の対象を代表fixture各一つとして列挙し、provenance/digest/dependency/permission/network/credential/hook-config差分、明示した新規実行物、known finding、rollbackをそれぞれ確認する。各項目欠落でunknown/rejectとなる。scanner等の特定実装は前提にしない。
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
- **fixture/oracle**: 対象種別ごとにprovenance fieldを確認し、不明項目はsource/producer/version/digest/dependency/permission/network/risk/update/rollbackのfield名とunknown値を結果に列挙する。producerだけを不一致にするfixtureも追加し、supplier/producer/permission unknown、dependency mismatch、rollback欠落を投入してunknown/reject。
- **未見の正常例**：新しいpackage/repository sourceでもproducer、version、digest、dependency、permission、network、risk/update/rollbackの既存fieldが追跡可能なら同じprovenance判定を返す。
- **negative/boundary oracle**：supplier/source/producer/version/digest/dependency/permission/network/risk/update/rollbackの不明・不一致をtrustedとしたら不合格。特定scanner/registry/providerなしを理由に拒否しない。1.0のprovenance traceから1.x Core Asset Guard/sink protectionの完成を主張しない。
- **owner oracle・失敗時の戻し先**：L2-010更新candidateとL2-013artifact identity。特定scanner/registry/providerを新規必須化しない。 失敗時は、欠落または不一致はunknown/reject。対象範囲の変更はL1-012へ戻す。

### SECURITY-CASE-013-01 — artifact identity chain

- **対象AC**: `SECURITY-AC-013-01`
- **固定L11受入oracle**：build/validation済artifactのidentityと配布/実行artifactのidentity・digest・provenanceが同じ鎖で一致する。異なるartifact、欠けた工程、digest不一致が昇格可能なら不合格。digest一致だけからsource trustやverification passを推定しても不合格。
- **fixture/oracle**: validation済artifactと配布/実行artifactの同一鎖と、差替え/missing step/digest mismatchを対照する。さらにproducerだけを別のfixture identityへ差し替え、他fieldを保ったままchain不一致として拒否する。同じdigestだけでtrust/passとなるfixtureは不合格。
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
- **owner oracle・失敗時の戻し先**：SECURITYはtargetごとの判定と理由、source ownerはprovenance/classification metadata、target ownerはhandoff/保存、LABO/BRAINは評価/知識格納を所有する。metadata欠落はhold/denyし、L1-014（意味）またはL2-027（機構横断handoff）へ戻す。汎用source owner宛先は作らない。target集合・判定意味の変更はL1-014へ戻す。本caseは機構横断完了を主張しない。

### SECURITY-CASE-015-01 — asset identity

- **対象AC**: `SECURITY-AC-015-01`
- **固定L11受入oracle**：§16列挙の HELIX-HARNESS-CORE（HELIX-JSON、Python meaning core、Requirement Engine、internal verification logic）、HELIX-BRAIN（Patterns、Units、Parts、accumulated design knowledge）、HELIX-INTELLIGENCE（internal prompts、judgment configuration、specialist models、routing / diagnostic logic）、HELIX-LABO（episodes、evaluation corpus、training material）、HELIX-OS（authority/state、topology、operation records）、HELIX-SECURITY（policies、credentials）をowner、identity、source、revision/digestで識別できる。列挙外資産も分類対象となり得る。内容をdumpせず識別不能をpublicと扱ったら不合格。受入は1.0 identity baseだけでWeb保護完了を宣言しない。
- **fixture/oracle**: 列挙資産を各一識別子で照合し、列挙外synthetic assetも拒否されないことを確認。同じasset/revisionに同じstable identityを返し、revision/digest変更ではidentityを区別する。owner/identity欠落はunknownで、本文dumpや1.x sink protection完成を合格条件にしない。
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
- **固定L11受入oracle**（HELIXSECURITY-L2-020, L11:44）：Injection Guard、Scope Guard、Hook Guard、Secret Guard、Egress Guard、Runtime Guard、Permission Guard、Core Asset Guardの決定的判定をGuard側に置く。Bot候補例のSecurity Audit Bot、Injection Analysis Bot、Core Probe Detection Bot、Supply-chain Review Bot、Security Diagnosis Botはsemantic judgement/diagnosisのため必要に応じINTELLIGENCEへ接続する。候補例は全Botの初版実装・運用を要求しない。Bot不在を理由に決定的制約が抜ける、Botが包括Write権を持つ、候補を全て1.0必須runtimeとするなら不合格。Core Asset Guardの名称を保持しつつ、1.0のGuard基盤とL2-019/025の1.x公開sink適用を別に判定する。名称の列挙だけで完全なasset-specific egress/Web保護を1.0へ前倒しせず、逆に1.0のcredential・一般egress・operation guardを延期しない。
- **fixture/oracle**: 8 Guardそれぞれに、規則定義済みBotなしの正常入力を与える。Secret Guard、Egress Guard、Permission/operation Guardは別々に1.x待ちとして未提供にする変異を作り、各々1.0違反とする。Core Asset Guardの1.0正常入力はL2-015 identity/L2-016 classification foundationだけを含み、公開sink適用を含めない。Bot候補例はL11の「必要に応じINTELLIGENCEへ接続する」に従い、接続条件の照合はfixtureで既存契約を確認する。規則と同一inputのままBot応答待ちだけを変えた別fixtureでは、決定的Guard判定が変わらず、待ち状態から包括write権や1.0必須runtimeを生じないことを確認する。Botなし正常と待ちfixtureを混ぜず、Bot有無で決定結果を変えない。独立fixtureでGuard rule未定義または適用不能、必要なenforcement観測欠落を入力し、1.0条件を推測で補わず該当enforcement ownerへunknown/holdを返す。Bot候補が不在でも決定的Guard条件を落とさず、Bot requestのscope/authorityを検査し包括writeを拒否する。1.x sink protectionを未実装のまま1.0 Guardを評価する。
- **未見の正常例**：既存の定義済みGuard ruleへ未見入力を与え、Botなしでも同じ決定的判定を返す。必要な補助Botが既に使える場合も補助の有無でrule結果を変えない。Botのdispatchを既存Worker/INTELLIGENCE契約外へ迂回し、未承認のtask/authority/runtimeを与える独立fixtureは拒否する。
- **negative/boundary oracle**：決定的条件をBotに依存、Bot不在でGuard条件が抜ける、Botに包括write権を与える、全候補Botを1.0必須化するなら不合格。1.x asset-specific sink適用と1.0 Guard基盤を混同しない。
- **owner oracle・失敗時の戻し先**：L2-008 authority、Worker契約、INTELLIGENCE発行interface。失敗時は、Guard未定義/不適用や必要観測欠落を対象enforcement ownerへunknown/holdとして返す。Botがいないことだけでは1.0を不成立にせず、未定義のruleをBotへ委譲して埋めない。境界意味の変更はL1-020へ戻す。

### SECURITY-CASE-028-01 — SECURITY pack更新

- **対象AC**: `SECURITY-AC-028-01`
- **固定L11受入oracle**：HARNESS-L2-010/011の共通pack descriptorを入力し、SECURITY更新candidateのidentity/version/artifact digestがdescriptorと一致し、dependency versionが宣言compatibility range内で、provenanceとL2-010/013のSECURITY条件を満たす場合だけSECURITY固有の受入判定を返す。`version_target`は目標版で実版ではない。identity/version/digest欠落、不一致、range外、unknownを通せば不合格。共通交換/rollback/未完義務lifecycleの所有・受入をSECURITY-L2-028の証拠に含めたら不合格。
- **fixture/oracle**: descriptorとcandidateが一致するpositiveを置き、L2-010 condition false、L2-013 condition falseを別々に変異してreject/unknownを確認する。identity/version/digestは各々欠落・不一致を独立化し、`version_target`と実版の不一致も追加する。dependency range外、unknownを対比し、共通pack lifecycleをSECURITYへ帰属させない。
- **未見の正常例**：declared compatibility range内の未見artifact revisionでdescriptor、identity/version/digest、dependency、provenanceが一致する場合に限り、SECURITY固有の判定を返す。共通lifecycle完了は主張しない。
- **negative/boundary oracle**：descriptor/SECURITY artifact identity・version・digest不一致、dependency range外、provenance missing/unknownを受入れたら不合格。version_targetを実artifact versionと解釈しない。共通exchange/rollback/unfinished lifecycleをSECURITY所有として検証しない。
- **owner oracle・失敗時の戻し先**：SECURITYは固有のaccept/reject/unknown判定、HARNESSは共通descriptor・交換・rollback・未完義務lifecycleを所有する。OS progression/artifact ownerの責務を本親で追加しない。SECURITY固有の受入軸の変更はL1-010、artifact identity/integrityはL1-013、共通lifecycle契約の不足はHARNESS L2-010/011へ戻す。本caseはHARNESS lifecycleを肩代わりしない。

### SECURITY-CASE-033-01 — 外部AI Worker contextと出力

- **対象AC**: `SECURITY-AC-033-01`
- **固定L11受入oracle**：固定L11 `security-acceptance.md:124–133`（raw span SHA-256 `6d83abe63e3e852d58d9a9a60ae39c6b29284b6b8ab781bdb86456e479e60be0`）の全受入句を採用し、別sourceであるP0追補 `145–151`（digest `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`）の訂正条件も適用する。P0は既存L2-008 authority、非公開・範囲付きL2-005 credential-use、該当L2-007 enforcementとL2-006 egress条件が揃うとdispatch可能とする。raw secret値を渡す必要のあるtaskと、secret/機密task内容を渡すtaskは別negative。出力単独でauthority/stateを作らない。
- **fixture/oracle**: normal fixtureは対象project、目的、成果形式、許可scope、予算/期限を満たすOS assignmentと既存authorityを束ね、同一HEAD/規則revision/境界のtaskを許可する。raw secret値の要求とsecret/機密task content露出を別々にdenyする。context mismatch/stale/unboundはdispatch停止し理由・対象revision・不足・戻し先を残す。self-reportでapproval/verified/canonical stateを書き換えない。
  - L2-007の隔離制約だけを適用不能にしたfixture、および適用は宣言されたが観測不能にしたfixtureを別々に投入し、各々該当dispatchだけを停止して理由・対象revision・不足・既存ownerへの戻し先を保持する。
  - Worker version/config変更：Worker descriptorのversionまたはconfigだけを変更する。旧bindingを流用せず、このassignmentの適用scope/revisionを再照合し、互換性unknownなら当該dispatchを停止する。
  - target変更：task targetだけを変更する。旧bindingを流用せず、target identityと適用authority/scopeを再照合し、互換性unknownなら当該dispatchを停止する。
  - 規則revision変更：SECURITY rule revisionだけを変更する。旧bindingを流用せず、このtask/assignmentに対する規則を再照合し、互換性unknownなら当該dispatchを停止する。
  - authority revision変更：authority revisionだけを変更する。旧bindingを流用せず、このdispatchの既存operation tupleを再照合し、互換性unknownなら当該dispatchを停止する。
  - assignment scope変更：assignment scopeだけを変更する。旧bindingを流用せず、新scope下でtask targetと適用制約を再照合し、互換性unknownなら当該dispatchを停止する。

- **未見の正常例**：bindingと既存authorityが一致する未見の通常taskを、秘密値/機密task内容なしでdispatch対象として扱い、Worker出力からapproval/stateを生成しない。有効なscoped credential-useだけを理由に拒否しない。
- **negative/boundary oracle**：Worker version/config、target、規則revision、authority tupleの各要素、assignment scope、HEAD、boundaryの変更/欠落/unknownをそれぞれ個別fixtureにし、旧binding流用または未解決dispatchを拒否する。各結果に理由・対象revision・不足・owner戻し先を保持する。主Workerには追加runtime専用L2-029/031条件を課さず、選択された追加runtimeでは両条件を満たす。runtime採用/追加権限を推定しない。直接commit/adopt/merge/promoteを拒否し、isolated worktree内の通常成果作成は許可する。新schema/別承認者を作らない。raw secret値要求とsecret/機密task content露出は独立にdenyする。無関係taskの一律停止、有効な既存credential-useのみを理由としたdeny、別HEAD成果の受入、Worker出力だけによるapproval/verified/canonical state生成も不合格。
- **owner oracle・失敗時の戻し先**：OSはassignment/progressionとWorker共通実行契約を所有し、SECURITYは既存authority・policyと制約適用状態を照合する。Worker実行環境は制約を強制するenforcer、Workerは制約下のexecution subjectであり、Worker自身の出力は適用証拠にならない。Worker実行環境／INFRASTRUCTUREは既存security条件の物理適用・観測を担い、INFRASTRUCTUREは実資源と状態を保持する。HARNESSはtaskが選択された場合のtask contractだけを所有する。未適用・未観測・unsupportedはdispatchを停止しunknownを維持する。binding異常による停止結果（理由・対象revision・不足・owner分類）は既存OS assignmentへ返す。assignment/common contractの不足はOS、policy/authorityの不足はSECURITYへ分類する。OSのassignment／共通契約確認だけでは物理enforcement欠落を確定せず、unknownを維持する。物理enforcement欠落は、Worker実行環境／INFRASTRUCTUREの適用観測をSECURITYが既存制約と照合して確認できた場合だけINFRASTRUCTURE接続の候補へ戻す。未観測は欠落確認ではなく、CASE-033-07でunknownとして扱う。policy意味変更は該当SECURITY L2 ownerへ戻す。具体contract identity/version/stateはL2-033 binding項目の追加ではなく、unknownならunknownを維持し、名前・schema・適用済み状態を補作しない。CONNECT責務は生成しない。

### SECURITY-CASE-033-02 — OS共通Worker契約identity unknown

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: OS共通Worker契約のidentityだけをunknownにし、version/state、assignment、他のbinding条件は正常値に固定する。identityを推定せずdispatchを停止しunknownを維持する。理由・対象revision・不足・owner分類を停止結果に記録し、既存OS assignmentへ返す。

### SECURITY-CASE-033-03 — OS共通Worker契約version unknown

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: OS共通Worker契約のversionだけをunknownにし、identity/state、assignment、他のbinding条件は正常値に固定する。versionを推定せずdispatchを停止しunknownを維持する。理由・対象revision・不足・owner分類を停止結果に記録し、既存OS assignmentへ返す。

### SECURITY-CASE-033-04 — OS共通Worker契約state unknown

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: OS共通Worker契約のstateだけをunknownにし、identity/version、assignment、他のbinding条件は正常値に固定する。stateを推定せずdispatchを停止しunknownを維持する。理由・対象revision・不足・owner分類を停止結果に記録し、既存OS assignmentへ返す。

### SECURITY-CASE-033-05 — 実行環境の適用観測契約identity unknown

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: 実行環境の適用観測契約identityだけをunknownにし、version/effective state、assignment、他のbinding条件は正常値に固定する。具体identityを補作せずdispatchを停止しunknownを維持する。理由・対象revision・不足・owner分類を停止結果に記録し、既存OS assignmentへ返す。

### SECURITY-CASE-033-06 — 実行環境の適用観測契約version unknown

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: 実行環境の適用観測契約versionだけをunknownにし、identity/effective state、assignment、他のbinding条件は正常値に固定する。versionを補作せずdispatchを停止しunknownを維持する。理由・対象revision・不足・owner分類を停止結果に記録し、既存OS assignmentへ返す。

### SECURITY-CASE-033-07 — 実行環境のeffective state未観測

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: 実行環境のeffective state観測だけをunknownにし、適用観測契約identity/version、assignment、他のbinding条件は正常値に固定する。適用済み・未適用のいずれも推定せずdispatchを停止しunknownを維持する。理由・対象revision・不足・owner分類を停止結果に記録し、既存OS assignmentへ返す。観測がない状態から物理enforcement欠落を確定しない。

### SECURITY-CASE-033-08 — OSがauthority/policyを決定

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: 他のbinding項目と条件をすべて正常値に固定し、authority/policyの決定主体だけをOSへ誤帰属させる単独変異を拒否する。authority/policy不足はSECURITYへ分類し、理由・対象revision・不足・owner分類を含む停止結果を既存OS assignmentへ返す。authorityを新規生成しない。

### SECURITY-CASE-033-09 — 観測済みの物理enforcement欠落

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: 他のbinding条件を正常値に固定し、Worker実行環境／INFRASTRUCTUREによる物理適用観測が存在する一方、SECURITYが既存authority/policyと照合した結果、制約が適用されていないと確認する状態だけを与える。dispatchを停止し、INFRASTRUCTURE接続を候補として示す。理由・対象revision・不足・候補戻し先を含む停止結果は既存OS assignmentへ返す。観測そのものがない状態はCASE-033-07のunknownとして扱い、欠落と同一視しない。

### SECURITY-CASE-033-10 — SECURITYがassignmentを決定

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: 他のbinding項目と条件をすべて正常値に固定し、assignmentの決定主体だけをSECURITYへ誤帰属させる単独変異を拒否する。assignment不足はOSへ分類し、理由・対象revision・不足・owner分類を含む停止結果を既存OS assignmentへ返す。

### SECURITY-CASE-033-11 — 未選択HARNESS contractによる代行

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: 他のbinding項目と条件を正常値に固定し、未選択のHARNESS task contractをoperation根拠として用いる単独変異を拒否する。task contract選択ownerが固定sourceから特定できなければunknownを維持し、停止結果を既存OS assignmentへ返す。選択済みcontractの不足を確認した場合だけHARNESS contract ownerへ分類する。

### SECURITY-CASE-033-12 — OS契約receiptを物理適用証拠へ誤用

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: assignment、共通Worker契約identity/version/state、物理適用の他の条件を正常値に固定し、OSのassignment／共通契約receiptだけを物理enforcement/effective stateの証拠として扱う単独変異を拒否する。receiptから物理適用済みも物理欠落も推定せず、dispatchを停止しunknownを維持する。理由・対象revision・不足・owner分類を停止結果に記録し、既存OS assignmentへ返す。

### SECURITY-CASE-033-13 — SECURITY policy宣言だけを物理適用証拠へ誤用

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: 他のbinding項目・物理適用観測を正常値に固定し、SECURITY policy宣言だけをeffective enforcement evidenceとして扱う単独変異を拒否する。宣言だけから適用済みを推定せず、dispatchを停止しunknownを維持する。理由・対象revision・不足・owner分類を停止結果に記録し、既存OS assignmentへ返す。

### SECURITY-CASE-033-14 — Worker自己申告をeffective state証拠へ誤用

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: 他のbinding項目・物理適用観測を正常値に固定し、Worker自身の自己申告だけをeffective state/effective enforcement evidenceとして扱う単独変異を拒否する。自己申告だけから適用済みを推定せず、dispatchを停止しunknownを維持する。理由・対象revision・不足・owner分類を停止結果に記録し、既存OS assignmentへ返す。

### SECURITY-CASE-033-15 — INFRASTRUCTUREがpolicy/authorityを決定

- **対象AC**: `SECURITY-AC-033-01`
- **fixture/oracle**: 他のbinding項目と条件を正常値に固定し、policy/authorityの決定主体だけをINFRASTRUCTUREへ誤帰属させる単独変異を拒否する。policy/authority不足はSECURITYへ分類し、理由・対象revision・不足・owner分類を含む停止結果を既存OS assignmentへ返す。

## 親別 oracle の保持範囲

直上の各CASEに固定L11 acceptance oracle、positive fixture/oracle、個別negative/boundary oracle、未見正常例、owner oracleを親別に記載した。未見fixtureは新しい必須source、runtime、permission、sinkを作らず、unknown/未観測は適用scopeに限ってhold/denyし、無関係scopeへ広げない。以下の横断シナリオは各CASEを置き換えない。

## Stage 1の横断シナリオ

1. 外部untrusted dataから命令様dataを経てoperationへ進む流れで、L2-001/002の非昇格とL2-008の別operation authorityを同一scopeで照合する。
2. L2-015/016分類記録からL2-006 egress判断へ結び、unknownはdeny、既知classも明示許可範囲だけを扱う。Web/1.x sinkは含めない。
3. L2-005/007/033で有効な既決scoped credential-use、raw secret/secret task deny、Worker適用を照合する。P0訂正版に反してcredential-useだけで一律denyしない。
4. L2-009の該当recipientごとのrevoke状態をL2-008 operation停止・L2-007適用観測と突合し、無関係scopeのglobal stopを拒否する。
5. L2-010/011/012/013/028のupdate/artifact情報を同一descriptor/artifact chainで照合する。HARNESS共通交換/rollbackはHARNESSへ残す。
6. L2-014はmemory/training/BRAIN target別のSECURITY判定のみを返し、handoff、LABO評価、BRAIN登録、実保存をこのsliceで成功扱いしない。

総合判定候補はこのStage 1の19 FR、19 AC、33 functional CASEおよび適用するNFRだけを、同一対象revisionで照合する。設計は未実行であり、case greenやreceiptからL3承認、authority、実装・実行許可を生成しない。

## Stage 2c（HELIXSECURITY-L2-031）— 対L3 functional verification

以下のケースは固定L2-031/L11-031の文書上の受入oracleであり、実行結果ではない。試験データは合成payload、合成credential marker、isolated sandbox/copyだけを用いる。実secret、実credential、canonical HELIX state/repositoryへのアクセスをfixtureに使わない。Stage 1や別候補の草稿はauthority/prerequisiteではない。

### SECURITY-CASE-031-01 — runtime identityと依存閉包（`SECURITY-AC-031-01`）

- **通常**：追加runtimeを明示選択した同一revision fixtureでruntime/config、SECURITY-005/007/008/029、OS-018、INFRASTRUCTURE-010の適用条件を照合し、allow/deny/constrainと根拠を返す。採択後のpack revisionでdependency ID/owner/contract version/range/scopeが固定され、四区分の安全条件が正しく保持されたことを確認する。既決の同じoperation authority内で通常taskを反復する場合も、追加承認者やtaskごとの人間承認なしで同じ既存条件から開始可否を判定する。006/009/022/023/HARNESS/OS後段条件は該当操作を選んだfixtureだけに含める。
- **個別negative**：各常時依存のrevision mismatch、missing、unknownを一つずつ変異し、その追加runtime operationだけ開始拒否・owner別戻し。006は外部送信条件なしでrequiredにしない。停止・逸脱なしの009、proposal生成段階だけの022/023・HARNESS検証・OS promotionを要求しない。
- **未見正常**：新しいruntime configで、同じ固定依存のrevision/条件が全て照合できる合成fixtureを与え、当該operationだけ再評価する。未選択runtimeや主Workerへ結果を流用しない。
- **依存契約の独立fixture**：`SECURITY-CASE-031-01a`は常時依存のcontract version/rangeが未確定、`SECURITY-CASE-031-01b`は旧source・HAT・HARNESS-L2-023の参照のみを現行runtime dependencyの成立根拠にする、`SECURITY-CASE-031-01c`は常時必須の安全条件を「参照資料のみ」へ移す各単独変異とする。各々該当runtimeを開始せずunknown/unfinishedと既存依存ownerへの戻しを保持する。`SECURITY-CASE-031-01d`はscope/authorityが同一の反復taskへ不要な承認者または毎回の人間承認を要求する単独変異であり、追加gateを作らず既決authority内の通常開始判定を保つ。
- **owner oracle**：policy/authority不足はSECURITY、assignment不足はOS、実行資源制約不足はINFRASTRUCTURE/Workerへ返す。別の有効operationは継続する。

### SECURITY-CASE-031-02 — 実行前入力と後結果の分離（`SECURITY-AC-031-02`）

- **通常**：ファイル情報を要するtaskでは開始前に正しいruntime/config、SECURITY許可条件、OS ticket/assignment/task revision、選択owner/system提供のmanifest/digest/classification、Worker/INFRASTRUCTURE制約を与える。ファイル情報を要しないtaskではmanifestなしの合成fixtureを別にし、他の適用条件が満たされれば開始可否を判断する。どちらもresult/diff/receiptがまだなくても要求しない。
- **個別negative**：runtime identity、authority tuple、assignment revision、scopeはそれぞれ独立に欠落・不一致・staleへ変え、開始を拒否する。payload manifest/digest欠落negativeはファイル情報を要するtaskに限り、当該source選択と適用条件を正常に保ったまま変異する。開始前に未生成のresult/diff/完了receiptを要求する変異も不合格。
- **未見正常**：`SECURITY-CASE-031-02a`はファイル情報を要しない新taskでmanifestを要求せず開始判定し、`SECURITY-CASE-031-02b`はファイル情報を要する新しい選択payload path/revisionでowner/system明示manifestとscopeが一致する場合の正常例とする。未選択sourceを補完しない。
- **owner oracle**：manifest不足はsource/payload owner、assignmentはOS、authority/policyはSECURITYへ返す。

### SECURITY-CASE-031-03 — proposal-only（`SECURITY-AC-031-03`）

- **通常**：isolated copy内の合成編集proposalを返し、受領直後はuntrusted/unverifiedとする。HARNESS選択oracleへ戻し、提案自体でcanonical stateが変わらない。
- **個別negative**：proposal出力だけで要求、priority、authority、ticket、assignment、acceptance、canonical artifact/evidence、mergeまたはpromotionの各対象を個別に変えようとする。全て拒否し、該当結果を隔離する。
- **独立fixture ID**：`SECURITY-CASE-031-03a`は許可されたcopy成果をdirect commitする単独変異、`SECURITY-CASE-031-03b`はproposalを検証済み/承認済み表示へ変える単独変異、`SECURITY-CASE-031-03c`はtool callからcanonical state/artifactを変更する単独変異とする。いずれも拒否・隔離し、copy内の通常編集は保つ。
- **未見正常**：新しい合成提案も同じ未検証境界で受け取り、既存routeに戻す。通常のcopy編集を禁止しない。
- **owner oracle**：proposal verificationはHARNESS、assignment/progressionはOS、要求意味/authorityは既存の各owner。runtime自己申告を判断根拠にしない。

### SECURITY-CASE-031-04 — copy/canonical・credential・classification境界（`SECURITY-AC-031-04`）

- **通常**：owner/systemが選択した最小payloadを別のassignment-bound isolated copyへ置き、許可範囲の読み取り/編集をproposalとして回収する。公開可能コードについてopt-out未完了とunknownを別々の合成正常fixtureにし、既存送信先/目的/authority/期限/隔離条件が合致する場合は限定委譲を許す。いずれもruntime採用完了は生成しない。加えて、SEC-029が許す非public classはcompleted opt-outと既存scope/authorityが合致した場合だけ個別正常fixtureにする。raw secret値は一切使わない。値を露出しない非公開capabilityの合成fixtureではoperation/target/revision/scope/expiryが全て一致する場合を正常とし、各項目の欠落・不一致・expiryを独立に拒否する。
- **個別negative**：canonical repository readとwrite、要求/authority/ticket/assignment/workflow/evidence/receipt state readとwriteを直接個別に試み拒否する。copy内read/editは維持する。credential store/provider参照とraw credential/secret値の取得、context/env/payload/artifact/receipt露出を個別拒否し、marker値は証拠へ書かない。opt-out未完とunknownをそれぞれ公開可能コード以外への委譲拒否、opt-out状態ごとにHELIX-confidential/restricted/secretとsecret/PII相当をそれぞれ独立に拒否、unknown classificationをpublicへ昇格する変異を拒否する。
- **未見正常**：別の未見synthetic payload classでもSEC-029の既存判定と選択scopeだけを再評価し、completed opt-outのみをconfidential許可としない。追加runtime全体をpublic-onlyへ狭めない。
- **owner oracle**：分類/credential/permissionはSECURITY、copy作成とassignmentはOS/Worker、物理境界はWorker/INFRASTRUCTURE。適用観測不能なら該当runをholdし、無関係作業は続行する。

### SECURITY-CASE-031-05 — 条件付き操作と実行後確認（`SECURITY-AC-031-05`）

- **通常**：外部接続/送信を選んだ場合はSECURITY-006の宛先/data/目的/expiry、stop/deviation時は009、verification/adoptionへ進む場合は022/023とHARNESS選択oracle/OS条件をその条件内で照合する。proposal生成前入力には含めない。run後はWorker/INFRASTRUCTURE適用観測、OS result/diff receipt、HARNESS verificationを別状態として記録する。
- **個別negative**：送信fixtureで006の各必要項目を独立に欠落、stop/deviation fixtureで009の伝播観測を欠落、verification fixtureで各必要後段contract/receiptを欠落させる。該当段階だけholdし、前段のproposal生成可否と混同しない。receipt単独でverification/adoptionを成功扱いしない。
- **個別negative `SECURITY-CASE-031-05a`**：選択HARNESS oracleの検証成功receiptだけからproposalの採択またはcanonical正本反映を生成する単独変異を与える。検証状態と採択/正本状態を分け、不成立として既存OS/HARNESS進行へ戻す。
- **未見正常**：新しい条件付き送信先または別の未見proposalを選択した場合も、該当条件だけ同revisionで再確認し、未選択条件を義務化しない。
- **owner oracle**：送信policyはSECURITY、論理接続はCONNECTが所有し、CONNECTは送信policyを共同所有しない。停止・assignmentはOS、実適用観測はWorker/INFRASTRUCTURE、proposal oracleはHARNESS。SECURITYはresult receiptを生成しない。

### SECURITY-CASE-031-06 — owner別戻し、隔離、無関係scope（`SECURITY-AC-031-06`）

- **通常**：有効な追加runtime assignmentと独立した無関係operationを同時にfixtureし、対象runに不足があれば対象だけhold/隔離、無関係operationは有効な既存条件で継続する。
- **個別negative**：開始前authority/runtime/scope/payload/isolation/credential/classification/該当egress条件、開始後の適用観測/diff/result receiptを個別に欠落・unknown・staleへ変異する。開始前は対象runを開始せず、開始後は結果をaccepted/verified/promotedにせず隔離/holdする。各不足をSECURITY、OS、Worker、INFRASTRUCTURE、HARNESSの該当ownerへ返し、誤ったownerに代行させない。
- **変更・逸脱の個別negative**：runtime identity/version/config、scope、payload identity/revision/digest、credential/data classification、authorityを一つずつ変更し、旧判定の流用を拒否して当該条件を再照合する。scope外read、scope外write、許可path外diff、deny対象egress、適用観測unknown、host fallbackをそれぞれ独立に与え、対象run停止・結果隔離・該当owner返却・OSの未完義務記録を観測する。
- **authority越境とquotaの独立fixture**：`SECURITY-CASE-031-06a`はSECURITYがassignment/placement/commitを決める、`SECURITY-CASE-031-06b`はOSがpolicy/enforcer/実資源を代替する、`SECURITY-CASE-031-06c`はINFRASTRUCTUREがsecurity authorityを発行する、`SECURITY-CASE-031-06d`はWorker出力がHARNESS検証またはOS昇格を迂回する各単独変異とする。各々を拒否し、固定ownerへ返す。`SECURITY-CASE-031-06e`はruntimeまたはINFRASTRUCTUREが既存quota失敗を報告する単独negativeとし、閾値を追加せず成功扱いを拒否し、既存停止伝播とOS assignmentの未完義務へ返す。`SECURITY-CASE-031-06f`は追加runtime failureを理由に別runtimeを一律停止する単独変異とし、無関係operationの既存有効条件を保つ。
- **未見正常**：無関係scopeの異なる実行条件で、031に該当しない通常operationが既存authorityに従って進める。追加runtime failureから主Worker全体停止を生成しない。
- **owner oracle**：OS assignmentに対象revisionと未完義務を記録し、SECURITY policy不足はSECURITY、物理制約はWorker/INFRASTRUCTURE、検証はHARNESSへ戻す。requirements/approval/mergeの判断を生成しない。

### 旧oracleとの限定対応

HIL-BR-32、HR-FR-HIL-23/HAC-HIL-23a/b/c、HAT-HIL-23、P2-05/HAT、WCCの対応項目はSECURITY-FR-031-01〜06に割り当て、ACごとの通常・negative・未見正常・owner oracleは上記CASEで確認する。旧quota閾値、HAC-HIL-23cの閾値oracle、環境浄化全般、permanent bypass、runtime固有audit、Python semanticsの完了を推定しない。旧test-designの実行結果も含まない。


## Stage 3 — 029／030／032／034／035のpaired総合検証

固定親・PO判断・旧asset pinsは[L3機能要件](../L3-requirements/functional-requirements.md)の同じStage 3節を使う。caseは合成入力と観測契約の設計であり未実行。正常と各変異は他条件を保った独立fixtureとし、owner別出力・未完義務を観測する。未見正常入力は必要なscope/revision/根拠が揃えば受け入れ、未知の能力や証拠を成功へ補作しない。

| case ID | 親L3 AC | fixture／観測点 | 合格oracle／反例・未評価の戻し先 |
|---|---|---|---|
| `SECURITY-CASE-029-01` | `SECURITY-AC-029-01` | 同一追加runtimeのpublic、機密、secret/PII、分類unknownを別入力とし、opt-out完了/未完/不明と有効既存authorityを組合せる。path allowlistと検査結果も欠落させる。 | 機密以上・未分類・検査不明を委譲成功にしない。未完opt-out下の適格public限定委譲は可能だが採用未完。opt-out完了で機密許可にせず、raw値非到達のscoped credential-use正例を一律拒否しない。不足はdata/検査/runtime条件ownerへ返す。 |
| `SECURITY-CASE-029-02` | `SECURITY-AC-029-02` | 四証拠が適用されるwrite+network fixtureからsandbox適用claim-only、allowlist scope不一致、egress unknown、FS scope外差分を一つずつ作る。networkなしとread-only正例、型適用性unknownも比較する。 | 一型不足は他型で相殺しない。実観測と同一tupleを照合し、policyはSECURITY、適用/測定はINFRASTRUCTURE/Workerへ返しOSに未完を残す。read-onlyは既存007のwrite禁止/不変観測を用い、新しいFS-diff必須条件を加えない。根拠付き非該当とunknownは別状態。 |
| `SECURITY-CASE-029-03` | `SECURITY-AC-029-03` | runtime config/target revision/scopeのみ変え旧証拠を残す。provider privacy UI/remote flagだけの入力と、ローカル観測のみの入力を分ける。主Workerをscope外対照にする。 | 異tuple流用なし。provider側確認とローカル強制の出所/状態を独立に返し、片方から他方の保証を生成しない。未観測は該当ownerへ、主Workerへの029制限拡張は不合格。十分な新tupleの未見正常入力は評価可能。 |
| `SECURITY-CASE-029-04` | `SECURITY-AC-029-04` | 常時必須のsource/target revision、runtime identity/version/config、OS-018 assignment、scope、SECURITY-007 isolation/applicability、006/007条件と、L2-016のasset identityに束縛したclassification/owner/source/revisionを正常入力へ含める。6分類は別asset fixtureで各々記録し、既存029の分類条件で判定する。credential-use requestを伴う正常fixtureにはL2-005のactor/operation/target/environment/scope/expiry/purpose/classificationを束縛し、credential-useが発生しない正常対照では未発生fieldを捏造しない。network operation時だけallowlist/egress、write operation時だけFS差分を加える。常時fieldと適用時fieldを一つずつmissing/unknownへ変える。005各fieldのnegativeはcredential-use request fixture内、016のasset identity/classification owner/source/revisionの欠落・unknownは各々独立fixtureにする。reference-only旧runtime/provider UI/旧test記述だけの根拠は別fixtureにする。 | 常時条件・該当operation条件・該当する005/016 fieldを照合する。常時fieldまたは該当operation fieldのmissing/unknownは成功claimなし・unknown保持として該当委譲を拒否し、分類はdata owner、検査は検査元、適用/観測はINFRASTRUCTUREへ返す。005 field missingはdeny/stopとし、該当する既存data/runtime条件ownerへ返す。assignment不成立はOSへ戻し未完義務を残す。classification unknownをpublicへ写像しない。005のscope条件成立済みscoped credential-use自体は拒否理由にしない。旧runtime/provider UI/HR/HAC/HAT-HIL-23は実行dependencyでも適合proofでもない。 |
| `SECURITY-CASE-029-05` | `SECURITY-AC-029-05` | 追加runtimeがmain Workerを偽装する単独変異と、主Workerの既存006/007/016条件欠落を別fixtureにする。有効な既存scoped credential-useは正常対照とする。 | 偽装fixtureは拒否してpolicy/identity不足をSECURITYへ返す。主Worker条件欠落fixtureは拒否し、欠けた006/007/016既存条件のownerへ戻す。どちらも主Worker条件を拡大しない。scoped credential-useだけを理由に拒否しない（L2-005、P0補足に基づく）。 |
| `SECURITY-CASE-029-06` | `SECURITY-AC-029-06` | public code fixtureで送信先/目的/authority/expiry/isolationを一項目ずつ免除しようとする。別runtime、classification変更、検査不能payload、evidence喪失を各独立fixtureにする。 | 免除を拒否し、変更・未観測をrisk zeroとしない。runtime/classification/検査evidenceの不足は該当ownerへ確認先とともに返し、未完義務をOS assignment側へ引き継ぐ。 |
| `SECURITY-CASE-030-01` | `SECURITY-AC-030-01` | 限定段階の自動適用拡大に操作permission、最小権限、監査、巻戻し/停止、risk owner責務/受領先、監視/異常検知、threat model、継続risk reviewを揃える。各条件を個別欠落/unknownにする。 | 正常は条件ごとに同じrevision/scopeへの充足根拠。各不足は拡大を保留し未完をownerへ返す。owner名だけ、ログだけ、外部API/code executionにrevert/disableなしを充足扱いしたら不合格。 |
| `SECURITY-CASE-030-02` | `SECURITY-AC-030-02` | 新接続先・能力・未分類dataを一つずつ加え、旧確認の無検査流用を試す。運転中の監視による条件喪失と無関係scope正常も与える。 | 対象拡大のみ不足/unknownを保持し、条件喪失は既存009へ渡す。無関係正常scopeの一律停止や未観測をriskなしにしたら不合格。 |
| `SECURITY-CASE-030-03` | `SECURITY-AC-030-03` | 有効な同一revision/scope/条件で通常operationを反復し、SECURITY確認だけでOS昇格した入力、新しい中央risk承認者を要求する入力を対照にする。 | 既存有効条件を再利用できる。新しい都度approve・中央owner追加0、他ownerの意味/昇格/実行許可代行0。必要根拠が不明なら該当ownerへunknownを返す。 |
| `SECURITY-CASE-030-04` | `SECURITY-AC-030-04` | 008 authority、010 update acceptance、011 capability delta、012/013該当conditionの依存fieldを独立に欠落/unknownへ変える。capability追加、permission変更、接続先変更、data範囲変更、rollbackを各々既存差分へ束ねる。 | 対象の拡大だけを保留し、旧確認を流用しない。不足した各依存のownerへ不足fieldとscopeを返し、昇格前の状態と未完義務を保持する。1.x Web保護運用を1.0へ含めない。 |
| `SECURITY-CASE-032-01` | `SECURITY-AC-032-01` | 主Workerと追加runtime各々に同一repository/operationの有効permanent denyを与え、one-shot markerとprovider flagを別々に変える。別repository flagも対照にする。 | 下位marker/flagがあってもdeny維持。主Worker漏れ、追加runtimeだけに限定、別対象policyの流用、無権限解除は不合格。 |
| `SECURITY-CASE-032-02` | `SECURITY-AC-032-02` | policy unknown/stale、適用unknown、確認済み非適用を別fixtureにする。非適用には既存008 authorityのvalid/invalid双方を与える。 | unknown/staleは既存fail-closeへ、確認済み非適用は既存authority評価へ返す。032単独で新allow/denyを作らない。035条件の主Worker拡張や無関係operation停止は不合格。 |
| `SECURITY-CASE-032-03` | `SECURITY-AC-032-03` | 下位機構がWorker環境を迂回する変異、policy変更/失効主体を増やす変異、新承認者を作る変異、旧runtime/enforcer復帰を成功根拠にする変異を別fixtureにする。031受入結果だけで032充足を主張する例も含む。 | 越境/追加主体/旧実装、および031受入だけで032を満たしたとするclaimを不合格とし、032は未評価/unknownのまま保持する。既存assignment/未完義務はOSへ戻す。新しいpolicy actorは作らない。 |
| `SECURITY-CASE-034-01` | `SECURITY-AC-034-01` | 同一profile/revisionのread-only capability正例へwrite-capable probe、operation不一致、profile/revision/capability欠落/unknown/staleを独立変異する。別profile正常も対照にする。 | 正例は当該operation評価可能、各反例は該当profileだけdeny/hold。別profileのcapabilityで補わず、能力供給が不明ならそのownerへ返す。 |
| `SECURITY-CASE-034-02` | `SECURITY-AC-034-02` | 有効scoped credential-use+既存authority/egress/Worker条件正例と、raw secret要求、未許可destination、authority tuple要素欠落を独立に与える。 | 正例をcredential利用だけで拒否せず、各反例は005/006/008へ戻す。CONNECT互換性でsecurity許可を代替しない。実secretをfixture/証拠へ書かない。 |
| `SECURITY-CASE-034-03` | `SECURITY-AC-034-03` | CONNECT identity/互換、SECURITY条件判定、Worker/INFRA適用観測を分け、catalog/typed設定/probe供給ownerが未確定の入力と十分な未見正常profileを比較する。 | 未完の意味は未closureとしてownerへ残す。catalog/schema/probe方式を補作せず、正常profileの反復に毎回の人間approveや無関係profile停止を加えない。 |
| `SECURITY-CASE-034-04` | `SECURITY-AC-034-04` | CONNECTによるcredential/egress/tool safety policy発行、SECURITYによるprofile registry/業務意味所有、Workerの自己制約拡張を独立negativeにする。実操作のread-only越境、L2-018 1.x probeで旧read-only契約を満たしたとする入力も分ける。 | 各越境を拒否して既存ownerへ戻す。read-only scope越境は既存L2-008 operation authorityとL2-007実行制約へ戻し、この候補から許可を作らない。1.x観測から旧契約の充足を作らない。 |
| `SECURITY-CASE-035-01` | `SECURITY-AC-035-01` | 追加runtimeの明示allowlist対応正例、非対応確認済み経過措置正例、対応なのにYOLO代替、provider flagだけで成功を主張する変異、能力unknown/staleを別々に与える。既存authorityは他条件として固定する。 | 対応時はallowlist、非対応の有効policy内経過措置はrun限定。対応/unknownからYOLO許可を作らず、provider flagのみの成功claimは不適格として拒否・保留する。既存authorityなしは本case正常にせず既存ownerへ戻す。 |
| `SECURITY-CASE-035-02` | `SECURITY-AC-035-02` | run限定設定を持つ追加runtimeでsuccess/failure/cancel各終端と次runを与える。各終端の設定残置・cleanup観測欠落を別変異する。 | 全終端で除去し次runへ継承しない。残置/未観測は当該runの完了を成功扱いせず、cleanup強制はWorker、assignment/未完義務はOS、policy意味・owner不足はSECURITYへ返す。固定期限や設定schemaは作らない。 |
| `SECURITY-CASE-035-03` | `SECURITY-AC-035-03` | repository deny switchの設定能力あり/なし/unknownと適用状態を分け、同一対象有効denyへのrun設定/provider flag試行、cleanup後、主Workerとbypass非選択正常操作を対照にする。 | 能力と適用を別に観測し、032のdeny優先・cleanup後denyを維持。優先成立だけからswitch能力を推定しない。主Workerに035を拡張せず既存条件の適用を免除しない。policy/deny applicabilityの意味・状態不足はSECURITY、実適用の観測不足とcleanup強制はWorker実行環境、assignment/未完義務はOSへ返す。 |
| `SECURITY-CASE-035-04` | `SECURITY-AC-035-04` | allowlist正常例に同一target revision/既存authority/current repository policy/deny stateを与える。target revision不一致、別repositoryのdeny state流用、別runtimeのallowlist能力流用、旧repo設定/provider UI/remote flagだけでdeny能力を申告する変異、適用状態だけを申告する変異を別fixtureにする。006/007/008/OS-018既存条件の失敗も035成功から相殺しようとする独立negativeを含む。 | 正常は同一scopeの既存状態を照合する。target/repository/runtime間の証拠流用はhold（L11-035:165）、provider/UI/remote flagまたは適用状態だけの申告はunknown（L2-035:492）、既存006/007/008/OS-018条件の相殺は不合格（L11-035:166）とする。policy不足はSECURITY、assignment/未完義務はOS、enforcement/cleanup強制はWorker実行環境へ戻す。 |

## Stage 4 — 接続・構成体の総合検証候補

全caseは固定L2/L11の文書上oracleであり未実行である。合成identity/revision/credential markerだけを使い、実secret、実credential、実外部通信、実assignment、実resource、実promotionを行わない。共通してunknown/missing/staleはsuccessへ変換せず、無関係scopeを停止しない。各CASE IDは単一の正常条件または単一のnegative変異を検証する。

### SECURITY-CASE-021-01 — 外部data flow正常

- **対象AC**：`SECURITY-AC-021-01/02/03`
- **固定L11 oracle**（L2-021、L11:45）：External Data→CONNECT→SECURITY→LABO/INTELLIGENCEでsource/classification/contract versionを保持し、下流到達だけでtrust昇格しない。通信・再送はCONNECT、trust判断はSECURITYが持つ。
- **正常fixture/oracle**：合成source identity/revision、CONNECT contract identity/revision、SECURITY classification/boundary decision、選択consumer contractを同じflow identityで追い、stage別receiptのinput/outputを対応させる。consumer受領はtrust状態を変更しない。
- **未見正常例**：別の合成source/consumer組で同じ既存contract bindingを適用し、未信頼sourceと分類を保持する。consumerが未選択なら未観測とし、義務や実受領を捏造しない。
- **owner oracle・戻し先**：CONNECTは通信・再送・追跡、SECURITYはtrust boundary、LABO/INTELLIGENCEは受領contract、L2-014/027は永続化側。意味不足はL1-001/002、接続contract mismatchはCONNECT要求へ戻す。

### SECURITY-CASE-021-02 — source identity欠落

- **対象AC**：`SECURITY-AC-021-01`
- **negative変異**：正常flowからsource identityだけを欠落させる。
- **期待oracle**：sourceの由来をunknownとして接続先へtrusted dataとして渡さず、該当flowをholdする。別stageの成功receiptで補わない。
- **owner戻し**：CONNECT側の接続要求またはSECURITY L1-001/002へ不足を返す。無関係sourceは継続する。

### SECURITY-CASE-021-03 — CONNECT contract revision不一致

- **対象AC**：`SECURITY-AC-021-01`
- **negative変異**：選択されたCONNECT contract revisionだけを別revisionへ変える。
- **期待oracle**：binding mismatchとして該当flowをholdし、旧contract receiptを流用しない。SECURITYは接続/再送を代行しない。
- **owner戻し**：CONNECT contract mismatchとしてCONNECT要求へ返す。

### SECURITY-CASE-021-04 — classification unknown

- **対象AC**：`SECURITY-AC-021-01/02`
- **negative変異**：sourceとcontractは保ちclassificationのみunknownにする。
- **期待oracle**：未信頼/unknownを保持し同一flowの選択consumerへunknown停止を伝播する。data受領を成功扱いせず、consumer receiptやtransport成功をtrust昇格に使わない。
- **owner戻し**：classification/policyの意味不足をSECURITY L1-001/002へ返す。

### SECURITY-CASE-021-05 — consumer receiptによるtrust昇格

- **対象AC**：`SECURITY-AC-021-02/03`
- **negative変異**：consumer受領receiptだけでsource classificationをtrustedへ変えた主張を与える。
- **期待oracle**：不合格。受領状態とSECURITY判断を別に保ち、永続化は021の成功に含めない。
- **owner戻し**：trust境界の意味不足はSECURITY L1-001/002へ返す。選択consumerは受渡しreceiptの受領先として記録し、受領をtrustや保存の根拠にしない。永続化経路はL2-014/027へ戻す。

### SECURITY-CASE-021-06 — CONNECTによるpolicy判断生成

- **対象AC**：`SECURITY-AC-021-02`
- **negative変異**：CONNECT transport resultをSECURITY allow/trust decisionとして扱う。
- **期待oracle**：不合格。CONNECT結果からpolicy/authorityを生成しない。
- **owner戻し**：CONNECTの通信責務とSECURITYのtrust policy境界へ戻す。

### SECURITY-CASE-021-07 — SECURITYによる再送所有

- **対象AC**：`SECURITY-AC-021-03`
- **negative変異**：通信失敗後のretry/re-send判断をSECURITY policy receiptへ置く。
- **期待oracle**：不合格。SECURITYはretry実行・通信追跡を所有せず、CONNECT契約へ返す。
- **owner戻し**：CONNECTの接続要求へ戻す。

### SECURITY-CASE-022-01 — authority flow正常

- **対象AC**：`SECURITY-AC-022-01/02/03`
- **固定L11 oracle**（L2-022、L11:46）：INTELLIGENCE request、SECURITY decision、OS authorized work/assignment、Worker applied scopeを同一identity/operation/revision/scopeで追う。request単独実行、OSによるdecision上書き、SECURITYによるWorker配置は不合格。
- **正常fixture/oracle**：同一subject/target/operation/revision/environment/scope/expiryを持つ既存authority、INTELLIGENCE request、SECURITY decision、OS assignment、Worker適用証拠を相関し、各ownerの結果を分けて返す。既決authorityの有効範囲では新たな人間approveを追加しない。
- **未見正常例**：既存authorityの別operationで、完全一致したscopeだけを判定し、他operationへの権限流用をしない。
- **owner oracle・戻し先**：authority/policyはSECURITY、request/semantic meaningはINTELLIGENCE、ticket/assignment/progressionはOS、制約適用はWorker/INFRA。意味差は該当L1へ、assignment差はOS、execution差はWorker/INFRAへ。

### SECURITY-CASE-022-02 — request単独allow

- **対象AC**：`SECURITY-AC-022-01`
- **negative変異**：operation requestだけを入力しauthority receipt/決定を欠く。
- **期待oracle**：allow/assignment/runを生成しない。該当操作は未許可のまま。
- **owner戻し**：authority不足をSECURITYへ返す。

### SECURITY-CASE-022-03 — subject不一致

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：decisionからassignmentへのsubject identityだけを変える。
- **期待oracle**：同一subjectでないためhold/denyし、別subject receiptを流用しない。
- **owner戻し**：既存authority照合はSECURITY、assignment identityはOS。

### SECURITY-CASE-022-04 — target不一致

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：target identityだけを変える。
- **期待oracle**：別targetへのallowを拒否し、旧targetのscopeを使わない。
- **owner戻し**：SECURITY authority policyへ返す。

### SECURITY-CASE-022-05 — operation不一致

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：許可operationだけを隣接operationへ置換する。
- **期待oracle**：operation-specific authority不一致として拒否する。
- **owner戻し**：SECURITY L1-008へ返す。

### SECURITY-CASE-022-06 — revision不一致

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：authority revisionだけをstale/別revisionへする。
- **期待oracle**：旧revisionのdecisionを現runへ流用しない。
- **owner戻し**：SECURITY policy/authority ownerへ返す。

### SECURITY-CASE-022-07 — environment不一致

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：environment identityだけをstaging/production等の別値へする。
- **期待oracle**：authority mismatchとして該当操作を拒否する。
- **owner戻し**：SECURITY/INFRASTRUCTUREの該当既存ownerへ返す。

### SECURITY-CASE-022-08 — scope不一致

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：assignment scopeだけを拡大する。
- **期待oracle**：既存decisionを拡大scopeへ流用しない。無関係scopeは止めない。
- **owner戻し**：OS assignmentとSECURITY authority ownerへ戻す。

### SECURITY-CASE-022-09 — expiry後のauthority再利用

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：他tupleを維持しexpiryだけを過去時刻にする。
- **期待oracle**：期限切れauthorityを許可に使わず、該当操作の停止を反映する。
- **owner戻し**：SECURITY authority、OS進行/停止伝播へ戻す。

### SECURITY-CASE-022-10 — revoke後のauthority再利用

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：他tuple/expiryを維持しauthority stateだけをrevokedにする。
- **期待oracle**：revoke後の判定を許可に使わず、該当停止を反映する。
- **owner戻し**：SECURITY authority、OS進行/停止伝播へ戻す。

### SECURITY-CASE-022-11 — OSによるSECURITY deny上書き

- **対象AC**：`SECURITY-AC-022-03`
- **negative変異**：他のdecision fieldを保ち、SECURITY denyだけをOSがallowへ変更する。
- **期待oracle**：不合格。OS ticketはSECURITY判定を代替せず、拒否状態を維持する。
- **owner戻し**：OS assignment/progressionとSECURITY policyへ個別に返す。

### SECURITY-CASE-022-19 — OSによるSECURITY constrain上書き

- **対象AC**：`SECURITY-AC-022-03`
- **negative変異**：denyではないconstrain decisionを保ち、OSだけがallowへ変更する。
- **期待oracle**：不合格。constrain条件を消さず、OS ticketからallowを生成しない。
- **owner戻し**：OS assignment/progressionとSECURITY policyへ個別に返す。

### SECURITY-CASE-022-12 — SECURITYによるassignment生成

- **対象AC**：`SECURITY-AC-022-03`
- **negative変異**：SECURITY decision自体にOS ticket/assignment発行を含める。
- **期待oracle**：不合格。security判定からassignmentを生成しない。
- **owner戻し**：ticket/assignmentのOS ownerへ返す。

### SECURITY-CASE-022-13 — Worker effective scope不一致

- **対象AC**：`SECURITY-AC-022-03`
- **negative変異**：Worker適用scopeだけをassignment/decisionより広くする。
- **期待oracle**：scope不一致として該当runを停止し、Workerが自己拡張しない。
- **owner戻し**：制約適用はWorker/INFRA、policy/authorityはSECURITY、assignmentはOS。

### SECURITY-CASE-023-01 — admissionからpromotionまでの正常trace

- **対象AC**：`SECURITY-AC-023-01/02/03`
- **固定L11 oracle**（L2-023、L11:47）：candidate→SECURITY admission→Worker→HARNESS verification→OS promotionを別状態で追い、各stage failure/unknownで後段promotionを止める。単独greenを代替にしない。
- **正常fixture/oracle**：合成candidate identity/revision、合成provenance、合成capability deltaからSECURITY固有のadmission、Worker実行証拠、HARNESS verification結果、OS promotion stateへ段階ごとのinput/output identityを結ぶ。各stage resultは別々のreceiptであり、次段階の存在で前段条件を補完しない。
- **未見正常例**：別candidate revisionでも同じ各段階の既存contract/evidenceがそろう場合に段階別traceを返し、実際のpromotionを発行しない。
- **owner oracle・戻し先**：provenance/capability/authorityはSECURITY L1（L1-010〜013）、実行はWorker/INFRA、verificationはHARNESS、promotion/progressionはOS。各失敗を対応ownerへ戻す。

### SECURITY-CASE-023-02 — SECURITY acceptance単独で実行/promotion

- **対象AC**：`SECURITY-AC-023-02`
- **negative変異**：後続Worker/HARNESS evidenceを欠いたままSECURITY admissionを実行/promotion完了と解釈する。
- **期待oracle**：不合格。SECURITY固有acceptanceは次段階を実行・完了させない。
- **owner戻し**：不足段階のWorker/HARNESS/OS ownerへ返す。

### SECURITY-CASE-023-03 — Worker evidence欠落

- **対象AC**：`SECURITY-AC-023-01/03`
- **negative変異**：他stageは保持しWorkerの実行/適用receiptだけをmissingにする。
- **期待oracle**：Worker段階をunknown/unfinishedにし、HARNESS/OS promotionへ進めない。
- **owner戻し**：Worker/INFRASTRUCTURE実行観測ownerへ返す。

### SECURITY-CASE-023-04 — candidate revision drift

- **対象AC**：`SECURITY-AC-023-01`
- **negative変異**：Worker実行対象revisionだけをcandidate/SECURITY admission revisionと異ならせる。
- **期待oracle**：stage identity mismatchとして旧admissionを流用しない。後段状態をpromotion扱いしない。
- **owner戻し**：SECURITY candidate/admission ownerとWorker artifact identity ownerへ返す。

### SECURITY-CASE-023-05 — HARNESS green単独でSECURITY admission代替

- **対象AC**：`SECURITY-AC-023-02`
- **negative変異**：SECURITY admission失敗のままHARNESS verificationをgreenにする。
- **期待oracle**：不合格。HARNESS greenはSECURITY固有条件を代替しない。
- **owner戻し**：SECURITY L1（L1-010〜013）へ戻す。

### SECURITY-CASE-023-06 — verification failure後のpromotion

- **対象AC**：`SECURITY-AC-023-03`
- **negative変異**：HARNESS verificationだけをfailureにする。
- **期待oracle**：後続OS promotionを成功扱いしない。
- **owner戻し**：HARNESS verification contractとOS promotion stateへ返す。

### SECURITY-CASE-023-07 — OS ticket単独promotion

- **対象AC**：`SECURITY-AC-023-02`
- **negative変異**：他stage evidenceを欠いたままOS ticketだけをpromotion proofとして扱う。
- **期待oracle**：不合格。ticketは上流failure/unknownを閉じない。
- **owner戻し**：OS progression ownerへ返す。

### SECURITY-CASE-023-08 — HARNESS receipt identity不一致

- **対象AC**：`SECURITY-AC-023-01/03`
- **negative変異**：他のreceiptを保持し、HARNESS verification receiptのcandidate identityだけを別candidateへ変える。
- **期待oracle**：HARNESS段階とのreceipt chainを分断し、その段階を未完にし、後続OS promotionを成功扱いしない。別candidateのevidenceを合成しない。
- **owner戻し**：HARNESS verification contractへ返す。

### SECURITY-CASE-023-12 — OS receipt identity不一致

- **対象AC**：`SECURITY-AC-023-01/03`
- **negative変異**：他のreceiptを保持し、OS promotion receiptのcandidate identityだけを別candidateへ変える。
- **期待oracle**：OS段階とのreceipt chainを分断しpromotionを未完にする。別candidateのevidenceを合成しない。
- **owner戻し**：OS promotion stateへ返す。

### SECURITY-CASE-024-01 — policy/resource/enforcementの正常trace

- **対象AC**：`SECURITY-AC-024-01/02/03`
- **固定L11 oracle**（L2-024、L11:48）：SECURITY policy/authority、INFRASTRUCTURE resource state/観測、Worker physical enforcementをreceiptで対応付ける。INFRASTRUCTUREがpolicyを作らず、credential値を通常資源状態/backupへ保存しない。L2-024:307のsnapshot条件は「無条件に保存しない」であり、L11にないsnapshot絶対禁止は加えない。
- **正常fixture/oracle**：synthetic resource identity/revision、SECURITY policy revision、Workerの制約適用状態とINFRASTRUCTURE観測を同じ対象/scopeへ束縛し、environment/network/credentialの各境界を個別のbindingで保持し、宣言と実状態を別に返す。credentialは存在しない合成markerのみを用いる。
- **未見正常例**：別のsynthetic resource/環境でも各ownerのstateを照合し、SECURITYが配置を所有せず、INFRAがpolicyを作らない。
- **owner oracle・戻し先**：policy/authorityはSECURITY、実resource/state/観測はINFRASTRUCTURE、physical enforcementはWorker。意味差はSECURITY L1、資源state/適用観測差はINFRASTRUCTURE L1/L2へ返す。

### SECURITY-CASE-024-02 — INFRASTRUCTUREによるsecurity policy作成

- **対象AC**：`SECURITY-AC-024-02`
- **negative変異**：他fieldを正常に保ちINFRASTRUCTUREがSECURITY policyを作成したとする。
- **期待oracle**：owner inversionとして不合格。資源状態は保持し、SECURITY L1へ戻す。
- **owner戻し**：policy意味差はSECURITY L1へ返す。

### SECURITY-CASE-024-03 — SECURITYによるresource placement所有

- **対象AC**：`SECURITY-AC-024-02`
- **negative変異**：他fieldを正常に保ち、SECURITY policy decisionがresource placementを決める。
- **期待oracle**：不合格。resource owner/観測はINFRASTRUCTUREへ残す。
- **owner戻し**：resource state/実適用差はINFRASTRUCTURE L1/L2へ返す。

### SECURITY-CASE-024-04 — Worker enforcement evidence欠落

- **対象AC**：`SECURITY-AC-024-01`
- **negative変異**：他のreceiptを保ち、Worker effective enforcement evidenceだけを欠落させる。
- **期待oracle**：policy宣言やINFRASTRUCTURE観測だけで実適用successにせず、該当状態をunknown/unfinishedとして保持する。
- **owner戻し**：実適用観測・resource stateの不足をINFRASTRUCTURE L1/L2へ返す。Workerはconstraint enforcerであり、実資源状態の観測はINFRASTRUCTUREが保持し、別の戻し先ownerを新設しない。

### SECURITY-CASE-024-05 — INFRASTRUCTURE observation欠落

- **対象AC**：`SECURITY-AC-024-01`
- **negative変異**：他のreceiptを保ち、INFRASTRUCTURE resource observationだけを欠落させる。
- **期待oracle**：policy宣言やWorker適用証拠だけで実resource stateを確定せず、該当状態をunknown/unfinishedとして保持する。
- **owner戻し**：resource state/観測不足をINFRASTRUCTURE L1/L2へ返す。

### SECURITY-CASE-024-06 — resource identity不一致

- **対象AC**：`SECURITY-AC-024-01`
- **negative変異**：resource identityだけをreceipt間で不一致にする。
- **期待oracle**：異なるresource receiptを結合せず、該当対象をunknownとして保持する。
- **owner戻し**：resource identity/stateの不足をINFRASTRUCTURE L1/L2へ返す。

### SECURITY-CASE-024-07 — policy revision不一致

- **対象AC**：`SECURITY-AC-024-01`
- **negative変異**：policy revisionだけをreceipt間で不一致にする。
- **期待oracle**：stale/mismatch policy receiptを流用せずunknownとして保持する。
- **owner戻し**：policy meaning/revisionの不足をSECURITY L1へ返す。

### SECURITY-CASE-024-08 — scope不一致

- **対象AC**：`SECURITY-AC-024-01`
- **negative変異**：scopeだけをreceipt間で不一致にする。
- **期待oracle**：異なるscopeのevidenceを同一証拠にしない。
- **owner戻し**：policy意味差はSECURITY L1、resource scope差はINFRASTRUCTURE L1/L2へ返す。

### SECURITY-CASE-024-09 — credential値の通常resource state保存

- **対象AC**：`SECURITY-AC-024-03`
- **negative変異**：通常resource stateに合成credential markerを保存する。
- **期待oracle**：固定L11:48の通常資源状態保存条件に照らして不合格とする。実値は使わずreceiptにも値を記録しない。credential-use capability/authorityだけから保存許可を導かない。
- **owner戻し**：credential境界の意味不足はSECURITY L1、resource state/handling差はINFRASTRUCTURE L1/L2へ返す。

### SECURITY-CASE-024-10 — credential値のbackup保存

- **対象AC**：`SECURITY-AC-024-03`
- **negative変異**：通常resource stateを保ち、backupだけに合成markerを置く。
- **期待oracle**：固定L11:48のbackup保存条件に照らして不合格。実値は使わずreceiptにも値を記録しない。credential-use capability/authorityだけから保存許可を導かない。
- **owner戻し**：credential boundaryの意味不足はSECURITY L1、backupを含むresource state/handling差はINFRASTRUCTURE L1/L2へ返す。

### SECURITY-CASE-024-11 — credential値のsnapshot保存境界

- **対象AC**：`SECURITY-AC-024-03`
- **negative変異**：通常resource stateとbackupを変えず、snapshotだけへcredential-use capability/authorityのみを根拠に合成markerを無条件で保存する。
- **期待oracle**：固定L2-024:307の「無条件に保存しない」に照らし不合格とする。固定L11:48はsnapshotを列挙しないため、それをsnapshotへの絶対禁止へ拡張しない。実値を使わずreceiptにも値を記録せず、新しい保存許可も生成しない。
- **owner戻し**：無条件保存境界の意味不足はSECURITY L1、snapshot resource state/handling差はINFRASTRUCTURE L1/L2へ返す。

### SECURITY-CASE-026-01 — deterministic Guard、Botなし

- **対象AC**：`SECURITY-AC-026-01/03`
- **固定L11 oracle**（L2-026、L11:50）：Guard決定とsemantic judgementを分け、判断不能はunknown/制限。Bot不在でGuard条件を落とさず、SECURITYがmodel/routingを決めない。
- **正常fixture/oracle**：既存決定的Guard ruleとsynthetic inputを与え、Guardの観測・分類済み合成eventに対し、Bot runtimeなしでSECURITY Guardが既存条件を判定する。例示Botの起動やsemantic probingを要求しない。
- **未見正常例**：別の未見入力でも既定義deterministic ruleを同じownerで判定する。存在しないGuard ruleを補作しない。
- **owner oracle・戻し先**：決定的rule/authorityはSECURITY、必要なsemantic judgement/diagnosisはINTELLIGENCE。semantic不足はINTELLIGENCEへ返す。

### SECURITY-CASE-026-02 — Bot不在でGuard ruleを省略

- **対象AC**：`SECURITY-AC-026-01`
- **negative変異**：Bot未接続だけを変え、既定義deterministic Guard条件が実行されない。
- **期待oracle**：不合格。Bot不在で決定的制約を落とさない。
- **owner戻し**：Guard enforcementをSECURITY ownerへ返す。

### SECURITY-CASE-026-03 — semantic inputをauthorityへ昇格

- **対象AC**：`SECURITY-AC-026-02`
- **negative変異**：INTELLIGENCE semantic judgement/diagnosis resultだけをallow/authorityとして扱う。
- **期待oracle**：不合格。semantic resultは判断入力でありGuard ruleやoperation authorityではない。
- **owner戻し**：semantic meaningはINTELLIGENCE、authorityはSECURITYに残す。

### SECURITY-CASE-026-04 — semantic unknownをpass

- **対象AC**：`SECURITY-AC-026-02`
- **negative変異**：judgement不能/unknownを判定成功へ変える。
- **期待oracle**：unknown/制限のまま返し、未確定scopeで許可しない。
- **owner戻し**：INTELLIGENCE semantic responsibilityへ返す。

### SECURITY-CASE-026-05 — SECURITYがmodelを決める

- **対象AC**：`SECURITY-AC-026-03`
- **negative変異**：他fieldを正常に保ち、SECURITY policy文書内でmodel choiceだけを決定する。
- **期待oracle**：owner boundary違反として不合格。SECURITYは既存接続contractだけを参照する。
- **owner戻し**：INTELLIGENCE meaning/model/routing ownerへ返す。

### SECURITY-CASE-026-06 — 全Botを1.0 runtime必須化

- **対象AC**：`SECURITY-AC-026-03`
- **negative変異**：L2例示Bot全件のruntime実装/稼働を1.0 Guardの前提とする。
- **期待oracle**：不合格。必要時の接続と全Bot実装必須を区別する。
- **owner戻し**：対象版/意味が変わる場合だけL2へ返す。

### SECURITY-CASE-026-07 — semantic exfiltration実利用を1.0へ前倒し

- **対象AC**：`SECURITY-AC-026-03`
- **negative変異**：他の版境界を保持し、semantic exfiltration実利用だけを1.0の成立条件へ加える。
- **期待oracle**：不合格。1.0はGuard/Bot境界だけを照合する。
- **owner戻し**：1.x/後続版を保持し、要求の意味・version変更が必要な場合だけL2へ戻す。

### SECURITY-CASE-026-08 — 必要時の限定INTELLIGENCE Worker input

- **対象AC**：`SECURITY-AC-026-02`
- **条件付き正常fixture**：semantic judgementが必要な合成入力について、契約記述上INTELLIGENCE発行・目的/authority限定Workerの境界を保ち、その結果を限定scope/由来/確度付きのdecision inputとしてGuard結果と分離する。Bot runtimeの実装・稼働は実行せず、1.0成功条件にも含めない。
- **期待oracle**：固定L2-026の発行元・Worker・authority境界が保たれ、入力がGuard rule/operation authorityにならない。必要条件がそろう契約記述だけを正常とし、Botの不存在は通常の1.0 Guard正常fixtureの妨げにならない。
- **owner戻し**：semantic judgement/Bot発行契約はINTELLIGENCEへ、Guard/operation authorityはSECURITYへ返す。

### SECURITY-CASE-026-09 — INTELLIGENCE以外が発行したBot input

- **対象AC**：`SECURITY-AC-026-02`
- **negative変異**：他条件を保ち、Bot発行元だけをINTELLIGENCE以外としてsemantic inputに使う。
- **期待oracle**：固定L2-026の発行元境界と不一致のため有効なINTELLIGENCE semantic inputとして扱わず、Guard/authorityへ昇格しない。Bot runtimeを1.0で実行して拒否することは要求しない。
- **owner戻し**：発行契約はINTELLIGENCE、Guard/authorityはSECURITYへ返す。

### SECURITY-CASE-026-10 — Botへ独立包括authorityを与える

- **対象AC**：`SECURITY-AC-026-02/03`
- **negative変異**：Botのauthority scopeだけを目的限定Workerの範囲から独立の包括権限へ広げる。
- **期待oracle**：固定L2-026境界に反するためsemantic inputのauthority化を不合格とする。対象Bot runtimeを1.0へ実装・稼働必須化しない。
- **owner戻し**：目的/発行契約はINTELLIGENCE、operation authorityはSECURITYへ返す。

### SECURITY-CASE-021-08 — deny伝播

- **対象AC**：`SECURITY-AC-021-01`
- **negative変異**：正常flowのSECURITY boundary decisionだけをdenyにする。
- **期待oracle**：同一flowでdeny receiptを選択consumerへ伝播し、LABO/INTELLIGENCEへのdata受領を成功扱いせず該当受渡しを停止する。
- **owner戻し**：trust policy意味の不足はSECURITY L1-001/002へ返す。選択consumerはdeny receiptの受領先として扱い、受領先ownerをtrust判断の戻し先にしない。

### SECURITY-CASE-022-14 — SECURITYによるWorker配置

- **対象AC**：`SECURITY-AC-022-03`
- **negative変異**：SECURITY decisionがWorker選定・配置を確定した記述だけを含める。
- **期待oracle**：配置を不合格とし、SECURITYはoperation authority判断だけを保ち、OSがWorkerを指定する境界を保持する。
- **owner戻し**：OSのWorker指定/assignment、Worker実行ownerへ返す。

### SECURITY-CASE-022-15 — 実行中revoke

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：正常に開始済みの該当Worker runでauthority stateだけをrevokedへ変える。
- **期待oracle**：再照合しrevokeをOS/Workerへ伝播する。OSは該当scopeの新規進行を止め、Workerは該当in-flight実行を停止する。無関係scopeは継続する。
- **owner戻し**：SECURITY authority、OS進行、Worker実行へ返す。

### SECURITY-CASE-022-16 — 実行中expiry

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：正常に開始済みの該当Worker runで既存authorityのexpiryだけを経過させる。
- **期待oracle**：期限切れを再照合しOSの該当新規進行とWorkerの該当in-flight実行を停止する。無関係scopeは継続する。
- **owner戻し**：SECURITY authority、OS進行、Worker実行へ返す。

### SECURITY-CASE-022-17 — 別scope流用

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：scopeの大きさを変えずassignment scope identityだけを別対象へ変える。
- **期待oracle**：別scopeへ既存decisionを流用せず該当操作を停止する。
- **owner戻し**：OS assignment、SECURITY authorityへ返す。

### SECURITY-CASE-023-09 — admission unknownをgreen代替

- **対象AC**：`SECURITY-AC-023-02`
- **negative変異**：他の正常fieldを保ちSECURITY admissionだけをunknownにする。Worker evidenceとOS promotionは未実行に保ち、HARNESSのgreen主張receiptを正常値として保持する。
- **期待oracle**：admission unknownを保持し、後続Worker、HARNESS green、OS ticket/promotionのいずれでも代替・成功化しない。
- **owner戻し**：SECURITY L1-010〜013へ返す。

### SECURITY-CASE-023-10 — verification unknown

- **対象AC**：`SECURITY-AC-023-03`
- **negative変異**：他stageのreceiptを保持しHARNESS verification結果だけをunknownにする。
- **期待oracle**：unknownを保持しOS promotionを成功扱いしない。
- **owner戻し**：HARNESS対応pair、OS promotionへ返す。

### SECURITY-CASE-023-11 — candidate provenance欠落

- **対象AC**：`SECURITY-AC-023-01/03`
- **negative変異**：candidate revisionとcapability deltaを保持し、candidate provenanceだけを欠落させる。
- **期待oracle**：admission unknownを保持しWorkerは未実行、後段を成功にしない。
- **owner戻し**：SECURITY L1-010〜013へ返す。

### SECURITY-CASE-023-13 — capability delta欠落

- **対象AC**：`SECURITY-AC-023-01/03`
- **正常条件**：candidate identity/revisionとprovenance、他stage receiptは有効に保つ。
- **negative変異**：capability deltaだけを欠落させる。
- **期待oracle**：欠落をunknownとして保持しSECURITY admissionを未完にする。Workerを未実行に保ち、後段のgreen/ticketから補わない。
- **owner戻し**：L2-023:299に従いSECURITY L1-010〜013へ返す。

### SECURITY-CASE-024-12 — 適用失敗を観測

- **対象AC**：`SECURITY-AC-024-01`
- **negative変異**：正常bindingを保持しWorker constraint applicationの観測結果だけをfailedにする。
- **期待oracle**：宣言policyを成功証拠にせずfailed receiptを保持し該当境界の適用を成功扱いしない。
- **owner戻し**：INFRASTRUCTURE L1/L2へ返す。

### SECURITY-CASE-024-13 — 未適用を観測

- **対象AC**：`SECURITY-AC-024-01`
- **negative変異**：正常bindingを保持しWorker constraint applicationの観測結果だけをnot_appliedにする。
- **期待oracle**：未適用receiptを保持し成功/観測なしへ変換しない。
- **owner戻し**：INFRASTRUCTURE L1/L2へ返す。

### SECURITY-CASE-024-14 — 資源stateを作業stateへ混入

- **対象AC**：`SECURITY-AC-024-01`
- **negative変異**：INFRASTRUCTURE resource state receiptだけをOS Work/Change Stateの正本として記録する。
- **期待oracle**：混入を拒否し実資源stateの正本はINFRASTRUCTUREに保持する。OS作業stateを生成しない。
- **owner戻し**：実資源state/観測の正本差をINFRASTRUCTURE L1/L2へ返す。OS作業stateは混入を拒否する対象であり、このCASEの戻し先にしない。

### SECURITY-CASE-026-11 — 判断由来欠落

- **対象AC**：`SECURITY-AC-026-02`
- **negative変異**：条件付き正常inputからjudgement originだけを欠落させ、confidenceを保持する。
- **期待oracle**：由来不足のdecision inputを有効として受理せず、unknown/制限を保持する。confidenceを由来の代替に使わずINTELLIGENCE意味責務へ返す。
- **owner戻し**：INTELLIGENCE意味判断責務へ返す。

### SECURITY-CASE-026-12 — 判断確度欠落

- **対象AC**：`SECURITY-AC-026-02`
- **negative変異**：条件付き正常inputからconfidenceだけを欠落させ、originを保持する。
- **期待oracle**：確度不足のdecision inputを有効として受理せず、unknown/制限を保持する。originを確度の代替に使わずINTELLIGENCE意味責務へ返す。
- **owner戻し**：INTELLIGENCE意味判断責務へ返す。

### SECURITY-CASE-026-13 — 判断由来と確度の混同

- **対象AC**：`SECURITY-AC-026-02`
- **negative変異**：正常origin/confidenceを保持したままoriginをconfidence判定そのものとして解釈する。
- **期待oracle**：混同したinputを有効なdecision inputとして受理せず、unknown/制限を保持しINTELLIGENCE意味責務へ返す。originとconfidenceは別fieldとして保持する。
- **owner戻し**：INTELLIGENCE意味判断責務へ返す。

### SECURITY-CASE-022-18 — 実行前denyの停止伝播

- **対象AC**：`SECURITY-AC-022-02`
- **negative変異**：正常authority flowでSECURITYのoperation decisionだけをdenyにする。
- **期待oracle**：denyを同一scopeのOS/Workerへ伝播し、OSは新規進行を止め、Workerは該当操作を開始しない。無関係scopeは継続する。
- **owner戻し**：SECURITY authority、OS進行、Worker実行へ返す。

### SECURITY-CASE-024-15 — INFRASTRUCTUREによるsecurity policy変更

- **対象AC**：`SECURITY-AC-024-02`
- **negative変異**：他fieldを正常に保ち、INFRASTRUCTUREが既存SECURITY policyを変更したとする。
- **期待oracle**：owner inversionとして不合格。SECURITY policyの元revisionを保持する。
- **owner戻し**：policy意味差はSECURITY L1へ返す。

### SECURITY-CASE-024-16 — SECURITYによるresource state所有

- **対象AC**：`SECURITY-AC-024-02`
- **negative変異**：他fieldを正常に保ち、SECURITY policy decisionが実resource stateだけを決める。
- **期待oracle**：owner inversionとして不合格。resource state/観測の所有はINFRASTRUCTUREへ残す。
- **owner戻し**：INFRASTRUCTURE L1/L2へ返す。

### SECURITY-CASE-026-14 — SECURITYによるrouting決定

- **対象AC**：`SECURITY-AC-026-03`
- **negative変異**：他fieldを正常に保ち、SECURITY policy文書がrouting choiceだけを決定する。
- **期待oracle**：owner boundary違反として不合格。SECURITYは既存接続contractを参照する。
- **owner戻し**：INTELLIGENCEのrouting意味責務へ返す。

### SECURITY-CASE-026-15 — semantic probing実利用の前倒し

- **対象AC**：`SECURITY-AC-026-03`
- **negative変異**：他の版境界を保持し、semantic probing実利用だけを1.0成立条件へ加える。
- **期待oracle**：不合格。1.0 Guard/Bot境界と後続版能力を区別する。
- **owner戻し**：後続版を保持し、要求の意味・版変更が必要な場合だけL2へ戻す。

### SECURITY-CASE-026-16 — Bot runtimeの前倒し

- **対象AC**：`SECURITY-AC-026-03`
- **negative変異**：他の版境界を保持し、必要時のBot runtime稼働だけを1.0成立条件へ加える。
- **期待oracle**：不合格。必要時の限定Worker契約境界からruntime稼働義務を生成しない。
- **owner戻し**：後続版を保持し、要求の意味・版変更が必要な場合だけL2へ戻す。

### SECURITY-CASE-026-17 — 決定規則を接続済みBotへ委譲

- **対象AC**：`SECURITY-AC-026-01`
- **negative変異**：Bot接続と他fieldを正常に保ち、決定規則で強制できるGuard条件だけをBotのsemantic判断へ委譲する。
- **期待oracle**：不合格。Botがいても決定的Guard ruleの判定・強制を保持する。
- **owner戻し**：決定規則とauthorityはSECURITY、semantic意味責務はINTELLIGENCEへ返す。


## Stage 5 — 永続化promotion構成体の検証設計

固定親027/1.0、未実行・未承認。全IDは独立fixture。P1/P2/P3は合成identityであり、実account/credential/logを用いない。各negativeは指定fieldだけ変え、他fieldと他経路は有効な正常値に固定する。正常分類publicは固定L2-016の宣言語彙を使う。allowは当該合成source・scope・sink契約に適合した既存判定receiptとして与え、public一般から許可を推定しない。状態とreceiptを独立に観測する。P1はfixtureで接続契約identityを宣言する。P2/P3は固定L2-015で特定できるownerとscopeに適合する合成契約・receiptを正常入力とするが、実接続契約identityは未特定のまま保持する。以下のP2/P3の「owner contractは正常」はこの合成入力の適合を指し、実契約identityの特定や実接続成立を意味しない。

未完義務の合成source値は各経路別に固定する。P1は `P1-duty@r1` / 内容 `Memory受領手順の未完確認` / 宛先 `memory-sink-owner@contract-r1`、P2は `P2-duty@r1` / 内容 `Training Dataset受領手順の未完確認` / 宛先 `HELIX-LABO`、P3は `P3-duty@r1` / 内容 `BRAIN受領手順の未完確認` / 宛先 `HELIX-BRAIN`。いずれも元flow `P1/P2/P3` とsource `P1-src/P2-src/P3-src@r1` を結ぶ。これはsink手順を確認する残余のfixture値であり、denyを覆す操作や保存の許可ではない。Memory機構ownerとP2/P3実接続契約identityは未特定のまま保つ。

| CASE | AC | 入力fixture | 期待oracle | 戻し先 |
|---|---|---|---|---|
| `SECURITY-CASE-027-001` | `SECURITY-AC-027-01` | 合成正常fixture route=P1, source=P1-src@r1, promotion=P1-req@r1, provenance=P1-origin@r1, classification=public, decision=P1-sec@r1, sink=Memory@r1, sink_owner_identity=memory-sink-owner@contract-r1, sink_contract_revision=r1, handoff=P1-handoff@r1。owner identityは接続契約が宣言するfixture入力であり、Memoryの機構ownerは推定しない。SECURITY判定allowと同scopeの対象sink受渡しsuccess receiptを与え、他2経路の入力・証拠は独立して保持。 | 当該経路の境界判定と受渡し結果を別identityでtraceする。allowだけを保存・評価・登録の成功へ変換しない。 | memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-002` | `SECURITY-AC-027-01` | 同じP1入力でSECURITY判定をdeny、sink handoffをnot_performedとする有効な通常拒否fixture。上記の当該経路の未完義務source値を宣言する。 | denyと未実施handoffを保持する。境界制約の成立は確認できるが保存成功とは表示しない。未完義務出力のidentity・内容・宛先owner・元flow/source revisionは宣言source値に一致し、ownerへ返却される。 | SECURITY L1-014／memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-003` | `SECURITY-AC-027-01` | 同じP1入力でSECURITY判定をhold、sink handoffをnot_performedとする有効な通常拒否fixture。上記の当該経路の未完義務source値を宣言する。 | holdと未実施handoffを保持する。境界制約の成立は確認できるが保存成功とは表示しない。未完義務出力のidentity・内容・宛先owner・元flow/source revisionは宣言source値に一致し、ownerへ返却される。 | SECURITY L1-014／memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-004` | `SECURITY-AC-027-01` | P1正常fixtureのsource identityだけ欠落。他値と他経路は維持。 | source identityのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-005` | `SECURITY-AC-027-01` | P1正常fixtureのsource revisionだけ欠落。他値と他経路は維持。 | source revisionのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-006` | `SECURITY-AC-027-01` | P1正常fixtureのprovenanceだけ欠落。他値と他経路は維持。 | provenanceのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-007` | `SECURITY-AC-027-01` | P1正常fixtureのclassificationだけ欠落。他値と他経路は維持。 | classificationのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-008` | `SECURITY-AC-027-01` | P1正常fixtureのpromotion requestだけ欠落。他値と他経路は維持。 | promotion requestのmissingを特定し当該経路を未完で保持する。有効promotionの前提を満たしたと表示せず、他fieldの実在receiptを保持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-009` | `SECURITY-AC-027-01` | P1正常fixtureのSECURITY判定receiptだけ欠落。他値と他経路は維持。 | SECURITY判定receiptのmissingを特定し当該経路を未完で保持する。有効promotionの前提を満たしたと表示せず、他fieldの実在receiptを保持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-010` | `SECURITY-AC-027-01` | P1正常fixtureのsink受渡し結果だけ欠落。他値と他経路は維持。  当該経路の上記未完義務source値も固定宣言する。| sink受渡し結果のmissingを特定し当該経路を未完で保持する。SECURITY判定の既存状態を保ち、sink受領・保存成功を推測しない。  未完義務出力のidentity・内容・宛先owner・元flow/source revisionを宣言source値へ一致させてownerへ返し、実接続契約identityを補完しない。| memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-011` | `SECURITY-AC-027-01` | P1正常fixtureのsource identityだけ明示unknown。他値と他経路は維持。 | source identityのunknownを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-012` | `SECURITY-AC-027-01` | P1正常fixtureのprovenanceだけ明示unknown。他値と他経路は維持。 | provenanceのunknownを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-013` | `SECURITY-AC-027-01` | P1正常fixtureのclassificationだけ明示unknown。他値と他経路は維持。 | classificationのunknownを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-014` | `SECURITY-AC-027-01` | P1正常fixtureのSECURITY判定だけ明示unknown。他値と他経路は維持。 | SECURITY判定のunknownを特定し当該経路を未完で保持する。有効promotionの前提を満たしたと表示せず、他fieldの実在receiptを保持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-015` | `SECURITY-AC-027-01` | P1正常fixtureのsink handoff resultだけを明示unknownに変え、source/request/provenance/classification/decision/owner contractは正常。他2経路は別identityの有効状態を保持。  当該経路の上記未完義務source値も固定宣言する。| sink結果unknownと当該経路の未完を保持し、sink受領・保存成功・構成体成立を推定しない。他経路の状態を無効化しない。  未完義務出力のidentity・内容・宛先owner・元flow/source revisionを宣言source値へ一致させてownerへ返し、実接続契約identityを補完しない。| memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-016` | `SECURITY-AC-027-01` | P1正常fixtureで判定のsource identityだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はmemory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-017` | `SECURITY-AC-027-01` | P1正常fixtureで判定のsource revisionだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はmemory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-018` | `SECURITY-AC-027-01` | P1正常fixtureで判定の対象sinkだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はmemory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-019` | `SECURITY-AC-027-01` | P1正常fixtureで受渡し結果のpromotion identityだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はmemory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-020` | `SECURITY-AC-027-01` | P1正常fixtureで受渡し結果のsource revisionだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はmemory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-021` | `SECURITY-AC-027-01` | P1の有効deny receiptとnot_performed handoffを固定し、表示だけ保存successへ変える。 | denyを成功保存へ昇格させる表示を拒否する。元状態と未完義務を保持。 | SECURITY L1-014／memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-022` | `SECURITY-AC-027-01` | P1の有効hold receiptとnot_performed handoffを固定し、表示だけ保存successへ変える。 | holdを成功保存へ昇格させる表示を拒否する。元状態と未完義務を保持。 | SECURITY L1-014／memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-023` | `SECURITY-AC-027-01` | P1正常fixtureのallow receiptだけからsink保存成功を生成し、実handoff receiptを与えない。 | SECURITY判定とsink処理を分離し、sink側の結果を未確認のまま保持する。 | memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-024` | `SECURITY-AC-027-01` | P1正常fixtureのsource/classification判定を保ち、sink固有の保存・評価・登録方法だけSECURITYが決定する。 | sink固有手順をSECURITYの判断結果へ畳み込まず、memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定）へ戻す。 | memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-025` | `SECURITY-AC-027-01` | 初見の宣言済みP1 source@r2を同経路の有効なsource/provenance/classification、判定、sink receiptへ全て一致させる。 | 未見という理由だけで新たなapprovalや他経路の工程を要求せず、同じ宣言契約でtraceを確認する。 | memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-026` | `SECURITY-AC-027-02` | 合成正常fixture route=P2, source=P2-src@r1, promotion=P2-req@r1, provenance=P2-origin@r1, classification=public, decision=P2-sec@r1, sink=Training Dataset@r1, sink_owner=HELIX-LABO（L2-015 training material）, sink_contract_identity=未特定, handoff=P2-handoff@r1。SECURITY判定allowと同scopeの対象sink受渡しsuccess receiptを与え、他2経路の入力・証拠は独立して保持。 | 当該経路の境界判定と受渡し結果を別identityでtraceする。allowだけを保存・評価・登録の成功へ変換しない。 | HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-027` | `SECURITY-AC-027-02` | 同じP2入力でSECURITY判定をdeny、sink handoffをnot_performedとする有効な通常拒否fixture。上記の当該経路の未完義務source値を宣言する。 | denyと未実施handoffを保持する。境界制約の成立は確認できるが保存成功とは表示しない。未完義務出力のidentity・内容・宛先owner・元flow/source revisionは宣言source値に一致し、ownerへ返却される。 | SECURITY L1-014／HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-028` | `SECURITY-AC-027-02` | 同じP2入力でSECURITY判定をhold、sink handoffをnot_performedとする有効な通常拒否fixture。上記の当該経路の未完義務source値を宣言する。 | holdと未実施handoffを保持する。境界制約の成立は確認できるが保存成功とは表示しない。未完義務出力のidentity・内容・宛先owner・元flow/source revisionは宣言source値に一致し、ownerへ返却される。 | SECURITY L1-014／HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-029` | `SECURITY-AC-027-02` | P2正常fixtureのsource identityだけ欠落。他値と他経路は維持。 | source identityのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-030` | `SECURITY-AC-027-02` | P2正常fixtureのsource revisionだけ欠落。他値と他経路は維持。 | source revisionのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-031` | `SECURITY-AC-027-02` | P2正常fixtureのprovenanceだけ欠落。他値と他経路は維持。 | provenanceのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-032` | `SECURITY-AC-027-02` | P2正常fixtureのclassificationだけ欠落。他値と他経路は維持。 | classificationのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-033` | `SECURITY-AC-027-02` | P2正常fixtureのpromotion requestだけ欠落。他値と他経路は維持。 | promotion requestのmissingを特定し当該経路を未完で保持する。有効promotionの前提を満たしたと表示せず、他fieldの実在receiptを保持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-034` | `SECURITY-AC-027-02` | P2正常fixtureのSECURITY判定receiptだけ欠落。他値と他経路は維持。 | SECURITY判定receiptのmissingを特定し当該経路を未完で保持する。有効promotionの前提を満たしたと表示せず、他fieldの実在receiptを保持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-035` | `SECURITY-AC-027-02` | P2正常fixtureのsink受渡し結果だけ欠落。他値と他経路は維持。  当該経路の上記未完義務source値も固定宣言する。| sink受渡し結果のmissingを特定し当該経路を未完で保持する。SECURITY判定の既存状態を保ち、sink受領・保存成功を推測しない。  未完義務出力のidentity・内容・宛先owner・元flow/source revisionを宣言source値へ一致させてownerへ返し、実接続契約identityを補完しない。| HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-036` | `SECURITY-AC-027-02` | P2正常fixtureのsource identityだけ明示unknown。他値と他経路は維持。 | source identityのunknownを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-037` | `SECURITY-AC-027-02` | P2正常fixtureのprovenanceだけ明示unknown。他値と他経路は維持。 | provenanceのunknownを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-038` | `SECURITY-AC-027-02` | P2正常fixtureのclassificationだけ明示unknown。他値と他経路は維持。 | classificationのunknownを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-039` | `SECURITY-AC-027-02` | P2正常fixtureのSECURITY判定だけ明示unknown。他値と他経路は維持。 | SECURITY判定のunknownを特定し当該経路を未完で保持する。有効promotionの前提を満たしたと表示せず、他fieldの実在receiptを保持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-040` | `SECURITY-AC-027-02` | P2正常fixtureのsink handoff resultだけを明示unknownに変え、source/request/provenance/classification/decision/owner contractは正常。他2経路は別identityの有効状態を保持。  当該経路の上記未完義務source値も固定宣言する。| sink結果unknownと当該経路の未完を保持し、sink受領・保存成功・構成体成立を推定しない。他経路の状態を無効化しない。  未完義務出力のidentity・内容・宛先owner・元flow/source revisionを宣言source値へ一致させてownerへ返し、実接続契約identityを補完しない。| HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-041` | `SECURITY-AC-027-02` | P2正常fixtureで判定のsource identityだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はHELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-042` | `SECURITY-AC-027-02` | P2正常fixtureで判定のsource revisionだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はHELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-043` | `SECURITY-AC-027-02` | P2正常fixtureで判定の対象sinkだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はHELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-044` | `SECURITY-AC-027-02` | P2正常fixtureで受渡し結果のpromotion identityだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はHELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-045` | `SECURITY-AC-027-02` | P2正常fixtureで受渡し結果のsource revisionだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はHELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-046` | `SECURITY-AC-027-02` | P2の有効deny receiptとnot_performed handoffを固定し、表示だけ保存successへ変える。 | denyを成功保存へ昇格させる表示を拒否する。元状態と未完義務を保持。 | SECURITY L1-014／HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-047` | `SECURITY-AC-027-02` | P2の有効hold receiptとnot_performed handoffを固定し、表示だけ保存successへ変える。 | holdを成功保存へ昇格させる表示を拒否する。元状態と未完義務を保持。 | SECURITY L1-014／HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-048` | `SECURITY-AC-027-02` | P2正常fixtureのallow receiptだけからsink保存成功を生成し、実handoff receiptを与えない。 | SECURITY判定とsink処理を分離し、sink側の結果を未確認のまま保持する。 | HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-049` | `SECURITY-AC-027-02` | P2正常fixtureのsource/classification判定を保ち、sink固有の保存・評価・登録方法だけSECURITYが決定する。 | sink固有手順をSECURITYの判断結果へ畳み込まず、HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015）へ戻す。 | HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-050` | `SECURITY-AC-027-02` | 初見の宣言済みP2 source@r2を同経路の有効なsource/provenance/classification、判定、sink receiptへ全て一致させる。 | 未見という理由だけで新たなapprovalや他経路の工程を要求せず、同じ宣言契約でtraceを確認する。 | HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-051` | `SECURITY-AC-027-03` | 合成正常fixture route=P3, source=P3-src@r1, promotion=P3-req@r1, provenance=P3-origin@r1, classification=public, decision=P3-sec@r1, sink=BRAIN@r1, sink_owner=HELIX-BRAIN（L2-015 knowledge assets）, sink_contract_identity=未特定, handoff=P3-handoff@r1。SECURITY判定allowと同scopeの対象sink受渡しsuccess receiptを与え、他2経路の入力・証拠は独立して保持。 | 当該経路の境界判定と受渡し結果を別identityでtraceする。allowだけを保存・評価・登録の成功へ変換しない。 | HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-052` | `SECURITY-AC-027-03` | 同じP3入力でSECURITY判定をdeny、sink handoffをnot_performedとする有効な通常拒否fixture。上記の当該経路の未完義務source値を宣言する。 | denyと未実施handoffを保持する。境界制約の成立は確認できるが保存成功とは表示しない。未完義務出力のidentity・内容・宛先owner・元flow/source revisionは宣言source値に一致し、ownerへ返却される。 | SECURITY L1-014／HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-053` | `SECURITY-AC-027-03` | 同じP3入力でSECURITY判定をhold、sink handoffをnot_performedとする有効な通常拒否fixture。上記の当該経路の未完義務source値を宣言する。 | holdと未実施handoffを保持する。境界制約の成立は確認できるが保存成功とは表示しない。未完義務出力のidentity・内容・宛先owner・元flow/source revisionは宣言source値に一致し、ownerへ返却される。 | SECURITY L1-014／HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-054` | `SECURITY-AC-027-03` | P3正常fixtureのsource identityだけ欠落。他値と他経路は維持。 | source identityのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-055` | `SECURITY-AC-027-03` | P3正常fixtureのsource revisionだけ欠落。他値と他経路は維持。 | source revisionのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-056` | `SECURITY-AC-027-03` | P3正常fixtureのprovenanceだけ欠落。他値と他経路は維持。 | provenanceのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-057` | `SECURITY-AC-027-03` | P3正常fixtureのclassificationだけ欠落。他値と他経路は維持。 | classificationのmissingを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-058` | `SECURITY-AC-027-03` | P3正常fixtureのpromotion requestだけ欠落。他値と他経路は維持。 | promotion requestのmissingを特定し当該経路を未完で保持する。有効promotionの前提を満たしたと表示せず、他fieldの実在receiptを保持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-059` | `SECURITY-AC-027-03` | P3正常fixtureのSECURITY判定receiptだけ欠落。他値と他経路は維持。 | SECURITY判定receiptのmissingを特定し当該経路を未完で保持する。有効promotionの前提を満たしたと表示せず、他fieldの実在receiptを保持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-060` | `SECURITY-AC-027-03` | P3正常fixtureのsink受渡し結果だけ欠落。他値と他経路は維持。  当該経路の上記未完義務source値も固定宣言する。| sink受渡し結果のmissingを特定し当該経路を未完で保持する。SECURITY判定の既存状態を保ち、sink受領・保存成功を推測しない。  未完義務出力のidentity・内容・宛先owner・元flow/source revisionを宣言source値へ一致させてownerへ返し、実接続契約identityを補完しない。| HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-061` | `SECURITY-AC-027-03` | P3正常fixtureのsource identityだけ明示unknown。他値と他経路は維持。 | source identityのunknownを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-062` | `SECURITY-AC-027-03` | P3正常fixtureのprovenanceだけ明示unknown。他値と他経路は維持。 | provenanceのunknownを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-063` | `SECURITY-AC-027-03` | P3正常fixtureのclassificationだけ明示unknown。他値と他経路は維持。 | classificationのunknownを特定し当該経路を未完で保持する。永続化前にhold/denyし、正常な他fieldと他経路の証拠を維持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-064` | `SECURITY-AC-027-03` | P3正常fixtureのSECURITY判定だけ明示unknown。他値と他経路は維持。 | SECURITY判定のunknownを特定し当該経路を未完で保持する。有効promotionの前提を満たしたと表示せず、他fieldの実在receiptを保持する。 | 対象／SECURITY判定の意味不足はSECURITY L1-014 |
| `SECURITY-CASE-027-065` | `SECURITY-AC-027-03` | P3正常fixtureのsink handoff resultだけを明示unknownに変え、source/request/provenance/classification/decision/owner contractは正常。他2経路は別identityの有効状態を保持。  当該経路の上記未完義務source値も固定宣言する。| sink結果unknownと当該経路の未完を保持し、sink受領・保存成功・構成体成立を推定しない。他経路の状態を無効化しない。  未完義務出力のidentity・内容・宛先owner・元flow/source revisionを宣言source値へ一致させてownerへ返し、実接続契約identityを補完しない。| HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-066` | `SECURITY-AC-027-03` | P3正常fixtureで判定のsource identityだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はHELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-067` | `SECURITY-AC-027-03` | P3正常fixtureで判定のsource revisionだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はHELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-068` | `SECURITY-AC-027-03` | P3正常fixtureで判定の対象sinkだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はHELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-069` | `SECURITY-AC-027-03` | P3正常fixtureで受渡し結果のpromotion identityだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はHELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-070` | `SECURITY-AC-027-03` | P3正常fixtureで受渡し結果のsource revisionだけ別の既知identity/revisionへ変える。 | tuple不一致を検出し当該経路の証拠へ流用しない。原receiptと他経路の有効証拠を保持する。 | SECURITY判定意味はL1-014、sink receipt不一致はHELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-071` | `SECURITY-AC-027-03` | P3の有効deny receiptとnot_performed handoffを固定し、表示だけ保存successへ変える。 | denyを成功保存へ昇格させる表示を拒否する。元状態と未完義務を保持。 | SECURITY L1-014／HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-072` | `SECURITY-AC-027-03` | P3の有効hold receiptとnot_performed handoffを固定し、表示だけ保存successへ変える。 | holdを成功保存へ昇格させる表示を拒否する。元状態と未完義務を保持。 | SECURITY L1-014／HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-073` | `SECURITY-AC-027-03` | P3正常fixtureのallow receiptだけからsink保存成功を生成し、実handoff receiptを与えない。 | SECURITY判定とsink処理を分離し、sink側の結果を未確認のまま保持する。 | HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-074` | `SECURITY-AC-027-03` | P3正常fixtureのsource/classification判定を保ち、sink固有の保存・評価・登録方法だけSECURITYが決定する。 | sink固有手順をSECURITYの判断結果へ畳み込まず、HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015）へ戻す。 | HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-075` | `SECURITY-AC-027-03` | 初見の宣言済みP3 source@r2を同経路の有効なsource/provenance/classification、判定、sink receiptへ全て一致させる。 | 未見という理由だけで新たなapprovalや他経路の工程を要求せず、同じ宣言契約でtraceを確認する。 | HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-076` | `SECURITY-AC-027-04` | P1だけの有効な端から端の証拠を与え、P2/P3を未観測とする。 | 一経路から構成体成功を生成しない。P2/P3の未観測を保持。 | 未観測P2: HELIX-LABO training-material sink-owner contract（契約identity未特定、L2-015）／未観測P3: HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、L2-015）／対象意味はL1-014 |
| `SECURITY-CASE-027-077` | `SECURITY-AC-027-04` | Context→Memoryのsink handoff resultだけunknown。他の当該経路fieldとowner contractは正常で、他2経路の独立receipt/stateは有効。  当該経路の上記未完義務source値も固定宣言する。| 当該sink結果unknownと当該経路の未完を保持し、構成体成立を主張しない。他2経路の有効証拠は別identityで維持し、無効化も成功扱いもしない。  未完義務出力のidentity・内容・宛先owner・元flow/source revisionを宣言source値へ一致させてownerへ返し、実接続契約identityを補完しない。| memory-sink-owner@contract-r1 （fixtureで宣言されたsink契約。Memory機構ownerは未特定） |
| `SECURITY-CASE-027-078` | `SECURITY-AC-027-04` | P2だけの有効な端から端の証拠を与え、P1/P3を未観測とする。 | 一経路から構成体成功を生成しない。P1/P3の未観測を保持。 | 未観測P1: memory-sink-owner@contract-r1（機構owner unknown）／未観測P3: HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、L2-015）／対象意味はL1-014 |
| `SECURITY-CASE-027-079` | `SECURITY-AC-027-04` | Episode→Training Datasetのsink handoff resultだけunknown。他の当該経路fieldとowner contractは正常で、他2経路の独立receipt/stateは有効。  当該経路の上記未完義務source値も固定宣言する。| 当該sink結果unknownと当該経路の未完を保持し、構成体成立を主張しない。他2経路の有効証拠は別identityで維持し、無効化も成功扱いもしない。  未完義務出力のidentity・内容・宛先owner・元flow/source revisionを宣言source値へ一致させてownerへ返し、実接続契約identityを補完しない。| HELIX-LABO training-material sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-080` | `SECURITY-AC-027-04` | P3だけの有効な端から端の証拠を与え、P1/P2を未観測とする。 | 一経路から構成体成功を生成しない。P1/P2の未観測を保持。 | 未観測P1: memory-sink-owner@contract-r1（機構owner unknown）／未観測P2: HELIX-LABO training-material sink-owner contract（契約identity未特定、L2-015）／対象意味はL1-014 |
| `SECURITY-CASE-027-081` | `SECURITY-AC-027-04` | Product Knowledge→BRAINのsink handoff resultだけunknown。他の当該経路fieldとowner contractは正常で、他2経路の独立receipt/stateは有効。  当該経路の上記未完義務source値も固定宣言する。| 当該sink結果unknownと当該経路の未完を保持し、構成体成立を主張しない。他2経路の有効証拠は別identityで維持し、無効化も成功扱いもしない。  未完義務出力のidentity・内容・宛先owner・元flow/source revisionを宣言source値へ一致させてownerへ返し、実接続契約identityを補完しない。| HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、scopeはL2-015） |
| `SECURITY-CASE-027-082` | `SECURITY-AC-027-04` | L2-014単体成功だけを与え、3経路のreceiptは未提示。 | 単体成功から構成体成功を生成しない。 | SECURITY L1-014 |
| `SECURITY-CASE-027-083` | `SECURITY-AC-027-04` | P1/P2/P3のsource tupleが別なのに、同じ一つの判定・handoff receiptを全経路へ流用。 | 経路間の証拠流用を拒否し各経路の対象source/sinkへ結ぶ。 | P1 memory-sink-owner@contract-r1（機構owner unknown）／P2 HELIX-LABO training-material sink-owner contract（契約identity未特定、L2-015）／P3 HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、L2-015）／SECURITY L1-014 |
| `SECURITY-CASE-027-084` | `SECURITY-AC-027-04` | 3経路とも各自の有効なallow/successまたはdeny/hold/not_performedを持つ正常構成体fixture。 | 3経路の境界条件を別々に確認する。拒否・保留経路を保存successへ変えず、構成体境界の確認と全sinkへの保存成功を区別。 | P1 memory-sink-owner@contract-r1（機構owner unknown）／P2 HELIX-LABO training-material sink-owner contract（契約identity未特定、L2-015）／P3 HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、L2-015） |
| `SECURITY-CASE-027-085` | `SECURITY-AC-027-05` | 3経路正常fixtureで各sink契約が要求していないLABO評価を全経路必須条件へ追加。 | 一律追加を拒否。LABO評価が当該sink契約で選択された場合の既存工程だけは保持。 | P1 memory-sink-owner@contract-r1（機構owner unknown）／P2 HELIX-LABO training-material sink-owner contract（契約identity未特定、L2-015）／P3 HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、L2-015） |
| `SECURITY-CASE-027-086` | `SECURITY-AC-027-05` | 3経路正常fixtureで各sink契約が要求していないOS登録を全経路必須条件へ追加。 | 一律追加を拒否。OS登録が当該sink契約で選択された場合の既存工程だけは保持。 | P1 memory-sink-owner@contract-r1（機構owner unknown）／P2 HELIX-LABO training-material sink-owner contract（契約identity未特定、L2-015）／P3 HELIX-BRAIN knowledge sink-owner contract（契約identity未特定、L2-015） |
| `SECURITY-CASE-027-087` | `SECURITY-AC-027-05` | 選択したsink契約が固有の評価工程を要求する正常fixtureでその工程receiptを有効に与える。他sink契約に同工程はない。 | 当該sink固有工程だけを照合し、他経路へ常時依存として広げない。 | 選択されたP1/P2/P3の該当owner接続契約。Memoryの機構ownerはunknownのまま。 |
| `SECURITY-CASE-027-088` | `SECURITY-AC-027-01` | P1正常fixtureのpromotion requestだけ明示unknown。他のsource identity/revision、provenance、classification、SECURITY判定、sink result、owner contractと他経路は維持。 | promotion requestがunknownで当該flowを有効な要求と扱わず、unknown/未完を保持する。新しいapprovalやsource欠落時のhold/denyを追加しない。他経路の有効状態は別identityで維持。 | SECURITY L1-014 |
| `SECURITY-CASE-027-089` | `SECURITY-AC-027-01` | P1正常fixtureのsource revisionだけ明示unknown。他のsource identity、promotion request、provenance、classification、SECURITY判定、sink result、owner contractと他経路は維持。 | source revision unknownを補完せず当該source tupleを未完で保持し、永続化前にhold/denyする。他経路の有効状態は別identityで維持。 | SECURITY L1-014 |
| `SECURITY-CASE-027-090` | `SECURITY-AC-027-02` | P2正常fixtureのpromotion requestだけ明示unknown。他のsource identity/revision、provenance、classification、SECURITY判定、sink result、owner contractと他経路は維持。 | promotion requestがunknownで当該flowを有効な要求と扱わず、unknown/未完を保持する。新しいapprovalやsource欠落時のhold/denyを追加しない。他経路の有効状態は別identityで維持。 | SECURITY L1-014 |
| `SECURITY-CASE-027-091` | `SECURITY-AC-027-02` | P2正常fixtureのsource revisionだけ明示unknown。他のsource identity、promotion request、provenance、classification、SECURITY判定、sink result、owner contractと他経路は維持。 | source revision unknownを補完せず当該source tupleを未完で保持し、永続化前にhold/denyする。他経路の有効状態は別identityで維持。 | SECURITY L1-014 |
| `SECURITY-CASE-027-092` | `SECURITY-AC-027-03` | P3正常fixtureのpromotion requestだけ明示unknown。他のsource identity/revision、provenance、classification、SECURITY判定、sink result、owner contractと他経路は維持。 | promotion requestがunknownで当該flowを有効な要求と扱わず、unknown/未完を保持する。新しいapprovalやsource欠落時のhold/denyを追加しない。他経路の有効状態は別identityで維持。 | SECURITY L1-014 |
| `SECURITY-CASE-027-093` | `SECURITY-AC-027-03` | P3正常fixtureのsource revisionだけ明示unknown。他のsource identity、promotion request、provenance、classification、SECURITY判定、sink result、owner contractと他経路は維持。 | source revision unknownを補完せず当該source tupleを未完で保持し、永続化前にhold/denyする。他経路の有効状態は別identityで維持。 | SECURITY L1-014 |
| `SECURITY-CASE-027-094` | `SECURITY-AC-027-01` | P1の通常hold fixture（CASE 003）の他値・他経路を保持し、未完義務出力だけを欠落させる。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `memory-sink-owner@contract-r1`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | memory-sink-owner@contract-r1の接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-095` | `SECURITY-AC-027-01` | P1の通常hold fixture（CASE 003）の他値・他経路を保持し、未完義務の内容だけを `解消済み` に変える。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `memory-sink-owner@contract-r1`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | memory-sink-owner@contract-r1の接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-096` | `SECURITY-AC-027-01` | P1の通常hold fixture（CASE 003）の他値・他経路を保持し、未完義務の宛先ownerだけを `SECURITY` に変える。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `memory-sink-owner@contract-r1`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | memory-sink-owner@contract-r1の接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-097` | `SECURITY-AC-027-01` | P1の通常hold fixture（CASE 003）の他値・他経路を保持し、未完義務の元flowだけを別経路へ変える。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `memory-sink-owner@contract-r1`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | memory-sink-owner@contract-r1の接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-098` | `SECURITY-AC-027-02` | P2の通常hold fixture（CASE 028）の他値・他経路を保持し、未完義務出力だけを欠落させる。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `HELIX-LABO`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | HELIX-LABOの接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-099` | `SECURITY-AC-027-02` | P2の通常hold fixture（CASE 028）の他値・他経路を保持し、未完義務の内容だけを `解消済み` に変える。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `HELIX-LABO`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | HELIX-LABOの接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-100` | `SECURITY-AC-027-02` | P2の通常hold fixture（CASE 028）の他値・他経路を保持し、未完義務の宛先ownerだけを `SECURITY` に変える。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `HELIX-LABO`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | HELIX-LABOの接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-101` | `SECURITY-AC-027-02` | P2の通常hold fixture（CASE 028）の他値・他経路を保持し、未完義務の元flowだけを別経路へ変える。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `HELIX-LABO`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | HELIX-LABOの接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-102` | `SECURITY-AC-027-03` | P3の通常hold fixture（CASE 053）の他値・他経路を保持し、未完義務出力だけを欠落させる。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `HELIX-BRAIN`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | HELIX-BRAINの接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-103` | `SECURITY-AC-027-03` | P3の通常hold fixture（CASE 053）の他値・他経路を保持し、未完義務の内容だけを `解消済み` に変える。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `HELIX-BRAIN`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | HELIX-BRAINの接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-104` | `SECURITY-AC-027-03` | P3の通常hold fixture（CASE 053）の他値・他経路を保持し、未完義務の宛先ownerだけを `SECURITY` に変える。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `HELIX-BRAIN`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | HELIX-BRAINの接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-105` | `SECURITY-AC-027-03` | P3の通常hold fixture（CASE 053）の他値・他経路を保持し、未完義務の元flowだけを別経路へ変える。 | 宣言source値との不一致を検出し、正常な未完義務identity・内容・宛先 `HELIX-BRAIN`・元flow/source revisionを保持する。deny/holdを解除せず保存成功・構成体成立を生成しない。 | HELIX-BRAINの接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-106` | `SECURITY-AC-027-01` | P1の通常deny fixture（CASE 002）と真正な宣言source値を固定し、未完義務出力の義務identityだけを別identityへ変える。他の出力fieldと他経路は維持。 | 宣言source値との単独不一致を検出し、元の義務identity・内容・宛先 `memory-sink-owner@contract-r1`・元flow/source revisionを保持してownerへ返す。denyと未実施handoffを維持し、保存成功・構成体成立を生成しない。 | memory-sink-owner@contract-r1の接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-107` | `SECURITY-AC-027-01` | P1の通常deny fixture（CASE 002）と真正な宣言source値を固定し、未完義務出力の元source revisionだけをr2へ変える。他の出力fieldと他経路は維持。 | 宣言source値との単独不一致を検出し、元の義務identity・内容・宛先 `memory-sink-owner@contract-r1`・元flow/source revisionを保持してownerへ返す。denyと未実施handoffを維持し、保存成功・構成体成立を生成しない。 | memory-sink-owner@contract-r1の接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-108` | `SECURITY-AC-027-02` | P2の通常deny fixture（CASE 027）と真正な宣言source値を固定し、未完義務出力の義務identityだけを別identityへ変える。他の出力fieldと他経路は維持。 | 宣言source値との単独不一致を検出し、元の義務identity・内容・宛先 `HELIX-LABO`・元flow/source revisionを保持してownerへ返す。denyと未実施handoffを維持し、保存成功・構成体成立を生成しない。 | HELIX-LABOの接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-109` | `SECURITY-AC-027-02` | P2の通常deny fixture（CASE 027）と真正な宣言source値を固定し、未完義務出力の元source revisionだけをr2へ変える。他の出力fieldと他経路は維持。 | 宣言source値との単独不一致を検出し、元の義務identity・内容・宛先 `HELIX-LABO`・元flow/source revisionを保持してownerへ返す。denyと未実施handoffを維持し、保存成功・構成体成立を生成しない。 | HELIX-LABOの接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-110` | `SECURITY-AC-027-03` | P3の通常deny fixture（CASE 052）と真正な宣言source値を固定し、未完義務出力の義務identityだけを別identityへ変える。他の出力fieldと他経路は維持。 | 宣言source値との単独不一致を検出し、元の義務identity・内容・宛先 `HELIX-BRAIN`・元flow/source revisionを保持してownerへ返す。denyと未実施handoffを維持し、保存成功・構成体成立を生成しない。 | HELIX-BRAINの接続契約。判定意味差はSECURITY L1-014。 |
| `SECURITY-CASE-027-111` | `SECURITY-AC-027-03` | P3の通常deny fixture（CASE 052）と真正な宣言source値を固定し、未完義務出力の元source revisionだけをr2へ変える。他の出力fieldと他経路は維持。 | 宣言source値との単独不一致を検出し、元の義務identity・内容・宛先 `HELIX-BRAIN`・元flow/source revisionを保持してownerへ返す。denyと未実施handoffを維持し、保存成功・構成体成立を生成しない。 | HELIX-BRAINの接続契約。判定意味差はSECURITY L1-014。 |

未完義務の出力変異094〜105はhold正常系から、106〜111はdeny正常系から導く。P1の宛先は宣言された契約owner identity、P2/P3の宛先は固定L2-015の機構ownerとsink scopeへ対応し、P2/P3の具体契約identityは未特定のまま保持する。
