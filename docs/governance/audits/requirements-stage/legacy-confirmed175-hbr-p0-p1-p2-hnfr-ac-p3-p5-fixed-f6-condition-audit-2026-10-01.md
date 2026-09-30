# confirmed175 HBR-P0/P1/P2・HNFR-AC/P3/P5 固定f6条件照合監査（2026-10-01）

基準HEAD `5bfcd7db31f4cceb9871d20608f1eba9007f7405`。旧source file SHA-256 `7a73fa86acd8e5a7b755a9479f67c4d2af1579e533df101b1b3294eeceb0d8cc`、asset `LEGACY-ASSET-18F7940E7994634D39A1`。対象はsource-qualified identity 6件、固定対象revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。比較はread-onlyで、`authority_effect: none`、formal successor 0、closure false。個票のsource行・line digest・固定対象L2/L11の参照本文とdigest、監査基準HEAD/固定f6の別個のwhole-file pin、旧L3 consumer line pinは[JSON](legacy-confirmed175-hbr-p0-p1-p2-hnfr-ac-p3-p5-fixed-f6-condition-audit-2026-10-01.json)に記録した。旧CLI、workflow、hook、adapter、runtime、test、CIは実行していない。

## Source identityと固定対象

旧sourceは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md`で、asset ledger上`confirmed`／`preserved_pending_rehome`。母集団full auditおよび2026-09-30 queueのsource-qualified identityに、同一asset、原文行、file SHA-256、line SHA-256でjoinした。固定L2/L11対象は2026-09-28 PO判断のf6 revision。JSONではf6の4文書whole-file SHA-256と、監査基準HEAD `5bfcd7d` の参照本文・line SHAを別pinにした。参照行digestは監査基準HEADのline本文を固定し、後発の本文lineをf6自体のlineと主張しない。旧L3 consumerの対応IDと具体条件も別sourceとして照合し、候補採択や現行requirements一式への合意をsource atom単位の移管・実装・受入と解釈していない。

| Identity | 旧source行 | 固定target IDs | 条件照合 |
|---|---:|---|---|
| HBR-P0 | 50 | HARNESS-L2-002, HELIXOS-L2-010, HARNESS-L2-003 | partial condition trace |
| HBR-P1 | 51 | HELIXOS-L2-017, HELIXOS-L2-018, HELIXOS-L2-019, HELIXOS-L2-020, HELIXOS-L2-023, HARNESS-L2-003, HARNESS-L2-005 | partial condition trace |
| HBR-P2 | 52 | HELIXOS-L2-018, HARNESS-L2-005, HARNESS-L2-022 | partial condition trace |
| HNFR-AC | 67 | HELIXOS-L2-018, HARNESS-L2-010, HARNESS-L2-011 | partial condition trace |
| HNFR-P3 | 64 | HARNESS-L2-005 | partial condition trace |
| HNFR-P5 | 65 | HELIXOS-L2-019, HARNESS-L2-010, HARNESS-L2-011 | partial condition trace |


## 旧L3 consumerの条件と残差

旧consumer `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` のfile SHA-256は `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`。identity展開表42–54、条件本文138–153・178–185、HNFR-ACの直接条件188–190を行単位のtext/SHAでJSONへ保存した。旧sourceは「ID対応」と「本文の全条件被覆」を区別する（line 56）。

| Identity | 旧consumer条件 | 固定f6との残差 |
|---|---|---|
| HBR-P0 | HR-FR-P0-01/02: 各workflow出口のstyle return/gap隔離、Decide後のPoC/Discovery復帰、停止理由のdurable append→冪等DB projection | style/Discovery/PoC/workflowに意味接点はあるが、全出口と停止証拠順序を閉じない |
| HBR-P1 | HR-FR-P1-01〜04: resume三条件・queue/time cap/fresh session、version-up lifecycle、sliceごとの返却先/budget/acceptance/next_action、L2/prototype合意 | continuityの接点はあるがcontinuous-run/version-up lifecycleを成立させない |
| HBR-P2 | HR-FR-P2-01〜08: typed tool registry、effort budget、surface preflight、loop evidence、隔離外部worker、typed wire、bypass deny、output guard | Worker/verificationとの部分接点であり、旧8条件のruntime/tool surface contract一式を証明しない |
| HNFR-AC | HR-NFR-AC-01〜03: 全agentへrule-drift一般化、hosted surface preflight、runtime-neutral plan/traceとaction-binding | Worker/pack/call境界は接点だが、全agent共有memory・scanner・hosted preflight全体を閉じない |
| HNFR-P3 | HR-NFR-P3-01〜04: green evidence/review tier/external grounding、trace対応、layer regression fence、test-first | L2-005は検証義務の接点。外部根拠oracleやtest-first全条件は未閉鎖 |
| HNFR-P5 | HR-NFR-P5-01〜03: 3層context budget、可逆圧縮artifact、append-before-project checkpoint/restart、検証profile/time budget | continuity/packの接点はあるがbudget・checkpoint順序・workload条件一式は未閉鎖 |

## 後発の近接候補：HARNESS-L2-046

2026-09-29のPO decision 57 line 51は`HARNESS-L2-046`を採択と記録する。これは固定f6 revision `f6dad2a…` の後発状態として別に扱う。関連L2/L11本文、MPR line 559、2026-09-28 coverage receiptとその6-source-span scopeはJSONへpinした。receiptはPO decisionより前の候補coverage記録で、`authority_effect:none`。L2-046自身の採択はHBR-P0/P1からのsuccessor割当てを作らない。

境界付きの近接は、Full Vのsystem workflowをL1–L5で段階freeze・検証し、Production ScrumまたはScrumを含む許可scopeではslice delta後にsystem workflow/L1–L5へbackfillし、該当Scrum scopeではSR4前にrelease-readyとしない点である。Full VへScrum条件は適用しない。P0に対してはstyle-selected workflow条件の一部に近いが、各専門routeのstyle return/gap、runaway停止・durable event条件を置換しない。P1に対してはrelease/backfill boundaryに限った近接で、resume/queue/time-cap/version-up lifecycleを扱わない。正式successorなし。

## HBR-P0 — `helix/L1-requirements/pillar-requirements.md::HBR-P0`

旧source line 50 / SHA-256 `11650738b96e965057f81c6a28f2f6e5edcff00dcc57d700843873d3d9cf8ed8`。

**原条件atoms:** workflowで逸脱・障害・暴走を受け止める；L3凍結時に合意した開発方式へ収束する；Discovery/PoCは独立case-driven routeとしDecide後だけ接続する；signal単独で開発方式を変更しない；lock/budget time-cap/Recoveryで暴走を停止する。

**固定f6 targets:** HARNESS-L2-002, HELIXOS-L2-010, HARNESS-L2-003。

**正常条件:** L3で選んだ開発方式を保ち、workflow上の逸脱を選択済み方式へ戻す。Discovery/PoCとDecideの順序を守り、signal単独では方式を切り替えない。

**拒否条件:** L3合意なしの方式変更、signalによる自動切替、Decide前のDiscovery/PoC成果のproduction昇格、逸脱時に選択済み方式へ戻せないまま完了扱いすること。

**失敗条件:** 選択方式、ticket route、必要なDecide、freeze/停止状態が不明または矛盾するとき、適格性を推定せず停止・差戻し条件を未完として扱う。

**数値照合:** source identityに数値閾値はない。budget time-capは定性的制御名で、量・時間のoracleを規定しない。

**比較結果:** HARNESS-L2-002は4方式の選択/合成とL1–L3・要件承認・V字対・品質条件を保持し、Discovery/PoCとResearch/Decideを分離する。HARNESS-L2-003は開始・凍結・差戻し・再開・完了、L2.5結果のBackflow、L3 freeze前の合意と右側の対照合を扱う。HELIXOS-L2-010はticket/workflowの編成・受渡しと途中結果からの差戻しを扱う。旧sourceの3方式を4方式へ拡張・合成可能にしたのは現行L2/PO判断の明示差分。個票対象は各styleへの包括的復帰、lock/time-cap/Recoveryの具体oracleと実証跡一式を成立条件として閉じていない。

**記録上の扱い:** 旧identityはpreserved_pending_rehomeのまま。条件比較は旧要求の移管・successor割当てではなく、human decisionやL2合意を新たに生成しない。 formal successorなし、closureなし。

## HBR-P1 — `helix/L1-requirements/pillar-requirements.md::HBR-P1`

旧source line 51 / SHA-256 `3921d0439222afe55f9d61ab8f840ee09fc9cf6367fe6da630140885155a4808`。

**原条件atoms:** L2要求合意とL3凍結後に選択方式で作業・検証・復旧を継続する；resume条件/job-queue/cumulative budget/time-capを維持する；今版外作業をversion-upへ保全する；要求意味変更/L11受入/release/cutover等を自動承認しない。

**固定f6 targets:** HELIXOS-L2-017, HELIXOS-L2-018, HELIXOS-L2-019, HELIXOS-L2-020, HELIXOS-L2-023, HARNESS-L2-003, HARNESS-L2-005。

**正常条件:** ticket範囲と合意済み方式の中で作業・検証・復旧を継続し、再開時にrevision・未完義務・必要な証拠を保つ。意味変更、L11受入、release/cutoverの人間判断を自動生成しない。

**拒否条件:** 無期限の無人継続、heartbeat/job-queue/time-cap engineの存在を要求だけから推定すること、再開時に未完義務やrevisionを落とすこと、version-up対象を消すこと、要求や外部作用を自動承認すること。

**失敗条件:** assignment・head/revision・continuity evidence・budget/scope・未完義務のどれかがunknown/stale/conflictなら実行継続や完了を推定せず、停止または再照合に戻す。

**数値照合:** source identityに具体的な予算量・時間上限・heartbeat間隔・queue長の値はない。

**比較結果:** HARNESS-L2-003/005は工程条件、oracle/検証義務と証拠条件を扱う。HELIXOS-L2-017/018/019/020/023は適格ticket/workflow、Worker割当・実行統制、evidence/continuity、検収とhandoffを対象とし、revision・未完義務・検証状態を保持する条件に接点がある。これらは常時heartbeat/job queue、累積time-capを持つ無人再入engine、version_target lifecycleの完成を示さず、具体的な版外項目保全oracleも本比較の固定target群からは閉じない。現在の人間decision境界は権限状態として別に確認され、これらL2/L11がdecision済みを意味しない。

**記録上の扱い:** 旧identityはpreserved_pending_rehome。固定target採択やauthority boundaryへの参照からsource atomの移管・実装・受入は導かない。 formal successorなし、closureなし。

## HBR-P2 — `helix/L1-requirements/pillar-requirements.md::HBR-P2`

旧source line 52 / SHA-256 `a4bd9f6680e43e76415481ea8ea3b8055ef8a085cd8ca75e5535e177c8e2f2b3`。

**原条件atoms:** サブエージェント作業を解釈→検証→計画→実行→検証→返却のloop単位で扱う；orchestratorが統括する；workerとverifierを分離し自己評価を禁止する；effort/budgetを制御する；Claude/Codex CLI/IDE/hosted API各surfaceで同じ状態遷移・判定を行う。

**固定f6 targets:** HELIXOS-L2-018, HARNESS-L2-005, HARNESS-L2-022。

**正常条件:** 割当てWorkerと独立検証者の責務を分け、ticket内で計画・実行・検証・返却とbudget/scopeを追跡する。provider/surface差分を確認対象にする。

**拒否条件:** Worker自身の自己評価を独立reviewとして扱うこと、surfaceごとに異なる判定を同一扱いすること、固定effortや全surface parity harnessがあると要求だけから推定すること。

**失敗条件:** worker/verifier identity、scope、budget、tool route、証拠またはprovider surface preflightが不明/不一致なら結果を受入済みにせず、独立検証・適格性不足として返す。

**数値照合:** 具体effort値・budget上限・parity率はsource identityにない。loop順は列挙されるが時間/件数閾値はない。

**比較結果:** HELIXOS-L2-018はWorker割当・実行統制と責務分離の候補、HARNESS-L2-005は変更範囲からoracle/検証義務を導く条件、HARNESS-L2-022は検証と受入契約に接点がある。固定targetのL2/L11はWorker assignment/attempt/budgetと独立検証、検収を扱うが、全surfaceで同一状態遷移・同一判定を保証するparity harness、旧loop runner、固定effort/loop engineの完全移管・動作は証明しない。

**記録上の扱い:** 旧identityのsuccessor割当てなし。検証条件の比較は旧実装・PLAN記載の完了認定にならない。 formal successorなし、closureなし。

## HNFR-AC — `helix/L1-requirements/pillar-requirements.md::HNFR-AC`

旧source line 67 / SHA-256 `c2022a1d2125cd5e258be719dae26d434da32b548963bccdd9934456ea2a71af`。

**原条件atoms:** 全agentが単一規則セットに従う；P7二層の同一記憶を共有しagent別rule/memory siloを禁止する；rule-drift検査を全agentへ一般化する；Claude/Codex tool名・hook surface差分をadapter mapで吸収する；Codex hosted API surfaceにrepo hook非強制を踏まえた明示preflightを行う。

**固定f6 targets:** HELIXOS-L2-018, HARNESS-L2-010, HARNESS-L2-011。

**正常条件:** Workerのidentity/role/authorityとpack契約を明らかにし、共有する規則・記憶とprovider別適用面の差を検査可能にする。

**拒否条件:** 2 adapter間だけの検査を全agent適用と見なすこと、provider別memory silo/rule driftを許すこと、hosted/API surfaceにrepo hookが適用されると推定すること。

**失敗条件:** 規則revision、memory scope/access、adapter mapping、surface preflightが欠落・drift・unknownなら一貫性を成立扱いせず、その面の作業適格性を未完とする。

**数値照合:** source identityにcoverage率、drift閾値、memory budget数値はない。2 adapterは現状の範囲を示す数で、要求閾値ではない。

**比較結果:** HELIXOS-L2-018はWorker identity/role/authorityと実行制御、HARNESS-L2-010/011はpack境界と画面/作業環境から切り離した呼出し条件を示し、責務・情報境界に意味接点がある。現固定L2/L11は全agent/provider共通memory accessの機械強制、全surfaceのrule-drift scanner、Claude/Codex/hosted APIのadapter parityとhosted preflight一式を同一契約としては定義しない。

**記録上の扱い:** 旧identityはpreserved_pending_rehome。責務境界への再導出を全条件のsuccessor又は共有memory実装の証明にしない。 formal successorなし、closureなし。

## HNFR-P3 — `helix/L1-requirements/pillar-requirements.md::HNFR-P3`

旧source line 64 / SHA-256 `ad3e10a5bb4102be39302049b915319015aaee0669672eb81dda6ebac69e06ad`。

**原条件atoms:** pair_closureをfail-closeで強制する；片肺（片側のみ）を禁止する；自己評価を禁止する；合格主張にはtest/command green等の実証跡を必須にする；proseだけの主張やcodingをsubstanceと同一視しない；内部整合だけでなくexternal-truth grounding基準を持つ。

**固定f6 targets:** HARNESS-L2-005。

**正常条件:** L2/L11で定める検証oracle・必要証拠・独立reviewをそろえ、対の片側欠落やunknownを成功扱いせず、合格主張を実証跡へ結び付ける。

**拒否条件:** prose、coding完了、CI green単独、自己評価、pairの一方だけを完了証拠とすること、外部真実の照合がないのにexternal-grounding済みとすること。

**失敗条件:** 必要oracle、pair、独立review、command/test evidence又は外部照合のどれかが欠落・unknownなら合格を出さず、未完として返す。

**数値照合:** source identityは数値閾値を定めない。pair closureは構造条件、test/command greenは証拠条件。external-truth基準の測度・許容差は明示されていない。

**比較結果:** HARNESS-L2-005はrisk/layer/changeから検証義務・証拠条件を導く。固定f6 L2/L11にある必須oracle、独立review、unknown時停止と合格証拠の条件は、検証厳格性の強い接点である。一方、唯一のsource targetであるHARNESS-L2-005は、外部真実/held-out groundingの範囲・oracle・許容差・証拠を非機能基準として定義しておらず、pair-closure/片肺禁止/自己評価禁止の全体同値や実行証跡をこのidentity comparisonだけで閉じない。

**記録上の扱い:** 旧identityのformal successorはない。必須検証条件の参照はtest実行・結果・受入を意味しない。 formal successorなし、closureなし。

## HNFR-P5 — `helix/L1-requirements/pillar-requirements.md::HNFR-P5`

旧source line 65 / SHA-256 `40dc812647d71110d6f19f84aacd0e1e78cc7ebb5f829ac8429dd1b6cf621e97`。

**原条件atoms:** 動的注入と可逆圧縮で必要な分だけcontextを渡す；長時間無人自走を支える；閾値到達前にevent-firstでdurable appendする；DB projection成功後だけcontinuation checkpointを公開する；bounded memory breadcrumbからfresh session再開する；注入budgetを持つ。

**固定f6 targets:** HELIXOS-L2-019, HARNESS-L2-010, HARNESS-L2-011。

**正常条件:** 継続状態、source revision、未完義務、pack versionと復旧可能な証拠を保持し、再開時に必要な範囲へ絞って正本から再構成する。

**拒否条件:** memory breadcrumb/continuity要件を動的context injectionや可逆圧縮の実装済み証明とみなすこと、projection前のcheckpoint公開、budget/headroom oracleの存在を推定すること。

**失敗条件:** durable event、projection、checkpoint、pack/version、resume evidenceの順序または整合を確認できない場合は継続状態を有効と扱わず、再照合を要する。

**数値照合:** source identityには具体token budget/headroom、閾値、圧縮率や保持期間の値がない。

**比較結果:** HELIXOS-L2-019はevidence/continuity、HARNESS-L2-010/011はpack境界・呼出し条件に接点がある。固定target群は未完義務/source revision/resume state/pack version保持を扱うが、dynamic context injection、可逆圧縮、token budget/headroom、threshold前event-first append、DB projection後のみcheckpoint公開、全provider bounded recallを一体のoracleとして規定していない。

**記録上の扱い:** 旧identityはpreserved_pending_rehome。現在のcontinuity条件をもって旧memory圧縮や注入budget条件を置換したとはしない。 formal successorなし、closureなし。

## 結果と限界

6件すべてで固定f6のL2/L11条件と旧L3 consumer条件との意味接点・残差を個票化した。後発HARNESS-L2-046は別revisionの近接条件として記録し、successorと扱っていない。6件ともpartial condition traceであり、旧source atomsの形式的successor割当ては0件。固定targetの要求合意・候補採択・L11記述は、source atomの全条件移管、runtime実装、実行証跡、利用者受入を証明しない。未対応条件を未対応のまま保持する。
