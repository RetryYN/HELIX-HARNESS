# 旧HIL-NFR-36の既定逸脱・品質escalation残差照合

初期比較基準: `212cefee88df4b0914c6253aa109fe9d884eae51`。前回比較基準: `dd259dd9a673c910843c85ba4090b5c7f2fe9a68`（main履歴として保持）。前回の現行比較基準: `86ecd59a54f0c612a7f87e1cb4fea038dcc35f3c`（履歴保持）。今回の最新比較基準: `125908004787d949a60c5eb373c93819b0a1ceea`。
記録種別: 旧source条件と現行要求候補の対応を示す作業監査・L2/L11案。要求の採択、旧source closure、実装・実行・受入を表さない。新しい要求IDは発行せず、既存の採択本文は変更しない。

## 結論

旧HIL-NFR-36のうち、task/risk/runtime/model/effort/retry/quality/costを比較・提案・測定する材料は、HELIXINTELLIGENCE-L2-010/011、HELIXLABO-L2-055/059/064、HELIXOS-L2-018/028/029の範囲で部分的に対応する。採択済みHELIXLABO-L2-059は品質gate、scope内の既決priority/tolerance、retry/救援/reworkを含む費用・時間・介入の比較を持つため、その比較契約を重ねて要求しない。

原文で別個に要求される次の二条件は、該当文書の現行L2/L11/consumerを確認した範囲で、明示した成功・欠落・誤順序のoracleまで閉じていない。

1. 選択時の適用既定値と選択値を照合し、逸脱と根拠をreceiptに残すこと。
2. 品質問題が起きた場合、実際に適用したescalation順序と各段階の根拠・結果をreceiptに残すこと。

`HIL-FR-63`の旧文に記録された既定値とrouteの意味は旧source holdingに残り、後継が未割当である。sourceが未再配置であることを条件消失とは扱わない。この作業では旧値、model、effort、閾値、route順を現行仕様へ固定しない。順序・defaultの適用元は現行のscope-boundなdecision/contract ownerに残し、値または順序が未確定ならunknownとして保持するPO意味選択肢を提示する。

## 原文とconsumerの固定証拠

旧sourceの要求本文は原文のまま保持する。

> model/effort選択はtask、risk、runtime、model、effort、retry、品質、costへ追跡可能にし、既定値からの逸脱と品質問題へのescalation順序をreceipt化する。単価だけ又は単発成功だけで最適構成を主張しない。

| 証拠 | locator・状態 | SHA-256 / identity |
|---|---|---|
| preserved L1 source | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:216`; 同一byte snapshot `docs/governance/requirements-source/legacy-documents/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:216` | 全文 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`; source line `b15aad6eeff64e21d844f136a4c65cfe26b0a77cefb8524aecdfa59ff3efd16f`; asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`, ledger revision 3, `preserved_pending_rehome` |
| whole IR | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-36` | file SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`; statement semantic digest `2224ab3bcd6e7974df0e119d9298a784abf86594399cfbe09c6d40b75620f8d3`; status `specified/frozen`, downstream `pending_pair_descent` |
| IR/document relation | `docs/governance/legacy-migration/ir/legacy-ir-document-source-relation.jsonl:138` | `ir_and_preserved_document_exact`; carry status `preserved_pending_rehome` |
| system contract | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-22` | file `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`; digest `511f60ac91a154f4a78a46cc69199afcd4bc3051526e5b16f129620939544c6f` |
| acceptance consumers | `acceptance_cases.json#/HAC-HIL-22a`, `22b`, `22c` | file `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`; a `26efa95135d70f08721c45268240bda8966702e24efc0295eefed81dd48f6f80`, b `16d062e7832826adccd36ce9416eca68730232dc0cbbd9ccf2ec5a2cc52d2763`, c `cd59a8b2ac7063fd09eadaf6e6c60cccf5559c80e30cd4a9d0412cce71a354f5` |
| system test consumer | `system_tests.json#/HAT-HIL-22` | file `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`; digest `35ca0ec2e65aee76da3a540729b33b94b44c0d55d850e1da111210fcc51093d8`; state `designed_not_implemented` |
| related historical route source | `HIL-FR-63`, same preserved L1 document line 153; related condition audit `ir153-hil-fr61-65-current-pairs-condition-audit-2026-10-02.json#HIL-FR-63` | source line SHA `e45658a5729cb4d07aaa569f84571ffe55281644411476097c59f3abf9bce0c2`; statement digest `868712720ee331daaafb3a3103e052e82e89ded6270aa48838349c38ea53b0e3`; IR record digest `734c9ca4bb51ec9de2d5d428e9db24410e8b1e68c6f6711d67f42eb04c7f668b` |

`HR-FR-HIL-22`は、再現可能なBenchと実task scorecardに基づくworker/model/effortの比較、quality/safety/retry込みcost、利用scopeに限った採用・retireを記す。transitionは固定fixture/rubric/task/riskからblind score・effective cost・selection receiptへ進む。failure条件にはsmokeだけによる採用、重大failureの平均化による隠蔽、単価だけの最適化、根拠のないeffort固定がある。evidenceとしてbench、scorecard、routing、exception receiptを挙げる。HAC-HIL-22aはblind benchと実taskに基づく選択の正常consumer、22bは重大failureやscope逸脱を平均化する誤りの拒否、22cはquality低下後の比較/rerouteに関する境界consumerである。HAT-HIL-22はworker bench、実task scorecard、effort routingとfixture/rubric、blind score、effective cost、route receiptを挙げるが、状態は`designed_not_implemented`である。

`MPR-SH-IR-003#HIL-FR-63`と`MPR-SH-IR-003#HIL-NFR-36`はいずれも`preserved_pending_rehome`で、後継要求IDは未割当である。したがって、HIL-FR-63に記録されたupper-tier modelのlow/medium effort既定、lightweight modelのhigh effort既定、および品質不足時の比較条件は旧source holding内に残る。未再配置は意味の消失や既定値の不存在を意味しない。

関連する旧HIL-FR-63はmodel classごとのdefaultと、品質不足時にeffort引上げを先に固定せずmodel/runtime escalationとの比較証拠を残す意味を示す。上記source auditはそのdefault値・specific route policyが現在の採択L2/L11には明示されないと分類している。この旧条件は逸脱receipt/escalation-orderの残差を示す比較根拠として読むが、現行のdefault値や一律の実行順として移植しない。

これらのconsumerは本件二条件の根拠だが、単価最適化・努力固定の包括的拒否や品質悪化後の比較/rerouteだけでは、適用defaultからの個別逸脱receiptまたは各品質問題の順序付きescalation receiptを直接証明しない。旧FR-63の候補設定を現行defaultへ自動移植しない。

## main dd259時点のL2/L11照合と判断境界（履歴）

dd259時点のpair file pin:

