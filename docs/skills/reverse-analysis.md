---
schema_version: skill.v1
name: reverse-analysis
skill_type: drive-reverse
applies_to:
  layers:
    - L1
    - L3
    - L4
    - L5
  drive_models:
    - Reverse
    - Retrofit
    - Recovery
---

# reverse analysis（Reverse 分析）

HELIX Reverse drive（FR-L1-14）の entry skill。Reverse cycle を開始するか、
どの type を使うか、R0-R4 phases を Forward にどう接続するかを判断する必要がある場合に読む。

## この skill を読む条件

- drift signal が発火する（`helix doctor` が schema/contract divergence を検出）。
- existing code または design が Forward L0-L14 artifact へ trace できない。
- Scrum increment が完了し、V-model artifacts へ promote する必要がある（fullback）。
- Discovery cycle が終わり、その conclusions に formal Forward anchoring が必要。
- Retrofit impact assessment で unknown dependencies の trace が必要（upgrade type）。

## 5 つの Reverse types（FR-L1-14 / reverse.md §3.3）

| type | 使う条件 | R1 skip? | typical forward_routing |
|---|---|---|---|
| `code` | impl は存在するが design/contracts が無い | no | L3、L4、または L5 |
| `design` | design doc は存在するが impl が不明または out-of-sync | yes | L4 または L5 |
| `upgrade` | dependency version bump があり impact が不明 | no | L5（RGC は使わない） |
| `normalization` | naming/structure drift があり contract gap は無い | yes | L3 または L4 |
| `fullback` | Discovery/Scrum closure を V-model へ promote する | no | L1、L3、または L4 |

## R0-R4 phase map（phase 対応表）

```
R0  Evidence Acquisition   -- what exists; has_existing_tests flag
R1  Observed Contracts      -- API/DB/type contracts (skip: design, normalization)
R2  As-Is Design            -- current design + DAG; test-design if tests exist
R3  Intent Hypotheses       -- gap/routing candidates; PO verification required
R4  Gap & Routing           -- gap-register + forward_routing + promotion_strategy
     |
     +-- R4 で Forward merge: routing value は L1/L3/L4/L5/gap-only のいずれか
```

R4 後、downstream L7 work を始める前に、routing destination の Pair freeze gate
（G1/G3/G4/G5）を pass しなければならない。`helix vmodel lint` は missing pair artifacts を可視化する。

## Reverse cycle の PLAN frontmatter

```yaml
kind: reverse
drive: <be|fe|fullstack|db|agent>   # 対象作業の specialist
layer: cross
workflow_phase: R0                  # phase の進行に合わせて更新する
reverse_type: <code|design|upgrade|normalization|fullback>
```

各 phase boundary で `helix plan lint`（schema）と `helix doctor`（governance）により validate する。

## Test-design symmetry rule（reverse.md §2.1 の対称性ルール）

Reverse は V-model test-design pairing state に責任を持つ。

- Tests が存在する（`has_existing_tests=true`）: R2 が `as-is-test-design` を reconstruct する。
- Tests が無い: R4 が `missing_pair_artifacts` を記録する。routing destination は、
  G3/G4/G5 gate を越える前に test-design PLAN を含めなければならない。

Reverse 自体は test code を生成しない。Forward が pair を正しく freeze できるように、
test-design state を observe/record する。

## R0 開始前 checklist

- [ ] 上表から reverse_type を特定する。
- [ ] `helix status` が blocking handover や open doctor violation なしを示すことを確認する。
- [ ] correct frontmatter を持つ `kind=reverse` PLAN を `docs/plans/` に作成する。
- [ ] `helix plan lint` を実行し、進む前に 0 で終了することを確認する。
