# 旧candidate CIG concurrency選択10行の現行処置照合

## 対象とauthority

- 現行比較base：`7b9d1938fc7699404f68c2b87829df56dc6f690d`。
- 旧行選択：既存 `candidate4755-condition864-current-treatment-2026-10-02.json` のsource ID順で、前回対象の次にある10物理行（000478、000491、000492、000496、000497、000499、000500、000501、000502、000528）。同JSONの機械分類や`no_condition_specific_current_target_evidence_found`だけを欠落証拠にしていない。
- 旧archiveは読み取りだけとし、旧runtime、CI、test、CLI、live rehearsalは実行していない。
- HELIX-OS 2026-09-28 PO decision（ファイルSHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`）は固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL1/L2/L11 exact revisionを特定し、L2 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`／L11 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` bytesとHELIXOS-L2-001..029を採択している。2026-09-28本文のauthorityはこのdecisionから読む。今回のHELIXOS-L2/L11-118はその採択範囲の変更ではない。
- 現行の採択L2-007／008／009／018／019／020と対L11を確認した。L2-007/019とL11-007/019はprovenance、欠落・重複・stale・未実行、event projection・checkpoint、再構築を扱う。L2-009/L11-009は中断・交代時の累積制約と未完義務、二重作業防止を扱う。L2-018/L11-018はassignment/attemptのbinding・期限/lease失効後のhandoffを扱う。L2-008/L11-008はHARNESS義務由来profile、CI起動・失敗・修復・再実行、旧CI結果での代替禁止を扱う。L2/L11-020はexact HEAD/oracle/environment/run identity、実行state、義務不足・中断の未完引継ぎ、oracle削減不可を扱う。いずれも別検証義務間のcancel非干渉、current-main post-main検収保護、stale generationのみのbounded置換、cancel/supersede/handoff対象の再構築、cancelled runの成功・terminal green・別義務結果流用を明示していない。
- HELIX-OS NCI候補（現行ファイルSHA-256 `4eae5f8dd485ed8c77d2ea7b6b0407028093c02566e5b92fce9d05a89307a49d`）のOS-003/004/005は、run binding、失敗分類、queue/parallelism/budget最適化とrequired oracle維持を候補条件として持つ。対L11候補は別HEAD、oracle省略、cancel等の状態区別に関係するが、current-main保護・義務間非干渉・stale-only置換・cancelledの全consumer拒否・理由/対象の再構築を具体oracleとして列挙しない。crosswalk（SHA-256 `fb4e8bdc6ffb29acf17d79aeb961a97dea239ef59291e79522dae8fe13c551cf`）はCIG-BR-02/R-02、R-03、CIG-BR-03/R-04をNCIへ`split_reapproval_required`、CIG-AC-001..007を候補oracleとして対応付けるが、現行採択とは扱わない。
- `b447ecccd`のroot-local HELIXOS-L2-115候補も照合した。115は一つの既存assignment/attemptが終端した後の遅着・重複Worker resultをそのattemptのaccepted/current resultにしない条件であり、複数run/義務のcancel、置換、cross-obligation reuseを対象にしない。機能は重複しない。

## 物理行別の意味照合

旧本文は次の3ファイルを全文読んだ。source-lines JSONLは選択9 requirement atomsについて原文、archive path、物理行、file/line/bytes SHA、ledger record hash、asset ID、歴史routingを保持する。

| source ID / 旧path:line | 選択行が述べる条件 | 現行本文と判定 |
|---|---|---|
| `000478` / `ci-event-concurrency-generation-acceptance.md:26` | runtime実装・DB migration・live rehearsalはcanonical promotion後の別PLANで検証する。 | 工程順・下位実装の条件であり、新しい要求述語ではない。現行L2-008は上流確定後にL3/L10から実装を再導出し、L2-020は新世代CI未構築と旧CI非実行を保持する。別PLAN/下位設計へ残し、118のatomから除外する。 |
| `000491` / `ci-event-concurrency-generation-requests.md:17` | schedule/manual safety-netがcurrent main HEADのpost-main検収をcancelしてはならない。 | 採択L2/11-008, 020のexact HEAD/run identityやoracle削除禁止では、別runによるcurrent検収のcancel/non-substitutionまでは決まらない。118にcurrent main保護と別義務結果での代替拒否を追加する。 |
| `000492` / 同requests:18 | 全run並走でqueue、費用、古い証拠を無制限にしない。 | NCI-OS-005候補はqueue/parallelism/budget optimizationとoracle維持を挙げるが、無制限累積の禁止は明記しない。118は数値を作らずbounded controlを要求する。 |
| `000496` / 同requests:23 | CIG-BR-02はcurrent main検収を保持し、stale generationだけをboundedに置換する（対応先R-02/R-03）。 | accepted L2/11-020のsame-HEAD/required-oracle条件とNCI-OS-003/005候補を全文照合。義務境界に限るstale-only置換とcurrent-main検収維持は未記載で、118の入力対象。 |
| `000497` / 同requests:24 | CIG-BR-03はcancel/handoff/terminal結果を証拠から再構築する（対応先R-03/R-04）。 | accepted L2/11-007/009/019はeventと未完義務のprovenance再構築を保持するが、cancel/supersede/handoffと複数CI runのreason/target/terminal関係は名指さない。118に限定して候補化する。 |
| `000499` / 同requests:28 | current canonical HEADのterminal evidenceを安定して取得する。 | L2/11-020はrun identityとsuccess/fail/denied/skipped/interrupted/staleの分離を要求するが、current canonical HEADのterminal read-afterを明記しない。118の候補受入に追加する。 |
| `000500` / 同requests:29 | stale PR HEADと重複scheduleを、別event classへ影響させずbounded置換する。 | 採択L2/11とNCI候補の一般的なqueue/parallelism/HEAD bindingでは、他義務へのcancel波及とstale-only bounded replacementを検収できない。source class名は受入fixture例として残し、L2固定enumにしない。 |
| `000501` / 同requests:30 | cancel/supersede/handoffの理由と対象を後から再構築する。 | L2/11-007/019の一般provenanceは任意のCI置換結果に対する具体関係を記さない。118はreason、対象義務/generation、terminal evidenceの追跡だけを追加し、旧receipt schemaを移さない。 |
| `000502` / 同requests:31 | required verification削減、cancelled run成功扱い、別event class結果流用を高速化として認めない。 | L2/11-008/020はoracle削減や旧/別HEAD green代用を拒否するが、cancelled-runをpost-main/terminal/deferred recovery/review successへ使う拒否とsame-HEAD/different-obligation結果の不流用はない。118 L11へ個別反例を追加する。 |
| `000528` / `ci-event-concurrency-generation-requirements.md:31` | atomは物理行31のみ。行30をcontext-onlyで読むと、同一PRのnewer HEADはそのPRのstale HEADだけを置換し、newer scheduleはolder scheduleだけを置換できる。行31末尾の`cancel-in-progress:false`句は行32に続き、無制限並走を代替実装にしないという完全文脈になる。行30/32のtext・path・line・SHAをpaired JSONに別記し、atom数/digestには追加しない。 | L2/L11-020のrun identity・別HEAD拒否は保持済みだが、同一PR/stale-onlyとschedule-to-schedule限定は受入になっていない。118 Aは旧strict event class条件、無制限並走を設定1個で代替しない条件、別class結果非流用を保持する。Bは同義務なら別event class結果を流用しうる一般化で、元sourceのstrict非流用条件を弱める意味差として明示する。 |

旧行ID・source fulltext/SHA・assetとledger/routing関係の正本は次のsource ledger/receipt。監査選択に使ったignored local JSONの分類はauthorityでもsource digestでもない。

- source atoms：[`ci-event-concurrency-source-lines-2026-10-02.jsonl`](../requirement-registration/ci-event-concurrency-source-lines-2026-10-02.jsonl)
- candidate receipt：[`ci-event-concurrency-coverage-receipt-2026-10-02.json`](../requirement-registration/ci-event-concurrency-coverage-receipt-2026-10-02.json)
- MPR：`MPR-RC-HELIXOS-L2-118-001`（`registered_proposal`／`authority_effect: none`）。digest訂正の旧local draft履歴と最終一行への整理はreceipt/paired JSONに記録。

- 条件単位の構造化照合は[paired JSON](legacy-candidate864-ci-event-concurrency-rows-current-treatment-2026-10-02.json)に記録した。各atomの採択済み／候補L2・L11行先、行／section digest、歴史routing、meaning変更、holding処置を含む。

## 意味差・PO判断材料

旧sourceのCIG-R-02は`main_push`、`schedule`、`workflow_dispatch`、別PRの相互cancel禁止、同一PR内のstale HEAD限定置換、schedule内のolder schedule限定置換を指定する。source-faithful Aはこのstrict条件を保証し、provider APIやreceipt schemaは固定しない。Bはevent classをfixture例として義務/generation境界へ一般化するため、同一義務での別class結果流用を許し得る。これはold strict conditionを弱める意味差であり、PO decisionがない限り採択条件として扱わない。

- **A（推奨・source-faithful）**：旧sourceに明記されたevent間cancel禁止、同一PRのstale HEADだけの置換、newer scheduleからolder scheduleだけの置換、別event class結果の高速化利用禁止を保つ。event名はこの要求scopeの振舞いを識別し、provider APIやschemaを固定しない。
- **B（意味変更を要する）**：event class名をfixture例にし、同じ義務/generationであれば別event class結果を流用できる一般化を認める。sourceのstrictなevent class非干渉・結果非流用を弱めるため、選ぶ場合は許す範囲と影響要求をPO decisionに記録する。

両案ともcurrent-main post-main検収の非代用、数値を捏造しないbounded制御、旧runtime/CI/test/live rehearsal禁止を維持する。Bは同義務・同generation内のevent class横断流用を許し得るため、Aと同じsource意味ではない。並列数・queue上限・TTL、GitHub native concurrency、旧receipt/DB/doctor/telemetry/run-ID形式は固定しない。

## 境界と判定

9 requirement source atomsを未採択のL2/L11-118候補へ入力し、source holdingは残す。coverage receiptの`no_loss`は9 atomの候補入力への対応だけを表し、正式successor、対象scope/ownerのPO割当、PO採択、条件closure、runtime実装または実行済み受入を主張しない。000478は監査対象10行のうちの工程条件として現行L3/L10後の別PLANへ残し、118 requirement atom数に加えない。
