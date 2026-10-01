# candidate4755 初回10 source行の現行処置照合

## 対象と読み方

照合基準は専用worktreeのbase `6265c512bae65789b177e38404c8266726799f46`。初回選択10行 `000018, 000021, 000028, 000034, 000037, 000331, 000468, 000470, 000472, 000474`だけを原文起点で読み直した。後続10行や864行全体の再調査は対象外。

各sourceは旧archiveの原文、物理行、行SHA/file SHA、前後の文脈、source ledger記録SHA、asset、既存historical route/effective classificationをpaired JSONへ保存した。対象10件はJSONの明示ID一覧をmembershipとし、tracked `legacy-candidate-source-line-carry-forward.jsonl`から各 `candidate_source_line_id` を完全一致で解決して一覧の昇順に再現できる。ignoredなローカルclassifierのpath/hashは提出証拠に使わず、一覧から選択理由や順位を推測しない。分類・route labelは現行条件の充足証拠とせず、旧source行の採否・意味変更も作っていない。選択外の隣接行は一文の復元に必要な文脈としてだけ記録し、source atomへ加えていない。

現行側は採択済みの対象revisionとPO decision、L2/L11の現行bytesを確認し、候補は未採択の行き先として別記した。採択済み一般条件に部分的な意味対応がある場合も、原文固有のfailure oracleやmanagement義務を満たすとは推定しない。以下の「未解決」は要求の不存在を断定するものではなく、引用した本文・decisionでは条件固有の完全な行き先を証明できなかったという意味。

## 結果一覧

| source ID | 原文の条件 | 現行処置の結論 |
|---|---|---|
| `000018` | #1728は未承認。既存owner接続を先に行い、この候補だけでSLO、production操作、包括自動修復権限、実装/運用完了を成立させない。 | 一般のauthority境界は保持。#1728 owner解決と個別closureは未証明。source holdingを維持。 |
| `000021` | v4.1をv4.0 approved bytesとは別の次revision候補とし、U1再整備を別承認対象にする。 | 現行Conceptとrevision別PO recordsはある。旧行から現行revisionへのformal successor割当は未証明。 |
| `000028` | 正本化時にcandidate/currentの二重authorityを避け、昇格先・archive移動・参照更新を同一migrationで閉じる。 | authority分離は一般保持。source-specific migration receipt/closureは未証明。 |
| `000034` | INV 72件を候補だけで承認・v1必須・一括Issue・実装済みにしない。個別INVごとにownerを再解決し、意味/受入/権限deltaだけを要求改訂へ送る。 | 非自動昇格と差分を上流へ戻す一般境界は保持。72個別owner resolution/decisionはこの照合で証明されない。 |
| `000037` | 存在しない `06_ITEM_DIRECTIVES.md` は統合版の個別実施カードを指すものとして解決する。 | archive内の統合カード参照は実在する。current authoritative successor pointer/移管は未証明。 |
| `000331` | 各反例に独立oracleとmutation拒否検証を行い、合法入力のcontrolを通す。実証は未実施。 | 採択HARNESS pairはoracle・negative/positive controlを保持する。各negativeへの必須mutationは採択条件に見当たらず、方法保証は部分対応。retire decisionなし。 |
| `000468` | event class, PR ID, HEAD, run ID, attemptをそれぞれ欠落/改変し、不正入力を個別拒否。正常入力のgeneration identityは決定的に一致。 | 採択OS-008/020の一般identity条件は部分対応。未採択OS-117が選択scopeの個別facet negative/normal controlを行き先として保持。 |
| `000470` | queue上限/TTL超過時に古いscheduleだけ置換し、無制限並走とsilent dropを拒否。 | 採択OS-020のrun/state条件は部分対応。queue/TTL/older-only replacementのoracleは未解決。NCI-OS-005は未採択の一般候補。 |
| `000472` | cancelled runをpost-main, review, deferred-successへ注入し、各consumerが採用拒否する。 | 採択OS-020は状態分離を部分保持。#2496の未採択118 L11は3 named outcomesを個別に拒否するcondition destination。000472 source atomは118の選択9 atomに含まれず、採択/実行/formal successorではない。 |
| `000474` | bounded rehearsalまたはscheduleのrun-ID read-afterでmain push/scheduleの独立terminalとcancel/handoff receipt再構築を示す。 | 採択OS-008/020は部分対応。#2496の未採択118 pairはindependent terminal/reason/target rebuildをcondition destinationとして保持。000474 source atomは118の選択9 atomに含まれず、採択/実行/formal successorではない。旧runtime実行は現行条件にしない。 |

