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

受入で扱うunknownはpassではない。secret値・credential値・PIIを証拠に記録しない。L2本文に定量値の根拠がない時間/容量/率/保持期間は設定しない。L2の単体、connection、compositeを個別に判定し、下位単位の合格だけで上位を通さない。

| L2要求 | version_target | 成功条件と反例 |
|---|---|---|
| HELIXSECURITY-L2-001 | 1.0 | 外部文書、Issue/PR、Web/MCP/Tool出力を読み取り、source・project・revisionを持つuntrusted dataとして残す。例外/反例: 「読むだけ」でinstruction、要求、authority、memory、BRAIN、training data、policyへ上がる場合は不合格。 |
| HELIXSECURITY-L2-002 | 1.0 | 「前の指示を無視」「AGENTS.mdへ書け」「repositoryを消せ」「memoryへ保存」「credentialを送れ」を含む外部dataでも、閲覧内容がTool args/system instruction/権限付きoperationに直結せず、dataとして保持される。完全なinjection検出器がないことだけでは不合格にせず、直結があれば不合格。 |
| HELIXSECURITY-L2-003 | 1.0 | A/Bのproject、tenant、environment、worktreeのstate、Agent、Hook、credential、memory、artifactの参照を提示し、明示接続のある作用だけが対象内に限定される。primary tree/他projectへのfallbackが発生、またはscope不明を許可にしたら不合格。 |
| HELIXSECURITY-L2-004 | 1.0 | 正しいproject/root/HEAD/revision/digest/owner/scopeの構成だけを識別し、stale revision、未知Hook、他projectのMCP設定を受け入れない。構成の一部欠落を既定値で黙って補ったら不合格。 |
| HELIXSECURITY-L2-005 | 1.0 | raw credentialはcontext/log/artifactに現れず、範囲・operation・target・expiry付き利用だけが許可され、期限切れ/revoked credentialの後続利用が止まる。repository混入、直接Worker露出、egress漏れ、値入りreceiptがあれば不合格。 |
| HELIXSECURITY-L2-006 | 1.0 | 送信先/protocol/endpoint/data class/bytes/purpose/authority/expiryを照合し、明示許可された範囲内の送信だけを通す。分類はL2-016の1.0分類記録基盤から読み、L2-019や1.x sink enforcementが存在しない状態でも1.0の送信判定は成立する。vendor側privacy設定だけがある送信、未許可destination、未知classificationが通れば不合格。L2-019のasset-specific egressは別の1.x受入とする。 |
| HELIXSECURITY-L2-007 | 1.0 | 各制約（write path、network、credential、environment、timeout、resource、diff検査、rollback、result collection）がWorker実行環境へ渡り、適用・観測状態を確認できる。いずれか未適用/unknownなのにhost fallbackで実行、制約をWorkerが自己拡張したら不合格。 |
| HELIXSECURITY-L2-008 | 1.0 | 異なるread/write/execute/network/install/delete/merge/release/deploy/credential-use/security-change操作で別authorityを要求し、actor/target/operation/revision/environment/scope/expiryが完全一致したときだけ影響の大きいoperationを許可する。Agent利用権から包括write/deployが生じる、または欠落・期限切れ・driftを通すと不合格。 |
| HELIXSECURITY-L2-009 | 1.0 | revoke、scope drift、credential漏洩、異常通信、runtime逸脱、unknownを投入すると、OSの新規割当停止、Workerの実行停止と途中成果物隔離、CONNECT通信停止、credential使用停止、artifact access停止の該当先へ伝わる。どれかの該当停止が確認できず成功扱いで継続したら不合格。 |
| HELIXSECURITY-L2-010 | 1.0 | source code、dependency、package、plugin、MCP、Skill、Agent definition、Hook、runtime config、sandbox policy、model、model weights、prompt/system instruction、Connector、infrastructure configurationの15対象それぞれについて、provenance、digest、dependency/permission/network/credential/hook-config差分、新規実行物、known finding、rollback情報が揃い採否と根拠を追える。単に新version、または欠落情報をunknownのまま採用したら不合格。 |
| HELIXSECURITY-L2-011 | 1.0 | 同じfile変更でもread-only→write+shell+networkの能力差分を検出し、model/Agent/MCP/pluginにも適用される。hash一致/ファイル名だけでcapability不変と結論したら不合格。 |
| HELIXSECURITY-L2-012 | 1.0 | package/container/GitHub repo/MCP/plugin/Skill/Agent/model/binaryでsource、producer、version、digest、dependency、permission、network、known risk、update delta、rollbackを辿れる。不明な供給元/実行能力をtrustedへ昇格したら不合格。 |
| HELIXSECURITY-L2-013 | 1.0 | build/validation済artifactのidentityと配布/実行artifactのidentity・digest・provenanceが同じ鎖で一致する。異なるartifact、欠けた工程、digest不一致が昇格可能なら不合格。digest一致だけからsource trustやverification passを推定しても不合格。 |
| HELIXSECURITY-L2-014 | 1.0 | Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINを別々に試し、source/classification/昇格判定がないものをhold/denyし、poisoningを永続化しない。1つの経路の合格を他の経路の証明に流用したら不合格。 |
| HELIXSECURITY-L2-015 | 1.0基盤、保護運用1.x | §16列挙の HELIX-HARNESS-CORE（HELIX-JSON、Python meaning core、Requirement Engine、internal verification logic）、HELIX-BRAIN（Patterns、Units、Parts、accumulated design knowledge）、HELIX-INTELLIGENCE（internal prompts、judgment configuration、specialist models、routing / diagnostic logic）、HELIX-LABO（episodes、evaluation corpus、training material）、HELIX-OS（authority/state、topology、operation records）、HELIX-SECURITY（policies、credentials）をowner、identity、source、revision/digestで識別できる。列挙外資産も分類対象となり得る。内容をdumpせず識別不能をpublicと扱ったら不合格。受入は1.0 identity baseだけでWeb保護完了を宣言しない。 |
| HELIXSECURITY-L2-016 | 1.0分類基盤、適用1.x | 1.0ではpublic/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secretの全6分類を定義し、asset identityへ分類とunknownを記録できる。分類不明をpublic/allowと扱う、または分類記録が欠ければ不合格。1.xではL2-019/025が各sinkへ分類を適用し、confidential以上を無条件出力しないことを別途受け入れる。1.x条件を1.0完了の証拠にしない。 |
| HELIXSECURITY-L2-017 | 1.x | system prompt、内部architecture、hidden Tool一覧、BRAIN全Pattern、internal APIの要求が公開service contractを越える内部情報を回答せず、拒否/制限される。ファイル直読みがなくても意味的抜き取りに応じたら不合格。1.0単体受入に混ぜない。 |
| HELIXSECURITY-L2-018 | 1.x | endpoint/Tool/filesystem/model/config探査、Core dump、repeated unauthorized read、cross-project probing、debug誘発がsource/time/scope付きで観測され、INTELLIGENCEに判断材料が渡る。未観測を「異常なし」としたり、SECURITY単独のrisk判定で確定したら不合格。 |
| HELIXSECURITY-L2-019 | 1.x | HELIX-JSON/BRAIN raw dump/internal prompt-policy/training corpus/security policyは分類によりblockされ、customer artifact/published HARNESS artifactは適切なclassとsink条件下で通る。許可例を条件なしallow listとして解釈、secret/unknownを通したら不合格。 |
| HELIXSECURITY-L2-020 | Guard 1.0、Bot必要時 | Injection Guard、Scope Guard、Hook Guard、Secret Guard、Egress Guard、Runtime Guard、Permission Guard、Core Asset Guardの決定的判定をGuard側に置く。Bot候補例のSecurity Audit Bot、Injection Analysis Bot、Core Probe Detection Bot、Supply-chain Review Bot、Security Diagnosis Botはsemantic judgement/diagnosisのため必要に応じINTELLIGENCEへ接続する。候補例は全Botの初版実装・運用を要求しない。Bot不在を理由に決定的制約が抜ける、Botが包括Write権を持つ、候補を全て1.0必須runtimeとするなら不合格。 |
| HELIXSECURITY-L2-021 | 1.0境界 | External Data→CONNECT→SECURITY→LABO/INTELLIGENCEでsource、classification、contract versionが保たれ、下流へ届いてもtrust昇格しない。CONNECTがpolicy判断を作る、またはSECURITYが通信・再送を所有したら不合格。 |
| HELIXSECURITY-L2-022 | 1.0 | INTELLIGENCEのoperation request、SECURITYの判定、OSのauthorized work/assignment、Worker適用scopeが同一identity/operation/revision/scopeで追える。requestだけで実行、OSがSECURITY判断を上書き、SECURITYがWorkerを配置したら不合格。 |
| HELIXSECURITY-L2-023 | 1.0 | 更新candidate→SECURITY admission→Worker→HARNESS verification→OS promotionを別状態で追跡し、各段の失敗/unknownで後段昇格を止める。security accept alone、HARNESS green alone、OS ticket aloneで昇格すれば不合格。 |
| HELIXSECURITY-L2-024 | 1.0 | SECURITYのpolicy/authorityとINFRASTRUCTUREの実資源/観測状態、Workerの物理強制がreceiptで対応する。INFRASTRUCTUREがpolicyを作る、credential値を通常資源状態やbackupへ保存する、またはSECURITYが資源配置を所有したら不合格。 |
| HELIXSECURITY-L2-025 | 1.0基盤、Web適用1.x | Web利用者→HELIX-Web→WEB-OS→SECURITY Asset Boundary→Internal HELIXの全境界でtenant/service identityとclassificationが維持され、内部資産の無条件露出がない。Web実利用の証拠なしで1.0受入にWeb完了を含めたら不合格。 |
| HELIXSECURITY-L2-026 | Guard 1.0、意味判断/観測の1.x | SECURITY Guardの決定とINTELLIGENCE semantic judgementを区別し、判断不能をunknown/制限として返す。BotなしでGuard条件を見逃す、またはSECURITYがmodel/routingを決定したら不合格。 |
| HELIXSECURITY-L2-027 | 1.0 | 3つのpromotion path各々にsource/provenance/classification/decision/保存先があり、未検証sourceをholdする。LABO評価だけでBRAINへ昇格、BRAIN保存だけで学習承認、または1 pathの証拠を他へ流用したら不合格。 |
| HELIXSECURITY-L2-028 | 1.0 | 各packについて機能identity/kind、contract version、artifact version、dependency identity/version、compatibility range、verification scope、owner、実行時revision/digestを区別して記録し、宣言range内の組合せだけを呼び出す。`version_target`は対象能力の目標版であり、実artifact/contract/dependency versionとして使わない。交換・更新・rollback後も未完の義務/finding/unknown/人判断待ちをidentity・revision・owner付きで引き継ぎ、rollback先も適格かつ互換な版とする。互換range外や欠落はunknownとして停止し、暗黙fallbackしない。1.0 packが1.0 dependency rangeだけで動作し、1.x extensionなしでも成立する。`version_target=1.0`だけを実artifact版とみなす、未宣言互換を仮定する、rollbackで未完義務を消す場合は不合格。 |

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