| 対象pair | L2 file path・全文SHA-256 | L11 file path・全文SHA-256 | 確認箇所（dd259 revision） |
|---|---|---|---|
| INTELLIGENCE | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` — `1aef1804b6b4e6ffde085a22cc2a66de97bcf90a29a19c7c79001a387c292c39` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` — `28d1f4bff131bc2bdd1c0b4f96b44509e397c0ce1e2c9350c6714b9721f55749` | L2-010 102–107行、011 108–113行、067 466行以降; L11-010/011の個別oracle 163–164行、067受入追補199行 |
| LABO | `docs/helix-labo/L2-requirements/labo-requirements.md` — `cae0cf9f564ec607e855fcc98f934801bee1c63be4b9446f9097578748cb70f6` | `docs/helix-labo/L11-acceptance/labo-acceptance.md` — `39d9ab3605ff6c74fbc4c363ba0125df0461935053e7ef40c50eed1386be882a` | L2-055 150–162行、059 416–440行、064 491–502行; L11-055 191行以降、059比較表約166行、064約233行 |
| OS | `docs/helix-os/L2-requirements/governance-requirements.md` — `027dcf9fb3005e0ed76872b56d3c2e5684ba68d489a803c5f8dfc8b744397da8` | `docs/helix-os/L11-acceptance/governance-acceptance.md` — `62ee2da1ae93e01c0c921e3e35e93661a165bb6c4cf9940142a91971cdc00ec3` | L2-018 672行以降、028 847行以降、029 863行以降; L11-018約345行、028約457行、029約468行 |
| HARNESS（隣接scope確認） | `docs/helix-harness/L2-requirements/product-requirements.md` — `e7bc555844b5f2e3b12a658eedc4d4a832fd53eb62e0a3d11ff5d2bd25c5b492` | `docs/helix-harness/L11-acceptance/product-acceptance.md` — `b029336f68aede1daa4a5b6fcbfd933ef7ac2682664b75ce10d1096dce8219ba` | 067 1274行以降、068 1290行以降; 対応L11節は約993行と1002行 |

POが合意した元pairの固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のfull-file pinsは次のとおり。以下はsection SHAではなく各file全体のSHA-256である。現行dd259 full-file pinsは上表に示す。

| 判断recordのpair | 固定L2 full-file SHA-256 | 固定L11 full-file SHA-256 |
|---|---|---|
| INTELLIGENCE (`f6dad2a33e24f000b87d7f09b8d40288257e74cc`) | `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260` | `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a` |
| LABO (`f6dad2a33e24f000b87d7f09b8d40288257e74cc`) | `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200` |
| OS (`f6dad2a33e24f000b87d7f09b8d40288257e74cc`) | `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |

INTELLIGENCE-L2-067のfixed f6 section SHA `d49b2b0301483d2ca92c4586fa52260e88e3a439a58b2e32b5fd567937d24739`は、dd259 current fileの同じ見出しから次の同階層見出し直前までのbytesと一致する。対応L11 G13 table rowはfixed/dd259 currentとも物理行199、SHA `fc8d1da5f7a9bf06e8d91301f8458a5e4c10780e74a9cfb5fd209c2de824ad14`。PO判断recordの採用一覧にはidentity `HELIXINTELLIGENCE-L2-067` と registration `MPR-RC-HELIXINTELLIGENCE-L2-067-001` がある。したがって対象revisionに関する採否は採用であり、`draft_candidate` / `authority_status:not_adopted` metadataは固定本文・候補状態bytesとして残る表示不整合である。MPR register rowはline 396。初期212ce register file SHAは`f26cc6694c02cbf632bedc993afbc003c779c25296280a1fbbdb9f5b60750e46`、dd259最新register full-file SHAは`d6187625241a5e90aa1e5548186bdd749b7b367064d9c3e00d9c123f867f3dee`。

dd259 main full-file SHAは最新のL2/L11本文pinである。PO判断recordは当初確定した親revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`と適用候補集合を指定する。判断record SHA: INTELLIGENCE `8362ecb58921593b473ac85d277f0db36a7cbe0952268531913191e4eab260ad`, LABO `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`, OS `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`。

| 現行条件・状態 | 現行で確認できる範囲 | HIL-NFR-36の未対応差分 |
|---|---|---|
| INTELLIGENCE-L2-010 / L11 | ticket/task identity、task type/domain/complexity/context/tool requirementとsuccess/failure/rework/latency/cost/reliability実績を用いたscope付きWorker配置proposal。price/model名/Bench単独の判断を拒否し、assignmentはOSが行う。 | 適用defaultと選択runtime/model/effortの対応receipt、逸脱理由・authorityへの参照、品質問題ごとの順序付きescalation traceは明示されない。 |
| INTELLIGENCE-L2-011 / L11 | 同一corpus・responsibility scopeでcurrent/candidate版を比較し、finding/FP/miss/reproducibility/latency/costを示す。不一致条件の比較は不確実として保持する。 | 比較は実際のconfiguration exception receiptでも、品質問題をどの順にescalateしたかの履歴でもない。 |
| INTELLIGENCE-L2-067 / L11 | 固定本文は、scopeに適用するquality gate/priority/tolerance、attempt/effort/Worker/model/version、failure/retry/rescue/rework、cost provenanceを含むLABO evidenceを入力にし、Worker/model-class/effort候補、除外理由、証拠をL2-010 proposal内に出す。proposalとOS assignmentを分離し、新順位付けや自動切替を禁止する。 | 入力とproposal根拠は供給するが、実際のdefault逸脱receiptや品質escalationの各段階・結果の順序付きreceiptは明示しない。**採否表示の不一致**: 固定INTELLIGENCE PO判断record（`helix-intelligence-requirements-po-decision-2026-09-28.md`、上記SHA）はL2-067を採用集合に明記する。L2 metadataとMPRの`draft_candidate; authority_status: not_adopted` / `registered_proposal; authority_effect:none`表示はそれと食い違う。authorityは対象revisionと適用範囲を明記したPO判断recordから読み、L2-067は判断record上採用済みとして照合する。metadataの訂正はこのdraftでは行わない。 |
| LABO-L2-055 / L11 | scope/task-class/model-class別Bench水準、根拠、評価範囲、評価済み/未評価を示す。routing/assignmentはしない。L11は分母、欠測/failure/unknownの扱い、metric/scorer根拠を確認する。 | 現行defaultの選択・逸脱記録や品質findingへの応答順序は定めない。 |
| LABO-L2-059 / L11 | 採用recordが指定するL2-059は費用・時間・介入優先より先にquality gateを判定し、既決priority/tolerance、比較可能なrun、retry/rescue/reworkとcost provenanceを保持する。欠損値はunknownのまま。固定LABO判断recordは`MPR-RC-HELIXLABO-L2-059-002`を指定する。 | 比較定義はそのまま保つ。NFR-36追補はdefault逸脱と品質事象の順序receiptだけとし、費用・時間・人介入・cohort・metric条件を重複させない。 |
| LABO-L2-064 / L11 | blind比較を選んだ場合のidentity/provenanceを保持し、fixture/rubric/judge/sample/retry条件を固定してjudgeから候補名を隠す。評価根拠とassignment authorityを分離する。 | task選択における運用defaultや品質劣化時の順序を定めない。blind評価を実際に選択した場合だけ適用する。 |
| OS-L2-018 / L11 | ticket/assignment/attempt/lane/Worker/model-class/SECURITY/resource/deadline/budget/scopeを識別し、厳密に結び付ける。未完義務をhandoffし、自己reviewを拒否する。 | assignment contextと判断ownerを保つが、performance defaultを選んだり、逸脱/escalation-policy receiptを生成したりしない。 |
| OS-L2-028 / L11 | consultationを選択した場合のhandoffとして、範囲内sourceと回答を保持し、元Workerへ再開入力を戻す。proposalのみでassignmentを作らない。 | 実consultationを選んだ場合だけ適用し、全task共通のquality escalation順序は担わない。 |
| OS-L2-029 / L11 | supportを選択した場合の作業・検証・再作業compositeとして、実Worker/model/effort・attempt・cost・未完義務・budget/stop境界を記録する。 | 当該support compositeを使う場合だけ適用し、default選択や固定support loop/escalation順序は定めない。 |
| HARNESS-L2-067/068 / L11 | 067はsource behaviorのatomization候補、068はdesign refactor計画・rollback候補という別scopeである。 | いずれもmodel/effort選択や品質escalationを担わない。存在だけからNFR-36 closureをclaimしない。 |

