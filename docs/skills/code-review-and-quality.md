---
schema_version: skill.v1
name: code-review-and-quality
skill_type: review
applies_to:
  layers:
    - L6
    - L7
    - L8
    - L9
    - L10
    - L11
    - L12
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Refactor
    - Retrofit
---

# code review and quality（コードレビューと品質）

W-gate のテスト観点品質確認と標準 code review を統合する複合レビュー手順を扱う。
FR-L1-21（cross-agent review 証跡）、FR-L1-03（descent obligations）、
FR-L1-18（cross-detection aggregation）の品質要件を満たすために使う。
PLAN が implementation layer（L7）と test design layer（L6/L8）をまたぐ場合、
または Retrofit / Refactor PLAN で品質が退行していないことを証明する必要がある場合に読む。

## この skill を読む条件

- PLAN が implementation（L7）と test design（L6/L8）を単一 scope で扱う。
- Retrofit PLAN が accept 前に quality bar を通過する必要がある。
- W-gate（W1-W10）の pair を close するために review evidence が必要である。
- `ut-tdd review --uncommitted` が test-design obligation gap を報告している。

## Quality bar 定義（W-gate 観点）

各 W-gate pair（design doc <-> test または verification artifact）は次を満たす必要がある。

| W-gate | Design side | Test side | Accept 条件 |
|--------|-------------|-----------|-----------------|
| W3 | L6 test-design doc | Vitest unit test file | L6 doc の全 test ID に対応する test assertion があり、理由のない `.skip` が無い |
| W5 | L5 basic design | L8 integration test design | `docs/test-design/` に L8 doc があり、test ID が L5 section を cross-reference している |
| W7 | L4 basic design | L9 system test design | L9 doc が存在し、acceptance criteria が testable である |
| W10 | L3 functional spec | Curated test suite entry | `.ut-tdd/` または `docs/test-design/` に curation record がある |

W-gate は coverage count だけでは close しない。test-design doc 本文を読み、
指定された scenario が実際に存在することを確認する。

## 複合レビュー手順

**Step 1 — Machine checks:**

```
bun run typecheck
bun run lint
bun run test
ut-tdd doctor
ut-tdd vmodel lint
ut-tdd review --uncommitted
```

次へ進む前に、すべて exit 0 で終わる必要がある。

**Step 2 — test substance 監査:**

scope 内の各 test file について次を確認する。
- 少なくとも 1 つの test が failure path を実行している（happy path だけではない）。
- L6 test-design doc の boundary value が明示的な fixture として存在する。
- mock scope が最小限である。integration path では full database mock ではなく、
  実体のある test double を使う（FR-L1-03 descent obligation）。

**Step 3 — layer obligation 確認:**

変更された各 module について、V-model sibling set が揃っていることを確認する。
- `docs/design/<layer>/<module>.md` が存在する。
- `docs/test-design/<layer>/<module>.md` が存在する。
- PLAN の `review_evidence` / `trace_links` field が両方を列挙している。

**Step 4 — Retrograde quality check（Refactor / Retrofit のみ）:**

`ut-tdd metrics` が使える場合は実行し、使えない場合は git diff で次を確認する。
- PLAN rationale なしに Vitest assertion count が減っていない。
- 既存 test-design doc section が削除されていない。
- Biome rule suppression が変更前の件数を超えて増えていない。

## Evidence record（証跡記録）

```
reviewer: <agent-slug or "intra_runtime_subagent">
gate: trace-freeze | accept
quality_dimension: W-gate-<N>
outcome: PASS | FAIL | CONDITIONAL
findings:
  machine_checks: <all-pass | failing-command>
  test_substance: <finding or "none">
  layer_obligations: <finding or "none">
  retrograde: <finding or "none" | "N/A for non-Refactor">
timestamp: <ISO-8601>
```

## Anti-patterns（避けるパターン）

- test file の存在だけを確認し、paired design doc の scenario を cover しているか確認せずに W-gate を close する。
- retrograde check なしに Refactor PLAN を accept する。refactor では test が静かに削除されやすい。
- `bun run lint` の代わりに `biome lint` だけを使う。format violation が蓄積し、次の CI push で fail する。
