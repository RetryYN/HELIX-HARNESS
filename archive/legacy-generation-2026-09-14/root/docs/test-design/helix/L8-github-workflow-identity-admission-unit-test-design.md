---
title: "GitHub typed workflow identity admission単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-16
updated: 2026-08-26
owner: QA / TL
plan: docs/plans/PLAN-L7-574-github-workflow-identity-admission.md
pair_artifact: docs/design/helix/L6-function-design/github-workflow-identity-admission.md
---

# GitHub typed workflow identity admission単体テスト設計

| U-ID          | 対象                      | 反例と期待結果                                                                                            | test citation                                      |
| ------------- | ------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| U-GWIDADM-001 | exact authority           | PLAN指定IssueとIssue／PR／PLAN tupleの一致だけを受理                                                      | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-002 | legacy boundary           | typed PLANなしでは非適用、GitHub API未実行                                                                | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-003 | atomicity                 | 複数typed PLANを拒否                                                                                      | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-004 | contract failure          | PR marker欠落とIssue legacy fieldをsource-specific reasonで拒否                                           | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-005 | PLAN consistency          | Issue／PR一致でもPLAN identity不一致を拒否                                                                | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-006 | I/O failure               | PLAN／GitHub API／registry failureを別reasonでfail-closeし、invalid Issue responseとも分離                | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-007 | CI wiring                 | required workflowがPR bodyとmerge-base changed pathsをCLIへ渡す                                           | `tests/harness-check-workflow.test.ts`             |
| U-GWIDADM-008 | freeze伝播                | L6/L8 pairとdesign catalog digestがG3 packetへ一致                                                        | `tests/l3-g3-freeze-packet-v2.test.ts`             |
| U-GWIDADM-009 | Issue resource            | PR resourceまたは別番号responseをIssue authorityとして拒否                                                | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-010 | PLAN strict schema        | 誤schema versionと余剰legacy fieldを拒否                                                                  | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-011 | migration bundle positive | requirements registryとcatalogを同時変更し、exact owner／manifest／identityを満たすbundleだけを受理       | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-012 | bundle boundary           | manifest／owner／authority pathの欠落・不一致を専用reasonで拒否                                           | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-013 | bundle convergence        | 旧digest混在と新catalogにないidentityを拒否                                                               | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-014 | strict negative set       | non-typed PLAN、marker重複、unsorted manifest、非VERSION_UP owner、stale version、authority片側欠落を拒否 | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-015 | cross-contract migration | strict bundleに列挙された非owner PLANは自身のbehavior contract／responsibility ownerを保持して受理 | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-016 | foreign PLAN boundary    | migration marker外のforeign PLANは通常のcontract mismatchとして拒否                         | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-017 | migration owner boundary | owner PLANのbehavior contract／responsibility owner不一致を拒否                             | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-018 | foreign contract boundary | bundle内foreign PLANのbehavior contract／responsibility owner欠落を拒否                    | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-019 | terminal fullback positive | Forward／Reverseの異なるtyped identityを保持した同一Issueのterminal bundleを受理              | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-020 | terminal fullback negative | marker重複、migration marker併記、unsorted manifest、owner、digest、identity、Issue不一致、changed PLANのmanifest未列挙、manifest内の未typed PLANを拒否 | `tests/github-workflow-identity-admission.test.ts` |
| U-GWIDADM-021 | source-aware failure      | generic parserの全failure reasonをIssue／PR surface別へ写像し、Issue／PR tuple mismatchはcomparison reasonを維持 | `tests/github-workflow-identity-admission.test.ts` |

prose、label、legacy identityの近似一致をpositive oracleにしない。
