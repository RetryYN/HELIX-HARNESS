---
schema_version: skill.v1
name: debt-register
skill_type: process
applies_to:
  layers:
    - L4
    - L5
    - L6
    - L7
  drive_models:
    - Forward
    - Add-feature
    - Refactor
    - Retrofit
    - Recovery
---

# debt 台帳

HELIX における technical debt の記録、追跡、discharge 方法を扱う
（FR-L1-11 technical-debt ledger）。debt entries は PLAN records と
`.helix/` referenced documents であり、`helix debt` command ではない。
debt visibility は `helix doctor` が provisional decisions と missing Reverse back-fills の
governance gate checks を通じて surface する。

## この skill を読む条件

- implementation 中に V-model layer を弱める shortcut または deferral を受け入れた
  （missing design doc、`@ts-ignore`、skipped test、PLAN link の無い `// TODO`）。
- provisional architectural decision が TTL（time-to-live）を超過した。
- `helix doctor` が、unresolved debt entry を `dependencies` で参照する
  `kind: retrofit` または `kind: refactor` の PLAN を surface する。
- Recovery cycle が troubleshoot PLAN 作成前に accumulated debt を enumerate する必要がある。

## Debt entry anatomy（debt entry の構造）

debt entry は `kind: refactor` または `kind: retrofit` の PLAN file、
または existing PLAN の `debt_items` field 内 inline marker である。どちらも次を持つ必要がある。

```yaml
# 専用 PLAN file に記録する（standalone debt では推奨）:
kind: refactor          # または: retrofit
layer: L6               # debt が存在する layer
drive: Refactor
status: draft           # becomes active when work is scheduled
debt_reason: >
  auth-middleware の L6 design doc は時間制約で省略された
  (2026-06-10 pair-freeze)。Reverse back-fill が必要。
ttl: "2026-08-01"       # provisional decision の期限。超過時は doctor が flag する
review_evidence: []
```

```yaml
# 親 PLAN の debt_items list に inline で記録する（軽量だが standalone ではない）:
debt_items:
  - id: DEBT-L7-03
    description: "projection edge case の unit test を延期した（time-box 未設定）"
    ttl: "2026-07-15"
    discharge_plan: PLAN-L7-NN
```

`helix doctor` は、`discharge_plan` ID を参照する PLAN が existing file へ resolve できること、
および `ttl` が `done` status なしに過ぎていないことを確認する。

## Provisional decision TTL discipline（TTL 規律）

design または implementation decision を provisional とする場合:

1. `ttl` は concrete date にする（"soon" や "next sprint" ではない）。
2. decision が final になる条件を記録する
   （例: "FR-L1-38 telemetry data で latency 50 ms 未満を確認できたら confirmed"）。
3. date が過ぎると、`helix doctor` は PLAN を `overdue-provisional` として flag する。
4. overdue provisionals は discharge する
   （Refactor/Retrofit PLAN を `done` へ進める）か、`review_evidence` に rationale を記録して TTL を延長する。

TTL を silent extend しない。必ず reason を記録する。

## Debt 可視化と解消 workflow

```
helix doctor               # 期限切れ provisional と未 link debt を可視化する
helix status               # active/draft の debt 関連 PLAN を表示する
helix plan lint            # debt PLAN frontmatter と TTL field を検証する
helix review --uncommitted # accept 前に discharge の実体を確認する
helix vmodel lint          # 解消した debt が V-model links を復元したことを確認する
```

standalone debt PLAN の discharge steps:

```
## §工程表 (Refactor or Retrofit drive)
1. [直列] V-model gap を特定する: どの layer doc または test が欠落/破損しているか
2. [直列] 欠落 artifact（design doc / test design）を作成または修復する
3. [並列] `debt_reason` の範囲に限定して `src/` の fix を実装する
4. [並列] `bun run typecheck && bun run lint && bun run test` を green にする
5. [直列] `helix doctor` で新規 governance failure が無いことを確認する
6. [直列] `helix review --uncommitted` で debt PLAN `review_evidence` を埋める
7. [直列] `status: done` にし、session boundary なら `helix status` で continuation projection を確認する
```

## implicit のままにしてはいけない debt

次の implicit debt は governance violations であり、`helix doctor` または `helix plan lint` が捕捉する。

- `dependencies` に Reverse back-fill PLAN を持たない `add-impl` PLAN。
- same file 内に PLAN-linked rationale が無い `@ts-ignore` または `// biome-ignore` comment
  （`bun run lint` で検出可能）。
- PLAN `generates` field に列挙された design doc path が disk 上に存在しない。
- `review_evidence: []` のままの `trace-freeze` PLAN。

## Anti-patterns（避けるパターン）

- `// TODO: fix later` comment を registered debt item として扱う。
  TTL も owner も無く、`helix doctor` から不可視。
- debt PLAN を作成したが creditor PLAN の `dependencies` に link しない。
  discharge が governance から不可視になる。
- doctor warnings を抑えるために `ttl` を何年も先の日付にする。
  finality condition を記載しなければならない。条件なしの far TTL は review の red flag。
- debt discharge（V-model completeness の復元）と feature work を混同する。
  Refactor PLAN は new FR-driven functionality を追加してはならない。その場合は別の `add-impl` PLAN を作る。
