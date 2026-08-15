---
title: "GitHub typed workflow identity contract単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-16
updated: 2026-08-16
owner: QA / TL
plan: docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md
pair_artifact: docs/design/helix/L6-function-design/github-workflow-identity-contract.md
---

# GitHub typed workflow identity contract単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GWID-001 | strict ingest | current version／digest／axis／IDだけを受理する | `tests/github-workflow-identity-contract.test.ts` |
| U-GWID-002 | syntax／legacy | marker欠落・重複、壊れたJSON、`mode`等を別reasonで拒否する | `tests/github-workflow-identity-contract.test.ts` |
| U-GWID-003 | authority | stale version／digest、未知identityをfail-closeする | `tests/github-workflow-identity-contract.test.ts` |
| U-GWID-004 | signal | unknown、decision待ち、ambiguity、宣言identityとの矛盾を別reasonで拒否する | `tests/github-workflow-identity-contract.test.ts` |
| U-GWID-005 | Issue／PR | authority tupleまたはidentityが異なるpairを拒否する | `tests/github-workflow-identity-contract.test.ts` |
| U-GWID-006 | freeze伝播 | L6/L8 pairとdesign catalog digestがG3 packetへ一致する | `tests/l3-g3-freeze-packet-v2.test.ts` |

proseや旧route fieldの近似一致、legacy greenによるcanonical failure相殺をpositive oracleにしない。
