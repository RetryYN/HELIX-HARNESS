---
title: "worker risk admission L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
status: confirmed
created: 2026-08-04
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L5-94-worker-risk-admission.md
pair_artifact: docs/design/helix/L5-detail/worker-risk-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-08
responsibility_owner: worker-risk-admission
---

# worker risk admission L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WRA-001 | critical findingと用途別selection | criticalをscoreへ平均するとRed。該当candidateをretireし、用途別に別candidateを選ぶ | `tests/worker-isolation-broker.test.ts` |
| U-WRA-002 | exact request | unknown fieldを受理するとRed。strict schema failureを返す | `tests/worker-isolation-broker.test.ts` |
| U-WRA-003 | benchmark receipt provenance | copied receiptまたは同risk重複を受理するとRed。unsealed／duplicate failureを返す | `tests/worker-isolation-broker.test.ts` |
| U-WRA-004 | fixed effort根拠 | measured receiptに存在しないeffort固定を受理するとRed。justification failureを返す | `tests/worker-isolation-broker.test.ts` |
| U-DRB-022 | mutation | critical pre-filter、receipt seal、effort justificationを実source mutationし、対応oracleをRedにする | `tests/design-reality-binding.test.ts` |