## source別の比較

### 000018 — #1728の未承認候補

原文は旧 `docs/governance/candidates/README.md:28–29`。選択行28の末尾「production操作、」は次行で続き、SLO値・production操作・包括的自動修復権限・実装/運用完了を候補だけで成立させない条件までが一文。既存ownerへの先行接続も本文条件である。

現行の共通規則は未承認/unknown状態から下流実装へ進まないこと、GitHubや候補登録からauthorityを生成しないことを保持する。HARNESS限定修復節は旧Bugbot候補をsource crosswalkで再採否し、修復後のoracle・独立検証・consumer受入・差戻しを維持する。ただし #1728固有のowner再解決、SLO決定、production操作、既存ownerへの接続を完了したexact decision/receiptは確認できない。一般境界のみ部分保持、個別successor/closureは未証明のままholdingする。候補だけで操作許可やproduction要求を新設しない。

### 000021 — Concept revision分離

原文はREADME:33。v4.1を次revision候補と呼び、v4.0承認bytesを維持したままU1上流再整備の承認対象を分ける。

現行 `docs/concept/helix-concept.md` をcurrent documentとして保持し、v4.1 (2026-09-17) と後続revisionのPO recordsは対象revisionを固定する。これはrevisionごとの採否を分ける意味を保つが、README上の歴史候補line 000021をどのcurrent Concept revisionのformal successorとして処置したかは別に証明されていない。現在のConcept採択を旧v4.1候補の承継と読み替えない。

### 000028 — 正本化migration

原文はREADME:42–43。選択行末「昇格先、」は次行のcompatibility/archive移動/参照更新と同一migrationで閉じる条件へ続く。candidateを候補directoryに残したままcurrentと二重authorityにしないことが含まれる。

現行authority-state modelとprovisional registerは候補登録と採択を区別し、採否は対象revisionのdecisionから読む。これは一般authority分離の保持であり、当該歴史candidate群の昇格先・archive移動・参照更新を同じmigrationで行ったことを示すreceiptではない。migration closureを主張せずsource holdingを維持する。

### 000034 — INV個別ownerと差分routing

原文はREADME:51–52の一文。72件を候補文書だけで承認、v1必須化、一括Issue化、実装済み扱いにせず、選択INVごとにRequirement/Capability/Issue/Release ownerを再解決し、意味・受入・権限deltaだけを正規の要求改訂へ送る。

現行upstream authority registerはINV-001..072をexact 72件と示し、旧P0..P4等の意味を採用せず、対象別L2で再採否する pending scopeを記録する。現行HARNESS本文も旧INV intakeを新世代crosswalkへ戻す。これらは非昇格境界を支えるが、72個別のowner解決とdelta処置が完了した証拠ではない。各INV単位の行き先が確認されるまで一括closureしない。

### 000037 — 分冊参照の解決

原文README:53–54。READMEは `06_ITEM_DIRECTIVES.md` が実在せず、統合版の「INV-001〜072 個別実施カード」をその参照先として扱うと明記する。source intake `development-investment-stage-directives-intake_v1.0.md:10–17` にはその統合カードと分類手順が実在するため、歴史文書内のbroken linkの意味は解決する。

