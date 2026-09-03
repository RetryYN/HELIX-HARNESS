---
title: "Document Authority Census受入候補"
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
owner_issue: 1381
plan_id: PLAN-L3-85-document-authority-census
---

# Document Authority Census受入候補

| ID | 対象 | 反例／操作 | 期待結果 |
|---|---|---|---|
| `DAC-AC-001` | `DAC-R-001` | untracked fileまたはdirty working treeだけにある文書を追加する | exact HEAD inventoryへ混入しない |
| `DAC-AC-002` | `DAC-R-001` | tracked blobの内容を変える | artifact digestとinventory revisionが変わる |
| `DAC-AC-003` | `DAC-R-002` | path規則とcatalogが異なるclassを主張する | ambiguousとしてfail-closeする |
| `DAC-AC-004` | `DAC-R-003` | historical文書がfrontmatterだけでcanonicalを名乗る | current authorityへ昇格しない |
| `DAC-AC-005` | `DAC-R-004` | current文書から存在するcompatibility targetを参照する | dead authority edgeとして拒否する |
| `DAC-AC-006` | `DAC-R-004` | binding cycleまたはdangling targetを作る | cycleとdanglingを別findingで検出する |
| `DAC-AC-007` | `DAC-R-005` | startup ruleが旧L体系文書を読む | `STARTUP_AUTHORITY_LEAK`でredになる |
| `DAC-AC-008` | `DAC-R-005` | active setup templateがstale process文書を生成する | consumer edge付きでredになる |
| `DAC-AC-009` | `DAC-R-006` | sourceだけを更新しgenerated artifactを据え置く | `GENERATOR_PROPAGATION_DRIFT`でredになる |
| `DAC-AC-010` | `DAC-R-006` | generated artifactだけを手修正しreceiptを据え置く | provenance不一致でredになる |
| `DAC-AC-011` | `DAC-R-007` |各taxonomyのfixtureを一件ずつ注入する | 対応するtyped findingだけを返す |
| `DAC-AC-012` | `DAC-R-008` | 古いがconsumerの無いhistorical文書を置く | 高severityや削除要求へ誤分類しない |
| `DAC-AC-013` | `DAC-R-008` | startup reachableなcandidateをcurrentとして読む | P0 findingとして拒否する |
| `DAC-AC-014` | `DAC-R-009` | baseline済みfindingとは別の新規findingを追加する | baseline greenで相殺せずredになる |
| `DAC-AC-015` | `DAC-R-009` | baseline entryからowner、期限、exact findingを外す | baseline自体を無効として拒否する |
| `DAC-AC-016` | `DAC-R-010` | semantic epoch更新後も旧digest pinをconsumerへ残す | `SEMANTIC_EPOCH_DRIFT`でredになる |
| `DAC-AC-017` | `DAC-R-011` | #825または#1370だけをgreenにする | Censusを含むaggregateはgreenにならない |
| `DAC-AC-018` | `DAC-R-012` | scannerへ自動削除または本文書換えpayloadを返させる | unsupported operationとして拒否する |
| `DAC-AC-019` | `DAC-R-012` |意味変更findingをRefactoringへ流す | RedesignまたはRequirement Re-entryへ昇格する |
| `DAC-AC-020` | 全体 | clean checkoutでinventory、graph、findingを二回生成する | exact setとdigestが一致する |

## 完了境界

候補文書のmergeはCapability完成を意味しない。`DAC-AC-001..020`をL10 test authorityとしてcanonical化し、
Requirement IR、runtime、doctor、CI、DB projection、consumer smoke、Claude exact-HEAD review、Reverse fullbackを検証し、
main反映後の再読がすべてgreenになった時だけ#1372を完了できる。
