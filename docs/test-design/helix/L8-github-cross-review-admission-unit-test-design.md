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
| `U-GCRA-001` | `evaluateGitHubCrossReviewAdmission` | Draft defer、Ready current-HEAD canonical receipt＋repository-owned current logical DB receiptの49 field／HEAD／5 digest exact join | DraftをReady扱い、Readyを無条件green、空DB receipt、別の自己整合canonical DB receipt |
| `U-GCRA-001c` | 同上 | Kimi S4 admission verifier comment＋created/updated/admission時系列＋failure＋lease＋packet＋output/findings＋logical DB receiptのexact join | 実体のないverifier digest、admission後PATCH、任意DB digest、各provenance改変 |
| `U-GCRA-001d` | `canonicalLogicalDbReceiptValid` | canonical v2 exact field setと収束式、Ready時のrepository-owned再生成receiptとの完全一致 | field欠落、workspace dirty、population false、checkpoint/schema mismatch、excluded step、unstable column |
| `U-GCRA-002` | 同上 | canonical JSON marker | PLAN自己申告、旧prose marker、malformed JSON |
| `U-GCRA-003` | 同上 | receipt/required workflow/PR/CI/comment URLの同一HEAD・時系列join | stale receipt、別HEAD/別workflow/別PR CI、review後完了、別comment URL |
| `U-GCRA-004` | 同上 | OPENかつreview時刻≤comment時刻、receipt exactly one | future review、duplicate/conflict、MERGED後receipt |
| `U-GCRA-005` | `evaluateReviewedMergeReadAfter` | reviewed HEADがmerge parentであり、candidate treeとmerge commit treeが同一 | 別tree、別merge commit、reviewed HEAD非parent、read-after不能 |
| `U-GCRA-005a` | `persistReviewedMergeReadAfterReceipt` | verified／merged_unverifiedのfull canonical receiptをGit共通runtimeへ0600・immutable保存 | full body欠落、digest改変、failure receipt未保存、既存bytes conflict |
| `U-GCRA-005b` | `pr-merge-reviewed` adapter | candidate／merge commitをGitHubから別々にread-afterし、full receipt永続化とreason 0を成功条件へ接続 | 片側取得除去、evaluator／persistence未接続、path欠落またはreason有りを成功扱い |
| `U-GCRA-006` | `evaluateGitHubCrossReviewAdmission` | author=claude / reviewer=codexのreceiptを同じcanonical経路で受理し、receipt digestを返す | 片方向固定の独立性判定（author=codex かつ reviewer=claude のみ受理） |
| `U-GCRA-007` | 同上 | digestまで整合した同一runtime receiptをdecode段階でcanonicalへ昇格しない | self-reviewの受理、digest改変検知への吸収 |
| `U-GCRA-WF-001` | `harness-check.yml` | candidate HEAD checkout、comment全page、PR head SHA run、CLI fail-close | default merge ref、merge SHA query、単一page、別checkへ分離 |
| `U-GCRA-WF-002` | 同上 | command exitをrequired jobへ伝播 | `|| true`、step skip、draft固定値化 |

GitHub APIはunitでmock成功を合格根拠にせず、workflow source mutationと実PR dogfoodを対にする。最終system証拠は、
Draft full CI、comment receipt、Ready rerun、required `harness-check` success、merge timestamp、candidate／merge tree同一receiptの順序を同一PRで記録する。
