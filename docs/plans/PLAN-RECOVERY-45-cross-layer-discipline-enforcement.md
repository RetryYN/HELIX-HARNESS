---
plan_id: PLAN-RECOVERY-45-cross-layer-discipline-enforcement
title: "PLAN-RECOVERY-45 (recovery): 宣言した engineering discipline contract を layer に関わらず検証する"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-11 PO 指示「自走しろ」。Issue #549（layer=cross の PLAN が engineering_discipline_required: true を宣言しても atomic-change-contract 検証を一切受けない）を自走で解消する"
created: 2026-08-11
updated: 2026-08-11
owner: Claude / TL
github_issue_id: 549
engineering_discipline_required: true
behavior_contract_id: DDD-TDD-DISCIPLINE-SCOPE-001
responsibility_owner: ddd-tdd-rules
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: policy
backprop_decision: not_required
backprop_decision_reason: "engineering discipline contract の内容（必須 field と語彙）は変更しない。変更するのは『宣言した PLAN の contract を検証するか否か』という適用範囲の判定だけであり、要件・設計契約の追加ではない"
contract_preconditions: "requiresEngineeringDiscipline は layer が L3-L7 かつ created が DISCIPLINE_CUTOFF 以降の PLAN だけを true とする。層と時間の 2 条件が AND で scope を決めるため、layer: cross の PLAN は engineering_discipline_required: true を明示的に宣言しても engineeringDisciplineViolations と atomicChangeContractViolations の両方を丸ごと素通りし、refactor_step / complexity_effect / legacy_retirement_state に enum 外の値を書いても検出されない"
contract_postconditions: "scope の閾値を DISCIPLINE_CUTOFF ただ一つとする。cutoff 以降の PLAN が engineering_discipline_required: true を宣言した時点で、layer に関わらずその宣言内容が検証される。cutoff 前の PLAN は宣言していても grandfathered のままとし遡及的な記入要求を出さない。宣言していない非 L3-L7 PLAN に対しては従来どおり opt-in を強制しない（義務づけの閾値は DISCIPLINE_LAYERS と DISCIPLINE_CUTOFF のまま不変）"
contract_invariants: "L3-L7 PLAN の判定は不変（義務づけ・必須 field・語彙・pairing rule すべて変更しない）。REQUIRED_DISCIPLINE_FIELDS、NO_CODE_DECISIONS、DDD_MODELING_DECISIONS、COMPLEXITY_EFFECTS、REFACTOR_STEPS、LEGACY_RETIREMENT_STATES の定義は 1 件も追加・削除しない。remove_legacy ↔ consumer_zero の pairing rule も不変"
contract_failures: "engineering-discipline-contract（宣言済み PLAN の必須 field 欠落、no_code_decision / ddd_modeling_decision / complexity_effect の enum 外値、add_code / justified_positive に対する justification 欠落）と atomic-change-contract（change_slice 非 atomic、refactor_step / legacy_retirement_state の enum 外値、remove_legacy の pairing 違反）が layer に関わらず発火する"
tdd_red_required: true
red_at: "2026-08-11T02:53:27Z"
green_at: "2026-08-11T03:26:37Z"
mutation_oracle_evidence: "seeded defect 3 種を src/lint/ddd-tdd-rules.ts の requiresEngineeringDiscipline へ 1 件ずつ注入し、各 mutant が単独で killed になることを実測した。M-1（宣言尊重の disjunct を削除して現行の欠陥を復元）→ tests/ddd-tdd-rules.test.ts::U-EDISC-005 が 1 failed で killed。M-2（層条件も外して `return true` へ弱体化し opt-in していない PLAN まで巻き込む）→ tests/ddd-tdd-rules.test.ts が 2 failed で killed。M-3（cutoff 判定を削除し grandfathering を破壊）→ tests/ddd-tdd-rules.test.ts が 2 failed で killed。全 mutant 復元後 tests/ddd-tdd-rules.test.ts で 21 passed（2026-08-11T03:26:37Z）"
complexity_effect: net_neutral
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-EDISC-005, test_path: tests/ddd-tdd-rules.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 義務づけ範囲と検証範囲の混同の同定" }
  - { role: se, slot_label: "SE — requiresEngineeringDiscipline の判定順序変更" }
  - { role: qa, slot_label: "QA — 宣言済み cross PLAN の正例・負例・非宣言 PLAN の 3 分岐 oracle" }
  - { role: tl, slot_label: "TL — merged PLAN 17 本の語彙正規化の妥当性確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-45-cross-layer-discipline-enforcement.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/ddd-tdd-rules.ts, artifact_type: source_module }
  - { artifact_path: tests/ddd-tdd-rules.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires: []
  blocks:
    - issue:549
review_evidence: []
---

# PLAN-RECOVERY-45：宣言した engineering discipline contract を layer に関わらず検証する

## §1 なぜ recovery か

`engineering_discipline_required: true` は PLAN 側の**宣言**である。ところが
`requiresEngineeringDiscipline`（`src/lint/ddd-tdd-rules.ts`）はこの宣言を一切読まず、
`layer ∈ {L3..L7}` **かつ** `created >= DISCIPLINE_CUTOFF` という 2 条件の AND だけで
検証対象を決めていた。

その結果、`layer: cross` の PLAN は「discipline contract を守る」と宣言したうえで、その contract の
検証を 1 件も受けないという状態が成立していた。gate が宣言を無視するのだから、宣言は無意味な装飾である。

これは義務づけ（どの PLAN に contract を要求するか）と検証（宣言された contract が正しいか）という
別々の判断を、1 つの述語で兼ねてしまった設計上の取り違えである。層は**義務づけ**の条件であって
**検証**の条件ではない。

## §2 実害（推測ではなく実測）

`layer: cross` かつ宣言済みの PLAN は 27 本ある。検証を有効化して測定した結果、
**17 本 21 件**が enum 外の語彙を保持していた。

| field | 漂流値 | 件数 | 正規語彙への対応 |
|---|---|---|---|
| `refactor_step` | `modify` | 14 | `not_applicable` |
| `refactor_step` | `consolidate_authority` | 1 | `not_applicable` |
| `refactor_step` | `extend_contract` | 1 | `introduce_contract` |
| `complexity_effect` | `justified_neutral` | 3 | `net_neutral` |
| `legacy_retirement_state` | `retired` | 2 | `removed` |

対照として、gate が実際に見ている L3-L7 の 147 本は `refactor_step` に
`introduce_contract` (135) / `not_applicable` (5) / `dual_green` (4) / `remove_legacy` (2) /
`migrate_one_consumer` (1) しか使っておらず、正規 ladder から 1 件も外れていない。
**漂流は検査されていない領域でのみ発生している**。これは gate の不在が原因であることの直接証拠である。

## §3 変更内容

### §3.1 gate — scope の閾値を cutoff ただ一つへ寄せる

```ts
function requiresEngineeringDiscipline(text: string): boolean {
  const created = fmValue(text, "created");
  if (!created) return false;
  const createdAt = Date.parse(created);
  if (!Number.isFinite(createdAt) || createdAt < DISCIPLINE_CUTOFF) return false;
  const layer = fmValue(text, "layer");
  return (
    booleanField(text, "engineering_discipline_required") ||
    (!!layer && DISCIPLINE_LAYERS.has(layer))
  );
}
```

- **scope**（検証するか）= `created >= DISCIPLINE_CUTOFF` かつ（宣言済み **or** L3-L7）
- **義務づけ**（宣言を強制するか）= `layer ∈ {L3..L7}`（`DISCIPLINE_LAYERS` は不変）

cutoff 前の PLAN は宣言していても grandfathered のままとする。cutoff は「既存 PLAN へ遡って
contract 記入を要求しない」ための線であり、その意図は本 PLAN でも維持する。

宣言していない非 L3-L7 PLAN に opt-in を強制することはしない。documentation-only の PLAN まで
contract 記入を要求することになり、本 Issue の範囲を超えるためである。

### §3.2 語彙の正規化（17 本 21 行）

漂流値を §2 の表のとおり既存語彙へ正規化する。**語彙は 1 件も追加しない**。

`refactor_step` は strangler / Mikado ladder における位置を表す列挙であり、
`modify` や `consolidate_authority` は ladder 上の位置ではない。これらの PLAN はいずれも
legacy retirement を伴わない通常の変更であり、ladder 上の位置は `not_applicable` が正確である。
`extend_contract` のみ既存 contract の拡張であるため `introduce_contract` を充てる。

これは**記録された判断の変更ではなく、語彙の正規化**である。各 PLAN の
`contract_*` / `complexity_justification` / `removal_trigger` など判断内容を記述した field には
一切触れていない（差分は frontmatter の 21 行のみ、すべて enum 値の置換）。

## §4 検証

`U-EDISC-005` は 4 分岐を 1 つの oracle で押さえる。

1. 正規語彙の cross PLAN → 違反なし（過検出しない）
2. 漂流語彙の cross PLAN → `engineering-discipline-contract` 1 件と `atomic-change-contract` 2 件
3. 宣言していない cross PLAN → opt-in を強制しない（義務づけ範囲を広げていないことの証明）
4. cutoff 前の宣言済み cross PLAN → 漂流語彙を持っていても違反なし（grandfathering の維持）

mutation は frontmatter の `mutation_oracle_evidence` に実測値を記録した。分岐 3 が無ければ M-2
（`return true` への弱体化）が、分岐 4 が無ければ M-3（cutoff 判定の削除）がそれぞれ生存する。
義務づけ範囲を広げないこと、および遡及要求を出さないことという 2 つの不変条件に、
それぞれ専用の負例が必要であることを 2 つの mutant が示している。

## §5 残る課題（本 PLAN の範囲外）

### §5.1 cutoff 前の宣言済み PLAN

`PLAN-L3-18-worker-contract-benchmark-promotion.md`（`created: 2026-07-20`、`kind: add-design`）は
`engineering_discipline_required: true` を宣言しながら `complexity_effect: neutral`（enum 外）を
保持している。本 PLAN は grandfathering を維持するため、この 1 本を対象外とした。

これを是正するには `kind: add-design` に対応する branch で扱う必要がある
（`recovery/` branch が add-design PLAN を触ると `branch-kind-check` が `kind_mismatch` で block する）。
別 Issue として分離する。

### §5.2 cross への義務づけ

`layer: cross` の PLAN に discipline contract を**義務づける**か否かは別の判断であり、本 PLAN では
決めない。現状は宣言した 27 本のみが検証対象で、宣言していない cross PLAN は対象外のままである。
義務づけを広げる場合は既存 cross PLAN 全件への contract 記入が必要になるため、独立した PLAN で扱う。
