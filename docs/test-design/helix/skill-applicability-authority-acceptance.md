---
title: "HELIX L10 受入テスト設計 — skill applicability authority"
canonical_layer_scheme: L1-L12
layer: L10
paired_requirement_layer: L3
artifact_type: test_design
status: draft
created: 2026-08-26
updated: 2026-08-26
owner: QA / Codex TL
plan: PLAN-L3-67-skill-applicability-authority
pair_artifact: docs/design/helix/L3-requirements/skill-applicability-authority.md
---

# HELIX L10 受入テスト設計 — skill applicability authority

## §0 合否境界

新field名の存在だけでは合格にしない。classification registryのexact identity参照、軸分離、極性、legacy
input-only、current output非再出力を個別mutationで検証する。

## §1 oracle完全一致集合

| AC ID | 対応requirement | 入力／操作 | 合格条件 | negative mutation |
|---|---|---|---|---|
| `SKAPP-AC-001` | `SKAPP-R-01` | 登録済みaxis／IDを指定する | exact pairを受理する | 名称類似でunknown IDを受理しない |
| `SKAPP-AC-002` | `SKAPP-R-01` | IDのaxisだけを変更する | axis mismatchでfail-closeする | ID存在だけで通さない |
| `SKAPP-AC-003` | `SKAPP-R-02` | DiscoveryとScrumを別々に指定する | caseとstyleを別pairで保持する | 同一model enumへ畳み込まない |
| `SKAPP-AC-004` | `SKAPP-R-02` | Design HARNESSを指定する | specialist capabilityとして保持する | styleまたはcaseへ変換しない |
| `SKAPP-AC-005` | `SKAPP-R-03` | 同一pairをpositive／negativeへ置く | polarity conflictを拒否する | 後勝ちで上書きしない |
| `SKAPP-AC-006` | `SKAPP-R-03` | applicabilityを未指定にする | current authoring欠損として扱う | all／Forwardへdefaultしない |
| `SKAPP-AC-007` | `SKAPP-R-04` | recommendation／DB／CLIを投影する | typed pairとregistry束縛だけを返す | 旧field名を再出力しない |
| `SKAPP-AC-008` | `SKAPP-R-05` | legacy `reverse`を入力する | warning付きでworkflow modelへ一方向変換する | current identityとして保存しない |
| `SKAPP-AC-009` | `SKAPP-R-05` | legacy `Forward`／`Scrum`を入力する | ambiguousでfail-closeする | styleまたはworkflowを推測しない |
| `SKAPP-AC-010` | `SKAPP-R-06` | legacy green＋current polarity conflictを入力する | current failureを維持する | compatibility成功で相殺しない |

## §2 量閉じ

- behavior contract: `SKAPP-FR-001..002` exact 2件。
- supporting requirements: `SKAPP-R-01..06` exact 6件。
- acceptance: `SKAPP-AC-001..010` exact 10件。
