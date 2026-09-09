---
title: "Skill／Agent／Command Surface価値・置換・authority整理受入候補"
layer: L10
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
related_issue: 1382
plan_id: PLAN-L3-1382-surface-value-rationalization
parent_requirements: docs/governance/candidates/surface-value-rationalization-requirements.md
pair_artifact: docs/governance/candidates/surface-value-rationalization-requirements.md
---

# Skill／Agent／Command Surface価値・置換・authority整理受入候補

以下は未実行のacceptance oracleであり、候補文書のmergeだけで合格としない。

| ID | 対応要件 | 受入候補 |
|---|---|---|
| `SVR-AC-001` | `SVR-R-01` | HEAD上の対象を全数列挙し、各責務単位からowner、current consumer、source HEAD、evidence windowを逆引きできる。欠落consumerを0へ変換しない。 |
| `SVR-AC-002` | `SVR-R-02` | 7分類のexact set、未分類、多重分類、複合責務未分割の反例を検査し、未分類と多重分類を0にする。 |
| `SVR-AC-003` | `SVR-R-03` | usage指標だけを高くしたfixtureでKEEPが自動決定されず、utility指標を独立計測できる。 |
| `SVR-AC-004` | `SVR-R-04` | context cost、latency、maintenance、driftへHEAD、provider／model／設定、方法、期間を束縛し、欠測をunknownとして保持する。 |
| `SVR-AC-005` | `SVR-R-05` | provider-native、Policy、retrievalの置換証拠を独立検査し、名称一致またはmodel能力の自己申告だけのreplacementを拒否する。 |
| `SVR-AC-006` | `SVR-R-06` | 8 dispositionのexact setを受理し、classification値をdispositionへ混入したfixtureを拒否する。 |
| `SVR-AC-007` | `SVR-R-07` | effect evidence欠落、利用0、観測期間0の各fixtureがREMOVEへ遷移せず`unknown`になる。 |
| `SVR-AC-008` | `SVR-R-08` | provider内部review receiptを独立reviewまたはmerge admissionへ差し替えたfixtureを拒否し、HELIX外角authorityを保持する。 |
| `SVR-AC-009` | `SVR-R-09` | fallback／recovery／benchmark／task-level consumer、successor E2E、migration、rollbackのいずれか欠落時にdirect engine削除を拒否する。 |
| `SVR-AC-010` | `SVR-R-10` | proseからPolicyへの移管は受領先digestと同意味の機械反例が成立するまで旧保護を維持し、成立後は通常Skillへの重複注入を拒否する。 |
| `SVR-AC-011` | `SVR-R-11` | compatibility／historical surfaceをcurrent setup／template／推薦へ再生成するfixtureを拒否し、read-only replayを保持する。 |
| `SVR-AC-012` | `SVR-R-12` | #863／#865／#1594へのtyped joinと、canonical main SHA、source revision／digest／approval／owner／AC／downstreamが揃うまで#397 admissionを拒否する。Issue本文だけからのJSON化を拒否する。 |

## 終端受入

- tracked surfaceの未分類0、ただし観測不能fieldは`unknown`として残せる。
- `MACHINE_POLICY`がprose skillだけで強制されるcurrent surface 0。
- compatibility surfaceのcurrent output／setup再生成0。
- successor E2E前のdirect engine削除0。
- source／template／consumerの移行は同一digest、targeted／full regression、doctor、DB convergence、consumer smoke、独立exact-HEAD reviewで検証する。
