# confirmed175 FR-L1-11〜15 固定L2/L11条件照合

## Scopeと方法

- 対象: `harness/L1-requirements/functional-requirements.md::FR-L1-11`〜`FR-L1-15`の5 identity。
- 比較対象: POが固定した `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2/L11 bytes。
- 作成基準（#2413 merge/read-after main）: `89343b2fbd73cd2c78f97e3ae1b3973292d9eb30`。旧source・f6固定L2/L11・後発pairの318ec4/5aa100 pinsは変更していない。
- main `89343b2fbd73cd2c78f97e3ae1b3973292d9eb30` のqueueで5件とも `not_individually_compared`、証拠artifactなし。source-qualified identityでの既存artifact一致はqueue/full audit/REG-06 population auditのみ。新規のv13 layer-chain 12件は別source identity (`REQSRC-SUP-00034..00045`) であり重複しない。
- 旧L1原文、L3詳細AC/責務表、screen requirements、L6 function contractを読んだ。旧CLI・旧runtime・旧test・旧CIは実行していない。
- 後発57件および11件のPO判断記録にある計68 identityを読み、意味上近い採択pairは本文・L11の固定digestまで照合した。近接は影響を限定して記録し、formal successorや全条件coverageには読み替えていない。

旧L1 sourceとholding copyはいずれもSHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、assetは `LEGACY-ASSET-6B6C5CB0E481BE01088B`、carry stateは `preserved_pending_rehome`。

固定ファイルのSHA-256:

| 文書 | SHA-256 |
|---|---|
| HARNESS L2 `product-requirements.md` | `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` |
| HARNESS L11 `product-acceptance.md` | `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` |
| OS L2 `governance-requirements.md` | `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` |
| OS L11 `governance-acceptance.md` | `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |

## 個票

### FR-L1-11 — interrupt / debt / drift-check / readiness

旧L1 line 42は4機構をcross-cutting、mode進行非ブロックとして扱い、入力をinterrupt event・debt ledger・drift・hold、出力をinterrupted sprint・debt register・divergence report・後続PLAN延期とする。L3 ACは、(1) L4中にP0 interruptでPLAN-040を止めてtroubleshoot PLAN-041を起票しcontext handoverを保存、(2) interrupted済みPLANへの再interruptをfail-closeしてresumeをnext actionとする、(3) 境界ACはline 352に「30件以上」、line 354の期待文言に「30件超過」とあるため、exact 30の発火条件は原文内で不整合。警告を出し起票をblockしない意図は記録するが、閾値を確定しない。line 352 SHA-256 `52da3fce10e79c87a1ff78b3557843afcb2539310ec013f609be03b68b69f65f`、line 354 SHA-256 `53543573643858a934be130df6b39e0e9bc6d34a7364a911f75cbdebe236fcd1`をJSONにもpinした。L6 `recordCrossCuttingEvent`はtype/severity/subject/evidence pathを受け、append/projectionのみでgateをapproveできない。PM-03/HM-07は4 signalの可視化先。

固定HARNESS-L2-003とOSの進行・ticket・証拠・継続要件は状態の区別、未完義務、event記録を一部保持する。しかし4 signalの一体的な非ブロック発動、duplicate interruptの拒否、30件境界は固定pairから確認できない。

近接する採択pairは二つ。HELIXOS-L2-037は週次の非同期scope別drift観測とsource/ownerが負債分類した際の引継ぎ。全signalの常時engineではなく、旧30件閾値を定めない。HELIXOS-L2-041はreload失敗後に外部正本を再取得し、missing/stale/conflictなら依存作業を保留するsafe continuation。interrupt優先度、resume操作、debt/readinessは扱わない。

**残差:** 旧4 signalを一体で非ブロックに運転するoracleと再interruptのfail-close例外は未確認。debt境界はAC line 352「30件以上」とline 354「30件超過」が矛盾し、exact 30は曖昧なまま保持する。既存の意味対応は部分的で、atom-by-atom移管も未割当。

### FR-L1-12 — L単位の5要素context injection

旧L1 line 43はskill、workflow、必須agent、推奨command、orchestrationをL別に注入する。継続記述は工程別推挙、layerごとのscore/reason、5値 `orchestration_mode` と判断/実装の役割分離、hybrid不在時のsilent-fallback禁止、task classify/estimate・skill suggest・team runを含む。L3 ACではPLAN layerから `docs/skills/<L>-injection.yaml` を選び5要素を入れる。L3例ではskillを5件、選定理由付きで出す。ファイル不在はfail-closeして定義作成へ返す。`skill_override`は推薦より優先するがTL承認auditが必要。hybridがない場合のsilent fallbackは禁止し、不在を明示記録する。team runはfrontier-reviewer/worker/fast-checkerに役割分離し、同じruntimeとmodelによる作成・承認の兼任を禁止する。L6契約はtask/layer/kind/drive/catalogを入力にしたdeterministic rank/reason、catalog欠落finding、prompt bodyをコピーしない条件を定める。HM-05/HM-02が注入状態・coverageの表示先。

固定HARNESS-L2-002/009の開発方式・設計義務、HELIXOS-L2-018のWorker割当は文脈入力に接するが、5要素の注入bundleと同一ではない。採択HARNESS-L2-037は選択phase/task/design obligation等を使ったspecialist contractのcontext selectorであり、全L向けの5要素注入、score/reasonまたはoverride承認条件を補わない。HELIXOS-L2-041の正本再取得provenanceも安全な継続に限られる。

**残差:** 5要素一式、推薦数/score/reason、orchestration値ごとの意味、hybrid不在時のfallback禁止と不在記録、missing-definition negative path、override権限条件、same-runtime/modelのauthor/approver分離はこの固定scopeから確認できない。旧schema、CLI、runtimeを現行契約として継承しない。