ただしarchive内のリンク解決はcurrent authoritative successorの作成/移管ではない。upstream registerも対象別再採否をpendingとして記録する。旧テストや旧runtimeを実行せず、現行sourceの後継や72件のclosureを生成しない。

### 000331 — 反例ごとのoracle/mutation/control

原文は `bugbot-bounded-repair-acceptance.md:16`。各反例単位で独立oracle、mutationによる拒否、合法入力controlを求め、実証は未実施と明示する。

採択HARNESS-L2-030/-031と対L11はcaseごとの事前特定oracleとnegative/positive examplesを持つ。対象revisionは2026-09-28 HARNESS PO decisionの明示採択集合（表行59–60、L2/L11 exact digest）であり、本文内の歴史的「未採択」metadataは採否を覆さない。2026-09-29 decisionはHARNESS-L2-036/-L11も表行41で採択し、riskに応じてproperty/model/differential/mutation/fuzz/snapshot手法を選ぶ。ただし各反例に個別mutationを必須とする条件は採択L11に明記されていない。手法名の不在だけから不足とは判定しない。原文は「各反例」にmutationを要求する一律な方法条件なので、その意味差は残す。選択肢Aは各negativeにindependent oracle+mutation rejection+legal controlを要求する（推奨: 原文のquantifierを保持し、数値thresholdは足さない）。BはHARNESS-L2-036のrisk-selected methodに委ね、mutationを各negativeに一律要求しない。A/Bは採択HARNESS-L2-005/030/031/036の受入方法に影響し、INTELLIGENCE限定修復consumerへはその適用範囲を別途照合する。現行本文にoracle/controlの行き先はあるが、A/Bの選択・retireは未決であり、source closureは主張しない。

### 000468 — generation identity各facetのnegative

原文は `ci-event-concurrency-generation-acceptance.md:14`。5 facet (`event class`, `PR ID`, `HEAD`, `run ID`, `attempt`)のそれぞれを個別に欠落/改変し、generation identityが決定的に一致する合法対照と個別rejectを確認する。

採択OS-008/020はHARNESS義務に従うCI profile、exact HEAD/oracle/environment/run identity、状態分離を扱うが、5 facetごとのnegativeおよび同一入力からの決定的generation identity対照を明示しない。HELIXOS-L2-117/-L11-117候補はこの選択scopeを明記し、各facetの欠落/改変拒否と正常identity対照を保持する。ただしPR IDが全event classで必須か、PR eventにだけ適用されるかをA/B選択肢と推奨Bとして未決に残す。117は未採択候補であり、採択済み充足ではなく要求本文の行き先。NCI-OS-003/-004/-005候補は別のより広いCI候補で、117のexact facet条件を自動採択しない。

### 000470 — bounded schedule queue/TTL

原文はCIG-AC-003だけ。source atomに隣接するAC-002のmain/manual/PR cancel independenceを今回の条件に混ぜない。対象はqueue上限とTTL超過時にolder scheduleだけを置換し、unbounded parallelismとsilent dropをrejectする結果。

採択OS-020はexact run/evidence/state、old CI success非代用を保持し、OS-008はHARNESS義務とprofile接続を持つ。queue limit、TTL、older-schedule-only replacement、unbounded parallelism/silent dropの個別oracleは該当本文にない。NCI-OS-005候補はqueue/parallelism/cache/shard/retry/budgetの最適化でrequired HARNESS oracleを保つが未採択。追加で照合した#2496 DraftのHELIXOS-L2/L11-118は同一PR stale HEADだけ・newer scheduleはolder scheduleだけ置換し、無制限並走とrequired verification喪失を拒否する。sourceの「queue上限とTTLを超える」へのtest boundary/terminal outcomeは数値を固定せずに定義可能だが、118はそのoutcomeを列挙していない。また `silent drop` を独立反例として拒否しない。source row 000470は118の9 selected request atomsに含まれないため、この関係は候補の条件行き先である。推奨追補は、未完義務が残るscheduleを明示pending、older-schedule-only replacement、またはterminal non-successのいずれかで可視にし、黙って消えて成功扱いになるfixtureを拒否すること。queue/TTLの数値は下流選択までunknownのままとする。新identityは要らず既存118候補の差分だが、未採択のまま。

