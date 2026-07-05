---
schema_version: skill.v1
name: reverse-r1
skill_type: drive-reverse
applies_to:
  layers:
    - L3
    - L4
    - L5
  drive_models:
    - Reverse
    - Retrofit
---

# R1 観測 contract

R1: Observed Contracts は、対象 scope から observable な API、DB、type、
compatibility contracts を抽出し、文書化する phase である
（FR-L1-14、reverse.md §2）。

R1 は reverse types `code`、`upgrade`、`fullback` に適用する。
`design` と `normalization` type では SKIP し、R0 から R2 へ直接進む。

## この skill を読む条件

- `kind=reverse` PLAN が `workflow_phase: R1` を持つ。
- `reverse_type` が `code`、`upgrade`、`fullback` のいずれか。

## 入力

- 完了済み R0 phase の `R0-evidence-map.yaml`。
- contract surface を示す source files、type definitions、OpenAPI/schema files、
DB migration files、integration test fixtures を読む。

## 手順

1. scope 内の external-facing interface（HTTP endpoints、exported functions、
   DB tables、event schemas）ごとに、observable contract を抽出する。
   - Input types と validation rules。
   - Output types と error codes。
- Side effects（DB writes、event publishes、file mutations）を記録する。
2. compatibility constraints を特定する。現在の contract shape に依存する callers と、
   変更時に壊れる箇所を明らかにする。
3. implicit contracts（callers からだけ推定でき、explicit schema が無いもの）を記録する。
   これは R3 の高優先 gap 候補になる。
4. `R0-evidence-map.yaml` の drift signals と照合し、observed contracts が既存 design docs と
   一致するか conflict するか確認する。

## 出力 artifact: observed-contracts

`.helix/reverse/<plan_id>/R1-observed-contracts.yaml` へ書く。

```yaml
plan_id: <PLAN-REVERSE-NN>
contracts:
  - id: <unique short id>
    surface: <http|db|event|type|function>
    description: ""
    input_types: []
    output_types: []
    callers: []          # known dependents
    schema_source: <path or null>
    implicit: <true|false>
    drift_vs_design: ""  # blank if no design doc exists
implicit_contract_count: 0
r1_notes: ""
```

## R2 への gate

`workflow_phase` を `R2` へ進める前に確認する。

- [ ] R0 で特定したすべての external surface に contract entry がある。
- [ ] `implicit_contract_count` が正確で、implicit contracts が flagged されている
      （R3 の gap candidates になる）。
- [ ] contract extraction のために declared scope 外の files を読んだ場合、
      その scope expansion を `r1_notes` に記録している。
- [ ] `workflow_phase: R2` の状態で `helix plan lint` が 0 で終了する。
- [ ] `helix doctor` exits 0.

in-scope surfaces の contract extraction が incomplete な場合、R2 に進まない。
