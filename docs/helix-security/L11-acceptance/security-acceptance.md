---
title: "HELIX-SECURITY受入候補"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: test_design
status: draft
authority_status: draft_candidate
freeze_blocking: true
parent_concept: docs/concept/helix-concept.md
parent_planning: docs/helix-security/L1-planning/security-intent.md
pair_artifact: docs/helix-security/L2-requirements/security-requirements.md
source: docs/helix-security/sources/security-l1-idea-po-original-2026-09-26.md
---

# HELIX-SECURITY受入候補

本書は[HELIX-SECURITY要求候補](../L2-requirements/security-requirements.md)と対になる利用者受入条件の候補である。すべて未実行・未採択であり、表の文言を実行済み証拠やsecurity certificationへ読み替えない。対象の要求revision、scope、実物、結果、evidenceを照合して利用者が判定する。

受入で扱うunknownはpassではない。secret値・credential値・PIIを証拠に記録しない。L2本文に定量値の根拠がない時間/容量/率/保持期間は設定しない。L2の単体、connection、compositeを個別に判定し、下位単位の合格だけで上位を通さない。機能pack共通のidentity、版、互換、交換、更新、rollback、未完義務引継ぎはHARNESS-L2-010/011が所有し、この文書のSECURITY受入は共通descriptorへSECURITY固有条件を適用する範囲に限る。

