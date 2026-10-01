# IR153 HIL-FR-56〜60 現行pair条件監査

- 基準commit: `f38bde044a7dfbf12aec0203b21a9384eef6ad8f`（2026-10-02）
- 対象: 旧IR HIL-FR-56〜60、raw L1 146〜150。旧sourceは読み取りのみ。
- Asset: `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`。disposition ledgerの現行記録は`source_snapshot_preservation` / `preserved_pending_rehome`、product target unresolved、旧authority draft、実行対象外。
- raw L1 SHA-256: `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。旧IR SHA-256: `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 現行HARNESS L2/L11 SHA-256: `e22ff41b5ed36a00c0c0a9807052759d01f930ce5574aa860d80f7b90b76bdf4` / `2cf983e2ac8771badd056f8e49dd0a0f6704a2f088b4f816b99792f5a7a8ac82`。現行INTELLIGENCE L2/L11: `64b41a363f357c273f3cb68fb2be1221d42066b056655aab7922d569e65b3486` / `164a9fcd1d1b5dcd7a0647ab6c1ab231574079bea647a09f9f3fefc213e2dd9a`。
- 旧IR補助file SHA-256: `system_contracts.json` `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`; `acceptance_cases.json` `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`; `system_tests.json` `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`。
- source-file SHAはraw file bytes、source-line SHAは物理行UTF-8 bytes＋終端LF、source_line_textは終端LFなしの本文で計算した。全source line text、line SHA、IR statement/record digest、decision/candidate pinは同名JSONに保存した。旧runtime/test/CI/CLI/hook/adapterは実行していない。137・共通gateはroot担当のため実行していない。

## Authorityと採択revision

採否はL2/L11の候補見出しや古い`registered_proposal`表記でなく、対象revisionを特定するPO decisionとexact section digestで確認した。

- 2026-09-29 decision `po-decision-2026-09-29-57candidates.md` SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、row 52は`HARNESS-L2-047`をA配置で条件付き採択。対象L2/L11 section digestは`733201471492a400db194369980f54499faa7f7860e1e1465c18589a43daa9b9` / `8d92bb157dff9cffd87f72a43c2ce19977667a2fd928b5a3780f1f55912bdcb2`。このdecisionはHARNESSに契約生成規範を置く。本文frontmatterの未採択表記は判断前の候補metadataであり、採択根拠を覆さない。
- 同decision row 85は`HELIXINTELLIGENCE-L2-072`をB配置・version 1.0候補生成とshadow評価まで条件付き採択。decision rowのL2欄`02e8cd954584625a6f02a757e860aed71b0e5a173ba9c5c846c558c0339699e4`はL2-only section hashではなく、r4 receipt規則によるL2/L11各original＋supplementの4-part candidate digestである。receiptに記録された各part hashを再計算するとこのdigestに一致する。L11 section digestは`381e9d205a6d9fdeb61ec453dfb0ea768c13af6200494544c42cdf67062d302a`。現行L2 section単体raw digestは`7329b3b66941fcbc737b5b22bef36a2067f58fe6c7481d93b29cc29a84d53d61`。072の本文見出し・receiptにある古い未採択metadataは採択decisionより優先しない。
- 同decision rows 65/66はOS-042/043を採択（pair digestsはJSON参照）。OS-004はWorker割当・実行統制の既存要求。これらはHARNESSが生成する契約をOSのassignment/runtime authorityに置き換えるものではなく、責務を分担する。
- FR56の工程変換は2026-09-24 PO decision（SHA-256 `a60e2c9c5b9d0828acdf4348e5cabbf7f3c032ec5d33b628f3d9e2bf305176de`、lines 86–89）がDiscoveryとPoCを分け、Decideを独立させた条件と、2026-09-26 V-valley decision（SHA-256 `650264f78387d317eb5dec7a58c14197ac2c97ef712f05cd30ce5e11869cd5ea`）のpair照合を根拠にした。旧S0〜S4名を現行工程名へ機械的に置換してはいない。

## 条件ごとの対応

FR56の条件判定では、HARNESS-L2-002/003 `product-requirements.md:103`と対L11 `product-acceptance.md:37`の個別文言、OS-L2-010 `governance-requirements.md:63`、ticket kind rows `governance-requirements.md:134-138`、OS-L11 HXT-SYS-01 `governance-acceptance.md:308`とOS-L2-017 oracle `governance-acceptance.md:341`を区別して読んだ。一般的なtrace/ticket lifecycleをS1固有保証の証拠にはしていない。