### 000472 — cancelled runの3 consumer拒否

原文はCIG-AC-005だけ。列挙する `post-main`, `review`, `deferred success` の各consumerへcancelled runを注入し、全consumerが採用拒否する。今回のatomから未記載のconsumer集合へscopeを広げない。

採択OS-020はsuccess/fail/denied/skipped/interrupted/staleの状態を分離し、old CIや別HEAD greenを禁止する。これらの一般状態保証は各named consumerがcancelled runを採用しないことと同じではない。NCI-OS-004候補は別の未採択候補。加えて#2496 Draftの118 L11はcancelled runをpost-main completion、terminal green、deferred recovery success、review receiptへ個別に投入し、全て拒否する。これはsource 000472の三consumerを全て含む条件の行き先である。ただし118 receiptの9 atom collectionは別の旧要求source行であり、000472 itselfのselected spanを登録していない。よってcandidate coverageとして記録し、採択、実行、正式successor、closureから分離する。重複候補は起こさない。

### 000474 — run-ID read-afterとcancel/handoff receipt

原文はCIG-AC-007: bounded GitHub rehearsalまたはnatural scheduleのrun ID付きread-afterから、current-main pushとscheduleが別々のterminal outcomeを持つこと、cancel/handoff receiptを再構築できることを求める。旧 acceptance 文書line 26はruntime rehearsalをcanonical promotion後の別PLANへ送ると説明するため、当時の検証ルートと要求されるresult guaranteeを区別する。

採択OS-008/020のrun-bound evidence・中断/再開・未完義務条件には意味上の隣接がある。追加照合した#2496 Draft 118はcurrent canonical HEADのterminal evidence、main post-checkとschedule safety-netの分離、選択義務ごとの独立terminal evidence、cancel/supersede/handoffのreasonとtarget再構築を要求し、欠落・不一致はunknown/incompleteに留める。このためsource 000474のresult guaranteeにはcandidate text destinationがある。000474 source atomは118の9 selected atomsに含まれず、採択・実行・formal successor・closureではない。旧GitHub rehearsal routeを現行実行許可にしない。

## #2496 Draft 118との追加比較

追加比較対象は#2496 Draft HEAD `0a9c58e0907ea2821374c84dfabe2482edde4419` の `HELIXOS-L2-118` と `HELIXOS-L11-118`。section digestはそれぞれ `sha256:3f9a18340eebe4dbbdbd7c172c5f54f4289071271c927b7ca5edd28225ae7d4a` と `sha256:720f1dcca06883dac492836cbdb36804c34a8df25546a4840a162c80fa15babe`。対応MPRは `MPR-RC-HELIXOS-L2-118-001`、`registered_proposal` / `authority_effect: none`。118 receiptは選択した9 request-source atomsを118 pairへ束ねるが、今回のacceptance source rows `000470/472/474` はそのinput atom setには含まれない。したがって下記は条件内容の行き先として評価し、source atom mapping、採択、実行、formal successor、closureと区別する。

