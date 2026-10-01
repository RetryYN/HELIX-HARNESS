# candidate4755 次の10 source条件の現行処置監査

## 対象と選択根拠

基準はmain `64a9fdd2757197f84172d7eda8b9ccb7f92db86a`。旧sourceの意味比較対象は、旧archiveのAAFD acceptance fileにある10物理行、source ID `000051, 000054, 000057, 000072–000077, 000079`。選択した行と隣接文脈の原文、archive path、物理行、source file/line SHA-256、source ledgerのJSONL行・record SHAはpaired JSONに固定した。

選択根拠はtracked `legacy-candidate-source-line-carry-forward.jsonl`とtracked `legacy-candidate4755-effective-classification-recount-after-2381-2026-09-30.json`。同recountは4755 source rowsへ#2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381の8 overlayを所定順で適用し、2369のsource scope correctionを含む864条件（product 827、management 36、concept 1）を得る。これは調査母集団の選択根拠であり、意味充足・採択・closureの証拠ではない。

source ID順に、過去のfirst10（`000018, 000021, 000028, 000034, 000037, 000331, 000468, 000470, 000472, 000474`）と先行CIG wave（`000478, 000491, 000492, 000496, 000497, 000499, 000500, 000501, 000502, 000527, 000528, 000529`）を除外した。AAFD-AC-003、他の既存negative oracle、historical receipt再利用拒否、model-upgrade条件（source IDs `000052, 000069, 000070, 000071, 000078, 000080`）は、AAFD lifecycle receiptの限定範囲と075/076 L2/L11本文に条件の行き先があるため今回の選択から除外した。これらは候補本文の行き先に過ぎず、採択・実証・closureを示さない。除外理由と本文位置はpaired JSONに記録した。

## 読み方とauthority

採択済みINTELLIGENCE-L2-009/-011/-012と、2026-09-28 decisionの対象revisionを照合した。L2/L11-073は2026-09-29 #57-candidates decisionの対象section digestとMPR-073-002で採択されている。ここでは採択pairの限られたsource scope内の保証と、隣接する一般保証を分けて比較した。

L2/L11-075はMPR-075-001の8 source atoms（R01–03）を持つ未採択candidate。-076は最新MPR-076-002の4 source atoms（R13–14）を持つ未採択candidate。AAFD lifecycle receiptはR05–12 processingをこの2候補のsource collection scopeから除外し、source holdingへ残す。candidate本文は要求条件の行き先として比較したが、採択済み保証・正式successor・実行・source closureとは扱っていない。MPR `authority_effect: none`も単独で採否を証明しない。

## 結果一覧

| source ID | 原文の条件 | 現行本文の意味対応 |
|---|---|---|
| `000051` | wrong HEAD/worktree/authority/session/owner/evidenceを各々異なる理由で拒否 | 未採択075 L11に6項目それぞれのincomplete/rejected結果があるが、各結果に個別理由を出す保証がない。**部分対応、具体的残差あり**。 |
| `000054` | internal→UIL、external→TERの分離とowner swap拒否 | L2-004のAffected/Unaffected/Unknown、L2-009の一般owner traceと隣接する。UIL/TER別の正しいrouteとswap拒否は確認できず、R05は075/076 receipt外。 |
| `000057` | unknown→0/unchanged/observed変換拒否とdeltaからのRequirement直書き拒否 | L2-012のunknown非安全化、L2-004のUnknown≠Unaffected、採択073のfree-text direct projection境界と部分的に近い。Future State Deltaの値変換・直書きnegative oracleは別scopeであり証明されない。 |
| `000072` | external release検出だけでHELIX defect確定を拒否 | L2-009はfinding traceを要求し、073は選択されたprojectionを制限するが、この推論自体のnegative oracleはない。 |
| `000073` | internal driftをTERだけ、external driftをUILだけで閉じるroute swap拒否 | L2-009が既存ownerを保持する一般境界はあるが、source→正しいownerの対照とswap拒否はない。 |
| `000074` | UIL/TERを飛ばしたFuture Synthesisへの自由文投入拒否 | 採択073は限定宛先へのfree-text projectionを拒否する。Future SynthesisおよびUIL/TER bypassは採択source scope外。 |
| `000075` | unknownを0/neutral/unchanged/observedへ変換することを拒否 | L2-012とHARNESS-L2-004に一般的unknown保持はあるが、列挙値とFuture State Delta文脈の個別negative oracleがない。 |
| `000076` | stale projection/directiveの再利用を拒否 | L2-009はstale assumption/invalid projectionをfinding種別に含む。再利用時の失敗結果やdirective停止条件ではない。 |
| `000077` | deltaからRequirement/Design/Release/Assignmentを直接変更することを拒否 | 採択073のfree-text projection先と重なるRequirement等があっても、Future State Deltaの権限境界・Design/Release/Assignmentへの拒否は別条件。 |
| `000079` | duplicate finding/deltaから別episodeを無限生成することを拒否 | L2-009のrepeated failure findingや075のProbe proposal重複照合は隣接するが、delta episodeの決定的dedupe保証ではない。 |

