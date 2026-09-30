# v1.3 §9.2 signal routing 484–492 条件監査

## 対象と基準

旧v1.3 §9.2のsource-qualified条件 `REQSRC-SUP-00484`〜`REQSRC-SUP-00492`、物理行625–633のみを、固定L2/L11との条件単位で比較した記録。対象sourceは `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`、source SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。source assetは `LEGACY-ASSET-02319C2481B9E01698D5`（`docs/governance/legacy-asset-disposition.jsonl:956`）で、旧sourceはread-onlyのsnapshotとして保全され、現行authorityへ自動昇格しない。

選定母集団と条件statusは最新main `105b9221f4de481ba59945be6df5cdd21f4358a3` 上の `v13-condition-closure-work-queue-2026-09-30.json` SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`に照合した。9行全て `condition / unresolved / primary_residual / unresolved_for_closure_work`、個別audit refs 0。#2411 §6の17件、#2413 §2の12件、#2415 merge後のdevelopment-style 11件（55,56,57,59,60,61,62,63,65,68,69）、#2417 merged/read-after Forward/Reverse 391–396、v1.3 §4.6.1 package-consumer residual 11件（ID 225,242–246,248–249,251,255–256；source行300,318–322,324–325,327,331,333）はsource-qualified identityで除外した。重複scanは同revision上のv1.3 focused individual audit JSONを対象とし、全sourceを列挙するwork queueと303条件のfull baseline auditはscan母集団から除外した（それらは個別にqueue eligibility/statusとsource mappingを照合）。focused audit間のsource-qualified overlapは0件（#2417 391–396も除外ID群として再照合）。

固定比較点は `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のOS/HARNESS L2/L11。各ファイル全体と引用行のSHA-256はJSONに格納した。現行入力は別pinとしてmain `105b9221f4de481ba59945be6df5cdd21f4358a3` のqueue、source snapshot、asset ledger、OS/HARNESS L2/L11、HYB-006 feedback-resolution receipt、PHCAP-08 stage-exit receiptをbyte hashで固定し、f6固定pairと混同しない。

