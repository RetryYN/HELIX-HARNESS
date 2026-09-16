---
document_id: HELIX-HARNESS-MEMORY-COORDINATION-L10-CANDIDATE
version: 0.1.0
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "harness memory coordination-only境界 受入候補"
owner_issue: 1448
plan_id: PLAN-L3-86-harness-memory-coordination-boundary
parent_design: docs/governance/candidates/harness-memory-coordination-boundary-requirements.md
pair_artifact: docs/governance/candidates/harness-memory-coordination-boundary-requirements.md
---

# harness memory coordination-only境界 受入候補

本書はPLAN-L3-86の人間承認が記録済みで、独立検収・正本化待ちのL10 candidateであり、runtimeが実装済みであることを示さない。各反例は別failureとして保持し、正常系の件数で
相殺しない。

| AC | 対応要件 | 反例／観測 | 合格条件 |
|---|---|---|---|
| `HMC-AC-001` | `HMC-R-01` | 必須field欠落、未知field、長文本文、secret、absolute path | typed envelope拒否、本文を出力しない |
| `HMC-AC-002` | `HMC-R-02` | scope authorityがIssue／PLAN以外、複数対象、対象digest欠落 | 曖昧入力を拒否しpointerを推測しない |
| `HMC-AC-003` | `HMC-R-03` | 同一通知を再送、ack欠落、TTL超過、dead-letter再試行 | 受信側冪等、dedupe、期限切れ隔離を返す |
| `HMC-AC-004` | `HMC-R-04` | 通知本文だけを実行入力にする | current authority再取得なしでは受理しない |
| `HMC-AC-005` | `HMC-R-05` | candidate HEAD、branch owner、lease、assignment state、scope digestの一つを変更する | `stale_coordination`で拒否する |
| `HMC-AC-006` | `HMC-R-06` | 要求、設計、ADR、受入条件、progress、嗜好、provider設定を本文へ保存する | authority／personalization混入を拒否する |
| `HMC-AC-007` | `HMC-R-07` | 相談、質問、叱責、作業依頼、AI解釈をPO approval／decisionへ変換する | #1449の分類へ戻し、authority投影を拒否する |
| `HMC-AC-008` | `HMC-R-08` | `cli-memory`またはGitHub account名だけをhuman／reviewer証明にする | actor／session provenance不成立として隔離する |
| `HMC-AC-009` | `HMC-R-09` | authority ID、source locator、revision、digest、actorの一つを欠くclaim | `unverified_human_claim`へ隔離しapprovalを生成しない |
| `HMC-AC-010` | `HMC-R-10` | superseded／retracted／invalid entryをcurrent listへ混ぜる | current view、SessionStart、DB、compactionから除外する |
| `HMC-AC-011` | `HMC-R-11` | 無効entryへactive referenceだけを追加する、旧本文を書き換える | typed transitionなしの再活性化を拒否する |
| `HMC-AC-012` | `HMC-R-12` | current view、SessionStart、DB projection、compactionの一つだけを更新する | active exact set／digest不一致をfail-closeする |
| `HMC-AC-013` | `HMC-R-13` | crash後再開、再送、消費済み再取得、期限切れ再試行 | 同じevent setを重複なく再生する |
| `HMC-AC-014` | `HMC-R-14` | 既存entryを未分類のままcurrentへ返す | 未分類を拒否し、7分類のいずれかへ隔離する |
| `HMC-AC-015` | `HMC-R-15` | project authority／personalization／runtime interpretationをstartupへ出す | current guidance、approval、merge admissionへ影響させない |
| `HMC-AC-016` | `HMC-R-16` | writerが暗黙current-plan、別PRのPLAN、stale PLANを継承する | 明示ID・存在・scope・revision照合なしで拒否する |
| `HMC-AC-017` | `HMC-R-17` | provider native memory／history／user settingをshared memoryへ暗黙注入する | provider入力をauthorityとせず、別adapter境界へ送る |
| `HMC-AC-018` | `HMC-R-18` | Claudeだけ、Codexだけ、writerだけが異なる禁止fieldを通す | adapter／writer／projector／doctor parity違反でredにする |
| `HMC-AC-019` | `HMC-R-19` | memoryからRequirement、Design、Approval、Release、Assignmentへ直接書く | direct authority writeを拒否し既存workflowへrouteする |
| `HMC-AC-020` | `HMC-R-20` | retention期間をmemory側が独自変更、履歴削除で無効entryを隠す | #1188へ委譲し、履歴と削除境界を保全する |
| `HMC-AC-021` | 全体 | 同一source event／HEAD／policyで二回再構築する | current exact set、projection、digestが一致する |
| `HMC-AC-022` | 全体 | 承認取得済みでも独立検収・正本化前のcandidateをruntime／DB／SessionStartへ配置する | candidate-only変更はcurrent authorityへ昇格しない |

## 完了境界

HMC-AC-001〜022、targeted／mutation／full CI、doctor、DB replay、Claude／Codex parity、#1188接合、独立exact-HEAD review、
main read-afterが揃うまで、#1448および本PLANをcompletedと扱わない。既存汚染entryは履歴を保持したうえでcurrent viewから隔離し、
memoryだけで人間承認やPO判断を生成しない。
