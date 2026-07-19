# 下流成果物canonical再利用authority（2026-07-19）

- status: current-authority
- canonical V-model: L1-L12
- runtime: Python semantic core + TypeScript/Node transactional boundary

## 再利用規則

旧pair、旧G13/G14、Bun target、Python proposal-onlyをoracleとして持つdesign、test-design、PLANは、その本文を現行判断へ直接使用しない。旧IDと実行証跡はcompatibility evidenceとして保持し、次のcanonical deltaを満たした新revisionだけを再利用できる。

| 旧判断 | canonical delta |
|---|---|
| L1↔L14 | L1↔L12 |
| L2↔L10 | L2↔L11 |
| L3↔L12 | L3↔L10 |
| G13/G14 | G12 evidence component |
| TypeScript/Bun target | Python semantic core + TypeScript/Node transactional boundary |
| Python proposal-only semantic runtime | Python semantic core。第三者workerのproposal-only境界とは分離 |

`CANONICAL_REUSE_BLOCKED_PATHS`にある成果物は、個別delta revision、対応oracle、独立review evidence、digest更新が揃うまでL4降下、L10検証、実装PLAN生成の入力にしてはならない。単なるstatus=confirmed/completed、旧テストgreen、marker追記だけでは解除しない。

## confirmed/active PLAN authority delta

次のPLANは旧本文を改変せず、未完了ACをcanonical pairへ再traceする後継deltaを要求する。

- `docs/plans/PLAN-L3-00-master.md`
- `docs/plans/PLAN-L4-05-workflow-orchestration.md`
- `docs/plans/PLAN-L3-13-vmodel-docgen-fit.md`
- `docs/plans/PLAN-L7-421-design-coverage-catalog.md`
- `docs/plans/PLAN-L1-04-technical-requirements.md`

この5件は本authorityにより現在の再利用をfail-closeする。後継deltaがlandするまで実行再開しない。