| 旧source | 原文条件・出力 | 現行要求／受入への行き先 | 判定と境界 |
|---|---|---|---|
| HIL-FR-56, raw L1:146 | 選択済みdevelopment styleのlayer I/O、entry/exit gate、下位task、right-arm V-pairへportfolio itemをbind | HARNESS-L2-001〜004のpair/process/verification条件、HARNESS-L11対応oracle、OS-L2-010のticket種別・親・返却先 | 条件は現行layer pairとticketへ再導出されている。旧manifestの物理schemaまで同一とは主張しない。 |
| HIL-FR-56 | S0 hypothesisのgap/親要求、S1 experiment planのcontract snapshot/style return/budget、S2成果物、S3 oracle evidence | `product-requirements.md:103`はS0〜S3の仮説・計画・限定実験・検証と発行元ticketへの返却を明記。`governance-requirements.md:63`と`governance-acceptance.md:341`はticket全体の予算/期限を確認する | 具体条件別: Discoveryの4 phaseの意味・発行元ticket返却・ticket単位budget/期限は保持。S1に結び付いたcontract snapshotとstyle return edgeの義務は、これらの一般phase/ticket記載では証明できずsource holdingに残す。ticket budgetをS1 snapshot内のfieldと読み替えない。旧artifact名の相違だけは欠落理由にしない。 |
| HIL-FR-56 | S4 confirmed/rejected/pivot、back-propagation、未決定結果をproduction currentへ上げない | `product-requirements.md:103`は採用・不採用・方針変更、成功だけでは採用しない、人の要求意味裁定を明記。`product-acceptance.md:37`は意味変更結果だけをBackflow・2次形成・Decideへ送り、人判断なし裁定を拒否。OS ticket table `governance-requirements.md:137-138`は採用/不採用/方針変更の合流先とBackflow先を明記 | 条件意味は具体的に保持。S4専用receiptのphysical schema/nameまでは同一とせず、schema closureを主張しない。 |
| HIL-FR-56 output | workflow binding manifest、phase snapshot、style return edge、S4 decision/back-propagation receipt | process/ticket/evidence traceとS4の結果/Backflowは現行本文にある。S1固有snapshot/style return edgeは上記のとおり未証明。 | 出力の機能条件と旧物理artifact形式を分ける。S1の2条件はsource holding、S4 receipt形式の同一性は主張しない。 |
| HIL-FR-57, raw L1:147 | 工程別目的、観点、反証質問、evidence、severity、escalation/stop、authority、domain/risk、model適性、version | 採択INTELLIGENCE-L2/L11-072（decision row 85、上記exact digest）。L2本文のpack descriptor、適用範囲、source/version、unknown/未評価保持、L11の適用外・版違い・conflict oracle | 1.0候補生成/shadow評価の条件付き採択内で保持。実packの成立・実評価を意味しない。 |
| HIL-FR-57 | judgment-core、role judgment、task lens、specialist skillを非重複packへ合成。source edgeとconflictを保持 | 採択072のpack構成/合成記録節とpaired L11 | 重複整理時も由来edgeを消さず、競合をINTELLIGENCEが黙って優先・削除しない。旧物理registry形式は要求しない。 |
| HIL-FR-57 output | pack、applicability/digest、source skill edge、conflict finding | 採択072のcandidate descriptor/source trace、applicability、shadow evidence、conflict/unknown | 候補段階の出力として保持。active packやgate authorityを自動生成しない。 |
| HIL-FR-58, raw L1:148 | finding、review reversal、retry、escaped defect、skill efficacyから不足観点をcandidate化し改善loopに使う | 採択072本文は1.0のshadow/評価境界と後続版を明示的に分割。HMC-BR-003とINTELLIGENCE-L1-021はIntelligenceによる改善利用を3.0以降の候補へ置き、LABO-L2-050または未採択LABO-L2-063の選択範囲に返す | 1.0の採択に全signal-to-improvement loopを含めない。後続版条件とsource holdingに残し、欠落とも採択済みとも言わない。 |
| HIL-FR-58 | with/without shadow比較、FP/FN、independent review、rollbackを経た版のみactive | 採択072 candidate digestとL11 section digest: 同一scope/revision/case/oracleのshadow比較、FP/FN/unknown/反例、rollback evidence、作成側と分離したreviewer identity/context/authority/route。owner authority採択前はcandidate状態 | 1.0範囲で条件付き採択。旧「別runtime」は実装形の必須条件へ直訳せず、採択済みreviewer独立性の意味で再導出。runtimeの別/同じだけでは独立性を決めない。 |
| HIL-FR-58 negative/output | 判断結果自身を無監査self-trainingに使わない。candidate pack、shadow scorecard、independent review、promotion/rollback receipt | 採択072の候補状態、shadow/review記録とowner/OS側の採択・active/rollback evidence境界 | 072はowner receiptや実際のpromotionを代行しない。静的L11は実行結果ではない。 |
| HIL-FR-59, raw L1:149 | workflow phase/task-kind/design obligation/domain object/risk/judgment packから生成 | 採択HARNESS-L2-047（row 52 A配置） | 対象task/scope/revisionと選択済みprocess/oracle/pack入力へsource-awareに結ぶ。 |
| HIL-FR-59 | contract fields: objective、成果物schema、tool guidance、task boundary、context selector、許可/拒否tools/paths、model/effort、budget、checkpoint、escalation、verification contract。runtime-neutral | 採択HARNESS-L2/L11-047 exact pair | field列挙とruntime-neutral条件を保持。provider/runtime固有設定・固定Worker数を要求しない。 |
| HIL-FR-59 output | generated contract、input/output digest、generation rationale、guard validation receipt | 採択047のcontract・digest・rationale・guard validation要求とL11 oracle | 要求・受入条件であり、実生成や実行済みguard receiptではない。 |
| HIL-FR-60, raw L1:150 | 専門知識、独立context、並列性、blind verificationのいずれかに測定可能な利益があるときだけmuster。single-agent sufficientなら既存role | 採択047の`muster` / `existing_role_sufficient` / `unknown_or_defer`と比較条件 | 保持。未知scopeや比較材料不足をmusterへ推定しない。共通数値閾値を追加しない。 |
| HIL-FR-60 | allowlisted runtime projection、worker/verifier分離、lease/fencing/retire | 採択047 L2 `product-requirements.md:1046-1047`はallowlist projection/lease/fencing/失効/retireとworker/verifierのidentity/context/authority分離を要求し、L11 `product-acceptance.md:786-788`はprofile欠落・lifecycle evidence不足/不一致をunknown/拒否/保留にする。OS-004 L2 `governance-requirements.md:57,293`とL11 `governance-acceptance.md:24`はassignment・実行・回収・budget・失効停止・隔離・credential cleanupを担うが、OS-004単独にはlease/fencing/retireの列挙はない。 | 詳細lifecycle条件の根拠は採択047の本文/L11。OS-004だけでlease/fencing/retireを証明しない。実行成立は未実施。provider/model独立性の正確な根拠は2026-09-26 decision lines 56-60。 |
| HIL-FR-60 output | specialization decision、TeamDefinition、runtime projection、worker/verifier separation、lifecycle receipt | 採択047 L2/L11はmuster/contract/projection/separation/lifecycle evidenceを要求し、OS-004は割当・実行・回収・失効/隔離を担う | TeamDefinitionは旧出力名。名前/物理schemaが現行本文にないことだけでは業務保証の欠落を示さない。物理schema一致や旧output名全件のclosureを主張しない。新候補・人間待ちは作らない。 |

