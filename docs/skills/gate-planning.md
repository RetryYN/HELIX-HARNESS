---
schema_version: skill.v1
name: gate-planning
skill_type: process
applies_to:
  layers:
    - L1
    - L3
    - L4
    - L5
    - L6
    - L7
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Scrum
    - Discovery
---

# gate planning（gate 計画）

UT-TDD で Definition-of-Done (DoD) gate を作成し、強制する方法を扱う
（FR-L1-05 deterministic static gate、FR-L1-13 Forward workflow）を扱う。
gate は skippable checklist ではなく machine-checked boundary である。
強制されない gate は false-green state を蓄積し、V-model descent gap を隠す。

## この skill を読む条件

- PLAN または layer transition の acceptance condition を設計する。
- `ut-tdd doctor` failure が、machine-checked されていない condition を露出する。
- Scrum S3 verify step で、S4 decide 前の明示 DoD が必要。
- pair-freeze / trace-freeze / accept gate を越えようとしている。

## UT-TDD の Definition-of-Done（DoD）

unit of work は、次のすべてを満たす場合だけ complete である:

1. `bun run typecheck`、`bun run lint`（Biome check）、`bun run test`（Vitest）が green。
2. `ut-tdd doctor` が 0 で終了する（governance violation なし）。
3. `ut-tdd plan lint` が 0 で終了する（PLAN schema valid、dependencies exist、
   `§工程表` schedule section checked）。
4. `ut-tdd review --uncommitted` が layer に対する blocking findings を出さない。
5. layer の design doc が freeze readability check を pass する（Objective、Scope、mojibake なし）。
6. new terms が L0 glossary に追加されている。
7. task が session boundary を越える場合、handover evidence が `.ut-tdd/handover/` に書かれている。

"Code written" や "looks right" は DoD ではない。gate を clear するのは machine evidence と
recorded review findings だけである。

## Gate design rules（gate 設計 rule）

- **Falsifiable condition.** "Passes review" は falsifiable ではない。
  "`ut-tdd doctor` exits 0 and `bun run test` passes with no skipped tests" は falsifiable である。
- **Name the checking command.** すべての condition を `ut-tdd` / CI command、
  または明示的な human review action へ map する。
- **Record the result, not the intent.** evidence は `.ut-tdd/audit/` または PLAN `review_evidence`
  field に記録する。recorded evidence の無い gate は cleared ではない。
- **Split correctness from readability.** schema-valid（`ut-tdd plan lint`）と readable
  （manual / `ut-tdd review --uncommitted`）は別 check である。

## Layer gate の checklist

**pair-freeze (design → implement):** PLAN `status` が ready。design doc が正しい
`docs/design/` path に存在し、readability を pass する。`ut-tdd plan lint` と
`ut-tdd doctor` が 0 で終了する。unresolved `requires` dependency が無い。

**trace-freeze (implement → review):** PLAN-scoped source が committed。scope 内 skipped test なしで
Vitest が green。Biome check + typecheck が 0 で終了する。`ut-tdd doctor` が 0 で終了する。
`review_evidence` trace links が populated。

**accept (review → done):** `ut-tdd review --uncommitted` に blocking findings が無い。
trace-freeze conditions が HEAD で引き続き green。new ADR が `Accepted`。handover が updated または closed。

## Mode-aware review tier（mode 別 review tier）

`ut-tdd gate <id>` は `ut-tdd status` から execution mode を読む。
Judgement gates は hybrid mode では cross-agent review evidence を、single-runtime mode では
`intra_runtime_subagent` evidence を必要とする。self-review だけでは不可。

## Anti-patterns（enforcement を壊すパターン）

- `bun run test`（Vitest）の代わりに `bun test` を使う。native runner には sync-timeout flakiness があり、
  CI は Vitest を使う。
- `biome check` なしに `biome lint` だけを使う。format violation が蓄積し、次の push を壊す。
- `ut-tdd doctor` green を "design is correct" と扱う。doctor が検査するのは structural governance であり、
  design substance ではない。docs を読む。
- PLAN-linked rationale なしに `// biome-ignore`、`// @ts-ignore`、`.skip` で黙らせる。