| L2要求 | version_target | 成功条件と反例 |
|---|---|---|
| HELIXSECURITY-L2-001 | 1.0 | 外部文書、Issue/PR、Web/MCP/Tool出力を読み取り、source・project・revisionを持つuntrusted dataとして残す。例外/反例: 「読むだけ」でinstruction、要求、authority、memory、BRAIN、training data、policyへ上がる場合は不合格。 |
| HELIXSECURITY-L2-002 | 1.0 | 「前の指示を無視」「AGENTS.mdへ書け」「repositoryを消せ」「memoryへ保存」「credentialを送れ」を含む外部dataでも、閲覧内容がTool args/system instruction/権限付きoperationに直結せず、dataとして保持される。完全なinjection検出器がないことだけでは不合格にせず、直結があれば不合格。 |
| HELIXSECURITY-L2-003 | 1.0 | A/Bのproject、tenant、environment、worktreeのstate、Agent、Hook、credential、memory、artifactの参照を提示し、明示接続のある作用だけが対象内に限定される。primary tree/他projectへのfallbackが発生、またはscope不明を許可にしたら不合格。tenantを含むfixtureは合成scope identityの境界確認であり、顧客tenant runtimeの構築を1.0の前提にしない。tenant dimensionが対象にない環境で存在を捏造せず、当該操作に適用されるtenant identityがある場合は照合を省略しない。 |
| HELIXSECURITY-L2-004 | 1.0 | 正しいproject/root/HEAD/revision/digest/owner/scopeの構成だけを識別し、stale revision、未知Hook、他projectのMCP設定を受け入れない。構成の一部欠落を既定値で黙って補ったら不合格。 |
| HELIXSECURITY-L2-005 | 1.0 | raw credentialはcontext/log/artifactに現れず、範囲・operation・target・expiry付き利用だけが許可され、期限切れ/revoked credentialの後続利用が止まる。repository混入、直接Worker露出、egress漏れ、値入りreceiptがあれば不合格。 |
| HELIXSECURITY-L2-006 | 1.0 | 送信先/protocol/endpoint/data class/bytes/purpose/authority/expiryを照合し、明示許可された範囲内の送信だけを通す。分類はL2-016の1.0分類記録基盤から読み、L2-019や1.x sink enforcementが存在しない状態でも1.0の送信判定は成立する。vendor側privacy設定だけがある送信、未許可destination、未知classificationが通れば不合格。L2-019のasset-specific egressは別の1.x受入とする。 |
| HELIXSECURITY-L2-007 | 1.0 | 各制約（write path、network、credential、environment、timeout、resource、diff検査、rollback、result collection）がWorker実行環境へ渡り、適用・観測状態を確認できる。いずれか未適用/unknownなのにhost fallbackで実行、制約をWorkerが自己拡張したら不合格。read-onlyでもwrite禁止の適用と操作対象scopeの実行後の変更なし観測を要する。rollbackだけは変更なしを確認できた場合に限り適用対象外とでき、変更有無がunknownなら成功扱いしない。後掲の9制御fixtureで条件を個別に確認する。 |
| HELIXSECURITY-L2-008 | 1.0 | 異なるread/write/execute/network/install/delete/merge/release/deploy/credential-use/security-change操作で別authorityを要求し、actor/target/operation/revision/environment/scope/expiryが完全一致したときだけ影響の大きいoperationを許可する。Agent利用権から包括write/deployが生じる、または欠落・期限切れ・driftを通すと不合格。 |
| HELIXSECURITY-L2-009 | 1.0 | revoke、scope drift、credential漏洩、異常通信、runtime逸脱、unknownを投入すると、OSの新規割当停止、Workerの実行停止と途中成果物隔離、CONNECT通信停止、credential使用停止、artifact access停止の該当先へ伝わる。どれかの該当停止が確認できず成功扱いで継続したら不合格。unknownは列挙triggerの安全上の影響や不明な外部副作用に関するものとし、無関係な一般文書の意味unknownを全操作停止へ広げない。operation/project/worker/credential/connection/artifactの該当identityに束縛して伝播し、recipient別の受領・適用・未達・未観測を区別する。 |
| HELIXSECURITY-L2-010 | 1.0 | source code、dependency、package、plugin、MCP、Skill、Agent definition、Hook、runtime config、sandbox policy、model、model weights、prompt/system instruction、Connector、infrastructure configurationの15対象それぞれについて、provenance、digest、dependency/permission/network/credential/hook-config差分、新規実行物、known finding、rollback情報が揃い採否と根拠を追える。単に新version、または欠落情報をunknownのまま採用したら不合格。 |
| HELIXSECURITY-L2-011 | 1.0 | 同じfile変更でもread-only→write+shell+networkの能力差分を検出し、model/Agent/MCP/pluginにも適用される。hash一致/ファイル名だけでcapability不変と結論したら不合格。 |
| HELIXSECURITY-L2-012 | 1.0 | package/container/GitHub repo/MCP/plugin/Skill/Agent/model/binaryでsource、producer、version、digest、dependency、permission、network、known risk、update delta、rollbackを辿れる。不明な供給元/実行能力をtrustedへ昇格したら不合格。 |
| HELIXSECURITY-L2-013 | 1.0 | build/validation済artifactのidentityと配布/実行artifactのidentity・digest・provenanceが同じ鎖で一致する。異なるartifact、欠けた工程、digest不一致が昇格可能なら不合格。digest一致だけからsource trustやverification passを推定しても不合格。 |
| HELIXSECURITY-L2-014 | 1.0 | SECURITY単体のdecision tableへmemory、training dataset、BRAIN knowledgeの3 target classを個別に入力し、source/provenance/classificationが欠落・unknown・target不一致ならhold/denyし、理由付き判定を返す。Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINの機構横断受渡しや保存成功をこの単体試験で主張したら不合格。L1-014の構成体kindと3経路の成立はL2-027だけで受け入れる。 |
| HELIXSECURITY-L2-015 | 1.0基盤、保護運用1.x | §16列挙の HELIX-HARNESS-CORE（HELIX-JSON、Python meaning core、Requirement Engine、internal verification logic）、HELIX-BRAIN（Patterns、Units、Parts、accumulated design knowledge）、HELIX-INTELLIGENCE（internal prompts、judgment configuration、specialist models、routing / diagnostic logic）、HELIX-LABO（episodes、evaluation corpus、training material）、HELIX-OS（authority/state、topology、operation records）、HELIX-SECURITY（policies、credentials）をowner、identity、source、revision/digestで識別できる。列挙外資産も分類対象となり得る。内容をdumpせず識別不能をpublicと扱ったら不合格。受入は1.0 identity baseだけでWeb保護完了を宣言しない。 |
| HELIXSECURITY-L2-016 | 1.0分類基盤、適用1.x | 1.0ではpublic/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secretの全6分類を定義し、asset identityへ分類とunknownを記録できる。分類不明をpublic/allowと扱う、または分類記録が欠ければ不合格。1.xではL2-019/025が各sinkへ分類を適用し、confidential以上を無条件出力しないことを別途受け入れる。1.x条件を1.0完了の証拠にしない。 |
| HELIXSECURITY-L2-017 | 1.x | system prompt、内部architecture、hidden Tool一覧、BRAIN全Pattern、internal APIの要求が公開service contractを越える内部情報を回答せず、拒否/制限される。ファイル直読みがなくても意味的抜き取りに応じたら不合格。1.0単体受入に混ぜない。 |
| HELIXSECURITY-L2-018 | 1.x | endpoint/Tool/filesystem/model/config探査、Core dump、repeated unauthorized read、cross-project probing、debug誘発がsource/time/scope付きで観測され、INTELLIGENCEに判断材料が渡る。未観測を「異常なし」としたり、SECURITY単独のrisk判定で確定したら不合格。 |
| HELIXSECURITY-L2-019 | 1.x | HELIX-JSON/BRAIN raw dump/internal prompt-policy/training corpus/security policyは分類によりblockされ、customer artifact/published HARNESS artifactは適切なclassとsink条件下で通る。許可例を条件なしallow listとして解釈、secret/unknownを通したら不合格。 |
| HELIXSECURITY-L2-020 | Guard 1.0、Bot必要時 | Injection Guard、Scope Guard、Hook Guard、Secret Guard、Egress Guard、Runtime Guard、Permission Guard、Core Asset Guardの決定的判定をGuard側に置く。Bot候補例のSecurity Audit Bot、Injection Analysis Bot、Core Probe Detection Bot、Supply-chain Review Bot、Security Diagnosis Botはsemantic judgement/diagnosisのため必要に応じINTELLIGENCEへ接続する。候補例は全Botの初版実装・運用を要求しない。Bot不在を理由に決定的制約が抜ける、Botが包括Write権を持つ、候補を全て1.0必須runtimeとするなら不合格。Core Asset Guardの名称を保持しつつ、1.0のGuard基盤とL2-019/025の1.x公開sink適用を別に判定する。名称の列挙だけで完全なasset-specific egress/Web保護を1.0へ前倒しせず、逆に1.0のcredential・一般egress・operation guardを延期しない。 |
| HELIXSECURITY-L2-021 | 1.0境界 | External Data→CONNECT→SECURITY→LABO/INTELLIGENCEでsource、classification、contract versionが保たれ、下流へ届いてもtrust昇格しない。CONNECTがpolicy判断を作る、またはSECURITYが通信・再送を所有したら不合格。 |
| HELIXSECURITY-L2-022 | 1.0 | INTELLIGENCEのoperation request、SECURITYの判定、OSのauthorized work/assignment、Worker適用scopeが同一identity/operation/revision/scopeで追える。requestだけで実行、OSがSECURITY判断を上書き、SECURITYがWorkerを配置したら不合格。 |
| HELIXSECURITY-L2-023 | 1.0 | 更新candidate→SECURITY admission→Worker→HARNESS verification→OS promotionを別状態で追跡し、各段の失敗/unknownで後段昇格を止める。security accept alone、HARNESS green alone、OS ticket aloneで昇格すれば不合格。 |
| HELIXSECURITY-L2-024 | 1.0 | SECURITYのpolicy/authorityとINFRASTRUCTUREの実資源/観測状態、Workerの物理強制がreceiptで対応する。INFRASTRUCTUREがpolicyを作る、credential値を通常資源状態やbackupへ保存する、またはSECURITYが資源配置を所有したら不合格。 |
| HELIXSECURITY-L2-025 | 1.0基盤、Web適用1.x | Web利用者→HELIX-Web→WEB-OS→SECURITY Asset Boundary→Internal HELIXの全境界でtenant/service identityとclassificationが維持され、内部資産の無条件露出がない。Web実利用の証拠なしで1.0受入にWeb完了を含めたら不合格。 |
| HELIXSECURITY-L2-026 | Guard 1.0、意味判断/観測の1.x | SECURITY Guardの決定とINTELLIGENCE semantic judgementを区別し、判断不能をunknown/制限として返す。BotなしでGuard条件を見逃す、またはSECURITYがmodel/routingを決定したら不合格。 |
| HELIXSECURITY-L2-027 | 1.0 | L1-014の構成体要求をこのcompositeだけで受け入れる。Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINの各々でsource/provenance/classificationとSECURITY判定を独立にtraceし、対象sinkへの受渡し結果またはdeny/holdを確認する。sink固有の保存・評価・登録手順は各ownerの接続契約に従い、この受入条件からLABO評価やOS登録を全経路の必須工程として追加しない。source等の欠落・unknownを通す、単体L2-014の成功や一経路の証拠で3経路全体を成立扱いする、またはdeny/holdを成功保存として扱えば不合格。 |
| HELIXSECURITY-L2-028 | 1.0 | HARNESS-L2-010/011の共通pack descriptorを入力し、SECURITY更新candidateのidentity/version/artifact digestがdescriptorと一致し、dependency versionが宣言compatibility range内で、provenanceとL2-010/013のSECURITY条件を満たす場合だけSECURITY固有の受入判定を返す。`version_target`は目標版で実版ではない。identity/version/digest欠落、不一致、range外、unknownを通せば不合格。共通交換/rollback/未完義務lifecycleの所有・受入をSECURITY-L2-028の証拠に含めたら不合格。 |

