# 旧Design Grounding残余24行の採択predicate route監査（2026-09-30）

- audit id: `legacy-candidate-design-grounding-residual-24-route-audit-2026-09-30`
- base: merged `origin/main` `492ecc38e977f105bb0ffcce26cb7978afca9b04`。 authority effect: `none`。
- 選定: merged #2367のDesign Grounding 51行分類案を exact-ID overlay として適用したproposal-effective集合のうち、`condition / product_requirement_atom / unknown`のままの指定24 source IDs。proposal分類自体にauthority effectはない。000840/000841/000850–000857/000942–000946はmerged #2369 route sampleで既選定のため除外し、000983は#2367 proposal上でmanagement_process_conditionへ分類する行のため対象外（採用判断ではない）。
- exact source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/design-grounding-human-convergence-intake.md`。 source asset `LEGACY-ASSET-A422448C3CACBCA75D0C`、file SHA-256 `177def78bced15ffad9a5db7fc6ccf67a425d0d892be5892b085b8e1ed3c102c`。
- 判断軸: route relationはPO採択済みのexact L2/L11 revisionにある**同じ具体predicate**との重なりだけを記録する。話題・名称の類似は`true_unknown`とする。採択L2/L11のdraft/candidate metadataではなく、decision recordのexact pinをauthorityとして読む。

## 固定した採択revisionとmerged入力

| 対象 | decision | exact source revision | L2 SHA-256 | L11 SHA-256 |
|---|---|---|---|---|
| HELIX-HARNESS | `HDEC-HARNESS-REQUIREMENTS-2026-09-28` (`docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md`, c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23) | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` | `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` |
| HELIX-OS | `HDEC-HELIXOS-REQUIREMENTS-PO-2026-09-28` (`docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md`, 5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da) | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |
| HARNESS-L2-039 scope overlay | `MPR-RC-HARNESS-L2-039-003` at `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:44` | `318ec4a04abb3c1cc17111b3d939f913facd5fd3` | `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09` | `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5` |

POは2026-09-28に本体8機構の固定L2/L11一式へ合意している。本文内の候補metadataを採否として読まず、decision recordに固定されたrevisionだけを比較した。HARNESS-L2-039は別のPO判断によるscope限定の採択入力として分離pinした。

監査JSON `pinned_inputs` は、merged #2367 exact commit、merged prior route audit exact commit、現行baseでのsource/asset ledgers、manifest、旧requests/requirements/acceptance/PLANの全pathとSHA-256を記録する。premerge revisionはpinしていない。

## 行別route

