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
pair_artifact: docs/design/helix/L5-detail/github-cross-review-admission.md
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
requirements:
  - GH-AC-014
  - GH-AC-015
  - GH-AC-016
---

# HELIX L8 単体テスト設計 — GitHub cross-review admission

| Oracle | 対象 | 正例 | 独立negative mutation |
|---|---|---|---|
| `U-GCRA-001` | `evaluateGitHubCrossReviewAdmission` | Draft defer、Ready current-HEAD canonical receipt | DraftをReady扱い、またはReadyを無条件green |
| `U-GCRA-001c` | 同上 | Kimi S4 admission verifier comment＋created/updated/admission時系列＋failure＋lease＋packet＋output/findings＋logical DB receiptのexact join | 実体のないverifier digest、admission後PATCH、任意DB digest、各provenance改変 |
| `U-GCRA-001d` | `canonicalLogicalDbReceiptValid` | canonical v2 exact field setと収束式、Ready時のrepository-owned再生成receiptとの完全一致 | field欠落、workspace dirty、population false、checkpoint/schema mismatch、excluded step、unstable column |
| `U-GCRA-002` | 同上 | canonical JSON marker | PLAN自己申告、旧prose marker、malformed JSON |
| `U-GCRA-003` | 同上 | receipt/required workflow/PR/CI/comment URLの同一HEAD・時系列join | stale receipt、別HEAD/別workflow/別PR CI、review後完了、別comment URL |
| `U-GCRA-004` | 同上 | OPENかつreview時刻≤comment時刻、receipt exactly one | future review、duplicate/conflict、MERGED後receipt |
| `U-GCRA-005` | `evaluateReviewedMergeReadAfter` | reviewed HEADがmerge parentであり、candidate treeとmerge commit treeが同一 | 別tree、別merge commit、reviewed HEAD非parent、read-after不能 |
| `U-GCRA-WF-001` | `harness-check.yml` | candidate HEAD checkout、comment全page、PR head SHA run、CLI fail-close | default merge ref、merge SHA query、単一page、別checkへ分離 |
| `U-GCRA-WF-002` | 同上 | command exitをrequired jobへ伝播 | `|| true`、step skip、draft固定値化 |

GitHub APIはunitでmock成功を合格根拠にせず、workflow source mutationと実PR dogfoodを対にする。最終system証拠は、
Draft full CI、comment receipt、Ready rerun、required `harness-check` success、merge timestamp、candidate／merge tree同一receiptの順序を同一PRで記録する。