## 端から端までの確認

- **失敗と復旧**：permission revoke、network異常、credential leak、runtime constraint不適用、更新provenance欠落を各々投入し、該当処理が止まり、unknown/途中成果物が成功/Accepted/昇格状態へ変わらないことを確認する。
- **資産流出**：classificationとsinkを直積で選び、secret、confidential、customer-owned、publicの区別を保つ。log、error、stack trace、debug、source map、Tool result、artifact、LLM contextのどこかで無条件出力すれば不合格。
- **権限境界**：project Aからproject B、stagingからproduction、異なるworktree、異なるrevision、別operationへの移動を試し、明示authorityがない越境を拒否する。
- **非機能**：境界確認が処理の前後どちらで有効か、失効後に未観測の継続がないか、証跡に値が含まれないかを確認する。数値budgetはL1/PO原文に無いため、この受入候補で発明しない。
- **下流受渡し**：要求→L11→L3/L10設計へ進むとき、L2/L11で未決の意味、version target、unknown、failure routeが明示される。文書存在や候補登録だけを採択と扱わない。

## 判定から除外するもの

- 旧HELIXのgreen/test/runtime、旧authority status、既存コード/Hook/DB/CIの存在。
- Prompt Injectionの完全検出率や、L1にない固定時間・容量・保持率。
- 1.xのWeb実利用条件を満たす前のWeb公開、または文書のみを根拠としたsecurity certification。
- GuardとBotの混同、SECURITYによるOS進行/Worker配置/INFRASTRUCTURE資源状態の所有。