| Source ID | 原文行 | 有効分類 / route | relation | 比較した採択ID | predicate比較と残差 |
|---|---:|---|---|---|---|
| `LEGACY-CAND-LINE-000947` | 183 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-005`, `HARNESS-L2-025`, `HARNESS-L2-026` | 比較した採択要求IDは`HARNESS-L2-005`、`HARNESS-L2-025`、`HARNESS-L2-026`。比較した採択predicateはHARNESS-L2-005の対象・oracle別検証、HARNESS-L2-025およびHARNESS-L2-026の承認済み要求から設計要素・対oracleへの構成と整合である。旧行の一般的な「requirement consistency」検査またはその合否oracleを定義しておらず、同一predicateは確認できない。設計・要求という話題の近さだけでは関係を付けない。
| `LEGACY-CAND-LINE-000948` | 184 | condition / product atom / unknown | `adopted_relevant_partial` | `HARNESS-L2-025`, `HARNESS-L2-026`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-025`、`HARNESS-L2-026`、`HARNESS-L2-039`。採択predicateのうちHARNESS-L2-025およびHARNESS-L2-026は、同一要求/L3 revisionの設計要素・対oracleの双方向traceを要求し、異なるrevision、片方向trace、欠けたrelationを不成立にする。HARNESS-L2-039は選択UI sourceのidentity/revision/scope/authorityとUX evidenceの束縛を定める。この範囲は「evidence/revision consistency」に直接重なる。一方、すべてのevidence種別・全sourceの一般整合性までを定めない。
| `LEGACY-CAND-LINE-000949` | 186 | condition / product atom / unknown | `adopted_relevant_partial` | `HARNESS-L2-024` | 比較した採択要求IDは`HARNESS-L2-024`。HARNESS-L2-024は人間専決値をengineが補完せず、原文・選択肢・推奨・影響候補を持つ判断待ちへ送る。モデルが単独で最終決定しないというauthority境界に直接重なる。残差として、以下のデザイン意味カテゴリを人間専決値と特定するpredicateまではHARNESS-L2-024にない。
| `LEGACY-CAND-LINE-000950` | 188 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-024`、`HARNESS-L2-039`。HARNESS-L2-024は人間専決値の未補完を定め、HARNESS-L2-039は選択UI sourceとUX evidenceのscope束縛を定める。どちらも美的好みを独立した人間判断対象として分類するpredicateを持たない。
| `LEGACY-CAND-LINE-000951` | 189 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-024`、`HARNESS-L2-039`。HARNESS-L2-024は人間専決値を補完せず判断待ちにするが、ブランドらしさをその値として特定していない。HARNESS-L2-039のUI source束縛もブランド判断のpredicateではない。
| `LEGACY-CAND-LINE-000952` | 190 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-024`、`HARNESS-L2-039`。HARNESS-L2-024は人間専決値の判断待ちを扱うが、世界観を専決対象として列挙・判定するpredicateはない。HARNESS-L2-039のUX evidence/source境界も世界観判断を扱わない。
| `LEGACY-CAND-LINE-000953` | 191 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-024`、`HARNESS-L2-039`。HARNESS-L2-024は人間専決値の補完禁止を定めるが、「高級」「親しみやすい」等の主観意味をその値に分類する条件はない。HARNESS-L2-039もUX evidence/source scopeを束縛するだけで、主観意味のauthority predicateを持たない。
| `LEGACY-CAND-LINE-000954` | 192 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-024`、`HARNESS-L2-039`。HARNESS-L2-024は質問・要求形成の人間専決値を補完しないが、表現・文章ニュアンスをその対象として定めない。HARNESS-L2-039にも文章ニュアンスのpredicateはない。
| `LEGACY-CAND-LINE-000955` | 193 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-024`、`HARNESS-L2-039`。HARNESS-L2-024は人間専決値を判断待ちへ送る一方、保持希望のVisual/UX preferenceを個別分類しない。HARNESS-L2-039は選択UI sourceとevidenceの適用を扱うが、人間が保持する選好のauthorityを定めない。
| `LEGACY-CAND-LINE-000978` | 225 | condition / product atom / unknown | `true_unknown` | `HELIXOS-L2-010`, `HELIXOS-L2-015`, `HELIXOS-L2-016` | 比較した採択要求IDは`HELIXOS-L2-010`、`HELIXOS-L2-015`、`HELIXOS-L2-016`。比較したOS predicateは同一ticketでの工程・作業種別・因果追跡、管理authority record、およびportfolio traceである。Issueのroot/capability/task/findingというGitHub階層の不変条件や、階層を壊した場合の拒否predicateはなく、同じ条件を採択したとは確認できない。
| `LEGACY-CAND-LINE-000979` | 226 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HELIXOS-L2-015`, `HELIXOS-L2-016` | 比較した採択要求IDは`HARNESS-L2-024`、`HELIXOS-L2-015`、`HELIXOS-L2-016`。HARNESS-L2-024は要求形成の候補・open item・合意待ちを分け、HELIXOS-L2-015およびHELIXOS-L2-016は管理recordやportfolio状態を扱う。いずれもDesign形成状態をIssue階層とは別semantic stateとして保持するpredicateを定義していない。
| `LEGACY-CAND-LINE-000980` | 227 | condition / product atom / unknown | `adopted_relevant_partial` | `HARNESS-L2-025`, `HARNESS-L2-026`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-025`、`HARNESS-L2-026`、`HARNESS-L2-039`。HARNESS-L2-025およびHARNESS-L2-026は要求/L3 revisionから設計要素・対oracleまでの相互traceとrevision一致を定め、HARNESS-L2-039は選択UI/design sourceのrevision・scope・authority・evidence relationを束縛する。このsource Requirement・evidence・prototype revisionとDesign作業を結ぶ条件に部分的に直接重なる。Design problemを独立identityとする点、各Design作業単位の全trace closureまでは採択predicateにない。
| `LEGACY-CAND-LINE-000981` | 228 | condition / product atom / unknown | `true_unknown` | `HELIXOS-L2-010`, `HELIXOS-L2-016`, `HARNESS-L2-024` | 比較した採択要求IDは`HELIXOS-L2-010`、`HELIXOS-L2-016`、`HARNESS-L2-024`。HELIXOS-L2-010およびHELIXOS-L2-016はticket種別・工程・因果traceを規定し、HARNESS-L2-024は未決質問を同一open itemで維持する。しかし、局所Research不足や人間判断待ちがあっても無関係な承認済み作業を継続させる非block条件・非伝播predicateは見当たらない。
| `LEGACY-CAND-LINE-000982` | 229 | condition / product atom / unknown | `adopted_relevant_partial` | `HARNESS-L2-025`, `HARNESS-L2-026`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-025`、`HARNESS-L2-026`、`HARNESS-L2-039`。HARNESS-L2-025およびHARNESS-L2-026は対象要求/L3 revision、設計要素、oracleのtraceとrevision整合を必須とし、HARNESS-L2-039は選択UI sourceのidentity/revision/scope/authorityおよびUX evidence relationを照合する。この原文のexact revision/provenance/evidence bindingという核に直接重なる。全結果と全種別のprovenanceの包括条件までは示さない。
| `LEGACY-CAND-LINE-000986` | 236 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HARNESS-L2-026`, `HELIXOS-L2-010` | 比較した採択要求IDは`HARNESS-L2-024`、`HARNESS-L2-026`、`HELIXOS-L2-010`。HARNESS-L2-026は承認済みL3要件、Design Template、CORE/BRAIN connector等を入力条件にし、HELIXOS-L2-010はPoC/Prototype/Researchのtask目的・戻し先を区別する。HARNESS-L2-024は該当時prototype agreementを収束根拠にする。未知Design taskの外部事例researchなしではprototypeをgateするpredicateやresearch adequacy判定はない。
| `LEGACY-CAND-LINE-000987` | 237 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-025`, `HARNESS-L2-026`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-025`、`HARNESS-L2-026`、`HARNESS-L2-039`。HARNESS-L2-025およびHARNESS-L2-026は要求/L3-to-design-to-oracle trace、HARNESS-L2-039は選択UI sourceとUX evidenceのrelationを定める。Research Evidenceから何をDesignへ取り込んだかの採用・不採用理由をtraceするpredicateとは入力種別・関係が異なり、同じとは確認できない。
| `LEGACY-CAND-LINE-000988` | 238 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-024`、`HARNESS-L2-039`。HARNESS-L2-024は要求質問・矛盾・defer・未解決を保持し、HARNESS-L2-039はUI scopeのevidence/verificationを扱うが、人間反応の意味カテゴリ（美的・可読性・表示対象不足等）を複数分類しfindingとして保持するpredicateはない。
| `LEGACY-CAND-LINE-000989` | 239 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-024`、`HARNESS-L2-039`。HARNESS-L2-024はcancel/failure/timeout/recovery状態を要求形成工程で扱い、HARNESS-L2-039はUI sourceと検証範囲を扱う。Prototype communication failureだけを原因としてDesign生成を再実行しないという原因別route predicateはない。
| `LEGACY-CAND-LINE-000990` | 240 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-025`, `HARNESS-L2-026`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-025`、`HARNESS-L2-026`、`HARNESS-L2-039`。HARNESS-L2-025およびHARNESS-L2-026は対象revisionの設計整合・oracleを扱い、HARNESS-L2-039は選択UI sourceのrevision drift/verificationを扱う。しかし、以前人が受容したstable design axisを次revisionで特定し、権限根拠のない破壊を検出する履歴predicateはない。
| `LEGACY-CAND-LINE-000991` | 241 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-024`、`HARNESS-L2-039`。HARNESS-L2-024は形成情報の不足と人間確認・合意待ちを分けるが、objective UXのgreenとhuman preferenceのrejectを同時状態として表現するpredicateはない。HARNESS-L2-039もrisk-based UX evidenceを扱い、human preference stateとの並存を定義していない。
| `LEGACY-CAND-LINE-000992` | 242 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-024`, `HELIXOS-L2-015`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-024`、`HELIXOS-L2-015`、`HARNESS-L2-039`。HARNESS-L2-024は利用者指示/回答と候補差分を扱うが、人間reaction原文を改変不能な別evidenceとして保持しAI interpretationと別digest/referenceにするpredicateはない。HELIXOS-L2-015のauthority record、HARNESS-L2-039のUI evidence bindingもこの原文/解釈分離を定めない。
| `LEGACY-CAND-LINE-000993` | 243 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-003`, `HARNESS-L2-014`, `HARNESS-L2-025`, `HARNESS-L2-026`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-003`、`HARNESS-L2-014`、`HARNESS-L2-025`、`HARNESS-L2-026`、`HARNESS-L2-039`。HARNESS-L2-003はScreen Applicabilityに沿うL2.5適用判定、HARNESS-L2-014は設計サービス境界、HARNESS-L2-025/HARNESS-L2-026はdesign unit/compositeの分担、HARNESS-L2-039は既存HARNESS-L2-024/HARNESS-L2-025/HARNESS-L2-026境界に接続する。これらは既存能力を入力・依存として利用するが、Design Registry/Screen Applicabilityの責務を複製しないという同じ禁止predicate、またはRegistryの個別lifecycleを採択していない。
| `LEGACY-CAND-LINE-000994` | 244 | condition / product atom / unknown | `adopted_relevant_partial` | `HARNESS-L2-025`, `HARNESS-L2-026`, `HARNESS-L2-039` | 比較した採択要求IDは`HARNESS-L2-025`、`HARNESS-L2-026`、`HARNESS-L2-039`。HARNESS-L2-025およびHARNESS-L2-026はtarget requirement/L3 revision、design要素、oracle間の相互traceとauthority入力を要求し、HARNESS-L2-039はUI sourceのrevision/scope/authority/evidence bindingを要求する。結果のrevision・authority・evidence束縛に直接重なる。対象全結果・全authority種別を閉じる包括predicateまでは採択していない。
| `LEGACY-CAND-LINE-000995` | 245 | condition / product atom / unknown | `true_unknown` | `HARNESS-L2-006`, `HARNESS-L2-026`, `HELIXOS-L2-014` | 比較した採択要求IDは`HARNESS-L2-006`、`HARNESS-L2-026`、`HELIXOS-L2-014`。HARNESS-L2-006は旧Lite/Fullや固定提供構成を分母にしない条件、HARNESS-L2-026は1.0の設計構成能力、HELIXOS-L2-014は段階pack/依存/更新復旧の確認を定める。Fullと将来Lite consumerの間で最小契約だけ配るdependency boundary、Lite側consumer closureというpredicateは採択していない。

## 分類review候補

`classification_review_candidates`は空（0件）。24行は#2367のmerged分類でproduct requirement atomとして明示的に維持された行で、選定行中にsource link、版注記、見出し、来歴説明、原稿再構成のような非condition行はない。classificationを変更せず、route関係と分類を別軸に保つ。

## 旧source・failure・consumerのinventory

- 資産明細台帳のsource assetはrevision 1、`product_target=unresolved`、`disposition=unresolved`、`implementation_status=unknown`、`consumer_refs=[]`。これはconsumer不在の証明ではない。PLAN-L3-91にはIssue/dependency/history参照があるが、台帳の現行consumer登録とは分離して記録する。
- 旧PLAN-L3-91のfailure条件は、相談を指示/承認へ昇格、自己権限拡張、旧承認の流用、原稿欠落、無関係scopeの全面停止。旧requirements/acceptanceはresearch不足のGate、客観品質とhuman preferenceの分離、人間原文とAI解釈の分離、prototype communication failureのみのときにDesignを不要再生成しないこと等をoracle候補としている。いずれも旧候補設計の記述であり、runtime観測・current consumerの証明ではない。
- 旧sourceの対応先としてrequest/requirement/acceptance/PLAN、asset ledger、archive manifestをinventory-firstで読んだ。旧runtime・CLI・test・hook・CIは実行していない。

## 旧route監査との判定差

merged #2367は同一24 source IDsの分類のみを扱いroute relationは付けていないため、本監査はroute列だけを追加する。merged #2369 route auditは隣接例示000942–000946を選び、000942/943/945/946を`adopted_relevant_partial`、navigation dead-endの000944を`true_unknown`とした。前者にはHARNESS-L2-039の選択UI scopeにおけるaccessibility、interaction drift、responsive適用、performance/evidence predicateがある。000944にはroute graph oracleがない。今回の000947（requirement consistency）は該当oracleなしとしてunknown、000948（evidence/revision consistency）はHARNESS-L2-025/026とL2-039の同一revision design/evidence traceに限ってpartialとした。隣接行だからという理由で942–946のlabelを継承していない。その他の24行は前route sample IDと重ならない。別の旧candidateにあるLEGACY-CAND-LINE-003876はIssue階層とsource traceの類似行だが未採択candidateであり、採択predicateとしては比較・使用しない。

## 件数・境界

- 24行: `adopted_relevant_partial` 5、`true_unknown` 19。全行のeffective route statusは`unknown`。
- unknown全行は比較した採択IDとpredicate差をJSON・表へ記録した。
- source classificationは24行とも維持し、分類review候補0件。
- route relationから旧sourceの採択、successor、full coverage、acceptance、implementation、完了、Stage 5 closureを導かない。

## 静的検証

監査JSONにsource file SHA、各原行SHA（改行除外）、physical line bytes SHA、#2367 effective classification、既選定ID除外、unknown行の比較ID・差分、route件数、merged-only pinsを記録し、照合する。