## 候補境界と残件

`HARNESS-L2-054` (`MPR-RC-HARNESS-L2-054-001`) はOS assignmentへのhandoff refinementとして存在するが、9/29 decisionの採択対象ではない。047の採択を上書きせず、054が未採択という事実だけでFR59/60の保証不足とは判定しない。HARNESS-L2-047のcoverage receiptはBR-09/BR-30/FR-59/FR-60の選択4行を限定scopeとして結び、旧asset全体やIR補助contractのclosureを宣言しない。INTELLIGENCE-072 receiptもBR-29とFR-57/58の限定sliceであり、FR58の全source loopを1.0へ移管しない。

FR60のTeamDefinitionという旧出力名について、採択047がspecialist Worker contract/muster/projection、worker/verifier分離とlifecycle evidenceを要求し、OS-004がassignment・実行・回収・失効時制御を要求する。確認した本文に別のTeamDefinition schema名はないが、その名前や物理schemaを持たないことだけでは業務保証不足を示さない。物理schema一致や全旧出力名の同一性を主張しない。新候補・人間待ちは起こさない。

旧IR recordsはFR56が`HR-FR-HIL-20` / `HAC-HIL-20a/b/c` / `HAT-HIL-20`、FR57〜60が`HR-FR-HIL-21` / `HAC-HIL-21a/b/c` / `HAT-HIL-21`へ接続する。旧HATは`designed_not_implemented`、各IR downstream obligationは`pending_pair_descent`。これらの親contract・acceptance・test relationshipを候補採択や現行pairに置換せず、formal successor、実装完了、全IR atom closureを主張しない。

機械可読の各line/statement hashと対応評価は[`ir153-hil-fr56-60-current-pairs-condition-audit-2026-10-02.json`](ir153-hil-fr56-60-current-pairs-condition-audit-2026-10-02.json)を参照。