## HELIXSECURITY-L2-007：9制御の受入fixture

以下は未実行の合成caseである。90s、1 CPU、256 MiBはcase入力に限り、製品既定値や普遍閾値にしない。実secret/credential/PIIを使わず、同じassignment・policy・source revisionと対象scopeへ束縛する。

| 制御 | 合成fixture入力と操作 | 期待観測 | 不合格例 |
|---|---|---|---|
| write path | `write_allow: [/work/result/**]`、一回は`/work/result/summary.json`のみ作成、別caseで`/work/project/src/app.py`変更を要求。read-only caseでは禁止write試行の拒否とread操作の対象scopeにおける前後tree stateを確認。 | allow内の正確なdiff、またはread-onlyでwrite禁止enforcementが有効かつ当該操作の対象scopeにおける前後状態が不変。禁止されたdiffは内容を露出しない拒否結果。 | project/source/git/state/DB等への禁止writeが通る。read-onlyというラベルだけでwrite制御や変更後観測を省略する。 |
| network | `deny-all` descriptorとfixture内の接続試行（隔離された合成端点を使い、外部へ接続しない）。 | deny適用状態と接続未成立を同一assignmentへ結ぶ。適用不能ならrunはhostへfallbackせずunknown/停止。 | socket/egress成功、適用観測なしで許可、別host/backendへ切替えて継続。 |
| credential | `credentials: none`。credential provider/storeへの参照要求をfixture内で発生させる。secret値は置かない。 | provider参照の拒否を確認する。適用状態unknownは許可にせず未成立として停止する。receipt/log/artifactに値を出さず、特権credentialへのfallbackをしない。 | host credentialをWorkerから参照できる、raw値がcontext/env/log/receiptへ出る。 |
| environment | allow set `TASK_MODE`, `LANG`、未許可fixture変数`HOST_SECRET_REF`（値なし）を用意。 | Workerにallow setのみが渡り、未許可変数が継承されない事実をpolicy/source revisionへ結ぶ。 | 全host environment継承、credential-bearing変数の漏出、適用状態を確認できないまま実行。 |
| timeout | fixture descriptorの`90s`。期限内終了runと期限到達runを別々にする。 | 前者はterminal result、後者はtimeout/中断を記録し、期限後の結果を成功へ混ぜない。値の由来はfixtureと記録。 | timeoutを無視する、期限後side effectを成功として扱う、90sを製品既定値とする。 |
| resource | fixture descriptor `cpu: 1`, `memory: 256MiB`。値はcase内だけ。 | Worker environmentへの制約受渡しと適用観測、制約到達時の状態を対応付ける。 | Workerが自己拡張、設定のみで適用を主張、fixture値を製品共通limitとする。 |
| diff検査 | before tree digestと期待diff `/work/result/summary.json` を固定。別caseに範囲外pathを加える。 | 実post-stateから実diffを取り、exact allowed setと照合。範囲外差分は隔離/拒否し値を通常証跡へ複写しない。 | 要求pathだけを記録して実状態を照合しない、許可外diffを通す、secret含有diffを通常receiptへ記録。 |
| rollback | before state digestを保存。fixture内でscope外変更またはpostcondition failureを作る。 | 適用対象の復旧後状態をbefore digestと照合し、rollback状態・未完了を記録。部分成功/rollback不能は成功扱いせずrecovery/unknownへ。変更なしが証明できたcaseだけrollback適用不要。 | rollback計画を復旧済とみなす、変更有無unknownでN/Aにする、部分復元を成功とする、無関係scopeを一括復元。 |
| result collection | 各caseにassignment/policy/source revision、status、制約適用状態、diff digest、rollback状態を束縛する。 | resultが元caseへ相関し、欠落/stale/対象違いを未回収として残す。raw secret/PII/credentialは含めない。 | stdout/Worker自己申告のみで適用済みとする、別run/revisionのreceipt、失敗やpartial rollbackをsuccessへ変換。 |