### 条件対応と依存分類

| 原文条件 | 現行の対応先 | 照合結果 |
|---|---|---|
| taskとriskのtrace | INTELLIGENCE-010のtask identity/type/scope; LABO-059のtask/scope | 部分対応。059のquality/hard-constraint inputにはriskがあるが、単一selection receiptでtaskとriskの両方を結ぶ条件は明記されない。 |
| runtime/model/effort/retryのtrace | INTELLIGENCE-010/011; INTELLIGENCE-067 proposal input; LABO-055/059/064のresult record; OS-018 assignment、利用時のOS-029 | 証拠・比較項目は分散して存在するが、選択configuration全体の統合receiptは要求されない。runtime/model/effortのdefault値は推定しない。 |
| quality/costのtrace | HARNESS-022が選択されたquality/oracleを所有; LABO-059がquality-first比較とcostを所有; INTELLIGENCE-011/067はscope付き結果を受け取る | 既存条件を保持する。LABO-059のcost分類を再記述せず、proposalをquality acceptanceと扱わない。 |
| 適用defaultからの逸脱receipt | 選択pair内に該当する厳密条件なし | 真の残差。default参照/revision/scope、選択configuration、逸脱有無、必要に応じ理由/evidence/owner decisionを保持する。適用defaultを確立できない場合は逸脱状態unknown。 |
| 品質問題に対するescalation順序receipt | HAC-HIL-22cとLABO-059は比較/rerouteとquality-first報告を支援; OS-018/028/029はassignment/条件付きhandoffを保持 | 真の残差。品質事象と順序付きpath、その実施step/resultを束ねる現行L2/L11条件が見当たらない。固定global sequenceは作らない。 |
| 単価だけ・一度の成功だけで最適としない | INTELLIGENCE-010はprice/model/Bench単独を拒否; LABO-059はqualityと計測済み総費用を比較; HAC-HIL-22a/bとHATはsmoke/重大failure相殺/単価のみを拒否 | 既存coverageを保持する。一成功runや低単価だけで二つの残差receiptを満たしたことにはしない。 |

### HARNESS-L2-023に従う依存4分類

HARNESS-L2-023の対象revisionは、2026-09-28 HARNESS PO判断recordの明示採択集合に含まれる。HARNESS-023の現行MPR登録行349は登録recordであり、PO採否そのものではない。以下の4分類は023が定める実行dependency closureに適用し、依存外の説明を第五分類にしない。source authorityと実行依存は別の分類軸である。whole-IR `HIL-NFR-36`は規範source、旧L1 line 216はcorroboration、HR/HAC/HATはconsumer contextであり、IRやL1を実行dependencyへ分類しない。各実行依存にはowner、contract revision/range、適用条件、field別compatibility根拠を束ねる。例の`fixture:*`値はoracle用mockであり、現行製品owner・version・schemaを指定しない。

| HARNESS-023分類 | 本監査での適用 | 正常fixtureと証拠tuple | 欠落・誤り時の戻し先 |
|---|---|---|---|
| **常時必須** | 選択されたtask/scope/revision、当該runのOS assignment/attempt、HARNESS quality oracle identity/revision、当該runに存在する設定・結果・cost/retry evidenceを照合する。normative IR identityはsource authorityとして保持し、023の実行closureには数えない。 | `fixture:task-A@r1`（owner `fixture:task-owner-A`、契約/range `task-contract-A@r1`/`r1`、条件「task Aを選択」）；`fixture:assignment-A@r1`（owner `fixture:os-assignment-owner`、契約/range `os-assignment-contract-A@r1`/`r1`、条件 `assignment=A and attempt=1`）；`fixture:oracle-A@r1`（owner `fixture:harness-oracle-owner`、契約/range `quality-contract-A@r1`/`r1`、条件 `scope=A`）；`fixture:run-A@r1`（owner `fixture:execution-observer`、契約/range `run-evidence-A@r1`/`r1`、条件 `assignment=A/attempt=1`）。互換性根拠`fixture:compat-always-A@r1`は依存closure契約の対象revisionと上記各fieldの一致理由を記録する。 | task/sourceはtask owner、assignment/run receiptはOS、quality oracleはHARNESSまたは要求ownerへ戻す。不明な適用性を非該当・成功にしない。 |
| **特定操作時のみ必須** | 比較評価、blind評価、相談、支援compositeまたは品質escalation処理を実際に選択したoperationだけ、その契約とreceiptを有効化する。選択していないoperationはclosure外とし、成功にも失敗にも数えない。 | `fixture:compare-A@r1`（owner `fixture:labo-evaluator`、契約/range `compare-contract-A@r1`/`r1`、条件 `operation=compare`）；`fixture:consult-A@r1`（owner `fixture:os-consult-handoff`、契約/range `consult-contract-A@r1`/`r1`、条件 `operation=consult_selected`）；`fixture:support-loop-A@r1`（owner `fixture:os-composite-owner`、契約/range `support-contract-A@r1`/`r1`、条件 `operation=support_composite_selected`）。互換性根拠`fixture:compat-operation-A@r1`は選択operation、対象L2/L11 revision、scopeとreceiptの対応を記録する。 | operation適用性/receiptはそのoperation ownerへ戻す。比較を選ばないrunにLABO-064やOS-028/029を一律要求しない。 |
| **選択した入力元に応じて必須** | 既定値や順序を定める既存decision/policy、INTELLIGENCE proposal、LABO evidence、相談時のcontext sourceのうち、実際に選択入力へ加えたものだけをsource identity/revision/scopeとともに閉じる。未選択sourceは未観測であり、暗黙fallbackしない。 | `fixture:default-policy-A@r1`（owner `fixture:existing-policy-owner`、契約/range `default-policy-A@r1`/`r1`、条件 `scope=A selected`）；`fixture:order-policy-A@r1`（owner `fixture:existing-policy-owner`または別途識別した`fixture:order-owner`、契約/range `escalation-policy-A@r1`/`r1`、条件 `quality-event=A`）；`fixture:proposal-A@r1`（owner `fixture:intelligence-proposal`、契約/range `proposal-contract-A@r1`/`r1`、条件「proposalを入力に選択」）；`fixture:bench-A@r1`（owner `fixture:labo-evidence`、契約/range `bench-contract-A@r1`/`r1`、条件「bench resultを選択」）。互換性tuple `fixture:compat-selected-A@r1`は両契約、exact range、選択source、対象scope、fieldごとの一致結果と理由を示す。`compatible`という一語だけでは足りない。 | 選択source契約の欠落/staleはそのownerへ戻す。未選択sourceや過去の多数例から結果・default・orderを推定しない。 |
| **参照資料のみ** | HR/HAC/HATは旧consumerの意味を説明するcontextである。旧implementation/runtime、未選択のsupport mode、背景資料は現行実行closureに入れない。normative HIL-NFR-36 IR sourceとL1 corroborationはreference-onlyへ降格しない。 | `fixture:legacy-HAT-context@sha256:7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`（owner `fixture:historical-context`、rangeは固定source digest、適用条件は旧consumerの解釈のみ、execution compatibilityは`not_applicable_for_execution`）。 | contextの不確実性だけでは選択中のoperationを止めない。一方で、現行の受入、既定値、順序、実行を成立させる根拠にもならない。 |