## sourceごとの条件比較

### `000051` — AAFD-AC-002、六つの個別理由

[旧acceptance source](../../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md) line 16は、wrong HEAD、worktree、authority、session、owner、evidenceの各mutationを「個別reason」で拒否する。隣接するline 15は必須fieldとproposal digest、line 17はverified昇格を拒否する別のACであり、選択atomへ混ぜていない。

L2-075 line 620は六つのidentity/evidence要素の一致を個別に確認し、不一致をfail-close/incompleteとする。L11-075 line 340は各項目の欠落・改変・異版を個別に与え、各該当条件をincomplete/rejectedにする。どちらも拒否reason自体が項目ごとに結果へ含まれるとは要求していない。したがってcandidateに意味上の行き先はあるが、旧failure oracle全体を保全していない。採択済みL2-009の一般traceも欠落reasonの出力を補わない。

必要な限定補完は、各field mutationが個別に拒否され、そのfieldに対応する理由が結果に残るという出力保証である。固定enum、schema、route、UIL実装は原文から導けないので追加しない。これは未採択075候補への忠実な差分候補であり、今回この監査自体では候補を編集・登録していない。

### `000054` — internal/UILとexternal/TERの取り違え

line 19はinternal/UIL対external/TERのsource分離とowner swap拒否を一つのoracle条件としている。前後line 18/20は別ACのdelta field completenessとunknown/direct-write条件であり、独立atomとして混同していない。

採択HARNESS-L2-004 line 117は影響relationをAffected/Unaffected/Unknownで分け、UnknownをUnaffectedにしない。採択INTELLIGENCE-L2-009 lines 96–100はfinding traceと既存AAFD/UIL/TER ownershipを保持する。ただしsource kindごとのUIL/TER正しい割当と、逆割当を個別拒否する受入例がない。AAFD BR-02はinternal/external distinctionとexisting routesの高水準候補で、owner-swap oracleではない。AAFD receiptはR05–12を075/076から除外し、source holdingへ残す。

### `000057` — unknown変換とdelta direct write

line 22はunknownを0/unchanged/observedへ改変する拒否と、deltaからRequirementへのdirect write拒否を指定する。隣接するline 21/23は別のACである。

採択INTELLIGENCE-L2-012 lines 114–118はunknownをsafe/success/no-issueへ変換しない。HARNESS-L2-004はUnknown≠Unaffectedとし、再検証だけが成立状態を変える。採択L2/L11-073はfree-textから限定宛先へ直接投影しないが、2026-09-29決定はAAFD-R-04の別source atomを対象にする。これらは不確実性・authorityの一般境界を部分保持する一方、Future State Deltaでの0/unchanged/observed変換、delta→Requirement直書きnegativeを個別に保証しない。R08はAAFD receipt scope外であり、closureはない。

### `000072` — external release observationの誤確定

line 39の否定条件は外部release検出だけからHELIX defectを確定することを禁じる。前後line 38/40は独立oracleである。

採択L2-009はfindingに根拠source、evidence、reproduction、falsification traceを要求するが、external release detectionだけを根拠にしたdefect確定の拒否例はない。採択L2/L11-073のprojection境界もこの分類判断を扱わない。AAFD BR-02候補にsource分類の一般説明があるが、条件specific受入ではない。確定結果のnegative oracleは未照合のままsource holdingに保持する。

### `000073` — UIL/TER owner swap

line 40はinternal driftをTERのみ、external driftをUILのみで閉じることを拒否する。隣接line 39/41は別negative oracleである。

採択L2-009は既存UIL/TER ownerを保持するが、internal drift→UIL、external drift→TERという両対応を正常対照として固定し、逆の2組を拒否するL11がない。AAFD BR-02候補のinternal/external source distinctionは要約であり、R05 source atomやowner-swap negative oracleのreceiptと採択decisionはない。

### `000074` — UIL/TER bypass

line 41はUIL/TERを通さず自由文をFuture Synthesisへ送ることを禁じる。隣接line 40/42は別条件。

採択L2/L11-073は未知finding自由文からIssue/Requirement/CI/mergeへの直接projectionを扱うが、採択decisionが対象とするのはAAFD-R04の限定条件である。Future Synthesisへの宛先とUIL/TER bypassはそこに含まれない。採択L2-009は所有者を維持するが、bypass時の拒否結果を規定しない。未採択075の「runtimeを実行しない」は工程境界であり、このsource requirementの将来受入oracleの代用にならない。

### `000075` — unknownの値変換

line 42は0、neutral、unchanged、observedの各変換を禁止する。前後line 41/43は別条件。