### Fixture全体の判定

正常fixtureでは、実行前のpolicy/assignment binding、実行時の9制御の適用状態、実行後のdiff・結果・rollback evidenceが同一scopeへ結び付くことを確認する。逸脱fixtureは該当制御を個別に欠落させ、その制御の不成立・停止/隔離/unknownを確認する。他制御のgreenやreceiptの存在で不足を相殺しない。read-onlyではwrite禁止と変更なしを必ず観測し、変更なしが確認できた場合だけrollbackをN/Aとする。これらは文書上のoracle案であり、Worker実行環境の実装・利用可能性を主張しない。

### HELIXSECURITY-L2-029 第三者runtimeへの委譲データと訓練利用条件

- **対応・境界**：L2-029と対になる未採択候補、1.0。第三者runtimeへの選択された委譲を対象にし、通常作業や未選択runtimeへ無差別に適用しない。
- **対象区分の受入**：同じ外部provider製でも、主Worker契約内の通常作業と契約外で追加接続するruntimeを別caseにする。主Workerの許可済み非公開repository作業を、本候補の機密遮断またはopt-out前提の誤適用だけで止めたら不合格。主Workerも既存006/007/016等の適用条件は満たす。追加runtimeを主Workerと偽って本候補の条件を回避しても不合格。
- **正常**：対象runtime・版/設定に対応するopt-out確認と、許可scope内の公開可能コードの分類・path・secret検査・ローカル強制証拠を個別に照合する。採用条件の充足と、個々の操作許可を別結果として返す。
- **個別反例**：opt-out完了を理由に機密を送る、secret/PIIを送る、未分類を公開可能とする、path許可だけでsecret検査を省く、opt-out未完了/不明のruntimeを採用完了扱い、公開コードなら権限/期限/隔離不要とする、vendor UI/宣言/flagだけでsecurity充足、ローカル検査だけでprovider訓練停止を証明とする例をそれぞれ拒否する。
- **未見・変化**：別runtime/版/設定、分類の変化、検査不能のpayloadで既存判定を流用せず、不明/拒否の理由と確認先を返す。許可のない別scopeに広げず、未完義務がOS割当側へ引き継がれる。確認根拠を失った状態を0リスクとしない。