| current-input | path | SHA-256 |
|---|---|---|
| queue | `docs/governance/audits/requirements-stage/v13-condition-closure-work-queue-2026-09-30.json` | `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9` |
| baseline_audit | `docs/governance/audits/requirements-stage/legacy-v13-semantic-condition-audit-2026-09-28.json` | `cd765545e584c50b423d652674ac54a3240aced24a321c0caa6bc2dd881ad863` |
| asset_disposition | `docs/governance/legacy-asset-disposition.jsonl` | `cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c` |
| source_snapshot | `docs/governance/requirements-source/helix-requirements_v1.3.md` | `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` |
| current_os_l2 | `docs/helix-os/L2-requirements/governance-requirements.md` | `bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf` |
| current_os_l11 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | `cd0e750cab9e694eed060a619d50527239e1b1291b9550cc0c95dbbd486c7112` |
| current_harness_l2 | `docs/helix-harness/L2-requirements/product-requirements.md` | `78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6` |
| current_harness_l11 | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e` |
| feedback_resolution_receipt | `docs/governance/audits/requirement-registration/os-v13-hyb-006-feedback-resolution-coverage-receipt-2026-09-28.json` | `cb22a82d4881a62b2066e881449e2a6b65cae23613b0ba6715da6c6b7af34af9` |
| stage_exit_receipt | `docs/governance/audits/requirement-registration/phcap08-stage-exit-coverage-receipt-2026-09-29.json` | `2c0111eaf28b5d653f2a99efd6ede1f5f380c29f4bec17e554cb7a195cb3e3a4` |

旧consumer調査では `archive/.../root/docs/process/modes/README.md`（process axis、signalとidentityの分離）、`recovery.md`（開発/本番境界）、`incident.md`（承認・temporary containmentと恒久Reverse）、`add-feature.md`（選択style内のForward合流）、`version-up.md`（保全とDecide後activation）、`discovery.md`（case-driven uncertainty）、`research.md`（調査と実験の分離）を読んだ。各file SHA-256はJSONの `old_source_and_consumers.consumers` に記録。いずれもread-onlyで実行していない。

## 条件別比較

旧sourceの数値境界と、固定L2/L11で比較した意味の範囲を並べる。`partial`は関連するroute/type/axisがある一方で、旧literalとcondition単位のroute oracleが残ることを示す。

| Source ID | 行 / source-line SHA-256 | 旧trigger数・例外境界 | 固定L2/L11の限定比較点 | 状態 |
|---|---|---|---|---|
| REQSRC-SUP-00484 | 625 / `990098b215599ad7e20ba8a2ab69131971a7ed611598f4e2d5736c6a802e8f90` | 5 literal signals: agent_runaway, context_exhaustion, regression_dev, runaway, forced_stop。`runaway`だけを`agent_runaway`へ正規化する。本番regression/incidentはRecoveryではない。 | `HELIXOS-L2-010:63,140; HELIXOS-L11:HXT-TYPE-10:287` | partial |
| REQSRC-SUP-00485 | 626 / `b017ea55141dee97aaa5643406d6eb425848183f2d85226bfe2c977dd61e501e` | 3 literal signals: production_incident, hotfix_required, regression_prod。production境界と既存approval条件は要るが、signal自体はapprovalを生成しない。 | `HELIXOS-L2-010:63,141; HELIXOS-L11:HXT-TYPE-11:288; HELIXOS-L11:HXT-FLOW-02:300` | partial |
| REQSRC-SUP-00486 | 627 / `eb025a46616a12019fcfbb398ff08a647e463ca9a6dd31707a74768096177b82` | 2 trigger literals: feature_addition, scope_extension。外部約束/要求/受入意味変更ならRedesign/Decideの境界を評価する。 | `HELIXOS-L2-010:63,148; HELIXOS-L11:HXT-TYPE-18:295; HARNESS-L2-002:53,100; HARNESS-L11:22` | partial |
| REQSRC-SUP-00487 | 628 / `7774bf130d9809eada8810aaa866bd18a146a5b55c2b67b3e23d6a143c00708d` | 4 alias spellings: pair_agent_tdd, pair-agent-tdd, pair-agent TDD route, pair programming。これらは別style enumを増やさない。 | `HARNESS-L2-002:53,98,100; HARNESS-L11:22; HELIXOS-L2-010:63,148; HELIXOS-L11:HXT-TYPE-18:295` | partial |
| REQSRC-SUP-00488 | 629 / `91621ceb8843f54dfa067fd0f9bac71c4931d8fadb1b2120b357e59d552b8a51` | 1 trigger: version_deferral。future itemはactivation/Decide前にproduction Add-featureへ流さない。 | `HELIXOS-L2-010:63,149; HELIXOS-L11:HXT-TYPE-19:296; HELIXOS-L11:HXT-FLOW-03:301` | partial |
| REQSRC-SUP-00489 | 630 / `5452dc18f4bc0560b72805b11ebc88826760c5ab186e23b4f442893d6220a8c0` | 2 feedback aliases; 3 candidate routes (Redesign / Add-feature / Scrum slice)。Signal alone must not switch style. | `HELIXOS-L2-010:63,139,148; HELIXOS-L2-005:58; HELIXOS-L2-007:60,295; HELIXOS-L11:25,286,295,304; HARNESS-L2-002:53,100; HARNESS-L11:22` | partial |
| REQSRC-SUP-00490 | 631 / `e5b876e6ac11cd2b154a045abc510953efd3ea0f929696a5031d49a6f542f7a8` | 4 trigger aliases: requirement_undefined, feasibility_unknown, success_condition_unclear, design_uncertain. Discovery vs PoC are separate current targets; no-screen excludes Prototype, not PoC. Scrum does not subsume either case-driven model. | `HELIXOS-L2-010:63,134-136; HELIXOS-L11:HXT-TYPE-04-06:281-283; HARNESS-L2-002/003:98,103; HARNESS-L11:22-23` | partial |
| REQSRC-SUP-00491 | 632 / `4a5333021d15e86fc6dc3223c90ffcca909d88e94b356316c40060bdd33dd106` | 3 trigger aliases: tech_decision_required, option_comparison_needed, adr_required. 1 exception: if feasibility experiment is required, route to Discovery/PoC instead; Research itself does not select. | `HELIXOS-L2-010:63,134-138,147; HELIXOS-L11:HXT-TYPE-04/05/07/08/17:281-285,294; HARNESS-L2-002/003:98,104; HARNESS-L11:22-23` | partial |
| REQSRC-SUP-00492 | 633 / `7f719d22292a2070b27a25d26f9aea692cea62e4b9d54f234643f28b55d2a763` | 1 interrupt parent signal with 4 outcome routes: runaway→Recovery, uncertainty→Discovery/PoC, addition→Add-feature, layer gap→Forward. Unknown subtype has no asserted default route. | `HELIXOS-L2-010:63,127-149; HELIXOS-L11:HXT-TYPE-04/05/10/18:281-282,287,295; HELIXOS-L11:HXT-FLOW-07:305; HARNESS-L2-003:54; HARNESS-L11:23` | partial |

### 保持点、差分、反例、残差

- **00484 Recovery** — `agent_runaway`、`context_exhaustion`、`regression_dev`、`runaway`、`forced_stop`の5 literalをRecoveryへ向け、`runaway`のみ`agent_runaway`へ正規化する。OS L2-010/RecoveryとHXT-TYPE-10は中断工程への再合流という意味を保持するが、alias/provenanceの受入oracleはない。反例は `regression_prod` をRecoveryへ送ること。残差はsignal→Recoveryの完全一致、alias警告、開発/本番境界を同一target revisionで結ぶreceipt。
- **00485 Incident** — `production_incident`、`hotfix_required`、`regression_prod`の3 literal。production境界と既存approvalが必要で、triggerだけでは承認を生成しない。OS Incident/HXT-TYPE-11/FLOW-02はL12評価とReverse収束を保持。反例はtriggerを本番承認とみなすこと。残差はenv、approval snapshot、temporary containmentと恒久Reverseの分離receipt。
- **00486 Add-feature** — `feature_addition`、`scope_extension`の2 literal。選択中styleのForwardへ戻る。現行はAdd-feature workflowとPLAN kind、style axisを区別し、要求/受入意味変更ならRedesign/Decide境界を評価する。反例はsignalだけでstyleをProduction Scrumへ切り替えること。残差はimpact分類からForward target layerまでのoracle。
- **00487 pair-agent TDD** — `pair_agent_tdd`、`pair-agent-tdd`、`pair-agent TDD route`、`pair programming`の4表記。pair cellは実行形態でdevelopment styleではない。HARNESS fixed pairはstyleとticket axisを分け、OS Add-featureは差分をForwardへ戻す。旧aliasが現行canonical identityと同じとは推定しない。反例はpair programmingを新styleにすること。残差はalias compatibility、pair cell対象/owner、Add-feature ticketへの接続。
- **00488 version-up** — `version_deferral`の1 trigger。future activation/Decide前にAdd-featureへ送らず、parked itemを保全する。固定L2/L11は保全→Decide→Add-featureの意味を保持するが、特定release値は決めない。反例はparked itemの削除、またはDecide前のcurrent release投入。残差はfuture target、activation trigger/decision、再確認記録とForward layerのreceipt。
- **00489 feedback** — `user_feedback_iteration`、`requirement_continuous_refinement`の2 aliasから、Redesign / Add-feature / Scrum sliceの3候補routeを選ぶsource条件。signalだけでstyleは変更しない。固定f6 pairではL3のstyle合意を保持し、採択済みHELIXOS-L2-007がfeedbackのintake/classify/ack/pending/resolution区別とsource/evidence保持を担う。別decisionで採択されたHELIXOS-L2-044（MPR `MPR-RC-HELIXOS-L2-044-001`）はprose-only handoverをresolution evidenceとして認めない限定negativeであり、lifecycle採択やevent/projection/SessionStart追加ではない。HYB-006 receiptのcandidate inputは2 revisionにあるprose-only span 2件だけ。両revisionのlifecycle/event-projection/SessionStart、未ack消失、source-HEAD mismatchの計6 atomはpreserved_pendingで、元のsource lineとHR-FR/HR-AC条件はpartialのまま。00489の2 aliasから3 routeを選ぶ規則は、この隣接negativeで解消されない。反例はfeedback aliasだけでstyleまたはrouteを自動決定する、もしくはprose-only handoverでfindingをresolvedにすること。残差はlegacy alias-to-route compatibility、impact/requirements-authorityによる3 routeの選択oracle、accepted style・target revisionへのreceipt。既存L2-007のlifecycle/evidence責務は残差ではない。
- **00490 Discovery／PoC** — `requirement_undefined`、`feasibility_unknown`、`success_condition_unclear`、`design_uncertain`の4 alias。case-drivenでScrum内包ではない。画面有無でPrototypeとPoCを別判定し、screenlessはPoCを除外しない。反例は画面なしPoCを省く、Prototypeを強制する、またはScrum phaseへ混ぜること。残差はDiscovery対PoCの選択、trigger lifecycle、source/return ticket、要求revisionへのdecision gate。
- **00491 Research** — `tech_decision_required`、`option_comparison_needed`、`adr_required`の3 alias。Researchは参照を集めるが選定しない。実現性実験が必要ならDiscovery／PoCへ切り替える1例外。反例はResearch結果を選定済み技術と扱うこと、または実験必要時もdesk researchに留めること。残差はdecision criteria/requester、実験必要性のoracle、Research→Discovery/PoC→Decide/Forwardのreceipt。
- **00492 interrupt** — parent signal 1つ、subtypeに応じ4 route（暴走→Recovery、未確定→Discovery/PoC、追加→Add-feature、層内gap→Forward）。unknown subtypeの既定routeは主張されない。現行ticket typeはpurpose/initiation/convergenceを分離するが、旧 `interrupt` をcanonical typeとするresolverはない。反例は全interruptをRecoveryに送る、またはunknownをFull V fallbackで成功扱いすること。残差はtyped subtype、ambiguity処理、選択targetとstyle/layer/requirements revisionを結ぶreceipt。

全9件はJSONで `partial`。f6固定L2/L11のtype/route/axisは限定的な意味保持として評価し、旧aliasの互換性・全条件acceptanceへ外挿していない。

## 後発decision recordの限定参照

後発recordはsource行のsuccessorとして扱わず、独立にpinした。

- **57 candidates**: record SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、source repository revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`。採択された要求identityは`HELIXOS-L2-044`、MPR registrationは別identity `MPR-RC-HELIXOS-L2-044-001`。限定scopeはprose-only handoverをresolution evidenceとして認めないこと。既存`HELIXOS-L2-007`がlifecycle/evidence責務を持ち、L2-044はintake/classify/ack/pendingを採択せず、新しい証拠十分条件、event/projection、SessionStartも追加しない。HYB-006 receipt SHA-256 `sha256:cb22a82d4881a62b2066e881449e2a6b65cae23613b0ba6715da6c6b7af34af9`では、2つのrevisionのprose-only span 2件だけをcandidate inputとし、他6 atomはpreserved_pending、元の条件はpartial。00489のalias・3 routeに直接対応しない。
- **11 candidates**: record SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`、source repository revision `5aa100319361b0cc86edd3c51815ec777d55410a`、decision basis revision `909c8015326f35f8d42ce12e3c388923de411d1f`。採択identityは`HARNESS-L2-051`、MPR registrationは別に`MPR-RC-HARNESS-L2-051-001`。対象は同一revisionでstage、scope、goal、pair/layer、owner、required output、oracle、evidence、未完条件を結ぶ静的stage-exit contract。PHCAP-08 receiptは25 source atomsをholdingへ保全し、direct carry 0、unaccounted 0でclosureなし。これは484–492のsignal routingに関係する判断ではない。

この2 recordは別々のdecision history pinで、v1.3のsource successorやsource closureを生成しない。

## 結果と検証境界

- 集計: covered 0 / partial 9 / missing 0。formal successor assignment 0、source closure false、authority effect none、acceptance execution / stage completionは主張しない。
- JSON: [`v13-signal-routing-484-492-condition-audit-2026-10-01.json`](v13-signal-routing-484-492-condition-audit-2026-10-01.json)。`created_against_revision` と current-input pinsは `105b9221f4de481ba59945be6df5cdd21f4358a3`、旧source・f6固定pair・57/11 decision pinsは各個別revision/hashのまま。
- 静的検証: JSON parse、queue identity/state、archive source line/hash、f6 L2/L11 file/line hash、current main byte hash、queue/baseline除外を明示したfocused-audit identity overlap 0を確認。旧CLI/runtime/test/CIは実行していない。
