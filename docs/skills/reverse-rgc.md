---
schema_version: skill.v1
name: reverse-rgc
skill_type: drive-reverse
applies_to:
  layers:
    - L3
    - L4
    - L5
  drive_models:
    - Reverse
    - Recovery
---

# 完了 gate（RGC closure gate）

RGC: Reverse Gate Criteria は、Reverse cycle の closure gate である。
対象 scope が Forward へ戻る前に、Reverse cycle が完了し、その出力が V-model
obligations を満たしていることを確認する
（FR-L1-14、reverse.md §3 exit conditions、§4 Forward merge rules）を確認する。

`upgrade` reverse type は RGC を使わない。それ以外の type
（`code`、`design`、`normalization`、`fullback`）は、Reverse PLAN を close する前に
RGC を pass しなければならない。

## この skill を読む条件

- R4 が完了し、`forward_routing` value が confirmed。
- Reverse PLAN を `status: done` へ遷移させようとしている。
- Reverse cycle の終端で handover を書いている。

## RGC checklist（全項目必須）

### R-phase artifact 完全性

- [ ] `R0-evidence-map.yaml` が存在し、`has_existing_tests` が明示されている。
- [ ] `R1-observed-contracts.yaml` が存在する
      （code/upgrade/fullback types のみ。design/normalization で無い場合は正しい）。
- [ ] `R2-as-is-design.md` が存在し、DAG があり navigable。
- [ ] `has_existing_tests=true` の場合、`R2-as-is-test-design.md` が存在する。
- [ ] `R3-intent-hypotheses.yaml` が存在し、`po_reviewed: true` が設定されている。
- [ ] `R4-gap-register.yaml` が存在し、`forward_routing` と `promotion_strategy`
      が設定され、すべての H-NN hypotheses に resolutions がある。

### V-model test-design state の確認（reverse.md §2.1）

- [ ] `has_existing_tests=true` の場合、`as-is-test-design` reconstruction が完了し、
      routing-destination pair freeze gate へ渡せる。
- [ ] `has_existing_tests=false` の場合、gap register の `missing_pair_artifacts` が、
      design artifact はあるが test-design が無い layer をすべて列挙している。
      これらの layer は test-design PLAN 作成と対応する pair-freeze gate
      （G3/G4/G5）pass まで L7 implementation へ進めない。

### Forward merge readiness の確認

- [ ] `forward_routing` が `L1`、`L3`、`L4`、`L5`、`gap-only` のいずれか。
- [ ] Routing destination PLAN が存在する
      （または `gap-only-defer` が debt/readiness-defer に backlog reference 付きで記録されている）。
- [ ] invalidated Forward gates が `R4-gap-register.yaml` の `invalidated_gates`
      list に記録されている。
- [ ] open gap が silent drop されていない。未解決 item は debt または新 PLAN へ defer されている。

### Machine validation の確認

- [ ] `helix plan lint` exits 0 on the Reverse PLAN.
- [ ] `helix vmodel lint` exits 0
      （orphan count が R0 baseline と同じ、または減っている）。
- [ ] `helix doctor` exits 0.
- [ ] `helix review --uncommitted` が Reverse phase artifacts に対する blocking findings を出さない。

### Handover

- [ ] `.helix/handover/CURRENT.json` が Reverse closure と次の active task である
      routing destination PLAN を反映している。

## RGC が確認しないこと

RGC は routing destination の pair-freeze gate が pass 済みかどうかを検証しない。
それは Forward-cycle obligation である。RGC は、Forward がそれを実行するために必要な
input（R-phase artifacts、test-design state、gap-register）を Reverse が提供したことだけを確認する。

## RGC pass 後

PLAN を `status: done` にする。対象 scope は routing destination の Forward PLAN に属する。
L7 work を始める前の次の blocking boundary は、routing destination の Pair freeze gate
（G1/G3/G4/G5）である。
