---
schema_version: skill.v1
name: code-review
skill_type: review
applies_to:
  layers:
    - L5
    - L6
    - L7
    - L8
    - L10
    - L12
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Recovery
    - Refactor
---

# code review（コードレビュー）

trace-freeze と accept gate における HELIX implementation artifacts の five-axis review procedure
（FR-L1-13 Forward workflow、FR-L1-21 review evidence）。`ut-tdd review --uncommitted` が entry point
である場合、または PLAN の accept gate が recorded review findings を要求する場合に適用する。

## この skill を読む条件

- Forward または Add-feature PLAN の trace-freeze gate に入る。
- Recovery または Refactor PLAN で、変更が new defects を導入していない evidence が必要。
- `ut-tdd claude --role code-reviewer` 経由で code-reviewer subagent を dispatch する。

## Pre-review checklist（事前チェック）

file を開く前に次を実行する:

```
bun run typecheck
bun run lint
bun run test
ut-tdd doctor
ut-tdd review --uncommitted
```

すべて 0 で終了しなければならない。いずれかが fail した場合は、先に author へ failure を surface する。
broken code を review すると、build errors と review findings が混ざる。

## Five review axes（5 つの review 軸）

### Axis 1 — Correctness vs. design intent（設計意図との整合）

review scope の L5/L6 design doc を読む。各 public function / module を documented contract に対して検証する。
design doc からの deviation は judgement call ではなく defect である。

### Axis 2 — Test coverage substance（test coverage の実質）

Vitest tests が code paths を通すだけでなく、specified behaviour を assert していることを確認する。
L6 test-design doc の boundary conditions は存在するか。
gate-relevant path ごとに pass/fail fixture pair があるか。skipped tests を数え、各 skipped test に
PLAN-linked rationale があることを確認する。

### Axis 3 — Trace completeness（trace 完全性）

PLAN `review_evidence` に cited されたすべての FR が design doc section または test file に trace することを確認する。
downstream artifact の無い FR ID は completed work ではなく open obligation である。

### Axis 4 — V-model layer obligations（V-model layer の責務）

expected sibling artifacts が存在することを確認する:
- L7 implementation -> L6 test-design doc が `docs/test-design/` に存在する。
- L8 integration test design -> matching L5 basic design doc が存在する。
- code で使う new term -> L0 glossary entry が存在する。

### Axis 5 — Operational hygiene（運用衛生）

- unexplained `// biome-ignore`、`// @ts-ignore`、suppression comments が無い。
- hardcoded paths、secrets、credentials が無い。
- PLAN-linked `TODO` なしに technical debt として残された dead code が無い。
- scope 内 commit に Conventional Commits message がある。

## Recording review findings（review findings の記録）

PLAN `review_evidence` field に次を記録する:

```
reviewer: <agent-slug or "intra_runtime_subagent">
gate: trace-freeze | accept
outcome: PASS | FAIL | CONDITIONAL
axis_findings:
  correctness: <finding or "none">
  coverage: <finding or "none">
  trace: <finding or "none">
  layer_obligations: <finding or "none">
  hygiene: <finding or "none">
timestamp: <ISO-8601>
```

CONDITIONAL outcome は follow-up PLAN reference を含めなければならない。無い場合、gate は FAIL と扱う。

## Dispatch pattern（dispatch 手順）

hybrid mode では separate subagent family へ dispatch する:

```
ut-tdd claude --role code-reviewer --task "review PLAN-<id> at trace-freeze" --execute
```

single-runtime mode では reviewer identity として `intra_runtime_subagent` を記録し、
上記 five-axis procedure を full に実施する。
