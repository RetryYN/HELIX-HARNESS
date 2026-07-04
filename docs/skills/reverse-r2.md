---
schema_version: skill.v1
name: reverse-r2
skill_type: drive-reverse
applies_to:
  layers:
    - L3
    - L4
    - L5
  drive_models:
    - Reverse
    - Retrofit
    - Recovery
---

# R2 as-is 設計

R2: As-Is Design は、observed evidence から current design、dependency graph、
impact model を再構成する phase である（FR-L1-14、reverse.md §2）。
tests が存在する場合は test-design reconstruction も含む（reverse.md §2.1）。

5 種類すべての reverse types が R2 を通る（skip なし）。

## この skill を読む条件

- `kind=reverse` PLAN が `workflow_phase: R2` を持つ。

## 入力

- `R0-evidence-map.yaml` (all types).
- `R1-observed-contracts.yaml`（code、upgrade、fullback types）を読む。
  design/normalization types では存在しない。
- evidence map に列挙された source files、existing design docs、ADRs、prior test files。

## 手順

1. module/component structure を再構成する。各 unit の名前、responsibility、
   dependencies を記録する。
2. 対象 scope の DAG（dependency graph）を作る。
   - nodes = modules / services / DB tables / event topics とする。
   - edges = imports、HTTP calls、DB reads/writes、event pub/sub とする。
3. change impact を評価する。各 node について、contract または behavior の変更で影響を受ける
   callers/dependents を明らかにする。
4. R0 の `has_existing_tests=true` の場合:
   - 各 test file を、それが覆う module に map する。
   - observable test-design を再構成する。covered scenarios、assertions、absent items を記録する。
   - `as-is-test-design` として書く。これは Forward routing destination の pair freeze gate に渡す starting material になる。
5. structural gaps を記録する。design doc の無い modules、test coverage の無い contracts、
   explicit interface definition の無い DAG edges など。

## 出力 artifacts

`.ut-tdd/reverse/<plan_id>/` へ書く。

**R2-as-is-design.md** -- human-readable な design reconstruction:
- responsibilities 付きの module list。
- DAG を text/mermaid form で記録する。
- impact assessment table（node -> affected callers）を記録する。
- structural gap list。

**R2-as-is-test-design.md**（`has_existing_tests=true` の場合のみ）:
- covered module と scenario summary を含む test file inventory。
- observed assertion patterns。
- existing tests 内の known coverage gaps。

## R3 への gate

`workflow_phase` を `R3` へ進める前に確認する。

- [ ] `R2-as-is-design.md` が存在し、DAG が navigable（orphaned nodes なし）。
- [ ] `has_existing_tests=true` の場合、`R2-as-is-test-design.md` が存在し、
      すべての test file が少なくとも 1 つの module node に map されている。
- [ ] `has_existing_tests=false` の場合、test absence を確認する note が
      `R2-as-is-design.md` に記録されている（R4 の `missing_pair_artifacts` に渡す）。
- [ ] structural gaps が列挙されている
      （ここでは解決しない。解決は R3/R4）。
- [ ] `workflow_phase: R3` の状態で `ut-tdd plan lint` が 0 で終了する。
- [ ] `ut-tdd vmodel lint` が 0 で終了する
      （reconstruction work 由来の new orphan artifacts が無い）。
- [ ] `ut-tdd doctor` exits 0.

DAG と impact assessment は、R3 hypothesis work に十分な完全性を持つ必要がある。
known dependencies を落とした incomplete DAG は blocking gap である。
