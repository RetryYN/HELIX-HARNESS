---
schema_version: skill.v1
name: reverse-r3
skill_type: drive-reverse
applies_to:
  layers:
    - L1
    - L3
    - L4
  drive_models:
    - Reverse
    - Retrofit
    - Recovery
---

# R3 intent 仮説

R3: Intent Hypotheses は、R4 routing に渡す design-intent hypotheses と
gap register candidates を作る phase である。R3 を exit する前に PO verification が必須
（FR-L1-14、reverse.md §2 と §5）。

5 種類すべての reverse types が R3 を通る（skip なし）。

## この skill を読む条件

- `kind=reverse` PLAN が `workflow_phase: R3` を持つ。

## 入力

- `R2-as-is-design.md` (and `R2-as-is-test-design.md` if tests exist).
- `R1-observed-contracts.yaml`（code、upgrade、fullback types）を読む。
- `R0-evidence-map.yaml` drift signals.
- 対象 scope の任意 layer にある existing Forward artifacts
  （requirements、ADRs、design docs）。as-is と比較し divergence を特定する。

## 手順

1. R2 で特定した各 structural gap について original intent を仮説化する。
   - この module/contract は、どの requirement または design decision を満たすためのものか。
   - 既存 Forward FR または ADR が、それを cover するか、partially cover するか、conflict するか。
2. 各 hypothesis を分類する。
   - `confirmed`: 既存 Forward artifact が明確に cover している。Reverse は trace を wire すればよい。
   - `gap`: cover する Forward artifact が無い。routing destination で新規または更新 Forward document が必要。
   - `conflict`: observed behavior が既存 Forward artifact と矛盾する。その artifact は invalidate または amend が必要。
3. 各 `conflict` について、invalidated になる Forward gate（G1/G3/G4/G5）を特定し、
   R4 `--invalidate-forward` action 用に記録する。
4. 各 gap の `forward_routing` candidate（L1、L3、L4、L5、gap-only）を draft する。
   reverse.md §4 routing table を decision guide として使う。
5. PO review 用の draft `intent-hypotheses` document を作成する。

## PO verification（必須）

R3 は PO sign-off なしに exit できない。PO は次を review する。
- intent hypotheses は business context から見て妥当か。
- gap classifications（`confirmed` / `gap` / `conflict`）は PO の理解と一致するか。
- draft `forward_routing` selection は適切か。

次へ進む前に、PLAN `review_evidence` field と `.ut-tdd/audit/` に PO review evidence を記録する。

## 出力 artifact: intent-hypotheses

`.ut-tdd/reverse/<plan_id>/R3-intent-hypotheses.yaml` へ書く。

```yaml
plan_id: <PLAN-REVERSE-NN>
hypotheses:
  - id: <H-NN>
    subject: ""          # module, contract, or design element
    classification: <confirmed|gap|conflict>
    linked_forward_artifact: <PLAN-ID or FR-ID or null>
    conflict_gate: <G1|G3|G4|G5 or null>
    draft_routing: <L1|L3|L4|L5|gap-only>
    intent_summary: ""
po_reviewed: false        # set true after PO sign-off
po_review_evidence: ""    # path to evidence or inline note
r3_notes: ""
```

## R4 への gate

`workflow_phase` を `R4` へ進める前に確認する。

- [ ] R2 のすべての structural gaps に hypothesis entry がある。
- [ ] `po_reviewed: true` で、`po_review_evidence` が入力されている。
- [ ] conflict entries が invalidate 対象の specific Forward gate を示している。
- [ ] 各 hypothesis が valid enum（L1/L3/L4/L5/gap-only）の
      `draft_routing` value を持つ。
- [ ] PLAN `review_evidence` field が PO sign-off reference で更新されている。
- [ ] `workflow_phase: R4` の状態で `ut-tdd plan lint` が 0 で終了する。
- [ ] `ut-tdd doctor` exits 0.

PO verification なしで R3 を進めることは blocking violation である。
schema が enforcement する場合、`po_reviewed` field は `ut-tdd plan lint` により機械検査される。
