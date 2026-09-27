# 要求stage総合検証：機構間の結合・責務・交換境界（草案）

## 対象と前提

- 基準main: d308f4080da298172001ef97e9c4b5f66d32ed7d。Concept、8機構のL1/L2/L11、G19/G16/G17/G18追補を読んだ要求上の整理。
- 総合検証用の判断材料であり、横断監査findingや消化案の代筆ではない。PO採択、L3承認、実装、物理結合・L4方式を確定しない。
- 「密結合」は要求上同じ意味・受入不変条件を保つ関係、「疎結合」はownerを保ちながら版付き契約で個別交換できる関係を指す。実装moduleやnetwork topologyを断定しない。
- 対象はHELIX-HARNESS、HELIX-OS、HELIX-BRAIN、HELIX-LABO、HELIX-INTELLIGENCE、HELIX-SECURITY、HELIX-INFRASTRUCTURE、HELIX-CONNECT。CONNECTは共通部品で業務判断主体ではない。

## 旧FRS資産の保持点と現行との差分

| 旧asset/source | 保持する条件 | 現行候補での変更 |
|---|---|---|
| LEGACY-ASSET-201EED9C5D6D2FF4D41B — archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23-67、SHA-256 bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20 | 独立成立する機能単位、明示依存と範囲、変更から検証へのtrace、局所検証と全体critical pathの分離。 | 旧Functional Release Slice機構は復元しない。HARNESS-L2-010/011のpack、サービス①〜⑦、unit/connection/composite、HARNESS-L2-022の段階受入へ意味を分ける。 |
| LEGACY-ASSET-B75E46DBE77592351574 — archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:31-85、SHA-256 eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17 | owner、dependency、安全閉包、unknown時の停止、unit証拠とcomposite証拠の区別。 | 旧Module/Bundle/channel所有権を移植せず、対象別L2が意味、HARNESS/CONNECTが契約、OSが実行stateを所有する現行境界へ再導出する。 |
| LEGACY-ASSET-67ADFAB856D954B3C5D2 — archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:32-59、SHA-256 bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee | 組合せ固有の受入、unknown/failure、rollbackの独立確認。単体合格から統合合格を推定しない。 | 旧channel/stage全体gateは移植せず、identity・operation・scopeごとのconnection/composite L11へ結ぶ。 |

## 要求上の結合・境界一覧

