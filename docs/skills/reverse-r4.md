---
schema_version: skill.v1
name: reverse-r4
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

# R4 gap 登録と Forward routing

R4: Gap Register and Forward Routing は、Reverse の最終 phase である。
すべての gaps を close し、`forward_routing` を lock し、`promotion_strategy` を設定し、
`missing_pair_artifacts` を記録して Forward cycle へ merge する
（FR-L1-14、reverse.md §2、§3 exit conditions、§4）。

5 種類すべての reverse types が R4 を通る（skip なし）。
`upgrade` type は R4 後に RGC を使わない。

## この skill を読む条件

- `kind=reverse` PLAN が `workflow_phase: R4` を持つ。
- R3 intent-hypotheses が PO sign-off 付きで完了している。

## 入力

- `R3-intent-hypotheses.yaml`（すべての hypotheses が classified / PO-reviewed）。
- `R2-as-is-design.md` and (if applicable) `R2-as-is-test-design.md`.
- `R1-observed-contracts.yaml`（code、upgrade、fullback types）を読む。
- `ut-tdd status` と `ut-tdd doctor` から得る existing Forward PLAN と gate state。

## 手順

1. cycle の `forward_routing` を finalize する。5 つの valid values
   （`L1`、`L3`、`L4`、`L5`、`gap-only`）のいずれかであることを確認する。
   reverse.md §4 routing table を使う。
   - Requirement 自体が曖昧 -> `L1` または `L3`。
   - Design judgment が欠けている -> `L4`。
   - Contract/API/DB definition が欠けている -> `L5`。
   - 利用可能な Forward path が無い -> `gap-only`（debt/readiness-defer）。
2. `promotion_strategy` を設定する。
   - `new-plan`: routing destination に新しい Forward PLAN を作成する必要がある。
   - `amend-existing`: 既存 Forward PLAN を gap で更新する。
   - `gap-only-defer`: immediate PLAN なしで debt/readiness-defer に記録する。
3. implementation（design artifact）はあるが test-design（③）が無い layer について、
   `missing_pair_artifacts` を記録する（reverse.md §2.1）。
   - layer と missing artifact type を列挙する。
   - routing destination は、対応する pair-freeze gate（G3/G4/G5）を越える前に
     test-design PLAN を含めなければならない。
4. R3 の `conflict` hypothesis について、relevant gate が再評価を要することを
   PLAN notes に記録し、`--invalidate-forward` intent を適用する。
   （`--invalidate-forward` flag は planned ut-tdd gate mechanism。
   実装までの間は gate ID と rationale を PLAN に手動記録する。）
5. 今 close できない open gap は、新しい PLAN reference または backlog entry とともに
   `debt` または `readiness-defer` へ route する。gap-register に unresolved gaps を残さない。

## 出力 artifacts

`.ut-tdd/reverse/<plan_id>/` へ書く。

**R4-gap-register.yaml**:
```yaml
plan_id: <PLAN-REVERSE-NN>
forward_routing: <L1|L3|L4|L5|gap-only>
promotion_strategy: <new-plan|amend-existing|gap-only-defer>
missing_pair_artifacts:
  - layer: <L3|L4|L5|L6>
    absent_artifact: <test-design|design-doc>
    routing_gate: <G3|G4|G5>
gaps:
  - hypothesis_id: <H-NN>
    resolution: <new-plan|amend|defer>
    target_plan_or_backlog: ""
invalidated_gates: []     # 再評価が必要な gate ID を列挙する
r4_notes: ""
```

## 終了条件（reverse.md §3）

R4 を close して Forward へ merge する前に、以下をすべて満たす。

- [ ] `forward_routing` が valid 5-value enum entry に設定されている。
- [ ] `promotion_strategy` が設定されている。
- [ ] R3 のすべての hypotheses が gap register 内に `resolution` entry を持つ。
- [ ] `missing_pair_artifacts` が complete。impl はあるが test-design が無いすべての layer が列挙されている。
      無い場合は field を省略せず empty list にする。
- [ ] 任意の `conflict` hypothesis について、再評価対象の named gate が記録されている。
- [ ] Forward path の無い open gaps が、referenced PLAN または backlog entry 付きで
      debt/readiness-defer へ route されている。
- [ ] `workflow_phase: R4` と `status: done`
      （または schema-equivalent closed state）の状態で `ut-tdd plan lint` が 0 で終了する。
- [ ] `ut-tdd vmodel lint` が 0 で終了する
      （reconstruction 由来の orphan artifacts が無い）。
- [ ] `ut-tdd doctor` exits 0.
- [ ] `promotion_strategy` が `gap-only-defer` でない場合、routing destination の新 PLAN が存在する
      （または amend target が confirmed）。

すべての exit conditions が green の場合だけ Reverse cycle は closed になる。
その後、対象 scope の downstream L7 work を始める前に、routing destination の Pair freeze gate
（G1/G3/G4/G5）を pass しなければならない。