### 条件別identityと責務の照合

revisionとrangeの値は、元sourceの採択pairではsection SHAを固定revision証拠として使い、後発candidateでは同じpathのheading section digestを使う。以下のmock fixtureは前節の四分類を具体化する。実owner・compatibility range・scopeが決まっていない場合は候補に値を作らず、fixture ownerと未解決欄を分ける。

| Identity / 所有者・状態 | 対象revisionと正確なL2/L11 locator | 適用条件と具体fixture | NFR-36への寄与と残差 |
|---|---|---|---|
| `HARNESS-L2-023` / HARNESS、採択済み | 固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、現行dd259比較。L2 `docs/helix-harness/L2-requirements/product-requirements.md` 見出し `HARNESS-L2-023`（L2:463行）；L11 `docs/helix-harness/L11-acceptance/product-acceptance.md` 行223。file全体SHAは直上のpin表を参照。 | この利用要求で適用されるpack operation/sourceを選択。`fixture:pack-A@r1`、`fixture:operation-A@r1`、`fixture:source-A@r1`、`fixture:reference-A@sha256`を同じ利用要求へ束ね、四分類とclosure理由を再現する。 | 正式な依存分類を供給する。HIL-NFR-36のdefault/order意味や実行receiptは所有しない。 |
| `HARNESS-L2-022` / HARNESS、選択scopeのoracle owner | 固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、現行dd259比較。L2 `docs/helix-harness/L2-requirements/product-requirements.md` 見出し `HARNESS-L2-022`（L2:447行）；L11 `docs/helix-harness/L11-acceptance/product-acceptance.md` 行217。 | 対象quality checkを実施・評価するとき。`fixture:oracle-A@r1`と`fixture:quality-result-A@r1`をrequirement identity/revision、scope、適用枝、結果/根拠へ結ぶ。 | quality acceptanceの規範は担うが、選択runtime defaultやescalation順序は決めない。 |
| `HELIXINTELLIGENCE-L2-010` / INTELLIGENCE、採択 | 固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、現行dd259比較。L2 `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` 見出し（L2:102行）；L11 `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` 行163。 | task/risk/scopeで配置proposalを作るとき。`fixture:proposal-A@r1`はtask/risk、選択時LABO入力、候補Worker/model/effortと根拠を結び、proposal状態をOS assignmentから分離する。 | proposal evidenceを供給する。実assignmentやdefault逸脱receiptは生成しない。 |
| `HELIXINTELLIGENCE-L2-011` / INTELLIGENCE、採択 | 固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、現行dd259比較。L2 `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` 見出し（L2:108行）；L11 `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` 行164。 | model/provider比較を選んだcallだけ。`fixture:comparison-A@r1`は同一task/scope/corpus、candidate revision、metric、uncertaintyを結ぶ。 | comparison evidenceを供給する。実行された変更履歴やescalation receiptではない。 |
| `HELIXINTELLIGENCE-L2-067` / INTELLIGENCE、PO decision採択（metadata表示不一致） | 固定sectionはINTELLIGENCE L2 `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の見出し `HELIXINTELLIGENCE-L2-067`（L2:466行）；L11 G13 rowは物理行199で固定/current SHA-256 `fc8d1da5f7a9bf06e8d91301f8458a5e4c10780e74a9cfb5fd209c2de824ad14`。current全file pinsは直上表。 | proposal入力に選択された場合。`fixture:proposal-input-067-A@r1`は採択済みL2-067 revision、選択source、task/scope、LABO evidenceとproposal outputを結ぶ。 | 配置候補の入力条件を補強する。default/orderの実施・receiptは作らない。PO判断recordの採用一覧が対象revision authorityであり、candidate metadataは固定bytesの不一致として記録する。 |
| `HELIXINTELLIGENCE-L2-068` / INTELLIGENCE、候補・未採択 | current dd259 revision。L2 `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` 見出し `HELIXINTELLIGENCE-L2-068`（L2:491行）；L11 `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` 見出し（L11:201行）。 | 作業中支援proposalを選択した場合だけ。`fixture:diagnostic-proposal-A@r1`はoriginal assignment/attempt、stuck scope、選択context source、proposal revisionを結び、actual consult receiptは含めない。 | 相談proposal側の最新同役割。OS-028の実相談handoffと混ぜず、proposal要件を重ねない。 |
| `HELIXLABO-L2-055` / LABO、採択 | 固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、現行dd259比較。L2 `docs/helix-labo/L2-requirements/labo-requirements.md` 見出し（L2:150行）；L11補強見出し（L11:191行、要約行56も確認）。 | 対象task/model classをBench評価するとき。`fixture:bench-A@r1`はtask class、model class、sample/denominator、metric/scorer、unknown coverageを結ぶ。 | 性能基準/evidence。routing・assignment・default選択はしない。 |
| `HELIXLABO-L2-059` / LABO、採択 | 固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、現行dd259比較。L2 `docs/helix-labo/L2-requirements/labo-requirements.md` 見出し（L2:416行）；L11補強見出しと正常fixtureは`docs/helix-labo/L11-acceptance/labo-acceptance.md`（L11:166–170行）。 | 比較評価operationを選択した場合。`fixture:effect-comparison-A@r1`はquality gate、適用priority/tolerance、比較可能run、retry/rescue/rework、cost provenanceを結ぶ。 | 既存の費用・時間・介入比較を再要求しない。comparison自体は逸脱receiptでもquality escalationの実履歴でもない。 |
| `HELIXLABO-L2-064` / LABO、採択 | 固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、現行dd259比較。L2 `docs/helix-labo/L2-requirements/labo-requirements.md` 見出し（L2:491行）；L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md` 見出し（L11:233行）。 | blind comparisonを選択した場合だけ。`fixture:blind-bench-A@r1`はfixture/rubric/judge/sample/retry、candidate blinding、result provenanceを結ぶ。 | blind評価の条件。全run必須ではなくrouting/sequenceも決めない。 |
| `HELIXLABO-L2-060` / LABO、候補・未採択 | current dd259 revision。L2 `docs/helix-labo/L2-requirements/labo-requirements.md` 見出し（L2:441行）；L11 `docs/helix-labo/L11-acceptance/labo-acceptance.md` 見出し（L11:178行）。 | 同一設定で支援有無の比較を選択した場合だけ。`fixture:support-effect-A@r1`は同一task/model/version/effort/oracleとsupport on/offのpaired OS resultsを結ぶ。 | 支援効果の評価であり、support executionやescalation orderを運転しない。 |
| `HELIXOS-L2-018` / OS、固定対象revisionで採択 | 固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、現行dd259比較。L2 `docs/helix-os/L2-requirements/governance-requirements.md` 見出し（L2:672行）；L11 `docs/helix-os/L11-acceptance/governance-acceptance.md` 見出し（L11:345行）。 | assignment/attemptを作成するrun。`fixture:assignment-A@r1`はticket/revision/scope、assignment/attempt、Worker/model class、authority/resource/lease、execution eventsを結ぶ。 | 実割当・実行統制とidentity owner。INT proposalから実assignmentへ移す既存routeの実行記録をOS側で保持するが、policy上のdefault/orderは決めない。 |
| `HELIXOS-L2-028` / OS、固定対象revisionで採択 | 固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、現行dd259比較。L2 `docs/helix-os/L2-requirements/governance-requirements.md` 見出し（L2:847行）；L11 `docs/helix-os/L11-acceptance/governance-acceptance.md` 見出し（L11:457行）。 | consultation/handoff operationを選択した場合だけ。`fixture:consult-handoff-A@r1`はsource assignment/attempt、選択context/provenance、OS consultation assignment、response/receipt、return handoffを順序付きで結ぶ。 | 実相談handoffを持つ。任意の品質問題に対する全般的escalation orderは定めない。 |
| `HELIXOS-L2-029` / OS、固定対象revisionで採択 | 固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、現行dd259比較。L2 `docs/helix-os/L2-requirements/governance-requirements.md` 見出し（L2:863行）；L11 `docs/helix-os/L11-acceptance/governance-acceptance.md` 見出し（L11:468行）。 | support→verification→rework compositeを選択した場合だけ。`fixture:support-composite-A@r1`はactual worker/model/effort、attempts、verification、rework、cost、open obligations、stop/budget edgeを結ぶ。 | compositeの実運転を束ねる。比較評価はLABO-059/060、実consult handoffは028の境界。 |
| `HELIXOS-L2-104` / OS、候補・未採択 | current dd259 revision。L2 `docs/helix-os/L2-requirements/governance-requirements.md` 見出し（L2:1304行）；L11 `docs/helix-os/L11-acceptance/governance-acceptance.md` 追補（L11:915行）。 | operationにauthority/isolation/quality結果の三面を結ぶ場合。`fixture:operation-evidence-A@r1`はSECURITY authority、environment isolation observation、HARNESS quality resultを同一operationへ別々に結ぶ。 | 品質受入を別receiptと取り違えない隣接候補。受入結果だけではdefault逸脱やescalation step/order receiptにならない。 |