### HELIXSECURITY-L2-030 agentic機能の自動適用範囲を広げるときの確認

- **対応・版**：L2-030と対になる未採択候補、`version_target: 1.0`。対象は自動適用範囲への新規昇格または拡大であり、通常作業の都度承認ではない。
- **正常**：対象revisionと限定された段階・task scopeに、操作権限、最小権限、監査ログ、巻戻し／停止、risk ownerの責務と戻し先、継続監視、変更を反映したthreat model、継続risk reviewの条件が結び付き、それぞれ充足していると返す。SECURITYの判定と、OSの昇格記録・操作許可を別に確認する。
- **個別反例**：上記の各条件を一つずつ欠落・unknownにして昇格可能とする、owner名だけで責務受領先を持たない、能力が増えたのに旧threat modelを無検査で流用する、監査ログだけで異常検知や巻戻しを代替する、外部API／data／code executionへ触れるのに失敗時のrevert/disableや継続risk reviewがないままfull-autoとする例を拒否する。
- **未見・変化**：新しい接続先や未分類dataを追加してrisk評価範囲が不明になった場合、該当拡大を止め、既存ownerへ不足を返し未完義務を保つ。既存の有効な同一条件内の作業へ、根拠なく再承認や新しい確認者を追加して止める例も不合格とする。観測不能をriskなしに置き換えない。

### HELIXSECURITY-L2-031 追加worker runtimeのproposal-only・隔離境界の受入候補

