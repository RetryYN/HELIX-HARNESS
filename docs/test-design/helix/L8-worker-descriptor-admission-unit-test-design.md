---
title: "worker descriptor admission L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-02
updated: 2026-08-02
owner: QA
plan: docs/plans/PLAN-L5-86-worker-descriptor-admission.md
pair_artifact: docs/design/helix/L5-detail/worker-descriptor-admission.md
related_l9: docs/test-design/helix/L9-worker-descriptor-admission-system-test-design.md
github_issue_id: 225
behavior_contract_id: WCC-FR-01
responsibility_owner: worker-descriptor-admission
---

# worker descriptor admission L8単体テスト設計

| oracle | 正例 | 反例／mutation | L9 trace |
|---|---|---|---|
| `U-WDA-001` | strict descriptorをparse | 欠落、unknown key、不正ID/version/digestを拒否 | ST-WDA-002 |
| `U-WDA-002` | capability closed setの全5値を受理 | provider名、未知値、case variantからの推論を拒否 | ST-WDA-001/004 |
| `U-WDA-003` | payloadだけからdescriptor digestを再現 | digest自身を入力へ含める自己参照mutation、key順／時刻依存を拒否 | ST-WDA-005 |
| `U-WDA-004` | requestのagent/version/capability 3-tupleをexact解決 | version無視、provider fallback、部分一致を拒否 | ST-WDA-001/003 |
| `U-WDA-005` | exactly-one active entryをadmit | 0件、2件、inactiveを別reasonで拒否しspawn 0 | ST-WDA-003 |
| `U-WDA-006` | specialist agent sourceをread-only projection | source固有fieldのauthority昇格、source writeを拒否 | ST-WDA-001 |
| `U-WDA-007` | Python worker sourceを同じdescriptorへprojection |第二registry新設、Python固有keyでの解決を拒否 | ST-WDA-007 |
| `U-WDA-008` | descriptor／source entry／snapshot digestを全検証 | 1面だけの照合、別provider greenでの相殺を拒否 | ST-WDA-005 |
| `U-WDA-009` | request/snapshot/descriptor不変のdecisionをcurrent判定 | 各bindingを1件ずつ変えたstale decisionを拒否 | ST-WDA-005 |
| `U-WDA-010` | 全failureを固定順・重複なしで返す | 最初のfailureだけ返す、正常候補でfailureを消すmutationを拒否 | ST-WDA-002〜005 |
| `U-WDA-011` | admitted decisionが決定的digestを持つ | locale、入力順、clockでdigestが変わるmutationを拒否 | ST-WDA-001/005 |
| `U-WDA-012` | WCC-FR-02以降を明示委譲 | launch receipt欠落を本ownerの完了claimへ混入するmutationを拒否 | ST-WDA-009 |
| `U-WDA-013` | 既存owner合成案が同一oracle 100%かつ増分最小 | oracle削除、timeout延長、string弱型化で新registry案を採用するmutationを拒否 | ST-WDA-008 |

実装時はparser、projection、snapshot canonicalizer、resolver、decision evaluator、stale predicateを純粋単体fixtureで検証する。
provider process、filesystem、network、GitHub API、DBはunit fixtureへ持ち込まない。L9 trace exact setは`ST-WDA-001..009`である。