**既存記録経路と後発候補の追加照合**：`HELIXOS-L2-019`（`docs/helix-os/L2-requirements/governance-requirements.md`見出しL2:682、`docs/helix-os/L11-acceptance/governance-acceptance.md`見出しL11:352）はevent/source/revision/correlation、実行・検証結果、訂正、checkpoint、未完義務の記録・再構築を担い、欠落/stale/未実行をsuccessから分ける。`HELIXOS-L2-023`（同L2文書L2:722、同L11文書L11:380）は管理→推進→Worker→検収のhandoffをrevision/digest、因果ID、scope、未完義務、停止理由、evidenceへ結ぶ。この二つは実際のevent/handoffを保持できる既存経路だが、HIL-NFR-36のquality eventに結び付いた適用default/order source、各escalation step/resultの意味判定を規定する記述とは確認できなかった。

後発対象も各々の明示scopeで照合した。`HELIXINTELLIGENCE-L2-068`（dd259 INTELLIGENCE L2:491、L11:201）は対象revisionがPO判断で採択済みだが、candidate metadataは固定bytesとして候補表示を残す。これは、作業前のtest/instruction candidateをfailure報告なしで作れる一方、diagnosis operationには症状・観測・再現根拠を求め、INTELLIGENCE自身はtestを実行・承認せず、実相談はOS-028へ分ける。`HELIXLABO-L2-060`（dd259 LABO L2:441、L11:178）は対象revisionがPO判断で採択済みだがcandidate metadata表示を残す。同一task/oracle/worker/model設定のsupport有無を比較し、支援に要したworker・相談・再実行・review・人時間/costを比較へ含めるが、supportを運転せずescalation sequenceも規定しない。`HELIXOS-L2-104`（dd259 OS L2:1304、L11:915）は2026-09-30 decision 57行で対象revisionが採択されたが、L11固定bytesは未採択・未実行の候補表示を残す。これは採択対象状態との表示不整合であり実行済みではない。SECURITY authority、隔離適用観測、HARNESS品質結果を同一operationへ別々に結び、結果の非代用を保つ候補である。これは三結果の結合でありdefault逸脱・順序receiptを生成する記述ではない。これらの既存route/candidateは今回の不足条件と役割が重なる箇所だけを確認し、追加candidateや新しい責務を起こす根拠にしない。

規範source authorityはwhole-IR identity `HIL-NFR-36`（上記record/file pin）である。旧L1 line 216は同じ意味に対応するMarkdown表の記述であり、IR statementとbyte-identicalな文字列ではない。corroborationとして扱い、別の要求authorityや追加atomにしない。HR-FR-HIL-22、HAC-HIL-22a/b/c、HAT-HIL-22は旧system contract/acceptance/test consumer contextであり、normative source identityにも現行の実行証拠にも置き換えない。

INTELLIGENCE-010/067のproposal生成と、実際の相談・割当・順序receiptの責務を分ける。提案の入力に使ったINTELLIGENCE/LABO source tupleはINTELLIGENCE proposalの入力証拠へ結び、proposal自体に実行済み順序receiptを生成させない。実際のassignment/attempt/event receiptは、そのoperationを所有するOSの既存event経路が生成・保持する。追補案は適用可能な実行receiptへの参照を束ね、INTELLIGENCEへ実行receipt生成を移さない。該当event receiptが現行経路で得られない場合は欠落を残差として保持する。OS-018は実際のassignment/attemptとeventを保持する。OS-028は選択された相談の実handoff、OS-029は選択されたsupport compositeを保持する。OS-023/019のhandoff・evidence/continuity記録、およびOS-104のoperation結果結合は近接する既存route/contextであり、これらに実順序receiptが明示されていると誤読しない。したがって不足するのはproposal-to-assignment間の権限移譲ではなく、scope-bound order sourceと、実際に通過したescalation step/resultを同一品質事象へ結ぶoracleである。既存OS記録契約に、品質event identity、適用scope/order source、実際のstep順、各stepの根拠/result、未完義務のtupleが選択scope内で確認できる場合はそれを再利用する。OS-018/028/029等の既存条件にその具体tupleが示されていると推測しない。欠落時は既存OS/meaning ownerへ差分を返し、新規ownerや候補IDを発行しない。

