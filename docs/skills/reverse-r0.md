---
schema_version: skill.v1
name: reverse-r0
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

# R0 証跡取得

R0: Evidence Acquisition は、すべての Reverse cycle の最初の phase である
（FR-L1-14、reverse.md §2）。R0 は 5 種類すべての reverse type で必須。
出力は evidence map であり、R1 へ進むための gate になる
（R1 を skip する type では R2 への gate）。

## この skill を読む条件

- `kind=reverse` の PLAN を作成済みで、`helix plan lint` が green。
- PLAN frontmatter の現在 `workflow_phase` が R0。

## 入力

- 対象 scope 配下の既存 source files、configuration、migration snapshots
  （read-only。vendor snapshots は reference only として扱う）。
- 未解決 blocking state が無いことを示す `helix status` output。
- 既存 governance violation を可視化する `helix doctor` output
  （記録だけ行う。R0 中に修正しない。修正は R4 の責務）。

## 手順

1. 対象 scope 内の artifact をすべて列挙する。source files、design docs、
   test files、schema files、dependency manifests を含める。
2. 各 artifact について、場所、概算の last-modified signal（git log）、
   Forward-anchored PLAN trace の有無を記録する。
3. `has_existing_tests` flag を設定する。
   - 対象 scope を覆う test files がある場合は `true`。
   - test files が無い、または対象 coverage が zero の場合は `false`。
4. 対象に関連する test files を inventory し、path を列挙する。
5. 観測した drift signals を記録する。schema mismatch、orphaned design docs、
   broken import paths、untraced implementation files など。
6. 対象 scope が inter-module contracts を含む場合は、`helix graph` または
   `helix find` で dependency edges を特定する。

## 出力 artifact: evidence map

`.helix/reverse/<plan_id>/R0-evidence-map.yaml` へ書く。

```yaml
plan_id: <PLAN-REVERSE-NN>
reverse_type: <code|design|upgrade|normalization|fullback>
has_existing_tests: <true|false>
test_files: []          # list paths; empty if has_existing_tests=false
artifacts:
  - path: <relative path>
    kind: <source|design|test|schema|config>
    forward_trace: <PLAN-ID or null>
drift_signals: []       # describe each observed divergence
r0_notes: ""
```

## R1 への gate（または R2）

PLAN の `workflow_phase` を `R0` から `R1` へ進める前に確認する。
R1 を skip する type では `R2` へ進める前に確認する。

- [ ] `R0-evidence-map.yaml` が存在し、意図したもの以外に null fields が無い。
- [ ] `has_existing_tests` が省略されず明示されている。
- [ ] すべての drift signals が列挙されている
      （未解決でも記録する。解決は R3/R4）。
- [ ] PLAN を `workflow_phase: R1` に更新した状態で `helix plan lint` が 0 で終了する
      （design/normalization type では `R2`）。
- [ ] `helix doctor` が 0 で終了する
      （R0 edits による新規 violation が無い）。

すべての check が pass した後だけ PLAN `workflow_phase` を進める。
incomplete evidence map のまま R1 または R2 に進まない。