| 関係 | 密結合として保つ条件 | 疎結合・個別交換できる境界 | source → consumer/executor とID | 更新時に保つこと・L11照合 |
|---|---|---|---|---|
| HARNESSの7サービスとCORE | ①画面プロト/PoC、②要件定義、③設計、④開発、⑤リファクタリング、⑥リリース、⑦運用保守は各々単独利用・単独releaseできる。統合時はV-pair/trace、handoff、composite oracleを満たす。 | 各serviceは独立candidate。要求engine、Design Template、Research Workflow等の共有部品/COREは契約付きで複数serviceに供される。COREは製品意味/traceを持つがOS ticketや実行stateを持たない。 | Concept helix-concept.md:240-277; HARNESS L1 product-intent.md:19-40; L2 product-requirements.md:322-338 (service対応表), 340-478 (HELIXHARNESS-L2-010〜023各本文); L11 product-acceptance.md:199-260。service ID HARNESS-L2-012〜018、handoff/composite 020/021。 | CORE共通contract更新は依存service pack/V-pairをstale化して再照合。無関係serviceを統合release待ちにしない。L11で単体と021 compositeを別判定。 |
| HARNESS工程意味 ↔ OS ticket/execute/accept | 実operationは同一requirement revision/scopeの工程語彙、verification obligation、ticket、assignment、run/result/reviewをtraceする。 | HARNESSが工程語彙・pair/oracle/利用者受入を所有。OSはproject authority/state、ticket、Worker assignment、CI/test運転、result、復旧を所有する。OSは工程意味を再定義せず、HARNESSはticket/許可を出さない。 | HARNESS-L2-020/021/022/023 → HELIXOS-L2-017/018/019/020/023/027。選択runに限りHARNESS-L2-032。OS L11 governance-acceptance.md:380-403,442-478。 | HARNESS contract変更は影響ticket/pair/oracle/resultをstale化し、OSが未完義務を保持する。契約fixtureだけの確認にOS runtime receiptは不要。運用claimは選択run結果をoracleに結ぶ。 |
| BRAIN knowledge ↔ HARNESS CORE/Design Template | 選択designでPattern/Unit/Part、required input、制約/代替/反例/根拠/maturity/versionをHARNESSの要求義務へ対応づける。製品意味・設計合意はHARNESS/requirement ownerに残る。 | BRAINは全体汎用knowledge、source/revision/maturityを所有。HARNESSが候補を選び義務へ対応づける。全Pattern/全BRAIN runtimeを各serviceの前提にしない。 | HELIXBRAIN-L2-018/019 (CORE intake/provision)、022/023/030 (設計/Visual Design handoff) → HARNESS-L2-009/014/026/025。BRAIN L11 brain-acceptance.md:58-62,85-111。 | Pattern pack変更はBRAIN-L2-028とHARNESS-L2-010/011で選択scopeの互換を照合。影響設計だけstale化。受信だけでPatternをaccepted/matureにしない。 |
| INTELLIGENCE proposal → OS assignment → Worker | proposalとOS decision/assignmentは同じticket/revision/scope/budgetでtraceする。提案、実相談、実装、独立reviewを混同しない。 | INTは理解・計画・診断・配置/支援案、OSがticket/authority/assignment/progress、Workerが許可範囲の作業を所有。model/provider/Workerは契約で個別交換できるがproposalは権限を作らない。 | HELIXINTELLIGENCE-L2-010/017/066/068 → HELIXOS-L2-017/018/020/027/028/029。INT L11 intelligence-acceptance.md:131-141,201-209; OS L11:457-478。 | proposal schema/model/input scope変更は該当proposalを再照合。OS assignmentは古いproposalから暗黙変更しない。Worker/助言者を同一成果の独立reviewerにしない。 |
| SECURITY authority/制約 ↔ Worker環境 | 選択operationのactor/target/operation/revision/environment/scope/expiry authority、隔離/data handling/Worker制約が実行環境へ適用・観測される。欠落時は当該operationを開始しない。 | SECURITYは適用するpolicy・scope・有効期限・制御の検証を担う。authorityの決定出所は該当する権限を持つ人または対象owner等の場合があり、SECURITYが全許可を発行するとは限らない。OSはassignment/state、INFRASTRUCTUREはresource/runtime stateを所有する。互換照合等の非送信/非実行操作に無関係な実行許可を要求しない。 | SECURITY-L2-003/007/008/021、INFRASTRUCTURE-L2-010/025、OS-L2-018/020。SECURITY L11 security-acceptance.md:31-32,69-87; INFRA L11 infrastructure-acceptance.md:128-150,290-297。 | 適用scope/expiry/policy/Worker revisionの変更は該当authority/resource結合をstaleにして再照合。無関係operation/projectは包括停止しない。SECURITY-L2-026はGuard 1.0と後続semantic scopeを分離。 |
| INFRA resource/runtime state ↔ OS Work/Change state | ticketが使うresource/environment/artifact revision/observed stateをwork stateへ結び、resource failure/unknownを成功にしない。OSがwork state、INFRAがresource stateの正本。 | 選択provider/resource/environmentだけを契約で接続する。multi-cloud/autoscaling/automatic failover/Web runtime等の後続候補を1.0常時依存にしない。 | HARNESS design→INFRASTRUCTURE-L2-008; OS work↔resource state→009; Worker↔resource→025; 001/003/004/005/006/007資源機能。 | provider/config/resource changeは該当descriptor/work itemを更新しhealth/rollback/evidenceを再確認。OOB recoveryはINFRA-L2-006/010とSECURITY authorityで、停止中OSの通常応答を復旧開始前提にしない。 |
| OS result/evidence → LABO → INT/BRAIN/OS改善 | 評価は同task/scope/revision/versionの実run/receiptに結びつく。LABO評価、BRAIN知識候補、INT proposal、OS record/ticketは別ownerの判断。 | OSは結果・改善候補を記録/進行し、LABOが独立評価、INTがruntime proposal、BRAINが汎用Patternを所有。scoreからassignment/authority/HARNESS規則を変更しない。 | LABO source L2-021〜030、output L2-034〜041/050/052/054〜057/059; INT-L2-010/011/034/067; BRAIN-L2-020/025; OS-L2-005/019。 | oracle/scorer/input version変更時は影響runをstale/比較不能として保持し再評価。欠測・未評価を成功にせず、result presenceや初回成功だけで評価済みにしない。 |
| 機構間edges ↔ CONNECT | 選択edgeの端点業務意味、direction/scope/contract/revision/result ownerを保つ。compositeでは選択辺を端まで追う。 | CONNECT-L2-001〜007はedge登録、version/compatibility、transport/retry/trace、片側交換。業務判断/承認は接続先owner、WEB-CONNECTORとは別。単体機能へ全edgeを常時要求しない。 | CONNECT-L2-001〜007と個別source-edge一覧 connect-requirements.md:139-195。例: BRAIN-018〜023、HARNESS-020、INFRA-008/009/025、INT-017/030〜045、LABO個別source/output。 | endpoint revision変更はCONNECT-002で再照合しstale中は送信停止。片側交換は固定側を変更せずCONNECT-006/L11-006で確認。不一致なら両側成功にしない。attempt/result/unknown/未完義務を保持し新版へ黙って再送しない。 |