**最新main dd259の再比較**：`dd259dd9a673c910843c85ba4090b5c7f2fe9a68`の現行要求本文を直接確認した。OS L2 full-file SHA `027dcf9fb3005e0ed76872b56d3c2e5684ba68d489a803c5f8dfc8b744397da8`、INTELLIGENCE `1aef1804b6b4e6ffde085a22cc2a66de97bcf90a29a19c7c79001a387c292c39`、LABO `cae0cf9f564ec607e855fcc98f934801bee1c63be4b9446f9097578748cb70f6`は初期比較基準212ceの同じ文書と全文SHAが一致し、OS-018/028/029、INT-010/011/067、LABO-055/059/064の確認範囲に差分はない。HARNESS L2/L11は212ceからdd259の間に更新され、最新全文SHAはそれぞれ`e7bc555844b5f2e3b12a658eedc4d4a832fd53eb62e0a3d11ff5d2bd25c5b492`、`b029336f68aede1daa4a5b6fcbfd933ef7ac2682664b75ce10d1096dce8219ba`である。HARNESS-023の四つの依存分類と9/28 decision対象をこの最新本文で確認した。最新dd259の隣接候補INT-068（相談proposal）、LABO-060（支援有無比較）、OS-104（authority/isolation/quality結果）も各scopeで確認した。これらは今回の不足条件を一部補助するが、OS-028の実相談handoff、OS assignmentの実行receipt、品質事象に結ぶ適用orderと実順序のtupleまでは供給しない。既存候補を重複起草せず、条件差分として記録する。

## 未採択L2/L11追補案（ID・本文変更なし）

以下は既存INTELLIGENCE-L2-010/011の責務境界に沿う候補文であり、正式L2本文ではない。wire schema、field名、default値、model/effort値、threshold、全域の順位は決めない。

**L2追補案**：

> 選択候補の記録は、同一task/scope/riskとOS assignment/attemptに結び付く実行runtime・model・effort・retry、HARNESS quality oracle/result、scope内cost evidenceを追跡できる。実際のassignment/attempt/eventのreceiptは適用可能なOS実行経路の生成物を参照し、INTELLIGENCE proposalはその実receiptを生成・代行しない。適用可能な既定構成が既存のdecisionまたはpolicyに定義されている場合は、そのidentity/revision/scopeと選択構成を対応づけ、逸脱の有無および逸脱時の根拠・適用可能なdecisionを記録する。該当既定構成が不明・失効・適用範囲外なら推測せずunknownとし、該当decision ownerへ戻す。品質問題が記録されたrunでは、適用可能なowner decisionまたはpolicyが定めるescalation順序と実際に通った各段階・結果を記録し、比較 evidenceと結ぶ。順序のsource/適用性が不明ならunknownを保持し、順序を発明しない。単価または単発成功のみで最適構成を主張しない。INTELLIGENCEはproposalと証拠の提示を担い、LABOは比較評価、OSはassignment/進行、HARNESS/要求ownerはquality oracle、既存decision ownerはdefault/order meaningをそれぞれ保持する。

**L11追補案—正常例**：

> fixtureに、同一task/scope/risk、OS assignment/attempt、実行configuration、HARNESS oracle/result、retry/cost evidence、および当該scopeへ適用できる既存defaultのdecision identity/revisionを与える。receiptは比較対象のdefault構成と実際の選択構成を区別し、逸脱の有無を根拠付きで返す。次に、品質oracleが問題を示したrunへ、既存owner decision/policyの順序と対象範囲を入力し、実際に適用した各段階、その根拠、結果、次に残る義務を当時の実行順で結ぶ。oracleはpolicyに記された値の忠実な追跡を確認するだけで、新しい順序、model/effort、閾値、実行許可を生成しない。

**L11追補案—独立負例**：

- 他の全てを保持してdefault identity/revisionだけ欠落またはscope不一致にしたfixtureでは、逸脱有無をunknownにし、過去runや多数派構成からdefaultを推定しない。
- 他の全てを保持してdefaultは明示、選択値は異なるが逸脱理由・適用decisionだけ欠落したfixtureでは、逸脱receiptを未完とする。価格が安い、品質が高い、または結果が成功というだけで理由を補わない。
- 他の全てを保持してquality finding/eventだけ欠落したfixtureでは、escalation履歴の不在から品質問題なしと推定しない。逆にquality findingがあれば、escalation receiptがないのに順序処理済みとしない。
- 他の全てを保持してescalation order sourceだけ欠落/unknown/staleにしたfixtureでは、実施順の規範適合をunknownにする。実行ログに観測できる順序があれば事実として記録できるが、正しいpolicy順序だったとは判定しない。
- source orderを固定したfixtureに対し実際の順序を一段入れ替えたもの、適用範囲外の順序を流用したもの、段階を抜いて結果だけsuccessとしたものを別々に与え、不一致または未完を返す。候補モデルの成績平均、単価、後続の一回成功で相殺しない。
- defaultからの逸脱receiptだけ存在しquality-escalation receiptがないfixture、およびその逆も別々に未完とする。二条件を一つの要約欄で相互代用しない。

**L11追補案—未見例**：

> 未見のtask class、risk scope、runtime/model revisionまたは新しいdefault/policy revisionで、既存のdecision適用性・互換性が示されないfixtureを与える。旧scopeのdefault・成功履歴・escalation orderを新scopeへ一般化せず、該当箇所のみunknown/未評価として返す。該当ownerはtask/scopeをOS、performance/BenchをLABO、quality oracleをHARNESSまたは要求owner、default/escalation meaningをその既存decision ownerとする。無関係なtaskの結果、全体停止、追加承認、実験開始をこの候補から生成しない。

## PO意味選択として残す点

旧NFR-36は「品質問題へのescalation順序をreceipt化」と要求するが、現行新世代で適用する規範順序のidentity/source、既定値を持つauthority owner、sequence自体の意味を指定していない。下流作業で推測を避けるため、以下の意味選択肢を提示する。

- **A（推奨提示）**: 現行のscope-boundな既決decision/policyが指定するdefault/orderがある範囲だけ規範適合を評価し、receiptにはその原文source/revision/scopeと実際の逸脱・順序を記録する。決定のない範囲では事実receiptを保持しつつ規範適合をunknownにし、既存meaning ownerへ返す。固定値や新たなapproval stepを設けない。
- **B**: 既存decision/orderがなくても、当該operationで実際に辿った選択・段階を記録する要件としてのみ扱い、規範的な適否判定はしない。後から比較できるが、policy違反・遵守はclaimしない。
- **C**: default/orderの意味を今回の要求層で新規に定義する。これは現行PO判断に含まれない意味変更であり、具体的な人の判断とscope指定を要するため、本案では実施・推奨しない。