- `000472`: L11-118 lines 1050–1051はcancelled runをpost-main completion、terminal green、deferred recovery success、review receiptへ個別に与え拒否する。sourceのpost-main/review/deferred-successを全て包含する既存候補destinationで、重複候補を作らない。
- `000474`: L2/L11-118 lines 1461–1462 / 1047–1052はcurrent canonical HEADのterminal evidence、main/scheduleの独立結果、cancel/supersede/handoffのreasonとtarget再構築を保持し、欠落/不一致をunknown/incompleteとする。要求結果は候補本文に行き先がある。旧bounded GitHub rehearsalは実行要求へ移さない。
- `000470`: 118はolder-schedule-only replacementとunbounded parallelism禁止を保持し、具体queue/TTL値を固定しない。sourceにも数値はないので数値未指定自体は欠落でない。一方、silent dropを拒否する個別oracleと、queue/TTL超過時に未完required verificationをpending/replaced/terminal-non-successとして明示する結果は本文にない。これは既存118 candidateへの限定追補が必要な残差。数値policyやprovider concurrency方式は推測しない。

## mainへ統合済みの118-001との追加照合

上の#2496 Draft HEAD `0a9c58e0907ea2821374c84dfabe2482edde4419` 比較は、その当時の9 atom snapshotとして保持する。これとは別に、main `2a6b1fdd49ffa74eb2075fd98f67daca316408f2` に統合された `MPR-RC-HELIXOS-L2-118-001` を現行比較した。register line 650は `registered_proposal` / `authority_effect: none`、候補semantic digest `sha256:7872e13850587caf3a16cfadb8e4b793a4d893faf06d0085d443590998f2b1d4`。L2-118 lines 1455–1465、L11-118 lines 1043–1052のpaired section digestはそれぞれ `sha256:7872e13850587caf3a16cfadb8e4b793a4d893faf06d0085d443590998f2b1d4` と `sha256:feea1a8262ed8ab5feef63b552ebf4d3e1931518cafbd85e2b8e1bb56763c95d`。

main receipt `ci-event-concurrency-coverage-receipt-2026-10-02.json` は11 atom、set digest `sha256:c30189321ceb43db600de12633d554526d3ca519367ee0d807f1205bfb21e868` を記録する。source atom IDsは `000491, 000492, 000496, 000497, 000499, 000500, 000501, 000502, 000527, 000528, 000529`。この集合に `000470/000472/000474` は含まれない。receiptも `condition_closure: not_asserted` と明記する。

したがって既存の条件比較結論は変わらない。000472と000474はmerged 118-001のL11/L2 condition destinationに内容があるが、receiptのsource mapping・採択・実行・formal successor・closureではない。000470についてはolder-schedule-only replacementとunbounded parallelism禁止の行き先がある一方、silent-drop rejectionおよびqueue/TTL超過時の可視pending/terminal non-success結果はmerged 118-001本文にない。これはsource上の数値を新設せず、既存候補に残る条件差として扱う。歴史Draftの9 atom比較とmerged mainの11 atom比較を混同しない。

## 採択・候補・保留の区別

- `HARNESS-L2-030/-031` とその対L11は2026-09-28 decisionが正確なtarget revisionを採択。`HARNESS-L2-036` は2026-09-29 decisionの別行で採択。各採択の対象はdecisionに示すrevisionであり、source 000331のmutation条件を自動的に全量移管したという意味ではない。
- `HELIXOS-L2-008/-020` は2026-09-28 OS decisionの採択集合。これらの一般保証と今回のCIG-AC-specific oracleは、意味が隣接しても別条件として比較した。
- `HELIXOS-L2-117`、NCI-OS-003/-004/-005、HARNESS/OS NCI文書中のdraft candidateは未採択のlanding candidates。candidate textやMPR provisional metadataをcurrent adoptionへ読み替えていない。
- この照合でformal successor assignment、旧conditionのretire/meaning-change decision、source closureは作成していない。新しいL2/L11、register行、receipt、authority decisionも作成していない。

## 静的検証

Paired JSONには10件すべての選択行、直接読んだ隣接文脈、旧source file/line SHA、ledger record SHA、asset ID、current comparison、採択decisionまたはcandidateの参照と本文上の位置を記録した。基準本文・decision・source fileのbase hashはJSON `pins` を参照する。archive runtime/CLI/test/CIは実行していない。
