# v1.3 source-qualified positions 111–131 条件照合監査

> 21件のsource identityについて旧sourceと固定F6を比較し、限定的な関係と残差を記録する。formal successor、source condition closure、authorityは生成しない。

## 対象と境界

clean bundle `4a50e2d3f2272a36bae89ea38df6cdd6954dbd41` にあるsource-qualifiedな固定131件poolから、positions111–131の21 identityを抽出した。queue状態は入力時点のprojectionとして保持する。本監査の対象はこの21行に限り、131件pool全体のStep5 closureを示さない。

- Queue `docs/governance/audits/requirements-stage/v13-condition-closure-work-queue-2026-09-30.json` @ `50686b6762788574cb471967e8c24846d3dd56ae` SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`。
- Pool/rank/source tuple `docs/governance/audits/requirements-stage/v13-effective-legacy40-rank-reuse-crosswalk-2026-10-01.json` @ `4a50e2d3f2272a36bae89ea38df6cdd6954dbd41` SHA-256 `1b9669ee715a6b5f2d1a82c77285a56451fd25ec249236f1d12ef2f78d65c01e`。各行をqueueのsource tuple全体と照合し、raw ID tokenだけではjoinしていない。
- Archive SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。Asset `LEGACY-ASSET-02319C2481B9E01698D5`、ledger line 956 SHA-256 `a6d52de16ee4aa8ecb37ed092fb4c2beda22ec89d1d036b3028414a753375dde`。

## 固定F6と後発decisionの時点境界

- 固定F6 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`: L2 SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11 SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。F6のIDは限定的な関係先であり、旧source IDへのbindingを意味しない。
- D-HARNESS-2026-09-28 SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23` は、固定F6対象と明示候補revisionを扱う。
- D-OS-2026-09-28 SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da` は16件のexact identityを条件とversion_targetを保持して採択し、HELIXOS-L2-021を1.0対象とする。
- D-57-2026-09-29 SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad` の適用範囲はexact candidate identity/revision/scopeに限る。HARNESS-L2-034/035/036/038/039/040は採択、HARNESS-L2-047は条件付きA配置、HELIXOS-L2-030は保留である。queueのbaseline candidate statusを現行判断として再掲せず、decisionを旧source rowへ自動適用しない。

## Row別の限定比較

|rank|Source ID / line|queue state|固定F6 relation|後発candidate context|finding|残差|
|---:|---|---|---|---|---|---|
|111|`REQSRC-SUP-00477` / 617|`unresolved_for_closure_work`|HARNESS-L2-002, HARNESS-L2-013, HARNESS-L2-024|HARNESS-L2-038, HARNESS-L2-039|partial|各signalのcase-driven routeまたは選択済みstyle内change intakeへの対応と、source row単位のL2/L11 bindingは確立していない。|
|112|`REQSRC-SUP-00478` / 618|`unresolved_for_closure_work`|HARNESS-L2-002, HARNESS-L2-003|HARNESS-L2-038, HARNESS-L2-039|partial|signalだけではstyleをProduction Scrumへ変更できないという規則と適用記録は、sourceに結び付いていない。|
|113|`REQSRC-SUP-00479` / 620|`unresolved_for_closure_work`|HARNESS-L2-002, HARNESS-L2-013|HARNESS-L2-038, HARNESS-L2-039|partial|表schemaやsignalからmode/targetへの完全な対応を確立するsource固有pairがない。|
|114|`REQSRC-SUP-00482` / 623|`unresolved_for_closure_work`|HARNESS-L2-003, HARNESS-L2-021|HARNESS-L2-038|partial|debt_degradation/code_smell/structural signalの正確なrouteと行ごとのoracleは確立していない。|
|115|`REQSRC-SUP-00483` / 624|`unresolved_for_closure_work`|HARNESS-L2-003, HARNESS-L2-010|HARNESS-L2-038|partial|dependency_outdated/upgrade/config_driftをRetrofitへrouteしpreflightを要求するsource固有pairがない。|
|116|`REQSRC-SUP-00496` / 639|`unresolved_for_closure_work`|HARNESS-L2-002|none|partial|styleを一つだけ選ぶ条件とDiscovery/PoCを別にactivateする条件には、source row固有のL11 oracleがない。|
|117|`REQSRC-SUP-00500` / 643|`unresolved_for_closure_work`|HARNESS-L2-003, HARNESS-L2-021|HARNESS-L2-038, HARNESS-L2-039|partial|Redesign、Design Refactor、Performance Refactor、Retrofitのいずれか一つへrouteする条件は、source-bound pair/oracleで確立していない。|
|118|`REQSRC-SUP-00501` / 644|`unresolved_for_closure_work`|HARNESS-L2-022, HARNESS-L2-021|HARNESS-L2-034|partial|全必須NFRとcurrent measurement、および未測定/stale/hard-limit超過時の全拒否条件を結ぶexact source bindingがない。|
|119|`REQSRC-SUP-00502` / 645|`unresolved_for_closure_work`|HARNESS-L2-021, HARNESS-L2-022|HARNESS-L2-040, HARNESS-L2-035|partial|全workflow transitionをFR/AC/test/source transition/L1–L12 pairへ対応させ、未解決分岐を拒否する完全な記録が示されていない。|
|120|`REQSRC-SUP-00503` / 646|`unresolved_for_closure_work`|HARNESS-L2-013, HARNESS-L2-024|HARNESS-L2-035|partial|missing input時の拒否oracle一式（confidence、fallback、dead-letter、再評価trigger、measurement oracle）を持つexact source-bound pairがない。|
|121|`REQSRC-SUP-00504` / 647|`unresolved_for_closure_work`|HARNESS-L2-002, HARNESS-L2-003|HARNESS-L2-038|partial|Full V workflow、Scrum slice delta、SR0–SR4 backfillを一体で対応させる完全なsource-bound pairがない。|
|122|`REQSRC-SUP-00505` / 648|`unresolved_for_closure_work`|none|HARNESS-L2-040|gap|schema互換、ZIP不整合の解消、activation阻止を扱うsource-linked adopted pair/oracleがない。|
|123|`REQSRC-SUP-00508` / 651|`unresolved_for_closure_work`|HARNESS-L2-024|HARNESS-L2-039|partial|SR0–SR4 UI-slice backfillと自己承認/別system/機能拡張禁止の各境界は、このsource行に結び付いていない。|
|124|`REQSRC-SUP-00510` / 653|`unresolved_for_closure_work`|none|none|gap|自動closureの適格性、可逆性oracle、未完了成果の除外を定めるsource-bound pairは特定されていない。|
|125|`REQSRC-SUP-00511` / 654|`unresolved_for_closure_work`|HARNESS-L2-010|HELIXOS-L2-021, HELIXOS-L2-030|partial|manifest一式、README/LICENSE/attribution、Linux/Windows smoke、同一artifactのpromotion、monitoring/rollback、remote approval要件をこの行に結ぶpairがない。|
|126|`REQSRC-SUP-00512` / 655|`unresolved_for_closure_work`|HARNESS-L2-013, HARNESS-L2-024|HARNESS-L2-035|partial|Proposalを保持したatomic Canonicalizationと、部分write/authority/oracle喪失時のfail-closeは、この行の採択pairに結び付いていない。|
|127|`REQSRC-SUP-00513` / 656|`unresolved_for_closure_work`|HARNESS-L2-022, HARNESS-L2-021|HARNESS-L2-034|partial|全NFR-registry/current-measurementのjoinとunknown/stale/hard-limit時にgreenとしない各条件はsource-boundでない。|
|128|`REQSRC-SUP-00516` / 659|`unresolved_for_closure_work`|HARNESS-L2-024|HARNESS-L2-039|partial|UI mission/oracle、implementedとux_verifiedの区別、Markdown projection/read-only、JSON authorityの全てがこのsource行に結び付いていない。|
|129|`REQSRC-SUP-00517` / 660|`unresolved_for_closure_work`|HARNESS-L2-002, HARNESS-L2-024|HARNESS-L2-038, HARNESS-L2-039|partial|全style共通のDiscovery Loop/L3 compile/freezeとDiscovery/PoCの分離は、一つのsource-bound pairとしてclosureされていない。|
|130|`REQSRC-SUP-00520` / 663|`unresolved_for_closure_work`|none|HARNESS-L2-036, HARNESS-L2-040|gap|このsource identityに結び付くexact GitHub-event/DB-state joinと同一HEAD収束oracleがない。|
|131|`REQSRC-SUP-00521` / 664|`unresolved_for_closure_work`|none|none|gap|これらの文書上の主張に対するsource-boundな受入条件とnegative oracleが特定されていない。|

## Source identity別の判定

### 111 — `REQSRC-SUP-00477`

旧source line `617` SHA-256 `3bb5fb3976828d7adc9b514a5c06aa74656ebc85cf233448c18220814514c561`。原文: signalはcase-driven routeまたは選択済みdevelopment style内のchange intakeを起動する。

**固定F6との関係:** F6はdevelopment style、requirement形成、人による確認を分けている。ここではsignal intakeとの一般的な関係に限る。

**判定:** `partial`。各signalのcase-driven routeまたは選択済みstyle内change intakeへの対応と、source row単位のL2/L11 bindingは確立していない。

**誤った推論例:** 一般的なrequirement形成/change intakeをsource-bound successorとみなす。

### 112 — `REQSRC-SUP-00478`

旧source line `618` SHA-256 `a0afb22ddfbdb072fad63a61307c8dd76566f9304c426853ec3c5d7d0f2c7123`。原文: signalだけでdevelopment styleをProduction Scrumへ変更してはならない。

**固定F6との関係:** F6はrelease unitごとにdevelopment styleを選択し、freeze/backflowの境界を定める。

**判定:** `partial`。signalだけではstyleをProduction Scrumへ変更できないという規則と適用記録は、sourceに結び付いていない。

**誤った推論例:** 一般的なstyle選択から自動style変更禁止条件を推論する。

### 113 — `REQSRC-SUP-00479`

旧source line `620` SHA-256 `8cb25c3a0fb124b25a9b0701893fdeef87b3b07222481aa991701d5180759e68`。原文: | signal | mode / routing target | 補足 |

**固定F6との関係:** F6はdevelopment styleとticket typeを区別し、requirement形成を定義する。source line 620はsignal/route/notes表のheaderであり、隣接行をこのtupleへ結合していない。

**判定:** `partial`。表schemaやsignalからmode/targetへの完全な対応を確立するsource固有pairがない。

**誤った推論例:** 隣接するsignal規則をこのheader行に結合し、route表全体が採択済みと扱う。

### 114 — `REQSRC-SUP-00482`

旧source line `623` SHA-256 `074039b2e5fb673369eab6a81f110d837c6b03ecddff1fbba9692d6cc7f9e015`。原文: | `debt_degradation` / `code_smell` / `structural` | Refactor | 外部挙動を保つ |

**固定F6との関係:** F6には挙動を保つRefactor、意味上のBackflow、運用feedbackが含まれる。

**判定:** `partial`。debt_degradation/code_smell/structural signalの正確なrouteと行ごとのoracleは確立していない。

**誤った推論例:** 一般的なRefactor境界をsignal固有routeすべてと同一視する。

### 115 — `REQSRC-SUP-00483`

旧source line `624` SHA-256 `abe6948306eff0bd417364df922710b962f944be6c61f33edc9f50a24e03e140`。原文: | `dependency_outdated` / `upgrade` / `config_drift` | Retrofit | upgradeはpreflight必須 |

**固定F6との関係:** F6はpack境界、stage検証、意味を保つ変更を扱う。

**判定:** `partial`。dependency_outdated/upgrade/config_driftをRetrofitへrouteしpreflightを要求するsource固有pairがない。

**誤った推論例:** 一般的なchange/upgradeの記述を、採択済みRetrofit-preflight動作や実行証拠と扱う。

### 116 — `REQSRC-SUP-00496`

旧source line `639` SHA-256 `a1246b2d13e88149de79871a952cb1c9749e5ff9b5f74891a2a3679daddb277e`。原文: - V-model、Production Scrum、V設計＋Scrum実装Hybridのdevelopment styleがexactly oneで選択され、Discovery／PoCのcase-driven model activationは別fieldで判定される。

**固定F6との関係:** F6 L2-002はdevelopment styleとticket drivingを分け、Discovery/PoCをstyle phaseの外に置く。

**判定:** `partial`。styleを一つだけ選ぶ条件とDiscovery/PoCを別にactivateする条件には、source row固有のL11 oracleがない。

**誤った推論例:** 一般的なstyle要件の採択から、この受入行のclosureを推論する。

### 117 — `REQSRC-SUP-00500`

旧source line `643` SHA-256 `fd6047e6a45f3805d97d13c1f09b72ad71c93c7e95843d407b0b0aac64767b6f`。原文: - Scrum Reverse findingがRedesign/Design Refactor/Performance Refactor/Retrofitのexactly oneへrouteされる。

**固定F6との関係:** F6にはRefactorと意味上のBackflowの境界、およびstage条件がある。

**判定:** `partial`。Redesign、Design Refactor、Performance Refactor、Retrofitのいずれか一つへrouteする条件は、source-bound pair/oracleで確立していない。

**誤った推論例:** 一般的なRefactor/Backflowを4分類すべての採択と扱う。

### 118 — `REQSRC-SUP-00501`

旧source line `644` SHA-256 `9af66b9203d37bb7c3eb01cbd14e87f57b1fe0ae9dee54208459dfa2bf6d091f`。原文: - 必須NFRごとにverification/measurement contractとcurrent evidenceがあり、未測定・stale・閾値未達でcompletionを拒否する。

**固定F6との関係:** F6はverification/acceptanceと運用feedbackを扱う。後発のL2-034採択は、そのexact scopeにおけるmeasurement contractに関するもの。

**判定:** `partial`。全必須NFRとcurrent measurement、および未測定/stale/hard-limit超過時の全拒否条件を結ぶexact source bindingがない。

**誤った推論例:** L2-034採択や一般的verificationを、この旧source行全体のclosureへ拡張する。

### 119 — `REQSRC-SUP-00502`

旧source line `645` SHA-256 `a3ea485f2cf9c040c26fc0dda054c7bd72f980af85c472edd5c1e479f9533758`。原文: - 全workflow transitionがFR、AC、test scenario、source transition、L1〜L12 pairへ追跡でき、未解決分岐をfreezeへ算入しない。

**固定F6との関係:** F6にはend-to-end traceとstage evidenceがある。後発のL2-040採択は、そのexact scopeにおけるtyped layer-ledger catalogに限る。

**判定:** `partial`。全workflow transitionをFR/AC/test/source transition/L1–L12 pairへ対応させ、未解決分岐を拒否する完全な記録が示されていない。

**誤った推論例:** ledger-catalog採択を、このsource行のtransition/oracle義務のclosureと扱う。

### 120 — `REQSRC-SUP-00503`

旧source line `646` SHA-256 `be12f0babe2579af9376a3b2840da046b584cf47a02a20bdf62d42999caed559`。原文: - AI判断はproposalとcommit authorityが分離され、候補、根拠、confidence、fallback、dead-letter、再評価trigger、測定oracleが欠ければ実行を許可しない。

**固定F6との関係:** F6はAI出力をapproved requirementやauthorityへ変えることを禁じ、candidate/unknown形成stateを分ける。

**判定:** `partial`。missing input時の拒否oracle一式（confidence、fallback、dead-letter、再評価trigger、measurement oracle）を持つexact source-bound pairがない。

**誤った推論例:** 自動承認禁止の境界を、実行拒否oracle一式と同一視する。

### 121 — `REQSRC-SUP-00504`

旧source line `647` SHA-256 `6c616a3fb85f5affae79a701b3ac2accf0975373d3540e8738bdd2b3c0a9d41e`。原文: - Full Vはsystem workflow全体、Production Scrumはslice deltaとSR0〜SR4 backfillの両方を保持する。

**固定F6との関係:** F6はstyleを区別し、stageのfreeze/backflowを定める。

**判定:** `partial`。Full V workflow、Scrum slice delta、SR0–SR4 backfillを一体で対応させる完全なsource-bound pairがない。

**誤った推論例:** 一般的なV-modelまたはScrumの採択から旧workflow全体の保持を推論する。

### 122 — `REQSRC-SUP-00505`

旧source line `648` SHA-256 `bf985f4e39d2a4bf090cfc0dd2e938d57b50ad39ead8be11d5058718047e3512`。原文: - workflow/switching/routing/allocationのschema composition gapとZIP example不整合を解消するまでengine activationを許可しない。

**固定F6との関係:** workflow/switching/routing/allocationのschema-composition gap、ZIP例の不整合、関連するengine activation gateに対応する固定F6 pairは特定できない。

**判定:** `gap`。schema互換、ZIP不整合の解消、activation阻止を扱うsource-linked adopted pair/oracleがない。

**誤った推論例:** 一般的なfreeze境界やlayer catalogを、schema gapの解消やactivation許可と読む。

### 123 — `REQSRC-SUP-00508`

旧source line `651` SHA-256 `2e191701a131af14c49f9e853363e86d6994f0bfd688cd60a1a6d2c7672a1b89`。原文: - Scrum UI sliceはSR0〜SR4でsystem visionと設計資産へbackfillされ、AI自己承認、別layer／別文書体系、無断の機能拡張を拒否する。

**固定F6との関係:** F6 L2-024はprototype agreementとUI/non-UI適用範囲を扱う。後発のL2-039採択は、そのexact Experience/UI/Frontend scopeに限る。

**判定:** `partial`。SR0–SR4 UI-slice backfillと自己承認/別system/機能拡張禁止の各境界は、このsource行に結び付いていない。

**誤った推論例:** L2-039の採択範囲をsource行全体またはSR0–SR4 workflow全体に拡張する。

### 124 — `REQSRC-SUP-00510`

旧source line `653` SHA-256 `517f59435920f9897525185e2619f546f15e021710c91b0eecfb25fe46932781`。原文: - closure自走はtyped evidence条件を全て満たす可逆`close_ready`だけを対象とし、未完了成果や不可逆対象を閉じない。

**固定F6との関係:** typed evidenceに基づく可逆なclose_readyの適格性と、不可逆または未完了の作業を除外する条件を直接定めた固定F6 pairはない。

**判定:** `gap`。自動closureの適格性、可逆性oracle、未完了成果の除外を定めるsource-bound pairは特定されていない。

**誤った推論例:** 一般的なstage完了/acceptanceを自動closeの適格性と同一視する。

### 125 — `REQSRC-SUP-00511`

旧source line `654` SHA-256 `73aa2c133c430ed99c1b7f13db892976e4d3f6f505a673c9d8445c591d046c3b`。原文: - distribution packageは自己適用を除いたmanifest exact set、README／LICENSE／attribution、Linux／Windows consumer smoke、canary→preview→stable同一artifact promotion、rollback／monitoringを満たし、remote actionはapproval境界で停止する。

**固定F6との関係:** F6 L2-010はpack依存関係、再現可能なartifact、update/rollback境界を扱う。OS-L2-021はexact 1.0 scopeで採択され、OS-L2-030は後発decisionで保留となった。

**判定:** `partial`。manifest一式、README/LICENSE/attribution、Linux/Windows smoke、同一artifactのpromotion、monitoring/rollback、remote approval要件をこの行に結ぶpairがない。

**誤った推論例:** OS-L2-021を旧distribution仕様全体へ拡張する、またはOS-L2-030の保留をpackage条件すべての否定と読む。

### 126 — `REQSRC-SUP-00512`

旧source line `655` SHA-256 `76b546315a2e5c74800175772c430ef03484591f665cd66ed978315d51b360bb`。原文: - Authoring AdmissionはProposalを保持したままatomic Canonicalizationを行い、部分write、authority不明、oracle消失を拒否する。

**固定F6との関係:** F6はrequirement形成、人の承認待ち、missing/unknown candidate inputを分ける。

**判定:** `partial`。Proposalを保持したatomic Canonicalizationと、部分write/authority/oracle喪失時のfail-closeは、この行の採択pairに結び付いていない。

**誤った推論例:** 承認待ちの境界からatomic-write保証と全failure oracleを推論する。

### 127 — `REQSRC-SUP-00513`

旧source line `656` SHA-256 `fa9a984e1b0e8a8aaba1d6e1e806d227360d372e5d5640d2acaf3c980660ce12`。原文: - 全NFRがregistryとcurrent measurementへ結合し、baseline不明、stale、hard limit超過をgreenにしない。

**固定F6との関係:** F6はverification/acceptanceと観測feedbackを扱う。後発のL2-034採択は、そのexact measurement-contract scopeに限る。

**判定:** `partial`。全NFR-registry/current-measurementのjoinとunknown/stale/hard-limit時にgreenとしない各条件はsource-boundでない。

**誤った推論例:** L2-034採択を旧registry行全体のsuccessorまたはclosureへ拡張する。

### 128 — `REQSRC-SUP-00516`

旧source line `659` SHA-256 `019d6b87b79600d353f08f3f7816c6bd4959cec23ed381e8e14215949b1209da`。原文:   prototypeの要求正本化、generated Markdown直接編集、JSON／Markdown dual authorityを拒否する。

**固定F6との関係:** F6はprototype agreementとsurface適用を扱う。後発のL2-039採択は限定されたExperience/UI/Frontend scopeに限る。

**判定:** `partial`。UI mission/oracle、implementedとux_verifiedの区別、Markdown projection/read-only、JSON authorityの全てがこのsource行に結び付いていない。

**誤った推論例:** L2-039の採択scopeをUI authority全体、generated Markdown、L1–L12 source条件全体へ拡張する。

### 129 — `REQSRC-SUP-00517`

旧source line `660` SHA-256 `3d3cd4531b139917febbde47d86fc736b9a2c82d60b7d4c3738f3e48338315b2`。原文: - 3 development styleが同じRequirement Discovery Loop／L3 compile／freezeを通り、Discovery／PoCと

**固定F6との関係:** F6はstyleとDiscovery/requirement形成を区別する。後発のL2-038/039は個別のReverse/Experience scopeを扱う。

**判定:** `partial`。全style共通のDiscovery Loop/L3 compile/freezeとDiscovery/PoCの分離は、一つのsource-bound pairとしてclosureされていない。

**誤った推論例:** 複数の採択candidateをまとめ、旧統合loop全体のsuccessorとみなす。

### 130 — `REQSRC-SUP-00520`

旧source line `663` SHA-256 `30b32ad0ce70cc83549b1fbfdaea5fccbe94f829763b21bc23cda0433af44f49`。原文: - GitHub episodeとDB closureが同一HEADへ収束する。

**固定F6との関係:** 固定F6のL2/L11 pairには、GitHub episodeとDB closureが同一HEADへ収束することを直接定めるものがない。後発のL2-036/040のscopeもこの条件を確立しない。

**判定:** `gap`。このsource identityに結び付くexact GitHub-event/DB-state joinと同一HEAD収束oracleがない。

**誤った推論例:** 一般的なtrace/catalog/verificationを同一HEAD収束oracleと扱う。

### 131 — `REQSRC-SUP-00521`

旧source line `664` SHA-256 `28d72ac447b6a96d973662566c8af0ac9aed7ba996e937f9b0d308182d7df798`。原文: - authority文書が本書を参照し、L0〜L14をcurrent canonicalと表示しない。

**固定F6との関係:** authority文書の自己参照やL0–L14を現行canonical levelと表示しない条件に対応する固定F6 pairは特定できない。

**判定:** `gap`。これらの文書上の主張に対するsource-boundな受入条件とnegative oracleが特定されていない。

**誤った推論例:** governance文書やlayer ledgerの存在から、特定の自己参照とlevel label制限を推論する。

## 非主張と静的検証

分類はpartial 17 / gap 4 / unknown 0。全21行でformal successor assignment=false、source condition closed=false、authority_effect=none。候補状態の記述はdecision recordのexact identity/revision/scopeに限り、旧source rowへのbindingやclosureへ拡張しない。

JSONは21件のsource tuple、queue baseline、F6との関係、後発decision context、残差を保持する。archiveの行本文/SHA、manifest/snapshot/asset ledger、F6 L2/L11とdecision fileのpinを静的に検証する。旧runtime／CLI／test／CIは実行していない。