### FR-L1-13 — 3つのdevelopment styleとForward工程

旧L1 line 44はtrace-freeze後/accept前に`helix review --uncommitted`で差分をレビューし、未コミット差分・design/test/code trace・依存・重複・機能整合をevidenceへ残す条件を含む（command自体は旧もの）。そのうえでPLAN→pair-freeze→implement→trace-freeze→review→acceptを `FULL_L1_L12_V`、`PRODUCTION_SCRUM`、`V_DESIGN_SCRUM_IMPLEMENTATION` の同列styleで動かし、正規6 V-pairのgate evidenceを要求する。L3 ACは、L3/G3 passからL4へ進む正常経路、G3未通過でL4起票をfail-closeする経路、L3主線を止めずにL7 troubleshoot PLANを並行起票して影響をauditする例外を定義。L6契約はprior gateが既知で通過した時だけForward pass、例外には明示evidence必須、blocked gateを黙ってskipできないとする。PM-01/02/03に3 styleの選択・進捗・gate表示が割り当てられる。

固定HARNESS-L2-001/002/003と対L11は現行のL1-L12、6正規pair、style選択/合成、gate/evidence順序、成果状態分離を保つ。一方、現行は4 development styleを定義し、旧layer番号・旧CLI・phase.yamlは継承しない。後発採択HARNESS-L2-046はFull V workflowとselected Production Scrum slice-delta/backfillを具体化するが、旧3 style同列集合や全styleの完全なartifact mappingを復元しない。

**残差:** 旧3 styleの意味・適用、各phase/artifactと6 pair receiptのexact binding、status/next表示、L7並行例外の具体oracle、および指定時点でのレビュー証拠収集条件の全てが同じ固定契約で成立するとは確認できない。レビュー順序/evidence意味は旧source条件として保持するが、旧CLI/runtimeの移行とは扱わない。

### FR-L1-14 — 5 type Reverse、R0-R4＋RGC

旧L1 line 45はcode/design/upgrade/normalization/fullbackの5 type、R0-R4＋RGC、evidence/contracts/as-is-design/gap-register/routingを成果とし、onboarding・Incident後backfillには使うがdevelopment style/Discoveryへ分類しない。L3 ACでは、1000行sourceのcode ReverseがR0 evidenceにfunction/class/dependencyを記録しR1を案内、type欠落はfail-close、R4 `gap-only`はgapを記録しForwardを開始しない。L6契約はR4 evidenceに加え`forward_routing`と`promotion_strategy`を要求し、confirmed evidenceのみForwardへ合流できる。PM-02/HM-07で状態を可視化する。

固定HELIXOS-L2-010のticket type/routing、HARNESS-L2-019とL11のFull Reverse入口・evidence境界は部分対応する。採択HARNESS-L2-038はsource/reverse evidenceのsubstanceとR4 evidenceを具体化する近接pair。ただし旧5 type列挙、R0-R4/RGC順序、各Rn成果物schema、missing-type fail-close、gap-only無合流の同等条件までは示さない。

**残差:** 旧type列挙とstage sequence、1000行example、named output、R4 no-Forward boundaryはそれぞれ独立した未確認atom。旧path/CLIは現行で使わない。

### FR-L1-15 — Scrum外のDiscovery/PoC S0-S4

旧L1 line 46はhypothesis→experiment plan→PoC→verify→decideをScrumへ内包しない別軸case-driven modelとする。入力はhypothesis・verify script・選択style、出力はPoC PLAN/scriptとconfirmed/rejected/pivot、S4後のstyle接続。L3正常例は「TauriがElectronよりbundle size 50%小」という仮説と実測JSON、S4 confirmed。S4 outcome欠落はfail-close。pivotは旧PLANをarchiveし新仮説を案内、Forward合流なし。L6はhypothesis・PoC evidence・outcomeを要求し、rejected/pivotをconfirmedとして扱えないとする。PM-02/HM-05にS0-S4とログを割り当てる。

固定HARNESS-L2-002/003はPrototypeとPoCを別に適用判定し、PoC/Discovery結果を要求へBackflowしDecide後にForwardへ進める。固定OS L11 HXT-TYPE-07（line 284、line SHA-256 `7f8a108c96061cf4be96fd18723691d0589ea967a043ea69594fef0d2ab1ccb4`）は採用→Forward、不採用→記録終了、方針変更→次計画というDecide結果の隣接routingを定めるが、旧S4 enum/全S0-S4 lifecycleの後継ではない。HELIXOS-L2-010のHXT-TYPE-05/HXT-FLOW-01/04はPoC/PrototypeとDiscoveryを別ticket経路にする。これは旧S0-S4 status enumの同一移管ではない。後発HARNESS-L2-046の対象はFull Vと選択Scrum sliceで、S0-S4をscrum工程化しない。HELIXLABO-L2-062は外部research claimとsource span照合の採択条件で `version_target: 2.0`。PoC measurement/verify script/S4決定を置き換えず、1.0へ前倒ししない。

旧50%は例の仮説値であり、現行の全PoCに適用する閾値ではない。rejectedとpivotはconfirmedと異なる出口であり、pivotはForwardへ合流しない。

**残差:** 旧S0-S4全体、verify script artifact、必須S4 outcome schema、三値decision routingとpivot no-Forward oracleの同一契約は確認できない。採択されたresearch evidence pairからPoCや要求採択を推定しない。

## 判定と限界

5件とも監査状態は `open_partial_correspondence`。これは条件単位の照合結果であって、旧要求の採否・retire、formal successor割当、L3承認、実装・実行許可、受入実行、closureやStep 5完了を意味しない。JSONに全条件、旧consumer参照、f6ファイルhash、後発近接pairのdecision ID・registration・file/section SHAを記録した。