採択L2-012のunknown→safe/success/no-issue禁止、HARNESS-L2-004のUnknown≠Unaffectedは一般的不確実性を保持する。ただしlisted four conversionsをFuture State Delta上で拒否する条件固有oracleはない。R08はAAFD lifecycle receiptの075/076 source scope外。値やenumを補っていない。

### `000076` — stale projection/directive reuse

line 43はstale projectionまたはdirectiveの再利用を拒否する。隣接line 42/44は別条件。

採択L2-009にはstale assumption/invalid projectionというfinding categoryがある。findingとして検出することと、そのprojection/directiveを再使用しない結果保証は別である。HARNESS-L2-004は影響relationの再検証を求めるが、このFuture State Deltaのprojection/directive入力のstale再利用negativeを定義しない。AAFD BR-03は高水準候補で、R10の採択pairは確認できない。

### `000077` — deltaからの直接変更

line 44はdeltaがRequirement、Design、Release、Assignmentを直接変えることを拒否する。前後line 43/45は別条件。

採択L2/L11-073がRequirementを含むprojection先を制限することは隣接するが、source条件はFuture State Deltaから四種類の成果物を直接変更する権限についてであり、073のfree-text AAFD-R04 atomとは別。L2-009はAAFD/UIL/TER等を再実装せず所有者へ戻すが、四宛先へのdelta direct-write拒否を明示しない。R05–12はreceiptでsource holdingに残る。

### `000079` — duplicate finding/delta episode

line 46はduplicate finding/deltaによる無限の別episode生成を拒否する。隣接line 45/47はそれぞれhistorical receipt再利用とmodel-upgrade qualificationの別条件。

採択L2-009のrepeated failureは監査対象のfinding種別であり、同一deltaを再投入したときepisode identity/digestをdeduplicateする保証ではない。未採択L2/L11-075はProbe proposal duplicate/existing owner照合を扱うものの、source receiptはR01–03限定で、Future State Deltaの重複episodeを処理しない。新しいイベントidentity方式やdedupe実装を推測していない。

## 未採択候補と採択範囲の対照

- 2026-09-28 INTELLIGENCE decision rows 56/58/59はL2-009/-011/-012のexact revisionsを採択した。これらの一般trace、比較、uncertainty保証だけでsource固有のR05–12 oracleは閉じない。
- 2026-09-29 #57-candidates decision row 86はL2/L11-073のexact pair digestを採択した。対象sourceはAAFD-R04の限定free-text projection atom。R05–12を採択した記録ではない。
- MPR-075-001 line 639とlifecycle receiptは075の8 atoms/R01–03を示し、registered proposal/authority_effect none。MPR-076-002 line 641とreceiptは4 atoms/R13–14を示す。metadataは状態根拠として使わず、PO decisionと対象本文で照合した。
- AAFD source/condition receiptと2026-10-02 remainder auditはR05–12を詳細候補本文の外・source holdingとして記録している。今回確認したR05–12 acceptance条件の個別行き先を新たに割り当てず、ownerやUIL/TER/Future Synthesisの責務も推測しない。

## 判断と次の処置

10行中、採択済み本文に隣接する一般保証はあるが、source-specific exact acceptance pairを確認できた行はない。未採択候補へ意味上の行き先がある行は`000051`のみであり、その候補本文には「6 fieldごとの拒否結果」がある一方、「6理由をそれぞれ結果に残す」部分がない。これはsource条件に対する具体的な残差である。親へ報告し、既存075への限定追補を別worktree・別commitで起草する指示を受けた。この監査commit自体は候補本文、register、receipt、採択decision、source ledgerを変更しない。

残る9行は、採択済みの一般条件または広い候補要約との部分的な関係を記録したが、本文全体・decision scopeから完全なcondition-specific guaranteeを証明できていない。source holdingは残す。formal successor、closure、retire、意味変更、PO decisionは生成しない。

## 静的検証

paired JSONは10 source linesと隣接physical context、tracked ledger record SHA、source file SHA、主要本文・decision・receipt・registerのfull SHA、および採択/候補section digestを記録する。JSONのID一覧からtracked source ledgerのIDを照合できる。旧archive runtime/CLI/test/CIを実行していない。候補の採択・実動作・closureを主張しない。

## 起草基準後のread-after（#2503、2026-10-02）

上記10行の比較・pinはmain64a9時点の履歴である。最新main `360eec2d11dd2b838206b6096c7226aaefb8252c` では、#2503の`MPR-RC-HELIXINTELLIGENCE-L2-075-002`が000051の原文を追加し、6項目それぞれの失敗項目と欠落／不一致に対応する個別reasonをL2とL11へ保持している。選択9atomのr2 receiptをpaired JSONのcurrent_follow_upへ固定した。したがって000051の『個別reason出力が候補にない』という残差は起草時の記録であり、現時点の候補本文には保持されている。候補は未採択で、formal successor・runtime受入・全source closureは成立しない。残る9行の未証明条件を075追補から充足扱いしない。
