---
title: "HELIX L8 単体テスト設計 — GitHub cross-review admission"
layer: L8
artifact_type: test_design
kind: recovery
status: draft
created: 2026-08-09
updated: 2026-08-09
owner: QA / TL
plan: PLAN-RECOVERY-40-github-cross-review-admission
pair_artifact: docs/design/helix/L3-requirements/github-merge-admission-requirements.md
requirements:
  - GH-AC-014
  - GH-AC-015
  - GH-AC-016
---

# HELIX L8 単体テスト設計 — GitHub cross-review admission

| Oracle | 対象 | 正例 | 独立negative mutation |
|---|---|---|---|
| `U-GCRA-001` | `evaluateGitHubCrossReviewAdmission` | Draft defer、Ready current-HEAD canonical receipt | DraftをReady扱い、またはReadyを無条件green |
| `U-GCRA-002` | 同上 | canonical JSON marker | PLAN自己申告、旧prose marker、malformed JSON |
| `U-GCRA-003` | 同上 | receipt/CI/comment URLの同一HEAD join | stale receipt、別HEAD CI、別comment URL |
| `U-GCRA-004` | 同上 | OPENかつreview時刻≤comment時刻、receipt exactly one | future review、duplicate/conflict、MERGED後receipt |
| `U-GCRA-WF-001` | `harness-check.yml` | comment全page、PR head SHA run、CLI fail-close | merge SHA query、単一page、別checkへ分離 |
| `U-GCRA-WF-002` | 同上 | command exitをrequired jobへ伝播 | `|| true`、step skip、draft固定値化 |

GitHub APIはunitでmock成功を合格根拠にせず、workflow source mutationと実PR dogfoodを対にする。最終system証拠は、
Draft full CI、comment receipt、Ready rerun、required `harness-check` success、merge timestampの順序を同一PRで記録する。