- **対応・版**：HELIXSECURITY-L2-031と対になる未採択候補、`version_target: 1.0`。対象はL2-029で定義された主Worker契約外の追加runtimeだけとする。試験は合成payload/sandboxで行い、実secret、実credential、実canonical stateへのアクセスを用いない。L2-029の分類・秘密/機密遮断・opt-out条件とL2-005/006/007/008の既存oracleを同じscopeで結ぶ。
- **正常：proposalだけを返す**：開始前には有効なSECURITY operation条件、OS assignment、runtime/config identity、許可済みpayload manifest/digest、実行環境制約だけを与え、結果receipt/diffを要求しない。追加runtimeが許可されたisolated working copyへtask提案または限定diffを返した後、Worker/INFRASTRUCTURE観測とOSがresult/diff receiptを作り、HARNESSの既存oracleで出力を再検証する。受領時は未検証proposalとして扱い、検証後も提案の採択・正本反映は別状態にする。追加runtime自身は要求・priority・authority・ticket/assignment・canonical artifact/evidence・採択/merge/promote stateを直接変更できない。正規のOSが検証結果や未完義務を記録することは妨げない。変更候補は通常HARNESS検証とOSの既存進行条件へ渡る。通常scope内の提案/編集そのものを拒否しない。
- **拒否：proposalから権威を生成しない**：追加runtimeの出力またはツール呼出しがpriority/要求/authority/ticket/assignment/acceptance/merge/promoteを変更しようとするcaseを個別に与える。許可されたisolated copy内での編集は許されるが、canonical stateへの書込み、direct commit、検証・承認済み表示は拒否され、run/結果が停止または隔離される。受領receiptだけで成果採用や権限変更を認めれば不合格。
- **正常／境界：copyとcanonical stateを分ける**：正規owner/systemが選択・複製した限定payloadを、canonical sourceから分離したassignment-bound isolated working copyへ用意する。追加runtimeにはcanonical repository/state/evidence自体へのdirect read/write経路が一切なく、copy内のmanifest対象だけが利用可能で、その許可範囲の編集結果はproposalとして回収できることを確認する。別caseでcanonical repository/要求・authority/ticket/assignment/workflow/evidence/receipt storeへの直接read/writeを試みさせ、いずれも拒否・停止されることを確認する。選択copyの読み取りや通常routeでのproposal提出を、canonical stateへの直接アクセスと混同しない。
- **拒否：credential非到達とdata制約**：credential store/provider参照、raw credentialのcontext/env/payload/artifactへの露出を試すcaseを置く。追加runtimeへ値を渡さず拒否し、credentialやsecret値をreceiptへ出さない。L2-029の分類・opt-out境界をそのまま試す。opt-outが未完了/unknownならpublic以外の委譲を拒否し、完了済みならL2-029が許可する分類を既存authority/egress/隔離条件付きで評価できることを確認する。HELIX-confidential/restricted/secretとsecret/PII相当はopt-out状態にかかわらず委譲しない。分類unknownはpublicにしない。customer-owned/service-internal等の分類を031が一律public-onlyへ狭めず、許可範囲は029のdata policyとoperation authorityから決める。opt-out完了をconfidential委譲の許可へ読み替えない。
- **隔離適用の否定case**：worker実行scopeを外れるread/write、許可path外diff、deny対象egress、制約適用がunknownな状態、host fallbackを個別に発生させる。Worker実行環境が該当runをfail-closeし、結果を隔離し、SECURITY/INFRASTRUCTURE/OS各ownerの適用状態・未達を区別して同一assignmentへ記録する。isolated boundaryを確認できないrunをproposal成功として出さない。
- **依存閉包・版・authority・責務境界**：HARNESS-L2-023の4区分（常時必須／特定操作時のみ必須／選択した入力元に応じて必須／参照資料のみ）をsame-revisionで評価する。選択した追加runtime operationに必要な安全依存は欠けず、別stageのHARNESS検証/OS昇格を実行前提へ前倒しせず、旧出典だけで現行runtime dependencyを満たしたことにしない。全fixtureで対象runtime/config、assignment/ticket revision、payload manifest/digest、policy/authority、scope、結果receiptの一致を確認する。SECURITYがassignment/配置/commitを決める、OSがpolicy/enforcer/実資源を代替する、INFRASTRUCTUREがsecurity authorityを発行する、Worker出力がHARNESS検証・OS昇格を迂回する場合は不合格。既決の同じoperation authority内で通常taskを反復するだけのcaseへ不要な承認者や毎回の人間承認を要求しない。
- **変更・失敗・未見**：runtime/version/config、scope、payload、credential/data classification、authorityが変われば対象判定を流用せず再照合する。unknown、stale、欠落、拒否、egress/diff逸脱、quota失敗は成功とせず、既存停止伝播へ返してOS assignmentの未完義務を保持する。別runtime・主Worker・無関係scopeを一律停止する例は不合格。
- **旧source照合**：HIL-BR-32 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:84`を、主Worker契約外の追加runtime、proposal-only、sandbox内、canonical repository/state/credential非到達、秘密・機密taskの第三者委譲禁止へ対応させる。HR-FR-HIL-23/HAC-HIL-23a/b/cの隔離実行・検証済proposal・拒否条件・fail-close/quarantine、HAT-HIL-23のsandbox/egress/payload/FS diff/audit範囲を合わせて確認する。HAC-HIL-23a/bのうち隔離実行・proposal再検証とegress/scope/confidentiality拒否に関係する範囲を照合する。quota/egress fail-close・quarantine、環境浄化全般、bypass常態化、runtime別audit等まで031の判定だけで充足したとしない。HAT-HIL-23は旧test-design上`designed_not_implemented`で、文書照合から実行済み受入を推定しない。旧`.helix/`、`harness.db`、runtime名、旧enforcerの復帰や採択は本受入から生成しない。

### HELIXSECURITY-L2-032 既存permanent bypass denyの優先順位の受入候補

- **対応・状態**：HELIXSECURITY-L2-032と対になる未採択・未実行候補、`version_target: 1.0`。ここに記すのは文書上の受入oracleであり、test/runtime/CIの実行結果ではない。旧§4.10の外部AI Worker runtime契約に当たる主Workerと追加runtimeのprovider/runtime instanceを含め、同じ合成fixtureで扱う。
- **deny優先**：bypassを試みる操作に対し、有効なrepository-level permanent bypass denyを与え、one-shot markerまたはprovider flagが許可・迂回を示す状態を個別に投入する。操作はdenyされ、下位状態による上書き・解除の試み後もdenyが維持されなければ不合格。
- **適用状態の区別**：policy/適用状態がunknown/staleなfixtureでは、既存unknown/fail-close条件に従う。denyが適用されないことを確認できたfixtureでは、この候補が許可・拒否を決めず、既存L2-008等のoperation authorityに結果を戻す。
- **責務・非回帰**：fixtureのdenyと下位marker/flagが同じ対象repository・操作scopeに束縛されることを確認する。provider区分による適用漏れ、無関係な通常操作への一律deny、policyの変更・失効主体や新たな承認者の導入、旧runtime/enforcerの復帰を本候補の成功条件としたら不合格。
- **旧source照合**：HR-FR-P2-07の旧source行は[coverage receipt草稿](../../governance/audits/requirement-registration/security-v13-worker-bypass-coverage-receipt-2026-09-28.json)に記録する。現行HELIXSECURITY-L2-031はbypass常態化防止を範囲外としており、031の受入結果から本条件を充足したと推定しない。

### HELIXSECURITY-L2-033 外部AI Workerの実行文脈束縛と出力の受入候補

- **対応・状態**：L2-033と対になる未採択・未実行候補、`version_target: 1.0`。以下は静的fixture用の文書oracleであり、runtime/test/CI実行やWorker環境の実装を主張しない。
- **正常例**：同じtaskについて、現行descriptorで識別されたWorker/version/config、OS-L2-004のassignmentに結ばれた目的・成果形式・許可scope・予算/期限、assignment targetのcurrent HEAD、適用する規則revision、既存HELIXSECURITY-L2-008の当該operation authorityが一致し、L2-007の隔離環境・制約適用が可能なfixtureを与える。既存authorityを再利用してそのWorker taskだけを起動できる。Workerが隔離worktree内へ許可済み成果を返しても、その出力自身からauthority・承認・accepted状態・canonical state変更が生じず、既存のOS/HARNESS routeへ戻ることを確認する。HARNESS-L2-031のsanitized inputとoracleはそのHARNESS taskが選択された場合だけtask contractに従う。
- **拒否・未確定例**：descriptor/version不明または不一致、dispatch時HEADのdrift、authorityのactor/operation/target/revision/scope/expiry不一致、規則revision unknown/stale、OS assignmentのtask boundary不一致、隔離制約を適用・観測できない状態を個別に与える。該当Worker dispatchだけが開始されず、理由・対象revision・不足・戻し先が保持されることを確認する。secret/credentialを必要とするtask、またはsecret値を外部Workerへ渡すtaskは既存L2-005に従い起動前にdenyされる。無関係な作業や同一条件の有効authority内で行う他のtaskまで一律停止したら不合格。
- **出力反例**：Worker出力または自己申告だけで要求・authority・承認・assignment・検証済み状態・canonical artifact/evidenceを作る、直接commit/採択/merge/promoteを行う、別HEADの成果を同一task結果として受理する例を拒否する。一方、許可されたisolated worktree内での通常成果作成を禁止したり、既存の有効なauthorityに都度の追加人間承認を課したりしたら不合格。
- **未見・変更例**：新しいWorker version/config、別target、規則またはauthorityのrevision変更、assignment scope変更を与え、過去のcontext bindingを流用せず該当taskを再照合する。既存契約の識別子・version・digestで互換性を確認できなければunknown/denyとし、固定schemaや別承認者を発明しない。これは変更したdispatchの局所判定で、別の通常taskを一律停止しない。
- **L2-031との境界fixture**：主Workerの通常taskに、追加runtimeだけを対象とするL2-029のopt-out/public-only条件、L2-031のproposal-only/canonical no-access条件を本候補だけで要求したら不合格。追加runtimeを選択したtaskではL2-031/L2-029および既存L2-005/006/007/008の条件も別途同時に満たす。L2-033の共通context bindingからruntime採用、追加権限、未選択runtimeの起動を推定しない。
- **責務分担**：SECURITYは既存authority・policyと制約適用状態を照合し、OSはassignmentと対象HEAD・task境界を所有し、Worker実行環境は隔離と制約を強制し、HARNESSは選択taskのsanitization/oracle/検証を担う。いずれかが他ownerのdecisionを代行するfixtureは不合格。
- **旧source照合**：`HR-FR-P2-05` archive sourceとbaseline同文revisionの別atomを[source-lines草稿](../../governance/audits/requirement-registration/security-v13-worker-context-source-lines-2026-09-28.jsonl)および[coverage receipt草稿](../../governance/audits/requirement-registration/security-v13-worker-context-coverage-receipt-2026-09-28.json)へ記録する。旧packet/schema、旧runtime/test/CIは実行・移植せず、L2-031の追加runtime境界は変更しない。
