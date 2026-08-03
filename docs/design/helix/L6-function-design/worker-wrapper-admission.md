---
title: "worker wrapper admission関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L6-95-worker-wrapper-admission.md
pair_artifact: docs/test-design/helix/L8-worker-wrapper-admission-runtime-unit-test-design.md
related_l5: docs/design/helix/L5-detail/worker-wrapper-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
---

# worker wrapper admission関数設計

`buildWrapperAdapterPlan`は既存`buildAdapterPlan`を再利用し、module-private originへ生成時digestを保存する。
`evaluateWrapperAdmissionWitness`は4 failureを固定順で評価するpure function、`admitWrapperLaunch`は同一object identity、
provider、plan digest、invocation digestを再検証して成功時だけcapabilityとexecutionを返す。

CLI、team、pair-agent、loopは実行planを`buildWrapperAdapterPlan`で生成する。実process sinkはadmission failure時に
spawn数0で終了する。provider output、DB、sandbox、receipt、benchmark scoreは本moduleで扱わない。

production fileを増やさず、既存adapter ownerへ約120 LOCのpolicyを統合する。永続state、新service、workflowは0である。
