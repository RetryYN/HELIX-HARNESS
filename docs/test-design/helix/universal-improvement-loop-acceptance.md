---
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "Universal Improvement Loop受入テスト設計"
layer: L10
status: draft
created: 2026-08-29
updated: 2026-08-29
owner: QA / TL
parent_design: docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md
pair_artifact: docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md
plan: PLAN-L3-74-universal-improvement-loop
---

# Universal Improvement Loop受入テスト設計

| AC ID | 対応 | 合格条件 | Negative Oracle |
|---|---|---|---|
| UIL-AC-001 | UIL-R-01 | source registryがID、owner、schema、detector、authority、freshnessを保持する | unknown source、任意log、AI感想を拒否 |
| UIL-AC-002 | UIL-R-02 | 同一event集合とregistryから同一normalized exact set／digestを返す | event順序、retryで結果を変えない |
| UIL-AC-003 | UIL-R-02 | baseline、observed、missing、forecastを別fieldにする | 予測値を観測値へ昇格しない |
| UIL-AC-004 | UIL-R-03 | invariant／threshold／release boundary／safety-netを別triggerとして記録する | cronだけでauthority変更しない |
| UIL-AC-005 | UIL-R-03 | 同一原因・scope・baselineの候補をdedupeしexpiryを持つ | rejected候補を無限再生成しない |
| UIL-AC-006 | UIL-R-04 | candidate必須fieldのexact setを検証する | 必須field欠落、wrong revision、stale evidenceを個別拒否 |
| UIL-AC-007 | UIL-R-05 | value、behavior、AC、responsibility、ownership、public boundary mutationを意味変更として検出する | 意味変更をREFACTORINGへ送らない |
| UIL-AC-008 | UIL-R-05 | affected Requirement／Design／Contract／Module／V-pairをstable IDで算出する | 名称一致や単一logで影響確定しない |
| UIL-AC-009 | UIL-R-06 | baseline、予測、反例、副作用、rollbackを比較する | 予測を実測完了証拠にしない |
| UIL-AC-010 | UIL-R-06 | 局所metric改善と全体metric悪化を同時評価する | test時間短縮だけでadoptedにしない |
| UIL-AC-011 | UIL-R-07 | change class、capability expansion、routeを別fieldにする | 同一enumへ畳み込まない |
| UIL-AC-012 | UIL-R-07 | finding classから既存routeとverification obligationを決定的に導出する | ambiguous findingを推測配車しない |
| UIL-AC-013 | UIL-R-08 | candidate生成だけではauthorityが変わらない | Requirement、merge、publishを直接実行しない |
| UIL-AC-014 | UIL-R-08 | route先のPLAN、V-pair、approval、review、CIを再利用する | 独自completion gateを作らない |
| UIL-AC-015 | UIL-R-09 | 同一scope／revision／artifactでbefore-afterとside effectを測る | 件数減少、局所green、自己評価で効果確定しない |
| UIL-AC-016 | UIL-R-10 | 5 terminal outcomeを別々に保持する | mergedをadoptedへ丸めない |
| UIL-AC-017 | UIL-R-11 | 複数episode、counterexample、mutation、version、expiry後だけrecipe候補になる | 単一project成功をgeneral ruleにしない |
| UIL-AC-018 | UIL-R-12 | recurrence windowで再発と効果消失を因果接続する | 過去greenで再発を相殺しない |
| UIL-AC-019 | UIL-R-13 | DB削除後もrepo authority＋event journalから同一projectionを再構築する | DB rowを意味正本にしない |
| UIL-AC-020 | UIL-R-13 | state machine順序、HEAD、baseline、scopeをexact照合する | 段階飛越、別候補証拠混載を拒否 |
| UIL-AC-021 | UIL-R-14 | AIなしのdetectorだけでcandidate→route→verificationを生成する | AI proposal除去でcontrol loopを壊さない |
| UIL-AC-022 | UIL-R-14 | AI利用時にruntime／model／session／context／HEAD／scopeをreceiptへ束縛する | AI出力をdetector evidenceとして偽装しない |

22件すべてを独立oracleとして保持し、単一happy-pathでfailure classを相殺しない。
