---
title: "専門agent registry L7 unit test設計"
layer: L8
sub_doc: unit-test-design
executed_at_layer: L7
artifact_type: test_design
status: draft
created: 2026-07-28
updated: 2026-07-28
owner: QA
plan: docs/plans/PLAN-L6-85-specialist-agent-registry.md
pair_artifact: docs/design/helix/L6-function-design/specialist-agent-registry.md
---

# 専門agent registry L7 unit test設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SAREG-001 | repository registryの受入 | schema、definition、allowlistが一致する場合だけgreen | `tests/specialist-agent-registry.test.ts` |
| U-SAREG-002 | definition digestのdrift | 実digestを変更するとadmission denied | `tests/specialist-agent-registry.test.ts` |
| U-SAREG-003 | 決定的なcross-provider team | be workerと異provider verifierのexact set | `tests/specialist-agent-registry.test.ts` |
| U-SAREG-004 | independent verifier欠落 | 同providerだけならfail-close | `tests/specialist-agent-registry.test.ts` |
| U-SAREG-005 | model class SSoT drift | provider familyの`MODEL_IDS`にないclassならfail-close | `tests/specialist-agent-registry.test.ts` |
| U-SAREG-006 | definition path境界 | 絶対path、親directory遷移、非POSIX pathを読込前にfail-close | `tests/specialist-agent-registry.test.ts` |
