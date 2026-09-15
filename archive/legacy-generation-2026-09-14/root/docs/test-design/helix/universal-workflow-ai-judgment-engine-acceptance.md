---
title: "Universal Workflow AI判断エンジン受入テスト設計"
layer: L3
executed_at_layer: L12
artifact_type: test_design
status: confirmed
created: 2026-07-19
updated: 2026-07-19
owner: QA
pair_artifact: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
---

# Universal Workflow AI判断エンジン受入テスト設計

| AC | 合格条件 |
|---|---|
| UWJ-AC-001 | source filename/version/SHA-256/14-file inventoryの任意改変でbindingを拒否する |
| UWJ-AC-002 | 正常、分岐、loop、exceptionを含む業務文から全workflow atomが欠落なく生成される |
| UWJ-AC-003 | 15 conditional signalは該当時だけ追加質問を発火し、非該当質問を要求として捏造しない |
| UWJ-AC-004 | ambiguity、矛盾、authority欠落がsource付きunresolvedとなりfreezeをblockする |
| UWJ-AC-005 | transitionごとにFR/AC/testが1件以上あり、forward/reverse traceが同一source transitionへ戻る |
| UWJ-AC-006 | loop/terminal必須fieldを一つずつ欠落させたfixtureを全て拒否する |
| UWJ-AC-007 | condition dataのtype/validation/SSoT/sensitivity/retention欠落を拒否する |
| UWJ-AC-008 | 8派生系統がworkflow由来edgeを持ち、画面/API/DB先行確定を拒否する |
| UWJ-AC-009 | facts/candidate/policy/confidence/counterevidence/unresolved/oracleの各欠落でproposalを不完全にする |
| UWJ-AC-010 | AI自己承認、権限昇格、high-impact action、direct DB/Git writeを全て拒否する |
| UWJ-AC-011 | switch必須fieldとfallback/reassessment欠落を個別に拒否する |
| UWJ-AC-012 | route capability/capacity/fallback/dead-letter欠落を個別に拒否する |
| UWJ-AC-013 | allocation capacity/concurrency/budget/fairness/reallocation/degradation/fallback欠落を個別に拒否する |
| UWJ-AC-014 | test greenでも判断品質、latency、cost、queue、failure、誤判断、override、drift metricがmissing/stale/failならcompletionを拒否する |
| UWJ-AC-015 | Full Vの部分workflowと、Scrum sliceのSR backfill欠落をどちらもrelease-readyにしない |
| UWJ-AC-016 | 全workflow obligationがL1〜L12と正規6 pairへexactly-one配置され、片edge/別snapshotを拒否する |
| UWJ-AC-017 | 5出力envelopeのfield欠落、未知version、source digest不一致をschema failする |
| UWJ-AC-018 | runtime exampleを旧workflow schema単体へ投入すると失敗するnegative fixtureを保持し、専用schema/composition適合後だけactivationを許可する |

## 実行層

- L8: schema、正規化、局所判断、loop、fallback。
- L9: adapter、API、DB、queue、resource、authority境界。
- L10: 一気通貫workflow、FR/NFR、誤route、縮退。
- L11: actor受入、説明可能性、human override。
- L12: SLO、cost、queue、drift、誤判断、改善効果の時間軸。