## 旧sourceから現行案への変更・未完

保持する点: task/risk/runtime/model/effort/retry/quality/costの追跡、既定逸脱と品質問題escalationのreceipt、価格だけ/単発成功だけの最適化拒否。

変更する点: 旧HIL-FR-63のmodel/effort初期値、旧router/runtime、旧固定retry/model hierarchyは現行値として移植しない。quality/cost比較は採択済みLABO-059と責務分離し、INTELLIGENCEは入力・proposal、LABOは計測比較、OSはassignment、HARNESS/要求ownerはoracle、scope-bound decision ownerはdefault/escalation meaningを維持する。

旧監査の訂正範囲: `docs/governance/audits/requirements-stage/legacy-ir-quality-source-recheck-2026-09-28.md:324-330`（全文SHA-256 `74d339e4b44987eade8f16bb9dd964a91c7f62580062250fee3c75e421579d81`）はINTELLIGENCE-010/011/067とLABO/OS条件を挙げ、「条件単位では再導出済み」と記すが、default逸脱receiptとquality escalation順序receiptを個別fixture/oracleに結んでいない。この結論は本照合で確認した範囲を越えるため、後続の総合整理で当該二atomについて限定・訂正する必要がある。過去監査の履歴本文はこのdraftから変更しない。

未完: 適用default/orderのcurrent source、許容される事実receiptと規範適合receiptの分離をPO選択肢へ残す。INTELLIGENCE-L2-067はPO判断recordにより対象revision上採用されているが、metadata表示は不一致のまま。旧sourceのformal successor、L2/L11追補採択、implementation, test execution, quality outcome, source retirementは未証明。旧test/runtime/CLI/CIは参照のみで実行していない。


## main 86時点の採否・14 pair locator照合（比較履歴）

対象commitは `86ecd59a54f0c612a7f87e1cb4fea038dcc35f3c`。以下の行と選択bytesを当該commitのgit blobから再抽出した。見出しlocatorはその見出しから次の同階層以上見出し直前までを選び、末尾空行を除いてLFを1つ付けてSHA-256化した。行locatorは指定された生bytes（末尾LFを含む）をSHA-256化した。file SHAはraw全bytes。これらは対象範囲の一致を示し、未選択本文や実行・受入を証明しない。

| Identity / owner / 対象revisionの状態 | 現行L2 locator SHA-256 | 現行L11 locator SHA-256 | 採否根拠・記録 |
|---|---|---|---|
| HARNESS-L2-022 / HARNESS / fixed 9/28 pairで採択 | L2 447–462 section `88cb5ac2fb5922ebff745b0827b8e8a9ef1273b66f946faf4a265124ebf9fdc1` | L11 row 217 `75f4de4a008c8e7dce69c72aad261b1069ef9a4c772b689679af03e52c701755` | HARNESS 9/28 decisionは明示候補24件を採択。MPRの`registered_proposal; authority_effect=none`は登録状態。|
| HARNESS-L2-023 / HARNESS / fixed 9/28 pairで採択 | L2 463–498 section `32ad44e70357315304c5da5ce012f7ba4b9956e27a699f21ecddea1c54eeaf03` | L11 row 223 `f209dace6dd361437dd2f37785216ff7cdc3e69ef298ce760e1574033c4beaf4` | HARNESS 9/28 decisionの明示候補24件に含まれる。4区分はこの監査の分類根拠として採用済み本文から参照。|
| HELIXINTELLIGENCE-L2-010 / INTELLIGENCE / adopted | L2 102–107 section `29b05afbff84475d17b9b1f0698762dab2a1be92480313833d9c8fef87d410c1` | L11 row 163 `a27a934f442d8ae650deca348885f0d9eee5158e2bc17c550c731df8de0b98c2` | INTELLIGENCE 9/28 decisionの採択集合に含まれる。MPR register row 397 (`MPR-RC-HELIXINTELLIGENCE-L2-010-004`)。|
| HELIXINTELLIGENCE-L2-011 / INTELLIGENCE / adopted | L2 108–113 section `03d87e0c313f91b6a5422f7e9e448fba1138df83017d89f6a2021b25afc7944c` | L11 row 164 `2c55d84aa7408b27e5fa5dda0f7b9ff4d03873390791553f4de19e6b304b32b3` | INTELLIGENCE 9/28 decisionの採択集合に含まれる。MPR register row 398 (`MPR-RC-HELIXINTELLIGENCE-L2-011-004`)。|
| HELIXINTELLIGENCE-L2-067 / INTELLIGENCE / adopted（metadata不一致） | L2 466–490 section `d49b2b0301483d2ca92c4586fa52260e88e3a439a58b2e32b5fd567937d24739` | L11 row 199 `e21a75c053fb953850f81f76105080a1a27ab8ed781d94f256b3bd989e21b2fd` | INTELLIGENCE 9/28 decisionの採択集合に含まれる。MPR register row 396 (`MPR-RC-HELIXINTELLIGENCE-L2-067-001`)。candidate metadataは過去状態として保持。|
| HELIXINTELLIGENCE-L2-068 / INTELLIGENCE / adopted（candidate metadata不一致） | L2 491–506 section `d5145aae05dffd5bc61d795748060fca95f446be0b100b786a178bcf503452bf` | L11 201–210 section `f9733900a979eebc6058056ea6b51370f4acd5b602955988985bb1dbf97b3d26` | INTELLIGENCE 9/28 decision full SHA `8362ecb58921593b473ac85d277f0db36a7cbe0952268531913191e4eab260ad`; row 98 raw-with-LF SHA `e67c4a4fda50180a66bc823eaae0a809351c3c0ed677542de912b846c20aa896`; registration `MPR-RC-HELIXINTELLIGENCE-L2-068-002`。|
| HELIXLABO-L2-055 / LABO / adopted | L2 150–155 section `7796690dfd399e1f5d0cccddde8c7aeabb5da5dd2d8ab7edcdd3e71e74e84065` | L11 191–197 section `f4ef263d8a969705e15987b60365228be56875b88794a76d5609a799ff7e0779` | LABO 9/28 decisionの採択集合に含まれる。MPR register row 451 (`MPR-RC-HELIXLABO-L2-055-002`)。|
| HELIXLABO-L2-059 / LABO / adopted | L2 416–440 section `10edd365a96da6d00927fe40ce16f250978f99c3d248c3ad2f7ff5364e59856c` | L11 row 170 `9e5a9113e596edec50d6a068d769a2d3d3ff9b08938e9dbf6db6cb09e789a433` | LABO 9/28 decisionの採択集合に含まれる。MPR register row 408 (`MPR-RC-HELIXLABO-L2-059-002`)。|
| HELIXLABO-L2-064 / LABO / adopted | L2 491–502 section `e28da5b2f47c3d1327cc091003d14a7ab572a3282040b2ed7ec6614dae7079b8` | L11 233–240 section `4f51be505b3c169f08aa61c2dd192b21b1b185db0f5243f556853bcb3e1a1fe3` | `po-decision-2026-09-29-57candidates.md` row 79 raw-with-LF SHA `21e65876f5d6e336541578f29a1450435782bf248b060a4a8e4d3cc1cd65255d`; 表に示したexact L2/L11 section pinの `MPR-RC-HELIXLABO-L2-064-002` を採択。遮蔽評価の条件はNFR-36の既定値またはescalation receiptを成立させない。 |
| HELIXLABO-L2-060 / LABO / adopted（candidate metadata不一致） | L2 441–456 section `470bc2c564e2ea6121a7f24645bdb5e9c81f0954d650c1e3e665760ff9c9aca5` | L11 178–186 section `50a4e4a914eee9f1f1049b854493e1884c52f77bd7d1394deccf7d7c08116011` | LABO decision full SHA `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`; row 100 raw-with-LF SHA `606154a66ffff2322b0c2ad188cb71699bd0e9a8016bf191a20ecfc2fd53266c`; registration `MPR-RC-HELIXLABO-L2-060-002`。|
| HELIXOS-L2-018 / OS / adopted | L2 672–681 section `4ca189ed491490e2ed1ee75095b64d2e294319e6132d4595d631fcd4ba8bc408` | L11 345–351 section `77e8ef58e9774503379bb3a84a0218fa29dbad536e142122c7bee8e8bc0b1d53` | OS 9/28 decision固定L2-001–029 pair、明示集合に018/028/029を含む。|
| HELIXOS-L2-028 / OS / adopted | L2 847–862 section `f41238ee4660d455d6f6a144bdab4a35ef9704aac190835a24589853ed3e4fab` | L11 457–467 section `4eb5b74e57c0d8441d5bb41fc3cba5f5cb31d58d780c31e0f735692a6e060b93` | OS 9/28 decisionの採択集合に含まれる。|
| HELIXOS-L2-029 / OS / adopted | L2 863–878 section `59a37b8d83fb269c12263089d937e696d0b9bfe8684d46822e267588802878f8` | L11 468–479 section `921d184ab89892a7a257600e13e80290053dc49749e9f708909f27f2bd2f42ea` | OS 9/28 decisionの採択集合に含まれる。|
| HELIXOS-L2-104 / OS / adopted（L11 candidate表示不一致） | L2 1304–1314 section `a6346a95c796b0d1c2e72e5f24e150767ced6329b9f6137a9547370e82ad502d` | L11 913–924 section `b899b8da8d4bb85c5972b7e116e2f3837e61dd20a337018baeadb2a2a5dfe90f` | Decision `po-decision-2026-09-30-live26.md` full SHA `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`が対象revisionの採択を記録。MPR register row 624 raw-with-LF SHA `6b08a9fed3bfe57e8583fe2609e9e5f11944e5c910d1b2aef3440d649d255ad9`。|


