---
title: "GitHub execution episode right-arm evidence束縛単体テスト設計"
layer: L8
artifact_type: test_design
status: draft
created: 2026-08-16
updated: 2026-08-16
owner: Codex / QA
parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md
pair_artifact: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md
plan: docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md
---

# GitHub execution episode right-arm evidence束縛単体テスト設計

| Oracle | Positive | Negative |
|---|---|---|
| U-GHEPRE-001 | current episode tupleのG8 recordをappend | episode不在を拒否 |
| U-GHEPRE-002 | exact tupleを受理 | 旧HEAD、別owner／contract／workflow identityを個別拒否 |
| U-GHEPRE-003 | exact retryをreplay | 同一IDのdigest改変を拒否 |
| U-GHEPRE-004 | G8〜G12とrelative artifactを受理 | G13、absolute path、parent traversalを拒否 |
| U-GHEPRE-005 | schema authorityとpair manifestが一致 | table／index／digest driftを拒否 |

主oracleは`tests/github-execution-episode-right-arm.test.ts`、schema oracleは
`tests/state-db-schema-authority.test.ts`、pair／freeze oracleは`tests/l3-g3-freeze-packet-v2.test.ts`とする。
