---
schema_version: skill.v1
name: dependency-map
skill_type: verification
applies_to:
  layers:
    - L3
    - L4
    - L5
    - L6
  drive_models:
    - Forward
    - Reverse
    - Add-feature
    - Refactor
---

# dependency map（依存関係 map）

module 横断の dependency 検出、PLAN dependency graph 分析、dependency drift を表面化する
`helix graph` / `helix doctor` surface（FR-L1-18 doctor cross-detection 集約）
を扱う。PLAN が module boundary、PLAN `requires` / `parent` field に触れる場合、または
`helix doctor` が dependency-governance violation を報告した場合に適用する。

## この skill を読む場面

- PLAN の `requires` または `parent` field が別 PLAN を参照しており、その関係を検証する必要がある。
- `helix doctor` が dependency-drift または orphan finding を出した。
- L4 design doc が新しい module dependency を導入し、pair-freeze 前に影響を map する必要がある。
- Refactor PLAN が external interface 不変を主張している。dependency map がその証跡になる。

## HELIX における dependency の種類

**PLAN structural dependencies (`requires`, `parent`, `parent_design`):**
PLAN YAML で表現され、`helix plan lint`（存在確認）と `helix doctor`
（plan-governance）で機械検査される。存在しない PLAN ID を参照する `requires` は
blocking lint error である。

**Artifact dependencies (`generates`, `placeholder_deps`):**
pair-freeze 時点で存在しない PLAN `generates` doc は governance violation である。
`placeholder_deps` は設計中の forward reference を許すが、trace-freeze 前に解決しなければならない。

**Source-level module dependencies（source level の module 依存）:**
`src/` sub-module をまたぐ TypeScript `import` path。`bun run typecheck` で検出され、
`helix graph`（module dependency view）で確認できる。

## mapping 手順

1. `helix graph` を実行し、影響を受ける module の current dependency view を取得する。
   cycle や cross-layer import があれば記録する。
2. `helix doctor` を実行し、full output を読む（`| tail` で省略しない）。
   dependency-governance finding は、壊れている具体的な PLAN または artifact を示す。
3. finding ごとに chain を追う。どの upstream PLAN がその artifact または module を所有しているか。
   dependency は `requires` に宣言されているか。
4. intended dependency graph と一致するように PLAN YAML（`requires` / `placeholder_deps`）または
   source import を更新し、両 command が exit 0 になるまで再実行する。

## L4 dependency contract（L4 依存 contract）

L4 design doc が新しい module dependency を導入する場合は、`## Dependencies` section を追加し、
各 dependency について次を列挙する。
- Dependency name（module path または PLAN ID）。
- Direction（この module が consumes / provides のどちらか）。
- Coupling strength（interface-only / implementation detail）を記録する。
- Change-risk note（この dependency が `stable` か `internal` か）。

この section は `helix review --uncommitted` 時に読まれ、hidden coupling が導入されていないことを確認する。

## Refactor gate の dependency-neutrality check

Refactor PLAN は、external dependency graph edge が変わっていないことを証明しなければならない。
pair-freeze 前に次を確認する。

- [ ] HEAD と base commit の両方で `helix graph` を実行し、external-facing module の edge が
      identical であることを確認する。
- [ ] `bun run typecheck` が exit 0 になる。新しい import error がない。
- [ ] `helix doctor` が exit 0 になる。新しい orphan や dependency-drift finding がない。
- [ ] `helix review --uncommitted` が新しい cross-module coupling finding を出さない。

## Anti-pattern（避けるパターン）

- 実際には別 PLAN の generated artifact を consume している PLAN に `requires: []` を宣言する。
  dependency は implicit に存在しているため、explicit にする。
- trace-freeze 後も `placeholder_deps` を使い続ける。すべての placeholder は解決が必要で、
  未解決のままでは PLAN は `accept` に到達できない。
- missing PLAN を作成せず、`requires` entry を削除して dependency-lint error を直す。