### HARNESS七サービスの境界

| Service | 成果物 | L2 candidate | 単体/統合の境界 |
|---|---|---|---|
| ① 画面プロト／PoC | HTML試作、成立性証拠 | HARNESS-L2-012 | ②〜⑦完了を前提にしない。必要なBackflowは要求ownerへ。 |
| ② 要件定義 | 要件定義書 | HARNESS-L2-013、要求形成008 | 形成候補・合意を分離。OSはrevision/stateを管理する。 |
| ③ 設計 | 設計書 | HARNESS-L2-014、CORE/Design Template、選択時BRAIN-022/030 | BRAINは知識候補、HARNESSは義務対応と製品固有設計合成。 |
| ④ 開発 | コード | HARNESS-L2-015 | quality/security oracleを保ち、選択executor結果を受ける。 |
| ⑤ リファクタリング | 境界を保ったコード | HARNESS-L2-016 | affected set、既存contract、検証結果を保つ。 |
| ⑥ リリース | releaseの仕組み | HARNESS-L2-017 | 工程・受入はHARNESS、package build/distribution/promotion/rollback operationはOS。 |
| ⑦ 運用保守 | logと改善の仕組み | HARNESS-L2-018 | runtime/recordはOS/INFRA、効果評価はLABO、提案はINT、要求意味変更はowner。 |

HARNESS-L2-020はservice間handoff、021は統合製品composite。010/011/022/023は複数serviceが使う共有契約で、別製品単位ではない。

## 契約依存とruntime完了待ちを分ける

依存identityの宣言、選択operationのcontract照合、その全runtimeが存在して実行可能であることは別条件である。

| 操作 | 先に要るcontract | runtimeが必要な条件 | 待つ必要がないもの / unknown時 |
|---|---|---|---|
| HARNESS-030 contract-derived test candidate | approved requirement/design、HARNESS-014、022 oracle、010/011 pack-call version/scope、選択source利用許可 | candidate生成の実行環境。testを実行するなら別途選択executor | 032/OS-020 run resultは生成開始前提でない。oracle/permission unknownならcandidate保留。 |
| HARNESS-031 failure shrink | 許可済みfailure log/input、revision/scope、022 failure oracle、031 call contract、副作用抑止 | 同一failureを確認する各段で032 run requestと選択OS-020または利用者CIの後続result | failure sourceがない通常caseにincidentを要求しない。result未着なら候補を保存し、同一failure確認は未完。 |
| INT-068支援proposal | ticket/revision/scope、requirement/design、022 oracle、選択source/use contract | 実相談時のみOS-028/020、loop claimではOS-029段階receipt | proposal生成は相談receiptを待たない。proposalからassignment/authority/successを作らない。 |
| 選択Worker operation | OS ticket/assignment/budget/stop、SECURITY authority/制約、選択INFRA resource、必要HARNESS oracle | 選択Worker runtimeと結果/証拠回収 | 未選択model/CI/source runtimeを一律必須化しない。必須条件unknownなら当該operationを保留。 |
| LABO evaluation | 実run receipt、scope/revision/version、oracle/判定根拠、比較軸 | oracleを対象結果に適用して評価receiptを出す | presence/初回成功だけで評価済みにしない。 |