dd259、43d5、86で上記14個のL2/L11選択bytesを再計算し、相互に一致する範囲とHARNESS-068の一時差分を記録した。86時点の4 pair全文SHAはINTELLIGENCE `1aef1804b6b4e6ffde085a22cc2a66de97bcf90a29a19c7c79001a387c292c39` / `28d1f4bff131bc2bdd1c0b4f96b44509e397c0ce1e2c9350c6714b9721f55749`、LABO `cae0cf9f564ec607e855fcc98f934801bee1c63be4b9446f9097578748cb70f6` / `39d9ab3605ff6c74fbc4c363ba0125df0461935053e7ef40c50eed1386be882a`、OS `027dcf9fb3005e0ed76872b56d3c2e5684ba68d489a803c5f8dfc8b744397da8` / `62ee2da1ae93e01c0c921e3e35e93661a165bb6c4cf9940142a91971cdc00ec3`、HARNESS `e7bc555844b5f2e3b12a658eedc4d4a832fd53eb62e0a3d11ff5d2bd25c5b492` / `b029336f68aede1daa4a5b6fcbfd933ef7ac2682664b75ce10d1096dce8219ba`。43d5ではHARNESS周辺の全文bytesが変わったが、NFR-36隣接HARNESS-068の選択sectionも86ではdd259と同じbytesへ戻っている。43d5 L2 1290–1305 `06a842c3b8533fd7d677498c1359734d1cccf69ac4c7b02a4ce30d42d9a0de7d`、86 L2 1290–1315 `b5c3502e3e296c8e5dceaff021ef3c1261fd2116873b679e482997a4a97595d0`。43d5 L11 1002–1015 `2ada3186200c9f8c2bd4935bea4b0c7ab169181eceba1d4bc353d16bca416bb8`、86 L11 1002–1021 `27f329b968c7f09cdc5d815af82abb70e190d5086002e842ab75369ec8e3b711`。この隣接candidateはNFR-36の閉鎖を示さない。

## 最新main 1259080の再照合（86比較履歴を保持）

対象commitは `125908004787d949a60c5eb373c93819b0a1ceea`。8つのpair全文をgit blobから再取得しraw SHA-256を再計算した。INTELLIGENCE L2/L11は上記の `1aef1804...c292c39` / `28d1f4bf...55749`、LABOは `cae0cf9f...8cb70f6` / `39d9ab36...6be882a`、OSは `027dcf9f...397da8` / `62ee2da1...dc00ec3`、HARNESSは `e7bc5558...c5b492` / `b029336f...219ba`。いずれも86の全文SHAと一致する。既存の14行locator表のL2/L11選択範囲も1259080 blobから再計算し、行範囲・見出し境界・正規化・digestはいずれも86の記録と一致した。

decision sourceも1259080で再確認した。HARNESS 9/28 decision `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` raw SHA `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`の25行目は「明示候補24件は全件採用」と記録するため、HARNESS-022/023は採択集合に含まれる。INTELLIGENCE 9/28 decision raw SHA `8362ecb58921593b473ac85d277f0db36a7cbe0952268531913191e4eab260ad`、LABO 9/28 decision raw SHA `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`、OS 9/30 decision `po-decision-2026-09-30-live26.md` raw SHA `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`、LABO 9/29 57-candidate decision raw SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`も同一bytesである。対象revisionの採択状態はこれらのdecision記録で判断し、MPR登録状態やcandidate metadataを採否根拠へ読み替えない。INT-068 decision row 98 raw line SHA `e67c4a4fda50180a66bc823eaae0a809351c3c0ed677542de912b846c20aa896`、LABO-060 row 100 `606154a66ffff2322b0c2ad188cb71699bd0e9a8016bf191a20ecfc2fd53266c`、OS-104 row 57 `216c2549ca7a0a6b41b2f36c06785299ee406bbba513c26201cb34e3cb851046`、LABO-064 row 79 `21e65876f5d6e336541578f29a1450435782bf248b060a4a8e4d3cc1cd65255d`は対象decision内の採択根拠行として維持される。

1259080で追加されたTR01–11 source-condition auditは別の監査記録であり、上記L2/L11 pairにNFR-36の個別逸脱receiptまたは品質escalation順序receiptを追加しない。旧source closure、全consumer条件の閉鎖、後継要求の採択、実装・実行・受入はいずれも未証明である。86比較は履歴として保持し、最新比較との差分から未記録の本文変更や残差閉鎖を推定しない。
