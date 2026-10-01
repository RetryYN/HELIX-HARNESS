# candidate4755 初回10 source行の現行処置照合

## 対象と読み方

照合基準は専用worktreeのbase `6265c512bae65789b177e38404c8266726799f46`。初回選択10行 `000018, 000021, 000028, 000034, 000037, 000331, 000468, 000470, 000472, 000474`だけを原文起点で読み直した。後続10行や864行全体の再調査は対象外。

各sourceは旧archiveの原文、物理行、行SHA/file SHA、前後の文脈、source ledger記録SHA、asset、既存historical route/effective classificationをpaired JSONへ保存した。分類・route labelは現行条件の充足証拠とせず、旧source行の採否・意味変更も作っていない。選択外の隣接行は一文の復元に必要な文脈としてだけ記録し、source atomへ加えていない。

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
| `000472` | cancelled runをpost-main, review, deferred-successへ注入し、各consumerが採用拒否する。 | 採択OS-020のstate分離は部分対応。3 consumerごとのcancel拒否は本文で証明できず、NCI-OS-004も未採択。 |
| `000474` | bounded rehearsalまたはscheduleのrun-ID read-afterでmain push/scheduleの独立terminalとcancel/handoff receipt再構築を示す。 | 採択OS-008/020のrun-bound evidenceは部分対応。独立terminal/read-after/rebuild条件は未解決。旧runtimeの実行を現行条件にしない。 |

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

採択HARNESS-L2-030/-031と対L11はcaseごとの事前特定oracleとnegative/positive examplesを持つ。対象revisionは2026-09-28 HARNESS PO decisionの明示採択集合（表行59–60、L2/L11 exact digest）であり、本文内の歴史的「未採択」metadataは採否を覆さない。2026-09-29 decisionはHARNESS-L2-036/-L11も表行41で採択し、riskに応じてproperty/model/differential/mutation/fuzz/snapshot手法を選ぶ。ただし各反例に個別mutationを必須とする定量/一律条件は採択L11に書かれておらず、L11はmutation閾値を新設しないとも定める。したがって独立oracleと合法controlは保持、全negative mutationの義務は部分対応/意味変更の可能性として扱い、PO retire/waiver decisionがない限りclosureしない。INTELLIGENCEの限定修復境界も別のproduct scopeであり、このHARNESS oracle条件の代替としない。

### 000468 — generation identity各facetのnegative

原文は `ci-event-concurrency-generation-acceptance.md:14`。5 facet (`event class`, `PR ID`, `HEAD`, `run ID`, `attempt`)のそれぞれを個別に欠落/改変し、generation identityが決定的に一致する合法対照と個別rejectを確認する。

採択OS-008/020はHARNESS義務に従うCI profile、exact HEAD/oracle/environment/run identity、状態分離を扱うが、5 facetごとのnegativeおよび同一入力からの決定的generation identity対照を明示しない。HELIXOS-L2-117/-L11-117候補はこの選択scopeを明記し、各facetの欠落/改変拒否と正常identity対照を保持する。ただしPR IDが全event classで必須か、PR eventにだけ適用されるかをA/B選択肢と推奨Bとして未決に残す。117は未採択候補であり、採択済み充足ではなく要求本文の行き先。NCI-OS-003/-004/-005候補は別のより広いCI候補で、117のexact facet条件を自動採択しない。

### 000470 — bounded schedule queue/TTL

原文はCIG-AC-003だけ。source atomに隣接するAC-002のmain/manual/PR cancel independenceを今回の条件に混ぜない。対象はqueue上限とTTL超過時にolder scheduleだけを置換し、unbounded parallelismとsilent dropをrejectする結果。

採択OS-020はexact run/evidence/state、old CI success非代用を保持し、OS-008はHARNESS義務とprofile接続を持つ。queue limit、TTL、older-schedule-only replacement、unbounded parallelism/silent dropの個別oracleは該当本文にない。NCI-OS-005候補はqueue/parallelism/cache/shard/retry/budgetの最適化でrequired HARNESS oracleを保つが未採択であり、old-schedule replacementのclosureを証明しない。sourceにない数値を足さず、exact requirementは未解決に残す。

### 000472 — cancelled runの3 consumer拒否

原文はCIG-AC-005だけ。列挙する `post-main`, `review`, `deferred success` の各consumerへcancelled runを注入し、全consumerが採用拒否する。今回のatomから未記載のconsumer集合へscopeを広げない。

採択OS-020はsuccess/fail/denied/skipped/interrupted/staleの状態を分離し、old CIや別HEAD greenを禁止する。これらの一般状態保証は各named consumerがcancelled runを採用しないことと同じではない。NCI-OS-004候補はcancel等の状態を区別するが未採択であり、3 consumer別受入も明記しない。条件固有のclosure/retirement decisionは見つからず未解決。

### 000474 — run-ID read-afterとcancel/handoff receipt

原文はCIG-AC-007: bounded GitHub rehearsalまたはnatural scheduleのrun ID付きread-afterから、current-main pushとscheduleが別々のterminal outcomeを持つこと、cancel/handoff receiptを再構築できることを求める。旧 acceptance 文書line 26はruntime rehearsalをcanonical promotion後の別PLANへ送ると説明するため、当時の検証ルートと要求されるresult guaranteeを区別する。

採択OS-008/020のrun-bound evidence・中断/再開・未完義務の条件には意味上の隣接があるが、current-main push対scheduleのindependent terminal、run-ID read-after、cancel/handoff receipt reconstructionは明記されていない。NCI候補も未採択。current rulesでarchive CI/runtimeを実行せず、新CIの実装/実行を要求形成gateにもしない。独立terminal/receiptの要求意味が必要なら、新世代の静的・下流受入契約として正規decision経路で選択し、旧GitHub rehearsal routeをそのまま移さない。

## 採択・候補・保留の区別

- `HARNESS-L2-030/-031` とその対L11は2026-09-28 decisionが正確なtarget revisionを採択。`HARNESS-L2-036` は2026-09-29 decisionの別行で採択。各採択の対象はdecisionに示すrevisionであり、source 000331のmutation条件を自動的に全量移管したという意味ではない。
- `HELIXOS-L2-008/-020` は2026-09-28 OS decisionの採択集合。これらの一般保証と今回のCIG-AC-specific oracleは、意味が隣接しても別条件として比較した。
- `HELIXOS-L2-117`、NCI-OS-003/-004/-005、HARNESS/OS NCI文書中のdraft candidateは未採択のlanding candidates。candidate textやMPR provisional metadataをcurrent adoptionへ読み替えていない。
- この照合でformal successor assignment、旧conditionのretire/meaning-change decision、source closureは作成していない。新しいL2/L11、register行、receipt、authority decisionも作成していない。

## 静的検証

Paired JSONには10件すべての選択行、直接読んだ隣接文脈、旧source file/line SHA、ledger record SHA、asset ID、current comparison、採択decisionまたはcandidateの参照と本文上の位置を記録した。基準本文・decision・source fileのbase hashはJSON `pins` を参照する。archive runtime/CLI/test/CIは実行していない。