## 改善候補の流れと所有境界

既存の改善関係は、結果を受け取っただけで意味・採用・実行権限を変えない。HELIXOS-L2-005は記録と改善候補の登録をOSに置き、効果評価と学習をLABOに置く（`docs/helix-os/L2-requirements/governance-requirements.md:291-300`）。HELIXLABO-L2-050はObserved→Correlated→Hypothesized→Experimented→Evaluated→Feedback Candidate→OS registration/target routing→target change process→verification→deployment/operation→LABO re-observationの循環を所有し、登録件数・変更・CI greenだけを完了証拠にしない（`docs/helix-labo/L2-requirements/labo-requirements.md:298-312`）。具体的なtarget変更と採用は該当target ownerの変更手続きに残り、OSは登録・ticket・実行・結果を追跡し、HARNESSは既存oracleで検証し、LABOが運用後の効果を再観測する。

BRAINへの汎用知識候補は別の下流経路である。LABO評価済み候補をBRAIN-L2-020が対象revision・範囲・反例付きで受け取り、OS登録状態を経た後、BRAIN-L2-025が独立検証と採否を分離して扱う（`docs/helix-brain/L2-requirements/brain-requirements.md:414-422,464-472`）。LABO評価はBRAIN採用ではなく、OS登録は意味上の採用ではない。BRAINは製品固有設計やruntime stateを所有しない（同書:454-462）。INTELLIGENCE向け評価材料もLABO-052等の受渡しであって、配置・割当・稼働判断はINTELLIGENCE/OSの既存責務に残す。よって「受領→評価→候補化→OS登録/対象振分け→target ownerの適用→HARNESS/対象側検証→LABO再観測」と「評価済み候補→BRAIN受領→OS登録/振分け→BRAIN独立検証→BRAIN採否」を同一の採用経路に畳まない。

## 個別交換、stale、再検証、未完義務

各edgeはidentity、direction、端点contract revision、依存版、互換範囲、scope、correlation/attempt/result、ownerを持つ（CONNECT-L2-001〜006）。識別可能な端点共有と、同一identity衝突/異なる宣言の重複は分ける。

1. 交換前にproducer/consumer、固定端点revision、対象operation/scope、oracle、未完attempt/義務を特定する。
2. HARNESS-L2-010/011とCONNECT-L2-001/002で両端schema/version/互換範囲を照合する。unknown/未対応/staleをdefaultで補わない。再判定は入力読取りに適用される既存scope/access条件内で行い、operation固有の送信許可は互換参照の前提にしない。
3. 不互換または意味変更なら選択edgeのsend/runを止め、semantic ownerへ戻す。stale解消後の送信再開にはCONNECT-L2-002の互換再判定成功と対象operationに有効な送信適格性の両方が要る。意味不変の片側交換は固定端点を変えずCONNECT-L2-006/L11-006で個別検証する。
4. result/receiptは元revision/scope/attemptに残す。影響した未実行candidate/packet/oracle適用だけstale化する。途中状態・retry可否・停止地点・未完義務・recovery ownerはCONNECT-L2-004/005とOS-L2-019で保持し、新revisionへ混載しない。
5. CONNECT receiptは伝送証拠で、service complete、OS Accepted、LABO evaluatedを代行しない。

| 例 | 期待結果 |
|---|---|
| 選択BRAIN Pattern packが改版、query schema/scopeは互換 | 選択edgeを再照合して個別互換判定。未選択Pattern/consumer runtimeは待たない。 |
| INTが作業前test proposalを返しOSは相談しない | INT単体proposalを確認でき、OS-028相談は未発生。通常assignment/HARNESS oracleへ進む。助言者をindependent reviewerにしない。 |
| CONNECT端点revisionがstale、scope accessは有効 | 入力読取りに適用される既存scope/access条件を保ったまま互換を再判定する。送信には、互換再判定の成功と当該operationの有効なsend eligibilityの両方が必要。送信permitを互換照合の前提にしないが、permitだけでもstaleは解消しない。未完message/receiptをownerへ戻す。 |
| 小変更に無関係な全service/edgeの再受入を要求 | 依存closureに含まれない対象は過剰結合。影響範囲だけ再照合。 |
| oracle/permission/sourceがunknown | fixture greenや似たPatternで補わず該当candidate/operationを保留しownerへ戻す。他の候補は続ける。 |

