---
schema_version: skill.v1
name: verification
skill_type: verification
applies_to:
  layers:
    - L1
    - L2
    - L3
    - L4
    - L5
    - L6
    - L7
    - L8
    - L9
    - L11
    - L12
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Discovery
    - Scrum
    - Recovery
---

# verification（検証）

V-model trace verification は、すべての design artifact が implementation と test artifact へ正しく降下し、
machine checks が ID coverage だけでなく real substance を反映していることを確認する。
FR-L1-03（descent obligations）、FR-L1-18（cross-detection aggregation）を扱い、
FR-L1-21（review evidence）を支える。

## この skill を読む条件

- Forward または Add-feature cycle が layer group を完了し、descent verification cycle が trigger された。
- `helix doctor` が descent または orphan finding 付きで non-zero 終了した。
- `helix vmodel lint` が unsatisfied obligation を報告した。
- Scrum S3 verify step が V-model completeness evidence を必要とする。
- Recovery cycle が、incident の原因 gap が close 済みであることを証明する必要がある。

## Verification は coverage ではなく substance

coverage checks（fr-registry link exists、pair-freeze orphan count = 0）は
ID registration を確認するが、content correctness は確認しない。verification pass には、
design doc を読み、その claim が body で substantiated されていることの確認が必要。
"Coverage = 0 orphans" と "descent = design is correct" は別の claim である。

## Machine verification sequence（機械検証順序）

順番に実行する。最初の failure で停止し、修正してから続行する。

```
helix doctor              # structural governance: orphan、missing pair、PLAN schema
helix vmodel lint         # V-model layer obligations: absence-fail-close
helix plan lint           # PLAN schema、dependency existence、schedule section
bun run typecheck          # TypeScript: error 0
bun run lint               # Biome check: format + lint violation 0
bun run test               # Vitest: rationale の無い skipped test なし
```

これらを `| tail` に pipe しない。truncation は root error を隠す。

## layer group 別 descent verification

**L0-L3（concept から functional design まで）:**
- L1 requirements doc が存在し、各 FR が unique ID を持つ。
- 各 FR に L3 functional spec が存在し、body が placeholder prose ではない。
- `helix vmodel lint` が L3 obligation gap を報告しない。

**L4-L6（basic design から unit-test design まで）:**
- scope 内の各 PLAN について、`docs/design/L5/` に L5 detailed design doc が存在する。
- 各 module について、`docs/test-design/L6/` に L6 test-design doc が存在する。
- L6 test-design が Vitest `describe`/`it` names と一致する explicit scenario IDs を列挙している。
  matching test が無い状態は open obligation であり pass ではない。

**L7 (implementation):**
- Vitest assertions が paired L6 doc の scenarios を exercise している。
- same line の comment に PLAN-linked rationale が無い `.skip`、`todo`、`@ts-ignore` が無い。
- PLAN の `harness.db` projection row が `completed` または `review` state。

**L8-L9（integration test design と system test design）:**
- `docs/test-design/L8/` に L8 integration test design doc が存在する。
- L8 doc が cover する L5 basic design section を cross-reference している。
- gate が green だけでなく seeded violation fixture で exit 1 する。

## Obligation absence rule（artifact 欠落 rule）

absent artifact は neutral state ではなく violation である。design doc が存在するのに paired test-design doc が無い場合、
`helix vmodel lint` は gap として報告すべきである。lint がそれを検出しない場合は improvement entry を起票する。
absence-blindness は descent gaps の root cause である。

## Evidence record（証跡記録）

layer-group verification cycle の完了時に書く。

```
.helix/audit/<PLAN-id>-verification-<layer-group>.json
{
  "plan_id": "<id>",
  "layer_group": "L0-L3 | L4-L6 | L7 | L8-L9",
  "machine_checks": "all-pass | <failing command>",
  "descent_findings": ["<finding>" | "none"],
  "substance_checked": true | false,
  "outcome": "PASS | FAIL | CONDITIONAL",
  "reviewer": "<agent-slug or intra_runtime_subagent>",
  "timestamp": "<ISO-8601>"
}
```

## Anti-patterns（避けるパターン）

- `helix doctor` が 0 で終了したことだけで layer group complete と宣言する。
  doctor は structure を確認するが、design substance は確認しない。
- Vitest assertion count を test quality の proxy として使う。
  scenario IDs が L6 design doc と一致することを確認する。
- "unit tests are sufficient" として L8 test-design doc を skip する。
  V-model はすべての boundary で paired artifacts を要求する。