## 根拠revision・SHA-256

POの総合検証要請: docs/governance/sources/requirements-stage-po-handoff-original-2026-09-27.md:24-42（元のlocal goal file 183–208行をbyte一致保存。source SHA-256 48c272949a6212f7f4d5013a248d0492d047c04a04cbbf693427df385f955f18）。stage release判断recordはdocs/governance/decisions/stage-release-po-decisions-2026-09-27.md（SHA-256 3d98b7a9162a14cc9295c0c0681e95b560da262794d7425cbca2beca985f5ec2）をrelease境界の文脈に限って参照し、要求stage総合検証の採択を代行しない。Conceptの機構責務/七サービス: docs/concept/helix-concept.md:216-277。CONNECT一覧: docs/helix-connect/L2-requirements/connect-requirements.md:33-45,139-195。CONNECT L11: docs/helix-connect/L11-acceptance/connect-acceptance.md:28-38,66-84。

| 機構 | L1 SHA-256 | L2 SHA-256 | L11 SHA-256 |
|---|---|---|---|
| HARNESS | docs/helix-harness/L1-planning/product-intent.md 238ae0590f43c10c0a59a0cea4a9907328752a81388891e1a115d4278db00e1f | docs/helix-harness/L2-requirements/product-requirements.md aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a | docs/helix-harness/L11-acceptance/product-acceptance.md 09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4 |
| OS | docs/helix-os/L1-planning/system-intent.md 2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e | docs/helix-os/L2-requirements/governance-requirements.md c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf | docs/helix-os/L11-acceptance/governance-acceptance.md 925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680 |
| BRAIN | docs/helix-brain/L1-planning/brain-intent.md 2674b2e1a770a038b2d53a93ca635a0cbbfca42af463a562f22e1c51d5ebb5f0 | docs/helix-brain/L2-requirements/brain-requirements.md 01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03 | docs/helix-brain/L11-acceptance/brain-acceptance.md 7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b |
| LABO | docs/helix-labo/L1-planning/labo-intent.md 78b686adcefe6a6867134a17238b59acef19e6c52dc735989f47aa637ed309cc | docs/helix-labo/L2-requirements/labo-requirements.md f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed | docs/helix-labo/L11-acceptance/labo-acceptance.md bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200 |
| INTELLIGENCE | docs/helix-intelligence/L1-planning/intelligence-intent.md 8042335b8a2b33ea41788be03e286cea73b3251f747b6d0fa85350ea322b6fa8 | docs/helix-intelligence/L2-requirements/intelligence-requirements.md 40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260 | docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md 4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a |
| SECURITY | docs/helix-security/L1-planning/security-intent.md b779ae38e077474ee10ee07e1bb50eac1da64a86ee3bf2bc06504c1dd53be61d | docs/helix-security/L2-requirements/security-requirements.md 027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c | docs/helix-security/L11-acceptance/security-acceptance.md 25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01 |
| INFRASTRUCTURE | docs/helix-infrastructure/L1-planning/infrastructure-intent.md 1673cf1333c762b817e1031cb610de90b6e967f7c2d851ab2a4b71e4959ebc37 | docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md 569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b | docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md 7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada |
| CONNECT | docs/helix-connect/L1-planning/connect-intent.md 9c212572afda81405c6d5ab70151f5b35356722204616e85e132162b45907c70 | docs/helix-connect/L2-requirements/connect-requirements.md 31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b | docs/helix-connect/L11-acceptance/connect-acceptance.md bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad |

Concept SHA-256 06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78; product-boundary SHA-256 21730e10f9d784d982c7be5aa2cc57f0bffc53d6a47cd7dcdfa29044996ebe8f.

